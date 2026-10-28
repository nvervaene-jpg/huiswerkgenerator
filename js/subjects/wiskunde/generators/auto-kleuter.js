// Oefeningen voor het derde kleuterklasje (K3): voorwerpen vergelijken en ordenen, samenstellen, meten met natuurlijke maten (blokjes), meetinzichten,
// geld, de dag en de week, plaatsbegrippen, rijen en een klasstatistiek met pictogrammen. De zinnen zijn door de bouwer geschreven en bedoeld om voor te lezen.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { geld } from '../svg.js';
import { vergelijk, eenhedenRijen, natuurlijkeMaat, pictogrammen } from '../kleuter-svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && !(typeof x === 'number' && (x < 0 || !Number.isFinite(x))) && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const opdracht = (invullen) => ({ invullen, kiezen: 'Luister goed. Kies het juiste antwoord. Omcirkel.', 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const NAMEN = ['Mila', 'Lars', 'Noor', 'Sam', 'Emma', 'Tom'];
const unieke = (r, n, min, max) => { const s = new Set(); while (s.size < n) s.add(r.geheel(min, max)); return [...s]; };

/* ------------------------------------------------------------------ vergelijken en ordenen (seriëren) */
const MAX = { lengte: 9, oppervlakte: 6, volume: 7, inhoud: 7, massa: 8 };
const WOORD = { lengte: ['langste', 'kortste', 'streep'], oppervlakte: ['grootste', 'kleinste', 'vierkant'], volume: ['meeste blokjes', 'minste blokjes', 'toren'], inhoud: ['meeste water', 'minste water', 'glas'], massa: ['zwaarste', 'lichtste', 'voorwerp'] };
const vergelijken = (r, p) => {
  const soort = p.soort, n = soort === 'massa' ? 2 : 3, w = unieke(r, n, 1, MAX[soort]), letters = ['A', 'B', 'C'].slice(0, n), items = letters.map((l, i) => ({ letter: l, w: w[i] }));
  const soortVraag = kies(r, n === 3 ? ['meest', 'minst', 'midden'] : ['meest', 'minst']), [meest, minst, naam] = WOORD[soort], gesorteerd = [...items].sort((a, b) => b.w - a.w);
  const doel = soortVraag === 'meest' ? gesorteerd[0] : soortVraag === 'minst' ? gesorteerd[n - 1] : gesorteerd[1];
  const vraag = soortVraag === 'midden' ? `Welk ${naam} is niet het ${meest.split(' ')[0]} en niet het ${minst.split(' ')[0]}? ____` : `Welk ${naam} is het ${soortVraag === 'meest' ? meest : minst}? ____`;
  return mk(vraag, vergelijk(soort, items), doel.letter, letters.filter(l => l !== doel.letter), `kv-${soort}.${w.join()}.${soortVraag}`, soortVraag === 'midden' ? 2 : 1, { soort, items, vraagsoort: soortVraag, doel: doel.letter });
};
export const KLEUTER_VERGELIJK_VORMEN = maakOpgaveVormen({
  id: 'kvg', titel: 'Vergelijken en ordenen', doelen: AUTO_DOELEN.kvg || [], parameters: K.kleuterVergelijkParameters, standaard: { soort: 'lengte' }, pictogram: 'omcirkelen',
  opdracht: opdracht('Kijk goed. Schrijf de letter op de lijn.'), opgave: vergelijken,
});

