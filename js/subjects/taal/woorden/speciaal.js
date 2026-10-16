// Woordenlijsten voor leenwoorden, afkortingen en bijzondere tekens (trema, koppelteken, accent, apostrof).
// Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [juist, fout, volledig?]
//   juist     de juiste schrijfwijze            fout   de fout die een leerling kan maken (geen bestaand woord)
//   volledig  enkel waar het woord zelf niet de opgave is: de uitgeschreven vorm (bijvoorbeeld -> bv.)
// Bij leenwoorden is de 'fout' zoals je het hoort (ketsjup); de leerling schrijft het juist (ketchup).
// De tests in tests/taal.test.mjs en tests/speciaal.test.mjs controleren dat elke regel klopt.

export const LEENWOORDEN = {
  frans: [['garage', 'garazje'], ['chauffeur', 'sjofeur'], ['croissant', 'kwasson'], ['parachute', 'parasjuut'], ['bagage', 'bagazje'], ['restaurant', 'restorant'],
    ['pyjama', 'pijama'], ['journaal', 'sjoernaal'], ['etage', 'etazje'], ['collage', 'kollazje'], ['trottoir', 'trotwaar']],
  engels: [['weekend', 'wiekend'], ['team', 'tiem'], ['cake', 'keek'], ['clown', 'klaun'], ['ketchup', 'ketsjup'], ['jeans', 'dzjiens'], ['sandwich', 'sandwitsj'],
    ['show', 'sjoo'], ['hockey', 'hokkie'], ['interview', 'intervjoe'], ['cowboy', 'kauwboi'], ['joystick', 'dzjoistik']],
  latijn: [['chaos', 'kaos'], ['echo', 'eko'], ['chemie', 'kemie'], ['techniek', 'tekniek'], ['psycholoog', 'sicholoog'], ['museum', 'muzejum'], ['stadion', 'stadjon'],
    ['theater', 'teater'], ['christelijk', 'kristelijk'], ['anarchie', 'anargie'], ['gymnastiek', 'gimnastiek'], ['chronisch', 'kronisch']],
};

export const AFKORTINGEN = {
  punten: [['bv.', 'bv', 'bijvoorbeeld'], ['o.a.', 'oa', 'onder andere'], ['enz.', 'enz', 'en zo verder'], ['d.w.z.', 'dwz', 'dat wil zeggen'], ['m.a.w.', 'maw', 'met andere woorden'],
    ['a.u.b.', 'aub', 'alstublieft'], ['blz.', 'blz', 'bladzijde'], ['nr.', 'nr', 'nummer'], ['tel.', 'tel', 'telefoon'], ['ca.', 'ca', 'circa'], ['dhr.', 'dhr', 'meneer'],
    ['mevr.', 'mevr', 'mevrouw'], ['z.o.z.', 'zoz', 'zie ommezijde']],
  letterwoord: [['tv', 't.v.', 'televisie'], ['pc', 'p.c.', 'personal computer'], ['gsm', 'g.s.m.', 'mobiele telefoon'], ['vzw', 'v.z.w.', 'vereniging zonder winstoogmerk'],
    ['wc', 'w.c.', 'toilet'], ['dvd', 'd.v.d.', 'digital versatile disc'], ['btw', 'b.t.w.', 'belasting op de toegevoegde waarde'], ['cd', 'c.d.', 'compact disc']],
};

export const TEKENS = {
  trema: [['knieën', 'knieen'], ['zeeën', 'zeeen'], ['ruïne', 'ruine'], ['reünie', 'reunie'], ['naïef', 'naief'], ['België', 'Belgie'], ['coördinatie', 'coordinatie'],
    ['poëzie', 'poezie'], ['mozaïek', 'mozaiek'], ['egoïst', 'egoist'], ['Daniël', 'Daniel'], ['ideeën', 'ideeen'], ['financiën', 'financien'], ['patiënt', 'patient']],
  koppelteken: [['e-mail', 'email'], ['cd-speler', 'cd speler'], ['Sint-Niklaas', 'Sint Niklaas'], ['Oost-Vlaanderen', 'Oost Vlaanderen'], ['West-Vlaanderen', 'West Vlaanderen'],
    ['Noord-Brabant', 'Noord Brabant'], ['Nieuw-Zeeland', 'Nieuw Zeeland'], ['tv-programma', 'tv programma'], ['pc-spel', 'pc spel'], ['Sint-Truiden', 'Sint Truiden']],
  accent: [['café', 'cafe'], ['crème', 'creme'], ['privé', 'prive'], ['fiancé', 'fiance'], ['purée', 'puree'], ['bébé', 'bebe'], ['cliché', 'cliche'], ['crêpe', 'crepe']],
  apostrof: [["'s morgens", 'smorgens', 'des morgens'], ["'s avonds", 'savonds', 'des avonds'], ["'s middags", 'smiddags', 'des middags'], ["'s nachts", 'snachts', 'des nachts'],
    ["'s zondags", 'szondags', 'des zondags'], ["'s ochtends", 'sochtends', 'des ochtends'], ["zo'n", 'zon', 'zo een'], ["m'n", 'mn', 'mijn'], ["z'n", 'zn', 'zijn']],
};
