// Spelling: meerdere regels tegelijk kiezen en spellingschema's uit assets/spellingschema.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import taal from '../js/subjects/taal/index.js';
import { bouwDocument } from '../js/export/docx.js';
import { standaardOpmaak } from '../js/core/opmaak.js';
import { laadSchemas, schemaKaart } from '../js/core/schema.js';
import { bouwIndex, MAP } from '../scripts/schema-index.mjs';
import { ICONEN_NAMEN } from '../js/core/icons.js';
import { zetDoelen } from '../js/core/doelregister.js';
import { losOp, planModel } from '../js/core/blad-model.js';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const docx = require('../js/vendor/docx.umd.js'), JSZip = require('../js/vendor/jszip.min.js');
zetDoelen(JSON.parse(readFileSync(new URL('../data/taal/doelen-taal-opstap.json', import.meta.url), 'utf8')).doelen);
const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
const gen = (id) => taal.generators.find(g => g.id === id);

test('meervoud en verkleinwoord: de uitgangen zijn aan te vinken (meerdere tegelijk), de andere keuzes blijven een lijst', () => {
  for (const id of ['mv-invullen', 'vk-invullen']) {
    const k = gen(id).keuzes.find(x => x.id === 'regel');
    assert.equal(k.type, 'multi'); assert.deepEqual(k.standaard, []); assert.ok(k.opties.length >= 3);
  }
  assert.equal(gen('vv-invullen').keuzes.find(x => x.id === 'regel').type, 'select');
});

test('meervoud: enkel de aangevinkte uitgangen komen aan bod, ook bij twee of drie tegelijk; niets aangevinkt = alle', () => {
  const g = gen('mv-invullen'), doel = '1.3.GL2.26';
  const soorten = (regel, aantal = 12) => new Set(g.genereer({ seed: 9, aantal, opties: g.opties([doel], regel === undefined ? {} : { regel }, doel) }).oefeningen.map(o => o.data.soort));
  assert.deepEqual([...soorten(['s'])], ['s']);
  assert.deepEqual([...soorten(['en', 's'])].sort(), ['en', 's']);
  assert.ok(soorten([], 30).has('en') && soorten([], 30).has('s') && soorten([], 30).has('eren'));
  assert.deepEqual([...soorten(['eren'], 3)], ['eren']);
  assert.deepEqual([...soorten('en')], ['en']);                                   // een enkele soort als tekst werkt nog
  assert.ok(soorten(undefined).size >= 2);
});

test('meervoud: bij "welke uitgang?" staan enkel de aangevinkte uitgangen als antwoord, en de keuze zit in de bladcode', () => {
  const g = gen('mv-regel'), doel = '1.3.GL2.26';
  const res = g.genereer({ seed: 4, aantal: 6, opties: g.opties([doel], { regel: ['en', 's'] }, doel) });
  for (const o of res.oefeningen) assert.ok(o.data.soorten.every(s => ['en', 's'].includes(s)), JSON.stringify(o.data.soorten));
  const blad = losOp(taal, planModel(taal, { doelen: [doel], keuzes: { meervouden: { regel: ['en', 's'] } }, seed: 3, gebied: 0, aantal: 6, blokken: 2 }));
  assert.ok(blad.model.blokken.some(b => Array.isArray(b.opties.regel)));
  assert.match(blad.code, /^B3-/);
});

test('schema-index: afbeeldingen en tekstbestanden worden schema\'s; de titel komt uit de eerste regel; index.json is niet verouderd', async () => {
  const map = pathToFileURL((await mkdtemp(`${tmpdir()}/schema-`)) + '/');
  await writeFile(new URL('meervoud-en-s.png', map), PNG);
  await writeFile(new URL('meervoud-en-s.txt', map), 'Meervoud: -en of -s\nKijk naar de laatste letters.\nBij -el, -er, -em volgt -s.\n');
  await writeFile(new URL('verkleinwoord.svg', map), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(new URL('enkel-tekst.txt', map), 'Enkel tekst\nGeen afbeelding nodig.');
  await writeFile(new URL('README.md', map), 'niet meetellen');
  const { schemas } = await bouwIndex(map);
  assert.deepEqual(schemas.map(s => s.id), ['enkel-tekst', 'meervoud-en-s', 'verkleinwoord']);
  assert.deepEqual(schemas[1], { id: 'meervoud-en-s', titel: 'Meervoud: -en of -s', tekst: 'Kijk naar de laatste letters.\nBij -el, -er, -em volgt -s.', afbeelding: 'meervoud-en-s.png' });
  assert.equal(schemas[2].titel, 'Verkleinwoord'); assert.equal(schemas[0].afbeelding, undefined);
  const opgeslagen = JSON.parse(await readFile(new URL('index.json', MAP), 'utf8'));
  assert.deepEqual(opgeslagen, await bouwIndex(), 'assets/spellingschema/index.json is verouderd: draai node scripts/schema-index.mjs');
});

test('schema laden: zonder bestand of bij een fout zijn er geen schema\'s, en een verdwenen schema geeft niets', async () => {
  assert.deepEqual(await laadSchemas(async () => { throw new Error('geen netwerk'); }), []);
  assert.deepEqual(await laadSchemas(async () => ({ ok: false })), []);
  const lijst = await laadSchemas(async () => ({ ok: true, json: async () => ({ schemas: [{ id: 'a', titel: 'A', afbeelding: 'a.png' }, { id: 'b', titel: 'B' }] }) }));
  assert.equal(lijst[0].afbeelding, 'assets/spellingschema/a.png'); assert.equal(lijst[1].afbeelding, undefined);
  assert.equal(schemaKaart(lijst, 'a').titel, 'A'); assert.equal(schemaKaart(lijst, ''), null); assert.equal(schemaKaart(lijst, 'weg'), null);
});

test('docx: het gekozen schema staat bovenaan met titel, afbeelding en uitleg; zonder schema niet', async () => {
  const blad = losOp(taal, planModel(taal, { doelen: ['1.3.GL2.26'], keuzes: {}, seed: 4, gebied: 0, aantal: 4, blokken: 1 }));
  const iconen = Object.fromEntries(ICONEN_NAMEN.map(n => [n, PNG]));
  const maak = async (opmaak, schema) => (await JSZip.loadAsync(await docx.Packer.toBuffer(bouwDocument(docx, [{ naam: 'Anna', blad }], opmaak, { logo: { bytes: PNG, breedte: 418, hoogte: 268 }, iconen, svgPng: new Map(), schema })))).file('word/document.xml').async('string');
  const met = await maak({ ...standaardOpmaak(), schemaKaart: { id: 'a', titel: 'Meervoud: -en of -s', tekst: 'Kijk naar de laatste letters.' } }, { bytes: PNG, breedte: 600, hoogte: 300 });
  const zonder = await maak(standaardOpmaak(), null);
  assert.ok(met.includes('Meervoud: -en of -s') && met.includes('Kijk naar de laatste letters.'));
  assert.ok((met.match(/<w:drawing>/g) || []).length > (zonder.match(/<w:drawing>/g) || []).length);
  assert.ok(!zonder.includes('Meervoud: -en of -s'));
});
