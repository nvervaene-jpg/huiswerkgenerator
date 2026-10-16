// Oefenvormen voor leenwoorden, afkortingen en bijzondere tekens (trema, koppelteken, accent, apostrof).
// De woorden staan in ../woorden/speciaal.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { LEENWOORDEN, AFKORTINGEN, TEKENS } from '../woorden/speciaal.js';

const NBSP = ' ';
// [juist, fout, volledig?] -> opgave. De opgave toont 'volledig' als dat er is, anders de fout (zoals je het hoort).
const opgaven = (lijsten) => Object.entries(lijsten).flatMap(([soort, rijen]) => rijen.map(([naar, fout, volledig]) => ({
  van: volledig ?? fout, naar, fout, delen: [naar], lettergrepen: 1, soort, frequent: true,
})));
const zin = (r, w, x) => ({ n: '', tekst: x.replace(/\s*\(.*\)\s*$/, '').trim() });
const basis = (extra) => ({
  verdeling: 'woord', paar: (w, x) => x,
  vraag: (w) => `${w.van}${NBSP.repeat(3)}→${NBSP.repeat(3)}__________________`,
  kiesTekst: (w, o) => `${w.van}${NBSP.repeat(3)}→${NBSP.repeat(3)}${o[0]}${NBSP.repeat(6)}of${NBSP.repeat(6)}${o[1]}`,
  kleurLabel: (w, x) => x, rijtje: (w, x) => x, zin, hint: () => '', zonder: ['zin', 'lettergrepen', 'verbinden'],
  verbeterTekst: 'Dit is fout geschreven. Schrijf het juist:', kiesFoutTekst: 'Eén woord is fout geschreven. Omcirkel het foute woord.', kiesFoutAfsluit: 'Het juiste woord:',
  ...extra,
});
const soortenVan = (labels, keuzes) => Object.keys(labels).map(id => ({ id, label: labels[id], keuze: keuzes[id] }));

/* ---- leenwoorden */
export const LEEN_WOORDEN = opgaven(LEENWOORDEN);
const LEEN_LABELS = { frans: 'Frans', engels: 'Engels', latijn: 'Latijn of Grieks' };
const leen = maakWoordVormen(basis({
  prefix: 'lw', doelen: ['1.3.GL6.16', '1.3.GL6.17', '1.3.GL6.18'], naam: 'woord', woorden: LEEN_WOORDEN,
  niveau: { '1.3.GL6.16': (w) => w.soort === 'frans', '1.3.GL6.17': (w) => w.soort === 'engels', '1.3.GL6.18': (w) => w.soort === 'latijn' },
  soorten: soortenVan(LEEN_LABELS, { frans: 'Enkel Franse woorden', engels: 'Enkel Engelse woorden', latijn: 'Enkel woorden uit het Latijn of Grieks' }),
  keuzeGroep: 'leenwoorden', keuzeLabel: 'Welke leenwoorden oefenen?', alleLabel: 'Alle leenwoorden van de gekozen doelen',
  invulTitel: 'Leenwoord schrijven', invulOpdracht: 'Zo klinkt het woord. Hoe schrijf je het juist? Schrijf het op de lijn.',
  regelTitel: 'Uit welke taal?', regelOpdracht: 'Uit welke taal komt het woord? Omcirkel.',
}));

/* ---- afkortingen */
export const AFKORTING_WOORDEN = opgaven(AFKORTINGEN);
const AF_LABELS = { punten: 'met punten', letterwoord: 'letterwoord' };
const afk = maakWoordVormen(basis({
  prefix: 'af', doelen: ['1.3.GL6.14'], naam: 'afkorting', woorden: AFKORTING_WOORDEN, niveau: { '1.3.GL6.14': () => true },
  soorten: soortenVan(AF_LABELS, { punten: 'Enkel afkortingen met punten (bv., enz.)', letterwoord: 'Enkel letterwoorden zonder punten (tv, vzw)' }),
  keuzeGroep: 'afkortingen', keuzeLabel: 'Welke afkortingen oefenen?', alleLabel: 'Afkortingen en letterwoorden door elkaar',
  invulTitel: 'Afkorting schrijven', invulOpdracht: 'Schrijf de afkorting op de lijn. Let op de punten.',
  regelTitel: 'Met of zonder punten?', regelOpdracht: 'Schrijf je deze afkorting met punten of als letterwoord (zonder punten)? Omcirkel.',
  verbeterTekst: 'Deze afkorting is fout geschreven. Schrijf ze juist:', kiesFoutTekst: 'Eén afkorting is fout geschreven. Omcirkel de foute afkorting.', kiesFoutAfsluit: 'De juiste afkorting:',
}));

/* ---- bijzondere tekens */
export const TEKEN_WOORDEN = opgaven(TEKENS);
const TK_LABELS = { trema: 'trema', koppelteken: 'koppelteken', accent: 'accent', apostrof: 'apostrof' };
const tekens = maakWoordVormen(basis({
  prefix: 'tk', doelen: ['1.3.GL6.15', '1.3.GL5.25'], naam: 'woord', woorden: TEKEN_WOORDEN,
  niveau: { '1.3.GL6.15': (w) => ['trema', 'koppelteken', 'accent'].includes(w.soort), '1.3.GL5.25': (w) => w.soort === 'apostrof' },
  soorten: soortenVan(TK_LABELS, { trema: 'Enkel woorden met een trema (knieën)', koppelteken: 'Enkel woorden met een koppelteken (e-mail)', accent: 'Enkel woorden met een accent (café)', apostrof: "Enkel woorden met een apostrof ('s morgens, zo'n)" }),
  keuzeGroep: 'tekens', keuzeLabel: 'Welke tekens oefenen?', alleLabel: 'Alle tekens van de gekozen doelen',
  invulTitel: 'Woord met teken schrijven', invulOpdracht: 'Schrijf het woord juist op de lijn. Let op het trema, het koppelteken, het accent of de apostrof.',
  regelTitel: 'Welk teken?', regelOpdracht: 'Welk teken hoort er in het woord? Omcirkel.',
}));

export const speciaal = {
  leen: { ...leen, DOELEN: ['1.3.GL6.16', '1.3.GL6.17', '1.3.GL6.18'], labels: LEEN_LABELS },
  afk: { ...afk, DOELEN: ['1.3.GL6.14'], labels: AF_LABELS },
  tekens: { ...tekens, DOELEN: ['1.3.GL6.15', '1.3.GL5.25'], labels: TK_LABELS },
};
export const SPECIAAL_VORMEN = [...leen.vormen, ...afk.vormen, ...tekens.vormen];
