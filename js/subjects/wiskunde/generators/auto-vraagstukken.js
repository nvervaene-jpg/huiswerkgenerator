// Vraagstukken en probleemoplossend denken: verhaaltjes met een rekenopdracht. Elke soort hoort bij een groep doelen (zie ../classificatie.js).
// Het antwoord staat na 'Antwoord:' op de plaats van ____; de gegevens zitten in data zodat de test het antwoord opnieuw kan uitrekenen.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { fmt, fmtDec, ggd } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const NAMEN = ['Lotte', 'Milan', 'Emma', 'Noah', 'Fien', 'Jules', 'Marie', 'Arne', 'Lena', 'Tom', 'Sara', 'Ruben'];
const DINGEN = [['appel', 'appels'], ['knikker', 'knikkers'], ['sticker', 'stickers'], ['boek', 'boeken'], ['pen', 'pennen'], ['koekje', 'koekjes'], ['bloem', 'bloemen'], ['kaart', 'kaarten'], ['ballon', 'ballonnen'], ['potlood', 'potloden']];
const CAP = [10, 20, 100, 1000, 10000, 10000, 10000];
const twee = (r) => { const n = r.schud(NAMEN); return [n[0], n[1]]; };
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = { invullen: 'Lees het vraagstuk. Reken uit en schrijf het antwoord op de lijn.', kiezen: 'Lees het vraagstuk. Kies het juiste antwoord. Omcirkel.', 'juist-fout': 'Lees het vraagstuk. Staat het juiste antwoord erbij? Omcirkel juist of fout.' };
const som = (l) => l.reduce((a, b) => a + b, 0);
const enkelv = (mv) => DINGEN.find(([, m]) => m === mv)[0];
const aantal = (n, [e, m]) => `${fmt(n)} ${n === 1 ? e : m}`;
const breukTekst = (a, b) => { const g = ggd(a, b); return b / g === 1 ? String(a / g) : `${a / g}/${b / g}`; };

// Een vraagstuk uit de familie: tekst + 'Antwoord: ____ eenheid'; getallen worden met fmt opgemaakt.
const maak = (tekst, eenheid, antwoord, fouten, kern, moeilijkheid, data, opties = {}) => {
  const toon = (x) => (typeof x === 'number' ? fmt(x) : String(x));
  const neg = opties.negatief;
  return { vraag: `${tekst} Antwoord: ____${eenheid ? ` ${eenheid}` : ''}.`, antwoord: toon(antwoord), fouten: uniek(fouten.filter(x => typeof x !== 'number' || (Number.isFinite(x) && (neg || x >= 0))), antwoord).map(toon), kern, moeilijkheid: [moeilijkheid], data };
};
const nf = (a, extra = [], stap = 10) => [...extra, a + 1, a - 1, a + stap, a - stap, a * 2];
// Twee gehele getallen waarvan de som hoogstens cap is.
const duo = (r, cap) => { const lo = Math.max(2, Math.floor(cap / 20)), a = r.geheel(lo, cap - lo), b = r.geheel(lo, cap - a); return [a, b]; };
// Twee factoren met een product van hoogstens cap (tafels voor tot 100, grotere getallen voor het hogere cijferen).
const fac = (r, cap) => { if (cap <= 100) return [r.geheel(2, 10), r.geheel(2, 10)]; if (cap <= 1000) return [r.geheel(11, 99), r.geheel(2, 9)]; const b = r.geheel(2, 9); return [r.geheel(100, Math.floor(10000 / b) - 1), b]; };

/* ------------------------------------------------------------------ optellen, aftrekken, vermenigvuldigen, delen */
const enkelOpgave = (r, jaar, extra) => {
  const cap = CAP[Math.min(jaar, 6)], op = kies(r, jaar <= 1 ? ['+', '-'] : ['+', '-', '×', '÷']), [n0, n1] = twee(r), ding = kies(r, DINGEN), mv = ding[1];
  let x, y, antw, tekst, soort, fouten;
  if (op === '+') {
    [x, y] = duo(r, cap); antw = x + y; soort = kies(r, ['combinatie', 'verandering']);
    tekst = soort === 'combinatie' ? `${n0} heeft ${aantal(x, ding)}. ${n1} heeft er ${y}. Hoeveel ${mv} hebben ze samen?` : `${n0} heeft ${aantal(x, ding)}. ${n0} krijgt er ${y} bij. Hoeveel ${mv} heeft ${n0} nu?`;
    fouten = nf(antw, [x - y, y - x]);
  } else if (op === '-') {
    [x, y] = duo(r, cap); if (x === y) y--; if (y > x) [x, y] = [y, x]; if (y < 1) return null; antw = x - y; soort = kies(r, ['verandering', 'vergelijking']);
    tekst = soort === 'verandering' ? `${n0} heeft ${aantal(x, ding)}. ${n0} geeft er ${y} weg. Hoeveel ${mv} heeft ${n0} nu?` : `${n0} heeft ${aantal(x, ding)}. ${n1} heeft er ${y}. Hoeveel ${mv} meer heeft ${n0} dan ${n1}?`;
    fouten = nf(antw, [x + y]);
  } else if (op === '×') {
    [x, y] = fac(r, cap); antw = x * y; soort = 'groepen';
    tekst = `Er zijn ${x} dozen. In elke doos zitten ${aantal(y, ding)}. Hoeveel ${mv} zijn er samen?`;
    fouten = nf(antw, [x + y, x * (y + 1), (x + 1) * y], Math.max(1, Math.round(antw / 10)));
  } else {
    const [q, d] = fac(r, cap); x = q * d; y = d; antw = q; soort = r.volgende() < 0.5 ? 'verdelen' : 'groeperen';
    tekst = soort === 'verdelen' ? `${n0} verdeelt ${aantal(x, ding)} eerlijk over ${y} kinderen. Hoeveel ${mv} krijgt elk kind?` : `${n0} heeft ${aantal(x, ding)} en stopt ze in zakjes van ${y}. Hoeveel zakjes zijn dat?`;
    fouten = nf(antw, [x - y, y, x + y], 1);
  }
  const data = { vrg: extra ? 'overbodig' : 'enkel', op, x, y, soort };
  if (extra) {
    let e; do { e = r.geheel(3, Math.max(9, Math.min(cap, 99))); } while ([x, y, antw].includes(e));
    const zin = kies(r, [`De juf is ${e} jaar oud.`, `Het is ${e} dagen geleden dat het regende.`, `In de klas hangen ${e} tekeningen.`, `Het schoolplein is ${e} meter lang.`]);
    data.extra = e; data.soort = 'overbodig';
    const delen = tekst.split('. '); // gegeven eraan toevoegen na de eerste zin
    tekst = `${delen[0]}. ${zin} ${delen.slice(1).join('. ')}`;
    fouten = [...fouten, antw + e, antw - e, x + e];
  }
  return maak(tekst, '', antw, fouten, `${op}${x}.${y}${extra ? '.e' : ''}`, op === '+' || op === '-' ? 1 : 2, data);
};

