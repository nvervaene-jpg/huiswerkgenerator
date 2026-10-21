// Het palet van de blokjes-modus: kaarten per domein met chips, een live voorbeeld en een +-knop; ook te verslepen naar het blad.
import {
  bouwKaarten, domeinenVan, kaartZichtbaar, zichtbareChips, mogelijkeOpties, nieuweKaartStaat, voorbeeldOefening, aantalOpties, REKENGEBIEDEN,
} from './blokjes.js';

const BREEDTE_TEKST = { 1: 'kwart', 2: 'half', 4: 'vol' };
const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// opties: { vak, el, gebied() -> getal, voegToe(kaart, staat), voegHulpToe(spec) }
export function maakPalet({ vak, el, gebied, voegToe, voegHulpToe }) {
  const kaarten = bouwKaarten(vak);
  const toestand = { tab: 'hoofd', domein: '', zoek: '', staten: new Map(), seeds: new Map() };
  const staatVan = (k) => { const sleutel = `${k.tab}|${k.id}`; if (!toestand.staten.has(sleutel)) toestand.staten.set(sleutel, nieuweKaartStaat(vak, k)); return toestand.staten.get(sleutel); };
  const root = el('aside', { class: 'palet', 'aria-label': 'Blokjes' });

  function chipRij(label, knoppen) { return el('div', { class: 'chiprij' }, label ? el('span', { class: 'chiplabel' }, label) : '', ...knoppen); }
  const chip = (tekst, aan, klik, titel) => el('button', { type: 'button', class: 'chip' + (aan ? ' aan' : ''), title: titel || '', onclick: klik }, tekst);

  function maakKaart(k) {
    const staat = staatVan(k), g = gebied();
    const kaart = el('div', { class: 'kaart', draggable: 'true' });
    kaart.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ soort: 'kaart', id: k.id, tab: k.tab })); e.dataTransfer.effectAllowed = 'copy'; });
    const verander = () => { kaart.replaceWith(maakKaart(k)); };
    kaart.append(el('div', { class: 'kaartkop' },
      el('h4', {}, k.titel),
      el('span', { class: 'breedte', title: `Breedte op het blad: ${BREEDTE_TEKST[k.breedte]}` }, { 1: '¼', 2: '½', 4: '1' }[k.breedte]),
      el('button', { type: 'button', class: 'plus', title: 'Voeg dit blokje toe aan het blad', 'aria-label': `Voeg ${k.titel} toe`, onclick: () => voegToe(k, staat) }, '+')));
    if (k.vormen.length > 1) kaart.append(chipRij('Vorm', k.vormen.map(v => chip(v.label, staat.vorm === v.id, () => { staat.vorm = v.id; verander(); }))));
    for (const c of zichtbareChips(vak, k, staat, g)) {
      if (c.type === 'select') {
        const mogelijk = mogelijkeOpties(vak, k, staat, c, g) || [];
        if (!mogelijk.some(([w]) => w === staat.chips[c.sleutel])) staat.chips[c.sleutel] = mogelijk[0][0];
        if (mogelijk.length > 8) kaart.append(el('label', { class: 'chiprij' }, el('span', { class: 'chiplabel' }, c.label),
          el('select', { class: 'chipkeuze', onchange: (e) => { staat.chips[c.sleutel] = e.target.value; verander(); } }, ...mogelijk.map(([w, t]) => el('option', { value: w, selected: staat.chips[c.sleutel] === w }, t)))));
        else kaart.append(chipRij(c.label, mogelijk.map(([w, t]) => chip(t, staat.chips[c.sleutel] === w, () => { staat.chips[c.sleutel] = w; verander(); }))));
      } else if (c.type === 'tafels') {
        const gekozen = new Set(String(staat.chips[c.sleutel] || '').split(/[^0-9]+/).filter(Boolean).map(Number));
        const zet = (n) => { gekozen.has(n) ? gekozen.delete(n) : gekozen.add(n); if (!gekozen.size) gekozen.add(n); staat.chips[c.sleutel] = [...gekozen].sort((a, b) => a - b).join(', '); verander(); };
        kaart.append(chipRij('Tafels', [...Array(10)].map((_, i) => chip(String(i + 1), gekozen.has(i + 1), () => zet(i + 1)))));
      } else kaart.append(el('label', { class: 'chiprij' }, el('span', { class: 'chiplabel' }, c.label), el('input', { type: 'text', value: staat.chips[c.sleutel] ?? '', oninput: (e) => { staat.chips[c.sleutel] = e.target.value; } })));
    }
    const aantallen = aantalOpties(k);
    kaart.append(chipRij('Aantal', aantallen.map(n => chip(String(n), staat.aantal === n, () => { staat.aantal = n; verander(); }))));
    const seed = toestand.seeds.get(`${k.tab}|${k.id}`) || 1, o = voorbeeldOefening(vak, k, staat, g, seed);
    const box = el('div', { class: 'voorbeeldbox', title: 'Klik voor een ander voorbeeld', onclick: () => { toestand.seeds.set(`${k.tab}|${k.id}`, seed + 1); verander(); } });
    if (o) { box.append(el('div', { class: 'vb-tekst' }, o.tekst || '')); if (o.svg) { const t = el('div', { class: 'vb-tekening' }); t.innerHTML = o.svg.markup; box.append(t); } }
    else box.append(el('div', { class: 'vb-leeg' }, 'Met deze instellingen is hier geen voorbeeld mogelijk.'));
    kaart.append(box);
    return kaart;
  }

  function teken() {
    const g = gebied(), zoek = norm(toestand.zoek.trim());
    const domeinen = domeinenVan(vak, kaarten, toestand.tab);
    if (!domeinen.includes(toestand.domein)) toestand.domein = domeinen[0] || '';
    const lijst = kaarten.filter(k => k.tab === toestand.tab && (zoek ? norm(`${k.titel} ${k.domein} ${k.vormen.map(v => v.label).join(' ')}`).includes(zoek) : k.domein === toestand.domein) && kaartZichtbaar(vak, k, g));
    root.replaceChildren(
      el('div', { class: 'palet-tabs' },
        el('button', { type: 'button', class: 'tab' + (toestand.tab === 'hoofd' ? ' aan' : ''), onclick: () => { toestand.tab = 'hoofd'; teken(); } }, 'Blokjes'),
        el('button', { type: 'button', class: 'tab' + (toestand.tab === 'meer' ? ' aan' : ''), onclick: () => { toestand.tab = 'meer'; teken(); } }, 'Meer oefeningen')),
      el('input', { type: 'search', class: 'palet-zoek', placeholder: 'Zoek een blokje', value: toestand.zoek, oninput: (e) => { toestand.zoek = e.target.value; const pos = e.target.selectionStart; teken(); const nieuw = root.querySelector('.palet-zoek'); nieuw.focus(); nieuw.setSelectionRange(pos, pos); } }),
      zoek ? '' : el('div', { class: 'domeinen' }, ...domeinen.map(d => el('button', { type: 'button', class: 'domein' + (d === toestand.domein ? ' aan' : ''), onclick: () => { toestand.domein = d; teken(); } }, d))),
      el('div', { class: 'kaarten' }, ...(lijst.length ? lijst.map(maakKaart) : [el('p', { class: 'leeg' }, g ? `Geen blokjes die in een rekengebied tot ${g} iets kunnen opleveren${zoek ? ' bij deze zoekopdracht' : ' in dit domein'}.` : 'Geen blokjes gevonden.')])),
      hulpblokjes());
  }

  function hulpblokjes() {
    return el('div', { class: 'hulpblokjes' }, el('h4', {}, 'Hulpblokjes'),
      el('div', { class: 'chiprij' },
        el('button', { type: 'button', class: 'chip', title: 'Een zin die de leerkracht zelf typt, over de volle breedte', onclick: () => voegHulpToe({ hulp: 'instructie', breedte: 4 }) }, '+ Instructieregel'),
        el('button', { type: 'button', class: 'chip', title: 'Ruimte om te rekenen of te tekenen (halve breedte)', onclick: () => voegHulpToe({ hulp: 'blanco', breedte: 2, hoogte: 4 }) }, '+ Blanco blok ½'),
        el('button', { type: 'button', class: 'chip', title: 'Ruimte om te rekenen of te tekenen (volle breedte)', onclick: () => voegHulpToe({ hulp: 'blanco', breedte: 4, hoogte: 4 }) }, '+ Blanco blok 1'),
        el('button', { type: 'button', class: 'chip', title: 'Alles wat volgt begint op een nieuwe pagina', onclick: () => voegHulpToe({ hulp: 'pagina' }) }, '+ Nieuw blad')));
  }

  teken();
  return { element: root, teken, kaartVan: (id, tab) => kaarten.find(k => k.id === id && k.tab === tab), staatVan };
}

export { REKENGEBIEDEN };
