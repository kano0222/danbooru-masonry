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
        name: 'Danbooru Masonry',
        namespace: 'danbooru-masonry',
        version: '0.1.1',
        license: 'MIT',
        description:
          'Adds masonry browsing, tag translation, and an immersive image viewing experience to Danbooru.',
        source: 'https://github.com/kano0222/danbooru-masonry',
        match: [
          'https://danbooru.donmai.us/',
          'https://danbooru.donmai.us/posts*',
        ],
        grant: ['GM_openInTab'],
        connect: ['danbooru.donmai.us', 'cdn.jsdelivr.net'],
        'run-at': 'document-end',
      },
      build: {
        fileName: 'danbooru-masonry.user.js',
      },
    }),
  ],
});
