import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const output = join(process.cwd(), 'dist', 'danbooru-masonry.user.js');
if (!existsSync(output)) {
  throw new Error(`Missing userscript build output: ${output}`);
}

const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
const source = readFileSync(output, 'utf8');
const headerEnd = source.indexOf('// ==/UserScript==');
if (headerEnd === -1) {
  throw new Error(`Missing userscript metadata block: ${output}`);
}

const body = source.slice(headerEnd + '// ==/UserScript=='.length).replace(/^\r?\n/, '');
const header = `// ==UserScript==\n\
// @name         Danbooru 瀑布流浏览\n\
// @name:zh      Danbooru 瀑布流浏览\n\
// @name:en      Danbooru Masonry\n\
// @namespace    danbooru-masonry\n\
// @version      ${pkg.version}\n\
// @description  为 Danbooru 添加瀑布流浏览、标签翻译和沉浸式图片查看体验。\n\
// @description:zh  为 Danbooru 添加瀑布流浏览、标签翻译和沉浸式图片查看体验。\n\
// @description:en  Adds masonry browsing, tag translation, and an immersive image viewing experience to Danbooru.\n\
// @license      MIT\n\
// @source       https://github.com/kano0222/danbooru-masonry\n\
// @match        https://danbooru.donmai.us/\n\
// @match        https://danbooru.donmai.us/posts*\n\
// @connect      danbooru.donmai.us\n\
// @connect      cdn.jsdelivr.net\n\
// @connect      cdn.donmai.us\n\
// @connect      pbs.twimg.com\n\
// @connect      i.pximg.net\n\
// @grant        GM_openInTab\n\
// @grant        GM_download\n\
// @run-at       document-end\n\
// ==/UserScript==\n\n`;
writeFileSync(output, header + body, 'utf8');
console.log(`Built ${output}`);
