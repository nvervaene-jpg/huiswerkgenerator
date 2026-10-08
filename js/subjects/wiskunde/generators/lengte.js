// Gedeeld door de lengte-generators.
export const FACTOR = { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 };
const VOLGORDE = ['km', 'm', 'dm', 'cm', 'mm'];

// Eenheden die bij de aangevinkte doelen horen.
export function eenhedenVoorDoelen(kaart, doelCodes) {
  const set = new Set();
  for (const c of doelCodes) (kaart[c] || []).forEach(e => set.add(e));
  return VOLGORDE.filter(e => set.has(e));
}
