// Cijferen onder elkaar in een rooster met kolommen E, T, H, D (en TD), met onthoudvakjes. Elke functie geeft { markup, breedte, hoogte }.
// De leerlingenversie heeft lege vakjes; met 'oplossing' staan de antwoorden en de tussenstappen in het rood (data-attributen voor de tests).
const CEL = 44, KLEIN = 26, LINKS = 40, PLAATS = ['E', 'T', 'H', 'D', 'TD'];
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Andika, Arial, Helvetica, sans-serif">`;
const ROOD = '#c0392b';
const cijfersVan = (n, kolommen) => String(n).padStart(kolommen, ' ').split('').map(c => (c === ' ' ? '' : c));

// rijen: [{ soort: 'term'|'onthoud'|'antwoord'|'deel', waarde (getal of null), teken?, kol? }]
function rooster(kolommen, rijen, oplossing) {
  const W = LINKS + kolommen * CEL + 10;
  const hoogtes = rijen.map(r => (r.soort === 'onthoud' ? KLEIN + 6 : CEL));
  const H = 22 + hoogtes.reduce((a, b) => a + b, 0) + 12;
  let s = HEAD(W, H);
  for (let k = 0; k < kolommen; k++) s += `<text x="${LINKS + (kolommen - 1 - k) * CEL + CEL / 2}" y="15" text-anchor="middle" font-size="13" fill="#7a8794">${PLAATS[k]}</text>`;
  let y = 22;
  rijen.forEach((r, i) => {
    const h = hoogtes[i];
    if (r.soort === 'onthoud') {
      // onthoudvakjes: een klein vakje boven elke kolom die er een nodig heeft; r.waarden[kolom] = getal of undefined
      for (let k = 0; k < kolommen; k++) {
        const x = LINKS + (kolommen - 1 - k) * CEL + (CEL - KLEIN) / 2;
        if (r.vakjes.includes(k)) {
          s += `<rect x="${x}" y="${y + 2}" width="${KLEIN}" height="${KLEIN}" rx="4" fill="none" stroke="#9aa5b1" stroke-width="1.5" stroke-dasharray="3 2"/>`;
          if (oplossing && r.waarden[k] !== undefined) s += `<text x="${x + KLEIN / 2}" y="${y + 21}" text-anchor="middle" font-size="${String(r.waarden[k]).length > 1 ? 14 : 17}" font-weight="bold" fill="${ROOD}" data-onthoud="${k}">${r.waarden[k]}</text>`;
        }
      }
    } else {
      const toon = r.soort === 'term' || oplossing;
      const cijfers = r.waarde === null || r.waarde === undefined ? [] : cijfersVan(r.waarde, kolommen);
      if (r.soort !== 'term') for (let k = 0; k < kolommen; k++) {
        const x = LINKS + k * CEL;
        s += `<rect x="${x + 3}" y="${y + 3}" width="${CEL - 6}" height="${CEL - 6}" rx="5" fill="#fff" stroke="#6b7a89" stroke-width="1.8"/>`;
      }
      if (toon) cijfers.forEach((c, k) => {
        if (c === '') return;
        s += `<text x="${LINKS + k * CEL + CEL / 2}" y="${y + 31}" text-anchor="middle" font-size="28" font-weight="${r.soort === 'term' ? 'normal' : 'bold'}" fill="${r.soort === 'term' ? '#111' : ROOD}" ${r.soort === 'term' ? '' : `data-${r.soort}="${kolommen - 1 - k}"`}>${c}</text>`;
      });
      if (r.teken) s += `<text x="${LINKS - 18}" y="${y + 31}" text-anchor="middle" font-size="28" fill="#111">${r.teken}</text>`;
      if (r.lijnOnder) s += `<line x1="${LINKS - 28}" y1="${y + CEL}" x2="${W - 6}" y2="${y + CEL}" stroke="#111" stroke-width="2.5"/>`;
    }
    y += h;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Optellen: termen onder elkaar; onthouden[k] = het getal dat naar kolom k+1 gaat.
export function optelRooster({ termen, som, onthouden, oplossing }) {
  const kolommen = String(Math.max(som, ...termen)).length;
  const vakjes = []; const waarden = {};
  onthouden.forEach((c, k) => { if (c && k + 1 < kolommen) { vakjes.push(k + 1); waarden[k + 1] = c; } });
  return rooster(kolommen, [
    { soort: 'onthoud', vakjes: Array.from({ length: kolommen - 1 }, (_, i) => i + 1), waarden },
    ...termen.map((t, i) => ({ soort: 'term', waarde: t, teken: i === termen.length - 1 ? '+' : '', lijnOnder: i === termen.length - 1 })),
    { soort: 'antwoord', waarde: som },
  ], oplossing);
}

// Aftrekken met lenen: is een cijfer van het eerste getal te klein, dan leen je 1 bij het volgende cijfer. In het vakje boven elk gewijzigd cijfer
// staat de nieuwe waarde (bv. 13 voor de eenheden en 3 voor de tientallen). leen[k] = nieuwe waarde van kolom k, of null.
export function aftrekRooster({ a, b, leen, verschil, oplossing }) {
  const kolommen = String(a).length;
  const waarden = {};
  leen.forEach((w, k) => { if (w !== null && w !== undefined) waarden[k] = w; });
  return rooster(kolommen, [
    { soort: 'onthoud', vakjes: Array.from({ length: kolommen }, (_, i) => i), waarden },
    { soort: 'term', waarde: a },
    { soort: 'term', waarde: b, teken: '−', lijnOnder: true },
    { soort: 'antwoord', waarde: verschil },
  ], oplossing);
}

// Vermenigvuldigen met een getal van één cijfer: onthoudvakjes boven het eerste getal.
export function maalRooster({ a, b, onthouden, product, oplossing }) {
  const kolommen = String(product).length;
  const waarden = {};
  onthouden.forEach((c, k) => { if (c && k + 1 < kolommen) waarden[k + 1] = c; });
  return rooster(kolommen, [
    { soort: 'onthoud', vakjes: Array.from({ length: String(a).length }, (_, i) => i + 1).filter(k => k < kolommen), waarden },
    { soort: 'term', waarde: a },
    { soort: 'term', waarde: b, teken: '×', lijnOnder: true },
    { soort: 'antwoord', waarde: product },
  ], oplossing);
}

// Vermenigvuldigen met een getal van twee cijfers: twee deelproducten en de som.
export function maalRooster2({ a, b, deel1, deel2, product, oplossing }) {
  const kolommen = String(product).length;
  const antw = (soort, waarde, extra = {}) => ({ soort, waarde, ...extra });
  return rooster(kolommen, [
    { soort: 'term', waarde: a },
    { soort: 'term', waarde: b, teken: '×', lijnOnder: true },
    antw('deel', deel1), antw('deel', deel2, { teken: '+', lijnOnder: true }),
    antw('antwoord', product),
  ], oplossing);
}
