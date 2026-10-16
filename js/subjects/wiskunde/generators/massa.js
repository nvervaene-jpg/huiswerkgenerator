// Gewicht (massa): omzetten, vergelijken en aflezen op een weegschaal.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { maakOmzetten, maakVergelijken } from './maten.js';
import { maatVormen } from './maat-vormen.js';
import { REFERENTIE_MASSA } from '../contexten.js';
import { weegschaal } from '../svg.js';

export const FACTOR = { g: 1, dag: 10, hg: 100, kg: 1000 };
export const VOLGORDE = ['kg', 'hg', 'dag', 'g'];
const OMZETTEN_DOELEN = {
  '2.3.GL3.33': ['kg', 'hg', 'dag', 'g'], '2.3.GL4.43': ['kg', 'hg', 'dag', 'g'],
  '2.3.GL3.39': ['kg', 'g'], '2.3.GL4.49': ['kg', 'g'],
};

export const massaOmzetten = maakOmzetten({
  id: 'massa-omzetten', titel: 'Gewicht omzetten', opdracht: 'Reken de gewichten om. Schrijf het antwoord op de lijn.',
  maat: 'massa', factor: FACTOR, volgorde: VOLGORDE, doelkaart: OMZETTEN_DOELEN, standaard: ['kg', 'g'],
});

const VERGELIJK_DOELEN = { '2.3.GL3.33': ['kg', 'hg', 'dag', 'g'], '2.3.GL4.43': ['kg', 'hg', 'dag', 'g'] };
export const massaVergelijken = maakVergelijken({
  id: 'massa-vergelijken', titel: 'Gewicht vergelijken', opdracht: 'Vergelijk de gewichten. Schrijf <, > of = op de lijn.',
  maat: 'massa', factor: FACTOR, volgorde: VOLGORDE, doelkaart: VERGELIJK_DOELEN, standaard: ['kg', 'g'],
});

const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
export const MASSA_VORMEN = maatVormen({
  prefix: 'massa', maat: 'massa', factor: FACTOR, volgorde: VOLGORDE, standaard: ['kg', 'g'], meervoud: 'gewichten',
  kaarten: { omzet: OMZETTEN_DOELEN, vergelijk: VERGELIJK_DOELEN, ref: { '2.3.GL3.34': ['kg', 'g'], '2.3.GL4.44': ['kg', 'g'] } },
  ctx: { sleutel: 'g', eenheid: 'g', zin: (o, v, e) => `${hoofd(o.onderwerp)} weegt ${v} ${e}.`, superlatief: () => 'Wat is het zwaarst?', zelfdeSoort: () => true },
  referentie: REFERENTIE_MASSA,
  refZin: (i) => `${hoofd(i.onderwerp)} weegt ongeveer ${i.getal} ____.`,
});

export const weegschaalAflezen = {
  id: 'weegschaal-aflezen',
  titel: 'Gewicht aflezen op de weegschaal',
  pictogram: 'meten', rang: 2, basis: true,
  opdracht: 'Hoeveel weegt het? Lees af op de weegschaal en schrijf het antwoord op de lijn.',
  doelen: ['2.3.GL1.25', '2.3.GL2.28', '2.3.GL3.37'],
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const fijn = gebied >= 1000 && r.volgende() < 0.5;                 // kg en g (op 100 g nauwkeurig) vanaf getallengebied 1 000
      if (!fijn) {
        const kg = r.geheel(1, 10);
        return { tekst: 'De weegschaal wijst ____ kg aan.', svg: weegschaal({ waarde: kg, max: 10 }),
          antwoord: `${kg} kg`, volledig: `De weegschaal wijst ${kg} kg aan.`, getallen: [kg, 10], sleutel: `${kg}`,
          moeilijkheid: [0, kg], data: { type: 'weegschaal', kg, g: 0, max: 10 } };
      }
      const kg = r.geheel(0, 4), g = r.geheel(1, 9) * 100;
      return { tekst: 'De weegschaal wijst ____ kg en ____ g aan.', svg: weegschaal({ waarde: kg + g / 1000, max: 5 }),
        antwoord: `${kg} kg ${g} g`, volledig: `De weegschaal wijst ${kg} kg en ${g} g aan.`, getallen: [kg, g, 5], sleutel: `${kg}.${g}`,
        moeilijkheid: [1, kg * 1000 + g], data: { type: 'weegschaal', kg, g, max: 5 } };
    });
    return resultaat(lijst, aantal);
  },
};

