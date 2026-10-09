// Werkblad als A4-pagina in de browser (voorbeeld en afdrukken).
import { pictogram } from './icons.js';
import { LETTERTYPES, GROOTTES } from './opmaak.js';

const maak = (tag, klasse, tekst) => {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
};

function pagina(opmaak, extraKlasse = '') {
  const a = maak('article', 'blad ' + extraKlasse);
  a.style.fontFamily = LETTERTYPES[opmaak.lettertype].css;
  a.style.fontSize = GROOTTES[opmaak.grootte] + 'pt';
  return a;
}

const knop = (tekst, titel, klik, klasse = '') => {
  const k = maak('button', `bewerkknop ${klasse}`, tekst);
  k.type = 'button'; k.title = titel; k.addEventListener('click', klik);
  return k;
};

// acties (optioneel, enkel in het voorbeeld): { weg(bi,pos), vervang(bi,pos), extra(bi), blokOpnieuw(bi), blokWeg(bi), voegBlok(waarde), toevoegOpties: [[waarde, tekst]] }
export function maakBladElement(blad, leerlingNaam, opmaak, logo, acties = null) {
  const a = pagina(opmaak);
  const kop = maak('header', 'blad-kop');
  const img = maak('img', 'logo'); img.src = logo.url; img.alt = 'Logo BuLO Sint-Franciscus';
  const rechts = maak('div', 'kop-rechts');
  rechts.append(maak('h2', '', opmaak.titel || blad.titel));
  const naam = maak('p', 'naamlijn', 'Naam: '); naam.append(maak('span', '', leerlingNaam));
  const datum = maak('p', 'naamlijn', 'Datum: '); datum.append(maak('span'));
  rechts.append(naam, datum);
  kop.append(img, rechts);
  a.append(kop);

  blad.blokken.forEach((b, bi) => {
    const blok = maak('section', 'blok' + (b.oefeningen.length ? '' : ' leeg'));
    if (acties) {
      const balk = maak('div', 'bewerk blokbalk');
      balk.append(maak('span', 'doelcode', `${b.doel ? b.doel + ' · ' : ''}${b.titel}`),
        knop('+ oefening', 'Voeg een extra oefening toe aan dit blok', () => acties.extra(bi)),
        knop('↻ blok opnieuw', 'Maak dit hele blok opnieuw met nieuwe oefeningen', () => acties.blokOpnieuw(bi)),
        knop('✕ blok', 'Verwijder dit blok', () => acties.blokWeg(bi), 'gevaar'));
      blok.append(balk);
    }
    const opdracht = maak('div', 'opdracht');
    const icoon = maak('span', 'icoon'); icoon.innerHTML = pictogram(b.pictogram, 44);
    opdracht.append(icoon, maak('p', '', b.opdracht));
    const lijst = maak('ol');
    b.oefeningen.forEach((o, pos) => {
      const li = maak('li', o.breed ? 'breed' : '');
      if (o.tekst) li.append(maak('div', 'tekst', o.tekst));
      if (o.svg) { const t = maak('div', 'tekening'); t.innerHTML = o.svg.markup; li.append(t); }
      if (acties) {
        const k = maak('span', 'bewerk oefknoppen');
        k.append(knop('↻', 'Vervang door een nieuwe oefening van hetzelfde type', () => acties.vervang(bi, pos)),
          knop('✕', 'Laat deze oefening weg', () => acties.weg(bi, pos), 'gevaar'));
        li.append(k);
      }
      lijst.append(li);
    });
    blok.append(opdracht, lijst);
    if (!b.oefeningen.length) blok.append(maak('p', 'bewerk', 'Geen oefeningen meer in dit blok. Gebruik "+ oefening" of verwijder het blok.'));
    a.append(blok);
  });
  if (acties) {
    const balk = maak('div', 'bewerk toevoegbalk');
    const sel = maak('select');
    for (const [waarde, tekst] of acties.toevoegOpties) { const o = maak('option', '', tekst); o.value = waarde; sel.append(o); }
    balk.append(sel, knop('+ blok toevoegen', 'Voeg een blok met deze oefenvorm toe', () => acties.voegBlok(sel.value)));
    if (acties.toevoegOpties.length) a.append(balk);
  }
  if (opmaak.boodschap.trim()) {
    const box = maak('div', 'boodschap');
    box.append(maak('strong', '', 'Boodschap voor thuis'), maak('p', '', opmaak.boodschap.trim()));
    a.append(box);
  }
  a.append(maak('footer', 'bladcode', 'Bladcode: ' + blad.code));
  return a;
}

// items: [{ naam, blad }]
export function maakAntwoordElement(items, opmaak) {
  const a = pagina(opmaak, 'antwoorden');
  a.append(maak('h2', '', 'Antwoorden voor de leerkracht'));
  for (const { naam, blad } of items) {
    const sectie = maak('section', 'blok');
    sectie.append(maak('h3', '', `${naam || 'Blad'} · ${opmaak.titel || blad.titel}`));
    for (const b of blad.blokken.filter(x => x.oefeningen.length)) {
      sectie.append(maak('h4', 'blokkop', b.titel));
      const lijst = maak('ol');
      for (const o of b.oefeningen) {
        const li = maak('li', o.antwoordSvg ? 'breed' : '');
        li.append(maak('div', 'tekst', o.volledig));
        if (o.antwoordSvg) { const t = maak('div', 'tekening klein'); t.innerHTML = o.antwoordSvg.markup; li.append(t); }
        lijst.append(li);
      }
      sectie.append(lijst);
    }
    a.append(sectie);
  }
  return a;
}
