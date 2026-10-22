// Leesoefeningen: woorden lezen volgens een patroon (decoderen) en tekstbegrip (informatie, titel, doel van een tekst, tekstconventies, verbindingswoorden).
// De gegevens staan in ../woorden/lezen.js, ../woorden/klanken.js en de andere woordenlijsten.
import { vorm, kies, basisOefening } from './taalkunde.js';
import { kiesOef } from './begrippen.js';
import { KLANKEN } from '../woorden/klanken.js';
import { VERDUBBELEN, VERENKELEN } from '../woorden/verenkelen-verdubbelen.js';
import { SAMENSTELLINGEN } from '../woorden/samenstellingen.js';
import { WOORDEN as VERKLEIN } from '../woorden/verkleinwoorden.js';
import { VOORVOEGSELS, ACHTERVOEGSELS } from '../woorden/woordbouw.js';
import { LEENWOORDEN } from '../woorden/speciaal.js';
import { LEESTEKSTEN } from '../woorden/leesteksten.js';
import { LEESWOORDEN, DOELTEKSTEN, DOEL_NAMEN, CONVENTIES, CONVENTIE_DOEL, STRUCTUUR } from '../woorden/lezen.js';

const NBSP = ' ';
const jaarVan = (doel) => Number(/GL(\d)/.exec(doel || '')?.[1] || 6);

// Aantal lettergrepen: groepjes klinkers, met uitzonderingen voor -iaal, -ieel, -ueel, -eum en -ium.
export function lettergrepen(woord) {
  const groepen = (woord.match(/[aeiouyéëïü]+/g) || []).length;
  return groepen + (/(iaal|ieel|ueel|eum|ium)$/.test(woord) ? 1 : 0);
}

