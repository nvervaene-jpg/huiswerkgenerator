// Woordenlijst voor woorden die eindigen op -d, -t, -p of -b. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [meervoud, enkelvoud, frequent?]   bv. ['honden', 'hond', 1]
// De leerling hoort de laatste klank van 'hond' als een t, maar verlengt het woord (honden) en hoort dan de d.
//   d    hond - honden       t    kat - katten       p    kip - kippen       b    web - webben
// Kies enkel woorden waarvan het meervoud gewoon -en (of een verdubbelde medeklinker + en) is.
// Dus géén woorden zoals stad - steden of schip - schepen (daar verandert ook de klinker).
// Zet een 1 achteraan voor een heel frequent woord (eenvoudigste oefeningen).
// De tests in tests/taal.test.mjs controleren elke regel van deze lijst.
import { leesWoorden } from '../generators/woordvormen.js';

export const EINDLETTERS = {
  d: [
    ['honden', 'hond', 1], ['handen', 'hand', 1], ['manden', 'mand', 1], ['borden', 'bord', 1], ['woorden', 'woord', 1],
    ['landen', 'land', 1], ['monden', 'mond', 1], ['hoeden', 'hoed', 1], ['bedden', 'bed', 1], ['vrienden', 'vriend', 1],
    ['winden', 'wind', 1], ['maanden', 'maand', 1], ['paarden', 'paard', 1], ['hemden', 'hemd', 1], ['velden', 'veld', 1], ['schilden', 'schild'],
    ['zwaarden', 'zwaard'], ['tanden', 'tand', 1], ['banden', 'band', 1], ['randen', 'rand'],
  ],
  t: [
    ['katten', 'kat', 1], ['petten', 'pet', 1], ['potten', 'pot', 1], ['tenten', 'tent', 1], ['kasten', 'kast', 1],
    ['netten', 'net', 1], ['matten', 'mat', 1], ['putten', 'put', 1], ['vlotten', 'vlot'], ['schatten', 'schat'], ['botten', 'bot'],
    ['hutten', 'hut'], ['teksten', 'tekst'], ['kisten', 'kist'], ['nesten', 'nest', 1], ['posten', 'post'], ['kusten', 'kust'], ['borsten', 'borst'], ['worsten', 'worst', 1],
    ['punten', 'punt', 1], ['kranten', 'krant', 1], ['planten', 'plant'], ['wanten', 'want'], ['munten', 'munt', 1],
  ],
  p: [
    ['kippen', 'kip', 1], ['poppen', 'pop', 1], ['lippen', 'lip', 1], ['knoppen', 'knop', 1], ['lampen', 'lamp', 1],
    ['stappen', 'stap', 1], ['pijpen', 'pijp', 1], ['trappen', 'trap', 1],
    ['klappen', 'klap', 1], ['mappen', 'map', 1], ['sappen', 'sap'], ['doppen', 'dop', 1], ['tippen', 'tip'], ['soepen', 'soep'], ['stoppen', 'stop', 1], ['kappen', 'kap', 1], ['schoppen', 'schop'], ['proppen', 'prop'], ['strippen', 'strip'], ['happen', 'hap'],
  ],
  b: [
    ['webben', 'web', 1], ['ribben', 'rib'], ['krabben', 'krab'],
  ],
};

// De fout die een leerling maakt: hij schrijft wat hij hoort (hont, kad, kib, wep).
const OMGEZET = { d: 't', t: 'd', p: 'b', b: 'p' };
export const foutEnkelvoud = (w) => w.naar.slice(0, -1) + OMGEZET[w.soort];
export const WOORDEN = leesWoorden(EINDLETTERS, foutEnkelvoud);
