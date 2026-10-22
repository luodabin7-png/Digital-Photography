'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs');
for (const match of app.matchAll(/\$\('([^']+)'\)/g)) {
  if (!ids.includes(match[1])) throw new Error(`Missing app element: ${match[1]}`);
}
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) {
  if (!fs.existsSync(path.join(root, match[1]))) throw new Error(`Missing linked file: ${match[1]}`);
}
for (const file of ['data.js', 'math.js', 'app.js']) new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), {filename:file});
// The privacy check scans site files; development checks may contain pattern examples.
const siteFiles = ['index.html','styles.css','data.js','math.js','app.js',...fs.readdirSync(path.join(root, 'assets')).map(f=>'assets/'+f)];
const patterns = [/[A-Za-z]:\\(?:Users|Documents)\\/i, /\b1[3-9]\d{9}\b/, /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i];
for (const file of siteFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (patterns.some(p=>p.test(text))) throw new Error(`Possible private data in site file: ${file}`);
}
console.log('Passed: JavaScript syntax, DOM IDs, asset links and site privacy patterns.');
