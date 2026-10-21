// Tests voor de automatisch gekoppelde wiskundefamilies (zie js/subjects/wiskunde/classificatie.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { zetDoelen } from '../js/core/doelregister.js';
import { FAMILIES } from '../js/subjects/wiskunde/classificatie.js';
import { AUTO_DOELEN } from '../js/subjects/wiskunde/auto-doelen.js';
import { ECHTE_GENERATORS } from '../js/subjects/wiskunde/generators/index.js';
import { effectiefAantal } from '../js/core/blad-model.js';

const DOELEN = JSON.parse(await readFile(new URL('../data/wiskunde/doelen-wiskunde-opstap.json', import.meta.url), 'utf8')).doelen;
zetDoelen(DOELEN);
const SEEDS = [1, 2, 3, 4, 5, 6];

test('auto-doelen.js komt overeen met de classificatie (draai node scripts/bouw-alles.mjs als dit faalt)', () => {
  for (const f of FAMILIES) assert.deepEqual(AUTO_DOELEN[f.id], DOELEN.filter(d => f.parameters(d)).map(d => d.code).sort(), f.id);
  assert.deepEqual(Object.keys(AUTO_DOELEN).sort(), FAMILIES.map(f => f.id).sort());
});

/* ---- onafhankelijke controle per familie: elk antwoord wordt opnieuw uitgerekend uit de gegevens van de opgave */
const ok = {
  tel: (d, o) => {
    if (d.tel === 'buur') { const e = { na: d.n + 1, voor: d.n - 1, meer: d.n + 1, minder: d.n - 1 }[d.soort]; return d.antwoord == e && e >= 0; }
    const r = d.reeks, stap = Math.abs(r[1] - r[0]); const toon = (x) => (d.dec ? hon2(x) : spatie(x));
    for (let i = 1; i < r.length; i++) if (r[i] - r[i - 1] !== (d.terug ? -stap : stap)) return false;
    return stap > 0 && d.gat >= 1 && d.gat <= r.length - 2 && d.antwoord === toon(r[d.gat]) && r.every(x => x >= 0 && x % stap === 0 || d.dec);
  },
  afr: (d) => d.antw === afrondTweede(d.n, d.eenheid) && d.n % d.eenheid !== 0 && d.antwoord === spatie(d.antw) && d.vraag.includes(spatie(d.n)),
  dlb: (d) => (d.dlb === 'ja' ? d.antwoord === (d.n % d.d === 0 ? 'ja' : 'nee') && gedeeldDoor(d.n, d.d) === (d.antwoord === 'ja') : d.antwoord == d.n - Math.floor(d.n / d.d) * d.d && d.rest === d.n % d.d && d.rest > 0),
  vlv: (d) => {
    switch (d.vlv) {
      case 'deler': return d.antwoord === (gedeeldDoor(d.n, d.d) ? 'ja' : 'nee');
      case 'veelvoud': return d.antwoord == d.a * d.k;
      case 'veelvoud-ja': return d.antwoord === (gedeeldDoor(d.n, d.a) ? 'ja' : 'nee');
      case 'ggd': { let g = 1; for (let x = 1; x <= Math.min(d.a, d.b); x++) if (d.a % x === 0 && d.b % x === 0) g = x; return d.antwoord == g && g > 1; }
      case 'kgv': { let m = Math.max(d.a, d.b); while (m % d.a || m % d.b) m++; return d.antwoord == m; }
      case 'priem': return d.antwoord === (priemTest(d.n) ? 'ja' : 'nee');
      case 'priemfactoren': { const f = d.antwoord.split(' × ').map(Number); return f.reduce((a, b) => a * b, 1) === d.n && f.every(priemTest) && f.every((x, i) => i === 0 || x >= f[i - 1]) && !priemTest(d.n); }
      default: return false;
    }
  },
  rng: (d) => {
    const eind = (w) => (w.endsWith('ste') ? 'ste' : 'de');
    const verwacht = RANG_TABEL[d.n] ?? (d.n < 20 ? woordTweede(d.n) + 'de' : woordTweede(d.n) + 'ste');
    return d.woord === verwacht && (d.rng === 'woord' ? d.antwoord === verwacht : d.antwoord === `${d.n}${eind(verwacht)}`) && (d.n < 20 ? !verwacht.endsWith('ste') || [1, 8].includes(d.n) : verwacht.endsWith('ste'));
  },
  wrd: (d) => {
    if (d.wrd === 'woord') return d.antwoord === woordTweede(d.n) && (WOORD_TABEL[d.n] === undefined || WOORD_TABEL[d.n] === d.antwoord);
    if (d.wrd === 'cijfer') return d.antwoord === String(d.n) && d.vraag.startsWith(woordTweede(d.n));
    if (d.wrd === 'duizend') return d.n === d.a * 1000 + d.c && d.antwoord === spatie(d.n);
    return d.n === d.a * 1e6 + d.b * 1e3 + d.c && d.antwoord === spatie(d.n);
  },
  pws: (d) => {
    switch (d.pws) {
      case 'waarde': { const s = String(d.n), i = s.indexOf(String(d.cijfer)); return s.lastIndexOf(String(d.cijfer)) === i && d.waarde === d.cijfer * 10 ** (s.length - 1 - i); }
      case 'splits': { const delen = d.vraag.split(' = ')[1]; return somDelen(delen.replace('____', `${d.antwoord}`)) === d.n && delen.includes(`____ ${d.plaats}`); }
      case 'samenstel': return somDelen(d.vraag) === d.n && d.antwoord === spatie(d.n);
      case 'herstruct': { const delen = d.vraag.split(' = ')[1]; return somDelen(delen.replace('____', `${d.antwoord}`)) === d.n && Number(d.antwoord) >= 10; }
      default: return false;
    }
  },
  adg: (d) => {
    const heeftGetal = d.zin.replace(/ /g, '').includes(String(d.getal)) || d.zin.includes(spatie(d.getal));
    const rangorde = /\d+(de|ste)\b/.test(d.zin), code = /(nummer|lokaal|kleedkamer|postcode|pincode|kluisje)/.test(d.zin);
    return heeftGetal && d.antwoord === (rangorde ? 'rangorde' : code ? 'code' : 'aantal') && d.adg === d.antwoord;
  },
  taf: (d) => (d.taf === 'maal' ? d.prod === d.a * d.b && d.antwoord == d.prod : d.prod === d.a * d.b && d.antwoord == d.b),
  dsp: (d) => d.Q * d.b + d.rest === d.a && d.rest === d.a % d.b && d.rest < d.b && d.antwoord == d.Q,
  bkd: (d) => {
    switch (d.bkd) {
      case 'halfdubbel': return d.antwoord == (d.soort === 'helft' ? d.n / 2 : d.soort === 'kwart' ? d.n / 4 : d.n * 2) && Number.isInteger(Number(d.antwoord));
      case 'breuk-van': return d.n % d.b === 0 && d.antwoord == (d.n / d.b) * d.a;
      case 'procent-van': return (d.pct * d.n) % 100 === 0 && d.antwoord == (d.pct * d.n) / 100;
      case 'geheel': return d.deel * d.b === d.a * d.G && d.antwoord == d.G;
      case 'geheel-procent': return d.deel * 100 === d.pct * d.G && d.antwoord == d.G;
      case 'benoem': return d.soort === 'procent' ? d.antwoord * d.G === d.deel * 100 : eenvoudig(d.antwoord) && gelijkB(alsBreuk(d.antwoord), { n: d.deel, d: d.G });
      default: return false;
    }
  },
  omz: (d) => {
    switch (d.omz) {
      case 'gelijkwaardig': return d.antwoord * d.b === d.a * (d.b * d.k);
      case 'vereenvoudig': return d.antwoord == d.a && gcdT(d.a, d.b) === 1;
      case 'gelijknamig': return d.antwoord * d.b1 === d.a1 * d.L && d.L % d.b1 === 0 && d.L % d.b2 === 0;
      case 'dec-breuk': return d.richting === 'breuk-naar-dec' ? gelijkB(parseWaarde(d.antwoord), { n: d.a, d: d.b }) : eenvoudig(d.antwoord) && gelijkB(alsBreuk(d.antwoord), { n: d.h, d: 100 });
      case 'breuk-procent': return d.antwoord * d.b === d.a * 100;
      case 'procent-dec': return d.richting === 'procent-naar-dec' ? gelijkB(parseWaarde(d.antwoord), { n: d.h, d: 100 }) : d.antwoord == d.h;
      case 'paraat': return d.richting === 'breuk-naar-procent' ? d.antwoord * d.b === d.a * 100 : eenvoudig(d.antwoord) && gelijkB(alsBreuk(d.antwoord), { n: d.pct, d: 100 });
      default: return false;
    }
  },
  bvg: (d) => {
    const teken = (x, y) => Math.sign(x.n * y.d - y.n * x.d);
    if (d.bvg === 'vergelijk') return d.antwoord === (teken(d.x, d.y) < 0 ? '<' : teken(d.x, d.y) > 0 ? '>' : '=');
    const lijst = d.antwoord.split(' < ').map(parseWaarde);
    return lijst.length === 3 && lijst.every((x, i) => i === 0 || teken(lijst[i - 1], x) < 0) && d.waarden.length === 3 && d.waarden.every(w => lijst.some(x => gelijkB(x, w)));
  },
  dcm: (d) => {
    if (d.dcm === 'plaats') { const [, f] = d.tekst.split(','); const i = f.indexOf(String(d.cijfer)); return f.lastIndexOf(String(d.cijfer)) === i && d.plaats === ['tienden', 'honderdsten', 'duizendsten'][i]; }
    if (d.dcm === 'dec-splits') { const [, f] = d.tekst.split(','); const idx = ['t', 'h', 'd'].indexOf(d.plaats); return idx >= 0 && d.cijfer === Number(f[idx]) && d.antwoord === String(d.cijfer); }
    if (d.dcm === 'dec-samenstel') return d.antwoord === d.tekst && d.tekst === `${d.E},${d.ds.join('')}`;
    const rest = d.duizendsten % (10 ** (3 - d.m)), omlaag = d.duizendsten - rest, hoog = rest * 2 >= 10 ** (3 - d.m) ? omlaag + 10 ** (3 - d.m) : omlaag;
    return d.afgerond === hoog && d.m >= 0 && d.m <= 2;
  },
  bkb: (d) => {
    const bew = d.bkb, som = (x, y) => ({ n: x.n * y.d + y.n * x.d, d: x.d * y.d }), min = (x, y) => ({ n: x.n * y.d - y.n * x.d, d: x.d * y.d });
    let x, y, res;
    if (bew === 'gl+' || bew === 'gl-') { x = { n: d.x, d: d.d }; y = { n: d.y, d: d.d }; res = bew === 'gl+' ? som(x, y) : min(x, y); }
    else { x = { n: d.a, d: d.d1 }; y = { n: d.b, d: d.d2 }; res = { 'ong+': som(x, y), 'ong-': min(x, y), maal: { n: x.n * y.n, d: x.d * y.d }, deel: { n: x.n * y.d, d: x.d * y.n } }[bew]; }
    return res.n > 0 && gelijkB(alsBreuk(d.antwoord), res) && eenvoudig(d.antwoord);
  },
  dcb: (d) => {
    const s = 10 ** d.nd;
    switch (d.dcb) {
      case 'dec+': return d.antw === d.a + d.b && d.antwoord === kommaGetal(d.antw, d.nd);
      case 'dec-': return d.antw === d.a - d.b && d.antw > 0 && d.antwoord === kommaGetal(d.antw, d.nd);
      case 'dec×': return d.antw === d.a * d.n && d.antwoord === kommaGetal(d.antw, d.nd);
      case 'dec:': return d.antw * d.n === d.a && d.antwoord === kommaGetal(d.antw, d.nd) && s > 0;
      case 'dec×dec': return d.antwoord === (d.x * d.y % 100 === 0 ? String(d.x * d.y / 100) : kommaTekst(d.x * d.y));
      case 'dec:dec': return d.z === d.x * d.q && d.antwoord === String(d.q);
      default: return false;
    }
  },
  tnv: (d) => {
    const nummer = (str) => Number(str.replace(/ /g, '').replace(',', '.'));
    switch (d.tnv) {
      case 'maal': return d.antw === d.n * d.f && nummer(d.antwoord) === d.antw;
      case 'deel': return d.n === d.antw * d.f && nummer(d.antwoord) === d.antw;
      case 'maal-dec': return Math.abs(nummer(d.antwoord) - (d.n * d.t) / 10 ** d.k) < 1e-9;
      case 'deel-dec': return Number.isInteger(d.antw) && Math.abs(d.antw - (d.n * 10 ** d.k) / d.t) < 1e-9 && nummer(d.antwoord) === d.antw;
      default: return false;
    }
  },
  cmp: (d) => {
    const A = Number(d.antwoord);
    switch (d.cmp) {
      case 'keer+': return d.a * d.b === d.a * (d.b - 1) + A;
      case 'keer-': return d.a * d.b === d.a * (d.b + 1) - A;
      case 'dubbel': return d.a * (2 * d.c) === d.a * d.c * A;
      case 'halve': return d.a * d.c === (d.a * 2 * d.c) / A;
      case 'inv+': return d.a + d.b === d.a + (d.b + d.e) - A && (d.b + d.e) % 10 === 0;
      case 'inv-': return d.a - d.b === d.a - (d.b + d.e) + A && (d.b + d.e) % 10 === 0 && d.a > d.b + d.e;
      default: return false;
    }
  },
  hnd: (d) => {
    const A = Number(String(d.antwoord).replace(/ /g, ''));
    switch (d.hnd) {
      case 'wissel': return A === d.a + d.b + d.c && (d.a + d.c) % d.eenheid === 0;
      case 'tiental': return d.richting === 'volgend' ? d.n + A === d.doel && d.doel % 10 === 0 && A < 10 && A > 0 : d.n - A === d.doel && d.doel % 10 === 0 && A < 10 && A > 0;
      case 'aanvul': return d.b + A === d.a;
      case 'analogie': return d.bew === '+' ? A === (d.x + d.y) * d.k : A === (d.x - d.y) * d.k;
      case 'splitsr': return d.delen.reduce((a, b) => a + b, 0) === d.b && A === d.delen.at(-1) && d.delen.every(x => x > 0);
      case 'distr×': return d.b1 + d.b2 === d.b && A === d.b2 && d.a * d.b === d.a * d.b1 + d.a * A;
      case 'distr:': return d.x1 + d.x2 === d.x && A === d.x2 && d.x1 % d.d === 0 && d.x2 % d.d === 0 && d.x / d.d === d.x1 / d.d + A / d.d;
      case 'tussen': return d.klein ? A === d.a + d.b : A === d.a + d.b && d.b1 + d.b2 === d.b;
      default: return false;
    }
  },
  sch: (d) => {
    const u = d.eenheid, ronden = (n, e) => { const rest = n % e; return rest * 2 >= e ? n - rest + e : n - rest; };
    const A = Number(d.antwoord.replace(/ /g, ''));
    if (d.sch === '×') return A === ronden(d.a, u) * ronden(d.b, d.eenheidB) && d.antw === A;
    return A === (d.sch === '+' ? ronden(d.a, u) + ronden(d.b, u) : ronden(d.a, u) - ronden(d.b, u)) && A > 0 && d.antw === A;
  },
  ctl: (d) => {
    if (d.sch) return ok.sch(d);
    const A = Number(d.antwoord.replace(/ /g, ''));
    switch (d.bew) { case '+': return A === d.a && d.a + d.b === d.s && d.s - d.b === A; case '−': return A === d.a && d.a - d.b === d.v && d.v + d.b === A; case '×': return A === d.a && d.a * d.b === d.pr && d.pr / d.b === A; case ':': return A === d.a && d.a / d.b === d.q && d.q * d.b === A; default: return false; }
  },
  cfr: (d) => {
    switch (d.cfr) {
      case 'cijfer+': return d.antw === d.a + d.b; case 'cijfer-': return d.antw === d.a - d.b && d.antw > 0; case 'cijfer×': return d.antw === d.a * d.b;
      case 'cijfer:': return d.q === Math.floor(d.a / d.b) && d.rest === d.a % d.b && Number(d.antwoord.replace(/ /g, '')) === d.q;
      default: return false;
    }
  },
  vlg: (d) => {
    const uit = d.uit.replace(/×/g, '*').replace(/−/g, '-').replace(/:/g, '/'); const waarde = Function(`"use strict"; return (${uit});`)();
    return waarde === d.antw && Number(d.antwoord) === waarde;
  },
  glk: (d) => (d.glk === 'gat' ? d.a + d.b === Number(d.antwoord) + d.c : d.antwoord === (d.a + d.b === d.rb + d.ra ? 'ja' : 'nee')),
  een: (d) => EENHEID_TABEL[d.naam] === d.sym && (d.een !== 'getal' || (d.n >= 2 && d.vraag.includes(`${d.n} ${d.naam} = ${d.n}`))),
  hrl: (d) => {
    const wissel = { 'l': 'dm³', 'ml': 'cm³', 'kl': 'm³' };
    if (d.hrl === 'inh-vol') return d.omgekeerd ? wissel[d.van] === d.naar && d.antwoord == d.n : wissel[d.van] === d.naar && d.antwoord == d.n;
    if (d.hrl === 'massa-vol') return d.antwoord == d.n;
    const exp = EXP_STELSEL[d.stelsel === 'ton' ? 'massa' : d.stelsel];
    if (!(d.van in exp && d.naar in exp)) return false;
    const verwacht = d.n * 10 ** (exp[d.van] - exp[d.naar]);
    return Math.abs(Number(d.antwoord.replace(/ /g, '').replace(',', '.')) - verwacht) < 1e-9 * Math.max(1, verwacht);
  },
  scl: (d) => {
    switch (d.scl) {
      case 'plan': return d.plan * d.n === d.werkelijkM * 100 && Number(d.antwoord) === d.plan;
      case 'werkelijk': return d.plan * d.n === d.werkelijkM * 100 && Number(d.antwoord.replace(/ /g, '')) === d.werkelijkM;
      case 'schaal': return d.plan * d.n === d.werkelijkCm && Number(d.antwoord.replace(/ /g, '')) === d.n;
      case 'omzet': return d.m * 100 === d.n && Number(d.antwoord.replace(/ /g, '')) === (d.richting === 'breuk-naar-lijn' ? d.m : d.n);
      case 'vergroot': return d.vergroten ? d.antw === d.cm * d.f && Number(d.antwoord) === d.antw : d.antw * d.f === d.cm && Number(d.antwoord.replace(',', '.')) === d.antw;
      default: return false;
    }
  },
  evr: (d) => d.y1 * d.x2 === d.y2 * d.x1 && Number(d.antwoord) === d.y2,
  snl: (d) => d.v * d.uren === d.s && Number(d.antwoord.replace(/ /g, '')) === ({ v: d.v, afstand: d.s, tijd: d.uren }[d.snl]),
  bnt: (d) => d.bruto === d.netto + d.tarra && Number(d.antwoord) === { bruto: d.bruto, netto: d.netto, tarra: d.tarra }[d.bnt],
  dch: (d) => d.d * d.V === d.m && Number(d.antwoord) === { d: d.d, m: d.m, V: d.V }[d.dch],
  prs: (d) => {
    const euroGetal = (txt) => Number(txt.replace('€ ', '').replace(/ /g, '').replace(',', '.'));
    switch (d.prs) {
      case 'winst': return d.verkoop - d.inkoop === d.winst && euroGetal(d.antwoord) === d.winst;
      case 'verlies': return d.inkoop - d.verkoop === d.verlies && euroGetal(d.antwoord) === d.verlies;
      case 'verkoop': return d.inkoop + d.winst === d.verkoop && euroGetal(d.antwoord) === d.verkoop;
      case 'korting': return d.oud - d.nieuw === d.korting && euroGetal(d.antwoord) === d.korting;
      case 'nieuwe': return d.oud - d.korting === d.nieuw && euroGetal(d.antwoord) === d.nieuw;
      case 'pct-korting': return d.oud * (100 - d.pct) / 100 === d.nieuw && euroGetal(d.antwoord) === d.nieuw;
      case 'pct-winst': return d.inkoop * (100 + d.pct) / 100 === d.verkoop && euroGetal(d.antwoord) === d.verkoop;
      case 'intrest': return d.kap * d.pct * d.jaren / 100 === d.intrest && Number(d.antwoord.replace(/ /g, '')) === d.intrest;
      case 'kapitaal': return d.kap * d.pct / 100 === d.intrest && Number(d.antwoord.replace(/ /g, '')) === d.kap;
      case 'tijd': return d.kap * d.pct * d.jaren / 100 === d.intrest && Number(d.antwoord) === d.jaren;
      default: return false;
    }
  },
  tds: (d) => {
    switch (d.tds) {
      case 'uren': return d.einde - d.start === d.duur && d.antwoord === `${Math.floor(d.duur / 60)} u ${d.duur % 60} min`;
      case 'sec': return d.totaal === d.min * 60 + d.sec && Number(d.antwoord) === d.totaal;
      case 'sec-naar-min': return d.totaal === d.min * 60 + d.sec && d.antwoord === `${Math.floor(d.totaal / 60)} min ${d.totaal % 60} s`;
      case 'dagen': { const dag = 86400000, a = Date.UTC(2023, d.mA, d.dA), b = Date.UTC(2023, d.mB, d.dB); return (b - a) / dag + 1 === d.dagen && Number(d.antwoord) === d.dagen && b >= a; }
      case 'eeuw': return d.eeuw === Math.floor((d.jaar - 1) / 100) + 1 && Number(d.antwoord) === d.eeuw;
      default: return false;
    }
  },
  tmp: (d) => (d.tmp === 'stijging' ? d.tot > d.van && Number(d.antwoord) === d.tot - d.van : d.tot < d.van && Number(d.antwoord) === d.van - d.tot),
  frm: (d) => {
    const A = Number(d.antwoord.replace(/ /g, '').replace(',', '.'));
    switch (d.frm) {
      case 'omtrek-veelhoek': return A === d.z.reduce((x, y) => x + y, 0);
      case 'omtrek-vierkant': return A === 4 * d.l;
      case 'omtrek-rechthoek': return A === 2 * (d.l + d.b);
      case 'omtrek-samengesteld': return A === 2 * (d.a + d.d);
      case 'opp-vierkant': return A === d.l * d.l;
      case 'opp-rechthoek': return A === d.l * d.b;
      case 'opp-samengesteld': return A === d.a * d.d - d.c * d.e;
      case 'opp-driehoek': return A === d.b * d.h / 2;
      case 'opp-parallellogram': return A === d.b * d.h;
      case 'opp-ruit': return A === d.d1 * d.d2 / 2;
      case 'opp-trapezium': return A === (d.b1 + d.b2) * d.h / 2;
      case 'omtrek-cirkel': return Math.abs(A - 3.14 * d.d) < 1e-9;
      case 'opp-cirkel': return Math.abs(A - 3.14 * d.r * d.r) < 1e-9;
      case 'oppv-kubus': return A === 6 * d.z * d.z;
      case 'oppv-balk': return A === 2 * (d.l * d.b + d.l * d.h + d.b * d.h);
      case 'vol-kubus': return A === d.z ** 3;
      case 'vol-balk': return A === d.l * d.b * d.h;
      case 'vol-cilinder': return Math.abs(A - 3.14 * d.r * d.r * d.h) < 1e-9;
      case 'vol-prisma': return A === d.grond * d.h;
      case 'vol-kegel': return A === d.grond * d.h / 3;
      default: return false;
    }
  },
  dgm: (d, o) => {
    const { cats, waarden: w, soort, a, b } = d, n = w.length, markup = o.svg.markup;
    if (new Set(w).size !== n || cats.length !== n || !cats.every(c => markup.includes(`>${c}`) || markup.includes(`${c} `))) return false;
    if (d.dgm === 'cirkel' && (som(w) !== 100 || w.some(x => x % 5 || x < 5))) return false;
    if (d.dgm === 'beeld' && (w.some(x => x % d.k) || (markup.match(/<circle/g) || []).length !== som(w) / d.k + 1)) return false;
    if (d.dgm === 'staaf' && (w.some(x => x % d.stap || x > d.max) || (markup.match(/<rect/g) || []).length !== n)) return false;
    if (d.dgm === 'lijn' && (w.some(x => x > d.max) || (markup.match(/<circle/g) || []).length !== n)) return false;
    const kleinste = cats[w.indexOf(Math.min(...w))], grootste = cats[w.indexOf(Math.max(...w))];
    switch (soort) {
      case 'lees': return d.antwoord == w[a] && d.vraag.includes(cats[a]);
      case 'meest': case 'hoogst': return d.antwoord === grootste;
      case 'minst': case 'laagst': return d.antwoord === kleinste;
      case 'verschil': return d.antwoord == w[a] - w[b] && w[a] > w[b] && d.vraag.includes(cats[a]) && d.vraag.includes(cats[b]);
      case 'totaal': return d.antwoord == som(w);
      case 'aantal': return d.dgm === 'cirkel' && d.antwoord == (w[a] * d.totaal) / 100 && Number.isInteger(Number(d.antwoord)) && d.vraag.includes(String(d.totaal));
      default: return false;
    }
  },
  cvb: (d, o) => {
    const hoek = d.p * 360 / 100, g = gcdT(d.p, 100), breuk = `${d.p / g}/${100 / g}`;
    const vraagOk = d.vraag.includes(d.cvb.startsWith('proc') ? `${d.p} %` : d.cvb.startsWith('hoek') ? `${hoek}°` : breuk);
    const verwacht = { 'proc-hoek': hoek, 'breuk-hoek': hoek, 'hoek-proc': d.p, 'breuk-proc': d.p, 'hoek-breuk': breuk, 'proc-breuk': breuk }[d.cvb];
    return vraagOk && hoek === d.hoek && d.antwoord == verwacht && o.svg.markup.includes('<path');
  },
  gem: (d) => {
    if (d.gem === 'verdeling') return d.antwoord * d.n === d.totaal && d.vraag.includes(`${d.n} kinderen`) && d.vraag.includes(String(d.totaal));
    const l = d.lijst, sorted = [...l].sort((x, y) => x - y), gemiddeld = som(l) / l.length;
    const med = l.length % 2 ? sorted[(l.length - 1) / 2] : (sorted[l.length / 2 - 1] + sorted[l.length / 2]) / 2;
    if (!d.vraag.includes(l.join(', ').replace(/, (\d+)$/, ' en $1'))) return false;
    if (d.gem === 'gemiddelde') return d.antwoord == gemiddeld && Number.isInteger(gemiddeld);
    if (d.gem === 'mediaan') return d.antwoord == med && Number.isInteger(med);
    return d.antwoord == Math.abs(gemiddeld - med) && gemiddeld !== med && Number.isInteger(gemiddeld) && Number.isInteger(med);
  },
  kns: (d) => {
    if (d.kns === 'nooit-altijd') {
      const v = d.vraag, nul = /kans op een 7|blauwe knikker|tegelijk kop en munt|nummer 99/.test(v), honderd = /kleiner dan 7|rode knikker trekt|kop of munt/.test(v);
      return nul !== honderd && d.antwoord == (nul ? 0 : 100);
    }
    if (d.kns === 'experiment') return d.antwoord == (d.x * 100) / d.n && d.x < d.n && d.vraag.includes(`${d.n} keer`) && d.vraag.includes(`${d.x} keer`);
    const T = som(d.tellers), r = d.tellers[d.gevraagd];
    if (T !== d.T || !d.vraag.includes(`${r} `)) return false;
    return d.kns === 'procent' ? d.antwoord == (r * 100) / T && Number.isInteger(Number(d.antwoord)) : (() => { const [x, y] = d.antwoord.split('/').map(Number); return x * T === y * r && gcdT(x, y) === 1; })();
  },
  vrg: (d, o) => {
    const num = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));
    const A = num(d.antwoord), V = d.vraag, heeft = (...l) => l.every(x => V.replace(/\s/g, '').includes(String(x).replace(/\s/g, '')));
    switch (d.vrg) {
      case 'enkel': case 'overbodig': {
        const e = { '+': d.x + d.y, '-': d.x - d.y, '×': d.x * d.y, '÷': d.x / d.y }[d.op];
        if (!Number.isInteger(e) || e < 0 || A !== e || !heeft(d.x === undefined ? 0 : d.op === '÷' ? d.x : d.x, d.y)) return false;
        if (d.vrg === 'overbodig') return heeft(d.extra) && ![d.x, d.y, e].includes(d.extra) && d.fouten.every(f => true);
        return true;
      }
      case 'signaal': return A === (d.soort === 'meer' ? d.x - d.y : d.x + d.y) && heeft(d.x, d.y) && V.includes(d.soort === 'meer' ? 'meer dan' : 'minder dan');
      case 'omgekeerd': return d.soort === 'keer' ? A * d.y === d.x && heeft(d.x, d.y) : A === (d.soort === 'erbij' ? d.x - d.y : d.x + d.y) && heeft(d.x, d.y);
      case 'dec': return d.a !== d.b && Math.round(A * 100) === (d.op === '+' ? d.a + d.b : d.a - d.b);
      case 'breuk+': { const [p, q] = d.antwoord.split('/').map(Number), q2 = q ?? 1, pn = q ? p : p; const w = d.op === '+' ? d.x + d.y : d.x - d.y; return pn * d.d === w * q2 && gcdT(pn, q2) === 1 && w > 0 && heeft(`${d.x}/${d.d}`, `${d.y}/${d.d}`); }
      case 'samengesteld':
        if (d.soort === 'wissel') return A === d.pay - d.n * d.p - d.q && A >= 0 && heeft(d.n, d.p, d.q, d.pay);
        if (d.soort === 'twee-soorten') return A === d.a * d.b + d.c * d.d;
        return A === d.q && d.k * d.q + d.w === (d.k * d.q + d.w) && heeft(d.k, d.k * d.q + d.w, d.w);
      case 'grootheid':
        if (d.soort === 'temp') return A === (d.op === 'warmer' ? d.a + d.b : d.a - d.b);
        if (d.soort === 'hoek') return A === d.tot - d.a && [90, 180, 360].includes(d.tot);
        if (d.soort === 'gelijk') return A === (d.op === '+' ? d.x + d.y : d.x - d.y) && A >= 0;
        return A === (d.op === '+' ? d.a * d.f + d.b : d.a * d.f - d.b) && A > 0 && { m: 100, km: 1000, l: d.klein === 'dl' ? 10 : 1000, kg: 1000, u: 60, euro: 100 }[d.groot] === d.f;
      case 'verhouding': return d.soort === 'gelijkwaardig' ? A === d.u * (d.q2 / d.q1) && Number.isInteger(d.q2 / d.q1) : d.soort === 'drie' ? A === (d.u * d.q1 * d.q2) / d.q1 : A === ((d.u * d.q2) / d.u) && A === d.q2;
      case 'omgekeerd-evenredig': return A * d.n2 === d.n1 * d.t1 && Number.isInteger(A);
      case 'niet-evenredig': return d.antwoord === (/dan twee keer|dan 40 kg|twee kranen/.test(d.stelling) ? 'nee' : 'ja') && d.vraag.includes(d.stelling);
      case 'procent-van': return A === (d.pct * d.n) / 100 && (d.pct * d.n) % 100 === 0;
      case 'breuk-van':
        if (d.soort === 'operator') return A === (d.n * d.a) / d.d && d.n % d.d === 0;
        if (d.soort === 'geheel') return A === d.n && d.n % d.d === 0 && heeft(`${d.a}/${d.d}`, (d.n / d.d) * d.a);
        if (d.soort === 'procent') return A === (d.pct * d.n) / 100 && (d.pct * d.n) % 100 === 0;
        { const [p, q] = d.antwoord.split('/').map(Number); return p * d.n === d.deel * (q ?? 1) && gcdT(p, q ?? 1) === 1; }
      case 'rest':
        if (d.soort === 'kgv') { let m = 1; while (m % d.a || m % d.b) m++; return A === m; }
        return A === { dozen: Math.floor(d.n / d.d), rest: d.n % d.d, nodig: Math.ceil(d.n / d.d) }[d.soort] && d.n % d.d !== 0;
      case 'som-verschil': { const klein = (d.S - d.v) / 2; return Number.isInteger(klein) && A === (d.wie === 'klein' ? klein : klein + d.v) && heeft(d.S, d.v); }
      case 'som-verhouding': { const k = d.S / (d.x + d.y); return Number.isInteger(k) && A === (d.wie === 'klein' ? k * d.x : k * d.y) && d.x < d.y; }
      case 'prijs':
        if (d.soort === 'winst') return A === d.verkoop - d.koop && A > 0;
        if (d.soort === 'verlies') return A === d.koop - d.verkoop && A > 0;
        if (d.soort === 'korting') return A * 100 === d.basis * (100 - d.pct);
        if (d.soort === 'stijging') return A * 100 === d.basis * (100 + d.pct);
        return A * 100 === d.kapitaal * d.rente * d.j;
      case 'bruto':
        if (d.soort === 'procent') return A * 100 === d.bruto * (100 - d.pct);
        return d.bruto === d.netto + d.tarra && A === { netto: d.netto, bruto: d.bruto, tarra: d.tarra }[d.soort];
      case 'schaal': { const f = { km: 100000, m: 100, cm: 1 }[d.eenheid]; return d.richting === 'naar-werkelijk' ? A * f === d.kaart * d.schaal : A === d.kaart && d.kaart * d.schaal % f === 0; }
      case 'snelheid': return d.s === d.v * d.t && A === { afstand: d.s, snelheid: d.v, tijd: d.t }[d.soort];
      case 'meetkunde':
        if (d.soort === 'rechthoek-breedte') return A * 2 + d.l * 2 === d.omtrek && A < d.l;
        if (d.soort === 'vierkant-zijde') return A * 4 === d.omtrek;
        if (d.soort === 'gelijkbenig-basis') return A + 2 * d.z === d.omtrek && A < 2 * d.z;
        if (d.soort === 'hoeksom') return A + d.a + d.b === 180 && A > 0;
        return A === d.l * d.b;
      case 'stat': {
        const l = d.lijst, tot = l.reduce((x, y) => x + y, 0);
        if (d.soort === 'ontbrekend') return (tot + A) / d.n === d.m && A >= 1;
        if (d.soort === 'mediaan') return A === [...l].sort((x, y) => x - y)[(l.length - 1) / 2] && l.length % 2 === 1;
        return A * l.length === tot && Number.isInteger(A);
      }
      case 'groei':
        if (d.soort === 'procent') return Math.abs(d.naar - d.van) * 100 === A * d.van;
        if (d.soort === 'nieuw') return A === d.van + (d.dir === 'toename' ? 1 : -1) * (d.van * d.pct) / 100;
        return A * (100 + (d.dir === 'toename' ? 1 : -1) * d.pct) === d.naar * 100;
      case 'relatief': return d.antwoord === (d.a1 * d.n2 > d.a2 * d.n1 ? 'klas A' : d.a1 * d.n2 < d.a2 * d.n1 ? 'klas B' : 'even groot') && d.a1 * d.n2 !== d.a2 * d.n1;
      case 'mengsel':
        if (d.soort === 'drank') return A * (d.x + d.y) === d.tot * d.x;
        return A * (d.w1 + d.w2) === d.w1 * d.p1 + d.w2 * d.p2 && Number.isInteger(A);
      case 'bevolking':
        if (d.soort === 'dichtheid') return A * d.opp === d.n; if (d.soort === 'aantal') return A === d.opp * d.dens; return A * d.dens === d.n;
      case 'massadichtheid':
        if (d.soort === 'massa') return A === d.rho * d.V; if (d.soort === 'volume') return A * d.rho === d.m; return A * d.V === d.m;
      case 'puzzel':
        if (d.soort === 'getal') return (d.dubbel ? A * 2 + d.x : A + d.x) === d.res;
        if (d.soort === 'patroon') { const r = d.reeks; return r.every((x, i) => i === 0 || x - r[i - 1] === d.stap) && A === r[4] + d.stap; }
        if (d.soort === 'poten') return A === d.a * 2 + d.b * 4;
        if (d.soort === 'handdruk') { let t = 0; for (let i = 1; i < d.n; i++) t += i; return A === t; }
        if (d.soort === 'kippen') return A * 4 + (d.dieren - A) * 2 === d.poten && A <= d.dieren;
        return A === 2 * d.j + d.v;
      default: return false;
    }
  },
  kal: (d) => {
    switch (d.feit) {
      case 'week-dagen': return d.antwoord === '7'; case 'weekend': return d.antwoord === 'zondag'; case 'weekdagen': return d.antwoord === '5'; case 'jaar-weken': return d.antwoord === '52'; case 'jaar-maanden': return d.antwoord === '12';
      case 'uur-min': case 'min-sec': return d.antwoord === '60'; case 'halfuur': return d.antwoord === '30'; case 'kwartier': return d.antwoord === '15'; case 'dag-uur': return d.antwoord === '24'; case 'uur-kwartier': return d.antwoord === '4';
      case 'jaar-dagen': return d.antwoord === '365'; case 'schrikkeljaar-dagen': return d.antwoord === '366';
      case 'schrikkel': return d.antwoord === (new Date(d.jaar, 1, 29).getDate() === 29 ? 'ja' : 'nee');
      case 'trimester': return d.antwoord === '3'; case 'semester': return d.antwoord === '6'; case 'decennium': return d.antwoord === '10'; case 'eeuw': return d.antwoord === '100'; case 'millennium': return d.antwoord === '1000'; case 'jaar-trimesters': return d.antwoord === '4';
      case 'maand-nummer': return d.antwoord === MND[d.i];
      case 'na-maand': return d.antwoord === MND[(d.i + 1) % 12];
      case 'maand-dagen': return Number(d.antwoord) === new Date(2023, d.i + 1, 0).getDate();
      case 'na-dag': return d.antwoord === DGN[(d.i + 1) % 7]; case 'voor-dag': return d.antwoord === DGN[(d.i + 6) % 7];
      case 'datum': return d.antwoord === MND[d.i] && d.dag >= 1 && d.dag <= new Date(2023, d.i + 1, 0).getDate();
      default: return false;
    }
  },
  eig: (d) => {
    const { eig: t, a, b, c, k, f1, f2 } = d;
    switch (t) {
      case 'comm+': return d.antwoord == a && a + b === b + a;
      case 'comm×': return d.antwoord == a && a * b === b * a;
      case 'ncomm-': return d.antwoord === 'nee' && a - b !== b - a;
      case 'ncomm:': return d.antwoord === 'nee' && Number.isInteger(a / b) && a / b !== b / a;
      case 'ass+': return d.antwoord == c && (a + b) + c === a + (b + c);
      case 'ass×': return d.antwoord == c && (a * b) * c === a * (b * c);
      case 'nass-': return d.antwoord === 'nee' && (a - b) - c !== a - (b - c) && a - b - c >= 0;
      case 'nass:': return d.antwoord === 'nee' && Number.isInteger(a / b) && Number.isInteger(b / c) && (a / b) / c !== a / (b / c);
      case 'dist×+': return d.antwoord == c && a * (b + c) === a * b + a * c;
      case 'dist×-': return d.antwoord == c && b > c && a * (b - c) === a * b - a * c;
      case 'dist:+': return d.antwoord == d.d && a % d.d === 0 && b % d.d === 0 && (a + b) / d.d === a / d.d + b / d.d;
      case 'dist:-': return d.antwoord == d.d && a % d.d === 0 && b % d.d === 0 && a > b && (a - b) / d.d === a / d.d - b / d.d;
      case 'n0+': return d.antwoord == a && (d.vraag.includes('+ 0') ? a + 0 === a : a - 0 === a);
      case 'n0-': return d.antwoord === 'nee' && 0 - a !== a - 0;
      case 'n1×': return d.antwoord == a && (d.deel ? a / 1 === a : a * 1 === a);
      case 'n1:': return d.antwoord === 'nee' && 1 / a !== a / 1;
      case 'op0×': return d.antwoord == 0 && a * 0 === 0;
      case 'op0:': return d.deelDoorNul ? d.antwoord === 'nee' : d.antwoord == 0 && 0 / a === 0;
      case 'inv+-': return d.antwoord == a && d.s - d.b === a && a + d.b === d.s;
      case 'inv×:': return d.antwoord == a && d.p / d.b === a && a * d.b === d.p;
      case 'herh': return d.deel ? d.antwoord == b && a * b - b * a === 0 && d.vraag.split('−').length - 1 === b : d.antwoord == a && d.vraag.split('+').length - 1 === b - 1;
      case 'comp+': return d.antwoord == k && a + b === (a + k) + (b - k);
      case 'comp-': return d.antwoord == k && a - b === (a + k) - (b + k);
      case 'comp×': return d.antwoord == k && b % k === 0 && a * b === (a * k) * (b / k);
      case 'comp:': return d.antwoord == k && a % b === 0 && a / b === (a * k) / (b * k);
      case 'ontb': return d.antwoord == f2 && (d.deel ? (a % (f1 * f2) === 0 && a / (f1 * f2) === a / f1 / f2) : a * f1 * f2 === a * (f1 * f2));
      case 'deelrest': return d.antwoord == d.rest && d.D === d.d * d.q + d.rest && d.rest < d.d;
      default: throw new Error(`onbekend type ${t}`);
    }
  },
};
/* ---- tweede, los geschreven hulpfuncties voor de controle */
const ONDER20 = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
const TIENEN = { 2: 'twintig', 3: 'dertig', 4: 'veertig', 5: 'vijftig', 6: 'zestig', 7: 'zeventig', 8: 'tachtig', 9: 'negentig' };
function woordTweede(n) {
  if (n === 1000) return 'duizend';
  const h = Math.floor(n / 100), rest = n % 100, t = Math.floor(rest / 10), e = rest % 10;
  let w = h ? (h === 1 ? 'honderd' : ONDER20[h] + 'honderd') : '';
  if (rest === 0) return w || 'nul';
  if (rest < 20) return w + ONDER20[rest];
  if (e === 0) return w + TIENEN[t];
  const verbinding = ['twee', 'drie'].includes(ONDER20[e]) ? 'ën' : 'en';
  return w + ONDER20[e] + verbinding + TIENEN[t];
}
const WOORD_TABEL = { 0: 'nul', 7: 'zeven', 12: 'twaalf', 13: 'dertien', 19: 'negentien', 20: 'twintig', 21: 'eenentwintig', 22: 'tweeëntwintig', 23: 'drieëntwintig', 24: 'vierentwintig', 38: 'achtendertig', 45: 'vijfenveertig', 67: 'zevenenzestig', 80: 'tachtig', 99: 'negenennegentig', 100: 'honderd', 101: 'honderdeen', 112: 'honderdtwaalf', 250: 'tweehonderdvijftig', 333: 'driehonderddrieëndertig', 478: 'vierhonderdachtenzeventig', 999: 'negenhonderdnegenennegentig', 1000: 'duizend' };
const RANG_TABEL = { 1: 'eerste', 2: 'tweede', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste', 9: 'negende', 10: 'tiende', 11: 'elfde', 12: 'twaalfde', 13: 'dertiende', 19: 'negentiende', 20: 'twintigste', 21: 'eenentwintigste', 22: 'tweeëntwintigste', 30: 'dertigste', 50: 'vijftigste', 99: 'negenennegentigste', 100: 'honderdste' };
const priemTest = (n) => { if (n < 2) return false; for (let d = 2; d < n; d++) if (n % d === 0) return false; return true; };
const gedeeldDoor = (n, d) => Math.floor(n / d) * d === n;
const afrondTweede = (n, u) => { const rest = n % u; return rest * 2 >= u ? n - rest + u : n - rest; };
const spatie = (n) => (String(n).length >= 5 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n));
const hon2 = (x) => `${Math.floor(x / 100)},${String(x % 100).padStart(2, '0')}`;
const PLAATS = ['E', 'T', 'H', 'D', 'TD', 'HD', 'M', 'TM', 'HM', 'Md'];
const somDelen = (tekst) => [...tekst.matchAll(/(\d+) (Md|HM|TM|HD|TD|M|D|H|T|E)\b/g)].reduce((s, [, c, pl]) => s + Number(c) * 10 ** PLAATS.indexOf(pl), 0);
const kommaGetal = (x, nd) => { const s = String(x).padStart(nd + 1, '0'), e = s.slice(0, -nd), f = s.slice(-nd).replace(/0+$/, ''); const e2 = e.length >= 5 ? e.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : e; return f ? `${e2},${f}` : e2; };
const EENHEID_TABEL = { meter: 'm', centimeter: 'cm', decimeter: 'dm', millimeter: 'mm', kilometer: 'km', hectometer: 'hm', decameter: 'dam', liter: 'l', deciliter: 'dl', centiliter: 'cl', milliliter: 'ml', kiloliter: 'kl', hectoliter: 'hl', decaliter: 'dal', kilogram: 'kg', hectogram: 'hg', decagram: 'dag', gram: 'g', decigram: 'dg', centigram: 'cg', milligram: 'mg', ton: 't', uur: 'u', minuut: 'min', seconde: 's', euro: '€', 'graden Celsius': '°C', graden: '°', hectare: 'ha', are: 'a', centiare: 'ca', 'vierkante meter': 'm²', 'vierkante decimeter': 'dm²', 'vierkante centimeter': 'cm²', 'vierkante millimeter': 'mm²', 'vierkante kilometer': 'km²', 'vierkante hectometer': 'hm²', 'vierkante decameter': 'dam²', 'kubieke meter': 'm³', 'kubieke decimeter': 'dm³', 'kubieke centimeter': 'cm³', 'kubieke millimeter': 'mm³', 'kubieke kilometer': 'km³', 'kubieke hectometer': 'hm³', 'kubieke decameter': 'dam³', 'kilometer per uur': 'km/uur', 'meter per seconde': 'm/s' };
const EXP_STELSEL = { lengte: { km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3 }, opp: { 'km²': 6, 'hm²': 4, 'dam²': 2, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6 }, inhoud: { kl: 3, hl: 2, dal: 1, l: 0, dl: -1, cl: -2, ml: -3 }, massa: { t: 6, kg: 3, hg: 2, dag: 1, g: 0, dg: -1, cg: -2, mg: -3 }, landmaat: { ha: 4, a: 2, ca: 0, 'm²': 0 } };
const MND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const DGN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const som = (l) => l.reduce((a, b) => a + b, 0);
const gcdT = (a, b) => (b ? gcdT(b, a % b) : a);
const alsBreuk = (str) => { const [a, b] = str.split('/').map(Number); return { n: a, d: b ?? 1 }; };
const gelijkB = (x, y) => x.n * y.d === y.n * x.d;
const parseWaarde = (str) => { if (str.includes('/')) return alsBreuk(str); if (str.endsWith('%')) return { n: Number(str.replace(/[^\d]/g, '')), d: 100 }; const [e, f = ''] = str.split(','); return { n: Number(e + f), d: 10 ** f.length }; };
const eenvoudig = (str) => { const b = alsBreuk(str); return gcdT(b.n, b.d) === 1 || b.d === 1; };
const kommaTekst = (h) => { const e = Math.floor(h / 100), f = String(h % 100).padStart(2, '0').replace(/0+$/, ''); return f ? `${e},${f}` : String(e); };
const familieVan = (g) => g.id.replace(/-(invullen|kiezen|juist-fout)$/, '');

