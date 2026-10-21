// Hoofdrekenen en cijferen: vermenigvuldigen en delen door 10, 100, 0,1 ..., compenseren, handig rekenen, schatten, controleren,
// cijferen, rekenvolgorde en het gelijkheidsteken. De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { fmt } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const opdracht = (invullen, kiezen = 'Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const cijfers = (n) => String(n).length;
// teller met k decimalen als tekst: (35, 1) -> 3,5 ; (300, 2) -> 3
const komma = (t, k) => { if (!k) return fmt(t); const s = String(t).padStart(k + 1, '0'), e = s.slice(0, -k), f = s.slice(-k).replace(/0+$/, ''); return f ? `${fmt(Number(e))},${f}` : fmt(Number(e)); };
const NAAM = { 10: 'tiental', 100: 'honderdtal', 1000: 'duizendtal', 10000: 'tienduizendtal' };

/* ------------------------------------------------------------------ vermenigvuldigen en delen door 10, 100, 0,1, 2, 5 ... */
const tnvOpgave = (r, p) => {
  const f = kies(r, p.factoren), tekstF = komma(f.t, f.k), maal = r.volgende() < 0.5;
  if (f.k === 0) {
    const klein = f.t >= 1000 ? 99 : f.t >= 100 ? 500 : 999;
    if (maal) { const n = r.geheel(2, klein), antw = n * f.t; return { vraag: `${fmt(n)} × ${tekstF} = ____`, antwoord: fmt(antw), fouten: uniek([fmt(n * f.t * 10), fmt(n * f.t / 10 | 0), fmt(n + f.t), fmt(n * (f.t + 1))], fmt(antw)), kern: `t×${n}.${f.t}`, moeilijkheid: [f.t], data: { tnv: 'maal', n, f: f.t, antw } }; }
    const q = r.geheel(2, Math.min(klein, 200)), n = q * f.t; return { vraag: `${fmt(n)} : ${tekstF} = ____`, antwoord: fmt(q), fouten: uniek([fmt(q * 10), fmt(q / 10 | 0), fmt(n - f.t), fmt(q + 1)], fmt(q)), kern: `t:${n}.${f.t}`, moeilijkheid: [f.t], data: { tnv: 'deel', n, f: f.t, antw: q } };
  }
  // decimale factor: t / 10^k
  const schaal = 10 ** f.k, omgekeerd = schaal / f.t;
  if (maal) { const n = r.geheel(2, 300), teller = n * f.t; return { vraag: `${fmt(n)} × ${tekstF} = ____`, antwoord: komma(teller, f.k), fouten: uniek([fmt(n * f.t), komma(teller, f.k + 1), komma(teller * 10, f.k), fmt(n * schaal)], komma(teller, f.k)), kern: `td×${n}.${f.t}.${f.k}`, moeilijkheid: [f.k], data: { tnv: 'maal-dec', n, t: f.t, k: f.k, antw: komma(teller, f.k) } }; }
  if (!Number.isInteger(omgekeerd)) return null;
  const n = r.geheel(2, 60) * (omgekeerd >= 10 ? 1 : 1), antw = n * omgekeerd;
  return { vraag: `${fmt(n)} : ${tekstF} = ____`, antwoord: fmt(antw), fouten: uniek([fmt(n / omgekeerd | 0), komma(n * f.t, f.k), fmt(antw * 10), fmt(n * f.t)], fmt(antw)), kern: `td:${n}.${f.t}.${f.k}`, moeilijkheid: [f.k], data: { tnv: 'deel-dec', n, t: f.t, k: f.k, antw } };
};
export const TIENVOUD_VORMEN = maakOpgaveVormen({
  id: 'tnv', titel: 'Vermenigvuldigen en delen door 10, 100, 0,1 ...', doelen: AUTO_DOELEN.tnv || [], parameters: K.tienvoudParameters, standaard: { factoren: [{ t: 10, k: 0 }, { t: 100, k: 0 }] },
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Kies het juiste antwoord. Omcirkel.'), opgave: tnvOpgave,
});

