// Leerlingprofielen: enkel lokaal in de browser (localStorage), met export/import als JSON.
const SLEUTEL = 'werkbladgenerator.leerlingen.v1';
export const GETALLENGEBIEDEN = [10, 20, 100, 1000, 10000];

export const nieuwId = () => (globalThis.crypto && crypto.randomUUID)
  ? crypto.randomUUID() : 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function leesNamen(tekst) {
  return [...new Set(String(tekst).split(/[\n\r,;\t]+/).map(n => n.trim()).filter(Boolean))];
}

export function maakProfiel(naam, niveau = 'L1') {
  return { id: nieuwId(), naam, niveau, aantal: 8, gebied: 20, doelen: [] };
}

export class Leerlingen {
  constructor(opslag = globalThis.localStorage) {
    this.opslag = opslag;
    this.lijst = [];
    try { this.lijst = JSON.parse(opslag.getItem(SLEUTEL) || '[]'); } catch { this.lijst = []; }
  }
  bewaar() { try { this.opslag.setItem(SLEUTEL, JSON.stringify(this.lijst)); } catch { /* opslag vol of geblokkeerd */ } }
  voegToe(namen, niveau) {
    const bestaand = new Set(this.lijst.map(l => l.naam.toLowerCase()));
    const nieuw = leesNamen(namen).filter(n => !bestaand.has(n.toLowerCase())).map(n => maakProfiel(n, niveau));
    this.lijst.push(...nieuw);
    this.bewaar();
    return nieuw;
  }
  wijzig(id, velden) { Object.assign(this.lijst.find(l => l.id === id) || {}, velden); this.bewaar(); }
  verwijder(id) { this.lijst = this.lijst.filter(l => l.id !== id); this.bewaar(); }
  exporteer() { return JSON.stringify({ versie: 1, leerlingen: this.lijst }, null, 2); }
  importeer(tekst) {
    const data = JSON.parse(tekst);
    if (!data || !Array.isArray(data.leerlingen)) throw new Error('Dit bestand bevat geen leerlingenlijst.');
    for (const l of data.leerlingen) {
      if (!l.id || !l.naam) throw new Error('Het bestand bevat een leerling zonder naam.');
      const i = this.lijst.findIndex(x => x.id === l.id);
      const profiel = { ...maakProfiel(l.naam), ...l };
      if (i >= 0) this.lijst[i] = profiel; else this.lijst.push(profiel);
    }
    this.bewaar();
    return data.leerlingen.length;
  }
}
