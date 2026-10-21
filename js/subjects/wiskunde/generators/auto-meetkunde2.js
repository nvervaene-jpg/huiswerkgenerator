// Meetkunde op ruitjespapier en met figuren: transformaties herkennen en tekenen, symmetrie, patronen, plaatsbepaling, congruentie en gelijkvormigheid.
// De tekeningen komen uit ../meetkunde-raster.js en ../meetkunde-svg.js; een test meet ze opnieuw op. De doelen komen uit ../auto-doelen.js.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import * as S from '../meetkunde-svg.js';
import * as R from '../meetkunde-raster.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const getalFouten = (a, extra = []) => [...extra, a + 1, a - 1, a + 2, a - 2].filter(x => x >= 0);
const nf = (a, extra = []) => [...extra, a + 1, a - 1, a * 2, a + 2].filter(x => x > 0);

/* ------------------------------------------------------------------ transformaties op ruitjespapier */
const BR = 14, HO = 8;                                                    // het rooster is 14 x 8 vierkantjes
const binnen = (cellen, b = BR, h = HO) => cellen.every(([x, y]) => x >= 0 && y >= 0 && x < b && y < h);
const botst = (p, q) => p.some(c => q.some(d => d[0] === c[0] && d[1] === c[1]));
const dichtbij = (p, q) => p.some(c => q.some(d => Math.abs(d[0] - c[0]) <= 1 && Math.abs(d[1] - c[1]) <= 1));
const maxX = (c) => Math.max(...c.map(v => v[0])), maxY = (c) => Math.max(...c.map(v => v[1]));
const LETTERS = ['B', 'C', 'D'];

// Een figuur A en zijn beeld B volgens een transformatie; geeft { A, B, as, punt } of null.
export function maakTransformatie(r, soort, b = BR, h = HO) {
  const fig = R.maakFiguur(r, r.geheel(4, 6)); if (!fig) return null;
  if (soort === 'verschuiving') {
    const A = R.verschuif(fig, r.geheel(0, 2), r.geheel(1, h - 4)), B = R.verschuif(A, r.geheel(4, 8), r.geheel(-1, 1));
    return binnen(A, b, h) && binnen(B, b, h) && !botst(A, B) ? { A, B } : null;
  }
  if (soort === 'spiegeling') {
    if (r.volgende() < 0.65) {
      const a = r.geheel(5, 8), A = R.verschuif(fig, a - 1 - maxX(fig) - r.geheel(0, 1), r.geheel(1, h - 4)), B = R.spiegelV(A, a);
      return binnen(A, b, h) && binnen(B, b, h) ? { A, B, as: { soort: 'v', pos: a } } : null;
    }
    const pos = Math.floor(h / 2), A = R.verschuif(fig, r.geheel(1, b - 4), pos - 1 - maxY(fig) - r.geheel(0, 1)), B = R.spiegelH(A, pos);
    return binnen(A, 14, h) && binnen(B, b, h) ? { A, B, as: { soort: 'h', pos } } : null;
  }
  const cx = r.geheel(6, 9), cy = r.geheel(3, 5), A = R.verschuif(fig, cx - 4 - r.geheel(0, 1), cy - 1 - r.geheel(0, 1)), kw = kies(r, [1, 2, 3]), B = R.draai(A, cx, cy, kw);
  return binnen(A, b, h) && binnen(B, b, h) && !botst(A, B) ? { A, B, punt: { x: cx, y: cy }, kwarten: kw } : null;
}
const SOORT_NAAM = { verschuiving: 'verschuiving', draaiing: 'draaiing', spiegeling: 'spiegeling' };

const trfOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, type = kies(r, p.types);
  if (type === 'soort') {
    const soorten = jaar === 2 || jaar === 3 ? ['verschuiving', 'draaiing'] : ['verschuiving', 'draaiing', 'spiegeling'], soort = kies(r, soorten), t = maakTransformatie(r, soort);
    if (!t) return null;
    const svg = R.rasterTekening({ b: BR, h: HO, figuren: [{ id: 'A', cellen: t.A }, { id: 'B', cellen: t.B }] });
    return mk(`Figuur B ontstaat uit figuur A door een ____. (${soorten.join(', ').replace(/, ([a-z]+)$/, ' of $1')})`, svg, soort, soorten.filter(x => x !== soort), `ts${soort}${R.normaliseer(t.A).join(';')}${t.B[0]}`, soort === 'verschuiving' ? 1 : 2, { mk2: 'trf', soort: type, transformatie: soort, A: t.A, B: t.B });
  }
  // het spiegelbeeld kiezen: één juist beeld en twee fouten (verschoven, of gespiegeld om een verkeerde lijn)
  const t = maakTransformatie(r, 'spiegeling'); if (!t) return null;
  const { A, as } = t, zone = as.soort === 'v' ? { x0: as.pos + 1, x1: BR - 1, y0: 0, y1: HO - 1 } : { x0: 0, x1: BR - 1, y0: as.pos, y1: HO - 1 };
  const zet = (cellen, bezet) => {                                          // een foute kandidaat op een willekeurige vrije plaats aan de overkant van de lijn
    const n = R.normaliseer(cellen);
    for (let p = 0; p < 80; p++) {
      const c = R.verschuif(n, r.geheel(zone.x0, zone.x1 - maxX(n)), r.geheel(zone.y0, zone.y1 - maxY(n)));
      if (binnen(c) && !bezet.some(d => dichtbij(c, d))) return c;
    }
    return null;
  };
  const fout1 = zet(A, [A, t.B]); if (!fout1) return null;                                                                  // dezelfde stand, enkel verschoven
  const fout2 = zet(as.soort === 'v' ? R.spiegelH(A, 0) : R.spiegelV(A, 0), [A, t.B, fout1]); if (!fout2) return null;      // gespiegeld om de verkeerde richting
  const kandidaten = [t.B, fout1, fout2];
  const volgorde = r.schud([0, 1, 2]), ids = volgorde.map((v, i) => LETTERS[i]);
  const figuren = [{ id: 'A', cellen: A }, ...volgorde.map((v, i) => ({ id: ids[i], cellen: kandidaten[v] }))], juist = ids[volgorde.indexOf(0)];
  const svg = R.rasterTekening({ b: BR, h: HO, figuren, as });
  return mk('Welke figuur is het spiegelbeeld van figuur A om de rode lijn? Figuur ____ (B, C of D)', svg, juist, LETTERS.filter(x => x !== juist), `tm${A.join(';')}${as.soort}${as.pos}${volgorde.join('')}`, 3, { mk2: 'trf', soort: type, A, as, kandidaten: Object.fromEntries(ids.map((id, i) => [id, kandidaten[volgorde[i]]])), goed: juist });
};
export const TRANSFORMATIE_VORMEN = maakOpgaveVormen({
  id: 'trf', titel: 'Verschuiven, draaien en spiegelen', doelen: AUTO_DOELEN.trf || [], parameters: K.transformatieParameters, standaard: { types: ['soort'], jaar: 4 },
  opdracht: opdracht('Kijk naar de figuren op het ruitjespapier. Vul aan op de lijn.', 'Kijk naar de figuren op het ruitjespapier. Kies het juiste antwoord. Omcirkel.'), opgave: trfOpgave, schaal: 1,
});

/* ------------------------------------------------------------------ tekenen op ruitjespapier: de leerling tekent, het antwoordblad toont het beeld */
const tekenVorm = ({ id, titel, opdr, doelen, rang, bouw }) => ({
  id, titel, pictogram: 'tekenen', opdracht: opdr, doelen, rang, schaal: 0.67, basis: false,
  genereer({ seed, aantal }) { const rng = maakRng(seed); return resultaat(trek(rng, aantal, (r) => bouw(r)), aantal); },
});
const tekenOef = (instructie, svg, antwoordSvg, volledig, kern, moeilijkheid, data) => ({ tekst: instructie, svg, antwoordSvg, antwoord: 'getekend', volledig, getallen: [], sleutel: kern, kern, moeilijkheid, data });
const TB = 10, TH = 7;