/* ------------------------------------------------------------------ decoderen: welke woorden bij welk doel */
const KL = (soorten, syl, klank) => ({ bron: 'klanken', soorten, syl, klank });
const VAST = (...sleutels) => ({ bron: 'vast', sleutels });
const SAM = (syl) => ({ bron: 'samenstellingen', syl });
const VERK = (soorten, syl) => ({ bron: 'verkleinwoorden', soorten, syl });
const VERD = (syl) => ({ bron: 'verdubbelen', syl });
const VERE = (syl) => ({ bron: 'verenkelen', syl });
const MORF = { bron: 'morfologie' };
const LEEN = (soort) => ({ bron: 'leenwoorden', soort });
export const LEES_DOELEN = {
  '1.2.GL1.5': VAST('mkm', 'mk', 'km'), '1.2.GL1.6': VAST('open1'), '1.2.GL3.1': VAST('open3'),
  '1.2.GL1.7': KL(['ie', 'oe', 'eu', 'ui'], [1, 2]), '1.2.GL1.8': KL(['ei', 'ij'], [1, 2]), '1.2.GL1.9': KL(['ou', 'au'], [1, 2]),
  '1.2.GL2.4': VAST('ie_oe_2'), '1.2.GL2.5': KL(['ei', 'ij'], [2, 3]), '1.2.GL2.6': KL(['ou', 'au'], [2, 3]),
  '1.2.GL1.10': KL(['aai', 'ooi', 'oei'], [1, 1]), '1.2.GL2.7': VAST('aai_2'),
  '1.2.GL1.11': KL(['eeuw', 'ieuw'], [1, 1]), '1.2.GL2.8': VAST('eeuw_2'), '1.2.GL1.23': KL(['uw'], [1, 1]), '1.2.GL2.39': VAST('uw_2'),
  '1.2.GL1.12': KL(['ng', 'nk'], [1, 1]), '1.2.GL2.9': VAST('ngnk_2'), '1.2.GL1.13': KL(['ch', 'cht'], [1, 1]), '1.2.GL2.10': VAST('cht_2'),
  '1.2.GL1.14': KL(['sch', 'schr'], [1, 1]), '1.2.GL1.15': VAST('vooraan'), '1.2.GL1.16': VAST('achteraan'), '1.2.GL1.17': VAST('beide'), '1.2.GL1.22': VAST('endD', 'endB'),
  '1.2.GL1.20': KL(['en', 'er', 'el'], [2, 2]), '1.2.GL2.11': VAST('end_end'), '1.2.GL3.2': VAST('elen_3'),
  '1.2.GL2.12': KL(['ig', 'lijk'], [2, 3]), '1.2.GL2.13': KL(['tie'], [2, 3]), '1.2.GL3.8': KL(['tie'], [2, 4]), '1.2.GL2.14': KL(['th'], [2, 2]), '1.2.GL2.15': KL(['wr'], [2, 2]),
  '1.2.GL2.17': KL(['ing'], [2, 3]), '1.2.GL3.3': KL(['y']), '1.2.GL3.4': KL(['c'], null, 's'), '1.2.GL3.5': KL(['c'], null, 'k'), '1.2.GL3.6': KL(['cc']), '1.2.GL3.7': KL(['x']),
  '1.2.GL3.12': KL(['heid', 'teit']), '1.2.GL3.13': KL(['isch']), '1.2.GL4.2': KL(['eum', 'ium']), '1.2.GL4.3': KL(['qu']), '1.2.GL4.4': KL(['iaal', 'ieel', 'ueel']),
  '1.2.GL2.40': KL(['be', 'ge', 'ver'], [2, 3]), '1.2.GL3.15': KL(['é', 'eau']),
  '1.2.GL1.24': SAM([2, 3]), '1.2.GL2.18': SAM([2, 4]), '1.2.GL1.25': VERK(['je', 'tje', 'pje'], [2, 2]), '1.2.GL2.19': VERK(['je', 'pje', 'tje', 'etje'], [2, 4]),
  '1.2.GL1.26': VERD([2, 2]), '1.2.GL2.20': VERD([2, 3]), '1.2.GL1.27': VERE([2, 2]), '1.2.GL2.21': VERE([2, 3]),
  '1.2.GL1.28': MORF, '1.2.GL2.22': MORF, '1.2.GL3.16': MORF, '1.2.GL4.9': MORF, '1.2.GL5.1': MORF, '1.2.GL6.1': MORF,
  '1.2.GL4.6': LEEN('frans'), '1.2.GL4.7': LEEN('engels'), '1.2.GL4.8': LEEN('latijn'),
};
const delenSamen = (x) => x.replace(/-/g, '');
const inSyl = (w, syl) => !syl || (lettergrepen(w) >= syl[0] && lettergrepen(w) <= syl[1]);
export function leesWoorden(doel) {
  const d = LEES_DOELEN[doel];
  if (!d) return [];
  let lijst;
  switch (d.bron) {
    case 'klanken': lijst = d.soorten.flatMap(s => (KLANKEN[s] || []).filter(r => !d.klank || r[3] === d.klank).map(r => r[0])); break;
    case 'vast': lijst = d.sleutels.flatMap(k => LEESWOORDEN[k]); break;
    case 'samenstellingen': lijst = Object.values(SAMENSTELLINGEN).flat().map(([a, b]) => a + b); break;
    case 'verkleinwoorden': lijst = VERKLEIN.filter(w => d.soorten.includes(w.soort)).map(w => w.naar); break;
    case 'verdubbelen': lijst = VERDUBBELEN.map(r => delenSamen(r[1])); break;
    case 'verenkelen': lijst = VERENKELEN.map(r => delenSamen(r[1])); break;
    case 'morfologie': lijst = [...VOORVOEGSELS, ...ACHTERVOEGSELS].map(r => r[2]); break;
    default: lijst = LEENWOORDEN[d.soort].map(r => r[0]);
  }
  return [...new Set(lijst)].filter(w => inSyl(w, d.syl));
}

