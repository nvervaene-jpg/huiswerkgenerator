// Maakt de oefeningen van een blok overzichtelijk voor het scherm, de PDF en Word:
//  - een vraag die in elke oefening hetzelfde begint, gaat naar de opdrachtzin
//  - een omcirkel-oefening toont enkel de keuzes (als vakjes), nooit ook een invullijn
//  - het aantal kolommen volgt uit hoe lang de oefeningen zijn en hoe groot de letters zijn
const NBSP = ' ';
const BLANCO = /_{3,}/g;
export const isKeuzeOpdracht = (opdracht) => /omcirkel|kies/i.test(opdracht) && !/schrijf|teken |kleur/i.test(opdracht);

const eersteRegel = (t) => String(t || '').split('\n')[0];

// 'Welk teken past?' dat in alle oefeningen staat, wordt één keer in de opdracht gezet.
function gemeenschappelijkeVraag(lijst) {
  if (lijst.length < 3 || lijst.some(o => typeof o.tekst !== 'string')) return '';
  const eerste = eersteRegel(lijst[0].tekst);
  let n = 0;
  while (n < eerste.length && lijst.every(o => eersteRegel(o.tekst)[n] === eerste[n])) n++;
  const stuk = eerste.slice(0, n), m = [...stuk.matchAll(/[?:.!] /g)].pop();
  if (!m) return '';
  const vraag = stuk.slice(0, m.index + 1);
  if (vraag.length < 8 || /\d/.test(vraag) || !/^[A-ZÀ-Ý]/.test(vraag)) return '';
  const rest = (o) => eersteRegel(o.tekst).slice(m.index + 2).trim();
  return lijst.every(o => rest(o)) ? vraag : '';
}

// Een slotvraag die in alle oefeningen hetzelfde is ('Is dit een situatie van … of …? ____') gaat ook naar de opdrachtzin.
function gemeenschappelijkeSlotvraag(lijst) {
  if (lijst.length < 3 || lijst.some(o => typeof o.tekst !== 'string' || o.tekst.includes('\n'))) return '';
  const slot = (o) => { const m = /([^.?!]*[?!.])\s*(?:_{3,})?\s*$/.exec(o.tekst.replace(/\s+$/, '')); return m ? m[1].trim() : ''; };
  const eerste = slot(lijst[0]);
  if (eerste.length < 15 || /\d/.test(eerste) || !lijst.every(o => slot(o) === eerste)) return '';
  return lijst.every(o => o.tekst.trim().length > eerste.length + 8) ? eerste : '';
}

// Splitst een oefening in de vraag en de keuzes. Herkent: 'a) 11   b) 12' (op één of op aparte regels), 'x   of   y', 'Omcirkel:  m   cm',
// '… juist   fout' en 'woord   optie   optie'. Geeft null als er geen keuzes in staan.
const SPATIES = /\s{3,}/;
export function splitsKeuze(tekst) {
  const regels = String(tekst || '').replace(/ /g, ' ').split('\n');
  const goed = (o) => o.length >= 2 && o.length <= 10 && o.every(x => x && x.length <= 90);
  const laatste = regels[regels.length - 1], voor = regels.slice(0, -1);
  const klaar = (vraag, opties) => (goed(opties) ? { vraag: [...voor, vraag].filter(x => x && x.trim()).join('\n').trim(), opties: opties.map(x => x.trim()) } : null);
  if (regels.length > 1 && regels.every((r, i) => i === 0 ? true : /^[a-d]\) /.test(r)) && regels.slice(1).length >= 2) return { vraag: regels[0].trim(), opties: regels.slice(1).map(x => x.trim()) };
  if (regels.length > 1 && regels.filter(r => /^[a-d]\) /.test(r)).length >= 2 && regels.every(r => /^[a-d]\) /.test(r))) return { vraag: '', opties: regels.map(x => x.trim()) };
  let m = /(?:^|\s{3,})(a\) .+)$/.exec(laatste);                              // a) 11     b) 12
  if (m) return klaar(laatste.slice(0, m.index), m[1].split(/\s{3,}(?=[a-d]\) )/));
  m = /^(.*?)\s{3,}Omcirkel:\s+(.+)$/.exec(laatste);                          // Omcirkel:   m     cm
  if (m) return klaar(m[1], m[2].split(SPATIES));
  m = /^(.*?)\s{4,}(juist)\s{3,}(fout)\s*$/.exec(laatste);                    // … juist    fout
  if (m) return klaar(m[1], [m[2], m[3]]);
  const delen = laatste.trim().split(SPATIES);
  const k = delen.indexOf('of');                                               // kussen      of      kusen
  if (k >= 1 && delen.length === k + 2) return klaar(delen.slice(0, k - 1).join('   '), [delen[k - 1], delen[k + 1]]);
  if (delen.length >= 2 && delen.length <= 10) {                              // woord      optie      optie, of enkel opties
    const eerste = /[\s,;:]/.test(delen[0]) && !/^[a-d]\) /.test(delen[0]);
    return (eerste && klaar(delen[0], delen.slice(1))) || klaar('', delen);
  }
  return null;
}

