// Bouwt assets/leesteksten/index.json uit de tekstbestanden in die map (zie README.md daar).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const MAP = new URL('../assets/leesteksten/', import.meta.url);

export function leesTekstbestand(inhoud, naam = 'bestand') {
  const t = { vragen: [] }, fouten = [];
  for (const [i, regel] of inhoud.replace(/\r/g, '').split('\n').entries()) {
    if (!regel.trim()) continue;
    const m = /^(Titel|Leerjaar|Volgorde|Tekst|Vraag)\s*:\s*(.*)$/i.exec(regel);
    if (!m) { fouten.push(`${naam}, regel ${i + 1}: onbekende regel "${regel.slice(0, 40)}"`); continue; }
    const sleutel = m[1].toLowerCase(), waarde = m[2].trim();
    if (sleutel === 'titel') t.titel = waarde;
    else if (sleutel === 'leerjaar') t.leerjaar = Number(waarde);
    else if (sleutel === 'volgorde') t.volgorde = /^(ja|waar|1)$/i.test(waarde);
    else if (sleutel === 'tekst') t.tekst = waarde;
    else {
      const delen = waarde.split('|').map(x => x.trim());
      if (delen.length < 4 || delen.length > 5 || delen.slice(0, 4).some(x => !x)) { fouten.push(`${naam}, regel ${i + 1}: een vraag heeft vier delen (vraag | juist | fout | fout) en eventueel een vijfde (letterlijk of afleiden)`); continue; }
      if (delen[4] && !/^(letterlijk|afleiden)$/.test(delen[4])) { fouten.push(`${naam}, regel ${i + 1}: het vijfde deel moet letterlijk of afleiden zijn`); continue; }
      t.vragen.push({ vraag: delen[0], juist: delen[1], fout: [delen[2], delen[3]], ...(delen[4] ? { niveau: delen[4] } : {}) });
    }
  }
  if (!t.titel) fouten.push(`${naam}: Titel ontbreekt`);
  if (!(t.leerjaar >= 1 && t.leerjaar <= 6)) fouten.push(`${naam}: Leerjaar moet een getal van 1 tot 6 zijn`);
  if (!t.tekst || t.tekst.length < 20) fouten.push(`${naam}: Tekst ontbreekt of is te kort`);
  if (!t.vragen.length) fouten.push(`${naam}: minstens één Vraag is nodig`);
  for (const v of t.vragen) if (new Set([v.juist, ...v.fout]).size < 3) fouten.push(`${naam}: de antwoorden bij "${v.vraag}" moeten verschillen`);
  return { tekst: fouten.length ? null : t, fouten };
}

export async function bouwIndex(map = MAP) {
  const teksten = [], fouten = [];
  for (const naam of (await readdir(map)).filter(n => /\.txt$/i.test(n)).sort((a, b) => a.localeCompare(b, 'nl'))) {
    const r = leesTekstbestand(await readFile(new URL(naam, map), 'utf8'), naam);
    fouten.push(...r.fouten);
    if (r.tekst) teksten.push({ id: naam.replace(/\.txt$/i, ''), ...r.tekst });
  }
  return { index: { _uitleg: 'Gemaakt met node scripts/leesteksten-index.mjs uit de bestanden in deze map. Niet met de hand aanpassen.', teksten }, fouten };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { index, fouten } = await bouwIndex();
  await writeFile(new URL('index.json', MAP), JSON.stringify(index, null, 2) + '\n');
  console.log(`${index.teksten.length} teksten in assets/leesteksten/index.json`);
  if (fouten.length) { console.error('Let op, dit ging mis:\n' + fouten.map(f => ' - ' + f).join('\n')); process.exitCode = 1; }
}
