// Bladcode: korte code waarmee exact hetzelfde blad opnieuw gemaakt kan worden.
// Inhoud: versie, seed, aantal, getallengebied en per generator de opties.
export function codeNaarTekst(inhoud) {
  const json = JSON.stringify(inhoud);
  const b64 = typeof btoa === 'function' ? btoa(json) : Buffer.from(json).toString('base64');
  return 'B1-' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function tekstNaarCode(tekst) {
  const m = /^B1-([A-Za-z0-9_-]+)$/.exec((tekst || '').trim());
  if (!m) throw new Error('Dit is geen geldige bladcode.');
  const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString();
  return JSON.parse(json);
}