/* ------------------------------------------------------------------ compenseren */
const cmpOpgave = (r, p) => {
  const t = kies(r, p.types), groot = p.max > 100;
  switch (t) {
    case 'keer+': { const a = r.geheel(2, groot ? 25 : 9), b = r.geheel(3, 10); return { vraag: `${a} × ${b} = ${a} × ${b - 1} + ____`, antwoord: a, fouten: uniek([b, a * b, a + 1], a).map(String), kern: `c+${a}.${b}`, moeilijkheid: [a], data: { cmp: t, a, b } }; }
    case 'keer-': { const a = r.geheel(2, groot ? 25 : 9), b = r.geheel(2, 9); return { vraag: `${a} × ${b} = ${a} × ${b + 1} − ____`, antwoord: a, fouten: uniek([b, a * b, a - 1], a).map(String), kern: `c-${a}.${b}`, moeilijkheid: [a], data: { cmp: t, a, b } }; }
    case 'dubbel': { const a = r.geheel(2, groot ? 25 : 9), c = r.geheel(2, 5); return { vraag: `${a} × ${2 * c} = (${a} × ${c}) × ____`, antwoord: 2, fouten: ['3', String(c), String(a)].filter(x => x !== '2'), kern: `cd${a}.${c}`, moeilijkheid: [a], data: { cmp: t, a, c } }; }
    case 'halve': { const a = r.geheel(2, groot ? 25 : 9), c = r.geheel(2, 5); return { vraag: `${a} × ${c} = (${a} × ${2 * c}) : ____`, antwoord: 2, fouten: ['3', String(c), String(a)].filter(x => x !== '2'), kern: `ch${a}.${c}`, moeilijkheid: [a], data: { cmp: t, a, c } }; }
    case 'inv+': { const eenheid = p.max > 1000 ? 100 : p.max > 20 ? 10 : 10, e = kies(r, [1, 2, 3]), b = r.geheel(2, Math.floor(p.max / eenheid) - 1) * eenheid - e, a = r.geheel(e + 1, p.max - b); if (b < 5) return null; return { vraag: `${a} + ${b} = ${a} + ${b + e} − ____`, antwoord: e, fouten: uniek([e + 1, e * 2, b % 10, 10 - e], e).map(String), kern: `i+${a}.${b}`, moeilijkheid: [cijfers(p.max)], data: { cmp: t, a, b, e } }; }
    case 'inv-': { const eenheid = p.max > 1000 ? 100 : 10, e = kies(r, [1, 2, 3]), b = r.geheel(2, Math.floor(p.max / eenheid / 2)) * eenheid - e, a = r.geheel(b + e + 1, p.max); return { vraag: `${a} − ${b} = ${a} − ${b + e} + ____`, antwoord: e, fouten: uniek([e + 1, e * 2, 10 - e, b % 10], e).map(String), kern: `i-${a}.${b}`, moeilijkheid: [cijfers(p.max)], data: { cmp: t, a, b, e } }; }
    default: return null;
  }
};
export const COMPENSEER_VORMEN = maakOpgaveVormen({
  id: 'cmp', titel: 'Compenseren', doelen: AUTO_DOELEN.cmp || [], parameters: K.compenseerParameters, standaard: { types: ['keer+', 'keer-'], max: 100 },
  opdracht: opdracht('Vul het ontbrekende getal in.', 'Welk getal ontbreekt? Omcirkel.'), opgave: cmpOpgave,
});

