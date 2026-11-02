const {test}=require('node:test');const assert=require('node:assert/strict');
for(const name of ['champion-v5','champion-attack-v5'])test(name+' frames contain one complete body and no neighbour rectangle',()=>{
 const frames=require('../assets/art/'+name+'.frames.json');
 assert.equal(frames.length,32);
 for(let i=0;i<frames.length;i++){
  const a=frames[i];assert.ok(a.w>100&&a.h>100);
  for(let j=i+1;j<frames.length;j++){
   const b=frames[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);
  }
  const rect=require('../sprite-motion.js').frameUv(a,1774,887);
  assert.ok(rect.w>0&&rect.h>0&&rect.y>=0);
 }
});
