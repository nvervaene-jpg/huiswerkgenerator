// Vak Wiskunde: wijst naar het doelenbestand, de koppelingen en de generators.
import { GENERATORS } from './generators/index.js';
import blokjes from './blokjes.js';

export default {
  id: 'wiskunde',
  naam: 'Wiskunde',
  actief: true,
  doelenUrl: 'data/wiskunde/doelen-wiskunde-opstap.json',
  koppelingenUrl: 'data/wiskunde/generators-map.json',
  generators: GENERATORS,
  blokjes,
};
