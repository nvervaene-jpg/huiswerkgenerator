// Meten en rekenen, laatste families: meetinzichten (stellingen en korte vragen), de begrippen maatgetal/maateenheid/maat, een meetinstrument
// correct hanteren en de digitale rekentool. De zinnen zijn door de bouwer geschreven; de getallen worden telkens opnieuw berekend.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const mk = (vraag, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, sleutel: kern, antwoord: String(antwoord), fouten: [...new Set(fouten.filter(x => x !== undefined && String(x) !== String(antwoord)))].map(String), kern, moeilijkheid: [moeilijkheid], data });
const kom = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
const duizend = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const dec = (x) => String(Math.round(x * 10000) / 10000).replace('.', ',');
const NAMEN = ['Mila', 'Lars', 'Noor', 'Sam', 'Emma', 'Tom', 'Lotte', 'Jens'];

/* ------------------------------------------------------------------ meetinzichten */
const GROOTHEDEN = [['een potlood', 'een lat', 'lengte'], ['een fles', 'een weegschaal', 'massa'], ['een emmer', 'een maatbeker', 'inhoud'], ['de kamer', 'een thermometer', 'temperatuur'], ['een tafel', 'een rolmeter', 'lengte'], ['een zak aardappelen', 'een weegschaal', 'massa'], ['een pot soep', 'een maatbeker', 'inhoud'], ['de lucht buiten', 'een thermometer', 'temperatuur']];
const ALLE_GROOTHEDEN = ['lengte', 'massa', 'inhoud', 'temperatuur'];
const grootheid = (r) => {
  const [ding, instrument, g] = kies(r, GROOTHEDEN);
  return mk(`Je meet ${ding} met ${instrument}. Welke grootheid meet je? ____`, g, ALLE_GROOTHEDEN.filter(x => x !== g), `gr-${ding}.${instrument}`, 1, { soort: 'grootheid', ding, g });
};
const verhouding = (r) => {
  const u = r.geheel(2, 5), n = r.geheel(3, 9), wat = kies(r, ['stokje', 'strookje', 'blokje']);
  return mk(`Je meet een lijnstuk met een ${wat} van ${u} cm als maateenheid. Het ${wat} past ${n} keer in het lijnstuk. Het lijnstuk is ____ cm lang.`, u * n, [u + n, n, u * n + u, u * n - u, u], `vh-${wat}.${u}.${n}`, 2, { soort: 'verhouding', u, n, uitkomst: u * n });
};
const RANGEN = [['touw', 'cm', 'Welk touw is het langst?', 'max'], ['pakje', 'g', 'Welk pakje is het zwaarst?', 'max'], ['fles', 'ml', 'Welke fles bevat het meeste water?', 'max'], ['touw', 'cm', 'Welk touw is het kortst?', 'min'], ['pakje', 'g', 'Welk pakje is het lichtst?', 'min']];
const rangschikken = (r) => {
  const [wat, eenheid, vraag, richting] = kies(r, RANGEN), waarden = new Set();
  while (waarden.size < 3) waarden.add(r.geheel(10, 99) * (eenheid === 'g' || eenheid === 'ml' ? 5 : 1));
  const lijst = [...waarden], letters = ['A', 'B', 'C'], beste = richting === 'max' ? Math.max(...lijst) : Math.min(...lijst), i = lijst.indexOf(beste);
  const tekst = lijst.map((w, k) => `${wat} ${letters[k]}: ${w} ${eenheid}`).join(', ').replace(/^./, c => c.toUpperCase());
  return mk(`${tekst}. ${vraag} ____`, letters[i], letters.filter((_, k) => k !== i), `rg-${lijst.join('.')}.${vraag}`, 1, { soort: 'rangschikken', lijst, beste });
};
const CONSERVATIE = [
  ['Je rolt een bol klei uit tot een lange worst. Is er nu meer, minder of evenveel klei?', 'evenveel'],
  ['Je duwt een bol klei plat tot een pannenkoek. Is er nu meer, minder of evenveel klei?', 'evenveel'],
  ['Je giet water van een breed glas in een smal, hoog glas. Is er nu meer, minder of evenveel water?', 'evenveel'],
  ['Je giet sap uit een fles in een kom. Is er nu meer, minder of evenveel sap?', 'evenveel'],
  ['Je breekt een koekje in vier stukken. Wegen de stukken samen meer, minder of evenveel als het hele koekje?', 'evenveel'],
  ['Je knipt een lint in drie stukken. Zijn de stukken samen langer, korter of even lang als het hele lint?', 'even lang'],
  ['Je legt een touw eerst recht en daarna in een bocht. Is het touw nu langer, korter of even lang?', 'even lang'],
  ['Je knipt een blad papier in stukjes. Is de oppervlakte van alle stukjes samen groter, kleiner of even groot?', 'even groot'],
];
const conservatie = (r) => {
  const [v, a] = kies(r, CONSERVATIE), fouten = a === 'evenveel' ? ['meer', 'minder'] : a === 'even lang' ? ['langer', 'korter'] : ['groter', 'kleiner'];
  return mk(`${v} ____`, a, fouten, `cv-${v}`, 2, { soort: 'conservatie', vraagtekst: v });
};
const STANDAARD = [
  ['Mila meet de bank met haar voet, Lars met zijn voet. Ze krijgen een ander getal. Wat doen ze best om hetzelfde meetresultaat te krijgen? ____', 'Allebei in centimeter meten.', ['Nog eens met hun voet meten.', 'Een ander voorwerp meten.', 'Sneller meten.']],
  ['Twee kinderen willen de lengte van een klas vergelijken. Eén meet in stappen, de ander in handbreedtes. Wat is nodig? ____', 'Een gezamenlijke standaardmaat, zoals de meter.', ['Een grotere klas.', 'Nog een kind dat telt.', 'Een kortere klas.']],
  ['Een bakker en een klant wegen meel. Waarom gebruiken ze een standaardmaat zoals de kilogram? ____', 'Zo betekent het getal voor iedereen hetzelfde.', ['Omdat een kilogram zwaarder is dan een handvol.', 'Omdat het getal dan altijd groter is.', 'Omdat meel anders kleeft.']],
  ['Je koopt 3 stukken stof van elk 4 spanlengtes. Waarom is dat geen goede manier om stof te verkopen? ____', 'Een spanlengte is bij elke persoon anders.', ['Een spanlengte is altijd 1 meter.', 'Je mag stof niet meten.', 'Stof is te zacht om te meten.']],
];
const standaard = (r) => { const [v, a, f] = kies(r, STANDAARD); return mk(v, a, f, `st-${v}`, 2, { soort: 'standaard' }); };
const EENHEDEN = { lengte: ['m', 'dm', 'cm', 'mm'], massa: ['kg', 'hg', 'g'], inhoud: ['l', 'dl', 'cl', 'ml'] };
const omgekeerd = (r) => {
  const g = kies(r, Object.keys(EENHEDEN)), lijst = r.schud(EENHEDEN[g]).slice(0, 3), idx = (e) => EENHEDEN[g].indexOf(e), groot = r.volgende() < 0.5;
  const sorted = [...lijst].sort((a, b) => idx(a) - idx(b)), antwoord = groot ? sorted[sorted.length - 1] : sorted[0], wat = { lengte: 'een touw', massa: 'een pakje', inhoud: 'een fles water' }[g];
  return mk(`Je meet ${wat} met ${lijst.join(', ')} als maateenheid. Bij welke maateenheid krijg je het ${groot ? 'grootste' : 'kleinste'} maatgetal? ____`, antwoord, lijst.filter(x => x !== antwoord), `om-${g}.${lijst.join()}.${groot}`, 2, { soort: 'omgekeerd', g, lijst, antwoord });
};
const NAUWKEURIG = [['cm', 'mm'], ['m', 'cm'], ['km', 'm'], ['kg', 'g'], ['g', 'mg'], ['l', 'ml'], ['dl', 'ml'], ['uur', 'minuut'], ['minuut', 'seconde']];
const benadering = (r) => {
  const [groot, klein] = kies(r, NAUWKEURIG), wissel = r.volgende() < 0.5, [a, b] = wissel ? [klein, groot] : [groot, klein];
  return mk(`Je meet hetzelfde twee keer: één keer in ${a} en één keer in ${b}. Welke meting is het nauwkeurigst? ____`, `in ${klein}`, [`in ${groot}`, 'even nauwkeurig'], `bn-${groot}.${klein}.${wissel}`, 2, { soort: 'benadering', groot, klein });
};
const OMREKEN = [['m', 'cm', 100], ['m', 'dm', 10], ['dm', 'cm', 10], ['cm', 'mm', 10], ['km', 'm', 1000], ['kg', 'g', 1000], ['l', 'ml', 1000], ['l', 'dl', 10], ['dl', 'cl', 10], ['cl', 'ml', 10], ['uur', 'minuut', 60], ['minuut', 'seconde', 60]];
const metriek = (r) => {
  const [groot, klein, f] = kies(r, OMREKEN);
  return mk(`De maateenheden hebben een vaste verhouding. 1 ${groot} = ____ ${{ minuut: 'minuten', seconde: 'seconden' }[klein] || klein}`, f, [f * 10, f / 10, f + 10, f * 2].filter(x => x >= 2), `mt-${groot}.${klein}`, 2, { soort: 'metriek', groot, klein, f });
};
const ZELFDE = [['m', 'cm', 100, 'Een touw van Lars is {a} m lang. Een touw van Mila is {b} cm lang.', 'Wie heeft het langste touw?'], ['kg', 'g', 1000, 'Lars koopt {a} kg appels. Mila koopt {b} g appels.', 'Wie koopt de meeste appels?'], ['l', 'ml', 1000, 'Lars drinkt {a} l water. Mila drinkt {b} ml water.', 'Wie drinkt het meeste water?'], ['uur', 'minuut', 60, 'Lars wacht {a} uur. Mila wacht {b} minuten.', 'Wie wacht het langst?'], ['m²', 'dm²', 100, 'De tafel van Lars is {a} m² groot. De tafel van Mila is {b} dm² groot.', 'Wie heeft de grootste tafel?']];
const zelfde = (r) => {
  const [groot, klein, f, zin, vraag] = kies(r, ZELFDE), a = r.geheel(2, 9), gelijk = r.volgende() < 0.2, b = gelijk ? a * f : a * f + kies(r, [-1, 1]) * r.geheel(1, 4) * (f / 10) * kies(r, [1, 3]);
  const antwoord = gelijk ? 'evenveel' : a * f > b ? 'Lars' : 'Mila';
  return mk(`${zin.replace('{a}', a).replace('{b}', duizend(b))} ${vraag} Zet eerst in dezelfde maateenheid. ____`, antwoord, ['Lars', 'Mila', 'evenveel'].filter(x => x !== antwoord), `zd-${groot}.${a}.${b}`, 3, { soort: 'zelfde', groot, klein, a, b, f, antwoord });
};
const INTERVAL = [['de lengte van een tafel', 'verhoudingsmeting'], ['de massa van een boek', 'verhoudingsmeting'], ['de tijdsduur van een les', 'verhoudingsmeting'], ['de temperatuur in de klas', 'intervalmeting'], ['het tijdstip waarop de les begint', 'intervalmeting'], ['de hoeveelheid water in een fles', 'verhoudingsmeting']];
const interval = (r) => {
  if (r.volgende() < 0.35) {
    const warm = r.volgende() < 0.5, t = r.geheel(2, 15);
    return warm
      ? mk(`Het is ${t} °C en later ${2 * t} °C. Is het dan twee keer zo warm? ____`, 'nee', ['ja', 'soms'], `iv-t${t}`, 3, { soort: 'interval', t })
      : (() => { const m = r.geheel(2, 15) * 5; return mk(`Een pakje weegt ${m} g en een tweede pakje ${2 * m} g. Is het tweede pakje twee keer zo zwaar? ____`, 'ja', ['nee', 'soms'], `iv-m${m}`, 3, { soort: 'interval', m }); })();
  }
  const [wat, a] = kies(r, INTERVAL);
  return mk(`Is ${wat} een verhoudingsmeting of een intervalmeting? ____`, a, ['verhoudingsmeting', 'intervalmeting'].filter(x => x !== a).concat(['geen meting']), `iv-${wat}`, 2, { soort: 'interval', wat });
};
const LIJNEN = [
  ['Je wilt de lengte van een kromme lijn meten. Wat kun je doen? ____', 'Een touwtje langs de lijn leggen en het touwtje meten.', ['Enkel de afstand tussen begin en einde meten.', 'Het kan niet, een kromme lijn heeft geen lengte.', 'De lijn rechtzetten met een liniaal.']],
  ['Een gebroken lijn bestaat uit drie rechte stukken. Hoe vind je de lengte van de hele lijn? ____', 'De lengtes van de stukken optellen.', ['Enkel het langste stuk meten.', 'De lengtes van de stukken aftrekken.', 'Het eerste en laatste stuk vermenigvuldigen.']],
  ['De rand van een plas is grillig. Hoe kun je die lengte meten? ____', 'Met een touwtje of een rolmeter de rand volgen.', ['Het kan niet, de rand is niet recht.', 'Alleen de breedte van de plas meten.', 'Tellen hoeveel plassen er zijn.']],
];
const OPP_LIJNEN = [
  ['Je wilt weten hoe groot een grillige vorm is. Wat kun je doen? ____', 'Vierkantjes over de vorm leggen en tellen hoeveel er in passen.', ['Enkel de langste zijde meten.', 'Het kan niet, de vorm is niet recht.', 'De omtrek met een liniaal meten en dat de oppervlakte noemen.']],
  ['De oppervlakte van een bladvorm meet je op ruitjespapier door ____', 'de ruitjes binnen de vorm te tellen.', ['de ruitjes buiten de vorm te tellen.', 'de ruitjes op de rand van het papier te tellen.', 'de vorm te wegen met een liniaal.']],
];
const lijn = (r, p) => { const [v, a, f] = kies(r, p.oppervlakte && r.volgende() < 0.5 ? OPP_LIJNEN : LIJNEN); return mk(v, a, f, `ln-${v}`, 2, { soort: 'lijn', oppervlakte: !!p.oppervlakte }); };

