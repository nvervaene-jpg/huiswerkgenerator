// Tekeningen voor meten: thermometer, digitale klok en prijskaartje. De waarden staan als data-attributen zodat een test de tekening kan nalezen.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif">`;
const MIN = '−';

// Thermometer met een schaal van min tot max in stappen van 1 °C (streepje elke °C, getal elke 'label' graden); de kwik staat op 'waarde'.
export function thermometer({ waarde, min, max, label = 5 }) {
  const CEL = 9, T = 24, hoogte = (max - min) * CEL, W = 130, H = hoogte + T * 2 + 40, x0 = 58, y0 = T + hoogte;     // y0 = positie van min
  const y = (v) => y0 - (v - min) * CEL;
  let s = HEAD(W, H) + `<g data-waarde="${waarde}">`;
  s += `<rect x="${x0 - 7}" y="${T - 8}" width="14" height="${hoogte + 16}" rx="7" fill="#fff" stroke="#222" stroke-width="2.4"/><circle cx="${x0}" cy="${y0 + 20}" r="14" fill="#c0392b" stroke="#222" stroke-width="2.4"/>`;
  s += `<rect x="${x0 - 4}" y="${y(waarde)}" width="8" height="${y0 + 14 - y(waarde)}" fill="#c0392b"/>`;
  for (let v = min; v <= max; v++) {
    const groot = v % label === 0, lang = groot ? 18 : 9;
    s += `<line x1="${x0 + 9}" y1="${y(v)}" x2="${x0 + 9 + lang}" y2="${y(v)}" stroke="#222" stroke-width="${groot ? 1.8 : 1}"/>`;
    if (groot) s += `<text x="${x0 + 32}" y="${y(v) + 5}" font-size="14" fill="#111">${v < 0 ? MIN + -v : v}</text>`;
  }
  s += `</g><text x="${x0 - 30}" y="14" font-size="14" font-weight="bold" fill="#111">°C</text>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

export function digitaleKlok(h, m) {
  const tijd = `${h}:${String(m).padStart(2, '0')}`;
  return { markup: `${HEAD(150, 74)}<g data-tijd="${tijd}"><rect x="3" y="3" width="144" height="68" rx="10" fill="#1d2b36" stroke="#111" stroke-width="3"/><text x="75" y="52" text-anchor="middle" font-family="Courier New, monospace" font-size="44" font-weight="bold" fill="#8ff0a4">${tijd}</text></g></svg>`, breedte: 150, hoogte: 74 };
}

export function prijskaartje(euro, wat = '') {
  return { markup: `${HEAD(150, 80)}<g data-prijs="${euro}"><path d="M10,10 H120 L142,40 L120,70 H10 Z" fill="#fff3cd" stroke="#222" stroke-width="2.6"/><circle cx="124" cy="40" r="5" fill="#fff" stroke="#222" stroke-width="2"/><text x="60" y="48" text-anchor="middle" font-size="28" font-weight="bold" fill="#111">€ ${euro}</text>${wat ? `<text x="60" y="26" text-anchor="middle" font-size="12" fill="#444">${wat}</text>` : ''}</g></svg>`, breedte: 150, hoogte: 80 };
}

/* ------------------------------------------------------------------ rooster- en kubustekeningen */
const KLEUR_FIG = { A: '#bbdefb', B: '#ffe0b2', C: '#c8e6c9' };
// Figuren van vierkantjes van 1 cm bij 1 cm naast elkaar; elk vierkantje is een <rect data-cel="x,y"> binnen <g data-fig="id">, zodat een test ze kan natellen.
export function celFiguren(figuren, { label = false, cel = 26 } = {}) {
  const breedtes = figuren.map(f => Math.max(...f.cellen.map(c => c[0])) + 1), hoogte = Math.max(...figuren.flatMap(f => f.cellen.map(c => c[1] + 1)));
  const W = breedtes.reduce((a, b) => a + b, 0) * cel + (figuren.length + 1) * 18, H = hoogte * cel + 40;
  let s = HEAD(W, H), x0 = 18;
  figuren.forEach((f, i) => {
    s += `<g data-fig="${f.id}">`;
    for (const [x, y] of f.cellen) s += `<rect data-cel="${x},${y}" x="${x0 + x * cel}" y="${26 + y * cel}" width="${cel}" height="${cel}" fill="${KLEUR_FIG[f.id] || '#bbdefb'}" stroke="#1f3b57" stroke-width="1.4"/>`;
    s += `</g>`;
    if (label) s += `<text x="${x0 + (breedtes[i] * cel) / 2}" y="18" text-anchor="middle" font-size="16" font-weight="bold" fill="#111">${f.id}</text>`;
    x0 += breedtes[i] * cel + 18;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Balk van l x b x h kubusjes in schuin zicht (voorvlak, bovenvlak, zijvlak); elk zichtbaar vierkantje is een <polygon data-vlak="v|t|z">.
export function kubusBlok({ l, b, h }, S = 30) {
  const d = S * 0.5, W = l * S + b * d + 12, H = h * S + b * d + 12, ox = 6, oy = 6 + b * d;
  const poly = (pts, vlak, kleur) => `<polygon data-vlak="${vlak}" points="${pts.map(p => p.map(v => Math.round(v * 10) / 10).join(',')).join(' ')}" fill="${kleur}" stroke="#1f3b57" stroke-width="1.3"/>`;
  let s = HEAD(W, H);
  for (let i = 0; i < l; i++) for (let j = 0; j < h; j++) s += poly([[ox + i * S, oy + j * S], [ox + (i + 1) * S, oy + j * S], [ox + (i + 1) * S, oy + (j + 1) * S], [ox + i * S, oy + (j + 1) * S]], 'v', '#dbeafe');
  for (let i = 0; i < l; i++) for (let k = 0; k < b; k++) { const x = ox + i * S + k * d, y = oy - k * d; s += poly([[x, y], [x + S, y], [x + S + d, y - d], [x + d, y - d]], 't', '#bfdbfe'); }
  for (let k = 0; k < b; k++) for (let j = 0; j < h; j++) { const x = ox + l * S + k * d, y = oy + j * S - k * d; s += poly([[x, y], [x + d, y - d], [x + d, y - d + S], [x, y + S]], 'z', '#93c5fd'); }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
