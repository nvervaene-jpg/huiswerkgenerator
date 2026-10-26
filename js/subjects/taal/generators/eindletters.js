// Oefenvormen voor woorden die eindigen op -d, -t, -p of -b: verleng het woord om te horen welke letter erachter staat.
//   twee honden -> één hond      twee katten -> één kat      twee kippen -> één kip      twee webben -> één web
// De woorden staan in ../woorden/eindletters.js en mogen door de leerkracht aangevuld worden.
import { maakWoordVormen } from './woordvormen.js';
import { WOORDEN } from '../woorden/eindletters.js';

export const DOELEN = ['1.3.GL2.23', '1.3.GL4.15'];

const familie = maakWoordVormen({
  prefix: 'el', doelen: DOELEN, naam: 'enkelvoud', woorden: WOORDEN,
  niveau: { '1.3.GL2.23': (w) => w.frequent, '1.3.GL4.15': () => true },
  soorten: [
    { id: 'd', label: '-d', keuze: 'Enkel woorden op -d (hond)' }, { id: 't', label: '-t', keuze: 'Enkel woorden op -t (kat)' },
    { id: 'p', label: '-p', keuze: 'Enkel woorden op -p (kip)' }, { id: 'b', label: '-b', keuze: 'Enkel woorden op -b (web)' },
  ],
  denk: true, proef: true, keuzeGroep: 'eindletters', keuzeLabel: 'Welke eindletter oefenen?', alleLabel: 'Alle eindletters door elkaar',
  verdeling: 'woord',
  paar: (w, x) => `twee ${w.van}, één ${x}`,
  vraag: (w) => `twee ${w.van}   →   één __________`,
  kiesTekst: (w, o) => `twee ${w.van}, één   ${o[0]}      of      ${o[1]}`,
  zinnen: ['Op de foto zie ik één {w}.', 'In de klas ligt één {w}.', 'Ik heb één {w} getekend.', 'Wij zagen één {w}.', 'In het boek staat één {w}.', 'Er is één {w}.'],
  hint: (w) => `(twee ${w.van})`,
  invulTitel: 'Enkelvoud schrijven', invulOpdracht: 'Verleng het woord en schrijf het enkelvoud op de lijn.',
  zinOpdracht: 'Schrijf het enkelvoud van het woord tussen haakjes. Vul de zin aan.',
  verbindOpdracht: 'Verbind elk meervoud met zijn enkelvoud. Trek een lijn.',
  regelTitel: 'Welke letter?', regelOpdracht: 'Met welke letter eindigt het woord in het enkelvoud? Omcirkel -d, -t, -p of -b.',
  zonder: ['lettergrepen'],
});

export const woordenVoor = familie.woordenVoor;
export const EINDLETTERS_VORMEN = familie.vormen;
