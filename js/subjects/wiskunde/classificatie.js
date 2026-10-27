// Koppelt wiskundedoelen aan automatische oefenfamilies, op basis van de tekst van het doel.
// Elke familie heeft een id en een functie parameters(doel) die de parameters voor dat doel teruggeeft (of null als het doel er niet bij hoort).
// Het script scripts/bouw-koppelingen.mjs gebruikt dit om auto-doelen.js te genereren; de generators gebruiken dezelfde functies om de
// parameters van een doel te bepalen. De tests controleren dat het gegenereerde bestand klopt.
export const jaar = (d) => (d.leerjaar === 'K3' ? 0 : Number(d.leerjaar.slice(1)));

// Grootste getal uit 'het getal is ≤ 1 000 000' of 'tot en met 10 000' in de tekst, anders null.
export function grensVan(tekst) {
  const mil = /(?:≤|tot en met|tot)\s*(\d+)?\s*(miljard|miljoen)/i.exec(tekst);
  if (mil) return (mil[1] ? Number(mil[1]) : 1) * (mil[2].toLowerCase() === 'miljard' ? 1e9 : 1e6);
  const m = /(?:≤|tot en met|tot)\s*(\d[\d ]*\d|\d)/.exec(tekst);
  return m ? Number(m[1].replace(/ /g, '')) : null;
}
export const standaardGrens = (d) => [20, 20, 100, 1000, 10000, 1000000, 10000000000][jaar(d)] ?? 1000;
export const grens = (d) => grensVan(d.tekst) ?? standaardGrens(d);

const heeft = (d, re) => re.test(d.tekst);

/* ---- rekeneigenschappen */
const ALLE_EIGENSCHAPPEN = ['comm+', 'ncomm-', 'comm×', 'ncomm:', 'ass+', 'nass-', 'ass×', 'nass:', 'dist×+', 'dist×-', 'dist:+', 'dist:-', 'n0+', 'n0-', 'n1×', 'n1:', 'op0×', 'op0:'];
export function eigenschapParameters(d) {
  const t = d.tekst;
  let types = null;
  if (/commutativiteit van de optelling/.test(t)) types = ['comm+', 'ncomm-'];
  else if (/commutativiteit van de vermenigvuldiging/.test(t)) types = ['comm×', 'ncomm:'];
  else if (/associativiteit van de optelling/.test(t)) types = ['ass+', 'nass-'];
  else if (/associativiteit van de vermenigvuldiging/.test(t)) types = ['ass×', 'nass:'];
  else if (/distributiviteit van de vermenigvuldiging t\.o\.v\. de optelling\/aftrekking/.test(t)) types = ['dist×+', 'dist×-'];
  else if (/distributiviteit van de vermenigvuldiging t\.o\.v\. de optelling/.test(t)) types = ['dist×+'];
  else if (/distributiviteit van de deling t\.o\.v\. de optelling\/aftrekking/.test(t)) types = ['dist:+', 'dist:-'];
  else if (/distributiviteit van de deling t\.o\.v\. de optelling/.test(t)) types = ['dist:+'];
  else if (/bijzondere rol van 0 voor de optelling en aftrekking|0 als neutraal element voor de optelling/.test(t)) types = ['n0+', 'n0-'];
  else if (/bijzondere rol van 0 en 1 voor de vermenigvuldiging en deling/.test(t)) types = ['n1×', 'n1:', 'op0×', 'op0:'];
  else if (/1 als neutraal element voor de vermenigvuldiging/.test(t)) types = ['n1×', 'n1:'];
  else if (/0 als opslorpend element voor de vermenigvuldiging/.test(t)) types = ['op0×', 'op0:'];
  else if (/optellen\/aftrekken als elkaars inverse/.test(t)) types = ['inv+-'];
  else if (/vermenigvuldigen\/delen als elkaars inverse/.test(t)) types = ['inv×:'];
  else if (/vermenigvuldiging als een herhaalde optelling/.test(t)) types = ['herh'];
  else if (/eigenschappen \(neutraal element, commutativiteit, associativiteit, distributiviteit\)/.test(t)) types = ALLE_EIGENSCHAPPEN;
  else if (/som van twee getallen niet verandert/.test(t)) types = ['comp+'];
  else if (/verschil van twee getallen niet verandert/.test(t)) types = ['comp-'];
  else if (/product van twee getallen niet verandert/.test(t)) types = ['comp×'];
  else if (/quotiënt van twee getallen niet verandert/.test(t)) types = ['comp:'];
  else if (/product of quotiënt niet verandert als we een factor of de deler ontbinden|factor ontbinden om handig|de deler ontbinden om handig/.test(t)) types = ['ontb'];
  else if (/D = d × q \+ r/.test(t)) types = ['deelrest'];
  else if (/eigenschappen van bewerkingen en relaties gebruiken om handig te rekenen/.test(t)) types = ['dist×+', 'dist×-', 'comm×', 'ass×', 'comp+', 'comp×', 'comp-'];
  return types ? { types, jaar: jaar(d) } : null;
}

