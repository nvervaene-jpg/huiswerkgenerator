// Geld: munten en biljetten tellen, totaalprijs, wisselgeld en euro <-> eurocent.
// Bedragen worden intern in eurocent berekend. Het getallengebied geldt voor het bedrag in euro (bv. gebied 100 = tot € 100).
import { maakRng } from '../../../core/random.js';
import { trek, resultaat, hoogste, aantalCijfers } from './hulp.js';
import { maakOmzetten } from './maten.js';
import { geld as geldTekening } from '../svg.js';

export const NIVEAUS = ['1', '2', '3', '4'];                 // 1 = hele euro, 2 = 50 cent, 3 = 10 cent, 4 = cent
const STAP = { 1: 100, 2: 50, 3: 10, 4: 1 };
export const bedrag = (c, stap = 1) => (stap >= 100 ? `€ ${c / 100}` : `€ ${(c / 100).toFixed(2).replace('.', ',')}`);

const NIVEAU_KEUZE = {
  id: 'nauwkeurigheid', label: 'Nauwkeurigheid van de bedragen', type: 'select',
  opties: [['auto', 'Volgens de gekozen doelen'], ['1', 'Hele euro'], ['2', 'Tot 50 cent'], ['3', 'Tot 10 cent'], ['4', 'Tot op de cent']],
  standaard: 'auto',
};
const niveauOpties = (kaart) => (doelCodes, keuzes = {}) => ({
  niveau: keuzes.nauwkeurigheid && keuzes.nauwkeurigheid !== 'auto' ? keuzes.nauwkeurigheid : hoogste(doelCodes, kaart, NIVEAUS, '1'),
});

/* ------------------------------------------------------------------ munten en biljetten tellen */
const MUNTEN_NIVEAU = { '2.3.GL1.27': '1', '2.3.GL2.30': '2', '2.3.GL3.40': '3', '2.3.GL4.50': '4', '2.3.GL4.51': '4' };
const WAARDEN = {                                             // in eurocent, cumulatief per niveau
  1: [100, 200, 500, 1000, 2000],
  2: [100, 200, 500, 1000, 2000, 50, 5000, 10000],
  3: [100, 200, 500, 1000, 2000, 50, 5000, 10000, 20, 10, 20000],
  4: [100, 200, 500, 1000, 2000, 50, 5000, 10000, 20, 10, 20000, 5, 2, 1],
};

export const muntenTellen = {
  id: 'geld-munten-tellen', titel: 'Munten en biljetten tellen', pictogram: 'schrijven', decimaal: true,
  opdracht: 'Tel het geld. Hoeveel is het samen? Schrijf het bedrag op de lijn.',
  doelen: Object.keys(MUNTEN_NIVEAU), keuzes: [NIVEAU_KEUZE], opties: niveauOpties(MUNTEN_NIVEAU),
  genereer({ seed, aantal, gebied, opties }) {
    const niveau = Number((opties && opties.niveau) || 1);
    const waarden = WAARDEN[niveau].filter(c => c <= gebied * 100);
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      if (!waarden.length) return null;
      const n = r.geheel(2, 3 + niveau * 2);
      const items = Array.from({ length: n }, () => waarden[r.geheel(0, waarden.length - 1)]).sort((x, y) => y - x);
      const totaal = items.reduce((x, y) => x + y, 0);
      if (totaal > gebied * 100) return null;
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
const ARTIKELEN = ['een bal', 'een boek', 'een pen', 'een ijsje', 'een appel', 'een koek', 'een schrift', 'een speelgoedauto', 'een sap', 'een kam'];
const hoofdletter = (t) => t[0].toUpperCase() + t.slice(1);
export const totaalprijs = {
  id: 'geld-totaalprijs', titel: 'Totaalprijs berekenen', pictogram: 'schrijven', decimaal: true,
  opdracht: 'Lees goed. Reken de totaalprijs uit en schrijf het bedrag op de lijn.',
  doelen: ['2.3.GL1.30', '2.3.GL2.34', '2.3.GL3.43', '2.3.GL4.53'], keuzes: [NIVEAU_KEUZE],
  opties: niveauOpties({ '2.3.GL1.30': '1', '2.3.GL2.34': '1', '2.3.GL3.43': '1', '2.3.GL4.53': '4' }),
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
export const wisselgeld = {
  id: 'geld-wisselgeld', titel: 'Wisselgeld berekenen', pictogram: 'schrijven', decimaal: true,
  opdracht: 'Lees goed. Hoeveel krijg je terug? Schrijf het bedrag op de lijn.',
  doelen: ['2.3.GL1.28', '2.3.GL2.32', '2.3.GL3.41', '2.3.GL4.52'], keuzes: [NIVEAU_KEUZE],
  opties: niveauOpties({ '2.3.GL1.28': '1', '2.3.GL2.32': '2', '2.3.GL3.41': '3', '2.3.GL4.52': '4' }),
  genereer({ seed, aantal, gebied, opties }) {
    const niveau = Number((opties && opties.niveau) || 1), stap = STAP[niveau];
    const biljetten = BETAALD.filter(b => b <= gebied);
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      if (!biljetten.length) return null;
      const betaald = biljetten[r.geheel(0, biljetten.length - 1)];
      const prijs = stap * r.geheel(1, (betaald * 100) / stap - 1);
      const terug = betaald * 100 - prijs;
      const tekst = `Je betaalt ${bedrag(betaald * 100, 100)}. Het kost ${bedrag(prijs, stap)}.`;
      return {
        tekst: `${tekst} Hoeveel krijg je terug?  ____`, breed: true, antwoord: bedrag(terug, stap),
        volledig: `${tekst} Je krijgt ${bedrag(terug, stap)} terug.`, getallen: [betaald, prijs / 100, terug / 100],
        sleutel: `${betaald}/${prijs}`, moeilijkheid: [stap === 100 ? 0 : stap === 50 ? 1 : stap === 10 ? 2 : 3, aantalCijfers(betaald), prijs],
        data: { type: 'wissel', betaald, prijs, terug },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ euro en eurocent omzetten */
export const geldOmzetten = maakOmzetten({
  id: 'geld-omzetten', titel: 'Euro en eurocent omzetten', opdracht: 'Reken het geld om. Schrijf het antwoord op de lijn.',
  maat: 'geld', factor: { cent: 1, euro: 100 }, volgorde: ['euro', 'cent'],
  doelkaart: { '2.3.GL2.31': ['euro', 'cent'] }, standaard: ['euro', 'cent'],
});
