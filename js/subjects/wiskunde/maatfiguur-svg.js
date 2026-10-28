// Figuren bij de oefeningen over omtrek en oppervlakte: de maten staan bij de zijden, zodat de vraag kort kan blijven.
// Elke maat is een <text data-maat="..."> zodat de tests nalezen wat er getekend is. De figuren zijn niet op schaal.
const HEAD = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="'Century Gothic', 'Didact Gothic', Arial, sans-serif" font-size="17">`;
const VUL = '#dbeaf7', LIJN = '#223';
const maat = (x, y, t, anker = 'middle') => `<text data-maat="${String(t).replace(/ .*/, '')}" x="${x}" y="${y}" text-anchor="${anker}" fill="#1f3b57" font-weight="bold">${t}</text>`;
const lijn = (x1, y1, x2, y2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LIJN}" stroke-width="2" ${extra}/>`;
const poly = (punten, vul = VUL, extra = '') => `<polygon points="${punten.map(p => p.join(',')).join(' ')}" fill="${vul}" stroke="${LIJN}" stroke-width="2.5" stroke-linejoin="round" ${extra}/>`;
const recht = (x, y) => `<path d="M${x} ${y - 11} h11 v11" fill="none" stroke="${LIJN}" stroke-width="1.5"/>`;
const klaar = (W, H, inhoud) => ({ markup: `${HEAD(W, H)}${inhoud}</svg>`, breedte: W, hoogte: H });

// Een veelhoek met zijden die de leerling moet optellen: de hoekpunten liggen op een cirkel met wat afwijking.
function veelhoek(z) {
  const n = z.length, cx = 150, cy = 88, punten = z.map((_, i) => { const hoek = (-90 + (360 / n) * i) * Math.PI / 180, rad = [62, 50, 68, 54, 64, 52][i % 6]; return [Math.round(cx + rad * 1.5 * Math.cos(hoek)), Math.round(cy + rad * 1.1 * Math.sin(hoek))]; });
  let s = poly(punten);
  punten.forEach((p, i) => {
    const q = punten[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = mx - cx, dy = my - cy, l = Math.hypot(dx, dy) || 1;
    s += maat(Math.round(mx + (dx / l) * 26), Math.round(my + (dy / l) * 22 + 5), `${z[i]} cm`);
  });
  return klaar(300, 176, s);
}

export function maatFiguur(type, d) {
  switch (type) {
    case 'omtrek-veelhoek': return veelhoek(d.z);
    case 'omtrek-vierkant': case 'opp-vierkant':
      return klaar(220, 150, poly([[70, 20], [150, 20], [150, 100], [70, 100]]) + maat(110, 126, `${d.l} cm`) + maat(168, 66, `${d.l} cm`, 'start'));
    case 'omtrek-rechthoek': case 'opp-rechthoek':
      return klaar(260, 140, poly([[40, 20], [200, 20], [200, 90], [40, 90]]) + maat(120, 114, `${d.l} cm`) + maat(210, 60, `${d.b} cm`, 'start'));
    case 'omtrek-samengesteld': case 'opp-samengesteld': {              // een rechthoek a bij d waaruit rechtsboven een rechthoek c bij e is weggehaald
      const L = [[30, 20], [120, 20], [120, 60], [220, 60], [220, 130], [30, 130]];
      return klaar(330, 160, '<g transform="translate(40,0)">' + poly(L) + `<rect x="120" y="20" width="100" height="40" fill="#fff" stroke="${LIJN}" stroke-width="1.5" stroke-dasharray="5 4"/>`
        + maat(125, 148, `${d.a} cm`) + maat(22, 80, `${d.d} cm`, 'end') + maat(170, 44, `${d.c} cm`) + maat(228, 44, `${d.e} cm`, 'start') + '</g>');
    }
    case 'opp-driehoek':
      return klaar(280, 150, poly([[30, 120], [230, 120], [150, 20]]) + lijn(150, 20, 150, 120, 'stroke-dasharray="5 4"') + recht(150, 120) + maat(130, 142, `${d.b} cm`) + maat(158, 76, `${d.h} cm`, 'start'));
    case 'opp-parallellogram':
      return klaar(290, 150, poly([[20, 120], [190, 120], [250, 25], [80, 25]]) + lijn(80, 25, 80, 120, 'stroke-dasharray="5 4"') + recht(80, 120) + maat(105, 142, `${d.b} cm`) + maat(72, 80, `${d.h} cm`, 'end'));
    case 'opp-ruit':
      return klaar(260, 160, poly([[130, 12], [225, 80], [130, 148], [35, 80]]) + lijn(130, 12, 130, 148, 'stroke-dasharray="5 4"') + lijn(35, 80, 225, 80, 'stroke-dasharray="5 4"') + maat(138, 40, `${d.d1} cm`, 'start') + maat(80, 72, `${d.d2} cm`));
    case 'opp-trapezium':
      return klaar(290, 160, poly([[20, 125], [250, 125], [195, 28], [75, 28]]) + lijn(195, 28, 195, 125, 'stroke-dasharray="5 4"') + recht(195, 125) + maat(135, 20, `${d.b1} cm`) + maat(135, 148, `${d.b2} cm`) + maat(203, 82, `${d.h} cm`, 'start'));
    case 'omtrek-cirkel':
      return klaar(220, 170, `<circle cx="110" cy="82" r="64" fill="${VUL}" stroke="${LIJN}" stroke-width="2.5"/>${lijn(46, 82, 174, 82)}<circle cx="110" cy="82" r="3" fill="${LIJN}"/>` + maat(110, 70, `${d.d} cm`));
    case 'opp-cirkel':
      return klaar(220, 170, `<circle cx="110" cy="82" r="64" fill="${VUL}" stroke="${LIJN}" stroke-width="2.5"/>${lijn(110, 82, 174, 82)}<circle cx="110" cy="82" r="3" fill="${LIJN}"/>` + maat(142, 70, `${d.r} cm`));
    case 'oppv-kubus': {
      const z = d.z;
      return klaar(240, 186, poly([[40, 60], [130, 60], [130, 150], [40, 150]]) + poly([[40, 60], [80, 25], [170, 25], [130, 60]], '#eef5fb') + poly([[130, 60], [170, 25], [170, 115], [130, 150]], '#c9deef') + maat(85, 170, `${z} cm`) + maat(178, 80, `${z} cm`, 'start'));
    }
    case 'oppv-balk': {
      return klaar(290, 180, poly([[30, 70], [170, 70], [170, 150], [30, 150]]) + poly([[30, 70], [75, 30], [215, 30], [170, 70]], '#eef5fb') + poly([[170, 70], [215, 30], [215, 110], [170, 150]], '#c9deef')
        + maat(100, 172, `${d.l} cm`) + maat(224, 90, `${d.h} cm`, 'start') + maat(100, 40, `${d.b} cm`, 'end'));
    }
    default: return null;
  }
}

// De korte vraag bij zo'n figuur.
export const KORTE_VRAAG = (type) => (/^omtrek/.test(type) ? 'De omtrek is ____ cm' : /^opp-/.test(type) ? 'De oppervlakte is ____ cm²' : /^oppv/.test(type) ? 'De totale oppervlakte is ____ cm²' : null);
