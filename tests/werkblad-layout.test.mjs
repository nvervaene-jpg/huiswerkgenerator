// Overzichtelijke werkbladen: een omcirkel-oefening toont enkel keuzes (geen invullijn), een gedeelde vraag staat in de opdrachtzin,
// en het aantal kolommen volgt uit de lengte van de oefeningen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { zetDoelen } from '../js/core/doelregister.js';
import wiskunde from '../js/subjects/wiskunde/index.js';
import taal from '../js/subjects/taal/index.js';
import { modelVoorVormen, losOp } from '../js/core/blad-model.js';
import { isKeuzeOpdracht, splitsKeuze, netBlok, kolommenVoor, letterVan } from '../js/core/blad-netjes.js';

const NBSP = ' ';
const VAKKEN = [[wiskunde, 'wiskunde/doelen-wiskunde-opstap'], [taal, 'taal/doelen-taal-opstap']];

test('splitsKeuze herkent letters, "of", omcirkel-lijsten en juist/fout', () => {
  assert.deepEqual(splitsKeuze(`5 + 2 = ?\na) 5${NBSP.repeat(5)}b) 7`), { vraag: '5 + 2 = ?', opties: ['a) 5', 'b) 7'] });
  assert.deepEqual(splitsKeuze(`6 + 22 = ?${NBSP.repeat(4)}a) 18${NBSP.repeat(5)}b) 27${NBSP.repeat(5)}c) 28`), { vraag: '6 + 22 = ?', opties: ['a) 18', 'b) 27', 'c) 28'] });
  assert.deepEqual(splitsKeuze(`één kus, twee${NBSP.repeat(3)}kussen${NBSP.repeat(6)}of${NBSP.repeat(6)}kusen`), { vraag: 'één kus, twee', opties: ['kussen', 'kusen'] });
  assert.deepEqual(splitsKeuze(`Een muis is ongeveer 8 ____ lang.${NBSP.repeat(4)}Omcirkel:${NBSP.repeat(3)}m${NBSP.repeat(5)}cm`), { vraag: 'Een muis is ongeveer 8 ____ lang.', opties: ['m', 'cm'] });
  assert.deepEqual(splitsKeuze(`7 + 5 = 13${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`), { vraag: '7 + 5 = 13', opties: ['juist', 'fout'] });
  assert.equal(splitsKeuze('Gewoon een zin zonder keuzes.'), null);
});

test('netBlok: een vraag die in alle oefeningen staat, gaat naar de opdrachtzin, en "Kijk goed." valt weg', () => {
  const lijst = [1, 2, 3].map(n => ({ tekst: `Welk teken past? ${n} ____ ${n + 1}`, antwoord: '<' }));
  const net = netBlok('Kijk goed. Vul het juiste teken in.', lijst);
  assert.ok(net.opdracht.startsWith('Welk teken past?') && !net.opdracht.includes('Kijk goed'));
  assert.deepEqual(net.oefeningen.map(o => o.tekst), ['1 ____ 2', '2 ____ 3', '3 ____ 4']);
  const verschillend = [{ tekst: 'Rond 135 af: ____' }, { tekst: 'Rond 24 af: ____' }, { tekst: 'Rond 991 af: ____' }];
  assert.deepEqual(netBlok('Rond af.', verschillend).oefeningen.map(o => o.tekst), verschillend.map(o => o.tekst), 'cijfers of andere woorden: niets verplaatsen');
});

test('netBlok: een omcirkel-oefening krijgt vakjes en geen invullijn of "(x of y)" in de zin', () => {
  const net = netBlok('Kies het juiste antwoord. Omcirkel.', [{ tekst: `Lotte speelt om 9 uur. Dat is in de ____. (voormiddag of namiddag)\na) namiddag${NBSP.repeat(5)}b) voormiddag`, antwoord: 'b) voormiddag' }]);
  const o = net.oefeningen[0];
  assert.deepEqual(o.opties, ['a) namiddag', 'b) voormiddag']);
  assert.equal(o.juist, 1);
  assert.ok(!/_{3,}/.test(o.tekst) && !/ of /.test(o.keuzeVraag));
});

