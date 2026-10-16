// Meten: lengtematen vergelijken en lengte aflezen op een meetlat.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { FACTOR, VOLGORDE } from './lengte.js';
import { maakVergelijken } from './maten.js';
import { meetlat } from '../svg.js';

export const EENHEDEN_VERGELIJKEN = {
  '2.3.GL2.16': ['m', 'dm', 'cm'], '2.3.GL3.19': ['km', 'm', 'dm', 'cm'], '2.3.GL3.9': ['m', 'dm', 'cm'],
  '2.3.GL4.23': ['km', 'm', 'dm', 'cm', 'mm'], '2.3.GL4.8': ['m', 'dm', 'cm', 'mm'],
};

export const lengtematenVergelijken = maakVergelijken({
  id: 'lengtematen-vergelijken', titel: 'Lengtematen vergelijken', opdracht: 'Vergelijk de lengtes. Schrijf <, > of = op de lijn.',
  maat: 'lengte', factor: FACTOR, volgorde: VOLGORDE, doelkaart: EENHEDEN_VERGELIJKEN, standaard: ['m', 'dm', 'cm'],
});

export const lengteAflezen = {
  id: 'lengte-aflezen',
  titel: 'Lengte aflezen op de meetlat',
  pictogram: 'meten', rang: 2, basis: true, schaal: 0.5,
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
