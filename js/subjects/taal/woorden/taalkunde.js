// Gegevens voor zinsoorten, alfabet, synoniemen/antoniemen en persoonsvorm/onderwerp.
// Dit bestand mag je als leerkracht aanpassen of aanvullen. De tests in tests/taalkunde.test.mjs controleren de samenhang.

/* ---- zinnen: soort m (mededelend, eindigt op .), v (vragend, ?), u (uitroepend, !) */
export const ZINSOORTEN = {
  m: ['Ik woon in Gent.', 'De kat slaapt op de bank.', 'Wij gaan morgen naar zee.', 'Mijn zus leest een boek.', 'Het regent vandaag.', 'Papa maakt soep.', 'De bus komt om acht uur.', 'Tom speelt voetbal met zijn vrienden.'],
  v: ['Waar woon jij?', 'Hoe laat is het?', 'Wie heeft mijn pen?', 'Heb jij een hond?', 'Wanneer begint de les?', 'Waarom huil je?', 'Mag ik een koekje?', 'Wat eten we vandaag?'],
  u: ['Wat een mooie tekening!', 'Wat ben jij snel!', 'Hoera, we hebben vakantie!', 'Wat een grote hond!', 'Wat is het koud!', 'Wat ruikt dat lekker!'],
};

/* ---- woorden om alfabetisch te ordenen (alle in kleine letters, enkel a-z) */
export const ALFABET_WOORDEN = ['appel', 'auto', 'aap', 'bal', 'boek', 'boom', 'bus', 'dak', 'deur', 'dier', 'eend', 'ei', 'fiets', 'fles', 'gans', 'gras', 'hand', 'hond', 'huis', 'jas', 'kaas', 'kat', 'koe', 'kip', 'lamp', 'les', 'maan', 'melk', 'muis', 'neus', 'nest', 'oog', 'oor', 'pen', 'peer', 'pop', 'raam', 'roos', 'sok', 'school', 'stoel', 'sap', 'sjaal', 'hoed', 'haas', 'pan', 'pet', 'tafel', 'tas', 'tuin', 'vis', 'vogel', 'wolk', 'zon', 'zee'];

/* ---- synoniemen: groepen van woorden met (bijna) dezelfde betekenis; 'domein' houdt afleiders ver weg van het antwoord */
export const SYNONIEMEN = [
  ['snel', 'vlug'], ['mooi', 'fraai'], ['boos', 'kwaad'], ['blij', 'vrolijk'], ['vader', 'papa'], ['moeder', 'mama'], ['auto', 'wagen'],
  ['sofa', 'zetel'], ['huis', 'woning'], ['dokter', 'arts'], ['fiets', 'rijwiel'], ['praten', 'spreken'], ['beginnen', 'starten'], ['ziek', 'onwel'],
  ['kleren', 'kleding'], ['ruzie', 'twist'], ['stoppen', 'ophouden'], ['baby', 'zuigeling'], ['bang', 'angstig'], ['juf', 'lerares'], ['meester', 'leraar'], ['vuilnis', 'afval'],
  ['rennen', 'hollen'], ['moe', 'vermoeid'], ['kapot', 'stuk'], ['kamer', 'vertrek'], ['begin', 'start'], ['einde', 'slot'],
];
/* ---- antoniemen: tegengestelden; 'domein' staat bij elk paar zodat een afleider nooit uit hetzelfde domein komt */
export const ANTONIEMEN = [
  ['groot', 'klein', 'maat'], ['lang', 'kort', 'maat'], ['dik', 'dun', 'maat'], ['hoog', 'laag', 'maat'], ['warm', 'koud', 'temperatuur'], ['dag', 'nacht', 'tijd'],
  ['vroeg', 'laat', 'tijd'], ['jong', 'oud', 'leeftijd'], ['open', 'dicht', 'toestand'], ['vol', 'leeg', 'toestand'], ['nat', 'droog', 'toestand'],
  ['snel', 'langzaam', 'tempo'], ['blij', 'verdrietig', 'gevoel'], ['boven', 'onder', 'plaats'], ['binnen', 'buiten', 'plaats'], ['ja', 'nee', 'antwoord'],
  ['hard', 'zacht', 'gevoel'], ['sterk', 'zwak', 'kracht'], ['rijk', 'arm', 'bezit'], ['vuil', 'schoon', 'toestand'], ['mooi', 'lelijk', 'uiterlijk'],
  ['makkelijk', 'moeilijk', 'toestand'], ['stil', 'luid', 'geluid'], ['goed', 'slecht', 'oordeel'], ['zoet', 'zuur', 'smaak'],
];

/* ---- zinnen met onderwerp [..]o en persoonsvorm [..]p */
const parse = (tekst) => tekst.trim().split('\n').map(r => ({
  tekst: r.replace(/\[([^\]]+)\]o/, '$1').replace(/\[([^\]]+)\]p/, '$1'), onderwerp: /\[([^\]]+)\]o/.exec(r)[1], pv: /\[([^\]]+)\]p/.exec(r)[1],
}));
export const PERSOONSVORM_ZINNEN = parse(`
[De hond]o [blaft]p luid.
[Anna]o [leest]p een boek.
[Mijn broer]o [speelt]p voetbal.
[De kinderen]o [zwemmen]p in het bad.
[Wij]o [gaan]p naar school.
[De juf]o [schrijft]p op het bord.
[Ik]o [teken]p een huis.
[Jij]o [bent]p mijn vriend.
[Het meisje]o [fietst]p naar huis.
[De vogels]o [zingen]p in de boom.
[Tom en Lotte]o [spelen]p buiten.
[Mama]o [bakt]p een taart.
Morgen [gaan]p [wij]o naar zee.
In de tuin [staat]p [een boom]o.
Vandaag [bakt]p [mama]o een taart.
Op school [leert]p [Mia]o lezen.
Soms [wandelen]p [de kinderen]o naar het park.
Gisteren [zwom]p [ik]o in de zee.
`);
