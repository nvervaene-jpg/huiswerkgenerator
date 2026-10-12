import { test } from 'node:test';
import assert from 'node:assert/strict';
import taal from '../js/subjects/taal/index.js';
import { GENERATORS } from '../js/subjects/taal/generators/index.js';
import { WERKWOORDEN_FAMILIES } from '../js/subjects/taal/generators/werkwoorden.js';
import { WERKWOORDEN, VERBEN } from '../js/subjects/taal/woorden/werkwoorden.js';
import { vergelijkMoeilijkheid } from '../js/subjects/wiskunde/generators/hulp.js';
import { planModel, losOp, modelUitCode } from '../js/core/blad-model.js';

const SEEDS = Array.from({ length: 6 }, (_, i) => i + 1);

/* ------------------------------------------------------------ eigen werkwoordregels, los van de generators */
// Stam van een regelmatig werkwoord: -en weg, dubbele medeklinker enkel, open lettergreep verlengen, v/z -> f/s.
function stamRegel(inf) {
  const voor = /^(ver|her|ont)/.test(inf) ? inf.slice(0, 3) : inf === 'bestellen' ? 'be' : '';
  let s = inf.slice(voor.length, -2);
  if (/([^aeiou])\1$/.test(s)) s = s.slice(0, -1);
  else if (/(^|[^aeiou])[aeiou][^aeiouwj]$/.test(s) && (s.match(/(?:ij|[aeiouy])+/g) || []).length === 1) s = s.replace(/([aeiou])([^aeiou])$/, '$1$1$2');
  s = s.replace(/v$/, 'f').replace(/z$/, 's');
  return voor + s;
}
const kofschip = (inf) => 'tkfschp'.includes(inf.slice(0, -2).at(-1));
const geenGe = (inf) => /^(ver|her|ont)/.test(inf) || inf === 'bestellen';

// Tweede, los getypte tabel met de feiten die je niet uit een regel kunt afleiden.
const STERK = {
  lopen: ['liep', 'liepen', 'gelopen', null], komen: ['kwam', 'kwamen', 'gekomen', 'zijn'], zien: ['zag', 'zagen', 'gezien', 'hebben'],
  eten: ['at', 'aten', 'gegeten', 'hebben'], drinken: ['dronk', 'dronken', 'gedronken', 'hebben'], geven: ['gaf', 'gaven', 'gegeven', 'hebben'],
  nemen: ['nam', 'namen', 'genomen', 'hebben'], schrijven: ['schreef', 'schreven', 'geschreven', 'hebben'], vinden: ['vond', 'vonden', 'gevonden', 'hebben'],
  zitten: ['zat', 'zaten', 'gezeten', null], slapen: ['sliep', 'sliepen', 'geslapen', 'hebben'], lezen: ['las', 'lazen', 'gelezen', 'hebben'],
  zingen: ['zong', 'zongen', 'gezongen', 'hebben'], vallen: ['viel', 'vielen', 'gevallen', 'zijn'], helpen: ['hielp', 'hielpen', 'geholpen', 'hebben'],
  blijven: ['bleef', 'bleven', 'gebleven', 'zijn'], kijken: ['keek', 'keken', 'gekeken', 'hebben'], gaan: ['ging', 'gingen', 'gegaan', 'zijn'],
  staan: ['stond', 'stonden', 'gestaan', null], bijten: ['beet', 'beten', 'gebeten', 'hebben'], rijden: ['reed', 'reden', 'gereden', null],
  vliegen: ['vloog', 'vlogen', 'gevlogen', null], zwemmen: ['zwom', 'zwommen', 'gezwommen', null], snijden: ['sneed', 'sneden', 'gesneden', 'hebben'],
  vergeten: ['vergat', 'vergaten', 'vergeten', 'hebben'], brengen: ['bracht', 'brachten', 'gebracht', 'hebben'], doen: ['deed', 'deden', 'gedaan', 'hebben'],
  hebben: ['had', 'hadden', 'gehad', 'hebben'], zijn: ['was', 'waren', 'geweest', 'zijn'],
};
const OTT_TAB = {                                    // ik, jij/hij, mv
  zijn: ['ben', 'bent', 'is', 'zijn'], hebben: ['heb', 'hebt', 'heeft', 'hebben'], gaan: ['ga', 'gaat', 'gaat', 'gaan'], staan: ['sta', 'staat', 'staat', 'staan'],
  doen: ['doe', 'doet', 'doet', 'doen'], zien: ['zie', 'ziet', 'ziet', 'zien'], komen: ['kom', 'komt', 'komt', 'komen'],
};
const AUX = { hebben: { ott: ['heb', 'hebt', 'heeft', 'hebben'], ovt: ['had', 'hadden'] }, zijn: { ott: ['ben', 'bent', 'is', 'zijn'], ovt: ['was', 'waren'] } };
const PERS = { ik: [false, 0], jij: [false, 1], hij: [false, 2], juf: [false, 2], wij: [true, 3], jullie: [true, 3], kinderen: [true, 3] };