/* ------------------------------------------------------------------ samenstellen en (on)gelijk maken */
const EENHEID = { lengte: 'blokjes', oppervlakte: 'tegels', volume: 'blokjes', inhoud: 'bekertjes', massa: 'gewichtjes' };
const samenstellen = (r, p) => {
  const soort = kies(r, p.soorten), eenheid = EENHEID[soort], type = kies(r, ['erbij', 'weg', 'samen']);
  if (type === 'samen') { const a = r.geheel(1, 6), b = r.geheel(1, 6); return mk(`Je legt rij A en rij B samen. Hoeveel ${eenheid} zijn dat samen? ____`, eenhedenRijen(soort, [{ label: 'A', n: a }, { label: 'B', n: b }]), a + b, [a, b, a + b + 1, a + b - 1], `ks-s${soort}.${a}.${b}`, 2, { soort, type, a, b }); }
  const [a, b] = unieke(r, 2, 1, 10).sort((x, y) => y - x), meer = type === 'erbij';
  return mk(meer ? `Hoeveel ${eenheid} moet rij B erbij krijgen om evenveel te hebben als rij A? ____` : `Hoeveel ${eenheid} moet rij A kwijt om evenveel te hebben als rij B? ____`, eenhedenRijen(soort, [{ label: 'A', n: a }, { label: 'B', n: b }]), a - b, [a, b, a - b + 1, a - b - 1], `ks-${type}${soort}.${a}.${b}`, 2, { soort, type, a, b });
};
export const KLEUTER_SAMENSTEL_VORMEN = maakOpgaveVormen({
  id: 'ksm', titel: 'Samenstellen en gelijk maken', doelen: AUTO_DOELEN.ksm || [], parameters: K.kleuterSamenstelParameters, standaard: { soorten: ['lengte'] }, pictogram: 'tellen',
  opdracht: opdracht('Tel de blokjes. Schrijf het getal op de lijn.'), opgave: samenstellen,
});

/* ------------------------------------------------------------------ meten met natuurlijke maten */
const VOORWERPEN = { lengte: ['potlood', 'touw', 'lint', 'stok'], oppervlakte: ['tafel', 'mat', 'blad papier'], inhoud: ['kruik', 'emmer', 'fles'], massa: ['appel', 'boek', 'bal'] };
const natuurlijkMeten = (r, p) => {
  const soort = kies(r, p.soorten), naam = kies(r, VOORWERPEN[soort]), n = r.geheel(1, 10);
  const vraag = { lengte: `Het ${naam} is ____ blokjes lang.`, oppervlakte: `De ${naam} is ____ tegels groot.`, inhoud: `De ${naam} bevat ____ bekertjes water.`, massa: `De ${naam} weegt evenveel als ____ blokjes.` }[soort];
  return mk(vraag, natuurlijkeMaat(soort, n, naam), n, [n + 1, n - 1, n + 2, n - 2], `kn-${soort}.${naam}.${n}`, n > 6 ? 2 : 1, { soort, naam, n });
};
export const KLEUTER_MAAT_VORMEN = maakOpgaveVormen({
  id: 'knm', titel: 'Meten met blokjes', doelen: AUTO_DOELEN.knm || [], parameters: K.kleuterMaatParameters, standaard: { soorten: ['lengte'] }, pictogram: 'meten',
  opdracht: opdracht('Tel de blokjes. Schrijf het getal op de lijn.'), opgave: natuurlijkMeten,
});

/* ------------------------------------------------------------------ meetinzichten voor kleuters */
const INZICHT = {
  grootheid: [
    ['Je legt twee potloden naast elkaar en kijkt welk potlood het langst is. Je vergelijkt de ____ van de potloden.', 'lengte', ['kleur', 'naam']],
    ['Je houdt twee tassen vast en voelt welke tas het zwaarst is. Je vergelijkt de ____ van de tassen.', 'massa', ['kleur', 'vorm']],
    ['Je kijkt welk glas het meeste water bevat. Je vergelijkt de ____ van de glazen.', 'inhoud', ['kleur', 'naam']],
    ['Je legt twee bladen op elkaar en kijkt welk blad het grootst is. Je vergelijkt de ____ van de bladen.', 'oppervlakte', ['kleur', 'naam']],
  ],
  conservatie: [
    ['Je rolt een bol klei uit tot een lange worst. Is er nu meer, minder of evenveel klei? ____', 'evenveel', ['meer', 'minder']],
    ['Je duwt een bol klei plat tot een pannenkoek. Is er nu meer, minder of evenveel klei? ____', 'evenveel', ['meer', 'minder']],
    ['Je giet water van een breed glas in een smal, hoog glas. Is er nu meer, minder of evenveel water? ____', 'evenveel', ['meer', 'minder']],
    ['Je breekt een koekje in vier stukken. Wegen de stukken samen meer, minder of evenveel als het hele koekje? ____', 'evenveel', ['meer', 'minder']],
    ['Je legt een touw eerst recht en daarna in een bocht. Is het touw nu langer, korter of even lang? ____', 'even lang', ['langer', 'korter']],
  ],
  strategie: [
    ['Je wilt weten welke beker het meeste water bevat. Je giet het water in twee gelijke glazen en kijkt naar de ____ van het water.', 'hoogte', ['kleur', 'geur']],
    ['Je wilt twee tassen vergelijken zonder weegschaal. Je houdt in elke hand een tas en voelt welke tas ____ is.', 'zwaarder', ['langer', 'warmer']],
    ['Je wilt weten welk lint het langst is. Je legt de linten naast elkaar. Ze beginnen op dezelfde plaats: ____', 'ja', ['nee', 'soms']],
    ['Je wilt weten hoe lang de tafel is. Je legt blokjes tegen elkaar langs de tafel en ____ de blokjes.', 'telt', ['kleurt', 'weegt']],
  ],
};
const kleuterInzicht = (r, p) => { const [v, a, f] = kies(r, INZICHT[p.soort]); return mk(v, null, a, f, `ki-${v}`, 1, { soort: p.soort }); };
export const KLEUTER_INZICHT_VORMEN = maakOpgaveVormen({
  id: 'kmi', titel: 'Inzicht in meten (kleuters)', doelen: AUTO_DOELEN.kmi || [], parameters: K.kleuterInzichtParameters, standaard: { soort: 'grootheid' }, vormen: ['kiezen', 'juist-fout'], pictogram: 'meten',
  opdracht: opdracht(''), opgave: kleuterInzicht,
});

