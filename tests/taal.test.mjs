import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import taal from '../js/subjects/taal/index.js';
import { GENERATORS } from '../js/subjects/taal/generators/index.js';
import { DOELEN, woordenVoor } from '../js/subjects/taal/generators/verenkelen-verdubbelen.js';
import { VERDUBBELEN, VERENKELEN, WOORDEN, foutMeervoud } from '../js/subjects/taal/woorden/verenkelen-verdubbelen.js';
import { vergelijkMoeilijkheid } from '../js/subjects/wiskunde/generators/hulp.js';
import { ICONEN_NAMEN } from '../js/core/icons.js';
import { modelVoorVormen, planModel, losOp, modelUitCode, optiesVoor } from '../js/core/blad-model.js';
import { VAKKEN } from '../js/subjects/index.js';

const SEEDS = Array.from({ length: 15 }, (_, i) => i + 1);
const NIVEAUS = [['L2'], ['L3'], ['L4'], ['L3', 'L4'], ['L2', 'L3', 'L4']];
const REGELS = ['beide', 'verdubbelen', 'verenkelen'];

// Eigen spellingregel, los van de generator: wat is het meervoud op -en van dit enkelvoud?
function meervoudVolgensRegel(enkelvoud) {
  if (/(aa|ee|oo|uu)[^aeiou]$/.test(enkelvoud)) return { soort: 'verenkelen', meervoud: enkelvoud.replace(/(aa|ee|oo|uu)([^aeiou])$/, (_, v, c) => v[0] + c) + 'en' };
  if (/(^|[^aeiou])[aeiou][^aeiou]$/.test(enkelvoud)) return { soort: 'verdubbelen', meervoud: enkelvoud + enkelvoud.at(-1) + 'en' };
  throw new Error(`regel is niet van toepassing op ${enkelvoud}`);
}
// Telt klinkergroepen (ij, y en alle opeenvolgende klinkers tellen als één), als onafhankelijke controle op de lettergrepen.
const klinkergroepen = (w) => (w.match(/(?:ij|[aeiouy])+/g) || []).length;

test('woordenlijst: elk meervoud volgt de spellingregel', () => {
  assert.ok(VERDUBBELEN.length >= 60 && VERENKELEN.length >= 55);
  for (const [lijst, soort] of [[VERDUBBELEN, 'verdubbelen'], [VERENKELEN, 'verenkelen']]) for (const [enk, delen] of lijst) {
    const juist = meervoudVolgensRegel(enk);
    assert.equal(juist.soort, soort, `${enk} staat in de verkeerde lijst`);
    assert.equal(delen.split('-').join(''), juist.meervoud, enk);
  }
});

test('woordenlijst: lettergrepen kloppen en de afbreking staat op de juiste plaats', () => {
  const gezien = new Set();
  for (const w of WOORDEN) {
    assert.ok(!gezien.has(w.enkelvoud), `dubbel woord ${w.enkelvoud}`); gezien.add(w.enkelvoud);
    assert.equal(klinkergroepen(w.meervoud), w.lettergrepen, `${w.meervoud}: aantal lettergrepen`);
    assert.ok(w.delen.every(d => d.length > 0 && klinkergroepen(d) === 1), `${w.meervoud}: elke lettergreep heeft één klinker(groep)`);
    assert.equal(w.delen.at(-1).endsWith('en'), true);
    if (w.soort === 'verdubbelen') assert.equal(w.delen.at(-2).at(-1), w.delen.at(-1)[0], `${w.meervoud}: verdubbeling over de afbreking`);
    else assert.ok(!/(aa|ee|oo|uu)$/.test(w.delen.at(-2)), `${w.meervoud}: open lettergreep met één klinker`);
  }
});

test('woordenlijst: de foute spelling is nooit gelijk aan het juiste meervoud', () => {
  for (const w of WOORDEN) {
    assert.notEqual(foutMeervoud(w), w.meervoud);
    assert.equal(foutMeervoud(w), w.enkelvoud + 'en');
  }
});

