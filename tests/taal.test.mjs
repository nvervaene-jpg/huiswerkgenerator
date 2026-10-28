import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import taal from '../js/subjects/taal/index.js';
import { ECHTE_GENERATORS as GENERATORS, GENERATORS as ALLE_GENERATORS } from '../js/subjects/taal/generators/index.js';
import * as VV from '../js/subjects/taal/generators/verenkelen-verdubbelen.js';
import * as MV from '../js/subjects/taal/generators/meervouden.js';
import * as VK from '../js/subjects/taal/generators/verkleinwoorden.js';
import * as EL from '../js/subjects/taal/generators/eindletters.js';
import * as HLG from '../js/subjects/taal/generators/hoofdletters.js';
import * as KLG from '../js/subjects/taal/generators/klanken.js';
import * as SMG from '../js/subjects/taal/generators/samenstellingen.js';
import * as SPG from '../js/subjects/taal/generators/speciaal.js';
import * as BZG from '../js/subjects/taal/generators/bezit.js';
import { LABELS as HL_LABELS } from '../js/subjects/taal/woorden/hoofdletters.js';
import { EINDLETTERS, WOORDEN as W_EL } from '../js/subjects/taal/woorden/eindletters.js';
import { VERDUBBELEN, VERENKELEN, WOORDEN as W_VV } from '../js/subjects/taal/woorden/verenkelen-verdubbelen.js';
import { MEERVOUDEN, WOORDEN as W_MV } from '../js/subjects/taal/woorden/meervouden.js';
import { VERKLEINWOORDEN, WOORDEN as W_VK } from '../js/subjects/taal/woorden/verkleinwoorden.js';
import { vergelijkMoeilijkheid } from '../js/subjects/wiskunde/generators/hulp.js';
import { ICONEN_NAMEN } from '../js/core/icons.js';
import { modelVoorVormen, planModel, losOp, modelUitCode, optiesVoor } from '../js/core/blad-model.js';
import { VAKKEN } from '../js/subjects/index.js';

const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);
const klinker = /[aeiouë]/;

/* ------------------------------------------------------------ eigen spellingregels, los van de generators */
// Verenkelen/verdubbelen: lange klinker (aa, ee, oo, uu) valt weg, na een korte klinker komt de medeklinker er bij.
function regelVV(van) {
  if (/(aa|ee|oo|uu)[^aeiou]$/.test(van)) return { soort: 'verenkelen', naar: van.replace(/(aa|ee|oo|uu)([^aeiou])$/, (_, v, c) => v[0] + c) + 'en' };
  if (/(^|[^aeiou])[aeiou][^aeiou]$/.test(van)) return { soort: 'verdubbelen', naar: van + van.at(-1) + 'en' };
  throw new Error(`regel is niet van toepassing op ${van}`);
}
// Meervoud: 's na a, o, u, i, y; -s na onbeklemtoond -el, -em, -en, -er; -eren bij enkele woorden; anders -en.
const EREN = new Set(['kind', 'ei', 'rund']);
const AFWIJKEND_MV = { stad: 'steden', schip: 'schepen', lid: 'leden', glas: 'glazen', museum: 'musea', visum: 'visa', been: 'benen' };
const AFWIJKEND_VK = { blad: 'blaadje', gat: 'gaatje', pad: 'paadje', vat: 'vaatje', rad: 'raadje' };
function regelMV(van) {
  if (AFWIJKEND_MV[van]) return { soort: 'afwijkend', naar: AFWIJKEND_MV[van] };
  if (/(ee|ie)$/.test(van)) return { soort: 'ën', naar: van + 'ën' };
  if (EREN.has(van)) return { soort: 'eren', naar: van + 'eren' };
  if (/[aouiy]$/.test(van)) return { soort: "'s", naar: van + "'s" };
  if (/[^aeiou](el|em|er|en)$/.test(van)) return { soort: 's', naar: van + 's' };
  return { soort: 'en', naar: van + 'en' };
}
// Verkleinwoord: -je, -tje, -pje, -etje, -kje, -aatje, -ootje, -uutje.
const klinkergroepen = (w) => (w.match(/(?:ij|[aeiouy])+/g) || []).length;
function regelVK(van) {
  if (AFWIJKEND_VK[van]) return { soort: 'afwijkend', naar: AFWIJKEND_VK[van] };
  if (/[aou]$/.test(van)) return { soort: van.at(-1) + van.at(-1) + 'tje', naar: van + van.at(-1) + 'tje' };            // sofa - sofaatje
  if (/[aeiou]$|[aeiou]{2}$|ij$/.test(van) && !/[aeiouy]ng$/.test(van)) return { soort: 'tje', naar: van + 'tje' };           // ei - eitje, bij - bijtje
  if (/ing$/.test(van) && klinkergroepen(van) >= 2) return { soort: 'kje', naar: van.slice(0, -1) + 'kje' };                    // koning - koninkje
  if (/m$/.test(van)) {
    if (/[^aeiou][aeiou]m$/.test(van)) return { soort: 'etje', naar: van + 'metje' };                                           // kam - kammetje
    return { soort: 'pje', naar: van + 'pje' };                                                                                  // boom - boompje, arm - armpje
  }
  if (/ij[lnr]$/.test(van)) return { soort: 'tje', naar: van + 'tje' };                                                          // lijn - lijntje
  if (/[^aeiou][aeiou]ng$/.test(van)) return { soort: 'etje', naar: van + 'etje' };                                              // ring - ringetje
  if (/[^aeiou][aeiou][lnr]$/.test(van)) return { soort: 'etje', naar: van + van.at(-1) + 'etje' };                              // man - mannetje
  if (/[aeiou][aeiou][lnr]$/.test(van) || /[aeiou][aeiou][aeiou][lnr]$/.test(van)) return { soort: 'tje', naar: van + 'tje' };   // maan - maantje
  return { soort: 'je', naar: van + 'je' };                                                                                      // boek - boekje
}

