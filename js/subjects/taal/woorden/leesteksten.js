// Korte leesteksten met vragen voor de open leesopdrachten. Dit bestand mag je als leerkracht aanpassen of aanvullen.
// Per leerjaar (L1 tot L6) minstens twee teksten. Elke vraag heeft het juiste antwoord ('juist') en twee foute antwoorden ('fout').
// De tests controleren dat elk leerjaar teksten heeft, dat elke vraag drie verschillende antwoorden heeft en dat het juiste antwoord niet leeg is.
export const LEESTEKSTEN = {
  L1: [
    { titel: 'De kat van Mia', tekst: 'Mia heeft een kat. De kat heet Pip. Pip is zwart en wit. Pip drinkt melk. Pip slaapt op de bank.', vragen: [
      { vraag: 'Hoe heet de kat?', juist: 'Pip', fout: ['Mia', 'Max'] }, { vraag: 'Welke kleuren heeft Pip?', juist: 'zwart en wit', fout: ['bruin en wit', 'grijs'] }, { vraag: 'Waar slaapt Pip?', juist: 'op de bank', fout: ['in de mand', 'in de tuin'] }] },
    { titel: 'Naar school', tekst: 'Tom gaat naar school. Hij fietst met papa. Het regent. Tom draagt een gele jas. Op school is zijn vriend Sam er al.', vragen: [
      { vraag: 'Hoe gaat Tom naar school?', juist: 'met de fiets', fout: ['te voet', 'met de bus'] }, { vraag: 'Welk weer is het?', juist: 'Het regent.', fout: ['Het sneeuwt.', 'De zon schijnt.'] }, { vraag: 'Welke kleur heeft de jas van Tom?', juist: 'geel', fout: ['rood', 'blauw'] }] },
  ],
  L2: [
    { titel: 'De bakker', tekst: 'Elke ochtend staat de bakker al vroeg op. Hij maakt brood, koeken en taarten. De geur van vers brood komt tot op straat. Om zeven uur gaat de winkel open. Dan komen de eerste klanten. Zij kopen een brood en soms een koek.', vragen: [
      { vraag: 'Hoe laat gaat de winkel open?', juist: 'om zeven uur', fout: ['om acht uur', 'om zes uur'] }, { vraag: 'Wat ruik je tot op straat?', juist: 'vers brood', fout: ['verse koffie', 'verse koeken'] }, { vraag: 'Wat maakt de bakker niet?', juist: 'pizza', fout: ['brood', 'taarten'] }] },
    { titel: 'Het zwembad', tekst: 'Op woensdag gaat klas 2 zwemmen. De kinderen nemen een handdoek en een zwembroek of badpak mee. Eerst douchen ze. Dan oefenen ze met de zwemjuf. Aan het einde mogen ze nog even spelen in het water.', vragen: [
      { vraag: 'Wanneer gaat klas 2 zwemmen?', juist: 'op woensdag', fout: ['op maandag', 'op vrijdag'] }, { vraag: 'Wat doen de kinderen eerst?', juist: 'Ze douchen.', fout: ['Ze spelen.', 'Ze oefenen.'] }, { vraag: 'Met wie oefenen ze?', juist: 'met de zwemjuf', fout: ['met de juf van de klas', 'met papa'] }] },
  ],
  L3: [
    { titel: 'De bij', tekst: 'Een bij verzamelt nectar uit bloemen. Met haar lange tong zuigt ze het sap op. Terug in de bijenkorf maken de bijen er honing van. In één korf wonen duizenden bijen. Elke bij heeft een eigen taak: sommige bijen zoeken eten, andere zorgen voor de baby\'s.', vragen: [
      { vraag: 'Wat verzamelt een bij uit bloemen?', juist: 'nectar', fout: ['honing', 'water'] }, { vraag: 'Wat maken de bijen van de nectar?', juist: 'honing', fout: ['suiker', 'was'] }, { vraag: 'Hoeveel bijen wonen er in één korf?', juist: 'duizenden', fout: ['een tiental', 'één'] }] },
    { titel: 'Een regenachtige zondag', tekst: 'Het had de hele nacht geregend. Lisa keek uit het raam en zuchtte. Buiten kon ze niet spelen. Daarom haalde ze een oude doos met spelletjes uit de kast. Samen met haar broer bouwde ze een groot kasteel van kussens. Op het einde van de dag vond ze het toch een fijne zondag.', vragen: [
      { vraag: 'Waarom zuchtte Lisa?', juist: 'Ze kon niet buiten spelen.', fout: ['Ze was moe.', 'Ze had honger.'] }, { vraag: 'Wat bouwden Lisa en haar broer?', juist: 'een kasteel van kussens', fout: ['een hut in de tuin', 'een toren van blokken'] }, { vraag: 'Hoe vond Lisa de zondag op het einde?', juist: 'fijn', fout: ['saai', 'koud'] }] },
  ],
  L4: [
    { titel: 'Het regenwoud', tekst: 'In het regenwoud regent het bijna elke dag. Het is er warm en vochtig. Daardoor groeien er enorm veel planten. De bomen zijn soms wel veertig meter hoog. In het bladerdak leven apen, papegaaien en insecten. Het regenwoud is belangrijk voor de aarde, want de bomen maken zuurstof. Helaas worden er elk jaar grote stukken gekapt.', vragen: [
      { vraag: 'Hoe is het weer in het regenwoud?', juist: 'warm en vochtig', fout: ['koud en droog', 'warm en droog'] }, { vraag: 'Waarom is het regenwoud belangrijk?', juist: 'De bomen maken zuurstof.', fout: ['Er leven geen dieren.', 'Het regent er nooit.'] }, { vraag: 'Wat gebeurt er elk jaar helaas?', juist: 'Er worden grote stukken gekapt.', fout: ['Er komen nieuwe bomen bij.', 'Het wordt er kouder.'] }] },
    { titel: 'De brandweer', tekst: 'Als er brand is, belt iemand het noodnummer 112. De brandweer rukt dan snel uit met een rode wagen. Brandweermannen en brandweervrouwen dragen speciale kleren die tegen hitte beschermen. Ze blussen het vuur met water of schuim. Soms redden ze ook mensen of dieren uit gevaarlijke situaties.', vragen: [
      { vraag: 'Welk nummer bel je bij brand?', juist: '112', fout: ['101', '911'] }, { vraag: 'Waarmee blussen ze het vuur?', juist: 'met water of schuim', fout: ['met zand', 'met sneeuw'] }, { vraag: 'Waarom dragen ze speciale kleren?', juist: 'Die beschermen tegen hitte.', fout: ['Dat is mooier.', 'Dan blijven ze droog.'] }] },
  ],
  L5: [
    { titel: 'Een eeuw geleden', tekst: 'Honderd jaar geleden zag het dagelijks leven er heel anders uit. De meeste huizen hadden nog geen stromend water of elektriciteit. Kinderen gingen te voet naar school en schreven met een griffel op een lei. Wie ziek was, moest wachten tot de dokter langs kwam met zijn paard en kar. Toch hadden kinderen toen ook tijd om buiten te spelen met een hoepel of een tol.', vragen: [
      { vraag: 'Wat ontbrak er in de meeste huizen?', juist: 'stromend water en elektriciteit', fout: ['bedden en tafels', 'ramen en deuren'] }, { vraag: 'Waarmee schreven de kinderen?', juist: 'met een griffel op een lei', fout: ['met een balpen', 'met een potlood op een tablet'] }, { vraag: 'Hoe kwam de dokter bij zieke mensen?', juist: 'met paard en kar', fout: ['met de auto', 'met de trein'] }] },
    { titel: 'Recycleren', tekst: 'Elk gezin gooit dagelijks afval weg. Door dat afval te sorteren kunnen veel grondstoffen opnieuw gebruikt worden. Papier wordt nieuw papier, glas wordt gesmolten tot nieuwe flessen en plastic kan tot kleding verwerkt worden. Zo hoeven er minder bomen gekapt en minder grondstoffen gedolven te worden. Recycleren is dus goed voor het milieu.', vragen: [
      { vraag: 'Wat wordt er van oud papier gemaakt?', juist: 'nieuw papier', fout: ['nieuwe flessen', 'kleding'] }, { vraag: 'Waarom is recycleren goed voor het milieu?', juist: 'Er worden minder bomen gekapt en minder grondstoffen gedolven.', fout: ['Er komt meer afval.', 'Er worden meer fabrieken gebouwd.'] }, { vraag: 'Wat wordt er van glas gemaakt?', juist: 'nieuwe flessen', fout: ['nieuw papier', 'plastic'] }] },
  ],
  L6: [
    { titel: 'De waterkringloop', tekst: 'Water gaat altijd rond. De zon verwarmt zeeën en rivieren, waardoor water verdampt tot waterdamp. Hoog in de lucht koelt die damp af en vormt kleine druppeltjes: wolken. Als de druppels zwaar genoeg zijn, valt het water als regen, sneeuw of hagel naar beneden. Het water stroomt via beken en rivieren terug naar zee en het verhaal begint opnieuw. Dit noemen we de waterkringloop.', vragen: [
      { vraag: 'Wat gebeurt er als de zon het water verwarmt?', juist: 'Het water verdampt.', fout: ['Het water bevriest.', 'Het water verdwijnt voorgoed.'] }, { vraag: 'Waaruit bestaan wolken?', juist: 'uit kleine druppeltjes', fout: ['uit rook', 'uit zout'] }, { vraag: 'Hoe heet dit hele verhaal?', juist: 'de waterkringloop', fout: ['de regencyclus', 'de zeestroom'] }] },
    { titel: 'Een uitvinding door toeval', tekst: 'Soms ontstaat een grote uitvinding bij toeval. Alexander Fleming merkte in 1928 dat er schimmel op een vergeten bord met bacteriën groeide. Rond de schimmel stierven de bacteriën. Zo ontdekte hij penicilline, het eerste antibioticum. Dankzij die ontdekking kunnen veel infecties vandaag genezen worden. De wetenschapper had dus opmerkzaamheid én geluk nodig.', vragen: [
      { vraag: 'Wat merkte Fleming op?', juist: 'Rond de schimmel stierven de bacteriën.', fout: ['De schimmel stierf.', 'De bacteriën groeiden sneller.'] }, { vraag: 'Hoe heet het eerste antibioticum?', juist: 'penicilline', fout: ['aspirine', 'vitamine'] }, { vraag: 'Waarom had Fleming ook geluk nodig?', juist: 'De ontdekking gebeurde bij toeval.', fout: ['Hij kreeg veel geld.', 'Hij werd beroemd.'] }] },
  ],
};

// Voorbeeldzinnen om over te schrijven (handschrift).
export const SCHRIJFZINNEN = [
  'De zon schijnt op het water.', 'Mijn vriend woont in de straat naast de school.', 'Op zaterdag gaan wij fietsen in het bos.', 'De kleine hond rent achter de bal.',
  'In de herfst vallen de bladeren van de bomen.', 'Ik lees graag een boek voor het slapengaan.', 'Een vlinder landt zachtjes op de bloem.', 'Samen bouwen wij een toren van blokken.',
  'Het regent, dus pakken we onze regenjas.', 'De bakker maakt elke dag vers brood.',
];
