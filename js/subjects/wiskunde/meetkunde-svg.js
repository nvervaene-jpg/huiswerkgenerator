// SVG-tekeningen voor meetkunde: vlakke figuren, ruimtefiguren, hoeken, twee lijnen, rijen figuren en venndiagrammen. Zelf getekend.
// Elke functie geeft { markup, breedte, hoogte } terug (px), zoals ./svg.js. Vlakke figuren zijn één <polygon points="..."> of één <circle>,
// hoeken één <polyline>, lijnen twee <line>-elementen, zodat een test de tekening opnieuw kan opmeten.
const HEAD = (w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif" ${extra}>`;
const f1 = (x) => Math.round(x * 10) / 10;
const KLEUR = { rood: '#e57373', blauw: '#64b5f6', geel: '#ffd54f', groen: '#81c784' };
export const KLEUREN_NAMEN = Object.keys(KLEUR);

const draai = ([x, y], graden) => { const a = (graden * Math.PI) / 180; return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };
// Punten (in eenheden) draaien, vergroten en centreren in een vak van b x h.
export function plaats(punten, { rot = 0, s = 60, b = 200, h = 170 } = {}) {
  const p = punten.map(q => draai(q, rot).map(v => v * s)), xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
  return p.map(([x, y]) => [f1(x - mx + b / 2), f1(y - my + h / 2)]);
}
const reg = (n, start = -90) => Array.from({ length: n }, (_, i) => [Math.cos(((start + (360 / n) * i) * Math.PI) / 180), Math.sin(((start + (360 / n) * i) * Math.PI) / 180)]);

// Vaste vormen in eenheden (de hoeken van de vierhoeken zijn exact).
export const VORM_PUNTEN = {
  driehoek: [[-1.1, 0.8], [1.2, 0.6], [-0.2, -0.9]],
  vierkant: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
  rechthoek: [[-1.4, -0.8], [1.4, -0.8], [1.4, 0.8], [-1.4, 0.8]],
  ruit: [[0, -1.2], [0.8, 0], [0, 1.2], [-0.8, 0]],
  parallellogram: [[-0.8, -0.7], [1.2, -0.7], [0.8, 0.7], [-1.2, 0.7]],
  trapezium: [[-0.7, -0.7], [0.7, -0.7], [1.3, 0.7], [-1.3, 0.7]],
  vlieger: [[0, -1.3], [0.8, -0.2], [0, 1], [-0.8, -0.2]],
  vierhoek: [[-1.2, -0.8], [1.3, -0.5], [0.8, 0.9], [-1, 0.5]],
  vijfhoek: reg(5), zeshoek: reg(6, 0), achthoek: reg(8, 22.5),
};
export const FIGUUR_NAMEN = [...Object.keys(VORM_PUNTEN), 'cirkel'];

export function vlakFiguur(naam, { rot = 0, s = 60, kleur = '#bbdefb', punten = null } = {}) {
  const W = 200, H = 170, stijl = `fill="${kleur}" stroke="#222" stroke-width="3" stroke-linejoin="round"`;
  if (naam === 'cirkel') return { markup: `${HEAD(W, H)}<circle cx="100" cy="85" r="${f1(s * 1.1)}" ${stijl}/></svg>`, breedte: W, hoogte: H };
  const p = plaats(punten || VORM_PUNTEN[naam], { rot, s });
  return { markup: `${HEAD(W, H)}<polygon points="${p.map(q => q.join(',')).join(' ')}" ${stijl}/></svg>`, breedte: W, hoogte: H };
}

// Driehoek volgens een soort; 'r' levert getallen tussen 0 en 1. Zijden verschillen minstens 15 % als ze ongelijk heten.
const afstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const hoekIn = (a, b, c) => { const v = [a[0] - b[0], a[1] - b[1]], w = [c[0] - b[0], c[1] - b[1]]; return (Math.acos((v[0] * w[0] + v[1] * w[1]) / (Math.hypot(...v) * Math.hypot(...w))) * 180) / Math.PI; };
export const driehoekMaten = (p) => ({ zijden: [afstand(p[0], p[1]), afstand(p[1], p[2]), afstand(p[2], p[0])], hoeken: [hoekIn(p[2], p[0], p[1]), hoekIn(p[0], p[1], p[2]), hoekIn(p[1], p[2], p[0])] });
const verschillend = (z) => [[0, 1], [1, 2], [0, 2]].every(([i, j]) => Math.abs(z[i] - z[j]) / Math.max(z[i], z[j]) >= 0.15);
export function maakDriehoek(r, soort) {
  for (let t = 0; t < 400; t++) {
    let p;
    if (soort === 'gelijkzijdig') p = reg(3);
    else if (soort === 'gelijkbenig') { const b = 0.6 + r() * 0.5, h = 0.6 + r() * 0.9; p = [[-b, 0.5], [b, 0.5], [0, 0.5 - h]]; const z = driehoekMaten(p).zijden; if (Math.abs(z[0] - z[1]) / z[0] < 0.15) continue; }
    else if (soort === 'rechthoekig') { const a = 1.2 + r() * 1.2, b = 0.8 + r() * 1; p = [[0, 0], [a, 0], [0, b]]; }
    else { p = Array.from({ length: 3 }, () => [(r() - 0.5) * 2.6, (r() - 0.5) * 2]); }
    const m = driehoekMaten(p), maxH = Math.max(...m.hoeken), minH = Math.min(...m.hoeken);
    if (soort === 'ongelijkbenig' && verschillend(m.zijden) && minH > 20 && maxH < 150 && !m.hoeken.some(x => Math.abs(x - 90) < 4)) return p;
    if (soort === 'stomphoekig' && maxH >= 105 && maxH <= 140 && minH > 15 && Math.min(...m.zijden) > 0.6) return p;
    if (soort === 'scherphoekig' && maxH <= 80 && minH >= 30) return p;
    if (soort === 'rechthoekig' || soort === 'gelijkzijdig' || soort === 'gelijkbenig') return p;
  }
  return null;
}

/* ------------------------------------------------------------------ hoeken en lijnen */
// Hoek van 'graden' met de top in het midden; de eerste straal wijst naar 'rot' graden (0 = naar rechts).
export function hoekFiguur(graden, rot = 0) {
  const W = 220, H = 190, top = [W / 2 - 20, H / 2 + 30], L = 80;
  const a = (rot * Math.PI) / 180, b = ((rot - graden) * Math.PI) / 180, p1 = [top[0] + L * Math.cos(a), top[1] + L * Math.sin(a)], p2 = [top[0] + L * Math.cos(b), top[1] + L * Math.sin(b)];
  const boog = 22, q1 = [top[0] + boog * Math.cos(a), top[1] + boog * Math.sin(a)], q2 = [top[0] + boog * Math.cos(b), top[1] + boog * Math.sin(b)];
  const pt = (q) => q.map(f1).join(',');
  const recht = graden === 90 ? `<polyline points="${pt([top[0] + 14 * Math.cos(a), top[1] + 14 * Math.sin(a)])} ${pt([top[0] + 14 * (Math.cos(a) + Math.cos(b)), top[1] + 14 * (Math.sin(a) + Math.sin(b))])} ${pt([top[0] + 14 * Math.cos(b), top[1] + 14 * Math.sin(b)])}" fill="none" stroke="#c0392b" stroke-width="2.5"/>` : `<path d="M${pt(q1)} A${boog},${boog} 0 ${graden > 180 ? 1 : 0} 0 ${pt(q2)}" fill="none" stroke="#c0392b" stroke-width="2.5"/>`;
  return { markup: `${HEAD(W, H)}<polyline points="${pt(p1)} ${pt(top)} ${pt(p2)}" fill="none" stroke="#222" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${recht}</svg>`, breedte: W, hoogte: H };
}
// Twee lijnen: 'evenwijdig', 'loodrecht' of 'snijdend' (snijden, maar niet loodrecht). rot is de richting van de eerste lijn in graden.
export function tweeLijnen(soort, rot = 0, hoek = 60) {
  const W = 220, H = 190, c = [110, 95], L = 85;
  const lijn = (mid, gr) => { const a = (gr * Math.PI) / 180; return [[mid[0] - L * Math.cos(a), mid[1] - L * Math.sin(a)], [mid[0] + L * Math.cos(a), mid[1] + L * Math.sin(a)]]; };
  const verschuif = (gr, d) => { const a = ((gr + 90) * Math.PI) / 180; return [c[0] + d * Math.cos(a), c[1] + d * Math.sin(a)]; };
  let l1, l2;
  if (soort === 'evenwijdig') { l1 = lijn(verschuif(rot, -28), rot); l2 = lijn(verschuif(rot, 28), rot); } else { l1 = lijn(c, rot); l2 = lijn(c, rot + (soort === 'loodrecht' ? 90 : hoek)); }
  const lt = ([p, q], kleur) => `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(q[0])}" y2="${f1(q[1])}" stroke="${kleur}" stroke-width="3.5" stroke-linecap="round"/>`;
  const lab = (l, t) => `<text x="${f1(l[1][0] + 8)}" y="${f1(l[1][1] + 5)}" font-size="18" font-style="italic" fill="#111">${t}</text>`;
  return { markup: `${HEAD(W, H)}${lt(l1, '#1565c0')}${lt(l2, '#c62828')}${lab(l1, 'a')}${lab(l2, 'b')}</svg>`, breedte: W, hoogte: H };
}

/* ------------------------------------------------------------------ ruimtefiguren */
const LIJN = 'stroke="#222" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
const HIDDEN = 'stroke="#222" stroke-width="1.8" stroke-dasharray="5 4" fill="none"';
const pl = (pts, extra = `fill="none" ${LIJN}`) => `<polyline points="${pts.map(p => p.join(',')).join(' ')}" ${extra}/>`;
const vl = (pts, kleur) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${kleur}" ${LIJN}/>`;
export const RUIMTE_FIGUREN = ['kubus', 'balk', 'piramide', 'driehoeksprisma', 'cilinder', 'kegel', 'bol'];
export function ruimteFiguur(naam) {
  const W = 220, H = 190, K = ['#bbdefb', '#90caf9', '#64b5f6'];
  let s = HEAD(W, H) + `<g data-fig="${naam}">`;
  if (naam === 'kubus' || naam === 'balk') {
    const w = naam === 'kubus' ? 80 : 120, h = naam === 'kubus' ? 80 : 60, d = [34, -30], x = naam === 'kubus' ? 40 : 28, y = naam === 'kubus' ? 80 : 100;
    const A = [x, y], B = [x + w, y], C = [x + w, y + h], D = [x, y + h], O = (p) => [p[0] + d[0], p[1] + d[1]];
    s += vl([A, B, C, D], K[0]) + vl([A, B, O(B), O(A)], K[2]) + vl([B, C, O(C), O(B)], K[1]);
  } else if (naam === 'piramide') {
    const A = [40, 150], B = [130, 150], C = [165, 124], D = [75, 124], T = [105, 36];
    s += vl([A, B, T], K[0]) + vl([B, C, T], K[1]) + pl([D, A], HIDDEN) + pl([D, C], HIDDEN) + pl([D, T], HIDDEN);
  } else if (naam === 'driehoeksprisma') {
    const d = [50, -26], A = [40, 150], B = [120, 150], T = [80, 70], O = (p) => [p[0] + d[0], p[1] + d[1]];
    s += vl([A, B, T], K[0]) + vl([B, O(B), O(T), T], K[1]) + vl([T, O(T), O(A), A], K[2]);
  } else if (naam === 'cilinder') {
    s += `<path d="M60,50 L60,140 A50,16 0 0 0 160,140 L160,50" fill="${K[1]}" ${LIJN}/><ellipse cx="110" cy="50" rx="50" ry="16" fill="${K[0]}" ${LIJN}/>`;
  } else if (naam === 'kegel') {
    s += `<path d="M110,26 L55,140 A55,17 0 0 0 165,140 Z" fill="${K[1]}" ${LIJN}/>`;
  } else {
    s += `<circle cx="110" cy="95" r="62" fill="${K[0]}" ${LIJN}/><path d="M48,95 A62,16 0 0 0 172,95" fill="none" ${LIJN}/><path d="M48,95 A62,16 0 0 1 172,95" ${HIDDEN}/>`;
  }
  return { markup: s + '</g></svg>', breedte: W, hoogte: H };
}

/* ------------------------------------------------------------------ rij figuren (logica en verzamelingen) en venndiagram */
const vormMarkup = (vorm, x, y, kleur) => {
  const st = `fill="${KLEUR[kleur]}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"`;
  if (vorm === 'cirkel') return `<circle cx="${x}" cy="${y}" r="21" ${st}/>`;
  if (vorm === 'vierkant') return `<rect x="${x - 20}" y="${y - 20}" width="40" height="40" ${st}/>`;
  return `<polygon points="${x},${y - 23} ${x + 24},${y + 18} ${x - 24},${y + 18}" ${st}/>`;
};
// figuren: [{ vorm, kleur }]; elke figuur krijgt een letter eronder.
export function figurenRij(figuren) {
  const per = Math.min(figuren.length, 6), rijen = Math.ceil(figuren.length / per), W = per * 62 + 20, H = rijen * 82 + 10;
  let s = HEAD(W, H, 'font-size="16"');
  figuren.forEach((f, i) => { const x = 40 + (i % per) * 62, y = 36 + Math.floor(i / per) * 82; s += `<g data-vorm="${f.vorm}" data-kleur="${f.kleur}">${vormMarkup(f.vorm, x, y, f.kleur)}</g><text x="${x}" y="${y + 40}" text-anchor="middle" fill="#111">${String.fromCharCode(65 + i)}</text>`; });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
// Venndiagram met aantallen in de vier gebieden: alleenA, beide, alleenB, buiten.
export function venn(labelA, labelB, { alleenA, beide, alleenB, buiten }) {
  const W = 340, H = 210;
  const t = (x, y, v) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">${v}</text>`;
  return { markup: `${HEAD(W, H, 'font-size="16"')}<rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="125" cy="112" r="68" fill="#e5737355" stroke="#c62828" stroke-width="2.5"/><circle cx="215" cy="112" r="68" fill="#64b5f655" stroke="#1565c0" stroke-width="2.5"/><text x="95" y="30" text-anchor="middle" fill="#c62828">${labelA}</text><text x="245" y="30" text-anchor="middle" fill="#1565c0">${labelB}</text>${t(95, 120, alleenA)}${t(170, 120, beide)}${t(245, 120, alleenB)}${t(312, 190, buiten)}</svg>`, breedte: W, hoogte: H };
}

/* ------------------------------------------------------------------ patronen, vakken en assenstelsel */
// Rij figuren van een patroon; elementen { vorm, kleur } of null voor een leeg vakje met een vraagteken.
export function patroonRij(elementen) {
  const W = elementen.length * 58 + 16, H = 76;
  let s = HEAD(W, H, 'font-size="26"');
  elementen.forEach((e, i) => {
    const x = 36 + i * 58;
    if (!e) s += `<g data-pat="?"><rect x="${x - 24}" y="14" width="48" height="48" rx="6" fill="#fff" stroke="#6b7a89" stroke-width="2" stroke-dasharray="5 4"/><text x="${x}" y="48" text-anchor="middle" fill="#6b7a89" font-weight="bold">?</text></g>`;
    else s += `<g data-pat="${e.kleur}-${e.vorm}">${vormMarkup(e.vorm, x, 38, e.kleur)}</g>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
// Torens van vierkantjes (veranderend patroon); aantallen[i] = vierkantjes in toren i, null = nog te tekenen.
export function torenRij(aantallen, hoogteMax) {
  const CEL = 22, W = aantallen.length * 56 + 16, H = hoogteMax * CEL + 24;
  let s = HEAD(W, H, 'font-size="22"');
  aantallen.forEach((n, i) => {
    const x = 14 + i * 56;
    if (n === null) { s += `<g data-toren="?"><rect x="${x}" y="${H - 12 - 2 * CEL}" width="${CEL * 2}" height="${CEL * 2}" fill="#fff" stroke="#6b7a89" stroke-dasharray="5 4"/><text x="${x + CEL}" y="${H - 12 - CEL + 8}" text-anchor="middle" fill="#6b7a89" font-weight="bold">?</text></g>`; return; }
    s += `<g data-toren="${n}">`;
    for (let j = 0; j < n; j++) s += `<rect x="${x}" y="${H - 12 - (j + 1) * CEL}" width="${CEL}" height="${CEL}" fill="#64b5f6" stroke="#222" stroke-width="1.6"/>`;
    s += '</g>';
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
// Rooster met letters boven (A, B, ...) en cijfers links (1, 2, ...); items [{ kol, rij, vorm, kleur }] met kol en rij vanaf 0 (rij 0 staat onderaan niet: rij 1 is bovenaan).
export function vakkenRooster(kolommen, rijen, items) {
  const CEL = 44, W = 30 + kolommen * CEL + 6, H = 28 + rijen * CEL + 6;
  let s = HEAD(W, H, 'font-size="16"');
  for (let k = 0; k < kolommen; k++) s += `<text x="${30 + k * CEL + CEL / 2}" y="18" text-anchor="middle" font-weight="bold" fill="#111">${String.fromCharCode(65 + k)}</text>`;
  for (let r = 0; r < rijen; r++) s += `<text x="14" y="${28 + r * CEL + CEL / 2 + 6}" text-anchor="middle" font-weight="bold" fill="#111">${r + 1}</text>`;
  for (let r = 0; r < rijen; r++) for (let k = 0; k < kolommen; k++) s += `<rect x="${30 + k * CEL}" y="${28 + r * CEL}" width="${CEL}" height="${CEL}" fill="#fff" stroke="#9aa5b1" stroke-width="1.4"/>`;
  for (const it of items) s += `<g data-vak="${String.fromCharCode(65 + it.kol)}${it.rij + 1}" data-vorm="${it.vorm}" data-kleur="${it.kleur}">${vormMarkup(it.vorm, 30 + it.kol * CEL + CEL / 2, 28 + it.rij * CEL + CEL / 2, it.kleur).replace(/r="21"/, 'r="15"').replace(/x="[\d.-]+" y="[\d.-]+" width="40" height="40"/, `x="${30 + it.kol * CEL + 7}" y="${28 + it.rij * CEL + 7}" width="30" height="30"`)}</g>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
// Assenstelsel van 0 tot max met punten { naam, x, y }; de punten staan op roosterpunten.
export function assenstelsel(max, punten) {
  const CEL = 34, L = 40, W = L + max * CEL + 24, H = 22 + max * CEL + 36;
  let s = HEAD(W, H, 'font-size="14"');
  for (let i = 0; i <= max; i++) {
    s += `<line x1="${L + i * CEL}" y1="${H - 30 - max * CEL}" x2="${L + i * CEL}" y2="${H - 30}" stroke="#e1e6ea" stroke-width="1"/><line x1="${L}" y1="${H - 30 - i * CEL}" x2="${L + max * CEL}" y2="${H - 30 - i * CEL}" stroke="#e1e6ea" stroke-width="1"/>`;
    s += `<text x="${L + i * CEL}" y="${H - 12}" text-anchor="middle" fill="#111">${i}</text><text x="${L - 12}" y="${H - 30 - i * CEL + 5}" text-anchor="middle" fill="#111">${i}</text>`;
  }
  s += `<line x1="${L}" y1="${H - 30}" x2="${L + max * CEL + 14}" y2="${H - 30}" stroke="#111" stroke-width="2.4"/><line x1="${L}" y1="${H - 30}" x2="${L}" y2="${H - 30 - max * CEL - 14}" stroke="#111" stroke-width="2.4"/>`;
  for (const p of punten) s += `<g data-punt="${p.naam}" data-x="${p.x}" data-y="${p.y}"><circle cx="${L + p.x * CEL}" cy="${H - 30 - p.y * CEL}" r="5.5" fill="#c0392b"/><text x="${L + p.x * CEL + 8}" y="${H - 30 - p.y * CEL - 8}" font-weight="bold" fill="#111" font-size="17">${p.naam}</text></g>`;
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
