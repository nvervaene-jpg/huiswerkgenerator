// Oefenvormen voor meervouden op -en, -s, 's en -eren: hond - honden, tafel - tafels, foto - foto's, kind - kinderen.
// De woorden staan in ../woorden/meervouden.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { SPELLING_PLAATJE_VORMEN } from './spelling-plaatjes.js';
import { WOORDEN } from '../woorden/meervouden.js';

export const DOELEN = ['1.3.GL2.26', '1.3.GL4.17', '1.3.GL6.12', '1.3.GL6.13'];
const uit = (soorten, enkelFrequent) => (w) => soorten.includes(w.soort) && (!enkelFrequent || w.frequent);

const familie = maakWoordVormen({
  prefix: 'mv', doelen: DOELEN, naam: 'meervoud', woorden: WOORDEN,
  niveau: { '1.3.GL2.26': uit(['en', 's', 'eren'], true), '1.3.GL4.17': uit(['s', "'s"]), '1.3.GL6.12': uit(['ën']), '1.3.GL6.13': uit(['afwijkend']) },
  soorten: [
    { id: 'en', label: '-en', keuze: 'Enkel -en (hond - honden)' }, { id: 's', label: '-s', keuze: 'Enkel -s (tafel - tafels)' },
    { id: "'s", label: "'s", keuze: "Enkel 's (foto - foto's)" }, { id: 'ën', label: '-ën', keuze: 'Enkel -ën (zee - zeeën, knie - knieën)' }, { id: 'eren', label: '-eren', keuze: 'Enkel -eren (kind - kinderen)' },
    { id: 'afwijkend', label: 'afwijkend', keuze: 'Enkel afwijkende meervouden (stad - steden)' },
  ],
  meerdere: true, denk: true, zelf: { meervoud: 'meervouden', op: (l) => `op ${l}` }, keuzeGroep: 'meervouden', keuzeLabel: 'Welke uitgang oefenen?', alleLabel: 'Alle uitgangen van de gekozen doelen',
  regelSoorten: ['en', 's', "'s", 'ën', 'eren'], verdeling: 'woord',
  voor: (w) => `één ${w.van}`, na: 'twee', teken: ',', pijl: '→',
  zinnen: [
    'Op de foto zie ik {n} {w}.', 'In de klas liggen {n} {w}.', 'Ik heb {n} {w} getekend.', 'Wij zagen {n} {w}.',
    'Er zijn {n} {w}.', 'In het boek staan {n} {w}.', 'Op school telden we {n} {w}.', 'Juf heeft {n} {w} meegebracht.',
  ],
  getalwoorden: ['drie', 'vier', 'vijf', 'zes', 'zeven'], hint: (w) => `(${w.van})`,
  regelTitel: 'Welke uitgang?', regelOpdracht: "Welke uitgang krijgt het woord in het meervoud? Omcirkel -en, -s, 's, -eren of -ën.",
});

export const woordenVoor = familie.woordenVoor;
export const MEERVOUDEN_VORMEN = [...familie.vormen, SPELLING_PLAATJE_VORMEN.mv];
