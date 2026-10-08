// Extra oefenvormen voor geld: munten en biljetten, vergelijken en ordenen, de winkelbon en wisselgeld.
// Bedragen zijn intern in eurocent; het getallengebied geldt voor het bedrag in euro.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { kies, NBSP } from './stelling-vormen.js';
import { geld as geldTekening, geldVerbinden, geldVak, tabel } from '../svg.js';
import { NAMEN } from '../contexten.js';
import {
  NIVEAU_KEUZE, niveauOpties, STAP, WAARDEN, bedrag, muntenSet, MUNTEN_NIVEAU, PRIJS_NIVEAU, WISSEL_NIVEAU, ARTIKELEN, muntenTellen, totaalprijs, wisselgeld,
} from './geld.js';

const JF = () => `${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`;
const fmt = (niveau) => (c) => bedrag(c, niveau === 1 ? 100 : 1);

const maakVorm = ({ id, titel, pictogram = 'schrijven', opdracht, doelen, opties, rang, schaal = 1, bouw }) => ({
  id, titel, pictogram, opdracht, rang, schaal, basis: false, decimaal: true, doelen, keuzes: [NIVEAU_KEUZE], opties,
  genereer({ seed, aantal, gebied, opties: o }) {
    const rng = maakRng(seed);
    const niveau = Number((o && o.niveau) || 1);
    return resultaat(trek(rng, aantal, (r) => bouw(r, { gebied, niveau, stap: STAP[niveau], f: fmt(niveau) })), aantal);
  },
});

const MUNTEN = { doelen: muntenTellen.doelen, opties: muntenTellen.opties };
const PRIJS = { doelen: totaalprijs.doelen, opties: totaalprijs.opties };
const WISSEL = { doelen: wisselgeld.doelen, opties: wisselgeld.opties };

// Foute bedragen: een heel euro, tien cent of één muntstuk ernaast; pas als dat niet lukt ook de kleinste stap.
function fouteBedragen(totaal, kleinste, gebied, stap) {
  const geldig = (x) => x >= stap && x <= gebied * 100 && x !== totaal && x % stap === 0;
  const typisch = [...new Set([totaal + 100, totaal - 100, totaal + 10, totaal - 10, ...(kleinste >= 5 ? [totaal + kleinste, totaal - kleinste] : [])])].filter(geldig);
  return typisch.length >= 2 ? typisch : [...new Set([...typisch, totaal + stap, totaal - stap, totaal + kleinste, totaal - kleinste])].filter(geldig);
}

// Verdeelt een bedrag in munten en biljetten (willekeurig, maximaal 8 stuks).
function leg(r, totaal, niveau, gebied) {
  const waarden = WAARDEN[niveau].filter(c => c <= gebied * 100).sort((x, y) => y - x);
  const items = []; let rest = totaal;
  while (rest > 0 && items.length < 8) {
    const mogelijk = waarden.filter(w => w <= rest);
    if (!mogelijk.length) return null;
    const w = r.volgende() < 0.6 ? mogelijk[0] : kies(r, mogelijk);
    items.push(w); rest -= w;
  }
  return rest === 0 ? items.sort((x, y) => y - x) : null;
}

/* ================================================================== munten en biljetten */
export const muntenMeerkeuze = maakVorm({
  id: 'geld-munten-meerkeuze', titel: 'Munten tellen: meerkeuze', pictogram: 'omcirkelen', ...MUNTEN, rang: 3, opdracht: 'Hoeveel geld is dit? Omcirkel de letter.',
  bouw(r, { gebied, niveau, f, stap }) {
    const set = muntenSet(r, niveau, gebied);
    if (!set) return null;
    const fouten = r.schud(fouteBedragen(set.totaal, Math.min(...set.items), gebied, niveau === 1 ? 100 : 1)).slice(0, 2);
    if (fouten.length < 2) return null;
    const opties = [set.totaal, ...fouten].sort((x, y) => x - y), juist = opties.indexOf(set.totaal);
    return { tekst: `Hoeveel geld is dit?${NBSP.repeat(3)}${opties.map((o, i) => `${'abc'[i]})${NBSP}${f(o)}`).join(NBSP.repeat(4))}`, svg: geldTekening(set.items), breed: true,
      antwoord: `${'abc'[juist]}) ${f(set.totaal)}`, volledig: `Dit is ${f(set.totaal)}.`, getallen: [...opties].map(c => c / 100), sleutel: set.items.join('+'),
      moeilijkheid: [Math.min(...set.items) >= 100 ? 0 : 1, set.n, set.totaal], data: { type: 'geld-mk', items: set.items, totaal: set.totaal, opties, juist } };
  },
});