function ottOrakel(inf, persId) {
  const [mv, i] = PERS[persId];
  if (OTT_TAB[inf]) return OTT_TAB[inf][i];
  const stam = stamRegel(inf);
  return mv ? inf : i === 0 || stam.endsWith('t') ? stam : stam + 't';
}
function ovtOrakel(inf, persId) {
  const mv = PERS[persId][0];
  if (STERK[inf]) return STERK[inf][mv ? 1 : 0];
  return stamRegel(inf) + (kofschip(inf) ? 'te' : 'de') + (mv ? 'n' : '');
}
function vdOrakel(inf) {
  if (STERK[inf]) return STERK[inf][2];
  const stam = stamRegel(inf), eind = kofschip(inf) ? 't' : 'd';
  return (geenGe(inf) ? '' : 'ge') + stam + (stam.endsWith(eind) ? '' : eind);
}
const hulpOrakel = (inf) => (STERK[inf] ? STERK[inf][3] : ['verhuizen'].includes(inf) ? 'zijn' : ['wandelen', 'fietsen', 'stoppen', 'rennen'].includes(inf) ? null : 'hebben');
function naarOrakel(tijd, persId, inf) {
  const [mv, i] = PERS[persId], hulp = hulpOrakel(inf);
  switch (tijd) {
    case 'ott': return ottOrakel(inf, persId);
    case 'ovt': return ovtOrakel(inf, persId);
    case 'vd': return vdOrakel(inf);
    case 'vtt': return `${AUX[hulp].ott[mv ? 3 : i]} ${vdOrakel(inf)}`;
    case 'vvt': return `${AUX[hulp].ovt[mv ? 1 : 0]} ${vdOrakel(inf)}`;
    case 'tt': return `${mv ? 'zullen' : 'zal'} ${inf}`;
    default: throw new Error(tijd);
  }
}
// De spellingregel die bij een opgave hoort, zoals hij in 'welke regel?' getoond wordt.
function regelLabel(tijd, persId, inf) {
  const mv = PERS[persId][0], naar = naarOrakel(tijd, persId, inf);
  if (tijd === 'ott') return mv ? '-en' : PERS[persId][1] === 0 || naar === stamRegel(inf) ? 'stam' : 'stam + t';
  if (tijd === 'ovt') return STERK[inf] ? 'klinkerwissel' : kofschip(inf) ? '-te(n)' : '-de(n)';
  if (tijd === 'vd') return STERK[inf] ? '-en' : vdOrakel(inf).endsWith('t') ? '-t' : '-d';
  if (tijd === 'vtt' || tijd === 'vvt') return hulpOrakel(inf);
  return mv ? 'zullen' : 'zal';
}
const ONREGELMATIG = new Set(['zijn', 'hebben', 'doen', 'brengen', 'gaan', 'staan', 'zien']);                           // geen regel-oefening
const heeftRegel = (tijd, persId, inf) => {
  if (tijd === 'ott') return !(OTT_TAB[inf] && inf !== 'komen');
  if (tijd === 'ovt') return !['zijn', 'hebben', 'doen', 'brengen'].includes(inf);
  if (tijd === 'vd') return !['zijn', 'hebben', 'doen', 'brengen'].includes(inf);
  return true;
};

