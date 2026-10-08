// Registratie van alle wiskundegenerators. Nieuwe generator = bestand maken + hier toevoegen
// + de doelcodes koppelen in data/wiskunde/generators-map.json.
import lengtematenOmzetten from './lengtematen-omzetten.js';
import { vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde } from './getallen.js';
import { optellen, aftrekken, maaltafels, vermenigvuldigenDelen } from './bewerkingen.js';
import { lengtematenVergelijken, lengteAflezen } from './meten.js';
import { LENGTE_VORMEN } from './lengte-vormen.js';
import { massaOmzetten, massaVergelijken, weegschaalAflezen } from './massa.js';
import { klokAflezen, klokTekenen, tijdsduurOmzetten, tijdsduurBerekenen, dagenBerekenen } from './tijd.js';
import { muntenTellen, totaalprijs, wisselgeld, geldOmzetten } from './geld.js';

export const GENERATORS = [
  // Getallen
  vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde,
  // Bewerkingen
  optellen, aftrekken, maaltafels, vermenigvuldigenDelen,
  // Meten: lengte, gewicht, tijd en geld
  lengtematenOmzetten, lengtematenVergelijken, lengteAflezen, ...LENGTE_VORMEN,
  massaOmzetten, massaVergelijken, weegschaalAflezen,
  klokAflezen, klokTekenen, tijdsduurOmzetten, tijdsduurBerekenen, dagenBerekenen,
  muntenTellen, totaalprijs, wisselgeld, geldOmzetten,
];
