import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { players } from '../src/data.js';

await mkdir('dist/server', { recursive: true });
await cp('server/index.js', 'dist/server/index.js');
await cp('server/engine.js', 'dist/server/engine.js');

const cards = players.map(({ id, playerId, name, club, season, positions, rating, prime }) => ({
  id, playerId, name, club, season, positions, rating, prime,
}));
await writeFile('dist/server/catalog.js', `export const cards = ${JSON.stringify(cards)};\n`);

const assetFiles=['index.html','favicon.svg',...(await readdir('dist/assets')).map(name=>`assets/${name}`)];
const mime={html:'text/html; charset=utf-8',svg:'image/svg+xml',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const staticAssets={};
for(const file of assetFiles){
  const ext=file.split('.').at(-1);
  staticAssets[`/${file}`]={body:await readFile(`dist/${file}`,'utf8'),type:mime[ext]||'text/plain; charset=utf-8'};
}
staticAssets['/']=staticAssets['/index.html'];
await writeFile('dist/server/static.js',`export const staticAssets = ${JSON.stringify(staticAssets)};\n`);
