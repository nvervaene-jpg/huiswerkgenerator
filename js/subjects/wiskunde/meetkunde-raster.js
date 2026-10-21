// Tekeningen op ruitjespapier: figuren van vierkantjes die verschoven, gedraaid, gespiegeld of vergroot worden, met een spiegelas.
// De vierkantjes zijn <rect data-fig="A" data-x data-y>; een spiegelas is een <line data-as="v:4"> (verticaal op x = 4) of "h:3". Zo kan een test de tekening opnieuw opmeten.
const CEL = 28;
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif">`;
const KLEUREN = { A: '#9cc3e6', B: '#f4b6b6', C: '#a9d18e', D: '#ffd966' };

export const sleutelCel = ([x, y]) => `${x},${y}`;
export const zelfdeCellen = (p, q) => p.length === q.length && p.every(c => q.some(d => d[0] === c[0] && d[1] === c[1]));
export const normaliseer = (cellen) => { const mx = Math.min(...cellen.map(c => c[0])), my = Math.min(...cellen.map(c => c[1])); return cellen.map(([x, y]) => [x - mx, y - my]).sort((p, q) => p[1] - q[1] || p[0] - q[0]); };

// Transformaties van vierkantjes (x naar rechts, y naar beneden; een cel beslaat [x, x+1] x [y, y+1])
export const verschuif = (cellen, dx, dy) => cellen.map(([x, y]) => [x + dx, y + dy]);
export const spiegelV = (cellen, a) => cellen.map(([x, y]) => [2 * a - x - 1, y]);           // spiegelas: de rooster-lijn x = a
export const spiegelH = (cellen, b) => cellen.map(([x, y]) => [x, 2 * b - y - 1]);           // spiegelas: de rooster-lijn y = b
// draaiing met de klok om het roosterpunt (cx, cy); kwarten = 1, 2 of 3 (90°, 180°, 270°)
export function draai(cellen, cx, cy, kwarten) {
  return cellen.map(([x, y]) => {
    let dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    for (let i = 0; i < kwarten; i++) [dx, dy] = [-dy, dx];
    return [cx + dx - 0.5, cy + dy - 0.5];
  });
}
export const vergroot = (cellen, f) => cellen.flatMap(([x, y]) => Array.from({ length: f * f }, (_, i) => [x * f + (i % f), y * f + Math.floor(i / f)]));

// Heeft de figuur een spiegelsymmetrie of draaisymmetrie? (dan is hij niet geschikt om een transformatie aan te herkennen)
export function isAsymmetrisch(cellen) {
  const n = normaliseer(cellen), gelijk = (c) => zelfdeCellen(n, normaliseer(c));
  const varianten = [spiegelV(cellen, 0), spiegelH(cellen, 0), draai(cellen, 0, 0, 1), draai(cellen, 0, 0, 2), draai(cellen, 0, 0, 3)];
  const diagonaal = cellen.map(([x, y]) => [y, x]), antidiagonaal = cellen.map(([x, y]) => [-y - 1, -x - 1]);
  return !varianten.some(gelijk) && !gelijk(diagonaal) && !gelijk(antidiagonaal);
}
// Een willekeurige samenhangende figuur van 4 tot 6 vierkantjes in een vak van hoogstens 3 x 3 zonder symmetrie.
export function maakFiguur(r, aantal = 5) {
  for (let t = 0; t < 400; t++) {
    const cellen = [[1, 1]];
    while (cellen.length < aantal) {
      const [x, y] = cellen[r.geheel(0, cellen.length - 1)], [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][r.geheel(0, 3)], nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx > 2 || ny > 2 || cellen.some(c => c[0] === nx && c[1] === ny)) continue;
      cellen.push([nx, ny]);
    }
    const n = normaliseer(cellen);
    if (Math.max(...n.map(c => c[0])) >= 1 && Math.max(...n.map(c => c[1])) >= 1 && isAsymmetrisch(n)) return n;
  }
  return null;
}

// figuren: [{ id: 'A', cellen, kleur? }]; as: { soort: 'v'|'h', pos }; raster: { b, h } in vierkantjes
export function rasterTekening({ b, h, figuren, as = null, punt = null, labels = true }) {
  const W = b * CEL + 2, H = h * CEL + 2;
  let s = HEAD(W, H) + `<rect x="1" y="1" width="${b * CEL}" height="${h * CEL}" fill="#fff" stroke="#b8c4cf" stroke-width="1"/>`;
  for (let i = 1; i < b; i++) s += `<line x1="${1 + i * CEL}" y1="1" x2="${1 + i * CEL}" y2="${1 + h * CEL}" stroke="#d3dae0" stroke-width="1"/>`;
  for (let j = 1; j < h; j++) s += `<line x1="1" y1="${1 + j * CEL}" x2="${1 + b * CEL}" y2="${1 + j * CEL}" stroke="#d3dae0" stroke-width="1"/>`;
  for (const f of figuren) {
    for (const [x, y] of f.cellen) s += `<rect data-fig="${f.id}" data-x="${x}" data-y="${y}" x="${1 + x * CEL}" y="${1 + y * CEL}" width="${CEL}" height="${CEL}" fill="${f.kleur || KLEUREN[f.id] || '#ccc'}" stroke="#333" stroke-width="1.6"/>`;
    if (labels && f.label !== false) { const mx = Math.min(...f.cellen.map(c => c[0])), my = Math.min(...f.cellen.map(c => c[1])); s += `<text x="${1 + mx * CEL + 4}" y="${1 + my * CEL - 4}" font-size="15" font-weight="bold" fill="#111">${f.id}</text>`; }
  }
  if (as) {
    const [x1, y1, x2, y2] = as.soort === 'v' ? [1 + as.pos * CEL, -0, 1 + as.pos * CEL, H] : [0, 1 + as.pos * CEL, W, 1 + as.pos * CEL];
    s += `<line data-as="${as.soort}:${as.pos}" x1="${x1}" y1="${Math.max(0, y1)}" x2="${x2}" y2="${y2}" stroke="#c0392b" stroke-width="2.6" stroke-dasharray="7 5"/>`;
  }
  if (punt) s += `<circle data-punt="${punt.x},${punt.y}" cx="${1 + punt.x * CEL}" cy="${1 + punt.y * CEL}" r="5.5" fill="#c0392b"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
export const RASTER_KLEUR = KLEUREN;
