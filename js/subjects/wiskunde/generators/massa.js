// Gewicht (massa): omzetten, vergelijken en aflezen op een weegschaal.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { maakOmzetten, maakVergelijken } from './maten.js';
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

export const massaVergelijken = maakVergelijken({
  id: 'massa-vergelijken', titel: 'Gewicht vergelijken', opdracht: 'Vergelijk de gewichten. Schrijf <, > of = op de lijn.',
  maat: 'massa', factor: FACTOR, volgorde: VOLGORDE,
  doelkaart: { '2.3.GL3.33': ['kg', 'hg', 'dag', 'g'], '2.3.GL4.43': ['kg', 'hg', 'dag', 'g'] }, standaard: ['kg', 'g'],
});

export const weegschaalAflezen = {
  id: 'weegschaal-aflezen',
  titel: 'Gewicht aflezen op de weegschaal',
  pictogram: 'meten',
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
