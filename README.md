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