const SOORTEN = { grootheid, verhouding, rangschikken, conservatie, standaard, omgekeerd, benadering, metriek, zelfde, interval, lijn };
const MEETINZICHT_OPDRACHT = { kiezen: 'Lees goed. Kies het juiste antwoord. Omcirkel.', 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' };
export const MEETINZICHT_VORMEN = maakOpgaveVormen({
  id: 'mzi', titel: 'Inzicht in meten', doelen: AUTO_DOELEN.mzi || [], parameters: K.meetinzichtParameters, standaard: { soort: 'grootheid', jaar: 1 }, vormen: ['kiezen', 'juist-fout'], pictogram: 'meten',
  opdracht: MEETINZICHT_OPDRACHT, opgave: (r, p) => SOORTEN[p.soort](r, p),
});

/* ------------------------------------------------------------------ begrippen: maatgetal, maateenheid, maat, meetresultaat, basis/hoogte, kg/dm³ */
const MATEN = [[45, 'cm', 'lengte'], [8, 'kg', 'massa'], [250, 'ml', 'inhoud'], [3, 'm', 'lengte'], [12, 'dl', 'inhoud'], [600, 'g', 'massa'], [7, 'km', 'lengte'], [35, 'l', 'inhoud']];
const begrip = (r, p) => {
  const t = kies(r, p.types);
  if (t === 'basis') {
    if (r.volgende() < 0.5) { const b = r.geheel(3, 12), h = r.geheel(2, 9); return mk(`Een rechthoek is ${b} cm breed en ${h} cm hoog. De basis is de onderkant. De hoogte is ____ cm.`, h, [b, b + h, b * h, b - h], `bg-h${b}.${h}`, 2, { soort: 'basis', b, h }); }
    return mk('De hoogte van een rechthoek staat ____ op de basis.', 'loodrecht', ['evenwijdig', 'schuin', 'altijd evenlang'], 'bg-lood', 2, { soort: 'basis' });
  }
  if (t === 'dichtheid') {
    const klein = r.volgende() < 0.5, stof = kies(r, ['ijzer', 'hout', 'klei', 'zand', 'water', 'steen']), x = r.geheel(2, 9);
    return klein
      ? mk(`De massa van 1 cm³ ${stof} is ${x} g. Dat schrijf je als ${x} ____`, 'g/cm³', ['g/cm²', 'cm³/g', 'g/cm'], `dh-1${stof}${x}`, 3, { soort: 'dichtheid', x })
      : mk(`De massa van 1 dm³ ${stof} is ${x} kg. Dat schrijf je als ${x} ____`, 'kg/dm³', ['kg/dm²', 'dm³/kg', 'kg/dm'], `dh-2${stof}${x}`, 3, { soort: 'dichtheid', x });
  }
  const [n, e, g] = kies(r, MATEN), maat = `${n} ${e}`;
  if (t === 'maatgetal') return mk(`Je meet de ${g} en vindt ${maat}. Het maatgetal is ____`, n, [e, maat, n * 10], `mg-${maat}`, 1, { soort: t, n, e });
  if (t === 'maateenheid') return mk(`Je meet de ${g} en vindt ${maat}. De maateenheid is ____`, e, [String(n), maat, ['cm', 'kg', 'l'].find(x => x !== e)], `me-${maat}`, 1, { soort: t, n, e });
  if (t === 'maat') return mk(`Je meet de ${g} en vindt ${maat}. ${maat} noem je de ____`, 'maat', ['maateenheid', 'maatgetal', 'basis'], `mm-${maat}`, 2, { soort: t, n, e });
  return mk(`Je meet de ${g} en schrijft ${maat} op. Wat je gemeten hebt, is het ____ van je meting.`, 'meetresultaat', ['maatgetal', 'maateenheid', 'instrument'], `mr-${maat}`, 2, { soort: t, n, e });
};
export const MEETBEGRIP_VORMEN = maakOpgaveVormen({
  id: 'mbg', titel: 'Begrippen bij meten', doelen: AUTO_DOELEN.mbg || [], parameters: K.maatBegripParameters, standaard: { types: ['maatgetal', 'maateenheid'], jaar: 2 }, vormen: ['kiezen', 'invullen', 'juist-fout'], pictogram: 'meten',
  opdracht: { invullen: 'Lees goed. Schrijf het antwoord op de lijn.', ...MEETINZICHT_OPDRACHT }, opgave: begrip,
});

/* ------------------------------------------------------------------ een meetinstrument correct hanteren */
const INSTRUMENTEN = [
  { vanaf: 1, v: 'Je meet een potlood met een lat. Waar leg je het begin van het potlood? ____', a: 'bij de 0 van de lat', f: ['bij de 1 van de lat', 'bij de 10 van de lat', 'ergens op de lat'] },
  { vanaf: 1, v: 'Je leest een lat af. Hoe kijk je naar het streepje? ____', a: 'recht van boven', f: ['schuin van opzij', 'van heel ver weg'] },
  { vanaf: 1, v: 'Voor je iets weegt, staat de weegschaal op ____', a: 'nul', f: ['100 g', '1 kg'] },
  { vanaf: 1, v: 'Je wilt enkel de rijst wegen, niet de kom. Wat doe je? ____', a: 'Je zet de lege kom op de weegschaal en zet de weegschaal op nul.', f: ['Je giet de rijst naast de kom.', 'Je weegt de kom en de rijst en schrijft dat op.'] },
  { vanaf: 1, v: 'Je leest het water in een maatbeker af. Hoe kijk je? ____', a: 'op ooghoogte, recht naar de waterspiegel', f: ['van boven op de beker', 'van onder de tafel'] },
  { vanaf: 1, v: 'Bij het aflezen staat de maatbeker ____', a: 'op een vlakke tafel', f: ['scheef in je hand', 'ondersteboven'] },
  { vanaf: 3, v: 'Je meet de temperatuur van water. Het uiteinde van de thermometer zit ____', a: 'in het water', f: ['naast het water', 'boven het water'] },
  { vanaf: 3, v: 'Voor je met een chronometer start, zet je hem op ____', a: '0', f: ['de vorige tijd', '12'] },
  { vanaf: 3, v: 'Je wilt de lengte van een kamer meten. Welk instrument past het best? ____', a: 'een rolmeter', f: ['een lat van 30 cm', 'een thermometer'] },
  { vanaf: 5, v: 'Je meet een hoek met een geodriehoek. Het middelpunt van de geodriehoek leg je op ____', a: 'de top van de hoek', f: ['het uiteinde van een been', 'het midden van de hoek', 'buiten de hoek'] },
  { vanaf: 5, v: 'Je meet een hoek met een geodriehoek. Een been van de hoek ligt langs ____', a: 'de lijn met 0° op de geodriehoek', f: ['de lijn met 180° op de bovenrand', 'het bovenste gaatje', 'niets, dat maakt niet uit'] },
];
export const INSTRUMENT_HANTEREN_VORMEN = maakOpgaveVormen({
  id: 'mih', titel: 'Een meetinstrument juist gebruiken', doelen: AUTO_DOELEN.mih || [], parameters: K.instrumentHanterenParameters, standaard: { jaar: 3 }, vormen: ['kiezen', 'juist-fout'], pictogram: 'meten',
  opdracht: MEETINZICHT_OPDRACHT,
  opgave: (r, p) => { const i = kies(r, INSTRUMENTEN.filter(x => x.vanaf <= p.jaar)); return mk(i.v, i.a, i.f, `ih-${i.v}`, i.vanaf, { soort: 'instrument', vanaf: i.vanaf }); },
});

/* ------------------------------------------------------------------ digitale rekentool */
const rekentool = (r, p) => {
  if (p.soort === 'rest') {
    const d = r.geheel(12, 97), q = r.geheel(20, 400), rest = r.geheel(1, d - 1), n = d * q + rest;
    return mk(`Bereken met je rekentoestel de rest van ${duizend(n)} : ${d}. De rest is ____`, rest, [q, d - rest, rest + 1, rest - 1], `rt-${n}.${d}`, 3, { soort: 'rest', n, d, q, rest });
  }
  if (p.soort === 'procent') {
    const pct = kies(r, [5, 8, 12, 15, 18, 22, 35, 45, 65, 75, 85]), a = r.geheel(8, 120) * 10, uit = (a * pct) / 100;
    return mk(`Bereken met je rekentoestel: ${pct} % van ${duizend(a)} = ____`, kom(uit), [kom(a / pct), kom(uit * 10), kom(uit / 10), kom(a + uit)], `pc-${pct}.${a}`, 3, { soort: 'procent', pct, a, uit });
  }
  if (r.volgende() < 0.5) {
    const a = r.geheel(1200, 9800), b = r.geheel(120, 980);
    return mk(`Bereken met je rekentoestel: ${duizend(a)} × ${b} = ____`, duizend(a * b), [duizend(a * b + 1000), duizend(a * b - 100), duizend(a + b), duizend(a * b * 10)], `gr-${a}.${b}`, 3, { soort: 'groot', a, b, uit: a * b });
  }
  const a = r.geheel(1210, 9890) / 1000, b = r.geheel(12, 98) / 10, uit = Math.round(a * b * 10000) / 10000;
  return mk(`Bereken met je rekentoestel: ${String(a).replace('.', ',')} × ${String(b).replace('.', ',')} = ____`, dec(uit), [dec(uit * 10), dec(uit / 10), dec(Math.round(uit * 100) / 100), dec(a + b)], `gr-d${a}.${b}`, 3, { soort: 'groot-decimaal', a, b, uit });
};
export const REKENTOOL_VORMEN = maakOpgaveVormen({
  id: 'drt', titel: 'Rekenen met een rekentoestel', doelen: AUTO_DOELEN.drt || [], parameters: K.rekentoolParameters, standaard: { soort: 'groot', jaar: 5 }, pictogram: 'schrijven',
  opdracht: { invullen: 'Gebruik je rekentoestel. Schrijf het antwoord op de lijn.', ...MEETINZICHT_OPDRACHT }, opgave: rekentool,
});

export const AUTO_AFWERKING5_VORMEN = [...MEETINZICHT_VORMEN, ...MEETBEGRIP_VORMEN, ...INSTRUMENT_HANTEREN_VORMEN, ...REKENTOOL_VORMEN];
