// Extra oefenvormen voor getalkennis: vergelijken, ordenen, getallenas, splitsen en plaatswaarde.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat, aantalCijfers } from './hulp.js';
import { kies, NBSP } from './stelling-vormen.js';
import { verbinden, tabel, getallenas, splitshuis, cijferBlokjes, mabVerbinden, mabTekenen } from '../svg.js';
import { THEMAS, NAMEN } from '../contexten.js';
import { THEMA_KEUZE } from './maat-vormen.js';
import { vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde } from './getallen.js';

const vorm = ({ id, titel, pictogram = 'schrijven', opdracht, doelen, rang, schaal = 1, keuzes, bouw }) => ({
  id, titel, pictogram, opdracht, rang, schaal, basis: false, doelen,
  ...(keuzes ? { keuzes, opties: (d, k = {}) => ({ thema: k.thema || 'gemengd' }) } : {}),
  genereer({ seed, aantal, gebied, opties }) {
    const rng = maakRng(seed);
    return resultaat(trek(rng, aantal, (r) => bouw(r, { gebied, opties: opties || {} })), aantal);
  },
});
const thema = (r, opties) => (opties.thema && opties.thema !== 'gemengd' && THEMAS[opties.thema] ? THEMAS[opties.thema] : kies(r, Object.values(THEMAS)));
const JUIST_FOUT = () => `${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`;
const teken = (a, b) => (a < b ? '<' : a > b ? '>' : '=');

// Plaatsnamen van rechts naar links, met de woorden voor de opdracht.
const PLAATSEN = ['E', 'T', 'H', 'D', 'TD'];
const PLAATS_WOORD = { E: 'eenheden', T: 'tientallen', H: 'honderdtallen', D: 'duizendtallen', TD: 'tienduizendtallen' };
const plaatsenVan = (n) => PLAATSEN.slice(0, aantalCijfers(n)).reverse();
const cijfersVan = (n) => String(n).split('').map(Number);

// Splitskern: n = a + b binnen het getallengebied (tot 10, tot 20 met tiental, daarboven tientallen en eenheden enz.).
const delenVan = (n) => { const s = String(n), uit = []; for (let i = 0; i < s.length; i++) if (s[i] !== '0') uit.push(Number(s[i]) * 10 ** (s.length - 1 - i)); return uit; };
function splitsKern(r, gebied) {
  if (gebied <= 10 || (gebied <= 20 && r.volgende() < 0.35)) {
    const n = r.geheel(2, Math.min(10, gebied)), a = r.geheel(1, n - 1);
    return { n, a, b: n - a, soort: 'splitsing' };
  }
  const n = r.geheel(11, gebied), d = delenVan(n);
  if (d.length !== 2) return null;
  const [a, b] = r.volgende() < 0.5 ? d : [d[1], d[0]];
  return { n, a, b, soort: 'plaatswaarde' };
}
const fmtSom = (k) => `${k.a} + ${k.b}`;

// Getallenas-instelling: grove stap -> fijne stap, altijd 10 tussenruimtes.
function asInstelling(r, gebied) {
  const stappen = gebied <= 10 ? [1] : gebied <= 20 ? [1, 2] : [gebied / 10, gebied / 20, gebied / 100];
  const si = r.geheel(0, stappen.length - 1), stap = stappen[si];
  return { stap, si, start: r.geheel(0, (gebied - 10 * stap) / stap) * stap };
}

/* ================================================================== vergelijken */
const VERGELIJK_DOELEN = vergelijken.doelen;

