// Oefenvormen voor werkwoorden spellen: tegenwoordige tijd, verleden tijd, voltooid deelwoord,
// voltooid tegenwoordige/verleden tijd en toekomende tijd. Elke tijd heeft 8 oefenvormen (via ./woordvormen.js).
// De werkwoorden staan in ../woorden/werkwoorden.js en mogen door de leerkracht aangevuld worden.
//
// Een 'woord' is hier één opgave: een werkwoord in één tijd bij één persoon (bv. hij + lopen + tegenwoordige tijd -> loopt).
import { maakWoordVormen } from './woordvormen.js';
import { geldigeKandidaten } from '../spelregels.js';
import { VERBEN, FOUT_DEELWOORD } from '../woorden/werkwoorden.js';

const NBSP = ' ', BLANCO = '__________';
const PERSONEN = [
  { id: 'ik', tekst: 'ik', mv: false, p: 1 }, { id: 'jij', tekst: 'jij', mv: false, p: 2 }, { id: 'hij', tekst: 'hij', mv: false, p: 3 },
  { id: 'juf', tekst: 'de juf', mv: false, p: 3 }, { id: 'wij', tekst: 'wij', mv: true, p: 1 }, { id: 'jullie', tekst: 'jullie', mv: true, p: 2 },
  { id: 'kinderen', tekst: 'de kinderen', mv: true, p: 3 },
];
const BASIS_PERSONEN = ['ik', 'hij', 'wij', 'kinderen'];
const INTRO = ['Ik weet dat', 'Ik denk dat', 'Ik hoor dat', 'Het is duidelijk dat'];
const TIJDSWOORDEN = {
  ott: ['elke dag', 'vaak', 'altijd', 'soms'], ovt: ['gisteren', 'vorige week', 'vroeger'], vd: ['gisteren', 'vorige week'],
  vtt: ['gisteren', 'vorige week'], vvt: ['toen al', 'gisteren al'], tt: ['morgen', 'volgende week', 'later'],
};
const LABELS = {
  ott: 'Tegenwoordige tijd', ovt: 'Verleden tijd', vd: 'Voltooid deelwoord', vtt: 'Voltooid tegenwoordige tijd', vvt: 'Voltooid verleden tijd', tt: 'Toekomende tijd',
};
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
const kies = (lijst, sleutel) => lijst[hash(sleutel) % lijst.length];

// Hulpwerkwoord bij een persoon.
const HULP = {
  hebben: { ott: ['heb', 'hebt', 'heeft', 'hebben'], ovt: ['had', 'hadden'] },
  zijn: { ott: ['ben', 'bent', 'is', 'zijn'], ovt: ['was', 'waren'] },
};
const hulpOtt = (hulp, pers) => HULP[hulp].ott[pers.mv ? 3 : pers.p - 1];
const hulpOvt = (hulp, pers) => HULP[hulp].ovt[pers.mv ? 1 : 0];
const ANDER = { hebben: 'zijn', zijn: 'hebben' };

