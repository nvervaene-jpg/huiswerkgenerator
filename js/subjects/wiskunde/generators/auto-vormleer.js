// Vormleer: lijnen, notaties, begrippen bij driehoek en parallellogram, en begrippen bij ruimtefiguren.
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import * as V from '../vorm-svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const HOEKEN = [0, 15, 30, -20, 45, -35];
const LETTERS = [['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['E', 'F', 'G', 'H'], ['K', 'L', 'M', 'N'], ['T', 'U', 'V', 'W']];
const RUIMTE = [
  ['Een kubus heeft 6 ____. (zijvlakken of ribben)', 'zijvlakken', ['ribben']], ['Een kubus heeft 12 ____. (ribben of zijvlakken)', 'ribben', ['zijvlakken']],
  ['Waar twee zijvlakken van een kubus samenkomen, zit een ____. (ribbe of grondvlak)', 'ribbe', ['grondvlak']], ['Een bol heeft een ____ oppervlak. (gebogen of vlak)', 'gebogen', ['vlak']],
  ['Een figuur met alleen vlakke zijvlakken, zoals een kubus, heet een ____. (veelvlak of cilinder)', 'veelvlak', ['cilinder', 'bol']], ['Het zijvlak waarop een figuur rust, noem je het ____. (grondvlak of ribbe)', 'grondvlak', ['ribbe']],
  ['Als je een kubus openvouwt en plat legt, krijg je een ____. (ontvouwing of ribbe)', 'ontvouwing', ['ribbe']], ['De ontvouwing van een kubus bestaat uit ____ vierkanten.', 6, [4, 8, 12]],
  ['Een cilinder heeft twee vlakke ____ en één gebogen oppervlak. (grondvlakken of ribben)', 'grondvlakken', ['ribben']],
];
const vormleerOpgave = (r, p) => {
  const soort = kies(r, p.types), data = { vorm2: 'vrm', soort };
  switch (soort) {
    case 'plr': { const w = kies(r, ['punt', 'lijn', 'rond']), hoek = kies(r, HOEKEN), t = { punt: 'punt', lijn: 'recht', rond: 'rond' }[w]; return mk('Wat zie je op de tekening? ____ (punt, lijn of rond)', V.lijnTekening(t, w === 'rond' ? 0 : hoek), w, ['punt', 'lijn', 'rond'], `pl${w}${w === 'rond' ? 0 : hoek}`, 1, { ...data, w, hoek }); }
    case 'rg': {
      if (r.volgende() < 0.5) { const g = r.volgende() < 0.5, hoek = kies(r, HOEKEN); return mk('Is deze lijn recht of gebogen? ____', V.lijnTekening(g ? 'gebogen' : 'recht', hoek), g ? 'gebogen' : 'recht', [g ? 'recht' : 'gebogen'], `rg${g}${hoek}`, 1, { ...data, wat: 'lijn', gebogen: g, hoek }); }
      const lijst = [['Een cirkel heeft een ____ rand. (recht of gebogen)', 'gebogen'], ['De rand van een vierkant bestaat uit ____ lijnen. (rechte of gebogen)', 'rechte'], ['De rand van een driehoek bestaat uit ____ lijnen. (rechte of gebogen)', 'rechte'], ['Een ei heeft een ____ rand. (rechte of gebogen)', 'gebogen']], i = r.geheel(0, 3);
      return mk(lijst[i][0], null, lijst[i][1], [lijst[i][1] === 'gebogen' ? (lijst[i][0].includes('recht of') ? 'recht' : 'rechte') : 'gebogen'], `rt${i}`, 2, { ...data, wat: 'tekst', i, goed: lijst[i][1] });
    }
    case 'lijnsoort': { const w = kies(r, ['rechte', 'lijnstuk', 'halfrechte', 'kromme']), hoek = kies(r, HOEKEN); return mk('Hoe heet deze lijn? ____', V.lijnTekening(w, w === 'kromme' ? 0 : hoek), w, ['rechte', 'lijnstuk', 'halfrechte', 'kromme'], `ls${w}${w === 'kromme' ? 0 : hoek}`, 2, { ...data, w, hoek }); }
    case 'notatie': {
      const L = kies(r, LETTERS), alles = p.focus === 'alles', v = alles ? r.geheel(0, 5) : r.geheel(0, 1);
      if (v === 0) return mk(`Een rechte noem je met een ____ letter, bijvoorbeeld de rechte a. (kleine of hoofdletter)`, null, 'kleine', ['hoofdletter'], `nt0.${L[0]}`, 1, { ...data, wat: 'rechte-naam' });
      if (v === 1) return mk('Welke naam hoort bij een rechte: A of a? ____', null, 'a', ['A'], 'nt1', 1, { ...data, wat: 'rechte-letter' });
      if (v === 2) return mk(`Welke naam hoort bij een punt: ${L[0]} of ${L[0].toLowerCase()}? ____`, null, L[0], [L[0].toLowerCase()], `nt2.${L[0]}`, 1, { ...data, wat: 'punt-letter', L });
      if (v === 3) return mk(`De halfrechte met beginpunt ${L[0]} die door ${L[1]} gaat, noteer je als ____`, null, `[${L[0]}${L[1]}`, [`${L[0]}${L[1]}]`, `[${L[0]}${L[1]}]`, `${L[1]}${L[0]}`], `nt3.${L[0]}${L[1]}`, 3, { ...data, wat: 'halfrechte', L });
      if (v === 4) return mk(`De hoek met hoekpunt ${L[0]} noteer je als ____`, null, `${L[0]}̂`, [L[0], `${L[0]}̄`, `${L[0]}°`], `nt4.${L[0]}`, 2, { ...data, wat: 'hoek', L });
      return r.volgende() < 0.5 ? mk(`De driehoek met hoekpunten ${L[0]}, ${L[1]} en ${L[2]} noteer je als ____`, null, `∆${L[0]}${L[1]}${L[2]}`, [`${L[0]}${L[1]}${L[2]}`, `∆${L[0]}${L[1]}`, `vierhoek ${L[0]}${L[1]}${L[2]}`], `nt5.${L.join('')}`, 3, { ...data, wat: 'driehoek', L })
        : mk(`De vierhoek met hoekpunten ${L[0]}, ${L[1]}, ${L[2]} en ${L[3]} noteer je als ____`, null, `vierhoek ${L.join('')}`, [`∆${L.join('')}`, L.join(''), `vierhoek ${L[0]}${L[1]}${L[2]}`], `nt6.${L.join('')}`, 3, { ...data, wat: 'vierhoek', L });
    }
    case 'punt': {
      const L = kies(r, LETTERS), v = r.geheel(0, 2);
      if (v === 0) return mk(`Welke naam hoort bij een punt: ${L[1]} of ${L[1].toLowerCase()}? ____`, null, L[1], [L[1].toLowerCase()], `pu0.${L[1]}`, 1, { ...data, wat: 'naam', L });
      if (v === 1) return mk('Waar twee rechten elkaar snijden, ontstaat een ____. (punt of lijnstuk)', null, 'punt', ['lijnstuk'], 'pu1', 1, { ...data, wat: 'snijpunt' });
      return mk('Een punt teken je als een klein ____. (kruisje of lijnstuk)', null, 'kruisje', ['lijnstuk'], 'pu2', 1, { ...data, wat: 'teken' });
    }
    case 'lb': {
      const l = r.geheel(5, 12), b = r.geheel(2, l - 1), welke = r.volgende() < 0.5;
      return mk(`Een rechthoek is ${l} cm lang en ${b} cm breed. De ${welke ? 'lengte' : 'breedte'} is ____ cm.`, null, welke ? l : b, [welke ? b : l, l + b, l * b].filter(x => x > 0), `lb${l}.${b}${welke}`, 2, { ...data, l, b, welke });
    }
    case 'hbs': {
      const v = r.geheel(0, 2);
      if (v === 0) { const letters = r.schud(['a', 'b', 'c', 'd', 'e', 'f']).slice(0, 3), spiegel = r.volgende() < 0.5; return mk('Welke zijde is de schuine zijde van de driehoek? ____', V.driehoekZijden(letters, spiegel), letters[2], [letters[0], letters[1]], `hz${letters.join('')}${spiegel}`, 2, { ...data, wat: 'schuin', letters, spiegel }); }
      const b = r.geheel(110, 160), h = r.geheel(60, 90), schuin = r.geheel(20, 60), svg = V.parallellogramHoogte({ b, h, schuin });
      if (v === 1) return mk('Hoe heet het gestippelde lijnstuk? ____', svg, 'hoogte', ['basis', 'schuine zijde'], `hh${b}.${h}.${schuin}`, 2, { ...data, wat: 'hoogte' });
      return mk('Hoe heet de dikke zijde onderaan? ____', svg, 'basis', ['hoogte', 'schuine zijde'], `hb${b}.${h}.${schuin}`, 2, { ...data, wat: 'basis' });
    }
    case 'begrensd': {
      const v = r.geheel(0, 3);
      if (v === 0) { const w = r.volgende() < 0.5, hoek = kies(r, HOEKEN); return mk('Is deze lijn begrensd of onbegrensd? ____', V.lijnTekening(w ? 'lijnstuk' : 'rechte', hoek), w ? 'begrensd' : 'onbegrensd', [w ? 'onbegrensd' : 'begrensd'], `bg${w}${hoek}`, 2, { ...data, wat: 'tekening', w, hoek }); }
      const lijst = [['Een lijnstuk is ____. (begrensd of onbegrensd)', 'begrensd'], ['Een rechte is ____. (begrensd of onbegrensd)', 'onbegrensd'], ['Een halfrechte heeft een beginpunt en is aan de andere kant ____. (begrensd of onbegrensd)', 'onbegrensd']], i = v - 1;
      return mk(lijst[i][0], null, lijst[i][1], [lijst[i][1] === 'begrensd' ? 'onbegrensd' : 'begrensd'], `bg${i}`, 2, { ...data, wat: 'tekst', i, goed: lijst[i][1] });
    }
    default: { const i = r.geheel(0, RUIMTE.length - 1), [vraag, antw, fouten] = RUIMTE[i]; return mk(vraag, null, antw, fouten, `ru${i}`, 2, { ...data, wat: 'ruimte', i, goed: antw }); }
  }
};
export const VORMLEER_VORMEN = maakOpgaveVormen({
  id: 'vrm', titel: 'Begrippen en notaties bij vormen', doelen: AUTO_DOELEN.vrm || [], parameters: K.vormleerParameters, standaard: { types: ['lijnsoort'], jaar: 4 },
  opdracht: opdracht('Kijk goed. Schrijf het antwoord op de lijn.'), opgave: vormleerOpgave, schaal: 1,
});
export const AUTO_VORMLEER_VORMEN = [...VORMLEER_VORMEN];
