// Maakt ontwikkel/taal-dekking.md: per cluster (domein, subdomein, cluster) en leerjaar hoeveel doelen er zijn, hoeveel daarvan een automatische
// oefening hebben en hoeveel verschillende oefeningen die hoogstens opleveren (er wordt tot 40 gevraagd). Draaien met: node scripts/taal-dekking.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { ECHTE_GENERATORS } from '../js/subjects/taal/generators/index.js';

const doelen = JSON.parse(readFileSync(new URL('../data/taal/doelen-taal-opstap.json', import.meta.url), 'utf8')).doelen;
const MAX = 40, LAAG = 10;

const perDoel = new Map();
for (const d of doelen) {
  const vormen = ECHTE_GENERATORS.filter(g => g.doelen.includes(d.code));
  let capaciteit = 0;
  for (const g of vormen) {
    let n = 0;
    try { n = g.genereer({ seed: 7, aantal: MAX, gebied: 0, opties: g.opties([d.code], {}, d.code) }).oefeningen.length; } catch { n = 0; }
    capaciteit = Math.max(capaciteit, n);
  }
  perDoel.set(d.code, { vormen: vormen.length, capaciteit });
}

const clusters = new Map();
for (const d of doelen) {
  const k = [d.domein, d.subdomein, d.rubriek || '(geen cluster)'].join(' › ');
  if (!clusters.has(k)) clusters.set(k, new Map());
  const jaren = clusters.get(k);
  if (!jaren.has(d.leerjaar)) jaren.set(d.leerjaar, []);
  jaren.get(d.leerjaar).push(perDoel.get(d.code));
}

const regels = ['# Dekking van de Taaldoelen per cluster', '',
  `Gemaakt met \`node scripts/taal-dekking.mjs\`. Per cluster en leerjaar staat: *automatisch/doelen* en tussen haakjes het kleinste aantal verschillende oefeningen (hoogstens ${MAX}) dat een van die doelen oplevert. Een streepje betekent dat het cluster in dat leerjaar niet voorkomt; **0/n** betekent alleen open opdrachten. Een kleinste aantal onder ${LAAG} is laag: daar komen oefeningen snel dubbel voor.`, '',
  '| Cluster | L1 | L2 | L3 | L4 | L5 | L6 |', '|---|---|---|---|---|---|---|'];
let totaal = 0, auto = 0;
const laag = [];
for (const [k, jaren] of clusters) {
  const cellen = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map(j => {
    const lijst = jaren.get(j);
    if (!lijst) return '–';
    const echt = lijst.filter(x => x.vormen > 0);
    totaal += lijst.length; auto += echt.length;
    if (!echt.length) return `0/${lijst.length}`;
    const min = Math.min(...echt.map(x => x.capaciteit));
    if (min < LAAG) laag.push(`${k} ${j}: ${min}`);
    return `${echt.length}/${lijst.length} (${min})`;
  });
  regels.push(`| ${k.replace(/\|/g, '/')} | ${cellen.join(' | ')} |`);
}
regels.push('', `Samen: ${auto} van ${totaal} doelen hebben een automatische oefening; de rest heeft open opdrachten.`, '',
  `## Laag aantal oefeningen (minder dan ${LAAG})`, '', ...(laag.length ? laag.map(x => `- ${x}`) : ['Geen.']), '');
writeFileSync(new URL('../ontwikkel/taal-dekking.md', import.meta.url), regels.join('\n'));
console.log(`${auto} van ${totaal} doelen automatisch; ${laag.length} cluster/leerjaar-combinaties met weinig oefeningen`);