/* ---- getalkennis: tellen, afronden, deelbaarheid, delers en veelvouden, rangtelwoorden, getallen in woorden, plaatswaarde */
const WOORDGETAL = { een: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10 };
const natuurlijk = (d) => d.subdomein === 'Natuurlijke getallen';
export function tellenParameters(d) {
  const t = d.tekst;
  if (!(natuurlijk(d) || /Positieve rationale/.test(d.subdomein))) return null;
  if (/begrip/.test(t) || !/(telrij|doortellen|terugtellen|tellen met|tellen \([^)]*\) met sprongen|tellen, |tellen\)|verkort tellen|1 meer en 1 minder)/.test(t) || /(aantallen|turven)/.test(t) && !/telrij/.test(t)) return null;
  if (/akoestisch tellen|resultatief|synchroon/.test(t) && !/telrij/.test(t)) return null;
  const dec = /tienden en honderdsten/.test(t);
  let stappen = [];
  const sprong = /sprongen van ([^.]*?)(?: in functie| i\.f\.v\.|\.|$)/.exec(t);
  if (sprong) {
    stappen = (sprong[1].match(/\d+(?: \d{3})*|\btwee\b|\bvijf\b|\btien\b/g) || []).map(x => WOORDGETAL[x] ?? Number(x.replace(/ /g, '')));
    if (/miljoen|miljard/.test(sprong[1])) stappen = [1e6, 1e7, 1e8, 1e9];
    if (/buiten de tafels/.test(t)) stappen = [11, 12, 13, 15, 20, 25];
  }
  if (/eenheden/.test(t)) stappen.push(1);
  if (/tweetallen/.test(t)) stappen.push(2);
  if (/vijftallen/.test(t)) stappen.push(5);
  if (/tientallen/.test(t)) stappen.push(10);
  let max = grens(d);
  const boven = /boven (\d+)/.exec(t);
  if (boven) max = Number(boven[1]) * 2;
  if (/machten van tien/.test(t)) stappen.push(...[10, 100, 1000].filter(x => x * 2 <= max));
  if (/verkort tellen/.test(t)) stappen.push(2, 5);
  if (/sprongen van 20 en 250|sprongen van 1000/.test(t) === false && !stappen.length && /telrij|1 meer en 1 minder/.test(t)) stappen.push(1);
  if (dec) return { stappen: [10, 1], max: 1000, dec: 2, terug: /terugtellen/.test(t), buur: false, jaar: jaar(d) };
  const uniek = [...new Set(stappen)].filter(x => x > 0 && x * 2 <= Math.max(max, 4));
  if (!uniek.length) return null;
  return { stappen: uniek, max, dec: 0, terug: /terugtellen/.test(t), buur: /1 meer en 1 minder|juist ervoor/.test(t), jaar: jaar(d) };
}
const EENHEDEN = [[/miljard/, 1e9], [/miljoen/, 1e6], [/honderd{1,2}uizend/, 1e5], [/tienduizend/, 1e4], [/(?<!tien|honderd|honder)duizend/, 1e3], [/honderd(?!d?uizend)/, 100], [/tien(?!duizend)(-|tal)/, 10]];
export function afrondParameters(d) {
  if (!natuurlijk(d) || !/afronden/.test(d.tekst) || /kennen het begrip/.test(d.tekst)) return null;
  const eenheden = EENHEDEN.filter(([re]) => re.test(d.tekst)).map(([, w]) => w).sort((a, b) => a - b);
  if (!eenheden.length) return null;
  return { eenheden, max: grens(d), jaar: jaar(d) };
}
export function deelbaarParameters(d) {
  const t = d.tekst;
  if (!/deelbaarheid/.test(t) || /begrip/.test(t)) return null;
  const m = /deling door ([\d, enen]+?)(?: \[|\.|$)/.exec(t) || /deelbaarheid door ([\d, enen]+?)(?: \[|\.|$)/.exec(t) || /(?:kenmerken (?:van )?deelbaarheid)(?: bij [^.]*?)? door ([\d, enen]+?)(?: \[|\.|$)/.exec(t);
  const delers = m ? (m[1].match(/\d+/g) || []).map(Number) : [];
  if (!delers.length) return null;
  return { delers, max: grensVan(t) ?? ({ 2: 100, 3: 1000, 4: 10000, 5: 1000000, 6: 10000000000 }[jaar(d)] ?? 1000), rest: /rest/.test(t), jaar: jaar(d) };
}
export function veelParameters(d) {
  const t = d.tekst;
  if (!natuurlijk(d)) return null;
  let types = null;
  if (/delers en veelvouden bepalen/.test(t)) types = ['deler', 'veelvoud'];
  else if (/gemeenschappelijke deler,? (en )?het (\(?kleinste\)? )?gemeenschappelijk veelvoud/.test(t) && !/kennen het begrip/.test(t)) types = ['ggd', 'kgv'];
  else if (/priemgetal/.test(t)) types = ['priem'];
  else if (/ontbinden in priemfactoren/.test(t)) types = ['priemfactoren'];
  return types ? { types, jaar: jaar(d) } : null;
}
export function rangParameters(d) {
  if (!natuurlijk(d) || !/rangtelwoorden/.test(d.tekst)) return null;
  const m = /tot en met (\w+)ste?/.exec(d.tekst);
  return { max: /honderdste/.test(d.tekst) ? 100 : /twintigste/.test(d.tekst) ? 20 : 10 };
}
export function woordParameters(d) {
  const t = d.tekst;
  if (!natuurlijk(d) || /begrip/.test(t)) return null;
  if (!(/lezen en schrijven|lezen\./.test(t) || /verband tussen telwoorden/.test(t))) return null;
  if (/akoestisch|aanduiding voor/.test(t)) return null;
  return { max: grens(d), jaar: jaar(d) };
}
export function waardeParameters(d) {
  const t = d.tekst;
  if (!natuurlijk(d) || /kennen (de|het) begrip|aanduiding/.test(t)) return null;
  let types = null;
  if (/waarde van een cijfer/.test(t) && jaar(d) >= 5) types = ['waarde'];
  else if (/splitsen en samenstellen in/.test(t) && !/decimale/.test(t) && jaar(d) >= 5) types = ['splits', 'samenstel'];
  else if (/\(her\)structureren/.test(t) && jaar(d) >= 1) types = ['herstruct'];
  return types ? { types, max: grens(d), jaar: jaar(d) } : null;
}
export function aanduidingParameters(d) {
  const m = /als aanduiding voor een (aantal|rangorde|code)/.exec(d.tekst);
  if (!natuurlijk(d) || !m) return null;
  return { soort: m[1], max: grens(d), jaar: jaar(d) };
}
export function tafelParameters(d) {
  const t = d.tekst;
  if (d.domein !== 'Bewerkingen') return null;
  if (/vermenigvuldigings- en deeltafels van 1, 2,\S*10 paraat/.test(t) && jaar(d) >= 5) return { tafels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], jaar: jaar(d) };
  if (/(vermenigvuldigingstafels|vermenigvuldigings- en deeltafels) van 11, 12 en 15 paraat/.test(t)) return { tafels: [11, 12, 15], jaar: jaar(d) };
  return null;
}
export function deelSprongParameters(d) {
  if (d.domein !== 'Bewerkingen' || !/quotiënt bepalen door sprongen te tellen/.test(d.tekst)) return null;
  return { max: grens(d), jaar: jaar(d) };
}

/* ---- rationale getallen: breuken, procenten en decimale getallen */
const rationaal = (d) => /Positieve rationale/.test(d.subdomein) || d.subdomein === 'Bewerkingen met breuken en procenten';
export function breukDeelParameters(d) {
  const t = d.tekst;
  if (!rationaal(d) || /kennen (de )?begrip/.test(t)) return null;
  const types = [];
  if (/helft, een kwart en het dubbel als operator/.test(t)) types.push('halfdubbel');
  if (/bij een gegeven geheel en breuk(\/procent)?, het deel (bepalen|aanduiden)|breuk van een getal nemen|breuk als operator en als deel van een geheel|breuk \(noemer ≤ 100\) ?\/procent als operator|breuk van een getal als een vermenigvuldigingsfactor/.test(t)) types.push('breuk-van');
  if (/procent van een getal (als een vermenigvuldigingsfactor|nemen)|gegeven geheel en breuk\/procent/.test(t)) types.push('procent-van');
  if (/bij een gegeven deel en (on)?(echte )?breuk.*het geheel|gegeven deel en breuk\/procent, het geheel/.test(t)) types.push('geheel');
  if (/bij een gegeven geheel en deel, de breuk\/het procent benoemen/.test(t)) types.push('benoem');
  if (!types.length) return null;
  const noemer = /noemer ≤ 100|\/procent|procent van/.test(t) ? 100 : 20;
  return { types: [...new Set(types)], noemer, jaar: jaar(d) };
}
export function omzetParameters(d) {
  const t = d.tekst;
  if (!rationaal(d) || /kennen (de )?begrip/.test(t)) return null;
  const types = [];
  if (d.domein !== 'Getallenkennis') return null;
  if (/gelijkwaardige breuken bepalen/.test(t)) types.push('gelijkwaardig');
  if (/(?<!te )vereenvoudigen/.test(t) && /kunnen/.test(t)) types.push('vereenvoudig', 'gelijknamig');
  if (/naar elkaar omzetten|verband tussen een breuk/.test(t)) types.push('dec-breuk', 'breuk-procent', 'procent-dec');
  if (/paraat/.test(t)) types.push('paraat');
  if (/gelijkwaardige breuken, het procent en het decimale getal als verschillende notaties|gelijkwaardige breuken en het decimaal getal als verschillende notaties|uitbreiding van het plaatswaardesysteem via de breuken/.test(t)) types.push('dec-breuk');
  return types.length ? { types: [...new Set(types)], noemer: /≤ 100/.test(t) ? 100 : 20, jaar: jaar(d) } : null;
}
export function rationaalVergelijkParameters(d) {
  const t = d.tekst;
  if (!rationaal(d) || !/vergelijken, ordenen en plaatsen op de getallenas|vergelijken en ordenen door gebruik te maken van handige strategieën/.test(t) || /natuurlijke/.test(t)) return null;
  let types = ['gl', 'ong'];
  if (/gelijknamige breuken \(waarbij/.test(t) && !/ongelijknamige/.test(t) && !/\(on\)gelijknamige/.test(t)) types = ['gl'];
  if (/decimale getallen \(tot op 1 h\)/.test(t)) types = ['dec'];
  if (/procenten|\(on\)gelijknamige breuken, procenten/.test(t)) types = ['gl', 'ong', 'dec', 'gemengd'];
  return { types, jaar: jaar(d) };
}
export function decimaalParameters(d) {
  const t = d.tekst;
  if (!rationaal(d) || /kennen (de )?begrip|tellen, doortellen/.test(t)) return null;
  const types = [];
  if (/decimale getallen \(tot op 1 (h|d)\) (lezen en noteren|in herkenbare contexten)|decimale getallen \(tot op 1 duizendste\) lezen/.test(t)) types.push('plaats');
  if (/breuken \(met noemer ≤ 100\) ?\/procenten \(tot op eenheid\) en decimale getallen \(tot op 1 duizendste\) lezen en noteren|breuken \(noemer ≤ 100\), procenten \(tot op eenheid\) en decimale getallen \(tot op 1 duizendste\) lezen/.test(t)) types.push('plaats');
  if (/decimale getallen .*(splitsen en samenstellen)/.test(t)) types.push('dec-splits', 'dec-samenstel');
  if (/decimale getallen \(tot op 1 d\) en procenten \(tot op (een )?eenheid\) afronden/.test(t)) types.push('dec-afronden');
  if (!types.length) return null;
  return { types: [...new Set(types)], decimalen: /1 duizendste|1 d\)|1 d /.test(t) ? 3 : 2, jaar: jaar(d) };
}
export function breukBewerkingParameters(d) {
  const t = d.tekst;
  if (d.domein !== 'Bewerkingen' || d.subdomein !== 'Bewerkingen met breuken en procenten') return null;
  if (/schematische voorstelling|schematisch/.test(t)) return null;
  const types = [];
  if (/gelijknamige breuken \(noemer ≤ 20\) optellen en aftrekken/.test(t)) types.push('gl+', 'gl-');
  if (/\(on\)gelijknamige breuken.*(optellen en aftrekken)|basisregel voor het optellen en aftrekken/.test(t)) types.push('ong+', 'ong-');
  if (/breuken.*vermenigvuldigen|breuk x breuk/.test(t) && !/schematisch/.test(t)) types.push('maal');
  if (/breuken.*delen|breuk : breuk/.test(t)) types.push('deel');
  if (/drie basisregels (toepassen|die)/.test(t)) types.push('ong+', 'ong-', 'maal', 'deel');
  return types.length ? { types: [...new Set(types)], noemer: 20, jaar: jaar(d) } : null;
}
export function decimaleBewerkingParameters(d) {
  const t = d.tekst;
  if (d.domein !== 'Bewerkingen') return null;
  const types = [];
  if (/decimale getallen tot op 1 (honderdste|duizendste) optellen en aftrekken/.test(t)) types.push('dec+', 'dec-');
  if (/decimale getallen tot op 1 (honderdste|duizendste) vermenigvuldigen met een natuurlijk getal/.test(t)) types.push('dec×');
  if (/decimale getallen tot op 1 duizendste delen door een natuurlijk getal/.test(t)) types.push('dec:');
  if (/decimale getallen (\(tot op 1d\) )?(vermenigvuldigen|vermenigvuldigingen en delingen).*om te zetten naar breuken|decimale getallen vermenigvuldigen door ze om te zetten/.test(t)) types.push('dec×dec');
  if (/decimale getallen delen door ze om te zetten naar breuken/.test(t)) types.push('dec×dec');
  if (/cijferalgoritmes voor vermenigvuldigen en delen gebruiken voor decimale getallen/.test(t)) types.push('dec×', 'dec:');
  return types.length ? { types: [...new Set(types)], decimalen: /duizendste/.test(t) ? 3 : 2, jaar: jaar(d) } : null;
}

/* ---- hoofdrekenen, cijferen, schatten en controleren */
const bewerking = (d) => d.domein === 'Bewerkingen';
const getalUit = (t) => (t.match(/\d+(?: \d{3})*(?:,\d+)?/g) || []).map(x => { const [e, f = ''] = x.replace(/ /g, '').split(','); return { t: Number(e + f), k: f.length }; });
export function tienvoudParameters(d) {
  const m = /werkwijze voor (?:het )?vermenigvuldigen met en delen door ([^.]*)\.?$/.exec(d.tekst);
  if (!bewerking(d) || !m) return null;
  const factoren = getalUit(m[1]);
  return factoren.length ? { factoren, jaar: jaar(d) } : null;
}
export function compenseerParameters(d) {
  const t = d.tekst;
  if (!bewerking(d) || !/bij hoofdrekenen \(≤ [\d ]+\) compenseren/.test(t)) return null;
  const types = /inverse bewerking/.test(t) ? ['inv+', 'inv-'] : ['keer+', 'keer-', 'dubbel', 'halve'];
  return { types, max: grens(d), jaar: jaar(d) };
}
export function handigParameters(d) {
  const t = d.tekst;
  if (!bewerking(d)) return null;
  const max = grens(d), types = [];
  if (/van plaats wisselen/.test(t) && !/begrippen/.test(t)) types.push('wissel');
  if (/verschil bepalen tot een volgend\/vorig tiental/.test(t)) types.push('tiental');
  if (/aftrekken door aanvullend optellen/.test(t)) types.push('aanvul');
  if (/naar analogie met optellingen en aftrekkingen/.test(t)) types.push('analogie');
  if (/natuurlijke getallen[^.]*optellen en aftrekken door de tweede term te splitsen in opeenvolgende rangen/.test(t)) types.push('splitsr');
  if (/vermenigvuldigingen uitvoeren op basis van de distributiviteit/.test(t)) types.push('distr×');
  if (/delingen uitvoeren door het deeltal te splitsen in een som/.test(t)) types.push('distr:');
  if (/hun berekeningen (met tussenstappen )?noteren met tussenstappen|berekeningen met tussenstappen noteren|berekeningen noteren met tussenstappen/.test(t)) types.push('tussen');
  if (/verschillende rekenmethodes voor hoofdrekenen met natuurlijke getallen|hoofdrekenen \(standaardprocedures en handig rekenen\)|kunnen hoofdrekenen met natuurlijke getallen/.test(t)) { const j = jaar(d); types.push('tiental', 'aanvul', ...(j >= 2 ? ['splitsr'] : []), ...(j >= 3 ? ['distr×', 'distr:'] : [])); }
  return types.length ? { types, max: Math.min(max <= 20 && /optellen en aftrekken door|vermenigvuldigingen|delingen/.test(t) ? 10000 : max, 10000), jaar: jaar(d) } : null;
}
export function schatParameters(d) {
  const t = d.tekst;
  if (!bewerking(d) || !/schatten door gebruik te maken van afrondingsregels|schatting maken op basis van afrondingsregels|schattend rekenen wanneer/.test(t)) return null;
  return { max: { 3: 1000, 4: 10000, 5: 10000, 6: 10000 }[jaar(d)] ?? 1000, jaar: jaar(d) };
}
export function controleParameters(d) {
  const t = d.tekst;
  if (!bewerking(d) || d.subdomein !== 'Controlestrategieën' || !/omgekeerde bewerking|controlestrategie/.test(t)) return null;
  return { types: /schatting maken/.test(t) && !/omgekeerde/.test(t) ? ['schat'] : /omgekeerde bewerking/.test(t) && !/schatting/.test(t) ? ['inv'] : ['inv', 'schat'], max: 1000 * (jaar(d) >= 4 ? 10 : 1), jaar: jaar(d) };
}
export function cijferParameters(d) {
  const t = d.tekst;
  if (!bewerking(d) || d.subdomein !== 'Cijferen' || /decimale/.test(t)) return null;
  const types = [];
  if (/optellen en aftrekken/.test(t)) types.push('cijfer+', 'cijfer-');
  if (/vermenigvuldigen en delen/.test(t)) types.push('cijfer×', 'cijfer:');
  if (!types.length) return null;
  const max = grensVan(t) ?? (jaar(d) === 3 ? 1000 : 10000);
  return { types, max, eenvoudig: /vorm E is/.test(t), jaar: jaar(d) };
}
export function volgordeParameters(d) {
  const t = d.tekst;
  if (!bewerking(d)) return null;
  if (/rekenvolgorde van links naar rechts/.test(t)) return { types: ['lr'], jaar: jaar(d) };
  if (/gebruik van haakjes om de rekenvolgorde te benadrukken|volgorde van bewerkingen en het gebruik van haakjes/.test(t)) return { types: ['maalvoor', 'haakjes'], jaar: jaar(d) };
  return null;
}
export function gelijkParameters(d) {
  const t = d.tekst;
  if (!bewerking(d) || !/gelijkheidsteken/.test(t) || /notaties/.test(t)) return null;
  return { jaar: jaar(d) };
}

/* ---- meten en metend rekenen */
const meten = (d) => d.domein === 'Meten en metend rekenen';
export function eenheidParameters(d) {
  const m = /maateen(?:heden|heid) en (?:hun|haar) wiskundige notaties?:\s*(.+?)\.?$/.exec(d.tekst);
  if (!meten(d) || !m) return null;
  const paren = [];
  let voorvoegsel = '';
  for (const x of m[1].matchAll(/([^,()]+?) \(([^)]+)\)/g)) {
    let naam = x[1].trim().replace(/^en\s+/, '');
    const sym = x[2].trim();
    if (/^(vierkante|kubieke) /.test(naam)) voorvoegsel = naam.split(' ')[0] + ' ';
    else if (/[²³]/.test(sym) && voorvoegsel) naam = voorvoegsel + naam;
    else voorvoegsel = '';
    paren.push([naam, sym]);
  }
  return paren.length ? { paren, jaar: jaar(d) } : null;
}
export function herleidParameters(d) {
  const t = d.tekst;
  if (!meten(d) || !/herleidingen|landmaat omzetten|inhoudsmaat naar een volumemaat/.test(t) || jaar(d) < 5) return null;
  if (/breukschaal/.test(t)) return null;
  const types = [];
  if (/lengte, oppervlakte en inhoud/.test(t)) types.push('lengte', 'opp', 'inhoud');
  else if (d.subdomein === 'Massa' && /ton gebruikt/.test(t)) types.push('ton');
  else if (d.subdomein === 'Massa' && /inhoudsmaten\/volumematen/.test(t)) types.push('massa', 'massa-vol');
  else if (d.subdomein === 'Massa') types.push('massa');
  if (/landmaat/.test(t)) types.push('landmaat');
  if (/inhoudsmaat naar een volumemaat/.test(t)) types.push('inh-vol');
  return types.length ? { types, groot: jaar(d) >= 6, jaar: jaar(d) } : null;
}
export function schaalParameters(d) {
  const t = d.tekst;
  if (!meten(d) && d.subdomein !== 'Meetkundige transformaties') return null;
  const types = [];
  if (meten(d) && /samengestelde grootheid schaal|schaal, de werkelijke afstand of de afstand op schaal bepalen/.test(t)) types.push('plan', 'werkelijk', 'schaal');
  if (/breukschaal naar een lijnschaal/.test(t)) types.push('omzet');
  if (d.subdomein === 'Meetkundige transformaties' && /vergroting\/verkleining met een vaste verhouding|schaal als het verband tussen lengtes/.test(t) && /kennen|kunnen figuren vergroten/.test(t) && !/begrip/.test(t)) types.push('vergroot');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function evenredigParameters(d) {
  const t = d.tekst;
  if (!meten(d) || !/verhoudingstabel/.test(t)) return null;
  return { jaar: jaar(d) };
}
export function snelheidParameters(d) {
  const t = d.tekst;
  if (!meten(d) || !/gemiddelde snelheid|samengestelde grootheid snelheid/.test(t) || /begrip/.test(t)) return null;
  const alle = /twee van de drie grootheden gegeven zijn/.test(t);
  return { types: alle ? ['v', 'afstand', 'tijd'] : ['v'], jaar: jaar(d) };
}
export function brutoNettoParameters(d) {
  if (!meten(d) || !/brutomassa, de nettomassa of de tarramassa bepalen/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function dichtheidParameters(d) {
  if (!meten(d) || !/massadichtheid, de massa of het volume bepalen|samengestelde grootheid massadichtheid/.test(d.tekst)) return null;
  return { types: /bepalen wanneer twee/.test(d.tekst) ? ['d', 'm', 'V'] : ['d'], jaar: jaar(d) };
}
export function prijsParameters(d) {
  const t = d.tekst;
  if (!meten(d) || d.subdomein !== 'Geld') return null;
  if (/een prijs \(inkoopprijs, verkoopprijs, winst, verlies, korting\) of hun percentage bepalen/.test(t)) return { types: ['winst', 'verlies', 'verkoop', 'korting', 'nieuwe', 'pct-korting', 'pct-winst'], jaar: jaar(d) };
  if (/een prijs \(inkoopprijs, verkoopprijs, winst, verlies, korting\) bepalen/.test(t)) return { types: ['winst', 'verlies', 'verkoop', 'korting', 'nieuwe'], jaar: jaar(d) };
  if (/intrest\/intrestpercentage, een kapitaal, een tijdsduur bepalen/.test(t)) return { types: ['intrest', 'kapitaal', 'tijd'], jaar: jaar(d) };
  return null;
}
export function tijdsduurParameters(d) {
  const t = d.tekst;
  if (!meten(d)) return null;
  if (/een tijdsduur berekenen in uren, minuten, seconden/.test(t)) return { types: ['uren', 'sec'], jaar: jaar(d) };
  if (/een tijdsduur berekenen in dagen\/maanden\/jaren/.test(t)) return { types: ['dagen'], jaar: jaar(d) };
  if (/jaartal situeren in een eeuw/.test(t)) return { types: ['eeuw'], jaar: jaar(d) };
  if (/(?:kunnen|kan) een tijdsduur meten\.?$|een chronometer gebruiken om een bepaalde tijdsduur/.test(t.trim())) return { types: ['uren', 'sec'], jaar: jaar(d) };
  return null;
}
export function temperatuurParameters(d) {
  if (!meten(d) || !/temperatuurintervallen bepalen/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function formuleParameters(d) {
  const t = d.tekst;
  if (!meten(d) || d.rubriek !== 'Indirect meten' || d.subdomein !== 'Lengte – oppervlakte – inhoud/volume') return null;
  const types = [];
  if (/omtrek van een veelhoek als de som/.test(t)) types.push('omtrek-veelhoek');
  if (/oppervlakte van een vierkant en een rechthoek als basis maal hoogte/.test(t)) types.push('opp-rechthoek');
  if (/omtrek berekenen van een vierkant, een rechthoek en samengestelde/.test(t)) types.push('omtrek-rechthoek', 'omtrek-samengesteld');
  if (/oppervlakte berekenen van een vierkant, een rechthoek\.?$/.test(t)) types.push('opp-rechthoek');
  if (/oppervlakte berekenen van samengestelde figuren/.test(t)) types.push('opp-samengesteld');
  if (/oppervlakte van een driehoek, een parallellogram en een ruit/.test(t)) types.push('opp-driehoek', 'opp-parallellogram', 'opp-ruit');
  if (/oppervlakte van een trapezium/.test(t)) types.push('opp-trapezium');
  if (/omtrek van een cirkel/.test(t)) types.push('omtrek-cirkel');
  if (/oppervlakte van een cirkel/.test(t)) types.push('opp-cirkel');
  if (/oppervlakte van een kubus, balk en cilinder/.test(t)) types.push('oppv-kubus', 'oppv-balk');
  if (/volume van een kubus, balk/.test(t)) types.push('vol-kubus', 'vol-balk');
  if (/volume van een cilinder/.test(t)) types.push('vol-cilinder');
  if (/volume van een recht prisma/.test(t)) types.push('vol-prisma');
  if (/volume van een kegel\/piramide/.test(t)) types.push('vol-kegel');
  if (/formules toepassen om de omtrek en de oppervlakte van vlakke figuren/.test(t)) types.push('omtrek-rechthoek', 'opp-rechthoek', 'opp-driehoek', 'opp-parallellogram', 'omtrek-cirkel', 'opp-cirkel');
  if (/formules toepassen om de oppervlakte en het volume van ruimtefiguren/.test(t)) types.push('oppv-kubus', 'oppv-balk', 'vol-kubus', 'vol-balk', 'vol-cilinder');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
const KALENDER_TERMEN = [['weekend', 'week'], ['weekdag', 'week'], ['week', 'week'], ['uur', 'uur'], ['halfuur', 'uur'], ['minuut', 'uur'], ['kwartier', 'uur'], ['seconde', 'uur'], ['jaar \\(365 dagen\\)', 'jaar'], ['schrikkeljaar', 'jaar'], ['trimester', 'periode'], ['semester', 'periode'], ['decennium', 'periode'], ['eeuw', 'periode'], ['millen+ium', 'periode'], ['maanden van het jaar', 'maand'], ['aantal dagen van de maanden', 'maand'], ['dagen van de week', 'dagnaam'], ['datum lezen', 'datum']];
export function kalenderParameters(d) {
  const t = d.tekst;
  if (!meten(d) || d.subdomein !== 'Tijdstip en tijdsduur') return null;
  const tags = new Set();
  if (/kennen de begrippen/.test(t) || /kennen het begrip/.test(t) || /de maanden van het jaar|aantal dagen van de maanden|dagen van de week in de juiste volgorde|een datum lezen/.test(t)) {
    if (/voormiddag, namiddag/.test(t)) return null;
    for (const [re, tag] of KALENDER_TERMEN) if (new RegExp(re).test(t)) tags.add(tag);
  }
  if (/kennen het begrip en de wiskundige notatie: de seconde|kennen de begrippen en wiskundige notaties: het uur \(u\), het halfuur, de minuut/.test(t)) tags.add('uur');
  if (/het begrip: de \(gemiddelde\) snelheid/.test(t)) return null;
  return tags.size ? { tags: [...tags], jaar: jaar(d) } : null;
}

/* ---- statistiek en kansrekenen */
const statistiek = (d) => d.subdomein === 'Statistiek';
export function diagramParameters(d) {
  const t = d.tekst;
  if (!statistiek(d) || /begrip/.test(t)) return null;
  const types = [];
  if (/informatie uit een tabel aflezen|informatie uit een tabel, beeld- en staafdiagram aflezen|informatie uit een tabel, lijngrafiek|informatie uit een tabel, cirkeldiagram en staafdiagram aflezen|informatie uit een cirkeldiagram, staafdiagram of lijngrafiek|grafieken waarbij twee grootheden/.test(t)) {
    types.push('tabel');
    if (/staafdiagram/.test(t)) types.push('staaf');
    if (/beeld/.test(t)) types.push('beeld');
    if (/lijngrafiek|twee grootheden/.test(t)) types.push('lijn');
    if (/cirkeldiagram/.test(t)) types.push('cirkel');
  }
  if (/gegevens verzamelen en in een tabel|tabel en staafdiagram opstellen|lijngrafieken en cirkeldiagrammen opstellen|gegevens verzamelen en in een tabel, beelddiagram/.test(t)) types.push('turven', 'tabel');
  if (/histogrammen aflezen/.test(t)) types.push('staaf');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function cirkelVerbandParameters(d) {
  return statistiek(d) && /verband tussen een cirkeldiagram en de kennis van hoeken, breuken, procenten/.test(d.tekst) ? { jaar: jaar(d) } : null;
}
export function gemiddeldeParameters(d) {
  const t = d.tekst;
  if (d.rubriek !== 'Gemiddelde en mediaan') return null;
  const types = [];
  if (/gemiddelde/.test(t)) types.push('gemiddelde');
  if (/mediaan/.test(t)) types.push('mediaan');
  if (/gelijke verdeling/.test(t)) types.push('verdeling');
  if (/niet altijd samenvalt met de mediaan/.test(t)) types.push('verschil');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function kansParameters(d) {
  const t = d.tekst;
  if (d.subdomein !== 'Kansrekenen' || /begrip/.test(t)) return null;
  const types = [];
  if (/kans als een breuk en als procent|kans als de verhouding|kansen berekenen/.test(t)) types.push('breuk', 'procent');
  if (/kansexperimenten uitvoeren|benadering voor de kans|veel pogingen/.test(t)) types.push('experiment');
  if (/waarde van 0 % \(nooit\)/.test(t)) types.push('nooit-altijd');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}

// Vraagstukken en probleemoplossend denken: welke soorten verhaaltjes bij een doel horen (zie generators/auto-vraagstukken.js).
export function vraagstukParameters(d) {
  if (!['Vraagstukken', 'Probleemoplossend denken'].includes(d.subdomein)) return null;
  const t = d.tekst, types = [], add = (...x) => types.push(...x);
  if (/overbodige gegevens/.test(t)) add('overbodig');
  if (/misleidende signaalwoorden/.test(t)) add('signaal');
  if (/(omgekeerd redeneren|en\/of omgekeerd)/.test(t)) add('omgekeerd');
  if (/enkelvoudige vraagstukken oplossen over optellen en aftrekken/.test(t) && !/decimale|breuken/.test(t)) add('enkel');
  if (/decimale getallen tot op 1 h enkelvoudige/.test(t)) add('dec');
  if (/breuken \(noemer ≤ 20.*optellen en aftrekken/.test(t)) add('breuk+');
  if (/(?<!enkelvoudige )vraagstukken oplossen over optellen en aftrekken, vermenigvuldigen en delen|enkelvoudige en samengestelde vraagstukken/.test(t)) add('enkel', 'samengesteld');
  if (/één grootheid/.test(t)) add('grootheid');
  if (/recht evenredige grootheden|verhoudingstabel|vaste verhoudingen|ontbrekende verhoudingsgetal/.test(t)) add('verhouding');
  if (/omgekeerd evenredige|recht, omgekeerd en niet-evenredige/.test(t)) add('omgekeerd-evenredig', 'niet-evenredig');
  if (/breuk als operator/.test(t)) add('breuk-van');
  if (/vraagstukken oplossen over breuken en procenten/.test(t)) add('breuk-van', 'procent-van');
  if (/delers, veelvouden en restbepaling/.test(t)) add('rest');
  if (/de som en het verschil/.test(t)) add('som-verschil');
  if (/de som en de verhouding/.test(t)) add('som-verhouding');
  if (/prijsberekeningen/.test(t)) add('prijs');
  if (/bruto, tarra/.test(t)) add('bruto');
  if (/schaal, lengte op schaal/.test(t)) add('schaal');
  if (/afstand, snelheid en tijd/.test(t)) add('snelheid');
  if (/meetkundige figuren/.test(t)) add('meetkunde');
  if (/over statistiek/.test(t)) add('stat');
  if (/groeipercentages/.test(t)) add('groei');
  if (/absolute en relatieve vergelijkingen/.test(t)) add('relatief');
  if (/mengsels/.test(t)) add('mengsel');
  if (/bevolkingsdichtheid/.test(t)) add('bevolking');
  if (/massadichtheid/.test(t)) add('massadichtheid');
  if (/wiskundige problemen met .* oplossen door (denkstappen|heuristieken)|problemen in spel- en leersituaties/.test(t)) add('enkel', 'puzzel', ...(/meerdere bewerkingen/.test(t) ? ['samengesteld'] : []));
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}

// Meetkunde: vlakke figuren, ruimtefiguren, hoeken, lijnen, driehoeken, uitspraken en logica (zie generators/auto-meetkunde.js).
const meetkundeDoel = (d) => d.domein === 'Meetkunde';
export function figuurParameters(d) {
  if (!meetkundeDoel(d) || d.subdomein === 'Logica en verzamelingen') return null;
  const t = d.tekst, types = [];
  const figuren = /begrippen: de (hoek, de )?driehoek|begrippen: de vierhoek, de vijfhoek|vlakke figuren (herkennen|sorteren)|schematische voorstellingen van vlakke figuren herkennen|vlakke figuren sorteren op basis van eigenschappen|meetkundige objecten \(vlakke figuren en ruimtefiguren\)|eigenschappen i\.v\.m\. zijden|begrippen: de overstaande zijde, de diagonaal|begrippen: de diagonaal|begrippen: de zijde|vlakke figuur, ruimtefiguur/.test(t);
  if (figuren) types.push('naam', 'zijden', 'hoeken');
  if (/eigenschappen i\.v\.m\. zijden/.test(t)) types.push('rechte', 'evenwijdig');
  if (/diagonaal/.test(t)) types.push('diagonalen');
  if (/middelpunt, de diameter/.test(t)) types.push('cirkel');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function ruimteParameters(d) {
  if (!meetkundeDoel(d)) return null;
  const t = d.tekst, types = [];
  if (/ruimtefiguren (herkennen|sorteren)|begrippen: de kubus|begrip: de cilinder|meetkundige objecten \(vlakke figuren en ruimtefiguren\)|ruimtefiguur|\(recht\) prisma/.test(t)) types.push('naam');
  if (/eigenschappen van een ruimtefiguur|\(recht\) prisma|ruimtefiguren classificeren/.test(t)) types.push('tellen');
  if (/vlak, gebogen|beschrijven van ruimtefiguren|ruimtefiguren classificeren/.test(t)) types.push('oppervlak');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function hoekParameters(d) {
  if (d.subdomein !== 'Hoekgrootte' && !/scherpe, rechte en stompe|scherpe, rechte, stompe/.test(d.tekst)) return null;
  const t = d.tekst, types = [];
  if (/tekenen|geodriehoek|passer/.test(t)) return null;
  if (/kwalitatief (sorteren|ordenen|vergelijken)|scherpe|stompe|gestrekte hoek|hoekgroottes lezen|graad|graden/.test(t)) types.push('soort', 'graden');
  if (/kwalitatief (vergelijken|ordenen)|hoeken kwalitatief sorteren/.test(t)) types.push('vergelijk');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function lijnenParameters(d) {
  if (!(d.rubriek === 'Evenwijdig, loodrecht, snijdend' || /evenwijdig/.test(d.tekst)) || /tekenen/.test(d.tekst)) return null;
  const types = ['soort'];
  if (/notaties/.test(d.tekst)) types.push('teken');
  return { types, jaar: jaar(d) };
}
export function driehoekParameters(d) {
  if (!meetkundeDoel(d) || !/gelijkzijdige driehoek, de gelijkbenige|ongelijkbenige driehoek/.test(d.tekst)) return null;
  return { types: ['zijden', 'hoeken', ...(/regelmatige veelhoek/.test(d.tekst) ? ['regelmatig'] : [])], jaar: jaar(d) };
}
export function uitspraakParameters(d) {
  if (!meetkundeDoel(d) || d.subdomein === 'Logica en verzamelingen') return null;
  const t = d.tekst, types = [];
  if (/meetkundige objecten classificeren m\.b\.v\. verzamelingen|vlakke figuren classificeren|definities (formuleren|als uitspraken)|vanuit het classificeren/.test(t)) types.push('ook', 'definitie');
  if (/eigenschappen als uitspraken/.test(t)) types.push('eigenschap');
  if (/eigenschappen i\.v\.m\. diagonalen|alternatieve definities/.test(t)) types.push('diagonaal');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function logicaParameters(d) {
  if (d.subdomein !== 'Logica en verzamelingen') return null;
  const t = d.tekst, types = [];
  if (/venndiagram/.test(t)) types.push('venn');
  if (/alle, niet alle|sommige, geen enkele|juist één|ten minste|ten hoogste|waar of onwaar|waar\/niet waar|logische begrippen/.test(t)) types.push('kwantor');
  if (/als … dan|als \.\.\. dan|als, dan/.test(t)) types.push('alsdan');
  if (/behoort|object al dan niet tot|deelverzameling/.test(t)) types.push('behoort');
  if (/sorteren|classificeren volgens|doorsnede|en, of, niet|verzameling/.test(t)) types.push('sorteer');
  if (!types.length) types.push('sorteer', 'behoort');
  return { types: [...new Set(types)], jaar: jaar(d) };
}

// Meetkunde op ruitjespapier en met figuren: transformaties, tekenen, symmetrie, patronen, plaatsbepaling, congruentie en gelijkvormigheid.
const mk = (d) => d.domein === 'Meetkunde' && d.subdomein !== 'Logica en verzamelingen';
export function transformatieParameters(d) {
  if (!mk(d)) return null;
  const t = d.tekst, types = [];
  if (/een verschuiving, een draaiing, een spiegeling|verschuiving of draaiing herkennen|verschuiving, draaiing (en|of) spiegeling|begrippen: verschuiven, draaien, spiegelen|transformaties .*(benoemen|verzamelnaam)/.test(t) && !/tekenen/.test(t)) types.push('soort');
  if (/spiegelbeeld(?!en met materiaal)|origineel, het beeld|gespiegelde figuren herkennen|eigenschappen van een spiegeling|spiegelbeelden ontdekken/.test(t) && !/met materiaal leggen/.test(t)) types.push('spiegel');
  return types.length ? { types, jaar: jaar(d) } : null;
}
const tekenFamilie = (re) => (d) => (mk(d) && re.test(d.tekst) ? { jaar: jaar(d) } : null);
export const tekenSpiegelParameters = tekenFamilie(/figuren (spiegelen om een spiegelas|om een spiegelas spiegelen)/);
export const tekenVerschuifParameters = tekenFamilie(/een verschuiving tekenen|congruente figuren tekenen/);
export const tekenDraaiParameters = tekenFamilie(/een draaiing tekenen|congruente figuren tekenen/);
export const tekenVergrootParameters = tekenFamilie(/figuren vergroten\/verkleinen met een vaste verhouding|gelijkvormige figuren tekenen/);
export const tekenAssenParameters = tekenFamilie(/symmetrieassen in figuren tekenen/);
export function symmetrieParameters(d) {
  if (!mk(d) || /tekenen/.test(d.tekst) || !/symmetrie in eenvoudige figuren herkennen|symmetrie als een spiegeling|\(a\)symmetrie|symmetrieas/.test(d.tekst)) return null;
  return { types: ['jn', ...(/symmetrieas|spiegeling die een figuur op zichzelf afbeeldt|\(a\)symmetrie/.test(d.tekst) ? ['assen', 'as'] : [])], jaar: jaar(d) };
}
export function patroonParameters(d) {
  if (!mk(d) || d.rubriek !== 'Patronen' && !/begrippen: (het patroon|herhalende en veranderende patronen)/.test(d.tekst)) return null;
  const t = d.tekst, types = [];
  if (/herhalende|herhalend|het patroon, opnieuw|patronen hanteren/.test(t) || !/veranderend/.test(t)) types.push('volgend', 'opvullen', 'eenheid');
  if (/veranderend|herhalende en veranderende|patronen hanteren/.test(t)) types.push('verandering', 'volgende');
  return /rijen maken met een afgesproken eenheid/.test(t) ? null : { types: [...new Set(types)], jaar: jaar(d) };
}
export function plaatsParameters(d) {
  if (!mk(d)) return null;
  const t = d.tekst, types = [];
  if (/vakcoördinaten|notatie: D5/.test(t)) types.push('vak');
  if (/puntcoördinaten|de coördinaat|horizontale as, de verticale as/.test(t)) types.push('punt', ...(/horizontale as/.test(t) ? ['as'] : []));
  if (/situeren op basis van positie, afstand en richting ten opzichte van zichzelf en elkaar/.test(t)) types.push('rij');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function congruentieParameters(d) {
  if (!mk(d)) return null;
  const t = d.tekst, types = [];
  if (/congruent|even groot|gelijkheid van vorm én grootte/.test(t) && !/tekenen/.test(t)) types.push('congruent');
  if (/gelijkvormig|dezelfde vorm|gelijke vorm|vergroting\/verkleining van een vlakke figuur/.test(t) && !/tekenen/.test(t)) types.push('gelijkvormig');
  if (/de schaal, de lijnschaal|schaal als het verband/.test(t)) types.push('schaal');
  if (/een vergroting, een verkleining|vaste verhouding/.test(t) && !/tekenen|vergroten\/verkleinen met/.test(t)) types.push('factor');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}

// Meten: tijd (klok, dagen, duur), temperatuur, geld en hoeken samenstellen (zie generators/auto-meten2.js).
const meten2 = (d) => d.domein === 'Meten en metend rekenen';
export function klokInzichtParameters(d) {
  if (!meten2(d)) return null;
  const t = d.tekst, types = [];
  if (/tijd op een digitale klok .*aflezen en noteren|digitale en een analoge klok als middel|aanduiding van een tijdstip|klok gebruiken als middel om de tijd te meten/.test(t)) types.push('digitaal');
  if (/op een analoge klok de betekenis van de grote en de kleine wijzer/.test(t)) types.push('wijzer');
  if (/de notaties: 11\.17 uur/.test(t)) types.push('notatie');
  if (/begrippen: voormiddag, namiddag/.test(t)) types.push('dagdeel');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function dagenParameters(d) { return meten2(d) && /de dagen van de week/.test(d.tekst) ? { jaar: jaar(d) } : null; }
export function duurParameters(d) {
  if (!meten2(d)) return null;
  const t = d.tekst, types = [];
  if (/duur van activiteiten vergelijken en benoemen|begrippen: \(even\) lang/.test(t)) types.push('vergelijk');
  if (/het uur als aanduiding van een tijdsduur/.test(t)) types.push('uur');
  if (/trimester, het semester|de \(gemiddelde\) snelheid/.test(t)) types.push('begrip');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function thermometerParameters(d) {
  if (!meten2(d) || d.subdomein !== 'Temperatuur') return null;
  const t = d.tekst, types = [];
  if (/meten, aflezen en noteren|aflezen en noteren|onder het vriespunt/.test(t)) types.push('aflezen');
  if (/0 °C als het vriespunt/.test(t)) types.push('punten');
  if (/maateenheid en wiskundige notatie: graden Celsius/.test(t)) types.push('eenheid');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function geldInzichtParameters(d) {
  if (!meten2(d) || d.subdomein !== 'Geld') return null;
  const t = d.tekst, types = [];
  if (/prijs \(tot en met 10 euro\) aflezen|\(ronde\) prijzen/.test(t)) types.push('lezen');
  if (/kost meer\/minder|kost het meest/.test(t)) types.push('meest');
  if (/gevraagde prijs betalen met muntstukken van 1 euro|meerdere 'munten'/.test(t)) types.push('euromunten');
  if (/1 of meer objecten kopen met een totaalbedrag/.test(t)) types.push('kopen');
  if (/een bedrag samenstellen met de gekende|zo weinig mogelijk munten/.test(t)) types.push('samenstellen');
  if (/inkoopprijs, de verkoopprijs|oude prijs, de nieuwe prijs|korting\(percentage\)|winstpercentage|kapitaal, intrest/.test(t)) types.push('prijsbegrip');
  if (/maateenheid en wiskundige notatie: euro/.test(t)) types.push('teken');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function hoekSamenParameters(d) { return meten2(d) && /een hoek samenstellen met andere hoeken/.test(d.tekst) ? { jaar: jaar(d) } : null; }

// Meten: verbanden tussen maten, referentiematen, meetbegrippen en omtrek/oppervlakte/volume op rooster (zie generators/auto-meten3.js).
export function maatverbandParameters(d) {
  const t = d.tekst;
  if (!meten(d) || /herleiding/.test(t) || !/verbanden? tussen|opbouw van het metriek stelsel|uitbreiding van het metriek stelsel|verband met een kilogram|landmaten|verband tussen inhoud en volume/.test(t)) return null;
  const types = [];
  if (/landmaten/.test(t)) types.push('land');
  else if (/oppervlaktematen|maten voor oppervlakte/.test(t)) types.push('opp');
  if (/inhoudsmaten? \(|maten voor inhoud/.test(t) && !/inhoudsmaten\/volumematen/.test(t)) types.push('inhoud');
  if (/volumemaateenheden/.test(t)) types.push('vol');
  if (/maten voor massa|voor massa \(|massa \(kg/.test(t)) types.push('massa');
  if (/\bton\b/.test(t)) types.push('ton');
  if (/verband tussen inhoud en volume/.test(t)) types.push('inh-vol');
  if (/inhoudsmaten\/volumematen en massa/.test(t)) types.push('massa-vol');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function referentieParameters(d) {
  const t = d.tekst;
  if (!meten(d) || !/referentiematen|referentiepunten|grootte-orde/.test(t)) return null;
  const types = [];
  if (d.subdomein === 'Massa' || /massa|milligram|ton\b/.test(t)) types.push('massa');
  if (/lengte/.test(t)) types.push('lengte');
  if (/inhoud/.test(t)) types.push('inhoud');
  if (/oppervlakte|hectare/.test(t)) types.push('opp');
  if (/volume|volumematen/.test(t)) types.push('vol');
  if (/gekende grootheden/.test(t) || !types.length) types.push('lengte', 'inhoud', 'massa', 'opp');
  return { types: [...new Set(types)], jaar: jaar(d), focus: /milligram/.test(t) ? 'mg' : /ton\b/.test(t) && /grootte-orde/.test(t) ? 'ton' : /hectare/.test(t) ? 'land' : null };
}
export function meetbegripParameters(d) {
  const t = d.tekst;
  if (!meten(d)) return null;
  const types = [], begrippen = [];
  if (/de begrippen: bruto, netto, tarra/.test(t)) types.push('btn');
  const m = /de begrippen: (lengte, hoogte, diepte[^.]*?)(?: toepassen|\.|$)/.exec(t);
  if (m) { types.push('ctx'); for (const w of ['lengte', 'hoogte', 'diepte', 'afstand', 'inhoud', 'omtrek']) if (new RegExp(`\\b${w}\\b`).test(m[1])) begrippen.push(w); }
  else if (/de begrippen: (inhoud|omtrek)\.?$/.test(t)) { types.push('ctx'); begrippen.push(/inhoud/.test(t) ? 'inhoud' : 'omtrek'); }
  if (/begrippen: straal, diameter|begrippen?: π/.test(t)) types.push(/π/.test(t) ? 'pi' : 'straal');
  if (/inhoud van een voorwerp als de hoeveelheid/.test(t)) types.push('def-inhoud');
  if (/volume van een object als de ruimte|het begrip: volume|begrippen: oppervlakte, volume/.test(t)) types.push('def-volume');
  if (/dagelijkse leven vaak als gewicht/.test(t)) types.push('def-gewicht');
  if (/hoogte als de afstand tussen de gekozen basis/.test(t)) types.push('def-hoogte');
  if (/begrippen: de massa, de balans, de weegschaal/.test(t)) types.push('def-weeg');
  if (/massa niet enkel bepaald wordt door het ingenomen volume/.test(t)) types.push('massa-volume');
  if (/geschikt meetinstrument voor (lengte|inhoud|massa)/.test(t)) types.push('instr');
  return types.length ? { types, begrippen, jaar: jaar(d), instr: ['lengte', 'inhoud', 'massa'].filter(w => new RegExp(`meetinstrument voor ${w}`).test(t)) } : null;
}
export function omtrekRoosterParameters(d) {
  const t = d.tekst;
  if (!meten(d)) return null;
  const types = [];
  if (/omtrek van een vlakke figuur meten/.test(t)) types.push('omtrek');
  if (/oppervlakte meten met roosterpapier/.test(t)) types.push('opp');
  if (/volume afpassen met kubussen/.test(t)) types.push('kubus');
  if (/figuren met eenzelfde oppervlakte een verschillende omtrek/.test(t)) types.push('zelfde');
  if (/lengte en omtrek als een eendimensionale|volume als een driedimensionale/.test(t)) types.push('dim');
  return types.length ? { types, jaar: jaar(d) } : null;
}

// Natuurlijke getallen: notaties, begrippen, rijen, Romeinse cijfers, getallenas en aantallen (zie generators/auto-getallen2.js).
const getallenK = (d) => d.domein === 'Getallenkennis';
export function relatieParameters(d) {
  if (!getallenK(d)) return null;
  const t = d.tekst, types = [];
  if (/wiskundige notaties: =, ≠, <, >/.test(t)) types.push('kl', 'ne');
  if (/wiskundige notaties: ≤, ≥/.test(t)) types.push('le');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function getalBegripParameters(d) {
  if (!getallenK(d)) return null;
  const t = d.tekst, types = [];
  if (/het cijfer \(de symbolen 0 tot en met 9\), het getal/.test(t)) types.push('cijfer');
  if (/de begrippen: het aantal, de rangorde; even, oneven/.test(t)) types.push('aantal');
  if (/de begrippen: deelbaar, de deler, de rest, het veelvoud/.test(t)) types.push('deel');
  if (/het begrip: afronden/.test(t)) types.push('afronden');
  if (/tienduizendtallen \(TD\)/.test(t)) types.push('td');
  if (/honderdduizendtallen \(HD\), miljoentallen/.test(t)) types.push('hd', 'm');
  if (/tienmiljoentallen \(TM\)/.test(t)) types.push('tm', 'hm', 'mrd');
  if (/miljoen als eenheid/.test(t)) types.push('miljoen');
  if (/miljoen, miljard als eenheid/.test(t)) types.push('miljoen', 'miljard');
  if (/het begrip: getallenas/.test(t)) types.push('as');
  if (/de begrippen: tussen, één meer\/één minder/.test(t)) types.push('tussen', 'een-meer');
  if (/de begrippen: van minder naar meer/.test(t)) types.push('orde-rij');
  if (/de begrippen: middelste, vorige, volgende/.test(t)) types.push('middelste', 'vorig-volgend');
  if (/de begrippen: hoeveel, geen enkel/.test(t)) types.push('hoeveel');
  if (/de begrippen: juist ervoor, juist erna/.test(t)) types.push('ervoor-erna');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}
export function rijParameters(d) {
  if (!getallenK(d)) return null;
  const t = d.tekst, j = jaar(d);
  if (/orde, regelmaat, verbanden en patronen tussen (natuurlijke )?getallen/.test(t)) return { types: j >= 6 ? ['plus', 'min', 'mal', 'kwadr', 'driehoek', 'fib', 'afwisselend'] : ['plus', 'min', 'mal', 'kwadr'], jaar: j };
  if (/wiskundige rijen maken of herkennen/.test(t)) return { types: j <= 2 ? ['plus', 'min'] : j === 3 ? ['plus', 'min', 'mal'] : ['plus', 'min', 'mal', 'kwadr', 'afwisselend'], jaar: j };
  if (/tellen met sprongen buiten de tafels/.test(t)) return { types: ['buiten'], jaar: j };
  return null;
}
export function romeinsParameters(d) {
  const t = d.tekst;
  if (!/Romeinse cijfers|additief systeem/.test(t)) return null;
  return { types: /additief systeem/.test(t) ? ['systeem'] : ['lezen', 'schrijf'], jaar: jaar(d) };
}
export function getallenasParameters(d) {
  if (!getallenK(d)) return null;
  const t = d.tekst, m = /natuurlijke getallen \(≤ (\d[\d ]*|10 miljard)\)/.exec(t);
  if (!m) return null;
  const max = m[1] === '10 miljard' ? 1e10 : Number(m[1].replace(/ /g, ''));
  if (/vergelijken, ordenen en plaatsen op de getallenas/.test(t)) return { types: ['plaats', 'vergelijk'], max, jaar: jaar(d) };
  if (/grootteordes inschatten/.test(t)) return { types: ['orde'], max, jaar: jaar(d) };
  return null;
}
export function aantalParameters(d) {
  if (!getallenK(d)) return null;
  const t = d.tekst, types = [], g = /≤ (\d[\d ]*)/.exec(t), tot = /tot en met (\d+)/.exec(t);
  const max = g ? Number(g[1].replace(/ /g, '')) : tot ? Number(tot[1]) : /boven 10/.test(t) ? 20 : 10;
  if (/aantallen boven 10 (synchroon )?(tellen|resultatief)|aantallen tot en met 10 resultatief tellen|synchroon tellen|\(on\)gestructureerde aantallen boven 10/.test(t)) types.push('tellen');
  if (/aantallen[^.]*(vergelijken|ordenen)|perceptueel vergelijken/.test(t)) types.push('vergelijk');
  if (/splitsen in een tiental en eenheden|onderscheid tussen een tiental en een eenheid|tiental eerst geschreven/.test(t)) types.push('splits');
  if (/gestructureerde aantallen (\(getalbeelden\) )?tot 10 paraat|herkennen zonder te tellen|gestructureerde aantallen \(≤ \d+\) herkennen/.test(t)) types.push('beeld');
  if (/een rangorde tot en met 10/.test(t)) types.push('rang');
  if (/akoestisch terugtellen/.test(t)) types.push('terug');
  if (/koppelen aan het telwoord en de getalnotatie/.test(t)) types.push('koppel');
  if (/principe van conservatie|irrelevantie van de volgorde|één-één relatie/.test(t)) types.push('cons');
  if (/groeperen in functie van inzicht in het plaatswaardesysteem/.test(t)) types.push('groep');
  if (/handig tellen door te turven/.test(t)) types.push('turven');
  return types.length ? { types: [...new Set(types)], max, jaar: jaar(d) } : null;
}

// Begrippen en situaties bij bewerkingen, gehele getallen, rationale begrippen en vormleer (zie generators/auto-begrippen.js en auto-vormleer.js).
const bew = (d) => d.domein === 'Bewerkingen';
export function bewerkingBegripParameters(d) {
  if (!bew(d)) return null;
  const t = d.tekst, types = [];
  if (/wiskundige notaties: \+, -, \( \), =, ≠/.test(t)) types.push('notatie-plus');
  if (/wiskundige notaties: ×, :/.test(t)) types.push('notatie-maal');
  if (/de begrippen: optellen, aftrekken, plus, min, termen/.test(t)) types.push('optel');
  if (/de begrippen: vermenigvuldigen, delen, maal, keer/.test(t)) types.push('maal');
  if (/de aftrekker, het aftrektal/.test(t)) types.push('aftrektal');
  if (/de opgaande deling, de niet-opgaande deling/.test(t)) types.push('opgaand');
  if (/de begrippen: splitsen en verdelen/.test(t)) types.push('splitsen');
  if (/van plaats wisselen/.test(t)) types.push('plaats');
  if (/omgekeerde bewerking/.test(t)) types.push('omgekeerd');
  if (/het begrip: compenseren/.test(t)) types.push('compenseren');
  if (/het optellen en aftrekken als oorzaak-verandering/.test(t)) types.push('optelsoort');
  if (/het vermenigvuldigen als keerhandeling/.test(t)) types.push('keersoort');
  if (/het delen als verdelingsdeling/.test(t)) types.push('deelsoort');
  if (/verband tussen verhoudingsdeling en verdelingsdeling/.test(t)) types.push('verband');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function situatieParameters(d) {
  if (!bew(d)) return null;
  const t = d.tekst, types = [], j = jaar(d), tot = /tot en met (\d+)/.exec(t);
  if (/betekenisvolle situaties omzetten naar bewerkingen met natuurlijke getallen/.test(t)) types.push('situatie');
  if (/bij een niet-opgaande deling de rest/.test(t)) types.push('rest');
  if (/omzetten naar optellingen\/aftrekkingen met \(on\)gelijknamige breuken/.test(t)) types.push('breukplus');
  if (/omzetten naar vermenigvuldigen met breuken/.test(t)) types.push('breukmaal');
  if (/omzetten naar delen door breuken/.test(t)) types.push('breukdeel');
  if (/omzetten naar vermenigvuldigingen met procenten/.test(t)) types.push('pctmaal');
  if (/‘van’ als ‘maal’/.test(t)) types.push('vanmaal');
  if (/aantallen tot en met \d+ splitsen/.test(t)) types.push('splitsen');
  if (/concrete rekensituaties[^.]*rond optellen/.test(t)) types.push('rek-plus');
  if (/concrete rekensituaties[^.]*rond vermenigvuldigen en delen/.test(t)) types.push('rek-maal');
  if (/probleemsituaties rond optellen en aftrekken[^.]*omgekeerd/.test(t)) types.push('terugrekenen');
  return types.length ? { types, max: tot ? Number(tot[1]) : 10, jaar: j } : null;
}
export function geheleGetallenParameters(d) {
  if (d.subdomein !== 'Gehele getallen') return null;
  const t = d.tekst, types = [], j = jaar(d);
  if (/het minteken|het positief getal, het negatief getal/.test(t)) types.push('begrip');
  if (/uitbreiding van de getallenas met negatieve getallen/.test(t)) types.push('as');
  if (/terugtellen vanaf nul/.test(t)) types.push('terug');
  if (/negatieve getallen lezen en interpreteren/.test(t)) types.push('context');
  if (/gehele getallen vergelijken en ordenen/.test(t)) types.push('vergelijk');
  if (/vergelijken, ordenen en plaatsen op de getallenas/.test(t)) types.push('vergelijk', 'plaats');
  if (/de afstand tussen twee negatieve getallen/.test(t)) types.push('afstand');
  return types.length ? { types: [...new Set(types)], max: j >= 5 ? 20 : 10, jaar: j } : null;
}
export function rationaalBegripParameters(d) {
  if (d.subdomein !== 'Positieve rationale getallen') return null;
  const t = d.tekst, types = [];
  if (/de wiskundige notaties: ,\./.test(t)) types.push('komma');
  if (/het dubbel, de helft, een kwart/.test(t)) types.push('halfdubbel');
  if (/\(on\)gelijke delen/.test(t)) types.push('delen');
  if (/de teller, de noemer, het geheel/.test(t)) types.push('teller');
  if (/de stambreuk, de \(on\)echte breuk/.test(t)) types.push('stam');
  if (/tiende \(t\), honderdste \(h\)/.test(t)) types.push('tiende');
  if (/duizendste \(d\)/.test(t)) types.push('duizendste');
  if (/vereenvoudigen, gelijkwaardige breuken/.test(t)) types.push('gelijkw');
  if (/decimale breuk, \(on\)vereenvoudigbare breuk/.test(t)) types.push('decbreuk');
  if (/\(oneigenlijke\) breuk, het procent/.test(t)) types.push('oneigenlijk', 'procent');
  if (/een procent als een breuk met noemer 100/.test(t)) types.push('procent');
  if (/het begrip: verhouding|aanduiding voor een verhouding|een verhouding noteren met een breuk/.test(t)) types.push('verhouding');
  if (/het begrip: groeipercentage|groeipercentage als de toename|weergeven m\.b\.v\. een groeipercentage/.test(t)) types.push('groei');
  if (/asymmetrisch aspect/.test(t)) types.push('asym');
  if (/relatieve en absolute vergelijking|absoluut en relatief vergelijken|groeipercentages relatief vergelijken/.test(t)) types.push('relatief');
  if (/het begrip: omgekeerde breuk/.test(t)) types.push('omgekeerd');
  if (/een breuk als een deling/.test(t)) types.push('deling');
  if (/natuurlijk getal als een oneigenlijke breuk/.test(t)) types.push('nat');
  if (/als rationaal getal en als getal tussen andere getallen/.test(t)) types.push('tussen');
  if (/breuken \(noemer ≤ 100\) en procenten \(tot op eenheid\) vereenvoudigen en gelijknamig maken/.test(t)) types.push('gelijkw');
  return types.length ? { types: [...new Set(types)], jaar: jaar(d) } : null;
}

export function vormleerParameters(d) {
  if (d.subdomein !== 'Vormleer' || d.domein !== 'Meetkunde') return null;
  const t = d.tekst, types = [];
  if (/de begrippen: het punt, de lijn, rond/.test(t)) types.push('plr');
  if (/de begrippen:? recht, gebogen|de begrippen recht, gebogen, punt, lijn, hoek gebruiken/.test(t)) types.push('rg');
  if (/de begrippen: de rechte, het lijnstuk, de halfrechte, de kromme/.test(t)) types.push('lijnsoort');
  if (/wiskundige notaties?: het punt A|wiskundige notatie: de rechte \(a\)/.test(t)) types.push('notatie');
  if (/het begrip: het punt\.?$/.test(t)) types.push('punt');
  if (/de begrippen: de breedte, de lengte/.test(t)) types.push('lb');
  if (/de begrippen: de hoogte, de basis/.test(t)) types.push('hbs');
  if (/de begrippen: begrensd, onbegrensd/.test(t)) types.push('begrensd');
  if (/het oppervlak, het zijvlak, het grondvlak/.test(t)) types.push('ruimte');
  return types.length ? { types, jaar: jaar(d), focus: /het punt A, de rechte a, de halfrechte/.test(t) ? 'alles' : 'rechte' } : null;
}

// Begrippen bij statistiek en kans, decimale getallen via breuken en hoofdrekenen in het algemeen (zie generators/auto-rest.js).
export function statistiekBegripParameters(d) {
  if (d.subdomein !== 'Statistiek') return null;
  const t = d.tekst, soorten = [], types = [];
  if (/de begrippen: de tabel/.test(t)) soorten.push('tabel');
  if (/de begrippen: het beelddiagram/.test(t)) soorten.push('beelddiagram');
  if (/de begrippen: het staafdiagram/.test(t)) soorten.push('staafdiagram');
  if (/de begrippen: de lijngrafiek, het cirkeldiagram/.test(t)) soorten.push('lijngrafiek', 'cirkeldiagram');
  if (/(het begrip|de volgende begrippen): (het )?cirkeldiagram|de volgende begrippen: het cirkeldiagram/.test(t)) soorten.push('cirkeldiagram');
  if (soorten.length) types.push('naam');
  if (/de grafiek, de verticale as, de horizontale as|het cirkeldiagram, de verticale as, de horizontale as/.test(t)) types.push('assen');
  if (/het begrip: het gemiddelde|de volgende begrippen:.*het gemiddelde/.test(t)) types.push('gemiddelde');
  if (/het begrip: de mediaan/.test(t)) types.push('mediaan');
  return types.length ? { types, soorten: [...new Set(soorten)], jaar: jaar(d) } : null;
}
export function kansBegripParameters(d) {
  if (d.subdomein !== 'Kansrekenen') return null;
  const t = d.tekst, types = [];
  if (/de begrippen: mogelijk, misschien, soms/.test(t)) types.push('zeker3');
  if (/zekere en onzekere gebeurtenissen van elkaar onderscheiden/.test(t)) types.push('zeker2');
  if (/waarschijnlijkheid van gebeurtenissen beschrijven/.test(t)) types.push('waarsch');
  if (/de kans, de \(gunstige\) uitkomst/.test(t)) types.push('gunstig');
  if (/verhouding van het aantal gunstige uitkomsten op het totaal aantal pogingen/.test(t)) types.push('experiment');
  return types.length ? { types, jaar: jaar(d) } : null;
}
export function decimaalBreukParameters(d) {
  if (!bew(d)) return null;
  const t = d.tekst;
  if (/decimale getallen \(tot op 1 d\) vermenigvuldigen door om te zetten naar breuken/.test(t)) return { types: ['maal'], jaar: jaar(d) };
  if (/vermenigvuldigingen en delingen met decimale getallen \(tot op 1d\) uitvoeren door om te zetten naar breuken/.test(t)) return { types: ['maal', 'deel'], jaar: jaar(d) };
  return null;
}


/* ---- afwerking: families voor de laatste doelen die enkel een open opdracht hadden */
export function schatAantalParameters(d) {
  if (!natuurlijk(d) || !/aantallen \(≤ [\d ]+\) schatten in betekenisvolle contexten/.test(d.tekst)) return null;
  return { max: grensVan(d.tekst) ?? 1000, jaar: jaar(d) };
}
export function verhoudingParameters(d) {
  if (!natuurlijk(d) || !/interpreteren als een verhouding/.test(d.rubriek || '')) return null;
  return { types: /ontbrekende verhoudingsgetallen/.test(d.tekst) ? ['ontbreekt'] : ['lees'], jaar: jaar(d) };
}
export function tot20ContextParameters(d) {
  if (!/optellingen en aftrekkingen tot en met 20 paraat toepassen in gevarieerde contexten/.test(d.tekst)) return null;
  return { max: 20, jaar: jaar(d) };
}
export function bijnaGelijkParameters(d) {
  if (d.subdomein !== 'Schattend rekenen' || !/wiskundige notatie: ≈/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function rekenmethodeParameters(d) {
  if (d.rubriek !== 'Flexibel rekenen') return null;
  const t = d.tekst, types = [];
  if (/andere rekenwijzen gebruiken: schattend rekenen, cijferen|doelmatige rekenmethode uitkiezen/.test(t)) types.push('methode');
  if (/criteria om te verantwoorden/.test(t)) types.push('criterium');
  if (!types.length) return null;
  return { types, tool: /digitale rekentool/.test(t) || (types.includes('criterium') && jaar(d) >= 5), max: jaar(d) <= 3 ? 1000 : 10000, jaar: jaar(d) };
}

/* ---- afwerking, breuken: lezen en noteren, herstructureren, schematisch voorstellen en notaties voor een hoeveelheid */
export function breukNotatieParameters(d) {
  if (!/breuken \(waarbij de noemer ≤ 20[^)]*\) lezen/.test(d.tekst)) return null;
  return { schuin: /schuine/.test(d.tekst), jaar: jaar(d) };
}
export function breukHerstructureerParameters(d) {
  if (!/breuken \(waarbij de noemer ≤ 20[^)]*\) schematisch herstructureren/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function breukVoorstelParameters(d) {
  if (!/(breuken|breuk).*procenten.*decimale getallen.*schematisch voorstellen/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function breukHoeveelheidParameters(d) {
  if (!/rationaal getal \(breuk-, procent- of decimale notatie\) als aanduiding voor een hoeveelheid/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}

/* ---- afwerking: schematische voorstellingen bij bewerkingen met breuken */
export function breukSchemaParameters(d) {
  if (d.subdomein !== 'Bewerkingen met breuken en procenten' && d.rubriek !== 'Schematische voorstellingen') return null;
  const m = /schematische voorstelling voor de oplossingsstrategie van (.+?)\.?$/.exec(d.tekst.trim());
  if (!m) return null;
  const x = m[1];
  let types = null;
  if (/^optellen\/aftrekken met \(on\)gelijknamige breuken/.test(x)) types = jaar(d) <= 4 ? ['plus', 'min'] : ['plus', 'min', 'plus-ongelijk', 'min-ongelijk'];
  else if (/^natuurlijk getal x breuk/.test(x)) types = ['nx'];
  else if (/^breuk x natuurlijk getal/.test(x)) types = ['bx'];
  else if (/^breuk x breuk/.test(x)) types = ['bb'];
  else if (/^breuk : natuurlijk getal/.test(x)) types = ['bd'];
  else if (/^natuurlijk getal : breuk/.test(x)) types = ['nd'];
  else if (/^breuk : breuk/.test(x)) types = ['bdb'];
  return types ? { types, jaar: jaar(d) } : null;
}

/* ---- afwerking, meten: aflezen en metend rekenen, instrument en maateenheid kiezen, seriëren, zinvol afronden, indirect meten, inhoud en massa, planning */
const meetDoel = (d) => d.domein === 'Meten en metend rekenen';
export function meetAflezenParameters(d) {
  if (!meetDoel(d) || !/een meetresultaat correct aflezen en noteren|(?:kunnen|kan) meten en metend rekenen voor lengte/.test(d.tekst)) return null;
  return { types: /metend rekenen/.test(d.tekst) ? ['lengte', 'massa', 'temperatuur', 'klok', 'rekenen'] : ['lengte', 'massa', 'temperatuur', 'klok'], jaar: jaar(d) };
}
export function meetKiesParameters(d) {
  if (!meetDoel(d) || !/een gepast meetinstrument en een geschikte maateenheid kiezen/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function meetSeriërenParameters(d) {
  if (!meetDoel(d) || !/meetresultaten ordenen \(seriëren\)/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function meetAfrondenParameters(d) {
  if (!meetDoel(d) || !/het resultaat zinvol afronden/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function indirectMetenParameters(d) {
  if (!meetDoel(d) || d.rubriek !== 'Indirect meten' || d.subdomein !== 'Meetinzichten en meetvaardigheden' || !/indirect meten door (een andere grootheid te meten|berekeningen uit te voeren)\.?$/.test(d.tekst.trim())) return null;
  return { types: /andere grootheid/.test(d.tekst) ? ['grootheid'] : ['berekening'], jaar: jaar(d) };
}
export function hoeveelheidInhoudParameters(d) {
  if (!meetDoel(d) || !/onderzoeken of de hoeveelheid vloeistof die een recipiënt bevat, ook de inhoud van het recipiënt is/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function inhoudMassaParameters(d) {
  if (!meetDoel(d) || !/verband tussen de maten voor inhoudsmaten\/volumematen en massa/.test(d.tekst)) return null;
  return { jaar: jaar(d) };
}
export function planningParameters(d) {
  if (!meetDoel(d)) return null;
  const types = [];
  if (/gebeurtenissen tijdens de dag\/week chronologisch ordenen/.test(d.tekst)) types.push('volgorde');
  if (/een dagplanning en een weekkalender functioneel gebruiken/.test(d.tekst)) types.push('planning');
  return types.length ? { types, jaar: jaar(d) } : null;
}

export const FAMILIES = [
  { id: 'eig', parameters: eigenschapParameters },
  { id: 'tel', parameters: tellenParameters },
  { id: 'afr', parameters: afrondParameters },
  { id: 'dlb', parameters: deelbaarParameters },
  { id: 'vlv', parameters: veelParameters },
  { id: 'rng', parameters: rangParameters },
  { id: 'wrd', parameters: woordParameters },
  { id: 'pws', parameters: waardeParameters },
  { id: 'adg', parameters: aanduidingParameters },
  { id: 'taf', parameters: tafelParameters },
  { id: 'dsp', parameters: deelSprongParameters },
  { id: 'bkd', parameters: breukDeelParameters },
  { id: 'omz', parameters: omzetParameters },
  { id: 'bvg', parameters: rationaalVergelijkParameters },
  { id: 'dcm', parameters: decimaalParameters },
  { id: 'bkb', parameters: breukBewerkingParameters },
  { id: 'dcb', parameters: decimaleBewerkingParameters },
  { id: 'tnv', parameters: tienvoudParameters },
  { id: 'cmp', parameters: compenseerParameters },
  { id: 'hnd', parameters: handigParameters },
  { id: 'sch', parameters: schatParameters },
  { id: 'ctl', parameters: controleParameters },
  { id: 'cfr', parameters: cijferParameters },
  { id: 'vlg', parameters: volgordeParameters },
  { id: 'glk', parameters: gelijkParameters },
  { id: 'een', parameters: eenheidParameters },
  { id: 'hrl', parameters: herleidParameters },
  { id: 'scl', parameters: schaalParameters },
  { id: 'evr', parameters: evenredigParameters },
  { id: 'snl', parameters: snelheidParameters },
  { id: 'bnt', parameters: brutoNettoParameters },
  { id: 'dch', parameters: dichtheidParameters },
  { id: 'prs', parameters: prijsParameters },
  { id: 'tds', parameters: tijdsduurParameters },
  { id: 'tmp', parameters: temperatuurParameters },
  { id: 'frm', parameters: formuleParameters },
  { id: 'kal', parameters: kalenderParameters },
  { id: 'dgm', parameters: diagramParameters },
  { id: 'cvb', parameters: cirkelVerbandParameters },
  { id: 'gem', parameters: gemiddeldeParameters },
  { id: 'kns', parameters: kansParameters },
  { id: 'vrg', parameters: vraagstukParameters },
  { id: 'fig', parameters: figuurParameters },
  { id: 'rfg', parameters: ruimteParameters },
  { id: 'hoe', parameters: hoekParameters },
  { id: 'lij', parameters: lijnenParameters },
  { id: 'drh', parameters: driehoekParameters },
  { id: 'upr', parameters: uitspraakParameters },
  { id: 'log', parameters: logicaParameters },
  { id: 'trf', parameters: transformatieParameters },
  { id: 'tsp', parameters: tekenSpiegelParameters },
  { id: 'tvs', parameters: tekenVerschuifParameters },
  { id: 'tdr', parameters: tekenDraaiParameters },
  { id: 'tvg', parameters: tekenVergrootParameters },
  { id: 'tas', parameters: tekenAssenParameters },
  { id: 'sym', parameters: symmetrieParameters },
  { id: 'pat', parameters: patroonParameters },
  { id: 'pos', parameters: plaatsParameters },
  { id: 'cng', parameters: congruentieParameters },
  { id: 'dkl', parameters: klokInzichtParameters },
  { id: 'dgn', parameters: dagenParameters },
  { id: 'dur', parameters: duurParameters },
  { id: 'thm', parameters: thermometerParameters },
  { id: 'gld', parameters: geldInzichtParameters },
  { id: 'hks', parameters: hoekSamenParameters },
  { id: 'mvb', parameters: maatverbandParameters },
  { id: 'rfm', parameters: referentieParameters },
  { id: 'mtb', parameters: meetbegripParameters },
  { id: 'omr', parameters: omtrekRoosterParameters },
  { id: 'rel', parameters: relatieParameters },
  { id: 'gbg', parameters: getalBegripParameters },
  { id: 'rij', parameters: rijParameters },
  { id: 'rom', parameters: romeinsParameters },
  { id: 'gas', parameters: getallenasParameters },
  { id: 'aan', parameters: aantalParameters },
  { id: 'bgw', parameters: bewerkingBegripParameters },
  { id: 'sit', parameters: situatieParameters },
  { id: 'gtl', parameters: geheleGetallenParameters },
  { id: 'rtb', parameters: rationaalBegripParameters },
  { id: 'vrm', parameters: vormleerParameters },
  { id: 'stb', parameters: statistiekBegripParameters },
  { id: 'knb', parameters: kansBegripParameters },
  { id: 'dbr', parameters: decimaalBreukParameters },
  { id: 'sta', parameters: schatAantalParameters },
  { id: 'vhd', parameters: verhoudingParameters },
  { id: 't20', parameters: tot20ContextParameters },
  { id: 'bgl', parameters: bijnaGelijkParameters },
  { id: 'rkm', parameters: rekenmethodeParameters },
  { id: 'bln', parameters: breukNotatieParameters },
  { id: 'bhs', parameters: breukHerstructureerParameters },
  { id: 'bsv', parameters: breukVoorstelParameters },
  { id: 'bha', parameters: breukHoeveelheidParameters },
  { id: 'bsc', parameters: breukSchemaParameters },
  { id: 'maf', parameters: meetAflezenParameters },
  { id: 'mkz', parameters: meetKiesParameters },
  { id: 'msr', parameters: meetSeriërenParameters },
  { id: 'mza', parameters: meetAfrondenParameters },
  { id: 'mid', parameters: indirectMetenParameters },
  { id: 'mhi', parameters: hoeveelheidInhoudParameters },
  { id: 'mim', parameters: inhoudMassaParameters },
  { id: 'mpl', parameters: planningParameters },
];
