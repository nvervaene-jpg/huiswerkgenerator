// Meetkunde: vlakke figuren en ruimtefiguren herkennen en beschrijven, hoeken, twee lijnen, soorten driehoeken, uitspraken over figuren en logica met verzamelingen.
// De tekeningen komen uit ../meetkunde-svg.js; een test meet ze opnieuw op. De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import * as S from '../meetkunde-svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const getalFouten = (a, extra = []) => [...extra, a + 1, a - 1, a + 2, a - 2].filter(x => x >= 0);
const PASTEL = ['#bbdefb', '#c8e6c9', '#ffe0b2', '#f8bbd0', '#e1bee7', '#fff9c4'];
const volgende = (r) => () => r.volgende();

/* ------------------------------------------------------------------ vlakke figuren */
export const FIGUREN_PER_JAAR = (jaar) => (jaar <= 2 ? ['cirkel', 'driehoek', 'rechthoek', 'vierkant'] : jaar <= 4 ? ['cirkel', 'driehoek', 'rechthoek', 'vierkant', 'vijfhoek', 'zeshoek', 'vierhoek'] : jaar === 5 ? ['cirkel', 'driehoek', 'rechthoek', 'vierkant', 'vijfhoek', 'zeshoek', 'vierhoek', 'ruit', 'parallellogram', 'trapezium', 'vlieger'] : ['cirkel', 'driehoek', 'rechthoek', 'vierkant', 'vijfhoek', 'zeshoek', 'vierhoek', 'ruit', 'parallellogram', 'trapezium', 'vlieger', 'achthoek']);
const DRIEHOEK_SOORTEN = ['gelijkzijdig', 'gelijkbenig', 'ongelijkbenig', 'rechthoekig', 'stomphoekig', 'scherphoekig'];
const zijdeRichtingen = (p) => p.map((q, i) => { const n = p[(i + 1) % p.length]; return [n[0] - q[0], n[1] - q[1]]; });
const rechteHoeken = (p) => p.filter((q, i) => { const a = p[(i + p.length - 1) % p.length], c = p[(i + 1) % p.length]; return Math.abs(S.driehoekMaten([a, q, c]).hoeken[1] - 90) < 1.5; }).length;
const evenwijdigeParen = (p) => { const z = zijdeRichtingen(p); let t = 0; for (let i = 0; i < z.length; i++) for (let j = i + 1; j < z.length; j++) if (Math.abs(z[i][0] * z[j][1] - z[i][1] * z[j][0]) / (Math.hypot(...z[i]) * Math.hypot(...z[j])) < 0.01) t++; return t; };
const figOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, type = kies(r, p.types), set = FIGUREN_PER_JAAR(jaar);
  if (type === 'cirkel') {
    const straal = r.geheel(2, 12), soort = kies(r, ['straal-naar-diameter', 'diameter-naar-straal']);
    return soort === 'straal-naar-diameter' ? mk(`De straal van een cirkel is ${straal} cm. De diameter is ____ cm.`, null, straal * 2, getalFouten(straal * 2, [straal, straal * 3]), `ks${straal}`, 3, { mk: 'fig', soort: 'cirkel', straal, diameter: straal * 2, antwoordVan: 'diameter' }) : mk(`De diameter van een cirkel is ${straal * 2} cm. De straal is ____ cm.`, null, straal, getalFouten(straal, [straal * 2, straal * 4]), `kd${straal}`, 3, { mk: 'fig', soort: 'cirkel', straal, diameter: straal * 2, antwoordVan: 'straal' });
  }
  let naam = kies(r, type === 'naam' ? set : set.filter(x => x !== 'cirkel'));
  const rot = jaar <= 1 ? kies(r, [0, 0, 90]) : r.geheel(0, 23) * 15, s = r.geheel(40, 58), kleur = kies(r, PASTEL);
  let punten = null;
  if (naam === 'driehoek') punten = S.maakDriehoek(volgende(r), kies(r, DRIEHOEK_SOORTEN));
  if (naam === 'driehoek' && !punten) return null;
  const svg = S.vlakFiguur(naam, { rot, s, kleur, punten });
  const pts = punten || S.VORM_PUNTEN[naam], n = naam === 'cirkel' ? 0 : pts.length, data = { mk: 'fig', soort: type, naam, rot };
  const kern = `${type}${naam}${rot}${s}`;
  if (type === 'naam') return mk('Dit is een ____.', svg, naam, set.filter(x => x !== naam), kern, 1, data);
  if (type === 'zijden') return mk('Deze figuur heeft ____ zijden.', svg, n, getalFouten(n, [n * 2]), kern, 2, data);
  if (type === 'hoeken') return mk('Deze figuur heeft ____ hoeken.', svg, n, getalFouten(n, [n * 2]), kern, 2, data);
  if (type === 'rechte') { const a = rechteHoeken(pts); return mk('Deze figuur heeft ____ rechte hoeken.', svg, a, getalFouten(a, [n]), kern, 3, data); }
  if (type === 'evenwijdig') { const a = evenwijdigeParen(pts); return mk('Deze figuur heeft ____ paren evenwijdige zijden.', svg, a, getalFouten(a, [n]), kern, 4, data); }
  const a = (n * (n - 3)) / 2;
  return mk('Deze figuur heeft ____ diagonalen.', svg, a, getalFouten(a, [n, n - 3]), kern, 4, data);
};
export const FIGUUR_VORMEN = maakOpgaveVormen({
  id: 'fig', titel: 'Vlakke figuren', doelen: AUTO_DOELEN.fig || [], parameters: K.figuurParameters, standaard: { types: ['naam', 'zijden', 'hoeken'], jaar: 3 },
  opdracht: opdracht('Kijk naar de figuur. Vul aan op de lijn.', 'Kijk naar de figuur. Kies het juiste antwoord. Omcirkel.'), opgave: figOpgave, schaal: 1.6, 
});

