// Gegevens voor oefeningen over taalgebruik: non-verbale communicatie, jongerentaal en vaktaal, informatiebronnen door de tijd, schrifttekens,
// taalfamilie en woordbetekenissen uit de context. Dit bestand mag je als leerkracht aanpassen of aanvullen.
// De tests in tests/taal-taalgebruik.test.mjs controleren de samenhang.

export const NONVERBAAL = [
  ['Je kijkt boos en fronst je wenkbrauwen.', 'mimiek'], ['Je lacht en je ogen glimmen van plezier.', 'mimiek'], ['Je trekt je neus op omdat het stinkt.', 'mimiek'],
  ['Je stem gaat omhoog op het einde van een vraag.', 'intonatie'], ['Je praat zachter en trager als je verdrietig bent.', 'intonatie'], ['Je stem klinkt luid en boos.', 'intonatie'],
  ['Je schudt je hoofd en kruist je armen.', 'lichaamstaal'], ['Je wijst met je vinger naar de deur.', 'lichaamstaal'], ['Je zwaait om hallo te zeggen.', 'lichaamstaal'],
];
export const NONVERBAAL_NAMEN = ['intonatie', 'mimiek', 'lichaamstaal'];

// zinnen die meestal jongerentaal of vaktaal zijn
export const REGISTERTAAL = [
  ['Die film was echt vet, man!', 'jongerentaal'], ['Chill, het is maar een toets.', 'jongerentaal'], ['Dat spel is helemaal top, bro!', 'jongerentaal'],
  ['De dokter stelt een diagnose.', 'vaktaal'], ['De schrijnwerker gebruikt een beitel en een schaaf.', 'vaktaal'], ['De kok maakt een roux voor de saus.', 'vaktaal'],
];

// informatiebronnen in de volgorde waarin ze ontstonden
export const BRONNEN = ['orale vertelcultuur', 'schrift', 'boekdrukkunst', 'radio', 'televisie', 'digitale media'];

// talen met hetzelfde schrift als het Nederlands (Latijns alfabet) en met een ander schrift
export const SCHRIFT = {
  zelfde: ['Frans', 'Engels', 'Spaans', 'Duits', 'Italiaans', 'Pools'],
  ander: ['Russisch', 'Grieks', 'Arabisch', 'Chinees', 'Japans', 'Hebreeuws'],
};

// talen per taalfamilie
export const TAALFAMILIES = {
  germaans: ['Duits', 'Engels', 'Zweeds', 'Deens', 'Afrikaans', 'Fries'],
  romaans: ['Frans', 'Spaans', 'Italiaans', 'Portugees'],
  slavisch: ['Pools', 'Russisch', 'Tsjechisch'],
};

// woordbetekenissen uit de context: zin, woord, betekenis, twee foute betekenissen
export const CONTEXT = [
  ['De kat sluipt stilletjes naar de muis.', 'sluipt', 'loopt heel voorzichtig en zonder lawaai', ['rent heel snel', 'springt heel hoog']],
  ['Het is een enorme boom, zo groot als een huis.', 'enorme', 'heel grote', ['heel kleine', 'heel oude']],
  ['Ze was zo blij dat ze juichte.', 'juichte', 'luid van vreugde riep', ['zachtjes huilde', 'boos schreeuwde']],
  ['Hij fluisterde omdat niemand het mocht horen.', 'fluisterde', 'heel zacht sprak', ['heel luid riep', 'niets zei']],
  ['Na de lange wandeling was Tom doodmoe.', 'doodmoe', 'heel erg moe', ['heel erg blij', 'heel erg boos']],
  ['De winkel is op zondag gesloten, dus we kunnen niets kopen.', 'gesloten', 'dicht', ['open', 'nieuw']],
  ['De brandweer doofde het vuur snel.', 'doofde', 'maakte uit', ['stak aan', 'keek naar']],
  ['Het water in de plas is troebel, je kunt de bodem niet zien.', 'troebel', 'niet helder', ['heel koud', 'heel diep']],
  ['De schildpad is erg traag: hij heeft een uur nodig voor tien meter.', 'traag', 'langzaam', ['snel', 'sterk']],
  ['Zij is erg zuinig met geld en spaart elke euro.', 'zuinig', 'geeft niet veel geld uit', ['geeft veel geld uit', 'verliest geld']],
  ['Het huis is verlaten: er woont al jaren niemand meer.', 'verlaten', 'leeg, zonder bewoners', ['heel groot', 'pas gebouwd']],
  ['De dief ontsnapte door het raam en niemand kon hem vinden.', 'ontsnapte', 'vluchtte weg', ['viel neer', 'bleef staan']],
];

export const EIGENNAMEN_BEGIN = ['Tom', 'Lotte', 'Emma', 'Jan', 'Noor', 'Milan', 'Papa', 'Mama', 'Opa', 'Oma'];
