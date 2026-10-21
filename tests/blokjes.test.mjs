// Tests voor de blokjes-modus: het model (hulpblokjes, voorbeeld, breedte, B3-code), de kaarten in het palet en de nieuwe blokjes voor Bewerkingen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import wiskunde from '../js/subjects/wiskunde/index.js';
import taal from '../js/subjects/taal/index.js';
import { zetDoelen } from '../js/core/doelregister.js';
import {
  losOp, modelUitCode, kopieer, voegBlokjeToe, voegHulpToe, pasHulpAan, zetVoorbeeld, zetBreedte, verplaatsBlok, alleOpnieuw, modelVoorLeerling,
  lijstBlokken, voorbeeldDelen, doelenBijBlokje, vormVan, STANDAARD,
} from '../js/core/blad-model.js';
import { codeNaarTekst, tekstNaarCode } from '../js/core/bladcode.js';
import {
  bouwKaarten, kaartChips, nieuweKaartStaat, optiesVanKaart, kaartZichtbaar, zichtbareChips, kanLeveren, blokjeSpec, voorbeeldOefening, domeinenVan,
} from '../js/core/blokjes.js';

const DOELEN = JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen;
zetDoelen(DOELEN);
const leeg = (gebied = 100) => ({ versie: 1, vak: 'wiskunde', gebied, blokken: [] });
const kaartVan = (id) => bouwKaarten(wiskunde).find(k => k.id === id);
function voeg(model, kaartId, { gebied = 100, vorm, chips = {}, aantal, seed = 7, positie } = {}) {
  const kaart = kaartVan(kaartId), staat = nieuweKaartStaat(wiskunde, kaart);
  if (vorm) staat.vorm = vorm;
  Object.assign(staat.chips, chips);
  if (aantal) staat.aantal = aantal;
  return voegBlokjeToe(wiskunde, model, blokjeSpec(wiskunde, kaart, staat, gebied, seed), positie);
}

/* ------------------------------------------------------------------ model */
test('een blokje legt zijn instellingen vast: gebied, opties, aantal en breedte', () => {
  const m = leeg(100);
  const b = voeg(m, 'optellen', { gebied: 20, chips: { 'optellen/brug': 'met' }, aantal: 5 });
  assert.equal(b.gebied, 20); assert.equal(b.opties.brug, 'met'); assert.equal(b.n, 5); assert.equal(b.breedte, 1);
  voeg(m, 'optellen', { gebied: 100, chips: { 'optellen/brug': 'zonder' }, aantal: 10 });
  const blad = losOp(wiskunde, m);
  assert.deepEqual(blad.blokken.map(x => x.gebied), [20, 100]);
  assert.ok(blad.blokken[0].oefeningen.every(o => o.data.a + o.data.b <= 20 && o.data.brug), 'eerste blokje: tot 20 met brug');
  assert.ok(blad.blokken[1].oefeningen.every(o => !o.data.brug), 'tweede blokje: zonder brug');
});

test('een instelling achteraf wijzigt enkel de blokjes die volgen', () => {
  const m = leeg();
  voeg(m, 'optellen', { chips: { 'optellen/brug': 'met' }, gebied: 20 });
  const eerste = JSON.stringify(m.blokken[0]);
  voeg(m, 'optellen', { chips: { 'optellen/brug': 'zonder' }, gebied: 1000 });
  assert.equal(JSON.stringify(m.blokken[0]), eerste);
});

test('hulpblokjes: instructieregel, blanco blok en nieuw blad', () => {
  const m = leeg();
  voegHulpToe(m, { hulp: 'instructie', tekst: 'Rekenen maar!' });
  voeg(m, 'optellen');
  voegHulpToe(m, { hulp: 'blanco', breedte: 2, hoogte: 4 });
  voegHulpToe(m, { hulp: 'pagina' });
  voeg(m, 'aftrekken');
  const blad = losOp(wiskunde, m);
  assert.deepEqual(blad.blokken.map(b => b.hulp || b.vormId), ['instructie', 'optellen', 'blanco', 'pagina', 'aftrekken']);
  assert.equal(blad.blokken[0].tekst, 'Rekenen maar!'); assert.equal(blad.blokken[0].breedte, 4);
  assert.equal(blad.blokken[2].breedte, 2); assert.equal(blad.blokken[2].hoogte, 4);
  assert.equal(blad.blokken[3].breedte, 4);
  assert.equal(lijstBlokken(m).length, 2);
  pasHulpAan(m, 0, { tekst: 'Anders' });
  assert.equal(losOp(wiskunde, m).blokken[0].tekst, 'Anders');
  assert.throws(() => voegHulpToe(m, { hulp: 'onzin' }));
});

