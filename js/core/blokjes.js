// Blokjes: de bouwstenen van "Zelf samenstellen". Een kaart in het palet is één soort oefeningen (bv. 'Optellen') met een vorm-chip
// (invullen, meerkeuze, juist of fout, ...) en chips voor de instellingen. Wie een kaart toevoegt, legt de gekozen instellingen vast in het blokje.
// Elk vak levert een configuratie { domeinen, kaarten } (zie js/subjects/*/blokjes.js); generators die niet op een kaart staan,
// komen automatisch in het tabblad 'Meer oefeningen', gegroepeerd per familie.
import { keuzeGroep, optiesVoor, POOL } from './blad-model.js';
import { doelVan } from './doelregister.js';

export const AANTALLEN = [4, 5, 6, 8, 10, 12, 15, 20];
export const REKENGEBIEDEN = [5, 10, 20, 100, 1000, 10000];
const SUFFIX = /-(invullen|kiezen|juist-fout|meerkeuze|verbinden|tabel|fout-zoeken|vraagstuk)$/;
const SUFFIX_LABEL = { invullen: 'Invullen', kiezen: 'Kiezen', 'juist-fout': 'Juist of fout', meerkeuze: 'Meerkeuze', verbinden: 'Verbinden', tabel: 'Tabel aanvullen', 'fout-zoeken': 'Fout zoeken', vraagstuk: 'Vraagstukje' };

const generatorVan = (vak, id) => vak.generators.find(g => g.id === id);

// Label van een vorm in de vorm-chip: de eerste vorm heet 'Invullen' als ze zo heet als de kaart, anders de naam van de generator.
function vormLabel(g, kaartTitel, eerste) {
  const m = SUFFIX.exec(g.id);
  if (m) return SUFFIX_LABEL[m[1]];
  return g === eerste && g.titel === kaartTitel ? 'Invullen' : g.titel;
}

// Alle kaarten van een vak: de vaste kaarten uit de configuratie (tab 'hoofd') en de rest per familie (tab 'meer').
export function bouwKaarten(vak) {
  const config = vak.blokjes || { domeinen: [], kaarten: [] };
  const gebruikt = new Set();
  const hoofd = config.kaarten.map((k) => {
    const vormen = k.vormen.map(id => generatorVan(vak, id)).filter(Boolean);
    vormen.forEach(g => gebruikt.add(g.id));
    return { ...k, tab: 'hoofd', vormen: vormen.map((g, i) => ({ id: g.id, label: k.labels?.[g.id] || vormLabel(g, k.titel, vormen[0]), basis: i === 0 })) };
  }).filter(k => k.vormen.length);
  const families = new Map();
  for (const g of vak.generators) {
    if (gebruikt.has(g.id)) continue;
    const sleutel = g.id.replace(SUFFIX, '');
    if (!families.has(sleutel)) families.set(sleutel, []);
    families.get(sleutel).push(g);
  }
  const meer = [...families].map(([sleutel, lijst]) => {
    const eerste = lijst.find(g => g.id === sleutel || g.id === `${sleutel}-invullen`) || lijst[0];
    const doel = doelVan(eerste.doelen[0]);
    const domein = (doel && (doel.domein || doel.subdomein)) || 'Overig';
    const titel = lijst.length === 1 ? eerste.titel : eerste.titel.replace(/: (kies|juist of fout\?)$/, '');
    return { id: sleutel, tab: 'meer', domein, titel, breedte: eerste.breedte ?? (eerste.schaal && eerste.schaal < 0.5 ? 4 : 2), vormen: lijst.map((g, i) => ({ id: g.id, label: vormLabel(g, titel, eerste), basis: g === eerste })) };
  });
  return [...hoofd, ...meer];
}

export function domeinenVan(vak, kaarten, tab) {
  const vast = (vak.blokjes?.domeinen || []).filter(d => kaarten.some(k => k.tab === tab && k.domein === d));
  const rest = [...new Set(kaarten.filter(k => k.tab === tab).map(k => k.domein))].filter(d => !vast.includes(d)).sort();
  return [...vast, ...rest];
}

