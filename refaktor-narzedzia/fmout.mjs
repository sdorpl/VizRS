// html`` złożone wyłącznie z wstawek (wynik fixmix) – wypisuje je, by sprawdzić, czy każdy składnik to naprawdę HTML.
import fs from 'fs'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
for (const f of process.argv.slice(2)) { const src = fs.readFileSync(f, 'utf8'); const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  walk.full(ast, (n) => { if (n.type === 'TaggedTemplateExpression' && n.tag.name === 'html' && n.quasi.quasis.every((q) => q.value.cooked === '')) {
    const parts = n.quasi.expressions.map((e) => src.slice(e.start, e.end).replace(/\s+/g, ' ').slice(0, 50));
    console.log(`${f}:${n.loc.start.line}: ${parts.join(' ‖ ')}`); } }); }