/* ------------------------------------------------------------------ ruimtefiguren */
export const RUIMTE_FEITEN = { kubus: { vlakken: 6, ribben: 12, hoekpunten: 8, oppervlak: 'vlak' }, balk: { vlakken: 6, ribben: 12, hoekpunten: 8, oppervlak: 'vlak' }, piramide: { vlakken: 5, ribben: 8, hoekpunten: 5, oppervlak: 'vlak' }, driehoeksprisma: { vlakken: 5, ribben: 9, hoekpunten: 6, oppervlak: 'vlak' }, cilinder: { oppervlak: 'vlak en gebogen' }, kegel: { oppervlak: 'vlak en gebogen' }, bol: { oppervlak: 'gebogen' } };
const ruimteOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, type = kies(r, p.types), set = ['kubus', 'balk', 'bol', 'piramide', 'kegel', ...(jaar >= 3 ? ['cilinder'] : []), ...(jaar >= 5 ? ['driehoeksprisma'] : [])];
  if (type === 'naam') { const n = kies(r, set); return mk('Dit is een ____.', S.ruimteFiguur(n), n, set.filter(x => x !== n), `rn${n}`, 1, { mk: 'rfg', soort: type, naam: n }); }
  if (type === 'tellen') { const n = kies(r, ['kubus', 'balk', 'piramide', 'driehoeksprisma']), w = kies(r, ['vlakken', 'ribben', 'hoekpunten']), a = RUIMTE_FEITEN[n][w]; return mk(`Deze figuur heeft ____ ${w}.`, S.ruimteFiguur(n), a, getalFouten(a, [a * 2]), `rt${n}${w}`, 4, { mk: 'rfg', soort: type, naam: n, wat: w }); }
  const n = kies(r, set), a = RUIMTE_FEITEN[n].oppervlak;
  return mk('Het oppervlak van deze figuur is ____. (vlak, gebogen of vlak en gebogen)', S.ruimteFiguur(n), a, ['vlak', 'gebogen', 'vlak en gebogen'], `ro${n}`, 3, { mk: 'rfg', soort: type, naam: n });
};
export const RUIMTE_VORMEN = maakOpgaveVormen({
  id: 'rfg', titel: 'Ruimtefiguren', doelen: AUTO_DOELEN.rfg || [], parameters: K.ruimteParameters, standaard: { types: ['naam'], jaar: 3 },
  opdracht: opdracht('Kijk naar de ruimtefiguur. Vul aan op de lijn.', 'Kijk naar de ruimtefiguur. Kies het juiste antwoord. Omcirkel.'), opgave: ruimteOpgave, schaal: 1.6,
});

