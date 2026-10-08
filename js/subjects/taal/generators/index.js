// Registratie van alle taalgenerators. Nieuwe generator = bestand maken + hier toevoegen
// + de koppelingen opnieuw opbouwen met: node scripts/koppelingen.mjs taal
import { VERENKELEN_VERDUBBELEN_VORMEN } from './verenkelen-verdubbelen.js';

export const GENERATORS = [
  ...VERENKELEN_VERDUBBELEN_VORMEN,
];
