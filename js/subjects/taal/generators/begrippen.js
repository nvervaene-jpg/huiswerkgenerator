// Oefenvormen voor begrippen en weetjes van het taalsysteem: klanken, tekens, hoofdletters, trappen van vergelijking, figuurlijk taalgebruik,
// hyponiemen, formeel en informeel, communicatiemodel, opdrachtwoorden, bijzondere spelling, klankzuivere woorden en zinsdelen verplaatsen.
// De gegevens staan in ../woorden/begrippen.js.
import { vorm, kies, basisOefening } from './taalkunde.js';
import * as D from '../woorden/begrippen.js';

const NBSP = ' ';
const jaarVan = (doel) => Number(/GL(\d)/.exec(doel || '')?.[1] || 6);
const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
// Meerkeuze met de opties naast elkaar onder de vraag; de volgorde is gehusseld.
function kiesOef(r, { vraag, opties, antwoord, kern, volledig, data, moeilijkheid = 0 }) {
  const lijst = r.schud([...new Set([antwoord, ...opties])]);
  if (lijst.length < 2) return null;
  return basisOefening({ tekst: `${vraag}\n${lijst.join(NBSP.repeat(5))}`, antwoord, volledig: volledig || `${vraag.replace(/____/, antwoord)}`, kern, sleutel: `${kern}|${lijst.slice().sort().join()}`, moeilijkheid: [moeilijkheid], data: { ...data, vraag, opties: lijst, goed: antwoord } });
}
const invulOef = (vraagTekst, antwoord, kern, data, volledig, moeilijkheid = 0) => basisOefening({ tekst: vraagTekst, antwoord, volledig: volledig || vraagTekst.replace(/_+/, antwoord), kern, sleutel: kern, moeilijkheid: [moeilijkheid], data: { ...data, goed: antwoord } });

/* ------------------------------------------------------------------ klanken */
export const KLINKER_SOORT = { kort: 'korte klinker', lang: 'lange klinker', tweeteken: 'tweetekenklinker' };
const KLANK_LIJST = [
  ...['a', 'e', 'i', 'o', 'u'].map(k => [k, 'korte klinker']), ...['aa', 'ee', 'oo', 'uu'].map(k => [k, 'lange klinker']),
  ...['ie', 'oe', 'eu', 'ui', 'ei', 'ij', 'ou', 'au'].map(k => [k, 'tweetekenklinker']), ...['b', 'd', 'k', 'm', 'p', 's', 't', 'z', 'l', 'r'].map(k => [k, 'medeklinker']),
];
export const KLANKEN_DOELEN = ['1.5.GL1.3', '1.5.GL2.8', '1.5.GL2.9', '1.5.GL2.10'];
const klank = vorm({
  id: 'kb-klank', titel: 'Klinkers en medeklinkers', pictogram: 'omcirkelen', opdracht: 'Lees. Omcirkel het juiste antwoord.', doelen: KLANKEN_DOELEN, rang: 1, basis: true,
  bouw: (r, o) => {
    if (o.doel === '1.5.GL1.3') {
      const v = r.geheel(0, 1);
      if (v === 0) { const klinker = r.volgende() < 0.5, l = klinker ? kies(r, D.KLINKERS) : kies(r, D.MEDEKLINKERS); return kiesOef(r, { vraag: `Is de letter ${l} een klinker of een medeklinker? ____`, opties: ['klinker', 'medeklinker'], antwoord: klinker ? 'klinker' : 'medeklinker', kern: `kl${l}`, data: { type: 'kb-klank', soort: 'letter', letter: l } }); }
      const w = kies(r, D.BEGIN_WOORDEN), eerste = w[0], klinker = D.KLINKERS.includes(eerste);
      return kiesOef(r, { vraag: `Het woord ${w} begint met een ____.`, opties: ['klinker', 'medeklinker'], antwoord: klinker ? 'klinker' : 'medeklinker', kern: `kb${w}`, data: { type: 'kb-klank', soort: 'begin', woord: w } });
    }
    if (r.volgende() < 0.5) { const [k, s] = kies(r, KLANK_LIJST); return kiesOef(r, { vraag: `De klank "${k}" is een ____.`, opties: ['korte klinker', 'lange klinker', 'tweetekenklinker', 'medeklinker'].filter(x => x !== s).slice(0, 3), antwoord: s, kern: `kk${k}`, data: { type: 'kb-klank', soort: 'klank', klank: k } }); }
    const sleutel = kies(r, ['kort', 'lang', 'tweeteken']), w = kies(r, D.KLINKER_WOORDEN[sleutel]);
    return kiesOef(r, { vraag: `Welke klinker hoor je in het woord ${w}? ____`, opties: Object.values(KLINKER_SOORT), antwoord: KLINKER_SOORT[sleutel], kern: `kw${w}`, data: { type: 'kb-klank', soort: 'woord', woord: w, klinker: sleutel } });
  },
});
const paar = vorm({
  id: 'kb-paar', titel: 'Korte of lange klinker?', pictogram: 'omcirkelen', opdracht: 'Welk woord heeft een lange klinker? Omcirkel.', doelen: ['1.5.GL1.4'], rang: 2,
  bouw: (r) => {
    const [k, l] = kies(r, D.KLINKER_PAREN), links = r.volgende() < 0.5, lang = r.volgende() < 0.5, [a, b] = links ? [k, l] : [l, k];
    return kiesOef(r, { vraag: `Welk woord heeft een ${lang ? 'lange' : 'korte'} klinker? ____`, opties: [lang ? k : l], antwoord: lang ? l : k, kern: `${k}|${l}`, data: { type: 'kb-paar', kort: k, lang: l, lange: lang, volgorde: [a, b] }, volledig: `${k} (korte klinker) - ${l} (lange klinker)` });
  },
});

