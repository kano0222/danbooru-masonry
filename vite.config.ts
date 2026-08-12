import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    minify: false,
  },
  plugins: [
    monkey({
      entry: 'src/userscript.ts',
      userscript: {
        name: {
          '': 'Danbooru 瀑布流浏览',
          zh: 'Danbooru 瀑布流浏览',
          en: 'Danbooru Masonry',
        },
        namespace: 'https://github.com/kano0222',
        version: '0.2.2',
        author: 'kano0222',
        license: 'MIT',
        description: {
          '': '为 Danbooru 添加瀑布流浏览、标签翻译、沉浸式图片查看和原图下载体验。',
          zh: '为 Danbooru 添加瀑布流浏览、标签翻译、沉浸式图片查看和原图下载体验。',
          en: 'Adds masonry browsing, tag translation, immersive image viewing, and original-file downloads to Danbooru.',
        },
        icon: 'https://danbooru.donmai.us/favicon.ico',
        source: 'https://github.com/kano0222/danbooru-masonry',
        downloadURL:
          'https://update.greasyfork.org/scripts/585986/Danbooru%20%E7%80%91%E5%B8%83%E6%B5%81%E6%B5%8F%E8%A7%88.user.js',
        updateURL:
          'https://update.greasyfork.org/scripts/585986/Danbooru%20%E7%80%91%E5%B8%83%E6%B5%81%E6%B5%8F%E8%A7%88.user.js',
        match: [
          'https://danbooru.donmai.us/',
          'https://danbooru.donmai.us/posts*',
        ],
        grant: ['GM_openInTab', 'GM_download', 'GM_getValue', 'GM_setValue'],
        connect: ['danbooru.donmai.us', 'cdn.jsdelivr.net', 'cdn.donmai.us', 'pbs.twimg.com', 'i.pximg.net'],
        'run-at': 'document-end',
      },
      build: {
        fileName: 'danbooru-masonry.user.js',
      },
    }),
  ],
});
