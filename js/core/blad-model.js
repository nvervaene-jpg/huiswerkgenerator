// Het werkblad als bewerkbaar model. Een blad bestaat uit blokken (elk een oefenvorm bij een doel).
// Elk blok heeft een eigen, herhaalbare reeks oefeningen (een 'pool'); het blok onthoudt enkel welke
// oefeningen uit die pool getoond worden. Daardoor kan elke aanpassing in de bladcode bewaard worden.
import { maakRng, afgeleideSeed } from './random.js';
import { codeNaarTekst, tekstNaarCode } from './bladcode.js';

export const STANDAARD = { blokken: 3, aantal: 6 };
export const POOL = 48;                 // aantal oefeningen dat per blok in reserve wordt gemaakt
export const GENERATOR_VERSIE = 1;      // verhogen als generators andere oefeningen gaan maken (dan kloppen oude bladcodes niet meer)

const poolCache = new Map();

export function vormVan(vak, id) {
  const v = vak.generators.find(g => g.id === id);
  if (!v) throw new Error(`Onbekende oefenvorm: ${id}`);
  return v;
}

// Aantal oefeningen in een blok: sommige vormen (verbinden, tabel) tellen minder mee omdat één oefening groter is.
export const effectiefAantal = (vorm, aantal) => Math.max(1, Math.round(aantal * (vorm.schaal ?? 1)));

function poolVan(vak, blok, gebied) {
  const sleutel = [blok.vorm, blok.seed, gebied, JSON.stringify(blok.opties || {})].join('|');
  if (!poolCache.has(sleutel)) {
    poolCache.set(sleutel, vormVan(vak, blok.vorm).genereer({ seed: blok.seed, aantal: POOL, gebied, opties: blok.opties }));
    if (poolCache.size > 400) poolCache.delete(poolCache.keys().next().value);
  }
  return poolCache.get(sleutel);
}

const reserveVolgorde = (blok, n) => maakRng(afgeleideSeed(blok.seed, 'kies')).schud([...Array(n).keys()]);
const kernenVan = (o) => o.kernen || (o.kern ? [o.kern] : []);

// Kernen (bv. een omzetting) van alle getoonde oefeningen, behalve in blok 'behalve'.
function getoondeKernen(vak, model, behalve = -1) {
  const set = new Set();
  model.blokken.forEach((b, i) => {
    if (i === behalve) return;
    const { oefeningen } = poolVan(vak, b, model.gebied);
    b.volgorde.forEach(idx => oefeningen[idx] && kernenVan(oefeningen[idx]).forEach(k => set.add(k)));
  });
  return set;
}

// Kiest n oefeningen uit de pool van een blok, zonder kernen die al op het blad staan.
function kies(vak, model, blok, n, gebruikt) {
  const { oefeningen } = poolVan(vak, blok, model.gebied);
  const reserve = reserveVolgorde(blok, oefeningen.length);
  const gekozen = [], kernen = new Set(gebruikt);
  for (const i of reserve) {
    if (gekozen.length >= n) break;
    const k = kernenVan(oefeningen[i]);
    if (k.some(x => kernen.has(x))) continue;
    gekozen.push(i); k.forEach(x => kernen.add(x));
  }
  // Te weinig oefeningen zonder overlap: neem die met de minste kernen die al op het blad staan.
  const rest = reserve.filter(i => !gekozen.includes(i))
    .map(i => ({ i, botsingen: kernenVan(oefeningen[i]).filter(x => kernen.has(x)).length }))
    .sort((x, y) => x.botsingen - y.botsingen);
  for (const { i } of rest) { if (gekozen.length >= n) break; gekozen.push(i); }
  return gekozen.sort((a, b) => a - b);
}

// De volgende oefening uit de reserve van een blok (niet getoond, niet eerder weggelaten).
function volgendeIndex(vak, model, bi) {
  const blok = model.blokken[bi];
  const { oefeningen } = poolVan(vak, blok, model.gebied);
  const reserve = reserveVolgorde(blok, oefeningen.length);
  const gebruikt = getoondeKernen(vak, model);
  const vrij = reserve.filter(i => !blok.volgorde.includes(i) && !blok.weg.includes(i));
  return vrij.find(i => !kernenVan(oefeningen[i]).some(k => gebruikt.has(k))) ?? vrij[0] ?? null;
}

