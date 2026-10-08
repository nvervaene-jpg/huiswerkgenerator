// Oefenvormen voor 'verenkelen en verdubbelen' (meervouden van woorden met een korte of lange klinker).
//   verdubbelen: man -> mannen   (korte klinker: de medeklinker komt er bij)
//   verenkelen : maan -> manen   (lange klinker: er valt een klinker weg)
// De woorden staan in ../woorden/verenkelen-verdubbelen.js en mogen door de leerkracht aangevuld worden.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from '../../wiskunde/generators/hulp.js';
import { WOORDEN, foutMeervoud } from '../woorden/verenkelen-verdubbelen.js';
import { woordenVerbinden, woordenVakjes } from '../svg.js';

export const DOELEN = ['1.3.GL2.27', '1.3.GL3.16', '1.3.GL4.18', '1.3.GL4.19'];
const NIVEAU = { '1.3.GL2.27': ['L2'], '1.3.GL3.16': ['L3'], '1.3.GL4.18': ['L4'], '1.3.GL4.19': ['L3', 'L4'] };
const NBSP = ' ', GETALWOORDEN = ['drie', 'vier', 'vijf', 'zes', 'zeven'];
const ZINNEN = [
  'Op de foto zie ik {n} {w}.', 'In de klas liggen {n} {w}.', 'Ik heb {n} {w} getekend.', 'Wij zagen {n} {w}.',
  'Er zijn {n} {w}.', 'In het boek staan {n} {w}.', 'Op school telden we {n} {w}.', 'Juf heeft {n} {w} meegebracht.',
];
const kies = (r, lijst) => lijst[r.geheel(0, lijst.length - 1)];
const BLANCO = '__________';

const past = {                                    // welke woorden horen bij een niveau
  L2: (w) => w.lettergrepen === 2 && w.frequent,
  L3: (w) => w.lettergrepen === 2,
  L4: (w) => w.lettergrepen >= 3,
};
export function woordenVoor({ niveaus = ['L2', 'L3', 'L4'], regel = 'beide' } = {}) {
  return WOORDEN.filter(w => niveaus.some(n => past[n](w)) && (regel === 'beide' || w.soort === regel));
}

export const KEUZES = [{
  id: 'regel', groep: 'verenkelen-verdubbelen', label: 'Welke regel oefenen?', type: 'select', standaard: 'beide',
  opties: [['beide', 'Verenkelen en verdubbelen door elkaar'], ['verdubbelen', 'Enkel verdubbelen (man - mannen)'], ['verenkelen', 'Enkel verenkelen (maan - manen)']],
}];

// Kiest een woord; wisselt tussen de twee regels af zodat een blok beide soorten bevat.
function woord(r, pool) {
  const soort = r.volgende() < 0.5 ? 'verdubbelen' : 'verenkelen';
  const kandidaten = pool.filter(w => w.soort === soort);
  return kies(r, kandidaten.length ? kandidaten : pool);
}
const basisOefening = (w, o) => ({
  getallen: [], kern: w.enkelvoud, familie: w.enkelvoud, sleutel: w.enkelvoud, moeilijkheid: [w.lettergrepen, w.soort === 'verenkelen' ? 1 : 0],
  ...o,
});
const gegevens = (w) => ({ enkelvoud: w.enkelvoud, meervoud: w.meervoud, delen: w.delen, soort: w.soort });

