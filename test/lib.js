const path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), '/node-tools/node_modules', '/node-tools'] }));
async function open(opts = {}) {
  const exe = ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => { try { require('fs').accessSync(p); return true; } catch (e) { return false; } });
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] }); // exe = undefined → dùng Chromium do `npx playwright install` cài (CI)
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 960, height: 720 }, deviceScaleFactor: 1, hasTouch: !!opts.touch });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../dist/index.html') + '?manual');
  return { browser, page, errs };
}
module.exports = { open };
