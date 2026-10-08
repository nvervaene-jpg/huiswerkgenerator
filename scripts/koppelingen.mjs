// Bouwt data/<vak>/generators-map.json opnieuw op uit de doelen van alle generators.
// Gebruik: node scripts/koppelingen.mjs [wiskunde|taal]   (standaard: alle vakken)
import { readFile, writeFile } from 'node:fs/promises';

const VAKKEN = { wiskunde: 'doelen-wiskunde-opstap.json', taal: 'doelen-taal-opstap.json' };
const gevraagd = process.argv[2] ? [process.argv[2]] : Object.keys(VAKKEN);
for (const vak of gevraagd) {
  if (!VAKKEN[vak]) throw new Error(`Onbekend vak: ${vak}`);
  const { GENERATORS } = await import(`../js/subjects/${vak}/generators/index.js`);
  const bron = JSON.parse(await readFile(new URL(`../data/${vak}/${VAKKEN[vak]}`, import.meta.url), 'utf8')).doelen;
  const codes = new Set(bron.map(d => d.code));
  const map = {};
  for (const g of GENERATORS) for (const c of g.doelen) {
    if (!codes.has(c)) throw new Error(`${g.id}: onbekend doel ${c}`);
    (map[c] ||= []).push(g.id);
  }
  const pad = new URL(`../data/${vak}/generators-map.json`, import.meta.url);
  let huidig;
  try { huidig = JSON.parse(await readFile(pad, 'utf8')); } catch {
    huidig = { _uitleg: 'Koppelt Op.stap-doelcodes aan generator-id\'s. Het bronbestand met de doelen blijft ongewijzigd. Enkel doelen met minstens één generator verschijnen in de tool.' };
  }
  huidig.koppelingen = Object.fromEntries(Object.entries(map).sort(([a], [b]) => (a < b ? -1 : 1)));
  await writeFile(pad, JSON.stringify(huidig, null, 2) + '\n');
  console.log(`${vak}: ${GENERATORS.length} generators, ${Object.keys(map).length} doelen gekoppeld`);
}
