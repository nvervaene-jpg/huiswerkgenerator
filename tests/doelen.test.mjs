import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { laadDoelen, filterDoelen, groepeer, zoekTermen, komtOvereen, markeer, vouw } from '../js/core/doelen.js';

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
  const metGen = filterDoelen(doelen, { alleenMetGenerator: true });
  assert.ok(metGen.length > 50);
  assert.ok(metGen.every(d => d.generators.length > 0));
  assert.ok(metGen.find(d => d.code === '2.3.GL2.16').generators.includes('lengtematen-omzetten'));
  assert.ok(groepeer(l2).length > 0);
});

test('zoeken: hoofdletters en accenten tellen niet mee, alle woorden moeten voorkomen', async () => {
  const { doelen } = await laadDoelen(vak, fetchFn);
  const zoek = (z, extra = {}) => filterDoelen(doelen, { routes: ['gemeenschappelijk', 'verdiepend', 'fase1'], alleenMetGenerator: false, zoek: z, ...extra });
  assert.deepEqual(zoekTermen('  Klok  ANALOGE '), ['klok', 'analoge']);
  assert.equal(vouw('Chloë'), 'chloe');
  const klok = zoek('klok');
  assert.ok(klok.length > 5 && klok.every(d => komtOvereen(d, ['klok'])));
  assert.deepEqual(zoek('KLOK').map(d => d.code), klok.map(d => d.code));
  const klokUur = zoek('klok analoge');
  assert.ok(klokUur.length > 0 && klokUur.length < klok.length);
  const klokCodes = new Set(klok.map(d => d.code));
  for (const d of klokUur) assert.ok(klokCodes.has(d.code) && /analoge/i.test([d.code, d.tekst, d.domein, d.subdomein, d.rubriek, d.leerjaarLabel].join(' ')));
  assert.equal(zoek('qqqxyz').length, 0);
  assert.equal(zoek('').length, doelen.length);
});

test('zoeken: op code, domein en leerjaar, over alle leerjaren heen', async () => {
  const { doelen } = await laadDoelen(vak, fetchFn);
  const o = { routes: ['gemeenschappelijk', 'verdiepend', 'fase1'], alleenMetGenerator: false };
  assert.deepEqual(filterDoelen(doelen, { ...o, zoek: '2.3.GL2.16' }).map(d => d.code), ['2.3.GL2.16']);
  const reeks = filterDoelen(doelen, { ...o, zoek: '2.3.GL2' });
  assert.ok(reeks.length > 10 && reeks.every(d => d.code.startsWith('2.3.GL2')));
  const lj = filterDoelen(doelen, { ...o, zoek: '3de leerjaar' });
  assert.ok(lj.length > 50 && lj.every(d => d.leerjaar === 'L3' || /3de leerjaar/i.test(d.tekst)));
  // het leerjaar-venster telt niet mee tijdens het zoeken, de andere filters wel
  const venster = filterDoelen(doelen, { ...o, leerjaren: ['L1'], zoek: 'klok' });
  assert.ok(venster.some(d => d.leerjaar !== 'L1'));
  assert.ok(filterDoelen(doelen, { ...o, leerjaren: ['L1'], domein: 'Getallenkennis', zoek: 'klok' }).every(d => d.domein === 'Getallenkennis'));
  const metGen = filterDoelen(doelen, { routes: o.routes, zoek: 'lengte' });
  assert.ok(metGen.length > 0 && metGen.every(d => d.generators.length > 0));
});

test('markeren: de gevonden delen van een tekst krijgen mark, ook met accenten', () => {
  assert.deepEqual(markeer('De klok en de Klokken', ['klok']), [
    { tekst: 'De ', mark: false }, { tekst: 'klok', mark: true }, { tekst: ' en de ', mark: false }, { tekst: 'Klok', mark: true }, { tekst: 'ken', mark: false }]);
  assert.deepEqual(markeer('Chloë', ['loe']), [{ tekst: 'Ch', mark: false }, { tekst: 'loë', mark: true }]);
  assert.equal(markeer('abc', []).map(d => d.tekst).join(''), 'abc');
  assert.equal(markeer('abab', ['ab', 'ba']).length, 1);
});
