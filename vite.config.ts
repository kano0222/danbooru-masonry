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
        namespace: 'danbooru-masonry',
        version: '0.1.0',
        description: {
          '': '为 Danbooru 添加瀑布流浏览、标签翻译和沉浸式图片查看体验。',
          zh: '为 Danbooru 添加瀑布流浏览、标签翻译和沉浸式图片查看体验。',
          en: 'Adds masonry browsing, tag translation, and an immersive image viewing experience to Danbooru.',
        },
        "source": "https://github.com/kano0222/danbooru-masonry",
        match: [
          'https://danbooru.donmai.us/',
          'https://danbooru.donmai.us/posts*',
        ],
        grant: ['GM_openInTab'],
        connect: ['danbooru.donmai.us', 'cdn.jsdelivr.net'],
        'run-at': 'document-end',
      },
      build: {
        fileName: 'danbooru-masonry.js',
      },
    }),
  ],
});