// De keuzes staan al in de vakjes: '(voormiddag of namiddag)' of '(juist of fout)' achter de vraag valt weg.
const zonderHint = (vraag, opties) => vraag.replace(/\s*\(([^()]+) of ([^()]+)\)/g, (m, a, b) => {
  const kaal = (x) => x.replace(/^[a-d]\) /, '').trim().toLowerCase(), set = new Set(opties.map(kaal));
  return (set.has('juist') && set.has('fout')) || (set.has(kaal(a)) && set.has(kaal(b))) ? '' : m;
});

function maakKeuzeOefening(o) {
  if (o.opties || typeof o.tekst !== 'string') return o;
  const k = splitsKeuze(o.tekst);
  if (!k) return o;
  const vraag = zonderHint(k.vraag, k.opties).replace(/\?\s*_{3,}\s*$/, '?').replace(BLANCO, '?');
  const juist = k.opties.findIndex(x => x === String(o.antwoord).trim());
  return { ...o, tekst: `${vraag}\n${k.opties.join(NBSP.repeat(5))}`, keuzeVraag: vraag, opties: k.opties, juist };
}

// lijst: de oefeningen van één blok; pool: alle oefeningen waaruit ze gekozen zijn. Wat verplaatst wordt naar de opdrachtzin, hangt van de hele pool af:
// zo verandert er niets aan de andere oefeningen als je er één weglaat of vervangt. Geeft { opdracht, oefeningen }.
export function netBlok(opdracht, lijst, pool = lijst) {
  let tekstOpdracht = String(opdracht || '').replace(/^(Kijk|Lees|Luister) goed\.\s*/, '');
  let oefeningen = lijst, alle = pool;
  if (isKeuzeOpdracht(tekstOpdracht)) { oefeningen = oefeningen.map(maakKeuzeOefening); alle = alle.map(maakKeuzeOefening); }
  const alsTekst = (o) => (o.keuzeVraag ? { ...o, tekst: o.keuzeVraag } : o);
  const vraag = gemeenschappelijkeVraag(alle.map(alsTekst));
  if (vraag) {
    if (!tekstOpdracht.includes(vraag)) tekstOpdracht = `${vraag} ${tekstOpdracht}`;
    const knip = (t) => { const regels = t.split('\n'); regels[0] = regels[0].slice(vraag.length).trim(); return regels.join('\n'); };
    oefeningen = oefeningen.map(o => ({ ...o, tekst: knip(o.tekst), ...(o.keuzeVraag ? { keuzeVraag: knip(o.keuzeVraag) } : {}) }));
    alle = alle.map(o => ({ ...o, tekst: knip(o.tekst), ...(o.keuzeVraag ? { keuzeVraag: knip(o.keuzeVraag) } : {}) }));
  }
  const slot = gemeenschappelijkeSlotvraag(alle);
  if (slot) {
    if (!tekstOpdracht.includes(slot)) tekstOpdracht = `${tekstOpdracht} ${slot}`;
    oefeningen = oefeningen.map((o) => {
      const gat = /_{3,}\s*$/.test(o.tekst), kaal = o.tekst.replace(/_{3,}\s*$/, '').replace(slot, '').replace(/\s{2,}/g, ' ').trim();
      return { ...o, tekst: gat ? `${kaal} ____` : kaal };
    });
  }
  return { opdracht: tekstOpdracht, oefeningen };
}

// Hoeveel kolommen (1, 2 of 3) voor een blok van de volle breedte, bij een lettergrootte van pt punten.
export function kolommenVoor(oefeningen, pt) {
  if (!oefeningen.length) return 1;
  const teken = pt * 0.183;                                       // gemiddelde letterbreedte in mm (Century Gothic)
  const breed = (o) => !!o.svg && (o.svg.breedte || 999) > 230;
  if (oefeningen.some(o => breed(o) || /^\s*_{8,}\s*$/m.test(o.tekst || ''))) return 1;
  const lengte = Math.max(...oefeningen.map(o => Math.max(...String(o.tekst || '').split('\n').map(r => r.replace(/\u00a0+/g, '  ').length))));
  const kolom = (n) => Math.floor((178 - n * 9 - (n - 1) * 6) / n / teken);   // tekens per kolom
  return lengte <= kolom(3) ? 3 : lengte <= kolom(2) ? 2 : 1;
}

export const letterVan = (i) => String.fromCharCode(97 + (i % 26));
