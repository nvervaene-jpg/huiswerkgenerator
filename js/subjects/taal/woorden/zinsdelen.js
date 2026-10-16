// Zinnen met zinsdelen: onderwerp (o), gezegde (g, ook de losse stukken ervan), naamwoordelijk deel van het gezegde (ng),
// lijdend voorwerp (lv), meewerkend voorwerp (mv) en bijwoordelijke bepaling (b). Dit bestand mag je als leerkracht aanpassen of aanvullen.
// Elk zinsdeel staat tussen [ ] met de rol erachter: [De hond]o [blaft]g [luid]b.
// Een gezegde dat in twee stukken uiteenvalt (hebben ... gekocht) krijgt twee keer de rol g.
// De tests in tests/zinsdelen.test.mjs controleren de samenhang.

const lees = (tekst) => tekst.trim().split('\n').map((r) => {
  const delen = [...r.matchAll(/\[([^\]]+)\](\w+)/g)].map(m => ({ tekst: m[1], rol: m[2] }));
  const punt = r.trim().at(-1);
  return { delen, tekst: delen.map(d => d.tekst).join(' ') + punt, punt, soort: delen.some(d => d.rol === 'ng') ? 'naamwoordelijk' : 'werkwoordelijk' };
});

export const ZINNEN = lees(`
[De hond]o [blaft]g [luid]b.
[Anna]o [leest]g [een boek]lv.
[Tom]o [geeft]g [zijn zus]mv [een cadeau]lv.
[De juf]o [schrijft]g [een woord]lv [op het bord]b.
[Mama]o [bakt]g [een taart]lv.
[De kinderen]o [zwemmen]g [in het bad]b.
[Wij]o [hebben]g [een hond]lv [gekocht]g.
[Lotte]o [heeft]g [de bal]lv [gegooid]g.
[Papa]o [vertelt]g [de kinderen]mv [een verhaal]lv.
[De juf]o [toont]g [de leerlingen]mv [een film]lv.
[Opa]o [stuurt]g [mij]mv [een kaartje]lv.
[Emma]o [koopt]g [haar moeder]mv [een bloem]lv.
[Morgen]b [gaat]g [Tom]o [naar zee]b.
[Vandaag]b [bakt]g [mama]o [een taart]lv.
[De vogels]o [zingen]g [een lied]lv.
[Sam]o [tilt]g [de zware doos]lv.
[De jongen]o [bouwt]g [een toren]lv [in de tuin]b.
[Het meisje]o [eet]g [een appel]lv.
[De bus]o [komt]g [om acht uur]b.
[Zij]o [wachten]g [op de trein]b.
[Ik]o [teken]g [een huis]lv.
[De bakker]o [geeft]g [de klant]mv [een brood]lv.
[Het gras]o [is]g [groen]ng.
[De soep]o [smaakt]g [lekker]ng.
[Mijn broer]o [wordt]g [dokter]ng.
[Ik]o [ben]g [blij]ng.
[De kat]o [blijft]g [ziek]ng.
[Het water]o [lijkt]g [koud]ng.
[Wij]o [zijn]g [vrienden]ng.
[Tom]o [is]g [mijn neef]ng.
`);

// Zinnen om enkelvoudig/samengesteld en bevestigend/ontkennend te herkennen: [zin, soort (e of s), ontkennend?]
export const ZINSTYPES = [
  ['De hond blaft.', 'e', false], ['Ik lees een boek.', 'e', false], ['Wij gaan naar school.', 'e', false], ['De kat slaapt op de stoel.', 'e', false], ['Mama bakt een taart.', 'e', false], ['Tom speelt buiten.', 'e', false],
  ['De hond blaft niet.', 'e', true], ['Ik heb geen boek.', 'e', true], ['Wij gaan niet naar school.', 'e', true], ['De kat slaapt niet.', 'e', true], ['Mama bakt geen taart.', 'e', true], ['Tom speelt niet buiten.', 'e', true],
  ['De zon schijnt en de vogels zingen.', 's', false], ['Ik wil buiten spelen maar het regent.', 's', false], ['Wij blijven thuis want het regent.', 's', false],
  ['Tom lacht omdat de film grappig is.', 's', false], ['Anna leest een boek en Tom tekent een huis.', 's', false], ['Mama kookt en papa doet de afwas.', 's', false],
  ['Wij gaan niet naar buiten want het regent.', 's', true], ['Ik wil niet spelen maar ik wil tekenen.', 's', true],
];
