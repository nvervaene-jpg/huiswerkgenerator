# Testplan werkbladgenerator

Doel: nagaan of de tool bruikbaar is voor collega's, voor we verder bouwen.
Noteer bij elk probleem **de bladcode** (staat onderaan elk blad) en wat je verwachtte. Met de bladcode maak ik exact hetzelfde blad opnieuw.

## 0. Openen
- [ ] De tool opent via de website (GitHub Pages). Niet door `index.html` te dubbelklikken.
- [ ] Er staan "Wiskunde" en "Taal" actief, "Wereldoriëntatie" grijs met "binnenkort".

## 1. Doelen kiezen (stap 2 en 3)
- [ ] Kies 2de leerjaar. Je ziet doelen van het 1ste, 2de en 3de leerjaar. Zet "Toon ook lager/hoger" op "geen": enkel 2de leerjaar.
- [ ] "Ook verdiepende doelen" voegt doelen toe.
- [ ] Alle getoonde doelen kun je aanvinken (er zijn er 100 met een generator).
- [ ] Filter op domein werkt.
- [ ] Zoekbalk in stap 3: typ een woord (bv. `klok`) of een code (`2.3.GL2.16`). Je ziet meteen enkel de passende doelen, uit alle leerjaren, met het woord geel gemarkeerd. Meerdere woorden moeten allemaal voorkomen. Escape of "Wis zoekopdracht" maakt de balk leeg. Aangevinkte doelen blijven aangevinkt tijdens het zoeken.

## 2. Leerlingen (stap 4 en 5)
- [ ] Plak 5 namen onder elkaar: ze komen in de lijst. Plak dezelfde namen nog eens: er komen geen dubbels.
- [ ] Stel per leerling niveau, aantal en getallengebied in. Sluit de tab en open ze opnieuw: alles staat er nog.
- [ ] "Leerlingen opslaan als bestand": er wordt een .json gedownload. Verwijder een leerling en lees het bestand in: de leerling is terug, met zijn instellingen.
- [ ] "Toon niveau en doelen" zet het leerjaar en de eerder gebruikte doelen van die leerling terug in stap 2 en 3.

## 3. Werkblad (stap 6)
- [ ] "Maak werkblad" geeft per aangevinkte leerling een blad met de naam ingevuld.
- [ ] "Nieuwe getallen" geeft andere oefeningen. Plak de bladcode in het veld en klik "Open": je krijgt het vorige blad terug.
- [ ] Binnen een blok lopen de oefeningen op van makkelijk naar moeilijk.
- [ ] Er staan geen dubbele oefeningen op een blad.
- [ ] Alle getallen blijven binnen het getallengebied van de leerling.
- [ ] Opmaak: lettertype, grootte, printvriendelijk logo, eigen logo, titel, "Boodschap voor thuis".
- [ ] Antwoordblad aan: er komt een extra pagina met de antwoorden. Controleer er een paar met de hand.

## 3b. Aanpassen in het voorbeeld
Maak een blad voor 2de leerjaar met de doelen 2.3.GL2.16 (lengtematen) en 2.3.GL2.21 (meetlat). Zet het getallengebied op 1 000.
- [ ] Standaard zie je 3 blokken per doel (dus 6 blokken), afwisselend voor beide doelen. Bij elk blok staat het doel en de oefenvorm.
- [ ] Per oefening: "✕" laat ze weg, "↻" vervangt ze door een nieuwe van hetzelfde type. De andere oefeningen en blokken blijven staan.
- [ ] Per blok: "+ oefening", "↻ blok opnieuw" en "✕ blok" werken. Onderaan voeg je met "+ blok toevoegen" een extra oefenvorm toe.
- [ ] "↶ Ongedaan maken" maakt de laatste aanpassing ongedaan, meerdere keren na elkaar.
- [ ] Kopieer de bladcode, plak ze in het veld en klik "Open": je krijgt je aangepaste blad exact terug.
- [ ] Antwoordblad aan: er staan titels per blok en voor verbinden, tabel, kleuren en tekenen een getekende oplossing.
- [ ] Verander "Blokken per doel" en "Oefeningen per blok" bij een leerling en maak het blad opnieuw.
- [ ] Voor de vraagstukjes: kies bij "Extra keuzes" een thema. Zijn de zinnen correct Nederlands en realistisch? (Een zwembad is geen 4 m lang.)
- [ ] Teken-oefening: print het blad. Is de lijn van 7 cm die in de oplossing staat echt 7 cm op papier?

