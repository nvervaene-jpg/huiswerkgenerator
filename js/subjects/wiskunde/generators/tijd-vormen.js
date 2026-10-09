// Extra oefenvormen voor tijd: de klok, tijdsduur berekenen en de dagen van de week.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { kies, NBSP } from './stelling-vormen.js';
import { klok, klokkenVerbinden, klokkenRij, tweeKlokken, tijdlijn, weekstrook, verbinden } from '../svg.js';
import { tijd, PRECISIE_PER_DOEL, PRECISIE_KEUZE, precisieOpties, kiesTijd, MINUTEN, klasse, DAGEN, zin, duurTekst, wikkel, dagenBerekenen, tijdsduurBerekenen } from './tijd.js';

const JF = () => `${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`;
const geldigeTijd = (t, gebied) => t.h >= 1 && t.h <= 12 && t.m >= 0 && t.m <= 59 && t.h <= gebied && t.m <= gebied;
const minuten = (t) => (t.h % 12) * 60 + t.m;
const zelfde = (x, y) => x.h === y.h && x.m === y.m;

const maakVorm = ({ id, titel, pictogram = 'schrijven', opdracht, doelen, rang, schaal = 1, keuzes, opties, bouw }) => ({
  id, titel, pictogram, opdracht, rang, schaal, basis: false, doelen, ...(keuzes ? { keuzes } : {}), ...(opties ? { opties } : {}),
  genereer({ seed, aantal, gebied, opties: o }) {
    const rng = maakRng(seed);
    return resultaat(trek(rng, aantal, (r) => bouw(r, { gebied, opties: o || {} })), aantal);
  },
});

/* ================================================================== klok */
const KLOK_DOELEN = Object.keys(PRECISIE_PER_DOEL);
const klokVorm = (def) => maakVorm({ ...def, doelen: KLOK_DOELEN, keuzes: [PRECISIE_KEUZE], opties: precisieOpties });
const precisieVan = (o) => o.precisie || 'uur';

// Typische fouten bij het aflezen: wijzers verwisseld, een uur of vijf minuten ernaast.
function foutTijden(t, gebied) {
  const kand = [{ h: t.h + 1, m: t.m }, { h: t.h - 1, m: t.m }, { h: t.h, m: t.m + 5 }, { h: t.h, m: t.m - 5 }, { h: t.h, m: t.m + 15 }, { h: t.h, m: t.m - 15 }];
  if (t.m % 5 === 0) kand.push({ h: t.m / 5 || 12, m: (t.h % 12) * 5 });                    // grote en kleine wijzer verwisseld
  const uit = [];
  for (const k of kand) if (geldigeTijd(k, gebied) && !zelfde(k, t) && !uit.some(u => zelfde(u, k))) uit.push(k);
  return uit;
}

export const klokJuistFout = klokVorm({
  id: 'klok-juist-fout', titel: 'Klok: juist of fout', pictogram: 'omcirkelen', rang: 3, opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied, opties }) {
    const t = kiesTijd(r, gebied, precisieVan(opties));
    if (!t) return null;
    const juist = r.volgende() < 0.5, fouten = foutTijden(t, gebied);
    if (!juist && !fouten.length) return null;
    const genoemd = juist ? t : kies(r, fouten);
    return { tekst: `Het is ${tijd(genoemd.h, genoemd.m)}.${JF()}`, svg: klok(t), antwoord: juist ? 'juist' : 'fout', volledig: `Het is ${tijd(genoemd.h, genoemd.m)}: ${juist ? 'juist' : `fout (juist is ${tijd(t.h, t.m)})`}`,
      getallen: [t.h, t.m, genoemd.h, genoemd.m], sleutel: `${tijd(t.h, t.m)}/${tijd(genoemd.h, genoemd.m)}`, kern: `klok:${tijd(t.h, t.m)}`, moeilijkheid: [klasse(t.m), juist ? 0 : 1],
      data: { type: 'klok-jf', h: t.h, m: t.m, genoemd, juist } };
  },
});