test('blokjes verslepen en de breedte aanpassen', () => {
  const m = leeg();
  ['optellen', 'aftrekken', 'maaltafels'].forEach(k => voeg(m, k));
  verplaatsBlok(m, 2, 0);
  assert.deepEqual(m.blokken.map(b => b.vorm), ['maaltafels', 'optellen', 'aftrekken']);
  verplaatsBlok(m, 0, 99);
  assert.deepEqual(m.blokken.map(b => b.vorm), ['optellen', 'aftrekken', 'maaltafels']);
  zetBreedte(m, 0, 4);
  assert.equal(losOp(wiskunde, m).blokken[0].breedte, 4);
  assert.throws(() => zetBreedte(m, 0, 3));
  const p = leeg(); voeg(p, 'optellen'); voeg(p, 'aftrekken', { positie: 0 });
  assert.deepEqual(p.blokken.map(b => b.vorm), ['aftrekken', 'optellen']);
});

test('een blokje met brede oefeningen krijgt de volle breedte', () => {
  const m = leeg(100);
  voeg(m, 'klok', { gebied: 0 });
  assert.equal(losOp(wiskunde, m).blokken[0].breedte, 4);
});

test('voorbeeldblokje: de eerste oefening staat ingevuld, de antwoorden in het blauw', () => {
  const m = leeg();
  voeg(m, 'optellen', { aantal: 5 });
  zetVoorbeeld(m, 0, true);
  const [eerste, tweede] = losOp(wiskunde, m).blokken[0].oefeningen;
  assert.ok(eerste.voorbeeld && !tweede.voorbeeld);
  const delen = eerste.voorbeeldDelen;
  assert.equal(delen.filter(d => d.blauw).length, 1);
  assert.equal(delen.map(d => d.t).join(''), eerste.tekst.replace('____', eerste.antwoord));
  assert.equal(delen.find(d => d.blauw).t, eerste.antwoord);
  assert.ok(!delen.map(d => d.t).join('').includes('____'));
  assert.equal(voorbeeldDelen({ tekst: 'a\nb', volledig: 'a b' })[0].blauw, true);
  zetVoorbeeld(m, 0, false);
  assert.ok(!losOp(wiskunde, m).blokken[0].oefeningen[0].voorbeeld);
});

test('B3-bladcode bewaart blokjes, hulpblokjes, voorbeeld, breedte en gebied; B2 blijft leesbaar', () => {
  const m = leeg(1000);
  voegHulpToe(m, { hulp: 'instructie', tekst: 'Reken zonder rekenmachine.' });
  voeg(m, 'optellen', { gebied: 20, chips: { 'optellen/brug': 'met' } });
  zetVoorbeeld(m, 1, true);
  voeg(m, 'klok', { gebied: 0 });
  voegHulpToe(m, { hulp: 'blanco', breedte: 4, hoogte: 5 });
  voegHulpToe(m, { hulp: 'pagina' });
  const blad = losOp(wiskunde, m);
  assert.ok(blad.code.startsWith('B3-'));
  const { model: terug } = modelUitCode(wiskunde, blad.code);
  assert.deepEqual(terug, m);
  assert.equal(losOp(wiskunde, terug).code, blad.code);
  const oud = codeNaarTekst({ v: 2, m: 1, k: 'wiskunde', g: 100, f: ['optellen'], d: [], o: [], b: [[0, -1, 'a', -1, '0,1,2', '', 3]] });
  const { model: oudModel } = modelUitCode(wiskunde, 'B2-' + oud.slice(3));
  assert.equal(oudModel.blokken[0].vorm, 'optellen'); assert.equal(oudModel.blokken[0].gebied, undefined);
  assert.equal(losOp(wiskunde, oudModel).blokken[0].oefeningen.length, 3);
  assert.throws(() => tekstNaarCode('B4-abc'), /geldige bladcode/);
});

test('nieuwe getallen voor het hele blad: blokjes en instellingen blijven; ander blad voor een andere leerling', () => {
  const m = leeg();
  voeg(m, 'optellen', { chips: { 'optellen/brug': 'met' }, aantal: 8, gebied: 100 });
  voegHulpToe(m, { hulp: 'instructie', tekst: 'x' });
  voeg(m, 'aftrekken', { aantal: 6 });
  const voor = losOp(wiskunde, m).blokken.map(b => b.oefeningen?.map(o => o.sleutel).join('|'));
  const m2 = kopieer(m); let n = 100; alleOpnieuw(wiskunde, m2, () => ++n);
  const na = losOp(wiskunde, m2);
  assert.deepEqual(na.blokken.map(b => b.hulp || b.vormId), ['optellen', 'instructie', 'aftrekken']);
  assert.equal(na.blokken[0].oefeningen.length, 8);
  assert.notEqual(na.blokken[0].oefeningen.map(o => o.sleutel).join('|'), voor[0]);
  assert.equal(m2.blokken[0].opties.brug, 'met'); assert.equal(m2.blokken[0].gebied, 100);
  const anna = modelVoorLeerling(wiskunde, m, 'anna'), bram = modelVoorLeerling(wiskunde, m, 'bram');
  assert.deepEqual(anna, modelVoorLeerling(wiskunde, m, 'anna'));
  assert.notDeepEqual(anna.blokken[0].seed, bram.blokken[0].seed);
  assert.equal(losOp(wiskunde, anna).blokken[0].oefeningen.length, 8);
});

