import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig(({ mode }) => {
  const localBuild = mode === 'local-mirror';
  const match = [
    'https://danbooru.donmai.us/',
    'https://danbooru.donmai.us/posts*',
    ...(localBuild
      ? [
          'http://localhost:3000/',
          'http://localhost:3000/posts*',
          'http://127.0.0.1:3000/',
          'http://127.0.0.1:3000/posts*',
        ]
      : []),
  ];

  return {
    build: {
      emptyOutDir: true,
      outDir: 'dist',
      minify: false,
    },
    define: {
      __LOCAL_DANBOORU__: JSON.stringify(localBuild),
    },
    plugins: [
      monkey({
        entry: 'src/userscript.ts',
        userscript: {
          name: localBuild ? 'Danbooru Masonry Local' : 'Danbooru Masonry',
          namespace: 'danbooru-masonry',
          version: '0.1.0',
          description:
            'Masonry browsing, tag translation, viewer, and favorites helper for Danbooru.',
          match,
          grant: ['GM_openInTab'],
          connect: ['danbooru.donmai.us', 'cdn.jsdelivr.net'],
          'run-at': 'document-end',
        },
        build: {
          fileName: 'danbooru-masonry.user.js',
        },
      }),
    ],
  };
});