export const TEKEN_SPIEGELEN = tekenVorm({
  id: 'tsp-tekenen', titel: 'Spiegelen op ruitjespapier', opdr: 'Spiegel figuur A om de rode lijn. Teken het spiegelbeeld met een potlood en een lat.', doelen: AUTO_DOELEN.tsp || [], rang: 6,
  bouw(r) {
    const t = maakTransformatie(r, 'spiegeling', TB, TH);
    if (!t || (t.as.soort === 'v' ? t.as.pos < 4 || t.as.pos > 6 : false) || !t.as) return null;
    const leeg = R.rasterTekening({ b: TB, h: TH, figuren: [{ id: 'A', cellen: t.A }], as: t.as }), antw = R.rasterTekening({ b: TB, h: TH, figuren: [{ id: 'A', cellen: t.A }, { id: 'B', cellen: t.B, label: false }], as: t.as });
    return tekenOef('Spiegel figuur A om de rode lijn.', leeg, antw, 'Het spiegelbeeld is getekend: elk vierkantje staat even ver van de lijn als zijn spiegelbeeld.', `tsp${R.normaliseer(t.A).join(';')}${t.as.soort}${t.as.pos}${t.A[0]}`, 3, { mk2: 'tsp', A: t.A, B: t.B, as: t.as });
  },
});
export const TEKEN_VERSCHUIVEN = tekenVorm({
  id: 'tvs-tekenen', titel: 'Verschuiven op ruitjespapier', opdr: 'Teken een congruente figuur: verschuif figuur A zoals aangegeven.', doelen: AUTO_DOELEN.tvs || [], rang: 6,
  bouw(r) {
    const fig = R.maakFiguur(r, r.geheel(4, 5)); if (!fig) return null;
    const dx = r.geheel(3, 6), dy = r.geheel(-2, 2), A = R.verschuif(fig, r.geheel(0, 1), r.geheel(2, 3)), B = R.verschuif(A, dx, dy);
    if (!binnen(A, TB, TH) || !binnen(B, TB, TH) || botst(A, B)) return null;
    const tekst = `Verschuif figuur A ${dx} vakjes naar rechts${dy === 0 ? '' : ` en ${Math.abs(dy)} ${Math.abs(dy) === 1 ? 'vakje' : 'vakjes'} ${dy < 0 ? 'omhoog' : 'omlaag'}`}.`;
    return tekenOef(tekst, R.rasterTekening({ b: TB, h: TH, figuren: [{ id: 'A', cellen: A }] }), R.rasterTekening({ b: TB, h: TH, figuren: [{ id: 'A', cellen: A }, { id: 'B', cellen: B, label: false }] }),
      'De figuur is verschoven: vorm en grootte blijven gelijk, de figuren zijn congruent.', `tvs${R.normaliseer(A).join(';')}${dx}.${dy}`, 3, { mk2: 'tvs', A, B, dx, dy });
  },
});
export const TEKEN_DRAAIEN = tekenVorm({
  id: 'tdr-tekenen', titel: 'Draaien op ruitjespapier', opdr: 'Teken een congruente figuur: draai figuur A zoals aangegeven om het rode punt.', doelen: AUTO_DOELEN.tdr || [], rang: 7,
  bouw(r) {
    const fig = R.maakFiguur(r, r.geheel(4, 5)); if (!fig) return null;
    const cx = r.geheel(4, 6), cy = r.geheel(3, 4), kw = kies(r, [1, 2, 3]), A = R.verschuif(fig, cx - 3, cy - 1 - r.geheel(0, 1)), B = R.draai(A, cx, cy, kw);
    if (!binnen(A, TB, TH) || !binnen(B, TB, TH) || botst(A, B)) return null;
    const woord = { 1: 'een kwartdraai met de klok', 2: 'een halve draai', 3: 'een kwartdraai tegen de klok' }[kw];
    return tekenOef(`Draai figuur A ${woord} om het rode punt.`, R.rasterTekening({ b: TB, h: TH, figuren: [{ id: 'A', cellen: A }], punt: { x: cx, y: cy } }), R.rasterTekening({ b: TB, h: TH, figuren: [{ id: 'A', cellen: A }, { id: 'B', cellen: B, label: false }], punt: { x: cx, y: cy } }),
      'De figuur is gedraaid om het rode punt: vorm en grootte blijven gelijk.', `tdr${R.normaliseer(A).join(';')}${cx}.${cy}.${kw}`, 4, { mk2: 'tdr', A, B, punt: { x: cx, y: cy }, kwarten: kw });
  },
});
export const TEKEN_VERGROTEN = tekenVorm({
  id: 'tvg-tekenen', titel: 'Vergroten op ruitjespapier', opdr: 'Teken een gelijkvormige figuur: vergroot figuur A met de aangegeven factor. Elk vakje van A wordt zoveel vakjes breed en hoog.', doelen: AUTO_DOELEN.tvg || [], rang: 7,
  bouw(r) {
    const fig = R.maakFiguur(r, r.geheel(4, 5)); if (!fig) return null;
    const f = kies(r, [2, 2, 3]), A = R.verschuif(fig, 0, 1), B = R.verschuif(R.vergroot(R.normaliseer(fig), f), 5, 0);
    if (!binnen(A, 12, 8) || !binnen(B, 12, 8)) return null;
    return tekenOef(`Vergroot figuur A met factor ${f}.`, R.rasterTekening({ b: 12, h: 8, figuren: [{ id: 'A', cellen: A }] }), R.rasterTekening({ b: 12, h: 8, figuren: [{ id: 'A', cellen: A }, { id: 'B', cellen: B, label: false }] }),
      `Elk vierkantje wordt ${f} bij ${f} vierkantjes: de figuur is ${f} keer zo breed en ${f} keer zo hoog (gelijkvormig).`, `tvg${R.normaliseer(fig).join(';')}${f}`, 5, { mk2: 'tvg', A, B, f });
  },
});

