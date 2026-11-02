const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const projectRoot = path.join(__dirname, '..');
const sourceRoot = path.join(projectRoot, 'src');
const files = fs.readdirSync(sourceRoot).filter(name => name.endsWith('.gs')).sort();
let failed = false;

function checkFile(filePath, label) {
  try {
    new vm.Script(fs.readFileSync(filePath, 'utf8'), { filename: label });
    process.stdout.write(`OK ${label}\n`);
  } catch (error) {
    failed = true;
    process.stderr.write(`ERROR ${label}: ${error.message}\n`);
  }
}

for (const file of files) checkFile(path.join(sourceRoot, file), file);
const bundlePath = path.join(projectRoot, 'dist', 'Code.gs');
if (fs.existsSync(bundlePath)) checkFile(bundlePath, 'dist/Code.gs');
if (failed) process.exit(1);
