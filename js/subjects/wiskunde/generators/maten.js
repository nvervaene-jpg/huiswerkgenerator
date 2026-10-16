// Fabrieken voor generators die maateenheden omzetten of vergelijken (lengte, massa, tijdsduur, geld).
// Elke maat geeft: factor (waarde van 1 eenheid in de kleinste eenheid), volgorde (groot -> klein),
// doelkaart (doelcode -> eenheden) en standaard (eenheden als er geen doel gekozen is).
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';

// Sleutel van een omzetting; vormen die dezelfde kern gebruiken, tonen nooit dezelfde omzetting op één blad.
export const kernOmzet = (maat, a, b, v, w) => `${maat}:${[a, b].sort().join('-')}:${Math.min(v, w)}`;

export function eenhedenVoorDoelen(volgorde, doelkaart, doelCodes) {
  const set = new Set();
  for (const c of doelCodes) (doelkaart[c] || []).forEach(e => set.add(e));
  return volgorde.filter(e => set.has(e));
}

const gekozenEenheden = (opties, standaard) => (opties && opties.eenheden && opties.eenheden.length > 1 ? opties.eenheden : standaard);

function omzettingen(eenheden, factor, gebied) {
  const lijst = [];
  for (const a of eenheden) for (const b of eenheden) {
    if (a === b) continue;
    const omhoog = factor[a] < factor[b];                       // bv. cm -> dm: het getal wordt kleiner
    const r = omhoog ? factor[b] / factor[a] : factor[a] / factor[b];
    if (!Number.isInteger(r)) continue;
    for (let n = 1; n * r <= gebied; n++) lijst.push(omhoog ? { a, v: n * r, b, w: n, r, omhoog } : { a, v: n, b, w: n * r, r, omhoog });
  }
  return lijst;
}

export function maakOmzetten({ id, titel, opdracht, maat, factor, volgorde, doelkaart, standaard, onbekendElders = false }) {
  return {
    id, titel, pictogram: 'schrijven', opdracht, rang: 0, basis: true,
    doelen: Object.keys(doelkaart),
    opties: (doelCodes) => ({ eenheden: eenhedenVoorDoelen(volgorde, doelkaart, doelCodes) }),
    genereer({ seed, aantal, gebied, opties }) {
      const rng = maakRng(seed);
      const gezien = new Set(), gekozen = [];
      for (const k of rng.schud(omzettingen(gekozenEenheden(opties, standaard), factor, gebied))) {
        if (gekozen.length >= aantal) break;
        const familie = [[k.a, k.b].sort().join(), Math.min(k.v, k.w)].join(':');     // dezelfde omzetting in beide richtingen telt als gelijkaardig
        if (gezien.has(familie)) continue;
        gezien.add(familie);
        const links = onbekendElders && rng.volgende() < 0.35;                      // ___ m = 300 cm
        gekozen.push({
          tekst: links ? `____ ${k.a} = ${k.w} ${k.b}` : `${k.v} ${k.a} = ____ ${k.b}`,
          antwoord: links ? `${k.v} ${k.a}` : `${k.w} ${k.b}`, volledig: `${k.v} ${k.a} = ${k.w} ${k.b}`,
          getallen: [k.v, k.w], sleutel: `${k.v} ${k.a}>${k.b}${links ? '<' : ''}`, kern: kernOmzet(maat, k.a, k.b, k.v, k.w),
          moeilijkheid: [Math.log10(k.r) + (k.omhoog ? 0.5 : 0), Math.max(k.v, k.w)],
          data: { type: 'omzet', maat, v: k.v, a: k.a, w: k.w, b: k.b, onbekend: links ? 'links' : 'rechts' },
        });
      }
      return resultaat(gekozen, aantal);
    },
  };
}

export function maakVergelijken({ id, titel, opdracht, maat, factor, volgorde, doelkaart, standaard }) {
  return {
    id, titel, pictogram: 'schrijven', opdracht, rang: 1, basis: true,
    doelen: Object.keys(doelkaart),
    opties: (doelCodes) => ({ eenheden: eenhedenVoorDoelen(volgorde, doelkaart, doelCodes) }),
    genereer({ seed, aantal, gebied, opties }) {
      const eenheden = gekozenEenheden(opties, standaard);
      const rng = maakRng(seed);
      const lijst = trek(rng, aantal, (r) => {
        const a = eenheden[r.geheel(0, eenheden.length - 1)], b = eenheden[r.geheel(0, eenheden.length - 1)];
        if (a === b) return null;
        const v = r.geheel(1, gebied);
        const gelijkW = (v * factor[a]) / factor[b];                  // zelfde hoeveelheid in eenheid b
        let w;
        if (Number.isInteger(gelijkW) && gelijkW >= 1 && gelijkW <= gebied && r.volgende() < 0.25) w = gelijkW;
        else {
          w = Math.round(gelijkW * (0.5 + r.volgende()));
          if (w === gelijkW) w += r.volgende() < 0.5 ? 1 : -1;
        }
        if (w < 1 || w > gebied || !Number.isInteger(w)) return null;
        const x = v * factor[a], y = w * factor[b];
        const teken = x < y ? '<' : x > y ? '>' : '=';
        const verhouding = Math.log10(Math.max(factor[a] / factor[b], factor[b] / factor[a]));
        return {
          tekst: `${v} ${a}  ____  ${w} ${b}`, antwoord: teken, volledig: `${v} ${a} ${teken} ${w} ${b}`,
          getallen: [v, w], sleutel: `${v}${a}/${w}${b}`,
          familie: [[v, a].join(), [w, b].join()].sort().join('|'),
          moeilijkheid: [verhouding, teken === '=' ? 0 : 1, Math.max(v, w)],
          data: { type: 'maat-vergelijk', maat, v, a, w, b },
        };
      });
      return resultaat(lijst, aantal);
    },
  };
}
