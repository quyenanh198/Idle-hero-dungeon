const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const E=require('../environment.js');
const art=require('../assets/art/environment-v4.frames.json');

test('every world prop has a bounded complete source region',()=>{
  const image=fs.readFileSync(require.resolve('../assets/art/environment-v4.png'));
  assert.equal(image.readUInt32BE(16),art.width);assert.equal(image.readUInt32BE(20),art.height);
  assert.equal(Object.keys(E.CATALOG).length,16);
  for(const name of Object.keys(E.CATALOG)){
    const frame=art.frames[name];assert.ok(frame,name);assert.ok(frame.w>100&&frame.h>100);
    assert.ok(frame.x>=0&&frame.y>=0&&frame.x+frame.w<=art.width&&frame.y+frame.h<=art.height);
    const uv=E.frameUv(name,art);assert.ok(uv.x>=0&&uv.y>=0&&uv.x+uv.w<=1&&uv.y+uv.h<=1);
    assert.ok(frame.pivot[0]>=0&&frame.pivot[0]<=1);
  }
});
test('unknown prop names cannot sample unrelated artwork',()=>assert.throws(()=>E.frameUv('missing',art),/Unknown prop/));
test('prop rectangles never include a neighbouring sprite',()=>{
  const frames=Object.entries(art.frames);
  for(let i=0;i<frames.length;i++)for(let j=i+1;j<frames.length;j++){
    const [aName,a]=frames[i],[bName,b]=frames[j];
    const overlap=a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
    assert.equal(overlap,false,aName+' overlaps '+bName);
  }
});
test('heavy props stay still while foliage and runes animate within bounds',()=>{
  for(let t=0;t<100;t+=.37){const rock=E.motion('mossrock',t,1);assert.equal(rock.rotation,0);assert.equal(rock.scale,1);const tree=E.motion('pine',t,1);assert.ok(Math.abs(tree.rotation)<=.025);const portal=E.motion('portal',t,1);assert.ok(portal.scale>.97&&portal.scale<1.03);}
});
test('foliage fades only when standing between the hero and camera',()=>{
  const hero={x:0,z:0};assert.ok(E.opacityFor({kind:'pine',x:.4,z:2,scale:1},hero)<1);
  assert.equal(E.opacityFor({kind:'pine',x:5,z:2,scale:1},hero),1);
  assert.equal(E.opacityFor({kind:'pine',x:.4,z:-2,scale:1},hero),1);
  assert.equal(E.opacityFor({kind:'barrel',x:0,z:1,scale:1},hero),1);
});
