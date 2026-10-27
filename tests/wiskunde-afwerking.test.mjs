// De laatste wiskundefamilies (aantallen schatten, verhoudingen, tot 20 in een verhaal, het teken ≈, rekenmethode kiezen): elk antwoord wordt opnieuw gecontroleerd.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { zetDoelen } from '../js/core/doelregister.js';
import { ECHTE_GENERATORS } from '../js/subjects/wiskunde/generators/index.js';
import { AUTO_DOELEN } from '../js/subjects/wiskunde/auto-doelen.js';
import { eenCijfer } from '../js/subjects/wiskunde/generators/auto-afwerking.js';
import { ggd } from '../js/subjects/wiskunde/auto-hulp.js';

const DOELEN = JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen;
zetDoelen(DOELEN);
const SEEDS = [1, 2, 3, 4, 5];
const vormen = (fam) => ECHTE_GENERATORS.filter(g => g.id.startsWith(`${fam}-`));
const alle = (fam, soort = null) => {
  const uit = [];
  for (const g of vormen(fam).filter(x => !soort || x.id === `${fam}-${soort}`)) for (const code of g.doelen) for (const seed of SEEDS) for (const o of g.genereer({ seed, aantal: 12, opties: g.opties([code], {}, code) }).oefeningen) uit.push({ o, code, g });
  return uit;
};
const getal = (t) => Number(String(t).replace(/\s| /g, ''));

test('de nieuwe families hebben doelen en elk doel geeft oefeningen', () => {
  for (const [fam, aantal] of Object.entries({ sta: 2, vhd: 2, t20: 2, bgl: 1, rkm: 7 })) {
    assert.equal(AUTO_DOELEN[fam].length, aantal, fam);
    for (const code of AUTO_DOELEN[fam]) for (const g of vormen(fam)) assert.ok(g.genereer({ seed: 3, aantal: 8, opties: g.opties([code], {}, code) }).oefeningen.length >= 3, `${g.id} ${code}`);
  }
  assert.ok(AUTO_DOELEN.tel.includes('2.1.GL3.11'), 'tellen met sprongen van 25, 50, 100, 125');
});

test('aantallen schatten: het juiste antwoord is de schatting op één cijfer van a × b, de andere antwoorden zijn minstens 40% anders', () => {
  for (const { o, code } of alle('sta', 'kiezen')) {
    const { a, b, exact, goed } = o.data;
    assert.equal(exact, a * b); assert.equal(goed, eenCijfer(exact));
    assert.equal(o.data.fouten.length >= 2, true);
    for (const f of o.data.fouten) assert.ok(Math.abs(getal(f) - goed) / goed > 0.4, `${f} ligt te dicht bij ${goed}`);
    assert.ok(exact <= (code === '2.1.GL3.18' ? 1000 : 10000) && exact >= 100);
  }
});

test('verhoudingen: elke opgave klopt met de verhouding a : b', () => {
  for (const { o, code } of alle('vhd', 'invullen')) {
    const d = o.data, goed = getal(o.antwoord);
    assert.equal(ggd(d.a, d.b), 1);
    if (d.wat === 'lees') assert.equal(goed, d.b);
    if (d.wat === 'schrijf') assert.equal(goed, d.b);
    if (d.wat === 'omgekeerd') assert.equal(goed, d.a);
    if (d.wat === 'tweede') assert.equal(goed, d.b * d.k);
    if (d.wat === 'eerste') assert.equal(goed, d.a * d.k);
    assert.equal(d.soort, code === '2.1.GL6.11' ? 'ontbreekt' : 'lees');
    assert.ok(['tweede', 'eerste'].includes(d.wat) === (code === '2.1.GL6.11'));
  }
});

test('optellen en aftrekken tot 20 in een verhaal: de uitkomst klopt en blijft tot en met 20', () => {
  const soorten = new Set();
  for (const { o } of alle('t20', 'invullen')) {
    const { a, b, op, soort } = o.data, goed = getal(o.antwoord);
    soorten.add(soort);
    assert.equal(goed, op === '+' ? a + b : op === '-' ? a - b : b - a);
    assert.ok(goed >= 0 && a <= 20 && b <= 20 && (op !== '+' || a + b <= 20));
    assert.ok(o.data.fouten.every(f => getal(f) >= 0));
  }
  assert.deepEqual([...soorten].sort(), ['aanvullen', 'erbij', 'samen', 'verschil', 'weg']);
});

test('het teken ≈: = bij een exacte som, ≈ bij een schatting met afgeronde getallen', () => {
  const wat = new Set();
  for (const { o } of alle('bgl', 'invullen')) {
    const d = o.data; wat.add(d.wat);
    if (d.wat === 'teken') assert.equal(o.antwoord, '≈');
    if (d.wat === 'exact') { assert.equal(d.a + d.b, d.uit); assert.equal(o.antwoord, '='); }
    if (d.wat === 'schatting') { assert.notEqual(d.a + d.b, d.uit); assert.ok(Math.abs(d.a + d.b - d.uit) <= 10); assert.equal(o.antwoord, '≈'); }
  }
  assert.deepEqual([...wat].sort(), ['exact', 'schatting', 'teken']);
});

test('rekenmethode kiezen: het juiste antwoord past bij de getallen en de situatie', () => {
  const methodes = new Set();
  for (const { o } of alle('rkm', 'invullen')) {
    const d = o.data; methodes.add(`${d.soort}:${d.methode}`);
    if (d.soort === 'criterium') { if (d.vorm === 'omgekeerd') assert.equal(o.antwoord, d.methode); else assert.ok(o.tekst.includes(`Je kiest voor ${d.methode} als`)); continue; }
    assert.equal(o.antwoord, d.methode);
    if (d.methode === 'hoofdrekenen') { const [x, y] = d.som.split(/[+-]/).map(Number); assert.ok(d.som.includes('+') ? (x % 100 === 0 && y % 50 === 0) : (y === 99 && x % 100 >= 90), d.som); }
    if (d.methode === 'cijferen') assert.ok(d.a % 10 !== 0 && d.b % 10 !== 0 && d.a >= 2000 && d.b >= 1000);
    if (d.methode === 'schattend rekenen') assert.ok(o.tekst.includes('20 euro'));
    if (d.methode === 'digitale rekentool') assert.ok(/,/.test(d.a) && /,/.test(d.b));
  }
  for (const m of ['hoofdrekenen', 'schattend rekenen', 'cijferen']) assert.ok(methodes.has(`methode:${m}`) && methodes.has(`criterium:${m}`), m);
  assert.ok(methodes.has('methode:digitale rekentool') && methodes.has('criterium:digitale rekentool'));
  for (const code of ['2.2.GL3.36', '2.2.GL4.39']) for (const o of ECHTE_GENERATORS.find(g => g.id === 'rkm-invullen').genereer({ seed: 2, aantal: 20, opties: { doel: code } }).oefeningen) assert.notEqual(o.data.methode, 'digitale rekentool', code);
});
