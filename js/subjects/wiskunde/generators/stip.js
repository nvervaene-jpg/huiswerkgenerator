// Stipoefeningen: het onbekende staat op een andere plaats. Drie soorten, elk een eigen blokje:
//   aanvullen   a + ● = tiental (honderdtal, ...)
//   midden      a + ● = c   of   a − ● = c      (de stip is de tweede term)
//   vooraan     ● + b = c   of   ● − b = c      (de stip is de eerste term)
// Elk bestaat als invullen, kiezen en juist-fout (zie ../../../core/opgave.js). Een brug is een tiental, honderdtal, ... dat overschreden wordt.
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { maakRng } from '../../../core/random.js';
import { aantalCijfers } from './hulp.js';
import { somKern, BRUG_KEUZE, OPTELLEN_AFTREKKEN_DOELEN } from './bewerkingen.js';

const nf = (a, extra = []) => [...extra, a + 1, a - 1, a + 10, a - 10].filter(x => x >= 0);
const OP_KEUZE = { id: 'op', label: 'Bewerking', type: 'select', opties: [['beide', 'Optellen en aftrekken'], ['optellen', 'Enkel optellen'], ['aftrekken', 'Enkel aftrekken']], standaard: 'beide' };
const TOT_KEUZE = { id: 'tot', label: 'Aanvullen tot', type: 'select', standaard: 'gebied', opties: [['gebied', 'Het rekengebied'], ['10', '10'], ['20', '20'], ['100', '100'], ['1000', '1000'], ['volgend-tiental', 'Het volgende tiental'], ['volgend-honderdtal', 'Het volgende honderdtal']] };
const STANDAARD = { op: 'beide', brug: 'beide', tot: 'gebied' };
const kiesLijst = (r, l) => l[r.geheel(0, l.length - 1)];

export function aanvullenOpgave(r, p, gebied) {
  const G = gebied || 100;
  let a, T;
  if (p.tot === 'volgend-tiental') { a = r.geheel(1, G - 1); T = Math.ceil(a / 10) * 10; if (a % 10 === 0 || T > G || a < 5) return null; }
  else if (p.tot === 'volgend-honderdtal') { a = r.geheel(101, Math.max(101, G - 1)); T = Math.ceil(a / 100) * 100; if (a % 100 === 0 || T > G) return null; }
  else { T = p.tot === 'gebied' ? G : Number(p.tot); if (T > G || T < 2) return null; a = r.geheel(1, T - 1); }
  const antw = T - a;
  return { vraag: `${a} + ____ = ${T}`, antwoord: antw, fouten: nf(antw, [T, a + T]), kern: `aan${a}.${T}`, moeilijkheid: [aantalCijfers(T), aantalCijfers(a), a], data: { stip: 'aanvullen', a, T } };
}

// plaats: 'midden' (a op ● = c) of 'vooraan' (● op b = c)
export const stipOpgave = (plaats) => (r, p, gebied) => {
  const soort = p.op === 'beide' ? kiesLijst(r, ['optellen', 'aftrekken']) : p.op, k = somKern(soort, r, gebied || 100, p.brug || 'beide');
  if (!k) return null;
  const antwoord = plaats === 'midden' ? k.b : k.a, vraag = plaats === 'midden' ? `${k.a} ${k.op} ____ = ${k.c}` : `____ ${k.op} ${k.b} = ${k.c}`;
  const fout = k.op === '+' ? [k.c + (plaats === 'midden' ? k.a : k.b), k.c] : [plaats === 'midden' ? k.a + k.c : k.c - k.b, k.c];
  return { vraag, antwoord, fouten: nf(antwoord, fout), kern: k.kern + plaats, moeilijkheid: [...k.moeilijkheid, plaats === 'midden' ? 0 : 1],
    data: { stip: plaats, op: k.op, a: k.a, b: k.b, c: k.c, brug: k.brug } };
};

const maak = (id, titel, opdr, opgave, keuzes) => maakOpgaveVormen({
  id, titel, doelen: OPTELLEN_AFTREKKEN_DOELEN, parameters: () => null, standaard: STANDAARD, opgave, keuzes,
  keuzeNaarP: (eigen) => ({ ...STANDAARD, ...Object.fromEntries(Object.entries(eigen).filter(([, w]) => w !== undefined && w !== 'auto')) }),
  opdracht: { invullen: opdr, kiezen: 'Welk getal hoort op de stip? Kies het juiste antwoord. Omcirkel.', 'juist-fout': 'Is het getal op de stip juist? Omcirkel juist of fout.' },
});
export const STIP_VORMEN = [
  ...maak('stip-aanvullen', 'Aanvullen', 'Vul aan. Schrijf het getal op de lijn.', aanvullenOpgave, [TOT_KEUZE]),
  ...maak('stip-midden', 'Stip in het midden', 'Welk getal hoort op de lijn? Reken uit.', stipOpgave('midden'), [OP_KEUZE, BRUG_KEUZE]),
  ...maak('stip-vooraan', 'Stip vooraan', 'Welk getal hoort op de lijn? Reken uit.', stipOpgave('vooraan'), [OP_KEUZE, BRUG_KEUZE]),
];
