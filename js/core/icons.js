// Pictogrammen als SVG, zelf getekend. Elk pictogram zegt wat de leerling moet doen.
const lijn = 'fill="none" stroke="#1f3b57" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

const ICONEN = {
  schrijven: `<path ${lijn} d="M10 38 L12 30 L32 10 L38 16 L18 36 Z M28 14 L34 20"/><path ${lijn} d="M8 43 H40"/>`,
};

export function pictogram(naam, grootte = 40) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${grootte}" height="${grootte}" role="img" aria-label="${naam}">${ICONEN[naam] || ''}</svg>`;
}