/* ------------------------------------------------------------------ letters */
const ALFABET = 'abcdefghijklmnopqrstuvwxyz';
const letter = vorm({
  id: 'kb-letter', titel: 'Hoofdletter en kleine letter', pictogram: 'schrijven', opdracht: 'Lees. Schrijf het antwoord op de lijn.', doelen: ['1.5.GL2.11'], rang: 3,
  bouw: (r) => {
    const i = r.geheel(0, 25), l = ALFABET[i], v = r.geheel(0, 3);
    if (v === 0) return invulOef(`De hoofdletter bij ${l} is ____.`, l.toUpperCase(), `lh${l}`, { type: 'kb-letter', soort: 'hoofd', letter: l });
    if (v === 1) return invulOef(`De kleine letter bij ${l.toUpperCase()} is ____.`, l, `lk${l}`, { type: 'kb-letter', soort: 'klein', letter: l });
    if (v === 2 && i < 25) return invulOef(`Welke letter komt na ${l} in het alfabet? ____`, ALFABET[i + 1], `ln${l}`, { type: 'kb-letter', soort: 'na', letter: l });
    if (i > 0) return invulOef(`Welke letter komt voor ${l} in het alfabet? ____`, ALFABET[i - 1], `lv${l}`, { type: 'kb-letter', soort: 'voor', letter: l });
    return null;
  },
});

