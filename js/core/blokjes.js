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
      const opties = k.type === 'select' ? k.opties.filter(([w]) => w !== 'auto') : null;
      const standaard = kaart.chipStandaard?.[k.id] ?? (k.standaard === 'auto' ? opties?.[0]?.[0] : k.standaard);
      chips.set(sleutel, { sleutel, id: k.id, label: k.label, type: k.type === 'select' ? 'select' : k.id === 'tafels' ? 'tafels' : 'tekst', opties, standaard, vanafGebied: kaart.chipVanafGebied?.[k.id] ?? 0 });
    }
  }
  return [...chips.values()];
}

export const standaardAantal = (kaart) => kaart.aantal?.[0] ?? 10;
export const aantalOpties = (kaart) => kaart.aantal ?? [5, 10, 15, 20];

export function nieuweKaartStaat(vak, kaart) {
  const chips = {};
  for (const c of kaartChips(vak, kaart)) chips[c.sleutel] = c.standaard;
  return { vorm: kaart.vormen[0].id, chips, aantal: standaardAantal(kaart) };
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
  return { vormId: g.id, gebied, opties: optiesVanKaart(vak, kaart, staat), aantal: staat.aantal, breedte: kaart.breedte ?? g.breedte, seed };
}

// Voorbij de reserve? Een blokje kan nooit meer oefeningen tonen dan de pool bevat.
export const MAX_AANTAL = POOL;
