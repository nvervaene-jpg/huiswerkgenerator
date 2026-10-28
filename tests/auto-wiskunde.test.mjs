// Tests voor de automatisch gekoppelde wiskundefamilies (zie js/subjects/wiskunde/classificatie.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { zetDoelen } from '../js/core/doelregister.js';
import { FAMILIES } from '../js/subjects/wiskunde/classificatie.js';
import { AUTO_DOELEN } from '../js/subjects/wiskunde/auto-doelen.js';
import { ECHTE_GENERATORS } from '../js/subjects/wiskunde/generators/index.js';
import { effectiefAantal } from '../js/core/blad-model.js';

const DOELEN = JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen;
zetDoelen(DOELEN);
const SEEDS = [1, 2, 3, 4, 5, 6];

test('auto-doelen.js komt overeen met de classificatie (draai node scripts/bouw-alles.mjs als dit faalt)', () => {
  for (const f of FAMILIES) assert.deepEqual(AUTO_DOELEN[f.id], DOELEN.filter(d => f.parameters(d)).map(d => d.code).sort(), f.id);
  assert.deepEqual(Object.keys(AUTO_DOELEN).sort(), FAMILIES.map(f => f.id).sort());
});

/* ---- onafhankelijke controle per familie: elk antwoord wordt opnieuw uitgerekend uit de gegevens van de opgave */

/* ---- meetkunde: de tekening wordt opnieuw opgemeten */
const veelhoekPunten = (markup) => { const m = /<polygon points="([^"]+)"/.exec(markup); return m ? m[1].split(' ').map(q => q.split(',').map(Number)) : null; };
const lengte = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const graad = (a, b, c) => { const v = [a[0] - b[0], a[1] - b[1]], w = [c[0] - b[0], c[1] - b[1]]; return (Math.acos((v[0] * w[0] + v[1] * w[1]) / (Math.hypot(...v) * Math.hypot(...w))) * 180) / Math.PI; };
const gelijk = (x, y) => Math.abs(x - y) / Math.max(x, y) < 0.02;
const meet = (P) => {
  const n = P.length, z = P.map((q, i) => lengte(q, P[(i + 1) % n])), h = P.map((q, i) => graad(P[(i + n - 1) % n], q, P[(i + 1) % n]));
  const richt = P.map((q, i) => { const w = P[(i + 1) % n]; return [w[0] - q[0], w[1] - q[1]]; });
  let paren = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(richt[i][0] * richt[j][1] - richt[i][1] * richt[j][0]) / (z[i] * z[j]) < 0.01) paren++;
  return { n, z, h, rechte: h.filter(x => Math.abs(x - 90) < 2).length, paren, alleZijden: z.every(x => gelijk(x, z[0])), alleHoeken: h.every(x => Math.abs(x - h[0]) < 2) };
};
const figuurNaam = (markup) => {
  const P = veelhoekPunten(markup); if (!P) return /<circle/.test(markup) ? 'cirkel' : null;
  const m = meet(P);
  if (m.n === 3) return 'driehoek';
  if (m.n === 4) {
    if (m.rechte === 4) return m.alleZijden ? 'vierkant' : 'rechthoek';
    if (m.alleZijden) return 'ruit';
    if (m.paren === 2) return 'parallellogram';
    if (m.paren === 1) return 'trapezium';
    if ((gelijk(m.z[0], m.z[1]) && gelijk(m.z[2], m.z[3])) || (gelijk(m.z[1], m.z[2]) && gelijk(m.z[3], m.z[0]))) return 'vlieger';
    return 'vierhoek';
  }
  return { 5: 'vijfhoek', 6: 'zeshoek', 8: 'achthoek' }[m.n];
};
const RUIMTE_T = { kubus: { vlakken: 6, ribben: 12, hoekpunten: 8, oppervlak: 'vlak' }, balk: { vlakken: 6, ribben: 12, hoekpunten: 8, oppervlak: 'vlak' }, piramide: { vlakken: 5, ribben: 8, hoekpunten: 5, oppervlak: 'vlak' }, driehoeksprisma: { vlakken: 5, ribben: 9, hoekpunten: 6, oppervlak: 'vlak' }, cilinder: { oppervlak: 'vlak en gebogen' }, kegel: { oppervlak: 'vlak en gebogen' }, bol: { oppervlak: 'gebogen' } };
const hoekenUit = (markup) => [...markup.matchAll(/<polyline points="([^"]+)" fill="none" stroke="#222" stroke-width="3.5"/g)].map(m => { const q = m[1].split(' ').map(x => x.split(',').map(Number)); return graad(q[0], q[1], q[2]); });
const hoekNaam = (g) => (Math.abs(g - 90) < 1.5 ? 'recht' : Math.abs(g - 180) < 1.5 ? 'gestrekt' : g < 90 ? 'scherp' : 'stomp');
const SUBSET = { vierkant: ['rechthoek', 'ruit', 'parallellogram', 'vierhoek'], rechthoek: ['parallellogram', 'vierhoek'], ruit: ['parallellogram', 'vierhoek'], parallellogram: ['vierhoek'], driehoek: [], zeshoek: [] };
const DEF_T = { rechthoek: 'vier rechte hoeken', vierkant: 'vier gelijke zijden en vier rechte hoeken', ruit: 'vier gelijke zijden', parallellogram: 'twee paar evenwijdige zijden', 'gelijkzijdige driehoek': 'drie gelijke zijden', 'rechthoekige driehoek': 'een rechte hoek', 'stomphoekige driehoek': 'een stompe hoek', 'scherphoekige driehoek': 'drie scherpe hoeken', zeshoek: 'zes zijden', vijfhoek: 'vijf zijden' };
const ALTIJD_T = { driehoeken: ['drie hoeken', 'drie zijden'], rechthoeken: ['vier rechte hoeken', 'vier zijden', 'overstaande zijden die even lang zijn'], vierkanten: ['vier gelijke zijden', 'vier rechte hoeken', 'vier zijden'], ruiten: ['vier gelijke zijden', 'vier zijden'], parallellogrammen: ['overstaande zijden die even lang zijn', 'vier zijden'], vierhoeken: ['vier zijden'], cirkels: ['een middelpunt'], veelhoeken: ['minstens drie zijden'] };
const DIAG_T = { rechthoek: ['zijn altijd even lang', 'snijden elkaar altijd in het midden'], vierkant: ['zijn altijd even lang', 'staan altijd loodrecht op elkaar', 'snijden elkaar altijd in het midden'], ruit: ['staan altijd loodrecht op elkaar', 'snijden elkaar altijd in het midden'], parallellogram: ['snijden elkaar altijd in het midden'] };
const figurenUit = (markup) => [...markup.matchAll(/<g data-vorm="(\w+)" data-kleur="(\w+)">/g)].map(m => ({ vorm: m[1], kleur: m[2] }));
const past = (f, c) => (c.kleur ? f.kleur === c.kleur : true) && (c.vorm ? f.vorm === c.vorm : true);