/* ------------------------------------------------------------------ tekens */
export const TEKEN_DOELEN = ['1.5.GL2.13', '1.5.GL4.37', '1.5.GL5.6', '1.5.GL5.26', '1.5.GL6.5'];
const bekendeTekens = (doel) => D.TEKENS.filter(t => jaarVan(t.doel[0]) <= jaarVan(doel));
const tekenNaam = vorm({
  id: 'kb-teken-naam', titel: 'Hoe heet dit teken?', pictogram: 'omcirkelen', opdracht: 'Hoe heet het teken? Omcirkel.', doelen: TEKEN_DOELEN, rang: 1,
  bouw: (r, o) => {
    const focus = D.TEKENS.filter(t => t.doel.includes(o.doel)), bekend = bekendeTekens(o.doel), t = kies(r, focus.length && r.volgende() < 0.6 ? focus : bekend), naarNaam = r.volgende() < 0.5;
    if (naarNaam) {
      const namen = [...bekend.map(x => x.naam), ...D.TEKEN_NAMEN_ALGEMEEN].filter(n => n !== t.naam);
      return kiesOef(r, { vraag: `Hoe heet het teken ${t.teken}? ____`, opties: r.schud([...new Set(namen)]).slice(0, 3), antwoord: t.naam, kern: `tn${t.id}`, data: { type: 'kb-teken', soort: 'naam', teken: t.id } });
    }
    const tekens = [...bekend.map(x => x.teken), '.', '?', '!'].filter(x => x !== t.teken);
    return kiesOef(r, { vraag: `Welk teken is de ${t.naam}? ____`, opties: r.schud([...new Set(tekens)]).slice(0, 3), antwoord: t.teken, kern: `tt${t.id}`, data: { type: 'kb-teken', soort: 'teken', teken: t.id } });
  },
});
const tekenGebruik = vorm({
  id: 'kb-teken-gebruik', titel: 'Welk teken hoort er?', pictogram: 'omcirkelen', opdracht: 'Welk teken hoort op de plaats van __? Omcirkel.', doelen: TEKEN_DOELEN, rang: 2,
  bouw: (r, o) => {
    const pool = D.TEKENS.filter(t => t.doel.includes(o.doel)), t = kies(r, pool), [zin, goed, fout] = kies(r, t.gebruik);
    return kiesOef(r, { vraag: zin, opties: fout, antwoord: goed, kern: `tg${t.id}${zin}`, data: { type: 'kb-teken', soort: 'gebruik', teken: t.id, zin }, volledig: `${zin.replace(/__/, goed.split(' ')[0]).replace(/__/, goed.split(' ')[1] || goed)}` });
  },
});

/* ------------------------------------------------------------------ trappen van vergelijking */
const TRAP_DOELEN = ['1.5.GL4.1', '1.5.GL4.2'];
const trapZin = (r, rij, trap) => {
  const [a, b] = r.schud(D.NAMEN_KINDEREN).slice(0, 2);
  return trap === 0 ? `${a} is ${rij[0]}.` : trap === 1 ? `${a} is ${rij[1]} dan ${b}.` : `${a} is het ${rij[2]} van allemaal.`;
};
const trapHerken = vorm({
  id: 'kb-trap-herken', titel: 'Welke trap?', pictogram: 'omcirkelen', opdracht: 'In welke trap staat het bijvoeglijk naamwoord? Omcirkel.', doelen: TRAP_DOELEN, rang: 1, basis: true,
  bouw: (r) => {
    const rij = kies(r, D.TRAPPEN), trap = r.geheel(0, 2), zin = trapZin(r, rij, trap);
    return kiesOef(r, { vraag: `${zin} ____`, opties: D.TRAP_NAMEN.filter((_, i) => i !== trap), antwoord: D.TRAP_NAMEN[trap], kern: `th${rij[0]}${trap}`, data: { type: 'kb-trap', soort: 'herken', rij, trap, zin }, volledig: `${zin} → ${D.TRAP_NAMEN[trap]}` });
  },
});
const trapVorm = vorm({
  id: 'kb-trap-vorm', titel: 'De trappen van vergelijking', pictogram: 'schrijven', opdracht: 'Vul de ontbrekende trap aan.', doelen: TRAP_DOELEN, rang: 2,
  bouw: (r) => {
    const rij = kies(r, D.TRAPPEN), gat = r.geheel(1, 2), tekst = rij.map((w, i) => (i === gat ? '____' : w)).join(' - ');
    return invulOef(tekst, rij[gat], `tv${rij[0]}${gat}`, { type: 'kb-trap', soort: 'vorm', rij, gat }, rij.join(' - '), 1);
  },
});

