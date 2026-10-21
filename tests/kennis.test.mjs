import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VERBEN } from '../js/subjects/taal/woorden/werkwoorden.js';
import { VOORVOEGSELS, ACHTERVOEGSELS } from '../js/subjects/taal/woorden/woordbouw.js';
import { SAMENSTELLINGEN } from '../js/subjects/taal/woorden/samenstellingen.js';
import { WERKWOORDKENNIS_VORMEN, REGELMATIG_STAM } from '../js/subjects/taal/generators/werkwoordkennis.js';
import { WOORDBOUW_VORMEN, SAMENSTELLING_LIJST, ENKELE_WOORDEN, AFLEIDINGEN } from '../js/subjects/taal/generators/woordbouw.js';

const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);

/* ---- eigen werkwoordregels (los van de generators) */
function stamRegel(inf) {
  const voor = /^(ver|her|ont)/.test(inf) ? inf.slice(0, 3) : inf === 'bestellen' ? 'be' : '';
  let s = inf.slice(voor.length, -2);
  if (/([^aeiou])\1$/.test(s)) s = s.slice(0, -1);
  else if (/(^|[^aeiou])[aeiou][^aeiouwj]$/.test(s) && (s.match(/(?:ij|[aeiouy])+/g) || []).length === 1) s = s.replace(/([aeiou])([^aeiou])$/, '$1$1$2');
  s = s.replace(/v$/, 'f').replace(/z$/, 's');
  return voor + s;
}
const kofschip = (inf) => 'tkfschp'.includes(inf.slice(0, -2).at(-1));
const STERK_STAM = { lopen: 'loop', komen: 'kom', zien: 'zie', eten: 'eet', drinken: 'drink', geven: 'geef', nemen: 'neem', schrijven: 'schrijf', vinden: 'vind', zitten: 'zit', slapen: 'slaap', lezen: 'lees' };
const ZIJN_WERKWOORDEN = ['komen', 'verhuizen', 'gaan', 'zijn', 'worden', 'blijven', 'vallen', 'vertrekken', 'blijven'];

test('werkwoordkennis: de stam in de data volgt de regel (of staat in de tabel van sterke werkwoorden)', () => {
  assert.ok(REGELMATIG_STAM.length >= 40);
  for (const v of REGELMATIG_STAM) {
    if (v.soort === 'zwak') assert.equal(v.stam, stamRegel(v.inf), v.inf);
    else if (STERK_STAM[v.inf]) assert.equal(v.stam, STERK_STAM[v.inf], v.inf);
    assert.ok(v.inf.startsWith(v.stam.slice(0, 2)) || ['komen', 'zien'].includes(v.inf) || v.stam.length > 1, v.inf);
  }
  const mogelijk = VERBEN.filter(v => v.hulp && v.zinsdeel);
  for (const v of mogelijk) assert.equal(v.hulp === 'zijn', ZIJN_WERKWOORDEN.includes(v.inf), `${v.inf}: hulpwerkwoord`);
});