/* ------------------------------------------------------------------ misleidende signaalwoorden en omgekeerd redeneren */
const signaalOpgave = (r, jaar) => {
  const cap = CAP[Math.min(jaar, 6)], [x, y] = duo(r, Math.floor(cap / 2) + 2), [n0, n1] = twee(r), ding = kies(r, DINGEN), mv = ding[1];
  if (y >= x || y < 1) return null;
  const soort = kies(r, ['meer', 'minder']), antw = soort === 'meer' ? x - y : x + y;
  const tekst = soort === 'meer' ? `${n0} heeft ${aantal(x, ding)}. ${n0} heeft er ${y} meer dan ${n1}. Hoeveel ${mv} heeft ${n1}?` : `${n0} heeft ${aantal(x, ding)}. ${n0} heeft er ${y} minder dan ${n1}. Hoeveel ${mv} heeft ${n1}?`;
  return maak(tekst, '', antw, nf(antw, [soort === 'meer' ? x + y : x - y]), `s${soort}${x}.${y}`, 3, { vrg: 'signaal', soort, x, y });
};
const omgekeerdOpgave = (r, jaar) => {
  const cap = CAP[Math.min(jaar, 6)], [n0] = twee(r), ding = kies(r, DINGEN), mv = ding[1], soort = kies(r, jaar <= 1 ? ['erbij', 'weg'] : ['erbij', 'weg', 'keer']);
  if (soort === 'keer') { const [a, b] = fac(r, Math.min(cap, 100)); return maak(`${n0} heeft ${aantal(a * b, ding)} in dozen gedaan. In elke doos zitten er ${b}. Hoeveel dozen zijn dat?`, '', a, nf(a, [a * b, b], 1), `ok${a}.${b}`, 3, { vrg: 'omgekeerd', soort, x: a * b, y: b }); }
  const [x, y] = duo(r, cap); if (x < 2) return null;
  const antw = soort === 'erbij' ? x - y : x + y;
  const tekst = soort === 'erbij' ? `${n0} krijgt er ${y} ${mv} bij. Nu heeft ${n0} er ${x}. Hoeveel ${mv} had ${n0} eerst?` : `${n0} geeft ${aantal(y, ding)} weg. Er blijven er ${x} over. Hoeveel ${mv} had ${n0} eerst?`;
  return maak(tekst, '', antw, nf(antw, [soort === 'erbij' ? x + y : x - y]), `o${soort}${x}.${y}`, 3, { vrg: 'omgekeerd', soort, x, y });
};

/* ------------------------------------------------------------------ decimale getallen en breuken */
const decOpgave = (r) => {
  const a = r.geheel(120, 2400), b = r.geheel(35, 900), op = kies(r, ['+', '-']), [n0] = twee(r);
  if (op === '-' && a <= b) return null;
  const antw = op === '+' ? a + b : a - b, cd = (x) => fmtDec(x);
  const tekst = op === '+' ? `${n0} koopt een boek van € ${cd(a)} en een pen van € ${cd(b)}. Hoeveel euro kost dat samen?` : `${n0} heeft € ${cd(a)}. ${n0} koopt een ijsje van € ${cd(b)}. Hoeveel euro houdt ${n0} over?`;
  return maak(tekst, 'euro', cd(antw), [cd(op === '+' ? a - b : a + b), cd(antw + 100), cd(antw - 100), cd(antw + 10), cd(Math.round(antw / 10))], `d${op}${a}.${b}`, 2, { vrg: 'dec', op, a, b });
};
const breukPlusOpgave = (r) => {
  const d = r.geheel(3, 12), a = r.geheel(1, d - 2), b = r.geheel(1, d - 1 - a), op = kies(r, ['+', '-']), [n0] = twee(r);
  const x = op === '+' ? a : a + b, y = b;
  if (op === '+' && x + y >= d) return null;
  const antw = op === '+' ? breukTekst(x + y, d) : breukTekst(x - y, d);
  const tekst = op === '+' ? `${n0} eet ${x}/${d} van een taart. Daarna eet ${n0} nog ${y}/${d} van de taart. Hoeveel van de taart heeft ${n0} gegeten?` : `Er is nog ${x}/${d} van een taart. ${n0} eet ${y}/${d} van de taart. Hoeveel van de taart blijft er over?`;
  return maak(tekst, 'van de taart', antw, [breukTekst(op === '+' ? x + y : x - y, d + d), breukTekst(op === '+' ? x + y : x - y, d + y), breukTekst(op === '+' ? x - y || 1 : x + y, d), breukTekst(1, d)].filter(f => /^\d+(\/\d+)?$/.test(f)), `b${op}${x}.${y}.${d}`, 2, { vrg: 'breuk+', op, x, y, d });
};

/* ------------------------------------------------------------------ meerdere bewerkingen */
const samengesteldOpgave = (r, jaar) => {
  const soort = kies(r, ['wissel', 'twee-soorten', 'rest-delen']), [n0] = twee(r), ding = kies(r, DINGEN), mv = ding[1], groot = jaar >= 4;
  if (soort === 'wissel') { const n = r.geheel(2, 9), p = r.geheel(2, groot ? 25 : 12), q = r.geheel(1, 15), pay = Math.ceil((n * p + q + 1) / 10) * 10 + (r.volgende() < 0.5 ? 0 : 10), antw = pay - n * p - q; return maak(`${n0} koopt ${n} boeken van € ${p} en een pen van € ${q}. ${n0} betaalt met € ${pay}. Hoeveel euro krijgt ${n0} terug?`, 'euro', antw, nf(antw, [n * p + q, pay - n * p, pay - p - q], 1), `w${n}.${p}.${q}.${pay}`, 3, { vrg: 'samengesteld', soort, n, p, q, pay }); }
  if (soort === 'twee-soorten') { const a = r.geheel(2, 9), b = r.geheel(3, groot ? 60 : 12), c = r.geheel(2, 9), d = r.geheel(3, groot ? 60 : 12), antw = a * b + c * d; return maak(`In de ene kast staan ${a} rijen met ${aantal(b, ding)}. In de andere kast staan ${c} rijen met ${d}. Hoeveel ${mv} staan er samen?`, '', antw, nf(antw, [a * b, c * d, (a + c) * b, (a + c) * (b + d)], 2), `t${a}.${b}.${c}.${d}`, 3, { vrg: 'samengesteld', soort, a, b, c, d }); }
  const k = r.geheel(2, 9), q = r.geheel(2, groot ? 40 : 12), w = r.geheel(1, 9), tot = k * q + w;
  return maak(`${n0} heeft ${aantal(tot, ding)}. ${n0} geeft er ${w} weg en verdeelt de rest eerlijk over ${k} kinderen. Hoeveel ${mv} krijgt elk kind?`, '', q, nf(q, [Math.floor(tot / k), tot - w, tot - k], 1), `r${k}.${q}.${w}`, 3, { vrg: 'samengesteld', soort, k, q, w });
};