function vorm({ id, titel, pictogram, opdracht, rang, schaal = 1, basis = false, bouw }) {
  return {
    id: `vv-${id}`, titel, pictogram, opdracht, doelen: DOELEN, rang, schaal, basis, keuzes: KEUZES,
    opties: (doelCodes, eigen, doel) => ({                       // het blok volgt het niveau van zijn eigen doel
      niveaus: [...new Set((doel && NIVEAU[doel] ? [doel] : doelCodes.filter(c => NIVEAU[c])).flatMap(c => NIVEAU[c]))],
      regel: eigen.regel || 'beide',
    }),
    genereer({ seed, aantal, opties }) {
      const rng = maakRng(seed), pool = woordenVoor(opties && opties.niveaus && opties.niveaus.length ? opties : { ...opties, niveaus: undefined });
      if (!pool.length) return { oefeningen: [], waarschuwing: 'Geen woorden beschikbaar voor deze keuze.' };
      const res = resultaat(trek(rng, aantal, (r) => bouw(r, pool)), aantal);
      if (res.waarschuwing) res.waarschuwing = `Er zijn maar ${res.oefeningen.length} verschillende oefeningen mogelijk met de woordenlijst voor deze keuze.`;
      return res;
    },
  };
}

const invullen = vorm({
  id: 'invullen', titel: 'Meervoud schrijven', pictogram: 'schrijven', opdracht: 'Schrijf het meervoud op de lijn.', rang: 1, basis: true,
  bouw: (r, pool) => {
    const w = woord(r, pool);
    return basisOefening(w, {
      tekst: `één ${w.enkelvoud}${NBSP.repeat(3)}→${NBSP.repeat(3)}twee ${BLANCO}`, breed: true, antwoord: w.meervoud, volledig: `één ${w.enkelvoud}, twee ${w.meervoud}`,
      data: { type: 'tw-invullen', ...gegevens(w) },
    });
  },
});

const zin = vorm({
  id: 'zin', titel: 'Zin aanvullen', pictogram: 'schrijven', opdracht: 'Schrijf het woord tussen haakjes in het meervoud. Vul de zin aan.', rang: 2, schaal: 0.84,
  bouw: (r, pool) => {
    const w = woord(r, pool), n = kies(r, GETALWOORDEN), sjabloon = kies(r, ZINNEN);
    return basisOefening(w, {
      tekst: sjabloon.replace('{n}', n).replace('{w}', `${BLANCO} (${w.enkelvoud})`), breed: true, antwoord: w.meervoud,
      volledig: sjabloon.replace('{n}', n).replace('{w}', w.meervoud), data: { type: 'tw-zin', ...gegevens(w), n },
    });
  },
});

const kiesJuiste = vorm({
  id: 'kies', titel: 'Kies het juiste woord', pictogram: 'omcirkelen', opdracht: 'Welk woord is juist gespeld? Omcirkel het.', rang: 3,
  bouw: (r, pool) => {
    const w = woord(r, pool), fout = foutMeervoud(w), juistEerst = r.volgende() < 0.5;
    const opties = juistEerst ? [w.meervoud, fout] : [fout, w.meervoud];
    return basisOefening(w, {
      tekst: `één ${w.enkelvoud}, twee${NBSP.repeat(3)}${opties[0]}${NBSP.repeat(6)}of${NBSP.repeat(6)}${opties[1]}`, breed: true, antwoord: w.meervoud,
      volledig: `één ${w.enkelvoud}, twee ${w.meervoud} (niet ${fout})`, data: { type: 'tw-kies', ...gegevens(w), opties, juist: juistEerst ? 0 : 1 },
    });
  },
});

const juistFout = vorm({
  id: 'juist-fout', titel: 'Juist of fout', pictogram: 'omcirkelen', opdracht: 'Is het woord juist gespeld? Omcirkel juist of fout.', rang: 3, schaal: 1,
  bouw: (r, pool) => {
    const w = woord(r, pool), juist = r.volgende() < 0.5, getoond = juist ? w.meervoud : foutMeervoud(w);
    return basisOefening(w, {
      tekst: `één ${w.enkelvoud}, twee ${getoond}${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`, breed: true, antwoord: juist ? 'juist' : 'fout',
      volledig: `één ${w.enkelvoud}, twee ${getoond}: ${juist ? 'juist' : `fout (juist is ${w.meervoud})`}`,
      moeilijkheid: [w.lettergrepen, w.soort === 'verenkelen' ? 1 : 0, juist ? 0 : 1],
      sleutel: `${w.enkelvoud}|${juist}`, data: { type: 'tw-juistfout', ...gegevens(w), getoond, juist },
    });
  },
});

