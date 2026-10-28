// Natuurlijke getallen: notaties (<, >, ≤, ≥), getalbegrippen, rijen en patronen, Romeinse cijfers, getallenas en grootteorde, en aantallen
// (tellen, vergelijken, splitsen, getalbeelden, rangorde, conservatie). De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import * as G from '../getallen-svg.js';
import { getallenas, mab } from '../svg.js';
import { fmt, getalWoord, rangWoord } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const positief = (lijst) => lijst.filter(x => Number.isFinite(x) && x >= 0);
const grens = (jaar) => (jaar <= 1 ? 20 : jaar === 2 ? 100 : jaar === 3 ? 1000 : jaar === 4 ? 10000 : 1000000);

/* ------------------------------------------------------------------ <, >, =, ≠, ≤, ≥ */
const TEKEN_WOORD = { '<': 'kleiner dan', '>': 'groter dan', '=': 'gelijk aan', '≠': 'niet gelijk aan', '≤': 'kleiner dan of gelijk aan', '≥': 'groter dan of gelijk aan' };
const relatieOpgave = (r, p) => {
  const jaar = p.jaar ?? 2, soort = kies(r, p.types), max = grens(jaar), data = { getal2: 'rel', soort };
  const a = r.geheel(0, max), b = r.geheel(0, max);
  if (soort === 'kl') {
    if (a === b) return null;
    const teken = a < b ? '<' : '>';
    return mk(`Welk teken past? ${fmt(a)} ____ ${fmt(b)}`, null, teken, ['<', '>', '='], `rk${a}.${b}`, 1, { ...data, a, b, teken });
  }
  if (soort === 'ne') {
    const t = kies(r, ['<', '>', '=', '≠']), woorden = TEKEN_WOORD[t];
    if (r.volgende() < 0.5) { const x = r.geheel(1, Math.min(max, 20)), k = r.geheel(1, Math.min(5, x)), y = t === '=' ? x : t === '>' ? x - k : x + k; return mk(`Welk teken past? ${x} ____ ${y} (${woorden})`, null, t, ['<', '>', '=', '≠'], `rn${x}.${y}.${t}`, 2, { ...data, wat: 'woorden-getallen', teken: t, a: x, b: y }); }
    return mk(`Welk teken betekent "${woorden}"? ____`, null, t, ['<', '>', '=', '≠'], `rw${t}`, 1, { ...data, wat: 'teken', teken: t });
  }
  const t = kies(r, ['≤', '≥']), woorden = TEKEN_WOORD[t];
  if (r.volgende() < 0.4) return mk(`Welk teken betekent "${woorden}"? ____`, null, t, ['<', '>', '≤', '≥', '='].filter(x => x !== t), `rw${t}`, 1, { ...data, wat: 'teken', teken: t });
  const x = r.geheel(0, max), y = r.volgende() < 0.3 ? x : r.geheel(0, max), waar = t === '≤' ? x <= y : x >= y;
  return mk(`Is ${fmt(x)} ${t} ${fmt(y)} juist of fout? ____`, null, waar ? 'juist' : 'fout', [waar ? 'fout' : 'juist'], `rj${x}.${y}${t}`, 2, { ...data, wat: 'juist-fout', teken: t, a: x, b: y, waar });
};
export const RELATIE_VORMEN = maakOpgaveVormen({
  id: 'rel', titel: 'Tekens: <, >, =, ≠, ≤, ≥', doelen: AUTO_DOELEN.rel || [], parameters: K.relatieParameters, standaard: { types: ['kl'], jaar: 2 },
  opdracht: opdracht('Vul het juiste teken of woord in.'), opgave: relatieOpgave,
});

