// Laatste doelen uit leerjaar 3 tot 6: de negenproef, talstelsels (binair en Romeins), de breuk als deel van een geheel, een breuk naar een kommagetal,
// bewerkingen met breuken en kommagetallen samen, en het verschil tussen een staafdiagram en een histogram.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && !(typeof x === 'number' && (x < 0 || !Number.isFinite(x))) && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const duizend = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const opdracht = (invullen) => ({ invullen, kiezen: 'Lees goed. Kies het juiste antwoord. Omcirkel.', 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
// een geheel getal n dat k cijfers na de komma heeft, als tekst met komma (nullen achteraan weggelaten)
export const komma = (n, k) => {
  const s = String(Math.abs(n)).padStart(k + 1, '0'), e = s.slice(0, -k), f = s.slice(-k).replace(/0+$/, '');
  return (n < 0 ? '-' : '') + (f ? `${e},${f}` : e);
};

/* ------------------------------------------------------------------ de negenproef */
export const negenRest = (n) => String(n).split('').reduce((a, c) => a + Number(c), 0) % 9;
const negenproef = (r) => {
  const maal = r.volgende() < 0.5, a = r.geheel(120, 980), b = r.geheel(12, 98), echt = maal ? a * b : a + b, teken = maal ? '×' : '+';
  if (r.volgende() < 0.4) return mk(`Het negenproefrest van ${a} is ____`, negenRest(a), [...Array(9).keys()].filter(x => x !== negenRest(a)).sort(() => r.volgende() - 0.5).slice(0, 4), `np-r${a}`, 2, { soort: 'rest', a });
  const fout = r.volgende() < 0.5;
  let uitkomst = echt;
  if (fout) { do { uitkomst = echt + kies(r, [-1, 1]) * r.geheel(1, 40); } while (uitkomst <= 0 || negenRest(uitkomst) === negenRest(echt)); }
  return mk(`Je rekent ${a} ${teken} ${b} = ${duizend(uitkomst)}. Klopt de uitkomst volgens de negenproef? ____`, fout ? 'nee' : 'ja', [fout ? 'ja' : 'nee', 'soms'], `np-${a}${teken}${b}=${uitkomst}`, 3, { soort: 'proef', a, b, teken, uitkomst, fout });
};
export const NEGENPROEF_VORMEN = maakOpgaveVormen({
  id: 'ngp', titel: 'De negenproef', doelen: AUTO_DOELEN.ngp || [], parameters: K.negenproefParameters, standaard: { jaar: 6 }, vormen: ['invullen', 'kiezen', 'juist-fout'],
  opdracht: opdracht('Tel de cijfers op tot je nog één cijfer overhoudt (9 telt als 0). Schrijf het antwoord op de lijn.'), opgave: negenproef,
});

/* ------------------------------------------------------------------ talstelsels: binair en Romeinse cijfers */
const ROMEINS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const naarRomeins = (n) => ROMEINS.reduce((s, [w, t]) => { while (n >= w) { s += t; n -= w; } return s; }, '');
const talstelsel = (r) => {
  const soort = kies(r, ['bin-som', 'bin-naar', 'bin-van', 'rom-som', 'rom-verschil']);
  if (soort === 'bin-som') { const a = r.geheel(1, 15), b = r.geheel(1, 15); return mk(`Reken in het tweetallig stelsel: ${a.toString(2)} + ${b.toString(2)} = ____`, (a + b).toString(2), [(a + b).toString(10), (a * b).toString(2), (a + b + 1).toString(2), (a + b - 1).toString(2)], `ts-bs${a}.${b}`, 3, { soort, a, b }); }
  if (soort === 'bin-naar') { const n = r.geheel(5, 31); return mk(`Schrijf ${n} in het tweetallig stelsel: ____`, n.toString(2), [(n + 1).toString(2), (n - 1).toString(2), String(n), n.toString(2).split('').reverse().join('')], `ts-bn${n}`, 2, { soort, n }); }
  if (soort === 'bin-van') { const n = r.geheel(5, 31); return mk(`Het getal ${n.toString(2)} in het tweetallig stelsel is in ons tientallig stelsel ____`, n, [Number(n.toString(2)), n + 1, n - 1, parseInt(n.toString(2).split('').reverse().join(''), 2)], `ts-bv${n}`, 2, { soort, n }); }
  if (soort === 'rom-som') { const a = r.geheel(3, 39), b = r.geheel(3, 39); return mk(`Reken met Romeinse cijfers: ${naarRomeins(a)} + ${naarRomeins(b)} = ____`, naarRomeins(a + b), [naarRomeins(a + b + 1), naarRomeins(a + b - 1), naarRomeins(a + b + 10), naarRomeins(a + b - 10)], `ts-rs${a}.${b}`, 3, { soort, a, b }); }
  const a = r.geheel(15, 60), b = r.geheel(3, a - 3); return mk(`Reken met Romeinse cijfers: ${naarRomeins(a)} − ${naarRomeins(b)} = ____`, naarRomeins(a - b), [naarRomeins(a - b + 1), naarRomeins(a - b - 1), naarRomeins(a + b), naarRomeins(a - b + 10)], `ts-rv${a}.${b}`, 3, { soort, a, b });
};
export const TALSTELSEL_VORMEN = maakOpgaveVormen({
  id: 'tls', titel: 'Rekenen in andere talstelsels', doelen: AUTO_DOELEN.tls || [], parameters: K.talstelselParameters, standaard: { jaar: 6 }, vormen: ['invullen', 'kiezen', 'juist-fout'],
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.'), opgave: talstelsel,
});

