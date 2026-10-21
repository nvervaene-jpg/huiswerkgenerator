// Gegevens voor de begrippenoefeningen van Taal (klanken, tekens, hoofdletters, trappen van vergelijking, figuurlijk taalgebruik,
// hyponiemen, formeel en informeel, communicatiemodel, opdrachtwoorden, bijzondere spelling en zinsdelen verplaatsen).
// Dit bestand mag je als leerkracht aanpassen of aanvullen. De tests in tests/taal-begrippen.test.mjs controleren de samenhang.

/* ---- klanken: woorden met één klinkerklank, ingedeeld zoals op school: korte klinker, lange klinker of tweetekenklinker */
export const KLINKER_WOORDEN = {
  kort: ['kat', 'pen', 'vis', 'bos', 'bus', 'tak', 'mes', 'pot', 'put', 'bal', 'hut', 'lip', 'zon', 'pet', 'kip', 'dak', 'bed', 'hok'],
  lang: ['maan', 'haan', 'kaas', 'raam', 'been', 'steen', 'beer', 'boom', 'roos', 'boot', 'buur', 'muur', 'zee', 'twee', 'peer', 'poort'],
  tweeteken: ['dier', 'vier', 'mier', 'boek', 'hoed', 'koe', 'neus', 'deur', 'reus', 'huis', 'muis', 'uil', 'ei', 'trein', 'kei', 'ijs', 'dijk', 'pijn', 'oud', 'kous', 'touw', 'auto', 'pauw', 'saus'],
};
// paren korte klinker - lange klinker (zelfde medeklinkers, andere klinker)
export const KLINKER_PAREN = [['man', 'maan'], ['pen', 'peen'], ['bos', 'boos'], ['kas', 'kaas'], ['ram', 'raam'], ['tak', 'taak'], ['zon', 'zoon'], ['bet', 'beet']];
export const KLINKERS = ['a', 'e', 'i', 'o', 'u'];
export const MEDEKLINKERS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z'];
// woorden waarvan de eerste klank een klinker of een medeklinker is (enkelvoudige begin-letters)
export const BEGIN_WOORDEN = ['appel', 'oma', 'olifant', 'emmer', 'inkt', 'uur', 'eland', 'oven', 'bal', 'kat', 'zon', 'maan', 'tafel', 'water', 'deur', 'fiets', 'hond', 'lamp', 'raam', 'sok'];

/* ---- tekens: per teken de naam, een woord of zin waarin het staat en een opgave met een open plaats */
export const TEKENS = [
  { id: 'komma', teken: ',', naam: 'komma', doel: ['1.5.GL2.13'], gebruik: [['Ik koop appels__ peren en bananen.', ',', [':', '.']], ['Eerst eten we__ dan gaan we spelen.', ',', [':', '?']], ['Op de tafel liggen een pen__ een gom en een lat.', ',', [':', '!']]] },
  { id: 'dubbelpunt', teken: ':', naam: 'dubbelpunt', doel: ['1.5.GL2.13'], gebruik: [['Dit heb ik nodig__ een pen, een gom en een lat.', ':', [',', ';']], ['Ik neem mee__ een bal, een touw en een fles water.', ':', [',', ';']], ['Let op__ morgen is er geen school.', ':', [',', ';']]] },
  { id: 'apostrof', teken: "'", naam: 'apostrof', doel: ['1.5.GL4.37'], gebruik: [['foto__s', "'", ['-', '.']], ['auto__s', "'", ['-', '.']], ['oma__s', "'", ['-', '.']], ['paraplu__s', "'", ['-', '.']]] },
  { id: 'aanhaling', teken: '“ ”', naam: 'dubbele aanhalingstekens', doel: ['1.5.GL5.6'], gebruik: [['Lotte zegt: __Ik kom morgen.__', '“ ”', ['( )', '- -']], ['Jan roept: __Wacht even!__', '“ ”', ['( )', '- -']]] },
  { id: 'haakjes', teken: '( )', naam: 'haakjes', doel: ['1.5.GL5.6'], gebruik: [['De hond __een grote bruine hond__ blaft luid.', '( )', ['“ ”', '- -']], ['Mijn zus __zij is tien__ danst graag.', '( )', ['“ ”', '- -']]] },
  { id: 'accent', teken: 'é', naam: 'accent', doel: ['1.5.GL5.26'], gebruik: [['caf__', 'é', ['e', 'ë']], ['id__e', 'é', ['e', 'ë']], ['priv__', 'é', ['e', 'ë']]] },
  { id: 'trema', teken: 'ë', naam: 'trema', doel: ['1.5.GL6.5'], gebruik: [['zee__n', 'ë', ['e', 'é']], ['knie__n', 'ë', ['e', 'é']], ['idee__n', 'ë', ['e', 'é']], ['ru__ne', 'ï', ['i', 'í']], ['re__nie', 'ü', ['u', 'ú']]] },
  { id: 'koppelteken', teken: '-', naam: 'koppelteken', doel: ['1.5.GL6.5'], gebruik: [['zee__egel', '-', ['.', ',']], ['auto__ongeluk', '-', ['.', ',']], ['cd__speler', '-', ['.', ',']], ['tv__toestel', '-', ['.', ',']]] },
];
export const TEKEN_NAMEN_ALGEMEEN = ['punt', 'vraagteken', 'uitroepteken'];

