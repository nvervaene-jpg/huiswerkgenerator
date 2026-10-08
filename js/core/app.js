import { VAKKEN } from '../subjects/index.js';
import { LEERJAREN, laadDoelen, filterDoelen, groepeer } from './doelen.js';

const staat = {
  vak: null, data: null,
  leerjaar: 'L2', ookLager: 1, ookHoger: 1,
  domein: '', verdiepend: false, toonAlles: false,
  gekozen: new Set(),
};

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

function tekenVakken() {
  const box = $('vakken');
  box.replaceChildren(...VAKKEN.map(v => el('button', {
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

function tekenFilters() {
  const lj = $('leerjaar');
  lj.replaceChildren(...LEERJAREN.map(l => el('option', { value: l.id, selected: l.id === staat.leerjaar }, l.naam)));
  const domeinen = [...new Set(staat.data.doelen.map(d => d.domein))];
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
  const totaal = staat.data.doelen.length;
  const metGen = staat.data.doelen.filter(d => d.generators.length).length;
  $('teller').textContent = `${lijst.length} doelen getoond · ${metGen} van ${totaal} doelen hebben een generator · ${staat.gekozen.size} aangevinkt`;
  const box = $('doelen');
  if (!lijst.length) {
    box.replaceChildren(el('p', { class: 'leeg' },
      metGen === 0 ? 'Er zijn nog geen generators gekoppeld. Zet "Toon alle doelen" aan om de doelen te bekijken.' : 'Geen doelen gevonden voor deze keuze.'));
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

function koppel() {
  $('leerjaar').addEventListener('change', e => { staat.leerjaar = e.target.value; tekenDoelen(); });
  $('domein').addEventListener('change', e => { staat.domein = e.target.value; tekenDoelen(); });
  $('lager').addEventListener('change', e => { staat.ookLager = +e.target.value; tekenDoelen(); });
  $('hoger').addEventListener('change', e => { staat.ookHoger = +e.target.value; tekenDoelen(); });
  $('verdiepend').addEventListener('change', e => { staat.verdiepend = e.target.checked; tekenDoelen(); });
  $('toonAlles').addEventListener('change', e => { staat.toonAlles = e.target.checked; tekenDoelen(); });
}

tekenVakken();
koppel();
kiesVak(VAKKEN[0]).catch(err => {
  $('doelen').textContent = 'De doelen konden niet geladen worden: ' + err.message;
});
