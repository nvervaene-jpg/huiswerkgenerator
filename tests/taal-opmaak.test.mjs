// Opmaak van Taal: oefeningen onder elkaar, altijd het gekozen aantal, een volgnummer met pictogram bij elke opdracht en instelbare schrijflijnen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { bouwDocument } from '../js/export/docx.js';
import { standaardOpmaak, LIJNEN } from '../js/core/opmaak.js';
import taal from '../js/subjects/taal/index.js';
import { zetDoelen } from '../js/core/doelregister.js';
import { losOp, modelVoorVormen, planModel, voegHulpToe } from '../js/core/blad-model.js';
import { ICONEN_NAMEN } from '../js/core/icons.js';

const require = createRequire(import.meta.url);
const docx = require('../js/vendor/docx.umd.js');
const JSZip = require('../js/vendor/jszip.min.js');
zetDoelen(JSON.parse(readFileSync(new URL('../data/taal/doelen-taal-opstap.json', import.meta.url), 'utf8')).doelen);
const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
const iconen = Object.fromEntries(ICONEN_NAMEN.map(n => [n, PNG]));

test('taal: elke oefenvorm toont precies het gekozen aantal oefeningen (10 gekozen = 10 op het blad)', () => {
  const mis = [];
  for (const g of taal.generators) {
    const blad = losOp(taal, modelVoorVormen(taal, [g.id], { seed: 3, aantal: 10, gebied: 0, opties: { [g.id]: g.opties(g.doelen, {}, g.doelen[0]) } }));
    if (blad.blokken[0].oefeningen.length !== 10) mis.push(`${g.id}: ${blad.blokken[0].oefeningen.length}`);
  }
  assert.deepEqual(mis, []);
});

test('taal: aantal 15 en 20 komen ook volledig op het blad; bij te weinig verschillende oefeningen komt er een waarschuwing', () => {
  for (const aantal of [15, 20]) for (const id of ['kb-klank', 'sb-kies', 'lz-lees']) {
    const g = taal.generators.find(x => x.id === id), blad = losOp(taal, modelVoorVormen(taal, [id], { seed: 5, aantal, gebied: 0, opties: { [id]: g.opties(g.doelen, {}, g.doelen[0]) } }));
    assert.equal(blad.blokken[0].oefeningen.length, aantal, id);
  }
  const g = taal.generators.find(x => x.id === 'kb-teken-gebruik'), blad = losOp(taal, modelVoorVormen(taal, [g.id], { seed: 1, aantal: 20, gebied: 0, opties: { [g.id]: g.opties(g.doelen, {}, '1.5.GL4.37') } }));
  assert.equal(blad.blokken[0].oefeningen.length, 20);
  assert.ok(blad.waarschuwingen.some(w => /dubbel/.test(w)), 'waarschuwing bij herhaling');
});

test('taal: alle blokken staan op de volle bladbreedte, ook hulpblokjes, en het blad weet dat de oefeningen onder elkaar staan', () => {
  const model = planModel(taal, { doelen: ['1.3.GL2.26', '1.5.GL3.5'], keuzes: {}, seed: 2, gebied: 0, aantal: 6, blokken: 3 });
  model.blokken.forEach(b => { b.breedte = 1; });
  voegHulpToe(model, { hulp: 'blanco', breedte: 2, hoogte: 3 });
  const blad = losOp(taal, model);
  assert.equal(blad.onderElkaar, true);
  assert.ok(blad.blokken.every(b => b.breedte === 4));
});

async function xmlVan(blad, opmaak) {
  const buf = await docx.Packer.toBuffer(bouwDocument(docx, [{ naam: 'Anna', blad }], opmaak, { logo: { bytes: PNG, breedte: 418, hoogte: 268 }, iconen, svgPng: new Map() }));
  return (await JSZip.loadAsync(buf)).file('word/document.xml').async('string');
}
const taalBlad = () => losOp(taal, planModel(taal, { doelen: ['1.5.GL2.28', '1.3.GL2.26', '1.5.GL3.5'], keuzes: {}, seed: 4, gebied: 0, aantal: 6, blokken: 2 }));

test('docx taal: elke opdracht krijgt eerst een volgnummer, dan een pictogram, dan de opdracht; de oefeningen staan niet in kolommen', async () => {
  const blad = taalBlad(), xml = await xmlVan(blad, standaardOpmaak());
  const opdrachten = blad.blokken.filter(b => b.oefeningen.length);
  let vanaf = 0;
  opdrachten.forEach((b, i) => {
    const nr = xml.indexOf(`>${i + 1}   <`, vanaf), tekst = xml.indexOf(b.opdracht.slice(0, 20), nr);
    assert.ok(nr >= 0 && tekst > nr, `opdracht ${i + 1} heeft een nummer vóór de opdracht`);
    assert.ok(/<w:drawing/.test(xml.slice(nr, tekst)), `opdracht ${i + 1}: pictogram tussen nummer en opdracht`);
    vanaf = tekst;
  });
  assert.equal((xml.match(/<w:tbl>/g) || []).length, 1 + opdrachten.length, 'de kop en elke opdracht zijn een tabel (het omkaderde vak): geen kolommen die over elkaar kunnen lopen');
});

test('docx taal: schrijflijnen krijgen de gekozen afstand (smal, normaal, ruim) en het doel staat enkel bovenaan als de leerkracht dat kiest', async () => {
  const blad = losOp(taal, planModel(taal, { doelen: ['1.3.GL2.29'], keuzes: {}, seed: 1, gebied: 0, aantal: 4, blokken: 1 }));
  assert.ok(['cs-verbeter', 'sw-fout'].includes(blad.blokken[0].vormId));
  assert.ok(blad.blokken[0].oefeningen.every(o => /_{8,}/.test(o.tekst)));
  const voor = (lijnen) => xmlVan(blad, { ...standaardOpmaak(), lijnen }).then(x => [...x.matchAll(/<w:spacing w:before="(\d+)" w:after="0"\/>/g)].map(m => Number(m[1])));
  const [smal, normaal, ruim] = await Promise.all(['smal', 'normaal', 'ruim'].map(voor));
  assert.ok(smal.length >= 4 && normaal.length >= 4 && ruim.length >= 4);
  assert.ok(smal[0] < normaal[0] && normaal[0] < ruim[0], `${smal[0]} < ${normaal[0]} < ${ruim[0]}`);
  assert.equal(Math.round(ruim[0] / 56.7), LIJNEN.ruim.mm);
  const zonder = await xmlVan(blad, standaardOpmaak()), met = await xmlVan(blad, { ...standaardOpmaak(), toonDoel: true });
  assert.ok(!/>Doel</.test(zonder) && !/Op\.stap-doelen/.test(zonder));
  assert.ok(/>Doel</.test(met) && !/Op\.stap-doelen/.test(met), 'de doelcodes staan niet op het werkblad');
});