/* ------------------------------------------------------------------ handig rekenen */
const hndOpgave = (r, p) => {
  const t = kies(r, p.types), max = Math.min(p.max, 10000);
  switch (t) {
    case 'wissel': {
      const eenheid = max > 1000 ? 1000 : max > 100 ? 100 : 10, a = r.geheel(1, eenheid - 1), c = eenheid - a, b = r.geheel(Math.min(5, eenheid - 1), Math.max(6, Math.floor(max / 2)));
      if (a === c) return null;
      return { vraag: `${a} + ${b} + ${c} = (${a} + ${c}) + ${b} = ____`, antwoord: a + b + c, fouten: uniek([a + b + c + 10, a + b, b + c, a + b + c - 10], a + b + c).map(String), kern: `w${a}.${b}.${c}`, moeilijkheid: [cijfers(max)], data: { hnd: t, a, b, c, eenheid } };
    }
    case 'tiental': {
      const m = max <= 20 ? 20 : 100, n = r.geheel(1, m - 1);
      if (n % 10 === 0) return null;
      if (r.volgende() < 0.5) { const volgend = (Math.floor(n / 10) + 1) * 10; return { vraag: `${n} + ____ = ${volgend}`, antwoord: volgend - n, fouten: uniek([volgend - n + 1, n % 10, 10 - (volgend - n) + 1], volgend - n).map(String), kern: `tv${n}`, moeilijkheid: [n], data: { hnd: t, n, richting: 'volgend', doel: volgend } }; }
      const vorig = Math.floor(n / 10) * 10; return { vraag: `${n} − ____ = ${vorig}`, antwoord: n - vorig, fouten: uniek([10 - (n - vorig), n - vorig + 1, vorig], n - vorig).map(String), kern: `tx${n}`, moeilijkheid: [n], data: { hnd: t, n, richting: 'vorig', doel: vorig } };
    }
    case 'aanvul': { const b = r.geheel(Math.floor(max / 10) + 1, Math.floor(max / 2)), a = r.geheel(b + 2, max); return { vraag: `${fmt(a)} − ${fmt(b)}:  ${fmt(b)} + ____ = ${fmt(a)}`, antwoord: fmt(a - b), fouten: uniek([a + b, a - b + 10, a - b - 10, b].map(fmt), fmt(a - b)), kern: `av${a}.${b}`, moeilijkheid: [cijfers(a)], data: { hnd: t, a, b } }; }
    case 'analogie': {
      const klein = max <= 100 ? 10 : 20, x = r.geheel(2, klein - 2), y = r.geheel(1, klein - x), s = x + y, k = max <= 100 ? 10 : max <= 1000 ? 100 : 1000;
      if (r.volgende() < 0.5) return { vraag: `${x} + ${y} = ${s}, dus ${x * k} + ${y * k} = ____`, antwoord: fmt(s * k), fouten: uniek([s * k * 10, s * k / 10, s + k, (x + y) * 10].map(fmt), fmt(s * k)), kern: `an+${x}.${y}.${k}`, moeilijkheid: [k], data: { hnd: t, x, y, k, bew: '+' } };
      const groot = Math.max(x, s), klein2 = Math.min(x, s); return { vraag: `${groot} − ${klein2} = ${groot - klein2}, dus ${groot * k} − ${klein2 * k} = ____`, antwoord: fmt((groot - klein2) * k), fouten: uniek([(groot - klein2) * k * 10, (groot - klein2) * k / 10, groot - klein2 + k].map(fmt), fmt((groot - klein2) * k)), kern: `an-${groot}.${klein2}.${k}`, moeilijkheid: [k], data: { hnd: t, x: groot, y: klein2, k, bew: '-' } };
    }
    case 'splitsr': {
      const b = r.geheel(11, max - 1) , a = r.geheel(10, max - b > 10 ? max - b : 10), delen = String(b).split('').map((c, i, l) => Number(c) * 10 ** (l.length - 1 - i)).filter(x => x > 0);
      if (delen.length < 2 || a + b > max * 2) return null;
      const min = r.volgende() < 0.4 && a > b;
      const stappen = delen.slice(0, -1), laatste = delen.at(-1);
      if (min) return { vraag: `${fmt(a)} − ${fmt(b)} = ${fmt(a)} − ${stappen.map(fmt).join(' − ')} − ____`, antwoord: fmt(laatste), fouten: uniek([laatste * 10, laatste / 10, delen[0]].map(fmt), fmt(laatste)), kern: `sr-${a}.${b}`, moeilijkheid: [cijfers(b)], data: { hnd: t, a, b, bew: '-', delen } };
      return { vraag: `${fmt(a)} + ${fmt(b)} = ${fmt(a)} + ${stappen.map(fmt).join(' + ')} + ____`, antwoord: fmt(laatste), fouten: uniek([laatste * 10, laatste / 10, delen[0]].map(fmt), fmt(laatste)), kern: `sr+${a}.${b}`, moeilijkheid: [cijfers(b)], data: { hnd: t, a, b, bew: '+', delen } };
    }
    case 'distr×': { const a = r.geheel(3, 9), b1 = r.geheel(1, 9) * 10, b2 = r.geheel(2, 9), b = b1 + b2; return { vraag: `${a} × ${b} = ${a} × ${b1} + ${a} × ____`, antwoord: b2, fouten: uniek([a, b1, a * b2], b2).map(String), kern: `d×${a}.${b}`, moeilijkheid: [cijfers(b)], data: { hnd: t, a, b, b1, b2 } }; }
    case 'distr:': { const d = r.geheel(2, 9), x1 = d * 10 * r.geheel(1, 9), j = r.geheel(2, 9), x2 = d * j, x = x1 + x2; return { vraag: `${x} : ${d} = ${x1} : ${d} + ____ : ${d}`, antwoord: x2, fouten: uniek([j, x, x1], x2).map(String), kern: `d:${x}.${d}`, moeilijkheid: [cijfers(x)], data: { hnd: t, x, d, x1, x2 } }; }
    case 'tussen': { const m = max, b1 = r.geheel(1, Math.floor(m / 20)) * 10, b2 = r.geheel(2, 9), b = b1 + b2, a = r.geheel(10, Math.max(11, m - b)); if (m <= 20) { const a2 = r.geheel(3, 9), b3 = r.geheel(3, 9); if (a2 + b3 < 11) return null; return { vraag: `${a2} + ${b3} = ${a2} + ${10 - a2} + ${b3 - (10 - a2)} = ${10} + ${b3 - (10 - a2)} = ____`, antwoord: a2 + b3, fouten: uniek([a2 + b3 + 1, a2 + b3 - 1, 10 + b3], a2 + b3).map(String), kern: `tu${a2}.${b3}`, moeilijkheid: [10], data: { hnd: t, a: a2, b: b3, klein: true } }; } return { vraag: `${a} + ${b} = ${a + b1} + ${b2} = ____`, antwoord: a + b, fouten: uniek([a + b + 10, a + b - 10, a + b1], a + b).map(String), kern: `tu${a}.${b}`, moeilijkheid: [cijfers(a)], data: { hnd: t, a, b, b1, b2 } }; }
    default: return null;
  }
};
export const HANDIG_VORMEN = maakOpgaveVormen({
  id: 'hnd', titel: 'Handig rekenen', doelen: AUTO_DOELEN.hnd || [], parameters: K.handigParameters, standaard: { types: ['wissel', 'tiental', 'analogie'], max: 100 },
  opdracht: opdracht('Vul het ontbrekende getal in.', 'Welk getal ontbreekt? Omcirkel.'), opgave: hndOpgave,
});

