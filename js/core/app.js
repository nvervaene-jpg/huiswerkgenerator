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
import { laadSchemas, schemaKaart } from './schema.js';
import { laadLeesteksten } from './leesteksten.js';
import { logoAfbeelding, zetLogo, herstelLogo } from './logo.js';
import { exporteerWord, drukAf } from '../export/browser.js';

const staat = {
  vak: null, data: null,
  leerjaar: 'L2', gebied: 100, ookLager: 1, ookHoger: 1,
  zoek: '', verdiepend: false, toonOpen: false,
  gekozen: new Set(),        // aangevinkte doelen
  open: new Set(),           // uitgeklapte groepen in de lijst met doelen
  keuzes: {},                // extra keuzes per generator: { [groep]: { [keuzeId]: waarde } }
  geselecteerd: new Set(),   // leerlingen voor dit werkblad
  laatste: null,             // de leerling die het laatst werd aangevinkt: van hem/haar komen leerjaar en getallengebied
  bladen: [],                // { leerling, model, blad }: het blad dat je opbouwt en per gekozen leerling hetzelfde blad met eigen getallen
  tab: 'doelen',             // 'doelen' of 'blokjes'
  master: null, palet: null,
};
const leerlingen = new Leerlingen();
const opmaak = laadOpmaak();
laadLeesteksten();                                          // extra leesteksten uit assets/leesteksten, klaar voor het blad gemaakt wordt

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
const gekozenLeerlingen = () => leerlingen.lijst.filter(l => staat.geselecteerd.has(l.id));
// Welk getallengebied hoort bij welk leerjaar: buiten dit bereik tonen we een waarschuwing (je mag het wel zo laten).
const GEBIED_BEREIK = { K3: [5, 10], L1: [10, 20], L2: [20, 100], L3: [100, 1000], L4: [1000, 10000], L5: [1000, 10000], L6: [1000, 10000] };

/* ---------- vak, leerjaar en getallengebied ---------- */
function tekenVakken() {
  $('vakken').replaceChildren(...VAKKEN.map(v => el('button', {
    class: 'vak' + (staat.vak === v ? ' gekozen' : ''),
    disabled: !v.actief, type: 'button',
    onclick: () => kiesVak(v),
  }, el('span', {}, v.naam), v.actief ? '' : el('small', {}, 'binnenkort'))));
}

async function kiesVak(vak) {
  const data = await laadDoelen(vak);
  staat.vak = vak; staat.data = data; zetDoelen(data.doelen);
  staat.gekozen.clear(); staat.keuzes = {}; staat.zoek = ''; $('zoek').value = ''; staat.bladen = []; geschiedenis.length = 0; staat.open.clear();
  staat.gebied = metGebied() ? Math.max(5, staat.gebied || 100) : 0;
  if (!leerjaren().some(l => l.id === staat.leerjaar)) staat.leerjaar = leerjaren()[Math.min(1, leerjaren().length - 1)].id;
  $('titel').placeholder = `Werkblad ${vak.naam.toLowerCase()}`;
  $('gebiedVeld').hidden = !metGebied();
  tekenVakken(); tekenNiveau(); tekenLeerlingen();
  startBlokjes();
  tekenDoelen();
  $('melding').textContent = '';
}

function tekenNiveau() {
  $('leerjaar').replaceChildren(...leerjaarOpties(staat.leerjaar));
  $('rekenenTot').replaceChildren(...REKENGEBIEDEN.map(g => el('option', { value: g, selected: g === staat.gebied }, String(g))));
  const n = staat.geselecteerd.size, eerste = gekozenLeerlingen()[0];
  $('leerlingKnop').textContent = n === 0 ? 'Geen leerling' : n === 1 ? eerste.naam : `${n} leerlingen`;
  controleerNiveau();
}

function controleerNiveau() {
  const bereik = GEBIED_BEREIK[staat.leerjaar];
  const buiten = metGebied() && bereik && (staat.gebied < bereik[0] || staat.gebied > bereik[1]);
  const jaar = leerjaren().find(l => l.id === staat.leerjaar);
  $('niveauMelding').textContent = buiten ? `Let op: rekenen tot ${staat.gebied} past niet bij het ${jaar.naam.toLowerCase()} (gebruikelijk: tussen ${bereik[0]} en ${bereik[1]}). Je mag het zo laten.` : '';
}

