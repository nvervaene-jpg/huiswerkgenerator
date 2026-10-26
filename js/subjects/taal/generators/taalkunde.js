// Oefenvormen voor zinsoorten (punt, vraagteken, uitroepteken), alfabet, synoniemen en antoniemen,
// en persoonsvorm en onderwerp. De gegevens staan in ../woorden/taalkunde.js.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from '../../wiskunde/generators/hulp.js';
import { woordenVerbinden } from '../svg.js';
import { ZINSOORTEN, ALFABET_WOORDEN, SYNONIEMEN, ANTONIEMEN, PERSOONSVORM_ZINNEN } from '../woorden/taalkunde.js';

const NBSP = ' ';
export const kies = (r, l) => l[r.geheel(0, l.length - 1)];
export const basisOefening = (o) => ({ getallen: [], breed: true, familie: o.kern, ...o });

// keuzes (optioneel): extra keuzes voor de leerkracht; hun waarden komen in de opties van het blok terecht.
export function vorm({ id, titel, pictogram, opdracht, doelen, rang, schaal = 1, basis = false, keuzes = null, bouw }) {
  return {
    id, titel, pictogram, opdracht, doelen, rang, schaal, basis, ...(keuzes ? { keuzes } : {}),
    opties: (doelCodes, eigen, doel) => ({ doel: doel && doelen.includes(doel) ? doel : doelCodes.find(c => doelen.includes(c)) || doelen[0], ...(keuzes ? eigen : {}) }),
    genereer({ seed, aantal, opties }) {
      const o = opties || { doel: doelen[0] }, rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => bouw(r, o)), aantal);
    },
  };
}

/* ------------------------------------------------------------------ zinsoorten */
export const ZINSOORT_NAAM = { m: 'mededelende zin', v: 'vragende zin', u: 'uitroepende zin' };
const LEESTEKEN = { m: '.', v: '?', u: '!' }, LEESTEKEN_NAAM = { '.': 'punt', '?': 'vraagteken', '!': 'uitroepteken' };
export const ZINNEN_ALLE = Object.entries(ZINSOORTEN).flatMap(([soort, l]) => l.map(zin => ({ zin, soort })));

const zinSoort = vorm({
  id: 'zs-soort', titel: 'Welke soort zin?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Welke soort zin is het? Omcirkel.', doelen: ['1.5.GL2.41'], rang: 1, basis: true,
  bouw: (r) => {
    const z = kies(r, ZINNEN_ALLE);
    return basisOefening({
      tekst: `${z.zin}\n${Object.values(ZINSOORT_NAAM).join(NBSP.repeat(5))}`, antwoord: ZINSOORT_NAAM[z.soort], volledig: `${z.zin} → ${ZINSOORT_NAAM[z.soort]}`,
      kern: z.zin, sleutel: z.zin, moeilijkheid: [z.soort === 'm' ? 0 : 1], data: { type: 'zs-soort', zin: z.zin, soort: z.soort },
    });
  },
});
const leesteken = vorm({
  id: 'zs-leesteken', titel: 'Welk leesteken?', pictogram: 'schrijven', opdracht: 'Schrijf het juiste leesteken op het einde van de zin: een punt, een vraagteken of een uitroepteken.', doelen: ['1.5.GL1.8', '1.5.GL2.42'], rang: 2,
  bouw: (r) => {
    const z = kies(r, ZINNEN_ALLE), zonder = z.zin.slice(0, -1);
    return basisOefening({
      tekst: `${zonder}${NBSP.repeat(2)}____`, antwoord: LEESTEKEN[z.soort], volledig: `${z.zin} (${LEESTEKEN_NAAM[LEESTEKEN[z.soort]]})`,
      kern: z.zin, sleutel: `l${z.zin}`, moeilijkheid: [z.soort === 'm' ? 0 : 1], data: { type: 'zs-leesteken', zin: z.zin, zonder, soort: z.soort },
    });
  },
});

