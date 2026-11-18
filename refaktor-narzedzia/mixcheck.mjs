// Zgłasza `+`/`+=` z udziałem html`` (wynik byłby napisem → podwójne escapowanie), zmienne `let x = html`…`` z `x +=`,
// `x = '…'`/`x = `…`` (zwykły napis do zmiennej z html), oraz zapisy innerHTML/outerHTML.
import fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const isH = (n) => n && n.type === 'TaggedTemplateExpression' && n.tag.name === 'html';
  const hv = new Set();
  walk.full(ast, (n) => { if (n.type === 'VariableDeclarator' && isH(n.init)) hv.add(n.id.name); });
  const rep = (n, m) => console.log(`${f}:${n.loc.start.line}: ${m}: ${src.slice(n.start, n.start + 110).replace(/\n/g, ' ')}`);
  walk.full(ast, (n) => {
    if (n.type === 'BinaryExpression' && n.operator === '+' && (isH(n.left) || isH(n.right))) rep(n, '+ z html');
    if (n.type === 'AssignmentExpression' && n.operator === '+=' && (isH(n.right) || (n.left.type === 'Identifier' && hv.has(n.left.name)))) rep(n, '+=');
    if (n.type === 'CallExpression' && /^(setHtml|appendHtml|replaceHtml|writeHtml)$/.test(n.callee.name) && n.arguments[1] && !isH(n.arguments[1]) && !(n.arguments[1].type === 'Literal' && n.arguments[1].value === '')) rep(n, 'setHtml – sprawdź, czy argument to html');
    if (n.type === 'AssignmentExpression' && /^(inner|outer)HTML$/.test(n.left.property?.name || '')) rep(n, 'innerHTML');
  });
}
