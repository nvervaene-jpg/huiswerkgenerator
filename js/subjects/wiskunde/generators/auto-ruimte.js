// Ruimtelijke begrippen en blokkenbouwsels: aanzichten, projectie, vaste verhouding, de ontvouwing van een kegel, volumeformules,
// 3D en 2D (schaal op een kaart) en tellen met een grondplan. De zinnen zijn door de bouwer geschreven.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { grondplanBlokken } from '../meetkunde-afwerking-svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && !(typeof x === 'number' && (x < 0 || !Number.isFinite(x))) && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const opdracht = (invullen) => ({ invullen, kiezen: 'Lees goed. Kies het juiste antwoord. Omcirkel.', 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });

const BANK = {
  aanzicht: [
    ['Je kijkt van boven naar een gebouw. Wat je dan ziet, is het ____', 'bovenaanzicht', ['vooraanzicht', 'zijaanzicht']],
    ['Je kijkt van voren naar een gebouw. Wat je dan ziet, is het ____', 'vooraanzicht', ['bovenaanzicht', 'zijaanzicht']],
    ['Je kijkt van opzij naar een gebouw. Wat je dan ziet, is het ____', 'zijaanzicht', ['bovenaanzicht', 'vooraanzicht']],
    ['Het grondplan van een gebouw is de tekening van het gebouw gezien van ____', 'boven', ['voren', 'opzij']],
    ['Het bovenaanzicht van een kubus is een ____', 'vierkant', ['driehoek', 'cirkel']],
    ['Het bovenaanzicht van een rechtopstaande cilinder is een ____', 'cirkel', ['rechthoek', 'driehoek']],
    ['Het vooraanzicht van een rechtopstaande cilinder is een ____', 'rechthoek', ['cirkel', 'driehoek']],
  ],
  projectie: [
    ['Een aanzicht is een tekening op een plat vlak. Heeft die tekening een dikte? ____', 'nee', ['ja', 'soms']],
    ['Een kubus is 3D. Een aanzicht van de kubus is ____', '2D', ['3D', '1D']],
    ['Een foto van een voorwerp is 2D. Het voorwerp zelf is ____', '3D', ['2D', '1D']],
    ['Een bal is 3D. Het vooraanzicht van een bal is een cirkel. Een cirkel op papier is ____', '2D', ['3D', '1D']],
  ],
  kegel: [
    ['De ontvouwing van een kegel bestaat uit een cirkel en een ____', 'cirkelsector', ['rechthoek', 'driehoek']],
    ['De mantel van een kegel wordt ontvouwd tot een ____', 'cirkelsector', ['rechthoek', 'vierkant']],
    ['Een ontvouwing met een rechthoek en twee cirkels hoort bij een ____', 'cilinder', ['kegel', 'kubus']],
    ['Welke ontvouwing hoort bij een kegel? ____', 'een cirkel en een cirkelsector', ['twee cirkels en een rechthoek', 'zes vierkanten']],
  ],
  kaart: [
    ['Op een kaart ligt dorp A boven dorp B. Het noorden staat boven op de kaart. Dorp A ligt ten ____ van dorp B.', 'noorden', ['zuiden', 'oosten']],
    ['Op een kaart ligt dorp A rechts van dorp B. Het noorden staat boven op de kaart. Dorp A ligt ten ____ van dorp B.', 'oosten', ['westen', 'zuiden']],
    ['Een plattegrond is een tekening van een plaats gezien van ____', 'boven', ['voren', 'opzij']],
  ],
};
const ruimteBegrip = (r, p) => {
  if (p.soort === 'verhouding') {
    if (r.volgende() < 0.3) return mk('Een vaste verhouding blijft hetzelfde als je alles twee keer zo groot maakt. Klopt dat? ____', null, 'ja', ['nee', 'soms'], 'rb-vv', 2, { soort: 'verhouding', vast: true });
    const a = r.geheel(1, 3), b = r.geheel(2, 6), k = r.geheel(2, 5);
    return mk(`In een recept is de verhouding siroop : water gelijk aan ${a} : ${b}. Je gebruikt ${a * k} glazen siroop. Hoeveel glazen water heb je nodig? ____`, null, b * k, [b, a * k, a * k + b, b * k + a], `rb-v${a}.${b}.${k}`, 3, { soort: 'verhouding', a, b, k });
  }
  if (p.soort === 'prisma') {
    if (r.volgende() < 0.3) return mk('Het volume van een recht prisma is de oppervlakte van het grondvlak ____ de hoogte.', null, 'maal', ['plus', 'min'], 'rb-pf', 2, { soort: 'prisma', formule: true });
    const g = r.geheel(2, 12), h = r.geheel(2, 9);
    return mk(`Een recht prisma heeft een grondvlak van ${g} cm² en een hoogte van ${h} cm. Het volume is ____ cm³.`, null, g * h, [g + h, g * h + g, g * h - h, g * g], `rb-p${g}.${h}`, 3, { soort: 'prisma', g, h });
  }
  if (p.soort === 'kegelvolume') {
    if (r.volgende() < 0.3) return mk('Een kegel heeft hetzelfde grondvlak en dezelfde hoogte als een cilinder. Het volume van de kegel is ____ van het volume van de cilinder.', null, 'een derde', ['de helft', 'tweemaal'], 'rb-kf', 3, { soort: 'kegelvolume', formule: true });
    const k = r.geheel(2, 12), v = 3 * k * r.geheel(1, 5), vorm = kies(r, [['cilinder', 'kegel'], ['prisma', 'piramide']]);
    return mk(`Een ${vorm[0]} heeft een volume van ${v} cm³. Een ${vorm[1]} met hetzelfde grondvlak en dezelfde hoogte heeft een volume van ____ cm³.`, null, v / 3, [v / 2, v * 3, v - 3, v / 3 + 3], `rb-k${v}.${vorm[1]}`, 3, { soort: 'kegelvolume', v });
  }
  if (p.soort === 'kaart' && r.volgende() < 0.6) {
    const m = kies(r, [50, 100, 200, 500]), cm = r.geheel(2, 9);
    return mk(`Op een kaart is 1 cm gelijk aan ${m} m in het echt. Twee dorpen liggen ${cm} cm uit elkaar op de kaart. In het echt liggen ze ____ m uit elkaar.`, null, m * cm, [m + cm, m * cm * 10, m * cm / 10, cm], `rb-kc${m}.${cm}`, 3, { soort: 'kaart', m, cm });
  }
  const [v, a, f] = kies(r, BANK[p.soort]); return mk(v, null, a, f, `rb-${p.soort}-${v}`, 2, { soort: p.soort });
};
export const RUIMTE_BEGRIP_VORMEN = maakOpgaveVormen({
  id: 'rbg', titel: 'Aanzichten, schaal en volume', doelen: AUTO_DOELEN.rbg || [], parameters: K.ruimteBegripParameters, standaard: { soort: 'aanzicht' }, pictogram: 'meten',
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: ruimteBegrip,
});