export const muntenJuistFout = maakVorm({
  id: 'geld-munten-juist-fout', titel: 'Munten tellen: juist of fout', pictogram: 'omcirkelen', ...MUNTEN, rang: 3, opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied, niveau, f }) {
    const set = muntenSet(r, niveau, gebied);
    if (!set) return null;
    const juist = r.volgende() < 0.5, fouten = fouteBedragen(set.totaal, Math.min(...set.items), gebied, niveau === 1 ? 100 : 1);
    if (!juist && !fouten.length) return null;
    const genoemd = juist ? set.totaal : kies(r, fouten);
    return { tekst: `Dit is ${f(genoemd)}.${JF()}`, svg: geldTekening(set.items), breed: true, antwoord: juist ? 'juist' : 'fout',
      volledig: `Dit is ${f(genoemd)}: ${juist ? 'juist' : `fout (juist is ${f(set.totaal)})`}`, getallen: [genoemd / 100], sleutel: `${set.items.join('+')}/${genoemd}`,
      moeilijkheid: [Math.min(...set.items) >= 100 ? 0 : 1, juist ? 0 : 1], data: { type: 'geld-jf', items: set.items, totaal: set.totaal, genoemd, juist } };
  },
});

export const muntenVerbinden = maakVorm({
  id: 'geld-munten-verbinden', titel: 'Munten en bedrag verbinden', pictogram: 'verbinden', ...MUNTEN, rang: 5, schaal: 0.34, opdracht: 'Verbind de munten en biljetten met het juiste bedrag. Trek een lijn.',
  bouw(r, { gebied, niveau, f }) {
    const sets = [], totalen = new Set();
    for (let t = 0; t < 60 && sets.length < 4; t++) { const s = muntenSet(r, niveau, gebied, 2, 4); if (s && !totalen.has(s.totaal)) { totalen.add(s.totaal); sets.push(s); } }
    if (sets.length < 4) return null;
    const orde = r.schud([0, 1, 2, 3]), koppels = sets.map((_, i) => [i, orde.indexOf(i)]);
    if (koppels.every(([a, b]) => a === b)) return null;
    const rechts = orde.map(i => f(sets[i].totaal));
    return { tekst: '', svg: geldVerbinden(sets.map(s => s.items), rechts, koppels), antwoordSvg: geldVerbinden(sets.map(s => s.items), rechts, koppels, true), breed: true,
      antwoord: sets.map(s => f(s.totaal)).join(', '), volledig: `Verbonden: ${sets.map(s => f(s.totaal)).join(', ')}`, getallen: sets.map(s => s.totaal / 100),
      sleutel: sets.map(s => s.items.join('+')).sort().join('|'), moeilijkheid: [Math.max(...sets.map(s => s.n))], data: { type: 'geld-verbind', sets: sets.map(s => ({ items: s.items, totaal: s.totaal })) } };
  },
});

export const geldLeggen = maakVorm({
  id: 'geld-leggen', titel: 'Een bedrag leggen', pictogram: 'tekenen', ...MUNTEN, rang: 6, schaal: 0.5, opdracht: 'Teken munten en biljetten die samen het bedrag zijn. Gebruik zo weinig mogelijk.',
  bouw(r, { gebied, niveau, f, stap }) {
    const totaal = stap * r.geheel(1, Math.min(Math.floor((gebied * 100) / stap), Math.floor(5000 / stap)));
    const items = leg(r, totaal, niveau, gebied);
    if (!items || items.length > 8) return null;
    const tekst = `Leg ${f(totaal)}.`;
    return { tekst, svg: geldVak(), antwoordSvg: geldTekening(items), breed: true, antwoord: f(totaal), volledig: `${tekst} Bijvoorbeeld: ${items.map(c => (c >= 100 ? `€ ${c / 100}` : `${c} c`)).join(' + ')}`,
      getallen: [totaal / 100], sleutel: `${totaal}`, moeilijkheid: [stap === 100 ? 0 : 1, totaal], data: { type: 'geld-leg', totaal, items } };
  },
});

/* ================================================================== vergelijken, ordenen, winkelbon */
const bedragen = (r, n, gebied, stap) => {
  const set = new Set(), basis = r.geheel(stap, Math.max(stap, Math.floor((gebied * 100) / 2)));
  for (let t = 0; t < 60 && set.size < n; t++) {
    const x = stap * Math.max(1, Math.round((basis * (0.4 + r.volgende() * 1.8)) / stap));
    if (x <= gebied * 100) set.add(x);
  }
  return set.size === n ? [...set] : null;
};

