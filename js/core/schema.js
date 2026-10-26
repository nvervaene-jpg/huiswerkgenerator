// Spellingschema's: afbeeldingen en tekst uit assets/spellingschema (zie README daar). De lijst staat in index.json.
export const SCHEMA_MAP = 'assets/spellingschema/';

// Geeft [{ id, titel, tekst?, afbeelding? }]; afbeelding is een url relatief aan de pagina. Zonder bestand of bij een fout: geen schema's.
export async function laadSchemas(haal = (url) => fetch(url)) {
  try {
    const r = await haal(`${SCHEMA_MAP}index.json`);
    if (r.ok === false) return [];
    const { schemas = [] } = await r.json();
    return schemas.map(s => ({ ...s, afbeelding: s.afbeelding ? SCHEMA_MAP + s.afbeelding : undefined }));
  } catch { return []; }
}

// Het gekozen schema voor de weergave en de export; null bij 'geen schema' of een schema dat niet meer bestaat.
export const schemaKaart = (schemas, id) => (id && schemas.find(s => s.id === id)) || null;
