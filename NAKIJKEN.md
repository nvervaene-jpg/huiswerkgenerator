# Nakijklijst voor een collega

De tool is gebouwd door Claude (een AI-assistent). De **structuur** is getest, maar de **inhoud die Claude zelf geschreven heeft** (woorden, zinnen, contexten) is door geen enkele leerkracht nagekeken. Vraag een collega om dit door te nemen vóór de bladen met leerlingen gebruikt worden. Fouten kan je rechtstreeks in de genoemde bestanden verbeteren; de tests melden het als een lijst niet meer klopt.

Wat wel van buiten komt: de Op.stap-doelen en -codes (uit het officiële document) en de foto's van echt geld (door de school aangeleverd). Er zijn geen doelen of codes verzonnen.

## Wiskunde

| Wat | Bestand | Waar op letten |
|---|---|---|
| Kleuteroefeningen (K3): vergelijken, ordenen, meten met blokjes, geld, dag en week, plaatsbegrippen, klasstatistiek | `js/subjects/wiskunde/generators/auto-kleuter.js`, `auto-ruimte.js`, `js/subjects/wiskunde/kleuter-svg.js` | Zijn de zinnen en woorden begrijpelijk voor 5-jarigen? Kloppen de tekeningen met de vraag? |
| Meetinzichten, maatbegrippen en meetinstrumenten juist gebruiken | `generators/auto-meten.js`, `auto-meten2.js`, `auto-meten3.js` | Kloppen de stellingen en de "juist of fout"-keuzes inhoudelijk? Is de woordkeuze die van jullie methode? |
| Contexten van vraagstukjes (namen, thema's, voorwerpen, prijzen) | `js/subjects/wiskunde/contexten.js` | Passen namen, prijzen en situaties bij de leeftijd en bij België? |
| Open opdrachten (uitleggen, zelf een voorbeeld maken, beoordelen met gezichtjes) | `generators/open.js` | Zijn de opdrachten haalbaar en goed geformuleerd? |
| MAB-kleuren en geldfoto's | `svg.js` (`MAB`), `assets/geld/` | Geel, groen, blauw, rood volgens de afspraak. De munt van 5 cent heeft nog geen foto. |

## Taal

Alle woordenlijsten staan in `js/subjects/taal/woorden/`. Elke regel is `[juist woord, fout woord, ...]`. Controleer vooral of het **foute** woord echt een foute schrijfwijze is en geen bestaand woord, en of het **juiste** woord goed gespeld is.

| Wat | Bestand |
|---|---|
| Klanken, lettergroepen en achtervoegsels (ei/ij, ou/au, -ig/-lijk, vreemde woorden op -a, ...) | `woorden/klanken.js` |
| Meervoud, verkleinwoord, verenkelen en verdubbelen | `woorden/meervouden.js`, `verkleinwoorden.js`, `verenkelen-verdubbelen.js` |
| Werkwoorden, woordsoorten, zinsdelen, samenstellingen, bezit | `woorden/werkwoorden.js`, `woordsoorten.js`, `zinsdelen.js`, `samenstellingen.js`, `bezit.js` |
| Hoofdletters, eindletters (-d/-t, -p/-b), speciale woorden | `woorden/hoofdletters.js`, `eindletters.js`, `speciaal.js` |
| Begrippen, taalkunde, taalgebruik, taalweetjes | `woorden/begrippen.js`, `taalkunde.js`, `taalgebruik.js`, `taalweetjes.js` |
| Dictee met plaatje | `woorden/plaatjes.js` |
| Lezen: zinnen en leesteksten met vragen | `woorden/lezen.js`, `woorden/leesteksten.js` |
| Schrijven en open opdrachten | `woorden/schrijven.js`, `generators/open.js` |

Bij de leesteksten: zijn de tekst en de vragen geschikt voor het leerjaar (woordenschat, lengte, moeilijkheid)? Kloppen de woordtellingen? Kan een leerling de antwoorden vinden in de tekst? Echte teksten uit jullie leesmateriaal kan je toevoegen in `assets/leesteksten/` (zie de handleiding).

## Hoe nakijken

1. Open de tool, kies een doel en bekijk het blad op papier of in Word. Dat is de snelste manier om fouten te zien.
2. Noteer per fout de bladcode (staat onderaan het blad) en wat er niet klopt.
3. Corrigeer in het genoemde bestand, of stuur de lijst door; bij een wijziging draait Claude de tests opnieuw.

## Nog te beslissen (hier kan alleen een leerkracht een knoop doorhakken)

- Notatie van de staartdeling.
- Welke naam jullie gebruiken voor het eerste en tweede getal bij vermenigvuldigen (vermenigvuldiger en vermenigvuldigtal), en of de tool die woorden mag gebruiken.
- Voor acht spellingdoelen (1.3.GL1.14, 1.3.GL1.19, 1.3.GL2.18, 1.3.GL2.22, 1.3.GL4.10, 1.3.GL6.7, 1.3.GL6.8, 1.3.GL6.9) ontbreken voorbeeldwoorden of een oefenvorm; die doelen hebben voorlopig enkel een open opdracht.
- Feedback van de logopediste over de lees- en schrijfoefeningen.
