import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
console.log(`Release artifacts are ready for danbooru-masonry v${pkg.version}.`);
console.log('Upload dist/danbooru-masonry.user.js to GitHub Releases or serve it from the release asset URL.');