// Woorden op -d, -t, -p, -b: haal -en weg (en onverdubbel) om het enkelvoud te krijgen; de laatste letter is de soort.
function regelEL(meervoud) {
  let basis = meervoud.slice(0, -2);
  if (/([^aeiou])\1$/.test(basis)) basis = basis.slice(0, -1);
  if (!/[dtpb]$/.test(basis)) throw new Error(`regel is niet van toepassing op ${meervoud}`);
  return { soort: basis.at(-1), naar: basis };
}

// Hoofdletters: de feiten staan in de data zelf; de tests controleren de samenhang (zie hoofdletters.test.mjs).
const kaart = (lijst) => new Map(lijst.map(w => [w.van, { soort: w.soort, naar: w.naar }]));
const KAART_HL = kaart(HLG.WOORDEN), KAART_HZ = kaart(HLG.ZINNEN_OPGAVEN);
const regelHL = (van) => KAART_HL.get(van), regelHZ = (van) => KAART_HZ.get(van) || KAART_HL.get(van);   // een zin, of het woord waar de zin bij hoort
const KAART_KL = kaart(KLG.WOORDEN), regelKL = (van) => KAART_KL.get(van);
const KAART_SM = kaart(SMG.WOORDEN), regelSM = (van) => KAART_SM.get(van);
const SM_MOD = { woordenVoor: SMG.woordenVoor, DOELEN: SMG.DOELEN };
// Bezit: een naam op a, o, u, i of y krijgt 's, een andere naam enkel s (eigen regel, afgeleid van 'de fiets van Anna').
function regelBZ(van) {
  const [, lid, voorwerp, naam] = /^(de|het) (\S+) van (\S+)$/.exec(van) || [];
  const aps = /[aouiy]$/i.test(naam);
  return { soort: aps ? 'aps' : 'gewoon', naar: `${naam}${aps ? "'s" : 's'} ${voorwerp}` };
}
const kaartSP = (lijst) => new Map(lijst.map(w => [w.van, { soort: w.soort, naar: w.naar }]));
const KAART_LW = kaartSP(SPG.LEEN_WOORDEN), KAART_AF = kaartSP(SPG.AFKORTING_WOORDEN), KAART_TK = kaartSP(SPG.TEKEN_WOORDEN);
const LW_MOD = { woordenVoor: SPG.speciaal.leen.woordenVoor, DOELEN: SPG.speciaal.leen.DOELEN };
const AF_MOD = { woordenVoor: SPG.speciaal.afk.woordenVoor, DOELEN: SPG.speciaal.afk.DOELEN };
const TK_MOD = { woordenVoor: SPG.speciaal.tekens.woordenVoor, DOELEN: SPG.speciaal.tekens.DOELEN };
const BZ_MOD = { woordenVoor: BZG.woordenVoor, DOELEN: BZG.DOELEN };
const KL_MOD = { woordenVoor: KLG.woordenVoor, DOELEN: KLG.DOELEN };
const HL_MOD = { woordenVoor: HLG.woordenVoor, DOELEN: HLG.DOELEN }, HZ_MOD = { woordenVoor: HLG.woordenVoorZinnen, DOELEN: HLG.DOELEN };