/* ------------------------------------------------------------------ alfabet */
export const ALFABET = 'abcdefghijklmnopqrstuvwxyz';
const alfabetLetters = vorm({
  id: 'az-letters', titel: 'Het alfabet aanvullen', pictogram: 'schrijven', opdracht: 'Welke letters ontbreken? Schrijf ze op de lijnen.', doelen: ['1.5.GL2.12'], rang: 1, basis: true,
  bouw: (r) => {
    const lengte = 6, start = r.geheel(0, 26 - lengte), reeks = ALFABET.slice(start, start + lengte).split('');
    const aantalGaten = r.geheel(1, 2), gaten = r.schud([1, 2, 3, 4]).slice(0, aantalGaten).sort((a, b) => a - b);
    const tekst = reeks.map((l, i) => (gaten.includes(i) ? '__' : l)).join(NBSP.repeat(3));
    return basisOefening({
      tekst, antwoord: gaten.map(i => reeks[i]).join(', '), volledig: reeks.join(' '), kern: reeks.join(''), familie: `${start}|${gaten}`,
      sleutel: `${start}|${gaten}`, moeilijkheid: [aantalGaten], data: { type: 'az-letters', reeks, gaten },
    });
  },
});
const alfabetWoorden = vorm({
  id: 'az-woorden', titel: 'Alfabetisch ordenen', pictogram: 'schrijven', opdracht: 'Schrijf de woorden in alfabetische volgorde (zoals in een woordenboek).', doelen: ['1.5.GL3.10'], rang: 2, schaal: 0.67,
  bouw: (r) => {
    const zelfde = r.volgende() < 0.4;
    let gekozen;
    if (zelfde) {
      const letter = kies(r, [...new Set(ALFABET_WOORDEN.map(w => w[0]))].filter(l => ALFABET_WOORDEN.filter(w => w[0] === l).length >= 4));
      gekozen = r.schud(ALFABET_WOORDEN.filter(w => w[0] === letter)).slice(0, 4);
    } else {
      gekozen = [];
      while (gekozen.length < 4) { const w = kies(r, ALFABET_WOORDEN); if (!gekozen.some(g => g[0] === w[0])) gekozen.push(w); }
    }
    const goed = [...gekozen].sort(), getoond = r.schud(gekozen);
    if (getoond.join() === goed.join()) return null;
    return basisOefening({
      tekst: `${getoond.join(NBSP.repeat(6))}\n1. ________  2. ________  3. ________  4. ________`, antwoord: goed.join(', '), volledig: `${getoond.join(', ')} → ${goed.join(', ')}`,
      kern: [...gekozen].sort().join('/'), sleutel: [...gekozen].sort().join('/'), kernen: gekozen, moeilijkheid: [zelfde ? 1 : 0], data: { type: 'az-woorden', woorden: getoond, juist: goed, zelfdeBeginletter: zelfde },
    });
  },
});

