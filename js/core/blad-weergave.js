// Werkblad als A4-pagina in de browser (voorbeeld en afdrukken).
import { pictogram } from './icons.js';
import { LETTERTYPES, GROOTTES } from './opmaak.js';
import { voorbeeldDelen, doelTeksten } from './blad-model.js';
import { rasterVoor, isSimpel, splitOpgave, BLOK_MM, GAT_RE, letterVan } from './blad-netjes.js';

const maak = (tag, klasse, tekst) => {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
};

function pagina(opmaak, extraKlasse = '') {
  const a = maak('article', 'blad ' + extraKlasse);
  a.dataset.lijnen = opmaak.lijnen || 'normaal';
  a.style.fontFamily = LETTERTYPES[opmaak.lettertype].css;
  a.style.fontSize = GROOTTES[opmaak.grootte] + 'pt';
  return a;
}

const knop = (tekst, titel, klik, klasse = '') => {
  const k = maak('button', `bewerkknop ${klasse}`, tekst);
  k.type = 'button'; k.title = titel; k.addEventListener('click', klik);
  return k;
};

const BREEDTE_TEKST = { 1: '¼', 2: '½', 4: '1' };

// Antwoord van een oefening in delen met kleur: het voorbeeld in het blauw, de antwoordsleutel in het rood.
function vulDelen(li, o, sleutel) {
  const delen = o.voorbeeldDelen || (sleutel && o.tekst && o.tekst.includes('____') ? voorbeeldDelen(o) : null);
  if (!delen) return false;
  const t = maak('div', 'tekst kort');
  for (const d of delen) t.append(d.blauw ? maak('span', o.voorbeeld ? 'vb-antw' : 'sleutel-antw', d.t) : document.createTextNode(d.t));
  li.append(t);
  return true;
}

// Een regel die enkel uit streepjes bestaat, is een schrijflijn: die krijgt de gekozen lijnafstand (smal, normaal of ruim).
export const isSchrijflijn = (regel) => /^\s*_{8,}\s*$/.test(regel);
// Een invulplaats (____) wordt een ruime lijn waar met de hand in geschreven kan worden.
const GAT = /(?<!_)_{4,7}(?!_)/;
function metGaten(tekst) {
  const delen = String(tekst).split(new RegExp(GAT.source, 'g'));
  const uit = [];
  delen.forEach((d, i) => { if (i) uit.push(maak('span', 'gat')); if (d) uit.push(document.createTextNode(d)); });
  return uit;
}
function tekstMetLijnen(tekst) {
  const regels = tekst.split('\n');
  if (!regels.some(isSchrijflijn)) { const t = maak('div', 'tekst' + (tekst.length <= 22 ? ' kort' : '')); t.append(...metGaten(tekst)); return t; }
  const t = maak('div', 'tekst');
  let tekstregels = [];
  const leegMaken = () => { if (tekstregels.length) { const d = maak('div', 'tekstdeel'); d.append(...metGaten(tekstregels.join('\n'))); t.append(d); tekstregels = []; } };
  for (const r of regels) { if (isSchrijflijn(r)) { leegMaken(); t.append(maak('div', 'schrijflijn')); } else tekstregels.push(r); }
  leegMaken();
  return t;
}

// Een omcirkel-oefening: de vraag (zonder invullijn) en de keuzes als vakjes om te omcirkelen. Met de antwoordsleutel kleurt het juiste vakje.
function keuzeDelen(o, sleutel) {
  const vraag = maak('div', 'tekst'); vraag.append(...metGaten(o.keuzeVraag ?? o.tekst.split('\n').slice(0, -1).join('\n')));
  const rij = maak('div', 'keuzes');
  o.opties.forEach((t, i) => rij.append(maak('span', 'keuze' + (sleutel && i === o.juist ? ' juist' : ''), t)));
  return [vraag, rij];
}

