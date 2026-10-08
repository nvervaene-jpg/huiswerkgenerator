// Woordenlijst voor verenkelen en verdubbelen. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [enkelvoud, meervoud in lettergrepen, frequent?]
//   - VERDUBBELEN: korte klinker + één medeklinker. In het meervoud komt er een medeklinker bij: man -> man-nen
//   - VERENKELEN : lange klinker (aa, ee, oo, uu) + één medeklinker. In het meervoud valt er een klinker weg: maan -> ma-nen
//   - Zet een 1 achteraan voor een heel frequent woord (eenvoudigste oefeningen, 2de leerjaar).
// Kies enkel regelmatige woorden. Dus géén dak -> daken, glas -> glazen, stad -> steden, lid -> leden
// (daar verandert ook de klank of de medeklinker) en geen woorden met s/z- of f/v-wissel (huis, neef, doos).
// De tests in tests/taal.test.mjs controleren elke regel van deze lijst.

export const VERDUBBELEN = [
  // meervoud van twee lettergrepen
  ['man', 'man-nen', 1], ['kat', 'kat-ten', 1], ['bal', 'bal-len', 1], ['pen', 'pen-nen', 1], ['bom', 'bom-men', 1],
  ['bus', 'bus-sen', 1], ['bed', 'bed-den', 1], ['kip', 'kip-pen', 1], ['pop', 'pop-pen', 1], ['pot', 'pot-ten', 1],
  ['pan', 'pan-nen', 1], ['kop', 'kop-pen', 1], ['mes', 'mes-sen', 1], ['vis', 'vis-sen', 1], ['zak', 'zak-ken', 1],
  ['sok', 'sok-ken', 1], ['rok', 'rok-ken', 1], ['kam', 'kam-men', 1], ['jas', 'jas-sen', 1], ['tas', 'tas-sen', 1],
  ['put', 'put-ten', 1], ['pet', 'pet-ten', 1], ['tak', 'tak-ken', 1], ['ram', 'ram-men', 1], ['bril', 'bril-len', 1], ['hen', 'hen-nen', 1],
  ['ton', 'ton-nen', 1], ['les', 'les-sen', 1], ['lip', 'lip-pen', 1], ['knop', 'knop-pen', 1], ['trom', 'trom-men'], ['mol', 'mol-len', 1],
  ['mug', 'mug-gen'], ['vlag', 'vlag-gen', 1], ['fles', 'fles-sen', 1], ['hut', 'hut-ten', 1], ['kus', 'kus-sen', 1], ['bak', 'bak-ken', 1],
  ['dop', 'dop-pen', 1], ['gom', 'gom-men'], ['mus', 'mus-sen'], ['nek', 'nek-ken'], ['bek', 'bek-ken'], ['bos', 'bos-sen', 1],
  ['bes', 'bes-sen'], ['wip', 'wip-pen'], ['pit', 'pit-ten'], ['pak', 'pak-ken', 1],
  // meervoud van drie of meer lettergrepen
  ['ballon', 'bal-lon-nen'], ['ananas', 'a-na-nas-sen'], ['matras', 'ma-tras-sen'], ['prinses', 'prin-ses-sen'],
  ['vriendin', 'vrien-din-nen'], ['buurman', 'buur-man-nen'], ['sneeuwpop', 'sneeuw-pop-pen'], ['koningin', 'ko-nin-gin-nen'],
  ['leeuwin', 'leeu-win-nen'], ['dinosaurus', 'di-no-sau-rus-sen'], ['kanon', 'ka-non-nen'], ['atlas', 'at-las-sen'],
  ['heldin', 'hel-din-nen'], ['timmerman', 'tim-mer-man-nen'], ['brandweerman', 'brand-weer-man-nen'], ['boterham', 'bo-ter-ham-men'],
  ['voetbal', 'voet-bal-len'], ['walvis', 'wal-vis-sen'], ['bruinvis', 'bruin-vis-sen'], ['zonnebril', 'zon-ne-bril-len'],
  ['regenjas', 're-gen-jas-sen'], ['zeemeermin', 'zee-meer-min-nen'], ['tuinman', 'tuin-man-nen'], ['luchtballon', 'lucht-bal-lon-nen'],
  ['basketbal', 'bas-ket-bal-len'],
];

