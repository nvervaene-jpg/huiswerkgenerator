import { VAKKEN } from '../subjects/index.js';
import { zetDoelen } from './doelregister.js';
import { LEERJAREN, laadDoelen, filterDoelen, groepeer, zoekTermen, markeer } from './doelen.js';
import { Leerlingen, GETALLENGEBIEDEN, leesNamen } from './storage.js';
import {
  planModel, losOp, modelUitCode, optiesVoor, verwijderOefening, vervangOefening, voegOefeningToe, blokOpnieuw, verwijderBlok, voegBlokToe, kopieer, keuzeGroep, STANDAARD,
  voegBlokjeToe, voegHulpToe, pasHulpAan, zetVoorbeeld, zetBreedte, verplaatsBlok, alleOpnieuw, modelVoorLeerling,
} from './blad-model.js';
import { maakPalet } from './blokjes-ui.js';
import { blokjeSpec, REKENGEBIEDEN } from './blokjes.js';
import { nieuweSeed } from './random.js';
import { tekstNaarCode } from './bladcode.js';
import { maakBladElement, maakAntwoordElement } from './blad-weergave.js';
import { LETTERTYPES, GROOTTES, LIJNEN, laadOpmaak, bewaarOpmaak } from './opmaak.js';
import { logoAfbeelding, zetLogo, herstelLogo } from './logo.js';
import { exporteerWord, drukAf } from '../export/browser.js';

const staat = {
  vak: null, data: null,
  leerjaar: 'L2', ookLager: 1, ookHoger: 1,
  domein: '', zoek: '', verdiepend: false, toonAlles: true,
  gekozen: new Set(),
  keuzes: {},                // extra keuzes per generator: { [generatorId]: { [keuzeId]: waarde } }
  geselecteerd: new Set(),   // leerlingen voor dit werkblad
  bladen: [],                // { leerling, blad }
  modus: null,               // 'doelen' (volgens Op.stap-doelen) of 'blokjes' (zelf samenstellen)
  gebied: 100, gebiedAangepast: false,   // 'Rekenen tot' in de blokjes-modus
  master: null, palet: null,             // blokjes-modus: het blad dat je opbouwt en het palet
};
const leerlingen = new Leerlingen();
const opmaak = laadOpmaak();

const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) e.append(kid);
  return e;
};
// Leerjaren die het gekozen vak kent (Nederlands heeft geen kleuterdoelen).
const leerjaren = () => (staat.vak && staat.vak.leerjaren ? LEERJAREN.filter(l => staat.vak.leerjaren.includes(l.id)) : LEERJAREN);
const leerjaarOpties = (gekozen) => leerjaren().map(l => el('option', { value: l.id, selected: l.id === gekozen }, l.naam));
const metGebied = () => !staat.vak || staat.vak.gebieden !== false;

/* ---------- stap 1 ---------- */
function tekenVakken() {
  $('vakken').replaceChildren(...VAKKEN.map(v => el('button', {
    class: 'vak' + (staat.vak === v ? ' gekozen' : ''),
    disabled: !v.actief, type: 'button',
    onclick: () => kiesVak(v),
  }, v.naam, v.actief ? '' : el('small', {}, 'binnenkort'))));
}

async function kiesVak(vak) {
  const data = await laadDoelen(vak);
  staat.vak = vak; staat.data = data; zetDoelen(data.doelen);
  staat.gekozen.clear(); staat.keuzes = {}; staat.zoek = ''; $('zoek').value = ''; staat.bladen = []; geschiedenis.length = 0; staat.master = null; staat.palet = null;
  staat.gebied = metGebied() ? Math.max(5, staat.gebied || 100) : 0;
  if (!leerjaren().some(l => l.id === staat.leerjaar)) staat.leerjaar = leerjaren()[Math.min(1, leerjaren().length - 1)].id;
  $('niveauNieuw').replaceChildren(...leerjaarOpties(leerjaren()[0].id));
  $('titel').placeholder = `Werkblad ${vak.naam.toLowerCase()}`;
  tekenVakken(); tekenFilters(); tekenDoelen(); tekenLeerlingen(); tekenBladen();
  $('melding').textContent = '';
  bepaalZichtbaarheid();
  if (staat.modus === 'blokjes') startBlokjes();
}

