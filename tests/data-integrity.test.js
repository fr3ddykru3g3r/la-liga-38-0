import test from 'node:test';
import assert from 'node:assert/strict';
import { players } from '../src/data.js';

const positions = new Set(['GK','RB','CB','LB','RWB','LWB','CDM','CM','CAM','RM','LM','RW','ST','LW']);

test('every published player-season card is structurally valid', () => {
  assert.ok(players.length > 6000);
  const ids = new Set();
  for (const card of players) {
    assert.ok(card.id && !ids.has(card.id), `duplicate card id: ${card.id}`);
    ids.add(card.id);
    assert.ok(card.name && card.club && /^\d{4}\/\d{2}$/.test(card.season), `invalid identity fields: ${card.id}`);
    assert.ok(Number.isFinite(card.rating) && Number.isFinite(card.prime), `invalid rating: ${card.id}`);
    assert.ok(card.rating >= 1 && card.rating <= 100 && card.prime >= card.rating && card.prime <= 100, `rating out of bounds: ${card.id}`);
    assert.ok(card.positions.length && card.positions.every(position => positions.has(position)), `invalid position: ${card.id}`);
  }
});
