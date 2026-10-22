// Oefenvormen over werkwoorden: stam, infinitief, stam en uitgang, tegenwoordige/verleden/toekomende tijd,
// voltooid deelwoord en hulpwerkwoord. De werkwoorden komen uit ../woorden/werkwoorden.js.
import { VERBEN } from '../woorden/werkwoorden.js';
import { vorm, kies, basisOefening } from './taalkunde.js';

const NBSP = ' ';
export const PERSONEN = [
  { id: 'ik', tekst: 'Ik', mv: false, p: 1 }, { id: 'hij', tekst: 'Hij', mv: false, p: 3 }, { id: 'wij', tekst: 'Wij', mv: true, p: 1 }, { id: 'kinderen', tekst: 'De kinderen', mv: true, p: 3 },
];
const HULP = { hebben: { ott: ['heb', 'heeft', 'hebben', 'hebben'] }, zijn: { ott: ['ben', 'is', 'zijn', 'zijn'] } };
const hulpVorm = (hulp, pers) => HULP[hulp].ott[PERSONEN.indexOf(pers)];
const hoofd = (t) => t[0].toUpperCase() + t.slice(1);

export const REGELMATIG_STAM = VERBEN.filter(v => v.stam);
export function ottVorm(v, pers) {
  if (v.ott) return v.ott[pers.mv ? 'mv' : pers.p === 1 ? 'ik' : 'hij'];
  if (pers.mv) return v.inf;
  if (pers.p === 1) return v.stam;
  return v.stam.endsWith('t') ? v.stam : v.stam + 't';
}
export const ovtVorm = (v, pers) => v.ovt[pers.mv ? 1 : 0];
export const zin = (pers, vorm, v, voor = '') => `${pers.tekst} ${voor}${vorm}${v.zinsdeel ? ' ' + v.zinsdeel : ''}.`;

const stam = vorm({
  id: 'wk-stam', titel: 'De stam van het werkwoord', pictogram: 'schrijven', opdracht: 'Schrijf de stam van het werkwoord. Dat is het werkwoord bij ik.', doelen: ['1.5.GL4.20', '1.5.GL4.19'], rang: 1, basis: true,
  bouw: (r) => {
    const v = kies(r, REGELMATIG_STAM);
    return basisOefening({ tekst: `${v.inf}${NBSP.repeat(4)}→${NBSP.repeat(4)}ik ____________`, antwoord: v.stam, volledig: `${v.inf} → ik ${v.stam}`, kern: v.inf, sleutel: v.inf, moeilijkheid: [v.soort === 'zwak' ? 0 : 1], data: { type: 'wk-stam', inf: v.inf, stam: v.stam } });
  },
});
const infinitief = vorm({
  id: 'wk-infinitief', titel: 'De infinitief', pictogram: 'schrijven', opdracht: 'Schrijf de infinitief (de hele werkwoord) van het werkwoord.', doelen: ['1.5.GL4.18', '1.5.GL4.17'], rang: 2,
  bouw: (r) => {
    const v = kies(r, VERBEN), pers = kies(r, PERSONEN.filter(p => !p.mv)), vorm_ = ottVorm(v, pers);
    return basisOefening({ tekst: `${pers.tekst.toLowerCase()} ${vorm_}${NBSP.repeat(4)}→${NBSP.repeat(4)}____________`, antwoord: v.inf, volledig: `${pers.tekst.toLowerCase()} ${vorm_} → ${v.inf}`, kern: v.inf, sleutel: `${v.inf}|${pers.id}`, moeilijkheid: [v.soort === 'zwak' ? 0 : 1], data: { type: 'wk-inf', inf: v.inf, persoon: pers.id, vorm: vorm_ } });
  },
});
const uitgang = vorm({
  id: 'wk-uitgang', titel: 'Stam en uitgang', pictogram: 'schrijven', opdracht: 'Splits het werkwoord in de stam en de uitgang.', doelen: ['1.5.GL4.21', '1.5.GL4.8'], rang: 3,
  bouw: (r) => {
    const v = kies(r, VERBEN.filter(x => x.soort === 'zwak' && x.stam && !x.stam.endsWith('t') && !x.ott)), verleden = r.volgende() < 0.5;
    const hele = verleden ? v.ovt[0] : ottVorm(v, PERSONEN[1]), eind = hele.slice(v.stam.length);
    return basisOefening({ tekst: `${hele}${NBSP.repeat(4)}=${NBSP.repeat(4)}____________ + ________`, antwoord: `${v.stam} + ${eind}`, volledig: `${hele} = ${v.stam} + ${eind}`, kern: v.inf, sleutel: `${v.inf}|${verleden}`, moeilijkheid: [verleden ? 1 : 0], data: { type: 'wk-uitgang', inf: v.inf, vorm: hele, stam: v.stam, uitgang: eind, verleden } });
  },
});

