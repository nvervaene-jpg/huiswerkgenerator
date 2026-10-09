// Extra oefenvormen voor rekenen: optellen, aftrekken, maaltafels en vermenigvuldigen/delen met grotere getallen.
// Alle vormen werken op dezelfde rekenkern { op, a, b, c } (a op b = c) als de basisvorm 'invullen' in bewerkingen.js.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { stellingVormen, kies, NBSP } from './stelling-vormen.js';
import { tabel, sprongen, rooster, getallenrooster } from '../svg.js';
import { THEMAS, NAMEN } from '../contexten.js';
import { THEMA_KEUZE } from './maat-vormen.js';
import {
  somKern, tafelKern, maalDeelKern, heeftBrugOptellen, heeftBrugAftrekken, BRUG_KEUZE, brugOpties,
  OPTELLEN_AFTREKKEN_DOELEN, TAFEL_DOELEN, MAAL_DEEL_DOELEN, BEWERKING_KEUZE, maaltafels, vermenigvuldigenDelen, leesTafels,
} from './bewerkingen.js';

const uit = (op, a, b) => ({ '+': a + b, '-': a - b, '×': a * b, ':': a / b }[op]);

// Typische foute antwoorden bij een rekenkern.
function rekenFouten(k) {
  const { op, a, b, c } = k;
  if (op === '×') return () => [c + b, c - b, c + a, c - a, c + 10, c - 10];
  if (op === ':') return () => [c + 1, c - 1, c + 2, c - 2, c + 10, c - 10];
  return () => [c + 10, c - 10, c + 1, c - 1];
}
const schaalMoeilijk = (k) => Math.log10(1 + k.c) + (k.brug ? 1 : 0) + (k.op === '-' || k.op === ':' ? 0.5 : 0);
const stellingKern = (k) => ({
  data: { soort: 'rekenen', op: k.op, a: k.a, b: k.b }, links: `${k.a} ${k.op} ${k.b}`, eenheid: '', w: k.c, getallen: [k.a, k.b],
  kern: k.kern, moeilijkheid: schaalMoeilijk(k), vraag: `${k.a} ${k.op} ${k.b} = ?`, fouten: rekenFouten(k),
});

/* ------------------------------------------------------------------ vormen die bij elke rekenfamilie horen */
function familieVormen({ prefix, doelen, keuzes, opties, kern, tabelKiezen, vraagstuk }) {
  const sample = (r, ctx) => { const k = kern(r, ctx); return k && stellingKern(k); };
  const groepen = keuzes;
  const stelling = stellingVormen({ prefix, doelen, opties, keuzes: groepen, sample }).map(v => ({ ...v, keuzes: groepen }));

  const tabelV = {
    id: `${prefix}-tabel`, titel: 'Tabel aanvullen', pictogram: 'schrijven', rang: 4, schaal: 0.34, basis: false, doelen, keuzes: groepen, opties,
    opdracht: 'Vul de tabel aan. Reken in elke rij met hetzelfde getal.',
    genereer({ seed, aantal, gebied, opties: o }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => {
        const t = tabelKiezen(r, { gebied, opties: o || {} });                  // { op, vast, paren: [[x, y], ...] }
        if (!t) return null;
        const gegeven = t.paren.map(() => r.geheel(0, 1));
        const leeg = t.paren.map(([x, y], i) => (gegeven[i] === 0 ? [x, null] : [null, y]));
        const kop = ['getal', `getal ${t.op} ${t.vast}`];
        return {
          tekst: '', svg: tabel(kop, leeg), antwoordSvg: tabel(kop, leeg, t.paren), breed: true,
          antwoord: t.paren.map(([x, y]) => `${x} ${t.op} ${t.vast} = ${y}`).join('; '), volledig: `Tabel: ${t.paren.map(([x, y]) => `${x} ${t.op} ${t.vast} = ${y}`).join('; ')}`,
          getallen: [t.vast, ...t.paren.flat()], sleutel: `${t.op}${t.vast}:${t.paren.map(p => p[0]).join(',')}:${gegeven.join('')}`,
          moeilijkheid: [Math.log10(1 + Math.max(...t.paren.flat())), t.paren.length],
          data: { type: 'rek-tabel', op: t.op, vast: t.vast, paren: t.paren, gegeven },
        };
      }), aantal);
    },
  };

  const vraag = {
    id: `${prefix}-vraagstuk`, titel: 'Vraagstukje', pictogram: 'schrijven', rang: 8, schaal: 0.67, basis: false, doelen,
    keuzes: [...groepen, THEMA_KEUZE], opties,
    opdracht: 'Lees goed en los op. Schrijf het antwoord op de lijn.',
    genereer({ seed, aantal, gebied, opties: o }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => {
        const k = kern(r, { gebied, opties: o || {} });
        if (!k) return null;
        const thema = o && o.thema && o.thema !== 'gemengd' ? THEMAS[o.thema] : kies(r, Object.values(THEMAS));
        const zin = vraagstuk(r, k, thema);
        if (!zin) return null;
        return {
          tekst: `${zin}  ____`, breed: true, antwoord: String(k.c), volledig: `${zin} ${k.c}`, getallen: [k.a, k.b, k.c],
          sleutel: `v${zin}`, familie: k.kern, kern: k.kern, moeilijkheid: [schaalMoeilijk(k), 1],
          data: { type: 'rek-vraag', op: k.op, a: k.a, b: k.b, c: k.c },
        };
      }), aantal);
    },
  };
  return [...stelling.slice(0, 3), tabelV, stelling[3], vraag];
}

