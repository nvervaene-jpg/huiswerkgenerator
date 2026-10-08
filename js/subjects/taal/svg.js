// SVG-tekeningen voor taalwerkbladen. Elke functie geeft { markup, breedte, hoogte } terug (px).
const HEAD = (w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Andika, Arial, Helvetica, sans-serif" ${extra}>`;
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
