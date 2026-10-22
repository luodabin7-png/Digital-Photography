'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, {recursive: true});
// Publish an explicit allowlist. Source documents and development files are excluded.
for (const file of ['index.html', 'styles.css', 'data.js', 'math.js', 'app.js', 'PRIVACY.md', 'LICENSE', '.nojekyll']) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), {recursive: true});
console.log('Static site prepared in dist/.');