/* ------------------------------------------------------------------ schatten en controleren */
const afrondOp = (n, u) => Math.floor((n + u / 2) / u) * u;
const schOpgave = (r, p) => {
  const u = p.max >= 10000 ? 1000 : p.max >= 1000 ? 100 : 10, type = kies(r, ['+', '−', '×']);
  const a = r.geheel(u, p.max), b = r.geheel(u, Math.floor(p.max / (type === '×' ? 20 : 1)));
  if (type === '−' && a <= b) return null;
  if (type === '×') { const kleinB = r.geheel(11, 49); const A = afrondOp(a, u), B = afrondOp(kleinB, 10); return { vraag: `Rond af op een ${NAAM[u]} (en een tiental) en schat: ${fmt(a)} × ${kleinB} ≈ ____`, antwoord: fmt(A * B), fouten: uniek([A * kleinB, a * B, A * B * 10, afrondOp(a * kleinB, u)].map(fmt), fmt(A * B)), kern: `s×${a}.${kleinB}`, moeilijkheid: [cijfers(a)], data: { sch: '×', a, b: kleinB, eenheid: u, eenheidB: 10, antw: A * B } }; }
  const A = afrondOp(a, u), B = afrondOp(b, u), antw = type === '+' ? A + B : A - B;
  if (antw <= 0 || a % u === 0 && b % u === 0) return null;
  return { vraag: `Rond af op een ${NAAM[u]} en schat: ${fmt(a)} ${type} ${fmt(b)} ≈ ____`, antwoord: fmt(antw), fouten: uniek([type === '+' ? a + b : a - b, type === '+' ? A + b : A - b, type === '+' ? afrondOp(a + b, u * 10) : afrondOp(a - b, u * 10), antw + u].map(fmt), fmt(antw)), kern: `s${type}${a}.${b}`, moeilijkheid: [cijfers(a)], data: { sch: type, a, b, eenheid: u, antw } };
};
export const SCHAT_VORMEN = maakOpgaveVormen({
  id: 'sch', titel: 'Schatten door af te ronden', doelen: AUTO_DOELEN.sch || [], parameters: K.schatParameters, standaard: { max: 1000 },
  opdracht: opdracht('Rond af en schat. Schrijf de schatting op de lijn.', 'Kies de juiste schatting. Omcirkel.'), opgave: schOpgave,
});

