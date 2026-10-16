// Oefenvormen voor hoofdletters. Twee families:
//   hl-  losse woorden en namen (gent / Gent, hond / hond, tweede wereldoorlog / Tweede Wereldoorlog)
//   hz-  hele zinnen (wij gaan op reis naar gent. / Wij gaan op reis naar Gent.)
// De woorden staan in ../woorden/hoofdletters.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { SOORTEN, LABELS, KEUZE_LABELS, ZINNEN } from '../woorden/hoofdletters.js';

export const DOELEN = ['1.3.GL2.10', '1.3.GL3.7', '1.3.GL4.5', '1.3.GL5.6', '1.3.GL6.6'];
const NBSP = ' ';
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 11);
const kiesUit = (lijst, sleutel) => lijst[hash(sleutel) % lijst.length];
const hoofdletter = (t) => t[0].toUpperCase() + t.slice(1);
const alleWoorden = (t) => t.split(' ').map(w => w.split('-').map(hoofdletter).join('-')).join(' ');

// De fout die een leerling maakt: een hoofdletter vergeten, of er teveel gebruiken.
function foutWoord(naar, soort) {
  if (soort === 'geen') return hoofdletter(naar);
  const klein = naar.toLowerCase(), kandidaten = [klein];
  if (soort === 'titel' || soort === 'gebeurtenis') kandidaten.push(hoofdletter(klein), alleWoorden(klein));
  return kiesUit([...new Set(kandidaten)].filter(x => x !== naar), naar);
}

// Opgaven met losse woorden.
function maakWoorden() {
  const uit = [];
  for (const [soort, rijen] of Object.entries(SOORTEN)) {
    for (const [naar, frequent, soortje] of rijen) {
      const kind = soort === 'geen' ? soortje || 'zaak' : soort;
      const van = naar.toLowerCase();
      uit.push({
        van, naar, delen: [naar], lettergrepen: frequent ? 1 : 2, soort, frequent: !!frequent, fout: foutWoord(naar, soort), kind,
        data: { kind },
      });
    }
  }
  return uit;
}
export const WOORDEN = maakWoorden();

// Opgaven met zinnen: elk woord krijgt een zin (die vast ligt per woord).
function maakZinnen() {
  return WOORDEN.map((w) => {
    const sjablonen = ZINNEN[w.kind] || ZINNEN[w.soort];
    const sjabloon = kiesUit(sjablonen, w.naar + 'zin');
    const juist = sjabloon.replace('{w}', w.naar), start = hoofdletter(juist);
    const naar = juist, fout1 = juist[0].toLowerCase() + juist.slice(1), fout2 = sjabloon.replace('{w}', w.fout);
    const fout = kiesUit([...new Set([fout1, fout2])].filter(x => x !== naar), w.naar + 'fout');
    return {
      van: naar.toLowerCase(), naar, fout, delen: [naar], lettergrepen: w.lettergrepen, soort: w.soort, frequent: w.frequent, kern: w.van,
      kind: w.kind, focus: w.naar, data: { kind: w.kind, focus: w.naar, focusFout: w.fout },
    };
  });
}
export const ZINNEN_OPGAVEN = maakZinnen();

const metSoort = (...soorten) => (w) => soorten.includes(w.soort);
const NIVEAU = {
  '1.3.GL2.10': (w) => ['naam', 'plaats', 'geen'].includes(w.soort) && w.frequent && !['dag', 'maand'].includes(w.kind),
  '1.3.GL3.7': (w) => ['plaats', 'feestdag', 'geen'].includes(w.soort),
  '1.3.GL4.5': (w) => ['titel', 'taal'].includes(w.soort) || (w.soort === 'geen' && w.kind === 'zaak'),
  '1.3.GL5.6': (w) => ['inwoner', 'gebeurtenis'].includes(w.soort) || (w.soort === 'geen' && w.kind === 'zaak'),
  '1.3.GL6.6': (w) => ['bedrijf', 'gebouw', 'merk'].includes(w.soort) || (w.soort === 'geen' && w.kind === 'zaak'),
};
const SOORT_LIJST = Object.keys(LABELS).map(id => ({ id, label: LABELS[id], keuze: KEUZE_LABELS[id] }));

const woorden = maakWoordVormen({
  prefix: 'hl', doelen: DOELEN, naam: 'woord', woorden: WOORDEN, niveau: NIVEAU, soorten: SOORT_LIJST,
  keuzeGroep: 'hoofdletters', keuzeLabel: 'Welke woorden oefenen?', alleLabel: 'Alle woorden van de gekozen doelen', verdeling: 'woord',
  paar: (w, x) => x,
  vraag: (w) => `${w.van}${NBSP.repeat(3)}→${NBSP.repeat(3)}__________________`,
  kiesTekst: (w, o) => `${o[0]}${NBSP.repeat(8)}of${NBSP.repeat(8)}${o[1]}`,
  zin: (r, w, x) => ({ n: '', tekst: kiesUit(ZINNEN[w.kind] || ZINNEN[w.soort], w.van + r.geheel(0, 99)).replace('{w}', x.includes('__________') ? x : x.replace(/ \([^)]*\)$/, '')) }),
  hint: (w) => `(${w.van})`,
  invulTitel: 'Woord juist schrijven', invulOpdracht: 'Schrijf het woord juist op de lijn. Let op de hoofdletters.',
  zinOpdracht: 'Schrijf het woord tussen haakjes juist op de lijn. Let op de hoofdletters.',
  verbindOpdracht: 'Verbind elk woord met de juiste schrijfwijze. Trek een lijn.',
  regelTitel: 'Welke soort woord?', regelOpdracht: 'Welke soort woord is dit? Omcirkel. Een eigennaam krijgt een hoofdletter, een gewoon woord niet.',
  verbeterTekst: 'Eén woord in de zin is fout geschreven. Schrijf dat woord juist:',
  kiesFoutTekst: 'Eén woord is fout geschreven. Omcirkel het foute rijtje.', kiesFoutAfsluit: 'Het juiste woord:',
  zonder: ['lettergrepen'],
});

const zinnen = maakWoordVormen({
  prefix: 'hz', doelen: DOELEN, naam: 'zin', woorden: ZINNEN_OPGAVEN, niveau: NIVEAU, soorten: SOORT_LIJST,
  keuzeGroep: 'hoofdletters-zinnen', keuzeLabel: 'Welke woorden oefenen?', alleLabel: 'Alle woorden van de gekozen doelen', verdeling: 'woord',
  paar: (w, x) => x,
  vraag: (w) => `${w.van}\n______________________________________________`,
  kiesTekst: (w, o) => `a) ${o[0]}\nb) ${o[1]}`,
  rijtje: (w, x) => x,
  zin: (r, w, x) => ({ n: '', tekst: x.replace(/\s*\(.*\)\s*$/, '') }),
  hint: () => '',
  invulTitel: 'Zin juist schrijven', invulOpdracht: 'Schrijf de zin juist over. Let op de hoofdletters.',
  verbeterTekst: 'Er staat een fout in de hoofdletters. Schrijf de zin juist op:',
  kiesFoutTekst: 'In één zin staat een fout in de hoofdletters. Omcirkel de foute zin.', kiesFoutAfsluit: 'De juiste zin:',
  zonder: ['zin', 'lettergrepen', 'regel', 'verbinden', 'kleuren'],
});

export const woordenVoor = woorden.woordenVoor;
export const woordenVoorZinnen = zinnen.woordenVoor;
export const HOOFDLETTERS_VORMEN = [...woorden.vormen, ...zinnen.vormen];
export const HOOFDLETTERS_FAMILIES = { woorden, zinnen };