/* ------------------------------------------------------------------ symmetrie */
const reg = (n, start) => Array.from({ length: n }, (_, i) => [Math.cos(((start + (360 / n) * i) * Math.PI) / 180), Math.sin(((start + (360 / n) * i) * Math.PI) / 180)]);
// naam, vorm, punten (eenheden) en het aantal symmetrieassen
export const SYM_FIGUREN = [
  { naam: 'vierkant', vorm: 'vierkant', assen: 4 }, { naam: 'rechthoek', vorm: 'rechthoek', assen: 2 }, { naam: 'ruit', vorm: 'ruit', assen: 2 }, { naam: 'vlieger', vorm: 'vlieger', assen: 1 },
  { naam: 'trapezium', vorm: 'trapezium', assen: 1 }, { naam: 'parallellogram', vorm: 'parallellogram', assen: 0 }, { naam: 'vierhoek', vorm: 'vierhoek', assen: 0 },
  { naam: 'vijfhoek', vorm: 'vijfhoek', assen: 5 }, { naam: 'zeshoek', vorm: 'zeshoek', assen: 6 }, { naam: 'achthoek', vorm: 'achthoek', assen: 8 },
  { naam: 'gelijkzijdige driehoek', vorm: 'driehoek', punten: reg(3, -90), assen: 3 }, { naam: 'gelijkbenige driehoek', vorm: 'driehoek', punten: [[-1, 0.9], [1, 0.9], [0, -0.9]], assen: 1 },
  { naam: 'ongelijkbenige driehoek', vorm: 'driehoek', punten: [[-1.1, 0.8], [1.2, 0.6], [-0.2, -0.9]], assen: 0 },
];
const symFiguur = (f, rot, s = 60) => S.vlakFiguur(f.vorm, { rot, s, kleur: '#bbdefb', punten: f.punten });
// symmetrieassen (hoeken in graden, in de tekening) volgens het aantal en de ligging van de figuur: via spiegelen en vergelijken
export function symAssen(punten) {
  const n = punten.length, mid = [punten.reduce((x, q) => x + q[0], 0) / n, punten.reduce((x, q) => x + q[1], 0) / n], hoeken = [];
  const kand = [...punten.map(q => Math.atan2(q[1] - mid[1], q[0] - mid[0])), ...punten.map((q, i) => { const w = punten[(i + 1) % n]; return Math.atan2((q[1] + w[1]) / 2 - mid[1], (q[0] + w[0]) / 2 - mid[0]); })];
  for (const a of kand) {
    const c = Math.cos(2 * a), sn = Math.sin(2 * a), spiegel = ([x, y]) => { const dx = x - mid[0], dy = y - mid[1]; return [mid[0] + dx * c + dy * sn, mid[1] + dx * sn - dy * c]; };
    if (punten.every(q => { const m = spiegel(q); return punten.some(v => Math.hypot(v[0] - m[0], v[1] - m[1]) < 0.8); })) {
      const g = ((a * 180) / Math.PI + 360) % 180;
      if (!hoeken.some(x => Math.abs(x - g) < 1 || Math.abs(x - g) > 179)) hoeken.push(g);
    }
  }
  return { hoeken, mid };
}
const puntenVan = (svg) => (/<polygon points="([^"]+)"/.exec(svg.markup)[1]).split(' ').map(q => q.split(',').map(Number));
const metLijn = (svg, mid, graden, data = 'lijn', kleur = '#c0392b') => {
  const a = (graden * Math.PI) / 180, L = 95, x1 = mid[0] - L * Math.cos(a), y1 = mid[1] - L * Math.sin(a), x2 = mid[0] + L * Math.cos(a), y2 = mid[1] + L * Math.sin(a);
  return { ...svg, markup: svg.markup.replace('</svg>', `<line data-as="${data}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${kleur}" stroke-width="2.6" stroke-dasharray="7 5"/></svg>`) };
};
const symOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, type = kies(r, p.types), f = kies(r, SYM_FIGUREN.filter(x => jaar >= 3 || ['vierkant', 'rechthoek', 'gelijkzijdige driehoek', 'parallellogram', 'ongelijkbenige driehoek', 'vlieger'].includes(x.naam)));
  const rot = jaar <= 1 ? 0 : r.geheel(0, 11) * 15, svg = symFiguur(f, rot), data = { mk2: 'sym', soort: type, naam: f.naam, rot };
  const kern = `${type}${f.naam}${rot}`;
  if (type === 'jn') { const ja = f.assen > 0, woorden = jaar >= 5 ? ['symmetrisch', 'asymmetrisch'] : ['symmetrisch', 'niet symmetrisch']; return mk(`Deze figuur is ____. (${woorden[0]} of ${woorden[1]})`, svg, ja ? woorden[0] : woorden[1], [ja ? woorden[1] : woorden[0]], kern, 1, data); }
  if (type === 'assen') return mk('Hoeveel symmetrieassen heeft deze figuur? ____', svg, f.assen, getalFouten(f.assen, [f.assen + 3]), kern, 3, data);
  const { hoeken, mid } = symAssen(puntenVan(svg));
  const ja = r.volgende() < 0.5 && hoeken.length > 0;
  let graden;
  if (ja) graden = kies(r, hoeken);
  else { const kandidaten = [10, 25, 40, 55, 70, 85, 100, 115, 130, 145, 160, 175].filter(g => hoeken.every(h => Math.min(Math.abs(h - g), 180 - Math.abs(h - g)) > 9)); graden = kies(r, kandidaten); }
  return mk('Is de rode lijn een symmetrieas van de figuur? ____ (ja of nee)', metLijn(svg, mid, graden), ja ? 'ja' : 'nee', [ja ? 'nee' : 'ja'], `${kern}${Math.round(graden)}`, 4, { ...data, graden });
};
export const SYMMETRIE_VORMEN = maakOpgaveVormen({
  id: 'sym', titel: 'Symmetrie', doelen: AUTO_DOELEN.sym || [], parameters: K.symmetrieParameters, standaard: { types: ['jn'], jaar: 3 },
  opdracht: opdracht('Kijk naar de figuur. Vul aan op de lijn.', 'Kijk naar de figuur. Kies het juiste antwoord. Omcirkel.'), opgave: symOpgave, schaal: 1.6,
});
export const TEKEN_ASSEN = tekenVorm({
  id: 'tas-tekenen', titel: 'Symmetrieassen tekenen', opdr: 'Teken alle symmetrieassen van de figuur met een lat. Een figuur kan er meer dan één hebben.', doelen: AUTO_DOELEN.tas || [], rang: 7,
  bouw(r) {
    const f = kies(r, SYM_FIGUREN.filter(x => x.assen > 0 && x.assen <= 6)), rot = r.geheel(0, 11) * 15, svg = symFiguur(f, rot), { hoeken, mid } = symAssen(puntenVan(svg));
    let antw = svg; hoeken.forEach((g, i) => { antw = metLijn(antw, mid, g, 'as'); void i; });
    return tekenOef('Teken alle symmetrieassen.', svg, antw, `Deze figuur heeft ${f.assen} ${f.assen === 1 ? 'symmetrieas' : 'symmetrieassen'}.`, `tas${f.naam}${rot}`, f.assen, { mk2: 'tas', naam: f.naam, rot, assen: f.assen });
  },
});

