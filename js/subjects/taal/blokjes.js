// Het palet voor Taal: één kaart per soort oefeningen (zie js/core/blokjes.js). De vormen (invullen, zin aanvullen, kies, juist of fout, ...)
// zijn de vorm-chip van de kaart. Open opdrachten en wat hier niet op staat, komen automatisch in 'Meer oefeningen'.
import { GENERATORS } from './generators/index.js';

const familie = (prefix) => GENERATORS.filter(g => g.id.startsWith(`${prefix}-`)).map(g => g.id);
const kaart = (id, domein, titel, breedte = 2, aantal = [6, 4, 8, 10], prefix = id) => ({ id, domein, titel, breedte, aantal, vormen: familie(prefix) });

export default {
  domeinen: ['Spelling', 'Werkwoorden', 'Woordenschat', 'Taalkunde'],
  kaarten: [
    kaart('kl', 'Spelling', 'Klankwoorden (ei/ij, au/ou, ie/oe/eu/ui, ng/nk, ...)'),
    kaart('hl', 'Spelling', 'Woord juist schrijven'),
    kaart('hz', 'Spelling', 'Zin juist schrijven'),
    kaart('mv', 'Spelling', 'Meervoud'),
    kaart('vv', 'Spelling', 'Verenkelen en verdubbelen'),
    kaart('vk', 'Spelling', 'Verkleinwoord'),
    kaart('el', 'Spelling', 'Enkelvoud'),
    kaart('sm', 'Spelling', 'Samenstelling'),
    kaart('bz', 'Spelling', 'Bezit (\'s of s)'),
    kaart('lw', 'Spelling', 'Leenwoord'),
    kaart('af', 'Spelling', 'Afkorting'),
    kaart('tk', 'Spelling', 'Trema, koppelteken, accent en apostrof'),
    kaart('ww-ott', 'Werkwoorden', 'Tegenwoordige tijd'),
    kaart('ww-ovt', 'Werkwoorden', 'Verleden tijd'),
    kaart('ww-vd', 'Werkwoorden', 'Voltooid deelwoord'),
    kaart('ww-vp', 'Werkwoorden', 'Voltooid tegenwoordige tijd'),
    kaart('ww-tt', 'Werkwoorden', 'Toekomende tijd'),
    kaart('wk', 'Werkwoorden', 'Stam, infinitief en tijd'),
    kaart('sy', 'Woordenschat', 'Synoniemen'),
    kaart('an', 'Woordenschat', 'Antoniemen'),
    kaart('az', 'Woordenschat', 'Alfabet'),
    kaart('wb', 'Woordenschat', 'Woordbouw: samenstellingen, voor- en achtervoegsels'),
    kaart('ws', 'Taalkunde', 'Woordsoorten'),
    kaart('zs', 'Taalkunde', 'Soorten zinnen en leestekens'),
    kaart('ps', 'Taalkunde', 'Persoonsvorm en onderwerp'),
    kaart('zd', 'Taalkunde', 'Zinsdelen en gezegde'),
    kaart('zk', 'Taalkunde', 'Zinsbouw en ontkenning'),
    kaart('gw', 'Taalkunde', 'Bevel en gebiedende wijs'),
  ].filter(k => k.vormen.length),
};
