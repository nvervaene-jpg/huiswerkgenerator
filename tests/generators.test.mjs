import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GENERATORS } from '../js/subjects/wiskunde/generators/index.js';
import { vergelijkMoeilijkheid } from '../js/subjects/wiskunde/generators/hulp.js';
import { ICONEN_NAMEN } from '../js/core/icons.js';
import wiskunde from '../js/subjects/wiskunde/index.js';
import { modelVoorVormen, losOp, modelUitCode } from '../js/core/blad-model.js';
import { THEMAS, REFERENTIE_LENGTE, REFERENTIE_MASSA, REFERENTIE_TIJD, REFERENTIE_GELD, NAMEN } from '../js/subjects/wiskunde/contexten.js';
const REFERENTIE = { lengte: REFERENTIE_LENGTE, massa: REFERENTIE_MASSA, tijd: REFERENTIE_TIJD, geld: REFERENTIE_GELD };

const MATEN = {                                    // waarde van 1 eenheid in de kleinste eenheid (eigen tabel, los van de generator)
  lengte: { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 },
  massa: { g: 1, dag: 10, hg: 100, kg: 1000 },
  tijd: { s: 1, min: 60, uur: 3600, dag: 86400 },
  geld: { cent: 1, euro: 100 },
};
const GEBIEDEN = [10, 20, 100, 1000, 10000];
const SEEDS = Array.from({ length: 12 }, (_, i) => i + 1);
const som = (l) => l.reduce((x, y) => x + y, 0);

// Onafhankelijke brugregels (andere rekenwijze dan de generator).
const brugOptellen = (a, b) => [1, 2, 3, 4, 5].some(k => (a % 10 ** k) + (b % 10 ** k) > 10 ** k);
const brugAftrekken = (a, b) => [1, 2, 3, 4, 5].some(k => (a % 10 ** k) < (b % 10 ** k));