// acties (optioneel, enkel in het voorbeeld): { weg(bi,pos), vervang(bi,pos), extra(bi), blokOpnieuw(bi), blokWeg(bi), voorbeeld(bi), breedte(bi,w), verplaats(bi,delta),
//   drop(data, bi, voor), hulpTekst(bi,t), hulpAanpas(bi,wijziging), voegBlok(waarde), toevoegOpties: [[waarde, tekst]], blokjes: bool }
// opmaak.sleutel: toon de antwoorden in het rood (voorbeeldblokjes blijven blauw).
export function maakBladElement(blad, leerlingNaam, opmaak, logo, acties = null) {
  const a = pagina(opmaak, blad.onderElkaar ? 'onder-elkaar' : '');
  const kop = maak('header', 'blad-kop');
  const img = maak('img', 'logo'); img.src = logo.url; img.alt = 'Logo BuLO Sint-Franciscus';
  const rechts = maak('div', 'kop-rechts');
  rechts.append(maak('h2', '', opmaak.titel || blad.titel));
  const naam = maak('p', 'naamlijn', 'Naam: '); naam.append(maak('span', '', leerlingNaam));
  const datum = maak('p', 'naamlijn', 'Datum: '); datum.append(maak('span'));
  rechts.append(naam, datum);
  kop.append(rechts, img);
  a.append(kop);
  if (opmaak.toonDoel && blad.doelen && blad.doelen.length) {
    const kader = maak('div', 'doelkader');
    kader.append(maak('strong', '', blad.doelen.length > 1 ? 'Doelen' : 'Doel'));
    for (const t of doelTeksten(blad.doelen)) kader.append(maak('p', '', t));
    a.append(kader);
  }

  if (opmaak.schemaKaart) {
    const s = opmaak.schemaKaart, kader = maak('div', 'schemakader');
    kader.append(maak('strong', '', s.titel));
    if (s.afbeelding) { const img = maak('img'); img.src = s.afbeelding; img.alt = s.titel; kader.append(img); }
    if (s.stappen && s.stappen.length) { const ol = maak('ol', 'stappenplan'); for (const stap of s.stappen) ol.append(maak('li', '', stap)); kader.append(ol); }
    if (s.tekst) for (const regel of s.tekst.split(/\n+/)) kader.append(maak('p', '', regel));
    a.append(kader);
  }

  const inhoud = maak('div', 'blad-inhoud');
  let opdrachtNr = 0;
  const dropOp = (el, bi) => {
    if (!acties || !acties.drop) return;
    el.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); el.classList.add('doel-drop'); });
    el.addEventListener('dragleave', () => el.classList.remove('doel-drop'));
    el.addEventListener('drop', (e) => {
      e.preventDefault(); e.stopPropagation(); el.classList.remove('doel-drop');
      let data; try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
      const r = el.getBoundingClientRect(), breed = r.width > inhoud.getBoundingClientRect().width * 0.6;
      const voor = breed ? e.clientY < r.top + r.height / 2 : e.clientX < r.left + r.width / 2;
      acties.drop(data, bi, voor);
    });
  };
  const sleepbaar = (el, bi) => {
    if (!acties || !acties.drop) return;
    el.draggable = true;
    el.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ soort: 'blok', van: bi })); e.dataTransfer.effectAllowed = 'move'; el.classList.add('sleept'); });
    el.addEventListener('dragend', () => el.classList.remove('sleept'));
  };

  blad.blokken.forEach((b, bi) => {
    if (b.hulp) { inhoud.append(maakHulp(b, bi, acties, dropOp, sleepbaar)); return; }
    const blok = maak('section', 'blok' + (b.oefeningen.length > 4 ? ' lang' : '') + (b.oefeningen.length ? '' : ' leeg') + (b.vb ? ' met-voorbeeld' : '') + (b.breedte === 1 ? ' kwart' : '') + (b.ruim ? ' ruim' : '') + (b.vakje ? ' vakjes' : ''));
    blok.style.gridColumn = `span ${b.breedte}`;
    if (acties) {
      const balk = maak('div', 'bewerk blokbalk');
      const items = [maak('span', 'doelcode', `${b.doel ? b.doel + ' · ' : ''}${b.titel}`)];
      if (acties.blokjes) {
        items.push(knop('◀', 'Verplaats dit blokje naar voren', () => acties.verplaats(bi, -1)), knop('▶', 'Verplaats dit blokje naar achteren', () => acties.verplaats(bi, 1)));
        for (const w of [1, 2, 4]) items.push(knop(BREEDTE_TEKST[w], `Breedte: ${{ 1: 'een kwart', 2: 'de helft', 4: 'de volle breedte' }[w]}`, () => acties.breedte(bi, w), 'breedteknop' + (b.breedte === w ? ' aan' : '')));
      }
      items.push(knop('vb', b.vb ? 'Dit blokje is een voorbeeld: klik om het weer gewoon te maken' : 'Maak van dit blokje een voorbeeld: de eerste oefening staat ingevuld in het blauw', () => acties.voorbeeld(bi), b.vb ? 'aan' : ''),
        knop('↻', 'Nieuwe getallen voor enkel dit blokje', () => acties.blokOpnieuw(bi)),
        knop('+', 'Voeg één extra oefening toe aan dit blokje', () => acties.extra(bi)),
        knop('✕', 'Verwijder dit blokje', () => acties.blokWeg(bi), 'gevaar'));
      balk.append(...items);
      blok.append(balk);
      blok.addEventListener('click', () => { document.querySelectorAll('.blok.actief, .hulp.actief').forEach(x => { if (x !== blok) x.classList.remove('actief'); }); blok.classList.add('actief'); });
      dropOp(blok, bi); sleepbaar(blok, bi);
      if (b.doel) blok.append(maak('span', 'bewerk doellabel', b.doel));            // enkel op het scherm: bij welk doel dit blokje hoort
      if (b.sam) blok.append(maak('span', 'bewerk samenvatting', b.sam));          // enkel op het scherm: de actieve instellingen van dit blokje
    }
    const opdracht = maak('div', 'opdracht');
    const nummer = maak('span', 'opdrachtnr', b.oefeningen.length ? String(++opdrachtNr) : '·');
    const icoon = maak('span', 'icoon'); icoon.innerHTML = pictogram(b.pictogram || 'schrijven', 44);
    opdracht.append(nummer, icoon, maak('p', '', b.opdracht));
    const lijst = maak('ol');
    const raster = blad.onderElkaar ? { kolommen: 1, krap: false, schaal: 1, stapel: false, opgaveCh: 0 } : rasterVoor(b.oefeningen, GROOTTES[opmaak.grootte] * (b.breedte === 1 ? 0.8 : 1), BLOK_MM[b.breedte] || BLOK_MM[4]);
    lijst.classList.add('raster', `kol${raster.kolommen}`);
    if (raster.krap) lijst.classList.add('krap');
    if (raster.stapel) lijst.classList.add('stapel');
    lijst.style.setProperty('--schaal', String(raster.schaal));
    lijst.style.setProperty('--opg', String(raster.opgaveCh));
    if (b.breedte < 4) lijst.classList.add('smal');
    if (b.breedte === 1) lijst.classList.add('kwart');
    if (b.oefeningen.length && b.oefeningen.every(o => isSimpel(o) && !o.voorbeeld)) lijst.classList.add('gelijk');   // alle rijen even hoog
    b.oefeningen.forEach((o, pos) => {
      const li = maak('li', (o.breed ? 'breed' : '') + (o.voorbeeld ? ' voorbeeld' : ''));
      li.append(maak('span', 'lt', `${letterVan(pos)})`));
      const inh = maak('div', 'oef');
      li.append(inh);
      if (o.voorbeeld && o.voorbeeldDelen) inh.append(maak('div', 'vb-label', 'voorbeeld'));
      const tekening = o.voorbeeld ? o.svg : (opmaak.sleutel && o.antwoordSvg ? o.antwoordSvg : o.svg);
      const tekeningEl = tekening ? maak('div', 'tekening') : null;
      if (tekeningEl) tekeningEl.innerHTML = tekening.markup;
      if (tekeningEl && o.svgBoven) inh.append(tekeningEl);                  // plaatje boven de tekst
      const heeftGat = GAT_RE.test(o.tekst || '') ; GAT_RE.lastIndex = 0;
      if (o.opties && !(o.voorbeeld && o.voorbeeldDelen)) inh.append(...keuzeDelen(o, opmaak.sleutel && !o.voorbeeld));
      else if (isSimpel(o) && !o.voorbeeld && !(opmaak.sleutel && heeftGat) && !tekeningEl) {
        inh.classList.add('simpel');                                          // vaste opbouw: opgave links (rechts uitgelijnd op het =-teken), rechts de invullijn
        if (raster.stapel) {                                                  // te smal voor één regel: de opgave mag afbreken, een invullijn aan het eind komt eronder
          const eindGat = /(?<!_)_{4,7}\s*$/.test(o.tekst), opgave = maak('span', 'opgave');
          o.tekst.replace(/\s*(?<!_)_{4,7}\s*$/, '').split(GAT_RE).forEach((deel, g) => { if (g) opgave.append(maak('span', 'gat klein')); if (deel) opgave.append(document.createTextNode(deel)); });
          inh.append(opgave);
          if (eindGat) inh.append(maak('span', 'gat'));
        } else {
          const { links, rechts } = splitOpgave(o.tekst), opgave = maak('span', 'opgave rechts');
          links.split(GAT_RE).forEach((deel, g) => { if (g) opgave.append(maak('span', 'gat klein')); if (deel) opgave.append(document.createTextNode(deel)); });
          inh.append(opgave);
          rechts.split(GAT_RE).forEach((deel, g) => { if (g) inh.append(maak('span', 'gat')); if (deel.trim()) inh.append(maak('span', 'opgave rest', deel.trim())); });
        }
      } else if (!vulDelen(inh, o, opmaak.sleutel && !o.voorbeeld) && o.tekst) inh.append(tekstMetLijnen(o.tekst));
      if (tekeningEl && !o.svgBoven) inh.append(tekeningEl);
      if (acties) {
        const k = maak('span', 'bewerk oefknoppen');
        k.append(knop('↻', 'Vervang door een nieuwe oefening van hetzelfde type', () => acties.vervang(bi, pos)),
          knop('✕', 'Laat deze oefening weg', () => acties.weg(bi, pos), 'gevaar'));
        li.append(k);
      }
      lijst.append(li);
    });
    blok.append(opdracht);
    if (b.steun) {                                                               // steun bovenaan het blokje: een tafelrij of een getallenas
      const st = maak('div', 'steun');
      if (b.steun.tekst) st.append(maak('div', 'steun-tekst', b.steun.tekst));
      if (b.steun.svg) { const t = maak('div', 'tekening'); t.innerHTML = b.steun.svg.markup; st.append(t); }
      blok.append(st);
    }
    blok.append(lijst);
    if (!b.oefeningen.length) blok.append(maak('p', 'bewerk', 'Geen oefeningen meer in dit blokje. Gebruik "+" of verwijder het blokje.'));
    inhoud.append(blok);
  });
  if (acties && acties.drop) dropOp(inhoud, blad.blokken.length - 1), inhoud.addEventListener('dragover', (e) => e.preventDefault()), inhoud.addEventListener('drop', (e) => {
    e.preventDefault(); let data; try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
    acties.drop(data, blad.blokken.length - 1, false);
  });
  a.append(inhoud);
  if (acties && acties.toevoegOpties && acties.toevoegOpties.length) {
    const balk = maak('div', 'bewerk toevoegbalk');
    const sel = maak('select');
    for (const [waarde, tekst] of acties.toevoegOpties) { const o = maak('option', '', tekst); o.value = waarde; sel.append(o); }
    balk.append(sel, knop('+ blok toevoegen', 'Voeg een blok met deze oefenvorm toe', () => acties.voegBlok(sel.value)));
    a.append(balk);
  }
  if (opmaak.boodschap.trim()) {
    const box = maak('div', 'boodschap');
    box.append(maak('strong', '', 'Boodschap voor thuis'), maak('p', '', opmaak.boodschap.trim()));
    a.append(box);
  }
  a.append(maak('footer', 'bladcode', 'Bladcode: ' + blad.code));
  return a;
}

