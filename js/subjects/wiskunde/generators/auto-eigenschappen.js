// Rekeneigenschappen: commutativiteit, associativiteit, distributiviteit, neutraal en opslorpend element, inverse bewerkingen,
// herhaalde optelling, compenseren en ontbinden. Elke opgave toont de eigenschap met getallen en laat een getal invullen
// (of 'klopt het?' bij eigenschappen die niet gelden). De doelen komen uit ../auto-doelen.js.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import { eigenschapParameters } from '../classificatie.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
// Grootte van de getallen per leerjaar.
const GROOTTE = { 0: { s: 5, p: 5 }, 1: { s: 9, p: 5 }, 2: { s: 20, p: 10 }, 3: { s: 100, p: 10 }, 4: { s: 1000, p: 10 }, 5: { s: 1000, p: 12 }, 6: { s: 10000, p: 12 } };
const JN = ['ja', 'nee'];
const JA_NEE = (vraag, klopt, kern, data) => ({ vraag: `Klopt het? ${vraag}${' '.repeat(3)}→${' '.repeat(3)}____`, antwoord: klopt ? 'ja' : 'nee', fouten: [klopt ? 'nee' : 'ja'], kern, data });

const OPGAVEN = {
  'comm+': (r, g) => { const a = r.geheel(1, g.s), b = r.geheel(1, g.s); if (a === b) return null; return { vraag: `${a} + ${b} = ${b} + ____`, antwoord: a, fouten: [b, a + b, a + 1], kern: `c+${[a, b].sort((x, y) => x - y)}`, data: { eig: 'comm+', a, b } }; },
  'ncomm-': (r, g) => { const b = r.geheel(1, Math.max(1, Math.floor(g.s / 2))), a = r.geheel(b + 1, g.s), klopt = false; return JA_NEE(`${a} − ${b} = ${b} − ${a}`, klopt, `nc-${a}-${b}`, { eig: 'ncomm-', a, b }); },
  'comm×': (r, g) => { const a = r.geheel(2, g.p), b = r.geheel(2, g.p); if (a === b) return null; return { vraag: `${a} × ${b} = ${b} × ____`, antwoord: a, fouten: [b, a * b, a + b], kern: `c×${[a, b].sort((x, y) => x - y)}`, data: { eig: 'comm×', a, b } }; },
  'ncomm:': (r, g) => { const b = r.geheel(2, g.p), q = r.geheel(2, g.p), a = b * q; return JA_NEE(`${a} : ${b} = ${b} : ${a}`, false, `nc:${a}-${b}`, { eig: 'ncomm:', a, b }); },
  'ass+': (r, g) => { const a = r.geheel(1, g.s), b = r.geheel(1, g.s), c = r.geheel(1, g.s); return { vraag: `(${a} + ${b}) + ${c} = ${a} + (${b} + ____)`, antwoord: c, fouten: [a, b, b + c], kern: `a+${a}.${b}.${c}`, data: { eig: 'ass+', a, b, c } }; },
  'nass-': (r, g) => { const c = r.geheel(1, Math.max(1, Math.floor(g.s / 4))), b = r.geheel(c + 1, Math.max(c + 2, Math.floor(g.s / 2))), a = r.geheel(b + c + 1, g.s + b + c); return JA_NEE(`(${a} − ${b}) − ${c} = ${a} − (${b} − ${c})`, false, `na-${a}.${b}.${c}`, { eig: 'nass-', a, b, c }); },
  'ass×': (r, g) => { const a = r.geheel(2, g.p), b = r.geheel(2, g.p), c = r.geheel(2, g.p); return { vraag: `(${a} × ${b}) × ${c} = ${a} × (${b} × ____)`, antwoord: c, fouten: [a, b, b * c], kern: `a×${a}.${b}.${c}`, data: { eig: 'ass×', a, b, c } }; },
  'nass:': (r, g) => { const c = r.geheel(2, 4), b = c * r.geheel(1, 4), a = b * c * r.geheel(1, 5); return JA_NEE(`(${a} : ${b}) : ${c} = ${a} : (${b} : ${c})`, false, `n:${a}.${b}.${c}`, { eig: 'nass:', a, b, c }); },
  'dist×+': (r, g) => { const a = r.geheel(2, g.p), b = r.geheel(2, g.p), c = r.geheel(2, g.p); if (b === c) return null; return { vraag: `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ____`, antwoord: c, fouten: [a, b, b + c], kern: `d×+${a}.${b}.${c}`, data: { eig: 'dist×+', a, b, c } }; },
  'dist×-': (r, g) => { const a = r.geheel(2, g.p), c = r.geheel(2, g.p), b = r.geheel(c + 1, c + g.p); return { vraag: `${a} × (${b} − ${c}) = ${a} × ${b} − ${a} × ____`, antwoord: c, fouten: [a, b, b - c], kern: `d×-${a}.${b}.${c}`, data: { eig: 'dist×-', a, b, c } }; },
  'dist:+': (r, g) => { const d = r.geheel(2, g.p), a = d * r.geheel(1, g.p), b = d * r.geheel(1, g.p); if (a === b) return null; return { vraag: `(${a} + ${b}) : ${d} = ${a} : ${d} + ${b} : ____`, antwoord: d, fouten: [a, b, a / d], kern: `d:+${a}.${b}.${d}`, data: { eig: 'dist:+', a, b, d } }; },
  'dist:-': (r, g) => { const d = r.geheel(2, g.p), y = r.geheel(1, g.p), a = d * (y + r.geheel(1, g.p)), b = d * y; return { vraag: `(${a} − ${b}) : ${d} = ${a} : ${d} − ${b} : ____`, antwoord: d, fouten: [a, b, a / d], kern: `d:-${a}.${b}.${d}`, data: { eig: 'dist:-', a, b, d } }; },
  'n0+': (r, g) => { const a = r.geheel(1, g.s); return r.volgende() < 0.5 ? { vraag: `${a} + 0 = ____`, antwoord: a, fouten: [0, a + 1, a - 1], kern: `n0+${a}`, data: { eig: 'n0+', a } } : { vraag: `${a} − 0 = ____`, antwoord: a, fouten: [0, a + 1, a - 1], kern: `n0-${a}`, data: { eig: 'n0+', a } }; },
  'n0-': (r, g) => { const a = r.geheel(1, g.s); return JA_NEE(`0 − ${a} = ${a} − 0`, false, `n0n${a}`, { eig: 'n0-', a }); },
  'n1×': (r, g) => { const a = r.geheel(2, Math.max(3, g.s)); return r.volgende() < 0.5 ? { vraag: `${a} × 1 = ____`, antwoord: a, fouten: [1, a + 1, a * 2], kern: `n1×${a}`, data: { eig: 'n1×', a } } : { vraag: `${a} : 1 = ____`, antwoord: a, fouten: [1, 0, a + 1], kern: `n1:${a}`, data: { eig: 'n1×', a, deel: true } }; },
  'n1:': (r, g) => { const a = r.geheel(2, Math.max(3, g.p)); return JA_NEE(`1 : ${a} = ${a} : 1`, false, `n1n${a}`, { eig: 'n1:', a }); },
  'op0×': (r, g) => { const a = r.geheel(1, g.s); return r.volgende() < 0.5 ? { vraag: `${a} × 0 = ____`, antwoord: 0, fouten: [a, 1, a + 1], kern: `o0×${a}`, data: { eig: 'op0×', a } } : { vraag: `0 × ${a} = ____`, antwoord: 0, fouten: [a, 1, a + 1], kern: `o0×r${a}`, data: { eig: 'op0×', a } }; },
  'op0:': (r, g) => { const a = r.geheel(2, Math.max(3, g.s)); return r.volgende() < 0.5 ? { vraag: `0 : ${a} = ____`, antwoord: 0, fouten: [a, 1, a + 1], kern: `o0:${a}`, data: { eig: 'op0:', a } } : JA_NEE(`${a} : 0 = 0`, false, `o0n${a}`, { eig: 'op0:', a, deelDoorNul: true }); },
  'inv+-': (r, g) => { const a = r.geheel(1, g.s), b = r.geheel(1, g.s), s = a + b; return r.volgende() < 0.5 ? { vraag: `${a} + ${b} = ${s}, dus ${s} − ${b} = ____`, antwoord: a, fouten: [b, s, a + 1], kern: `i+${a}.${b}`, data: { eig: 'inv+-', a, b, s } } : { vraag: `${a} + ${b} = ${s}, dus ${s} − ${a} = ____`, antwoord: b, fouten: [a, s, b + 1], kern: `i+${a}.${b}b`, data: { eig: 'inv+-', a: b, b: a, s } }; },
  'inv×:': (r, g) => { const a = r.geheel(2, g.p), b = r.geheel(2, g.p), p = a * b; if (a === b) return null; return { vraag: `${a} × ${b} = ${p}, dus ${p} : ${b} = ____`, antwoord: a, fouten: [b, p, a + 1], kern: `i×${a}.${b}`, data: { eig: 'inv×:', a, b, p } }; },
  'herh': (r, g) => { const a = r.geheel(2, g.p), b = r.geheel(3, 6); if (r.volgende() < 0.5) return { vraag: `${a} × ${b} = ${Array(b - 1).fill(a).join(' + ')} + ____`, antwoord: a, fouten: [b, a * b, a + b], kern: `h×${a}.${b}`, data: { eig: 'herh', a, b } }; const p = a * b; return { vraag: `${p} ${Array(b).fill(`− ${a}`).join(' ')} = 0, dus ${p} : ${a} = ____`, antwoord: b, fouten: [a, p, b + 1], kern: `h:${a}.${b}`, data: { eig: 'herh', a, b, deel: true } }; },
  'comp+': (r, g) => { const a = r.geheel(2, g.s), b = r.geheel(2, g.s), k = r.geheel(1, Math.min(b - 1, 10)); return { vraag: `${a} + ${b} = (${a} + ${k}) + (${b} − ____)`, antwoord: k, fouten: [a, b, k + 1], kern: `p+${a}.${b}.${k}`, data: { eig: 'comp+', a, b, k } }; },
  'comp-': (r, g) => { const b = r.geheel(2, g.s), a = r.geheel(b + 1, b + g.s), k = r.geheel(1, 10); return { vraag: `${a} − ${b} = (${a} + ${k}) − (${b} + ____)`, antwoord: k, fouten: [a, b, k + 1], kern: `p-${a}.${b}.${k}`, data: { eig: 'comp-', a, b, k } }; },
  'comp×': (r, g) => { const k = kies(r, [2, 4, 5, 10]), b = k * r.geheel(1, 6), a = r.geheel(2, g.p); return { vraag: `${a} × ${b} = (${a} × ${k}) × (${b} : ____)`, antwoord: k, fouten: [a, b, k * 2], kern: `p×${a}.${b}.${k}`, data: { eig: 'comp×', a, b, k } }; },
  'comp:': (r, g) => { const b = r.geheel(2, 9), q = r.geheel(2, 9), a = b * q, k = kies(r, [2, 3, 5, 10]); return { vraag: `${a} : ${b} = (${a} × ${k}) : (${b} × ____)`, antwoord: k, fouten: [a, b, k + 1], kern: `p:${a}.${b}.${k}`, data: { eig: 'comp:', a, b, k } }; },
  'ontb': (r, g) => { const f1 = kies(r, [2, 3, 4, 5]), f2 = kies(r, [2, 3, 4, 5]), a = r.geheel(2, 20); if (r.volgende() < 0.5) return { vraag: `${a} × ${f1 * f2} = ${a} × ${f1} × ____`, antwoord: f2, fouten: [f1, f1 * f2, a], kern: `o×${a}.${f1}.${f2}`, data: { eig: 'ontb', a, f1, f2 } }; const x = f1 * f2 * r.geheel(1, 8); return { vraag: `${x} : ${f1 * f2} = ${x} : ${f1} : ____`, antwoord: f2, fouten: [f1, f1 * f2, x / (f1 * f2)], kern: `o:${x}.${f1}.${f2}`, data: { eig: 'ontb', a: x, f1, f2, deel: true } }; },
  'deelrest': (r, g) => { const d = r.geheel(3, 12), q = r.geheel(2, 15), rest = r.geheel(1, d - 1), D = d * q + rest; return { vraag: `${D} = ${d} × ${q} + ____`, antwoord: rest, fouten: [q, d, d - rest], kern: `dr${D}.${d}`, data: { eig: 'deelrest', D, d, q, rest } }; },
};

export const EIGENSCHAPPEN_TYPES = Object.keys(OPGAVEN);
export const EIGENSCHAPPEN_VORMEN = maakOpgaveVormen({
  id: 'eig', titel: 'Rekeneigenschappen', pictogram: 'schrijven', doelen: AUTO_DOELEN.eig || [], schaal: 0.84,
  parameters: eigenschapParameters, standaard: { types: ['comm+', 'ass+', 'dist×+', 'n0+'], jaar: 3 },
  opdracht: {
    invullen: 'Vul het ontbrekende getal in, of zeg of het klopt (ja of nee).', kiezen: 'Kies het juiste getal, of zeg of het klopt (ja of nee). Omcirkel.', 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.',
  },
  opgave: (r, p) => {
    const g = GROOTTE[Math.min(6, p.jaar)] || GROOTTE[3];
    for (let t = 0; t < 20; t++) { const o = OPGAVEN[kies(r, p.types)](r, g); if (o) return { ...o, moeilijkheid: [p.jaar, o.vraag.length] }; }
    return null;
  },
});
