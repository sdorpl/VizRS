// Porównanie starej i nowej wersji ticker-items.js tym samym scenariuszem (narzędzie poza repo).
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.env.PLAYWRIGHT_DIR, 'node_modules/playwright'));
const WEB = process.argv[2], OLD = process.argv[3];

async function run(b, file) {
  const p = await b.newPage();
  await p.route('http://h/**', (r) => {
    const u = new URL(r.request().url()).pathname;
    if (u === '/') return r.fulfill({ contentType: 'text/html', body: `<html><body><div id="host"></div><script type="module">
      import { mountTickerEditor } from '/ticker-items.js';
      window.log = [];
      window.ed = mountTickerEditor(document.getElementById('host'), { value: 'PILNE|Pierwsza\\nSPORT#1f8a4c|Gol\\nDruga bez kategorii', label: 'INFO',
        catColors: 'PILNE=#c00', rules: { maxChars: 80 }, onChange: (v) => log.push(v), onHover: (i) => log.push('hover:' + i) });
      window.ready = true;
    </script></body></html>` });
    const f = u === '/ticker-items.js' ? file : path.join(WEB, u);
    return r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(f, 'utf8') });
  });
  await p.evaluate(() => localStorage.clear()).catch(() => {});
  await p.goto('http://h/');
  await p.waitForFunction(() => window.ready);
  p.on('dialog', (d) => d.accept(d.type() === 'prompt' ? 'NOWA#123456' : undefined));
  const snap = async (tag) => (await p.evaluate(() => [log.splice(0), document.getElementById('host').innerHTML]))
    .concat(tag);
  const out = [];
  const T = (n) => p.locator('.tkx-txt').nth(n);
  out.push(await snap('start'));
  await T(0).click(); await p.keyboard.press('End'); await p.keyboard.type(' i dalej'); out.push(await snap('typing'));
  await T(0).click(); await p.keyboard.press('Home'); for (let k = 0; k < 9; k++) await p.keyboard.press('ArrowRight');
  await p.keyboard.press('Enter'); out.push(await snap('enter-split'));
  await p.keyboard.press('Control+ArrowUp'); out.push(await snap('ctrl-up'));
  await T(2).click(); await p.keyboard.press('Control+ArrowDown'); out.push(await snap('ctrl-down'));
  await p.locator('[data-a="add"]').click(); out.push(await snap('add'));
  await p.keyboard.press('Backspace'); out.push(await snap('backspace-empty'));
  await T(1).click();
  await p.evaluate(() => { const el = document.querySelectorAll('.tkx-txt')[1]; const dt = new DataTransfer(); dt.setData('text', 'KRAJ|Jeden\nDwa\nSPORT|Trzy'); el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
  out.push(await snap('paste'));
  await p.locator('.tkx-cat').nth(0).fill('SPORT'); out.push(await snap('cat-input'));
  await T(2).click(); await p.waitForTimeout(50); out.push(await snap('cat-change'));
  await p.locator('[data-a="up"]').nth(3).click(); out.push(await snap('btn-up'));
  await p.locator('[data-a="down"]').nth(0).click(); out.push(await snap('btn-down'));
  await p.locator('[data-a="del"]').nth(2).click(); out.push(await snap('btn-del'));
  await p.locator('.tkx-row').nth(3).hover(); out.push(await snap('hover'));
  await p.locator('.tkx-row .tkx-n').nth(4).dragTo(p.locator('.tkx-row').nth(0)); out.push(await snap('drag-list'));
  await p.locator('[data-view="groups"]').click(); out.push(await snap('view-groups'));
  await p.locator('[data-a="gadd"]').nth(0).click(); out.push(await snap('gadd'));
  await p.locator('.tkx-cname').nth(1).fill('ZMIANA'); await p.locator('.tkx-cname').nth(1).press('Tab'); await p.waitForTimeout(50); out.push(await snap('rename-group'));
  await p.locator('.tkx-row .tkx-n').last().dragTo(p.locator('.tkx-card').nth(0)); out.push(await snap('drag-group'));
  await p.locator('[data-a="newgroup"]').click(); out.push(await snap('newgroup'));
  await p.locator('[data-a="gdel"]').nth(0).click(); out.push(await snap('gdel'));
  await p.locator('[data-view="raw"]').click(); out.push(await snap('view-raw'));
  await p.locator('.tkx-raw').fill('A|jeden\nB#00ff00|dwa'); out.push(await snap('raw-input'));
  await p.evaluate(() => { ed.setValue('X|nowa\nY|druga'); ed.setSqueeze(Object.assign([0.9, 0.5], { min: 0.6 })); ed.setOptions({ rules: { readonly: true } }); });
  await p.locator('[data-view="list"]').click(); out.push(await snap('api'));
  await p.close();
  return out;
}

(async () => {
  const b = await chromium.launch();
  const a = await run(b, OLD), n = await run(b, path.join(WEB, 'ticker-items.js'));
  await b.close();
  let bad = 0;
  a.forEach((x, i) => { const f = (v) => JSON.stringify([v[0].filter((e) => !String(e).startsWith('hover:') || v[2] === 'hover'), v[1]]); const same = f(x) === f(n[i]); if (!same) { bad++; console.log('RÓŻNICA', x[2], '\n stara:', JSON.stringify(x[0]), '\n nowa :', JSON.stringify(n[i][0])); } });
  console.log(`${a.length} kroków, różnic: ${bad}; zmian onChange łącznie: ${a.reduce((s, x) => s + x[0].length, 0)}`);
})();
