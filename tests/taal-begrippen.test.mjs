// Controles voor de begrippenoefeningen van Taal (js/subjects/taal/generators/begrippen.js): eerst de gegevens, dan elke oefening met een eigen berekening.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../js/subjects/taal/woorden/begrippen.js';
import { BEGRIPPEN_VORMEN, verplaatsOpbouw } from '../js/subjects/taal/generators/begrippen.js';

const SEEDS = Array.from({ length: 8 }, (_, i) => i + 1);
const alleWoorden = (lijst) => lijst.flat();

test('klinkers: elk woord hoort bij de juiste soort volgens de lettercombinatie', () => {
  const lang = /^[^aeiou]*(aa|ee|oo|uu)[^aeiou]*$/, tweeteken = /(ie|oe|eu|ui|ei|ij|ou|au)/, kort = /^[^aeiou]*[aeiou][^aeiou]*$/;
  for (const w of D.KLINKER_WOORDEN.kort) assert.ok(kort.test(w) && !lang.test(w) && !tweeteken.test(w), w);
  for (const w of D.KLINKER_WOORDEN.lang) assert.ok(lang.test(w) && !tweeteken.test(w.replace(/(aa|ee|oo|uu)/, '')) , w);
  for (const w of D.KLINKER_WOORDEN.tweeteken) assert.ok(tweeteken.test(w), w);
  const alle = alleWoorden(Object.values(D.KLINKER_WOORDEN));
  assert.equal(new Set(alle).size, alle.length, 'geen dubbele woorden');
  for (const [k, l] of D.KLINKER_PAREN) assert.ok(kort.test(k) && lang.test(l) && l.replace(/(.)\1/, '$1') === k, `${k}-${l}`);
  for (const w of D.BEGIN_WOORDEN) assert.ok(/^[a-z]+$/.test(w));
  assert.ok(D.KLINKERS.every(k => !D.MEDEKLINKERS.includes(k)));
});

test('tekens: elk teken heeft een naam, en elke opgave heeft het goede teken als antwoord en een ander teken als afleider', () => {
  const namen = D.TEKENS.map(t => t.naam);
  assert.equal(new Set(namen).size, namen.length);
  for (const t of D.TEKENS) {
    assert.ok(t.gebruik.length >= 2, t.id);
    for (const [zin, goed, fout] of t.gebruik) { assert.ok(zin.includes('__'), zin); assert.ok(!fout.includes(goed) && fout.length === 2 && new Set(fout).size === 2, zin); }
  }
  const woordTeken = D.TEKENS.filter(t => ['apostrof', 'accent', 'trema', 'koppelteken'].includes(t.id));
  for (const t of woordTeken) for (const [zin, goed] of t.gebruik) assert.equal(zin.split('__').length, 2, `${zin}: één open plaats`);
  for (const t of D.TEKENS.filter(x => x.id === 'aanhaling' || x.id === 'haakjes')) for (const [zin] of t.gebruik) assert.equal(zin.split('__').length, 3, `${zin}: twee open plaatsen`);
});

test('trappen van vergelijking: de drie vormen zijn verschillend en de regelmatige volgen de regel', () => {
  const onregelmatig = new Set(['goed', 'veel', 'weinig']);
  for (const [a, b, c] of D.TRAPPEN) {
    assert.equal(new Set([a, b, c]).size, 3);
    if (!onregelmatig.has(a)) { assert.ok(b.startsWith(a.replace(/(.)$/, '').slice(0, Math.max(1, a.length - 2))), `${a} ${b}`); assert.ok(c.endsWith('st') && c.startsWith(a.slice(0, a.length - (a.endsWith('i') ? 0 : 0)).slice(0, 3)), `${a} ${c}`); assert.ok(b.endsWith('er') || b.endsWith('der') || b.endsWith('ier'), `${a} ${b}`); }
  }
});

test('uitdrukkingen, hyponiemen en registers: geen dubbels, elke betekenis is anders, geen woord in twee categorieën', () => {
  assert.equal(new Set(D.UITDRUKKINGEN.map(u => u.zin)).size, D.UITDRUKKINGEN.length);
  assert.equal(new Set(D.UITDRUKKINGEN.map(u => u.betekenis)).size, D.UITDRUKKINGEN.length);
  for (const z of D.LETTERLIJKE_ZINNEN) assert.ok(!D.UITDRUKKINGEN.some(u => u.zin === z));
  const leden = alleWoorden(Object.values(D.CATEGORIEEN));
  assert.equal(new Set(leden).size, leden.length, 'een woord staat in één categorie');
  for (const [cat, l] of Object.entries(D.CATEGORIEEN)) assert.ok(l.length >= 6 && !l.includes(cat), cat);
  for (const [i, f] of D.REGISTER_PAREN) assert.ok(i !== f && /\bu(w)?\b/i.test(f) || /^(Dat|Daar|Mijn|Goedemorgen|Tot)/.test(f), f);
  for (const [, f] of D.REGISTER_PAREN) assert.ok(!/\b(jij|je|jouw|hé)\b/i.test(f), `formeel zonder jij/je: ${f}`);
  for (const w of D.OPDRACHTWOORDEN) assert.ok(w.jaar >= 1 && w.jaar <= 6 && w.doen.endsWith('.'));
});

