// Open opdrachten voor taaldoelen waarvoor (nog) geen automatische oefening bestaat: lezen, schrijven, mondeling taalgebruik,
// literatuur en taalsysteem. Per soort doel drie oefenvormen. De doelen per soort staan in ../open-doelen.js
// (gegenereerd met: node scripts/open-doelen.mjs).
import { maakOpenVormen, doelZin } from '../../../core/open.js';
import { lijnen, kader, gezichtjes, schrijfregels } from '../../../core/open-svg.js';
import { OPEN_DOELEN } from '../open-doelen.js';
import { LEESTEKSTEN, SCHRIJFZINNEN } from '../woorden/leesteksten.js';

const NBSP = ' ';
const CONTROLE = [
  '{doel} Hoe goed kan je dit al? Omcirkel het gezichtje.',
  '{doel} Hoe zeker ben je? Omcirkel het gezichtje en schrijf op wat je nog wil oefenen.',
  'Kijk terug op je werk. {doel} Omcirkel het gezichtje dat bij jou past.',
  '{doel} Wat zou je kunnen helpen om dit beter te doen? Omcirkel en schrijf je tip.',
  '{doel} Kan je dit al aan een klasgenoot uitleggen? Omcirkel het gezichtje.',
  '{doel} Wat ging goed en wat kan nog beter? Omcirkel het gezichtje en leg uit.',
];
const controleVorm = { soort: 'controle', titel: 'Hoe goed kan ik dit?', pictogram: 'omcirkelen', opdracht: 'Beoordeel jezelf. Omcirkel het gezichtje dat bij jou past.', rang: 9, schaal: 0.5, prompts: CONTROLE, ruimte: () => gezichtjes() };
const gewoon = (soort, titel, pictogram, opdracht, rang, prompts, ruimte, schaal = 0.67, basis = false) => ({ soort, titel, pictogram, opdracht, rang, schaal, basis, prompts, ruimte });

/* ---- lezen: echte leesteksten per leerjaar, met vragen */
const leerjaarVan = (code) => { const m = /GL(\d)/.exec(code); return m ? `L${m[1]}` : 'L3'; };
const tekstenVoor = (code) => {
  const j = +leerjaarVan(code).slice(1), eigen = LEESTEKSTEN[`L${j}`] || [], naast = [LEESTEKSTEN[`L${j - 1}`], LEESTEKSTEN[`L${j + 1}`]].flat().filter(Boolean);
  return [...eigen.map(t => ({ ...t, rang: 0 })), ...naast.map(t => ({ ...t, rang: 1 }))];
};
const leesVorm = (soort, titel, opdracht, rang, maakVraag, schaal = 0.34, basis = false) => ({
  soort, titel, pictogram: 'schrijven', opdracht, rang, schaal, basis,
  aantal: (ctx) => tekstenVoor(ctx.doel).length,
  bouw: (r, ctx, i) => {
    const pool = tekstenVoor(ctx.doel), t = pool[i], z = doelZin(ctx.doel);
    const { tekst, svg, antwoord } = maakVraag(r, t);
    return {
      tekst, svg, breed: true, antwoord, volledig: `${t.titel}: ${antwoord}`, getallen: [], moeilijkheid: [t.rang, t.tekst.length],
      kern: `${ctx.vorm}|${t.titel}`, familie: `${ctx.vorm}|${t.titel}`, sleutel: t.titel, data: { type: 'open-lezen', doel: ctx.doel, titel: t.titel, doelTekst: z.tekst },
    };
  },
});
const woorden = (t) => t.split(/\s+/).filter(Boolean).length;
const LEZEN = [
  leesVorm('tekst', 'Lees en beantwoord', 'Lees de tekst. Schrijf het antwoord op de lijn.', 1, (r, t) => ({
    tekst: `${t.titel}\n${t.tekst}\n${t.vragen.map((v, i) => `${i + 1}. ${v.vraag}\n    ________________________________`).join('\n')}`, svg: null,
    antwoord: t.vragen.map(v => v.juist).join('; '),
  }), 0.34, true),
  leesVorm('kiezen', 'Lees en kies', 'Lees de tekst. Omcirkel het juiste antwoord.', 2, (r, t) => {
    const vragen = t.vragen.map(v => ({ vraag: v.vraag, opties: r.schud([v.juist, ...v.fout]), juist: v.juist }));
    return { tekst: `${t.titel}\n${t.tekst}\n${vragen.map((v, i) => `${i + 1}. ${v.vraag}\n    ${v.opties.join(NBSP.repeat(5))}`).join('\n')}`, svg: null, antwoord: vragen.map(v => v.juist).join('; ') };
  }),
  leesVorm('tempo', 'Lees vlot', 'Lees de tekst hardop of in je hoofd. Let op de tijd en vul in.', 3, (r, t) => ({
    tekst: `${t.titel} (${woorden(t.tekst)} woorden)\n${t.tekst}\nIk las de tekst in ____ minuten en ____ seconden.\nIk las ____ woorden in één minuut.`, svg: null,
    antwoord: `De tekst telt ${woorden(t.tekst)} woorden. De leerkracht beoordeelt de leestijd.`,
  }), 0.34),
];