export const geldVergelijken = maakVorm({
  id: 'geld-vergelijken', titel: 'Bedragen vergelijken', ...PRIJS, rang: 2, opdracht: 'Vergelijk de bedragen. Schrijf <, > of = op de lijn.',
  bouw(r, { gebied, niveau, f, stap }) {
    const ba = bedragen(r, 2, gebied, stap), gelijk = r.volgende() < 0.1;
    if (!ba) return null;
    const [a, b] = gelijk ? [ba[0], ba[0]] : ba, t = a < b ? '<' : a > b ? '>' : '=';
    return { tekst: `${f(a)}  ____  ${f(b)}`, antwoord: t, volledig: `${f(a)} ${t} ${f(b)}`, getallen: [a / 100, b / 100], sleutel: [a, b].join('/'),
      moeilijkheid: [stap === 100 ? 0 : 1, Math.max(a, b)], data: { type: 'geld-vergelijk', a, b } };
  },
});

export const geldOrdenen = maakVorm({
  id: 'geld-ordenen', titel: 'Bedragen ordenen', ...PRIJS, rang: 4, schaal: 0.67, opdracht: 'Zet de bedragen in de juiste volgorde. Het teken wijst de richting aan.',
  bouw(r, { gebied, niveau, f, stap }) {
    const ba = bedragen(r, r.volgende() < 0.4 ? 4 : 3, gebied, stap);
    if (!ba) return null;
    const stijgend = r.volgende() < 0.5, t = stijgend ? '<' : '>', juist = [...ba].sort((x, y) => (stijgend ? x - y : y - x)), door = r.schud(ba);
    if (door.every((x, i) => x === juist[i])) return null;
    return { tekst: `${door.map(f).join('   ')}   →   ${Array(ba.length).fill('____').join(` ${t} `)}`, breed: true, antwoord: juist.map(f).join(` ${t} `),
      volledig: `${door.map(f).join(' ')} → ${juist.map(f).join(` ${t} `)}`, getallen: ba.map(c => c / 100), sleutel: [...ba].sort((x, y) => x - y).join('/'),
      moeilijkheid: [ba.length, stap === 100 ? 0 : 1], data: { type: 'geld-orden', bedragen: door, stijgend } };
  },
});

const KORT = ['bal', 'boek', 'pen', 'ijsje', 'appel', 'koek', 'schrift', 'auto', 'sap', 'kam'];
export const geldWinkelbon = maakVorm({
  id: 'geld-winkelbon', titel: 'Winkelbon aanvullen', ...PRIJS, rang: 4, schaal: 0.34, opdracht: 'Reken uit hoeveel alles samen kost. Schrijf het bedrag in het lege vak.',
  bouw(r, { gebied, niveau, f, stap }) {
    const k = r.geheel(3, 4), max = Math.min(Math.floor((gebied * 100) / k), 4000);
    if (max < stap) return null;
    const namen = r.schud(KORT).slice(0, k), prijzen = namen.map(() => stap * r.geheel(1, Math.floor(max / stap))), totaal = prijzen.reduce((x, y) => x + y, 0);
    if (totaal > gebied * 100) return null;
    const rijen = [...namen.map((n, i) => [n, f(prijzen[i])]), ['samen', null]], vol = [...namen.map((n, i) => [n, f(prijzen[i])]), ['samen', f(totaal)]];
    return { tekst: '', svg: tabel(['artikel', 'prijs'], rijen), antwoordSvg: tabel(['artikel', 'prijs'], rijen, vol), breed: true, antwoord: f(totaal),
      volledig: `Winkelbon: ${namen.map((n, i) => `${n} ${f(prijzen[i])}`).join(', ')}. Samen ${f(totaal)}`, getallen: [...prijzen, totaal].map(c => c / 100),
      sleutel: namen.map((n, i) => `${n}${prijzen[i]}`).join('|'), moeilijkheid: [k, totaal], data: { type: 'geld-bon', namen, prijzen, totaal } };
  },
});

/* ================================================================== wisselgeld en totaalprijs */
const BETAALD = [5, 10, 20, 50, 100, 200];
function wisselKern(r, gebied, stap) {
  const biljetten = BETAALD.filter(b => b <= gebied);
  if (!biljetten.length) return null;
  const betaald = kies(r, biljetten), prijs = stap * r.geheel(1, (betaald * 100) / stap - 1), terug = betaald * 100 - prijs;
  return { betaald, prijs, terug };
}
const foutWissel = (k, gebied, stap) => [...new Set([k.terug + stap, k.terug - stap, k.terug + 100, k.terug - 100, k.prijs])].filter(x => x >= stap && x < k.betaald * 100 && x !== k.terug && x % stap === 0);