// Verhaaltje bij een rekenkern; null als de getallen niet in een zin passen (bv. "1 knikkers").
const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
function verhaal(r, k, thema) {
  const dingen = kies(r, thema.dingen), bakken = kies(r, thema.bakken), naam = kies(r, NAMEN), naam2 = kies(r, NAMEN.filter(n => n !== naam));
  const { op, a, b, c } = k;
  if (op === '+') {
    if (a < 2) return null;
    return kies(r, [
      `${naam} heeft ${a} ${dingen}. ${naam} krijgt er ${b} bij. Hoeveel ${dingen} heeft ${naam} nu?`,
      `${naam} heeft ${a} ${dingen} en ${naam2} heeft er ${b}. Hoeveel ${dingen} hebben ze samen?`,
    ]);
  }
  if (op === '-') {
    if (a < 2) return null;
    return kies(r, [
      `${naam} heeft ${a} ${dingen}. ${naam} geeft er ${b} weg. Hoeveel ${dingen} heeft ${naam} nog?`,
      `Er liggen ${a} ${dingen} in een doos. ${naam} neemt er ${b} uit. Hoeveel ${dingen} liggen er nog in de doos?`,
    ]);
  }
  if (op === '×') {
    if (a < 2 || b < 2) return null;
    return kies(r, [
      `Er zijn ${a} ${bakken} met elk ${b} ${dingen}. Hoeveel ${dingen} zijn dat samen?`,
      `${a} kinderen krijgen elk ${b} ${dingen}. Hoeveel ${dingen} zijn dat samen?`,
    ]);
  }
  if (b < 2) return null;
  return kies(r, [
    `${a} ${dingen} worden eerlijk verdeeld onder ${b} kinderen. Hoeveel ${dingen} krijgt elk kind?`,
    `${naam} verdeelt ${a} ${dingen} gelijk over ${b} ${bakken}. Hoeveel ${dingen} komen er in elk van de ${bakken}?`,
  ]);
}

/* ------------------------------------------------------------------ optellen en aftrekken */
const brugKeuzes = (groep) => [{ ...BRUG_KEUZE, groep }];

// Een som met brug en een kleine tweede term: de stappen "tot het tiental, dan de rest" zijn dan duidelijk.
function brugStappen(op, r, gebied) {
  if (gebied < 20) return null;
  const b = r.geheel(2, 9), a = r.geheel(11, Math.min(gebied, 99));
  if (op === '+') {
    if (a + b > gebied || a % 10 + b <= 10) return null;
    const b1 = 10 - (a % 10), b2 = b - b1;
    return { op, a, b, c: a + b, b1, b2, midden: a + b1, kern: `rek:+:${Math.min(a, b)}:${Math.max(a, b)}` };
  }
  if (a - b < 1 || a % 10 < 1 || a % 10 >= b) return null;
  const b1 = a % 10, b2 = b - b1;
  return { op, a, b, c: a - b, b1, b2, midden: a - b1, kern: `rek:-:${a}:${b}` };
}