## 4. Per soort oefening: klopt het?
Alle onderdelen hebben nu meerdere oefenvormen. Kies per rij een paar doelen, maak een blad en controleer een paar oefeningen met de hand (het antwoordblad helpt).

| Onderdeel | Vormen | Waar op letten |
|---|---|---|
| Lengte, gewicht, tijdsduur, euro en eurocent | omzetten (ook `___ m = 300 cm`), vergelijken, ordenen, verbinden, juist/fout, meerkeuze, tabel, fout zoeken, vraagstukje, welke eenheid past | Klopt elke omzetting? Is er bij meerkeuze precies één goed antwoord? Zijn de vraagstukjes realistisch (een slang is 50 tot 300 cm)? |
| Lengte en gewicht | meetlat of weegschaal aflezen, balk kleuren, lijn tekenen, wijzer tekenen | Staat de wijzer op de juiste plaats? Is de getekende lijn van 7 cm echt 7 cm op papier? |
| Klok | aflezen, wijzers tekenen, verbinden, ordenen, juist/fout, meerkeuze, de tijd in woorden | Klopt "half vier" = 3:30 en "kwart voor vier" = 3:45? Staan de wijzers goed? |
| Tijdsduur berekenen, dagen | twee klokken, tijdlijn, weekstrook, ordenen, verbinden, juist/fout, meerkeuze | Klopt de duur? Staan de dagen in de juiste volgorde? |
| Geld | munten tellen (+ meerkeuze, juist/fout, verbinden), een bedrag leggen, vergelijken, ordenen, winkelbon, wisselgeld, totaalprijs | Klopt het getekende bedrag? Is het wisselgeld juist? |
| Getallen vergelijken en ordenen | omcirkelen, juist/fout, meerkeuze, vraagstukje, voorganger/opvolger, fout in de rij | Klopt <, > en =? Is er één fout in de rij? |
| Getallenas | invullen, pijl aflezen, pijl tekenen, letters, juist/fout | Wijst de pijl op het goede streepje? |
| Splitsen en plaatswaarde | splitshuisje, tabel, verbinden, juist/fout, vraagstukje, cijfer kleuren, MAB verbinden en tekenen, plaatswaardetabel, meerkeuze | Telt het MAB-materiaal op tot het getal? Klopt de tabel? |
| Optellen en aftrekken | invullen (ook `3 + ___ = 8`), juist/fout, meerkeuze, verbinden, tabel, fout zoeken, vraagstukje, splits en reken, sprongen, met of zonder brug | Klopt "zonder/met brug"? (7 + 3 = 10 is zonder brug.) Kun je bij "Extra keuzes" de brug instellen? |
| Maaltafels en delen | invullen, juist/fout, meerkeuze, verbinden, tabel, fout zoeken, vraagstukje, stippenrooster, veelvouden kleuren, omcirkelen, uitsplitsen | Komen enkel de gekozen tafels voor? |

## 4a. Referentiematen, vergelijken en weegschaal (nieuwe vormen)
- [ ] Referentiematen (bv. 2.3.GL1.15 lengte, 2.3.GL3.34 massa, 2.3.GL2.44 tijd, 2.3.GL3.44 eurocent): naast "welke eenheid past" nu ook "welk getal past", juist of fout, voorwerpen ordenen, voorwerp en maat verbinden en "welk is het grootst". Zijn de schattingen realistisch (een potlood van 18 cm, een zak aardappelen van 5 kg)?
- [ ] Vergelijken met verschillende eenheden (bv. 2.3.GL3.9, 2.3.GL4.8): eerst omzetten, kiezen welke het grootst is, en een fout verbeteren (iemand keek enkel naar de getallen).
- [ ] Weegschaal (2.3.GL1.25, 2.3.GL2.28, 2.3.GL3.37): kies het juiste gewicht, juist of fout en fout aflezen verbeteren. Klopt het antwoord bij de wijzer?

