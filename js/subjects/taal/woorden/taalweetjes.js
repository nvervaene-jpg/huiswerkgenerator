// Gegevens voor de weetjes over woordsoorten: lidwoord, eigennaam, werkwoord, bijvoeglijk naamwoord, telwoord, voorzetsel, voegwoord en voornaamwoord.
// Dit bestand mag je als leerkracht aanpassen of aanvullen. De tests in tests/taal-weetjes.test.mjs controleren elke regel.

// [zelfstandig naamwoord, lidwoord]
export const LIDWOORD_ZN = [['hond', 'de'], ['fiets', 'de'], ['boom', 'de'], ['tafel', 'de'], ['jas', 'de'], ['school', 'de'], ['kat', 'de'], ['bal', 'de'], ['kind', 'het'], ['huis', 'het'], ['boek', 'het'], ['paard', 'het'], ['meisje', 'het'], ['konijn', 'het'], ['raam', 'het'], ['water', 'het']];

// [juiste schrijfwijze, foute schrijfwijze]
export const EIGENNAMEN = [['Mila', 'mila'], ['Lars', 'lars'], ['Brussel', 'brussel'], ['Gent', 'gent'], ['Noor', 'noor'], ['Antwerpen', 'antwerpen'], ['Emma', 'emma'], ['België', 'belgië'], ['Sam', 'sam'], ['Brugge', 'brugge']];

// [werkwoord, woorden die geen werkwoord zijn]
export const WERKWOORDEN = [['lopen', ['stoel', 'rood']], ['zingen', ['tafel', 'groot']], ['rennen', ['boom', 'blij']], ['slapen', ['kast', 'snel']], ['lezen', ['boek', 'klein']], ['eten', ['brood', 'zacht']], ['springen', ['bal', 'hoog']], ['tekenen', ['potlood', 'mooi']]];

// [zin, bijvoeglijk naamwoord, zelfstandig naamwoord, werkwoord]; het bijvoeglijk naamwoord staat vóór het zelfstandig naamwoord
export const BIJVOEGLIJK_VOOR = [['De rode bal rolt weg.', 'rode', 'bal', 'rolt'], ['Een kleine hond blaft.', 'kleine', 'hond', 'blaft'], ['Het oude huis staat leeg.', 'oude', 'huis', 'staat'], ['Mila draagt een warme jas.', 'warme', 'jas', 'draagt'], ['De snelle fiets staat buiten.', 'snelle', 'fiets', 'staat'], ['Lars leest een dik boek.', 'dik', 'boek', 'leest'], ['De zwarte kat slaapt.', 'zwarte', 'kat', 'slaapt'], ['Noor heeft een nieuwe pen.', 'nieuwe', 'pen', 'heeft']];
// [zin, bijvoeglijk naamwoord, plaats]: 'voor' = vóór het zelfstandig naamwoord, 'na' = na het werkwoord
export const BIJVOEGLIJK_PLAATS = [['De bal is rood.', 'rood', 'na'], ['De rode bal rolt.', 'rode', 'voor'], ['De hond is klein.', 'klein', 'na'], ['Een kleine hond blaft.', 'kleine', 'voor'], ['Het huis is oud.', 'oud', 'na'], ['Het oude huis staat leeg.', 'oude', 'voor'], ['De jas is warm.', 'warm', 'na'], ['Een warme jas hangt aan de haak.', 'warme', 'voor']];

// [getal, telwoord]
export const TELWOORDEN = [[1, 'één'], [2, 'twee'], [3, 'drie'], [4, 'vier'], [5, 'vijf'], [6, 'zes'], [7, 'zeven'], [8, 'acht'], [9, 'negen'], [10, 'tien'], [11, 'elf'], [12, 'twaalf'], [13, 'dertien'], [14, 'veertien'], [15, 'vijftien'], [16, 'zestien'], [17, 'zeventien'], [18, 'achttien'], [19, 'negentien'], [20, 'twintig'], [30, 'dertig'], [40, 'veertig'], [50, 'vijftig'], [100, 'honderd']];

