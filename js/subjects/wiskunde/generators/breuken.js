// Breuken als deel van een geheel (echte breuken): het stappenplan, noteren, meerkeuze, kleuren en juist/fout.
// De tekeningen komen uit ../breuk-svg.js: een cirkel, een strook of een raster, verdeeld in gelijke delen.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { kies, NBSP } from './stelling-vormen.js';
import { figuur, figuurMogelijk, FIGUREN, breukStappenplan, breukNoteren, breukFiguur } from '../breuk-svg.js';

// Welke noemers bij welk doel horen (Op.stap: noemer ≤ 20; hier bewust klein gehouden).
export const NOEMERS_PER_DOEL = {
  '2.1.GL2.25': [2, 4], '2.1.GL3.25': [2, 3, 4, 5, 6, 8], '2.1.GL3.29': [2, 3, 4, 5, 6, 8],
  '2.1.GL4.33': [2, 3, 4, 5, 6, 8, 10, 12], '2.1.GL4.37': [2, 3, 4, 5, 6, 8, 10, 12],
};
export const BREUK_DOELEN = Object.keys(NOEMERS_PER_DOEL);
const FIGUUR_KEUZE = {
  id: 'figuur', groep: 'breuken', label: 'Soort tekening', type: 'select', standaard: 'gemengd',
  opties: [['gemengd', 'Door elkaar'], ['cirkel', 'Cirkel'], ['rechthoek', 'Strook'], ['raster', 'Raster (twee rijen)']],
};
const VOORBEELD_KEUZE = {
  id: 'voorbeeld', groep: 'breuken', label: 'Eerste opgave als voorbeeld invullen (stappenplan)', type: 'select', standaard: 'ja',
  opties: [['ja', 'Ja'], ['nee', 'Nee']],
};
const opties = (doelCodes, eigen = {}, doel = null) => {
  const codes = doel && NOEMERS_PER_DOEL[doel] ? [doel] : doelCodes.filter(c => NOEMERS_PER_DOEL[c]);
  const noemers = [...new Set(codes.flatMap(c => NOEMERS_PER_DOEL[c]))].sort((a, b) => a - b);
  return { noemers: noemers.length ? noemers : NOEMERS_PER_DOEL['2.1.GL3.25'], figuur: eigen.figuur || 'gemengd', voorbeeld: eigen.voorbeeld || 'ja' };
};
const FIGUUR_NAAM = { cirkel: 'cirkel', rechthoek: 'rechthoek', raster: 'rechthoek' };
const gelijk = (a, b, c, d) => a * d === b * c;

// Trekt een noemer, een teller en een tekening (echte breuk: 1 ≤ teller < noemer).
function trekBreuk(r, gebied, o) {
  const noemers = (o.noemers || NOEMERS_PER_DOEL['2.1.GL3.25']).filter(n => n <= gebied);
  if (!noemers.length) return null;
  const n = kies(r, noemers), t = r.geheel(1, n - 1);
  const mogelijk = (o.figuur && o.figuur !== 'gemengd' ? [o.figuur] : FIGUREN).filter(f => figuurMogelijk(f, n));
  if (!mogelijk.length) return null;
  return { n, t, soort: kies(r, mogelijk) };
}
const gemeenschappelijk = (b) => ({ getallen: [b.t, b.n], moeilijkheid: [b.n, FIGUREN.indexOf(b.soort)], breed: true });

function maakVorm({ id, titel, pictogram = 'schrijven', opdracht, rang, schaal = 0.5, basis = false, keuzes, bouw, voorbeeld = false }) {
  return {
    id, titel, pictogram, opdracht, doelen: BREUK_DOELEN, rang, schaal, basis, keuzes, opties, voorbeeld,
    genereer({ seed, aantal, gebied, opties: o }) {
      const rng = maakRng(seed), opt = o || opties(BREUK_DOELEN);
      return resultaat(trek(rng, aantal, (r) => { const b = trekBreuk(r, gebied, opt); return b && bouw(r, b, opt); }), aantal);
    },
  };
}

