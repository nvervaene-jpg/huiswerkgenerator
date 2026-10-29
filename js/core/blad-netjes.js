// Maakt de oefeningen van een blok overzichtelijk voor het scherm, de PDF en Word:
//  - een vraag die in elke oefening hetzelfde begint, gaat naar de opdrachtzin
//  - een omcirkel-oefening toont enkel de keuzes (als vakjes), nooit ook een invullijn
//  - het aantal kolommen volgt uit hoe lang de oefeningen zijn en hoe groot de letters zijn
const NBSP = ' ';
const BLANCO = /_{3,}/g;
export const isKeuzeOpdracht = (opdracht) => /omcirkel|kies/i.test(opdracht) && !/schrijf|teken |kleur/i.test(opdracht);

const eersteRegel = (t) => String(t || '').split('\n')[0];

// 'Welk teken past?' dat in alle oefeningen staat, wordt één keer in de opdracht gezet.
function gemeenschappelijkeVraag(lijst) {
  if (lijst.length < 3 || lijst.some(o => typeof o.tekst !== 'string')) return '';
  const eerste = eersteRegel(lijst[0].tekst);
  let n = 0;
  while (n < eerste.length && lijst.every(o => eersteRegel(o.tekst)[n] === eerste[n])) n++;
  const stuk = eerste.slice(0, n), m = [...stuk.matchAll(/[?:.!] /g)].pop();
  if (!m) return '';
  const vraag = stuk.slice(0, m.index + 1);
  if (vraag.length < 8 || /\d/.test(vraag) || !/^[A-ZÀ-Ý]/.test(vraag)) return '';
  const rest = (o) => eersteRegel(o.tekst).slice(m.index + 2).trim();
  return lijst.every(o => rest(o)) ? vraag : '';
}

// Een slotvraag die in alle oefeningen hetzelfde is ('Is dit een situatie van … of …? ____') gaat ook naar de opdrachtzin.
function gemeenschappelijkeSlotvraag(lijst) {
  if (lijst.length < 3 || lijst.some(o => typeof o.tekst !== 'string' || o.tekst.includes('\n'))) return '';
  const slot = (o) => { const m = /([^.?!]*[?!.])\s*(?:_{3,})?\s*$/.exec(o.tekst.replace(/\s+$/, '')); return m ? m[1].trim() : ''; };
  const eerste = slot(lijst[0]);
  if (eerste.length < 15 || /\d/.test(eerste) || !lijst.every(o => slot(o) === eerste)) return '';
  return lijst.every(o => o.tekst.trim().length > eerste.length + 8) ? eerste : '';
}

// Splitst een oefening in de vraag en de keuzes. Herkent: 'a) 11   b) 12' (op één of op aparte regels), 'x   of   y', 'Omcirkel:  m   cm',
// '… juist   fout' en 'woord   optie   optie'. Geeft null als er geen keuzes in staan.
const SPATIES = /\s{3,}/;
export function splitsKeuze(tekst) {
  const regels = String(tekst || '').replace(/ /g, ' ').split('\n');
  const goed = (o) => o.length >= 2 && o.length <= 10 && o.every(x => x && x.length <= 90);
  const laatste = regels[regels.length - 1], voor = regels.slice(0, -1);
  const klaar = (vraag, opties) => (goed(opties) ? { vraag: [...voor, vraag].filter(x => x && x.trim()).join('\n').trim(), opties: opties.map(x => x.trim()) } : null);
  if (regels.length > 1 && regels.every((r, i) => i === 0 ? true : /^[a-d]\) /.test(r)) && regels.slice(1).length >= 2) return { vraag: regels[0].trim(), opties: regels.slice(1).map(x => x.trim()) };
  if (regels.length > 1 && regels.filter(r => /^[a-d]\) /.test(r)).length >= 2 && regels.every(r => /^[a-d]\) /.test(r))) return { vraag: '', opties: regels.map(x => x.trim()) };
  let m = /(?:^|\s{3,})(a\) .+)$/.exec(laatste);                              // a) 11     b) 12
  if (m) return klaar(laatste.slice(0, m.index), m[1].split(/\s{3,}(?=[a-d]\) )/));
  m = /^(.*?)\s{3,}Omcirkel:\s+(.+)$/.exec(laatste);                          // Omcirkel:   m     cm
  if (m) return klaar(m[1], m[2].split(SPATIES));
  m = /^(.*?)\s{4,}(juist)\s{3,}(fout)\s*$/.exec(laatste);                    // … juist    fout
  if (m) return klaar(m[1], [m[2], m[3]]);
  const delen = laatste.trim().split(SPATIES);
  const k = delen.indexOf('of');                                               // kussen      of      kusen
  if (k >= 1 && delen.length === k + 2) return klaar(delen.slice(0, k - 1).join('   '), [delen[k - 1], delen[k + 1]]);
  if (delen.length >= 2 && delen.length <= 10) {                              // woord      optie      optie, of enkel opties
    const eerste = /[\s,;:]/.test(delen[0]) && !/^[a-d]\) /.test(delen[0]);
    return (eerste && klaar(delen[0], delen.slice(1))) || klaar('', delen);
  }
  return null;
}

