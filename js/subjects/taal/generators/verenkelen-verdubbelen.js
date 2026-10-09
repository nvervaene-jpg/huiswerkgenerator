// Oefenvormen voor 'verenkelen en verdubbelen' (meervouden van woorden met een korte of lange klinker).
//   verdubbelen: man -> mannen   (korte klinker: de medeklinker komt er bij)
//   verenkelen : maan -> manen   (lange klinker: er valt een klinker weg)
// De woorden staan in ../woorden/verenkelen-verdubbelen.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { WOORDEN } from '../woorden/verenkelen-verdubbelen.js';

export const DOELEN = ['1.3.GL2.27', '1.3.GL3.16', '1.3.GL4.18', '1.3.GL4.19'];
const L2 = (w) => w.lettergrepen === 2 && w.frequent, L3 = (w) => w.lettergrepen === 2, L4 = (w) => w.lettergrepen >= 3;

const familie = maakWoordVormen({
  prefix: 'vv', doelen: DOELEN, naam: 'meervoud', woorden: WOORDEN,
  niveau: { '1.3.GL2.27': L2, '1.3.GL3.16': L3, '1.3.GL4.18': L4, '1.3.GL4.19': (w) => L3(w) || L4(w) },
  soorten: [
    { id: 'verdubbelen', label: 'verdubbelen', keuze: 'Enkel verdubbelen (man - mannen)' },
    { id: 'verenkelen', label: 'verenkelen', keuze: 'Enkel verenkelen (maan - manen)' },
  ],
  keuzeGroep: 'verenkelen-verdubbelen', keuzeLabel: 'Welke regel oefenen?', alleLabel: 'Verenkelen en verdubbelen door elkaar',
  verdeling: 'soort',
  voor: (w) => `één ${w.van}`, na: 'twee', teken: ',', pijl: '→',
  zinnen: [
    'Op de foto zie ik {n} {w}.', 'In de klas liggen {n} {w}.', 'Ik heb {n} {w} getekend.', 'Wij zagen {n} {w}.',
    'Er zijn {n} {w}.', 'In het boek staan {n} {w}.', 'Op school telden we {n} {w}.', 'Juf heeft {n} {w} meegebracht.',
  ],
  getalwoorden: ['drie', 'vier', 'vijf', 'zes', 'zeven'], hint: (w) => `(${w.van})`,
  regelTitel: 'Verdubbelen of verenkelen?', regelOpdracht: 'Wat gebeurt er in het meervoud? Omcirkel verdubbelen of verenkelen.',
});

export const woordenVoor = familie.woordenVoor;
export const VERENKELEN_VERDUBBELEN_VORMEN = familie.vormen;