/* ------------------------------------------------------------------ chips */
// De chips van een kaart: uit de keuzes van de generators (zonder 'volgens de doelen'), plus het aantal.
export function kaartChips(vak, kaart) {
  const chips = new Map();
  for (const { id } of kaart.vormen) {
    const g = generatorVan(vak, id);
    for (const k of g.keuzes || []) {
      const sleutel = `${keuzeGroep(g, k)}/${k.id}`;
      if (chips.has(sleutel)) continue;
      const opties = k.type === 'select' || k.type === 'multi' ? k.opties.filter(([w]) => w !== 'auto') : null;
      const standaard = kaart.chipStandaard?.[k.id] ?? (k.standaard === 'auto' ? opties?.[0]?.[0] : k.standaard);
      chips.set(sleutel, { sleutel, id: k.id, label: k.label, type: k.type === 'select' || k.type === 'multi' ? k.type : k.id === 'tafels' ? 'tafels' : 'tekst', opties, standaard, vanafGebied: kaart.chipVanafGebied?.[k.id] ?? 0, alsKeuze: k.alsKeuze || null, kort: k.kort || null });
    }
  }
  return [...chips.values()];
}

// Breedte van een vorm op het blad: sommige vormen (vraagstukje, meerkeuze, ...) hebben meer ruimte nodig dan de rest van de kaart.
export const kaartVormBreedte = (kaart, vormId) => kaart.breedtes?.[vormId] ?? kaart.breedte;
export const standaardAantal = (kaart) => kaart.aantal?.[0] ?? 10;
export const aantalOpties = (kaart) => kaart.aantal ?? [5, 10, 15, 20];
export const MIN_AANTAL = 1, MAX_KEUZE_AANTAL = 30;                      // het aantal oefeningen is vrij te kiezen tussen 1 en 30
export const klemAantal = (n) => Math.min(MAX_KEUZE_AANTAL, Math.max(MIN_AANTAL, Math.round(Number(n)) || MIN_AANTAL));
export const TAFEL_SNELKNOPPEN = [['Alles', null], ['Niets', []], ['2-5-10', [2, 5, 10]], ['3-4-6', [3, 4, 6]], ['7-8-9', [7, 8, 9]]];

export function nieuweKaartStaat(vak, kaart) {
  const chips = {};
  for (const c of kaartChips(vak, kaart)) chips[c.sleutel] = c.standaard;
  return { vorm: kaart.vormen[0].id, chips, aantal: standaardAantal(kaart), vb: false, ruim: false, vakje: false };
}

// Opties van de gekozen vorm volgens de chips van de kaart.
export function optiesVanKaart(vak, kaart, staat) {
  const g = generatorVan(vak, staat.vorm);
  const keuzes = {};
  for (const k of g.keuzes || []) {
    const w = staat.chips[`${keuzeGroep(g, k)}/${k.id}`];
    if (w !== undefined) (keuzes[keuzeGroep(g, k)] ||= {})[k.id] = w;
  }
  return optiesVoor(g, [], keuzes, null);
}

/* ------------------------------------------------------------------ wat kan er in dit rekengebied? */
const levertCache = new Map();
// Aantal oefeningen (hoogstens 6) dat een vorm met deze instellingen in dit rekengebied kan opleveren.
export function aantalMogelijk(vak, vormId, gebied, opties) {
  const sleutel = [vak.id, vormId, gebied, JSON.stringify(opties || {})].join('|');
  if (!levertCache.has(sleutel)) {
    let n = 0;
    try { n = generatorVan(vak, vormId).genereer({ seed: 12345, aantal: 6, gebied, opties }).oefeningen.length; } catch { n = 0; }
    levertCache.set(sleutel, n);
  }
  return levertCache.get(sleutel);
}
export const kanLeveren = (vak, vormId, gebied, opties) => aantalMogelijk(vak, vormId, gebied, opties) >= 3;

