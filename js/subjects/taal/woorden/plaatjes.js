// Eigen tekeningen (SVG, 100 x 100) bij frequente woorden, voor de schrijfoefeningen met plaatjes.
// w = het woord, lid = de of het, regel = bij welk spellingdoel het woord past:
//   'mkm' = klankzuiver woord van drie letters (medeklinker, korte klinker, medeklinker): 1.3.GL1.13
//   'tek' = eenlettergrepig woord met een tweetekenklank zonder medeklinkercluster: 1.3.GL1.18
// Een woord komt er enkel in als de tekening zonder uitleg te herkennen is. Nieuwe woorden: tekening toevoegen in TEKEN en het woord in PLAATJES.
const S = '#333', K = (kleur, extra = '') => `fill="${kleur}" stroke="${S}" stroke-width="2.5" stroke-linejoin="round" ${extra}`;

const TEKEN = {
  bal: () => `<circle cx="50" cy="50" r="38" ${K('#fff')}/><polygon points="50,34 64,44 59,61 41,61 36,44" fill="${S}"/><path d="M50 34 L50 14 M64 44 L82 38 M59 61 L70 78 M41 61 L30 78 M36 44 L18 38" stroke="${S}" stroke-width="2.5" fill="none"/>`,
  zon: () => `<g stroke="#e8a317" stroke-width="5" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="50" y1="50" x2="${50 + 44 * Math.cos(a * Math.PI / 180)}" y2="${50 + 44 * Math.sin(a * Math.PI / 180)}"/>`).join('')}</g><circle cx="50" cy="50" r="24" ${K('#ffd23f')}/>`,
  vis: () => `<polygon points="70,50 94,30 94,70" ${K('#4a90d9')}/><ellipse cx="44" cy="50" rx="32" ry="20" ${K('#5ba4e6')}/><path d="M38 31 Q46 18 56 32" ${K('#4a90d9')}/><circle cx="26" cy="45" r="4" fill="${S}"/><path d="M52 36 Q58 50 52 64" fill="none" stroke="${S}" stroke-width="2"/>`,
  pen: () => `<g transform="rotate(40 50 50)"><rect x="43" y="8" width="14" height="64" rx="3" ${K('#2a6ebb')}/><polygon points="43,72 57,72 50,92" ${K('#f1c89c')}/><polygon points="48,86 52,86 50,92" fill="${S}"/><rect x="43" y="8" width="14" height="12" rx="3" ${K('#c0392b')}/></g>`,
  bus: () => `<rect x="6" y="26" width="88" height="44" rx="8" ${K('#f4b942')}/>${[14, 36, 58].map(x => `<rect x="${x}" y="34" width="18" height="16" rx="2" ${K('#dff1fb')}/>`).join('')}<rect x="78" y="34" width="12" height="28" rx="2" ${K('#dff1fb')}/><circle cx="26" cy="72" r="9" ${K('#555')}/><circle cx="74" cy="72" r="9" ${K('#555')}/>`,
  pet: () => `<path d="M16 62 A34 34 0 0 1 84 62 Z" ${K('#d9534f')}/><path d="M66 62 Q96 56 98 68 Q80 72 62 66 Z" ${K('#b03a37')}/><circle cx="50" cy="28" r="4" ${K('#b03a37')}/>`,
  mes: () => `<path d="M8 66 Q10 44 62 40 L62 60 Q30 64 8 66 Z" ${K('#d8dde3')}/><rect x="60" y="40" width="34" height="20" rx="6" ${K('#8a5a2b')}/><circle cx="72" cy="50" r="2.5" fill="#d8dde3"/><circle cx="84" cy="50" r="2.5" fill="#d8dde3"/>`,
  kat: () => `<polygon points="22,40 26,10 46,28" ${K('#e6a15a')}/><polygon points="78,40 74,10 54,28" ${K('#e6a15a')}/><circle cx="50" cy="54" r="34" ${K('#e6a15a')}/><circle cx="38" cy="48" r="5" fill="${S}"/><circle cx="62" cy="48" r="5" fill="${S}"/><polygon points="46,58 54,58 50,64" fill="#e58a8a" stroke="${S}" stroke-width="1.5"/><path d="M50 64 Q44 72 38 68 M50 64 Q56 72 62 68" fill="none" stroke="${S}" stroke-width="2"/><path d="M12 56 L34 60 M12 68 L34 64 M88 56 L66 60 M88 68 L66 64" stroke="${S}" stroke-width="2"/>`,
  bed: () => `<rect x="8" y="30" width="8" height="52" ${K('#8a5a2b')}/><rect x="84" y="46" width="8" height="36" ${K('#8a5a2b')}/><rect x="12" y="54" width="80" height="16" rx="4" ${K('#7bb4e8')}/><rect x="16" y="44" width="26" height="12" rx="6" ${K('#fff')}/>`,
  sok: () => `<path d="M34 8 H62 V54 Q62 58 70 62 Q92 70 86 84 Q80 94 62 88 Q34 80 34 60 Z" ${K('#e07a9a')}/><rect x="34" y="8" width="28" height="12" ${K('#fff')}/>`,
  kam: () => `<rect x="8" y="14" width="84" height="22" rx="6" ${K('#4a90d9')}/>${[16, 26, 36, 46, 56, 66, 76, 84].map(x => `<rect x="${x - 3}" y="36" width="6" height="40" rx="2" ${K('#4a90d9')}/>`).join('')}`,
  bel: () => `<path d="M50 14 Q20 20 20 56 L12 72 H88 L80 56 Q80 20 50 14 Z" ${K('#f0c040')}/><circle cx="50" cy="80" r="8" ${K('#a67c00')}/><circle cx="50" cy="10" r="4" ${K('#a67c00')}/>`,
  ei: () => `<ellipse cx="50" cy="54" rx="28" ry="36" ${K('#fffaf0')}/>`,
  huis: () => `<rect x="18" y="44" width="64" height="44" ${K('#f2c9a0')}/><polygon points="8,46 50,12 92,46" ${K('#c0392b')}/><rect x="42" y="62" width="16" height="26" ${K('#8a5a2b')}/><rect x="24" y="52" width="14" height="14" ${K('#dff1fb')}/><rect x="62" y="52" width="14" height="14" ${K('#dff1fb')}/>`,
  boek: () => `<path d="M10 22 Q30 14 50 24 V84 Q30 74 10 82 Z" ${K('#fff')}/><path d="M90 22 Q70 14 50 24 V84 Q70 74 90 82 Z" ${K('#fff')}/><path d="M18 36 Q30 32 42 38 M18 48 Q30 44 42 50 M18 60 Q30 56 42 62 M58 38 Q70 32 82 36 M58 50 Q70 44 82 48 M58 62 Q70 56 82 60" fill="none" stroke="#999" stroke-width="2"/>`,
  neus: () => `<path d="M44 8 Q42 50 30 62 Q28 76 44 78 Q50 72 56 78 Q72 76 70 62 Q58 50 56 8" ${K('#f1c89c')}/><circle cx="42" cy="68" r="3.5" fill="${S}"/><circle cx="58" cy="68" r="3.5" fill="${S}"/>`,
  pijl: () => `<line x1="10" y1="50" x2="80" y2="50" stroke="${S}" stroke-width="7" stroke-linecap="round"/><polygon points="68,28 94,50 68,72" ${K('#d9534f')}/>`,
  deur: () => `<rect x="24" y="8" width="52" height="84" rx="3" ${K('#9a6a3a')}/><rect x="32" y="18" width="14" height="26" rx="2" ${K('#b88450')}/><rect x="54" y="18" width="14" height="26" rx="2" ${K('#b88450')}/><circle cx="66" cy="58" r="4" ${K('#f0c040')}/>`,
  uil: () => `<ellipse cx="50" cy="56" rx="30" ry="36" ${K('#a9825a')}/><polygon points="26,28 22,12 40,22" ${K('#a9825a')}/><polygon points="74,28 78,12 60,22" ${K('#a9825a')}/><circle cx="38" cy="42" r="12" ${K('#fff')}/><circle cx="62" cy="42" r="12" ${K('#fff')}/><circle cx="38" cy="42" r="5" fill="${S}"/><circle cx="62" cy="42" r="5" fill="${S}"/><polygon points="45,52 55,52 50,62" ${K('#f0a030')}/><path d="M32 70 Q38 76 44 70 M46 74 Q52 80 58 74" fill="none" stroke="${S}" stroke-width="2"/>`,
  muis: () => `<path d="M82 62 Q98 62 96 44 Q94 36 88 40" fill="none" stroke="${S}" stroke-width="3"/><ellipse cx="46" cy="62" rx="34" ry="22" ${K('#b9b9c0')}/><circle cx="24" cy="38" r="12" ${K('#b9b9c0')}/><circle cx="24" cy="38" r="6" fill="#e9a3a3"/><circle cx="44" cy="30" r="12" ${K('#b9b9c0')}/><circle cx="44" cy="30" r="6" fill="#e9a3a3"/><circle cx="20" cy="62" r="4" fill="${S}"/><circle cx="12" cy="68" r="3.5" fill="#e58a8a"/>`,
};

const woorden = (regel, lijst) => lijst.map(([w, lid]) => ({ w, lid, regel }));
export const PLAATJES = [
  ...woorden('mkm', [['bal', 'de'], ['zon', 'de'], ['vis', 'de'], ['pen', 'de'], ['bus', 'de'], ['pet', 'de'], ['mes', 'het'], ['kat', 'de'], ['bed', 'het'], ['sok', 'de'], ['kam', 'de'], ['bel', 'de']]),
  ...woorden('tek', [['ei', 'het'], ['huis', 'het'], ['boek', 'het'], ['neus', 'de'], ['pijl', 'de'], ['deur', 'de'], ['uil', 'de'], ['muis', 'de']]),
];

export const plaatjesVoor = (regel) => PLAATJES.filter(p => p.regel === regel);

// De tekening bij een woord als { markup, breedte, hoogte }. 'hulp' voegt iets toe naast de tekening:
//   'vakjes' = een vakje per letter, 'woord' = het woord onder de tekening.
export function plaatjeSvg(w, { groot = 96, hulp = 'geen' } = {}) {
  const tekening = TEKEN[w];
  if (!tekening) throw new Error(`Geen tekening voor het woord "${w}"`);
  const kop = (breedte, hoogte, inhoud) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breedte} ${hoogte}" width="${breedte}" height="${hoogte}" font-family="Andika, Arial, Helvetica, sans-serif">${inhoud}</svg>`;
  const prent = `<g transform="translate(4 4) scale(${groot / 100})">${tekening()}</g>`;
  if (hulp === 'vakjes') {
    const VAK = 46, breedte = groot + 24 + w.length * VAK, hoogte = groot + 8, y = (hoogte - VAK) / 2;
    const vakjes = [...w].map((_, i) => `<rect x="${groot + 20 + i * VAK}" y="${y}" width="${VAK - 4}" height="${VAK}" rx="6" fill="#fff" stroke="${S}" stroke-width="2.5"/>`).join('');
    return { markup: kop(breedte, hoogte, prent + vakjes), breedte, hoogte };
  }
  if (hulp === 'woord') {
    const breedte = Math.max(groot + 8, w.length * 17 + 16), hoogte = groot + 38;
    return { markup: kop(breedte, hoogte, `<g transform="translate(${(breedte - groot) / 2 - 4} 0)">${prent}</g><text x="${breedte / 2}" y="${groot + 30}" text-anchor="middle" font-size="24" fill="#111">${w}</text>`), breedte, hoogte };
  }
  return { markup: kop(groot + 8, groot + 8, prent), breedte: groot + 8, hoogte: groot + 8 };
}

