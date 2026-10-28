// Meten, laatste families: meetresultaten aflezen en metend rekenen, instrument en maateenheid kiezen, seriëren, zinvol afronden,
// indirect meten, inhoud en hoeveelheid, inhoud en massa van water en planning. De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { meetlat, weegschaal } from '../svg.js';
import * as M from '../meten-svg.js';
import { fmt } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && !(typeof x === 'number' && (x < 0 || !Number.isFinite(x))) && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const komma = (x) => String(x).replace('.', ',');
const getal = (x) => Number(String(x).replace(/\s| /g, '').replace(',', '.'));

/* ------------------------------------------------------------------ meetresultaten aflezen en metend rekenen */
const aflezenOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, types = p.types.filter(t => (t !== 'temperatuur' || jaar >= 2) && (t !== 'massa' || jaar >= 2)), soort = kies(r, types), data = { soort };
  if (soort === 'lengte') {
    const lat = jaar <= 1 ? 10 : jaar <= 3 ? 20 : 30, van = jaar >= 2 && r.volgende() < 0.5 ? r.geheel(1, lat - 3) : 0, tot = r.geheel(van + 1, lat);
    return mk('De balk is ____ cm lang.', meetlat({ lengte: lat, van, tot }), tot - van, [tot, van, tot - van + 1, tot - van - 1, lat - tot], `af-l${lat}.${van}.${tot}`, van ? 2 : 1, { ...data, lat, van, tot });
  }
  if (soort === 'massa') { const kg = r.geheel(1, 10); return mk('De weegschaal wijst ____ kg aan.', weegschaal({ waarde: kg, max: 10 }), kg, [kg + 1, kg - 1, kg * 10, 10 - kg], `af-m${kg}`, 1, { ...data, kg }); }
  if (soort === 'temperatuur') { const v = r.geheel(1, 29); return mk('Hoeveel graden Celsius wijst de thermometer aan? ____ °C', M.thermometer({ waarde: v, min: 0, max: 30 }), v, [v + 1, v - 1, v + 5, v - 5], `af-t${v}`, 1, { ...data, v }); }
  if (soort === 'klok') { const h = r.geheel(1, 12); return mk('Hoe laat is het? Het is ____ uur.', M.digitaleKlok(h, 0), h, [h % 12 + 1, h === 1 ? 12 : h - 1, h + 5 <= 12 ? h + 5 : h - 5], `af-k${h}`, 1, { ...data, h }); }
  const w = r.geheel(0, 2);
  if (w === 0) { const a = r.geheel(5, 15), b = r.geheel(2, 9); return mk(`Een potlood is ${a} cm lang. Een gum is ${b} cm lang. Samen zijn ze ____ cm.`, null, a + b, [a - b, a + b + 1, a + b - 1, a], `af-r1.${a}.${b}`, 2, { ...data, wat: 'lengte', a, b, uit: a + b }); }
  if (w === 1) { const a = r.geheel(5, 20) * 10, b = r.geheel(2, 4) * 10; return mk(`Een appel weegt ${a} g. Een peer weegt ${a + b} g. De peer weegt ____ g meer.`, null, b, [a, a + b, b + 10, b - 10], `af-r2.${a}.${b}`, 2, { ...data, wat: 'massa', a, b, uit: b }); }
  const a = r.geheel(4, 12), b = r.geheel(2, 8); return mk(`Een boek kost ${a} euro en een pen kost ${b} euro. Samen kosten ze ____ euro.`, null, a + b, [a - b, a + b + 1, a + b - 1, a * b], `af-r3.${a}.${b}`, 2, { ...data, wat: 'geld', a, b, uit: a + b });
};
export const MEET_AFLEZEN_VORMEN = maakOpgaveVormen({
  id: 'maf', titel: 'Meetresultaten aflezen en metend rekenen', doelen: AUTO_DOELEN.maf || [], parameters: K.meetAflezenParameters, standaard: { types: ['lengte', 'klok'], jaar: 2 }, pictogram: 'meten',
  opdracht: opdracht('Lees af of reken. Schrijf het antwoord op de lijn.'), opgave: aflezenOpgave,
});