function optellenAftrekkenExtra(soort) {
  const op = soort === 'optellen' ? '+' : '-', teken = op;
  const basis = (id, titel, opdracht, rang, schaal, pictogram, bouw) => ({
    id: `${soort}-${id}`, titel, pictogram, opdracht, rang, schaal, basis: false, doelen: OPTELLEN_AFTREKKEN_DOELEN.concat(soort === 'aftrekken' ? ['2.2.GL1.23'] : []),
    keuzes: brugKeuzes(soort), opties: brugOpties,
    genereer({ seed, aantal, gebied, opties }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => bouw(r, { gebied, opties: opties || {} })), aantal);
    },
  });
  const splits = basis('splits', 'Splits en reken', 'Reken in twee stappen: eerst tot het tiental. Vul de lijnen in.', 5, 1, 'schrijven', (r, { gebied }) => {
    const k = brugStappen(op, r, gebied);
    if (!k) return null;
    const tekst = `${k.a} ${teken} ${k.b} = ${k.a} ${teken} ${k.b1} ${teken} ${k.b2} = ____ ${teken} ${k.b2} = ____`;
    return { tekst, antwoord: `${k.midden} en ${k.c}`, volledig: `${k.a} ${teken} ${k.b} = ${k.a} ${teken} ${k.b1} ${teken} ${k.b2} = ${k.midden} ${teken} ${k.b2} = ${k.c}`,
      getallen: [k.a, k.b, k.b1, k.b2, k.midden, k.c], sleutel: `s${k.a}${teken}${k.b}`, familie: k.kern, kern: k.kern, breed: true, moeilijkheid: [Math.log10(1 + k.c), k.b],
      data: { type: 'rek-splits', op, a: k.a, b: k.b, b1: k.b1, b2: k.b2 } };
  });
  const sprong = basis('sprongen', 'Sprongen op de getallenlijn', 'Maak sprongen op de getallenlijn. Vul de lege vakjes in.', 5, 0.67, 'schrijven', (r, { gebied }) => {
    const k = brugStappen(op, r, gebied);
    if (!k) return null;
    const punten = [k.a, k.midden, k.c];
    return { tekst: `${k.a} ${teken} ${k.b} = ____`, svg: sprongen({ punten, leeg: [1, 2] }), antwoordSvg: sprongen({ punten }), breed: true,
      antwoord: `${k.midden} en ${k.c}`, volledig: `${k.a} ${teken} ${k.b} = ${k.c} (${k.a} → ${k.midden} → ${k.c})`, getallen: [k.a, k.b, k.midden, k.c],
      sleutel: `j${k.a}${teken}${k.b}`, familie: k.kern, kern: k.kern, moeilijkheid: [Math.log10(1 + k.c), k.b], data: { type: 'rek-sprongen', op, a: k.a, b: k.b, punten } };
  });
  const brugKiezen = basis('brug', 'Met of zonder brug', 'Omcirkel de sommen met brug. Je gaat over het tiental.', 3, 0.5, 'omcirkelen', (r, { gebied }) => {
    if (gebied < 20) return null;
    const items = [];
    for (const keuze of ['met', 'met', 'met', 'zonder', 'zonder', 'zonder']) {
      for (let t = 0; t < 40; t++) {
        const k = somKern(soort, r, gebied, keuze);
        if (k && !items.some(x => x.a === k.a && x.b === k.b)) { items.push({ a: k.a, b: k.b, brug: k.brug, c: k.c, kern: k.kern }); break; }
      }
    }
    if (items.length < 6) return null;
    const door = r.schud(items), met = door.filter(i => i.brug);
    const regel = (i) => `${i.a} ${teken} ${i.b}`;
    return { tekst: door.map(regel).join(NBSP.repeat(7)), breed: true, antwoord: met.map(regel).join(', '),
      volledig: `Met brug: ${met.map(regel).join(', ')}`, getallen: items.flatMap(i => [i.a, i.b]), sleutel: `m${[...items].map(regel).sort().join('|')}`,
      kernen: items.map(i => i.kern), moeilijkheid: [Math.log10(1 + Math.max(...items.map(i => i.c))), 1],
      data: { type: 'rek-brug', op, items: door.map(({ a, b }) => ({ a, b })) } };
  });
  return [splits, sprong, brugKiezen];
}

