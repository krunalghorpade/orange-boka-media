import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const pages = ['index.html', 'music.html', 'artist.html', 'services.html', 'pricing.html', 'contact.html'];

await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'assets'), { recursive: true });
for (const file of [...pages, 'styles.css', 'app.js']) {
  await cp(join(root, file), join(output, file));
}
for (const file of await readdir(join(root, 'assets'))) {
  await cp(join(root, 'assets', file), join(output, 'assets', file));
}
console.log(`Built ${pages.length} pages in dist/`);
