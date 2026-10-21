// Bouwt js/subjects/<vak>/open-doelen.js: per soort open opdracht de doelen die (nog) geen echte generator hebben.
// Gebruik: node scripts/open-doelen.mjs [wiskunde|taal]   (standaard: alle vakken)
// Daarna: node scripts/koppelingen.mjs   (om de koppelingen opnieuw op te bouwen)
import { readFile, writeFile } from 'node:fs/promises';

const VAKKEN = { wiskunde: 'doelen-wiskunde-opstap.json', taal: 'doelen-taal-opstap.json' };
const gevraagd = process.argv[2] ? [process.argv[2]] : Object.keys(VAKKEN);
for (const vak of gevraagd) {
  if (!VAKKEN[vak]) throw new Error(`Onbekend vak: ${vak}`);
  const { ECHTE_GENERATORS } = await import(`../js/subjects/${vak}/generators/echt.js`);
  const { profielVan } = await import(`../js/subjects/${vak}/open-profiel.js`);
  const bron = JSON.parse(await readFile(new URL(`../data/${vak}/${VAKKEN[vak]}`, import.meta.url), 'utf8')).doelen;
  const echt = new Set(ECHTE_GENERATORS.flatMap(g => g.doelen));
  const perProfiel = {};
  for (const d of bron) if (!echt.has(d.code)) (perProfiel[profielVan(d)] ||= []).push(d.code);
  const profielen = Object.fromEntries(Object.keys(perProfiel).sort().map(k => [k, perProfiel[k].sort()]));
  const tekst = `// GEGENEREERD door scripts/open-doelen.mjs: niet met de hand aanpassen.\n// Doelen zonder echte generator, per soort open opdracht.\nexport const OPEN_DOELEN = ${JSON.stringify(profielen, null, 1)};\n`;
  await writeFile(new URL(`../js/subjects/${vak}/open-doelen.js`, import.meta.url), tekst);
  console.log(`${vak}: ${Object.entries(profielen).map(([k, v]) => `${k} ${v.length}`).join(', ')} (totaal ${Object.values(profielen).flat().length})`);
}