function rekenFamilie(soort) {
  const op = soort === 'optellen' ? '+' : '-';
  const doelen = OPTELLEN_AFTREKKEN_DOELEN.concat(soort === 'aftrekken' ? ['2.2.GL1.23'] : []);
  const heeftBrug = soort === 'optellen' ? heeftBrugOptellen : heeftBrugAftrekken;
  return [
    ...familieVormen({
      prefix: soort, doelen, keuzes: brugKeuzes(soort), opties: brugOpties,
      kern: (r, { gebied, opties }) => somKern(soort, r, gebied, (opties && opties.brug) || 'beide'),
      tabelKiezen(r, { gebied, opties }) {
        const k = somKern(soort, r, gebied, (opties && opties.brug) || 'beide');
        if (!k) return null;
        const paren = [], gezien = new Set();
        for (let t = 0; t < 60 && paren.length < 4; t++) {
          const x = soort === 'optellen' ? r.geheel(1, gebied - k.b) : r.geheel(k.b + 1, gebied);
          const brugKeuze = (opties && opties.brug) || 'beide', brug = heeftBrug(x, k.b);
          if (gezien.has(x) || (brugKeuze === 'zonder' && brug) || (brugKeuze === 'met' && !brug)) continue;
          gezien.add(x); paren.push([x, uit(op, x, k.b)]);
        }
        return paren.length === 4 ? { op, vast: k.b, paren: paren.sort((p, q) => p[0] - q[0]) } : null;
      },
      vraagstuk: verhaal,
    }),
    ...optellenAftrekkenExtra(soort),
  ];
}
export const OPTELLEN_VORMEN = rekenFamilie('optellen');
export const AFTREKKEN_VORMEN = rekenFamilie('aftrekken');

/* ------------------------------------------------------------------ maaltafels */
const tafelKeuzes = maaltafels.keuzes.map(k => ({ ...k, groep: 'maaltafels' }));
const tafelOpties = (d, k) => maaltafels.opties(d, k);
const tafelKernVan = (r, { gebied, opties }) => tafelKern(r, gebied, (opties && opties.tafels) || leesTafels(''), (opties && opties.bewerking) || 'beide');

