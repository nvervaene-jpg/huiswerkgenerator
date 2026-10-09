// Tijd: klok aflezen en tekenen, tijdsduur omzetten en berekenen, dagen van de week.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat, hoogste } from './hulp.js';
import { maakOmzetten, maakVergelijken } from './maten.js';
import { maatVormen } from './maat-vormen.js';
import { REFERENTIE_TIJD } from '../contexten.js';
import { klok } from '../svg.js';

export const tijd = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

/* ------------------------------------------------------------------ klok aflezen en tekenen */
export const PRECISIES = ['uur', 'halfuur', 'kwartier', 'vijf', 'minuut'];
export const PRECISIE_PER_DOEL = { '2.3.GL1.41': 'uur', '2.3.GL2.42': 'halfuur', '2.3.GL3.50': 'minuut', '2.3.GL4.58': 'minuut' };
export const PRECISIE_KEUZE = {
  id: 'nauwkeurigheid', groep: 'klok', label: 'Nauwkeurigheid', type: 'select',
  opties: [['auto', 'Volgens de gekozen doelen'], ['uur', 'Hele uren'], ['halfuur', 'Hele en halve uren'], ['kwartier', 'Kwartieren'], ['vijf', 'Per 5 minuten'], ['minuut', 'Op de minuut']],
  standaard: 'auto',
};
export const precisieOpties = (doelCodes, keuzes = {}) => ({
  precisie: keuzes.nauwkeurigheid && keuzes.nauwkeurigheid !== 'auto' ? keuzes.nauwkeurigheid : hoogste(doelCodes, PRECISIE_PER_DOEL, PRECISIES, 'uur'),
});
export const MINUTEN = {
  uur: [0], halfuur: [0, 30], kwartier: [0, 15, 30, 45],
  vijf: Array.from({ length: 12 }, (_, i) => i * 5), minuut: Array.from({ length: 60 }, (_, i) => i),
};
export const klasse = (m) => (m === 0 ? 0 : m === 30 ? 1 : m % 15 === 0 ? 2 : m % 5 === 0 ? 3 : 4);

// Kiest een tijdstip; uren en minuten blijven binnen het getallengebied.
export function kiesTijd(r, gebied, precisie) {
  const uren = Array.from({ length: Math.min(12, gebied) }, (_, i) => i + 1);
  let set = MINUTEN[precisie];
  if (precisie === 'minuut' && r.volgende() < 0.5) set = MINUTEN.vijf;
  set = set.filter(m => m <= gebied);
  if (!uren.length || !set.length) return null;
  return { h: uren[r.geheel(0, uren.length - 1)], m: set[r.geheel(0, set.length - 1)] };
}

export const klokAflezen = {
  id: 'klok-aflezen', titel: 'Klok aflezen', pictogram: 'schrijven',
  opdracht: 'Hoe laat is het? Schrijf de tijd op de lijn.',
  doelen: Object.keys(PRECISIE_PER_DOEL), keuzes: [PRECISIE_KEUZE], opties: precisieOpties,
  genereer({ seed, aantal, gebied, opties }) {
    const precisie = (opties && opties.precisie) || 'uur';
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const t = kiesTijd(r, gebied, precisie);
      if (!t) return null;
      return { tekst: 'Hoe laat is het?  ____\u00A0:\u00A0____', svg: klok(t), antwoord: tijd(t.h, t.m), volledig: `Het is ${tijd(t.h, t.m)}.`,
        getallen: [t.h, t.m], sleutel: tijd(t.h, t.m), moeilijkheid: [klasse(t.m), t.h], data: { type: 'klok', ...t } };
    });
    return resultaat(lijst, aantal);
  },
};

