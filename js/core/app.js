import { VAKKEN } from '../subjects/index.js';
import { LEERJAREN, laadDoelen, filterDoelen, groepeer } from './doelen.js';
import { Leerlingen, GETALLENGEBIEDEN, leesNamen } from './storage.js';
import { bouwBlad, bladUitCode, generatorsVoorDoelen } from './worksheet.js';
import { nieuweSeed } from './random.js';
import { bladHtml } from './blad-weergave.js';

const staat = {
  vak: null, data: null,
  leerjaar: 'L2', ookLager: 1, ookHoger: 1,
  domein: '', verdiepend: false, toonAlles: false,
  gekozen: new Set(),
  geselecteerd: new Set(),   // leerlingen voor dit werkblad
  bladen: [],                // { leerling, blad }
};
const leerlingen = new Leerlingen();

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
const leerjaarNaam = (id) => (LEERJAREN.find(l => l.id === id) || {}).naam || id;
const leerjaarOpties = (gekozen) => LEERJAREN.map(l => el('option', { value: l.id, selected: l.id === gekozen }, l.naam));

/* ---------- stap 1 ---------- */
function tekenVakken() {
  $('vakken').replaceChildren(...VAKKEN.map(v => el('button', {
    class: 'vak' + (staat.vak === v ? ' gekozen' : ''),
    disabled: !v.actief, type: 'button',
    onclick: () => kiesVak(v),
  }, v.naam, v.actief ? '' : el('small', {}, 'binnenkort'))));
}

async function kiesVak(vak) {
  staat.vak = vak;
  staat.data = await laadDoelen(vak);
  staat.gekozen.clear();
  tekenVakken(); tekenFilters(); tekenDoelen();
}

/* ---------- stap 2 en 3 ---------- */
function tekenFilters() {
  $('leerjaar').replaceChildren(...leerjaarOpties(staat.leerjaar));
  const bron = staat.toonAlles ? staat.data.doelen : staat.data.doelen.filter(d => d.generators.length);
  const domeinen = [...new Set(bron.map(d => d.domein))];
  if (!domeinen.includes(staat.domein)) staat.domein = '';
  $('domein').replaceChildren(el('option', { value: '' }, 'Alle domeinen'),
    ...domeinen.map(d => el('option', { value: d, selected: d === staat.domein }, d)));
}

function zichtbareLeerjaren() {
  const i = LEERJAREN.findIndex(l => l.id === staat.leerjaar);
  return LEERJAREN.slice(Math.max(0, i - staat.ookLager), i + staat.ookHoger + 1).map(l => l.id);
}

function tekenDoelen() {
  const lijst = filterDoelen(staat.data.doelen, {
    leerjaren: zichtbareLeerjaren(), domein: staat.domein,
    routes: staat.verdiepend ? ['gemeenschappelijk', 'verdiepend'] : ['gemeenschappelijk'],
    alleenMetGenerator: !staat.toonAlles,
  });
  const metGen = staat.data.doelen.filter(d => d.generators.length).length;
  $('teller').textContent = `${lijst.length} doelen getoond · ${metGen} van ${staat.data.doelen.length} doelen hebben een generator · ${staat.gekozen.size} aangevinkt`;
  const box = $('doelen');
  if (!lijst.length) {
    box.replaceChildren(el('p', { class: 'leeg' },
      'Geen doelen met een generator voor deze keuze. Kies een ander leerjaar of toon ook lagere en hogere leerjaren.'));
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
        el('span', { class: 'code' }, d.code),
        el('span', { class: 'tekst' }, d.tekst),
        el('span', { class: 'lj' }, d.leerjaarLabel + (d.route === 'verdiepend' ? ' · verdiepend' : ''))));
    }
  }
  box.replaceChildren(...delen);
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
        e.target.checked ? staat.geselecteerd.add(l.id) : staat.geselecteerd.delete(l.id); tekenLeerlingen();
      } }), l.naam),
    el('label', {}, 'Niveau ', el('select', { onchange: (e) => leerlingen.wijzig(l.id, { niveau: e.target.value }) }, ...leerjaarOpties(l.niveau))),
    el('label', {}, 'Aantal ', el('input', { type: 'number', min: 1, max: 30, value: l.aantal, onchange: (e) => {
      const n = Math.min(30, Math.max(1, +e.target.value || 1)); e.target.value = n; leerlingen.wijzig(l.id, { aantal: n });
    } })),
    el('label', {}, 'Getallengebied ', el('select', { onchange: (e) => leerlingen.wijzig(l.id, { gebied: +e.target.value }) },
      ...GETALLENGEBIEDEN.map(g => el('option', { value: g, selected: g === l.gebied }, 'tot ' + g)))),
    el('button', { type: 'button', class: 'klein', title: 'Zet leerjaar en doelen van deze leerling in stap 2 en 3', onclick: () => laadProfiel(l) }, 'Toon niveau en doelen'),
    el('button', { type: 'button', class: 'klein gevaar', onclick: () => {
      if (confirm(`${l.naam} verwijderen?`)) { leerlingen.verwijder(l.id); staat.geselecteerd.delete(l.id); tekenLeerlingen(); }
    } }, 'Verwijder'))));
}