/* ------------------------------------------------------------------ één grootheid: lengte, inhoud, massa, tijd, geld, temperatuur en hoeken */
const GROOTHEDEN = [
  { naam: 'lengte', groot: 'm', klein: 'cm', f: 100, wat: 'een lint' }, { naam: 'lengte', groot: 'km', klein: 'm', f: 1000, wat: 'een wandelpad' },
  { naam: 'inhoud', groot: 'l', klein: 'dl', f: 10, wat: 'een fles sap' }, { naam: 'inhoud', groot: 'l', klein: 'ml', f: 1000, wat: 'een pot soep' },
  { naam: 'massa', groot: 'kg', klein: 'g', f: 1000, wat: 'een zak meel' }, { naam: 'tijd', groot: 'u', klein: 'min', f: 60, wat: 'een film' },
  { naam: 'geld', groot: 'euro', klein: 'cent', f: 100, wat: 'een spaarpot' },
];
const grootheidOpgave = (r, jaar) => {
  const soort = kies(r, jaar >= 4 ? ['eenheden', 'eenheden', 'temp', 'hoek'] : jaar >= 3 ? ['eenheden', 'gelijk'] : ['gelijk']), cap = CAP[Math.min(jaar, 6)];
  if (soort === 'temp') { const a = r.geheel(2, 20), b = r.geheel(3, 25), op = kies(r, ['kouder', 'warmer']), antw = op === 'warmer' ? a + b : a - b; return maak(`Om 8 uur is het ${a} °C. Tegen de middag wordt het ${b} graden ${op}. Hoeveel °C is het dan?`, '°C', antw === 0 ? '0' : antw < 0 ? `−${-antw}` : antw, [a + b, a - b, b - a, antw + 2, antw - 2].map(x => (x < 0 ? `−${-x}` : x)), `t${a}.${b}${op}`, 3, { vrg: 'grootheid', soort, a, b, op }, { negatief: true }); }
  if (soort === 'hoek') { const tot = kies(r, [90, 180, 360]), a = r.geheel(2, tot / 5 - 1) * 5, naam = { 90: 'een rechte hoek', 180: 'een gestrekte hoek', 360: 'een volle hoek' }[tot]; return maak(`${naam[0].toUpperCase()}${naam.slice(1)} is ${tot}°. Eén deel daarvan is ${a}°. Hoeveel graden is het andere deel?`, '°', tot - a, nf(tot - a, [a, tot + a], 5), `h${tot}.${a}`, 2, { vrg: 'grootheid', soort, tot, a }); }
  const g = kies(r, GROOTHEDEN), [n0] = twee(r);
  if (soort === 'gelijk') { const [x, y] = duo(r, Math.min(cap, 500)), op = kies(r, ['+', '-']); if (op === '-' && x <= y) return null; const antw = op === '+' ? x + y : x - y; return maak(op === '+' ? `${n0} heeft ${g.wat} met ${x} ${g.klein === 'cent' ? 'euro' : g.groot}. Er komt nog ${y} ${g.klein === 'cent' ? 'euro' : g.groot} bij. Hoeveel ${g.klein === 'cent' ? 'euro' : g.groot} is dat?` : `${n0} heeft ${x} ${g.klein === 'cent' ? 'euro' : g.groot}. ${n0} gebruikt er ${y} ${g.klein === 'cent' ? 'euro' : g.groot}. Hoeveel blijft er over?`, g.klein === 'cent' ? 'euro' : g.groot, antw, nf(antw, [op === '+' ? x - y : x + y], 1), `g${op}${x}.${y}${g.groot}`, 1, { vrg: 'grootheid', soort, op, x, y, eenheid: g.groot }); }
  const a = r.geheel(2, 9), b = r.geheel(Math.max(2, Math.floor(g.f / 10)), g.f - 1), op = kies(r, ['+', '-']), antw = op === '+' ? a * g.f + b : a * g.f - b;
  const tekst = op === '+' ? `${g.wat[0].toUpperCase()}${g.wat.slice(1)} heeft ${a} ${g.groot}. Er komt nog ${b} ${g.klein} bij. Hoeveel ${g.klein} is dat samen?` : `${g.wat[0].toUpperCase()}${g.wat.slice(1)} heeft ${a} ${g.groot}. Er gaat ${b} ${g.klein} af. Hoeveel ${g.klein} blijft er over?`;
  return maak(tekst, g.klein, antw, nf(antw, [a + b, a * g.f, b], g.f / 10), `e${a}.${b}${g.groot}${op}`, 3, { vrg: 'grootheid', soort, op, a, b, f: g.f, groot: g.groot, klein: g.klein });
};

