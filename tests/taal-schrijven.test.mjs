import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHRIJVEN_VORMEN, WOORD_DOELEN, ZIN_DOELEN, FOUT_DOELEN, SCHRIJF_DOELEN } from '../js/subjects/taal/generators/schrijven.js';
import { SCHRIJFZINNEN_VORMEN } from '../js/subjects/taal/generators/schrijven-zinnen.js';
import { UITBREIDEN, VERBINDEN, ZINWOORDEN } from '../js/subjects/taal/woorden/schrijven.js';
import { REEKSEN, PLAATJES, plaatjesVoor, plaatjeSvg } from '../js/subjects/taal/woorden/plaatjes.js';
import { spellingFouten } from '../js/subjects/taal/spelregels.js';

const vorm = (id) => [...SCHRIJVEN_VORMEN, ...SCHRIJFZINNEN_VORMEN].find(v => v.id === id);
const maak = (id, doel, extra = {}, aantal = 10, seed = 7) => {
  const v = vorm(id);
  return v.genereer({ seed, aantal, opties: v.opties([doel], extra, doel) });
};

test('elk plaatjeswoord heeft een tekening, en een woord komt maar één keer voor', () => {
  const woorden = PLAATJES.map(p => p.w);
  assert.equal(new Set(woorden).size, woorden.length);
  for (const p of PLAATJES) {
    const svg = plaatjeSvg(p.w);
    assert.ok(svg.markup.startsWith('<svg') && svg.breedte > 0 && svg.hoogte > 0, p.w);
    assert.ok(['de', 'het'].includes(p.lid), p.w);
    assert.equal(spellingFouten(p.w, {}).length, 0, p.w);
  }
});

test('de woorden passen bij hun spellingdoel: mkm = klinker tussen twee medeklinkers, tek = tweetekenklank zonder cluster', () => {
  for (const p of plaatjesVoor('mkm')) assert.match(p.w, /^[^aeiou][aeiou][^aeiou]$/, p.w);
  for (const p of plaatjesVoor('tek')) {
    assert.match(p.w, /(ei|ij|ou|au|ie|oe|eu|ui)/, p.w);
    assert.doesNotMatch(p.w.replace(/(ei|ij|ou|au|ie|oe|eu|ui)/, 'a'), /[^aeiou]{2}/, `${p.w}: medeklinkercluster`);
  }
});

test('woord bij het plaatje: elke hulpvorm geeft tien verschillende oefeningen met plaatje boven de tekst', () => {
  for (const doel of WOORD_DOELEN) for (const hulp of ['geen', 'letter', 'vakjes']) {
    const res = maak('sw-plaatje-woord', doel, { hulp }, 6);
    assert.equal(res.oefeningen.length, 6, `${doel} ${hulp}`);
    for (const o of res.oefeningen) {
      assert.ok(o.svg && o.svgBoven, `${doel} ${hulp}`);
      assert.ok(plaatjesVoor(doel === '1.3.GL1.18' ? 'tek' : 'mkm').some(p => p.w === o.antwoord));
      if (hulp === 'vakjes') assert.equal((o.svg.markup.match(/<rect [^>]*width="42"/g) || []).length, o.antwoord.length);
      if (hulp === 'letter') assert.ok(o.tekst.includes(`de ${o.antwoord[0]}.`));
      if (hulp !== 'vakjes') assert.ok(/_{8,}/.test(o.tekst));
    }
  }
});

test('zin afmaken: het ontbrekende woord past bij het plaatje en de zin is dan juist', () => {
  for (const woordhulp of ['geen', 'kiezen']) {
    const res = maak('sw-plaatje-zin', ZIN_DOELEN[0], { woordhulp }, 8);
    assert.equal(res.oefeningen.length, 8);
    for (const o of res.oefeningen) {
      assert.ok(o.tekst.includes('____') && !o.volledig.includes('____'));
      assert.ok(o.volledig.includes(o.antwoord) && /^[A-Z].*[.!]$/.test(o.volledig));
      if (woordhulp === 'kiezen') assert.ok(o.tekst.split('\n')[1].split(/\s+/).includes(o.antwoord) && o.tekst.split('\n')[1].split(/\s+/).length === 3);
    }
  }
});

test('woordkaartjes: de kaartjes bevatten precies de woorden van de zin, in een andere volgorde', () => {
  const res = maak('sw-knip', '1.5.GL1.11', {}, 8);
  assert.equal(res.oefeningen.length, 8);
  for (const o of res.oefeningen) {
    const kaartjes = o.data.kaartjes, juist = o.antwoord;
    assert.notEqual(kaartjes.join(' '), juist.replace(/[.!?]$/, m => ` ${m}`).replace(/^./, c => c.toLowerCase()));
    const gelegd = kaartjes.filter(k => !/^[.!?]$/.test(k)).map(k => k.toLowerCase()).sort().join(' ');
    assert.equal(gelegd, juist.slice(0, -1).split(' ').map(k => k.toLowerCase()).sort().join(' '));
    assert.ok(kaartjes.includes(juist.slice(-1)));
    assert.ok(o.svg.markup.includes('<rect'));
  }
});

