// Rationale getallen: breuk of procent van een getal, omzetten tussen breuk, kommagetal en procent, vergelijken en ordenen,
// decimale getallen (plaats, splitsen, afronden), bewerkingen met breuken en met decimale getallen.
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { fmt, fmtDec, ggd, kgv } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const NBSP = ' ';
const opdracht = (invullen, kiezen = 'Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && x !== antwoord && !Number.isNaN(x)))];
export const breuk = (a, b) => { const g = ggd(Math.abs(a), b); const n = a / g, d = b / g; return d === 1 ? String(n) : `${n}/${d}`; };
const ruw = (a, b) => `${a}/${b}`;
export const dec = (h) => { const s = String(h).padStart(3, '0'), e = s.slice(0, -2), f = s.slice(-2).replace(/0+$/, ''); return f ? `${e},${f}` : e; };

/* ------------------------------------------------------------------ breuk of procent van een getal */
const bkdOpgave = (r, p) => {
  const t = kies(r, p.types);
  switch (t) {
    case 'halfdubbel': {
      const w = kies(r, ['helft', 'kwart', 'dubbel']), n = r.geheel(1, 12) * 4 * (p.jaar >= 3 ? r.geheel(1, 5) : 1);
      if (w === 'helft') return { vraag: `De helft van ${n} is ____`, antwoord: n / 2, fouten: [n / 4, n * 2, n - 2].map(String), kern: `h${n}`, moeilijkheid: [n], data: { bkd: t, soort: w, n } };
      if (w === 'kwart') return { vraag: `Een kwart van ${n} is ____`, antwoord: n / 4, fouten: [n / 2, n * 4, n - 4].map(String), kern: `k${n}`, moeilijkheid: [n], data: { bkd: t, soort: w, n } };
      return { vraag: `Het dubbel van ${n} is ____`, antwoord: n * 2, fouten: [n / 2, n + 2, n * 4].map(String), kern: `d${n}`, moeilijkheid: [n], data: { bkd: t, soort: w, n } };
    }
    case 'breuk-van': {
      const b = r.geheel(2, Math.min(p.noemer, 12)), a = r.geheel(1, b - 1), k = r.geheel(1, 12), n = b * k;
      return { vraag: `${ruw(a, b)} van ${n} = ____`, antwoord: a * k, fouten: uniek([k, a * n, n - a, n / a, a + k], a * k).filter(Number.isInteger).map(String), kern: `bv${a}.${b}.${n}`, moeilijkheid: [b, k], data: { bkd: t, a, b, n } };
    }
    case 'procent-van': {
      const pct = kies(r, p.jaar >= 5 ? [10, 20, 25, 50, 75, 5, 30, 40, 60, 80, 90, 15] : [10, 25, 50]), stap = 100 / ggd(pct, 100), n = stap * r.geheel(1, 8);
      return { vraag: `${pct} % van ${n} = ____`, antwoord: pct * n / 100, fouten: uniek([n - pct, pct, n * pct / 10, pct * n / 1000 === Math.floor(pct * n / 1000) ? pct * n / 1000 : pct + n / 10, n / pct], pct * n / 100).filter(Number.isInteger).map(String), kern: `pv${pct}.${n}`, moeilijkheid: [pct, n], data: { bkd: t, pct, n } };
    }
    case 'geheel': {
      const procent = p.noemer === 100 && r.volgende() < 0.5;
      if (procent) { const pct = kies(r, [10, 20, 25, 50, 75]), G = (100 / ggd(pct, 100)) * r.geheel(1, 8), deel = pct * G / 100; return { vraag: `${pct} % van een getal is ${deel}. Het getal is ____`, antwoord: G, fouten: uniek([deel * pct, deel + pct, deel * 2, G + deel], G).map(String), kern: `gp${pct}.${G}`, moeilijkheid: [pct], data: { bkd: 'geheel-procent', pct, G, deel } }; }
      const b = r.geheel(2, Math.min(p.noemer, 10)), a = r.geheel(1, b + (p.jaar >= 3 ? 2 : -1)), k = r.geheel(1, 9), G = b * k, deel = a * k;
      if (a === 0 || a === b || ggd(a, b) !== 1) return null;
      return { vraag: `${ruw(a, b)} van een getal is ${deel}. Het getal is ____`, antwoord: G, fouten: uniek([deel * b, deel + b, deel / a, G + k, deel * a].filter(Number.isInteger), G).map(String), kern: `g${a}.${b}.${k}`, moeilijkheid: [b, k], data: { bkd: t, a, b, G, deel } };
    }
    case 'benoem': {
      const G = kies(r, [4, 5, 8, 10, 20, 25, 50, 100]), deel = r.geheel(1, G - 1);
      if (r.volgende() < 0.5 && 100 % G === 0) return { vraag: `${deel} van ${G} is ____ %`, antwoord: deel * 100 / G, fouten: uniek([deel, G - deel, deel * 10, (deel * 100) / G + 5], deel * 100 / G).map(String), kern: `bp${deel}.${G}`, moeilijkheid: [G], data: { bkd: t, soort: 'procent', deel, G } };
      return { vraag: `${deel} van ${G} is de breuk ____`, antwoord: breuk(deel, G), fouten: uniek([ruw(G, deel), breuk(G - deel, G), deel === 1 ? ruw(2, G) : ruw(deel, G + 1), ruw(deel, G) === breuk(deel, G) ? ruw(deel, G * 2) : ruw(deel, G)], breuk(deel, G)), kern: `bb${deel}.${G}`, moeilijkheid: [G], data: { bkd: t, soort: 'breuk', deel, G } };
    }
    default: return null;
  }
};
export const BREUKDEEL_VORMEN = maakOpgaveVormen({
  id: 'bkd', titel: 'Breuk of procent van een getal', doelen: AUTO_DOELEN.bkd || [], parameters: K.breukDeelParameters, standaard: { types: ['breuk-van', 'geheel'], noemer: 20, jaar: 4 },
  opdracht: opdracht('Los op. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: bkdOpgave,
});

/* ------------------------------------------------------------------ omzetten */
const BEKENDE = { 4: [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10]], 5: [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [1, 25], [3, 25], [1, 50], [7, 50], [13, 100], [37, 100]] };
const PARAAT = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [1, 20], [1, 100]];
const honderdsten = (a, b) => (a * 100 * 100) / b / 100 * 1;       // a/b als honderdsten (b deelt 100)
const komma = (h) => { const s = String(h).padStart(3, '0'); const e = s.slice(0, -2), d = s.slice(-2).replace(/0$/, ''); return d ? `${e},${d}` : e; };
const omzOpgave = (r, p) => {
  const t = kies(r, p.types);
  switch (t) {
    case 'gelijkwaardig': { const b = r.geheel(2, 10), a = r.geheel(1, b - 1), k = r.geheel(2, 5); if (b * k > Math.max(20, p.noemer)) return null; return { vraag: `${ruw(a, b)} = ____/${b * k}`, antwoord: a * k, fouten: uniek([a + k, a, b * k, a * b], a * k).map(String), kern: `gw${a}.${b}.${k}`, moeilijkheid: [b, k], data: { omz: t, a, b, k } }; }
    case 'vereenvoudig': { const b = r.geheel(2, 10), a = r.geheel(1, b - 1); if (ggd(a, b) !== 1) return null; const k = r.geheel(2, 5), B = b * k; if (B > p.noemer) return null; return { vraag: `${ruw(a * k, B)} = ____/${b}`, antwoord: a, fouten: uniek([a * k, a + 1, a - 1, k], a).map(String), kern: `vz${a}.${b}.${k}`, moeilijkheid: [B], data: { omz: t, a, b, k } }; }
    case 'gelijknamig': { const b1 = kies(r, [2, 3, 4, 5, 6]), b2 = kies(r, [2, 3, 4, 5, 6, 8, 10]); if (b1 === b2 || kgv(b1, b2) > p.noemer) return null; const a1 = r.geheel(1, b1 - 1), a2 = r.geheel(1, b2 - 1), L = kgv(b1, b2), ant = a1 * L / b1; return { vraag: `${ruw(a1, b1)} en ${ruw(a2, b2)} gelijknamig maken: ${ruw(a1, b1)} = ____/${L}`, antwoord: ant, fouten: uniek([a1 + L - b1, a1, a1 * b2, L], ant).map(String), kern: `gn${a1}.${b1}.${a2}.${b2}`, moeilijkheid: [L], data: { omz: t, a1, b1, a2, b2, L } }; }
    case 'dec-breuk': { const [a, b] = kies(r, BEKENDE[p.jaar >= 5 || p.noemer === 100 ? 5 : 4]), h = (a * 100) / b; if (!Number.isInteger(h)) return null; if (r.volgende() < 0.5) return { vraag: `${ruw(a, b)} = ____ (kommagetal)`, antwoord: dec(h), fouten: uniek([b < 10 ? `0,${a}${b}` : `${a},${b}`, a < 10 ? `0,0${a}` : dec(h * 10), dec(h * 10), dec(Math.round(h / 10)) ], dec(h)), kern: `db${a}.${b}`, moeilijkheid: [b], data: { omz: t, a, b, h, richting: 'breuk-naar-dec' } }; return { vraag: `${dec(h)} = ____ (breuk)`, antwoord: breuk(a, b), fouten: uniek([ruw(h, 100) === breuk(a, b) ? ruw(h, 10) : ruw(h, 100), `1/${h}`, breuk(b, a)], breuk(a, b)), kern: `bd${a}.${b}`, moeilijkheid: [b], data: { omz: t, a, b, h, richting: 'dec-naar-breuk' } }; }
    case 'breuk-procent': { const [a, b] = kies(r, BEKENDE[5]), pct = (a * 100) / b; if (!Number.isInteger(pct)) return null; return { vraag: `${ruw(a, b)} = ____ %`, antwoord: pct, fouten: uniek([a * 10, pct + 5, pct / 2, 100 / b, a], pct).filter(Number.isInteger).map(String), kern: `bp${a}.${b}`, moeilijkheid: [b], data: { omz: t, a, b, pct } }; }
    case 'procent-dec': { const h = r.geheel(1, 99); if (r.volgende() < 0.5) return { vraag: `${h} % = ____ (kommagetal)`, antwoord: dec(h), fouten: uniek([dec(h * 10), dec(Math.floor(h / 10)), `${h},0`], dec(h)), kern: `pd${h}`, moeilijkheid: [h], data: { omz: t, h, richting: 'procent-naar-dec' } }; return { vraag: `${dec(h)} = ____ %`, antwoord: h, fouten: uniek([h / 10, h * 10, 100 - h], h).filter(x => Number.isInteger(x)).map(String), kern: `dp${h}`, moeilijkheid: [h], data: { omz: t, h, richting: 'dec-naar-procent' } }; }
    case 'paraat': { const [a, b] = kies(r, PARAAT), pct = (a * 100) / b; if (r.volgende() < 0.6) return { vraag: `${ruw(a, b)} = ____ %`, antwoord: pct, fouten: uniek([a * 10, 100 / (a + b), pct * 2, 50], pct).filter(Number.isInteger).map(String), kern: `pa${a}.${b}`, moeilijkheid: [b], data: { omz: t, a, b, pct, richting: 'breuk-naar-procent' } }; return { vraag: `${pct} % = ____ (breuk)`, antwoord: breuk(a, b), fouten: uniek([ruw(pct, 10), ruw(1, pct), ruw(pct, 100) === breuk(a, b) ? ruw(pct, 1000) : ruw(pct, 100)], breuk(a, b)), kern: `ap${a}.${b}`, moeilijkheid: [b], data: { omz: t, a, b, pct, richting: 'procent-naar-breuk' } }; }
    default: return null;
  }
};
export const OMZETTEN_VORMEN = maakOpgaveVormen({
  id: 'omz', titel: 'Breuk, kommagetal en procent', doelen: AUTO_DOELEN.omz || [], parameters: K.omzetParameters, standaard: { types: ['gelijkwaardig', 'vereenvoudig', 'dec-breuk'], noemer: 20, jaar: 4 },
  opdracht: opdracht('Vul het ontbrekende getal of de ontbrekende breuk in.', 'Kies het juiste antwoord. Omcirkel.'), opgave: omzOpgave,
});