export const getallenOmcirkelen = vorm({
  id: 'getallen-omcirkelen', titel: 'Grootste of kleinste getal omcirkelen', pictogram: 'omcirkelen', doelen: VERGELIJK_DOELEN, rang: 3,
  opdracht: 'Omcirkel het getal dat gevraagd wordt.',
  bouw(r, { gebied }) {
    const basis = r.geheel(0, gebied), set = new Set([basis]), breedte = Math.max(2, Math.round(gebied * (r.volgende() < 0.5 ? 0.1 : 1)));
    for (let t = 0; t < 40 && set.size < 3; t++) set.add(Math.min(gebied, Math.max(0, basis + r.geheel(-breedte, breedte))));
    if (set.size < 3) return null;
    const nums = r.schud([...set]), grootste = r.volgende() < 0.5, antw = grootste ? Math.max(...nums) : Math.min(...nums);
    const tekst = `${grootste ? 'Het grootste' : 'Het kleinste'} getal:${NBSP.repeat(3)}${nums.join(NBSP.repeat(7))}`;
    return { tekst, breed: true, antwoord: String(antw), volledig: `${grootste ? 'Het grootste' : 'Het kleinste'} getal is ${antw}`, getallen: nums,
      sleutel: `${[...set].sort((x, y) => x - y).join('/')}${grootste}`, moeilijkheid: [aantalCijfers(Math.max(...nums)), 1], data: { type: 'num-omcirkel', getallen: nums, grootste } };
  },
});

export const getallenVergelijkJuistFout = vorm({
  id: 'getallen-vergelijk-juist-fout', titel: 'Vergelijken: juist of fout', pictogram: 'omcirkelen', doelen: VERGELIJK_DOELEN, rang: 3,
  opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied }) {
    const a = r.geheel(0, gebied), b = r.volgende() < 0.1 ? a : Math.min(gebied, Math.max(0, a + r.geheel(-Math.max(2, Math.round(gebied * 0.15)), Math.max(2, Math.round(gebied * 0.15)))));
    const juist = r.volgende() < 0.5, goed = teken(a, b), t = juist ? goed : kies(r, ['<', '>', '='].filter(x => x !== goed));
    return { tekst: `${a}  ${t}  ${b}${JUIST_FOUT()}`, antwoord: juist ? 'juist' : 'fout', volledig: `${a} ${t} ${b}: ${juist ? 'juist' : `fout (juist is ${a} ${goed} ${b})`}`,
      getallen: [a, b], sleutel: `${a}${t}${b}`, moeilijkheid: [aantalCijfers(Math.max(a, b)), juist ? 0 : 1], data: { type: 'num-vergelijk-jf', a, b, teken: t, juist } };
  },
});

export const getallenVergelijkMeerkeuze = vorm({
  id: 'getallen-vergelijk-meerkeuze', titel: 'Vergelijken: meerkeuze', pictogram: 'omcirkelen', doelen: VERGELIJK_DOELEN, rang: 3,
  opdracht: 'Welk teken hoort er? Omcirkel de letter.',
  bouw(r, { gebied }) {
    const a = r.geheel(0, gebied), b = r.volgende() < 0.1 ? a : r.geheel(0, gebied);
    const goed = teken(a, b), letters = { '<': 'a', '>': 'b', '=': 'c' };
    return { tekst: `${a}  ____  ${b}${NBSP.repeat(4)}a)${NBSP}<${NBSP.repeat(4)}b)${NBSP}>${NBSP.repeat(4)}c)${NBSP}=`, antwoord: `${letters[goed]}) ${goed}`, volledig: `${a} ${goed} ${b}`,
      getallen: [a, b], sleutel: [a, b].join('/'), moeilijkheid: [aantalCijfers(Math.max(a, b)), 1], data: { type: 'num-vergelijk-mk', a, b } };
  },
});

export const getallenVergelijkVraagstuk = vorm({
  id: 'getallen-vergelijk-vraagstuk', titel: 'Vraagstukje: meer of minder', doelen: VERGELIJK_DOELEN, rang: 8, schaal: 0.67, keuzes: [THEMA_KEUZE],
  opdracht: 'Lees goed en los op. Schrijf het antwoord op de lijn.',
  bouw(r, { gebied, opties }) {
    const a = r.geheel(2, gebied), b = r.geheel(2, gebied);
    if (a === b) return null;
    const t = thema(r, opties), dingen = kies(r, t.dingen), n1 = kies(r, NAMEN), n2 = kies(r, NAMEN.filter(n => n !== n1)), meer = r.volgende() < 0.5;
    const antw = (a > b) === meer ? n1 : n2;
    const zin = `${n1} heeft ${a} ${dingen}. ${n2} heeft ${b} ${dingen}. Wie heeft er ${meer ? 'meer' : 'minder'}?`;
    return { tekst: `${zin}  ____`, breed: true, antwoord: antw, volledig: `${zin} ${antw}`, getallen: [a, b], sleutel: `${n1}${a}${n2}${b}${meer}`,
      moeilijkheid: [aantalCijfers(Math.max(a, b)), 1], data: { type: 'num-vraag', a, b, naam1: n1, naam2: n2, meer, antwoord: antw } };
  },
});