/* ------------------------------------------------------------------ verhoudingen */
const verhoudingOpgave = (r, jaar) => {
  const u = r.geheel(2, jaar >= 4 ? 25 : 12), q1 = r.geheel(2, 9), q2 = r.geheel(3, 15);
  if (q1 === q2) return null;
  const soort = kies(r, ['drie', 'drie', 'gelijkwaardig', 'ontbrekend']), item = kies(r, [['schriften', 'euro'], ['kilo appels', 'euro'], ['zakjes snoep', 'euro']]);
  if (soort === 'ontbrekend') return maak(`${q1} ${item[0]} kosten € ${u * q1}. Hoeveel ${item[0]} kun je kopen voor € ${u * q2}? (Elk kost evenveel.)`, '', q2, nf(q2, [q1, q1 + q2], 1), `vo${u}.${q1}.${q2}`, 3, { vrg: 'verhouding', soort, u, q1, q2 });
  if (soort === 'gelijkwaardig') { const k = r.geheel(2, 6); return maak(`Een recept voor ${q1} personen vraagt ${u} glazen melk. Voor ${q1 * k} personen is dat evenveel per persoon. Hoeveel glazen melk heb je nodig?`, 'glazen', u * k, nf(u * k, [u + k, q1 * k], u), `vg${u}.${q1}.${k}`, 3, { vrg: 'verhouding', soort, u, q1, q2: q1 * k }); }
  return maak(`${q1} ${item[0]} kosten € ${u * q1}. Hoeveel kosten ${q2} ${item[0]}?`, 'euro', u * q2, nf(u * q2, [u * q1 + q2, u * q1, u + q2], u), `v${u}.${q1}.${q2}`, 3, { vrg: 'verhouding', soort, u, q1, q2 });
};
const omgekeerdEvenredigOpgave = (r) => {
  const n1 = kies(r, [2, 3, 4, 6]), t1 = kies(r, [6, 8, 12, 4, 10]), n2 = kies(r, [2, 3, 4, 6, 8, 12].filter(x => x !== n1 && (n1 * t1) % x === 0));
  if (!n2) return null;
  const antw = (n1 * t1) / n2, wat = kies(r, ['arbeiders', 'kinderen', 'machines']);
  return maak(`${n1} ${wat} doen samen een klus in ${t1} uur. Hoeveel uur doen ${n2} ${wat} er samen over? (Ze werken even snel.)`, 'uur', antw, nf(antw, [(t1 * n2) / n1, t1, t1 + n2], 1), `oe${n1}.${t1}.${n2}`, 4, { vrg: 'omgekeerd-evenredig', n1, t1, n2 });
};
export const EVENREDIG_STELLINGEN = [
  { t: 'Een boek kost € 8. Dan kosten 3 boeken € 24. Is de prijs evenredig met het aantal boeken?', a: 'ja' },
  { t: 'Lotte is op 8 jaar 130 cm lang. Is ze op 16 jaar dan twee keer zo lang?', a: 'nee' },
  { t: 'Een auto rijdt 60 km per uur. Is de afstand evenredig met de tijd?', a: 'ja' },
  { t: 'Een kind van 5 jaar weegt 20 kg. Is het kind op 10 jaar dan 40 kg?', a: 'nee' },
  { t: 'Een ruit weegt 4 kg. Wegen 3 ruiten evenveel als 3 × 4 kg?', a: 'ja' },
  { t: 'Een emmer loopt in 5 minuten vol. Met twee kranen is de emmer in 10 minuten vol. Klopt dat?', a: 'nee' },
];
const nietEvenredigOpgave = (r) => { const s = kies(r, EVENREDIG_STELLINGEN); return maak(s.t, '(ja of nee)', s.a, [s.a === 'ja' ? 'nee' : 'ja'], `ne${s.t}`, 3, { vrg: 'niet-evenredig', stelling: s.t }); };

/* ------------------------------------------------------------------ breuk of procent van een hoeveelheid */
const breukVanOpgave = (r, jaar, p) => {
  const types = p.types, soort = kies(r, types.includes('procent-van') ? ['operator', 'geheel', 'deel', 'procent'] : ['operator', 'geheel', 'deel']), [n0] = twee(r), d = kies(r, [2, 3, 4, 5, 6, 8, 10]);
  if (soort === 'procent') { const pct = kies(r, [10, 20, 25, 50, 75, 5, 30, 40]), n = kies(r, [20, 40, 60, 80, 100, 120, 200, 400]); if ((pct * n) % 100) return null; return maak(`In een school zijn ${n} kinderen. ${pct} % van de kinderen komt met de fiets. Hoeveel kinderen komen met de fiets?`, 'kinderen', (pct * n) / 100, nf((pct * n) / 100, [n - (pct * n) / 100, pct], 5), `bp${pct}.${n}`, 3, { vrg: 'procent-van', soort, pct, n }); }
  const a = r.geheel(1, d - 1), n = d * r.geheel(2, 9);
  if (soort === 'operator') return maak(`In de klas zijn ${n} kinderen. ${a}/${d} van de kinderen gaat zwemmen. Hoeveel kinderen gaan zwemmen?`, 'kinderen', (n / d) * a, nf((n / d) * a, [n / d, n - (n / d) * a], 1), `bo${a}.${d}.${n}`, 2, { vrg: 'breuk-van', soort, a, d, n });
  if (soort === 'geheel') return maak(`${a}/${d} van de kinderen in de klas is ${(n / d) * a}. Hoeveel kinderen zijn er in de klas?`, 'kinderen', n, nf(n, [(n / d) * a, n / d], 1), `bg${a}.${d}.${n}`, 3, { vrg: 'breuk-van', soort, a, d, n });
  const deel = (n / d) * a;
  return maak(`In de klas zijn ${n} kinderen. ${deel} kinderen hebben een huisdier. Welk deel van de klas heeft een huisdier?`, 'van de klas', breukTekst(deel, n), [breukTekst(n - deel, n), breukTekst(deel, n + deel), breukTekst(1, d + 1)].filter(f => /^\d+(\/\d+)?$/.test(f)), `bd${deel}.${n}`, 3, { vrg: 'breuk-van', soort, deel, n });
};

/* ------------------------------------------------------------------ deler, veelvoud en rest */
const restOpgave = (r, jaar) => {
  const soort = kies(r, ['dozen', 'rest', 'nodig', 'kgv']), d = r.geheel(3, 12), n = r.geheel(d * 3 + 1, d * (jaar >= 5 ? 80 : 12)), [n0] = twee(r), ding = kies(r, DINGEN), mv = ding[1];
  if (soort === 'kgv') { const a = kies(r, [4, 6, 8, 9, 10, 12, 15, 20]), b = kies(r, [6, 8, 10, 12, 15, 18, 20, 25]); if (a === b) return null; let m = Math.max(a, b); while (m % a || m % b) m++; return maak(`Bus A vertrekt om de ${a} minuten en bus B om de ${b} minuten. Om 8 uur vertrekken ze samen. Na hoeveel minuten vertrekken ze weer samen?`, 'minuten', m, [a * b, Math.max(a, b), a + b, m * 2].filter(x => x !== m), `rk${a}.${b}`, 4, { vrg: 'rest', soort, a, b }); }
  if (n % d === 0) return null;
  const antw = { dozen: Math.floor(n / d), rest: n % d, nodig: Math.ceil(n / d) }[soort];
  const tekst = { dozen: `${n0} heeft ${aantal(n, ding)}. In elke doos passen er ${d}. Hoeveel dozen kan ${n0} helemaal vullen?`, rest: `${n0} heeft ${aantal(n, ding)} en verdeelt ze in groepjes van ${d}. Hoeveel ${mv} blijven er over?`, nodig: `${n0} heeft ${aantal(n, ding)}. In elke doos passen er ${d}. Hoeveel dozen heeft ${n0} nodig om alle ${mv} te bewaren?` }[soort];
  return maak(tekst, soort === 'rest' ? mv : 'dozen', antw, nf(antw, [Math.floor(n / d), Math.ceil(n / d), n % d, d - (n % d)], 1), `rs${soort}${n}.${d}`, 3, { vrg: 'rest', soort, n, d });
};