// Het niveau staat maar op één plaats: hier. Is er precies één leerling gekozen, dan wordt diens profiel meteen bijgewerkt.
function wijzigNiveau(velden) {
  Object.assign(staat, velden);
  const gekozen = gekozenLeerlingen();
  if (gekozen.length === 1) {
    const profiel = {};
    if ('leerjaar' in velden) profiel.niveau = velden.leerjaar;
    if ('gebied' in velden && GETALLENGEBIEDEN.includes(velden.gebied)) profiel.gebied = velden.gebied;
    if (Object.keys(profiel).length) leerlingen.wijzig(gekozen[0].id, profiel);
  }
  tekenNiveau(); tekenDoelen();
  staat.palet && staat.palet.teken();
}

// Kies je een leerling met een profiel, dan worden leerjaar en getallengebied ingevuld (en blijven ze aanpasbaar).
function vulProfielIn(l) {
  if (!l) return;
  if (leerjaren().some(x => x.id === l.niveau)) staat.leerjaar = l.niveau;
  if (metGebied() && REKENGEBIEDEN.includes(l.gebied)) staat.gebied = l.gebied;
}

/* ---------- tabblad Doelen ---------- */
function zichtbareLeerjaren() {
  const lijst = leerjaren(), i = lijst.findIndex(l => l.id === staat.leerjaar);
  return lijst.slice(Math.max(0, i - staat.ookLager), i + staat.ookHoger + 1).map(l => l.id);
}

const markeerNodes = (tekst, termen) => (termen.length ? markeer(tekst, termen).map(d => (d.mark ? el('mark', {}, d.tekst) : d.tekst)) : [tekst]);
// De blokjes (oefenvormen) die bij een doel horen.
const blokjesVoorDoel = (code) => staat.vak.generators.filter(g => g.doelen.includes(code) && (staat.toonOpen || !g.open));

function groepsStaat(sleutel, termen) { return termen.length || staat.open.has(sleutel); }
function groep(klasse, sleutel, titel, aantal, termen, inhoud) {
  const d = el('details', { class: `groep ${klasse}`, open: groepsStaat(sleutel, termen) },
    el('summary', {}, titel, ' ', el('span', { class: 'aantal' }, `(${aantal})`)), ...inhoud);
  d.addEventListener('toggle', () => { if (termen.length) return; d.open ? staat.open.add(sleutel) : staat.open.delete(sleutel); });
  return d;
}

function tekenDoelen() {
  const termen = zoekTermen(staat.zoek);
  const filter = {
    leerjaren: zichtbareLeerjaren(), zoek: staat.zoek,
    routes: staat.verdiepend ? ['gemeenschappelijk', 'verdiepend'] : ['gemeenschappelijk'],
  };
  const lijst = filterDoelen(staat.data.doelen, { ...filter, alleenMetGenerator: !staat.toonOpen });
  $('teller').textContent = `${lijst.length} doelen${termen.length ? ' (zoekresultaat uit alle leerjaren)' : ''}`;
  $('gekozenTeller').textContent = staat.gekozen.size ? `${staat.gekozen.size} doel${staat.gekozen.size === 1 ? '' : 'en'} aangevinkt` : 'Vink doelen aan';
  $('stelVoor').disabled = !staat.gekozen.size;
  const box = $('doelen');
  if (!lijst.length) {
    box.replaceChildren(el('p', { class: 'leeg' }, termen.length
      ? `Geen doelen met blokjes gevonden voor "${staat.zoek.trim()}". Probeer een ander woord.`
      : 'Geen doelen met blokjes voor deze keuze. Kies een ander leerjaar of toon ook lagere en hogere leerjaren.'));
    tekenKeuzes();
    return;
  }
  const perDomein = new Map();
  for (const d of lijst) { if (!perDomein.has(d.domein)) perDomein.set(d.domein, []); perDomein.get(d.domein).push(d); }
  box.replaceChildren(...[...perDomein].map(([domein, doelen]) => groep('domein', domein, domein, doelen.length, termen,
    groepeer(doelen).map(g => groep('subdomein', `${domein}|${g.subdomein}|${g.rubriek || ''}`, g.rubriek ? `${g.subdomein} › ${g.rubriek}` : g.subdomein, g.doelen.length, termen,
      g.doelen.map(d => doelRegel(d, termen)))))));
  tekenKeuzes();
}