test('onderaan het blad staan de Op.stap-doelen die erin zitten, passend bij het rekengebied', () => {
  const m = leeg();
  voeg(m, 'optellen', { gebied: 20 });
  const blad = losOp(wiskunde, m);
  assert.ok(blad.doelen.length > 0);
  const optellen = vormVan(wiskunde, 'optellen');
  assert.ok(blad.doelen.every(c => optellen.doelen.includes(c)));
  const gebied100 = doelenBijBlokje(optellen, 100), gebied20 = doelenBijBlokje(optellen, 20);
  assert.ok(gebied20.length < optellen.doelen.length && gebied100.length < optellen.doelen.length);
  assert.notDeepEqual(gebied20, gebied100);
  const doelBlok = losOp(wiskunde, { versie: 1, vak: 'wiskunde', gebied: 100, blokken: [{ vorm: 'optellen', doel: '2.2.GL1.19', seed: 1, opties: {}, volgorde: [0], weg: [], n: 1 }] });
  assert.deepEqual(doelBlok.doelen, ['2.2.GL1.19']);
});

/* ------------------------------------------------------------------ kaarten en chips */
test('elke generator staat op precies één kaart en elke kaart verwijst naar bestaande generators', () => {
  for (const vak of [wiskunde, taal]) {
    zetDoelen(JSON.parse(awaitSync(vak)).doelen);
    const kaarten = bouwKaarten(vak), tel = new Map();
    for (const k of kaarten) { assert.ok(k.vormen.length > 0, k.id); for (const v of k.vormen) tel.set(v.id, (tel.get(v.id) || 0) + 1); }
    for (const g of vak.generators) assert.equal(tel.get(g.id), 1, `${vak.id}: ${g.id} staat op ${tel.get(g.id) || 0} kaarten`);
    for (const k of vak.blokjes.kaarten) for (const id of k.vormen) assert.ok(vak.generators.some(g => g.id === id), `${vak.id}/${k.id}: onbekende vorm ${id}`);
    assert.equal(new Set(kaarten.map(k => `${k.tab}|${k.id}`)).size, kaarten.length, 'unieke kaart-ids');
    for (const k of kaarten) { assert.ok([1, 2, 4].includes(k.breedte), `${k.id}: breedte`); assert.ok(domeinenVan(vak, kaarten, k.tab).includes(k.domein)); }
  }
  zetDoelen(DOELEN);
});
const bestanden = { wiskunde: '../data/wiskunde/doelen-wiskunde-opstap.json', taal: '../data/taal/doelen-taal-opstap.json' };
import { readFileSync } from 'node:fs';
function awaitSync(vak) { return readFileSync(new URL(bestanden[vak.id], import.meta.url), 'utf8'); }

test('elke kaart: standaardchips zijn geldig en elke vorm maakt oefeningen met die instellingen', () => {
  for (const vak of [wiskunde, taal]) {
    zetDoelen(JSON.parse(awaitSync(vak)).doelen);
    for (const k of bouwKaarten(vak)) {
      const staat = nieuweKaartStaat(vak, k);
      for (const c of kaartChips(vak, k)) {
        if (c.type === 'select') assert.ok(c.opties.some(([w]) => w === c.standaard) && !c.opties.some(([w]) => w === 'auto'), `${k.id}/${c.id}`);
      }
      let leverde = false;
      for (const v of k.vormen) {
        const gebied = vak.id === 'taal' ? 0 : 1000;
        const o = voorbeeldOefening(vak, k, { ...staat, vorm: v.id }, gebied, 3);
        if (o) leverde = true;
        assert.doesNotThrow(() => optiesVanKaart(vak, k, { ...staat, vorm: v.id }));
      }
      assert.ok(leverde, `${vak.id}/${k.id}: geen enkele vorm maakt een oefening`);
    }
  }
  zetDoelen(DOELEN);
});