for (const g of ECHTE_GENERATORS.filter(x => FAMILIES.some(f => f.id === familieVan(x)))) {
  test(`${g.id}: antwoorden kloppen, opties zijn juist ingedeeld, geen dubbels, herhaalbaar`, () => {
    const fam = familieVan(g), vorm = g.id.slice(fam.length + 1);
    const codes = AUTO_DOELEN[fam]; assert.ok(codes.length > 0, 'de familie heeft doelen');
    for (const code of codes) for (const seed of SEEDS.slice(0, 3)) {
      const opties = g.opties(g.doelen, {}, code); assert.equal(opties.doel, code);
      const aantal = effectiefAantal(g, 8), res = g.genereer({ seed, aantal, opties });
      assert.ok(res.oefeningen.length >= Math.min(aantal, 3), `${g.id} ${code} seed ${seed}: ${res.oefeningen.length}`);
      assert.equal(new Set(res.oefeningen.map(o => o.sleutel)).size, res.oefeningen.length);
      for (const o of res.oefeningen) {
        const d = o.data; assert.ok(ok[fam](d, o), `${g.id} ${code}: ${o.tekst}`);
        assert.ok(d.vraag.split('____').length === 2, `${d.vraag}: precies één antwoordplaats`);
        assert.ok(!d.fouten.includes(d.antwoord) && new Set(d.fouten).size === d.fouten.length);
        if (vorm === 'kiezen') { assert.equal(new Set(d.opties).size, d.opties.length); assert.equal(d.opties[d.juist], d.antwoord); assert.ok(d.opties.length >= 2 && d.opties.every(x => x === d.antwoord || d.fouten.includes(x))); assert.ok(o.antwoord.startsWith('abcd'[d.juist] + ')')); }
        if (vorm === 'juist-fout') { assert.equal(d.juist, d.getoond === d.antwoord); assert.equal(o.antwoord, d.juist ? 'juist' : 'fout'); assert.ok(d.juist || d.fouten.includes(d.getoond)); }
        if (vorm === 'invullen') assert.equal(o.antwoord, d.antwoord);
      }
      assert.deepEqual(g.genereer({ seed, aantal, opties }), res);
    }
  });
}

