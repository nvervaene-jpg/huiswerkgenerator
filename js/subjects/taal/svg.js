// SVG-tekeningen voor taalwerkbladen. Elke functie geeft { markup, breedte, hoogte } terug (px).
const HEAD = (w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="'Century Gothic', 'Didact Gothic', Arial, sans-serif" ${extra}>`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Woorden verbinden: 'paren' = lijst [indexLinks, indexRechts]; met 'oplossing' staan de lijnen erop.
export function woordenVerbinden(links, rechts, paren, oplossing = false) {
  const RIJ = 46, W = 620, H = links.length * RIJ + 14;
  let s = HEAD(W, H, 'font-size="21"');
  const y = (i) => 8 + i * RIJ + RIJ / 2;
  links.forEach((t, i) => { s += `<text x="16" y="${y(i) + 7}" fill="#111">${esc(t)}</text><circle cx="222" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/>`; });
  rechts.forEach((t, i) => { s += `<circle cx="398" cy="${y(i)}" r="6" fill="#fff" stroke="#222" stroke-width="2"/><text x="416" y="${y(i) + 7}" fill="#111">${esc(t)}</text>`; });
  if (oplossing) for (const [a, b] of paren) s += `<line x1="228" y1="${y(a)}" x2="392" y2="${y(b)}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Vakjes met een woord(paar) erin. Met 'oplossing' worden de vakjes in 'kleur' (indexen) groen gekleurd.
export function woordenVakjes(teksten, kleur = [], oplossing = false) {
  const KOL = 2, CW = 300, CH = 46, W = KOL * CW + 8, rijen = Math.ceil(teksten.length / KOL), H = rijen * CH + 8;
  const lang = Math.max(...teksten.map(t => t.length));
  const maat = Math.max(15, Math.min(21, Math.floor(270 / (lang * 0.56))));
  let s = HEAD(W, H, `font-size="${maat}"`);
  teksten.forEach((t, i) => {
    const x = 4 + (i % KOL) * CW, y = 4 + Math.floor(i / KOL) * CH;
    s += `<rect x="${x + 2}" y="${y + 2}" width="${CW - 4}" height="${CH - 4}" rx="8" fill="${oplossing && kleur.includes(i) ? '#a9dfa3' : '#fff'}" stroke="#333" stroke-width="2"/>`;
    s += `<text x="${x + CW / 2}" y="${y + CH / 2 + maat * 0.35}" text-anchor="middle" fill="#111">${esc(t)}</text>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Kolommen om woorden in te sorteren: elke kolom heeft een titel en 'rijen' lege plaatsen. Met 'oplossing' staan de woorden (per kolom) erin.
export function woordenKolommen(titels, rijen, woorden = null) {
  const KOL = titels.length, CW = Math.floor(600 / KOL), RH = 40, W = KOL * CW + 20, H = 46 + rijen * RH + 8;
  let s = HEAD(W, H, 'font-size="21"');
  titels.forEach((t, i) => {
    const x = 10 + i * CW;
    s += `<rect x="${x + 4}" y="4" width="${CW - 8}" height="38" rx="8" fill="#dfe9f5" stroke="#333" stroke-width="2"/><text x="${x + CW / 2}" y="30" text-anchor="middle" font-weight="bold" fill="#111">${esc(t)}</text>`;
    for (let j = 0; j < rijen; j++) {
      const y = 46 + j * RH;
      s += `<rect x="${x + 4}" y="${y}" width="${CW - 8}" height="${RH - 4}" rx="6" fill="#fff" stroke="#777" stroke-width="1.5"/>`;
      if (woorden && woorden[i] && woorden[i][j]) s += `<text x="${x + CW / 2}" y="${y + RH / 2 + 5}" text-anchor="middle" font-size="19" fill="#c0392b">${esc(woorden[i][j])}</text>`;
    }
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
