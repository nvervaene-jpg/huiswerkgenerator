// Cijferen onder elkaar: optellen, aftrekken (met onthouden), vermenigvuldigen met een getal van één of twee cijfers.
// De leerling vult het rooster in; de antwoordsleutel toont het antwoord en de tussenstappen (onthoudcijfers, deelproducten) in het rood.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat, aantalCijfers } from './hulp.js';
import { optelRooster, aftrekRooster, maalRooster, maalRooster2 } from '../cijfer-svg.js';

const OPTEL_DOELEN = ['2.2.GL3.45', '2.2.GL3.46', '2.2.GL4.48', '2.2.GL4.49', '2.2.GL5.25', '2.2.GL6.29'];
const MAAL_DOELEN = ['2.2.GL4.50', '2.2.GL4.51', '2.2.GL5.25', '2.2.GL5.33', '2.2.GL5.34', '2.2.GL6.29', '2.2.GL6.39', '2.2.GL6.40'];
export const ONTHOUDEN_KEUZE = { id: 'onthouden', label: 'Onthouden', type: 'select', opties: [['beide', 'Zonder en met onthouden'], ['zonder', 'Zonder onthouden'], ['met', 'Met onthouden']], standaard: 'beide' };
export const TERMEN_KEUZE = { id: 'termen', label: 'Aantal getallen', type: 'select', opties: [['2', 'Twee getallen'], ['3', 'Drie getallen']], standaard: '2' };
const opties = (doelCodes, keuzes = {}) => ({ onthouden: keuzes.onthouden || 'beide', termen: Number(keuzes.termen || 2) });

const cijfers = (n) => String(n).split('').reverse().map(Number);
const getal = (r, d, max) => { const lo = d === 1 ? 1 : 10 ** (d - 1), hi = Math.min(10 ** d - 1, max); return lo > hi ? null : r.geheel(lo, hi); };
const maxCijfers = (gebied) => Math.min(4, aantalCijfers(gebied));
const past = (keuze, heeft) => keuze === 'beide' || (keuze === 'met') === heeft;

// onthoudcijfers per kolom (van rechts): het getal dat naar de volgende kolom gaat
export function optelOnthouden(termen) {
  const rijen = termen.map(cijfers), kol = Math.max(...rijen.map(x => x.length)), uit = [];
  let cin = 0;
  for (let k = 0; k < kol; k++) { const s = rijen.reduce((x, c) => x + (c[k] ?? 0), 0) + cin; cin = Math.floor(s / 10); uit.push(cin); }
  return uit;
}
// aftrekken met onthouden: is het cijfer te klein, dan tien erbij en 1 onthouden bij de volgende aftrekker
export function aftrekOnthouden(a, b) {
  const x = cijfers(a), y = cijfers(b), uit = []; let bin = 0;
  for (let k = 0; k < x.length; k++) { const bout = x[k] < (y[k] ?? 0) + bin ? 1 : 0; uit.push(bout); bin = bout; }
  return uit;
}
export function maalOnthouden(a, b) {
  const x = cijfers(a), uit = []; let cin = 0;
  for (let k = 0; k < x.length; k++) { cin = Math.floor((x[k] * b + cin) / 10); uit.push(cin); }
  return uit;
}

const vorm = ({ id, titel, opdracht, doelen, keuzes, bouw }) => ({
  id, titel, pictogram: 'schrijven', opdracht, doelen, rang: 5, schaal: 0.5, basis: false, keuzes, opties,
  genereer({ seed, aantal, gebied, opties: o }) {
    const rng = maakRng(seed), keuze = { onthouden: 'beide', termen: 2, ...(o || {}) };
    if (gebied < 100) return { oefeningen: [], waarschuwing: 'Cijferen vraagt een rekengebied vanaf 100.' };
    return resultaat(trek(rng, aantal, (r) => bouw(r, gebied, keuze)), aantal);
  },
});
const oef = (svg, antwoordSvg, antwoord, volledig, kern, moeilijkheid, data) => ({ tekst: '', svg, antwoordSvg, antwoord: String(antwoord), volledig, getallen: [], sleutel: kern, kern, moeilijkheid, data });