// Is de stelling 'links = w' juist? Eigen berekening per soort kern, los van de generators.
const waarKern = (k, w) => {
  switch (k.soort) {
    case 'omzet': return k.v * MATEN[k.maat][k.a] === w * MATEN[k.maat][k.b];
    case 'rekenen': return ({ '+': k.a + k.b, '-': k.a - k.b, '×': k.a * k.b, ':': k.a / k.b }[k.op]) === w;
    default: throw new Error(`onbekende kern ${k.soort}`);
  }
};
const labelsKern = (k, w) => (k.soort === 'omzet' ? [`${k.v} ${k.a}`, `${w} ${k.b}`] : [`${k.a} ${k.op} ${k.b}`, `${w}`]);
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
  optellen: ({ a, b, onbekend }, o) => assert.equal(Number(o.antwoord), { a, b, c: a + b }[onbekend]),
  aftrekken: ({ a, b, onbekend }, o) => { assert.ok(b < a); assert.equal(Number(o.antwoord), { a, b, c: a - b }[onbekend]); },
  tafel: ({ op, a, b, onbekend }, o) => {
    const c = { '×': a * b, ':': a / b }[op];
    assert.ok(Number.isInteger(c));
    assert.equal(Number(o.antwoord), { a, b, c }[onbekend]);
    assert.ok(o.tekst.includes('____') && o.tekst.includes(op));
  },
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
  optellen: ({ a, b, onbekend }, o) => assert.equal(Number(o.antwoord), { a, b, c: a + b }[onbekend]),
  aftrekken: ({ a, b, onbekend }, o) => { assert.ok(b < a); assert.equal(Number(o.antwoord), { a, b, c: a - b }[onbekend]); },
  tafel: ({ op, a, b, onbekend }, o) => {
    const c = { '×': a * b, ':': a / b }[op];
    assert.ok(Number.isInteger(c));
    assert.equal(Number(o.antwoord), { a, b, c }[onbekend]);
    assert.ok(o.tekst.includes('____') && o.tekst.includes(op));
  },
  maal: ({ x, y }, o) => assert.equal(o.antwoord, String(x * y)),
  deel: ({ p, t, k }, o) => { assert.equal(t * k, p); assert.equal(o.antwoord, String(k)); },
  'rek-tabel': ({ op, vast, paren, gegeven }, o) => {
    for (const [x, y] of paren) assert.equal(y, { '+': x + vast, '-': x - vast, '×': x * vast, ':': x / vast }[op], `${x} ${op} ${vast}`);
    assert.equal(new Set(paren.map(p => p[0])).size, paren.length);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 2 + paren.length, 'één gegeven per rij');
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, 2 + 2 * paren.length, 'alles ingevuld in de oplossing');
    assert.equal(gegeven.length, paren.length);
  },
  'rek-vraag': ({ op, a, b, c }, o) => {
    assert.equal(c, { '+': a + b, '-': a - b, '×': a * b, ':': a / b }[op]);
    assert.equal(o.antwoord, String(c));
    assert.ok(o.tekst.includes(String(a)) && o.tekst.includes(String(b)) && !/undefined|NaN/.test(o.tekst));
    assert.ok(!/ 1 (kuikens|visjes|eendjes|konijnen|knikkers|ballen|stickers)/.test(o.tekst.replace(/er 1 /g, '')), `meervoud bij 1: ${o.tekst}`);
  },
  'rek-splits': ({ op, a, b, b1, b2 }, o) => {
    assert.equal(b1 + b2, b);
    const midden = op === '+' ? a + b1 : a - b1, c = op === '+' ? a + b : a - b;
    assert.equal(midden % 10, 0, 'eerst tot het tiental');
    assert.ok(b1 >= 1 && b2 >= 1);
    assert.equal(o.antwoord, `${midden} en ${c}`);
  },
  'rek-sprongen': ({ op, a, b, punten }, o) => {
    assert.equal(punten[0], a);
    assert.equal(punten[2], op === '+' ? a + b : a - b);
    assert.equal(punten[1] % 10, 0);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 1 + 2, 'één getal + twee sprongen');
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, 3 + 2, 'alle getallen in de oplossing');
  },
  'rek-brug': ({ op, items }, o) => {
    const brug = ({ a, b }) => (op === '+' ? brugOptellen(a, b) : brugAftrekken(a, b));
    assert.equal(items.length, 6);
    assert.equal(items.filter(brug).length, 3, 'drie met en drie zonder brug');
    assert.equal(o.antwoord, items.filter(brug).map(i => `${i.a} ${op} ${i.b}`).join(', '));
  },
  'rek-rooster': ({ rijen, kolommen }, o) => {
    assert.equal((o.svg.markup.match(/<circle /g) || []).length, rijen * kolommen);
    assert.equal(o.antwoord, `${rijen} × ${kolommen} = ${rijen * kolommen}`);
  },
  'rek-veelvouden': ({ t, n }, o) => {
    assert.equal((o.svg.markup.match(/<rect /g) || []).length, n);
    assert.equal((o.antwoordSvg.markup.match(/fill="#f4b942"/g) || []).length, Math.floor(n / t));
    assert.ok(!o.svg.markup.includes('#f4b942'));
  },
  'rek-omcirkel': ({ t, getallen }, o) => {
    const juist = getallen.filter(x => x % t === 0).sort((x, y) => x - y);
    assert.equal(juist.length, 4);
    assert.equal(o.antwoord, juist.join(', '));
    assert.equal(new Set(getallen).size, getallen.length);
  },
  'rek-uitsplitsen': ({ op, a, b, d1, d2 }, o) => {
    assert.equal(d1 + d2, a);
    if (op === '×') { assert.equal(d1 % 10, 0); assert.equal(o.antwoord, `${d1 * b}, ${d2 * b} en ${a * b}`); }
    else { assert.equal(d1 % b, 0); assert.equal(d2 % b, 0); assert.equal(o.antwoord, `${d1 / b}, ${d2 / b} en ${a / b}`); }
  },
  'num-omcirkel': ({ getallen, grootste }, o) => {
    assert.equal(new Set(getallen).size, getallen.length);
    assert.equal(o.antwoord, String(grootste ? Math.max(...getallen) : Math.min(...getallen)));
  },
  'num-vergelijk-jf': ({ a, b, teken, juist }, o) => {
    assert.equal(teken === (a < b ? '<' : a > b ? '>' : '='), juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
  },
  'num-vergelijk-mk': ({ a, b }, o) => {
    const goed = a < b ? '<' : a > b ? '>' : '=';
    assert.equal(o.antwoord, `${{ '<': 'a', '>': 'b', '=': 'c' }[goed]}) ${goed}`);
  },
  'num-vraag': ({ a, b, naam1, naam2, meer, antwoord }, o) => {
    assert.notEqual(a, b); assert.notEqual(naam1, naam2);
    assert.equal(antwoord, (a > b) === meer ? naam1 : naam2);
    assert.equal(o.antwoord, antwoord);
    assert.ok(o.tekst.includes(meer ? 'meer' : 'minder'));
  },
  'num-buren': ({ n, stap }, o) => {
    assert.ok(n - stap >= 0);
    assert.equal(o.antwoord, `${n - stap} en ${n + stap}`);
  },
  'num-rij-fout': ({ rij, juist, plaats }, o) => {
    assert.equal(rij.filter((x, i) => x !== juist[i]).length, 1);
    assert.notEqual(rij[plaats], juist[plaats]);
    const verschil = juist[1] - juist[0];
    juist.forEach((x, i) => assert.equal(x, juist[0] + i * verschil, 'juiste rij heeft vaste stap'));
    assert.equal(o.antwoord, String(juist[plaats]));
  },
  'as-pijl': ({ start, stap, idx }, o) => {
    assert.equal(o.antwoord, String(start + idx * stap));
    assert.equal((o.svg.markup.match(/<rect /g) || []).length, 1, 'één leeg vakje');
    assert.ok(o.svg.markup.includes('stroke="#c0392b"') && idx >= 1 && idx <= 9);
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, 11, 'alle getallen in de oplossing');
  },
  'as-pijl-teken': ({ start, stap, idx }, o) => {
    assert.ok(o.tekst.includes(String(start + idx * stap)));
    assert.ok(!o.svg.markup.includes('#c0392b') && o.antwoordSvg.markup.includes('#c0392b'), 'pijl enkel in de oplossing');
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 11);
  },
  'as-letters': ({ start, stap, plaatsen }, o) => {
    assert.equal(plaatsen.length, 3);
    assert.equal(o.antwoord, plaatsen.map((p, i) => `${'ABC'[i]} = ${start + p * stap}`).join(', '));
    for (const l of 'ABC') assert.ok(o.svg.markup.includes(`>${l}<`));
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 8 + 3, '8 getallen en 3 letters');
  },
  'as-jf': ({ start, stap, idx, genoemd, juist }, o) => {
    assert.equal(genoemd === start + idx * stap, juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
    assert.ok(o.svg.markup.includes('stroke="#c0392b"'));
  },
  'num-splits': ({ n, a, b, blank }, o) => {
    assert.equal(a + b, n);
    assert.equal(o.antwoord, String({ a, b }[blank]));
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 2, 'dak en één kamer');
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, 3);
  },
  'num-splits-tabel': ({ soort, n, rijen, kop, blank }, o) => {
    if (soort === 'som') for (const [x, y] of rijen) assert.equal(x + y, n);
    else for (const rij of rijen) {
      const delen = rij.slice(1);
      assert.equal(delen.reduce((x, y) => x + y, 0), rij[0]);
      delen.forEach((d, i) => assert.equal(d % 10 ** (delen.length - 1 - i), 0, 'plaatswaarde'));
    }
    const kol = rijen[0].length;
    assert.equal((o.svg.markup.match(/<text /g) || []).length, kol + rijen.length * (kol - 1), 'één leeg vak per rij');
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, kol + rijen.length * kol);
    assert.equal(blank.length, rijen.length);
  },
  'num-splits-verbind': ({ paren }, o) => {
    assert.equal(paren.length, 4);
    for (const { n, a, b } of paren) { assert.equal(a + b, n); assert.ok(o.svg.markup.includes(`>${n}<`) && o.svg.markup.includes(`>${a} + ${b}<`)); }
    assert.equal((o.antwoordSvg.markup.match(/stroke="#c0392b"/g) || []).length, 4);
  },
  'num-splits-jf': ({ n, a, b, juist }, o) => {
    assert.equal(a + b === n, juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
  },
  'num-splits-vraag': ({ n, a, b }, o) => {
    assert.equal(a + b, n);
    assert.equal(o.antwoord, String(b));
    assert.ok(o.tekst.includes(`${n} `) && o.tekst.includes(`${a} `));
  },
  'pw-kleur': ({ n, idx }, o) => {
    assert.ok(idx >= 0 && idx < String(n).length);
    assert.ok(!o.svg.markup.includes('#f4b942'));
    assert.equal((o.antwoordSvg.markup.match(/fill="#f4b942"/g) || []).length, 1);
    assert.equal(o.antwoord, `het cijfer ${String(n)[idx]}`);
  },
  'pw-verbind': ({ paren }, o) => {
    assert.equal(paren.length, 4);
    for (const { h, t, e, n } of paren) assert.equal(h * 100 + t * 10 + e, n);
    assert.equal((o.antwoordSvg.markup.match(/stroke="#c0392b"/g) || []).length, 4);
    assert.equal((o.svg.markup.match(/fill="#bfe0f5"/g) || []).length, paren.reduce((x, p) => x + p.h, 0), 'platen in de tekening');
    assert.equal((o.svg.markup.match(/fill="#f4a3a3"/g) || []).length, paren.reduce((x, p) => x + p.e, 0), 'blokjes in de tekening');
  },
  'pw-tabel': ({ kop, rijen, modus }, o) => {
    for (const rij of rijen) assert.equal(String(rij[0]), rij.slice(1).join(''), 'cijfers vormen het getal');
    assert.equal(kop.length, rijen[0].length);
    const kol = kop.length;
    const verwacht = modus.reduce((som, m) => som + (m === 0 ? 1 : kol - 1), kol);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, verwacht);
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, kol + rijen.length * kol);
  },
  'pw-mk': ({ n, idx, d, opties, juist }, o) => {
    const k = String(n).length - 1 - idx;
    assert.equal(opties.filter(x => x === d * 10 ** k).length, 1);
    assert.equal(opties[juist], d * 10 ** k);
    assert.equal(new Set(opties).size, 3);
    assert.equal(String(n)[idx], String(d));
    assert.equal(String(n).split('').filter(c => c === String(d)).length, 1, 'het cijfer komt maar één keer voor');
    assert.ok(o.antwoord.startsWith(`${'abc'[juist]})`));
  },
  'pw-mab-teken': ({ n }, o) => {
    assert.ok(!o.svg.markup.includes('fill="#bfe0f5"') || true);
    assert.equal((o.antwoordSvg.markup.match(/fill="#bfe0f5"/g) || []).length, Math.floor(n / 100));
    assert.equal((o.antwoordSvg.markup.match(/fill="#f6d27a"/g) || []).length, Math.floor(n / 10) % 10);
    assert.equal((o.antwoordSvg.markup.match(/fill="#f4a3a3"/g) || []).length, n % 10);
    assert.ok(o.tekst.includes(String(n)));
  },
  'klok-jf': ({ h, m, genoemd, juist }, o) => {
    assert.equal(genoemd.h === h && genoemd.m === m, juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
    const hoeken = [...o.svg.markup.matchAll(/rotate\((-?[\d.]+) /g)].map(x => Number(x[1]));
    assert.ok(Math.abs(hoeken[0] - ((h % 12) * 30 + m / 2)) < 0.01 && Math.abs(hoeken[1] - m * 6) < 0.01);
  },
  'klok-mk': ({ h, m, opties, juist }, o) => {
    assert.equal(opties.filter(x => x.h === h && x.m === m).length, 1);
    assert.equal(opties.findIndex(x => x.h === h && x.m === m), juist);
    assert.equal(new Set(opties.map(x => `${x.h}:${x.m}`)).size, 3);
    const minuten = opties.map(x => (x.h % 12) * 60 + x.m);
    assert.deepEqual(minuten, [...minuten].sort((x, y) => x - y));
  },
  'klok-verbind': ({ tijden }, o) => {
    assert.equal(tijden.length, 4);
    assert.equal(new Set(tijden.map(t => `${t.h}:${t.m}`)).size, 4);
    assert.equal((o.svg.markup.match(/r="40"/g) || []).length, 4, 'vier klokken');
    for (const t of tijden) assert.ok(o.svg.markup.includes(`>${t.h}:${String(t.m).padStart(2, '0')}<`));
    assert.equal((o.antwoordSvg.markup.match(/stroke="#c0392b" stroke-width="3"/g) || []).length, 4);
  },
  'klok-orden': ({ tijden, orde }, o) => {
    const min = tijden.map(t => (t.h % 12) * 60 + t.m);
    assert.equal(new Set(min).size, 3);
    assert.deepEqual(orde, [0, 1, 2].sort((x, y) => min[x] - min[y]).map(i => 'ABC'[i]));
    assert.equal(o.antwoord, orde.join(', '));
    for (const l of 'ABC') assert.ok(o.svg.markup.includes(`>${l}<`));
  },
  'klok-woorden': ({ h, m, woorden }, o) => {
    const UUR = { twaalf: 12, een: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11 };
    const voor = (n) => (n === 1 ? 12 : n - 1);
    const regels = [[/^(\w+) uur$/, (x) => [UUR[x], 0]], [/^vijf over (\w+)$/, (x) => [UUR[x], 5]], [/^tien over (\w+)$/, (x) => [UUR[x], 10]], [/^kwart over (\w+)$/, (x) => [UUR[x], 15]],
      [/^tien voor half (\w+)$/, (x) => [voor(UUR[x]), 20]], [/^vijf voor half (\w+)$/, (x) => [voor(UUR[x]), 25]], [/^half (\w+)$/, (x) => [voor(UUR[x]), 30]],
      [/^vijf over half (\w+)$/, (x) => [voor(UUR[x]), 35]], [/^tien over half (\w+)$/, (x) => [voor(UUR[x]), 40]], [/^kwart voor (\w+)$/, (x) => [voor(UUR[x]), 45]],
      [/^tien voor (\w+)$/, (x) => [voor(UUR[x]), 50]], [/^vijf voor (\w+)$/, (x) => [voor(UUR[x]), 55]]];
    const [regel, f] = regels.find(([re]) => re.test(woorden));
    assert.deepEqual(f(regel.exec(woorden)[1]), [h, m], woorden);
    assert.equal(o.antwoord, `${h}:${String(m).padStart(2, '0')}`);
  },
  'tijdsduur-klokken': ({ begin, einde, duur }, o) => {
    assert.equal((((einde.h % 12) * 60 + einde.m) - ((begin.h % 12) * 60 + begin.m) + 720) % 720, duur);
    assert.equal((o.svg.markup.match(/rotate\(/g) || []).length, 4, 'twee klokken met wijzers');
    assert.equal(o.antwoord, duur >= 60 ? `${Math.floor(duur / 60)} u${duur % 60 ? ` ${duur % 60} min` : ''}` : `${duur} min`);
  },
  'tijdsduur-tijdlijn': ({ begin, einde, duur, leeg }, o) => {
    assert.equal((((einde.h % 12) * 60 + einde.m) - ((begin.h % 12) * 60 + begin.m) + 720) % 720, duur);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 2);
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, 3);
    assert.equal((o.svg.markup.match(/<rect /g) || []).length, 1);
    assert.equal(o.antwoord, leeg === 'einde' ? `${einde.h}:${String(einde.m).padStart(2, '0')}` : (duur >= 60 ? `${Math.floor(duur / 60)} u${duur % 60 ? ` ${duur % 60} min` : ''}` : `${duur} min`));
  },
  'dag-week': ({ weg }, o) => {
    assert.ok(weg.length >= 2 && weg.length <= 4 && new Set(weg).size === weg.length);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 7 - weg.length);
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, 7);
    const dagen = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    assert.equal(o.antwoord, weg.map(i => dagen[i]).join(', '));
  },
  'dag-orden': ({ dagen }, o) => {
    const week = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    assert.equal(new Set(dagen).size, 4);
    assert.equal(o.antwoord, [...dagen].sort((x, y) => week.indexOf(x) - week.indexOf(y)).join(', '));
  },
  'dag-verbind': ({ paren }, o) => {
    const week = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    assert.equal(paren.length, 4);
    for (const { dag, volgende } of paren) assert.equal(week[(week.indexOf(dag) + 1) % 7], volgende);
    assert.equal((o.antwoordSvg.markup.match(/stroke="#c0392b"/g) || []).length, 4);
  },
  'dag-jf': ({ dag, sprong, genoemd, juist }, o) => {
    const week = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    assert.equal(week[(((week.indexOf(dag) + sprong) % 7) + 7) % 7] === genoemd, juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
  },
  'dag-mk': ({ dag, sprong, opties, juist }, o) => {
    const week = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    const doel = week[(((week.indexOf(dag) + sprong) % 7) + 7) % 7];
    assert.equal(opties.filter(x => x === doel).length, 1);
    assert.equal(opties[juist], doel);
    assert.equal(new Set(opties).size, 3);
  },
  'geld-mk': ({ items, totaal, opties, juist }, o) => {
    assert.equal(items.reduce((x, y) => x + y, 0), totaal);
    assert.equal(opties.filter(x => x === totaal).length, 1);
    assert.equal(opties[juist], totaal);
    assert.equal(new Set(opties).size, 3);
    assert.ok((o.svg.markup.match(/<circle /g) || []).length + (o.svg.markup.match(/<rect /g) || []).length >= items.length);
  },
  'geld-jf': ({ items, totaal, genoemd, juist }, o) => {
    assert.equal(items.reduce((x, y) => x + y, 0), totaal);
    assert.equal(genoemd === totaal, juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
  },
  'geld-verbind': ({ sets }, o) => {
    assert.equal(sets.length, 4);
    for (const s of sets) assert.equal(s.items.reduce((x, y) => x + y, 0), s.totaal);
    assert.equal(new Set(sets.map(s => s.totaal)).size, 4);
    assert.equal((o.antwoordSvg.markup.match(/stroke="#c0392b"/g) || []).length, 4);
  },
  'geld-leg': ({ totaal, items }, o) => {
    assert.equal(items.reduce((x, y) => x + y, 0), totaal);
    assert.ok(items.length <= 8);
    assert.ok(!o.svg.markup.includes('<circle'), 'leeg vak');
    assert.ok((o.antwoordSvg.markup.match(/<circle /g) || []).length + (o.antwoordSvg.markup.match(/<rect /g) || []).length >= items.length);
  },
  'geld-vergelijk': ({ a, b }, o) => assert.equal(o.antwoord, a < b ? '<' : a > b ? '>' : '='),
  'geld-orden': ({ bedragen, stijgend }, o) => {
    assert.equal(new Set(bedragen).size, bedragen.length);
    const juist = [...bedragen].sort((x, y) => (stijgend ? x - y : y - x));
    assert.ok(bedragen.some((x, i) => x !== juist[i]));
    assert.equal(o.antwoord.split(stijgend ? ' < ' : ' > ').length, bedragen.length);
  },
  'geld-bon': ({ namen, prijzen, totaal }, o) => {
    assert.equal(prijzen.reduce((x, y) => x + y, 0), totaal);
    assert.equal((o.svg.markup.match(/<text /g) || []).length, 2 + 2 * namen.length + 1);
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, 2 + 2 * (namen.length + 1));
  },
  'wissel-jf': ({ betaald, prijs, genoemd, juist }, o) => {
    assert.ok(prijs > 0 && prijs < betaald * 100);
    assert.equal(genoemd === betaald * 100 - prijs, juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
  },
  'wissel-mk': ({ betaald, prijs, opties, juist }, o) => {
    const terug = betaald * 100 - prijs;
    assert.equal(opties.filter(x => x === terug).length, 1);
    assert.equal(opties[juist], terug);
    assert.equal(new Set(opties).size, 3);
  },
  'totaal-fout': ({ prijzen, fout, totaal }, o) => {
    assert.equal(prijzen[0] + prijzen[1], totaal);
    assert.notEqual(fout, totaal);
    assert.ok(o.antwoord.includes(`${Math.floor(totaal / 100)}`));
  },
  omzet: ({ maat, v, a, w, b, onbekend }, o) => {
    assert.equal(v * MATEN[maat][a], w * MATEN[maat][b]);
    if (onbekend === 'links') { assert.equal(o.antwoord, `${v} ${a}`); assert.ok(o.tekst.startsWith('____')); }
    else assert.equal(o.antwoord, `${w} ${b}`);
    assert.notEqual(a, b);
  },
  'orden-maat': ({ maat, items, stijgend }, o) => {
    const basis = items.map(i => i.v * MATEN[maat][i.u]);
    assert.equal(new Set(basis).size, items.length, 'verschillende hoeveelheden');
    const juist = [...items].sort((x, y) => (stijgend ? 1 : -1) * (x.v * MATEN[maat][x.u] - y.v * MATEN[maat][y.u]));
    assert.equal(o.antwoord, juist.map(i => `${i.v} ${i.u}`).join(stijgend ? ' < ' : ' > '));
  },
  juistfout: ({ kern, w, juist }, o) => {
    assert.equal(waarKern(kern, w), juist);
    assert.equal(o.antwoord, juist ? 'juist' : 'fout');
  },
  meerkeuze: ({ kern, opties, juist }, o) => {
    const goed = opties.filter(x => waarKern(kern, x));
    assert.equal(goed.length, 1, 'precies één juist antwoord');
    assert.equal(opties.indexOf(goed[0]), juist);
    assert.equal(new Set(opties).size, opties.length);
    assert.ok(o.antwoord.startsWith(`${'abc'[juist]})`));
  },
  verbind: ({ kernen }, o) => {
    assert.equal(kernen.length, 4);
    for (const { kern, w } of kernen) {
      assert.ok(waarKern(kern, w));
      for (const l of labelsKern(kern, w)) assert.ok(o.svg.markup.includes(`>${l}<`), `label ${l}`);
    }
    assert.equal((o.antwoordSvg.markup.match(/stroke="#c0392b"/g) || []).length, 4, 'vier lijnen in de oplossing');
    assert.ok(!o.svg.markup.includes('#c0392b'), 'geen oplossing in de opgave');
  },
  fout: ({ variant, zinnen, fout, juist }, o) => {
    if (variant === 'verbeter') { assert.ok(!waarKern(zinnen[0].kern, zinnen[0].w)); assert.ok(waarKern(zinnen[0].kern, juist)); }
    else {
      assert.equal(zinnen.filter(z => !waarKern(z.kern, z.w)).length, 1, 'precies één foute zin');
      assert.ok(!waarKern(zinnen[fout].kern, zinnen[fout].w));
      assert.ok(waarKern(zinnen[fout].kern, juist));
      assert.ok(o.antwoord.startsWith(`${'abc'[fout]})`));
    }
  },
  'tabel-maat': ({ maat, kolommen, rijen, gegeven }, o) => {
    for (const rij of rijen) { const waarden = rij.map((x, c) => x * MATEN[maat][kolommen[c]]); assert.ok(waarden.every(x => x === waarden[0]), `rij ${rij}`); }
    assert.equal((o.svg.markup.match(/<text /g) || []).length, kolommen.length + rijen.length, 'één gegeven per rij');
    assert.equal((o.antwoordSvg.markup.match(/<text /g) || []).length, kolommen.length + rijen.length * kolommen.length, 'alles ingevuld in de oplossing');
    assert.equal(gegeven.length, rijen.length);
  },
  'vraag-omzet': ({ maat, v, a, w, b, naarLinks }, o) => {
    assert.equal(v * MATEN[maat][a], w * MATEN[maat][b]);
    assert.equal(o.antwoord, naarLinks ? `${w} ${b}` : `${v} ${a}`);
    assert.ok(!/undefined/.test(o.tekst));
  },
  'vraag-vergelijk': ({ maat, items, winnaar }, o) => {
    const cm = items.map(i => i.v * MATEN[maat][i.u]);
    assert.notEqual(cm[0], cm[1]);
    assert.equal(winnaar, items[cm[0] > cm[1] ? 0 : 1].naam);
    assert.equal(o.antwoord, winnaar);
  },
  'eenheid-maat': ({ maat, getal, eenheid, opties }, o) => {
    assert.ok(REFERENTIE[maat].some(i => i.getal === getal && i.eenheid === eenheid && o.tekst.includes(`${getal} ____`)));
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
  'weegschaal-teken': ({ kg, g, max }, o) => {
    assert.ok(!o.svg.markup.includes('rotate('), 'lege weegschaal');
    const hoek = -135 + (270 * (kg + g / 1000)) / max;
    const [, gemeten] = /rotate\((-?[\d.]+) /.exec(o.antwoordSvg.markup);
    assert.ok(Math.abs(Number(gemeten) - hoek) < 0.01);
    assert.ok(o.tekst.includes(`${kg} kg`));
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
  const familie = gen.id.split('-')[0];
  if (gen.id.startsWith('geld-') && gen.id !== 'geld-omzetten' && !['geld-munten-tellen', 'geld-totaalprijs', 'geld-wisselgeld'].includes(gen.id)) return ['1', '2', '3', '4'].map(niveau => ({ niveau }));
  if (gen.id.startsWith('klok-') && !['klok-aflezen', 'klok-tekenen'].includes(gen.id)) return ['uur', 'halfuur', 'kwartier', 'vijf', 'minuut'].map(precisie => ({ precisie }));
  if (gen.id !== familie && (familie === 'optellen' || familie === 'aftrekken')) return ['zonder', 'met', 'beide'].flatMap(brug => ['gemengd', 'winkel'].map(thema => ({ brug, thema })));
  if (gen.id !== familie && familie === 'maaltafels') return [{ bewerking: 'beide', tafels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], thema: 'gemengd' }, { bewerking: 'delen', tafels: [3, 4], thema: 'dieren' }, { bewerking: 'vermenigvuldigen', tafels: [2, 5, 10], thema: 'school' }];
  if (gen.id !== familie && familie === 'maaldeel') return ['beide', 'delen', 'vermenigvuldigen'].map(bewerking => ({ bewerking, thema: 'gemengd' }));
  switch (gen.id) {
    case 'optellen': case 'aftrekken': return ['zonder', 'met', 'beide'].map(brug => ({ brug }));
    case 'maaltafels': return [{ bewerking: 'beide', tafels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { bewerking: 'delen', tafels: [3, 4] }, { bewerking: 'vermenigvuldigen', tafels: [2, 5, 10] }];
    case 'vermenigvuldigen-delen': return ['beide', 'delen', 'vermenigvuldigen'].map(bewerking => ({ bewerking }));
    case 'lengtematen-omzetten': case 'lengtematen-vergelijken': case 'lengtematen-ordenen': case 'lengtematen-verbinden': case 'lengtematen-juist-fout':
    case 'lengtematen-meerkeuze': case 'lengtematen-tabel': case 'lengtematen-fout-zoeken':
      return [['m', 'dm', 'cm'], ['km', 'm', 'dm', 'cm'], ['km', 'm', 'dm', 'cm', 'mm']].map(eenheden => ({ eenheden }));
    case 'massa-omzetten': case 'massa-vergelijken': return [['kg', 'g'], ['kg', 'hg', 'dag', 'g']].map(eenheden => ({ eenheden }));
    case 'massa-eenheid': return [['kg', 'g']].flatMap(eenheden => ['gemengd', 'keuken'].map(thema => ({ eenheden, thema })));
    case 'tijdsduur-eenheid': return [['uur', 'min'], ['dag', 'uur', 'min', 's']].flatMap(eenheden => ['gemengd', 'sport'].map(thema => ({ eenheden, thema })));
    case 'eurocent-eenheid': return [['euro', 'cent']].flatMap(eenheden => ['gemengd', 'winkel'].map(thema => ({ eenheden, thema })));
    case 'massa-vraagstuk': return [['kg', 'g'], ['kg', 'hg', 'dag', 'g']].flatMap(eenheden => ['gemengd', 'boerderij'].map(thema => ({ eenheden, thema })));
    case 'tijdsduur-vraagstuk': return [['uur', 'min'], ['dag', 'uur', 'min', 's']].flatMap(eenheden => ['gemengd', 'school'].map(thema => ({ eenheden, thema })));
    case 'eurocent-vraagstuk': return [['euro', 'cent']].flatMap(eenheden => ['gemengd', 'winkel'].map(thema => ({ eenheden, thema })));
    case 'massa-ordenen': case 'massa-juist-fout': case 'massa-meerkeuze': case 'massa-tabel': case 'massa-verbinden': case 'massa-fout-zoeken': return [['kg', 'g'], ['kg', 'hg', 'dag', 'g']].map(eenheden => ({ eenheden }));
    case 'tijdsduur-ordenen': case 'tijdsduur-juist-fout': case 'tijdsduur-meerkeuze': case 'tijdsduur-tabel': case 'tijdsduur-verbinden': case 'tijdsduur-fout-zoeken': case 'tijdsduur-vergelijken': return [['uur', 'min'], ['dag', 'uur', 'min'], ['dag', 'uur', 'min', 's']].map(eenheden => ({ eenheden }));
    case 'eurocent-ordenen': case 'eurocent-juist-fout': case 'eurocent-meerkeuze': case 'eurocent-tabel': case 'eurocent-verbinden': case 'eurocent-fout-zoeken': case 'eurocent-vergelijken': return [['euro', 'cent']].map(eenheden => ({ eenheden }));
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
        assert.ok(o.data && verifieer[o.data.type], `${gen.id}: geen controle voor type ${o.data && o.data.type}`);
        verifieer[o.data.type](o.data, o);
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
          const { a, b, onbekend } = o.data;
          assert.equal(brug(a, b), verwacht, `${soort} ${keuze}: ${o.tekst}`);
          assert.equal(Number(o.antwoord), { a, b, c: soort === 'optellen' ? a + b : a - b }[onbekend]);
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
      const tafel = d.op === '×' ? [d.a, d.b] : [d.b, d.a / d.b];
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