/* ---- meetkunde op ruitjespapier, symmetrie, patronen, plaatsbepaling en congruentie: de tekening wordt opnieuw opgemeten */
const cellenUit = (markup, id) => [...markup.matchAll(new RegExp(`<rect data-fig="${id}" data-x="(-?\\d+)" data-y="(-?\\d+)"`, 'g'))].map(m => [Number(m[1]), Number(m[2])]);
const celNorm = (c) => { const mx = Math.min(...c.map(v => v[0])), my = Math.min(...c.map(v => v[1])); return c.map(([x, y]) => `${x - mx},${y - my}`).sort().join(';'); };
const celSet = (c) => c.map(v => v.join(',')).sort().join(';');
const kwart = (c) => c.map(([x, y]) => [-y, x]), flipX = (c) => c.map(([x, y]) => [-x, y]), flipY = (c) => c.map(([x, y]) => [x, -y]);
function transformatieKlasse(A, B) {
  const nb = celNorm(B);
  if (celNorm(A) === nb) return 'verschuiving';
  let r = A; for (let k = 0; k < 3; k++) { r = kwart(r); if (celNorm(r) === nb) return 'draaiing'; }
  return celNorm(flipX(A)) === nb || celNorm(flipY(A)) === nb ? 'spiegeling' : null;
}
const klasseVan2 = (A, B) => transformatieKlasse(A, B);
const celAsymmetrisch = (A) => { const n = celNorm(A); return ![kwart(A), kwart(kwart(A)), kwart(kwart(kwart(A))), flipX(A), flipY(A), A.map(([x, y]) => [y, x]), A.map(([x, y]) => [-y, -x])].some(v => celNorm(v) === n); };
const spiegelCellen = (c, as) => (as.soort === 'v' ? c.map(([x, y]) => [2 * as.pos - x - 1, y]) : c.map(([x, y]) => [x, 2 * as.pos - y - 1]));
const asUit = (markup) => { const m = /data-as="([vh]):(\d+)"/.exec(markup); return m ? { soort: m[1], pos: Number(m[2]) } : null; };
const symmetrieAssenTelling = (P) => {
  const mid = [P.reduce((x, q) => x + q[0], 0) / P.length, P.reduce((x, q) => x + q[1], 0) / P.length], hits = [];
  for (let gr = 0; gr < 180; gr += 0.5) {
    const a = (gr * Math.PI) / 180, c = Math.cos(2 * a), s = Math.sin(2 * a);
    if (P.every(([x, y]) => { const dx = x - mid[0], dy = y - mid[1], m = [mid[0] + dx * c + dy * s, mid[1] + dx * s - dy * c]; return P.some(v => Math.hypot(v[0] - m[0], v[1] - m[1]) < 1.3); })) hits.push(gr);
  }
  let n = 0; hits.forEach((g, i) => { if (i === 0 || g - hits[i - 1] > 1.01) n++; });
  return hits.length > 1 && hits[0] < 1 && hits[hits.length - 1] > 178.9 ? n - 1 : n;
};
const spiegelOmLijn = (P, l) => { const [x1, y1, x2, y2] = l, dx = x2 - x1, dy = y2 - y1, k = dx * dx + dy * dy; return P.every(([x, y]) => { const t = ((x - x1) * dx + (y - y1) * dy) / k, vx = x1 + t * dx, vy = y1 + t * dy, m = [2 * vx - x, 2 * vy - y]; return P.some(v => Math.hypot(v[0] - m[0], v[1] - m[1]) < 1.3); }); };
const patUit = (markup) => [...markup.matchAll(/data-pat="([^"]+)"/g)].map(m => m[1]);
const patNaam = (tok) => { const [k, v] = tok.split('-'); return v === 'vierkant' ? `${k} vierkant` : `${{ rood: 'rode', blauw: 'blauwe', geel: 'gele', groen: 'groene' }[k]} ${v}`; };
const reeksPeriode = (r) => { for (let p = 1; p <= r.length; p++) if (r.every((e, i) => e === r[i % p])) return p; return r.length; };
const polygonenUit = (markup) => Object.fromEntries([...markup.matchAll(/<polygon data-fig="(\w)" points="([^"]+)"/g)].map(m => [m[1], m[2].split(' ').map(q => q.split(',').map(Number))]));
function gelijkvormigFactor(P, Q) {
  if (P.length !== Q.length) return null;
  const n = P.length, zijden = (V) => V.map((q, i) => Math.hypot(V[(i + 1) % n][0] - q[0], V[(i + 1) % n][1] - q[1])), hoeken = (V) => V.map((q, i) => graad(V[(i + n - 1) % n], q, V[(i + 1) % n]));
  const zP = zijden(P), hP = hoeken(P);
  for (const V of [Q, [...Q].reverse()]) {
    const zQ = zijden(V), hQ = hoeken(V);
    for (let s = 0; s < n; s++) {
      const k = zQ[s] / zP[0];
      if (zP.every((z, i) => Math.abs(zQ[(s + i) % n] / z - k) < 0.03 * k && Math.abs(hQ[(s + i) % n] - hP[i]) < 2.5)) return k;
    }
  }
  return null;
}

// Meten 3: eigen tabellen voor de controles (los van de generator).
const TIENMACHT = { kl: 3, hl: 2, dal: 1, l: 0, dl: -1, cl: -2, ml: -3, 'km²': 6, 'hm²': 4, 'dam²': 2, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6, 'km³': 9, 'hm³': 6, 'dam³': 3, 'm³': 0, 'dm³': -3, 'cm³': -6, 'mm³': -9, kg: 0, hg: -1, dag: -2, g: -3, dg: -4, cg: -5, mg: -6, t: 3, ha: 4, a: 2 };
const machtVan = (eenheid, ladder) => (ladder === 'ton' && eenheid === 'g' ? -3 : ladder === 'ton' && eenheid === 'mg' ? -6 : ladder === 'land' && eenheid === 'm²' ? 0 : TIENMACHT[eenheid]);
const IN_DM3 = { l: 1, dl: 0.1, cl: 0.01, ml: 0.001, hl: 100, 'dm³': 1, 'cm³': 0.001, 'm³': 1000 };
const SI = { mm: 1e-3, cm: 1e-2, dm: 1e-1, m: 1, km: 1e3, ml: 1e-3, cl: 1e-2, dl: 1e-1, l: 1, mg: 1e-6, g: 1e-3, kg: 1, t: 1e3, 'cm²': 1e-4, 'dm²': 1e-2, 'm²': 1, a: 100, ha: 1e4, 'cm³': 1e-6, 'dm³': 1e-3, 'm³': 1 };
// naam -> [laagste, hoogste] redelijke waarde in basiseenheid (m, l, kg, m², m³)
const BEREIK = {
  lengte: { 'het potlood': [0.12, 0.25], 'de deur': [1.9, 2.3], 'het klaslokaal': [6, 12], 'het kind': [1.1, 1.5], 'het voetbalveld': [90, 120], 'de tafel': [0.6, 0.85], 'de pinknagel': [0.005, 0.015], 'de weg van Brussel naar Antwerpen': [30000, 60000], 'het muntstuk': [0.001, 0.004], 'het ruitje': [0.004, 0.006], 'de marathon': [42000, 42500] },
  inhoud: { 'de emmer': [5, 15], 'de badkuip': [100, 250], 'het pak melk': [1, 1], 'de regenton': [100, 300], 'het glas': [0.1, 0.35], 'het koffiekopje': [0.1, 0.25], 'het blikje': [0.33, 0.33], 'de theelepel': [0.003, 0.007] },
  massa: { 'de appel': [0.1, 0.25], 'de zak suiker': [1, 1], 'de volwassene': [55, 100], 'de paperclip': [0.0005, 0.002], 'het pak boter': [0.25, 0.25], 'de baby': [2.5, 4.5], 'het brood': [0.4, 1], 'de olifant': [3000, 7000], 'het nijlpaard': [1500, 3000], 'de vinvis': [80000, 150000], 'de bus': [8000, 15000], 'de mug': [0.000001, 0.000004], 'de waterdruppel': [0.00002, 0.0001], 'de vlieg': [0.000008, 0.00002], 'de zandkorrel': [0.0000005, 0.000005] },
  opp: { 'de postzegel': [0.0003, 0.0006], 'het muntstuk': [0.0003, 0.0006], 'het blad papier': [0.05, 0.07], 'de deur': [1.5, 2.5], 'het klaslokaal': [40, 80], 'het tennisveld': [200, 300], 'het voetbalveld': [5000, 9000], 'het voetbalveld (in ha)': [5000, 9000], 'het veld van 100 m bij 100 m': [10000, 10000], 'het stuk grond van 10 m bij 10 m': [100, 100], 'het tennisveld (in a)': [200, 300] },
  vol: { 'het klaslokaal': [120, 250], 'het zwembad': [300, 1000], 'de verhuisdoos': [0.04, 0.1], 'de kubus van 1 cm': [0.000001, 0.000001], 'de kubus van 1 m': [1, 1], 'de emmer': [0.005, 0.015] },
};
const nlGetal = (x) => String(x).replace('.', ',');
const buurTel = (cellen) => { let adj = 0; for (const [x, y] of cellen) { if (cellen.some(c => c[0] === x + 1 && c[1] === y)) adj++; if (cellen.some(c => c[0] === x && c[1] === y + 1)) adj++; } return 4 * cellen.length - 2 * adj; };
const meetCellen = (markup, fig) => { const deel = fig ? markup.split(`<g data-fig="${fig}">`)[1].split('</g>')[0] : markup; return [...deel.matchAll(/data-cel="(\d+),(\d+)"/g)].map(m => [Number(m[1]), Number(m[2])]); };
const BTN = { 'De massa van de inhoud zonder verpakking is de ____massa.': 'netto', 'De massa van de inhoud met verpakking is de ____massa.': 'bruto', 'De massa van de verpakking alleen is de ____massa.': 'tarra', 'Bruto = netto + ____': 'tarra', 'Netto = bruto − ____': 'tarra', 'Bruto − tarra = ____': 'netto', 'Netto + tarra = ____': 'bruto', 'Een pak koekjes weegt met het doosje samen 500 g. De massa met doosje heet de ____massa.': 'bruto', 'Een blikje soep weegt zonder blik 400 g. Die massa heet de ____massa.': 'netto' };
const begripAntwoord = (v) => {
  if (/put|zwembad ligt|duiker|vijver naar beneden/.test(v)) return 'diepte';
  if (/toren|de boom|de deur van|berg steekt/.test(v)) return 'hoogte';
  if (/rond het voetbalveld|rand van de tuin|rand van het schilderij|rond het plein/.test(v)) return 'omtrek';
  if (/touw|trein van voor|het lint van het begin|de brug is/.test(v)) return 'lengte';
  if (/hoever/.test(v)) return 'afstand';
  if (/past\./.test(v)) return 'inhoud';
  return null;
};

// Natuurlijke getallen 2: eigen hulpfuncties voor de controles.
const TEKEN_NAAM = { 'kleiner dan': '<', 'groter dan': '>', 'gelijk aan': '=', 'niet gelijk aan': '≠', 'kleiner dan of gelijk aan': '≤', 'groter dan of gelijk aan': '≥' };
const geldt = (a, t, b) => ({ '<': a < b, '>': a > b, '=': a === b, '≠': a !== b, '≤': a <= b, '≥': a >= b }[t]);
const TAL_WAARDE = { td: 1e4, hd: 1e5, m: 1e6, tm: 1e7, hm: 1e8, mrd: 1e9 };
const kaalGetal = (x) => Number(String(x).replace(/\s/g, ''));
const romeinsWaarde = (t) => { const w = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let som = 0; for (let i = 0; i < t.length; i++) som += w[t[i]] < (w[t[i + 1]] || 0) ? -w[t[i]] : w[t[i]]; return som; };
const romeinsTekst = (n) => { const dec = [['', 'M', 'MM'], ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'], ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'], ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']]; return dec[0][Math.floor(n / 1000)] + dec[1][Math.floor(n / 100) % 10] + dec[2][Math.floor(n / 10) % 10] + dec[3][n % 10]; };
const regelVanRij = (a) => {
  const dif = a.slice(1).map((x, i) => x - a[i]);
  if (dif.every(x => x === dif[0])) return dif[0] > 0 ? `+${dif[0]}` : `−${-dif[0]}`;
  if (a.slice(1).every((x, i) => x === a[i] * (a[1] / a[0]))) return `×${a[1] / a[0]}`;
  if (a.every(x => Number.isInteger(Math.sqrt(x)))) return 'kwadraten';
  if (a.every(x => Number.isInteger((Math.sqrt(8 * x + 1) - 1) / 2))) return 'driehoeksgetallen';
  if (a.slice(2).every((x, i) => x === a[i] + a[i + 1])) return 'som van de twee vorige getallen';
  if (dif.every((x, i) => x === dif[i % 2])) return `+${dif[0]} en +${dif[1]} afwisselend`;
  return null;
};
const RANG_NAAM = ['', 'eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende', 'achtste', 'negende', 'tiende'];
const telPunten = (markup, id) => (markup.match(new RegExp(`data-punt="${id}"`, 'g')) || []).length;
const telMab = (markup) => ({ t: (markup.match(/fill="#f6d27a"/g) || []).length, e: (markup.match(/fill="#f4a3a3"/g) || []).length, h: (markup.match(/fill="#bfe0f5"/g) || []).length });
const asWaarde = (markup) => {
  const labels = [...markup.matchAll(/<text x="([\d.]+)" y="[\d.]+" text-anchor="middle" fill="#111">([\d  ]+)<\/text>/g)].map(m => [Number(m[1]), kaalGetal(m[2])]);
  const pijl = Number(/<line x1="([\d.]+)" y1="6"/.exec(markup)[1]), [x1, v1] = labels[0], [x2, v2] = labels[labels.length - 1];
  return v1 + ((pijl - x1) * (v2 - v1)) / (x2 - x1);
};

// Begrippen en situaties: eigen hulpfuncties voor de controles.
const MINT = '−';
const negT = (n) => (n < 0 ? `${MINT}${-n}` : String(n));
const hondVan = (tekst) => { if (/ %$/.test(tekst)) return Number(tekst.replace(' %', '')); if (/,/.test(tekst)) { const [e, f] = tekst.split(','); return Number(e) * 100 + Number(f.padEnd(2, '0')); } if (/\//.test(tekst)) { const [a, b] = tekst.split('/').map(Number); return (a * 100) / b; } return Number(tekst) * 100; };
const rekenUit = (uitdr) => { const m = /^(\S+) (\+|−|×|:) (\S+)$/.exec(uitdr), w = (x) => (x.includes('/') ? x.split('/').reduce((a, b) => a / b) : Number(x.replace(',', '.'))); return m ? { '+': w(m[1]) + w(m[3]), '−': w(m[1]) - w(m[3]), '×': w(m[1]) * w(m[3]), ':': w(m[1]) / w(m[3]) }[m[2]] : NaN; };
const getalUitTekst = (x) => Number(String(x).replace(/[\s ]/g, '').replace('−', '-').replace(',', '.'));
const asWaardeNeg = (markup) => {
  const labels = [...markup.matchAll(/<text x="([\d.]+)" y="[\d.]+" text-anchor="middle" fill="#111">(−?\d+)<\/text>/g)].map(m => [Number(m[1]), Number(m[2].replace('−', '-'))]);
  const pijlen = [...markup.matchAll(/<line x1="([\d.]+)" y1="6"/g)].map(m => Number(m[1])), [x1, v1] = labels[0], [x2, v2] = labels[labels.length - 1];
  return pijlen.map(x => Math.round(v1 + ((x - x1) * (v2 - v1)) / (x2 - x1)));
};
// Vormleer: eigen controles op de tekeningen.
const lijnSoort = (markup) => /data-lijn="(\w+)"/.exec(markup)[1];
const zijdeLengte = (markup, l) => { const m = new RegExp(`data-zijde="${l}" x1="([\\d.]+)" y1="([\\d.]+)" x2="([\\d.]+)" y2="([\\d.]+)"`).exec(markup); return Math.hypot(m[3] - m[1], m[4] - m[2]); };
const RUIMTE_ANTWOORD = [['Een kubus heeft 6', 'zijvlakken'], ['Een kubus heeft 12', 'ribben'], ['Waar twee zijvlakken van een kubus', 'ribbe'], ['Een bol heeft een', 'gebogen'], ['Een figuur met alleen vlakke zijvlakken', 'veelvlak'], ['Het zijvlak waarop', 'grondvlak'], ['Als je een kubus openvouwt', 'ontvouwing'], ['De ontvouwing van een kubus', '6'], ['Een cilinder heeft twee', 'grondvlakken']];
const ok = {
  stb: (d, o) => {
    const m = o.svg?.markup || '', soortVan = (x) => (/<polyline/.test(x) ? 'lijngrafiek' : /A105,105/.test(x) ? 'cirkeldiagram' : /width="46"/.test(x) ? 'staafdiagram' : /r="12"/.test(x) ? 'beelddiagram' : /fill="#dfeaf5"/.test(x) ? 'tabel' : null);
    if (d.soort === 'naam') return soortVan(m) === d.naam && d.antwoord === d.naam;
    if (d.soort === 'assen') return soortVan(m) === (d.lijn ? 'lijngrafiek' : 'staafdiagram') && d.antwoord === (/links/.test(d.vraag) ? 'verticale as' : 'horizontale as') && d.verticaal === /links/.test(d.vraag);
    if (d.soort === 'gemiddelde') return d.lijst.reduce((a, b) => a + b, 0) / d.lijst.length === Number(d.antwoord) && Number.isInteger(Number(d.antwoord));
    const g = [...d.lijst].sort((a, b) => a - b); return g[(g.length - 1) / 2] === Number(d.antwoord) && g.length % 2 === 1;
  },
  knb: (d) => {
    const zeker = /Na maandag|zon komt|steen valt naar|Water is nat|zeven dagen/, onmog = /hond schrijft|water zoals|steen vliegt|een 7|fiets eet/;
    switch (d.soort) {
      case 'zeker3': return d.antwoord === (zeker.test(d.zin) ? 'zeker' : onmog.test(d.zin) ? 'onmogelijk' : 'mogelijk');
      case 'zeker2': return d.antwoord === (zeker.test(d.zin) ? 'zekere' : 'onzekere') && !onmog.test(d.zin);
      case 'waarsch': { const n = d.kleur === 'rood' ? d.rood : d.blauw, tot = d.rood + d.blauw; return d.antwoord === (n * 2 > tot ? 'waarschijnlijk' : n * 2 < tot ? 'onwaarschijnlijk' : 'even waarschijnlijk'); }
      case 'gunstig': { const f = { 'een even getal': [2, 4, 6], 'een oneven getal': [1, 3, 5], 'meer dan 4': [5, 6], 'minder dan 3': [1, 2], 'een 6': [6], 'een getal uit de tafel van 3': [3, 6], 'meer dan 2': [3, 4, 5, 6], 'een priemgetal': [2, 3, 5] }[d.naam]; return Number(d.antwoord) === f.length && d.gunstig === f.length; }
      default: return Number(d.antwoord) === d.k && d.k > 0 && d.k < d.totaal;
    }
  },
  sta: (d) => {
    const getal = (t) => Number(String(t).replace(/\s| /g, '')), een = (n) => { const m = 10 ** (String(n).length - 1); return Math.round(n / m) * m; };
    return d.exact === d.a * d.b && getal(d.antwoord) === een(d.exact) && d.fouten.every(f => Math.abs(getal(f) - getal(d.antwoord)) / getal(d.antwoord) > 0.4) && d.vraag.includes(`${d.a} `) && d.vraag.includes(`${d.b} `);
  },
  vhd: (d) => {
    const g = Number(d.antwoord);
    if (d.wat === 'lees' || d.wat === 'schrijf') return g === d.b;
    if (d.wat === 'omgekeerd') return g === d.a;
    if (d.wat === 'tweede') return g === d.b * d.k && d.vraag.includes(`${d.a * d.k} `);
    return g === d.a * d.k && d.vraag.includes(`${d.b * d.k} `);
  },
  t20: (d) => {
    const g = Number(d.antwoord);
    return g === (d.op === '+' ? d.a + d.b : d.op === '-' ? d.a - d.b : d.b - d.a) && g >= 0 && d.a <= 20 && d.b <= 20 && d.fouten.every(f => Number(f) >= 0);
  },
  bgl: (d) => {
    if (d.wat === 'teken') return d.antwoord === '≈';
    if (d.wat === 'exact') return d.antwoord === '=' && d.a + d.b === d.uit;
    return d.antwoord === '≈' && d.a + d.b !== d.uit && Math.abs(d.a + d.b - d.uit) <= 10;
  },
  rkm: (d) => {
    if (d.soort === 'criterium') return ['hoofdrekenen', 'schattend rekenen', 'cijferen', 'digitale rekentool'].includes(d.methode) && (d.vorm === 'omgekeerd' ? d.antwoord === d.methode : d.vraag.includes(`Je kiest voor ${d.methode} als`));
    if (d.methode === 'cijferen') return d.antwoord === 'cijferen' && d.a % 10 !== 0 && d.b % 10 !== 0 && d.vraag.includes('precies op papier');
    if (d.methode === 'schattend rekenen') return d.antwoord === 'schattend rekenen' && d.vraag.includes('20 euro');
    if (d.methode === 'digitale rekentool') return d.antwoord === 'digitale rekentool' && /,/.test(d.a) && /,/.test(d.b);
    const [x, y] = d.som.split(/[+-]/).map(Number);
    return d.antwoord === 'hoofdrekenen' && (d.som.includes('+') ? x % 100 === 0 && y % 50 === 0 : y === 99);
  },
  bln: (d, o) => {
    const T = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'], N = { 2: 'half', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste', 9: 'negende', 10: 'tiende', 11: 'elfde' };
    const woord = `${T[d.t]} ${N[d.n]}`, svg = o.svg && o.svg.markup, uitSvg = svg && /data-teller="(\d+)" data-noemer="(\d+)"/.exec(svg);
    if (uitSvg) assert.deepEqual([Number(uitSvg[1]), Number(uitSvg[2])], [d.t, d.n]);
    if (d.wat === 'lees-h' || d.wat === 'lees-s') return d.antwoord === woord && (d.wat === 'lees-h' ? !!uitSvg : d.vraag.includes(`${d.t}/${d.n}`));
    if (d.wat === 'schrijf-s') return d.antwoord === `${d.t}/${d.n}` && d.vraag.includes(`"${woord}"`);
    if (d.wat === 'h-naar-s') return d.antwoord === `${d.t}/${d.n}` && !!uitSvg;
    return Number(d.antwoord) === (d.wat === 'teller' ? d.t : d.n) && d.vraag.includes(`"${woord}"`) && d.t < d.n;
  },
  bhs: (d, o) => {
    const delen = [...o.svg.markup.matchAll(/data-deel="(\d)"/g)].map(m => Number(m[1]));
    if (delen.length !== d.n || delen.filter(x => x === 1).length !== d.t) return false;
    if (d.wat === 'verfijn') return Number(d.antwoord) === d.t * d.k && d.vraag.includes(`/${d.n * d.k}.`) && d.vraag.includes(`${d.t}/${d.n}`);
    return d.n === d.k * d.m && d.t === d.k * d.u && Number(d.antwoord) === d.t / d.k && d.vraag.includes(`/${d.m}.`);
  },
  bsv: (d, o) => {
    const delen = [...o.svg.markup.matchAll(/data-deel="(\d)"/g)].map(m => Number(m[1])), gekleurd = delen.filter(x => x === 1).length;
    if (d.soort === 'tiende') return delen.length === 10 && gekleurd === d.a && Number(d.antwoord.replace(',', '.')) === d.a / 10;
    if (delen.length !== 100 || gekleurd !== d.t) return false;
    if (d.soort === 'procent') return Number(d.antwoord) === d.t;
    if (d.soort === 'decimaal') return Math.abs(Number(d.antwoord.replace(',', '.')) - d.t / 100) < 1e-9;
    return d.antwoord === `${d.t}/100`;
  },
  bha: (d) => {
    const [x, y] = d.b.split('/').map(Number), breuk = x / y, decimaal = Number(d.d.replace(',', '.')), procent = Number(d.pc) / 100;
    if (Math.abs(breuk - decimaal) > 1e-9 || Math.abs(breuk - procent) > 1e-9) return false;
    if (d.soort === 'breuk-dec' || d.soort === 'liter') return d.antwoord === d.d;
    return d.soort === 'procent-breuk' ? d.antwoord === d.b : d.antwoord === d.pc;
  },
  bsc: (d, o) => {
    const rects = [...o.svg.markup.matchAll(/<rect (?:data-bal="(\d+)" )?data-k="(\w+)"(?: data-groep="(\d+)")?/g)].map(m => ({ bal: m[1] && Number(m[1]), k: m[2], g: m[3] && Number(m[3]) }));
    const tel = (pred) => rects.filter(pred).length, balk = (b) => rects.filter(x => x.bal === b), dik = (o.svg.markup.match(/stroke-width="3\.6"/g) || []).length;
    const f = (t, n) => `${t}/${n}`, groepen = (lijst) => { const m = new Map(); for (const x of lijst.filter(y => y.k !== '0')) m.set(x.g, (m.get(x.g) || 0) + 1); return [...m.values()]; };
    switch (d.soort) {
      case 'plus': case 'plus-ongelijk': {
        const N = d.N, A = d.a * (N / d.n1), B = d.b * (N / d.n2);
        return balk(1).length === d.n1 && balk(2).length === d.n2 && balk(3).length === N && balk(1).filter(x => x.k === 'a').length === d.a && balk(2).filter(x => x.k === 'b').length === d.b
          && balk(3).filter(x => x.k === 'a').length === A && balk(3).filter(x => x.k === 'b').length === B && A + B <= N && d.antwoord === `${f(d.a, d.n1)} + ${f(d.b, d.n2)}` && (d.soort === 'plus') === (d.n1 === d.n2);
      }
      case 'min': case 'min-ongelijk': {
        const N = d.N, A = d.a * (N / d.n1), B = d.b * (N / d.n2);
        return balk(1).filter(x => x.k === 'a').length === d.a && balk(2).filter(x => x.k === 'weg').length === d.b && balk(3).length === N && balk(3).filter(x => x.k === 'rest').length === A - B && balk(3).filter(x => x.k === 'weg').length === B && A > B
          && d.antwoord === `${f(d.a, d.n1)} − ${f(d.b, d.n2)}`;
      }
      case 'nx': return new Set(rects.map(x => x.bal)).size === d.m && rects.length === d.m * d.n && tel(x => x.k === 'a') === d.m * d.t && d.antwoord === `${d.m} × ${f(d.t, d.n)}`;
      case 'bx': return rects.length === d.n && tel(x => x.k === 'a') === d.t && dik === d.m + 1 && d.antwoord === `${f(d.t, d.n)} × ${d.m}`;
      case 'bb': return rects.length === d.n1 * d.n2 && tel(x => x.k === 'beide') === d.a * d.b && tel(x => x.k === 'a') === d.a * (d.n2 - d.b) && tel(x => x.k === 'b') === d.b * (d.n1 - d.a) && d.antwoord === `${f(d.a, d.n1)} × ${f(d.b, d.n2)}`;
      case 'bd': { const gr = groepen(rects); return rects.length === d.n && tel(x => x.k === 'a') === d.t && gr.length === d.d && gr.every(x => x === d.u) && d.t === d.d * d.u && d.antwoord === `${f(d.t, d.n)} : ${d.d}`; }
      case 'nd': { const gr = groepen(rects); return rects.length === d.m * d.n && tel(x => x.k === 'a') === d.m * d.n && gr.every(x => x === d.a) && gr.length === (d.m * d.n) / d.a && dik === d.m + 1 && d.a < d.n && d.antwoord === `${d.m} : ${f(d.a, d.n)}`; }
      default: { const gr = groepen(rects); return rects.length === d.n && tel(x => x.k === 'a') === d.t && gr.length === d.q && gr.every(x => x === d.a) && d.t === d.a * d.q && d.antwoord === `${f(d.t, d.n)} : ${f(d.a, d.n)}`; }
    }
  },
  maf: (d, o) => {
    const g = Number(d.antwoord.replace(',', '.'));
    if (d.soort === 'lengte') return g === d.tot - d.van && d.tot <= d.lat && d.van >= 0 && d.van < d.tot && o.svg.markup.includes('<svg');
    if (d.soort === 'massa') return g === d.kg && d.kg >= 1 && d.kg <= 10;
    if (d.soort === 'temperatuur') return g === d.v && o.svg.markup.includes(`data-waarde="${d.v}"`);
    if (d.soort === 'klok') return g === d.h && d.h >= 1 && d.h <= 12;
    if (d.wat === 'lengte' || d.wat === 'geld') return g === d.a + d.b && d.vraag.includes(`${d.a} `) && d.vraag.includes(`${d.b} `);
    return g === d.b && d.vraag.includes(`${d.a} g`) && d.vraag.includes(`${d.a + d.b} g`);
  },
  mkz: (d) => {
    const INSTR = { 'de lengte van een potlood': 'liniaal', 'hoe zwaar een appel is': 'weegschaal', 'de temperatuur buiten': 'thermometer', 'hoe laat het is': 'klok', 'de lengte van een klaslokaal': 'rolmeter', 'hoeveel water er in een kan zit': 'maatbeker', 'hoe lang een loper over 100 meter doet': 'chronometer' };
    const EENH = { 'de lengte van een potlood': 'cm', 'de hoogte van een deur': 'm', 'de afstand van school naar de stad': 'km', 'de massa van een appel': 'g', 'de massa van een kind': 'kg', 'de massa van een vrachtwagen': 'ton', 'de inhoud van een emmer': 'l', 'de inhoud van een theelepel': 'ml', 'de duur van een film': 'u', 'de duur van een vingerknip': 's' };
    if (d.soort === 'tijdinstrument') return ({ 'hoe lang je tanden poetst': 'zandloper', 'hoe lang een rondje rennen duurt': 'chronometer', 'hoe lang de les duurt': 'klok' })[d.wat] === d.instr && d.antwoord === d.instr;
    return d.soort === 'instrument' ? INSTR[d.wat] === d.instr && d.antwoord === d.instr : EENH[d.wat] === d.eenheid && d.antwoord === d.eenheid && d.vraag.includes(d.wat);
  },
  msr: (d) => {
    const F = { cm: 1, m: 100, g: 1, kg: 1000, '°C': 1, min: 1, u: 60 }, waarde = (t) => { const [w, e] = t.split(' '); return Number(w.replace(',', '.')) * F[e]; };
    const lijst = d.antwoord.split(', '), basis = lijst.map(waarde);
    if ([...lijst].sort().join() !== [...d.lijst].sort().join() || new Set(basis).size !== basis.length) return false;
    const gesorteerd = basis.every((x, i) => i === 0 || (d.op ? basis[i - 1] < x : basis[i - 1] > x));
    const eenhedenEenSoort = new Set(lijst.map(t => t.split(' ')[1])).size >= 1;
    return gesorteerd && eenhedenEenSoort && d.vraag.includes(d.op ? 'klein naar groot' : 'groot naar klein');
  },
  mza: (d) => {
    const tekst = Number(d.v).toFixed(4), cijfers = tekst.split('.')[1], verwacht = (Math.round(Number(tekst) * 10 ** d.dec + 1e-9) / 10 ** d.dec).toFixed(d.dec).replace('.', ',');
    return d.antwoord === verwacht && !(cijfers[d.dec] === '5' && /^0*$/.test(cijfers.slice(d.dec + 1))) && d.fouten.every(f => f !== d.antwoord) && d.vraag.includes(String(tekst).replace('.', ','));
  },
  mid: (d) => {
    const g = Number(d.antwoord);
    if (d.soort === 'grootheid') return d.wat === 'fles' ? g === d.w && d.vraag.includes(`${d.e} g`) && d.vraag.includes(`${d.e + d.w} g`) : g === d.b - d.a && d.vraag.includes(`${d.a} ml`) && d.vraag.includes(`${d.b} ml`);
    if (d.wat === 'oppervlakte') return g === d.l * d.b;
    if (d.wat === 'omtrek') return g === 2 * (d.l + d.b);
    return d.wat === 'volume' && g === d.l * d.b * d.h;
  },
  mhi: (d) => {
    const getal = (t) => Number(String(t).replace(',', '.')), g = getal(d.antwoord);
    if (d.h >= d.c || d.h <= 0) return false;
    return d.soort === 'inhoud' ? g === d.c : d.soort === 'hoeveelheid' ? g === d.h : Math.abs(g - (d.c - d.h)) < 1e-9;
  },
  mim: (d) => {
    const g = Number(String(d.antwoord).replace(/\s| /g, '').replace(',', '.'));
    return g === d.n && d.n > 0 && ['l-kg', 'kg-l', 'ml-g', 'g-ml'].includes(d.soort) && d.vraag.includes('water');
  },
  mpl: (d) => {
    const SCHOOL = ['opstaan', 'ontbijten', 'naar school gaan', 'speeltijd', 'middageten', 'naar huis gaan', 'avondeten', 'slapen'], WEEK = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    if (d.soort === 'volgorde') { const lijst = d.dag ? SCHOOL : WEEK, plek = d.lijst.map(x => lijst.indexOf(x)); return plek.every(i => i >= 0) && d.antwoord === lijst[d.eerst ? Math.min(...plek) : Math.max(...plek)] && d.vraag.includes(d.antwoord); }
    const regels = d.plan.split(', ').map(x => x.split(' '));
    return regels.length === 5 && new Set(regels.map(x => x[1])).size === 5 && regels.some(([dag, act]) => dag === d.dag && act === d.act) && (d.vraag.includes(`Wat doen we op ${d.dag}?`) ? d.antwoord === d.act : d.antwoord === d.dag);
  },
  ptg: (d, o) => {
    const HOEK = { rechts: 0, rechtsonder: 45, omlaag: 90, linksonder: 135, links: 180, linksboven: 225, omhoog: 270, rechtsboven: 315 }, m = /data-richting="(\w+)".*rotate\((\d+) 70 70\)/.exec(o.svg.markup);
    return !!m && m[1] === d.richting && Number(m[2]) === HOEK[d.richting] && d.antwoord === d.richting;
  },
  ori: (d) => {
    const { rij, i, j } = d;
    if (new Set(rij).size !== rij.length || rij.length !== 5) return false;
    if (d.soort === 'rechts') return d.antwoord === rij[i + 1] && i <= 3;
    if (d.soort === 'links') return d.antwoord === rij[i - 1] && i >= 1;
    if (d.soort === 'tussen') return d.antwoord === rij[i + 1] && d.vraag.includes(`${rij[i]} en ${rij[i + 2]}`);
    return Number(d.antwoord) === j - i - 1 && j - i >= 2;
  },
  ogp: (d) => (d.soort === 'lr' ? d.antwoord === (d.links ? 'rechts' : 'links') && d.vraag.includes(d.links ? 'links van' : 'rechts van') : d.antwoord === (d.voor ? 'achter' : 'voor') && d.vraag.includes(d.voor ? ' voor ' : ' achter ')),
  plg: (d, o) => {
    const uitSvg = [...o.svg.markup.matchAll(/data-vak="(\w+)"[^>]*>([^<]+)</g)].map(m => [m[2], m[1]]), item = d.items[d.i];
    if (uitSvg.length !== d.items.length || !d.items.every(x => uitSvg.some(([n, v]) => n === x.naam && v === x.vak)) || new Set(d.items.map(x => x.vak)).size !== d.items.length) return false;
    return d.soort === 'wat' ? d.antwoord === item.naam && d.vraag.includes(`vak ${item.vak} `) : d.antwoord === item.vak && d.vraag.includes(`de ${item.naam}?`);
  },
  opd: (d) => {
    const g = Number(d.antwoord);
    if (d.soort === 'diagonaal') return g === 2;
    if (d.soort === 'kruis') return g === 4;
    if (d.soort === 'rij') return g === d.rijen * d.k;
    return g === d.z && d.vraag.includes(`${d.z * d.z} gelijke`);
  },
  mzi: (d) => {
    const nummers = (t) => (t.match(/\d+/g) || []).map(Number);
    if (d.soort === 'verhouding') return Number(d.antwoord) === d.u * d.n && d.vraag.includes(`van ${d.u} cm`) && d.vraag.includes(`${d.n} keer`);
    if (d.soort === 'rangschikken') { const { lijst, beste } = d; const min = /kortst|lichtst/.test(d.vraag); return lijst.length === 3 && new Set(lijst).size === 3 && beste === (min ? Math.min(...lijst) : Math.max(...lijst)) && 'ABC'[lijst.indexOf(beste)] === d.antwoord; }
    if (d.soort === 'omgekeerd') { const reeks = { lengte: ['m', 'dm', 'cm', 'mm'], massa: ['kg', 'hg', 'g'], inhoud: ['l', 'dl', 'cl', 'ml'] }[d.g], groot = /grootste/.test(d.vraag), pos = d.lijst.map(e => reeks.indexOf(e)); return pos.every(x => x >= 0) && d.antwoord === d.lijst[pos.indexOf(groot ? Math.max(...pos) : Math.min(...pos))]; }
    if (d.soort === 'metriek') { const f = { 'm.cm': 100, 'm.dm': 10, 'dm.cm': 10, 'cm.mm': 10, 'km.m': 1000, 'kg.g': 1000, 'l.ml': 1000, 'l.dl': 10, 'dl.cl': 10, 'cl.ml': 10, 'uur.minuut': 60, 'minuut.seconde': 60 }[`${d.groot}.${d.klein}`]; return Number(d.antwoord) === f && d.f === f; }
    if (d.soort === 'zelfde') { const [x, y] = [d.a * d.f, d.b]; return d.antwoord === (x === y ? 'evenveel' : x > y ? 'Lars' : 'Mila') && d.b > 0 && d.vraag.includes(`${d.a} `); }
    if (d.soort === 'benadering') return d.antwoord === `in ${d.klein}` && d.fouten.includes(`in ${d.groot}`);
    if (d.soort === 'interval') { if (d.t) return d.antwoord === 'nee' && d.vraag.includes(`${2 * d.t} °C`); if (d.m) return d.antwoord === 'ja' && d.vraag.includes(`${2 * d.m} g`); const verh = /lengte|massa|tijdsduur|hoeveelheid/.test(d.wat); return d.antwoord === (verh ? 'verhoudingsmeting' : 'intervalmeting'); }
    if (d.soort === 'grootheid') return d.antwoord === d.g && !d.fouten.includes(d.g) && ({ lat: 'lengte', rolmeter: 'lengte', weegschaal: 'massa', maatbeker: 'inhoud', thermometer: 'temperatuur' })[d.vraag.match(/met een (\w+)\./)[1]] === d.g;
    if (d.soort === 'conservatie') return ['evenveel', 'even lang', 'even groot'].includes(d.antwoord) && nummers(d.vraag).length === 0;
    return d.antwoord.length > 5 && d.fouten.length >= 2 && ['standaard', 'lijn'].includes(d.soort);
  },
  mbg: (d) => {
    if (d.soort === 'maatgetal') return d.antwoord === String(d.n) && d.vraag.includes(`${d.n} ${d.e}`);
    if (d.soort === 'maateenheid') return d.antwoord === d.e && d.vraag.includes(`${d.n} ${d.e}`);
    if (d.soort === 'maat') return d.antwoord === 'maat' && d.vraag.includes(`${d.n} ${d.e}`);
    if (d.soort === 'meetresultaat') return d.antwoord === 'meetresultaat' && !d.fouten.includes('maat');
    if (d.soort === 'basis') return d.h === undefined ? d.antwoord === 'loodrecht' : Number(d.antwoord) === d.h && d.vraag.includes(`${d.b} cm breed en ${d.h} cm hoog`);
    return d.soort === 'dichtheid' && (d.antwoord === 'g/cm³' ? d.vraag.includes('1 cm³') && d.vraag.includes('massa') : d.antwoord === 'kg/dm³' && d.vraag.includes('1 dm³'));
  },
  mih: (d) => d.soort === 'instrument' && d.antwoord.length > 0 && d.fouten.length >= 2,
  drt: (d) => {
    const getalVan = (t) => Number(String(t).replace(/[\s\u00a0]/g, '').replace(',', '.'));
    if (d.soort === 'rest') { const [, n, q] = /(\d[\d\u00a0]*) : (\d+)/.exec(d.vraag); return Number(d.antwoord) === getalVan(n) % Number(q) && Number(d.antwoord) > 0 && d.n === getalVan(n); }
    if (d.soort === 'procent') return Math.abs(getalVan(d.antwoord) - (d.pct * d.a) / 100) < 1e-9 && d.vraag.includes(`${d.pct} %`);
    if (d.soort === 'groot') return getalVan(d.antwoord) === d.a * d.b;
    return Math.abs(getalVan(d.antwoord) - d.a * d.b) < 1e-9;
  },
  ngp: (d) => {
    const rest = (n) => (n % 9); // het cijferrest van een getal is gelijk aan het getal modulo 9
    if (d.soort === 'rest') return Number(d.antwoord) === rest(d.a) && Number(d.antwoord) >= 0 && Number(d.antwoord) <= 8;
    const echt = d.teken === '×' ? d.a * d.b : d.a + d.b, proef = d.teken === '×' ? (rest(d.a) * rest(d.b)) % 9 : (rest(d.a) + rest(d.b)) % 9, klopt = rest(d.uitkomst) === proef;
    return d.antwoord === (klopt ? 'ja' : 'nee') && d.fout === (d.uitkomst !== echt) && (d.fout ? !klopt : klopt);
  },
  tls: (d) => {
    const rom = (t) => { const w = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let n = 0; for (let i = 0; i < t.length; i++) n += w[t[i]] < (w[t[i + 1]] || 0) ? -w[t[i]] : w[t[i]]; return n; };
    if (d.soort === 'bin-som') return parseInt(d.antwoord, 2) === d.a + d.b && /^[01]+$/.test(d.antwoord);
    if (d.soort === 'bin-naar') return parseInt(d.antwoord, 2) === d.n && d.vraag.includes(`Schrijf ${d.n} `);
    if (d.soort === 'bin-van') return Number(d.antwoord) === parseInt(/is\s*$|Het getal ([01]+)/.exec(d.vraag)[1], 2);
    if (d.soort === 'rom-som') return rom(d.antwoord) === d.a + d.b;
    return rom(d.antwoord) === d.a - d.b && d.a > d.b;
  },
  bgh: (d) => {
    if (d.soort === 'stukken') return Number(d.antwoord) === d.n && d.vraag.includes(`1/${d.n} van`);
    if (d.soort === 'geheel') return Number(d.antwoord) / d.n === d.x && d.vraag.includes(`1/${d.n} van een getal is ${d.x}`);
    return d.antwoord === 'nee' && /grote pizza/.test(d.vraag) && /kleine pizza/.test(d.vraag);
  },
  bkv: (d) => {
    const [, n, q] = /(\d+)\/(\d+): /.exec(d.vraag.replace(' ', '')) || /(\d+)\/(\d+) om/.exec(d.vraag);
    const honderdsten = Math.round(Number(n) / Number(q) * 100 + 1e-9), ruw = Number(n) / Number(q) * 100;
    return Math.abs(Number(d.antwoord.replace(',', '.')) * 100 - Math.round(ruw)) < 1e-6 && Math.abs(ruw - Math.round(ruw)) > 1e-6 && honderdsten >= 0;
  },
  dbc: (d) => {
    const ver = (t) => Number(t.replace(',', '.')), frac = d.n / d.d;
    if (d.soort === 'plus') return Math.abs(ver(d.antwoord) - (d.dec / 100 + frac)) < 1e-9 && d.vraag.startsWith(`${d.vraag.split(' ')[0]} + ${d.n}/${d.d}`);
    if (d.soort === 'min') return Math.abs(ver(d.antwoord) - (d.dec / 100 - frac)) < 1e-9 && ver(d.antwoord) > 0;
    return Math.abs(ver(d.antwoord) - frac * (d.dec / 100)) < 1e-9;
  },
  hsg: (d) => ['histogram', 'staafdiagram'].includes(d.antwoord) && d.fouten.includes('cirkeldiagram') && (/klassen|raken elkaar|op elkaar aansluiten/.test(d.vraag) ? d.antwoord === 'histogram' : d.antwoord === 'staafdiagram'),
  kvg: (d, o) => {
    const uit = [...o.svg.markup.matchAll(/data-item="([A-C])" data-w="(\d+)"/g)].map(m => ({ l: m[1], w: Number(m[2]) })), n = d.soort === 'massa' ? 2 : 3;
    if (uit.length !== n || new Set(uit.map(x => x.w)).size !== n) return false;
    const sorted = [...uit].sort((a, b) => b.w - a.w);
    if (d.soort === 'massa') { const y = Object.fromEntries([...o.svg.markup.matchAll(/data-item="([A-C])" data-w="\d+" data-y="(\d+)"/g)].map(m => [m[1], Number(m[2])])); if (!(y[sorted[0].l] > y[sorted[1].l])) return false; } // het zwaarste hangt het laagst
    const midden = /niet het/.test(d.vraag), meest = /langste|grootste|meeste|zwaarste/.test(d.vraag) && !midden, minst = /kortste|kleinste|minste|lichtste/.test(d.vraag) && !midden;
    const goed = midden ? sorted[1] : meest ? sorted[0] : minst ? sorted[n - 1] : null;
    return !!goed && d.antwoord === goed.l && (!midden || n === 3);
  },
  ksm: (d, o) => {
    const tel = (l) => (o.svg.markup.match(new RegExp(`data-eenheid="${l}"`, 'g')) || []).length, a = tel('A'), b = tel('B');
    if (/samen\. Hoeveel/.test(d.vraag)) return Number(d.antwoord) === a + b;
    if (/erbij krijgen/.test(d.vraag)) return a > b && Number(d.antwoord) === a - b;
    return /kwijt/.test(d.vraag) && a > b && Number(d.antwoord) === a - b;
  },
  knm: (d, o) => {
    const n = Number(/data-n="(\d+)"/.exec(o.svg.markup)[1]), eenheden = (o.svg.markup.match(/data-eenheid="1"/g) || []).length;
    return n === eenheden && Number(d.antwoord) === n && n >= 1 && n <= 10 && d.vraag.includes({ lengte: 'blokjes lang', oppervlakte: 'tegels groot', inhoud: 'bekertjes water', massa: 'evenveel als' }[d.soort]);
  },
  kmi: (d) => {
    if (d.soort === 'conservatie') return ['evenveel', 'even lang'].includes(d.antwoord) && !d.fouten.includes('evenveel') && !d.fouten.includes('even lang');
    if (d.soort === 'grootheid') return d.antwoord === (/potloden/.test(d.vraag) ? 'lengte' : /tassen/.test(d.vraag) ? 'massa' : /glas/.test(d.vraag) ? 'inhoud' : 'oppervlakte') && /bladen|potloden|tassen|glazen/.test(d.vraag);
    return d.soort === 'strategie' && d.antwoord.length > 1;
  },
  kgd: (d, o) => {
    if (d.soort === 'munt-waarde') return Number(d.antwoord) === d.euro && o.svg.markup.includes(`€${d.euro}`);
    if (d.soort === 'munt-aantal') return Number(d.antwoord) === (o.svg.markup.match(/€\d/g) || []).length && d.lijst.length === Number(d.antwoord);
    if (d.soort === 'sparen-som') return Number(d.antwoord) === d.w * d.e && d.vraag.includes(`${d.e} euro`) && d.vraag.includes(`${d.w} weken`);
    if (d.soort === 'sparen-woord') return (d.antwoord === 'sparen') === /Dat noem je/.test(d.vraag);
    return d.soort === 'betalen' && ['geld', 'papier', 'metaal', 'betalen', 'portemonnee'].includes(d.antwoord);
  },
  ktd: (d) => {
    const DAG = ['opstaan', 'ontbijten', 'naar school gaan', 'middageten', 'naar huis gaan', 'avondeten', 'tanden poetsen', 'slapen'], WEEK = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    if (d.soort === 'eerst') { const [, x, y] = /: (.+) of (.+)\? ____/.exec(d.vraag); return d.antwoord === (DAG.indexOf(x) < DAG.indexOf(y) ? x : y) && DAG.indexOf(x) >= 0 && DAG.indexOf(y) >= 0; }
    if (d.soort === 'daarna') { const x = /direct na (.+)\? ____/.exec(d.vraag)[1]; return DAG.indexOf(x) >= 0 && d.antwoord === DAG[DAG.indexOf(x) + 1]; }
    if (d.soort === 'aftellen') { const [, x, y] = /Vandaag is het (\w+)\. Op (\w+) is/.exec(d.vraag); return Number(d.antwoord) === WEEK.indexOf(y) - WEEK.indexOf(x) && WEEK.indexOf(y) > WEEK.indexOf(x); }
    return d.soort === 'duur' && ['zandloper', 'klok', 'timer'].includes(d.antwoord);
  },
  kpl: (d) => {
    const PIJL = { '→': 'rechts', '←': 'links', '↑': 'omhoog', '↓': 'omlaag' };
    if (d.soort === 'route') { const pijlen = [...d.vraag.split('Je volgt de pijlen: ')[1].split('.')[0].split(' ')], naam = /ga je (\w+)\?/.exec(d.vraag)[1]; return Number(d.antwoord) === pijlen.filter(x => PIJL[x] === naam).length; }
    if (d.soort === 'situeren') { const tegen = { 'links van': 'rechts van', 'rechts van': 'links van', voor: 'achter', achter: 'voor' }; const x = /staat (links van|rechts van|voor|achter) jou/.exec(d.vraag)[1]; return d.antwoord === tegen[x]; }
    if (d.soort === 'plaats') { const m = /(?:legt|zet) (de \w+|het \w+) (\w+) (de \w+|het \w+)\./.exec(d.vraag); return !!m && d.antwoord === m[2] && d.vraag.includes(`${m[1][0].toUpperCase() + m[1].slice(1)} is ____ ${m[3]}`); }
    const antw = { tegen: ['tegen', 'tegenover'], omhoog: ['omhoog', 'omlaag'], vooruit: ['vooruit', 'achteruit'], recht: ['recht naar', 'schuin naar'], kant: ['onderkant', 'bovenkant', 'voorkant', 'achterkant'], vervorm: ['vervormd', 'vergroot', 'verkleind'] }[d.soort];
    return !!antw && antw.includes(d.antwoord);
  },
  krj: (d) => {
    const reeks = [...d.rijtje, d.antwoord], p = d.eenheid.length;
    return reeks.every((f, i) => f === d.eenheid[i % p]) && new Set(d.eenheid).size >= 2 && d.rijtje.length >= 2 * p && d.vraag.includes(d.rijtje.join(' '));
  },
  kst: (d, o) => {
    const tel = {}; for (const m of o.svg.markup.matchAll(/data-groep="(\w+)"/g)) tel[m[1]] = (tel[m[1]] || 0) + 1;
    const namen = Object.keys(tel), waarden = Object.values(tel);
    if (new Set(waarden).size !== waarden.length) return false;
    if (d.soort === 'label' || d.soort === 'staaf') return Number(d.antwoord) === tel[d.naam] && d.vraag.includes(d.naam);
    if (d.soort === 'grootst-kleinst') return d.antwoord === namen.reduce((b, n) => ((d.meer ? tel[n] > tel[b] : tel[n] < tel[b]) ? n : b));
    if (d.soort === 'verschil') return Number(d.antwoord) === tel[d.a] - tel[d.b] && tel[d.a] > tel[d.b];
    return d.antwoord === namen.reduce((b, n) => (tel[n] > tel[b] ? n : b));
  },
  glj: (d, o) => {
    const stukken = [...o.svg.markup.matchAll(/data-stuk="(\d+)"/g)].map(m => Number(m[1]));
    return stukken.join() === d.lengtes.join() && Number(d.antwoord) === stukken.reduce((a, b) => a + b, 0) && d.lengtes.length >= 3;
  },
  dbr: (d) => {
    if (d.soort === 'maal') {
      if (d.wat === 'honderdsten') return Number(d.antwoord) === d.a * d.b && d.vraag.includes(`${d.a}/10 × ${d.b}/10`);
      if (d.wat === 'tienden') return Number(d.antwoord) === d.a;
      return Number(d.antwoord.replace(',', '.')) === (d.a * d.b) / 100 && Math.abs(Number(d.antwoord.replace(',', '.')) * 100 - d.a * d.b) < 1e-9;
    }
    const m = /^([\d,]+) : ([\d,]+) =/.exec(d.vraag), x = Number(m[1].replace(',', '.')), y = Number(m[2].replace(',', '.'));
    return Math.abs(x / y - Number(String(d.antwoord).replace(',', '.'))) < 1e-9 && d.q >= 2 && Number.isInteger(Math.round(x * 10)) && Math.abs(y * 10 - d.d) < 1e-9;
  },
  vrm: (d, o) => {
    const markup = o.svg?.markup || '', v = d.vraag;
    switch (d.soort) {
      case 'plr': return lijnSoort(markup) === { punt: 'punt', lijn: 'recht', rond: 'rond' }[d.w] && d.antwoord === d.w;
      case 'rg': return d.wat === 'lijn' ? lijnSoort(markup) === (d.gebogen ? 'gebogen' : 'recht') && d.antwoord === (d.gebogen ? 'gebogen' : 'recht') : d.antwoord === (/cirkel|ei heeft/.test(v) ? 'gebogen' : 'rechte');
      case 'lijnsoort': return lijnSoort(markup) === d.antwoord && ['rechte', 'lijnstuk', 'halfrechte', 'kromme'].includes(d.antwoord);
      case 'notatie': case 'punt': {
        const L = d.L;
        switch (d.wat) {
          case 'rechte-naam': return d.antwoord === 'kleine';
          case 'rechte-letter': return d.antwoord === 'a';
          case 'punt-letter': case 'naam': return d.antwoord === L[d.wat === 'naam' ? 1 : 0] && d.antwoord === d.antwoord.toUpperCase();
          case 'halfrechte': return d.antwoord === `[${L[0]}${L[1]}` && !d.antwoord.endsWith(']');
          case 'hoek': return d.antwoord.normalize('NFC') === `${L[0]}̂`.normalize('NFC');
          case 'driehoek': return d.antwoord === `∆${L[0]}${L[1]}${L[2]}`;
          case 'vierhoek': return d.antwoord === `vierhoek ${L.join('')}`;
          case 'snijpunt': return d.antwoord === 'punt';
          default: return d.antwoord === 'kruisje';
        }
      }
      case 'lb': return d.antwoord == (d.welke ? d.l : d.b) && d.l > d.b;
      case 'hbs': {
        if (d.wat === 'schuin') { const ls = d.letters.map(l => zijdeLengte(markup, l)); return d.antwoord === d.letters[ls.indexOf(Math.max(...ls))] && d.antwoord === d.letters[2]; }
        const hoogte = /data-hoogte="1" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/.exec(markup), basis = /data-basis="1" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/.exec(markup);
        return hoogte[1] === hoogte[3] && basis[2] === basis[4] && hoogte[4] === basis[2] && d.antwoord === (d.wat === 'hoogte' ? 'hoogte' : 'basis') && (d.wat === 'hoogte' ? /gestippelde/.test(v) : /dikke zijde/.test(v));
      }
      case 'begrensd': return d.wat === 'tekening' ? d.antwoord === (lijnSoort(markup) === 'lijnstuk' ? 'begrensd' : 'onbegrensd') : d.antwoord === (/lijnstuk is/.test(v) ? 'begrensd' : 'onbegrensd');
      default: return d.antwoord === RUIMTE_ANTWOORD.find(([k]) => v.startsWith(k))[1];
    }
  },
  bgw: (d) => {
    const v = d.vraag;
    switch (d.soort) {
      case 'notatie-plus': return d.wat === 'haakjes' ? d.antwoord === '5 + 2' : d.antwoord === { optellen: '+', aftrekken: MINT, 'is gelijk aan': '=', 'is niet gelijk aan': '≠' }[d.woord] && v.includes(`"${d.woord}"`);
      case 'notatie-maal': return d.antwoord === { vermenigvuldigen: '×', delen: ':', maal: '×', 'gedeeld door': ':' }[d.woord];
      case 'optel': switch (d.wat) {
        case 'som': return d.antwoord === 'som' && v.includes(`${d.a} + ${d.b} = ${d.a + d.b}`);
        case 'termen': return d.antwoord === 'termen';
        case 'verschil': return d.antwoord === 'verschil' && d.a > d.b && v.includes(`${d.a} − ${d.b} = ${d.a - d.b}`);
        case 'aanvullen': return d.x + Number(d.antwoord) === d.t;
        case 'wegdoen': return d.g - Number(d.antwoord) === d.k;
        default: return d.antwoord === '+';
      }
      case 'maal': return { product: d.antwoord === 'product', 'quotiënt': d.antwoord === 'quotiënt' && v.includes(`${d.a * d.b} : ${d.b} = ${d.a}`), factoren: d.antwoord === 'factoren', keer: d.antwoord == d.a * d.b, gedeeld: d.antwoord == d.a && v.startsWith(`${d.a * d.b} gedeeld door ${d.b}`) }[d.wat];
      case 'aftrektal': return { aftrektal: d.antwoord === 'aftrektal' && v.includes(`${d.a} − ${d.b}`), aftrekker: d.antwoord === 'aftrekker' && v.includes(`is ${d.b} de`), deeltal: d.antwoord === 'deeltal' && v.includes(`is ${d.q * d.d} het`), deler: d.antwoord === 'deler' && v.includes(`is ${d.d} de`) }[d.wat];
      case 'opgaand': return d.antwoord === (d.n % d.d === 0 ? 'opgaande' : 'niet-opgaande');
      case 'splitsen': return d.antwoord === (d.wat === 'splitsen' ? 'splitsen' : 'verdelen');
      case 'plaats': return d.wat === 'optellen' ? d.antwoord == d.b : d.wat === 'maal' ? d.antwoord == d.b : d.antwoord === 'nee';
      case 'omgekeerd': return { plus: d.antwoord == d.a, maal: d.antwoord == d.b, woord: d.antwoord === 'aftrekken', schakelen: d.antwoord == d.a }[d.wat];
      case 'compenseren': return d.x + d.y === d.t + Number(d.antwoord) && d.t % 10 === 0 && d.t - d.x >= 1 && d.t - d.x <= 3;
      case 'optelsoort': {
        const t = d.tekst, e = /krijgt er \d+ bij|geeft er \d+ weg|stappen \d+ kinderen (uit|bij)/.test(t) ? 'oorzaak-verandering' : /ouder dan|duurder dan|meer dan Jan/.test(t) ? 'vergelijking' : 'combinatie';
        return d.antwoord === e && d.goed === e;
      }
      case 'keersoort': { const t = d.tekst, e = /zoveel|zo hoog/.test(t) ? 'vergelijking' : /combinaties/.test(t) ? 'combinatie' : /rijen/.test(t) ? 'rooster' : 'keerhandeling'; return d.antwoord === e && d.goed === e; }
      case 'deelsoort': return d.antwoord === (/eerlijk over/.test(d.tekst) ? 'verdelingsdeling' : 'verhoudingsdeling') && d.antwoord === (d.verdeling ? 'verdelingsdeling' : 'verhoudingsdeling');
      default: return d.antwoord == d.k && d.k * d.e > 0;
    }
  },
  sit: (d) => {
    const v = d.vraag;
    switch (d.soort) {
      case 'situatie': {
        const op = /krijgt er \d+ bij|rode en/.test(d.tekst) ? '+' : /geeft er \d+ weg|Hoeveel meisjes/.test(d.tekst) ? MINT : /dozen met|rijen met/.test(d.tekst) ? '×' : ':';
        if (op !== d.op) return false;
        if (d.wat === 'juist-fout') return d.antwoord === 'nee' && d.ander !== d.op;
        const [x, y] = d.uit.split(' ').filter(z => z !== '+' && z !== MINT && z !== '×' && z !== ':').map(Number);
        const getallen = (d.tekst.match(/\d+/g) || []).map(Number);
        const goed = op === '+' ? x + y : op === MINT ? x - y : op === '×' ? x * y : x / y;
        return d.antwoord === d.uit && Number.isFinite(goed) && goed > 0 && getallen.includes(x) && getallen.includes(y) || (op === ':' && getallen.includes(y));
      }
      case 'rest': return d.antwoord == d.n % d.dl && d.n % d.dl > 0;
      case 'breukplus': {
        if (d.wat === 'ongelijknamig') { const [p1, q1, p2, q2] = d.x; return d.antwoord === `${p1}/${q1} + ${p2}/${q2}` && q1 !== q2; }
        return d.wat === 'optellen' ? d.antwoord === `${d.a}/${d.n} + ${d.b}/${d.n}` && /samen opgegeten/.test(v) : d.antwoord === `${d.a + d.b}/${d.n} ${MINT} ${d.b}/${d.n}` && /blijft er over/.test(v);
      }
      case 'breukmaal': return d.wat === 'nat-maal-breuk' ? d.antwoord === `${d.k} × ${d.p1}/${d.q1}` && v.includes(`${d.k} flessen`) : d.antwoord === `${d.p1}/${d.q1} × ${d.p2}/${d.q2}` && v.includes('van dat sap');
      case 'breukdeel': return d.antwoord === `${d.k} : 1/${d.q}` && v.includes(`flesjes van 1/${d.q} liter`);
      case 'pctmaal': return d.antwoord === `${String(d.pct / 100).replace('.', ',')} × ${d.bedrag}` && Math.abs(rekenUit(d.antwoord) - (d.pct * d.bedrag) / 100) < 1e-9;
      case 'vanmaal': return d.antwoord === `${d.p1}/${d.q1} × ${d.n}` && d.n % d.q1 === 0;
      case 'splitsen': return d.links ? d.a + Number(d.antwoord) === d.n : Number(d.antwoord) + d.a === d.n;
      case 'rek-plus': return d.wat === 'bij' ? d.antwoord == d.a + d.n : d.wat === 'weg' ? d.antwoord == d.a && d.a + d.n <= 14 : d.antwoord == d.n;
      case 'rek-maal': return d.wat === 'maal' ? d.antwoord == d.k * d.e && d.k * d.e <= 10 : d.antwoord == d.e && d.k * d.e <= 10;
      default: return d.antwoord == d.eerst && d.eerst - d.weg >= 1 && v.includes(`Nu heeft`);
    }
  },
  gtl: (d, o) => {
    const markup = o.svg?.markup || '';
    switch (d.soort) {
      case 'begrip': return d.wat === 'negatief' ? d.antwoord === 'negatief' : d.wat === 'positief' ? d.antwoord === 'positief' : d.wat === 'minteken' ? d.antwoord === MINT : d.antwoord == d.lijst.filter(x => x < 0).length;
      case 'as': return d.wat === 'nul' ? d.antwoord == 0 : d.wat === 'links-van' ? d.antwoord === negT(-d.n + 1) : d.antwoord === negT(-d.n - 1);
      case 'terug': return d.reeks.every((x, i) => i === 0 || x === d.reeks[i - 1] - 1) && d.antwoord === negT(d.reeks[d.gat]) && d.reeks[d.reeks.length - 1] >= -20;
      case 'context': return d.wat === 'schuld' ? d.antwoord === `${MINT}${d.n}` : d.wat === 'temperatuur' ? d.antwoord === 'kouder' : d.antwoord === 'onder';
      case 'vergelijk': return d.wat === 'teken' ? d.antwoord === (d.a < d.b ? '<' : '>') && d.a !== d.b : getalUitTekst(d.antwoord) === (d.klein ? Math.min(...d.lijst) : Math.max(...d.lijst)) && new Set(d.lijst).size === 3;
      case 'plaats': { const [w] = asWaardeNeg(markup); return w === getalUitTekst(d.antwoord) && w === d.antwoordGetal && w === d.start + d.i * d.stap; }
      default: { const [x, y] = asWaardeNeg(markup).sort((a, b) => a - b); return x === d.a && y === d.b && d.antwoord == y - x && y - x > 0; }
    }
  },
  rtb: (d) => {
    const v = d.vraag;
    switch (d.soort) {
      case 'komma': return d.wat === 'euro' ? d.antwoord === ',' : d.wat === 'dm' ? d.antwoord == d.c : d.antwoord == d.c && d.c >= 11;
      case 'halfdubbel': return d.antwoord == { dubbel: d.n * 2, helft: d.n / 2, kwart: d.n / 4, 'helft-van': d.n * 2 }[d.wat];
      case 'delen': return d.wat === 'gelijk' ? d.antwoord == d.e && d.k * d.e === Number(/(\d+) stukjes/.exec(v)[1]) : d.wat === 'ongelijk' ? d.antwoord === 'nee' && d.a !== d.b : d.antwoord === d.goed && d.goed === (d.delen === 2 ? 'helft' : 'kwart');
      case 'teller': return d.wat === 'teller' ? d.antwoord === 'teller' : d.wat === 'noemer' ? d.antwoord === 'noemer' : d.wat === 'streep' ? d.antwoord === 'breukstreep' : d.antwoord === 'geheel';
      case 'stam': return d.wat === 'stambreuk' ? d.antwoord === 'stambreuk' : d.wat === 'echt' ? d.antwoord === (d.g < d.h ? 'echte' : 'onechte') : d.antwoord === (d.t === 1 ? 'ja' : 'nee');
      case 'tiende': return d.antwoord === (d.wat === 'tienden' ? 'tienden' : 'honderdsten');
      case 'duizendste': return d.antwoord === 'duizendsten';
      case 'gelijkw': {
        if (d.wat === 'uitbreiden') return d.antwoord == d.t * d.f && d.t / d.q === (d.t * d.f) / (d.q * d.f);
        if (d.wat === 'vereenvoudigen') return d.antwoord == d.t && d.t / d.q === (d.t * d.f) / (d.q * d.f);
        return d.antwoord === (d.q === d.q2 ? 'gelijknamig' : 'ongelijknamig');
      }
      case 'decbreuk': return d.wat === 'decimaal' ? d.antwoord === `${d.t}/${d.noem}` && [10, 100, 1000].includes(d.noem) && ![10, 100, 1000].includes(d.q) : d.antwoord === (gcdT(d.t, d.q) > 1 ? 'ja' : 'nee');
      case 'oneigenlijk': return d.wat === 'naam' ? d.t > d.q && d.antwoord === 'oneigenlijke' : d.antwoord == d.t - d.g * d.q && d.rest > 0 && d.rest < d.q;
      case 'procent': return d.wat === 'noemer' ? d.antwoord == 100 : d.wat === 'per' ? d.antwoord === 'honderd' : d.antwoord == d.x;
      case 'verhouding': return d.wat === 'op' ? d.antwoord == d.b : d.antwoord == d.a + d.b;
      case 'groei': return Math.abs(d.nieuw - (d.toe ? d.base * (1 + d.pct / 100) : d.base * (1 - d.pct / 100))) < 1e-9 && getalUitTekst(d.antwoord) === (d.toe ? d.pct : -d.pct) && Math.abs(((d.nieuw - d.base) / d.base) * 100 - getalUitTekst(d.antwoord)) < 1e-9;
      case 'asym': return Math.abs(d.antwoord - d.base * (1 + d.pct / 100) * (1 - d.pct / 100)) < 1e-9 && d.eind !== d.base;
      case 'relatief': { const g1 = (d.b1 - d.a1) / d.a1, g2 = (d.b2 - d.a2) / d.a2; return d.antwoord === (g1 > g2 ? 'Lotte' : 'Jan') && Math.abs(g1 - g2) >= 0.02; }
      case 'omgekeerd': return d.wat === 'natuurlijk' ? d.antwoord === `1/${d.q}` : d.antwoord === (d.t === 1 ? `${d.q}` : `${d.q}/${d.t}`);
      case 'deling': return d.wat === 'noemer' ? d.antwoord == d.q : d.antwoord === `${d.t}/${d.q}`;
      case 'nat': return d.wat === 'teller' ? d.antwoord == d.n * d.q : d.antwoord == d.n;
      default: {
        const lijst = v.split(': ')[1].replace(/\? ____$/, '').split(', '), w = lijst.map(hondVan), lo = Math.min(hondVan(/tussen (.+?) en/.exec(v)[1]), hondVan(/ en (.+?): /.exec(v)[1])), hi = Math.max(hondVan(/tussen (.+?) en/.exec(v)[1]), hondVan(/ en (.+?): /.exec(v)[1]));
        return w.filter(x => x > lo && x < hi).length === 1 && hondVan(d.antwoord) > lo && hondVan(d.antwoord) < hi && new Set(w).size === w.length;
      }
    }
  },
  rel: (d) => {
    const w = (v) => Object.entries(TEKEN_NAAM).find(([, t]) => t === v)[0];
    if (d.wat === 'teken') return d.antwoord === d.teken && d.vraag.includes(`"${w(d.teken)}"`);
    if (d.wat === 'woorden-getallen') return d.antwoord === d.teken && geldt(d.a, d.teken, d.b) && d.vraag.includes(`(${w(d.teken)})`);
    if (d.wat === 'juist-fout') return d.waar === geldt(d.a, d.teken, d.b) && d.antwoord === (d.waar ? 'juist' : 'fout');
    return d.antwoord === (d.a < d.b ? '<' : '>') && d.a !== d.b;
  },
  gbg: (d) => {
    const n = d.n, v = d.vraag;
    switch (d.soort) {
      case 'cijfer': return d.wat === 'aantal' ? d.antwoord == String(n).length : d.wat === 'laatste' ? d.antwoord === String(n % 10) : d.antwoord == 10;
      case 'aantal': return d.wat === 'even' ? d.antwoord === (n % 2 === 0 ? 'even' : 'oneven') : d.wat === 'voor' ? d.antwoord == d.plek - 1 && d.plek >= 2 && d.plek <= d.tot : d.antwoord === (/\de |plaats|in de rij/.test(d.zin) ? 'rangorde' : 'aantal') && d.antwoord === d.goed;
      case 'deel': return d.n === undefined ? d.antwoord === (d.wat === 'veelvoud' ? 'veelvoud' : 'deler') && (d.d * d.q) % d.d === 0 : d.n === d.d * d.q + d.rest && d.rest > 0 && d.rest < d.d && d.antwoord === d.wat;
      case 'afronden': return d.antwoord == Math.floor((n + d.e / 2) / d.e) * d.e && n % d.e !== d.e / 2;
      case 'td': case 'hd': case 'm': case 'tm': case 'hm': case 'mrd': {
        const w = TAL_WAARDE[d.soort];
        return d.wat === 'tal-naar-getal' ? kaalGetal(d.antwoord) === d.k * w : d.wat === 'getal-naar-tal' ? d.antwoord == d.k && kaalGetal(v.split(' =')[0]) === d.k * w : kaalGetal(d.antwoord) === w;
      }
      case 'miljoen': return d.wat === 'naar-getal' ? kaalGetal(d.antwoord) === d.k * 1e6 : d.wat === 'naar-miljoen' ? d.antwoord == d.k : d.antwoord == 6;
      case 'miljard': return d.wat === 'naar-getal' ? kaalGetal(d.antwoord) === d.k * 1e9 : d.wat === 'miljoen' ? kaalGetal(d.antwoord) === 1000 : d.antwoord == 9;
      case 'as': return d.wat === 'links-van' ? d.antwoord == d.x + 1 : d.wat === 'rechts-van' ? d.antwoord == d.x - 1 : d.antwoord == Math.max(...d.lijst);
      case 'tussen': return d.antwoord == d.a + 1;
      case 'een-meer': return d.antwoord == (d.meer ? d.a + 1 : d.a - 1);
      case 'orde-rij': {
        const lijsten = /A: ([\d, ]+) B: ([\d, ]+) /.exec(v).slice(1, 3).map(x => x.trim().split(', ').map(Number)), oplopend = (l) => l.every((x, i) => i === 0 || x > l[i - 1]), aflopend = (l) => l.every((x, i) => i === 0 || x < l[i - 1]);
        const gekozen = lijsten['AB'.indexOf(d.antwoord)];
        return d.weinig ? oplopend(gekozen) && !oplopend(lijsten['AB'.indexOf(d.antwoord === 'A' ? 'B' : 'A')]) : aflopend(gekozen) && !aflopend(lijsten['AB'.indexOf(d.antwoord === 'A' ? 'B' : 'A')]);
      }
      case 'middelste': return d.antwoord == d.a + 1;
      case 'vorig-volgend': return d.antwoord == (d.vor ? d.a - 1 : d.a + 1);
      case 'hoeveel': return d.wat === 'nul' ? d.antwoord == 0 : d.antwoord == d.a - d.b && d.a > d.b;
      default: return d.antwoord == d.a && (d.er ? v.includes(`${d.a - 1}.`) : v.includes(`${d.a + 1}.`));
    }
  },
  rij: (d) => {
    const reg = regelVanRij(d.rij);
    if (reg !== d.regel) return false;
    if (d.vorm === 'regel') return d.antwoord === reg;
    return d.rij[d.gat] === d.antwoordGetal && kaalGetal(d.antwoord) === d.rij[d.gat] && d.gat >= 2;
  },
  rom: (d) => {
    if (d.soort === 'systeem') { const e = /plaats of kleur/.test(d.vraag) ? 'plaats' : /Romeinse cijfers zijn/.test(d.vraag) ? 'additief' : 'plaatswaardesysteem'; return d.antwoord === e; }
    if (d.soort === 'lezen') return d.antwoord == d.n && romeinsWaarde(d.t) === d.n && d.t === romeinsTekst(d.n) && d.n >= 1 && d.n <= 2500 && d.vraag.includes(d.t);
    return d.antwoord === romeinsTekst(d.n) && romeinsWaarde(d.antwoord) === d.n && d.n <= 2500;
  },
  gas: (d, o) => {
    if (d.soort === 'plaats') return Math.abs(asWaarde(o.svg.markup) - kaalGetal(d.antwoord)) < 0.5 && kaalGetal(d.antwoord) === d.antwoordGetal && d.antwoordGetal === d.start + d.i * d.stap;
    if (d.soort === 'vergelijk') { const g = [...d.drie].sort((a, b) => a - b), e = d.vorm === 'grootst' ? g[2] : d.vorm === 'kleinst' ? g[0] : g[1]; return kaalGetal(d.antwoord) === e && new Set(d.drie).size === 3 && d.drie.every(x => d.vraag.replace(/\s/g, '').includes(String(x))); }
    if (d.wat === 'minstens') return kaalGetal(d.antwoord) === 10 ** (d.k - 1);
    const dichtst = Math.round(d.n / d.afrond) * d.afrond; return kaalGetal(d.antwoord) === dichtst && Math.abs(d.n - dichtst) <= d.afrond / 2;
  },
  aan: (d, o) => {
    const markup = o.svg?.markup || '';
    switch (d.soort) {
      case 'tellen': return telPunten(markup, 'A') === d.n && d.antwoord == d.n;
      case 'vergelijk': {
        if (d.l) { const e = d.meest ? Math.max(...d.l) : Math.min(...d.l); return d.antwoord == e && new Set(d.l).size === 3; }
        const a = telPunten(markup, 'A'), b = telPunten(markup, 'B'); return a === d.a && b === d.b && a !== b && d.antwoord === ((d.meest ? a > b : a < b) ? 'A' : 'B');
      }
      case 'splits': return d.wat === 'eenheden' ? telPunten(markup, 'A') === d.n && d.antwoord == d.n - 10 : d.wat === 'getal' ? d.antwoord == d.n && d.vraag.startsWith(`1 tiental en ${d.n - 10} eenheden`) : d.antwoord === 'tiental';
      case 'beeld': { if (d.wat === 'frame') return telPunten(markup, 'A') === d.n && d.antwoord == d.n; const m = telMab(markup); return d.antwoord == m.t * 10 + m.e + m.h * 100 && m.t * 10 + m.e === d.n; }
      case 'rang': { const i = Number(/data-kind="(\d+)" data-markeer="1"/.exec(markup)[1]); return d.antwoord === RANG_NAAM[i] && i === d.i; }
      case 'terug': return d.reeks.every((x, k) => k === 0 || x === d.reeks[k - 1] - 1) && d.antwoord == d.reeks[d.gat];
      case 'koppel': return d.wat === 'woord-naar-getal' ? d.antwoord == d.n && d.vraag.includes(`"${woordTweede(d.n)}"`) : d.antwoord === woordTweede(d.n);
      case 'cons': return d.wat === 'een-een' ? d.antwoord == d.n - d.m && d.m < d.n : d.antwoord == d.n && d.vraag.includes(String(d.n));
      case 'groep': { const m = telMab(markup); return m.t === d.t && m.e === d.e && d.antwoord == d.t * 10 + d.e; }
      default: return (markup.match(/data-streep/g) || []).length === d.n && d.antwoord == d.n;
    }
  },
  mvb: (d) => {
    const kaal = (x) => Number(String(x).replace(/\s/g, ''));
    if (d.soort === 'inh-vol') {
      if (d.wat === 'inh-naar-vol') { const w = IN_DM3[d.van] / IN_DM3[d.naar]; return w >= 1 && kaal(d.antwoord) === w && d.factor === w; }
      const w = IN_DM3[d.naar] / IN_DM3[d.van]; return w > 1 && d.antwoord === d.naar && d.factor === w && d.vraag.replace(/\s/g, '').startsWith(`${d.factor}${d.van}=1`);
    }
    if (d.soort === 'massa-vol') { const w = { l: 'kg', 'dm³': 'kg', ml: 'g', 'cm³': 'g', 'm³': 't' }[d.eenheid]; return w === d.massa && d.antwoord == d.aantal && d.vraag.startsWith(`${d.aantal} ${d.eenheid} water weegt`); }
    if (d.wat === undefined) { const m = d.eenheden.map(e => machtVan(e, d.ladder)); return d.antwoord === d.eenheden[m.indexOf(Math.max(...m))] && new Set(m).size === m.length; }
    const verschil = machtVan(d.van, d.ladder) - machtVan(d.naar, d.ladder), f = 10 ** Math.abs(verschil);
    if (d.wat === 'een') return verschil > 0 && kaal(d.antwoord) === f && d.factor === f && d.vraag.startsWith(`1 ${d.van} =`);
    if (d.wat === 'terug-een') return verschil < 0 && d.antwoord === d.naar && d.factor === f;
    if (d.wat === 'aantal') return verschil > 0 && kaal(d.antwoord) === d.n * f && d.vraag.startsWith(`${d.n} ${d.van} =`);
    return verschil < 0 && d.antwoord == d.n && d.factor === f && d.vraag.replace(/\s/g, '').startsWith(`${d.n * f}${d.van}=`);
  },
  rfm: (d) => {
    const [min, max] = BEREIK[d.gr]?.[d.naam] || [NaN, NaN];
    if (!(d.w * SI[d.e] >= min * 0.999 && d.w * SI[d.e] <= max * 1.001)) return false;
    if (d.soort === 'eenheid') return d.antwoord === d.e && d.vraag.includes('____') && d.vraag.includes(nlGetal(d.w));
    if (d.soort === 'getal') return d.antwoord === nlGetal(d.w) && d.vraag.includes(`____ ${d.e}`);
    const mid = (n) => Math.sqrt(BEREIK[d.gr][n][0] * BEREIK[d.gr][n][1]), waarden = d.namen.map(mid), beste = d.groot ? Math.max(...waarden) : Math.min(...waarden);
    return d.namen.length === 3 && d.antwoord === d.namen[waarden.indexOf(beste)] && d.antwoord === d.antwoordNaam && waarden.every(x => x === beste || Math.abs(Math.log10(x / beste)) > 0.5);
  },
  mtb: (d) => {
    const v = d.vraag;
    switch (d.soort) {
      case 'btn': return BTN[v] === d.antwoord;
      case 'ctx': return begripAntwoord(v) === d.woord && d.antwoord === d.woord;
      case 'straal': case 'pi': {
        const a = /diameter van een cirkel is (\d+) cm/.exec(v), b = /straal van een cirkel is (\d+) cm/.exec(v);
        if (a) return d.t === 'straal' && d.antwoord == a[1] / 2; if (b) return d.t === 'straal' && d.antwoord == b[1] * 2;
        if (d.t === 'pi') return d.antwoord === '3,14' && v.includes('π');
        return /2 keer de ____/.test(v) ? d.antwoord === 'straal' : /rand tot rand/.test(v) && d.antwoord === 'diameter';
      }
      case 'def-inhoud': return d.antwoord === 'inhoud' && /hoeveelheid/.test(v);
      case 'def-volume': return /ruimte/.test(v) ? d.antwoord === 'volume' : /vlak binnen/.test(v) && d.antwoord === 'oppervlakte';
      case 'def-gewicht': return d.antwoord === 'massa' && /gewicht|weegt|weegschaal meet/.test(v);
      case 'def-hoogte': return d.antwoord === 'hoogte' && /afstand tussen de/.test(v);
      case 'def-weeg': return /instrument/.test(v) ? d.antwoord === 'weegschaal' : d.antwoord === 'massa';
      case 'massa-volume': {
        const zwaar = ['ijzeren', 'loden', 'stenen', 'zand', 'metaal'], licht = ['piepschuimen', 'kurken', 'sponzen', 'watten', 'hout'], i = zwaar.findIndex(w => v.includes(w));
        return i >= 0 && v.includes(licht[i]) && v.includes('even groot') && d.antwoord === (/grootste/.test(v) ? d.zwaar : d.licht) && d.antwoord.includes(/grootste/.test(v) ? zwaar[i] : licht[i]);
      }
      case 'instr': {
        const w = d.wat, e = /jezelf|eigen/.test(w) ? 'personenweegschaal' : /massa/.test(w) ? 'keukenweegschaal' : /inhoud|hoeveelheid melk/.test(w) ? 'maatbeker' : /klaslokaal|speelplaats|tuin/.test(w) ? 'rolmeter' : /potlood|gom|schrift/.test(w) ? 'liniaal' : null;
        return e === d.antwoordTekst && d.antwoord === e && v.includes(w);
      }
      default: return false;
    }
  },
  omr: (d, o) => {
    const markup = o.svg?.markup || '';
    if (d.soort === 'omtrek' || d.soort === 'opp') { const c = meetCellen(markup); return new Set(c.map(x => x.join())).size === c.length && c.length === d.aantal && d.antwoord == (d.soort === 'omtrek' ? buurTel(c) : c.length) && d.vraag.includes(d.soort === 'omtrek' ? 'omtrek' : 'oppervlakte van de figuur'); }
    if (d.soort === 'kubus') {
      const tel = (x) => (markup.match(new RegExp(`data-vlak="${x}"`, 'g')) || []).length, v = tel('v'), t = tel('t'), z = tel('z'), l = Math.round(Math.sqrt(v * t / z)), b = t / l, h = v / l;
      return l === d.l && b === d.b && h === d.h && l * b * h > 0 && d.antwoord == (d.vorm === 'laag' ? l * b : l * b * h) && z === b * h;
    }
    if (d.soort === 'zelfde') {
      const A = meetCellen(markup, 'A'), B = meetCellen(markup, 'B'), pA = buurTel(A), pB = buurTel(B);
      if (A.length !== B.length || pA === pB || A.length !== d.N) return false;
      return d.vorm === 'omtrek' ? d.antwoord == pA && /figuur A/.test(d.vraag) : d.antwoord === ((d.vorm === 'grootste') === (pA > pB) ? 'A' : 'B');
    }
    const exp = /oppervlakte/.test(d.vraag) ? 2 : /volume/.test(d.vraag) ? 3 : 1;
    return d.exp === exp && d.antwoord === (exp === 1 ? d.basis : exp === 2 ? `${d.basis}²` : `${d.basis}³`);
  },
  dkl: (d, o) => {
    const mk = String(d.m).padStart(2, '0'), svg = o.svg?.markup || '';
    if (d.soort === 'digitaal' && d.wat === 'analoog-naar-digitaal') {
      const hoeken = [...svg.matchAll(/rotate\(([\d.]+) 88 88\)/g)].map(x => Number(x[1]));
      return hoeken.length === 2 && Math.abs(hoeken[0] - ((d.h % 12) * 30 + d.m * 0.5)) < 0.6 && Math.abs(hoeken[1] - d.m * 6) < 0.6 && d.antwoord === `${d.h}:${mk}`;
    }
    if (d.soort === 'digitaal') return svg.includes(`data-tijd="${d.h}:${mk}"`) && (d.wat === 'uur' ? d.m === 0 && d.antwoord == d.h : d.antwoord == d.m && d.m > 0);
    if (d.soort === 'wijzer') return d.antwoord === (d.groot ? 'minuten' : 'uren') && svg.includes('rotate(');
    if (d.soort === 'notatie') return d.wat === 'tekst-naar-klok' ? d.antwoord === `${d.h}:${mk}` && d.vraag.startsWith(`${d.h}.${mk} uur`) : d.antwoord === `${d.h}.${mk}` && d.vraag.includes(`${d.h}:${mk}`);
    return d.antwoord === (d.voor ? 'voormiddag' : 'namiddag') && (d.voor ? d.h >= 8 && d.h <= 11 : d.h >= 1 && d.h <= 5);
  },
  dgn: (d) => {
    const week = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'], w = (k) => week[(k % 7 + 7) % 7];
    const e = { volgende: w(d.i + 1), vorige: w(d.i - 1), tussen: w(d.i + 1), aantal: d.n }[d.soort];
    return String(d.antwoord) === String(e) && (d.soort !== 'aantal' || (d.n >= 2 && d.n <= 5 && d.vraag.includes(w(d.i + d.n))));
  },
  dur: (d) => {
    if (d.soort === 'vergelijk') { const m = d.items.map(x => x.min), e = d.langst ? Math.max(...m) : Math.min(...m); return new Set(m).size === m.length && d.antwoord === d.items.find(x => x.min === e).naam && d.vraag.includes(d.langst ? 'langst' : 'kortst'); }
    if (d.soort === 'uur') return d.antwoord == d.min && d.min === { uur: 60, halfuur: 30, tweeuur: 120, kwartier: 15 }[d.maat] && d.vraag.startsWith({ uur: 'Een uur', halfuur: 'Een half uur', tweeuur: 'Twee uur', kwartier: 'Een kwartier' }[d.maat]);
    if (d.afstand) return d.antwoord == d.afstand / d.uren && d.afstand % d.uren === 0;
    const maanden = { trimester: 3, semester: 6 }, jaren = { decennium: 10, eeuw: 100, millennium: 1000 };
    if (d.naam in maanden) { const m = maanden[d.naam], k = /^(\d+) /.exec(d.vraag); return d.vraag.startsWith('Een jaar heeft') ? d.antwoord == 12 / m : k ? d.antwoord == Number(k[1]) * m : d.antwoord == m && d.eenheid === 'maanden'; }
    return d.antwoord == jaren[d.naam] && d.eenheid === 'jaar';
  },
  thm: (d, o) => {
    const svg = o.svg?.markup || '';
    if (d.soort === 'aflezen') return svg.includes(`data-waarde="${d.v}"`) && d.antwoord === (d.v < 0 ? `−${-d.v}` : String(d.v)) && d.v >= d.min && d.v <= d.max;
    if (d.soort === 'punten') return d.antwoord == ({ vries: 0, smelt: 0, kook: 100 }[d.wat]) && d.vraag.includes({ vries: 'bevriest water', kook: 'kookt water', smelt: 'smelt ijs' }[d.wat]) !== d.vraag.startsWith({ vries: 'Water bevriest', kook: 'Water kookt', smelt: 'IJs smelt' }[d.wat]);
    return d.antwoord === '°C' && /graden Celsius schrijf je als \d+ ____/.test(d.vraag);
  },
  gld: (d, o) => {
    const euro = /\d+/;
    switch (d.soort) {
      case 'lezen': return d.antwoord == d.e && (o.svg?.markup || '').includes(`data-prijs="${d.e}"`);
      case 'meest': { const p = d.items.map(x => x.euro), e = d.meest ? Math.max(...p) : Math.min(...p); return new Set(p).size === p.length && d.antwoord === d.items.find(x => x.euro === e).naam; }
      case 'euromunten': return d.antwoord == d.e && d.vraag.includes(`${d.e} euro`);
      case 'kopen': return d.prijzen.reduce((a, b) => a + b, 0) === d.totaal && d.totaal <= 10 && d.antwoord == d.totaal;
      case 'samenstellen': {
        const min = Array(d.cent + 1).fill(Infinity); min[0] = 0;
        for (let c = 1; c <= d.cent; c++) for (const w of d.reeks) if (w <= c && min[c - w] + 1 < min[c]) min[c] = min[c - w] + 1;
        return min[d.cent] === d.n && d.antwoord == d.n && Number.isFinite(d.n);
      }
      case 'teken': return d.antwoord === (d.wat === 'eur' ? 'EUR' : '€');
      case 'winst': return d.antwoord == d.verkoop - d.inkoop && d.verkoop > d.inkoop;
      case 'verlies': return d.antwoord == d.inkoop - d.verkoop && d.inkoop > d.verkoop;
      case 'korting': return d.antwoord == d.oud - d.nieuw && d.oud > d.nieuw;
      case 'verkoop': return d.antwoord == d.inkoop + d.winst;
      case 'kortingspct': return Math.abs(d.antwoord - ((d.oud - d.nieuw) / d.oud) * 100) < 1e-9;
      case 'winstpct': return Math.abs(d.antwoord - ((d.verkoop - d.inkoop) / d.inkoop) * 100) < 1e-9;
      case 'intrest': return Math.abs(d.antwoord - (d.kapitaal * d.pct) / 100) < 1e-9 && euro.test(d.vraag);
      default: return false;
    }
  },
  hks: (d) => (d.soort === 'som' ? d.antwoord == d.a + d.b && d.a + d.b <= 180 : d.antwoord == d.rest - d.a && d.a < d.rest && (d.rest === 90 || d.rest === 180)),
  tel: (d, o) => {
    if (d.tel === 'buur') { const e = { na: d.n + 1, voor: d.n - 1, meer: d.n + 1, minder: d.n - 1 }[d.soort]; return d.antwoord == e && e >= 0; }
    const r = d.reeks, stap = Math.abs(r[1] - r[0]); const toon = (x) => (d.dec ? hon2(x) : spatie(x));
    for (let i = 1; i < r.length; i++) if (r[i] - r[i - 1] !== (d.terug ? -stap : stap)) return false;
    return stap > 0 && d.gat >= 1 && d.gat <= r.length - 2 && d.antwoord === toon(r[d.gat]) && r.every(x => x >= 0 && x % stap === 0 || d.dec);
  },
  afr: (d) => d.antw === afrondTweede(d.n, d.eenheid) && d.n % d.eenheid !== 0 && d.antwoord === spatie(d.antw) && d.vraag.includes(spatie(d.n)),
  dlb: (d) => (d.dlb === 'ja' ? d.antwoord === (d.n % d.d === 0 ? 'ja' : 'nee') && gedeeldDoor(d.n, d.d) === (d.antwoord === 'ja') : d.antwoord == d.n - Math.floor(d.n / d.d) * d.d && d.rest === d.n % d.d && d.rest > 0),
  vlv: (d) => {
    switch (d.vlv) {
      case 'deler': return d.antwoord === (gedeeldDoor(d.n, d.d) ? 'ja' : 'nee');
      case 'veelvoud': return d.antwoord == d.a * d.k;
      case 'veelvoud-ja': return d.antwoord === (gedeeldDoor(d.n, d.a) ? 'ja' : 'nee');
      case 'ggd': { let g = 1; for (let x = 1; x <= Math.min(d.a, d.b); x++) if (d.a % x === 0 && d.b % x === 0) g = x; return d.antwoord == g && g > 1; }
      case 'kgv': { let m = Math.max(d.a, d.b); while (m % d.a || m % d.b) m++; return d.antwoord == m; }
      case 'priem': return d.antwoord === (priemTest(d.n) ? 'ja' : 'nee');
      case 'priemfactoren': { const f = d.antwoord.split(' × ').map(Number); return f.reduce((a, b) => a * b, 1) === d.n && f.every(priemTest) && f.every((x, i) => i === 0 || x >= f[i - 1]) && !priemTest(d.n); }
      default: return false;
    }
  },
  rng: (d) => {
    const eind = (w) => (w.endsWith('ste') ? 'ste' : 'de');
    const verwacht = RANG_TABEL[d.n] ?? (d.n < 20 ? woordTweede(d.n) + 'de' : woordTweede(d.n) + 'ste');
    return d.woord === verwacht && (d.rng === 'woord' ? d.antwoord === verwacht : d.antwoord === `${d.n}${eind(verwacht)}`) && (d.n < 20 ? !verwacht.endsWith('ste') || [1, 8].includes(d.n) : verwacht.endsWith('ste'));
  },
  wrd: (d) => {
    if (d.wrd === 'woord') return d.antwoord === woordTweede(d.n) && (WOORD_TABEL[d.n] === undefined || WOORD_TABEL[d.n] === d.antwoord);
    if (d.wrd === 'cijfer') return d.antwoord === String(d.n) && d.vraag.startsWith(woordTweede(d.n));
    if (d.wrd === 'duizend') return d.n === d.a * 1000 + d.c && d.antwoord === spatie(d.n);
    return d.n === d.a * 1e6 + d.b * 1e3 + d.c && d.antwoord === spatie(d.n);
  },
  pws: (d) => {
    switch (d.pws) {
      case 'waarde': { const s = String(d.n), i = s.indexOf(String(d.cijfer)); return s.lastIndexOf(String(d.cijfer)) === i && d.waarde === d.cijfer * 10 ** (s.length - 1 - i); }
      case 'splits': { const delen = d.vraag.split(' = ')[1]; return somDelen(delen.replace('____', `${d.antwoord}`)) === d.n && delen.includes(`____ ${d.plaats}`); }
      case 'samenstel': return somDelen(d.vraag) === d.n && d.antwoord === spatie(d.n);
      case 'herstruct': { const delen = d.vraag.split(' = ')[1]; return somDelen(delen.replace('____', `${d.antwoord}`)) === d.n && Number(d.antwoord) >= 10; }
      default: return false;
    }
  },
  adg: (d) => {
    const heeftGetal = d.zin.replace(/ /g, '').includes(String(d.getal)) || d.zin.includes(spatie(d.getal));
    const rangorde = /\d+(de|ste)\b/.test(d.zin), code = /(nummer|lokaal|kleedkamer|postcode|pincode|kluisje)/.test(d.zin);
    return heeftGetal && d.antwoord === (rangorde ? 'rangorde' : code ? 'code' : 'aantal') && d.adg === d.antwoord;
  },
  taf: (d) => (d.taf === 'maal' ? d.prod === d.a * d.b && d.antwoord == d.prod : d.prod === d.a * d.b && d.antwoord == d.b),
  dsp: (d) => d.Q * d.b + d.rest === d.a && d.rest === d.a % d.b && d.rest < d.b && d.antwoord == d.Q,
  bkd: (d) => {
    switch (d.bkd) {
      case 'halfdubbel': return d.antwoord == (d.soort === 'helft' ? d.n / 2 : d.soort === 'kwart' ? d.n / 4 : d.n * 2) && Number.isInteger(Number(d.antwoord));
      case 'breuk-van': return d.n % d.b === 0 && d.antwoord == (d.n / d.b) * d.a;
      case 'procent-van': return (d.pct * d.n) % 100 === 0 && d.antwoord == (d.pct * d.n) / 100;
      case 'geheel': return d.deel * d.b === d.a * d.G && d.antwoord == d.G;
      case 'geheel-procent': return d.deel * 100 === d.pct * d.G && d.antwoord == d.G;
      case 'benoem': return d.soort === 'procent' ? d.antwoord * d.G === d.deel * 100 : eenvoudig(d.antwoord) && gelijkB(alsBreuk(d.antwoord), { n: d.deel, d: d.G });
      default: return false;
    }
  },
  omz: (d) => {
    switch (d.omz) {
      case 'gelijkwaardig': return d.antwoord * d.b === d.a * (d.b * d.k);
      case 'vereenvoudig': return d.antwoord == d.a && gcdT(d.a, d.b) === 1;
      case 'gelijknamig': return d.antwoord * d.b1 === d.a1 * d.L && d.L % d.b1 === 0 && d.L % d.b2 === 0;
      case 'dec-breuk': return d.richting === 'breuk-naar-dec' ? gelijkB(parseWaarde(d.antwoord), { n: d.a, d: d.b }) : eenvoudig(d.antwoord) && gelijkB(alsBreuk(d.antwoord), { n: d.h, d: 100 });
      case 'breuk-procent': return d.antwoord * d.b === d.a * 100;
      case 'procent-dec': return d.richting === 'procent-naar-dec' ? gelijkB(parseWaarde(d.antwoord), { n: d.h, d: 100 }) : d.antwoord == d.h;
      case 'paraat': return d.richting === 'breuk-naar-procent' ? d.antwoord * d.b === d.a * 100 : eenvoudig(d.antwoord) && gelijkB(alsBreuk(d.antwoord), { n: d.pct, d: 100 });
      default: return false;
    }
  },
  bvg: (d) => {
    const teken = (x, y) => Math.sign(x.n * y.d - y.n * x.d);
    if (d.bvg === 'vergelijk') return d.antwoord === (teken(d.x, d.y) < 0 ? '<' : teken(d.x, d.y) > 0 ? '>' : '=');
    const lijst = d.antwoord.split(' < ').map(parseWaarde);
    return lijst.length === 3 && lijst.every((x, i) => i === 0 || teken(lijst[i - 1], x) < 0) && d.waarden.length === 3 && d.waarden.every(w => lijst.some(x => gelijkB(x, w)));
  },
  dcm: (d) => {
    if (d.dcm === 'plaats') { const [, f] = d.tekst.split(','); const i = f.indexOf(String(d.cijfer)); return f.lastIndexOf(String(d.cijfer)) === i && d.plaats === ['tienden', 'honderdsten', 'duizendsten'][i]; }
    if (d.dcm === 'dec-splits') { const [, f] = d.tekst.split(','); const idx = ['t', 'h', 'd'].indexOf(d.plaats); return idx >= 0 && d.cijfer === Number(f[idx]) && d.antwoord === String(d.cijfer); }
    if (d.dcm === 'dec-samenstel') return d.antwoord === d.tekst && d.tekst === `${d.E},${d.ds.join('')}`;
    const rest = d.duizendsten % (10 ** (3 - d.m)), omlaag = d.duizendsten - rest, hoog = rest * 2 >= 10 ** (3 - d.m) ? omlaag + 10 ** (3 - d.m) : omlaag;
    return d.afgerond === hoog && d.m >= 0 && d.m <= 2;
  },
  bkb: (d) => {
    const bew = d.bkb, som = (x, y) => ({ n: x.n * y.d + y.n * x.d, d: x.d * y.d }), min = (x, y) => ({ n: x.n * y.d - y.n * x.d, d: x.d * y.d });
    let x, y, res;
    if (bew === 'gl+' || bew === 'gl-') { x = { n: d.x, d: d.d }; y = { n: d.y, d: d.d }; res = bew === 'gl+' ? som(x, y) : min(x, y); }
    else { x = { n: d.a, d: d.d1 }; y = { n: d.b, d: d.d2 }; res = { 'ong+': som(x, y), 'ong-': min(x, y), maal: { n: x.n * y.n, d: x.d * y.d }, deel: { n: x.n * y.d, d: x.d * y.n } }[bew]; }
    return res.n > 0 && gelijkB(alsBreuk(d.antwoord), res) && eenvoudig(d.antwoord);
  },
  dcb: (d) => {
    const s = 10 ** d.nd;
    switch (d.dcb) {
      case 'dec+': return d.antw === d.a + d.b && d.antwoord === kommaGetal(d.antw, d.nd);
      case 'dec-': return d.antw === d.a - d.b && d.antw > 0 && d.antwoord === kommaGetal(d.antw, d.nd);
      case 'dec×': return d.antw === d.a * d.n && d.antwoord === kommaGetal(d.antw, d.nd);
      case 'dec:': return d.antw * d.n === d.a && d.antwoord === kommaGetal(d.antw, d.nd) && s > 0;
      case 'dec×dec': return d.antwoord === (d.x * d.y % 100 === 0 ? String(d.x * d.y / 100) : kommaTekst(d.x * d.y));
      case 'dec:dec': return d.z === d.x * d.q && d.antwoord === String(d.q);
      default: return false;
    }
  },
  tnv: (d) => {
    const nummer = (str) => Number(str.replace(/ /g, '').replace(',', '.'));
    switch (d.tnv) {
      case 'maal': return d.antw === d.n * d.f && nummer(d.antwoord) === d.antw;
      case 'deel': return d.n === d.antw * d.f && nummer(d.antwoord) === d.antw;
      case 'maal-dec': return Math.abs(nummer(d.antwoord) - (d.n * d.t) / 10 ** d.k) < 1e-9;
      case 'deel-dec': return Number.isInteger(d.antw) && Math.abs(d.antw - (d.n * 10 ** d.k) / d.t) < 1e-9 && nummer(d.antwoord) === d.antw;
      default: return false;
    }
  },
  cmp: (d) => {
    const A = Number(d.antwoord);
    switch (d.cmp) {
      case 'keer+': return d.a * d.b === d.a * (d.b - 1) + A;
      case 'keer-': return d.a * d.b === d.a * (d.b + 1) - A;
      case 'dubbel': return d.a * (2 * d.c) === d.a * d.c * A;
      case 'halve': return d.a * d.c === (d.a * 2 * d.c) / A;
      case 'inv+': return d.a + d.b === d.a + (d.b + d.e) - A && (d.b + d.e) % 10 === 0;
      case 'inv-': return d.a - d.b === d.a - (d.b + d.e) + A && (d.b + d.e) % 10 === 0 && d.a > d.b + d.e;
      default: return false;
    }
  },
  hnd: (d) => {
    const A = Number(String(d.antwoord).replace(/ /g, ''));
    switch (d.hnd) {
      case 'wissel': return A === d.a + d.b + d.c && (d.a + d.c) % d.eenheid === 0;
      case 'tiental': return d.richting === 'volgend' ? d.n + A === d.doel && d.doel % 10 === 0 && A < 10 && A > 0 : d.n - A === d.doel && d.doel % 10 === 0 && A < 10 && A > 0;
      case 'aanvul': return d.b + A === d.a;
      case 'analogie': return d.bew === '+' ? A === (d.x + d.y) * d.k : A === (d.x - d.y) * d.k;
      case 'splitsr': return d.delen.reduce((a, b) => a + b, 0) === d.b && A === d.delen.at(-1) && d.delen.every(x => x > 0);
      case 'distr×': return d.b1 + d.b2 === d.b && A === d.b2 && d.a * d.b === d.a * d.b1 + d.a * A;
      case 'distr:': return d.x1 + d.x2 === d.x && A === d.x2 && d.x1 % d.d === 0 && d.x2 % d.d === 0 && d.x / d.d === d.x1 / d.d + A / d.d;
      case 'tussen': return d.klein ? A === d.a + d.b : A === d.a + d.b && d.b1 + d.b2 === d.b;
      default: return false;
    }
  },
  sch: (d) => {
    const u = d.eenheid, ronden = (n, e) => { const rest = n % e; return rest * 2 >= e ? n - rest + e : n - rest; };
    const A = Number(d.antwoord.replace(/ /g, ''));
    if (d.sch === '×') return A === ronden(d.a, u) * ronden(d.b, d.eenheidB) && d.antw === A;
    return A === (d.sch === '+' ? ronden(d.a, u) + ronden(d.b, u) : ronden(d.a, u) - ronden(d.b, u)) && A > 0 && d.antw === A;
  },
  ctl: (d) => {
    if (d.sch) return ok.sch(d);
    const A = Number(d.antwoord.replace(/ /g, ''));
    switch (d.bew) { case '+': return A === d.a && d.a + d.b === d.s && d.s - d.b === A; case '−': return A === d.a && d.a - d.b === d.v && d.v + d.b === A; case '×': return A === d.a && d.a * d.b === d.pr && d.pr / d.b === A; case ':': return A === d.a && d.a / d.b === d.q && d.q * d.b === A; default: return false; }
  },
  cfr: (d) => {
    switch (d.cfr) {
      case 'cijfer+': return d.antw === d.a + d.b; case 'cijfer-': return d.antw === d.a - d.b && d.antw > 0; case 'cijfer×': return d.antw === d.a * d.b;
      case 'cijfer:': return d.q === Math.floor(d.a / d.b) && d.rest === d.a % d.b && Number(d.antwoord.replace(/ /g, '')) === d.q;
      default: return false;
    }
  },
  vlg: (d) => {
    const uit = d.uit.replace(/×/g, '*').replace(/−/g, '-').replace(/:/g, '/'); const waarde = Function(`"use strict"; return (${uit});`)();
    return waarde === d.antw && Number(d.antwoord) === waarde;
  },
  glk: (d) => (d.glk === 'gat' ? d.a + d.b === Number(d.antwoord) + d.c : d.antwoord === (d.a + d.b === d.rb + d.ra ? 'ja' : 'nee')),
  een: (d) => EENHEID_TABEL[d.naam] === d.sym && (d.een !== 'getal' || (d.n >= 2 && d.vraag.includes(`${d.n} ${d.naam} = ${d.n}`))),
  hrl: (d) => {
    const wissel = { 'l': 'dm³', 'ml': 'cm³', 'kl': 'm³' };
    if (d.hrl === 'inh-vol') return d.omgekeerd ? wissel[d.van] === d.naar && d.antwoord == d.n : wissel[d.van] === d.naar && d.antwoord == d.n;
    if (d.hrl === 'massa-vol') return d.antwoord == d.n;
    const exp = EXP_STELSEL[d.stelsel === 'ton' ? 'massa' : d.stelsel];
    if (!(d.van in exp && d.naar in exp)) return false;
    const verwacht = d.n * 10 ** (exp[d.van] - exp[d.naar]);
    return Math.abs(Number(d.antwoord.replace(/ /g, '').replace(',', '.')) - verwacht) < 1e-9 * Math.max(1, verwacht);
  },
  scl: (d) => {
    switch (d.scl) {
      case 'plan': return d.plan * d.n === d.werkelijkM * 100 && Number(d.antwoord) === d.plan;
      case 'werkelijk': return d.plan * d.n === d.werkelijkM * 100 && Number(d.antwoord.replace(/ /g, '')) === d.werkelijkM;
      case 'schaal': return d.plan * d.n === d.werkelijkCm && Number(d.antwoord.replace(/ /g, '')) === d.n;
      case 'omzet': return d.m * 100 === d.n && Number(d.antwoord.replace(/ /g, '')) === (d.richting === 'breuk-naar-lijn' ? d.m : d.n);
      case 'vergroot': return d.vergroten ? d.antw === d.cm * d.f && Number(d.antwoord) === d.antw : d.antw * d.f === d.cm && Number(d.antwoord.replace(',', '.')) === d.antw;
      default: return false;
    }
  },
  evr: (d) => d.y1 * d.x2 === d.y2 * d.x1 && Number(d.antwoord) === d.y2,
  snl: (d) => d.v * d.uren === d.s && Number(d.antwoord.replace(/ /g, '')) === ({ v: d.v, afstand: d.s, tijd: d.uren }[d.snl]),
  bnt: (d) => d.bruto === d.netto + d.tarra && Number(d.antwoord) === { bruto: d.bruto, netto: d.netto, tarra: d.tarra }[d.bnt],
  dch: (d) => d.d * d.V === d.m && Number(d.antwoord) === { d: d.d, m: d.m, V: d.V }[d.dch],
  prs: (d) => {
    const euroGetal = (txt) => Number(txt.replace('€ ', '').replace(/ /g, '').replace(',', '.'));
    switch (d.prs) {
      case 'winst': return d.verkoop - d.inkoop === d.winst && euroGetal(d.antwoord) === d.winst;
      case 'verlies': return d.inkoop - d.verkoop === d.verlies && euroGetal(d.antwoord) === d.verlies;
      case 'verkoop': return d.inkoop + d.winst === d.verkoop && euroGetal(d.antwoord) === d.verkoop;
      case 'korting': return d.oud - d.nieuw === d.korting && euroGetal(d.antwoord) === d.korting;
      case 'nieuwe': return d.oud - d.korting === d.nieuw && euroGetal(d.antwoord) === d.nieuw;
      case 'pct-korting': return d.oud * (100 - d.pct) / 100 === d.nieuw && euroGetal(d.antwoord) === d.nieuw;
      case 'pct-winst': return d.inkoop * (100 + d.pct) / 100 === d.verkoop && euroGetal(d.antwoord) === d.verkoop;
      case 'intrest': return d.kap * d.pct * d.jaren / 100 === d.intrest && Number(d.antwoord.replace(/ /g, '')) === d.intrest;
      case 'kapitaal': return d.kap * d.pct / 100 === d.intrest && Number(d.antwoord.replace(/ /g, '')) === d.kap;
      case 'tijd': return d.kap * d.pct * d.jaren / 100 === d.intrest && Number(d.antwoord) === d.jaren;
      default: return false;
    }
  },
  tds: (d) => {
    switch (d.tds) {
      case 'uren': return d.einde - d.start === d.duur && d.antwoord === `${Math.floor(d.duur / 60)} u ${d.duur % 60} min`;
      case 'sec': return d.totaal === d.min * 60 + d.sec && Number(d.antwoord) === d.totaal;
      case 'sec-naar-min': return d.totaal === d.min * 60 + d.sec && d.antwoord === `${Math.floor(d.totaal / 60)} min ${d.totaal % 60} s`;
      case 'dagen': { const dag = 86400000, a = Date.UTC(2023, d.mA, d.dA), b = Date.UTC(2023, d.mB, d.dB); return (b - a) / dag + 1 === d.dagen && Number(d.antwoord) === d.dagen && b >= a; }
      case 'eeuw': return d.eeuw === Math.floor((d.jaar - 1) / 100) + 1 && Number(d.antwoord) === d.eeuw;
      default: return false;
    }
  },
  tmp: (d) => (d.tmp === 'stijging' ? d.tot > d.van && Number(d.antwoord) === d.tot - d.van : d.tot < d.van && Number(d.antwoord) === d.van - d.tot),
  frm: (d) => {
    const A = Number(d.antwoord.replace(/ /g, '').replace(',', '.'));
    switch (d.frm) {
      case 'omtrek-veelhoek': return A === d.z.reduce((x, y) => x + y, 0);
      case 'omtrek-vierkant': return A === 4 * d.l;
      case 'omtrek-rechthoek': return A === 2 * (d.l + d.b);
      case 'omtrek-samengesteld': return A === 2 * (d.a + d.d);
      case 'opp-vierkant': return A === d.l * d.l;
      case 'opp-rechthoek': return A === d.l * d.b;
      case 'opp-samengesteld': return A === d.a * d.d - d.c * d.e;
      case 'opp-driehoek': return A === d.b * d.h / 2;
      case 'opp-parallellogram': return A === d.b * d.h;
      case 'opp-ruit': return A === d.d1 * d.d2 / 2;
      case 'opp-trapezium': return A === (d.b1 + d.b2) * d.h / 2;
      case 'omtrek-cirkel': return Math.abs(A - 3.14 * d.d) < 1e-9;
      case 'opp-cirkel': return Math.abs(A - 3.14 * d.r * d.r) < 1e-9;
      case 'oppv-kubus': return A === 6 * d.z * d.z;
      case 'oppv-balk': return A === 2 * (d.l * d.b + d.l * d.h + d.b * d.h);
      case 'vol-kubus': return A === d.z ** 3;
      case 'vol-balk': return A === d.l * d.b * d.h;
      case 'vol-cilinder': return Math.abs(A - 3.14 * d.r * d.r * d.h) < 1e-9;
      case 'vol-prisma': return A === d.grond * d.h;
      case 'vol-kegel': return A === d.grond * d.h / 3;
      default: return false;
    }
  },
  dgm: (d, o) => {
    const { cats, waarden: w, soort, a, b } = d, n = w.length, markup = o.svg.markup;
    if (new Set(w).size !== n || cats.length !== n || !cats.every(c => markup.includes(`>${c}`) || markup.includes(`${c} `))) return false;
    if (d.dgm === 'cirkel' && (som(w) !== 100 || w.some(x => x % 5 || x < 5))) return false;
    if (d.dgm === 'beeld' && (w.some(x => x % d.k) || (markup.match(/<circle/g) || []).length !== som(w) / d.k + 1)) return false;
    if (d.dgm === 'staaf' && (w.some(x => x % d.stap || x > d.max) || (markup.match(/<rect/g) || []).length !== n)) return false;
    if (d.dgm === 'lijn' && (w.some(x => x > d.max) || (markup.match(/<circle/g) || []).length !== n)) return false;
    const kleinste = cats[w.indexOf(Math.min(...w))], grootste = cats[w.indexOf(Math.max(...w))];
    switch (soort) {
      case 'lees': return d.antwoord == w[a] && d.vraag.includes(cats[a]);
      case 'meest': case 'hoogst': return d.antwoord === grootste;
      case 'minst': case 'laagst': return d.antwoord === kleinste;
      case 'verschil': return d.antwoord == w[a] - w[b] && w[a] > w[b] && d.vraag.includes(cats[a]) && d.vraag.includes(cats[b]);
      case 'totaal': return d.antwoord == som(w);
      case 'aantal': return d.dgm === 'cirkel' && d.antwoord == (w[a] * d.totaal) / 100 && Number.isInteger(Number(d.antwoord)) && d.vraag.includes(String(d.totaal));
      default: return false;
    }
  },
  cvb: (d, o) => {
    const hoek = d.p * 360 / 100, g = gcdT(d.p, 100), breuk = `${d.p / g}/${100 / g}`;
    const vraagOk = d.vraag.includes(d.cvb.startsWith('proc') ? `${d.p} %` : d.cvb.startsWith('hoek') ? `${hoek}°` : breuk);
    const verwacht = { 'proc-hoek': hoek, 'breuk-hoek': hoek, 'hoek-proc': d.p, 'breuk-proc': d.p, 'hoek-breuk': breuk, 'proc-breuk': breuk }[d.cvb];
    return vraagOk && hoek === d.hoek && d.antwoord == verwacht && o.svg.markup.includes('<path');
  },
  gem: (d) => {
    if (d.gem === 'verdeling') return d.antwoord * d.n === d.totaal && d.vraag.includes(`${d.n} kinderen`) && d.vraag.includes(String(d.totaal));
    const l = d.lijst, sorted = [...l].sort((x, y) => x - y), gemiddeld = som(l) / l.length;
    const med = l.length % 2 ? sorted[(l.length - 1) / 2] : (sorted[l.length / 2 - 1] + sorted[l.length / 2]) / 2;
    if (!d.vraag.includes(l.join(', ').replace(/, (\d+)$/, ' en $1'))) return false;
    if (d.gem === 'gemiddelde') return d.antwoord == gemiddeld && Number.isInteger(gemiddeld);
    if (d.gem === 'mediaan') return d.antwoord == med && Number.isInteger(med);
    return d.antwoord == Math.abs(gemiddeld - med) && gemiddeld !== med && Number.isInteger(gemiddeld) && Number.isInteger(med);
  },
  kns: (d) => {
    if (d.kns === 'nooit-altijd') {
      const v = d.vraag, nul = /kans op een 7|blauwe knikker|tegelijk kop en munt|nummer 99/.test(v), honderd = /kleiner dan 7|rode knikker trekt|kop of munt/.test(v);
      return nul !== honderd && d.antwoord == (nul ? 0 : 100);
    }
    if (d.kns === 'experiment') return d.antwoord == (d.x * 100) / d.n && d.x < d.n && d.vraag.includes(`${d.n} keer`) && d.vraag.includes(`${d.x} keer`);
    const T = som(d.tellers), r = d.tellers[d.gevraagd];
    if (T !== d.T || !d.vraag.includes(`${r} `)) return false;
    return d.kns === 'procent' ? d.antwoord == (r * 100) / T && Number.isInteger(Number(d.antwoord)) : (() => { const [x, y] = d.antwoord.split('/').map(Number); return x * T === y * r && gcdT(x, y) === 1; })();
  },
  vrg: (d, o) => {
    const num = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));
    const A = num(d.antwoord), V = d.vraag, heeft = (...l) => l.every(x => V.replace(/\s/g, '').includes(String(x).replace(/\s/g, '')));
    switch (d.vrg) {
      case 'enkel': case 'overbodig': {
        const e = { '+': d.x + d.y, '-': d.x - d.y, '×': d.x * d.y, '÷': d.x / d.y }[d.op];
        if (!Number.isInteger(e) || e < 0 || A !== e || !heeft(d.x === undefined ? 0 : d.op === '÷' ? d.x : d.x, d.y)) return false;
        if (d.vrg === 'overbodig') return heeft(d.extra) && ![d.x, d.y, e].includes(d.extra) && d.fouten.every(f => true);
        return true;
      }
      case 'signaal': return A === (d.soort === 'meer' ? d.x - d.y : d.x + d.y) && heeft(d.x, d.y) && V.includes(d.soort === 'meer' ? 'meer dan' : 'minder dan');
      case 'omgekeerd': return d.soort === 'keer' ? A * d.y === d.x && heeft(d.x, d.y) : A === (d.soort === 'erbij' ? d.x - d.y : d.x + d.y) && heeft(d.x, d.y);
      case 'dec': return d.a !== d.b && Math.round(A * 100) === (d.op === '+' ? d.a + d.b : d.a - d.b);
      case 'breuk+': { const [p, q] = d.antwoord.split('/').map(Number), q2 = q ?? 1, pn = q ? p : p; const w = d.op === '+' ? d.x + d.y : d.x - d.y; return pn * d.d === w * q2 && gcdT(pn, q2) === 1 && w > 0 && heeft(`${d.x}/${d.d}`, `${d.y}/${d.d}`); }
      case 'samengesteld':
        if (d.soort === 'wissel') return A === d.pay - d.n * d.p - d.q && A >= 0 && heeft(d.n, d.p, d.q, d.pay);
        if (d.soort === 'twee-soorten') return A === d.a * d.b + d.c * d.d;
        return A === d.q && d.k * d.q + d.w === (d.k * d.q + d.w) && heeft(d.k, d.k * d.q + d.w, d.w);
      case 'grootheid':
        if (d.soort === 'temp') return A === (d.op === 'warmer' ? d.a + d.b : d.a - d.b);
        if (d.soort === 'hoek') return A === d.tot - d.a && [90, 180, 360].includes(d.tot);
        if (d.soort === 'gelijk') return A === (d.op === '+' ? d.x + d.y : d.x - d.y) && A >= 0;
        return A === (d.op === '+' ? d.a * d.f + d.b : d.a * d.f - d.b) && A > 0 && { m: 100, km: 1000, l: d.klein === 'dl' ? 10 : 1000, kg: 1000, u: 60, euro: 100 }[d.groot] === d.f;
      case 'verhouding': return d.soort === 'gelijkwaardig' ? A === d.u * (d.q2 / d.q1) && Number.isInteger(d.q2 / d.q1) : d.soort === 'drie' ? A === (d.u * d.q1 * d.q2) / d.q1 : A === ((d.u * d.q2) / d.u) && A === d.q2;
      case 'omgekeerd-evenredig': return A * d.n2 === d.n1 * d.t1 && Number.isInteger(A);
      case 'niet-evenredig': return d.antwoord === (/dan twee keer|dan 40 kg|twee kranen/.test(d.stelling) ? 'nee' : 'ja') && d.vraag.includes(d.stelling);
      case 'procent-van': return A === (d.pct * d.n) / 100 && (d.pct * d.n) % 100 === 0;
      case 'breuk-van':
        if (d.soort === 'operator') return A === (d.n * d.a) / d.d && d.n % d.d === 0;
        if (d.soort === 'geheel') return A === d.n && d.n % d.d === 0 && heeft(`${d.a}/${d.d}`, (d.n / d.d) * d.a);
        if (d.soort === 'procent') return A === (d.pct * d.n) / 100 && (d.pct * d.n) % 100 === 0;
        { const [p, q] = d.antwoord.split('/').map(Number); return p * d.n === d.deel * (q ?? 1) && gcdT(p, q ?? 1) === 1; }
      case 'rest':
        if (d.soort === 'kgv') { let m = 1; while (m % d.a || m % d.b) m++; return A === m; }
        return A === { dozen: Math.floor(d.n / d.d), rest: d.n % d.d, nodig: Math.ceil(d.n / d.d) }[d.soort] && d.n % d.d !== 0;
      case 'som-verschil': { const klein = (d.S - d.v) / 2; return Number.isInteger(klein) && A === (d.wie === 'klein' ? klein : klein + d.v) && heeft(d.S, d.v); }
      case 'som-verhouding': { const k = d.S / (d.x + d.y); return Number.isInteger(k) && A === (d.wie === 'klein' ? k * d.x : k * d.y) && d.x < d.y; }
      case 'prijs':
        if (d.soort === 'winst') return A === d.verkoop - d.koop && A > 0;
        if (d.soort === 'verlies') return A === d.koop - d.verkoop && A > 0;
        if (d.soort === 'korting') return A * 100 === d.basis * (100 - d.pct);
        if (d.soort === 'stijging') return A * 100 === d.basis * (100 + d.pct);
        return A * 100 === d.kapitaal * d.rente * d.j;
      case 'bruto':
        if (d.soort === 'procent') return A * 100 === d.bruto * (100 - d.pct);
        return d.bruto === d.netto + d.tarra && A === { netto: d.netto, bruto: d.bruto, tarra: d.tarra }[d.soort];
      case 'schaal': { const f = { km: 100000, m: 100, cm: 1 }[d.eenheid]; return d.richting === 'naar-werkelijk' ? A * f === d.kaart * d.schaal : A === d.kaart && d.kaart * d.schaal % f === 0; }
      case 'snelheid': return d.s === d.v * d.t && A === { afstand: d.s, snelheid: d.v, tijd: d.t }[d.soort];
      case 'meetkunde':
        if (d.soort === 'rechthoek-breedte') return A * 2 + d.l * 2 === d.omtrek && A < d.l;
        if (d.soort === 'vierkant-zijde') return A * 4 === d.omtrek;
        if (d.soort === 'gelijkbenig-basis') return A + 2 * d.z === d.omtrek && A < 2 * d.z;
        if (d.soort === 'hoeksom') return A + d.a + d.b === 180 && A > 0;
        return A === d.l * d.b;
      case 'stat': {
        const l = d.lijst, tot = l.reduce((x, y) => x + y, 0);
        if (d.soort === 'ontbrekend') return (tot + A) / d.n === d.m && A >= 1;
        if (d.soort === 'mediaan') return A === [...l].sort((x, y) => x - y)[(l.length - 1) / 2] && l.length % 2 === 1;
        return A * l.length === tot && Number.isInteger(A);
      }
      case 'groei':
        if (d.soort === 'procent') return Math.abs(d.naar - d.van) * 100 === A * d.van;
        if (d.soort === 'nieuw') return A === d.van + (d.dir === 'toename' ? 1 : -1) * (d.van * d.pct) / 100;
        return A * (100 + (d.dir === 'toename' ? 1 : -1) * d.pct) === d.naar * 100;
      case 'relatief': return d.antwoord === (d.a1 * d.n2 > d.a2 * d.n1 ? 'klas A' : d.a1 * d.n2 < d.a2 * d.n1 ? 'klas B' : 'even groot') && d.a1 * d.n2 !== d.a2 * d.n1;
      case 'mengsel':
        if (d.soort === 'drank') return A * (d.x + d.y) === d.tot * d.x;
        return A * (d.w1 + d.w2) === d.w1 * d.p1 + d.w2 * d.p2 && Number.isInteger(A);
      case 'bevolking':
        if (d.soort === 'dichtheid') return A * d.opp === d.n; if (d.soort === 'aantal') return A === d.opp * d.dens; return A * d.dens === d.n;
      case 'massadichtheid':
        if (d.soort === 'massa') return A === d.rho * d.V; if (d.soort === 'volume') return A * d.rho === d.m; return A * d.V === d.m;
      case 'puzzel':
        if (d.soort === 'getal') return (d.dubbel ? A * 2 + d.x : A + d.x) === d.res;
        if (d.soort === 'patroon') { const r = d.reeks; return r.every((x, i) => i === 0 || x - r[i - 1] === d.stap) && A === r[4] + d.stap; }
        if (d.soort === 'poten') return A === d.a * 2 + d.b * 4;
        if (d.soort === 'handdruk') { let t = 0; for (let i = 1; i < d.n; i++) t += i; return A === t; }
        if (d.soort === 'kippen') return A * 4 + (d.dieren - A) * 2 === d.poten && A <= d.dieren;
        return A === 2 * d.j + d.v;
      default: return false;
    }
  },
  fig: (d, o) => {
    if (d.soort === 'cirkel') return d.diameter === d.straal * 2 && d.antwoord == (d.antwoordVan === 'diameter' ? d.diameter : d.straal) && d.vraag.includes(String(d.antwoordVan === 'diameter' ? d.straal : d.diameter));
    const markup = o.svg.markup, naam = figuurNaam(markup); if (naam !== d.naam) return false;
    if (d.soort === 'naam') return d.antwoord === naam;
    const P = veelhoekPunten(markup); if (!P) return false; const m = meet(P);
    return d.antwoord == { zijden: m.n, hoeken: m.n, rechte: m.rechte, evenwijdig: m.paren, diagonalen: (m.n * (m.n - 3)) / 2 }[d.soort];
  },
  rfg: (d, o) => o.svg.markup.includes(`data-fig="${d.naam}"`) && (d.soort === 'naam' ? d.antwoord === d.naam : d.soort === 'tellen' ? d.antwoord == RUIMTE_T[d.naam][d.wat] : d.antwoord === RUIMTE_T[d.naam].oppervlak),
  hoe: (d, o) => {
    if (d.soort === 'vergelijk') { const [a, b] = hoekenUit(o.svg.markup); return Math.abs(a - d.a) < 1.5 && Math.abs(b - d.b) < 1.5 && Math.abs(a - b) >= 15 && d.antwoord === (a > b ? 'A' : 'B'); }
    if (d.soort === 'soort') { const [g] = hoekenUit(o.svg.markup); return Math.abs(g - d.graden) < 1.5 && d.antwoord === hoekNaam(g); }
    return d.antwoord === (d.graden < 90 ? 'scherp' : d.graden === 90 ? 'recht' : d.graden === 180 ? 'gestrekt' : 'stomp') && d.vraag.includes(`${d.graden}°`);
  },
  lij: (d, o) => {
    if (d.soort === 'teken') return d.antwoord === (d.omgekeerd ? d.ligging : d.teken) && { evenwijdig: '∥', loodrecht: '⊥' }[d.ligging] === d.teken;
    const l = [...o.svg.markup.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map(m => [Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2])]);
    if (l.length !== 2) return false;
    const cross = Math.abs(l[0][0] * l[1][1] - l[0][1] * l[1][0]) / (Math.hypot(...l[0]) * Math.hypot(...l[1])), dot = Math.abs(l[0][0] * l[1][0] + l[0][1] * l[1][1]) / (Math.hypot(...l[0]) * Math.hypot(...l[1]));
    return d.antwoord === (cross < 0.02 ? 'evenwijdig' : dot < 0.02 ? 'loodrecht' : 'snijdend');
  },
  drh: (d, o) => {
    const P = veelhoekPunten(o.svg.markup), m = meet(P);
    if (d.soort === 'regelmatig') return d.antwoord === (m.alleZijden && m.alleHoeken ? 'regelmatig' : 'onregelmatig') && figuurNaam(o.svg.markup) === d.naam;
    if (P.length !== 3) return false;
    if (d.soort === 'zijden') { const eq = [gelijk(m.z[0], m.z[1]), gelijk(m.z[1], m.z[2]), gelijk(m.z[0], m.z[2])].filter(Boolean).length; return d.antwoord === (eq === 0 ? 'ongelijkbenige driehoek' : eq === 1 ? 'gelijkbenige driehoek' : 'gelijkzijdige driehoek'); }
    return d.antwoord === (m.h.some(x => Math.abs(x - 90) < 1.5) ? 'rechthoekige driehoek' : m.h.some(x => x > 90) ? 'stomphoekige driehoek' : 'scherphoekige driehoek');
  },
  upr: (d) => {
    let waar;
    if (d.soort === 'ook') { const [, a, b] = /^Elke? (\w+) is een (\w+)\.$/.exec(d.zin) ? [0, ...(/^Elke? (\w+) is een (\w+)\.$/.exec(d.zin).slice(1))] : []; waar = SUBSET[a].includes(b); }
    else if (d.soort === 'definitie') waar = DEF_T[d.x] === d.y;
    else if (d.soort === 'eigenschap') waar = ALTIJD_T[d.x].includes(d.y);
    else waar = DIAG_T[d.x].includes(d.y);
    return d.antwoord === (waar ? 'juist' : 'fout') && d.vraag.includes(d.zin);
  },
  log: (d, o) => {
    if (d.soort === 'venn') { const c = d.cnt, tot = c.alleenA + c.beide + c.alleenB + c.buiten; return tot === d.n && d.antwoord == c[d.gebied] && Object.values(c).every(v => o.svg.markup.includes(`>${v}</text>`)) && o.svg.markup.includes(`>${d.a}<`); }
    const figs = figurenUit(o.svg.markup); if (JSON.stringify(figs) !== JSON.stringify(d.figuren) || !figs.length) return false;
    const n = figs.length;
    if (d.soort === 'behoort') return d.antwoord === (past(figs[d.i], d.c) ? 'ja' : 'nee') && d.vraag.includes(`figuur ${String.fromCharCode(65 + d.i)}`);
    if (d.soort === 'alsdan') return d.antwoord === (figs.every(f => !past(f, d.a) || past(f, d.b)) ? 'ja' : 'nee');
    if (d.soort === 'kwantor') { const c = figs.filter(f => past(f, d.c)).length; return d.antwoord === ({ alle: c === n, geen: c === 0, sommige: c >= 1 && c < n, 'niet-alle': c < n, 'juist-een': c === 1, 'minstens-twee': c >= 2, 'hoogstens-twee': c <= 2 }[d.q] ? 'waar' : 'niet waar'); }
    const telt = figs.filter(f => (d.w === 'niet' ? !past(f, d.c) : d.w === 'of' ? past(f, d.c) || past(f, d.c2) : past(f, d.c))).length;
    return d.antwoord == telt;
  },
  trf: (d, o) => {
    const markup = o.svg.markup, A = cellenUit(markup, 'A');
    if (celSet(A) !== celSet(d.A) || !celAsymmetrisch(A)) return false;
    if (d.soort === 'soort') { const B = cellenUit(markup, 'B'); return klasseVan2(A, B) === d.transformatie && d.antwoord === d.transformatie && !markup.includes('data-as') && celSet(B) === celSet(d.B); }
    const as = asUit(markup); if (!as || as.soort !== d.as.soort || as.pos !== d.as.pos) return false;
    const spiegel = spiegelCellen(A, as);
    const kand = Object.fromEntries(['B', 'C', 'D'].map(id => [id, cellenUit(markup, id)]));
    const juisteIds = Object.keys(kand).filter(id => celSet(kand[id]) === celSet(spiegel));
    return juisteIds.length === 1 && juisteIds[0] === d.antwoord && d.goed === d.antwoord;
  },
  sym: (d, o) => {
    const P = veelhoekPunten(o.svg.markup); if (!P) return false;
    const n = symmetrieAssenTelling(P);
    if (d.soort === 'jn') return d.antwoord === (n > 0 ? 'symmetrisch' : /asymmetrisch/.test(d.vraag) ? 'asymmetrisch' : 'niet symmetrisch');
    if (d.soort === 'assen') return Number(d.antwoord) === n;
    const l = /data-as="lijn" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/.exec(o.svg.markup);
    return !!l && d.antwoord === (spiegelOmLijn(P, l.slice(1).map(Number)) ? 'ja' : 'nee');
  },
  pat: (d, o) => {
    const seq = patUit(o.svg.markup);
    if (d.soort === 'verandering' || d.soort === 'volgende') {
      const torens = [...o.svg.markup.matchAll(/data-toren="([^"]+)"/g)].map(m => m[1]), bekend = torens.filter(x => x !== '?').map(Number), stap = bekend[1] - bekend[0];
      if (!bekend.every((x, i) => i === 0 || x - bekend[i - 1] === stap) || stap < 1) return false;
      return d.soort === 'verandering' ? Number(d.antwoord) === stap && torens.length === bekend.length : torens[torens.length - 1] === '?' && Number(d.antwoord) === bekend[bekend.length - 1] + stap;
    }
    if (d.soort === 'eenheid') return Number(d.antwoord) === reeksPeriode(seq) && seq.length === 3 * reeksPeriode(seq);
    const gat = seq.indexOf('?'); if (gat < 0) return false;
    const bekend = seq.map((e, i) => (i === gat ? null : e));
    let p = 1; for (; p <= seq.length; p++) if (bekend.every((e, i) => e === null || bekend.every((f, j) => f === null || i % p !== j % p || e === f))) break;
    const vulling = bekend.find((e, i) => e !== null && i % p === gat % p);
    return vulling !== undefined && d.antwoord === patNaam(vulling) && (d.soort === 'volgend' ? gat === seq.length - 1 : gat < seq.length - 1) && p === d.u && seq.length >= 2 * p + 1;
  },
  pos: (d, o) => {
    if (d.soort === 'as') return d.antwoord === (d.eerste ? 'horizontale' : 'verticale');
    if (d.soort === 'rij') {
      const rij = patUit(o.svg.markup).map(patNaam); if (new Set(rij).size !== rij.length) return false;
      const i = rij.indexOf(d.antwoord), vorigeLinks = { links: (k) => k - 1, rechts: (k) => k + 1 };
      if (d.wat === 'eerste') return i === 0 && d.vraag.includes('links'); if (d.wat === 'laatste') return i === rij.length - 1 && d.vraag.includes('rechts');
      if (d.wat === 'tussen') return i === d.i && d.vraag.includes(rij[i - 1]) && d.vraag.includes(rij[i + 1]);
      return rij[d.i] !== undefined && i === vorigeLinks[d.wat](d.i) && d.vraag.includes(rij[d.i]);
    }
    if (d.soort === 'vak') {
      const items = [...o.svg.markup.matchAll(/data-vak="([A-Z]\d)" data-vorm="(\w+)" data-kleur="(\w+)"/g)].map(m => ({ vak: m[1], naam: patNaam(`${m[3]}-${m[2]}`) }));
      if (new Set(items.map(x => x.vak)).size !== items.length) return false;
      return d.wat === 'naam-naar-vak' ? items.some(x => x.vak === d.antwoord && d.vraag.includes(x.naam)) : items.some(x => x.naam === d.antwoord && d.vraag.includes(`vak ${x.vak}`));
    }
    const punten = [...o.svg.markup.matchAll(/data-punt="(\w)" data-x="(\d+)" data-y="(\d+)"/g)].map(m => ({ n: m[1], x: Number(m[2]), y: Number(m[3]) }));
    if (new Set(punten.map(p => `${p.x},${p.y}`)).size !== punten.length) return false;
    return d.wat === 'punt-naar-coordinaat' ? punten.some(p => d.vraag.includes(`punt ${p.n} is`) && d.antwoord === `(${p.x}, ${p.y})`) : punten.some(p => d.vraag.includes(`(${p.x}, ${p.y})`) && d.antwoord === p.n);
  },
  cng: (d, o) => {
    if (d.soort === 'schaal') return d.wat === 'tekening-naar-werkelijk' ? Number(d.antwoord) === d.x * d.n && d.vraag.includes(`1 : ${d.n}`) && d.vraag.includes(`${d.x} cm`) : Number(d.antwoord) === d.n && d.vraag.includes(`1/${d.n}`);
    if (d.soort === 'factor') return d.wat === 'vergroot' ? Number(d.antwoord) === d.a * d.f : d.wat === 'verkleind' ? Number(d.antwoord) === d.a && d.vraag.includes(`${d.a * d.f} cm`) : d.antwoord === (d.rechts > d.links ? 'vergroting' : 'verkleining');
    const f = polygonenUit(o.svg.markup), ids = ['A', 'B', 'C'];
    if (ids.some(i => !f[i])) return false;
    const paren = [['A', 'B'], ['A', 'C'], ['B', 'C']].map(([x, y]) => ({ naam: `${x} en ${y}`, k: gelijkvormigFactor(f[x], f[y]) }));
    const gevonden = paren.filter(q => q.k !== null && (d.soort === 'gelijkvormig' || Math.abs(q.k - 1) < 0.03));
    return gevonden.length === 1 && gevonden[0].naam === d.antwoord && d.goed === d.antwoord;
  },
  kal: (d) => {
    switch (d.feit) {
      case 'week-dagen': return d.antwoord === '7'; case 'weekend': return d.antwoord === 'zondag'; case 'weekdagen': return d.antwoord === '5'; case 'jaar-weken': return d.antwoord === '52'; case 'jaar-maanden': return d.antwoord === '12';
      case 'uur-min': case 'min-sec': return d.antwoord === '60'; case 'halfuur': return d.antwoord === '30'; case 'kwartier': return d.antwoord === '15'; case 'dag-uur': return d.antwoord === '24'; case 'uur-kwartier': return d.antwoord === '4';
      case 'jaar-dagen': return d.antwoord === '365'; case 'schrikkeljaar-dagen': return d.antwoord === '366';
      case 'schrikkel': return d.antwoord === (new Date(d.jaar, 1, 29).getDate() === 29 ? 'ja' : 'nee');
      case 'trimester': return d.antwoord === '3'; case 'semester': return d.antwoord === '6'; case 'decennium': return d.antwoord === '10'; case 'eeuw': return d.antwoord === '100'; case 'millennium': return d.antwoord === '1000'; case 'jaar-trimesters': return d.antwoord === '4';
      case 'maand-nummer': return d.antwoord === MND[d.i];
      case 'na-maand': return d.antwoord === MND[(d.i + 1) % 12];
      case 'maand-dagen': return Number(d.antwoord) === new Date(2023, d.i + 1, 0).getDate();
      case 'na-dag': return d.antwoord === DGN[(d.i + 1) % 7]; case 'voor-dag': return d.antwoord === DGN[(d.i + 6) % 7];
      case 'datum': return d.antwoord === MND[d.i] && d.dag >= 1 && d.dag <= new Date(2023, d.i + 1, 0).getDate();
      default: return false;
    }
  },
  eig: (d) => {
    const { eig: t, a, b, c, k, f1, f2 } = d;
    switch (t) {
      case 'comm+': return d.antwoord == a && a + b === b + a;
      case 'comm×': return d.antwoord == a && a * b === b * a;
      case 'ncomm-': return d.antwoord === 'nee' && a - b !== b - a;
      case 'ncomm:': return d.antwoord === 'nee' && Number.isInteger(a / b) && a / b !== b / a;
      case 'ass+': return d.antwoord == c && (a + b) + c === a + (b + c);
      case 'ass×': return d.antwoord == c && (a * b) * c === a * (b * c);
      case 'nass-': return d.antwoord === 'nee' && (a - b) - c !== a - (b - c) && a - b - c >= 0;
      case 'nass:': return d.antwoord === 'nee' && Number.isInteger(a / b) && Number.isInteger(b / c) && (a / b) / c !== a / (b / c);
      case 'dist×+': return d.antwoord == c && a * (b + c) === a * b + a * c;
      case 'dist×-': return d.antwoord == c && b > c && a * (b - c) === a * b - a * c;
      case 'dist:+': return d.antwoord == d.d && a % d.d === 0 && b % d.d === 0 && (a + b) / d.d === a / d.d + b / d.d;
      case 'dist:-': return d.antwoord == d.d && a % d.d === 0 && b % d.d === 0 && a > b && (a - b) / d.d === a / d.d - b / d.d;
      case 'n0+': return d.antwoord == a && (d.vraag.includes('+ 0') ? a + 0 === a : a - 0 === a);
      case 'n0-': return d.antwoord === 'nee' && 0 - a !== a - 0;
      case 'n1×': return d.antwoord == a && (d.deel ? a / 1 === a : a * 1 === a);
      case 'n1:': return d.antwoord === 'nee' && 1 / a !== a / 1;
      case 'op0×': return d.antwoord == 0 && a * 0 === 0;
      case 'op0:': return d.deelDoorNul ? d.antwoord === 'nee' : d.antwoord == 0 && 0 / a === 0;
      case 'inv+-': return d.antwoord == a && d.s - d.b === a && a + d.b === d.s;
      case 'inv×:': return d.antwoord == a && d.p / d.b === a && a * d.b === d.p;
      case 'herh': return d.deel ? d.antwoord == b && a * b - b * a === 0 && d.vraag.split('−').length - 1 === b : d.antwoord == a && d.vraag.split('+').length - 1 === b - 1;
      case 'comp+': return d.antwoord == k && a + b === (a + k) + (b - k);
      case 'comp-': return d.antwoord == k && a - b === (a + k) - (b + k);
      case 'comp×': return d.antwoord == k && b % k === 0 && a * b === (a * k) * (b / k);
      case 'comp:': return d.antwoord == k && a % b === 0 && a / b === (a * k) / (b * k);
      case 'ontb': return d.antwoord == f2 && (d.deel ? (a % (f1 * f2) === 0 && a / (f1 * f2) === a / f1 / f2) : a * f1 * f2 === a * (f1 * f2));
      case 'deelrest': return d.antwoord == d.rest && d.D === d.d * d.q + d.rest && d.rest < d.d;
      default: throw new Error(`onbekend type ${t}`);
    }
  },
};
/* ---- tweede, los geschreven hulpfuncties voor de controle */
const ONDER20 = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
const TIENEN = { 2: 'twintig', 3: 'dertig', 4: 'veertig', 5: 'vijftig', 6: 'zestig', 7: 'zeventig', 8: 'tachtig', 9: 'negentig' };
function woordTweede(n) {
  if (n === 1000) return 'duizend';
  const h = Math.floor(n / 100), rest = n % 100, t = Math.floor(rest / 10), e = rest % 10;
  let w = h ? (h === 1 ? 'honderd' : ONDER20[h] + 'honderd') : '';
  if (rest === 0) return w || 'nul';
  if (rest < 20) return w + ONDER20[rest];
  if (e === 0) return w + TIENEN[t];
  const verbinding = ['twee', 'drie'].includes(ONDER20[e]) ? 'ën' : 'en';
  return w + ONDER20[e] + verbinding + TIENEN[t];
}
const WOORD_TABEL = { 0: 'nul', 7: 'zeven', 12: 'twaalf', 13: 'dertien', 19: 'negentien', 20: 'twintig', 21: 'eenentwintig', 22: 'tweeëntwintig', 23: 'drieëntwintig', 24: 'vierentwintig', 38: 'achtendertig', 45: 'vijfenveertig', 67: 'zevenenzestig', 80: 'tachtig', 99: 'negenennegentig', 100: 'honderd', 101: 'honderdeen', 112: 'honderdtwaalf', 250: 'tweehonderdvijftig', 333: 'driehonderddrieëndertig', 478: 'vierhonderdachtenzeventig', 999: 'negenhonderdnegenennegentig', 1000: 'duizend' };
const RANG_TABEL = { 1: 'eerste', 2: 'tweede', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste', 9: 'negende', 10: 'tiende', 11: 'elfde', 12: 'twaalfde', 13: 'dertiende', 19: 'negentiende', 20: 'twintigste', 21: 'eenentwintigste', 22: 'tweeëntwintigste', 30: 'dertigste', 50: 'vijftigste', 99: 'negenennegentigste', 100: 'honderdste' };
const priemTest = (n) => { if (n < 2) return false; for (let d = 2; d < n; d++) if (n % d === 0) return false; return true; };
const gedeeldDoor = (n, d) => Math.floor(n / d) * d === n;
const afrondTweede = (n, u) => { const rest = n % u; return rest * 2 >= u ? n - rest + u : n - rest; };
const spatie = (n) => (String(n).length >= 5 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n));
const hon2 = (x) => `${Math.floor(x / 100)},${String(x % 100).padStart(2, '0')}`;
const PLAATS = ['E', 'T', 'H', 'D', 'TD', 'HD', 'M', 'TM', 'HM', 'Md'];
const somDelen = (tekst) => [...tekst.matchAll(/(\d+) (Md|HM|TM|HD|TD|M|D|H|T|E)\b/g)].reduce((s, [, c, pl]) => s + Number(c) * 10 ** PLAATS.indexOf(pl), 0);
const kommaGetal = (x, nd) => { const s = String(x).padStart(nd + 1, '0'), e = s.slice(0, -nd), f = s.slice(-nd).replace(/0+$/, ''); const e2 = e.length >= 5 ? e.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : e; return f ? `${e2},${f}` : e2; };
const EENHEID_TABEL = { meter: 'm', centimeter: 'cm', decimeter: 'dm', millimeter: 'mm', kilometer: 'km', hectometer: 'hm', decameter: 'dam', liter: 'l', deciliter: 'dl', centiliter: 'cl', milliliter: 'ml', kiloliter: 'kl', hectoliter: 'hl', decaliter: 'dal', kilogram: 'kg', hectogram: 'hg', decagram: 'dag', gram: 'g', decigram: 'dg', centigram: 'cg', milligram: 'mg', ton: 't', uur: 'u', minuut: 'min', seconde: 's', euro: '€', 'graden Celsius': '°C', graden: '°', hectare: 'ha', are: 'a', centiare: 'ca', 'vierkante meter': 'm²', 'vierkante decimeter': 'dm²', 'vierkante centimeter': 'cm²', 'vierkante millimeter': 'mm²', 'vierkante kilometer': 'km²', 'vierkante hectometer': 'hm²', 'vierkante decameter': 'dam²', 'kubieke meter': 'm³', 'kubieke decimeter': 'dm³', 'kubieke centimeter': 'cm³', 'kubieke millimeter': 'mm³', 'kubieke kilometer': 'km³', 'kubieke hectometer': 'hm³', 'kubieke decameter': 'dam³', 'kilometer per uur': 'km/uur', 'meter per seconde': 'm/s' };
const EXP_STELSEL = { lengte: { km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3 }, opp: { 'km²': 6, 'hm²': 4, 'dam²': 2, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6 }, inhoud: { kl: 3, hl: 2, dal: 1, l: 0, dl: -1, cl: -2, ml: -3 }, massa: { t: 6, kg: 3, hg: 2, dag: 1, g: 0, dg: -1, cg: -2, mg: -3 }, landmaat: { ha: 4, a: 2, ca: 0, 'm²': 0 } };
const MND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const DGN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const som = (l) => l.reduce((a, b) => a + b, 0);
const gcdT = (a, b) => (b ? gcdT(b, a % b) : a);
const alsBreuk = (str) => { const [a, b] = str.split('/').map(Number); return { n: a, d: b ?? 1 }; };
const gelijkB = (x, y) => x.n * y.d === y.n * x.d;
const parseWaarde = (str) => { if (str.includes('/')) return alsBreuk(str); if (str.endsWith('%')) return { n: Number(str.replace(/[^\d]/g, '')), d: 100 }; const [e, f = ''] = str.split(','); return { n: Number(e + f), d: 10 ** f.length }; };
const eenvoudig = (str) => { const b = alsBreuk(str); return gcdT(b.n, b.d) === 1 || b.d === 1; };
const kommaTekst = (h) => { const e = Math.floor(h / 100), f = String(h % 100).padStart(2, '0').replace(/0+$/, ''); return f ? `${e},${f}` : String(e); };
const familieVan = (g) => g.id.replace(/-(invullen|kiezen|juist-fout)$/, '');

