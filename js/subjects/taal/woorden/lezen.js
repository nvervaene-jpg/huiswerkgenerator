// Gegevens voor de leesoefeningen: leeswoorden met vaste patronen, en teksten, tekstconventies en verbindingswoorden voor tekstbegrip.
// Dit bestand mag je als leerkracht aanpassen of aanvullen. De tests in tests/taal-lezen.test.mjs controleren de samenhang.

/* ---- leeswoorden die niet uit klanken.js komen */
export const LEESWOORDEN = {
  mkm: ['kat', 'pen', 'vis', 'pot', 'bus', 'zak', 'bed', 'lip', 'dop', 'hut', 'jas', 'nek', 'wip', 'mug', 'tak', 'mes', 'bal', 'kip', 'zon', 'rok', 'dak', 'hok', 'pak', 'pil'],
  mk: ['zo', 'ja', 'nu', 'ma', 'pa', 'ze', 'we', 'me', 'je', 'de', 'he', 'ga'],
  km: ['op', 'af', 'ik', 'in', 'al', 'om', 'er', 'en'],
  vooraan: ['brug', 'blad', 'vlag', 'spin', 'stap', 'trap', 'drop', 'glas', 'smal', 'klas', 'kraan', 'plus', 'grot', 'vlot', 'stok', 'snor', 'knop', 'krom', 'slim', 'prik'],
  achteraan: ['kast', 'vorst', 'tent', 'lamp', 'hond', 'hand', 'wind', 'kerk', 'melk', 'werk', 'lift', 'post', 'kunst', 'dorp', 'berg', 'bank', 'mand', 'rups', 'pomp', 'tank'],
  beide: ['plank', 'strand', 'krant', 'sterk', 'brand', 'stamp', 'blind', 'klomp', 'plant', 'blond', 'sport', 'kring', 'trots', 'vrucht'],
  endD: ['hond', 'stad', 'pad', 'hoed', 'goed', 'brood', 'dood', 'kind', 'wind', 'bad', 'bed', 'hand', 'vriend'],
  endB: ['web', 'krab', 'club', 'pub', 'tab', 'blob'],
  open1: ['oma', 'opa', 'papa', 'mama', 'sofa', 'foto', 'judo', 'solo', 'menu', 'disco', 'kilo', 'tuba', 'lama', 'cola', 'toga', 'zebra', 'pizza'],
  open3: ['piano', 'radio', 'koala', 'aroma', 'agenda', 'camera', 'pyjama', 'bikini', 'cacao'],
  ie_oe_2: ['fietsen', 'bloemen', 'boeken', 'keuken', 'tuinman', 'muziek', 'huisdier', 'groente', 'stoelen', 'vuilnis', 'koekjes', 'buiten', 'kleuren', 'speelgoed'],
  aai_2: ['draaien', 'maaien', 'kraaien', 'zaaien', 'mooie', 'rooie', 'kooien', 'bloeien', 'groeien', 'koeien', 'zwaaien', 'waaien', 'roeien', 'snoeien', 'strooien', 'boeien', 'ooievaar'],
  eeuw_2: ['nieuwe', 'eeuwen', 'leeuwen', 'sneeuwbal', 'nieuwsbrief', 'leeuwin', 'kieuwen', 'nieuwjaar', 'schreeuwen', 'nieuwtje', 'eeuwig', 'sneeuwman', 'meeuwen'],
  uw_2: ['duwen', 'ruwe', 'schuwen', 'gruwen', 'luwe', 'gruwel', 'duwde', 'ruwer', 'schuwer'],
  ngnk_2: ['koning', 'honing', 'woning', 'ketting', 'zandbank', 'spaarbank', 'lening', 'mening', 'zitbank', 'tuinbank'],
  cht_2: ['bericht', 'gezicht', 'gewicht', 'gerucht', 'verdacht', 'gerecht', 'gedicht', 'gevecht', 'gedacht', 'gebracht', 'verlicht', 'gevlucht', 'gewacht', 'bezocht', 'gelach'],
  ouau_2: ['koude', 'houten', 'bouwen', 'vrouwen', 'trouwen', 'rauwe', 'kauwgom', 'flauwe', 'houding', 'gouden', 'zouden'],
  elen_3: ['kinderen', 'bladeren', 'eieren', 'liederen', 'tekenen', 'rekenen', 'engelen', 'regenen', 'wapenen', 'kegelen', 'beitelen', 'wonderen'],
  end_end: ['lopend', 'rennend', 'spelend', 'lachend', 'zingend', 'dansend', 'vliegend', 'kruipend', 'slapend', 'fietsend', 'huilend', 'wachtend'],
};

