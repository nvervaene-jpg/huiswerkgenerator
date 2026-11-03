// Maakt js/subjects/wiskunde/geld-afbeeldingen.js: de foto's van munten en biljetten (assets/geld/) als data-adressen,
// zodat ze in de svg-tekeningen zitten (en dus ook mee in het Word-bestand). Uitvoeren na het wijzigen van de afbeeldingen:
//   node scripts/bouw-geld.mjs
import { readFile, writeFile, readdir } from 'node:fs/promises';

const MAP = new URL('../assets/geld/', import.meta.url);
const grootte = (b) => {                                         // breedte en hoogte uit de kop van een png of jpg
  if (b[0] === 0x89) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  for (let i = 2; i < b.length;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + len;
  }
  throw new Error('Onbekend afbeeldingsformaat');
};
const uit = {};
for (const naam of (await readdir(MAP)).sort()) {
  const m = /^(biljet|munt)-(\d+)\.(png|jpg)$/.exec(naam);
  if (!m) continue;
  const bytes = await readFile(new URL(naam, MAP)), [b, h] = grootte(bytes);
  (uit[m[1]] ||= {})[m[2]] = { href: `data:image/${m[3] === 'jpg' ? 'jpeg' : 'png'};base64,${bytes.toString('base64')}`, b, h };
}
const tekst = `// Gegenereerd door scripts/bouw-geld.mjs uit assets/geld/ — niet met de hand aanpassen.
// Sleutel = waarde in eurocent. b en h zijn de pixels van de opgeslagen afbeelding (tweemaal de getekende grootte).
export const GELD_AFBEELDINGEN = ${JSON.stringify(uit)};
`;
await writeFile(new URL('../js/subjects/wiskunde/geld-afbeeldingen.js', import.meta.url), tekst);
console.log(Object.entries(uit).map(([k, v]) => `${k}: ${Object.keys(v).join(', ')}`).join('\n'), `\n${(tekst.length / 1024).toFixed(0)} kB`);
