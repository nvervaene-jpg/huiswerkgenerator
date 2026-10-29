// Tests voor "Maatwerk per blokje": de tafels als maatstaf (tafels 1-20, bereik, volgorde, groepering, onbekende, factorvolgorde, steun)
// en de algemene instellingen (aantal, voorbeeld, invulvakje, ruimte, samenvatting, bladcode, startwaarden per leerling).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { zetDoelen } from '../js/core/doelregister.js';
import { losOp, modelUitCode, voegBlokjeToe, vervangOefening, voegOefeningToe, kopieer } from '../js/core/blad-model.js';
import { bouwKaarten, nieuweKaartStaat, blokjeSpec, kaartChips, zichtbareChips, samenvatting, klemAantal, TAFEL_SNELKNOPPEN } from '../js/core/blokjes.js';
import { Leerlingen } from '../js/core/storage.js';

zetDoelen(JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen);
const kaart = bouwKaarten(wiskunde).find(k => k.id === 'maaltafels');
const blad = (chips, { aantal = 10, vorm, extra = {}, gebied = 200 } = {}) => {
  const staat = nieuweKaartStaat(wiskunde, kaart);
  if (vorm) staat.vorm = vorm;
  Object.assign(staat.chips, chips, extra);
  staat.aantal = aantal;
  const m = { versie: 1, vak: 'wiskunde', gebied, blokken: [] };
  voegBlokjeToe(wiskunde, m, blokjeSpec(wiskunde, kaart, staat, gebied, 11));
  return { m, b: losOp(wiskunde, m).blokken[0], staat };
};
const C = (id, w) => ({ [`maaltafels/${id}`]: w });
const som = (t) => { const m = /^(\d+|____) ([×:]) (\d+|____) = (\d+|____)$/.exec(t); return m && { a: m[1], op: m[2], b: m[3], c: m[4] }; };

test('tafels tot en met 20 worden gelezen', () => {
  const { b } = blad({ ...C('tafels', '12, 15'), ...C('bewerking', 'vermenigvuldigen') }, { aantal: 30 });
  assert.ok(b.oefeningen.length >= 10);
  for (const o of b.oefeningen) assert.ok([12, 15].some(t => o.tekst.includes(String(t)) || o.volledig.includes(String(t))), o.tekst);
});

test('snelknoppen: alles, niets, 2-5-10, 3-4-6, 7-8-9', () => {
  assert.deepEqual(TAFEL_SNELKNOPPEN.map(([t]) => t), ['Alles', 'Niets', '2-5-10', '3-4-6', '7-8-9']);
  assert.deepEqual(TAFEL_SNELKNOPPEN.find(([t]) => t === 'Niets')[1], []);
  assert.deepEqual(TAFEL_SNELKNOPPEN.find(([t]) => t === '7-8-9')[1], [7, 8, 9]);
});

test('in volgorde en per tafel: 1 x 2, 2 x 2, ... daarna de volgende tafel', () => {
  const { b } = blad({ ...C('tafels', '2, 5'), ...C('bewerking', 'vermenigvuldigen'), ...C('volgorde', 'in-volgorde'), ...C('groepering', 'per-tafel'), ...C('factorOrde', 'tafel-laatst'), ...C('onbekend', 'uitkomst') }, { aantal: 20 });
  assert.equal(b.oefeningen.length, 20);
  b.oefeningen.forEach((o, i) => {
    const s = som(o.tekst), t = i < 10 ? 2 : 5, k = (i % 10) + 1;
    assert.equal(s.a, String(k), o.tekst); assert.equal(s.b, String(t)); assert.equal(s.c, '____');
  });
});

test('in volgorde en gemengd: eerst alle tafels bij x 1, dan bij x 2', () => {
  const { b } = blad({ ...C('tafels', '2, 5, 10'), ...C('bewerking', 'vermenigvuldigen'), ...C('volgorde', 'in-volgorde'), ...C('groepering', 'gemengd'), ...C('factorOrde', 'tafel-eerst'), ...C('onbekend', 'uitkomst') }, { aantal: 9 });
  assert.deepEqual(b.oefeningen.map(o => o.tekst.split(' = ')[0]), ['2 × 1', '5 × 1', '10 × 1', '2 × 2', '5 × 2', '10 × 2', '2 × 3', '5 × 3', '10 × 3']);
});

