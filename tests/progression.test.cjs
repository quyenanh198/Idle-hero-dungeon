const {test}=require('node:test');const assert=require('node:assert/strict');const C=require('../core.js');
test('consuming enemies yields bounded permanent damage and health gains',()=>{
 const s=C.createState(),before=C.stats(s);C.awardConsume(s,false);
 assert.equal(s.consumed,1);assert.equal(C.stats(s).damage,before.damage+1);assert.equal(C.stats(s).hp,before.hp+2);
 for(let i=0;i<2000;i++)C.awardConsume(s,true);
 assert.equal(s.essence.power,500);assert.equal(s.essence.vigor,1000);
});
test('resource and camp rewards persist and cannot be claimed twice',()=>{
 let s=C.createState();const gold=s.gold;
 assert.ok(C.claimNode(s,'wood'));assert.ok(s.gold>gold);assert.equal(C.claimNode(s,'wood'),false);
 assert.ok(C.claimCamp(s,0));const earned=s.gold;
 s=C.restoreState(JSON.stringify(s),s.savedAt,true);assert.equal(C.claimCamp(s,0),false);assert.equal(s.gold,earned);
 assert.equal(C.claimNode(s,'made-up'),false);assert.equal(C.claimNode(s,'constructor'),false);assert.equal(C.claimCamp(s,8),false);
});
test('pre-progression saves migrate earned currency, weapon levels and skills explicitly',()=>{
 const s=C.createState();delete s.progressionVersion;delete s.essence;delete s.consumed;delete s.claimedNodes;delete s.claimedCamps;
 s.gold=8123;s.weapons.axe=12;s.skills=['strength'];const migrated=C.restoreState(JSON.stringify(s),s.savedAt,true);
 assert.equal(migrated.progressionVersion,1);assert.equal(migrated.gold,8123);assert.equal(migrated.weapons.axe,12);assert.deepEqual(migrated.skills,['strength']);assert.deepEqual(migrated.essence,{power:0,vigor:0});
});
test('strict import rejects invalid permanent gains and duplicate/unknown reward claims',()=>{
 for(const mutate of [s=>s.essence.power=501,s=>s.essence.vigor=-1,s=>s.claimedNodes=['wood','wood'],s=>s.claimedCamps=[4],s=>s.consumed=.5,s=>s.progressionVersion=9]){
  const s=C.createState();mutate(s);assert.throws(()=>C.restoreState(JSON.stringify(s),s.savedAt,true),/Invalid save/);
 }
});