export const klokMeerkeuze = klokVorm({
  id: 'klok-meerkeuze', titel: 'Klok: meerkeuze', pictogram: 'omcirkelen', rang: 3, opdracht: 'Hoe laat is het? Omcirkel de letter.',
  bouw(r, { gebied, opties }) {
    const t = kiesTijd(r, gebied, precisieVan(opties));
    if (!t) return null;
    const fouten = r.schud(foutTijden(t, gebied)).slice(0, 2);
    if (fouten.length < 2) return null;
    const lijst = [t, ...fouten].sort((x, y) => minuten(x) - minuten(y)), juist = lijst.findIndex(x => zelfde(x, t));
    return { tekst: `Hoe laat is het?\n${lijst.map((x, i) => `${'abc'[i]})${NBSP}${tijd(x.h, x.m)}`).join(NBSP.repeat(4))}`, svg: klok(t), antwoord: `${'abc'[juist]}) ${tijd(t.h, t.m)}`,
      volledig: `Het is ${tijd(t.h, t.m)}. Antwoord: ${'abc'[juist]}`, getallen: [t.h, t.m, ...lijst.flatMap(x => [x.h, x.m])], sleutel: tijd(t.h, t.m), kern: `klok:${tijd(t.h, t.m)}`,
      moeilijkheid: [klasse(t.m), 1], data: { type: 'klok-mk', h: t.h, m: t.m, opties: lijst, juist } };
  },
});

export const klokVerbinden = klokVorm({
  id: 'klok-verbinden', titel: 'Klok en digitale tijd verbinden', pictogram: 'verbinden', rang: 5, schaal: 0.34, opdracht: 'Verbind de klok met de juiste tijd. Trek een lijn.',
  bouw(r, { gebied, opties }) {
    const tijden = [];
    for (let t = 0; t < 60 && tijden.length < 4; t++) { const x = kiesTijd(r, gebied, precisieVan(opties)); if (x && !tijden.some(y => zelfde(x, y))) tijden.push(x); }
    if (tijden.length < 4) return null;
    const orde = r.schud([0, 1, 2, 3]), koppels = tijden.map((_, i) => [i, orde.indexOf(i)]);
    if (koppels.every(([a, b]) => a === b)) return null;
    const rechts = orde.map(i => tijden[i]);
    return { tekst: '', svg: klokkenVerbinden(tijden, rechts, koppels), antwoordSvg: klokkenVerbinden(tijden, rechts, koppels, true), breed: true,
      antwoord: tijden.map(t => tijd(t.h, t.m)).join(', '), volledig: `Verbonden: ${tijden.map(t => tijd(t.h, t.m)).join(', ')}`, getallen: tijden.flatMap(t => [t.h, t.m]),
      sleutel: tijden.map(t => tijd(t.h, t.m)).sort().join('/'), kernen: tijden.map(t => `klok:${tijd(t.h, t.m)}`), moeilijkheid: [Math.max(...tijden.map(t => klasse(t.m)))],
      data: { type: 'klok-verbind', tijden } };
  },
});

export const klokOrdenen = klokVorm({
  id: 'klok-ordenen', titel: 'Klokken ordenen', rang: 4, schaal: 0.67, opdracht: 'Zet de klokken van vroeg naar laat. Schrijf de letters op.',
  bouw(r, { gebied, opties }) {
    const tijden = [];
    for (let t = 0; t < 60 && tijden.length < 3; t++) { const x = kiesTijd(r, gebied, precisieVan(opties)); if (x && x.h <= 11 && !tijden.some(y => minuten(y) === minuten(x))) tijden.push(x); }
    if (tijden.length < 3) return null;
    const orde = [0, 1, 2].sort((x, y) => minuten(tijden[x]) - minuten(tijden[y])).map(i => 'ABC'[i]);
    if (orde.join('') === 'ABC') return null;
    return { tekst: `Van vroeg naar laat:${NBSP.repeat(3)}____${NBSP.repeat(3)}____${NBSP.repeat(3)}____`, svg: klokkenRij(tijden), breed: true, antwoord: orde.join(', '),
      volledig: `Van vroeg naar laat: ${orde.join(', ')} (${orde.map(l => tijd(tijden['ABC'.indexOf(l)].h, tijden['ABC'.indexOf(l)].m)).join(', ')})`,
      getallen: tijden.flatMap(t => [t.h, t.m]), sleutel: tijden.map(t => tijd(t.h, t.m)).join('/'), moeilijkheid: [Math.max(...tijden.map(t => klasse(t.m))), 3], data: { type: 'klok-orden', tijden, orde } };
  },
});

