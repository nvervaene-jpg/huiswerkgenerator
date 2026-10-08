// SVG-tekeningen voor werkbladen: getallenas, MAB-materiaal en meetlat.
// Elke functie geeft { markup, breedte, hoogte } terug (px); de tekeningen zijn zelf getekend.
const HEAD = (w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif" ${extra}>`;

// Getallenas met 'ticks' streepjes; getallen in 'ontbreekt' (indexen) worden een leeg vakje.
export function getallenas({ start, stap, ontbreekt = [], ticks = 11 }) {
  const W = 640, H = 84, x0 = 34, x1 = 606, dx = (x1 - x0) / (ticks - 1);
  let s = HEAD(W, H, 'font-size="19"');
  s += '<line x1="8" y1="30" x2="630" y2="30" stroke="#222" stroke-width="2.5"/><path d="M632 30 l-11 -6 v12 z" fill="#222"/>';
  for (let i = 0; i < ticks; i++) {
    const x = (x0 + i * dx).toFixed(1);
    s += `<line x1="${x}" y1="20" x2="${x}" y2="40" stroke="#222" stroke-width="2.5"/>`;
    s += ontbreekt.includes(i)
      ? `<rect x="${(x0 + i * dx - 27).toFixed(1)}" y="46" width="54" height="30" rx="4" fill="#fff" stroke="#222" stroke-width="1.8" stroke-dasharray="5 3"/>`
      : `<text x="${x}" y="68" text-anchor="middle" fill="#111">${start + i * stap}</text>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// MAB-materiaal: h = honderdplaten, t = tientallen (staafjes), e = eenheden (blokjes).
export function mab({ h = 0, t = 0, e = 0 }) {
  const P = 38, STAAF_B = 6, KUB = 6;
  const W = 640, H = 52;
  let s = HEAD(W, H), x = 8;
  for (let i = 0; i < h; i++) {
    s += `<rect x="${x}" y="6" width="${P}" height="${P}" fill="#bfe0f5" stroke="#1f5f8f" stroke-width="1.5"/>`;
    for (let k = 1; k < 10; k++) {
      const p = (k * P / 10).toFixed(1);
      s += `<line x1="${x + +p}" y1="6" x2="${x + +p}" y2="${6 + P}" stroke="#1f5f8f" stroke-width=".6"/><line x1="${x}" y1="${6 + +p}" x2="${x + P}" y2="${6 + +p}" stroke="#1f5f8f" stroke-width=".6"/>`;
    }
    x += P + 6;
  }
  if (h && (t || e)) x += 14;
  for (let i = 0; i < t; i++) {
    s += `<rect x="${x}" y="6" width="${STAAF_B}" height="${P}" fill="#f6d27a" stroke="#9a6b00" stroke-width="1.2"/>`;
    for (let k = 1; k < 10; k++) s += `<line x1="${x}" y1="${6 + k * P / 10}" x2="${x + STAAF_B}" y2="${6 + k * P / 10}" stroke="#9a6b00" stroke-width=".5"/>`;
    x += STAAF_B + 4;
  }
  if (t && e) x += 14;
  for (let i = 0; i < e; i++) {
    s += `<rect x="${x}" y="${6 + P - KUB}" width="${KUB}" height="${KUB}" fill="#f4a3a3" stroke="#a33" stroke-width="1.2"/>`;
    x += KUB + 4;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Meetlat in cm (0 t.e.m. lengte) met een balk van 'van' tot 'tot' erboven.
export function meetlat({ lengte, van = 0, tot }) {
  const W = 640, H = 128, l = 22, r = W - 22;
  const dx = (r - l) / lengte, X = (v) => l + v * dx;
  const mm = dx >= 40;                                   // millimeterstreepjes enkel als er plaats voor is
  let s = HEAD(W, H, `font-size="${dx >= 40 ? 16 : dx >= 25 ? 14 : 12}"`);
  s += `<rect x="${X(van).toFixed(1)}" y="10" width="${((tot - van) * dx).toFixed(1)}" height="28" fill="#f4b942" stroke="#333" stroke-width="1.8"/>`;
  for (const v of [van, tot]) s += `<line x1="${X(v).toFixed(1)}" y1="38" x2="${X(v).toFixed(1)}" y2="58" stroke="#888" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<rect x="${l - 12}" y="58" width="${r - l + 24}" height="58" rx="3" fill="#fff6cf" stroke="#333" stroke-width="1.8"/>`;
  for (let c = 0; c <= lengte; c++) {
    const x = X(c).toFixed(1);
    s += `<line x1="${x}" y1="58" x2="${x}" y2="82" stroke="#222" stroke-width="1.8"/><text x="${x}" y="104" text-anchor="middle" fill="#111">${c}</text>`;
    if (c < lengte) for (let k = 1; k < 10; k++) {
      if (!mm && k !== 5) continue;                       // anders enkel het halve cm-streepje
      const xm = (X(c) + k * dx / 10).toFixed(1);
      s += `<line x1="${xm}" y1="58" x2="${xm}" y2="${k === 5 ? 72 : 66}" stroke="#222" stroke-width="1"/>`;
    }
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