/* ---- reeksen van drie plaatjes die op elkaar volgen (voor 'zet de plaatjes in volgorde en schrijf bij elk plaatje een zin') */
const GROND = `<rect x="0" y="74" width="100" height="26" ${K('#8a5a2b')}/>`;
const STAP = {
  zaad1: () => `${GROND}<ellipse cx="50" cy="68" rx="7" ry="5" ${K('#c9a227')}/>`,
  zaad2: () => `${GROND}<path d="M50 74 V44" stroke="#3a9a3a" stroke-width="5" fill="none"/><ellipse cx="38" cy="46" rx="12" ry="6" ${K('#5cc05c')}/><ellipse cx="62" cy="40" rx="12" ry="6" ${K('#5cc05c')}/>`,
  zaad3: () => `${GROND}<path d="M50 74 V32" stroke="#3a9a3a" stroke-width="5" fill="none"/><ellipse cx="36" cy="58" rx="12" ry="6" ${K('#5cc05c')}/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${50 + 14 * Math.cos(a * Math.PI / 180)}" cy="${26 + 14 * Math.sin(a * Math.PI / 180)}" r="9" ${K('#f08ab0')}/>`).join('')}<circle cx="50" cy="26" r="7" ${K('#ffd23f')}/>`,
  ijs1: () => `<polygon points="30,52 70,52 50,94" ${K('#e3b36a')}/><circle cx="50" cy="44" r="20" ${K('#f6a8c4')}/><circle cx="50" cy="24" r="17" ${K('#a8e0f0')}/>`,
  ijs2: () => `<polygon points="30,52 70,52 50,94" ${K('#e3b36a')}/><circle cx="50" cy="42" r="20" ${K('#f6a8c4')}/>`,
  ijs3: () => `<polygon points="30,52 70,52 50,94" ${K('#e3b36a')}/>`,
  kaars1: () => `<rect x="38" y="24" width="24" height="68" ${K('#fff4c2')}/><path d="M50 4 Q60 14 50 24 Q40 14 50 4 Z" ${K('#f5a623')}/>`,
  kaars2: () => `<rect x="38" y="54" width="24" height="38" ${K('#fff4c2')}/><path d="M50 34 Q60 44 50 54 Q40 44 50 34 Z" ${K('#f5a623')}/>`,
  kaars3: () => `<rect x="38" y="78" width="24" height="14" ${K('#fff4c2')}/><path d="M50 58 Q60 68 50 78 Q40 68 50 58 Z" ${K('#f5a623')}/>`,
  kuiken1: () => `<ellipse cx="50" cy="56" rx="28" ry="36" ${K('#fffaf0')}/>`,
  kuiken2: () => `<path d="M22 56 Q22 22 50 20 Q78 22 78 56 Q78 90 50 90 Q22 90 22 56 Z" ${K('#fffaf0')}/><path d="M22 52 L34 44 L42 54 L52 42 L62 54 L70 44 L78 52" fill="none" stroke="${S}" stroke-width="2.5"/><circle cx="50" cy="70" r="7" ${K('#ffd23f')}/>`,
  kuiken3: () => `<path d="M16 62 Q16 90 50 90 Q84 90 84 62 L74 56 L66 66 L58 56 L50 66 L42 56 L34 66 L26 56 Z" ${K('#fffaf0')}/><circle cx="50" cy="42" r="22" ${K('#ffd23f')}/><circle cx="42" cy="38" r="3.5" fill="${S}"/><circle cx="58" cy="38" r="3.5" fill="${S}"/><polygon points="45,46 55,46 50,54" ${K('#f0a030')}/>`,
};
export const REEKSEN = [
  { id: 'zaad', stappen: ['zaad1', 'zaad2', 'zaad3'], zinnen: ['Het zaadje ligt in de grond.', 'Er groeit een plantje.', 'Er staat een bloem.'] },
  { id: 'ijs', stappen: ['ijs1', 'ijs2', 'ijs3'], zinnen: ['Het ijsje heeft twee bollen.', 'Het ijsje heeft nog één bol.', 'Het ijsje is op.'] },
  { id: 'kaars', stappen: ['kaars1', 'kaars2', 'kaars3'], zinnen: ['De kaars is lang.', 'De kaars wordt korter.', 'De kaars is bijna op.'] },
  { id: 'kuiken', stappen: ['kuiken1', 'kuiken2', 'kuiken3'], zinnen: ['Er ligt een ei.', 'Het ei barst open.', 'Er zit een kuikentje.'] },
];

// Drie plaatjes naast elkaar in de volgorde 'orde' (indexen in de reeks), elk met een rondje om het nummer in te schrijven.
// Met 'oplossing' staat in elk rondje het juiste nummer (1, 2 of 3).
export function reeksSvg(reeks, orde, oplossing = false) {
  const KADER = 150, W = 3 * KADER + 8, H = KADER + 56;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Andika, Arial, Helvetica, sans-serif">`;
  orde.forEach((stap, pos) => {
    const x = 4 + pos * KADER;
    s += `<rect x="${x + 2}" y="4" width="${KADER - 8}" height="${KADER - 8}" rx="10" fill="#fff" stroke="${S}" stroke-width="2"/>`;
    s += `<g transform="translate(${x + 16} 18) scale(${(KADER - 40) / 100})">${STAP[reeks.stappen[stap]]()}</g>`;
    s += `<circle cx="${x + KADER / 2 - 2}" cy="${KADER + 24}" r="20" fill="#fff" stroke="${S}" stroke-width="2.5"/>`;
    if (oplossing) s += `<text x="${x + KADER / 2 - 2}" y="${KADER + 32}" text-anchor="middle" font-size="24" fill="#c0392b" font-weight="bold">${stap + 1}</text>`;
  });
  return { markup: s + '</svg>', breedte: W, hoogte: H };
}
