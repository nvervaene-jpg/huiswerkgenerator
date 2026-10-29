// Geldtekeningen gebruiken foto's van echt geld (assets/geld/); enkel de munt van 5 cent heeft nog geen foto en blijft getekend.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { geld, geldVerbinden } from '../js/subjects/wiskunde/svg.js';
import { GELD_AFBEELDINGEN } from '../js/subjects/wiskunde/geld-afbeeldingen.js';

const STUKKEN = [1, 2, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
const gettekend = (markup) => [...markup.matchAll(/data-geld="(\d+)"/g)].map(m => Number(m[1]));

test('er is een foto voor elke munt en elk biljet, behalve de munt van 5 cent', () => {
  const heeft = (c) => !!(c >= 500 ? GELD_AFBEELDINGEN.biljet : GELD_AFBEELDINGEN.munt)[c];
  for (const c of STUKKEN) assert.ok(heeft(c), `foto voor ${c} eurocent`);
  assert.ok(!heeft(5), 'voor 5 cent is er nog geen foto');
  for (const f of Object.values(GELD_AFBEELDINGEN).flatMap(g => Object.values(g))) assert.ok(f.href.startsWith('data:image/') && f.b > 20 && f.h > 20);
});

test('de afbeeldingen in de module komen overeen met de bestanden in assets/geld', async () => {
  const bestanden = (await readdir(new URL('../assets/geld/', import.meta.url))).filter(n => /^(biljet|munt)-\d+\.(png|jpg)$/.test(n));
  const inModule = Object.entries(GELD_AFBEELDINGEN).flatMap(([soort, g]) => Object.keys(g).map(c => `${soort}-${c}`));
  assert.deepEqual(bestanden.map(n => n.replace(/\.(png|jpg)$/, '')).sort(), inModule.sort(), 'node scripts/bouw-geld.mjs opnieuw uitvoeren');
});

test('geld(): elk stuk is één keer getekend, met een foto (of de getekende munt van 5 cent)', () => {
  const items = [20000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  const t = geld(items);
  assert.deepEqual(gettekend(t.markup).sort((x, y) => x - y), [...items].sort((x, y) => x - y));
  assert.equal((t.markup.match(/<image /g) || []).length, items.length - 1, 'alles een foto, behalve 5 cent');
  assert.ok(t.markup.includes('data-geld="5"><circle'));
});

test('geld(): veel stukken lopen door op een volgende rij en blijven binnen de tekening', () => {
  const t = geld(Array(16).fill(20000));
  const rijen = new Set([...t.markup.matchAll(/<image [^>]*y="([\d.]+)"/g)].map(m => m[1]));
  assert.ok(rijen.size >= 2);
  for (const m of t.markup.matchAll(/<image [^>]*x="([\d.]+)"[^>]*width="(\d+)"/g)) assert.ok(Number(m[1]) + Number(m[2]) <= t.breedte, 'binnen de breedte');
  assert.ok(t.hoogte >= rijen.size * 90);
});

test('geldVerbinden(): een grote set wordt verkleind zodat ze links van de verbindingspunten blijft', () => {
  const v = geldVerbinden([Array(12).fill(20000), [100]], ['€ 2400', '€ 1'], [[0, 0], [1, 1]], true);
  for (const m of v.markup.matchAll(/<image [^>]*x="([\d.]+)"[^>]*width="(\d+)"/g)) assert.ok(Number(m[1]) + Number(m[2]) <= 436, `past links van het verbindingspunt: ${m[1]} + ${m[2]}`);
  assert.equal(gettekend(v.markup).length, 13);
});
