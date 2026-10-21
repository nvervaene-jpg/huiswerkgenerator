// Bepaalt welk soort open opdracht bij een wiskundedoel past (op basis van het domein en het leerjaar van het doel).
export function profielVan(doel) {
  if (doel.leerjaar === 'K3') return 'kleuter';
  switch (doel.domein) {
    case 'Meten en metend rekenen': return 'meten';
    case 'Meetkunde': return 'meetkunde';
    case 'Kansrekenen en statistiek': return 'data';
    case 'Vraagstukken en probleemoplossend denken': return 'problemen';
    default: return 'getal';        // Getallenkennis en Bewerkingen
  }
}
