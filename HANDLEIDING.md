# Handleiding voor leerkrachten

De werkbladgenerator maakt werkbladen voor één of meer leerlingen, op basis van de Op.stap-doelen. Je kan ze afdrukken, als PDF bewaren of als Word-bestand downloaden. Namen en instellingen blijven enkel op je eigen computer.

Open de generator via de website. Dubbelklikken op het bestand werkt niet.

## Een werkblad maken in zeven stappen

1. **Kies het vak.** Bijvoorbeeld Taal of Wiskunde.
2. **Kies de werkwijze.**
   - *Volgens Op.stap-doelen*: je kiest leerjaar en doelen, de tool stelt het blad samen.
   - *Zelf samenstellen met blokjes*: je bouwt het blad zelf op en bepaalt de volgorde. Je kan altijd wisselen; een blad uit de doelen kan je daarna met blokjes aanpassen.
3. **Kies het leerjaar en de doelen.** Met "Toon ook lager" en "Toon ook hoger" zie je ook doelen van andere leerjaren. Zoeken kan op een woord uit het doel. Vink de doelen aan die je wil oefenen.
4. **Extra keuzes.** Onder de doelen verschijnen soms keuzes (bijvoorbeeld welke uitgang bij meervouden, hoe lang de woorden zijn, of er plaatjes staan). Laat je ze leeg, dan krijg je alles door elkaar.
5. **Kies of voeg leerlingen toe.** Plak een lijst namen en kies per leerling het niveau en het aantal blokken per doel. Elke leerling krijgt een eigen blad.
6. **Maak het werkblad.** Klik op *Maak werkblad*. Staat er iets niet goed, klik dan bij een blokje op ↻ (nieuwe oefening) of ✕ (weglaten), of op *Alle bladen opnieuw maken*.
7. **Opslaan of afdrukken.** *Afdrukken of opslaan als PDF*, of *Word (.docx) downloaden* (één bestand of per leerling een apart bestand in een zip).

## Het blad aanpassen

Onder *Opmaak van het blad*:

- **Lettertype en grootte.** Andika is het leesvriendelijkst voor beginnende lezers.
- **Schrijflijnen (taal).** Smal, normaal of ruim, zoals het schrijfpapier van de leerling.
- **Doel bovenaan het blad tonen.** Standaard staat het doel niet op het blad.
- **Schema bij dit blad (spelling).** Zet bovenaan een schema van een spellingregel. Zonder keuze staat er geen schema.
- **Antwoordblad voor de leerkracht.** Een extra blad met de antwoorden. Bij vrije opdrachten staat er een voorbeeld en een controlelijst.
- **Boodschap voor thuis** en **titel van het blad**.
- Het **logo** kan printvriendelijk (grijs) of vervangen worden.

## Wat staat er op een Taalblad?

Alle oefeningen staan onder elkaar over de volle breedte. Elke opdracht heeft een nummer, een pictogram en de opdracht zelf. Bij Taal zie je onder meer:

- **Schrijven met plaatjes en zinnen**: een woord bij het plaatje schrijven, een zin afmaken, zinnen uitbreiden of verbinden, een plaatjesreeks in volgorde zetten.
- **Spelling**: naast invullen en kiezen ook denk- en schrijfvormen (welk woord werkt hetzelfde, sorteer de woorden, schrijf zelf een woord, leg uit waarom).
- **Lezen**: woorden, zinnen en korte teksten, met vragen op niveau, zinnen in volgorde, het antwoord in de tekst zoeken en bij de tekst tekenen.

Bij vormen waarbij de leerling zelf schrijft of tekent, beoordeel jij het werk. Het antwoordblad toont dan een voorbeeld en wat je kan nakijken.

## Een blad bewaren en later terugvinden

- **Bladcode.** Onderaan elk blad staat een code. Plak die onder *Of open een blad met de bladcode* en je krijgt exact hetzelfde blad terug. Verandert de woordenlijst of de tekstenmap, dan kan een oud blad er anders uitzien.
- **Blad bewaren als bestand** en **Blad openen uit bestand** werken zonder code.
- **Leerlingen opslaan als bestand** bewaart de namen en instellingen. Handig als je van computer wisselt.

## Eigen schema's en teksten toevoegen

Deze twee mappen staan in de projectmap. Ze zijn leeg tot jullie ze vullen. De tool schrijft er zelf niets in.

### Spellingschema's (`assets/spellingschema/`)

1. Zet een afbeelding (png, jpg, svg) in de map, bijvoorbeeld `meervoud-en-s.png`.
2. Wil je een titel en uitleg? Maak `meervoud-en-s.txt`: eerste regel de titel, daaronder de uitleg.
3. Een **stappenplan**? Zet op de tweede regel `Soort: stappenplan`. Elke regel daarna is een stap.
4. Laat de lijst opnieuw maken met `node scripts/schema-index.mjs`, of vraag het aan wie de tool beheert.

Het schema verschijnt daarna in de keuzelijst *Schema bij dit blad*.

### Leesteksten (`assets/leesteksten/`)

Maak een `.txt` met zelf gekozen naam:

```
Titel: De fiets
Leerjaar: 2
Volgorde: ja
Tekst: Eerst pompt Lotte haar banden op. Dan zet ze haar helm op. Daarna fietst ze naar school.
Vraag: Wat pompt Lotte op? | haar banden | haar ballon | haar bal
Vraag: Waarom zet ze haar helm op? | Dat is veilig. | Dat is mooi. | Het regent. | afleiden
```

- `Volgorde: ja` enkel als de zinnen op elkaar volgen in de tijd.
- Elke vraag heeft vier delen: de vraag, het juiste antwoord en twee foute. Een vijfde deel (`letterlijk` of `afleiden`) bepaalt het niveau.
- Laat de lijst opnieuw maken met `node scripts/leesteksten-index.mjs`. Het script meldt fouten in je bestand.

Meer uitleg staat in de README in elke map.

## Goed om te weten

- Niet elk doel heeft een automatische oefening. Bij doelen met enkel een open opdracht beoordeel jij zelf wat de leerling doet. Zet daarvoor het vinkje *Toon ook doelen met enkel een open opdracht* aan.
- Zijn er te weinig verschillende oefeningen mogelijk, dan komen er herhalingen en toont de tool een waarschuwing.
- De zinnen, teksten en tekeningen bij de nieuwe oefenvormen zijn door de bouwer geschreven. Laat ze nakijken en meld wat niet klopt.
- Een overzicht van welke doelen hoeveel oefeningen hebben staat in `ontwikkel/taal-dekking.md`.