function laadProfiel(l) {
  staat.leerjaar = l.niveau;
  staat.gekozen = new Set(l.doelen);
  tekenFilters(); tekenDoelen();
  $('stap3').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- stap 6 ---------- */
function maakBladen(hergebruikSeeds = false) {
  const meldingen = [];
  const doelCodes = [...staat.gekozen];
  const { generatorIds, opties } = generatorsVoorDoelen(staat.vak, doelCodes);
  const gekozenLeerlingen = leerlingen.lijst.filter(l => staat.geselecteerd.has(l.id));
  if (!doelCodes.length) meldingen.push('Vink eerst minstens één doel aan (stap 3).');
  else if (!generatorIds.length) meldingen.push('Voor de aangevinkte doelen bestaat nog geen generator.');
  if (!gekozenLeerlingen.length) meldingen.push('Kies minstens één leerling (stap 4).');
  if (meldingen.length) { $('melding').textContent = meldingen.join(' '); $('bladen').replaceChildren(); staat.bladen = []; return; }
  $('melding').textContent = '';
  const titel = $('titel').value.trim() || undefined;
  staat.bladen = gekozenLeerlingen.map((l, i) => {
    const vorige = staat.bladen.find(b => b.leerling.id === l.id);
    const seed = hergebruikSeeds && vorige ? vorige.blad.instellingen.seed : nieuweSeed() + i;
    leerlingen.wijzig(l.id, { doelen: doelCodes });
    return { leerling: l, blad: bouwBlad(staat.vak, generatorIds, { seed, aantal: l.aantal, gebied: l.gebied, opties }, titel) };
  });
  tekenBladen();
}

function tekenBladen() {
  $('bladen').replaceChildren(...staat.bladen.map(({ leerling, blad }, i) => el('div', { class: 'blad-wrap' },
    el('article', { class: 'blad' }, ...(() => { const d = document.createElement('div'); d.innerHTML = bladHtml(blad, leerling.naam); return [...d.childNodes]; })()),
    ...blad.blokken.filter(b => b.waarschuwing).map(b => el('p', { class: 'waarschuwing' }, `${leerling.naam ? leerling.naam + ': ' : ''}${b.waarschuwing}`)),
    el('button', { type: 'button', class: 'klein', onclick: () => {
      const l = leerling;
      staat.bladen[i] = { leerling: l, blad: bouwBlad(staat.vak, blad.instellingen.generatorIds,
        { ...blad.instellingen, seed: nieuweSeed() }, blad.titel) };
      tekenBladen();
    } }, `Nieuwe getallen voor ${leerling.naam}`))));
}

function openBladcode() {
  try {
    const blad = bladUitCode(staat.vak, $('bladcode').value);
    staat.bladen = [{ leerling: { id: 'code', naam: '' }, blad }];
    $('melding').textContent = '';
    tekenBladen();
  } catch (err) { $('melding').textContent = err.message; }
}

/* ---------- koppelen ---------- */
function download(naam, tekst) {
  const a = el('a', { href: URL.createObjectURL(new Blob([tekst], { type: 'application/json' })), download: naam });
  a.click(); URL.revokeObjectURL(a.href);
}

function koppel() {
  $('leerjaar').addEventListener('change', e => { staat.leerjaar = e.target.value; tekenDoelen(); });
  $('domein').addEventListener('change', e => { staat.domein = e.target.value; tekenDoelen(); });
  $('lager').addEventListener('change', e => { staat.ookLager = +e.target.value; tekenDoelen(); });
  $('hoger').addEventListener('change', e => { staat.ookHoger = +e.target.value; tekenDoelen(); });
  $('verdiepend').addEventListener('change', e => { staat.verdiepend = e.target.checked; tekenDoelen(); });
  $('toonAlles').addEventListener('change', e => { staat.toonAlles = e.target.checked; tekenFilters(); tekenDoelen(); });
  $('niveauNieuw').replaceChildren(...leerjaarOpties('L1'));
  $('voegToe').addEventListener('click', () => {
    const nieuw = leerlingen.voegToe($('namen').value, $('niveauNieuw').value);
    const ingevoerd = leesNamen($('namen').value).length;
    nieuw.forEach(l => staat.geselecteerd.add(l.id));
    $('namen').value = '';
    $('ledenMelding').textContent = ingevoerd > nieuw.length ? `${ingevoerd - nieuw.length} naam/namen stonden er al en zijn overgeslagen.` : '';
    tekenLeerlingen();
  });
  $('alles').addEventListener('click', () => { leerlingen.lijst.forEach(l => staat.geselecteerd.add(l.id)); tekenLeerlingen(); });
  $('niemand').addEventListener('click', () => { staat.geselecteerd.clear(); tekenLeerlingen(); });
  $('exporteer').addEventListener('click', () => download('leerlingen-werkbladgenerator.json', leerlingen.exporteer()));
  $('importeer').addEventListener('change', async (e) => {
    try { const n = leerlingen.importeer(await e.target.files[0].text()); $('ledenMelding').textContent = `${n} leerlingen ingelezen.`; tekenLeerlingen(); }
    catch (err) { $('ledenMelding').textContent = 'Inlezen mislukt: ' + err.message; }
    e.target.value = '';
  });
  $('maak').addEventListener('click', () => maakBladen(false));
  $('opnieuw').addEventListener('click', () => maakBladen(false));
  $('openCode').addEventListener('click', openBladcode);
}

tekenVakken();
koppel();
tekenLeerlingen();
kiesVak(VAKKEN[0]).catch(err => { $('doelen').textContent = 'De doelen konden niet geladen worden: ' + err.message; });