/* ------------------------------------------------------------------ een meetinstrument en een maateenheid kiezen */
const INSTRUMENTEN = [['de lengte van een potlood', 'liniaal', 1], ['hoe zwaar een appel is', 'weegschaal', 1], ['de temperatuur buiten', 'thermometer', 1], ['hoe laat het is', 'klok', 1], ['de lengte van een klaslokaal', 'rolmeter', 2], ['hoeveel water er in een kan zit', 'maatbeker', 2], ['hoe lang een loper over 100 meter doet', 'chronometer', 3]];
const EENHEDEN = { lengte: ['mm', 'cm', 'dm', 'm', 'km'], massa: ['mg', 'g', 'kg', 'ton'], inhoud: ['ml', 'cl', 'l', 'hl'], tijd: ['s', 'min', 'u', 'dag'] };
const PASSEND = [['de lengte van een potlood', 'lengte', 'cm', 1], ['de hoogte van een deur', 'lengte', 'm', 1], ['de afstand van school naar de stad', 'lengte', 'km', 3], ['de massa van een appel', 'massa', 'g', 2], ['de massa van een kind', 'massa', 'kg', 1], ['de massa van een vrachtwagen', 'massa', 'ton', 4], ['de inhoud van een emmer', 'inhoud', 'l', 1], ['de inhoud van een theelepel', 'inhoud', 'ml', 3], ['de duur van een film', 'tijd', 'u', 2], ['de duur van een vingerknip', 'tijd', 's', 3]];
const TIJD_INSTRUMENTEN = [['hoe lang je tanden poetst', 'zandloper'], ['hoe lang een rondje rennen duurt', 'chronometer'], ['hoe lang de les duurt', 'klok']];
const kiesMeetOpgave = (r, p) => {
  const jaar = p.jaar ?? 3;
  if (p.tijd) { const [wat, instr] = kies(r, TIJD_INSTRUMENTEN); return mk(`Waarmee meet je ${wat}? Met een ____.`, null, instr, [...TIJD_INSTRUMENTEN.map(x => x[1]), 'liniaal', 'weegschaal'].filter(x => x !== instr), `mk-t${instr}.${wat}`, 1, { soort: 'tijdinstrument', wat, instr }); }
  if (r.volgende() < 0.5) {
    const lijst = INSTRUMENTEN.filter(x => x[2] <= jaar), [wat, instr] = kies(r, lijst);
    return mk(`Waarmee meet je ${wat}? Met een ____.`, null, instr, INSTRUMENTEN.map(x => x[1]).filter(x => x !== instr), `mk-i${instr}.${wat}`, 1, { soort: 'instrument', wat, instr });
  }
  const lijst = PASSEND.filter(x => x[3] <= jaar), [wat, soort, eenheid] = kies(r, lijst), reeks = EENHEDEN[soort], i = reeks.indexOf(eenheid);
  return mk(`Welke maateenheid past het best bij ${wat}? ____`, null, eenheid, reeks.filter((x, j) => Math.abs(j - i) >= 2), `mk-e${eenheid}.${wat}`, 2, { soort: 'eenheid', wat, grootheid: soort, eenheid });
};
export const MEET_KIES_VORMEN = maakOpgaveVormen({
  id: 'mkz', titel: 'Meetinstrument en maateenheid kiezen', doelen: AUTO_DOELEN.mkz || [], parameters: K.meetKiesParameters, standaard: { jaar: 2 }, pictogram: 'meten',
  opdracht: opdracht('Schrijf het juiste meetinstrument of de juiste maateenheid op de lijn.'), opgave: kiesMeetOpgave,
});

