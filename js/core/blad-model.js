// Het werkblad als bewerkbaar model. Een blad bestaat uit blokken (elk een oefenvorm bij een doel, of een hulpblokje).
// Elk blok heeft een eigen, herhaalbare reeks oefeningen (een 'pool'); het blok onthoudt enkel welke
// oefeningen uit die pool getoond worden. Daardoor kan elke aanpassing in de bladcode bewaard worden.
import { maakRng, afgeleideSeed } from './random.js';
import { codeNaarTekst, tekstNaarCode } from './bladcode.js';
import { doelVan } from './doelregister.js';

export const STANDAARD = { blokken: 3, aantal: 6 };
export const POOL = 48;                 // aantal oefeningen dat per blok in reserve wordt gemaakt
export const GENERATOR_VERSIE = 1;      // verhogen als generators andere oefeningen gaan maken (dan kloppen oude bladcodes niet meer)

const poolCache = new Map();
// Standaardbreedte van een vorm volgens de kaart waarop ze in het palet staat (zo gebruiken beide werkwijzen dezelfde blokjes).
export const kaartBreedte = (vak, vormId) => { const k = vak.blokjes?.kaarten.find(x => x.vormen.includes(vormId)); return k && (k.breedtes?.[vormId] ?? k.breedte); };
const breedteExtra = (vak, vormId) => { const w = kaartBreedte(vak, vormId); return w ? { breedte: w } : {}; };
// Elk blok kan zijn eigen rekengebied hebben (bij 'Zelf samenstellen'); anders geldt dat van het blad.
const gebiedVan = (model, blok) => blok.gebied ?? model.gebied;

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
    if (b.hulp) return;
    const { oefeningen } = poolVan(vak, b, gebiedVan(model, b));
    b.volgorde.forEach(idx => oefeningen[idx] && kernenVan(oefeningen[idx]).forEach(k => set.add(k)));
  });
  return set;
}

// Kiest n oefeningen uit de pool van een blok, zonder kernen die al op het blad staan.
function kies(vak, model, blok, n, gebruikt) {
  const { oefeningen } = poolVan(vak, blok, gebiedVan(model, blok));
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
  const { oefeningen } = poolVan(vak, blok, gebiedVan(model, blok));
  const reserve = reserveVolgorde(blok, oefeningen.length);
  const gebruikt = getoondeKernen(vak, model);
  const vrij = reserve.filter(i => !blok.volgorde.includes(i) && !blok.weg.includes(i));
  return vrij.find(i => !kernenVan(oefeningen[i]).some(k => gebruikt.has(k))) ?? vrij[0] ?? null;
}

// Keuzes horen bij een groep (standaard de vorm zelf); vormen van één familie delen zo dezelfde keuzes.
export const keuzeGroep = (vorm, keuze) => keuze.groep || vorm.id;
export function optiesVoor(vorm, doelCodes, keuzes = {}, doel = null) {
  if (!vorm.opties) return {};
  const eigen = {};
  for (const k of vorm.keuzes || []) { const w = (keuzes[keuzeGroep(vorm, k)] || {})[k.id]; if (w !== undefined) eigen[k.id] = w; }
  return vorm.opties(doelCodes, eigen, doel);          // 'doel' = het doel van dit blok (sommige vormen passen zich daaraan aan)
}

