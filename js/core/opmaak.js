// Opmaakinstellingen van het werkblad (lettertype, grootte, logo, antwoordblad, boodschap).
export const LETTERTYPES = {
  andika: { naam: 'Andika (aanbevolen voor beginnende lezers)', css: 'Andika, "Segoe UI", Arial, sans-serif', docx: 'Andika' },
  arial: { naam: 'Arial', css: 'Arial, Helvetica, sans-serif', docx: 'Arial' },
  verdana: { naam: 'Verdana', css: 'Verdana, Geneva, sans-serif', docx: 'Verdana' },
};
export const GROOTTES = { normaal: 14, groot: 16, extragroot: 18 }; // in punten

const SLEUTEL = 'werkbladgenerator.opmaak.v1';
export const standaardOpmaak = () => ({
  lettertype: 'andika', grootte: 'groot', printLogo: false, antwoordblad: false, boodschap: '', titel: '',
});

export function laadOpmaak(opslag = globalThis.localStorage) {
  try { return { ...standaardOpmaak(), ...JSON.parse(opslag.getItem(SLEUTEL) || '{}'), antwoordblad: false }; }
  catch { return standaardOpmaak(); }
}
export function bewaarOpmaak(opmaak, opslag = globalThis.localStorage) {
  try { opslag.setItem(SLEUTEL, JSON.stringify({ ...opmaak, boodschap: '', titel: '' })); } catch { /* geen opslag */ }
}
