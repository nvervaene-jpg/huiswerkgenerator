// Spellingregels voor alle woorden in Taal: geen woord op -v of -z, geen drie dezelfde letters, enz. (js/subjects/taal/spelregels.js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { zetDoelen } from '../js/core/doelregister.js';
import { spellingFouten, isGeldigWoord } from '../js/subjects/taal/spelregels.js';
import { ECHTE_GENERATORS } from '../js/subjects/taal/generators/index.js';

zetDoelen(JSON.parse(await readFile(new URL('../data/taal/doelen-taal-opstap.json', import.meta.url), 'utf8')).doelen);

test('spelregels: regels op zichzelf', () => {
  for (const w of ['schrijf', 'blijf', 'geef', 'lees', 'huis', 'ik', 'maan', 'zeeën', 'knieën', 'café', 'quiz', 'jazz', "foto's", 'koek-je']) assert.deepEqual(spellingFouten(w), [], w);
  assert.ok(spellingFouten('schrijv').includes('eindigt op v'));
  assert.ok(spellingFouten('reiz').includes('eindigt op z'));
  assert.ok(spellingFouten('zeeen').includes('drie dezelfde letters'));
  assert.ok(spellingFouten('ddeur').includes('begint met een dubbele medeklinker'));
  assert.ok(spellingFouten('qaart').includes('q zonder u'));
  assert.ok(spellingFouten('bakk').includes('eindigt op een dubbele medeklinker'));
  assert.deepEqual(spellingFouten('bakk', { fout: true }), []);
  assert.ok(!isGeldigWoord('12'));
});

// Alle losse woorden uit de woordenlijsten (de bestanden in woorden/): elk tekstje dat uit één woord bestaat, en elk woord uit zinnen en teksten.
async function woordenUitLijsten() {
  const map = new URL('../js/subjects/taal/woorden/', import.meta.url), uit = new Map();
  const loop = (x, bron, sleutel = '') => {
    if (typeof x === 'string') { for (const w of x.match(/[A-Za-zÀ-ÿ'’-]{2,}/g) || []) if (!uit.has(w.toLowerCase())) uit.set(w.toLowerCase(), `${bron}${sleutel ? ' › ' + sleutel : ''}`); }
    else if (Array.isArray(x)) x.forEach(y => loop(y, bron, sleutel));
    else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) { if (k === 'delen') continue; loop(v, bron, sleutel || k); }   // lettergrepen zijn geen woorden
  };
  for (const f of (await readdir(map)).filter(n => n.endsWith('.js'))) { const m = await import(new URL(f, map)); for (const [k, v] of Object.entries(m)) loop(v, f, k); }
  return uit;
}

test('spelregels: geen woord in de woordenlijsten eindigt op -v of -z of heeft drie dezelfde letters', async () => {
  const ALLEEN_TOEGESTAAN = new Set(['quiz', 'jazz', 'enz', 'zoz', 'dwz', 'blz', 'bv', 'tv', 'vz', 'lv', 'mv']);   // leenwoorden en afkortingen
  const fout = [];
  for (const [w, bron] of await woordenUitLijsten()) {
    if (ALLEEN_TOEGESTAAN.has(w)) continue;
    if (/[vz]$/.test(w) || /([a-z])\1\1/.test(w)) fout.push(`${w} (${bron})`);
  }
  assert.deepEqual(fout, []);
});

test('spelregels: alle woorden die de generators laten zien volgen de regels (behalve lettergrepen en woorden met een open plaats)', () => {
  const fout = new Map();
  for (const g of ECHTE_GENERATORS) {
    if (/lettergrepen/.test(g.id)) continue;
    for (const doel of g.doelen) for (const seed of [1, 2]) {
      const res = g.genereer({ seed, aantal: 24, opties: g.opties(g.doelen, {}, doel) });
      for (const o of res.oefeningen) for (const tekst of [o.tekst, o.antwoord, o.volledig]) {
        for (const m of String(tekst || '').matchAll(/(^|[^A-Za-zÀ-ÿ_'’-])([A-Za-zÀ-ÿ'’-]{2,})(?![A-Za-zÀ-ÿ_])/g)) {
          const w = m[2].toLowerCase(), na = String(tekst).slice(m.index + m[0].length);
          if (/^_/.test(na)) continue;                                          // woord met een open plaats
          const regels = spellingFouten(w, { fout: true }).filter(r => r !== 'geen woord');
          if (regels.length && !['quiz', 'jazz'].includes(w)) fout.set(w, `${g.id}: ${regels.join(', ')}`);
        }
      }
    }
  }
  assert.deepEqual([...fout].slice(0, 20), []);
});
