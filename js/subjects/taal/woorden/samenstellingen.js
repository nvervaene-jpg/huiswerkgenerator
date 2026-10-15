// Woordenlijst voor samenstellingen. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [eerste woord, tweede woord, frequent?]   bv. ['boek', 'kast', 1]  ->  boekkast
// Een samenstelling schrijf je aan elkaar, ook als de laatste letter van het eerste woord gelijk is aan de eerste letter van het tweede
// (boekkast, tafellaken: dan blijven beide letters staan). Hier staan enkel samenstellingen waarbij je de twee woorden gewoon aan elkaar plakt
// (dus zonder tussen-n of tussen-s).
//   gewoon   de twee woorden plakken aan elkaar (zandbak)                         GL2.24 (frequent) en GL4.35
//   dubbel   het eerste woord eindigt op dezelfde letter als het tweede begint    GL3.14 en GL4.35
// De tests in tests/taal.test.mjs controleren dat elke regel klopt.

export const SAMENSTELLINGEN = {
  gewoon: [
    ['zand', 'bak', 1], ['regen', 'jas', 1], ['tand', 'pasta', 1], ['school', 'bord', 1], ['fiets', 'band', 1], ['speel', 'plaats', 1],
    ['voet', 'bal', 1], ['hand', 'tas', 1], ['school', 'tas', 1], ['bloem', 'pot', 1], ['sneeuw', 'man', 1], ['hand', 'schoen', 1],
    ['speel', 'goed', 1], ['huis', 'dier', 1], ['school', 'bus', 1], ['regen', 'boog'], ['sneeuw', 'bal'], ['was', 'machine'],
    ['vuilnis', 'bak'], ['kleur', 'potlood'], ['brandweer', 'auto'], ['zak', 'mes'], ['boter', 'ham'], ['eet', 'zaal'], ['pannen', 'koek'],
    ['kerst', 'boom'], ['tuin', 'stoel'], ['klas', 'lokaal'], ['pret', 'park'], ['strand', 'stoel'],
  ],
  dubbel: [
    ['boek', 'kast', 1], ['melk', 'kan', 1], ['bus', 'station', 1], ['zand', 'duin', 1], ['tafel', 'laken', 1], ['deur', 'rand', 1],
    ['stoel', 'leuning', 1], ['huis', 'sleutel', 1], ['hand', 'doek', 1], ['hoofd', 'doek', 1], ['fiets', 'stalling', 1],
    ['ijs', 'schots'], ['kook', 'kunst'], ['kerk', 'klok'], ['huis', 'stijl'], ['vlees', 'schotel'], ['tafel', 'loper'], ['school', 'liedje'],
  ],
};

// De fout die een leerling maakt: de dubbele letter maar één keer schrijven (boekast), of de woorden los laten staan (zand bak).
export function foutSamenstelling(w) {
  if (w.soort === 'dubbel') return w.delen[0] + w.delen[1].slice(1);
  return `${w.delen[0]} ${w.delen[1]}`;
}
