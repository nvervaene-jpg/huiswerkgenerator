// Oefenvormen over zinsdelen en zinnen: gezegde, lijdend en meewerkend voorwerp, zinnen opdelen,
// enkelvoudige en samengestelde zinnen, ontkennende zinnen en de gebiedende wijs.
import { ZINNEN, ZINSTYPES } from '../woorden/zinsdelen.js';
import { VERBEN } from '../woorden/werkwoorden.js';
import { vorm, kies, basisOefening } from './taalkunde.js';
import { ottVorm } from './werkwoordkennis.js';

const NBSP = ' ';
export const NAAM = { o: 'onderwerp', g: 'gezegde', lv: 'lijdend voorwerp', mv: 'meewerkend voorwerp', b: 'bijwoordelijke bepaling', ng: 'naamwoordelijk deel' };
const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
const metRol = (rol) => ZINNEN.filter(z => z.delen.some(d => d.rol === rol));
const GEZEGDE_SCHEIDING = ' ... ';
export const gezegdeTekst = (z) => z.delen.filter(d => d.rol === 'g').map(d => d.tekst).join(GEZEGDE_SCHEIDING) + (z.soort === 'naamwoordelijk' ? ` ${z.delen.find(d => d.rol === 'ng').tekst}` : '');

const gezegde = vorm({
  id: 'zd-gezegde', titel: 'Het gezegde', pictogram: 'schrijven', opdracht: 'Lees de zin. Schrijf het gezegde op de lijn.', doelen: ['1.5.GL4.29', '1.5.GL5.17'], rang: 1, basis: true, schaal: 0.84,
  bouw: (r, o) => {
    const pool = o.doel === '1.5.GL4.29' ? ZINNEN.filter(z => z.soort === 'werkwoordelijk') : ZINNEN, z = kies(r, pool), ge = gezegdeTekst(z);
    return basisOefening({ tekst: `${z.tekst}\nGezegde: ____________`, antwoord: ge, volledig: `${z.tekst} → gezegde: ${ge}`, kern: z.tekst, sleutel: `g${z.tekst}`, moeilijkheid: [z.soort === 'naamwoordelijk' ? 1 : 0], data: { type: 'zd-gezegde', zin: z.tekst, gezegde: ge, soort: z.soort } });
  },
});
const gezegdeSoort = vorm({
  id: 'zd-gezegde-soort', titel: 'Werkwoordelijk of naamwoordelijk gezegde?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Is het gezegde werkwoordelijk of naamwoordelijk? Omcirkel.', doelen: ['1.5.GL5.16', '1.5.GL5.17'], rang: 2, schaal: 0.84,
  bouw: (r) => {
    const z = kies(r, ZINNEN);
    return basisOefening({ tekst: `${z.tekst}\nwerkwoordelijk gezegde${NBSP.repeat(6)}naamwoordelijk gezegde`, antwoord: `${z.soort} gezegde`, volledig: `${z.tekst} → ${z.soort} gezegde (${gezegdeTekst(z)})`, kern: z.tekst, sleutel: `s${z.tekst}`, moeilijkheid: [z.soort === 'naamwoordelijk' ? 1 : 0], data: { type: 'zd-gezegde-soort', zin: z.tekst, soort: z.soort } });
  },
});
const voorwerp = (rol, id, doelen, rang) => vorm({
  id, titel: `Het ${NAAM[rol]}`, pictogram: 'schrijven', opdracht: `Lees de zin. Schrijf het ${NAAM[rol]} op de lijn.`, doelen, rang, schaal: 0.84,
  bouw: (r) => {
    const z = kies(r, metRol(rol)), d = z.delen.find(x => x.rol === rol);
    return basisOefening({ tekst: `${z.tekst}\n${hoofd(NAAM[rol])}: ____________`, antwoord: d.tekst, volledig: `${z.tekst} → ${NAAM[rol]}: ${d.tekst}`, kern: z.tekst, sleutel: `${rol}${z.tekst}`, moeilijkheid: [z.delen.length], data: { type: 'zd-voorwerp', zin: z.tekst, rol, antwoord: d.tekst } });
  },
});
const lijdend = voorwerp('lv', 'zd-lijdend', ['1.5.GL6.14', '1.5.GL6.16'], 3);
const meewerkend = voorwerp('mv', 'zd-meewerkend', ['1.5.GL6.15', '1.5.GL6.16'], 4);
const welke = vorm({
  id: 'zd-welke', titel: 'Welk zinsdeel is het?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Welk zinsdeel is het lijdend of het meewerkend voorwerp? Omcirkel.', doelen: ['1.5.GL6.16'], rang: 5, schaal: 0.84,
  bouw: (r) => {
    const rol = kies(r, ['lv', 'mv']), z = kies(r, metRol(rol)), juist = z.delen.find(d => d.rol === rol);
    const andere = r.schud(z.delen.filter(d => d.rol !== rol && d.rol !== 'g' && d.rol !== 'ng')).slice(0, 2);
    if (andere.length < 2) return null;
    const opties = r.schud([juist, ...andere]).map(d => d.tekst);
    return basisOefening({ tekst: `${z.tekst}\nWelk zinsdeel is het ${NAAM[rol]}?${NBSP.repeat(6)}${opties.join(NBSP.repeat(6))}`, antwoord: juist.tekst, volledig: `${z.tekst} → ${NAAM[rol]}: ${juist.tekst}`, kern: z.tekst, sleutel: `w${rol}${z.tekst}`, moeilijkheid: [rol === 'lv' ? 0 : 1], data: { type: 'zd-welke', zin: z.tekst, rol, opties, antwoord: juist.tekst } });
  },
});
const opdelen = vorm({
  id: 'zd-opdelen', titel: 'Zinsdelen', pictogram: 'schrijven', opdracht: 'Verdeel de zin in zinsdelen. Zet een streepje | tussen de zinsdelen.', doelen: ['1.5.GL3.25', '1.5.GL3.21', '1.5.GL3.22'], rang: 2, schaal: 0.84,
  bouw: (r) => {
    const pool = ZINNEN.filter(z => z.delen.filter(d => d.rol === 'g').length === 1 && z.soort === 'werkwoordelijk' && z.delen.length >= 3), z = kies(r, pool);
    return basisOefening({ tekst: `${z.tekst}\n__________________________________`, antwoord: z.delen.map(d => d.tekst).join(' | '), volledig: `${z.tekst} → ${z.delen.map(d => d.tekst).join(' | ')}`, kern: z.tekst, sleutel: `d${z.tekst}`, moeilijkheid: [z.delen.length], data: { type: 'zd-opdelen', zin: z.tekst, delen: z.delen.map(d => d.tekst) } });
  },
});

