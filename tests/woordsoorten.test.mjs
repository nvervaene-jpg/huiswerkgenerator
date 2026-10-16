import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOORTEN, WOORDEN, ZINNEN } from '../js/subjects/taal/woorden/woordsoorten.js';
import { WOORDSOORTEN_VORMEN, NIVEAU, DOELEN, woordenVoor } from '../js/subjects/taal/generators/woordsoorten.js';

// Gesloten woordsoorten: eigen lijsten in de test, los van de data (alles wat in de data staat moet hierin voorkomen).
const GESLOTEN = {
  lw: ['de', 'het', 'een'],
  vz: ['in', 'op', 'onder', 'naast', 'achter', 'tussen', 'boven', 'bij', 'naar', 'met', 'zonder', 'aan', 'om', 'voor', 'over', 'door', 'van', 'uit', 'tot'],
  vw: ['en', 'maar', 'want', 'omdat', 'of', 'terwijl', 'hoewel', 'dus', 'als', 'dat', 'toen'],
  vnw: ['ik', 'jij', 'hij', 'zij', 'wij', 'jullie', 'mijn', 'jouw', 'hem', 'ze', 'haar', 'ons', 'onze', 'zijn', 'hun', 'je', 'u'],
};
const TELWOORDEN = ['twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'twintig', 'honderd', 'eerste', 'tweede', 'derde', 'vierde'];
const label = Object.fromEntries(SOORTEN.map(s => [s.id, s.label]));
const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);

test('woordsoorten: losse woorden zijn uniek en kloppen met de gesloten woordsoorten', () => {
  const gezien = new Map();
  for (const [soort, lijst] of Object.entries(WOORDEN)) {
    assert.ok(label[soort], soort); assert.ok(lijst.length >= 3, `${soort}: te weinig woorden`);
    for (const w of lijst) {
      assert.ok(!gezien.has(w.toLowerCase()), `${w} staat bij ${soort} en ${gezien.get(w.toLowerCase())}`); gezien.set(w.toLowerCase(), soort);
      if (GESLOTEN[soort]) assert.ok(GESLOTEN[soort].includes(w), `${w} is geen ${label[soort]}`);
      if (soort === 'tel') assert.ok(TELWOORDEN.includes(w), w);
      if (soort === 'eig') assert.match(w, /^[A-Z]/, `${w}: een eigennaam begint met een hoofdletter`);
      else assert.match(w, /^[a-zé]/, `${w}: geen hoofdletter`);
      if (soort === 'ww') assert.match(w, /en$/, `${w}: werkwoorden staan in de hele werkwoord (infinitief)`);
    }
  }
  assert.deepEqual(Object.keys(WOORDEN).sort(), SOORTEN.map(s => s.id).sort());
});

test('woordsoorten: elke zin heeft een woordsoort per woord en volgt de gesloten woordsoorten', () => {
  assert.ok(ZINNEN.length >= 35);
  const tel = {};
  for (const zin of ZINNEN) {
    assert.ok(zin.length >= 3);
    for (const [woord, soort] of zin) {
      assert.ok(label[soort] || soort === 'x', `${zin.map(t => t[0]).join(' ')}: onbekende soort ${soort}`);
      tel[soort] = (tel[soort] || 0) + 1;
      const w = woord.toLowerCase();
      if (GESLOTEN[soort]) assert.ok(GESLOTEN[soort].includes(w), `${woord} is geen ${label[soort]}`);
      for (const [s, lijst] of Object.entries(GESLOTEN)) if (lijst.includes(w) && !['het', 'een', 'dat', 'als', 'voor', 'om', 'zijn', 'je', 'ons', 'haar'].includes(w)) assert.equal(soort, s, `${woord} hoort bij ${s}`);
      if (soort === 'eig') assert.match(woord, /^[A-Z]/);
      if (soort === 'tel') assert.ok(TELWOORDEN.includes(w), woord);
    }
    // dezelfde woorden binnen één zin krijgen dezelfde soort
    const per = new Map(); for (const [w, s] of zin) { if (per.has(w.toLowerCase())) assert.equal(per.get(w.toLowerCase()), s); per.set(w.toLowerCase(), s); }
    assert.ok(zin.some(t => t[1] === 'ww'), `${zin.map(t => t[0]).join(' ')}: een zin heeft een werkwoord`);
  }
  for (const s of SOORTEN) assert.ok(tel[s.id] >= 4, `${s.id}: te weinig voorbeelden in zinnen (${tel[s.id] || 0})`);
});

test('woordsoorten: elk doel heeft een focus en kent enkel soorten die al aan bod kwamen', () => {
  assert.equal(DOELEN.length, 9);
  for (const [code, { focus, kennen }] of Object.entries(NIVEAU)) {
    assert.match(code, /^1\.5\.GL[2-6]\./); assert.ok(kennen.includes(focus), code);
    const jaar = +code.match(/GL(\d)/)[1];
    if (jaar < 3) assert.ok(!kennen.some(s => ['bn', 'tel', 'vz', 'vw', 'vnw'].includes(s)), `${code}: leerjaar 2 kent enkel zn, lw, eig, ww`);
    if (jaar < 4) assert.ok(!kennen.some(s => ['vz', 'vw', 'vnw'].includes(s)), code);
    if (jaar < 6) assert.ok(!kennen.includes('vnw'), code);
  }
  assert.deepEqual([...new Set(woordenVoor({ doelen: ['1.5.GL2.28'] }).map(w => w.soort))].sort(), ['eig', 'lw', 'ww', 'zn']);
  assert.equal(new Set(woordenVoor({ doelen: ['1.5.GL6.11'] }).map(w => w.soort)).size, 9);
});