/* ------------------------------------------------------------------ geld: munt, biljet, betaalkaart, sparen */
const betalen = (r, p) => {
  if (p.soort === 'munt') {
    const euro = kies(r, [1, 2]), aantal = r.geheel(1, 4), lijst = Array.from({ length: aantal }, () => kies(r, [100, 200]));
    if (r.volgende() < 0.5) return mk('Hoeveel euro is dit muntstuk? ____', geld([euro * 100]), euro, [euro === 1 ? 2 : 1, 5, 10], `kg-m${euro}`, 1, { soort: 'munt-waarde', euro });
    return mk('Hoeveel munten zie je? ____', geld(lijst), aantal, [aantal + 1, aantal - 1, aantal + 2], `kg-t${lijst.join()}`, 1, { soort: 'munt-aantal', lijst, aantal });
  }
  if (p.soort === 'sparen') {
    if (r.volgende() < 0.5) { const w = r.geheel(2, 5), e = r.geheel(1, 2); return mk(`Je steekt elke week ${e} euro in je spaarpot. Na ${w} weken zit er ____ euro in.`, null, w * e, [w + e, w * e + 1, w * e - 1], `kg-sp${w}.${e}`, 2, { soort: 'sparen-som', w, e }); }
    const [v, antwoord] = kies(r, [['Je bewaart geld om later iets te kopen. Dat noem je ____', 'sparen'], ['Als je elke week een beetje geld in je spaarpot steekt, dan ____ je.', 'spaart']]);
    return mk(v, null, antwoord, ['kopen', 'verliezen', 'weggooien'], `kg-sb${v}`, 1, { soort: 'sparen-woord', antwoord });
  }
  const bank = [['Om in de winkel iets te kopen, gebruik je ____', 'geld', ['stickers', 'knopen']], ['Een biljet is gemaakt van ____', 'papier', ['hout', 'stof']], ['Een muntstuk is rond en gemaakt van ____', 'metaal', ['papier', 'stof']], ['Met een betaalkaart kan je in de winkel ____', 'betalen', ['eten', 'schrijven']], ['Waar kan je geld bewaren? In een ____', 'portemonnee', ['kussen', 'schoen']]];
  const [v, a, f] = kies(r, bank); return mk(v, null, a, f, `kg-b${v}`, 1, { soort: 'betalen' });
};
export const KLEUTER_GELD_VORMEN = maakOpgaveVormen({
  id: 'kgd', titel: 'Geld voor kleuters', doelen: AUTO_DOELEN.kgd || [], parameters: K.kleuterGeldParameters, standaard: { soort: 'munt' }, pictogram: 'geld',
  opdracht: opdracht('Luister goed. Schrijf het antwoord op de lijn.'), opgave: betalen,
});

