const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../motion.js');
test('six weapon identities have distinct silhouettes in motion',()=>{
 const ids=['axe','blade','bow','hammer','staff','crossbow'];
 const poses=ids.map(id=>M.weaponPose(1.2,2,6,true,id));
 assert.equal(new Set(poses.map(p=>[p.x,p.y,p.z].map(n=>n.toFixed(3)).join())).size,6);
 for(const p of poses)assert.ok(Object.values(p).every(Number.isFinite));
});
test('attack recoil has anticipation, impact and recovery without frame-rate dependence',()=>{
 assert.equal(M.attackPose(0).compression,0);
 assert.ok(M.attackPose(.09).lean<0);
 assert.ok(M.attackPose(.2).lean>0);
 assert.equal(M.attackPose(.7).lean,0);
});
test('weapon orientation follows outward blade travel and respects idle/combat phase continuity',()=>{
 for(const id of ['axe','blade','bow','hammer','staff','crossbow']){
  const a=M.weaponPose(12,0,6,false,id),b=M.weaponPose(12,0,6,true,id);
  assert.equal(a.phase,b.phase);
  assert.ok(Math.abs(a.rotation)<=Math.PI*2);
  assert.ok(Math.abs(-Math.sin(a.rotation)-Math.cos(a.phase))<1e-10);
  assert.ok(Math.abs(Math.cos(a.rotation)-Math.sin(a.phase))<1e-10);
 }
});
test('full arsenal keeps readable angular spacing during extended combat',()=>{
 const ids=['axe','blade','bow','hammer','staff','crossbow'];
 for(let t=0;t<600;t+=.83){
  const phases=ids.map((id,i)=>((M.weaponPose(t,i,6,true,id).phase%(2*Math.PI))+2*Math.PI)%(2*Math.PI)).sort((a,b)=>a-b);
  for(let i=0;i<6;i++)assert.ok((phases[(i+1)%6]-phases[i]+Math.PI*2)%(Math.PI*2)>.6);
 }
});
