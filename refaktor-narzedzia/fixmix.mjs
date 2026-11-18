// node fixmix.mjs PLIK – przepisuje: łańcuchy `a + b` z udziałem html`` → html`${a}${b}`; `x += e` (e albo x z html) →
// x = html`${x}${e}`; el.innerHTML = v → setHtml(el, v); el.innerHTML += v → appendHtml(el, v); el.outerHTML = v → replaceHtml(el, v).
// „html” = szablon html``, wywołanie funkcji zwracającej html`` (wykryte w pliku) albo zmienna, do której przypisano html.
import fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
const f = process.argv[2];
let src = fs.readFileSync(f, 'utf8');
for (let pass = 0; pass < 6; pass++) {
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const isTag = (n) => n?.type === 'TaggedTemplateExpression' && n.tag.name === 'html';
  const hf = new Set(), hv = new Set();
  const retHtml = (body) => { let r = false; if (body.type !== 'BlockStatement') return isHtmlish(body); walk.simple(body, { ReturnStatement(x) { if (x.argument && isHtmlish(x.argument)) r = true; } }); return r; };
  const isHtmlish = (n) => !!n && (isTag(n) || (n.type === 'ConditionalExpression' && (isHtmlish(n.consequent) || isHtmlish(n.alternate))) || (n.type === 'LogicalExpression' && (isHtmlish(n.left) || isHtmlish(n.right))) || (n.type === 'CallExpression' && n.callee.type === 'Identifier' && hf.has(n.callee.name)) || (n.type === 'Identifier' && hv.has(n.name)) || (n.type === 'BinaryExpression' && n.operator === '+' && (isHtmlish(n.left) || isHtmlish(n.right))));
  for (let k = 0; k < 4; k++) walk.full(ast, (n) => {
    if (n.type === 'VariableDeclarator' && n.init && /Function/.test(n.init.type) && retHtml(n.init.body)) hf.add(n.id.name);
    if (n.type === 'FunctionDeclaration' && retHtml(n.body)) hf.add(n.id.name);
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && isHtmlish(n.init)) hv.add(n.id.name);
    if (n.type === 'AssignmentExpression' && n.left.type === 'Identifier' && (n.operator === '=' || n.operator === '+=') && isHtmlish(n.right)) hv.add(n.left.name);
  });
  // najbardziej zewnętrzna zmiana na przebieg (zagnieżdżone poprawi kolejny przebieg)
  const edits = [];
  const flat = (n, out) => { if (n.type === 'BinaryExpression' && n.operator === '+') { flat(n.left, out); flat(n.right, out); } else out.push(n); return out; };
  const S = (n) => src.slice(n.start, n.end);
  walk.full(ast, (n) => {
    if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && /^(inner|outer)HTML$/.test(n.left.property?.name || '')) {
      const fn = n.left.property.name === 'outerHTML' ? 'replaceHtml' : n.operator === '+=' ? 'appendHtml' : 'setHtml';
      edits.push([n.start, n.end, `${fn}(${S(n.left.object)}, ${S(n.right)})`]); return;
    }
    if (n.type === 'AssignmentExpression' && n.operator === '+=' && n.left.type === 'Identifier' && (isHtmlish(n.right) || hv.has(n.left.name))) {
      const parts = flat(n.right, []);
      edits.push([n.start, n.end, `${n.left.name} = html\`\${${n.left.name}}${parts.map((p) => '${' + S(p) + '}').join('')}\``]); return;
    }
    if (n.type === 'BinaryExpression' && n.operator === '+' && isHtmlish(n)) {
      const parts = flat(n, []);
      edits.push([n.start, n.end, 'html`' + parts.map((p) => '${' + S(p) + '}').join('') + '`']);
    }
  });
  // tylko zmiany niezagnieżdżone w innych
  edits.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const top = []; let end = -1;
  for (const e of edits) if (e[0] >= end) { top.push(e); end = e[1]; }
  if (!top.length) break;
  for (const [s, e, t] of top.reverse()) src = src.slice(0, s) + t + src.slice(e);
  console.error(`przebieg ${pass + 1}: ${top.length} zmian`);
}
fs.writeFileSync(f, src);