/* ------------------------------------------------------------------ figuurlijk taalgebruik */
const FIG_DOELEN = ['1.5.GL3.7', '1.5.GL4.3', '1.5.GL4.4'];
const figBetekenis = vorm({
  id: 'kb-figuurlijk-betekenis', titel: 'Wat betekent de uitdrukking?', pictogram: 'omcirkelen', opdracht: 'Dit is een uitdrukking. Wat bedoelt men? Omcirkel.', doelen: FIG_DOELEN, rang: 1, basis: true, schaal: 0.8,
  bouw: (r) => {
    const u = kies(r, D.UITDRUKKINGEN), fout = r.schud(D.UITDRUKKINGEN.filter(x => x !== u)).slice(0, 2).map(x => x.betekenis);
    return kiesOef(r, { vraag: `${u.zin} Dat betekent: ____`, opties: fout, antwoord: u.betekenis, kern: u.zin, data: { type: 'kb-figuurlijk', soort: 'betekenis', zin: u.zin }, volledig: `${u.zin} → ${u.betekenis}`, moeilijkheid: 1 });
  },
});
const figSoort = vorm({
  id: 'kb-figuurlijk-soort', titel: 'Letterlijk of figuurlijk?', pictogram: 'omcirkelen', opdracht: 'Wordt de zin letterlijk of figuurlijk bedoeld? Omcirkel.', doelen: FIG_DOELEN, rang: 2, schaal: 0.8,
  bouw: (r) => {
    const fig = r.volgende() < 0.5, zin = fig ? kies(r, D.UITDRUKKINGEN).zin : kies(r, D.LETTERLIJKE_ZINNEN);
    return kiesOef(r, { vraag: `${zin} ____`, opties: ['letterlijk', 'figuurlijk'], antwoord: fig ? 'figuurlijk' : 'letterlijk', kern: zin, data: { type: 'kb-figuurlijk', soort: 'soort', zin, fig }, volledig: `${zin} → ${fig ? 'figuurlijk' : 'letterlijk'}` });
  },
});

/* ------------------------------------------------------------------ hyponiemen */
const HYP_DOELEN = ['1.5.GL5.1'];
const hypKies = vorm({
  id: 'kb-hyponiem', titel: 'Het overkoepelende woord', pictogram: 'omcirkelen', opdracht: 'Welk woord past boven de andere woorden? Omcirkel.', doelen: HYP_DOELEN, rang: 1, basis: true,
  bouw: (r) => {
    const namen = Object.keys(D.CATEGORIEEN), cat = kies(r, namen), leden = r.schud(D.CATEGORIEEN[cat]).slice(0, 3), fout = r.schud(namen.filter(n => n !== cat)).slice(0, 2);
    return kiesOef(r, { vraag: `Welk woord past boven ${leden.join(', ')}? ____`, opties: fout, antwoord: cat, kern: `hy${cat}${leden.slice().sort().join()}`, data: { type: 'kb-hyponiem', soort: 'boven', cat, leden }, volledig: `${leden.join(', ')} → ${cat}`, moeilijkheid: 1 });
  },
});
const hypOngelijk = vorm({
  id: 'kb-hyponiem-ongelijk', titel: 'Welk woord hoort er niet bij?', pictogram: 'omcirkelen', opdracht: 'Drie woorden horen bij elkaar. Eén woord hoort er niet bij. Omcirkel dat woord.', doelen: HYP_DOELEN, rang: 2,
  bouw: (r) => {
    const namen = Object.keys(D.CATEGORIEEN), cat = kies(r, namen), anders = kies(r, namen.filter(n => n !== cat)), leden = r.schud(D.CATEGORIEEN[cat]).slice(0, 3), vreemd = kies(r, D.CATEGORIEEN[anders]);
    const alle = r.schud([...leden, vreemd]);
    return basisOefening({ tekst: alle.join(NBSP.repeat(6)), antwoord: vreemd, volledig: `${vreemd} hoort er niet bij (${leden.join(', ')} zijn ${cat})`, kern: `ho${cat}${vreemd}`, sleutel: `ho${alle.slice().sort().join()}`, moeilijkheid: [1], data: { type: 'kb-hyponiem', soort: 'ongelijk', cat, leden, vreemd, goed: vreemd, vraag: alle.join(' '), opties: alle } });
  },
});