/* ------------------------------------------------------------------ ongelijke verdeling */
const somVerschilOpgave = (r) => {
  const klein = r.geheel(5, 400), v = r.geheel(2, 150), [n0, n1] = twee(r), S = klein * 2 + v, wie = kies(r, ['klein', 'groot']);
  const eenh = kies(r, ['euro', 'stickers', 'knikkers']);
  return maak(`${n0} en ${n1} hebben samen ${S} ${eenh}. ${n0} heeft er ${v} meer dan ${n1}. Hoeveel ${eenh} heeft ${wie === 'klein' ? n1 : n0}?`, eenh, wie === 'klein' ? klein : klein + v, nf(wie === 'klein' ? klein : klein + v, [(S - v), S / 2, v], 1), `sv${S}.${v}${wie}`, 4, { vrg: 'som-verschil', S, v, wie, eenh });
};
const somVerhoudingOpgave = (r) => {
  const x = r.geheel(1, 4), y = x + r.geheel(1, 4), k = r.geheel(2, 40), S = k * (x + y), wie = kies(r, ['klein', 'groot']), eenh = kies(r, ['euro', 'snoepjes', 'knikkers']);
  const antw = wie === 'klein' ? k * x : k * y;
  return maak(`${S} ${eenh} worden verdeeld in de verhouding ${x} : ${y}. Hoeveel ${eenh} is het ${wie === 'klein' ? 'kleinste' : 'grootste'} deel?`, eenh, antw, nf(antw, [wie === 'klein' ? k * y : k * x, S / 2, k], k), `shv${S}.${x}.${y}${wie}`, 4, { vrg: 'som-verhouding', S, x, y, wie });
};

/* ------------------------------------------------------------------ prijs, bruto/netto, schaal, snelheid */
const prijsOpgave = (r, jaar) => {
  const soort = kies(r, ['winst', 'verlies', 'korting', 'stijging', 'interest']), [n0] = twee(r), pct = kies(r, [5, 10, 20, 25, 50]), basis = r.geheel(2, 40) * 20;
  if (soort === 'winst' || soort === 'verlies') { const a = r.geheel(10, 400), v = r.geheel(2, 150); const koop = soort === 'winst' ? a : a + v, verkoop = soort === 'winst' ? a + v : a; return maak(`${n0} koopt een fiets voor € ${koop} en verkoopt ze voor € ${verkoop}. Hoeveel euro ${soort} maakt ${n0}?`, 'euro', v, nf(v, [koop + verkoop, koop], 5), `p${soort}${koop}.${verkoop}`, 2, { vrg: 'prijs', soort, koop, verkoop }); }
  if (soort === 'korting') { const antw = basis - (basis * pct) / 100; return maak(`Een jas kost € ${basis}. In de solden is er ${pct} % korting. Hoeveel euro kost de jas nu?`, 'euro', antw, nf(antw, [(basis * pct) / 100, basis + (basis * pct) / 100], 5), `pk${basis}.${pct}`, 3, { vrg: 'prijs', soort, basis, pct }); }
  if (soort === 'stijging') { const antw = basis + (basis * pct) / 100; return maak(`Een tablet kost € ${basis}. De prijs stijgt met ${pct} %. Hoeveel euro kost de tablet na de stijging?`, 'euro', antw, nf(antw, [(basis * pct) / 100, basis - (basis * pct) / 100], 5), `ps${basis}.${pct}`, 3, { vrg: 'prijs', soort, basis, pct }); }
  const j = r.geheel(2, 5), kapitaal = r.geheel(1, 20) * 100, rente = kies(r, [1, 2, 3, 4, 5]), antw = (kapitaal * rente * j) / 100;
  return maak(`${n0} zet € ${kapitaal} op een spaarrekening. De intrest is ${rente} % per jaar. Hoeveel euro intrest krijgt ${n0} na ${j} jaar?`, 'euro', antw, nf(antw, [(kapitaal * rente) / 100, kapitaal + antw], 5), `pi${kapitaal}.${rente}.${j}`, 4, { vrg: 'prijs', soort, kapitaal, rente, j });
};
const brutoOpgave = (r) => {
  const soort = kies(r, ['netto', 'bruto', 'tarra', 'procent']), netto = r.geheel(5, 90) * 10, tarra = r.geheel(1, 30) * 10, bruto = netto + tarra;
  if (soort === 'procent') { const pct = kies(r, [5, 10, 20, 25]), b = r.geheel(2, 20) * 100, t = (b * pct) / 100; return maak(`Een doos met koekjes weegt ${b} g (bruto). De verpakking is ${pct} % van het brutogewicht. Hoeveel g is het nettogewicht?`, 'g', b - t, nf(b - t, [t, b + t], 10), `bp${b}.${pct}`, 4, { vrg: 'bruto', soort, bruto: b, pct }); }
  const g = { netto: [`Een pak weegt ${bruto} g bruto. De verpakking weegt ${tarra} g. Hoeveel g is het netto?`, netto], bruto: [`Het netto gewicht van een pak is ${netto} g. De verpakking (tarra) weegt ${tarra} g. Hoeveel g is het bruto?`, bruto], tarra: [`Een pak weegt ${bruto} g bruto en ${netto} g netto. Hoeveel g weegt de verpakking (tarra)?`, tarra] }[soort];
  return maak(g[0], 'g', g[1], nf(g[1], [bruto + tarra, netto + tarra, bruto - tarra, tarra], 10), `bb${soort}${netto}.${tarra}`, 2, { vrg: 'bruto', soort, netto, tarra, bruto });
};
const SCHALEN = [100, 200, 500, 1000, 10000, 50000, 100000];
const schaalOpgave = (r) => {
  const schaal = kies(r, SCHALEN), kaart = r.geheel(2, 12), werk = kaart * schaal, richting = kies(r, ['naar-werkelijk', 'naar-kaart']);
  const [eenheid, f] = werk % 100000 === 0 ? ['km', 100000] : werk % 100 === 0 ? ['m', 100] : ['cm', 1];
  if (richting === 'naar-werkelijk') return maak(`Op een kaart met schaal 1 : ${fmt(schaal)} is een afstand ${kaart} cm. Hoe groot is de afstand in werkelijkheid?`, eenheid, werk / f, nf(werk / f, [kaart * 10, werk, kaart], Math.max(1, f === 1 ? 10 : 1)), `sc${schaal}.${kaart}`, 3, { vrg: 'schaal', richting, schaal, kaart, eenheid }, {});
  return maak(`In werkelijkheid is een afstand ${fmt(werk / f)} ${eenheid}. De kaart heeft schaal 1 : ${fmt(schaal)}. Hoeveel cm is dat op de kaart?`, 'cm', kaart, nf(kaart, [kaart * 10, kaart + 1], 1), `sk${schaal}.${kaart}`, 3, { vrg: 'schaal', richting, schaal, kaart, eenheid });
};
const snelheidOpgave = (r) => {
  const soort = kies(r, ['afstand', 'snelheid', 'tijd']), v = r.geheel(2, 20) * 5, t = r.geheel(2, 8), s = v * t;
  if (soort === 'afstand') return maak(`Een auto rijdt ${v} km per uur gedurende ${t} uur. Hoeveel km legt de auto af?`, 'km', s, nf(s, [v + t, v], 5), `sna${v}.${t}`, 3, { vrg: 'snelheid', soort, v, t, s });
  if (soort === 'snelheid') return maak(`Een fietser legt ${s} km af in ${t} uur. Hoeveel km per uur is de gemiddelde snelheid?`, 'km per uur', v, nf(v, [s - t, t], 5), `sns${s}.${t}`, 3, { vrg: 'snelheid', soort, v, t, s });
  return maak(`Een trein rijdt ${v} km per uur en moet ${s} km afleggen. Hoeveel uur duurt de rit?`, 'uur', t, nf(t, [s - v, v], 1), `snt${s}.${v}`, 3, { vrg: 'snelheid', soort, v, t, s });
};

