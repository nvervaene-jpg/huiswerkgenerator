import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KLANKEN, GROEPEN } from '../js/subjects/taal/woorden/klanken.js';
import { WOORDEN, DOELEN, NIVEAU, woordenVoor } from '../js/subjects/taal/generators/klanken.js';

// Bestaande woorden die nooit als 'fout' mogen dienen (los getypte lijst).
const BESTAAND = ['wij', 'mij', 'wei', 'mei', 'rei', 'lid', 'tog', 'eis', 'pijl', 'peil', 'deur', 'duur', 'geur', 'guur', 'bruin', 'brein', 'rouw', 'rauw', 'ijs', 'lag', 'lank', 'lang', 'bang', 'bank',
  'rang', 'rank', 'klang', 'zing', 'zink', 'wil', 'zin', 'tin', 'vis', 'gaus', 'lik', 'kus', 'nu', 'ei', 'ui'];

test('klanken: elk juist woord bevat de letters van zijn soort, de fout niet', () => {
  const gezien = new Set();
  for (const w of WOORDEN) {
    assert.ok(!gezien.has(w.naar), `dubbel woord ${w.naar}`); gezien.add(w.naar);
    assert.ok(w.naar.includes(w.soort), `${w.naar} bevat geen ${w.soort}`);
    assert.equal(w.data.gat.replace('__', w.soort), w.naar, `${w.naar}: gat`);
    assert.equal((w.data.gat.match(/__/g) || []).length, 1);
    assert.notEqual(w.fout, w.naar);
    assert.ok(!/^\w*\W/.test(w.fout) && w.fout.length >= 2);
    assert.ok(w.fout !== w.naar && !WOORDEN.some(x => x.naar === w.fout), `${w.naar}: de fout ${w.fout} is een ander juist woord uit de lijst`);
    assert.ok(!BESTAAND.includes(w.fout) || ['rink'].includes(w.fout), `${w.naar}: de fout ${w.fout} is een bestaand woord`);
    assert.ok(GROEPEN[w.groep].includes(w.soort));
    assert.ok(GROEPEN[w.groep].every(x => x === w.soort || /^[a-zé]+$/.test(x)));
  }
  assert.ok(WOORDEN.length >= 280);
});

test('klanken: elke soort heeft genoeg woorden en elke groep minstens twee soorten (behalve uw)', () => {
  for (const [soort, rijen] of Object.entries(KLANKEN)) assert.ok(rijen.length >= 4, soort);
  for (const [groep, soorten] of Object.entries(GROEPEN)) {
    assert.ok(soorten.some(s => KLANKEN[s]), `${groep}: geen enkele soort heeft woorden`);
    assert.ok(soorten.length >= 2 || groep === 'groepen3', groep);
    assert.ok(soorten.filter(s => !KLANKEN[s]).every(s => !Object.keys(KLANKEN).includes(s)));   // opties zonder eigen woorden (bv. ink) zijn enkel hulp bij het kiezen
  }
  for (const soort of Object.keys(KLANKEN)) assert.equal(Object.values(GROEPEN).filter(g => g.includes(soort)).length, 1, `${soort}: moet in precies één groep staan`);
});

test('klanken: elk doel heeft woorden en de juiste soorten', () => {
  assert.equal(DOELEN.length, 37);
  const soorten = (c) => [...new Set(woordenVoor({ doelen: [c] }).map(w => w.soort))].sort();
  assert.deepEqual(soorten('1.3.GL2.12'), ['ei', 'ij']);
  assert.deepEqual(soorten('1.3.GL2.13'), ['au', 'ou']);
  assert.deepEqual(soorten('1.3.GL2.11'), ['ie', 'oe', 'eu', 'ui'].sort());
  assert.deepEqual(soorten('1.3.GL2.14'), ['aai', 'oei', 'ooi']);
  assert.deepEqual(soorten('1.3.GL3.11'), ['uw']);
  assert.deepEqual(soorten('1.3.GL2.16'), ['ng', 'nk']);
  assert.deepEqual(soorten('1.3.GL4.6'), ['au', 'ei', 'eu', 'ij', 'oe', 'ou', 'ui']);
  for (const c of DOELEN) assert.ok(woordenVoor({ doelen: [c] }).length >= 4, c);
  assert.ok(woordenVoor({ doelen: ['1.3.GL2.12'] }).every(w => w.frequent));
  assert.ok(woordenVoor({ doelen: ['1.3.GL4.8'] }).length > woordenVoor({ doelen: ['1.3.GL2.16'] }).length);
  assert.deepEqual(soorten('1.3.GL3.12'), ['vr', 'wr']);
  assert.deepEqual(soorten('1.3.GL1.16'), ['a', 'o', 'u']);
  assert.deepEqual(soorten('1.3.GL1.17'), ['ee']);
  assert.deepEqual(soorten('1.3.GL2.19'), ['sch', 'schr']);
  assert.deepEqual(soorten('1.3.GL2.20'), ['be', 'ge', 'ver']);
  assert.deepEqual(soorten('1.3.GL6.10'), ['air', 'iaal', 'ieel', 'isch', 'ueel']);
  assert.deepEqual(soorten('1.3.GL5.7'), ['eum', 'ium']);
  assert.ok(woordenVoor({ doelen: ['1.3.GL5.10'] }).every(w => w.klank === 'k') && woordenVoor({ doelen: ['1.3.GL5.11'] }).every(w => w.klank === 'ks'));
  assert.deepEqual(soorten('1.3.GL5.26'), ['é']);
  assert.deepEqual(soorten('1.3.GL5.27'), ['eau']);
  assert.deepEqual(soorten('1.3.GL5.23'), ['heid', 'teit']);
  assert.ok(woordenVoor({ doelen: ['1.3.GL5.8'] }).every(w => w.klank === 's') && woordenVoor({ doelen: ['1.3.GL5.9'] }).every(w => w.klank === 'k'));
  assert.ok(Object.keys(NIVEAU).every(c => c.startsWith('1.3.')));
});