function nieuwBlok(vak, model, vorm, doel, seed, opties, n, gebruikt, extra = {}) {
  const blok = { vorm: vorm.id, doel, seed, opties, volgorde: [], weg: [], n, ...extra };
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
    const nieuw = vormen.filter(v => !gebruiktVormen.has(v.id));
    const kandidaten = nieuw.length >= blokken ? nieuw : nieuw.concat(vormen.filter(v => gebruiktVormen.has(v.id)));   // te weinig nieuwe vormen: vul aan met vormen die al gebruikt zijn
    const basis = (nieuw.length ? nieuw : kandidaten).filter(v => v.basis);
    const eerste = rng.schud(basis.length ? basis : nieuw.length ? nieuw : kandidaten)[0];
    const rest = [...rng.schud(nieuw.filter(v => v !== eerste)), ...rng.schud(kandidaten.filter(v => v !== eerste && !nieuw.includes(v)))];
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
    const blok = nieuwBlok(vak, model, v, doel, afgeleideSeed(seed, `${v.id}|${doel}|${i}`), optiesVoor(v, doelen, keuzes, doel), effectiefAantal(v, aantal), gebruikt, breedteExtra(vak, v.id));
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
export const BREEDTES = [1, 2, 4];                                // een kwart, de helft of de volle bladbreedte
export const HULP = ['instructie', 'blanco', 'pagina'];

// Grootste getal uit 'tot en met 1000', '≤ 20' of 'tot 100' in de tekst van een doel (anders null).
const grensUitTekst = (tekst) => {
  const m = /(?:≤|tot en met|tot)\s*(\d[\d ]*\d|\d)/.exec(tekst || '');
  return m ? Number(m[1].replace(/ /g, '')) : null;
};
// Op.stap-doelen die bij een blokje horen in dit rekengebied: de doelen zonder grens en die met de grootste grens die niet boven het gebied ligt.
export function doelenBijBlokje(vorm, gebied) {
  const doelen = (vorm.doelen || []).map(code => ({ code, doel: doelVan(code) })).filter(x => x.doel);
  if (!gebied) return doelen.map(x => x.code);
  const grenzen = doelen.map(x => grensUitTekst(x.doel.tekst)).filter(g => g !== null && g <= gebied);
  const top = grenzen.length ? Math.max(...grenzen) : null;
  return doelen.filter(x => { const g = grensUitTekst(x.doel.tekst); return g === null || g === top; }).map(x => x.code);
}

// Het voorbeeld van een blokje: de eerste oefening met het antwoord erin. delen = [{ t, blauw }]; het antwoord staat in het blauw.
export function voorbeeldDelen(o) {
  if (o.tekst && o.tekst.includes('____') && o.antwoord !== undefined && !/\n/.test(o.tekst)) {
    const i = o.tekst.indexOf('____');
    return [{ t: o.tekst.slice(0, i) }, { t: String(o.antwoord), blauw: true }, { t: o.tekst.slice(i + 4) }].filter(x => x.t !== '');
  }
  return [{ t: o.volledig ?? o.tekst ?? '', blauw: true }];
}

// Geeft het blad zoals het getoond wordt: blokken met hun oefeningen, waarschuwingen en de bladcode.
export function losOp(vak, model) {
  const waarschuwingen = [], doelen = new Set();
  const blokken = model.blokken.map((blok, index) => {
    if (blok.hulp) return { index, hulp: blok.hulp, tekst: blok.tekst || '', breedte: blok.hulp === 'pagina' ? 4 : (blok.breedte ?? 4), hoogte: blok.hoogte ?? 3, oefeningen: [] };
    const vorm = vormVan(vak, blok.vorm);
    const gebied = gebiedVan(model, blok);
    const { oefeningen, waarschuwing } = poolVan(vak, blok, gebied);
    // Vormen met een voorbeeld (bv. het stappenplan bij breuken) tonen de eerste oefening ingevuld als de leerkracht dat kiest.
    const voorbeeld = vorm.voorbeeld && blok.opties && blok.opties.voorbeeld === 'ja';
    const getoond = blok.volgorde.map(i => oefeningen[i]).filter(Boolean).map((o, i) => {
      if (voorbeeld && i === 0 && o.voorbeeldSvg) return { ...o, svg: o.voorbeeldSvg, voorbeeld: true };
      if (blok.vb && i === 0) return { ...o, voorbeeld: true, voorbeeldDelen: voorbeeldDelen(o), svg: o.antwoordSvg || o.svg };
      return o;
    });
    if (!oefeningen.length) waarschuwingen.push(`${vorm.titel}: ${waarschuwing || 'geen oefeningen mogelijk met deze instellingen.'}`);
    else if (getoond.length < blok.n) waarschuwingen.push(`${vorm.titel}: ${getoond.length} van ${blok.n} oefeningen mogelijk met deze instellingen.`);
    (blok.doel ? [blok.doel] : doelenBijBlokje(vorm, gebied)).forEach(c => doelen.add(c));
    const breed = getoond.some(o => o.breed && o.svg);                // tekeningen vragen de volle breedte
    return { index, vormId: vorm.id, doel: blok.doel, titel: vorm.titel, pictogram: vorm.pictogram, opdracht: vorm.opdracht, oefeningen: getoond, breedte: breed ? 4 : (blok.breedte ?? 4), vb: !!blok.vb, gebied };
  });
  return { titel: `Werkblad ${vak.naam.toLowerCase()}`, blokken, waarschuwingen, doelen: [...doelen].sort(), code: codeVan(model), model };
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
  model.blokken.push(nieuwBlok(vak, model, v, doel, seed, opties, effectiefAantal(v, aantal), getoondeKernen(vak, model), breedteExtra(vak, v.id)));
}


/* ------------------------------------------------------------------ blokjes (zelf samenstellen) */
// spec: { vormId, gebied, opties, aantal, breedte, vb, doel, seed }; positie = waar het blokje komt (standaard achteraan).
export function voegBlokjeToe(vak, model, { vormId, gebied, opties = {}, aantal = STANDAARD.aantal, breedte, vb = false, doel = null, seed }, positie = model.blokken.length) {
  const v = vormVan(vak, vormId);
  const extra = { gebied, ...(breedte ? { breedte } : {}), ...(vb ? { vb: true } : {}) };
  const blok = nieuwBlok(vak, model, v, doel, seed, opties, effectiefAantal(v, aantal), getoondeKernen(vak, model), extra);
  model.blokken.splice(Math.max(0, Math.min(positie, model.blokken.length)), 0, blok);
  return blok;
}
export function voegHulpToe(model, { hulp, tekst = '', breedte, hoogte }, positie = model.blokken.length) {
  if (!HULP.includes(hulp)) throw new Error(`Onbekend hulpblokje: ${hulp}`);
  model.blokken.splice(Math.max(0, Math.min(positie, model.blokken.length)), 0, { hulp, ...(tekst ? { tekst } : {}), ...(breedte ? { breedte } : {}), ...(hoogte ? { hoogte } : {}) });
}
export function pasHulpAan(model, bi, wijziging) { Object.assign(model.blokken[bi], wijziging); }
export function zetVoorbeeld(model, bi, aan) { const b = model.blokken[bi]; if (aan) b.vb = true; else delete b.vb; }
export function zetBreedte(model, bi, breedte) { if (!BREEDTES.includes(breedte)) throw new Error('Onbekende breedte'); model.blokken[bi].breedte = breedte; }
export function verplaatsBlok(model, van, naar) {
  if (van === naar || van < 0 || van >= model.blokken.length) return;
  const [b] = model.blokken.splice(van, 1);
  model.blokken.splice(Math.max(0, Math.min(naar, model.blokken.length)), 0, b);
}
// Nieuwe getallen voor alle blokjes; blokjes, aantallen en instellingen blijven.
export function alleOpnieuw(vak, model, seedVan) { model.blokken.forEach((b, i) => { if (!b.hulp) blokOpnieuw(vak, model, i, seedVan(i)); }); }
// Hetzelfde blad voor een andere leerling: dezelfde blokjes, andere getallen.
export function modelVoorLeerling(vak, model, sleutel) {
  const m = kopieer(model);
  m.blokken.forEach((b, i) => { if (!b.hulp) blokOpnieuw(vak, m, i, afgeleideSeed(b.seed, `leerling|${sleutel}`)); });
  return m;
}
export const lijstBlokken = (model) => model.blokken.filter(b => !b.hulp);

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
  const b = model.blokken.map(bl => {
    if (bl.hulp) return [-1, -1, '0', -1, '', '', 0, { h: bl.hulp, ...(bl.tekst ? { t: bl.tekst } : {}), ...(bl.breedte ? { w: bl.breedte } : {}), ...(bl.hoogte ? { y: bl.hoogte } : {}) }];
    const extra = { ...(bl.gebied !== undefined ? { g: bl.gebied } : {}), ...(bl.vb ? { v: 1 } : {}), ...(bl.breedte ? { w: bl.breedte } : {}) };
    return [ref(vormen, bl.vorm), bl.doel === null ? -1 : ref(doelen, bl.doel), bl.seed.toString(36), refOpties(bl.opties), bl.volgorde.join(','), bl.weg.join(','), bl.n, ...(Object.keys(extra).length ? [extra] : [])];
  });
  return codeNaarTekst({ v: 3, m: model.versie, k: model.vak, g: model.gebied, f: vormen, d: doelen, o: opties, b });
}

