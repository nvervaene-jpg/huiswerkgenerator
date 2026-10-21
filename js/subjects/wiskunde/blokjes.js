// Het palet voor Wiskunde: kaarten per domein (zie js/core/blokjes.js). Wat hier niet op staat, komt automatisch in 'Meer oefeningen'.
// Breedte: 1 = een kwart van het blad, 2 = de helft, 4 = de volle breedte.
const rij = (basis, soorten) => [basis, ...soorten.map(s => `${basis}-${s}`)];
const VERBAND = ['meerkeuze', 'juist-fout', 'verbinden', 'tabel', 'fout-zoeken', 'vraagstuk'];
// Vormen met een zin of keuzes hebben meer ruimte nodig dan korte sommen.
const BREDER = (basis, namen) => Object.fromEntries(namen.map(n => [`${basis}-${n}`, 2]));
const stip = (id) => [`${id}-invullen`, `${id}-kiezen`, `${id}-juist-fout`];

export default {
  domeinen: ['Bewerkingen', 'Tafels', 'Cijferen', 'Getallen', 'Meten', 'Kloklezen', 'Geld', 'Breuken'],
  kaarten: [
    // Bewerkingen
    { id: 'optellen', domein: 'Bewerkingen', titel: 'Optellen', breedte: 1, aantal: [10, 5, 15, 20], vormen: rij('optellen', VERBAND), breedtes: BREDER('optellen', ['meerkeuze', 'juist-fout', 'fout-zoeken', 'vraagstuk']), chipVanafGebied: { brug: 20 } },
    { id: 'aftrekken', domein: 'Bewerkingen', titel: 'Aftrekken', breedte: 1, aantal: [10, 5, 15, 20], vormen: rij('aftrekken', VERBAND), breedtes: BREDER('aftrekken', ['meerkeuze', 'juist-fout', 'fout-zoeken', 'vraagstuk']), chipVanafGebied: { brug: 20 } },
    { id: 'stip-aanvullen', domein: 'Bewerkingen', titel: 'Aanvullen', breedte: 1, aantal: [10, 5, 15, 20], vormen: stip('stip-aanvullen'), breedtes: { 'stip-aanvullen-kiezen': 2, 'stip-aanvullen-juist-fout': 2 } },
    { id: 'stip-midden', domein: 'Bewerkingen', titel: 'Stip in het midden', breedte: 1, aantal: [10, 5, 15, 20], vormen: stip('stip-midden'), breedtes: { 'stip-midden-kiezen': 2, 'stip-midden-juist-fout': 2 }, chipVanafGebied: { brug: 20 } },
    { id: 'stip-vooraan', domein: 'Bewerkingen', titel: 'Stip vooraan', breedte: 1, aantal: [10, 5, 15, 20], vormen: stip('stip-vooraan'), breedtes: { 'stip-vooraan-kiezen': 2, 'stip-vooraan-juist-fout': 2 }, chipVanafGebied: { brug: 20 } },
    { id: 'optellen-splits', domein: 'Bewerkingen', titel: 'Splits en reken (optellen)', breedte: 2, aantal: [4, 6, 8], vormen: ['optellen-splits'], chipVanafGebied: { brug: 20 } },
    { id: 'aftrekken-splits', domein: 'Bewerkingen', titel: 'Splits en reken (aftrekken)', breedte: 2, aantal: [4, 6, 8], vormen: ['aftrekken-splits'], chipVanafGebied: { brug: 20 } },
    { id: 'sprongen', domein: 'Bewerkingen', titel: 'Sprongen op de getallenlijn', breedte: 2, aantal: [4, 6, 8], vormen: ['optellen-sprongen', 'aftrekken-sprongen'], labels: { 'optellen-sprongen': 'Optellen', 'aftrekken-sprongen': 'Aftrekken' }, chipVanafGebied: { brug: 20 } },
    { id: 'brug', domein: 'Bewerkingen', titel: 'Met of zonder brug', breedte: 2, aantal: [4, 6, 8], vormen: ['optellen-brug', 'aftrekken-brug'], labels: { 'optellen-brug': 'Optellen', 'aftrekken-brug': 'Aftrekken' } },
    // Tafels
    { id: 'maaltafels', domein: 'Tafels', titel: 'Maaltafels en deeltafels', breedte: 1, aantal: [10, 5, 15, 20], vormen: rij('maaltafels', VERBAND), breedtes: BREDER('maaltafels', ['meerkeuze', 'juist-fout', 'fout-zoeken', 'vraagstuk']) },
    { id: 'maaltafels-rooster', domein: 'Tafels', titel: 'Stippenrooster', breedte: 2, aantal: [4, 6], vormen: ['maaltafels-rooster'] },
    { id: 'maaltafels-veelvouden', domein: 'Tafels', titel: 'Veelvouden kleuren', breedte: 2, aantal: [4, 6], vormen: ['maaltafels-veelvouden'] },
    { id: 'maaltafels-omcirkelen', domein: 'Tafels', titel: 'Producten van de tafel omcirkelen', breedte: 2, aantal: [4, 6], vormen: ['maaltafels-omcirkelen'] },
    { id: 'maaldeel', domein: 'Tafels', titel: 'Vermenigvuldigen en delen met grotere getallen', breedte: 1, aantal: [10, 5, 15, 20], vormen: ['vermenigvuldigen-delen', ...VERBAND.map(s => `maaldeel-${s}`)], breedtes: BREDER('maaldeel', ['meerkeuze', 'juist-fout', 'fout-zoeken', 'vraagstuk']), labels: { 'vermenigvuldigen-delen': 'Invullen' } },
    { id: 'maaldeel-uitsplitsen', domein: 'Tafels', titel: 'Uitsplitsen', breedte: 2, aantal: [4, 6, 8], vormen: ['maaldeel-uitsplitsen'] },
    // Getallen
    { id: 'splitsen', domein: 'Getallen', titel: 'Splitsen', breedte: 2, aantal: [4, 6, 8], vormen: ['getallen-splitsen', 'getallen-splitshuis', 'getallen-splits-tabel', 'getallen-splits-verbinden', 'getallen-splits-juist-fout', 'getallen-splits-vraagstuk'] },
    { id: 'vergelijken', domein: 'Getallen', titel: 'Getallen vergelijken', breedte: 2, aantal: [10, 5, 15], vormen: ['getallen-vergelijken', 'getallen-omcirkelen', 'getallen-vergelijk-meerkeuze', 'getallen-vergelijk-juist-fout', 'getallen-vergelijk-vraagstuk'], labels: { 'getallen-vergelijken': 'Invullen' } },
    { id: 'ordenen', domein: 'Getallen', titel: 'Getallen ordenen', breedte: 2, aantal: [4, 6, 8], vormen: ['getallen-ordenen'] },
    { id: 'buren', domein: 'Getallen', titel: 'Voorganger en opvolger', breedte: 1, aantal: [10, 5, 15], vormen: ['getallen-buren'] },
    { id: 'rij-fout', domein: 'Getallen', titel: 'Fout in de rij zoeken', breedte: 2, aantal: [4, 6, 8], vormen: ['getallen-rij-fout'] },
    { id: 'getallenas', domein: 'Getallen', titel: 'Getallenas', breedte: 4, aantal: [3, 4, 6], vormen: ['getallenas-invullen', 'getallenas-pijl', 'getallenas-pijl-tekenen', 'getallenas-letters', 'getallenas-juist-fout'], labels: { 'getallenas-invullen': 'Invullen' } },
    { id: 'plaatswaarde', domein: 'Getallen', titel: 'Plaatswaarde: E, T, H en D', breedte: 2, aantal: [4, 6, 8], vormen: ['plaatswaarde', 'plaatswaarde-meerkeuze', 'plaatswaarde-kleuren', 'plaatswaarde-tabel', 'plaatswaarde-verbinden', 'plaatswaarde-mab-tekenen'], labels: { plaatswaarde: 'Invullen' } },
    // Meten
    { id: 'lengte', domein: 'Meten', titel: 'Lengtematen', breedte: 2, aantal: [6, 4, 8, 10], vormen: ['lengtematen-omzetten', 'lengtematen-vergelijken', 'lengtematen-ordenen', 'lengtematen-juist-fout', 'lengtematen-meerkeuze', 'lengtematen-tabel', 'lengtematen-verbinden', 'lengtematen-fout-zoeken', 'lengtematen-vraagstuk'], labels: { 'lengtematen-omzetten': 'Omzetten' } },
    { id: 'meetlat', domein: 'Meten', titel: 'Meetlat', breedte: 4, aantal: [3, 4, 6], vormen: ['lengte-aflezen', 'lengtematen-kleuren', 'lengtematen-tekenen'] },
    { id: 'massa', domein: 'Meten', titel: 'Massa', breedte: 2, aantal: [6, 4, 8, 10], vormen: ['massa-omzetten', 'massa-vergelijken', 'massa-ordenen', 'massa-juist-fout', 'massa-meerkeuze', 'massa-tabel', 'massa-verbinden', 'massa-fout-zoeken', 'massa-vraagstuk'], labels: { 'massa-omzetten': 'Omzetten' } },
    { id: 'weegschaal', domein: 'Meten', titel: 'Weegschaal', breedte: 4, aantal: [3, 4, 6], vormen: ['weegschaal-aflezen', 'weegschaal-tekenen', 'weegschaal-kies', 'weegschaal-juist-fout', 'weegschaal-fout'] },
    { id: 'tijdsduur', domein: 'Meten', titel: 'Tijdsduur', breedte: 2, aantal: [6, 4, 8, 10], vormen: ['tijdsduur-omzetten', 'tijdsduur-vergelijken', 'tijdsduur-ordenen', 'tijdsduur-juist-fout', 'tijdsduur-meerkeuze', 'tijdsduur-tabel', 'tijdsduur-verbinden', 'tijdsduur-fout-zoeken', 'tijdsduur-vraagstuk', 'tijdsduur-berekenen'], labels: { 'tijdsduur-omzetten': 'Omzetten' } },
    { id: 'dagen', domein: 'Meten', titel: 'Dagen en weken', breedte: 2, aantal: [4, 6, 8], vormen: ['dagen-berekenen', 'dagen-weekstrook', 'dagen-ordenen', 'dagen-verbinden', 'dagen-juist-fout', 'dagen-meerkeuze'] },
    // Kloklezen
    { id: 'klok', domein: 'Kloklezen', titel: 'Klok', breedte: 4, aantal: [4, 2, 3, 6], chipStandaard: { nauwkeurigheid: 'kwartier' }, vormen: ['klok-aflezen', 'klok-tekenen', 'klok-meerkeuze', 'klok-juist-fout', 'klok-verbinden', 'klok-ordenen', 'klok-uitspreken'] },
    { id: 'tijdsduur-klokken', domein: 'Kloklezen', titel: 'Tijdsduur tussen twee klokken', breedte: 4, aantal: [3, 2, 4], vormen: ['tijdsduur-klokken', 'tijdsduur-tijdlijn'] },
    // Geld
    { id: 'geld-tellen', domein: 'Geld', titel: 'Geld tellen', breedte: 4, aantal: [3, 2, 4, 6], chipStandaard: { nauwkeurigheid: '2' }, vormen: ['geld-munten-tellen', 'geld-munten-meerkeuze', 'geld-munten-juist-fout', 'geld-munten-verbinden'] },
    { id: 'geld-leggen', domein: 'Geld', titel: 'Een bedrag leggen', breedte: 4, aantal: [3, 2, 4], chipStandaard: { nauwkeurigheid: '2' }, vormen: ['geld-leggen'] },
    { id: 'geld-winkelen', domein: 'Geld', titel: 'Winkelen met wisselgeld', breedte: 2, aantal: [4, 3, 6], chipStandaard: { nauwkeurigheid: '2' }, vormen: ['geld-wisselgeld', 'geld-wisselgeld-meerkeuze', 'geld-wisselgeld-juist-fout', 'geld-winkelbon'] },
    { id: 'geld-totaal', domein: 'Geld', titel: 'Totaalprijs', breedte: 2, aantal: [4, 3, 6], chipStandaard: { nauwkeurigheid: '2' }, vormen: ['geld-totaalprijs', 'geld-totaal-fout-zoeken'] },
    { id: 'geld-vergelijken', domein: 'Geld', titel: 'Bedragen vergelijken en ordenen', breedte: 2, aantal: [4, 3, 6], chipStandaard: { nauwkeurigheid: '2' }, vormen: ['geld-vergelijken', 'geld-ordenen'] },
    { id: 'geld-omzetten', domein: 'Geld', titel: 'Euro en eurocent omzetten', breedte: 2, aantal: [6, 4, 8], vormen: ['geld-omzetten'] },
    // Breuken
    { id: 'breuken', domein: 'Breuken', titel: 'Breuken', breedte: 2, aantal: [4, 6, 8], vormen: ['breuk-noteren', 'breuk-meerkeuze', 'breuk-kleuren', 'breuk-juist-fout', 'breuk-stappenplan'] },
  ],
};
