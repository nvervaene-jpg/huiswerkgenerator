import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GENERATORS } from '../js/subjects/wiskunde/generators/index.js';
import { FACTOR } from '../js/subjects/wiskunde/generators/lengte.js';
import { vergelijkMoeilijkheid } from '../js/subjects/wiskunde/generators/hulp.js';
import { ICONEN_NAMEN } from '../js/core/icons.js';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { bouwBlad, bladUitCode } from '../js/core/worksheet.js';

const GEBIEDEN = [10, 20, 100, 1000, 10000];
const SEEDS = Array.from({ length: 25 }, (_, i) => i + 1);
const som = (l) => l.reduce((x, y) => x + y, 0);

// Onafhankelijke brugregels (andere rekenwijze dan de generator).
const brugOptellen = (a, b) => [1, 2, 3, 4, 5].some(k => (a % 10 ** k) + (b % 10 ** k) > 10 ** k);
const brugAftrekken = (a, b) => [1, 2, 3, 4, 5].some(k => (a % 10 ** k) < (b % 10 ** k));

const cijfers = (n) => String(n).split('').map(Number);
const PLAATS = ['E', 'T', 'H', 'D'];

// Controleert per soort oefening of het antwoord klopt, los van de generator.
const verifieer = {
  omzet: undefined,
  vergelijk: ({ a, b }, o) => assert.equal(o.antwoord, a < b ? '<' : a > b ? '>' : '='),
  orden: ({ getallen, stijgend }, o) => {
    const juist = [...getallen].sort((x, y) => (stijgend ? x - y : y - x));
    assert.equal(new Set(getallen).size, getallen.length);
    assert.equal(o.antwoord, juist.join(stijgend ? ' < ' : ' > '));
    assert.ok(getallen.some((v, i) => v !== juist[i]), 'staat al in de juiste volgorde');
  },
  as: ({ start, stap, weg }, o) => {
    assert.equal(o.antwoord, weg.map(i => start + i * stap).join(', '));
    assert.ok(weg.length >= 2 && weg.length <= 4);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 11 - weg.length, 'zichtbare getallen');
    assert.equal((o.svg.markup.match(/<rect /g) || []).length, weg.length, 'lege vakjes');
  },
  splits: ({ n, onderdelen, weg }, o) => {
    assert.equal(som(onderdelen), n);
    assert.equal(o.antwoord, String(onderdelen[weg]));
    assert.ok(o.tekst.includes('____') && !o.tekst.replace('____', '').includes('____'));
  },
  'pw-splits': ({ n }, o) => assert.equal(o.antwoord, cijfers(n).map((c, i, l) => `${c} ${PLAATS[l.length - 1 - i]}`).join(' + ')),
  'pw-samen': ({ n }, o) => assert.equal(o.antwoord, String(n)),
  'pw-cijfer': ({ n, plaats }, o) => assert.equal(o.antwoord, String(cijfers(n).reverse()[PLAATS.indexOf(plaats)])),
  'pw-mab': ({ n, h, t, e }, o) => {
    assert.equal(h * 100 + t * 10 + e, n);
    assert.equal((o.svg.markup.match(/fill="#bfe0f5"/g) || []).length, h);
    assert.equal((o.svg.markup.match(/fill="#f6d27a"/g) || []).length, t);
    assert.equal((o.svg.markup.match(/fill="#f4a3a3"/g) || []).length, e);
    assert.equal(o.antwoord, String(n));
  },
  maal: ({ x, y }, o) => assert.equal(o.antwoord, String(x * y)),
  deel: ({ p, t, k }, o) => { assert.equal(t * k, p); assert.equal(o.antwoord, String(k)); },
  'lengte-vergelijk': ({ v, a, w, b }, o) => {
    const x = v * FACTOR[a], y = w * FACTOR[b];
    assert.equal(o.antwoord, x < y ? '<' : x > y ? '>' : '=');
    assert.notEqual(a, b);
  },
  aflezen: ({ van, tot, lat }, o) => {
    assert.equal(o.antwoord, `${tot - van} cm`);
    assert.ok(van >= 0 && tot > van && tot <= lat);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, lat + 1, 'cijfers op de meetlat');
  },
};