export const CIJFER_OPTELLEN = vorm({
  id: 'cijferen-optellen', titel: 'Cijferen: optellen onder elkaar', opdracht: 'Tel op. Schrijf de getallen onder elkaar en onthoud in de vakjes. Reken in het rooster.',
  doelen: OPTEL_DOELEN, keuzes: [ONTHOUDEN_KEUZE, TERMEN_KEUZE],
  bouw(r, gebied, k) {
    const d = r.geheel(2, maxCijfers(gebied)), termen = [];
    for (let i = 0; i < k.termen; i++) { const t = getal(r, r.geheel(Math.max(2, d - 1), d), gebied); if (t === null) return null; termen.push(t); }
    const som = termen.reduce((x, y) => x + y, 0);
    if (som > gebied) return null;
    const onthouden = optelOnthouden(termen), heeft = onthouden.some(c => c > 0);
    if (!past(k.onthouden, heeft)) return null;
    const p = { termen, som, onthouden };
    return oef(optelRooster({ ...p, oplossing: false }), optelRooster({ ...p, oplossing: true }), som, `${termen.join(' + ')} = ${som}`, `co${termen.join('+')}`, [d, heeft ? 1 : 0, termen.length],
      { type: 'cijferen', op: '+', termen, som, onthouden, heeft });
  },
});

export const CIJFER_AFTREKKEN = vorm({
  id: 'cijferen-aftrekken', titel: 'Cijferen: aftrekken onder elkaar', opdracht: 'Trek af. Schrijf de getallen onder elkaar en onthoud in de vakjes. Reken in het rooster.',
  doelen: OPTEL_DOELEN, keuzes: [ONTHOUDEN_KEUZE],
  bouw(r, gebied, k) {
    const d = r.geheel(2, maxCijfers(gebied)), a = getal(r, d, gebied), b = a === null ? null : getal(r, r.geheel(Math.max(2, d - 1), d), a - 1);
    if (a === null || b === null || b >= a) return null;
    const onthouden = aftrekOnthouden(a, b), heeft = onthouden.some(c => c > 0);
    if (!past(k.onthouden, heeft)) return null;
    const verschil = a - b;
    const p = { a, b, onthouden, verschil };
    return oef(aftrekRooster({ ...p, oplossing: false }), aftrekRooster({ ...p, oplossing: true }), verschil, `${a} − ${b} = ${verschil}`, `ca${a}-${b}`, [d, heeft ? 1 : 0],
      { type: 'cijferen', op: '-', a, b, verschil, onthouden, heeft });
  },
});

export const CIJFER_MAAL = vorm({
  id: 'cijferen-maal-een', titel: 'Cijferen: vermenigvuldigen met één cijfer', opdracht: 'Vermenigvuldig. Schrijf de getallen onder elkaar en onthoud in de vakjes. Reken in het rooster.',
  doelen: MAAL_DOELEN, keuzes: [ONTHOUDEN_KEUZE],
  bouw(r, gebied, k) {
    const b = r.geheel(2, 9), d = r.geheel(2, maxCijfers(gebied)), a = getal(r, d, Math.floor(gebied / b));
    if (a === null || a * b > gebied || a % 10 === 0) return null;
    const onthouden = maalOnthouden(a, b), heeft = onthouden.some(c => c > 0);
    if (!past(k.onthouden, heeft)) return null;
    const product = a * b, p = { a, b, onthouden, product };
    return oef(maalRooster({ ...p, oplossing: false }), maalRooster({ ...p, oplossing: true }), product, `${a} × ${b} = ${product}`, `cm${a}x${b}`, [d, heeft ? 1 : 0],
      { type: 'cijferen', op: '×', a, b, product, onthouden, heeft });
  },
});

export const CIJFER_MAAL_TWEE = vorm({
  id: 'cijferen-maal-twee', titel: 'Cijferen: vermenigvuldigen met twee cijfers', opdracht: 'Vermenigvuldig. Schrijf de getallen onder elkaar. Reken eerst met de eenheden, dan met de tientallen.',
  doelen: MAAL_DOELEN.filter(c => !['2.2.GL4.50', '2.2.GL4.51'].includes(c)), keuzes: [],
  bouw(r, gebied) {
    if (gebied < 1000) return null;
    const b = r.geheel(11, 99);
    if (b % 10 === 0) return null;
    const a = getal(r, r.geheel(2, 3), Math.floor(gebied / b));
    if (a === null || a * b > gebied || a % 10 === 0) return null;
    const deel1 = a * (b % 10), deel2 = a * Math.floor(b / 10) * 10, product = a * b, p = { a, b, deel1, deel2, product };
    return oef(maalRooster2({ ...p, oplossing: false }), maalRooster2({ ...p, oplossing: true }), product, `${a} × ${b} = ${deel1} + ${deel2} = ${product}`, `cm2${a}x${b}`, [aantalCijfers(a), 2],
      { type: 'cijferen', op: '××', a, b, deel1, deel2, product });
  },
});
export const CIJFER_VORMEN = [CIJFER_OPTELLEN, CIJFER_AFTREKKEN, CIJFER_MAAL, CIJFER_MAAL_TWEE];