/* ------------------------------------------------------------------ formeel en informeel */
const REG_DOELEN = ['1.5.GL4.33', '1.5.GL4.34', '1.5.GL5.2', '1.5.GL6.1'];
const regHerken = vorm({
  id: 'kb-register-herken', titel: 'Formeel of informeel?', pictogram: 'omcirkelen', opdracht: 'Is de zin formeel of informeel? Omcirkel.', doelen: REG_DOELEN, rang: 1, basis: true, schaal: 0.8,
  bouw: (r) => {
    const p = kies(r, D.REGISTER_PAREN), formeel = r.volgende() < 0.5, zin = formeel ? p[1] : p[0];
    return kiesOef(r, { vraag: `${zin} ____`, opties: ['formeel', 'informeel'], antwoord: formeel ? 'formeel' : 'informeel', kern: zin, data: { type: 'kb-register', soort: 'herken', zin, formeel }, volledig: `${zin} → ${formeel ? 'formeel' : 'informeel'}` });
  },
});
const regSituatie = vorm({
  id: 'kb-register-situatie', titel: 'Welke zin past?', pictogram: 'omcirkelen', opdracht: 'Welke zin past bij de situatie? Omcirkel.', doelen: REG_DOELEN, rang: 2, schaal: 0.8,
  bouw: (r) => {
    const s = kies(r, D.REGISTER_SITUATIES), p = kies(r, D.REGISTER_PAREN), formeel = s.register === 'formeel', goed = formeel ? p[1] : p[0], fout = formeel ? p[0] : p[1];
    return kiesOef(r, { vraag: `${s.situatie} Welke zin past? ____`, opties: [fout], antwoord: goed, kern: `${s.situatie}${p[0]}`, data: { type: 'kb-register', soort: 'situatie', situatie: s.situatie, register: s.register, paar: p }, volledig: `${s.situatie} → ${goed}`, moeilijkheid: 1 });
  },
});

/* ------------------------------------------------------------------ communicatiemodel */
const comRol = vorm({
  id: 'kb-communicatie', titel: 'Zender, ontvanger, boodschap en kanaal', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Wie of wat is het? Omcirkel.', doelen: ['1.5.GL3.27'], rang: 1, basis: true, schaal: 0.8,
  bouw: (r) => {
    const c = kies(r, D.COMMUNICATIE), rol = kies(r, ['zender', 'ontvanger', 'boodschap', 'kanaal']);
    const alle = { zender: D.COMMUNICATIE.map(x => x.zender), ontvanger: D.COMMUNICATIE.map(x => x.ontvanger), boodschap: D.COMMUNICATIE.map(x => x.boodschap), kanaal: D.KANALEN_ALLE }[rol];
    const fout = r.schud([...new Set(alle)].filter(x => x !== c[rol])).slice(0, 2);
    return kiesOef(r, { vraag: `${c.zin} Wat is de ${rol}? ____`, opties: fout, antwoord: c[rol], kern: `cm${c.zender}${rol}`, data: { type: 'kb-communicatie', soort: rol, zin: c.zin, c: c.zender }, volledig: `${c.zin} → ${rol}: ${c[rol]}`, moeilijkheid: 1 });
  },
});
const comMedium = vorm({
  id: 'kb-medium', titel: 'Welk medium?', pictogram: 'omcirkelen', opdracht: 'Welk medium wordt bedoeld? Omcirkel.', doelen: ['1.5.GL5.23'], rang: 2, schaal: 0.8,
  bouw: (r) => {
    const m = kies(r, D.MEDIA);
    return kiesOef(r, { vraag: `${m.cue} Welk medium is dat? ____`, opties: r.schud(D.MEDIA_NAMEN.filter(x => x !== m.medium)).slice(0, 2), antwoord: m.medium, kern: `md${m.medium}`, data: { type: 'kb-communicatie', soort: 'medium', cue: m.cue }, volledig: `${m.cue} → ${m.medium}` });
  },
});

