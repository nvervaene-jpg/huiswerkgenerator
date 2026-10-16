// Herhaalbare toevalsgenerator: dezelfde seed geeft altijd dezelfde reeks.
export function maakRng(seed) {
  let a = seed >>> 0;
  const volgende = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    volgende,
    geheel: (min, max) => min + Math.floor(volgende() * (max - min + 1)),
    schud(lijst) {
      const k = [...lijst];
      for (let i = k.length - 1; i > 0; i--) {
        const j = Math.floor(volgende() * (i + 1));
        [k[i], k[j]] = [k[j], k[i]];
      }
      return k;
    },
  };
}

export function afgeleideSeed(seed, tekst) {
  let h = seed >>> 0;
  for (const c of tekst) h = (Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0);
  return h;
}

export const nieuweSeed = () => Math.floor(Math.random() * 4294967295) + 1;