export const optiesVoor = (vorm, doelCodes, keuzes = {}) => (vorm.opties ? vorm.opties(doelCodes, keuzes[vorm.id] || {}) : {});

function nieuwBlok(vak, model, vorm, doel, seed, opties, n, gebruikt) {
  const blok = { vorm: vorm.id, doel, seed, opties, volgorde: [], weg: [], n };
  blok.volgorde = kies(vak, model, blok, n, gebruikt);
  return blok;
}

/* ------------------------------------------------------------------ plannen */
// instellingen: { doelen, keuzes, seed, gebied, aantal, blokken }
export function planModel(vak, { doelen, keuzes = {}, seed, gebied, aantal = STANDAARD.aantal, blokken = STANDAARD.blokken }) {
  const rng = maakRng(afgeleideSeed(seed, 'plan'));
  const gebruiktVormen = new Set(), perDoel = [];
  for (const doel of doelen) {
    const vormen = vak.generators.filter(g => g.doelen.includes(doel));
    if (!vormen.length) continue;
    let kandidaten = vormen.filter(v => !gebruiktVormen.has(v.id));
    if (!kandidaten.length) kandidaten = vormen;
    const basis = kandidaten.filter(v => v.basis);
    const eerste = rng.schud(basis.length ? basis : kandidaten)[0];
    const rest = rng.schud(kandidaten.filter(v => v !== eerste));
    const gekozen = [eerste];
    while (gekozen.length < blokken && rest.length) gekozen.push(rest.shift());
    gekozen.sort((x, y) => (x.rang ?? 3) - (y.rang ?? 3));        // van makkelijk naar moeilijk
    gekozen.forEach(v => gebruiktVormen.add(v.id));
    perDoel.push(gekozen.map(v => ({ doel, v })));
  }
  const volgorde = [];                                              // doelen afwisselen over het blad
  for (let i = 0; perDoel.some(l => i < l.length); i++) for (const l of perDoel) if (l[i]) volgorde.push(l[i]);
  const model = { versie: GENERATOR_VERSIE, vak: vak.id, gebied, blokken: [] };
  const gebruikt = new Set();
  volgorde.forEach(({ doel, v }, i) => {
    const blok = nieuwBlok(vak, model, v, doel, afgeleideSeed(seed, `${v.id}|${doel}|${i}`), optiesVoor(v, doelen, keuzes), effectiefAantal(v, aantal), gebruikt);
    model.blokken.push(blok);
    const { oefeningen } = poolVan(vak, blok, gebied);
    blok.volgorde.forEach(idx => kernenVan(oefeningen[idx]).forEach(k => gebruikt.add(k)));
  });
  return model;
}

// Eenvoudig model: elke opgegeven vorm krijgt één blok (voor tests en losse bladen).
export function modelVoorVormen(vak, vormIds, { seed, aantal, gebied, opties = {} }) {
  const model = { versie: GENERATOR_VERSIE, vak: vak.id, gebied, blokken: [] };
  const gebruikt = new Set();
  vormIds.forEach((id, i) => {
    const v = vormVan(vak, id);
    const blok = nieuwBlok(vak, model, v, null, afgeleideSeed(seed, `${id}|${i}`), opties[id] || {}, effectiefAantal(v, aantal), gebruikt);
    model.blokken.push(blok);
    const { oefeningen } = poolVan(vak, blok, gebied);
    blok.volgorde.forEach(idx => kernenVan(oefeningen[idx]).forEach(k => gebruikt.add(k)));
  });
  return model;
}

/* ------------------------------------------------------------------ naar een blad */
// Geeft het blad zoals het getoond wordt: blokken met hun oefeningen, waarschuwingen en de bladcode.
export function losOp(vak, model) {
  const waarschuwingen = [];
  const blokken = model.blokken.map((blok, index) => {
    const vorm = vormVan(vak, blok.vorm);
    const { oefeningen, waarschuwing } = poolVan(vak, blok, model.gebied);
    const getoond = blok.volgorde.map(i => oefeningen[i]).filter(Boolean);
    if (!oefeningen.length) waarschuwingen.push(`${vorm.titel}: ${waarschuwing || 'geen oefeningen mogelijk binnen dit getallengebied.'}`);
    else if (getoond.length < blok.n) waarschuwingen.push(`${vorm.titel}: ${getoond.length} van ${blok.n} oefeningen mogelijk binnen dit getallengebied.`);
    return { index, vormId: vorm.id, doel: blok.doel, titel: vorm.titel, pictogram: vorm.pictogram, opdracht: vorm.opdracht, oefeningen: getoond };
  });
  return { titel: `Werkblad ${vak.naam.toLowerCase()}`, blokken, waarschuwingen, code: codeVan(model), model };
}

