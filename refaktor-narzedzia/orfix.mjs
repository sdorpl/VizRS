// `X.map(...) || Y` (po usunięciu .join('')) → orEmpty(X.map(...), Y). Zapisuje plik; wypisuje zmiany.
import fs from 'fs'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
for (const f of process.argv.slice(2)) { let src = fs.readFileSync(f, 'utf8'); const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const ed = [];
  walk.full(ast, (n) => { if (n.type === 'LogicalExpression' && n.operator === '||' && n.left.type === 'CallExpression' && /^(map|filter|flatMap)$/.test(n.left.callee.property?.name || '')) { ed.push([n.start, n.end, `orEmpty(${src.slice(n.left.start, n.left.end)}, ${src.slice(n.right.start, n.right.end)})`]); console.log(`${f}:${n.loc.start.line}`); } });
  ed.sort((a, b) => b[0] - a[0]); for (const [s, e, t] of ed) src = src.slice(0, s) + t + src.slice(e);
  if (ed.length) { if (!/\borEmpty\b/.test(src.split('\n').filter((l) => l.startsWith('import')).join('\n'))) src = src.replace(/^import \{ ([^}]*) \} from '\/dom\.js';/m, (m, a) => `import { ${a}, orEmpty } from '/dom.js';`); fs.writeFileSync(f, src); } }
