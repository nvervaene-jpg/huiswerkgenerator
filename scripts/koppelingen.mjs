// Bouwt data/wiskunde/generators-map.json opnieuw op uit de doelen van alle generators.
// Gebruik: node scripts/koppelingen.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { GENERATORS } from '../js/subjects/wiskunde/generators/index.js';

const bron = JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen;
const codes = new Set(bron.map(d => d.code));
const map = {};
for (const g of GENERATORS) for (const c of g.doelen) {
  if (!codes.has(c)) throw new Error(`${g.id}: onbekend doel ${c}`);
  (map[c] ||= []).push(g.id);
}
const pad = new URL('../data/wiskunde/generators-map.json', import.meta.url);
const huidig = JSON.parse(await readFile(pad, 'utf8'));
huidig.koppelingen = Object.fromEntries(Object.entries(map).sort(([a], [b]) => (a < b ? -1 : 1)));
await writeFile(pad, JSON.stringify(huidig, null, 2) + '\n');
console.log(`${GENERATORS.length} generators, ${Object.keys(map).length} doelen gekoppeld`);
