import { test } from 'node:test';
import assert from 'node:assert/strict';
import lengte from '../js/subjects/wiskunde/generators/lengtematen-omzetten.js';
import { GENERATORS } from '../js/subjects/wiskunde/generators/index.js';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { bouwBlad, bladUitCode } from '../js/core/worksheet.js';

const FACTOR = { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 };
const GEBIEDEN = [10, 20, 100, 1000, 10000];
const OPTIES = [['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']];

for (const gen of GENERATORS) {
  test(`${gen.id}: antwoorden kloppen, getallen binnen gebied, geen dubbels`, () => {
    for (const gebied of GEBIEDEN) for (const eenheden of OPTIES) for (let seed = 1; seed <= 40; seed++) {
      const { oefeningen } = gen.genereer({ seed, aantal: 12, gebied, opties: { eenheden } });
      const gezien = new Set();
      for (const o of oefeningen) {
        const m = /^(\d+) (\w+) = ____ (\w+)$/.exec(o.tekst);
        assert.ok(m, `onverwachte tekst: ${o.tekst}`);
        const [, v, a, b] = m;
        assert.equal(`${(+v * FACTOR[a]) / FACTOR[b]} ${b}`, o.antwoord, o.tekst);
        assert.equal(o.volledig, o.tekst.replace('____', o.antwoord.split(' ')[0]));
        for (const g of o.getallen) assert.ok(g >= 1 && g <= gebied, `${o.tekst} buiten gebied ${gebied}`);
        assert.ok(!gezien.has(o.tekst), `dubbel: ${o.tekst}`);
        gezien.add(o.tekst);
        assert.ok(eenheden.includes(a) && eenheden.includes(b));
      }
    }
  });

  test(`${gen.id}: zelfde seed geeft zelfde oefeningen`, () => {
    const p = { seed: 7, aantal: 10, gebied: 1000, opties: { eenheden: ['m', 'dm', 'cm'] } };
    assert.deepEqual(gen.genereer(p), gen.genereer(p));
  });
}

test('lengtematen: oefeningen lopen op van makkelijk naar moeilijk', () => {
  const { oefeningen } = lengte.genereer({ seed: 3, aantal: 10, gebied: 1000, opties: { eenheden: ['m', 'dm', 'cm'] } });
  const score = (o) => { const [v, a, , b] = o.tekst.split(' '); const r = Math.max(FACTOR[a] / FACTOR[b], FACTOR[b] / FACTOR[a]); return Math.log10(r) + (FACTOR[a] < FACTOR[b] ? 0.5 : 0); };
  const s = oefeningen.map(score);
  assert.deepEqual(s, [...s].sort((x, y) => x - y));
});

test('lengtematen: waarschuwing als er te weinig mogelijkheden zijn', () => {
  const r = lengte.genereer({ seed: 1, aantal: 8, gebied: 10, opties: { eenheden: ['m', 'dm', 'cm'] } });
  assert.ok(r.oefeningen.length < 8 && r.waarschuwing);
});

test('bladcode: hetzelfde blad komt exact terug', () => {
  const blad = bouwBlad(wiskunde, ['lengtematen-omzetten'], { seed: 12345, aantal: 9, gebied: 100, opties: { 'lengtematen-omzetten': { eenheden: ['m', 'dm', 'cm'] } } });
  const terug = bladUitCode(wiskunde, blad.code);
  assert.deepEqual(terug.blokken, blad.blokken);
  assert.equal(terug.code, blad.code);
  assert.throws(() => bladUitCode(wiskunde, 'onzin'));
});