/* ---- trappen van vergelijking: [stellende, vergrotende, overtreffende trap] */
export const TRAPPEN = [
  ['groot', 'groter', 'grootst'], ['klein', 'kleiner', 'kleinst'], ['snel', 'sneller', 'snelst'], ['sterk', 'sterker', 'sterkst'], ['lang', 'langer', 'langst'], ['oud', 'ouder', 'oudst'],
  ['jong', 'jonger', 'jongst'], ['mooi', 'mooier', 'mooist'], ['dik', 'dikker', 'dikst'], ['warm', 'warmer', 'warmst'], ['zwaar', 'zwaarder', 'zwaarst'], ['hoog', 'hoger', 'hoogst'],
  ['goed', 'beter', 'best'], ['veel', 'meer', 'meest'], ['weinig', 'minder', 'minst'],
];
export const TRAP_NAMEN = ['stellende trap', 'vergrotende trap', 'overtreffende trap'];
export const TRAP_NAMEN_KORT = ['gewone trap', 'vergrotende trap', 'overtreffende trap'];
export const NAMEN_KINDEREN = ['Tom', 'Lotte', 'Emma', 'Jan', 'Noor', 'Milan'];

/* ---- figuurlijk taalgebruik: uitdrukking, betekenis en een letterlijke zin die er niet mee te verwarren is */
export const UITDRUKKINGEN = [
  { zin: 'Het regent pijpenstelen.', betekenis: 'Het regent heel hard.' },
  { zin: 'Hij steekt haar een hart onder de riem.', betekenis: 'Hij troost haar en geeft haar moed.' },
  { zin: 'Je koopt een kat in de zak.', betekenis: 'Je koopt iets zonder te weten wat het precies is.' },
  { zin: 'Zij valt met de deur in huis.', betekenis: 'Zij zegt meteen waar het over gaat.' },
  { zin: 'Wij kijken de kat uit de boom.', betekenis: 'Wij wachten eerst af.' },
  { zin: 'Hij springt een gat in de lucht.', betekenis: 'Hij is heel erg blij.' },
  { zin: 'De dief valt door de mand.', betekenis: 'De dief wordt betrapt.' },
  { zin: 'Je vergelijkt appels met peren.', betekenis: 'Je vergelijkt dingen die je niet kunt vergelijken.' },
  { zin: 'Hij doet water bij de wijn.', betekenis: 'Hij geeft een beetje toe.' },
  { zin: 'Dat duurt een blauwe maandag.', betekenis: 'Dat duurt heel kort.' },
  { zin: 'Zij zit in de wolken.', betekenis: 'Zij is heel erg gelukkig.' },
  { zin: 'Met een mop breken we het ijs.', betekenis: 'We maken het eerste contact gemakkelijker.' },
  { zin: 'Hij heeft de pest in.', betekenis: 'Hij is heel kwaad of slecht gezind.' },
  { zin: 'Ik val van mijn stoel van verbazing.', betekenis: 'Ik ben heel erg verrast.' },
];
// zinnen die precies hetzelfde zeggen als er staat (letterlijk)
export const LETTERLIJKE_ZINNEN = ['Het regent de hele dag.', 'Hij zet de fles op de tafel.', 'Zij loopt door de deur naar buiten.', 'De kat zit in de boom.', 'Wij eten een appel en een peer.', 'De vogel vliegt in de lucht.', 'Hij valt van de trap.', 'Zij kijkt naar de wolken.', 'De dief rent weg.', 'Ik breek het ijs met een hamer.'];