/* ================================================================== ordenen */
export const getallenBuren = vorm({
  id: 'getallen-buren', titel: 'Voorganger en opvolger', doelen: ordenen.doelen, rang: 2,
  opdracht: 'Schrijf het getal dat gevraagd wordt op de lijn.',
  bouw(r, { gebied }) {
    const stappen = [1, ...(gebied >= 100 ? [10] : []), ...(gebied >= 1000 ? [100] : [])], stap = kies(r, stappen);
    if (gebied < 2 * stap) return null;
    const n = r.geheel(stap, gebied - stap);
    const tekst = stap === 1 ? `Het getal vóór ${n} is ____. Het getal na ${n} is ____.` : `${stap} minder dan ${n} is ____. ${stap} meer dan ${n} is ____.`;
    return { tekst, breed: true, antwoord: `${n - stap} en ${n + stap}`, volledig: tekst.replace('____', String(n - stap)).replace('____', String(n + stap)), getallen: [n, n - stap, n + stap],
      sleutel: `${n}/${stap}`, moeilijkheid: [Math.log10(stap), aantalCijfers(n)], data: { type: 'num-buren', n, stap } };
  },
});

export const getallenRijFout = vorm({
  id: 'getallen-rij-fout', titel: 'Fout in de rij zoeken', pictogram: 'omcirkelen', doelen: ordenen.doelen, rang: 7, schaal: 0.67,
  opdracht: 'Eén getal in de rij klopt niet. Omcirkel het en schrijf het juiste getal op.',
  bouw(r, { gebied }) {
    const { stap, start } = asInstelling(r, Math.max(gebied, 10)), stijgend = r.volgende() < 0.6;
    const juist = Array.from({ length: 6 }, (_, i) => (stijgend ? start + i * stap : start + 5 * stap - i * stap));
    if (juist.some(x => x < 0 || x > gebied)) return null;
    const plaats = r.geheel(1, 4), fout = juist[plaats] + kies(r, [-1, 1, -2, 2, stap, -stap].filter(d => d !== 0 && Math.abs(d) < stap * 2 || stap === 1));
    if (fout < 0 || fout > gebied || juist.includes(fout)) return null;
    const rij = juist.map((x, i) => (i === plaats ? fout : x));
    return { tekst: `${rij.join('   ')}${NBSP.repeat(3)}→${NBSP.repeat(3)}____`, breed: true, antwoord: String(juist[plaats]), volledig: `${rij.join(' ')}: ${fout} moet ${juist[plaats]} zijn`,
      getallen: [...rij], sleutel: rij.join(','), moeilijkheid: [Math.log10(stap) + 0.5, 1], data: { type: 'num-rij-fout', rij, juist, plaats } };
  },
});

/* ================================================================== getallenas */
const AS_DOELEN = getallenasInvullen.doelen;
const asGetallen = (start, stap) => Array.from({ length: 11 }, (_, i) => start + i * stap);

export const getallenasPijl = vorm({
  id: 'getallenas-pijl', titel: 'Wijst de pijl welk getal aan?', doelen: AS_DOELEN, rang: 3, schaal: 0.67,
  opdracht: 'Welk getal wijst de pijl aan? Schrijf het in het vakje.',
  bouw(r, { gebied }) {
    const { start, stap, si } = asInstelling(r, gebied), idx = r.geheel(1, 9), getallen = asGetallen(start, stap);
    return { tekst: '', svg: getallenas({ start, stap, pijlen: [idx], ontbreekt: [idx] }), antwoordSvg: getallenas({ start, stap, pijlen: [idx] }), breed: true,
      antwoord: String(getallen[idx]), volledig: `De pijl wijst ${getallen[idx]} aan.`, getallen, sleutel: `${start}/${stap}/${idx}`, moeilijkheid: [si, idx],
      data: { type: 'as-pijl', start, stap, idx } };
  },
});

