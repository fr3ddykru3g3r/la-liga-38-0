import { cp, mkdir, writeFile } from 'node:fs/promises';
import { players } from '../src/data.js';

await mkdir('dist/server', { recursive: true });
await cp('server/index.js', 'dist/server/index.js');
await cp('server/engine.js', 'dist/server/engine.js');

const cards = players.map(({ id, playerId, name, club, season, positions, rating, prime }) => ({
  id, playerId, name, club, season, positions, rating, prime,
}));
await writeFile('dist/server/catalog.js', `export const cards = ${JSON.stringify(cards)};\n`);
