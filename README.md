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
- Breuken (echte breuken als deel van een geheel, 2.1.GL2.25, 3.25, 3.29, 4.33, 4.37): het stappenplan 'Wat is het geheel? In hoeveel gelijke delen is het verdeeld? Hoeveel delen neem ik? Welk deel is dit?' (naar het voorbeeld van de Echte-breukbladen, eerste opgave desgewenst als voorbeeld ingevuld), breuk noteren, meerkeuze, kleuren, juist/fout. Tekening: cirkel, strook of raster.
- Geld: munten en biljetten tellen, totaalprijs, wisselgeld, euro en eurocent omzetten (getallengebied = bedrag in euro).

Nieuwe generator toevoegen: bestand in `js/subjects/wiskunde/generators/`, registreren in `index.js`, daarna de doelcodes
in `data/wiskunde/generators-map.json` laten overeenkomen (een test controleert dat die twee kloppen).

## Taal (Nederlands en communicatie)
- Doelen: `data/taal/doelen-taal-opstap.json` (693 doelen, 1ste tot 6de leerjaar), letterlijk omgezet uit de PDF-export van Op.stap met `scripts/taal-doelen-uit-pdf.py`.
- Generators (elk met 9 oefenvormen: invullen, zin aanvullen, kies het juiste woord, juist of fout, uitgang herkennen, lettergrepen, verbinden, kleuren, fout zoeken):
  - **verenkelen en verdubbelen** (1.3.GL2.27, 1.3.GL3.16, 1.3.GL4.18, 1.3.GL4.19)
  - **meervouden** op -en, -s, 's, -eren (1.3.GL2.26, 1.3.GL4.17)
  - **werkwoorden spellen** (13 doelen, 1.3.GL2.28 t/m 1.3.GL6.22): tegenwoordige tijd (stam, -t, -en), verleden tijd ('t kofschip, sterke en onregelmatige werkwoorden), voltooid deelwoord, voltooid tegenwoordige/verleden tijd (hebben of zijn) en toekomende tijd, met 8 oefenvormen per tijd. Werkwoorden in `js/subjects/taal/woorden/werkwoorden.js`
  - **woorden eindigend op -d, -t, -p, -b** (1.3.GL2.23, 1.3.GL4.15): verleng het woord (honden - hond, katten - kat). Woorden in `js/subjects/taal/woorden/eindletters.js`
  - **hoofdletters** (1.3.GL2.10, 1.3.GL3.7, 1.3.GL4.5, 1.3.GL5.6, 1.3.GL6.6): namen, plaatsen, feestdagen, titels, talen, inwoners, historische gebeurtenissen, bedrijven, gebouwen en merken, met losse woorden en hele zinnen. Woorden en zinnen in `js/subjects/taal/woorden/hoofdletters.js`
  - **klanken, lettergroepen en achtervoegsels** (29 doelen, o.a. woorden op -a/-o/-u/-ee en sch(r)-): wr/vr, -ing, -ig/-lijk, -heid/-teit, -tie, x, y, qu, th en c (als /s/ of /k/), naast ei/ij, ou/au, ie/oe/eu/ui, aai/ooi/oei, eeuw/ieuw, uw, ng/nk en ch/g/cht/gt. Je ziet het woord met een open plaats (tr__n). Woorden in `js/subjects/taal/woorden/klanken.js`
  - **samenstellingen** (1.3.GL2.24, 1.3.GL3.14, 1.3.GL4.35): zand + bak = zandbak, boek + kast = boekkast. Woorden in `js/subjects/taal/woorden/samenstellingen.js` (de lijst is klein: bij veel blokken keren woorden terug)
  - **bezit met 's** (1.3.GL5.24): de fiets van Anna = Anna's fiets, de fiets van Tom = Toms fiets. Namen en voorwerpen in `js/subjects/taal/woorden/bezit.js`
  - **leenwoorden** (1.3.GL6.16–6.18: Frans, Engels, Latijn/Grieks), **afkortingen** (1.3.GL6.14) en **bijzondere tekens** (trema, koppelteken, accent: 1.3.GL6.15; apostrof: 1.3.GL5.25). Woorden in `js/subjects/taal/woorden/speciaal.js`; é en eau zitten bij de klanken (1.3.GL5.26, 1.3.GL5.27), net als be-/ge-/ver- (1.3.GL2.20, 1.3.GL4.12), -isch/-air/-iaal/-ieel/-ueel (1.3.GL6.10), -eum/-ium (1.3.GL5.7) cc (1.3.GL5.10, 5.11) en doffe klank achteraan (-en/-er/-el: 1.3.GL2.21; -elen/-eren/-enen: 1.3.GL3.10); meervouden op -ën (zee - zeeën, knie - knieën: 1.3.GL6.12)
  - **woordsoorten** (zelfstandig naamwoord, lidwoord, eigennaam, werkwoord: 1.5.GL2.28, 2.30, 2.33, 2.37; bijvoeglijk naamwoord en telwoord: 1.5.GL3.15, 3.19; voorzetsel en voegwoord: 1.5.GL4.11, 4.15; voornaamwoord: 1.5.GL6.11). Vijf vormen: welke woordsoort, welk woord hoort er niet bij, onderstrepen in een zin, woordsoort in een zin, sorteren. Losse woorden en getagde zinnen in `js/subjects/taal/woorden/woordsoorten.js`
  - **zinsoorten en leestekens** (1.5.GL2.41, 1.5.GL1.8, 1.5.GL2.42), **alfabet** (letters aanvullen 1.5.GL2.12, woorden alfabetisch ordenen 1.5.GL3.10), **synoniemen** (1.5.GL2.4), **antoniemen** (1.5.GL3.5) en **persoonsvorm en onderwerp** (1.5.GL4.25, 1.5.GL4.26). Gegevens in `js/subjects/taal/woorden/taalkunde.js`
  - **werkwoorden herkennen** (stam 1.5.GL4.20, infinitief 4.18, stam en uitgang 4.21, tegenwoordige en verleden tijd 4.23, toekomende tijd 6.13, voltooid deelwoord 5.14, hulpwerkwoord 5.15) en **woordbouw** (samenstellingen herkennen en splitsen 1.5.GL2.1 en 2.18, grondwoord, voorvoegsel en achtervoegsel 1.5.GL5.10, 6.7, 5.12 en 6.9). Werkwoorden uit `woorden/werkwoorden.js`, voor- en achtervoegsels in `woorden/woordbouw.js`
  - **zinsdelen en zinnen**: gezegde (1.5.GL4.29, 5.16, 5.17), lijdend en meewerkend voorwerp (6.14, 6.15, 6.16), zinnen opdelen (3.25), enkelvoudig/samengesteld en ontkennend (5.18, 5.19) en de gebiedende wijs (5.20, 5.21). Getagde zinnen in `js/subjects/taal/woorden/zinsdelen.js`
  - **verkleinwoorden** op -je, -tje, -pje, -etje, -kje, -aatje, -ootje, -uutje (1.3.GL2.25, 1.3.GL3.15, 1.3.GL4.16)
  - De negen vormen komen uit één gedeelde fabriek (`js/subjects/taal/generators/woordvormen.js`): een nieuwe woordfamilie is een woordenlijst plus een korte configuratie.
- De woordenlijsten staan in `js/subjects/taal/woorden/` en mogen aangevuld worden; de tests controleren elke regel ervan met een eigen spellingregel.
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
