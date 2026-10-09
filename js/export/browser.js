// Browsergedeelte van de export: afbeeldingen voorbereiden, bestanden downloaden, afdrukken.
import { ICONEN_NAMEN, pictogramSvg } from '../core/icons.js';
import { logoAfbeelding } from '../core/logo.js';
import { bouwDocument } from './docx.js';

const dataUrlNaarBytes = (url) => Uint8Array.from(atob(url.split(',')[1]), c => c.charCodeAt(0));

async function svgNaarPng(svg, breedte, hoogte = breedte, schaal = 1) {
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const img = await new Promise((ok, fout) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fout; i.src = url; });
  const c = document.createElement('canvas'); c.width = breedte * schaal; c.height = hoogte * schaal;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
  return dataUrlNaarBytes(c.toDataURL('image/png'));
}

export async function bereidAfbeeldingenVoor(opmaak, bladen = []) {
  const logo = await logoAfbeelding(opmaak.printLogo);
  const iconen = {};
  for (const naam of ICONEN_NAMEN) iconen[naam] = await svgNaarPng(pictogramSvg(naam, 128), 128);
  const svgPng = new Map();                                    // tekeningen bij oefeningen (2x scherper)
  for (const { blad } of bladen) for (const b of blad.blokken) for (const o of b.oefeningen) {
    for (const t of [o.svg, o.antwoordSvg]) if (t && !svgPng.has(t.markup)) svgPng.set(t.markup, await svgNaarPng(t.markup, t.breedte, t.hoogte, 2));
  }
  return { logo: { bytes: dataUrlNaarBytes(logo.url), breedte: logo.breedte, hoogte: logo.hoogte }, iconen, svgPng };
}

export function downloadBlob(blob, bestandsnaam) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = bestandsnaam;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const veiligeNaam = (t) => String(t || 'blad').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'blad';

// modus: 'een' (alle bladen in één bestand) of 'aparte' (één .docx per leerling, in een zip)
export async function exporteerWord(bladen, opmaak, modus, vakNaam) {
  const d = window.docx;
  if (!d) throw new Error('De Word-bibliotheek is niet geladen.');
  const afb = await bereidAfbeeldingenVoor(opmaak, bladen);
  const maakBlob = (lijst) => d.Packer.toBlob(bouwDocument(d, lijst, opmaak, afb));
  const basis = `werkblad-${veiligeNaam(vakNaam)}`;
  if (bladen.length === 1 || modus === 'een') {
    const naam = bladen.length === 1 ? `${basis}-${veiligeNaam(bladen[0].naam)}` : `werkbladen-${veiligeNaam(vakNaam)}`;
    downloadBlob(await maakBlob(bladen), naam + '.docx');
    return;
  }
  const zip = new window.JSZip();
  const gebruikt = new Set();
  for (const item of bladen) {
    let n = `${basis}-${veiligeNaam(item.naam)}`; for (let i = 2; gebruikt.has(n); i++) n = `${basis}-${veiligeNaam(item.naam)}-${i}`;
    gebruikt.add(n);
    zip.file(n + '.docx', await maakBlob([item]));
  }
  downloadBlob(await zip.generateAsync({ type: 'blob' }), `werkbladen-${veiligeNaam(vakNaam)}.zip`);
}

// Zet de pagina's in #printRoot en laat de browser afdrukken (of opslaan als PDF).
export function drukAf(elementen) {
  let root = document.getElementById('printRoot');
  if (!root) { root = document.createElement('div'); root.id = 'printRoot'; document.body.append(root); }
  root.replaceChildren(...elementen.map(e => e.cloneNode(true)));
  const opruimen = () => { root.replaceChildren(); window.removeEventListener('afterprint', opruimen); };
  window.addEventListener('afterprint', opruimen);
  window.print();
}
