import fs from 'node:fs';
import path from 'node:path';
import wawoff2 from 'wawoff2';
import { fontSplit } from 'cn-font-split';

const root = process.cwd();
const sourceFont = path.join(root, 'fonts-src', 'TsangerJinKai02-W04.woff2');
const outDir = path.join(root, 'public', 'fonts', 'jinkai');
// 与 theme.css 的 --text-font 保持一致，免去改样式变量
const fontFamily = 'TsangerJinKai02-W04';
const chunkSize = 300 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function totalSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += totalSize(full);
    } else {
      total += fs.statSync(full).size;
    }
  }
  return total;
}

if (!fs.existsSync(sourceFont)) {
  throw new Error(`Missing source font: ${sourceFont}`);
}

// 清空旧产物，避免残留过期分包
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// cn-font-split v7 不接受 woff2 直输，先用 wawoff2 解压成 ttf
console.log('Decompressing woff2 → ttf ...');
const woff2Buffer = fs.readFileSync(sourceFont);
const ttfBuffer = await wawoff2.decompress(woff2Buffer);
console.log(`  ttf size: ${formatBytes(ttfBuffer.length)}`);

console.log('Splitting font into unicode-range subsets ...');
await fontSplit({
  input: new Uint8Array(ttfBuffer),
  outDir,
  css: {
    fontFamily,
    fontDisplay: 'swap',
  },
  renameOutputFont: '[index].[ext]',
  chunkSize,
  testHtml: false,
  reporter: false,
  silent: true,
});

// 找到生成的 CSS，统一重命名为 index.css，便于在布局里稳定引用
const generatedCss = fs.readdirSync(outDir).find((name) => name.endsWith('.css'));
if (!generatedCss) {
  throw new Error('cn-font-split did not output a CSS file');
}
const cssPath = path.join(outDir, 'index.css');
if (generatedCss !== 'index.css') {
  fs.renameSync(path.join(outDir, generatedCss), cssPath);
}

const css = fs.readFileSync(cssPath, 'utf8').replace(/src:local\("[^"]+"\),url\(/g, 'src:url(');
fs.writeFileSync(cssPath, css);

for (const entry of fs.readdirSync(outDir)) {
  if (!entry.endsWith('.woff2') && entry !== 'index.css') {
    fs.rmSync(path.join(outDir, entry), { force: true });
  }
}

const woff2Files = fs.readdirSync(outDir).filter((name) => name.endsWith('.woff2'));
const cssSize = fs.statSync(cssPath).size;

console.log('');
console.log(`Subsets:     ${woff2Files.length} files`);
console.log(`Total size:  ${formatBytes(totalSize(outDir))} (woff2 chunks + index.css)`);
console.log(`CSS size:    ${formatBytes(cssSize)} → /fonts/jinkai/index.css`);
console.log(`font-family: '${fontFamily}'`);

// cn-font-split's Node FFI handle can keep the event loop alive after output.
process.exit(0);
