// Trio: ten sam scenariusz na dwóch katalogach web/ (stara i nowa wersja), porównanie HTML list, pól, okien (narzędzie poza repo).
//   node trio-equiv.js BIN WEB_STARY WEB_NOWY   (PLAYWRIGHT_DIR jak w e2e)
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn } = require('child_process');
const { chromium } = require(path.join(process.env.PLAYWRIGHT_DIR, 'node_modules/playwright'));
const [BIN, OLD, NEW] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEL = ['#pages', '#tpls', '#fields', '#estatus', '#elayer', '#layers', '#plSel', '#pl', '#rdSel', '#rd', '#mcSel', '#antSel', '#showSel', '#barName', '#fontlist', '#sysBox', '.pk-back', '.dlg-back'];
async function run(b, web, port) {
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'trioeq-'));
  const srv = spawn(BIN, ['--port', String(port), '--tcp', '0', '--data', data, '--web', web], { stdio: 'ignore' });
  await sleep(700);
  const B = `http://127.0.0.1:${port}`;
  const api = (m, u, body) => fetch(B + u, { method: m, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) }).then((r) => r.json().catch(() => null));
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addInitScript(() => { Date.now = () => 1763000000000; localStorage.setItem('vizrs.who', 'Operator 42'); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const out = [];
  const snap = async (tag) => { await sleep(400); out.push([tag, await p.evaluate((S) => S.map((s) => [s, document.querySelector(s)?.innerHTML ?? null]), SEL)]); };
  await p.goto(B + '/trio'); await sleep(1500); await snap('start');
  const show = await api('GET', '/api/show');
  await p.click('#pages .item >> nth=0'); await snap('wybór strony');
  await p.click('#pages .item >> nth=2'); await snap('inna strona');
  await p.fill('#filter', 'a'); await p.dispatchEvent('#filter', 'input'); await snap('filtr');
  await p.fill('#filter', ''); await p.dispatchEvent('#filter', 'input');
  await api('POST', `/api/take/${show.pages[0].number}`, {}); await snap('take');
  await api('POST', `/api/take/${show.pages[1].number}`, {}); await snap('take 2');
  await p.click('#bSys'); await sleep(800); await snap('stan systemu');
  await p.keyboard.press('Escape'); await p.evaluate(() => document.querySelector('#sysModal')?.classList.remove('open'));
  await api('POST', '/api/playlists', { name: 'PL <b>1</b>', items: [{ page: show.pages[0].id, duration: 5 }, { page: show.pages[1].id }] }).catch(() => {});
  await api('POST', '/api/rundowns', { name: 'RD & 1', items: [{ id: 'i1', page: show.pages[0].id, note: 'n "1"' }] }).catch(() => {});
  await p.reload(); await sleep(1500); await snap('po przeładowaniu z playlistą');
  for (const pg of show.pages.slice(0, 12)) { await p.evaluate((id) => document.querySelector(`#pages .item[data-id="${id}"]`)?.click(), pg.id); await snap('strona ' + pg.number); }
  await p.setViewportSize({ width: 400, height: 800 }); await sleep(600); await snap('telefon');
  await ctx.close(); srv.kill();
  return { out, errs };
}
(async () => {
  const b = await chromium.launch();
  const a = await run(b, OLD, 8301), n = await run(b, NEW, 8302);
  await b.close();
  let bad = 0;
  a.out.forEach(([tag, v], i) => v.forEach(([s, h], k) => { const h2 = n.out[i][1][k][1]; if (h !== h2) { bad++; let j = 0; while (h && h2 && h[j] === h2[j]) j++; console.log(`RÓŻNICA ${tag} ${s}\n stara: ${String(h).slice(Math.max(0, j - 60), j + 100)}\n nowa : ${String(h2).slice(Math.max(0, j - 60), j + 100)}`); } }));
  console.log(`błędy strony: stara ${JSON.stringify(a.errs)}, nowa ${JSON.stringify(n.errs)}`);
  console.log(`${a.out.length} kroków × ${SEL.length} elementów, różnic: ${bad}`);
})();
