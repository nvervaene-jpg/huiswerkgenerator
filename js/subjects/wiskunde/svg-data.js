// SVG-tekeningen voor statistiek: staafdiagram, beelddiagram, lijngrafiek, cirkeldiagram en turftabel. Zelf getekend.
// Elke functie geeft { markup, breedte, hoogte } terug (px), zoals ./svg.js.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const HEAD = (w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif" ${extra}>`;
const KLEUREN = ['#9cc3e6', '#f4b183', '#a9d18e', '#ffd966', '#c9a0dc', '#f2a6b3', '#9fd6d2', '#d0cece'];
const titelTekst = (W, titel) => `<text x="${W / 2}" y="22" text-anchor="middle" font-size="19" font-weight="bold" fill="#111">${esc(titel)}</text>`;

// Staafdiagram met een verticale as van 0 tot 'max' (stappen van 'stap'); elke staaf is een categorie.
export function staafdiagram({ titel, cats, waarden, stap, max }) {
  const n = cats.length, W = 120 + n * 74, H = 290, x0 = 62, y0 = 232, hoogte = 180, schaal = hoogte / max;
  let s = HEAD(W, H, 'font-size="17"') + titelTekst(W, titel);
  for (let v = 0; v <= max; v += stap) {
    const y = y0 - v * schaal;
    s += `<line x1="${x0}" y1="${y}" x2="${W - 14}" y2="${y}" stroke="${v === 0 ? '#111' : '#cfcfcf'}" stroke-width="${v === 0 ? 2 : 1}"/><text x="${x0 - 8}" y="${y + 6}" text-anchor="end" fill="#111">${v}</text>`;
  }
  s += `<line x1="${x0}" y1="${y0 - hoogte}" x2="${x0}" y2="${y0}" stroke="#111" stroke-width="2"/>`;
  cats.forEach((c, i) => {
    const bx = x0 + 14 + i * 74, h = waarden[i] * schaal;
    s += `<rect x="${bx}" y="${y0 - h}" width="46" height="${h}" fill="${KLEUREN[i % KLEUREN.length]}" stroke="#333" stroke-width="1.6"/><text x="${bx + 23}" y="${y0 + 22}" text-anchor="middle" font-size="15" fill="#111">${esc(c)}</text>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Beelddiagram: elk symbool (een rondje) staat voor 'k' stuks.
export function beelddiagram({ titel, cats, waarden, k }) {
  const n = cats.length, rij = 38, maxSymbolen = Math.max(...waarden) / k, W = Math.max(380, 150 + maxSymbolen * 32), H = 64 + n * rij;
  let s = HEAD(W, H, 'font-size="17"') + titelTekst(W, titel);
  cats.forEach((c, i) => {
    const y = 54 + i * rij;
    s += `<text x="12" y="${y + 6}" fill="#111">${esc(c)}</text>`;
    for (let j = 0; j < waarden[i] / k; j++) s += `<circle cx="${130 + j * 32}" cy="${y}" r="12" fill="${KLEUREN[i % KLEUREN.length]}" stroke="#333" stroke-width="1.6"/>`;
  });
  s += `<circle cx="22" cy="${H - 14}" r="9" fill="#fff" stroke="#333" stroke-width="1.6"/><text x="40" y="${H - 8}" fill="#111">= ${k}</text>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Lijngrafiek: punten (x-label, waarde) verbonden door lijnen; verticale as 0 tot 'max' in stappen van 'stap'.
export function lijngrafiek({ titel, xs, waarden, stap, max, ytitel = '' }) {
  const n = xs.length, W = 130 + n * 66, H = 300, x0 = 70, y0 = 238, hoogte = 180, schaal = hoogte / max;
  let s = HEAD(W, H, 'font-size="17"') + titelTekst(W, titel);
  for (let v = 0; v <= max; v += stap) {
    const y = y0 - v * schaal;
    s += `<line x1="${x0}" y1="${y}" x2="${W - 14}" y2="${y}" stroke="${v === 0 ? '#111' : '#cfcfcf'}" stroke-width="${v === 0 ? 2 : 1}"/><text x="${x0 - 8}" y="${y + 6}" text-anchor="end" fill="#111">${v}</text>`;
  }
  s += `<line x1="${x0}" y1="${y0 - hoogte}" x2="${x0}" y2="${y0}" stroke="#111" stroke-width="2"/>`;
  if (ytitel) s += `<text x="${x0}" y="${y0 - hoogte - 8}" text-anchor="middle" font-size="14" fill="#111">${esc(ytitel)}</text>`;
  const pt = xs.map((_, i) => [x0 + 34 + i * 66, y0 - waarden[i] * schaal]);
  s += `<polyline points="${pt.map(p => p.join(',')).join(' ')}" fill="none" stroke="#2e75b6" stroke-width="3"/>`;
  pt.forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="5" fill="#2e75b6"/><text x="${x}" y="${y0 + 22}" text-anchor="middle" font-size="15" fill="#111">${esc(xs[i])}</text>`; });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

const punt = (cx, cy, r, hoek) => [cx + r * Math.sin(hoek), cy - r * Math.cos(hoek)];
// Cirkeldiagram: 'procenten' tellen op tot 100; we beginnen bovenaan en gaan met de klok mee. Bij elke sector staat de categorie en het percentage.
export function cirkeldiagram({ titel, cats, procenten, toonProcent = true, markeer = -1, kleuren = KLEUREN }) {
  const W = 460, H = 330, cx = W / 2, cy = 180, r = 105;
  let s = HEAD(W, H, 'font-size="16"') + titelTekst(W, titel), start = 0;
  procenten.forEach((p, i) => {
    const a0 = (start / 100) * 2 * Math.PI, a1 = ((start + p) / 100) * 2 * Math.PI;
    const [x0, y0] = punt(cx, cy, r, a0), [x1, y1] = punt(cx, cy, r, a1);
    s += p === 100
      ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${kleuren[i]}" stroke="#333" stroke-width="2"/>`
      : `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${p > 50 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${markeer === i ? '#f8cbad' : kleuren[i % kleuren.length]}" stroke="#333" stroke-width="2"/>`;
    const mid = ((start + p / 2) / 100) * 2 * Math.PI, [tx, ty] = punt(cx, cy, r + 30, mid);
    s += `<text x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}" text-anchor="middle" fill="#111">${esc(cats[i])}${toonProcent ? ` ${p} %` : ''}</text>`;
    start += p;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Turftabel: per categorie turfstreepjes in groepjes van vijf (vier streepjes en een schuine streep).
export function turftabel({ titel, cats, waarden }) {
  const rij = 40, W = 420, H = 56 + cats.length * rij;
  let s = HEAD(W, H, 'font-size="17"') + titelTekst(W, titel);
  cats.forEach((c, i) => {
    const y = 40 + i * rij;
    s += `<rect x="2" y="${y}" width="${W - 4}" height="${rij}" fill="#fff" stroke="#333" stroke-width="1.6"/><line x1="130" y1="${y}" x2="130" y2="${y + rij}" stroke="#333" stroke-width="1.6"/><text x="12" y="${y + 26}" fill="#111">${esc(c)}</text>`;
    let x = 146;
    for (let rest = waarden[i]; rest > 0; rest -= 5) {
      const k = Math.min(5, rest);
      for (let j = 0; j < Math.min(k, 4); j++) s += `<line x1="${x + j * 8}" y1="${y + 8}" x2="${x + j * 8}" y2="${y + rij - 8}" stroke="#111" stroke-width="2.4"/>`;
      if (k === 5) s += `<line x1="${x - 5}" y1="${y + rij - 11}" x2="${x + 29}" y2="${y + 11}" stroke="#111" stroke-width="2.4"/>`;
      x += 46;
    }
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
