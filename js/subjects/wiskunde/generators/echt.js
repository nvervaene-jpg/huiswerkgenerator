// Registratie van alle wiskundegenerators. Nieuwe generator = bestand maken + hier toevoegen
// + de doelcodes koppelen in data/wiskunde/generators-map.json.
import lengtematenOmzetten from './lengtematen-omzetten.js';
import { vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde } from './getallen.js';
import { optellen, aftrekken, maaltafels, vermenigvuldigenDelen } from './bewerkingen.js';
import { lengtematenVergelijken, lengteAflezen } from './meten.js';
import { LENGTE_VORMEN } from './lengte-vormen.js';
import { GETALLEN_VORMEN } from './getallen-vormen.js';
import { OPTELLEN_VORMEN, AFTREKKEN_VORMEN, MAALTAFEL_VORMEN, MAALDEEL_VORMEN } from './rekenvormen.js';
import { massaOmzetten, massaVergelijken, weegschaalAflezen, weegschaalTekenen, weegschaalKies, weegschaalJuistFout, weegschaalFout, MASSA_VORMEN } from './massa.js';
import { klokAflezen, klokTekenen, tijdsduurOmzetten, tijdsduurVergelijken, TIJDSDUUR_VORMEN, tijdsduurBerekenen, dagenBerekenen } from './tijd.js';
import { GELD_VORMEN } from './geld-vormen.js';
import { TIJD_VORMEN } from './tijd-vormen.js';
import { BREUK_VORMEN } from './breuken.js';
import { EIGENSCHAPPEN_VORMEN } from './auto-eigenschappen.js';
import { AUTO_GETALLEN_VORMEN } from './auto-getallen.js';
import { AUTO_RATIONAAL_VORMEN } from './auto-rationaal.js';
import { AUTO_REKENEN_VORMEN } from './auto-rekenen.js';
import { AUTO_METEN_VORMEN } from './auto-meten.js';
import { AUTO_STATISTIEK_VORMEN } from './auto-statistiek.js';
import { AUTO_VRAAGSTUKKEN_VORMEN } from './auto-vraagstukken.js';
import { STIP_VORMEN } from './stip.js';
import { CIJFER_VORMEN } from './cijferen.js';
import { AUTO_MEETKUNDE_VORMEN } from './auto-meetkunde.js';
import { AUTO_MEETKUNDE2_VORMEN } from './auto-meetkunde2.js';
import { AUTO_REST_VORMEN } from './auto-rest.js';
import { AUTO_VORMLEER_VORMEN } from './auto-vormleer.js';
import { AUTO_BEGRIPPEN_VORMEN } from './auto-begrippen.js';
import { AUTO_GETALLEN2_VORMEN } from './auto-getallen2.js';
import { AUTO_AFWERKING_VORMEN } from './auto-afwerking.js';
import { AUTO_AFWERKING2_VORMEN } from './auto-afwerking2.js';
import { AUTO_AFWERKING3_VORMEN } from './auto-afwerking3.js';
import { AUTO_AFWERKING4_VORMEN } from './auto-afwerking4.js';
import { AUTO_METEN3_VORMEN } from './auto-meten3.js';
import { AUTO_METEN2_VORMEN } from './auto-meten2.js';
import { muntenTellen, totaalprijs, wisselgeld, geldOmzetten, eurocentVergelijken, EUROCENT_VORMEN, metNotatie } from './geld.js';

export const HANDGEMAAKTE_GENERATORS = [
  // Getallen
  vergelijken, ordenen, getallenasInvullen, splitsen, plaatswaarde, ...GETALLEN_VORMEN,
  // Bewerkingen
  optellen, ...OPTELLEN_VORMEN, aftrekken, ...AFTREKKEN_VORMEN, maaltafels, ...MAALTAFEL_VORMEN, vermenigvuldigenDelen, ...MAALDEEL_VORMEN,
  // Meten: lengte, gewicht, tijd en geld
  lengtematenOmzetten, lengtematenVergelijken, lengteAflezen, ...LENGTE_VORMEN,
  massaOmzetten, massaVergelijken, weegschaalAflezen, weegschaalTekenen, weegschaalKies, weegschaalJuistFout, weegschaalFout, ...MASSA_VORMEN,
  klokAflezen, klokTekenen, tijdsduurOmzetten, tijdsduurVergelijken, ...TIJDSDUUR_VORMEN, tijdsduurBerekenen, dagenBerekenen, ...TIJD_VORMEN,
  ...[muntenTellen, totaalprijs, wisselgeld].map(metNotatie), geldOmzetten, eurocentVergelijken, ...EUROCENT_VORMEN, ...GELD_VORMEN.map(metNotatie),
  // Breuken
  ...BREUK_VORMEN,
];

// Automatisch gekoppelde families (zie ../classificatie.js en ../auto-doelen.js)
export const AUTO_GENERATORS = [
  ...EIGENSCHAPPEN_VORMEN,
  ...AUTO_GETALLEN_VORMEN,
  ...AUTO_RATIONAAL_VORMEN,
  ...AUTO_REKENEN_VORMEN,
  ...AUTO_METEN_VORMEN,
  ...AUTO_STATISTIEK_VORMEN,
  ...AUTO_VRAAGSTUKKEN_VORMEN,
  ...STIP_VORMEN,
  ...CIJFER_VORMEN,
  ...AUTO_MEETKUNDE_VORMEN,
  ...AUTO_MEETKUNDE2_VORMEN,
  ...AUTO_METEN2_VORMEN, ...AUTO_METEN3_VORMEN, ...AUTO_GETALLEN2_VORMEN, ...AUTO_BEGRIPPEN_VORMEN, ...AUTO_VORMLEER_VORMEN, ...AUTO_REST_VORMEN, ...AUTO_AFWERKING_VORMEN, ...AUTO_AFWERKING2_VORMEN, ...AUTO_AFWERKING3_VORMEN, ...AUTO_AFWERKING4_VORMEN,
];

export const ECHTE_GENERATORS = [...HANDGEMAAKTE_GENERATORS, ...AUTO_GENERATORS];
