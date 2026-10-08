import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GENERATORS } from '../js/subjects/wiskunde/generators/index.js';
import { vergelijkMoeilijkheid } from '../js/subjects/wiskunde/generators/hulp.js';
import { ICONEN_NAMEN } from '../js/core/icons.js';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { modelVoorVormen, losOp, modelUitCode } from '../js/core/blad-model.js';
import { THEMAS, REFERENTIE_LENGTE, NAMEN } from '../js/subjects/wiskunde/contexten.js';

const MATEN = {                                    // waarde van 1 eenheid in de kleinste eenheid (eigen tabel, los van de generator)
  lengte: { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 },
  massa: { g: 1, dag: 10, hg: 100, kg: 1000 },
  tijd: { s: 1, min: 60, uur: 3600, dag: 86400 },
  geld: { cent: 1, euro: 100 },
};
const GEBIEDEN = [10, 20, 100, 1000, 10000];
const SEEDS = Array.from({ length: 25 }, (_, i) => i + 1);
const som = (l) => l.reduce((x, y) => x + y, 0);

// Onafhankelijke brugregels (andere rekenwijze dan de generator).
const brugOptellen = (a, b) => [1, 2, 3, 4, 5].some(k => (a % 10 ** k) + (b % 10 ** k) > 10 ** k);
const brugAftrekken = (a, b) => [1, 2, 3, 4, 5].some(k => (a % 10 ** k) < (b % 10 ** k));

const cijfers = (n) => String(n).split('').map(Number);
const PLAATS = ['E', 'T', 'H', 'D'];

