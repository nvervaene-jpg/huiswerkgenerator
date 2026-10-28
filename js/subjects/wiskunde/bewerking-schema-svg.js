// Schematische voorstellingen bij bewerkingen met breuken: balken, rasters en groepjes. Elk gekleurd deel heeft data-k (waarvoor het staat),
// zodat de tests kunnen nalezen wat er getekend is.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="'Century Gothic', 'Didact Gothic', Arial, sans-serif" font-size="15">`;
const LIJN = '#222', BLAUW = '#8fb8e8', ORANJE = '#f2b36b', GRIJS = '#c9c9c9', LICHT = '#fff';
const rond = (x) => Math.round(x * 100) / 100;
const KLEUR = { a: BLAUW, b: ORANJE, rest: BLAUW, weg: GRIJS, 0: LICHT };

// Een balk in n gelijke delen; deel i krijgt kleur-sleutel k(i) ('a', 'b', 'rest', 'weg' of 0) en groep g(i) (voor ÷). Heel gelijk: hele (breedte per geheel) voor dikke lijnen.
function balk({ x, y, w, h, n, k = () => 0, g = null, hele = 0, bal }) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const kk = k(i), kleur = g && kk ? ['#8fb8e8', '#f2b36b', '#9fd49f', '#e7a0c4', '#c3b0e6', '#e8d77a'][g(i) % 6] : KLEUR[kk];
    s += `<rect data-bal="${bal}" data-k="${kk}"${g && kk ? ` data-groep="${g(i)}"` : ''} x="${rond(x + (i * w) / n)}" y="${y}" width="${rond(w / n)}" height="${h}" fill="${kleur}" stroke="${LIJN}" stroke-width="1.6"/>`;
    if (kk === 'weg') s += `<line x1="${rond(x + (i * w) / n + 3)}" y1="${y + 3}" x2="${rond(x + ((i + 1) * w) / n - 3)}" y2="${y + h - 3}" stroke="${LIJN}" stroke-width="1.6"/><line x1="${rond(x + ((i + 1) * w) / n - 3)}" y1="${y + 3}" x2="${rond(x + (i * w) / n + 3)}" y2="${y + h - 3}" stroke="${LIJN}" stroke-width="1.6"/>`;
  }
  for (let j = 0; j <= hele; j++) s += `<line x1="${rond(x + (j * w) / (hele || 1))}" y1="${y - 4}" x2="${rond(x + (j * w) / (hele || 1))}" y2="${y + h + 4}" stroke="${LIJN}" stroke-width="3.6"/>`;
  return s;
}
const naam = (x, y, tekst) => `<text x="${x}" y="${y}" fill="#111">${tekst}</text>`;

// Optellen of aftrekken: balk 1 (a/n1), balk 2 (b/n2) en de uitkomst in N = kgv(n1, n2) delen.
export function plusMinSchema({ soort, a, n1, b, n2 }) {
  const W = 640, H = 210, bx = 100, bw = 520, h = 34, N = kgvNoemer(n1, n2), A = a * (N / n1), B = b * (N / n2);
  let s = HEAD(W, H);
  s += naam(4, 34, '1e breuk') + balk({ x: bx, y: 16, w: bw, h, n: n1, k: (i) => (i < a ? 'a' : 0), bal: 1 });
  s += naam(4, 94, soort === 'plus' ? '2e breuk' : 'weg') + balk({ x: bx, y: 76, w: bw, h, n: n2, k: (i) => (i < b ? (soort === 'plus' ? 'b' : 'weg') : 0), bal: 2 });
  s += naam(4, 164, soort === 'plus' ? 'samen' : 'rest') + balk({ x: bx, y: 146, w: bw, h, n: N, k: (i) => (soort === 'plus' ? (i < A ? 'a' : i < A + B ? 'b' : 0) : (i < A - B ? 'rest' : i < A ? 'weg' : 0)), bal: 3 });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
export const kgvNoemer = (x, y) => { const g = (p, q) => (q ? g(q, p % q) : p); return (x / g(x, y)) * y; };

// m × t/n: m gelijke balken, elk in n delen met t gekleurd.
export function natuurlijkMaalBreukSchema({ m, t, n }) {
  const W = 640, h = 30, gap = 14, H = m * (h + gap) + 8;
  let s = HEAD(W, H);
  for (let i = 0; i < m; i++) s += balk({ x: 20, y: 6 + i * (h + gap), w: 600, h, n, k: (j) => (j < t ? 'a' : 0), bal: i + 1 });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// t/n × m: één balk van m hele (dikke lijnen), verdeeld in n gelijke delen waarvan er t gekleurd zijn.
export function breukMaalNatuurlijkSchema({ t, n, m }) {
  const W = 640, H = 80;
  let s = HEAD(W, H);
  s += balk({ x: 20, y: 22, w: 600, h: 36, n, k: (j) => (j < t ? 'a' : 0), hele: m, bal: 1 });
  s += `<text x="20" y="16" fill="#111">de balk is ${m} hele</text>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// a/n1 × b/n2: een rechthoek met n1 kolommen en n2 rijen. Kolommen 1..a zijn blauw, rijen 1..b oranje, de overlap donker.
export function breukMaalBreukSchema({ a, n1, b, n2 }) {
  const W = 300, H = 230, cw = 260 / n1, ch = 200 / n2;
  let s = HEAD(W, H);
  for (let c = 0; c < n1; c++) for (let r = 0; r < n2; r++) {
    const kolom = c < a, rij = r < b, k = kolom && rij ? 'beide' : kolom ? 'a' : rij ? 'b' : 0, kleur = k === 'beide' ? '#6c8f6c' : k === 'a' ? BLAUW : k === 'b' ? ORANJE : LICHT;
    s += `<rect data-k="${k}" x="${rond(20 + c * cw)}" y="${rond(14 + r * ch)}" width="${rond(cw)}" height="${rond(ch)}" fill="${kleur}" stroke="${LIJN}" stroke-width="1.6"/>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Groepjes: n delen waarvan er t gekleurd zijn, in groepen van 'groep' delen (verschillende kleur per groep). 'hele' laat de balk uit meerdere hele bestaan.
export function groepenSchema({ n, t, groep, hele = 0 }) {
  const W = 640, H = 60;
  return { markup: `${HEAD(W, H)}${balk({ x: 20, y: 12, w: 600, h: 36, n, k: (j) => (j < t ? 'a' : 0), g: (j) => Math.floor(j / groep), hele, bal: 1 })}</svg>`, breedte: W, hoogte: H };
}