/* ------------------------------------------------------------------ getalbegrippen */
const WAARDE = { td: ['TD', 10000, 'tienduizendtallen'], hd: ['HD', 100000, 'honderdduizendtallen'], m: ['M', 1000000, 'miljoentallen'], tm: ['TM', 10000000, 'tienmiljoentallen'], hm: ['HM', 100000000, 'honderdmiljoentallen'], mrd: ['miljard', 1000000000, 'miljardtallen'] };
const ORDE_VOLGORDE = ['td', 'hd', 'm', 'tm', 'hm', 'mrd'];
const begripOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, soort = kies(r, p.types), data = { getal2: 'gbg', soort };
  switch (soort) {
    case 'cijfer': {
      const n = r.geheel(10, jaar <= 1 ? 99 : jaar === 2 ? 999 : 9999), v = r.geheel(0, 2), s = String(n);
      if (v === 0) return mk(`Hoeveel cijfers heeft het getal ${fmt(n)}? ____`, null, s.length, [s.length + 1, s.length - 1, n].filter(x => x > 0), `cj${n}`, 1, { ...data, n, wat: 'aantal' });
      if (v === 1) return mk(`Het getal ${fmt(n)} eindigt op het cijfer ____.`, null, s.slice(-1), [...s.slice(0, -1)].filter(x => x !== s.slice(-1)), `ce${n}`, 1, { ...data, n, wat: 'laatste' });
      return mk(`Met hoeveel verschillende cijfers kun je alle getallen schrijven (0, 1, 2, ... 9)? ____`, null, 10, [9, 11, 100], 'ct', 2, { ...data, wat: 'tien' });
    }
    case 'aantal': {
      const v = r.geheel(0, 2);
      if (v === 0) { const n = r.geheel(1, 100); return mk(`Is ${n} even of oneven? ____`, null, n % 2 ? 'oneven' : 'even', [n % 2 ? 'even' : 'oneven'], `ae${n}`, 1, { ...data, n, wat: 'even' }); }
      if (v === 1) { const tot = r.geheel(5, 12), plek = r.geheel(2, tot); return mk(`In de rij staan ${tot} kinderen. Lotte staat op de ${plek}e plaats. Hoeveel kinderen staan er vóór Lotte? ____`, null, plek - 1, [plek, plek + 1, tot, tot - plek], `ar${tot}.${plek}`, 2, { ...data, tot, plek, wat: 'voor' }); }
      const w = kies(r, [['7 kinderen', 'aantal'], ['de 7e plaats', 'rangorde'], ['12 appels', 'aantal'], ['de 3e in de rij', 'rangorde'], ['25 knikkers', 'aantal'], ['de 1e plaats', 'rangorde']]);
      return mk(`"${w[0]}" geeft een ____ aan. (aantal of rangorde)`, null, w[1], [w[1] === 'aantal' ? 'rangorde' : 'aantal'], `aw${w[0]}`, 1, { ...data, zin: w[0], wat: 'soort', goed: w[1] });
    }
    case 'deel': {
      const d = r.geheel(2, 9), q = r.geheel(2, 9), rest = r.geheel(1, d - 1), n = d * q + rest, v = r.geheel(0, 3);
      if (v === 0) return mk(`${n} : ${d} = ${q} rest ${rest}. Het getal ${rest} heet de ____.`, null, 'rest', ['deler', 'veelvoud', 'quotiënt'], `de${n}.${d}r`, 2, { ...data, n, d, q, rest, wat: 'rest' });
      if (v === 1) return mk(`${n} : ${d} = ${q} rest ${rest}. Het getal ${d} heet de ____.`, null, 'deler', ['rest', 'veelvoud', 'quotiënt'], `de${n}.${d}d`, 2, { ...data, n, d, q, rest, wat: 'deler' });
      if (v === 2) return mk(`${d * q} is een ____ van ${d}. (veelvoud of deler)`, null, 'veelvoud', ['deler'], `dv${d}.${q}`, 2, { ...data, d, q, wat: 'veelvoud' });
      return mk(`${d} is een ____ van ${d * q}. (veelvoud of deler)`, null, 'deler', ['veelvoud'], `dd${d}.${q}`, 2, { ...data, d, q, wat: 'deler2' });
    }
    case 'afronden': {
      const e = kies(r, [10, 100]), n = r.geheel(12, 960);
      if (n % e === e / 2) return null;
      return mk(`Je rondt ${n} af op ${e === 10 ? 'tientallen' : 'honderdtallen'}. Dat wordt ____.`, null, Math.round(n / e) * e, [Math.floor(n / e) * e, Math.ceil(n / e) * e, n + e, n - e].filter(x => x > 0 && x !== Math.round(n / e) * e), `af${n}.${e}`, 2, { ...data, n, e });
    }
    case 'td': case 'hd': case 'm': case 'tm': case 'hm': case 'mrd': {
      const [naam, w] = WAARDE[soort], k = r.geheel(2, 9), v = r.geheel(0, 2);
      if (v === 0) return mk(`${k} ${naam} = ____`, null, fmt(k * w), [k * w * 10, k * w / 10, k * w * 100, (k + 1) * w].map(fmt), `o${soort}${k}a`, 2, { ...data, k, w, wat: 'tal-naar-getal' });
      if (v === 1) return mk(`${fmt(k * w)} = ____ ${naam}`, null, k, [k * 10, k + 1, k - 1, k * 100], `o${soort}${k}b`, 2, { ...data, k, w, wat: 'getal-naar-tal' });
      const vorig = WAARDE[ORDE_VOLGORDE[Math.max(0, ORDE_VOLGORDE.indexOf(soort) - 1)]];
      return mk(`${naam} staat voor ${WAARDE[soort][2]}. Eén ${naam} is ____.`, null, fmt(w), [w * 10, w / 10, w * 100, vorig[1] === w ? w * 10 : vorig[1]].map(fmt), `o${soort}c`, 1, { ...data, w, wat: 'een' });
    }
    case 'miljoen': {
      const k = r.geheel(2, 9), v = r.geheel(0, 2);
      if (v === 0) return mk(`${k} miljoen = ____`, null, fmt(k * 1e6), [k * 1e5, k * 1e7, k * 1e3, k * 1e9].map(fmt), `mj${k}a`, 2, { ...data, k, wat: 'naar-getal' });
      if (v === 1) return mk(`${fmt(k * 1e6)} = ____ miljoen`, null, k, [k * 10, k * 100, k * 1000, k + 1], `mj${k}b`, 2, { ...data, k, wat: 'naar-miljoen' });
      return mk(`1 miljoen heeft ____ nullen.`, null, 6, [3, 5, 7, 9], 'mj0', 1, { ...data, wat: 'nullen' });
    }
    case 'miljard': {
      const k = r.geheel(2, 9), v = r.geheel(0, 2);
      if (v === 0) return mk(`${k} miljard = ____`, null, fmt(k * 1e9), [k * 1e6, k * 1e8, k * 1e10, k * 1e12].map(fmt), `md${k}a`, 3, { ...data, k, wat: 'naar-getal' });
      if (v === 1) return mk(`1 miljard = ____ miljoen`, null, fmt(1000), [fmt(100), fmt(10000), fmt(1000000)], 'md0', 3, { ...data, wat: 'miljoen' });
      return mk(`1 miljard heeft ____ nullen.`, null, 9, [6, 8, 10, 12], 'md1', 2, { ...data, wat: 'nullen' });
    }
    case 'as': {
      const v = r.geheel(0, 2);
      if (v < 2) {                                              // een getekende getallenas met één ontbrekend getal (het vraagteken)
        const stap = v === 0 ? 1 : 2, a = stap === 1 ? r.geheel(0, 10) : 2 * r.geheel(0, 2), t = r.geheel(1, 7), goed = a + t * stap;
        const as = getallenas({ start: a, stap, ticks: 9, verborgen: [t], letters: { [t]: '?' } });
        return { ...mk('? = ____', as, goed, [goed + stap, goed - stap, goed + 1], `as${a}.${stap}.${t}`, 1, { ...data, a, stap, t, wat: 'ontbrekend' }), keuze: { vraag: 'Welk getal hoort bij het vraagteken?' } };
      }
      const x = r.geheel(2, 15), lijst = r.schud([x, x + 3, x + 7]);
      return { ...mk(`${lijst.join('   ')}   →   grootste: ____`, null, x + 7, [x, x + 3], `as${x}c`, 2, { ...data, lijst, wat: 'meest-rechts' }), keuze: { vraag: 'Omcirkel het grootste getal.', zonderLetters: true } };
    }
    case 'tussen': { const a = r.geheel(1, 8); return mk(`Welk getal ligt tussen ${a} en ${a + 2}? ____`, null, a + 1, [a, a + 2, a + 3], `tu${a}`, 1, { ...data, a }); }
    case 'een-meer': { const a = r.geheel(1, 9), meer = r.volgende() < 0.5; if (!meer && a < 1) return null; return mk(meer ? `Eén meer dan ${a} is ____.` : `Eén minder dan ${a} is ____.`, null, meer ? a + 1 : a - 1, [meer ? a - 1 : a + 1, a, a + 2].filter(x => x >= 0), `em${a}${meer}`, 1, { ...data, a, meer }); }
    case 'orde-rij': { const t = r.schud([r.geheel(1, 3), r.geheel(4, 6), r.geheel(7, 10)]), op = [...t].sort((a, b) => a - b), neer = [...op].reverse(), weinig = r.volgende() < 0.5, goedA = r.volgende() < 0.5, goed = weinig ? op : neer, fout = weinig ? neer : op; return mk(`Welke rij gaat van ${weinig ? 'weinig naar veel' : 'veel naar weinig'}? A: ${(goedA ? goed : fout).join(', ')} B: ${(goedA ? fout : goed).join(', ')} ____`, null, goedA ? 'A' : 'B', [goedA ? 'B' : 'A'], `ro${op.join('.')}${weinig}${goedA}`, 2, { ...data, weinig, goedA, op }); }
    case 'middelste': { const a = r.geheel(1, 8); return mk(`Welk getal is het middelste van ${r.schud([a, a + 1, a + 2]).join(', ')}? ____`, null, a + 1, [a, a + 2], `mi${a}`, 1, { ...data, a }); }
    case 'vorig-volgend': { const a = r.geheel(1, 9), vor = r.volgende() < 0.5; return mk(vor ? `Het vorige getal van ${a} is ____.` : `Het volgende getal na ${a} is ____.`, null, vor ? a - 1 : a + 1, [vor ? a + 1 : a - 1, a, a + 2].filter(x => x >= 0), `vv${a}${vor}`, 1, { ...data, a, vor }); }
    case 'hoeveel': {
      const a = r.geheel(3, 10), b = r.geheel(0, a - 1), v = r.geheel(0, 2), [naam, enkel] = kies(r, [['appels', 'appel'], ['snoepjes', 'snoepje'], ['blokken', 'blok'], ['knikkers', 'knikker']]);
      if (v === 0) return mk(`Lotte heeft ${a} ${naam}. Jan heeft ${b} ${naam}. Hoeveel ${naam} heeft Lotte meer dan Jan? ____`, null, a - b, [a, b, a + b, a - b + 1], `hm${a}.${b}${naam}`, 2, { ...data, a, b, wat: 'meer' });
      if (v === 1) return mk(`Lotte heeft ${a} ${naam}. Jan heeft ${b} ${naam}. Hoeveel ${naam} heeft Jan minder dan Lotte? ____`, null, a - b, [a, b, a + b, a - b + 1], `hl${a}.${b}${naam}`, 2, { ...data, a, b, wat: 'minder' });
      return mk(`In de doos zit geen enkele ${enkel}. Hoeveel ${naam} zitten er in de doos? ____`, null, 0, [1, 2, 10], `hg${naam}`, 1, { ...data, wat: 'nul' });
    }
    default: { const a = r.geheel(2, 9), er = r.volgende() < 0.5; return mk(er ? `Het getal juist ervoor is ${a - 1}. Welk getal is dat? ____` : `Het getal juist erna is ${a + 1}. Welk getal is dat? ____`, null, a, [a - 1, a + 1, a + 2], `ee${a}${er}`, 1, { ...data, a, er }); }
  }
};
export const GETALBEGRIP_VORMEN = maakOpgaveVormen({
  id: 'gbg', titel: 'Getalbegrippen', doelen: AUTO_DOELEN.gbg || [], parameters: K.getalBegripParameters, standaard: { types: ['tussen'], jaar: 0 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: begripOpgave,
});

/* ------------------------------------------------------------------ rijen en patronen */
const regelFouten = { plus: (s) => [`+${s + 1}`, `+${s - 1}`, `×${s}`, `−${s}`], min: (s) => [`−${s + 1}`, `−${s - 1}`, `+${s}`, `×${s}`], mal: (f) => [`+${f}`, `×${f + 1}`, `×${f * 2}`, `+${f + 1}`] };
function maakRij(r, type, jaar) {
  const grensRij = grens(jaar);
  if (type === 'plus' || type === 'buiten') {
    const stap = kies(r, type === 'buiten' ? [11, 12, 13, 14, 15, 25] : jaar <= 2 ? [2, 3, 4, 5, 10] : jaar === 3 ? [6, 7, 8, 9, 25, 50] : [12, 15, 25, 50, 100, 250]), start = r.geheel(0, 15) * (jaar >= 4 ? 5 : 1);
    const rij = Array.from({ length: 6 }, (_, i) => start + i * stap);
    return rij[5] <= grensRij ? { rij, regel: `+${stap}`, fouten: regelFouten.plus(stap) } : null;
  }
  if (type === 'min') {
    const stap = kies(r, jaar <= 2 ? [2, 3, 4, 5, 10] : jaar === 3 ? [6, 7, 8, 9, 25, 50] : [12, 15, 25, 50, 100]), start = r.geheel(6, 14) * stap + r.geheel(0, 5);
    return start <= grensRij ? { rij: Array.from({ length: 6 }, (_, i) => start - i * stap), regel: `−${stap}`, fouten: regelFouten.min(stap) } : null;
  }
  if (type === 'mal') {
    const f = kies(r, jaar <= 3 ? [2, 3] : [2, 3, 10]), start = r.geheel(1, 5), rij = Array.from({ length: 5 }, (_, i) => start * f ** i);
    return rij[4] <= grensRij ? { rij, regel: `×${f}`, fouten: regelFouten.mal(f) } : null;
  }
  if (type === 'kwadr') { const a = r.geheel(1, 6); return { rij: Array.from({ length: 6 }, (_, i) => (a + i) ** 2), regel: 'kwadraten', fouten: ['+2 telkens meer', 'driehoeksgetallen', '×2', 'telkens +5'] }; }
  if (type === 'driehoek') { const a = r.geheel(1, 5); return { rij: Array.from({ length: 6 }, (_, i) => ((a + i) * (a + i + 1)) / 2), regel: 'driehoeksgetallen', fouten: ['kwadraten', '×2', 'telkens +3', 'som van de twee vorige getallen'] }; }
  if (type === 'fib') { const x = r.geheel(1, 5), y = r.geheel(1, 5), rij = [x, y]; while (rij.length < 7) rij.push(rij[rij.length - 1] + rij[rij.length - 2]); return { rij, regel: 'som van de twee vorige getallen', fouten: ['telkens +2', '×2', 'kwadraten', 'driehoeksgetallen'] }; }
  const a = r.geheel(1, 8), b = r.geheel(1, 9);
  if (a === b) return null;
  const start = r.geheel(0, 10), rij = [start]; for (let i = 1; i < 7; i++) rij.push(rij[i - 1] + (i % 2 ? a : b));
  return { rij, regel: `+${a} en +${b} afwisselend`, fouten: [`+${a + b}`, `+${a} en +${b + 1} afwisselend`, `×${a}`, `+${Math.abs(a - b)}`] };
}
const rijOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, type = kies(r, p.types), x = maakRij(r, type, jaar);
  if (!x) return null;
  const { rij, regel, fouten } = x, vorm = kies(r, ['volgend', 'gat', 'regel']), data = { getal2: 'rij', rtype: type, vorm, rij, regel };
  const toon = (v) => fmt(v);
  if (vorm === 'regel') return mk(`Wat is de regel van de rij ${rij.slice(0, 5).map(toon).join(', ')}, ...? ____`, null, regel, fouten, `rr${type}${rij.join('.')}`, 3, data);
  const gat = vorm === 'volgend' ? Math.min(4, rij.length - 1) : r.geheel(2, rij.length - 2), antw = rij[gat], zicht = vorm === 'volgend' ? rij.slice(0, gat + 1) : rij;
  const reeks = zicht.map((v, i) => (i === gat ? '____' : toon(v))).join(', ') + (vorm === 'volgend' ? ', ...' : '');
  const stap = Math.abs(rij[1] - rij[0]) || 1, foutIn = [antw + 1, antw - 1, antw + stap, antw - stap, antw * 2, rij[gat - 1]];
  return mk(vorm === 'volgend' ? `Hoe gaat de rij verder? ${reeks}` : `Welk getal ontbreekt? ${reeks}`, null, toon(antw), foutIn.filter(v => v >= 0).map(toon), `rg${type}${vorm}${rij.join('.')}`, 2, { ...data, gat, antwoordGetal: antw });
};
export const RIJ_VORMEN = maakOpgaveVormen({
  id: 'rij', titel: 'Rijen en patronen', doelen: AUTO_DOELEN.rij || [], parameters: K.rijParameters, standaard: { types: ['plus'], jaar: 3 },
  opdracht: opdracht('Kijk goed naar de regel. Schrijf het antwoord op de lijn.'), opgave: rijOpgave,
});