test('woordenlijst per niveau: genoeg woorden van beide regels', () => {
  for (const niveaus of NIVEAUS) for (const regel of ['verdubbelen', 'verenkelen']) {
    const n = woordenVoor({ niveaus, regel }).length;
    assert.ok(n >= (niveaus.includes('L2') && niveaus.length === 1 ? 18 : 25), `${niveaus} ${regel}: ${n}`);
  }
  assert.ok(woordenVoor({ niveaus: ['L4'] }).every(w => w.lettergrepen >= 3));
  assert.ok(woordenVoor({ niveaus: ['L3'] }).every(w => w.lettergrepen === 2));
  assert.ok(woordenVoor({ niveaus: ['L2'] }).every(w => w.lettergrepen === 2 && w.frequent));
});

/* ------------------------------------------------------------ verificaties per soort oefening */
const check = (gegevens) => {
  const juist = meervoudVolgensRegel(gegevens.enkelvoud);
  assert.equal(gegevens.meervoud, juist.meervoud);
  assert.equal(gegevens.soort, juist.soort);
  return juist;
};
const verifieer = {
  'tw-invullen': (d, o) => { check(d); assert.equal(o.antwoord, meervoudVolgensRegel(d.enkelvoud).meervoud); assert.ok(o.tekst.includes('één ' + d.enkelvoud) && o.tekst.includes('____')); },
  'tw-zin': (d, o) => {
    check(d); assert.equal(o.antwoord, meervoudVolgensRegel(d.enkelvoud).meervoud);
    assert.ok(o.tekst.includes(`(${d.enkelvoud})`) && o.tekst.includes('____') && !o.tekst.includes(d.meervoud));
    assert.ok(o.volledig.includes(d.meervoud) && !o.volledig.includes('____'));
  },
  'tw-kies': (d, o) => {
    check(d); assert.equal(d.opties.length, 2); assert.equal(new Set(d.opties).size, 2);
    assert.equal(d.opties[d.juist], meervoudVolgensRegel(d.enkelvoud).meervoud); assert.notEqual(d.opties[1 - d.juist], d.opties[d.juist]);
    assert.equal(o.antwoord, d.opties[d.juist]);
    assert.ok(d.opties.every(x => o.tekst.includes(x)));
  },
  'tw-juistfout': (d, o) => {
    const j = check(d);
    assert.equal(d.juist, d.getoond === j.meervoud);
    assert.equal(o.antwoord, d.juist ? 'juist' : 'fout');
    assert.ok(o.tekst.includes(d.getoond) && o.tekst.includes('juist') && o.tekst.includes('fout'));
  },
  'tw-regel': (d, o) => { const j = check(d); assert.equal(o.antwoord, j.soort); assert.ok(o.tekst.includes('verdubbelen') && o.tekst.includes('verenkelen')); },
  'tw-lettergrepen': (d, o) => {
    check(d); assert.equal(o.antwoord.replace(/-/g, ''), meervoudVolgensRegel(d.enkelvoud).meervoud);
    assert.equal(o.antwoord.split('-').length, klinkergroepen(d.meervoud));
  },
  'tw-verbind': (d, o) => {
    assert.equal(d.woorden.length, 4);
    for (const w of d.woorden) { check(w); assert.ok(o.svg.markup.includes(`>${w.enkelvoud}<`) && o.svg.markup.includes(`>${w.meervoud}<`)); }
    assert.equal(new Set(d.woorden.map(w => w.enkelvoud)).size, 4); assert.equal(new Set(d.woorden.map(w => w.meervoud)).size, 4);
    assert.equal((o.antwoordSvg.markup.match(/<line /g) || []).length, 4);
    assert.equal((o.svg.markup.match(/<line /g) || []).length, 0, 'de oplossing staat niet op het werkblad');
    // de lijnen verbinden elk woord met zijn eigen meervoud: lees de rechterkant terug uit de tekening
    const rechts = [...o.svg.markup.matchAll(/<text x="416"[^>]*>([^<]+)</g)].map(m => m[1]);
    const lijnen = [...o.antwoordSvg.markup.matchAll(/<line x1="228" y1="([\d.]+)" x2="392" y2="([\d.]+)"/g)].map(m => [+m[1], +m[2]]);
    const rij = (y) => Math.round((y - 8 - 23) / 46);
    for (const [y1, y2] of lijnen) assert.equal(rechts[rij(y2)], meervoudVolgensRegel(d.woorden[rij(y1)].enkelvoud).meervoud);
  },
  'tw-kleuren': (d, o) => {
    assert.equal(d.woorden.length, 6);
    for (const w of d.woorden) {
      const j = check(w);
      assert.equal(w.juist, w.getoond === j.meervoud);
      assert.ok(o.svg.markup.includes(`>${w.enkelvoud} - ${w.getoond}<`));
    }
    const groen = (o.antwoordSvg.markup.match(/fill="#a9dfa3"/g) || []).length;
    assert.equal(groen, d.woorden.filter(w => w.juist).length); assert.ok(groen >= 2 && groen <= 4);
    assert.equal((o.svg.markup.match(/fill="#a9dfa3"/g) || []).length, 0);
    assert.equal(o.antwoord.split('; ').length, groen);
  },
  'tw-fout': (d, o) => {
    if (d.variant === 'verbeter') {
      const [w] = d.woorden; const j = check(w); assert.notEqual(w.getoond, j.meervoud); assert.equal(o.antwoord, j.meervoud); assert.ok(o.tekst.includes(w.getoond));
    } else {
      assert.equal(d.woorden.length, 3);
      d.woorden.forEach((w, i) => { const j = check(w); assert.equal(w.getoond === j.meervoud, i !== d.fout); });
      assert.equal(d.juist, meervoudVolgensRegel(d.woorden[d.fout].enkelvoud).meervoud);
      assert.ok(o.antwoord.startsWith('abc'[d.fout] + ')'));
    }
  },
};