/* ---- handschrift: voorbeeldzin overschrijven op schrijflijnen */
const SCHRIJF = [
  { soort: 'zin', titel: 'Schrijf de zin over', pictogram: 'schrijven', opdracht: 'Schrijf de zin over op de lijnen. Let op de vorm en de grootte van de letters.', rang: 1, schaal: 0.5, basis: true,
    aantal: () => SCHRIJFZINNEN.length,
    bouw: (r, ctx, i) => { const z = SCHRIJFZINNEN[i]; return { tekst: `Schrijf over:`, svg: schrijfregels(z, 2), breed: true, antwoord: z, volledig: `${z} (de leerkracht beoordeelt het handschrift)`, getallen: [], moeilijkheid: [z.length], kern: `${ctx.vorm}|${i}`, familie: `${ctx.vorm}|${i}`, sleutel: String(i), data: { type: 'open-schrijf', doel: ctx.doel, zin: z } }; } },
  { soort: 'woord', titel: 'Schrijf mooi', pictogram: 'schrijven', opdracht: 'Schrijf elk woord drie keer. Ga heel netjes te werk.', rang: 2, schaal: 0.5,
    aantal: () => SCHRIJFZINNEN.length,
    bouw: (r, ctx, i) => { const woordenLijst = SCHRIJFZINNEN[i].replace(/[.,]/g, '').split(' ').filter(w => w.length > 4).slice(0, 3), m = woordenLijst.join('  '); return { tekst: 'Schrijf elk woord drie keer:', svg: schrijfregels(m, 2), breed: true, antwoord: m, volledig: `${m} (de leerkracht beoordeelt het handschrift)`, getallen: [], moeilijkheid: [m.length], kern: `${ctx.vorm}|${i}`, familie: `${ctx.vorm}|${i}`, sleutel: String(i), data: { type: 'open-schrijf', doel: ctx.doel, woorden: woordenLijst } }; } },
  gewoon('tips', 'Hoe schrijf ik?', 'omcirkelen', 'Kijk naar je handschrift. Beoordeel jezelf.', 3, [
    '{doel} Kijk naar je schrift. Zijn je letters even groot? Omcirkel het gezichtje.', '{doel} Zit je goed en ligt je blad goed? Omcirkel het gezichtje.', '{doel} Hou je je pen goed vast? Omcirkel het gezichtje.', '{doel} Schrijf je netjes tussen de lijnen? Omcirkel het gezichtje.'], () => gezichtjes(), 0.5),
];

