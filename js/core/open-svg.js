// Tekeningen voor open opdrachten: schrijflijnen, ruitjes, tekenkader, gezichtjes en schrijfregels met model.
// Elke functie geeft { markup, breedte, hoogte } terug (px), zoals de andere tekeningen.
const W = 620;
const HEAD = (h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" font-family="Andika, Arial, Helvetica, sans-serif" ${extra}>`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Lege lijnen om op te schrijven.
export function lijnen(aantal = 3) {
  const h = aantal * 40 + 10;
  let s = HEAD(h);
  for (let i = 1; i <= aantal; i++) s += `<line x1="4" y1="${i * 40}" x2="${W - 4}" y2="${i * 40}" stroke="#777" stroke-width="1.5"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: h };
}

// Ruitjespapier om te rekenen of te tekenen.
export function rooster(rijen = 6, cel = 26) {
  const kolommen = Math.floor((W - 8) / cel), h = rijen * cel + 8, b = kolommen * cel;
  let s = HEAD(h);
  for (let i = 0; i <= kolommen; i++) s += `<line x1="${4 + i * cel}" y1="4" x2="${4 + i * cel}" y2="${4 + rijen * cel}" stroke="#9db7d6" stroke-width="1"/>`;
  for (let j = 0; j <= rijen; j++) s += `<line x1="4" y1="${4 + j * cel}" x2="${4 + b}" y2="${4 + j * cel}" stroke="#9db7d6" stroke-width="1"/>`;
  s += `<rect x="4" y="4" width="${b}" height="${rijen * cel}" fill="none" stroke="#5f7fa6" stroke-width="2"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: h };
}

// Leeg kader om in te tekenen.
export function kader(hoogte = 170) {
  const h = hoogte + 10;
  return { markup: HEAD(h) + `<rect x="4" y="4" width="${W - 8}" height="${hoogte}" rx="10" fill="none" stroke="#555" stroke-width="2.5"/></svg>`, breedte: W, hoogte: h };
}

// Drie gezichtjes om te omcirkelen.
export function gezichtjes() {
  const mond = ['M -12 8 Q 0 20 12 8', 'M -11 12 L 11 12', 'M -12 16 Q 0 4 12 16'], labels = ['Ja, dat lukt goed', 'Een beetje', 'Nog niet'];
  let s = HEAD(104);
  [0, 1, 2].forEach(i => {
    const x = 105 + i * 205;
    s += `<g transform="translate(${x} 38)"><circle r="30" fill="#fff" stroke="#333" stroke-width="2.5"/><circle cx="-10" cy="-8" r="3" fill="#333"/><circle cx="10" cy="-8" r="3" fill="#333"/><path d="${mond[i]}" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/></g>`;
    s += `<text x="${x}" y="92" text-anchor="middle" font-size="16" fill="#111">${labels[i]}</text>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: 104 };
}

// Schrijflijnen met een voorbeeldzin (grijs) bovenaan: grondlijn, hulplijn en stippellijn.
export function schrijfregels(model, aantal = 2) {
  const RIJ = 66, h = (model ? 54 : 0) + aantal * RIJ + 8;
  let s = HEAD(h, 'font-size="26"');
  let y0 = 4;
  if (model) { s += `<text x="8" y="36" fill="#555">${esc(model)}</text>`; y0 = 54; }
  for (let i = 0; i < aantal; i++) {
    const top = y0 + i * RIJ + 8, mid = top + 18, basis = top + 44;
    s += `<line x1="4" y1="${top}" x2="${W - 4}" y2="${top}" stroke="#bbb" stroke-width="1"/>`;
    s += `<line x1="4" y1="${mid}" x2="${W - 4}" y2="${mid}" stroke="#aaa" stroke-width="1" stroke-dasharray="4 5"/>`;
    s += `<line x1="4" y1="${basis}" x2="${W - 4}" y2="${basis}" stroke="#444" stroke-width="2"/>`;
  }
  return { markup: s + '</svg>', breedte: W, hoogte: h };
}