// Hulpblokjes: instructieregel (de leerkracht typt de zin op het blad), blanco blok en nieuw blad.
function maakHulp(b, bi, acties, dropOp, sleepbaar) {
  const el = maak('div', `hulp hulp-${b.hulp}`);
  el.style.gridColumn = `span ${b.breedte}`;
  if (b.hulp === 'blanco') el.style.minHeight = `${b.hoogte}cm`;
  if (b.hulp === 'instructie') {
    const p = maak('p', 'instructie', b.tekst);
    if (acties) {
      p.contentEditable = 'true'; p.dataset.leeg = 'Typ hier de instructie voor de leerlingen';
      p.addEventListener('blur', () => { if (p.textContent !== b.tekst) acties.hulpTekst(bi, p.textContent.trim()); });
      p.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); p.blur(); } });
    }
    el.append(p);
  }
  if (b.hulp === 'pagina') el.append(maak('span', 'bewerk paginalijn', 'Nieuw blad vanaf hier'));
  if (acties) {
    const balk = maak('div', 'bewerk blokbalk');
    const items = [maak('span', 'doelcode', { instructie: 'Instructieregel', blanco: 'Blanco blok', pagina: 'Nieuw blad' }[b.hulp])];
    if (acties.blokjes) items.push(knop('◀', 'Verplaats naar voren', () => acties.verplaats(bi, -1)), knop('▶', 'Verplaats naar achteren', () => acties.verplaats(bi, 1)));
    if (b.hulp === 'blanco') items.push(knop('½', 'Halve breedte', () => acties.hulpAanpas(bi, { breedte: 2 }), 'breedteknop' + (b.breedte === 2 ? ' aan' : '')), knop('1', 'Volle breedte', () => acties.hulpAanpas(bi, { breedte: 4 }), 'breedteknop' + (b.breedte === 4 ? ' aan' : '')),
      knop('−', 'Lager', () => acties.hulpAanpas(bi, { hoogte: Math.max(1, b.hoogte - 1) })), knop('+', 'Hoger', () => acties.hulpAanpas(bi, { hoogte: Math.min(15, b.hoogte + 1) })));
    items.push(knop('✕', 'Verwijder', () => acties.blokWeg(bi), 'gevaar'));
    balk.append(...items);
    el.prepend(balk);
    el.addEventListener('click', () => { document.querySelectorAll('.blok.actief, .hulp.actief').forEach(x => { if (x !== el) x.classList.remove('actief'); }); el.classList.add('actief'); });
    dropOp(el, bi); sleepbaar(el, bi);
  }
  return el;
}

// items: [{ naam, blad }]
export function maakAntwoordElement(items, opmaak) {
  const a = pagina(opmaak, 'antwoorden');
  a.append(maak('h2', '', 'Antwoorden voor de leerkracht'));
  for (const { naam, blad } of items) {
    const sectie = maak('section', 'blok');
    sectie.append(maak('h3', '', `${naam || 'Blad'} · ${opmaak.titel || blad.titel}`));
    blad.blokken.filter(x => x.oefeningen.length).forEach((b, nr) => {
      sectie.append(maak('h4', 'blokkop', `${nr + 1}. ${b.titel}`));
      const lijst = maak('ol');
      for (const o of b.oefeningen) {
        const li = maak('li', o.antwoordSvg ? 'breed' : '');
        li.append(maak('div', 'tekst', o.volledig));
        if (o.antwoordSvg) { const t = maak('div', 'tekening klein'); t.innerHTML = o.antwoordSvg.markup; li.append(t); }
        lijst.append(li);
      }
      sectie.append(lijst);
    });
    if (blad.doelen && blad.doelen.length) sectie.append(maak('p', 'doelenlijst', `Op.stap-doelen in dit blad: ${blad.doelen.join(', ')}`));
    a.append(sectie);
  }
  return a;
}
