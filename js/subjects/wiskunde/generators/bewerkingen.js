// Optellen en aftrekken (met en zonder brug), maaltafels en vermenigvuldigen/delen.
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
const BRUG_KEUZE = {
  id: 'brug', label: 'Brug (het tiental overschrijden)', type: 'select',
  opties: [['auto', 'Volgens de gekozen doelen'], ['beide', 'Zonder en met brug'], ['zonder', 'Enkel zonder brug'], ['met', 'Enkel met brug']],
  standaard: 'auto',
};
const OPTELLEN_AFTREKKEN_DOELEN = ['2.2.GL1.16', '2.2.GL1.19', '2.2.GL1.20', '2.2.GL1.21', '2.2.GL1.22', '2.2.GL2.28', '2.2.GL2.29',
  '2.2.GL2.30', '2.2.GL2.31', '2.2.GL2.32', '2.2.GL3.25', '2.2.GL3.26', '2.2.GL3.27', '2.2.GL3.28', '2.2.GL3.29', '2.2.GL3.30',
  '2.2.GL4.29', '2.2.GL4.34'];

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

function bewerking(soort) {
  const optellen = soort === 'optellen';
  return {
    id: soort,
    titel: optellen ? 'Optellen' : 'Aftrekken',
    pictogram: 'schrijven',
    opdracht: optellen ? 'Tel op. Schrijf het antwoord op de lijn.' : 'Trek af. Schrijf het antwoord op de lijn.',
    doelen: optellen ? OPTELLEN_AFTREKKEN_DOELEN : [...OPTELLEN_AFTREKKEN_DOELEN, '2.2.GL1.23'],
    keuzes: [BRUG_KEUZE],
    opties(doelCodes, keuzes = {}) {
      const gekozen = keuzes.brug && keuzes.brug !== 'auto' ? keuzes.brug : afgeleid(doelCodes, BRUG_PER_DOEL, 'beide');
      return { brug: gekozen };
    },
    genereer({ seed, aantal, gebied, opties }) {
      const brugKeuze = (opties && opties.brug) || 'beide';
      const rng = maakRng(seed);
      const lijst = trek(rng, aantal, (r) => {
        const a = getalMetCijfers(r, r.geheel(1, aantalCijfers(gebied)), gebied);
        if (a === null) return null;
        const maxB = optellen ? gebied - a : a - 1;
        if (maxB < 1) return null;
        const b = getalMetCijfers(r, r.geheel(1, aantalCijfers(maxB)), maxB);
        if (b === null) return null;
        const brug = optellen ? heeftBrugOptellen(a, b) : heeftBrugAftrekken(a, b);
        if ((brugKeuze === 'zonder' && brug) || (brugKeuze === 'met' && !brug)) return null;
        const uitkomst = optellen ? a + b : a - b;
        const teken = optellen ? '+' : '-';
        return {
          tekst: `${a} ${teken} ${b} = ____`, antwoord: String(uitkomst), volledig: `${a} ${teken} ${b} = ${uitkomst}`,
          getallen: [a, b, uitkomst], sleutel: `${a}${teken}${b}`,
          familie: optellen ? [Math.min(a, b), Math.max(a, b)].join('+') : null,
          moeilijkheid: [aantalCijfers(Math.max(a, b)), brug ? 1 : 0, aantalCijfers(Math.min(a, b)), Math.max(a, b)],
          data: { type: soort, a, b, brug },
        };
      });
      return resultaat(lijst, aantal);
    },
  };
}
export const optellen = bewerking('optellen');
export const aftrekken = bewerking('aftrekken');

/* ------------------------------------------------------------------ maaltafels */
const BEWERKING_KEUZE = {
  id: 'bewerking', label: 'Bewerking', type: 'select',
  opties: [['auto', 'Volgens de gekozen doelen'], ['beide', 'Vermenigvuldigen en delen'], ['vermenigvuldigen', 'Enkel vermenigvuldigen'], ['delen', 'Enkel delen']],
  standaard: 'auto',
};
const bewerkingOpties = (kaart) => (doelCodes, keuzes = {}) => ({
  bewerking: keuzes.bewerking && keuzes.bewerking !== 'auto' ? keuzes.bewerking : afgeleid(doelCodes, kaart, 'beide'),
});

const TAFEL_BEWERKING = {
  '2.2.GL2.23': 'vermenigvuldigen', '2.2.GL2.25': 'vermenigvuldigen', '2.2.GL2.33': 'vermenigvuldigen', '2.2.GL3.31': 'vermenigvuldigen',
  '2.2.GL2.24': 'delen', '2.2.GL2.26': 'delen', '2.2.GL2.34': 'delen',
};
export const leesTafels = (tekst) => {
  const lijst = [...new Set(String(tekst || '').split(/[^0-9]+/).filter(Boolean).map(Number).filter(n => n >= 1 && n <= 10))];
  return lijst.length ? lijst.sort((x, y) => x - y) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
};