/* ------------------------------------------------------------------ de dag en de week */
const DAG = ['opstaan', 'ontbijten', 'naar school gaan', 'middageten', 'naar huis gaan', 'avondeten', 'tanden poetsen', 'slapen'];
const WEEK = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const tijd = (r, p) => {
  if (p.soort === 'dag') {
    if (r.volgende() < 0.5) { const [i, j] = unieke(r, 2, 0, DAG.length - 1); return mk(`Wat doe je eerst op een schooldag: ${DAG[i]} of ${DAG[j]}? ____`, null, DAG[Math.min(i, j)], [DAG[Math.max(i, j)], 'allebei tegelijk'], `kt-e${i}.${j}`, 1, { soort: 'eerst', i, j }); }
    const i = r.geheel(0, DAG.length - 2); return mk(`Wat doe je direct na ${DAG[i]}? ____`, null, DAG[i + 1], DAG.filter((_, k) => k !== i + 1 && k !== i), `kt-n${i}`, 2, { soort: 'daarna', i });
  }
  if (p.soort === 'aftellen') { const i = r.geheel(0, 5), j = r.geheel(i + 1, 6), feest = kies(r, ['feest', 'uitstap', 'zwemles']); return mk(`Vandaag is het ${WEEK[i]}. Op ${WEEK[j]} is het ${feest}. Hoeveel nachtjes slapen tot dan? ____`, null, j - i, [j - i + 1, j - i - 1, j, i + 1], `kt-a${i}.${j}.${feest}`, 2, { soort: 'aftellen', i, j }); }
  const bank = [['Hoe meet je hoeveel tijd je nodig hebt om een toren te bouwen? Je gebruikt een ____', 'zandloper', ['lat', 'weegschaal']], ['Hoe meet je hoe lang je moet wachten? Je gebruikt een ____', 'klok', ['lat', 'maatbeker']], ['Een ____ loopt af als de tijd om is.', 'zandloper', ['lat', 'bekertje']], ['Je wilt weten hoe lang een liedje duurt. Je gebruikt een ____', 'timer', ['lat', 'weegschaal']]];
  const [v, a, f] = kies(r, bank); return mk(v, null, a, f, `kt-d${v}`, 1, { soort: 'duur' });
};
export const KLEUTER_TIJD_VORMEN = maakOpgaveVormen({
  id: 'ktd', titel: 'De dag en de week', doelen: AUTO_DOELEN.ktd || [], parameters: K.kleuterTijdParameters, standaard: { soort: 'dag' }, pictogram: 'klok',
  opdracht: opdracht('Luister goed. Schrijf het antwoord op de lijn.'), opgave: tijd,
});

