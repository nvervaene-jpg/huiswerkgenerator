// Extra oefenvormen voor lengtematen. Ze delen één kern (een omzetting zoals 3 m = 300 cm),
// zodat dezelfde omzetting nooit in twee blokken op één blad terugkomt.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat, aantalCijfers } from './hulp.js';
import { FACTOR, VOLGORDE } from './lengte.js';
import { eenhedenVoorDoelen, kernOmzet } from './maten.js';
import { EENHEDEN_PER_DOEL as OMZET_KAART } from './lengtematen-omzetten.js';
import { EENHEDEN_VERGELIJKEN as VERGELIJK_KAART } from './meten.js';
import { meetlatKleur, verbinden, tabel, lijnTekenen, PX_PER_CM } from '../svg.js';
import { THEMAS, THEMA_KEUZES, NAMEN, REFERENTIE_LENGTE } from '../contexten.js';

const MAAT = 'lengte';
const kies = (r, lijst) => lijst[r.geheel(0, lijst.length - 1)];
const label = (v, e) => `${v} ${e}`;
const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
const NBSP = ' ';
const naarCm = (v, e) => (v * FACTOR[e]) / 10;                 // FACTOR rekent in mm, de thema's in cm
const eenhedenVan = (opties) => (opties && opties.eenheden && opties.eenheden.length > 1 ? opties.eenheden : ['m', 'dm', 'cm']);
const SUPERLATIEF = { lang: 'langst', hoog: 'hoogst', breed: 'breedst' };
const REF_KAART = {
  '2.3.GL1.15': ['m', 'cm'], '2.3.GL2.18': ['m', 'dm', 'cm'], '2.3.GL3.21': ['km', 'm', 'dm', 'cm'], '2.3.GL4.26': ['km', 'm', 'dm', 'cm', 'mm'],
};
const METEN_DOELEN = ['2.3.GL2.21', '2.3.GL3.24'];
const THEMA_KEUZE = { id: 'thema', label: 'Thema voor de zinnetjes', type: 'select', opties: THEMA_KEUZES, standaard: 'gemengd' };

// Een omzetting met getallen binnen het gebied: v a = w b (bv. 3 m = 300 cm).
function omzetting(r, eenheden, gebied) {
  const a = kies(r, eenheden), b = kies(r, eenheden);
  if (a === b) return null;
  const omhoog = FACTOR[a] < FACTOR[b];
  const ratio = omhoog ? FACTOR[b] / FACTOR[a] : FACTOR[a] / FACTOR[b];
  const max = Math.floor(gebied / ratio);
  if (!Number.isInteger(ratio) || max < 1) return null;
  const n = r.geheel(1, max);
  const k = omhoog ? { a, v: n * ratio, b, w: n } : { a, v: n, b, w: n * ratio };
  return { ...k, ratio, omhoog, kern: kernOmzet(MAAT, a, b, k.v, k.w), moeilijkheid: Math.log10(ratio) + (omhoog ? 0.5 : 0) };
}

// Een foutief antwoord dat een leerling kan geven (x10, :10, nabij).
function foutAntwoord(r, w, gebied) {
  const kandidaten = [w * 10, w / 10, w * 10, w / 10, w + 1, w - 1, w * 2].filter(x => Number.isInteger(x) && x >= 1 && x <= gebied && x !== w);
  return kandidaten.length ? kies(r, kandidaten) : null;
}

function vorm({ id, titel, pictogram = 'schrijven', opdracht, kaart, rang, schaal = 1, keuzes, bouw }) {
  return {
    id, titel, pictogram, opdracht, rang, schaal, basis: false,
    doelen: Array.isArray(kaart) ? kaart : Object.keys(kaart),
    ...(keuzes ? { keuzes } : {}),
    opties: (doelCodes, k = {}) => ({ eenheden: Array.isArray(kaart) ? ['m', 'dm', 'cm'] : eenhedenVoorDoelen(VOLGORDE, kaart, doelCodes), thema: k.thema || 'gemengd' }),
    genereer({ seed, aantal, gebied, opties }) {
      const rng = maakRng(seed);
      const eenheden = eenhedenVan(opties);
      return resultaat(trek(rng, aantal, (r) => bouw(r, { gebied, eenheden, opties: opties || {} })), aantal);
    },
  };
}