/* ------------------------------------------------------------------ soorten zinnen */
const zinBouw = vorm({
  id: 'zk-bouw', titel: 'Enkelvoudig of samengesteld?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Is het een enkelvoudige of een samengestelde zin? Omcirkel.', doelen: ['1.5.GL5.18', '1.5.GL5.19'], rang: 6, schaal: 0.84,
  bouw: (r) => {
    const [zin, soort] = kies(r, ZINSTYPES);
    return basisOefening({ tekst: `${zin}\nenkelvoudige zin${NBSP.repeat(6)}samengestelde zin`, antwoord: soort === 'e' ? 'enkelvoudige zin' : 'samengestelde zin', volledig: `${zin} → ${soort === 'e' ? 'enkelvoudige' : 'samengestelde'} zin`, kern: zin, sleutel: `b${zin}`, moeilijkheid: [soort === 'e' ? 0 : 1], data: { type: 'zk-bouw', zin, soort } });
  },
});
const ontkenning = vorm({
  id: 'zk-ontkenning', titel: 'Ontkennend of niet?', pictogram: 'omcirkelen', opdracht: 'Lees de zin. Is het een ontkennende zin? Omcirkel ja of nee.', doelen: ['1.5.GL5.18', '1.5.GL5.19'], rang: 7, schaal: 0.84,
  bouw: (r) => {
    const [zin, soort, ontk] = kies(r, ZINSTYPES);
    return basisOefening({ tekst: `${zin}${NBSP.repeat(8)}ja${NBSP.repeat(5)}nee`, antwoord: ontk ? 'ja' : 'nee', volledig: `${zin} → ${ontk ? 'ontkennende zin' : 'geen ontkennende zin'}`, kern: zin, sleutel: `o${zin}`, moeilijkheid: [ontk ? 1 : 0], data: { type: 'zk-ontkenning', zin, soort, ontkennend: ontk } });
  },
});

