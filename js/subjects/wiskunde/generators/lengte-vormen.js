// Extra oefenvormen voor lengtematen: de gedeelde maatvormen plus balk kleuren en lijn tekenen.
import { maakRng } from '../../../core/random.js';
import { trek, resultaat } from './hulp.js';
import { FACTOR, VOLGORDE } from './lengte.js';
import { maatVormen } from './maat-vormen.js';
import { EENHEDEN_PER_DOEL as OMZET_KAART } from './lengtematen-omzetten.js';
import { EENHEDEN_VERGELIJKEN as VERGELIJK_KAART } from './meten.js';
import { meetlatKleur, lijnTekenen } from '../svg.js';
import { REFERENTIE_LENGTE } from '../contexten.js';

const hoofd = (t) => t[0].toUpperCase() + t.slice(1);
const SUPERLATIEF = { lang: 'langst', hoog: 'hoogst', breed: 'breedst' };
const REF_KAART = {
  '2.3.GL1.15': ['m', 'cm'], '2.3.GL2.18': ['m', 'dm', 'cm'], '2.3.GL3.21': ['km', 'm', 'dm', 'cm'], '2.3.GL4.26': ['km', 'm', 'dm', 'cm', 'mm'],
};
const METEN_DOELEN = ['2.3.GL2.21', '2.3.GL3.24'];

const MAAT_VORMEN = maatVormen({
  prefix: 'lengtematen', maat: 'lengte', factor: FACTOR, volgorde: VOLGORDE, standaard: ['m', 'dm', 'cm'], meervoud: 'lengtes',
  kaarten: { omzet: OMZET_KAART, vergelijk: VERGELIJK_KAART, ref: REF_KAART },
  ctx: {
    sleutel: 'cm', eenheid: 'cm',
    zin: (o, v, e) => `${hoofd(o.onderwerp)} is ${v} ${e} ${o.dim}.`,
    superlatief: (o) => `Wat is het ${SUPERLATIEF[o.dim]}?`,
    zelfdeSoort: (x, y) => x.dim === y.dim,
  },
  referentie: REFERENTIE_LENGTE,
  refZin: (i) => `${hoofd(i.onderwerp)} is ongeveer ${i.getal} ____ ${i.dim}.`,
});

const vormKt = ({ id, titel, pictogram, opdracht, rang, schaal, bouw }) => ({
  id, titel, pictogram, opdracht, rang, schaal, basis: false, doelen: METEN_DOELEN,
  opties: () => ({ eenheden: ['m', 'dm', 'cm'] }),
  genereer({ seed, aantal, gebied }) {
    const rng = maakRng(seed);
    return resultaat(trek(rng, aantal, (r) => bouw(r, { gebied })), aantal);
  },
});

/* ------------------------------------------------------------------ balk kleuren en lijn tekenen */
const meetlatLengte = (gebied) => (gebied <= 10 ? 10 : gebied <= 20 ? 20 : 30);
export const lengtematenKleuren = vormKt({
  id: 'lengtematen-kleuren', titel: 'Balk kleuren op de meetlat', pictogram: 'kleuren', rang: 5, schaal: 0.5,
  opdracht: 'Kleur de balk. Kijk goed naar de meetlat.',
  bouw(r, { gebied }) {
    const lat = meetlatLengte(gebied), van = r.volgende() < 0.6 ? 0 : r.geheel(1, lat - 2), tot = r.geheel(van + 1, lat);
    const { leeg, oplossing } = meetlatKleur({ lengte: lat, van, tot });
    const tekst = van === 0 ? `Kleur de balk tot ${tot} cm.` : `Kleur de balk van ${van} cm tot ${tot} cm.`;
    return {
      tekst, svg: leeg, antwoordSvg: oplossing, breed: true, antwoord: `${tot - van} cm`,
      volledig: `${tekst} De balk is ${tot - van} cm lang.`, getallen: [van, tot, lat], sleutel: `${van}-${tot}`, moeilijkheid: [van > 0 ? 1 : 0, tot - van],
      data: { type: 'kleur-balk', van, tot, lat },
    };
  },
});

export const lengtematenTekenen = vormKt({
  id: 'lengtematen-tekenen', titel: 'Een lijn tekenen', pictogram: 'tekenen', rang: 6, schaal: 0.5,
  opdracht: 'Teken de lijn met je liniaal. Begin bij het bolletje.',
  bouw(r, { gebied }) {
    const cm = r.geheel(1, Math.min(15, gebied));
    return {
      tekst: `Teken een lijn van ${cm} cm.`, svg: lijnTekenen({ cm }), antwoordSvg: lijnTekenen({ cm, oplossing: true }), breed: true,
      antwoord: `${cm} cm`, volledig: `Een lijn van ${cm} cm.`,
      getallen: [cm], sleutel: `${cm}`, moeilijkheid: [cm], data: { type: 'teken-lijn', cm },
    };
  },
});


export const LENGTE_VORMEN = [...MAAT_VORMEN, lengtematenKleuren, lengtematenTekenen];
