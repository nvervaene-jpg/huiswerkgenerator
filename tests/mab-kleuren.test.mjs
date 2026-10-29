// Afspraak MAB-materiaal: eenheden geel, tientallen groen, honderdvelden blauw, duizendvelden rood.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mab, mabTekenen, mabVerbinden, MAB } from '../js/subjects/wiskunde/svg.js';

const tel = (markup, soort) => (markup.match(new RegExp(`fill="${MAB[soort].vul}"`, 'g')) || []).length;
const kleurNaam = (hex) => ({ '#f7d84a': 'geel', '#8fd19e': 'groen', '#bfe0f5': 'blauw', '#f2a1a1': 'rood' })[hex];

test('de kleuren volgen de afspraak', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(MAB).map(([k, v]) => [k, kleurNaam(v.vul)])), { e: 'geel', t: 'groen', h: 'blauw', d: 'rood' });
});

test('mab(): elk soort materiaal heeft zijn eigen kleur en aantal, ook duizendvelden', () => {
  const m = mab({ d: 2, h: 3, t: 4, e: 5 }).markup;
  assert.deepEqual(['d', 'h', 't', 'e'].map(k => tel(m, k)), [2, 3, 4, 5]);
  assert.ok(!/f6d27a|f4a3a3/.test(m), 'geen oude kleuren meer');
});

test('mabTekenen() en mabVerbinden() gebruiken dezelfde kleuren', () => {
  const o = mabTekenen(347).oplossing.markup;
  assert.deepEqual(['h', 't', 'e'].map(k => tel(o, k)), [3, 4, 7]);
  const v = mabVerbinden([{ h: 1, t: 2, e: 3 }], ['123'], [[0, 0]]).markup;
  assert.deepEqual(['h', 't', 'e'].map(k => tel(v, k)), [1, 2, 3]);
});
