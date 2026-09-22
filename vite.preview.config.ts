import { defineConfig } from 'vite';

export default defineConfig({
  root: 'preview',
  base: './',
  build: {
    // Keep user-provided images already stored in preview-dist/assets/image.
    emptyOutDir: false,
    outDir: '../preview-dist',
  },
});
