// Draait alle bouwscripts in de juiste volgorde: koppelingen per familie, open opdrachten, generator-koppelingen.
import { execFileSync } from 'node:child_process';
for (const s of ['bouw-koppelingen', 'open-doelen', 'koppelingen']) {
  console.log(`> ${s}`);
  console.log(execFileSync('node', [new URL(`./${s}.mjs`, import.meta.url).pathname], { encoding: 'utf8' }));
}
