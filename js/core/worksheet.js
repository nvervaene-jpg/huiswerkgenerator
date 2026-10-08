// Bouwt een werkblad (model, nog zonder opmaak) uit generators en instellingen.
import { afgeleideSeed } from './random.js';
import { codeNaarTekst, tekstNaarCode } from './bladcode.js';

// instellingen: { seed, aantal, gebied, opties: { [generatorId]: {...} } }
export function bouwBlad(vak, generatorIds, instellingen, titel = `Werkblad ${vak.naam.toLowerCase()}`) {
  const blokken = generatorIds.map(id => {
    const gen = vak.generators.find(g => g.id === id);
    if (!gen) throw new Error(`Onbekende generator: ${id}`);
    const { oefeningen, waarschuwing } = gen.genereer({
      seed: afgeleideSeed(instellingen.seed, id),
      aantal: instellingen.aantal,
      gebied: instellingen.gebied,
      opties: instellingen.opties[id],
    });
    return { generatorId: id, titel: gen.titel, pictogram: gen.pictogram, opdracht: gen.opdracht, oefeningen, waarschuwing };
  });
  const code = codeNaarTekst({ v: 1, vak: vak.id, s: instellingen.seed, n: instellingen.aantal, b: instellingen.gebied, g: generatorIds, o: instellingen.opties });
  return { titel, blokken, code, instellingen: { ...instellingen, generatorIds } };
}

export function bladUitCode(vak, tekst) {
  const c = tekstNaarCode(tekst);
  if (c.vak !== vak.id) throw new Error(`Deze code hoort bij een ander vak (${c.vak}).`);
  return bouwBlad(vak, c.g, { seed: c.s, aantal: c.n, gebied: c.b, opties: c.o });
}

// Welke generators passen bij de aangevinkte doelen, en met welke opties.
export function generatorsVoorDoelen(vak, doelCodes) {
  const gekozen = vak.generators.filter(g => g.doelen.some(c => doelCodes.includes(c)));
  const opties = {};
  for (const g of gekozen) opties[g.id] = g.opties ? g.opties(doelCodes) : {};
  return { generatorIds: gekozen.map(g => g.id), opties };
}
