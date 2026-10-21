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
