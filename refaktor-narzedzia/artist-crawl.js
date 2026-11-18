// Przegląd edytora Artist: stara (jeden skrypt) i nowa (moduły) wersja – te same kroki, zrzuty i błędy JS.
// node artist-crawl.js <vizrs> <web> <stary-artist.html> <katalog-wyników>
const { spawn } = require('child_process');
const path = require('path'); const fs = require('fs'); const os = require('os'); const net = require('net');
const { chromium } = require(path.join(process.env.PLAYWRIGHT_DIR, 'node_modules/playwright'));
const [bin, web, oldHtml, outDir] = process.argv.slice(2);
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function crawl(variant) {
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'artcrawl-'));
  const port = await freePort();
  const srv = spawn(bin, ['serve', '--port', String(port), '--tcp', '0', '--data', data, '--web', web], { stdio: 'ignore' });
  await sleep(800);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 950 } });
  await p.addInitScript(() => { Math.random = () => 0.5; });
  await p.clock.install({ time: new Date('2026-11-17T12:00:00Z') });
  const tick = async (ms) => { await p.clock.runFor(ms); await sleep(30); };
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/native.css', (r) => r.fulfill({ contentType: 'text/css', body: fs.readFileSync(path.join(web, 'native.css'), 'utf8') }));
  await p.route('**/editor/*.js', (r) => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(web, 'editor', path.basename(new URL(r.request().url()).pathname)), 'utf8') }));
  if (variant === 'old' || process.env.BOTH_OLD) await p.route(/\/artist$/, (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: fs.readFileSync(oldHtml, 'utf8') }));
  await p.goto(`http://127.0.0.1:${port}/artist`);
  for (let i = 0; i < 100 && (await p.evaluate(() => document.querySelector('#conn')?.textContent)) !== 'połączono'; i++) await tick(100);
  await tick(800);
  const dir = path.join(outDir, variant); fs.mkdirSync(dir, { recursive: true });
  const scenes = await p.locator('#sceneSel option').evaluateAll((o) => o.map((x) => x.value));
  let n = 0;
  const shot = async (tag) => {
    await p.mouse.move(0, 0); await tick(150);
    const dom = await p.evaluate(() => ['#sceneSel', '#tree', '#propsTitle', '#props', '#tl', '#tc', '#dur', '#hint', '#bSave'].map((s) => {
      const e = document.querySelector(s); if (!e) return null;
      // wartości pól (DOM innerHTML ich nie ma)
      const vals = [...e.querySelectorAll('input, select, textarea')].map((i) => i.type === 'checkbox' ? i.checked : i.value);
      return [s, e.innerHTML, e.value ?? null, vals];
    }));
    fs.writeFileSync(path.join(dir, `${String(n).padStart(4, '0')}-${tag}.json`), JSON.stringify(dom)); await p.screenshot({ path: path.join(dir, `${String(n++).padStart(4, '0')}-${tag}.png`), animations: 'disabled', caret: 'hide' }); };
  for (const id of scenes) {
    await p.selectOption('#sceneSel', id); await tick(500);
    await shot(`scena-${id}`);
    const items = await p.locator('#tree .item[data-id]').evaluateAll((e) => e.map((x) => x.dataset.id));
    for (const nid of items.slice(0, 8)) {
      await p.click(`#tree .item[data-id="${nid}"]`); await tick(120);
      for (const tab of nid ? ['wl', 'ruch', 'dane'] : ['']) {
        if (tab) { await p.click(`[data-ptab="${tab}"]`); await tick(100); }
        await shot(`${id}-${nid || 'scena'}-${tab}`);
      }
    }
    // oś czasu: klik w kilka miejsc
    const tl = await p.locator('#tl').boundingBox();
    for (const fx of [0.3, 0.6]) { await p.mouse.click(tl.x + 260 + (tl.width - 260) * fx, tl.y + 12); await tick(100); }
    await shot(`${id}-os`);
  }
  await b.close(); srv.kill(); await sleep(300); fs.rmSync(data, { recursive: true, force: true });
  return errs;
}

(async () => {
  const eo = await crawl('old'), en = await crawl('new');
  console.log('błędy JS stara:', JSON.stringify([...new Set(eo)]), '\nbłędy JS nowa:', JSON.stringify([...new Set(en)]));
})();