/* ------------------------------------------------------------------ patronen */
const VORMEN3 = ['cirkel', 'vierkant', 'driehoek'], KLEUREN4 = ['rood', 'blauw', 'geel', 'groen'], ADJ = { rood: 'rode', blauw: 'blauwe', geel: 'gele', groen: 'groene' };
export const elementNaam = (e) => (e.vorm === 'vierkant' ? `${e.kleur} vierkant` : `${ADJ[e.kleur]} ${e.vorm}`);
const zelfdeEl = (x, y) => x.vorm === y.vorm && x.kleur === y.kleur;
const periode = (reeks) => { for (let p = 1; p <= reeks.length; p++) if (reeks.every((e, i) => zelfdeEl(e, reeks[i % p]))) return p; return reeks.length; };
function maakEenheid(r, lengte, jaar) {
  for (let t = 0; t < 200; t++) {
    const eenheid = Array.from({ length: lengte }, () => ({ vorm: kies(r, jaar <= 1 ? ['cirkel', 'vierkant'] : VORMEN3), kleur: kies(r, jaar <= 1 ? ['rood', 'blauw'] : KLEUREN4) }));
    if (periode([...eenheid, ...eenheid, ...eenheid]) === lengte) return eenheid;
  }
  return null;
}
const patOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, type = kies(r, p.types), data = { mk2: 'pat', soort: type };
  if (type === 'verandering' || type === 'volgende') {
    const stap = kies(r, jaar <= 1 ? [1, 2] : [1, 2, 3]), start = kies(r, [1, 2, 3]), n = 4, aantallen = Array.from({ length: n }, (_, i) => start + i * stap);
    if (aantallen[n - 1] + stap > 10) return null;
    if (type === 'verandering') return mk('Hoeveel vierkantjes komen er telkens bij? ____', S.torenRij(aantallen, 10), stap, getalFouten(stap, [aantallen[1]]), `pv${start}.${stap}`, 3, { ...data, aantallen, stap });
    const volgend = start + n * stap;
    return mk('Hoeveel vierkantjes heeft de volgende toren? ____', S.torenRij([...aantallen, null], 10), volgend, getalFouten(volgend, [volgend - 1 + stap]), `pw${start}.${stap}`, 4, { ...data, aantallen, stap, volgend });
  }
  const u = kies(r, jaar <= 1 ? [2] : jaar === 2 ? [2, 3] : [2, 3, 4]), eenheid = maakEenheid(r, u, jaar);
  if (!eenheid) return null;
  const kern = `${type}${eenheid.map(e => e.kleur[0] + e.vorm[0]).join('')}`;
  if (type === 'eenheid') { const reeks = Array.from({ length: u * 3 }, (_, i) => eenheid[i % u]); return mk('Hoeveel figuren staan er in de patrooneenheid? ____', S.patroonRij(reeks), u, getalFouten(u, [u * 3]).filter(x => x > 1), kern, 3, { ...data, u }); }
  const extra = r.geheel(1, u - 1) + (type === 'volgend' ? 0 : 1), lengte = u * 2 + extra;
  const volledig = Array.from({ length: lengte + (type === 'volgend' ? 1 : 0) }, (_, i) => eenheid[i % u]);
  const gat = type === 'volgend' ? volledig.length - 1 : r.geheel(u, volledig.length - 2), antw = volledig[gat], getoond = volledig.map((e, i) => (i === gat ? null : e));
  const opties = []; for (const k of KLEUREN4) for (const v of VORMEN3) if (!(k === antw.kleur && v === antw.vorm)) opties.push(elementNaam({ vorm: v, kleur: k }));
  return mk(`Welke figuur komt er in het vakje met het vraagteken? ____`, S.patroonRij(getoond), elementNaam(antw), r.schud(opties).slice(0, 3), `${kern}${gat}.${lengte}`, 2, { ...data, u, gat });
};
export const PATROON_VORMEN = maakOpgaveVormen({
  id: 'pat', titel: 'Patronen', doelen: AUTO_DOELEN.pat || [], parameters: K.patroonParameters, standaard: { types: ['volgend', 'eenheid'], jaar: 2 },
  opdracht: opdracht('Kijk naar het patroon. Vul aan op de lijn.', 'Kijk naar het patroon. Kies het juiste antwoord. Omcirkel.'), opgave: patOpgave, schaal: 1,
});

