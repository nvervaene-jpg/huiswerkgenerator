// Pictogrammen als SVG, zelf getekend. Elk pictogram zegt wat de leerling moet doen.
const lijn = 'fill="none" stroke="#1f3b57" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

const vul = 'fill="#f4b942" stroke="#1f3b57" stroke-width="3" stroke-linejoin="round"';
const ICONEN = {
  meten: `<rect x="4" y="16" width="40" height="16" rx="2" ${lijn}/><path ${lijn} d="M11 16 v7 M18 16 v10 M25 16 v7 M32 16 v10 M39 16 v7"/>`,
  omcirkelen: `<text x="24" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#1f3b57" stroke="none">12</text><path ${lijn} d="M6 22 C4 11 20 6 34 9 C46 12 47 30 30 38 C16 43 3 36 5 24 C6 17 13 12 20 10"/>`,
  kleuren: `<path ${vul} d="M8 40 L12 29 L32 9 L39 16 L19 36 Z"/><path ${lijn} d="M28 13 L35 20 M8 40 L12 29 L19 36 Z"/><path ${lijn} d="M24 42 h16"/>`,
  verbinden: `<circle cx="10" cy="14" r="5" ${vul}/><circle cx="38" cy="34" r="5" ${vul}/><path ${lijn} d="M15 16 C26 18 24 30 33 32"/>`,
  tekenen: `<path ${lijn} d="M6 36 C14 10 22 44 30 22 S40 18 42 12"/><path ${vul} d="M34 6 L42 14 L36 20 L28 12 Z"/>`,
  schrijven: `<path ${lijn} d="M10 38 L12 30 L32 10 L38 16 L18 36 Z M28 14 L34 20"/><path ${lijn} d="M8 43 H40"/>`,
};

export const ICONEN_NAMEN = Object.keys(ICONEN);

export function pictogramSvg(naam, grootte = 40) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${grootte}" height="${grootte}" role="img" aria-label="${naam}">${ICONEN[naam] || ''}</svg>`;
}
export const pictogram = pictogramSvg;
