// Generator: lengtematen omzetten (bv. 3 dm = __ cm).
// Alle getallen in een oefening (gegeven én antwoord) blijven binnen het getallengebied.
import { maakOmzetten } from './maten.js';
import { FACTOR, VOLGORDE } from './lengte.js';

// Welke eenheden bij welk Op.stap-doel horen.
export const EENHEDEN_PER_DOEL = {
  '2.3.GL2.16': ['m', 'dm', 'cm'],
  '2.3.GL3.19': ['km', 'm', 'dm', 'cm'],
  '2.3.GL3.30': ['km', 'm', 'dm', 'cm'],
  '2.3.GL4.23': ['km', 'm', 'dm', 'cm', 'mm'],
  '2.3.GL4.42': ['km', 'm', 'dm', 'cm', 'mm'],
};

export default maakOmzetten({
  id: 'lengtematen-omzetten', titel: 'Lengtematen omzetten', opdracht: 'Reken de lengtes om. Schrijf het antwoord op de lijn.',
  maat: 'lengte', factor: FACTOR, volgorde: VOLGORDE, doelkaart: EENHEDEN_PER_DOEL, standaard: ['m', 'dm', 'cm'],
});