test('het palet toont enkel wat in het rekengebied iets kan opleveren en chips enkel als er iets te kiezen valt', () => {
  const optellen = kaartVan('optellen'), maaldeel = kaartVan('maaldeel'), staat = nieuweKaartStaat(wiskunde, optellen);
  assert.ok(kaartZichtbaar(wiskunde, optellen, 5));
  assert.ok(!kaartZichtbaar(wiskunde, maaldeel, 10), 'groter dan 10 vraagt gebied vanaf 100');
  assert.ok(kaartZichtbaar(wiskunde, maaldeel, 1000));
  assert.deepEqual(zichtbareChips(wiskunde, optellen, staat, 10).map(c => c.id), ['nul'], 'tot 10 is er geen brug, wel een keuze voor bewerkingen met 0');
  assert.ok(zichtbareChips(wiskunde, optellen, staat, 100).some(c => c.id === 'brug'));
  const tafels = nieuweKaartStaat(wiskunde, kaartVan('maaltafels'));
  assert.ok(zichtbareChips(wiskunde, kaartVan('maaltafels'), tafels, 100).some(c => c.id === 'tafels'));
  assert.ok(kanLeveren(wiskunde, 'optellen', 20, { brug: 'met' }));
  assert.ok(!kanLeveren(wiskunde, 'optellen', 10, { brug: 'met' }));
});

test('de live voorbeeldoefening volgt de chips', () => {
  const k = kaartVan('optellen'), staat = nieuweKaartStaat(wiskunde, k);
  staat.chips['optellen/brug'] = 'met';
  for (let seed = 1; seed < 12; seed++) { const o = voorbeeldOefening(wiskunde, k, staat, 100, seed); assert.ok(o.data.brug); }
  staat.vorm = 'optellen-juist-fout'; staat.chips = { ...staat.chips };
  assert.ok(voorbeeldOefening(wiskunde, k, staat, 100, 1).tekst.includes('juist'));
});

/* ------------------------------------------------------------------ stipoefeningen en bewerkingen met 0 */
const cijfersVan = (n) => String(n).split('').reverse().map(Number);
function brugOnafhankelijk(op, a, b) {
  const x = cijfersVan(a), y = cijfersVan(b), len = Math.max(x.length, y.length);
  let cin = 0;
  for (let p = 0; p < len; p++) {
    const da = x[p] ?? 0, db = y[p] ?? 0;
    if (op === '+') { const s = da + db + cin; if (s > 10) return true; cin = s >= 10 ? 1 : 0; }
    else { if (da < db + cin) return true; cin = 0; }
  }
  return false;
}
const uit = (op, a, b) => (op === '+' ? a + b : a - b);
const stipVorm = (soort, vorm) => wiskunde.generators.find(g => g.id === `stip-${soort}-${vorm}`);
const maakStip = (soort, vorm, { gebied, chips = {}, seed = 3, aantal = 12 }) => {
  const g = stipVorm(soort, vorm);
  return g.genereer({ seed, aantal, gebied, opties: g.opties([], chips, null) });
};

test('stip in het midden en vooraan: het onbekende staat op de juiste plaats en het antwoord klopt', () => {
  for (const soort of ['midden', 'vooraan']) for (const gebied of [10, 20, 100, 1000]) for (const seed of [1, 2, 3]) {
    const { oefeningen } = maakStip(soort, 'invullen', { gebied, seed });
    assert.ok(oefeningen.length >= 3, `${soort} tot ${gebied}`);
    for (const o of oefeningen) {
      const d = o.data;
      assert.equal(uit(d.op, d.a, d.b), d.c); assert.ok(d.a >= 0 && d.b >= 0 && d.c >= 0 && Math.max(d.a, d.b, d.c) <= gebied);
      assert.equal(o.tekst, soort === 'midden' ? `${d.a} ${d.op} ____ = ${d.c}` : `____ ${d.op} ${d.b} = ${d.c}`);
      assert.equal(Number(o.antwoord), soort === 'midden' ? d.b : d.a);
      assert.equal(o.volledig, `${d.a} ${d.op} ${d.b} = ${d.c}`);
    }
    assert.equal(new Set(oefeningen.map(o => o.sleutel)).size, oefeningen.length, 'geen dubbels in één blokje');
  }
});

test('stipoefeningen: de brugregel klopt (precies op het tiental landen is geen brug)', () => {
  assert.equal(brugOnafhankelijk('+', 17, 3), false); assert.equal(brugOnafhankelijk('+', 17, 5), true);
  assert.equal(brugOnafhankelijk('-', 35, 25), false); assert.equal(brugOnafhankelijk('-', 43, 17), true); assert.equal(brugOnafhankelijk('+', 59, 41), false);
  for (const soort of ['midden', 'vooraan']) for (const brug of ['zonder', 'met']) for (const gebied of [20, 100, 1000]) {
    const { oefeningen } = maakStip(soort, 'invullen', { gebied, chips: { brug, op: 'beide' } });
    assert.ok(oefeningen.length >= 3, `${soort} ${brug} ${gebied}`);
    for (const o of oefeningen) assert.equal(brugOnafhankelijk(o.data.op, o.data.a, o.data.b), brug === 'met', `${o.volledig} (${brug})`);
  }
  for (const op of ['optellen', 'aftrekken']) {
    const { oefeningen } = maakStip('midden', 'invullen', { gebied: 100, chips: { op } });
    assert.ok(oefeningen.every(o => o.data.op === (op === 'optellen' ? '+' : '-')));
  }
});

