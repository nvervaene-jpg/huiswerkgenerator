// Nieuwe leesoefeningen: woorden bij plaatjes lezen, klankgroepen onderstrepen, woorden in de tijd lezen,
// en zinnen lezen met plaatjes (kies het plaatje, ja of nee, lees in stukjes). Plaatjes: ../woorden/plaatjes.js.
import { vorm, kies, basisOefening } from './taalkunde.js';
import { LEES_DOELEN, LEES_OK, ZOEK_DOELEN, LENGTE_KEUZE, woordenVoor } from './lezen.js';
import { PLAATJES, plaatjeSvg, woordPlaatjeVerbinden, plaatjesKeuze } from '../woorden/plaatjes.js';

const NBSP = ' ';
const PLAATJE_WOORDEN = PLAATJES.map(p => p.w);
const LID = Object.fromEntries(PLAATJES.map(p => [p.w, p.lid]));
const plaatjesIn = (doel) => woordenVoor({ doel }).filter(w => PLAATJE_WOORDEN.includes(w));
const LEES_PLAATJE_DOELEN = LEES_OK.filter(c => plaatjesIn(c).length >= 3);

/* ------------------------------------------------------------------ 1. lees het woord, verbind met het plaatje */
const woordPlaatje = vorm({
  id: 'lz-plaatje', titel: 'Lees het woord, zoek het plaatje', pictogram: 'verbinden', opdracht: 'Lees de woorden. Trek een lijn van elk woord naar het juiste plaatje.', doelen: LEES_PLAATJE_DOELEN, rang: 2, schaal: 0.34,
  bouw: (r, o) => {
    const woorden = r.schud(plaatjesIn(o.doel)).slice(0, 3);
    if (woorden.length < 3) return null;
    const orde = r.schud([0, 1, 2]), plaatjes = orde.map(i => woorden[i]), paren = woorden.map((_, i) => [i, orde.indexOf(i)]);
    if (paren.every(([a, b]) => a === b)) return null;
    return {
      tekst: '', svg: woordPlaatjeVerbinden(woorden, plaatjes, paren), antwoordSvg: woordPlaatjeVerbinden(woorden, plaatjes, paren, true), breed: true, getallen: [],
      antwoord: woorden.join(', '), volledig: `Verbonden: ${woorden.join(', ')}`, kern: [...woorden].sort().join('|'), sleutel: [...woorden].sort().join('|'), kernen: woorden, moeilijkheid: [Math.max(...woorden.map(w => w.length))],
      data: { type: 'lz-plaatje', doel: o.doel, woorden, plaatjes },
    };
  },
});

/* ------------------------------------------------------------------ 2. onderstreep de klankgroep */
const klankgroep = vorm({
  id: 'lz-klankgroep', titel: 'Onderstreep de klankgroep', pictogram: 'schrijven', opdracht: 'Lees de woorden. Trek een lijn onder de gevraagde letters in elk woord.', doelen: ZOEK_DOELEN, rang: 3, schaal: 0.6, keuzes: [LENGTE_KEUZE],
  bouw: (r, o) => {
    const d = LEES_DOELEN[o.doel], soort = kies(r, d.soorten), pool = woordenVoor(o).filter(w => w.includes(soort));
    const woorden = r.schud(pool).slice(0, 5);
    if (woorden.length < 4) return null;
    const markeer = (w) => `${w} (${soort})`;
    return basisOefening({
      tekst: `Onderstreep ${soort} in elk woord:\n${woorden.join(NBSP.repeat(6))}`, antwoord: woorden.map(markeer).join(', '), volledig: `Onderstreep ${soort} in: ${woorden.join(', ')}`,
      kern: `${soort}|${[...woorden].sort().join('|')}`, sleutel: `${soort}|${[...woorden].sort().join('|')}`, kernen: woorden, moeilijkheid: [Math.max(...woorden.map(w => w.length)), 1],
      data: { type: 'lz-klankgroep', doel: o.doel, soort, woorden },
    });
  },
});

/* ------------------------------------------------------------------ 3. woorden lezen in de tijd (voor de leerkracht) */
const tijd = vorm({
  id: 'lz-tijd', titel: 'Woorden lezen in de tijd', pictogram: 'schrijven', opdracht: 'Lees de woorden zo goed en zo snel je kan. De leerkracht noteert de fouten en de tijd.', doelen: LEES_OK, rang: 4, schaal: 0.34, keuzes: [LENGTE_KEUZE],
  bouw: (r, o) => {
    const pool = woordenVoor(o);
    if (pool.length < 8) return null;
    const woorden = r.schud(pool).slice(0, 10);
    return basisOefening({
      tekst: `${woorden.slice(0, 5).join(NBSP.repeat(6))}\n${woorden.slice(5).join(NBSP.repeat(6))}\nFouten: ${'_'.repeat(4)}${NBSP.repeat(6)}Tijd: ${'_'.repeat(4)} seconden`, antwoord: woorden.join(', '),
      volledig: `Woorden: ${woorden.join(', ')} (de leerkracht noteert fouten en tijd)`, kern: [...woorden].sort().join('|'), sleutel: [...woorden].sort().join('|'), kernen: woorden, moeilijkheid: [Math.max(...woorden.map(w => w.length))],
      data: { type: 'lz-tijd', doel: o.doel, woorden, open: true },
    });
  },
});

