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

const rond = (x) => Number(x.toFixed(2));

// Wijzerweegschaal van 0 tot 'max' kg; de wijzer staat op 'waarde' kg. Streepjes: elke 0,5 kg (max 10) of elke 100 g (max 5).
export function weegschaal({ waarde, max }) {
  const W = 300, H = 198, cx = 150, cy = 98, R = 82;
  const hoek = (v) => -135 + (270 * v) / max;
  const punt = (deg, rad) => [rond(cx + rad * Math.sin((deg * Math.PI) / 180)), rond(cy - rad * Math.cos((deg * Math.PI) / 180))];
  let s = HEAD(W, H, 'font-size="15"');
  s += `<rect x="28" y="6" width="244" height="186" rx="20" fill="#e8eef5" stroke="#333" stroke-width="2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="#333" stroke-width="2.5"/>`;
  s += `<g transform="rotate(${rond(hoek(waarde))} ${cx} ${cy})"><line x1="${cx}" y1="${cy + 8}" x2="${cx}" y2="${cy - (R - 16)}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>`;
  const stap = max === 5 ? 0.1 : 0.5;
  for (let i = 0; i <= Math.round(max / stap); i++) {
    const v = i * stap, groot = Math.abs(v - Math.round(v)) < 1e-9;
    const [x1, y1] = punt(hoek(v), R - 3), [x2, y2] = punt(hoek(v), R - (groot ? 15 : 9));
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#222" stroke-width="${groot ? 2.2 : 1}"/>`;
    if (groot) { const [tx, ty] = punt(hoek(v), R - 29); s += `<text x="${tx}" y="${rond(ty + 5)}" text-anchor="middle" fill="#111" stroke="#fff" stroke-width="4" paint-order="stroke">${Math.round(v)}</text>`; }
  }
  s += `<text x="${cx}" y="${cy + 38}" text-anchor="middle" font-size="13" fill="#555">kg</text>`;
  s += `<circle cx="${cx}" cy="${cy}" r="6" fill="#333"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Analoge klok. Zonder 'h' en 'm' krijg je een lege klok (zonder wijzers) om zelf in te tekenen.
export function klok({ h, m } = {}) {
  const W = 176, c = 88, R = 80;
  let s = HEAD(W, W, 'font-size="17"');
  s += `<circle cx="${c}" cy="${c}" r="${R}" fill="#fff" stroke="#222" stroke-width="3"/>`;
  for (let i = 0; i < 60; i++) {
    const groot = i % 5 === 0, a = (i * 6 * Math.PI) / 180, r1 = R - 3, r2 = R - (groot ? 11 : 6);
    s += `<line x1="${rond(c + r1 * Math.sin(a))}" y1="${rond(c - r1 * Math.cos(a))}" x2="${rond(c + r2 * Math.sin(a))}" y2="${rond(c - r2 * Math.cos(a))}" stroke="#222" stroke-width="${groot ? 2.2 : 1}"/>`;
  }
  for (let n = 1; n <= 12; n++) {
    const a = (n * 30 * Math.PI) / 180;
    s += `<text x="${rond(c + 55 * Math.sin(a))}" y="${rond(c - 55 * Math.cos(a) + 6)}" text-anchor="middle" fill="#111" font-weight="bold" stroke="#fff" stroke-width="4" paint-order="stroke">${n}</text>`;
  }
  if (h !== undefined) {
    s += `<g transform="rotate(${rond((h % 12) * 30 + m * 0.5)} ${c} ${c})"><line x1="${c}" y1="${c + 6}" x2="${c}" y2="${c - 36}" stroke="#1f3b57" stroke-width="6" stroke-linecap="round"/></g>`;
    s += `<g transform="rotate(${rond(m * 6)} ${c} ${c})"><line x1="${c}" y1="${c + 8}" x2="${c}" y2="${c - 66}" stroke="#c0392b" stroke-width="3.5" stroke-linecap="round"/></g>`;
  }
  return { markup: s + `<circle cx="${c}" cy="${c}" r="4.5" fill="#222"/></svg>`, breedte: W, hoogte: W };
}

// Munten en biljetten; 'items' zijn bedragen in eurocent (bv. [500, 200, 50]).
const BILJETTEN = { 500: '#cfcfcf', 1000: '#f4b6b6', 2000: '#a9c9f0', 5000: '#f6c78b', 10000: '#b9e3b0', 20000: '#f1e48a' };
const MUNTEN = { 200: '#e6c35c', 100: '#e6c35c', 50: '#e6c35c', 20: '#e6c35c', 10: '#e6c35c', 5: '#d99a6c', 2: '#d99a6c', 1: '#d99a6c' };
export function geld(items) {
  const BREEDTE = 640, RAND = 8;
  const rijen = [[]]; let x = RAND;
  for (const c of items) {
    const b = c >= 500 ? 90 : 48;
    if (x + b > BREEDTE - RAND) { rijen.push([]); x = RAND; }
    rijen[rijen.length - 1].push({ c, x }); x += b;
  }
  const H = rijen.length * 54 + 8;
  let s = HEAD(BREEDTE, H, 'font-size="15"');
  rijen.forEach((rij, ri) => {
    const y = 6 + ri * 54;
    for (const { c, x: px } of rij) {
      const euro = c >= 100;
      const label = euro ? (c >= 500 ? `€ ${c / 100}` : `€${c / 100}`) : `${c}c`;
      if (c >= 500) s += `<rect x="${px}" y="${y + 4}" width="82" height="42" rx="4" fill="${BILJETTEN[c]}" stroke="#333" stroke-width="1.8"/><text x="${px + 41}" y="${y + 31}" text-anchor="middle" font-weight="bold" fill="#111">${label}</text>`;
      else s += `<circle cx="${px + 21}" cy="${y + 25}" r="${c >= 100 ? 21 : c >= 20 ? 19 : 16}" fill="${MUNTEN[c]}" stroke="#555" stroke-width="2"/>${c === 100 || c === 200 ? `<circle cx="${px + 21}" cy="${y + 25}" r="13" fill="${c === 200 ? '#d9d9d9' : '#e6c35c'}" stroke="#777" stroke-width="1"/>` : ''}<text x="${px + 21}" y="${y + 30}" text-anchor="middle" font-size="${euro ? 13 : 12}" font-weight="bold" fill="#111">${label}</text>`;
    }
  });
  return { markup: s + '</svg>', breedte: BREEDTE, hoogte: H };
}