const alsTekst = (v) => v;
const verifieer = {
  'wk-stam': (d, o) => { const v = VERBEN.find(x => x.inf === d.inf); assert.equal(d.stam, v.soort === 'zwak' ? stamRegel(d.inf) : STERK_STAM[d.inf] ?? v.stam); assert.equal(o.antwoord, d.stam); },
  'wk-inf': (d, o) => {
    const v = VERBEN.find(x => x.inf === d.inf); assert.equal(o.antwoord, d.inf);
    if (v.soort === 'zwak' && !v.ott) { const stam = stamRegel(d.inf); assert.equal(d.vorm, d.persoon === 'ik' ? stam : stam.endsWith('t') ? stam : stam + 't'); }
    assert.ok(o.tekst.includes(d.vorm));
  },
  'wk-uitgang': (d, o) => {
    assert.equal(d.stam + d.uitgang, d.vorm); assert.equal(d.stam, stamRegel(d.inf));
    assert.equal(d.uitgang, d.verleden ? (kofschip(d.inf) ? 'te' : 'de') : 't'); assert.equal(o.antwoord, `${d.stam} + ${d.uitgang}`);
    assert.ok(!d.stam.endsWith('t'));
  },
  'wk-tijd': (d, o) => {
    const v = VERBEN.find(x => x.inf === d.inf), mv = ['wij', 'kinderen'].includes(d.persoon);
    assert.ok(d.tijden.includes(d.tijd)); assert.equal(o.antwoord, { ott: 'tegenwoordige tijd', ovt: 'verleden tijd', tt: 'toekomende tijd' }[d.tijd]);
    if (d.tijd === 'tt') assert.match(d.zin, new RegExp(`${mv ? 'zullen' : 'zal'}.* ${d.inf}\\.$`));
    if (d.tijd === 'ovt') { assert.ok(d.zin.includes(` ${v.ovt[mv ? 1 : 0]} `) || d.zin.includes(` ${v.ovt[mv ? 1 : 0]}.`)); if (v.soort === 'zwak') assert.ok(d.zin.includes(stamRegel(d.inf) + (kofschip(d.inf) ? 'te' : 'de') + (mv ? 'n' : ''))); }
    if (d.tijd === 'ott' && v.soort === 'zwak' && !v.ott) { const s = stamRegel(d.inf); assert.ok(d.zin.includes(` ${mv ? d.inf : d.persoon === 'ik' ? s : s.endsWith('t') ? s : s + 't'}`)); }
    assert.ok(d.tijden.length === (o.tekst.split('\n')[1].split(/ {3,}/).length), 'alle tijden staan bij de opdracht');
  },
  'wk-deelwoord': (d, o) => {
    const v = VERBEN.find(x => x.inf === d.inf);
    if (v.soort === 'zwak') { const s = stamRegel(d.inf), e = kofschip(d.inf) ? 't' : 'd'; assert.equal(d.vd, (/^(ver|her|ont)/.test(d.inf) || d.inf === 'bestellen' ? '' : 'ge') + s + (s.endsWith(e) ? '' : e)); }
    assert.equal(o.antwoord, d.vd); assert.ok(d.zin.endsWith(` ${d.vd}.`));
    assert.equal(d.hulp === 'zijn', ZIJN_WERKWOORDEN.includes(d.inf));
    assert.match(d.zin, d.hulp === 'zijn' ? / (ben|is|zijn) / : / (heb|heeft|hebben) /);
  },
  'wk-hulp': (d, o) => {
    assert.equal(d.opties.length, 2); assert.ok(d.opties.includes(d.juist) && o.antwoord === d.juist);
    const tabel = { hebben: { ik: 'heb', hij: 'heeft', wij: 'hebben', kinderen: 'hebben' }, zijn: { ik: 'ben', hij: 'is', wij: 'zijn', kinderen: 'zijn' } };
    assert.equal(d.juist, tabel[ZIJN_WERKWOORDEN.includes(d.inf) ? 'zijn' : 'hebben'][d.persoon]);
    assert.notEqual(d.opties[0], d.opties[1]); assert.ok(o.tekst.includes('____'));
  },
};
const PREFIXEN = ['ver', 'her', 'on', 'ont', 'mis', 'be', 'ge'], SUFFIXEN = ['heid', 'lijk', 'baar', 'schap', 'ing', 'zaam', 'ig', 'loos'];
verifieer['wb-herken'] = (d, o) => {
  const samen = SAMENSTELLING_LIJST.map(s => s.woord); assert.equal(d.woorden.filter(w => samen.includes(w)).length, 1); assert.equal(o.antwoord, d.samenstelling); assert.equal(d.woorden.length, 4); assert.equal(new Set(d.woorden).size, 4);
};
verifieer['wb-splits'] = (d, o) => { assert.equal(d.a + d.b, d.woord); assert.ok(Object.values(SAMENSTELLINGEN).flat().some(([a, b]) => a === d.a && b === d.b)); assert.equal(o.antwoord, `${d.a} + ${d.b}`); };
verifieer['wb-grond'] = (d, o) => { assert.equal(d.soort === 'voorvoegsel' ? d.affix + d.grond : d.grond + d.affix, d.woord); assert.equal(o.antwoord, d.grond); };
verifieer['wb-affix'] = (d, o) => { assert.equal(o.antwoord, d.soort); assert.ok(d.soort === 'voorvoegsel' ? PREFIXEN.includes(d.affix) : SUFFIXEN.includes(d.affix)); assert.equal(d.soort === 'voorvoegsel' ? d.woord.startsWith(d.affix) : d.woord.endsWith(d.affix), true); };
verifieer['wb-maak'] = (d, o) => { assert.equal(o.antwoord, d.woord); assert.ok(o.tekst.includes(d.affix) && o.tekst.includes(d.grond)); };

