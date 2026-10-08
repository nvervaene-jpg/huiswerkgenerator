import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { bouwDocument } from '../js/export/docx.js';
import { standaardOpmaak } from '../js/core/opmaak.js';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { bouwBlad } from '../js/core/worksheet.js';

const require = createRequire(import.meta.url);
const docx = require('../js/vendor/docx.umd.js');
const JSZip = require('../js/vendor/jszip.min.js');

// 1x1 transparante png
const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
const afb = { logo: { bytes: PNG, breedte: 418, hoogte: 268 }, iconen: { schrijven: PNG } };
const maak = (seed, n = 6) => bouwBlad(wiskunde, ['lengtematen-omzetten'], { seed, aantal: n, gebied: 1000, opties: { 'lengtematen-omzetten': { eenheden: ['m', 'dm', 'cm'] } } });

async function xmlVan(bladen, opmaak) {
  const buf = await docx.Packer.toBuffer(bouwDocument(docx, bladen, opmaak, afb));
  const zip = await JSZip.loadAsync(buf);
  return { zip, xml: await zip.file('word/document.xml').async('string') };
}

test('docx: oefeningen, naam, boodschap en bladcode staan als bewerkbare tekst', async () => {
  const blad = maak(5);
  const { zip, xml } = await xmlVan([{ naam: 'Anna', blad }], { ...standaardOpmaak(), boodschap: 'Oefen samen.\nSucces!' });
  for (const o of blad.blokken[0].oefeningen) assert.ok(xml.includes(o.tekst), o.tekst);
  assert.ok(xml.includes('Anna') && xml.includes('Oefen samen.') && xml.includes('Succes!'));
  assert.ok(xml.includes(blad.blokken[0].opdracht));
  assert.ok(xml.includes('w:pgSz w:w="11906" w:h="16838"'), 'A4');
  assert.ok(xml.includes('Andika'));
  const media = Object.keys(zip.files).filter(f => f.startsWith('word/media/'));
  assert.ok(media.length >= 2, 'logo en pictogram');
  const voet = await Promise.all(Object.keys(zip.files).filter(f => /footer\d*\.xml$/.test(f)).map(f => zip.file(f).async('string')));
  assert.ok(voet.join('').includes(blad.code));
});

test('docx: één bestand met twee leerlingen en antwoordblad', async () => {
  const a = maak(1), b = maak(2);
  const { xml } = await xmlVan([{ naam: 'Anna', blad: a }, { naam: 'Bram', blad: b }], { ...standaardOpmaak(), antwoordblad: true });
  assert.equal((xml.match(/<w:sectPr/g) || []).length, 3);
  assert.ok(xml.includes('Antwoorden voor de leerkracht'));
  for (const o of a.blokken[0].oefeningen) assert.ok(xml.includes(o.volledig));
});

test('docx: zonder antwoordblad staan de antwoorden er niet in', async () => {
  const a = maak(9);
  const { xml } = await xmlVan([{ naam: 'Anna', blad: a }], standaardOpmaak());
  assert.ok(!xml.includes('Antwoorden voor de leerkracht'));
  assert.ok(!xml.includes(a.blokken[0].oefeningen[0].volledig));
});
