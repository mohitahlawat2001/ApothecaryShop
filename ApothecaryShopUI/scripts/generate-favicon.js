// Node script (ES module) to generate favicon.ico from src/assets/leaf.png using png-to-ico
// Usage: node ./scripts/generate-favicon.js
// Produces: ../favicon.ico (UI root)

import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const src = path.join(projectRoot, 'src', 'assets', 'leaf.png');
const dest = path.join(projectRoot, 'favicon.ico');

if (!fs.existsSync(src)) {
  console.error('Source image not found:', src);
  process.exit(1);
}

console.log('Generating favicon.ico from', src, '->', dest);

try {
  const buf = await pngToIco(src);
  fs.writeFileSync(dest, buf);
  console.log('favicon.ico created at:', dest);
} catch (err) {
  console.error('Failed to create favicon.ico:', err);
  process.exit(2);
}
