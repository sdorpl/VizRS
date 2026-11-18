// Porównuje stare i nowe pliki: dla każdego usuniętego .join('') sprawdza, czy w nowej wersji .map(...) zwraca html``.
import fs from 'fs'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
const [oldF, newF] = process.argv.slice(2);
const P = (f) => { const src = fs.readFileSync(f, 'utf8'); return { src, ast: acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true }) }; };
const o = P(oldF);
walk.full(o.ast, (n) => {
  if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.property.name === 'join' && n.arguments[0]?.value === '') {
    const obj = n.callee.object;
    let htmlish = false;
    if (obj.type === 'CallExpression' && obj.callee.property?.name === 'map') {
      const fn = obj.arguments[0];
      const body = fn && /Function/.test(fn.type) ? fn.body : null;
      const txt = body ? o.src.slice(body.start, body.end) : '';
      htmlish = /^\s*`\s*</.test(txt) || /^\s*\(?\s*`/.test(txt) && /<[a-z]/i.test(txt) || /^[a-zA-Z_]+\(/.test(txt) ;
    } else if (obj.type === 'Identifier') htmlish = 'ident';
    console.log(`${oldF}:${n.loc.start.line}: ${htmlish ? 'html?' : 'TEKST'} ${o.src.slice(n.start, Math.min(n.end, n.start + 140)).replace(/\n/g, ' ')}`);
  }
});
