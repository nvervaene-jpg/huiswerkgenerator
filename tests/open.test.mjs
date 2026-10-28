import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import wiskunde from '../js/subjects/wiskunde/index.js';
import taal from '../js/subjects/taal/index.js';
import { ECHTE_GENERATORS as WI_ECHT, OPEN_VORMEN as WI_OPEN } from '../js/subjects/wiskunde/generators/index.js';
import { ECHTE_GENERATORS as TA_ECHT, OPEN_VORMEN as TA_OPEN } from '../js/subjects/taal/generators/index.js';
import { OPEN_DOELEN as WI_DOELEN } from '../js/subjects/wiskunde/open-doelen.js';
import { OPEN_DOELEN as TA_DOELEN } from '../js/subjects/taal/open-doelen.js';
import { profielVan as wiProfiel } from '../js/subjects/wiskunde/open-profiel.js';
import { profielVan as taProfiel } from '../js/subjects/taal/open-profiel.js';
import { LEESTEKSTEN, SCHRIJFZINNEN } from '../js/subjects/taal/woorden/leesteksten.js';
import { zetDoelen } from '../js/core/doelregister.js';
import { kindvorm } from '../js/core/open.js';
import { laadDoelen } from '../js/core/doelen.js';
import { planModel, losOp, modelUitCode, effectiefAantal, optiesVoor } from '../js/core/blad-model.js';
import { ICONEN_NAMEN } from '../js/core/icons.js';
import { bouwDocument } from '../js/export/docx.js';
import { standaardOpmaak } from '../js/core/opmaak.js';

const require = createRequire(import.meta.url);
const docx = require('../js/vendor/docx.umd.js');
const JSZip = require('../js/vendor/jszip.min.js');
const lees = async (url) => JSON.parse(await readFile(new URL('../' + url, import.meta.url), 'utf8'));
const VAKKEN = [
  { vak: wiskunde, doelenUrl: 'data/wiskunde/doelen-wiskunde-opstap.json', echt: WI_ECHT, open: WI_OPEN, opgeslagen: WI_DOELEN, profiel: wiProfiel },
  { vak: taal, doelenUrl: 'data/taal/doelen-taal-opstap.json', echt: TA_ECHT, open: TA_OPEN, opgeslagen: TA_DOELEN, profiel: taProfiel },
];
const geladen = await Promise.all(VAKKEN.map(async v => ({ ...v, doelen: (await lees(v.doelenUrl)).doelen })));
for (const v of geladen) zetDoelen(v.doelen);
const SEEDS = [1, 2, 3, 4, 5];

test('open opdrachten: elk doel van elk vak heeft minstens één generator', () => {
  for (const v of geladen) {
    const alle = new Set(v.vak.generators.flatMap(g => g.doelen));
    const zonder = v.doelen.filter(d => !alle.has(d.code));
    assert.deepEqual(zonder.map(d => d.code), [], `${v.vak.id}: doelen zonder generator`);
    assert.equal(alle.size, v.doelen.length, 'er verwijst geen generator naar een onbekend doel');
  }
});

test('open opdrachten: enkel doelen zonder echte generator krijgen een open opdracht, en elk doel zonder echte krijgt er drie', () => {
  for (const v of geladen) {
    const echt = new Set(v.echt.flatMap(g => g.doelen));
    const open = new Map();
    for (const g of v.open) for (const c of g.doelen) open.set(c, [...(open.get(c) || []), g.id]);
    for (const d of v.doelen) {
      if (echt.has(d.code)) assert.ok(!open.has(d.code), `${d.code} heeft een echte generator en toch een open opdracht`);
      else assert.equal((open.get(d.code) || []).length, 3, `${d.code}: precies drie open oefenvormen`);
    }
    // het opgeslagen bestand komt overeen met de doelen: draai node scripts/open-doelen.mjs als dit faalt
    const verwacht = {};
    for (const d of v.doelen) if (!echt.has(d.code)) (verwacht[v.profiel(d)] ||= []).push(d.code);
    for (const k of Object.keys(verwacht)) verwacht[k].sort();
    assert.deepEqual(v.opgeslagen, Object.fromEntries(Object.keys(verwacht).sort().map(k => [k, verwacht[k]])), `${v.vak.id}: open-doelen.js is verouderd`);
    assert.equal(Object.values(v.opgeslagen).flat().length, v.doelen.length - [...echt].length);
  }
});