test('zin met een fout: precies één soort fout, het antwoord is de juiste zin', () => {
  for (const doel of FOUT_DOELEN) {
    const res = maak('sw-fout', doel, {}, 8);
    assert.equal(res.oefeningen.length, 8, doel);
    for (const o of res.oefeningen) {
      const { fout, juist, soort } = o.data;
      assert.notEqual(fout, juist);
      assert.equal(o.antwoord, juist);
      if (soort === 'spatie') assert.equal(fout.replace(/ /g, ''), juist.replace(/ /g, ''));
      if (soort === 'hoofdletter') assert.equal(fout, juist.charAt(0).toLowerCase() + juist.slice(1));
      if (soort === 'leesteken') assert.equal(fout, juist.slice(0, -1));
      assert.equal(soort === 'spatie', ['1.3.GL1.8', '1.3.GL2.39'].includes(doel), `${doel}: ${soort}`);
    }
  }
});

test('zin bij het plaatje: twee lijnen, het woord staat er enkel bij als de leerkracht dat kiest, en het antwoord is een voorbeeld', () => {
  for (const doel of SCHRIJF_DOELEN) for (const zinhulp of ['woord', 'geen']) {
    const res = maak('sw-plaatje-schrijf', doel, { zinhulp }, 6);
    assert.equal(res.oefeningen.length, 6);
    for (const o of res.oefeningen) {
      assert.equal(o.tekst.split('\n').filter(r => /^_{8,}$/.test(r)).length, 2);
      assert.equal(o.svg.markup.includes('<text'), zinhulp === 'woord');
      assert.ok(o.volledig.startsWith('Bijvoorbeeld') && o.data.open);
    }
  }
});

const zinOk = (z) => /^[A-Z][^.!?]*[.!?]$/.test(z);

test('zin uitbreiden: de voorbeelden zijn correcte zinnen die het basiswoord behouden en langer zijn', () => {
  for (const i of UITBREIDEN) for (const u of ['waar', 'wanneer', 'hoe', 'alle']) {
    assert.ok(zinOk(i[u]) && i[u].length > i.basis.length, i[u]);
    const werkwoord = i.basis.replace('.', '').split(' ').pop();
    assert.ok(i[u].includes(werkwoord), `${i[u]} bevat ${werkwoord}`);
  }
  for (const uitbreiding of ['mix', 'waar', 'wanneer', 'hoe', 'alle']) {
    const res = maak('sw-uitbreiden', '1.5.GL2.40', { uitbreiding }, 8);
    assert.equal(res.oefeningen.length, 8, uitbreiding);
    for (const o of res.oefeningen) { assert.ok(/_{8,}/.test(o.tekst) && zinOk(o.antwoord)); if (uitbreiding !== 'mix') assert.equal(o.data.uitbreiding, uitbreiding); }
  }
});

test('twee zinnen samenvoegen: het antwoord bevat beide zinnen en het verbindingswoord', () => {
  for (const v of VERBINDEN) {
    assert.ok(zinOk(v.samen) && new RegExp(`\\b${v.w}\\b`).test(v.samen), v.samen);
    assert.ok(v.samen.toLowerCase().startsWith(v.a.slice(0, -1).toLowerCase()), v.samen);
  }
  for (const verbinding of ['alle', 'en', 'maar', 'want', 'omdat']) {
    const res = maak('sw-samen', '1.5.GL2.40', { verbinding }, 2);
    assert.equal(res.oefeningen.length, 2, verbinding);
    for (const o of res.oefeningen) { assert.ok(o.tekst.includes(`Verbind met: ${o.data.woord}`)); if (verbinding !== 'alle') assert.equal(o.data.woord, verbinding); }
  }
});

test('vraag bij het plaatje: plaatje boven, een vraaglijn en een antwoordlijn, vraagwoorden enkel op verzoek', () => {
  for (const vraaghulp of ['woorden', 'geen']) {
    const res = maak('sw-vraag', '1.5.GL2.42', { vraaghulp }, 6);
    assert.equal(res.oefeningen.length, 6);
    for (const o of res.oefeningen) {
      assert.ok(o.svg && o.svgBoven && o.tekst.includes('Vraag:') && o.tekst.includes('Antwoord:'));
      assert.equal(o.tekst.includes('Begin je vraag met'), vraaghulp === 'woorden');
      assert.ok(/\?/.test(o.antwoord));
    }
  }
});

test('zin met opgegeven woorden: twee of drie verschillende woorden uit de lijst', () => {
  for (const aantalWoorden of ['2', '3']) {
    const res = maak('sw-woorden', '1.3.GL2.29', { aantalWoorden }, 10);
    assert.equal(res.oefeningen.length, 10);
    for (const o of res.oefeningen) { assert.equal(o.data.woorden.length, Number(aantalWoorden)); assert.equal(new Set(o.data.woorden).size, o.data.woorden.length); assert.ok(o.data.woorden.every(w => ZINWOORDEN.includes(w))); }
  }
});

test('plaatjesreeks: elke reeks heeft drie stappen en drie zinnen, de volgorde is nooit al juist en de oplossing noemt de goede nummers', () => {
  for (const r of REEKSEN) assert.ok(r.stappen.length === 3 && r.zinnen.length === 3 && r.zinnen.every(zinOk), r.id);
  const res = maak('sw-reeks', '1.3.GL2.34', {}, 4);
  assert.equal(res.oefeningen.length, 4);
  for (const o of res.oefeningen) {
    assert.notEqual(o.data.orde.join(''), '012');
    assert.deepEqual([...o.data.orde].sort(), [0, 1, 2]);
    assert.ok(o.svg && o.antwoordSvg && o.svgBoven);
    assert.equal((o.tekst.match(/_{8,}/g) || []).length, 3);
    assert.ok(o.antwoordSvg.markup.includes('font-weight="bold"') && !o.svg.markup.includes('font-weight="bold"'));
    assert.ok(o.antwoord.includes(`Van links naar rechts: ${o.data.orde.map(i => i + 1).join(', ')}`));
  }
});
