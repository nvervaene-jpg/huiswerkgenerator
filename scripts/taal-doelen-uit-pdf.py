#!/usr/bin/env python3
"""Zet de PDF-export van Op.stap 'Nederlands en communicatie' om naar data/taal/doelen-taal-opstap.json.
Gebruik: pdftotext -layout <pdf> uit.txt ; python3 scripts/taal-doelen-uit-pdf.py uit.txt
De tekst van de doelen wordt letterlijk overgenomen."""
import re, json, sys
txt = open(sys.argv[1], encoding='utf-8').read()
DOMEIN = {'1.2': 'Lezen', '1.3': 'Schrijven', '1.4': 'Mondeling taalgebruik', '1.5': 'Taalsysteem en taalgebruik', '1.6': 'Literatuur'}
LJ = {'1ste': 'L1', '2de': 'L2', '3de': 'L3', '4de': 'L4', '5de': 'L5', '6de': 'L6'}
LJL = {'L%d' % i: '%dste leerjaar' % i if i == 1 else '%dde leerjaar' % i for i in range(1, 7)}
LJL['L1'] = '1ste leerjaar'
page = 0
heads = []        # opeenvolgende koppen sinds laatste doel
sub = rub = None
cur = None
leerjaar = None
doelen = []
def flush():
    global cur
    if cur:
        cur['tekst'] = re.sub(r'\s+', ' ', cur['tekst']).strip()
        doelen.append(cur); cur = None
SUBS = {'Vlot en vloeiend lezen', 'Tekstbegrip', 'Tekstsoorten en tekstconventies', 'Handschrift en digitale vaardigheden',
        'Correct schrijven', 'Schrijven om te leren', 'Schrijven om te delen', 'Luisterbegrip', 'Spreken, presenteren en vertellen',
        'Mondelinge interactievaardigheden', 'Woordenschat', 'Taalsysteem (klanken, spelling, grammatica)',
        'Taalgebruik en taalwetenschap', 'Interactie met literatuur', 'Creatieve expressie in taal'}
def kop_verwerken():
    global heads, sub, rub
    for h in heads:
        if h == 'Nederlands en communicatie' or h in DOMEIN.values(): sub = rub = None
        elif h in SUBS: sub, rub = h, None
        else: rub = h
    heads = []
for raw in txt.split('\n'):
    line = raw.rstrip()
    m = re.match(r'\s*p\. (\d+) / \d+', line)
    if m: page = int(m.group(1)); continue
    if not line.strip() or line.strip() in ('Leerplanversie V1.3', '08/10/2026'): continue
    if re.match(r'^(G|\+) Routedoelen', line): continue
    m = re.match(r'^\s*(1\.\d\.GL(\d)\.\d+)\s+(.*)$', line)
    if m:
        flush(); kop_verwerken()
        code, lj, t = m.group(1), 'L' + m.group(2), m.group(3)
        cur = dict(code=code, vak='Nederlands en communicatie', domein=DOMEIN[code[:3]], subdomein=sub, rubriek=rub,
                   leerjaar=lj, leerjaarLabel=LJL[lj], route='gemeenschappelijk', tekst=t, labels=[], pagina=page, generators=[])
        continue
    m = re.match(r'^\s*(\d)(?:ste|de) leerjaar\s*$', line)
    if m: flush(); continue
    if line.startswith(' '):                       # voortzetting van een doel
        if cur: cur['tekst'] += ' ' + line.strip()
        continue
    flush()
    if heads and line[0].islower(): heads[-1] += ' ' + line.strip()   # afgebroken kop
    else: heads.append(line.strip())
flush()
# koppen die enkel een domeinnaam zijn, vervangen door sub=None indien nodig
out = {'bron': 'Op.stap - Nederlands en communicatie, leerplanversie V1.3 (export 08/10/2026)',
       'aantalDoelen': len(doelen),
       'legende': {'route': {'gemeenschappelijk': 'G-routedoelen'},
                   'leerjaar': {k: v for k, v in LJL.items()},
                   'generators': "Leeg; in te vullen met de id's van de generators die het doel oefenen"},
       'doelen': doelen}
json.dump(out, open('data/taal/doelen-taal-opstap.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(doelen))
