// Statistiek en kans: diagrammen aflezen, cirkeldiagram en hoek/breuk/procent, gemiddelde en mediaan, kansen.
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { ggd } from '../auto-hulp.js';
import { staafdiagram, beelddiagram, lijngrafiek, cirkeldiagram, turftabel } from '../svg-data.js';
import { tabel } from '../svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const NBSP = ' ';
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const som = (l) => l.reduce((a, b) => a + b, 0);

/* ------------------------------------------------------------------ diagrammen aflezen */
export const THEMAS = [
  { titel: 'Lievelingsfruit', cats: ['appel', 'banaan', 'peer', 'druif', 'kiwi', 'meloen'], lees: c => `Hoeveel kinderen kiezen ${c}?`, verschil: (a, b) => `Hoeveel kinderen meer kiezen ${a} dan ${b}?`, meest: 'De meeste kinderen kiezen ____.', minst: 'De minste kinderen kiezen ____.', totaal: 'Hoeveel kinderen zijn er samen?', procentLees: c => `Hoeveel procent van de kinderen kiest ${c}?` },
  { titel: 'Huisdieren in de klas', cats: ['hond', 'kat', 'vis', 'konijn', 'hamster', 'vogel'], lees: c => `Hoeveel kinderen hebben een ${c}?`, verschil: (a, b) => `Hoeveel kinderen meer hebben een ${a} dan een ${b}?`, meest: 'Het meest voorkomende huisdier is de ____.', minst: 'Het minst voorkomende huisdier is de ____.', totaal: 'Hoeveel huisdieren zijn er samen?', procentLees: c => `Hoeveel procent van de kinderen heeft een ${c}?` },
  { titel: 'Sporten op school', cats: ['voetbal', 'zwemmen', 'turnen', 'tennis', 'judo', 'dansen'], lees: c => `Hoeveel kinderen beoefenen ${c}?`, verschil: (a, b) => `Hoeveel kinderen meer beoefenen ${a} dan ${b}?`, meest: 'De populairste sport is ____.', minst: 'De minst populaire sport is ____.', totaal: 'Hoeveel kinderen sporten er samen?', procentLees: c => `Hoeveel procent van de kinderen beoefent ${c}?` },
  { titel: 'Ontbijt', cats: ['brood', 'muesli', 'yoghurt', 'wafel', 'fruit', 'ei'], lees: c => `Hoeveel kinderen eten ${c}?`, verschil: (a, b) => `Hoeveel kinderen meer eten ${a} dan ${b}?`, meest: 'De meeste kinderen eten ____.', minst: 'De minste kinderen eten ____.', totaal: 'Hoeveel kinderen eten er samen?', procentLees: c => `Hoeveel procent van de kinderen eet ${c}?` },
];
export const LIJNTHEMAS = [
  { titel: 'Bezoekers van het zwembad', ytitel: 'aantal', xs: ['ma', 'di', 'wo', 'do', 'vr', 'za'], lees: x => `Hoeveel bezoekers zijn er op ${x}?`, verschil: (a, b) => `Hoeveel bezoekers meer zijn er op ${a} dan op ${b}?`, hoogst: 'De meeste bezoekers zijn er op ____.', laagst: 'De minste bezoekers zijn er op ____.' },
  { titel: 'Temperatuur in de klas (°C)', ytitel: '°C', xs: ['8u', '9u', '10u', '11u', '12u', '13u'], lees: x => `Hoeveel graden is het om ${x}?`, verschil: (a, b) => `Hoeveel graden warmer is het om ${a} dan om ${b}?`, hoogst: 'Het is het warmst om ____.', laagst: 'Het is het koudst om ____.' },
  { titel: 'Boeken in de bib', ytitel: 'aantal', xs: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun'], lees: x => `Hoeveel boeken zijn er uitgeleend in ${x}?`, verschil: (a, b) => `Hoeveel boeken meer zijn er uitgeleend in ${a} dan in ${b}?`, hoogst: 'De meeste boeken worden uitgeleend in ____.', laagst: 'De minste boeken worden uitgeleend in ____.' },
];
const DIAGRAM_SOORTEN = (jaar) => (jaar <= 2 ? ['lees', 'lees', 'meest', 'minst'] : ['lees', 'lees', 'meest', 'minst', 'verschil', 'totaal']);
// Verschillende waarden, allemaal een veelvoud van 'stap' tussen stap en mult*stap.
const waardenSet = (r, n, stap, mult) => r.schud(Array.from({ length: mult }, (_, i) => (i + 1) * stap)).slice(0, n);
const diagramOpgave = (r, p) => {
  const type = kies(r, p.types), jaar = p.jaar || 4;
  if (type === 'lijn') return lijnOpgave(r, jaar);
  const thema = kies(r, THEMAS), n = type === 'tabel' || type === 'turven' ? r.geheel(4, 5) : r.geheel(4, 5), cats = r.schud(thema.cats).slice(0, n);
  let waarden, extra = {}, svg;
  if (type === 'cirkel') {
    // sectoren van veelvouden van 5 % die samen 100 % zijn
    waarden = Array(n).fill(5);
    for (let eenheden = 20 - n; eenheden > 0; eenheden--) waarden[r.geheel(0, n - 1)] += 5;
  } else if (type === 'beeld') { const k = jaar <= 2 ? kies(r, [1, 2]) : kies(r, [2, 5, 10]); waarden = waardenSet(r, n, k, 8); extra = { k }; }
  else if (type === 'turven') waarden = waardenSet(r, n, 1, 17).map(x => x + 2);
  else if (type === 'staaf') { const stap = jaar <= 2 ? kies(r, [1, 2]) : kies(r, [1, 2, 5, 10]); waarden = waardenSet(r, n, stap, 10); extra = { stap, max: stap * 10 }; }
  else { const stap = kies(r, [1, 5, 10]); waarden = waardenSet(r, n, stap, 12).map(x => x + (stap === 1 ? 4 : 0)); }
  if (new Set(waarden).size < n) return null;
  if (type === 'cirkel') svg = cirkeldiagram({ titel: thema.titel, cats, procenten: waarden });
  else if (type === 'beeld') svg = beelddiagram({ titel: thema.titel, cats, waarden, k: extra.k });
  else if (type === 'turven') svg = turftabel({ titel: thema.titel, cats, waarden });
  else if (type === 'staaf') svg = staafdiagram({ titel: thema.titel, cats, waarden, stap: extra.stap, max: extra.max });
  else svg = tabel(cats, [waarden]);
  const soorten = type === 'cirkel' ? ['lees', 'meest', 'minst', 'verschil', 'aantal'].filter(s => jaar > 2 || s !== 'verschil' && s !== 'aantal') : DIAGRAM_SOORTEN(jaar);
  const soort = kies(r, soorten), a = r.geheel(0, n - 1);
  let b = r.geheel(0, n - 1); while (b === a) b = r.geheel(0, n - 1);
  const maxI = waarden.indexOf(Math.max(...waarden)), minI = waarden.indexOf(Math.min(...waarden)), data = { dgm: type, cats, waarden, soort, a, b, ...extra };
  const eenheid = type === 'cirkel' ? ' %' : '';
  const nrFouten = (antw) => uniek([antw + 1, antw - 1, antw + (extra.stap || extra.k || 5), antw - (extra.stap || extra.k || 5), waarden[(a + 1) % n]].filter(x => x >= 0), antw);
  let vraag, antwoord, fouten;
  switch (soort) {
    case 'lees': antwoord = waarden[a]; vraag = type === 'cirkel' ? `${thema.procentLees(cats[a])} ____ %` : `${thema.lees(cats[a])} ____`; fouten = nrFouten(antwoord); break;
    case 'meest': antwoord = cats[maxI]; vraag = thema.meest; fouten = cats.filter((_, i) => i !== maxI); break;
    case 'minst': antwoord = cats[minI]; vraag = thema.minst; fouten = cats.filter((_, i) => i !== minI); break;
    case 'verschil': antwoord = waarden[a] - waarden[b]; if (antwoord <= 0) return null; vraag = `${thema.verschil(cats[a], cats[b])} ____${eenheid}`; fouten = uniek([waarden[a] + waarden[b], antwoord + 1, antwoord - 1, waarden[a]], antwoord); break;
    case 'totaal': antwoord = som(waarden); vraag = `${thema.totaal} ____`; fouten = uniek([antwoord + (extra.stap || 1), antwoord - (extra.stap || 1), antwoord + 10, antwoord - 5, Math.max(...waarden)], antwoord); break;
    default: { const totaal = kies(r, [20, 40, 60, 80, 100, 200]); data.totaal = totaal; antwoord = (waarden[a] * totaal) / 100; vraag = `Er zijn ${totaal} kinderen ondervraagd. ${thema.lees(cats[a])} ____`; fouten = uniek([waarden[a], antwoord + 1, antwoord - 1, waarden[a] * 2, totaal - antwoord], antwoord); }
  }
  return { vraag, antwoord, fouten, svg, kern: `${type}${soort}${waarden.join('.')}${cats[a]}${cats[b]}`, moeilijkheid: [DIAGRAM_SOORTEN(5).indexOf(soort) + 1 || 3], data };
};
const lijnOpgave = (r, jaar) => {
  const thema = kies(r, LIJNTHEMAS), xs = thema.xs, n = xs.length, temp = thema.titel.startsWith('Temperatuur');
  const stap = temp ? kies(r, [1, 2]) : kies(r, [1, 5, 10]), mult = temp ? 12 : 10, waarden = waardenSet(r, n, stap, mult).map(x => x + (temp ? 6 : 0)), max = stap * (mult + (temp ? 6 / stap : 0));
  const soort = kies(r, jaar <= 3 ? ['lees', 'lees', 'hoogst', 'laagst'] : ['lees', 'lees', 'hoogst', 'laagst', 'verschil']);
  const a = r.geheel(0, n - 1); let b = r.geheel(0, n - 1); while (b === a) b = r.geheel(0, n - 1);
  const maxI = waarden.indexOf(Math.max(...waarden)), minI = waarden.indexOf(Math.min(...waarden));
  const svg = lijngrafiek({ titel: thema.titel, xs, waarden, stap, max, ytitel: thema.ytitel }), data = { dgm: 'lijn', cats: xs, waarden, soort, a, b, stap, max };
  let vraag, antwoord, fouten;
  if (soort === 'lees') { antwoord = waarden[a]; vraag = `${thema.lees(xs[a])} ____`; fouten = uniek([antwoord + stap, antwoord - stap, waarden[(a + 1) % n], antwoord + 1], antwoord); }
  else if (soort === 'hoogst') { antwoord = xs[maxI]; vraag = thema.hoogst; fouten = xs.filter((_, i) => i !== maxI); }
  else if (soort === 'laagst') { antwoord = xs[minI]; vraag = thema.laagst; fouten = xs.filter((_, i) => i !== minI); }
  else { antwoord = waarden[a] - waarden[b]; if (antwoord <= 0) return null; vraag = `${thema.verschil(xs[a], xs[b])} ____`; fouten = uniek([waarden[a] + waarden[b], antwoord + stap, antwoord - stap, waarden[a]], antwoord); }
  if (soort === 'lees' && waarden.some(w => w > max)) return null;
  return { vraag, antwoord, fouten, svg, kern: `lijn${soort}${waarden.join('.')}${xs[a]}${xs[b]}`, moeilijkheid: [soort === 'verschil' ? 3 : 2], data };
};
export const DIAGRAM_VORMEN = maakOpgaveVormen({
  id: 'dgm', titel: 'Diagrammen aflezen', doelen: AUTO_DOELEN.dgm || [], parameters: K.diagramParameters, standaard: { types: ['tabel', 'staaf'], jaar: 4 },
  opdracht: opdracht('Lees het diagram of de tabel. Schrijf het antwoord op de lijn.', 'Lees het diagram of de tabel. Kies het juiste antwoord. Omcirkel.'), opgave: diagramOpgave, schaal: 1.6,
});

/* ------------------------------------------------------------------ cirkeldiagram, hoek, breuk en procent */
const PROCENTEN = [5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
const breukVan = (p) => { const g = ggd(p, 100); return `${p / g}/${100 / g}`; };
const cvbOpgave = (r, p) => {
  const pr = kies(r, PROCENTEN), hoek = pr * 3.6, breuk = breukVan(pr), soort = kies(r, ['proc-hoek', 'hoek-proc', 'breuk-hoek', 'hoek-breuk', 'proc-breuk', 'breuk-proc']);
  const svg = cirkeldiagram({ titel: 'Cirkeldiagram', cats: ['gekleurd', 'wit'], procenten: [pr, 100 - pr], toonProcent: false, markeer: 0, kleuren: ['#f8cbad', '#ffffff'] });
  const hoekFouten = [pr, 360 - hoek, hoek / 2, hoek * 2, hoek + 36, hoek - 36].filter(x => x > 0 && x <= 360 && Number.isInteger(x));
  const procFouten = [hoek, 100 - pr, pr + 10, pr - 5, pr * 2].filter(x => x > 0 && x < 100);
  const breukFouten = [breukVan(100 - pr), '1/3', '2/3', '1/5', '1/10', '1/2', `${pr}/10`].filter(x => !x.startsWith('0') && /^\d+\/\d+$/.test(x) && +x.split('/')[0] < +x.split('/')[1]);
  const zinnen = {
    'proc-hoek': [`De gekleurde sector is ${pr} % van de cirkel. De hoek van die sector is ____°.`, hoek, hoekFouten],
    'hoek-proc': [`De gekleurde sector heeft een hoek van ${hoek}°. Dat is ____ % van de cirkel.`, pr, procFouten],
    'breuk-hoek': [`De gekleurde sector is ${breuk} van de cirkel. De hoek van die sector is ____°.`, hoek, hoekFouten],
    'hoek-breuk': [`De gekleurde sector heeft een hoek van ${hoek}°. Dat is ____ van de cirkel.`, breuk, breukFouten],
    'proc-breuk': [`De gekleurde sector is ${pr} % van de cirkel. Als breuk is dat ____ van de cirkel.`, breuk, breukFouten],
    'breuk-proc': [`De gekleurde sector is ${breuk} van de cirkel. Dat is ____ % van de cirkel.`, pr, procFouten],
  };
  const [vraag, antwoord, fouten] = zinnen[soort];
  return { vraag, antwoord, fouten: uniek(fouten, antwoord), svg, kern: `${soort}${pr}`, moeilijkheid: [soort.startsWith('proc') || soort.startsWith('breuk') ? 1 : 2], data: { cvb: soort, p: pr, hoek, breuk } };
};
export const CIRKELVERBAND_VORMEN = maakOpgaveVormen({
  id: 'cvb', titel: 'Cirkeldiagram, hoek, breuk en procent', doelen: AUTO_DOELEN.cvb || [], parameters: K.cirkelVerbandParameters, standaard: { jaar: 6 },
  opdracht: opdracht('Bekijk de cirkel. Schrijf het antwoord op de lijn.', 'Bekijk de cirkel. Kies het juiste antwoord. Omcirkel.'), opgave: cvbOpgave, schaal: 1.6,
});

/* ------------------------------------------------------------------ gemiddelde, mediaan en eerlijk verdelen */
const lijstTekst = (l) => `${l.slice(0, -1).join(', ')} en ${l[l.length - 1]}`;
export const mediaanVan = (l) => { const s = [...l].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const gemOpgave = (r, p) => {
  const soort = kies(r, p.types), jaar = p.jaar || 5, groot = jaar >= 5 ? 40 : 15;
  if (soort === 'verdeling') {
    const n = r.geheel(2, jaar >= 4 ? 9 : 6), elk = r.geheel(2, jaar >= 4 ? 15 : 8), totaal = n * elk, wat = kies(r, ['snoepjes', 'knikkers', 'stickers', 'euro']);
    return { vraag: `${n} kinderen verdelen ${totaal} ${wat} eerlijk. Ieder krijgt ____.`, antwoord: elk, fouten: [elk + 1, elk - 1, totaal - n, n], kern: `v${n}${totaal}`, moeilijkheid: [1], data: { gem: 'verdeling', n, totaal, antwoord: elk } };
  }
  if (soort === 'gemiddelde') {
    const n = r.geheel(3, jaar >= 5 ? 6 : 4), m = r.geheel(3, groot);
    let l; for (let t = 0; t < 40; t++) { l = Array.from({ length: n - 1 }, () => Math.max(1, m + r.geheel(-m + 1, Math.min(m, 10)))); const laatste = m * n - som(l); l.push(laatste); if (laatste >= 1 && laatste <= 2 * groot && new Set(l).size > 1) break; l = null; }
    if (!l) return null; l = r.schud(l);
    return { vraag: `Het gemiddelde van ${lijstTekst(l)} is ____.`, antwoord: m, fouten: [m + 1, m - 1, som(l), Math.max(...l), mediaanVan(l)], kern: `g${l.join('.')}`, moeilijkheid: [n], data: { gem: 'gemiddelde', lijst: l, antwoord: m } };
  }
  if (soort === 'mediaan') {
    const n = jaar >= 6 ? kies(r, [5, 6, 7]) : kies(r, [5, 7]);
    const l = Array.from({ length: n }, () => r.geheel(1, groot * 2)), med = mediaanVan(l);
    if (!Number.isInteger(med) || new Set(l).size < n) return null;
    return { vraag: `De mediaan van ${lijstTekst(l)} is ____.`, antwoord: med, fouten: [l[n >> 1], Math.round(som(l) / n), Math.max(...l), Math.min(...l), med + 1], kern: `m${l.join('.')}`, moeilijkheid: [n % 2 ? 2 : 3], data: { gem: 'mediaan', lijst: l, antwoord: med } };
  }
  // verschil: gemiddelde en mediaan vallen niet samen
  for (let t = 0; t < 80; t++) {
    const n = 5, l = Array.from({ length: n }, () => r.geheel(1, 30)), s = som(l), med = mediaanVan(l);
    if (s % n || !Number.isInteger(med) || s / n === med || new Set(l).size < n) continue;
    const v = Math.abs(s / n - med);
    return { vraag: `Het verschil tussen het gemiddelde en de mediaan van ${lijstTekst(l)} is ____.`, antwoord: v, fouten: [v + 1, v + 2, s / n, med, 0], kern: `x${l.join('.')}`, moeilijkheid: [4], data: { gem: 'verschil', lijst: l, antwoord: v } };
  }
  return null;
};
export const GEMIDDELDE_VORMEN = maakOpgaveVormen({
  id: 'gem', titel: 'Gemiddelde en mediaan', doelen: AUTO_DOELEN.gem || [], parameters: K.gemiddeldeParameters, standaard: { types: ['gemiddelde', 'mediaan'], jaar: 5 },
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.', 'Reken uit. Kies het juiste antwoord. Omcirkel.'), opgave: gemOpgave,
});

/* ------------------------------------------------------------------ kans */
const KLEUR_ZAK = [['rode', 'rood'], ['blauwe', 'blauw'], ['gele', 'geel'], ['groene', 'groen']];
export const KANS_STELLINGEN = [
  { t: 'Je gooit met een gewone dobbelsteen. De kans op een 7 is ____ %.', a: 0 },
  { t: 'Je gooit met een gewone dobbelsteen. De kans op een getal kleiner dan 7 is ____ %.', a: 100 },
  { t: 'In een zak zitten enkel rode knikkers. De kans dat je een blauwe knikker trekt, is ____ %.', a: 0 },
  { t: 'In een zak zitten enkel rode knikkers. De kans dat je een rode knikker trekt, is ____ %.', a: 100 },
  { t: 'Je gooit een muntstuk op. De kans dat het kop of munt wordt, is ____ %.', a: 100 },
  { t: 'Je gooit een muntstuk op. De kans dat het tegelijk kop en munt wordt, is ____ %.', a: 0 },
  { t: 'Je trekt een kaart uit een gewoon spel van 52 kaarten. De kans op een kaart met nummer 99 is ____ %.', a: 0 },
];
const kansOpgave = (r, p) => {
  const soort = kies(r, p.types), jaar = p.jaar || 5;
  if (soort === 'nooit-altijd') { const s = kies(r, KANS_STELLINGEN); return { vraag: s.t, antwoord: s.a, fouten: [50, 10, 1, s.a === 0 ? 100 : 0], kern: `n${s.t}`, moeilijkheid: [1], data: { kns: soort, antwoord: s.a } }; }
  if (soort === 'experiment') {
    const n = kies(r, [10, 20, 25, 50, 100, 200]), x = r.geheel(1, n - 1), pr = (x * 100) / n;
    if (!Number.isInteger(pr) || pr < 5) return null;
    const [mv, kl] = kies(r, KLEUR_ZAK);
    return { vraag: `Je trekt ${n} keer een knikker uit een zak en legt hem telkens terug. ${x} keer is de knikker ${kl}. De kans op een ${mv} knikker is ongeveer ____ %.`, antwoord: pr, fouten: [x, 100 - pr, pr + 10, pr - 5, n - x], kern: `e${n}${x}`, moeilijkheid: [3], data: { kns: soort, n, x, antwoord: pr } };
  }
  const delen = r.schud(KLEUR_ZAK).slice(0, r.geheel(2, 3)), totale = soort === 'procent' ? kies(r, [4, 5, 10, 20]) : r.geheel(jaar >= 5 ? 6 : 4, jaar >= 5 ? 16 : 10);
  const tellers = delen.map(() => 1); let rest = totale - tellers.length; while (rest > 0) { tellers[r.geheel(0, tellers.length - 1)]++; rest--; }
  const ri = 0, rr = tellers[ri];
  if (soort === 'procent' && (rr * 100) % totale) return null;
  const zak = delen.map(([m], i) => `${tellers[i]} ${m}`), zakTekst = `${zak.slice(0, -1).join(', ')} en ${zak[zak.length - 1]} knikkers`;
  const basis = { kns: soort, tellers, gevraagd: ri, T: totale };
  if (soort === 'procent') {
    const pr = (rr * 100) / totale;
    return { vraag: `In een zak zitten ${zakTekst}. Je trekt blind één knikker. De kans op een ${delen[ri][0]} knikker is ____ %.`, antwoord: pr, fouten: [100 - pr, rr, pr + 10, pr - 5, pr * 2].filter(x => x > 0 && x < 100), kern: `p${tellers.join('.')}`, moeilijkheid: [3], data: { ...basis, antwoord: pr } };
  }
  const g = ggd(rr, totale), antwoord = `${rr / g}/${totale / g}`, enkel = (a, b) => { const q = ggd(a, b); return `${a / q}/${b / q}`; };
  return { vraag: `In een zak zitten ${zakTekst}. Je trekt blind één knikker. De kans op een ${delen[ri][0]} knikker is ____ (breuk, zo eenvoudig mogelijk).`.replace(NBSP, ' '), antwoord, fouten: [enkel(totale - rr, totale), enkel(rr, totale - rr), `1/${totale}`, `${rr}/${totale + 1}`], kern: `b${tellers.join('.')}`, moeilijkheid: [2], data: { ...basis, antwoord } };
};
export const KANS_VORMEN = maakOpgaveVormen({
  id: 'kns', titel: 'Kans', doelen: AUTO_DOELEN.kns || [], parameters: K.kansParameters, standaard: { types: ['breuk', 'procent'], jaar: 5 },
  opdracht: opdracht('Bereken de kans. Schrijf het antwoord op de lijn.', 'Bereken de kans. Kies het juiste antwoord. Omcirkel.'), opgave: kansOpgave,
});

export const AUTO_STATISTIEK_VORMEN = [...DIAGRAM_VORMEN, ...CIRKELVERBAND_VORMEN, ...GEMIDDELDE_VORMEN, ...KANS_VORMEN];