/* ------------------------------------------------------------------ ordenen */
export const lengtematenOrdenen = vorm({
  id: 'lengtematen-ordenen', titel: 'Lengtematen ordenen', kaart: VERGELIJK_KAART, rang: 4, schaal: 0.67,
  opdracht: 'Zet de lengtes in de juiste volgorde. Het teken wijst de richting aan.',
  bouw(r, { gebied, eenheden }) {
    const n = r.volgende() < 0.4 ? 4 : 3;
    const basis = r.geheel(1, gebied) * FACTOR[kies(r, eenheden)];
    const items = [];
    for (let i = 0; i < n; i++) {
      const u = kies(r, eenheden), v = Math.round((basis * (0.3 + r.volgende() * 2.2)) / FACTOR[u]);
      if (v < 1 || v > gebied) return null;
      items.push({ v, u, cm: v * FACTOR[u] });
    }
    if (new Set(items.map(i => i.cm)).size < n || new Set(items.map(i => label(i.v, i.u))).size < n) return null;
    const stijgend = r.volgende() < 0.5, teken = stijgend ? '<' : '>';
    const juist = [...items].sort((x, y) => (stijgend ? x.cm - y.cm : y.cm - x.cm));
    const door = r.schud(items);
    if (door.every((x, i) => x === juist[i])) return null;
    const antwoord = juist.map(i => label(i.v, i.u)).join(` ${teken} `);
    return {
      tekst: `${door.map(i => label(i.v, i.u)).join('   ')}   →   ${Array(n).fill('____').join(` ${teken} `)}`,
      antwoord, volledig: `${door.map(i => label(i.v, i.u)).join(' ')} → ${antwoord}`, breed: true,
      getallen: items.map(i => i.v), sleutel: [...items].sort((x, y) => x.cm - y.cm).map(i => label(i.v, i.u)).join('/'),
      moeilijkheid: [n, aantalCijfers(Math.max(...items.map(i => i.v)))], data: { type: 'orden-maat', items: door.map(({ v, u }) => ({ v, u })), stijgend },
    };
  },
});

/* ------------------------------------------------------------------ verbinden */
export const lengtematenVerbinden = vorm({
  id: 'lengtematen-verbinden', titel: 'Gelijke lengtes verbinden', pictogram: 'verbinden', kaart: OMZET_KAART, rang: 5, schaal: 0.34,
  opdracht: 'Verbind de lengtes die even lang zijn. Trek een lijn.',
  bouw(r, { gebied, eenheden }) {
    const paren = [], kernen = new Set(), labels = new Set();
    for (let t = 0; t < 40 && paren.length < 4; t++) {
      const k = omzetting(r, eenheden, gebied);
      if (!k || kernen.has(k.kern)) continue;
      const l = label(k.v, k.a), rr = label(k.w, k.b);
      if (labels.has(l) || labels.has(rr)) continue;
      kernen.add(k.kern); labels.add(l); labels.add(rr); paren.push(k);
    }
    if (paren.length < 4) return null;
    const orde = r.schud([0, 1, 2, 3]);
    const koppels = paren.map((_, i) => [i, orde.indexOf(i)]);
    if (koppels.every(([a, b]) => a === b)) return null;
    const links = paren.map(p => label(p.v, p.a)), rechts = orde.map(i => label(paren[i].w, paren[i].b));
    const antwoord = paren.map(p => `${label(p.v, p.a)} = ${label(p.w, p.b)}`).join('; ');
    return {
      tekst: '', svg: verbinden(links, rechts, koppels), antwoordSvg: verbinden(links, rechts, koppels, true), breed: true,
      antwoord, volledig: `Verbonden: ${antwoord}`, getallen: paren.flatMap(p => [p.v, p.w]),
      sleutel: [...links].sort().join('/'), kernen: paren.map(p => p.kern), moeilijkheid: [Math.max(...paren.map(p => p.moeilijkheid))],
      data: { type: 'verbind-maat', paren: paren.map(({ v, a, w, b }) => ({ v, a, w, b })) },
    };
  },
});

