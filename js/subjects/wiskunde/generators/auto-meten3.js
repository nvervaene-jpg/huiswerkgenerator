// Meten: verbanden tussen maten (metriek stelsel), referentiematen, meetbegrippen en omtrek/oppervlakte/volume op rooster.
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js). Referentiematen en begrippen zijn gewone, controleerbare feiten: laat ze door een collega nakijken.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import * as M from '../meten-svg.js';
import { fmt } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const nl = (x) => String(x).replace('.', ',');
const cap = (t) => t[0].toUpperCase() + t.slice(1);
const TIEN = (k) => 10 ** k;

/* ------------------------------------------------------------------ verbanden tussen maten */
// Per eenheid de tiendemacht ten opzichte van de basiseenheid van die ladder (l, m², m³, kg).
const LADDERS = {
  inhoud: (j) => [['kl', 3], ['hl', 2], ['dal', 1], ['l', 0], ['dl', -1], ['cl', -2], ['ml', -3]].filter(([e]) => (j <= 2 ? ['l', 'dl'] : j === 3 ? ['l', 'dl', 'cl'] : j === 4 ? ['l', 'dl', 'cl', 'ml'] : [e]).includes(e)),
  opp: (j) => [['km²', 6], ['hm²', 4], ['dam²', 2], ['m²', 0], ['dm²', -2], ['cm²', -4], ['mm²', -6]].filter(([e]) => (j <= 4 ? ['m²', 'dm²', 'cm²'] : [e]).includes(e)),
  vol: () => [['km³', 9], ['hm³', 6], ['dam³', 3], ['m³', 0], ['dm³', -3], ['cm³', -6], ['mm³', -9]],
  massa: (j) => [['kg', 0], ['hg', -1], ['dag', -2], ['g', -3], ['dg', -4], ['cg', -5], ['mg', -6]].filter(([e]) => (j <= 4 ? ['kg', 'hg', 'dag', 'g'] : [e]).includes(e)),
  ton: (j) => [['t', 3], ['kg', 0], ['g', -3], ...(j >= 6 ? [['mg', -6]] : [])],
  land: () => [['ha', 4], ['a', 2], ['m²', 0]],
};
const LADDER_NAAM = { inhoud: 'inhoud', opp: 'oppervlakte', vol: 'volume', massa: 'massa', ton: 'massa', land: 'landmaten' };
// Een maat in een andere eenheid: 10^(verschil)
const maatOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, soort = kies(r, p.types), data = { meten3: 'mvb', soort };
  if (soort === 'inh-vol') {
    const inh = LADDERS.inhoud(6).filter(([e]) => ['l', 'dl', 'cl', 'ml', 'hl'].includes(e)), vol = [['dm³', -3], ['cm³', -6], ['m³', 0]];
    const [ni, ei] = kies(r, inh), [nv, ev] = kies(r, vol), uit = ei - (ev + 3);
    if (uit < 0) { const terug = -uit; return mk(`${fmt(TIEN(terug))} ${ni} = 1 ____`, null, nv, vol.map(x => x[0]), `iv${ni}${nv}`, 4, { ...data, wat: 'vol-naar-inh', van: ni, naar: nv, factor: TIEN(terug), terug: true }); }
    return mk(`1 ${ni} = ____ ${nv}`, null, fmt(TIEN(uit)), [uit + 1, uit - 1, uit + 2, uit + 3].filter(k => k >= 0).map(k => fmt(TIEN(k))), `iv${ni}${nv}`, 4, { ...data, wat: 'inh-naar-vol', van: ni, naar: nv, factor: TIEN(uit) });
  }
  if (soort === 'massa-vol') {
    const n = r.geheel(2, 9), v = kies(r, [['l', 'kg', 1], ['dm³', 'kg', 1], ['ml', 'g', 1], ['cm³', 'g', 1], ['m³', 't', 1]]);
    const vraag = r.volgende() < 0.5 ? `1 ${v[0]} water weegt ____ ${v[1]}.` : `${n} ${v[0]} water weegt ____ ${v[1]}.`, aantal = vraag.startsWith('1 ') ? 1 : n;
    return mk(vraag, null, aantal, [aantal * 10, aantal * 100, aantal * 1000, aantal + 1].filter(x => x !== aantal), `mv${v[0]}${aantal}`, 4, { ...data, eenheid: v[0], massa: v[1], aantal });
  }
  const ladder = LADDERS[soort](jaar), ladderNaam = soort;
  if (ladder.length < 2) return null;
  const idx = r.schud(ladder.map((_, i) => i)), a = ladder[Math.min(idx[0], idx[1])], b = ladder[Math.max(idx[0], idx[1])];
  const eA = a[1], eB = b[1], d = eA - eB, naam = LADDER_NAAM[ladderNaam];
  const fouten = (k, n = 1) => [k + 1, k - 1, k + 2, k - 2, k + 3].filter(x => x >= 0).map(x => fmt(n * TIEN(x)));
  const vorm = kies(r, jaar <= 3 ? ['stap', 'terug-een', 'groot', 'aantal'] : ['stap', 'terug-een', 'groot', 'aantal', 'terug']);
  if (vorm === 'groot') { const drie = r.schud(ladder).slice(0, Math.min(3, ladder.length)); if (drie.length < 2) return null; const groot = drie.reduce((x, y) => (y[1] > x[1] ? y : x)); return mk(`Welke eenheid is het grootst: ${drie.map(x => x[0]).join(', ')}? ____`, null, groot[0], drie.filter(x => x !== groot).map(x => x[0]), `mg${drie.map(x => x[0]).sort().join()}`, 1, { ...data, ladder: ladderNaam, eenheden: drie.map(x => x[0]), groot: groot[0] }); }
  if (vorm === 'stap') return mk(`1 ${a[0]} = ____ ${b[0]}`, null, fmt(TIEN(d)), fouten(d), `ms${a[0]}${b[0]}`, 1 + d, { ...data, ladder: ladderNaam, van: a[0], naar: b[0], factor: TIEN(d), exp: d, wat: 'een' });
  if (vorm === 'terug-een') return mk(`${fmt(TIEN(d))} ${b[0]} = 1 ____`, null, a[0], ladder.filter(x => x !== a).map(x => x[0]), `mt${a[0]}${b[0]}`, 1 + d, { ...data, ladder: ladderNaam, van: b[0], naar: a[0], factor: TIEN(d), wat: 'terug-een' });
  const n = r.geheel(2, 9);
  if (vorm === 'aantal') return mk(`${n} ${a[0]} = ____ ${b[0]}`, null, fmt(n * TIEN(d)), fouten(d, n), `ma${n}${a[0]}${b[0]}`, 2 + d, { ...data, ladder: ladderNaam, van: a[0], naar: b[0], n, factor: TIEN(d), wat: 'aantal' });
  return mk(`${fmt(n * TIEN(d))} ${b[0]} = ____ ${a[0]}`, null, n, [n * 10, n * 100, n + 1, n - 1, fmt(TIEN(d))].filter(x => x !== 0), `mr${n}${a[0]}${b[0]}`, 3 + d, { ...data, ladder: ladderNaam, van: b[0], naar: a[0], n, factor: TIEN(d), wat: 'terug' });
};
export const MAATVERBAND_VORMEN = maakOpgaveVormen({
  id: 'mvb', titel: 'Verbanden tussen maten', doelen: AUTO_DOELEN.mvb || [], parameters: K.maatverbandParameters, standaard: { types: ['inhoud'], jaar: 4 },
  opdracht: opdracht('Vul aan op de lijn.'), opgave: maatOpgave,
});

