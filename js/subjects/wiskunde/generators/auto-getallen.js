// Getalkennis: tellen met sprongen, afronden, deelbaarheid, delers en veelvouden, rangtelwoorden, getallen in woorden, plaatswaarde,
// getal als aantal/rangorde/code, tafels en delen door sprongen. De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { fmt, fmtDec, ggd, kgv, isPriem, priemfactoren, getalWoord, rangWoord } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const NBSP = ' ';
const opdracht = (invullen, kiezen = 'Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const uniekPositief = (lijst, antwoord) => [...new Set(lijst.filter(x => Number.isFinite(x) && x >= 0 && x !== antwoord))];
const cijfers = (n) => String(n).length;

/* ------------------------------------------------------------------ tellen met sprongen */
const telOpgave = (r, p) => {
  const toon = (x) => (p.dec ? fmtDec(x) : fmt(x));
  if (p.buur) {
    const n = r.geheel(1, Math.max(2, p.max - 1)), t = kies(r, ['na', 'voor', 'meer', 'minder']);
    const [vraag, ant] = { na: [`Het getal juist na ${n} is ____`, n + 1], voor: [`Het getal juist voor ${n} is ____`, n - 1], meer: [`1 meer dan ${n} is ____`, n + 1], minder: [`1 minder dan ${n} is ____`, n - 1] }[t];
    if (ant < 0) return null;
    return { vraag, antwoord: ant, fouten: uniekPositief([ant + 1, ant - 1, n, ant + 2, ant - 2], ant).map(String), kern: `b${t}${n}`, moeilijkheid: [cijfers(n)], data: { tel: 'buur', n, soort: t } };
  }
  const stap = kies(r, p.stappen), lengte = Math.min(5, Math.floor(p.max / stap) + 1), terug = p.terug && r.volgende() < 0.5;
  if (lengte < 3) return null;
  const eerste = r.geheel(0, Math.floor(p.max / stap) - (lengte - 1)) * stap, volg = Array.from({ length: lengte }, (_, i) => eerste + i * stap), reeks = terug ? [...volg].reverse() : volg;
  const gat = r.geheel(1, lengte - 2), antwoord = reeks[gat];
  const vraag = reeks.map((x, i) => (i === gat ? '____' : toon(x))).join(', ');
  const fouten = uniekPositief([antwoord + stap, antwoord - stap, antwoord + (stap === 1 ? 2 : 1), antwoord + 2 * stap], antwoord).map(toon);
  return { vraag, antwoord: toon(antwoord), fouten, kern: `r${stap}.${eerste}.${terug}`, moeilijkheid: [cijfers(p.max), stap], data: { tel: 'reeks', reeks, stap, terug, gat, dec: p.dec } };
};
export const TEL_VORMEN = maakOpgaveVormen({
  id: 'tel', titel: 'Tellen met sprongen', doelen: AUTO_DOELEN.tel || [], parameters: K.tellenParameters, standaard: { stappen: [1, 2, 5], max: 100, dec: 0, terug: true, buur: false },
  opdracht: opdracht('Vul het ontbrekende getal in.', 'Welk getal ontbreekt? Omcirkel.'), opgave: telOpgave,
});

/* ------------------------------------------------------------------ afronden */
const EENHEID_NAAM = { 10: 'tiental', 100: 'honderdtal', 1000: 'duizendtal', 10000: 'tienduizendtal', 100000: 'honderdduizendtal', 1000000: 'miljoen', 1000000000: 'miljard' };
export const afrondOpgave = (r, p) => {
  const u = kies(r, p.eenheden), boven = Math.min(p.max, u * 100);
  const n = r.geheel(u + 1, Math.max(u + 2, boven));
  if (n % u === 0) return null;
  const antw = Math.floor((n + u / 2) / u) * u, beneden = Math.floor(n / u) * u, omhoog = beneden + u;
  const anderU = u >= 100 ? u / 10 : u * 10;
  const fouten = uniekPositief([antw === beneden ? omhoog : beneden, Math.floor((n + anderU / 2) / anderU) * anderU, antw + u, antw - u], antw);
  return { vraag: `Rond ${fmt(n)} af op een ${EENHEID_NAAM[u]}: ____`, antwoord: fmt(antw), fouten: fouten.map(fmt), kern: `a${n}.${u}`, moeilijkheid: [cijfers(n), -u], data: { n, eenheid: u, antw } };
};
export const AFRONDEN_VORMEN = maakOpgaveVormen({
  id: 'afr', titel: 'Afronden', doelen: AUTO_DOELEN.afr || [], parameters: K.afrondParameters, standaard: { eenheden: [10, 100], max: 1000 },
  opdracht: opdracht('Rond het getal af. Schrijf het afgeronde getal op.', 'Rond het getal af. Omcirkel het juiste getal.'), opgave: afrondOpgave,
});

/* ------------------------------------------------------------------ deelbaarheid */
const dlbOpgave = (r, p) => {
  const d = kies(r, p.delers), type = p.rest && r.volgende() < 0.5 ? 'rest' : 'ja';
  const bovenste = Math.min(p.max, 10 ** Math.min(10, cijfers(p.max) - (p.max === 10 ** (cijfers(p.max) - 1) ? 1 : 0)) ), grens = Math.max(bovenste, d * 3);
  if (type === 'rest') {
    const n = r.geheel(d + 1, grens);
    if (n % d === 0) return null;
    const rest = n % d;
    return { vraag: `De rest van ${fmt(n)} : ${d} is ____`, antwoord: rest, fouten: uniekPositief([rest + 1, d - rest, rest - 1, d], rest).filter(x => x < d + 1).map(String), kern: `dr${n}.${d}`, moeilijkheid: [cijfers(n), d], data: { dlb: 'rest', n, d, rest } };
  }
  const deelbaar = r.volgende() < 0.5, n = deelbaar ? d * r.geheel(1, Math.max(1, Math.floor(grens / d))) : r.geheel(d + 1, grens);
  if (!deelbaar && n % d === 0) return null;
  return { vraag: `Is ${fmt(n)} deelbaar door ${d}?${NBSP.repeat(3)}____`, antwoord: n % d === 0 ? 'ja' : 'nee', fouten: [n % d === 0 ? 'nee' : 'ja'], kern: `dj${n}.${d}`, moeilijkheid: [cijfers(n), d], data: { dlb: 'ja', n, d } };
};
export const DEELBAAR_VORMEN = maakOpgaveVormen({
  id: 'dlb', titel: 'Deelbaarheid', doelen: AUTO_DOELEN.dlb || [], parameters: K.deelbaarParameters, standaard: { delers: [2, 5, 10], max: 1000, rest: false },
  opdracht: opdracht('Is het getal deelbaar? Schrijf ja of nee, of de rest. ', 'Kies het juiste antwoord. Omcirkel.'), opgave: dlbOpgave,
});

/* ------------------------------------------------------------------ delers en veelvouden, ggd en kgv, priemgetallen */
export const priemfactorenTekst = (n) => priemfactoren(n).join(' × ');
const vlvOpgave = (r, p) => {
  const t = kies(r, p.types);
  switch (t) {
    case 'deler': { const n = r.geheel(6, 100), d = r.geheel(2, 12), ja = n % d === 0; return { vraag: `Is ${d} een deler van ${n}?${NBSP.repeat(3)}____`, antwoord: ja ? 'ja' : 'nee', fouten: [ja ? 'nee' : 'ja'], kern: `vd${n}.${d}`, moeilijkheid: [cijfers(n)], data: { vlv: t, n, d } }; }
    case 'veelvoud': { const a = r.geheel(2, 12), k = r.geheel(2, 10); if (r.volgende() < 0.5) return { vraag: `Het ${k}de veelvoud van ${a} is ____`, antwoord: a * k, fouten: uniekPositief([a + k, a * (k - 1), a * (k + 1)], a * k).map(String), kern: `vv${a}.${k}`, moeilijkheid: [k], data: { vlv: t, a, k } }; const n = r.geheel(1, 120), ja = n % a === 0; return { vraag: `Is ${n} een veelvoud van ${a}?${NBSP.repeat(3)}____`, antwoord: ja ? 'ja' : 'nee', fouten: [ja ? 'nee' : 'ja'], kern: `vj${n}.${a}`, moeilijkheid: [cijfers(n)], data: { vlv: 'veelvoud-ja', n, a } }; }
    case 'ggd': { const g = r.geheel(2, 12), a = g * r.geheel(1, 8), b = g * r.geheel(1, 8); if (a === b || ggd(a, b) === 1) return null; const x = ggd(a, b); return { vraag: `De grootste gemeenschappelijke deler van ${a} en ${b} is ____`, antwoord: x, fouten: uniekPositief([Math.min(a, b), x * 2, x + 1, kgv(a, b)], x).map(String), kern: `g${[a, b].sort((u, v) => u - v)}`, moeilijkheid: [cijfers(Math.max(a, b))], data: { vlv: t, a, b } }; }
    case 'kgv': { const a = r.geheel(2, 15), b = r.geheel(2, 15); if (a === b) return null; const x = kgv(a, b); return { vraag: `Het kleinste gemeenschappelijk veelvoud van ${a} en ${b} is ____`, antwoord: x, fouten: uniekPositief([a * b === x ? x * 2 : a * b, Math.max(a, b), x + Math.min(a, b), ggd(a, b)], x).map(String), kern: `k${[a, b].sort((u, v) => u - v)}`, moeilijkheid: [cijfers(x)], data: { vlv: t, a, b } }; }
    case 'priem': { const n = r.geheel(4, 60), ja = isPriem(n); return { vraag: `Is ${n} een priemgetal?${NBSP.repeat(3)}____`, antwoord: ja ? 'ja' : 'nee', fouten: [ja ? 'nee' : 'ja'], kern: `pr${n}`, moeilijkheid: [n], data: { vlv: t, n } }; }
    case 'priemfactoren': { const n = r.geheel(6, 150); if (isPriem(n)) return null; const f = priemfactoren(n), juist = f.join(' × '); const half = f.length > 2 ? [f[0] * f[1], ...f.slice(2)].join(' × ') : null; const fout1 = half, fout2 = [...f.slice(0, -1), f.at(-1) + 1].join(' × '); const fout3 = f.length > 1 ? f.slice(1).join(' × ') : null; return { vraag: `${n} = ____`, antwoord: juist, fouten: [fout1, fout2, fout3].filter(x => x && x !== juist), kern: `pf${n}`, moeilijkheid: [f.length], data: { vlv: t, n } }; }
    default: return null;
  }
};
export const VEELVOUD_VORMEN = maakOpgaveVormen({
  id: 'vlv', titel: 'Delers, veelvouden en priemgetallen', doelen: AUTO_DOELEN.vlv || [], parameters: K.veelParameters, standaard: { types: ['deler', 'veelvoud', 'ggd', 'kgv'], jaar: 5 },
  opdracht: opdracht('Los op. Schrijf het antwoord op de lijn (of ja of nee).', 'Kies het juiste antwoord. Omcirkel.'), opgave: vlvOpgave,
});

/* ------------------------------------------------------------------ rangtelwoorden */
export const rangNotatie = (n) => (n === 1 || n === 8 || n >= 20 ? `${n}ste` : `${n}de`);
const rngOpgave = (r, p) => {
  const n = r.volgende() < 0.5 ? r.geheel(1, Math.min(p.max, 20)) : r.geheel(1, p.max), w = rangWoord(n), naarWoord = r.volgende() < 0.5;
  if (naarWoord) return { vraag: `${rangNotatie(n)} → ____`, antwoord: w, fouten: [n > 1 ? rangWoord(n - 1) : rangWoord(n + 1), rangWoord(n + 1), w.replace(/(ste|de)$/, n >= 20 || n === 1 || n === 8 ? 'de' : 'ste')], kern: `rw${n}`, moeilijkheid: [n], data: { rng: 'woord', n, woord: w } };
  return { vraag: `${w} → ____`, antwoord: rangNotatie(n), fouten: [rangNotatie(n + 1), rangNotatie(Math.max(1, n - 1)), n >= 20 || n === 1 || n === 8 ? `${n}de` : `${n}ste`], kern: `rn${n}`, moeilijkheid: [n], data: { rng: 'notatie', n, woord: w } };
};
export const RANG_VORMEN = maakOpgaveVormen({
  id: 'rng', titel: 'Rangtelwoorden', doelen: AUTO_DOELEN.rng || [], parameters: K.rangParameters, standaard: { max: 20 },
  opdracht: opdracht('Schrijf het rangtelwoord of het getal op de lijn.', 'Kies het juiste rangtelwoord of getal. Omcirkel.'), opgave: rngOpgave,
});

/* ------------------------------------------------------------------ getallen lezen en schrijven */
const verwissel = (n) => { const s = String(n); return s.length > 1 ? Number(s.split('').reverse().join('')) : n + 1; };
const wrdOpgave = (r, p) => {
  if (p.max <= 1000) {
    const n = r.volgende() < 0.4 ? r.geheel(0, Math.min(p.max, 20)) : r.geheel(0, p.max), naarWoord = r.volgende() < 0.5;
    const buren = [n + 1, n - 1, n + 10, n - 10, verwissel(n)].filter(x => x >= 0 && x <= 1000 && x !== n);
    if (naarWoord) return { vraag: `${n} → ____`, antwoord: getalWoord(n), fouten: buren.map(getalWoord), kern: `w${n}`, moeilijkheid: [n], data: { wrd: 'woord', n } };
    return { vraag: `${getalWoord(n)} → ____`, antwoord: String(n), fouten: buren.map(String), kern: `c${n}`, moeilijkheid: [n], data: { wrd: 'cijfer', n } };
  }
  const miljoen = p.max >= 1e6 && r.volgende() < 0.6;
  if (miljoen) {
    const a = r.geheel(1, 99), b = r.geheel(0, 99), c = r.geheel(0, 9) * 100 + r.geheel(0, 99) * 0, n = a * 1e6 + b * 1e3 + c;
    return { vraag: `${a} miljoen ${b ? b + ' duizend ' : ''}${c ? c : ''} = ____`.replace(/ +/g, ' ').replace(/ = /, ' = '), antwoord: fmt(n), fouten: uniekPositief([n * 10, n / 10, a * 1e6 + c * 1e3 + b, a * 1e5 + b * 1e3 + c, verwissel(n)], n).filter(Number.isInteger).map(fmt), kern: `m${n}`, moeilijkheid: [cijfers(n)], data: { wrd: 'miljoen', a, b, c, n } };
  }
  const a = r.geheel(1, 99), c = r.geheel(0, 999), n = a * 1000 + c;
  return { vraag: `${a} duizend ${c ? c : ''} = ____`.replace(/ +/g, ' ').replace(/ = /, ' = '), antwoord: fmt(n), fouten: uniekPositief([a * 100 + c, a * 10000 + c, c * 1000 + a, n * 10], n).map(fmt), kern: `d${n}`, moeilijkheid: [cijfers(n)], data: { wrd: 'duizend', a, c, n } };
};
export const WOORD_VORMEN = maakOpgaveVormen({
  id: 'wrd', titel: 'Getallen lezen en schrijven', doelen: AUTO_DOELEN.wrd || [], parameters: K.woordParameters, standaard: { max: 100 },
  opdracht: opdracht('Schrijf het getal in woorden of in cijfers op de lijn.', 'Kies het juiste getal of de juiste woorden. Omcirkel.'), opgave: wrdOpgave,
});

/* ------------------------------------------------------------------ plaatswaarde */
export const PLAATSEN = ['E', 'T', 'H', 'D', 'TD', 'HD', 'M', 'TM', 'HM', 'Md'];
const pwsOpgave = (r, p) => {
  const t = kies(r, p.types), aantal = Math.max(2, Math.min(cijfers(p.max) - (p.max === 10 ** (cijfers(p.max) - 1) ? 1 : 0), 10));
  const lengte = r.geheel(Math.min(aantal, 3), aantal), cijf = Array.from({ length: lengte }, (_, i) => (i === 0 ? r.geheel(1, 9) : r.geheel(0, 9))); // hoogste plaats eerst
  const n = Number(cijf.join('')), plaats = (i) => PLAATSEN[lengte - 1 - i], waardeVan = (i) => cijf[i] * 10 ** (lengte - 1 - i);
  if (t === 'waarde') {
    const i = r.geheel(0, lengte - 1), c = cijf[i];
    if (c === 0 || cijf.filter(x => x === c).length > 1) return null;
    return { vraag: `De waarde van het cijfer ${c} in ${fmt(n)} is ____`, antwoord: fmt(waardeVan(i)), fouten: uniekPositief([c, waardeVan(i) * 10, waardeVan(i) / 10, c * 10 ** Math.max(0, lengte - i)], waardeVan(i)).filter(Number.isInteger).map(fmt), kern: `pw${n}.${c}`, moeilijkheid: [lengte], data: { pws: t, n, cijfer: c, waarde: waardeVan(i) } };
  }
  if (t === 'splits') {
    const i = r.geheel(0, lengte - 1), delen = cijf.map((c, k) => (k === i ? `____ ${plaats(k)}` : `${c} ${plaats(k)}`));
    return { vraag: `${fmt(n)} = ${delen.join(' + ')}`, antwoord: String(cijf[i]), fouten: uniekPositief([cijf[i] + 1, cijf[i] - 1, (cijf[i] + 5) % 10, cijf[(i + 1) % lengte]], cijf[i]).map(String), kern: `ps${n}.${i}`, moeilijkheid: [lengte], data: { pws: t, n, plaats: plaats(i), cijfer: cijf[i] } };
  }
  if (t === 'samenstel') {
    const delen = cijf.map((c, k) => `${c} ${plaats(k)}`), fout1 = Number([...cijf].reverse().join('')), fout2 = Number(cijf.map((c, k) => (k === Math.floor(lengte / 2) ? 0 : c)).join(''));
    return { vraag: `${delen.join(' + ')} = ____`, antwoord: fmt(n), fouten: uniekPositief([fout1, fout2, n * 10, Math.floor(n / 10)], n).map(fmt), kern: `pa${n}`, moeilijkheid: [lengte], data: { pws: t, n, delen } };
  }
  // herstructureren: haal één eenheid van een hogere plaats weg en voeg 10 toe aan de plaats eronder
  const i = r.geheel(0, lengte - 2);
  if (cijf[i] === 0) return null;
  const nieuw = [...cijf]; nieuw[i] -= 1; nieuw[i + 1] += 10;
  const delen = nieuw.map((c, k) => (k === i + 1 ? `____ ${plaats(k)}` : `${c} ${plaats(k)}`)), ant = nieuw[i + 1];
  return { vraag: `${fmt(n)} = ${delen.join(' + ')}`, antwoord: String(ant), fouten: uniekPositief([ant - 10, ant + 1, ant + 10, cijf[i + 1]], ant).map(String), kern: `ph${n}.${i}`, moeilijkheid: [lengte], data: { pws: t, n, hoger: plaats(i), lager: plaats(i + 1), nieuw } };
};
export const PLAATSWAARDE_VORMEN = maakOpgaveVormen({
  id: 'pws', titel: 'Plaatswaarde en structureren', doelen: AUTO_DOELEN.pws || [], parameters: K.waardeParameters, standaard: { types: ['splits', 'samenstel', 'herstruct'], max: 1000 },
  opdracht: opdracht('Vul het ontbrekende getal in.', 'Welk getal ontbreekt? Omcirkel.'), opgave: pwsOpgave,
});

/* ------------------------------------------------------------------ getal als aantal, rangorde of code */
export const CONTEXTEN = [
  { zin: 'In de klas zitten 18 kinderen.', getal: 18, soort: 'aantal', max: 20 }, { zin: 'Er liggen 7 appels in de mand.', getal: 7, soort: 'aantal', max: 20 },
  { zin: 'De bus heeft 45 zitplaatsen.', getal: 45, soort: 'aantal', max: 100 }, { zin: 'Op de speelplaats staan 83 fietsen.', getal: 83, soort: 'aantal', max: 100 },
  { zin: 'In het zwembad zijn 350 mensen.', getal: 350, soort: 'aantal', max: 1000 }, { zin: 'De school heeft 640 boeken in de bibliotheek.', getal: 640, soort: 'aantal', max: 1000 },
  { zin: 'Het stadion heeft 4 200 plaatsen.', getal: 4200, soort: 'aantal', max: 10000 }, { zin: 'In de bieb staan 8 750 boeken.', getal: 8750, soort: 'aantal', max: 10000 },
  { zin: 'Mia werd 3de in de wedstrijd.', getal: 3, soort: 'rangorde', max: 20 }, { zin: 'Dit is de 12de dag van de maand.', getal: 12, soort: 'rangorde', max: 20 },
  { zin: 'Tom werd 57ste in de grote loop.', getal: 57, soort: 'rangorde', max: 100 }, { zin: 'Zij was de 90ste bezoeker van de dag.', getal: 90, soort: 'rangorde', max: 100 },
  { zin: 'Hij kwam als 250ste over de eindstreep.', getal: 250, soort: 'rangorde', max: 1000 }, { zin: 'Zij was de 725ste bezoeker op de kermis.', getal: 725, soort: 'rangorde', max: 1000 },
  { zin: 'Dit boek staat op de 1 200ste plaats in de lijst.', getal: 1200, soort: 'rangorde', max: 10000 }, { zin: 'Onze school kreeg de 3 400ste bezoeker van het jaar.', getal: 3400, soort: 'rangorde', max: 10000 },
  { zin: 'Mijn busnummer is 12.', getal: 12, soort: 'code', max: 20 }, { zin: 'Tom draagt rugnummer 9.', getal: 9, soort: 'code', max: 20 },
  { zin: 'De sporthal heeft kleedkamer 14.', getal: 14, soort: 'code', max: 100 }, { zin: 'Ons huisnummer is 67.', getal: 67, soort: 'code', max: 100 },
  { zin: 'De juf zit in lokaal 214.', getal: 214, soort: 'code', max: 1000 }, { zin: 'De sleutel van kluisje 345 ligt bij de portier.', getal: 345, soort: 'code', max: 1000 },
  { zin: 'De postcode van Gent is 9000.', getal: 9000, soort: 'code', max: 10000 }, { zin: 'De pincode van de kluis is 4 081.', getal: 4081, soort: 'code', max: 10000 },
];
const SOORT_NAMEN = ['aantal', 'rangorde', 'code'];
const adgOpgave = (r, p) => {
  const pool = CONTEXTEN.filter(c => c.max <= Math.max(20, p.max)), focus = pool.filter(c => c.soort === p.soort), c = r.volgende() < 0.6 && focus.length ? kies(r, focus) : kies(r, pool);
  return { vraag: `${c.zin}\nHet getal ${fmt(c.getal)} is een ____`, antwoord: c.soort, fouten: SOORT_NAMEN.filter(x => x !== c.soort), kern: `ad${c.getal}`, moeilijkheid: [c.max], data: { adg: c.soort, zin: c.zin, getal: c.getal } };
};
export const AANDUIDING_VORMEN = maakOpgaveVormen({
  id: 'adg', titel: 'Getal: aantal, rangorde of code?', doelen: AUTO_DOELEN.adg || [], parameters: K.aanduidingParameters, standaard: { soort: 'aantal', max: 100 },
  opdracht: opdracht('Wat betekent het getal in de zin? Schrijf aantal, rangorde of code.', 'Wat betekent het getal? Omcirkel aantal, rangorde of code.'), opgave: adgOpgave, schaal: 0.84,
});

/* ------------------------------------------------------------------ tafels */
const tafOpgave = (r, p) => {
  const a = kies(r, p.tafels), b = r.geheel(1, 10), prod = a * b;
  if (r.volgende() < 0.5) return { vraag: `${a} × ${b} = ____`, antwoord: prod, fouten: uniekPositief([prod + a, prod - a, prod + b, prod + 10, prod - 1], prod).map(String), kern: `t×${a}.${b}`, moeilijkheid: [a, b], data: { taf: 'maal', a, b, prod } };
  return { vraag: `${prod} : ${a} = ____`, antwoord: b, fouten: uniekPositief([b + 1, b - 1, a, b + 2], b).map(String), kern: `t:${a}.${b}`, moeilijkheid: [a, b], data: { taf: 'deel', a, b, prod } };
};
export const TAFEL_VORMEN = maakOpgaveVormen({
  id: 'taf', titel: 'Tafels paraat', doelen: AUTO_DOELEN.taf || [], parameters: K.tafelParameters, standaard: { tafels: [3, 4, 6, 7, 8, 9] },
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: tafOpgave,
});

/* ------------------------------------------------------------------ delen door sprongen te tellen */
const dspOpgave = (r, p) => {
  const b = r.geheel(2, 10), q = r.geheel(2, 10), k = p.max >= 1000 ? kies(r, [1, 10, 100].filter(x => b * q * x <= p.max)) : 1, rest = r.volgende() < 0.5 ? 0 : r.geheel(1, b - 1);
  const Q = q * k, a = b * Q + rest;
  if (a > p.max) return null;
  const sprongen = [1, 2, 3].map(i => b * i).join(', ');
  return { vraag: `Tel met sprongen van ${b}: ${sprongen}, ... ${a} : ${b} = ____${rest ? ` (rest ${rest})` : ''}`, antwoord: Q, fouten: uniekPositief([Q + 1, Q - 1, rest ? Q + rest : Q * 2, b], Q).map(String), kern: `ds${a}.${b}`, moeilijkheid: [cijfers(a), b], data: { dsp: true, a, b, Q, rest } };
};
export const DEELSPRONG_VORMEN = maakOpgaveVormen({
  id: 'dsp', titel: 'Delen door sprongen', doelen: AUTO_DOELEN.dsp || [], parameters: K.deelSprongParameters, standaard: { max: 100 },
  opdracht: opdracht('Tel met sprongen. Schrijf het quotiënt op de lijn.', 'Kies het juiste quotiënt. Omcirkel.'), opgave: dspOpgave,
});

export const AUTO_GETALLEN_VORMEN = [...TEL_VORMEN, ...AFRONDEN_VORMEN, ...DEELBAAR_VORMEN, ...VEELVOUD_VORMEN, ...RANG_VORMEN, ...WOORD_VORMEN, ...PLAATSWAARDE_VORMEN, ...AANDUIDING_VORMEN, ...TAFEL_VORMEN, ...DEELSPRONG_VORMEN];
