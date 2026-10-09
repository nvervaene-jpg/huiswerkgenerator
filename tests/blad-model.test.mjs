import { test } from 'node:test';
import assert from 'node:assert/strict';
import wiskunde from '../js/subjects/wiskunde/index.js';
import {
  planModel, losOp, modelUitCode, kopieer, effectiefAantal, vormVan, optiesVoor, STANDAARD,
  verwijderOefening, vervangOefening, voegOefeningToe, blokOpnieuw, verwijderBlok, voegBlokToe,
} from '../js/core/blad-model.js';
import { tekstNaarCode, codeNaarTekst } from '../js/core/bladcode.js';

const LENGTE = ['2.3.GL2.16', '2.3.GL3.19'];
const plan = (extra = {}) => planModel(wiskunde, { doelen: ['2.3.GL2.16'], seed: 11, gebied: 1000, ...extra });
const sleutelsVan = (b) => b.oefeningen.map(o => o.sleutel);
const tekstVan = (b) => b.oefeningen.map(o => o.tekst + (o.svg ? o.svg.markup : ''));

test('standaard: 3 blokken per doel en 6 oefeningen per blok', () => {
  const blad = losOp(wiskunde, plan());
  assert.equal(STANDAARD.blokken, 3);
  assert.equal(blad.blokken.length, 3);
  for (const b of blad.blokken) assert.equal(b.oefeningen.length, effectiefAantal(vormVan(wiskunde, b.vormId), 6));
  assert.ok(blad.blokken.some(b => b.oefeningen.length === 6), 'minstens één gewoon blok met 6');
});

test('aantal blokken en oefeningen zijn instelbaar', () => {
  assert.equal(plan({ blokken: 5 }).blokken.length, 5);
  assert.equal(plan({ blokken: 1 }).blokken.length, 1);
  const b = losOp(wiskunde, plan({ blokken: 1, aantal: 12 })).blokken[0];
  assert.equal(b.oefeningen.length, 12);
  assert.equal(new Set(sleutelsVan(b)).size, 12);
});

test('het eerste blok per doel is een basisvorm en de blokken lopen op van makkelijk naar moeilijk', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const m = plan({ seed });
    const vormen = m.blokken.map(b => vormVan(wiskunde, b.vorm));
    assert.ok(vormen.some(v => v.basis), 'bevat een basisvorm');
    const rangen = vormen.map(v => v.rang ?? 3);
    assert.deepEqual(rangen, [...rangen].sort((x, y) => x - y));
    assert.equal(new Set(vormen.map(v => v.id)).size, vormen.length, 'geen twee keer dezelfde vorm voor één doel');
  }
});

test('bij meerdere doelen worden de vormen afgewisseld en niet dubbel gebruikt', () => {
  const m = planModel(wiskunde, { doelen: ['2.3.GL2.16', '2.3.GL2.21', '2.3.GL3.19'], seed: 3, gebied: 1000 });
  assert.equal(m.blokken.length, 9);
  assert.deepEqual(m.blokken.slice(0, 3).map(b => b.doel), ['2.3.GL2.16', '2.3.GL2.21', '2.3.GL3.19']);
  assert.deepEqual(m.blokken.slice(3, 6).map(b => b.doel), ['2.3.GL2.16', '2.3.GL2.21', '2.3.GL3.19']);
  assert.equal(new Set(m.blokken.map(b => b.vorm)).size, 9, 'elke vorm maar één keer');
});

test('dezelfde seed geeft hetzelfde blad, een andere seed een ander blad', () => {
  assert.deepEqual(plan(), plan());
  assert.notDeepEqual(losOp(wiskunde, plan({ seed: 1 })).blokken, losOp(wiskunde, plan({ seed: 2 })).blokken);
});

const kernenTellen = (blad) => {
  const gezien = new Set(); let dubbel = 0, totaal = 0;
  for (const b of blad.blokken) for (const o of b.oefeningen) for (const k of (o.kernen || (o.kern ? [o.kern] : []))) { totaal++; if (gezien.has(k)) dubbel++; gezien.add(k); }
  return { dubbel, totaal };
};

