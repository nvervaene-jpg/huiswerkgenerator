// Tekeningen voor de kleuteroefeningen: voorwerpen vergelijken, blokjes tellen als natuurlijke maat en een klasstatistiek met pictogrammen.
// Elk getekend voorwerp draagt een data-attribuut waaruit de tests nalezen wat er getekend is.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Andika, Arial, Helvetica, sans-serif">`;
const KLEUR = { lengte: '#f2c14e', oppervlakte: '#8ecae6', volume: '#e07a5f', inhoud: '#6fb7e9', massa: '#9a9a9a' };
const letter = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="22" font-weight="bold" fill="#111">${t}</text>`;

// Drie (of twee) voorwerpen met een verschil in lengte, oppervlakte, volume (torens van blokjes), inhoud (glazen) of massa (balans).
// items = [{ letter: 'A', w: 5 }] met w = hoeveel eenheden het voorwerp groot is.
export function vergelijk(soort, items) {
  if (soort === 'massa') return balans(items);
  const n = items.length, SLOT = soort === 'lengte' ? 64 : 112, W = soort === 'lengte' ? 420 : n * SLOT + 24, H = soort === 'lengte' ? n * SLOT + 8 : 200;
  let s = HEAD(W, H);
  items.forEach(({ letter: l, w }, i) => {
    const kleur = KLEUR[soort];
    if (soort === 'lengte') s += `<g data-item="${l}" data-w="${w}">${letter(22, 14 + i * SLOT + 40, l)}<rect x="50" y="${14 + i * SLOT + 18}" width="${w * 34}" height="26" rx="6" fill="${kleur}" stroke="#333" stroke-width="2"/></g>`;
    else if (soort === 'oppervlakte') { const z = 18 + w * 12; s += `<g data-item="${l}" data-w="${w}"><rect x="${14 + i * SLOT + (96 - z) / 2}" y="${150 - z}" width="${z}" height="${z}" fill="${kleur}" stroke="#333" stroke-width="2"/>${letter(14 + i * SLOT + 48, 186, l)}</g>`; }
    else if (soort === 'volume') { s += `<g data-item="${l}" data-w="${w}">`; for (let k = 0; k < w; k++) s += `<rect x="${14 + i * SLOT + 24}" y="${150 - (k + 1) * 20}" width="48" height="20" fill="${kleur}" stroke="#333" stroke-width="2"/>`; s += `${letter(14 + i * SLOT + 48, 186, l)}</g>`; }
    else { const x = 14 + i * SLOT + 22, hoogte = 120, vul = w * 14; s += `<g data-item="${l}" data-w="${w}"><rect x="${x}" y="${150 - vul}" width="52" height="${vul}" fill="${kleur}"/><path d="M${x} ${150 - hoogte} V150 H${x + 52} V${150 - hoogte}" fill="none" stroke="#333" stroke-width="3"/>${letter(x + 26, 186, l)}</g>`; }
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Een balans met twee voorwerpen: het zwaarste hangt het laagst.
function balans(items) {
  const [a, b] = items, W = 340, H = 220, hoek = a.w === b.w ? 0 : a.w > b.w ? 12 : -12, dy = Math.tan(hoek * Math.PI / 180) * 120;
  let s = HEAD(W, H) + `<path d="M170 60 L140 190 H200 Z" fill="#c9a66b" stroke="#333" stroke-width="2"/>`;
  s += `<line x1="50" y1="${60 + dy}" x2="290" y2="${60 - dy}" stroke="#333" stroke-width="5"/>`;
  [[a, 50, 60 + dy], [b, 290, 60 - dy]].forEach(([it, x, y]) => {
    s += `<g data-item="${it.letter}" data-w="${it.w}" data-y="${Math.round(y)}"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 40}" stroke="#333" stroke-width="2"/><path d="M${x - 40} ${y + 40} H${x + 40} L${x + 30} ${y + 56} H${x - 30} Z" fill="#ddd" stroke="#333" stroke-width="2"/><circle cx="${x}" cy="${y + 22}" r="${10 + it.w * 1.5}" fill="${KLEUR.massa}" stroke="#333" stroke-width="2"/>${letter(x, y + 88, it.letter)}</g>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Rijen met losse eenheden (blokjes, tegels, bekertjes, gewichtjes). rijen = [{ label, n }]. Elke eenheid heeft data-eenheid="label".
