// Tekeningen voor getalbegrip: stippen, tienerframes, rij kinderen en turfstreepjes. Elk telbaar element heeft een data-attribuut zodat een test het kan nalezen.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif">`;
const KLEUR = { A: '#4a90d9', B: '#e0793a', C: '#4caf72' };

// Losse stippen op willekeurige plaatsen in een vak van b x h; plaatsen = [[x, y], ...]. Meerdere groepen naast elkaar met een letter.
export function stippenGroepen(groepen, { b = 230, h = 120, r = 9 } = {}) {
  const W = groepen.length * (b + 16) + 8, H = h + 34;
  let s = HEAD(W, H);
  groepen.forEach((g, i) => {
    const x0 = 8 + i * (b + 16);
    s += `<g data-groep="${g.id}"><rect x="${x0}" y="26" width="${b}" height="${h}" rx="8" fill="#fff" stroke="#9aa7b2" stroke-width="1.6"/>`;
    for (const [x, y] of g.plaatsen) s += `<circle data-punt="${g.id}" cx="${x0 + x}" cy="${26 + y}" r="${r}" fill="${KLEUR[g.id] || '#4a90d9'}" stroke="#1f3b57" stroke-width="1.2"/>`;
    s += `</g>`;
    if (groepen.length > 1) s += `<text x="${x0 + b / 2}" y="18" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">${g.id}</text>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Tienerframe(s): 2 rijen van 5 vakjes per frame; n stippen vullen de frames van links naar rechts, rij per rij.
export function tienerframes(n, { frames = n > 10 ? 2 : 1, cel = 30 } = {}) {
  const W = frames * (5 * cel + 24) + 8, H = 2 * cel + 16;
  let s = HEAD(W, H), k = 0;
  for (let f = 0; f < frames; f++) {
    const x0 = 8 + f * (5 * cel + 24);
    s += `<rect x="${x0}" y="8" width="${5 * cel}" height="${2 * cel}" fill="#fff" stroke="#1f3b57" stroke-width="2"/>`;
    for (let i = 1; i < 5; i++) s += `<line x1="${x0 + i * cel}" y1="8" x2="${x0 + i * cel}" y2="${8 + 2 * cel}" stroke="#1f3b57" stroke-width="1.2"/>`;
    s += `<line x1="${x0}" y1="${8 + cel}" x2="${x0 + 5 * cel}" y2="${8 + cel}" stroke="#1f3b57" stroke-width="1.2"/>`;
    for (let rij = 0; rij < 2; rij++) for (let kol = 0; kol < 5; kol++) if (k++ < n) s += `<circle data-punt="A" cx="${x0 + kol * cel + cel / 2}" cy="${8 + rij * cel + cel / 2}" r="${cel / 2 - 5}" fill="#4a90d9" stroke="#1f3b57" stroke-width="1.2"/>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Rij van n kinderen (rondjes); het kind op plaats 'markeer' (1 = eerste, links) is rood.
export function kinderRij(n, markeer) {
  const stap = 44, W = n * stap + 16, H = 64;
  let s = HEAD(W, H);
  for (let i = 1; i <= n; i++) s += `<g data-kind="${i}"${i === markeer ? ' data-markeer="1"' : ''}><circle cx="${8 + (i - 0.5) * stap}" cy="26" r="15" fill="${i === markeer ? '#c0392b' : '#f6d27a'}" stroke="#222" stroke-width="1.6"/><circle cx="${8 + (i - 0.5) * stap - 5}" cy="22" r="2" fill="#222"/><circle cx="${8 + (i - 0.5) * stap + 5}" cy="22" r="2" fill="#222"/><path d="M${8 + (i - 0.5) * stap - 6} 31 q6 6 12 0" fill="none" stroke="#222" stroke-width="1.5"/></g>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Turfstreepjes: groepjes van vijf (vier streepjes met een schuine streep erdoor).
export function turfstreepjes(n) {
  const groepen = Math.ceil(n / 5), W = groepen * 62 + 12, H = 64;
  let s = HEAD(W, H), over = n;
  for (let g = 0; g < groepen; g++) {
    const x0 = 10 + g * 62, k = Math.min(5, over); over -= k;
    for (let i = 0; i < Math.min(4, k); i++) s += `<line data-streep="1" x1="${x0 + i * 11}" y1="8" x2="${x0 + i * 11}" y2="52" stroke="#222" stroke-width="3.4" stroke-linecap="round"/>`;
    if (k === 5) s += `<line data-streep="1" x1="${x0 - 5}" y1="46" x2="${x0 + 42}" y2="14" stroke="#222" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