/* ------------------------------------------------------------------ juist of fout */
export const lengtematenJuistFout = vorm({
  id: 'lengtematen-juist-fout', titel: 'Juist of fout', pictogram: 'omcirkelen', kaart: OMZET_KAART, rang: 3,
  opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied, eenheden }) {
    const k = omzetting(r, eenheden, gebied);
    if (!k) return null;
    const juist = r.volgende() < 0.5;
    const w = juist ? k.w : foutAntwoord(r, k.w, gebied);
    if (w === null) return null;
    const bewering = `${label(k.v, k.a)} = ${label(w, k.b)}`;
    return {
      tekst: `${bewering}${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`, antwoord: juist ? 'juist' : 'fout',
      volledig: `${bewering}: ${juist ? 'juist' : `fout (juist is ${label(k.v, k.a)} = ${label(k.w, k.b)})`}`,
      getallen: [k.v, w], sleutel: bewering, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, juist ? 0 : 1],
      data: { type: 'juistfout-maat', v: k.v, a: k.a, w, b: k.b, juist },
    };
  },
});

/* ------------------------------------------------------------------ meerkeuze */
export const lengtematenMeerkeuze = vorm({
  id: 'lengtematen-meerkeuze', titel: 'Meerkeuze', pictogram: 'omcirkelen', kaart: OMZET_KAART, rang: 3,
  opdracht: 'Kies het juiste antwoord. Omcirkel de letter.',
  bouw(r, { gebied, eenheden }) {
    const k = omzetting(r, eenheden, gebied);
    if (!k) return null;
    const fout = new Set();
    for (let t = 0; t < 8 && fout.size < 2; t++) { const f = foutAntwoord(r, k.w, gebied); if (f !== null) fout.add(f); }
    if (fout.size < 2) return null;
    const opties = [k.w, ...fout].sort((x, y) => x - y);
    const juist = opties.indexOf(k.w), letters = ['a', 'b', 'c'];
    const vraag = `Hoeveel ${k.b} is ${label(k.v, k.a)}?`;
    return {
      tekst: `${vraag}${NBSP.repeat(4)}${opties.map((o, i) => `${letters[i]})${NBSP}${o}`).join(NBSP.repeat(5))}`, breed: true,
      antwoord: `${letters[juist]}) ${label(k.w, k.b)}`, volledig: `${vraag} Antwoord: ${letters[juist]}) ${label(k.w, k.b)}`,
      getallen: [k.v, ...opties], sleutel: `${k.v}${k.a}>${k.b}`, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, 1],
      data: { type: 'meerkeuze-maat', v: k.v, a: k.a, b: k.b, opties, juist },
    };
  },
});

/* ------------------------------------------------------------------ tabel aanvullen */
export const lengtematenTabel = vorm({
  id: 'lengtematen-tabel', titel: 'Tabel aanvullen', kaart: OMZET_KAART, rang: 4, schaal: 0.34,
  opdracht: 'Vul de tabel aan. In elke rij staat een lengte in een andere eenheid.',
  bouw(r, { gebied, eenheden }) {
    const grootte = Math.min(eenheden.length, r.volgende() < 0.5 ? 3 : 2);
    const start = r.geheel(0, eenheden.length - grootte);
    const kol = eenheden.slice(start, start + grootte);
    const ratio = FACTOR[kol[0]] / FACTOR[kol[kol.length - 1]];
    const max = Math.floor(gebied / ratio);
    if (!Number.isInteger(ratio) || max < 2) return null;
    const aantalRijen = Math.min(max, 3 + (r.volgende() < 0.4 ? 1 : 0));
    const bases = r.schud([...Array(max).keys()].map(i => i + 1)).slice(0, aantalRijen).sort((x, y) => x - y);
    const vol = bases.map(n => kol.map(e => (n * FACTOR[kol[0]]) / FACTOR[e]));
    const gegeven = vol.map(() => r.geheel(0, kol.length - 1));
    const leeg = vol.map((rij, i) => rij.map((v, c) => (c === gegeven[i] ? v : null)));
    const antwoord = vol.map(rij => rij.map((v, c) => label(v, kol[c])).join(' = ')).join('; ');
    return {
      tekst: '', svg: tabel(kol, leeg), antwoordSvg: tabel(kol, leeg, vol), breed: true,
      antwoord, volledig: `Tabel: ${antwoord}`, getallen: vol.flat(), sleutel: `${kol.join()}:${bases.join()}:${gegeven.join()}`,
      kernen: bases.map(n => kernOmzet(MAAT, kol[0], kol[kol.length - 1], n * ratio, n)), moeilijkheid: [Math.log10(ratio), kol.length],
      data: { type: 'tabel-maat', kolommen: kol, rijen: vol, gegeven },
    };
  },
});

