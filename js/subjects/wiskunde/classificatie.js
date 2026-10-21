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
  if (/begrip/.test(t) || !/(telrij|doortellen|terugtellen|tellen met|tellen, |tellen\)|verkort tellen|1 meer en 1 minder)/.test(t) || /(aantallen|turven)/.test(t) && !/telrij/.test(t)) return null;
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
];