// "Half vier" = 3:30, "kwart over drie" = 3:15 (zoals in Vlaanderen).
const UREN = ['twaalf', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];
export function uitspreken(h, m) {
  const nu = UREN[h % 12], straks = UREN[(h + 1) % 12];
  return ({ 0: `${nu} uur`, 5: `vijf over ${nu}`, 10: `tien over ${nu}`, 15: `kwart over ${nu}`, 20: `tien voor half ${straks}`, 25: `vijf voor half ${straks}`,
    30: `half ${straks}`, 35: `vijf over half ${straks}`, 40: `tien over half ${straks}`, 45: `kwart voor ${straks}`, 50: `tien voor ${straks}`, 55: `vijf voor ${straks}` })[m];
}
export const klokUitspreken = klokVorm({
  id: 'klok-uitspreken', titel: 'De tijd in woorden', rang: 4, opdracht: 'Schrijf de tijd met cijfers op de lijn.',
  bouw(r, { gebied, opties }) {
    const precisie = precisieVan(opties) === 'minuut' ? 'vijf' : precisieVan(opties);
    const t = kiesTijd(r, gebied, precisie);
    if (!t || t.m % 5 !== 0) return null;
    const woorden = uitspreken(t.h, t.m);
    return { tekst: `${woorden.replace(/^./, c => c.toUpperCase())}.${NBSP.repeat(3)}____${NBSP}:${NBSP}____`, antwoord: tijd(t.h, t.m), volledig: `${woorden.replace(/^./, c => c.toUpperCase())} = ${tijd(t.h, t.m)}`,
      getallen: [t.h, t.m], sleutel: tijd(t.h, t.m), kern: `klok:${tijd(t.h, t.m)}`, moeilijkheid: [klasse(t.m), t.h], data: { type: 'klok-woorden', h: t.h, m: t.m, woorden } };
  },
});

/* ================================================================== tijdsduur berekenen */
const duurDoelen = tijdsduurBerekenen.doelen;
function duurSom(r, gebied) {
  const kwartieren = [0, 15, 30, 45].filter(m => m <= gebied);
  if (!kwartieren.length) return null;
  const h1 = r.geheel(1, Math.min(12, gebied)), m1 = kwartieren[r.geheel(0, kwartieren.length - 1)], duur = 15 * r.geheel(1, 12);
  const einde = h1 * 60 + m1 + duur, h2 = wikkel(Math.floor(einde / 60)), m2 = einde % 60;
  const delen = duur >= 60 ? [Math.floor(duur / 60), duur % 60].filter(Boolean) : [duur];
  const getallen = [h1, m1, h2, m2, ...delen];
  if (getallen.some(g => g > gebied)) return null;
  return { begin: { h: h1, m: m1 }, einde: { h: h2, m: m2 }, duur, getallen };
}

export const tijdsduurKlokken = maakVorm({
  id: 'tijdsduur-klokken', titel: 'Tijdsduur tussen twee klokken', rang: 5, schaal: 0.5, doelen: duurDoelen, opdracht: 'Kijk naar de klokken. Hoe lang duurt het? Schrijf het antwoord op de lijn.',
  bouw(r, { gebied }) {
    const k = duurSom(r, gebied);
    if (!k) return null;
    return { tekst: 'Hoe lang duurt het?  ____', svg: tweeKlokken(k.begin, k.einde), breed: true, antwoord: duurTekst(k.duur),
      volledig: `Van ${tijd(k.begin.h, k.begin.m)} tot ${tijd(k.einde.h, k.einde.m)}: ${duurTekst(k.duur)}`, getallen: k.getallen, sleutel: `${tijd(k.begin.h, k.begin.m)}+${k.duur}`,
      moeilijkheid: [k.duur >= 60 ? 1 : 0, k.duur], data: { type: 'tijdsduur-klokken', begin: k.begin, einde: k.einde, duur: k.duur } };
  },
});