for (const g of ECHTE_GENERATORS.filter(x => FAMILIES.some(f => f.id === familieVan(x)))) {
  test(`${g.id}: antwoorden kloppen, opties zijn juist ingedeeld, geen dubbels, herhaalbaar`, () => {
    const fam = familieVan(g), vorm = g.id.slice(fam.length + 1);
    const codes = AUTO_DOELEN[fam]; assert.ok(codes.length > 0, 'de familie heeft doelen');
    for (const code of codes) for (const seed of SEEDS.slice(0, 3)) {
      const opties = g.opties(g.doelen, {}, code); assert.equal(opties.doel, code);
      const aantal = effectiefAantal(g, 8), res = g.genereer({ seed, aantal, opties });
      assert.ok(res.oefeningen.length >= Math.min(aantal, 3), `${g.id} ${code} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) {
        const d = o.data; assert.ok(ok[fam](d, o), `${g.id} ${code}: ${o.tekst}`);
        assert.ok(d.vraag.split('____').length === 2, `${d.vraag}: precies één antwoordplaats`);
        assert.ok(!d.fouten.includes(d.antwoord) && new Set(d.fouten).size === d.fouten.length);
        if (vorm === 'kiezen') { assert.equal(new Set(d.opties).size, d.opties.length); assert.equal(d.opties[d.juist], d.antwoord); assert.ok(d.opties.length >= 2 && d.opties.every(x => x === d.antwoord || d.fouten.includes(x))); assert.ok(o.antwoord.startsWith('abcd'[d.juist] + ')')); }
        if (vorm === 'juist-fout') { assert.equal(d.juist, d.getoond === d.antwoord); assert.equal(o.antwoord, d.juist ? 'juist' : 'fout'); assert.ok(d.juist || d.fouten.includes(d.getoond)); }
        if (vorm === 'invullen') assert.equal(o.antwoord, d.antwoord);
      }
      assert.deepEqual(g.genereer({ seed, aantal, opties }), res);
    }
  });
}

test('eig: alle soorten eigenschappen komen voor in de oefeningen', () => {
  const g = ECHTE_GENERATORS.find(x => x.id === 'eig-invullen'), gezien = new Set();
  for (const code of AUTO_DOELEN.eig) for (const seed of SEEDS) for (const o of g.genereer({ seed, aantal: 10, opties: { doel: code } }).oefeningen) gezien.add(o.data.eig);
  assert.deepEqual([...gezien].sort(), ['comm+', 'comm×', 'ncomm-', 'ncomm:', 'ass+', 'ass×', 'nass-', 'nass:', 'dist×+', 'dist×-', 'dist:+', 'dist:-', 'n0+', 'n0-', 'n1×', 'n1:', 'op0×', 'op0:', 'inv+-', 'inv×:', 'herh', 'comp+', 'comp-', 'comp×', 'comp:', 'ontb', 'deelrest'].sort());
});

test('getallen in woorden en rangtelwoorden: tabel en tweede berekening komen overeen met de hulpfuncties', async () => {
  const { getalWoord, rangWoord } = await import('../js/subjects/wiskunde/auto-hulp.js');
  for (const [n, w] of Object.entries(WOORD_TABEL)) assert.equal(getalWoord(Number(n)), w, n);
  for (let n = 0; n <= 1000; n++) assert.equal(getalWoord(n), woordTweede(n), String(n));
  for (const [n, w] of Object.entries(RANG_TABEL)) assert.equal(rangWoord(Number(n)), w, n);
  for (let n = 20; n <= 100; n++) assert.equal(rangWoord(n), woordTweede(n) + 'ste');
});

test('elke soort opgave die een doel vraagt, komt echt voor in de oefeningen', () => {
  const sleutels = { trf: 'soort', sym: 'soort', pat: 'soort', pos: 'soort', cng: 'soort', fig: 'soort', rfg: 'soort', hoe: 'soort', lij: 'soort', drh: 'soort', upr: 'soort', log: 'soort', vrg: 'vrg', dgm: 'dgm', gem: 'gem', kns: 'kns', vlv: 'vlv', bkd: 'bkd', omz: 'omz', dcm: 'dcm', bkb: 'bkb', dcb: 'dcb', pws: 'pws', dkl: 'soort', dgn: 'soort', dur: 'soort', thm: 'soort', gld: 'soort', hks: 'soort', mvb: 'soort', rfm: 'gr', mtb: 'soort', omr: 'soort', rel: 'soort', gbg: 'soort', rij: 'rtype', rom: 'soort', gas: 'soort', aan: 'soort', bgw: 'soort', sit: 'soort', gtl: 'soort', rtb: 'soort', vrm: 'soort', stb: 'soort', knb: 'soort', dbr: 'soort' };
  const equivalent = { 'geheel-procent': 'geheel', 'veelvoud-ja': 'veelvoud', 'dec:dec': 'dec×dec' };
  for (const [fam, sleutel] of Object.entries(sleutels)) {
    const g = ECHTE_GENERATORS.find(x => x.id === `${fam}-invullen`), gezien = new Set(), gevraagd = new Set();
    const f = FAMILIES.find(x => x.id === fam);
    for (const code of AUTO_DOELEN[fam]) {
      (f.parameters(DOELEN.find(d => d.code === code)).types || []).forEach(t => gevraagd.add(t));
      for (const seed of SEEDS) for (const o of g.genereer({ seed, aantal: 12, opties: { doel: code } }).oefeningen) gezien.add(equivalent[o.data[sleutel]] ?? o.data[sleutel]);
    }
    if (fam === 'gld' && ['winst', 'verlies', 'korting', 'verkoop'].every(x => gezien.has(x))) gezien.add('prijsbegrip');
    for (const t of gevraagd) assert.ok(gezien.has(equivalent[t] ?? t), `${fam}: de soort ${t} komt nooit voor`);
  }
});