const regel = vorm({
  id: 'regel', titel: 'Verdubbelen of verenkelen?', pictogram: 'omcirkelen', opdracht: 'Wat gebeurt er in het meervoud? Omcirkel verdubbelen of verenkelen.', rang: 4,
  bouw: (r, pool) => {
    const w = woord(r, pool);
    return basisOefening(w, {
      tekst: `één ${w.enkelvoud} → twee ${w.meervoud}${NBSP.repeat(6)}verdubbelen${NBSP.repeat(4)}verenkelen`, breed: true, antwoord: w.soort,
      volledig: `${w.enkelvoud} → ${w.meervoud}: ${w.soort}`, data: { type: 'tw-regel', ...gegevens(w) },
    });
  },
});

const lettergrepen = vorm({
  id: 'lettergrepen', titel: 'Lettergrepen', pictogram: 'schrijven', opdracht: 'Schrijf het meervoud. Zet een streepje tussen de lettergrepen.', rang: 4,
  bouw: (r, pool) => {
    const w = woord(r, pool);
    return basisOefening(w, {
      tekst: `één ${w.enkelvoud}${NBSP.repeat(3)}→${NBSP.repeat(3)}twee ${BLANCO}`, breed: true, antwoord: w.delen.join('-'), volledig: `één ${w.enkelvoud}, twee ${w.delen.join('-')}`,
      data: { type: 'tw-lettergrepen', ...gegevens(w) },
    });
  },
});

const verbind = vorm({
  id: 'verbinden', titel: 'Verbinden', pictogram: 'verbinden', opdracht: 'Verbind elk woord met zijn meervoud. Trek een lijn.', rang: 5, schaal: 0.34,
  bouw: (r, pool) => {
    const gekozen = [], soorten = new Set();
    for (let t = 0; t < 60 && gekozen.length < 4; t++) {
      const w = woord(r, pool);
      if (!gekozen.some(g => g.enkelvoud === w.enkelvoud) && !gekozen.some(g => g.meervoud === w.meervoud)) { gekozen.push(w); soorten.add(w.soort); }
    }
    if (gekozen.length < 4) return null;
    const orde = r.schud([0, 1, 2, 3]);
    const paren = gekozen.map((_, i) => [i, orde.indexOf(i)]);
    if (paren.every(([a, b]) => a === b)) return null;
    const links = gekozen.map(w => w.enkelvoud), rechts = orde.map(i => gekozen[i].meervoud);
    const antwoord = gekozen.map(w => `${w.enkelvoud} - ${w.meervoud}`).join('; ');
    return {
      tekst: '', svg: woordenVerbinden(links, rechts, paren), antwoordSvg: woordenVerbinden(links, rechts, paren, true), breed: true,
      antwoord, volledig: `Verbonden: ${antwoord}`, getallen: [], sleutel: [...links].sort().join('/'), kernen: gekozen.map(w => w.enkelvoud),
      moeilijkheid: [Math.max(...gekozen.map(w => w.lettergrepen))],
      data: { type: 'tw-verbind', woorden: gekozen.map(gegevens) },
    };
  },
});

