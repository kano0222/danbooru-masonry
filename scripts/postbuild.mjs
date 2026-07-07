import { existsSync } from 'node:fs';
import { join } from 'node:path';

const output = join(process.cwd(), 'dist', 'danbooru-masonry.js');
if (!existsSync(output)) {
  throw new Error(`Missing userscript build output: ${output}`);
}
console.log(`Built ${output}`);