export const getallenasPijlTekenen = vorm({
  id: 'getallenas-pijl-tekenen', titel: 'Een pijl tekenen op de getallenas', pictogram: 'tekenen', doelen: AS_DOELEN, rang: 5, schaal: 0.5,
  opdracht: 'Teken een pijl bij het getal.',
  bouw(r, { gebied }) {
    const { start, stap, si } = asInstelling(r, gebied), idx = r.geheel(1, 9), getallen = asGetallen(start, stap), tekst = `Teken een pijl bij ${getallen[idx]}.`;
    return { tekst, svg: getallenas({ start, stap }), antwoordSvg: getallenas({ start, stap, pijlen: [idx] }), breed: true, antwoord: String(getallen[idx]), volledig: tekst,
      getallen, sleutel: `${start}/${stap}/${idx}`, moeilijkheid: [si, idx], data: { type: 'as-pijl-teken', start, stap, idx } };
  },
});

export const getallenasLetters = vorm({
  id: 'getallenas-letters', titel: 'Welk getal hoort bij de letter?', doelen: AS_DOELEN, rang: 4, schaal: 0.67,
  opdracht: 'Welk getal hoort bij de letter? Schrijf het op de lijn.',
  bouw(r, { gebied }) {
    const { start, stap, si } = asInstelling(r, gebied), plaatsen = r.schud([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort((x, y) => x - y), getallen = asGetallen(start, stap);
    const letters = Object.fromEntries(plaatsen.map((p, i) => ['ABC'[i], p]).map(([l, p]) => [p, l]));
    const tekst = plaatsen.map((p, i) => `${'ABC'[i]} = ____`).join(NBSP.repeat(8));
    return { tekst, svg: getallenas({ start, stap, letters }), breed: true, antwoord: plaatsen.map((p, i) => `${'ABC'[i]} = ${getallen[p]}`).join(', '),
      volledig: plaatsen.map((p, i) => `${'ABC'[i]} = ${getallen[p]}`).join(', '), getallen, sleutel: `${start}/${stap}/${plaatsen.join()}`, moeilijkheid: [si, 3],
      data: { type: 'as-letters', start, stap, plaatsen } };
  },
});

export const getallenasJuistFout = vorm({
  id: 'getallenas-juist-fout', titel: 'Getallenas: juist of fout', pictogram: 'omcirkelen', doelen: AS_DOELEN, rang: 3,
  opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied }) {
    const { start, stap, si } = asInstelling(r, gebied), idx = r.geheel(1, 9), getallen = asGetallen(start, stap), juist = r.volgende() < 0.5;
    const genoemd = juist ? getallen[idx] : getallen[idx + kies(r, [-2, -1, 1, 2].filter(d => idx + d >= 0 && idx + d <= 10))];
    return { tekst: `De pijl wijst ${genoemd} aan.${JUIST_FOUT()}`, svg: getallenas({ start, stap, pijlen: [idx] }), breed: true, antwoord: juist ? 'juist' : 'fout',
      volledig: `De pijl wijst ${getallen[idx]} aan: ${juist ? 'juist' : `fout (juist is ${getallen[idx]})`}`, getallen: [...getallen, genoemd],
      sleutel: `${start}/${stap}/${idx}/${genoemd}`, moeilijkheid: [si, juist ? 0 : 1], data: { type: 'as-jf', start, stap, idx, genoemd, juist } };
  },
});

/* ================================================================== splitsen */
const SPLITS_DOELEN = splitsen.doelen;

export const getallenSplitshuis = vorm({
  id: 'getallen-splitshuis', titel: 'Splitshuisje', doelen: SPLITS_DOELEN, rang: 2,
  opdracht: 'Vul het splitshuisje aan. Schrijf het ontbrekende getal in het vakje.',
  bouw(r, { gebied }) {
    const k = splitsKern(r, gebied);
    if (!k) return null;
    const blank = r.volgende() < 0.5 ? 'a' : 'b';
    return { tekst: '', svg: splitshuis(k.n, blank === 'a' ? null : k.a, blank === 'b' ? null : k.b), antwoordSvg: splitshuis(k.n, k.a, k.b), antwoord: String(k[blank]), volledig: `${k.n} = ${k.a} + ${k.b}`,
      getallen: [k.n, k.a, k.b], sleutel: `${k.n}/${k.a}/${blank}`, kern: `splits:${k.n}:${Math.min(k.a, k.b)}`, familie: `splits:${k.n}:${Math.min(k.a, k.b)}`, moeilijkheid: [aantalCijfers(k.n), k.n],
      data: { type: 'num-splits', n: k.n, a: k.a, b: k.b, blank } };
  },
});

