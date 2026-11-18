"""Przenosi elementy najwyższego poziomu pliku Rust do nowych modułów (narzędzie jednorazowe, poza repo).
Użycie: python3 rsmove.py PLIK SPEC.json
SPEC: {"parent_vis": "pub(crate)", "modules": {"nazwa": {"doc": "...", "items": ["fn_a", "CONST_B", ...], "uses": ["..."]}},
       "insert_after": "linia w pliku, po której dopisać `mod …;`", "glob": true}
Elementy: fn, struct, enum, const, static, type, impl <Nazwa> (klucz "impl Nazwa"). Komentarze /// i atrybuty #[…]
nad elementem idą razem z nim. Prywatne elementy dostają widoczność parent_vis. Treść bez zmian."""
import json, re, sys

path, spec = sys.argv[1], json.load(open(sys.argv[2]))
L = open(path).read().split('\n')
test_at = next((i for i, l in enumerate(L) if l == '#[cfg(test)]' and i + 1 < len(L) and re.match(r'^mod tests', L[i + 1])), len(L))

ITEM = re.compile(r'^(pub(\([a-z]+\))? )?(async )?(unsafe )?(fn|struct|enum|const|static|type|trait|impl(<[^>]*>)?|macro_rules!) ?([A-Za-z_][A-Za-z0-9_]*)?')
starts = []
i = 0
while i < test_at:
    l = L[i]
    m = ITEM.match(l)
    if m and not l.startswith(' '):
        kind = m.group(5)
        if kind.startswith('impl'):
            rest = l[m.end(5):].strip()
            name = 'impl ' + re.split(r'[ <{]', rest.split(' for ')[-1].strip())[0]
        else:
            name = m.group(7)
        j = i
        while j > 0 and (L[j - 1].startswith('///') or L[j - 1].startswith('#[') or L[j - 1].startswith('//!') is False and L[j - 1].startswith('// ') and False):
            j -= 1
        starts.append((j, i, name, kind))
    i += 1


def end_of(decl):
    # koniec elementu: dopasowanie nawiasów od linii deklaracji (pomija napisy i komentarze w prosty sposób)
    depth, k, seen = 0, decl, False
    while k < len(L):
        s = re.sub(r'//.*$', '', L[k])
        s = re.sub(r'"(\\.|[^"\\])*"', '""', s)
        s = re.sub(r"'(\\.|[^'\\])'", "''", s)
        for ch in s:
            if ch in '{(':
                depth += 1; seen = True
            elif ch in '})':
                depth -= 1
        if (seen and depth <= 0) or (not seen and s.rstrip().endswith(';')):
            return k
        k += 1
    raise Exception('koniec elementu nie znaleziony: %d' % decl)


# raw string r#"…"# – liczenie nawiasów w środku psuje wynik; obsłuż: element zaczyna się od const X: &str = r#"
def end_item(decl):
    # kod po rustfmt: element jednowierszowy kończy się w tej samej linii, wielowierszowy – pierwszą linią w kolumnie 0
    l = L[decl].rstrip()
    if l.endswith(';') or (l.endswith('}') and '{' in l):
        return decl
    # stan napisu na początku każdej linii (zwykły "…" z ucieczkami, surowy r#"…"#), żeby tekst w kolumnie 0 nie kończył elementu
    in_str = None
    k = decl
    while k < len(L):
        line = L[k]
        if k > decl and in_str is None and (re.match(r'^[}\]]', line) or re.match(r'^\);?\s*$', line)):
            return k
        x = 0
        while x < len(line):
            c = line[x]
            if in_str == 'n':
                if c == '\\':
                    x += 2; continue
                if c == '"':
                    in_str = None
            elif in_str == 'r':
                if line.startswith('"#', x):
                    in_str = None; x += 2; continue
            else:
                if line.startswith('//', x):
                    break
                if line.startswith('r#"', x):
                    in_str = 'r'; x += 3; continue
                if c == '"':
                    in_str = 'n'
                elif c == "'" and re.match(r"'(\\.|[^'\\])'", line[x:]):
                    x += len(re.match(r"'(\\.|[^'\\])'", line[x:]).group(0)); continue
            x += 1
        if k > decl and in_str is None and not line.startswith(' ') and line.rstrip().endswith(';'):
            return k
        k += 1
    raise Exception('koniec elementu nie znaleziony: %d (%s)' % (decl + 1, L[decl]))


items = {}
for (j, decl, name, kind) in starts:
    e = end_item(decl)
    items.setdefault(name, []).append((j, e))

vis = spec.get('parent_vis', 'pub(crate)')
moved = set()
out_mods = {}
for mod, m in spec['modules'].items():
    body = ['//! ' + m['doc'], '']
    body += m.get('uses', ['use super::*;'])
    body.append('')
    for it in m['items']:
        if it not in items:
            raise Exception('brak elementu: ' + it)
        for (a, b) in items[it]:
            chunk = L[a:b + 1]
            # widoczność
            for x, l in enumerate(chunk):
                if ITEM.match(l) and not l.startswith(' '):
                    if l.startswith('impl') and ' for ' in l:
                        pass
                    elif l.startswith('impl'):
                        # blok impl: widoczność dostają prywatne metody
                        for y in range(x + 1, len(chunk)):
                            if re.match(r'^    (const |async |unsafe )*fn ', chunk[y]):
                                chunk[y] = '    ' + vis + ' ' + chunk[y][4:]
                    elif not l.startswith('pub'):
                        chunk[x] = vis + ' ' + l
                    break
            body += chunk + ['']
            moved.update(range(a, b + 1))
    out_mods[mod] = '\n'.join(body).rstrip('\n') + '\n'

# usuń przeniesione linie (i jedną pustą po każdym bloku)
new = []
skip_blank = False
for i, l in enumerate(L):
    if i in moved:
        skip_blank = True
        continue
    if skip_blank and l == '':
        skip_blank = False
        continue
    skip_blank = False
    new.append(l)
text = '\n'.join(new)
anchor = spec['insert_after']
assert anchor in text, anchor
decls = ''.join(f'\nmod {m};' for m in spec['modules'])
gv = spec.get('glob_vis', '')
globs = ''.join(f'\n{gv + " " if gv else ""}use {m}::*;' for m in spec['modules']) if spec.get('glob', True) else ''
text = text.replace(anchor, anchor + decls + (('\n' + globs) if globs else ''), 1)
open(path, 'w').write(text)
import os
d = spec.get('out_dir') or os.path.dirname(path)
os.makedirs(d, exist_ok=True)
for mod, t in out_mods.items():
    open(os.path.join(d, mod + '.rs'), 'w').write(t)
print('przeniesiono', len(moved), 'wierszy do', ', '.join(out_mods))
