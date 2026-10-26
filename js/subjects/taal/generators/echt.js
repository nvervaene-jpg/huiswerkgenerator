// Registratie van alle taalgenerators. Nieuwe generator = bestand maken + hier toevoegen
// + de koppelingen opnieuw opbouwen met: node scripts/koppelingen.mjs taal
import { VERENKELEN_VERDUBBELEN_VORMEN } from './verenkelen-verdubbelen.js';
import { MEERVOUDEN_VORMEN } from './meervouden.js';
import { VERKLEINWOORDEN_VORMEN } from './verkleinwoorden.js';
import { WERKWOORDEN_VORMEN } from './werkwoorden.js';
import { EINDLETTERS_VORMEN } from './eindletters.js';
import { HOOFDLETTERS_VORMEN } from './hoofdletters.js';
import { KLANKEN_VORMEN } from './klanken.js';
import { SAMENSTELLINGEN_VORMEN } from './samenstellingen.js';
import { BEZIT_VORMEN } from './bezit.js';
import { SPECIAAL_VORMEN } from './speciaal.js';
import { WOORDSOORTEN_VORMEN } from './woordsoorten.js';
import { TAALKUNDE_VORMEN } from './taalkunde.js';
import { WERKWOORDKENNIS_VORMEN } from './werkwoordkennis.js';
import { WOORDBOUW_VORMEN } from './woordbouw.js';
import { ZINSDELEN_VORMEN } from './zinsdelen.js';
import { BEGRIPPEN_VORMEN } from './begrippen.js';
import { LEZEN_VORMEN } from './lezen.js';
import { TAALGEBRUIK_VORMEN } from './taalgebruik.js';
import { SCHRIJVEN_VORMEN } from './schrijven.js';
import { SCHRIJFZINNEN_VORMEN } from './schrijven-zinnen.js';

export const ECHTE_GENERATORS = [
  ...VERENKELEN_VERDUBBELEN_VORMEN,
  ...MEERVOUDEN_VORMEN,
  ...VERKLEINWOORDEN_VORMEN,
  ...WERKWOORDEN_VORMEN,
  ...EINDLETTERS_VORMEN,
  ...HOOFDLETTERS_VORMEN,
  ...KLANKEN_VORMEN,
  ...SAMENSTELLINGEN_VORMEN,
  ...BEZIT_VORMEN,
  ...SPECIAAL_VORMEN,
  ...WOORDSOORTEN_VORMEN,
  ...TAALKUNDE_VORMEN,
  ...WERKWOORDKENNIS_VORMEN,
  ...WOORDBOUW_VORMEN,
  ...ZINSDELEN_VORMEN,
  ...BEGRIPPEN_VORMEN,
  ...LEZEN_VORMEN,
  ...TAALGEBRUIK_VORMEN,
  ...SCHRIJVEN_VORMEN,
  ...SCHRIJFZINNEN_VORMEN,
];