/* ------------------------------------------------------------------ vergelijken en ordenen */
const GETALLEN_POOL = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10], [3, 20], [9, 20], [11, 20], [1, 25], [3, 25], [7, 50]];
const vergelijk = (x, y) => x.n * y.d - y.n * x.d;                    // teken = teken van x - y
const toonGetal = (g, vorm) => (vorm === 'breuk' ? ruw(g.n, g.d) : vorm === 'dec' ? dec(g.n * 100 / g.d) : `${g.n * 100 / g.d} %`);
const bvgGetal = (r, type) => {
  if (type === 'dec') { const h = r.geheel(1, 99); return { n: h, d: 100, vorm: 'dec' }; }
  const [n, d] = kies(r, GETALLEN_POOL); const vormen = type === 'gemengd' ? ['breuk', 'dec', 'procent'] : ['breuk'];
  let vorm = kies(r, vormen); if (vorm !== 'breuk' && 100 % d !== 0) vorm = 'breuk';
  return { n, d, vorm };
};
const bvgOpgave = (r, p) => {
  const t = kies(r, p.types), type = t === 'dec' ? 'dec' : t === 'gemengd' ? 'gemengd' : 'breuk';
  const maakGetal = () => {
    if (t === 'gl') return null;
    return bvgGetal(r, type);
  };
  if (r.volgende() < 0.35) {                                     // ordenen
    const lijst = [];
    if (t === 'gl') { const d = r.geheel(5, 12), noemers = new Set(); while (noemers.size < 3) noemers.add(r.geheel(1, d - 1)); [...noemers].forEach(n => lijst.push({ n, d, vorm: 'breuk' })); }
    else { for (let i = 0; i < 40 && lijst.length < 3; i++) { const g = maakGetal(); if (!lijst.some(x => vergelijk(x, g) === 0)) lijst.push(g); } }
    if (lijst.length < 3) return null;
    const goed = [...lijst].sort(vergelijk), door = r.schud(lijst);
    if (door.every((g, i) => g === goed[i])) return null;
    const toon = (g) => toonGetal(g, g.vorm), juist = goed.map(toon).join(' < ');
    const fout1 = [...goed].reverse().map(toon).join(' < '), fout2 = [goed[1], goed[0], goed[2]].map(toon).join(' < '), fout3 = [goed[0], goed[2], goed[1]].map(toon).join(' < ');
    return { vraag: `Zet van klein naar groot: ${door.map(toon).join(',  ')}  →  ____`, antwoord: juist, fouten: uniek([fout1, fout2, fout3], juist), kern: `o${goed.map(toon).join('|')}`, moeilijkheid: [3], data: { bvg: 'orden', waarden: door.map(g => ({ n: g.n, d: g.d })), goed: goed.map(g => ({ n: g.n, d: g.d })) } };
  }
  let x, y;
  if (t === 'gl') { const d = r.geheel(3, 12); x = { n: r.geheel(1, d - 1), d, vorm: 'breuk' }; y = { n: r.geheel(1, d - 1), d, vorm: 'breuk' }; }
  else { x = maakGetal(); y = maakGetal(); }
  if (vergelijk(x, y) === 0 && r.volgende() < 0.7) return null;
  const teken = vergelijk(x, y) < 0 ? '<' : vergelijk(x, y) > 0 ? '>' : '=';
  return { vraag: `${toonGetal(x, x.vorm)}  ____  ${toonGetal(y, y.vorm)}`, antwoord: teken, fouten: ['<', '>', '='].filter(z => z !== teken), kern: `v${toonGetal(x, x.vorm)}${toonGetal(y, y.vorm)}`, moeilijkheid: [x.d + y.d], data: { bvg: 'vergelijk', x: { n: x.n, d: x.d }, y: { n: y.n, d: y.d } } };
};
export const RATIONAAL_VERGELIJK_VORMEN = maakOpgaveVormen({
  id: 'bvg', titel: 'Breuken en decimale getallen vergelijken en ordenen', doelen: AUTO_DOELEN.bvg || [], parameters: K.rationaalVergelijkParameters, standaard: { types: ['gl', 'ong'], jaar: 4 },
  opdracht: opdracht('Vergelijk of orden. Schrijf <, > of = (of de volgorde) op de lijn.', 'Kies het juiste teken of de juiste volgorde. Omcirkel.'), opgave: bvgOpgave,
});

