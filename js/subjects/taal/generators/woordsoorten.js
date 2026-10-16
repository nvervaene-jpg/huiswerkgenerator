// Oefenvormen voor woordsoorten: zelfstandig naamwoord, lidwoord, eigennaam, werkwoord, bijvoeglijk naamwoord,
// telwoord, voorzetsel, voegwoord en voornaamwoord. Woorden en zinnen staan in ../woorden/woordsoorten.js.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from '../../wiskunde/generators/hulp.js';
import { SOORTEN, WOORDEN, ZINNEN } from '../woorden/woordsoorten.js';

const NBSP = ' ';
const LEERJAAR2 = ['zn', 'lw', 'eig', 'ww'], LEERJAAR3 = [...LEERJAAR2, 'bn', 'tel'], LEERJAAR4 = [...LEERJAAR3, 'vz', 'vw'], LEERJAAR6 = [...LEERJAAR4, 'vnw'];
// Per doel: de woordsoort waar het om gaat (focus) en de woordsoorten die de leerlingen dan al kennen.
export const NIVEAU = {
  '1.5.GL2.28': { focus: 'zn', kennen: LEERJAAR2 }, '1.5.GL2.30': { focus: 'lw', kennen: LEERJAAR2 }, '1.5.GL2.33': { focus: 'eig', kennen: LEERJAAR2 },
  '1.5.GL2.37': { focus: 'ww', kennen: LEERJAAR2 }, '1.5.GL3.15': { focus: 'bn', kennen: LEERJAAR3 }, '1.5.GL3.19': { focus: 'tel', kennen: LEERJAAR3 },
  '1.5.GL4.11': { focus: 'vz', kennen: LEERJAAR4 }, '1.5.GL4.15': { focus: 'vw', kennen: LEERJAAR4 }, '1.5.GL6.11': { focus: 'vnw', kennen: LEERJAAR6 },
};
export const DOELEN = Object.keys(NIVEAU);
const SOORT = Object.fromEntries(SOORTEN.map((s, i) => [s.id, { ...s, rang: i }]));
const label = (id) => SOORT[id].label;

export const LOSSE_WOORDEN = Object.entries(WOORDEN).flatMap(([soort, lijst]) => lijst.map(woord => ({ woord, soort })));
// Een zin met 'zelfstandig naamwoord' als focus mag geen eigennaam bevatten: een eigennaam is ook een soort zelfstandig naamwoord.
export const ZINNEN_LIJST = ZINNEN.map((tokens, nr) => ({ nr, tokens: tokens.map(([woord, soort]) => ({ woord, soort })), tekst: tokens.map(t => t[0]).join(' ') }));

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const alsLijst = (ids) => ids.slice().sort((a, b) => SOORT[a].rang - SOORT[b].rang);
const hoofdletter = (t) => t[0].toUpperCase() + t.slice(1);
const zinMetPunt = (z, vraag) => `${z.tekst}${vraag ? '?' : '.'}`;
const keuze = (ids) => alsLijst(ids).map(label).join(NBSP.repeat(4));

// Welke soorten bij dit blok horen: het doel van het blok, of anders het eerste doel dat we kennen.
function niveauVan(codes, doel) {
  const c = doel && NIVEAU[doel] ? doel : codes.find(x => NIVEAU[x]) || DOELEN[0];
  return { doel: c, ...NIVEAU[c] };
}
const zinnenVoor = ({ focus }) => ZINNEN_LIJST.filter(z => z.tokens.some(t => t.soort === focus) && !(focus === 'zn' && z.tokens.some(t => t.soort === 'eig')));
const woordenVan = (soort) => LOSSE_WOORDEN.filter(w => w.soort === soort);
export const woordenVoor = ({ doelen: codes } = {}) => {
  const doelen = codes && codes.length ? codes.filter(c => NIVEAU[c]) : DOELEN;
  const kennen = new Set(doelen.flatMap(c => NIVEAU[c].kennen));
  return LOSSE_WOORDEN.filter(w => kennen.has(w.soort));
};

function vorm({ id, titel, pictogram, opdracht, rang, schaal = 1, basis = false, bouw }) {
  return {
    id: `ws-${id}`, titel, pictogram, opdracht, doelen: DOELEN, rang, schaal, basis,
    opties: (doelCodes, eigen, doel) => niveauVan(doelCodes, doel),
    genereer({ seed, aantal, opties }) {
      const o = opties && opties.focus ? opties : niveauVan([], null), rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => bouw(r, o)), aantal);
    },
  };
}
const basisOefening = (o) => ({ getallen: [], breed: true, familie: o.kern, ...o });

// Willekeurig woord van de focus (60 %) of van een andere bekende soort.
function trekWoord(r, { focus, kennen }) {
  const soort = r.volgende() < 0.6 ? focus : kies(r, kennen.filter(s => s !== focus));
  return kies(r, woordenVan(soort));
}

const regel = vorm({
  id: 'regel', titel: 'Welke woordsoort?', pictogram: 'omcirkelen', opdracht: 'Welke woordsoort is het woord? Omcirkel.', rang: 1, basis: true,
  bouw: (r, o) => {
    const w = trekWoord(r, o);
    const anderen = r.schud(o.kennen.filter(s => s !== w.soort)).slice(0, 3), soorten = alsLijst([w.soort, ...anderen]);
    return basisOefening({
      tekst: `${w.woord}${NBSP.repeat(4)}→${NBSP.repeat(4)}${keuze(soorten)}`, antwoord: label(w.soort), volledig: `${w.woord}: ${label(w.soort)}`,
      kern: w.woord, sleutel: w.woord, moeilijkheid: [SOORT[w.soort].rang],
      data: { type: 'ws-regel', woord: w.woord, soort: w.soort, soorten },
    });
  },
});

