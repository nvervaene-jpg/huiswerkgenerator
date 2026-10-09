// Fabriek voor de extra oefenvormen van een maat (lengte, gewicht, tijdsduur, euro/eurocent).
// Per maat ontstaan: ordenen, tabel aanvullen, vraagstukje, "welke eenheid past?" en de vier stellingvormen
// (juist of fout, meerkeuze, verbinden, fout zoeken). Alle vormen delen de kern "v a = w b".
import { maakRng } from '../../../core/random.js';
import { trek, resultaat, aantalCijfers } from './hulp.js';
import { eenhedenVoorDoelen, kernOmzet } from './maten.js';
import { stellingVormen, maatFouten, kies, NBSP } from './stelling-vormen.js';
import { tabel } from '../svg.js';
import { THEMAS, THEMA_KEUZES } from '../contexten.js';

const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
export const THEMA_KEUZE = { id: 'thema', groep: 'thema', label: 'Thema voor de zinnetjes', type: 'select', opties: THEMA_KEUZES, standaard: 'gemengd' };

// cfg: { prefix, maat, factor, volgorde, kaarten: { omzet, vergelijk, ref }, standaard, meervoud,
//        ctx: { sleutel ('cm','g','min','cent'), eenheid, zin(obj,v,e), superlatief(obj), zelfdeSoort(o1,o2) },
//        referentie: [...], refZin(item), }
export function maatVormen(cfg) {
  const { prefix, maat, factor, volgorde, kaarten, standaard, ctx } = cfg;
  const eenhedenVan = (o) => (o && o.eenheden && o.eenheden.length > 1 ? o.eenheden : standaard);
  const optiesVan = (kaart) => (doelCodes, k = {}) => ({ eenheden: eenhedenVoorDoelen(volgorde, kaart, doelCodes), thema: k.thema || 'gemengd' });
  const naarCtx = (v, e) => (v * factor[e]) / factor[ctx.eenheid];
  const objecten = (thema) => (thema && THEMAS[thema] ? THEMAS[thema][maat] : Object.values(THEMAS).flatMap(t => t[maat]));
  const bereik = (o) => o[ctx.sleutel];

  // Een omzetting binnen het getallengebied: v a = w b.
  const omzetting = (r, eenheden, gebied) => {
    const a = kies(r, eenheden), b = kies(r, eenheden);
    if (a === b) return null;
    const omhoog = factor[a] < factor[b];
    const ratio = omhoog ? factor[b] / factor[a] : factor[a] / factor[b];
    const max = Math.floor(gebied / ratio);
    if (!Number.isInteger(ratio) || max < 1) return null;
    const n = r.geheel(1, max);
    const k = omhoog ? { a, v: n * ratio, b, w: n } : { a, v: n, b, w: n * ratio };
    return { ...k, ratio, omhoog, kern: kernOmzet(maat, a, b, k.v, k.w), moeilijkheid: Math.log10(ratio) + (omhoog ? 0.5 : 0) };
  };
  const sample = (r, { gebied, opties }) => {
    const k = omzetting(r, eenhedenVan(opties), gebied);
    return k && {
      data: { soort: 'omzet', maat, v: k.v, a: k.a, w: k.w, b: k.b }, links: `${k.v} ${k.a}`, eenheid: k.b, w: k.w, getallen: [k.v],
      kern: k.kern, moeilijkheid: k.moeilijkheid, vraag: `Hoeveel ${k.b} is ${k.v} ${k.a}?`, fouten: maatFouten(k.w), k,
    };
  };

  const vorm = ({ id, titel, pictogram = 'schrijven', opdracht, kaart, rang, schaal = 1, keuzes, bouw }) => ({
    id: `${prefix}-${id}`, titel, pictogram, opdracht, rang, schaal, basis: false, doelen: Object.keys(kaart),
    ...(keuzes ? { keuzes } : {}), opties: optiesVan(kaart),
    genereer({ seed, aantal, gebied, opties }) {
      const rng = maakRng(seed);
      return resultaat(trek(rng, aantal, (r) => bouw(r, { gebied, eenheden: eenhedenVan(opties), opties: opties || {} })), aantal);
    },
  });

  /* ---- ordenen */
  const ordenen = vorm({
    id: 'ordenen', titel: `${hoofd(cfg.meervoud)} ordenen`, kaart: kaarten.vergelijk, rang: 4, schaal: 0.67,
    opdracht: `Zet de ${cfg.meervoud} in de juiste volgorde. Het teken wijst de richting aan.`,
    bouw(r, { gebied, eenheden }) {
      const n = r.volgende() < 0.4 ? 4 : 3;
      const basis = r.geheel(1, gebied) * factor[kies(r, eenheden)];
      const items = [];
      for (let i = 0; i < n; i++) {
        const u = kies(r, eenheden), v = Math.round((basis * (0.3 + r.volgende() * 2.2)) / factor[u]);
        if (v < 1 || v > gebied) return null;
        items.push({ v, u, basis: v * factor[u] });
      }
      if (new Set(items.map(i => i.basis)).size < n || new Set(items.map(i => `${i.v} ${i.u}`)).size < n) return null;
      const stijgend = r.volgende() < 0.5, teken = stijgend ? '<' : '>';
      const juist = [...items].sort((x, y) => (stijgend ? x.basis - y.basis : y.basis - x.basis));
      const door = r.schud(items);
      if (door.every((x, i) => x === juist[i])) return null;
      const label = (i) => `${i.v} ${i.u}`, antwoord = juist.map(label).join(` ${teken} `);
      return {
        tekst: `${door.map(label).join('   ')}   →   ${Array(n).fill('____').join(` ${teken} `)}`, antwoord,
        volledig: `${door.map(label).join(' ')} → ${antwoord}`, breed: true, getallen: items.map(i => i.v),
        sleutel: [...items].sort((x, y) => x.basis - y.basis).map(label).join('/'), moeilijkheid: [n, aantalCijfers(Math.max(...items.map(i => i.v)))],
        data: { type: 'orden-maat', maat, items: door.map(({ v, u }) => ({ v, u })), stijgend },
      };
    },
  });

  /* ---- tabel aanvullen */
  const tabelVorm = vorm({
    id: 'tabel', titel: 'Tabel aanvullen', kaart: kaarten.omzet, rang: 4, schaal: 0.34,
    opdracht: 'Vul de tabel aan. In elke rij staat één hoeveelheid in een andere eenheid.',
    bouw(r, { gebied, eenheden }) {
      const grootte = Math.min(eenheden.length, r.volgende() < 0.5 ? 3 : 2);
      const start = r.geheel(0, eenheden.length - grootte), kol = eenheden.slice(start, start + grootte);
      const ratio = factor[kol[0]] / factor[kol[kol.length - 1]], max = Math.floor(gebied / ratio);
      if (!Number.isInteger(ratio) || max < 2) return null;
      const aantalRijen = Math.min(max, 3 + (r.volgende() < 0.4 ? 1 : 0));
      const bases = r.schud([...Array(max).keys()].map(i => i + 1)).slice(0, aantalRijen).sort((x, y) => x - y);
      const vol = bases.map(n => kol.map(e => (n * factor[kol[0]]) / factor[e]));
      if (!vol.flat().every(Number.isInteger)) return null;
      const gegeven = vol.map(() => r.geheel(0, kol.length - 1));
      const leeg = vol.map((rij, i) => rij.map((v, c) => (c === gegeven[i] ? v : null)));
      const antwoord = vol.map(rij => rij.map((v, c) => `${v} ${kol[c]}`).join(' = ')).join('; ');
      return {
        tekst: '', svg: tabel(kol, leeg), antwoordSvg: tabel(kol, leeg, vol), breed: true, antwoord, volledig: `Tabel: ${antwoord}`,
        getallen: vol.flat(), sleutel: `${kol.join()}:${bases.join()}:${gegeven.join()}`,
        kernen: bases.map(n => kernOmzet(maat, kol[0], kol[kol.length - 1], n * ratio, n)), moeilijkheid: [Math.log10(ratio), kol.length],
        data: { type: 'tabel-maat', maat, kolommen: kol, rijen: vol, gegeven },
      };
    },
  });

  /* ---- vraagstukje */
  const vraagstuk = vorm({
    id: 'vraagstuk', titel: 'Vraagstukje', kaart: kaarten.omzet, rang: 8, schaal: 0.67, keuzes: [THEMA_KEUZE],
    opdracht: 'Lees goed en los op. Schrijf het antwoord op de lijn.',
    bouw(r, { gebied, eenheden, opties }) {
      const lijst = objecten(opties.thema === 'gemengd' ? null : opties.thema);
      const past = (o, cm) => cm >= bereik(o)[0] * 0.9 && cm <= bereik(o)[1] * 1.1;
      if (r.volgende() < 0.3) {                                                 // twee voorwerpen vergelijken
        const o1 = kies(r, lijst), o2 = kies(r, lijst);
        if (o1 === o2 || !ctx.zelfdeSoort(o1, o2)) return null;
        const waarde = (o) => {
          const u = kies(r, eenheden), x = bereik(o)[0] + r.volgende() * (bereik(o)[1] - bereik(o)[0]), v = Math.round((x * factor[ctx.eenheid]) / factor[u]);
          return v >= 1 && v <= gebied && past(o, naarCtx(v, u)) ? { v, u, basis: v * factor[u], o } : null;
        };
        const l1 = waarde(o1), l2 = waarde(o2);
        if (!l1 || !l2 || l1.basis === l2.basis) return null;
        const winnaar = l1.basis > l2.basis ? l1 : l2;
        const zinnen = [l1, l2].map(l => ctx.zin(l.o, l.v, l.u)).join(' ');
        return {
          tekst: `${zinnen} ${ctx.superlatief(o1)}  ____`, breed: true, antwoord: winnaar.o.bepaald, volledig: `${zinnen} ${ctx.superlatief(o1)} ${winnaar.o.bepaald}`,
          getallen: [l1.v, l2.v], sleutel: `v${o1.onderwerp}${l1.v}${l1.u}/${o2.onderwerp}${l2.v}${l2.u}`, moeilijkheid: [1.5, 1],
          data: { type: 'vraag-vergelijk', maat, items: [l1, l2].map(l => ({ v: l.v, u: l.u, naam: l.o.bepaald })), winnaar: winnaar.o.bepaald },
        };
      }
      for (let t = 0; t < 30; t++) {                                             // omzetten in een context
        const k = omzetting(r, eenheden, gebied), o = kies(r, lijst);
        if (!k || !past(o, naarCtx(k.v, k.a))) continue;
        const naarLinks = r.volgende() < 0.5;
        const [gv, ge, vraag, antw] = naarLinks ? [k.v, k.a, k.b, k.w] : [k.w, k.b, k.a, k.v];
        const zin = `${ctx.zin(o, gv, ge)} Hoeveel ${vraag} is dat?`;
        return {
          tekst: `${zin}  ____ ${vraag}`, breed: true, antwoord: `${antw} ${vraag}`, volledig: `${zin} ${antw} ${vraag}`,
          getallen: [k.v, k.w], sleutel: `o${o.onderwerp}${k.v}${k.a}${naarLinks}`, familie: k.kern, kern: k.kern, moeilijkheid: [k.moeilijkheid, 1],
          data: { type: 'vraag-omzet', maat, v: k.v, a: k.a, w: k.w, b: k.b, naarLinks },
        };
      }
      return null;
    },
  });

  /* ---- welke eenheid past? */
  const eenheid = vorm({
    id: 'eenheid', titel: 'Welke eenheid past?', pictogram: 'omcirkelen', kaart: kaarten.ref, rang: 2, keuzes: [THEMA_KEUZE],
    opdracht: 'Welke maat past? Omcirkel de juiste eenheid.',
    bouw(r, { gebied, eenheden, opties }) {
      const items = cfg.referentie.filter(i => eenheden.includes(i.eenheid) && i.getal <= gebied && (opties.thema === 'gemengd' || i.thema === opties.thema));
      if (!items.length) return null;
      const item = kies(r, items);
      const andere = r.schud(eenheden.filter(e => e !== item.eenheid)).slice(0, 2);
      const keuze = [item.eenheid, ...andere].sort((x, y) => volgorde.indexOf(x) - volgorde.indexOf(y));
      const zin = cfg.refZin(item);
      return {
        tekst: `${zin}${NBSP.repeat(4)}Omcirkel:${NBSP.repeat(3)}${keuze.join(NBSP.repeat(5))}`, breed: true,
        antwoord: item.eenheid, volledig: zin.replace('____', item.eenheid), getallen: [item.getal], sleutel: `${item.onderwerp}${item.getal}${item.eenheid}`,
        moeilijkheid: [volgorde.length - volgorde.indexOf(item.eenheid), item.getal],
        data: { type: 'eenheid-maat', maat, getal: item.getal, eenheid: item.eenheid, opties: keuze },
      };
    },
  });

  const stelling = stellingVormen({
    prefix, doelen: Object.keys(kaarten.omzet), opties: optiesVan(kaarten.omzet), sample,
  });
  return [ordenen, ...stelling.slice(0, 3), tabelVorm, stelling[3], vraagstuk, eenheid];
}