// Geeft { model, waarschuwing } terug; waarschuwing is gevuld als het blad met een andere versie gemaakt is. Bladcodes B2 en B3 worden gelezen.
export function modelUitCode(vak, tekst) {
  const c = tekstNaarCode(tekst);
  if (![2, 3].includes(c.v) || !Array.isArray(c.b)) throw new Error('Deze bladcode wordt niet herkend.');
  if (c.k !== vak.id) throw new Error(`Deze code hoort bij een ander vak (${c.k}).`);
  const lijst = (t) => (t === '' ? [] : String(t).split(',').map(Number));
  const model = {
    versie: c.m, vak: c.k, gebied: c.g,
    blokken: c.b.map(([vi, di, seed, opties, volgorde, weg, n, extra]) => {
      if (vi === -1) return { hulp: extra.h, ...(extra.t ? { tekst: extra.t } : {}), ...(extra.w ? { breedte: extra.w } : {}), ...(extra.y ? { hoogte: extra.y } : {}) };
      const vorm = c.f[vi];
      vormVan(vak, vorm);
      return { vorm, doel: di >= 0 ? c.d[di] : null, seed: parseInt(seed, 36), opties: opties >= 0 ? c.o[opties] : {}, volgorde: lijst(volgorde), weg: lijst(weg), n,
        ...(extra && extra.g !== undefined ? { gebied: extra.g } : {}), ...(extra && extra.v ? { vb: true } : {}), ...(extra && extra.w ? { breedte: extra.w } : {}) };
    }),
  };
  return { model, waarschuwing: c.m !== GENERATOR_VERSIE ? 'Dit blad is gemaakt met een andere versie van de tool. De oefeningen kunnen afwijken.' : null };
}

export const kopieer = (model) => JSON.parse(JSON.stringify(model));
