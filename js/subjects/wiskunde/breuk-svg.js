// SVG-tekeningen voor breuken: een geheel verdeeld in gelijke delen (cirkel, strook of raster) en het stappenplan
// 'Wat is het geheel? In hoeveel gelijke delen is het verdeeld? Hoeveel gelijke delen neem ik? Welk deel is dit van het geheel?'
// Elk deel krijgt data-deel="1" (gekleurd) of data-deel="0"; de tests tellen die.
const HEAD = (w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="'Century Gothic', 'Didact Gothic', Arial, sans-serif" ${extra}>`;
const rond = (x) => Math.round(x * 100) / 100;
const GRIJS = '#8c8c8c', LIJN = '#222';

export const FIGUREN = ['cirkel', 'rechthoek', 'raster'];
export const figuurMogelijk = (soort, n) => (soort === 'raster' ? n % 2 === 0 : n >= 2);

// Het geheel in n delen; de eerste t delen zijn gekleurd (bij de cirkel vanaf boven met de klok mee, bij het raster kolom per kolom).
export function figuur({ soort, n, t, x, y, w, h }) {
  let s = '';
  if (soort === 'cirkel') {
    const R = Math.min(w, h) / 2 - 2, cx = x + w / 2, cy = y + h / 2;
    for (let i = 0; i < n; i++) {
      const a1 = (i * 2 * Math.PI) / n, a2 = ((i + 1) * 2 * Math.PI) / n;
      const p = (a) => `${rond(cx + R * Math.sin(a))} ${rond(cy - R * Math.cos(a))}`;
      const d = n === 1 ? '' : `M ${cx} ${cy} L ${p(a1)} A ${R} ${R} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${p(a2)} Z`;
      s += `<path data-deel="${i < t ? 1 : 0}" d="${d}" fill="${i < t ? GRIJS : '#fff'}" stroke="${LIJN}" stroke-width="2.4" stroke-linejoin="round"/>`;
    }
  } else if (soort === 'rechthoek') {
    const bw = w / n;
    for (let i = 0; i < n; i++) s += `<rect data-deel="${i < t ? 1 : 0}" x="${rond(x + i * bw)}" y="${y}" width="${rond(bw)}" height="${h}" fill="${i < t ? GRIJS : '#fff'}" stroke="${LIJN}" stroke-width="2.4"/>`;
  } else {
    const kol = n / 2, bw = w / kol, bh = h / 2;
    for (let i = 0; i < n; i++) {
      const c = Math.floor(i / 2), r = i % 2;
      s += `<rect data-deel="${i < t ? 1 : 0}" x="${rond(x + c * bw)}" y="${rond(y + r * bh)}" width="${rond(bw)}" height="${rond(bh)}" fill="${i < t ? GRIJS : '#fff'}" stroke="${LIJN}" stroke-width="2.4"/>`;
    }
  }
  return s;
}

// Kleine afbeelding van het geheel (voor het vakje 'Wat is het geheel?').
const geheelIcoon = (soort, cx, cy, kleur) => (soort === 'cirkel'
  ? `<circle cx="${cx}" cy="${cy}" r="30" fill="#fff" stroke="${kleur}" stroke-width="2.4"/>`
  : `<rect x="${cx - 36}" y="${cy - 22}" width="72" height="44" fill="#fff" stroke="${kleur}" stroke-width="2.4"/>`);

const kader = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="${LIJN}" stroke-width="2"/>`;
const vakje = (x, y, w, h, tekst, kleur) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="${LIJN}" stroke-width="1.6"/>`
  + (tekst === undefined ? '' : `<text x="${x + w / 2}" y="${y + h / 2 + 9}" text-anchor="middle" font-size="27" font-weight="bold" fill="${kleur}">${tekst}</text>`);
const pijlkop = (x, y, hoek) => `<path d="M ${x} ${y} l -13 -7 v 14 z" transform="rotate(${hoek} ${x} ${y})" fill="#666"/>`;
const label = (x, y, regels, maat = 15.5) => regels.map((r, i) => `<text x="${x}" y="${y + i * 18}" text-anchor="middle" font-size="${maat}" fill="#111">${r}</text>`).join('');

// Het stappenplan. 'ingevuld' toont de antwoorden in 'kleur' (voorbeeld of oplossing); 'voorbeeld' zet het woord 'voorbeeld:' erbij.
export function breukStappenplan({ soort, n, t, ingevuld = false, kleur = '#c0392b', voorbeeld = false }) {
  const W = 724, H = 348;
  let s = HEAD(W, H);
  s += `<rect x="4" y="4" width="${W - 8}" height="${H - 10}" rx="30" fill="#fff" stroke="#666" stroke-width="2"/>`;
  if (voorbeeld) s += `<text x="26" y="36" font-size="21" font-style="italic" fill="#111">voorbeeld:</text>`;
  s += figuur({ soort, n, t, x: 28, y: 56, w: 196, h: soort === 'rechthoek' ? 150 : 160 });
  // stap 1: het geheel
  s += kader(256, 140, 92, 92) + (ingevuld ? geheelIcoon(soort, 302, 186, kleur) : '');
  s += label(302, 256, ['Wat is het geheel?'], 14.5);
  s += `<path d="M 300 128 Q 308 82 366 66" fill="none" stroke="#666" stroke-width="6" stroke-linecap="round"/>` + pijlkop(372, 64, -18);
  // stap 2: in hoeveel gelijke delen is het verdeeld (noemer)
  s += kader(380, 36, 104, 104) + `<line x1="392" y1="88" x2="472" y2="88" stroke="${LIJN}" stroke-width="1.6"/>` + vakje(406, 96, 52, 38, ingevuld ? n : undefined, kleur);
  s += label(432, 164, ['In hoeveel gelijke', 'delen is het verdeeld?'], 14.5);
  s += `<line x1="494" y1="88" x2="534" y2="88" stroke="#666" stroke-width="6" stroke-linecap="round"/>` + pijlkop(542, 88, 0);
  // stap 3: hoeveel gelijke delen neem ik (teller)
  s += kader(550, 36, 104, 104) + `<line x1="562" y1="88" x2="642" y2="88" stroke="${LIJN}" stroke-width="1.6"/>` + vakje(576, 42, 52, 38, ingevuld ? t : undefined, kleur);
  s += label(602, 164, ['Hoeveel gelijke delen', 'neem ik?'], 14.5);
  s += `<path d="M 662 100 Q 700 150 668 196" fill="none" stroke="#666" stroke-width="6" stroke-linecap="round"/>` + pijlkop(666, 200, 122);
  // stap 4: de breuk
  s += kader(594, 210, 92, 82) + `<line x1="606" y1="251" x2="674" y2="251" stroke="${LIJN}" stroke-width="1.6"/>`;
  s += vakje(616, 214, 48, 32, ingevuld ? t : undefined, kleur) + vakje(616, 256, 48, 32, ingevuld ? n : undefined, kleur);
  s += label(640, 312, ['Welk deel is dit van', 'het geheel?'], 14.5);
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Een figuur met rechts een leeg (of ingevuld) breukkader: 'Welk deel is gekleurd?'
export function breukNoteren({ soort, n, t, ingevuld = false, kleur = '#c0392b' }) {
  const W = 420, H = 190;
  let s = HEAD(W, H);
  s += figuur({ soort, n, t, x: 10, y: 14, w: 196, h: soort === 'rechthoek' ? 150 : 160 });
  s += kader(280, 40, 96, 106) + `<line x1="292" y1="93" x2="364" y2="93" stroke="${LIJN}" stroke-width="1.6"/>`;
  s += vakje(304, 46, 48, 38, ingevuld ? t : undefined, kleur) + vakje(304, 100, 48, 38, ingevuld ? n : undefined, kleur);
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}

// Alleen de figuur (met gekleurde delen of leeg).
export function breukFiguur({ soort, n, t }) {
  const W = 220, H = 180;
  return { markup: HEAD(W, H) + figuur({ soort, n, t, x: 10, y: 10, w: 196, h: soort === 'rechthoek' ? 150 : 160 }) + '</svg>', breedte: W, hoogte: H };
}
