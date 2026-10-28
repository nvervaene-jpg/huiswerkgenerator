// Weetjes over woordsoorten, als korte oefeningen: het lidwoord, de eigennaam, het werkwoord, het bijvoeglijk naamwoord, het telwoord,
// het voorzetsel, het voegwoord en het voornaamwoord. Per doel een keuzevorm en een juist-of-fout-vorm. De gegevens staan in ../woorden/taalweetjes.js.
import { vorm, kies } from './taalkunde.js';
import { kiesOef } from './begrippen.js';
import * as D from '../woorden/taalweetjes.js';

const NBSP = ' ';
// Eén vraag per soort: { vraag (met ____), antwoord, fouten[], kern }
const SOORTEN = {
  '1.5.GL2.31': (r) => { const [zn, lid] = kies(r, D.LIDWOORD_ZN); return { vraag: `Welk lidwoord staat voor het woord? ____ ${zn}`, antwoord: lid, fouten: [lid === 'de' ? 'het' : 'de'], kern: `lid${zn}` }; },
  '1.5.GL2.34': (r) => { const [goed, fout] = kies(r, D.EIGENNAMEN); return { vraag: `Welke schrijfwijze is juist? ____`, antwoord: goed, fouten: [fout], kern: `eigen${goed}` }; },
  '1.5.GL2.36': (r) => { const [ww, anders] = kies(r, D.WERKWOORDEN); return { vraag: 'Welk woord is een werkwoord? ____', antwoord: ww, fouten: anders, kern: `ww${ww}` }; },
  '1.5.GL3.16': (r) => { const [zin, bn, zn] = kies(r, D.BIJVOEGLIJK_VOOR); return { vraag: `${zin} Welk woord vertelt meer over de ${zn}? ____`, antwoord: bn, fouten: zin.replace('.', '').split(' ').filter(w => w.toLowerCase() !== bn && w.toLowerCase() !== zn && w.length > 2 && !/^(de|het|een)$/i.test(w)).slice(0, 2), kern: `bn${bn}${zn}` }; },
  '1.5.GL3.17': (r) => { const [zin, bn, plaats] = kies(r, D.BIJVOEGLIJK_PLAATS); return { vraag: `${zin} Waar staat "${bn}"? ____`, antwoord: plaats === 'voor' ? 'voor het zelfstandig naamwoord' : 'na het werkwoord', fouten: [plaats === 'voor' ? 'na het werkwoord' : 'voor het zelfstandig naamwoord'], kern: `bp${zin}` }; },
  '1.5.GL3.20': (r) => {
    const i = r.geheel(0, D.TELWOORDEN.length - 1), [getal, woord] = D.TELWOORDEN[i], naarGetal = r.volgende() < 0.5, buren = [D.TELWOORDEN[(i + 1) % D.TELWOORDEN.length], D.TELWOORDEN[(i + 2) % D.TELWOORDEN.length], D.TELWOORDEN[(i + D.TELWOORDEN.length - 1) % D.TELWOORDEN.length]];
    return naarGetal ? { vraag: `Welk getal hoort bij het telwoord "${woord}"? ____`, antwoord: String(getal), fouten: buren.map(b => String(b[0])), kern: `tg${getal}` } : { vraag: `Hoe schrijf je ${getal} met letters? ____`, antwoord: woord, fouten: buren.map(b => b[1]), kern: `tw${getal}` };
  },
  '1.5.GL4.10': (r) => { const [zin, vz, anders] = kies(r, D.VOORZETSEL_ZINNEN); return { vraag: `${zin} Welk woord is het voorzetsel? ____`, antwoord: vz, fouten: anders, kern: `vzz${vz}${zin}` }; },
  '1.5.GL4.12': (r) => { const [zin, vz, fout] = kies(r, D.VOORZETSEL_GEBRUIK); return { vraag: zin, antwoord: vz, fouten: fout, kern: `vzg${zin}` }; },
  '1.5.GL4.14': (r) => { const [zin, vw, anders] = kies(r, D.VOEGWOORD_ZINNEN); return { vraag: `${zin} Welk woord is het voegwoord? ____`, antwoord: vw, fouten: anders, kern: `vwz${zin}` }; },
  '1.5.GL4.16': (r) => { const [zin, vw, fout] = kies(r, D.VOEGWOORD_GEBRUIK); return { vraag: zin, antwoord: vw, fouten: fout, kern: `vwg${zin}` }; },
  '1.5.GL6.12': (r) => { const [zin, vnw, fout] = kies(r, D.VOORNAAMWOORD_GEBRUIK); return { vraag: zin, antwoord: vnw, fouten: fout, kern: `vng${zin}` }; },
};
export const WEETJES_DOELEN = Object.keys(SOORTEN);
const jaarVan = (doel) => Number(/GL(\d)/.exec(doel || '')?.[1] || 6);

const kiesVorm = vorm({
  id: 'tw-kies', titel: 'Weetjes over woordsoorten', pictogram: 'omcirkelen', opdracht: 'Lees. Omcirkel het juiste antwoord.', doelen: WEETJES_DOELEN, rang: 1, basis: true,
  bouw: (r, o) => {
    const q = SOORTEN[o.doel](r);
    return kiesOef(r, { vraag: q.vraag.includes('____') ? q.vraag : `${q.vraag} ____`, opties: r.schud(q.fouten).slice(0, 2), antwoord: q.antwoord, kern: q.kern, data: { type: 'tw-kies', doel: o.doel, vraag: q.vraag, fouten: q.fouten }, moeilijkheid: jaarVan(o.doel) });
  },
});
const juistFout = vorm({
  id: 'tw-juist-fout', titel: 'Weetjes over woordsoorten: juist of fout?', pictogram: 'omcirkelen', opdracht: 'Staat het juiste antwoord erbij? Omcirkel juist of fout.', doelen: WEETJES_DOELEN, rang: 2,
  bouw: (r, o) => {
    const q = SOORTEN[o.doel](r), juist = r.volgende() < 0.5, getoond = juist ? q.antwoord : r.schud(q.fouten)[0], vraag = q.vraag.includes('____') ? q.vraag : `${q.vraag} ____`;
    return { getallen: [], breed: true, familie: q.kern, tekst: `${vraag.replace('____', getoond)}${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`, antwoord: juist ? 'juist' : 'fout', volledig: `${vraag.replace('____', getoond)}: ${juist ? 'juist' : `fout (juist is ${q.antwoord})`}`, kern: q.kern, sleutel: `${q.kern}|${getoond}`, moeilijkheid: [jaarVan(o.doel)], data: { type: 'tw-juist-fout', doel: o.doel, vraag: q.vraag, getoond, juist, antwoord: q.antwoord, fouten: q.fouten } };
  },
});
export const TAALWEETJES_VORMEN = [kiesVorm, juistFout];
