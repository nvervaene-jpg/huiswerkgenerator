// Open opdrachten voor wiskundedoelen waarvoor (nog) geen automatische oefening bestaat.
// Per soort doel drie oefenvormen: uitleggen, een eigen voorbeeld maken en zichzelf beoordelen.
// De doelen per soort staan in ../open-doelen.js (gegenereerd met: node scripts/open-doelen.mjs).
import { maakOpenVormen } from '../../../core/open.js';
import { lijnen, rooster, kader, gezichtjes } from '../../../core/open-svg.js';
import { OPEN_DOELEN } from '../open-doelen.js';

const UITLEG = [
  'Dit leer je: {doel} Schrijf met eigen woorden wat dit betekent.',
  '{doel} Leg uit aan een klasgenoot hoe je dit doet. Schrijf je uitleg op.',
  '{doel} Schrijf drie dingen op die je hierover al weet.',
  '{doel} Waar heb je dit nodig in het dagelijks leven? Schrijf een voorbeeld op.',
  '{doel} Welke wiskundewoorden horen hierbij? Schrijf ze op en leg er één uit.',
  '{doel} Wat vind je makkelijk en wat vind je moeilijk hierbij? Schrijf het op.',
  '{doel} Welke tip zou je aan een jongere leerling geven? Schrijf ze op.',
  '{doel} Welke fout kan je hierbij maken? Schrijf op hoe je die fout vermijdt.',
];
const VOORBEELD = [
  '{doel} Bedenk zelf een oefening hierbij en los ze op.',
  '{doel} Maak een oefening voor een klasgenoot. Schrijf ook de oplossing op.',
  '{doel} Bedenk een makkelijke en een moeilijke oefening. Los ze allebei op.',
  '{doel} Los een oefening op en controleer je antwoord op een tweede manier.',
  '{doel} Verzin een verhaaltje met een vraag erin en los het op.',
  '{doel} Bedenk een oefening die je met het hoofd kan oplossen. Schrijf op hoe je rekende.',
  '{doel} Schrijf een voorbeeld op en omcirkel waar je het doel gebruikt.',
  '{doel} Zoek een voorbeeld dat goed bij dit doel past en leg uit waarom.',
];
const CONTROLE = [
  '{doel} Hoe goed kan je dit al? Omcirkel het gezichtje.',
  '{doel} Hoe zeker ben je? Omcirkel het gezichtje en schrijf op wat je nog wil oefenen.',
  'Kijk terug op wat je geleerd hebt. {doel} Omcirkel het gezichtje dat bij jou past.',
  '{doel} Wat zou je kunnen helpen om dit beter te leren? Omcirkel en schrijf je tip.',
  '{doel} Kan je dit al aan een klasgenoot uitleggen? Omcirkel het gezichtje.',
  '{doel} Wat ging goed en wat kan nog beter? Omcirkel het gezichtje en leg uit.',
];
const ruimteLijnen = (n) => () => lijnen(n);

// Aanvullende prompts per soort doel.
const per = (basis, extra) => [...extra, ...basis].slice(0, 10);
const profiel = (id, { voorbeeld, voorbeeldRuimte = () => rooster(6), uitleg = [], schaalVoorbeeld = 0.67 }) => ({
  id, vormen: [
    { soort: 'uitleg', titel: 'Leg het uit', pictogram: 'schrijven', opdracht: 'Lees het doel. Doe wat er gevraagd wordt.', rang: 1, schaal: 0.67, basis: true, prompts: per(UITLEG, uitleg), ruimte: ruimteLijnen(3) },
    { soort: 'voorbeeld', titel: 'Maak zelf een voorbeeld', pictogram: 'schrijven', opdracht: 'Bedenk zelf een voorbeeld. Werk het uit in het vak.', rang: 2, schaal: schaalVoorbeeld, prompts: per(VOORBEELD, voorbeeld), ruimte: voorbeeldRuimte },
    { soort: 'controle', titel: 'Hoe goed kan ik dit?', pictogram: 'omcirkelen', opdracht: 'Beoordeel jezelf. Omcirkel het gezichtje dat bij jou past.', rang: 3, schaal: 0.5, prompts: CONTROLE, ruimte: () => gezichtjes() },
  ],
});

const PROFIELEN = [
  profiel('getal', { voorbeeld: [] }),
  profiel('meten', {
    voorbeeld: ['{doel} Zoek in de klas iets dat bij dit doel past. Meet of bereken het en schrijf op wat je vond.', '{doel} Bedenk een situatie thuis of op school waar je dit nodig hebt. Werk ze uit.'],
    uitleg: ['{doel} Welke maateenheden of meetinstrumenten horen hierbij? Schrijf ze op en leg uit wanneer je ze gebruikt.'],
  }),
  profiel('meetkunde', {
    voorbeeld: ['{doel} Teken een voorbeeld bij dit doel en schrijf erbij wat je tekende.', '{doel} Zoek een vorm of figuur in de klas die bij dit doel past. Teken hem en benoem hem.'],
    voorbeeldRuimte: () => kader(200), schaalVoorbeeld: 0.5,
    uitleg: ['{doel} Welke meetkundewoorden horen hierbij? Schrijf ze op en leg er één uit met een schets.'],
  }),
  profiel('data', {
    voorbeeld: ['{doel} Verzamel gegevens in de klas. Schrijf ze in een tabel of teken een grafiek.', '{doel} Bedenk een vraag die je met een telling of een grafiek kan beantwoorden. Werk ze uit.'],
    voorbeeldRuimte: () => rooster(8),
  }),
  profiel('problemen', {
    voorbeeld: ['{doel} Bedenk een vraagstuk. Schrijf eerst op wat je weet en wat je zoekt. Los het dan op met een tekening of schema.', '{doel} Verzin een vraagstuk voor een klasgenoot en schrijf de oplossing op.'],
    voorbeeldRuimte: () => rooster(8),
    uitleg: ['{doel} Hoe pak je een vraagstuk aan? Schrijf je stappen op.'],
  }),
  {
    id: 'kleuter', vormen: [
      { soort: 'praten', titel: 'Praat erover', pictogram: 'schrijven', opdracht: 'De juf of meester vertelt het doel. Praat er samen over.', rang: 1, schaal: 0.5, basis: true, prompts: ['{doel} Vertel aan de juf wat je hierover weet. De juf schrijft op wat je zegt.', '{doel} Laat aan een klasgenoot zien hoe je dit doet.', '{doel} Zoek in de klas iets dat hierbij past. Wijs het aan en vertel erover.', '{doel} Vertel aan de juf waar je dit nog ziet.'], ruimte: ruimteLijnen(2) },
      { soort: 'tekenen', titel: 'Teken het', pictogram: 'tekenen', opdracht: 'Teken wat de juf of meester vraagt.', rang: 2, schaal: 0.5, prompts: ['{doel} Teken wat je hierover weet.', '{doel} Teken een voorbeeld en vertel erover aan de juf.', '{doel} Teken iets dat hierbij past.', '{doel} Teken wat je het mooist vond bij dit doel.'], ruimte: () => kader(200) },
      { soort: 'controle', titel: 'Hoe goed kan ik dit?', pictogram: 'omcirkelen', opdracht: 'Wijs of omcirkel het gezichtje dat bij jou past.', rang: 3, schaal: 0.5, prompts: CONTROLE.slice(0, 4), ruimte: () => gezichtjes() },
    ],
  },
];

export const OPEN_VORMEN = maakOpenVormen({ prefix: 'ow', profielen: PROFIELEN, doelenPerProfiel: OPEN_DOELEN });
