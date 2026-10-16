import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMENSTELLINGEN } from '../js/subjects/taal/woorden/samenstellingen.js';
import { WOORDEN, DOELEN, woordenVoor } from '../js/subjects/taal/generators/samenstellingen.js';

test('samenstellingen: elke regel plakt twee woorden aan elkaar, dubbele letters blijven staan', () => {
  const gezien = new Set();
  for (const [soort, rijen] of Object.entries(SAMENSTELLINGEN)) for (const [a, b] of rijen) {
    const naar = a + b;
    assert.ok(!gezien.has(naar), `dubbel: ${naar}`); gezien.add(naar);
    assert.equal(a.at(-1) === b[0], soort === 'dubbel', `${a}+${b}: staat bij ${soort}`);
    assert.ok(a.length >= 2 && b.length >= 2 && /^[a-z]+$/.test(naar), naar);
  }
  for (const w of WOORDEN) {
    assert.equal(w.naar, w.delen.join(''));
    assert.equal(w.van, `${w.delen[0]} + ${w.delen[1]}`);
    assert.notEqual(w.fout, w.naar);
    if (w.soort === 'dubbel') { assert.equal(w.fout.length, w.naar.length - 1); assert.ok(!w.fout.includes(' ')); } else assert.equal(w.fout, `${w.delen[0]} ${w.delen[1]}`);
  }
  assert.ok(WOORDEN.filter(w => w.soort === 'gewoon').length >= 25 && WOORDEN.filter(w => w.soort === 'dubbel').length >= 15);
});

test('samenstellingen: elk doel heeft genoeg woorden van de juiste soort', () => {
  const voor = (c) => woordenVoor({ doelen: [c] });
  assert.ok(voor('1.3.GL2.24').every(w => w.soort === 'gewoon' && w.frequent) && voor('1.3.GL2.24').length >= 12);
  assert.ok(voor('1.3.GL3.14').every(w => w.soort === 'dubbel') && voor('1.3.GL3.14').length >= 15);
  assert.equal(voor('1.3.GL4.35').length, WOORDEN.length);
  assert.equal(DOELEN.length, 3);
});