test('werkwoordenlijst: stam, verleden tijd en voltooid deelwoord volgen de regels', () => {
  assert.ok(WERKWOORDEN.length >= 60);
  const gezien = new Set();
  for (const v of VERBEN) {
    assert.ok(!gezien.has(v.inf), `dubbel: ${v.inf}`); gezien.add(v.inf);
    assert.ok(v.inf.endsWith('n'), v.inf);
    if (v.inf !== 'zijn') assert.equal(v.stam, OTT_TAB[v.inf] ? OTT_TAB[v.inf][0] : stamRegel(v.inf), `${v.inf}: stam`);
    assert.equal(v.hulp, hulpOrakel(v.inf), `${v.inf}: hulpwerkwoord`);
    if (v.soort === 'zwak') {
      assert.ok(!STERK[v.inf], v.inf);
      assert.deepEqual(v.ovt, [ovtOrakel(v.inf, 'ik'), ovtOrakel(v.inf, 'wij')], `${v.inf}: verleden tijd`);
      assert.equal(v.vd, vdOrakel(v.inf), `${v.inf}: voltooid deelwoord`);
    } else {
      assert.ok(STERK[v.inf], `${v.inf} staat niet in de controletabel`);
      assert.deepEqual([v.ovt[0], v.ovt[1], v.vd], STERK[v.inf].slice(0, 3), v.inf);
      assert.notEqual(v.ovt[0], stamRegel(v.inf) + (kofschip(v.inf) ? 'te' : 'de'), `${v.inf}: een sterk werkwoord heeft geen -te/-de`);
    }
    assert.equal(v.frequent === true || v.frequent === false, true);
    assert.ok(v.zinsdeel.length > 2 && !/ (de juf|de kinderen)$/.test(v.zinsdeel));
  }
  for (const [inf, rij] of Object.entries(OTT_TAB)) {
    const v = VERBEN.find(x => x.inf === inf);
    assert.deepEqual([v.ott.ik, v.ott.jij, v.ott.hij, v.ott.mv], [rij[0], rij[1], rij[2], rij[3]], inf);
  }
  assert.ok(VERBEN.filter(v => v.frequent).length >= 35);
});

