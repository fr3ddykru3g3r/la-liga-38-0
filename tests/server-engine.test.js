import test from 'node:test';
import assert from 'node:assert/strict';
import { players } from '../src/data.js';
import { formations, fit, legalGroups, simulate } from '../server/engine.js';

function buildXI(formation='4-3-3'){
  const used=new Set();
  return formations[formation].map((slot,slotIndex)=>{
    const card=players.filter(p=>!used.has(p.playerId)&&fit(p,slot)>0).sort((a,b)=>b.rating-a.rating)[0];
    assert.ok(card);used.add(card.playerId);return{slot,slotIndex,card};
  });
}

test('server supports the expanded formation catalogue',()=>{
  assert.ok(Object.keys(formations).length>=13);
  assert.ok(Object.values(formations).every(slots=>slots.length===11&&slots.filter(s=>s==='GK').length===1));
});

test('server legal draw excludes drafted identities',()=>{
  const pick=buildXI()[0];
  const pool=legalGroups(players,['GK','CB'],[pick],{minYear:2000});
  assert.ok(pool.length>0);
  assert.ok(pool.every(group=>group.cards.every(card=>card.playerId!==pick.card.playerId)));
});

test('authoritative engine is deterministic and internally consistent',()=>{
  const xi=buildXI(),a=simulate(xi,'season','server-proof'),b=simulate(xi,'season','server-proof');
  assert.deepEqual(a,b);
  assert.equal(a.matches.length,38);
  assert.equal(a.wins+a.draws+a.losses,38);
  assert.equal(a.points,a.wins*3+a.draws);
});

test('stronger XI has a higher mean over a fixed calibration seed set',()=>{
  const strong=buildXI(),weak=strong.map(p=>({...p,card:{...p.card,rating:Math.max(55,p.card.rating-18),prime:Math.max(55,p.card.prime-18)}}));
  const mean=xi=>Array.from({length:300},(_,i)=>simulate(xi,'season',`cal-${i}`).points).reduce((a,b)=>a+b,0)/300;
  assert.ok(mean(strong)>mean(weak)+15);
});
