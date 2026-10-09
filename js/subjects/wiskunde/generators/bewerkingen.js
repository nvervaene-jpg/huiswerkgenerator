// Optellen en aftrekken (met en zonder brug), maaltafels en vermenigvuldigen/delen met grotere getallen.
// Elke familie heeft een rekenkern { op, a, b, c } (a op b = c). De oefenvormen (invullen, juist/fout, tabel, ...)
// staan in invullen hier en in rekenvormen.js.
import { maakRng } from '../../../core/random.js';
import { aantalCijfers, trek, resultaat, afgeleid } from './hulp.js';

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
});

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
  const lijst = [...new Set(String(tekst || '').split(/[^0-9]+/).filter(Boolean).map(Number).filter(n => n >= 1 && n <= 10))];
  return lijst.length ? lijst.sort((x, y) => x - y) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
};
export const TAFEL_DOELEN = ['2.2.GL2.23', '2.2.GL2.24', '2.2.GL2.25', '2.2.GL2.26', '2.2.GL2.27', '2.2.GL2.33', '2.2.GL2.34', '2.2.GL3.24', '2.2.GL3.31', '2.2.GL4.28'];
export const MAAL_DEEL_DOELEN = ['2.2.GL3.33', '2.2.GL3.34', '2.2.GL3.42', '2.2.GL4.30', '2.2.GL4.32', '2.2.GL4.33', '2.2.GL4.46'];

export function tafelKern(r, gebied, tafels, bew) {
  const t = tafels[r.geheel(0, tafels.length - 1)], k = r.geheel(1, 10), p = t * k;
  if (p > gebied) return null;
  const delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5);
  if (!delen) {
    const [a, b] = r.volgende() < 0.5 ? [t, k] : [k, t];
    return { op: '×', a, b, c: p, tafel: t, kern: sleutelSom('×', a, b), moeilijkheid: [0, t, k] };
  }
  return { op: ':', a: p, b: t, c: k, tafel: t, kern: sleutelSom(':', p, t), moeilijkheid: [1, t, k] };
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
export function invulOefening(r, k, onbekendKans = 0.3) {
  const onbekend = r.volgende() < onbekendKans ? (r.volgende() < 0.5 ? 'a' : 'b') : 'c';
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
    keuzes: [{ ...BRUG_KEUZE, groep: soort }],
    opties: brugOpties,
    genereer({ seed, aantal, gebied, opties }) {
      const brugKeuze = (opties && opties.brug) || 'beide';
      const rng = maakRng(seed);
      const lijst = trek(rng, aantal, (r) => {
        const k = somKern(soort, r, gebied, brugKeuze);
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
export const maaltafels = {
  id: 'maaltafels',
  titel: 'Maaltafels en deeltafels',
  pictogram: 'schrijven', rang: 0, basis: true,
  opdracht: 'Reken uit. Schrijf het antwoord op de lijn.',
  doelen: TAFEL_DOELEN,
  keuzes: [
    BEWERKING_KEUZE,
    { id: 'tafels', label: 'Welke tafels? (bv. 2, 5, 10)', type: 'tekst', standaard: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10' },
  ],
  opties(doelCodes, keuzes = {}) {
    return { ...bewerkingOpties(TAFEL_BEWERKING)(doelCodes, keuzes), tafels: leesTafels(keuzes.tafels) };
  },
  genereer({ seed, aantal, gebied, opties }) {
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const k = tafelKern(r, gebied, (opties && opties.tafels) || leesTafels(''), (opties && opties.bewerking) || 'beide');
      if (!k) return null;
      const o = invulOefening(r, k);
      return { ...o, familie: k.kern, moeilijkheid: [k.moeilijkheid[0], o.onbekend === 'c' ? 0 : 1, k.moeilijkheid[1], k.moeilijkheid[2]],
        data: { type: 'tafel', op: k.op, a: k.a, b: k.b, onbekend: o.onbekend } };
    });
    return resultaat(lijst, aantal);
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