/* ------------------------------------------------------------------ plaatsbegrippen, richtingen, kanten en transformaties */
const PLAATS = {
  tegen: [['De kast staat ____ de muur.', 'tegen', ['tegenover', 'boven']], ['De fiets staat ____ de muur geleund.', 'tegen', ['tegenover', 'achter']], ['Mila zit aan de ene kant van de tafel en Lars aan de andere kant. Mila zit ____ Lars.', 'tegenover', ['tegen', 'naast']], ['De school staat ____ het park, aan de andere kant van de straat.', 'tegenover', ['tegen', 'onder']]],
  omhoog: [['De ballon stijgt. Hij gaat ____.', 'omhoog', ['omlaag', 'achteruit']], ['De bal rolt van de trap. Hij gaat ____.', 'omlaag', ['omhoog', 'vooruit']], ['Je klimt in de boom. Je gaat ____.', 'omhoog', ['omlaag', 'achteruit']], ['De lift zakt naar de kelder. De lift gaat ____.', 'omlaag', ['omhoog', 'vooruit']]],
  vooruit: [['Je loopt naar de deur toe, met je gezicht naar de deur. Je stapt ____.', 'vooruit', ['achteruit', 'omhoog']], ['Je zet een stap terug, weg van het bord. Je stapt ____.', 'achteruit', ['vooruit', 'omlaag']], ['De auto rijdt met zijn achterkant eerst de garage in. Hij rijdt ____.', 'achteruit', ['vooruit', 'omhoog']], ['Je loopt in de richting waar je naar kijkt. Je loopt ____.', 'vooruit', ['achteruit', 'omlaag']]],
  recht: [['Mila loopt in een rechte lijn naar de deur. Ze loopt ____ de deur.', 'recht naar', ['schuin naar', 'achter']], ['Lars loopt niet recht, maar in een scheve lijn naar de overkant. Hij loopt ____ de overkant.', 'schuin naar', ['recht naar', 'tegen']], ['Een pijl wijst recht omhoog. Hij wijst ____ boven.', 'recht naar', ['schuin naar', 'achter']], ['Een pijl wijst scheef omhoog, niet recht. Hij wijst ____ boven.', 'schuin naar', ['recht naar', 'tegen']]],
  kant: [['De wielen van de auto zitten aan de ____ van de auto.', 'onderkant', ['bovenkant', 'voorkant']], ['Het dak van het huis zit aan de ____ van het huis.', 'bovenkant', ['onderkant', 'achterkant']], ['De titel van het boek staat op de ____ van het boek.', 'voorkant', ['achterkant', 'onderkant']], ['De staart van een hond zit aan de ____ van de hond.', 'achterkant', ['voorkant', 'bovenkant']], ['De opening van een pak melk zit aan de ____ van het pak.', 'bovenkant', ['onderkant', 'voorkant']]],
  vervorm: [['Je maakt van een bol klei een worst. Je hebt de klei ____', 'vervormd', ['vergroot', 'verkleind']], ['Een foto wordt op een groot scherm getoond. De foto wordt ____', 'vergroot', ['verkleind', 'vervormd']], ['Een grote tekening past op een klein kaartje. De tekening wordt ____', 'verkleind', ['vergroot', 'vervormd']], ['Je kneedt een bal in de vorm van een slang. De bal is ____', 'vervormd', ['vergroot', 'verkleind']]],
};
const PIJLEN = ['→', '←', '↑', '↓'], PIJLNAAM = { '→': 'rechts', '←': 'links', '↑': 'omhoog', '↓': 'omlaag' };
const VOORZETSEL = ['in', 'op', 'onder', 'naast', 'voor', 'achter'];
const plaats = (r, p) => {
  if (p.soort === 'route') {
    const rij = Array.from({ length: r.geheel(4, 6) }, () => kies(r, PIJLEN)), pijl = kies(r, PIJLEN), n = rij.filter(x => x === pijl).length;
    return mk(`Je volgt de pijlen: ${rij.join(' ')}. Hoeveel keer ga je ${PIJLNAAM[pijl]}? ____`, null, n, [n + 1, n - 1, rij.length, n + 2], `kp-r${rij.join('')}.${pijl}`, 2, { soort: 'route', rij, pijl, n });
  }
  if (p.soort === 'situeren') {
    const [a, b] = r.schud(NAMEN), [x, y] = kies(r, [['links van', 'rechts van'], ['rechts van', 'links van'], ['voor', 'achter'], ['achter', 'voor']]);
    return mk(`${a} staat ${x} jou. Jij staat ____ ${a}.`, null, y, ['links van', 'rechts van', 'voor', 'achter', 'naast'].filter(z => z !== y && z !== x), `kp-s${a}.${x}`, 2, { soort: 'situeren', a, b, x, y });
  }
  if (p.soort === 'plaats') {
    const [wat, waar] = kies(r, [['de bal', 'de doos'], ['het boek', 'de tas'], ['de auto', 'de garage'], ['het poppetje', 'de kast']]), v = kies(r, VOORZETSEL), naam = kies(r, NAMEN), werkwoord = ['in', 'op', 'onder'].includes(v) ? 'legt' : 'zet';
    return mk(`${naam} ${werkwoord} ${wat} ${v} ${waar}. Waar is ${wat} nu? ${wat[0].toUpperCase() + wat.slice(1)} is ____ ${waar}.`, null, v, VOORZETSEL.filter(z => z !== v), `kp-w${naam}.${wat}.${v}`, 2, { soort: 'plaats', wat, waar, v });
  }
  const [v, a, f] = kies(r, PLAATS[p.soort]); return mk(v, null, a, f, `kp-${p.soort}-${v}`, 1, { soort: p.soort });
};
export const KLEUTER_PLAATS_VORMEN = maakOpgaveVormen({
  id: 'kpl', titel: 'Plaats, richting en kanten', doelen: AUTO_DOELEN.kpl || [], parameters: K.kleuterPlaatsParameters, standaard: { soort: 'tegen' }, pictogram: 'schrijven',
  opdracht: opdracht('Luister goed. Schrijf het antwoord op de lijn.'), opgave: plaats,
});

