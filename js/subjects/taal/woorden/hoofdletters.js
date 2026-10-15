// Woordenlijst voor hoofdletters. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [woord zoals het juist geschreven wordt, frequent?, soort woord (enkel bij 'geen')]
//   'Gent' staat bij plaats, 'hond' bij geen (een gewoon woord: géén hoofdletter), 'Tweede Wereldoorlog' bij gebeurtenis.
// Per soort (en bij welk Op.stap-doel het hoort):
//   naam         namen van personen                                    GL2.10
//   plaats       landen, steden, werelddelen (frequent: GL2.10; alle: GL3.7)
//   feestdag     feestdagen                                            GL3.7
//   titel        titels van boeken en films (enkel eerste woord en namen) GL4.5
//   taal         talen                                                 GL4.5
//   inwoner      inwoners van een plaats of land (een Belg, een Gentenaar) GL5.6
//   gebeurtenis  historische gebeurtenissen en periodes                GL5.6
//   bedrijf, gebouw, merk                                              GL6.6
//   geen         gewone woorden zonder hoofdletter, ook dagen en maanden (die krijgen géén hoofdletter) GL2.10 t/m GL6.6
// De fout die een leerling maakt (hoofdletter vergeten of te veel) wordt automatisch gemaakt.
// De tests controleren dat elk woord consistent is; of het woord echt een eigennaam is, moet een leerkracht nakijken.

export const SOORTEN = {
  naam: [
    ['Anna', 1], ['Mohamed', 1], ['Lotte', 1], ['Jonas', 1], ['Emma', 1], ['Noah', 1], ['Sara', 1], ['Thomas', 1], ['Elise', 1], ['Jan', 1],
    ['Marie', 1], ['Yasmine', 1], ['Liam', 1], ['Fien', 1], ['Tim'], ['Bram'], ['Chloë'], ['Lars'], ['Mia'], ['Sofie'], ['Lucas'], ['Nora'], ['Amir'], ['Ella'],
  ],
  plaats: [
    ['België', 1], ['Nederland', 1], ['Gent', 1], ['Brussel', 1], ['Antwerpen', 1], ['Eizeringen', 1], ['Vlaanderen', 1], ['Brugge', 1], ['Leuven', 1],
    ['Frankrijk', 1], ['Spanje', 1], ['Duitsland', 1], ['Europa', 1], ['Afrika', 1],
    ['Mechelen'], ['Oostende'], ['Kortrijk'], ['Hasselt'], ['Luik'], ['Turkije'], ['Marokko'], ['Italië'], ['Engeland'], ['Amerika'], ['Azië'], ['Australië'], ['Polen'], ['Portugal'],
  ],
  feestdag: [
    ['Kerstmis'], ['Pasen'], ['Nieuwjaar'], ['Sinterklaas'], ['Moederdag'], ['Vaderdag'], ['Halloween'], ['Pinksteren'], ['Valentijnsdag'], ['Allerheiligen'], ['Driekoningen'],
  ],
  titel: [
    ['De kleine prins'], ['De leeuwenkoning'], ['Sneeuwwitje'], ['Alice in Wonderland'], ['Pippi Langkous'], ['Jip en Janneke'], ['De Gruffalo'], ['Roodkapje'],
    ['Harry Potter'], ['Kikker is verliefd'], ['Pinokkio'], ['Boer Boris'], ['De drie biggetjes'], ['Het lelijke eendje'], ['Hans en Grietje'], ['Frozen'],
  ],
  taal: [
    ['Nederlands'], ['Frans'], ['Engels'], ['Duits'], ['Spaans'], ['Turks'], ['Arabisch'], ['Italiaans'], ['Pools'], ['Russisch'], ['Chinees'], ['Portugees'],
  ],
  inwoner: [
    ['Belg'], ['Nederlander'], ['Fransman'], ['Duitser'], ['Spanjaard'], ['Gentenaar'], ['Brusselaar'], ['Antwerpenaar'], ['Leuvenaar'], ['Italiaan'], ['Turk'], ['Marokkaan'],
  ],
  gebeurtenis: [
    ['Tweede Wereldoorlog'], ['Eerste Wereldoorlog'], ['Franse Revolutie'], ['Middeleeuwen'], ['Renaissance'], ['Gouden Eeuw'], ['Industriële Revolutie'],
    ['Koude Oorlog'], ['Belgische Revolutie'], ['Boerenkrijg'], ['Slag bij Waterloo'],
  ],
  bedrijf: [['Colruyt'], ['Delhaize'], ['Proximus'], ['Telenet'], ['Aldi'], ['Lidl'], ['Carrefour'], ['Decathlon'], ['Volvo'], ['Philips']],
  gebouw: [['Atomium'], ['Belfort'], ['Eiffeltoren'], ['Colosseum'], ['Kremlin'], ['Pentagon'], ['Taj Mahal'], ['Louvre'], ['Notre-Dame'], ['Burj Khalifa']],
  merk: [['Lego'], ['Nike'], ['Adidas'], ['Samsung'], ['Coca-Cola'], ['Playmobil'], ['Disney'], ['Duplo'], ['Fanta'], ['Pepsi'], ['Nutella'], ['Kinder'], ['Duracell']],
  geen: [
    ['hond', 1, 'zaak'], ['kat', 1, 'zaak'], ['school', 1, 'zaak'], ['tafel', 1, 'zaak'], ['boek', 1, 'zaak'], ['juf', 1, 'zaak'], ['fiets', 1, 'zaak'], ['appel', 1, 'zaak'],
    ['vriend', 1, 'zaak'], ['straat', 1, 'zaak'], ['dorp', 1, 'zaak'], ['taart', 1, 'zaak'], ['rivier'], ['berg'], ['zee'], ['land'], ['stad'], ['kerstboom'], ['sneeuwman'],
    ['cadeau'], ['maandag', 1, 'dag'], ['dinsdag', 1, 'dag'], ['woensdag', 1, 'dag'], ['donderdag', 1, 'dag'], ['vrijdag', 1, 'dag'], ['zaterdag', 1, 'dag'], ['zondag', 1, 'dag'],
    ['januari', 1, 'maand'], ['februari', 1, 'maand'], ['maart', 1, 'maand'], ['april', 1, 'maand'], ['mei', 1, 'maand'], ['juni', 1, 'maand'], ['juli', 1, 'maand'],
    ['augustus', 1, 'maand'], ['september', 1, 'maand'], ['oktober', 1, 'maand'], ['november', 1, 'maand'], ['december', 1, 'maand'],
  ],
};