const VORM = {
  lengte: (x, y) => `<rect x="${x}" y="${y}" width="30" height="30" rx="4" fill="${KLEUR.lengte}" stroke="#333" stroke-width="2"`,
  oppervlakte: (x, y) => `<rect x="${x}" y="${y}" width="30" height="30" fill="${KLEUR.oppervlakte}" stroke="#333" stroke-width="2"`,
  volume: (x, y) => `<rect x="${x}" y="${y}" width="30" height="30" rx="2" fill="${KLEUR.volume}" stroke="#333" stroke-width="3"`,
  inhoud: (x, y) => `<circle cx="${x + 15}" cy="${y + 15}" r="14" fill="${KLEUR.inhoud}" stroke="#333" stroke-width="2"`,
  massa: (x, y) => `<rect x="${x + 2}" y="${y + 4}" width="26" height="22" rx="3" fill="${KLEUR.massa}" stroke="#333" stroke-width="2"`,
};
export function eenhedenRijen(soort, rijen) {
  const W = 26 + 12 * 34 + 20, H = rijen.length * 50 + 14;
  let s = HEAD(W, H);
  rijen.forEach(({ label, n }, ri) => {
    const y = 10 + ri * 50;
    s += letter(16, y + 24, label);
    for (let k = 0; k < n; k++) s += `${VORM[soort](40 + k * 34, y + 2)} data-eenheid="${label}"/>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Een voorwerp dat met n natuurlijke maten is gemeten: de balk van het voorwerp en daaronder de n blokjes. data-n op de groep.
export function natuurlijkeMaat(soort, n, naam) {
  const W = 26 + 12 * 34 + 20, H = 120;
  let s = HEAD(W, H) + `<g data-maat="${soort}" data-n="${n}">`;
  if (soort === 'massa') {
    s += `<path d="M170 40 L140 112 H200 Z" fill="#c9a66b" stroke="#333" stroke-width="2"/><line x1="40" y1="40" x2="300" y2="40" stroke="#333" stroke-width="5"/>`;
    s += `<text x="40" y="22" text-anchor="middle" font-size="16" fill="#111">${naam}</text><circle cx="40" cy="62" r="14" fill="#c0392b" stroke="#333" stroke-width="2"/>`;
    s += `<path d="M10 80 H70 L62 94 H18 Z" fill="#ddd" stroke="#333"/><line x1="300" y1="40" x2="300" y2="50" stroke="#333" stroke-width="2"/><path d="M262 78 H338 L330 92 H270 Z" fill="#ddd" stroke="#333"/>`;
    for (let k = 0; k < n; k++) s += `<rect x="${268 + (k % 5) * 14}" y="${58 - Math.floor(k / 5) * 14}" width="12" height="12" fill="${KLEUR.massa}" stroke="#333" data-eenheid="1"/>`;
    s += '</g></svg>';
    return { markup: s, breedte: W, hoogte: H };
  }
  const breed = n * 34;
  s += `<text x="40" y="22" font-size="16" fill="#111">${naam}</text><rect x="40" y="30" width="${breed}" height="22" rx="6" fill="#fff" stroke="#333" stroke-width="2.5"/>`;
  for (let k = 0; k < n; k++) s += `${VORM[soort === 'oppervlakte' ? 'oppervlakte' : soort](40 + k * 34, 64)} data-eenheid="1"/>`;
  return { markup: s + '</g></svg>', breedte: W, hoogte: H };
}

// Pictogrammen per groep (een rij cirkels per groep) en dezelfde gegevens als staafdiagram van blokjes.
export function pictogrammen(groepen, { staaf = false } = {}) {
  const KL = ['#e76f51', '#f4a261', '#2a9d8f', '#8e7dbe'];
  if (!staaf) {
    const W = 26 + 150 + 9 * 34, H = groepen.length * 44 + 10;
    let s = HEAD(W, H);
    groepen.forEach(({ naam, n }, i) => {
      s += `<text x="10" y="${34 + i * 44}" font-size="20" fill="#111">${naam}</text>`;
      for (let k = 0; k < n; k++) s += `<circle cx="${186 + k * 34}" cy="${28 + i * 44}" r="14" fill="${KL[i % 4]}" stroke="#333" stroke-width="2" data-groep="${naam}"/>`;
    });
    return { markup: s + '</svg>', breedte: W, hoogte: H };
  }
  const SLOT = 96, W = groepen.length * SLOT + 30, H = 9 * 26 + 60;
  let s = HEAD(W, H);
  groepen.forEach(({ naam, n }, i) => {
    for (let k = 0; k < n; k++) s += `<rect x="${24 + i * SLOT + 14}" y="${H - 40 - (k + 1) * 26}" width="52" height="26" fill="${KL[i % 4]}" stroke="#333" stroke-width="2" data-groep="${naam}"/>`;
    s += `<text x="${24 + i * SLOT + 40}" y="${H - 14}" text-anchor="middle" font-size="19" fill="#111">${naam}</text>`;
  });
  s += `<line x1="20" y1="${H - 40}" x2="${W - 6}" y2="${H - 40}" stroke="#333" stroke-width="2.5"/>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