/* ------------------------------------------------------------------ opdrachtwoorden */
const OPDRACHT_DOELEN = ['1.5.GL1.1', '1.5.GL2.6', '1.5.GL3.8', '1.5.GL4.6', '1.5.GL5.5', '1.5.GL6.4'];
const opdrachtWoord = vorm({
  id: 'kb-opdracht', titel: 'Wat moet je doen?', pictogram: 'omcirkelen', opdracht: 'Wat moet je doen bij dit woord in een opdracht? Omcirkel.', doelen: OPDRACHT_DOELEN, rang: 1, basis: true, schaal: 0.8,
  bouw: (r, o) => {
    const j = jaarVan(o.doel), pool = D.OPDRACHTWOORDEN.filter(w => w.jaar <= j), w = kies(r, pool.filter(x => x.jaar >= Math.max(1, j - 2)).length >= 3 ? pool.filter(x => x.jaar >= Math.max(1, j - 2)) : pool);
    const fout = r.schud(pool.filter(x => x !== w)).slice(0, 2).map(x => x.doen);
    return kiesOef(r, { vraag: `Wat moet je doen bij "${w.woord}"? ____`, opties: fout, antwoord: w.doen, kern: `ow${w.woord}`, data: { type: 'kb-opdracht', woord: w.woord }, volledig: `${w.woord}: ${w.doen}` });
  },
});

/* ------------------------------------------------------------------ bijzondere spelling en klankzuivere woorden */
const SB_DOELEN = Object.values(D.SPELLING_BIJZONDER).flatMap(s => s.doel);
const spellingKies = vorm({
  id: 'sb-kies', titel: 'Welke spelling is juist?', pictogram: 'omcirkelen', opdracht: 'Welk woord is juist geschreven? Omcirkel.', doelen: SB_DOELEN, rang: 1, basis: true,
  bouw: (r, o) => {
    const groep = Object.entries(D.SPELLING_BIJZONDER).find(([, s]) => s.doel.includes(o.doel)), [id, s] = groep, [goed, fout] = kies(r, s.woorden), links = r.volgende() < 0.5;
    return basisOefening({ tekst: `${links ? goed : fout}${NBSP.repeat(8)}${links ? fout : goed}`, antwoord: goed, volledig: `${goed} (${s.label})`, kern: goed, sleutel: `${goed}|${links}`, moeilijkheid: [1], data: { type: 'sb-kies', klank: id, goed, fout, vraag: `${links ? goed : fout} ${links ? fout : goed}`, opties: links ? [goed, fout] : [fout, goed] } });
  },
});
const spellingAanvul = vorm({
  id: 'sb-schrijf', titel: 'Schrijf het woord', pictogram: 'schrijven', opdracht: 'Zo hoor je het woord. Schrijf het juist op de lijn.', doelen: SB_DOELEN, rang: 2,
  bouw: (r, o) => {
    const [id, s] = Object.entries(D.SPELLING_BIJZONDER).find(([, x]) => x.doel.includes(o.doel)), [goed, fout] = kies(r, s.woorden);
    return invulOef(`${fout}${NBSP.repeat(4)}→${NBSP.repeat(4)}____________`, goed, `sw${goed}`, { type: 'sb-schrijf', klank: id, goed, fout }, `${fout} → ${goed}`, 1);
  },
});
const KZ_DOELEN = [...new Set(Object.values(D.KLANKZUIVER).flatMap(s => s.doel))];
const klankzuiver = vorm({
  id: 'kz-aanvul', titel: 'f of v, s of z op het einde?', pictogram: 'omcirkelen', opdracht: 'Welke letter staat op het einde van het woord? Omcirkel.', doelen: KZ_DOELEN, rang: 1, basis: true,
  bouw: (r) => {
    const woord = kies(r, D.KLANKZUIVER.fs.woorden), eind = woord.slice(-1), keuze = eind === 'f' ? ['f', 'v'] : ['s', 'z'];
    return kiesOef(r, { vraag: `${woord.slice(0, -1)}__ ____`, opties: keuze, antwoord: eind, kern: `kz${woord}`, data: { type: 'kz-aanvul', soort: 'fs', woord }, volledig: woord, moeilijkheid: 1 });
  },
});