/* ------------------------------------------------------------------ referentiematen */
// { z: zin met {w} (getal) en {e} (eenheid), w, e, g: grootheid, j: vanaf welk leerjaar, n: naam voor de vergelijking, b: waarde in basiseenheid (m, l, kg, m², m³) }
const REF = [
  { z: 'Een potlood is ongeveer {w} {e} lang.', w: 18, e: 'cm', g: 'lengte', j: 1, n: 'het potlood', b: 0.18 },
  { z: 'Een deur is ongeveer {w} {e} hoog.', w: 2, e: 'm', g: 'lengte', j: 1, n: 'de deur', b: 2 },
  { z: 'Een klaslokaal is ongeveer {w} {e} lang.', w: 8, e: 'm', g: 'lengte', j: 1, n: 'het klaslokaal', b: 8 },
  { z: 'Een kind van 8 jaar is ongeveer {w} {e} groot.', w: 130, e: 'cm', g: 'lengte', j: 1, n: 'het kind', b: 1.3 },
  { z: 'Een voetbalveld is ongeveer {w} {e} lang.', w: 100, e: 'm', g: 'lengte', j: 1, n: 'het voetbalveld', b: 100 },
  { z: 'Een tafel is ongeveer {w} {e} hoog.', w: 75, e: 'cm', g: 'lengte', j: 1, n: 'de tafel', b: 0.75 },
  { z: 'Een nagel van je pink is ongeveer {w} {e} breed.', w: 1, e: 'cm', g: 'lengte', j: 1, n: 'de pinknagel', b: 0.01 },
  { z: 'De afstand van Brussel naar Antwerpen is ongeveer {w} {e}.', w: 45, e: 'km', g: 'lengte', j: 2, n: 'de weg van Brussel naar Antwerpen', b: 45000 },
  { z: 'Een muntstuk van 1 euro is ongeveer {w} {e} dik.', w: 2, e: 'mm', g: 'lengte', j: 3, n: 'het muntstuk', b: 0.002 },
  { z: 'Een ruitje in je schrift is {w} {e} breed.', w: 5, e: 'mm', g: 'lengte', j: 3, n: 'het ruitje', b: 0.005 },
  { z: 'Een marathon is ongeveer {w} {e} lang.', w: 42, e: 'km', g: 'lengte', j: 2, n: 'de marathon', b: 42000 },
  { z: 'Een emmer bevat ongeveer {w} {e}.', w: 10, e: 'l', g: 'inhoud', j: 1, n: 'de emmer', b: 10 },
  { z: 'Een badkuip bevat ongeveer {w} {e}.', w: 150, e: 'l', g: 'inhoud', j: 1, n: 'de badkuip', b: 150 },
  { z: 'Een pak melk bevat {w} {e}.', w: 1, e: 'l', g: 'inhoud', j: 1, n: 'het pak melk', b: 1 },
  { z: 'Een regenton bevat ongeveer {w} {e}.', w: 200, e: 'l', g: 'inhoud', j: 1, n: 'de regenton', b: 200 },
  { z: 'Een glas bevat ongeveer {w} {e}.', w: 2, e: 'dl', g: 'inhoud', j: 2, n: 'het glas', b: 0.2 },
  { z: 'Een koffiekopje bevat ongeveer {w} {e}.', w: 15, e: 'cl', g: 'inhoud', j: 3, n: 'het koffiekopje', b: 0.15 },
  { z: 'Een blikje frisdrank bevat {w} {e}.', w: 33, e: 'cl', g: 'inhoud', j: 3, n: 'het blikje', b: 0.33 },
  { z: 'Een theelepel bevat ongeveer {w} {e}.', w: 5, e: 'ml', g: 'inhoud', j: 4, n: 'de theelepel', b: 0.005 },
  { z: 'Een appel weegt ongeveer {w} {e}.', w: 150, e: 'g', g: 'massa', j: 1, n: 'de appel', b: 0.15 },
  { z: 'Een zak suiker weegt {w} {e}.', w: 1, e: 'kg', g: 'massa', j: 1, n: 'de zak suiker', b: 1 },
  { z: 'Een volwassene weegt ongeveer {w} {e}.', w: 70, e: 'kg', g: 'massa', j: 1, n: 'de volwassene', b: 70 },
  { z: 'Een paperclip weegt ongeveer {w} {e}.', w: 1, e: 'g', g: 'massa', j: 1, n: 'de paperclip', b: 0.001 },
  { z: 'Een pak boter weegt {w} {e}.', w: 250, e: 'g', g: 'massa', j: 1, n: 'het pak boter', b: 0.25 },
  { z: 'Een pasgeboren baby weegt ongeveer {w} {e}.', w: 3, e: 'kg', g: 'massa', j: 1, n: 'de baby', b: 3 },
  { z: 'Een brood weegt ongeveer {w} {e}.', w: 800, e: 'g', g: 'massa', j: 1, n: 'het brood', b: 0.8 },
  { z: 'Een olifant weegt ongeveer {w} {e}.', w: 5, e: 't', g: 'massa', j: 5, n: 'de olifant', b: 5000 },
  { z: 'Een nijlpaard weegt ongeveer {w} {e}.', w: 2, e: 't', g: 'massa', j: 5, n: 'het nijlpaard', b: 2000 },
  { z: 'Een blauwe vinvis weegt ongeveer {w} {e}.', w: 100, e: 't', g: 'massa', j: 5, n: 'de vinvis', b: 100000 },
  { z: 'Een lege bus weegt ongeveer {w} {e}.', w: 12, e: 't', g: 'massa', j: 5, n: 'de bus', b: 12000 },
  { z: 'Een mug weegt ongeveer {w} {e}.', w: 2, e: 'mg', g: 'massa', j: 5, n: 'de mug', b: 0.000002 },
  { z: 'Een druppel water weegt ongeveer {w} {e}.', w: 50, e: 'mg', g: 'massa', j: 5, n: 'de waterdruppel', b: 0.00005 },
  { z: 'Een huisvlieg weegt ongeveer {w} {e}.', w: 12, e: 'mg', g: 'massa', j: 5, n: 'de vlieg', b: 0.000012 },
  { z: 'Een zandkorrel weegt ongeveer {w} {e}.', w: 1, e: 'mg', g: 'massa', j: 5, n: 'de zandkorrel', b: 0.000001 },
  { z: 'Een postzegel heeft een oppervlakte van ongeveer {w} {e}.', w: 4, e: 'cm²', g: 'opp', j: 3, n: 'de postzegel', b: 0.0004 },
  { z: 'Een muntstuk van 1 euro heeft een oppervlakte van ongeveer {w} {e}.', w: 4, e: 'cm²', g: 'opp', j: 4, n: 'het muntstuk', b: 0.0004 },
  { z: 'Een blad A4 heeft een oppervlakte van ongeveer {w} {e}.', w: 6, e: 'dm²', g: 'opp', j: 4, n: 'het blad papier', b: 0.06 },
  { z: 'Een deur heeft een oppervlakte van ongeveer {w} {e}.', w: 2, e: 'm²', g: 'opp', j: 3, n: 'de deur', b: 2 },
  { z: 'Een klaslokaal heeft een oppervlakte van ongeveer {w} {e}.', w: 60, e: 'm²', g: 'opp', j: 3, n: 'het klaslokaal', b: 60 },
  { z: 'Een tennisveld heeft een oppervlakte van ongeveer {w} {e}.', w: 260, e: 'm²', g: 'opp', j: 3, n: 'het tennisveld', b: 260 },
  { z: 'Een voetbalveld heeft een oppervlakte van ongeveer {w} {e}.', w: 70, e: 'a', g: 'opp', j: 6, n: 'het voetbalveld', b: 7000, land: true },
  { z: 'Een voetbalveld heeft een oppervlakte van ongeveer {w} {e}.', w: 0.7, e: 'ha', g: 'opp', j: 6, n: 'het voetbalveld (in ha)', b: 7000, land: true },
  { z: 'Een vierkant veld van 100 m bij 100 m heeft een oppervlakte van {w} {e}.', w: 1, e: 'ha', g: 'opp', j: 6, n: 'het veld van 100 m bij 100 m', b: 10000, land: true },
  { z: 'Een stuk grond van 10 m bij 10 m heeft een oppervlakte van {w} {e}.', w: 1, e: 'a', g: 'opp', j: 6, n: 'het stuk grond van 10 m bij 10 m', b: 100, land: true },
  { z: 'Een tennisveld heeft een oppervlakte van ongeveer {w} {e}.', w: 2.6, e: 'a', g: 'opp', j: 6, n: 'het tennisveld (in a)', b: 260, land: true },
  { z: 'Een klaslokaal heeft een volume van ongeveer {w} {e}.', w: 180, e: 'm³', g: 'vol', j: 6, n: 'het klaslokaal', b: 180 },
  { z: 'Een zwembad van 25 m lang heeft een volume van ongeveer {w} {e}.', w: 600, e: 'm³', g: 'vol', j: 6, n: 'het zwembad', b: 600 },
  { z: 'Een verhuisdoos heeft een volume van ongeveer {w} {e}.', w: 70, e: 'dm³', g: 'vol', j: 6, n: 'de verhuisdoos', b: 0.07 },
  { z: 'Een kubus met een ribbe van 1 cm heeft een volume van {w} {e}.', w: 1, e: 'cm³', g: 'vol', j: 6, n: 'de kubus van 1 cm', b: 0.000001 },
  { z: 'Een kubus met een ribbe van 1 m heeft een volume van {w} {e}.', w: 1, e: 'm³', g: 'vol', j: 6, n: 'de kubus van 1 m', b: 1 },
  { z: 'Een emmer heeft een volume van ongeveer {w} {e}.', w: 10, e: 'dm³', g: 'vol', j: 6, n: 'de emmer', b: 0.01 },
];
const EENHEDEN_VAN = { lengte: ['mm', 'cm', 'dm', 'm', 'km'], inhoud: ['ml', 'cl', 'dl', 'l'], massa: ['mg', 'g', 'kg', 't'], opp: ['cm²', 'dm²', 'm²', 'a', 'ha'], vol: ['cm³', 'dm³', 'm³'] };
const GROOTHEID_TEKST = { lengte: ['langst', 'kortst'], inhoud: ['meest', 'minst'], massa: ['zwaarst', 'lichtst'], opp: ['grootste', 'kleinste'], vol: ['grootste', 'kleinste'] };
const referentieOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, gr = kies(r, p.types);
  let pool = REF.filter(x => x.g === gr && x.j <= jaar);
  if (p.focus === 'mg') pool = pool.filter(x => x.e === 'mg'); else if (p.focus === 'ton') pool = pool.filter(x => x.e === 't'); else if (p.focus === 'land') pool = pool.filter(x => x.land);
  if (!pool.length) return null;
  const item = kies(r, pool), vorm = kies(r, ['eenheid', 'getal', 'vergelijk']), data = { meten3: 'rfm', soort: vorm, gr, zin: item.z, w: item.w, e: item.e, naam: item.n };
  const w = nl(item.w), kernSl = `${item.n}${item.e}`;
  if (vorm === 'eenheid') {
    const eenheden = EENHEDEN_VAN[gr].filter(e => e !== item.e && (jaar >= 6 || e !== 'a' && e !== 'ha')), foute = r.schud(eenheden).slice(0, 4);
    return mk(item.z.replace('{w}', w).replace('{e}', '____'), null, item.e, foute, `re${kernSl}`, 2, data);
  }
  if (vorm === 'getal') {
    const getal = item.w, fouten = [getal * 10, getal * 100, getal / 10, getal * 1000, getal * 2].filter(x => x > 0).map(nl);
    return mk(item.z.replace('{w}', '____').replace('{e}', item.e), null, nl(getal), fouten, `rg${kernSl}`, 2, data);
  }
  const anderen = r.schud(pool.filter(x => x.n !== item.n && x.b / item.b > 5 || x.n !== item.n && item.b / x.b > 5)).slice(0, 2);
  const drie = [item, ...anderen];
  if (drie.length < 3 || new Set(drie.map(x => x.n)).size < 3) return null;
  const groot = r.volgende() < 0.5, woord = GROOTHEID_TEKST[gr][groot ? 0 : 1], antw = drie.reduce((a, c) => ((groot ? c.b > a.b : c.b < a.b) ? c : a));
  if (drie.some(x => x !== antw && Math.abs(Math.log10(x.b / antw.b)) < 0.7)) return null;
  const vraag = gr === 'lengte' ? `Wat is het ${woord}: ${drie.map(x => x.n).join(', ')}? ____` : gr === 'inhoud' ? `Wat bevat het ${woord}: ${drie.map(x => x.n).join(', ')}? ____` : gr === 'massa' ? `Wat is het ${woord}: ${drie.map(x => x.n).join(', ')}? ____` : `Wat heeft ${gr === 'vol' ? 'het' : 'de'} ${woord} ${gr === 'vol' ? 'volume' : 'oppervlakte'}: ${drie.map(x => x.n).join(', ')}? ____`;
  return mk(vraag, null, antw.n, drie.filter(x => x !== antw).map(x => x.n), `rv${drie.map(x => x.n).sort().join()}${groot}`, 3, { ...data, namen: drie.map(x => x.n), groot, antwoordNaam: antw.n });
};
export const REFERENTIE_VORMEN = maakOpgaveVormen({
  id: 'rfm', titel: 'Referentiematen en schatten', doelen: AUTO_DOELEN.rfm || [], parameters: K.referentieParameters, standaard: { types: ['lengte'], jaar: 3 },
  opdracht: opdracht('Schat. Schrijf het antwoord op de lijn.'), opgave: referentieOpgave, schaal: 1.2,
});
export { REF };

