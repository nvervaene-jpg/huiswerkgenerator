// Breukfamilies voor de laatste doelen: breuken lezen en noteren, schematisch herstructureren, schematisch voorstellen (honderdveld)
// en een rationaal getal als aanduiding voor een hoeveelheid. De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { breukFiguur, FIGUREN, figuurMogelijk } from '../breuk-svg.js';
import { breukSvg, honderdveld } from '../breuk-afwerking-svg.js';
import { ggd } from '../auto-hulp.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });

/* ------------------------------------------------------------------ breuken lezen en noteren */
const TELLER = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf'];
const NOEMER = { 2: 'half', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste', 9: 'negende', 10: 'tiende', 11: 'elfde', 12: 'twaalfde' };
export const breukWoord = (t, n) => `${TELLER[t]} ${NOEMER[n]}`;
const breukKeuze = (r) => { for (let i = 0; i < 40; i++) { const n = r.geheel(2, 11), t = r.geheel(1, n - 1); if (ggd(t, n) === 1 || r.volgende() < 0.3) return [t, n]; } return [1, 4]; };
const notatieOpgave = (r, p) => {
  const [t, n] = breukKeuze(r), soort = kies(r, p.schuin ? ['lees-h', 'lees-s', 'schrijf-s', 'h-naar-s'] : ['lees-h', 'teller', 'noemer']);
  const data = { soort, t, n }, woord = breukWoord(t, n), fout = [breukWoord(t + 1, n), breukWoord(t, n + 1), t > 1 ? breukWoord(t - 1, n) : breukWoord(t, n + 2 <= 11 ? n + 2 : n - 1 || n + 1)];
  if (soort === 'lees-h') return mk('Hoe lees je deze breuk? ____', breukSvg(t, n), woord, [...fout, t < n - 1 ? breukWoord(n > 11 ? t : n, t) : undefined].filter(x => x && !x.includes('undefined')), `ln${t}.${n}h`, 1, { ...data, wat: 'lees-h' });
  if (soort === 'lees-s') return mk(`Hoe lees je ${t}/${n}? ____`, null, woord, fout, `ln${t}.${n}s`, 1, { ...data, wat: 'lees-s' });
  if (soort === 'schrijf-s') return mk(`Schrijf "${woord}" als breuk met een schuine streep: ____`, null, `${t}/${n}`, [`${n}/${t}`, `${t}/${n + 1}`, `${t + 1}/${n}`], `ln${t}.${n}w`, 2, { ...data, wat: 'schrijf-s' });
  if (soort === 'h-naar-s') return mk('Schrijf deze breuk met een schuine streep: ____', breukSvg(t, n), `${t}/${n}`, [`${n}/${t}`, `${t}/${n + 1}`, `${t + 1}/${n}`], `ln${t}.${n}x`, 2, { ...data, wat: 'h-naar-s' });
  if (soort === 'teller') return mk(`Je schrijft "${woord}" met een horizontale breukstreep. Het getal boven de streep is ____.`, null, t, [n, t + 1, t - 1 > 0 ? t - 1 : n + 1], `ln${t}.${n}t`, 1, { ...data, wat: 'teller' });
  return mk(`Je schrijft "${woord}" met een horizontale breukstreep. Het getal onder de streep is ____.`, null, n, [t, n + 1, n - 1], `ln${t}.${n}o`, 1, { ...data, wat: 'noemer' });
};
export const BREUK_NOTATIE_VORMEN = maakOpgaveVormen({
  id: 'bln', titel: 'Breuken lezen en noteren', doelen: AUTO_DOELEN.bln || [], parameters: K.breukNotatieParameters, standaard: { schuin: true, jaar: 4 },
  opdracht: opdracht('Lees of schrijf de breuk.'), opgave: notatieOpgave,
});

/* ------------------------------------------------------------------ schematisch herstructureren */
const herstructureerOpgave = (r) => {
  const soort = kies(r, FIGUREN), verfijn = r.volgende() < 0.5;
  if (verfijn) {
    const n = r.geheel(2, 6), t = r.geheel(1, n - 1), k = kies(r, [2, 3, 4]);
    if (!figuurMogelijk(soort, n) || ggd(t, n) !== 1) return null;
    return mk(`Elk deel van het geheel wordt verdeeld in ${k} gelijke delen. Dan is ${t}/${n} hetzelfde als ____/${k * n}.`, breukFiguur({ soort, n, t }), t * k, [t, t + k, t * k + 1, n * k - t], `bh${soort}${t}.${n}.${k}v`, 2, { soort, wat: 'verfijn', t, n, k });
  }
  const k = kies(r, [2, 3, 4]), m = r.geheel(2, 6), u = r.geheel(1, m - 1), n = k * m, t = k * u;
  if (!figuurMogelijk(soort, n) || n > 24) return null;
  return mk(`Maak groepjes van ${k} gelijke delen. Dan zijn ${t}/${n} hetzelfde als ____/${m}.`, breukFiguur({ soort, n, t }), u, [t, u + 1, u - 1 > 0 ? u - 1 : m, m - u + (u === m - u ? 1 : 0)], `bh${soort}${t}.${n}.${k}g`, 3, { soort, wat: 'groepeer', t, n, k, m, u });
};
export const BREUK_HERSTRUCTUREER_VORMEN = maakOpgaveVormen({
  id: 'bhs', titel: 'Breuken op een schema anders verdelen', doelen: AUTO_DOELEN.bhs || [], parameters: K.breukHerstructureerParameters, standaard: { jaar: 4 },
  opdracht: opdracht('Kijk naar het schema. Vul het getal in.'), opgave: herstructureerOpgave,
});

/* ------------------------------------------------------------------ breuken, procenten en decimale getallen op het honderdveld */
const dec = (t, honderdsten) => (honderdsten ? (t / 100).toFixed(2) : (t / 10).toFixed(1)).replace('.', ',');
const voorstelOpgave = (r) => {
  const soort = kies(r, ['procent', 'decimaal', 'breuk', 'tiende']);
  if (soort === 'tiende') { const a = r.geheel(1, 9); return mk(`Het geheel is verdeeld in 10 gelijke delen. ${a} delen zijn gekleurd. Als kommagetal is dat ____.`, breukFiguur({ soort: 'rechthoek', n: 10, t: a }), dec(a, false), [dec(a * 10, true), dec(a, true), `${a},0${a}`, dec(10 - a, false)], `bv-t${a}`, 1, { soort, a }); }
  let t = r.geheel(2, 98);
  if (t % 10 === 0) t += 1;
  const sv = honderdveld(t);
  if (soort === 'procent') return mk(`Het honderdveld is voor ${t} vakjes gekleurd. Dat is ____ %.`, sv, t, [100 - t, t + 10, Math.round(t / 10) || 1, t * 10], `bv-p${t}`, 1, { soort, t });
  if (soort === 'decimaal') return mk(`Het honderdveld is voor ${t} vakjes gekleurd. Als kommagetal is dat ____.`, sv, dec(t, true), [dec(t, false), dec(100 - t, true), `${t},0`, dec(t * 10, true)], `bv-d${t}`, 2, { soort, t });
  return mk(`Het honderdveld is voor ${t} vakjes gekleurd. Als breuk is dat ____.`, sv, `${t}/100`, [`100/${t}`, `${t}/10`, `${100 - t}/100`, `1/${t}`], `bv-b${t}`, 2, { soort, t });
};
export const BREUK_VOORSTEL_VORMEN = maakOpgaveVormen({
  id: 'bsv', titel: 'Breuken, procenten en kommagetallen op een schema', doelen: AUTO_DOELEN.bsv || [], parameters: K.breukVoorstelParameters, standaard: { jaar: 5 },
  opdracht: opdracht('Kijk naar het schema. Vul het ontbrekende getal in.'), opgave: voorstelOpgave,
});

/* ------------------------------------------------------------------ een rationaal getal als aanduiding voor een hoeveelheid */
const BREUK_DEC = [['1/2', '0,5', '50'], ['1/4', '0,25', '25'], ['3/4', '0,75', '75'], ['1/5', '0,2', '20'], ['2/5', '0,4', '40'], ['3/5', '0,6', '60'], ['4/5', '0,8', '80'], ['1/10', '0,1', '10'], ['3/10', '0,3', '30'], ['7/10', '0,7', '70'], ['9/10', '0,9', '90']];
const VLOEISTOF = ['een fles water', 'een pak melk', 'een kan sap', 'een emmer'];
const hoeveelheidOpgave = (r) => {
  const [b, d, pc] = kies(r, BREUK_DEC), soort = kies(r, ['breuk-dec', 'procent-breuk', 'dec-procent', 'liter']);
  if (soort === 'breuk-dec') return mk(`In ${kies(r, VLOEISTOF)} zit ${b} liter. Als kommagetal is dat ____ liter.`, null, d, BREUK_DEC.filter(x => x[1] !== d).map(x => x[1]), `bh-bd${b}`, 2, { soort, b, d, pc });
  if (soort === 'procent-breuk') return mk(`${pc} % van een pizza is opgegeten. Als breuk is dat ____ van de pizza.`, null, b, BREUK_DEC.filter(x => x[0] !== b).map(x => x[0]), `bh-pb${pc}`, 2, { soort, b, d, pc });
  if (soort === 'dec-procent') return mk(`Lars heeft ${d} van zijn zakgeld uitgegeven. Dat is ____ %.`, null, pc, BREUK_DEC.filter(x => x[2] !== pc).map(x => x[2]), `bh-dp${d}`, 3, { soort, b, d, pc });
  return mk(`Schrijf ${pc} % als kommagetal: ____`, null, d, BREUK_DEC.filter(x => x[1] !== d).map(x => x[1]), `bh-l${pc}`, 2, { soort, b, d, pc });
};
export const BREUK_HOEVEELHEID_VORMEN = maakOpgaveVormen({
  id: 'bha', titel: 'Breuk, procent of kommagetal voor een hoeveelheid', doelen: AUTO_DOELEN.bha || [], parameters: K.breukHoeveelheidParameters, standaard: { jaar: 5 },
  opdracht: opdracht('Schrijf op wat evenveel is.'), opgave: hoeveelheidOpgave,
});

export const AUTO_AFWERKING2_VORMEN = [...BREUK_NOTATIE_VORMEN, ...BREUK_HERSTRUCTUREER_VORMEN, ...BREUK_VOORSTEL_VORMEN, ...BREUK_HOEVEELHEID_VORMEN];