export const weegschaalTekenen = {
  id: 'weegschaal-tekenen',
  titel: 'Wijzer tekenen op de weegschaal',
  pictogram: 'tekenen', rang: 6, schaal: 0.5, basis: false,
  opdracht: 'Teken de wijzer op de weegschaal. De wijzer begint in het midden.',
  doelen: ['2.3.GL1.25', '2.3.GL2.28', '2.3.GL3.37'],
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const fijn = gebied >= 1000 && r.volgende() < 0.5;
      const kg = fijn ? r.geheel(0, 4) : r.geheel(1, 10), g = fijn ? r.geheel(1, 9) * 100 : 0, max = fijn ? 5 : 10;
      const tekst = fijn ? `Teken de wijzer bij ${kg} kg en ${g} g.` : `Teken de wijzer bij ${kg} kg.`;
      return { tekst, svg: weegschaal({ waarde: null, max }), antwoordSvg: weegschaal({ waarde: kg + g / 1000, max }), antwoord: g ? `${kg} kg ${g} g` : `${kg} kg`,
        volledig: tekst, getallen: [kg, g, max], sleutel: `${kg}.${g}`, moeilijkheid: [fijn ? 1 : 0, kg * 1000 + g], data: { type: 'weegschaal-teken', kg, g, max } };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ extra vormen bij de weegschaal: kiezen, juist of fout, fout zoeken */
const WEEG_DOELEN = ['2.3.GL1.25', '2.3.GL2.28', '2.3.GL3.37'];
const NBSP = ' ';
const fmt = (w) => (w.g ? `${w.kg} kg ${w.g} g` : `${w.kg} kg`);
// Een weegresultaat: hele kg (max 10) of, vanaf getallengebied 1 000, kg en g (op 100 g nauwkeurig, max 5 kg).
function weeg(r, gebied) {
  const fijn = gebied >= 1000 && r.volgende() < 0.5;
  return fijn ? { kg: r.geheel(0, 4), g: r.geheel(1, 9) * 100, max: 5, fijn } : { kg: r.geheel(1, 10), g: 0, max: 10, fijn };
}
const eenheden100 = (w) => w.kg * 10 + w.g / 100;                                      // in stappen van 100 g (fijn) of 1 kg (grof)
// Een ander (fout) resultaat dat 1 of 2 streepjes ernaast zit.
function ernaast(r, w) {
  const stap = w.fijn ? 1 : 1, waarde = w.fijn ? w.kg * 10 + w.g / 100 : w.kg, max = w.fijn ? 50 : 10;
  const opties = [-2, -1, 1, 2].map(d => waarde + d * stap).filter(x => x >= (w.fijn ? 1 : 1) && x <= max);
  const x = opties[r.geheel(0, opties.length - 1)];
  return w.fijn ? { kg: Math.floor(x / 10), g: (x % 10) * 100, max: w.max, fijn: true } : { kg: x, g: 0, max: w.max, fijn: false };
}
const weegVorm = ({ id, titel, pictogram = 'omcirkelen', opdracht, rang, schaal = 1, bouw }) => ({
  id, titel, pictogram, opdracht, rang, schaal, basis: false, doelen: WEEG_DOELEN,
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    return resultaat(trek(rng, aantal, (r) => bouw(r, gebied)), aantal);
  },
});