const FAMILIES = [
  { naam: 'verenkelen en verdubbelen', prefix: 'vv-', mod: VV, woorden: W_VV, regel: regelVV, lijsten: { verdubbelen: VERDUBBELEN, verenkelen: VERENKELEN }, minimum: 100 },
  { naam: 'meervouden', prefix: 'mv-', mod: MV, woorden: W_MV, regel: regelMV, lijsten: MEERVOUDEN, minimum: 55, dupMax: 0.4 },
  { naam: 'woorden op -d, -t, -p, -b', prefix: 'el-', mod: EL, woorden: W_EL, regel: regelEL, lijsten: EINDLETTERS, minimum: 45 },
  { naam: 'klanken en lettergroepen', prefix: 'kl-', mod: KL_MOD, woorden: KLG.WOORDEN, regel: regelKL, label: (x) => x, data: true, gat: true, proefDoelen: ['1.3.GL4.6', '1.3.GL4.9'] },
  { naam: 'samenstellingen', prefix: 'sm-', mod: SM_MOD, woorden: SMG.WOORDEN, regel: regelSM, label: (x) => x, data: true, proefDoelen: ['1.3.GL2.24', '1.3.GL3.14'], dupMax: 0.5 },
  { naam: 'bezit met apostrof', prefix: 'bz-', mod: BZ_MOD, woorden: BZG.WOORDEN, regel: regelBZ, label: (x) => (x === 'aps' ? "met 's" : 'met s'), data: true, dupMax: 0.5 },
  { naam: 'hoofdletters: woorden', prefix: 'hl-', mod: HL_MOD, woorden: HLG.WOORDEN, regel: regelHL, label: (x) => HL_LABELS[x], data: true },
  { naam: 'hoofdletters: zinnen', prefix: 'hz-', mod: HZ_MOD, woorden: HLG.ZINNEN_OPGAVEN, regel: regelHZ, data: true },
  { naam: 'leenwoorden', prefix: 'lw-', mod: LW_MOD, woorden: SPG.LEEN_WOORDEN, regel: (v) => KAART_LW.get(v), label: (x) => SPG.speciaal.leen.labels[x], data: true, dupMax: 0.6 },
  { naam: 'afkortingen', prefix: 'af-', mod: AF_MOD, woorden: SPG.AFKORTING_WOORDEN, regel: (v) => KAART_AF.get(v), label: (x) => SPG.speciaal.afk.labels[x], data: true, dupMax: 0.5 },
  { naam: 'bijzondere tekens', prefix: 'tk-', mod: TK_MOD, woorden: SPG.TEKEN_WOORDEN, regel: (v) => KAART_TK.get(v), label: (x) => SPG.speciaal.tekens.labels[x], data: true, dupMax: 0.5 },
  { naam: 'verkleinwoorden', prefix: 'vk-', mod: VK, woorden: W_VK, regel: regelVK, lijsten: VERKLEINWOORDEN, minimum: 100 },
];

