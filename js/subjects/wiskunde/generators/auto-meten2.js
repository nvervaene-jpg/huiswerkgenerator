// Meten: klokinzicht, dagen van de week, duur vergelijken en tijdbegrippen, thermometer, geld (lezen, kopen, samenstellen, prijsbegrippen) en hoeken samenstellen.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import * as M from '../meten-svg.js';
import { klok } from '../svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const nf = (a, extra = [], stap = 1) => [...extra, a + stap, a - stap, a + 2 * stap, a * 2].filter(x => Number.isFinite(x) && x > 0);
const MIN_TEKEN = '−';
const neg = (n) => (n < 0 ? `${MIN_TEKEN}${-n}` : String(n));

/* ------------------------------------------------------------------ klokinzicht */
const UREN_WOORD = ['twaalf', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];
const klokOpgave = (r, p) => {
  const jaar = p.jaar ?? 2, type = kies(r, p.types), data = { meten2: 'dkl', soort: type };
  if (type === 'digitaal') {
    const h = r.geheel(1, 12), m = jaar <= 1 ? 0 : jaar === 2 ? kies(r, [0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]) : r.geheel(0, 59);
    if (r.volgende() < 0.5) return mk('Schrijf de tijd van de klok zoals op een digitale klok. ____', klok({ h, m }), `${h}:${String(m).padStart(2, '0')}`, [`${h}:${String((m + 5) % 60).padStart(2, '0')}`, `${m === 0 ? 12 : Math.max(1, Math.round(m / 5)) % 12 || 12}:${String(h * 5 % 60).padStart(2, '0')}`, `${h % 12 + 1}:${String(m).padStart(2, '0')}`], `dk${h}.${m}`, 2, { ...data, h, m, wat: 'analoog-naar-digitaal' });
    if (m === 0) return mk('Hoe laat is het? Het is ____ uur.', M.digitaleKlok(h, 0), h, nf(h, [h % 12 + 1]).filter(x => x <= 12), `dd${h}`, 1, { ...data, h, m, wat: 'uur' });
    return mk(`De digitale klok toont ${h}:${String(m).padStart(2, '0')}. Hoeveel minuten na ${UREN_WOORD[h % 12]} uur is het? ____`, M.digitaleKlok(h, m), m, nf(m, [60 - m], 5).filter(x => x < 60), `dm${h}.${m}`, 3, { ...data, h, m, wat: 'minuten' });
  }
  if (type === 'wijzer') {
    const h = r.geheel(1, 12), m = kies(r, [0, 15, 30, 45, 10, 20, 40, 50]), groot = r.volgende() < 0.5;
    return mk(`De ${groot ? 'grote' : 'kleine'} wijzer van de klok wijst de ____ aan. (uren of minuten)`, klok({ h, m }), groot ? 'minuten' : 'uren', [groot ? 'uren' : 'minuten'], `dw${h}.${m}${groot}`, 2, { ...data, groot });
  }
  if (type === 'notatie') {
    const h = r.geheel(1, 23), m = r.geheel(1, 59), mm = String(m).padStart(2, '0');
    return r.volgende() < 0.5 ? mk(`${h}.${mm} uur schrijf je op een digitale klok als ____.`, null, `${h}:${mm}`, [`${h}.${mm}`, `${h}:${m}`, `${mm}:${h}`], `dn${h}.${m}`, 2, { ...data, h, m, wat: 'tekst-naar-klok' })
      : mk(`Op een digitale klok staat ${h}:${mm}. Dat schrijf je ook als ____ uur.`, null, `${h}.${mm}`, [`${h}:${mm}`, `${h}.${m}`, `${mm}.${h}`], `dp${h}.${m}`, 2, { ...data, h, m, wat: 'klok-naar-tekst' });
  }
  const voor = r.volgende() < 0.5, h = voor ? r.geheel(8, 11) : r.geheel(1, 5), wat = kies(r, ['eet een koekje', 'speelt buiten', 'leest een boek', 'tekent een prent']);
  return mk(`Lotte ${wat} om ${h} uur ${voor ? "'s morgens" : "'s middags"}. Dat is in de ____. (voormiddag of namiddag)`, null, voor ? 'voormiddag' : 'namiddag', [voor ? 'namiddag' : 'voormiddag'], `dd${h}${voor}${wat}`, 2, { ...data, h, voor });
};
export const KLOKINZICHT_VORMEN = maakOpgaveVormen({
  id: 'dkl', titel: 'Klok en tijd', doelen: AUTO_DOELEN.dkl || [], parameters: K.klokInzichtParameters, standaard: { types: ['digitaal'], jaar: 2 },
  opdracht: opdracht('Kijk naar de klok. Vul aan op de lijn.', 'Kijk naar de klok. Kies het juiste antwoord. Omcirkel.'), opgave: klokOpgave, schaal: 1.2,
});