const ctlOpgave = (r, p) => {
  const t = kies(r, p.types);
  if (t === 'schat') return schOpgave(r, { max: p.max });
  const bew = kies(r, ['+', '−', '×', ':']);
  if (bew === '+') { const a = r.geheel(11, p.max), b = r.geheel(11, p.max), s = a + b; return { vraag: `${fmt(a)} + ${fmt(b)} = ${fmt(s)}. Controle: ${fmt(s)} − ${fmt(b)} = ____`, antwoord: fmt(a), fouten: uniek([s + b, s, b, a + 10].map(fmt), fmt(a)), kern: `k+${a}.${b}`, moeilijkheid: [cijfers(s)], data: { ctl: 'inv', bew, a, b, s } }; }
  if (bew === '−') { const b = r.geheel(11, Math.floor(p.max / 2)), a = r.geheel(b + 11, p.max), v = a - b; return { vraag: `${fmt(a)} − ${fmt(b)} = ${fmt(v)}. Controle: ${fmt(v)} + ${fmt(b)} = ____`, antwoord: fmt(a), fouten: uniek([a - 10, v - b > 0 ? v - b : v + a, b, a + 10].map(fmt), fmt(a)), kern: `k-${a}.${b}`, moeilijkheid: [cijfers(a)], data: { ctl: 'inv', bew, a, b, v } }; }
  if (bew === '×') { const a = r.geheel(11, 99), b = r.geheel(2, 9), pr = a * b; return { vraag: `${a} × ${b} = ${fmt(pr)}. Controle: ${fmt(pr)} : ${b} = ____`, antwoord: fmt(a), fouten: uniek([a + 1, a * b, b, a - 10].map(fmt), fmt(a)), kern: `k×${a}.${b}`, moeilijkheid: [cijfers(pr)], data: { ctl: 'inv', bew, a, b, pr } }; }
  const b = r.geheel(2, 9), q = r.geheel(11, 99), a = b * q; return { vraag: `${fmt(a)} : ${b} = ${fmt(q)}. Controle: ${fmt(q)} × ${b} = ____`, antwoord: fmt(a), fouten: uniek([a + b, a - b, q + b, a + 10].map(fmt), fmt(a)), kern: `k:${a}.${b}`, moeilijkheid: [cijfers(a)], data: { ctl: 'inv', bew, a, b, q } };
};
export const CONTROLE_VORMEN = maakOpgaveVormen({
  id: 'ctl', titel: 'Controleren met de omgekeerde bewerking', doelen: AUTO_DOELEN.ctl || [], parameters: K.controleParameters, standaard: { types: ['inv'], max: 1000 },
  opdracht: opdracht('Controleer het resultaat. Vul het ontbrekende getal in.', 'Kies het juiste getal. Omcirkel.'), opgave: ctlOpgave,
});

