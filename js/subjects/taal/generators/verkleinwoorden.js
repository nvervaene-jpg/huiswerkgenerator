// Oefenvormen voor verkleinwoorden: boek - boekje, maan - maantje, boom - boompje, man - mannetje, koning - koninkje, auto - autootje.
// De woorden staan in ../woorden/verkleinwoorden.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { WOORDEN } from '../woorden/verkleinwoorden.js';

export const DOELEN = ['1.3.GL2.25', '1.3.GL3.15', '1.3.GL4.16'];
const uit = (soorten, enkelFrequent) => (w) => soorten.includes(w.soort) && (!enkelFrequent || w.frequent);

const familie = maakWoordVormen({
  prefix: 'vk', doelen: DOELEN, naam: 'verkleinwoord', woorden: WOORDEN,
  niveau: { '1.3.GL2.25': uit(['je', 'tje', 'pje'], true), '1.3.GL3.15': uit(['etje', 'kje']), '1.3.GL4.16': uit(['aatje', 'ootje', 'uutje']) },
  soorten: [
    { id: 'je', label: '-je', keuze: 'Enkel -je (boek - boekje)' }, { id: 'tje', label: '-tje', keuze: 'Enkel -tje (maan - maantje)' },
    { id: 'pje', label: '-pje', keuze: 'Enkel -pje (boom - boompje)' }, { id: 'etje', label: '-etje', keuze: 'Enkel -etje (man - mannetje)' },
    { id: 'kje', label: '-kje', keuze: 'Enkel -kje (koning - koninkje)' }, { id: 'aatje', label: '-aatje', keuze: 'Enkel -aatje (sofa - sofaatje)' },
    { id: 'ootje', label: '-ootje', keuze: 'Enkel -ootje (auto - autootje)' }, { id: 'uutje', label: '-uutje', keuze: 'Enkel -uutje (menu - menuutje)' },
  ],
  keuzeGroep: 'verkleinwoorden', keuzeLabel: 'Welke uitgang oefenen?', alleLabel: 'Alle uitgangen van de gekozen doelen',
  verdeling: 'soort',
  voor: (w) => `een klein ${w.van}`, na: 'een', teken: ' =', pijl: '=',
  zinnen: ['Ik wil graag een {w}.', 'Op tafel ligt een {w}.', 'Zij heeft een {w} gekregen.', 'Daar staat een {w}.', 'Hij zoekt een {w}.', 'In de kast zit een {w}.'],
  hint: (w) => `(klein ${w.van})`,
  regelTitel: 'Welke uitgang?', regelOpdracht: 'Welke uitgang krijgt het woord? Omcirkel -je, -tje, -pje, ...',
});

export const woordenVoor = familie.woordenVoor;
export const VERKLEINWOORDEN_VORMEN = familie.vormen;
