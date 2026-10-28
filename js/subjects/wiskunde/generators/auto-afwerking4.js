// Meetkunde, laatste families: pictogrammen met een richting, oriënteren, een ander gezichtspunt, een plattegrond, opdelen en samenstellen
// van vlakke figuren en de lengte van een gebroken lijn. De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { pijlBord, plattegrond, gebrokenLijn } from '../meetkunde-afwerking-svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && !(typeof x === 'number' && (x < 0 || !Number.isFinite(x))) && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const NAMEN = ['Mila', 'Lars', 'Noor', 'Sam', 'Emma', 'Tom', 'Lotte', 'Jens'];

/* ------------------------------------------------------------------ pictogrammen met een richting */
const RICHTINGEN = ['links', 'rechts', 'omhoog', 'omlaag'], SCHUIN = ['linksboven', 'rechtsboven', 'linksonder', 'rechtsonder'];
const pictogramOpgave = (r, p) => {
  const lijst = (p.jaar ?? 1) >= 2 ? [...RICHTINGEN, ...SCHUIN] : RICHTINGEN, richting = kies(r, lijst);
  return mk('Welke richting wijst de pijl op het bord aan? ____', pijlBord(richting), richting, lijst.filter(x => x !== richting), `pg${richting}`, richting.length > 6 ? 2 : 1, { richting });
};
export const PICTOGRAM_VORMEN = maakOpgaveVormen({
  id: 'ptg', titel: 'Een pijl op een bord lezen', doelen: AUTO_DOELEN.ptg || [], parameters: K.pictogramParameters, standaard: { jaar: 1 },
  opdracht: opdracht('Kijk naar het bord. Schrijf de richting op de lijn.'), opgave: pictogramOpgave,
});

