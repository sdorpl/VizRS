// Dzieli skrypt-moduł trio.html na moduły ES w web/trio/ (narzędzie jednorazowe, poza repo).
import fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
const WEB = process.argv[2];
const html = fs.readFileSync(WEB + '/trio.html', 'utf8');
const open = '<script type="module">\n', close = '</script>';
const s0 = html.indexOf(open) + open.length, s1 = html.indexOf(close, s0);
let code = html.slice(s0, s1);

// 0. przeniesienie deklaracji zmiennych do modułów, które je przypisują
const rep = (a, b) => { if (!code.includes(a)) throw new Error('brak: ' + a); code = code.replace(a, () => b); };
rep("let view = 'pages', busy = false;\n", '');
rep('let selId = null, draft = null, dirtyPage = false, pv = null, plId = null;', 'let selId = null, draft = null, dirtyPage = false, pv = null;');
rep('// ------------------------------------------------------------ playlisty\n', '// ------------------------------------------------------------ playlisty\nlet plId = null;\n');
rep('async function act(fn, label) {', 'let busy = false;\nasync function act(fn, label) {');
rep('// ------------------------------------------------------------ telefon i wąskie okno (dawne /mobile, układ jak w VizRS Live)\n',
  '// ------------------------------------------------------------ telefon i wąskie okno (dawne /mobile, układ jak w VizRS Live)\n/** Widok na telefonie: pages | edit | air | queue (na stanowisku widać wszystkie naraz). */\nlet view = \'pages\';\n');
rep("const $ = (s, r = document) => r.querySelector(s);\nconst $$ = (s, r = document) => [...r.querySelectorAll(s)];\n", "// deklaracje funkcji (nie stałe): moduły z cyklu importów mogą ich użyć, zanim core.js się wykona\nfunction $(s, r = document) { return r.querySelector(s); }\nfunction $$(s, r = document) { return [...r.querySelectorAll(s)]; }\n");
rep("/** Widok na telefonie: pages | edit | air | queue (na stanowisku widać wszystkie naraz). */\nconst buzz", 'const buzz');

const PARTS = [
  ['core', null, 'wspólne: skróty DOM, antena, API, komunikaty, show i stan anteny, blokady edycji'],
  ['pages', '// ------------------------------------------------------------ lista stron', 'lista stron i szablonów, wybór strony, edytor strony (pola, czas na kanale, ticker)'],
  ['preview', '// zoom podglądu: k – krotność', 'podgląd strony: zoom, kadr na element, przesuwanie'],
  ['fields', 'function renderStatus() {', 'pola strony: status, warstwa, reguły, formatowanie, edycja w podglądzie, Word Replace, skrót klawiszowy, zapis'],
  ['onair', '// ------------------------------------------------------------ podgląd lokalny', 'podgląd lokalny, monitor PGM, sterowanie anteną, warstwy na antenie'],
  ['rundown', '// ------------------------------------------------------------ playlisty', 'playlisty, zakładki, rundown, makra'],
  ['system', '// ------------------------------------------------------------ stan systemu', 'stan systemu, biblioteka show, import i eksport, klawiatura, okno natywne'],
  ['mobile', '// ------------------------------------------------------------ telefon i wąskie okno', 'telefon i wąskie okno: widoki, pasek, szuflada, instalacja'],
  ['main', '// ------------------------------------------------------------ zdarzenia z serwera', 'punkt wejścia: inicjalizacja modułów w kolejności i zdarzenia z serwera'],
];
const SETTER = { dirtyPage: 'setDirtyFlag' };
const setterOf = (n) => SETTER[n] || 'set' + n[0].toUpperCase() + n.slice(1);

