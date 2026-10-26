// Schrijfoefeningen op zinsniveau: een zin uitbreiden, twee zinnen verbinden, een vraag en antwoord bij een plaatje,
// een zin met opgegeven woorden en een reeks plaatjes in volgorde zetten. Gegevens: ../woorden/schrijven.js en ../woorden/plaatjes.js.
import { kies } from './taalkunde.js';
import { maakVorm, oefening, LIJN } from './schrijven.js';
import { plaatjesVoor, plaatjeSvg, REEKSEN, reeksSvg } from '../woorden/plaatjes.js';
import { UITBREIDEN, VERBINDEN, ZINWOORDEN, VRAAGWOORDEN } from '../woorden/schrijven.js';

const GROEP = 'schrijven-zinnen';
const select = (id, label, standaard, opties) => ({ id, groep: GROEP, label, type: 'select', standaard, opties });
const BEOORDEEL = 'Kijk na: hoofdletter, woorden los van elkaar, leesteken op het einde.';

/* ------------------------------------------------------------------ 6. zin uitbreiden */
const VRAAG = { waar: 'waar gebeurt het?', wanneer: 'wanneer gebeurt het?', hoe: 'hoe gebeurt het?', alle: 'waar, wanneer en hoe gebeurt het?' };
const zinUitbreiden = maakVorm({
  id: 'sw-uitbreiden', titel: 'Maak de zin langer', pictogram: 'schrijven', opdracht: 'Lees de zin. Maak de zin langer. Schrijf de nieuwe zin op de lijn.', doelen: ['1.5.GL2.40'], rang: 2,
  keuzes: [select('uitbreiding', 'Wat voegt de leerling toe?', 'mix', [['mix', 'Wisselend: waar, wanneer of hoe'], ['waar', 'Waar?'], ['wanneer', 'Wanneer?'], ['hoe', 'Hoe?'], ['alle', 'Waar, wanneer en hoe']])],
  bouw: (r, o) => {
    const item = kies(r, UITBREIDEN), u = !o.uitbreiding || o.uitbreiding === 'mix' ? kies(r, ['waar', 'wanneer', 'hoe']) : o.uitbreiding;
    return oefening({
      tekst: `${item.basis}\nMaak de zin langer: ${VRAAG[u]}\n${LIJN}`, antwoord: item[u], volledig: `${item[u]} (voorbeeld)`, kern: item.basis, sleutel: `${item.basis}|${u}`, moeilijkheid: [u === 'alle' ? 1 : 0],
      data: { type: 'sw-uitbreiden', doel: o.doel, basis: item.basis, uitbreiding: u },
    });
  },
});

/* ------------------------------------------------------------------ 7. twee zinnen samenvoegen */
const zinnenVerbinden = maakVorm({
  id: 'sw-samen', titel: 'Maak van twee zinnen één zin', pictogram: 'schrijven', opdracht: 'Lees de twee zinnen. Verbind ze met het woord. Schrijf één zin.', doelen: ['1.5.GL2.40', '1.3.GL3.20'], rang: 3,
  keuzes: [select('verbinding', 'Verbindingswoord', 'alle', [['alle', 'en, maar, want en omdat'], ['en', 'Enkel en'], ['maar', 'Enkel maar'], ['want', 'Enkel want'], ['omdat', 'Enkel omdat']])],
  bouw: (r, o) => {
    const pool = VERBINDEN.filter(v => !o.verbinding || o.verbinding === 'alle' || v.w === o.verbinding), v = kies(r, pool);
    return oefening({
      tekst: `${v.a}\n${v.b}\nVerbind met: ${v.w}\n${LIJN}`, antwoord: v.samen, volledig: v.samen, kern: v.samen, sleutel: v.samen, moeilijkheid: [v.w === 'omdat' ? 2 : 1],
      data: { type: 'sw-samen', doel: o.doel, a: v.a, b: v.b, woord: v.w },
    });
  },
});