export const LEES_OK = Object.keys(LEES_DOELEN).filter(c => leesWoorden(c).length >= 4);
export const ZOEK_DOELEN = LEES_OK.filter(c => LEES_DOELEN[c].bron === 'klanken' && leesWoorden(c).length >= 5);
const rij = (r, pool, n) => r.schud(pool).slice(0, n);
const lees = vorm({
  id: 'lz-lees', titel: 'Lees de woorden', pictogram: 'schrijven', opdracht: 'Lees de woorden hardop. Lees ze twee keer: de tweede keer sneller.', doelen: LEES_OK, rang: 1, basis: true, schaal: 0.8,
  bouw: (r, o) => {
    const pool = leesWoorden(o.doel);
    if (pool.length < 4) return null;
    const woorden = rij(r, pool, Math.min(6, pool.length - 1));
    return basisOefening({ tekst: woorden.join(NBSP.repeat(6)), antwoord: woorden.join(', '), volledig: `Lees: ${woorden.join(', ')}`, kern: woorden.slice().sort().join('|'), sleutel: woorden.slice().sort().join('|'), kernen: woorden, moeilijkheid: [Math.max(...woorden.map(w => w.length))], data: { type: 'lz-lees', doel: o.doel, woorden, vraag: woorden.join(' '), opties: woorden, goed: woorden.join(', ') } });
  },
});
const ALLE_KLANKWOORDEN = Object.values(KLANKEN).flat().map(r => r[0]);
const zoek = vorm({
  id: 'lz-zoek', titel: 'Welk woord heeft de letters?', pictogram: 'omcirkelen', opdracht: 'Welk woord bevat de gevraagde letters? Lees de woorden en omcirkel.', doelen: ZOEK_DOELEN, rang: 2, schaal: 0.8,
  bouw: (r, o) => {
    const d = LEES_DOELEN[o.doel], soort = kies(r, d.soorten), pool = leesWoorden(o.doel).filter(w => w.includes(soort));
    if (!pool.length) return null;
    const goed = kies(r, pool), vreemd = r.schud(ALLE_KLANKWOORDEN.filter(w => !w.includes(soort) && w.length <= 9 && inSyl(w, d.syl || [1, 3]))).slice(0, 3);
    if (vreemd.length < 3) return null;
    const opties = r.schud([goed, ...vreemd]);
    return basisOefening({ tekst: `Omcirkel het woord met ${soort}:\n${opties.join(NBSP.repeat(6))}`, antwoord: goed, volledig: `${goed} (${soort})`, kern: goed, sleutel: `${goed}|${opties.slice().sort().join()}`, kernen: [goed], moeilijkheid: [1], data: { type: 'lz-zoek', doel: o.doel, soort, goed, vraag: `Omcirkel het woord met ${soort}`, opties } });
  },
});