/* ------------------------------------------------------------------ meetresultaten ordenen (seriëren) */
const SERIE = {
  lengte: { naam: 'lengtes', eenh: [['cm', 1], ['m', 100]], gemengd: [['cm', 1], ['m', 100]] },
  massa: { naam: 'massa\'s', eenh: [['g', 1], ['kg', 1000]], gemengd: [['g', 1], ['kg', 1000]] },
  temperatuur: { naam: 'temperaturen', eenh: [['°C', 1]], gemengd: [['°C', 1]] },
  tijd: { naam: 'tijden', eenh: [['min', 1]], gemengd: [['min', 1], ['u', 60]] },
};
const serieOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, soort = kies(r, Object.keys(SERIE)), s = SERIE[soort], gemengd = jaar >= 4 && soort !== 'temperatuur' && r.volgende() < 0.6, aantal = jaar <= 2 ? 3 : 4;
  const waarden = new Map();
  for (let i = 0; i < 60 && waarden.size < aantal; i++) {
    let eenheid, w, basis;
    if (gemengd) { const [e, f] = kies(r, s.gemengd); eenheid = e; w = f === 1 ? r.geheel(20, 900) : r.geheel(1, 9) + (r.volgende() < 0.5 ? 0.5 : 0); basis = w * f; }
    else { eenheid = s.eenh[0][0]; w = soort === 'temperatuur' ? r.geheel(-5, 30) : r.geheel(2, jaar <= 2 ? 20 : 99); basis = w; }
    if (![...waarden.values()].some(x => x.basis === basis)) waarden.set(`${w}${eenheid}`, { tekst: `${komma(w)} ${eenheid}`, basis });
  }
  if (waarden.size < aantal) return null;
  const lijst = r.schud([...waarden.values()]), op = r.volgende() < 0.6, gesorteerd = [...lijst].sort((x, y) => (op ? x.basis - y.basis : y.basis - x.basis)).map(x => x.tekst);
  if (lijst.map(x => x.tekst).join() === gesorteerd.join()) return null;
  const omgekeerd = [...gesorteerd].reverse(), wissel = gesorteerd.map((x, i, l) => (i === 0 ? l[1] : i === 1 ? l[0] : x)), wissel2 = gesorteerd.map((x, i, l) => (i === l.length - 1 ? l[l.length - 2] : i === l.length - 2 ? l[l.length - 1] : x));
  return mk(`Zet de ${s.naam} van ${op ? 'klein naar groot' : 'groot naar klein'}: ${lijst.map(x => x.tekst).join(', ')}. ____`, null, gesorteerd.join(', '), [omgekeerd.join(', '), wissel.join(', '), wissel2.join(', ')], `sr${soort}${lijst.map(x => x.tekst).sort().join('|')}${op}`, gemengd ? 3 : 2, { soort, op, lijst: lijst.map(x => x.tekst), basis: Object.fromEntries(lijst.map(x => [x.tekst, x.basis])) });
};
export const MEET_SERIEREN_VORMEN = maakOpgaveVormen({
  id: 'msr', titel: 'Meetresultaten ordenen', doelen: AUTO_DOELEN.msr || [], parameters: K.meetSeriërenParameters, standaard: { jaar: 3 }, pictogram: 'meten',
  opdracht: opdracht('Zet de meetresultaten in de juiste volgorde. Schrijf ze op de lijn.', 'Welke volgorde is juist? Omcirkel.'), opgave: serieOpgave,
});

