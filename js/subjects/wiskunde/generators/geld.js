// Geld: munten en biljetten tellen, totaalprijs, wisselgeld en euro <-> eurocent.
// Bedragen worden intern in eurocent berekend. Het getallengebied geldt voor het bedrag in euro (bv. gebied 100 = tot € 100).
import { maakRng } from '../../../core/random.js';
import { trek, resultaat, hoogste, aantalCijfers } from './hulp.js';
import { maakOmzetten, maakVergelijken } from './maten.js';
import { maatVormen } from './maat-vormen.js';
import { REFERENTIE_GELD } from '../contexten.js';
import { geld as geldTekening } from '../svg.js';

export const NIVEAUS = ['1', '2', '3', '4'];                 // 1 = hele euro, 2 = 50 cent, 3 = 10 cent, 4 = cent
export const STAP = { 1: 100, 2: 50, 3: 10, 4: 1 };
// Notatie van bedragen: '€ 12,45' of '12 euro en 45 eurocent' (instelbaar per blokje, zie metNotatie).
let notatie = 'euro';
export const zetNotatie = (n) => { notatie = n === 'woorden' ? 'woorden' : 'euro'; };
export function bedrag(c, stap = 1) {
  if (notatie === 'woorden') { const e = Math.floor(c / 100), ct = c % 100; return ct ? (e ? `${e} euro en ${ct} eurocent` : `${ct} eurocent`) : `${e} euro`; }
  return stap >= 100 ? `€ ${c / 100}` : `€ ${(c / 100).toFixed(2).replace('.', ',')}`;
}
export const NOTATIE_KEUZE = { id: 'notatie', groep: 'geld', label: 'Hoe schrijf je een bedrag?', type: 'select', opties: [['euro', '€ 12,45'], ['woorden', '12 euro en 45 eurocent']], standaard: 'euro' };
// Maakt van een geldgenerator er een met de keuze voor de notatie van de bedragen.
export const metNotatie = (g) => ({
  ...g,
  keuzes: [...(g.keuzes || []), NOTATIE_KEUZE],
  opties: (doelCodes, keuzes = {}, doel) => ({ ...(g.opties ? g.opties(doelCodes, keuzes, doel) : {}), ...(keuzes.notatie ? { notatie: keuzes.notatie } : {}) }),
  genereer(a) { zetNotatie(a.opties && a.opties.notatie); try { return g.genereer(a); } finally { zetNotatie('euro'); } },
});

export const NIVEAU_KEUZE = {
  id: 'nauwkeurigheid', groep: 'geld', label: 'Nauwkeurigheid van de bedragen', type: 'select',
  opties: [['auto', 'Volgens de gekozen doelen'], ['1', 'Hele euro'], ['2', 'Tot 50 cent'], ['3', 'Tot 10 cent'], ['4', 'Tot op de cent']],
  standaard: 'auto',
};
export const niveauOpties = (kaart) => (doelCodes, keuzes = {}) => ({
  niveau: keuzes.nauwkeurigheid && keuzes.nauwkeurigheid !== 'auto' ? keuzes.nauwkeurigheid : hoogste(doelCodes, kaart, NIVEAUS, '1'),
});

/* ------------------------------------------------------------------ munten en biljetten tellen */
export const MUNTEN_NIVEAU = { '2.3.GL1.27': '1', '2.3.GL2.30': '2', '2.3.GL3.40': '3', '2.3.GL4.50': '4', '2.3.GL4.51': '4' };
export const WAARDEN = {                                             // in eurocent, cumulatief per niveau
  1: [100, 200, 500, 1000, 2000],
  2: [100, 200, 500, 1000, 2000, 50, 5000, 10000],
  3: [100, 200, 500, 1000, 2000, 50, 5000, 10000, 20, 10, 20000],
  4: [100, 200, 500, 1000, 2000, 50, 5000, 10000, 20, 10, 20000, 5],       // geen munten van 1 en 2 cent
};

// Een willekeurige set munten en biljetten met een totaal binnen het getallengebied.
export function muntenSet(r, niveau, gebied, minAantal = 2, maxAantal = 3 + niveau * 2) {
  const waarden = WAARDEN[niveau].filter(c => c <= gebied * 100);
  if (!waarden.length) return null;
  const n = r.geheel(minAantal, maxAantal);
  const items = Array.from({ length: n }, () => waarden[r.geheel(0, waarden.length - 1)]).sort((x, y) => y - x);
  const totaal = items.reduce((x, y) => x + y, 0);
  return totaal > gebied * 100 ? null : { items, totaal, n };
}

