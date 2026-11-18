import fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
const [file, first, last] = [process.argv[2], +process.argv[3], +process.argv[4]];
const lines = fs.readFileSync(file, 'utf8').split('\n');
const code = lines.slice(first - 1, last).join('\n');
const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
const off = first - 1;
const parts = JSON.parse(process.argv[5]); // [[name, fromLine], ...]
const partOf = (ln) => { let p = parts[0][0]; for (const [n, f] of parts) if (ln >= f) p = n; return p; };
const decl = new Map(); // name -> {part, kind}
const stmts = [];
for (const s of ast.body) {
  const ln = s.loc.start.line + off, part = partOf(ln);
  let names = [], kind = s.type;
  if (s.type === 'ImportDeclaration') names = s.specifiers.map((x) => x.local.name), kind = 'import';
  else if (s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') names = [s.id.name], kind = s.type === 'ClassDeclaration' ? 'class' : 'function';
  else if (s.type === 'VariableDeclaration') { kind = s.kind; for (const d of s.declarations) walk.fullAncestor; for (const d of s.declarations) { const collect = (p) => { if (p.type === 'Identifier') names.push(p.name); else if (p.type === 'ObjectPattern') p.properties.forEach((q) => collect(q.value || q.argument)); else if (p.type === 'ArrayPattern') p.elements.forEach((q) => q && collect(q)); }; collect(d.id); } }
  for (const n of names) decl.set(n, { part, kind });
  stmts.push({ ln, end: s.loc.end.line + off, part, kind, names });
}
// references & assignments per part
const refs = {}, assigns = {};
walk.fullAncestor(ast, (node, anc) => {
  if (node.type !== 'Identifier') return;
  const p = anc[anc.length - 2];
  if (p && p.type === 'MemberExpression' && p.property === node && !p.computed) return;
  if (p && (p.type === 'Property' || p.type === 'MethodDefinition') && p.key === node && !p.computed && !p.shorthand) return;
  if (!decl.has(node.name)) return;
  const part = partOf(node.loc.start.line + off), d = decl.get(node.name);
  if (d.part === part) return;
  (refs[part] ||= new Set()).add(node.name);
  if (p && ((p.type === 'AssignmentExpression' && p.left === node) || p.type === 'UpdateExpression')) (assigns[part] ||= []).push(`${node.name}@${node.loc.start.line + off} (z ${d.part})`);
});
const out = { decl: Object.fromEntries(decl), stmts, refs: Object.fromEntries(Object.entries(refs).map(([k, v]) => [k, [...v]])), assigns };
fs.writeFileSync(process.argv[6], JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(assigns)) console.log(k, ':', v.join(', '));
for (const [k, v] of Object.entries(out.refs)) console.log('REF', k, v.length);