for (const v of [...WERKWOORDKENNIS_VORMEN, ...WOORDBOUW_VORMEN]) {
  test(`${v.id}: antwoorden kloppen met de gegevens en de spellingregels, geen dubbels, herhaalbaar`, () => {
    for (const doel of v.doelen) for (const seed of SEEDS) {
      const opties = v.opties(v.doelen, {}, doel), res = v.genereer({ seed, aantal: 6, opties });
      assert.equal(opties.doel, doel);
      assert.ok(res.oefeningen.length >= 4, `${v.id} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) { assert.ok(o.antwoord && o.volledig); verifieer[o.data.type](o.data, o); }
      assert.deepEqual(v.genereer({ seed, aantal: 6, opties }), res);
    }
  });
}

test('woordbouw: voorvoegsels en achtervoegsels kloppen en enkele woorden zijn geen samenstelling', () => {
  for (const [affix, grond, woord] of VOORVOEGSELS) { assert.equal(affix + grond, woord); assert.ok(PREFIXEN.includes(affix)); }
  for (const [affix, grond, woord] of ACHTERVOEGSELS) { assert.equal(grond + affix, woord); assert.ok(SUFFIXEN.includes(affix)); }
  assert.equal(new Set(AFLEIDINGEN.map(a => a.woord)).size, AFLEIDINGEN.length);
  const delen = new Set(SAMENSTELLING_LIJST.flatMap(s => [s.a, s.b])), samen = new Set(SAMENSTELLING_LIJST.map(s => s.woord));
  for (const w of ENKELE_WOORDEN) { assert.ok(!samen.has(w), w); for (const a of delen) if (w.startsWith(a) && w.length > a.length) assert.ok(!delen.has(w.slice(a.length)), `${w} lijkt een samenstelling: ${a} + ${w.slice(a.length)}`); }
  assert.ok(SAMENSTELLING_LIJST.length >= 40);
});

test('werkwoordkennis en woordbouw: elke vorm hoort bij de juiste Op.stap-doelen', () => {
  const d = Object.fromEntries([...WERKWOORDKENNIS_VORMEN, ...WOORDBOUW_VORMEN].map(v => [v.id, v.doelen]));
  assert.deepEqual(d['wk-stam'], ['1.5.GL4.20', '1.5.GL4.19']); assert.deepEqual(d['wk-infinitief'], ['1.5.GL4.18', '1.5.GL4.17']); assert.deepEqual(d['wk-uitgang'], ['1.5.GL4.21', '1.5.GL4.8']);
  assert.deepEqual(d['wk-tijd'], ['1.5.GL4.23']); assert.deepEqual(d['wk-tijd-toekomend'], ['1.5.GL6.13']); assert.deepEqual(d['wk-deelwoord'], ['1.5.GL5.14', '1.5.GL5.13']); assert.deepEqual(d['wk-hulpwerkwoord'], ['1.5.GL5.15']);
  assert.deepEqual(d['wb-herken'], ['1.5.GL2.1', '1.5.GL2.15', '1.5.GL2.44']); assert.ok(d['wb-splits'].includes('1.5.GL2.18'));
});
