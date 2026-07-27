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
// @namespace    https://github.com/kano0222\n\
// @version      ${pkg.version}\n\
// @description  为 Danbooru 添加瀑布流浏览、标签翻译、沉浸式图片查看和原图下载体验。\n\
// @description:zh  为 Danbooru 添加瀑布流浏览、标签翻译、沉浸式图片查看和原图下载体验。\n\
// @description:en  Adds masonry browsing, tag translation, immersive image viewing, and original-file downloads to Danbooru.\n\
// @author       kano0222\n\
// @license      MIT\n\
// @icon         https://danbooru.donmai.us/favicon.ico\n\
// @source       https://github.com/kano0222/danbooru-masonry\n\
// @downloadURL  https://update.greasyfork.org/scripts/585986/Danbooru%20%E7%80%91%E5%B8%83%E6%B5%81%E6%B5%8F%E8%A7%88.user.js\n\
// @updateURL    https://update.greasyfork.org/scripts/585986/Danbooru%20%E7%80%91%E5%B8%83%E6%B5%81%E6%B5%8F%E8%A7%88.user.js\n\
// @match        https://danbooru.donmai.us/\n\
// @match        https://danbooru.donmai.us/posts*\n\
// @connect      danbooru.donmai.us\n\
// @connect      cdn.jsdelivr.net\n\
// @connect      cdn.donmai.us\n\
// @connect      pbs.twimg.com\n\
// @connect      i.pximg.net\n\
// @grant        GM_openInTab\n\
// @grant        GM_download\n\
// @grant        GM_getValue\n\
// @grant        GM_setValue\n\
// @run-at       document-end\n\
// ==/UserScript==\n\n`;
writeFileSync(output, header + body, 'utf8');
console.log(`Built ${output}`);