/* ---------- stap 2 en 3 ---------- */
function tekenFilters() {
  $('leerjaar').replaceChildren(...leerjaarOpties(staat.leerjaar));
  const bron = staat.toonAlles ? staat.data.doelen : staat.data.doelen.filter(d => d.echt);
  const domeinen = [...new Set(bron.map(d => d.domein))];
  if (!domeinen.includes(staat.domein)) staat.domein = '';
  $('domein').replaceChildren(el('option', { value: '' }, 'Alle domeinen'),
    ...domeinen.map(d => el('option', { value: d, selected: d === staat.domein }, d)));
}

function zichtbareLeerjaren() {
  const lijst = leerjaren(), i = lijst.findIndex(l => l.id === staat.leerjaar);
  return lijst.slice(Math.max(0, i - staat.ookLager), i + staat.ookHoger + 1).map(l => l.id);
}

const markeerNodes = (tekst, termen) => (termen.length ? markeer(tekst, termen).map(d => (d.mark ? el('mark', {}, d.tekst) : d.tekst)) : [tekst]);

function tekenDoelen() {
  const termen = zoekTermen(staat.zoek);
  const filter = {
    leerjaren: zichtbareLeerjaren(), domein: staat.domein, zoek: staat.zoek,
    routes: staat.verdiepend ? ['gemeenschappelijk', 'verdiepend'] : ['gemeenschappelijk'],
  };
  const lijst = filterDoelen(staat.data.doelen, { ...filter, alleenMetGenerator: !staat.toonAlles });
  const metGen = staat.data.doelen.filter(d => d.echt).length, metOpen = staat.data.doelen.filter(d => d.generators.length && !d.echt).length;
  $('zoekWis').hidden = !termen.length;
  $('teller').textContent = `${lijst.length} doelen getoond${termen.length ? ' (zoekresultaat uit alle leerjaren)' : ''} · ${metGen} van ${staat.data.doelen.length} doelen hebben automatische oefeningen en ${metOpen} enkel een open opdracht · ${staat.gekozen.size} aangevinkt`;
  const box = $('doelen');
  if (!lijst.length) {
    const zonder = termen.length && !staat.toonAlles ? filterDoelen(staat.data.doelen, { ...filter, alleenMetGenerator: false }).length : 0;
    box.replaceChildren(el('p', { class: 'leeg' }, termen.length
      ? `Geen doelen met automatische oefeningen gevonden voor "${staat.zoek.trim()}".` + (zonder ? ` Er zijn ${zonder} doelen met enkel een open opdracht die wel passen: vink "Toon ook doelen met enkel een open opdracht" aan om ze te zien.` : ' Probeer een ander woord, of verwijder het domein-filter.')
      : 'Geen doelen met automatische oefeningen voor deze keuze. Kies een ander leerjaar, toon ook lagere en hogere leerjaren of toon ook de doelen met enkel een open opdracht.'));
    return;
  }
  const delen = [];
  for (const g of groepeer(lijst)) {
    delen.push(el('h3', {}, g.subdomein, g.rubriek ? el('span', { class: 'rubriek' }, ' › ' + g.rubriek) : ''));
    for (const d of g.doelen) {
      delen.push(el('label', { class: 'doel' },
        el('input', { type: 'checkbox', checked: staat.gekozen.has(d.code), disabled: !d.generators.length, onchange: (e) => {
          e.target.checked ? staat.gekozen.add(d.code) : staat.gekozen.delete(d.code); tekenDoelen();
        } }),
        el('span', { class: 'code' }, ...markeerNodes(d.code, termen)),
        el('span', { class: 'tekst' }, ...markeerNodes(d.tekst, termen), d.generators.length && !d.echt ? el('span', { class: 'open-label', title: 'Voor dit doel is er een open opdracht: je beoordeelt zelf wat de leerling doet.' }, ' open opdracht') : ''),
        el('span', { class: 'lj' }, d.leerjaarLabel + (d.route === 'verdiepend' ? ' · verdiepend' : ''))));
    }
  }
  box.replaceChildren(...delen);
  tekenKeuzes();
}

