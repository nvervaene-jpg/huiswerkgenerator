// Laatste wiskundefamilies: aantallen schatten, verhoudingen, optellen en aftrekken tot 20 in contexten, het teken ≈ en de rekenmethode kiezen.
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { fmt, ggd } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && !(typeof x === 'number' && (x < 0 || !Number.isFinite(x))) && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const opdracht = (invullen, kiezen = 'Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
// Rond af op één beduidend cijfer: 912 -> 900, 1 568 -> 2 000.
export const eenCijfer = (n) => { const m = 10 ** (String(Math.round(n)).length - 1); return Math.round(n / m) * m; };

/* ------------------------------------------------------------------ aantallen schatten */
const SCHAT_DINGEN = [['rijen stoelen in een zaal', 'stoelen per rij', 'stoelen'], ['rekken in een winkel', 'blikjes per rek', 'blikjes'], ['dozen in een magazijn', 'eieren per doos', 'eieren'], ['bladzijden in een boek', 'woorden per bladzijde', 'woorden'], ['trays in een bakkerij', 'broodjes per tray', 'broodjes'], ['klassen in een school', 'leerlingen per klas', 'leerlingen']];
const schatOpgave = (r, p) => {
  const [dingen, per, wat] = kies(r, SCHAT_DINGEN), groot = p.max > 1000;
  const a = groot ? r.geheel(20, 90) : r.geheel(5, 25), b = groot ? r.geheel(30, 110) : r.geheel(12, 48), exact = a * b;
  if (exact > p.max || exact < 100) return null;
  const goed = eenCijfer(exact), fout = [eenCijfer(exact * 2), eenCijfer(exact / 2), eenCijfer(exact * 10), eenCijfer(exact / 10)].filter(x => x >= 10 && Math.abs(x - goed) / goed > 0.4);
  if (fout.length < 2) return null;
  return mk(`Er zijn ${a} ${dingen} met elk ongeveer ${b} ${wat}. Hoeveel ${wat} zijn dat ongeveer? ____`, fmt(goed), fout.map(fmt), `sa${a}.${b}.${wat}`, groot ? 2 : 1, { a, b, exact, goed });
};
export const SCHAT_AANTAL_VORMEN = maakOpgaveVormen({
  id: 'sta', titel: 'Aantallen schatten', doelen: AUTO_DOELEN.sta || [], parameters: K.schatAantalParameters, standaard: { max: 1000, jaar: 3 }, vormen: ['kiezen', 'juist-fout'],
  opdracht: opdracht('Schat het aantal.', 'Lees goed. Welke schatting past het best? Omcirkel.'), opgave: schatOpgave,
});

/* ------------------------------------------------------------------ verhoudingen */
const VERH = [['jongens', 'meisjes', 'de klas'], ['rode knikkers', 'blauwe knikkers', 'de zak'], ['sap', 'water', 'het glas'], ['appels', 'peren', 'de mand'], ['witte tegels', 'zwarte tegels', 'de vloer']];
const verhoudingOpgave = (r, p) => {
  const [x, y, plek] = kies(r, VERH), a = r.geheel(1, 4), b = r.geheel(2, 6);
  if (a === b || ggd(a, b) !== 1) return null;
  const soort = kies(r, p.types);
  if (soort === 'lees') {
    const v = r.geheel(0, 2);
    if (v === 0) return mk(`In ${plek} is de verhouding ${x} : ${y} gelijk aan ${a} : ${b}. Op ${a} ${x} zijn er ____ ${y}.`, b, [a, a + b, b + 1, b - 1], `vl${a}.${b}.${x}`, 1, { soort, a, b, wat: 'lees' });
    if (v === 1) { const k = r.geheel(2, 5); return mk(`In ${plek} zijn er ${a * k} ${x} en ${b * k} ${y}. De verhouding ${x} : ${y} is ${a} : ____.`, b, [b * k, a * k, b + 1, a + b], `vm${a}.${b}.${k}`, 2, { soort, a, b, k, wat: 'schrijf' }); }
    return mk(`De verhouding ${x} : ${y} is ${a} : ${b}. Op ${b} ${y} zijn er ____ ${x}.`, a, [b, a + b, a + 1, b - a], `vn${a}.${b}.${x}`, 2, { soort, a, b, wat: 'omgekeerd' });
  }
  const k = r.geheel(2, 9), v = r.geheel(0, 1), kleinA = a * k, kleinB = b * k;
  if (v === 0) return mk(`Verhouding ${x} : ${y} = ${a} : ${b}. Er zijn ${kleinA} ${x}. Hoeveel ${y} zijn er? ____`, kleinB, [kleinA, kleinB + a, kleinB - b, kleinB + b], `vo${a}.${b}.${k}.0`, 2, { soort, a, b, k, wat: 'tweede' });
  return mk(`Verhouding ${x} : ${y} = ${a} : ${b}. Er zijn ${kleinB} ${y}. Hoeveel ${x} zijn er? ____`, kleinA, [kleinB, kleinA + b, kleinA - a, kleinA + a], `vo${a}.${b}.${k}.1`, 2, { soort, a, b, k, wat: 'eerste' });
};
export const VERHOUDING_VORMEN = maakOpgaveVormen({
  id: 'vhd', titel: 'Verhoudingen', doelen: AUTO_DOELEN.vhd || [], parameters: K.verhoudingParameters, standaard: { types: ['lees', 'ontbreekt'], jaar: 6 },
  opdracht: opdracht('Vul het ontbrekende getal in.'), opgave: verhoudingOpgave,
});

/* ------------------------------------------------------------------ optellen en aftrekken tot 20 in contexten */
const DINGEN = ['appels', 'knikkers', 'stickers', 'koekjes', 'autootjes', 'kaarten', 'balpennen', 'bloemen'];
const NAMEN = ['Mila', 'Lars', 'Noor', 'Sam', 'Emma', 'Tom', 'Lotte', 'Jens'];
const contextOpgave = (r) => {
  const dingen = kies(r, DINGEN), n1 = kies(r, NAMEN), n2 = kies(r, NAMEN.filter(x => x !== n1)), soort = kies(r, ['erbij', 'weg', 'verschil', 'aanvullen', 'samen']);
  const a = r.geheel(3, 17), data = { soort };
  if (soort === 'erbij') { const b = r.geheel(2, 20 - a); return mk(`${n1} heeft ${a} ${dingen}. ${n1} krijgt er ${b} bij. Hoeveel ${dingen} heeft ${n1} nu? ____`, a + b, [a - b, a + b + 1, a + b - 1, b], `c+${a}.${b}.${dingen}`, 1, { ...data, a, b, op: '+' }); }
  if (soort === 'weg') { const b = r.geheel(2, a - 1); return mk(`${n1} heeft ${a} ${dingen}. ${n1} geeft er ${b} weg. Hoeveel ${dingen} heeft ${n1} nu? ____`, a - b, [a + b > 20 ? a - b + 1 : a + b, a - b + 1, a - b - 1, b], `c-${a}.${b}.${dingen}`, 1, { ...data, a, b, op: '-' }); }
  if (soort === 'samen') { const b = r.geheel(2, 20 - a); return mk(`${n1} heeft ${a} ${dingen} en ${n2} heeft er ${b}. Hoeveel ${dingen} hebben ze samen? ____`, a + b, [a - b > 0 ? a - b : a + b + 2, a + b + 1, a + b - 1, a], `cs${a}.${b}.${dingen}`, 1, { ...data, a, b, op: '+' }); }
  if (soort === 'verschil') { const b = r.geheel(1, a - 1); return mk(`${n1} heeft ${a} ${dingen} en ${n2} heeft er ${b}. Hoeveel ${dingen} heeft ${n1} meer dan ${n2}? ____`, a - b, [a + b > 20 ? a - b + 2 : a + b, a - b + 1, a - b - 1, b], `cv${a}.${b}.${dingen}`, 2, { ...data, a, b, op: '-' }); }
  const b = r.geheel(a + 1, 20);
  return mk(`${n1} heeft ${a} ${dingen}. ${n1} wil er ${b} hebben. Hoeveel ${dingen} moeten er nog bij? ____`, b - a, [a + b > 20 ? b - a + 2 : a + b, b - a + 1, b - a - 1, a], `ca${a}.${b}.${dingen}`, 2, { ...data, a, b, op: 'aanvullen' });
};
export const TOT20_VORMEN = maakOpgaveVormen({
  id: 't20', titel: 'Optellen en aftrekken tot 20 in een verhaal', doelen: AUTO_DOELEN.t20 || [], parameters: K.tot20ContextParameters, standaard: { max: 20, jaar: 1 },
  opdracht: opdracht('Lees het verhaal. Schrijf het antwoord op de lijn.'), opgave: contextOpgave,
});

/* ------------------------------------------------------------------ het teken ≈ */
const bijnaOpgave = (r) => {
  const v = r.geheel(0, 2);
  if (v === 0) return mk('Welk teken schrijf je voor "is ongeveer gelijk aan"? ____', '≈', ['=', '≠', '<', '>'], 'bt', 1, { wat: 'teken' });
  const a = r.geheel(11, 98), b = r.geheel(11, 98), rond = r.volgende() < 0.5;
  if (rond) { const x = Math.round(a / 10) * 10, y = Math.round(b / 10) * 10; if ((x === a && y === b) || x + y === a + b) return null; return mk(`${a} + ${b} ____ ${x + y}`, '≈', ['=', '≠', '<', '>'], `br${a}.${b}`, 2, { wat: 'schatting', a, b, uit: x + y, juist: a + b === x + y }); }
  return mk(`${a} + ${b} ____ ${a + b}`, '=', ['≈', '≠', '<', '>'], `bg${a}.${b}`, 1, { wat: 'exact', a, b, uit: a + b, juist: true });
};
export const BIJNA_GELIJK_VORMEN = maakOpgaveVormen({
  id: 'bgl', titel: 'Het teken ≈ (ongeveer)', doelen: AUTO_DOELEN.bgl || [], parameters: K.bijnaGelijkParameters, standaard: { jaar: 3 },
  opdracht: opdracht('Vul het juiste teken in: =, ≈, <, > of ≠.'), opgave: bijnaOpgave,
});

/* ------------------------------------------------------------------ de handigste rekenmethode kiezen */
const METHODEN = ['hoofdrekenen', 'schattend rekenen', 'cijferen'];
const CRITERIA = { hoofdrekenen: 'de getallen zijn rond of zijn handig te verschuiven', 'schattend rekenen': 'je hebt maar een ruwe schatting nodig', cijferen: 'de getallen zijn groot en niet rond en het antwoord moet precies zijn', 'digitale rekentool': 'het getal heeft veel cijfers na de komma' };
const methodeOpgave = (r, p) => {
  const soort = kies(r, p.types), groot = p.max > 1000, metTool = p.tool && r.volgende() < 0.3;
  if (soort === 'criterium') {
    const m = metTool ? 'digitale rekentool' : kies(r, p.tool ? [...METHODEN, 'digitale rekentool'] : METHODEN), andere = Object.keys(CRITERIA).filter(x => x !== m && (p.tool || x !== 'digitale rekentool'));
    if (r.volgende() < 0.5) return mk(`${CRITERIA[m][0].toUpperCase()}${CRITERIA[m].slice(1)}. Welke rekenmethode is dan het handigst? ____`, m, andere, `rd${m}`, 2, { soort, methode: m, vorm: 'omgekeerd' });
    return mk(`Je kiest voor ${m} als ____.`, CRITERIA[m], andere.map(x => CRITERIA[x]), `rc${m}`, 2, { soort, methode: m, vorm: 'criterium' });
  }
  if (metTool) { const a = (r.geheel(1234, 9876) / 1000).toFixed(3).replace('.', ','), b = (r.geheel(1234, 9876) / 1000).toFixed(3).replace('.', ','); return mk(`Bereken ${a} × ${b} precies. Wat is het handigst? ____`, 'digitale rekentool', ['hoofdrekenen', 'schattend rekenen'], `rt${a}.${b}`, 3, { soort, methode: 'digitale rekentool', a, b }); }
  const m = kies(r, METHODEN);
  if (m === 'hoofdrekenen') {
    const v = r.geheel(0, 1), a = (groot ? r.geheel(2, 90) * 100 : r.geheel(2, 9) * 100), b = r.geheel(1, 9) * (groot ? 100 : 50);
    if (v === 0) return mk(`Bereken ${fmt(a)} + ${fmt(b)}. Wat is het handigst? ____`, 'hoofdrekenen', ['schattend rekenen', 'cijferen'], `rh${a}.${b}`, 1, { soort, methode: m, som: `${a}+${b}` });
    const c = (groot ? r.geheel(20, 90) * 100 : r.geheel(3, 9) * 100) + r.geheel(1, 3) * 1 + 96;
    return mk(`Bereken ${fmt(c)} − 99. Wat is het handigst? ____`, 'hoofdrekenen', ['schattend rekenen', 'cijferen'], `rk${c}`, 2, { soort, methode: m, som: `${c}-99` });
  }
  if (m === 'schattend rekenen') {
    const a = r.geheel(21, groot ? 98 : 48), b = r.geheel(12, 49);
    return mk(`Je wil snel weten of 20 euro genoeg is voor ${b} stickers van ${a} cent. Wat is het handigst? ____`, 'schattend rekenen', ['hoofdrekenen', 'cijferen'], `rs${a}.${b}`, 2, { soort, methode: m, a, b });
  }
  const a = r.geheel(2, 9) * 1000 + r.geheel(101, 899), b = r.geheel(1, 8) * 1000 + r.geheel(101, 899);
  if (a % 10 === 0 || b % 10 === 0) return null;
  return mk(`Bereken ${fmt(a)} + ${fmt(b)} precies op papier. Wat is het handigst? ____`, 'cijferen', ['hoofdrekenen', 'schattend rekenen'], `rc${a}.${b}`, 2, { soort, methode: m, a, b });
};
export const REKENMETHODE_VORMEN = maakOpgaveVormen({
  id: 'rkm', titel: 'De handigste rekenmethode kiezen', doelen: AUTO_DOELEN.rkm || [], parameters: K.rekenmethodeParameters, standaard: { types: ['methode', 'criterium'], tool: false, max: 1000, jaar: 3 }, vormen: ['kiezen', 'invullen', 'juist-fout'],
  opdracht: opdracht('Schrijf de handigste rekenmethode op: hoofdrekenen, schattend rekenen, cijferen of een digitale rekentool.', 'Welke rekenmethode is het handigst? Omcirkel.'), opgave: methodeOpgave,
});

export const AUTO_AFWERKING_VORMEN = [...SCHAT_AANTAL_VORMEN, ...VERHOUDING_VORMEN, ...TOT20_VORMEN, ...BIJNA_GELIJK_VORMEN, ...REKENMETHODE_VORMEN];