for (const fam of FAMILIES) {
  if (!fam.data) test(`${fam.naam}: elk woord in de woordenlijst volgt de spellingregel`, () => {
    assert.ok(Object.values(fam.lijsten).flat().length >= fam.minimum, 'te weinig woorden');
    for (const [soort, lijst] of Object.entries(fam.lijsten)) for (const [van, delen] of lijst) {
      const juist = fam.regel(van);
      assert.equal(juist.soort, soort, `${van} staat bij de verkeerde uitgang`);
      assert.equal(delen.split('-').join(''), juist.naar, van);
    }
  });

  test(`${fam.naam}: woordenlijst is netjes (geen dubbels, afbreking, foute vorm)`, () => {
    const gezien = new Set();
    for (const w of fam.woorden) {
      const sleutel = w.van + '|' + w.soort;
      assert.ok(!gezien.has(sleutel), `dubbel woord ${w.van}`); gezien.add(sleutel);
      if (!fam.data) assert.ok(w.delen.length >= 1 && w.delen.every(d => d.length > 0 && klinker.test(d) || /^[a-zë']*[aeiouyë][a-zë']*$/.test(d)), `${w.naar}: elke lettergreep heeft een klinker`);
      assert.equal(w.delen.join(''), w.naar); if (!fam.data) assert.equal(w.lettergrepen, w.delen.length);
      assert.notEqual(w.fout, w.naar, `${w.van}: de foute vorm is gelijk aan de juiste`);
      if (fam.prefix !== 'vv-') assert.ok(!fam.woorden.some(x => x.naar === w.fout && x !== w), `${w.van}: de foute vorm ${w.fout} is een ander woord uit de lijst`);   // bij vv is dat bewust: man - manen (maan)
      assert.ok(w.fout && !/undefined/.test(w.fout));
    }
  });

  const vormen = GENERATORS.filter(g => g.id.startsWith(fam.prefix) && !g.id.endsWith('-plaatje'));   // 'plaatje' heeft eigen tests (taal-spelling.test.mjs)

  // Controle per soort oefening, met de eigen regel van deze familie.
  const check = (d) => {
    const juist = fam.regel(d.van);
    assert.equal(d.naar, juist.naar); assert.equal(d.soort, juist.soort);
    return juist;
  };
  const verifieer = {
    'tw-invullen': (d, o) => { check(d); assert.equal(o.antwoord, fam.regel(d.van).naar); assert.ok(o.tekst.includes(fam.gat ? d.gat : d.van) && o.tekst.includes('____')); assert.ok((d.van === d.naar && !fam.gat) || !new RegExp(`(^|[^a-z])${d.naar}([^a-z]|$)`).test(o.tekst)); },
    'tw-zin': (d, o) => {
      check(d); assert.equal(o.antwoord, fam.regel(d.van).naar);
      assert.ok(o.tekst.includes(d.van) && o.tekst.includes('____') && (d.van === d.naar || !new RegExp(`(^|[^a-z])${d.naar}([^a-z]|$)`).test(o.tekst)));
      assert.ok(o.volledig.includes(d.naar) && !o.volledig.includes('____'));
    },
    'tw-kies': (d, o) => {
      check(d); assert.equal(d.opties.length, 2); assert.equal(new Set(d.opties).size, 2);
      assert.equal(d.opties[d.juist], fam.regel(d.van).naar); assert.equal(o.antwoord, d.opties[d.juist]);
      assert.ok(d.opties.every(x => o.tekst.includes(x)));
    },
    'tw-juistfout': (d, o) => {
      const j = check(d);
      assert.equal(d.juist, d.getoond === j.naar); assert.equal(o.antwoord, d.juist ? 'juist' : 'fout');
      assert.ok(o.tekst.includes(d.getoond) && o.tekst.includes('juist') && o.tekst.includes('fout'));
    },
    'tw-regel': (d, o) => {
      const j = check(d);
      assert.ok(d.soorten.includes(j.soort) && d.soorten.length >= 2);
      const label = fam.label || ((x) => (fam.prefix === 'vv-' || x === "'s" ? x : '-' + x));
      assert.equal(o.antwoord, label(j.soort));
      assert.ok(d.soorten.every(x => o.tekst.includes(label(x))));
    },
    'tw-lettergrepen': (d, o) => { check(d); assert.equal(o.antwoord.replace(/-/g, ''), fam.regel(d.van).naar); assert.equal(o.antwoord, d.delen.join('-')); },
    'tw-verbind': (d, o) => {
      assert.equal(d.woorden.length, 4);
      for (const w of d.woorden) { check(w); assert.ok(o.svg.markup.includes(`>${w.van}<`) && o.svg.markup.includes(`>${w.naar.replace(/'/g, "'")}<`)); }
      assert.equal(new Set(d.woorden.map(w => w.van)).size, 4); assert.equal(new Set(d.woorden.map(w => w.naar)).size, 4);
      assert.equal((o.antwoordSvg.markup.match(/<line /g) || []).length, 4);
      assert.equal((o.svg.markup.match(/<line /g) || []).length, 0, 'de oplossing staat niet op het werkblad');
      const rechts = [...o.svg.markup.matchAll(/<text x="416"[^>]*>([^<]+)</g)].map(m => m[1]);
      const lijnen = [...o.antwoordSvg.markup.matchAll(/<line x1="228" y1="([\d.]+)" x2="392" y2="([\d.]+)"/g)].map(m => [+m[1], +m[2]]);
      const rij = (y) => Math.round((y - 8 - 23) / 46);
      for (const [y1, y2] of lijnen) assert.equal(rechts[rij(y2)], fam.regel(d.woorden[rij(y1)].van).naar);
    },
    'tw-kleuren': (d, o) => {
      assert.equal(d.woorden.length, 6);
      for (const w of d.woorden) {
        const j = check(w);
        assert.equal(w.juist, w.getoond === j.naar);
        assert.ok(o.svg.markup.includes(`>${w.tekst ?? `${w.van} - ${w.getoond}`}<`));
      }
      const groen = (o.antwoordSvg.markup.match(/fill="#a9dfa3"/g) || []).length;
      assert.equal(groen, d.woorden.filter(w => w.juist).length); assert.ok(groen >= 2 && groen <= 4);
      assert.equal((o.svg.markup.match(/fill="#a9dfa3"/g) || []).length, 0);
      assert.equal(o.antwoord.split('; ').length, groen);
    },
    'tw-fout': (d, o) => {
      if (d.variant === 'verbeter') {
        const [w] = d.woorden; const j = check(w); assert.notEqual(w.getoond, j.naar); assert.equal(o.antwoord, j.naar); assert.ok(o.tekst.includes(w.getoond));
      } else {
        assert.equal(d.woorden.length, 3);
        d.woorden.forEach((w, i) => { const j = check(w); assert.equal(w.getoond === j.naar, i !== d.fout); });
        assert.equal(d.juist, fam.regel(d.woorden[d.fout].van).naar);
        assert.ok(o.antwoord.startsWith('abc'[d.fout] + ')'));
      }
    },
  };

  // Denk- en schrijfvormen: elk woord klopt met de regel van de familie. Vormen die soorten vergelijken, mogen woorden van alle soorten van het doel gebruiken.
  Object.assign(verifieer, {
    'tw-gelijk': (d, o) => { check(d); check(d.juist); check(d.fout); assert.equal(d.juist.soort, d.soort); assert.notEqual(d.fout.soort, d.soort); assert.ok(d.opties.includes(d.juist.van) && d.opties.includes(d.fout.van) && o.tekst.includes(d.juist.van)); },
    'tw-uitleg': (d, o) => { check(d); assert.ok(d.open && o.tekst.includes(d.van) && (o.tekst.match(/_{8,}/g) || []).length >= 2); },
    'tw-sorteer': (d, o) => { d.kolommen.forEach((k, i) => { assert.equal(k.length, 3); k.forEach(w => { check(w); assert.equal(w.soort, d.soorten[i]); }); }); assert.notEqual(d.soorten[0], d.soorten[1]); assert.ok(o.svg && o.antwoordSvg); },
    'tw-buiten': (d, o) => { d.woorden.forEach(check); assert.equal(d.woorden.filter(w => w.soort === d.soort).length, 4); assert.equal(o.antwoord, d.uitzondering.naar); assert.notEqual(d.uitzondering.soort, d.soort); },
    'tw-zinwoord': (d, o) => { check(d); assert.ok(d.open && o.tekst.startsWith(d.naar) && o.volledig.includes(d.naar)); },
    'tw-nakijken': (d, o) => { check(d); assert.equal(o.antwoord, fam.regel(d.van).naar); assert.ok(o.tekst.includes('Klopt het?')); },
    'tw-regelschrijf': (d, o) => { check(d); assert.ok(d.soorten.includes(d.soort) && d.soorten.length >= 2 && o.antwoord.endsWith(`; ${d.naar}`)); },
    'tw-zelf': (d) => { assert.equal(d.voorbeelden.length, 3); d.voorbeelden.forEach(w => { check(w); assert.equal(w.soort, d.soort); }); },
    'tw-proef': (d, o) => { check(d); assert.equal(o.antwoord, `${d.van}; ${d.naar}`); assert.ok(d.opties.includes(d.naar) && d.opties.length === 2 && o.tekst.includes(d.opties[0]) && d.van.startsWith(d.naar.slice(0, -1))); },
  });
  const VERGELIJK = new Set(['tw-gelijk', 'tw-sorteer', 'tw-buiten', 'tw-zelf']);

  // Alle combinaties van doelen en regelkeuzes die de leerkracht kan maken.
  const varianten = (gen) => {
    const doelen = gen.doelen, soorten = [...new Set(fam.woorden.map(w => w.soort))], uit = [];
    for (const codes of [...doelen.map(d => [d]), doelen]) for (const regel of ['beide', ...soorten]) {
      uit.push({ codes, opties: gen.opties(codes, { regel }, codes.length === 1 ? codes[0] : null) });
    }
    return uit;
  };

  for (const gen of vormen) {
    test(`${gen.id}: antwoorden kloppen, geen dubbels, oplopende moeilijkheid, woorden passen bij doel en keuze`, () => {
      let totaal = 0;
      for (const { codes, opties } of varianten(gen)) for (const seed of SEEDS) {
        const { oefeningen, waarschuwing } = gen.genereer({ seed, aantal: 10, gebied: 0, opties });
        const vergelijkt = /-(gelijk|sorteer|buiten|zelf)$/.test(gen.id);
        const toegelaten = new Set(fam.mod.woordenVoor(vergelijkt ? { ...opties, regel: 'beide' } : opties).map(w => w.kern ?? w.van));
        if (!toegelaten.size) { assert.equal(oefeningen.length, 0); continue; }
        totaal += oefeningen.length;
        assert.ok(oefeningen.length <= 10);
        if (oefeningen.length < 10) assert.ok(waarschuwing, `${gen.id}: ${oefeningen.length} oefeningen zonder waarschuwing`);
        const gezien = new Set(), sleutels = new Set();
        let vorige = null;
        for (const o of oefeningen) {
          const ctx = `${gen.id} ${codes} ${opties.regel} seed ${seed}: ${o.tekst}`;
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
          for (const k of o.kernen || [o.kern]) assert.ok(toegelaten.has(k), `${ctx}: woord ${k} hoort niet bij dit doel of deze keuze`);
          if (opties.regel !== 'beide' && !VERGELIJK.has(o.data.type)) for (const k of o.kernen || [o.kern]) assert.equal(fam.regel(k).soort, opties.regel, ctx);
        }
      }
      assert.ok(totaal > 0, `${gen.id} maakte nooit een oefening`);
    });

    test(`${gen.id}: dezelfde seed geeft dezelfde oefeningen`, () => {
      const p = { seed: 7, aantal: 10, gebied: 0, opties: gen.opties(gen.doelen, {}, gen.doelen[0]) };
      assert.deepEqual(gen.genereer(p), gen.genereer(p));
    });
  }

  test(`${fam.naam}: elk blok volgt het niveau van zijn eigen doel, bladen zijn herhaalbaar via de bladcode`, () => {
    const doelen = fam.proefDoelen || fam.mod.DOELEN;
    for (const seed of SEEDS) {
      const model = planModel(taal, { doelen, keuzes: {}, seed, gebied: 0, aantal: 6, blokken: 3 });
      assert.equal(model.blokken.length, doelen.length * 3);
      const blad = losOp(taal, model);
      model.blokken.forEach((b, i) => {
        const toegelaten = new Set(fam.mod.woordenVoor({ doelen: [b.doel] }).map(w => w.kern ?? w.van));
        for (const o of blad.blokken[i].oefeningen) if (!/^sp-/.test(o.data.type)) for (const k of o.kernen || [o.kern]) assert.ok(toegelaten.has(k), `seed ${seed}: ${k} hoort niet bij ${b.doel}`);
      });
      const woorden = blad.blokken.flatMap(b => b.oefeningen.flatMap(o => o.kernen || [o.kern]));
      const dubbel = woorden.length - new Set(woorden).size;      // enkel bij grote vormen (kleuren, verbinden) kan een woord soms terugkomen
      assert.ok(dubbel <= woorden.length * Math.max(fam.dupMax || 0, 0.75), `seed ${seed}: ${dubbel} van ${woorden.length} woorden staan twee keer op het blad`);
      const { model: terug, waarschuwing } = modelUitCode(taal, blad.code);
      assert.equal(waarschuwing, null);
      assert.deepEqual(losOp(taal, terug).blokken, blad.blokken);
    }
  });
}