const stappenplan = maakVorm({
  id: 'breuk-stappenplan', titel: 'Breuk: stappenplan', opdracht: 'Vul het stappenplan verder aan.', rang: 1, basis: true, voorbeeld: true, keuzes: [FIGUUR_KEUZE, VOORBEELD_KEUZE],
  bouw: (r, b) => ({
    tekst: '', svg: breukStappenplan({ ...b }), voorbeeldSvg: breukStappenplan({ ...b, ingevuld: true, kleur: '#111', voorbeeld: true }), antwoordSvg: breukStappenplan({ ...b, ingevuld: true }),
    antwoord: `${b.t}/${b.n}`, volledig: `Geheel: 1 ${FIGUUR_NAAM[b.soort]} · verdeeld in ${b.n} gelijke delen · ${b.t} ${b.t === 1 ? 'deel' : 'delen'} genomen → ${b.t}/${b.n}`,
    sleutel: `${b.soort}|${b.t}/${b.n}`, kern: `breuk:${b.t}/${b.n}:${b.soort}`, ...gemeenschappelijk(b), data: { type: 'breuk-stappen', ...b },
  }),
});
const noteren = maakVorm({
  id: 'breuk-noteren', titel: 'Breuk noteren', opdracht: 'Welk deel is gekleurd? Schrijf de breuk in het kader.', rang: 2, keuzes: [FIGUUR_KEUZE],
  bouw: (r, b) => ({
    tekst: '', svg: breukNoteren({ ...b }), antwoordSvg: breukNoteren({ ...b, ingevuld: true }), antwoord: `${b.t}/${b.n}`, volledig: `${b.t}/${b.n}`,
    sleutel: `${b.soort}|${b.t}/${b.n}`, kern: `breuk:${b.t}/${b.n}:${b.soort}`, ...gemeenschappelijk(b), data: { type: 'breuk-noteren', ...b },
  }),
});
// Foute breuken bij een tekening: de ongekleurde delen, gekleurd tegenover ongekleurd, of één deel te veel of te weinig.
export function afleiders(b) {
  const kand = [[b.n - b.t, b.n], [b.t, b.n - b.t], [b.t + 1, b.n], [b.t - 1, b.n], [b.t, b.n + 1], [b.t, b.n - 1]];
  const uit = [];
  for (const [t, n] of kand) if (t >= 1 && n >= 2 && t < n && !gelijk(t, n, b.t, b.n) && !uit.some(([x, y]) => x === t && y === n)) uit.push([t, n]);
  return uit;
}
const meerkeuze = maakVorm({
  id: 'breuk-meerkeuze', titel: 'Breuk: meerkeuze', pictogram: 'omcirkelen', opdracht: 'Welk deel is gekleurd? Omcirkel de letter.', rang: 3, keuzes: [FIGUUR_KEUZE],
  bouw: (r, b) => {
    const fout = r.schud(afleiders(b)).slice(0, 2);
    if (fout.length < 2) return null;
    const lijst = r.schud([[b.t, b.n], ...fout]), juist = lijst.findIndex(([t, n]) => t === b.t && n === b.n);
    return {
      tekst: `Welk deel is gekleurd?\n${lijst.map(([t, n], i) => `${'abc'[i]})${NBSP}${t}/${n}`).join(NBSP.repeat(5))}`, svg: breukFiguur({ ...b }),
      antwoord: `${'abc'[juist]}) ${b.t}/${b.n}`, volledig: `${b.t}/${b.n} (${'abc'[juist]})`, sleutel: `${b.soort}|${b.t}/${b.n}|${lijst.map(x => x.join('/')).join()}`, kern: `breuk:${b.t}/${b.n}:${b.soort}`,
      ...gemeenschappelijk(b), data: { type: 'breuk-mk', ...b, opties: lijst, juist },
    };
  },
});
const kleuren = maakVorm({
  id: 'breuk-kleuren', titel: 'Breuk kleuren', pictogram: 'kleuren', opdracht: 'Kleur het deel van de figuur dat bij de breuk hoort.', rang: 4, keuzes: [FIGUUR_KEUZE],
  bouw: (r, b) => ({
    tekst: `Kleur ${b.t}/${b.n} van de figuur.`, svg: breukFiguur({ ...b, t: 0 }), antwoordSvg: breukFiguur({ ...b }), antwoord: `${b.t} van de ${b.n} delen gekleurd`, volledig: `${b.t} van de ${b.n} delen gekleurd (${b.t}/${b.n})`,
    sleutel: `${b.soort}|${b.t}/${b.n}`, kern: `breuk:${b.t}/${b.n}:${b.soort}`, ...gemeenschappelijk(b), data: { type: 'breuk-kleur', ...b },
  }),
});
const juistFout = maakVorm({
  id: 'breuk-juist-fout', titel: 'Breuk: juist of fout', pictogram: 'omcirkelen', opdracht: 'Klopt de breuk bij het gekleurde deel? Omcirkel juist of fout.', rang: 3, keuzes: [FIGUUR_KEUZE],
  bouw: (r, b) => {
    const juist = r.volgende() < 0.5, fouten = afleiders(b);
    if (!juist && !fouten.length) return null;
    const [t, n] = juist ? [b.t, b.n] : kies(r, fouten);
    return {
      tekst: `Het gekleurde deel is ${t}/${n}.${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`, svg: breukFiguur({ ...b }), antwoord: juist ? 'juist' : 'fout',
      volledig: `${t}/${n}: ${juist ? 'juist' : `fout (juist is ${b.t}/${b.n})`}`, sleutel: `${b.soort}|${b.t}/${b.n}|${t}/${n}`, kern: `breuk:${b.t}/${b.n}:${b.soort}`,
      ...gemeenschappelijk(b), moeilijkheid: [b.n, FIGUREN.indexOf(b.soort), juist ? 0 : 1], data: { type: 'breuk-jf', ...b, genoemd: [t, n], juist },
    };
  },
});

export const BREUK_VORMEN = [stappenplan, noteren, meerkeuze, kleuren, juistFout];