/* ------------------------------------------------------------ algemene eisen aan alle taalgenerators */
test('elke taalgenerator heeft een id, titel, opdracht, bestaand pictogram en geldige doelen', async () => {
  assert.equal(new Set(GENERATORS.map(g => g.id)).size, GENERATORS.length);
  assert.ok(GENERATORS.length >= 8, 'meerdere oefenvormen');
  const bron = JSON.parse(await readFile(new URL('../data/taal/doelen-taal-opstap.json', import.meta.url), 'utf8')).doelen;
  const codes = new Set(bron.map(d => d.code));
  for (const g of GENERATORS) {
    assert.ok(g.id && g.titel && g.opdracht && g.doelen.length, g.id);
    assert.ok(ICONEN_NAMEN.includes(g.pictogram), `${g.id}: pictogram ${g.pictogram}`);
    for (const c of g.doelen) assert.ok(codes.has(c), `${g.id}: onbekend doel ${c}`);
  }
  assert.equal(GENERATORS.filter(g => g.basis).length, 1, 'één basisvorm');
});

test('de koppelingen in data/taal/generators-map.json komen overeen met de doelen van de generators', async () => {
  const map = JSON.parse(await readFile(new URL('../data/taal/generators-map.json', import.meta.url), 'utf8')).koppelingen;
  const verwacht = {};
  for (const g of GENERATORS) for (const c of g.doelen) (verwacht[c] ||= []).push(g.id);
  assert.deepEqual(map, Object.fromEntries(Object.entries(verwacht).sort(([a], [b]) => (a < b ? -1 : 1))));
  assert.deepEqual(Object.keys(map).sort(), [...DOELEN].sort());
});