const GROEP_TITELS = { breuken: 'Breuken: tekening en voorbeeld', 'verenkelen-verdubbelen': 'Verenkelen en verdubbelen', meervouden: 'Meervouden', leenwoorden: 'Leenwoorden', afkortingen: 'Afkortingen', tekens: 'Trema, koppelteken, accent en apostrof', bezit: "Bezit met 's", samenstellingen: 'Samenstellingen', klanken: 'Klanken en lettergroepen', hoofdletters: 'Hoofdletters: woorden en namen', 'hoofdletters-zinnen': 'Hoofdletters: zinnen', eindletters: 'Woorden eindigend op -d, -t, -p, -b', 'ww-ott': 'Werkwoorden: tegenwoordige tijd', 'ww-ovt': 'Werkwoorden: verleden tijd', 'ww-vd': 'Werkwoorden: voltooid deelwoord', 'ww-vp': 'Werkwoorden: voltooide tijd', 'ww-tt': 'Werkwoorden: toekomende tijd', verkleinwoorden: 'Verkleinwoorden', thema: 'Thema voor de zinnetjes', 'schrijven-plaatje': 'Schrijven met plaatjes', klok: 'Klok: nauwkeurigheid', geld: 'Geld: nauwkeurigheid van de bedragen' };
function tekenKeuzes() {
  const codes = [...staat.gekozen];
  const groepen = new Map();                                   // groep -> { titel, keuzes: Map(id -> keuze) }
  for (const g of staat.vak.generators) {
    if (!g.keuzes || !g.doelen.some(c => codes.includes(c))) continue;
    for (const k of g.keuzes) {
      const sleutel = keuzeGroep(g, k);
      if (!groepen.has(sleutel)) groepen.set(sleutel, { titel: GROEP_TITELS[sleutel] || g.titel, keuzes: new Map() });
      groepen.get(sleutel).keuzes.set(k.id, k);
    }
  }
  $('keuzes').replaceChildren(...(groepen.size ? [el('h3', { class: 'sub' }, 'Extra keuzes voor de oefeningen')] : []),
    ...[...groepen].map(([sleutel, { titel, keuzes }]) => el('fieldset', { class: 'keuzes' }, el('legend', {}, titel), ...[...keuzes.values()].map(k => {
      const huidig = (staat.keuzes[sleutel] || {})[k.id] ?? k.standaard;
      const zet = (w) => { (staat.keuzes[sleutel] ||= {})[k.id] = w; };
      return el('label', {}, k.label + ' ', k.type === 'select'
        ? el('select', { onchange: (e) => zet(e.target.value) }, ...k.opties.map(([w, t]) => el('option', { value: w, selected: w === huidig }, t)))
        : el('input', { type: 'text', value: huidig, oninput: (e) => zet(e.target.value) }));
    }))));
}

/* ---------- stap 4 en 5 ---------- */
function tekenLeerlingen() {
  const box = $('leerlingenLijst');
  if (!leerlingen.lijst.length) {
    box.replaceChildren(el('p', { class: 'leeg' }, 'Nog geen leerlingen. Voeg hierboven namen toe.'));
    return;
  }
  box.replaceChildren(...leerlingen.lijst.map(l => el('div', { class: 'leerling' + (staat.geselecteerd.has(l.id) ? ' aan' : '') },
    el('label', { class: 'naam' },
      el('input', { type: 'checkbox', checked: staat.geselecteerd.has(l.id), onchange: (e) => {
        e.target.checked ? staat.geselecteerd.add(l.id) : staat.geselecteerd.delete(l.id); bijLeerlingen();
      } }), l.naam),
    el('label', {}, 'Niveau ', el('select', { onchange: (e) => leerlingen.wijzig(l.id, { niveau: e.target.value }) }, ...leerjaarOpties(l.niveau))),
    el('label', { title: 'Hoeveel blokken (oefenvormen) per aangevinkt doel' }, 'Blokken per doel ', el('input', { type: 'number', min: 1, max: 8, value: l.blokken ?? STANDAARD.blokken, onchange: (e) => {
      const n = Math.min(8, Math.max(1, +e.target.value || 1)); e.target.value = n; leerlingen.wijzig(l.id, { blokken: n });
    } })),
    el('label', { title: 'Hoeveel oefeningen in elk blok' }, 'Oefeningen per blok ', el('input', { type: 'number', min: 1, max: 20, value: l.aantal, onchange: (e) => {
      const n = Math.min(20, Math.max(1, +e.target.value || 1)); e.target.value = n; leerlingen.wijzig(l.id, { aantal: n });
    } })),
    metGebied() ? el('label', {}, 'Getallengebied ', el('select', { onchange: (e) => leerlingen.wijzig(l.id, { gebied: +e.target.value }) },
      ...GETALLENGEBIEDEN.map(g => el('option', { value: g, selected: g === l.gebied }, 'tot ' + g)))) : '',
    el('button', { type: 'button', class: 'klein', title: 'Zet leerjaar en doelen van deze leerling bij de doelen', onclick: () => laadProfiel(l) }, 'Toon niveau en doelen'),
    el('button', { type: 'button', class: 'klein gevaar', onclick: () => {
      if (confirm(`${l.naam} verwijderen?`)) { leerlingen.verwijder(l.id); staat.geselecteerd.delete(l.id); tekenLeerlingen(); }
    } }, 'Verwijder'))));
}