function doelRegel(d, termen) {
  const aan = staat.gekozen.has(d.code), blokjes = aan ? blokjesVoorDoel(d.code) : [];
  return el('div', { class: 'doel-blok' },
    el('label', { class: 'doel' + (aan ? ' gekozen' : '') },
      el('input', { type: 'checkbox', checked: aan, disabled: !d.generators.length, onchange: (e) => {
        e.target.checked ? staat.gekozen.add(d.code) : staat.gekozen.delete(d.code); tekenDoelen();
      } }),
      el('span', { class: 'tekst' }, ...markeerNodes(d.tekst, termen),
        d.generators.length && !d.echt ? el('span', { class: 'open-label', title: 'Voor dit doel is er een open opdracht: je beoordeelt zelf wat de leerling doet.' }, 'open opdracht') : '',
        el('span', { class: 'code' }, ...markeerNodes(d.code, termen)),
        d.leerjaar !== staat.leerjaar ? el('span', { class: 'lj' }, d.leerjaarLabel) : '', d.route === 'verdiepend' ? el('span', { class: 'lj' }, 'verdiepend') : '')),
    aan ? el('div', { class: 'doelblokjes' }, ...blokjes.map(g => el('div', { class: 'doelblokje' },
      el('span', { class: 'naam' }, g.titel),
      el('button', { type: 'button', class: 'plus', title: 'Voeg dit blokje toe aan het blad', 'aria-label': `Voeg ${g.titel} toe`, onclick: () => voegDoelBlokjeToe(g, d.code) }, '+')))) : '');
}

function voegDoelBlokjeToe(g, doel) {
  const [leerling] = gekozenLeerlingen();
  const aantal = (leerling && leerling.aantal) || STANDAARD.aantal;
  pasAanMaster(m => { voegBlokToe(staat.vak, m, { vormId: g.id, doel, seed: nieuweSeed(), aantal, opties: optiesVoor(g, [doel], staat.keuzes, doel) }); });
}

// Vult het blad automatisch met passende blokjes voor alle aangevinkte doelen.
function stelBladVoor() {
  const codes = [...staat.gekozen];
  if (!codes.length) { $('melding').textContent = 'Vink eerst minstens één doel aan.'; return; }
  if (!staat.vak.generators.some(g => g.doelen.some(c => codes.includes(c)))) { $('melding').textContent = 'Voor de aangevinkte doelen bestaat nog geen generator.'; return; }
  $('melding').textContent = '';
  const [leerling] = gekozenLeerlingen();
  gekozenLeerlingen().forEach(l => leerlingen.wijzig(l.id, { doelen: codes }));
  const model = planModel(staat.vak, {
    doelen: codes, keuzes: JSON.parse(JSON.stringify(staat.keuzes)), seed: nieuweSeed(), gebied: metGebied() ? staat.gebied : 0,
    aantal: (leerling && leerling.aantal) || STANDAARD.aantal, blokken: (leerling && leerling.blokken) || STANDAARD.blokken,
  });
  pasAanMaster(() => model, true);
  naarBlad();
}