/* ------------------------------------------------------------------ synoniemen en antoniemen */
const paren = (type) => (type === 'syn' ? SYNONIEMEN.map(([a, b]) => ({ a, b, domein: `${a}|${b}` })) : ANTONIEMEN.map(([a, b, d]) => ({ a, b, domein: d })));
function betekenisVormen(type) {
  const syn = type === 'syn', pre = syn ? 'sy' : 'an', lijst = paren(type), naam = syn ? 'synoniem' : 'antoniem';
  const doel = syn ? ['1.5.GL2.4', '1.5.GL2.3'] : ['1.5.GL3.5', '1.5.GL3.4'];
  const wat = syn ? 'ongeveer hetzelfde betekent' : 'het tegenovergestelde betekent';
  const afleiders = (r, p, aantal) => r.schud(lijst.filter(x => x.domein !== p.domein && ![x.a, x.b].some(w => [p.a, p.b].includes(w)))).slice(0, aantal);
  const kiesVorm = vorm({
    id: `${pre}-kies`, titel: `Kies het ${naam}`, pictogram: 'omcirkelen', opdracht: `Welk woord ${wat}? Omcirkel.`, doelen: doel, rang: 1, basis: true,
    bouw: (r) => {
      const p = kies(r, lijst), omgekeerd = r.volgende() < 0.5, [woord, juist] = omgekeerd ? [p.b, p.a] : [p.a, p.b];
      const opties = r.schud([juist, ...afleiders(r, p, 2).map(x => (r.volgende() < 0.5 ? x.a : x.b))]);
      if (new Set(opties).size < 3) return null;
      return basisOefening({
        tekst: `${woord}${NBSP.repeat(4)}→${NBSP.repeat(4)}${opties.join(NBSP.repeat(6))}`, antwoord: juist, volledig: `${woord} → ${juist}`,
        kern: `${p.a}|${p.b}`, sleutel: `${woord}|${opties.slice().sort().join()}`, moeilijkheid: [0], data: { type: `${pre}-kies`, woord, juist, opties, soort: type },
      });
    },
  });
  const verbind = vorm({
    id: `${pre}-verbinden`, titel: 'Verbinden', pictogram: 'verbinden', opdracht: `Verbind de woorden die ${wat}. Trek een lijn.`, doelen: doel, rang: 2, schaal: 0.34,
    bouw: (r) => {
      const gekozen = [];
      for (let t = 0; t < 40 && gekozen.length < 4; t++) { const p = kies(r, lijst); if (!gekozen.some(g => g.domein === p.domein || [g.a, g.b].some(w => [p.a, p.b].includes(w)))) gekozen.push(p); }
      if (gekozen.length < 4) return null;
      const richting = gekozen.map(() => r.volgende() < 0.5), linksW = gekozen.map((p, i) => (richting[i] ? p.a : p.b)), juistW = gekozen.map((p, i) => (richting[i] ? p.b : p.a));
      const orde = r.schud([0, 1, 2, 3]);
      const pr = gekozen.map((_, i) => [i, orde.indexOf(i)]);
      if (pr.every(([a, b]) => a === b)) return null;
      const rechts = orde.map(i => juistW[i]);
      const antwoord = linksW.map((w, i) => `${w} - ${juistW[i]}`).join('; ');
      return {
        tekst: '', svg: woordenVerbinden(linksW, rechts, pr), antwoordSvg: woordenVerbinden(linksW, rechts, pr, true), breed: true, antwoord, volledig: `Verbonden: ${antwoord}`,
        getallen: [], sleutel: [...linksW].sort().join('/'), kernen: gekozen.map(p => `${p.a}|${p.b}`), moeilijkheid: [1],
        data: { type: `${pre}-verbind`, paren: linksW.map((w, i) => [w, juistW[i]]), soort: type },
      };
    },
  });
  return [kiesVorm, verbind];
}

/* ------------------------------------------------------------------ persoonsvorm en onderwerp */
const persoonsvorm = vorm({
  id: 'ps-persoonsvorm', titel: 'De persoonsvorm', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Omcirkel de persoonsvorm en schrijf hem op de lijn.', doelen: ['1.5.GL4.25', '1.5.GL4.24'], rang: 1, basis: true, schaal: 0.84,
  bouw: (r) => {
    const z = kies(r, PERSOONSVORM_ZINNEN);
    return basisOefening({
      tekst: `${z.tekst}\nPersoonsvorm: ____________`, antwoord: z.pv, volledig: `${z.tekst} → persoonsvorm: ${z.pv}`, kern: z.tekst, sleutel: `p${z.tekst}`, moeilijkheid: [0],
      data: { type: 'ps-pv', zin: z.tekst, pv: z.pv },
    });
  },
});
const onderwerp = vorm({
  id: 'ps-onderwerp', titel: 'Het onderwerp', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Wie of wat doet het? Schrijf het onderwerp op de lijn.', doelen: ['1.5.GL4.26', '1.5.GL4.24'], rang: 2, schaal: 0.84,
  bouw: (r) => {
    const z = kies(r, PERSOONSVORM_ZINNEN);
    return basisOefening({
      tekst: `${z.tekst}\nOnderwerp: ____________`, antwoord: z.onderwerp, volledig: `${z.tekst} → onderwerp: ${z.onderwerp}`, kern: z.tekst, sleutel: `o${z.tekst}`, moeilijkheid: [1],
      data: { type: 'ps-ond', zin: z.tekst, onderwerp: z.onderwerp },
    });
  },
});

export const TAALKUNDE_VORMEN = [zinSoort, leesteken, alfabetLetters, alfabetWoorden, ...betekenisVormen('syn'), ...betekenisVormen('ant'), persoonsvorm, onderwerp];