/* ---- de overige soorten: uitleggen/schrijven, een eigen voorbeeld en zelfbeoordeling */
const SCHRIJVEN = [
  gewoon('plannen', 'Plan je tekst', 'schrijven', 'Lees het doel. Schrijf op wat je gaat doen.', 1, [
    '{doel} Schrijf in kernwoorden wat je wil schrijven. Maak er een woordspin van.', '{doel} Voor wie schrijf je? Wat wil je zeggen? Schrijf je plan op.', '{doel} Bedenk een begin, een midden en een slot. Schrijf ze in kernwoorden op.', '{doel} Schrijf drie ideeën op en schrap het minst goede.', '{doel} Welke woorden heb je nodig? Maak een lijstje.'], () => lijnen(4), 0.5, true),
  gewoon('schrijven', 'Schrijf zelf', 'schrijven', 'Schrijf een tekstje. Zet er een titel boven.', 2, [
    '{doel} Schrijf een kort tekstje (vijf zinnen) over iets wat je deze week meemaakte.', '{doel} Schrijf een brief of kaartje aan iemand die je graag ziet.', '{doel} Schrijf een kort verhaaltje met een begin, een midden en een slot.', '{doel} Schrijf op wat je vandaag geleerd hebt.', '{doel} Schrijf een uitnodiging voor een feestje.', '{doel} Beschrijf je lievelingsplek in een tekstje.'], () => lijnen(7), 0.34),
  gewoon('nalezen', 'Lees en verbeter', 'omcirkelen', 'Lees je tekst na en beoordeel jezelf.', 3, [
    '{doel} Lees je tekst na. Is alles goed? Omcirkel het gezichtje.', '{doel} Heb je op alles gelet wat bij dit doel hoort? Omcirkel het gezichtje en leg uit.', '{doel} Wat zou je de volgende keer anders doen? Omcirkel en schrijf het op.', '{doel} Laat een klasgenoot je tekst lezen. Wat vond die ervan? Schrijf het op.'], () => gezichtjes(), 0.5),
];
const MONDELING = [
  gewoon('voorbereiden', 'Bereid voor', 'schrijven', 'Bereid je voor. Schrijf kernwoorden op.', 1, [
    '{doel} Schrijf op waarover je wil vertellen. Gebruik kernwoorden.', '{doel} Schrijf drie vragen op die je aan een klasgenoot wil stellen.', '{doel} Schrijf de kernwoorden op die je wil gebruiken bij je beurt.', '{doel} Bedenk wat je wil zeggen: een begin, een midden en een slot.', '{doel} Schrijf op waar je op moet letten als je luistert.'], () => lijnen(3), 0.5, true),
  gewoon('oefenen', 'Doe het samen', 'tekenen', 'Doe de opdracht samen met een klasgenoot of met de juf. Teken of noteer erna.', 2, [
    '{doel} Doe de opdracht samen met een klasgenoot. Teken of noteer wat je onthouden hebt.', '{doel} Vertel aan een klasgenoot en laat die vertellen wat hij of zij begrepen heeft. Noteer het.', '{doel} Luister naar de juf of een klasgenoot en teken wat je hoorde.', '{doel} Speel een korte scène met een klasgenoot. Teken erna wat er gebeurde.', '{doel} Stel een klasgenoot drie vragen en noteer de antwoorden.'], () => kader(180), 0.5),
  { ...controleVorm, rang: 3 },
];
const LITERATUUR = [
  gewoon('lezen', 'Mijn boek', 'schrijven', 'Lees een boek of een tekst naar keuze. Vul in.', 1, [
    '{doel} Schrijf de titel van het boek en waarover het gaat.', '{doel} Wie is jouw lievelingspersonage? Schrijf op waarom.', '{doel} Schrijf op wat je het leukste vond in het boek.', '{doel} Welke woorden of zinnen vond je mooi? Schrijf ze op.', '{doel} Schrijf op wat je zou veranderen aan het verhaal.'], () => lijnen(4), 0.5, true),
  gewoon('tekenen', 'Teken het verhaal', 'tekenen', 'Teken een stukje uit het verhaal. Schrijf er een zin bij.', 2, [
    '{doel} Teken je lievelingsstuk uit het boek. Schrijf er een zin bij.', '{doel} Teken het personage dat je het leukst vond.', '{doel} Teken hoe je het verhaal laat eindigen.', '{doel} Teken een nieuwe omslag voor het boek.'], () => kader(190), 0.5),
  { ...controleVorm, rang: 3 },
];
const TAALSYSTEEM = [
  gewoon('uitleg', 'Leg het uit', 'schrijven', 'Lees het doel. Doe wat er gevraagd wordt.', 1, [
    '{doel} Schrijf met eigen woorden wat dit betekent.', '{doel} Leg uit aan een klasgenoot hoe je dit doet. Schrijf je uitleg op.', '{doel} Schrijf drie dingen op die je hierover al weet.', '{doel} Wanneer heb je dit nodig bij het lezen of schrijven? Schrijf een voorbeeld op.', '{doel} Welke woorden horen hierbij? Schrijf ze op en leg er één uit.', '{doel} Wat vind je makkelijk en wat vind je moeilijk hierbij?', '{doel} Welke tip zou je aan een jongere leerling geven?'], () => lijnen(3), 0.67, true),
  gewoon('voorbeeld', 'Bedenk zelf zinnen', 'schrijven', 'Bedenk zelf een voorbeeld.', 2, [
    '{doel} Schrijf vijf woorden of zinnen op die hierbij passen.', '{doel} Bedenk een zin die dit goed laat zien en onderstreep het belangrijkste.', '{doel} Schrijf een kort verhaaltje waarin je dit gebruikt.', '{doel} Zoek in een boek of tekst een voorbeeld en schrijf het over.', '{doel} Schrijf twee zinnen: een zin die juist is en een zin met een fout. Wat is er fout?', '{doel} Maak een oefening voor een klasgenoot en schrijf de oplossing op.'], () => lijnen(5), 0.5),
  { ...controleVorm, rang: 3 },
];

const PROFIELEN = [
  { id: 'lezen', vormen: LEZEN },
  { id: 'handschrift', vormen: SCHRIJF },
  { id: 'schrijven', vormen: SCHRIJVEN },
  { id: 'mondeling', vormen: MONDELING },
  { id: 'literatuur', vormen: LITERATUUR },
  { id: 'taalsysteem', vormen: TAALSYSTEEM },
];

export const OPEN_VORMEN = maakOpenVormen({ prefix: 'ot', profielen: PROFIELEN, doelenPerProfiel: OPEN_DOELEN });