/* ------------------------------------------------------------------ fout zoeken en verbeteren */
export const lengtematenFoutZoeken = vorm({
  id: 'lengtematen-fout-zoeken', titel: 'Fout zoeken en verbeteren', pictogram: 'omcirkelen', kaart: OMZET_KAART, rang: 7, schaal: 0.67,
  opdracht: 'Zoek de fout. Schrijf het juiste antwoord op de lijn.',
  bouw(r, { gebied, eenheden }) {
    if (r.volgende() < 0.5) {                                                // een foute zin verbeteren
      const k = omzetting(r, eenheden, gebied), w = k && foutAntwoord(r, k.w, gebied);
      if (!k || w === null) return null;
      const naam = kies(r, NAMEN);
      return {
        tekst: `${naam} schrijft: ${label(k.v, k.a)} = ${label(w, k.b)}. Dat is fout.\nVerbeter: ${label(k.v, k.a)} = ____ ${k.b}`, breed: true,
        antwoord: label(k.w, k.b), volledig: `${naam} schrijft: ${label(k.v, k.a)} = ${label(w, k.b)}. Juist is: ${label(k.v, k.a)} = ${label(k.w, k.b)}`,
        getallen: [k.v, w, k.w], sleutel: `a${label(k.v, k.a)}=${label(w, k.b)}`, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, 0],
        data: { type: 'fout-maat', variant: 'verbeter', zinnen: [{ v: k.v, a: k.a, w, b: k.b }], fout: 0, juist: k.w },
      };
    }
    const zinnen = [], kernen = new Set();                                    // welke van de drie zinnen is fout?
    for (let t = 0; t < 30 && zinnen.length < 3; t++) {
      const k = omzetting(r, eenheden, gebied);
      if (!k || kernen.has(k.kern)) continue;
      kernen.add(k.kern); zinnen.push({ ...k, juistW: k.w });
    }
    if (zinnen.length < 3) return null;
    const fout = r.geheel(0, 2), w = foutAntwoord(r, zinnen[fout].w, gebied);
    if (w === null) return null;
    zinnen[fout] = { ...zinnen[fout], w };
    const letters = ['a', 'b', 'c'];
    const regels = zinnen.map((z, i) => `${letters[i]}) ${label(z.v, z.a)} = ${label(z.w, z.b)}`);
    const z = zinnen[fout];
    return {
      tekst: `Eén van deze zinnen is fout. Omcirkel de foute zin.\n${regels.join('\n')}\nDe juiste zin: ________________________`, breed: true,
      antwoord: `${letters[fout]}) ${label(z.v, z.a)} = ${label(z.juistW, z.b)}`, volledig: `Fout: ${regels[fout]}. Juist is ${label(z.v, z.a)} = ${label(z.juistW, z.b)}`,
      getallen: zinnen.flatMap(x => [x.v, x.w]), sleutel: `b${regels.join('|')}`, kernen: zinnen.map(x => x.kern), moeilijkheid: [Math.max(...zinnen.map(x => x.moeilijkheid)), 1],
      data: { type: 'fout-maat', variant: 'kies', zinnen: zinnen.map(({ v, a, w, b }) => ({ v, a, w, b })), fout, juist: z.juistW },
    };
  },
});

