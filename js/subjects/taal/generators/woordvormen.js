// Gedeelde fabriek voor woordoefeningen waarbij een woord een afgeleide vorm krijgt
// (meervoud, verkleinwoord, ...). Elke familie levert een configuratie; de fabriek maakt er negen oefenvormen van:
// invullen, zin aanvullen, kies het juiste woord, juist of fout, regel herkennen, lettergrepen, verbinden, kleuren, fout zoeken.
//
// woord = { van, naar, delen[], lettergrepen, soort, frequent, fout }   (bv. man -> mannen, soort 'verdubbelen')
//
// cfg = {
//   prefix, doelen[], niveau: { doelcode: (woord) => boolean }   welke woorden bij welk doel passen
//   woorden[], soorten: [{ id, label, keuze }]                  label staat bij 'regel herkennen', keuze in de keuzelijst
//   keuzeGroep, keuzeLabel, alleLabel                            de extra keuze 'welke regel oefenen?'
//   verdeling: 'soort' | 'woord'                                 elke soort even vaak, of elk woord even vaak
//   naam: 'meervoud'                                             hoe de afgeleide vorm heet in de opdrachten
//   voor(w), na, teken, pijl                                     bv. 'één man' + ', ' + 'twee' + ' mannen'
//   zinnen[], hint(w), getalwoorden?                             zinnen met {w} (en eventueel {n})
//   regelTitel, regelOpdracht
//   Optioneel (voor oefeningen die niet op 'één man, twee mannen' lijken):
//   vraag(w), paar(w, x), kiesTekst(w, opties), zin(r, w, x) -> { tekst, n }, links(w), kleurLabel(w, x), rijtje(w, x)
//   invulOpdracht, zinOpdracht, verbindOpdracht   eigen opdrachttekst
//   verbeterTekst, kiesFoutTekst, kiesFoutAfsluit   eigen zinnen bij 'fout zoeken'
//   regelOpties(w, opties) -> soorten waaruit gekozen wordt in 'regel'
//   zonder: ['lettergrepen']   vormen die niet passen        regelSoorten: ['a', 'b']   soorten die in 'regel' mogen voorkomen
//   w.kern    sleutel om een zelfde woord/werkwoord niet twee keer op een blad te zetten (standaard w.van)
//   w.data    extra gegevens die in elke oefening meekomen voor de tests
// }
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from '../../wiskunde/generators/hulp.js';
import { woordenVerbinden, woordenVakjes } from '../svg.js';

const NBSP = ' ', BLANCO = '__________';
const kies = (r, lijst) => lijst[r.geheel(0, lijst.length - 1)];
const hoofdletter = (t) => t[0].toUpperCase() + t.slice(1);

