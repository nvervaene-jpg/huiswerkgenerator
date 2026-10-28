// Het linkerpaneel moet scrollen en mag niets afknippen. Dit bewaakt de css-regels waar dat van afhangt
// (de echte controle gebeurt in een browser: zie TESTEN.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/app.css', import.meta.url), 'utf8');
const regel = (kiezer) => { const m = new RegExp(`(?:^|\\n)${kiezer.replace(/[.*+?^${}()|[\]\\>]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(css); return m ? m[1] : null; };

test('het paneel scrolt zelf en zijn kinderen krimpen niet (anders knipt het kader de kaarten af)', () => {
  assert.match(regel('.paneel'), /overflow-y:\s*auto/);
  assert.match(regel('.paneel > *'), /flex-shrink:\s*0/);
  assert.match(regel('.paneel'), /max-height:\s*100dvh/, 'het paneel is nooit hoger dan het scherm, dus het scrolt altijd');
  assert.match(regel('.paneel'), /min-height:\s*0/);
  assert.match(regel('.bladvlak'), /overflow:\s*auto/);
  assert.match(regel('.bladvlak'), /min-height:\s*0/);
});

test('geen ouder van de kaarten knipt de inhoud af, zodat de kop (tabbladen, zoekveld en domeinen) kan blijven plakken', () => {
  for (const kiezer of ['.kader', '.tabinhoud', '.kaarten', '.palet']) { const r = regel(kiezer); assert.ok(!r || !/overflow:\s*(hidden|auto|scroll)/.test(r), `${kiezer} knipt af`); }
  assert.match(regel('.tabs'), /position:\s*sticky/);
  assert.match(css, /\.palet-kop,\s*\.doelen-kop\s*\{[^}]*position:\s*sticky/);
});

test('op een iPad telt de zichtbare hoogte (100dvh) en niet de hoogte mét de adresbalk', () => {
  assert.match(regel('.app'), /height:\s*100dvh/);
  assert.match(regel('.blad-paneel'), /height:\s*100dvh/);
});
