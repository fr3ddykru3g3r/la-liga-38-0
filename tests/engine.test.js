import test from 'node:test';
import assert from 'node:assert/strict';
import { players, formations } from '../src/data.js';
import { rngFrom, legalClubSeasons, fitFor, teamLines, simulateSeason, legacyRating } from '../src/engine.js';

function buildXI(formation='4-3-3') {
  const used = new Set();
  return formations[formation].map((slot, slotIndex) => {
    const player = players.filter(p => !used.has(p.playerId) && fitFor(p,slot)>0).sort((a,b)=>b.rating-a.rating)[0];
    assert.ok(player, `player for ${slot}`); used.add(player.playerId); return {slot,slotIndex,player};
  });
}

test('seeded random sequence is stable', () => {
  const a=rngFrom('jornada'), b=rngFrom('jornada');
  assert.deepEqual(Array.from({length:20},()=>a()),Array.from({length:20},()=>b()));
});

test('legal pool never offers a squad without an eligible player', () => {
  const pool=legalClubSeasons(players,['GK'],[],{minYear:2000});
  assert.ok(pool.length>0);
  assert.ok(pool.every(group=>group.players.some(player=>fitFor(player,'GK')>0)));
});

test('team line calculation returns all four units', () => {
  const lines=teamLines(buildXI(),'season');
  for(const key of ['goalkeeping','defence','midfield','attack','overall','balance']) assert.ok(Number.isFinite(lines[key]));
});

test('same XI and seed reproduce the complete season', () => {
  const xi=buildXI(); const a=simulateSeason(xi,'season','proof-seed'), b=simulateSeason(xi,'season','proof-seed');
  assert.deepEqual(a.matches,b.matches); assert.equal(a.points,b.points); assert.equal(a.matches.length,38);
  assert.equal(a.wins+a.draws+a.losses,38); assert.equal(a.points,a.wins*3+a.draws);
});

test('simulation maintains non-negative scorelines across many seeds', () => {
  const xi=buildXI();
  for(let i=0;i<250;i++){const r=simulateSeason(xi,'season',`s-${i}`);assert.ok(r.matches.every(m=>m.goalsFor>=0&&m.goalsAgainst>=0));assert.ok(r.points>=0&&r.points<=114);}
});

test('legacy rating is bounded by archived season ratings', () => {
  const id='luis-suarez'; const values=players.filter(p=>p.playerId===id).map(p=>p.rating); const legacy=legacyRating(id,players);
  assert.ok(legacy>=Math.min(...values)&&legacy<=Math.max(...values));
});