test('geen dubbele oefeningen in een blok, en bij de standaardinstelling komt dezelfde omzetting niet in twee blokken voor', () => {
  for (let seed = 1; seed <= 40; seed++) {
    for (const blokken of [3, 6]) {
      const blad = losOp(wiskunde, planModel(wiskunde, { doelen: LENGTE, seed, gebied: 1000, blokken }));
      for (const b of blad.blokken) assert.equal(new Set(tekstVan(b)).size, b.oefeningen.length, `dubbel in ${b.vormId}`);
    }
    const { dubbel } = kernenTellen(losOp(wiskunde, planModel(wiskunde, { doelen: LENGTE, seed, gebied: 1000 })));
    assert.equal(dubbel, 0, `dezelfde omzetting twee keer (seed ${seed})`);
  }
});

test('ook met 6 blokken per doel zijn overlappende omzettingen zeldzaam', () => {
  let dubbel = 0, totaal = 0;
  for (let seed = 1; seed <= 60; seed++) { const t = kernenTellen(losOp(wiskunde, planModel(wiskunde, { doelen: LENGTE, seed, gebied: 1000, blokken: 6 }))); dubbel += t.dubbel; totaal += t.totaal; }
  assert.ok(dubbel / totaal < 0.01, `${dubbel} van ${totaal}`);
});

test('weglaten: enkel die oefening verdwijnt, andere blokken blijven gelijk', () => {
  const m = plan({ blokken: 3 }), voor = losOp(wiskunde, m);
  const na = kopieer(m); verwijderOefening(wiskunde, na, 1, 0);
  const blad = losOp(wiskunde, na);
  assert.equal(blad.blokken[1].oefeningen.length, voor.blokken[1].oefeningen.length - 1);
  assert.deepEqual(blad.blokken[1].oefeningen, voor.blokken[1].oefeningen.slice(1));
  assert.deepEqual(blad.blokken[0], voor.blokken[0]);
  assert.deepEqual(blad.blokken[2], voor.blokken[2]);
});

test('vervangen: dezelfde plaats, nieuwe oefening van hetzelfde type, geen dubbels, andere blokken gelijk', () => {
  const m = plan({ blokken: 3 }), voor = losOp(wiskunde, m);
  const na = kopieer(m);
  assert.equal(vervangOefening(wiskunde, na, 0, 2), true);
  const blad = losOp(wiskunde, na);
  assert.equal(blad.blokken[0].vormId, voor.blokken[0].vormId);
  assert.equal(blad.blokken[0].oefeningen.length, voor.blokken[0].oefeningen.length);
  assert.notDeepEqual(blad.blokken[0].oefeningen[2], voor.blokken[0].oefeningen[2]);
  assert.equal(new Set(tekstVan(blad.blokken[0])).size, blad.blokken[0].oefeningen.length);
  assert.deepEqual(blad.blokken[0].oefeningen.filter((_, i) => i !== 2), voor.blokken[0].oefeningen.filter((_, i) => i !== 2));
  assert.deepEqual(blad.blokken[1], voor.blokken[1]);
  // de weggelaten oefening komt niet meteen terug
  const nogEens = kopieer(na); vervangOefening(wiskunde, nogEens, 0, 2);
  assert.ok(!tekstVan(losOp(wiskunde, nogEens).blokken[0]).includes(tekstVan(voor.blokken[0])[2]));
});

test('extra oefening, blok opnieuw, blok toevoegen en blok verwijderen', () => {
  const m = plan({ blokken: 2 }), voor = losOp(wiskunde, m);
  const na = kopieer(m);
  assert.equal(voegOefeningToe(wiskunde, na, 0), true);
  assert.equal(losOp(wiskunde, na).blokken[0].oefeningen.length, voor.blokken[0].oefeningen.length + 1);
  assert.equal(new Set(tekstVan(losOp(wiskunde, na).blokken[0])).size, voor.blokken[0].oefeningen.length + 1);

  blokOpnieuw(wiskunde, na, 1, 98765);
  const opnieuw = losOp(wiskunde, na);
  assert.equal(opnieuw.blokken[1].oefeningen.length, voor.blokken[1].oefeningen.length);
  assert.notDeepEqual(opnieuw.blokken[1].oefeningen, voor.blokken[1].oefeningen);
  assert.equal(opnieuw.blokken[1].vormId, voor.blokken[1].vormId);

  voegBlokToe(wiskunde, na, { vormId: 'lengtematen-meerkeuze', doel: '2.3.GL2.16', seed: 5, aantal: 4, opties: optiesVoor(vormVan(wiskunde, 'lengtematen-meerkeuze'), ['2.3.GL2.16']) });
  const metExtra = losOp(wiskunde, na);
  assert.equal(metExtra.blokken.length, 3);
  assert.equal(metExtra.blokken[2].vormId, 'lengtematen-meerkeuze');
  assert.equal(metExtra.blokken[2].oefeningen.length, 4);

  verwijderBlok(na, 0);
  const zonder = losOp(wiskunde, na);
  assert.equal(zonder.blokken.length, 2);
  assert.deepEqual(zonder.blokken[0].oefeningen, opnieuw.blokken[1].oefeningen);
});

