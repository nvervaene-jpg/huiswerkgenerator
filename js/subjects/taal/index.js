// Vak Nederlands/Taal: wijst naar het doelenbestand, de koppelingen en de generators.
import { GENERATORS } from './generators/index.js';
import blokjes from './blokjes.js';

export default {
  id: 'taal',
  naam: 'Taal',
  actief: true,
  doelenUrl: 'data/taal/doelen-taal-opstap.json',
  koppelingenUrl: 'data/taal/generators-map.json',
  leerjaren: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'],   // geen kleuterdoelen in Op.stap Nederlands
  gebieden: false,                                    // geen getallengebied
  onderElkaar: true,                                  // oefeningen onder elkaar over de volle breedte: taal vraagt schrijfruimte
  vulAan: true,                                       // het gekozen aantal oefeningen komt altijd volledig op het blad
  generators: GENERATORS,
  blokjes,
};