const familie = (naam) => WERKWOORDEN_FAMILIES[naam];
for (const [naam, fam] of Object.entries(WERKWOORDEN_FAMILIES)) {
  const prefix = `ww-${naam}-`, vormen = GENERATORS.filter(g => g.id.startsWith(prefix));
  const alle = fam.woordenVoor({ doelen: vormen[0].doelen });

  test(`werkwoorden ${naam}: elke opgave klopt met de eigen werkwoordregels`, () => {
    assert.ok(alle.length > 100, `${alle.length} opgaven`);
    for (const w of alle) {
      const d = w.data, verwacht = naarOrakel(d.tijd, d.persId, d.inf);
      assert.equal(w.naar, verwacht, `${d.tijd} ${d.persoon} ${d.inf}`);
      assert.notEqual(w.fout, w.naar, `${d.tijd} ${d.persoon} ${d.inf}: fout = juist`);
      assert.ok(w.fout && !/undefined|NaN/.test(w.fout));
      assert.ok(!['ik', 'jij', 'hij', 'wij', 'jullie'].includes(w.kern), 'kern is het werkwoord');
      if (d.tijd !== 'ott' && d.tijd !== 'ovt' && d.tijd !== 'tt') assert.ok(d.hulp, `${d.inf} heeft geen vast hulpwerkwoord`);
      assert.ok(/^(Ik weet|Ik denk|Ik hoor|Het is duidelijk) dat /.test(w.zinVoor) && w.zinVoor.includes(d.persoon) && !w.zinVoor.includes('undefined'));
    }
  });

  const verifieer = {
    'tw-invullen': (d, o) => { assert.equal(o.antwoord, naarOrakel(d.tijd, d.persId, d.inf)); assert.ok(o.tekst.includes(d.tijdLabel) && o.tekst.includes(`(${d.inf})`) && o.tekst.includes('____') && o.tekst.includes(d.voor)); },
    'tw-zin': (d, o) => {
      assert.equal(o.antwoord, naarOrakel(d.tijd, d.persId, d.inf));
      assert.ok(o.tekst.includes(`__________ (${d.inf})`) && o.tekst.endsWith(').'));
      assert.equal(o.tekst.replace(`__________ (${d.inf})`, d.naar), o.volledig);
      assert.ok(o.volledig.endsWith(`${d.naar}.`) && !o.volledig.includes('____') && !o.volledig.includes(`(${d.inf})`));
      assert.ok(o.volledig.includes(d.persoon));
    },
    'tw-kies': (d, o) => {
      assert.equal(d.opties.length, 2); assert.equal(new Set(d.opties).size, 2);
      assert.equal(d.opties[d.juist], naarOrakel(d.tijd, d.persId, d.inf)); assert.equal(o.antwoord, d.opties[d.juist]);
      assert.ok(d.opties.every(x => o.tekst.includes(x)) && o.tekst.includes(`(${d.inf})`));
    },
    'tw-juistfout': (d, o) => {
      const juist = naarOrakel(d.tijd, d.persId, d.inf);
      assert.equal(d.juist, d.getoond === juist); assert.equal(o.antwoord, d.juist ? 'juist' : 'fout');
      assert.ok(o.tekst.includes(d.getoond) && o.tekst.includes(d.tijdLabel));
    },
    'tw-regel': (d, o) => {
      assert.ok(heeftRegel(d.tijd, d.persId, d.inf), `${d.inf} hoort niet in een regel-oefening`);
      assert.equal(o.antwoord, regelLabel(d.tijd, d.persId, d.inf));
      assert.ok(d.soorten.length >= 2 && o.tekst.includes(o.antwoord));
    },
    'tw-verbind': (d, o) => {
      assert.equal(d.woorden.length, 4); assert.equal(new Set(d.woorden.map(w => w.inf)).size, 4);
      const rechts = [...o.svg.markup.matchAll(/<text x="416"[^>]*>([^<]+)</g)].map(m => m[1]);
      const links = [...o.svg.markup.matchAll(/<text x="16"[^>]*>([^<]+)</g)].map(m => m[1]);
      assert.equal(links.length, 4); assert.equal(rechts.length, 4);
      const lijnen = [...o.antwoordSvg.markup.matchAll(/<line x1="228" y1="([\d.]+)" x2="392" y2="([\d.]+)"/g)].map(m => [+m[1], +m[2]]);
      assert.equal(lijnen.length, 4); assert.equal((o.svg.markup.match(/<line /g) || []).length, 0);
      const rij = (y) => Math.round((y - 8 - 23) / 46);
      for (const [y1, y2] of lijnen) {
        const w = d.woorden.find(x => `${x.voor} (${x.inf})` === links[rij(y1)]);
        assert.ok(w, `onbekend woord ${links[rij(y1)]}`);
        assert.equal(rechts[rij(y2)], naarOrakel(w.tijd, w.persId, w.inf));
      }
    },
    'tw-kleuren': (d, o) => {
      assert.equal(d.woorden.length, 6); assert.equal(new Set(d.woorden.map(w => w.inf)).size, 6);
      for (const w of d.woorden) {
        assert.equal(w.juist, w.getoond === naarOrakel(w.tijd, w.persId, w.inf));
        assert.equal(w.tekst, `${w.voor} ${w.getoond}`);
        assert.ok(o.svg.markup.includes(`>${w.tekst}<`));
      }
      const groen = (o.antwoordSvg.markup.match(/fill="#a9dfa3"/g) || []).length;
      assert.equal(groen, d.woorden.filter(w => w.juist).length); assert.ok(groen >= 2 && groen <= 4);
      assert.equal((o.svg.markup.match(/fill="#a9dfa3"/g) || []).length, 0);
    },
    'tw-fout': (d, o) => {
      if (d.variant === 'verbeter') {
        const [w] = d.woorden; assert.notEqual(w.getoond, naarOrakel(w.tijd, w.persId, w.inf)); assert.equal(o.antwoord, naarOrakel(w.tijd, w.persId, w.inf));
        assert.ok(o.tekst.includes(`${w.getoond} (${w.inf})`));
      } else {
        assert.equal(d.woorden.length, 3);
        d.woorden.forEach((w, i) => assert.equal(w.getoond === naarOrakel(w.tijd, w.persId, w.inf), i !== d.fout));
        const w = d.woorden[d.fout]; assert.equal(d.juist, naarOrakel(w.tijd, w.persId, w.inf));
        assert.ok(o.antwoord.startsWith('abc'[d.fout] + ')') && o.tekst.includes(`${w.voor} ${w.getoond}`));
      }
    },
  };

  for (const gen of vormen) {
    test(`${gen.id}: antwoorden kloppen, geen dubbels, oplopende moeilijkheid, opgaven passen bij doel en keuze`, () => {
      let totaal = 0;
      const soorten = [...new Set(alle.map(w => w.soort))];
      for (const codes of [...gen.doelen.map(c => [c]), gen.doelen]) for (const regel of ['beide', ...soorten]) {
        const opties = gen.opties(codes, { regel }, codes.length === 1 ? codes[0] : null);
        const toegelaten = new Set(fam.woordenVoor(opties).map(w => w.van));
        for (const seed of SEEDS) {
          const { oefeningen, waarschuwing } = gen.genereer({ seed, aantal: 8, gebied: 0, opties });
          if (!toegelaten.size) { assert.equal(oefeningen.length, 0); continue; }
          totaal += oefeningen.length;
          if (oefeningen.length < 8) assert.ok(waarschuwing, `${gen.id}: ${oefeningen.length} oefeningen zonder waarschuwing`);
          const gezien = new Set(), sleutels = new Set(); let vorige = null;
          for (const o of oefeningen) {
            const ctx = `${gen.id} ${codes} ${regel} seed ${seed}: ${o.tekst}`;
            assert.ok(o.tekst !== undefined && o.antwoord && o.volledig && !/undefined|NaN/.test(o.tekst + o.volledig), ctx);
            const id = o.tekst + (o.svg ? o.svg.markup : '');
            assert.ok(!gezien.has(id) && !sleutels.has(o.sleutel), `dubbel: ${ctx}`); gezien.add(id); sleutels.add(o.sleutel);
            if (vorige) assert.ok(vergelijkMoeilijkheid(vorige.moeilijkheid, o.moeilijkheid) <= 0, `niet oplopend: ${ctx}`);
            vorige = o;
            assert.ok(o.data && verifieer[o.data.type], `geen controle voor ${o.data && o.data.type}`);
            verifieer[o.data.type](o.data, o);
            const sleutelsVan = o.data.woorden ? o.data.woorden.map(w => `${w.tijd}|${w.persId}|${w.inf}`) : [`${o.data.tijd}|${o.data.persId}|${o.data.inf}`];
            for (const k of sleutelsVan) assert.ok(toegelaten.has(k), `${ctx}: ${k} hoort niet bij dit doel of deze keuze`);
          }
        }
      }
      assert.ok(totaal > 0);
    });
  }

  test(`werkwoorden ${naam}: bladen volgen het niveau van hun doel en de bladcode herhaalt ze`, () => {
    for (const seed of SEEDS) {
      const model = planModel(taal, { doelen: vormen[0].doelen, keuzes: {}, seed, gebied: 0, aantal: 6, blokken: 3 });
      const blad = losOp(taal, model);
      assert.equal(model.blokken.length, vormen[0].doelen.length * 3);
      model.blokken.forEach((b, i) => {
        const toegelaten = new Set(fam.woordenVoor({ doelen: [b.doel] }).map(w => w.kern));
        for (const o of blad.blokken[i].oefeningen) for (const k of o.kernen || [o.kern]) assert.ok(toegelaten.has(k), `${b.doel}: ${k}`);
      });
      const { model: terug, waarschuwing } = modelUitCode(taal, blad.code);
      assert.equal(waarschuwing, null);
      assert.deepEqual(losOp(taal, terug).blokken, blad.blokken);
    }
  });
}