// De keuzes staan al in de vakjes: '(voormiddag of namiddag)' of '(juist of fout)' achter de vraag valt weg.
const zonderHint = (vraag, opties) => vraag.replace(/\s*\(([^()]+) of ([^()]+)\)/g, (m, a, b) => {
  const kaal = (x) => x.replace(/^[a-d]\) /, '').trim().toLowerCase(), set = new Set(opties.map(kaal));
  return (set.has('juist') && set.has('fout')) || (set.has(kaal(a)) && set.has(kaal(b))) ? '' : m;
});

function maakKeuzeOefening(o) {
  if (o.opties || typeof o.tekst !== 'string') return o;
  const k = splitsKeuze(o.tekst);
  if (!k) return o;
  const vraag = zonderHint(k.vraag, k.opties).replace(/\?\s*_{3,}\s*$/, '?').replace(BLANCO, '?');
  const juist = k.opties.findIndex(x => x === String(o.antwoord).trim());
  return { ...o, tekst: `${vraag}\n${k.opties.join(NBSP.repeat(5))}`, keuzeVraag: vraag, opties: k.opties, juist };
}

// lijst: de oefeningen van één blok; pool: alle oefeningen waaruit ze gekozen zijn. Wat verplaatst wordt naar de opdrachtzin, hangt van de hele pool af:
// zo verandert er niets aan de andere oefeningen als je er één weglaat of vervangt. Geeft { opdracht, oefeningen }.
export function netBlok(opdracht, lijst, pool = lijst) {
  let tekstOpdracht = String(opdracht || '').replace(/^(Kijk|Lees|Luister) goed\.\s*/, '');
  let oefeningen = lijst, alle = pool;
  if (isKeuzeOpdracht(tekstOpdracht)) { oefeningen = oefeningen.map(maakKeuzeOefening); alle = alle.map(maakKeuzeOefening); }
  const alsTekst = (o) => (o.keuzeVraag ? { ...o, tekst: o.keuzeVraag } : o);
  const vraag = gemeenschappelijkeVraag(alle.map(alsTekst));
  if (vraag) {
    if (!tekstOpdracht.includes(vraag)) tekstOpdracht = `${vraag} ${tekstOpdracht}`;
    const knip = (t) => { const regels = t.split('\n'); regels[0] = regels[0].slice(vraag.length).trim(); return regels.join('\n'); };
    oefeningen = oefeningen.map(o => ({ ...o, tekst: knip(o.tekst), ...(o.keuzeVraag ? { keuzeVraag: knip(o.keuzeVraag) } : {}) }));
    alle = alle.map(o => ({ ...o, tekst: knip(o.tekst), ...(o.keuzeVraag ? { keuzeVraag: knip(o.keuzeVraag) } : {}) }));
  }
  const slot = gemeenschappelijkeSlotvraag(alle);
  if (slot) {
    if (!tekstOpdracht.includes(slot)) tekstOpdracht = `${tekstOpdracht} ${slot}`;
    oefeningen = oefeningen.map((o) => {
      const gat = /_{3,}\s*$/.test(o.tekst), kaal = o.tekst.replace(/_{3,}\s*$/, '').replace(slot, '').replace(/\s{2,}/g, ' ').trim();
      return { ...o, tekst: gat ? `${kaal} ____` : kaal };
    });
  }
  return { opdracht: tekstOpdracht, oefeningen };
}

