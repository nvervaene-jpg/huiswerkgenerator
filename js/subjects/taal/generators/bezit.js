// Oefenvormen voor bezit met 's: de fiets van Anna = Anna's fiets, de fiets van Tom = Toms fiets.
// De namen en voorwerpen staan in ../woorden/bezit.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { maakOpgaven } from '../woorden/bezit.js';

export const DOELEN = ['1.3.GL5.24'];
export const WOORDEN = maakOpgaven();
const NBSP = ' ';

const familie = maakWoordVormen({
  prefix: 'bz', doelen: DOELEN, naam: 'woord', woorden: WOORDEN, niveau: { '1.3.GL5.24': () => true },
  soorten: [{ id: 'aps', label: "met 's", keuze: "Enkel namen met 's (Anna's fiets)" }, { id: 'gewoon', label: 'met s', keuze: 'Enkel namen met s (Toms fiets)' }],
  keuzeGroep: 'bezit', keuzeLabel: 'Welke namen oefenen?', alleLabel: "Namen met 's en met s door elkaar", verdeling: 'soort',
  paar: (w, x) => x,
  vraag: (w) => `${w.van}${NBSP.repeat(3)}→${NBSP.repeat(3)}__________________`,
  kiesTekst: (w, o) => `${w.van}${NBSP.repeat(3)}→${NBSP.repeat(3)}${o[0]}${NBSP.repeat(6)}of${NBSP.repeat(6)}${o[1]}`,
  kleurLabel: (w, x) => x, rijtje: (w, x) => x,
  zin: (r, w, x) => ({ n: '', tekst: x.replace(/\s*\(.*\)\s*$/, '').trim() }), hint: () => '',
  invulTitel: 'Bezit schrijven', invulOpdracht: "Schrijf het met 's of met s. Let op de laatste letter van de naam.",
  regelTitel: "'s of s?", regelOpdracht: "Krijgt de naam een apostrof en een s (met 's) of enkel een s (met s)? Omcirkel.",
  verbeterTekst: 'Dit is fout geschreven. Schrijf het juist:', kiesFoutTekst: 'Eén zinnetje is fout geschreven. Omcirkel het foute zinnetje.', kiesFoutAfsluit: 'Het juiste zinnetje:',
  zonder: ['zin', 'lettergrepen', 'verbinden'],
});

export const woordenVoor = familie.woordenVoor;
export const BEZIT_VORMEN = familie.vormen;