function laadProfiel(l) {
  if (leerjaren().some(x => x.id === l.niveau)) staat.leerjaar = l.niveau;
  const codes = new Set(staat.data.doelen.map(d => d.code));
  staat.gekozen = new Set(l.doelen.filter(c => codes.has(c)));
  tekenFilters(); tekenDoelen();
  $('stap3').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- werkwijze ---------- */
function bepaalZichtbaarheid() {
  $('werkwijze').hidden = !staat.vak;
  $('wwDoelen').classList.toggle('gekozen', staat.modus === 'doelen');
  $('wwBlokjes').classList.toggle('gekozen', staat.modus === 'blokjes');
  document.body.classList.toggle('modus-blokjes', staat.modus === 'blokjes');
  document.querySelectorAll('[data-modus]').forEach((e) => {
    e.hidden = !(staat.vak && staat.modus && (e.dataset.modus === 'beide' || e.dataset.modus === staat.modus));
  });
  $('rekenenTot').parentElement.hidden = !metGebied();
}

function zetModus(modus) {
  if (staat.modus === modus) return;
  staat.modus = modus; staat.bladen = []; geschiedenis.length = 0; $('melding').textContent = ''; $('exportMelding').textContent = '';
  bepaalZichtbaarheid();
  if (modus === 'blokjes') startBlokjes(); else { staat.master = null; tekenBladen(); }
}

/* ---------- blokjes-modus ---------- */
const leegModel = () => ({ versie: 1, vak: staat.vak.id, gebied: staat.gebied, blokken: [] });

function startBlokjes(model = null) {
  staat.master = { model: model || leegModel() };
  if (model && metGebied() && model.gebied) staat.gebied = model.gebied;
  staat.palet = maakPalet({ vak: staat.vak, el, gebied: () => staat.gebied, voegToe: (kaart, kstaat) => kaartToevoegen(kaart, kstaat), voegHulpToe: (spec) => hulpToevoegen(spec) });
  $('paletBox').replaceChildren(staat.palet.element);
  tekenRekenenTot();
  herbouwBladen();
}

function tekenRekenenTot() {
  $('rekenenTot').replaceChildren(...REKENGEBIEDEN.map(g => el('option', { value: g, selected: g === staat.gebied }, `tot ${g}`)));
  $('sleutel').checked = !!opmaak.sleutel;
}

// Het blad dat je opbouwt (met knopjes) en, per gekozen leerling, hetzelfde blad met eigen getallen.
function herbouwBladen() {
  if (staat.modus !== 'blokjes' || !staat.master) return;
  const gekozen = leerlingen.lijst.filter(l => staat.geselecteerd.has(l.id));
  staat.bladen = [{ leerling: { id: 'master', naam: '' }, ctx: null, master: true, ...maakItem(staat.master.model) },
    ...gekozen.map(l => ({ leerling: l, ctx: null, ...maakItem(modelVoorLeerling(staat.vak, staat.master.model, l.id)) }))];
  tekenBladen();
}

function pasAanMaster(wijzig) {
  bewaarGeschiedenis();
  const model = kopieer(staat.master.model);
  if (wijzig(model) === false) { geschiedenis.pop(); $('exportMelding').textContent = 'Er zijn geen nieuwe oefeningen meer mogelijk voor dit blokje.'; return; }
  $('exportMelding').textContent = '';
  staat.master.model = model;
  herbouwBladen();
}

function kaartToevoegen(kaart, kstaat, positie) {
  pasAanMaster((m) => { voegBlokjeToe(staat.vak, m, blokjeSpec(staat.vak, kaart, kstaat, staat.gebied, nieuweSeed()), positie); });
}
function hulpToevoegen(spec, positie) { pasAanMaster((m) => { voegHulpToe(m, spec, positie); }); }

// stelt 'Rekenen tot' voor volgens het profiel van de gekozen leerlingen (zolang de leerkracht het niet zelf aanpaste)
function stelGebiedVoor() {
  if (staat.modus !== 'blokjes' || !metGebied() || staat.gebiedAangepast) return;
  const g = leerlingen.lijst.filter(l => staat.geselecteerd.has(l.id)).map(l => l.gebied).filter(Boolean);
  if (g.length) { staat.gebied = Math.max(...g); tekenRekenenTot(); staat.palet && staat.palet.teken(); }
}
function bijLeerlingen() { tekenLeerlingen(); if (staat.modus === 'blokjes') { stelGebiedVoor(); herbouwBladen(); } }

function bewaarBlad() {
  const item = staat.bladen.find(b => b.master) || staat.bladen[0];
  if (!item) { $('exportMelding').textContent = 'Er is nog geen blad om te bewaren.'; return; }
  download(`werkblad-${staat.vak.id}.json`, JSON.stringify({ type: 'werkbladgenerator-blad', versie: 1, vak: staat.vak.id, bladcode: item.blad.code, titel: opmaak.titel, boodschap: opmaak.boodschap }, null, 1));
}
async function openBladBestand(bestand) {
  try {
    const inhoud = JSON.parse(await bestand.text());
    if (inhoud.type !== 'werkbladgenerator-blad') throw new Error('Dit is geen bestand van de werkbladgenerator.');
    await laadBladcode(inhoud.bladcode);
    if (typeof inhoud.titel === 'string') { opmaak.titel = inhoud.titel; $('titel').value = inhoud.titel; }
    if (typeof inhoud.boodschap === 'string') { opmaak.boodschap = inhoud.boodschap; $('boodschap').value = inhoud.boodschap; }
    tekenBladen();
  } catch (err) { $('melding').textContent = 'Openen mislukt: ' + err.message; }
}
// Een blad dat via de doelen gemaakt is, in de blokjes-weergave verder aanpassen.
function naarBlokjes(i) {
  const model = kopieer(staat.bladen[i].model);
  staat.modus = 'blokjes'; staat.bladen = []; geschiedenis.length = 0;
  bepaalZichtbaarheid();
  startBlokjes(model);
}

/* ---------- blad ---------- */
// Elk item in staat.bladen: { leerling, model, blad, ctx } (ctx = instellingen waarmee het blad gemaakt werd)
const geschiedenis = [];
const bewaarGeschiedenis = () => {
  geschiedenis.push(JSON.stringify(staat.modus === 'blokjes' ? [staat.master.model] : staat.bladen.map(b => b.model)));
  if (geschiedenis.length > 30) geschiedenis.shift();
};

function maakBladen() {
  const meldingen = [];
  const doelCodes = [...staat.gekozen];
  const gekozenLeerlingen = leerlingen.lijst.filter(l => staat.geselecteerd.has(l.id));
  if (!doelCodes.length) meldingen.push('Vink eerst minstens één doel aan.');
  else if (!staat.vak.generators.some(g => g.doelen.some(c => doelCodes.includes(c)))) meldingen.push('Voor de aangevinkte doelen bestaat nog geen generator.');
  if (!gekozenLeerlingen.length) meldingen.push('Kies minstens één leerling.');
  if (meldingen.length) { $('melding').textContent = meldingen.join(' '); staat.bladen = []; tekenBladen(); return; }
  $('melding').textContent = '';
  geschiedenis.length = 0;
  staat.bladen = gekozenLeerlingen.map((l) => {
    leerlingen.wijzig(l.id, { doelen: doelCodes });
    const ctx = { doelen: doelCodes, keuzes: JSON.parse(JSON.stringify(staat.keuzes)), gebied: metGebied() ? l.gebied : 0, aantal: l.aantal, blokken: l.blokken ?? STANDAARD.blokken };
    return { leerling: l, ctx, ...maakItem(planModel(staat.vak, { ...ctx, seed: nieuweSeed() })) };
  });
  tekenBladen();
}

const maakItem = (model) => ({ model, blad: losOp(staat.vak, model) });
// Welke bladen worden afgedrukt of geëxporteerd: in de blokjes-modus de bladen van de gekozen leerlingen, anders het blad zelf.
const uitvoerIndexen = () => {
  const alle = staat.bladen.map((_, i) => i);
  if (staat.modus !== 'blokjes') return alle;
  const leerlingBladen = alle.filter(i => !staat.bladen[i].master);
  return leerlingBladen.length ? leerlingBladen : alle;
};
const items = () => uitvoerIndexen().map(i => ({ naam: staat.bladen[i].leerling.naam, blad: staat.bladen[i].blad }));

// Voert een aanpassing uit op het model van één blad, met mogelijkheid om ongedaan te maken.
function pasAan(i, wijzig) {
  if (staat.modus === 'blokjes') { pasAanMaster(wijzig); return; }
  bewaarGeschiedenis();
  const model = kopieer(staat.bladen[i].model);
  const gelukt = wijzig(model);
  if (gelukt === false) { geschiedenis.pop(); $('exportMelding').textContent = 'Er zijn geen nieuwe oefeningen meer mogelijk voor dit blok.'; return; }
  $('exportMelding').textContent = '';
  Object.assign(staat.bladen[i], maakItem(model));
  tekenBladen();
}

function ongedaanMaken() {
  const vorige = geschiedenis.pop();
  if (!vorige) return;
  const modellen = JSON.parse(vorige);
  if (staat.modus === 'blokjes') { staat.master.model = modellen[0]; herbouwBladen(); return; }
  modellen.forEach((m, i) => { if (staat.bladen[i]) Object.assign(staat.bladen[i], maakItem(m)); });
  tekenBladen();
}

function actiesVoor(i) {
  const blokjes = staat.modus === 'blokjes';
  if (blokjes && !staat.bladen[i].master) return null;                    // het blad van een leerling is enkel om te bekijken
  const { ctx } = staat.bladen[i];
  const vormen = ctx ? ctx.doelen.flatMap(doel => staat.vak.generators.filter(g => g.doelen.includes(doel)).map(g => [`${doel}|${g.id}`, `${doel} · ${g.titel}`])) : [];
  return {
    blokjes,
    weg: (bi, pos) => pasAan(i, m => verwijderOefening(staat.vak, m, bi, pos)),
    vervang: (bi, pos) => pasAan(i, m => vervangOefening(staat.vak, m, bi, pos)),
    extra: (bi) => pasAan(i, m => voegOefeningToe(staat.vak, m, bi)),
    blokOpnieuw: (bi) => pasAan(i, m => blokOpnieuw(staat.vak, m, bi, nieuweSeed())),
    blokWeg: (bi) => pasAan(i, m => verwijderBlok(m, bi)),
    voorbeeld: (bi) => pasAan(i, m => zetVoorbeeld(m, bi, !m.blokken[bi].vb)),
    ...(blokjes ? {
      breedte: (bi, w) => pasAan(i, m => zetBreedte(m, bi, w)),
      verplaats: (bi, delta) => pasAan(i, m => verplaatsBlok(m, bi, bi + delta)),
      hulpTekst: (bi, tekst) => pasAan(i, m => pasHulpAan(m, bi, { tekst })),
      hulpAanpas: (bi, wijziging) => pasAan(i, m => pasHulpAan(m, bi, wijziging)),
      drop: (data, bi, voor) => {
        const positie = voor ? bi : bi + 1;
        if (data.soort === 'blok') pasAan(i, m => verplaatsBlok(m, data.van, data.van < positie ? positie - 1 : positie));
        else if (data.soort === 'kaart') { const kaart = staat.palet.kaartVan(data.id, data.tab); if (kaart) kaartToevoegen(kaart, staat.palet.staatVan(kaart), Math.max(0, positie)); }
      },
      toevoegOpties: [],
    } : {
      voegBlok: (waarde) => {
        const [doel, vormId] = waarde.split('|');
        pasAan(i, m => voegBlokToe(staat.vak, m, { vormId, doel, seed: nieuweSeed(), aantal: ctx.aantal, opties: optiesVoor(staat.vak.generators.find(g => g.id === vormId), ctx.doelen, ctx.keuzes, doel) }));
      },
      toevoegOpties: vormen,
    }),
  };
}

async function tekenBladen() {
  const box = $('bladen');
  $('exportBalk').hidden = !staat.bladen.length;
  $('ongedaan').disabled = !geschiedenis.length;
  if (!staat.bladen.length) { box.replaceChildren(); return; }
  let logo;
  try { logo = await logoAfbeelding(opmaak.printLogo); }
  catch (err) { $('melding').textContent = err.message; return; }
  const metLeerlingen = staat.modus === 'blokjes' && staat.bladen.some(b => !b.master);
  const wraps = staat.bladen.map(({ leerling, blad, master }, i) => el('div', { class: 'blad-wrap' },
    staat.modus === 'blokjes' && metLeerlingen ? el('h3', { class: 'bladkop' }, master ? 'Jouw blad: hier bouw je het op. Elke leerling krijgt hetzelfde blad met eigen getallen.' : `Blad van ${leerling.naam}`) : '',
    maakBladElement(blad, leerling.naam, opmaak, logo, actiesVoor(i)),
    ...blad.waarschuwingen.map(w => el('p', { class: 'waarschuwing' }, `${leerling.naam ? leerling.naam + ' · ' : ''}${w}`)),
    el('div', { class: 'rij knoppen' },
      staat.bladen[i].ctx ? el('button', { type: 'button', class: 'klein', title: 'Maak voor deze leerling een volledig nieuw blad', onclick: () => {
        bewaarGeschiedenis();
        Object.assign(staat.bladen[i], maakItem(planModel(staat.vak, { ...staat.bladen[i].ctx, seed: nieuweSeed() })));
        tekenBladen();
      } }, `Helemaal nieuw blad voor ${leerling.naam || 'dit blad'}`) : '',
      staat.modus === 'doelen' ? el('button', { type: 'button', class: 'klein', title: 'Pas dit blad aan met blokjes: verslepen, extra blokjes, voorbeelden', onclick: () => naarBlokjes(i) }, 'Verder aanpassen met blokjes') : '',
      !(master && metLeerlingen) ? el('button', { type: 'button', class: 'klein', onclick: () => afdrukken([i]) }, 'Afdrukken of PDF van dit blad') : '')));
  if (opmaak.antwoordblad) wraps.push(el('div', { class: 'blad-wrap' }, maakAntwoordElement(items(), opmaak)));
  box.replaceChildren(...wraps);
}

function afdrukken(indexen) {
  const paginas = [...document.querySelectorAll('#bladen .blad')];
  const aantal = staat.bladen.length;
  const gekozen = indexen.map(i => paginas[i]);
  // het antwoordblad is de laatste pagina
  if (opmaak.antwoordblad && indexen.length === uitvoerIndexen().length) gekozen.push(paginas[aantal]);
  drukAf(gekozen);
}

async function exportWord() {
  const modus = document.querySelector('input[name=wordModus]:checked').value;
  $('exportMelding').textContent = 'Word-bestand wordt gemaakt…';
  try {
    await exporteerWord(items(), opmaak, modus, staat.vak.naam.toLowerCase());
    $('exportMelding').textContent = '';
  } catch (err) { console.error(err); $('exportMelding').textContent = 'Word-export mislukt: ' + err.message; }
}

// Opent een bladcode (ook van een ander vak) in de blokjes-weergave, zodat het blad meteen aangepast kan worden.
async function laadBladcode(code) {
  const vakId = tekstNaarCode(code).k;                                      // een code van een ander vak schakelt over naar dat vak
  const vak = VAKKEN.find(v => v.id === vakId && v.actief);
  if (vak && vak !== staat.vak) await kiesVak(vak);
  const { model, waarschuwing } = modelUitCode(staat.vak, code);
  geschiedenis.length = 0;
  staat.modus = 'blokjes'; staat.bladen = [];
  bepaalZichtbaarheid();
  startBlokjes(model);
  $('melding').textContent = waarschuwing || '';
}
async function openBladcode() {
  try { await laadBladcode($('bladcode').value); } catch (err) { $('melding').textContent = err.message; }
}

/* ---------- opmaak ---------- */
function koppelOpmaak() {
  $('lettertype').replaceChildren(...Object.entries(LETTERTYPES).map(([k, f]) => el('option', { value: k, selected: k === opmaak.lettertype }, f.naam)));
  $('grootte').replaceChildren(...Object.entries(GROOTTES).map(([k, pt]) => el('option', { value: k, selected: k === opmaak.grootte }, `${{ normaal: 'Normaal', groot: 'Groot', extragroot: 'Extra groot' }[k]} (${pt} pt)`)));
  $('lijnen').replaceChildren(...Object.entries(LIJNEN).map(([k, l]) => el('option', { value: k, selected: k === opmaak.lijnen }, `${l.naam} (${l.mm} mm)`)));
  $('toonDoel').checked = !!opmaak.toonDoel;
  $('printLogo').checked = opmaak.printLogo;
  const wijzig = (veld, waarde, bewaar = true) => { opmaak[veld] = waarde; if (bewaar) bewaarOpmaak(opmaak); tekenBladen(); };
  $('lettertype').addEventListener('change', e => wijzig('lettertype', e.target.value));
  $('grootte').addEventListener('change', e => wijzig('grootte', e.target.value));
  $('lijnen').addEventListener('change', e => wijzig('lijnen', e.target.value));
  $('toonDoel').addEventListener('change', e => wijzig('toonDoel', e.target.checked));
  $('printLogo').addEventListener('change', e => wijzig('printLogo', e.target.checked));
  $('antwoordblad').addEventListener('change', e => wijzig('antwoordblad', e.target.checked, false));
  $('boodschap').addEventListener('input', e => wijzig('boodschap', e.target.value, false));
  $('titel').addEventListener('input', e => wijzig('titel', e.target.value.trim(), false));
  $('logoBestand').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { zetLogo(r.result); tekenBladen(); };
    r.readAsDataURL(f); e.target.value = '';
  });
  $('logoHerstel').addEventListener('click', () => { herstelLogo(); tekenBladen(); });
  $('printAlles').addEventListener('click', () => afdrukken(uitvoerIndexen()));
  $('sleutel').addEventListener('change', e => wijzig('sleutel', e.target.checked, false));
  $('wordExport').addEventListener('click', exportWord);
}