// Een kaart staat in het palet als minstens één van haar vormen iets kan opleveren in dit gebied.
export function kaartZichtbaar(vak, kaart, gebied) {
  if (!gebied) return true;
  return kaart.vormen.some(v => {
    const staat = nieuweKaartStaat(vak, kaart); staat.vorm = v.id;
    return kanLeveren(vak, v.id, gebied, optiesVanKaart(vak, kaart, staat));
  });
}
// Welke opties van een chip leveren nog iets op, met de overige instellingen ongewijzigd?
export function mogelijkeOpties(vak, kaart, staat, chip, gebied) {
  if (!chip.opties) return null;
  if (!gebied) return chip.opties;
  return chip.opties.filter(([w]) => kanLeveren(vak, staat.vorm, gebied, optiesVanKaart(vak, kaart, { ...staat, chips: { ...staat.chips, [chip.sleutel]: w } })));
}
// Chips die enkel verschijnen als er echt iets te kiezen valt.
export function zichtbareChips(vak, kaart, staat, gebied) {
  const g = generatorVan(vak, staat.vorm), eigen = new Set((g.keuzes || []).map(k => `${keuzeGroep(g, k)}/${k.id}`));
  return kaartChips(vak, kaart).filter(c => {
    if (!eigen.has(c.sleutel)) return false;
    if (gebied && c.vanafGebied && gebied < c.vanafGebied) return false;
    if (c.alsKeuze && staat.chips[`${c.sleutel.slice(0, c.sleutel.lastIndexOf('/'))}/${c.alsKeuze.id}`] !== c.alsKeuze.waarde) return false;   // enkel zichtbaar bij een bepaalde keuze (bv. 'Zelf kiezen')
    if (c.type === 'multi') return c.opties.length >= 2;
    if (c.type !== 'select') return true;
    return (mogelijkeOpties(vak, kaart, staat, c, gebied) || []).length >= 2;
  });
}

/* ------------------------------------------------------------------ voorbeeld en toevoegen */
export function voorbeeldOefening(vak, kaart, staat, gebied, seed = 1) {
  const g = generatorVan(vak, staat.vorm);
  try {
    const o = g.genereer({ seed, aantal: 1, gebied, opties: optiesVanKaart(vak, kaart, staat) }).oefeningen[0];
    return o || null;
  } catch { return null; }
}

// Specificatie voor voegBlokjeToe (blad-model.js): de instellingen worden nu vastgelegd.
export function blokjeSpec(vak, kaart, staat, gebied, seed) {
  const g = generatorVan(vak, staat.vorm);
  return { vormId: g.id, gebied, opties: optiesVanKaart(vak, kaart, staat), aantal: klemAantal(staat.aantal), breedte: kaartVormBreedte(kaart, g.id) ?? g.breedte, seed,
    vb: !!staat.vb, ruim: !!staat.ruim, vakje: !!staat.vakje, sam: samenvatting(vak, kaart, staat, gebied) };
}

/* ------------------------------------------------------------------ samenvatting van de instellingen (enkel op het scherm) */
const kortLabel = (t) => String(t).replace(/\s*\(.*\)\s*$/, '').replace(/^./, c => c.toLowerCase());
// Bv. 'Tafels 2, 5, 10 · in volgorde · met steun'. Enkel wat afwijkt van de standaard komt erin; de tafels altijd.
export function samenvatting(vak, kaart, staat) {
  const g = generatorVan(vak, staat.vorm), delen = [];
  const eigen = new Set((g.keuzes || []).map(k => `${keuzeGroep(g, k)}/${k.id}`));
  const basis = kaart.vormen[0].id;
  if (staat.vorm !== basis) delen.push(kaart.vormen.find(v => v.id === staat.vorm)?.label?.toLowerCase());
  for (const c of kaartChips(vak, kaart)) {
    if (!eigen.has(c.sleutel)) continue;
    if (c.alsKeuze && staat.chips[`${c.sleutel.slice(0, c.sleutel.lastIndexOf('/'))}/${c.alsKeuze.id}`] !== c.alsKeuze.waarde) continue;
    const w = staat.chips[c.sleutel];
    if (c.type === 'tafels') { if (String(w || '').trim()) delen.push(`Tafels ${String(w).split(/[^0-9]+/).filter(Boolean).join(', ')}`); continue; }
    if (w === undefined || w === c.standaard || (Array.isArray(w) && !w.length)) continue;
    if (c.type === 'select') {
      const t = c.opties.find(([x]) => x === w); if (t) delen.push(t[2] !== undefined ? t[2] : kortLabel(t[1]));    // derde element = korte tekst voor de samenvatting ('' = weglaten)
    } else if (c.type === 'multi') delen.push(c.opties.filter(([x]) => w.includes(x)).map(([, t]) => kortLabel(t)).join(', '));
    else if (String(w).trim()) delen.push(c.kort ? c.kort(w) : `${kortLabel(c.label).replace(/\s*\(.*$/, '')}: ${w}`);
  }
  if (staat.vb) delen.push('met voorbeeld');
  if (staat.vakje) delen.push('invulvakje');
  if (staat.ruim) delen.push('ruim');
  return delen.filter(Boolean).join(' · ');
}

// Voorbij de reserve? Een blokje kan nooit meer oefeningen tonen dan de pool bevat.
export const MAX_AANTAL = POOL;