/* ------------------------------------------------------------------ zinsdelen verplaatsen */
const VERPLAATS_DOELEN = ['1.5.GL3.23', '1.5.GL3.24'];
const EIGENNAMEN = ['Tom', 'Lotte'];
const lager = (d) => (EIGENNAMEN.includes(d) ? d : d.charAt(0).toLowerCase() + d.slice(1));
const normaal = (z) => `${z[0]} ${z[1]} ${z.slice(2).join(' ')}.`;
// Het gekozen zinsdeel komt vooraan, de persoonsvorm blijft op de tweede plaats en de andere zinsdelen houden hun volgorde.
export function verplaatsOpbouw(z, i) {
  const [ond, pv, ...rest] = z, delen = [ond, ...rest], voor = delen[i], over = delen.filter((_, k) => k !== i).map(d => (d === ond ? lager(d) : d));
  return { zin: `${hoofd(voor)} ${pv} ${over.join(' ')}.`, fout1: `${hoofd(voor)} ${over.join(' ')} ${pv}.`, fout2: `${hoofd(voor)} ${over[0]} ${pv} ${over.slice(1).join(' ')}.`, voor };
}
const verplaats = vorm({
  id: 'zv-verplaats', titel: 'Een zinsdeel verplaatsen', pictogram: 'schrijven', opdracht: 'Zet het zinsdeel vooraan. Schrijf de nieuwe zin op. De zin moet kloppen.', doelen: VERPLAATS_DOELEN, rang: 1, basis: true, schaal: 0.9,
  bouw: (r) => {
    const z = kies(r, D.VERPLAATS_ZINNEN), i = r.geheel(1, z.length - 2), v = verplaatsOpbouw(z, i);
    return invulOef(`${normaal(z)}${NBSP.repeat(3)}Begin met: ${v.voor}\n____________________________`, v.zin, `zv${z.join('|')}${i}`, { type: 'zv-verplaats', zin: z, vooraan: v.voor, index: i }, `${normaal(z)} → ${v.zin}`, 2);
  },
});
const verplaatsKies = vorm({
  id: 'zv-kies', titel: 'Welke zin klopt?', pictogram: 'omcirkelen', opdracht: 'Eén zin klopt. Omcirkel de zin waarin het zinsdeel goed verplaatst is.', doelen: VERPLAATS_DOELEN, rang: 2, schaal: 0.8,
  bouw: (r) => {
    const z = kies(r, D.VERPLAATS_ZINNEN), i = r.geheel(1, z.length - 2), v = verplaatsOpbouw(z, i);
    return kiesOef(r, { vraag: `${normaal(z)} Zet "${v.voor}" vooraan. ____`, opties: [v.fout1, v.fout2], antwoord: v.zin, kern: `zk${z.join('|')}${i}`, data: { type: 'zv-kies', zin: z, vooraan: v.voor, index: i }, volledig: v.zin, moeilijkheid: 2 });
  },
});

export const BEGRIPPEN_VORMEN = [klank, paar, letter, tekenNaam, tekenGebruik, trapHerken, trapVorm, figBetekenis, figSoort, hypKies, hypOngelijk, regHerken, regSituatie, comRol, comMedium, opdrachtWoord, spellingKies, spellingAanvul, klankzuiver, verplaats, verplaatsKies];
