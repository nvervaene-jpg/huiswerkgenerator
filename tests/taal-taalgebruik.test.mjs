// Controles voor de oefeningen over taalgebruik (js/subjects/taal/generators/taalgebruik.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../js/subjects/taal/woorden/taalgebruik.js';
import { VERBEN } from '../js/subjects/taal/woorden/werkwoorden.js';
import { ZINSOORTEN } from '../js/subjects/taal/woorden/taalkunde.js';
import { STRUCTUUR } from '../js/subjects/taal/woorden/lezen.js';
import { TAALGEBRUIK_VORMEN } from '../js/subjects/taal/generators/taalgebruik.js';

const SEEDS = Array.from({ length: 8 }, (_, i) => i + 1);

test('taalgebruik: gegevens zonder dubbels en met afleiders die verschillen van het antwoord', () => {
  assert.equal(new Set(D.NONVERBAAL.map(x => x[0])).size, D.NONVERBAAL.length);
  for (const [, s] of D.NONVERBAAL) assert.ok(D.NONVERBAAL_NAMEN.includes(s));
  for (const n of D.NONVERBAAL_NAMEN) assert.ok(D.NONVERBAAL.filter(x => x[1] === n).length >= 3, n);
  for (const [, s] of D.REGISTERTAAL) assert.ok(['jongerentaal', 'vaktaal'].includes(s));
  assert.equal(new Set(D.BRONNEN).size, D.BRONNEN.length);
  const alleTalen = [...D.SCHRIFT.zelfde, ...D.SCHRIFT.ander, ...Object.values(D.TAALFAMILIES).flat()];
  assert.equal(new Set(D.SCHRIFT.zelfde.concat(D.SCHRIFT.ander)).size, D.SCHRIFT.zelfde.length + D.SCHRIFT.ander.length);
  const fam = Object.values(D.TAALFAMILIES).flat();
  assert.equal(new Set(fam).size, fam.length, 'een taal staat in één familie');
  assert.ok(alleTalen.length > 10);
  for (const t of D.SCHRIFT.zelfde) assert.ok(!D.SCHRIFT.ander.includes(t));
  for (const [zin, woord, goed, fout] of D.CONTEXT) { assert.ok(zin.includes(woord), zin); assert.equal(new Set([goed, ...fout]).size, 3, zin); }
  assert.equal(new Set(D.CONTEXT.map(c => c[0])).size, D.CONTEXT.length);
});

test('werkwoorden: de zwakke ovt volgt het kofschip en de meeste verbeterzinnen bevatten leestekens', () => {
  for (const v of VERBEN.filter(x => x.soort === 'zwak' && x.stam && x.ovt)) {
    if (/^(ge|be|ver)/.test(v.inf) || !v.inf.endsWith('en')) continue;
    const eind = v.inf.slice(0, -2).slice(-1), uitgang = 'tkfschp'.includes(eind) ? 'te' : 'de';
    if (v.stam.endsWith('d') || v.stam.endsWith('t')) continue;
    assert.ok(v.ovt[0].endsWith(uitgang) && v.ovt[0].startsWith(v.stam.slice(0, -1)), `${v.inf}: ${v.ovt[0]}`);
  }
  const zinnen = Object.values(ZINSOORTEN).flat();
  assert.ok(zinnen.every(z => /[.?!]$/.test(z)));
  assert.ok(STRUCTUUR.length >= 10);
});

const zonderTekens = (z) => z.replace(/[.,!?]/g, '');
const gecontroleerd = {
  'pv-vervoeg': (d, o) => {
    const v = VERBEN.find(x => x.inf === d.inf), sleutel = (p) => (/^Ik$/.test(p) ? 'ik' : /^Hij$/.test(p) ? 'hij' : 'mv');
    const ott = (p) => { const k = sleutel(p); return v.ott ? v.ott[k] : k === 'ik' ? v.stam : k === 'hij' ? (v.stam.endsWith('t') ? v.stam : `${v.stam}t`) : v.inf; };
    if (d.soort === 'persoon') return o.antwoord === ott(d.ander) && sleutel(d.pers) !== sleutel(d.ander);
    if (d.soort === 'tijd') return o.antwoord === v.ovt[sleutel(d.pers) === 'mv' ? 1 : 0];
    return o.antwoord === ott(d.pers) && o.tekst.includes(`(${v.inf})`);
  },
  'cs-verbeter': (d, o) => Object.values(ZINSOORTEN).flat().concat(STRUCTUUR.map(([z, g]) => z.replace('____', g))).includes(d.juist) && o.antwoord === d.juist && zonderTekens(d.juist).toLowerCase() === d.fout.toLowerCase() && /^[A-Z]/.test(d.juist) && !/[.,!?]/.test(d.fout) && /[.?!]$/.test(d.juist),
  'zv-bouw': (d) => d.woorden.map(w => w.toLowerCase()).sort().join(' ') === zonderTekens(d.juist).split(' ').map(w => w.toLowerCase()).sort().join(' ') && d.woorden.join(' ') !== zonderTekens(d.juist),
  'tg-kies': (d) => {
    switch (d.soort) {
      case 'nonverbaal': return D.NONVERBAAL.find(x => x[0] === d.zin)[1] === d.goed;
      case 'register': return D.REGISTERTAAL.find(x => x[0] === d.zin)[1] === d.goed;
      case 'bronnen': { const [i, j] = [D.BRONNEN.indexOf(d.a), D.BRONNEN.indexOf(d.b)]; return d.goed === D.BRONNEN[d.eerst ? Math.min(i, j) : Math.max(i, j)] && i !== j; }
      case 'schrift': return (d.ander ? D.SCHRIFT.ander : D.SCHRIFT.zelfde).includes(d.goed) && d.opties.filter(x => (d.ander ? D.SCHRIFT.ander : D.SCHRIFT.zelfde).includes(x)).length === 1;
      default: return D.TAALFAMILIES.germaans.includes(d.goed) && d.opties.filter(x => D.TAALFAMILIES.germaans.includes(x)).length === 1;
    }
  },
  'tg-context': (d) => { const c = D.CONTEXT.find(x => x[0] === d.zin); return c[1] === d.woord && c[2] === d.goed; },
};

for (const g of TAALGEBRUIK_VORMEN) {
  test(`${g.id}: antwoorden kloppen, geen dubbels en herhaalbaar`, () => {
    for (const doel of g.doelen) for (const seed of SEEDS) {
      const opties = g.opties(g.doelen, {}, doel), res = g.genereer({ seed, aantal: 8, opties });
      assert.ok(res.oefeningen.length >= 3, `${g.id} ${doel} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) {
        const d = o.data, controle = gecontroleerd[d.type];
        assert.ok(controle, `${g.id}: geen controle voor ${d.type}`);
        assert.ok(controle(d, o), `${g.id} ${doel}: ${o.tekst}`);
        if (d.opties) { assert.ok(d.opties.includes(o.antwoord)); assert.equal(new Set(d.opties).size, d.opties.length); }
        assert.ok(o.antwoord && o.volledig);
      }
      assert.deepEqual(g.genereer({ seed, aantal: 8, opties }), res);
    }
  });
}