test('woordenlijst verenkelen/verdubbelen: afbreking staat op de juiste plaats', () => {
  for (const w of W_VV) {
    if (w.soort === 'verdubbelen') assert.equal(w.delen.at(-2).at(-1), w.delen.at(-1)[0], `${w.naar}: verdubbeling over de afbreking`);
    else assert.ok(!/(aa|ee|oo|uu)$/.test(w.delen.at(-2)), `${w.naar}: open lettergreep met één klinker`);
  }
});

test('verenkelen/verdubbelen: woordenlijst per niveau', () => {
  const L = (code, regel) => VV.woordenVoor({ doelen: [code], regel });
  for (const regel of ['verdubbelen', 'verenkelen']) {
    assert.ok(L('1.3.GL2.27', regel).length >= 18 && L('1.3.GL3.16', regel).length >= 25 && L('1.3.GL4.18', regel).length >= 25, regel);
  }
  assert.ok(L('1.3.GL4.18').every(w => w.lettergrepen >= 3));
  assert.ok(L('1.3.GL3.16').every(w => w.lettergrepen === 2));
  assert.ok(L('1.3.GL2.27').every(w => w.lettergrepen === 2 && w.frequent));
});

test('verkleinwoorden en meervouden: elk doel heeft genoeg woorden en de juiste uitgangen', () => {
  const soorten = (mod, code) => new Set(mod.woordenVoor({ doelen: [code] }).map(w => w.soort));
  assert.deepEqual([...soorten(VK, '1.3.GL2.25')].sort(), ['je', 'pje', 'tje']);
  assert.deepEqual([...soorten(VK, '1.3.GL3.15')].sort(), ['etje', 'kje']);
  assert.deepEqual([...soorten(VK, '1.3.GL4.16')].sort(), ['aatje', 'ootje', 'uutje']);
  assert.deepEqual([...soorten(MV, '1.3.GL2.26')].sort(), ['eren', 's', 'en'].sort());
  assert.deepEqual([...soorten(MV, '1.3.GL4.17')].sort(), ["'s", 's']);
  for (const [mod, code] of [[VK, '1.3.GL2.25'], [VK, '1.3.GL3.15'], [VK, '1.3.GL4.16'], [MV, '1.3.GL2.26'], [MV, '1.3.GL4.17']]) {
    assert.ok(mod.woordenVoor({ doelen: [code] }).length >= 15, code);
  }
});