const GROEP_TITELS = { breuken: 'Breuken: tekening en voorbeeld', 'verenkelen-verdubbelen': 'Verenkelen en verdubbelen', meervouden: 'Meervouden', leenwoorden: 'Leenwoorden', afkortingen: 'Afkortingen', tekens: 'Trema, koppelteken, accent en apostrof', bezit: "Bezit met 's", samenstellingen: 'Samenstellingen', klanken: 'Klanken en lettergroepen', hoofdletters: 'Hoofdletters: woorden en namen', 'hoofdletters-zinnen': 'Hoofdletters: zinnen', eindletters: 'Woorden eindigend op -d, -t, -p, -b', 'ww-ott': 'Werkwoorden: tegenwoordige tijd', 'ww-ovt': 'Werkwoorden: verleden tijd', 'ww-vd': 'Werkwoorden: voltooid deelwoord', 'ww-vp': 'Werkwoorden: voltooide tijd', 'ww-tt': 'Werkwoorden: toekomende tijd', verkleinwoorden: 'Verkleinwoorden', thema: 'Thema voor de zinnetjes', 'schrijven-plaatje': 'Schrijven met plaatjes', 'schrijven-zinnen': 'Schrijven: zinnen uitbreiden en verbinden', 'spelling-plaatje': 'Spelling met plaatjes', 'lezen-woorden': 'Woorden lezen', 'lezen-zinnen': 'Zinnen lezen', 'lezen-tekst': 'Tekst lezen', 'lezen-opbouw': 'Van woord naar tekst', klok: 'Klok: nauwkeurigheid', geld: 'Geld: nauwkeurigheid van de bedragen' };
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
      if (k.type === 'multi') {                                  // meerdere keuzes tegelijk; niets aangevinkt = alles
        const gekozen = new Set(Array.isArray(huidig) ? huidig : []);
        return el('div', { class: 'multikeuze' }, el('span', {}, k.label + ' (niets aangevinkt = alle)'), ...k.opties.map(([w, t]) => el('label', { class: 'multi' },
          el('input', { type: 'checkbox', checked: gekozen.has(w), onchange: (e) => { e.target.checked ? gekozen.add(w) : gekozen.delete(w); zet(k.opties.map(([x]) => x).filter(x => gekozen.has(x))); } }), ' ' + t)));
      }
      return el('label', {}, k.label + ' ', k.type === 'select'
        ? el('select', { onchange: (e) => zet(e.target.value) }, ...k.opties.map(([w, t]) => el('option', { value: w, selected: w === huidig }, t)))
        : el('input', { type: 'text', value: huidig, oninput: (e) => zet(e.target.value) }));
    }))));
}

function zetTab(tab) {
  staat.tab = tab;
  $('tabDoelen').classList.toggle('aan', tab === 'doelen'); $('tabDoelen').setAttribute('aria-selected', String(tab === 'doelen'));
  $('tabBlokjes').classList.toggle('aan', tab === 'blokjes'); $('tabBlokjes').setAttribute('aria-selected', String(tab === 'blokjes'));
  $('doelenTab').hidden = tab !== 'doelen'; $('blokjesTab').hidden = tab !== 'blokjes';
}

/* ---------- leerlingen (venster) ---------- */
function tekenLeerlingen() {
  const box = $('leerlingenLijst');
  if (!leerlingen.lijst.length) {
    box.replaceChildren(el('p', { class: 'leeg' }, 'Nog geen leerlingen. Voeg hierboven namen toe.'));
    return;
  }
  box.replaceChildren(...leerlingen.lijst.map(l => el('div', { class: 'leerling' + (staat.geselecteerd.has(l.id) ? ' aan' : '') },
    el('label', { class: 'naam' },
      el('input', { type: 'checkbox', checked: staat.geselecteerd.has(l.id), onchange: (e) => {
        if (e.target.checked) { staat.geselecteerd.add(l.id); staat.laatste = l.id; vulProfielIn(l); } else staat.geselecteerd.delete(l.id);
        bijLeerlingen();
      } }), l.naam),
    el('span', { class: 'niveau-tekst', title: 'Het niveau pas je aan bovenaan, bij Leerjaar en Tot' }, `${(LEERJAREN.find(x => x.id === l.niveau) || { naam: l.niveau }).naam}${metGebied() ? ` · tot ${l.gebied}` : ''}`),
    el('label', { title: 'Hoeveel blokken (oefenvormen) per aangevinkt doel bij "Stel blad voor"' }, 'Blokken per doel ', el('input', { type: 'number', min: 1, max: 8, value: l.blokken ?? STANDAARD.blokken, onchange: (e) => {
      const n = Math.min(8, Math.max(1, +e.target.value || 1)); e.target.value = n; leerlingen.wijzig(l.id, { blokken: n });
    } })),
    el('label', { title: 'Hoeveel oefeningen in elk blok bij "Stel blad voor"' }, 'Oefeningen per blok ', el('input', { type: 'number', min: 1, max: 20, value: l.aantal, onchange: (e) => {
      const n = Math.min(20, Math.max(1, +e.target.value || 1)); e.target.value = n; leerlingen.wijzig(l.id, { aantal: n });
    } })),
    el('button', { type: 'button', class: 'klein', title: 'Vink de doelen aan die deze leerling het laatst gebruikte', onclick: () => laadProfiel(l) }, 'Toon doelen'),
    el('button', { type: 'button', class: 'klein gevaar', onclick: () => {
      if (confirm(`${l.naam} verwijderen?`)) { leerlingen.verwijder(l.id); staat.geselecteerd.delete(l.id); bijLeerlingen(); }
    } }, 'Verwijder'))));
}