function analyze(code) {
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const starts = PARTS.map(([n, m]) => (m ? code.indexOf(m) : 0));
  starts.forEach((x, i) => { if (x < 0) throw new Error('marker ' + PARTS[i][0]); });
  const partAt = (pos) => { let p = 0; starts.forEach((x, i) => { if (pos >= x) p = i; }); return PARTS[p][0]; };
  const decl = new Map(), imports = new Map();
  for (const s of ast.body) {
    const names = [];
    if (s.type === 'ImportDeclaration') { for (const sp of s.specifiers) imports.set(sp.local.name, { src: s.source.value, sp }); continue; }
    if (s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') names.push(s.id.name);
    if (s.type === 'VariableDeclaration') for (const d of s.declarations) { const c = (p) => { if (p.type === 'Identifier') names.push(p.name); else if (p.type === 'ObjectPattern') p.properties.forEach((q) => c(q.value || q.argument)); else if (p.type === 'ArrayPattern') p.elements.forEach((q) => q && c(q)); }; c(d.id); }
    for (const n of names) decl.set(n, { part: partAt(s.start), kind: s.type === 'VariableDeclaration' ? s.kind : 'fn', stmt: s });
  }
  return { ast, starts, partAt, decl, imports };
}

// 1. przypisania do zmiennych innego modułu → setter właściciela
let A = analyze(code);
const edits = [], needSetter = new Set();
walk.fullAncestor(A.ast, (node, anc) => {
  if (node.type !== 'AssignmentExpression' || node.left.type !== 'Identifier') return;
  const d = A.decl.get(node.left.name);
  if (!d || d.part === A.partAt(node.start)) return;
  if (node.operator !== '=') throw new Error('złożone przypisanie ' + node.left.name);
  const p = anc[anc.length - 2];
  if (!['ExpressionStatement', 'SequenceExpression', 'ArrowFunctionExpression'].includes(p.type)) throw new Error('przypisanie jako wartość: ' + node.left.name + ' ' + p.type);
  needSetter.add(node.left.name);
  edits.push([node.start, node.end, `${setterOf(node.left.name)}(${code.slice(node.right.start, node.right.end)})`]);
});
walk.full(A.ast, (node) => { if (node.type === 'UpdateExpression' && node.argument.type === 'Identifier') { const d = A.decl.get(node.argument.name); if (d && d.part !== A.partAt(node.start)) throw new Error('++ ' + node.argument.name); } });
edits.sort((a, b) => b[0] - a[0]).forEach(([a, b, t]) => { code = code.slice(0, a) + t + code.slice(b); });
for (const n of needSetter) { const s = setterOf(n); if (A.decl.has(s)) throw new Error('kolizja ' + s); }

// 2. podział
A = analyze(code);
const { ast, decl, imports, partAt } = A;
const ownerSetter = new Map(); // nazwa settera -> część
for (const n of needSetter) ownerSetter.set(setterOf(n), decl.get(n).part);
// odwołania między częściami
const refs = {}; PARTS.forEach(([p]) => (refs[p] = new Set()));
walk.fullAncestor(ast, (node, anc) => {
  if (node.type !== 'Identifier') return;
  const p = anc[anc.length - 2];
  if (p && p.type === 'MemberExpression' && p.property === node && !p.computed) return;
  if (p && p.type === 'Property' && p.key === node && !p.computed && !p.shorthand) return;
  if (p && (p.type === 'ImportSpecifier' || p.type === 'ImportNamespaceSpecifier' || p.type === 'ImportDefaultSpecifier')) return;
  refs[partAt(node.start)].add(node.name);
});
const exported = new Set();
for (const [p] of PARTS) for (const n of refs[p]) { const d = decl.get(n); if (d && d.part !== p) exported.add(n); }
for (const [s, p] of ownerSetter) exported.add(s);
// mapa linii wewnątrz wieloliniowych szablonów (bez wcięcia)
const noIndent = new Set();
walk.full(ast, (n) => { if (n.type === 'TemplateLiteral' && n.loc.start.line !== n.loc.end.line) for (let l = n.loc.start.line + 1; l <= n.loc.end.line; l++) noIndent.add(l); });
const lineOf = (pos) => code.slice(0, pos).split('\n').length;
const indent = (text, startPos) => { const first = lineOf(startPos); return text.split('\n').map((l, i) => (l && !noIndent.has(first + i) ? '  ' + l : l)).join('\n'); };

const out = {}; const flags = [];
PARTS.forEach(([p]) => (out[p] = { decls: [], exec: [] }));
let prevEnd = 0, lastKind = '', lastPart = '';
for (const s of ast.body) {
  // tekst instrukcji z poprzedzającymi komentarzami (od końca poprzedniej)
  const sameLine = prevEnd > 0 && !code.slice(prevEnd, s.start).includes('\n');
  let from = prevEnd; while (code[from] === '\n') from++;
  const text = sameLine ? code.slice(prevEnd, s.end).replace(/^ +/, ' ') : code.slice(from, s.end); prevEnd = s.end;
  if (s.type === 'ImportDeclaration') continue;
  const p = partAt(s.start);
  const isDecl = ['FunctionDeclaration', 'ClassDeclaration', 'VariableDeclaration'].includes(s.type);
  if (isDecl) {
    let t = text;
    const names = [...decl].filter(([, d]) => d.stmt === s).map(([n]) => n);
    if (names.some((n) => exported.has(n))) { const kw = s.start - from; t = t.slice(0, kw) + 'export ' + t.slice(kw); }
    if (sameLine && lastKind === 'decl' && lastPart === p) out[p].decls[out[p].decls.length - 1] += t; else out[p].decls.push(sameLine ? t.trimStart() : t);
    for (const n of names) if (needSetter.has(n)) out[p].decls.push(`export function ${setterOf(n)}(v) { ${n} = v; }`);
    if (s.type === 'VariableDeclaration') for (const d of s.declarations) if (d.init) { let call = false; walk.full(d.init, (x) => { if (x.type === 'CallExpression' || x.type === 'NewExpression') { if (!['ArrowFunctionExpression', 'FunctionExpression'].includes(d.init.type)) call = true; } }); if (call) flags.push(`${p}: ${code.slice(d.start, Math.min(d.end, d.start + 110))}`); }
    lastKind = 'decl'; lastPart = p;
  } else {
    if (sameLine && lastKind === 'exec' && lastPart === p) out[p].exec[out[p].exec.length - 1] += text;
    else out[p].exec.push(indent(sameLine ? text.trimStart() : text, sameLine ? s.start : from));
    lastKind = 'exec'; lastPart = p;
  }
}
const tail = code.slice(prevEnd).trim(); if (tail) throw new Error('reszta: ' + tail.slice(0, 80));

fs.mkdirSync(WEB + '/trio', { recursive: true });
const files = [];
for (const [p, , desc] of PARTS) {
  const lines = [`// Trio – ${desc}.`, ''];
  // importy zewnętrzne
  const ext = new Map();
  for (const n of refs[p]) { const im = imports.get(n); if (!im) continue; const l = ext.get(im.src) || []; l.push(im.sp); ext.set(im.src, l); }
  const order = [...new Set([...imports.values()].map((i) => i.src))];
  for (const src of order) {
    const sps = ext.get(src); if (!sps) continue;
    const ns = sps.find((x) => x.type === 'ImportNamespaceSpecifier');
    if (ns) lines.push(`import * as ${ns.local.name} from '${src}';`);
    const named = sps.filter((x) => x.type === 'ImportSpecifier').sort((a, b) => [...imports.keys()].indexOf(a.local.name) - [...imports.keys()].indexOf(b.local.name));
    if (named.length) lines.push(`import { ${named.map((x) => x.local.name).join(', ')} } from '${src}';`);
  }
  // importy wewnętrzne
  for (const [q] of PARTS) {
    if (q === p) continue;
    const names = [...refs[p]].filter((n) => (decl.get(n)?.part === q && exported.has(n)) || ownerSetter.get(n) === q);
    if (p === 'main') { /* init dopisany niżej */ }
    if (names.length) lines.push(`import { ${names.sort().join(', ')} } from './${q}.js';`);
  }
  lines.push('');
  lines.push(out[p].decls.join('\n'));
  if (p !== 'main') {
    if (out[p].exec.length) {
      lines.push('', '/** Zdarzenia i stan początkowy; woła main.js, moduły w kolejności dawnego skryptu. */', 'export function init() {', out[p].exec.join('\n'), '}');
    }
  } else {
    lines.push('', ...PARTS.filter(([q]) => q !== 'main' && out[q].exec.length).map(([q]) => `${q}Init();`));
    lines.push(out[p].exec.join('\n').replace(/^  /gm, ''));
  }
  let text = lines.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
  if (p === 'main') {
    const inits = PARTS.filter(([q]) => q !== 'main' && out[q].exec.length).map(([q]) => `import { init as ${q}Init } from './${q}.js';`).join('\n');
    text = text.replace('\n\n', '\n\n' + inits + '\n');
  }
  fs.writeFileSync(`${WEB}/trio/${p}.js`, text);
  files.push(p);
}
const newHtml = html.slice(0, s0 - open.length) + '<script type="module" src="/trio/main.js"></script>' + html.slice(s1 + close.length);
fs.writeFileSync(WEB + '/trio.html', newHtml);
console.log('setters:', [...needSetter].map(setterOf).join(' '));
console.log('flags (inicjalizatory z wywołaniami):\n  ' + flags.join('\n  '));
