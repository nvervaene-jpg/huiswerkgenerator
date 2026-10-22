// Controles voor de leesoefeningen van Taal (js/subjects/taal/generators/lezen.js): leeswoorden volgens een patroon en tekstbegrip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEESWOORDEN, DOELTEKSTEN, DOEL_NAMEN, CONVENTIES, CONVENTIE_DOEL, STRUCTUUR } from '../js/subjects/taal/woorden/lezen.js';
import { LEESTEKSTEN } from '../js/subjects/taal/woorden/leesteksten.js';
import { LEZEN_VORMEN, LEES_DOELEN, LEES_OK, leesWoorden } from '../js/subjects/taal/generators/lezen.js';

const SEEDS = Array.from({ length: 8 }, (_, i) => i + 1);
const EEN = /^[^aeiouyéë]*[aeiouyéë]+[^aeiouyéë]*$/;       // één klinkergroep
// Eigen patroon per doel: wat moet er in elk woord staan (los van de generator)
const PATROON = {
  '1.2.GL1.7': /(ie|oe|eu|ui)/, '1.2.GL1.8': /(ei|ij)/, '1.2.GL1.9': /(ou|au)/, '1.2.GL2.5': /(ei|ij)/, '1.2.GL2.6': /(ou|au)/, '1.2.GL1.10': /(aai|ooi|oei)/, '1.2.GL1.11': /(eeuw|ieuw)/, '1.2.GL1.23': /uw$/,
  '1.2.GL1.12': /(ng|nk)$/, '1.2.GL1.13': /(ch|cht)$/, '1.2.GL1.14': /^sch/, '1.2.GL2.14': /th/, '1.2.GL2.15': /^wr/, '1.2.GL2.17': /ing$/, '1.2.GL2.12': /(ig|lijk)$/, '1.2.GL3.3': /y/, '1.2.GL3.4': /c[eiy]/,
  '1.2.GL3.5': /c([aou]|$|[^eiyh])/, '1.2.GL3.7': /x/, '1.2.GL3.12': /(heid|teit)$/, '1.2.GL3.13': /isch$/, '1.2.GL4.2': /(eum|ium)$/, '1.2.GL4.3': /q/, '1.2.GL4.4': /(iaal|ieel|ueel)$/, '1.2.GL2.40': /^(be|ge|ver)/,
  '1.2.GL3.15': /(é|eau)/, '1.2.GL1.20': /(en|er|el)$/, '1.2.GL2.13': /tie/, '1.2.GL3.8': /tie/, '1.2.GL2.11': /end$/, '1.2.GL1.22': /[db]$/,
  '1.2.GL1.15': /^[^aeiou]{2,}[aeiou]+[^aeiou]$/, '1.2.GL1.16': /^[^aeiou][aeiou]+[^aeiou]{2,}$/, '1.2.GL1.17': /^[^aeiou]{2,}[aeiou]+[^aeiou]{2,}$/,
  '1.2.GL1.5': /^([^aeiou][aeiou][^aeiou]?|[aeiou][^aeiou])$/, '1.2.GL1.6': /[aou]$/, '1.2.GL3.1': /[aoi]$/,
  '1.2.GL2.4': /(ie|oe|eu|ui)/, '1.2.GL2.7': /(aai|ooi|oei)/, '1.2.GL2.8': /(eeuw|ieuw)/, '1.2.GL2.39': /uw/, '1.2.GL2.9': /(ng|nk)$/, '1.2.GL2.10': /(ch|cht)$/, '1.2.GL3.2': /(elen|eren|enen)$/,
};
const EENLETTERGREPIG = ['1.2.GL1.10', '1.2.GL1.11', '1.2.GL1.23', '1.2.GL1.12', '1.2.GL1.13', '1.2.GL1.14', '1.2.GL1.15', '1.2.GL1.16', '1.2.GL1.17', '1.2.GL1.22'];

test('leeswoorden: elk woord past bij het patroon van zijn doel, eenlettergrepige doelen hebben enkel eenlettergrepige woorden', () => {
  for (const [code, re] of Object.entries(PATROON)) {
    if (!LEES_OK.includes(code)) continue;
    const woorden = leesWoorden(code);
    assert.ok(woorden.length >= 4, code);
    assert.equal(new Set(woorden).size, woorden.length);
    for (const w of woorden) { assert.match(w, re, `${code}: ${w}`); assert.match(w, /^[a-zéëï]+$/); }
    if (EENLETTERGREPIG.includes(code)) for (const w of woorden) assert.ok(EEN.test(w), `${code}: ${w} is niet eenlettergrepig`);
  }
  assert.ok(LEES_OK.length >= 50, `${LEES_OK.length} doelen`);
  for (const [k, l] of Object.entries(LEESWOORDEN)) assert.equal(new Set(l).size, l.length, k);
});