test('open opdrachten: alle doelen worden nog steeds aangeboden met aantallen die kloppen', async () => {
  for (const v of geladen) {
    const { doelen } = await laadDoelen({ ...v.vak, doelenUrl: v.doelenUrl }, async (url) => ({ json: async () => lees(url) }));
    assert.ok(doelen.every(d => d.generators.length > 0));
    const echt = new Set(v.echt.flatMap(g => g.doelen));
    assert.deepEqual(doelen.filter(d => d.echt).map(d => d.code).sort(), [...echt].sort(), 'echt = een automatische oefening');
    assert.ok(doelen.filter(d => !d.echt).every(d => d.generators.every(id => v.open.some(g => g.id === id))));
  }
});

test('open opdrachten: ids zijn uniek, titels en pictogrammen kloppen', () => {
  for (const v of VAKKEN) {
    const ids = v.open.map(g => g.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const g of v.open) {
      assert.ok(g.open === true && g.titel && g.opdracht && g.doelen.length && ICONEN_NAMEN.includes(g.pictogram), g.id);
      assert.ok(!v.echt.some(e => e.id === g.id), `${g.id} bestaat al als echte generator`);
    }
  }
  assert.ok(WI_OPEN.length >= 6 && TA_OPEN.length >= 16);
});

function controleerSvg(svg) {
  assert.ok(svg && svg.markup.startsWith('<svg') && svg.markup.endsWith('</svg>'), 'svg');
  assert.ok(svg.breedte > 100 && svg.hoogte > 20 && svg.hoogte < 1200);
  assert.ok(svg.markup.includes(`width="${svg.breedte}"`) && svg.markup.includes(`height="${svg.hoogte}"`));
  const open = (svg.markup.match(/<(?!\/|\?|!)[a-zA-Z]/g) || []).length, dicht = (svg.markup.match(/\/>|<\/[a-zA-Z]+>/g) || []).length;
  assert.equal(open, dicht, 'elke tag is gesloten');
}

