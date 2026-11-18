// node tohtml.mjs PLIK OD DO – w wierszach OD..DO: szablony z HTML (`<` albo `="`) → html``, napisy '<…>' → html``,
// .join('') usunięte (tablica Html składa się sama). Zgłasza `+` z udziałem przerobionych szablonów (do ręcznej przeróbki).
import fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
const [f, a, b] = [process.argv[2], +process.argv[3], +process.argv[4]];
const src = fs.readFileSync(f, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
const edits = [];
const inR = (n) => n.loc.start.line >= a && n.loc.end.line <= b;
const tagged = new Set();
walk.fullAncestor(ast, (n, _s, anc) => {
  if (!inR(n)) return;
  const p = anc[anc.length - 2];
  if (!p) return;
  const cal = p.type === 'CallExpression' && p.arguments.includes(n) ? (p.callee.name || p.callee.property?.name) : null;
  if (process.env.LIST && n.type === 'TemplateLiteral' && p.type !== 'TaggedTemplateExpression' && /<|="/.test(n.quasis.map((q) => q.value.cooked).join(''))) console.log(`${f}:${n.loc.start.line}: [${p.type}${cal ? ' ' + cal : ''}] ${src.slice(n.start, n.start + 70).replace(/\n/g, ' ')}`);
  if (n.type === 'TemplateLiteral' && p.type !== 'TaggedTemplateExpression' && !(cal && /^(\$|\$\$|querySelector|querySelectorAll|closest|matches)$/.test(cal))) {
    const t = n.quasis.map((q) => q.value.cooked).join('');
    if (/<|="/.test(t)) { edits.push([n.start, n.start, 'html']); tagged.add(n); }
  }
  if (n.type === 'Literal' && typeof n.value === 'string' && /^<[\s\S]*>$/.test(n.value) && !/[`$\\]/.test(n.value) && p.type !== 'CallExpression') {
    edits.push([n.start, n.end, 'html`' + n.value + '`']); tagged.add(n);
  }
  if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.property.name === 'join' && n.arguments.length === 1 && n.arguments[0].value === '') {
    edits.push([n.callee.object.end, n.end, '']);
  }
});
walk.full(ast, (n) => {
  if (inR(n) && n.type === 'BinaryExpression' && n.operator === '+') console.log(`${f}:${n.loc.start.line}: + do ręcznej przeróbki: ${src.slice(n.start, n.start + 100).replace(/\n/g, ' ')}`);
  if (inR(n) && n.type === 'AssignmentExpression' && n.operator === '+=') console.log(`${f}:${n.loc.start.line}: += do ręcznej przeróbki: ${src.slice(n.start, n.start + 100).replace(/\n/g, ' ')}`);
});
edits.sort((x, y) => y[0] - x[0] || y[1] - x[1]);
let out = src;
for (const [s, e, t] of edits) out = out.slice(0, s) + t + out.slice(e);
if (!process.env.LIST) fs.writeFileSync(f, out);
console.error(`${edits.length} zmian`);
