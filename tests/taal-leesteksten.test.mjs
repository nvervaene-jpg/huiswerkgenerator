// Leesteksten uit de map assets/leesteksten en de oefeningen bij een tekst (niveau, volgorde, zoeken, tekenen).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { leesTekstbestand, bouwIndex, MAP } from '../scripts/leesteksten-index.mjs';
import { laadLeesteksten } from '../js/core/leesteksten.js';
import { LEESTEKSTEN, EXTRA_TEKSTEN, tekstenVan, vraagNiveau, zinnenVan, zetExtraTeksten } from '../js/subjects/taal/woorden/leesteksten.js';
import { GENERATORS } from '../js/subjects/taal/generators/index.js';
import { NIVEAU_DOELEN } from '../js/subjects/taal/generators/lezen-tekst.js';

const VOORBEELD = `Titel: De fiets
Leerjaar: 2
Volgorde: ja
Tekst: Eerst pompt Lotte haar banden op. Dan zet ze haar helm op. Daarna fietst ze naar school.
Vraag: Wat pompt Lotte op? | haar banden | haar ballon | haar bal
Vraag: Waarom zet ze haar helm op? | Dat is veilig. | Dat is mooi. | Het regent. | afleiden
`;
const maak = (id, extra = {}, aantal = 6, seed = 3, doel = null) => { const g = GENERATORS.find(x => x.id === id), d = doel || g.doelen[0]; return g.genereer({ seed, aantal, opties: g.opties([d], extra, d) }); };

test('tekstbestand: titel, leerjaar, volgorde en vragen worden ingelezen; fouten worden gemeld', () => {
  const { tekst, fouten } = leesTekstbestand(VOORBEELD, 'de-fiets.txt');
  assert.deepEqual(fouten, []);
  assert.equal(tekst.titel, 'De fiets'); assert.equal(tekst.leerjaar, 2); assert.equal(tekst.volgorde, true); assert.equal(tekst.vragen.length, 2);
  assert.deepEqual(tekst.vragen[1], { vraag: 'Waarom zet ze haar helm op?', juist: 'Dat is veilig.', fout: ['Dat is mooi.', 'Het regent.'], niveau: 'afleiden' });
  for (const kapot of [VOORBEELD.replace('Leerjaar: 2', 'Leerjaar: 9'), VOORBEELD.replace('Titel: De fiets\n', ''), VOORBEELD.replace('| haar ballon | haar bal', '| haar ballon'), VOORBEELD.replace('| afleiden', '| moeilijk'), VOORBEELD.replace('haar ballon | haar bal', 'haar banden | haar bal'), VOORBEELD + 'Rommel hier\n']) {
    const r = leesTekstbestand(kapot, 'kapot.txt'); assert.ok(r.fouten.length >= 1 && r.tekst === null, kapot);
  }
});

test('index: bouwt de lijst uit een map, slaat foute bestanden over en index.json is niet verouderd', async () => {
  const map = pathToFileURL((await mkdtemp(`${tmpdir()}/teksten-`)) + '/');
  await writeFile(new URL('de-fiets.txt', map), VOORBEELD);
  await writeFile(new URL('kapot.txt', map), 'Titel: Zonder rest');
  await writeFile(new URL('README.md', map), 'niet meetellen');
  const { index, fouten } = await bouwIndex(map);
  assert.deepEqual(index.teksten.map(t => t.id), ['de-fiets']); assert.ok(fouten.length >= 1);
  const opgeslagen = JSON.parse(await readFile(new URL('index.json', MAP), 'utf8')), nu = await bouwIndex();
  assert.deepEqual(nu.fouten, []);
  assert.deepEqual(opgeslagen, nu.index, 'assets/leesteksten/index.json is verouderd: draai node scripts/leesteksten-index.mjs');
});

test('laden: extra teksten komen bij de ingebouwde; bij een fout blijven enkel de ingebouwde over', async () => {
  const voor = tekstenVan(2).length;
  const { tekst } = leesTekstbestand(VOORBEELD, 'x.txt');
  assert.equal(await laadLeesteksten(async () => ({ ok: true, json: async () => ({ teksten: [tekst] }) })), 1);
  assert.equal(tekstenVan(2).length, voor + 1); assert.equal(tekstenVan(2).at(-1).volgorde, true); assert.equal(LEESTEKSTEN.L2.length, voor);
  assert.ok(maak('lt-volgorde', {}, 12, 1, '1.2.GL2.28').oefeningen.some(o => o.data.titel === 'De fiets'));
  assert.equal(await laadLeesteksten(async () => { throw new Error('geen netwerk'); }), 0);
  assert.equal(tekstenVan(2).length, voor); assert.deepEqual(EXTRA_TEKSTEN, {});
  zetExtraTeksten([]);
});