/* ------------------------------------------------------------------ de breuk hangt samen met het geheel */
const DINGEN = [['de', 'pizza'], ['de', 'reep chocolade'], ['de', 'taart'], ['het', 'lint'], ['de', 'koek']];
const breukGeheel = (r) => {
  const soort = kies(r, ['stukken', 'geheel', 'groot-klein']);
  if (soort === 'stukken') { const n = r.geheel(2, 12), [lid, ding] = kies(r, DINGEN); return mk(`Een stuk is 1/${n} van een ${ding}. Hoeveel van zulke stukken vormen samen ${lid} hele ${ding}? ____`, n, [n - 1, n + 1, 1, n * 2], `bg-s${n}.${ding}`, 1, { soort, n }); }
  if (soort === 'geheel') { const n = r.geheel(2, 10), x = r.geheel(2, 9); return mk(`1/${n} van een getal is ${x}. Het hele getal is ____`, n * x, [x, n + x, x * x, n * x + n], `bg-g${n}.${x}`, 3, { soort, n, x }); }
  const [a, b] = r.volgende() < 0.5 ? ['grote', 'kleine'] : ['kleine', 'grote'], n = kies(r, [2, 3, 4]);
  return mk(`Mila eet 1/${n} van een ${a} pizza. Lars eet 1/${n} van een ${b} pizza. Eten ze evenveel? ____`, 'nee', ['ja', 'soms'], `bg-v${n}.${a}`, 2, { soort, n });
};
export const BREUK_GEHEEL_VORMEN = maakOpgaveVormen({
  id: 'bgh', titel: 'Een breuk en het geheel', doelen: AUTO_DOELEN.bgh || [], parameters: K.breukGeheelParameters, standaard: { jaar: 3 }, vormen: ['invullen', 'kiezen', 'juist-fout'],
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: breukGeheel,
});

/* ------------------------------------------------------------------ een breuk met een deling naar een kommagetal (twee cijfers na de komma, afgerond) */
const tweeVijf = (d) => { let x = d; while (x % 2 === 0) x /= 2; while (x % 5 === 0) x /= 5; return x === 1; };
const ggdB = (a, b) => (b ? ggdB(b, a % b) : a);
export const afgerond = (n, d) => Math.floor((n * 200 + d) / (2 * d)); // n/d in honderdsten, afgerond
const breukKomma = (r) => {
  const d = kies(r, [3, 6, 7, 9, 11, 12, 15]), n = r.geheel(1, d - 1);
  if (tweeVijf(d) || ggdB(n, d) !== 1) return null;
  const h = afgerond(n, d);
  return mk(`Zet de breuk ${n}/${d} om met een deling: ${n} : ${d} ≈ ____ (rond af op 2 cijfers na de komma)`, komma(h, 2), [komma(h + 1, 2), komma(h - 1, 2), komma(h + 10, 2), komma(Math.floor((n * 100) / d), 2)], `bk-${n}.${d}`, 3, { soort: 'deling', n, d, h });
};
export const BREUK_KOMMA_VORMEN = maakOpgaveVormen({
  id: 'bkv', titel: 'Een breuk omzetten met een deling', doelen: AUTO_DOELEN.bkv || [], parameters: K.breukKommaParameters, standaard: { jaar: 6 }, vormen: ['invullen', 'kiezen', 'juist-fout'],
  opdracht: opdracht('Deel de teller door de noemer. Schrijf het antwoord op de lijn.'), opgave: breukKomma,
});

