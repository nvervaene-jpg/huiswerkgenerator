// Registratie van alle wiskundegenerators. Nieuwe generator = bestand maken + hier toevoegen
// + de doelcodes koppelen in data/wiskunde/generators-map.json.
import lengtematenOmzetten from './lengtematen-omzetten.js';
import { vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde } from './getallen.js';
import { optellen, aftrekken, maaltafels, vermenigvuldigenDelen } from './bewerkingen.js';
import { lengtematenVergelijken, lengteAflezen } from './meten.js';

export const GENERATORS = [
  // Getallen
  vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde,
  // Bewerkingen
  optellen, aftrekken, maaltafels, vermenigvuldigenDelen,
  // Meten
  lengtematenOmzetten, lengtematenVergelijken, lengteAflezen,
];
