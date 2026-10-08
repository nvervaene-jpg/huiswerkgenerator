# Werkbladgenerator BuLO Sint-Franciscus

Statische webapp (HTML/CSS/JS, geen backend) voor werkbladen op maat, gebaseerd op het leerplan Op.stap.

- `data/<vak>/` doelenbestand (ongewijzigd bron) en `generators-map.json` (doelcode → generator-id's)
- `js/core/` app, doelen laden, (later) opslag, bladcode, export
- `js/subjects/<vak>/` vak-module met eigen generators
- `js/export/` Word-export (docx) en browserfuncties (afdrukken, zip)
- `js/vendor/` meegeleverde bibliotheken (docx, JSZip; MIT) – geen externe servers nodig
- `assets/` logo en lettertype Andika (SIL OFL)
- `bronnen/` ruwe bronbestanden (leerplan-PDF)
- `tests/` automatische tests: `node --test tests/*.test.mjs`

Lokaal bekijken: `python3 -m http.server` en open http://localhost:8000
(het bestand `index.html` dubbelklikken werkt niet: de browser blokkeert dan het laden van de doelen).

Online zetten via GitHub Pages: Settings > Pages > Source "Deploy from a branch" > kies de branch en de map `/ (root)`.
Testplan: zie `TESTEN.md`.

## Generators (wiskunde)
Getallen: vergelijken, ordenen, getallenas invullen, splitsen, plaatswaarde (E, T, H, D, met MAB-materiaal).
Bewerkingen: optellen en aftrekken (zonder/met brug), maaltafels en deeltafels (eigen keuze van tafels), vermenigvuldigen en delen met grotere getallen.
Meten:
- Lengte: omzetten, vergelijken, aflezen op een getekende meetlat.
- Gewicht: omzetten, vergelijken, aflezen op een wijzerweegschaal.
- Tijd: klok aflezen, wijzers tekenen, tijdsduur omzetten en berekenen, dagen van de week.
- Geld: munten en biljetten tellen, totaalprijs, wisselgeld, euro en eurocent omzetten (getallengebied = bedrag in euro).

Nieuwe generator toevoegen: bestand in `js/subjects/wiskunde/generators/`, registreren in `index.js`, daarna de doelcodes
in `data/wiskunde/generators-map.json` laten overeenkomen (een test controleert dat die twee kloppen).

## Taal (Nederlands en communicatie)
- Doelen: `data/taal/doelen-taal-opstap.json` (693 doelen, 1ste tot 6de leerjaar), letterlijk omgezet uit de PDF-export van Op.stap met `scripts/taal-doelen-uit-pdf.py`.
- Eerste generators: **verenkelen en verdubbelen** (doelen 1.3.GL2.27, 1.3.GL3.16, 1.3.GL4.18, 1.3.GL4.19) met 9 oefenvormen: meervoud schrijven, zin aanvullen, kies het juiste woord, juist of fout, verdubbelen of verenkelen, lettergrepen, verbinden, kleuren, fout zoeken.
- De woordenlijst staat in `js/subjects/taal/woorden/verenkelen-verdubbelen.js` en mag je aanvullen; de tests controleren elke regel ervan.
- Nieuwe taalgenerators: bestand in `js/subjects/taal/generators/`, registreren in `index.js`, daarna `node scripts/koppelingen.mjs taal`.

## Oefenvormen en het blad aanpassen
- Elk doel heeft meerdere oefenvormen (invullen, juist/fout, meerkeuze, verbinden, tabel, fout zoeken, vraagstukje, ordenen, tekenen, kleuren, aflezen, ...). Een werkblad krijgt standaard 3 blokken per doel met 6 oefeningen per blok (instelbaar per leerling).
- Een vorm hoort bij een **familie** die één kern deelt (bv. een omzetting `3 m = 300 cm` of een som `27 + 8 = 35`). Zo toont een blad nooit dezelfde kern twee keer.
- Bestanden in `js/subjects/wiskunde/generators/`:
  - `stelling-vormen.js`: juist/fout, meerkeuze, verbinden en fout zoeken voor elke kern van de vorm "links = rechts".
  - `maat-vormen.js`: ordenen, tabel, vraagstukje, "welke eenheid past?" voor lengte, gewicht, tijdsduur en euro/eurocent.
  - `rekenvormen.js`: optellen, aftrekken, maaltafels en vermenigvuldigen/delen.
  - `getallen-vormen.js`, `tijd-vormen.js`, `geld-vormen.js`, `lengte-vormen.js`: de vormen die bij één onderdeel horen.
  - Nieuwe vorm toevoegen: schrijf hem in het juiste bestand, registreer hem in `index.js`, voer `node scripts/koppelingen.mjs` uit en schrijf een controle in `tests/generators.test.mjs` (de test faalt zolang er geen controle is).
- `ontwikkel/galerij.html` (via een lokale server) toont alle oefenvormen op één pagina, per getallengebied en met een filter. Handig om nieuwe vormen te bekijken.
- Thema's en voorwerpen voor de vraagstukjes staan in `js/subjects/wiskunde/contexten.js`: pas die gerust aan.
- In het voorbeeld kun je oefeningen weglaten of vervangen, oefeningen en blokken toevoegen, een blok opnieuw laten maken of verwijderen, en ongedaan maken. De bladcode bewaart dat allemaal (`js/core/blad-model.js`).
- Bladcodes zijn alleen geldig met dezelfde versie van de generators (`GENERATOR_VERSIE`). Verander je later de generators, verhoog dan dat getal.
