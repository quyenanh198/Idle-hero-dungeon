/* Reusable combat effects: no geometry/material allocation on hit. */
(function(){
 'use strict';
 window.CombatFX={create(scene,heightAt){
  const T=THREE,capacity=144,particles=Array.from({length:capacity},()=>({life:0})),rings=[],markers=new Map();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const geometry=new T.IcosahedronGeometry(.12,0),material=new T.MeshBasicMaterial({transparent:true,opacity:.85,depthWrite:false});
  const mesh=new T.InstancedMesh(geometry,material,capacity);mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(mesh);
  const dummy=new T.Object3D(),color=new T.Color(),ringGeometry=new T.RingGeometry(.84,1,40),diskGeometry=new T.CircleGeometry(1,40);
  let cursor=0,ringCursor=0,seed=937;
  function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<12;i++){
   const ring=new T.Mesh(ringGeometry,new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));
   ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);rings.push({mesh:ring,life:0,radius:1});
  }
  function burst(x,z,tint,count=8){
   if(reduced)count=Math.min(count,3);
   for(let i=0;i<count;i++){
    const index=cursor++%capacity,p=particles[index],angle=random()*Math.PI*2;
    Object.assign(p,{x,z,y:heightAt(x,z)+.8,vx:Math.cos(angle)*(1+random()*3),vz:Math.sin(angle)*(1+random()*3),vy:1.8+random()*2,life:.35+random()*.25,max:.6});
    mesh.setColorAt(index,color.set(tint));
   }
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  }
  function impact(x,z,tint,radius=1){
   const r=rings[ringCursor++%rings.length];r.life=.32;r.radius=radius;r.mesh.visible=true;r.mesh.position.set(x,heightAt(x,z)+.07,z);r.mesh.material.color.set(tint);
  }
  function markerFor(id){
   if(markers.has(id))return markers.get(id);
   const group=new T.Group(),outline=new T.Mesh(ringGeometry,new T.MeshBasicMaterial({transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide})),fill=new T.Mesh(diskGeometry,new T.MeshBasicMaterial({transparent:true,opacity:.2,depthWrite:false,side:T.DoubleSide}));
   outline.rotation.x=fill.rotation.x=-Math.PI/2;fill.position.y=.005;group.add(outline,fill);scene.add(group);const marker={group,outline,fill};markers.set(id,marker);return marker;
  }
  function update(dt,enemies){
   for(let i=0;i<capacity;i++){
    const p=particles[i];p.life=Math.max(0,p.life-dt);
    if(p.life>0){p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=8*dt;dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar(p.life/p.max);dummy.rotation.set(p.life*3,p.life*5,0);}
    else dummy.scale.setScalar(0);
    dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
   for(const r of rings){r.life=Math.max(0,r.life-dt);r.mesh.visible=r.life>0;r.mesh.scale.setScalar(r.radius*(1+(1-r.life/.32)*.6));r.mesh.material.opacity=r.life/.32*.5;}
   for(const e of enemies){
    const m=markerFor(e.id),s=e.combat;m.group.visible=!!e.alive&&s?.state==='windup';
    if(!m.group.visible)continue;
    const tint=s.enraged?'#ec56fa':e.boss?'#ff664f':'#ffc44f';
    m.group.position.set(s.targetX,heightAt(s.targetX,s.targetZ)+.07,s.targetZ);m.outline.scale.setScalar(s.radius);m.fill.scale.setScalar(s.radius*Math.max(.02,1-s.timer/s.windup));m.outline.material.color.set(tint);m.fill.material.color.set(tint);
   }
  }
  return {burst,impact,update,capacity};
 }};
})();