function laadProfiel(l) {
  const codes = new Set(staat.data.doelen.map(d => d.code));
  staat.gekozen = new Set(l.doelen.filter(c => codes.has(c)));
  zetTab('doelen'); tekenDoelen();
  $('leerlingenDialoog').close();
}

function bijLeerlingen() {
  tekenNiveau(); tekenLeerlingen(); tekenDoelen();
  laadInstellingen();
  staat.palet && staat.palet.teken();
  herbouwBladen();
}

/* ---------- het blad ---------- */
const leegModel = () => ({ versie: 1, vak: staat.vak.id, gebied: staat.gebied, blokken: [] });

function startBlokjes(model = null) {
  staat.master = { model: model || leegModel() };
  if (model && metGebied() && model.gebied) staat.gebied = model.gebied;
  staat.palet = maakPalet({ vak: staat.vak, el, gebied: () => staat.gebied, voegToe: (kaart, kstaat) => kaartToevoegen(kaart, kstaat), voegHulpToe: (spec) => hulpToevoegen(spec) });
  $('paletBox').replaceChildren(staat.palet.element);
  staat.paletVoor = null; staat.paletBewaard = false; laadInstellingen();
  tekenNiveau();
  $('sleutel').checked = !!opmaak.sleutel;
  herbouwBladen();
}

const maakItem = (model) => ({ model, blad: losOp(staat.vak, model) });

// Het blad dat je opbouwt (met knopjes) en, per gekozen leerling, hetzelfde blad met eigen getallen.
function herbouwBladen() {
  if (!staat.master) return;
  staat.bladen = [{ leerling: { id: 'master', naam: '' }, master: true, ...maakItem(staat.master.model) },
    ...gekozenLeerlingen().map(l => ({ leerling: l, ...maakItem(modelVoorLeerling(staat.vak, staat.master.model, l.id)) }))];
  tekenBladen();
}

const geschiedenis = [];
const bewaarGeschiedenis = () => {
  geschiedenis.push(JSON.stringify(staat.master.model));
  if (geschiedenis.length > 30) geschiedenis.shift();
};

function pasAanMaster(wijzig, vervang = false) {
  bewaarGeschiedenis();
  const model = vervang ? null : kopieer(staat.master.model);
  const nieuw = vervang ? wijzig() : (wijzig(model) === false ? false : model);
  if (nieuw === false) { geschiedenis.pop(); $('exportMelding').textContent = 'Er zijn geen nieuwe oefeningen meer mogelijk voor dit blokje.'; return; }
  $('exportMelding').textContent = '';
  staat.master.model = nieuw;
  herbouwBladen();
}

function kaartToevoegen(kaart, kstaat, positie) {
  pasAanMaster((m) => { voegBlokjeToe(staat.vak, m, blokjeSpec(staat.vak, kaart, kstaat, staat.gebied, nieuweSeed()), positie); });
  bewaarInstellingen(kaart);
}
// Is er precies één leerling gekozen, dan worden de instellingen van dit blokje onthouden als startwaarden voor diens volgende blad.
function bewaarInstellingen(kaart) {
  const gekozen = gekozenLeerlingen();
  if (gekozen.length !== 1 || !staat.palet) return;
  const [l] = gekozen, sleutel = `${staat.vak.id}|${kaart.tab}|${kaart.id}`;
  leerlingen.wijzig(l.id, { instellingen: { ...(l.instellingen || {}), [sleutel]: staat.palet.exporteer(kaart) } });
}
// Bij een andere enkele leerling krijgt het palet diens startwaarden (enkel die van dit vak).
function laadInstellingen() {
  if (!staat.palet) return;
  const gekozen = gekozenLeerlingen(), voor = gekozen.length === 1 ? gekozen[0].id : null;
  if (voor === staat.paletVoor) return;
  staat.paletVoor = voor;
  if (!voor) { if (staat.paletBewaard) { staat.palet.zetBewaard({}, ''); staat.paletBewaard = false; } return; }
  const l = gekozen[0], eigen = {};
  for (const [sl, w] of Object.entries(l.instellingen || {})) if (sl.startsWith(`${staat.vak.id}|`)) eigen[sl.slice(staat.vak.id.length + 1)] = w;
  staat.paletBewaard = Object.keys(eigen).length > 0;
  staat.palet.zetBewaard(eigen, l.naam);
}
function hulpToevoegen(spec, positie) { pasAanMaster((m) => { voegHulpToe(m, spec, positie); }); }