/* ---- hyponiemen: overkoepelend woord en woorden die eronder vallen */
export const CATEGORIEEN = {
  dier: ['hond', 'kat', 'paard', 'koe', 'konijn', 'varken', 'schaap', 'muis'],
  fruit: ['appel', 'peer', 'banaan', 'kers', 'druif', 'sinaasappel', 'citroen', 'aardbei'],
  groente: ['wortel', 'sla', 'prei', 'ui', 'tomaat', 'spruitjes', 'bloemkool', 'komkommer'],
  meubel: ['tafel', 'stoel', 'kast', 'bed', 'bank', 'bureau', 'zetel', 'rek'],
  voertuig: ['auto', 'fiets', 'bus', 'trein', 'vrachtwagen', 'tram', 'motor', 'boot'],
  kleding: ['broek', 'trui', 'jas', 'sok', 'jurk', 'muts', 'hemd', 'rok'],
  sport: ['voetbal', 'tennis', 'zwemmen', 'turnen', 'basketbal', 'judo', 'hockey', 'atletiek'],
  muziekinstrument: ['gitaar', 'piano', 'viool', 'trompet', 'fluit', 'trommel', 'harp', 'saxofoon'],
  beroep: ['bakker', 'dokter', 'juf', 'brandweerman', 'slager', 'loodgieter', 'kapper', 'schilder'],
  gebouw: ['school', 'kerk', 'station', 'winkel', 'ziekenhuis', 'kasteel', 'toren', 'fabriek'],
};

/* ---- formeel en informeel: paren met dezelfde boodschap [informeel, formeel] */
export const REGISTER_PAREN = [
  ['Hé, wat is er?', 'Goedemorgen, waarmee kan ik u helpen?'], ['Kom je ook?', 'Wilt u ook komen?'], ['Bedankt, hé!', 'Hartelijk dank voor uw hulp.'], ['Tot later!', 'Tot ziens.'],
  ['Mag ik die pen even?', 'Mag ik uw pen even lenen?'], ['Da’s tof!', 'Dat is uitstekend.'], ['Wat is jouw naam?', 'Wat is uw naam?'], ['Ik heb er geen zin in.', 'Daar heb ik geen interesse in.'],
  ['Sorry, ik was te laat.', 'Mijn verontschuldigingen voor de vertraging.'], ['Kun je me even helpen?', 'Zou u mij kunnen helpen?'],
];
export const REGISTER_SITUATIES = [
  { situatie: 'Je schrijft een brief aan de directeur van de school.', register: 'formeel' }, { situatie: 'Je praat met je beste vriend op de speelplaats.', register: 'informeel' },
  { situatie: 'Je spreekt de burgemeester aan.', register: 'formeel' }, { situatie: 'Je stuurt een berichtje naar je broer.', register: 'informeel' },
  { situatie: 'Je belt een bedrijf om informatie te vragen.', register: 'formeel' }, { situatie: 'Je nodigt je klasgenoten uit op je verjaardagsfeestje.', register: 'informeel' },
];

