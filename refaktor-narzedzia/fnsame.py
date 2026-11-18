"""Funkcje okien o tej samej nazwie w trzech repo: identyczne (po normalizacji białych znaków) czy nie."""
import re, os, glob
H = os.path.expanduser('~/Nextcloud/GitHub')
repos = {
    'S': f'{H}/VizRS CG System/source/shell/src',
    'A': f'{H}/VizRS CG Artist/src',
    'P': f'{H}/VizRS CG Playout/panel/desktop/src',
}


def fns(d):
    out = {}
    for f in glob.glob(d + '/*.rs'):
        L = open(f).read().split('\n')
        for i, l in enumerate(L):
            m = re.match(r'^(pub(\([a-z]+\))? )?fn ([a-z_0-9]+)', l)
            if not m:
                continue
            j = i + 1
            while j < len(L) and not re.match(r'^}', L[j]):
                j += 1
            body = '\n'.join(L[i:j + 1])
            body = re.sub(r'pub(\([a-z]+\))? ', '', body)
            out[m.group(3)] = (os.path.basename(f), re.sub(r'\s+', '', body))
    return out


F = {k: fns(v) for k, v in repos.items()}
names = sorted(set(F['S']) & set(F['A']) & set(F['P']))
for n in names:
    s, a, p = F['S'][n], F['A'][n], F['P'][n]
    same = (s[1] == a[1]) + (s[1] == p[1]) + (a[1] == p[1])
    print(f'{n:22} S:{s[0]:10} A:{a[0]:10} P:{p[0]:10} ' + ('IDENTYCZNE' if s[1] == a[1] == p[1] else f'różne (zgodne pary: {same})'))
