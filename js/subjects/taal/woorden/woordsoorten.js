// Woordenlijsten voor woordsoorten (zelfstandig naamwoord, lidwoord, eigennaam, werkwoord, bijvoeglijk naamwoord,
// telwoord, voorzetsel, voegwoord, voornaamwoord). Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// WOORDEN   losse woorden per woordsoort. Kies woorden die maar één woordsoort kunnen zijn (dus geen 'eten' of 'rood',
//           want dat kan ook een zelfstandig naamwoord zijn).
// ZINNEN    zinnen waarbij elk woord een woordsoort krijgt: woord/soort. Leestekens laat je weg.
//           Een woord dat geen van de negen soorten is (bv. niet, snel, heel) krijgt /x en wordt nooit bevraagd.
//           Gebruik in zinnen geen woorden die twee soorten kunnen zijn.
// De tests in tests/woordsoorten.test.mjs controleren de samenhang en de gesloten woordsoorten (lidwoorden,
// voorzetsels, voegwoorden, voornaamwoorden).

export const SOORTEN = [
  { id: 'zn', label: 'zelfstandig naamwoord', meervoud: 'zelfstandige naamwoorden' },
  { id: 'lw', label: 'lidwoord', meervoud: 'lidwoorden' },
  { id: 'eig', label: 'eigennaam', meervoud: 'eigennamen' },
  { id: 'ww', label: 'werkwoord', meervoud: 'werkwoorden' },
  { id: 'bn', label: 'bijvoeglijk naamwoord', meervoud: 'bijvoeglijke naamwoorden' },
  { id: 'tel', label: 'telwoord', meervoud: 'telwoorden' },
  { id: 'vz', label: 'voorzetsel', meervoud: 'voorzetsels' },
  { id: 'vw', label: 'voegwoord', meervoud: 'voegwoorden' },
  { id: 'vnw', label: 'voornaamwoord', meervoud: 'voornaamwoorden' },
];

export const WOORDEN = {
  zn: ['hond', 'tafel', 'boek', 'school', 'fiets', 'appel', 'huis', 'boom', 'kat', 'stoel', 'tuin', 'winkel', 'bal', 'jas'],
  lw: ['de', 'het', 'een'],
  eig: ['Anna', 'Tom', 'Lotte', 'Gent', 'Brugge', 'België', 'Eizeringen', 'Mia', 'Noah', 'Antwerpen'],
  ww: ['lopen', 'spelen', 'lezen', 'schrijven', 'zingen', 'zwemmen', 'fietsen', 'springen', 'dansen', 'bouwen'],
  bn: ['groot', 'klein', 'blij', 'zacht', 'lang', 'nieuw', 'warm', 'vies', 'slim', 'gezellig'],
  tel: ['twee', 'drie', 'vier', 'vijf', 'tien', 'twintig', 'honderd', 'eerste', 'tweede', 'derde'],
  vz: ['in', 'op', 'onder', 'naast', 'achter', 'tussen', 'boven', 'bij', 'naar', 'met', 'zonder'],
  vw: ['en', 'maar', 'want', 'omdat', 'of', 'terwijl', 'hoewel', 'dus'],
  vnw: ['ik', 'jij', 'hij', 'wij', 'jullie', 'mijn', 'jouw', 'hem', 'ze'],
};

const zinnen = (tekst) => tekst.trim().split('\n').map(r => r.trim().split(/\s+/).map(t => t.split('/')));
export const ZINNEN = zinnen(`
De/lw hond/zn loopt/ww in/vz de/lw tuin/zn
Anna/eig leest/ww een/lw boek/zn
Het/lw kind/zn speelt/ww met/vz de/lw bal/zn
Tom/eig fietst/ww naar/vz school/zn
De/lw kat/zn slaapt/ww op/vz de/lw stoel/zn
Lotte/eig tekent/ww een/lw huis/zn
De/lw juf/zn schrijft/ww een/lw woord/zn op/vz het/lw bord/zn
Mia/eig en/vw Noah/eig zwemmen/ww in/vz het/lw zwembad/zn
De/lw vogel/zn zingt/ww een/lw lied/zn
Het/lw meisje/zn eet/ww een/lw appel/zn
Gent/eig is/ww een/lw grote/bn stad/zn
De/lw jongen/zn bouwt/ww een/lw toren/zn
Mijn/vnw zus/zn leest/ww een/lw boek/zn
De/lw bakker/zn bakt/ww brood/zn
Wij/vnw lopen/ww naar/vz de/lw winkel/zn
Sam/eig tilt/ww de/lw zware/bn doos/zn
De/lw zon/zn schijnt/ww aan/vz de/lw hemel/zn
Eizeringen/eig ligt/ww in/vz Vlaanderen/eig
Ik/vnw eet/ww drie/tel koekjes/zn
De/lw kleine/bn kat/zn drinkt/ww melk/zn
Er/x zitten/ww vijf/tel vissen/zn in/vz het/lw water/zn
Zij/vnw danst/ww met/vz twee/tel vriendinnen/zn
Het/lw gras/zn is/ww groen/bn
De/lw rode/bn auto/zn rijdt/ww snel/x
Tien/tel kinderen/zn spelen/ww op/vz de/lw speelplaats/zn
Ik/vnw ben/ww blij/bn omdat/vw de/lw zon/zn schijnt/ww
De/lw hond/zn blaft/ww en/vw de/lw kat/zn miauwt/ww
Emre/eig wil/ww een/lw hond/zn maar/vw hij/vnw mag/ww niet/x
Wij/vnw spelen/ww buiten/x want/vw het/lw is/ww warm/bn
De/lw leerlingen/zn lezen/ww een/lw spannend/bn verhaal/zn
Zij/vnw wachten/ww op/vz de/lw trein/zn
Onder/vz de/lw tafel/zn ligt/ww een/lw oude/bn sok/zn
Het/lw nieuwe/bn boek/zn ligt/ww naast/vz mijn/vnw bord/zn
Lars/eig en/vw Mia/eig spelen/ww voetbal/zn
Jullie/vnw hebben/ww twee/tel nieuwe/bn fietsen/zn
Het/lw is/ww koud/bn dus/vw ik/vnw draag/ww een/lw jas/zn
De/lw dokter/zn helpt/ww het/lw zieke/bn kind/zn
Achter/vz het/lw huis/zn staat/ww een/lw hoge/bn boom/zn
Mijn/vnw oma/zn bakt/ww taart/zn terwijl/vw ik/vnw speel/ww
De/lw eerste/tel les/zn begint/ww om/vz negen/tel uur/zn
`);
