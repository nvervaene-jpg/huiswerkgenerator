// Word-export (.docx). Pure module: krijgt de docx-bibliotheek en de afbeeldingen mee,
// zodat hij zowel in de browser als in Node (tests) werkt. Tekst blijft gewone, bewerkbare tekst.
import { LETTERTYPES, GROOTTES } from '../core/opmaak.js';

const A4 = { width: 11906, height: 16838 };
const MARGE = 851; // 1,5 cm
const GEEN_RAND = { style: 'none', size: 0, color: 'FFFFFF' };
const GEEN_RANDEN = { top: GEEN_RAND, bottom: GEEN_RAND, left: GEEN_RAND, right: GEEN_RAND, insideHorizontal: GEEN_RAND, insideVertical: GEEN_RAND };

// afbeeldingen: { logo: {bytes, breedte, hoogte}, iconen: { [naam]: bytes } }
// bladen: [{ naam, blad }]   opmaak: zie core/opmaak.js
export function bouwSecties(d, bladen, opmaak, afbeeldingen) {
  const font = LETTERTYPES[opmaak.lettertype].docx;
  const pt = GROOTTES[opmaak.grootte];
  const tekst = (t, o = {}) => new d.TextRun({ text: t, font, size: pt * 2, ...o });
  const alinea = (kinderen, o = {}) => new d.Paragraph({ children: kinderen, ...o });
  const titel = (blad) => opmaak.titel || blad.titel;

  const logoBreedte = 170; // 4,5 cm
  const logoHoogte = Math.round(logoBreedte * afbeeldingen.logo.hoogte / afbeeldingen.logo.breedte);
  const lijn = (label, waarde) => alinea([tekst(label + ' '), tekst(waarde || '_'.repeat(24), { underline: waarde ? {} : undefined })], { spacing: { after: 120 } });

  const sectie = (kinderen, voettekst) => ({
    properties: { page: { size: A4, margin: { top: MARGE, bottom: MARGE, left: MARGE, right: MARGE } } },
    footers: { default: new d.Footer({ children: [alinea([tekst(voettekst, { size: 14, color: '666666' })])] }) },
    children: kinderen,
  });

  const bladSectie = ({ naam, blad }) => {
    const kinderen = [];
    kinderen.push(new d.Table({
      width: { size: 100, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN,
      rows: [new d.TableRow({ children: [
        new d.TableCell({ width: { size: 30, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN, verticalAlign: d.VerticalAlign.CENTER, children: [
          alinea([new d.ImageRun({ data: afbeeldingen.logo.bytes, type: 'png', transformation: { width: logoBreedte, height: logoHoogte } })]),
        ] }),
        new d.TableCell({ width: { size: 70, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN, verticalAlign: d.VerticalAlign.CENTER, children: [
          alinea([tekst(titel(blad), { bold: true, size: Math.round(pt * 2 * 1.35) })], { spacing: { after: 200 } }),
          lijn('Naam:', naam), lijn('Datum:', ''),
        ] }),
      ] })],
    }));
    kinderen.push(alinea([], { border: { bottom: { style: 'single', size: 12, color: '333333', space: 1 } }, spacing: { after: 240 } }));

    for (const b of blad.blokken) {
      kinderen.push(alinea([
        new d.ImageRun({ data: afbeeldingen.iconen[b.pictogram], type: 'png', transformation: { width: 40, height: 40 } }),
        tekst('   ' + b.opdracht, { bold: true }),
      ], { spacing: { after: 200 }, keepNext: true }));
      const n = Math.ceil(b.oefeningen.length / 2);
      const cel = (i) => new d.TableCell({ width: { size: 50, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN,
        children: [alinea(i < b.oefeningen.length ? [tekst(`${i + 1}.  ${b.oefeningen[i].tekst}`)] : [], { spacing: { after: 360 } })] });
      kinderen.push(new d.Table({
        width: { size: 100, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN,
        rows: Array.from({ length: n }, (_, r) => new d.TableRow({ cantSplit: true, children: [cel(r), cel(r + n)] })),
      }));
      kinderen.push(alinea([], { spacing: { after: 200 } }));
    }
    if (opmaak.boodschap.trim()) {
      const rand = { style: 'single', size: 12, color: '333333', space: 6 };
      const regels = opmaak.boodschap.trim().split(/\r?\n/);
      kinderen.push(alinea([tekst('Boodschap voor thuis', { bold: true })], { border: { top: rand, left: rand, right: rand }, spacing: { before: 200 } }));
      regels.forEach((r, i) => kinderen.push(alinea([tekst(r)], { border: { ...(i === regels.length - 1 ? { bottom: rand } : {}), left: rand, right: rand } })));
    }
    return sectie(kinderen, 'Bladcode: ' + blad.code);
  };

  const antwoordSectie = () => {
    const kinderen = [alinea([tekst('Antwoorden voor de leerkracht', { bold: true, size: Math.round(pt * 2 * 1.35) })], { spacing: { after: 240 } })];
    for (const { naam, blad } of bladen) {
      kinderen.push(alinea([tekst(`${naam || 'Blad'} · ${titel(blad)}`, { bold: true })], { spacing: { before: 200, after: 120 } }));
      for (const b of blad.blokken) b.oefeningen.forEach((o, i) => kinderen.push(alinea([tekst(`${i + 1}.  ${o.volledig}`)], { spacing: { after: 60 } })));
    }
    return sectie(kinderen, 'Antwoordblad');
  };

  const secties = bladen.map(bladSectie);
  if (opmaak.antwoordblad) secties.push(antwoordSectie());
  return secties;
}

export function bouwDocument(d, bladen, opmaak, afbeeldingen) {
  return new d.Document({
    creator: 'Werkbladgenerator BuLO Sint-Franciscus',
    title: opmaak.titel || (bladen[0] && bladen[0].blad.titel) || 'Werkblad',
    styles: { default: { document: { run: { font: LETTERTYPES[opmaak.lettertype].docx, size: GROOTTES[opmaak.grootte] * 2 } } } },
    sections: bouwSecties(d, bladen, opmaak, afbeeldingen),
  });
}