/* ---------- koppelen ---------- */
function download(naam, tekst) {
  const a = el('a', { href: URL.createObjectURL(new Blob([tekst], { type: 'application/json' })), download: naam });
  a.click(); URL.revokeObjectURL(a.href);
}

function wisZoek() { staat.zoek = ''; $('zoek').value = ''; tekenDoelen(); $('zoek').focus(); }

function koppel() {
  $('leerjaar').addEventListener('change', e => { staat.leerjaar = e.target.value; tekenDoelen(); });
  $('zoek').addEventListener('input', e => { staat.zoek = e.target.value; tekenDoelen(); });
  $('zoek').addEventListener('keydown', e => { if (e.key === 'Escape') wisZoek(); });
  $('zoekWis').addEventListener('click', wisZoek);
  $('domein').addEventListener('change', e => { staat.domein = e.target.value; tekenDoelen(); });
  $('lager').addEventListener('change', e => { staat.ookLager = +e.target.value; tekenDoelen(); });
  $('hoger').addEventListener('change', e => { staat.ookHoger = +e.target.value; tekenDoelen(); });
  $('verdiepend').addEventListener('change', e => { staat.verdiepend = e.target.checked; tekenDoelen(); });
  $('toonAlles').addEventListener('change', e => { staat.toonAlles = e.target.checked; tekenFilters(); tekenDoelen(); });
  $('voegToe').addEventListener('click', () => {
    const nieuw = leerlingen.voegToe($('namen').value, $('niveauNieuw').value);
    const ingevoerd = leesNamen($('namen').value).length;
    nieuw.forEach(l => staat.geselecteerd.add(l.id));
    $('namen').value = '';
    $('ledenMelding').textContent = ingevoerd > nieuw.length ? `${ingevoerd - nieuw.length} naam/namen stonden er al en zijn overgeslagen.` : '';
    bijLeerlingen();
  });
  $('alles').addEventListener('click', () => { leerlingen.lijst.forEach(l => staat.geselecteerd.add(l.id)); bijLeerlingen(); });
  $('niemand').addEventListener('click', () => { staat.geselecteerd.clear(); bijLeerlingen(); });
  $('exporteer').addEventListener('click', () => download('leerlingen-werkbladgenerator.json', leerlingen.exporteer()));
  $('importeer').addEventListener('change', async (e) => {
    try { const n = leerlingen.importeer(await e.target.files[0].text()); $('ledenMelding').textContent = `${n} leerlingen ingelezen.`; tekenLeerlingen(); }
    catch (err) { $('ledenMelding').textContent = 'Inlezen mislukt: ' + err.message; }
    e.target.value = '';
  });
  koppelOpmaak();
  $('maak').addEventListener('click', maakBladen);
  $('opnieuw').addEventListener('click', maakBladen);
  $('ongedaan').addEventListener('click', ongedaanMaken);
  $('openCode').addEventListener('click', openBladcode);
  $('wwDoelen').addEventListener('click', () => zetModus('doelen'));
  $('wwBlokjes').addEventListener('click', () => zetModus('blokjes'));
  $('rekenenTot').addEventListener('change', (e) => { staat.gebied = +e.target.value; staat.gebiedAangepast = true; staat.palet && staat.palet.teken(); });
  $('bOpnieuw').addEventListener('click', () => pasAanMaster(m => alleOpnieuw(staat.vak, m, () => nieuweSeed())));
  $('bWis').addEventListener('click', () => { if (staat.master && staat.master.model.blokken.length && confirm('Alle blokjes van dit blad wissen?')) pasAanMaster(m => { m.blokken = []; }); });
  $('bBewaar').addEventListener('click', bewaarBlad);
  $('bOpen').addEventListener('change', (e) => { if (e.target.files[0]) openBladBestand(e.target.files[0]); e.target.value = ''; });
}

tekenVakken();
koppel();
tekenLeerlingen();
kiesVak(VAKKEN[0]).catch(err => { $('doelen').textContent = 'De doelen konden niet geladen worden: ' + err.message; });