export const getallenSplitsTabel = vorm({
  id: 'getallen-splits-tabel', titel: 'Tabel met splitsingen aanvullen', doelen: SPLITS_DOELEN, rang: 4, schaal: 0.34,
  opdracht: 'Vul de tabel aan.',
  bouw(r, { gebied }) {
    if (gebied <= 20) {                                                       // splitsingen van één getal
      const n = r.geheel(Math.min(5, gebied), Math.min(gebied, gebied <= 10 ? 10 : 20)), delen = [...Array(n - 1).keys()].map(i => i + 1);
      if (delen.length < 4) return null;
      const a = r.schud(delen).slice(0, 4).sort((x, y) => x - y), rijen = a.map(x => [x, n - x]), blank = rijen.map(() => r.geheel(0, 1));
      const kop = ['eerste getal', 'tweede getal'], leeg = rijen.map((rij, i) => rij.map((v, c) => (c === blank[i] ? null : v)));
      return { tekst: `Splits ${n}.`, svg: tabel(kop, leeg), antwoordSvg: tabel(kop, leeg, rijen), breed: true, antwoord: rijen.map(rij => `${rij[0]} + ${rij[1]}`).join('; '),
        volledig: `Splits ${n}: ${rijen.map(rij => `${rij[0]} + ${rij[1]}`).join('; ')}`, getallen: [n, ...rijen.flat()], sleutel: `s${n}:${a.join()}:${blank.join('')}`,
        moeilijkheid: [aantalCijfers(n), n], data: { type: 'num-splits-tabel', soort: 'som', n, rijen, blank } };
    }
    const digits = Math.min(aantalCijfers(gebied), gebied === 10000 ? 4 : aantalCijfers(gebied) - (gebied === 100 || gebied === 1000 ? 1 : 0));
    const plaatsen = PLAATSEN.slice(0, Math.max(2, digits)).reverse(), kop = ['getal', ...plaatsen];
    const getallen = new Set();
    for (let t = 0; t < 40 && getallen.size < 4; t++) { const n = r.geheel(10 ** (plaatsen.length - 1), Math.min(gebied, 10 ** plaatsen.length - 1)); getallen.add(n); }
    if (getallen.size < 4) return null;
    const rijen = [...getallen].sort((x, y) => x - y).map(n => [n, ...String(n).padStart(plaatsen.length, '0').split('').map((c, i) => Number(c) * 10 ** (plaatsen.length - 1 - i))]);
    const blank = rijen.map(rij => r.geheel(0, rij.length - 1)), leeg = rijen.map((rij, i) => rij.map((v, c) => (c === blank[i] ? null : v)));
    return { tekst: 'Splits elk getal in zijn plaatswaarden.', svg: tabel(kop, leeg), antwoordSvg: tabel(kop, leeg, rijen), breed: true,
      antwoord: rijen.map(rij => `${rij[0]} = ${rij.slice(1).filter(Boolean).join(' + ')}`).join('; '), volledig: `Tabel: ${rijen.map(rij => `${rij[0]} = ${rij.slice(1).filter(Boolean).join(' + ')}`).join('; ')}`,
      getallen: rijen.flat(), sleutel: `p${rijen.map(rij => rij[0]).join()}:${blank.join('')}`, moeilijkheid: [plaatsen.length, Math.max(...rijen.map(x => x[0]))],
      data: { type: 'num-splits-tabel', soort: 'plaats', kop, rijen, blank } };
  },
});