/* ------------------------------------------------------------------ meetbegrippen */
const CONTEXTEN = {
  diepte: ['Je meet van boven tot op de bodem van de put. Dat is de ____ van de put.', 'De bodem van het zwembad ligt 2 m onder het water. Dat is de ____ van het zwembad.', 'Een duiker zakt 5 m onder het wateroppervlak. Dat is de ____ waarop hij zwemt.', 'Je meet hoe ver de vijver naar beneden gaat. Dat is de ____ van de vijver.'],
  hoogte: ['Je meet van de grond tot de top van de toren. Dat is de ____ van de toren.', 'Je meet van de grond tot de top van de boom. Dat is de ____ van de boom.', 'Je meet de deur van onder naar boven. Dat is de ____ van de deur.', 'De berg steekt 800 m boven de zee uit. Dat is de ____ van de berg.'],
  lengte: ['Je meet het touw van het ene uiteinde tot het andere. Dat is de ____ van het touw.', 'Je meet de trein van voor tot achter. Dat is de ____ van de trein.', 'Je meet het lint van het begin tot het einde. Dat is de ____ van het lint.', 'Je meet hoe lang de brug is, van oever tot oever. Dat is de ____ van de brug.'],
  afstand: ['Je meet hoever het is van de school naar huis. Dat is de ____ tussen school en huis.', 'Je meet hoever het is van Gent naar Brugge. Dat is de ____ tussen de twee steden.', 'Je meet hoever het is van de start tot de finish. Dat is de ____ tussen start en finish.', 'Je meet hoever het is van de bakker naar de bibliotheek. Dat is de ____ tussen de bakker en de bibliotheek.'],
  inhoud: ['Je meet hoeveel water er in de emmer past. Dat is de ____ van de emmer.', 'Je meet hoeveel sap er in de fles past. Dat is de ____ van de fles.', 'Je meet hoeveel water er in de tank past. Dat is de ____ van de tank.', 'Je meet hoeveel melk er in de kan past. Dat is de ____ van de kan.'],
  omtrek: ['Je loopt één keer rond het voetbalveld. Dat is de ____ van het veld.', 'Je spant een draad langs de rand van de tuin. De lengte van de draad is de ____ van de tuin.', 'Je legt een lint langs de rand van het schilderij. De lengte van het lint is de ____ van het schilderij.', 'Je fietst één keer rond het plein. Dat is de ____ van het plein.'],
};
const ALLE_BEGRIPPEN = ['lengte', 'hoogte', 'diepte', 'afstand', 'inhoud', 'omtrek'];
const DEFINITIES = {
  'def-inhoud': ['De hoeveelheid vloeistof die in een fles kan, noem je de ____ van de fles.', 'De hoeveelheid water die in een emmer past, noem je de ____ van de emmer.', 'De hoeveelheid sap die een kan kan bevatten, noem je de ____ van de kan.'].map(v => [v, 'inhoud', ['volume', 'massa', 'omtrek']]),
  'def-volume': ['De ruimte die een voorwerp inneemt, noem je het ____ van het voorwerp.', 'De ruimte die een kubus inneemt, noem je het ____ van de kubus.', 'De ruimte die een doos inneemt, noem je het ____ van de doos.'].map(v => [v, 'volume', ['oppervlakte', 'omtrek', 'massa']]).concat([
    ['De grootte van het vlak binnen de rand van een figuur noem je de ____ van die figuur.', 'oppervlakte', ['volume', 'omtrek', 'massa']], ['Hoeveel ruimte een blok inneemt, noem je het ____.', 'volume', ['oppervlakte', 'omtrek', 'hoogte']]]),
  'def-gewicht': ['In het dagelijkse leven zeg je vaak gewicht. De wiskundige grootheid heet ____.', 'Je weegt een appel. De grootheid die je meet, heet ____.', 'Een weegschaal meet de ____ van een voorwerp.'].map(v => [v, 'massa', ['volume', 'lengte', 'inhoud']]),
  'def-hoogte': ['De afstand tussen de basis en het overstaande hoekpunt van een driehoek noem je de ____ van de driehoek.', 'De afstand tussen de basis en de overstaande zijde van een parallellogram noem je de ____.', 'De afstand tussen de gekozen basis en het overstaande hoekpunt noem je de ____.'].map(v => [v, 'hoogte', ['omtrek', 'straal', 'diagonaal']]),
  'def-weeg': ['Met een weegschaal meet je de ____ van een voorwerp.', 'Een balans gebruik je om de ____ van voorwerpen te vergelijken.', 'Het meetinstrument om de massa te bepalen, heet een ____.', 'Met een balans vergelijk je de ____ van twee voorwerpen.'].map(v => [v, v.includes('instrument') ? 'weegschaal' : 'massa', v.includes('instrument') ? ['liniaal', 'maatbeker', 'thermometer'] : ['lengte', 'inhoud', 'omtrek']]),
};
const MASSA_PAREN = [['een ijzeren bal', 'een piepschuimen bal'], ['een loden bal', 'een kurken bal'], ['een stenen bol', 'een sponzen bol'], ['een doos vol zand', 'een doos vol watten'], ['een blok metaal', 'een blok hout']];
const INSTR = {
  lengte: [['de lengte van een potlood', 'liniaal'], ['de lengte van een gom', 'liniaal'], ['de lengte van het klaslokaal', 'rolmeter'], ['de lengte van de speelplaats', 'rolmeter'], ['de breedte van een schrift', 'liniaal'], ['de lengte van een tuin', 'rolmeter']],
  inhoud: [['de inhoud van een kan', 'maatbeker'], ['de hoeveelheid melk voor pannenkoeken', 'maatbeker'], ['de inhoud van een glas', 'maatbeker'], ['de inhoud van een fles', 'maatbeker']],
  massa: [['de massa van een appel', 'keukenweegschaal'], ['de massa van jezelf', 'personenweegschaal'], ['de massa van het meel voor een taart', 'keukenweegschaal'], ['de massa van een zak aardappelen', 'keukenweegschaal'], ['je eigen massa', 'personenweegschaal']],
};
const ALLE_INSTR = ['liniaal', 'rolmeter', 'maatbeker', 'keukenweegschaal', 'personenweegschaal', 'thermometer', 'klok'];
const begripOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, soort = kies(r, p.types), data = { meten3: 'mtb', soort };
  if (soort === 'btn') {
    const v = r.geheel(0, 8);
    const lijst = [
      ['De massa van de inhoud zonder verpakking is de ____massa.', 'netto', ['bruto', 'tarra']], ['De massa van de inhoud met verpakking is de ____massa.', 'bruto', ['netto', 'tarra']], ['De massa van de verpakking alleen is de ____massa.', 'tarra', ['netto', 'bruto']],
      ['Bruto = netto + ____', 'tarra', ['bruto', 'netto']], ['Netto = bruto − ____', 'tarra', ['bruto', 'netto']], ['Bruto − tarra = ____', 'netto', ['bruto', 'tarra']], ['Netto + tarra = ____', 'bruto', ['netto', 'tarra']],
      ['Een pak koekjes weegt met het doosje samen 500 g. De massa met doosje heet de ____massa.', 'bruto', ['netto', 'tarra']], ['Een blikje soep weegt zonder blik 400 g. Die massa heet de ____massa.', 'netto', ['bruto', 'tarra']],
    ];
    const [vraag, antw, fouten] = lijst[v];
    return mk(vraag, null, antw, fouten, `bt${v}`, 2, { ...data, antw: antw });
  }
  if (soort === 'ctx') {
    const bg = p.begrippen?.length ? p.begrippen : ['lengte', 'hoogte', 'diepte', 'afstand'], woord = kies(r, bg), i = r.geheel(0, CONTEXTEN[woord].length - 1);
    const eigen = (bg.length >= 2 ? bg : ALLE_BEGRIPPEN).filter(x => x !== woord);
    return mk(CONTEXTEN[woord][i], null, woord, eigen.length >= 2 ? eigen : ALLE_BEGRIPPEN.filter(x => x !== woord), `cx${woord}${i}`, 2, { ...data, woord });
  }
  if (soort === 'straal' || soort === 'pi') {
    const t = soort === 'pi' ? kies(r, ['pi', 'straal', 'diameter']) : kies(r, ['straal', 'diameter', 'verband']);
    if (t === 'pi') { const v = r.geheel(0, 1); return mk(v ? 'De waarde van π is ongeveer ____.' : 'Voor de omtrek van een cirkel gebruik je het getal π. Dat is ongeveer ____.', null, '3,14', ['3,41', '31,4', '1,43', '3,00'], `pi${v}`, 2, { ...data, t }); }
    const x = r.geheel(2, 15), wat = r.volgende() < 0.5;
    if (t === 'verband') return mk(`De diameter van een cirkel is 2 keer de ____.`, null, 'straal', ['omtrek', 'hoogte', 'oppervlakte'], 'cv', 1, { ...data, t });
    if (t === 'straal') return mk(wat ? `De diameter van een cirkel is ${x * 2} cm. De straal is ____ cm.` : `De straal van een cirkel is ${x} cm. De diameter is ____ cm.`, null, wat ? x : x * 2, [wat ? x * 2 : x, x + 2, x - 1, x * 4].filter(y => y > 0), `cs${x}${wat}`, 2, { ...data, t, x, wat });
    return mk(`De lijn door het middelpunt van een cirkel, van rand tot rand, heet de ____.`, null, 'diameter', ['straal', 'omtrek', 'hoogte'], 'cd', 1, { ...data, t });
  }
  if (soort === 'massa-volume') {
    const [zwaar, licht] = kies(r, MASSA_PAREN), vraagGroot = r.volgende() < 0.5;
    const een = zwaar.includes('doos') ? 'De dozen' : zwaar.startsWith('een blok') ? 'De blokken' : zwaar.includes('bol') ? 'De bollen' : 'De ballen';
    const vraag = `${een} zijn even groot: ${zwaar} en ${licht}. Welke heeft de ${vraagGroot ? 'grootste' : 'kleinste'} massa? ____`;
    const [antw, fout] = vraagGroot ? [zwaar, licht] : [licht, zwaar];
    return mk(vraag, null, antw, [fout, 'ze hebben evenveel massa'], `mm${zwaar}${vraagGroot}`, 2, { ...data, zwaar, licht, groot: vraagGroot, antwoordTekst: antw });
  }
  if (soort === 'instr') {
    const g = kies(r, p.instr?.length ? p.instr : ['lengte', 'inhoud', 'massa']), [wat, antw] = kies(r, INSTR[g]);
    return mk(`Je wilt ${wat} meten. Welk meetinstrument kies je? ____`, null, antw, ALLE_INSTR.filter(x => x !== antw && !(antw.endsWith('weegschaal') && x.endsWith('weegschaal'))), `in${wat}`, 2, { ...data, g, wat, antwoordTekst: antw });
  }
  const lijst = DEFINITIES[soort];
  if (!lijst) return null;
  const i = r.geheel(0, lijst.length - 1), [vraag, antw, fouten] = lijst[i];
  return mk(vraag, null, antw, fouten, `${soort}${i}`, 1, { ...data, antwoordTekst: antw });
};
export const MEETBEGRIP_VORMEN = maakOpgaveVormen({
  id: 'mtb', titel: 'Meetbegrippen en meetinstrumenten', doelen: AUTO_DOELEN.mtb || [], parameters: K.meetbegripParameters, standaard: { types: ['ctx'], jaar: 3 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: begripOpgave,
});

/* ------------------------------------------------------------------ omtrek, oppervlakte en volume op rooster */
const buren = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
// Samenhangende figuur van n vierkantjes in een vak van hoogstens bm x hm, zonder gaten.
function polyomino(r, n, bm = 7, hm = 5) {
  for (let t = 0; t < 300; t++) {
    const cellen = [[r.geheel(0, bm - 1), r.geheel(0, hm - 1)]];
    while (cellen.length < n) {
      const [x, y] = cellen[r.geheel(0, cellen.length - 1)], [nx, ny] = kies(r, buren([x, y]));
      if (nx < 0 || ny < 0 || nx >= bm || ny >= hm || cellen.some(c => c[0] === nx && c[1] === ny)) continue;
      cellen.push([nx, ny]);
    }
    const mx = Math.min(...cellen.map(c => c[0])), my = Math.min(...cellen.map(c => c[1])), norm = cellen.map(([x, y]) => [x - mx, y - my]);
    const B = Math.max(...norm.map(c => c[0])) + 1, H = Math.max(...norm.map(c => c[1])) + 1, heeft = (x, y) => norm.some(c => c[0] === x && c[1] === y);
    // gaten: een leeg vakje dat niet via lege vakjes de rand van het omhullende vak bereikt
    const buiten = new Set(), stapel = [];
    for (let x = -1; x <= B; x++) for (let y = -1; y <= H; y++) if ((x === -1 || y === -1 || x === B || y === H)) { stapel.push([x, y]); buiten.add(`${x},${y}`); }
    while (stapel.length) for (const [a, b] of buren(stapel.pop())) if (a >= -1 && b >= -1 && a <= B && b <= H && !heeft(a, b) && !buiten.has(`${a},${b}`)) { buiten.add(`${a},${b}`); stapel.push([a, b]); }
    let gat = false; for (let x = 0; x < B; x++) for (let y = 0; y < H; y++) if (!heeft(x, y) && !buiten.has(`${x},${y}`)) gat = true;
    if (!gat) return norm;
  }
  return null;
}
const omtrekVan = (cellen) => cellen.reduce((s, c) => s + buren(c).filter(b => !cellen.some(d => d[0] === b[0] && d[1] === b[1])).length, 0);
const DIM_ITEMS = {
  lengte: [['de lengte van een potlood', 'cm'], ['de lengte van de speelplaats', 'm'], ['de hoogte van een toren', 'm'], ['de afstand tussen twee steden', 'km'], ['de omtrek van een tuin', 'm'], ['de omtrek van een munt', 'mm']],
  opp: [['de oppervlakte van een postzegel', 'cm'], ['de oppervlakte van een klaslokaal', 'm'], ['de oppervlakte van een blad papier', 'dm'], ['de oppervlakte van een voetbalveld', 'm'], ['de oppervlakte van een tafelblad', 'dm']],
  vol: [['het volume van een dobbelsteen', 'cm'], ['het volume van een zwembad', 'm'], ['het volume van een verhuisdoos', 'dm'], ['het volume van een klaslokaal', 'm']],
};
const rasterOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, soort = kies(r, p.types), data = { meten3: 'omr', soort };
  if (soort === 'omtrek' || soort === 'opp') {
    const cellen = jaar <= 3 ? (() => { const b = r.geheel(2, 6), h = r.geheel(2, 4); return Array.from({ length: b * h }, (_, i) => [i % b, Math.floor(i / b)]); })() : polyomino(r, r.geheel(5, 11));
    if (!cellen) return null;
    const svg = M.celFiguren([{ id: 'A', cellen }]), sl = cellen.map(c => c.join('.')).sort().join();
    const tekst = 'Elk vierkantje is 1 cm bij 1 cm.';
    return soort === 'omtrek'
      ? mk(`${tekst} Hoe groot is de omtrek van de figuur? ____ cm`, svg, omtrekVan(cellen), [omtrekVan(cellen) + 2, omtrekVan(cellen) - 2, cellen.length, omtrekVan(cellen) + 4].filter(x => x > 0), `ot${sl}`, jaar, { ...data, aantal: cellen.length, omtrek: omtrekVan(cellen) })
      : mk(`${tekst} Hoe groot is de oppervlakte van de figuur? ____ cm²`, svg, cellen.length, [cellen.length + 1, cellen.length - 1, omtrekVan(cellen), cellen.length + 2].filter(x => x > 0), `op${sl}`, jaar, { ...data, aantal: cellen.length });
  }
  if (soort === 'kubus') {
    const l = r.geheel(2, 5), b = r.geheel(2, 3), h = r.geheel(2, 4), vorm = kies(r, ['aantal', 'volume', 'laag']);
    const svg = M.kubusBlok({ l, b, h }), n = l * b * h;
    if (vorm === 'laag') return mk('De balk is gebouwd met kubusjes van 1 cm³. Hoeveel kubusjes liggen er in één laag? ____', svg, l * b, [l * b + l, n, l + b, l * b - 1], `kl${l}.${b}.${h}`, 3, { ...data, l, b, h, vorm });
    return mk(vorm === 'aantal' ? 'De balk is gebouwd met kubusjes van 1 cm³. Hoeveel kubusjes zijn er? ____' : 'De balk is gebouwd met kubusjes van 1 cm³. Het volume van de balk is ____ cm³.', svg, n, [n + l * b, n - l, l + b + h, n + 6, (l * b + l * h + b * h)], `ku${l}.${b}.${h}${vorm}`, 4, { ...data, l, b, h, vorm });
  }
  if (soort === 'zelfde') {
    const N = kies(r, [12, 16, 18, 20, 24, 30, 36]), paren = [];
    for (let a = 2; a <= 9; a++) if (N % a === 0 && N / a >= a && N / a <= 9) paren.push([a, N / a]);
    if (paren.length < 2) return null;
    const keuze = r.schud(paren).slice(0, 2), mkCel = (a, b) => Array.from({ length: a * b }, (_, i) => [i % b, Math.floor(i / b)]);
    const A = keuze[0], B = keuze[1], svg = M.celFiguren([{ id: 'A', cellen: mkCel(A[0], A[1]) }, { id: 'B', cellen: mkCel(B[0], B[1]) }], { label: true });
    const omA = 2 * (A[0] + A[1]), omB = 2 * (B[0] + B[1]), vorm = kies(r, ['grootste', 'kleinste', 'omtrek']);
    const kern = `zf${A.join('x')}.${B.join('x')}`;
    if (vorm === 'omtrek') return mk('Elk vierkantje is 1 cm bij 1 cm. Figuur A en B hebben dezelfde oppervlakte. Hoe groot is de omtrek van figuur A? ____ cm', svg, omA, [omB, N, omA + 2, omA - 2], `${kern}om`, 4, { ...data, vorm, N, A, B, omA, omB });
    const groot = vorm === 'grootste', antw = (groot ? omA > omB : omA < omB) ? 'A' : 'B';
    return mk(`Elk vierkantje is 1 cm bij 1 cm. Figuur A en B hebben dezelfde oppervlakte. Welke figuur heeft de ${groot ? 'grootste' : 'kleinste'} omtrek? ____`, svg, antw, [antw === 'A' ? 'B' : 'A', 'even groot'], `${kern}${vorm}`, 4, { ...data, vorm, N, A, B, omA, omB, antwoordTekst: antw });
  }
  const gr = kies(r, jaar >= 6 ? ['lengte', 'opp', 'vol'] : ['lengte', 'opp']), [wat, basis] = kies(r, DIM_ITEMS[gr]), exp = gr === 'lengte' ? 1 : gr === 'opp' ? 2 : 3;
  const eenheid = (e) => (e === 1 ? basis : e === 2 ? `${basis}²` : `${basis}³`);
  return mk(`Je meet ${wat}. Welke eenheid gebruik je? ____`, null, eenheid(exp), [1, 2, 3].filter(e => e !== exp).map(eenheid), `dm${wat}`, 2, { ...data, gr, exp, basis, wat });
};
export const OMTREK_ROOSTER_VORMEN = maakOpgaveVormen({
  id: 'omr', titel: 'Omtrek, oppervlakte en volume tellen', doelen: AUTO_DOELEN.omr || [], parameters: K.omtrekRoosterParameters, standaard: { types: ['omtrek'], jaar: 4 },
  opdracht: opdracht('Kijk goed. Tel. Schrijf het antwoord op de lijn.'), opgave: rasterOpgave, schaal: 1,
});

export const AUTO_METEN3_VORMEN = [...MAATVERBAND_VORMEN, ...REFERENTIE_VORMEN, ...MEETBEGRIP_VORMEN, ...OMTREK_ROOSTER_VORMEN];
