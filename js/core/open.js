// Open opdrachten: voor doelen waarvoor geen automatische oefening bestaat. Elke open opdracht toont het doel
// (in 'ik'-vorm als dat netjes kan, anders de tekst van het doel zelf) en laat de leerling schrijven, tekenen of
// zichzelf beoordelen. De leerkracht beoordeelt die opdrachten zelf; er is geen vast antwoord.
import { maakRng } from './random.js';
import { resultaat } from '../subjects/wiskunde/generators/hulp.js';
import { doelVan } from './doelregister.js';

// 'De leerlingen kunnen getallen vergelijken.' -> 'Ik kan getallen vergelijken.' (of null als dat niet netjes kan)
export function kindvorm(tekst) {
  const m = /^De leerling(?:en)? (kan|kunnen|kent|kennen|weet|weten|begrijpt|begrijpen) (.+?)\.?\s*$/i.exec(String(tekst || '').trim());
  if (!m) return null;
  const werkwoord = { kan: 'kan', kunnen: 'kan', kent: 'ken', kennen: 'ken', weet: 'weet', weten: 'weet', begrijpt: 'begrijp', begrijpen: 'begrijp' }[m[1].toLowerCase()];
  const rest = m[2].replace(/\bhun\b/gi, 'mijn').replace(/\bzijn\/haar\b/gi, 'mijn').replace(/\bhem\/haar\b/gi, 'mij').replace(/\bzichzelf\b/gi, 'mezelf');
  if (/\b(zich|elkaar|hij|zij|hem|haar|zijn|hen|leerling(?:en)?|anderen)\b/i.test(rest)) return null;
  return `Ik ${werkwoord} ${rest}.`;
}

export function doelZin(code) {
  const d = doelVan(code), tekst = d ? d.tekst : code;
  return { tekst, kind: d ? kindvorm(d.tekst) : null, doel: d };
}


// profielen: [{ id, vormen: [{ soort, titel, pictogram, opdracht, rang, schaal, basis, prompts[], ruimte(r) }] }]
// Een vorm met eigen inhoud geeft in plaats van prompts: aantal(ctx) (aantal varianten) en bouw(r, ctx, i) (variant i).
// doelenPerProfiel: { profielId: [codes] }   (komt uit het gegenereerde bestand open-doelen.js)
export function maakOpenVormen({ prefix, profielen, doelenPerProfiel }) {
  const uit = [];
  for (const p of profielen) {
    const codes = doelenPerProfiel[p.id] || [];
    if (!codes.length) continue;
    const verzameling = new Set(codes);
    for (const v of p.vormen) {
      const id = `${prefix}-${p.id}-${v.soort}`;
      const aantalVarianten = (ctx) => (v.aantal ? v.aantal(ctx) : v.prompts.length);
      const bouwStandaard = (r, ctx, i) => {
        const prompt = v.prompts[i], z = doelZin(ctx.doel);
        const zin = z.kind ? `‘${z.kind}’` : `‘${z.tekst}’`;
        const tekst = prompt.replace('{doel}', zin);
        const svg = v.ruimte(r, ctx);
        return {
          tekst, svg, breed: true, antwoord: 'Open opdracht: de leerkracht beoordeelt dit.', getallen: [], moeilijkheid: [i],
          volledig: `${ctx.doel} · ${v.titel}: open opdracht, de leerkracht beoordeelt dit. Doel: ${z.tekst}`,
          kern: `${id}|${ctx.doel}|${i}`, familie: `${id}|${i}`, sleutel: `${i}`, data: { type: 'open', doel: ctx.doel, vorm: id, prompt: i },
        };
      };
      uit.push({
        id, titel: v.titel, pictogram: v.pictogram, opdracht: v.opdracht, doelen: codes, rang: v.rang, schaal: v.schaal ?? 1, basis: !!v.basis, open: true,
        opties: (doelCodes, eigen, doel) => ({ doel: doel && verzameling.has(doel) ? doel : doelCodes.find(c => verzameling.has(c)) || codes[0] }),
        genereer({ seed, aantal, opties }) {
          const ctx = { doel: (opties && opties.doel) || codes[0], vorm: id }, rng = maakRng(seed);
          const volgorde = rng.schud([...Array(aantalVarianten(ctx)).keys()]).slice(0, aantal);       // elke variant hoogstens één keer
          const oefeningen = volgorde.map(i => (v.bouw ? v.bouw(rng, ctx, i) : bouwStandaard(rng, ctx, i))).filter(Boolean);
          return resultaat(oefeningen, aantal);
        },
      });
    }
  }
  return uit;
}
