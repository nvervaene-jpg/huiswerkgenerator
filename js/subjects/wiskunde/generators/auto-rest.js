// Begrippen bij statistiek (stb) en kans (knb), en decimale getallen vermenigvuldigen en delen via breuken (dbr).
// De doelen komen uit ../auto-doelen.js (zie ../classificatie.js).
import { maakOpgaveVormen } from '../../../core/opgave.js';
import { AUTO_DOELEN } from '../auto-doelen.js';
import * as K from '../classificatie.js';
import { staafdiagram, beelddiagram, lijngrafiek, cirkeldiagram } from '../svg-data.js';
import { tabel } from '../svg.js';

const kies = (r, l) => l[r.geheel(0, l.length - 1)];
const uniek = (lijst, antwoord) => [...new Set(lijst.filter(x => x !== undefined && x !== null && !Number.isNaN(x) && String(x) !== String(antwoord)))];
const opdracht = (invullen, kiezen = 'Kijk goed. Kies het juiste antwoord. Omcirkel.') => ({ invullen, kiezen, 'juist-fout': 'Staat het juiste antwoord erbij? Omcirkel juist of fout.' });
const mk = (vraag, svg, antwoord, fouten, kern, moeilijkheid, data) => ({ vraag, svg, sleutel: kern, antwoord: String(antwoord), fouten: uniek(fouten, antwoord).map(String), kern, moeilijkheid: [moeilijkheid], data });
const nl = (x) => String(x).replace('.', ',');
const DINGEN = ['appel', 'peer', 'banaan', 'kers', 'druif', 'citroen'];

/* ------------------------------------------------------------------ statistiek */
const diagram = (r, soort) => {
  const aantal = r.geheel(3, 4), cats = r.schud(DINGEN).slice(0, aantal);
  switch (soort) {
    case 'tabel': return tabel(['fruit', 'aantal'], cats.map(c => [c, String(r.geheel(2, 9))]));
    case 'beelddiagram': return beelddiagram({ titel: 'Fruit in de mand', cats, waarden: cats.map(() => r.geheel(1, 5) * 2), k: 2 });
    case 'staafdiagram': return staafdiagram({ titel: 'Fruit in de mand', cats, waarden: cats.map(() => r.geheel(1, 8)), stap: 2, max: 8 });
    case 'lijngrafiek': return lijngrafiek({ titel: 'Temperatuur', xs: ['ma', 'di', 'wo', 'do', 'vr'], waarden: [0, 1, 2, 3, 4].map(() => r.geheel(4, 18)), stap: 5, max: 20, ytitel: '°C' });
    default: { const p = kies(r, [[50, 25, 25], [40, 40, 20], [60, 30, 10], [25, 25, 50]]); return cirkeldiagram({ titel: 'Lievelingsfruit', cats: cats.slice(0, 3), procenten: p }); }
  }
};
const statistiekOpgave = (r, p) => {
  const soort = kies(r, p.types), data = { begrip3: 'stb', soort };
  if (soort === 'naam') {
    const s = kies(r, p.soorten), kinds = ['tabel', 'beelddiagram', 'staafdiagram', 'lijngrafiek', 'cirkeldiagram'].filter(k => ['tabel', 'beelddiagram', 'staafdiagram', 'lijngrafiek', 'cirkeldiagram'].indexOf(k) <= ['tabel', 'beelddiagram', 'staafdiagram', 'lijngrafiek', 'cirkeldiagram'].indexOf(s) + 1);
    const fout = r.schud([...kinds.filter(k => k !== s), 'plattegrond', 'tijdlijn']).slice(0, 2), svg = diagram(r, s);
    return mk('Hoe heet deze voorstelling? ____', svg, s, fout, `sn${s}${svg.markup.length}${svg.markup.slice(-80)}`, 1, { ...data, naam: s });
  }
  if (soort === 'assen') {
    const lijn = r.volgende() < 0.5, svg = lijn ? diagram(r, 'lijngrafiek') : diagram(r, 'staafdiagram'), verticaal = r.volgende() < 0.5;
    return mk(verticaal ? 'Hoe heet de lijn links met de getallen? ____' : 'Hoe heet de lijn onderaan met de namen? ____', svg, verticaal ? 'verticale as' : 'horizontale as', [verticaal ? 'horizontale as' : 'verticale as', 'titel'], `sa${verticaal}${lijn}${svg.markup.slice(-90)}`, 2, { ...data, verticaal, lijn });
  }
  if (soort === 'gemiddelde') {
    const n = r.geheel(3, 5), m = r.geheel(3, 12), afw = Array.from({ length: n - 1 }, () => r.geheel(-3, 3)), laatste = -afw.reduce((a, b) => a + b, 0), lijst = [...afw, laatste].map(x => m + x);
    if (lijst.some(x => x < 1) || new Set(lijst).size < 2) return null;
    const gesch = r.schud(lijst);
    return mk(`Het gemiddelde van ${gesch.join(', ')} is ____.`, null, m, [m + 1, m - 1, Math.max(...lijst), Math.min(...lijst), lijst.reduce((a, b) => a + b, 0)], `sg${gesch.join('.')}`, 2, { ...data, lijst: gesch, m });
  }
  const n = kies(r, [3, 5, 7]), lijst = Array.from({ length: n }, () => r.geheel(1, 20));
  if (new Set(lijst).size < n) return null;
  const gesorteerd = [...lijst].sort((a, b) => a - b), med = gesorteerd[(n - 1) / 2];
  return mk(`De mediaan van ${lijst.join(', ')} is ____.`, null, med, [gesorteerd[0], gesorteerd[n - 1], lijst[(n - 1) / 2], Math.round(lijst.reduce((a, b) => a + b, 0) / n)], `sm${lijst.join('.')}`, 3, { ...data, lijst, med });
};
export const STATISTIEKBEGRIP_VORMEN = maakOpgaveVormen({
  id: 'stb', titel: 'Begrippen bij statistiek', doelen: AUTO_DOELEN.stb || [], parameters: K.statistiekBegripParameters, standaard: { types: ['gemiddelde'], soorten: [], jaar: 5 },
  opdracht: opdracht('Kijk goed. Schrijf het antwoord op de lijn.'), opgave: statistiekOpgave, schaal: 1,
});