for (const gen of GENERATORS) {
  test(`${gen.id}: antwoorden kloppen, geen dubbels, oplopende moeilijkheid, woorden passen bij het niveau`, () => {
    let totaal = 0;
    for (const niveaus of NIVEAUS) for (const regel of REGELS) for (const seed of SEEDS) {
      const opties = { niveaus, regel };
      const { oefeningen, waarschuwing } = gen.genereer({ seed, aantal: 12, gebied: 0, opties });
      totaal += oefeningen.length;
      assert.ok(oefeningen.length <= 12);
      if (oefeningen.length < 12) assert.ok(waarschuwing, `${gen.id}: ${oefeningen.length} oefeningen zonder waarschuwing`);
      const toegelaten = new Set(woordenVoor(opties).map(w => w.enkelvoud));
      const gezien = new Set(), sleutels = new Set();
      let vorige = null;
      for (const o of oefeningen) {
        const ctx = `${gen.id} ${niveaus} ${regel} seed ${seed}: ${o.tekst}`;
        assert.ok(o.tekst !== undefined && o.antwoord && o.volledig && !/undefined|NaN/.test(o.tekst + o.volledig), ctx);
        assert.ok(!o.volledig.includes('____'), ctx);
        const id = o.tekst + (o.svg ? o.svg.markup : '');
        assert.ok(!gezien.has(id) && !sleutels.has(o.sleutel), `dubbel: ${ctx}`);
        gezien.add(id); sleutels.add(o.sleutel);
        if (vorige) assert.ok(vergelijkMoeilijkheid(vorige.moeilijkheid, o.moeilijkheid) <= 0, `niet oplopend: ${ctx}`);
        vorige = o;
        if (o.svg) assert.ok(o.svg.markup.startsWith('<svg') && o.svg.markup.endsWith('</svg>') && o.svg.breedte > 0 && o.svg.hoogte > 0);
        assert.ok(o.data && verifieer[o.data.type], `${gen.id}: geen controle voor type ${o.data && o.data.type}`);
        verifieer[o.data.type](o.data, o);
        for (const k of o.kernen || [o.kern]) assert.ok(toegelaten.has(k), `${ctx}: woord ${k} hoort niet bij dit niveau of deze regel`);
        if (regel !== 'beide') for (const k of o.kernen || [o.kern]) assert.equal(meervoudVolgensRegel(k).soort, regel, ctx);
      }
    }
    assert.ok(totaal > 0, `${gen.id} maakte nooit een oefening`);
  });

  test(`${gen.id}: dezelfde seed geeft dezelfde oefeningen`, () => {
    const p = { seed: 7, aantal: 10, gebied: 0, opties: { niveaus: ['L3'], regel: 'beide' } };
    assert.deepEqual(gen.genereer(p), gen.genereer(p));
  });
}

test('beide regels komen voor in een blok met "beide"', () => {
  const inv = GENERATORS.find(g => g.id === 'vv-invullen');
  let beide = 0;
  for (const seed of SEEDS) {
    const s = new Set(inv.genereer({ seed, aantal: 8, gebied: 0, opties: { niveaus: ['L3'], regel: 'beide' } }).oefeningen.map(o => o.data.soort));
    if (s.size === 2) beide++;
  }
  assert.ok(beide >= SEEDS.length - 1, `slechts ${beide} blokken met beide regels`);
});

/* ------------------------------------------------------------ het vak in de werkbladmotor */
test('het vak Taal is geregistreerd en gebruikt enkel de leerjaren 1 tot en met 6', () => {
  assert.ok(VAKKEN.includes(taal) && taal.actief && taal.gebieden === false);
  assert.deepEqual(taal.leerjaren, ['L1', 'L2', 'L3', 'L4', 'L5', 'L6']);
});

