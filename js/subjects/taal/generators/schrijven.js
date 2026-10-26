// Schrijfoefeningen met plaatjes en zinnen: een woord bij het plaatje schrijven, een zin aanvullen, een zin uit woordkaartjes leggen,
// een zin met een fout herstellen en een zin bij een plaatje schrijven. De tekeningen staan in ../woorden/plaatjes.js.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from '../../wiskunde/generators/hulp.js';
import { woordenVakjes } from '../svg.js';
import { kies, ZINNEN_ALLE } from './taalkunde.js';
import { plaatjesVoor, plaatjeSvg } from '../woorden/plaatjes.js';
import * as D from '../woorden/taalgebruik.js';

const LIJN = '________________________________';
const GROEP = 'schrijven-plaatje';
const regelBij = (doel) => (doel === '1.3.GL1.18' ? 'tek' : 'mkm');
const heeftNaam = (z) => D.EIGENNAMEN_BEGIN.includes(z.split(' ')[0].replace(/[.,!?]/g, ''));
const zonderEersteHoofdletter = (z) => (heeftNaam(z) ? z : z.charAt(0).toLowerCase() + z.slice(1));

function maakVorm({ id, titel, pictogram, opdracht, doelen, rang, schaal = 0.9, basis = false, keuzes = [], bouw }) {
  return {
    id, titel, pictogram, opdracht, doelen, rang, schaal, basis, keuzes,
    opties: (doelCodes, eigen, doel) => ({ doel: doel && doelen.includes(doel) ? doel : doelCodes.find(c => doelen.includes(c)) || doelen[0], ...eigen }),
    genereer({ seed, aantal, opties }) {
      const o = opties || { doel: doelen[0] }, rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => bouw(r, o)), aantal);
    },
  };
}
const oefening = (o) => ({ getallen: [], breed: true, familie: o.kern, ...o });

/* ------------------------------------------------------------------ 1. woord bij het plaatje schrijven */
const WOORD_DOELEN = ['1.3.GL1.13', '1.3.GL1.18'];
const woordBijPlaatje = maakVorm({
  id: 'sw-plaatje-woord', titel: 'Schrijf het woord bij het plaatje', pictogram: 'schrijven', opdracht: 'Kijk naar het plaatje. Schrijf het woord.', doelen: WOORD_DOELEN, rang: 1, basis: true,
  keuzes: [{ id: 'hulp', groep: GROEP, label: 'Hulp bij het woord', type: 'select', standaard: 'geen', opties: [['geen', 'Geen hulp'], ['letter', 'De eerste letter staat erbij'], ['vakjes', 'Een vakje per letter']] }],
  bouw: (r, o) => {
    const p = kies(r, plaatjesVoor(regelBij(o.doel))), hulp = o.hulp || 'geen';
    const svg = plaatjeSvg(p.w, { hulp: hulp === 'vakjes' ? 'vakjes' : 'geen' });
    const tekst = hulp === 'vakjes' ? 'Schrijf het woord in de vakjes.' : hulp === 'letter' ? `Het woord begint met de ${p.w[0]}.\n${LIJN}` : `Het woord is:\n${LIJN}`;
    return oefening({
      tekst, svg, svgBoven: true, antwoord: p.w, volledig: p.w, kern: p.w, sleutel: p.w, moeilijkheid: [p.w.length],
      data: { type: 'sw-plaatje-woord', doel: o.doel, woord: p.w, hulp },
    });
  },
});

/* ------------------------------------------------------------------ 2. zin afmaken bij een plaatje */
const AFMAAK_ZINNEN = ['Dit is een ____.', 'Ik zie een ____.', 'Kijk, een ____!', 'Ik teken een ____.', 'Hier is een ____.'];
const ZIN_DOELEN = ['1.3.GL1.20'];
const zinAfmaken = maakVorm({
  id: 'sw-plaatje-zin', titel: 'Maak de zin af bij het plaatje', pictogram: 'schrijven', opdracht: 'Kijk naar het plaatje. Schrijf het woord in de zin.', doelen: ZIN_DOELEN, rang: 2,
  keuzes: [{ id: 'woordhulp', groep: GROEP, label: 'Woorden bij het afmaken van de zin', type: 'select', standaard: 'geen', opties: [['geen', 'Geen hulp'], ['kiezen', 'Drie woorden om uit te kiezen']] }],
  bouw: (r, o) => {
    const alle = [...plaatjesVoor('mkm'), ...plaatjesVoor('tek')], p = kies(r, alle), zin = kies(r, AFMAAK_ZINNEN), hulp = o.woordhulp || 'geen';
    let tekst = zin;
    if (hulp === 'kiezen') {
      const fout = r.schud(alle.filter(x => x.w !== p.w)).slice(0, 2).map(x => x.w);
      tekst += `\n${r.schud([p.w, ...fout]).join(' '.repeat(5))}`;
    }
    const volledig = zin.replace('____', p.w);
    return oefening({
      tekst, svg: plaatjeSvg(p.w), svgBoven: true, antwoord: p.w, volledig, kern: `${zin}|${p.w}`, sleutel: `${zin}|${p.w}`, moeilijkheid: [p.w.length],
      data: { type: 'sw-plaatje-zin', doel: o.doel, woord: p.w, zin, hulp },
    });
  },
});

