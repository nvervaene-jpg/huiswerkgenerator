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

/* ------------------------------------------------------------------ de tien nieuwe spellingvormen */
const maakNieuw = (id, extra = {}, aantal = 6, seed = 5, doel = null) => {
  const g = gen(id), d = doel || g.doelen[0];
  return g.genereer({ seed, aantal, opties: g.opties([d], extra, d) });
};
const NIEUW = ['gelijk', 'uitleg', 'sorteer', 'buiten', 'zinwoord', 'nakijken', 'regelschrijf'];

test('denk- en schrijfvormen: elke familie met denk-vormen heeft ze alle zeven, en elke vorm geeft het gevraagde aantal', () => {
  for (const f of ['mv', 'vk', 'vv', 'el']) for (const v of NIEUW) {
    const g = gen(`${f}-${v}`);
    assert.ok(g, `${f}-${v}`);
    for (const doel of g.doelen) {
      const res = maakNieuw(`${f}-${v}`, {}, 5, 3, doel);
      assert.ok(res.oefeningen.length >= 3, `${f}-${v} ${doel}: ${res.oefeningen.length}`);
    }
  }
});

test('welk woord werkt hetzelfde: het juiste voorbeeld heeft dezelfde soort als het woord, het andere niet', () => {
  for (const o of maakNieuw('mv-gelijk', {}, 10).oefeningen) {
    assert.equal(o.data.juist.soort, o.data.soort); assert.notEqual(o.data.fout.soort, o.data.soort);
    assert.ok(o.data.opties.includes(o.data.juist.van) && o.data.opties.includes(o.data.fout.van));
  }
});

test('sorteren: twee kolommen met drie woorden elk, elk woord staat in de kolom van zijn eigen soort', () => {
  for (const f of ['mv', 'vv']) for (const o of maakNieuw(`${f}-sorteer`, {}, 6).oefeningen) {
    assert.equal(o.data.kolommen.length, 2);
    o.data.kolommen.forEach((k, i) => { assert.equal(k.length, 3); assert.ok(k.every(w => w.soort === o.data.soorten[i])); });
    assert.ok(o.svg && o.antwoordSvg && o.antwoordSvg.markup.includes('#c0392b') && !o.svg.markup.includes('#c0392b'));
    assert.equal(new Set(o.data.kolommen.flat().map(w => w.naar)).size, 6);
  }
});

test('welk woord hoort er niet bij: vier woorden van één soort en één van een andere', () => {
  for (const f of ['mv', 'vk', 'el']) for (const o of maakNieuw(`${f}-buiten`, {}, 6).oefeningen) {
    const soorten = o.data.woorden.map(w => w.soort), a = o.data.soort;
    assert.equal(soorten.filter(s => s === a).length, 4); assert.equal(soorten.filter(s => s !== a).length, 1);
    assert.equal(o.antwoord, o.data.uitzondering.naar); assert.notEqual(o.data.uitzondering.soort, a);
  }
});

test('schrijf zelf een woord: voorbeeld en controle eindigen op de gevraagde uitgang, drie schrijflijnen', () => {
  for (const f of ['mv', 'vk']) for (const o of maakNieuw(`${f}-zelf`, {}, 8).oefeningen) {
    const eind = o.data.soort.replace(/^-/, '');
    assert.equal((o.tekst.match(/_{8,}/g) || []).length, 3);
    assert.ok(o.data.voorbeelden.length === 3 && o.data.voorbeelden.every(w => w.naar.endsWith(eind)), `${eind}: ${o.data.voorbeelden.map(w => w.naar)}`);
    assert.ok(o.data.open && o.volledig.startsWith('Bijvoorbeeld'));
  }
});

test('verleng en kies (eindletters): het juiste en het foute woord staan er, de antwoorden zijn het meervoud en het enkelvoud', () => {
  for (const o of maakNieuw('el-proef', {}, 8).oefeningen) {
    assert.equal(o.antwoord, `${o.data.van}; ${o.data.naar}`);
    const fout = o.data.opties.find(x => x !== o.data.naar);
    assert.ok(o.data.opties.includes(o.data.naar) && fout && o.data.opties.every(x => o.tekst.includes(`één ${x}`)));
    assert.equal(fout.slice(0, -1), o.data.naar.slice(0, -1));
  }
});

test('kies de regel en schrijf: het antwoord noemt de juiste regel en het woord; schrijf, kijk na en verbeter: twee lijnen en een controle', () => {
  for (const o of maakNieuw('mv-regelschrijf', {}, 8).oefeningen) assert.equal(o.antwoord, `${o.data.soorten.includes(o.data.soort) ? ({ en: '-en', s: '-s', "'s": "'s", 'ën': '-ën', eren: '-eren' })[o.data.soort] : '?'}; ${o.data.naar}`);
  for (const o of maakNieuw('vk-nakijken', {}, 6).oefeningen) { assert.ok(o.tekst.includes('Klopt het?') && o.tekst.includes('juist') && /_{8,}/.test(o.tekst)); assert.equal(o.antwoord, o.data.naar); }
  for (const o of maakNieuw('mv-zinwoord', {}, 6).oefeningen) { assert.ok(o.volledig.includes(o.data.naar) && o.data.open); }
  for (const o of maakNieuw('mv-uitleg', {}, 6).oefeningen) assert.ok(o.data.open && (o.tekst.match(/_{8,}/g) || []).length >= 2);
});

test('dictee met plaatje (meervoud en verkleinwoord): drie plaatjes of één, het woord en zijn vorm kloppen met de woordenlijsten', async () => {
  const { PLAATJE_VORMEN, PLAATJES } = await import('../js/subjects/taal/woorden/plaatjes.js');
  const { WOORDEN: mv } = await import('../js/subjects/taal/woorden/meervouden.js');
  const { WOORDEN: vk } = await import('../js/subjects/taal/woorden/verkleinwoorden.js');
  assert.deepEqual(PLAATJE_VORMEN.map(p => p.w).sort(), PLAATJES.map(p => p.w).sort(), 'elk plaatjeswoord heeft een meervoud en een verkleinwoord');
  for (const p of PLAATJE_VORMEN) {
    const a = mv.find(w => w.van === p.w), b = vk.find(w => w.van === p.w);
    if (a) assert.equal(a.naar, p.meervoud, p.w); if (b) assert.equal(b.naar, p.klein, p.w);
    assert.ok(p.meervoud.length > p.w.length && p.klein.endsWith(p.soortKlein), p.w);
  }
  for (const enkelvoud of ['ja', 'nee']) {
    for (const o of maakNieuw('mv-plaatje', { enkelvoud }, 8).oefeningen) {
      assert.equal((o.svg.markup.match(/<g transform="translate\(\d+ 0\)">/g) || []).length, 3);
      assert.equal(o.tekst.includes(`één ${o.data.woord}`), enkelvoud === 'ja'); assert.ok(o.svgBoven && /_{8,}/.test(o.tekst));
    }
  }
  for (const doel of ['1.3.GL2.25', '1.3.GL3.15']) for (const o of maakNieuw('vk-plaatje', {}, 5, 2, doel).oefeningen) {
    assert.equal(['etje', 'kje'].includes(o.data.soort), doel === '1.3.GL3.15', `${doel}: ${o.antwoord}`);
    assert.equal(o.antwoord, o.data.naar);
  }
});