export function maakWoordVormen(cfg) {
  const { prefix, doelen, naam } = cfg;
  const paar = cfg.paar || ((w, x) => `${cfg.voor(w)}${cfg.teken} ${cfg.na} ${x}`);
  const vraag = cfg.vraag || ((w) => `${cfg.voor(w)}${NBSP.repeat(3)}${cfg.pijl}${NBSP.repeat(3)}${cfg.na} ${BLANCO}`);
  const kiesTekst = cfg.kiesTekst || ((w, o) => `${cfg.voor(w)}${cfg.teken} ${cfg.na}${NBSP.repeat(3)}${o[0]}${NBSP.repeat(6)}of${NBSP.repeat(6)}${o[1]}`);
  const links = cfg.links || ((w) => w.van);
  const kleurLabel = cfg.kleurLabel || ((w, x) => `${w.van} - ${x}`);
  const rijtje = cfg.rijtje || ((w, x) => `${w.van} - ${x}`);
  const kernVan = (w) => w.kern ?? w.van;
  const regelSoorten = cfg.regelSoorten || cfg.soorten.map(s => s.id);
  const label = (id) => cfg.soorten.find(s => s.id === id).label;

  // regel: 'beide' (alle soorten), één soort of een lijst soorten (keuze 'meerdere')
  const zitInRegel = (w, regel) => (Array.isArray(regel) ? !regel.length || regel.includes(w.soort) : regel === 'beide' || w.soort === regel);
  const poolVoor = ({ doelen: codes, regel = 'beide' } = {}) => {
    const actief = codes && codes.length ? codes : doelen;
    return cfg.woorden.filter(w => actief.some(c => cfg.niveau[c] && cfg.niveau[c](w)) && zitInRegel(w, regel));
  };
  const soortenVoor = (codes) => {
    const ids = new Set(poolVoor({ doelen: codes }).map(w => w.soort));
    return cfg.soorten.filter(s => ids.has(s.id)).map(s => s.id);
  };

  const keuzes = [{
    id: 'regel', groep: cfg.keuzeGroep, label: cfg.keuzeLabel, ...(cfg.meerdere ? { type: 'multi', standaard: [], opties: cfg.soorten.map(s => [s.id, s.label]) } : { type: 'select', standaard: 'beide', opties: [['beide', cfg.alleLabel], ...cfg.soorten.map(s => [s.id, s.keuze])] }),
  }];

  function woord(r, pool) {
    if (cfg.verdeling === 'woord') return kies(r, pool);
    const soorten = [...new Set(pool.map(w => w.soort))];
    const soort = kies(r, soorten);
    return kies(r, pool.filter(w => w.soort === soort));
  }
  const basisOefening = (w, o) => ({
    getallen: [], kern: kernVan(w), familie: kernVan(w), sleutel: w.van, moeilijkheid: [w.lettergrepen, cfg.soorten.findIndex(s => s.id === w.soort)],
    ...o,
  });
  const gegevens = (w) => ({ van: w.van, naar: w.naar, delen: w.delen, soort: w.soort, ...(w.data || {}) });
  const zinMet = cfg.zin || ((r, w, invulling) => {
    const sjabloon = kies(r, cfg.zinnen), n = cfg.getalwoorden ? kies(r, cfg.getalwoorden) : '';
    return { n, tekst: sjabloon.replace('{n}', n).replace('{w}', invulling).replace(/ {2,}/g, ' ') };
  });

  function vorm({ id, titel, pictogram, opdracht, rang, schaal = 1, basis = false, bouw }) {
    return {
      id: `${prefix}-${id}`, titel, pictogram, opdracht, doelen, rang, schaal, basis, keuzes,
      opties: (doelCodes, eigen, doel) => {                        // het blok volgt het niveau van zijn eigen doel
        const codes = doel && cfg.niveau[doel] ? [doel] : doelCodes.filter(c => cfg.niveau[c]);
        const regel = eigen.regel || 'beide', soorten = soortenVoor(codes);
        return { doelen: codes, regel, soorten: Array.isArray(regel) && regel.length ? soorten.filter(x => regel.includes(x)) : soorten };
      },
      genereer({ seed, aantal, opties }) {
        const o = opties || {}, rng = maakRng(seed), pool = poolVoor(o);
        if (!pool.length) return { oefeningen: [], waarschuwing: 'Geen woorden beschikbaar voor deze keuze.' };
        const res = resultaat(trek(rng, aantal, (r) => bouw(r, pool, o)), aantal);
        if (res.waarschuwing) res.waarschuwing = `Er zijn maar ${res.oefeningen.length} verschillende oefeningen mogelijk met de woordenlijst voor deze keuze.`;
        return res;
      },
    };
  }

  const invullen = vorm({
    id: 'invullen', titel: cfg.invulTitel || `${hoofdletter(naam)} schrijven`, pictogram: 'schrijven', opdracht: cfg.invulOpdracht || `Schrijf het ${naam} op de lijn.`, rang: 1, basis: true,
    bouw: (r, pool) => {
      const w = woord(r, pool);
      return basisOefening(w, { tekst: vraag(w), breed: true, antwoord: w.naar, volledig: paar(w, w.naar), data: { type: 'tw-invullen', ...gegevens(w) } });
    },
  });

  const zin = vorm({
    id: 'zin', titel: 'Zin aanvullen', pictogram: 'schrijven', opdracht: cfg.zinOpdracht || `Schrijf het ${naam} van het woord tussen haakjes. Vul de zin aan.`, rang: 2, schaal: 0.84,
    bouw: (r, pool) => {
      const w = woord(r, pool), vraagZin = zinMet(r, w, `${BLANCO} ${cfg.hint(w)}`);
      const antwoordZin = vraagZin.tekst.replace(`${BLANCO} ${cfg.hint(w)}`, w.naar);
      return basisOefening(w, { tekst: vraagZin.tekst, breed: true, antwoord: w.naar, volledig: antwoordZin, data: { type: 'tw-zin', ...gegevens(w), n: vraagZin.n } });
    },
  });

  const kiesJuiste = vorm({
    id: 'kies', titel: 'Kies het juiste woord', pictogram: 'omcirkelen', opdracht: 'Welk woord is juist gespeld? Omcirkel het.', rang: 3,
    bouw: (r, pool) => {
      const w = woord(r, pool), juistEerst = r.volgende() < 0.5;
      const opties = juistEerst ? [w.naar, w.fout] : [w.fout, w.naar];
      return basisOefening(w, {
        tekst: kiesTekst(w, opties), breed: true, antwoord: w.naar,
        volledig: `${paar(w, w.naar)} (niet ${w.fout})`, data: { type: 'tw-kies', ...gegevens(w), opties, juist: juistEerst ? 0 : 1 },
      });
    },
  });

  const juistFout = vorm({
    id: 'juist-fout', titel: 'Juist of fout', pictogram: 'omcirkelen', opdracht: 'Is het woord juist gespeld? Omcirkel juist of fout.', rang: 3,
    bouw: (r, pool) => {
      const w = woord(r, pool), juist = r.volgende() < 0.5, getoond = juist ? w.naar : w.fout;
      return basisOefening(w, {
        tekst: `${paar(w, getoond)}${NBSP.repeat(8)}juist${NBSP.repeat(4)}fout`, breed: true, antwoord: juist ? 'juist' : 'fout',
        volledig: `${paar(w, getoond)}: ${juist ? 'juist' : `fout (juist is ${w.naar})`}`,
        moeilijkheid: [w.lettergrepen, cfg.soorten.findIndex(s => s.id === w.soort), juist ? 0 : 1],
        sleutel: `${w.van}|${juist}`, data: { type: 'tw-juistfout', ...gegevens(w), getoond, juist },
      });
    },
  });

  const regel = vorm({
    id: 'regel', titel: cfg.regelTitel, pictogram: 'omcirkelen', opdracht: cfg.regelOpdracht, rang: 4,
    bouw: (r, pool, o) => {
      const w = woord(r, pool), basis = cfg.regelOpties ? cfg.regelOpties(w, o) : o.soorten && o.soorten.length >= 2 ? o.soorten : cfg.soorten.map(s => s.id);
      const soorten = basis.filter(x => regelSoorten.includes(x));
      if (!soorten.includes(w.soort) || soorten.length < 2) return null;
      return basisOefening(w, {
        tekst: `${paar(w, w.naar)}${NBSP.repeat(6)}${soorten.map(label).join(NBSP.repeat(4))}`, breed: true, antwoord: label(w.soort),
        volledig: `${w.van} → ${w.naar}: ${label(w.soort)}`, data: { type: 'tw-regel', ...gegevens(w), soorten },
      });
    },
  });

  const lettergrepen = vorm({
    id: 'lettergrepen', titel: 'Lettergrepen', pictogram: 'schrijven', opdracht: `Schrijf het ${naam}. Zet een streepje tussen de lettergrepen.`, rang: 4,
    bouw: (r, pool) => {
      const w = woord(r, pool);
      return basisOefening(w, {
        tekst: vraag(w), breed: true, antwoord: w.delen.join('-'), volledig: `${paar(w, w.delen.join('-'))}`, data: { type: 'tw-lettergrepen', ...gegevens(w) },
      });
    },
  });

  const verbind = vorm({
    id: 'verbinden', titel: 'Verbinden', pictogram: 'verbinden', opdracht: cfg.verbindOpdracht || `Verbind elk woord met zijn ${naam}. Trek een lijn.`, rang: 5, schaal: 0.34,
    bouw: (r, pool) => {
      const gekozen = [];
      for (let t = 0; t < 60 && gekozen.length < 4; t++) {
        const w = woord(r, pool);
        if (!gekozen.some(g => kernVan(g) === kernVan(w) || g.naar === w.naar || links(g) === links(w))) gekozen.push(w);
      }
      if (gekozen.length < 4) return null;
      const orde = r.schud([0, 1, 2, 3]);
      const paren = gekozen.map((_, i) => [i, orde.indexOf(i)]);
      if (paren.every(([a, b]) => a === b)) return null;
      const lijnLinks = gekozen.map(links), rechts = orde.map(i => gekozen[i].naar);
      const antwoord = gekozen.map(w => `${links(w)} - ${w.naar}`).join('; ');
      return {
        tekst: '', svg: woordenVerbinden(lijnLinks, rechts, paren), antwoordSvg: woordenVerbinden(lijnLinks, rechts, paren, true), breed: true,
        antwoord, volledig: `Verbonden: ${antwoord}`, getallen: [], sleutel: [...lijnLinks].sort().join('/'), kernen: gekozen.map(kernVan),
        moeilijkheid: [Math.max(...gekozen.map(w => w.lettergrepen))], data: { type: 'tw-verbind', woorden: gekozen.map(gegevens) },
      };
    },
  });

  const kleuren = vorm({
    id: 'kleuren', titel: 'Kleuren', pictogram: 'kleuren', opdracht: `Kleur het vakje groen als het ${naam} juist gespeld is.`, rang: 6, schaal: 0.5,
    bouw: (r, pool) => {
      const gekozen = [];
      for (let t = 0; t < 60 && gekozen.length < 6; t++) {
        const w = woord(r, pool);
        if (!gekozen.some(g => kernVan(g) === kernVan(w))) gekozen.push(w);
      }
      if (gekozen.length < 6) return null;
      const juist = r.schud([0, 1, 2, 3, 4, 5]).slice(0, r.geheel(2, 4)).sort((a, b) => a - b);
      const getoond = gekozen.map((w, i) => (juist.includes(i) ? w.naar : w.fout)), teksten = gekozen.map((w, i) => kleurLabel(w, getoond[i]));
      return {
        tekst: '', svg: woordenVakjes(teksten), antwoordSvg: woordenVakjes(teksten, juist, true), breed: true,
        antwoord: juist.map(i => teksten[i]).join('; '), volledig: `Juist gespeld (groen): ${juist.map(i => teksten[i]).join('; ')}`,
        getallen: [], sleutel: gekozen.map(w => w.van).sort().join('/'), kernen: gekozen.map(kernVan),
        moeilijkheid: [Math.max(...gekozen.map(w => w.lettergrepen)), 1],
        data: { type: 'tw-kleuren', woorden: gekozen.map((w, i) => ({ ...gegevens(w), getoond: getoond[i], tekst: teksten[i], juist: juist.includes(i) })) },
      };
    },
  });

  const foutZoeken = vorm({
    id: 'fout-zoeken', titel: 'Fout zoeken en verbeteren', pictogram: 'omcirkelen', opdracht: 'Zoek de fout. Schrijf het juiste woord op de lijn.', rang: 7, schaal: 0.67,
    bouw: (r, pool) => {
      if (r.volgende() < 0.5) {                                              // een woord in een zin verbeteren
        const w = woord(r, pool), s = zinMet(r, w, `${w.fout} ${cfg.hint(w)}`);
        return basisOefening(w, {
          tekst: `${s.tekst}\n${cfg.verbeterTekst || `Het ${naam} is fout geschreven. Schrijf het juist:`} ${BLANCO}`, breed: true,
          antwoord: w.naar, volledig: `${w.fout} moet ${w.naar} zijn`, sleutel: `a${w.van}`,
          data: { type: 'tw-fout', variant: 'verbeter', woorden: [{ ...gegevens(w), getoond: w.fout }], fout: 0, juist: w.naar },
        });
      }
      const gekozen = [];                                                    // welke van de drie rijtjes is fout?
      for (let t = 0; t < 40 && gekozen.length < 3; t++) { const w = woord(r, pool); if (!gekozen.some(g => kernVan(g) === kernVan(w))) gekozen.push(w); }
      if (gekozen.length < 3) return null;
      const fout = r.geheel(0, 2), letters = ['a', 'b', 'c'];
      const rijtjes = gekozen.map((w, i) => `${letters[i]}) ${rijtje(w, i === fout ? w.fout : w.naar)}`);
      return {
        tekst: `${cfg.kiesFoutTekst || `Eén ${naam} is fout geschreven. Omcirkel het foute rijtje.`}\n${rijtjes.join('\n')}\n${cfg.kiesFoutAfsluit || `Het juiste ${naam}:`} ${BLANCO}`, breed: true,
        antwoord: `${rijtjes[fout]} → ${gekozen[fout].naar}`, volledig: `Fout: ${rijtjes[fout]}. Juist is ${gekozen[fout].naar}`,
        getallen: [], sleutel: `b${rijtjes.join('|')}`, kernen: gekozen.map(kernVan), moeilijkheid: [Math.max(...gekozen.map(w => w.lettergrepen)), 1],
        data: { type: 'tw-fout', variant: 'kies', woorden: gekozen.map((w, i) => ({ ...gegevens(w), getoond: i === fout ? w.fout : w.naar })), fout, juist: gekozen[fout].naar },
      };
    },
  });

  const zonder = new Set(cfg.zonder || []);
  const alle = { invullen, zin, kies: kiesJuiste, 'juist-fout': juistFout, regel, lettergrepen, verbinden: verbind, kleuren, 'fout-zoeken': foutZoeken };
  return { vormen: Object.entries(alle).filter(([id]) => !zonder.has(id)).map(([, v]) => v), woordenVoor: poolVoor, soortenVoor };
}

// Maakt woordobjecten uit een woordenlijst: { soortId: [[van, 'na-ar', frequent?], ...] }
export function leesWoorden(lijst, fout) {
  const uit = [];
  for (const [soort, regels] of Object.entries(lijst)) {
    for (const [van, delenTekst, frequent] of regels) {
      const delen = delenTekst.split('-'), naar = delen.join('');
      const w = { van, naar, delen, lettergrepen: delen.length, soort, frequent: !!frequent };
      w.fout = fout(w);
      uit.push(w);
    }
  }
  return uit;
}