test('eig: alle soorten eigenschappen komen voor in de oefeningen', () => {
  const g = ECHTE_GENERATORS.find(x => x.id === 'eig-invullen'), gezien = new Set();
  for (const code of AUTO_DOELEN.eig) for (const seed of SEEDS) for (const o of g.genereer({ seed, aantal: 10, opties: { doel: code } }).oefeningen) gezien.add(o.data.eig);
  assert.deepEqual([...gezien].sort(), ['comm+', 'comm×', 'ncomm-', 'ncomm:', 'ass+', 'ass×', 'nass-', 'nass:', 'dist×+', 'dist×-', 'dist:+', 'dist:-', 'n0+', 'n0-', 'n1×', 'n1:', 'op0×', 'op0:', 'inv+-', 'inv×:', 'herh', 'comp+', 'comp-', 'comp×', 'comp:', 'ontb', 'deelrest'].sort());
});

test('getallen in woorden en rangtelwoorden: tabel en tweede berekening komen overeen met de hulpfuncties', async () => {
  const { getalWoord, rangWoord } = await import('../js/subjects/wiskunde/auto-hulp.js');
  for (const [n, w] of Object.entries(WOORD_TABEL)) assert.equal(getalWoord(Number(n)), w, n);
  for (let n = 0; n <= 1000; n++) assert.equal(getalWoord(n), woordTweede(n), String(n));
  for (const [n, w] of Object.entries(RANG_TABEL)) assert.equal(rangWoord(Number(n)), w, n);
  for (let n = 20; n <= 100; n++) assert.equal(rangWoord(n), woordTweede(n) + 'ste');
});