export const tijdsduurTijdlijn = maakVorm({
  id: 'tijdsduur-tijdlijn', titel: 'Tijdsduur op de tijdlijn', rang: 5, schaal: 0.67, doelen: duurDoelen, opdracht: 'Gebruik de tijdlijn. Vul het lege vakje in.',
  bouw(r, { gebied }) {
    const k = duurSom(r, gebied);
    if (!k) return null;
    const leeg = r.volgende() < 0.5 ? 'einde' : 'duur', b = tijd(k.begin.h, k.begin.m), e = tijd(k.einde.h, k.einde.m), d = duurTekst(k.duur);
    const tekst = leeg === 'einde' ? `Het begint om ${b} en duurt ${d}. Hoe laat is het gedaan?` : `Het begint om ${b} en is gedaan om ${e}. Hoe lang duurt het?`;
    return { tekst, svg: tijdlijn({ begin: b, einde: e, duur: d, leeg }), antwoordSvg: tijdlijn({ begin: b, einde: e, duur: d }), breed: true, antwoord: leeg === 'einde' ? e : d,
      volledig: `${tekst} ${leeg === 'einde' ? e : d}`, getallen: k.getallen, sleutel: `${leeg}${b}+${k.duur}`, moeilijkheid: [k.duur >= 60 ? 1 : 0, k.duur],
      data: { type: 'tijdsduur-tijdlijn', begin: k.begin, einde: k.einde, duur: k.duur, leeg } };
  },
});

/* ================================================================== dagen van de week */
const dagDoelen = dagenBerekenen.doelen;
const volgendeDag = (i) => DAGEN[(i + 1) % 7];

export const dagenWeekstrook = maakVorm({
  id: 'dagen-weekstrook', titel: 'Weekstrook aanvullen', rang: 3, schaal: 0.5, doelen: dagDoelen, opdracht: 'Schrijf de ontbrekende dagen van de week op.',
  bouw(r) {
    const weg = r.schud([0, 1, 2, 3, 4, 5, 6]).slice(0, r.geheel(2, 4)).sort((x, y) => x - y);
    return { tekst: '', svg: weekstrook(DAGEN, weg), antwoordSvg: weekstrook(DAGEN, []), breed: true, antwoord: weg.map(i => DAGEN[i]).join(', '), volledig: `Ontbrekende dagen: ${weg.map(i => DAGEN[i]).join(', ')}`,
      getallen: [weg.length], sleutel: weg.join(), moeilijkheid: [weg.length, 0], data: { type: 'dag-week', weg } };
  },
});

export const dagenOrdenen = maakVorm({
  id: 'dagen-ordenen', titel: 'Dagen ordenen', rang: 4, schaal: 0.67, doelen: dagDoelen, opdracht: 'Zet de dagen in de juiste volgorde van de week. Begin bij maandag.',
  bouw(r) {
    const gekozen = r.schud([0, 1, 2, 3, 4, 5, 6]).slice(0, 4), juist = [...gekozen].sort((x, y) => x - y);
    if (gekozen.every((x, i) => x === juist[i])) return null;
    return { tekst: `${gekozen.map(i => DAGEN[i]).join('   ')}${NBSP.repeat(3)}→${NBSP.repeat(3)}${Array(4).fill('____').join(' ')}`, breed: true, antwoord: juist.map(i => DAGEN[i]).join(', '),
      volledig: `In de juiste volgorde: ${juist.map(i => DAGEN[i]).join(', ')}`, getallen: [4], sleutel: [...gekozen].sort().join(), moeilijkheid: [4, 1], data: { type: 'dag-orden', dagen: gekozen.map(i => DAGEN[i]) } };
  },
});

