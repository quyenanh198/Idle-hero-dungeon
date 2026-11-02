const {test}=require('node:test');const assert=require('node:assert/strict');const M=require('../movement.js');
test('swept movement cannot tunnel through a prop or exceed world bounds',()=>{
 const obstacle={x:0,z:0,radius:1};const p=M.move({x:-4,z:0},8,0,[obstacle],.6);assert.ok(Math.hypot(p.x,p.z)>=1.6-1e-6);
 const edge=M.move({x:20,z:20},10,10,[],.6);assert.ok(edge.x<=20.5&&edge.z<=21);
});
test('automatic steering navigates around a blocking prop and reaches its target',()=>{
 const obstacles=[{x:0,z:3,radius:1.5}],target={x:0,z:8};let p={x:0,z:0};
 for(let i=0;i<300&&Math.hypot(p.x-target.x,p.z-target.z)>.2;i++){
  const d=M.steer(p,target,obstacles,.6);p=M.move(p,d.x*.1,d.z*.1,obstacles,.6);assert.ok(Math.hypot(p.x,p.z-3)>=2.1-1e-6);
 }
 assert.ok(Math.hypot(p.x,p.z-8)<.3);
});
test('sliding along a prop remains finite even when starting at its center',()=>{
 const p=M.move({x:1,z:1},0,.1,[{x:1,z:1,radius:1}],.6);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));assert.ok(Math.hypot(p.x-1,p.z-1)>=1.6-1e-6);
});