export const muntenTellen = {
  id: 'geld-munten-tellen', titel: 'Munten en biljetten tellen', pictogram: 'schrijven', decimaal: true,
  opdracht: 'Tel het geld. Hoeveel is het samen? Schrijf het bedrag op de lijn.',
  doelen: Object.keys(MUNTEN_NIVEAU), keuzes: [NIVEAU_KEUZE], opties: niveauOpties(MUNTEN_NIVEAU),
  genereer({ seed, aantal, gebied, opties }) {
    const niveau = Number((opties && opties.niveau) || 1);
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const set = muntenSet(r, niveau, gebied);
      if (!set) return null;
      const { items, totaal, n } = set;
      const kleinste = Math.min(...items);
      return {
        tekst: 'Hoeveel geld is dit?  ____', svg: geldTekening(items), breed: true,
        antwoord: bedrag(totaal, niveau === 1 ? 100 : 1), volledig: `Dit is ${bedrag(totaal, niveau === 1 ? 100 : 1)}.`,
        getallen: [totaal / 100], sleutel: items.join('+'),
        moeilijkheid: [kleinste >= 100 ? 0 : kleinste >= 50 ? 1 : kleinste >= 10 ? 2 : 3, n, totaal],
        data: { type: 'munten', items, totaal },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ totaalprijs */
export const ARTIKELEN = ['een bal', 'een boek', 'een pen', 'een ijsje', 'een appel', 'een koek', 'een schrift', 'een speelgoedauto', 'een sap', 'een kam'];
const hoofdletter = (t) => t[0].toUpperCase() + t.slice(1);
export const PRIJS_NIVEAU = { '2.3.GL1.30': '1', '2.3.GL2.34': '1', '2.3.GL3.43': '1', '2.3.GL4.53': '4' };
export const totaalprijs = {
  id: 'geld-totaalprijs', titel: 'Totaalprijs berekenen', pictogram: 'schrijven', decimaal: true,
  opdracht: 'Lees goed. Reken de totaalprijs uit en schrijf het bedrag op de lijn.',
  doelen: ['2.3.GL1.30', '2.3.GL2.34', '2.3.GL3.43', '2.3.GL4.53'], keuzes: [NIVEAU_KEUZE],
  opties: niveauOpties(PRIJS_NIVEAU),
  genereer({ seed, aantal, gebied, opties }) {
    const niveau = Number((opties && opties.niveau) || 1), stap = STAP[niveau];
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const k = r.volgende() < 0.6 ? 2 : 3;
      const max = Math.min(Math.floor((gebied * 100) / k), 5000);               // een artikel kost hoogstens € 50
      if (max < stap) return null;
      const namen = r.schud(ARTIKELEN).slice(0, k);
      const prijzen = namen.map(() => stap * r.geheel(1, Math.floor(max / stap)));
      const totaal = prijzen.reduce((x, y) => x + y, 0);
      if (totaal > gebied * 100) return null;
      const zinnen = namen.map((n, i) => `${hoofdletter(n)} kost ${bedrag(prijzen[i], stap)}.`).join(' ');
      return {
        tekst: `${zinnen} Hoeveel kost het samen?  ____`, breed: true, antwoord: bedrag(totaal, stap),
        volledig: `${zinnen} Samen kost het ${bedrag(totaal, stap)}.`, getallen: [...prijzen, totaal].map(c => c / 100),
        sleutel: namen.map((n, i) => `${n}${prijzen[i]}`).join('|'),
        moeilijkheid: [stap === 100 ? 0 : stap === 50 ? 1 : stap === 10 ? 2 : 3, k, totaal],
        data: { type: 'prijs', prijzen, totaal },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ wisselgeld */
const BETAALD = [5, 10, 20, 50, 100, 200];
const EFFEN = [1, 2, 5, 10, 20, 50, 100, 200];                 // effen bedragen waarmee je betaalt (in euro)
export const WISSEL_NIVEAU = { '2.3.GL1.28': '1', '2.3.GL2.32': '2', '2.3.GL3.41': '3', '2.3.GL4.52': '4' };
export const BETALING_KEUZE = { id: 'betaling', groep: 'geld', label: 'Met welk bedrag betaal je?', type: 'select', opties: [['vrij', 'Met een willekeurig groter bedrag'], ['biljet', 'Met het eerstvolgende biljet of muntstuk'], ['euro', 'Met het volgende hele euro']], standaard: 'vrij' };
// Aanvullend wisselgeld: van de prijs naar het volgende hele euro, dan naar de volgende ronde stap, tot het betaalde bedrag. Geeft de tussenbedragen in eurocent.
export function aanvulStappen(prijs, betaald) {
  const stops = [Math.ceil(prijs / 100) * 100, Math.ceil(prijs / 500) * 500, Math.ceil(prijs / 1000) * 1000, Math.ceil(prijs / 2000) * 2000, Math.ceil(prijs / 5000) * 5000, Math.ceil(prijs / 10000) * 10000]
    .filter(x => x > prijs && x < betaald);
  const route = [...new Set([...stops, betaald])].sort((x, y) => x - y), stappen = [];
  let van = prijs;
  for (const naar of route) { stappen.push({ van, naar, plus: naar - van }); van = naar; }
  return stappen;
}
export const wisselgeld = {
  id: 'geld-wisselgeld', titel: 'Wisselgeld berekenen', pictogram: 'schrijven', decimaal: true,
  opdracht: 'Lees goed. Hoeveel krijg je terug? Schrijf het bedrag op de lijn.',
  doelen: ['2.3.GL1.28', '2.3.GL2.32', '2.3.GL3.41', '2.3.GL4.52'], keuzes: [NIVEAU_KEUZE, BETALING_KEUZE],
  opties: (doelCodes, keuzes = {}) => ({ ...niveauOpties(WISSEL_NIVEAU)(doelCodes, keuzes), ...(keuzes.betaling ? { betaling: keuzes.betaling } : {}) }),
  genereer({ seed, aantal, gebied, opties }) {
    const niveau = Number((opties && opties.niveau) || 1), stap = STAP[niveau], betaling = (opties && opties.betaling) || 'vrij', effen = betaling !== 'vrij';
    const biljetten = (betaling === 'biljet' ? EFFEN : BETAALD).filter(b => b <= gebied);
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      if (!biljetten.length) return null;
      let betaald, prijs;
      if (betaling === 'euro') {                                  // het volgende hele euro: de prijs heeft eurocent
        if (stap >= 100) return null;
        prijs = stap * r.geheel(1, (Math.min(gebied, 20) * 100) / stap - 1);
        if (prijs % 100 === 0) return null;
        betaald = Math.ceil(prijs / 100);
      } else if (betaling === 'biljet') {
        const grootste = biljetten[biljetten.length - 1];
        prijs = stap * r.geheel(1, (grootste * 100) / stap - 1);
        betaald = biljetten.find(b => b * 100 > prijs);
      } else { betaald = biljetten[r.geheel(0, biljetten.length - 1)]; prijs = stap * r.geheel(1, (betaald * 100) / stap - 1); }
      const terug = betaald * 100 - prijs;
      const tekst = `Je betaalt ${bedrag(betaald * 100, 100)}. Het kost ${bedrag(prijs, stap)}.`;
      const route = effen ? ` Aanvullen: ${aanvulStappen(prijs, betaald * 100).map(x => `${bedrag(x.van, 1)} + ${bedrag(x.plus, 1)} = ${bedrag(x.naar, 1)}`).join('; ')}.` : '';
      return {
        tekst: `${tekst} Hoeveel krijg je terug?  ____`, breed: true, antwoord: bedrag(terug, stap),
        volledig: `${tekst} Je krijgt ${bedrag(terug, stap)} terug.${route}`, getallen: [betaald, prijs / 100, terug / 100],
        sleutel: `${betaald}/${prijs}`, moeilijkheid: [stap === 100 ? 0 : stap === 50 ? 1 : stap === 10 ? 2 : 3, aantalCijfers(betaald), prijs],
        data: { type: 'wissel', betaald, prijs, terug, effen: !!effen },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ euro en eurocent omzetten */
const EURO_CENT = { cent: 1, euro: 100 };
export const geldOmzetten = maakOmzetten({
  id: 'geld-omzetten', titel: 'Euro en eurocent omzetten', opdracht: 'Reken het geld om. Schrijf het antwoord op de lijn.',
  maat: 'geld', factor: EURO_CENT, volgorde: ['euro', 'cent'],
  doelkaart: { '2.3.GL2.31': ['euro', 'cent'] }, standaard: ['euro', 'cent'],
});
export const eurocentVergelijken = maakVergelijken({
  id: 'eurocent-vergelijken', titel: 'Euro en eurocent vergelijken', opdracht: 'Vergelijk de bedragen. Schrijf <, > of = op de lijn.',
  maat: 'geld', factor: EURO_CENT, volgorde: ['euro', 'cent'], doelkaart: { '2.3.GL2.31': ['euro', 'cent'] }, standaard: ['euro', 'cent'],
});
const hoofdG = (t) => t[0].toUpperCase() + t.slice(1);
export const EUROCENT_VORMEN = maatVormen({
  prefix: 'eurocent', maat: 'geld', factor: EURO_CENT, volgorde: ['euro', 'cent'], standaard: ['euro', 'cent'], meervoud: 'bedragen',
  kaarten: { omzet: { '2.3.GL2.31': ['euro', 'cent'] }, vergelijk: { '2.3.GL2.31': ['euro', 'cent'] }, ref: { '2.3.GL3.44': ['euro', 'cent'] } },
  ctx: { sleutel: 'cent', eenheid: 'cent', zin: (o, v, e) => `${hoofdG(o.onderwerp)} kost ${v} ${e}.`, superlatief: () => 'Wat is het duurst?', zelfdeSoort: () => true },
  referentie: REFERENTIE_GELD,
  refZin: (i) => `${hoofdG(i.onderwerp)} kost ongeveer ${i.getal} ____.`,
});
