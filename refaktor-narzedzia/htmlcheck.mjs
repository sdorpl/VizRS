// Kontrola szablonów html``: w wyrażeniach szablonu (rekurencyjnie, bez wchodzenia w funkcje zwracające html``)
// zgłasza: zwykły szablon/napis z '<' albo '&' (zostałby escapowany), zwykły szablon z esc()/html`` (podwójne escapowanie),
// .join( (Html → napis), oraz każde `innerHTML`/`outerHTML` poza dom.js.
import fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
const files = process.argv.slice(2);
let n = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let ast; try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true }); } catch (e) { console.log(f + ': ' + e.message); continue; }
  const rep = (node, msg) => { n++; console.log(`${f}:${node.loc.start.line}: ${msg}: ${src.slice(node.start, Math.min(node.end, node.start + 90)).replace(/\n/g, ' ')}`); };
  walk.fullAncestor(ast, (node, _st, anc) => {
    if (node.type === 'MemberExpression' && !node.computed && /^(inner|outer)HTML$/.test(node.property.name) && !f.endsWith('dom.js')) rep(node, 'innerHTML');
    let inHtml = false;
    for (let i = 0; i < anc.length - 2; i++) { const a = anc[i]; if (a.type === 'TaggedTemplateExpression' && a.tag.name === 'html' && anc[i + 1] === a.quasi) { inHtml = true; break; } }
    if (!inHtml) return;
    const parent = anc[anc.length - 2];
    if (node.type === 'TemplateLiteral' && !(parent.type === 'TaggedTemplateExpression')) {
      const raw = node.quasis.map((q) => q.value.cooked).join('');
      if (/[<&]/.test(raw)) rep(node, 'zwykły szablon z HTML w html``');
      for (const e of node.expressions) walk.full(e, (x) => { if (x.type === 'CallExpression' && x.callee.name === 'esc') rep(x, 'esc() w zwykłym szablonie w html``'); if (x.type === 'TaggedTemplateExpression' && x.tag.name === 'html') rep(x, 'html`` w zwykłym szablonie'); });
    }
    if (node.type === 'Literal' && typeof node.value === 'string' && /[<&"]/.test(node.value) && parent.type !== 'CallExpression' && parent.type !== 'MemberExpression' && parent.type !== 'Property') rep(node, 'napis z HTML w html``');
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.property.name === 'join') rep(node, '.join( w html``');
  });
}
console.error(`${n} zgłoszeń`);
