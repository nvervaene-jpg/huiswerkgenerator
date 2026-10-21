// Tekeningen voor vormleer: lijnsoorten, rechthoekige driehoek met genoemde zijden en parallellogram met hoogte en basis.
// Elk onderdeel heeft een data-attribuut zodat een test de tekening kan nalezen.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif">`;
const KL = '#1f3b57';

// soort: recht | gebogen | punt | rond | rechte | lijnstuk | halfrechte | kromme; hoek = draaiing in graden
export function lijnTekening(soort, hoek = 0) {
  const W = 220, H = 120, c = `translate(110 60) rotate(${hoek}) translate(-110 -60)`;
  let s = HEAD(W, H) + `<g data-lijn="${soort}" transform="${c}">`;
  switch (soort) {
    case 'punt': s += `<circle cx="110" cy="60" r="5" fill="${KL}"/>`; break;
    case 'rond': s += `<circle cx="110" cy="60" r="38" fill="none" stroke="${KL}" stroke-width="3.2"/>`; break;
    case 'gebogen': case 'kromme': s += `<path d="M 20 85 C 70 10, 150 110, 200 35" fill="none" stroke="${KL}" stroke-width="3.2" stroke-linecap="round"/>`; break;
    case 'rechte': s += `<line x1="14" y1="60" x2="206" y2="60" stroke="${KL}" stroke-width="3.2"/><path d="M 4 60 l 14 -7 v 14 z" fill="${KL}"/><path d="M 216 60 l -14 -7 v 14 z" fill="${KL}"/>`; break;
    case 'lijnstuk': s += `<line x1="30" y1="60" x2="190" y2="60" stroke="${KL}" stroke-width="3.2"/><circle cx="30" cy="60" r="5" fill="${KL}"/><circle cx="190" cy="60" r="5" fill="${KL}"/>`; break;
    case 'halfrechte': s += `<line x1="30" y1="60" x2="204" y2="60" stroke="${KL}" stroke-width="3.2"/><circle cx="30" cy="60" r="5" fill="${KL}"/><path d="M 216 60 l -14 -7 v 14 z" fill="${KL}"/>`; break;
    default: s += `<line x1="20" y1="60" x2="200" y2="60" stroke="${KL}" stroke-width="3.2" stroke-linecap="round"/>`;
  }
  return { markup: s + '</g></svg>', breedte: W, hoogte: H };
}

// Rechthoekige driehoek met de rechte hoek linksonder of rechtsonder; de drie zijden hebben een letter. letters = [onder, loodrecht, schuin].
export function driehoekZijden(letters, spiegel, b = 150, h = 100) {
  const W = 230, H = 160, x0 = 40, y0 = 130, xr = spiegel ? x0 + b : x0;
  const hoek = [xr, y0 - h], onderL = [x0, y0], onderR = [x0 + b, y0];
  const zijde = (letter, p, q, dx, dy) => `<line data-zijde="${letter}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${KL}" stroke-width="3.4"/><text x="${(p[0] + q[0]) / 2 + dx}" y="${(p[1] + q[1]) / 2 + dy}" text-anchor="middle" font-size="18" font-weight="bold" fill="#c0392b">${letter}</text>`;
  return { markup: HEAD(W, H) + zijde(letters[0], onderL, onderR, 0, 22) + zijde(letters[1], hoek, spiegel ? onderR : onderL, spiegel ? 16 : -16, 6) + zijde(letters[2], hoek, spiegel ? onderL : onderR, spiegel ? -16 : 16, -6) + '</svg>', breedte: W, hoogte: H };
}

// Parallellogram met de basis onderaan (dik) en een gestippelde hoogte vanuit het bovenste hoekpunt.
export function parallellogramHoogte({ b = 130, h = 80, schuin = 40 } = {}) {
  const W = b + schuin + 60, H = h + 50, x0 = 30, y0 = h + 20;
  const hoogte = `<line data-hoogte="1" x1="${x0 + schuin}" y1="${y0 - h}" x2="${x0 + schuin}" y2="${y0}" stroke="#c0392b" stroke-width="2.6" stroke-dasharray="6 4"/>`;
  const vlak = `<polygon points="${x0},${y0} ${x0 + b},${y0} ${x0 + b + schuin},${y0 - h} ${x0 + schuin},${y0 - h}" fill="#e3f0fb" stroke="${KL}" stroke-width="2"/>`;
  const basis = `<line data-basis="1" x1="${x0}" y1="${y0}" x2="${x0 + b}" y2="${y0}" stroke="${KL}" stroke-width="6" stroke-linecap="round"/>`;
  return { markup: HEAD(W, H) + vlak + basis + hoogte + '</svg>', breedte: W, hoogte: H };
}
