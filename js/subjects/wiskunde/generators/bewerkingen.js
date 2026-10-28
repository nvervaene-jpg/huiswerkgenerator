// Optellen en aftrekken (met en zonder brug), maaltafels en vermenigvuldigen/delen met grotere getallen.
// Elke familie heeft een rekenkern { op, a, b, c } (a op b = c). De oefenvormen (invullen, juist/fout, tabel, ...)
// staan in invullen hier en in rekenvormen.js.
import { maakRng } from '../../../core/random.js';
import { aantalCijfers, trek, resultaat, afgeleid } from './hulp.js';
import { tafelrij, getallenas, groepjes } from '../tafel-steun.js';

/* ------------------------------------------------------------------ brug */
// Brug = een tiental, honderdtal, ... wordt overschreden. Net bereiken (7 + 3 = 10) telt niet als brug.
// Optellen: voor elke plaats k geldt (a mod 10^k) + (b mod 10^k) > 10^k, bv. 71 + 36 = 107 gaat over het honderdtal.
// Aftrekken: (a mod 10^k) < (b mod 10^k), bv. 40 - 2 of 43 - 17.
const MACHTEN = [1, 2, 3, 4, 5].map(k => 10 ** k);
export const heeftBrugOptellen = (a, b) => MACHTEN.some(m => (a % m) + (b % m) > m);
export const heeftBrugAftrekken = (a, b) => MACHTEN.some(m => (a % m) < (b % m));

const BRUG_PER_DOEL = { '2.2.GL1.19': 'zonder', '2.2.GL1.20': 'zonder', '2.2.GL1.21': 'met' };
export const BRUG_KEUZE = {
  id: 'brug', label: 'Brug (het tiental overschrijden)', type: 'select',
  opties: [['auto', 'Volgens de gekozen doelen'], ['beide', 'Zonder en met brug'], ['zonder', 'Enkel zonder brug'], ['met', 'Enkel met brug']],
  standaard: 'auto',
};
export const OPTELLEN_AFTREKKEN_DOELEN = ['2.2.GL1.16', '2.2.GL1.19', '2.2.GL1.20', '2.2.GL1.21', '2.2.GL1.22', '2.2.GL2.28', '2.2.GL2.29',
  '2.2.GL2.30', '2.2.GL2.31', '2.2.GL2.32', '2.2.GL3.25', '2.2.GL3.26', '2.2.GL3.27', '2.2.GL3.28', '2.2.GL3.29', '2.2.GL3.30',
  '2.2.GL4.29', '2.2.GL4.34'];
export const brugOpties = (doelCodes, keuzes = {}) => ({
  brug: keuzes.brug && keuzes.brug !== 'auto' ? keuzes.brug : afgeleid(doelCodes, BRUG_PER_DOEL, 'beide'),
  ...(keuzes.nul ? { nul: keuzes.nul } : {}),
});
export const NUL_KEUZE = { id: 'nul', label: 'Bewerkingen met 0', type: 'select', opties: [['weg', 'Weglaten'], ['erbij', 'Erbij']], standaard: 'weg' };

// Een getal met k cijfers (<= max); soms een 'rond' getal met eindnullen (40, 300, ...).
function getalMetCijfers(r, k, max) {
  const lo = k === 1 ? 1 : 10 ** (k - 1), hi = Math.min(10 ** k - 1, max);
  if (lo > hi) return null;
  if (r.volgende() < 0.25) {
    const ronde = r.geheel(1, 9) * 10 ** (k - 1);
    if (ronde >= lo && ronde <= hi) return ronde;
  }
  return r.geheel(lo, hi);
}

/* ------------------------------------------------------------------ rekenkernen: { op, a, b, c, moeilijkheid, kern } */
const sleutelSom = (op, a, b) => `rek:${op}:${op === '+' || op === '×' ? `${Math.min(a, b)}:${Math.max(a, b)}` : `${a}:${b}`}`;

export function somKern(soort, r, gebied, brugKeuze) {
  const optellen = soort === 'optellen';
  const a = getalMetCijfers(r, r.geheel(1, aantalCijfers(gebied)), gebied);
  if (a === null) return null;
  const maxB = optellen ? gebied - a : a - 1;
  if (maxB < 1) return null;
  const b = getalMetCijfers(r, r.geheel(1, aantalCijfers(maxB)), maxB);
  if (b === null) return null;
  const brug = optellen ? heeftBrugOptellen(a, b) : heeftBrugAftrekken(a, b);
  if ((brugKeuze === 'zonder' && brug) || (brugKeuze === 'met' && !brug)) return null;
  const op = optellen ? '+' : '-';
  return { op, a, b, c: optellen ? a + b : a - b, brug, kern: sleutelSom(op, a, b),
    moeilijkheid: [aantalCijfers(Math.max(a, b)), brug ? 1 : 0, aantalCijfers(Math.min(a, b)), Math.max(a, b)] };
}