/* ------------------------------------------------------------------ plaatsbepaling */
const kandidaten = () => VORMEN3.flatMap(v => KLEUREN4.map(k => ({ vorm: v, kleur: k })));
const posOpgave = (r, p) => {
  const type = kies(r, p.types), data = { mk2: 'pos', soort: type };
  if (type === 'rij') {
    const rij = r.schud(kandidaten()).slice(0, 5), svg = S.patroonRij(rij), soort = kies(r, ['links', 'rechts', 'tussen', 'eerste', 'laatste']);
    if (soort === 'tussen') { const i = r.geheel(1, 3); return mk(`Welke figuur staat tussen de ${elementNaam(rij[i - 1])} en de ${elementNaam(rij[i + 1])}? ____`, svg, elementNaam(rij[i]), rij.filter((_, j) => j !== i).map(elementNaam), `pt${rij.map(elementNaam).join()}${i}`, 3, { ...data, rij, wat: soort, i }); }
    if (soort === 'eerste' || soort === 'laatste') { const i = soort === 'eerste' ? 0 : 4; return mk(`Welke figuur staat het meest ${soort === 'eerste' ? 'links' : 'rechts'}? ____`, svg, elementNaam(rij[i]), rij.filter((_, j) => j !== i).map(elementNaam), `pe${rij.map(elementNaam).join()}${i}`, 1, { ...data, rij, wat: soort, i }); }
    const i = soort === 'links' ? r.geheel(1, 4) : r.geheel(0, 3), buur = soort === 'links' ? i - 1 : i + 1;
    return mk(`Welke figuur staat ${soort === 'links' ? 'links' : 'rechts'} naast de ${elementNaam(rij[i])}? ____`, svg, elementNaam(rij[buur]), rij.filter((_, j) => j !== buur).map(elementNaam), `pl${soort}${rij.map(elementNaam).join()}${i}`, 2, { ...data, rij, wat: soort, i });
  }
  if (type === 'vak') {
    const kol = 6, rijen = 5, gekozen = r.schud(kandidaten()).slice(0, 3), plaats = new Set(), items = [];
    for (const g of gekozen) { let k, rr; do { k = r.geheel(0, kol - 1); rr = r.geheel(0, rijen - 1); } while (plaats.has(`${k},${rr}`)); plaats.add(`${k},${rr}`); items.push({ kol: k, rij: rr, ...g }); }
    const svg = S.vakkenRooster(kol, rijen, items), it = kies(r, items), vak = `${String.fromCharCode(65 + it.kol)}${it.rij + 1}`;
    if (r.volgende() < 0.5) return mk(`In welk vak staat de ${elementNaam(it)}? ____`, svg, vak, items.filter(x => x !== it).map(x => `${String.fromCharCode(65 + x.kol)}${x.rij + 1}`).concat([`${String.fromCharCode(65 + it.rij % kol)}${it.kol + 1}`, `${String.fromCharCode(65 + (it.kol + 1) % kol)}${it.rij + 1}`]), `pv${vak}${items.map(x => x.kol + '' + x.rij).join()}`, 3, { ...data, items, wat: 'naam-naar-vak', vak });
    return mk(`Welke figuur staat in vak ${vak}? ____`, svg, elementNaam(it), items.filter(x => x !== it).map(elementNaam), `pn${vak}${items.map(x => x.kol + '' + x.rij).join()}`, 3, { ...data, items, wat: 'vak-naar-naam', vak });
  }
  if (type === 'as') { const horiz = r.volgende() < 0.5; return mk(`In een coördinaat lees je het ${horiz ? 'eerste' : 'tweede'} getal af op de ____ as. (horizontale of verticale)`, null, horiz ? 'horizontale' : 'verticale', [horiz ? 'verticale' : 'horizontale'], `pa${horiz}`, 2, { ...data, eerste: horiz }); }
  const max = 8, namen = ['A', 'B', 'C'], plaats = new Set(), punten = [];
  for (const naam of namen) { let x, y; do { x = r.geheel(0, max); y = r.geheel(0, max); } while (plaats.has(`${x},${y}`) || (x === 0 && y === 0) || x === y); plaats.add(`${x},${y}`); punten.push({ naam, x, y }); }
  const svg = S.assenstelsel(max, punten), pt = kies(r, punten);
  if (r.volgende() < 0.6) return mk(`De coördinaat van punt ${pt.naam} is ____. (eerst de horizontale as, dan de verticale as)`, svg, `(${pt.x}, ${pt.y})`, [`(${pt.y}, ${pt.x})`, `(${pt.x}, ${(pt.y + 1) % (max + 1)})`, `(${(pt.x + 1) % (max + 1)}, ${pt.y})`], `pp${pt.naam}${punten.map(q => q.x + '' + q.y).join()}`, 4, { ...data, punten, wat: 'punt-naar-coordinaat', pt });
  return mk(`Welk punt heeft coördinaat (${pt.x}, ${pt.y})? Punt ____`, svg, pt.naam, namen.filter(n => n !== pt.naam), `pq${pt.naam}${punten.map(q => q.x + '' + q.y).join()}`, 4, { ...data, punten, wat: 'coordinaat-naar-punt', pt });
};
export const PLAATS_VORMEN = maakOpgaveVormen({
  id: 'pos', titel: 'Plaatsbepaling', doelen: AUTO_DOELEN.pos || [], parameters: K.plaatsParameters, standaard: { types: ['rij'], jaar: 2 },
  opdracht: opdracht('Kijk naar de tekening. Vul aan op de lijn.', 'Kijk naar de tekening. Kies het juiste antwoord. Omcirkel.'), opgave: posOpgave, schaal: 1,
});

