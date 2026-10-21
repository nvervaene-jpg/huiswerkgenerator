// Fabriek voor automatische oefenvormen die uit één 'opgave' meerdere vormen halen.
// Een familie levert een functie opgave(r, p) die { vraag, antwoord, fouten[] } teruggeeft, waarbij 'vraag' op de plaats van het antwoord
// ____ bevat (en eventueel 'sleutel': wat een oefening uniek maakt, bv. bij tekeningen waar de vraag steeds dezelfde is). De fabriek maakt er tot drie oefenvormen van:
//   invullen   schrijf het antwoord op de lijn
//   kiezen     kies uit drie antwoorden (het antwoord en twee fouten)
//   juist-fout het antwoord staat er al: is het juist of fout? (de fout is een van de foute antwoorden)
// Een familie hoort bij doelen via parameters(doel) (de parameters voor dat doel, of null als het doel er niet bij hoort);
// de koppeling met de doelen wordt gegenereerd door scripts/bouw-koppelingen.mjs.
import { maakRng } from './random.js';
import { trek, resultaat } from '../subjects/wiskunde/generators/hulp.js';
import { doelVan } from './doelregister.js';

const NBSP = ' ';
const LETTERS = ['a', 'b', 'c', 'd'];
export const BLANCO = '____';

// spec: { id, titel, pictogram, doelen[], parameters(doel) -> p | null, standaard (p), opgave(r, p), vormen?: ['invullen','kiezen','juist-fout'],
//         opdracht: { invullen, kiezen, 'juist-fout' }, titels?: { ... }, aantalOpties? }
export function maakOpgaveVormen(spec) {
  const doelSet = new Set(spec.doelen);
  const vormenIds = spec.vormen || ['invullen', 'kiezen', 'juist-fout'];
  const titels = { invullen: spec.titel, kiezen: `${spec.titel}: kies`, 'juist-fout': `${spec.titel}: juist of fout?`, ...(spec.titels || {}) };
  const parametersVoor = (code) => { const d = doelVan(code); return (d && spec.parameters(d)) || spec.standaard; };
  const rang = { invullen: 1, kiezen: 2, 'juist-fout': 3 };

  function bouwOpgave(r, p, gebied) {
    const o = spec.opgave(r, p, gebied);
    if (!o) return null;
    const fouten = [...new Set(o.fouten.map(String))].filter(f => f !== String(o.antwoord));
    if (!fouten.length) return null;
    return { ...o, antwoord: String(o.antwoord), fouten };
  }
  const gemeen = (o, extra) => ({
    getallen: [], breed: true, moeilijkheid: o.moeilijkheid || [0], kern: o.kern ?? o.vraag, familie: o.kern ?? o.vraag, svg: o.svg, ...extra,
  });
  const invulTekst = (o, w) => o.vraag.replace(BLANCO, w);

  const bouwers = {
    invullen: (r, p, g) => {
      const o = bouwOpgave(r, p, g); if (!o) return null;
      return gemeen(o, { tekst: o.vraag, antwoord: o.antwoord, volledig: invulTekst(o, o.antwoord), sleutel: o.sleutel ?? o.vraag, data: { type: `${spec.id}-invullen`, ...o.data, vraag: o.vraag, antwoord: o.antwoord, fouten: o.fouten } });
    },
    kiezen: (r, p, g) => {
      const o = bouwOpgave(r, p, g); if (!o) return null;
      const opties = r.schud([o.antwoord, ...r.schud(o.fouten).slice(0, 2)]), i = opties.indexOf(o.antwoord);
      const regel = opties.map((x, k) => `${LETTERS[k]}) ${x}`).join(NBSP.repeat(5));
      return gemeen(o, { tekst: `${o.vraag}\n${regel}`, antwoord: `${LETTERS[i]}) ${o.antwoord}`, volledig: `${invulTekst(o, o.antwoord)} (${LETTERS[i]})`, sleutel: `k${o.sleutel ?? o.vraag}`, data: { type: `${spec.id}-kiezen`, ...o.data, vraag: o.vraag, opties, juist: i, antwoord: o.antwoord, fouten: o.fouten } });
    },
    'juist-fout': (r, p, g) => {
      const o = bouwOpgave(r, p, g); if (!o) return null;
      const juist = r.volgende() < 0.5, getoond = juist ? o.antwoord : r.schud(o.fouten)[0];
      return gemeen(o, { tekst: `${invulTekst(o, getoond)}${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`, antwoord: juist ? 'juist' : 'fout', volledig: `${invulTekst(o, getoond)}: ${juist ? 'juist' : `fout (juist is ${o.antwoord})`}`, sleutel: `j${o.sleutel ?? o.vraag}|${getoond}`, data: { type: `${spec.id}-juist-fout`, ...o.data, vraag: o.vraag, getoond, juist, antwoord: o.antwoord, fouten: o.fouten } });
    },
  };

  return vormenIds.map((soort) => ({
    id: `${spec.id}-${soort}`, titel: titels[soort], pictogram: soort === 'invullen' ? (spec.pictogram || 'schrijven') : 'omcirkelen', opdracht: spec.opdracht[soort] || spec.opdracht.invullen,
    doelen: spec.doelen, rang: rang[soort], schaal: spec.schaal ?? 1, basis: soort === 'invullen',
    ...(spec.keuzes ? { keuzes: spec.keuzes.map(k => ({ ...k, groep: spec.id })) } : {}),
    opties: (doelCodes, eigen, doel) => ({ doel: doel && doelSet.has(doel) ? doel : doelCodes.find(c => doelSet.has(c)) || spec.doelen[0], ...(spec.keuzeNaarP ? { p: spec.keuzeNaarP(eigen || {}) } : {}) }),
    genereer({ seed, aantal, gebied, opties }) {
      const code = (opties && opties.doel) || spec.doelen[0], p = { ...parametersVoor(code), ...((opties && opties.p) || {}) }, rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => bouwers[soort](r, p, gebied)), aantal);
    },
  }));
}