/* ------------------------------------------------------------------ tekstbegrip */
const tekstVan = (doel, r) => { const j = jaarVan(doel); return kies(r, LEESTEKSTEN[`L${j}`]); };
export const VRAAG_DOELEN = ['1.2.GL1.32', '1.2.GL2.26', '1.2.GL3.20', '1.2.GL4.14', '1.2.GL5.4', '1.2.GL6.4'];
const tekstVraag = vorm({
  id: 'lt-vraag', titel: 'Lees en beantwoord', pictogram: 'omcirkelen', opdracht: 'Lees de tekst. Omcirkel het juiste antwoord.', doelen: VRAAG_DOELEN, rang: 1, basis: true, schaal: 0.7,
  bouw: (r, o) => {
    const t = tekstVan(o.doel, r), v = kies(r, t.vragen);
    return kiesOef(r, { vraag: `${t.tekst}\n${v.vraag} ____`, opties: v.fout, antwoord: v.juist, kern: `${t.titel}${v.vraag}`, data: { type: 'lt-vraag', doel: o.doel, titel: t.titel, vraagTekst: v.vraag }, volledig: `${v.vraag} ${v.juist}`, moeilijkheid: 1 });
  },
});
export const TITEL_DOELEN = ['1.2.GL1.36', '1.2.GL2.30', '1.2.GL3.24', '1.2.GL4.18'];
const tekstTitel = vorm({
  id: 'lt-titel', titel: 'Welke titel past?', pictogram: 'omcirkelen', opdracht: 'Lees de tekst. Welke titel past het best bij de tekst? Omcirkel.', doelen: TITEL_DOELEN, rang: 2, schaal: 0.7,
  bouw: (r, o) => {
    const j = jaarVan(o.doel), t = tekstVan(o.doel, r), anderen = [LEESTEKSTEN[`L${j}`], LEESTEKSTEN[`L${j - 1}`], LEESTEKSTEN[`L${j + 1}`]].flat().filter(Boolean).filter(x => x.titel !== t.titel);
    return kiesOef(r, { vraag: `${t.tekst}\nWelke titel past bij de tekst? ____`, opties: r.schud(anderen).slice(0, 2).map(x => x.titel), antwoord: t.titel, kern: t.titel, data: { type: 'lt-titel', doel: o.doel, titel: t.titel }, volledig: `${t.titel}`, moeilijkheid: 1 });
  },
});
export const DOELTEKST_DOELEN = ['1.2.GL1.40', '1.2.GL2.34', '1.2.GL3.29', '1.2.GL4.23', '1.2.GL5.14', '1.2.GL6.14'];
const tekstDoel = vorm({
  id: 'lt-doel', titel: 'Waarom is de tekst geschreven?', pictogram: 'omcirkelen', opdracht: 'Lees de tekst. Waarom is de tekst geschreven? Omcirkel.', doelen: DOELTEKST_DOELEN, rang: 3, schaal: 0.7,
  bouw: (r) => {
    const doel = kies(r, Object.keys(DOELTEKSTEN)), tekst = kies(r, DOELTEKSTEN[doel]);
    return kiesOef(r, { vraag: `${tekst}\nDeze tekst is geschreven om ____`, opties: Object.keys(DOELTEKSTEN).filter(x => x !== doel).map(x => DOEL_NAMEN[x]).slice(0, 3), antwoord: DOEL_NAMEN[doel], kern: tekst, data: { type: 'lt-doel', doel, tekst }, volledig: `${tekst} → ${DOEL_NAMEN[doel]}`, moeilijkheid: 1 });
  },
});
export const CONVENTIE_DOELEN = Object.keys(CONVENTIE_DOEL);
const conventie = vorm({
  id: 'lt-conventie', titel: 'Tekstconventies', pictogram: 'omcirkelen', opdracht: 'Lees de vraag. Omcirkel het juiste woord.', doelen: CONVENTIE_DOELEN, rang: 4, schaal: 0.8,
  bouw: (r, o) => {
    const toegelaten = CONVENTIE_DOEL[o.doel], gekozen = kies(r, toegelaten), c = CONVENTIES.find(x => x.antw === gekozen), vraag = kies(r, c.vragen);
    const bekend = CONVENTIES.filter(x => x.jaar <= Math.max(jaarVan(o.doel), 3) && x.antw !== c.antw).map(x => x.antw);
    return kiesOef(r, { vraag: `${vraag} ____`, opties: r.schud(bekend.length >= 2 ? bekend : CONVENTIES.map(x => x.antw).filter(x => x !== c.antw)).slice(0, 2), antwoord: c.antw, kern: vraag, data: { type: 'lt-conventie', doel: o.doel, vraagTekst: vraag }, volledig: `${vraag} ${c.antw}`, moeilijkheid: 1 });
  },
});
export const STRUCTUUR_DOELEN = ['1.2.GL1.42', '1.2.GL2.36', '1.2.GL3.31'];
const structuur = vorm({
  id: 'lt-structuur', titel: 'Welk verbindingswoord past?', pictogram: 'omcirkelen', opdracht: 'Welk woord past in de zin? Omcirkel.', doelen: STRUCTUUR_DOELEN, rang: 5, schaal: 0.8,
  bouw: (r, o) => {
    const j = jaarVan(o.doel), lijst = STRUCTUUR.filter(x => x[3] <= j), [zin, goed, fout] = kies(r, lijst);
    return kiesOef(r, { vraag: zin, opties: fout, antwoord: goed, kern: zin, data: { type: 'lt-structuur', doel: o.doel, zin }, volledig: zin.replace('____', goed), moeilijkheid: 1 });
  },
});

export const LEZEN_VORMEN = [lees, zoek, tekstVraag, tekstTitel, tekstDoel, conventie, structuur];