/* ------------------------------------------------------------------ het resultaat zinvol afronden */
const rondAf = (x, dec) => (Math.round((x + Number.EPSILON) * 10 ** dec) / 10 ** dec).toFixed(dec).replace('.', ',');
const AFRONDEN = [
  { instr: 'Een meetlat geeft millimeters aan.', eenh: 'cm', dec: 1, min: 5, max: 60, teksten: (v) => `Je rekent een lengte uit: ${komma(v)} cm.` },
  { instr: 'Een keukenweegschaal geeft gram aan.', eenh: 'g', dec: 0, min: 50, max: 900, teksten: (v) => `Je rekent een massa uit: ${komma(v)} g.` },
  { instr: 'Geld wordt in centen betaald.', eenh: 'euro', dec: 2, min: 1, max: 50, teksten: (v) => `Je rekent een bedrag uit: ${komma(v)} euro.` },
  { instr: 'Een stopwatch geeft tienden van een seconde aan.', eenh: 's', dec: 1, min: 5, max: 30, teksten: (v) => `Je rekent een tijd uit: ${komma(v)} s.` },
];
const afrondOpgave = (r) => {
  const a = kies(r, AFRONDEN), v = a.min + (r.geheel(0, 99999) / 100000) * (a.max - a.min), tekst = v.toFixed(4), cijfers = tekst.split('.')[1];
  if (cijfers[a.dec] === '5' && /^0*$/.test(cijfers.slice(a.dec + 1))) return null;
  const goed = rondAf(Number(tekst), a.dec), fouten = [rondAf(Number(tekst), a.dec + 1), tekst.replace('.', ','), a.dec > 0 ? rondAf(Number(tekst), a.dec - 1) : rondAf(Number(tekst) / 10, 0) + '0'];
  return mk(`${a.instr} ${a.teksten(tekst)} Hoe schrijf je het meetresultaat zinvol? ____ ${a.eenh}`, null, goed, fouten.filter(x => x !== goed), `za${a.eenh}${tekst}`, 2, { eenheid: a.eenh, v: Number(tekst), dec: a.dec });
};
export const MEET_AFRONDEN_VORMEN = maakOpgaveVormen({
  id: 'mza', titel: 'Een meetresultaat zinvol afronden', doelen: AUTO_DOELEN.mza || [], parameters: K.meetAfrondenParameters, standaard: { jaar: 4 }, pictogram: 'meten',
  opdracht: opdracht('Rond het resultaat zinvol af. Schrijf het op de lijn.'), opgave: afrondOpgave,
});

/* ------------------------------------------------------------------ indirect meten */
const indirectOpgave = (r, p) => {
  const soort = kies(r, p.types), jaar = p.jaar ?? 5;
  if (soort === 'grootheid') {
    if (r.volgende() < 0.5) { const e = r.geheel(2, 8) * 50, w = r.geheel(3, 18) * 50; return mk(`Een lege fles weegt ${e} g. Met water erin weegt de fles ${e + w} g. 1 ml water weegt 1 g. Hoeveel ml water zit er in de fles? ____ ml`, null, w, [e + w, e, w + 50, w - 50], `id-f${e}.${w}`, 2, { soort, wat: 'fles', e, w }); }
    const a = r.geheel(2, 8) * 100, b = a + r.geheel(1, 9) * 50; return mk(`In een maatbeker zit ${a} ml water. Je legt een steen in het water. Nu staat het water op ${b} ml. Hoeveel ml is de steen? ____ ml`, null, b - a, [b, a, b - a + 50, b - a - 50], `id-s${a}.${b}`, 2, { soort, wat: 'steen', a, b });
  }
  const v = r.geheel(0, jaar >= 6 ? 2 : 1);
  if (v === 0) { const l = r.geheel(4, 15), b = r.geheel(2, l - 1); return mk(`Een rechthoek is ${l} cm lang en ${b} cm breed. De oppervlakte is ____ cm².`, null, l * b, [2 * (l + b), l + b, l * b + l, l * b - b], `id-o${l}.${b}`, 2, { soort, wat: 'oppervlakte', l, b }); }
  if (v === 1) { const l = r.geheel(4, 15), b = r.geheel(2, l - 1); return mk(`Een rechthoek is ${l} cm lang en ${b} cm breed. De omtrek is ____ cm.`, null, 2 * (l + b), [l * b, l + b, 2 * l + b, l + 2 * b + 2], `id-u${l}.${b}`, 2, { soort, wat: 'omtrek', l, b }); }
  const l = r.geheel(3, 10), b = r.geheel(2, 6), h = r.geheel(2, 5); return mk(`Een balk is ${l} cm lang, ${b} cm breed en ${h} cm hoog. Het volume is ____ cm³.`, null, l * b * h, [l + b + h, 2 * (l * b + l * h + b * h), l * b, l * b * h + l], `id-v${l}.${b}.${h}`, 3, { soort, wat: 'volume', l, b, h });
};
export const INDIRECT_METEN_VORMEN = maakOpgaveVormen({
  id: 'mid', titel: 'Indirect meten', doelen: AUTO_DOELEN.mid || [], parameters: K.indirectMetenParameters, standaard: { types: ['berekening'], jaar: 5 }, pictogram: 'meten',
  opdracht: opdracht('Meet indirect: reken uit. Schrijf het antwoord op de lijn.'), opgave: indirectOpgave,
});