export const getallenSplitsVerbinden = vorm({
  id: 'getallen-splits-verbinden', titel: 'Getal en splitsing verbinden', pictogram: 'verbinden', doelen: SPLITS_DOELEN, rang: 5, schaal: 0.34,
  opdracht: 'Verbind het getal met de juiste splitsing. Trek een lijn.',
  bouw(r, { gebied }) {
    const ks = [], ns = new Set(), labels = new Set();
    for (let t = 0; t < 60 && ks.length < 4; t++) {
      const k = splitsKern(r, gebied);
      if (!k || ns.has(k.n) || labels.has(fmtSom(k)) || labels.has(String(k.n))) continue;
      ns.add(k.n); labels.add(fmtSom(k)); labels.add(String(k.n)); ks.push(k);
    }
    if (ks.length < 4) return null;
    const orde = r.schud([0, 1, 2, 3]), koppels = ks.map((_, i) => [i, orde.indexOf(i)]);
    if (koppels.every(([a, b]) => a === b)) return null;
    const links = ks.map(k => String(k.n)), rechts = orde.map(i => fmtSom(ks[i]));
    return { tekst: '', svg: verbinden(links, rechts, koppels), antwoordSvg: verbinden(links, rechts, koppels, true), breed: true, antwoord: ks.map(k => `${k.n} = ${fmtSom(k)}`).join('; '),
      volledig: `Verbonden: ${ks.map(k => `${k.n} = ${fmtSom(k)}`).join('; ')}`, getallen: ks.flatMap(k => [k.n, k.a, k.b]), sleutel: [...ns].sort((x, y) => x - y).join('/'),
      kernen: ks.map(k => `splits:${k.n}:${Math.min(k.a, k.b)}`), moeilijkheid: [Math.max(...ks.map(k => aantalCijfers(k.n)))],
      data: { type: 'num-splits-verbind', paren: ks.map(({ n, a, b }) => ({ n, a, b })) } };
  },
});

export const getallenSplitsJuistFout = vorm({
  id: 'getallen-splits-juist-fout', titel: 'Splitsen: juist of fout', pictogram: 'omcirkelen', doelen: SPLITS_DOELEN, rang: 3,
  opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied }) {
    const k = splitsKern(r, gebied);
    if (!k) return null;
    const juist = r.volgende() < 0.5, b = juist ? k.b : k.b + kies(r, [-1, 1, -2, 2, ...(k.n > 20 ? [-10, 10] : [])]);
    if (b < 0 || b > gebied) return null;
    const tekst = `${k.n} = ${k.a} + ${b}`;
    return { tekst: `${tekst}${JUIST_FOUT()}`, antwoord: juist ? 'juist' : 'fout', volledig: `${tekst}: ${juist ? 'juist' : `fout (juist is ${k.n} = ${k.a} + ${k.b})`}`, getallen: [k.n, k.a, b],
      sleutel: tekst, kern: `splits:${k.n}:${Math.min(k.a, k.b)}`, familie: `splits:${k.n}:${Math.min(k.a, k.b)}`, moeilijkheid: [aantalCijfers(k.n), juist ? 0 : 1],
      data: { type: 'num-splits-jf', n: k.n, a: k.a, b, juist } };
  },
});

export const getallenSplitsVraagstuk = vorm({
  id: 'getallen-splits-vraagstuk', titel: 'Vraagstukje: splitsen', doelen: SPLITS_DOELEN, rang: 8, schaal: 0.67, keuzes: [THEMA_KEUZE],
  opdracht: 'Lees goed en los op. Schrijf het antwoord op de lijn.',
  bouw(r, { gebied, opties }) {
    const k = splitsKern(r, gebied);
    if (!k || k.a < 2) return null;
    const dingen = kies(r, thema(r, opties).dingen), naam = kies(r, NAMEN);
    const zin = `${naam} heeft ${k.n} ${dingen}. ${k.a} ${dingen} zijn rood, de rest is blauw. Hoeveel ${dingen} zijn blauw?`;
    return { tekst: `${zin}  ____`, breed: true, antwoord: String(k.b), volledig: `${zin} ${k.b}`, getallen: [k.n, k.a, k.b], sleutel: `${naam}${k.n}${k.a}${dingen}`,
      kern: `splits:${k.n}:${Math.min(k.a, k.b)}`, familie: `splits:${k.n}:${Math.min(k.a, k.b)}`, moeilijkheid: [aantalCijfers(k.n), 1], data: { type: 'num-splits-vraag', n: k.n, a: k.a, b: k.b } };
  },
});

