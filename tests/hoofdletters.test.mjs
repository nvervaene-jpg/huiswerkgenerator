import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOORTEN, ZINNEN, LABELS } from '../js/subjects/taal/woorden/hoofdletters.js';
import { WOORDEN, ZINNEN_OPGAVEN, DOELEN, woordenVoor } from '../js/subjects/taal/generators/hoofdletters.js';

const DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const KLEIN = new Set(['bij', 'van', 'de', 'het', 'en', 'in']);
const hoofd = (t) => t[0].toUpperCase() + t.slice(1);

test('hoofdletters: elke soort heeft woorden, een naam en een label', () => {
  for (const soort of Object.keys(SOORTEN)) { assert.ok(SOORTEN[soort].length >= 3, soort); assert.ok(LABELS[soort], soort); }
  assert.deepEqual(Object.keys(SOORTEN).sort(), Object.keys(LABELS).sort());
  for (const soort of Object.keys(SOORTEN).filter(s => s !== 'geen')) assert.ok(SOORTEN[soort].length >= 10 || soort === 'merk', soort);
});

test('hoofdletters: dagen en maanden staan als gewoon woord (zonder hoofdletter)', () => {
  const geen = WOORDEN.filter(w => w.soort === 'geen');
  for (const d of [...DAGEN, ...MAANDEN]) {
    const w = geen.find(x => x.naar === d);
    assert.ok(w, `${d} ontbreekt bij 'geen'`);
    assert.equal(w.kind, DAGEN.includes(d) ? 'dag' : 'maand');
  }
  assert.equal(geen.filter(w => w.kind === 'dag').length, 7); assert.equal(geen.filter(w => w.kind === 'maand').length, 12);
  assert.ok(!WOORDEN.some(w => w.soort !== 'geen' && [...DAGEN, ...MAANDEN].includes(w.naar.toLowerCase())), 'een dag of maand als eigennaam');
});

test('hoofdletters: de juiste schrijfwijze volgt de regel van zijn soort', () => {
  const gezien = new Set();
  for (const w of WOORDEN) {
    assert.ok(!gezien.has(w.van), `dubbel: ${w.van}`); gezien.add(w.van);
    assert.equal(w.naar.toLowerCase(), w.van);
    assert.notEqual(w.fout, w.naar, `${w.naar}: fout = juist`);
    assert.equal(w.fout.toLowerCase(), w.van, `${w.naar}: de fout verandert de letters`);
    if (w.soort === 'geen') { assert.equal(w.naar, w.van); assert.equal(w.fout, hoofd(w.van)); continue; }
    assert.ok(/^[A-Z]/.test(w.naar), `${w.naar}: moet met een hoofdletter beginnen`);
    const woorden = w.naar.split(' ');
    if (w.soort === 'gebeurtenis') for (const x of woorden) assert.ok(KLEIN.has(x) ? x === x.toLowerCase() : /^[A-Z]/.test(x), `${w.naar}: ${x}`);
    else if (w.soort === 'titel') assert.ok(woorden.slice(1).every(x => KLEIN.has(x) || /^[a-z]/.test(x) || /^[A-Z][a-z]+$/.test(x)));
    else for (const x of woorden) for (const deel of x.split('-')) assert.ok(/^[A-Z]/.test(deel), `${w.naar}: ${deel}`);
    if (['naam', 'plaats', 'feestdag', 'taal', 'inwoner', 'bedrijf', 'merk'].includes(w.soort)) assert.ok(!w.naar.includes(' '), `${w.naar}: één woord`);
  }
  assert.ok(WOORDEN.length >= 150);
  assert.ok(WOORDEN.filter(w => w.frequent && w.soort !== 'geen').length >= 25);
});

test('hoofdletters: elke zin begint met een hoofdletter en bevat het woord in de juiste schrijfwijze', () => {
  assert.equal(ZINNEN_OPGAVEN.length, WOORDEN.length);
  const gezien = new Set();
  for (const z of ZINNEN_OPGAVEN) {
    assert.ok(!gezien.has(z.van), `dubbele zin ${z.van}`); gezien.add(z.van);
    assert.match(z.naar, /^[A-Z].*\.$/, z.naar);
    assert.equal(z.naar.toLowerCase(), z.van);
    assert.ok(z.naar.includes(z.focus), `${z.naar}: mist ${z.focus}`);
    assert.notEqual(z.fout, z.naar); assert.equal(z.fout.toLowerCase(), z.van);
    assert.ok(!/\{w\}|undefined/.test(z.naar + z.fout));
    if (z.soort === 'geen') assert.ok(z.focus === z.focus.toLowerCase() && !/[A-Z]/.test(z.naar.slice(1)), z.naar);
  }
  for (const sjablonen of Object.values(ZINNEN)) for (const t of sjablonen) { assert.ok(t.includes('{w}') && /^[A-Z]/.test(t) && t.endsWith('.'), t); }
});

test('hoofdletters: elk doel heeft genoeg woorden en de juiste soorten', () => {
  const soorten = (code) => [...new Set(woordenVoor({ doelen: [code] }).map(w => w.soort))].sort();
  assert.deepEqual(soorten('1.3.GL2.10'), ['geen', 'naam', 'plaats']);
  assert.deepEqual(soorten('1.3.GL3.7'), ['feestdag', 'geen', 'plaats']);
  assert.deepEqual(soorten('1.3.GL4.5'), ['geen', 'taal', 'titel']);
  assert.deepEqual(soorten('1.3.GL5.6'), ['gebeurtenis', 'geen', 'inwoner']);
  assert.deepEqual(soorten('1.3.GL6.6'), ['bedrijf', 'gebouw', 'geen', 'merk']);
  for (const c of DOELEN) assert.ok(woordenVoor({ doelen: [c] }).length >= 25, c);
  assert.ok(woordenVoor({ doelen: ['1.3.GL2.10'] }).every(w => w.frequent && !['dag', 'maand'].includes(w.kind)));
  assert.ok(woordenVoor({ doelen: ['1.3.GL3.7'] }).some(w => w.kind === 'dag') && woordenVoor({ doelen: ['1.3.GL3.7'] }).some(w => w.kind === 'maand'));
});