// [zin, voorzetsel, twee woorden die geen voorzetsel zijn]
export const VOORZETSEL_ZINNEN = [['De kat zit op de stoel.', 'op', ['kat', 'zit']], ['Mila wacht voor de deur.', 'voor', ['Mila', 'wacht']], ['Het boek ligt onder de tafel.', 'onder', ['boek', 'ligt']], ['Lars loopt naar school.', 'naar', ['Lars', 'loopt']], ['De vogel vliegt boven het huis.', 'boven', ['vogel', 'vliegt']], ['Noor speelt met haar broer.', 'met', ['Noor', 'speelt']], ['De bal rolt achter de kast.', 'achter', ['bal', 'rolt']], ['Wij fietsen door het park.', 'door', ['fietsen', 'park']]];
// [zin met een open plaats, voorzetsel, twee voorzetsels die niet passen]
export const VOORZETSEL_GEBRUIK = [['Ik denk ____ jou.', 'aan', ['boven', 'onder']], ['Hij wacht ____ zijn vriend.', 'op', ['onder', 'tussen']], ['Zij kijkt ____ de tv.', 'naar', ['onder', 'door']], ['Wij gaan ____ school.', 'naar', ['boven', 'onder']], ['Het kind speelt ____ zijn broer.', 'met', ['onder', 'tussen']], ['Hij is bang ____ de hond.', 'voor', ['onder', 'boven']], ['Ik hou ____ chocolade.', 'van', ['boven', 'onder']]];

// [zin, voegwoord, twee woorden die geen voegwoord zijn]
export const VOEGWOORD_ZINNEN = [['Ik blijf thuis, want het regent.', 'want', ['thuis', 'regent']], ['Mila speelt buiten en Lars leest.', 'en', ['buiten', 'leest']], ['Ik ben moe, maar ik speel nog.', 'maar', ['moe', 'speel']], ['Ik spaar geld zodat ik een fiets kan kopen.', 'zodat', ['spaar', 'kopen']], ['Ik blijf thuis omdat ik ziek ben.', 'omdat', ['thuis', 'ziek']], ['Het regent, dus ik neem een paraplu mee.', 'dus', ['regent', 'paraplu']]];
// [zin met een open plaats, voegwoord, twee voegwoorden die niet passen]
export const VOEGWOORD_GEBRUIK = [['Ik eet een appel ____ een peer.', 'en', ['omdat', 'maar']], ['Ik spaar geld, ____ ik een fiets kan kopen.', 'zodat', ['maar', 'want']], ['Ik ben ziek, ____ ik blijf thuis.', 'dus', ['want', 'omdat']], ['Ik blijf thuis ____ ik ziek ben.', 'omdat', ['en', 'dus']], ['Ik wil buiten spelen, ____ het regent.', 'maar', ['omdat', 'dus']], ['Hij is blij, ____ hij heeft gewonnen.', 'want', ['omdat', 'maar']]];

// [zin met een open plaats, voornaamwoord, twee voornaamwoorden die niet passen]
export const VOORNAAMWOORD_GEBRUIK = [['Mila is moe. ____ gaat slapen.', 'Zij', ['Hij', 'Ik']], ['Lars speelt buiten. ____ heeft veel plezier.', 'Hij', ['Zij', 'Ik']], ['De kinderen zingen. ____ zijn blij.', 'Zij', ['Hij', 'Ik']], ['Ik heet Noor. ____ ben acht jaar.', 'Ik', ['Hij', 'Zij']], ['Jij hebt een fiets. ____ fietst naar school.', 'Jij', ['Hij', 'Ik']], ['Emma en ik zijn vrienden. ____ spelen samen.', 'Wij', ['Hij', 'Zij']], ['Het meisje lacht. ____ heeft een grapje gehoord.', 'Zij', ['Hij', 'Wij']], ['Sam en jij zijn broers. ____ zijn samen op school.', 'Jullie', ['Hij', 'Ik']]];
