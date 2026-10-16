// Woordenlijst voor bezit met 's: de fiets van Anna = Anna's fiets, de fiets van Tom = Toms fiets.
// Dit bestand mag je als leerkracht aanpassen of aanvullen.
//
// Namen: een naam die eindigt op a, o, u, i of y krijgt een apostrof: Anna's, Marco's, Mia's, Amy's.
//        Een naam die eindigt op een medeklinker krijgt zomaar een s: Toms, Brams, Jans.
// (Namen op -e, -s, -x of -z staan hier niet: daar gelden andere regels.)
// Voorwerpen: [voorwerp, lidwoord] (de fiets, het boek).
// De tests in tests/taal.test.mjs controleren dat elke regel klopt.
export const NAMEN_APOSTROF = ['Anna', 'Sofia', 'Marco', 'Lotta', 'Mia', 'Noa', 'Lola', 'Amy', 'Nora', 'Ella', 'Ria', 'Kiki', 'Zora', 'Gianni'];
export const NAMEN_GEWOON = ['Tom', 'Jan', 'Bram', 'Sven', 'Tim', 'Amir', 'Liam', 'Yusuf', 'Daan', 'Finn', 'Mohamed', 'Noor', 'Robin', 'Pieter', 'Wout'];
export const VOORWERPEN = [['fiets', 'de'], ['boek', 'het'], ['tas', 'de'], ['pen', 'de'], ['hond', 'de'], ['jas', 'de'], ['pet', 'de'], ['schrift', 'het'], ['potlood', 'het'], ['bal', 'de']];

// Elke naam krijgt één voorwerp (vast per naam, zodat het blad herhaalbaar blijft).
const hash = (t) => [...t].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 17);
export function maakOpgaven() {
  const uit = [];
  for (const [soort, namen] of [['aps', NAMEN_APOSTROF], ['gewoon', NAMEN_GEWOON]]) {
    for (const naam of namen) {
      const [voorwerp, lid] = VOORWERPEN[hash(naam) % VOORWERPEN.length];
      const naar = soort === 'aps' ? `${naam}'s ${voorwerp}` : `${naam}s ${voorwerp}`;
      const fout = soort === 'aps' ? `${naam}s ${voorwerp}` : `${naam}'s ${voorwerp}`;
      uit.push({ van: `${lid} ${voorwerp} van ${naam}`, naar, fout, delen: [naar], lettergrepen: 1, soort, frequent: true, data: { naam, voorwerp, lid } });
    }
  }
  return uit;
}
