// Tekeningen voor de laatste meetkundefamilies: een pijl op een bord, een plattegrond met vakken en een gebroken lijn met lengtes.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="'Century Gothic', 'Didact Gothic', Arial, sans-serif">`;
export const HOEK = { rechts: 0, rechtsonder: 45, omlaag: 90, linksonder: 135, links: 180, linksboven: 225, omhoog: 270, rechtsboven: 315 };

// Een blauw bord met een witte pijl. data-richting laat de tests nalezen welke richting getekend is.
export function pijlBord(richting) {
  const W = 140, H = 140;
  return { markup: `${HEAD(W, H)}<g data-richting="${richting}"><rect x="8" y="8" width="124" height="124" rx="18" fill="#2a6ebb" stroke="#123" stroke-width="3"/><g transform="rotate(${HOEK[richting]} 70 70)"><path d="M28 58 H72 V36 L112 70 L72 104 V82 H28 Z" fill="#fff"/></g></g></svg>`, breedte: W, hoogte: H };
}

// Plattegrond: kolommen A tot en met E, rijen 1 tot en met 4. 'items' = [{ naam, vak: 'C3' }].
export function plattegrond(items) {
  const CW = 96, CH = 58, L = 30, T = 28, W = L + 5 * CW + 6, H = T + 4 * CH + 6;
  let s = HEAD(W, H);
  'ABCDE'.split('').forEach((c, i) => { s += `<text x="${L + i * CW + CW / 2}" y="20" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">${c}</text>`; });
  for (let r = 0; r < 4; r++) {
    s += `<text x="12" y="${T + r * CH + CH / 2 + 6}" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">${r + 1}</text>`;
    for (let c = 0; c < 5; c++) s += `<rect x="${L + c * CW}" y="${T + r * CH}" width="${CW}" height="${CH}" fill="#fff" stroke="#555" stroke-width="1.8"/>`;
  }
  for (const { naam, vak } of items) {
    const c = 'ABCDE'.indexOf(vak[0]), r = Number(vak[1]) - 1;
    s += `<rect x="${L + c * CW + 5}" y="${T + r * CH + 5}" width="${CW - 10}" height="${CH - 10}" rx="8" fill="#ffe9b0" stroke="#a67c00" stroke-width="1.6"/><text data-vak="${vak}" x="${L + c * CW + CW / 2}" y="${T + r * CH + CH / 2 + 6}" text-anchor="middle" font-size="16" fill="#111">${naam}</text>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Gebroken lijn met de lengte van elk stuk erbij (niet op schaal getekend).
export function gebrokenLijn(lengtes) {
  const W = 420, H = 190, punten = [[20, 150]];
  lengtes.forEach((_, i) => { const [x, y] = punten[i]; punten.push([x + 80 + (i % 2) * 20, i % 2 === 0 ? y - 90 + i * 10 : y + 80 - i * 10]); });
  let s = HEAD(W, H) + `<polyline points="${punten.map(p => p.join(',')).join(' ')}" fill="none" stroke="#222" stroke-width="3.2" stroke-linejoin="round"/>`;
  punten.forEach((p) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#222"/>`; });
  lengtes.forEach((l, i) => { const a = punten[i], b = punten[i + 1]; s += `<text data-stuk="${l}" x="${(a[0] + b[0]) / 2 + 8}" y="${(a[1] + b[1]) / 2 - 6}" font-size="16" fill="#c0392b">${l} cm</text>`; });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Grondplan van een bouwsel: een rooster waarin in elk vakje staat uit hoeveel blokjes de toren bestaat (0 = leeg). De onderkant van het rooster is de voorkant.
// Elk vakje heeft data-kolom, data-rij en data-h zodat de tests nalezen wat er getekend is.
export function grondplanBlokken(hoogtes) {
  const R = hoogtes.length, C = hoogtes[0].length, CS = 56, L = 14, T = 12, W = L * 2 + C * CS, H = T + R * CS + 34;
  let s = HEAD(W, H);
  hoogtes.forEach((rij, ri) => rij.forEach((h, ci) => {
    s += `<g data-kolom="${ci}" data-rij="${ri}" data-h="${h}"><rect x="${L + ci * CS}" y="${T + ri * CS}" width="${CS}" height="${CS}" fill="${h ? '#f4d58d' : '#fff'}" stroke="#444" stroke-width="2"/>${h ? `<text x="${L + ci * CS + CS / 2}" y="${T + ri * CS + CS / 2 + 9}" text-anchor="middle" font-size="26" font-weight="bold" fill="#111">${h}</text>` : ''}</g>`;
  }));
  s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="16" fill="#555">▲ voorkant</text>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Een vlakke figuur die in gelijke delen is opgedeeld. Elk deel is een element met data-deel="vierkantje" of "driehoek", zodat de tests ze kunnen tellen.
export function opgedeeld(soort, { rijen = 1, k = 1, f = 'vierkant' } = {}) {
  const CS = 34;
  if (soort === 'diagonaal') {
    const w = f === 'vierkant' ? 130 : 180, h = 120;
    const a = `${20},${12} ${20 + w},${12} ${20},${12 + h}`, b = `${20 + w},${12} ${20 + w},${12 + h} ${20},${12 + h}`;
    return { markup: `${HEAD(w + 40, h + 24)}<polygon data-deel="driehoek" points="${a}" fill="#dbeaf7" stroke="#223" stroke-width="2.5"/><polygon data-deel="driehoek" points="${b}" fill="#f7e7c4" stroke="#223" stroke-width="2.5"/></svg>`, breedte: w + 40, hoogte: h + 24 };
  }
  const R = soort === 'kruis' ? 2 : rijen, C = soort === 'kruis' ? 2 : k, W = C * CS + 24, H = R * CS + 24;
  let s = HEAD(W, H);
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) s += `<rect data-deel="vierkantje" x="${12 + c * CS}" y="${12 + r * CS}" width="${CS}" height="${CS}" fill="${(r + c) % 2 ? '#f7e7c4' : '#dbeaf7'}" stroke="#223" stroke-width="2"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
