// Alle wiskundegenerators: de echte oefeningen (echt.js) en de open opdrachten voor doelen zonder echte generator (open.js).
import { ECHTE_GENERATORS } from './echt.js';
import { OPEN_VORMEN } from './open.js';

export { ECHTE_GENERATORS, OPEN_VORMEN };
export const GENERATORS = [...ECHTE_GENERATORS, ...OPEN_VORMEN];
