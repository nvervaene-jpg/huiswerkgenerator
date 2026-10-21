// Hulpfuncties voor de automatische wiskundefamilies: getallen opmaken, getallen in woorden, grootste gemene deler, priemgetallen.
const NBSP = ' ';
// Getallen vanaf 10 000 krijgen een spatie tussen de duizendtallen (Vlaamse notatie: 12 345).
export function fmt(n) {
  const s = String(Math.abs(n)), teken = n < 0 ? '−' : '';
  return teken + (s.length >= 5 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : s);
}
// Decimaal getal in honderdsten (integer) als tekst met komma: 345 -> 3,45
export function fmtDec(honderdsten, decimalen = 2) {
  const s = String(Math.abs(honderdsten)).padStart(decimalen + 1, '0'), kommaPlaats = s.length - decimalen;
  const hele = s.slice(0, kommaPlaats), rest = s.slice(kommaPlaats);
  return (honderdsten < 0 ? '−' : '') + fmt(Number(hele)) + (decimalen ? ',' + rest : '');
}
export const ggd = (a, b) => (b ? ggd(b, a % b) : a);
export const kgv = (a, b) => (a / ggd(a, b)) * b;
export const isPriem = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
export const priemfactoren = (n) => { const f = []; for (let d = 2; d * d <= n; d++) while (n % d === 0) { f.push(d); n /= d; } if (n > 1) f.push(n); return f; };
export const delers = (n) => { const l = []; for (let d = 1; d <= n; d++) if (n % d === 0) l.push(d); return l; };

const EENHEID = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
const TIENTAL = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];
// Getal (0 tot en met 1000) in woorden, in één woord geschreven: 22 -> tweeëntwintig, 478 -> vierhonderdachtenzeventig.
export function getalWoord(n) {
  if (n < 20) return EENHEID[n];
  if (n < 100) {
    const t = Math.floor(n / 10), e = n % 10;
    if (!e) return TIENTAL[t];
    const eenheid = EENHEID[e], mee = (e === 2 || e === 3) ? eenheid + 'ën' : eenheid + 'en';   // tweeëntwintig, drieëntwintig
    return mee + TIENTAL[t];
  }
  if (n < 1000) {
    const h = Math.floor(n / 100), rest = n % 100;
    return (h === 1 ? 'honderd' : EENHEID[h] + 'honderd') + (rest ? getalWoord(rest) : '');
  }
  if (n === 1000) return 'duizend';
  throw new Error(`getalWoord: ${n} te groot`);
}

const RANG_BIJ = { 1: 'eerste', 2: 'tweede', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste', 9: 'negende', 10: 'tiende', 11: 'elfde', 12: 'twaalfde', 13: 'dertiende', 14: 'veertiende', 15: 'vijftiende', 16: 'zestiende', 17: 'zeventiende', 18: 'achttiende', 19: 'negentiende' };
// Rangtelwoord (1 tot en met 100): 3 -> derde, 21 -> eenentwintigste, 100 -> honderdste.
export function rangWoord(n) {
  if (RANG_BIJ[n]) return RANG_BIJ[n];
  return getalWoord(n) + 'ste';
}
