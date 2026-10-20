import { test } from 'node:test';
import assert from 'node:assert/strict';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { planModel, losOp, modelUitCode, modelVoorVormen } from '../js/core/blad-model.js';
import { BREUK_VORMEN, NOEMERS_PER_DOEL, afleiders } from '../js/subjects/wiskunde/generators/breuken.js';

const SEEDS = Array.from({ length: 8 }, (_, i) => i + 1);

test('breuken: de noemers volgen het leerjaar van het doel', () => {
  const v = BREUK_VORMEN[0];
  assert.deepEqual(v.opties(v.doelen, {}, '2.1.GL2.25').noemers, [2, 4]);
  assert.ok(Math.max(...v.opties(v.doelen, {}, '2.1.GL3.25').noemers) <= 8 && Math.max(...v.opties(v.doelen, {}, '2.1.GL4.33').noemers) === 12);
  for (const [doel, noemers] of Object.entries(NOEMERS_PER_DOEL)) assert.ok(noemers.every(n => n >= 2 && n <= 12), doel);
  for (const v2 of BREUK_VORMEN) assert.ok(v2.doelen.length >= 5 && v2.doelen.every(d => d.startsWith('2.1.GL')));
});

test('breuken: afleiders zijn echte breuken en nooit gelijkwaardig aan het antwoord', () => {
  for (let n = 2; n <= 12; n++) for (let t = 1; t < n; t++) for (const [a, b] of afleiders({ t, n })) { assert.ok(a >= 1 && a < b); assert.notEqual(a * n, t * b); }
});

test('breuken: het stappenplan toont het voorbeeld ingevuld op de eerste plaats van het blok, en enkel als dat gekozen is', () => {
  for (const voorbeeld of ['ja', 'nee']) for (const seed of SEEDS) {
    const model = planModel(wiskunde, { doelen: ['2.1.GL3.25'], keuzes: { breuken: { voorbeeld, figuur: 'cirkel' } }, seed, gebied: 100, aantal: 6, blokken: 3 });
    const blad = losOp(wiskunde, model);
    for (const b of blad.blokken.filter(x => x.vormId === 'breuk-stappenplan')) {
      assert.ok(b.oefeningen.length >= 3);
      b.oefeningen.forEach((o, i) => {
        const heeft = o.svg.markup.includes('voorbeeld:');
        assert.equal(heeft, voorbeeld === 'ja' && i === 0, `positie ${i}`);
        assert.equal(/font-weight="bold"/.test(o.svg.markup), heeft, 'enkel het voorbeeld is ingevuld');
        assert.ok(o.antwoordSvg.markup.includes('font-weight="bold"'));
      });
    }
    const { model: terug } = modelUitCode(wiskunde, blad.code);
    assert.deepEqual(losOp(wiskunde, terug).blokken, blad.blokken);
  }
});

test('breuken: alle vormen op één blad, de keuze van de tekening wordt gerespecteerd', () => {
  for (const figuur of ['cirkel', 'rechthoek', 'raster']) {
    const opties = Object.fromEntries(BREUK_VORMEN.map(v => [v.id, v.opties(v.doelen, { figuur }, '2.1.GL4.33')]));
    const blad = losOp(wiskunde, modelVoorVormen(wiskunde, BREUK_VORMEN.map(v => v.id), { seed: 5, aantal: 6, gebied: 1000, opties }));
    const merk = { cirkel: '<path data-deel', rechthoek: '<rect data-deel', raster: '<rect data-deel' };
    for (const b of blad.blokken) { assert.ok(b.oefeningen.length > 0); for (const o of b.oefeningen) assert.ok((o.svg || o.antwoordSvg).markup.includes(merk[figuur])); }
  }
});
