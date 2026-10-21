// Tekenopdrachten op ruitjespapier (spiegelen, verschuiven, draaien, vergroten) en symmetrieassen tekenen: het antwoordblad wordt opnieuw nagerekend.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { AUTO_DOELEN } from '../js/subjects/wiskunde/auto-doelen.js';
import { zetDoelen } from '../js/core/doelregister.js';

zetDoelen(JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen);
const gen = (id) => wiskunde.generators.find(g => g.id === id);
const cellen = (markup, id) => [...markup.matchAll(new RegExp(`<rect data-fig="${id}" data-x="(-?\\d+)" data-y="(-?\\d+)"`, 'g'))].map(m => [Number(m[1]), Number(m[2])]);
const set = (c) => c.map(v => v.join(',')).sort().join(';');
const norm = (c) => { const mx = Math.min(...c.map(v => v[0])), my = Math.min(...c.map(v => v[1])); return set(c.map(([x, y]) => [x - mx, y - my])); };
const lijst = (id, code, seed) => gen(id).genereer({ seed, aantal: 8, gebied: 100, opties: { doel: code } }).oefeningen;
const alle = (fam, id) => AUTO_DOELEN[fam].flatMap(code => [1, 2, 3].map(seed => ({ code, seed, oefeningen: lijst(id, code, seed) })));

for (const [fam, id] of [['tsp', 'tsp-tekenen'], ['tvs', 'tvs-tekenen'], ['tdr', 'tdr-tekenen'], ['tvg', 'tvg-tekenen'], ['tas', 'tas-tekenen']]) {
  test(`${id}: de leerlingenversie toont enkel de opdracht, het antwoordblad het juiste beeld`, () => {
    assert.ok(AUTO_DOELEN[fam].length > 0);
    for (const { code, seed, oefeningen } of alle(fam, id)) {
      assert.ok(oefeningen.length >= 3, `${id} ${code} seed ${seed}: ${oefeningen.length}`);
      assert.equal(new Set(oefeningen.map(o => o.sleutel)).size, oefeningen.length);
      for (const o of oefeningen) {
        assert.ok(o.svg && o.antwoordSvg && o.tekst, 'opdracht, leerlingenversie en antwoord');
        assert.equal(cellen(o.svg.markup, 'B').length, 0, 'het beeld staat niet in de opdracht');
        assert.ok(!o.svg.markup.includes('data-as="as"'), 'geen symmetrieassen in de opdracht');
      }
    }
  });
}

