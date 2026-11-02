const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const sourceRoot = path.join(projectRoot, 'src');
const outputRoot = path.join(projectRoot, 'dist');
const outputFile = path.join(outputRoot, 'Code.gs');

const sourceFiles = fs.readdirSync(sourceRoot)
  .filter(file => file.endsWith('.gs'))
  .sort();

if (!sourceFiles.length) {
  throw new Error('No Apps Script .gs source files were found.');
}

const bundle = [
  '/**',
  ' * SAHARE PROPERTIES — RENT & COLLECTION AUTO-PILOT v7',
  ' * Generated from modular source files in /src.',
  ' * Edit /src modules and rebuild; do not hand-edit this bundle.',
  ' */',
  ''
];

for (const file of sourceFiles) {
  bundle.push('\n/* ==========================================================================');
  bundle.push(` * MODULE: ${file}`);
  bundle.push(' * ========================================================================== */\n');
  bundle.push(fs.readFileSync(path.join(sourceRoot, file), 'utf8').trimEnd());
}

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(outputFile, bundle.join('\n') + '\n', 'utf8');
process.stdout.write(`Built ${path.relative(projectRoot, outputFile)} from ${sourceFiles.length} source modules.\n`);