test('de bladcode bewaart alle aanpassingen', () => {
  const m = plan({ blokken: 4, seed: 77 });
  verwijderOefening(wiskunde, m, 0, 0); vervangOefening(wiskunde, m, 1, 1); voegOefeningToe(wiskunde, m, 2);
  blokOpnieuw(wiskunde, m, 3, 4242); verwijderOefening(wiskunde, m, 3, 1);
  voegBlokToe(wiskunde, m, { vormId: 'lengtematen-vraagstuk', doel: '2.3.GL2.16', seed: 9, aantal: 6, opties: optiesVoor(vormVan(wiskunde, 'lengtematen-vraagstuk'), ['2.3.GL2.16'], { 'lengtematen-vraagstuk': { thema: 'sprookjes' } }) });
  const blad = losOp(wiskunde, m);
  const { model, waarschuwing } = modelUitCode(wiskunde, blad.code);
  assert.equal(waarschuwing, null);
  const terug = losOp(wiskunde, model);
  assert.deepEqual(terug.blokken, blad.blokken);
  assert.equal(terug.code, blad.code);
  assert.ok(terug.blokken.at(-1).oefeningen.every(o => !/undefined/.test(o.tekst)));
});

test('het antwoordblad volgt de aanpassingen (volledig-regel per getoonde oefening)', () => {
  const m = plan({ blokken: 3 });
  verwijderOefening(wiskunde, m, 0, 0); vervangOefening(wiskunde, m, 1, 0);
  const blad = losOp(wiskunde, m);
  for (const b of blad.blokken) for (const o of b.oefeningen) assert.ok(o.volledig && !o.volledig.includes('____'));
  assert.equal(blad.blokken[0].oefeningen.length, 5);
});

test('vervangen stopt netjes als er geen nieuwe oefeningen meer zijn, en er komen nooit dubbels', () => {
  const m = planModel(wiskunde, { doelen: ['2.1.GL2.15'], seed: 5, gebied: 10, blokken: 1, aantal: 4 });  // klein gebied: weinig mogelijkheden
  const blok = () => losOp(wiskunde, m).blokken[0];
  let teller = 0;
  while (vervangOefening(wiskunde, m, 0, 0) && teller < 500) teller++;
  assert.ok(teller < 500, 'eindigt');
  assert.equal(new Set(tekstVan(blok())).size, blok().oefeningen.length);
});

test('oude of beschadigde bladcodes geven een duidelijke fout', () => {
  assert.throws(() => modelUitCode(wiskunde, 'B1-abc'), /oudere versie/);
  assert.throws(() => modelUitCode(wiskunde, 'B2-%%%'), /geldige bladcode/);
  assert.throws(() => modelUitCode(wiskunde, codeNaarTekst({ v: 2, k: 'taal', b: [] })), /ander vak/);
  assert.throws(() => modelUitCode(wiskunde, codeNaarTekst({ v: 2, k: 'wiskunde', m: 1, g: 10, f: ['bestaat-niet'], d: [], o: [], b: [[0, -1, 'a', -1, '0', '', 1]] })), /Onbekende oefenvorm/);
  assert.deepEqual(tekstNaarCode(codeNaarTekst({ a: 'é€' })), { a: 'é€' });
});

test('een blad met alle doelen met generators blijft werken (planner, aanpassen, bladcode)', () => {
  const alle = [...new Set(wiskunde.generators.flatMap(g => g.doelen))];
  const m = planModel(wiskunde, { doelen: alle, seed: 2024, gebied: 1000 });
  const blad = losOp(wiskunde, m);
  assert.ok(blad.blokken.length >= alle.length);
  const { model } = modelUitCode(wiskunde, blad.code);
  assert.deepEqual(losOp(wiskunde, model).blokken, blad.blokken);
});