// Het raster van een opdracht: hoeveel kolommen (4, 3, 2 of 1) passen er naast elkaar in een blok van blokMm millimeter binnenbreedte
// bij pt punten? De langste oefening (letter + opgave + invullijn) bepaalt dat. 'krap' = zelfs in één kolom past het niet met een
// volle invullijn: dan wordt de invullijn korter en daarna de letter iets kleiner (zie css: ol.krap).
export const GAT_MM = 26, GAT_MIN_MM = 14, LETTER_MM = 8, KOLOMTUSSEN_MM = 6;
export const GAT_RE = /(?<!_)_{4,7}(?!_)/g;
export const BLOK_MM = { 1: 31, 2: 77, 4: 170 };                // binnenbreedte (zonder rand en opvulling) van een blok van een kwart, de helft of het geheel op A4
// Een enkelvoudige oefening: één regel, kort, zonder tekening of keuzevakjes, met hoogstens één invulplaats (waar dan ook).
export const MAX_SIMPEL = 34;                                   // langere opgaven (vraagstukjes, zinnen) mogen op meer regels staan
export const isSimpel = (o) => !o.svg && !o.opties && typeof o.tekst === 'string' && !o.tekst.includes('\n') && !/_{8,}/.test(o.tekst)
  && o.tekst.replace(/_{4,7}/g, '').trim().length <= MAX_SIMPEL && (o.tekst.match(/(?<!_)_{4,7}(?!_)/g) || []).length <= 1 && !/(?<!_)_{1,3}(?!_)/.test(o.tekst);
// Een oefening in twee kolommen: links alles tot en met het laatste '=' (rechts uitgelijnd, zodat de =-tekens onder elkaar staan),
// rechts wat erna komt (de invullijn of een getal). Zonder '=' staat alles links.
export function splitOpgave(tekst) {
  const i = tekst.lastIndexOf('='), rechts = i < 0 ? '' : tekst.slice(i + 1).trim();
  if (i < 0 || !/^(_{4,7}|\S{1,6})(\s+\S{1,4})?$/.test(rechts)) return { links: tekst.trim(), rechts: '' };       // wat achter het '=' staat moet kort zijn (invullijn, getal of eenheid)
  return { links: tekst.slice(0, i + 1).trim(), rechts };
}
export const GAT_KLEIN_CH = 7;                                  // een invulplaats midden in de opgave telt als zes tekens
export const linksBreedte = (links) => links.replace(GAT_RE, 'x'.repeat(GAT_KLEIN_CH)).length;

export const MIN_PT = 11;                                       // kleiner dan dit worden de letters nooit
export function rasterVoor(oefeningen, pt, blokMm = BLOK_MM[4]) {
  const basis = { kolommen: 1, schaal: 1, stapel: false, krap: false, opgaveCh: 0 };
  if (!oefeningen.length) return basis;
  const teken = pt * 0.183;                                       // gemiddelde letterbreedte in mm (Century Gothic)
  const breed = (o) => !!o.svg && (o.svg.breedte || 999) > 230;
  const opgaveCh = Math.max(0, ...oefeningen.filter(isSimpel).map(o => linksBreedte(splitOpgave(o.tekst).links)));
  if (oefeningen.some(o => breed(o) || /^\s*_{8,}\s*$/m.test(o.tekst || ''))) return { ...basis, opgaveCh };
  // Breedte van de langste oefening in tekens; een invulplaats telt als een lijn van GAT_MM.
  const lengte = Math.max(...oefeningen.map(o => Math.max(...String(o.tekst || '').split('\n').map(r => r.replace(/\u00a0+/g, '  ').replace(GAT_RE, ' '.repeat(Math.round(GAT_MM / teken))).length))));
  const kolom = (n) => Math.floor((blokMm - n * LETTER_MM - (n - 1) * KOLOMTUSSEN_MM) / n / teken);   // tekens per kolom
  const kolommen = [4, 3, 2].find(n => lengte <= kolom(n)) || 1;
  if (kolommen > 1 || lengte <= kolom(1)) return { ...basis, kolommen, opgaveCh };
  // Past het zelfs in één kolom niet: eerst de invullijn korter (css doet dat zelf tot GAT_MIN_MM), dan de letters kleiner (tot MIN_PT),
  // en past het dan nog niet, dan staat de invullijn onder de opgave (voor alle oefeningen van het blok).
  const ruimte = blokMm - LETTER_MM - 2, opgaveMm = opgaveCh * teken * 1.08;
  if (!opgaveCh || opgaveMm + GAT_MIN_MM <= ruimte) return { ...basis, krap: true, opgaveCh };
  const schaal = Math.max(MIN_PT / pt, Math.min(1, (ruimte - GAT_MIN_MM) / opgaveMm));
  if (opgaveMm * schaal + GAT_MIN_MM * schaal <= ruimte) return { ...basis, krap: true, schaal, opgaveCh };
  return { ...basis, krap: true, stapel: true, schaal: Math.max(MIN_PT / pt, Math.min(1, ruimte / opgaveMm)), opgaveCh };
}
export const kolommenVoor = (oefeningen, pt, blokMm = BLOK_MM[4]) => rasterVoor(oefeningen, pt, blokMm).kolommen;

export const letterVan = (i) => String.fromCharCode(97 + (i % 26));