function ottVorm(v, pers) {
  if (v.ott) return v.ott[pers.mv ? 'mv' : pers.p === 1 ? 'ik' : pers.p === 2 ? 'jij' : 'hij'];
  if (pers.mv) return v.inf;
  if (pers.p === 1) return v.stam;
  return v.stam.endsWith('t') ? v.stam : v.stam + 't';
}
function ottFout(v, pers, juist) {
  const sleutel = v.inf + pers.id, raw = v.inf.slice(0, -2);
  if (v.ott) return v.ott.fout[pers.mv ? 'mv' : pers.p === 1 ? 'ik' : pers.p === 2 ? 'jij' : 'hij'];
  const kandidaten = pers.mv ? [v.stam + 'en', v.stam, raw] : pers.p === 1 ? [v.stam + 't', raw] : [v.stam, raw + 't', v.stam + 't'];
  const geldig = geldigeKandidaten([...new Set(kandidaten)]).filter(x => x !== juist && x !== v.inf);
  return kies(geldig.length ? geldig : [v.stam + 't'].filter(x => x !== juist), sleutel);
}
const ovtVorm = (v, pers) => v.ovt[pers.mv ? 1 : 0];
function ovtFout(v, pers, juist) {
  const kandidaten = [v.ovt[pers.mv ? 0 : 1]];                      // enkelvoud en meervoud verwisseld
  if (v.soort === 'zwak') kandidaten.push(v.stam + (v.kofschip === 'te' ? 'de' : 'te') + (pers.mv ? 'n' : ''));
  else if (v.stam) kandidaten.push(v.stam + 'de' + (pers.mv ? 'n' : ''));
  return kies([...new Set(kandidaten)].filter(x => x !== juist), v.inf + pers.id);
}
function vdFout(v) {
  if (FOUT_DEELWOORD[v.inf]) return FOUT_DEELWOORD[v.inf];
  if (v.soort === 'zwak') {
    const eind = v.kofschip === 'te' ? 't' : 'd', ander = eind === 't' ? 'd' : 't';
    const kandidaten = v.stam.endsWith(eind) ? [v.vd + eind, v.vd.slice(0, -1) + ander] : [v.vd.slice(0, -1) + ander];
    if (v.geenGe) kandidaten.push('ge' + v.vd);
    const geldig = geldigeKandidaten(kandidaten).filter(x => x !== v.vd);
    return kies(geldig.length ? geldig : [v.vd.slice(0, -1) + ander], v.inf);
  }
  const kand = geldigeKandidaten(['ge' + v.stam + 't', 'ge' + v.inf]);
  return kand[0] || 'ge' + v.inf;
}
const soortOtt = (v, pers) => (v.ott && v.inf !== 'komen' ? 'onregelmatig' : pers.mv ? 'en' : pers.p === 1 || ottVorm(v, pers) === v.stam ? 'geen' : 't');
const soortOvt = (v) => (v.soort === 'zwak' ? v.kofschip : v.soort === 'sterk' ? 'sterk' : 'onregelmatig');
const soortVd = (v) => (v.soort === 'zwak' ? (v.vd.endsWith('t') ? 't' : 'd') : v.soort === 'sterk' ? 'sterk' : 'onregelmatig');

// Bouwt alle opgaven voor één tijd.
function maakOpgaven(tijd) {
  const uit = [];
  for (const v of VERBEN) {
    if ((tijd === 'vd' || tijd === 'vtt' || tijd === 'vvt') && !v.hulp) continue;
    for (const pers of PERSONEN) {
      if (tijd === 'tt' && pers.id === 'jij') continue;                // jij zal / jij zult: beide mogen, dus niet gebruiken
      const sleutel = `${tijd}|${pers.id}|${v.inf}`, tw = kies(TIJDSWOORDEN[tijd], sleutel), intro = kies(INTRO, sleutel + 'i');
      const dat = `${intro} ${pers.tekst}`;
      let naar, fout, soort, voor = pers.tekst, zinVoor, moeilijk = 1;
      if (tijd === 'ott') {
        naar = ottVorm(v, pers); fout = ottFout(v, pers, naar); soort = soortOtt(v, pers);
        zinVoor = `${dat} ${tw} ${v.zinsdeel}`; moeilijk = v.ott ? 3 : v.stam === v.inf.slice(0, -2) ? 1 : 2;
      } else if (tijd === 'ovt') {
        naar = ovtVorm(v, pers); fout = ovtFout(v, pers, naar); soort = soortOvt(v);
        zinVoor = `${dat} ${tw} ${v.zinsdeel}`; moeilijk = v.soort === 'zwak' ? 1 : v.soort === 'sterk' ? 2 : 3;
      } else if (tijd === 'vd') {
        const aux = hulpOtt(v.hulp, pers);
        naar = v.vd; fout = vdFout(v); soort = soortVd(v); voor = `${pers.tekst} ${aux}`;
        zinVoor = `${dat} ${tw} ${v.zinsdeel} ${aux}`; moeilijk = v.soort === 'zwak' ? (v.geenGe ? 2 : 1) : v.soort === 'sterk' ? 2 : 3;
      } else if (tijd === 'vtt' || tijd === 'vvt') {
        const aux = tijd === 'vtt' ? hulpOtt(v.hulp, pers) : hulpOvt(v.hulp, pers), ander = tijd === 'vtt' ? hulpOtt(ANDER[v.hulp], pers) : hulpOvt(ANDER[v.hulp], pers);
        naar = `${aux} ${v.vd}`;
        fout = kies([`${ander} ${v.vd}`, `${aux} ${vdFout(v)}`], sleutel); soort = v.hulp;
        zinVoor = `${dat} ${tw} ${v.zinsdeel}`; moeilijk = (v.soort === 'zwak' ? 1 : 2) + (v.hulp === 'zijn' ? 1 : 0);
      } else {
        const zal = pers.mv ? 'zullen' : 'zal';
        naar = `${zal} ${v.inf}`; fout = `${pers.mv ? 'zal' : 'zullen'} ${v.inf}`; soort = zal;
        zinVoor = `${dat} ${tw} ${v.zinsdeel}`;
      }
      uit.push({
        van: sleutel, naar, fout, soort, delen: [naar], lettergrepen: moeilijk, frequent: v.frequent, kern: v.inf,
        voor, zinVoor, inf: v.inf, label: LABELS[tijd], pers, verb: v, tijd,
        data: { tijd, persoon: pers.tekst, persId: pers.id, inf: v.inf, hulp: v.hulp, tijdLabel: LABELS[tijd], voor },
      });
    }
  }
  return uit;
}