export const klokTekenen = {
  id: 'klok-tekenen', titel: 'Wijzers tekenen op de klok', pictogram: 'tekenen',
  opdracht: 'Teken de wijzers op de klok. De kleine wijzer is kort, de grote wijzer is lang.',
  doelen: ['2.3.GL3.50', '2.3.GL4.58'], keuzes: [PRECISIE_KEUZE], opties: precisieOpties,
  genereer({ seed, aantal, gebied, opties }) {
    const precisie = (opties && opties.precisie) || 'uur';
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const t = kiesTijd(r, gebied, precisie);
      if (!t) return null;
      const groot = t.m % 5 === 0 ? `de ${t.m === 0 ? 12 : t.m / 5}` : `${t.m} minuten`;
      const klein = t.m === 0 ? `op de ${t.h}` : `tussen de ${t.h} en de ${(t.h % 12) + 1}`;
      return { tekst: `Teken: ${tijd(t.h, t.m)}`, svg: klok({}), antwoord: tijd(t.h, t.m),
        volledig: `${tijd(t.h, t.m)}: grote wijzer op ${groot}, kleine wijzer ${klein}.`,
        getallen: [t.h, t.m], sleutel: tijd(t.h, t.m), moeilijkheid: [klasse(t.m), t.h], data: { type: 'klok-teken', ...t } };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ tijdsduur omzetten */
export const FACTOR = { s: 1, min: 60, uur: 3600, dag: 86400 };
const TIJD_VOLGORDE = ['dag', 'uur', 'min', 's'];
const TIJD_OMZET = {
  '2.3.GL1.47': ['dag', 'uur'], '2.3.GL2.45': ['dag', 'uur', 'min'], '2.3.GL3.53': ['dag', 'uur', 'min'],
  '2.3.GL4.59': ['dag', 'uur', 'min', 's'], '2.3.GL4.61': ['uur', 'min', 's'],
};
export const tijdsduurOmzetten = maakOmzetten({
  id: 'tijdsduur-omzetten', titel: 'Tijdsduur omzetten', opdracht: 'Reken de tijd om. Schrijf het antwoord op de lijn.',
  maat: 'tijd', factor: FACTOR, volgorde: TIJD_VOLGORDE, doelkaart: TIJD_OMZET, standaard: ['uur', 'min'],
});
const TIJD_VERGELIJK = { '2.3.GL2.45': ['dag', 'uur', 'min'], '2.3.GL3.53': ['dag', 'uur', 'min'], '2.3.GL4.59': ['dag', 'uur', 'min', 's'], '2.3.GL4.61': ['uur', 'min', 's'] };
export const tijdsduurVergelijken = maakVergelijken({
  id: 'tijdsduur-vergelijken', titel: 'Tijdsduur vergelijken', opdracht: 'Vergelijk de tijden. Schrijf <, > of = op de lijn.',
  maat: 'tijd', factor: FACTOR, volgorde: TIJD_VOLGORDE, doelkaart: TIJD_VERGELIJK, standaard: ['uur', 'min'],
});
const hoofdT = (t) => t[0].toUpperCase() + t.slice(1);
export const TIJDSDUUR_VORMEN = maatVormen({
  prefix: 'tijdsduur', maat: 'tijd', factor: FACTOR, volgorde: TIJD_VOLGORDE, standaard: ['uur', 'min'], meervoud: 'tijden',
  kaarten: { omzet: TIJD_OMZET, vergelijk: TIJD_VERGELIJK, ref: { '2.3.GL2.44': ['uur', 'min'], '2.3.GL3.52': ['uur', 'min'], '2.3.GL4.59': ['dag', 'uur', 'min', 's'] } },
  ctx: { sleutel: 'min', eenheid: 'min', zin: (o, v, e) => `${hoofdT(o.onderwerp)} duurt ${v} ${e}.`, superlatief: () => 'Wat duurt het langst?', zelfdeSoort: () => true },
  referentie: REFERENTIE_TIJD,
  refZin: (i) => `${hoofdT(i.onderwerp)} duurt ongeveer ${i.getal} ____.`,
});

/* ------------------------------------------------------------------ tijdsduur berekenen */
export const duurTekst = (min) => (min >= 60 ? `${Math.floor(min / 60)} u${min % 60 ? ` ${min % 60} min` : ''}` : `${min} min`);
export const wikkel = (h) => ((h - 1) % 12) + 1;
export const tijdsduurBerekenen = {
  id: 'tijdsduur-berekenen', titel: 'Tijdsduur berekenen', pictogram: 'schrijven',
  opdracht: 'Reken uit hoe lang het duurt of hoe laat het dan is. Schrijf het antwoord op de lijn.',
  doelen: ['2.3.GL4.63'],
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    const kwartieren = [0, 15, 30, 45].filter(m => m <= gebied);
    const lijst = trek(rng, aantal, (r) => {
      if (!kwartieren.length) return null;
      const h1 = r.geheel(1, Math.min(12, gebied)), m1 = kwartieren[r.geheel(0, kwartieren.length - 1)];
      const duur = 15 * r.geheel(1, 12);                                  // 15 min t.e.m. 3 uur
      const einde = h1 * 60 + m1 + duur, h2 = wikkel(Math.floor(einde / 60)), m2 = einde % 60;
      if (h2 > gebied || m2 > gebied) return null;
      const delen = [Math.floor(duur / 60), duur % 60];
      const getallen = [h1, m1, h2, m2, ...(duur >= 60 ? delen.filter(Boolean) : [duur])];
      if (getallen.some(g => g > gebied)) return null;
      const naarEinde = r.volgende() < 0.5;
      const rij = { getallen, moeilijkheid: [duur >= 60 ? 1 : 0, naarEinde ? 0 : 1, duur], data: { type: 'tijdsduur', h1, m1, duur, naarEinde, h2, m2 } };
      return naarEinde
        ? { ...rij, tekst: `Het begint om ${tijd(h1, m1)} en duurt ${duurTekst(duur)}. Hoe laat is het gedaan?  ____\u00A0:\u00A0____`, antwoord: tijd(h2, m2),
            volledig: `Het begint om ${tijd(h1, m1)} en duurt ${duurTekst(duur)}. Het is gedaan om ${tijd(h2, m2)}.`, sleutel: `e${h1}:${m1}+${duur}`, breed: true }
        : { ...rij, tekst: `Het begint om ${tijd(h1, m1)} en is gedaan om ${tijd(h2, m2)}. Hoe lang duurt het?  ____`, antwoord: duurTekst(duur),
            volledig: `Het begint om ${tijd(h1, m1)} en is gedaan om ${tijd(h2, m2)}. Het duurt ${duurTekst(duur)}.`, sleutel: `d${h1}:${m1}+${duur}`, breed: true };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ dagen van de week */
export const DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
export const zin = (n) => ({
  '-1': 'Gisteren was het', '-2': 'Eergisteren was het', 1: 'Morgen is het', 2: 'Overmorgen is het',
}[n] || (n > 0 ? `Over ${n} dagen is het` : `${-n} dagen geleden was het`));
export const dagenBerekenen = {
  id: 'dagen-berekenen', titel: 'Dagen van de week', pictogram: 'schrijven',
  opdracht: 'Lees goed. Schrijf de dag op de lijn.',
  doelen: ['2.3.GK3.38', '2.3.GL1.34', '2.3.GL2.48', '2.3.GL3.55'],
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    const maxSprong = Math.min(6, gebied);
    const lijst = trek(rng, aantal, (r) => {
      const dag = r.geheel(0, 6);
      const sprong = r.geheel(1, maxSprong) * (r.volgende() < 0.5 ? 1 : -1);
      const doel = DAGEN[(((dag + sprong) % 7) + 7) % 7];
      return { tekst: `Vandaag is het ${DAGEN[dag]}. ${zin(sprong)} ____.`, antwoord: doel,
        volledig: `Vandaag is het ${DAGEN[dag]}. ${zin(sprong)} ${doel}.`, getallen: [Math.abs(sprong)], sleutel: `${dag}/${sprong}`,
        moeilijkheid: [Math.abs(sprong), sprong < 0 ? 1 : 0], data: { type: 'dag', dag: DAGEN[dag], sprong } };
    });
    return resultaat(lijst, aantal);
  },
};