/* ------------------------------------------------------------------ rijen met een afgesproken eenheid */
const FIGUREN = ['○', '△', '□', '☆'];
const REEKS = [[0, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1], [0, 1, 0, 2]];
const rij = (r) => {
  const patroon = kies(r, REEKS), gekozen = r.schud(FIGUREN).slice(0, 3), eenheid = patroon.map(i => gekozen[i]), herhaling = r.geheel(2, 3);
  const volledig = Array.from({ length: patroon.length * herhaling + patroon.length }, (_, i) => eenheid[i % patroon.length]), vraag = volledig.slice(0, -1), antwoord = volledig[volledig.length - 1];
  return mk(`Zet de rij verder: ${vraag.join(' ')} ____`, null, antwoord, FIGUREN.filter(x => x !== antwoord), `kr-${vraag.join('')}`, patroon.length > 2 ? 2 : 1, { soort: 'rij', eenheid, rijtje: vraag });
};
export const KLEUTER_RIJ_VORMEN = maakOpgaveVormen({
  id: 'krj', titel: 'Een rij verder zetten', doelen: AUTO_DOELEN.krj || [], parameters: K.kleuterRijParameters, standaard: {}, pictogram: 'schrijven',
  opdracht: opdracht('Kijk naar de rij. Teken het volgende figuurtje op de lijn.'), opgave: rij,
});

/* ------------------------------------------------------------------ gegevens over de klas */
const REEKSEN = [['appel', 'banaan', 'peer', 'druif'], ['hond', 'kat', 'vis', 'konijn'], ['rood', 'blauw', 'groen', 'geel'], ['bal', 'pop', 'auto', 'puzzel']];
const statistiek = (r, p) => {
  const namen = kies(r, REEKSEN), k = r.geheel(3, 4), w = unieke(r, k, 1, 8), groepen = namen.slice(0, k).map((naam, i) => ({ naam, n: w[i] })), lijst = [...groepen].sort((a, b) => b.n - a.n);
  const svg = pictogrammen(groepen, { staaf: p.soort === 'staaf' }), x = kies(r, groepen);
  if (p.soort === 'label' || p.soort === 'staaf') return mk(`Hoeveel kinderen kozen ${x.naam}? ____`, svg, x.n, [x.n + 1, x.n - 1, x.n + 2, lijst[0].n === x.n ? lijst[1].n : lijst[0].n], `ks-${p.soort}${groepen.map(g => g.naam + g.n).join()}.${x.naam}`, 1, { soort: p.soort, groepen, naam: x.naam });
  if (p.soort === 'vergelijk') {
    if (r.volgende() < 0.5) { const meer = r.volgende() < 0.5; return mk(`Welke groep is het ${meer ? 'grootst' : 'kleinst'}? ____`, svg, meer ? lijst[0].naam : lijst[k - 1].naam, groepen.map(g => g.naam), `ks-v${groepen.map(g => g.naam + g.n).join()}.${meer}`, 1, { soort: 'grootst-kleinst', groepen, meer }); }
    const [a, b] = r.schud(groepen).slice(0, 2).sort((u, v) => v.n - u.n); return mk(`Hoeveel kinderen meer kozen ${a.naam} dan ${b.naam}? ____`, svg, a.n - b.n, [a.n, b.n, a.n - b.n + 1, a.n + b.n], `ks-m${groepen.map(g => g.naam + g.n).join()}.${a.naam}.${b.naam}`, 2, { soort: 'verschil', groepen, a: a.naam, b: b.naam });
  }
  return mk('Wat is het besluit? De meeste kinderen kozen ____', svg, lijst[0].naam, groepen.map(g => g.naam), `ks-b${groepen.map(g => g.naam + g.n).join()}`, 2, { soort: 'besluit', groepen });
};
export const KLEUTER_STATISTIEK_VORMEN = maakOpgaveVormen({
  id: 'kst', titel: 'Gegevens over de klas', doelen: AUTO_DOELEN.kst || [], parameters: K.kleuterStatistiekParameters, standaard: { soort: 'label' }, pictogram: 'tellen',
  opdracht: opdracht('Kijk goed naar de tekening. Schrijf het antwoord op de lijn.'), opgave: statistiek,
});

export const AUTO_KLEUTER_VORMEN = [...KLEUTER_VERGELIJK_VORMEN, ...KLEUTER_SAMENSTEL_VORMEN, ...KLEUTER_MAAT_VORMEN, ...KLEUTER_INZICHT_VORMEN, ...KLEUTER_GELD_VORMEN, ...KLEUTER_TIJD_VORMEN, ...KLEUTER_PLAATS_VORMEN, ...KLEUTER_RIJ_VORMEN, ...KLEUTER_STATISTIEK_VORMEN];