/* ------------------------------------------------------------------ congruent en gelijkvormig */
const congrFiguren = [
  { naam: 'driehoek', maak: (r) => S.maakDriehoek(() => r.volgende(), kies(r, ['ongelijkbenig', 'rechthoekig', 'stomphoekig'])) },
  { naam: 'parallellogram', maak: () => S.VORM_PUNTEN.parallellogram }, { naam: 'trapezium', maak: () => S.VORM_PUNTEN.trapezium }, { naam: 'vierhoek', maak: () => S.VORM_PUNTEN.vierhoek },
  { naam: 'rechthoek', maak: () => S.VORM_PUNTEN.rechthoek }, { naam: 'vlieger', maak: () => S.VORM_PUNTEN.vlieger },
];
const transformeer = (punten, { rot, spiegel, f }) => punten.map(([x, y]) => [(spiegel ? -x : x) * f, y * f]).map(q => q);
function figurenSvg(lijst) {
  const W = lijst.length * 190 + 10, H = 170;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Arial, Helvetica, sans-serif">`;
  lijst.forEach(({ id, punten, rot, s: schaal }, i) => {
    const px = S.plaats(punten, { rot, s: schaal, b: 190, h: 170 }).map(([x, y]) => [x + i * 190 + 5, y]);
    s += `<polygon data-fig="${id}" points="${px.map(q => q.join(',')).join(' ')}" fill="#bbdefb" stroke="#222" stroke-width="3" stroke-linejoin="round"/><text x="${i * 190 + 14}" y="22" font-size="20" font-weight="bold" fill="#111">${id}</text>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
const congOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, type = kies(r, p.types), data = { mk2: 'cng', soort: type };
  if (type === 'schaal') {
    const n = kies(r, [2, 5, 10, 20, 50, 100]);
    if (r.volgende() < 0.5) { const x = r.geheel(2, 12); return mk(`Een tekening heeft schaal 1 : ${n}. Een lijn van ${x} cm op de tekening is in werkelijkheid ____ cm.`, null, x * n, nf(x * n, [x + n, n]), `cs${n}.${x}`, 3, { ...data, n, x, wat: 'tekening-naar-werkelijk' }); }
    return mk(`De breukschaal 1/${n} betekent: de schaal is 1 : ____.`, null, n, nf(n, [n + 1, 1]), `cb${n}`, 2, { ...data, n, wat: 'breukschaal' });
  }
  if (type === 'factor') {
    if (r.volgende() < 0.5) { const f = kies(r, [2, 3, 4, 5]), a = r.geheel(2, 9), vergroot = r.volgende() < 0.5; return vergroot ? mk(`Een figuur wordt ${f} keer vergroot. Een zijde van ${a} cm wordt ____ cm.`, null, a * f, nf(a * f, [a + f]), `cf${a}.${f}`, 3, { ...data, a, f, wat: 'vergroot' }) : mk(`Een figuur wordt ${f} keer verkleind. Een zijde van ${a * f} cm wordt ____ cm.`, null, a, nf(a, [a * f]), `cg${a}.${f}`, 3, { ...data, a, f, wat: 'verkleind' }); }
    const x = kies(r, [2, 3, 4]), vergroting = r.volgende() < 0.5, links = vergroting ? 1 : x, rechts = vergroting ? x : 1;
    return mk(`Een tekening heeft verhouding ${links} : ${rechts} (origineel : tekening). Dat is een ____. (vergroting of verkleining)`, null, vergroting ? 'vergroting' : 'verkleining', [vergroting ? 'verkleining' : 'vergroting'], `cv${links}.${rechts}`, 3, { ...data, links, rechts, wat: 'woord' });
  }
  // twee van de drie figuren zijn congruent (zelfde vorm en grootte) of gelijkvormig (zelfde vorm); welk paar?
  const basis = kies(r, congrFiguren), andere = kies(r, congrFiguren.filter(f => f.naam !== basis.naam)), pa = basis.maak(r), po = andere.maak(r);
  if (!pa || !po) return null;
  const s0 = r.geheel(42, 52), rot1 = r.geheel(0, 23) * 15, rot2 = r.geheel(0, 23) * 15, rot3 = r.geheel(0, 23) * 15, spiegel = r.volgende() < 0.5;
  const factor = type === 'congruent' ? 1 : kies(r, [0.6, 1.5, 0.75, 1.25]), anderFactor = r.volgende() < 0.5 ? 1 : 1.3;
  // het derde figuur is bij 'congruent' een vergroting (gelijkvormig, niet congruent) of een andere vorm; bij 'gelijkvormig' altijd een andere vorm
  const derde = type === 'congruent' && r.volgende() < 0.5 ? { punten: pa, s: s0 * 1.4, rot: rot3 } : { punten: po, s: s0 * anderFactor, rot: rot3 };
  const paar = [{ punten: pa, s: s0, rot: rot1 }, { punten: spiegel ? pa.map(([x, y]) => [-x, y]) : pa, s: s0 * factor, rot: rot2 }];
  if (paar.some(f => f.s * 2.4 > 175 || f.s < 18) || derde.s * 2.4 > 175) return null;
  const volgorde = r.schud([0, 1, 2]), lijst = [paar[0], paar[1], derde], ids = ['A', 'B', 'C'];
  const figuren = volgorde.map((v, i) => ({ id: ids[i], ...lijst[v] })), juist = [0, 1].map(v => ids[volgorde.indexOf(v)]).sort().join(' en ');
  const alle = ['A en B', 'A en C', 'B en C'];
  return mk(`Welke twee figuren zijn ${type === 'congruent' ? 'congruent (even groot en dezelfde vorm)' : 'gelijkvormig (dezelfde vorm)'}? Figuren ____`, figurenSvg(figuren), juist, alle.filter(x => x !== juist), `c${type}${basis.naam}${andere.naam}${volgorde.join('')}${rot1}.${rot2}.${rot3}${factor}`, 4, { ...data, goed: juist, jaar });
};
export const CONGRUENTIE_VORMEN = maakOpgaveVormen({
  id: 'cng', titel: 'Congruent, gelijkvormig en schaal', doelen: AUTO_DOELEN.cng || [], parameters: K.congruentieParameters, standaard: { types: ['congruent'], jaar: 4 },
  opdracht: opdracht('Kijk naar de figuren. Vul aan op de lijn.', 'Kijk naar de figuren. Kies het juiste antwoord. Omcirkel.'), opgave: congOpgave, schaal: 1.2,
});
void transformeer;

export const AUTO_MEETKUNDE2_VORMEN = [...TRANSFORMATIE_VORMEN, TEKEN_SPIEGELEN, TEKEN_VERSCHUIVEN, TEKEN_DRAAIEN, TEKEN_VERGROTEN, ...SYMMETRIE_VORMEN, TEKEN_ASSEN, ...PATROON_VORMEN, ...PLAATS_VORMEN, ...CONGRUENTIE_VORMEN];
