// Gedeelde oefenvormen voor 'stellingen': links = rechts, bv. 3 m = 300 cm of 27 + 8 = 35.
// Elke familie (lengte, gewicht, optellen, ...) levert een kern (zie hieronder); deze fabriek maakt er vier vormen van:
// juist of fout, meerkeuze, verbinden en fout zoeken en verbeteren.
//
// kern = {
//   data:      { soort, ... }  gegevens waarmee een test de stelling onafhankelijk kan narekenen
//   links:     '3 m' of '27 + 8'
//   eenheid:   'cm' of '' (komt achter het getal rechts)
//   w:         het juiste getal rechts
//   getallen:  alle getallen die links staan (voor de controle op het getallengebied)
//   kern:      sleutel die voorkomt dat dezelfde kern in twee blokken op één blad staat
//   moeilijkheid: getal
//   vraag:     de vraag bij meerkeuze, bv. 'Hoeveel cm is 3 m?'
//   fouten:    (r, gebied) => lijst met typische foute antwoorden
// }
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { verbinden } from '../svg.js';
import { NAMEN } from '../contexten.js';

export const NBSP = ' ';
export const kies = (r, lijst) => lijst[r.geheel(0, lijst.length - 1)];
export const rechts = (kern, w) => (kern.eenheid ? `${w} ${kern.eenheid}` : `${w}`);
export const stelling = (kern, w) => `${kern.links} = ${rechts(kern, w)}`;

// Een fout antwoord dat een leerling kan geven: binnen het getallengebied en niet gelijk aan het juiste antwoord.
export function foutAntwoord(r, kern, gebied) {
  const kandidaten = [...new Set(kern.fouten(r, gebied))].filter(x => Number.isInteger(x) && x >= 1 && x <= gebied && x !== kern.w);
  return kandidaten.length ? kies(r, kandidaten) : null;
}

// Standaard foute antwoorden voor omzettingen: x10, :10, x100, :100; enkel als dat niet lukt ook dichtbij.
export const maatFouten = (w) => (r, gebied) => {
  const geldig = (x) => Number.isInteger(x) && x >= 1 && x <= gebied && x !== w;
  const typisch = [w * 10, w / 10, w * 100, w / 100].filter(geldig);
  return typisch.length >= 2 ? typisch : [...typisch, w + 1, w - 1, w * 2];
};

