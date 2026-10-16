// Werkwoorden voor de oefeningen 'werkwoorden spellen'. Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Elke regel: [infinitief, soort, stam, verleden tijd, voltooid deelwoord, hulpwerkwoord, zinsdeel, frequent?]
//   soort    zwak (verleden tijd met 't kofschip), sterk (klinkerwissel) of onregelmatig
//   stam     de stam zoals je die schrijft bij 'ik' (loop, zit, maak, leef)
//   verleden tijd en deelwoord: bij zwakke werkwoorden leeg laten, die worden met 't kofschip gemaakt.
//            Bij sterke en onregelmatige werkwoorden: 'liep/liepen' en 'gelopen'.
//   hulp     'hebben' of 'zijn'; null als beide kunnen (ik heb of ben gelopen): zulke werkwoorden komen niet in de voltooide tijden
//   zinsdeel past in de zin 'Ik weet dat hij elke dag ... loopt': het deel tussen het tijdswoord en het werkwoord
//   1 achteraan = frequent werkwoord (eenvoudigste oefeningen)
// Onregelmatige tegenwoordige tijd (ik ben, hij komt, ...) staat in OTT_UITZONDERING.
// De tests in tests/taal.test.mjs controleren elke regel van deze lijst.

export const WERKWOORDEN = [
  // zwakke werkwoorden
  ['spelen', 'zwak', 'speel', '', '', 'hebben', 'op de speelplaats', 1], ['werken', 'zwak', 'werk', '', '', 'hebben', 'in de tuin', 1],
  ['maken', 'zwak', 'maak', '', '', 'hebben', 'een tekening', 1], ['wonen', 'zwak', 'woon', '', '', 'hebben', 'in Eizeringen', 1],
  ['leren', 'zwak', 'leer', '', '', 'hebben', 'de tafels', 1], ['koken', 'zwak', 'kook', '', '', 'hebben', 'soep', 1],
  ['praten', 'zwak', 'praat', '', '', 'hebben', 'met de buurman', 1], ['bellen', 'zwak', 'bel', '', '', 'hebben', 'naar de dokter', 1],
  ['tekenen', 'zwak', 'teken', '', '', 'hebben', 'een huis', 1], ['luisteren', 'zwak', 'luister', '', '', 'hebben', 'naar muziek', 1],
  ['wachten', 'zwak', 'wacht', '', '', 'hebben', 'op de bus', 1], ['horen', 'zwak', 'hoor', '', '', 'hebben', 'de bel', 1],
  ['fietsen', 'zwak', 'fiets', '', '', null, 'naar huis', 1], ['wandelen', 'zwak', 'wandel', '', '', null, 'in het bos', 1],
  ['dansen', 'zwak', 'dans', '', '', 'hebben', 'op het feest'], ['kussen', 'zwak', 'kus', '', '', 'hebben', 'de poes'],
  ['hopen', 'zwak', 'hoop', '', '', 'hebben', 'op mooi weer'], ['bouwen', 'zwak', 'bouw', '', '', 'hebben', 'een kasteel'],
  ['turnen', 'zwak', 'turn', '', '', 'hebben', 'in de zaal'], ['reizen', 'zwak', 'reis', '', '', 'hebben', 'naar Spanje'],
  ['leven', 'zwak', 'leef', '', '', 'hebben', 'in een dorp'], ['redden', 'zwak', 'red', '', '', 'hebben', 'de kat'],
  ['dromen', 'zwak', 'droom', '', '', 'hebben', 'van vakantie'], ['stoppen', 'zwak', 'stop', '', '', null, 'bij de school'],
  ['rennen', 'zwak', 'ren', '', '', null, 'naar de bus'], ['vertellen', 'zwak', 'vertel', '', '', 'hebben', 'een verhaal'],
  ['bestellen', 'zwak', 'bestel', '', '', 'hebben', 'een pizza'], ['herhalen', 'zwak', 'herhaal', '', '', 'hebben', 'de les'],
  ['ontmoeten', 'zwak', 'ontmoet', '', '', 'hebben', 'een vriend'], ['verhuizen', 'zwak', 'verhuis', '', '', 'zijn', 'naar Gent'],
  ['poetsen', 'zwak', 'poets', '', '', 'hebben', 'de tafel'], ['tellen', 'zwak', 'tel', '', '', 'hebben', 'de punten'],
  ['planten', 'zwak', 'plant', '', '', 'hebben', 'een boom'], ['duwen', 'zwak', 'duw', '', '', 'hebben', 'de deur'],
  ['kloppen', 'zwak', 'klop', '', '', 'hebben', 'op de deur'],
  // sterke werkwoorden
  ['lopen', 'sterk', 'loop', 'liep/liepen', 'gelopen', null, 'naar school', 1], ['komen', 'sterk', 'kom', 'kwam/kwamen', 'gekomen', 'zijn', 'te laat', 1],
  ['zien', 'sterk', 'zie', 'zag/zagen', 'gezien', 'hebben', 'de poes', 1], ['eten', 'sterk', 'eet', 'at/aten', 'gegeten', 'hebben', 'een boterham', 1],
  ['drinken', 'sterk', 'drink', 'dronk/dronken', 'gedronken', 'hebben', 'water', 1], ['geven', 'sterk', 'geef', 'gaf/gaven', 'gegeven', 'hebben', 'de bal', 1],
  ['nemen', 'sterk', 'neem', 'nam/namen', 'genomen', 'hebben', 'de bus', 1], ['schrijven', 'sterk', 'schrijf', 'schreef/schreven', 'geschreven', 'hebben', 'een brief', 1],
  ['vinden', 'sterk', 'vind', 'vond/vonden', 'gevonden', 'hebben', 'de sleutel', 1], ['zitten', 'sterk', 'zit', 'zat/zaten', 'gezeten', null, 'op de bank', 1],
  ['slapen', 'sterk', 'slaap', 'sliep/sliepen', 'geslapen', 'hebben', 'in het bed', 1], ['lezen', 'sterk', 'lees', 'las/lazen', 'gelezen', 'hebben', 'een boek', 1],
  ['zingen', 'sterk', 'zing', 'zong/zongen', 'gezongen', 'hebben', 'een liedje', 1], ['vallen', 'sterk', 'val', 'viel/vielen', 'gevallen', 'zijn', 'van de trap', 1],
  ['helpen', 'sterk', 'help', 'hielp/hielpen', 'geholpen', 'hebben', 'de buurman', 1], ['blijven', 'sterk', 'blijf', 'bleef/bleven', 'gebleven', 'zijn', 'thuis', 1],
  ['kijken', 'sterk', 'kijk', 'keek/keken', 'gekeken', 'hebben', 'naar een film', 1], ['gaan', 'sterk', 'ga', 'ging/gingen', 'gegaan', 'zijn', 'naar huis', 1],
  ['staan', 'sterk', 'sta', 'stond/stonden', 'gestaan', null, 'bij de deur', 1],
  ['bijten', 'sterk', 'bijt', 'beet/beten', 'gebeten', 'hebben', 'in een appel'], ['rijden', 'sterk', 'rijd', 'reed/reden', 'gereden', null, 'naar de winkel'],
  ['vliegen', 'sterk', 'vlieg', 'vloog/vlogen', 'gevlogen', null, 'naar Spanje'], ['zwemmen', 'sterk', 'zwem', 'zwom/zwommen', 'gezwommen', null, 'in het zwembad'],
  ['snijden', 'sterk', 'snijd', 'sneed/sneden', 'gesneden', 'hebben', 'het brood'], ['vergeten', 'sterk', 'vergeet', 'vergat/vergaten', 'vergeten', 'hebben', 'de les'],
  // onregelmatige werkwoorden
  ['brengen', 'onregelmatig', 'breng', 'bracht/brachten', 'gebracht', 'hebben', 'het pakje', 1], ['doen', 'onregelmatig', 'doe', 'deed/deden', 'gedaan', 'hebben', 'het werk', 1],
  ['hebben', 'onregelmatig', 'heb', 'had/hadden', 'gehad', 'hebben', 'honger', 1], ['zijn', 'onregelmatig', '', 'was/waren', 'geweest', 'zijn', 'ziek', 1],
];

