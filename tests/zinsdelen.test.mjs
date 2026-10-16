import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZINNEN, ZINSTYPES } from '../js/subjects/taal/woorden/zinsdelen.js';
import { VERBEN } from '../js/subjects/taal/woorden/werkwoorden.js';
import { ZINSDELEN_VORMEN } from '../js/subjects/taal/generators/zinsdelen.js';

const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);
const VOORZETSELS = ['aan', 'in', 'op', 'naar', 'om', 'met', 'voor', 'van', 'bij', 'onder', 'achter', 'naast', 'tussen', 'uit', 'door', 'over'];
const KOPPELWERKWOORDEN = ['is', 'ben', 'zijn', 'wordt', 'blijft', 'lijkt', 'smaakt'];
const SCHEIDING = ['en', 'maar', 'want', 'omdat', 'dus', 'terwijl'];
const MEERVOUD = /^(wij|zij|jullie|de kinderen|de vogels)$/i;

/* ---- eigen werkwoordregel voor de stam (los van de generators) */
function stamRegel(inf) {
  const voor = /^(ver|her|ont)/.test(inf) ? inf.slice(0, 3) : inf === 'bestellen' ? 'be' : '';
  let s = inf.slice(voor.length, -2);
  if (/([^aeiou])\1$/.test(s)) s = s.slice(0, -1);
  else if (/(^|[^aeiou])[aeiou][^aeiouwj]$/.test(s) && (s.match(/(?:ij|[aeiouy])+/g) || []).length === 1) s = s.replace(/([aeiou])([^aeiou])$/, '$1$1$2');
  s = s.replace(/v$/, 'f').replace(/z$/, 's');
  return voor + s;
}

test('zinsdelen: elke zin heeft een onderwerp, een gezegde en klopt met de grammatica', () => {
  assert.ok(ZINNEN.length >= 28);
  const gezien = new Set();
  for (const z of ZINNEN) {
    assert.ok(!gezien.has(z.tekst), z.tekst); gezien.add(z.tekst);
    const rollen = z.delen.map(d => d.rol);
    assert.ok(rollen.every(r => ['o', 'g', 'ng', 'lv', 'mv', 'b'].includes(r)), z.tekst);
    assert.equal(rollen.filter(r => r === 'o').length, 1, `${z.tekst}: één onderwerp`);
    assert.ok(rollen.includes('g'), z.tekst);
    assert.equal(z.soort === 'naamwoordelijk', rollen.includes('ng'));
    if (z.soort === 'naamwoordelijk') { assert.equal(rollen.filter(r => r === 'g').length, 1); assert.ok(KOPPELWERKWOORDEN.includes(z.delen.find(d => d.rol === 'g').tekst), `${z.tekst}: koppelwerkwoord`); assert.ok(!rollen.includes('lv') && !rollen.includes('mv')); }
    else assert.ok(!z.delen.some(d => d.rol === 'g' && KOPPELWERKWOORDEN.includes(d.tekst) && !['zijn'].includes(d.tekst)), `${z.tekst}: koppelwerkwoord hoort bij een naamwoordelijk gezegde`);
    if (rollen.includes('mv')) assert.ok(rollen.includes('lv'), `${z.tekst}: meewerkend voorwerp zonder lijdend voorwerp`);
    for (const d of z.delen.filter(x => x.rol === 'lv' || x.rol === 'mv')) assert.ok(!VOORZETSELS.includes(d.tekst.split(' ')[0].toLowerCase()), `${z.tekst}: ${d.tekst} begint met een voorzetsel`);
    // persoonsvorm = eerste deel van het gezegde, en past bij het onderwerp
    const o = z.delen.find(d => d.rol === 'o').tekst, pv = z.delen.find(d => d.rol === 'g').tekst;
    if (MEERVOUD.test(o)) assert.match(pv, /(en|zijn)$/, `${z.tekst}: meervoud`);
    else if (/^ik$/i.test(o)) assert.ok(pv === 'ben' || !/t$/.test(pv), z.tekst);
    else assert.match(pv, /(t|is)$/, `${z.tekst}: enkelvoud derde persoon`);
    assert.match(z.tekst, /^[A-Z].*[.!?]$/);
  }
  assert.ok(ZINNEN.filter(z => z.delen[0].rol !== 'o').length >= 2, 'ook zinnen met omzetting');
  assert.ok(ZINNEN.filter(z => z.delen.some(d => d.rol === 'lv')).length >= 12 && ZINNEN.filter(z => z.delen.some(d => d.rol === 'mv')).length >= 6);
  assert.ok(ZINNEN.filter(z => z.soort === 'naamwoordelijk').length >= 6);
  assert.ok(ZINNEN.filter(z => z.delen.filter(d => d.rol === 'g').length === 2).length >= 2, 'ook een gezegde in twee stukken');
});

test('zinstypes: enkelvoudig heeft geen nevenschikkend voegwoord, samengesteld wel; ontkennend heeft niet of geen', () => {
  const gezien = new Set();
  for (const [zin, soort, ontk] of ZINSTYPES) {
    assert.ok(!gezien.has(zin)); gezien.add(zin);
    const woorden = zin.replace(/[.!?]$/, '').toLowerCase().split(' ');
    assert.equal(woorden.some(w => SCHEIDING.includes(w)), soort === 's', zin);
    assert.equal(woorden.some(w => ['niet', 'geen', 'nooit'].includes(w)), ontk, zin);
    assert.match(zin, /^[A-Z].*\.$/);
  }
  for (const s of ['e', 's']) for (const o of [true, false]) assert.ok(ZINSTYPES.filter(z => z[1] === s && z[2] === o).length >= 2, `${s} ${o}`);
});

