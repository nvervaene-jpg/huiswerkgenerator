// Bouwt js/subjects/<vak>/auto-doelen.js: per oefenfamilie de doelen die erbij horen (volgens classificatie.js).
// Gebruik: node scripts/bouw-koppelingen.mjs [wiskunde|taal]   (standaard: alle vakken die een classificatie hebben)
// Volgorde na een wijziging: bouw-koppelingen -> open-doelen -> koppelingen   (of: node scripts/bouw-alles.mjs)
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const VAKKEN = { wiskunde: 'doelen-wiskunde-opstap.json', taal: 'doelen-taal-opstap.json' };
const gevraagd = process.argv[2] ? [process.argv[2]] : Object.keys(VAKKEN);
for (const vak of gevraagd) {
  if (!VAKKEN[vak]) throw new Error(`Onbekend vak: ${vak}`);
  if (!existsSync(new URL(`../js/subjects/${vak}/classificatie.js`, import.meta.url))) continue;
  const { FAMILIES } = await import(`../js/subjects/${vak}/classificatie.js`);
  const bron = JSON.parse(await readFile(new URL(`../data/${vak}/${VAKKEN[vak]}`, import.meta.url), 'utf8')).doelen;
  const uit = {};
  for (const f of FAMILIES) uit[f.id] = bron.filter(d => f.parameters(d)).map(d => d.code).sort();
  const tekst = `// GEGENEREERD door scripts/bouw-koppelingen.mjs: niet met de hand aanpassen.\n// Per oefenfamilie de doelen die erbij horen (volgens classificatie.js).\nexport const AUTO_DOELEN = ${JSON.stringify(uit, null, 1)};\n`;
  await writeFile(new URL(`../js/subjects/${vak}/auto-doelen.js`, import.meta.url), tekst);
  console.log(`${vak}: ${Object.entries(uit).map(([k, v]) => `${k} ${v.length}`).join(', ')}`);
}