/* ------------------------------------------------------------------ hoeveelheid en inhoud */
const DRANKEN = ['sap', 'water', 'melk', 'limonade'];
const hoeveelheidOpgave = (r, p) => {
  const c = kies(r, [1, 2, 3, 5, 10]), h = (p.jaar ?? 2) >= 3 ? r.geheel(1, c * 2 - 1) / 2 : r.geheel(1, c - 1), drank = kies(r, DRANKEN);
  if (h >= c || h <= 0) return null;
  const soort = kies(r, ['inhoud', 'hoeveelheid', 'nog']), vorm = (x) => komma(x);
  if (soort === 'inhoud') return mk(`In een fles van ${c} liter zit ${vorm(h)} liter ${drank}. Wat is de inhoud van de fles? ____ liter`, null, c, [h, c - h, c + h].map(vorm), `hi-i${c}.${h}`, 1, { soort, c, h });
  if (soort === 'hoeveelheid') return mk(`In een fles van ${c} liter zit ${vorm(h)} liter ${drank}. Hoeveel ${drank} zit er in de fles? ____ liter`, null, vorm(h), [c, c - h, c + h].map(vorm), `hi-h${c}.${h}`, 1, { soort, c, h });
  return mk(`In een fles van ${c} liter zit ${vorm(h)} liter ${drank}. Hoeveel liter past er nog bij? ____ liter`, null, vorm(c - h), [h, c, c + h].map(vorm), `hi-n${c}.${h}`, 2, { soort, c, h });
};
export const HOEVEELHEID_INHOUD_VORMEN = maakOpgaveVormen({
  id: 'mhi', titel: 'Hoeveelheid en inhoud', doelen: AUTO_DOELEN.mhi || [], parameters: K.hoeveelheidInhoudParameters, standaard: { jaar: 2 }, pictogram: 'meten',
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: hoeveelheidOpgave,
});

/* ------------------------------------------------------------------ inhoud en massa van water */
const inhoudMassaOpgave = (r) => {
  const soort = kies(r, ['l-kg', 'kg-l', 'ml-g', 'g-ml']), n = r.geheel(2, 40) / (soort.startsWith('l') || soort.startsWith('kg') ? 2 : 0.04);
  const hele = soort === 'l-kg' || soort === 'kg-l' ? n : Math.round(n / 50) * 50 || 50, uit = hele;
  if (soort === 'l-kg') return mk(`${komma(hele)} liter water weegt ____ kg.`, null, komma(uit), [komma(hele * 10), komma(hele / 10), komma(hele * 1000)], `im-a${hele}`, 2, { soort, n: hele });
  if (soort === 'kg-l') return mk(`${komma(hele)} kg water heeft een inhoud van ____ liter.`, null, komma(uit), [komma(hele * 10), komma(hele / 10), komma(hele * 1000)], `im-b${hele}`, 2, { soort, n: hele });
  if (soort === 'ml-g') return mk(`${fmt(hele)} ml water weegt ____ g.`, null, fmt(uit), [fmt(hele * 10), fmt(hele / 10), fmt(hele * 1000)].filter(x => x !== fmt(uit)), `im-c${hele}`, 2, { soort, n: hele });
  return mk(`${fmt(hele)} g water heeft een inhoud van ____ ml.`, null, fmt(uit), [fmt(hele * 10), fmt(hele / 10), fmt(hele * 1000)].filter(x => x !== fmt(uit)), `im-d${hele}`, 2, { soort, n: hele });
};
export const INHOUD_MASSA_VORMEN = maakOpgaveVormen({
  id: 'mim', titel: 'Inhoud en massa van water', doelen: AUTO_DOELEN.mim || [], parameters: K.inhoudMassaParameters, standaard: { jaar: 6 }, pictogram: 'meten',
  opdracht: opdracht('Gebruik het verband tussen inhoud en massa van water. Schrijf het antwoord op de lijn.'), opgave: inhoudMassaOpgave,
});

