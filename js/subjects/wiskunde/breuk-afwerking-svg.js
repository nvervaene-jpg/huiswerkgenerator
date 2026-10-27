// Tekeningen voor de laatste breukfamilies: een breuk met horizontale breukstreep en het honderdveld.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Andika, Arial, Helvetica, sans-serif">`;
const GRIJS = '#8c8c8c', LIJN = '#222';

// Een breuk met horizontale breukstreep. data-teller en data-noemer laten de tests nalezen wat er staat.
export function breukSvg(t, n) {
  const W = 84, H = 96;
  return { markup: `${HEAD(W, H)}<g data-teller="${t}" data-noemer="${n}"><text x="${W / 2}" y="36" text-anchor="middle" font-size="34" fill="#111">${t}</text><line x1="14" y1="48" x2="${W - 14}" y2="48" stroke="${LIJN}" stroke-width="3"/><text x="${W / 2}" y="84" text-anchor="middle" font-size="34" fill="#111">${n}</text></g></svg>`, breedte: W, hoogte: H };
}

// Het honderdveld: 10 × 10 vakjes, de eerste t vakjes (rij per rij) zijn gekleurd. Elk vakje heeft data-deel="1" of "0".
export function honderdveld(t) {
  const C = 22, W = 10 * C + 8, H = 10 * C + 8;
  let s = HEAD(W, H);
  for (let i = 0; i < 100; i++) {
    const x = 4 + (i % 10) * C, y = 4 + Math.floor(i / 10) * C;
    s += `<rect data-deel="${i < t ? 1 : 0}" x="${x}" y="${y}" width="${C}" height="${C}" fill="${i < t ? GRIJS : '#fff'}" stroke="${LIJN}" stroke-width="1.4"/>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