test('aanvullen: tot het gekozen getal, binnen het rekengebied', () => {
  for (const [tot, gebied, verwacht] of [['10', 20, [10]], ['20', 100, [20]], ['100', 1000, [100]], ['gebied', 20, [20]], ['gebied', 5, [5]]]) {
    const { oefeningen } = maakStip('aanvullen', 'invullen', { gebied, chips: { tot } });
    assert.ok(oefeningen.length >= 3, `${tot} ${gebied}`);
    for (const o of oefeningen) { assert.ok(verwacht.includes(o.data.T)); assert.equal(o.data.a + Number(o.antwoord), o.data.T); assert.ok(o.data.a >= 1 && o.data.a < o.data.T); assert.equal(o.tekst, `${o.data.a} + ____ = ${o.data.T}`); }
  }
  for (const [tot, stap] of [['volgend-tiental', 10], ['volgend-honderdtal', 100]]) {
    const { oefeningen } = maakStip('aanvullen', 'invullen', { gebied: 1000, chips: { tot } });
    assert.ok(oefeningen.length >= 3);
    for (const o of oefeningen) { assert.equal(o.data.T % stap, 0); assert.ok(o.data.T - o.data.a < stap && o.data.a % stap !== 0); }
  }
  assert.equal(maakStip('aanvullen', 'invullen', { gebied: 10, chips: { tot: '100' } }).oefeningen.length, 0, 'tot 100 kan niet in een gebied tot 10');
});

test('stipoefeningen: kiezen en juist-fout hebben geldige opties', () => {
  for (const soort of ['aanvullen', 'midden', 'vooraan']) {
    const kiezen = maakStip(soort, 'kiezen', { gebied: 100 }).oefeningen;
    for (const o of kiezen) { const d = o.data; assert.equal(d.opties[d.juist], d.antwoord); assert.equal(new Set(d.opties).size, d.opties.length); assert.equal(d.vraag.split('____').length, 2); }
    const jf = maakStip(soort, 'juist-fout', { gebied: 100 }).oefeningen;
    for (const o of jf) assert.equal(o.data.juist, o.data.getoond === o.data.antwoord);
    assert.ok(jf.some(o => o.data.juist) && jf.some(o => !o.data.juist));
  }
});

test('bewerkingen met 0: weglaten of erbij', () => {
  for (const soort of ['optellen', 'aftrekken']) {
    const g = wiskunde.generators.find(x => x.id === soort);
    for (const seed of [1, 2, 3, 4]) {
      const weg = g.genereer({ seed, aantal: 20, gebied: 100, opties: g.opties([], { brug: 'beide', nul: 'weg' }) }).oefeningen;
      assert.ok(weg.every(o => o.data.b > 0 && o.data.a > 0 && Number(o.volledig.split('=')[1]) > 0 || soort === 'aftrekken' && o.data.b > 0 && o.data.a > 0));
    }
    const erbij = [1, 2, 3, 4, 5, 6].flatMap(seed => g.genereer({ seed, aantal: 30, gebied: 100, opties: g.opties([], { brug: 'beide', nul: 'erbij' }) }).oefeningen);
    assert.ok(erbij.some(o => o.data.a === 0 || o.data.b === 0 || (soort === 'aftrekken' && o.data.a === o.data.b)), `${soort}: bewerkingen met 0 komen voor`);
    for (const o of erbij) { assert.ok(o.data.a >= 0 && o.data.b >= 0); assert.ok(uit(soort === 'optellen' ? '+' : '-', o.data.a, o.data.b) >= 0); assert.ok(o.data.a <= 100); }
  }
});

test('bewerkingen binnen het rekengebied: optellen en aftrekken tot 5, 10 en 20', () => {
  for (const gebied of [5, 10, 20]) for (const soort of ['optellen', 'aftrekken']) {
    const g = wiskunde.generators.find(x => x.id === soort), { oefeningen } = g.genereer({ seed: 5, aantal: 10, gebied, opties: g.opties([], { brug: 'beide' }) });
    assert.ok(oefeningen.length >= 3, `${soort} tot ${gebied}`);
    for (const o of oefeningen) { const c = uit(soort === 'optellen' ? '+' : '-', o.data.a, o.data.b); assert.ok(c >= 0 && c <= gebied && o.data.a <= gebied); }
  }
});

test('STANDAARD blijft 3 blokken van 6 voor de doelen-modus', () => { assert.deepEqual(STANDAARD, { blokken: 3, aantal: 6 }); });

