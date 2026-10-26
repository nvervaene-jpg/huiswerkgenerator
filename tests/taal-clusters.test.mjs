// De doelenlijst van de tool komt overeen met de tabel 'Domeinen, subdomeinen en clusters' (bijlage 1 bij de visietekst Nederlands en communicatie).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const lees = (pad) => JSON.parse(readFileSync(new URL(pad, import.meta.url), 'utf8'));
const { doelen } = lees('../data/taal/doelen-taal-opstap.json'), { clusters } = lees('../data/taal/clusters-bijlage1.json');
const sleutel = (domein, subdomein, cluster) => `${domein} › ${subdomein} › ${cluster || ''}`;

test('bijlage 1: elke cluster uit de tabel heeft doelen in precies de leerjaren van de tabel, en de doelenlijst heeft geen andere clusters', () => {
  const inDoelen = new Map();
  for (const g of doelen) { const k = sleutel(g.domein, g.subdomein, g.rubriek); if (!inDoelen.has(k)) inDoelen.set(k, new Set()); inDoelen.get(k).add(g.leerjaar); }
  const verschillen = [];
  for (const c of clusters) {
    const k = sleutel(c.domein, c.subdomein, c.cluster), eigen = inDoelen.get(k);
    if (!eigen) { verschillen.push(`${k}: staat niet in de doelenlijst`); continue; }
    if ([...eigen].sort().join() !== [...c.leerjaren].sort().join()) verschillen.push(`${k}: tabel ${c.leerjaren}, doelenlijst ${[...eigen].sort()}`);
    inDoelen.delete(k);
  }
  for (const k of inDoelen.keys()) verschillen.push(`${k}: staat niet in de tabel`);
  assert.deepEqual(verschillen, []);
});
