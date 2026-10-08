// Voorbeeld van een werkblad in de browser (de definitieve A4-opmaak volgt in fase 3).
import { pictogram } from './icons.js';

const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function bladHtml(blad, leerlingNaam = '') {
  const blokken = blad.blokken.map(b => `
    <section class="blok">
      <div class="opdracht">${pictogram(b.pictogram)}<p>${esc(b.opdracht)}</p></div>
      <ol>${b.oefeningen.map(o => `<li>${esc(o.tekst)}</li>`).join('')}</ol>
    </section>`).join('');
  return `
    <header class="blad-kop">
      <h2>${esc(blad.titel)}</h2>
      <p class="naamlijn">Naam: <span>${esc(leerlingNaam)}</span></p>
      <p class="naamlijn">Datum: <span></span></p>
    </header>
    ${blokken}
    <footer class="bladcode">Bladcode: ${esc(blad.code)}</footer>`;
}
