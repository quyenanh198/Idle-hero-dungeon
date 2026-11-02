const {test}=require('node:test');const assert=require('node:assert/strict');const H=require('../hook.js');
const hero={x:0,z:0};const enemy=(id=1,x=5,boss=false)=>({id,x,z:0,hp:boss?2400:180,max:boss?2400:180,alive:true,boss});
test('hook captures a live target, visibly reels it in, consumes once and starts cooldown',()=>{
 const s=H.create(),e=enemy();assert.equal(H.start(s,hero,[e]),true);assert.equal(e.captured,true);assert.equal(s.phase,'outbound');
 H.step(s,.25,hero,[e]);assert.equal(s.phase,'reel');H.step(s,.25,hero,[e]);assert.ok(e.x<5&&e.x>0);
 const events=[];for(let i=0;i<20;i++)events.push(...H.step(s,.05,hero,[e]));
 assert.equal(events.filter(e=>e.type==='consume').length,1);assert.equal(e.alive,false);assert.equal(e.captured,false);assert.equal(H.start(s,hero,[enemy(2)]),false);
});
test('healthy bosses and out-of-range enemies cannot be captured; weakened bosses can',()=>{
 const s=H.create(),boss=enemy(1,5,true);assert.equal(H.start(s,hero,[boss,enemy(2,9)]),false);
 boss.hp=boss.max*.2;assert.equal(H.start(s,hero,[boss]),true);
});
test('pause does not progress the hook and cancellation releases a captured target',()=>{
 const s=H.create(),e=enemy();H.start(s,hero,[e]);const snapshot=JSON.stringify(s);assert.deepEqual(H.step(s,0,hero,[e]),[]);assert.equal(JSON.stringify(s),snapshot);
 H.cancel(s,[e]);assert.equal(e.captured,false);assert.equal(s.phase,'idle');assert.equal(e.alive,true);
});
test('capture choice is nearest eligible target and invalid target cancels safely',()=>{
 const s=H.create(),a=enemy(1,6),b=enemy(2,3);H.start(s,hero,[a,b]);assert.equal(s.target,2);b.alive=false;H.step(s,.1,hero,[a,b]);assert.equal(s.phase,'idle');assert.equal(b.captured,false);
});