function ongedaanMaken() {
  const vorige = geschiedenis.pop();
  if (!vorige) return;
  staat.master.model = JSON.parse(vorige);
  herbouwBladen();
}

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
  } catch (err) { $('exportMelding').textContent = 'Openen mislukt: ' + err.message; }
}

// Welke bladen worden afgedrukt of geëxporteerd: de bladen van de gekozen leerlingen, anders het blad zelf.
const uitvoerIndexen = () => {
  const alle = staat.bladen.map((_, i) => i);
  const leerlingBladen = alle.filter(i => !staat.bladen[i].master);
  return leerlingBladen.length ? leerlingBladen : alle;
};
const items = () => uitvoerIndexen().map(i => ({ naam: staat.bladen[i].leerling.naam, blad: staat.bladen[i].blad }));

function actiesVoor(i) {
  if (!staat.bladen[i].master) return null;                  // het blad van een leerling is enkel om te bekijken
  const pas = (f) => pasAanMaster(f);
  return {
    blokjes: true,
    weg: (bi, pos) => pas(m => verwijderOefening(staat.vak, m, bi, pos)),
    vervang: (bi, pos) => pas(m => vervangOefening(staat.vak, m, bi, pos)),
    extra: (bi) => pas(m => voegOefeningToe(staat.vak, m, bi)),
    blokOpnieuw: (bi) => pas(m => blokOpnieuw(staat.vak, m, bi, nieuweSeed())),
    blokWeg: (bi) => pas(m => verwijderBlok(m, bi)),
    voorbeeld: (bi) => pas(m => zetVoorbeeld(m, bi, !m.blokken[bi].vb)),
    breedte: (bi, w) => pas(m => zetBreedte(m, bi, w)),
    verplaats: (bi, delta) => pas(m => verplaatsBlok(m, bi, bi + delta)),
    hulpTekst: (bi, tekst) => pas(m => pasHulpAan(m, bi, { tekst })),
    hulpAanpas: (bi, wijziging) => pas(m => pasHulpAan(m, bi, wijziging)),
    drop: (data, bi, voor) => {
      const positie = voor ? bi : bi + 1;
      if (data.soort === 'blok') pas(m => verplaatsBlok(m, data.van, data.van < positie ? positie - 1 : positie));
      else if (data.soort === 'kaart') { const kaart = staat.palet.kaartVan(data.id, data.tab); if (kaart) kaartToevoegen(kaart, staat.palet.staatVan(kaart), Math.max(0, positie)); }
    },
    toevoegOpties: [],
  };
}

const A4_PX = 794;                                          // 210 mm
function pasSchaalToe() {
  const vlak = $('bladvlak'), beschikbaar = vlak.clientWidth - 32;
  $('bladen').style.zoom = beschikbaar > 0 && beschikbaar < A4_PX ? String(beschikbaar / A4_PX) : '1';
}

