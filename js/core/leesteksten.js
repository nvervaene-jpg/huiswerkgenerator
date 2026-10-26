// Extra leesteksten uit assets/leesteksten (zie README daar). De lijst staat in index.json.
import { zetExtraTeksten } from '../subjects/taal/woorden/leesteksten.js';

export const LEESTEKSTEN_MAP = 'assets/leesteksten/';

// Laadt de extra teksten en zet ze klaar voor de generators. Zonder bestand of bij een fout blijven enkel de ingebouwde teksten over.
export async function laadLeesteksten(haal = (url) => fetch(url)) {
  try {
    const r = await haal(`${LEESTEKSTEN_MAP}index.json`);
    if (r.ok === false) return zetExtraTeksten([]), 0;
    const { teksten = [] } = await r.json();
    zetExtraTeksten(teksten);
    return teksten.length;
  } catch { zetExtraTeksten([]); return 0; }
}