const kleuren = vorm({
  id: 'kleuren', titel: 'Kleuren', pictogram: 'kleuren', opdracht: 'Kleur het vakje groen als het meervoud juist gespeld is.', rang: 6, schaal: 0.5,
  bouw: (r, pool) => {
    const gekozen = [];
    for (let t = 0; t < 60 && gekozen.length < 6; t++) {
      const w = woord(r, pool);
      if (!gekozen.some(g => g.enkelvoud === w.enkelvoud)) gekozen.push(w);
    }
    if (gekozen.length < 6) return null;
    const juist = r.schud([0, 1, 2, 3, 4, 5]).slice(0, r.geheel(2, 4)).sort((a, b) => a - b);
    const teksten = gekozen.map((w, i) => `${w.enkelvoud} - ${juist.includes(i) ? w.meervoud : foutMeervoud(w)}`);
    return {
      tekst: '', svg: woordenVakjes(teksten), antwoordSvg: woordenVakjes(teksten, juist, true), breed: true,
      antwoord: juist.map(i => teksten[i]).join('; '), volledig: `Juist gespeld (groen): ${juist.map(i => teksten[i]).join('; ')}`,
      getallen: [], sleutel: gekozen.map(w => w.enkelvoud).sort().join('/'), kernen: gekozen.map(w => w.enkelvoud),
      moeilijkheid: [Math.max(...gekozen.map(w => w.lettergrepen)), 1],
      data: { type: 'tw-kleuren', woorden: gekozen.map((w, i) => ({ ...gegevens(w), getoond: teksten[i].split(' - ')[1], juist: juist.includes(i) })) },
    };
  },
});

const foutZoeken = vorm({
  id: 'fout-zoeken', titel: 'Fout zoeken en verbeteren', pictogram: 'omcirkelen', opdracht: 'Zoek de fout. Schrijf het juiste woord op de lijn.', rang: 7, schaal: 0.67,
  bouw: (r, pool) => {
    if (r.volgende() < 0.5) {                                                // een woord in een zin verbeteren
      const w = woord(r, pool), n = kies(r, GETALWOORDEN), sjabloon = kies(r, ZINNEN), fout = foutMeervoud(w);
      return basisOefening(w, {
        tekst: `${sjabloon.replace('{n}', n).replace('{w}', `${fout} (${w.enkelvoud})`)}\nHet meervoud is fout geschreven. Schrijf het juist: ${BLANCO}`, breed: true,
        antwoord: w.meervoud, volledig: `${fout} moet ${w.meervoud} zijn`, sleutel: `a${w.enkelvoud}`,
        data: { type: 'tw-fout', variant: 'verbeter', woorden: [{ ...gegevens(w), getoond: fout }], fout: 0, juist: w.meervoud },
      });
    }
    const gekozen = [];                                                      // welke van de drie rijtjes is fout?
    for (let t = 0; t < 40 && gekozen.length < 3; t++) { const w = woord(r, pool); if (!gekozen.some(g => g.enkelvoud === w.enkelvoud)) gekozen.push(w); }
    if (gekozen.length < 3) return null;
    const fout = r.geheel(0, 2), letters = ['a', 'b', 'c'];
    const rijtjes = gekozen.map((w, i) => `${letters[i]}) ${w.enkelvoud} - ${i === fout ? foutMeervoud(w) : w.meervoud}`);
    return {
      tekst: `Eén meervoud is fout geschreven. Omcirkel het foute rijtje.\n${rijtjes.join('\n')}\nHet juiste meervoud: ${BLANCO}`, breed: true,
      antwoord: `${rijtjes[fout]} → ${gekozen[fout].meervoud}`, volledig: `Fout: ${rijtjes[fout]}. Juist is ${gekozen[fout].meervoud}`,
      getallen: [], sleutel: `b${rijtjes.join('|')}`, kernen: gekozen.map(w => w.enkelvoud), moeilijkheid: [Math.max(...gekozen.map(w => w.lettergrepen)), 1],
      data: { type: 'tw-fout', variant: 'kies', woorden: gekozen.map((w, i) => ({ ...gegevens(w), getoond: i === fout ? foutMeervoud(w) : w.meervoud })), fout, juist: gekozen[fout].meervoud },
    };
  },
});

export const VERENKELEN_VERDUBBELEN_VORMEN = [invullen, zin, kiesJuiste, juistFout, regel, lettergrepen, verbind, kleuren, foutZoeken];
