// Oefenvormen over taalgebruik en zinnen: persoonsvorm vervoegen, hoofdletters en leestekens verbeteren, woorden in volgorde zetten,
// non-verbale communicatie, jongerentaal en vaktaal, informatiebronnen, schrifttekens, taalfamilie en woordbetekenissen uit de context.
import { vorm, kies, basisOefening } from './taalkunde.js';
import { kiesOef, invulOef } from './begrippen.js';
import { VERBEN } from '../woorden/werkwoorden.js';
import { ZINSOORTEN } from '../woorden/taalkunde.js';
import { STRUCTUUR } from '../woorden/lezen.js';
import { PERSONEN, ottVorm, ovtVorm, zin } from './werkwoordkennis.js';
import * as D from '../woorden/taalgebruik.js';

const NBSP = ' ';
const jaarVan = (doel) => Number(/GL(\d)/.exec(doel || '')?.[1] || 6);

/* ------------------------------------------------------------------ werkwoorden vervoegen */
export const VERVOEG_DOELEN = ['1.5.GL2.38', '1.5.GL2.39', '1.5.GL4.22', '1.5.GL4.27', '1.5.GL4.28'];
const VERBEN_OK = VERBEN.filter(v => v.ott || v.stam);
const vervoeg = vorm({
  id: 'pv-vervoeg', titel: 'Het werkwoord vervoegen', pictogram: 'schrijven', opdracht: 'Schrijf het werkwoord in de juiste vorm op de lijn.', doelen: VERVOEG_DOELEN, rang: 1, basis: true, schaal: 0.9,
  bouw: (r, o) => {
    const v = kies(r, VERBEN_OK), pers = kies(r, PERSONEN), uitgang = (p) => ottVorm(v, p);
    if (o.doel === '1.5.GL2.38') {
      const ander = kies(r, PERSONEN.filter(p => uitgang(p) !== uitgang(pers)));
      return invulOef(`${pers.tekst} ${uitgang(pers)}. ${ander.tekst} ____ (${v.inf}).`, uitgang(ander), `vp${v.inf}${pers.tekst}${ander.tekst}`, { type: 'pv-vervoeg', soort: 'persoon', inf: v.inf, pers: pers.tekst, ander: ander.tekst }, `${ander.tekst} ${uitgang(ander)}`, 1);
    }
    if (o.doel === '1.5.GL2.39') {
      return invulOef(`Nu: ${pers.tekst} ${uitgang(pers)}. Gisteren: ${pers.tekst} ____ (${v.inf}).`, ovtVorm(v, pers), `vt${v.inf}${pers.tekst}`, { type: 'pv-vervoeg', soort: 'tijd', inf: v.inf, pers: pers.tekst }, `Gisteren: ${pers.tekst} ${ovtVorm(v, pers)}`, 1);
    }
    return invulOef(`${zin(pers, '____', v)} (${v.inf})`, uitgang(pers), `vz${v.inf}${pers.tekst}`, { type: 'pv-vervoeg', soort: 'zin', inf: v.inf, pers: pers.tekst }, zin(pers, uitgang(pers), v), 2);
  },
});

/* ------------------------------------------------------------------ zinnen schrijven en bouwen */
const ZINNEN_ALLE = Object.values(ZINSOORTEN).flat();
const heeftNaam = (z) => D.EIGENNAMEN_BEGIN.includes(z.split(' ')[0].replace(/[.,!?]/g, ''));
const zonderTekens = (z) => { const w = z.replace(/[.,!?]/g, ''); return heeftNaam(z) ? w : w.charAt(0).toLowerCase() + w.slice(1); };
export const VERBETER_DOELEN = ['1.3.GL1.20', '1.3.GL2.29', '1.3.GL3.20', '1.3.GL4.22', '1.3.GL5.32', '1.3.GL6.23'];
const STRUCTUUR_VOL = STRUCTUUR.filter(x => !x[0].includes('. ')).map(([z, goed]) => z.replace('____', goed));
const verbeter = vorm({
  id: 'cs-verbeter', titel: 'Hoofdletters en leestekens', pictogram: 'schrijven', opdracht: 'Schrijf de zin juist op. Let op de hoofdletter en de leestekens.', doelen: VERBETER_DOELEN, rang: 1, basis: true, schaal: 0.9,
  bouw: (r, o) => {
    const j = jaarVan(o.doel), pool = j >= 4 && r.volgende() < 0.5 ? STRUCTUUR_VOL : ZINNEN_ALLE, doel = kies(r, pool);
    return invulOef(`${zonderTekens(doel)}\n____________________________`, doel, `cs${doel}`, { type: 'cs-verbeter', doel: o.doel, juist: doel, fout: zonderTekens(doel) }, doel, j);
  },
});
const BOUW = ZINNEN_ALLE.filter(z => z.replace(/[.,!?]/g, '').split(' ').length >= 3 && z.replace(/[.,!?]/g, '').split(' ').length <= 6 && !/[,]/.test(z));
export const BOUW_DOELEN = ['1.5.GL1.11'];
const bouw = vorm({
  id: 'zv-bouw', titel: 'Zet de woorden in de juiste volgorde', pictogram: 'schrijven', opdracht: 'Zet de woorden in de juiste volgorde. Schrijf de zin op. Denk aan de hoofdletter en het leesteken.', doelen: BOUW_DOELEN, rang: 1, schaal: 0.9,
  bouw: (r) => {
    const z = kies(r, BOUW), woorden = z.replace(/[.,!?]/g, '').split(' ').map((w, i) => (i === 0 && !heeftNaam(z) ? w.toLowerCase() : w)), mix = r.schud(woorden);
    if (mix.join(' ') === woorden.join(' ')) return null;
    return invulOef(`${mix.join(NBSP.repeat(5))}\n____________________________`, z, `zb${z}`, { type: 'zv-bouw', juist: z, woorden: mix }, z, 2);
  },
});