/* ------------------------------------------------------------------ decimale getallen */
const PLAATSNAAM = ['E', 't', 'h', 'd'];
const plaatsNaam = { 1: 'tienden', 2: 'honderdsten', 3: 'duizendsten' };
const decTekst = (E, ds) => `${E},${ds.join('')}`;
const dcmOpgave = (r, p) => {
  const t = kies(r, p.types), ndec = p.decimalen;
  const E = r.geheel(0, 99), ds = Array.from({ length: ndec }, () => r.geheel(0, 9));
  if (ds.every(x => x === 0) || (ds.at(-1) === 0 && t !== 'plaats')) return null;
  const tekst = decTekst(E, ds);
  if (t === 'plaats') {
    const i = r.geheel(0, ndec - 1), c = ds[i];
    if (c === 0 || ds.filter(x => x === c).length > 1 || String(E).includes(String(c))) return null;
    return { vraag: `In ${tekst} staat het cijfer ${c} op de plaats van de ____`, antwoord: plaatsNaam[i + 1], fouten: [1, 2, 3].filter(k => k !== i + 1 && k <= Math.max(ndec, 3)).map(k => plaatsNaam[k]).concat(['eenheden']).slice(0, 3), kern: `dpl${tekst}.${c}`, moeilijkheid: [ndec], data: { dcm: t, tekst, cijfer: c, plaats: plaatsNaam[i + 1] } };
  }
  if (t === 'dec-splits') {
    const i = r.geheel(0, ndec - 1), delen = [`${E} E`, ...ds.map((c, k) => (k === i ? `____ ${PLAATSNAAM[k + 1]}` : `${c} ${PLAATSNAAM[k + 1]}`))];
    return { vraag: `${tekst} = ${delen.join(' + ')}`, antwoord: String(ds[i]), fouten: uniek([ds[i] + 1, ds[i] - 1, (ds[i] + 5) % 10, E % 10].filter(x => x >= 0 && x <= 99).map(String), String(ds[i])), kern: `dsp${tekst}.${i}`, moeilijkheid: [ndec], data: { dcm: t, tekst, plaats: PLAATSNAAM[i + 1], cijfer: ds[i], E, ds } };
  }
  if (t === 'dec-samenstel') {
    const delen = [`${E} E`, ...ds.map((c, k) => `${c} ${PLAATSNAAM[k + 1]}`)];
    return { vraag: `${delen.join(' + ')} = ____`, antwoord: tekst, fouten: uniek([decTekst(E, [...ds].reverse()), decTekst(E, ds.map((c, k) => (k === 0 ? 0 : c))), `${E}${ds.join('')}`.replace(/^0+(?=\d)/, '') ], tekst), kern: `dsa${tekst}`, moeilijkheid: [ndec], data: { dcm: t, tekst, E, ds } };
  }
  // afronden op eenheid, tiende of honderdste
  const eenheden = ndec === 3 ? [0, 1, 2] : [0, 1], m = kies(r, eenheden), duizendsten = E * 1000 + Number(ds.join('').padEnd(3, '0')), stap = 10 ** (3 - m);
  const afgerond = Math.floor((duizendsten + stap / 2) / stap) * stap, naam = ['een eenheid', 'een tiende', 'een honderdste'][m];
  if (duizendsten % stap === 0) return null;
  const toon = (x) => fmtDec(Math.round(x / (m === 2 ? 10 : 10)), 2).replace(/,?0+$/, '').replace(/,$/, '');
  const als = (x) => { const e = Math.floor(x / 1000), rest = String(x % 1000).padStart(3, '0'); const cut = rest.slice(0, m).replace(/0+$/, ''); return m === 0 || !cut ? String(e) : `${e},${rest.slice(0, m)}`; };
  void toon;
  return { vraag: `Rond ${tekst.replace(/,?0+$/, '')} af op ${naam}: ____`, antwoord: als(afgerond), fouten: uniek([als(Math.floor(duizendsten / stap) * stap), als(Math.floor(duizendsten / stap) * stap + stap), als(afgerond + stap * 10), als(Math.floor((duizendsten + 500) / 1000) * 1000)], als(afgerond)), kern: `daf${tekst}.${m}`, moeilijkheid: [ndec, m], data: { dcm: 'dec-afronden', duizendsten, m, afgerond, tekst: tekst.replace(/,?0+$/, '') } };
};
export const DECIMAAL_VORMEN = maakOpgaveVormen({
  id: 'dcm', titel: 'Decimale getallen', doelen: AUTO_DOELEN.dcm || [], parameters: K.decimaalParameters, standaard: { types: ['plaats', 'dec-splits', 'dec-samenstel'], decimalen: 2, jaar: 4 },
  opdracht: opdracht('Vul het ontbrekende woord of getal in.', 'Kies het juiste antwoord. Omcirkel.'), opgave: dcmOpgave,
});

