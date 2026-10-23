// Ghép template + css + js (theo thứ tự tên file) thành một HTML duy nhất.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const js = fs.readdirSync(path.join(root, 'src/js')).filter(f => f.endsWith('.js')).sort()
  .map(f => `/* ---- ${f} ---- */\n` + read('src/js/' + f)).join('\n');
const html = read('src/index.template.html')
  .replace('/*CSS*/', () => read('src/style.css'))
  .replace('/*JS*/', () => js.replace(/<\/script>/g, '<\\/script>'));
for (const out of ['dist/index.html', 'docs/index.html']) {
  fs.mkdirSync(path.dirname(path.join(root, out)), { recursive: true });
  fs.writeFileSync(path.join(root, out), html);
}