/* ================================================================== plaatswaarde */
const PW_DOELEN = plaatswaarde.doelen;
const pwGetal = (r, gebied, min = 10) => (gebied < 20 ? null : r.geheel(min, gebied));

export const plaatswaardeKleuren = vorm({
  id: 'plaatswaarde-kleuren', titel: 'Cijfer kleuren', pictogram: 'kleuren', doelen: PW_DOELEN, rang: 4, schaal: 0.67,
  opdracht: 'Kleur het cijfer dat gevraagd wordt.',
  bouw(r, { gebied }) {
    const n = pwGetal(r, gebied);
    if (n === null) return null;
    const namen = plaatsenVan(n), idx = r.geheel(0, namen.length - 1), tekst = `Kleur het cijfer van de ${PLAATS_WOORD[namen[idx]]} (${namen[idx]}).`;
    return { tekst, svg: cijferBlokjes(n), antwoordSvg: cijferBlokjes(n, idx), breed: true, antwoord: `het cijfer ${cijfersVan(n)[idx]}`, volledig: `${tekst} Het cijfer ${cijfersVan(n)[idx]} in ${n}.`,
      getallen: [n], sleutel: `${n}/${idx}`, moeilijkheid: [namen.length, idx], data: { type: 'pw-kleur', n, idx } };
  },
});

export const plaatswaardeVerbinden = vorm({
  id: 'plaatswaarde-verbinden', titel: 'MAB-materiaal en getal verbinden', pictogram: 'verbinden', doelen: PW_DOELEN, rang: 5, schaal: 0.34,
  opdracht: 'Verbind het MAB-materiaal met het juiste getal. Trek een lijn.',
  bouw(r, { gebied }) {
    const max = Math.min(gebied, 999);
    if (max < 20) return null;
    const getallen = new Set();
    for (let t = 0; t < 40 && getallen.size < 4; t++) getallen.add(r.geheel(10, max));
    if (getallen.size < 4) return null;
    const items = [...getallen].map(n => ({ h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, e: n % 10 })), nums = [...getallen];
    const orde = r.schud([0, 1, 2, 3]), koppels = nums.map((_, i) => [i, orde.indexOf(i)]);
    if (koppels.every(([a, b]) => a === b)) return null;
    const rechts = orde.map(i => nums[i]);
    return { tekst: '', svg: mabVerbinden(items, rechts, koppels), antwoordSvg: mabVerbinden(items, rechts, koppels, true), breed: true, antwoord: nums.join(', '),
      volledig: `Verbonden: ${items.map((m, i) => `${m.h} H ${m.t} T ${m.e} E = ${nums[i]}`).join('; ')}`, getallen: nums, sleutel: [...nums].sort((x, y) => x - y).join('/'),
      moeilijkheid: [aantalCijfers(Math.max(...nums))], data: { type: 'pw-verbind', paren: items.map((m, i) => ({ ...m, n: nums[i] })) } };
  },
});

export const plaatswaardeTabel = vorm({
  id: 'plaatswaarde-tabel', titel: 'Plaatswaardetabel aanvullen', doelen: PW_DOELEN, rang: 4, schaal: 0.34,
  opdracht: 'Vul de tabel aan. Schrijf in elke rij het getal of de cijfers.',
  bouw(r, { gebied }) {
    if (gebied < 20) return null;
    const dc = r.geheel(2, Math.min(5, aantalCijfers(gebied))), plaatsen = PLAATSEN.slice(0, dc).reverse(), kop = ['getal', ...plaatsen];
    const set = new Set();
    for (let t = 0; t < 40 && set.size < 3; t++) { const n = r.geheel(10 ** (dc - 1), Math.min(gebied, 10 ** dc - 1)); if (n >= 10 ** (dc - 1)) set.add(n); }
    if (set.size < 3) return null;
    const getallen = [...set].sort((x, y) => x - y), rijen = getallen.map(n => [n, ...cijfersVan(n)]), modus = getallen.map(() => r.geheel(0, 1));
    const leeg = rijen.map((rij, i) => rij.map((v, c) => (modus[i] === 0 ? (c === 0 ? v : null) : (c === 0 ? null : v))));
    return { tekst: '', svg: tabel(kop, leeg), antwoordSvg: tabel(kop, leeg, rijen), breed: true, antwoord: rijen.map(rij => `${rij[0]} = ${rij.slice(1).join(' ')}`).join('; '),
      volledig: `Tabel: ${rijen.map(rij => `${rij[0]}: ${rij.slice(1).map((c, i) => `${c} ${plaatsen[i]}`).join(' ')}`).join('; ')}`, getallen: rijen.flat(), sleutel: `${dc}:${getallen.join()}:${modus.join('')}`,
      moeilijkheid: [dc, 1], data: { type: 'pw-tabel', kop, rijen, modus } };
  },
});