const alleenBasis = (w) => BASIS_PERSONEN.includes(w.pers.id);
const eenvoudig = (w) => w.frequent && !w.verb.ott && w.verb.soort !== 'onregelmatig';
const frequent = (w) => w.frequent;

function maakFamilie({ tijd, doelen, niveau, soorten, regelSoorten, titel, keuzeLabel, alleLabel }) {
  const label = LABELS[tijd];
  return maakWoordVormen({
    prefix: `ww-${tijd}`, doelen, naam: 'werkwoord', woorden: maakOpgaven(tijd), niveau, soorten, regelSoorten,
    keuzeGroep: `ww-${tijd}`, keuzeLabel, alleLabel, verdeling: 'woord',
    paar: (w, x) => `${label}: ${w.voor} ${x} (${w.inf})`,
    vraag: (w) => `${label}:${NBSP.repeat(3)}${w.voor} ${BLANCO} (${w.inf})`,
    kiesTekst: (w, o) => `${label}:${NBSP.repeat(3)}${w.voor} ${o[0]}${NBSP.repeat(6)}of${NBSP.repeat(6)}${o[1]} (${w.inf})`,
    links: (w) => `${w.voor} (${w.inf})`,
    kleurLabel: (w, x) => `${w.voor} ${x}`, rijtje: (w, x) => `${w.voor} ${x}`,
    zin: (r, w, x) => ({ n: '', tekst: `${w.zinVoor} ${x}.` }),
    hint: (w) => `(${w.inf})`,
    invulTitel: `${titel} schrijven`, invulOpdracht: 'Schrijf het werkwoord in de juiste vorm op de lijn.',
    zinOpdracht: 'Schrijf het werkwoord tussen haakjes in de juiste vorm. Vul de zin aan.',
    verbindOpdracht: 'Verbind elk werkwoord met de juiste vorm. Trek een lijn.',
    regelTitel: 'Welke regel?', regelOpdracht: 'Welke regel hoort bij dit werkwoord? Omcirkel.',
    zonder: ['lettergrepen'],
  });
}