/* ------------------------------------------------------------------ vraagstukje */
const objecten = (thema) => (thema && THEMAS[thema] ? THEMAS[thema].lengte : Object.values(THEMAS).flatMap(t => t.lengte));
export const lengtematenVraagstuk = vorm({
  id: 'lengtematen-vraagstuk', titel: 'Vraagstukje', kaart: OMZET_KAART, rang: 8, schaal: 0.67, keuzes: [THEMA_KEUZE],
  opdracht: 'Lees goed en los op. Schrijf het antwoord op de lijn.',
  bouw(r, { gebied, eenheden, opties }) {
    const lijst = objecten(opties.thema === 'gemengd' ? null : opties.thema);
    if (r.volgende() < 0.3) {                                                // twee voorwerpen vergelijken
      const o1 = kies(r, lijst), o2 = kies(r, lijst);
      if (o1 === o2 || o1.dim !== o2.dim) return null;
      const lengte = (o) => {
        const u = kies(r, eenheden), cm = o.cm[0] + r.volgende() * (o.cm[1] - o.cm[0]), v = Math.round((cm * 10) / FACTOR[u]);
        return v >= 1 && v <= gebied && naarCm(v, u) >= o.cm[0] * 0.9 && naarCm(v, u) <= o.cm[1] * 1.1 ? { v, u, cm: naarCm(v, u), o } : null;
      };
      const l1 = lengte(o1), l2 = lengte(o2);
      if (!l1 || !l2 || l1.cm === l2.cm) return null;
      const winnaar = l1.cm > l2.cm ? l1 : l2;
      const zinnen = [l1, l2].map(l => `${hoofd(l.o.onderwerp)} is ${label(l.v, l.u)} ${l.o.dim}.`).join(' ');
      return {
        tekst: `${zinnen} Wat is het ${SUPERLATIEF[o1.dim]}?  ____`, breed: true, antwoord: winnaar.o.bepaald,
        volledig: `${zinnen} Het ${SUPERLATIEF[o1.dim]} is ${winnaar.o.bepaald}.`, getallen: [l1.v, l2.v],
        sleutel: `v${o1.onderwerp}${l1.v}${l1.u}/${o2.onderwerp}${l2.v}${l2.u}`, moeilijkheid: [1.5, 1],
        data: { type: 'vraag-vergelijk', items: [l1, l2].map(l => ({ v: l.v, u: l.u, naam: l.o.bepaald })), winnaar: winnaar.o.bepaald },
      };
    }
    for (let t = 0; t < 30; t++) {                                           // omzetten in een context
      const k = omzetting(r, eenheden, gebied), o = kies(r, lijst);
      if (!k) continue;
      const cm = naarCm(k.v, k.a);
      if (cm < o.cm[0] * 0.9 || cm > o.cm[1] * 1.1) continue;
      const naarLinks = r.volgende() < 0.5;                                   // gegeven in a of in b
      const [gv, ge, vraag, antw] = naarLinks ? [k.v, k.a, k.b, k.w] : [k.w, k.b, k.a, k.v];
      const zin = `${hoofd(o.onderwerp)} is ${label(gv, ge)} ${o.dim}. Hoeveel ${vraag} is dat?`;
      return {
        tekst: `${zin}  ____ ${vraag}`, breed: true, antwoord: label(antw, vraag), volledig: `${zin} ${label(antw, vraag)}`,
        getallen: [k.v, k.w], sleutel: `o${o.onderwerp}${k.v}${k.a}${naarLinks}`, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, 1],
        data: { type: 'vraag-omzet', v: k.v, a: k.a, w: k.w, b: k.b, naarLinks },
      };
    }
    return null;
  },
});

