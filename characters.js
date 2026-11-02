/* Visual v3: rendered sprite animation plus live 3D chain and shadow systems. */
(function(){
  'use strict';
  const T=THREE,M=HeroMotion;
  const metal=new T.MeshStandardMaterial({color:'#a4b0bd',roughness:.5,metalness:.5,flatShading:true,depthWrite:false});
  window.HeroModels={
    champion(){
      const root=new T.Group(),body=new T.Object3D();root.name='rendered-orange-champion';
      const paintedChampion=HeroSprites.champion(root);const chains=new T.Group();root.add(chains);let active=[],attackKick=0,attackAge=1,swingClock=0;const dummy=new T.Object3D(),chainGeo=new T.TorusGeometry(.102,.028,4,8),up=new T.Vector3(0,1,0);
      function setWeapons(ids){if(active.map(a=>a.id).join()===ids.join())return;for(const a of active){chains.remove(a.head);a.head.userData.painted?.dispose();chains.remove(a.links);chains.remove(a.trail);a.links.dispose();a.trail.geometry.dispose();a.trail.material.dispose();}active=ids.map((id,i)=>{
        const head=new T.Group();head.name="weapon-"+id;head.userData.painted=HeroSprites.weapon(id,head,root);chains.add(head);const links=new T.InstancedMesh(chainGeo,metal,22);links.castShadow=true;links.frustumCulled=false;chains.add(links);
        const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(8*6*3),3));const trail=new T.Mesh(geo,new T.MeshBasicMaterial({color:({blade:'#be64f8',bow:'#9bf54b',staff:'#ffad37',crossbow:'#69c9ff'})[id]||'#e7efff',transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide}));trail.frustumCulled=false;chains.add(trail);
        const p=M.weaponPose(0,i,ids.length,false,id);head.position.set(p.x,p.y,p.z);return {id,head,links,trail,history:[],position:head.position.clone(),index:i};
      });}
      function update(time,dt,moving,facing,combat,hit=false){
        swingClock+=dt*(combat?1.65:1);body.rotation.y=M.turnTowards(body.rotation.y,facing,dt);
        attackAge+=dt;attackKick=Math.max(0,attackKick-dt*5);if(hit){attackKick=1;attackAge=0;}paintedChampion.update(time,moving,body.rotation.y,combat,attackKick,M.attackPose(attackAge),attackAge);
        active.forEach((a,i)=>{
          const target=M.weaponPose(swingClock,i,active.length,combat,a.id);const blend=1-Math.exp(-dt*9);const desired=new T.Vector3(target.x,target.y,target.z);a.position.lerp(desired,blend);a.head.position.copy(a.position);a.head.userData.painted.update(target.phase,time,target.rotation);a.head.userData.painted.sprite.renderOrder=a.position.z>0?4:2;
          const offset=(i%2?1:-1)*.65,start=new T.Vector3(offset,4,-.15).applyAxisAngle(up,body.rotation.y);const end=a.position.clone();
          for(let j=0;j<22;j++){const t=j/21,p=M.chainPoint(start,end,t,combat?.12:.4),next=M.chainPoint(start,end,Math.min(1,t+.02),combat?.12:.4);dummy.position.set(p.x,p.y,p.z);const direction=new T.Vector3(next.x-p.x,next.y-p.y,next.z-p.z);if(direction.lengthSq()<1e-8)direction.copy(end).sub(start);dummy.quaternion.setFromUnitVectors(up,direction.normalize());dummy.rotateY(j%2?Math.PI/2:0);dummy.scale.set(.9,1.45,.9);dummy.updateMatrix();a.links.setMatrixAt(j,dummy.matrix);}a.links.instanceMatrix.needsUpdate=true;
          a.history.unshift(a.position.clone());if(a.history.length>9)a.history.pop();const array=a.trail.geometry.attributes.position.array;array.fill(0);for(let j=0;j<a.history.length-1;j++){const p=a.history[j],q=a.history[j+1],width=(1-j/8)*.16;array.set([p.x,p.y+width,p.z,p.x,p.y-width,p.z,q.x,q.y+width,q.z,p.x,p.y-width,p.z,q.x,q.y-width,q.z,q.x,q.y+width,q.z],j*18);}a.trail.geometry.attributes.position.needsUpdate=true;
        });
      }
      return {root,body,setWeapons,update,strike(){attackKick=1;attackAge=0;}};
    },
    creature(kind,boss=false){
      const root=new T.Group(),body=new T.Object3D(),torso={material:metal};
      root.name=boss?'rendered-lava-crab':kind===2?'rendered-crystal-golem':'rendered-horned-imp';
      const painted=HeroSprites.creature(root,kind,boss);
      function update(time,dt,moving,angle,hurt,dying,attacking=false,statuses={}){
        body.rotation.y=M.turnTowards(body.rotation.y,angle,dt);
        painted.update(time,moving,angle,hurt,dying,attacking,statuses);
        if(dying>0)root.scale.setScalar(Math.max(.05,dying/.3));else root.scale.setScalar(1);
      }
      return {root,body,torso,update};
    }
  };
})();
