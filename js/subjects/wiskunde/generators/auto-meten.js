// Meten en metend rekenen: maateenheden en notaties, herleidingen, schaal, verhoudingstabel, snelheid, bruto/netto/tarra, massadichtheid,
// winst/verlies/korting/intrest, tijdsduur, temperatuurintervallen, omtrek/oppervlakte/volume en de kalender.
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { fmt, ggd } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const NBSP = ' ';
const opdracht = (invullen, kiezen = 'Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const cijfers = (n) => String(Math.abs(n)).length;
// Een kommagetal uit een geheel getal met k decimalen: (350, 2) -> 3,5
export const komma = (t, k) => { if (!k) return fmt(t); const neg = t < 0, s = String(Math.abs(t)).padStart(k + 1, '0'), e = s.slice(0, -k), f = s.slice(-k).replace(/0+$/, ''); return (neg ? '−' : '') + (f ? `${fmt(Number(e))},${f}` : fmt(Number(e))); };
// x * 10^e als tekst (e mag negatief zijn, maximaal 4 decimalen)
export const tienmacht = (x, e) => { if (e >= 0) return fmt(x * 10 ** e); const k = -e; return komma(x, k); };
const nl = (x) => String(x).replace('.', ',');

/* ------------------------------------------------------------------ maateenheden en notaties */
export const EENHEDEN_POOL = [['meter', 'm'], ['centimeter', 'cm'], ['decimeter', 'dm'], ['millimeter', 'mm'], ['kilometer', 'km'], ['liter', 'l'], ['deciliter', 'dl'], ['centiliter', 'cl'], ['milliliter', 'ml'], ['kilogram', 'kg'], ['gram', 'g'], ['milligram', 'mg'], ['ton', 't'], ['uur', 'u'], ['minuut', 'min'], ['seconde', 's'], ['euro', '€'], ['graden Celsius', '°C'], ['vierkante meter', 'm²'], ['kubieke meter', 'm³'], ['hectare', 'ha'], ['are', 'a']];
const eenOpgave = (r, p) => {
  const [naam, sym] = kies(r, p.paren), naarSym = r.volgende() < 0.5;
  const afleiders = r.schud([...p.paren, ...EENHEDEN_POOL].filter(([n, s]) => n !== naam && s !== sym));
  const opties = uniek(afleiders.map(x => (naarSym ? x[1] : x[0])), naarSym ? sym : naam).slice(0, 3);
  if (opties.length < 2) return null;
  if (r.volgende() < 0.5) { const n = r.geheel(2, 40); return { vraag: `${n} ${naam} = ${n} ____`, antwoord: sym, fouten: uniek(afleiders.map(x => x[1]), sym).slice(0, 3), kern: `en${n}${naam}`, moeilijkheid: [naam.length], data: { een: 'getal', naam, sym, n } }; }
  return naarSym ? { vraag: `${naam} → ____`, antwoord: sym, fouten: opties, kern: `e${naam}`, moeilijkheid: [naam.length], data: { een: 'naar-symbool', naam, sym } } : { vraag: `${sym} → ____`, antwoord: naam, fouten: opties, kern: `s${sym}`, moeilijkheid: [naam.length], data: { een: 'naar-naam', naam, sym } };
};
export const EENHEID_VORMEN = maakOpgaveVormen({
  id: 'een', titel: 'Maateenheden en hun notatie', doelen: AUTO_DOELEN.een || [], parameters: K.eenheidParameters, standaard: { paren: [['meter', 'm'], ['liter', 'l'], ['kilogram', 'kg']] },
  opdracht: opdracht('Schrijf de maateenheid of haar notatie op de lijn.', 'Kies de juiste maateenheid of notatie. Omcirkel.'), opgave: eenOpgave,
});

/* ------------------------------------------------------------------ herleidingen */
// Elke eenheid heeft een tienmacht ten opzichte van de basiseenheid (m, m², m³, l, g).
export const EENHEDEN_STELSEL = {
  lengte: { km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3 },
  opp: { 'km²': 6, 'hm²': 4, 'dam²': 2, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6 },
  inhoud: { kl: 3, hl: 2, dal: 1, l: 0, dl: -1, cl: -2, ml: -3 },
  massa: { kg: 3, hg: 2, dag: 1, g: 0, dg: -1, cg: -2, mg: -3, t: 6 },
  landmaat: { ha: 4, a: 2, ca: 0 },
};
const VEELGEBRUIKT = { lengte: ['km', 'm', 'dm', 'cm', 'mm'], opp: ['m²', 'dm²', 'cm²'], inhoud: ['l', 'dl', 'cl', 'ml'], massa: ['kg', 'g', 'mg'], landmaat: ['ha', 'a', 'ca'] };
const hrlOpgave = (r, p) => {
  const t = kies(r, p.types);
  if (t === 'inh-vol') { const n = r.geheel(2, 90), paar = kies(r, [['l', 'dm³', 1], ['ml', 'cm³', 1], ['kl', 'm³', 1]]), omgekeerd = r.volgende() < 0.5; return omgekeerd ? { vraag: `${n} ${paar[1]} = ____ ${paar[0]}`, antwoord: String(n), fouten: [String(n * 10), String(n * 1000), nl(n / 10)], kern: `iv${n}${paar[1]}`, moeilijkheid: [1], data: { hrl: t, n, van: paar[0], naar: paar[1], omgekeerd } } : { vraag: `${n} ${paar[0]} = ____ ${paar[1]}`, antwoord: String(n), fouten: [String(n * 10), String(n * 1000), nl(n / 10)], kern: `iv${n}${paar[0]}`, moeilijkheid: [1], data: { hrl: t, n, van: paar[0], naar: paar[1], omgekeerd } }; }
  if (t === 'massa-vol') { const n = r.geheel(2, 40); return r.volgende() < 0.5 ? { vraag: `${n} l water weegt ____ kg`, antwoord: String(n), fouten: [String(n * 10), String(n * 1000), nl(n / 10)], kern: `mv${n}`, moeilijkheid: [1], data: { hrl: t, n, soort: 'l-naar-kg' } } : { vraag: `${n} kg water heeft een inhoud van ____ l`, antwoord: String(n), fouten: [String(n * 10), String(n * 1000), nl(n / 10)], kern: `mw${n}`, moeilijkheid: [1], data: { hrl: t, n, soort: 'kg-naar-l' } }; }
  const stelsel = t === 'ton' ? 'massa' : t, tabel = EENHEDEN_STELSEL[stelsel];
  let eenheden = Object.keys(tabel).filter(e => (t === 'ton' ? ['t', 'kg'].includes(e) : p.groot || stelsel === 'landmaat' ? true : VEELGEBRUIKT[stelsel].includes(e)));
  if (t === 'landmaat') eenheden = [...Object.keys(tabel), 'm²'];
  const eigenTabel = t === 'landmaat' ? { ...tabel, 'm²': 0 } : tabel;
  const van = kies(r, eenheden), naar = kies(r, eenheden.filter(e => e !== van));
  const e = eigenTabel[van] - eigenTabel[naar];
  if (Math.abs(e) > 4 || e === 0) return null;
  const n = e > 0 ? r.geheel(1, 99) : r.geheel(1, 9) * 10 ** Math.abs(e) + (Math.abs(e) <= 2 ? r.geheel(0, 9) * 10 ** (Math.abs(e) - 1) : 0);
  const antw = tienmacht(n, e);
  const fouten = uniek([tienmacht(n, e + (e > 0 ? 1 : -1) * 1), tienmacht(n, -e), tienmacht(n, e > 0 ? e - 1 : e + 1), fmt(n)].filter(x => !/^NaN/.test(x)), antw);
  return { vraag: `${fmt(n)} ${van} = ____ ${naar}`, antwoord: antw, fouten, kern: `h${n}${van}${naar}`, moeilijkheid: [Math.abs(e)], data: { hrl: 'eenheid', stelsel: t, n, van, naar, e } };
};
export const HERLEID_VORMEN = maakOpgaveVormen({
  id: 'hrl', titel: 'Herleiden van maateenheden', doelen: AUTO_DOELEN.hrl || [], parameters: K.herleidParameters, standaard: { types: ['lengte', 'inhoud'], groot: false }, schaal: 0.84,
  opdracht: opdracht('Herleid. Schrijf het antwoord op de lijn.', 'Herleid en kies het juiste antwoord. Omcirkel.'), opgave: hrlOpgave,
});

/* ------------------------------------------------------------------ schaal en vaste verhoudingen */
const SCHALEN = [10, 20, 25, 50, 100, 200, 500, 1000, 5000, 10000, 25000, 50000, 100000];
const schaalOpgave = (r, p) => {
  const t = kies(r, p.types), n = kies(r, SCHALEN);
  if (t === 'plan') { const werkelijk = n * r.geheel(1, 9) * (n >= 1000 ? 1 : 1), plan = werkelijk / n; if (!Number.isInteger(plan) || plan > 40) return null; const m = werkelijk / 100; if (!Number.isInteger(m)) return null; return { vraag: `Schaal 1 : ${fmt(n)}. In werkelijkheid is een afstand ${fmt(m)} m. Op de tekening is dat ____ cm`, antwoord: String(plan), fouten: uniek([plan * 10, plan / 10 | 0, plan + 1, werkelijk / 1000 | 0], plan).map(String), kern: `sp${n}.${m}`, moeilijkheid: [cijfers(n)], data: { scl: t, n, plan, werkelijkM: m } }; }
  if (t === 'werkelijk') { const plan = r.geheel(2, 25), werkelijkCm = plan * n; if (werkelijkCm % 100 !== 0) return null; const m = werkelijkCm / 100; return { vraag: `Schaal 1 : ${fmt(n)}. Op de tekening is een afstand ${plan} cm. In werkelijkheid is dat ____ m`, antwoord: fmt(m), fouten: uniek([werkelijkCm, m * 10, m / 10, plan * n / 1000].map(fmt), fmt(m)), kern: `sw${n}.${plan}`, moeilijkheid: [cijfers(n)], data: { scl: t, n, plan, werkelijkM: m } }; }
  if (t === 'schaal') { const plan = kies(r, [2, 4, 5, 10]), werkelijkCm = plan * n; return { vraag: `${plan} cm op de tekening is ${fmt(werkelijkCm)} cm in werkelijkheid. De schaal is 1 : ____`, antwoord: fmt(n), fouten: uniek([werkelijkCm, n * plan, n / 10, plan], n).map(fmt), kern: `ss${n}.${plan}`, moeilijkheid: [cijfers(n)], data: { scl: t, n, plan, werkelijkCm } }; }
  if (t === 'omzet') { const klein = kies(r, [1000, 2000, 5000, 10000, 20000, 25000, 50000, 100000]), m = klein / 100; if (r.volgende() < 0.5) return { vraag: `Schaal 1 : ${fmt(klein)}. Dan is 1 cm op de kaart ____ m in werkelijkheid`, antwoord: fmt(m), fouten: uniek([klein, m * 10, m / 10, klein / 1000], m).map(fmt), kern: `om${klein}`, moeilijkheid: [cijfers(klein)], data: { scl: t, n: klein, richting: 'breuk-naar-lijn', m } }; return { vraag: `1 cm op de kaart is ${fmt(m)} m in werkelijkheid. De schaal is 1 : ____`, antwoord: fmt(klein), fouten: uniek([m, klein * 10, klein / 10, m * 1000].map(fmt), fmt(klein)), kern: `ol${klein}`, moeilijkheid: [cijfers(klein)], data: { scl: t, n: klein, richting: 'lijn-naar-breuk', m } }; }
  const f = r.geheel(2, 6), cm = r.geheel(2, 12), vergroten = r.volgende() < 0.5;
  if (vergroten) return { vraag: `Een figuur wordt ${f} keer vergroot. Een zijde van ${cm} cm wordt ____ cm`, antwoord: String(cm * f), fouten: uniek([cm + f, cm * f * 2, cm, cm * (f + 1)], cm * f).map(String), kern: `vg${f}.${cm}`, moeilijkheid: [f], data: { scl: 'vergroot', f, cm, antw: cm * f, vergroten } };
  const groot = cm * f; return { vraag: `Een figuur wordt ${f} keer verkleind. Een zijde van ${groot} cm wordt ____ cm`, antwoord: String(cm), fouten: uniek([groot - f, groot * f, cm + 1, groot / 2], cm).map(x => nl(x)), kern: `vk${f}.${cm}`, moeilijkheid: [f], data: { scl: 'vergroot', f, cm: groot, antw: cm, vergroten } };
};
export const SCHAAL_VORMEN = maakOpgaveVormen({
  id: 'scl', titel: 'Schaal en vergroten of verkleinen', doelen: AUTO_DOELEN.scl || [], parameters: K.schaalParameters, standaard: { types: ['plan', 'werkelijk', 'schaal'] }, schaal: 0.84,
  opdracht: opdracht('Los op. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: schaalOpgave,
});

/* ------------------------------------------------------------------ verhoudingstabel */
const KOPPELS = [['kg appels', 'euro'], ['meter lint', 'euro'], ['liter melk', 'euro'], ['pennen', 'euro'], ['personen', 'g bloem'], ['km', 'minuten fietsen'], ['uur werk', 'euro loon']];
const evrOpgave = (r) => {
  const [a, b] = kies(r, KOPPELS), x1 = r.geheel(2, 6), per = r.geheel(2, 9) * (b === 'euro' ? 1 : 25), y1 = x1 * per, x2 = x1 * r.geheel(2, 5) + (r.volgende() < 0.4 ? x1 : 0), y2 = x2 * per;
  if (x2 === x1) return null;
  return { vraag: `${x1} ${a} ↔ ${y1} ${b}.   ${x2} ${a} ↔ ____ ${b}`, antwoord: String(y2), fouten: uniek([y1 + (x2 - x1), y2 + per, y1 * x2, y2 - per], y2).map(String), kern: `ev${a}${x1}.${x2}.${per}`, moeilijkheid: [x2 / x1], data: { evr: true, x1, y1, x2, y2 } };
};
export const EVENREDIG_VORMEN = maakOpgaveVormen({
  id: 'evr', titel: 'Verhoudingstabel', doelen: AUTO_DOELEN.evr || [], parameters: K.evenredigParameters, standaard: { jaar: 4 },
  opdracht: opdracht('Vul de verhoudingstabel aan. Schrijf het ontbrekende getal op de lijn.', 'Kies het juiste getal. Omcirkel.'), opgave: evrOpgave,
});

/* ------------------------------------------------------------------ snelheid */
const snlOpgave = (r, p) => {
  const t = kies(r, p.types), v = kies(r, [30, 40, 45, 50, 60, 70, 80, 90, 100, 120]), uren = kies(r, [2, 3, 4, 5, 6]), s = v * uren;
  if (t === 'v') return { vraag: `Een auto rijdt ${fmt(s)} km in ${uren} uur. De gemiddelde snelheid is ____ km/u`, antwoord: String(v), fouten: uniek([s * uren, s - uren, v + uren, s / (uren + 1) | 0], v).map(String), kern: `v${s}.${uren}`, moeilijkheid: [cijfers(s)], data: { snl: t, s, uren, v } };
  if (t === 'afstand') return { vraag: `Een fietser rijdt ${uren} uur aan ${v} km/u. Hij legt ____ km af`, antwoord: String(s), fouten: uniek([v + uren, v / uren | 0, s + v, s - uren], s).map(String), kern: `a${v}.${uren}`, moeilijkheid: [cijfers(s)], data: { snl: t, s, uren, v } };
  return { vraag: `Een trein rijdt ${fmt(s)} km aan ${v} km/u. De reis duurt ____ uur`, antwoord: String(uren), fouten: uniek([v - s, uren + 1, uren - 1 || 7, s / 10 | 0], uren).map(String), kern: `t${s}.${v}`, moeilijkheid: [cijfers(s)], data: { snl: t, s, uren, v } };
};
export const SNELHEID_VORMEN = maakOpgaveVormen({
  id: 'snl', titel: 'Snelheid, afstand en tijd', doelen: AUTO_DOELEN.snl || [], parameters: K.snelheidParameters, standaard: { types: ['v', 'afstand', 'tijd'] }, schaal: 0.84,
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: snlOpgave,
});

/* ------------------------------------------------------------------ bruto, netto en tarra */
const bntOpgave = (r) => {
  const netto = r.geheel(2, 40) * 5, tarra = r.geheel(1, 20) * 5, bruto = netto + tarra, t = kies(r, ['bruto', 'netto', 'tarra']);
  if (t === 'bruto') return { vraag: `Netto ${netto} kg en tarra ${tarra} kg. Het brutogewicht is ____ kg`, antwoord: String(bruto), fouten: uniek([netto - tarra, netto, bruto + 5, tarra * 2], bruto).map(String), kern: `b${netto}.${tarra}`, moeilijkheid: [cijfers(bruto)], data: { bnt: t, netto, tarra, bruto } };
  if (t === 'netto') return { vraag: `Bruto ${bruto} kg en tarra ${tarra} kg. Het nettogewicht is ____ kg`, antwoord: String(netto), fouten: uniek([bruto + tarra, bruto, netto + 5, tarra], netto).map(String), kern: `n${bruto}.${tarra}`, moeilijkheid: [cijfers(bruto)], data: { bnt: t, netto, tarra, bruto } };
  return { vraag: `Bruto ${bruto} kg en netto ${netto} kg. De tarra is ____ kg`, antwoord: String(tarra), fouten: uniek([bruto + netto, netto, tarra + 5, bruto], tarra).map(String), kern: `t${bruto}.${netto}`, moeilijkheid: [cijfers(bruto)], data: { bnt: t, netto, tarra, bruto } };
};
export const BRUTONETTO_VORMEN = maakOpgaveVormen({
  id: 'bnt', titel: 'Bruto, netto en tarra', doelen: AUTO_DOELEN.bnt || [], parameters: K.brutoNettoParameters, standaard: { jaar: 5 },
  opdracht: opdracht('Reken uit. Schrijf het gewicht op de lijn.', 'Kies het juiste gewicht. Omcirkel.'), opgave: bntOpgave,
});

/* ------------------------------------------------------------------ massadichtheid */
const dchOpgave = (r, p) => {
  const t = kies(r, p.types), d = r.geheel(2, 9), V = r.geheel(2, 12) * 5, m = d * V;
  if (t === 'd') return { vraag: `Een voorwerp van ${V} cm³ heeft een massa van ${m} g. De massadichtheid is ____ g/cm³`, antwoord: String(d), fouten: uniek([m + V, V - d, d + 1, m / 10 | 0], d).map(String), kern: `d${m}.${V}`, moeilijkheid: [cijfers(m)], data: { dch: t, d, V, m } };
  if (t === 'm') return { vraag: `Een stof heeft een massadichtheid van ${d} g/cm³. ${V} cm³ weegt ____ g`, antwoord: String(m), fouten: uniek([d + V, V / d | 0, m + V, m - d], m).map(String), kern: `m${d}.${V}`, moeilijkheid: [cijfers(m)], data: { dch: t, d, V, m } };
  return { vraag: `Een stof heeft een massadichtheid van ${d} g/cm³. ${m} g neemt ____ cm³ in`, antwoord: String(V), fouten: uniek([m + d, d * m, V + 5, V - 5], V).map(String), kern: `V${d}.${m}`, moeilijkheid: [cijfers(m)], data: { dch: t, d, V, m } };
};
export const DICHTHEID_VORMEN = maakOpgaveVormen({
  id: 'dch', titel: 'Massadichtheid', doelen: AUTO_DOELEN.dch || [], parameters: K.dichtheidParameters, standaard: { types: ['d', 'm', 'V'] }, schaal: 0.84,
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: dchOpgave,
});

/* ------------------------------------------------------------------ prijzen, korting en intrest */
const prsOpgave = (r, p) => {
  const t = kies(r, p.types), euro = (x) => `€ ${komma(Math.round(x * 100), 2)}`;
  const inkoop = r.geheel(8, 120) * 5, winst = r.geheel(2, 30) * 5, ouderPrijs = r.geheel(6, 60) * 10;
  switch (t) {
    case 'winst': return { vraag: `Inkoopprijs ${euro(inkoop)}, verkoopprijs ${euro(inkoop + winst)}. De winst is ____`, antwoord: euro(winst), fouten: uniek([euro(inkoop + winst), euro(inkoop), euro(winst + 5), euro(inkoop + winst + inkoop)], euro(winst)), kern: `w${inkoop}.${winst}`, moeilijkheid: [cijfers(inkoop)], data: { prs: t, inkoop, winst, verkoop: inkoop + winst } };
    case 'verlies': return { vraag: `Inkoopprijs ${euro(inkoop + winst)}, verkoopprijs ${euro(inkoop)}. Het verlies is ____`, antwoord: euro(winst), fouten: uniek([euro(inkoop + winst), euro(inkoop), euro(winst + 5), euro(2 * inkoop + winst)], euro(winst)), kern: `v${inkoop}.${winst}`, moeilijkheid: [cijfers(inkoop)], data: { prs: t, inkoop: inkoop + winst, verkoop: inkoop, verlies: winst } };
    case 'verkoop': return { vraag: `Inkoopprijs ${euro(inkoop)}, winst ${euro(winst)}. De verkoopprijs is ____`, antwoord: euro(inkoop + winst), fouten: uniek([euro(inkoop - winst), euro(winst), euro(inkoop + winst + 5), euro(inkoop * 2)], euro(inkoop + winst)), kern: `vk${inkoop}.${winst}`, moeilijkheid: [cijfers(inkoop)], data: { prs: t, inkoop, winst, verkoop: inkoop + winst } };
    case 'korting': { const korting = Math.floor(ouderPrijs * kies(r, [0.1, 0.2, 0.25, 0.5]) / 5) * 5; if (korting <= 0) return null; return { vraag: `Oude prijs ${euro(ouderPrijs)}, nieuwe prijs ${euro(ouderPrijs - korting)}. De korting is ____`, antwoord: euro(korting), fouten: uniek([euro(ouderPrijs - korting), euro(ouderPrijs), euro(korting + 5), euro(ouderPrijs + korting)], euro(korting)), kern: `k${ouderPrijs}.${korting}`, moeilijkheid: [cijfers(ouderPrijs)], data: { prs: t, oud: ouderPrijs, nieuw: ouderPrijs - korting, korting } }; }
    case 'nieuwe': { const korting = Math.floor(ouderPrijs * kies(r, [0.1, 0.2, 0.25, 0.5]) / 5) * 5; if (korting <= 0) return null; return { vraag: `Oude prijs ${euro(ouderPrijs)}, korting ${euro(korting)}. De nieuwe prijs is ____`, antwoord: euro(ouderPrijs - korting), fouten: uniek([euro(ouderPrijs + korting), euro(korting), euro(ouderPrijs - korting + 5), euro(ouderPrijs)], euro(ouderPrijs - korting)), kern: `n${ouderPrijs}.${korting}`, moeilijkheid: [cijfers(ouderPrijs)], data: { prs: t, oud: ouderPrijs, nieuw: ouderPrijs - korting, korting } }; }
    case 'pct-korting': { const pct = kies(r, [10, 20, 25, 30, 50]), oud = r.geheel(2, 20) * 20, korting = oud * pct / 100; return { vraag: `Oude prijs ${euro(oud)}, ${pct} % korting. De nieuwe prijs is ____`, antwoord: euro(oud - korting), fouten: uniek([euro(korting), euro(oud + korting), euro(oud - pct), euro(oud - korting + 10)], euro(oud - korting)), kern: `pk${oud}.${pct}`, moeilijkheid: [pct], data: { prs: t, oud, pct, nieuw: oud - korting } }; }
    case 'pct-winst': { const pct = kies(r, [10, 20, 25, 50]), inkoopP = r.geheel(2, 20) * 20, w = inkoopP * pct / 100; return { vraag: `Inkoopprijs ${euro(inkoopP)}, winstpercentage ${pct} %. De verkoopprijs is ____`, antwoord: euro(inkoopP + w), fouten: uniek([euro(w), euro(inkoopP - w), euro(inkoopP + pct), euro(inkoopP + w + 10)], euro(inkoopP + w)), kern: `pw${inkoopP}.${pct}`, moeilijkheid: [pct], data: { prs: t, inkoop: inkoopP, pct, verkoop: inkoopP + w } }; }
    case 'intrest': { const pct = kies(r, [1, 2, 3, 4, 5]), kap = r.geheel(2, 20) * 100, jaren = r.geheel(1, 4), i = kap * pct / 100 * jaren; return { vraag: `Kapitaal € ${fmt(kap)}, intrest ${pct} % per jaar, ${jaren} jaar. De intrest is € ____`, antwoord: fmt(i), fouten: uniek([kap * pct / 100, i + kap, i * 10, i / jaren * (jaren + 1)].map(Math.round), i).map(fmt), kern: `i${kap}.${pct}.${jaren}`, moeilijkheid: [cijfers(kap)], data: { prs: t, kap, pct, jaren, intrest: i } }; }
    case 'kapitaal': { const pct = kies(r, [2, 4, 5, 10]), kap = r.geheel(2, 20) * 100, i = kap * pct / 100; return { vraag: `Intrest ${pct} % per jaar na 1 jaar is € ${fmt(i)}. Het kapitaal is € ____`, antwoord: fmt(kap), fouten: uniek([i * pct, i + pct, kap + 100, i * 10], kap).map(fmt), kern: `kp${kap}.${pct}`, moeilijkheid: [cijfers(kap)], data: { prs: t, kap, pct, intrest: i } }; }
    default: { const pct = kies(r, [2, 4, 5]), kap = r.geheel(2, 10) * 100, jaren = r.geheel(2, 5), i = kap * pct / 100 * jaren; return { vraag: `Kapitaal € ${fmt(kap)}, ${pct} % per jaar. De intrest is € ${fmt(i)}. Dat duurt ____ jaar`, antwoord: String(jaren), fouten: uniek([jaren + 1, jaren - 1 || 6, jaren * 2, i / kap | 0], jaren).map(String), kern: `tj${kap}.${pct}.${jaren}`, moeilijkheid: [jaren], data: { prs: 'tijd', kap, pct, jaren, intrest: i } }; }
  }
};
export const PRIJS_VORMEN = maakOpgaveVormen({
  id: 'prs', titel: 'Prijzen, korting en intrest', doelen: AUTO_DOELEN.prs || [], parameters: K.prijsParameters, standaard: { types: ['winst', 'verlies', 'korting'] }, schaal: 0.84,
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: prsOpgave,
});

/* ------------------------------------------------------------------ tijdsduur */
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const DAGEN_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const uurtijd = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}.${String(m % 60).padStart(2, '0')} u`;
const tdsOpgave = (r, p) => {
  const t = kies(r, p.types);
  if (t === 'uren') { const start = r.geheel(6 * 12, 20 * 12) * 5, duur = r.geheel(2, 60) * 5 + 30, einde = start + duur; if (einde >= 24 * 60) return null; const u = Math.floor(duur / 60), m = duur % 60; return { vraag: `Van ${uurtijd(start)} tot ${uurtijd(einde)} duurt ____`, antwoord: `${u} u ${m} min`, fouten: uniek([`${u} u ${60 - m} min`, `${u + 1} u ${m} min`, `${u} u ${m + 10 < 60 ? m + 10 : m - 10} min`, `${Math.floor(einde / 60)} u ${einde % 60} min`], `${u} u ${m} min`), kern: `u${start}.${einde}`, moeilijkheid: [duur], data: { tds: t, start, einde, duur } }; }
  if (t === 'sec') { const min = r.geheel(1, 9), sec = r.geheel(1, 11) * 5; if (r.volgende() < 0.5) return { vraag: `${min} min ${sec} s = ____ s`, antwoord: String(min * 60 + sec), fouten: uniek([min * 100 + sec, min * 60 + sec + 60, min + sec, (min + 1) * 60 + sec], min * 60 + sec).map(String), kern: `s${min}.${sec}`, moeilijkheid: [min], data: { tds: t, min, sec, totaal: min * 60 + sec } }; return { vraag: `${min * 60 + sec} s = ____ min ____ s`.replace('____ min ____ s', '____'), antwoord: `${min} min ${sec} s`, fouten: uniek([`${min} min ${60 - sec} s`, `${min + 1} min ${sec} s`, `${min} min ${sec + 10 < 60 ? sec + 10 : sec - 10} s`], `${min} min ${sec} s`), kern: `m${min}.${sec}`, moeilijkheid: [min], data: { tds: 'sec-naar-min', min, sec, totaal: min * 60 + sec } }; }
  if (t === 'dagen') { const mA = r.geheel(0, 10), dA = r.geheel(1, DAGEN_IN[mA]), mB = r.geheel(mA, mA + 1), dB = r.geheel(1, DAGEN_IN[mB]); if (mB === mA && dB <= dA) return null; const dagen = mB === mA ? dB - dA + 1 : DAGEN_IN[mA] - dA + dB + 1; return { vraag: `Van ${dA} ${MAANDEN[mA]} tot en met ${dB} ${MAANDEN[mB]} (zelfde jaar, geen schrikkeljaar) zijn er ____ dagen`, antwoord: String(dagen), fouten: uniek([dagen - 1, dagen + 1, mB === mA ? dB : DAGEN_IN[mA] + dB - dA, dB - dA + (mB - mA) * 30 + 1], dagen).map(String), kern: `d${mA}.${dA}.${mB}.${dB}`, moeilijkheid: [dagen], data: { tds: t, mA, dA, mB, dB, dagen } }; }
  const jaar = r.geheel(1100, 2020), eeuw = Math.ceil(jaar / 100); if (jaar % 100 === 0) return null;
  return { vraag: `Het jaar ${jaar} ligt in de ____de eeuw`, antwoord: String(eeuw), fouten: uniek([eeuw - 1, eeuw + 1, Math.floor(jaar / 10) % 100, eeuw + 2], eeuw).map(String), kern: `ee${jaar}`, moeilijkheid: [cijfers(jaar)], data: { tds: t, jaar, eeuw } };
};
export const TIJDSDUUR_AUTO_VORMEN = maakOpgaveVormen({
  id: 'tds', titel: 'Tijdsduur en eeuwen', doelen: AUTO_DOELEN.tds || [], parameters: K.tijdsduurParameters, standaard: { types: ['uren', 'sec', 'dagen'] }, schaal: 0.84,
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: tdsOpgave,
});

/* ------------------------------------------------------------------ temperatuurintervallen */
const tmpOpgave = (r) => {
  const a = r.geheel(-15, 25), b = r.geheel(-15, 25), min = (x) => (x < 0 ? `−${-x}` : String(x));
  if (a === b) return null;
  if (r.volgende() < 0.5) { const van = Math.min(a, b), tot = Math.max(a, b); return { vraag: `De temperatuur stijgt van ${min(van)} °C tot ${min(tot)} °C. De stijging is ____ °C`, antwoord: String(tot - van), fouten: uniek([tot + van, Math.abs(tot) - Math.abs(van), tot - van + 1, tot - van - 1].map(x => Math.abs(x)), tot - van).map(String), kern: `ti${van}.${tot}`, moeilijkheid: [Math.abs(tot - van)], data: { tmp: 'stijging', van, tot } }; }
  const van = Math.max(a, b), tot = Math.min(a, b); return { vraag: `De temperatuur daalt van ${min(van)} °C tot ${min(tot)} °C. De daling is ____ °C`, antwoord: String(van - tot), fouten: uniek([Math.abs(van + tot), Math.abs(van) - Math.abs(tot), van - tot + 1, van - tot - 1].map(x => Math.abs(x)), van - tot).map(String), kern: `td${van}.${tot}`, moeilijkheid: [Math.abs(van - tot)], data: { tmp: 'daling', van, tot } };
};
export const TEMPERATUUR_VORMEN = maakOpgaveVormen({
  id: 'tmp', titel: 'Temperatuurintervallen', doelen: AUTO_DOELEN.tmp || [], parameters: K.temperatuurParameters, standaard: { jaar: 5 },
  opdracht: opdracht('Reken uit. Schrijf het verschil in graden op de lijn.', 'Kies het juiste verschil. Omcirkel.'), opgave: tmpOpgave,
});

/* ------------------------------------------------------------------ omtrek, oppervlakte en volume */
const PI_TEKST = '3,14';
const dec2 = (honderdsten) => komma(honderdsten, 2);
const frmOpgave = (r, p) => {
  const t = kies(r, p.types), l = r.geheel(3, 15), b = r.geheel(2, 12), h = r.geheel(2, 10);
  switch (t) {
    case 'omtrek-veelhoek': { const z = Array.from({ length: r.geheel(3, 6) }, () => r.geheel(2, 14)); return { vraag: `Een veelhoek heeft zijden van ${z.join(' cm, ')} cm. De omtrek is ____ cm`, antwoord: String(z.reduce((x, y) => x + y)), fouten: uniek([z.reduce((x, y) => x + y) - z[0], z.reduce((x, y) => x * y) > 5000 ? z[0] * z[1] : z.reduce((x, y) => x * y), z.reduce((x, y) => x + y) + z[0], Math.max(...z) * z.length].filter(x => x > 0), z.reduce((x, y) => x + y)).map(String), kern: `ov${z.join('.')}`, moeilijkheid: [z.length], data: { frm: t, z } }; }
    case 'omtrek-rechthoek': { if (r.volgende() < 0.3) return { vraag: `Een vierkant heeft zijden van ${l} cm. De omtrek is ____ cm`, antwoord: String(4 * l), fouten: uniek([l * l, 2 * l, l + 4, 3 * l], 4 * l).map(String), kern: `ovk${l}`, moeilijkheid: [l], data: { frm: 'omtrek-vierkant', l } }; if (l === b) return null; return { vraag: `Een rechthoek is ${l} cm lang en ${b} cm breed. De omtrek is ____ cm`, antwoord: String(2 * (l + b)), fouten: uniek([l * b, l + b, 2 * l + b, 4 * (l + b)], 2 * (l + b)).map(String), kern: `orh${l}.${b}`, moeilijkheid: [l + b], data: { frm: t, l, b } }; }
    case 'omtrek-samengesteld': { const a = r.geheel(6, 14), c = r.geheel(2, a - 2), d = r.geheel(6, 14), e = r.geheel(2, d - 2); return { vraag: `Een L-vorm heeft buitenmaten ${a} cm en ${d} cm, de uitsparing is ${c} cm bij ${e} cm. De omtrek is ____ cm`, antwoord: String(2 * (a + d)), fouten: uniek([2 * (a + d) - 2 * (c + e), a * d - c * e, 2 * (a + d) + 2 * (c + e), a + d], 2 * (a + d)).map(String), kern: `os${a}.${d}.${c}.${e}`, moeilijkheid: [a + d], data: { frm: t, a, d, c, e } }; }
    case 'opp-rechthoek': { if (r.volgende() < 0.3) return { vraag: `Een vierkant heeft zijden van ${l} cm. De oppervlakte is ____ cm²`, antwoord: String(l * l), fouten: uniek([4 * l, 2 * l, l * l + l, l + l], l * l).map(String), kern: `okv${l}`, moeilijkheid: [l], data: { frm: 'opp-vierkant', l } }; if (l === b) return null; return { vraag: `Een rechthoek is ${l} cm lang en ${b} cm breed. De oppervlakte is ____ cm²`, antwoord: String(l * b), fouten: uniek([2 * (l + b), l + b, l * b * 2, l * l], l * b).map(String), kern: `oh${l}.${b}`, moeilijkheid: [l * b], data: { frm: t, l, b } }; }
    case 'opp-samengesteld': { const a = r.geheel(6, 14), c = r.geheel(2, a - 2), d = r.geheel(6, 14), e = r.geheel(2, d - 2); return { vraag: `Een L-vorm: een rechthoek van ${a} cm bij ${d} cm waaruit een rechthoek van ${c} cm bij ${e} cm is weggehaald. De oppervlakte is ____ cm²`, antwoord: String(a * d - c * e), fouten: uniek([a * d + c * e, a * d, 2 * (a + d), c * e], a * d - c * e).map(String), kern: `osp${a}.${d}.${c}.${e}`, moeilijkheid: [a * d], data: { frm: t, a, d, c, e } }; }
    case 'opp-driehoek': { const bb = 2 * r.geheel(2, 8); return { vraag: `Een driehoek heeft basis ${bb} cm en hoogte ${h} cm. De oppervlakte is ____ cm²`, antwoord: String(bb * h / 2), fouten: uniek([bb * h, bb + h, bb * h / 4, (bb + h) / 2], bb * h / 2).map(nl), kern: `od${bb}.${h}`, moeilijkheid: [bb * h], data: { frm: t, b: bb, h } }; }
    case 'opp-parallellogram': return { vraag: `Een parallellogram heeft basis ${l} cm en hoogte ${h} cm. De oppervlakte is ____ cm²`, antwoord: String(l * h), fouten: uniek([l * h / 2, l + h, 2 * (l + h), l * l], l * h).map(nl), kern: `op${l}.${h}`, moeilijkheid: [l * h], data: { frm: t, b: l, h } };
    case 'opp-ruit': { const d1 = 2 * r.geheel(2, 9), d2 = r.geheel(2, 12); return { vraag: `Een ruit heeft diagonalen van ${d1} cm en ${d2} cm. De oppervlakte is ____ cm²`, antwoord: String(d1 * d2 / 2), fouten: uniek([d1 * d2, d1 + d2, d1 * d2 / 4, 2 * (d1 + d2)], d1 * d2 / 2).map(nl), kern: `or${d1}.${d2}`, moeilijkheid: [d1 * d2], data: { frm: t, d1, d2 } }; }
    case 'opp-trapezium': { const b1 = r.geheel(4, 14), b2 = r.geheel(2, 12), hh = 2 * r.geheel(1, 6); if (b1 === b2) return null; const ant = (b1 + b2) * hh / 2; return { vraag: `Een trapezium heeft evenwijdige zijden van ${b1} cm en ${b2} cm en een hoogte van ${hh} cm. De oppervlakte is ____ cm²`, antwoord: nl(ant), fouten: uniek([(b1 + b2) * hh, b1 * b2 * hh / 2, (b1 + b2) / 2, b1 * hh].map(nl), nl(ant)), kern: `ot${b1}.${b2}.${hh}`, moeilijkheid: [ant], data: { frm: t, b1, b2, h: hh } }; }
    case 'omtrek-cirkel': { const d = r.geheel(2, 20); return { vraag: `Een cirkel heeft een diameter van ${d} cm. De omtrek is ____ cm (π ≈ ${PI_TEKST})`, antwoord: dec2(314 * d), fouten: uniek([dec2(314 * d * d / 2 | 0), dec2(314 * d / 2), dec2(2 * 314 * d), dec2(314 * d * d)], dec2(314 * d)), kern: `oc${d}`, moeilijkheid: [d], data: { frm: t, d, honderdsten: 314 * d } }; }
    case 'opp-cirkel': { const rr = r.geheel(2, 10); return { vraag: `Een cirkel heeft een straal van ${rr} cm. De oppervlakte is ____ cm² (π ≈ ${PI_TEKST})`, antwoord: dec2(314 * rr * rr), fouten: uniek([dec2(2 * 314 * rr), dec2(314 * 4 * rr * rr), dec2(314 * rr), dec2(314 * rr * rr * 2)], dec2(314 * rr * rr)), kern: `ocr${rr}`, moeilijkheid: [rr], data: { frm: t, r: rr, honderdsten: 314 * rr * rr } }; }
    case 'oppv-kubus': { const z = r.geheel(2, 12); return { vraag: `Een kubus heeft ribben van ${z} cm. De totale oppervlakte is ____ cm²`, antwoord: String(6 * z * z), fouten: uniek([z * z, 4 * z * z, 12 * z, z * z * z], 6 * z * z).map(String), kern: `ak${z}`, moeilijkheid: [z], data: { frm: t, z } }; }
    case 'oppv-balk': { if (l === b || b === h || l === h) return null; return { vraag: `Een balk is ${l} cm lang, ${b} cm breed en ${h} cm hoog. De totale oppervlakte is ____ cm²`, antwoord: String(2 * (l * b + l * h + b * h)), fouten: uniek([l * b * h, l * b + l * h + b * h, 2 * l * b, 4 * (l + b + h)], 2 * (l * b + l * h + b * h)).map(String), kern: `ab${l}.${b}.${h}`, moeilijkheid: [l * b], data: { frm: t, l, b, h } }; }
    case 'vol-kubus': { const z = r.geheel(2, 10); return { vraag: `Een kubus heeft ribben van ${z} cm. Het volume is ____ cm³`, antwoord: String(z ** 3), fouten: uniek([3 * z, z * z, 6 * z * z, 3 * z * z], z ** 3).map(String), kern: `vk${z}`, moeilijkheid: [z], data: { frm: t, z } }; }
    case 'vol-balk': { if (l === b || b === h || l === h) return null; return { vraag: `Een balk is ${l} cm lang, ${b} cm breed en ${h} cm hoog. Het volume is ____ cm³`, antwoord: String(l * b * h), fouten: uniek([l + b + h, l * b, 2 * (l * b + l * h + b * h), l * b * h * 2], l * b * h).map(String), kern: `vb${l}.${b}.${h}`, moeilijkheid: [l * b * h], data: { frm: t, l, b, h } }; }
    case 'vol-cilinder': { const rr = r.geheel(2, 8), hh = r.geheel(2, 12); return { vraag: `Een cilinder heeft een straal van ${rr} cm en een hoogte van ${hh} cm. Het volume is ____ cm³ (π ≈ ${PI_TEKST})`, antwoord: dec2(314 * rr * rr * hh), fouten: uniek([dec2(314 * rr * hh), dec2(314 * rr * rr * hh * 2), dec2(314 * rr * rr), dec2(314 * rr * rr * hh / 3 | 0)], dec2(314 * rr * rr * hh)), kern: `vc${rr}.${hh}`, moeilijkheid: [rr * hh], data: { frm: t, r: rr, h: hh, honderdsten: 314 * rr * rr * hh } }; }
    case 'vol-prisma': { const oppG = l * b / 2 * 2, hh = r.geheel(3, 12); return { vraag: `Een recht prisma heeft een grondvlak van ${oppG} cm² en een hoogte van ${hh} cm. Het volume is ____ cm³`, antwoord: String(oppG * hh), fouten: uniek([oppG + hh, oppG * hh / 2, oppG * hh * 2, oppG], oppG * hh).map(nl), kern: `vp${oppG}.${hh}`, moeilijkheid: [oppG * hh], data: { frm: t, grond: oppG, h: hh } }; }
    case 'vol-kegel': { const g = 3 * r.geheel(2, 12), hh = r.geheel(2, 10); return { vraag: `Een cilinder met grondvlak ${g} cm² en hoogte ${hh} cm heeft een kegel met hetzelfde grondvlak en dezelfde hoogte. Het volume van de kegel is ____ cm³`, antwoord: String(g * hh / 3), fouten: uniek([g * hh, g * hh / 2, g * hh * 3, g + hh].map(nl), nl(g * hh / 3)), kern: `vkg${g}.${hh}`, moeilijkheid: [g * hh], data: { frm: t, grond: g, h: hh } }; }
    default: return null;
  }
};
export const FORMULE_VORMEN = maakOpgaveVormen({
  id: 'frm', titel: 'Omtrek, oppervlakte en volume', doelen: AUTO_DOELEN.frm || [], parameters: K.formuleParameters, standaard: { types: ['omtrek-rechthoek', 'opp-rechthoek'] }, schaal: 0.84,
  opdracht: opdracht('Reken uit met de formule. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: frmOpgave,
});

/* ------------------------------------------------------------------ kalender en tijdsbegrippen */
export const DAGNAMEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
export const isSchrikkeljaar = (j) => (j % 4 === 0 && j % 100 !== 0) || j % 400 === 0;
const kalOpgave = (r, p) => {
  const tag = kies(r, p.tags), geheel = (v, fouten, kern, data) => ({ vraag: v[0], antwoord: String(v[1]), fouten: fouten.map(String), kern, moeilijkheid: [1], data });
  switch (tag) {
    case 'week': return kies(r, [
      () => geheel(['Een week heeft ____ dagen', 7], [5, 6, 8], 'w1', { kal: tag, feit: 'week-dagen' }),
      () => geheel(['Het weekend bestaat uit zaterdag en ____', 'zondag'], ['vrijdag', 'maandag', 'woensdag'], 'w2', { kal: tag, feit: 'weekend' }),
      () => geheel(['Een week heeft ____ weekdagen', 5], [4, 6, 7], 'w3', { kal: tag, feit: 'weekdagen' }),
      () => geheel(['Een jaar heeft ongeveer ____ weken', 52], [12, 30, 365], 'w4', { kal: tag, feit: 'jaar-weken' }),
      () => geheel(['Een jaar heeft ____ maanden', 12], [10, 11, 13], 'w5', { kal: tag, feit: 'jaar-maanden' }),
    ])();
    case 'uur': return kies(r, [
      () => geheel(['1 uur = ____ minuten', 60], [30, 100, 24], 'u1', { kal: tag, feit: 'uur-min' }),
      () => geheel(['Een halfuur is ____ minuten', 30], [15, 60, 20], 'u2', { kal: tag, feit: 'halfuur' }),
      () => geheel(['Een kwartier is ____ minuten', 15], [30, 10, 45], 'u3', { kal: tag, feit: 'kwartier' }),
      () => geheel(['1 minuut = ____ seconden', 60], [100, 30, 24], 'u4', { kal: tag, feit: 'min-sec' }),
      () => geheel(['Een dag heeft ____ uur', 24], [12, 60, 48], 'u5', { kal: tag, feit: 'dag-uur' }),
      () => geheel(['Een uur heeft ____ kwartieren', 4], [2, 3, 6], 'u6', { kal: tag, feit: 'uur-kwartier' }),
    ])();
    case 'jaar': { const j = r.geheel(1990, 2040), ja = isSchrikkeljaar(j); return kies(r, [
      () => geheel(['Een gewoon jaar heeft ____ dagen', 365], [360, 364, 366], 'j1', { kal: tag, feit: 'jaar-dagen' }),
      () => geheel(['Een schrikkeljaar heeft ____ dagen', 366], [365, 367, 364], 'j2', { kal: tag, feit: 'schrikkeljaar-dagen' }),
      () => ({ vraag: `Is ${j} een schrikkeljaar?${NBSP.repeat(3)}____`, antwoord: ja ? 'ja' : 'nee', fouten: [ja ? 'nee' : 'ja'], kern: `j${j}`, moeilijkheid: [2], data: { kal: tag, feit: 'schrikkel', jaar: j } }),
    ])(); }
    case 'periode': return kies(r, [
      () => geheel(['Een trimester duurt ____ maanden', 3], [2, 4, 6], 'p1', { kal: tag, feit: 'trimester' }),
      () => geheel(['Een semester duurt ____ maanden', 6], [3, 4, 12], 'p2', { kal: tag, feit: 'semester' }),
      () => geheel(['Een decennium duurt ____ jaar', 10], [5, 100, 12], 'p3', { kal: tag, feit: 'decennium' }),
      () => geheel(['Een eeuw duurt ____ jaar', 100], [10, 50, 1000], 'p4', { kal: tag, feit: 'eeuw' }),
      () => geheel(['Een millennium duurt ____ jaar', 1000], [100, 500, 10000], 'p5', { kal: tag, feit: 'millennium' }),
      () => geheel(['Een jaar heeft ____ trimesters', 4], [2, 3, 6], 'p6', { kal: tag, feit: 'jaar-trimesters' }),
    ])();
    case 'maand': { const i = r.geheel(0, 11); return kies(r, [
      () => geheel([`De ${['eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende', 'achtste', 'negende', 'tiende', 'elfde', 'twaalfde'][i]} maand van het jaar is ____`, MAANDEN[i]], [MAANDEN[(i + 1) % 12], MAANDEN[(i + 11) % 12], MAANDEN[(i + 2) % 12]], `m${i}`, { kal: tag, feit: 'maand-nummer', i }),
      () => geheel([`Na ${MAANDEN[i]} komt ____`, MAANDEN[(i + 1) % 12]], [MAANDEN[(i + 2) % 12], MAANDEN[(i + 11) % 12], MAANDEN[(i + 3) % 12]], `n${i}`, { kal: tag, feit: 'na-maand', i }),
      () => geheel([`${MAANDEN[i][0].toUpperCase() + MAANDEN[i].slice(1)} heeft ____ dagen (geen schrikkeljaar)`, DAGEN_IN[i]], [28, 29, 30, 31].filter(x => x !== DAGEN_IN[i]), `d${i}`, { kal: tag, feit: 'maand-dagen', i }),
    ])(); }
    case 'dagnaam': { const i = r.geheel(0, 6); return kies(r, [
      () => geheel([`Na ${DAGNAMEN[i]} komt ____`, DAGNAMEN[(i + 1) % 7]], [DAGNAMEN[(i + 2) % 7], DAGNAMEN[(i + 6) % 7], DAGNAMEN[(i + 3) % 7]], `dn${i}`, { kal: tag, feit: 'na-dag', i }),
      () => geheel([`Voor ${DAGNAMEN[i]} komt ____`, DAGNAMEN[(i + 6) % 7]], [DAGNAMEN[(i + 1) % 7], DAGNAMEN[(i + 5) % 7], DAGNAMEN[(i + 2) % 7]], `dv${i}`, { kal: tag, feit: 'voor-dag', i }),
    ])(); }
    case 'datum': { const i = r.geheel(0, 11), dag = r.geheel(1, DAGEN_IN[i]), jr = r.geheel(2015, 2030); return geheel([`De datum ${dag}/${String(i + 1).padStart(2, '0')}/${jr} lees je als ${dag} ____ ${jr}`, MAANDEN[i]], [MAANDEN[(i + 1) % 12], MAANDEN[(i + 11) % 12], MAANDEN[(i + 5) % 12]], `da${i}.${dag}`, { kal: tag, feit: 'datum', i, dag, jr }); }
    default: return null;
  }
};
export const KALENDER_VORMEN = maakOpgaveVormen({
  id: 'kal', titel: 'Kalender en tijdsbegrippen', doelen: AUTO_DOELEN.kal || [], parameters: K.kalenderParameters, standaard: { tags: ['week', 'uur', 'maand'] },
  opdracht: opdracht('Vul het ontbrekende woord of getal in.', 'Kies het juiste antwoord. Omcirkel.'), opgave: kalOpgave,
});

export const AUTO_METEN_VORMEN = [...EENHEID_VORMEN, ...HERLEID_VORMEN, ...SCHAAL_VORMEN, ...EVENREDIG_VORMEN, ...SNELHEID_VORMEN, ...BRUTONETTO_VORMEN, ...DICHTHEID_VORMEN, ...PRIJS_VORMEN, ...TIJDSDUUR_AUTO_VORMEN, ...TEMPERATUUR_VORMEN, ...FORMULE_VORMEN, ...KALENDER_VORMEN];
void ggd;