test('de doelen-modus gebruikt dezelfde blokjes: breedte volgens de kaart, en het blad is in blokjes verder aan te passen', async () => {
  const { planModel, kaartBreedte } = await import('../js/core/blad-model.js');
  const m = planModel(wiskunde, { doelen: ['2.2.GL2.28'], seed: 3, gebied: 100 });
  assert.ok(m.blokken.length >= 2);
  for (const b of m.blokken) assert.equal(b.breedte, kaartBreedte(wiskunde, b.vorm), b.vorm);
  assert.equal(kaartBreedte(wiskunde, 'optellen'), 1); assert.equal(kaartBreedte(wiskunde, 'klok-aflezen'), 4);
  const { model: terug } = modelUitCode(wiskunde, losOp(wiskunde, m).code);
  voegBlokjeToe(wiskunde, terug, { vormId: 'stip-midden-invullen', gebied: 100, opties: {}, aantal: 5, seed: 9 });
  voegHulpToe(terug, { hulp: 'pagina' });
  assert.equal(losOp(wiskunde, terug).blokken.length, m.blokken.length + 2);
});

/* ------------------------------------------------------------------ cijferen */
const gen = (id) => wiskunde.generators.find(g => g.id === id);
const maakCijfer = (id, gebied, keuzes = {}, seed = 3, aantal = 10) => { const g = gen(id); return g.genereer({ seed, aantal, gebied, opties: g.opties([], keuzes) }).oefeningen; };
const cijfersTekst = (svg, attr) => [...svg.markup.matchAll(new RegExp(`data-${attr}="(\\d+)">(\\d)</text>`, 'g'))].sort((x, y) => Number(y[1]) - Number(x[1])).map(m => m[2]).join('');
// onafhankelijk narekenen met een kolomalgoritme op tekst
const kolomOptellen = (termen) => { const n = Math.max(...termen.map(t => String(t).length)); let cin = 0; const carries = []; for (let k = 0; k < n; k++) { const s = termen.reduce((x, t) => x + Number(String(t).padStart(n, '0')[n - 1 - k]), 0) + cin; cin = Math.floor(s / 10); carries.push(cin); } return carries; };

test('cijferen: de antwoorden en onthoudcijfers kloppen en de leerlingenversie verklapt niets', () => {
  for (const [id, op] of [['cijferen-optellen', '+'], ['cijferen-aftrekken', '-'], ['cijferen-maal-een', '×'], ['cijferen-maal-twee', '××']]) for (const gebied of [100, 1000, 10000]) for (const seed of [1, 2, 3]) {
    const lijst = maakCijfer(id, gebied, {}, seed);
    if (id === 'cijferen-maal-twee' && gebied < 1000) { assert.equal(lijst.length, 0); continue; }
    assert.ok(lijst.length >= 3, `${id} tot ${gebied}`);
    assert.equal(new Set(lijst.map(o => o.sleutel)).size, lijst.length);
    for (const o of lijst) {
      const d = o.data;
      const verwacht = { '+': () => d.termen.reduce((x, y) => x + y, 0), '-': () => d.a - d.b, '×': () => d.a * d.b, '××': () => d.a * d.b }[op]();
      assert.equal(Number(o.antwoord), verwacht); assert.ok(verwacht <= gebied && verwacht > 0, `${id}: ${o.volledig}`);
      assert.ok(!/data-(antwoord|deel|onthoud)=/.test(o.svg.markup), 'leerlingenversie zonder antwoorden');
      assert.equal(cijfersTekst(o.antwoordSvg, 'antwoord'), String(verwacht), 'het antwoord staat in het rooster');
      if (op === '+') { assert.deepEqual(d.onthouden, kolomOptellen(d.termen)); assert.ok(d.termen.every(t => t >= 10)); }
      if (op === '-') {
        assert.ok(d.a > d.b && d.a >= 10);
        // lenen: met de nieuwe cijfers van het eerste getal is elk cijfer van het antwoord 0 tot 9 en klopt het verschil
        const x = String(d.a).split('').reverse().map(Number), y = String(d.b).split('').reverse().map(Number), nieuw = x.map((c, k) => d.leen[k] ?? c);
        const uitkomst = nieuw.map((c, k) => c - (y[k] ?? 0));
        assert.ok(uitkomst.every(c => c >= 0 && c <= 9), `${o.volledig}: ${uitkomst}`);
        assert.equal(Number(uitkomst.reverse().join('')), d.a - d.b);
        assert.ok(nieuw.reduce((s2, c, k) => s2 + c * 10 ** k, 0) === d.a, 'leen verplaatst enkel waarde van de ene kolom naar de andere');
        d.leen.forEach((w, k) => { if (w === null) return; assert.notEqual(w, x[k]); assert.ok(w >= 0 && w <= 19); });
        const verwachtLeen = x.some((c, k) => c < (y[k] ?? 0)) || x.some((c, k) => { let bin = 0; return false; });
        if (!verwachtLeen) assert.ok(d.leen.every(w => w === null));
        assert.deepEqual([...o.antwoordSvg.markup.matchAll(/data-onthoud="(\d+)">(\d+)</g)].map(m => Number(m[2])).sort(), d.leen.filter(w => w !== null).sort(), 'de lenen-vakjes tonen de nieuwe waarden');
      }
      if (op === '×') { assert.ok(d.b >= 2 && d.b <= 9); let cin = 0; String(d.a).split('').reverse().forEach((c, k) => { cin = Math.floor((Number(c) * d.b + cin) / 10); assert.equal(d.onthouden[k], cin); }); }
      if (op === '××') { assert.equal(d.deel1, d.a * (d.b % 10)); assert.equal(d.deel2, d.a * Math.floor(d.b / 10) * 10); assert.equal(d.deel1 + d.deel2, d.product); assert.equal([...o.antwoordSvg.markup.matchAll(/data-deel="\d+">(\d)</g)].map(m => m[1]).join(''), `${d.deel1}${d.deel2}`); }
    }
  }
});