test('ingebouwde teksten: elke tekst heeft vragen met drie verschillende antwoorden, en verhalende teksten hebben minstens drie zinnen', () => {
  for (const [jaar, lijst] of Object.entries(LEESTEKSTEN)) for (const t of lijst) {
    assert.ok(t.vragen.length >= 3, `${jaar} ${t.titel}`);
    for (const v of t.vragen) assert.equal(new Set([v.juist, ...v.fout]).size, 3, `${t.titel}: ${v.vraag}`);
    if (t.volgorde) assert.ok(zinnenVan(t.tekst).length >= 3, t.titel);
  }
  assert.equal(vraagNiveau({ vraag: 'Waarom zuchtte Lisa?' }), 'afleiden'); assert.equal(vraagNiveau({ vraag: 'Hoe heet de kat?' }), 'letterlijk'); assert.equal(vraagNiveau({ vraag: 'Waarom?', niveau: 'letterlijk' }), 'letterlijk');
});

test('lees en beantwoord op niveau: elk doel levert oefeningen op zijn eigen niveau, de keuze overschrijft het doel', () => {
  for (const doel of NIVEAU_DOELEN) assert.ok(maak('lt-niveau', {}, 6, 3, doel).oefeningen.length >= 2, doel);   // leerjaar 1 heeft maar twee vragen om af te leiden
  for (const o of maak('lt-niveau', {}, 8, 3, '1.2.GL3.22').oefeningen) assert.equal(o.data.niveau, 'afleiden');
  for (const o of maak('lt-niveau', {}, 8, 3, '1.2.GL3.20').oefeningen) assert.equal(o.data.niveau, 'letterlijk');
  for (const o of maak('lt-niveau', {}, 4, 3, '1.2.GL3.25').oefeningen) { assert.equal(o.data.niveau, 'mening'); assert.equal((o.tekst.match(/_{8,}/g) || []).length, 2); assert.ok(o.data.open); }
  for (const o of maak('lt-niveau', { niveau: 'afleiden' }, 8, 3, '1.2.GL3.20').oefeningen) assert.equal(vraagNiveau({ vraag: o.data.vraagTekst }), 'afleiden');
});

test('wat gebeurt eerst: drie opeenvolgende zinnen uit een verhalende tekst, nooit al in de goede volgorde', () => {
  for (const doel of ['1.2.GL1.34', '1.2.GL2.28', '1.2.GL3.22']) {
    const res = maak('lt-volgorde', {}, 4, 2, doel);
    assert.ok(res.oefeningen.length >= 2, doel);
    for (const o of res.oefeningen) {
      const { juist, getoond, titel } = o.data, tekst = tekstenVan(+/GL(\d)/.exec(doel)[1]).find(t => t.titel === titel);
      assert.equal(juist.length, 3); assert.deepEqual([...getoond].sort(), [...juist].sort()); assert.notDeepEqual(getoond, juist);
      assert.ok(tekst.volgorde && zinnenVan(tekst.tekst).join(' ').includes(juist.join(' ')));
      assert.equal((o.tekst.match(/^____ /gm) || []).length, 3);
    }
  }
});

test('zoek het antwoord in de tekst: het antwoord staat letterlijk in de tekst; lees en teken heeft een tekenkader en een lijn', () => {
  for (const doel of ['1.2.GL1.32', '1.2.GL2.26', '1.2.GL3.20']) for (const o of maak('lt-zoek', {}, 5, 3, doel).oefeningen) {
    const tekst = o.tekst.split('\n')[0].toLowerCase();
    assert.ok(tekst.includes(o.data.juist.toLowerCase().replace(/[.!?]$/, '')), `${doel}: ${o.data.juist}`);
  }
  for (const o of maak('lt-teken', {}, 4).oefeningen) { assert.ok(o.svg && o.svg.markup.includes('<rect') && /_{8,}/.test(o.tekst) && o.data.open); }
});
