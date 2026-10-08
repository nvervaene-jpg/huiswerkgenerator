// Contexten voor vraagstukjes en referentiematen. Dit bestand mag je gerust aanpassen of uitbreiden.
//
// lengte: { onderwerp: 'een slang', bepaald: 'de slang', dim: 'lang', cm: [min, max] }
//   - onderwerp: met 'een' (voor "Een slang is ... lang."), bepaald: met 'de' of 'het' (voor antwoorden)
//   - dim: 'lang', 'hoog' of 'breed' (bepaalt ook "het langst/hoogst/breedst")
//   - cm: realistische lengte in centimeter (de generator kiest een getal binnen dit bereik)

export const THEMAS = {
  dieren: {
    naam: 'Dieren',
    lengte: [
      { onderwerp: 'een slang', bepaald: 'de slang', dim: 'lang', cm: [50, 300] },
      { onderwerp: 'een krokodil', bepaald: 'de krokodil', dim: 'lang', cm: [200, 500] },
      { onderwerp: 'een giraf', bepaald: 'de giraf', dim: 'hoog', cm: [400, 550] },
      { onderwerp: 'een olifant', bepaald: 'de olifant', dim: 'hoog', cm: [250, 350] },
      { onderwerp: 'een muis', bepaald: 'de muis', dim: 'lang', cm: [5, 10] },
      { onderwerp: 'een konijn', bepaald: 'het konijn', dim: 'lang', cm: [30, 50] },
    ],
  },
  speelplaats: {
    naam: 'Speelplaats',
    lengte: [
      { onderwerp: 'een glijbaan', bepaald: 'de glijbaan', dim: 'lang', cm: [200, 400] },
      { onderwerp: 'een springtouw', bepaald: 'het springtouw', dim: 'lang', cm: [200, 300] },
      { onderwerp: 'een zandbak', bepaald: 'de zandbak', dim: 'breed', cm: [200, 400] },
      { onderwerp: 'een speelplaats', bepaald: 'de speelplaats', dim: 'lang', cm: [2000, 5000] },
      { onderwerp: 'een bank', bepaald: 'de bank', dim: 'lang', cm: [150, 250] },
    ],
  },
  keuken: {
    naam: 'Keuken',
    lengte: [
      { onderwerp: 'een lepel', bepaald: 'de lepel', dim: 'lang', cm: [15, 25] },
      { onderwerp: 'een bakplaat', bepaald: 'de bakplaat', dim: 'lang', cm: [30, 45] },
      { onderwerp: 'een keukentafel', bepaald: 'de keukentafel', dim: 'lang', cm: [120, 200] },
      { onderwerp: 'een koelkast', bepaald: 'de koelkast', dim: 'hoog', cm: [150, 190] },
      { onderwerp: 'een wortel', bepaald: 'de wortel', dim: 'lang', cm: [10, 25] },
    ],
  },
  sprookjes: {
    naam: 'Sprookjes',
    lengte: [
      { onderwerp: 'een bonenstaak', bepaald: 'de bonenstaak', dim: 'hoog', cm: [2000, 5000] },
      { onderwerp: 'de toren van Rapunzel', bepaald: 'de toren van Rapunzel', dim: 'hoog', cm: [1500, 3000] },
      { onderwerp: 'de neus van Pinokkio', bepaald: 'de neus van Pinokkio', dim: 'lang', cm: [20, 100] },
      { onderwerp: 'een tovenaarsstaf', bepaald: 'de tovenaarsstaf', dim: 'lang', cm: [150, 200] },
      { onderwerp: 'de mantel van de koning', bepaald: 'de mantel van de koning', dim: 'lang', cm: [150, 300] },
    ],
  },
  winkel: {
    naam: 'Winkel',
    lengte: [
      { onderwerp: 'een lint', bepaald: 'het lint', dim: 'lang', cm: [50, 300] },
      { onderwerp: 'een toonbank', bepaald: 'de toonbank', dim: 'lang', cm: [150, 300] },
      { onderwerp: 'een stuk stof', bepaald: 'het stuk stof', dim: 'lang', cm: [100, 400] },
      { onderwerp: 'een winkelrek', bepaald: 'het winkelrek', dim: 'hoog', cm: [100, 250] },
      { onderwerp: 'een broodplank', bepaald: 'de broodplank', dim: 'lang', cm: [30, 60] },
    ],
  },
  sport: {
    naam: 'Sport',
    lengte: [
      { onderwerp: 'een voetbaldoel', bepaald: 'het voetbaldoel', dim: 'breed', cm: [500, 750] },
      { onderwerp: 'een zwembad', bepaald: 'het zwembad', dim: 'lang', cm: [2500, 5000] },
      { onderwerp: 'een tennisracket', bepaald: 'het tennisracket', dim: 'lang', cm: [60, 70] },
      { onderwerp: 'een hoogspringlat', bepaald: 'de hoogspringlat', dim: 'lang', cm: [300, 400] },
      { onderwerp: 'een basketbalpaal', bepaald: 'de basketbalpaal', dim: 'hoog', cm: [300, 400] },
    ],
  },
  boerderij: {
    naam: 'Boerderij',
    lengte: [
      { onderwerp: 'een stal', bepaald: 'de stal', dim: 'lang', cm: [1000, 3000] },
      { onderwerp: 'een tractor', bepaald: 'de tractor', dim: 'lang', cm: [300, 600] },
      { onderwerp: 'een koe', bepaald: 'de koe', dim: 'lang', cm: [200, 300] },
      { onderwerp: 'een hek', bepaald: 'het hek', dim: 'lang', cm: [300, 1000] },
      { onderwerp: 'een strobaal', bepaald: 'de strobaal', dim: 'lang', cm: [100, 150] },
    ],
  },
  school: {
    naam: 'School',
    lengte: [
      { onderwerp: 'een klas', bepaald: 'de klas', dim: 'lang', cm: [600, 1000] },
      { onderwerp: 'een schoolbord', bepaald: 'het schoolbord', dim: 'breed', cm: [200, 400] },
      { onderwerp: 'een potlood', bepaald: 'het potlood', dim: 'lang', cm: [15, 20] },
      { onderwerp: 'een liniaal', bepaald: 'de liniaal', dim: 'lang', cm: [20, 30] },
      { onderwerp: 'een gang', bepaald: 'de gang', dim: 'lang', cm: [1000, 3000] },
    ],
  },
};

