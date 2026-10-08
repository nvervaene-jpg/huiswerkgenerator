import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Leerlingen, leesNamen } from '../js/core/storage.js';

const nepOpslag = () => { const d = {}; return { getItem: k => d[k] ?? null, setItem: (k, v) => { d[k] = v; } }; };

test('namenlijst plakken: komma, nieuwe regel, dubbels en lege regels', () => {
  assert.deepEqual(leesNamen('Anna\nBram, Chloë;\n\n Anna '), ['Anna', 'Bram', 'Chloë']);
});

test('leerlingen blijven bewaard en bestaande namen worden niet dubbel toegevoegd', () => {
  const opslag = nepOpslag();
  const a = new Leerlingen(opslag);
  a.voegToe('Anna\nBram', 'L2');
  assert.equal(a.voegToe('anna\nChloë', 'L3').length, 1);
  assert.equal(new Leerlingen(opslag).lijst.length, 3);
});

test('export en import: profielen komen volledig terug', () => {
  const a = new Leerlingen(nepOpslag());
  a.voegToe('Anna', 'L2');
  a.wijzig(a.lijst[0].id, { aantal: 12, gebied: 1000, doelen: ['2.3.GL2.16'] });
  const b = new Leerlingen(nepOpslag());
  b.importeer(a.exporteer());
  assert.deepEqual(b.lijst, a.lijst);
  assert.throws(() => b.importeer('{"x":1}'));
});