/* ------------------------------------------------------------ algemene eisen aan alle taalgeneratoren */
test('elke taalgenerator heeft een id, titel, opdracht, bestaand pictogram en geldige doelen', async () => {
  assert.equal(new Set(GENERATORS.map(g => g.id)).size, GENERATORS.length);
  assert.ok(GENERATORS.length >= 27);
  const bron = JSON.parse(await readFile(new URL('../data/taal/doelen-taal-opstap.json', import.meta.url), 'utf8')).doelen;
  const codes = new Set(bron.map(d => d.code));
  for (const g of GENERATORS) {
    assert.ok(g.id && g.titel && g.opdracht && g.doelen.length, g.id);
    assert.ok(ICONEN_NAMEN.includes(g.pictogram), `${g.id}: pictogram ${g.pictogram}`);
    for (const c of g.doelen) assert.ok(codes.has(c), `${g.id}: onbekend doel ${c}`);
  }
  for (const fam of FAMILIES) assert.equal(GENERATORS.filter(g => g.id.startsWith(fam.prefix) && g.basis).length, 1, 'één basisvorm per familie');
});

test('de koppelingen in data/taal/generators-map.json komen overeen met de doelen van de generators', async () => {
  const map = JSON.parse(await readFile(new URL('../data/taal/generators-map.json', import.meta.url), 'utf8')).koppelingen;
  const verwacht = {};
  for (const g of ALLE_GENERATORS) for (const c of g.doelen) (verwacht[c] ||= []).push(g.id);
  assert.deepEqual(map, Object.fromEntries(Object.entries(verwacht).sort(([a], [b]) => (a < b ? -1 : 1))));
  assert.ok(Object.keys(map).length >= 9);
});

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
  const tekst = (c) => d.doelen.find(x => x.code === c);
  assert.equal(tekst('1.3.GL3.16').tekst, 'De leerlingen kunnen spellingregels bij verenkelen en verdubbelen in frequente tweelettergrepige woorden toepassen.');
  assert.equal(tekst('1.3.GL2.25').tekst, 'De leerlingen kunnen frequente verkleinwoorden met -je, -tje, -pje spellen.');
  assert.equal(tekst('1.3.GL4.17').tekst, 'De leerlingen kunnen meervouden op -s en ‘s spellen.');
  assert.equal(tekst('1.3.GL3.16').rubriek, 'Verenkelen en verdubbelen');
});