test('communicatiemodel: de zin bevat de boodschap en de genoemde personen', () => {
  for (const c of D.COMMUNICATIE) { assert.ok(c.zin.includes(c.boodschap) && c.zin.toLowerCase().includes(c.zender.toLowerCase().replace(/^de /, '')), c.zin); assert.ok(D.KANALEN_ALLE.includes(c.kanaal)); }
  for (const m of D.MEDIA) assert.ok(D.MEDIA_NAMEN.includes(m.medium));
  assert.equal(new Set(D.MEDIA.map(m => m.medium)).size, D.MEDIA.length);
});

test('bijzondere spelling: de onjuiste spelling verschilt van de juiste en bevat de klank zoals je hem hoort', () => {
  const klankIn = { 'sj-ch': /sj/, 'zj-ge': /sj|zj/, 'zj-j': /zj/, 'ie-i': /ie/, 'oe-ou': /oe/ };
  const juist = { 'sj-ch': /ch/, 'zj-ge': /ge/, 'zj-j': /^j/, 'ie-i': /i/, 'oe-ou': /ou/ };
  for (const [id, s] of Object.entries(D.SPELLING_BIJZONDER)) {
    assert.ok(s.woorden.length >= 5, id);
    for (const [goed, fout] of s.woorden) { assert.notEqual(goed, fout); assert.match(goed, juist[id], goed); assert.match(fout, klankIn[id], fout); }
  }
});

test('zinsdelen verplaatsen: de persoonsvorm blijft tweede, elk zinsdeel blijft heel en de afleiders breken de regel', () => {
  for (const z of D.VERPLAATS_ZINNEN) for (let i = 1; i < z.length - 1; i++) {
    const v = verplaatsOpbouw(z, i), woorden = v.zin.replace(/\.$/, '').split(' '), pvPlaats = v.voor.split(' ').length;
    assert.equal(woorden[pvPlaats], z[1], `${z.join(' ')}: persoonsvorm staat direct na het eerste zinsdeel`);
    assert.equal(woorden.map(w => w.toLowerCase()).sort().join(' '), z.join(' ').split(' ').map(w => w.toLowerCase()).sort().join(' '), 'alle woorden blijven bestaan');
    for (const fout of [v.fout1, v.fout2]) assert.notEqual(fout, v.zin);
    assert.notEqual(v.fout1.replace(/\.$/, '').split(' ')[pvPlaats], z[1]);
    assert.notEqual(v.fout2.replace(/\.$/, '').split(' ')[pvPlaats], z[1]);
  }
});