export const VERENKELEN = [
  // meervoud van twee lettergrepen
  ['maan', 'ma-nen', 1], ['haan', 'ha-nen', 1], ['raam', 'ra-men', 1], ['naam', 'na-men', 1], ['maat', 'ma-ten', 1],
  ['straat', 'stra-ten', 1], ['taal', 'ta-len', 1], ['been', 'be-nen', 1], ['steen', 'ste-nen', 1], ['boom', 'bo-men', 1],
  ['boot', 'bo-ten', 1], ['poot', 'po-ten', 1], ['school', 'scho-len', 1], ['kool', 'ko-len', 1], ['uur', 'u-ren', 1],
  ['muur', 'mu-ren', 1], ['buur', 'bu-ren', 1], ['week', 'we-ken', 1], ['taak', 'ta-ken', 1], ['baan', 'ba-nen', 1],
  ['laan', 'la-nen', 1], ['graat', 'gra-ten', 1], ['daad', 'da-den', 1], ['zaad', 'za-den', 1], ['haak', 'ha-ken', 1], ['kaak', 'ka-ken'],
  ['paal', 'pa-len', 1], ['zaal', 'za-len', 1], ['steel', 'ste-len', 1], ['veer', 've-ren', 1], ['meer', 'me-ren', 1], ['deel', 'de-len', 1],
  ['beek', 'be-ken', 1], ['hoop', 'ho-pen', 1], ['brood', 'bro-den', 1], ['vloot', 'vlo-ten'], ['toon', 'to-nen', 1], ['troon', 'tro-nen'],
  ['vuur', 'vu-ren', 1], ['schuur', 'schu-ren'], ['zoon', 'zo-nen', 1],
  // meervoud van drie of meer lettergrepen
  ['banaan', 'ba-na-nen'], ['tomaat', 'to-ma-ten'], ['soldaat', 'sol-da-ten'], ['piloot', 'pi-lo-ten'], ['planeet', 'pla-ne-ten'],
  ['magneet', 'mag-ne-ten'], ['kameel', 'ka-me-len'], ['vulkaan', 'vul-ka-nen'], ['schoorsteen', 'schoor-ste-nen'],
  ['telefoon', 'te-le-fo-nen'], ['kanaal', 'ka-na-len'], ['garnaal', 'gar-na-len'], ['ijsbeer', 'ijs-be-ren'],
  ['stoomboot', 'stoom-bo-ten'], ['kameraad', 'ka-me-ra-den'], ['fantoom', 'fan-to-men'], ['kleuterschool', 'kleu-ter-scho-len'],
  ['basisschool', 'ba-sis-scho-len'], ['hoofdstraat', 'hoofd-stra-ten'], ['zwembaan', 'zwem-ba-nen'], ['gymzaal', 'gym-za-len'],
  ['ijsbaan', 'ijs-ba-nen'], ['kerstboom', 'kerst-bo-men'], ['appelboom', 'ap-pel-bo-men'], ['zeilboot', 'zeil-bo-ten'],
  ['voornaam', 'voor-na-men'], ['bijnaam', 'bij-na-men'], ['speelzaal', 'speel-za-len'],
];

// 'man-nen' -> { enkelvoud: 'man', meervoud: 'mannen', delen: ['man','nen'], lettergrepen: 2, soort, frequent }
function maak(soort, [enkelvoud, delenTekst, frequent]) {
  const delen = delenTekst.split('-');
  return { enkelvoud, meervoud: delen.join(''), delen, lettergrepen: delen.length, soort, frequent: !!frequent };
}
export const WOORDEN = [...VERDUBBELEN.map(w => maak('verdubbelen', w)), ...VERENKELEN.map(w => maak('verenkelen', w))];

// Het foute meervoud dat een leerling schrijft als hij de regel niet toepast.
export function foutMeervoud(w) {
  return w.enkelvoud + 'en';                       // man -> manen (niet verdubbeld), maan -> maanen (niet verenkeld)
}