export const plaatswaardeMeerkeuze = vorm({
  id: 'plaatswaarde-meerkeuze', titel: 'Plaatswaarde: meerkeuze', pictogram: 'omcirkelen', doelen: PW_DOELEN, rang: 3,
  opdracht: 'Wat is de waarde van het cijfer? Omcirkel de letter.',
  bouw(r, { gebied }) {
    const n = pwGetal(r, gebied, 11);
    if (n === null) return null;
    const c = cijfersVan(n), idx = r.geheel(0, c.length - 1), d = c[idx];
    if (d === 0 || c.filter(x => x === d).length > 1) return null;                 // het cijfer moet maar één keer voorkomen
    const k = c.length - 1 - idx, juist = d * 10 ** k, fout = [d * 10 ** (k + 1), d * 10 ** (k + 2), d * 10 ** Math.max(0, k - 1), d].filter(x => x !== juist && x >= 1 && x <= gebied);
    const unieke = [...new Set(fout)];
    if (unieke.length < 2) return null;
    const opties = [juist, ...r.schud(unieke).slice(0, 2)].sort((x, y) => x - y), letter = 'abc'[opties.indexOf(juist)];
    const vraag = `Welke waarde heeft het cijfer ${d} in ${n}?`;
    return { tekst: `${vraag}${NBSP.repeat(4)}${opties.map((o, i) => `${'abc'[i]})${NBSP}${o}`).join(NBSP.repeat(5))}`, breed: true, antwoord: `${letter}) ${juist}`, volledig: `${vraag} Antwoord: ${letter}) ${juist}`,
      getallen: [n, d, ...opties], sleutel: `${n}/${idx}`, moeilijkheid: [c.length, k], data: { type: 'pw-mk', n, idx, d, opties, juist: opties.indexOf(juist) } };
  },
});

export const plaatswaardeMabTekenen = vorm({
  id: 'plaatswaarde-mab-tekenen', titel: 'Getal tekenen met MAB-materiaal', pictogram: 'tekenen', doelen: PW_DOELEN, rang: 6, schaal: 0.5,
  opdracht: 'Teken het getal met MAB-materiaal.',
  bouw(r, { gebied }) {
    const max = Math.min(gebied, 999);
    if (max < 20) return null;
    const n = r.geheel(10, max), { leeg, oplossing } = mabTekenen(n), tekst = `Teken ${n} met MAB-materiaal.`;
    return { tekst, svg: leeg, antwoordSvg: oplossing, breed: true, antwoord: `${Math.floor(n / 100)} platen, ${Math.floor(n / 10) % 10} staven, ${n % 10} blokjes`,
      volledig: `${tekst} ${Math.floor(n / 100)} H, ${Math.floor(n / 10) % 10} T, ${n % 10} E`, getallen: [n], sleutel: `${n}`, moeilijkheid: [aantalCijfers(n), n], data: { type: 'pw-mab-teken', n } };
  },
});

export const GETALLEN_VORMEN = [
  getallenOmcirkelen, getallenVergelijkJuistFout, getallenVergelijkMeerkeuze, getallenVergelijkVraagstuk,
  getallenBuren, getallenRijFout,
  getallenasPijl, getallenasPijlTekenen, getallenasLetters, getallenasJuistFout,
  getallenSplitshuis, getallenSplitsTabel, getallenSplitsVerbinden, getallenSplitsJuistFout, getallenSplitsVraagstuk,
  plaatswaardeKleuren, plaatswaardeVerbinden, plaatswaardeTabel, plaatswaardeMeerkeuze, plaatswaardeMabTekenen,
];