test('doelen-bestand Nederlands: 693 unieke doelen met volledige indeling', async () => {
  const d = JSON.parse(await readFile(new URL('../data/taal/doelen-taal-opstap.json', import.meta.url), 'utf8'));
  assert.equal(d.doelen.length, d.aantalDoelen); assert.equal(d.doelen.length, 693);
  assert.equal(new Set(d.doelen.map(x => x.code)).size, 693);
  for (const x of d.doelen) {
    assert.match(x.code, /^1\.[2-6]\.GL[1-6]\.\d+$/);
    assert.ok(x.domein && x.subdomein && x.tekst.length > 20 && ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'].includes(x.leerjaar), x.code);
    assert.equal(x.code.match(/GL(\d)/)[1], x.leerjaar.slice(1), `${x.code}: leerjaar komt niet overeen met de code`);
  }
  const v = d.doelen.find(x => x.code === '1.3.GL3.16');
  assert.equal(v.tekst, 'De leerlingen kunnen spellingregels bij verenkelen en verdubbelen in frequente tweelettergrepige woorden toepassen.');
  assert.equal(v.rubriek, 'Verenkelen en verdubbelen');
});

test('een blad voor taaldoelen: drie blokken per doel, andere vormen, bijna nooit een woord twee keer', () => {
  for (const seed of SEEDS) {
    for (const doelen of [['1.3.GL3.16'], ['1.3.GL2.27', '1.3.GL4.18'], [...DOELEN]]) {
      const model = planModel(taal, { doelen, keuzes: {}, seed, gebied: 0, aantal: 6, blokken: 3 });
      assert.equal(model.blokken.length, doelen.length * 3);
      const blad = losOp(taal, model);
      const woorden = blad.blokken.flatMap(b => b.oefeningen.flatMap(o => o.kernen || [o.kern]));
      const dubbel = woorden.length - new Set(woorden).size;           // enkel bij grote vormen (kleuren, verbinden) kan een woord soms terugkomen
      assert.ok(dubbel <= woorden.length * 0.1, `seed ${seed}: ${dubbel} van ${woorden.length} woorden staan twee keer op het blad`);
      if (doelen.length === 1 && doelen[0] !== '1.3.GL4.18') assert.equal(dubbel, 0, `seed ${seed}: een woord staat twee keer op het blad`);
      for (const b of model.blokken) assert.equal(b.opties.regel, 'beide');
      const { model: terug, waarschuwing } = modelUitCode(taal, blad.code);
      assert.equal(waarschuwing, null);
      assert.deepEqual(losOp(taal, terug).blokken, blad.blokken);
    }
  }
});

test('elk blok volgt het niveau van zijn eigen doel', () => {
  const model = planModel(taal, { doelen: ['1.3.GL2.27', '1.3.GL4.18'], keuzes: {}, seed: 5, gebied: 0, aantal: 6, blokken: 3 });
  const blad = losOp(taal, model);
  blad.blokken.forEach((b, i) => {
    const lettergrepen = new Set(b.oefeningen.flatMap(o => (o.kernen || [o.kern]).map(k => WOORDEN.find(w => w.enkelvoud === k).lettergrepen)));
    if (model.blokken[i].doel === '1.3.GL2.27') assert.deepEqual([...lettergrepen], [2]);
    else assert.ok([...lettergrepen].every(n => n >= 3));
  });
});

test('de keuze "enkel verdubbelen" bereikt de generators via de gedeelde keuzegroep', () => {
  const gen = GENERATORS[0];
  assert.deepEqual(optiesVoor(gen, ['1.3.GL3.16'], { 'verenkelen-verdubbelen': { regel: 'verdubbelen' } }), { niveaus: ['L3'], regel: 'verdubbelen' });
  const model = planModel(taal, { doelen: ['1.3.GL4.18'], keuzes: { 'verenkelen-verdubbelen': { regel: 'verenkelen' } }, seed: 3, gebied: 0, aantal: 6, blokken: 3 });
  const blad = losOp(taal, model);
  for (const b of blad.blokken) for (const o of b.oefeningen) for (const k of o.kernen || [o.kern]) assert.equal(meervoudVolgensRegel(k).soort, 'verenkelen');
});

test('alle taalvormen samen op één blad: bladcode geeft exact hetzelfde blad terug', () => {
  const ids = GENERATORS.map(g => g.id);
  const opties = Object.fromEntries(GENERATORS.map(g => [g.id, g.opties(g.doelen, {})]));
  const blad = losOp(taal, modelVoorVormen(taal, ids, { seed: 4242, aantal: 6, gebied: 0, opties }));
  const { model } = modelUitCode(taal, blad.code);
  assert.deepEqual(losOp(taal, model).blokken, blad.blokken);
  assert.throws(() => modelUitCode(taal, 'onzin'));
});