/* ------------------------------------------------------------------ Romeinse cijfers */
const ROMEINS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const naarRomeins = (n) => { let t = ''; for (const [w, s] of ROMEINS) while (n >= w) { t += s; n -= w; } return t; };
const SOM_ROMEINS = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const naiefOptellen = (t) => [...t].reduce((a, c) => a + SOM_ROMEINS[c], 0);
const romeinsOpgave = (r, p) => {
  const soort = kies(r, p.types), data = { getal2: 'rom', soort };
  if (soort === 'systeem') {
    const lijst = [
      ['Bij Romeinse cijfers heeft het teken X altijd de waarde 10. Bij ons talstelsel hangt de waarde van het cijfer 3 af van zijn ____. (plaats of kleur)', 'plaats', ['kleur']],
      ['Ons talstelsel is een ____. (plaatswaardesysteem of additief systeem)', 'plaatswaardesysteem', ['additief systeem']],
      ['Romeinse cijfers zijn een ____ systeem. (additief of plaatswaarde)', 'additief', ['plaatswaarde']],
      ['In het getal 303 heeft het eerste cijfer 3 de waarde 300 en het tweede cijfer 3 de waarde 3. Dat is een kenmerk van een ____. (plaatswaardesysteem of additief systeem)', 'plaatswaardesysteem', ['additief systeem']],
    ];
    const i = r.geheel(0, lijst.length - 1), [vraag, antw, fouten] = lijst[i];
    return mk(vraag, null, antw, fouten, `rs${i}`, 3, { ...data, i });
  }
  const n = soort === 'lezen' && r.volgende() < 0.4 ? r.geheel(1850, 2024) : r.geheel(1, 2500), t = naarRomeins(n), jaartal = n >= 1850 && n <= 2024;
  if (soort === 'lezen') return mk(`${jaartal ? 'Het jaartal ' : ''}${t} = ____`, null, n, [n + 1, n - 1, n + 10, n - 10, naiefOptellen(t), n + 100].filter(x => x > 0), `rl${n}`, 3, { ...data, n, t, jaartal });
  return mk(`${fmt(n)} schrijf je in Romeinse cijfers als ____`, null, t, [naarRomeins(n + 1), naarRomeins(n - 1), naarRomeins(n + 10), naarRomeins(n + 5), naarRomeins(n + 100)].filter(x => x !== t), `rz${n}`, 3, { ...data, n, t });
};
export const ROMEINS_VORMEN = maakOpgaveVormen({
  id: 'rom', titel: 'Romeinse cijfers', doelen: AUTO_DOELEN.rom || [], parameters: K.romeinsParameters, standaard: { types: ['lezen'], jaar: 6 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: romeinsOpgave,
});

/* ------------------------------------------------------------------ grote getallen op de getallenas, vergelijken en grootteorde */
const spatie = (n) => fmt(n);
const gasOpgave = (r, p) => {
  const soort = kies(r, p.types), max = p.max ?? 1e6, groot = max > 1e6, data = { getal2: 'gas', soort };
  if (soort === 'plaats') {
    const stap = kies(r, groot ? [1e8, 2e8, 5e8, 1e9, 2e9] : [1e4, 2e4, 25e3, 5e4, 1e5, 2e5]), ticks = groot ? 5 : 6;
    const start = r.geheel(0, Math.floor((max - (ticks - 1) * stap) / stap)) * stap, i = r.geheel(1, ticks - 2), antw = start + i * stap;
    return mk('Welk getal wijst de pijl aan? ____', getallenas({ start, stap, ticks, pijlen: [i], verborgen: [i], label: spatie }), spatie(antw), [antw + stap, antw - stap, antw + stap / 2, antw - stap / 2, antw + 10 * stap].filter(x => x >= 0 && x <= max).map(spatie), `gp${start}.${stap}.${i}`, groot ? 4 : 3, { ...data, start, stap, ticks, i, antwoordGetal: antw });
  }
  if (soort === 'vergelijk') {
    const lengte = groot ? r.geheel(8, 10) : 6, cijfers = Array.from({ length: lengte }, (_, i) => (i === 0 ? r.geheel(1, 9) : r.geheel(0, 9)));
    const maak = () => { const c = r.schud(cijfers); return c[0] === 0 ? null : Number(c.join('')); };
    const drie = [...new Set([maak(), maak(), maak()])].filter(x => x !== null && x <= max);
    if (drie.length < 3) return null;
    const vorm = kies(r, ['grootst', 'kleinst', 'middelste']), gesorteerd = [...drie].sort((a, b) => a - b), antw = vorm === 'grootst' ? gesorteerd[2] : vorm === 'kleinst' ? gesorteerd[0] : gesorteerd[1];
    return mk(`Welk getal is het ${vorm}: ${drie.map(spatie).join(', ')}? ____`, null, spatie(antw), drie.filter(x => x !== antw).map(spatie), `gv${drie.join('.')}${vorm}`, groot ? 4 : 3, { ...data, drie, vorm, antwoordGetal: antw });
  }
  const afrond = groot ? kies(r, [1e6, 1e9]) : kies(r, [1e4, 1e5]);
  if (r.volgende() < 0.35) { const k = r.geheel(groot ? 7 : 5, groot ? 10 : 7); return mk(`Een getal met ${k} cijfers is minstens ____.`, null, spatie(10 ** (k - 1)), [10 ** k, 10 ** (k - 2), 10 ** (k + 1), k * 10].map(spatie), `gc${k}`, 3, { ...data, k, wat: 'minstens' }); }
  const lo = r.geheel(1, 9), n = lo * afrond + r.geheel(1, afrond - 1);
  if (Math.abs((n % afrond) - afrond / 2) < afrond / 20 || n > max) return null;
  const antw = Math.round(n / afrond) * afrond;
  return mk(`Het getal ${spatie(n)} ligt het dichtst bij ____.`, null, spatie(antw), [lo * afrond, (lo + 1) * afrond, (lo - 1) * afrond, (lo + 2) * afrond].filter(x => x !== antw && x > 0).map(spatie), `go${n}`, 3, { ...data, n, afrond, antwoordGetal: antw });
};
export const GETALLENAS_VORMEN = maakOpgaveVormen({
  id: 'gas', titel: 'Grote getallen: getallenas en grootteorde', doelen: AUTO_DOELEN.gas || [], parameters: K.getallenasParameters, standaard: { types: ['plaats'], max: 1e6, jaar: 5 },
  opdracht: opdracht('Kijk goed. Schrijf het antwoord op de lijn.'), opgave: gasOpgave, schaal: 1,
});

/* ------------------------------------------------------------------ aantallen */
function plaatsen(r, n, b = 230, h = 120, rad = 9) {
  const lijst = [];
  for (let poging = 0; lijst.length < n && poging < 4000; poging++) {
    const x = r.geheel(rad + 4, b - rad - 4), y = r.geheel(rad + 4, h - rad - 4);
    if (lijst.every(([a, c]) => (a - x) ** 2 + (c - y) ** 2 > (2 * rad + 5) ** 2)) lijst.push([x, y]);
  }
  return lijst.length === n ? lijst : null;
}
const OBJECTEN = ['knikkers', 'kralen', 'blokjes', 'appels', 'stickers'];
const aantalOpgave = (r, p) => {
  const jaar = p.jaar ?? 0, max = p.max ?? 10, soort = kies(r, p.types), data = { getal2: 'aan', soort };
  switch (soort) {
    case 'tellen': {
      const n = r.geheel(2, max), gestructureerd = max > 10 && r.volgende() < 0.5, svg = gestructureerd ? G.tienerframes(n) : (() => { const pl = plaatsen(r, n); return pl ? G.stippenGroepen([{ id: 'A', plaatsen: pl }]) : null; })();
      if (!svg) return null;
      return mk('Hoeveel stippen zie je? ____', svg, n, [n + 1, n - 1, n + 2, n - 2, n * 2].filter(x => x > 0), `at${n}${gestructureerd}${r.geheel(0, 5)}`, n > 10 ? 3 : 1, { ...data, n, gestructureerd });
    }
    case 'vergelijk': {
      if (max > 20) { const a = r.geheel(10, max), b = r.geheel(10, max), c = r.geheel(10, max); if (new Set([a, b, c]).size < 3) return null; const meest = r.volgende() < 0.5, l = [a, b, c], antw = meest ? Math.max(...l) : Math.min(...l); return mk(`Welk aantal is het ${meest ? 'grootst' : 'kleinst'}: ${l.join(', ')}? ____`, null, antw, l.filter(x => x !== antw), `av${l.join('.')}${meest}`, 2, { ...data, l, meest, antwoordGetal: antw }); }
      const a = r.geheel(1, max), b = r.geheel(1, max);
      if (a === b) return null;
      const pa = plaatsen(r, a), pb = plaatsen(r, b);
      if (!pa || !pb) return null;
      const meest = r.volgende() < 0.5, antw = (meest ? a > b : a < b) ? 'A' : 'B';
      return mk(`Welke groep heeft de ${meest ? 'meeste' : 'minste'} stippen? ____`, G.stippenGroepen([{ id: 'A', plaatsen: pa }, { id: 'B', plaatsen: pb }], { b: 200, h: 110 }), antw, [antw === 'A' ? 'B' : 'A'], `av${a}.${b}${meest}${r.geheel(0, 5)}`, 2, { ...data, a, b, meest, antwoordTekst: antw });
    }
    case 'splits': {
      const n = r.geheel(11, Math.min(max, 20)), v = r.geheel(0, 2);
      if (v === 0) return mk(`${n} = 1 tiental en ____ eenheden`, G.tienerframes(n), n - 10, [n, n - 9, n - 11, 10].filter(x => x >= 0), `asa${n}`, 2, { ...data, n, wat: 'eenheden' });
      if (v === 1) return mk(`1 tiental en ${n - 10} eenheden = ____`, null, n, [n - 10, n + 1, n - 1, n + 10], `asb${n}`, 2, { ...data, n, wat: 'getal' });
      return mk(`Bij het getal ${n} schrijf je eerst het ____ en dan de eenheden. (tiental of eenheid)`, null, 'tiental', ['eenheid'], `asc${n}`, 1, { ...data, n, wat: 'volgorde' });
    }
    case 'beeld': {
      if (max > 20) { const n = r.geheel(10, Math.min(max, 99)), t = Math.floor(n / 10), e = n % 10; return mk('Hoeveel is dit samen? ____', mab({ t, e }), n, [n + 1, n - 1, n + 10, n - 10, t + e, e * 10 + t].filter(x => x > 0 && x <= 99), `ab${n}`, 3, { ...data, n, wat: 'mab' }); }
      const n = r.geheel(1, max);
      return mk('Welk getal hoort bij de tekening? ____', G.tienerframes(n), n, [n + 1, n - 1, n + 2, n - 2].filter(x => x > 0), `ab${n}`, n > 10 ? 3 : 1, { ...data, n, wat: 'frame' });
    }
    case 'rang': {
      const n = r.geheel(4, 10), i = r.geheel(1, n);
      return mk('Het rode kind is het ____ kind van links.', G.kinderRij(n, i), rangWoord(i), [i - 1, i + 1, i + 2].filter(x => x >= 1 && x <= n).map(rangWoord), `ar${n}.${i}`, 2, { ...data, n, i });
    }
    case 'terug': {
      const hoog = r.geheel(4, 10), reeks = [hoog, hoog - 1, hoog - 2, hoog - 3, hoog - 4].filter(x => x >= 1), gat = r.geheel(1, reeks.length - 2);
      if (reeks.length < 4) return null;
      return mk(`Tel terug: ${reeks.map((x, i) => (i === gat ? '____' : x)).join(', ')}`, null, reeks[gat], [reeks[gat] + 1, reeks[gat] - 1, reeks[gat] + 2].filter(x => x >= 0), `au${hoog}.${gat}`, 2, { ...data, reeks, gat });
    }
    case 'koppel': {
      const grensK = Math.min(max, jaar <= 0 ? 10 : max), n = r.geheel(1, grensK);
      return r.volgende() < 0.5 ? mk(`Het telwoord "${getalWoord(n)}" schrijf je als ____.`, null, n, [n + 1, n - 1, n + 10, n * 2].filter(x => x > 0), `ak${n}a`, 1, { ...data, n, wat: 'woord-naar-getal' })
        : mk(`Het getal ${n} schrijf je in letters als ____.`, null, getalWoord(n), [n + 1, n - 1, n + 10].filter(x => x > 0 && x <= Math.max(max, 20)).map(getalWoord), `ak${n}b`, 1, { ...data, n, wat: 'getal-naar-woord' });
    }
    case 'cons': {
      const n = r.geheel(3, Math.min(max, 10)), o = kies(r, OBJECTEN), v = r.geheel(0, 2);
      if (v === 0) return mk(`Je telt ${n} ${o}. Daarna leg je ze verder uit elkaar. Hoeveel ${o} zijn het nu? ____`, null, n, [n + 1, n - 1, n + 2, n * 2].filter(x => x > 0), `ac${n}${o}a`, 2, { ...data, n, wat: 'ruimte' });
      if (v === 1) return mk(`Je telt ${n} ${o} van links naar rechts. Daarna tel je ze van rechts naar links. Hoeveel ${o} zijn het? ____`, null, n, [n + 1, n - 1, n + 2, n * 2].filter(x => x > 0), `ac${n}${o}b`, 2, { ...data, n, wat: 'volgorde' });
      const m = r.geheel(1, n - 1);
      return mk(`Er zijn ${n} kinderen en ${m} ${o}. Elk kind krijgt één van de ${o}. Hoeveel kinderen krijgen er niets? ____`, null, n - m, [m, n, n - m + 1, n - m - 1].filter(x => x >= 0), `ac${n}.${m}${o}c`, 3, { ...data, n, m, wat: 'een-een' });
    }
    case 'groep': {
      const n = r.geheel(10, Math.min(max, 99)), t = Math.floor(n / 10), e = n % 10;
      return mk(`Je ziet ${t} tientallen en ${e} eenheden. Hoeveel is dat samen? ____`, mab({ t, e }), n, [n + 1, n - 1, n + 10, n - 10, t + e, e * 10 + t].filter(x => x > 0 && x <= 99), `ag${n}`, 3, { ...data, n, t, e });
    }
    default: {
      const n = r.geheel(6, Math.min(max, 20));
      return mk('Hoeveel streepjes zijn dit samen? ____', G.turfstreepjes(n), n, [n + 1, n - 1, n + 5, n - 5].filter(x => x > 0), `ate${n}`, 2, { ...data, n });
    }
  }
};
export const AANTAL_VORMEN = maakOpgaveVormen({
  id: 'aan', titel: 'Aantallen en tellen', doelen: AUTO_DOELEN.aan || [], parameters: K.aantalParameters, standaard: { types: ['tellen'], max: 10, jaar: 0 },
  opdracht: opdracht('Kijk goed. Schrijf het antwoord op de lijn.'), opgave: aantalOpgave, schaal: 1.1,
});

export const AUTO_GETALLEN2_VORMEN = [...RELATIE_VORMEN, ...GETALBEGRIP_VORMEN, ...RIJ_VORMEN, ...ROMEINS_VORMEN, ...GETALLENAS_VORMEN, ...AANTAL_VORMEN];