/* ------------------------------------------------------------------ gebiedende wijs */
const BEVEL_WERKWOORDEN = VERBEN.filter(v => v.stam && v.zinsdeel && !v.ott);
const PERS_HIJ = { id: 'hij', mv: false, p: 3 };
const bevel = (v) => `${hoofd(v.stam)} ${v.zinsdeel}!`;
const mededeling = (v) => `Jij ${ottVorm(v, PERS_HIJ)} ${v.zinsdeel}.`;
const vraag = (v) => `${hoofd(v.stam)} jij ${v.zinsdeel}?`;
const gebiedend = vorm({
  id: 'gw-herken', titel: 'Welke zin is een bevel?', pictogram: 'omcirkelen', opdracht: 'Eén zin is een bevel (gebiedende wijs). Omcirkel de letter van die zin.', doelen: ['1.5.GL5.21'], rang: 8, schaal: 0.67,
  bouw: (r) => {
    const v = kies(r, BEVEL_WERKWOORDEN), zinnen = r.schud([{ z: bevel(v), s: 'bevel' }, { z: mededeling(v), s: 'mededeling' }, { z: vraag(v), s: 'vraag' }]), letters = ['a', 'b', 'c'];
    const juist = zinnen.findIndex(x => x.s === 'bevel');
    return basisOefening({ tekst: zinnen.map((x, i) => `${letters[i]}) ${x.z}`).join('\n'), antwoord: `${letters[juist]}) ${zinnen[juist].z}`, volledig: `Het bevel is ${letters[juist]}) ${zinnen[juist].z}`, kern: v.inf, sleutel: `${v.inf}|${zinnen.map(x => x.s).join()}`, moeilijkheid: [0], data: { type: 'gw-herken', inf: v.inf, zinnen: zinnen.map(x => x.z), soorten: zinnen.map(x => x.s), juist } });
  },
});
const maakBevel = vorm({
  id: 'gw-maak', titel: 'Maak er een bevel van', pictogram: 'schrijven', opdracht: 'Maak van de zin een bevel. Je begint met het werkwoord en eindigt met een uitroepteken.', doelen: ['1.5.GL5.20', '1.5.GL5.21'], rang: 9, schaal: 0.84,
  bouw: (r) => {
    const v = kies(r, BEVEL_WERKWOORDEN);
    return basisOefening({ tekst: `${mededeling(v)}${NBSP.repeat(4)}→${NBSP.repeat(4)}__________________`, antwoord: bevel(v), volledig: `${mededeling(v)} → ${bevel(v)}`, kern: v.inf, sleutel: `m${v.inf}`, moeilijkheid: [v.soort === 'zwak' ? 0 : 1], data: { type: 'gw-maak', inf: v.inf, stam: v.stam, zin: mededeling(v), bevel: bevel(v) } });
  },
});

export const ZINSDELEN_VORMEN = [gezegde, gezegdeSoort, lijdend, meewerkend, welke, opdelen, zinBouw, ontkenning, gebiedend, maakBevel];