export const weegschaalKies = weegVorm({
  id: 'weegschaal-kies', titel: 'Weegschaal: kies het juiste gewicht', rang: 3,
  opdracht: 'Hoeveel weegt het? Kijk naar de weegschaal en omcirkel de letter.',
  bouw(r, gebied) {
    const w = weeg(r, gebied), fouten = [];
    for (let t = 0; t < 12 && fouten.length < 2; t++) { const f = ernaast(r, w); if (fmt(f) !== fmt(w) && !fouten.some(x => fmt(x) === fmt(f))) fouten.push(f); }
    if (fouten.length < 2) return null;
    const lijst = [w, ...fouten].sort((x, y) => eenheden100(x) - eenheden100(y)), juist = lijst.findIndex(x => fmt(x) === fmt(w)), letters = ['a', 'b', 'c'];
    return {
      tekst: `${lijst.map((x, i) => `${letters[i]})${NBSP}${fmt(x)}`).join(NBSP.repeat(6))}`, svg: weegschaal({ waarde: w.kg + w.g / 1000, max: w.max }), breed: true,
      antwoord: `${letters[juist]}) ${fmt(w)}`, volledig: `De weegschaal wijst ${fmt(w)} aan.`, getallen: [w.kg, w.g, w.max], sleutel: `${w.kg}.${w.g}`, moeilijkheid: [w.fijn ? 1 : 0, w.kg * 1000 + w.g],
      data: { type: 'weegschaal-kies', kg: w.kg, g: w.g, max: w.max, opties: lijst.map(fmt), juist },
    };
  },
});

export const weegschaalJuistFout = weegVorm({
  id: 'weegschaal-juist-fout', titel: 'Weegschaal: juist of fout', rang: 3,
  opdracht: 'Wijst de weegschaal dit aan? Omcirkel juist of fout.',
  bouw(r, gebied) {
    const w = weeg(r, gebied), juist = r.volgende() < 0.5, getoond = juist ? w : ernaast(r, w);
    return {
      tekst: `De weegschaal wijst ${fmt(getoond)} aan.${NBSP.repeat(6)}juist${NBSP.repeat(4)}fout`, svg: weegschaal({ waarde: w.kg + w.g / 1000, max: w.max }), breed: true,
      antwoord: juist ? 'juist' : 'fout', volledig: `De weegschaal wijst ${fmt(w)} aan: ${juist ? 'juist' : `${fmt(getoond)} is fout`}.`, getallen: [w.kg, w.g, w.max],
      sleutel: `${w.kg}.${w.g}|${juist}`, moeilijkheid: [w.fijn ? 1 : 0, juist ? 0 : 1],
      data: { type: 'weegschaal-juistfout', kg: w.kg, g: w.g, max: w.max, getoond: fmt(getoond), juist },
    };
  },
});

export const weegschaalFout = weegVorm({
  id: 'weegschaal-fout', titel: 'Weegschaal: fout aflezen verbeteren', rang: 7, schaal: 0.67,
  opdracht: 'Er is verkeerd afgelezen. Schrijf het juiste gewicht op de lijn.',
  bouw(r, gebied) {
    const w = weeg(r, gebied), f = ernaast(r, w);
    if (fmt(f) === fmt(w)) return null;
    return {
      tekst: `${['Mila', 'Jonas', 'Sara', 'Bram'][r.geheel(0, 3)]} leest ${fmt(f)} af. Dat is fout.\nHet juiste gewicht: ____${w.g ? '' : ' kg'}`, svg: weegschaal({ waarde: w.kg + w.g / 1000, max: w.max }), breed: true,
      antwoord: fmt(w), volledig: `Juist is ${fmt(w)}, niet ${fmt(f)}.`, getallen: [w.kg, w.g, w.max], sleutel: `${w.kg}.${w.g}|${f.kg}.${f.g}`, moeilijkheid: [w.fijn ? 1 : 0, 1],
      data: { type: 'weegschaal-fout', kg: w.kg, g: w.g, max: w.max, getoond: fmt(f) },
    };
  },
});