test('cijferen: onthouden zonder, met of beide', () => {
  for (const id of ['cijferen-optellen', 'cijferen-aftrekken', 'cijferen-maal-een']) {
    const zonder = maakCijfer(id, 1000, { onthouden: 'zonder' }), met = maakCijfer(id, 1000, { onthouden: 'met' }), beide = [1, 2, 3, 4].flatMap(s => maakCijfer(id, 1000, { onthouden: 'beide' }, s));
    assert.ok(zonder.length >= 3 && met.length >= 3);
    const leeg = (o) => (o.data.onthouden || o.data.leen.map(w => w ?? 0)).every(c => c === 0);
    assert.ok(zonder.every(o => !o.data.heeft && leeg(o)), `${id} zonder`);
    assert.ok(met.every(o => o.data.heeft && !leeg(o)), `${id} met`);
    assert.ok(beide.some(o => o.data.heeft) && beide.some(o => !o.data.heeft), `${id} beide`);
  }
  assert.ok(maakCijfer('cijferen-optellen', 1000, { termen: '3' }).every(o => o.data.termen.length === 3));
  assert.equal(maakCijfer('cijferen-optellen', 20).length, 0, 'cijferen vraagt een rekengebied vanaf 100');
});

test('cijferen: de kaarten staan in het palet en de doelen zijn gekoppeld', () => {
  const kaarten = bouwKaarten(wiskunde).filter(k => k.domein === 'Cijferen');
  assert.equal(kaarten.length, 4);
  const doelen = new Set(gen('cijferen-optellen').doelen);
  for (const c of ['2.2.GL3.45', '2.2.GL3.46', '2.2.GL4.48', '2.2.GL4.49']) assert.ok(doelen.has(c) && DOELEN.some(d => d.code === c), c);
  assert.ok(!kaartZichtbaar(wiskunde, kaarten[0], 20) && kaartZichtbaar(wiskunde, kaarten[0], 100));
});

/* ------------------------------------------------------------------ klok en geld */
test('klok in woorden: over of na, en het halve uur of het hele uur als anker', async () => {
  const { uitspreken } = await import('../js/subjects/wiskunde/generators/tijd-vormen.js');
  const verwachtHalf = ['vier uur', 'vijf over vier', 'tien over vier', 'kwart over vier', 'tien voor half vijf', 'vijf voor half vijf', 'half vijf', 'vijf over half vijf', 'tien over half vijf', 'kwart voor vijf', 'tien voor vijf', 'vijf voor vijf'];
  const verwachtHeel = ['vier uur', 'vijf over vier', 'tien over vier', 'kwart over vier', 'twintig over vier', 'vijfentwintig over vier', 'half vijf', 'vijfentwintig voor vijf', 'twintig voor vijf', 'kwart voor vijf', 'tien voor vijf', 'vijf voor vijf'];
  for (let i = 0; i < 12; i++) {
    assert.equal(uitspreken(4, i * 5), verwachtHalf[i]); assert.equal(uitspreken(4, i * 5, 'over', 'half'), verwachtHalf[i]);
    assert.equal(uitspreken(4, i * 5, 'over', 'heel'), verwachtHeel[i]);
    assert.equal(uitspreken(4, i * 5, 'na', 'heel'), verwachtHeel[i].replace(/ over /, ' na '));
    assert.equal(uitspreken(4, i * 5, 'na', 'half'), verwachtHalf[i].replace(/ over /, ' na '));
  }
  const g = gen('klok-uitspreken'), lijst = g.genereer({ seed: 2, aantal: 12, gebied: 12, opties: g.opties([], { nauwkeurigheid: 'vijf', over: 'na', anker: 'heel' }) }).oefeningen;
  assert.ok(lijst.length >= 5 && lijst.every(o => o.data.woorden === uitspreken(o.data.h, o.data.m, 'na', 'heel')));
  assert.ok(lijst.every(o => !/ over /.test(o.data.woorden)) && lijst.some(o => / na /.test(o.data.woorden)));
  const kaart = bouwKaarten(wiskunde).find(k => k.id === 'klok'), staat = { ...nieuweKaartStaat(wiskunde, kaart), vorm: 'klok-uitspreken' };
  assert.deepEqual(zichtbareChips(wiskunde, kaart, staat, 12).map(c => c.id).sort(), ['anker', 'nauwkeurigheid', 'over']);
});