export const THEMA_KEUZES = [['gemengd', 'Gemengd'], ...Object.entries(THEMAS).map(([k, t]) => [k, t.naam])];

// Namen voor kinderen in de zinnen.
export const NAMEN = ['Anna', 'Bram', 'Chloë', 'Daan', 'Emma', 'Finn', 'Lotte', 'Milan', 'Noor', 'Sam', 'Yara', 'Jens'];

// Referentiematen: "Een potlood is ongeveer 18 cm lang." (getal en eenheid zijn wat een mens zou zeggen)
export const REFERENTIE_LENGTE = [
  { onderwerp: 'een potlood', dim: 'lang', getal: 18, eenheid: 'cm', thema: 'school' },
  { onderwerp: 'een liniaal', dim: 'lang', getal: 30, eenheid: 'cm', thema: 'school' },
  { onderwerp: 'een deur', dim: 'hoog', getal: 2, eenheid: 'm', thema: 'school' },
  { onderwerp: 'een klas', dim: 'lang', getal: 8, eenheid: 'm', thema: 'school' },
  { onderwerp: 'een gang', dim: 'lang', getal: 20, eenheid: 'm', thema: 'school' },
  { onderwerp: 'een schooltafel', dim: 'breed', getal: 7, eenheid: 'dm', thema: 'school' },
  { onderwerp: 'een hand', dim: 'breed', getal: 1, eenheid: 'dm', thema: 'dieren' },
  { onderwerp: 'een giraf', dim: 'hoog', getal: 5, eenheid: 'm', thema: 'dieren' },
  { onderwerp: 'een muis', dim: 'lang', getal: 8, eenheid: 'cm', thema: 'dieren' },
  { onderwerp: 'een slang', dim: 'lang', getal: 2, eenheid: 'm', thema: 'dieren' },
  { onderwerp: 'een konijn', dim: 'lang', getal: 4, eenheid: 'dm', thema: 'dieren' },
  { onderwerp: 'een glijbaan', dim: 'lang', getal: 3, eenheid: 'm', thema: 'speelplaats' },
  { onderwerp: 'een speelplaats', dim: 'lang', getal: 40, eenheid: 'm', thema: 'speelplaats' },
  { onderwerp: 'een springtouw', dim: 'lang', getal: 25, eenheid: 'dm', thema: 'speelplaats' },
  { onderwerp: 'een lepel', dim: 'lang', getal: 20, eenheid: 'cm', thema: 'keuken' },
  { onderwerp: 'een koelkast', dim: 'hoog', getal: 17, eenheid: 'dm', thema: 'keuken' },
  { onderwerp: 'een keukentafel', dim: 'lang', getal: 15, eenheid: 'dm', thema: 'keuken' },
  { onderwerp: 'een tennisracket', dim: 'lang', getal: 68, eenheid: 'cm', thema: 'sport' },
  { onderwerp: 'een zwembad', dim: 'lang', getal: 25, eenheid: 'm', thema: 'sport' },
  { onderwerp: 'een voetbalveld', dim: 'lang', getal: 100, eenheid: 'm', thema: 'sport' },
  { onderwerp: 'een koe', dim: 'lang', getal: 25, eenheid: 'dm', thema: 'boerderij' },
  { onderwerp: 'een tractor', dim: 'lang', getal: 4, eenheid: 'm', thema: 'boerderij' },
  { onderwerp: 'een strobaal', dim: 'lang', getal: 12, eenheid: 'dm', thema: 'boerderij' },
  { onderwerp: 'een tovenaarsstaf', dim: 'lang', getal: 18, eenheid: 'dm', thema: 'sprookjes' },
  { onderwerp: 'de bonenstaak van Jack', dim: 'hoog', getal: 30, eenheid: 'm', thema: 'sprookjes' },
  { onderwerp: 'een lint', dim: 'lang', getal: 2, eenheid: 'm', thema: 'winkel' },
  { onderwerp: 'een toonbank', dim: 'lang', getal: 2, eenheid: 'm', thema: 'winkel' },
  { onderwerp: 'een broodplank', dim: 'lang', getal: 45, eenheid: 'cm', thema: 'winkel' },
  { onderwerp: 'de weg naar school', dim: 'lang', getal: 2, eenheid: 'km', thema: 'school' },
  { onderwerp: 'een bruggetje over de beek', dim: 'lang', getal: 5, eenheid: 'm', thema: 'boerderij' },
];