test('door elkaar maar per tafel bij elkaar: elke tafel blijft één groep', () => {
  const { b } = blad({ ...C('tafels', '3, 4'), ...C('bewerking', 'vermenigvuldigen'), ...C('groepering', 'per-tafel'), ...C('factorOrde', 'tafel-eerst'), ...C('onbekend', 'uitkomst') }, { aantal: 20 });
  const tafels = b.oefeningen.map(o => Number(o.tekst.split(' ')[0]));
  assert.deepEqual(tafels, [...Array(10).fill(3), ...Array(10).fill(4)]);
  assert.notDeepEqual(b.oefeningen.slice(0, 10).map(o => o.tekst.split(' ')[2]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String), 'binnen de tafel door elkaar');
});

test('het bereik van de vermenigvuldiger: x 1 tot 5, x 6 tot 10 en zelf kiezen', () => {
  const faktoren = (chips) => blad({ ...C('tafels', '7'), ...C('bewerking', 'vermenigvuldigen'), ...C('volgorde', 'in-volgorde'), ...C('groepering', 'per-tafel'), ...C('factorOrde', 'tafel-eerst'), ...C('onbekend', 'uitkomst'), ...chips }, { aantal: 30 }).b.oefeningen.map(o => Number(o.tekst.split(' ')[2]));
  assert.deepEqual(faktoren(C('bereik', '1-5')), [1, 2, 3, 4, 5]);
  assert.deepEqual(faktoren(C('bereik', '6-10')), [6, 7, 8, 9, 10]);
  assert.deepEqual(faktoren({ ...C('bereik', 'zelf'), ...C('bereikZelf', '3-8') }), [3, 4, 5, 6, 7, 8]);
});

test('de plaats van het onbekende: uitkomst, factor of beide', () => {
  const onb = (w) => blad({ ...C('tafels', '3, 4, 6'), ...C('bewerking', 'vermenigvuldigen'), ...C('onbekend', w) }, { aantal: 20 }).b.oefeningen.map(o => som(o.tekst));
  assert.ok(onb('uitkomst').every(s => s.c === '____'));
  assert.ok(onb('factor').every(s => s.c !== '____' && (s.a === '____' || s.b === '____')));
  const beide = onb('beide');
  assert.ok(beide.some(s => s.c === '____') && beide.some(s => s.c !== '____'));
});

test('de volgorde van de factoren: tafelgetal vooraan, achteraan of door elkaar', () => {
  const eerste = (w) => blad({ ...C('tafels', '6'), ...C('bewerking', 'vermenigvuldigen'), ...C('factorOrde', w), ...C('onbekend', 'uitkomst'), ...C('bereik', 'zelf'), ...C('bereikZelf', '1-5') }, { aantal: 5 }).b.oefeningen.map(o => o.tekst.split(' ').slice(0, 3).join(' '));
  assert.ok(eerste('tafel-eerst').every(t => t.startsWith('6 × ')));
  assert.ok(eerste('tafel-laatst').every(t => t.endsWith(' × 6')));
});

test('delen: de tafel is de deler en het bereik de uitkomst', () => {
  const { b } = blad({ ...C('tafels', '4'), ...C('bewerking', 'delen'), ...C('volgorde', 'in-volgorde'), ...C('groepering', 'per-tafel'), ...C('onbekend', 'uitkomst'), ...C('bereik', 'zelf'), ...C('bereikZelf', '1-3') }, { aantal: 10 });
  assert.deepEqual(b.oefeningen.map(o => o.tekst), ['4 : 4 = ____', '8 : 4 = ____', '12 : 4 = ____']);
});

test('beide: in volgorde eerst de maalsommen, dan de deelsommen van dezelfde tafel', () => {
  const { b } = blad({ ...C('tafels', '2'), ...C('bewerking', 'beide'), ...C('volgorde', 'in-volgorde'), ...C('groepering', 'per-tafel'), ...C('onbekend', 'uitkomst'), ...C('factorOrde', 'tafel-eerst'), ...C('bereik', 'zelf'), ...C('bereikZelf', '1-3') }, { aantal: 6 });
  assert.deepEqual(b.oefeningen.map(o => o.tekst), ['2 × 1 = ____', '2 × 2 = ____', '2 × 3 = ____', '2 : 2 = ____', '4 : 2 = ____', '6 : 2 = ____']);
});

test('steun: tafelrij en getallenas staan als steun bovenaan het blokje', () => {
  const rij = blad({ ...C('tafels', '2, 5'), ...C('steun', 'tafelrij') }).b;
  assert.match(rij.steun.tekst, /Tafel van 2:\s+2\s+·\s+4/); assert.match(rij.steun.tekst, /Tafel van 5:\s+5\s+·\s+10/);
  const as = blad({ ...C('tafels', '3'), ...C('steun', 'getallenas') }).b;
  assert.match(as.steun.svg.markup, /data-getallenas="3"/);
  assert.equal((as.steun.svg.markup.match(/data-sprong="3"/g) || []).length, 10, 'tien sprongen van 3');
  assert.equal(blad({ ...C('tafels', '3') }).b.steun, undefined);
});