export const MAALTAFEL_VORMEN = [
  ...familieVormen({
    prefix: 'maaltafels', doelen: TAFEL_DOELEN, keuzes: tafelKeuzes, opties: tafelOpties, kern: tafelKernVan,
    tabelKiezen(r, { gebied, opties }) {
      const tafels = (opties && opties.tafels) || leesTafels(''), bew = (opties && opties.bewerking) || 'beide';
      const t = tafels[r.geheel(0, tafels.length - 1)], delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5);
      const ks = r.schud([...Array(10).keys()].map(i => i + 1)).filter(k => t * k <= gebied).slice(0, 5).sort((x, y) => x - y);
      if (ks.length < 4) return null;
      return delen ? { op: ':', vast: t, paren: ks.map(k => [t * k, k]) } : { op: '×', vast: t, paren: ks.map(k => [k, t * k]) };
    },
    vraagstuk: verhaal,
  }),
  {
    id: 'maaltafels-rooster', titel: 'Stippenrooster', pictogram: 'schrijven', rang: 5, schaal: 0.5, basis: false, doelen: TAFEL_DOELEN, keuzes: tafelKeuzes, opties: tafelOpties,
    opdracht: 'Tel de rijen en de stippen per rij. Schrijf de maalsom op.',
    genereer({ seed, aantal, gebied, opties }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => {
        const tafels = (opties && opties.tafels) || leesTafels(''), t = tafels[r.geheel(0, tafels.length - 1)];
        const rijen = r.geheel(2, 6), kolommen = t;
        if (rijen * kolommen > gebied || kolommen < 2 || kolommen > 10) return null;
        return { tekst: `____ × ____ = ____`, svg: rooster(rijen, kolommen), breed: true, antwoord: `${rijen} × ${kolommen} = ${rijen * kolommen}`,
          volledig: `${rijen} rijen van ${kolommen}: ${rijen} × ${kolommen} = ${rijen * kolommen}`, getallen: [rijen, kolommen, rijen * kolommen], sleutel: `${rijen}x${kolommen}`,
          kern: `rek:×:${Math.min(rijen, kolommen)}:${Math.max(rijen, kolommen)}`, familie: `rek:×:${Math.min(rijen, kolommen)}:${Math.max(rijen, kolommen)}`,
          moeilijkheid: [kolommen, rijen], data: { type: 'rek-rooster', rijen, kolommen } };
      }), aantal);
    },
  },
  {
    id: 'maaltafels-veelvouden', titel: 'Veelvouden kleuren', pictogram: 'kleuren', rang: 5, schaal: 0.34, basis: false, doelen: TAFEL_DOELEN, keuzes: tafelKeuzes, opties: tafelOpties,
    opdracht: 'Kleur de getallen die in de tafel staan.',
    genereer({ seed, aantal, gebied, opties }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => {
        const tafels = ((opties && opties.tafels) || leesTafels('')).filter(t => t >= 2), n = Math.min(gebied, 40);
        if (!tafels.length || n < 20) return null;
        const t = tafels[r.geheel(0, tafels.length - 1)], veelvouden = Array.from({ length: Math.floor(n / t) }, (_, i) => (i + 1) * t);
        return { tekst: `Kleur de tafel van ${t}.`, svg: getallenrooster(n), antwoordSvg: getallenrooster(n, veelvouden), breed: true, antwoord: veelvouden.join(', '),
          volledig: `De tafel van ${t}: ${veelvouden.join(', ')}`, getallen: [t, n], sleutel: `${t}/${n}`, moeilijkheid: [t, n], data: { type: 'rek-veelvouden', t, n } };
      }), aantal);
    },
  },
  {
    id: 'maaltafels-omcirkelen', titel: 'Producten van de tafel omcirkelen', pictogram: 'omcirkelen', rang: 3, schaal: 0.67, basis: false, doelen: TAFEL_DOELEN, keuzes: tafelKeuzes, opties: tafelOpties,
    opdracht: 'Omcirkel de getallen die in de tafel staan.',
    genereer({ seed, aantal, gebied, opties }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => {
        const tafels = ((opties && opties.tafels) || leesTafels('')).filter(t => t >= 2), t = tafels.length ? tafels[r.geheel(0, tafels.length - 1)] : null;
        if (!t || t * 10 > gebied) return null;
        const juist = new Set(), fout = new Set();
        while (juist.size < 4) juist.add(t * r.geheel(1, 10));
        for (let i = 0; i < 40 && fout.size < 4; i++) { const x = t * r.geheel(1, 10) + (r.volgende() < 0.5 ? 1 : -1) * r.geheel(1, Math.max(1, t - 1)); if (x >= 1 && x <= gebied && x % t !== 0) fout.add(x); }
        if (fout.size < 4) return null;
        const alle = r.schud([...juist, ...fout]);
        return { tekst: `Tafel van ${t}:${NBSP.repeat(4)}${alle.join(NBSP.repeat(6))}`, breed: true, antwoord: [...juist].sort((x, y) => x - y).join(', '),
          volledig: `Tafel van ${t}: ${[...juist].sort((x, y) => x - y).join(', ')}`, getallen: alle.concat([t]), sleutel: `${t}|${[...alle].sort((x, y) => x - y).join(',')}`,
          moeilijkheid: [t, 1], data: { type: 'rek-omcirkel', t, getallen: alle } };
      }), aantal);
    },
  },
];