/* ------------------------------------------------------------------ kans */
const ZEKER = ['Na maandag komt dinsdag.', 'De zon komt morgen op.', 'Een steen valt naar beneden als je hem loslaat.', 'Water is nat.', 'Een week heeft zeven dagen.'];
const MOGELIJK = ['Het regent morgen.', 'Je gooit kop met een munt.', 'Je wint een spelletje.', 'Je trekt een rode knikker uit een zak met rode en blauwe knikkers.', 'Je ontmoet een vriend in de winkel.'];
const ONMOGELIJK = ['Een hond schrijft een brief.', 'Je loopt op het water zoals op de grond.', 'Een steen vliegt zelf weg.', 'Je gooit met een gewone dobbelsteen een 7.', 'Een fiets eet gras.'];
const DOBBEL = [['een even getal', (x) => x % 2 === 0], ['een oneven getal', (x) => x % 2 === 1], ['meer dan 4', (x) => x > 4], ['minder dan 3', (x) => x < 3], ['een 6', (x) => x === 6], ['een getal uit de tafel van 3', (x) => x % 3 === 0], ['meer dan 2', (x) => x > 2], ['een priemgetal', (x) => [2, 3, 5].includes(x)]];
const kansOpgave = (r, p) => {
  const soort = kies(r, p.types), data = { begrip3: 'knb', soort };
  if (soort === 'zeker3') {
    const g = kies(r, ['zeker', 'mogelijk', 'onmogelijk']), zin = kies(r, { zeker: ZEKER, mogelijk: MOGELIJK, onmogelijk: ONMOGELIJK }[g]);
    return mk(`${zin} Dit is ____.`, null, g, ['zeker', 'mogelijk', 'onmogelijk'].filter(x => x !== g), `kz${zin}`, 1, { ...data, zin, g });
  }
  if (soort === 'zeker2') {
    const zeker = r.volgende() < 0.5, zin = kies(r, zeker ? ZEKER : MOGELIJK);
    return mk(`${zin} Dit is een ____ gebeurtenis. (zekere of onzekere)`, null, zeker ? 'zekere' : 'onzekere', [zeker ? 'onzekere' : 'zekere'], `kv${zin}`, 1, { ...data, zin, zeker });
  }
  if (soort === 'waarsch') {
    const rood = r.geheel(1, 9), blauw = r.geheel(1, 9), kleur = kies(r, ['rood', 'blauw']), n = kleur === 'rood' ? rood : blauw, ander = kleur === 'rood' ? blauw : rood, antw = n > ander ? 'waarschijnlijk' : n < ander ? 'onwaarschijnlijk' : 'even waarschijnlijk';
    return mk(`In een zak zitten ${rood} rode en ${blauw} blauwe knikkers. Je trekt zonder te kijken één knikker. ${kleur[0].toUpperCase()}${kleur.slice(1)} trekken is ____.`, null, antw, ['waarschijnlijk', 'onwaarschijnlijk', 'even waarschijnlijk'].filter(x => x !== antw), `kw${rood}.${blauw}${kleur}`, 2, { ...data, rood, blauw, kleur });
  }
  if (soort === 'gunstig') {
    const [naam, f] = kies(r, DOBBEL), gunstig = [1, 2, 3, 4, 5, 6].filter(f).length;
    return r.volgende() < 0.5 ? mk(`Je gooit één keer met een dobbelsteen. Hoeveel gunstige uitkomsten zijn er voor "${naam}"? ____`, null, gunstig, [6 - gunstig, gunstig + 1, 6, 1].filter(x => x >= 1), `kg${naam}`, 3, { ...data, naam, gunstig, wat: 'aantal' })
      : mk(`Je gooit één keer met een dobbelsteen. De kans op "${naam}" is ____ op 6.`, null, gunstig, [6 - gunstig, gunstig + 1, 6, 1].filter(x => x >= 1), `kk${naam}`, 3, { ...data, naam, gunstig, wat: 'kans' });
  }
  const totaal = kies(r, [10, 20, 50]), k = r.geheel(2, totaal - 2);
  return mk(`Je gooit ${totaal} keer met een munt. ${k} keer valt het kop. De verhouding van de gunstige uitkomsten op het totaal is ____ / ${totaal}.`, null, k, [totaal - k, k + 1, k - 1, totaal].filter(x => x > 0), `ke${totaal}.${k}`, 3, { ...data, totaal, k });
};
export const KANSBEGRIP_VORMEN = maakOpgaveVormen({
  id: 'knb', titel: 'Begrippen bij kans', doelen: AUTO_DOELEN.knb || [], parameters: K.kansBegripParameters, standaard: { types: ['zeker3'], jaar: 3 },
  opdracht: opdracht('Lees goed. Schrijf het antwoord op de lijn.'), opgave: kansOpgave, schaal: 1.1,
});