/* ------------------------------------------------------------------ dagen van de week */
export const DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const dagenOpgave = (r, p) => {
  const jaar = p.jaar ?? 0, soort = kies(r, jaar <= 0 ? ['volgende', 'vorige'] : ['volgende', 'vorige', 'tussen', 'aantal']), i = r.geheel(0, 6), data = { meten2: 'dgn', soort };
  const dag = (k) => DAGEN[((k % 7) + 7) % 7];
  if (soort === 'volgende') return mk(`Welke dag komt na ${dag(i)}? ____`, null, dag(i + 1), DAGEN.filter(d => d !== dag(i + 1)), `dv${i}`, 1, { ...data, i });
  if (soort === 'vorige') return mk(`Welke dag komt vóór ${dag(i)}? ____`, null, dag(i - 1), DAGEN.filter(d => d !== dag(i - 1)), `dz${i}`, 1, { ...data, i });
  if (soort === 'tussen') return mk(`Welke dag ligt tussen ${dag(i)} en ${dag(i + 2)}? ____`, null, dag(i + 1), DAGEN.filter(d => d !== dag(i + 1)), `dt${i}`, 2, { ...data, i });
  const n = r.geheel(2, 5);
  return mk(`Het is ${dag(i)}. Hoeveel dagen later is het ${dag(i + n)}? ____`, null, n, nf(n, [7 - n]).filter(x => x <= 7), `da${i}.${n}`, 3, { ...data, i, n });
};
export const DAGEN_VORMEN = maakOpgaveVormen({
  id: 'dgn', titel: 'Dagen van de week', doelen: AUTO_DOELEN.dgn || [], parameters: K.dagenParameters, standaard: { jaar: 1 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.', 'Lees goed. Kies het juiste antwoord. Omcirkel.'), opgave: dagenOpgave,
});

/* ------------------------------------------------------------------ duur vergelijken en tijdbegrippen */
const ACTIVITEITEN = ['tanden poetsen', 'een film kijken', 'een les volgen', 'het avondeten', 'de pauze', 'naar school fietsen', 'een boek lezen', 'een tekening maken'];
export const duurTekst = (min) => (min % 60 === 0 ? `${min / 60} uur` : `${min} minuten`);
export const BEGRIPPEN = [['trimester', 3, 'maanden'], ['semester', 6, 'maanden'], ['decennium', 10, 'jaar'], ['eeuw', 100, 'jaar'], ['millennium', 1000, 'jaar']];
const duurOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, type = kies(r, p.types), data = { meten2: 'dur', soort: type };
  if (type === 'vergelijk') {
    const waarden = jaar <= 1 ? [5, 10, 60, 120, 180] : [5, 10, 15, 20, 30, 45, 60, 90, 120, 180], n = jaar <= 0 ? 2 : 3;
    const mins = r.schud(waarden).slice(0, n), namen = r.schud(ACTIVITEITEN).slice(0, n), langst = r.volgende() < 0.5;
    const items = namen.map((naam, i) => ({ naam, min: mins[i] }));
    const doel = langst ? items.reduce((a, b) => (b.min > a.min ? b : a)) : items.reduce((a, b) => (b.min < a.min ? b : a));
    const zinnen = items.map(x => `${x.naam[0].toUpperCase()}${x.naam.slice(1)} duurt ${duurTekst(x.min)}.`).join(' ');
    return mk(`${zinnen} Welke activiteit duurt het ${langst ? 'langst' : 'kortst'}? ____`, null, doel.naam, items.filter(x => x !== doel).map(x => x.naam), `dv${items.map(x => x.naam + x.min).join()}${langst}`, 2, { ...data, items, langst });
  }
  if (type === 'uur') {
    const soort = kies(r, ['uur', 'halfuur', 'tweeuur', 'kwartier']), [tekst, min] = { uur: ['Een uur', 60], halfuur: ['Een half uur', 30], tweeuur: ['Twee uur', 120], kwartier: ['Een kwartier', 15] }[soort];
    return mk(`${tekst} duurt ____ minuten.`, null, min, nf(min, [min * 2, min / 2], 10), `du${soort}`, 1, { ...data, maat: soort, min });
  }
  if (type === 'begrip' && r.volgende() < 0.25 && jaar >= 6) { const km = r.geheel(2, 9) * 10, u = kies(r, [2, 3, 4, 5]); return mk(`Een fietser legt ${km * u} km af in ${u} uur. De gemiddelde snelheid is ____ km per uur.`, null, km, nf(km, [km * u, u], 5), `dg${km}.${u}`, 3, { ...data, afstand: km * u, uren: u }); }
  const [naam, aantal, eenheid] = kies(r, jaar >= 6 ? BEGRIPPEN : BEGRIPPEN.slice(0, 2));
  const richting = r.geheel(0, 2);
  if (richting === 1 && eenheid === 'maanden') { const per = 12 / aantal; return mk(`Een jaar heeft ${12} maanden. Een jaar bestaat uit ____ ${naam === 'trimester' ? 'trimesters' : 'semesters'}.`, null, per, nf(per, [aantal, 12], 1), `dj${naam}`, 2, { ...data, naam, aantal, eenheid }); }
  if (richting === 2 && eenheid === 'maanden') { const k = r.geheel(2, 4); return mk(`${k} ${naam === 'trimester' ? 'trimesters' : 'semesters'} duren samen ____ maanden.`, null, k * aantal, nf(k * aantal, [k + aantal, 12], 3), `dk${naam}${k}`, 3, { ...data, naam, aantal, eenheid }); }
  return mk(`Een ${naam} duurt ____ ${eenheid}.`, null, aantal, nf(aantal, [aantal * 2, aantal / 2], aantal >= 100 ? aantal : 1).filter(x => Number.isInteger(x)), `db${naam}`, 2, { ...data, naam, aantal, eenheid });
};
export const DUUR_VORMEN = maakOpgaveVormen({
  id: 'dur', titel: 'Tijdsduur en tijdbegrippen', doelen: AUTO_DOELEN.dur || [], parameters: K.duurParameters, standaard: { types: ['uur'], jaar: 1 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.', 'Lees goed. Kies het juiste antwoord. Omcirkel.'), opgave: duurOpgave,
});

/* ------------------------------------------------------------------ thermometer */
const thermometerOpgave = (r, p) => {
  const jaar = p.jaar ?? 3, type = kies(r, p.types), data = { meten2: 'thm', soort: type };
  if (type === 'aflezen') {
    const min = jaar >= 4 && r.volgende() < 0.6 ? -10 : 0, v = r.geheel(min === 0 ? 1 : -9, 29), max = 30;
    return mk('Hoeveel graden Celsius wijst de thermometer aan? ____ °C', M.thermometer({ waarde: v, min, max }), neg(v), [neg(v + 1), neg(v - 1), neg(-v), neg(v + 5), neg(v - 5)].filter(x => x !== '0' || v !== 0), `th${v}.${min}`, min < 0 ? 4 : 2, { ...data, v, min, max });
  }
  if (type === 'punten') {
    const wat = kies(r, jaar >= 4 ? ['vries', 'kook', 'smelt'] : ['vries', 'kook']), tekst = { vries: 'Water bevriest bij', kook: 'Water kookt bij', smelt: 'IJs smelt bij' }[wat], antw = wat === 'kook' ? 100 : 0;
    const omgekeerd = r.volgende() < 0.5, zin = { vries: 'bevriest water', kook: 'kookt water', smelt: 'smelt ijs' }[wat];
    return mk(omgekeerd ? `Bij ____ °C ${zin}.` : `${tekst} ____ °C.`, null, antw, antw === 100 ? [0, 10, 50, 90] : [100, 10, 1, 32], `tp${wat}${omgekeerd}`, 1, { ...data, wat, omgekeerd });
  }
  const t = r.geheel(2, 35);
  return mk(`${t} graden Celsius schrijf je als ${t} ____.`, null, '°C', ['°F', 'C°', '°', 'gr C'], `te${t}`, 1, data);
};
export const THERMOMETER_VORMEN = maakOpgaveVormen({
  id: 'thm', titel: 'Temperatuur', doelen: AUTO_DOELEN.thm || [], parameters: K.thermometerParameters, standaard: { types: ['aflezen'], jaar: 3 },
  opdracht: opdracht('Kijk goed. Schrijf het antwoord op de lijn.', 'Kijk goed. Kies het juiste antwoord. Omcirkel.'), opgave: thermometerOpgave, schaal: 1,
});

/* ------------------------------------------------------------------ geld */
const VOORWERPEN = ['een bal', 'een boek', 'een pen', 'een ijsje', 'een puzzel', 'een schrift', 'een speelgoedauto', 'een appel'];
const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
export const EURO_WAARDEN = [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];                // in eurocent, van groot naar klein
export function minsteStukken(cent, waarden) {                                                                    // greedy; voor deze munt- en biljetreeks is dat het minimum
  let rest = cent, n = 0;
  for (const w of waarden) { n += Math.floor(rest / w); rest %= w; }
  return rest === 0 ? n : null;
}
const geldOpgave = (r, p) => {
  const jaar = p.jaar ?? 1, type = kies(r, p.types), data = { meten2: 'gld', soort: type };
  if (type === 'lezen') { const e = r.geheel(1, 10), w = kies(r, VOORWERPEN); return mk(`${hoofd(w)} kost € ${e}. Hoeveel euro kost het? ____`, M.prijskaartje(e, w), e, nf(e).filter(x => x <= 10), `gl${e}${w}`, 1, { ...data, e }); }
  if (type === 'meest') {
    const prijzen = r.schud([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 3), namen = r.schud(VOORWERPEN).slice(0, 3), meest = r.volgende() < 0.5;
    const items = namen.map((naam, i) => ({ naam, euro: prijzen[i] })), doel = items.reduce((a, b) => ((meest ? b.euro > a.euro : b.euro < a.euro) ? b : a));
    return mk(`${items.map(x => `${hoofd(x.naam)} kost ${x.euro} euro.`).join(' ')} Wat kost het ${meest ? 'meest' : 'minst'}? ____`, null, doel.naam, items.filter(x => x !== doel).map(x => x.naam), `gm${items.map(x => x.naam + x.euro).join()}${meest}`, 2, { ...data, items, meest });
  }
  if (type === 'euromunten') { const e = r.geheel(2, 10), w = kies(r, VOORWERPEN); return mk(`${hoofd(w)} kost ${e} euro. Je betaalt met muntstukken van 1 euro. Hoeveel muntstukken heb je nodig? ____`, null, e, nf(e).filter(x => x <= 10 || x === e + 1), `ge${e}${w}`, 1, { ...data, e }); }
  if (type === 'kopen') {
    const k = r.volgende() < 0.6 ? 2 : 3, namen = r.schud(VOORWERPEN).slice(0, k); let prijzen;
    do { prijzen = namen.map(() => r.geheel(1, 5)); } while (prijzen.reduce((a, b) => a + b, 0) > 10);
    const totaal = prijzen.reduce((a, b) => a + b, 0);
    return mk(`${namen.map((n, i) => `${hoofd(n)} kost ${prijzen[i]} euro.`).join(' ')} Je koopt alles. Hoeveel euro betaal je samen? ____`, null, totaal, nf(totaal).filter(x => x !== totaal), `gk${namen.map((n, i) => n + prijzen[i]).join()}`, 2, { ...data, prijzen, totaal });
  }
  if (type === 'samenstellen') {
    const reeks = jaar <= 1 ? [2000, 1000, 500, 200, 100] : jaar === 2 ? [10000, 5000, 2000, 1000, 500, 200, 100] : jaar === 3 ? [20000, 10000, 5000, 2000, 1000, 500, 200, 100] : EURO_WAARDEN;
    const max = jaar <= 1 ? 20 : jaar === 2 ? 100 : 200, cent = jaar >= 4 ? r.geheel(1, max * 100 / 5) * 5 : r.geheel(1, max) * 100;
    const n = minsteStukken(cent, reeks), tekst = jaar >= 4 ? `€ ${(cent / 100).toFixed(2).replace('.', ',')}` : `€ ${cent / 100}`;
    if (n === null) return null;
    return mk(`Je betaalt ${tekst} met zo weinig mogelijk biljetten en munten. Hoeveel stuks heb je nodig? ____`, null, n, nf(n), `gs${cent}${jaar >= 4}`, jaar >= 4 ? 4 : 2, { ...data, cent, reeks, n });
  }
  if (type === 'teken') {
    const e = r.geheel(2, 20);
    return jaar >= 4 && r.volgende() < 0.5 ? mk('De internationale afkorting voor euro is ____.', null, 'EUR', ['€', 'EU', 'E', 'USD'], 'gt2', 1, { ...data, wat: 'eur' })
      : mk(`Je schrijft ${e} euro met het eurosymbool als ____ ${e}.`, null, '€', ['$', '£', 'c', '%'], `gt1${e}`, 1, { ...data, wat: 'teken' });
  }
  // prijsbegrippen
  const soort = kies(r, jaar >= 6 ? ['winst', 'verlies', 'korting', 'kortingspct', 'winstpct', 'intrest'] : ['winst', 'verlies', 'korting', 'verkoop']), basis = r.geheel(2, 20) * 10;
  if (soort === 'winst') { const w = r.geheel(1, 9) * 5; return mk(`De inkoopprijs is € ${basis}. De verkoopprijs is € ${basis + w}. De winst is € ____.`, null, w, nf(w, [basis, basis + w], 5), `pw${basis}.${w}`, 2, { ...data, soort, inkoop: basis, verkoop: basis + w }); }
  if (soort === 'verlies') { const w = r.geheel(1, 9) * 5; return mk(`De inkoopprijs is € ${basis + w}. De verkoopprijs is € ${basis}. Het verlies is € ____.`, null, w, nf(w, [basis, basis + w], 5), `pv${basis}.${w}`, 2, { ...data, soort, inkoop: basis + w, verkoop: basis }); }
  if (soort === 'verkoop') { const w = r.geheel(1, 9) * 5; return mk(`De inkoopprijs is € ${basis}. De winst is € ${w}. De verkoopprijs is € ____.`, null, basis + w, nf(basis + w, [basis, w], 5), `pk${basis}.${w}`, 3, { ...data, soort, inkoop: basis, winst: w }); }
  if (soort === 'korting') { const k = r.geheel(1, 9) * 5; return mk(`De oude prijs is € ${basis + k}. De nieuwe prijs is € ${basis}. De korting is € ____.`, null, k, nf(k, [basis, basis + k], 5), `pn${basis}.${k}`, 2, { ...data, soort, oud: basis + k, nieuw: basis }); }
  if (soort === 'kortingspct') { const pct = kies(r, [10, 20, 25, 50]), oud = basis * 10, nieuw = oud - (oud * pct) / 100; return mk(`De oude prijs is € ${oud}. De nieuwe prijs is € ${nieuw}. Het kortingspercentage is ____ %.`, null, pct, nf(pct, [100 - pct], 5), `pp${oud}.${pct}`, 4, { ...data, soort, oud, nieuw }); }
  if (soort === 'winstpct') { const pct = kies(r, [10, 20, 25, 50]), inkoop = basis * 10, verkoop = inkoop + (inkoop * pct) / 100; return mk(`De inkoopprijs is € ${inkoop}. De verkoopprijs is € ${verkoop}. Het winstpercentage is ____ %.`, null, pct, nf(pct, [100 - pct], 5), `pq${inkoop}.${pct}`, 4, { ...data, soort, inkoop, verkoop }); }
  const kapitaal = basis * 10, pct = kies(r, [1, 2, 3, 4, 5]), intrest = (kapitaal * pct) / 100;
  return mk(`Het kapitaal is € ${kapitaal}. De intrest is ${pct} % per jaar. De intrest na één jaar is € ____.`, null, intrest, nf(intrest, [kapitaal, pct], 5), `pi${kapitaal}.${pct}`, 4, { ...data, soort: 'intrest', kapitaal, pct });
};
export const GELDINZICHT_VORMEN = maakOpgaveVormen({
  id: 'gld', titel: 'Geld en prijzen', doelen: AUTO_DOELEN.gld || [], parameters: K.geldInzichtParameters, standaard: { types: ['kopen'], jaar: 1 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.', 'Lees goed. Kies het juiste antwoord. Omcirkel.'), opgave: geldOpgave, schaal: 1.2,
});

/* ------------------------------------------------------------------ hoeken samenstellen */
const hoekSamenOpgave = (r) => {
  const a = r.geheel(2, 17) * 5, b = r.geheel(2, 17) * 5;
  if (r.volgende() < 0.5) return a + b <= 180 ? mk(`Een hoek van ${a}° en een hoek van ${b}° leg je naast elkaar. Samen zijn ze ____°.`, null, a + b, nf(a + b, [Math.abs(a - b)], 5), `hs${a}.${b}`, 2, { meten2: 'hks', soort: 'som', a, b }) : null;
  const rest = [90, 180][r.geheel(0, 1)];
  return a < rest ? mk(`${rest === 90 ? 'Een rechte hoek' : 'Een gestrekte hoek'} is ${rest}°. Eén deel is ${a}°. Het andere deel is ____°.`, null, rest - a, nf(rest - a, [a, rest + a], 5), `hr${rest}.${a}`, 3, { meten2: 'hks', soort: 'rest', a, rest }) : null;
};
export const HOEKSAMEN_VORMEN = maakOpgaveVormen({
  id: 'hks', titel: 'Hoeken samenstellen', doelen: AUTO_DOELEN.hks || [], parameters: K.hoekSamenParameters, standaard: { jaar: 3 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.', 'Lees goed. Kies het juiste antwoord. Omcirkel.'), opgave: hoekSamenOpgave,
});

export const AUTO_METEN2_VORMEN = [...KLOKINZICHT_VORMEN, ...DAGEN_VORMEN, ...DUUR_VORMEN, ...THERMOMETER_VORMEN, ...GELDINZICHT_VORMEN, ...HOEKSAMEN_VORMEN];
