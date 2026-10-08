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

export function filterDoelen(doelen, { leerjaren, domein, routes, alleenMetGenerator = true }) {
  return doelen.filter(d =>
    (!leerjaren || leerjaren.includes(d.leerjaar)) &&
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