/* ------------------------------------------------------------------ zinnen met plaatjes (eerste leerjaar: vlot en vloeiend lezen) */
export const LEES_ZIN_DOELEN = ['1.2.GL1.29', '1.2.GL1.30'];
const ZINNEN = [(w) => `Ik zie een ${w}.`, (w) => `Ik heb een ${w}.`, (w) => `Kijk, een ${w}!`, (w) => `Hier is ${LID[w]} ${w}.`, (w) => `Ik teken een ${w}.`];
const andere = (r, w, n = 1) => r.schud(PLAATJE_WOORDEN.filter(x => x !== w)).slice(0, n);
const lengteWoord = (w) => w.length;
const GROEP = 'lezen-zinnen';
const zinKeuze = { id: 'plaatjes', groep: GROEP, label: 'Aantal plaatjes om uit te kiezen', type: 'select', standaard: '2', opties: [['2', 'Twee plaatjes'], ['3', 'Drie plaatjes']] };

const zinPlaatje = vorm({
  id: 'lz-zin-plaatje', titel: 'Lees de zin, kies het plaatje', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Omcirkel het plaatje dat bij de zin past.', doelen: LEES_ZIN_DOELEN, rang: 1, basis: true, schaal: 0.5, keuzes: [zinKeuze],
  bouw: (r, o) => {
    const w = kies(r, PLAATJE_WOORDEN), zin = kies(r, ZINNEN)(w), n = o.plaatjes === '3' ? 3 : 2;
    const ws = r.schud([w, ...andere(r, w, n - 1)]), juist = ws.indexOf(w);
    return basisOefening({
      tekst: zin, svg: plaatjesKeuze(ws, juist), antwoordSvg: plaatjesKeuze(ws, juist, true), svgBoven: false, antwoord: w, volledig: `${zin} → ${w}`, kern: `${zin}|${ws.join()}`, sleutel: `${zin}|${[...ws].sort().join()}`, moeilijkheid: [lengteWoord(w), n],
      data: { type: 'lz-zin-plaatje', doel: o.doel, zin, woord: w, plaatjes: ws, juist },
    });
  },
});

const zinJaNee = vorm({
  id: 'lz-zin-janee', titel: 'Past de zin bij het plaatje?', pictogram: 'omcirkelen', opdracht: 'Kijk naar het plaatje. Lees de zin. Past de zin bij het plaatje? Omcirkel ja of nee.', doelen: LEES_ZIN_DOELEN, rang: 2, schaal: 0.5,
  bouw: (r, o) => {
    const w = kies(r, PLAATJE_WOORDEN), past = r.volgende() < 0.5, genoemd = past ? w : andere(r, w)[0], zin = kies(r, ZINNEN)(genoemd);
    return basisOefening({
      tekst: `${zin}\nja${NBSP.repeat(8)}nee`, svg: plaatjeSvg(w), svgBoven: true, antwoord: past ? 'ja' : 'nee', volledig: `${zin} → ${past ? 'ja' : 'nee'} (het plaatje is ${LID[w]} ${w})`, kern: `${w}|${genoemd}|${zin}`, sleutel: `${w}|${zin}`, moeilijkheid: [lengteWoord(w), past ? 0 : 1],
      data: { type: 'lz-zin-janee', doel: o.doel, zin, plaatje: w, genoemd, past },
    });
  },
});

const zinStukjes = vorm({
  id: 'lz-zin-stukjes', titel: 'Lees de zin in stukjes', pictogram: 'schrijven', opdracht: 'Lees de zin stukje voor stukje. Lees de zin daarna in één keer.', doelen: LEES_ZIN_DOELEN, rang: 3, schaal: 0.5,
  bouw: (r, o) => {
    const w = kies(r, PLAATJE_WOORDEN), zin = kies(r, ZINNEN)(w), woorden = zin.split(' ');
    if (woorden.length < 3) return null;
    const stukjes = []; for (let i = 0; i < woorden.length; i += 2) stukjes.push(woorden.slice(i, i + 2).join(' '));
    return basisOefening({
      tekst: stukjes.join(`${NBSP}/${NBSP}`), antwoord: zin, volledig: zin, kern: zin, sleutel: zin, moeilijkheid: [woorden.length, lengteWoord(w)],
      data: { type: 'lz-zin-stukjes', doel: o.doel, zin, stukjes, open: true },
    });
  },
});

export const LEZEN_NIEUW_VORMEN = [woordPlaatje, klankgroep, tijd, zinPlaatje, zinJaNee, zinStukjes];
