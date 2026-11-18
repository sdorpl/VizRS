import fs from 'fs'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
for (const f of process.argv.slice(2)) { const src = fs.readFileSync(f, 'utf8'); const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  walk.fullAncestor(ast, (n, _s, anc) => { const p = anc[anc.length - 2];
    if (n.type === 'TemplateLiteral' && p?.type !== 'TaggedTemplateExpression') for (const e of n.expressions) if (e.type === 'CallExpression' && e.callee.name === 'esc') console.log(`${f}:${n.loc.start.line}: esc w zwykłym szablonie: ${src.slice(n.start, n.start + 120).replace(/\n/g, ' ')}`); }); }
