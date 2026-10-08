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

export function maakBladElement(blad, leerlingNaam, opmaak, logo) {
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

  for (const b of blad.blokken) {
    const blok = maak('section', 'blok');
    const opdracht = maak('div', 'opdracht');
    const icoon = maak('span', 'icoon'); icoon.innerHTML = pictogram(b.pictogram, 44);
    opdracht.append(icoon, maak('p', '', b.opdracht));
    const lijst = maak('ol');
    for (const o of b.oefeningen) {
      const li = maak('li', o.breed ? 'breed' : '');
      if (o.tekst) li.append(maak('div', 'tekst', o.tekst));
      if (o.svg) { const t = maak('div', 'tekening'); t.innerHTML = o.svg.markup; li.append(t); }
      lijst.append(li);
    }
    blok.append(opdracht, lijst);
    a.append(blok);
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
    for (const b of blad.blokken) {
      const lijst = maak('ol');
      for (const o of b.oefeningen) lijst.append(maak('li', '', o.volledig));
      sectie.append(lijst);
    }
    a.append(sectie);
  }
  return a;
}
