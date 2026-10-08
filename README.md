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