/* ------------------------------------------------------------------ bewerkingen met breuken */
const sorteerBreuk = ({ n, d }) => { const g = ggd(n, d); return { n: n / g, d: d / g }; };
const toonB = ({ n, d }) => (d === 1 ? String(n) : `${n}/${d}`);
const bkbOpgave = (r, p) => {
  const t = kies(r, p.types), noemers = [2, 3, 4, 5, 6, 8, 10, 12];
  if (t === 'gl+' || t === 'gl-') {
    const d = r.geheel(3, Math.min(p.noemer, 12)), x = r.geheel(1, d - 1), y = r.geheel(1, d - 1);
    if (t === 'gl-') { if (x <= y) return null; const ant = sorteerBreuk({ n: x - y, d }); return { vraag: `${ruw(x, d)} − ${ruw(y, d)} = ____`, antwoord: toonB(ant), fouten: uniek([ruw(x - y, d * 2), ruw(x + y, d), ruw(x - y, d > 3 ? d - 1 : d + 1)], toonB(ant)), kern: `g-${x}.${y}.${d}`, moeilijkheid: [d], data: { bkb: t, x, y, d } }; }
    const ant = sorteerBreuk({ n: x + y, d });
    return { vraag: `${ruw(x, d)} + ${ruw(y, d)} = ____`, antwoord: toonB(ant), fouten: uniek([ruw(x + y, d * 2), ruw(x + y, d + d), ruw(x + y, d) === toonB(ant) ? ruw(x + y, d + 1) : ruw(x + y, d), ruw(x * y, d)], toonB(ant)), kern: `g+${x}.${y}.${d}`, moeilijkheid: [d], data: { bkb: t, x, y, d } };
  }
  const d1 = kies(r, noemers), d2 = kies(r, noemers), a = r.geheel(1, d1 - 1), b = r.geheel(1, d2 - 1);
  if (d1 === d2 && t !== 'maal') return null;
  if (t === 'ong+') { const ant = sorteerBreuk({ n: a * d2 + b * d1, d: d1 * d2 }); if (d1 * d2 > 200) return null; return { vraag: `${ruw(a, d1)} + ${ruw(b, d2)} = ____`, antwoord: toonB(ant), fouten: uniek([ruw(a + b, d1 + d2), ruw(a + b, d1 * d2), ruw(a * b, d1 * d2)], toonB(ant)), kern: `o+${a}.${d1}.${b}.${d2}`, moeilijkheid: [d1 * d2], data: { bkb: t, a, d1, b, d2 } }; }
  if (t === 'ong-') { if (a * d2 <= b * d1) return null; const ant = sorteerBreuk({ n: a * d2 - b * d1, d: d1 * d2 }); return { vraag: `${ruw(a, d1)} − ${ruw(b, d2)} = ____`, antwoord: toonB(ant), fouten: uniek([ruw(a - b, d1 - d2 === 0 ? d1 + d2 : Math.abs(d1 - d2)), ruw(a * d2 - b * d1, d1 + d2), ruw(a - b, d1 * d2)].filter(z => !z.startsWith('-') && !z.endsWith('/0')), toonB(ant)), kern: `o-${a}.${d1}.${b}.${d2}`, moeilijkheid: [d1 * d2], data: { bkb: t, a, d1, b, d2 } }; }
  if (t === 'maal') { const ant = sorteerBreuk({ n: a * b, d: d1 * d2 }); return { vraag: `${ruw(a, d1)} × ${ruw(b, d2)} = ____`, antwoord: toonB(ant), fouten: uniek([ruw(a * d2, d1 * b), ruw(a + b, d1 + d2), ruw(a * b, d1 + d2)], toonB(ant)), kern: `m${a}.${d1}.${b}.${d2}`, moeilijkheid: [d1 * d2], data: { bkb: t, a, d1, b, d2 } }; }
  // delen: vermenigvuldig met het omgekeerde
  const ant = sorteerBreuk({ n: a * d2, d: d1 * b });
  return { vraag: `${ruw(a, d1)} : ${ruw(b, d2)} = ____`, antwoord: toonB(ant), fouten: uniek([toonB(sorteerBreuk({ n: a * b, d: d1 * d2 })), toonB(sorteerBreuk({ n: d1 * b, d: a * d2 })), ruw(a, d1 * b)], toonB(ant)), kern: `d${a}.${d1}.${b}.${d2}`, moeilijkheid: [d1 * d2], data: { bkb: t, a, d1, b, d2 } };
};
export const BREUKBEWERKING_VORMEN = maakOpgaveVormen({
  id: 'bkb', titel: 'Bewerkingen met breuken', doelen: AUTO_DOELEN.bkb || [], parameters: K.breukBewerkingParameters, standaard: { types: ['gl+', 'gl-', 'ong+'], noemer: 20, jaar: 4 },
  opdracht: opdracht('Reken uit. Schrijf het antwoord als een zo eenvoudig mogelijke breuk.', 'Kies het juiste antwoord. Omcirkel.'), opgave: bkbOpgave,
});