test('open opdrachten: elke open vorm maakt voor voorbeelddoelen genoeg verschillende oefeningen met het doel erin', () => {
  for (const v of VAKKEN) for (const g of v.open) {
    const doelen = [g.doelen[0], g.doelen[Math.floor(g.doelen.length / 2)], g.doelen.at(-1)];
    for (const code of doelen) for (const seed of SEEDS) {
      const opties = g.opties(g.doelen, {}, code); assert.equal(opties.doel, code);
      const aantal = effectiefAantal(g, 6), res = g.genereer({ seed, aantal, opties });
      assert.ok(res.oefeningen.length >= Math.min(aantal, 3), `${g.id} ${code} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) {
        assert.ok(o.tekst && o.antwoord && o.volledig.includes(code === undefined ? '' : (o.data.type === 'open' ? code : o.volledig)), g.id);
        if (o.svg) controleerSvg(o.svg);
        if (o.data.type === 'open') {
          const doel = geladen.flatMap(x => x.doelen).find(d => d.code === code);
          assert.ok(!o.tekst.includes(kindvorm(doel.tekst) || doel.tekst), `${g.id}: het doel staat niet bij elke opdracht (enkel optioneel bovenaan het blad)`);
          assert.ok(!o.tekst.includes('{doel}'));
        }
      }
      assert.deepEqual(g.genereer({ seed, aantal, opties }), res, 'herhaalbaar');
    }
  }
});

test('kindvorm: het doel wordt een zin in de ik-vorm, of blijft zoals het is', () => {
  assert.equal(kindvorm('De leerlingen kunnen getallen vergelijken.'), 'Ik kan getallen vergelijken.');
  assert.equal(kindvorm('De leerling kan de klok aflezen.'), 'Ik kan de klok aflezen.');
  assert.equal(kindvorm('De leerlingen kennen woordvorming: samenstellingen.'), 'Ik ken woordvorming: samenstellingen.');
  assert.equal(kindvorm('De leerlingen kunnen hun ideeën ordenen.'), 'Ik kan mijn ideeën ordenen.');
  assert.equal(kindvorm('De leerlingen kunnen met elkaar praten.'), null, 'elkaar kan niet in de ik-vorm');
  assert.equal(kindvorm('Rekenen is leuk.'), null);
  let omgezet = 0, totaal = 0;
  for (const v of geladen) for (const d of v.doelen) {
    totaal++; const k = kindvorm(d.tekst);
    if (k) { omgezet++; assert.match(k, /^Ik (kan|ken|weet|begrijp) /); assert.ok(!/leerling|\bhun\b|\bzij\b|\bhij\b/i.test(k), `${d.code}: ${k}`); assert.ok(k.endsWith('.')); }
  }
  assert.ok(omgezet / totaal > 0.6, `${omgezet} van ${totaal} doelen in de ik-vorm`);
});

test('leesteksten: elk leerjaar heeft teksten met drie vragen en drie verschillende antwoorden', () => {
  const gemiddeld = [];
  for (const j of ['L1', 'L2', 'L3', 'L4', 'L5', 'L6']) {
    assert.ok(LEESTEKSTEN[j].length >= 2, j);
    for (const t of LEESTEKSTEN[j]) {
      assert.ok(t.titel && t.tekst.length > 60 && t.vragen.length >= 3, t.titel);
      for (const v of t.vragen) { const alle = [v.juist, ...v.fout]; assert.equal(new Set(alle).size, 3, `${t.titel}: ${v.vraag}`); assert.ok(alle.every(a => a.trim()) && v.vraag.endsWith('?')); }
    }
    gemiddeld.push(LEESTEKSTEN[j].reduce((s, t) => s + t.tekst.split(/\s+/).length, 0) / LEESTEKSTEN[j].length);
  }
  for (let i = 1; i < gemiddeld.length; i++) assert.ok(gemiddeld[i] >= gemiddeld[i - 1] * 0.95, `de teksten worden langer: ${gemiddeld.map(Math.round)}`);
  assert.ok(SCHRIJFZINNEN.length >= 8 && SCHRIJFZINNEN.every(z => z.endsWith('.')));
});

test('open leesopdrachten: tekst van het juiste leerjaar, juiste woordtelling en alle antwoorden aanwezig', () => {
  const lezen = TA_OPEN.filter(g => g.id.startsWith('ot-lezen-'));
  assert.equal(lezen.length, 3);
  const tempo = lezen.find(g => g.id.endsWith('tempo')), kiezen = lezen.find(g => g.id.endsWith('kiezen')), tekst = lezen.find(g => g.id.endsWith('tekst'));
  for (const code of tempo.doelen.filter((_, i) => i % 20 === 0)) {
    const j = `L${code.match(/GL(\d)/)[1]}`, titels = new Set(Object.entries(LEESTEKSTEN).filter(([k]) => Math.abs(+k[1] - +j[1]) <= 1).flatMap(([, l]) => l.map(t => t.titel)));
    for (const o of tempo.genereer({ seed: 3, aantal: 2, opties: { doel: code } }).oefeningen) {
      assert.ok(titels.has(o.data.titel), `${code}: ${o.data.titel} is geen tekst voor ${j}`);
      const t = Object.values(LEESTEKSTEN).flat().find(x => x.titel === o.data.titel);
      assert.ok(o.tekst.includes(`(${t.tekst.split(/\s+/).length} woorden)`) && o.tekst.includes(t.tekst));
    }
    for (const o of kiezen.genereer({ seed: 3, aantal: 2, opties: { doel: code } }).oefeningen) {
      const t = Object.values(LEESTEKSTEN).flat().find(x => x.titel === o.data.titel);
      for (const v of t.vragen) { assert.ok(o.tekst.includes(v.vraag) && o.tekst.includes(v.juist)); for (const f of v.fout) assert.ok(o.tekst.includes(f)); assert.ok(o.antwoord.includes(v.juist)); }
    }
    for (const o of tekst.genereer({ seed: 4, aantal: 2, opties: { doel: code } }).oefeningen) {
      const t = Object.values(LEESTEKSTEN).flat().find(x => x.titel === o.data.titel); assert.equal(o.antwoord, t.vragen.map(v => v.juist).join('; '));
    }
  }
});

test('open opdrachten: een blad voor doelen zonder echte generator heeft drie verschillende blokken en een werkende bladcode', () => {
  for (const v of geladen) {
    const open = v.doelen.filter(d => !v.echt.some(g => g.doelen.includes(d.code)));
    const stap = Math.floor(open.length / 12);
    for (let i = 0; i < open.length; i += stap) {
      const doel = open[i].code;
      for (const seed of [1, 2]) {
        const model = planModel(v.vak, { doelen: [doel], keuzes: {}, seed, gebied: v.vak.id === 'wiskunde' ? 1000 : 0, aantal: 6, blokken: 3 });
        assert.equal(model.blokken.length, 3, doel); assert.equal(new Set(model.blokken.map(b => b.vorm)).size, 3, `${doel}: drie verschillende vormen`);
        const blad = losOp(v.vak, model);
        assert.ok(blad.blokken.every(b => b.oefeningen.length >= 2 && b.doel === doel), `${doel}: elk blok heeft oefeningen`);
        assert.deepEqual(blad.waarschuwingen.filter(w => !/komen dubbel voor/.test(w)), [], doel);   // een open vorm met weinig varianten herhaalt er een, met een waarschuwing
        const { model: terug, waarschuwing } = modelUitCode(v.vak, blad.code);
        assert.equal(waarschuwing, null); assert.deepEqual(losOp(v.vak, terug).blokken, blad.blokken);
      }
    }
  }
});

test('open opdrachten: elk doel van beide vakken geeft een blad zonder fouten (volledige doorloop)', () => {
  for (const v of geladen) for (const d of v.doelen) {
    const model = planModel(v.vak, { doelen: [d.code], keuzes: {}, seed: 11, gebied: v.vak.id === 'wiskunde' ? 1000 : 0, aantal: 6, blokken: 3 });
    assert.ok(model.blokken.length >= 1, `${d.code}: geen blokken`);
    const blad = losOp(v.vak, model);
    assert.ok(blad.blokken.some(b => b.oefeningen.length > 0), `${d.code}: geen oefeningen`);
    for (const b of blad.blokken) for (const o of b.oefeningen) assert.ok(typeof o.tekst === 'string' && o.antwoord !== undefined && o.volledig);
  }
});

test('open opdrachten: een gemengd blad met echte en open doelen blijft herhaalbaar en kan naar Word', async () => {
  const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
  const wi = geladen[0], echt = new Set(wi.echt.flatMap(g => g.doelen)), doelen = [wi.doelen.find(d => echt.has(d.code)).code, wi.doelen.find(d => !echt.has(d.code) && d.leerjaar === 'L3').code, wi.doelen.find(d => !echt.has(d.code) && d.leerjaar === 'K3').code];
  const blad = losOp(wiskunde, planModel(wiskunde, { doelen, keuzes: {}, seed: 7, gebied: 1000, aantal: 6, blokken: 3 }));
  assert.equal(blad.blokken.length, 9);
  const svgPng = new Map(); for (const b of blad.blokken) for (const o of b.oefeningen) for (const t of [o.svg, o.antwoordSvg]) if (t) svgPng.set(t.markup, PNG);
  const afb = { logo: { bytes: PNG, breedte: 418, hoogte: 268 }, iconen: Object.fromEntries(ICONEN_NAMEN.map(n => [n, PNG])), svgPng };
  const zip = await JSZip.loadAsync(await docx.Packer.toBuffer(bouwDocument(docx, [{ naam: 'Anna', blad }], standaardOpmaak(), afb)));
  const xml = await zip.file('word/document.xml').async('string');
  for (const b of blad.blokken) assert.ok(xml.includes(b.opdracht.replace(/&/g, '&amp;')), b.opdracht);
});
