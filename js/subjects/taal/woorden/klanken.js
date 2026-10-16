// Woordenlijst voor woorden met moeilijke klanken en lettergroepen. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Per soort (de letters die in het woord moeten staan) een lijst: [juist woord, fout woord, frequent?]
//   ['trein', 'trijn', 1]   de leerling kiest tussen ei en ij; 'trijn' is de fout die hij kan maken
// De fout mag geen bestaand woord zijn. Zet een 1 achteraan voor een heel frequent woord (eenvoudigste oefeningen).
// De letters van de soort moeten in het juiste woord staan: de oefening toont 'tr__n' (ei of ij).
// De tests in tests/taal.test.mjs en tests/klanken.test.mjs controleren de samenhang van elke regel.

// groepen: de soorten waaruit de leerling kiest ('regel herkennen')
export const GROEPEN = {
  tweetekens1: ['ie', 'oe', 'eu', 'ui'], tweetekens2: ['ei', 'ij'], tweetekens3: ['ou', 'au'],
  groepen1: ['aai', 'ooi', 'oei'], groepen2: ['eeuw', 'ieuw'], groepen3: ['uw'],
  ngnk: ['ng', 'nk'], chg: ['ch', 'g'], chtgt: ['cht', 'gt'],
  // woorden die anders klinken dan ze geschreven worden (de opties staan zoals de leerling ze zou kunnen schrijven)
  wrvr: ['wr', 'vr'], ing: ['ing', 'ink'], achtervoegsels1: ['ig', 'lijk'], achtervoegsels2: ['heid', 'teit'], tie: ['tie', 'sie'],
  x: ['x', 'ks'], y: ['y', 'i'], qu: ['qu', 'kw'], th: ['th', 't'], c: ['c', 's', 'k'],
  // woorden eindigend op een klinker, en woorden met sch(r)-
  eindA: ['a', 'aa'], eindO: ['o', 'oo'], eindU: ['u', 'uu'], eindEe: ['ee', 'e'], sch: ['sch', 'sk'], schr: ['schr', 'skr'],
};