test('kolommen: korte sommen in drie kolommen, middellange in twee, lange of met een brede tekening in één', () => {
  const kort = ['25 m = ?', '3 dm = ?', '7 cm = ?'].map(tekst => ({ tekst }));
  assert.equal(kolommenVoor(kort, 16), 3);
  assert.equal(kolommenVoor(['Hoeveel cm is 62 dm? ?', 'Hoeveel dm is 17 m? ?'].map(tekst => ({ tekst })), 16), 2);
  assert.equal(kolommenVoor([{ tekst: 'Lotte heeft 5 appels en krijgt er nog 4 bij. Hoeveel appels heeft ze nu? ____' }], 16), 1);
  assert.equal(kolommenVoor([{ tekst: '3 + 4', svg: { breedte: 640 } }], 16), 1);
  assert.equal(kolommenVoor([{ tekst: 'Schrijf je naam.\n________________________________' }], 16), 1);
  assert.ok(kolommenVoor(kort, 18) <= kolommenVoor(kort, 14), 'grotere letters laten minder kolommen toe');
  assert.deepEqual([0, 1, 2, 25].map(letterVan), ['a', 'b', 'c', 'z']);
});

for (const [vak, url] of VAKKEN) {
  test(`${vak.id}: geen enkele omcirkel-oefening heeft een invullijn of keuzes in de zin; elke heeft vakjes om te omcirkelen`, async () => {
    zetDoelen(JSON.parse(await readFile(new URL(`../data/${url}.json`, import.meta.url), 'utf8')).doelen);
    let getest = 0;
    for (const g of vak.generators) {
      if (g.open || !isKeuzeOpdracht(g.opdracht || '')) continue;
      const code = g.doelen[0];
      const blad = losOp(vak, modelVoorVormen(vak, [g.id], { seed: 4, aantal: 6, gebied: 1000, opties: { [g.id]: g.opties ? g.opties([code], {}, code) : {} } }));
      for (const b of blad.blokken) for (const o of b.oefeningen) {
        const metTekening = o.svg && !/_{3,}/.test(o.tekst || '');         // omcirkel het plaatje: de tekening is de keuze
        assert.ok(o.opties || metTekening, `${g.id}: geen keuzevakjes bij "${o.tekst}"`);
        if (o.opties) {
          assert.ok(o.opties.length >= 2);
          assert.ok(!/_{3,}/.test(o.tekst), `${g.id}: invullijn bij keuzes: ${o.tekst}`);
          assert.ok(!/\(\S+ of \S+\)/.test(o.keuzeVraag || ''), `${g.id}: de keuzes staan ook in de zin: ${o.keuzeVraag}`);
        }
      }
      getest++;
    }
    assert.ok(getest > 50, `${getest} omcirkel-generators getest`);
  });

  test(`${vak.id}: een invul-vorm vraagt niet om te kiezen`, () => {
    for (const g of vak.generators) if (!g.open && /-invullen$/.test(g.id)) assert.ok(!/^Kies /.test(g.opdracht || ''), `${g.id}: "${g.opdracht}"`);
  });
}

test('netBlok: een slotvraag die in alle oefeningen hetzelfde is, gaat naar de opdrachtzin', () => {
  const lijst = [['6', '3'], ['4', '9'], ['7', '2']].map(([a, b], i) => ({ tekst: `Er zitten ${a} kinderen op de bus. Er stappen ${b} kinderen ${i % 2 ? 'op' : 'uit'}. Is dit een situatie van verandering of vergelijking? ____` }));
  const net = netBlok('Schrijf het antwoord op de lijn.', lijst);
  assert.ok(net.opdracht.endsWith('Is dit een situatie van verandering of vergelijking?'));
  assert.ok(net.oefeningen.every(o => o.tekst.endsWith('____') && !o.tekst.includes('situatie')), net.oefeningen[0].tekst);
  assert.equal(net.oefeningen[0].tekst, 'Er zitten 6 kinderen op de bus. Er stappen 3 kinderen uit. ____');
});

test('antwoordsleutel: het antwoord vervangt de hele invulplaats, ook een lange', async () => {
  const { voorbeeldDelen } = await import('../js/core/blad-model.js');
  const delen = voorbeeldDelen({ tekst: 'één appel   →   twee __________', antwoord: 'appels' });
  assert.equal(delen.map(d => d.t).join(''), 'één appel   →   twee appels');
});
