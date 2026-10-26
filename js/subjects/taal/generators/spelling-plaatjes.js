// Dictee met plaatje voor de spelling: het meervoud of het verkleinwoord van een getekend woord schrijven.
// De woorden en tekeningen staan in ../woorden/plaatjes.js.
import { kies } from './taalkunde.js';
import { maakVorm, oefening, LIJN } from './schrijven.js';
import { plaatjeSvg, PLAATJE_VORMEN } from '../woorden/plaatjes.js';

const NBSP = ' ';
const hulpKeuze = { id: 'enkelvoud', groep: 'spelling-plaatje', label: 'Hulp bij het plaatje', type: 'select', standaard: 'ja', opties: [['ja', 'Het woord staat erbij'], ['nee', 'Enkel het plaatje']] };

export const PLAATJE_MV_DOELEN = ['1.3.GL2.26'];
const meervoud = maakVorm({
  id: 'mv-plaatje', titel: 'Plaatje: schrijf het meervoud', pictogram: 'schrijven', opdracht: 'Kijk naar de plaatjes. Schrijf het meervoud op de lijn.', doelen: PLAATJE_MV_DOELEN, rang: 2, keuzes: [hulpKeuze],
  bouw: (r, o) => {
    const p = kies(r, PLAATJE_VORMEN), hulp = o.enkelvoud || 'ja';
    return oefening({
      tekst: `${hulp === 'ja' ? `één ${p.w}${NBSP.repeat(3)}→${NBSP.repeat(3)}drie` : 'Hoeveel? Er zijn er drie:'}\n${LIJN}`, svg: plaatjeSvg(p.w, { groot: 70, aantal: 3 }), svgBoven: true,
      antwoord: p.meervoud, volledig: p.meervoud, kern: p.w, sleutel: p.w, moeilijkheid: [p.w.length],
      data: { type: 'sp-plaatje-mv', doel: o.doel, woord: p.w, naar: p.meervoud, soort: p.soortMeervoud, hulp },
    });
  },
});

export const PLAATJE_VK_DOELEN = ['1.3.GL2.25', '1.3.GL3.15'];
const SOORTEN_PER_DOEL = { '1.3.GL2.25': ['je', 'tje', 'pje'], '1.3.GL3.15': ['etje', 'kje'] };
const verkleinwoord = maakVorm({
  id: 'vk-plaatje', titel: 'Plaatje: schrijf het verkleinwoord', pictogram: 'schrijven', opdracht: 'Kijk naar het plaatje. Schrijf het verkleinwoord op de lijn.', doelen: PLAATJE_VK_DOELEN, rang: 2, keuzes: [hulpKeuze],
  bouw: (r, o) => {
    const p = kies(r, PLAATJE_VORMEN.filter(x => (SOORTEN_PER_DOEL[o.doel] || []).includes(x.soortKlein))), hulp = o.enkelvoud || 'ja';
    if (!p) return null;
    return oefening({
      tekst: `${hulp === 'ja' ? `${p.w}${NBSP.repeat(3)}→${NBSP.repeat(3)}verkleinwoord:` : 'Schrijf het kleine woord:'}\n${LIJN}`, svg: plaatjeSvg(p.w, { groot: 80 }), svgBoven: true,
      antwoord: p.klein, volledig: p.klein, kern: p.w, sleutel: p.w, moeilijkheid: [p.w.length],
      data: { type: 'sp-plaatje-vk', doel: o.doel, woord: p.w, naar: p.klein, soort: p.soortKlein, hulp },
    });
  },
});

export const SPELLING_PLAATJE_VORMEN = { mv: meervoud, vk: verkleinwoord };
