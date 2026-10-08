// Generators voor getalkennis: vergelijken, ordenen, getallenas, splitsen en plaatswaarde.
import { maakRng } from '../../../core/random.js';
import { aantalCijfers, trek, resultaat } from './hulp.js';
import { getallenas, mab } from '../svg.js';

// Doelen waarin getallen vergeleken, geordend en op de getallenas geplaatst worden (L1 t.e.m. L4).
const VERGELIJKEN_ORDENEN = ['2.1.GL1.18', '2.1.GL2.15', '2.1.GL3.13', '2.1.GL4.12'];

/* ------------------------------------------------------------------ vergelijken */
export const vergelijken = {
  id: 'getallen-vergelijken',
  titel: 'Getallen vergelijken',
  pictogram: 'schrijven',
  opdracht: 'Vergelijk de getallen. Schrijf <, > of = op de lijn.',
  doelen: [...VERGELIJKEN_ORDENEN, '2.1.GL3.31', '2.1.GL4.52'],
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const gelijk = r.volgende() < 0.12;
      const a = r.geheel(0, gebied);
      let b = a;
      if (!gelijk) {
        const w = r.volgende();
        if (w < 0.45) b = Math.min(gebied, Math.max(0, a + r.geheel(-Math.max(1, Math.round(gebied * 0.1)), Math.max(1, Math.round(gebied * 0.1)))));
        else if (w < 0.6 && a >= 10) b = Number(String(a).split('').reverse().join(''));   // 34 en 43
        else b = r.geheel(0, gebied);
        if (b === a || b > gebied) return null;
      }
      const teken = a < b ? '<' : a > b ? '>' : '=';
      const grootste = Math.max(a, b);
      return {
        tekst: `${a}  ____  ${b}`, antwoord: teken, volledig: `${a} ${teken} ${b}`,
        getallen: [a, b], sleutel: [a, b].sort((x, y) => x - y).join('/'),
        moeilijkheid: [aantalCijfers(grootste), gelijk ? 0 : 1 - Math.abs(a - b) / Math.max(1, grootste)],
        data: { type: 'vergelijk', a, b },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ ordenen */
export const ordenen = {
  id: 'getallen-ordenen',
  titel: 'Getallen ordenen',
  pictogram: 'schrijven',
  opdracht: 'Zet de getallen in de juiste volgorde. Het teken wijst de richting aan.',
  doelen: VERGELIJKEN_ORDENEN,
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const n = 3 + r.geheel(0, gebied > 10 && gebied <= 100 ? 2 : 1);   // 5 getallen passen enkel bij kleine getallen op één regel
      const set = new Set();
      for (let i = 0; i < 40 && set.size < n; i++) set.add(r.geheel(0, gebied));
      if (set.size < n) return null;
      const stijgend = r.volgende() < 0.5;
      const teken = stijgend ? '<' : '>';
      const juist = [...set].sort((x, y) => (stijgend ? x - y : y - x));
      const door = r.schud([...set]);
      if (door.every((v, i) => v === juist[i])) return null;
      return {
        tekst: `${door.join('   ')}   →   ${Array(n).fill('____').join(` ${teken} `)}`,
        antwoord: juist.join(` ${teken} `), volledig: `${door.join(' ')} → ${juist.join(` ${teken} `)}`,
        getallen: [...set], sleutel: [...set].sort((x, y) => x - y).join('/'), breed: true,
        moeilijkheid: [n, aantalCijfers(Math.max(...set))],
        data: { type: 'orden', getallen: door, stijgend },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ getallenas invullen */
export const getallenasInvullen = {
  id: 'getallenas-invullen',
  titel: 'Getallenas invullen',
  pictogram: 'schrijven',
  opdracht: 'Vul de ontbrekende getallen op de getallenas aan.',
  doelen: VERGELIJKEN_ORDENEN,
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    // stappen van grof naar fijn, telkens met 10 tussenruimtes op de as
    const stappen = gebied <= 10 ? [1] : gebied <= 20 ? [1, 2] : [gebied / 10, gebied / 20, gebied / 100];
    const lijst = trek(rng, aantal, (r) => {
      const si = r.geheel(0, stappen.length - 1);
      const stap = stappen[si];
      const maxStart = (gebied - 10 * stap) / stap;
      const start = r.geheel(0, maxStart) * stap;
      const k = 2 + r.geheel(0, 2);
      const weg = r.schud([...Array(11).keys()]).slice(0, k).sort((x, y) => x - y);
      const getallen = Array.from({ length: 11 }, (_, i) => start + i * stap);
      const tekening = getallenas({ start, stap, ontbreekt: weg });
      return {
        tekst: '', svg: tekening, breed: true,
        antwoord: weg.map(i => getallen[i]).join(', '),
        volledig: `Ontbrekende getallen: ${weg.map(i => getallen[i]).join(', ')}`,
        getallen, sleutel: `${start}/${stap}/${weg.join(',')}`,
        moeilijkheid: [si, k],
        data: { type: 'as', start, stap, weg },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ splitsen */
const PLAATSEN = ['E', 'T', 'H', 'D'];
const delen = (n) => {                              // 347 -> [300, 40, 7] (enkel cijfers die geen 0 zijn)
  const s = String(n), uit = [];
  for (let i = 0; i < s.length; i++) if (s[i] !== '0') uit.push(Number(s[i]) * 10 ** (s.length - 1 - i));
  return uit;
};

export const splitsen = {
  id: 'getallen-splitsen',
  titel: 'Getallen splitsen',
  pictogram: 'schrijven',
  opdracht: 'Splits het getal. Schrijf het ontbrekende getal op de lijn.',
  doelen: ['2.1.GL1.20', '2.1.GL1.22', '2.1.GL1.23', '2.1.GL2.16', '2.1.GL2.18', '2.1.GL3.15', '2.1.GL4.13'],
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      let onderdelen, n, soort;
      if (gebied <= 10 || (gebied <= 20 && r.volgende() < 0.35)) {            // splitsen tot en met 10
        n = r.geheel(2, Math.min(10, gebied));
        const a = r.geheel(1, n - 1);
        onderdelen = [a, n - a]; soort = 'splitsing';
      } else {                                                                 // splitsen in D, H, T en E
        n = r.geheel(11, gebied);
        onderdelen = delen(n); soort = 'plaatswaarde';
        if (onderdelen.length < 2) return null;
      }
      const weg = r.geheel(0, onderdelen.length - 1);
      const tekstDelen = onderdelen.map((d, i) => (i === weg ? '____' : String(d)));
      return {
        tekst: `${n} = ${tekstDelen.join(' + ')}`,
        antwoord: String(onderdelen[weg]), volledig: `${n} = ${onderdelen.join(' + ')}`,
        getallen: [n, ...onderdelen], sleutel: `${n}/${onderdelen.join('+')}/${weg}`,
        moeilijkheid: [aantalCijfers(n), onderdelen.length],
        data: { type: 'splits', n, onderdelen, weg, soort },
      };
    });
    return resultaat(lijst, aantal);
  },
};

/* ------------------------------------------------------------------ plaatswaarde */
const naamPlaats = (n) => PLAATSEN.slice(0, aantalCijfers(n)).reverse();       // 347 -> ['H','T','E']
const cijfersVan = (n) => String(n).split('').map(Number);

export const plaatswaarde = {
  id: 'plaatswaarde',
  titel: 'Plaatswaarde: E, T, H en D',
  pictogram: 'schrijven',
  opdracht: 'Kijk goed naar de plaats van de cijfers. Schrijf het antwoord op de lijn.',
  doelen: ['2.1.GL1.1', '2.1.GL1.7', '2.1.GL2.1', '2.1.GL2.4', '2.1.GL3.1', '2.1.GL3.4', '2.1.GL3.31', '2.1.GL4.3', '2.1.GL4.52'],
  genereer({ seed, aantal, gebied }) {
    if (gebied < 20) return { oefeningen: [], waarschuwing: 'Dit onderdeel vraagt een getallengebied vanaf 20.' };
    const rng = maakRng(seed);
    const lijst = trek(rng, aantal, (r) => {
      const n = r.geheel(10, gebied);
      const namen = naamPlaats(n), c = cijfersVan(n);
      const soort = r.geheel(0, n <= 999 ? 3 : 2);
      const basis = { getallen: [n], moeilijkheid: [namen.length, soort] };
      if (soort === 0) {                                                     // n = ... H + ... T + ... E
        const gaten = namen.map(p => `____ ${p}`).join(' + ');
        return { ...basis, tekst: `${n} = ${gaten}`, antwoord: c.map((x, i) => `${x} ${namen[i]}`).join(' + '),
          volledig: `${n} = ${c.map((x, i) => `${x} ${namen[i]}`).join(' + ')}`, sleutel: `a${n}`, data: { type: 'pw-splits', n } };
      }
      if (soort === 1) {                                                     // 3 H + 4 T + 7 E = ...
        const som = c.map((x, i) => `${x} ${namen[i]}`).join(' + ');
        return { ...basis, tekst: `${som} = ____`, antwoord: String(n), volledig: `${som} = ${n}`, sleutel: `b${n}`, data: { type: 'pw-samen', n } };
      }
      if (soort === 2) {                                                     // welk cijfer staat bij de T?
        const i = r.geheel(0, namen.length - 1);
        return { ...basis, tekst: `In ${n} staat het cijfer ____ bij de ${namen[i]}.`, antwoord: String(c[i]),
          volledig: `In ${n} staat het cijfer ${c[i]} bij de ${namen[i]}.`, sleutel: `c${n}/${namen[i]}`, data: { type: 'pw-cijfer', n, plaats: namen[i] } };
      }
      const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, e = n % 10;   // MAB-materiaal
      return { ...basis, tekst: 'Welk getal zie je? ____', svg: mab({ h, t, e }), breed: true, antwoord: String(n),
        volledig: `Het getal is ${n}`, sleutel: `d${n}`, data: { type: 'pw-mab', n, h, t, e } };
    });
    return resultaat(lijst, aantal);
  },
};
