# Leesteksten

Zet hier extra leesteksten met vragen. Ze komen bij de teksten die al in de tool zitten.

## Een tekst toevoegen

Maak een tekstbestand (`.txt`) met een zelfgekozen naam, bijvoorbeeld `de-fiets.txt`, in deze map:

```
Titel: De fiets
Leerjaar: 2
Volgorde: ja
Tekst: Eerst pompt Lotte haar banden op. Dan zet ze haar helm op. Daarna fietst ze naar school.
Vraag: Wat pompt Lotte op? | haar banden | haar ballon | haar bal
Vraag: Waarom zet ze haar helm op? | Dat is veilig. | Dat is mooi. | Het regent. | afleiden
```

- **Titel** en **Leerjaar** (1 tot 6) zijn verplicht. **Tekst** staat op één regel.
- **Volgorde: ja** zet je alleen als de zinnen op elkaar volgen in de tijd (eerst, dan, daarna). Dan kan de tekst ook gebruikt worden om zinnen in de goede volgorde te zetten.
- Elke **Vraag** heeft vier delen, gescheiden door `|`: de vraag, het juiste antwoord en twee foute antwoorden.
- Wil je zelf bepalen hoe moeilijk een vraag is? Zet er een vijfde deel achter: `letterlijk` (het antwoord staat zo in de tekst) of `afleiden` (de leerling moet nadenken). Zonder vijfde deel raadt de tool het aan de hand van het eerste woord ("Waarom ..." is afleiden).
- Minstens één vraag per tekst, liefst drie.

Daarna draai je `node scripts/leesteksten-index.mjs` (of vraag Claude om dat te doen). Dat schrijft `index.json` in deze map. Zonder deze stap verschijnt de tekst niet in de tool. Het script meldt fouten in je bestand.

De tool schrijft zelf geen teksten in deze map.
