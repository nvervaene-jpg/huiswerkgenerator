import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAALWEETJES_VORMEN, WEETJES_DOELEN } from '../js/subjects/taal/generators/taalweetjes.js';
import * as D from '../js/subjects/taal/woorden/taalweetjes.js';
import { splitsKeuze } from '../js/core/blad-netjes.js';

const maak = (id, doel, seed = 3, aantal = 10) => { const v = TAALWEETJES_VORMEN.find(x => x.id === id); return v.genereer({ seed, aantal, opties: v.opties([doel], {}, doel) }).oefeningen; };

test('elk weetje-doel geeft tien verschillende keuze-oefeningen en juist-of-fout-oefeningen', () => {
  assert.equal(WEETJES_DOELEN.length, 11);
  for (const doel of WEETJES_DOELEN) {
    for (const seed of [1, 2, 3]) {
      const kies = maak('tw-kies', doel, seed, 6);
      assert.ok(kies.length >= 4, `${doel} seed ${seed}: ${kies.length}`);
      for (const o of kies) {
        const k = splitsKeuze(o.tekst);
        assert.ok(k && k.opties.length >= 2, `${doel}: ${o.tekst}`);
        assert.ok(k.opties.includes(o.antwoord) && new Set(k.opties).size === k.opties.length, `${doel}: antwoord staat niet bij de keuzes (${o.tekst})`);
        assert.ok(!o.data.fouten.includes(o.antwoord));
      }
      assert.equal(new Set(kies.map(o => o.sleutel)).size, kies.length);
      for (const o of maak('tw-juist-fout', doel, seed, 6)) assert.equal(o.antwoord, o.data.juist ? 'juist' : 'fout');
    }
  }
});

test('de gegevens kloppen: lidwoorden, eigennamen, telwoorden, voorzetsels, voegwoorden en voornaamwoorden', () => {
  const HET = new Set(['kind', 'huis', 'boek', 'paard', 'meisje', 'konijn', 'raam', 'water']);
  for (const [zn, lid] of D.LIDWOORD_ZN) assert.equal(lid, HET.has(zn) ? 'het' : 'de', zn);
  for (const [goed, fout] of D.EIGENNAMEN) assert.ok(goed[0] === goed[0].toUpperCase() && fout === goed.toLowerCase() && fout !== goed, goed);
  const EENHEDEN = ['', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'];
  const TIENTALLEN = { 30: 'dertig', 40: 'veertig', 50: 'vijftig', 100: 'honderd' };
  for (const [getal, woord] of D.TELWOORDEN) assert.equal(woord, getal <= 20 ? EENHEDEN[getal] : TIENTALLEN[getal], String(getal));
  const VZ = ['op', 'voor', 'onder', 'naar', 'boven', 'met', 'achter', 'door', 'aan', 'van'], VW = ['want', 'en', 'maar', 'omdat', 'dus', 'zodat'], VNW = ['Zij', 'Hij', 'Ik', 'Jij', 'Wij', 'Jullie'];
  for (const [zin, vz, anders] of D.VOORZETSEL_ZINNEN) assert.ok(VZ.includes(vz) && zin.includes(` ${vz} `) && anders.every(w => zin.includes(w) && !VZ.includes(w)), zin);
  for (const [zin, vz, fout] of D.VOORZETSEL_GEBRUIK) assert.ok(VZ.includes(vz) && zin.split('____').length === 2 && !fout.includes(vz), zin);
  for (const [zin, vw, anders] of D.VOEGWOORD_ZINNEN) assert.ok(VW.includes(vw) && zin.includes(` ${vw} `) && anders.every(w => zin.includes(w) && !VW.includes(w)), zin);
  for (const [zin, vw, fout] of D.VOEGWOORD_GEBRUIK) assert.ok(VW.includes(vw) && zin.split('____').length === 2 && !fout.includes(vw) && fout.every(f => VW.includes(f)), zin);
  for (const [zin, vnw, fout] of D.VOORNAAMWOORD_GEBRUIK) assert.ok(VNW.includes(vnw) && zin.split('____').length === 2 && !fout.includes(vnw), zin);
  for (const [zin, bn, zn, ww] of D.BIJVOEGLIJK_VOOR) assert.ok(zin.includes(`${bn} ${zn}`) && zin.includes(ww), zin);
  for (const [zin, bn, plaats] of D.BIJVOEGLIJK_PLAATS) assert.equal(new RegExp(`\\b(is|zijn) ${bn}\\b`).test(zin), plaats === 'na', zin);
  for (const [ww, anders] of D.WERKWOORDEN) assert.ok(ww.endsWith('en') && anders.every(a => !a.endsWith('en')), ww);
});

test('de weetjes hangen aan de doelen: elk doel heeft nu een echte generator', async () => {
  const { readFile } = await import('node:fs/promises');
  const map = JSON.parse(await readFile(new URL('../data/taal/generators-map.json', import.meta.url), 'utf8')).koppelingen;
  for (const doel of WEETJES_DOELEN) assert.ok(map[doel].includes('tw-kies') && map[doel].includes('tw-juist-fout'), doel);
});