export const maaltafels = {
  id: 'maaltafels',
  titel: 'Maaltafels en deeltafels',
  pictogram: 'schrijven',
  opdracht: 'Reken uit. Schrijf het antwoord op de lijn.',
  doelen: ['2.2.GL2.23', '2.2.GL2.24', '2.2.GL2.25', '2.2.GL2.26', '2.2.GL2.27', '2.2.GL2.33', '2.2.GL2.34', '2.2.GL3.24', '2.2.GL3.31', '2.2.GL4.28'],
  keuzes: [
    BEWERKING_KEUZE,
    { id: 'tafels', label: 'Welke tafels? (bv. 2, 5, 10)', type: 'tekst', standaard: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10' },
  ],
  opties(doelCodes, keuzes = {}) {
    return { ...bewerkingOpties(TAFEL_BEWERKING)(doelCodes, keuzes), tafels: leesTafels(keuzes.tafels) };
  },
  genereer({ seed, aantal, gebied, opties }) {
    const bew = (opties && opties.bewerking) || 'beide';
    const tafels = (opties && opties.tafels) || leesTafels('');
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const t = tafels[r.geheel(0, tafels.length - 1)], k = r.geheel(1, 10), p = t * k;
      if (p > gebied) return null;
      const delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5);
      if (!delen) {
        const [x, y] = r.volgende() < 0.5 ? [t, k] : [k, t];
        return { tekst: `${x} × ${y} = ____`, antwoord: String(p), volledig: `${x} × ${y} = ${p}`, getallen: [x, y, p],
          sleutel: `x${x}x${y}`, familie: `x${Math.min(x, y)}x${Math.max(x, y)}`, moeilijkheid: [0, t, k], data: { type: 'maal', x, y } };
      }
      return { tekst: `${p} : ${t} = ____`, antwoord: String(k), volledig: `${p} : ${t} = ${k}`, getallen: [p, t, k],
        sleutel: `d${p}:${t}`, moeilijkheid: [1, t, k], data: { type: 'deel', p, t, k } };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ vermenigvuldigen en delen met grotere getallen */
const MAAL_DEEL_BEWERKING = {
  '2.2.GL3.34': 'vermenigvuldigen', '2.2.GL4.30': 'vermenigvuldigen', '2.2.GL4.33': 'vermenigvuldigen',
  '2.2.GL3.33': 'delen', '2.2.GL4.32': 'delen',
};
export const vermenigvuldigenDelen = {
  id: 'vermenigvuldigen-delen',
  titel: 'Vermenigvuldigen en delen met grotere getallen',
  pictogram: 'schrijven',
  opdracht: 'Reken uit. Schrijf het antwoord op de lijn.',
  doelen: ['2.2.GL3.33', '2.2.GL3.34', '2.2.GL3.42', '2.2.GL4.30', '2.2.GL4.32', '2.2.GL4.33', '2.2.GL4.46'],
  keuzes: [BEWERKING_KEUZE],
  opties: bewerkingOpties(MAAL_DEEL_BEWERKING),
  genereer({ seed, aantal, gebied, opties }) {
    if (gebied < 100) return { oefeningen: [], waarschuwing: 'Dit onderdeel vraagt een getallengebied vanaf 100.' };
    const bew = (opties && opties.bewerking) || 'beide';
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const b = r.geheel(2, 9);
      const delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5);
      if (!delen) {                                            // a x b, a heeft meer dan 1 cijfer
        const maxA = Math.floor(gebied / b);
        if (maxA < 11) return null;
        const a = r.volgende() < 0.3 ? 10 * r.geheel(1, Math.floor(maxA / 10)) : r.geheel(11, maxA);
        if (a < 11 || a * b > gebied) return null;
        return { tekst: `${a} × ${b} = ____`, antwoord: String(a * b), volledig: `${a} × ${b} = ${a * b}`, getallen: [a, b, a * b],
          sleutel: `x${a}x${b}`, moeilijkheid: [0, aantalCijfers(a * b), a % 10 === 0 ? 0 : 1, a * b], data: { type: 'maal', x: a, y: b } };
      }
      const maxC = Math.floor(gebied / b);                      // a : b = c, c is groter dan 10
      if (maxC < 11) return null;
      const c = r.volgende() < 0.3 ? 10 * r.geheel(2, Math.floor(maxC / 10)) : r.geheel(11, maxC);
      if (c < 11 || c * b > gebied) return null;
      return { tekst: `${b * c} : ${b} = ____`, antwoord: String(c), volledig: `${b * c} : ${b} = ${c}`, getallen: [b * c, b, c],
        sleutel: `d${b * c}:${b}`, moeilijkheid: [1, aantalCijfers(b * c), c % 10 === 0 ? 0 : 1, b * c], data: { type: 'deel', p: b * c, t: b, k: c } };
    });
    return resultaat(lijst, aantal);
  },
};
