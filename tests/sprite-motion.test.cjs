const {test}=require('node:test');const assert=require('node:assert/strict');const S=require('../sprite-motion.js');
test('eight-way atlas faces the same screen direction as world movement',()=>{assert.equal(S.direction8(0),0);assert.equal(S.direction8(Math.PI/2),6);assert.equal(S.direction8(Math.PI),4);assert.equal(S.direction8(-Math.PI/2),2);assert.equal(S.direction8(Math.PI*2),0)});
test('idle never advances walking frames and locomotion uses a looping stride',()=>{assert.equal(S.walkRow(100,false),0);assert.equal(S.walkRow(0,true),1);assert.equal(S.walkRow(1/7+.0001,true),2);assert.equal(S.walkRow(2/7+.0001,true),3);assert.equal(S.walkRow(3/7+.0001,true),2);assert.equal(S.walkRow(4/7+.0001,true),1)});
test('atlas rectangles use top-left row order without bleeding into neighbours',()=>{assert.deepEqual(S.uv(7,3,8,4),{x:7/8,y:0,w:1/8,h:1/4});assert.deepEqual(S.uv(0,0,3,2),{x:0,y:.5,w:1/3,h:.5});});
test('attacks play windup, release, follow-through and recovery once then return to locomotion',()=>{
 assert.equal(S.attackRow(0),0);assert.equal(S.attackRow(.15),1);assert.equal(S.attackRow(.28),2);assert.equal(S.attackRow(.4),3);assert.equal(S.attackRow(.53),-1);
});
test('an early first animation timestamp still selects a valid stride frame',()=>{
 assert.equal(S.walkRow(-.01,true),1);
});
