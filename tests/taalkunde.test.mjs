import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZINSOORTEN, ALFABET_WOORDEN, SYNONIEMEN, ANTONIEMEN, PERSOONSVORM_ZINNEN } from '../js/subjects/taal/woorden/taalkunde.js';
import { TAALKUNDE_VORMEN, ALFABET } from '../js/subjects/taal/generators/taalkunde.js';

const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);

test('zinsoorten: het leesteken past bij de soort zin', () => {
  const teken = { m: '.', v: '?', u: '!' }, alle = new Set();
  for (const [soort, lijst] of Object.entries(ZINSOORTEN)) {
    assert.ok(lijst.length >= 6, soort);
    for (const z of lijst) {
      assert.ok(z.endsWith(teken[soort]) && !/[.?!].*[.?!]$/.test(z), z); assert.ok(!alle.has(z), `dubbel: ${z}`); alle.add(z); assert.match(z, /^[A-Z]/);
      if (soort === 'u') assert.match(z, /^(Wat|Hoera)/, `${z}: een uitroepende zin moet zonder het uitroepteken ook duidelijk uitroepend zijn`);
      if (soort === 'v') assert.match(z, /^(Waar|Hoe|Wie|Wanneer|Waarom|Wat|Mag|Heb|Is|Kan|Wil)\b/, z);
      if (soort === 'm') assert.ok(!/^(Wat|Hoe|Waar|Wie|Wanneer|Waarom|Hoera)\b/.test(z), z);
    }
  }
});

test('alfabet: woorden zijn uniek, in kleine letters, en er zijn genoeg woorden met dezelfde beginletter', () => {
  assert.equal(new Set(ALFABET_WOORDEN).size, ALFABET_WOORDEN.length);
  for (const w of ALFABET_WOORDEN) assert.match(w, /^[a-z]{2,}$/, w);
  const perLetter = {}; for (const w of ALFABET_WOORDEN) perLetter[w[0]] = (perLetter[w[0]] || 0) + 1;
  assert.ok(Object.values(perLetter).filter(n => n >= 4).length >= 3);
  assert.equal(ALFABET, 'abcdefghijklmnopqrstuvwxyz');
});

test('synoniemen en antoniemen: elk woord komt één keer voor en een paar bestaat uit twee verschillende woorden', () => {
  for (const [naam, lijst] of [['syn', SYNONIEMEN], ['ant', ANTONIEMEN]]) {
    const woorden = lijst.flatMap(p => [p[0], p[1]]);
    assert.equal(new Set(woorden).size, woorden.length, `${naam}: een woord staat in twee paren`);
    for (const p of lijst) assert.notEqual(p[0], p[1]);
    assert.ok(lijst.length >= 12, naam);
  }
  assert.ok(ANTONIEMEN.every(p => p[2]), 'elk antoniemenpaar heeft een domein');
  const domeinen = ANTONIEMEN.reduce((m, p) => ({ ...m, [p[2]]: (m[p[2]] || 0) + 1 }), {});
  assert.ok(Object.keys(domeinen).length >= 8);
});

test('persoonsvorm en onderwerp: de gemarkeerde delen staan in de zin en de persoonsvorm komt overeen met het onderwerp', () => {
  const MEERVOUD = /^(wij|jullie|zij)$|^(de kinderen|de vogels|tom en lotte)$/i;
  assert.ok(PERSOONSVORM_ZINNEN.length >= 15);
  const gezien = new Set();
  for (const z of PERSOONSVORM_ZINNEN) {
    assert.ok(!gezien.has(z.tekst)); gezien.add(z.tekst);
    assert.ok(z.tekst.includes(z.pv) && z.tekst.includes(z.onderwerp), z.tekst);
    assert.ok(z.tekst.endsWith('.') && /^[A-Z]/.test(z.tekst));
    assert.ok(z.tekst.split(/\W+/).filter(w => w === z.pv).length === 1, `${z.tekst}: de persoonsvorm komt twee keer voor`);
    if (MEERVOUD.test(z.onderwerp)) assert.match(z.pv, /(en|an)$/, `${z.tekst}: meervoud, dus de persoonsvorm is de hele werkwoord`);
    else if (/^ik$/i.test(z.onderwerp)) assert.ok(!/t$/.test(z.pv) || z.pv === 'zwom', z.tekst);
    else if (/^jij$/i.test(z.onderwerp)) assert.equal(z.pv, 'bent');
    else assert.match(z.pv, /t$/, `${z.tekst}: enkelvoud derde persoon krijgt een -t`);
    // het onderwerp staat vooraan, of na de persoonsvorm als er iets anders voor staat (bij omzetting)
    const iPv = z.tekst.indexOf(z.pv), iOnd = z.tekst.indexOf(z.onderwerp);
    if (iOnd > iPv) assert.ok(iPv > 0, `${z.tekst}: onderwerp na persoonsvorm zonder zinsdeel ervoor`);
    else assert.ok(z.tekst.startsWith(z.onderwerp) || iPv > iOnd, z.tekst);
  }
  assert.ok(PERSOONSVORM_ZINNEN.some(z => z.tekst.indexOf(z.pv) < z.tekst.indexOf(z.onderwerp)), 'ook zinnen waarin de persoonsvorm voor het onderwerp staat');
});