/* ------------------------------------------------------------------ taalgebruik en taalwetenschap */
export const TG_DOELEN = ['1.5.GL4.35', '1.5.GL4.36', '1.5.GL5.25', '1.5.GL6.20', '1.5.GL6.19'];
const taalgebruik = vorm({
  id: 'tg-kies', titel: 'Taal en communicatie', pictogram: 'omcirkelen', opdracht: 'Lees. Omcirkel het juiste antwoord.', doelen: TG_DOELEN, rang: 1, basis: true, schaal: 0.85,
  bouw: (r, o) => {
    switch (o.doel) {
      case '1.5.GL4.35': { const [zin, soort] = kies(r, D.NONVERBAAL); return kiesOef(r, { vraag: `${zin} Dat is ____.`, opties: D.NONVERBAAL_NAMEN.filter(x => x !== soort), antwoord: soort, kern: zin, data: { type: 'tg-kies', soort: 'nonverbaal', zin }, volledig: `${zin} → ${soort}` }); }
      case '1.5.GL4.36': { const [zin, soort] = kies(r, D.REGISTERTAAL); return kiesOef(r, { vraag: `${zin} Dit is ____.`, opties: ['jongerentaal', 'vaktaal'].filter(x => x !== soort), antwoord: soort, kern: zin, data: { type: 'tg-kies', soort: 'register', zin }, volledig: `${zin} → ${soort}` }); }
      case '1.5.GL5.25': {
        const i = r.geheel(0, D.BRONNEN.length - 2), j = r.geheel(i + 1, D.BRONNEN.length - 1), eerst = r.volgende() < 0.5, [a, b] = r.volgende() < 0.5 ? [D.BRONNEN[i], D.BRONNEN[j]] : [D.BRONNEN[j], D.BRONNEN[i]];
        return kiesOef(r, { vraag: `Wat ontstond ${eerst ? 'eerst' : 'later'}: ${a} of ${b}? ____`, opties: [eerst ? (D.BRONNEN.indexOf(a) < D.BRONNEN.indexOf(b) ? b : a) : (D.BRONNEN.indexOf(a) < D.BRONNEN.indexOf(b) ? a : b)], antwoord: eerst ? (D.BRONNEN.indexOf(a) < D.BRONNEN.indexOf(b) ? a : b) : (D.BRONNEN.indexOf(a) < D.BRONNEN.indexOf(b) ? b : a), kern: `br${a}${b}${eerst}`, data: { type: 'tg-kies', soort: 'bronnen', a, b, eerst } });
      }
      case '1.5.GL6.20': {
        const ander = r.volgende() < 0.5, goed = kies(r, ander ? D.SCHRIFT.ander : D.SCHRIFT.zelfde), fout = r.schud(ander ? D.SCHRIFT.zelfde : D.SCHRIFT.ander).slice(0, 2);
        return kiesOef(r, { vraag: ander ? `Welke taal gebruikt andere schrifttekens dan het Nederlands? ____` : 'Welke taal gebruikt dezelfde schrifttekens (het alfabet) als het Nederlands? ____', opties: fout, antwoord: goed, kern: `sc${goed}${ander}${fout.join()}`, data: { type: 'tg-kies', soort: 'schrift', ander } });
      }
      default: {
        const fam = Object.keys(D.TAALFAMILIES), goed = kies(r, D.TAALFAMILIES.germaans), fout = r.schud(D.TAALFAMILIES.romaans.concat(D.TAALFAMILIES.slavisch)).slice(0, 2);
        void fam;
        return kiesOef(r, { vraag: 'Het Nederlands is een Germaanse taal. Welke taal is ook een Germaanse taal? ____', opties: fout, antwoord: goed, kern: `tf${goed}${fout.join()}`, data: { type: 'tg-kies', soort: 'familie' } });
      }
    }
  },
});
export const CONTEXT_DOELEN = ['1.5.GL1.2', '1.5.GL2.7', '1.5.GL3.9', '1.5.GL4.7', '1.5.GL5.4', '1.5.GL6.3'];
const context = vorm({
  id: 'tg-context', titel: 'Wat betekent het woord?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Wat betekent het woord? Kijk naar de rest van de zin. Omcirkel.', doelen: CONTEXT_DOELEN, rang: 2, schaal: 0.8,
  bouw: (r) => {
    const [zin, woord, goed, fout] = kies(r, D.CONTEXT);
    return kiesOef(r, { vraag: `${zin}\n"${woord}" betekent: ____`, opties: fout, antwoord: goed, kern: zin, data: { type: 'tg-context', zin, woord }, volledig: `${woord}: ${goed}`, moeilijkheid: 1 });
  },
});

export const TAALGEBRUIK_VORMEN = [vervoeg, verbeter, bouw, taalgebruik, context];
void basisOefening;