/* ---- communicatiemodel: zender, ontvanger, boodschap, kanaal */
export const COMMUNICATIE = [
  { zender: 'Lotte', ontvanger: 'Jan', boodschap: 'Kom je vanavond spelen?', kanaal: 'een telefoongesprek', zin: 'Lotte belt Jan op en vraagt: "Kom je vanavond spelen?"' },
  { zender: 'De juf', ontvanger: 'de klas', boodschap: 'Morgen is er zwemles.', kanaal: 'haar stem', zin: 'De juf zegt tegen de klas: "Morgen is er zwemles."' },
  { zender: 'Emma', ontvanger: 'haar oma', boodschap: 'Bedankt voor het cadeau!', kanaal: 'een brief', zin: 'Emma schrijft een brief aan haar oma: "Bedankt voor het cadeau!"' },
  { zender: 'Tom', ontvanger: 'zijn vriend Milan', boodschap: 'Tot morgen op school!', kanaal: 'een berichtje op de telefoon', zin: 'Tom stuurt zijn vriend Milan een berichtje op de telefoon: "Tot morgen op school!"' },
  { zender: 'De directeur', ontvanger: 'alle ouders', boodschap: 'Er is vrijdag een schoolfeest.', kanaal: 'een e-mail', zin: 'De directeur stuurt alle ouders een e-mail: "Er is vrijdag een schoolfeest."' },
  { zender: 'Noor', ontvanger: 'haar mama', boodschap: 'Ik ben er om vier uur.', kanaal: 'een briefje op de tafel', zin: 'Noor legt een briefje voor haar mama op de tafel: "Ik ben er om vier uur."' },
];
export const KANALEN_ALLE = ['een telefoongesprek', 'haar stem', 'een brief', 'een berichtje op de telefoon', 'een e-mail', 'een briefje op de tafel'];
export const MEDIA = [
  { cue: 'Je leest nieuws in een gedrukt blad dat elke dag verschijnt.', medium: 'krant' }, { cue: 'Je hoort muziek en een reclame zonder beeld.', medium: 'radio' },
  { cue: 'Je ziet bewegende beelden en hoort geluid in de woonkamer.', medium: 'televisie' }, { cue: 'Je zoekt informatie met een computer op het internet.', medium: 'website' },
  { cue: 'Je krijgt een papieren boodschap in de bus van de brievenbus.', medium: 'brief' },
];
export const MEDIA_NAMEN = ['krant', 'radio', 'televisie', 'website', 'brief'];

/* ---- opdrachtwoorden (school-, instructie- en vaktaal): woord, wat je doet, vanaf welk leerjaar */
export const OPDRACHTWOORDEN = [
  { woord: 'kleur', doen: 'Je geeft kleur aan de tekening of het woord.', jaar: 1 }, { woord: 'verbind', doen: 'Je trekt een lijn tussen dingen die bij elkaar horen.', jaar: 1 },
  { woord: 'teken', doen: 'Je maakt een tekening.', jaar: 1 }, { woord: 'schrijf op', doen: 'Je noteert het antwoord met letters of cijfers.', jaar: 1 },
  { woord: 'omcirkel', doen: 'Je zet een cirkel om het juiste antwoord.', jaar: 2 }, { woord: 'onderstreep', doen: 'Je trekt een streep onder het woord of de zin.', jaar: 2 },
  { woord: 'vul aan', doen: 'Je schrijft op wat er ontbreekt.', jaar: 2 }, { woord: 'kruis aan', doen: 'Je zet een kruisje bij het juiste antwoord.', jaar: 2 },
  { woord: 'kies', doen: 'Je neemt het antwoord dat past uit verschillende mogelijkheden.', jaar: 3 }, { woord: 'markeer', doen: 'Je kleurt het belangrijke deel met een stift.', jaar: 3 },
  { woord: 'verbeter', doen: 'Je maakt wat fout is weer juist.', jaar: 4 }, { woord: 'vergelijk', doen: 'Je zoekt wat gelijk is en wat verschilt.', jaar: 4 },
  { woord: 'beschrijf', doen: 'Je vertelt of schrijft hoe iets eruitziet of gebeurt.', jaar: 5 }, { woord: 'ordenen', doen: 'Je zet dingen in een logische volgorde.', jaar: 5 },
  { woord: 'verklaar', doen: 'Je legt uit waarom iets zo is.', jaar: 6 },
];