const verifieer = {
  'zs-soort': (d, o) => {
    const alle = Object.entries(ZINSOORTEN).flatMap(([s, l]) => l.map(z => [z, s])); assert.deepEqual(alle.find(([z]) => z === d.zin), [d.zin, d.soort]);
    assert.equal(o.antwoord, { m: 'mededelende zin', v: 'vragende zin', u: 'uitroepende zin' }[d.soort]); assert.ok(o.tekst.startsWith(d.zin));
  },
  'zs-leesteken': (d, o) => {
    assert.equal(d.zonder + o.antwoord, ZINSOORTEN[d.soort].find(z => z.startsWith(d.zonder)));
    assert.equal(o.antwoord, { m: '.', v: '?', u: '!' }[d.soort]); assert.ok(!/[.?!]$/.test(d.zonder) && o.tekst.includes('____'));
  },
  'az-letters': (d, o) => {
    assert.equal(d.reeks.join(''), ALFABET.slice(ALFABET.indexOf(d.reeks[0]), ALFABET.indexOf(d.reeks[0]) + d.reeks.length));
    assert.ok(d.gaten.length >= 1 && d.gaten.length <= 2 && d.gaten.every(i => i > 0 && i < d.reeks.length - 1), 'een gat staat nooit aan het uiteinde');
    assert.equal(o.antwoord, d.gaten.map(i => d.reeks[i]).join(', ')); assert.equal((o.tekst.match(/__/g) || []).length, d.gaten.length);
    assert.ok(d.reeks.every((l, i) => d.gaten.includes(i) || o.tekst.includes(l)));
  },
  'az-woorden': (d, o) => {
    assert.equal(d.woorden.length, 4); assert.equal(new Set(d.woorden).size, 4);
    const goed = [...d.woorden].sort((a, b) => a.localeCompare(b, 'nl')); assert.deepEqual(d.juist, goed); assert.equal(o.antwoord, goed.join(', '));
    assert.notDeepEqual(d.woorden, goed, 'de woorden staan al in de goede volgorde');
    const letters = d.woorden.map(w => w[0]);
    assert.equal(new Set(letters).size, d.zelfdeBeginletter ? 1 : 4);
    d.woorden.forEach(w => assert.ok(ALFABET_WOORDEN.includes(w)));
  },
  'kies': (d, o, pre) => {
    const bron = pre === 'sy' ? SYNONIEMEN : ANTONIEMEN;
    const p = bron.find(x => x[0] === d.woord || x[1] === d.woord); assert.ok(p, d.woord);
    assert.equal(d.juist, p[0] === d.woord ? p[1] : p[0]); assert.equal(o.antwoord, d.juist);
    assert.equal(d.opties.length, 3); assert.equal(new Set(d.opties).size, 3); assert.ok(d.opties.includes(d.juist) && !d.opties.includes(d.woord));
    const overig = d.opties.filter(x => x !== d.juist);
    for (const x of overig) { const q = bron.find(y => y[0] === x || y[1] === x); assert.ok(q, x); assert.ok(q !== p, `${x} is een afleider uit hetzelfde paar`); if (pre === 'an') assert.notEqual(q[2], p[2], `${x} komt uit hetzelfde domein als ${d.woord}`); }
  },
  'verbind': (d, o, pre) => {
    const bron = pre === 'sy' ? SYNONIEMEN : ANTONIEMEN;
    assert.equal(d.paren.length, 4);
    for (const [a, b] of d.paren) assert.ok(bron.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)), `${a} - ${b}`);
    assert.equal(new Set(d.paren.flat()).size, 8); assert.equal((o.antwoordSvg.markup.match(/<line /g) || []).length, 4); assert.equal((o.svg.markup.match(/<line /g) || []).length, 0);
    if (pre === 'an') assert.equal(new Set(d.paren.map(([a, b]) => ANTONIEMEN.find(p => p[0] === a || p[1] === a)[2])).size, 4, 'vier verschillende domeinen');
  },
  'ps-pv': (d, o) => { const z = PERSOONSVORM_ZINNEN.find(x => x.tekst === d.zin); assert.equal(d.pv, z.pv); assert.equal(o.antwoord, z.pv); },
  'ps-ond': (d, o) => { const z = PERSOONSVORM_ZINNEN.find(x => x.tekst === d.zin); assert.equal(d.onderwerp, z.onderwerp); assert.equal(o.antwoord, z.onderwerp); },
};

for (const v of TAALKUNDE_VORMEN) {
  test(`${v.id}: antwoorden kloppen met de gegevens, geen dubbels, herhaalbaar`, () => {
    
    for (const doel of v.doelen) for (const seed of SEEDS) {
      const opties = v.opties(v.doelen, {}, doel), res = v.genereer({ seed, aantal: 6, opties });
      assert.equal(opties.doel, doel);
      assert.ok(res.oefeningen.length >= 3, `${v.id} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) {
        assert.ok(o.antwoord && o.volledig);
        const t = o.data.type, soort = t.endsWith('-kies') && /^(sy|an)-/.test(t) ? 'kies' : t.endsWith('-verbind') ? 'verbind' : t;
        verifieer[soort](o.data, o, v.id.slice(0, 2));
      }
      assert.deepEqual(v.genereer({ seed, aantal: 6, opties }), res);
    }
  });
}

test('taalkunde: elke vorm hoort bij de juiste Op.stap-doelen', () => {
  const doelenVan = Object.fromEntries(TAALKUNDE_VORMEN.map(v => [v.id, v.doelen]));
  assert.deepEqual(doelenVan['zs-soort'], ['1.5.GL2.41']); assert.deepEqual(doelenVan['zs-leesteken'], ['1.5.GL1.8', '1.5.GL2.42']);
  assert.deepEqual(doelenVan['az-letters'], ['1.5.GL2.12']); assert.deepEqual(doelenVan['az-woorden'], ['1.5.GL3.10']);
  assert.deepEqual(doelenVan['sy-kies'], ['1.5.GL2.4']); assert.deepEqual(doelenVan['an-kies'], ['1.5.GL3.5']);
  assert.deepEqual(doelenVan['ps-persoonsvorm'], ['1.5.GL4.25']); assert.deepEqual(doelenVan['ps-onderwerp'], ['1.5.GL4.26']);
});
