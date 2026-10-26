// Leesoefeningen bij een korte tekst: vragen op het niveau van het doel, zinnen in volgorde zetten, het antwoord in de tekst onderstrepen
// en bij de tekst tekenen. De teksten staan in ../woorden/leesteksten.js en in de map assets/leesteksten.
import { vorm, kies, basisOefening } from './taalkunde.js';
import { kiesOef } from './begrippen.js';
import { tekstenVan, vraagNiveau, zinnenVan } from '../woorden/leesteksten.js';
import { kader } from '../../../core/open-svg.js';

const LIJN = '________________________________';
const NBSP = ' ';
const jaarVan = (doel) => Number(/GL(\d)/.exec(doel || '')?.[1] || 3);
const teksten = (doel) => tekstenVan(jaarVan(doel));
const GROEP = 'lezen-tekst';

/* ------------------------------------------------------------------ 7. vragen op het niveau van het doel */
const NIVEAU_PER_DOEL = {
  '1.2.GL1.32': 'letterlijk', '1.2.GL2.26': 'letterlijk', '1.2.GL3.20': 'letterlijk',                       // expliciete informatie weergeven
  '1.2.GL1.34': 'afleiden', '1.2.GL2.28': 'afleiden', '1.2.GL3.22': 'afleiden',                            // informatie combineren tot een conclusie
  '1.2.GL3.25': 'mening',                                                                                  // verwoorden hoe de auteur denkt over het onderwerp
};
export const NIVEAU_DOELEN = Object.keys(NIVEAU_PER_DOEL);
const niveauKeuze = { id: 'niveau', groep: GROEP, label: 'Niveau van de vragen', type: 'select', standaard: 'auto', opties: [['auto', 'Volgens het doel'], ['letterlijk', 'Letterlijk: het antwoord staat in de tekst'], ['afleiden', 'Afleiden: nadenken over de tekst'], ['mening', 'Mening: wat vind jij?']] };
const NIVEAU_NAAM = { letterlijk: 'het antwoord staat in de tekst', afleiden: 'denk na over de tekst', mening: 'geef je mening' };

const afgestemd = vorm({
  id: 'lt-niveau', titel: 'Lees en beantwoord (op niveau)', pictogram: 'omcirkelen', opdracht: 'Lees de tekst. Beantwoord de vraag.', doelen: NIVEAU_DOELEN, rang: 1, basis: true, schaal: 0.6, keuzes: [niveauKeuze],
  bouw: (r, o) => {
    const niveau = !o.niveau || o.niveau === 'auto' ? NIVEAU_PER_DOEL[o.doel] : o.niveau, t = kies(r, teksten(o.doel));
    if (niveau === 'mening') {
      return basisOefening({
        tekst: `${t.tekst}\nWat vind jij van deze tekst? Waarom vind je dat?\n${LIJN}\n${LIJN}`, antwoord: 'Eigen mening met een reden.', volledig: `${t.titel}: eigen mening met een reden (de leerkracht beoordeelt of de leerling uitlegt waarom).`,
        kern: t.titel, sleutel: `${t.titel}|mening`, moeilijkheid: [3, t.tekst.length], data: { type: 'lt-niveau', doel: o.doel, niveau, titel: t.titel, open: true },
      });
    }
    const vragen = t.vragen.filter(v => vraagNiveau(v) === niveau);
    if (!vragen.length) return null;
    const v = kies(r, vragen);
    return kiesOef(r, { vraag: `${t.tekst}\n${v.vraag} ____`, opties: v.fout, antwoord: v.juist, kern: `${t.titel}|${v.vraag}`, data: { type: 'lt-niveau', doel: o.doel, niveau, titel: t.titel, vraagTekst: v.vraag }, volledig: `${v.vraag} ${v.juist}`, moeilijkheid: niveau === 'afleiden' ? 2 : 1 });
  },
});