test('steun: groepjes bolletjes bij elke som (a rijen van b bolletjes)', () => {
  const { b } = blad({ ...C('tafels', '3'), ...C('bewerking', 'vermenigvuldigen'), ...C('steun', 'groepjes'), ...C('factorOrde', 'tafel-eerst'), ...C('onbekend', 'uitkomst') }, { aantal: 4 });
  for (const o of b.oefeningen) {
    const [a, , k] = o.tekst.split(' ');
    assert.ok(o.svg.markup.includes(`data-groepjes="${a}x${k}"`), o.tekst);
    assert.equal((o.svg.markup.match(/data-bol="1"/g) || []).length, a * k);
  }
});

test('vaste volgorde blijft staan bij vervangen en bijvoegen', () => {
  const { m } = blad({ ...C('tafels', '2'), ...C('bewerking', 'vermenigvuldigen'), ...C('volgorde', 'in-volgorde'), ...C('groepering', 'per-tafel'), ...C('factorOrde', 'tafel-laatst'), ...C('onbekend', 'uitkomst') }, { aantal: 3 });
  assert.equal(voegOefeningToe(wiskunde, m, 0), true);
  assert.deepEqual(losOp(wiskunde, m).blokken[0].oefeningen.map(o => o.tekst), ['1 × 2 = ____', '2 × 2 = ____', '3 × 2 = ____', '4 × 2 = ____']);
});

test('te weinig mogelijke oefeningen geeft een waarschuwing', () => {
  const m = { versie: 1, vak: 'wiskunde', gebied: 200, blokken: [] };
  const staat = nieuweKaartStaat(wiskunde, kaart); Object.assign(staat.chips, C('tafels', '2'), C('bewerking', 'vermenigvuldigen'), C('volgorde', 'in-volgorde')); staat.aantal = 20;
  voegBlokjeToe(wiskunde, m, blokjeSpec(wiskunde, kaart, staat, 200, 3));
  const l = losOp(wiskunde, m);
  assert.equal(l.blokken[0].oefeningen.length, 10);
  assert.ok(l.waarschuwingen.some(w => /10 van 20/.test(w)));
});

test('de standaardinstellingen maken nog dezelfde oefeningen als vroeger (geen extra opties in het blok)', () => {
  const { m } = blad({});
  assert.deepEqual(Object.keys(m.blokken[0].opties).sort(), ['bewerking', 'tafels']);
});

test('chips: bereik zelf verschijnt enkel bij "Zelf kiezen"; steun enkel bij invullen', () => {
  const staat = nieuweKaartStaat(wiskunde, kaart);
  assert.ok(!zichtbareChips(wiskunde, kaart, staat, 100).some(c => c.id === 'bereikZelf'));
  staat.chips['maaltafels/bereik'] = 'zelf';
  assert.ok(zichtbareChips(wiskunde, kaart, staat, 100).some(c => c.id === 'bereikZelf'));
  assert.ok(zichtbareChips(wiskunde, kaart, staat, 100).some(c => c.id === 'steun'));
  staat.vorm = 'maaltafels-meerkeuze';
  assert.ok(!zichtbareChips(wiskunde, kaart, staat, 100).some(c => c.id === 'steun'));
  assert.ok(zichtbareChips(wiskunde, kaart, staat, 100).some(c => c.id === 'tafels'));
});

test('samenvatting: Tafels 2, 5, 10 · in volgorde · met tafelrij', () => {
  const staat = nieuweKaartStaat(wiskunde, kaart);
  Object.assign(staat.chips, C('tafels', '2, 5, 10'), C('volgorde', 'in-volgorde'), C('steun', 'tafelrij'));
  assert.equal(samenvatting(wiskunde, kaart, staat), 'Tafels 2, 5, 10 · in volgorde · met tafelrij');
  Object.assign(staat, { vb: true, ruim: true, vakje: true });
  assert.equal(samenvatting(wiskunde, kaart, staat), 'Tafels 2, 5, 10 · in volgorde · met tafelrij · met voorbeeld · invulvakje · ruim');
});

test('aantal tussen 1 en 30', () => {
  assert.equal(klemAantal(0), 1); assert.equal(klemAantal(45), 30); assert.equal(klemAantal('17'), 17); assert.equal(klemAantal('abc'), 1);
  assert.equal(blad({ ...C('volgorde', 'door-elkaar') }, { aantal: 30 }).b.oefeningen.length, 30);
  assert.equal(blad({}, { aantal: 1 }).b.oefeningen.length, 1);
});

