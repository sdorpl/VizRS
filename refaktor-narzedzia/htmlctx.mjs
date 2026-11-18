// html`` w miejscu, które nie trafia do HTML: przypisanie do właściwości (np. .title, .value, .textContent), argument funkcji
// spoza listy, wartość w obiekcie. Do przejrzenia ręcznie.
import fs from 'fs'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
const OK = /^(setHtml|appendHtml|replaceHtml|writeHtml|orEmpty|push|add|box|ck|b|bar|chip|html)$/;
for (const f of process.argv.slice(2)) { const src = fs.readFileSync(f, 'utf8'); const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  walk.fullAncestor(ast, (n, _s, anc) => { if (!(n.type === 'TaggedTemplateExpression' && n.tag.name === 'html')) return;
    let i = anc.length - 2; while (i >= 0 && /ConditionalExpression|LogicalExpression|ArrayExpression|ParenthesizedExpression/.test(anc[i].type)) i--;
    const p = anc[i]; if (!p) return;
    let bad = '';
    if (p.type === 'AssignmentExpression' && p.left.type === 'MemberExpression') bad = 'przypisanie do ' + src.slice(p.left.start, p.left.end);
    if (p.type === 'CallExpression' && p.arguments.includes(anc[i + 1]) && !OK.test(p.callee.name || p.callee.property?.name || '')) bad = 'argument ' + (p.callee.name || p.callee.property?.name);
    if (p.type === 'Property') bad = 'w obiekcie ' + src.slice(p.key.start, p.key.end);
    if (bad) console.log(`${f}:${n.loc.start.line}: ${bad}: ${src.slice(n.start, n.start + 90).replace(/\n/g, ' ')}`); }); }