export const KLANKEN = {
  ei: [['trein', 'trijn', 1], ['klein', 'klijn', 1], ['eiland', 'ijland', 1], ['eind', 'ijnd', 1], ['meisje', 'mijsje', 1], ['geit', 'gijt'], ['zeil', 'zijl'], ['kei', 'kij'], ['seizoen', 'sijzoen'], ['heilig', 'hijlig']],
  ij: [['pijn', 'pein', 1], ['fijn', 'fein', 1], ['lijn', 'lein', 1], ['mijn', 'mein', 1], ['zijn', 'zein', 1], ['tijd', 'teid', 1], ['kijk', 'keik', 1], ['vrij', 'vrei', 1], ['blij', 'blei', 1], ['dijk', 'deik'], ['rijk', 'reik'], ['prijs', 'preis'], ['ijzer', 'eizer'], ['bijl', 'beil'], ['wijn', 'wein'], ['lijst', 'leist']],
  ou: [['koud', 'kaud', 1], ['oud', 'aud', 1], ['hout', 'haut', 1], ['goud', 'gaud', 1], ['bouw', 'bauw', 1], ['zout', 'zaut'], ['touw', 'tauw'], ['vrouw', 'vrauw'], ['mouw', 'mauw'], ['trouw', 'trauw']],
  au: [['auto', 'outo', 1], ['blauw', 'blouw', 1], ['saus', 'sous', 1], ['pauze', 'pouze', 1], ['lauw', 'louw'], ['paus', 'pous'], ['sauna', 'souna'], ['kauwen', 'kouwen'], ['flauw', 'flouw'], ['fauna', 'founa']],
  ie: [['fiets', 'fits', 1], ['vier', 'vir', 1], ['hier', 'hir', 1], ['bier', 'bir', 1], ['dier', 'dir', 1], ['brief', 'brif', 1], ['ziek', 'zik', 1], ['kies', 'kis'], ['lief', 'lif'], ['riem', 'rim']],
  oe: [['boek', 'buk', 1], ['koe', 'ku', 1], ['stoel', 'stul', 1], ['voet', 'vut', 1], ['moe', 'mu', 1], ['hoed', 'hud', 1], ['groen', 'grun', 1], ['zoek', 'zuk'], ['bloem', 'blum'], ['poes', 'pus'], ['goed', 'gud'], ['doek', 'duk']],
  eu: [['neus', 'nuus', 1], ['reus', 'ruus', 1], ['kleur', 'kluur', 1], ['leuk', 'luuk', 1], ['beuk', 'buuk'], ['keus', 'kuus'], ['sleutel', 'sluutel'], ['teug', 'tuug'], ['heup', 'huup']],
  ui: [['huis', 'heis', 1], ['tuin', 'tein', 1], ['uit', 'eit', 1], ['duif', 'deif', 1], ['muis', 'meis', 1], ['kruis', 'kreis'], ['buik', 'beik'], ['sluit', 'sleit'], ['fruit', 'freit'], ['kuiken', 'keiken'], ['ruit', 'reit'], ['druif', 'dreif']],
  aai: [['draai', 'drai', 1], ['kraai', 'krai', 1], ['zwaai', 'zwai', 1], ['saai', 'sai', 1], ['zaai', 'zai']],
  ooi: [['mooi', 'moi', 1], ['nooit', 'noit', 1], ['strooi', 'stroi'], ['dooi', 'doi']],
  oei: [['groei', 'groe', 1], ['bloei', 'bloe', 1], ['roei', 'roe', 1], ['snoei', 'snoe'], ['moeilijk', 'moelijk']],
  eeuw: [['eeuwen', 'eewen', 1], ['leeuw', 'leew', 1], ['sneeuw', 'sneew', 1], ['meeuw', 'meew'], ['schreeuw', 'schreew'], ['geeuw', 'geew']],
  ieuw: [['nieuw', 'niew', 1], ['kieuw', 'kiew', 1], ['nieuws', 'niews', 1], ['nieuwjaar', 'niewjaar'], ['nieuwsgierig', 'niewsgierig'], ['vernieuwen', 'verniewen']],
  uw: [['duw', 'duuw', 1], ['ruw', 'ruuw', 1], ['schuw', 'schuuw', 1], ['sluw', 'sluuw', 1], ['kluwen', 'kluuwen', 1]],
  ng: [['ring', 'rink', 1], ['jong', 'jonk', 1], ['tong', 'tonk', 1], ['ding', 'dink', 1], ['zang', 'zank'], ['long', 'lonk'], ['koning', 'konink'], ['honing', 'honink']],
  nk: [['vink', 'ving', 1], ['plank', 'plang', 1], ['drink', 'dring', 1], ['denk', 'deng', 1], ['dank', 'dang', 1], ['schenk', 'scheng'], ['flink', 'fling'], ['blank', 'blang']],
  ch: [['pech', 'peg', 1], ['zich', 'zig', 1], ['ach', 'ag'], ['och', 'og']],
  g: [['dag', 'dach', 1], ['weg', 'wech', 1], ['berg', 'berch', 1], ['vlag', 'vlach', 1], ['burg', 'burch'], ['vraag', 'vraach'], ['leeg', 'leech'], ['zeg', 'zech']],
  cht: [['nacht', 'nagt', 1], ['zacht', 'zagt', 1], ['licht', 'ligt', 1], ['recht', 'regt', 1], ['lucht', 'lugt', 1], ['kracht', 'kragt', 1], ['macht', 'magt'], ['vlucht', 'vlugt'], ['gracht', 'gragt'], ['dicht', 'digt'], ['vracht', 'vragt']],
  gt: [['zegt', 'zecht', 1], ['legt', 'lecht', 1], ['vraagt', 'vraacht'], ['vliegt', 'vlicht'], ['draagt', 'draacht']],
  wr: [['wrijven', 'vrijven', 1], ['wraak', 'vraak', 1], ['wreed', 'vreed', 1], ['wringen', 'vringen', 1], ['wrok', 'vrok'], ['wrang', 'vrang'], ['wrikken', 'vrikken'], ['wrevel', 'vrevel']],
  vr: [['vrede', 'wrede', 1], ['vragen', 'wragen', 1], ['vriend', 'wriend', 1], ['vrolijk', 'wrolijk', 1], ['vrucht', 'wrucht', 1], ['vrachtwagen', 'wrachtwagen']],
  ing: [['tekening', 'tekenink'], ['oefening', 'oefenink'], ['wandeling', 'wandelink'], ['leerling', 'leerlink'], ['regering', 'regerink'], ['verhuizing', 'verhuizink'], ['bediening', 'bedienink']],
  ig: [['lastig', 'lasteg'], ['dorstig', 'dorsteg'], ['hongerig', 'hongereg'], ['ijverig', 'ijvereg'], ['zonnig', 'zonneg'], ['gezellig', 'gezelleg'], ['rustig', 'rusteg']],
  lijk: [['gevaarlijk', 'gevaarlek'], ['eerlijk', 'eerlek'], ['mogelijk', 'mogelek'], ['makkelijk', 'makkelek'], ['natuurlijk', 'natuurlek'], ['gewoonlijk', 'gewoonlek']],
  heid: [['gezondheid', 'gezondheit'], ['vrijheid', 'vrijheit'], ['waarheid', 'waarheit'], ['schoonheid', 'schoonheit'], ['zekerheid', 'zekerheit'], ['snelheid', 'snelheit'], ['eenheid', 'eenheit']],
  teit: [['realiteit', 'realiteid'], ['kwaliteit', 'kwaliteid'], ['activiteit', 'activiteid'], ['identiteit', 'identiteid'], ['universiteit', 'universiteid'], ['mentaliteit', 'mentaliteid']],
  tie: [['vakantie', 'vakansie'], ['actie', 'aksie'], ['politie', 'politsie'], ['situatie', 'situasie'], ['informatie', 'informasie'], ['traditie', 'tradisie'], ['reactie', 'reaksie'], ['functie', 'funksie']],
  x: [['taxi', 'taksi'], ['examen', 'eksamen'], ['extra', 'ekstra'], ['expres', 'ekspres'], ['exact', 'eksakt'], ['experiment', 'eksperiment'], ['explosie', 'eksplosie'], ['expert', 'ekspert']],
  y: [['baby', 'babi'], ['hobby', 'hobbi'], ['lolly', 'lolli'], ['gym', 'gim'], ['jury', 'juri'], ['rugby', 'rugbi'], ['happy', 'happi']],
  qu: [['quiz', 'kwiz'], ['queen', 'kween'], ['quilt', 'kwilt'], ['aquarium', 'akwarium'], ['quarantaine', 'kwarantaine'], ['quad', 'kwad']],
  th: [['thuis', 'tuis'], ['thema', 'tema'], ['theater', 'teater'], ['theorie', 'teorie'], ['thermometer', 'termometer'], ['thermos', 'termos'], ['marathon', 'maraton'], ['apotheek', 'apoteek']],
  a: [['oma', 'omaa', 1], ['opa', 'opaa', 1], ['sofa', 'sofaa', 1], ['pizza', 'pizzaa', 1], ['zebra', 'zebraa', 1]],
  o: [['foto', 'fotoo', 1], ['radio', 'radioo', 1], ['kano', 'kanoo', 1], ['piano', 'pianoo', 1], ['disco', 'discoo', 1], ['kilo', 'kiloo', 1]],
  u: [['menu', 'menuu', 1], ['paraplu', 'parapluu', 1], ['tutu', 'tutuu', 1], ['guru', 'guruu', 1], ['gnu', 'gnuu', 1]],
  ee: [['twee', 'twe', 1], ['idee', 'ide', 1], ['orchidee', 'orchide', 1], ['vee', 've', 1], ['fee', 'fe', 1]],
  sch: [['school', 'skool', 1], ['schaap', 'skaap', 1], ['schaar', 'skaar', 1], ['schip', 'skip', 1], ['schaal', 'skaal', 1], ['scheur', 'skeur'], ['schaats', 'skaats']],
  schr: [['schrijven', 'skrijven', 1], ['schrik', 'skrik', 1], ['schrift', 'skrift', 1], ['schroef', 'skroef', 1], ['schrijver', 'skrijver']],
  // c: [juist, fout, frequent, klank]  (klank: s of k, bepaalt of het doel 'c als /s/' of 'c als /k/' is)
  c: [['cirkel', 'sirkel', 0, 's'], ['citroen', 'sitroen', 0, 's'], ['cijfer', 'sijfer', 0, 's'], ['cent', 'sent', 0, 's'], ['centrum', 'sentrum', 0, 's'], ['cement', 'sement', 0, 's'], ['cinema', 'sinema', 0, 's'],
    ['camera', 'kamera', 0, 'k'], ['computer', 'komputer', 0, 'k'], ['camping', 'kamping', 0, 'k'], ['club', 'klub', 0, 'k'], ['cowboy', 'kowboy', 0, 'k'], ['cursus', 'kursus', 0, 'k'], ['cabine', 'kabine', 0, 'k']],
};

export const KEUZE_LABELS = Object.fromEntries(Object.keys(KLANKEN).map(s => [s, `Enkel woorden met ${s}`]));