/* ------------------------------------------------------------------ bouwsel van blokjes met een grondplan */
const bouwsel = (r, p) => {
  const R = p.jaar >= 6 ? 3 : 2 + r.geheel(0, 1), C = 3, h = Array.from({ length: R }, () => Array.from({ length: C }, () => (r.volgende() < 0.3 ? 0 : r.geheel(1, 3))));
  const cellen = h.flat(), totaal = cellen.reduce((a, b) => a + b, 0), bezet = cellen.filter(x => x > 0).length, hoogst = Math.max(...cellen);
  const voor = Array.from({ length: C }, (_, c) => Math.max(...h.map(rij => rij[c]))).reduce((a, b) => a + b, 0), zij = Array.from({ length: R }, (_, ri) => Math.max(...h[ri])).reduce((a, b) => a + b, 0);
  if (totaal === 0 || bezet < 3) return null;
  const soort = kies(r, ['totaal', 'bezet', 'hoogst', 'voor', 'zij']), svg = grondplanBlokken(h), sleutel = h.map(x => x.join('')).join('/');
  const tekst = { totaal: 'Hoeveel blokjes heeft het bouwsel in totaal?', bezet: 'In hoeveel vakjes staat een toren? (het bovenaanzicht)', hoogst: 'Hoeveel blokjes hoog is de hoogste toren?', voor: 'Hoeveel vierkantjes zie je in het vooraanzicht (kijk van de voorkant)?', zij: 'Hoeveel vierkantjes zie je in het zijaanzicht (kijk van links)?' }[soort];
  const antwoord = { totaal, bezet, hoogst, voor, zij }[soort];
  return mk(`Het grondplan toont hoeveel blokjes er op elkaar staan. ${tekst} ____`, svg, antwoord, [antwoord + 1, antwoord - 1, antwoord + 2, soort === 'voor' ? zij : voor, totaal !== antwoord ? totaal : bezet], `bb-${soort}.${sleutel}`, soort === 'voor' || soort === 'zij' ? 3 : 2, { soort, h, antwoord });
};
export const BLOKKENBOUWSEL_VORMEN = maakOpgaveVormen({
  id: 'bbs', titel: 'Een bouwsel met een grondplan', doelen: AUTO_DOELEN.bbs || [], parameters: K.blokkenbouwselParameters, standaard: { jaar: 4 }, pictogram: 'meten',
  opdracht: opdracht('Kijk naar het grondplan. Schrijf het antwoord op de lijn.'), opgave: bouwsel,
});

export const AUTO_RUIMTE_VORMEN = [...RUIMTE_BEGRIP_VORMEN, ...BLOKKENBOUWSEL_VORMEN];
