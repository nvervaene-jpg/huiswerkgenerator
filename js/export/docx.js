// Word-export (.docx). Pure module: krijgt de docx-bibliotheek en de afbeeldingen mee,
// zodat hij zowel in de browser als in Node (tests) werkt. Tekst blijft gewone, bewerkbare tekst.
import { LETTERTYPES, GROOTTES, LIJNEN } from '../core/opmaak.js';
import { voorbeeldDelen, doelTeksten } from '../core/blad-model.js';

const KLEUR_VOORBEELD = '1A3A8A', KLEUR_SLEUTEL = 'C0392B';

const A4 = { width: 11906, height: 16838 };
const MARGE = 851; // 1,5 cm
const GEEN_RAND = { style: 'none', size: 0, color: 'FFFFFF' };
const GEEN_RANDEN = { top: GEEN_RAND, bottom: GEEN_RAND, left: GEEN_RAND, right: GEEN_RAND, insideHorizontal: GEEN_RAND, insideVertical: GEEN_RAND };

// afbeeldingen: { logo: {bytes, breedte, hoogte}, iconen: { [naam]: bytes }, svgPng: Map(svg-markup -> bytes) }
// bladen: [{ naam, blad }]   opmaak: zie core/opmaak.js
export function bouwSecties(d, bladen, opmaak, afbeeldingen) {
  const font = LETTERTYPES[opmaak.lettertype].docx;
  const pt = GROOTTES[opmaak.grootte];
  const tekst = (t, o = {}) => new d.TextRun({ text: t, font, size: pt * 2, ...o });
  const alinea = (kinderen, o = {}) => new d.Paragraph({ children: kinderen, ...o });
  const regels = (t, o = {}) => String(t).split('\n').map((r, i) => tekst(r, { ...o, ...(i ? { break: 1 } : {}) }));   // regeleinden in de tekst
  const titel = (blad) => opmaak.titel || blad.titel;
  // De tekst van een oefening: het voorbeeld in het blauw, met de antwoordsleutel aan de antwoorden in het rood.
  const oefRuns = (o, i) => {
    const nr = `${i + 1}.  `, kleur = o.voorbeeld ? { color: KLEUR_VOORBEELD } : {};
    const delen = o.voorbeeld && o.voorbeeldDelen ? o.voorbeeldDelen : opmaak.sleutel && !o.voorbeeld && o.antwoord !== undefined && o.tekst && o.tekst.includes('____') ? voorbeeldDelen(o) : null;
    if (!delen) return regels(`${nr}${o.tekst}`, kleur);
    return [tekst(nr, kleur), ...delen.map(x => tekst(x.t, x.blauw ? { bold: true, color: o.voorbeeld ? KLEUR_VOORBEELD : KLEUR_SLEUTEL } : kleur))];
  };

  // Regels die enkel uit streepjes bestaan zijn schrijflijnen: een lege regel met een lijn eronder, met de gekozen afstand (smal, normaal of ruim).
  const isLijn = (r) => /^\s*_{8,}\s*$/.test(r);
  const lijnHoogte = Math.round((LIJNEN[opmaak.lijnen] || LIJNEN.normaal).mm * 56.7);
  const lijnAlinea = () => alinea([tekst(' ', { size: 4 })], { border: { bottom: { style: 'single', size: 8, color: '555555', space: 1 } }, spacing: { before: lijnHoogte, after: 0 } });
  const oefAlineas = (o, i, na, houdBij = false) => {
    const regelsLijst = String(o.tekst || '').split('\n');
    if (!regelsLijst.some(isLijn) || (o.voorbeeld && o.voorbeeldDelen)) return [alinea(oefRuns(o, i), { spacing: { after: na }, keepNext: houdBij })];
    const uit = []; let tekstdeel = [];
    const leeg = () => { if (tekstdeel.length) { uit.push(alinea(regels(`${uit.length ? '' : `${i + 1}.  `}${tekstdeel.join('\n')}`), { spacing: { after: 40 } })); tekstdeel = []; } };
    for (const r of regelsLijst) { if (isLijn(r)) { leeg(); uit.push(lijnAlinea()); } else tekstdeel.push(r); }
    leeg();
    return uit.concat(alinea([], { spacing: { after: Math.max(0, na - 200) } }));
  };

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
    if (opmaak.toonDoel && blad.doelen && blad.doelen.length) {
      const rand = { style: 'single', size: 8, color: '888888', space: 4 };
      kinderen.push(alinea([tekst(blad.doelen.length > 1 ? 'Doelen' : 'Doel', { bold: true })], { border: { top: rand, left: rand, right: rand } }),
        ...doelTeksten(blad.doelen).map((t, i, l) => alinea([tekst(t)], { border: { ...(i === l.length - 1 ? { bottom: rand } : {}), left: rand, right: rand }, spacing: { after: i === l.length - 1 ? 240 : 0 } })));
    }
    if (opmaak.schemaKaart) {                                  // het gekozen spellingschema in een kader bovenaan
      const sk = opmaak.schemaKaart, rand = { style: 'single', size: 8, color: '888888', space: 4 }, afb = afbeeldingen.schema;
      const delen = [{ runs: [tekst(sk.titel, { bold: true })] }];
      if (afb) { const w = Math.min(afb.breedte, 520); delen.push({ runs: [new d.ImageRun({ data: afb.bytes, type: 'png', transformation: { width: w, height: Math.round(w * afb.hoogte / afb.breedte) } })], midden: true }); }
      (sk.stappen || []).forEach((stap, i) => delen.push({ runs: [tekst(`${i + 1}.  ${stap}`)] }));
      for (const regel of String(sk.tekst || '').split(/\n+/).filter(Boolean)) delen.push({ runs: [tekst(regel)] });
      delen.forEach((deel, i) => kinderen.push(alinea(deel.runs, {
        border: { left: rand, right: rand, ...(i === 0 ? { top: rand } : {}), ...(i === delen.length - 1 ? { bottom: rand } : {}) },
        spacing: { after: i === delen.length - 1 ? 240 : 0 }, ...(deel.midden ? { alignment: d.AlignmentType.CENTER } : {}),
      })));
    }
    let opdrachtNr = 0;

    // Blokjes staan naast elkaar volgens hun breedte (een kwart, de helft of het geheel): een rij met meerdere blokjes wordt een tabel.
    const rijen = []; let rij = [], som = 0;
    const sluit = () => { if (rij.length) rijen.push({ blokken: rij }); rij = []; som = 0; };
    for (const b of blad.blokken) {
      if (b.hulp === 'pagina') { sluit(); rijen.push({ pagina: true }); continue; }
      if (!b.hulp && !b.oefeningen.length) continue;
      if (b.hulp === 'instructie' && !b.tekst) continue;
      if (som + b.breedte > 4) sluit();
      rij.push(b); som += b.breedte;
    }
    sluit();
    const blokInhoud = (b) => {
      if (b.hulp === 'instructie') return [alinea([tekst(b.tekst, { bold: true })], { spacing: { after: 240 } })];
      if (b.hulp === 'blanco') return [alinea([], { spacing: { after: Math.round(b.hoogte * 567) } })];
      // Altijd in dezelfde volgorde: volgnummer, pictogram, opdracht.
      const delen = [alinea([
        tekst(`${++opdrachtNr}   `, { bold: true, color: '1F3B57', size: Math.round(pt * 2 * 1.2) }),
        new d.ImageRun({ data: afbeeldingen.iconen[b.pictogram] || afbeeldingen.iconen.schrijven, type: 'png', transformation: { width: 40, height: 40 } }),
        tekst('   ' + b.opdracht, { bold: true }),
      ], { spacing: { after: 200 }, keepNext: true })];
      const inhoud = ({ i, o }) => {
        const t = o.voorbeeld ? o.svg : (opmaak.sleutel && o.antwoordSvg ? o.antwoordSvg : o.svg);
        const uit = oefAlineas(o, i, t ? 80 : 360, !!t && !o.svgBoven);
        if (t) {
          const png = afbeeldingen.svgPng.get(t.markup);
          const w = Math.min(t.breedte, b.breedte === 4 ? 600 : b.breedte * 150);
          const prent = alinea([new d.ImageRun({ data: png, type: 'png', transformation: { width: w, height: Math.round(w * t.hoogte / t.breedte) } })], o.svgBoven ? { spacing: { after: 60 }, keepNext: true } : { spacing: { after: 240 } });
          if (o.svgBoven) uit.unshift(prent); else uit.push(prent);       // plaatje boven of onder de tekst
        }
        return uit;
      };
      if (b.breedte < 4 || blad.onderElkaar) { b.oefeningen.forEach((o, i) => delen.push(...inhoud({ i, o }))); return delen; }
      const cel = (item, span = 1) => new d.TableCell({ width: { size: 50 * span, type: d.WidthType.PERCENTAGE }, columnSpan: span, borders: GEEN_RANDEN,
        children: item ? inhoud(item) : [alinea([])] });
      const paren = []; let wacht = null;                       // rij per twee oefeningen, brede oefeningen krijgen een hele rij
      b.oefeningen.forEach((o, i) => {
        if (o.breed) { if (wacht) { paren.push([wacht]); wacht = null; } paren.push([{ i, o }, 'breed']); }
        else if (wacht) { paren.push([wacht, { i, o }]); wacht = null; } else wacht = { i, o };
      });
      if (wacht) paren.push([wacht]);
      delen.push(new d.Table({
        width: { size: 100, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN,
        rows: paren.map(r => new d.TableRow({ cantSplit: true, children: r[1] === 'breed' ? [cel(r[0], 2)] : [cel(r[0]), cel(r[1])] })),
      }));
      return delen;
    };
    for (const r of rijen) {
      if (r.pagina) { kinderen.push(alinea([new d.PageBreak()])); continue; }
      if (r.blokken.length === 1 && r.blokken[0].breedte === 4) { kinderen.push(...blokInhoud(r.blokken[0]), alinea([], { spacing: { after: 200 } })); continue; }
      const totaal = r.blokken.reduce((x, b) => x + b.breedte, 0);
      const cellen = r.blokken.map(b => new d.TableCell({ width: { size: b.breedte * 25, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN, children: [...blokInhoud(b), alinea([])] }));
      if (totaal < 4) cellen.push(new d.TableCell({ width: { size: (4 - totaal) * 25, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN, children: [alinea([])] }));
      kinderen.push(new d.Table({ width: { size: 100, type: d.WidthType.PERCENTAGE }, borders: GEEN_RANDEN, rows: [new d.TableRow({ cantSplit: true, children: cellen })] }), alinea([], { spacing: { after: 160 } }));
    }
    if (opmaak.boodschap.trim()) {
      const rand = { style: 'single', size: 12, color: '333333', space: 6 };
      const regels = opmaak.boodschap.trim().split(/\r?\n/);
      kinderen.push(alinea([tekst('Boodschap voor thuis', { bold: true })], { border: { top: rand, left: rand, right: rand }, spacing: { before: 200 } }));
      regels.forEach((r, i) => kinderen.push(alinea([tekst(r)], { border: { ...(i === regels.length - 1 ? { bottom: rand } : {}), left: rand, right: rand } })));
    }
    if ((opmaak.toonDoel || !blad.onderElkaar) && blad.doelen && blad.doelen.length) kinderen.push(alinea([tekst(`Op.stap-doelen in dit blad: ${blad.doelen.join(', ')}`, { size: 16, color: '666666' })], { spacing: { before: 200 } }));
    return sectie(kinderen, 'Bladcode: ' + blad.code);
  };

  const antwoordSectie = () => {
    const kinderen = [alinea([tekst('Antwoorden voor de leerkracht', { bold: true, size: Math.round(pt * 2 * 1.35) })], { spacing: { after: 240 } })];
    for (const { naam, blad } of bladen) {
      kinderen.push(alinea([tekst(`${naam || 'Blad'} · ${titel(blad)}`, { bold: true })], { spacing: { before: 200, after: 120 } }));
      for (const b of blad.blokken.filter(x => x.oefeningen.length)) {
        kinderen.push(alinea([tekst(b.titel, { bold: true, size: Math.round(pt * 2 * 0.85), color: '444444' })], { spacing: { before: 120, after: 40 } }));
        b.oefeningen.forEach((o, i) => {
        kinderen.push(alinea(regels(`${i + 1}.  ${o.volledig}`), { spacing: { after: o.antwoordSvg ? 40 : 60 } }));
        if (o.antwoordSvg) {
          const w = Math.min(o.antwoordSvg.breedte, 360);
          kinderen.push(alinea([new d.ImageRun({ data: afbeeldingen.svgPng.get(o.antwoordSvg.markup), type: 'png', transformation: { width: w, height: Math.round(w * o.antwoordSvg.hoogte / o.antwoordSvg.breedte) } })], { spacing: { after: 120 } }));
        }
        });
      }
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
