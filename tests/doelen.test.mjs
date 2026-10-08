import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { laadDoelen, filterDoelen, groepeer } from '../js/core/doelen.js';

const lees = (url) => readFile(new URL('../' + url, import.meta.url), 'utf8');
const fetchFn = async (url) => ({ json: async () => JSON.parse(await lees(url)) });
const vak = { doelenUrl: 'data/wiskunde/doelen-wiskunde-opstap.json', koppelingenUrl: 'data/wiskunde/generators-map.json' };

test('alle 1377 doelen worden geladen met unieke codes', async () => {
  const { doelen, aantalDoelen } = await laadDoelen(vak, fetchFn);
  assert.equal(doelen.length, aantalDoelen);
  assert.equal(new Set(doelen.map(d => d.code)).size, 1377);
});

test('koppelingen verwijzen enkel naar bestaande doelcodes', async () => {
  const { doelen } = await laadDoelen(vak, fetchFn);
  const codes = new Set(doelen.map(d => d.code));
  const map = JSON.parse(await lees(vak.koppelingenUrl));
  for (const c of Object.keys(map.koppelingen)) assert.ok(codes.has(c), `onbekende code ${c}`);
});

test('filters: leerjaar, route en generator', async () => {
  const { doelen } = await laadDoelen(vak, fetchFn);
  const l2 = filterDoelen(doelen, { leerjaren: ['L2'], routes: ['gemeenschappelijk'], alleenMetGenerator: false });
  assert.ok(l2.length > 0 && l2.every(d => d.leerjaar === 'L2' && d.route === 'gemeenschappelijk'));
  assert.equal(filterDoelen(doelen, { alleenMetGenerator: true }).length, 0);
  assert.ok(groepeer(l2).length > 0);
});