/* ------------------------------------------------------------------ hoeken */
export const hoekSoort = (g) => (g < 90 ? 'scherp' : g === 90 ? 'recht' : g < 180 ? 'stomp' : 'gestrekt');
const HOEK_WAARDEN = (jaar) => [...Array.from({ length: 15 }, (_, i) => 10 + i * 5), 90, ...Array.from({ length: 16 }, (_, i) => 95 + i * 5), ...(jaar >= 6 ? [180] : [])];
const hoekOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, type = kies(r, p.types), waarden = HOEK_WAARDEN(jaar), soorten = jaar >= 6 ? ['scherp', 'recht', 'stomp', 'gestrekt'] : ['scherp', 'recht', 'stomp'];
  if (type === 'vergelijk') {
    const a = kies(r, waarden.filter(x => x < 180)), b = kies(r, waarden.filter(x => x < 180 && Math.abs(x - a) >= 20)); if (!b) return null;
    const ra = r.geheel(0, 35) * 10, rb = r.geheel(0, 35) * 10, l = S.hoekFiguur(a, ra), rr = S.hoekFiguur(b, rb);
    const svg = { markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="460" height="210" font-family="Arial, Helvetica, sans-serif">${l.markup.replace('<svg ', '<svg x="0" y="20" ')}${rr.markup.replace('<svg ', '<svg x="240" y="20" ')}<text x="20" y="22" font-size="20" font-weight="bold" fill="#111">A</text><text x="260" y="22" font-size="20" font-weight="bold" fill="#111">B</text></svg>`, breedte: 460, hoogte: 210 };
    return mk('Welke hoek is het grootst? Hoek ____ (A of B).', svg, a > b ? 'A' : 'B', [a > b ? 'B' : 'A'], `hv${a}.${b}.${ra}.${rb}`, 3, { mk: 'hoe', soort: type, a, b });
  }
  const g = kies(r, type === 'soort' ? waarden : jaar >= 5 ? [...waarden, 89, 91, 1, 179] : waarden), rot = r.geheel(0, 35) * 10;
  if (type === 'soort' && g >= 180 && g !== 180) return null;
  const opties = soorten.join(', ').replace(/, ([a-z]+)$/, ' of $1');
  if (type === 'soort') return mk(`Deze hoek is ____. (${opties})`, S.hoekFiguur(g, rot), hoekSoort(g), soorten.filter(x => x !== hoekSoort(g)), `hs${g}.${rot}`, 2, { mk: 'hoe', soort: type, graden: g, rot });
  return mk(`Een hoek van ${g}° is ____. (${opties})`, null, hoekSoort(g), soorten.filter(x => x !== hoekSoort(g)), `hg${g}`, 3, { mk: 'hoe', soort: type, graden: g });
};
export const HOEK_VORMEN = maakOpgaveVormen({
  id: 'hoe', titel: 'Hoeken', doelen: AUTO_DOELEN.hoe || [], parameters: K.hoekParameters, standaard: { types: ['soort'], jaar: 4 },
  opdracht: opdracht('Kijk naar de hoek. Vul aan op de lijn.', 'Kijk naar de hoek. Kies het juiste antwoord. Omcirkel.'), opgave: hoekOpgave, schaal: 1.6,
});

/* ------------------------------------------------------------------ twee lijnen */
const lijnenOpgave = (r, p) => {
  const type = kies(r, p.types);
  if (type === 'teken') { const s = kies(r, [['evenwijdig', '∥'], ['loodrecht', '⊥']]), omgekeerd = r.volgende() < 0.5; return omgekeerd ? mk(`De rechten a en b liggen ${s[0]}. Het teken is ____. (∥ of ⊥)`, null, s[1], ['∥', '⊥'].filter(x => x !== s[1]), `lt${s[0]}`, 3, { mk: 'lij', soort: type, ligging: s[0], teken: s[1] }) : mk(`Het teken ${s[1]} betekent ____. (evenwijdig of loodrecht)`, null, s[0], ['evenwijdig', 'loodrecht'].filter(x => x !== s[0]), `lu${s[0]}`, 3, { mk: 'lij', soort: type, ligging: s[0], teken: s[1], omgekeerd: true }); }
  const soort = kies(r, ['evenwijdig', 'loodrecht', 'snijdend']), rot = r.geheel(0, 17) * 10, hoek = kies(r, [30, 40, 50, 60, 120, 130]);
  return mk('Deze twee lijnen liggen ____. (evenwijdig, loodrecht of snijdend)', S.tweeLijnen(soort, rot, hoek), soort, ['evenwijdig', 'loodrecht', 'snijdend'].filter(x => x !== soort), `ll${soort}${rot}${hoek}`, 2, { mk: 'lij', soort: 'soort', ligging: soort, rot });
};
export const LIJNEN_VORMEN = maakOpgaveVormen({
  id: 'lij', titel: 'Evenwijdig, loodrecht of snijdend', doelen: AUTO_DOELEN.lij || [], parameters: K.lijnenParameters, standaard: { types: ['soort'], jaar: 4 },
  opdracht: opdracht('Kijk naar de lijnen. Vul aan op de lijn.', 'Kijk naar de lijnen. Kies het juiste antwoord. Omcirkel.'), opgave: lijnenOpgave, schaal: 1.6,
});

/* ------------------------------------------------------------------ soorten driehoeken en regelmatige veelhoeken */
const zijdenSoort = (z) => { const g = (a, b) => Math.abs(a - b) / Math.max(a, b) < 0.02, n = (g(z[0], z[1]) ? 1 : 0) + (g(z[1], z[2]) ? 1 : 0) + (g(z[0], z[2]) ? 1 : 0); return n === 0 ? 'ongelijkbenig' : n === 1 ? 'gelijkbenig' : 'gelijkzijdig'; };
const hoekenSoort = (h) => (h.some(x => Math.abs(x - 90) < 1.5) ? 'rechthoekig' : h.some(x => x > 90) ? 'stomphoekig' : 'scherphoekig');
const driehoekOpgave = (r, p) => {
  const type = kies(r, p.types), rot = r.geheel(0, 23) * 15, s = r.geheel(40, 58), kleur = kies(r, PASTEL);
  if (type === 'regelmatig') {
    const reeel = r.volgende() < 0.5, naam = reeel ? kies(r, ['vierkant', 'vijfhoek', 'zeshoek', 'achthoek']) : kies(r, ['rechthoek', 'ruit', 'parallellogram', 'vierhoek', 'trapezium']);
    return mk('Deze veelhoek is ____. (regelmatig of onregelmatig)', S.vlakFiguur(naam, { rot, s, kleur }), reeel ? 'regelmatig' : 'onregelmatig', [reeel ? 'onregelmatig' : 'regelmatig'], `dv${naam}${rot}`, 4, { mk: 'drh', soort: type, naam });
  }
  const doel = type === 'zijden' ? kies(r, ['gelijkzijdig', 'gelijkbenig', 'ongelijkbenig']) : kies(r, ['rechthoekig', 'stomphoekig', 'scherphoekig']), punten = S.maakDriehoek(volgende(r), doel);
  if (!punten) return null;
  const m = S.driehoekMaten(punten), svg = S.vlakFiguur('driehoek', { rot, s, kleur, punten });
  if (type === 'zijden') { const a = `${zijdenSoort(m.zijden)}e driehoek`; return mk('Dit is een ____. (gelijkzijdige, gelijkbenige of ongelijkbenige driehoek)', svg, a, ['gelijkzijdige driehoek', 'gelijkbenige driehoek', 'ongelijkbenige driehoek'].filter(x => x !== a), `dz${doel}${rot}${s}`, 3, { mk: 'drh', soort: type, doel }); }
  const a = `${hoekenSoort(m.hoeken)}e driehoek`;
  return mk('Dit is een ____. (rechthoekige, stomphoekige of scherphoekige driehoek)', svg, a, ['rechthoekige driehoek', 'stomphoekige driehoek', 'scherphoekige driehoek'].filter(x => x !== a), `dh${doel}${rot}${s}`, 3, { mk: 'drh', soort: type, doel });
};
export const DRIEHOEK_VORMEN = maakOpgaveVormen({
  id: 'drh', titel: 'Soorten driehoeken', doelen: AUTO_DOELEN.drh || [], parameters: K.driehoekParameters, standaard: { types: ['zijden', 'hoeken'], jaar: 4 },
  opdracht: opdracht('Kijk naar de figuur. Vul aan op de lijn.', 'Kijk naar de figuur. Kies het juiste antwoord. Omcirkel.'), opgave: driehoekOpgave, schaal: 1.6,
});

/* ------------------------------------------------------------------ uitspraken over figuren: juist of fout */
const ELK = { vierkant: 'Elk', parallellogram: 'Elk', trapezium: 'Elk', rechthoek: 'Elke', ruit: 'Elke', driehoek: 'Elke', vierhoek: 'Elke', zeshoek: 'Elke', vijfhoek: 'Elke', vlieger: 'Elke' };
export const OOK = [['vierkant', 'rechthoek', true], ['vierkant', 'ruit', true], ['rechthoek', 'parallellogram', true], ['ruit', 'parallellogram', true], ['vierkant', 'parallellogram', true], ['vierkant', 'vierhoek', true], ['rechthoek', 'vierhoek', true], ['rechthoek', 'vierkant', false], ['ruit', 'vierkant', false], ['ruit', 'rechthoek', false], ['parallellogram', 'rechthoek', false], ['rechthoek', 'ruit', false], ['driehoek', 'vierhoek', false], ['zeshoek', 'vijfhoek', false]];
export const DEFINITIES = [['rechthoek', 'vierhoek', 'vier rechte hoeken', true], ['vierkant', 'vierhoek', 'vier gelijke zijden en vier rechte hoeken', true], ['ruit', 'vierhoek', 'vier gelijke zijden', true], ['parallellogram', 'vierhoek', 'twee paar evenwijdige zijden', true], ['gelijkzijdige driehoek', 'driehoek', 'drie gelijke zijden', true], ['rechthoekige driehoek', 'driehoek', 'een rechte hoek', true], ['stomphoekige driehoek', 'driehoek', 'een stompe hoek', true], ['scherphoekige driehoek', 'driehoek', 'drie scherpe hoeken', true], ['zeshoek', 'veelhoek', 'zes zijden', true],
  ['ruit', 'vierhoek', 'vier rechte hoeken', false], ['rechthoek', 'vierhoek', 'vier gelijke zijden', false], ['scherphoekige driehoek', 'driehoek', 'een rechte hoek', false], ['vijfhoek', 'veelhoek', 'zes hoeken', false], ['parallellogram', 'vierhoek', 'vier rechte hoeken', false], ['gelijkzijdige driehoek', 'driehoek', 'een stompe hoek', false]];
export const EIGENSCHAPPEN = [['driehoeken', 'drie hoeken', true], ['rechthoeken', 'vier rechte hoeken', true], ['vierkanten', 'vier gelijke zijden', true], ['parallellogrammen', 'overstaande zijden die even lang zijn', true], ['vierhoeken', 'vier zijden', true], ['cirkels', 'een middelpunt', true], ['veelhoeken', 'minstens drie zijden', true], ['vierkanten', 'vier rechte hoeken', true],
  ['driehoeken', 'een rechte hoek', false], ['rechthoeken', 'vier gelijke zijden', false], ['ruiten', 'vier rechte hoeken', false], ['driehoeken', 'drie gelijke zijden', false], ['parallellogrammen', 'vier rechte hoeken', false]];
export const DIAGONALEN = [['rechthoek', 'zijn altijd even lang', true], ['vierkant', 'zijn altijd even lang', true], ['vierkant', 'staan altijd loodrecht op elkaar', true], ['ruit', 'staan altijd loodrecht op elkaar', true], ['rechthoek', 'snijden elkaar altijd in het midden', true], ['parallellogram', 'snijden elkaar altijd in het midden', true], ['ruit', 'snijden elkaar altijd in het midden', true],
  ['ruit', 'zijn altijd even lang', false], ['parallellogram', 'zijn altijd even lang', false], ['rechthoek', 'staan altijd loodrecht op elkaar', false], ['parallellogram', 'staan altijd loodrecht op elkaar', false]];
const uitspraakOpgave = (r, p) => {
  const type = kies(r, p.types);
  let zin, waar, data;
  if (type === 'ook') { const [a, b, w] = kies(r, OOK); zin = `${ELK[a]} ${a} is een ${b}.`; waar = w; data = { a, b }; }
  else if (type === 'definitie') { const [x, basis, y, w] = kies(r, DEFINITIES); zin = `Een ${x} is een ${basis} met ${y}.`; waar = w; data = { x, basis, y }; }
  else if (type === 'eigenschap') { const [x, y, w] = kies(r, EIGENSCHAPPEN); zin = `Alle ${x} hebben ${y}.`; waar = w; data = { x, y }; }
  else { const [x, y, w] = kies(r, DIAGONALEN); zin = `De diagonalen van een ${x} ${y}.`; waar = w; data = { x, y }; }
  return mk(`${zin} Dit is ____. (juist of fout)`, null, waar ? 'juist' : 'fout', [waar ? 'fout' : 'juist'], `u${zin}`, 3, { mk: 'upr', soort: type, zin, ...data });
};
export const UITSPRAAK_VORMEN = maakOpgaveVormen({
  id: 'upr', titel: 'Uitspraken over figuren', doelen: AUTO_DOELEN.upr || [], parameters: K.uitspraakParameters, standaard: { types: ['ook', 'eigenschap'], jaar: 5 },
  opdracht: opdracht('Lees de uitspraak. Is ze juist of fout? Schrijf het op de lijn.', 'Lees de uitspraak. Is ze juist of fout? Omcirkel.'), opgave: uitspraakOpgave,
});

/* ------------------------------------------------------------------ logica en verzamelingen met gekleurde figuren */
const VORMEN = ['cirkel', 'vierkant', 'driehoek'], VORM_MV = { cirkel: 'cirkels', vierkant: 'vierkanten', driehoek: 'driehoeken' };
const KLEUR_ADJ = { rood: 'rode', blauw: 'blauwe', geel: 'gele', groen: 'groene' };
const critTekst = (c) => (c.kleur && c.vorm ? `${KLEUR_ADJ[c.kleur]} ${VORM_MV[c.vorm]}` : c.kleur ? `${KLEUR_ADJ[c.kleur]} figuren` : VORM_MV[c.vorm]);
const critWoord = (c) => (c.kleur && c.vorm ? `${c.kleur} en een ${c.vorm}` : c.kleur ? c.kleur : `een ${c.vorm}`);
export const voldoet = (f, c) => (c.kleur ? f.kleur === c.kleur : true) && (c.vorm ? f.vorm === c.vorm : true);
const maakFiguren = (r, jaar) => {
  const n = jaar <= 1 ? 6 : jaar <= 3 ? 8 : 10, kleuren = r.schud(S.KLEUREN_NAMEN).slice(0, jaar <= 1 ? 2 : 3), vormen = r.schud(VORMEN).slice(0, jaar <= 1 ? 2 : 3);
  return Array.from({ length: n }, () => ({ vorm: kies(r, vormen), kleur: kies(r, kleuren) }));
};
const logicaOpgave = (r, p) => {
  const jaar = p.jaar ?? 4, type = kies(r, p.types), figuren = maakFiguren(r, jaar), n = figuren.length;
  const kleuren = [...new Set(figuren.map(f => f.kleur))], vormen = [...new Set(figuren.map(f => f.vorm))];
  const crit = () => { const k = r.volgende(); return k < 0.4 ? { kleur: kies(r, kleuren) } : k < 0.7 ? { vorm: kies(r, vormen) } : { kleur: kies(r, kleuren), vorm: kies(r, vormen) }; };
  if (type === 'venn') {
    const a = kies(r, kleuren), b = kies(r, vormen), cnt = { alleenA: 0, beide: 0, alleenB: 0, buiten: 0 };
    figuren.forEach(f => { const x = f.kleur === a, y = f.vorm === b; cnt[x && y ? 'beide' : x ? 'alleenA' : y ? 'alleenB' : 'buiten']++; });
    const gebied = kies(r, ['beide', 'alleenA', 'alleenB', 'buiten']), antw = cnt[gebied];
    const tekst = { beide: `${a} en een ${b}`, alleenA: `${a}, maar geen ${b}`, alleenB: `een ${b}, maar niet ${a}`, buiten: `niet ${a} en ook geen ${b}` }[gebied];
    return mk(`In het venndiagram zitten ${n} figuren. Hoeveel figuren zijn ${tekst}? ____`, S.venn(a, `${b}`, cnt), antw, getalFouten(antw, [n - antw]), `v${a}${b}${Object.values(cnt).join('.')}${gebied}`, 4, { mk: 'log', soort: type, a, b, cnt, gebied, n });
  }
  const svg = S.figurenRij(figuren);
  if (type === 'behoort') {
    const c = crit(), i = r.geheel(0, n - 1), f = figuren[i], j = voldoet(f, c);
    return mk(`Behoort figuur ${String.fromCharCode(65 + i)} tot de verzameling van de ${critTekst(c)}? ____ (ja of nee)`, svg, j ? 'ja' : 'nee', [j ? 'nee' : 'ja'], `b${i}${JSON.stringify(c)}${figuren.map(x => x.vorm[0] + x.kleur[0]).join('')}`, 2, { mk: 'log', soort: type, c, i, figuren });
  }
  if (type === 'alsdan') {
    const a = crit(), b = r.volgende() < 0.5 ? { kleur: kies(r, kleuren) } : { vorm: kies(r, vormen) };
    if (a.kleur === b.kleur && a.vorm === b.vorm) return null;
    const klopt = figuren.every(f => !voldoet(f, a) || voldoet(f, b));
    return mk(`Als een figuur ${critWoord(a)} is, dan is hij ${b.kleur ? b.kleur : `een ${b.vorm}`}. Klopt dit voor alle figuren hierboven? ____ (ja of nee)`, svg, klopt ? 'ja' : 'nee', [klopt ? 'nee' : 'ja'], `a${JSON.stringify(a)}${JSON.stringify(b)}${figuren.map(x => x.vorm[0] + x.kleur[0]).join('')}`, 3, { mk: 'log', soort: type, a, b, figuren });
  }
  if (type === 'kwantor') {
    const soorten = jaar <= 3 ? ['alle', 'geen'] : jaar === 4 ? ['alle', 'geen', 'sommige', 'niet-alle'] : ['alle', 'geen', 'sommige', 'niet-alle', 'juist-een', 'minstens-twee', 'hoogstens-twee'];
    const q = kies(r, soorten), c = crit(), cnt = figuren.filter(f => voldoet(f, c)).length;
    if (q === 'sommige' && !(cnt >= 1 && cnt < n) && cnt !== 0) return null;
    const waar = { alle: cnt === n, geen: cnt === 0, sommige: cnt >= 1 && cnt < n, 'niet-alle': cnt < n, 'juist-een': cnt === 1, 'minstens-twee': cnt >= 2, 'hoogstens-twee': cnt <= 2 }[q];
    const zin = { alle: 'Alle figuren zijn', geen: 'Geen enkele figuur is', sommige: 'Sommige figuren zijn', 'niet-alle': 'Niet alle figuren zijn', 'juist-een': 'Juist één figuur is', 'minstens-twee': 'Ten minste twee figuren zijn', 'hoogstens-twee': 'Ten hoogste twee figuren zijn' }[q];
    const wat = c.kleur && c.vorm ? `een ${c.kleur} ${c.vorm}` : c.kleur ? c.kleur : `een ${c.vorm}`;
    return mk(`${zin} ${wat}. Deze uitspraak is ____. (waar of niet waar)`, svg, waar ? 'waar' : 'niet waar', [waar ? 'niet waar' : 'waar'], `k${q}${JSON.stringify(c)}${figuren.map(x => x.vorm[0] + x.kleur[0]).join('')}`, 3, { mk: 'log', soort: type, q, c, figuren });
  }
  // sorteren volgens één of twee criteria: tellen
  const c = crit(), jaarKeuze = jaar <= 2 ? ['enkel'] : jaar === 3 ? ['enkel', 'niet'] : ['enkel', 'niet', 'of'], w = kies(r, jaarKeuze);
  let c2 = null;
  if (w === 'of') { c2 = r.volgende() < 0.5 ? { kleur: kies(r, kleuren) } : { vorm: kies(r, vormen) }; if (c.kleur && c2.kleur || c.vorm && c2.vorm && !c.kleur) return null; }
  const telt = figuren.filter(f => (w === 'niet' ? !voldoet(f, c) : w === 'of' ? voldoet(f, c) || voldoet(f, c2) : voldoet(f, c))).length;
  const wat = w === 'niet' ? `niet ${critWoord(c)}` : w === 'of' ? `${critWoord(c)} of ${critWoord(c2)}` : critWoord(c);
  return mk(`Hoeveel figuren zijn ${wat}? ____`, svg, telt, getalFouten(telt, [n - telt]), `s${w}${JSON.stringify(c)}${JSON.stringify(c2)}${figuren.map(x => x.vorm[0] + x.kleur[0]).join('')}`, 2, { mk: 'log', soort: type, w, c, c2, figuren });
};
export const LOGICA_VORMEN = maakOpgaveVormen({
  id: 'log', titel: 'Sorteren en verzamelingen', doelen: AUTO_DOELEN.log || [], parameters: K.logicaParameters, standaard: { types: ['sorteer', 'behoort'], jaar: 3 },
  opdracht: opdracht('Kijk naar de figuren. Vul aan op de lijn.', 'Kijk naar de figuren. Kies het juiste antwoord. Omcirkel.'), opgave: logicaOpgave, schaal: 1.4,
});

export const AUTO_MEETKUNDE_VORMEN = [...FIGUUR_VORMEN, ...RUIMTE_VORMEN, ...HOEK_VORMEN, ...LIJNEN_VORMEN, ...DRIEHOEK_VORMEN, ...UITSPRAAK_VORMEN, ...LOGICA_VORMEN];
