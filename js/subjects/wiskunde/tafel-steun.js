// Steun bij de tafels: een tafelrij (tekst), een getallenas met sprongen en een tekening van groepjes bolletjes.
// Elke tekening draagt data-attributen waaruit de tests nalezen wat er getekend is.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="'Century Gothic', 'Didact Gothic', Arial, sans-serif">`;

// 'Tafel van 3: 3 · 6 · 9 · …' voor elke gekozen tafel, hoogstens 8 regels.
export const MAX_STEUNTAFELS = 8;
export function tafelrij(tafels, [van, tot]) {
  const regels = tafels.slice(0, MAX_STEUNTAFELS).map(t => {
    const rij = []; for (let k = van; k <= tot; k++) rij.push(t * k);
    return `Tafel van ${t}:   ${rij.join('  ·  ')}`;
  });
  return { tekst: regels.join('\n'), tafels: tafels.slice(0, MAX_STEUNTAFELS), afgekapt: tafels.length > MAX_STEUNTAFELS };
}

// Getallenas 0 … t × tot met een boogje per sprong van t. Hoogstens drie tafels onder elkaar.
export function getallenas(tafels, [van, tot]) {
  const lijst = tafels.slice(0, 3), W = 640, X0 = 24, H1 = 88;
  let s = HEAD(W, lijst.length * H1 + 8);
  lijst.forEach((t, i) => {
    const eind = t * tot, stap = (W - 2 * X0) / eind, y = 62 + i * H1, x = (n) => X0 + n * stap;
    s += `<g data-getallenas="${t}" data-sprongen="${tot - van + 1}"><line x1="${X0 - 6}" y1="${y}" x2="${W - X0 + 6}" y2="${y}" stroke="#333" stroke-width="2"/>`;
    s += `<text x="${X0}" y="${y - 46}" font-size="14" fill="#1f3b57" font-weight="bold">sprongen van ${t}</text>`;
    for (let k = van - 1; k <= tot; k++) {
      const n = t * k;
      s += `<line x1="${x(n)}" y1="${y - 5}" x2="${x(n)}" y2="${y + 5}" stroke="#333" stroke-width="2"/>`;
      if (k >= 0) s += `<text x="${x(n)}" y="${y + 22}" text-anchor="middle" font-size="${tot > 10 ? 11 : 13}" fill="#111">${n}</text>`;
      if (k >= van) { const m = x(t * (k - 1)), e = x(n); s += `<path d="M${m} ${y - 6} Q${(m + e) / 2} ${y - 34} ${e} ${y - 6}" fill="none" stroke="#e07a5f" stroke-width="2" data-sprong="${t}"/>`; }
    }
    s += '</g>';
  });
  return { markup: s + '</svg>', breedte: W, hoogte: lijst.length * H1 + 8 };
}

// 'rijen' rijen van 'per' bolletjes; null als het te groot wordt om te tekenen.
export function groepjes(rijen, per) {
  if (rijen < 1 || per < 1 || rijen > 20 || per > 20 || rijen * per > 200) return null;
  const D = 16, W = per * D + 14, H = rijen * D + 10;
  let s = HEAD(W, H) + `<g data-groepjes="${rijen}x${per}">`;
  for (let i = 0; i < rijen; i++) for (let j = 0; j < per; j++) s += `<circle cx="${10 + j * D}" cy="${10 + i * D}" r="5.5" fill="#6fb7e9" stroke="#333" stroke-width="1.2" data-bol="1"/>`;
  return { markup: s + '</g></svg>', breedte: W, hoogte: H };
}