/* ------------------------------------------------------------------ bewerkingen met decimale getallen */
const dcbOpgave = (r, p) => {
  const t = kies(r, p.types), nd = p.decimalen, schaal = 10 ** nd;
  const toon = (x) => fmtDec(x, nd).replace(/,?0+$/, (m) => (m.includes(',') ? '' : m));
  const gr = (x) => { const s = fmtDec(x, nd); return s.includes(',') ? s.replace(/0+$/, '').replace(/,$/, '') : s; };
  void toon;
  if (t === 'dec+' || t === 'dec-') {
    const a = r.geheel(schaal / 10, 20 * schaal), b = r.geheel(schaal / 10, 15 * schaal), antw = t === 'dec+' ? a + b : a - b;
    if (t === 'dec-' && a <= b) return null;
    if (a % 10 === 0 || b % 10 === 0 && nd === 3 && r.volgende() < 0.5) return null;
    const fout1 = t === 'dec+' ? a + Math.floor(b / 10) : a - Math.floor(b / 10), fout2 = antw + 10 ** (nd - 1), fout3 = antw * 10;
    return { vraag: `${gr(a)} ${t === 'dec+' ? '+' : '−'} ${gr(b)} = ____`, antwoord: gr(antw), fouten: uniek([gr(fout1), gr(fout2), gr(fout3), gr(antw - 10 ** (nd - 1))], gr(antw)), kern: `${t}${a}.${b}`, moeilijkheid: [nd], data: { dcb: t, a, b, nd, antw } };
  }
  if (t === 'dec×') { const a = r.geheel(schaal / 10, 12 * schaal), n = r.geheel(2, 9), antw = a * n; if (a % 10 === 0) return null; return { vraag: `${gr(a)} × ${n} = ____`, antwoord: gr(antw), fouten: uniek([gr(antw * 10), gr(Math.round(antw / 10)), gr(a + n * 10 ** nd)], gr(antw)), kern: `x${a}.${n}`, moeilijkheid: [nd, n], data: { dcb: t, a, n, nd, antw } }; }
  if (t === 'dec:') { const n = r.geheel(2, 9), q = r.geheel(schaal / 10 + 1, 9 * schaal), a = n * q; if (q % 10 === 0) return null; return { vraag: `${gr(a)} : ${n} = ____`, antwoord: gr(q), fouten: uniek([gr(q * 10), gr(Math.round(q / 10)), gr(Math.floor(a / 10 / n * 1))], gr(q)).filter(x => x), kern: `d${a}.${n}`, moeilijkheid: [nd, n], data: { dcb: t, a, n, nd, antw: q } }; }
  // dec×dec of dec:dec met één decimaal
  const x = r.geheel(2, 9), y = r.geheel(2, 9);
  if (r.volgende() < 0.5) return { vraag: `${fmtDec(x * 10, 2).replace(/0$/, '')} × ${fmtDec(y * 10, 2).replace(/0$/, '')} = ____`, antwoord: fmtDec(x * y, 2).replace(/,?0$/, ''), fouten: uniek([String(x * y).replace(/^(\d)$/, '$1'), fmtDec(x * y * 10, 2).replace(/,?0$/, ''), fmtDec(x * y, 3).replace(/0+$/, '')], fmtDec(x * y, 2).replace(/,?0$/, '')), kern: `dd${x}.${y}`, moeilijkheid: [2], data: { dcb: 'dec×dec', x, y } };
  const q = r.geheel(2, 9), z = x * q;
  return { vraag: `${(z / 10).toString().replace('.', ',')} : ${(x / 10).toString().replace('.', ',')} = ____`, antwoord: String(q), fouten: uniek([String(q * 10), String(q / 10).replace('.', ','), String(q + 1)], String(q)), kern: `dq${x}.${q}`, moeilijkheid: [2], data: { dcb: 'dec:dec', x, q, z } };
};
export const DECIMALE_BEWERKING_VORMEN = maakOpgaveVormen({
  id: 'dcb', titel: 'Rekenen met decimale getallen', doelen: AUTO_DOELEN.dcb || [], parameters: K.decimaleBewerkingParameters, standaard: { types: ['dec+', 'dec-', 'dec×'], decimalen: 2, jaar: 4 },
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: dcbOpgave,
});

export const AUTO_RATIONAAL_VORMEN = [...BREUKDEEL_VORMEN, ...OMZETTEN_VORMEN, ...RATIONAAL_VERGELIJK_VORMEN, ...DECIMAAL_VORMEN, ...BREUKBEWERKING_VORMEN, ...DECIMALE_BEWERKING_VORMEN];