/* ------------------------------------------------------------------ gebeurtenissen ordenen en een planning gebruiken */
const SCHOOLDAG = ['opstaan', 'ontbijten', 'naar school gaan', 'speeltijd', 'middageten', 'naar huis gaan', 'avondeten', 'slapen'];
const WEEK = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const ACTIVITEITEN = ['zwemmen', 'turnen', 'muziek', 'bibliotheek', 'tekenen', 'toneel', 'computer'];
const planningOpgave = (r, p) => {
  const soort = kies(r, p.types);
  if (soort === 'volgorde') {
    const dag = r.volgende() < 0.6, lijst = dag ? SCHOOLDAG : WEEK, drie = r.schud([...lijst.keys()]).slice(0, 3).sort((a, b) => a - b), eerst = r.volgende() < 0.5;
    const antwoord = lijst[eerst ? drie[0] : drie[2]], opties = r.schud(drie.map(i => lijst[i]));
    return mk(`Welke ${dag ? 'gebeurtenis op een schooldag' : 'dag van de week'} komt het ${eerst ? 'eerst' : 'laatst'}: ${opties.join(', ')}? ____`, null, antwoord, drie.map(i => lijst[i]), `pl-v${dag}${drie.join('')}${eerst}`, 1, { soort, dag, lijst: drie.map(i => lijst[i]), eerst });
  }
  const dagen = WEEK.slice(0, 5), acts = r.schud(ACTIVITEITEN).slice(0, 5), plan = dagen.map((d, i) => `${d} ${acts[i]}`).join(', '), i = r.geheel(0, 4);
  if (r.volgende() < 0.5) return mk(`Weekplanning: ${plan}. Wat doen we op ${dagen[i]}? ____`, null, acts[i], acts.filter((_, j) => j !== i), `pl-p${plan}.${i}`, 1, { soort, plan, dag: dagen[i], act: acts[i] });
  return mk(`Weekplanning: ${plan}. Op welke dag is het ${acts[i]}? ____`, null, dagen[i], dagen.filter((_, j) => j !== i), `pl-q${plan}.${i}`, 2, { soort, plan, dag: dagen[i], act: acts[i] });
};
export const PLANNING_VORMEN = maakOpgaveVormen({
  id: 'mpl', titel: 'Volgorde en planning', doelen: AUTO_DOELEN.mpl || [], parameters: K.planningParameters, standaard: { types: ['volgorde', 'planning'], jaar: 1 }, pictogram: 'meten',
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: planningOpgave,
});

export const AUTO_AFWERKING3_VORMEN = [...MEET_AFLEZEN_VORMEN, ...MEET_KIES_VORMEN, ...MEET_SERIEREN_VORMEN, ...MEET_AFRONDEN_VORMEN, ...INDIRECT_METEN_VORMEN, ...HOEVEELHEID_INHOUD_VORMEN, ...INHOUD_MASSA_VORMEN, ...PLANNING_VORMEN];