/* ------------------------------------------------------------------ kommagetallen en breuken samen */
const NOEMERS = [2, 4, 5, 10, 20, 25];
const decimaalMetBreuk = (r) => {
  const d = kies(r, NOEMERS), n = r.geheel(1, d - 1), honderdste = (n * 100) / d, soort = kies(r, ['plus', 'min', 'maal']);
  if (!Number.isInteger(honderdste)) return null;
  const dec = r.geheel(1, 29) * (r.volgende() < 0.5 ? 1 : 10);
  if (soort === 'plus') return mk(`${komma(dec, 2)} + ${n}/${d} = ____`, komma(dec + honderdste, 2), [komma(dec + n, 2), komma(dec + honderdste + 10, 2), komma(dec + honderdste - 1, 2)], `db-p${dec}.${n}.${d}`, 3, { soort, dec, n, d });
  if (soort === 'min') { const groot = dec + honderdste + r.geheel(5, 60); return mk(`${komma(groot, 2)} − ${n}/${d} = ____`, komma(groot - honderdste, 2), [komma(groot - n, 2), komma(groot + honderdste, 2), komma(groot - honderdste + 10, 2)], `db-m${groot}.${n}.${d}`, 3, { soort, dec: groot, n, d }); }
  return mk(`${n}/${d} × ${komma(dec, 2)} = ____`, komma(honderdste * dec, 4), [komma(honderdste * dec * 10, 4), komma(Math.round(honderdste * dec / 10), 4), komma(honderdste * dec + dec, 4)], `db-x${dec}.${n}.${d}`, 3, { soort, dec, n, d });
};
export const DECIMAAL_BREUK_VORMEN = maakOpgaveVormen({
  id: 'dbc', titel: 'Kommagetallen en breuken samen', doelen: AUTO_DOELEN.dbc || [], parameters: K.decimaalMetBreukParameters, standaard: { jaar: 6 }, vormen: ['invullen', 'kiezen', 'juist-fout'],
  opdracht: opdracht('Zet om naar hetzelfde soort getal en reken uit. Schrijf het antwoord op de lijn.'), opgave: decimaalMetBreuk,
});

/* ------------------------------------------------------------------ staafdiagram of histogram */
const GRAFIEKEN = [
  ['Je telt hoeveel kinderen een hond, een kat of een vis als lievelingsdier hebben.', 'staafdiagram'],
  ['Je deelt de lengtes van 30 kinderen in klassen in: 140 tot 150 cm, 150 tot 160 cm, 160 tot 170 cm.', 'histogram'],
  ['Je telt hoeveel kinderen een blauwe, groene of bruine trui dragen.', 'staafdiagram'],
  ['Je deelt de tijd die kinderen nodig hebben om naar school te komen in klassen van 5 minuten in.', 'histogram'],
  ['Je telt hoeveel kinderen in elke maand jarig zijn.', 'staafdiagram'],
  ['Je deelt de massa van 40 appels in klassen in: 100 tot 120 g, 120 tot 140 g, 140 tot 160 g.', 'histogram'],
  ['De staven van de grafiek raken elkaar, omdat de klassen op elkaar aansluiten.', 'histogram'],
  ['De staven van de grafiek staan los van elkaar, omdat elke staaf een aparte categorie is.', 'staafdiagram'],
];
const histogram = (r) => { const [v, a] = kies(r, GRAFIEKEN); return mk(`${v} Welke grafiek past hierbij? ____`, a, [a === 'histogram' ? 'staafdiagram' : 'histogram', 'cirkeldiagram'], `hg-${v}`, 2, { soort: 'grafiek', antwoord: a }); };
export const HISTOGRAM_VORMEN = maakOpgaveVormen({
  id: 'hsg', titel: 'Staafdiagram of histogram', doelen: AUTO_DOELEN.hsg || [], parameters: K.histogramParameters, standaard: { jaar: 6 }, vormen: ['kiezen', 'juist-fout'], pictogram: 'omcirkelen',
  opdracht: opdracht(''), opgave: histogram,
});

export const AUTO_AFWERKING6_VORMEN = [...NEGENPROEF_VORMEN, ...TALSTELSEL_VORMEN, ...BREUK_GEHEEL_VORMEN, ...BREUK_KOMMA_VORMEN, ...DECIMAAL_BREUK_VORMEN, ...HISTOGRAM_VORMEN];