async function tekenBladen() {
  const box = $('bladen');
  $('ongedaan').disabled = !geschiedenis.length;
  let logo;
  try { logo = await logoAfbeelding(opmaak.printLogo); }
  catch (err) { $('melding').textContent = err.message; return; }
  const metLeerlingen = staat.bladen.some(b => !b.master);
  const wraps = staat.bladen.map(({ leerling, blad, master }, i) => el('div', { class: 'blad-wrap' },
    metLeerlingen ? el('h3', { class: 'bladkop' }, master ? 'Jouw blad: hier bouw je het op. Elke leerling krijgt hetzelfde blad met eigen getallen.' : `Blad van ${leerling.naam}`) : '',
    maakBladElement(blad, leerling.naam, opmaak, logo, actiesVoor(i)),
    ...blad.waarschuwingen.map(w => el('p', { class: 'waarschuwing' }, `${leerling.naam ? leerling.naam + ' · ' : ''}${w}`))));
  if (opmaak.antwoordblad) wraps.push(el('div', { class: 'blad-wrap' }, maakAntwoordElement(items(), opmaak)));
  box.replaceChildren(...wraps);
  pasSchaalToe();
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

// Opent een bladcode (ook van een ander vak) zodat het blad meteen aangepast kan worden.
async function laadBladcode(code) {
  const vakId = tekstNaarCode(code).k;                                      // een code van een ander vak schakelt over naar dat vak
  const vak = VAKKEN.find(v => v.id === vakId && v.actief);
  if (vak && vak !== staat.vak) await kiesVak(vak);
  const { model, waarschuwing } = modelUitCode(staat.vak, code);
  geschiedenis.length = 0;
  startBlokjes(model);
  $('melding').textContent = waarschuwing || '';
}
async function openBladcode() {
  try { await laadBladcode($('bladcode').value); $('bladcodeDialoog').close(); naarBlad(); } catch (err) { $('exportMelding').textContent = err.message; $('bladcodeDialoog').close(); }
}

/* ---------- opmaak ---------- */
function koppelOpmaak() {
  $('lettertype').replaceChildren(...Object.entries(LETTERTYPES).map(([k, f]) => el('option', { value: k, selected: k === opmaak.lettertype }, f.naam)));
  $('grootte').replaceChildren(...Object.entries(GROOTTES).map(([k, pt]) => el('option', { value: k, selected: k === opmaak.grootte }, `${{ normaal: 'Normaal', groot: 'Groot', extragroot: 'Extra groot' }[k]} (${pt} pt)`)));
  $('lijnen').replaceChildren(...Object.entries(LIJNEN).map(([k, l]) => el('option', { value: k, selected: k === opmaak.lijnen }, `${l.naam} (${l.mm} mm)`)));
  $('toonDoel').checked = !!opmaak.toonDoel;
  laadSchemas().then(lijst => {                               // schema's uit assets/spellingschema; zonder schema's blijft 'Geen schema' over
    const zet = () => { opmaak.schemaKaart = schemaKaart(lijst, opmaak.schema); };
    $('schema').replaceChildren(el('option', { value: '' }, lijst.length ? 'Geen schema' : "Geen schema's in de map assets/spellingschema"), ...lijst.map(s => el('option', { value: s.id, selected: s.id === opmaak.schema }, s.titel)));
    $('schema').disabled = !lijst.length;
    zet(); tekenBladen();
    $('schema').addEventListener('change', e => { opmaak.schema = e.target.value; zet(); bewaarOpmaak(opmaak); tekenBladen(); });
  });
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
  $('wordExport').addEventListener('click', () => { sluitMenu(); exportWord(); });
}

/* ---------- menu, vensters en kleine schermen ---------- */
function sluitMenu() { $('meerMenu').hidden = true; $('meerKnop').setAttribute('aria-expanded', 'false'); }
const naarBlad = () => { if (window.matchMedia('(max-width: 1000px)').matches) { document.body.classList.add('toon-blad'); window.scrollTo(0, 0); } };

function download(naam, tekst) {
  const a = el('a', { href: URL.createObjectURL(new Blob([tekst], { type: 'application/json' })), download: naam });
  a.click(); URL.revokeObjectURL(a.href);
}

function wisZoek() { staat.zoek = ''; $('zoek').value = ''; tekenDoelen(); $('zoek').focus(); }

function koppel() {
  $('leerjaar').addEventListener('change', e => wijzigNiveau({ leerjaar: e.target.value }));
  $('rekenenTot').addEventListener('change', e => wijzigNiveau({ gebied: +e.target.value }));
  $('tabDoelen').addEventListener('click', () => zetTab('doelen'));
  $('tabBlokjes').addEventListener('click', () => zetTab('blokjes'));
  $('zoek').addEventListener('input', e => { staat.zoek = e.target.value; tekenDoelen(); });
  $('zoek').addEventListener('keydown', e => { if (e.key === 'Escape') wisZoek(); });
  $('lager').addEventListener('change', e => { staat.ookLager = +e.target.value; tekenDoelen(); });
  $('hoger').addEventListener('change', e => { staat.ookHoger = +e.target.value; tekenDoelen(); });
  $('verdiepend').addEventListener('change', e => { staat.verdiepend = e.target.checked; tekenDoelen(); });
  $('toonOpen').addEventListener('change', e => { staat.toonOpen = e.target.checked; tekenDoelen(); });
  $('stelVoor').addEventListener('click', stelBladVoor);

  // leerlingen
  $('leerlingKnop').addEventListener('click', () => { tekenLeerlingen(); $('leerlingenDialoog').showModal(); });
  $('leerlingenDialoog').addEventListener('close', tekenNiveau);
  $('voegToe').addEventListener('click', () => {
    const nieuw = leerlingen.voegToe($('namen').value, staat.leerjaar);
    const ingevoerd = leesNamen($('namen').value).length;
    nieuw.forEach(l => { leerlingen.wijzig(l.id, { gebied: GETALLENGEBIEDEN.includes(staat.gebied) ? staat.gebied : l.gebied }); staat.geselecteerd.add(l.id); });
    $('namen').value = '';
    $('ledenMelding').textContent = ingevoerd > nieuw.length ? `${ingevoerd - nieuw.length} naam/namen stonden er al en zijn overgeslagen.` : '';
    bijLeerlingen();
  });
  $('alles').addEventListener('click', () => { leerlingen.lijst.forEach(l => staat.geselecteerd.add(l.id)); bijLeerlingen(); });
  $('niemand').addEventListener('click', () => { staat.geselecteerd.clear(); bijLeerlingen(); });
  $('exporteer').addEventListener('click', () => { sluitMenu(); download('leerlingen-werkbladgenerator.json', leerlingen.exporteer()); });
  $('importeer').addEventListener('change', async (e) => {
    try { const n = leerlingen.importeer(await e.target.files[0].text()); $('exportMelding').textContent = `${n} leerlingen ingelezen.`; bijLeerlingen(); }
    catch (err) { $('exportMelding').textContent = 'Inlezen mislukt: ' + err.message; }
    e.target.value = ''; sluitMenu();
  });
  koppelOpmaak();

  // werkbalk en menu
  $('bOpnieuw').addEventListener('click', () => pasAanMaster(m => alleOpnieuw(staat.vak, m, () => nieuweSeed())));
  $('meerKnop').addEventListener('click', (e) => { e.stopPropagation(); const open = $('meerMenu').hidden; $('meerMenu').hidden = !open; $('meerKnop').setAttribute('aria-expanded', String(open)); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.meer')) sluitMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') sluitMenu(); });
  $('ongedaan').addEventListener('click', () => { sluitMenu(); ongedaanMaken(); });
  $('alleOpnieuw').addEventListener('click', () => { sluitMenu(); staat.gekozen.size ? stelBladVoor() : pasAanMaster(m => alleOpnieuw(staat.vak, m, () => nieuweSeed())); });
  $('openCodeKnop').addEventListener('click', () => { sluitMenu(); $('bladcodeDialoog').showModal(); $('bladcode').focus(); });
  $('openCode').addEventListener('click', openBladcode);
  $('bladcode').addEventListener('keydown', (e) => { if (e.key === 'Enter') openBladcode(); });
  $('bBewaar').addEventListener('click', () => { sluitMenu(); bewaarBlad(); });
  $('bOpen').addEventListener('change', (e) => { sluitMenu(); if (e.target.files[0]) openBladBestand(e.target.files[0]); e.target.value = ''; });
  $('bWis').addEventListener('click', () => { sluitMenu(); if (staat.master && staat.master.model.blokken.length && confirm('Alle blokjes van dit blad wissen?')) pasAanMaster(m => { m.blokken = []; }); });

  // kleine schermen: de kolommen komen onder elkaar
  $('toonBlad').addEventListener('click', () => { document.body.classList.add('toon-blad'); window.scrollTo(0, 0); });
  $('terugNaarInstellingen').addEventListener('click', () => { document.body.classList.remove('toon-blad'); });
  new ResizeObserver(pasSchaalToe).observe($('bladvlak'));
}

tekenVakken();
koppel();
tekenLeerlingen();
kiesVak(VAKKEN[0]).catch(err => { $('doelen').textContent = 'De doelen konden niet geladen worden: ' + err.message; });