// Een bewerking met 0: a + 0, 0 + a, a - 0 of a - a (zonder brug).
export function nulKern(soort, r, gebied) {
  const a = getalMetCijfers(r, r.geheel(1, aantalCijfers(gebied)), gebied);
  if (a === null) return null;
  const optellen = soort === 'optellen', [x, y] = optellen ? (r.volgende() < 0.5 ? [0, a] : [a, 0]) : (r.volgende() < 0.5 ? [a, 0] : [a, a]);
  const op = optellen ? '+' : '-';
  return { op, a: x, b: y, c: optellen ? x + y : x - y, brug: false, kern: sleutelSom(op, x, y), moeilijkheid: [aantalCijfers(Math.max(x, y)), 0, aantalCijfers(Math.min(x, y)), Math.max(x, y)] };
}

const TAFEL_BEWERKING = {
  '2.2.GL2.23': 'vermenigvuldigen', '2.2.GL2.25': 'vermenigvuldigen', '2.2.GL2.33': 'vermenigvuldigen', '2.2.GL3.31': 'vermenigvuldigen',
  '2.2.GL2.24': 'delen', '2.2.GL2.26': 'delen', '2.2.GL2.34': 'delen',
};
const MAAL_DEEL_BEWERKING = {
  '2.2.GL3.34': 'vermenigvuldigen', '2.2.GL4.30': 'vermenigvuldigen', '2.2.GL4.33': 'vermenigvuldigen',
  '2.2.GL3.33': 'delen', '2.2.GL4.32': 'delen',
};
export const BEWERKING_KEUZE = {
  id: 'bewerking', label: 'Bewerking', type: 'select',
  opties: [['auto', 'Volgens de gekozen doelen'], ['beide', 'Vermenigvuldigen en delen'], ['vermenigvuldigen', 'Enkel vermenigvuldigen'], ['delen', 'Enkel delen']],
  standaard: 'auto',
};
export const bewerkingOpties = (kaart) => (doelCodes, keuzes = {}) => ({
  bewerking: keuzes.bewerking && keuzes.bewerking !== 'auto' ? keuzes.bewerking : afgeleid(doelCodes, kaart, 'beide'),
});
export const leesTafels = (tekst) => {
  const lijst = [...new Set(String(tekst || '').split(/[^0-9]+/).filter(Boolean).map(Number).filter(n => n >= 1 && n <= 20))];
  return lijst.length ? lijst.sort((x, y) => x - y) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
};
export const TAFEL_DOELEN = ['2.2.GL2.23', '2.2.GL2.24', '2.2.GL2.25', '2.2.GL2.26', '2.2.GL2.27', '2.2.GL2.33', '2.2.GL2.34', '2.2.GL3.24', '2.2.GL3.31', '2.2.GL4.28'];
export const MAAL_DEEL_DOELEN = ['2.2.GL3.33', '2.2.GL3.34', '2.2.GL3.42', '2.2.GL4.30', '2.2.GL4.32', '2.2.GL4.33', '2.2.GL4.46'];

// Eén tafelsom: tafel t, vermenigvuldiger k. factorOrde bepaalt of het tafelgetal vooraan staat ('tafel-eerst'), achteraan ('tafel-laatst') of willekeurig.
export function tafelSom(r, t, k, delen, factorOrde = 'door-elkaar') {
  const p = t * k;
  if (delen) return { op: ':', a: p, b: t, c: k, tafel: t, kern: sleutelSom(':', p, t), moeilijkheid: [1, t, k] };
  const voorop = factorOrde === 'tafel-eerst' ? true : factorOrde === 'tafel-laatst' ? false : r.volgende() < 0.5;
  const [a, b] = voorop ? [t, k] : [k, t];
  return { op: '×', a, b, c: p, tafel: t, kern: sleutelSom('×', a, b), moeilijkheid: [0, t, k] };
}

export const STANDAARD_BEREIK = [1, 10];
export function tafelKern(r, gebied, tafels, bew, { bereik = STANDAARD_BEREIK, factorOrde = 'door-elkaar' } = {}) {
  const t = tafels[r.geheel(0, tafels.length - 1)], k = r.geheel(bereik[0], bereik[1]);
  if (t * k > gebied) return null;
  const delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5);
  return tafelSom(r, t, k, delen, factorOrde);
}