/* ------------------------------------------------------------------ 8. een vraag en een antwoord bij een plaatje */
const ALLE_PLAATJES = () => [...plaatjesVoor('mkm'), ...plaatjesVoor('tek')];
const vraagBijPlaatje = maakVorm({
  id: 'sw-vraag', titel: 'Schrijf een vraag bij het plaatje', pictogram: 'schrijven', opdracht: 'Kijk naar het plaatje. Schrijf een vraag en schrijf ook het antwoord.', doelen: ['1.5.GL2.42'], rang: 3,
  keuzes: [select('vraaghulp', 'Hulp bij de vraag', 'woorden', [['woorden', 'Vraagwoorden staan erbij'], ['geen', 'Enkel het plaatje']])],
  bouw: (r, o) => {
    const p = kies(r, ALLE_PLAATJES()), hulp = o.vraaghulp || 'woorden';
    return oefening({
      tekst: `${hulp === 'woorden' ? `Begin je vraag met: ${VRAAGWOORDEN.join(' - ')}\n` : ''}Vraag:\n${LIJN}\nAntwoord:\n${LIJN}`, svg: plaatjeSvg(p.w), svgBoven: true, antwoord: `Wat is dit? Een ${p.w}.`,
      volledig: `Bijvoorbeeld: Wat is dit? Een ${p.w}. Kijk na: de vraag begint met een hoofdletter en eindigt op een vraagteken.`, kern: p.w, sleutel: p.w, moeilijkheid: [p.w.length],
      data: { type: 'sw-vraag', doel: o.doel, woord: p.w, hulp, open: true },
    });
  },
});

/* ------------------------------------------------------------------ 9. een zin met opgegeven woorden */
const zinMetWoorden = maakVorm({
  id: 'sw-woorden', titel: 'Maak een zin met deze woorden', pictogram: 'schrijven', opdracht: 'Maak één zin met de woorden. Schrijf de zin op de lijnen.', doelen: ['1.3.GL2.29', '1.3.GL3.20'], rang: 4,
  keuzes: [select('aantalWoorden', 'Hoeveel woorden?', '2', [['2', 'Twee woorden'], ['3', 'Drie woorden']])],
  bouw: (r, o) => {
    const n = Number(o.aantalWoorden) === 3 ? 3 : 2, ws = r.schud(ZINWOORDEN).slice(0, n), sleutel = [...ws].sort().join('|');
    return oefening({
      tekst: `Woorden: ${ws.join(', ')}\n${LIJN}\n${LIJN}`, antwoord: `Eigen zin met ${ws.join(', ')}.`, volledig: `Eigen zin met ${ws.join(', ')}. Kijk na: alle woorden staan erin. ${BEOORDEEL}`, kern: sleutel, sleutel, moeilijkheid: [n],
      data: { type: 'sw-woorden', doel: o.doel, woorden: ws, open: true },
    });
  },
});

/* ------------------------------------------------------------------ 10. een reeks plaatjes in volgorde en beschrijven */
const PERMUTATIES = [[0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
const reeksBeschrijven = maakVorm({
  id: 'sw-reeks', titel: 'Zet de plaatjes in volgorde en schrijf', pictogram: 'schrijven', opdracht: 'Zet de plaatjes in de goede volgorde: schrijf 1, 2 of 3 in het rondje. Schrijf dan bij elk plaatje een zin.', doelen: ['1.3.GL2.34'], rang: 4,
  bouw: (r, o) => {
    const reeks = kies(r, REEKSEN), orde = kies(r, PERMUTATIES);
    return oefening({
      tekst: `${LIJN}\n${LIJN}\n${LIJN}`, svg: reeksSvg(reeks, orde), antwoordSvg: reeksSvg(reeks, orde, true), svgBoven: true,
      antwoord: `Van links naar rechts: ${orde.map(i => i + 1).join(', ')}. Bijvoorbeeld: ${reeks.zinnen.join(' ')}`,
      volledig: `Van links naar rechts: ${orde.map(i => i + 1).join(', ')}. Bijvoorbeeld: ${reeks.zinnen.join(' ')} ${BEOORDEEL}`, kern: reeks.id, sleutel: `${reeks.id}|${orde}`, moeilijkheid: [orde.join('') === '210' ? 2 : 1],
      data: { type: 'sw-reeks', doel: o.doel, reeks: reeks.id, orde, open: true },
    });
  },
});

export const SCHRIJFZINNEN_VORMEN = [zinUitbreiden, zinnenVerbinden, vraagBijPlaatje, zinMetWoorden, reeksBeschrijven];
