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
          '': 'Danbooru Masonry — 浏览增强与标签翻译',
          zh: 'Danbooru Masonry — 浏览增强与标签翻译',
          en: 'Danbooru Masonry — Enhanced Browsing and Tag Translation',
        },
        namespace: 'https://github.com/kano0222',
        version: '0.7.7',
        author: 'kano0222',
        license: 'MIT',
        description: {
          '': '为 Danbooru 提供多种图片布局、中文标签翻译、搜索历史和沉浸式图片与视频查看。',
          zh: '为 Danbooru 提供多种图片布局、中文标签翻译、搜索历史和沉浸式图片与视频查看。',
          en: 'Browse Danbooru with multiple image layouts, Chinese tag translations, search history, and an immersive image and video viewer.',
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
        grant: ['GM_openInTab', 'GM_download', 'GM_getValue', 'GM_setValue', 'GM_xmlhttpRequest'],
        connect: ['danbooru.donmai.us', 'cdn.jsdelivr.net', 'cdn.donmai.us', 'pbs.twimg.com', 'i.pximg.net'],
        'run-at': 'document-end',
      },
      build: {
        fileName: 'danbooru-masonry.user.js',
      },
    }),
  ],
});
