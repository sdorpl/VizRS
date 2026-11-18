import json, os, sys
d = sys.argv[1]
o = sorted(f for f in os.listdir(d + '/old') if f.endswith('.json'))
n = sorted(f for f in os.listdir(d + '/new') if f.endswith('.json'))
print(len(o), len(n), 'zgodne nazwy' if o == n else 'RÓŻNE NAZWY')
bad = 0
for f in o:
    a = json.load(open(f'{d}/old/{f}')); b = json.load(open(f'{d}/new/{f}'))
    for x, y in zip(a, b):
        if x != y:
            bad += 1
            if bad <= 8:
                # pierwsze miejsce różnicy
                sa, sb = json.dumps(x), json.dumps(y)
                i = next((k for k in range(min(len(sa), len(sb))) if sa[k] != sb[k]), min(len(sa), len(sb)))
                print(f, x[0] if x else None, '\n  stara:', sa[max(0, i - 80):i + 80], '\n  nowa :', sb[max(0, i - 80):i + 80])
print('różne panele:', bad)