/* ------------------------------------------------------------------ welke eenheid past? */
export const lengtematenEenheid = vorm({
  id: 'lengtematen-eenheid', titel: 'Welke eenheid past?', pictogram: 'omcirkelen', kaart: REF_KAART, rang: 2, schaal: 1, keuzes: [THEMA_KEUZE],
  opdracht: 'Welke maat past? Omcirkel de juiste eenheid.',
  bouw(r, { gebied, eenheden, opties }) {
    const items = REFERENTIE_LENGTE.filter(i => eenheden.includes(i.eenheid) && i.getal <= gebied && (opties.thema === 'gemengd' || i.thema === opties.thema));
    if (!items.length) return null;
    const item = kies(r, items);
    const andere = r.schud(eenheden.filter(e => e !== item.eenheid)).slice(0, 2);
    const keuze = [item.eenheid, ...andere].sort((x, y) => VOLGORDE.indexOf(y) - VOLGORDE.indexOf(x));
    return {
      tekst: `${hoofd(item.onderwerp)} is ongeveer ${item.getal} ____ ${item.dim}.${NBSP.repeat(4)}Omcirkel:${NBSP.repeat(3)}${keuze.join(NBSP.repeat(5))}`, breed: true,
      antwoord: item.eenheid, volledig: `${hoofd(item.onderwerp)} is ongeveer ${item.getal} ${item.eenheid} ${item.dim}.`,
      getallen: [item.getal], sleutel: `${item.onderwerp}${item.getal}`, moeilijkheid: [VOLGORDE.length - VOLGORDE.indexOf(item.eenheid), item.getal],
      data: { type: 'eenheid-maat', getal: item.getal, eenheid: item.eenheid, opties: keuze },
    };
  },
});

/* ------------------------------------------------------------------ balk kleuren en lijn tekenen */
const meetlatLengte = (gebied) => (gebied <= 10 ? 10 : gebied <= 20 ? 20 : 30);
export const lengtematenKleuren = vorm({
  id: 'lengtematen-kleuren', titel: 'Balk kleuren op de meetlat', pictogram: 'kleuren', kaart: METEN_DOELEN, rang: 5, schaal: 0.5,
  opdracht: 'Kleur de balk. Kijk goed naar de meetlat.',
  bouw(r, { gebied }) {
    const lat = meetlatLengte(gebied), van = r.volgende() < 0.6 ? 0 : r.geheel(1, lat - 2), tot = r.geheel(van + 1, lat);
    const { leeg, oplossing } = meetlatKleur({ lengte: lat, van, tot });
    const tekst = van === 0 ? `Kleur de balk tot ${tot} cm.` : `Kleur de balk van ${van} cm tot ${tot} cm.`;
    return {
      tekst, svg: leeg, antwoordSvg: oplossing, breed: true, antwoord: `${tot - van} cm`,
      volledig: `${tekst} De balk is ${tot - van} cm lang.`, getallen: [van, tot, lat], sleutel: `${van}-${tot}`, moeilijkheid: [van > 0 ? 1 : 0, tot - van],
      data: { type: 'kleur-balk', van, tot, lat },
    };
  },
});

export const lengtematenTekenen = vorm({
  id: 'lengtematen-tekenen', titel: 'Een lijn tekenen', pictogram: 'tekenen', kaart: METEN_DOELEN, rang: 6, schaal: 0.5,
  opdracht: 'Teken de lijn met je liniaal. Begin bij het bolletje.',
  bouw(r, { gebied }) {
    const cm = r.geheel(1, Math.min(15, gebied));
    return {
      tekst: `Teken een lijn van ${cm} cm.`, svg: lijnTekenen({ cm }), antwoordSvg: lijnTekenen({ cm, oplossing: true }), breed: true,
      antwoord: `${cm} cm`, volledig: `Een lijn van ${cm} cm (op ware grootte: ${(cm * PX_PER_CM / 96 * 2.54).toFixed(0)} mm per ${cm} cm).`.replace(/ \(op ware grootte.*\)\./, '.'),
      getallen: [cm], sleutel: `${cm}`, moeilijkheid: [cm], data: { type: 'teken-lijn', cm },
    };
  },
});

export const LENGTE_VORMEN = [
  lengtematenOrdenen, lengtematenVerbinden, lengtematenJuistFout, lengtematenMeerkeuze, lengtematenTabel,
  lengtematenFoutZoeken, lengtematenVraagstuk, lengtematenEenheid, lengtematenKleuren, lengtematenTekenen,
];