export function maalDeelKern(r, gebied, bew) {
  if (gebied < 100) return null;
  const b = r.geheel(2, 9), delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5);
  if (!delen) {                                            // a x b, a heeft meer dan 1 cijfer
    const maxA = Math.floor(gebied / b);
    if (maxA < 11) return null;
    const a = r.volgende() < 0.3 ? 10 * r.geheel(1, Math.floor(maxA / 10)) : r.geheel(11, maxA);
    if (a < 11 || a * b > gebied) return null;
    return { op: '×', a, b, c: a * b, kern: sleutelSom('×', a, b), moeilijkheid: [0, aantalCijfers(a * b), a % 10 === 0 ? 0 : 1, a * b] };
  }
  const maxC = Math.floor(gebied / b);                      // a : b = c, c is groter dan 10
  if (maxC < 11) return null;
  const c = r.volgende() < 0.3 ? 10 * r.geheel(2, Math.floor(maxC / 10)) : r.geheel(11, maxC);
  if (c < 11 || c * b > gebied) return null;
  return { op: ':', a: b * c, b, c, kern: sleutelSom(':', b * c, b), moeilijkheid: [1, aantalCijfers(b * c), c % 10 === 0 ? 0 : 1, b * c] };
}

/* ------------------------------------------------------------------ oefenvorm 'invullen' met de onbekende op een andere plaats */
// kern { op, a, b, c } -> tekst met één onbekende (c = uitkomst, a of b = een term)
// afgedwongen: 'uitkomst' (c), 'factor' (a of b) of 'beide' (de helft van de oefeningen elk); anders beslist onbekendKans.
export function invulOefening(r, k, onbekendKans = 0.3, afgedwongen = null) {
  const factor = () => (r.volgende() < 0.5 ? 'a' : 'b');
  const onbekend = afgedwongen === 'uitkomst' ? 'c' : afgedwongen === 'factor' ? factor() : afgedwongen === 'beide' ? (r.volgende() < 0.5 ? 'c' : factor())
    : r.volgende() < onbekendKans ? factor() : 'c';
  const delen = { a: k.a, b: k.b, c: k.c };
  const t = (x) => (onbekend === x ? '____' : String(delen[x]));
  return {
    tekst: `${t('a')} ${k.op} ${t('b')} = ${t('c')}`, antwoord: String(delen[onbekend]), volledig: `${k.a} ${k.op} ${k.b} = ${k.c}`,
    getallen: [k.a, k.b, k.c], sleutel: `${k.a}${k.op}${k.b}${onbekend}`, kern: k.kern, onbekend,
  };
}

function bewerking(soort) {
  return {
    id: soort,
    titel: soort === 'optellen' ? 'Optellen' : 'Aftrekken',
    pictogram: 'schrijven', rang: 0, basis: true,
    opdracht: soort === 'optellen' ? 'Tel op. Schrijf het antwoord op de lijn.' : 'Trek af. Schrijf het antwoord op de lijn.',
    doelen: soort === 'optellen' ? OPTELLEN_AFTREKKEN_DOELEN : [...OPTELLEN_AFTREKKEN_DOELEN, '2.2.GL1.23'],
    keuzes: [{ ...BRUG_KEUZE, groep: soort }, { ...NUL_KEUZE, groep: soort }],
    opties: brugOpties,
    genereer({ seed, aantal, gebied, opties }) {
      const brugKeuze = (opties && opties.brug) || 'beide', metNul = opties && opties.nul === 'erbij';
      const rng = maakRng(seed);
      const lijst = trek(rng, aantal, (r) => {
        const k = metNul && r.volgende() < 0.25 ? nulKern(soort, r, gebied) : somKern(soort, r, gebied, brugKeuze);
        if (!k) return null;
        const o = invulOefening(r, k);
        return { ...o, familie: k.kern, moeilijkheid: [k.moeilijkheid[0], k.moeilijkheid[1], o.onbekend === 'c' ? 0 : 1, ...k.moeilijkheid.slice(2)],
          data: { type: soort, a: k.a, b: k.b, brug: k.brug, onbekend: o.onbekend } };
      });
      return resultaat(lijst, aantal);
    },
  };
}
export const optellen = bewerking('optellen');
export const aftrekken = bewerking('aftrekken');

