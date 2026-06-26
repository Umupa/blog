#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const booksDir = path.join(rootDir, 'src/content/books');
const localWereadBin = path.join(rootDir, 'node_modules/.bin/weread');

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const existing = loadExistingBooks();
const results = {
  created: [],
  skippedExisting: [],
  skippedUnfinished: [],
  warnings: [],
};

try {
  mkdirSync(booksDir, { recursive: true });

  const shelfPayload = runWereadJson(['--json', 'shelf', 'list', '--all']);
  const shelfData = unwrapData(shelfPayload);
  const selectedBookIds = new Set(options.bookIds);
  const selectedTitles = new Set(options.titles.map(normalizeTitle));
  const hasSelection = selectedBookIds.size > 0 || selectedTitles.size > 0;
  const allShelfBooks = asArray(shelfData.books)
    .filter((book) => book && typeof book === 'object' && book.bookId);
  const shelfBooks = allShelfBooks
    .filter((book) => {
      if (!hasSelection) return true;
      const bookId = String(book.bookId);
      const title = stringValue(book.title);
      return selectedBookIds.has(bookId) || selectedTitles.has(normalizeTitle(title));
    })
    .slice(0, options.limit ?? undefined);

  if (hasSelection) {
    warnMissingSelections(allShelfBooks, selectedBookIds, selectedTitles);
  }

  for (const shelfBook of shelfBooks) {
    const bookId = String(shelfBook.bookId);
    const title = stringValue(shelfBook.title) || bookId;
    const titleKey = normalizeTitle(title);
    const existingMatch = existing.byBookId.get(bookId) ?? existing.byTitle.get(titleKey);

    if (existingMatch && !options.overwrite) {
      results.skippedExisting.push(title);
      continue;
    }

    const progressPayload = safeWereadJson(
      ['--json', 'book', 'progress', bookId],
      `读取《${title}》进度失败`
    );
    const progressData = progressPayload ? unwrapData(progressPayload) : {};
    const progressBook = progressData.book ?? progressData;
    const finishTime = firstTimestamp(
      progressBook.finishTime,
      shelfBook.finishReadingTime,
      shelfBook.finishTime
    );
    const finished =
      Number(shelfBook.finishReading) === 1 ||
      Number(progressBook.progress) >= 100 ||
      finishTime !== undefined;

    if (!finished && !options.includeUnfinished) {
      results.skippedUnfinished.push(title);
      continue;
    }

    if (!finished && options.includeUnfinished) {
      results.warnings.push(`《${title}》未被微信读书标记为已读完，已按 --include-unfinished 导入。`);
    }

    const infoPayload = safeWereadJson(
      ['--json', 'book', 'info', bookId],
      `读取《${title}》详情失败`
    );
    const bookInfo = normalizeBookInfo(infoPayload ? unwrapData(infoPayload) : {});
    const chapters = options.notes === 'none'
      ? undefined
      : safeWereadJson(
        ['--json', 'book', 'chapters', bookId],
        `读取《${title}》章节失败`
      );
    const notes = options.notes === 'none'
      ? undefined
      : safeWereadJson(
        ['notes', 'export', bookId, '--format', 'json', '--all'],
        `导出《${title}》笔记失败`
      );

    const book = {
      bookId,
      title: stringValue(bookInfo.title) || title,
      author: stringValue(bookInfo.author) || stringValue(shelfBook.author) || '未知作者',
      cover: stringValue(bookInfo.cover) || stringValue(shelfBook.cover) || '/favicon.svg',
      date: formatDate(firstTimestamp(finishTime, shelfBook.readUpdateTime, shelfBook.updateTime, Date.now())),
      chapters: chapters ? unwrapData(chapters) : undefined,
      notes: notes ? unwrapData(notes) : undefined,
    };

    if (book.cover === '/favicon.svg') {
      results.warnings.push(`《${book.title}》没有拿到封面，已使用 /favicon.svg 占位。`);
    }

    const refreshedMatch = existing.byBookId.get(bookId) ?? existing.byTitle.get(normalizeTitle(book.title));
    const slug = options.overwrite && refreshedMatch
      ? refreshedMatch.slug
      : uniqueSlug(slugify(book.title, bookId), existing.slugs);
    const filePath = path.join(booksDir, `${slug}.md`);
    const content = buildBookMarkdown(book, options.notes);

    results.created.push({
      title: book.title,
      filePath,
      content,
    });

    existing.bookIds.add(bookId);
    existing.titles.add(normalizeTitle(book.title));
    existing.slugs.add(slug);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (options.write) {
  for (const item of results.created) {
    writeFileSync(item.filePath, item.content, 'utf8');
  }
}

printSummary(results, options);

function parseArgs(args) {
  const parsed = {
    write: false,
    help: false,
    limit: undefined,
    notes: 'ideas',
    bookIds: [],
    titles: [],
    includeUnfinished: false,
    overwrite: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--write') {
      parsed.write = true;
      continue;
    }

    if (arg === '--overwrite') {
      parsed.overwrite = true;
      continue;
    }

    if (arg === '--include-unfinished') {
      parsed.includeUnfinished = true;
      continue;
    }

    if (arg === '--limit') {
      parsed.limit = parsePositiveInt(args[index + 1], '--limit');
      index += 1;
      continue;
    }

    if (arg.startsWith('--limit=')) {
      parsed.limit = parsePositiveInt(arg.slice('--limit='.length), '--limit');
      continue;
    }

    if (arg === '--book-id') {
      parsed.bookIds.push(...parseListValue(args[index + 1], '--book-id'));
      index += 1;
      continue;
    }

    if (arg.startsWith('--book-id=')) {
      parsed.bookIds.push(...parseListValue(arg.slice('--book-id='.length), '--book-id'));
      continue;
    }

    if (arg === '--title') {
      parsed.titles.push(...parseListValue(args[index + 1], '--title'));
      index += 1;
      continue;
    }

    if (arg.startsWith('--title=')) {
      parsed.titles.push(...parseListValue(arg.slice('--title='.length), '--title'));
      continue;
    }

    if (arg === '--notes') {
      parsed.notes = parseNotesMode(args[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith('--notes=')) {
      parsed.notes = parseNotesMode(arg.slice('--notes='.length));
      continue;
    }

    throw new Error(`未知参数：${arg}`);
  }

  return parsed;
}

function parsePositiveInt(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${name} 需要是正整数`);
  }
  return number;
}

function parseListValue(value, name) {
  if (!value) throw new Error(`${name} 需要一个值`);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNotesMode(value) {
  if (!['none', 'ideas', 'all'].includes(value)) {
    throw new Error('--notes 只能是 none、ideas 或 all');
  }
  return value;
}

function printHelp() {
  console.log(`Usage: pnpm import:weread [options]

Options:
  --write             写入 src/content/books；默认只预览
  --overwrite         覆盖已存在的同一本书；默认跳过
  --limit <n>         只检查书架前 n 本，便于试跑
  --book-id <id>      只导入指定书籍 ID；可重复，逗号分隔也可以
  --title <title>     只导入指定书名；可重复，逗号分隔也可以
  --include-unfinished
                      允许导入未被微信读书标记为已读完的书
  --notes <mode>      none | ideas | all，默认 ideas
  -h, --help          显示帮助

Examples:
  WEREAD_API_KEY="wrk-..." pnpm import:weread
  WEREAD_API_KEY="wrk-..." pnpm import:weread --write
  WEREAD_API_KEY="wrk-..." pnpm import:weread --write --overwrite
  WEREAD_API_KEY="wrk-..." pnpm import:weread --write --book-id 25242032 --notes=all
  WEREAD_API_KEY="wrk-..." pnpm import:weread --write --notes=all
`);
}

function runWereadJson(args) {
  const command = existsSync(localWereadBin) ? localWereadBin : 'weread';
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env: process.env,
    encoding: 'utf8',
  });

  if (result.error) {
    throw new Error(`无法执行 weread：${result.error.message}`);
  }

  if (result.status !== 0) {
    const details = result.stdout.trim() || result.stderr.trim();
    throw new Error(formatCliError(details));
  }

  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`weread 输出不是 JSON：\n${result.stdout}`);
  }
}

function safeWereadJson(args, warningPrefix) {
  try {
    return runWereadJson(args);
  } catch (error) {
    results.warnings.push(`${warningPrefix}：${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

function formatCliError(raw) {
  try {
    const parsed = JSON.parse(raw);
    const message = parsed.error?.message ?? raw;
    if (message.includes('WEREAD_API_KEY') || message.includes('API key') || message.includes('config set-key')) {
      return `${message}\n\n先到 https://weread.qq.com/r/weread-skills 获取 API Key，然后任选一种方式：\n1. 临时执行：WEREAD_API_KEY="wrk-..." pnpm import:weread\n2. 本机保存：pnpm exec weread config set-key "wrk-..."`;
    }
    return message;
  } catch {
    return raw;
  }
}

function unwrapData(payload) {
  if (!payload || typeof payload !== 'object') return {};
  return payload.data?.data ?? payload.data ?? payload;
}

function normalizeBookInfo(data) {
  const book = data.book ?? data;
  return {
    title: book.title,
    author: book.author,
    cover: book.cover || book.coverBoxInfo?.customColorCover || book.coverBoxInfo?.customPicCover,
  };
}

function warnMissingSelections(allShelfBooks, selectedBookIds, selectedTitles) {
  const seenBookIds = new Set(allShelfBooks.map((book) => String(book.bookId)));
  const seenTitles = new Set(allShelfBooks.map((book) => normalizeTitle(stringValue(book.title))));

  for (const bookId of selectedBookIds) {
    if (!seenBookIds.has(bookId)) {
      results.warnings.push(`书架里没有找到 bookId=${bookId}。`);
    }
  }

  for (const title of selectedTitles) {
    if (!seenTitles.has(title)) {
      results.warnings.push(`书架里没有找到书名：${title}。`);
    }
  }
}

function buildBookMarkdown(book, notesMode) {
  const lines = [
    '---',
    `title: ${yamlString(book.title)}`,
    `author: ${yamlString(book.author)}`,
    `cover: ${yamlString(book.cover)}`,
    `date: ${book.date}`,
    'status: finished',
    `wereadBookId: ${yamlString(book.bookId)}`,
    'source: "weread"',
    '---',
    '',
    '# 读后感',
    '',
    '> 从微信读书导入。读后感待补充。',
    '',
  ];

  const chapterOrder = createChapterOrder(book.chapters);
  const ideas = sortReadingItems(asArray(book.notes?.ideas)
    .map((idea) => ({
      chapterUid: idea.chapterUid,
      chapterTitle: stringValue(idea.chapterTitle),
      content: stringValue(idea.content).trim(),
      createTime: idea.createTime,
    }))
    .filter((idea) => idea.content), chapterOrder);

  const highlights = notesMode === 'all'
    ? sortReadingItems(asArray(book.notes?.highlights)
      .map((highlight) => ({
        chapterUid: highlight.chapterUid,
        chapterTitle: stringValue(highlight.chapterTitle),
        text: stringValue(highlight.text).trim(),
        createTime: highlight.createTime,
      }))
      .filter((highlight) => highlight.text), chapterOrder)
    : [];

  if (ideas.length) {
    lines.push('## 我的想法', '');
    for (const idea of ideas) {
      if (idea.chapterTitle) lines.push(`### ${idea.chapterTitle}`, '');
      lines.push(idea.content, '');
    }
  }

  if (highlights.length) {
    lines.push('## 划线', '');
    for (const highlight of highlights) {
      if (highlight.chapterTitle) lines.push(`### ${highlight.chapterTitle}`, '');
      lines.push(blockquote(highlight.text), '');
    }
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function createChapterOrder(chaptersData) {
  const order = new Map();
  for (const chapter of asArray(chaptersData?.chapters)) {
    const chapterUid = chapter?.chapterUid;
    const chapterIdx = Number(chapter?.chapterIdx);
    if (chapterUid !== undefined && Number.isFinite(chapterIdx)) {
      order.set(String(chapterUid), chapterIdx);
    }
  }
  return order;
}

function sortReadingItems(items, chapterOrder) {
  return items.slice().sort((a, b) => {
    const chapterDiff = chapterIndex(a, chapterOrder) - chapterIndex(b, chapterOrder);
    if (chapterDiff !== 0) return chapterDiff;

    const timeDiff = Number(a.createTime ?? 0) - Number(b.createTime ?? 0);
    if (timeDiff !== 0) return timeDiff;

    return String(a.chapterTitle).localeCompare(String(b.chapterTitle), 'zh-Hans');
  });
}

function chapterIndex(item, chapterOrder) {
  if (item.chapterUid !== undefined) {
    const ordered = chapterOrder.get(String(item.chapterUid));
    if (ordered !== undefined) return ordered;

    const uid = Number(item.chapterUid);
    if (Number.isFinite(uid)) return uid;
  }
  return Number.MAX_SAFE_INTEGER;
}

function loadExistingBooks() {
  const bookIds = new Set();
  const titles = new Set();
  const slugs = new Set();
  const byBookId = new Map();
  const byTitle = new Map();

  if (!existsSync(booksDir)) {
    return { bookIds, titles, slugs, byBookId, byTitle };
  }

  for (const fileName of readdirSync(booksDir)) {
    if (!fileName.endsWith('.md')) continue;

    const slug = fileName.replace(/\.md$/, '');
    const filePath = path.join(booksDir, fileName);
    const frontmatter = readFrontmatter(readFileSync(filePath, 'utf8'));
    const title = frontmatterValue(frontmatter, 'title');
    const bookId = frontmatterValue(frontmatter, 'wereadBookId');
    const item = { slug, filePath };

    slugs.add(slug);
    if (title) {
      const titleKey = normalizeTitle(title);
      titles.add(titleKey);
      byTitle.set(titleKey, item);
    }
    if (bookId) {
      bookIds.add(bookId);
      byBookId.set(bookId, item);
    }
  }

  return { bookIds, titles, slugs, byBookId, byTitle };
}

function readFrontmatter(content) {
  const match = content.match(/^\s*---\s*\n([\s\S]*?)\n---/);
  return match?.[1] ?? '';
}

function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return '';
  const raw = match[1].trim();

  if (raw.startsWith('"') && raw.endsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }

  return raw.replace(/^'|'$/g, '');
}

function uniqueSlug(base, usedSlugs) {
  let slug = base;
  let count = 2;

  while (usedSlugs.has(slug) || existsSync(path.join(booksDir, `${slug}.md`))) {
    slug = `${base}-${count}`;
    count += 1;
  }

  return slug;
}

function slugify(title, bookId) {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `weread-${bookId}`;
}

function normalizeTitle(title) {
  return String(title).trim().replace(/\s+/g, '').toLowerCase();
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ''));
}

function blockquote(text) {
  return String(text)
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join('\n');
}

function firstTimestamp(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return undefined;
}

function formatDate(timestamp) {
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function printSummary(summary, opts) {
  const action = opts.write ? '已写入' : '预览';
  console.log(`${action} ${summary.created.length} 本已读书。`);

  if (summary.created.length) {
    for (const item of summary.created) {
      console.log(`- ${item.title} -> ${path.relative(rootDir, item.filePath)}`);
    }
  }

  if (!opts.write && summary.created.length) {
    console.log('\n当前是 dry-run。确认无误后执行：pnpm import:weread --write');
  }

  if (summary.skippedExisting.length) {
    console.log(`\n已跳过博客中已有的 ${summary.skippedExisting.length} 本。`);
  }

  if (summary.skippedUnfinished.length) {
    console.log(`已跳过未读完的 ${summary.skippedUnfinished.length} 本。`);
  }

  if (summary.warnings.length) {
    console.log('\n警告：');
    for (const warning of summary.warnings) {
      console.log(`- ${warning}`);
    }
  }
}
