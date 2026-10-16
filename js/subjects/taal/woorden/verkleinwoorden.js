// Woordenlijst voor verkleinwoorden. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [grondwoord, verkleinwoord in lettergrepen, frequent?]   (zet een 1 achteraan voor een heel frequent woord)
// De lijst is verdeeld per uitgang:
//   je     na b, d, f, g, k, p, s, t, v, z en ch (boek - boekje, boot - bootje)
//   tje    na een lange klinker of tweeklank + l, n, r, of na een klinker (maan - maantje, deur - deurtje, ei - eitje)
//   pje    na m (boom - boompje, arm - armpje)
//   etje   na een korte klinker + l, n, r, m, ng (man - mannetje, ring - ringetje)
//   kje    na onbeklemtoond -ing (koning - koninkje)
//   aatje, ootje, uutje   na een a, o of u (sofa - sofaatje, auto - autootje, menu - menuutje)
// Onregelmatige verkleinwoorden (jongen - jongetje, glas - glaasje) horen hier niet bij.
// De tests in tests/taal.test.mjs controleren elke regel van deze lijst.
import { leesWoorden } from '../generators/woordvormen.js';

export const VERKLEINWOORDEN = {
  je: [
    ['boek', 'boek-je', 1], ['kip', 'kip-je', 1], ['hand', 'hand-je', 1], ['bed', 'bed-je', 1], ['dak', 'dak-je', 1], ['kop', 'kop-je', 1],
    ['huis', 'huis-je', 1], ['poes', 'poes-je', 1], ['kaas', 'kaas-je', 1], ['bak', 'bak-je', 1], ['boot', 'boot-je', 1], ['hoed', 'hoed-je', 1],
    ['jas', 'jas-je', 1], ['bus', 'bus-je', 1], ['hond', 'hond-je', 1], ['kaart', 'kaart-je', 1], ['pet', 'pet-je', 1], ['vis', 'vis-je', 1],
    ['zak', 'zak-je', 1], ['taart', 'taart-je', 1], ['stok', 'stok-je', 1], ['tas', 'tas-je', 1], ['pot', 'pot-je', 1], ['mand', 'mand-je', 1],
    ['wolk', 'wolk-je', 1], ['vork', 'vork-je', 1], ['lamp', 'lamp-je', 1], ['tent', 'tent-je', 1], ['bord', 'bord-je', 1], ['stuk', 'stuk-je', 1],
    ['brood', 'brood-je', 1], ['kast', 'kast-je', 1], ['koek', 'koek-je', 1], ['dag', 'dag-je', 1], ['vlag', 'vlag-je', 1], ['poort', 'poort-je', 1],
    ['kat', 'kat-je', 1], ['pop', 'pop-je', 1],
  ],
  tje: [
    ['maan', 'maan-tje', 1], ['deur', 'deur-tje', 1], ['school', 'school-tje', 1], ['stoel', 'stoel-tje', 1], ['trein', 'trein-tje', 1],
    ['boer', 'boer-tje', 1], ['haan', 'haan-tje', 1], ['been', 'been-tje', 1], ['steen', 'steen-tje', 1], ['vuur', 'vuur-tje', 1],
    ['kool', 'kool-tje', 1], ['paal', 'paal-tje', 1], ['veer', 'veer-tje', 1], ['zaal', 'zaal-tje', 1], ['tuin', 'tuin-tje', 1],
    ['lijn', 'lijn-tje', 1], ['pijn', 'pijn-tje', 1], ['muur', 'muur-tje', 1], ['ei', 'ei-tje', 1], ['bij', 'bij-tje', 1], ['knie', 'knie-tje', 1],
    ['zee', 'zee-tje', 1],
  ],
  pje: [
    ['boom', 'boom-pje', 1], ['bloem', 'bloem-pje', 1], ['raam', 'raam-pje', 1], ['arm', 'arm-pje', 1], ['duim', 'duim-pje', 1],
    ['room', 'room-pje', 1], ['worm', 'worm-pje', 1], ['riem', 'riem-pje', 1], ['film', 'film-pje', 1],
  ],
  etje: [
    ['man', 'man-ne-tje', 1], ['bal', 'bal-le-tje', 1], ['pen', 'pen-ne-tje', 1], ['ton', 'ton-ne-tje', 1], ['zon', 'zon-ne-tje', 1],
    ['kam', 'kam-me-tje', 1], ['bom', 'bom-me-tje', 1], ['bel', 'bel-le-tje', 1], ['hen', 'hen-ne-tje', 1], ['tol', 'tol-le-tje', 1],
    ['bril', 'bril-le-tje', 1], ['ring', 'rin-ge-tje', 1], ['kar', 'kar-re-tje', 1], ['ster', 'ster-re-tje', 1], ['pan', 'pan-ne-tje', 1],
    ['mol', 'mol-le-tje'], ['ram', 'ram-me-tje'], ['trom', 'trom-me-tje'], ['pil', 'pil-le-tje'], ['zang', 'zan-ge-tje'], ['vlam', 'vlam-me-tje'],
    ['stem', 'stem-me-tje'], ['spin', 'spin-ne-tje'], ['kin', 'kin-ne-tje'], ['tor', 'tor-re-tje'],
  ],
  kje: [
    ['koning', 'ko-nin-kje'], ['honing', 'ho-nin-kje'], ['woning', 'wo-nin-kje'], ['ketting', 'ket-tin-kje'], ['pudding', 'pud-din-kje'],
    ['haring', 'ha-rin-kje'], ['wandeling', 'wan-de-lin-kje'],
  ],
  aatje: [
    ['sofa', 'so-faa-tje'], ['pizza', 'piz-zaa-tje'], ['villa', 'vil-laa-tje'], ['zebra', 'ze-braa-tje'], ['opa', 'o-paa-tje'],
    ['oma', 'o-maa-tje'], ['papa', 'pa-paa-tje'], ['mama', 'ma-maa-tje'],
  ],
  ootje: [
    ['auto', 'au-too-tje'], ['foto', 'fo-too-tje'], ['piano', 'pi-a-noo-tje'], ['kano', 'ka-noo-tje'], ['disco', 'dis-coo-tje'],
    ['kilo', 'ki-loo-tje'], ['radio', 'ra-di-oo-tje'], ['video', 'vi-de-oo-tje'],
  ],
  uutje: [
    ['paraplu', 'pa-ra-pluu-tje'], ['menu', 'me-nuu-tje'], ['tutu', 'tu-tuu-tje'], ['guru', 'gu-ruu-tje'], ['gnu', 'gnuu-tje'],
  ],
};

// De fout die een leerling maakt: bij -je woorden een extra t (boek - boektje), bij -aatje/-ootje/-uutje enkel -tje (auto - autotje),
// bij de andere woorden gewoon -je (maan - maanje, man - manje).
export const foutVerkleinwoord = (w) => w.van + (['je', 'aatje', 'ootje', 'uutje'].includes(w.soort) ? 'tje' : 'je');
export const WOORDEN = leesWoorden(VERKLEINWOORDEN, foutVerkleinwoord);
