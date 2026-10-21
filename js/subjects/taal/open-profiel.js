// Bepaalt welk soort open opdracht bij een taaldoel past (op basis van het domein en subdomein van het doel).
export function profielVan(doel) {
  switch (doel.domein) {
    case 'Lezen': return 'lezen';
    case 'Schrijven':
      if (doel.subdomein === 'Handschrift en digitale vaardigheden') return 'handschrift';
      if (doel.subdomein === 'Correct schrijven') return 'taalsysteem';
      return 'schrijven';
    case 'Mondeling taalgebruik': return 'mondeling';
    case 'Literatuur': return 'literatuur';
    default: return 'taalsysteem';   // Taalsysteem en taalgebruik (woordenschat, grammatica, taalwetenschap)
  }
}
