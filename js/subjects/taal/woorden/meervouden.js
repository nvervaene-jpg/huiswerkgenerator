// Woordenlijst voor meervouden op -en, -s, 's en -eren. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [enkelvoud, meervoud in lettergrepen, frequent?]   (zet een 1 achteraan voor een heel frequent woord)
//   en    de meeste woorden: hond - honden
//   s     woorden op onbeklemtoond -el, -em, -en, -er, -aar: tafel - tafels, dokter - dokters
//   's    woorden die eindigen op a, o, u, i of y: foto - foto's, baby - baby's
//   eren  enkele woorden: kind - kinderen, ei - eieren
// Hier staan geen woorden waarbij ook de klinker of medeklinker verandert (dat is verenkelen/verdubbelen, of
// brief - brieven, huis - huizen) en geen woorden waarvan de fout toevallig een ander bestaand woord is.
// De tests in tests/taal.test.mjs controleren elke regel van deze lijst.
import { leesWoorden } from '../generators/woordvormen.js';

export const MEERVOUDEN = {
  en: [
    ['hond', 'hon-den', 1], ['hand', 'han-den', 1], ['boek', 'boe-ken', 1], ['stoel', 'stoe-len', 1], ['kast', 'kas-ten', 1],
    ['tent', 'ten-ten', 1], ['bord', 'bor-den', 1], ['mand', 'man-den', 1], ['wolk', 'wol-ken', 1], ['vork', 'vor-ken', 1],
    ['lamp', 'lam-pen', 1], ['deur', 'deu-ren', 1], ['trein', 'trei-nen', 1], ['tand', 'tan-den', 1], ['arm', 'ar-men', 1],
    ['dier', 'die-ren', 1], ['bank', 'ban-ken', 1], ['ring', 'rin-gen', 1], ['broek', 'broe-ken', 1], ['vriend', 'vrien-den', 1],
    ['pijp', 'pij-pen'], ['jurk', 'jur-ken'], ['kaart', 'kaar-ten'], ['koek', 'koe-ken'], ['riem', 'rie-men'], ['tuin', 'tui-nen'],
    ['tong', 'ton-gen'], ['koning', 'ko-nin-gen'], ['tekening', 'te-ke-nin-gen'], ['maand', 'maan-den'],
  ],
  s: [
    ['tafel', 'ta-fels', 1], ['vogel', 'vo-gels', 1], ['appel', 'ap-pels', 1], ['lepel', 'le-pels', 1], ['dokter', 'dok-ters', 1],
    ['vader', 'va-ders', 1], ['moeder', 'moe-ders', 1], ['bakker', 'bak-kers', 1], ['kamer', 'ka-mers', 1], ['sleutel', 'sleu-tels', 1],
    ['jongen', 'jon-gens', 1], ['kikker', 'kik-kers', 1], ['vlinder', 'vlin-ders', 1],
    ['engel', 'en-gels'], ['kussen', 'kus-sens'], ['bezem', 'be-zems'], ['ketel', 'ke-tels'], ['koffer', 'kof-fers'],
    ['ridder', 'rid-ders'], ['wagen', 'wa-gens'], ['bezoeker', 'be-zoe-kers'], ['mantel', 'man-tels'],
  ],
  "'s": [
    ['auto', "au-to's", 1], ['foto', "fo-to's", 1], ['paraplu', "pa-ra-plu's", 1], ['baby', "ba-by's", 1], ['taxi', "ta-xi's", 1],
    ['sofa', "so-fa's", 1], ['opa', "o-pa's", 1], ['oma', "o-ma's", 1], ['pizza', "piz-za's", 1], ['zebra', "ze-bra's", 1],
    ['radio', "ra-di-o's"], ['ski', "ski's"], ['menu', "me-nu's"], ['piano', "pi-a-no's"], ['kilo', "ki-lo's"], ['lolly', "lol-ly's"],
    ['hobby', "hob-by's"], ['mama', "ma-ma's"], ['papa', "pa-pa's"],
  ],
  eren: [
    ['kind', 'kin-de-ren', 1], ['ei', 'ei-e-ren', 1], ['rund', 'run-de-ren'],
  ],
};

// De fout die een leerling maakt: -s zonder apostrof (foto - fotos), -en bij -s woorden (tafel - tafelen), -s bij -en woorden (hond - honds).
export const foutMeervoud = (w) => (w.soort === 's' || w.soort === 'eren' ? w.van + 'en' : w.soort === "'s" ? w.van + 's' : w.van + 's');
export const WOORDEN = leesWoorden(MEERVOUDEN, foutMeervoud);