/* ------------------------------------------------------------------ meetkunde, statistiek, groei, vergelijken, mengsels, dichtheden */
const meetkundeOpgave = (r) => {
  const soort = kies(r, ['rechthoek-breedte', 'vierkant-zijde', 'gelijkbenig-basis', 'hoeksom', 'oppervlakte']);
  if (soort === 'rechthoek-breedte') { const l = r.geheel(5, 40), b = r.geheel(2, l - 1), omtrek = 2 * (l + b); return maak(`Een rechthoek is ${l} cm lang en heeft een omtrek van ${omtrek} cm. Hoe breed is de rechthoek?`, 'cm', b, nf(b, [omtrek - l, omtrek / 2, omtrek - 2 * l], 1), `mr${l}.${b}`, 4, { vrg: 'meetkunde', soort, l, omtrek }); }
  if (soort === 'vierkant-zijde') { const z = r.geheel(2, 60); return maak(`Een vierkant heeft een omtrek van ${4 * z} cm. Hoe lang is één zijde?`, 'cm', z, nf(z, [4 * z / 2, z * z, 4 * z - 4], 1), `mv${z}`, 3, { vrg: 'meetkunde', soort, omtrek: 4 * z }); }
  if (soort === 'gelijkbenig-basis') { const b = r.geheel(2, 25), z = r.geheel(Math.ceil(b / 2) + 1, 40), omtrek = 2 * z + b; return maak(`Een gelijkbenige driehoek heeft twee even lange zijden van ${z} cm en een omtrek van ${omtrek} cm. Hoe lang is de derde zijde?`, 'cm', b, nf(b, [omtrek - z, omtrek / 2, omtrek - 3 * z], 1), `mg${z}.${b}`, 4, { vrg: 'meetkunde', soort, z, omtrek }); }
  if (soort === 'hoeksom') { const a = r.geheel(20, 90), b = r.geheel(20, 150 - a); return maak(`In een driehoek zijn twee hoeken ${a}° en ${b}°. Hoe groot is de derde hoek?`, '°', 180 - a - b, nf(180 - a - b, [a + b, 360 - a - b, 90 - a], 5), `mh${a}.${b}`, 3, { vrg: 'meetkunde', soort, a, b }); }
  const l = r.geheel(3, 25), b = r.geheel(2, l);
  return maak(`Een rechthoekige tuin is ${l} m lang en ${b} m breed. Hoeveel m² is de oppervlakte?`, 'm²', l * b, nf(l * b, [2 * (l + b), l + b], 2), `mo${l}.${b}`, 3, { vrg: 'meetkunde', soort, l, b });
};
const statOpgave = (r, jaar) => {
  const soort = kies(r, ['gemiddelde', 'ontbrekend', 'mediaan']), n = soort === 'mediaan' ? kies(r, [5, 7]) : r.geheel(3, 5);
  if (soort === 'ontbrekend') { const m = r.geheel(5, 30), l = Array.from({ length: n - 1 }, () => Math.max(1, m + r.geheel(-4, 4))), laatste = m * n - som(l); if (laatste < 1) return null; return maak(`Een leerling haalt voor ${n - 1} toetsen ${l.join(', ')} punten. Het gemiddelde van alle ${n} toetsen is ${m}. Hoeveel punten haalde de leerling voor de laatste toets?`, 'punten', laatste, nf(laatste, [m, som(l)], 1), `sto${l.join('.')}${m}`, 4, { vrg: 'stat', soort, lijst: l, m, n }); }
  const l = Array.from({ length: n }, () => r.geheel(2, jaar >= 6 ? 60 : 30));
  if (new Set(l).size < n) return null;
  const s = [...l].sort((a, b) => a - b), med = s[(n - 1) / 2];
  if (soort === 'mediaan') return maak(`Op zeven (of vijf) dagen verkoopt een bakker ${l.join(', ')} broden. Hoeveel broden is de mediaan?`.replace('zeven (of vijf)', n === 7 ? 'zeven' : 'vijf'), 'broden', med, nf(med, [l[(n - 1) / 2], Math.max(...l), Math.min(...l)], 1), `stm${l.join('.')}`, 4, { vrg: 'stat', soort, lijst: l });
  const tot = som(l); const moment = l.map(x => x);
  const m = Math.floor(tot / n); if (m * n !== tot) { l[n - 1] += n - (tot % n); }
  const tot2 = som(l), g = tot2 / n;
  return maak(`In ${n} dagen verkoopt een winkel ${l.join(', ')} ijsjes. Hoeveel ijsjes is dat gemiddeld per dag?`, 'ijsjes', g, nf(g, [tot2, Math.max(...l)], 1), `stg${l.join('.')}`, 3, { vrg: 'stat', soort, lijst: l });
};
const groeiOpgave = (r) => {
  const soort = kies(r, ['procent', 'nieuw', 'oud']), pct = kies(r, [5, 10, 20, 25, 50]), van = r.geheel(2, 50) * 20, nieuw = van + (van * pct) / 100, dir = kies(r, ['toename', 'afname']);
  const sign = dir === 'toename' ? 1 : -1, naar = van + sign * (van * pct) / 100;
  if (soort === 'procent') return maak(`Een club heeft ${van} leden. Een jaar later zijn het er ${naar}. Hoeveel procent is de ${dir}?`, '%', pct, nf(pct, [Math.round((Math.abs(naar - van) / naar) * 100), naar - van, 100 - pct], 5), `gp${van}.${naar}`, 4, { vrg: 'groei', soort, van, naar }, {});
  if (soort === 'nieuw') return maak(`Een dorp heeft ${van} inwoners. Het aantal inwoners ${dir === 'toename' ? 'stijgt' : 'daalt'} met ${pct} %. Hoeveel inwoners heeft het dorp daarna?`, 'inwoners', naar, nf(naar, [(van * pct) / 100, van - sign * (van * pct) / 100], 10), `gn${van}.${pct}${dir}`, 4, { vrg: 'groei', soort, van, pct, dir });
  return maak(`Na een ${dir === 'toename' ? 'stijging' : 'daling'} van ${pct} % telt een dorp ${naar} inwoners. Hoeveel inwoners had het dorp eerst?`, 'inwoners', van, nf(van, [naar, naar - sign * (naar * pct) / 100], 10), `go${naar}.${pct}${dir}`, 5, { vrg: 'groei', soort, naar, pct, dir });
};
const relatiefOpgave = (r) => {
  const n1 = kies(r, [20, 25, 30, 40]), n2 = kies(r, [20, 25, 30, 40, 50]), a1 = r.geheel(2, n1 - 3), a2 = r.geheel(2, n2 - 3);
  if (n1 === n2) return null;
  const k1 = a1 * n2, k2 = a2 * n1, antw = k1 > k2 ? 'klas A' : k1 < k2 ? 'klas B' : 'even groot';
  if (k1 === k2) return null;
  const abs = a1 > a2 ? 'klas A' : a1 < a2 ? 'klas B' : 'even groot';
  return maak(`In klas A hebben ${a1} van de ${n1} kinderen een hond. In klas B hebben ${a2} van de ${n2} kinderen een hond. In welke klas is het deel kinderen met een hond het grootst?`, '', antw, [abs, 'klas A', 'klas B', 'even groot'], `ra${a1}.${n1}.${a2}.${n2}`, 5, { vrg: 'relatief', a1, n1, a2, n2 });
};
const mengselOpgave = (r) => {
  const soort = kies(r, ['prijs', 'drank']);
  if (soort === 'drank') { const x = r.geheel(1, 3), y = x + r.geheel(1, 6), k = r.geheel(2, 20) * 10, tot = k * (x + y); return maak(`Een drankje bestaat uit siroop en water in de verhouding ${x} : ${y}. Je maakt ${tot} ml drankje. Hoeveel ml siroop heb je nodig?`, 'ml', k * x, nf(k * x, [k * y, tot / 2, tot - x], k), `md${x}.${y}.${k}`, 4, { vrg: 'mengsel', soort, x, y, tot }); }
  for (let t = 0; t < 60; t++) {
    const w1 = r.geheel(1, 6), w2 = r.geheel(1, 6), p1 = r.geheel(3, 14), p2 = r.geheel(3, 14);
    if (p1 === p2 || (w1 * p1 + w2 * p2) % (w1 + w2)) continue;
    const antw = (w1 * p1 + w2 * p2) / (w1 + w2);
    return maak(`Je mengt ${w1} kg koffie van € ${p1} per kg met ${w2} kg koffie van € ${p2} per kg. Hoeveel euro kost één kg van het mengsel?`, 'euro', antw, nf(antw, [(p1 + p2) / 2, p1 + p2], 1), `mp${w1}.${p1}.${w2}.${p2}`, 5, { vrg: 'mengsel', soort, w1, p1, w2, p2 });
  }
  return null;
};
const bevolkingOpgave = (r) => {
  const soort = kies(r, ['dichtheid', 'aantal', 'oppervlakte']), opp = r.geheel(2, 60) * 5, dens = r.geheel(2, 60) * 10, n = opp * dens, plaats = kies(r, ['Een gemeente', 'Een eiland', 'Een stad']);
  if (soort === 'dichtheid') return maak(`${plaats} heeft ${fmt(n)} inwoners op een oppervlakte van ${opp} km². Hoeveel inwoners wonen er gemiddeld per km²?`, 'inwoners per km²', dens, nf(dens, [n - opp, Math.round(opp / dens)], 10), `bd${n}.${opp}`, 4, { vrg: 'bevolking', soort, n, opp, dens });
  if (soort === 'aantal') return maak(`${plaats} heeft een oppervlakte van ${opp} km² en een bevolkingsdichtheid van ${dens} inwoners per km². Hoeveel inwoners heeft het?`, 'inwoners', n, nf(n, [dens + opp, dens], opp), `ba${opp}.${dens}`, 4, { vrg: 'bevolking', soort, n, opp, dens });
  return maak(`${plaats} heeft ${fmt(n)} inwoners en een bevolkingsdichtheid van ${dens} inwoners per km². Hoeveel km² is de oppervlakte?`, 'km²', opp, nf(opp, [n - dens, dens], 5), `bo${n}.${dens}`, 4, { vrg: 'bevolking', soort, n, opp, dens });
};
const massadichtheidOpgave = (r) => {
  const soort = kies(r, ['massa', 'volume', 'dichtheid']), stof = kies(r, [['ijzer', 8], ['aluminium', 3], ['koper', 9], ['water', 1], ['hout', 1]]), rho = stof[1], V = r.geheel(2, 60), m = rho * V;
  if (soort === 'massa') return maak(`Eén cm³ ${stof[0]} weegt ${rho} g. Hoeveel g weegt een blok van ${V} cm³?`, 'g', m, nf(m, [V + rho, V], rho), `mm${stof[0]}${V}`, 4, { vrg: 'massadichtheid', soort, rho, V, m });
  if (soort === 'volume') return maak(`Eén cm³ ${stof[0]} weegt ${rho} g. Een blok ${stof[0]} weegt ${m} g. Hoeveel cm³ is het volume?`, 'cm³', V, nf(V, [m - rho, m], 1), `mv${stof[0]}${V}`, 4, { vrg: 'massadichtheid', soort, rho, V, m });
  return maak(`Een blok ${stof[0]} van ${V} cm³ weegt ${m} g. Hoeveel g weegt 1 cm³? (massadichtheid in g/cm³)`, 'g/cm³', rho, nf(rho, [m - V, V], 1), `md${stof[0]}${V}`, 4, { vrg: 'massadichtheid', soort, rho, V, m });
};

