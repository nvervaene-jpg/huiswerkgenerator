// Onthoudt de geladen doelen (code -> doel), zodat open opdrachten de tekst van hun doel kunnen tonen.
// De app vult dit na het laden van een vak; de tests vullen het met het doelenbestand.
const register = new Map();
export const zetDoelen = (lijst) => { for (const d of lijst) register.set(d.code, d); };
export const doelVan = (code) => register.get(code) || null;