/* ------------------------------------------------------------------ aanpassen (wijzigt het model) */
export function verwijderOefening(vak, model, bi, pos) {
  const b = model.blokken[bi];
  const [idx] = b.volgorde.splice(pos, 1);
  if (idx !== undefined) b.weg.push(idx);
  b.n = b.volgorde.length;
}

export function vervangOefening(vak, model, bi, pos) {
  const idx = volgendeIndex(vak, model, bi);
  if (idx === null) return false;
  const b = model.blokken[bi];
  b.weg.push(b.volgorde[pos]);
  b.volgorde[pos] = idx;
  return true;
}

export function voegOefeningToe(vak, model, bi) {
  const idx = volgendeIndex(vak, model, bi);
  if (idx === null) return false;
  const b = model.blokken[bi];
  b.volgorde.push(idx);
  b.n = b.volgorde.length;
  return true;
}

export function blokOpnieuw(vak, model, bi, seed) {
  const b = model.blokken[bi];
  b.seed = seed; b.weg = [];
  b.volgorde = kies(vak, model, b, b.n, getoondeKernen(vak, model, bi));
}

export function verwijderBlok(model, bi) { model.blokken.splice(bi, 1); }

export function voegBlokToe(vak, model, { vormId, doel, seed, aantal = STANDAARD.aantal, opties = {} }) {
  const v = vormVan(vak, vormId);
  model.blokken.push(nieuwBlok(vak, model, v, doel, seed, opties, effectiefAantal(v, aantal), getoondeKernen(vak, model)));
}

/* ------------------------------------------------------------------ bladcode */
export function codeVan(model) {
  const opties = [];                                              // gedeelde opties worden maar één keer bewaard
  const refOpties = (o) => {
    if (!o || !Object.keys(o).length) return -1;
    const j = JSON.stringify(o);
    let i = opties.findIndex(x => JSON.stringify(x) === j);
    if (i < 0) { opties.push(o); i = opties.length - 1; }
    return i;
  };
  const vormen = [], doelen = [];                                 // lange namen worden maar één keer bewaard
  const ref = (lijst, w) => { let i = lijst.indexOf(w); if (i < 0) { lijst.push(w); i = lijst.length - 1; } return i; };
  const b = model.blokken.map(bl => [ref(vormen, bl.vorm), bl.doel === null ? -1 : ref(doelen, bl.doel), bl.seed.toString(36), refOpties(bl.opties), bl.volgorde.join(','), bl.weg.join(','), bl.n]);
  return codeNaarTekst({ v: 2, m: model.versie, k: model.vak, g: model.gebied, f: vormen, d: doelen, o: opties, b });
}

// Geeft { model, waarschuwing } terug; waarschuwing is gevuld als het blad met een andere versie gemaakt is.
export function modelUitCode(vak, tekst) {
  const c = tekstNaarCode(tekst);
  if (c.v !== 2 || !Array.isArray(c.b)) throw new Error('Deze bladcode wordt niet herkend.');
  if (c.k !== vak.id) throw new Error(`Deze code hoort bij een ander vak (${c.k}).`);
  const lijst = (t) => (t === '' ? [] : String(t).split(',').map(Number));
  const model = {
    versie: c.m, vak: c.k, gebied: c.g,
    blokken: c.b.map(([vi, di, seed, opties, volgorde, weg, n]) => {
      const vorm = c.f[vi];
      vormVan(vak, vorm);
      return { vorm, doel: di >= 0 ? c.d[di] : null, seed: parseInt(seed, 36), opties: opties >= 0 ? c.o[opties] : {}, volgorde: lijst(volgorde), weg: lijst(weg), n };
    }),
  };
  return { model, waarschuwing: c.m !== GENERATOR_VERSIE ? 'Dit blad is gemaakt met een andere versie van de tool. De oefeningen kunnen afwijken.' : null };
}

export const kopieer = (model) => JSON.parse(JSON.stringify(model));
