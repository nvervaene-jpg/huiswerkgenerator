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
        const d = o.data; assert.ok(ok[fam](d), `${g.id} ${code}: ${o.tekst}`);
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
  const sleutels = { vlv: 'vlv', bkd: 'bkd', omz: 'omz', dcm: 'dcm', bkb: 'bkb', dcb: 'dcb', pws: 'pws' };
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