test('klok: de uurwijzer draait mee met de minuten', async () => {
  const { klok } = await import('../js/subjects/wiskunde/svg.js');
  const hoek = (svg, wijzer) => Number([...svg.markup.matchAll(/rotate\(([\d.]+) 88 88\)/g)][wijzer][1]);
  assert.equal(hoek(klok({ h: 3, m: 30 }), 0), 105);            // tussen de 3 en de 4
  assert.equal(hoek(klok({ h: 2, m: 30 }), 0), 75);             // bij half drie tussen 2 en 3
  assert.equal(hoek(klok({ h: 3, m: 0 }), 0), 90); assert.equal(hoek(klok({ h: 3, m: 30 }), 1), 180);
});

test('geld: notatie instelbaar, geen munten van 1 en 2 cent, wisselgeld met het eerstvolgende effen bedrag', async () => {
  const geld = await import('../js/subjects/wiskunde/generators/geld.js');
  assert.ok(geld.WAARDEN[4].every(c => c !== 1 && c !== 2));
  const g = gen('geld-totaalprijs'), kort = g.genereer({ seed: 1, aantal: 6, gebied: 100, opties: g.opties([], { nauwkeurigheid: '4' }) }).oefeningen;
  assert.ok(kort.every(o => /^€ \d+,\d\d$/.test(o.antwoord)));
  const lang = g.genereer({ seed: 1, aantal: 6, gebied: 100, opties: g.opties([], { nauwkeurigheid: '4', notatie: 'woorden' }) }).oefeningen;
  assert.ok(lang.every(o => /^(\d+ euro( en \d+ eurocent)?|\d+ eurocent)$/.test(o.antwoord) && !o.tekst.includes('€')), lang[0].antwoord);
  assert.deepEqual(lang.map(o => o.data.totaal), kort.map(o => o.data.totaal), 'enkel de notatie verschilt');
  assert.ok(g.genereer({ seed: 1, aantal: 3, gebied: 100, opties: g.opties([], { nauwkeurigheid: '4' }) }).oefeningen[0].antwoord.startsWith('€'), 'na een woordenblokje is de notatie weer € ');
  assert.equal(geld.BETALING_KEUZE.standaard, 'vrij');
  for (const [betaling, niveau] of [['biljet', '3'], ['euro', '3'], ['euro', '4'], ['biljet', '1']]) {
    const w = gen('geld-wisselgeld'), lijst = w.genereer({ seed: 4, aantal: 8, gebied: 100, opties: w.opties([], { nauwkeurigheid: niveau, betaling }) }).oefeningen;
    assert.ok(lijst.length >= 3, `${betaling} ${niveau}`);
    for (const o of lijst) {
      const { betaald, prijs, terug } = o.data;
      assert.equal(betaald * 100 - prijs, terug); assert.ok(prijs > 0 && terug > 0);
      if (betaling === 'euro') { assert.equal(betaald, Math.ceil(prijs / 100)); assert.notEqual(prijs % 100, 0); }
      if (betaling === 'biljet') assert.ok([1, 2, 5, 10, 20, 50, 100, 200].includes(betaald) && ![1, 2, 5, 10, 20, 50, 100, 200].some(b => b < betaald && b * 100 > prijs));
      const stappen = geld.aanvulStappen(prijs, betaald * 100);
      assert.equal(stappen.reduce((x, s) => x + s.plus, 0), terug); assert.equal(stappen[0].van, prijs); assert.equal(stappen[stappen.length - 1].naar, betaald * 100);
      assert.ok(o.volledig.includes('Aanvullen:'));
    }
  }
  const vrij = gen('geld-wisselgeld').genereer({ seed: 4, aantal: 6, gebied: 100, opties: gen('geld-wisselgeld').opties([], { nauwkeurigheid: '2' }) }).oefeningen;
  assert.ok(vrij.every(o => !o.volledig.includes('Aanvullen:')), 'zonder keuze blijft het gedrag zoals voorheen');
});