/* ---- teksten met een doel: informeren, genieten, overtuigen of instructies geven */
export const DOELTEKSTEN = {
  informeren: ['De bij verzamelt nectar uit bloemen. In één bijenkorf wonen wel duizenden bijen.', 'Een zebra heeft strepen. Elke zebra heeft een andere tekening. Zebra\'s leven in Afrika.', 'De Maas is een rivier. Ze begint in Frankrijk en loopt door België en Nederland.', 'Een tomaat is een vrucht. Tomaten groeien aan een plant en zijn eerst groen en later rood.'],
  genieten: ['Er was eens een kleine draak die niet kon vuurspuwen. Elke avond oefende hij in het donkere bos.', 'Zon, zon, schijn toch eens, \nik wil buiten spelen. \nMijn laarzen staan al klaar!', 'De muis liep door het hoge gras. Plots hoorde ze een vreemd geluid: boem, boem, boem!', 'Lotte droomde dat ze op een wolk zat. Ze zwaaide naar de vogels en de vogels zwaaiden terug.'],
  overtuigen: ['Kom allemaal naar ons schoolfeest! Het wordt super leuk en je mag je beste vriend meenemen!', 'Eet elke dag een stuk fruit. Zo word je sterk en gezond. Probeer het zelf maar!', 'Dit is de beste fiets van de stad! Snel, veilig en nu met korting. Koop hem vandaag nog!', 'Gooi je afval in de vuilnisbak. Samen houden we de speelplaats netjes. Doe je mee?'],
  instructies: ['Neem een kom. Doe er twee eieren in. Klop de eieren los. Giet ze daarna in een pan.', 'Stap 1: Vouw het blad dubbel. Stap 2: Vouw de hoeken naar het midden. Stap 3: Vouw de rand om.', 'Zo plant je een boontje: vul een potje met aarde, leg er een boontje in en geef elke dag een beetje water.', 'Wassen: zet de kraan open, neem zeep, wrijf je handen en spoel ze af. Droog ze goed.'],
};
export const DOEL_NAMEN = { informeren: 'te informeren', genieten: 'te laten genieten', overtuigen: 'te overtuigen', instructies: 'instructies te geven' };

