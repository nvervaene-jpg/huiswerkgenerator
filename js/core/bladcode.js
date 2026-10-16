// Bladcode: korte code waarmee exact hetzelfde blad (met alle aanpassingen) opnieuw gemaakt kan worden.
const PREFIX = 'B2-';

export function codeNaarTekst(inhoud) {
  const json = JSON.stringify(inhoud);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bytes).toString('base64');
  return PREFIX + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function tekstNaarCode(tekst) {
  const t = (tekst || '').trim();
  if (/^B1-/.test(t)) throw new Error('Dit is een bladcode van een oudere versie (B1) en kan niet meer geopend worden.');
  const m = /^B2-([A-Za-z0-9_-]+)$/.exec(t);
  if (!m) throw new Error('Dit is geen geldige bladcode.');
  const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
  const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error('Deze bladcode is beschadigd.'); }
}
