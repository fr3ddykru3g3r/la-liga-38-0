import test from 'node:test';
import assert from 'node:assert/strict';
import summary from '../data/calibration/openfootball-summary.json' with { type:'json' };

test('historical calibration snapshot is pinned and sufficiently broad',()=>{
  assert.equal(summary.source.license,'CC0-1.0');
  assert.equal(summary.source.commit.length,40);
  assert.ok(summary.coverage.matches>=5000);
  assert.ok(summary.targets.homeGoalsPerMatch>summary.targets.awayGoalsPerMatch);
  assert.ok(summary.targets.drawPct>20&&summary.targets.drawPct<32);
});