test('werkwoorden: het niveau van de doelen klopt (eenvoudig, frequent, alles)', () => {
  const ott = familie('ott');
  const voor = (code) => ott.woordenVoor({ doelen: [code] });
  assert.ok(voor('1.3.GL2.28').every(w => w.frequent && !w.verb.ott && ['ik', 'hij', 'wij', 'kinderen'].includes(w.pers.id)));
  assert.ok(voor('1.3.GL3.18').some(w => w.pers.id === 'jij') && voor('1.3.GL3.18').every(w => !w.verb.ott));
  assert.ok(voor('1.3.GL4.20').some(w => w.verb.ott) && voor('1.3.GL4.20').length > voor('1.3.GL3.18').length);
  assert.ok(familie('tt').woordenVoor({ doelen: ['1.3.GL6.22'] }).every(w => w.pers.id !== 'jij'));
  for (const f of ['vd', 'vp']) assert.ok(familie(f).woordenVoor({}).every(w => w.verb.hulp), `${f}: enkel werkwoorden met een vast hulpwerkwoord`);
});

test('werkwoorden: de doelen zijn gekoppeld', () => {
  const codes = new Set(GENERATORS.flatMap(g => g.doelen));
  for (const c of ['1.3.GL2.28', '1.3.GL3.18', '1.3.GL4.20', '1.3.GL5.28', '1.3.GL6.19', '1.3.GL3.19', '1.3.GL5.29', '1.3.GL6.20', '1.3.GL4.21', '1.3.GL5.30', '1.3.GL5.31', '1.3.GL6.21', '1.3.GL6.22']) assert.ok(codes.has(c), c);
});