/* ------------------------------------------------------------------ decimale getallen via breuken */
const decimaalBreukOpgave = (r, p) => {
  const soort = kies(r, p.types), a = r.geheel(2, 9), b = r.geheel(2, 9), data = { begrip3: 'dbr', soort };
  const v = r.geheel(0, 2);
  if (soort === 'maal') {
    if (v === 0) return mk(`${nl(a / 10)} × ${nl(b / 10)} = ${a}/10 × ${b}/10 = ____/100`, null, a * b, [a + b, a * b / 10, a * b * 10, a * b + 10].filter(x => Number.isFinite(x) && x > 0), `dm0.${a}.${b}`, 3, { ...data, wat: 'honderdsten', a, b });
    if (v === 1) return mk(`${nl(a / 10)} = ____/10`, null, a, [a * 10, a + 1, a - 1, 10].filter(x => x > 0), `dm1.${a}`, 2, { ...data, wat: 'tienden', a });
    return mk(`${nl(a / 10)} × ${nl(b / 10)} = ____`, null, nl((a * b) / 100), [nl((a * b) / 10), nl(a * b), nl((a + b) / 10), nl((a * b) / 1000)], `dm2.${a}.${b}`, 4, { ...data, wat: 'product', a, b });
  }
  const q = r.geheel(2, 9), d = r.geheel(2, 9);
  if (v === 0 || soort === 'maal') return null;
  if (v === 1) return mk(`${nl((q * d) / 10)} : ${nl(d / 10)} = ${q * d}/10 : ${d}/10 = ____`, null, q, [q * 10, q + 1, d, q * d].filter(x => x > 0), `dd1.${q}.${d}`, 4, { ...data, wat: 'breuken', q, d });
  return mk(`${nl((q * d) / 10)} : ${nl(d / 10)} = ____`, null, q, [q * 10, q / 10, d, q + 1].map(x => nl(x)), `dd2.${q}.${d}`, 5, { ...data, wat: 'quotient', q, d });
};
export const DECIMAALBREUK_VORMEN = maakOpgaveVormen({
  id: 'dbr', titel: 'Decimale getallen via breuken', doelen: AUTO_DOELEN.dbr || [], parameters: K.decimaalBreukParameters, standaard: { types: ['maal'], jaar: 5 },
  opdracht: opdracht('Reken uit. Schrijf het antwoord op de lijn.'), opgave: decimaalBreukOpgave,
});

export const AUTO_REST_VORMEN = [...STATISTIEKBEGRIP_VORMEN, ...KANSBEGRIP_VORMEN, ...DECIMAALBREUK_VORMEN];
