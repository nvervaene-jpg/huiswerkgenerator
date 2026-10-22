// Spellingregels waaraan elk woord in Taal moet voldoen, ook een bewust fout geschreven woord in een opdracht 'fout zoeken'.
// Een Nederlands woord eindigt nooit op -v of -z (buiten enkele leenwoorden), heeft nooit drie dezelfde letters na elkaar,
// begint nooit met een dubbele medeklinker en schrijft q altijd met u. Gebruik bij voorkeur enkel woorden uit de woordenlijsten.
export const LEENWOORD_UITZONDERINGEN = new Set(['quiz', 'jazz', 'fez', 'blitz', 'pizzazz']);
// Afkortingen (bv. enz., zoz.) en letters zonder klinker (tv, vvt, cc) zijn geen gewone woorden.
export const AFKORTINGEN = new Set(['enz', 'zoz', 'dwz', 'blz', 'bv', 'tv', 'vz', 'lv', 'mv', 'pc', 'gsm', 'vzw', 'wc', 'dvd', 'btw', 'cd']);
const DUBBEL_EINDE = /(bb|dd|gg|kk|pp|tt|vv|zz|mm|nn|rr|cc|hh|jj|ww)$/;

// Geeft de regels die het woord overtreedt; een lege lijst betekent dat het woord in orde is.
// fout: het woord is bewust fout gespeld (dan mag het wel op een dubbele medeklinker eindigen).
export function spellingFouten(woord, { fout = false } = {}) {
  const w = String(woord).toLowerCase(), uit = [];
  if (!/^[a-zàáâäçèéêëìíîïñòóôöùúûü'-]+$/.test(w)) return ['geen woord'];
  if (LEENWOORD_UITZONDERINGEN.has(w) || AFKORTINGEN.has(w) || !/[aeiouyàáâäèéêëìíîïòóôöùúûü]/.test(w)) return uit;
  if (/v$/.test(w)) uit.push('eindigt op v');
  if (/z$/.test(w)) uit.push('eindigt op z');
  if (/([a-z])\1\1/.test(w)) uit.push('drie dezelfde letters');
  if (/^([bcdfghjklmnprstvwxz])\1/.test(w)) uit.push('begint met een dubbele medeklinker');
  if (/q(?!u)/.test(w)) uit.push('q zonder u');
  if (!fout && DUBBEL_EINDE.test(w)) uit.push('eindigt op een dubbele medeklinker');
  return uit;
}
export const isGeldigWoord = (woord, opties) => spellingFouten(woord, opties).length === 0;
// Houdt van een lijst kandidaten enkel de geldige over (bewust foute vormen mogen de regels niet breken).
export const geldigeKandidaten = (lijst) => lijst.filter(w => isGeldigWoord(w, { fout: true }));
