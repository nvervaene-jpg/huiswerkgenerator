# Spellingschema's

Zet hier de schema's van spellingregels die de leerkracht bij een blad kan kiezen.

## Een schema toevoegen

1. Zet een **afbeelding** in deze map: `png`, `jpg`, `webp`, `gif` of `svg`. De naam van het bestand is de naam van het schema, bijvoorbeeld `meervoud-en-s.png`.
2. Wil je er een titel en uitleg bij? Maak dan een tekstbestand met **dezelfde naam**: `meervoud-en-s.txt`.
   - De eerste regel is de titel (bijvoorbeeld `Meervoud: -en of -s`).
   - Alles daaronder is de uitleg die onder de afbeelding komt.
   - Een schema mag ook enkel uit tekst bestaan (dus een `.txt` zonder afbeelding).
   - **Stappenplan:** zet op de tweede regel `Soort: stappenplan`. Elke regel daarna is één stap en komt genummerd op het blad, bijvoorbeeld:
     ```
     Zo spel je een woord op -d of -t
     Soort: stappenplan
     Zeg het woord.
     Maak het woord langer (meervoud of verlengd).
     Welke letter hoor je nu? Schrijf die letter.
     ```
3. Maak de lijst opnieuw aan met `node scripts/schema-index.mjs` (of vraag Claude om dat te doen). Dat schrijft `index.json` in deze map. Zonder deze stap verschijnt het nieuwe schema niet in de keuzelijst.

## Gebruik in de tool

Onder *Opmaak van het blad* staat de keuzelijst **Schema bij dit blad**. Standaard staat die op *Geen schema*: het blad werkt ook zonder schema. Het gekozen schema komt bovenaan het blad (en in het Word-bestand).

De tool maakt zelf geen schema's. Wat hier niet staat, verschijnt nergens.