// Varianten van opties waarmee elke generator getest wordt.
function varianten(gen) {
  const standaard = gen.opties ? gen.opties(gen.doelen, {}) : {};
  switch (gen.id) {
    case 'optellen': case 'aftrekken': return ['zonder', 'met', 'beide'].map(brug => ({ brug }));
    case 'maaltafels': return [{ bewerking: 'beide', tafels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { bewerking: 'delen', tafels: [3, 4] }, { bewerking: 'vermenigvuldigen', tafels: [2, 5, 10] }];
    case 'vermenigvuldigen-delen': return ['beide', 'delen', 'vermenigvuldigen'].map(bewerking => ({ bewerking }));
    case 'lengtematen-omzetten': case 'lengtematen-vergelijken':
      return [['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']].map(eenheden => ({ eenheden }));
    default: return [standaard];
  }
}

test('de koppelingen in generators-map.json komen overeen met de doelen van de generators', async () => {
  const map = JSON.parse(await readFile(new URL('../data/wiskunde/generators-map.json', import.meta.url), 'utf8')).koppelingen;
  const bron = JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen;
  const codes = new Set(bron.map(d => d.code));
  const verwacht = {};
  for (const g of GENERATORS) for (const c of g.doelen) { assert.ok(codes.has(c), `${g.id}: onbekend doel ${c}`); (verwacht[c] ||= []).push(g.id); }
  assert.deepEqual(map, Object.fromEntries(Object.entries(verwacht).sort(([a], [b]) => (a < b ? -1 : 1))));
});

test('elke generator heeft een id, titel, opdracht en bestaand pictogram', () => {
  assert.equal(new Set(GENERATORS.map(g => g.id)).size, GENERATORS.length);
  for (const g of GENERATORS) {
    assert.ok(g.id && g.titel && g.opdracht && g.doelen.length, g.id);
    assert.ok(ICONEN_NAMEN.includes(g.pictogram), `${g.id}: pictogram ${g.pictogram}`);
  }
});

for (const gen of GENERATORS) {
  test(`${gen.id}: antwoorden kloppen, getallen binnen gebied, geen dubbels, oplopende moeilijkheid`, () => {
    let totaal = 0;
    for (const gebied of GEBIEDEN) for (const opties of varianten(gen)) for (const seed of SEEDS) {
      const { oefeningen, waarschuwing } = gen.genereer({ seed, aantal: 12, gebied, opties });
      totaal += oefeningen.length;
      assert.ok(oefeningen.length <= 12);
      if (oefeningen.length < 12) assert.ok(waarschuwing, `${gen.id} gebied ${gebied}: ${oefeningen.length} oefeningen zonder waarschuwing`);
      const gezien = new Set(), sleutels = new Set();
      let vorige = null;
      for (const o of oefeningen) {
        const ctx = `${gen.id} gebied ${gebied} seed ${seed}: ${o.tekst}`;
        assert.ok(o.tekst !== undefined && o.antwoord && o.volledig && !/undefined|NaN/.test(o.tekst + o.volledig), ctx);
        assert.ok(!o.volledig.includes('____'), ctx);
        assert.ok(o.getallen.length > 0);
        for (const g of o.getallen) assert.ok(Number.isInteger(g) && g >= 0 && g <= gebied, `${ctx}: ${g} buiten gebied`);
        const id = o.tekst + (o.svg ? o.svg.markup : '');
        assert.ok(!gezien.has(id) && !sleutels.has(o.sleutel), `dubbel: ${ctx}`);
        gezien.add(id); sleutels.add(o.sleutel);
        if (vorige) assert.ok(vergelijkMoeilijkheid(vorige.moeilijkheid, o.moeilijkheid) <= 0, `niet oplopend: ${ctx}`);
        vorige = o;
        if (o.svg) assert.ok(o.svg.markup.startsWith('<svg') && o.svg.markup.endsWith('</svg>') && o.svg.breedte > 0 && o.svg.hoogte > 0);
        if (o.data && verifieer[o.data.type]) verifieer[o.data.type](o.data, o);
      }
    }
    assert.ok(totaal > 0, `${gen.id} maakte nooit een oefening`);
  });

  test(`${gen.id}: dezelfde seed geeft dezelfde oefeningen`, () => {
    for (const opties of varianten(gen)) {
      const p = { seed: 7, aantal: 10, gebied: 1000, opties };
      assert.deepEqual(gen.genereer(p), gen.genereer(p));
    }
  });
}

test('lengtematen omzetten: antwoorden kloppen', () => {
  const g = GENERATORS.find(x => x.id === 'lengtematen-omzetten');
  for (const gebied of GEBIEDEN) for (const eenheden of [['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']]) for (const seed of SEEDS) {
    for (const o of g.genereer({ seed, aantal: 12, gebied, opties: { eenheden } }).oefeningen) {
      const [, v, a, b] = /^(\d+) (\w+) = ____ (\w+)$/.exec(o.tekst);
      assert.equal(`${(+v * FACTOR[a]) / FACTOR[b]} ${b}`, o.antwoord);
      assert.equal(o.volledig, o.tekst.replace('____', o.antwoord.split(' ')[0]));
    }
  }
});

test('optellen en aftrekken: de keuze zonder/met brug wordt gerespecteerd', () => {
  for (const soort of ['optellen', 'aftrekken']) {
    const g = GENERATORS.find(x => x.id === soort);
    const brug = soort === 'optellen' ? brugOptellen : brugAftrekken;
    for (const gebied of [20, 100, 1000, 10000]) for (const seed of SEEDS) {
      for (const [keuze, verwacht] of [['zonder', false], ['met', true]]) {
        for (const o of g.genereer({ seed, aantal: 10, gebied, opties: { brug: keuze } }).oefeningen) {
          const { a, b } = o.data;
          assert.equal(brug(a, b), verwacht, `${soort} ${keuze}: ${o.tekst}`);
          assert.equal(soort === 'optellen' ? a + b : a - b, Number(o.antwoord));
          if (soort === 'aftrekken') assert.ok(b < a);
        }
      }
    }
  }
  const o = GENERATORS.find(x => x.id === 'optellen').genereer({ seed: 1, aantal: 30, gebied: 10, opties: { brug: 'met' } });
  assert.equal(o.oefeningen.length, 0, 'tot 10 is er geen brug mogelijk');
});

test('optellen/aftrekken: brug wordt afgeleid uit de gekozen doelen, of ingesteld door de leerkracht', () => {
  const opt = GENERATORS.find(x => x.id === 'optellen');
  assert.equal(opt.opties(['2.2.GL1.19'], {}).brug, 'zonder');
  assert.equal(opt.opties(['2.2.GL1.21'], {}).brug, 'met');
  assert.equal(opt.opties(['2.2.GL1.19', '2.2.GL1.21'], {}).brug, 'beide');
  assert.equal(opt.opties(['2.2.GL1.19'], { brug: 'met' }).brug, 'met');
});

test('maaltafels: enkel gekozen tafels en producten binnen het gebied', () => {
  const g = GENERATORS.find(x => x.id === 'maaltafels');
  for (const gebied of [20, 100]) for (const seed of SEEDS) {
    for (const o of g.genereer({ seed, aantal: 10, gebied, opties: { bewerking: 'beide', tafels: [3, 4] } }).oefeningen) {
      const d = o.data;
      const tafel = d.type === 'maal' ? [d.x, d.y] : [d.t];
      assert.ok(tafel.some(t => t === 3 || t === 4), o.tekst);
    }
  }
  assert.deepEqual(g.opties([], { tafels: 'onzin' }).tafels, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(g.opties([], { tafels: '5, 2 ; 10' }).tafels, [2, 5, 10]);
  assert.equal(g.opties(['2.2.GL2.24'], {}).bewerking, 'delen');
});

test('plaatswaarde en grotere maal/deel: waarschuwing als het gebied te klein is', () => {
  assert.ok(GENERATORS.find(x => x.id === 'plaatswaarde').genereer({ seed: 1, aantal: 5, gebied: 10, opties: {} }).waarschuwing);
  assert.ok(GENERATORS.find(x => x.id === 'vermenigvuldigen-delen').genereer({ seed: 1, aantal: 5, gebied: 20, opties: {} }).waarschuwing);
});

test('bladen met alle generators: bladcode geeft exact hetzelfde blad terug', () => {
  const ids = GENERATORS.map(g => g.id);
  const opties = Object.fromEntries(GENERATORS.map(g => [g.id, g.opties ? g.opties(g.doelen, {}) : {}]));
  const blad = bouwBlad(wiskunde, ids, { seed: 12345, aantal: 8, gebied: 1000, opties });
  const terug = bladUitCode(wiskunde, blad.code);
  assert.deepEqual(terug.blokken, blad.blokken);
  assert.equal(terug.code, blad.code);
  assert.throws(() => bladUitCode(wiskunde, 'onzin'));
});

test('blokken zonder oefeningen komen niet op het blad, de reden wordt wel gemeld', () => {
  const g = GENERATORS.find(x => x.id === 'vermenigvuldigen-delen');
  const blad = bouwBlad(wiskunde, ['vermenigvuldigen-delen', 'getallen-vergelijken'], { seed: 1, aantal: 5, gebied: 20, opties: {} });
  assert.deepEqual(blad.blokken.map(b => b.generatorId), ['getallen-vergelijken']);
  assert.equal(blad.waarschuwingen.length, 1);
  assert.ok(blad.waarschuwingen[0].startsWith(g.titel));
});