test('tsp-tekenen: het getekende beeld is het spiegelbeeld om de rode lijn', () => {
  for (const { oefeningen } of alle('tsp', 'tsp-tekenen')) for (const o of oefeningen) {
    const A = cellen(o.svg.markup, 'A'), B = cellen(o.antwoordSvg.markup, 'B'), m = /data-as="([vh]):(\d+)"/.exec(o.svg.markup);
    assert.ok(m && set(A) === set(cellen(o.antwoordSvg.markup, 'A')));
    const [, soort, pos] = m, a = Number(pos);
    assert.equal(set(B), set(A.map(([x, y]) => (soort === 'v' ? [2 * a - x - 1, y] : [x, 2 * a - y - 1]))));
    assert.ok(A.every(([x, y]) => (soort === 'v' ? x < a : y < a)), 'de figuur ligt aan één kant van de lijn');
  }
});
test('tvs-tekenen: het beeld is verschoven zoals de opdracht zegt', () => {
  for (const { oefeningen } of alle('tvs', 'tvs-tekenen')) for (const o of oefeningen) {
    const m = /Verschuif figuur A (\d+) vakjes naar rechts(?: en (\d+) vakjes? (omhoog|omlaag))?\./.exec(o.tekst);
    assert.ok(m, o.tekst);
    const dx = Number(m[1]), dy = m[2] ? (m[3] === 'omhoog' ? -1 : 1) * Number(m[2]) : 0, A = cellen(o.svg.markup, 'A');
    assert.equal(set(cellen(o.antwoordSvg.markup, 'B')), set(A.map(([x, y]) => [x + dx, y + dy])));
  }
});
test('tdr-tekenen: het beeld is gedraaid om het rode punt', () => {
  for (const { oefeningen } of alle('tdr', 'tdr-tekenen')) for (const o of oefeningen) {
    const kw = /kwartdraai met de klok/.test(o.tekst) ? 1 : /halve draai/.test(o.tekst) ? 2 : /tegen de klok/.test(o.tekst) ? 3 : 0;
    assert.ok(kw > 0, o.tekst);
    const p = /data-punt="(\d+),(\d+)"/.exec(o.svg.markup), cx = Number(p[1]), cy = Number(p[2]);
    const draai = ([x, y]) => { let dx = x + 0.5 - cx, dy = y + 0.5 - cy; for (let i = 0; i < kw; i++) [dx, dy] = [-dy, dx]; return [cx + dx - 0.5, cy + dy - 0.5]; };
    const A = cellen(o.svg.markup, 'A');
    assert.equal(set(cellen(o.antwoordSvg.markup, 'B')), set(A.map(draai)));
  }
});
test('tvg-tekenen: het beeld is f keer zo breed en hoog', () => {
  for (const { oefeningen } of alle('tvg', 'tvg-tekenen')) for (const o of oefeningen) {
    const f = Number(/factor (\d+)/.exec(o.tekst)[1]), A = cellen(o.svg.markup, 'A'), B = cellen(o.antwoordSvg.markup, 'B');
    const bb = (c) => [Math.max(...c.map(v => v[0])) - Math.min(...c.map(v => v[0])) + 1, Math.max(...c.map(v => v[1])) - Math.min(...c.map(v => v[1])) + 1];
    assert.deepEqual(bb(B), bb(A).map(x => x * f)); assert.equal(B.length, A.length * f * f);
    const verwacht = []; const mx = Math.min(...A.map(v => v[0])), my = Math.min(...A.map(v => v[1]));
    A.forEach(([x, y]) => { for (let i = 0; i < f; i++) for (let j = 0; j < f; j++) verwacht.push([(x - mx) * f + i, (y - my) * f + j]); });
    assert.equal(norm(B), norm(verwacht));
  }
});
test('tas-tekenen: het antwoordblad toont alle symmetrieassen en enkel die', () => {
  const punten = (m) => /<polygon points="([^"]+)"/.exec(m)[1].split(' ').map(q => q.split(',').map(Number));
  const spiegelt = (P, l) => { const [x1, y1, x2, y2] = l, dx = x2 - x1, dy = y2 - y1, k = dx * dx + dy * dy; return P.every(([x, y]) => { const t = ((x - x1) * dx + (y - y1) * dy) / k, m = [2 * (x1 + t * dx) - x, 2 * (y1 + t * dy) - y]; return P.some(v => Math.hypot(v[0] - m[0], v[1] - m[1]) < 1.3); }); };
  for (const { oefeningen } of alle('tas', 'tas-tekenen')) for (const o of oefeningen) {
    const P = punten(o.svg.markup), lijnen = [...o.antwoordSvg.markup.matchAll(/data-as="as" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map(m => m.slice(1).map(Number));
    assert.equal(lijnen.length, o.data.assen, `${o.data.naam}: aantal assen`);
    assert.ok(lijnen.every(l => spiegelt(P, l)), 'elke getekende as is een symmetrieas');
    const hoeken = lijnen.map(l => ((Math.atan2(l[3] - l[1], l[2] - l[0]) * 180) / Math.PI + 180) % 180);
    assert.ok(hoeken.every((h, i) => hoeken.every((g, j) => i === j || Math.min(Math.abs(h - g), 180 - Math.abs(h - g)) > 5)), 'geen dubbele assen');
    // geen andere symmetrieas: probeer elke halve graad
    let extra = 0; const mid = [P.reduce((x, q) => x + q[0], 0) / P.length, P.reduce((x, q) => x + q[1], 0) / P.length];
    for (let g = 0; g < 180; g += 1) { const a = (g * Math.PI) / 180, l = [mid[0] - 50 * Math.cos(a), mid[1] - 50 * Math.sin(a), mid[0] + 50 * Math.cos(a), mid[1] + 50 * Math.sin(a)]; if (spiegelt(P, l) && !hoeken.some(h => Math.min(Math.abs(h - g), 180 - Math.abs(h - g)) < 2.5)) extra++; }
    assert.equal(extra, 0, `${o.data.naam}: geen vergeten asen`);
  }
});

test('de tekenopdrachten tonen bij een voorbeeldblokje de opdracht met het beeld en bij de antwoordsleutel de opdracht zelf', async () => {
  const { voorbeeldDelen, losOp, voegBlokjeToe, zetVoorbeeld } = await import('../js/core/blad-model.js');
  const m = { versie: 1, vak: 'wiskunde', gebied: 100, blokken: [] };
  voegBlokjeToe(wiskunde, m, { vormId: 'tvs-tekenen', gebied: 100, opties: {}, aantal: 3, seed: 4 });
  zetVoorbeeld(m, 0, true);
  const [eerste, tweede] = losOp(wiskunde, m).blokken[0].oefeningen;
  assert.ok(eerste.voorbeeld && eerste.voorbeeldDelen === undefined && eerste.tekst.startsWith('Verschuif'));
  assert.equal(eerste.svg.markup.includes('data-fig="B"'), true);
  assert.equal(tweede.svg.markup.includes('data-fig="B"'), false);
  assert.equal(voorbeeldDelen({ tekst: 'Reken: 3 + ____', antwoord: '4' }).length, 2);
});