/* ------------------------------------------------------------------ cijferen */
const cfrOpgave = (r, p) => {
  const t = kies(r, p.types), max = p.max;
  if (t === 'cijfer+') { const a = r.geheel(Math.floor(max / 10), max - 1), b = r.geheel(Math.floor(max / 10), max - 1); if (a + b > max * 2 || (a % 10) + (b % 10) < 10) return null; const s = a + b; return { vraag: `${fmt(a)} + ${fmt(b)} = ____`, antwoord: fmt(s), fouten: uniek([s - 10, s - 100, s + 10, a + b - (a % 10) * 0 + 1000 * (s >= 1000 ? 0 : 0) + 100].map(fmt), fmt(s)), kern: `c+${a}.${b}`, moeilijkheid: [cijfers(s)], data: { cfr: t, a, b, antw: s } }; }
  if (t === 'cijfer-') { const b = r.geheel(Math.floor(max / 10), max - 2), a = r.geheel(b + 1, max); if ((a % 10) >= (b % 10)) return null; const v = a - b; return { vraag: `${fmt(a)} − ${fmt(b)} = ____`, antwoord: fmt(v), fouten: uniek([v + 10, v - 10, v + 100, Math.abs((a % 10) - (b % 10)) + (a - (a % 10)) - (b - (b % 10))].map(fmt), fmt(v)), kern: `c-${a}.${b}`, moeilijkheid: [cijfers(a)], data: { cfr: t, a, b, antw: v } }; }
  const ruimteB = p.eenvoudig ? 9 : 99;
  if (t === 'cijfer×') { const b = r.geheel(2, ruimteB), a = r.geheel(Math.floor(max / 100) + 10, Math.max(40, Math.floor(max / b))); if ((a % 10) * b < 10 && b < 10) return null; const pr = a * b; return { vraag: `${fmt(a)} × ${b} = ____`, antwoord: fmt(pr), fouten: uniek([pr + 10, pr - 10, pr + b * 10, a + b].map(fmt), fmt(pr)), kern: `c×${a}.${b}`, moeilijkheid: [cijfers(pr)], data: { cfr: t, a, b, antw: pr } }; }
  const b = r.geheel(2, ruimteB), q = r.geheel(12, Math.max(30, Math.floor(max / b / 2))), rest = r.volgende() < 0.4 ? r.geheel(1, b - 1) : 0, a = b * q + rest;
  return { vraag: `${fmt(a)} : ${b} = ____${rest ? ` (rest ${rest})` : ''}`, antwoord: fmt(q), fouten: uniek([q + 1, q - 1, q * 10, q + 10].map(fmt), fmt(q)), kern: `c:${a}.${b}`, moeilijkheid: [cijfers(a)], data: { cfr: t, a, b, q, rest } };
};
export const CIJFEREN_VORMEN = maakOpgaveVormen({
  id: 'cfr', titel: 'Cijferen', doelen: AUTO_DOELEN.cfr || [], parameters: K.cijferParameters, standaard: { types: ['cijfer+', 'cijfer-'], max: 1000, eenvoudig: true },
  opdracht: opdracht('Cijfer en schrijf het antwoord op de lijn.', 'Cijfer en kies het juiste antwoord. Omcirkel.'), opgave: cfrOpgave,
});

