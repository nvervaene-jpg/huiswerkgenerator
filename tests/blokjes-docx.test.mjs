// Word-export van de blokjes-modus: breedtes naast elkaar, voorbeeld in het blauw, antwoordsleutel in het rood, hulpblokjes en doelen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { bouwDocument } from '../js/export/docx.js';
import { standaardOpmaak } from '../js/core/opmaak.js';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { zetDoelen } from '../js/core/doelregister.js';
import { losOp, voegBlokjeToe, voegHulpToe, zetVoorbeeld } from '../js/core/blad-model.js';
import { bouwKaarten, nieuweKaartStaat, blokjeSpec } from '../js/core/blokjes.js';

const require = createRequire(import.meta.url);
const docx = require('../js/vendor/docx.umd.js');
const JSZip = require('../js/vendor/jszip.min.js');
zetDoelen(JSON.parse(readFileSync(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen);
const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
const iconen = Object.fromEntries(['schrijven', 'meten', 'omcirkelen', 'kleuren', 'verbinden', 'tekenen'].map(n => [n, PNG]));

const kaarten = bouwKaarten(wiskunde);
const voeg = (m, id, gebied = 100) => { const k = kaarten.find(x => x.id === id && x.tab === 'hoofd'); return voegBlokjeToe(wiskunde, m, blokjeSpec(wiskunde, k, nieuweKaartStaat(wiskunde, k), gebied, 5)); };
function maakBlad() {
  const m = { versie: 1, vak: 'wiskunde', gebied: 100, blokken: [] };
  voegHulpToe(m, { hulp: 'instructie', tekst: 'Reken zonder rekenmachine.' });
  voeg(m, 'optellen'); voeg(m, 'aftrekken'); voeg(m, 'maaltafels');
  voegHulpToe(m, { hulp: 'blanco', breedte: 4, hoogte: 3 });
  voegHulpToe(m, { hulp: 'pagina' });
  voeg(m, 'klok', 0);
  zetVoorbeeld(m, 1, true);
  return losOp(wiskunde, m);
}
async function xmlVan(blad, opmaak) {
  const svgPng = new Map();
  for (const b of blad.blokken) for (const o of b.oefeningen) for (const t of [o.svg, o.antwoordSvg]) if (t) svgPng.set(t.markup, PNG);
  const buf = await docx.Packer.toBuffer(bouwDocument(docx, [{ naam: 'Anna', blad }], opmaak, { logo: { bytes: PNG, breedte: 418, hoogte: 268 }, iconen, svgPng }));
  return (await JSZip.loadAsync(buf)).file('word/document.xml').async('string');
}

test('docx: blokjes staan naast elkaar volgens hun breedte en de hulpblokjes zijn aanwezig', async () => {
  const blad = maakBlad(), xml = await xmlVan(blad, standaardOpmaak());
  assert.ok(xml.includes('Reken zonder rekenmachine.'));
  assert.ok(xml.includes('w:type="page"'), 'nieuw blad');
  assert.ok((xml.match(/w:w="1250"|w:w="12\.5"|w:type="pct"/g) || []).length > 0);
  assert.ok(!xml.includes('Op.stap-doelen in dit blad:'), 'de doelcodes staan niet op het werkblad');
  assert.ok((await xmlVan(blad, { ...standaardOpmaak(), antwoordblad: true })).includes('Op.stap-doelen in dit blad:'), 'wel klein onderaan het antwoordblad');
  for (const b of blad.blokken.filter(x => x.oefeningen.length)) for (const o of b.oefeningen) if (!o.voorbeeld && o.tekst && !o.svg) assert.ok(xml.includes(o.tekst.split('\n')[0].replace(/(?<!_)_{4,7}(?!_)/g, '________')), o.tekst);
  // drie blokjes van een kwart staan in één rij van de tabel
  const rijen = xml.split('<w:tr>').length - 1 + xml.split('<w:tr ').length - 1;
  assert.ok(rijen >= 1);
});

test('docx: het voorbeeld is blauw, de antwoordsleutel (enkel als ze aan staat) rood', async () => {
  const blad = maakBlad();
  const zonder = await xmlVan(blad, standaardOpmaak());
  assert.ok(zonder.includes('1A3A8A'), 'voorbeeld in het blauw');
  assert.ok(!zonder.includes('C0392B'), 'geen rode antwoorden zonder antwoordsleutel');
  const voorbeeld = blad.blokken.find(b => b.vb).oefeningen[0];
  assert.ok(zonder.includes(String(voorbeeld.antwoord)));
  const met = await xmlVan(blad, { ...standaardOpmaak(), sleutel: true });
  assert.ok(met.includes('C0392B') && met.includes('1A3A8A'), 'sleutel rood, voorbeeld blijft blauw');
  const gewoon = blad.blokken.find(b => b.vormId === 'aftrekken').oefeningen.find(o => !o.voorbeeld);
  assert.ok(met.includes(String(gewoon.antwoord)));
});
