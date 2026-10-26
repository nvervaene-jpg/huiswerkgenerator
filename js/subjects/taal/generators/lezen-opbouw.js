// Opbouw van woord naar zin naar tekst: dezelfde klankgroep lezen in een woord, in een zin en in een korte tekst.
// De zin en de tekst komen uit de leesteksten (../woorden/leesteksten.js en de map assets/leesteksten); er wordt niets bijgeschreven.
import { vorm, kies, basisOefening } from './taalkunde.js';
import { LEES_DOELEN, ZOEK_DOELEN } from './lezen.js';
import { tekstenVan, zinnenVan } from '../woorden/leesteksten.js';

const NBSP = ' ';
const jaarVan = (doel) => Number(/GL(\d)/.exec(doel || '')?.[1] || 3);
const schoon = (w) => w.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ]+$/g, '');

// Alle (tekst, woord, zin) waarin een woord de klankgroep bevat, uit de teksten van dit leerjaar en het jaar eronder.
export function opbouwKandidaten(doel, soort) {
  const j = jaarVan(doel), uit = [];
  for (const t of [...tekstenVan(j), ...tekstenVan(j - 1)]) {
    for (const zin of zinnenVan(t.tekst)) {
      for (const w of new Set(zin.split(/\s+/).map(schoon).filter(x => x.length >= 3 && x.toLowerCase().includes(soort) && !/^[A-ZÀ-Ý]/.test(x)))) uit.push({ tekst: t, woord: w.toLowerCase(), zin });
    }
  }
  return uit;
}
export const OPBOUW_DOELEN = ZOEK_DOELEN.filter(c => LEES_DOELEN[c].soorten.some(s => opbouwKandidaten(c, s).length >= 1));

const opbouwKeuze = { id: 'opbouw', groep: 'lezen-opbouw', label: 'Tot waar loopt de opbouw?', type: 'select', standaard: 'tekst', opties: [['tekst', 'Woord, zin en tekst'], ['zin', 'Woord en zin']] };

const opbouw = vorm({
  id: 'lz-opbouw', titel: 'Van woord naar tekst', pictogram: 'schrijven', opdracht: 'Lees stap voor stap, van het woord naar de tekst. Lees elk deel vlot en zonder fouten.', doelen: OPBOUW_DOELEN, rang: 5, schaal: 0.34, keuzes: [opbouwKeuze],
  bouw: (r, o) => {
    const d = LEES_DOELEN[o.doel], soorten = d.soorten.filter(s => opbouwKandidaten(o.doel, s).length), soort = soorten.length ? kies(r, soorten) : null;
    if (!soort) return null;
    const k = kies(r, opbouwKandidaten(o.doel, soort)), tot = o.opbouw === 'zin' ? 'zin' : 'tekst';
    const delen = [`Woord:${NBSP.repeat(3)}${k.woord}`, `Zin:${NBSP.repeat(3)}${k.zin}`, ...(tot === 'tekst' ? [`Tekst:\n${k.tekst.tekst}`] : [])];
    return basisOefening({
      tekst: delen.join('\n'), antwoord: `${k.woord}; ${k.zin}`, volledig: `${soort}: ${k.woord} → ${k.zin}${tot === 'tekst' ? ` → ${k.tekst.titel}` : ''} (de leerkracht luistert)`,
      kern: `${soort}|${k.tekst.titel}|${k.woord}`, sleutel: `${soort}|${k.tekst.titel}|${k.woord}|${tot}`, kernen: [k.woord], moeilijkheid: [tot === 'zin' ? 1 : 2, k.tekst.tekst.length],
      data: { type: 'lz-opbouw', doel: o.doel, soort, woord: k.woord, zin: k.zin, titel: k.tekst.titel, tot, open: true },
    });
  },
});

export const LEZEN_OPBOUW_VORMEN = [opbouw];
