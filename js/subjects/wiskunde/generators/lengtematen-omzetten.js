// Generator: lengtematen omzetten (bv. 3 dm = __ cm).
// Alle getallen in een oefening (gegeven én antwoord) blijven binnen het getallengebied.
import { maakRng } from '../../../core/random.js';

const FACTOR = { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 };

// Welke eenheden bij welk Op.stap-doel horen.
const EENHEDEN_PER_DOEL = {
  '2.3.GL2.16': ['m', 'dm', 'cm'],
  '2.3.GL3.19': ['km', 'm', 'dm', 'cm'],
  '2.3.GL3.30': ['km', 'm', 'dm', 'cm'],
  '2.3.GL4.23': ['km', 'm', 'dm', 'cm', 'mm'],
  '2.3.GL4.42': ['km', 'm', 'dm', 'cm', 'mm'],
};

function kandidaten(eenheden, gebied) {
  const lijst = [];
  const voeg = (a, v, b, w, verhouding, omhoog) => lijst.push({
    tekst: `${v} ${a} = ____ ${b}`,
    antwoord: `${w} ${b}`,
    volledig: `${v} ${a} = ${w} ${b}`,
    getallen: [v, w],
    sleutel: `${v} ${a}>${b}`,
    // dezelfde omzetting in beide richtingen telt als gelijkaardig
    familie: [[a, b].sort().join(), Math.min(v, w)].join(':'),
    moeilijkheid: [Math.log10(verhouding) + (omhoog ? 0.5 : 0), Math.max(v, w)],
  });
  for (const a of eenheden) for (const b of eenheden) {
    if (a === b) continue;
    if (FACTOR[a] > FACTOR[b]) {
      const r = FACTOR[a] / FACTOR[b];
      for (let v = 1; v * r <= gebied; v++) voeg(a, v, b, v * r, r, false);
    } else {
      const r = FACTOR[b] / FACTOR[a];
      for (let w = 1; w * r <= gebied; w++) voeg(a, w * r, b, w, r, true);
    }
  }
  return lijst;
}

export default {
  id: 'lengtematen-omzetten',
  titel: 'Lengtematen omzetten',
  pictogram: 'schrijven',
  opdracht: 'Reken om. Schrijf het antwoord op de lijn.',
  doelen: Object.keys(EENHEDEN_PER_DOEL),

  opties(doelCodes) {
    const eenheden = new Set();
    for (const c of doelCodes) (EENHEDEN_PER_DOEL[c] || []).forEach(e => eenheden.add(e));
    return { eenheden: Object.keys(FACTOR).reverse().filter(e => eenheden.has(e)) };
  },

  genereer({ seed, aantal, gebied, opties }) {
    const eenheden = (opties && opties.eenheden) || ['m', 'dm', 'cm'];
    const rng = maakRng(seed);
    const gezien = new Set();
    const gekozen = [];
    for (const k of rng.schud(kandidaten(eenheden, gebied))) {
      if (gekozen.length >= aantal) break;
      if (gezien.has(k.familie)) continue;
      gezien.add(k.familie);
      gekozen.push(k);
    }
    gekozen.sort((x, y) => x.moeilijkheid[0] - y.moeilijkheid[0] || x.moeilijkheid[1] - y.moeilijkheid[1]);
    const oefeningen = gekozen.map(({ tekst, antwoord, volledig, getallen, sleutel }) => ({ tekst, antwoord, volledig, getallen, sleutel }));
    const waarschuwing = oefeningen.length < aantal
      ? `Binnen dit getallengebied zijn maar ${oefeningen.length} verschillende oefeningen mogelijk.` : null;
    return { oefeningen, waarschuwing };
  },
};