// Controleert per soort oefening of het antwoord klopt, los van de generator.
const verifieer = {
  omzet: undefined,
  vergelijk: ({ a, b }, o) => assert.equal(o.antwoord, a < b ? '<' : a > b ? '>' : '='),
  orden: ({ getallen, stijgend }, o) => {
    const juist = [...getallen].sort((x, y) => (stijgend ? x - y : y - x));
    assert.equal(new Set(getallen).size, getallen.length);
    assert.equal(o.antwoord, juist.join(stijgend ? ' < ' : ' > '));
    assert.ok(getallen.some((v, i) => v !== juist[i]), 'staat al in de juiste volgorde');
  },
  as: ({ start, stap, weg }, o) => {
    assert.equal(o.antwoord, weg.map(i => start + i * stap).join(', '));
    assert.ok(weg.length >= 2 && weg.length <= 4);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 11 - weg.length, 'zichtbare getallen');
    assert.equal((o.svg.markup.match(/<rect /g) || []).length, weg.length, 'lege vakjes');
  },
  splits: ({ n, onderdelen, weg }, o) => {
    assert.equal(som(onderdelen), n);
    assert.equal(o.antwoord, String(onderdelen[weg]));
    assert.ok(o.tekst.includes('____') && !o.tekst.replace('____', '').includes('____'));
  },
  'pw-splits': ({ n }, o) => assert.equal(o.antwoord, cijfers(n).map((c, i, l) => `${c} ${PLAATS[l.length - 1 - i]}`).join(' + ')),
  'pw-samen': ({ n }, o) => assert.equal(o.antwoord, String(n)),
  'pw-cijfer': ({ n, plaats }, o) => assert.equal(o.antwoord, String(cijfers(n).reverse()[PLAATS.indexOf(plaats)])),
  'pw-mab': ({ n, h, t, e }, o) => {
    assert.equal(h * 100 + t * 10 + e, n);
    assert.equal((o.svg.markup.match(/fill="#bfe0f5"/g) || []).length, h);
    assert.equal((o.svg.markup.match(/fill="#f6d27a"/g) || []).length, t);
    assert.equal((o.svg.markup.match(/fill="#f4a3a3"/g) || []).length, e);
    assert.equal(o.antwoord, String(n));
  },
  maal: ({ x, y }, o) => assert.equal(o.antwoord, String(x * y)),
  deel: ({ p, t, k }, o) => { assert.equal(t * k, p); assert.equal(o.antwoord, String(k)); },
  omzet: ({ maat, v, a, w, b, onbekend }, o) => {
    assert.equal(v * MATEN[maat][a], w * MATEN[maat][b]);
    if (onbekend === 'links') { assert.equal(o.antwoord, `${v} ${a}`); assert.ok(o.tekst.startsWith('____')); }
    else assert.equal(o.antwoord, `${w} ${b}`);
    assert.notEqual(a, b);
  },
  'orden-maat': ({ items, stijgend }, o) => {
    const cm = items.map(i => i.v * MATEN.lengte[i.u]);
    assert.equal(new Set(cm).size, items.length, 'verschillende lengtes');
    const juist = [...items].sort((x, y) => (stijgend ? 1 : -1) * (x.v * MATEN.lengte[x.u] - y.v * MATEN.lengte[y.u]));
    assert.equal(o.antwoord, juist.map(i => `${i.v} ${i.u}`).join(stijgend ? ' < ' : ' > '));
  },
  'verbind-maat': ({ paren }, o) => {
    assert.equal(paren.length, 4);
    for (const { v, a, w, b } of paren) assert.equal(v * MATEN.lengte[a], w * MATEN.lengte[b]);
    assert.equal((o.antwoordSvg.markup.match(/stroke="#c0392b"/g) || []).length, 4, 'vier lijnen in de oplossing');
    assert.ok(!o.svg.markup.includes('#c0392b'), 'geen oplossing in de opgave');
    for (const { v, a, w, b } of paren) assert.ok(o.svg.markup.includes(`>${v} ${a}<`) && o.svg.markup.includes(`>${w} ${b}<`));
  },
  'juistfout-maat': ({ v, a, w, b, juist }, o) => {
    assert.equal(v * MATEN.lengte[a] === w * MATEN.lengte[b], juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
  },
  'meerkeuze-maat': ({ v, a, b, opties, juist }, o) => {
    const goed = opties.filter(x => x * MATEN.lengte[b] === v * MATEN.lengte[a]);
    assert.equal(goed.length, 1, 'precies één juist antwoord');
    assert.equal(opties.indexOf(goed[0]), juist);
    assert.equal(new Set(opties).size, opties.length);
    assert.ok(o.antwoord.startsWith(`${'abc'[juist]})`));
  },
  'tabel-maat': ({ kolommen, rijen, gegeven }, o) => {
    for (const rij of rijen) { const waarden = rij.map((x, c) => x * MATEN.lengte[kolommen[c]]); assert.ok(waarden.every(x => x === waarden[0]), `rij ${rij}`); }
    assert.equal((o.svg.markup.match(/<text /g) || []).length, kolommen.length + rijen.length, 'één gegeven per rij');
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, kolommen.length + rijen.length * kolommen.length, 'alles ingevuld in de oplossing');
    assert.equal(gegeven.length, rijen.length);
  },
  'fout-maat': ({ variant, zinnen, fout, juist }, o) => {
    const klopt = (z) => z.v * MATEN.lengte[z.a] === z.w * MATEN.lengte[z.b];
    if (variant === 'verbeter') { assert.ok(!klopt(zinnen[0])); assert.equal(o.antwoord, `${juist} ${zinnen[0].b}`); }
    else {
      assert.equal(zinnen.filter(z => !klopt(z)).length, 1, 'precies één foute zin');
      assert.ok(!klopt(zinnen[fout]));
      assert.ok(o.antwoord.startsWith(`${'abc'[fout]})`));
      assert.equal(zinnen[fout].v * MATEN.lengte[zinnen[fout].a], juist * MATEN.lengte[zinnen[fout].b]);
    }
  },
  'vraag-omzet': ({ v, a, w, b, naarLinks }, o) => {
    assert.equal(v * MATEN.lengte[a], w * MATEN.lengte[b]);
    assert.equal(o.antwoord, naarLinks ? `${w} ${b}` : `${v} ${a}`);
    assert.ok(!/undefined/.test(o.tekst));
  },
  'vraag-vergelijk': ({ items, winnaar }, o) => {
    const cm = items.map(i => i.v * MATEN.lengte[i.u]);
    assert.notEqual(cm[0], cm[1]);
    assert.equal(winnaar, items[cm[0] > cm[1] ? 0 : 1].naam);
    assert.equal(o.antwoord, winnaar);
  },
  'eenheid-maat': ({ getal, eenheid, opties }, o) => {
    assert.ok(REFERENTIE_LENGTE.some(i => i.getal === getal && i.eenheid === eenheid && o.tekst.includes(`${getal} ____`)));
    assert.ok(opties.includes(eenheid) && new Set(opties).size === opties.length && opties.length >= 2);
    assert.equal(o.antwoord, eenheid);
  },
  'kleur-balk': ({ van, tot, lat }, o) => {
    assert.ok(van >= 0 && tot > van && tot <= lat);
    assert.ok(!o.svg.markup.includes('fill="#f4b942"') && o.antwoordSvg.markup.includes('fill="#f4b942"'), 'leeg in de opgave, gekleurd in de oplossing');
    assert.equal(o.antwoord, `${tot - van} cm`);
  },
  'teken-lijn': ({ cm }, o) => {
    assert.ok(cm >= 1 && cm <= 15);
    const [, x2] = /x1="26" y1="30" x2="([\d.]+)"/.exec(o.antwoordSvg.markup);
    assert.ok(Math.abs((Number(x2) - 26) / (96 / 2.54) - cm) < 0.01, 'lijn op ware grootte');
    assert.ok(!o.svg.markup.includes('<line'), 'geen lijn in de opgave');
  },
  'maat-vergelijk': ({ maat, v, a, w, b }, o) => {
    const x = v * MATEN[maat][a], y = w * MATEN[maat][b];
    assert.equal(o.antwoord, x < y ? '<' : x > y ? '>' : '=');
    assert.notEqual(a, b);
  },
  weegschaal: ({ kg, g, max }, o) => {
    const hoek = -135 + (270 * (kg + g / 1000)) / max;
    const [, gemeten] = /rotate\((-?[\d.]+) /.exec(o.svg.markup);
    assert.ok(Math.abs(Number(gemeten) - hoek) < 0.01, `wijzer ${gemeten} i.p.v. ${hoek}`);
    assert.equal(o.antwoord, g ? `${kg} kg ${g} g` : `${kg} kg`);
  },
  klok: ({ h, m }, o) => {
    const hoeken = [...o.svg.markup.matchAll(/rotate\((-?[\d.]+) /g)].map(x => Number(x[1]));
    assert.equal(hoeken.length, 2);
    assert.ok(Math.abs(hoeken[0] - ((h % 12) * 30 + m / 2)) < 0.01, 'kleine wijzer');
    assert.ok(Math.abs(hoeken[1] - m * 6) < 0.01, 'grote wijzer');
    assert.equal(o.antwoord, `${h}:${String(m).padStart(2, '0')}`);
    assert.ok(h >= 1 && h <= 12 && m >= 0 && m <= 59);
  },
  'klok-teken': ({ h, m }, o) => {
    assert.ok(!o.svg.markup.includes('rotate('), 'lege klok');
    assert.ok(o.tekst.includes(`${h}:${String(m).padStart(2, '0')}`));
  },
  tijdsduur: ({ h1, m1, duur, naarEinde, h2, m2 }, o) => {
    const start = h1 * 60 + m1, einde = h2 * 60 + m2;
    assert.equal(((einde - start) % 720 + 720) % 720, duur % 720, 'start + duur = einde (12-uurs klok)');
    assert.equal(o.antwoord, naarEinde ? `${h2}:${String(m2).padStart(2, '0')}` : (duur >= 60 ? `${Math.floor(duur / 60)} u${duur % 60 ? ` ${duur % 60} min` : ''}` : `${duur} min`));
  },
  dag: ({ dag, sprong }, o) => {
    const dagen = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    assert.equal(o.antwoord, dagen[(((dagen.indexOf(dag) + sprong) % 7) + 7) % 7]);
  },
  munten: ({ items, totaal }, o) => {
    assert.equal(items.reduce((x, y) => x + y, 0), totaal);
    const getekend = (o.svg.markup.match(/<circle /g) || []).length + (o.svg.markup.match(/<rect /g) || []).length;
    assert.ok(getekend >= items.length, 'elk muntstuk of biljet is getekend');
    assert.equal(o.antwoord.replace(/\D/g, '').length > 0, true);
    assert.equal(Math.round(Number(o.antwoord.replace('€ ', '').replace(',', '.')) * 100), totaal);
  },
  prijs: ({ prijzen, totaal }, o) => {
    assert.equal(prijzen.reduce((x, y) => x + y, 0), totaal);
    assert.equal(Math.round(Number(o.antwoord.replace('€ ', '').replace(',', '.')) * 100), totaal);
  },
  wissel: ({ betaald, prijs, terug }, o) => {
    assert.equal(betaald * 100 - prijs, terug);
    assert.ok(prijs > 0 && terug > 0);
    assert.equal(Math.round(Number(o.antwoord.replace('€ ', '').replace(',', '.')) * 100), terug);
  },
  aflezen: ({ van, tot, lat }, o) => {
    assert.equal(o.antwoord, `${tot - van} cm`);
    assert.ok(van >= 0 && tot > van && tot <= lat);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, lat + 1, 'cijfers op de meetlat');
  },
};

