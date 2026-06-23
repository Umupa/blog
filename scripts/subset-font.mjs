import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const sourceFont = path.join(root, 'fonts-src', 'TsangerJinKai02-W04.woff2');
const outputFont = path.join(root, 'public', 'fonts', 'TsangerJinKai02-W04-subset.woff2');
const scanRoots = ['src', 'posts'];
const textExtensions = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.qmd',
  '.ts',
]);

const safelist = [
  'Umupa',
  "Umupa's blog",
  'Blog Books About',
  '已读 在读 待读 分类 Categories 读书笔记',
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ' ~!@#$%^&*()_+-=[]{}|;:\'",.<>/?`',
  '，。！？、；：“”‘’（）《》〈〉【】—…·￥',
].join('\n');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.astro') {
        continue;
      }
      walk(fullPath, files);
      continue;
    }

    if (textExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectText() {
  const files = scanRoots.flatMap((scanRoot) => walk(path.join(root, scanRoot)));
  const chunks = [safelist];

  for (const file of files) {
    chunks.push(fs.readFileSync(file, 'utf8'));
  }

  const text = chunks.join('\n');
  const chars = Array.from(new Set([...text].filter((char) => {
    const codePoint = char.codePointAt(0);
    return codePoint === 0x0a || codePoint >= 0x20;
  })));

  chars.sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
  return chars.join('');
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function runSubsetter(textFile) {
  const pyftsubsetArgs = [
    sourceFont,
    `--text-file=${textFile}`,
    `--output-file=${outputFont}`,
    '--flavor=woff2',
    '--layout-features=*',
    '--no-hinting',
  ];

  const direct = spawnSync('pyftsubset', pyftsubsetArgs, { stdio: 'inherit' });
  if (direct.status === 0) {
    return;
  }

  if (direct.error && direct.error.code !== 'ENOENT') {
    throw direct.error;
  }

  const env = {
    ...process.env,
    UV_CACHE_DIR: process.env.UV_CACHE_DIR || path.join(os.tmpdir(), 'uv-cache'),
    UV_TOOL_DIR: process.env.UV_TOOL_DIR || path.join(os.tmpdir(), 'uv-tools'),
  };

  const uvx = spawnSync(
    'uvx',
    ['--from', 'fonttools[woff]', 'pyftsubset', ...pyftsubsetArgs],
    { stdio: 'inherit', env },
  );

  if (uvx.status !== 0) {
    throw new Error('Unable to run pyftsubset. Install fonttools or uvx, then retry.');
  }
}

if (!fs.existsSync(sourceFont)) {
  throw new Error(`Missing source font: ${sourceFont}`);
}

fs.mkdirSync(path.dirname(outputFont), { recursive: true });

const text = collectText();
const textFile = path.join(os.tmpdir(), 'umupa-blog-font-subset.txt');
fs.writeFileSync(textFile, text, 'utf8');

runSubsetter(textFile);

const sourceSize = fs.statSync(sourceFont).size;
const outputSize = fs.statSync(outputFont).size;
const cjkCount = [...text].filter((char) => /[\u3400-\u9fff\uf900-\ufaff]/u.test(char)).length;

console.log(`Subset glyph text: ${text.length} unique chars, ${cjkCount} CJK chars`);
console.log(`Source font: ${formatBytes(sourceSize)}`);
console.log(`Subset font: ${formatBytes(outputSize)}`);