/* ------------------------------------------------------------------ 3. woordkaartjes: de zin leggen en schrijven */
const KAARTJES = ZINNEN_ALLE.map(z => z.zin).filter(z => { const n = z.replace(/[.,!?]/g, '').split(' ').length; return n >= 3 && n <= 6 && !/,/.test(z); });
const zinKnippen = maakVorm({
  id: 'sw-knip', titel: 'Knip de woordkaartjes en leg de zin', pictogram: 'schrijven', opdracht: 'Knip de woordkaartjes uit. Leg er een zin mee. Schrijf de zin op de lijn.', doelen: ['1.5.GL1.11'], rang: 1,
  bouw: (r) => {
    const z = kies(r, KAARTJES), teken = z.slice(-1), woorden = z.slice(0, -1).split(' ').map((w, i) => (i === 0 && !heeftNaam(z) ? w.toLowerCase() : w));
    const kaartjes = [...woorden, teken], mix = r.schud(kaartjes);
    if (mix.join(' ') === kaartjes.join(' ')) return null;
    return oefening({
      tekst: LIJN, svg: woordenVakjes(mix), svgBoven: true, antwoord: z, volledig: z, kern: z, sleutel: z, moeilijkheid: [woorden.length],
      data: { type: 'sw-knip', juist: z, kaartjes: mix },
    });
  },
});

/* ------------------------------------------------------------------ 4. zin met een fout herstellen */
const FOUT_DOELEN = ['1.3.GL1.8', '1.3.GL2.39', '1.3.GL1.20', '1.3.GL2.29'];
const SPATIE_DOELEN = ['1.3.GL1.8', '1.3.GL2.39'];
const zinMetFout = maakVorm({
  id: 'sw-fout', titel: 'Herstel de fout in de zin', pictogram: 'schrijven', opdracht: 'Er zit een fout in de zin. Schrijf de zin juist op de lijn.', doelen: FOUT_DOELEN, rang: 2, basis: true,
  bouw: (r, o) => {
    const z = kies(r, ZINNEN_ALLE).zin, woorden = z.slice(0, -1).split(' ');
    let fout, soort;
    if (SPATIE_DOELEN.includes(o.doel)) {
      const plekken = woorden.map((w, i) => i).filter(i => i < woorden.length - 1 && /^\p{L}+$/u.test(woorden[i]) && /^\p{L}+$/u.test(woorden[i + 1]));
      if (!plekken.length) return null;
      const i = kies(r, plekken), w = [...woorden];
      w.splice(i, 2, woorden[i] + woorden[i + 1]);
      fout = w.join(' ') + z.slice(-1); soort = 'spatie';
    } else if (r.volgende() < 0.5) {
      fout = zonderEersteHoofdletter(z); soort = 'hoofdletter';
    } else {
      fout = z.slice(0, -1); soort = 'leesteken';
    }
    if (fout === z) return null;
    return oefening({
      tekst: `${fout}\n${LIJN}`, antwoord: z, volledig: z, kern: z, sleutel: z, moeilijkheid: [soort === 'spatie' ? 1 : 0, woorden.length],
      data: { type: 'sw-fout', doel: o.doel, juist: z, fout, soort },
    });
  },
});

/* ------------------------------------------------------------------ 5. een zin bij een plaatje schrijven */
const SCHRIJF_DOELEN = ['1.3.GL1.26', '1.3.GL2.35'];
const zinBijPlaatje = maakVorm({
  id: 'sw-plaatje-schrijf', titel: 'Schrijf een zin bij het plaatje', pictogram: 'schrijven', opdracht: 'Kijk naar het plaatje. Schrijf een zin. Begin met een hoofdletter en zet een punt op het einde.', doelen: SCHRIJF_DOELEN, rang: 3,
  keuzes: [{ id: 'zinhulp', groep: GROEP, label: 'Hulp bij de zin', type: 'select', standaard: 'woord', opties: [['woord', 'Het woord staat bij het plaatje'], ['geen', 'Enkel het plaatje']] }],
  bouw: (r, o) => {
    const p = kies(r, [...plaatjesVoor('mkm'), ...plaatjesVoor('tek')]), hulp = o.zinhulp || 'woord';
    const voorbeeld = `Ik zie een ${p.w}.`;
    return oefening({
      tekst: `Mijn zin:\n${LIJN}\n${LIJN}`, svg: plaatjeSvg(p.w, { hulp: hulp === 'woord' ? 'woord' : 'geen' }), svgBoven: true, antwoord: voorbeeld,
      volledig: `Bijvoorbeeld: ${voorbeeld} Kijk na: hoofdletter, woorden los van elkaar, punt op het einde.`, kern: p.w, sleutel: p.w, moeilijkheid: [p.w.length],
      data: { type: 'sw-plaatje-schrijf', doel: o.doel, woord: p.w, hulp, open: true },
    });
  },
});

export const SCHRIJVEN_VORMEN = [woordBijPlaatje, zinAfmaken, zinKnippen, zinMetFout, zinBijPlaatje];
export { WOORD_DOELEN, ZIN_DOELEN, FOUT_DOELEN, SCHRIJF_DOELEN };