// Varianten van opties waarmee elke generator getest wordt.
function varianten(gen) {
  const standaard = gen.opties ? gen.opties(gen.doelen, {}) : {};
  switch (gen.id) {
    case 'optellen': case 'aftrekken': return ['zonder', 'met', 'beide'].map(brug => ({ brug }));
    case 'maaltafels': return [{ bewerking: 'beide', tafels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { bewerking: 'delen', tafels: [3, 4] }, { bewerking: 'vermenigvuldigen', tafels: [2, 5, 10] }];
    case 'vermenigvuldigen-delen': return ['beide', 'delen', 'vermenigvuldigen'].map(bewerking => ({ bewerking }));
    case 'lengtematen-omzetten': case 'lengtematen-vergelijken': case 'lengtematen-ordenen': case 'lengtematen-verbinden': case 'lengtematen-juist-fout':
    case 'lengtematen-meerkeuze': case 'lengtematen-tabel': case 'lengtematen-fout-zoeken':
      return [['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']].map(eenheden => ({ eenheden }));
    case 'massa-omzetten': case 'massa-vergelijken': return [['kg', 'g'], ['kg', 'hg', 'dag', 'g']].map(eenheden => ({ eenheden }));
    case 'tijdsduur-omzetten': return [['dag', 'uur'], ['dag', 'uur', 'min'], ['dag', 'uur', 'min', 's']].map(eenheden => ({ eenheden }));
    case 'klok-aflezen': case 'klok-tekenen': return ['uur', 'halfuur', 'kwartier', 'vijf', 'minuut'].map(precisie => ({ precisie }));
    case 'lengtematen-eenheid': return [['m', 'cm'], ['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']].map(eenheden => ({ eenheden, thema: 'gemengd' }));
    case 'lengtematen-vraagstuk': return [['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']].flatMap(eenheden => ['gemengd', 'dieren', 'sprookjes'].map(thema => ({ eenheden, thema })));
    case 'geld-munten-tellen': case 'geld-totaalprijs': case 'geld-wisselgeld': return ['1', '2', '3', '4'].map(niveau => ({ niveau }));
    default: return [standaard];
  }
}

test('de koppelingen in generators-map.json komen overeen met de doelen van de generators', async () => {
  const map = JSON.parse(await readFile(new URL('../data/wiskunde/generators-map.json', import.meta.url), 'utf8')).koppelingen;
  const bron = JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen;
  const codes = new Set(bron.map(d => d.code));
  const verwacht = {};
  for (const g of GENERATORS) for (const c of g.doelen) { assert.ok(codes.has(c), `${g.id}: onbekend doel ${c}`); (verwacht[c] ||= []).push(g.id); }
  assert.deepEqual(map, Object.fromEntries(Object.entries(verwacht).sort(([a], [b]) => (a < b ? -1 : 1))));
});

test('elke generator heeft een id, titel, opdracht en bestaand pictogram', () => {
  assert.equal(new Set(GENERATORS.map(g => g.id)).size, GENERATORS.length);
  for (const g of GENERATORS) {
    assert.ok(g.id && g.titel && g.opdracht && g.doelen.length, g.id);
    assert.ok(ICONEN_NAMEN.includes(g.pictogram), `${g.id}: pictogram ${g.pictogram}`);
  }
});

for (const gen of GENERATORS) {
  test(`${gen.id}: antwoorden kloppen, getallen binnen gebied, geen dubbels, oplopende moeilijkheid`, () => {
    let totaal = 0;
    for (const gebied of GEBIEDEN) for (const opties of varianten(gen)) for (const seed of SEEDS) {
      const { oefeningen, waarschuwing } = gen.genereer({ seed, aantal: 12, gebied, opties });
      totaal += oefeningen.length;
      assert.ok(oefeningen.length <= 12);
      if (oefeningen.length < 12) assert.ok(waarschuwing, `${gen.id} gebied ${gebied}: ${oefeningen.length} oefeningen zonder waarschuwing`);
      const gezien = new Set(), sleutels = new Set();
      let vorige = null;
      for (const o of oefeningen) {
        const ctx = `${gen.id} gebied ${gebied} seed ${seed}: ${o.tekst}`;
        assert.ok(o.tekst !== undefined && o.antwoord && o.volledig && !/undefined|NaN/.test(o.tekst + o.volledig), ctx);
        assert.ok(!o.volledig.includes('____'), ctx);
        assert.ok(o.getallen.length > 0);
        for (const g of o.getallen) assert.ok((gen.decimaal ? Number.isFinite(g) : Number.isInteger(g)) && g >= 0 && g <= gebied, `${ctx}: ${g} buiten gebied`);
        const id = o.tekst + (o.svg ? o.svg.markup : '');
        assert.ok(!gezien.has(id) && !sleutels.has(o.sleutel), `dubbel: ${ctx}`);
        gezien.add(id); sleutels.add(o.sleutel);
        if (vorige) assert.ok(vergelijkMoeilijkheid(vorige.moeilijkheid, o.moeilijkheid) <= 0, `niet oplopend: ${ctx}`);
        vorige = o;
        if (o.svg) assert.ok(o.svg.markup.startsWith('<svg') && o.svg.markup.endsWith('</svg>') && o.svg.breedte > 0 && o.svg.hoogte > 0);
        if (o.data && verifieer[o.data.type]) verifieer[o.data.type](o.data, o);
      }
    }
    assert.ok(totaal > 0, `${gen.id} maakte nooit een oefening`);
  });

  test(`${gen.id}: dezelfde seed geeft dezelfde oefeningen`, () => {
    for (const opties of varianten(gen)) {
      const p = { seed: 7, aantal: 10, gebied: 1000, opties };
      assert.deepEqual(gen.genereer(p), gen.genereer(p));
    }
  });
}

test('lengtematen omzetten: antwoorden kloppen', () => {
  const g = GENERATORS.find(x => x.id === 'lengtematen-omzetten');
  for (const gebied of GEBIEDEN) for (const eenheden of [['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']]) for (const seed of SEEDS) {
    for (const o of g.genereer({ seed, aantal: 12, gebied, opties: { eenheden } }).oefeningen) {
      const rechts = /^(\d+) (\w+) = ____ (\w+)$/.exec(o.tekst);
      if (rechts) {
        const [, v, a, b] = rechts;
        assert.equal(`${(+v * MATEN.lengte[a]) / MATEN.lengte[b]} ${b}`, o.antwoord);
        assert.equal(o.volledig, o.tekst.replace('____', o.antwoord.split(' ')[0]));
      } else {
        const [, a, w, b] = /^____ (\w+) = (\d+) (\w+)$/.exec(o.tekst);
        assert.equal(`${(+w * MATEN.lengte[b]) / MATEN.lengte[a]} ${a}`, o.antwoord);
        assert.equal(o.volledig, o.tekst.replace('____', o.antwoord.split(' ')[0]));
      }
    }
  }
});

test('optellen en aftrekken: de keuze zonder/met brug wordt gerespecteerd', () => {
  for (const soort of ['optellen', 'aftrekken']) {
    const g = GENERATORS.find(x => x.id === soort);
    const brug = soort === 'optellen' ? brugOptellen : brugAftrekken;
    for (const gebied of [20, 100, 1000, 10000]) for (const seed of SEEDS) {
      for (const [keuze, verwacht] of [['zonder', false], ['met', true]]) {
        for (const o of g.genereer({ seed, aantal: 10, gebied, opties: { brug: keuze } }).oefeningen) {
          const { a, b } = o.data;
          assert.equal(brug(a, b), verwacht, `${soort} ${keuze}: ${o.tekst}`);
          assert.equal(soort === 'optellen' ? a + b : a - b, Number(o.antwoord));
          if (soort === 'aftrekken') assert.ok(b < a);
        }
      }
    }
  }
  const o = GENERATORS.find(x => x.id === 'optellen').genereer({ seed: 1, aantal: 30, gebied: 10, opties: { brug: 'met' } });
  assert.equal(o.oefeningen.length, 0, 'tot 10 is er geen brug mogelijk');
});

test('optellen/aftrekken: brug wordt afgeleid uit de gekozen doelen, of ingesteld door de leerkracht', () => {
  const opt = GENERATORS.find(x => x.id === 'optellen');
  assert.equal(opt.opties(['2.2.GL1.19'], {}).brug, 'zonder');
  assert.equal(opt.opties(['2.2.GL1.21'], {}).brug, 'met');
  assert.equal(opt.opties(['2.2.GL1.19', '2.2.GL1.21'], {}).brug, 'beide');
  assert.equal(opt.opties(['2.2.GL1.19'], { brug: 'met' }).brug, 'met');
});

test('maaltafels: enkel gekozen tafels en producten binnen het gebied', () => {
  const g = GENERATORS.find(x => x.id === 'maaltafels');
  for (const gebied of [20, 100]) for (const seed of SEEDS) {
    for (const o of g.genereer({ seed, aantal: 10, gebied, opties: { bewerking: 'beide', tafels: [3, 4] } }).oefeningen) {
      const d = o.data;
      const tafel = d.type === 'maal' ? [d.x, d.y] : [d.t];
      assert.ok(tafel.some(t => t === 3 || t === 4), o.tekst);
    }
  }
  assert.deepEqual(g.opties([], { tafels: 'onzin' }).tafels, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(g.opties([], { tafels: '5, 2 ; 10' }).tafels, [2, 5, 10]);
  assert.equal(g.opties(['2.2.GL2.24'], {}).bewerking, 'delen');
});

test('plaatswaarde en grotere maal/deel: waarschuwing als het gebied te klein is', () => {
  assert.ok(GENERATORS.find(x => x.id === 'plaatswaarde').genereer({ seed: 1, aantal: 5, gebied: 10, opties: {} }).waarschuwing);
  assert.ok(GENERATORS.find(x => x.id === 'vermenigvuldigen-delen').genereer({ seed: 1, aantal: 5, gebied: 20, opties: {} }).waarschuwing);
});

test('bladen met alle generators: bladcode geeft exact hetzelfde blad terug', () => {
  const ids = GENERATORS.map(g => g.id);
  const opties = Object.fromEntries(GENERATORS.map(g => [g.id, g.opties ? g.opties(g.doelen, {}) : {}]));
  const blad = losOp(wiskunde, modelVoorVormen(wiskunde, ids, { seed: 12345, aantal: 8, gebied: 1000, opties }));
  const { model } = modelUitCode(wiskunde, blad.code);
  const terug = losOp(wiskunde, model);
  assert.deepEqual(terug.blokken, blad.blokken);
  assert.equal(terug.code, blad.code);
  assert.throws(() => modelUitCode(wiskunde, 'onzin'));
});

test('blokken zonder oefeningen blijven in het model, met een reden bij de waarschuwingen', () => {
  const blad = losOp(wiskunde, modelVoorVormen(wiskunde, ['vermenigvuldigen-delen', 'getallen-vergelijken'], { seed: 1, aantal: 5, gebied: 20 }));
  assert.equal(blad.blokken[0].oefeningen.length, 0);
  assert.ok(blad.waarschuwingen[0].startsWith(GENERATORS.find(x => x.id === 'vermenigvuldigen-delen').titel));
  assert.equal(blad.blokken[1].oefeningen.length, 5);
});

test('contexten: elk voorwerp heeft een geldig bereik en een correcte zin', () => {
  for (const [naam, thema] of Object.entries(THEMAS)) {
    assert.ok(thema.naam && thema.lengte.length >= 5, naam);
    for (const o of thema.lengte) {
      assert.ok(o.onderwerp.startsWith('een ') || o.onderwerp.startsWith('de ') || o.onderwerp.startsWith('het '), o.onderwerp);
      assert.ok(/^(de|het) /.test(o.bepaald), o.bepaald);
      assert.ok(['lang', 'hoog', 'breed'].includes(o.dim));
      assert.ok(o.cm[0] > 0 && o.cm[1] >= o.cm[0], o.onderwerp);
    }
  }
  assert.ok(NAMEN.length >= 8);
  for (const i of REFERENTIE_LENGTE) assert.ok(['mm', 'cm', 'dm', 'm', 'km'].includes(i.eenheid) && i.getal > 0 && THEMAS[i.thema], i.onderwerp);
});

test('lengtevragen: de zinnetjes passen bij het gekozen thema', () => {
  const g = GENERATORS.find(x => x.id === 'lengtematen-vraagstuk');
  const namen = THEMAS.dieren.lengte.map(o => o.onderwerp.replace(/^(een|de|het) /, ''));
  for (const seed of SEEDS) for (const o of g.genereer({ seed, aantal: 8, gebied: 1000, opties: { eenheden: ['m', 'dm', 'cm'], thema: 'dieren' } }).oefeningen) {
    assert.ok(namen.some(n => o.tekst.toLowerCase().includes(n)), o.tekst);
  }
});