const TIJDEN = {
  ott: { label: 'tegenwoordige tijd', maak: (v, pers) => zin(pers, ottVorm(v, pers), v) },
  ovt: { label: 'verleden tijd', maak: (v, pers) => zin(pers, ovtVorm(v, pers), v) },
  tt: { label: 'toekomende tijd', maak: (v, pers) => `${pers.tekst} ${pers.mv ? 'zullen' : 'zal'}${v.zinsdeel ? ' ' + v.zinsdeel : ''} ${v.inf}.` },
};
const tijdVorm = (id, doel, tijden, rang, basis) => vorm({
  id, titel: 'Welke tijd?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. In welke tijd staat het werkwoord? Omcirkel.', doelen: [doel], rang, basis, schaal: 0.84,
  bouw: (r) => {
    const v = kies(r, VERBEN.filter(x => x.zinsdeel && (tijden.includes('tt') || true))), pers = kies(r, PERSONEN), tijd = kies(r, tijden);
    const tekst = TIJDEN[tijd].maak(v, pers);
    return basisOefening({
      tekst: `${tekst}\n${tijden.map(t => TIJDEN[t].label).join(NBSP.repeat(5))}`, antwoord: TIJDEN[tijd].label, volledig: `${tekst} → ${TIJDEN[tijd].label}`,
      kern: `${v.inf}`, sleutel: `${v.inf}|${pers.id}|${tijd}`, moeilijkheid: [tijden.indexOf(tijd)], data: { type: 'wk-tijd', zin: tekst, inf: v.inf, persoon: pers.id, tijd, tijden },
    });
  },
});
const tijd = tijdVorm('wk-tijd', '1.5.GL4.23', ['ott', 'ovt'], 4, false);
const tijd3 = tijdVorm('wk-tijd-toekomend', '1.5.GL6.13', ['ott', 'ovt', 'tt'], 4, false);

const MET_HULP = VERBEN.filter(v => v.hulp && v.zinsdeel);
const voltooid = vorm({
  id: 'wk-deelwoord', titel: 'Het voltooid deelwoord', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Onderstreep het voltooid deelwoord en schrijf het op de lijn.', doelen: ['1.5.GL5.14', '1.5.GL5.13'], rang: 5, schaal: 0.84,
  bouw: (r) => {
    const v = kies(r, MET_HULP), pers = kies(r, PERSONEN), tekst = `${pers.tekst} ${hulpVorm(v.hulp, pers)} ${v.zinsdeel} ${v.vd}.`;
    return basisOefening({ tekst: `${tekst}\nVoltooid deelwoord: ____________`, antwoord: v.vd, volledig: `${tekst} → ${v.vd}`, kern: v.inf, sleutel: `${v.inf}|${pers.id}`, moeilijkheid: [v.soort === 'zwak' ? 0 : 1], data: { type: 'wk-deelwoord', zin: tekst, inf: v.inf, vd: v.vd, hulp: v.hulp } });
  },
});
const hulp = vorm({
  id: 'wk-hulpwerkwoord', titel: 'Het hulpwerkwoord', pictogram: 'omcirkelen', opdracht: 'Welk hulpwerkwoord hoort in de zin? Omcirkel.', doelen: ['1.5.GL5.15'], rang: 6, schaal: 0.84,
  bouw: (r) => {
    const v = kies(r, MET_HULP), pers = kies(r, PERSONEN), juist = hulpVorm(v.hulp, pers), fout = hulpVorm(v.hulp === 'hebben' ? 'zijn' : 'hebben', pers);
    if (juist === fout) return null;
    const opties = r.volgende() < 0.5 ? [juist, fout] : [fout, juist], tekst = `${pers.tekst} ____ ${v.zinsdeel} ${v.vd}.`;
    return basisOefening({ tekst: `${tekst}${NBSP.repeat(6)}${opties.join(NBSP.repeat(6) + 'of' + NBSP.repeat(6))}`, antwoord: juist, volledig: `${hoofd(tekst.replace('____', juist))}`, kern: v.inf, sleutel: `${v.inf}|${pers.id}`, moeilijkheid: [0], data: { type: 'wk-hulp', persoon: pers.id, inf: v.inf, juist, opties, vd: v.vd, hulp: v.hulp } });
  },
});

export const WERKWOORDKENNIS_VORMEN = [stam, infinitief, uitgang, tijd, tijd3, voltooid, hulp];
