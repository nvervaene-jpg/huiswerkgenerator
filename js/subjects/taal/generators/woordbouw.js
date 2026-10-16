// Oefenvormen over woordbouw: samenstellingen herkennen, grondwoord, voorvoegsel en achtervoegsel.
import { SAMENSTELLINGEN } from '../woorden/samenstellingen.js';
import { WOORDEN } from '../woorden/woordsoorten.js';
import { VOORVOEGSELS, ACHTERVOEGSELS } from '../woorden/woordbouw.js';
import { vorm, kies, basisOefening } from './taalkunde.js';

const NBSP = ' ';
export const SAMENSTELLING_LIJST = Object.values(SAMENSTELLINGEN).flat().map(([a, b]) => ({ a, b, woord: a + b }));
export const ENKELE_WOORDEN = WOORDEN.zn;                 // woorden die zeker geen samenstelling zijn
const AFLEIDINGEN = [...VOORVOEGSELS.map(([affix, grond, woord]) => ({ affix, grond, woord, soort: 'voorvoegsel' })), ...ACHTERVOEGSELS.map(([affix, grond, woord]) => ({ affix, grond, woord, soort: 'achtervoegsel' }))];
export { AFLEIDINGEN };

const herken = vorm({
  id: 'wb-herken', titel: 'Welk woord is een samenstelling?', pictogram: 'omcirkelen', opdracht: 'Eén woord is een samenstelling. Omcirkel dat woord.', doelen: ['1.5.GL2.1'], rang: 1, basis: true,
  bouw: (r) => {
    const s = kies(r, SAMENSTELLING_LIJST), enkel = r.schud(ENKELE_WOORDEN.filter(w => w !== s.a && w !== s.b)).slice(0, 3), alle = r.schud([s.woord, ...enkel]);
    return basisOefening({ tekst: alle.join(NBSP.repeat(6)), antwoord: s.woord, volledig: `${s.woord} = ${s.a} + ${s.b}`, kern: s.woord, sleutel: `${s.woord}|${alle.slice().sort().join()}`, kernen: [s.woord], moeilijkheid: [0], data: { type: 'wb-herken', woorden: alle, samenstelling: s.woord } });
  },
});
const splits = vorm({
  id: 'wb-splits', titel: 'Samenstelling splitsen', pictogram: 'schrijven', opdracht: 'Uit welke twee woorden bestaat de samenstelling? Schrijf ze op.', doelen: ['1.5.GL2.1', '1.5.GL2.18'], rang: 2,
  bouw: (r) => {
    const s = kies(r, SAMENSTELLING_LIJST);
    return basisOefening({ tekst: `${s.woord}${NBSP.repeat(4)}=${NBSP.repeat(4)}____________ + ____________`, antwoord: `${s.a} + ${s.b}`, volledig: `${s.woord} = ${s.a} + ${s.b}`, kern: s.woord, sleutel: s.woord, moeilijkheid: [s.a === s.b[0] ? 1 : 0], data: { type: 'wb-splits', woord: s.woord, a: s.a, b: s.b } });
  },
});
const grondwoord = vorm({
  id: 'wb-grondwoord', titel: 'Het grondwoord', pictogram: 'schrijven', opdracht: 'Schrijf het grondwoord van het woord. Streep het voorvoegsel of het achtervoegsel door.', doelen: ['1.5.GL5.10', '1.5.GL6.7'], rang: 3,
  bouw: (r) => {
    const a = kies(r, AFLEIDINGEN);
    return basisOefening({ tekst: `${a.woord}${NBSP.repeat(4)}→${NBSP.repeat(4)}grondwoord: ____________`, antwoord: a.grond, volledig: `${a.woord} = ${a.soort === 'voorvoegsel' ? a.affix + '- + ' + a.grond : a.grond + ' + -' + a.affix}`, kern: a.woord, sleutel: a.woord, moeilijkheid: [a.soort === 'voorvoegsel' ? 0 : 1], data: { type: 'wb-grond', ...a } });
  },
});
const affix = vorm({
  id: 'wb-voor-achter', titel: 'Voorvoegsel of achtervoegsel?', pictogram: 'omcirkelen', opdracht: 'Staat het stukje voor of achter het grondwoord? Omcirkel voorvoegsel of achtervoegsel.', doelen: ['1.5.GL5.10', '1.5.GL6.7'], rang: 4,
  bouw: (r) => {
    const a = kies(r, AFLEIDINGEN), tekst = a.soort === 'voorvoegsel' ? `${a.woord}: ${a.affix}- + ${a.grond}` : `${a.woord}: ${a.grond} + -${a.affix}`;
    return basisOefening({ tekst: `${tekst}${NBSP.repeat(6)}voorvoegsel${NBSP.repeat(5)}achtervoegsel`, antwoord: a.soort, volledig: `${tekst} (${a.soort})`, kern: a.woord, sleutel: `v${a.woord}`, moeilijkheid: [0], data: { type: 'wb-affix', ...a } });
  },
});
const maak = vorm({
  id: 'wb-maak', titel: 'Woorden maken', pictogram: 'schrijven', opdracht: 'Plak de stukjes aan elkaar tot één woord. Schrijf het woord op de lijn.', doelen: ['1.5.GL5.12', '1.5.GL6.9'], rang: 5,
  bouw: (r) => {
    const a = kies(r, AFLEIDINGEN), stuk = a.soort === 'voorvoegsel' ? `${a.affix} + ${a.grond}` : `${a.grond} + ${a.affix}`;
    return basisOefening({ tekst: `${stuk}${NBSP.repeat(4)}=${NBSP.repeat(4)}____________`, antwoord: a.woord, volledig: `${stuk} = ${a.woord}`, kern: a.woord, sleutel: `m${a.woord}`, moeilijkheid: [a.soort === 'voorvoegsel' ? 0 : 1], data: { type: 'wb-maak', ...a } });
  },
});

export const WOORDBOUW_VORMEN = [herken, splits, grondwoord, affix, maak];