/* ---- bijzondere spelling: [juiste spelling, onjuiste spelling zoals je het hoort] per klank */
export const SPELLING_BIJZONDER = {
  'sj-ch': { label: '/sj/ als ch', doel: ['1.3.GL5.15'], woorden: [['chef', 'sjef'], ['chauffeur', 'sjauffeur'], ['champignon', 'sjampinjon'], ['machine', 'masjine'], ['parachute', 'parasjute'], ['chocolade', 'sjocolade'], ['charme', 'sjarme'], ['chalet', 'sjalet']] },
  'zj-ge': { label: '/zj/ als ge', doel: ['1.3.GL5.16'], woorden: [['garage', 'garasje'], ['bagage', 'bagasje'], ['etage', 'etasje'], ['massage', 'massasje'], ['mirage', 'mirasje'], ['loge', 'losje'], ['passage', 'passasje'], ['courage', 'courasje']] },
  'zj-j': { label: '/zj/ als j', doel: ['1.3.GL5.17'], woorden: [['jury', 'zjury'], ['journaal', 'zjoernaal'], ['journalist', 'zjoernalist'], ['jus', 'zjus'], ['jargon', 'zjargon']] },
  'ie-i': { label: '/ie/ als i', doel: ['1.3.GL5.21'], woorden: [['marine', 'mariene'], ['vitamine', 'vitamiene'], ['benzine', 'benziene'], ['machine', 'masjiene'], ['cabine', 'cabiene'], ['kantine', 'kantiene'], ['praline', 'praliene'], ['routine', 'routiene']] },
  'oe-ou': { label: '/oe/ als ou', doel: ['1.3.GL5.22'], woorden: [['souvenir', 'soevenir'], ['bouillon', 'boeljon'], ['toupet', 'toepet'], ['rouge', 'roesje'], ['routine', 'roetine'], ['couscous', 'koeskoes'], ['couplet', 'koeplet'], ['foulard', 'foelaar']] },
};

/* ---- korte woorden op -f en -s: je hoort /f/ of /s/ op het einde; je schrijft f en s (niet v of z) */
export const KLANKZUIVER = {
  fs: { doel: ['1.3.GL1.15'], label: 'woorden op -f of -s', woorden: ['wolf', 'neef', 'graf', 'golf', 'bus', 'vos', 'mus', 'gas', 'kus', 'tas'] },
};

/* ---- zinsdelen verplaatsen: [onderwerp, persoonsvorm, ...andere zinsdelen]; de persoonsvorm blijft op de tweede plaats */
export const VERPLAATS_ZINNEN = [
  ['Tom', 'speelt', 'buiten', 'met zijn hond'], ['De kinderen', 'zwemmen', 'in het zwembad', 'op woensdag'], ['Mijn zus', 'leest', 'een boek', 'in de tuin'],
  ['De juf', 'vertelt', 'een verhaal', 'aan de klas'], ['Wij', 'eten', 'soep', 'om zes uur'], ['Mijn opa', 'wandelt', 'door het bos', 'met zijn stok'],
  ['De bakker', 'verkoopt', 'vers brood', 'in de winkel'], ['Lotte', 'tekent', 'een paard', 'op een groot blad'],
];
