// Registratie van alle wiskundegenerators. Nieuwe generator = bestand maken + hier toevoegen
// + de doelcodes koppelen in data/wiskunde/generators-map.json.
import lengtematenOmzetten from './lengtematen-omzetten.js';
import { vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde } from './getallen.js';
import { optellen, aftrekken, maaltafels, vermenigvuldigenDelen } from './bewerkingen.js';
import { lengtematenVergelijken, lengteAflezen } from './meten.js';
import { LENGTE_VORMEN } from './lengte-vormen.js';
import { GETALLEN_VORMEN } from './getallen-vormen.js';
import { OPTELLEN_VORMEN, AFTREKKEN_VORMEN, MAALTAFEL_VORMEN, MAALDEEL_VORMEN } from './rekenvormen.js';
import { massaOmzetten, massaVergelijken, weegschaalAflezen, weegschaalTekenen, MASSA_VORMEN } from './massa.js';
import { klokAflezen, klokTekenen, tijdsduurOmzetten, tijdsduurVergelijken, TIJDSDUUR_VORMEN, tijdsduurBerekenen, dagenBerekenen } from './tijd.js';
import { GELD_VORMEN } from './geld-vormen.js';
import { TIJD_VORMEN } from './tijd-vormen.js';
import { muntenTellen, totaalprijs, wisselgeld, geldOmzetten, eurocentVergelijken, EUROCENT_VORMEN } from './geld.js';

export const GENERATORS = [
  // Getallen
  vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde, ...GETALLEN_VORMEN,
  // Bewerkingen
  optellen, ...OPTELLEN_VORMEN, aftrekken, ...AFTREKKEN_VORMEN, maaltafels, ...MAALTAFEL_VORMEN, vermenigvuldigenDelen, ...MAALDEEL_VORMEN,
  // Meten: lengte, gewicht, tijd en geld
  lengtematenOmzetten, lengtematenVergelijken, lengteAflezen, ...LENGTE_VORMEN,
  massaOmzetten, massaVergelijken, weegschaalAflezen, weegschaalTekenen, ...MASSA_VORMEN,
  klokAflezen, klokTekenen, tijdsduurOmzetten, tijdsduurVergelijken, ...TIJDSDUUR_VORMEN, tijdsduurBerekenen, dagenBerekenen, ...TIJD_VORMEN,
  muntenTellen, totaalprijs, wisselgeld, geldOmzetten, eurocentVergelijken, ...EUROCENT_VORMEN, ...GELD_VORMEN,
];
