// Register van vakken. Een nieuw vak (bv. taal) toevoegen = een module in
// js/subjects/<vak>/ maken en hier registreren; de rest van de app past zich aan.
import wiskunde from './wiskunde/index.js';
import taal from './taal/index.js';

export const VAKKEN = [
  wiskunde,
  taal,
  { id: 'wo', naam: 'Wereldoriëntatie', actief: false },
];