/* ------------------------------------------------------------------ puzzels (probleemoplossend denken) */
const puzzelOpgave = (r, jaar) => {
  const soort = kies(r, jaar <= 2 ? ['getal', 'patroon', 'poten'] : ['getal', 'patroon', 'poten', 'handdruk', 'kippen', 'leeftijd']);
  if (soort === 'getal') { const g = r.geheel(2, jaar <= 1 ? 8 : 30), x = r.geheel(1, 5); const dubbel = r.volgende() < 0.5; const res = dubbel ? g * 2 + x : g + x; return maak(dubbel ? `Ik denk aan een getal. Ik neem het dubbel en tel er ${x} bij. Dan krijg ik ${res}. Aan welk getal denk ik?` : `Ik denk aan een getal. Ik tel er ${x} bij. Dan krijg ik ${res}. Aan welk getal denk ik?`, '', g, nf(g, [res - x * 2, res], 1), `pg${g}.${x}${dubbel}`, 3, { vrg: 'puzzel', soort, dubbel, x, res }); }
  if (soort === 'patroon') { const start = r.geheel(1, 20), stap = r.geheel(2, jaar <= 2 ? 5 : 12), reeks = Array.from({ length: 5 }, (_, i) => start + i * stap); return maak(`Wat is het volgende getal in de reeks? ${reeks.join(', ')}, ...`, '', start + 5 * stap, nf(start + 5 * stap, [start + 4 * stap + 1, reeks[4] + (stap + 1)], stap), `pp${start}.${stap}`, 3, { vrg: 'puzzel', soort, reeks, stap }); }
  if (soort === 'poten') { const a = r.geheel(2, 9), b = r.geheel(2, 9); return maak(`Op de boerderij zijn ${a} kippen (2 poten) en ${b} schapen (4 poten). Hoeveel poten zijn dat samen?`, 'poten', a * 2 + b * 4, nf(a * 2 + b * 4, [a + b, (a + b) * 4, (a + b) * 2], 2), `po${a}.${b}`, 3, { vrg: 'puzzel', soort, a, b }); }
  if (soort === 'handdruk') { const n = r.geheel(3, 10); return maak(`${n} kinderen geven elkaar allemaal één keer een hand. Hoeveel handdrukken zijn dat?`, 'handdrukken', (n * (n - 1)) / 2, nf((n * (n - 1)) / 2, [n * (n - 1), n * n, n], 1), `ph${n}`, 5, { vrg: 'puzzel', soort, n }); }
  if (soort === 'kippen') { const kip = r.geheel(2, 12), kon = r.geheel(2, 12); return maak(`Op een erf lopen kippen (2 poten) en konijnen (4 poten). Samen zijn het ${kip + kon} dieren met ${kip * 2 + kon * 4} poten. Hoeveel konijnen zijn er?`, 'konijnen', kon, nf(kon, [kip, kip + kon], 1), `pk${kip}.${kon}`, 5, { vrg: 'puzzel', soort, dieren: kip + kon, poten: kip * 2 + kon * 4 }); }
  const j = r.geheel(2, 12), v = r.geheel(2, 25), [n0, n1] = twee(r);
  return maak(`${n0} is ${j} jaar. ${n1} is ${v} jaar ouder dan ${n0}. Hoe oud is ${n1} over ${j} jaar?`, 'jaar', j + v + j, nf(j + v + j, [j + v, v + j * 2 - j], 1), `pl${j}.${v}`, 4, { vrg: 'puzzel', soort, j, v });
};

