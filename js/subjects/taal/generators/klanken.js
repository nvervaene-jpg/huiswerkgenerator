// Oefenvormen voor woorden met moeilijke klanken: ei/ij, ou/au, ie/oe/eu/ui, aai/ooi/oei, eeuw/ieuw, uw, ng/nk en ch/g/cht/gt.
// Je ziet het woord met een open plaats (tr__n) en kiest welke letters erin horen.
// De woorden staan in ../woorden/klanken.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { KLANKEN, GROEPEN, KEUZE_LABELS } from '../woorden/klanken.js';

const NBSP = ' ';
export const GROEP_VAN = Object.fromEntries(Object.entries(GROEPEN).flatMap(([g, lijst]) => lijst.map(s => [s, g])));

function gatInWoord(woord, soort) {
  const i = woord.lastIndexOf(soort);
  return woord.slice(0, i) + '__' + woord.slice(i + soort.length);
}
export const WOORDEN = Object.entries(KLANKEN).flatMap(([soort, rijen]) => rijen.map(([naar, fout, frequent]) => ({
  van: naar, naar, fout, delen: [naar], lettergrepen: frequent ? 1 : 2, soort, frequent: !!frequent, groep: GROEP_VAN[soort],
  data: { gat: gatInWoord(naar, soort), groep: GROEP_VAN[soort] },
})));

// Welke soorten bij welk Op.stap-doel horen (frequent = enkel de frequente woorden).
const doel = (soorten, frequent = true) => (w) => soorten.includes(w.soort) && (!frequent || w.frequent);
const TWEETEKENS = ['ie', 'oe', 'eu', 'ui', 'ei', 'ij', 'ou', 'au'];
export const NIVEAU = {
  '1.3.GL1.18': doel(TWEETEKENS), '1.3.GL2.11': doel(['ie', 'oe', 'eu', 'ui']), '1.3.GL2.12': doel(['ei', 'ij']), '1.3.GL2.13': doel(['ou', 'au']),
  '1.3.GL4.6': doel(['oe', 'eu', 'ui', 'ei', 'ij', 'au', 'ou'], false),
  '1.3.GL2.14': doel(['aai', 'ooi', 'oei']), '1.3.GL2.15': doel(['eeuw', 'ieuw']), '1.3.GL3.11': doel(['uw']), '1.3.GL4.7': doel(['aai', 'ooi', 'oei', 'eeuw', 'ieuw'], false),
  '1.3.GL2.16': doel(['ng', 'nk']), '1.3.GL4.8': doel(['ng', 'nk'], false),
  '1.3.GL2.17': doel(['ch', 'g', 'cht', 'gt']), '1.3.GL3.9': doel(['ch', 'g', 'cht', 'gt'], false), '1.3.GL4.9': doel(['ch', 'g', 'cht', 'gt'], false),
};
export const DOELEN = Object.keys(NIVEAU);

const familie = maakWoordVormen({
  prefix: 'kl', doelen: DOELEN, naam: 'woord', woorden: WOORDEN, niveau: NIVEAU,
  soorten: Object.keys(KLANKEN).map(s => ({ id: s, label: s, keuze: KEUZE_LABELS[s] })),
  regelSoorten: Object.keys(KLANKEN), regelOpties: (w) => GROEPEN[w.groep],
  keuzeGroep: 'klanken', keuzeLabel: 'Welke letters oefenen?', alleLabel: 'Alle letters van de gekozen doelen', verdeling: 'woord',
  paar: (w, x) => x,
  vraag: (w) => `${w.data.gat}${NBSP.repeat(3)}(${GROEPEN[w.groep].join(' / ')})${NBSP.repeat(3)}→${NBSP.repeat(3)}__________`,
  kiesTekst: (w, o) => `${o[0]}${NBSP.repeat(8)}of${NBSP.repeat(8)}${o[1]}`,
  kleurLabel: (w, x) => x, rijtje: (w, x) => x,
  zin: (r, w, x) => ({ n: '', tekst: x.replace(/\s*\(.*\)\s*$/, '').trim() }), hint: () => '',
  invulTitel: 'Woord aanvullen', invulOpdracht: 'Welke letters horen er in het woord? Schrijf het hele woord op de lijn.',
  regelTitel: 'Welke letters?', regelOpdracht: 'Welke letters horen er in dit woord? Omcirkel.',
  verbeterTekst: 'Dit woord is fout geschreven. Schrijf het juist:', kiesFoutTekst: 'Eén woord is fout geschreven. Omcirkel het foute woord.', kiesFoutAfsluit: 'Het juiste woord:',
  zonder: ['zin', 'lettergrepen', 'verbinden'],
});

export const woordenVoor = familie.woordenVoor;
export const KLANKEN_VORMEN = familie.vormen;
