// Schoollogo: standaard assets/logo.png, te vervangen door een eigen afbeelding (bewaard in de browser).
// Printvriendelijk = grijstinten, lichter, zodat zwart-wit afdrukken minder inkt kost.
export const STANDAARD_LOGO = 'assets/logo.png';
const SLEUTEL = 'werkbladgenerator.logo.v1';
const cache = new Map();

let bron = STANDAARD_LOGO;
try { bron = globalThis.localStorage.getItem(SLEUTEL) || STANDAARD_LOGO; } catch { /* geen opslag */ }

export function zetLogo(dataUrl) {
  bron = dataUrl; cache.clear();
  try { localStorage.setItem(SLEUTEL, dataUrl); } catch { /* te groot of geen opslag */ }
}
export function herstelLogo() {
  bron = STANDAARD_LOGO; cache.clear();
  try { localStorage.removeItem(SLEUTEL); } catch { /* geen opslag */ }
}
export const isEigenLogo = () => bron !== STANDAARD_LOGO;

const laadAfbeelding = (src) => new Promise((ok, fout) => {
  const img = new Image();
  img.onload = () => ok(img); img.onerror = () => fout(new Error('Het logo kon niet geladen worden.'));
  img.src = src;
});

// Geeft { url (data-URL, png), breedte, hoogte } terug.
export async function logoAfbeelding(printvriendelijk) {
  const sleutel = bron + '|' + printvriendelijk;
  if (cache.has(sleutel)) return cache.get(sleutel);
  const img = await laadAfbeelding(bron);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0);
  if (printvriendelijk) {
    const d = ctx.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const grijs = 0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
      const licht = 255 - (255 - grijs) * 0.6;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = licht;
    }
    ctx.putImageData(d, 0, 0);
  }
  const res = { url: c.toDataURL('image/png'), breedte: c.width, hoogte: c.height };
  cache.set(sleutel, res);
  return res;
}