## 4b. Taal (verenkelen en verdubbelen)
- [ ] Kies "Taal": enkel 1ste tot 6de leerjaar, geen getallengebied bij de leerlingen, 693 doelen waarvan er 9 een generator hebben (verenkelen en verdubbelen, meervouden, verkleinwoorden).
- [ ] Vink 1.3.GL2.27, 1.3.GL3.16 en 1.3.GL4.18 aan. Elk blok volgt het niveau van zijn doel: 2de leerjaar = frequente woorden, 3de = twee lettergrepen in het meervoud, 4de = drie of meer.
- [ ] Extra keuze "Welke regel oefenen?": enkel verdubbelen (man - mannen) of enkel verenkelen (maan - manen).
- [ ] Controleer de spelling in elk blok en op het antwoordblad. Klopt elk meervoud? Staan er woorden bij die je liever niet hebt?
- [ ] Vink ook 1.3.GL2.26 en 1.3.GL4.17 (meervouden) en 1.3.GL2.25, 1.3.GL3.15 en 1.3.GL4.16 (verkleinwoorden) aan. Extra keuze per familie: één uitgang oefenen (bv. enkel 's of enkel -aatje/-ootje).
- [ ] Controleer de spelling: klopt elk meervoud (foto's, tafels, kinderen) en elk verkleinwoord (koninkje, mannetje, boompje, autootje)? Is de afbreking in lettergrepen juist?
- [ ] Samenstellingen: vink 1.3.GL2.24, 1.3.GL3.14 en 1.3.GL4.35 aan. Zijn alle samenstellingen echte woorden (boekkast, tafellaken, huissleutel, kerkklok)? Zijn er woorden die je liever niet hebt?
- [ ] Klinkers en sch(r): vink 1.3.GL1.16, 1.3.GL1.17, 1.3.GL2.19 aan (woorden op -a/-o/-u zoals oma, foto, menu; twee, idee; school, schrijven). Bezit met 's: vink 1.3.GL5.24 aan (Anna's fiets, Toms fiets). Klopt elke schrijfwijze?
- [ ] Meer klanken: vink o.a. 1.3.GL3.12 (wr/vr), 1.3.GL3.13 (-ing), 1.3.GL4.11 (-ig/-lijk), 1.3.GL5.23 (-heid/-teit), 1.3.GL5.14 (-tie), 1.3.GL5.12 (x), 1.3.GL5.13 (y), 1.3.GL5.19 (qu), 1.3.GL5.18 (th), 1.3.GL5.8 en 1.3.GL5.9 (c) aan. Klopt elk woord, en is de fout (vrijven, tekenink, vakansie, kwiz, sirkel) duidelijk fout?
- [ ] Klanken: zoek op `tweetekenklanken`, `ng` of `lettergroepen` en vink doelen aan (bv. 1.3.GL2.12, 1.3.GL2.14, 1.3.GL2.16). Klopt elk woord? Zijn de foute vormen (trijn, moi, rink) duidelijk fout en geen bestaand woord? Zijn de open plaatsen (tr__n) duidelijk?
- [ ] Hoofdletters: vink 1.3.GL2.10, 1.3.GL3.7, 1.3.GL4.5, 1.3.GL5.6 en 1.3.GL6.6 aan. Klopt elke schrijfwijze (Kerstmis, Tweede Wereldoorlog, De kleine prins, Coca-Cola, een Gentenaar)? Staan dagen en maanden zonder hoofdletter? Zijn de zinnen goed Nederlands?
- [ ] Eindletters: vink 1.3.GL2.23 en 1.3.GL4.15 aan. Klopt het enkelvoud bij elk meervoud (honden - hond, kippen - kip, webben - web) en zijn de foute vormen (hont, kib, wep) duidelijk fout?
- [ ] Werkwoorden: zoek `werkwoorden` en vink de doelen 1.3.GL3.18 (tegenwoordige tijd), 1.3.GL3.19 (verleden tijd), 1.3.GL4.21 (voltooid deelwoord), 1.3.GL5.31 (voltooide tijd) en 1.3.GL6.22 (toekomende tijd) aan. Controleer elke vorm: 't kofschip (werkte/speelde, gewerkt/gespeeld), stam met verlengde klinker (loop, maak, leef, lees), hij zit (geen extra t), sterke werkwoorden (liep, gelopen), hebben/zijn bij de voltooide tijd. Zijn de zinnen goed Nederlands?
- [ ] Leenwoorden, afkortingen en tekens: vink 1.3.GL6.14, 6.15, 6.16, 6.17, 6.18, 5.25, 5.26 en 5.27 aan. Komt elk leenwoord uit de juiste taal (garage Frans, weekend Engels, chaos Latijn/Grieks)? Staan de afkortingen juist met of zonder punten (bv., enz., tv, vzw)? Staan trema, koppelteken, accent en apostrof juist (knieën, e-mail, café, zo'n)? Zijn de foute vormen duidelijk fout?
- [ ] Voor- en achtervoegsels: vink 1.3.GL2.20, 1.3.GL4.12, 1.3.GL6.10, 1.3.GL5.7, 1.3.GL5.10 en 1.3.GL5.11 aan. Klopt elk woord (bezoek, gezin, verdriet, typisch, populair, sociaal, officieel, eventueel, museum, podium, accu, succes)? Voor 1.3.GL4.12 koos ik be-/ge-/ver- plus -ig en -lijk als 'doffe klank in voor- en achtervoegsels': klopt dat?
- [ ] Doffe klank en -ën: vink 1.3.GL2.21, 1.3.GL3.10 en 1.3.GL6.12 aan. Klopt elk woord (tafel, vader, lopen; spelen, leren, tekenen; zee - zeeën, knie - knieën, kopie - kopieën)?
- [ ] Woordsoorten: zoek 'woordsoort' of vink 1.5.GL2.28, 2.30, 2.33, 2.37, 3.15, 3.19, 4.11, 4.15 en 6.11 aan. Klopt de woordsoort van elk woord en van elk woord in de zinnen (bv. 'mijn' voornaamwoord, 'eerste' telwoord, 'dus' voegwoord)? Past het niveau: in het 2de leerjaar enkel zelfstandig naamwoord, lidwoord, eigennaam en werkwoord? Bij 'onderstreep de zelfstandige naamwoorden' komen geen eigennamen voor in de zin.
- [ ] Zinsoorten, alfabet, synoniemen/antoniemen, persoonsvorm/onderwerp: vink 1.5.GL2.41, 1.5.GL1.8, 1.5.GL2.12, 1.5.GL3.10, 1.5.GL2.4, 1.5.GL3.5, 1.5.GL4.25 en 1.5.GL4.26 aan. Zijn de zinnen echt mededelend, vragend of uitroepend? Zijn de synoniemen bruikbaar voor de klas (fiets - rijwiel)? Zijn de tegengestelden eenduidig? Klopt bij elke zin de persoonsvorm en het onderwerp?
- [ ] Werkwoorden herkennen en woordbouw: vink 1.5.GL4.18, 4.20, 4.21, 4.23, 5.14, 5.15, 6.13, 1.5.GL2.1, 5.10 en 5.12 aan. Klopt elke stam, elke vorm en elk voltooid deelwoord? Zijn de zinnen goed Nederlands (Hij vergeet de les)? Zijn de voor- en achtervoegsels (verkopen, onzeker, zekerheid, wandeling) correct opgesplitst?
- [ ] De woordenlijsten staan in `js/subjects/taal/woorden/`: zeg me welke woorden erbij of weg moeten.

## 5. Afdrukken en Word
- [ ] "Afdrukken of opslaan als PDF": een A4-pagina per leerling, logo ongeveer 4,5 cm, niets afgesneden.
- [ ] Print op papier, zwart-wit, met "printvriendelijk logo": is het logo leesbaar?
- [ ] "Word downloaden": opent in Word. Je kunt tekst aanpassen. Welk lettertype zie je? (Andika moet op de computer geïnstalleerd zijn, anders kies je Arial of Verdana.)
- [ ] "Aparte bestanden (zip)" geeft één bestand per leerling.

## 6. Collega's
- [ ] Kan een collega zonder uitleg een blad maken? Waar liep ze vast?
- [ ] Werkt het op de computers en tablets van school (welke browser?)