export const dagenVerbinden = maakVorm({
  id: 'dagen-verbinden', titel: 'Dag en volgende dag verbinden', pictogram: 'verbinden', rang: 5, schaal: 0.34, doelen: dagDoelen, opdracht: 'Verbind elke dag met de dag erna. Trek een lijn.',
  bouw(r) {
    const links = r.schud([0, 1, 2, 3, 4, 5, 6]).slice(0, 4), rechtsIdx = links.map(i => (i + 1) % 7), orde = r.schud([0, 1, 2, 3]);
    const koppels = links.map((_, i) => [i, orde.indexOf(i)]);
    if (koppels.every(([a, b]) => a === b)) return null;
    const l = links.map(i => DAGEN[i]), rr = orde.map(i => DAGEN[rechtsIdx[i]]);
    return { tekst: '', svg: verbinden(l, rr, koppels), antwoordSvg: verbinden(l, rr, koppels, true), breed: true, antwoord: links.map(i => `${DAGEN[i]} → ${volgendeDag(i)}`).join('; '),
      volledig: `Verbonden: ${links.map(i => `${DAGEN[i]} → ${volgendeDag(i)}`).join('; ')}`, getallen: [4], sleutel: [...links].sort().join(), moeilijkheid: [1, 0],
      data: { type: 'dag-verbind', paren: links.map(i => ({ dag: DAGEN[i], volgende: volgendeDag(i) })) } };
  },
});

const dagSpronggeval = (r, gebied) => {
  const dag = r.geheel(0, 6), sprong = r.geheel(1, Math.min(6, gebied)) * (r.volgende() < 0.5 ? 1 : -1);
  return { dag, sprong, doel: (((dag + sprong) % 7) + 7) % 7 };
};
export const dagenJuistFout = maakVorm({
  id: 'dagen-juist-fout', titel: 'Dagen: juist of fout', pictogram: 'omcirkelen', rang: 3, doelen: dagDoelen, opdracht: 'Is dit juist of fout? Omcirkel het goede woord.',
  bouw(r, { gebied }) {
    const { dag, sprong, doel } = dagSpronggeval(r, gebied), juist = r.volgende() < 0.5;
    const genoemd = juist ? doel : kies(r, [0, 1, 2, 3, 4, 5, 6].filter(i => i !== doel));
    const tekst = `Vandaag is het ${DAGEN[dag]}. ${zin(sprong)} ${DAGEN[genoemd]}.`;
    return { tekst: `${tekst}${JF()}`, breed: true, antwoord: juist ? 'juist' : 'fout', volledig: `${tekst} ${juist ? 'Juist' : `Fout (juist is ${DAGEN[doel]})`}`, getallen: [Math.abs(sprong)],
      sleutel: `${dag}/${sprong}/${genoemd}`, moeilijkheid: [Math.abs(sprong), juist ? 0 : 1], data: { type: 'dag-jf', dag: DAGEN[dag], sprong, genoemd: DAGEN[genoemd], juist } };
  },
});

export const dagenMeerkeuze = maakVorm({
  id: 'dagen-meerkeuze', titel: 'Dagen: meerkeuze', pictogram: 'omcirkelen', rang: 3, doelen: dagDoelen, opdracht: 'Welke dag is het? Omcirkel de letter.',
  bouw(r, { gebied }) {
    const { dag, sprong, doel } = dagSpronggeval(r, gebied), opties = [doel, ...r.schud([0, 1, 2, 3, 4, 5, 6].filter(i => i !== doel)).slice(0, 2)].sort((x, y) => x - y), juist = opties.indexOf(doel);
    const vraag = `Vandaag is het ${DAGEN[dag]}. ${zin(sprong)} ...`;
    return { tekst: `${vraag}${NBSP.repeat(3)}${opties.map((o, i) => `${'abc'[i]})${NBSP}${DAGEN[o]}`).join(NBSP.repeat(4))}`, breed: true, antwoord: `${'abc'[juist]}) ${DAGEN[doel]}`,
      volledig: `${vraag.replace('...', DAGEN[doel])}`, getallen: [Math.abs(sprong)], sleutel: `${dag}/${sprong}`, moeilijkheid: [Math.abs(sprong), 1],
      data: { type: 'dag-mk', dag: DAGEN[dag], sprong, opties: opties.map(i => DAGEN[i]), juist } };
  },
});

export const TIJD_VORMEN = [
  klokJuistFout, klokMeerkeuze, klokVerbinden, klokOrdenen, klokUitspreken, tijdsduurKlokken, tijdsduurTijdlijn,
  dagenWeekstrook, dagenOrdenen, dagenVerbinden, dagenJuistFout, dagenMeerkeuze,
];