// Korte namen voor in de oefening ('regel herkennen').
export const LABELS = {
  naam: 'persoon', plaats: 'plaats', feestdag: 'feestdag', titel: 'titel', taal: 'taal', inwoner: 'inwoner', gebeurtenis: 'gebeurtenis',
  bedrijf: 'bedrijf', gebouw: 'gebouw', merk: 'merk', geen: 'geen hoofdletter',
};
export const KEUZE_LABELS = {
  naam: 'Enkel namen van personen', plaats: 'Enkel plaatsnamen', feestdag: 'Enkel feestdagen', titel: 'Enkel titels van boeken en films', taal: 'Enkel talen',
  inwoner: 'Enkel inwoners (Belg, Gentenaar)', gebeurtenis: 'Enkel historische gebeurtenissen', bedrijf: 'Enkel bedrijven', gebouw: 'Enkel gebouwen', merk: 'Enkel merken',
  geen: 'Enkel gewone woorden (zonder hoofdletter)',
};

// Zinnen met een open plaats {w} voor het woord; per soort een paar zinnen.
export const ZINNEN = {
  naam: ['Gisteren speelde ik met {w}.', 'In de klas zit ik naast {w}.', 'De juf roept {w}.', 'Samen met {w} maak ik mijn huiswerk.'],
  plaats: ['Wij gaan op reis naar {w}.', 'Mijn tante komt uit {w}.', 'Ik heb al eens gelogeerd in {w}.', 'Op de kaart zoek ik {w}.'],
  feestdag: ['Wij vieren {w}.', 'Thuis kijken we uit naar {w}.', 'Op school praten we over {w}.'],
  titel: ['Ik ken het verhaal {w}.', 'De juf leest {w} voor.', 'Wij kijken naar {w}.'],
  taal: ['Ik leer {w} op school.', 'In mijn klas spreken sommige kinderen {w}.', 'Mijn buurman spreekt {w}.'],
  inwoner: ['Mijn buurman is een {w}.', 'Op de camping ontmoeten we een {w}.', 'De juf vertelt over een {w}.'],
  gebeurtenis: ['In de les van geschiedenis leren we over de {w}.', 'In het boek staat een tekst over de {w}.', 'De juf vertelt over de {w}.'],
  bedrijf: ['Papa werkt bij {w}.', 'Mama zoekt een baan bij {w}.', 'Mijn oom werkt al jaren bij {w}.'],
  gebouw: ['Dit gebouw heet {w}.', 'Op de foto staat een gebouw dat {w} heet.'],
  merk: ['Op de doos staat het merk {w}.', 'Ik heb gespaard voor {w}.', 'Op mijn trui staat het merk {w}.'],
  geen: ['Op de foto zie ik een {w}.', 'Ik teken een {w}.', 'Wij praten over een {w}.'],
  dag: ['Vandaag is het {w}.'],
  maand: ['Mijn verjaardag is in {w}.', 'In {w} gaan we op uitstap.'],
};