test('leesteksten: elk leerjaar heeft nu minstens drie teksten met drie verschillende antwoorden per vraag', () => {
  for (const [j, lijst] of Object.entries(LEESTEKSTEN)) {
    assert.ok(lijst.length >= 3, j);
    assert.equal(new Set(lijst.map(t => t.titel)).size, lijst.length);
    for (const t of lijst) for (const v of t.vragen) assert.equal(new Set([v.juist, ...v.fout]).size, 3, v.vraag);
  }
});

test('teksten met een doel, tekstconventies en verbindingswoorden: gegevens hangen samen', () => {
  const alle = Object.values(DOELTEKSTEN).flat();
  assert.equal(new Set(alle).size, alle.length);
  for (const [doel, l] of Object.entries(DOELTEKSTEN)) { assert.ok(l.length >= 3, doel); assert.ok(DOEL_NAMEN[doel]); }
  for (const t of DOELTEKSTEN.instructies) assert.match(t, /(Neem|Stap|Zo plant|Wassen)/, t);
  for (const t of DOELTEKSTEN.overtuigen) assert.match(t, /[!?]/, t);
  for (const t of DOELTEKSTEN.informeren) assert.ok(!/[!?]/.test(t), t);
  for (const c of CONVENTIES) { assert.ok(c.vragen.length >= 3 && new Set(c.vragen).size === c.vragen.length, c.antw); for (const v of c.vragen) assert.ok(v.endsWith('?'), v); }
  for (const lijst of Object.values(CONVENTIE_DOEL)) for (const w of lijst) assert.ok(CONVENTIES.some(c => c.antw === w), w);
  for (const [zin, goed, fout] of STRUCTUUR) { assert.ok(zin.includes('____') && fout.length === 2 && !fout.includes(goed) && new Set(fout).size === 2, zin); }
});

const gecontroleerd = {
  'lz-lees': (d) => { const pool = leesWoorden(d.doel); return d.woorden.every(w => pool.includes(w)) && new Set(d.woorden).size === d.woorden.length && d.woorden.length >= 3 && (!PATROON[d.doel] || d.woorden.every(w => PATROON[d.doel].test(w))); },
  'lz-zoek': (d) => d.opties.filter(w => w.includes(d.soort)).length === 1 && d.goed.includes(d.soort) && d.opties.includes(d.goed) && d.opties.length === 4 && leesWoorden(d.doel).includes(d.goed),
  'lt-vraag': (d) => { const t = Object.values(LEESTEKSTEN).flat().find(x => x.titel === d.titel), v = t.vragen.find(x => x.vraag === d.vraagTekst); return Boolean(v) && v.juist === d.goed && d.vraag.includes(t.tekst) && d.opties.every(o => o === v.juist || v.fout.includes(o)) && LEESTEKSTEN[`L${/GL(\d)/.exec(d.doel)[1]}`].includes(t); },
  'lt-titel': (d) => { const t = Object.values(LEESTEKSTEN).flat().find(x => d.vraag.includes(x.tekst)); return t.titel === d.goed && d.opties.includes(t.titel) && new Set(d.opties).size === 3; },
  'lt-doel': (d) => { const cat = Object.entries(DOELTEKSTEN).find(([, l]) => l.includes(d.tekst))[0]; return DOEL_NAMEN[cat] === d.goed && d.vraag.includes(d.tekst); },
  'lt-conventie': (d) => { const c = CONVENTIES.find(x => x.vragen.includes(d.vraagTekst)); return c.antw === d.goed && CONVENTIE_DOEL[d.doel].includes(c.antw) && d.opties.length === 3; },
  'lt-structuur': (d) => { const r = STRUCTUUR.find(x => x[0] === d.zin); return r[1] === d.goed && d.opties.includes(r[1]) && r[2].every(f => d.opties.includes(f)) && r[3] <= Number(/GL(\d)/.exec(d.doel)[1]); },
};

for (const g of LEZEN_VORMEN) {
  test(`${g.id}: antwoorden kloppen, het antwoord staat bij de opties, geen dubbels en herhaalbaar`, () => {
    for (const doel of g.doelen) for (const seed of SEEDS) {
      const opties = g.opties(g.doelen, {}, doel), res = g.genereer({ seed, aantal: 8, opties });
      assert.ok(res.oefeningen.length >= 3, `${g.id} ${doel} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) {
        const d = o.data, controle = gecontroleerd[d.type];
        assert.ok(controle, `${g.id}: geen controle voor ${d.type}`);
        assert.ok(controle(d), `${g.id} ${doel}: ${o.tekst}`);
        if (d.type !== 'lz-lees' && d.opties) { assert.ok(d.opties.includes(o.antwoord)); assert.equal(new Set(d.opties).size, d.opties.length); }
        assert.ok(o.antwoord && o.volledig);
      }
      assert.deepEqual(g.genereer({ seed, aantal: 8, opties }), res);
    }
  });
}
void LEES_DOELEN;
