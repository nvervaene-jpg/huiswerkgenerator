// SVG-tekeningen voor werkbladen: getallenas, MAB-materiaal en meetlat.
// Elke functie geeft { markup, breedte, hoogte } terug (px); de tekeningen zijn zelf getekend.
const HEAD = (w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif" ${extra}>`;

// Getallenas met 'ticks' streepjes. Opties: ontbreekt = indexen met een leeg vakje, pijlen = indexen met een pijl erboven,
// letters = { index: 'A' } (de letter staat boven het streepje en het getal is verborgen), verborgen = indexen zonder getal.
export function getallenas({ start, stap, ontbreekt = [], ticks = 11, pijlen = [], letters = {}, verborgen = [] }) {
  const W = 640, H = 96, x0 = 34, x1 = 606, dx = (x1 - x0) / (ticks - 1), y = 42;
  let s = HEAD(W, H, 'font-size="19"');
  s += `<line x1="8" y1="${y}" x2="630" y2="${y}" stroke="#222" stroke-width="2.5"/><path d="M632 ${y} l-11 -6 v12 z" fill="#222"/>`;
  for (let i = 0; i < ticks; i++) {
    const x = (x0 + i * dx).toFixed(1);
    s += `<line x1="${x}" y1="${y - 10}" x2="${x}" y2="${y + 10}" stroke="#222" stroke-width="2.5"/>`;
    if (ontbreekt.includes(i)) s += `<rect x="${(x0 + i * dx - 27).toFixed(1)}" y="${y + 16}" width="54" height="30" rx="4" fill="#fff" stroke="#222" stroke-width="1.8" stroke-dasharray="5 3"/>`;
    else if (!verborgen.includes(i) && letters[i] === undefined) s += `<text x="${x}" y="${y + 38}" text-anchor="middle" fill="#111">${start + i * stap}</text>`;
    if (letters[i] !== undefined) s += `<text x="${x}" y="${y - 18}" text-anchor="middle" font-weight="bold" fill="#c0392b" font-size="24">${letters[i]}</text>`;
    if (pijlen.includes(i)) s += `<line x1="${x}" y1="6" x2="${x}" y2="${y - 12}" stroke="#c0392b" stroke-width="3"/><path d="M ${x} ${y - 11} l -7 -12 h 14 z" fill="#c0392b"/>`;
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

// Pijlpunt op (x, y) die de richting (dx, dy) volgt.
function pijlpunt(x, y, dx, dy, kleur, lengte = 13, breedte = 6.5) {
  const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  return `<path d="M ${rond(x)} ${rond(y)} L ${rond(x - lengte * ux + breedte * nx)} ${rond(y - lengte * uy + breedte * ny)} L ${rond(x - lengte * ux - breedte * nx)} ${rond(y - lengte * uy - breedte * ny)} z" fill="${kleur}"/>`;
}

// Wijzerweegschaal van 0 tot 'max' kg; de wijzer staat op 'waarde' kg (null = geen wijzer, om zelf te tekenen). Streepjes: elke 0,5 kg (max 10) of elke 100 g (max 5).
export function weegschaal({ waarde, max }) {
  const W = 300, H = 198, cx = 150, cy = 98, R = 82;
  const hoek = (v) => -135 + (270 * v) / max;
  const punt = (deg, rad) => [rond(cx + rad * Math.sin((deg * Math.PI) / 180)), rond(cy - rad * Math.cos((deg * Math.PI) / 180))];
  let s = HEAD(W, H, 'font-size="15"');
  s += `<rect x="28" y="6" width="244" height="186" rx="20" fill="#e8eef5" stroke="#333" stroke-width="2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="#333" stroke-width="2.5"/>`;
  if (waarde !== null) s += `<g transform="rotate(${rond(hoek(waarde))} ${cx} ${cy})"><line x1="${cx}" y1="${cy + 8}" x2="${cx}" y2="${cy - (R - 16)}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>`;
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

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Lege meetlat met een strook om te kleuren (leeg) en dezelfde meetlat met de balk ingekleurd (oplossing).
export function meetlatKleur({ lengte, van = 0, tot }) {
  const vol = meetlat({ lengte, van, tot }).markup;
  const W = 640, l = 22, r = W - 22, dx = (r - l) / lengte;
  const strook = `<rect x="${l}" y="10" width="${r - l}" height="28" fill="#fff" stroke="#333" stroke-width="1.8" stroke-dasharray="6 4"/>`;
  const leeg = vol.replace(/<rect x="[\d.]+" y="10"[^>]*\/>/, strook).replace(/<line [^>]*stroke-dasharray="3 3"\/>/g, '');
  return { leeg: { markup: leeg, breedte: W, hoogte: 128 }, oplossing: { markup: vol, breedte: W, hoogte: 128 }, dx };
}

// Twee kolommen om te verbinden. 'paren' = [[linksIndex, rechtsIndex], ...]; met 'oplossing' worden de lijnen getekend.
export function verbinden(links, rechts, paren, oplossing = false) {
  const RIJ = 46, W = 560, H = links.length * RIJ + 14;
  let s = HEAD(W, H, 'font-size="21"');
  const y = (i) => 8 + i * RIJ + RIJ / 2;
  links.forEach((t, i) => { s += `<text x="20" y="${y(i) + 7}" fill="#111">${esc(t)}</text><circle cx="190" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/>`; });
  rechts.forEach((t, i) => { s += `<circle cx="370" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/><text x="388" y="${y(i) + 7}" fill="#111">${esc(t)}</text>`; });
  if (oplossing) for (const [a, b] of paren) s += `<line x1="196" y1="${y(a)}" x2="364" y2="${y(b)}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Tabel met kolomkoppen en rijen; 'rijen' bevat per rij een waarde per kolom of null (leeg).
// Met 'oplossing' tonen we de ingevulde waarden in rood (daarvoor geef je in 'antwoorden' de juiste waarden mee).
export function tabel(kolommen, rijen, antwoorden = null) {
  const CW = 110, CH = 42, W = kolommen.length * CW + 4, H = (rijen.length + 1) * CH + 4;
  let s = HEAD(W, H, 'font-size="21"');
  kolommen.forEach((k, c) => { s += `<rect x="${2 + c * CW}" y="2" width="${CW}" height="${CH}" fill="#dfeaf5" stroke="#333" stroke-width="1.8"/><text x="${2 + c * CW + CW / 2}" y="${2 + CH / 2 + 7}" text-anchor="middle" font-weight="bold" fill="#111">${esc(k)}</text>`; });
  rijen.forEach((rij, r) => rij.forEach((v, c) => {
    const x = 2 + c * CW, y = 2 + (r + 1) * CH;
    s += `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" fill="#fff" stroke="#333" stroke-width="1.8"/>`;
    if (v !== null) s += `<text x="${x + CW / 2}" y="${y + CH / 2 + 7}" text-anchor="middle" fill="#111">${esc(v)}</text>`;
    else if (antwoorden) s += `<text x="${x + CW / 2}" y="${y + CH / 2 + 7}" text-anchor="middle" fill="#c0392b" font-weight="bold">${esc(antwoorden[r][c])}</text>`;
  }));
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Een bolletje waar de leerling een lijn van 'cm' centimeter moet tekenen. 1 cm = 37,8 px, zodat de oplossing op ware grootte staat.
export const PX_PER_CM = 96 / 2.54;
export function lijnTekenen({ cm, oplossing = false }) {
  const W = 620, H = 64, x0 = 26;
  let s = HEAD(W, H, 'font-size="16"');
  s += `<circle cx="${x0}" cy="30" r="6" fill="#222"/>`;
  if (oplossing) {
    const x1 = rond(x0 + cm * PX_PER_CM);
    s += `<line x1="${x0}" y1="30" x2="${x1}" y2="30" stroke="#c0392b" stroke-width="3"/><line x1="${x1}" y1="21" x2="${x1}" y2="39" stroke="#c0392b" stroke-width="3"/><text x="${rond((x0 + x1) / 2)}" y="58" text-anchor="middle" fill="#c0392b">${cm} cm</text>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Sprongen op een getallenlijn. 'punten' = de getallen in de volgorde van de sprongen (bv. [27, 30, 35]);
// 'leeg' = indexen van punten die als leeg vakje getekend worden. Sprong-labels: +3 of -3.
export function sprongen({ punten, leeg = [] }) {
  const W = 640, H = 138, x0 = 60, x1 = 580, y = 84;
  const min = Math.min(...punten), max = Math.max(...punten);
  const X = (v) => (max === min ? (x0 + x1) / 2 : x0 + ((v - min) / (max - min)) * (x1 - x0));
  let s = HEAD(W, H, 'font-size="20"');
  s += `<line x1="20" y1="${y}" x2="620" y2="${y}" stroke="#222" stroke-width="2.5"/>`;
  punten.forEach((p, i) => {
    const x = rond(X(p));
    s += `<line x1="${x}" y1="${y - 9}" x2="${x}" y2="${y + 9}" stroke="#222" stroke-width="2.5"/>`;
    s += leeg.includes(i)
      ? `<rect x="${rond(x - 28)}" y="${y + 14}" width="56" height="30" rx="4" fill="#fff" stroke="#222" stroke-width="1.8" stroke-dasharray="5 3"/>`
      : `<text x="${x}" y="${y + 36}" text-anchor="middle" fill="#111">${p}</text>`;
  });
  for (let i = 0; i < punten.length - 1; i++) {
    const xa = X(punten[i]), xb = X(punten[i + 1]), mx = (xa + xb) / 2, stap = punten[i + 1] - punten[i];
    s += `<path d="M ${rond(xa)} ${y - 4} Q ${rond(mx)} ${y - 62} ${rond(xb)} ${y - 4}" fill="none" stroke="#1f6fb2" stroke-width="2.5"/>`;
    s += pijlpunt(xb, y - 4, xb - mx, 58, '#1f6fb2');                       // pijlpunt aan het einde van de boog
    s += `<text x="${rond(mx)}" y="${y - 44}" text-anchor="middle" fill="#1f6fb2" font-weight="bold">${stap > 0 ? '+' : '-'}${Math.abs(stap)}</text>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Rooster van stippen: 'rijen' bij 'kolommen'.
export function rooster(rijen, kolommen) {
  const D = 30, W = kolommen * D + 20, H = rijen * D + 20;
  let s = HEAD(W, H);
  for (let r = 0; r < rijen; r++) for (let c = 0; c < kolommen; c++) s += `<circle cx="${10 + D / 2 + c * D}" cy="${10 + D / 2 + r * D}" r="9" fill="#f4b942" stroke="#333" stroke-width="1.5"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Getallenrooster 1 t.e.m. n in rijen van 'kolommen'; 'gekleurd' = getallen met een gekleurd vakje.
export function getallenrooster(n, gekleurd = [], kolommen = 10) {
  const CW = 52, CH = 38, rijen = Math.ceil(n / kolommen), W = kolommen * CW + 4, H = rijen * CH + 4;
  let s = HEAD(W, H, 'font-size="19"');
  for (let i = 1; i <= n; i++) {
    const x = 2 + ((i - 1) % kolommen) * CW, y = 2 + Math.floor((i - 1) / kolommen) * CH;
    s += `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" fill="${gekleurd.includes(i) ? '#f4b942' : '#fff'}" stroke="#333" stroke-width="1.6"/><text x="${x + CW / 2}" y="${y + CH / 2 + 7}" text-anchor="middle" fill="#111">${i}</text>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Splitshuisje: dak met het getal, twee kamers eronder. null = leeg vakje.
export function splitshuis(n, links, rechts) {
  const W = 150, H = 118;
  let s = HEAD(W, H, 'font-size="24"');
  s += `<path d="M10 46 L75 6 L140 46 Z" fill="#dfeaf5" stroke="#333" stroke-width="2.2" stroke-linejoin="round"/>`;
  s += `<rect x="10" y="46" width="65" height="62" fill="#fff" stroke="#333" stroke-width="2.2"/><rect x="75" y="46" width="65" height="62" fill="#fff" stroke="#333" stroke-width="2.2"/>`;
  s += n === null ? '' : `<text x="75" y="42" text-anchor="middle" fill="#111" font-weight="bold">${n}</text>`;
  if (links !== null) s += `<text x="42.5" y="86" text-anchor="middle" fill="#111">${links}</text>`;
  if (rechts !== null) s += `<text x="107.5" y="86" text-anchor="middle" fill="#111">${rechts}</text>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Cijferblokjes van een getal; 'gekleurd' = index van het blokje dat gekleurd is.
export function cijferBlokjes(n, gekleurd = -1) {
  const cijfers = String(n).split(''), B = 62, W = cijfers.length * B + 8, H = B + 8;
  let s = HEAD(W, H, 'font-size="34"');
  cijfers.forEach((c, i) => { s += `<rect x="${4 + i * B}" y="4" width="${B}" height="${B}" fill="${i === gekleurd ? '#f4b942' : '#fff'}" stroke="#333" stroke-width="2.2"/><text x="${4 + i * B + B / 2}" y="${4 + B / 2 + 12}" text-anchor="middle" fill="#111" font-weight="bold">${c}</text>`; });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// MAB-materiaal als groep (kleiner), voor in een grotere tekening.
function mabGroep(h, t, e, x0, y0, sc) {
  const P = 38 * sc, STAAF = 6 * sc, KUB = 6 * sc, G = 4 * sc;
  let s = '', x = x0;
  for (let i = 0; i < h; i++) { s += `<rect x="${rond(x)}" y="${rond(y0)}" width="${rond(P)}" height="${rond(P)}" fill="#bfe0f5" stroke="#1f5f8f" stroke-width="1.2"/>`; x += P + G; }
  if (h && (t || e)) x += 8 * sc;
  for (let i = 0; i < t; i++) { s += `<rect x="${rond(x)}" y="${rond(y0)}" width="${rond(STAAF)}" height="${rond(P)}" fill="#f6d27a" stroke="#9a6b00" stroke-width="1"/>`; x += STAAF + G; }
  if (t && e) x += 8 * sc;
  for (let i = 0; i < e; i++) { s += `<rect x="${rond(x)}" y="${rond(y0 + P - KUB)}" width="${rond(KUB)}" height="${rond(KUB)}" fill="#f4a3a3" stroke="#a33" stroke-width="1"/>`; x += KUB + G; }
  return s;
}

// Verbind MAB-materiaal (links) met het getal (rechts). items = [{h,t,e}], getallen = rechterkolom, paren = [[links, rechts]].
const mabBreedte = (h, t, e) => h * 42 + (h && (t || e) ? 8 : 0) + t * 10 + (t && e ? 8 : 0) + e * 10;   // breedte bij schaal 1
export function mabVerbinden(items, getallen, paren, oplossing = false) {
  const RIJ = 58, W = 620, H = items.length * RIJ + 12, y = (i) => 6 + i * RIJ + RIJ / 2;
  let s = HEAD(W, H, 'font-size="24"');
  items.forEach((m, i) => {                                                   // grote getallen worden kleiner getekend zodat ze passen
    const sc = Math.min(1, 370 / mabBreedte(m.h, m.t, m.e));
    s += mabGroep(m.h, m.t, m.e, 14, 6 + i * RIJ + 6 + (38 - 38 * sc) / 2, sc) + `<circle cx="400" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/>`;
  });
  getallen.forEach((g, i) => { s += `<circle cx="480" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/><text x="500" y="${y(i) + 8}" fill="#111">${g}</text>`; });
  if (oplossing) for (const [a, b] of paren) s += `<line x1="406" y1="${y(a)}" x2="474" y2="${y(b)}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Leeg vak om met MAB-materiaal een getal te tekenen (met uitleg), en dezelfde tekening met de oplossing.
export function mabTekenen(n) {
  const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, e = n % 10, W = 600, H = 150;
  const kop = `<text x="14" y="26" fill="#111" font-size="16">plaat = 100</text><text x="150" y="26" fill="#111" font-size="16">staaf = 10</text><text x="270" y="26" fill="#111" font-size="16">blokje = 1</text>`;
  const vak = `<rect x="10" y="40" width="${W - 20}" height="${H - 48}" rx="6" fill="#fff" stroke="#333" stroke-width="1.8" stroke-dasharray="6 4"/>`;
  const maak = (inhoud) => ({ markup: HEAD(W, H, 'font-size="16"') + kop + vak + inhoud + '</svg>', breedte: W, hoogte: H });
  return { leeg: maak(''), oplossing: maak(mabGroep(h, t, e, 24, 50, 1.0)) };
}

/* ---- klokken en tijd ---- */
const tijdTekst = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

// Een kleine klok als groep (middelpunt cx, cy en straal R), voor in een grotere tekening.
function klokGroep(h, m, cx, cy, R) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="#222" stroke-width="2.5"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180, r1 = R - 2, r2 = R - (i % 3 === 0 ? 9 : 6);
    s += `<line x1="${rond(cx + r1 * Math.sin(a))}" y1="${rond(cy - r1 * Math.cos(a))}" x2="${rond(cx + r2 * Math.sin(a))}" y2="${rond(cy - r2 * Math.cos(a))}" stroke="#222" stroke-width="${i % 3 === 0 ? 2 : 1.2}"/>`;
  }
  for (const [n, a] of [[12, 0], [3, 90], [6, 180], [9, 270]]) {
    const ar = (a * Math.PI) / 180;
    s += `<text x="${rond(cx + (R - 17) * Math.sin(ar))}" y="${rond(cy - (R - 17) * Math.cos(ar) + 5)}" text-anchor="middle" font-size="${Math.round(R / 3.6)}" font-weight="bold" fill="#111">${n}</text>`;
  }
  s += `<g transform="rotate(${rond((h % 12) * 30 + m * 0.5)} ${cx} ${cy})"><line x1="${cx}" y1="${cy + 3}" x2="${cx}" y2="${rond(cy - R * 0.5)}" stroke="#1f3b57" stroke-width="${Math.max(3, R / 12)}" stroke-linecap="round"/></g>`;
  s += `<g transform="rotate(${rond(m * 6)} ${cx} ${cy})"><line x1="${cx}" y1="${cy + 4}" x2="${cx}" y2="${rond(cy - R * 0.78)}" stroke="#c0392b" stroke-width="${Math.max(2, R / 17)}" stroke-linecap="round"/></g>`;
  return s + `<circle cx="${cx}" cy="${cy}" r="3" fill="#222"/>`;
}

// Klokken (links) verbinden met digitale tijden (rechts).
export function klokkenVerbinden(tijden, rechts, paren, oplossing = false) {
  const RIJ = 92, W = 520, H = tijden.length * RIJ + 10, y = (i) => 5 + i * RIJ + RIJ / 2;
  let s = HEAD(W, H, 'font-size="24"');
  tijden.forEach((t, i) => { s += klokGroep(t.h, t.m, 70, y(i), 40) + `<circle cx="170" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/>`; });
  rechts.forEach((t, i) => { s += `<circle cx="330" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/><text x="350" y="${y(i) + 8}" fill="#111">${tijdTekst(t.h, t.m)}</text>`; });
  if (oplossing) for (const [a, b] of paren) s += `<line x1="176" y1="${y(a)}" x2="324" y2="${y(b)}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Rij klokken met een letter erboven (A, B, C, ...).
export function klokkenRij(tijden) {
  const W = 620, H = 170, stap = W / tijden.length;
  let s = HEAD(W, H, 'font-size="22"');
  tijden.forEach((t, i) => { const cx = stap * i + stap / 2; s += `<text x="${rond(cx)}" y="24" text-anchor="middle" font-weight="bold" fill="#c0392b" font-size="26">${'ABCDEF'[i]}</text>` + klokGroep(t.h, t.m, rond(cx), 100, 58); });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Twee klokken: begin en einde.
export function tweeKlokken(begin, einde) {
  const W = 600, H = 170;
  let s = HEAD(W, H, 'font-size="22"');
  s += `<text x="150" y="22" text-anchor="middle" font-weight="bold" fill="#111">begin</text>` + klokGroep(begin.h, begin.m, 150, 98, 62);
  s += `<text x="450" y="22" text-anchor="middle" font-weight="bold" fill="#111">einde</text>` + klokGroep(einde.h, einde.m, 450, 98, 62);
  s += `<path d="M 250 98 H 345" stroke="#1f6fb2" stroke-width="3" fill="none"/><path d="M 352 98 l -14 -8 v 16 z" fill="#1f6fb2"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Tijdlijn met begin, einde en de duur. Met 'leeg' = 'einde' of 'duur' is dat deel een leeg vakje.
export function tijdlijn({ begin, einde, duur, leeg = null }) {
  const W = 640, H = 120, x0 = 110, x1 = 530, y = 74;
  let s = HEAD(W, H, 'font-size="21"');
  s += `<line x1="30" y1="${y}" x2="610" y2="${y}" stroke="#222" stroke-width="2.5"/>`;
  s += `<path d="M ${x0} ${y - 4} Q 320 ${y - 60} ${x1} ${y - 4}" fill="none" stroke="#1f6fb2" stroke-width="2.5"/>` + pijlpunt(x1, y - 4, x1 - 320, 56, '#1f6fb2');
  for (const [x, t, blanco] of [[x0, begin, false], [x1, einde, leeg === 'einde']]) {
    s += `<line x1="${x}" y1="${y - 10}" x2="${x}" y2="${y + 10}" stroke="#222" stroke-width="2.5"/>`;
    s += blanco ? `<rect x="${x - 36}" y="${y + 16}" width="72" height="30" rx="4" fill="#fff" stroke="#222" stroke-width="1.8" stroke-dasharray="5 3"/>`
      : `<text x="${x}" y="${y + 38}" text-anchor="middle" fill="#111">${t}</text>`;
  }
  s += leeg === 'duur' ? `<rect x="272" y="14" width="96" height="30" rx="4" fill="#fff" stroke="#1f6fb2" stroke-width="1.8" stroke-dasharray="5 3"/>`
    : `<text x="320" y="36" text-anchor="middle" fill="#1f6fb2" font-weight="bold">${duur}</text>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Weekstrook: zeven vakjes met de dagen; 'weg' = indexen die leeg zijn.
export function weekstrook(dagen, weg = []) {
  const CW = 90, W = 7 * CW + 4, H = 50;
  let s = HEAD(W, H, 'font-size="15"');
  dagen.forEach((d, i) => {
    const x = 2 + i * CW;
    s += `<rect x="${x}" y="4" width="${CW}" height="42" fill="${weg.includes(i) ? '#fff' : '#eef4fa'}" stroke="#333" stroke-width="1.8"/>`;
    if (!weg.includes(i)) s += `<text x="${x + CW / 2}" y="31" text-anchor="middle" fill="#111">${d}</text>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

/* ---- geld ---- */
const MUNT_STRAAL = { 200: 21, 100: 20, 50: 18, 20: 17, 10: 15, 5: 16, 2: 14, 1: 12 };
// Muntensets (links) verbinden met bedragen (rechts).
export function geldVerbinden(sets, bedragen, paren, oplossing = false) {
  const RIJ = 62, W = 640, H = sets.length * RIJ + 10, y = (i) => 5 + i * RIJ + RIJ / 2;
  let s = HEAD(W, H, 'font-size="21"');
  sets.forEach((items, i) => {
    let x = 12;
    for (const c of items) {
      if (c >= 500) { s += `<rect x="${x}" y="${y(i) - 17}" width="58" height="34" rx="3" fill="${BILJETTEN[c]}" stroke="#333" stroke-width="1.5"/><text x="${x + 29}" y="${y(i) + 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#111">€ ${c / 100}</text>`; x += 62; }
      else { const R = MUNT_STRAAL[c]; s += `<circle cx="${x + R}" cy="${y(i)}" r="${R}" fill="${MUNTEN[c]}" stroke="#555" stroke-width="1.6"/><text x="${x + R}" y="${y(i) + 4}" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">${c >= 100 ? `€${c / 100}` : `${c}c`}</text>`; x += 2 * R + 4; }
    }
    s += `<circle cx="440" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/>`;
  });
  bedragen.forEach((b, i) => { s += `<circle cx="510" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/><text x="528" y="${y(i) + 7}" fill="#111">${b}</text>`; });
  if (oplossing) for (const [a, b] of paren) s += `<line x1="446" y1="${y(a)}" x2="504" y2="${y(b)}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Leeg vak om met munten en biljetten een bedrag te leggen.
export function geldVak() {
  const W = 620, H = 96;
  return { markup: HEAD(W, H) + `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="6" fill="#fff" stroke="#333" stroke-width="1.8" stroke-dasharray="6 4"/></svg>`, breedte: W, hoogte: H };
}