/* ------------------------------------------------------------------ 8. zinnen in de goede volgorde */
const volgordeTeksten = (doel) => teksten(doel).filter(t => t.volgorde && zinnenVan(t.tekst).length >= 3);
const volgorde = vorm({
  id: 'lt-volgorde', titel: 'Wat gebeurt eerst?', pictogram: 'schrijven', opdracht: 'Lees de zinnen. Zet ze in de goede volgorde: schrijf 1, 2 of 3 voor elke zin.', doelen: ['1.2.GL1.34', '1.2.GL2.28', '1.2.GL3.22'], rang: 2, schaal: 0.5,
  bouw: (r, o) => {
    const lijst = volgordeTeksten(o.doel);
    if (!lijst.length) return null;
    const t = kies(r, lijst), zinnen = zinnenVan(t.tekst), start = r.geheel(0, zinnen.length - 3), juist = zinnen.slice(start, start + 3);
    const mix = r.schud([0, 1, 2]);
    if (mix.join('') === '012') return null;
    const getoond = mix.map(i => juist[i]);
    return basisOefening({
      tekst: getoond.map(z => `____${NBSP}${z}`).join('\n'), antwoord: juist.join(' '), volledig: juist.map((z, i) => `${i + 1}. ${z}`).join(' '), kern: `${t.titel}|${start}`, sleutel: `${t.titel}|${start}|${mix.join('')}`, moeilijkheid: [juist.join(' ').length],
      data: { type: 'lt-volgorde', doel: o.doel, titel: t.titel, juist, getoond },
    });
  },
});

/* ------------------------------------------------------------------ 9. onderstreep het antwoord in de tekst */
const zoekbaar = (t) => t.vragen.filter(v => t.tekst.toLowerCase().includes(v.juist.toLowerCase().replace(/[.!?]$/, '')));
const zoek = vorm({
  id: 'lt-zoek', titel: 'Zoek het antwoord in de tekst', pictogram: 'schrijven', opdracht: 'Lees de tekst. Onderstreep in de tekst het antwoord op de vraag. Schrijf het antwoord ook op.', doelen: ['1.2.GL1.32', '1.2.GL2.26', '1.2.GL3.20'], rang: 3, schaal: 0.5,
  bouw: (r, o) => {
    const lijst = teksten(o.doel).filter(t => zoekbaar(t).length);
    if (!lijst.length) return null;
    const t = kies(r, lijst), v = kies(r, zoekbaar(t));
    return basisOefening({
      tekst: `${t.tekst}\n${v.vraag}\n${LIJN}`, antwoord: v.juist, volledig: `${v.vraag} ${v.juist}`, kern: `${t.titel}|${v.vraag}`, sleutel: `${t.titel}|${v.vraag}`, moeilijkheid: [1, t.tekst.length],
      data: { type: 'lt-zoek', doel: o.doel, titel: t.titel, vraagTekst: v.vraag, juist: v.juist },
    });
  },
});

/* ------------------------------------------------------------------ 10. lees en teken */
const teken = vorm({
  id: 'lt-teken', titel: 'Lees en teken', pictogram: 'tekenen', opdracht: 'Lees de tekst. Teken wat je gelezen hebt. Schrijf er een zin bij.', doelen: ['1.2.GL1.38', '1.2.GL2.32', '1.2.GL3.27'], rang: 3, schaal: 0.34,
  bouw: (r, o) => {
    const t = kies(r, teksten(o.doel));
    return basisOefening({
      tekst: `${t.tekst}\n${LIJN}`, svg: kader(170), antwoord: 'Eigen tekening en zin.', volledig: `${t.titel}: eigen tekening en zin; de tekening en de zin passen bij de tekst (de leerkracht beoordeelt).`,
      kern: t.titel, sleutel: t.titel, moeilijkheid: [t.tekst.length], data: { type: 'lt-teken', doel: o.doel, titel: t.titel, open: true },
    });
  },
});

export const LEZEN_TEKST_VORMEN = [afgestemd, volgorde, zoek, teken];