/* ------------------------------------------------------------------ rekenvolgorde en het gelijkheidsteken */
const evalUitdrukking = (t) => { const delen = t.split(' '); return delen.length; };
void evalUitdrukking;
const vlgOpgave = (r, p) => {
  const t = kies(r, p.types), groot = p.jaar >= 4 ? 20 : 9;
  if (t === 'lr') { const a = r.geheel(10, 40), b = r.geheel(1, 9), c = r.geheel(1, 9), min = r.volgende() < 0.5, uit = min ? `${a} − ${b} + ${c}` : `${a} + ${b} − ${c}`, antw = min ? a - b + c : a + b - c; return { vraag: `${uit} = ____`, antwoord: antw, fouten: uniek([min ? a - (b + c) : a + b + c, a, antw + 2 * c].map(String), antw), kern: `l${uit}`, moeilijkheid: [1], data: { vlg: t, uit, antw } }; }
  const a = r.geheel(2, groot), b = r.geheel(2, 9), c = r.geheel(2, 9);
  if (t === 'maalvoor') { const plus = r.volgende() < 0.5, uit = plus ? `${a} + ${b} × ${c}` : `${a * c} − ${b} × ${c}`, antw = plus ? a + b * c : a * c - b * c; if (antw < 0) return null; const fout = plus ? (a + b) * c : (a * c - b) * c; return { vraag: `${uit} = ____`, antwoord: antw, fouten: uniek([fout, antw + c, antw - c].map(String), antw), kern: `m${uit}`, moeilijkheid: [2], data: { vlg: t, uit, antw } }; }
  const uit = `(${a} + ${b}) × ${c}`, antw = (a + b) * c; return { vraag: `${uit} = ____`, antwoord: antw, fouten: uniek([a + b * c, a * c + b, antw + c].map(String), antw), kern: `h${uit}`, moeilijkheid: [2], data: { vlg: t, uit, antw } };
};
export const VOLGORDE_VORMEN = maakOpgaveVormen({
  id: 'vlg', titel: 'Rekenvolgorde en haakjes', doelen: AUTO_DOELEN.vlg || [], parameters: K.volgordeParameters, standaard: { types: ['lr', 'maalvoor', 'haakjes'], jaar: 3 },
  opdracht: opdracht('Reken uit in de juiste volgorde. Schrijf het antwoord op de lijn.', 'Reken uit in de juiste volgorde. Omcirkel het juiste antwoord.'), opgave: vlgOpgave,
});

const glkOpgave = (r, p) => {
  const g = p.jaar <= 2 ? 10 : p.jaar === 3 ? 100 : 1000, a = r.geheel(2, g), b = r.geheel(2, g), c = r.geheel(1, Math.min(a + b - 1, g));
  const type = kies(r, ['gat', 'klopt']);
  if (type === 'gat') return { vraag: `${a} + ${b} = ____ + ${c}`, antwoord: a + b - c, fouten: uniek([a + b, a + b + c, a + b - c + 1].map(String), a + b - c), kern: `g${a}.${b}.${c}`, moeilijkheid: [cijfers(g)], data: { glk: type, a, b, c } };
  const klopt = r.volgende() < 0.5, rechts = klopt ? a + b - c + c : a + b - c + c + r.geheel(1, 3); const rb = a + b - c, ra = rechts - rb;
  if (!klopt && ra === c) return null;
  return { vraag: `Klopt het? ${a} + ${b} = ${rb} + ${ra}${' '.repeat(3)}→${' '.repeat(3)}____`, antwoord: a + b === rb + ra ? 'ja' : 'nee', fouten: [a + b === rb + ra ? 'nee' : 'ja'], kern: `gk${a}.${b}.${rb}.${ra}`, moeilijkheid: [cijfers(g)], data: { glk: type, a, b, rb, ra } };
};
export const GELIJK_VORMEN = maakOpgaveVormen({
  id: 'glk', titel: 'Het gelijkheidsteken', doelen: AUTO_DOELEN.glk || [], parameters: K.gelijkParameters, standaard: { jaar: 3 },
  opdracht: opdracht('Vul het ontbrekende getal in, of zeg of het klopt (ja of nee).', 'Kies het juiste antwoord. Omcirkel.'), opgave: glkOpgave,
});

export const AUTO_REKENEN_VORMEN = [...TIENVOUD_VORMEN, ...COMPENSEER_VORMEN, ...HANDIG_VORMEN, ...SCHAT_VORMEN, ...CONTROLE_VORMEN, ...CIJFEREN_VORMEN, ...VOLGORDE_VORMEN, ...GELIJK_VORMEN];