/* ------------------------------------------------------------------ oriënteren: positie, afstand en richting in een rij */
const oriënterenOpgave = (r) => {
  const rij = r.schud(NAMEN).slice(0, 5), tekst = `In de rij staan van links naar rechts: ${rij.join(', ')}.`, soort = kies(r, ['rechts', 'links', 'tussen', 'afstand']);
  if (soort === 'rechts') { const i = r.geheel(0, 3); return mk(`${tekst} Wie staat direct rechts van ${rij[i]}? ____`, null, rij[i + 1], rij.filter((_, j) => j !== i + 1 && j !== i), `or-r${rij.join()}.${i}`, 1, { soort, rij, i }); }
  if (soort === 'links') { const i = r.geheel(1, 4); return mk(`${tekst} Wie staat direct links van ${rij[i]}? ____`, null, rij[i - 1], rij.filter((_, j) => j !== i - 1 && j !== i), `or-l${rij.join()}.${i}`, 1, { soort, rij, i }); }
  if (soort === 'tussen') { const i = r.geheel(0, 2); return mk(`${tekst} Wie staat tussen ${rij[i]} en ${rij[i + 2]}? ____`, null, rij[i + 1], rij.filter((_, j) => j !== i + 1 && j !== i && j !== i + 2).concat([rij[i], rij[i + 2]]), `or-t${rij.join()}.${i}`, 2, { soort, rij, i }); }
  const i = r.geheel(0, 1), j = r.geheel(i + 2, 4);
  return mk(`${tekst} Hoeveel kinderen staan er tussen ${rij[i]} en ${rij[j]}? ____`, null, j - i - 1, [j - i, j - i + 1, j - i - 2, i + 1], `or-a${rij.join()}.${i}.${j}`, 2, { soort, rij, i, j });
};
export const ORIËNTEREN_VORMEN = maakOpgaveVormen({
  id: 'ori', titel: 'Oriënteren: links, rechts en tussen', doelen: AUTO_DOELEN.ori || [], parameters: K.oriënterenParameters, standaard: { jaar: 1 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: oriënterenOpgave,
});

/* ------------------------------------------------------------------ een ander gezichtspunt */
const OBJECTEN = [['de boom', 'het huis'], ['de auto', 'de garage'], ['de fiets', 'de schuur'], ['de bal', 'de doos']];
const gezichtspuntOpgave = (r) => {
  if (r.volgende() < 0.5) {
    const [a, b] = r.schud(NAMEN).slice(0, 2), links = r.volgende() < 0.5;
    return mk(`Gezien vanaf het bord zit ${a} ${links ? 'links' : 'rechts'} van ${b}. Gezien vanaf de achterkant van de klas zit ${a} ____ van ${b}.`, null, links ? 'rechts' : 'links', [links ? 'links' : 'rechts', 'voor', 'achter'], `gp-l${a}.${b}.${links}`, 2, { soort: 'lr', a, b, links });
  }
  const [x, y] = kies(r, OBJECTEN), voor = r.volgende() < 0.5;
  return mk(`Gezien vanaf de straat staat ${x} ${voor ? 'voor' : 'achter'} ${y}. Gezien vanaf de tuin aan de andere kant staat ${x} ____ ${y}.`, null, voor ? 'achter' : 'voor', [voor ? 'voor' : 'achter', 'links van', 'rechts van'], `gp-v${x}.${y}.${voor}`, 2, { soort: 'va', x, y, voor });
};
export const GEZICHTSPUNT_VORMEN = maakOpgaveVormen({
  id: 'ogp', titel: 'Vanuit een ander gezichtspunt', doelen: AUTO_DOELEN.ogp || [], parameters: K.gezichtspuntParameters, standaard: { jaar: 2 },
  opdracht: opdracht('Stel je voor dat je aan de andere kant staat. Schrijf op wat je ziet.'), opgave: gezichtspuntOpgave,
});

/* ------------------------------------------------------------------ plattegrond van de klas */
const KLASDINGEN = ['kast', 'tafel', 'deur', 'bord', 'plant', 'raam', 'computer', 'kapstok'];
const VAKKEN = [].concat(...[1, 2, 3, 4].map(rij => 'ABCDE'.split('').map(k => `${k}${rij}`)));
const plattegrondOpgave = (r) => {
  const dingen = r.schud(KLASDINGEN).slice(0, 5), vakken = r.schud(VAKKEN).slice(0, 5), items = dingen.map((naam, i) => ({ naam, vak: vakken[i] })), i = r.geheel(0, 4);
  if (r.volgende() < 0.5) return mk(`Wat staat er in vak ${items[i].vak} van de plattegrond? ____`, plattegrond(items), items[i].naam, dingen.filter((_, j) => j !== i), `pl-w${items.map(x => x.naam + x.vak).join()}.${i}`, 1, { soort: 'wat', items, i });
  return mk(`In welk vak van de plattegrond staat de ${items[i].naam}? ____`, plattegrond(items), items[i].vak, VAKKEN.filter(v => v !== items[i].vak && !vakken.slice(0, 5).includes(v)).slice(0, 3).concat(vakken.filter((_, j) => j !== i).slice(0, 2)), `pl-v${items.map(x => x.naam + x.vak).join()}.${i}`, 2, { soort: 'waar', items, i });
};
export const PLATTEGROND_VORMEN = maakOpgaveVormen({
  id: 'plg', titel: 'Een plattegrond lezen', doelen: AUTO_DOELEN.plg || [], parameters: K.plattegrondParameters, standaard: { jaar: 2 },
  opdracht: opdracht('Kijk naar de plattegrond. Schrijf het antwoord op de lijn.'), opgave: plattegrondOpgave,
});

/* ------------------------------------------------------------------ vlakke figuren opdelen en samenstellen */
const opdelenOpgave = (r) => {
  const soort = kies(r, ['diagonaal', 'kruis', 'rij', 'zijde']);
  if (soort === 'diagonaal') { const f = kies(r, ['vierkant', 'rechthoek']); return mk(`Je knipt een ${f} langs een diagonaal in twee stukken. Je krijgt ____ driehoeken.`, null, 2, [3, 4, 1], `od-d${f}`, 1, { soort, f }); }
  if (soort === 'kruis') return mk('Je verdeelt een vierkant met twee rechte lijnen door het midden in gelijke delen. Je krijgt ____ kleine vierkanten.', null, 4, [2, 3, 6, 8], 'od-k', 1, { soort });
  if (soort === 'rij') { const rijen = r.geheel(2, 5), k = r.geheel(2, 6); return mk(`Een rechthoek bestaat uit ${rijen} rijen van ${k} gelijke vierkantjes. Hoeveel vierkantjes zijn dat samen? ____`, null, rijen * k, [rijen + k, rijen * k + k, rijen * k - rijen, rijen * (k + 1)], `od-r${rijen}.${k}`, 2, { soort, rijen, k }); }
  const z = r.geheel(2, 5);
  return mk(`Je legt ${z * z} gelijke vierkantjes tegen elkaar tot één groot vierkant. Hoeveel vierkantjes liggen er langs één zijde? ____`, null, z, [z * z, z + 1, z - 1, z * 2], `od-z${z}`, 3, { soort, z });
};
export const OPDELEN_VORMEN = maakOpgaveVormen({
  id: 'opd', titel: 'Figuren opdelen en samenstellen', doelen: AUTO_DOELEN.opd || [], parameters: K.opdelenParameters, standaard: { jaar: 2 },
  opdracht: opdracht('Lees goed. Denk aan de figuur. Schrijf het antwoord op de lijn.'), opgave: opdelenOpgave,
});

/* ------------------------------------------------------------------ de lengte van een gebroken lijn */
const gebrokenOpgave = (r) => {
  const n = r.geheel(3, 4), lengtes = Array.from({ length: n }, () => r.geheel(2, 9)), som = lengtes.reduce((a, b) => a + b, 0);
  return mk('De gebroken lijn bestaat uit stukken. Hoe lang is de hele lijn? ____ cm', gebrokenLijn(lengtes), som, [som + 1, som - 1, lengtes[0], Math.max(...lengtes) * n], `gl${lengtes.join('.')}`, 2, { lengtes, som });
};
export const GEBROKEN_LIJN_VORMEN = maakOpgaveVormen({
  id: 'glj', titel: 'De lengte van een gebroken lijn', doelen: AUTO_DOELEN.glj || [], parameters: K.gebrokenLijnParameters, standaard: { jaar: 3 }, pictogram: 'meten',
  opdracht: opdracht('Tel de lengtes van de stukken op. Schrijf het antwoord op de lijn.'), opgave: gebrokenOpgave,
});

export const AUTO_AFWERKING4_VORMEN = [...PICTOGRAM_VORMEN, ...ORIËNTEREN_VORMEN, ...GEZICHTSPUNT_VORMEN, ...PLATTEGROND_VORMEN, ...OPDELEN_VORMEN, ...GEBROKEN_LIJN_VORMEN];