test('ruim, invulvakje, voorbeeld en samenvatting gaan mee in het blokje en in de bladcode', () => {
  const staat = nieuweKaartStaat(wiskunde, kaart); Object.assign(staat, { ruim: true, vakje: true, vb: true }); Object.assign(staat.chips, C('tafels', '2, 5, 10'));
  const m = { versie: 1, vak: 'wiskunde', gebied: 100, blokken: [] };
  voegBlokjeToe(wiskunde, m, blokjeSpec(wiskunde, kaart, staat, 100, 5));
  const l = losOp(wiskunde, m), b = l.blokken[0];
  assert.ok(b.ruim && b.vakje && b.vb); assert.equal(b.sam, 'Tafels 2, 5, 10 · met voorbeeld · invulvakje · ruim');
  const terug = losOp(wiskunde, modelUitCode(wiskunde, l.code).model).blokken[0];
  assert.ok(terug.ruim && terug.vakje && terug.vb); assert.equal(terug.sam, b.sam);
  assert.deepEqual(terug.oefeningen.map(o => o.tekst), b.oefeningen.map(o => o.tekst));
});

test('een blok zonder extra instellingen krijgt geen ruim, vakje of voorbeeld in de bladcode', () => {
  const { m } = blad({});
  const code = losOp(wiskunde, m).code, terug = modelUitCode(wiskunde, code).model.blokken[0];
  assert.ok(!terug.ruim && !terug.vakje && !terug.vb);
  assert.equal(terug.sam, 'Tafels 1, 2, 3, 4, 5, 6, 7, 8, 9, 10');
});

test('startwaarden per leerling worden bewaard in het profiel', () => {
  const opslag = { d: {}, getItem(k) { return this.d[k] ?? null; }, setItem(k, v) { this.d[k] = v; } };
  const ll = new Leerlingen(opslag); const [bram] = ll.voegToe('Bram', 'L3');
  const instellingen = { 'hoofd|maaltafels': { vorm: 'maaltafels', chips: { 'maaltafels/tafels': '2, 5, 10', 'maaltafels/volgorde': 'in-volgorde', 'maaltafels/steun': 'tafelrij' }, aantal: 12, vb: false, ruim: true, vakje: false } };
  ll.wijzig(bram.id, { instellingen: { 'wiskunde|hoofd|maaltafels': instellingen['hoofd|maaltafels'] } });
  const opnieuw = new Leerlingen(opslag).lijst[0];
  assert.equal(opnieuw.instellingen['wiskunde|hoofd|maaltafels'].chips['maaltafels/tafels'], '2, 5, 10');
});

test('afbakening splitsen: enkel de gekozen getallen worden gesplitst', () => {
  const k = bouwKaarten(wiskunde).find(x => x.id === 'splitsen');
  assert.ok(kaartChips(wiskunde, k).some(c => c.id === 'splitsgetallen'));
  for (const vorm of ['getallen-splitsen', 'getallen-splitshuis', 'getallen-splits-juist-fout']) {
    const staat = nieuweKaartStaat(wiskunde, k); staat.vorm = vorm; staat.chips['getallen-splitsen/splitsgetallen'] = '6, 8'; staat.aantal = 8;
    const m = { versie: 1, vak: 'wiskunde', gebied: 20, blokken: [] };
    voegBlokjeToe(wiskunde, m, blokjeSpec(wiskunde, k, staat, 20, 4));
    const b = losOp(wiskunde, m).blokken[0];
    assert.ok(b.oefeningen.length >= 4, vorm);
    assert.ok(b.oefeningen.every(o => [6, 8].includes(o.getallen[0])), `${vorm}: ${b.oefeningen.map(o => o.getallen[0])}`);
    assert.ok(b.sam.endsWith('Splitsgetallen 6, 8'), b.sam);
  }
});

test('zonder afbakening splitst het blokje nog alle getallen binnen het gebied', () => {
  const k = bouwKaarten(wiskunde).find(x => x.id === 'splitsen'), staat = nieuweKaartStaat(wiskunde, k); staat.aantal = 8;
  const m = { versie: 1, vak: 'wiskunde', gebied: 10, blokken: [] };
  voegBlokjeToe(wiskunde, m, blokjeSpec(wiskunde, k, staat, 10, 4));
  assert.deepEqual(m.blokken[0].opties, {});
  assert.ok(new Set(losOp(wiskunde, m).blokken[0].oefeningen.map(o => o.getallen[0])).size > 2);
});