test('elke soort opgave die een doel vraagt, komt echt voor in de oefeningen', () => {
  const sleutels = { vrg: 'vrg', dgm: 'dgm', gem: 'gem', kns: 'kns', vlv: 'vlv', bkd: 'bkd', omz: 'omz', dcm: 'dcm', bkb: 'bkb', dcb: 'dcb', pws: 'pws' };
  const equivalent = { 'geheel-procent': 'geheel', 'veelvoud-ja': 'veelvoud', 'dec:dec': 'dec×dec' };
  for (const [fam, sleutel] of Object.entries(sleutels)) {
    const g = ECHTE_GENERATORS.find(x => x.id === `${fam}-invullen`), gezien = new Set(), gevraagd = new Set();
    const f = FAMILIES.find(x => x.id === fam);
    for (const code of AUTO_DOELEN[fam]) {
      f.parameters(DOELEN.find(d => d.code === code)).types.forEach(t => gevraagd.add(t));
      for (const seed of SEEDS) for (const o of g.genereer({ seed, aantal: 12, opties: { doel: code } }).oefeningen) gezien.add(equivalent[o.data[sleutel]] ?? o.data[sleutel]);
    }
    for (const t of gevraagd) assert.ok(gezien.has(equivalent[t] ?? t), `${fam}: de soort ${t} komt nooit voor`);
  }
});
