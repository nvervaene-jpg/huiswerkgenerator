// Gedeelde hulpfuncties voor generators.
export const aantalCijfers = (n) => String(Math.abs(n)).length;

// Vergelijkt twee moeilijkheidslijsten lexicografisch (kleiner = makkelijker).
export function vergelijkMoeilijkheid(x, y) {
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

// Trekt unieke oefeningen via 'maak(rng)' (null = ongeldig). 'familie' voorkomt bijna-dubbels (bv. 3+5 en 5+3).
export function trek(rng, aantal, maak, pogingenPerOefening = 300) {
  const sleutels = new Set(), families = new Set(), uit = [];
  for (let p = 0; p < pogingenPerOefening * aantal && uit.length < aantal; p++) {
    const o = maak(rng);
    if (!o || sleutels.has(o.sleutel) || (o.familie && families.has(o.familie))) continue;
    sleutels.add(o.sleutel);
    if (o.familie) families.add(o.familie);
    uit.push(o);
  }
  return uit;
}

// Sorteert van makkelijk naar moeilijk en voegt een waarschuwing toe als er te weinig mogelijk zijn.
export function resultaat(oefeningen, aantal) {
  oefeningen.sort((a, b) => vergelijkMoeilijkheid(a.moeilijkheid, b.moeilijkheid));
  return {
    oefeningen,
    waarschuwing: oefeningen.length < aantal
      ? `Binnen dit getallengebied zijn maar ${oefeningen.length} verschillende oefeningen mogelijk.` : null,
  };
}

// Leidt een keuze af uit de aangevinkte doelen: alle doelen vragen 'x' -> 'x', anders 'beide'.
export function afgeleid(doelCodes, kaart, standaard) {
  const waarden = new Set(doelCodes.filter(c => kaart[c]).map(c => kaart[c]));
  return waarden.size === 1 ? [...waarden][0] : standaard;
}

export const geheelTussen = (rng, lo, hi) => (lo > hi ? null : rng.geheel(lo, hi));
