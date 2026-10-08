// Meten: lengtematen vergelijken en lengte aflezen op een meetlat.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { FACTOR, eenhedenVoorDoelen } from './lengte.js';
import { meetlat } from '../svg.js';

const EENHEDEN_VERGELIJKEN = {
  '2.3.GL2.16': ['m', 'dm', 'cm'], '2.3.GL3.19': ['km', 'm', 'dm', 'cm'], '2.3.GL3.9': ['m', 'dm', 'cm'],
  '2.3.GL4.23': ['km', 'm', 'dm', 'cm', 'mm'], '2.3.GL4.8': ['m', 'dm', 'cm', 'mm'],
};

export const lengtematenVergelijken = {
  id: 'lengtematen-vergelijken',
  titel: 'Lengtematen vergelijken',
  pictogram: 'schrijven',
  opdracht: 'Vergelijk de lengtes. Schrijf <, > of = op de lijn.',
  doelen: Object.keys(EENHEDEN_VERGELIJKEN),
  opties: (doelCodes) => ({ eenheden: eenhedenVoorDoelen(EENHEDEN_VERGELIJKEN, doelCodes) }),
  genereer({ seed, aantal, gebied, opties }) {
    const eenheden = (opties && opties.eenheden && opties.eenheden.length > 1) ? opties.eenheden : ['m', 'dm', 'cm'];
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const a = eenheden[r.geheel(0, eenheden.length - 1)], b = eenheden[r.geheel(0, eenheden.length - 1)];
      if (a === b) return null;
      const v = r.geheel(1, gebied);
      const gelijkW = (v * FACTOR[a]) / FACTOR[b];                       // zelfde lengte in eenheid b
      let w;
      if (Number.isInteger(gelijkW) && gelijkW >= 1 && gelijkW <= gebied && r.volgende() < 0.25) w = gelijkW;
      else {
        w = Math.round(gelijkW * (0.5 + r.volgende()));
        if (w === gelijkW) w += r.volgende() < 0.5 ? 1 : -1;
      }
      if (w < 1 || w > gebied || !Number.isInteger(w)) return null;
      const x = v * FACTOR[a], y = w * FACTOR[b];
      const teken = x < y ? '<' : x > y ? '>' : '=';
      const verhouding = Math.log10(Math.max(FACTOR[a] / FACTOR[b], FACTOR[b] / FACTOR[a]));
      return {
        tekst: `${v} ${a}  ____  ${w} ${b}`, antwoord: teken, volledig: `${v} ${a} ${teken} ${w} ${b}`,
        getallen: [v, w], sleutel: `${v}${a}/${w}${b}`,
        familie: [[v, a].join(), [w, b].join()].sort().join('|'),
        moeilijkheid: [verhouding, teken === '=' ? 0 : 1, Math.max(v, w)],
        data: { type: 'lengte-vergelijk', v, a, w, b },
      };
    });
    return resultaat(lijst, aantal);
  },
};

export const lengteAflezen = {
  id: 'lengte-aflezen',
  titel: 'Lengte aflezen op de meetlat',
  pictogram: 'meten',
  opdracht: 'Hoe lang is de gekleurde balk? Lees af op de meetlat en schrijf het antwoord op de lijn.',
  doelen: ['2.3.GL2.21', '2.3.GL3.24'],
  genereer({ seed, aantal, gebied }) {
    const lat = gebied <= 10 ? 10 : gebied <= 20 ? 20 : 30;
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const van = r.volgende() < 0.6 ? 0 : r.geheel(1, lat - 2);
      const tot = r.geheel(van + 1, lat);
      return {
        tekst: 'De balk is ____ cm lang.', svg: meetlat({ lengte: lat, van, tot }), breed: true,
        antwoord: `${tot - van} cm`, volledig: `De balk is ${tot - van} cm lang.`,
        getallen: [van, tot, tot - van, lat], sleutel: `${van}-${tot}`,
        moeilijkheid: [van > 0 ? 1 : 0, tot - van],
        data: { type: 'aflezen', van, tot, lat },
      };
    });
    return resultaat(lijst, aantal);
  },
};