export function stellingVormen({ prefix, doelen, opties, keuzes, sample, rang = {}, schaal = {} }) {
  const basis = (id, titel, pictogram, opdracht, r, s, bouw) => ({
    id: `${prefix}-${id}`, titel, pictogram, opdracht, rang: r, schaal: s, basis: false, doelen,
    ...(keuzes ? { keuzes } : {}), opties,
    genereer({ seed, aantal, gebied, opties: o }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (rr) => bouw(rr, { gebied, opties: o || {} })), aantal);
    },
  });

  const juistFout = basis('juist-fout', 'Juist of fout', 'omcirkelen', 'Is dit juist of fout? Omcirkel het goede woord.', rang.juistFout ?? 3, schaal.juistFout ?? 1, (r, ctx) => {
    const k = sample(r, ctx);
    if (!k) return null;
    const juist = r.volgende() < 0.5, w = juist ? k.w : foutAntwoord(r, k, ctx.gebied);
    if (w === null) return null;
    const bewering = stelling(k, w);
    return {
      tekst: `${bewering}${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`, antwoord: juist ? 'juist' : 'fout',
      volledig: `${bewering}: ${juist ? 'juist' : `fout (juist is ${stelling(k, k.w)})`}`,
      getallen: [...k.getallen, w], sleutel: bewering, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, juist ? 0 : 1],
      data: { type: 'juistfout', kern: k.data, w, juist },
    };
  });

  const meerkeuze = basis('meerkeuze', 'Meerkeuze', 'omcirkelen', 'Kies het juiste antwoord. Omcirkel de letter.', rang.meerkeuze ?? 3, schaal.meerkeuze ?? 1, (r, ctx) => {
    const k = sample(r, ctx);
    if (!k) return null;
    const fout = new Set();
    for (let t = 0; t < 8 && fout.size < 2; t++) { const f = foutAntwoord(r, k, ctx.gebied); if (f !== null) fout.add(f); }
    if (fout.size < 2) return null;
    const lijst = [k.w, ...fout].sort((x, y) => x - y), juist = lijst.indexOf(k.w), letters = ['a', 'b', 'c'];
    return {
      tekst: `${k.vraag}${NBSP.repeat(4)}${lijst.map((o, i) => `${letters[i]})${NBSP}${o}`).join(NBSP.repeat(5))}`, breed: true,
      antwoord: `${letters[juist]}) ${rechts(k, k.w)}`, volledig: `${k.vraag} Antwoord: ${letters[juist]}) ${rechts(k, k.w)}`,
      getallen: [...k.getallen, ...lijst], sleutel: `${k.links}|${k.w}`, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, 1],
      data: { type: 'meerkeuze', kern: k.data, opties: lijst, juist },
    };
  });

  const verbind = basis('verbinden', 'Verbinden', 'verbinden', 'Verbind wat bij elkaar hoort. Trek een lijn.', rang.verbinden ?? 5, schaal.verbinden ?? 0.34, (r, ctx) => {
    const kernen = [], sleutels = new Set(), labels = new Set();
    for (let t = 0; t < 40 && kernen.length < 4; t++) {
      const k = sample(r, ctx);
      if (!k || sleutels.has(k.kern)) continue;
      const l = k.links, rr = rechts(k, k.w);
      if (labels.has(l) || labels.has(rr)) continue;
      sleutels.add(k.kern); labels.add(l); labels.add(rr); kernen.push(k);
    }
    if (kernen.length < 4) return null;
    const orde = r.schud([0, 1, 2, 3]);
    const koppels = kernen.map((_, i) => [i, orde.indexOf(i)]);
    if (koppels.every(([a, b]) => a === b)) return null;
    const links = kernen.map(k => k.links), rch = orde.map(i => rechts(kernen[i], kernen[i].w));
    const antwoord = kernen.map(k => stelling(k, k.w)).join('; ');
    return {
      tekst: '', svg: verbinden(links, rch, koppels), antwoordSvg: verbinden(links, rch, koppels, true), breed: true,
      antwoord, volledig: `Verbonden: ${antwoord}`, getallen: kernen.flatMap(k => [...k.getallen, k.w]),
      sleutel: [...links].sort().join('/'), kernen: kernen.map(k => k.kern), moeilijkheid: [Math.max(...kernen.map(k => k.moeilijkheid))],
      data: { type: 'verbind', kernen: kernen.map(k => ({ kern: k.data, w: k.w })) },
    };
  });

  const foutZoeken = basis('fout-zoeken', 'Fout zoeken en verbeteren', 'omcirkelen', 'Zoek de fout. Schrijf het juiste antwoord op de lijn.', rang.foutZoeken ?? 7, schaal.foutZoeken ?? 0.67, (r, ctx) => {
    if (r.volgende() < 0.5) {                                               // een foute zin verbeteren
      const k = sample(r, ctx), w = k && foutAntwoord(r, k, ctx.gebied);
      if (!k || w === null) return null;
      const naam = kies(r, NAMEN);
      return {
        tekst: `${naam} schrijft: ${stelling(k, w)}. Dat is fout.\nVerbeter: ${k.links} = ____${k.eenheid ? ` ${k.eenheid}` : ''}`, breed: true,
        antwoord: rechts(k, k.w), volledig: `${naam} schrijft: ${stelling(k, w)}. Juist is: ${stelling(k, k.w)}`,
        getallen: [...k.getallen, w, k.w], sleutel: `a${stelling(k, w)}`, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, 0],
        data: { type: 'fout', variant: 'verbeter', zinnen: [{ kern: k.data, w }], fout: 0, juist: k.w },
      };
    }
    const zinnen = [], sleutels = new Set();                                 // welke van de drie zinnen is fout?
    for (let t = 0; t < 30 && zinnen.length < 3; t++) {
      const k = sample(r, ctx);
      if (!k || sleutels.has(k.kern)) continue;
      sleutels.add(k.kern); zinnen.push({ k, w: k.w });
    }
    if (zinnen.length < 3) return null;
    const fout = r.geheel(0, 2), w = foutAntwoord(r, zinnen[fout].k, ctx.gebied);
    if (w === null) return null;
    zinnen[fout] = { k: zinnen[fout].k, w };
    const letters = ['a', 'b', 'c'], regels = zinnen.map((z, i) => `${letters[i]}) ${stelling(z.k, z.w)}`), z = zinnen[fout].k;
    return {
      tekst: `Eén van deze zinnen is fout. Omcirkel de foute zin.\n${regels.join('\n')}\nDe juiste zin: ________________________`, breed: true,
      antwoord: `${letters[fout]}) ${stelling(z, z.w)}`, volledig: `Fout: ${regels[fout]}. Juist is ${stelling(z, z.w)}`,
      getallen: zinnen.flatMap(x => [...x.k.getallen, x.w]), sleutel: `b${regels.join('|')}`, kernen: zinnen.map(x => x.k.kern),
      moeilijkheid: [Math.max(...zinnen.map(x => x.k.moeilijkheid)), 1],
      data: { type: 'fout', variant: 'kies', zinnen: zinnen.map(x => ({ kern: x.k.data, w: x.w })), fout, juist: z.w },
    };
  });

  return [juistFout, meerkeuze, verbind, foutZoeken];
}
