// Oefenvormen voor samenstellingen: zand + bak = zandbak, boek + kast = boekkast.
// De woorden staan in ../woorden/samenstellingen.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { SAMENSTELLINGEN, foutSamenstelling } from '../woorden/samenstellingen.js';

export const DOELEN = ['1.3.GL2.24', '1.3.GL3.14', '1.3.GL4.35'];
export const WOORDEN = Object.entries(SAMENSTELLINGEN).flatMap(([soort, rijen]) => rijen.map(([a, b, frequent]) => {
  const w = { van: `${a} + ${b}`, naar: a + b, delen: [a, b], lettergrepen: frequent ? 1 : 2, soort, frequent: !!frequent };
  return { ...w, fout: foutSamenstelling(w) };
}));

const familie = maakWoordVormen({
  prefix: 'sm', doelen: DOELEN, naam: 'woord', woorden: WOORDEN,
  niveau: { '1.3.GL2.24': (w) => w.soort === 'gewoon' && w.frequent, '1.3.GL3.14': (w) => w.soort === 'dubbel', '1.3.GL4.35': () => true },
  soorten: [{ id: 'gewoon', label: 'gewoon', keuze: 'Enkel gewone samenstellingen (zandbak)' }, { id: 'dubbel', label: 'dubbele letter', keuze: 'Enkel samenstellingen met twee dezelfde letters (boekkast)' }],
  keuzeGroep: 'samenstellingen', keuzeLabel: 'Welke samenstellingen oefenen?', alleLabel: 'Alle samenstellingen van de gekozen doelen', verdeling: 'woord',
  paar: (w, x) => x,
  vraag: (w) => `${w.van}${' '.repeat(3)}→${' '.repeat(3)}__________________`,
  kiesTekst: (w, o) => `${o[0]}${' '.repeat(8)}of${' '.repeat(8)}${o[1]}`,
  kleurLabel: (w, x) => x, rijtje: (w, x) => x,
  zin: (r, w, x) => ({ n: '', tekst: x.replace(/\s*\(.*\)\s*$/, '').trim() }), hint: () => '',
  invulTitel: 'Samenstelling schrijven', invulOpdracht: 'Schrijf de twee woorden als één woord op de lijn.',
  verbeterTekst: 'Dit woord is fout geschreven. Schrijf het juist:', kiesFoutTekst: 'Eén woord is fout geschreven. Omcirkel het foute woord.', kiesFoutAfsluit: 'Het juiste woord:',
  zonder: ['zin', 'lettergrepen', 'verbinden', 'regel'],
});

export const woordenVoor = familie.woordenVoor;
export const SAMENSTELLINGEN_VORMEN = familie.vormen;