// Tegenwoordige tijd die niet uit de stam volgt: { ik, jij, hij, mv } en de fout die leerlingen daarbij maken.
export const OTT_UITZONDERING = {
  zijn: { ik: 'ben', jij: 'bent', hij: 'is', mv: 'zijn', fout: { ik: 'bent', jij: 'ben', hij: 'ben', mv: 'ben' } },
  hebben: { ik: 'heb', jij: 'hebt', hij: 'heeft', mv: 'hebben', fout: { ik: 'hebt', jij: 'heb', hij: 'hebt', mv: 'heben' } },
  gaan: { ik: 'ga', jij: 'gaat', hij: 'gaat', mv: 'gaan', fout: { ik: 'gaat', jij: 'ga', hij: 'ga', mv: 'gaen' } },
  staan: { ik: 'sta', jij: 'staat', hij: 'staat', mv: 'staan', fout: { ik: 'staat', jij: 'sta', hij: 'sta', mv: 'staen' } },
  doen: { ik: 'doe', jij: 'doet', hij: 'doet', mv: 'doen', fout: { ik: 'doet', jij: 'doe', hij: 'doe', mv: 'doe' } },
  zien: { ik: 'zie', jij: 'ziet', hij: 'ziet', mv: 'zien', fout: { ik: 'ziet', jij: 'zie', hij: 'zie', mv: 'zie' } },
  komen: { ik: 'kom', jij: 'komt', hij: 'komt', mv: 'komen', fout: { ik: 'koom', jij: 'koomt', hij: 'koomt', mv: 'koomen' } },
};

// Fouten bij het voltooid deelwoord van werkwoorden waarvan de stam niet 'gewoon' is.
export const FOUT_DEELWOORD = { zijn: 'gezijn', hebben: 'gehebd', gaan: 'gegaat', staan: 'gestaat', doen: 'gedoet', zien: 'gezieet', komen: 'gekomt', brengen: 'gebrengd', vergeten: 'gevergeten' };

const KOFSCHIP = 'tkfschp';
const geenGe = (inf) => /^(ver|her|ont)/.test(inf) || inf === 'bestellen';

function uitRij([inf, soort, stam, ovt, vd, hulp, zinsdeel, frequent]) {
  const w = { inf, soort, stam, hulp, zinsdeel, frequent: !!frequent, ott: OTT_UITZONDERING[inf] || null, geenGe: geenGe(inf) };
  if (soort === 'zwak') {                                         // 't kofschip: laatste letter van de stam van de infinitief (leven -> lev -> v -> -de)
    const letter = inf.slice(0, -2).at(-1), t = KOFSCHIP.includes(letter), uitgang = t ? 'te' : 'de', eind = t ? 't' : 'd';
    w.ovt = [stam + uitgang, stam + uitgang + 'n'];
    w.vd = (w.geenGe ? '' : 'ge') + stam + (stam.endsWith(eind) ? '' : eind);
    w.kofschip = t ? 'te' : 'de';
  } else {
    const [ev, mv] = ovt.split('/');
    w.ovt = [ev, mv]; w.vd = vd;
  }
  return w;
}
export const VERBEN = WERKWOORDEN.map(uitRij);
