const {test}=require('node:test');const assert=require('node:assert/strict');
const C=require('../combat.js');
const hero=()=>({x:0,z:0,hp:400,maxHp:400,regen:0,range:4.1});
const enemy=(id=1,x=2,boss=false)=>({id,x,z:0,hp:boss?2400:500,max:boss?2400:500,alive:true,boss,kind:0});
function run(sim,h,es,ws,seconds,dt=1/60){let events=[];for(let t=0;t<seconds-1e-7;t+=dt)events.push(...C.step(sim,dt,h,es,ws));return events;}
test('seeded combat repeats exactly across browser frame subdivisions',()=>{
 const go=dt=>{const s=C.create(42),h=hero(),es=[enemy()];const events=run(s,h,es,[{id:'axe',dps:25}],3,dt);return {hp:h.hp,enemyHp:es[0].hp,events};};
 assert.deepEqual(go(1/30),go(1/60));
});
test('each weapon has an independent cooldown and distinct effect identity',()=>{
 assert.equal(new Set(Object.values(C.PROFILES).map(p=>p.effect)).size,6);
 const s=C.create(),h=hero(),es=[enemy()];const events=run(s,h,es,[{id:'axe',dps:5},{id:'staff',dps:5}],2);
 const counts=id=>events.filter(e=>e.type==='weapon'&&e.weapon===id).length;
 assert.ok(counts('axe')>counts('staff'));
});
test('poison and burning continue ticking after the hero leaves range',()=>{
 for(const id of ['blade','staff']){
  const s=C.create(),h=hero(),e=enemy();C.step(s,.05,h,[e],[{id,dps:30}]);const hp=e.hp;
  h.x=30;run(s,h,[e],[],1.5);assert.ok(e.hp<hp,id);
 }
});
test('continuous poison/burn attacks preserve every pending damage tick',()=>{
 for(const id of ['blade','staff']){
  const s=C.create(),h=hero(),e=enemy();e.hp=e.max=100000;
  const events=run(s,h,[e],[{id,dps:200}],3.2);h.x=30;events.push(...run(s,h,[e],[],4));
  const attacks=events.filter(v=>v.type==='weapon').length;
  const dots=events.filter(v=>v.type==='damage'&&v.dot).reduce((n,v)=>n+v.amount,0);
  const fraction=id==='blade'?.3:.25;
  assert.ok(Math.abs(dots-attacks*200*C.PROFILES[id].cooldown*fraction)<1e-6,id);
 }
});
test('windup locks a ground target and moving out dodges the strike',()=>{
 const s=C.create(),h=hero(),e=enemy(1,1.5);run(s,h,[e],[],.1);assert.equal(e.combat.state,'windup');
 h.x=10;run(s,h,[e],[],1);assert.equal(h.hp,400);
});
test('enemy windups and strikes run independently',()=>{
 const s=C.create(),h=hero(),es=[enemy(1,1),enemy(2,-1)];
 const events=run(s,h,es,[],1.2);assert.equal(events.filter(e=>e.type==='heroHit').length,2);
});
test('frost slows movement and blunt impact interrupts a windup',()=>{
 const s=C.create(),h=hero(),e=enemy(1,3.5),normal=enemy(2,3.5);
 C.step(s,.05,h,[e],[{id:'crossbow',dps:1}]);run(s,h,[e],[],.3);
 run(C.create(),hero(),[normal],[],.35);assert.ok(e.x>normal.x);
 const close=enemy(3,1);C.step(s,.05,h,[close],[]);assert.equal(close.combat.state,'windup');
 run(s,h,[close],[{id:'hammer',dps:1}],.1);assert.notEqual(close.combat.state,'windup');
});
test('boss enrages at low health, has a larger dodgeable telegraph and cannot be stun-locked',()=>{
 const s=C.create(),h=hero(),e=enemy(1,1,true);e.hp=e.max*.35;
 C.step(s,.05,h,[e],[{id:'hammer',dps:1}]);assert.equal(e.combat.enraged,true);assert.ok(e.combat.radius>=3);
 assert.equal(e.combat.statuses.stun,undefined);h.x=12;run(s,h,[e],[],1.2);assert.equal(h.hp,400);
});
test('death is emitted once including DOT kills; respawn clears status and attack state',()=>{
 const s=C.create(),h=hero(),e=enemy();e.hp=5;
 const events=run(s,h,[e],[{id:'staff',dps:50}],3);assert.equal(events.filter(v=>v.type==='death').length,1);
 assert.equal(e.hp,0);assert.equal(e.alive,false);C.resetEnemy(e,2,0);assert.equal(e.alive,true);assert.equal(e.hp,e.max);assert.equal(e.combat.state,'approach');
});
test('zero elapsed time cannot advance attacks or statuses and defeat is emitted only once',()=>{
 const s=C.create(),h=hero(),e=enemy(1,1);const before=JSON.stringify(s);
 assert.deepEqual(C.step(s,0,h,[e],[]),[]);assert.equal(JSON.stringify(s),before);
 h.hp=1;const events=run(s,h,[e],[],4);assert.equal(events.filter(v=>v.type==='defeat').length,1);assert.equal(h.hp,0);
});