const ongelijk = vorm({
  id: 'ongelijk', titel: 'Welk woord hoort er niet bij?', pictogram: 'omcirkelen', opdracht: 'Drie woorden horen bij elkaar. Eén woord hoort er niet bij. Omcirkel dat woord.', rang: 2,
  bouw: (r, o) => {
    const meeste = r.volgende() < 0.5 ? o.focus : kies(r, o.kennen), vreemd = kies(r, o.kennen.filter(s => s !== meeste));
    const drie = r.schud(woordenVan(meeste)).slice(0, 3), een = kies(r, woordenVan(vreemd));
    if (drie.length < 3) return null;
    const alle = r.schud([...drie, een]);
    return basisOefening({
      tekst: alle.map(w => w.woord).join(NBSP.repeat(6)), antwoord: een.woord, volledig: `${een.woord} hoort er niet bij (de andere zijn ${SOORT[meeste].meervoud})`,
      kern: [...alle.map(w => w.woord)].sort().join('/'), sleutel: [...alle.map(w => w.woord)].sort().join('/'), kernen: alle.map(w => w.woord),
      moeilijkheid: [SOORT[meeste].rang, 1], data: { type: 'ws-ongelijk', woorden: alle.map(w => ({ woord: w.woord, soort: w.soort })), meeste, vreemd, antwoord: een.woord },
    });
  },
});

const zinOmcirkel = vorm({
  id: 'zin-onderstrepen', titel: 'In de zin onderstrepen', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Onderstreep wat gevraagd wordt.', rang: 3, schaal: 0.84,
  bouw: (r, o) => {
    const z = kies(r, zinnenVoor(o)), gevraagd = z.tokens.filter(t => t.soort === o.focus).map(t => t.woord);
    if (gevraagd.length > 3) return null;
    return basisOefening({
      tekst: `Onderstreep alle ${SOORT[o.focus].meervoud} in de zin.\n${zinMetPunt(z)}`, antwoord: gevraagd.join(', '),
      volledig: `${zinMetPunt(z)} ${hoofdletter(SOORT[o.focus].meervoud)}: ${gevraagd.join(', ')}`,
      kern: `z${z.nr}`, sleutel: `u${z.nr}`, moeilijkheid: [gevraagd.length], data: { type: 'ws-onderstrepen', zin: z.tekst, soort: o.focus, gevraagd },
    });
  },
});

const zinSoort = vorm({
  id: 'zin-soort', titel: 'Welke woordsoort in de zin?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Welke woordsoort is het woord tussen aanhalingstekens? Omcirkel.', rang: 4, schaal: 0.84,
  bouw: (r, o) => {
    const z = kies(r, zinnenVoor(o)), vraagSoort = r.volgende() < 0.6 ? o.focus : kies(r, o.kennen);
    const kandidaten = z.tokens.filter(t => t.soort === vraagSoort && z.tokens.filter(x => x.woord === t.woord).every(x => x.soort === t.soort));
    if (!kandidaten.length) return null;
    const t = kies(r, kandidaten);
    const soorten = alsLijst([t.soort, ...r.schud(o.kennen.filter(s => s !== t.soort)).slice(0, 3)]);
    return basisOefening({
      tekst: `${zinMetPunt(z)}\nWelke woordsoort is '${t.woord}'?${NBSP.repeat(6)}${keuze(soorten)}`, antwoord: label(t.soort),
      volledig: `${zinMetPunt(z)} '${t.woord}': ${label(t.soort)}`, kern: `z${z.nr}`, sleutel: `s${z.nr}|${t.woord}`, moeilijkheid: [SOORT[t.soort].rang],
      data: { type: 'ws-zin-soort', zin: z.tekst, woord: t.woord, soort: t.soort, soorten },
    });
  },
});

const sorteren = vorm({
  id: 'sorteren', titel: 'Woorden sorteren', pictogram: 'schrijven', opdracht: 'Schrijf elk woord in de juiste rij.', rang: 5, schaal: 0.67,
  bouw: (r, o) => {
    const a = o.focus, b = kies(r, o.kennen.filter(s => s !== a)), rij = alsLijst([a, b]);
    const drieA = r.schud(woordenVan(a)).slice(0, 3), drieB = r.schud(woordenVan(b)).slice(0, 3);
    if (drieA.length < 3 || drieB.length < 3) return null;
    const alle = r.schud([...drieA, ...drieB]), per = (s) => alle.filter(w => w.soort === s).map(w => w.woord).sort();
    return basisOefening({
      tekst: `${alle.map(w => w.woord).join(NBSP.repeat(5))}\n${rij.map(s => `${label(s)}: __________________`).join('\n')}`,
      antwoord: rij.map(s => `${label(s)}: ${per(s).join(', ')}`).join('; '), volledig: rij.map(s => `${label(s)}: ${per(s).join(', ')}`).join('; '),
      kern: [...alle.map(w => w.woord)].sort().join('/'), sleutel: [...alle.map(w => w.woord)].sort().join('/'), kernen: alle.map(w => w.woord),
      moeilijkheid: [1, 1], data: { type: 'ws-sorteren', rijen: rij.map(s => ({ soort: s, woorden: per(s) })), woorden: alle.map(w => w.woord) },
    });
  },
});

export const WOORDSOORTEN_VORMEN = [regel, ongelijk, zinOmcirkel, zinSoort, sorteren];