/* ---- tekstconventies: wat is het en waar vind je het */
export const CONVENTIES = [
  { antw: 'inhoudsopgave', jaar: 5, vragen: ['Waar vind je in een boek een lijst met de hoofdstukken en de bladzijden?', 'Waar zoek je vooraan in een boek op welke bladzijde een hoofdstuk begint?', 'Hoe heet de lijst vooraan in een boek met titels van hoofdstukken en hun bladzijde?'] },
  { antw: 'index', jaar: 5, vragen: ['Waar zoek je in een boek achteraan een woord op, in alfabetische volgorde, met de bladzijden waar het staat?', 'Hoe heet de alfabetische lijst achteraan in een boek met woorden en bladzijden?', 'Waar vind je achteraan in een boek op welke bladzijden een woord voorkomt?'] },
  { antw: 'legende', jaar: 6, vragen: ['Wat verklaart op een kaart of in een figuur wat de tekens betekenen?', 'Hoe heet het kadertje bij een kaart dat uitlegt wat de kleuren en tekens betekenen?', 'Wat lees je om te weten wat een teken op de kaart voorstelt?'] },
  { antw: 'titel', jaar: 1, vragen: ['Hoe heet de naam die bovenaan een tekst of een boek staat?', 'Wat staat er groot bovenaan een verhaal en zegt waarover het gaat?', 'Hoe heet de naam van een boek, een gedicht of een tekst?'] },
  { antw: 'tussentitel', jaar: 2, vragen: ['Hoe heet een kleine titel boven een deel van de tekst?', 'Wat staat er midden in een tekst boven een nieuw stukje?', 'Hoe heet een titeltje boven een alinea in een tekst?'] },
  { antw: 'alinea', jaar: 3, vragen: ['Hoe heet een stukje tekst dat uit meerdere zinnen over hetzelfde bestaat en begint op een nieuwe regel?', 'Hoe heet een groepje zinnen dat bij elkaar hoort en op een nieuwe regel begint?', 'Hoe heet het stukje tekst tussen twee witregels of inspringingen?'] },
  { antw: 'witruimte', jaar: 2, vragen: ['Hoe heet de lege plaats tussen twee delen van een tekst?', 'Wat laat je open tussen twee stukjes tekst zodat het rustig leest?', 'Hoe heet de lege ruimte op een bladzijde rond en tussen de tekst?'] },
  { antw: 'tabel', jaar: 6, vragen: ['Waar staan cijfers en gegevens netjes in rijen en kolommen?', 'Hoe heet een overzicht met rijen en kolommen vol gegevens?', 'Wat gebruik je om gegevens geordend in vakjes te zetten?'] },
];
export const CONVENTIE_DOEL = { '1.2.GL1.43': ['titel'], '1.2.GL2.37': ['witruimte'], '1.2.GL2.38': ['tussentitel'], '1.2.GL3.32': ['tussentitel', 'alinea'], '1.2.GL4.24': ['titel', 'tussentitel', 'alinea', 'witruimte'], '1.2.GL5.15': ['inhoudsopgave', 'index'], '1.2.GL6.15': ['inhoudsopgave', 'index', 'legende', 'tabel'] };
export const CONVENTIE_NAMEN = CONVENTIES.map(c => c.antw);

/* ---- structuuraanduiders: zinnen met een verbindingswoord, [zin met ____, goed woord, foute woorden] */
export const STRUCTUUR = [
  ['Ik heb honger, ____ ik eet een boterham.', 'dus', ['maar', 'want'], 2], ['Ik ga naar buiten, ____ het regent niet meer.', 'want', ['dus', 'maar'], 2],
  ['Lotte wil spelen, ____ ze moet eerst haar huiswerk maken.', 'maar', ['dus', 'want'], 2], ['Eerst eten we. ____ gaan we afwassen.', 'Daarna', ['Daarom', 'Maar'], 1],
  ['Hij is moe ____ hij gaat vroeg slapen.', 'daarom', ['maar', 'of'], 3], ['Wil je thee ____ koffie?', 'of', ['maar', 'dus'], 1],
  ['De juf vertelt een verhaal ____ de kinderen luisteren stil.', 'en', ['of', 'maar'], 1], ['Ik fiets naar school ____ het vandaag mooi weer is.', 'omdat', ['maar', 'daarna'], 3],
  ['Tom heeft honger. ____ eet hij een appel.', 'Daarom', ['Daarna', 'Maar'], 3], ['Ik was mijn handen ____ ik ga eten.', 'voordat', ['daarom', 'maar'], 4],
  ['Het is koud. ____ trekt Emma een dikke jas aan.', 'Daarom', ['Maar', 'Eerst'], 3], ['Ze lachte, ____ ze was toch een beetje bang.', 'maar', ['dus', 'omdat'], 3],
];