const zinVan = (tekst) => ZINNEN.find(z => z.tekst === tekst);
const verifieer = {
  'zd-gezegde': (d, o) => {
    const z = zinVan(d.zin); assert.ok(z);
    const verwacht = z.delen.filter(x => x.rol === 'g').map(x => x.tekst).join(' ... ') + (z.soort === 'naamwoordelijk' ? ' ' + z.delen.find(x => x.rol === 'ng').tekst : '');
    assert.equal(d.gezegde, verwacht); assert.equal(o.antwoord, verwacht);
  },
  'zd-gezegde-soort': (d, o) => { const z = zinVan(d.zin); assert.equal(d.soort, z.delen.some(x => x.rol === 'ng') ? 'naamwoordelijk' : 'werkwoordelijk'); assert.equal(o.antwoord, `${d.soort} gezegde`); },
  'zd-voorwerp': (d, o) => { const z = zinVan(d.zin); assert.equal(z.delen.find(x => x.rol === d.rol).tekst, d.antwoord); assert.equal(o.antwoord, d.antwoord); assert.equal(z.delen.filter(x => x.rol === d.rol).length, 1); },
  'zd-welke': (d, o) => {
    const z = zinVan(d.zin); assert.equal(z.delen.find(x => x.rol === d.rol).tekst, d.antwoord);
    assert.equal(d.opties.length, 3); assert.equal(new Set(d.opties).size, 3); assert.ok(d.opties.includes(d.antwoord)); assert.equal(o.antwoord, d.antwoord);
    for (const x of d.opties) assert.ok(z.delen.some(y => y.tekst === x && y.rol !== 'g' && y.rol !== 'ng'));
  },
  'zd-opdelen': (d, o) => {
    const z = zinVan(d.zin); assert.deepEqual(d.delen, z.delen.map(x => x.tekst)); assert.equal(o.antwoord, d.delen.join(' | '));
    assert.equal(z.delen.filter(x => x.rol === 'g').length, 1); assert.equal(z.soort, 'werkwoordelijk'); assert.equal(d.delen.join(' ').replace(/^./, c => c.toUpperCase()) + z.punt, z.tekst.replace(/^./, c => c.toUpperCase()));
  },
  'zk-bouw': (d, o) => { const r = ZINSTYPES.find(z => z[0] === d.zin); assert.equal(d.soort, r[1]); assert.equal(o.antwoord, r[1] === 'e' ? 'enkelvoudige zin' : 'samengestelde zin'); },
  'zk-ontkenning': (d, o) => { const r = ZINSTYPES.find(z => z[0] === d.zin); assert.equal(d.ontkennend, r[2]); assert.equal(o.antwoord, r[2] ? 'ja' : 'nee'); },
  'gw-herken': (d, o) => {
    const v = VERBEN.find(x => x.inf === d.inf); assert.ok(v.stam && !v.ott);
    const stam = v.soort === 'zwak' ? stamRegel(d.inf) : v.stam; assert.equal(d.zinnen.length, 3); assert.deepEqual([...d.soorten].sort(), ['bevel', 'mededeling', 'vraag']);
    const bevel = d.zinnen[d.soorten.indexOf('bevel')]; assert.equal(bevel, `${stam[0].toUpperCase() + stam.slice(1)} ${v.zinsdeel}!`);
    assert.equal(d.zinnen[d.soorten.indexOf('vraag')], `${stam[0].toUpperCase() + stam.slice(1)} jij ${v.zinsdeel}?`);
    assert.equal(d.zinnen[d.soorten.indexOf('mededeling')], `Jij ${stam.endsWith('t') ? stam : stam + 't'} ${v.zinsdeel}.`);
    assert.equal(d.soorten[d.juist], 'bevel'); assert.ok(o.antwoord.endsWith(bevel));
  },
  'gw-maak': (d, o) => {
    const v = VERBEN.find(x => x.inf === d.inf), stam = v.soort === 'zwak' ? stamRegel(d.inf) : v.stam;
    assert.equal(d.bevel, `${stam[0].toUpperCase() + stam.slice(1)} ${v.zinsdeel}!`); assert.equal(o.antwoord, d.bevel); assert.ok(d.bevel.endsWith('!') && !d.bevel.includes(' jij'));
  },
};
for (const v of ZINSDELEN_VORMEN) {
  test(`${v.id}: antwoorden kloppen met de zinsanalyse, geen dubbels, herhaalbaar`, () => {
    for (const doel of v.doelen) for (const seed of SEEDS) {
      const opties = v.opties(v.doelen, {}, doel), res = v.genereer({ seed, aantal: 6, opties });
      assert.equal(opties.doel, doel);
      assert.ok(res.oefeningen.length >= 4, `${v.id} ${doel} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) { assert.ok(o.antwoord && o.volledig); verifieer[o.data.type](o.data, o); }
      assert.deepEqual(v.genereer({ seed, aantal: 6, opties }), res);
    }
  });
}
test('zinsdelen: in het 4de leerjaar enkel werkwoordelijke gezegdes', () => {
  const g = ZINSDELEN_VORMEN[0];
  for (const seed of SEEDS) for (const o of g.genereer({ seed, aantal: 6, opties: g.opties(g.doelen, {}, '1.5.GL4.29') }).oefeningen) assert.equal(o.data.soort, 'werkwoordelijk');
});