const OTT = maakFamilie({
  tijd: 'ott', titel: 'Tegenwoordige tijd', keuzeLabel: 'Welke vormen oefenen?', alleLabel: 'Alle vormen door elkaar',
  doelen: ['1.3.GL2.28', '1.3.GL3.18', '1.3.GL4.20', '1.3.GL5.28', '1.3.GL6.19'],
  niveau: {
    '1.3.GL2.28': (w) => eenvoudig(w) && alleenBasis(w), '1.3.GL3.18': eenvoudig, '1.3.GL4.20': () => true, '1.3.GL5.28': frequent, '1.3.GL6.19': frequent,
  },
  soorten: [{ id: 'geen', label: 'stam', keuze: 'Enkel de stam (ik loop, hij zit)' }, { id: 't', label: 'stam + t', keuze: 'Enkel stam + t (hij loopt)' },
    { id: 'en', label: '-en', keuze: 'Enkel meervoud op -en (wij lopen)' }, { id: 'onregelmatig', label: 'onregelmatig', keuze: 'Enkel onregelmatige werkwoorden (ik ben, hij heeft)' }],
  regelSoorten: ['geen', 't', 'en'],
});
const OVT = maakFamilie({
  tijd: 'ovt', titel: 'Verleden tijd', keuzeLabel: 'Welke werkwoorden oefenen?', alleLabel: 'Zwakke, sterke en onregelmatige door elkaar',
  doelen: ['1.3.GL3.19', '1.3.GL5.29', '1.3.GL6.20'],
  niveau: { '1.3.GL3.19': (w) => frequent(w) && alleenBasis(w), '1.3.GL5.29': frequent, '1.3.GL6.20': frequent },
  soorten: [{ id: 'te', label: '-te(n)', keuze: "Enkel zwakke werkwoorden met -te(n) ('t kofschip: werkte)" }, { id: 'de', label: '-de(n)', keuze: 'Enkel zwakke werkwoorden met -de(n) (speelde)' },
    { id: 'sterk', label: 'klinkerwissel', keuze: 'Enkel sterke werkwoorden (liep)' }, { id: 'onregelmatig', label: 'onregelmatig', keuze: 'Enkel onregelmatige werkwoorden (had, was)' }],
  regelSoorten: ['te', 'de', 'sterk'],
});
const VD = maakFamilie({
  tijd: 'vd', titel: 'Voltooid deelwoord', keuzeLabel: 'Welke werkwoorden oefenen?', alleLabel: 'Zwakke, sterke en onregelmatige door elkaar',
  doelen: ['1.3.GL4.21', '1.3.GL5.30'], niveau: { '1.3.GL4.21': frequent, '1.3.GL5.30': () => true },
  soorten: [{ id: 't', label: '-t', keuze: "Enkel zwakke werkwoorden op -t ('t kofschip: gewerkt)" }, { id: 'd', label: '-d', keuze: 'Enkel zwakke werkwoorden op -d (gespeeld)' },
    { id: 'sterk', label: '-en', keuze: 'Enkel sterke werkwoorden (gelopen)' }, { id: 'onregelmatig', label: 'onregelmatig', keuze: 'Enkel onregelmatige werkwoorden (gedaan, gehad)' }],
  regelSoorten: ['t', 'd', 'sterk'],
});
const VP = (() => {                                                   // voltooid tegenwoordige en voltooid verleden tijd in één familie
  const tt = maakOpgaven('vtt'), vt = maakOpgaven('vvt'), label = 'Voltooide tijd';
  const woorden = [...tt, ...vt];
  return maakWoordVormen({
    prefix: 'ww-vp', doelen: ['1.3.GL5.31', '1.3.GL6.21'], naam: 'werkwoord', woorden, niveau: { '1.3.GL5.31': frequent, '1.3.GL6.21': () => true },
    soorten: [{ id: 'hebben', label: 'hebben', keuze: 'Enkel werkwoorden met hebben (heeft gespeeld)' }, { id: 'zijn', label: 'zijn', keuze: 'Enkel werkwoorden met zijn (is gegaan)' }],
    keuzeGroep: 'ww-vp', keuzeLabel: 'Welke werkwoorden oefenen?', alleLabel: 'Werkwoorden met hebben en met zijn door elkaar', verdeling: 'woord',
    paar: (w, x) => `${w.label}: ${w.voor} ${x} (${w.inf})`,
    vraag: (w) => `${w.label}:${NBSP.repeat(3)}${w.voor} ${BLANCO} (${w.inf})`,
    kiesTekst: (w, o) => `${w.label}:${NBSP.repeat(3)}${w.voor} ${o[0]}${NBSP.repeat(6)}of${NBSP.repeat(6)}${o[1]} (${w.inf})`,
    links: (w) => `${w.voor} (${w.inf})`, kleurLabel: (w, x) => `${w.voor} ${x}`, rijtje: (w, x) => `${w.voor} ${x}`,
    zin: (r, w, x) => ({ n: '', tekst: `${w.zinVoor} ${x}.` }), hint: (w) => `(${w.inf})`,
    invulTitel: 'Voltooide tijd schrijven', invulOpdracht: 'Schrijf het hulpwerkwoord en het voltooid deelwoord op de lijn.',
    zinOpdracht: 'Schrijf het werkwoord tussen haakjes in de voltooide tijd. Vul de zin aan.', verbindOpdracht: 'Verbind elk werkwoord met de juiste vorm. Trek een lijn.',
    regelTitel: 'Hebben of zijn?', regelOpdracht: 'Welk hulpwerkwoord hoort bij dit werkwoord? Omcirkel hebben of zijn.', zonder: ['lettergrepen'],
  });
})();
const TT = maakFamilie({
  tijd: 'tt', titel: 'Toekomende tijd', keuzeLabel: 'Welke vormen oefenen?', alleLabel: 'Zal en zullen door elkaar',
  doelen: ['1.3.GL6.22'], niveau: { '1.3.GL6.22': () => true },
  soorten: [{ id: 'zal', label: 'zal', keuze: 'Enkel zal (ik zal, hij zal)' }, { id: 'zullen', label: 'zullen', keuze: 'Enkel zullen (wij zullen)' }],
});

export const WERKWOORDEN_FAMILIES = { ott: OTT, ovt: OVT, vd: VD, vp: VP, tt: TT };
export const WERKWOORDEN_VORMEN = [...OTT.vormen, ...OVT.vormen, ...VD.vormen, ...VP.vormen, ...TT.vormen];
