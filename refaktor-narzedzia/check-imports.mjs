// Sprawdza moduły ES w katalogu: przypisanie do zaimportowanego wiązania (każda postać), import nieistniejącego eksportu.
import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
const dir = process.argv[2];
const mods = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const code = fs.readFileSync(path.join(dir, f), 'utf8');
  mods[f] = { code, ast: acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true }) };
}
let bad = 0;
const exportsOf = (ast) => {
  const s = new Set();
  for (const n of ast.body) {
    if (n.type !== 'ExportNamedDeclaration') continue;
    const d = n.declaration;
    if (d?.id) s.add(d.id.name);
    if (d?.declarations) for (const x of d.declarations) if (x.id.type === 'Identifier') s.add(x.id.name);
    for (const sp of n.specifiers || []) s.add(sp.exported.name);
  }
  return s;
};
for (const [f, { ast }] of Object.entries(mods)) {
  const imported = new Set();
  for (const n of ast.body) {
    if (n.type !== 'ImportDeclaration') continue;
    const src = n.source.value;
    for (const sp of n.specifiers) {
      imported.add(sp.local.name);
      if (src.startsWith('./') && sp.type === 'ImportSpecifier') {
        const m = mods[path.basename(src)];
        if (!m || !exportsOf(m.ast).has(sp.imported.name)) { console.log(`${f}: ${src} nie eksportuje ${sp.imported.name}`); bad++; }
      }
    }
  }
  // wiązania lokalne zasłaniające import (parametry, zmienne w funkcjach) – pomiń przypisania do nich
  const targets = (p, out) => {
    if (!p) return;
    if (p.type === 'Identifier') out.push(p);
    else if (p.type === 'ArrayPattern') p.elements.forEach((e) => targets(e, out));
    else if (p.type === 'ObjectPattern') p.properties.forEach((q) => targets(q.value || q.argument, out));
    else if (p.type === 'AssignmentPattern') targets(p.left, out);
    else if (p.type === 'RestElement') targets(p.argument, out);
  };
  walk.ancestor(ast, {
    AssignmentExpression(n, _, anc) { check(n.left, anc); },
    UpdateExpression(n, _, anc) { check(n.argument, anc); },
    ForOfStatement(n, _, anc) { if (n.left.type !== 'VariableDeclaration') check(n.left, anc); },
    ForInStatement(n, _, anc) { if (n.left.type !== 'VariableDeclaration') check(n.left, anc); },
  });
  function shadowed(name, anc) {
    for (const a of anc) {
      const fn = ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(a.type) ? a : null;
      const scopeBody = fn ? [fn.body] : a.type === 'BlockStatement' || a.type === 'Program' ? [a] : [];
      if (fn) { const ps = []; fn.params.forEach((q) => targets(q, ps)); if (ps.some((x) => x.name === name)) return true; }
      for (const b of scopeBody) {
        if (!b || b.type !== 'BlockStatement') continue;
        for (const st of b.body) if (st.type === 'VariableDeclaration') { const ids = []; st.declarations.forEach((d) => targets(d.id, ids)); if (ids.some((x) => x.name === name)) return true; }
      }
      if ((a.type === 'ForStatement' || a.type === 'ForOfStatement' || a.type === 'ForInStatement') && a.init?.type === 'VariableDeclaration') { const ids = []; a.init.declarations.forEach((d) => targets(d.id, ids)); if (ids.some((x) => x.name === name)) return true; }
      if ((a.type === 'ForOfStatement' || a.type === 'ForInStatement') && a.left?.type === 'VariableDeclaration') { const ids = []; a.left.declarations.forEach((d) => targets(d.id, ids)); if (ids.some((x) => x.name === name)) return true; }
      if (a.type === 'CatchClause' && a.param) { const ids = []; targets(a.param, ids); if (ids.some((x) => x.name === name)) return true; }
    }
    return false;
  }
  function check(p, anc) {
    const ids = []; targets(p, ids);
    for (const id of ids) if (imported.has(id.name) && !shadowed(id.name, anc)) { console.log(`${f}:${id.loc.start.line}: przypisanie do importu ${id.name}`); bad++; }
  }
}
console.log(bad ? `${bad} problemów` : 'importy i przypisania w porządku');
process.exit(bad ? 1 : 0);
