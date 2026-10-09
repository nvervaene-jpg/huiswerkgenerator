// Laadt het doelenbestand van een vak en voegt de generator-koppelingen toe.
// Het bronbestand zelf wordt nooit aangepast.

export const LEERJAREN = [
  { id: 'K3', naam: '3de kleuter' },
  { id: 'L1', naam: '1ste leerjaar' },
  { id: 'L2', naam: '2de leerjaar' },
  { id: 'L3', naam: '3de leerjaar' },
  { id: 'L4', naam: '4de leerjaar' },
  { id: 'L5', naam: '5de leerjaar' },
  { id: 'L6', naam: '6de leerjaar' },
];

export async function laadDoelen(vak, fetchFn = fetch) {
  const [bron, map] = await Promise.all([
    fetchFn(vak.doelenUrl).then(r => r.json()),
    fetchFn(vak.koppelingenUrl).then(r => r.json()),
  ]);
  const koppelingen = map.koppelingen || {};
  const doelen = bron.doelen.map(d => ({
    ...d,
    generators: [...new Set([...(d.generators || []), ...(koppelingen[d.code] || [])])],
  }));
  return { bron: bron.bron, aantalDoelen: bron.aantalDoelen, doelen };
}

// Zoeken: hoofdletters en accenten tellen niet mee (chloë = CHLOE). Lengte blijft gelijk, zodat markeren kan.
export const vouw = (t) => String(t).split('').map(c => c.normalize('NFD')[0].toLowerCase()).join('');
export const zoekTermen = (zoek) => vouw(zoek || '').split(/\s+/).filter(Boolean);
const doorzoekbaar = (d) => vouw([d.code, d.tekst, d.domein, d.subdomein, d.rubriek, d.leerjaarLabel].filter(Boolean).join(' \u0001 '));
const gevouwen = new WeakMap();
// Een doel komt overeen als elk zoekwoord erin voorkomt (in de tekst, de code, het domein, de rubriek of het leerjaar).
export function komtOvereen(doel, termen) {
  if (!termen.length) return true;
  if (!gevouwen.has(doel)) gevouwen.set(doel, doorzoekbaar(doel));
  const h = gevouwen.get(doel);
  return termen.every(t => h.includes(t));
}

// Verdeelt een tekst in stukken, met mark: true voor de delen die een zoekwoord zijn.
export function markeer(tekst, termen) {
  const g = vouw(tekst), mark = new Array(tekst.length).fill(false);
  for (const t of termen) for (let i = g.indexOf(t); i >= 0; i = g.indexOf(t, i + 1)) for (let k = i; k < i + t.length; k++) mark[k] = true;
  const delen = [];
  for (let i = 0; i < tekst.length; i++) {
    if (delen.length && delen[delen.length - 1].mark === mark[i]) delen[delen.length - 1].tekst += tekst[i];
    else delen.push({ tekst: tekst[i], mark: mark[i] });
  }
  return delen;
}

// Met zoektermen telt het leerjaar-venster niet mee: je zoekt dan in alle leerjaren.
export function filterDoelen(doelen, { leerjaren, domein, routes, alleenMetGenerator = true, zoek = '' }) {
  const termen = zoekTermen(zoek);
  return doelen.filter(d =>
    (termen.length ? komtOvereen(d, termen) : (!leerjaren || leerjaren.includes(d.leerjaar))) &&
    (!domein || d.domein === domein) &&
    (!routes || routes.includes(d.route)) &&
    (!alleenMetGenerator || d.generators.length > 0));
}

export function groepeer(doelen) {
  const res = new Map();
  for (const d of doelen) {
    const sleutel = [d.subdomein, d.rubriek || ''].join('\u0000');
    if (!res.has(sleutel)) res.set(sleutel, { subdomein: d.subdomein, rubriek: d.rubriek, doelen: [] });
    res.get(sleutel).doelen.push(d);
  }
  return [...res.values()];
}
