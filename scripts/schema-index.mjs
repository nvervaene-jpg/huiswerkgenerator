// Bouwt assets/spellingschema/index.json uit de afbeeldingen en tekstbestanden in die map (zie README.md daar).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const MAP = new URL('../assets/spellingschema/', import.meta.url);
const AFBEELDING = /\.(png|jpe?g|webp|gif|svg)$/i;
const mooi = (id) => { const t = id.replace(/[-_]+/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); };

export async function bouwIndex(map = MAP) {
  const namen = (await readdir(map)).sort((a, b) => a.localeCompare(b, 'nl'));
  const schemas = new Map();
  for (const naam of namen) {
    const m = /^(.*)\.([^.]+)$/.exec(naam);
    if (!m || /^(index|readme)$/i.test(m[1])) continue;
    const [, id, ext] = m;
    if (AFBEELDING.test(naam)) schemas.set(id, { ...(schemas.get(id) || { id }), afbeelding: naam });
    else if (/^txt$/i.test(ext)) schemas.set(id, { ...(schemas.get(id) || { id }), tekstbestand: naam });
  }
  const lijst = [];
  for (const s of schemas.values()) {
    let titel = mooi(s.id), tekst = '';
    if (s.tekstbestand) {
      const [eerste, ...rest] = (await readFile(new URL(s.tekstbestand, map), 'utf8')).replace(/\r/g, '').split('\n');
      if (eerste.trim()) titel = eerste.trim();
      tekst = rest.join('\n').trim();
    }
    lijst.push({ id: s.id, titel, ...(tekst ? { tekst } : {}), ...(s.afbeelding ? { afbeelding: s.afbeelding } : {}) });
  }
  return { _uitleg: 'Gemaakt met node scripts/schema-index.mjs uit de bestanden in deze map. Niet met de hand aanpassen.', schemas: lijst };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const index = await bouwIndex();
  await writeFile(new URL('index.json', MAP), JSON.stringify(index, null, 2) + '\n');
  console.log(`${index.schemas.length} schema's in assets/spellingschema/index.json`);
}
