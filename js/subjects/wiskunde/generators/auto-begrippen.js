// Begrippen en situaties bij bewerkingen (bgw, sit), gehele getallen (gtl) en begrippen bij rationale getallen (rtb).
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js). De begrippen komen letterlijk uit de doelen; de voorbeeldzinnen zijn gewone, controleerbare situaties.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { getallenas } from '../svg.js';
import { fmt, ggd } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Lees goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const MIN = '−';
const neg = (n) => (n < 0 ? `${MIN}${-n}` : String(n));
const nl = (x) => String(x).replace('.', ',');
const NAMEN = ['Lotte', 'Jan', 'Emma', 'Noor', 'Milan', 'Elias'];
const DINGEN = [['stickers', 'sticker'], ['knikkers', 'knikker'], ['appels', 'appel'], ['koekjes', 'koekje'], ['potloden', 'potlood'], ['kaarten', 'kaart']];
const breuk = (a, b) => { const g = ggd(Math.abs(a), b); return b / g === 1 ? String(a / g) : `${a / g}/${b / g}`; };

/* ------------------------------------------------------------------ begrippen bij bewerkingen */
const OOR_VER = [
  (n, a, b, d) => `${n} heeft ${a} ${d}. ${n} krijgt er ${b} bij.`, (n, a, b, d) => `${n} heeft ${a} ${d}. ${n} geeft er ${b} weg.`,
  (n, a, b) => `Er zitten ${a} kinderen op de bus. Er stappen ${b} kinderen uit.`, (n, a, b) => `Er zitten ${a} kinderen op de bus. Er stappen ${b} kinderen bij.`,
];
const COMBI = [
  (n, a, b, d) => `In de doos zitten ${a} rode en ${b} blauwe ${d}. Hoeveel ${d} zitten er samen in de doos?`, (n, a, b) => `In de klas zijn ${a + b} kinderen. ${a} kinderen zijn meisjes. Hoeveel jongens zijn het?`,
  (n, a, b) => `Er zijn ${a} meisjes en ${b} jongens. Hoeveel kinderen zijn dat samen?`,
];
const VERGELIJK = [
  (n, a, b) => `${n} is ${a + b} jaar. Jan is ${a} jaar. Hoeveel jaar is ${n} ouder dan Jan?`, (n, a, b) => `Een boek kost ${a + b} euro. Een pen kost ${a} euro. Hoeveel is het boek duurder dan de pen?`,
  (n, a, b, d) => `${n} heeft ${a + b} ${d}. Jan heeft ${a} ${d}. Hoeveel ${d} heeft ${n} meer dan Jan?`,
];
const KEER_SOORTEN = {
  keerhandeling: [(a, b, d) => `${a} keer krijg je ${b} ${d}.`, (a, b) => `Lotte doet ${a} keer een sprong van ${b} stappen.`, (a, b, d) => `Je neemt ${a} keer ${b} ${d} uit de doos.`],
  rooster: [(a, b) => `In de zaal staan ${a} rijen stoelen met in elke rij ${b} stoelen.`, (a, b) => `Op het bord staan ${a} rijen met ${b} vakjes per rij.`, (a, b) => `De tuin heeft ${a} rijen met ${b} plantjes in elke rij.`],
  vergelijking: [(a, b) => `Jan heeft ${a} keer zoveel knikkers als Lotte. Lotte heeft ${b} knikkers.`, (a, b) => `De toren van Emma is ${a} keer zo hoog als de toren van Jan. De toren van Jan is ${b} blokken hoog.`, (a, b) => `Een boek kost ${a} keer zoveel als een schrift. Het schrift kost ${b} euro.`],
  combinatie: [(a, b) => `Je hebt ${a} truien en ${b} broeken. Je zoekt alle mogelijke combinaties van een trui met een broek.`, (a, b) => `Er zijn ${a} soorten brood en ${b} soorten beleg. Je zoekt alle combinaties van een soort brood met een soort beleg.`, (a, b) => `Een ijsje bestaat uit één bol uit ${a} smaken en één topping uit ${b} soorten. Je zoekt alle combinaties.`],
};
const bewerkingBegripOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, soort = kies(r, p.types), data = { begrip2: 'bgw', soort };
  switch (soort) {
    case 'notatie-plus': {
      const lijst = [['optellen', '+'], ['aftrekken', MIN], ['is gelijk aan', '='], ['is niet gelijk aan', '≠']], [w, t] = kies(r, lijst);
      if (r.volgende() < 0.25) return mk('In 12 − (5 + 2) reken je eerst ____ uit. (5 + 2 of 12 − 5)', null, '5 + 2', ['12 − 5'], 'np0', 2, { ...data, wat: 'haakjes' });
      return mk(`Welk teken hoort bij "${w}"? ____`, null, t, ['+', MIN, '=', '≠'], `np${t}`, 1, { ...data, wat: 'teken', woord: w, teken: t });
    }
    case 'notatie-maal': { const [w, t] = kies(r, [['vermenigvuldigen', '×'], ['delen', ':'], ['maal', '×'], ['gedeeld door', ':']]); return mk(`Welk teken hoort bij "${w}"? ____`, null, t, ['×', ':', '+', MIN], `nm${w}`, 1, { ...data, wat: 'teken', woord: w, teken: t }); }
    case 'optel': {
      const a = r.geheel(2, 15), b = r.geheel(2, 15), v = r.geheel(0, 5);
      if (a === b) return null;
      if (v === 0) return mk(`In ${a} + ${b} = ${a + b} heet ${a + b} de ____. (som, verschil of term)`, null, 'som', ['verschil', 'term'], `ob0.${a}.${b}`, 1, { ...data, a, b, wat: 'som' });
      if (v === 1) return mk(`In ${a} + ${b} = ${a + b} heten ${a} en ${b} de ____. (termen of verschillen)`, null, 'termen', ['verschillen', 'sommen'], `ob1.${a}.${b}`, 1, { ...data, a, b, wat: 'termen' });
      if (v === 2) { const g = Math.max(a, b), k = Math.min(a, b); return mk(`In ${g} − ${k} = ${g - k} heet ${g - k} het ____. (verschil, som of term)`, null, 'verschil', ['som', 'term'], `ob2.${g}.${k}`, 1, { ...data, a: g, b: k, wat: 'verschil' }); }
      if (v === 3) { const t = kies(r, [10, 20]), x = r.geheel(1, t - 1); return mk(`Aanvullen tot ${t}: ${x} + ____ = ${t}`, null, t - x, [x, t - x + 1, t - x - 1, t], `ob3.${t}.${x}`, 2, { ...data, wat: 'aanvullen', t, x }); }
      if (v === 4) { const g = r.geheel(8, 20), k = r.geheel(2, g - 3); return mk(`Wegdoen tot ${k}: ${g} − ____ = ${k}`, null, g - k, [k, g, g - k + 1, g + k], `ob4.${g}.${k}`, 2, { ...data, wat: 'wegdoen', g, k }); }
      return mk(`${a} plus ${b} schrijf je als ${a} ____ ${b}.`, null, '+', [MIN, '×', ':'], `ob5.${a}.${b}`, 1, { ...data, wat: 'plus', a, b });
    }
    case 'maal': {
      const a = r.geheel(2, 9), b = r.geheel(2, 9), v = r.geheel(0, 4);
      if (v === 0) return mk(`In ${a} × ${b} = ${a * b} heet ${a * b} het ____. (product of quotiënt)`, null, 'product', ['quotiënt', 'som'], `mb0.${a}.${b}`, 1, { ...data, a, b, wat: 'product' });
      if (v === 1) return mk(`In ${a * b} : ${b} = ${a} heet ${a} het ____. (quotiënt of product)`, null, 'quotiënt', ['product', 'verschil'], `mb1.${a}.${b}`, 1, { ...data, a, b, wat: 'quotiënt' });
      if (v === 2) return mk(`In ${a} × ${b} = ${a * b} heten ${a} en ${b} de ____. (factoren of termen)`, null, 'factoren', ['termen', 'quotiënten'], `mb2.${a}.${b}`, 1, { ...data, a, b, wat: 'factoren' });
      if (v === 3) return mk(`${a} keer ${b} = ____`, null, a * b, [a + b, a * b + b, a * b - a], `mb3.${a}.${b}`, 1, { ...data, a, b, wat: 'keer' });
      return mk(`${a * b} gedeeld door ${b} = ____`, null, a, [a * b, b, a + 1, a - 1].filter(x => x > 0), `mb4.${a}.${b}`, 1, { ...data, a, b, wat: 'gedeeld' });
    }
    case 'aftrektal': {
      const a = r.geheel(6, 20), b = r.geheel(2, a - 1), q = r.geheel(2, 9), d = r.geheel(2, 9), v = r.geheel(0, 3);
      if (v === 0) return mk(`In ${a} − ${b} = ${a - b} is ${a} het ____. (aftrektal of aftrekker)`, null, 'aftrektal', ['aftrekker', 'verschil'], `at0.${a}.${b}`, 2, { ...data, a, b, wat: 'aftrektal' });
      if (v === 1) return mk(`In ${a} − ${b} = ${a - b} is ${b} de ____. (aftrekker of aftrektal)`, null, 'aftrekker', ['aftrektal', 'verschil'], `at1.${a}.${b}`, 2, { ...data, a, b, wat: 'aftrekker' });
      if (v === 2) return mk(`In ${q * d} : ${d} = ${q} is ${q * d} het ____. (deeltal of deler)`, null, 'deeltal', ['deler', 'quotiënt'], `at2.${q}.${d}`, 2, { ...data, q, d, wat: 'deeltal' });
      return mk(`In ${q * d} : ${d} = ${q} is ${d} de ____. (deler of deeltal)`, null, 'deler', ['deeltal', 'quotiënt'], `at3.${q}.${d}`, 2, { ...data, q, d, wat: 'deler' });
    }
    case 'opgaand': {
      const d = r.geheel(2, 9), n = r.geheel(10, 60), opg = n % d === 0;
      return mk(`${n} : ${d} is een ____ deling. (opgaande of niet-opgaande)`, null, opg ? 'opgaande' : 'niet-opgaande', [opg ? 'niet-opgaande' : 'opgaande'], `og${n}.${d}`, 2, { ...data, n, d });
    }
    case 'splitsen': {
      const v = r.geheel(0, 2);
      if (v === 0) { const n = r.geheel(4, 12), a = r.geheel(1, n - 1); return mk(`${n} = ${a} + ${n - a}. Dit noem je ____. (splitsen of verdelen)`, null, 'splitsen', ['verdelen'], `sp0.${n}.${a}`, 1, { ...data, wat: 'splitsen' }); }
      if (v === 1) { const k = r.geheel(2, 5), e = r.geheel(2, 6), [dn] = kies(r, DINGEN); return mk(`${k * e} ${dn} eerlijk over ${k} kinderen delen. Dit noem je ____. (splitsen of verdelen)`, null, 'verdelen', ['splitsen'], `sp1.${k}.${e}${dn}`, 1, { ...data, wat: 'verdelen' }); }
      const n = r.geheel(5, 12); return mk(`Je maakt van ${n} twee kleinere getallen. Dit noem je ____. (splitsen of verdelen)`, null, 'splitsen', ['verdelen'], `sp2.${n}`, 1, { ...data, wat: 'splitsen' });
    }
    case 'plaats': {
      const a = r.geheel(2, 9), b = r.geheel(2, 9), v = r.geheel(0, 3);
      if (a === b) return null;
      if (v === 0) return mk(`${a} + ${b} = ____ + ${a}`, null, b, [a, a + b, b + 1], `pl0.${a}.${b}`, 1, { ...data, a, b, wat: 'optellen' });
      if (v === 1) return mk(`${a} × ${b} = ____ × ${a}`, null, b, [a, a * b, b + 1], `pl1.${a}.${b}`, 1, { ...data, a, b, wat: 'maal' });
      const g = Math.max(a, b), k = Math.min(a, b), op = v === 2 ? [`${g} − ${k}`, 'aftrekken'] : [`${g * k} : ${k}`, 'delen'];
      return mk(`Mag je bij ${op[0]} de getallen van plaats wisselen en krijg je hetzelfde? ____`, null, 'nee', ['ja'], `pl${v}.${g}.${k}`, 2, { ...data, wat: op[1] });
    }
    case 'omgekeerd': {
      const a = r.geheel(3, 15), b = r.geheel(2, 9), c = r.geheel(2, 9), v = r.geheel(0, 3);
      if (v === 0) return mk(`${a} + ${b} = ${a + b}. De omgekeerde bewerking is ${a + b} − ${b} = ____.`, null, a, [b, a + b, a + 1], `om0.${a}.${b}`, 2, { ...data, a, b, wat: 'plus' });
      if (v === 1) return mk(`${b} × ${c} = ${b * c}. De omgekeerde bewerking is ${b * c} : ${c} = ____.`, null, b, [c, b * c, b + 1], `om1.${b}.${c}`, 2, { ...data, b, c, wat: 'maal' });
      if (v === 2) return mk('Welke bewerking is de omgekeerde bewerking van optellen? ____', null, 'aftrekken', ['vermenigvuldigen', 'delen'], 'om2', 1, { ...data, wat: 'woord' });
      return mk(`Je schakelt bewerkingen aaneen: ${a} + ${b} − ${b} = ____`, null, a, [b, a + b, a - b, a + 2 * b].filter(x => x >= 0), `om3.${a}.${b}`, 2, { ...data, a, b, wat: 'schakelen' });
    }
    case 'compenseren': {
      const x = r.geheel(2, 9) * 10 - kies(r, [1, 2, 3]), t = Math.ceil(x / 10) * 10, y = r.geheel(14, 58);
      return mk(`Compenseren: ${x} + ${y} = ${t} + ____`, null, y - (t - x), [y, y + (t - x), y - (t - x) - 1, t - x], `cp${x}.${y}`, 3, { ...data, x, y, t });
    }
    case 'optelsoort': {
      const naam = kies(r, NAMEN), [d] = kies(r, DINGEN), a = r.geheel(3, 12), b = r.geheel(2, 8), g = r.geheel(0, 2), lijsten = [OOR_VER, COMBI, VERGELIJK], namen = ['oorzaak-verandering', 'combinatie', 'vergelijking'];
      const i = r.geheel(0, lijsten[g].length - 1), tekst = lijsten[g][i](naam, a, b, d);
      return mk(`${tekst} Is dit een situatie van oorzaak-verandering, combinatie of vergelijking? ____`, null, namen[g], namen.filter((_, k) => k !== g), `os${g}.${i}.${a}.${b}${d}`, 3, { ...data, tekst, goed: namen[g] });
    }
    case 'keersoort': {
      const namen = Object.keys(KEER_SOORTEN), g = r.geheel(0, 3), a = r.geheel(2, 6), b = r.geheel(2, 9), [d] = kies(r, DINGEN), i = r.geheel(0, 2), tekst = KEER_SOORTEN[namen[g]][i](a, b, d);
      return mk(`${tekst} Is dit een keerhandeling, een rooster, een vergelijking of een combinatie? ____`, null, namen[g], namen.filter((_, k) => k !== g), `ks${g}.${i}.${a}.${b}${d}`, 3, { ...data, tekst, goed: namen[g] });
    }
    case 'deelsoort': {
      const k = r.geheel(2, 6), e = r.geheel(2, 8), [d] = kies(r, DINGEN), verdeling = r.volgende() < 0.5, n = kies(r, NAMEN);
      const tekst = verdeling ? `Je verdeelt ${k * e} ${d} eerlijk over ${k} kinderen. Hoeveel ${d} krijgt ieder kind?` : `Je hebt ${k * e} ${d}. ${n} geeft aan elk kind ${e} ${d}. Hoeveel kinderen krijgen ${d}?`;
      return mk(`${tekst} Is dit een verdelingsdeling of een verhoudingsdeling? ____`, null, verdeling ? 'verdelingsdeling' : 'verhoudingsdeling', [verdeling ? 'verhoudingsdeling' : 'verdelingsdeling'], `ds${k}.${e}${d}${verdeling}`, 3, { ...data, tekst, verdeling, k, e });
    }
    default: {
      const k = r.geheel(2, 6), e = r.geheel(2, 8), [d] = kies(r, DINGEN);
      return mk(`${k * e} ${d} verdeel je eerlijk over ${k} kinderen: ieder kind krijgt ${e}. Als je aan elk kind ${e} ${d} geeft, hoeveel kinderen kun je dan ${d} geven? ____`, null, k, [e, k * e, k + 1, k - 1].filter(x => x > 0), `vb${k}.${e}${d}`, 3, { ...data, k, e });
    }
  }
};
export const BEWERKINGBEGRIP_VORMEN = maakOpgaveVormen({
  id: 'bgw', titel: 'Begrippen bij bewerkingen', doelen: AUTO_DOELEN.bgw || [], parameters: K.bewerkingBegripParameters, standaard: { types: ['optel'], jaar: 3 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: bewerkingBegripOpgave,
});

/* ------------------------------------------------------------------ situaties en bewerkingen */
const situatieOpgave = (r, p) => {
  const jaar = p.jaar ?? 2, max = p.max ?? 10, soort = kies(r, p.types), data = { begrip2: 'sit', soort };
  const naam = kies(r, NAMEN), [d] = kies(r, DINGEN);
  switch (soort) {
    case 'situatie': {
      const ops = jaar <= 1 ? ['+', MIN] : ['+', MIN, '×', ':'], op = kies(r, ops), groot = jaar >= 3 ? 40 : 15, a = r.geheel(4, groot), b = r.geheel(2, Math.min(9, a - 1));
      const sit = { '+': [`${naam} heeft ${a} ${d}. ${naam} krijgt er ${b} bij.`, `In de doos zitten ${a} rode en ${b} blauwe ${d}.`], [MIN]: [`${naam} heeft ${a} ${d} en geeft er ${b} weg.`, `Er zijn ${a} kinderen. ${b} kinderen zijn jongens. Hoeveel meisjes zijn het?`], '×': [`${b} dozen met in elke doos ${a} ${d}.`, `${b} rijen met in elke rij ${a} stoelen.`], ':': [`${a * b} ${d} worden eerlijk verdeeld over ${b} kinderen.`, `${a * b} ${d} worden in zakjes van ${b} gedaan.`] };
      const i = r.geheel(0, 1), tekst = sit[op][i], uit = { '+': `${a} + ${b}`, [MIN]: `${a} ${MIN} ${b}`, '×': `${b} × ${a}`, ':': `${a * b} : ${b}` }[op];
      if (r.volgende() < 0.3) { const ander = kies(r, ops.filter(o => o !== op)), uitAnder = { '+': `${a} + ${b}`, [MIN]: `${a} ${MIN} ${b}`, '×': `${b} × ${a}`, ':': `${a * b} : ${b}` }[ander]; return mk(`Past de bewerking ${uitAnder} bij deze situatie? ${tekst} ____`, null, 'nee', ['ja'], `sj${op}${ander}${i}.${a}.${b}${d}`, 3, { ...data, wat: 'juist-fout', tekst, op, ander }); }
      return mk(`${tekst} Welke bewerking hoort bij deze situatie? ____`, null, uit, [{ '+': `${a} ${MIN} ${b}`, [MIN]: `${a} + ${b}`, '×': `${a} + ${b}`, ':': `${a * b} ${MIN} ${b}` }[op], `${b} ${MIN} ${a}`, `${a} × ${b}`].filter(x => x !== uit), `sw${op}${i}.${a}.${b}${d}`, 2, { ...data, wat: 'bewerking', tekst, op, a, b, uit });
    }
    case 'rest': {
      const dl = r.geheel(2, 9), q = r.geheel(2, 9), rest = r.geheel(1, dl - 1), n = dl * q + rest;
      return r.volgende() < 0.5 ? mk(`${n} : ${dl} = ${q} rest ____`, null, rest, [dl - rest, q, rest + 1, rest - 1].filter(x => x >= 0), `rs0.${n}.${dl}`, 2, { ...data, n, dl, rest, wat: 'som' })
        : mk(`Je verdeelt ${n} ${d} eerlijk over ${dl} kinderen. Elk kind krijgt evenveel. Hoeveel ${d} blijven er over? ____`, null, rest, [q, dl - rest, rest + 1, n - rest].filter(x => x >= 0), `rs1.${n}.${dl}${d}`, 3, { ...data, n, dl, rest, wat: 'situatie' });
    }
    case 'breukplus': {
      const n = kies(r, [4, 5, 6, 8, 10]), a = r.geheel(1, n - 3), b = r.geheel(1, n - a - 1), plus = r.volgende() < 0.5, ongelijk = r.volgende() < 0.3;
      if (ongelijk) { const x = kies(r, [[1, 2, 1, 4], [1, 2, 1, 3], [1, 3, 1, 6], [1, 4, 1, 8]]); const [p1, q1, p2, q2] = x; return mk(`${naam} eet ${p1}/${q1} van een taart en Jan eet ${p2}/${q2} van dezelfde taart. Welke bewerking hoort bij het aantal taart dat samen is opgegeten? ____`, null, `${p1}/${q1} + ${p2}/${q2}`, [`${p1}/${q1} ${MIN} ${p2}/${q2}`, `${p1}/${q1} × ${p2}/${q2}`, `${p1}/${q1} : ${p2}/${q2}`], `bp2${p1}.${q1}.${p2}.${q2}`, 3, { ...data, wat: 'ongelijknamig', x }); }
      const tekst = plus ? `${naam} eet ${a}/${n} van een pizza. Jan eet ${b}/${n} van dezelfde pizza. Hoeveel pizza hebben ze samen opgegeten?` : `Er is ${a + b}/${n} van een pizza over. ${naam} eet ${b}/${n}. Hoeveel pizza blijft er over?`;
      const uit = plus ? `${a}/${n} + ${b}/${n}` : `${a + b}/${n} ${MIN} ${b}/${n}`;
      return mk(`${tekst} Welke bewerking hoort bij de situatie? ____`, null, uit, [plus ? `${a}/${n} ${MIN} ${b}/${n}` : `${a + b}/${n} + ${b}/${n}`, `${a}/${n} × ${b}/${n}`, `${a}/${n} : ${b}/${n}`], `bp${plus ? 'p' : 'm'}${n}.${a}.${b}`, 3, { ...data, wat: plus ? 'optellen' : 'aftrekken', n, a, b, uit });
    }
    case 'breukmaal': {
      const v = r.geheel(0, 1);
      if (v === 0) { const k = r.geheel(2, 5), [p1, q1] = kies(r, [[1, 2], [1, 4], [3, 4], [2, 3], [1, 3]]); return mk(`${naam} heeft ${k} flessen. In elke fles zit ${p1}/${q1} liter. Welke bewerking geeft het aantal liter samen? ____`, null, `${k} × ${p1}/${q1}`, [`${k} + ${p1}/${q1}`, `${k} : ${p1}/${q1}`, `${k} ${MIN} ${p1}/${q1}`], `bm0.${k}.${p1}.${q1}`, 3, { ...data, wat: 'nat-maal-breuk', k, p1, q1 }); }
      const [p1, q1] = kies(r, [[1, 2], [1, 3], [3, 4]]), [p2, q2] = kies(r, [[1, 2], [2, 3], [1, 4]]);
      return mk(`${naam} heeft ${p2}/${q2} liter sap. ${naam} drinkt ${p1}/${q1} van dat sap. Welke bewerking hoort bij het aantal liter dat ${naam} drinkt? ____`, null, `${p1}/${q1} × ${p2}/${q2}`, [`${p1}/${q1} + ${p2}/${q2}`, `${p1}/${q1} ${MIN} ${p2}/${q2}`, `${p1}/${q1} : ${p2}/${q2}`], `bm1.${p1}.${q1}.${p2}.${q2}`, 4, { ...data, wat: 'breuk-maal-breuk', p1, q1, p2, q2 });
    }
    case 'breukdeel': {
      const k = r.geheel(2, 5), q = kies(r, [2, 4]);
      return mk(`${naam} heeft ${k} liter water. ${naam} vult flesjes van 1/${q} liter. Welke bewerking geeft het aantal flesjes? ____`, null, `${k} : 1/${q}`, [`${k} × 1/${q}`, `${k} ${MIN} 1/${q}`, `1/${q} : ${k}`], `bd${k}.${q}`, 4, { ...data, k, q });
    }
    case 'pctmaal': {
      const pct = kies(r, [10, 20, 25, 50]), bedrag = kies(r, [20, 40, 60, 80, 120]), dec = nl(pct / 100);
      return mk(`Een jas kost ${bedrag} euro. Er is ${pct} % korting. Welke bewerking geeft het bedrag van de korting? ____`, null, `${dec} × ${bedrag}`, [`${pct} × ${bedrag}`, `${bedrag} : ${dec}`, `${dec} + ${bedrag}`], `pm${pct}.${bedrag}`, 3, { ...data, pct, bedrag });
    }
    case 'vanmaal': {
      const [p1, q1] = kies(r, [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [2, 5]]), n = q1 * r.geheel(2, 6);
      return mk(`${p1}/${q1} van ${n} schrijf je met een maalteken als ____`, null, `${p1}/${q1} × ${n}`, [`${p1}/${q1} + ${n}`, `${p1}/${q1} : ${n}`, `${n} ${MIN} ${p1}/${q1}`], `vm${p1}.${q1}.${n}`, 2, { ...data, p1, q1, n });
    }
    case 'splitsen': {
      const n = r.geheel(3, Math.min(max, 10)), a = r.geheel(1, n - 1);
      return r.volgende() < 0.5 ? mk(`${n} = ${a} + ____`, null, n - a, [a, n, n - a + 1, n - a - 1].filter(x => x >= 0), `ss0.${n}.${a}`, 1, { ...data, n, a, links: true }) : mk(`${n} = ____ + ${a}`, null, n - a, [a, n, n - a + 1, n - a - 1].filter(x => x >= 0), `ss1.${n}.${a}`, 1, { ...data, n, a, links: false });
    }
    case 'rek-plus': {
      const n = r.geheel(2, 4), a = r.geheel(1, Math.max(1, Math.min(max, 10) - n)), v = r.geheel(0, 2);
      if (v === 0) return mk(`${naam} heeft ${a} ${d}. ${naam} krijgt er ${n} bij. Hoeveel ${d} heeft ${naam} nu? ____`, null, a + n, [a, n, a + n + 1, a + n - 1].filter(x => x >= 0), `rp0.${a}.${n}${d}`, 1, { ...data, a, n, wat: 'bij' });
      if (v === 1) return mk(`${naam} heeft ${a + n} ${d}. ${naam} geeft er ${n} weg. Hoeveel ${d} heeft ${naam} nu? ____`, null, a, [a + n, n, a + 1, a - 1].filter(x => x >= 0), `rp1.${a}.${n}${d}`, 1, { ...data, a, n, wat: 'weg' });
      return mk(`${naam} heeft ${a + n} ${d}. Jan heeft ${a} ${d}. Hoeveel ${d} heeft ${naam} meer dan Jan? ____`, null, n, [a, a + n, n + 1, n - 1].filter(x => x >= 0), `rp2.${a}.${n}${d}`, 2, { ...data, a, n, wat: 'meer' });
    }
    case 'rek-maal': {
      const k = r.geheel(2, 5), e = r.geheel(2, Math.max(2, Math.floor(10 / k)));
      if (k * e > 10) return null;
      return r.volgende() < 0.5 ? mk(`${naam} heeft ${k} zakjes met in elk zakje ${e} ${d}. Hoeveel ${d} heeft ${naam} samen? ____`, null, k * e, [k + e, k * e + 1, k * e - 1].filter(x => x > 0), `rm0.${k}.${e}${d}`, 2, { ...data, k, e, wat: 'maal' })
        : mk(`${naam} verdeelt ${k * e} ${d} eerlijk over ${k} kinderen. Hoeveel ${d} krijgt ieder kind? ____`, null, e, [k, k * e, e + 1, e - 1].filter(x => x > 0), `rm1.${k}.${e}${d}`, 2, { ...data, k, e, wat: 'deel' });
    }
    default: {
      const eerst = r.geheel(4, 10), weg = r.geheel(1, eerst - 1);
      return mk(`${naam} heeft een aantal ${d}. ${naam} geeft er ${weg} weg. Nu heeft ${naam} er ${eerst - weg}. Hoeveel ${d} had ${naam} eerst? ____`, null, eerst, [eerst - weg, weg, eerst + 1, eerst - 1].filter(x => x > 0), `tr${eerst}.${weg}${d}`, 3, { ...data, eerst, weg });
    }
  }
};
export const SITUATIE_VORMEN = maakOpgaveVormen({
  id: 'sit', titel: 'Situaties en bewerkingen', doelen: AUTO_DOELEN.sit || [], parameters: K.situatieParameters, standaard: { types: ['rek-plus'], max: 10, jaar: 1 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: situatieOpgave, schaal: 1.2,
});

/* ------------------------------------------------------------------ gehele getallen */
const labelNeg = (v) => neg(v);
const geheleOpgave = (r, p) => {
  const max = p.max ?? 10, soort = kies(r, p.types), data = { begrip2: 'gtl', soort };
  switch (soort) {
    case 'begrip': {
      const n = r.geheel(1, max), v = r.geheel(0, 3);
      if (v === 0) return mk(`${MIN}${n} is een ____ getal. (positief of negatief)`, null, 'negatief', ['positief'], `gb0.${n}`, 1, { ...data, wat: 'negatief', n });
      if (v === 1) return mk(`${n} is een ____ getal. (positief of negatief)`, null, 'positief', ['negatief'], `gb1.${n}`, 1, { ...data, wat: 'positief', n });
      if (v === 2) return mk('Welk teken staat voor een getal kleiner dan nul, bijvoorbeeld ____5?', null, MIN, ['+', '×', ':'], 'gb2', 1, { ...data, wat: 'minteken' });
      const lijst = Array.from({ length: 3 }, () => r.geheel(1, max) * (r.volgende() < 0.5 ? -1 : 1)), negs = lijst.filter(x => x < 0);
      return mk(`Hoeveel negatieve getallen staan er in ${lijst.map(neg).join(', ')}? ____`, null, negs.length, [0, 1, 2, 3].filter(x => x !== negs.length), `gb3.${lijst.join('.')}`, 2, { ...data, wat: 'tel', lijst });
    }
    case 'as': {
      const n = r.geheel(2, max), v = r.geheel(0, 2);
      if (v === 0) return mk('Op de getallenas staan de negatieve getallen links van ____.', null, 0, [1, -1, 10].map(neg), 'ga0', 1, { ...data, wat: 'nul' });
      if (v === 1) return mk(`Op de getallenas staat ${MIN}${n} links van ____. (${neg(-n + 1)} of ${neg(-n - 1)})`, null, neg(-n + 1), [neg(-n - 1)], `ga1.${n}`, 2, { ...data, wat: 'links-van', n });
      return mk(`Welk getal staat op de getallenas juist links van ${MIN}${n}? ____`, null, neg(-n - 1), [neg(-n + 1), neg(n), neg(n + 1)], `ga2.${n}`, 2, { ...data, wat: 'juist-links', n });
    }
    case 'terug': {
      const start = r.geheel(-max + 5, 3), reeks = Array.from({ length: 6 }, (_, i) => start - i), gat = r.geheel(3, 5);
      return mk(`Tel terug: ${reeks.map((x, i) => (i === gat ? '____' : neg(x))).join(', ')}`, null, neg(reeks[gat]), [reeks[gat] + 1, reeks[gat] - 1, -reeks[gat], reeks[gat] + 2].filter(x => x !== reeks[gat] && x >= -max - 2).map(neg), `gt${start}.${gat}`, 2, { ...data, reeks, gat });
    }
    case 'context': {
      const n = r.geheel(2, max), v = r.geheel(0, 3);
      if (v === 0) return mk(`Het is ${MIN}${n} °C. Is dat warmer of kouder dan 0 °C? ____`, null, 'kouder', ['warmer'], `gc0.${n}`, 1, { ...data, wat: 'temperatuur', n });
      if (v === 1) return mk(`Een duiker zwemt op ${MIN}${n} m. Is hij boven of onder het wateroppervlak? ____`, null, 'onder', ['boven'], `gc1.${n}`, 1, { ...data, wat: 'diepte', n });
      if (v === 2) return mk(`In de lift staat ${MIN}${n} op de knop. Je gaat naar een verdieping ____ de grond. (boven of onder)`, null, 'onder', ['boven'], `gc2.${n}`, 1, { ...data, wat: 'lift', n });
      return mk(`Lotte heeft ${n} euro schuld. Dat schrijf je als ____ euro.`, null, `${MIN}${n}`, [`+${n}`, String(n), `${n}${MIN}`], `gc3.${n}`, 2, { ...data, wat: 'schuld', n });
    }
    case 'vergelijk': {
      const a = r.geheel(-max, max), b = r.geheel(-max, max), c = r.geheel(-max, max), v = r.geheel(0, 1);
      if (v === 0) { if (a === b) return null; return mk(`Welk teken past? ${neg(a)} ____ ${neg(b)}`, null, a < b ? '<' : '>', ['<', '>', '='], `gv0.${a}.${b}`, 2, { ...data, a, b, wat: 'teken' }); }
      if (new Set([a, b, c]).size < 3) return null;
      const klein = r.volgende() < 0.5, lijst = [a, b, c], antw = klein ? Math.min(...lijst) : Math.max(...lijst);
      return mk(`Welk getal is het ${klein ? 'kleinst' : 'grootst'}: ${lijst.map(neg).join(', ')}? ____`, null, neg(antw), lijst.filter(x => x !== antw).map(neg), `gv1.${lijst.join('.')}${klein}`, 3, { ...data, lijst, klein, wat: 'ordenen', antwoordGetal: antw });
    }
    case 'plaats': {
      const stap = 2, ticks = 11, start = kies(r, [-20, -16, -14, -12, -10]), i = r.geheel(1, ticks - 2), antw = start + i * stap;
      return mk('Welk getal wijst de pijl aan? ____', getallenas({ start, stap, ticks, pijlen: [i], verborgen: [i], label: labelNeg }), neg(antw), [antw + stap, antw - stap, antw + 1, antw - 1, -antw].filter(x => x !== antw && x >= -22 && x <= 22).map(neg), `gp${start}.${i}`, 3, { ...data, start, stap, ticks, i, antwoordGetal: antw });
    }
    default: {
      const a = -r.geheel(1, max), b = -r.geheel(1, max);
      if (a === b) return null;
      const lo = Math.min(a, b), hi = Math.max(a, b), start = -max, ticks = max + 1;
      return mk(`Wat is de afstand tussen ${neg(lo)} en ${neg(hi)}? ____`, getallenas({ start, stap: 1, ticks, pijlen: [lo - start, hi - start], label: (v) => (v % 2 === 0 ? neg(v) : '') }), hi - lo, [hi + lo, Math.abs(hi + lo), hi - lo + 1, hi - lo - 1].filter(x => x > 0), `gd${lo}.${hi}`, 3, { ...data, a: lo, b: hi, start, ticks });
    }
  }
};
export const GEHELEGETALLEN_VORMEN = maakOpgaveVormen({
  id: 'gtl', titel: 'Negatieve getallen', doelen: AUTO_DOELEN.gtl || [], parameters: K.geheleGetallenParameters, standaard: { types: ['begrip'], max: 10, jaar: 4 },
  opdracht: opdracht('Kijk goed. Schrijf het antwoord op de lijn.'), opgave: geheleOpgave, schaal: 1,
});

/* ------------------------------------------------------------------ begrippen bij rationale getallen */
const hond = (h, vorm) => (vorm === 'dec' ? `${Math.floor(h / 100)},${String(h % 100).padStart(2, '0').replace(/0+$/, '')}`.replace(/,$/, '') : vorm === 'pct' ? `${h} %` : breuk(h, 100));
const rationaalOpgave = (r, p) => {
  const soort = kies(r, p.types), data = { begrip2: 'rtb', soort };
  switch (soort) {
    case 'komma': {
      const e = r.geheel(1, 9), c = kies(r, [10, 20, 25, 40, 50, 75]);
      if (r.volgende() < 0.5) return mk(`${e} euro en ${c} cent schrijf je als € ${e} ____ ${c}.`, null, ',', ['.', ':', '/'], `km0.${e}.${c}`, 1, { ...data, wat: 'euro' });
      const dm = r.volgende() < 0.5, c1 = r.geheel(1, 9), c2 = r.geheel(11, 99);
      if (!dm && c2 % 10 === 0) return null;
      return dm ? mk(`${e},${c1} m is ${e} m en ____ dm.`, null, c1, [c1 * 10, e, c1 + 1], `km1.${e}.${c1}`, 2, { ...data, wat: 'dm', e, c: c1 }) : mk(`${e},${c2} m is ${e} m en ____ cm.`, null, c2, [c2 / 10, e, c2 + 1].map(x => (Number.isInteger(x) ? x : nl(x))), `km2.${e}.${c2}`, 2, { ...data, wat: 'cm', e, c: c2 });
    }
    case 'halfdubbel': {
      const n = r.geheel(2, 20) * 4, v = r.geheel(0, 3);
      if (v === 0) return mk(`Het dubbel van ${n} is ____.`, null, n * 2, [n / 2, n + 2, n * 4], `hd0.${n}`, 1, { ...data, wat: 'dubbel', n });
      if (v === 1) return mk(`De helft van ${n} is ____.`, null, n / 2, [n * 2, n / 4, n - 2], `hd1.${n}`, 1, { ...data, wat: 'helft', n });
      if (v === 2) return mk(`Een kwart van ${n} is ____.`, null, n / 4, [n / 2, n * 4, n - 4], `hd2.${n}`, 1, { ...data, wat: 'kwart', n });
      return mk(`${n} is de helft van ____.`, null, n * 2, [n / 2, n + 2, n * 4], `hd3.${n}`, 2, { ...data, wat: 'helft-van', n });
    }
    case 'delen': {
      const k = r.geheel(2, 6), e = r.geheel(2, 6), v = r.geheel(0, 2);
      if (v === 0) return mk(`Een reep van ${k * e} stukjes verdeel je in ${k} gelijke delen. Hoeveel stukjes zit er in elk deel? ____`, null, e, [k, k * e, e + 1], `dl0.${k}.${e}`, 2, { ...data, wat: 'gelijk', k, e });
      if (v === 1) { const a = r.geheel(1, 6), b = a + r.geheel(1, 4); return mk(`Een koek verdeel je in twee delen: een deel van ${a} stukjes en een deel van ${b} stukjes. Zijn dit gelijke delen? ____`, null, 'nee', ['ja'], `dl1.${a}.${b}`, 1, { ...data, wat: 'ongelijk', a, b }); }
      const dn = kies(r, [[2, 'helft'], [4, 'kwart']]); return mk(`Je verdeelt een pizza in ${dn[0]} gelijke delen. Elk deel is een ____ van de pizza.`, null, dn[1], ['helft', 'kwart', 'derde'].filter(x => x !== dn[1]), `dl2.${dn[0]}`, 1, { ...data, wat: 'naam', delen: dn[0], goed: dn[1] });
    }
    case 'teller': {
      const q = r.geheel(3, 9), t = r.geheel(1, q - 1), v = r.geheel(0, 3);
      if (v === 0) return mk(`In de breuk ${t}/${q} heet ${t} de ____. (teller of noemer)`, null, 'teller', ['noemer'], `tl0.${t}.${q}`, 1, { ...data, wat: 'teller', t, q });
      if (v === 1) return mk(`In de breuk ${t}/${q} heet ${q} de ____. (teller of noemer)`, null, 'noemer', ['teller'], `tl1.${t}.${q}`, 1, { ...data, wat: 'noemer', t, q });
      if (v === 2) return mk('Het streepje tussen de teller en de noemer heet de ____. (breukstreep of deelteken)', null, 'breukstreep', ['deelteken'], 'tl2', 1, { ...data, wat: 'streep' });
      return mk(`In de breuk ${t}/${q} geeft de noemer aan in hoeveel gelijke delen het ____ verdeeld is. (geheel of deel)`, null, 'geheel', ['deel'], `tl3.${t}.${q}`, 2, { ...data, wat: 'geheel', t, q });
    }
    case 'stam': {
      const q = r.geheel(3, 9), t = r.geheel(1, q - 1), v = r.geheel(0, 2);
      if (v === 0) return mk(`Een breuk met teller 1, zoals 1/${q}, heet een ____. (stambreuk of onechte breuk)`, null, 'stambreuk', ['onechte breuk'], `st0.${q}`, 1, { ...data, wat: 'stambreuk', q });
      if (v === 1) { const w = r.volgende() < 0.5, g = w ? t : q + r.geheel(1, 5), h = w ? q : q; return mk(`${g}/${h} is een ____ breuk. (echte of onechte)`, null, g < h ? 'echte' : 'onechte', [g < h ? 'onechte' : 'echte'], `st1.${g}.${h}`, 2, { ...data, wat: 'echt', g, h }); }
      return mk(`Is ${t}/${q} een stambreuk? ____`, null, t === 1 ? 'ja' : 'nee', [t === 1 ? 'nee' : 'ja'], `st2.${t}.${q}`, 1, { ...data, wat: 'is-stam', t, q });
    }
    case 'tiende': {
      const c = r.geheel(1, 9), v = r.geheel(0, 1);
      return v === 0 ? mk(`0,${c} = ${c} ____.`, null, 'tienden', ['honderdsten', 'duizendsten', 'eenheden'], `ti0.${c}`, 1, { ...data, wat: 'tienden', c }) : mk(`0,0${c} = ${c} ____.`, null, 'honderdsten', ['tienden', 'duizendsten', 'eenheden'], `ti1.${c}`, 2, { ...data, wat: 'honderdsten', c });
    }
    case 'duizendste': {
      const c = r.geheel(1, 9), v = r.geheel(0, 1);
      return v === 0 ? mk(`0,00${c} = ${c} ____.`, null, 'duizendsten', ['honderdsten', 'tienden', 'eenheden'], `du0.${c}`, 2, { ...data, wat: 'duizendsten', c }) : mk(`0,12${c} = 1 tiende, 2 honderdsten en ${c} ____.`, null, 'duizendsten', ['honderdsten', 'tienden', 'eenheden'], `du1.${c}`, 3, { ...data, wat: 'samengesteld', c });
    }
    case 'gelijkw': {
      const q = kies(r, [2, 3, 4, 5]), t = r.geheel(1, q - 1), f = r.geheel(2, 4), v = r.geheel(0, 3);
      if (v === 0) return mk(`${t}/${q} = ____/${q * f}`, null, t * f, [t + f, t, q * f - 1, t * f + 1].filter(x => x > 0), `gw0.${t}.${q}.${f}`, 2, { ...data, wat: 'uitbreiden', t, q, f });
      if (v === 1) return mk(`${t * f}/${q * f} vereenvoudigen geeft ____/${q}`, null, t, [t * f, t + 1, t - 1, f].filter(x => x > 0), `gw1.${t}.${q}.${f}`, 3, { ...data, wat: 'vereenvoudigen', t, q, f });
      const gelijk = v === 2, a = r.geheel(1, 4), q2 = gelijk ? q : q + r.geheel(1, 3), b = r.geheel(1, 4);
      return mk(`${a}/${q} en ${b}/${q2} zijn ____. (gelijknamig of ongelijknamig)`, null, gelijk ? 'gelijknamig' : 'ongelijknamig', [gelijk ? 'ongelijknamig' : 'gelijknamig'], `gw2.${a}.${q}.${b}.${q2}`, 2, { ...data, wat: 'namig', a, q, b, q2 });
    }
    case 'decbreuk': {
      const noem = kies(r, [10, 100, 1000]), v = r.geheel(0, 1);
      if (v === 0) { const t = kies(r, [3, 7, 9, 13, 21]), q = kies(r, [7, 11, 9]), dec = r.volgende() < 0.5; return mk(`Welke breuk is een decimale breuk: ${dec ? `${t}/${noem} of ${t}/${q}` : `${t}/${q} of ${t}/${noem}`}? ____`, null, `${t}/${noem}`, [`${t}/${q}`], `db0.${t}.${noem}.${q}.${dec}`, 2, { ...data, wat: 'decimaal', t, noem, q }); }
      const t = r.geheel(2, 20), q = kies(r, [4, 6, 8, 9, 10, 12, 15]), vb = ggd(t, q) > 1;
      return mk(`Is ${t}/${q} vereenvoudigbaar? ____`, null, vb ? 'ja' : 'nee', [vb ? 'nee' : 'ja'], `db1.${t}.${q}`, 2, { ...data, wat: 'vereenvoudigbaar', t, q });
    }
    case 'oneigenlijk': {
      const q = r.geheel(2, 6), g = r.geheel(1, 3), rest = r.geheel(1, q - 1), t = g * q + rest, v = r.geheel(0, 1);
      return v === 0 ? mk(`Een breuk waarvan de teller groter is dan de noemer, zoals ${t}/${q}, heet een ____ breuk.`, null, 'oneigenlijke', ['echte', 'stam', 'decimale'], `oe0.${t}.${q}`, 2, { ...data, wat: 'naam', t, q }) : mk(`${t}/${q} = ${g} en ____/${q}`, null, rest, [t, q, rest + 1, g].filter(x => x > 0), `oe1.${t}.${q}`, 3, { ...data, wat: 'gemengd', t, q, g, rest });
    }
    case 'procent': {
      const x = r.geheel(1, 99), v = r.geheel(0, 2);
      if (v === 0) return mk(`${x} % = ${x}/____`, null, 100, [10, 1000, x], `pr0.${x}`, 1, { ...data, wat: 'noemer', x });
      if (v === 1) return mk('Procent betekent "per ____".', null, 'honderd', ['tien', 'duizend', 'twintig'], 'pr1', 1, { ...data, wat: 'per' });
      return mk(`${x}/100 = ____ %`, null, x, [x / 10, x * 10, 100 - x].filter(y => y > 0), `pr2.${x}`, 1, { ...data, wat: 'naar-procent', x });
    }
    case 'verhouding': {
      const a = r.geheel(2, 12), b = r.geheel(2, 12), v = r.geheel(0, 1);
      return v === 0 ? mk(`In de klas zijn ${a} jongens en ${b} meisjes. De verhouding jongens op meisjes is ${a} op ____.`, null, b, [a, a + b, b + 1].filter(x => x > 0), `vh0.${a}.${b}`, 2, { ...data, wat: 'op', a, b }) : mk(`In de klas zijn ${a} jongens en ${b} meisjes. Het deel jongens van alle kinderen schrijf je als de breuk ${a}/____.`, null, a + b, [b, a, a + b + 1], `vh1.${a}.${b}`, 3, { ...data, wat: 'breuk', a, b });
    }
    case 'groei': {
      const base = kies(r, [20, 40, 50, 80, 100, 200]), pct = kies(r, [5, 10, 20, 25, 50]), toe = r.volgende() < 0.5, nieuw = toe ? (base * (100 + pct)) / 100 : (base * (100 - pct)) / 100;
      if (!Number.isInteger(nieuw)) return null;
      return mk(`Een prijs ${toe ? 'stijgt' : 'daalt'} van ${base} euro naar ${nieuw} euro. Het groeipercentage is ____ %. (${toe ? 'toename' : 'afname'} ten opzichte van ${base} euro)`, null, toe ? pct : `${MIN}${pct}`, toe ? [pct * 2, pct / 2, 100 - pct, Math.abs(nieuw - base)] : [`+${pct}`, String(pct), `${MIN}${100 - pct}`, `${MIN}${Math.abs(nieuw - base)}`], `gr${base}.${pct}${toe}`, 4, { ...data, base, pct, toe, nieuw });
    }
    case 'asym': {
      const base = kies(r, [100, 200, 400, 500]), pct = kies(r, [10, 20, 25, 50]), eind = (base * (100 + pct) * (100 - pct)) / 10000;
      if (!Number.isInteger(eind)) return null;
      return mk(`Een prijs van ${base} euro stijgt ${pct} %. Daarna daalt de nieuwe prijs ${pct} %. De prijs is nu ____ euro.`, null, eind, [base, (base * (100 + pct)) / 100, base - 2 * (base * pct) / 100 + 0, eind + 1].filter(x => Number.isFinite(x) && x !== eind), `as${base}.${pct}`, 5, { ...data, base, pct, eind });
    }
    case 'relatief': {
      const lijst = [[20, 25], [40, 50], [50, 60], [10, 14], [25, 30], [80, 100], [5, 8], [100, 120]], i = r.geheel(0, lijst.length - 1), j = r.geheel(0, lijst.length - 1);
      const [a1, b1] = lijst[i], [a2, b2] = lijst[j], g1 = (b1 - a1) / a1, g2 = (b2 - a2) / a2;
      if (i === j || Math.abs(g1 - g2) < 0.02) return null;
      return mk(`Lotte groeit van ${a1} cm naar ${b1} cm. Jan groeit van ${a2} cm naar ${b2} cm. Wie groeit relatief (in procent) het meest? ____`, null, g1 > g2 ? 'Lotte' : 'Jan', [g1 > g2 ? 'Jan' : 'Lotte', 'evenveel'], `rl${a1}.${b1}.${a2}.${b2}`, 5, { ...data, a1, b1, a2, b2 });
    }
    case 'omgekeerd': {
      const t = r.geheel(1, 9), q = r.geheel(2, 9), nat = r.volgende() < 0.3;
      if (!nat && t === q) return null;
      return nat ? mk(`De omgekeerde breuk van ${q} is ____.`, null, `1/${q}`, [`${q}/1`.replace(/\/1$/, ''), `${q}/${q}`, `${q + 1}`], `og${q}n`, 3, { ...data, wat: 'natuurlijk', q }) : mk(`De omgekeerde breuk van ${t}/${q} is ____.`, null, `${q}/${t}`.replace(/\/1$/, ''), [`${t}/${q}`, `${t}/${t + q}`, `${q}/${q + t}`], `og${t}.${q}`, 3, { ...data, wat: 'breuk', t, q });
    }
    case 'deling': {
      const t = r.geheel(1, 9), q = r.geheel(t + 1, 12), v = r.geheel(0, 1);
      return v === 0 ? mk(`${t}/${q} = ${t} : ____`, null, q, [t, t + q, q + 1], `de0.${t}.${q}`, 2, { ...data, wat: 'noemer', t, q }) : mk(`${t} : ${q} schrijf je als breuk: ____`, null, `${t}/${q}`, [`${q}/${t}`, `${t}/${t + q}`, `${t} ${MIN} ${q}`], `de1.${t}.${q}`, 2, { ...data, wat: 'breuk', t, q });
    }
    case 'nat': {
      const n = r.geheel(1, 9), q = r.geheel(2, 8), v = r.geheel(0, 1);
      return v === 0 ? mk(`${n} = ____/${q}`, null, n * q, [n, n + q, n * q + 1, q], `nt0.${n}.${q}`, 2, { ...data, wat: 'teller', n, q }) : mk(`${n * q}/${q} = ____`, null, n, [n * q, q, n + 1], `nt1.${n}.${q}`, 2, { ...data, wat: 'getal', n, q });
    }
    default: {
      const vormen = ['dec', 'pct', 'breuk'], a = r.geheel(2, 8) * 5, b = a + r.geheel(2, 4) * 5;
      if (b > 95 || b - a < 10) return null;
      const m = (a + b) / 2;
      if (!Number.isInteger(m) || m % 5 !== 0) return null;
      const buiten = [a - 10, b + 10, a - 5 > 0 ? a - 5 : b + 15].filter(x => x > 0 && x < 100 && (x < a || x > b)), v = r.schud(vormen);
      if (buiten.length < 2) return null;
      const kand = r.schud([m, ...buiten.slice(0, 2)]).map((h, i) => [h, v[i % 3]]);
      return mk(`Welk getal ligt tussen ${hond(a, v[2])} en ${hond(b, v[1])}: ${kand.map(([h, f]) => hond(h, f)).join(', ')}? ____`, null, hond(m, kand.find(([h]) => h === m)[1]), kand.filter(([h]) => h !== m).map(([h, f]) => hond(h, f)), `tz${a}.${b}.${kand.map(x => x.join(':')).join()}`, 4, { ...data, a, b, formA: v[2], formB: v[1], kand, m });
    }
  }
};
export const RATIONAALBEGRIP_VORMEN = maakOpgaveVormen({
  id: 'rtb', titel: 'Begrippen bij breuken, decimale getallen en procenten', doelen: AUTO_DOELEN.rtb || [], parameters: K.rationaalBegripParameters, standaard: { types: ['teller'], jaar: 3 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: rationaalOpgave,
});

export const AUTO_BEGRIPPEN_VORMEN = [...BEWERKINGBEGRIP_VORMEN, ...SITUATIE_VORMEN, ...GEHELEGETALLEN_VORMEN, ...RATIONAALBEGRIP_VORMEN];