/* ------------------------------------------------------------------ vermenigvuldigen en delen met grotere getallen */
const mdKeuzes = vermenigvuldigenDelen.keuzes.map(k => ({ ...k, groep: 'vermenigvuldigen-delen' }));
const mdOpties = (d, k) => vermenigvuldigenDelen.opties(d, k);
const mdKern = (r, { gebied, opties }) => maalDeelKern(r, gebied, (opties && opties.bewerking) || 'beide');
export const MAALDEEL_VORMEN = [
  ...familieVormen({
    prefix: 'maaldeel', doelen: MAAL_DEEL_DOELEN, keuzes: mdKeuzes, opties: mdOpties, kern: mdKern,
    tabelKiezen(r, { gebied, opties }) {
      const bew = (opties && opties.bewerking) || 'beide', delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5), b = r.geheel(2, 9);
      const paren = [], gezien = new Set(), maxX = Math.floor(gebied / b);
      if (maxX < 11) return null;
      for (let t = 0; t < 60 && paren.length < 4; t++) {
        const x = r.geheel(11, maxX);
        if (gezien.has(x)) continue;
        gezien.add(x); paren.push(delen ? [x * b, x] : [x, x * b]);
      }
      return paren.length === 4 ? { op: delen ? ':' : '×', vast: b, paren: paren.sort((p, q) => p[0] - q[0]) } : null;
    },
    vraagstuk: verhaal,
  }),
  {
    id: 'maaldeel-uitsplitsen', titel: 'Uitsplitsen', pictogram: 'schrijven', rang: 5, schaal: 0.67, basis: false, doelen: MAAL_DEEL_DOELEN, keuzes: mdKeuzes, opties: mdOpties,
    opdracht: 'Splits het getal uit en reken in stappen. Vul de lijnen in.',
    genereer({ seed, aantal, gebied, opties }) {
      const bew = (opties && opties.bewerking) || 'beide', rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => {
        if (gebied < 100) return null;
        const b = r.geheel(2, 9), delen = bew === 'delen' || (bew === 'beide' && r.volgende() < 0.5);
        if (!delen) {                                                                // 13 x 4 = 10 x 4 + 3 x 4
          const tientallen = r.geheel(1, 9) * 10, eenheden = r.geheel(1, 9), a = tientallen + eenheden;
          if (a * b > gebied) return null;
          return { tekst: `${a} × ${b} = ${tientallen} × ${b} + ${eenheden} × ${b} = ____ + ____ = ____`, breed: true, antwoord: `${tientallen * b}, ${eenheden * b} en ${a * b}`,
            volledig: `${a} × ${b} = ${tientallen} × ${b} + ${eenheden} × ${b} = ${tientallen * b} + ${eenheden * b} = ${a * b}`, getallen: [a, b, tientallen, eenheden, tientallen * b, eenheden * b, a * b],
            sleutel: `u${a}x${b}`, familie: `rek:×:${Math.min(a, b)}:${Math.max(a, b)}`, kern: `rek:×:${Math.min(a, b)}:${Math.max(a, b)}`, moeilijkheid: [0, a * b],
            data: { type: 'rek-uitsplitsen', op: '×', a, b, d1: tientallen, d2: eenheden } };
        }
        const m = r.geheel(1, 9), n = r.geheel(1, 9), d1 = b * 10 * m, d2 = b * n, p = d1 + d2;   // 84 : 4 = 80 : 4 + 4 : 4
        if (p > gebied) return null;
        return { tekst: `${p} : ${b} = ${d1} : ${b} + ${d2} : ${b} = ____ + ____ = ____`, breed: true, antwoord: `${d1 / b}, ${d2 / b} en ${p / b}`,
          volledig: `${p} : ${b} = ${d1} : ${b} + ${d2} : ${b} = ${d1 / b} + ${d2 / b} = ${p / b}`, getallen: [p, b, d1, d2, d1 / b, d2 / b, p / b],
          sleutel: `u${p}:${b}`, familie: `rek:::${p}:${b}`, kern: `rek:::${p}:${b}`, moeilijkheid: [1, p],
          data: { type: 'rek-uitsplitsen', op: ':', a: p, b, d1, d2 } };
      }), aantal);
    },
  },
];