// Eigen controle per oefening
const KLINKER_SOORT = (w) => (/(ie|oe|eu|ui|ei|ij|ou|au)/.test(w) ? 'tweetekenklinker' : /(aa|ee|oo|uu)/.test(w) ? 'lange klinker' : 'korte klinker');
const gecontroleerd = {
  'kb-klank': (d) => {
    if (d.soort === 'letter') return d.goed === (D.KLINKERS.includes(d.letter) ? 'klinker' : 'medeklinker');
    if (d.soort === 'begin') return d.goed === ('aeiou'.includes(d.woord[0]) ? 'klinker' : 'medeklinker');
    if (d.soort === 'klank') return d.goed === (/^(ie|oe|eu|ui|ei|ij|ou|au)$/.test(d.klank) ? 'tweetekenklinker' : /^(aa|ee|oo|uu)$/.test(d.klank) ? 'lange klinker' : /^[aeiou]$/.test(d.klank) ? 'korte klinker' : 'medeklinker');
    return d.goed === KLINKER_SOORT(d.woord);
  },
  'kb-paar': (d) => KLINKER_SOORT(d.kort) === 'korte klinker' && KLINKER_SOORT(d.lang) === 'lange klinker' && d.goed === (d.lange ? d.lang : d.kort),
  'kb-letter': (d, o) => { const l = d.letter; const a = o.antwoord; return d.soort === 'hoofd' ? a === l.toUpperCase() : d.soort === 'klein' ? a === l : d.soort === 'na' ? a.charCodeAt(0) === l.charCodeAt(0) + 1 : a.charCodeAt(0) === l.charCodeAt(0) - 1; },
  'kb-teken': (d) => { const t = D.TEKENS.find(x => x.id === d.teken); return d.soort === 'naam' ? d.goed === t.naam && d.vraag.includes(t.teken) : d.soort === 'teken' ? d.goed === t.teken && d.vraag.includes(t.naam) : t.gebruik.some(([z, g]) => z === d.zin && g === d.goed); },
  'kb-trap': (d) => {
    if (d.soort === 'vorm') return d.goed === d.rij[d.gat] && d.rij.length === 3;
    const nr = d.zin.includes(' dan ') ? 1 : d.zin.includes(' het ') ? 2 : 0;
    return nr === d.trap && d.zin.includes(d.rij[nr]) && d.goed === D.TRAP_NAMEN[nr];
  },
  'kb-figuurlijk': (d) => (d.soort === 'betekenis' ? D.UITDRUKKINGEN.find(u => u.zin === d.zin).betekenis === d.goed : d.goed === (D.UITDRUKKINGEN.some(u => u.zin === d.zin) ? 'figuurlijk' : 'letterlijk') && d.fig === (d.goed === 'figuurlijk')),
  'kb-hyponiem': (d) => (d.soort === 'boven' ? d.leden.every(l => D.CATEGORIEEN[d.cat].includes(l)) && new Set(d.leden).size === 3 && d.goed === d.cat : d.leden.every(l => D.CATEGORIEEN[d.cat].includes(l)) && !D.CATEGORIEEN[d.cat].includes(d.vreemd) && d.goed === d.vreemd),
  'kb-register': (d) => (d.soort === 'herken' ? d.goed === (D.REGISTER_PAREN.some(p => p[1] === d.zin) ? 'formeel' : 'informeel') && d.formeel === (d.goed === 'formeel') : d.goed === (d.register === 'formeel' ? d.paar[1] : d.paar[0]) && D.REGISTER_SITUATIES.some(s => s.situatie === d.situatie && s.register === d.register)),
  'kb-communicatie': (d) => { if (d.soort === 'medium') return d.goed === D.MEDIA.find(m => m.cue === d.cue).medium; const c = D.COMMUNICATIE.find(x => x.zin === d.zin); return c[d.soort] === d.goed; },
  'kb-opdracht': (d) => D.OPDRACHTWOORDEN.find(w => w.woord === d.woord).doen === d.goed,
  'sb-kies': (d) => D.SPELLING_BIJZONDER[d.klank].woorden.some(([g, f]) => g === d.goed && f === d.fout) && d.opties.includes(d.fout) && d.opties.includes(d.goed),
  'sb-schrijf': (d) => D.SPELLING_BIJZONDER[d.klank].woorden.some(([g, f]) => g === d.goed && f === d.fout),
  'kz-aanvul': (d) => D.KLANKZUIVER.fs.woorden.includes(d.woord) && d.vraag.startsWith(d.woord.slice(0, -1)) && d.goed === d.woord.slice(-1) && /[fs]$/.test(d.woord),
  'zv-verplaats': (d, o) => { const v = verplaatsOpbouw(d.zin, d.index); return o.antwoord === v.zin && v.voor === d.vooraan; },
  'zv-kies': (d) => { const v = verplaatsOpbouw(d.zin, d.index); return d.goed === v.zin && d.opties.length === 3 && d.opties.includes(v.fout1); },
};

for (const g of BEGRIPPEN_VORMEN) {
  test(`${g.id}: antwoorden kloppen, het antwoord staat bij de opties, geen dubbels en herhaalbaar`, () => {
    for (const doel of g.doelen) for (const seed of SEEDS) {
      const opties = g.opties(g.doelen, {}, doel), res = g.genereer({ seed, aantal: 8, opties });
      assert.ok(res.oefeningen.length >= 3, `${g.id} ${doel} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) {
        const d = o.data, controle = gecontroleerd[d.type];
        assert.ok(controle, `${g.id}: geen controle voor ${d.type}`);
        assert.ok(controle(d, o), `${g.id} ${doel}: ${o.tekst}`);
        if (d.opties) { assert.ok(d.opties.includes(o.antwoord), `${o.tekst}: antwoord staat bij de opties`); assert.equal(new Set(d.opties).size, d.opties.length); assert.ok(o.tekst.includes(d.opties[0])); }
        assert.ok(o.antwoord && o.volledig);
      }
      assert.deepEqual(g.genereer({ seed, aantal: 8, opties }), res);
    }
  });
}
