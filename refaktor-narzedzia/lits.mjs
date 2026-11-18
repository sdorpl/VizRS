import fs from 'fs'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
for (const f of process.argv.slice(2)) { const src = fs.readFileSync(f, 'utf8'); const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  walk.fullAncestor(ast, (n, _s, anc) => { const p = anc[anc.length - 2];
    const t = n.type === 'Literal' && typeof n.value === 'string' ? n.value : n.type === 'TemplateLiteral' && p?.type !== 'TaggedTemplateExpression' ? n.quasis.map((q) => q.value.cooked).join('') : null;
    if (t != null && /<[a-z\/!]|="/i.test(t)) { const cal = p?.type === 'CallExpression' ? (p.callee.name || p.callee.property?.name) : ''; if (!/^(\$|\$\$|querySelector|querySelectorAll|closest|matches)$/.test(cal)) console.log(`${f}:${n.loc.start.line}: [${p?.type} ${cal}] ${src.slice(n.start, n.start + 100).replace(/\n/g, ' ')}`); } }); }