const OPGAVEN = {
  enkel: (r, p) => enkelOpgave(r, p.jaar, false), overbodig: (r, p) => enkelOpgave(r, Math.max(p.jaar, 1), true), signaal: (r, p) => signaalOpgave(r, p.jaar), omgekeerd: (r, p) => omgekeerdOpgave(r, p.jaar),
  dec: decOpgave, 'breuk+': breukPlusOpgave, samengesteld: (r, p) => samengesteldOpgave(r, p.jaar), grootheid: (r, p) => grootheidOpgave(r, p.jaar), verhouding: (r, p) => verhoudingOpgave(r, p.jaar),
  'omgekeerd-evenredig': omgekeerdEvenredigOpgave, 'niet-evenredig': nietEvenredigOpgave, 'breuk-van': (r, p) => breukVanOpgave(r, p.jaar, p), 'procent-van': (r, p) => breukVanOpgave(r, p.jaar, { types: ['procent-van'] }), rest: (r, p) => restOpgave(r, p.jaar),
  'som-verschil': somVerschilOpgave, 'som-verhouding': somVerhoudingOpgave, prijs: (r, p) => prijsOpgave(r, p.jaar), bruto: brutoOpgave, schaal: schaalOpgave, snelheid: snelheidOpgave, meetkunde: meetkundeOpgave,
  stat: (r, p) => statOpgave(r, p.jaar), groei: groeiOpgave, relatief: relatiefOpgave, mengsel: mengselOpgave, bevolking: bevolkingOpgave, massadichtheid: massadichtheidOpgave, puzzel: (r, p) => puzzelOpgave(r, p.jaar),
};
const vraagstukOpgave = (r, p) => {
  const type = kies(r, p.types);
  return OPGAVEN[type](r, { ...p, jaar: p.jaar ?? 4, types: p.types });
};
export const VRAAGSTUK_VORMEN = maakOpgaveVormen({
  id: 'vrg', titel: 'Vraagstukken', doelen: AUTO_DOELEN.vrg || [], parameters: K.vraagstukParameters, standaard: { types: ['enkel'], jaar: 3 },
  opdracht, opgave: vraagstukOpgave, schaal: 1.8,
});
export const AUTO_VRAAGSTUKKEN_VORMEN = VRAAGSTUK_VORMEN;