// Controleert één oefening tegen de brongegevens.
const WOORD_SOORT = new Map(Object.entries(WOORDEN).flatMap(([s, l]) => l.map(w => [w, s])));
const zinTekst = (z) => z.map(t => t[0]).join(' ');
const zinVan = (tekst) => ZINNEN.find(z => zinTekst(z) === tekst);
const verifieer = {
  'ws-regel': (d, o, kennen) => {
    assert.equal(WOORD_SOORT.get(d.woord), d.soort); assert.equal(o.antwoord, label[d.soort]);
    assert.ok(d.soorten.includes(d.soort) && d.soorten.length >= 2 && d.soorten.length <= 4 && d.soorten.every(s => kennen.includes(s)));
    assert.ok(d.soorten.every(s => o.tekst.includes(label[s])) && o.tekst.startsWith(d.woord));
  },
  'ws-ongelijk': (d, o, kennen) => {
    assert.equal(d.woorden.length, 4); assert.equal(new Set(d.woorden.map(w => w.woord)).size, 4);
    for (const w of d.woorden) { assert.equal(WOORD_SOORT.get(w.woord), w.soort); assert.ok(o.tekst.includes(w.woord)); assert.ok(kennen.includes(w.soort)); }
    const soorten = d.woorden.map(w => w.soort), vreemd = d.woorden.filter(w => soorten.filter(s => s === w.soort).length === 1);
    assert.equal(vreemd.length, 1); assert.equal(o.antwoord, vreemd[0].woord); assert.notEqual(vreemd[0].soort, d.meeste);
  },
  'ws-onderstrepen': (d, o) => {
    const zin = zinVan(d.zin); assert.ok(zin, d.zin);
    assert.deepEqual(zin.filter(t => t[1] === d.soort).map(t => t[0]), d.gevraagd); assert.equal(o.antwoord, d.gevraagd.join(', '));
    assert.ok(d.gevraagd.length >= 1 && o.tekst.includes(d.zin));
    if (d.soort === 'zn') assert.ok(!zin.some(t => t[1] === 'eig'), 'zelfstandige naamwoorden en eigennamen niet door elkaar');
  },
  'ws-zin-soort': (d, o, kennen) => {
    const zin = zinVan(d.zin); assert.ok(zin, d.zin);
    const tags = new Set(zin.filter(t => t[0] === d.woord).map(t => t[1])); assert.deepEqual([...tags], [d.soort]);
    assert.equal(o.antwoord, label[d.soort]); assert.ok(kennen.includes(d.soort) && d.soorten.includes(d.soort) && d.soorten.every(s => kennen.includes(s)));
    assert.ok(o.tekst.includes(`'${d.woord}'`) && o.tekst.includes(d.zin));
  },
  'ws-sorteren': (d, o) => {
    assert.equal(d.rijen.length, 2); assert.equal(d.woorden.length, 6); assert.equal(new Set(d.woorden).size, 6);
    for (const rij of d.rijen) { assert.equal(rij.woorden.length, 3); for (const w of rij.woorden) assert.equal(WOORD_SOORT.get(w), rij.soort); }
    assert.ok(d.rijen.every(r => o.antwoord.includes(label[r.soort])) && d.woorden.every(w => o.tekst.includes(w)));
  },
};

for (const v of WOORDSOORTEN_VORMEN) {
  test(`${v.id}: antwoorden kloppen, geen dubbels, per doel op het juiste niveau`, () => {
    for (const code of DOELEN) {
      const { focus, kennen } = NIVEAU[code];
      for (const seed of SEEDS) {
        const opties = v.opties(DOELEN, {}, code); assert.deepEqual([opties.doel, opties.focus], [code, focus]);
        const { oefeningen } = v.genereer({ seed, aantal: 6, opties });
        assert.ok(oefeningen.length >= 3, `${v.id} ${code} seed ${seed}: slechts ${oefeningen.length} oefeningen`);
        assert.equal(new Set(oefeningen.map(o => o.sleutel)).size, oefeningen.length);
        for (const o of oefeningen) { assert.ok(o.tekst && o.antwoord && o.volledig); verifieer[o.data.type](o.data, o, kennen); }
        assert.deepEqual(v.genereer({ seed, aantal: 6, opties }), v.genereer({ seed, aantal: 6, opties }));
      }
    }
  });
}

test('woordsoorten: de oefeningen draaien rond de woordsoort van het doel', () => {
  const [, ongelijk, onderstrepen] = WOORDSOORTEN_VORMEN;
  for (const code of DOELEN) {
    const { focus } = NIVEAU[code], opties = onderstrepen.opties(DOELEN, {}, code);
    for (const o of onderstrepen.genereer({ seed: 9, aantal: 6, opties }).oefeningen) assert.equal(o.data.soort, focus);
  }
  assert.ok(ongelijk.genereer({ seed: 2, aantal: 6, opties: ongelijk.opties(DOELEN, {}, '1.5.GL2.28') }).oefeningen.some(o => o.data.meeste === 'zn'));
});