export const wisselJuistFout = maakVorm({
  id: 'geld-wisselgeld-juist-fout', titel: 'Wisselgeld: juist of fout', pictogram: 'omcirkelen', ...WISSEL, rang: 3, opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied, f, stap }) {
    const k = wisselKern(r, gebied, stap);
    if (!k) return null;
    const juist = r.volgende() < 0.5, fouten = foutWissel(k, gebied, stap);
    if (!juist && !fouten.length) return null;
    const genoemd = juist ? k.terug : kies(r, fouten), tekst = `Je betaalt ${bedrag(k.betaald * 100, 100)}. Het kost ${f(k.prijs)}. Je krijgt ${f(genoemd)} terug.`;
    return { tekst: `${tekst}${JF()}`, breed: true, antwoord: juist ? 'juist' : 'fout', volledig: `${tekst} ${juist ? 'Juist' : `Fout (juist is ${f(k.terug)})`}`,
      getallen: [k.betaald, k.prijs / 100, genoemd / 100], sleutel: `${k.betaald}/${k.prijs}/${genoemd}`, moeilijkheid: [stap === 100 ? 0 : 1, juist ? 0 : 1],
      data: { type: 'wissel-jf', betaald: k.betaald, prijs: k.prijs, genoemd, juist } };
  },
});

export const wisselMeerkeuze = maakVorm({
  id: 'geld-wisselgeld-meerkeuze', titel: 'Wisselgeld: meerkeuze', pictogram: 'omcirkelen', ...WISSEL, rang: 3, opdracht: 'Hoeveel krijg je terug? Omcirkel de letter.',
  bouw(r, { gebied, f, stap }) {
    const k = wisselKern(r, gebied, stap);
    if (!k) return null;
    const fouten = r.schud(foutWissel(k, gebied, stap)).slice(0, 2);
    if (fouten.length < 2) return null;
    const opties = [k.terug, ...fouten].sort((x, y) => x - y), juist = opties.indexOf(k.terug), vraag = `Je betaalt ${bedrag(k.betaald * 100, 100)}. Het kost ${f(k.prijs)}. Hoeveel krijg je terug?`;
    return { tekst: `${vraag}${NBSP.repeat(3)}${opties.map((o, i) => `${'abc'[i]})${NBSP}${f(o)}`).join(NBSP.repeat(4))}`, breed: true, antwoord: `${'abc'[juist]}) ${f(k.terug)}`,
      volledig: `${vraag} ${f(k.terug)}`, getallen: [k.betaald, k.prijs / 100, ...opties.map(c => c / 100)], sleutel: `${k.betaald}/${k.prijs}`, moeilijkheid: [stap === 100 ? 0 : 1, 1],
      data: { type: 'wissel-mk', betaald: k.betaald, prijs: k.prijs, opties, juist } };
  },
});

export const totaalFoutZoeken = maakVorm({
  id: 'geld-totaal-fout-zoeken', titel: 'Totaalprijs: fout zoeken', pictogram: 'omcirkelen', ...PRIJS, rang: 7, schaal: 0.67, opdracht: 'Zoek de fout. Schrijf de juiste totaalprijs op de lijn.',
  bouw(r, { gebied, f, stap }) {
    const max = Math.min(Math.floor((gebied * 100) / 2), 4000);
    if (max < stap) return null;
    const namen = r.schud(ARTIKELEN).slice(0, 2), prijzen = namen.map(() => stap * r.geheel(1, Math.floor(max / stap))), totaal = prijzen[0] + prijzen[1];
    const fouten = [...new Set([totaal + 100, totaal - 100, totaal + stap, totaal - stap, Math.abs(prijzen[0] - prijzen[1])])].filter(x => x >= stap && x <= gebied * 100 && x !== totaal && x % stap === 0);
    if (!fouten.length || totaal > gebied * 100) return null;
    const fout = kies(r, fouten), naam = kies(r, NAMEN);
    const rekening = `${naam} koopt ${namen[0]} van ${f(prijzen[0])} en ${namen[1]} van ${f(prijzen[1])}. ${naam} rekent: samen ${f(fout)}. Dat is fout.`;
    return { tekst: `${rekening}\nHet juiste bedrag: ____`, breed: true, antwoord: f(totaal), volledig: `${rekening} Juist is ${f(totaal)}`, getallen: [...prijzen, fout, totaal].map(c => c / 100),
      sleutel: namen.map((n, i) => `${n}${prijzen[i]}`).join('|') + fout, moeilijkheid: [stap === 100 ? 0 : 1, totaal], data: { type: 'totaal-fout', prijzen, fout, totaal } };
  },
});

export const GELD_VORMEN = [
  muntenMeerkeuze, muntenJuistFout, muntenVerbinden, geldLeggen, geldVergelijken, geldOrdenen, geldWinkelbon,
  wisselJuistFout, wisselMeerkeuze, totaalFoutZoeken,
];