/* ------------------------------------------------------------------ maaltafels */
// Keuzes die alle vormen van de maaltafels delen, en de keuzes die enkel bij 'invullen' horen (volgorde, onbekende, steun).
export const TAFEL_KEUZES = [
  BEWERKING_KEUZE,
  { id: 'tafels', label: 'Welke tafels? (bv. 2, 5, 10)', type: 'tekst', standaard: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10' },
  { id: 'bereik', label: 'Vermenigvuldiger', type: 'select', opties: [['1-10', '× 1 tot 10'], ['1-5', '× 1 tot 5'], ['6-10', '× 6 tot 10'], ['zelf', 'Zelf kiezen', '']], standaard: '1-10' },
  { id: 'bereikZelf', label: 'Van – tot (bv. 3-8)', type: 'tekst', standaard: '1-10', alsKeuze: { id: 'bereik', waarde: 'zelf' }, kort: (w) => `× ${String(w).replace(/\s*[^0-9]+\s*/, ' tot ')}` },
];
export const TAFEL_INVUL_KEUZES = [
  { id: 'volgorde', label: 'Volgorde', type: 'select', opties: [['door-elkaar', 'Door elkaar'], ['in-volgorde', 'In volgorde (1 × 3, 2 × 3, …)', 'in volgorde']], standaard: 'door-elkaar' },
  { id: 'groepering', label: 'Groeperen', type: 'select', opties: [['gemengd', 'Alle tafels gemengd'], ['per-tafel', 'Per tafel bij elkaar', 'per tafel']], standaard: 'gemengd' },
  { id: 'onbekend', label: 'Wat is onbekend?', type: 'select', opties: [['mix', 'Meestal de uitkomst'], ['uitkomst', 'De uitkomst (3 × 7 = …)', 'uitkomst onbekend'], ['factor', 'Een factor (3 × … = 21)', 'factor onbekend'], ['beide', 'Beide door elkaar', 'uitkomst of factor onbekend']], standaard: 'mix' },
  { id: 'factorOrde', label: 'Tafelgetal staat', type: 'select', opties: [['door-elkaar', 'Door elkaar'], ['tafel-eerst', 'Vooraan (3 × 7)', 'tafelgetal vooraan'], ['tafel-laatst', 'Achteraan (7 × 3)', 'tafelgetal achteraan']], standaard: 'door-elkaar' },
  { id: 'steun', label: 'Steun', type: 'select', opties: [['geen', 'Geen'], ['tafelrij', 'Tafelrij bovenaan', 'met tafelrij'], ['getallenas', 'Getallenas met sprongen', 'met getallenas'], ['groepjes', 'Groepjes bolletjes bij elke som', 'met groepjes']], standaard: 'geen' },
];
const VOLGORDE_WAARDEN = new Set(TAFEL_INVUL_KEUZES.flatMap(k => k.opties.map(([w]) => w)));
export const leesBereik = (keuzes = {}) => {
  const w = keuzes.bereik === 'zelf' ? keuzes.bereikZelf : keuzes.bereik;
  const m = String(w || '').match(/\d+/g);
  if (!m || m.length < 2 || w === undefined) return STANDAARD_BEREIK;
  const [x, y] = [Number(m[0]), Number(m[1])].map(n => Math.min(20, Math.max(1, n)));
  return [Math.min(x, y), Math.max(x, y)];
};
export function tafelOptiesVan(doelCodes, keuzes = {}) {
  const uit = { ...bewerkingOpties(TAFEL_BEWERKING)(doelCodes, keuzes), tafels: leesTafels(keuzes.tafels) };
  const bereik = leesBereik(keuzes);
  if (bereik[0] !== STANDAARD_BEREIK[0] || bereik[1] !== STANDAARD_BEREIK[1]) uit.bereik = bereik;
  for (const k of TAFEL_INVUL_KEUZES) if (VOLGORDE_WAARDEN.has(keuzes[k.id]) && keuzes[k.id] !== k.standaard) uit[k.id] = keuzes[k.id];   // enkel wat afwijkt van de standaard, zo blijven oude bladcodes hetzelfde
  return uit;
}
const reeks = ([van, tot]) => { const l = []; for (let k = van; k <= tot; k++) l.push(k); return l; };

// De som met de steun die erbij hoort. 'groepjes': a rijen van b bolletjes (bij delen: a : b = c rijen van b bolletjes).
export function tafelOefening(r, k, opties) {
  const o = opties || {}, afgedwongen = o.onbekend && o.onbekend !== 'mix' ? o.onbekend : null;
  const oef = invulOefening(r, k, 0.3, afgedwongen);
  const uit = { ...oef, familie: k.kern, moeilijkheid: [k.moeilijkheid[0], oef.onbekend === 'c' ? 0 : 1, k.moeilijkheid[1], k.moeilijkheid[2]],
    data: { type: 'tafel', op: k.op, a: k.a, b: k.b, onbekend: oef.onbekend } };
  if (o.steun === 'groepjes') { const t = k.op === '×' ? groepjes(k.a, k.b) : groepjes(k.c, k.b); if (t) { uit.svg = t; uit.breed = true; } }
  return uit;
}
export function tafelSteun(opties) {
  const o = opties || {}, tafels = o.tafels || leesTafels(''), bereik = o.bereik || STANDAARD_BEREIK;
  if (o.steun === 'tafelrij') return { tekst: tafelrij(tafels, bereik).tekst };
  if (o.steun === 'getallenas') return { svg: getallenas(tafels, bereik) };
  return null;
}

export const maaltafels = {
  id: 'maaltafels',
  titel: 'Maaltafels en deeltafels',
  pictogram: 'schrijven', rang: 0, basis: true,
  opdracht: 'Reken uit. Schrijf het antwoord op de lijn.',
  doelen: TAFEL_DOELEN,
  keuzes: [...TAFEL_KEUZES, ...TAFEL_INVUL_KEUZES],
  opties: tafelOptiesVan,
  genereer({ seed, aantal, gebied, opties }) {
    const o = opties || {}, tafels = o.tafels || leesTafels(''), bew = o.bewerking || 'beide', bereik = o.bereik || STANDAARD_BEREIK;
    const inVolgorde = o.volgorde === 'in-volgorde', perTafel = o.groepering === 'per-tafel', factorOrde = o.factorOrde || 'door-elkaar';
    const rng = maakRng(seed), steun = tafelSteun(o);
    if (!inVolgorde && !perTafel) {                               // door elkaar: een willekeurige keuze, van makkelijk naar moeilijk
      const lijst = trek(rng, aantal, (r) => {
        const k = tafelKern(r, gebied, tafels, bew, { bereik, factorOrde });
        return k && tafelOefening(r, k, o);
      });
      return { ...resultaat(lijst, aantal), ...(steun ? { steun } : {}) };
    }
    // Vaste opbouw: de oefeningen komen precies in de gekozen volgorde (vast = true: het blad neemt de eerste n).
    const ks = reeks(bereik), geldig = (t, k) => t * k <= gebied, groepen = [];
    const soorten = bew === 'beide' ? [false, true] : [bew === 'delen'];
    if (perTafel) for (const t of tafels) groepen.push(ks.filter(k => geldig(t, k)).map(k => ({ t, k })));
    else groepen.push(ks.flatMap(k => tafels.filter(t => geldig(t, k)).map(t => ({ t, k }))));
    const lijst = [];
    for (const g of groepen) {
      let stappen = soorten.flatMap(delen => g.map(({ t, k }) => ({ t, k, delen })));
      if (!inVolgorde) stappen = rng.schud(stappen);
      for (const { t, k, delen } of stappen) lijst.push(tafelOefening(rng, tafelSom(rng, t, k, delen, factorOrde), o));
    }
    const uit = lijst.slice(0, aantal);
    return { oefeningen: uit, vast: true, waarschuwing: uit.length < aantal ? `Met deze instellingen zijn er ${uit.length} oefeningen.` : null, ...(steun ? { steun } : {}) };
  },
};

/* ------------------------------------------------------------------ vermenigvuldigen en delen met grotere getallen */
export const vermenigvuldigenDelen = {
  id: 'vermenigvuldigen-delen',
  titel: 'Vermenigvuldigen en delen met grotere getallen',
  pictogram: 'schrijven', rang: 0, basis: true,
  opdracht: 'Reken uit. Schrijf het antwoord op de lijn.',
  doelen: MAAL_DEEL_DOELEN,
  keuzes: [BEWERKING_KEUZE],
  opties: bewerkingOpties(MAAL_DEEL_BEWERKING),
  genereer({ seed, aantal, gebied, opties }) {
    if (gebied < 100) return { oefeningen: [], waarschuwing: 'Dit onderdeel vraagt een getallengebied vanaf 100.' };
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const k = maalDeelKern(r, gebied, (opties && opties.bewerking) || 'beide');
      if (!k) return null;
      const o = invulOefening(r, k, 0.2);
      return { ...o, familie: k.kern, moeilijkheid: [k.moeilijkheid[0], k.moeilijkheid[1], o.onbekend === 'c' ? 0 : 1, k.moeilijkheid[2], k.moeilijkheid[3]],
        data: { type: 'tafel', op: k.op, a: k.a, b: k.b, onbekend: o.onbekend } };
    });
    return resultaat(lijst, aantal);
  },
};