test('de keuze "enkel ..." bereikt de generators via de gedeelde keuzegroep', () => {
  const gen = GENERATORS.find(g => g.id === 'vv-invullen');
  const o = optiesVoor(gen, ['1.3.GL3.16'], { 'verenkelen-verdubbelen': { regel: 'verdubbelen' } });
  assert.deepEqual([o.doelen, o.regel], [['1.3.GL3.16'], 'verdubbelen']);
  const model = planModel(taal, { doelen: ['1.3.GL4.18'], keuzes: { 'verenkelen-verdubbelen': { regel: 'verenkelen' } }, seed: 3, gebied: 0, aantal: 6, blokken: 3 });
  for (const b of losOp(taal, model).blokken) for (const x of b.oefeningen) for (const k of x.kernen || [x.kern]) assert.equal(regelVV(k).soort, 'verenkelen');
  const mv = planModel(taal, { doelen: ['1.3.GL2.26'], keuzes: { meervouden: { regel: 's' } }, seed: 3, gebied: 0, aantal: 6, blokken: 3 });
  for (const b of losOp(taal, mv).blokken) for (const x of b.oefeningen) for (const k of x.kernen || [x.kern]) assert.equal(regelMV(k).soort, 's');
});

test('alle taalvormen samen op één blad: bladcode geeft exact hetzelfde blad terug', () => {
  const ids = GENERATORS.map(g => g.id);
  const opties = Object.fromEntries(GENERATORS.map(g => [g.id, g.opties(g.doelen, {}, g.doelen[0])]));
  const blad = losOp(taal, modelVoorVormen(taal, ids, { seed: 4242, aantal: 6, gebied: 0, opties }));
  const { model } = modelUitCode(taal, blad.code);
  assert.deepEqual(losOp(taal, model).blokken, blad.blokken);
  assert.throws(() => modelUitCode(taal, 'onzin'));
});

test('een blad met doelen uit alle drie de families', () => {
  const doelen = ['1.3.GL3.16', '1.3.GL2.26', '1.3.GL2.25', '1.3.GL4.17', '1.3.GL3.15'];
  for (const seed of SEEDS) {
    const blad = losOp(taal, planModel(taal, { doelen, keuzes: {}, seed, gebied: 0, aantal: 6, blokken: 3 }));
    assert.equal(blad.blokken.length, 15);
    assert.ok(blad.blokken.every(b => b.oefeningen.length > 0), `seed ${seed}: leeg blok`);
  }
});
