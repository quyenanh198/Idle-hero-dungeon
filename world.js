/* Locally rendered low-poly world. No downloaded models or textures. */
(function(){
  'use strict';
  window.createWorld=function(canvas,cb){
    const T=THREE,scene=new T.Scene();scene.background=new T.Color('#3e7c39');scene.fog=new T.Fog('#52814b',70,110);
    const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor('#3e7c39');renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
    const camera=new T.OrthographicCamera(-20,20,15,-15,.1,160);const focus=new T.Vector3();let renderOnce=true,hudOnce=true;function invalidate(){renderOnce=true;hudOnce=true;}let zoom=1,paused=false,auto=true,time=0,attackTime=0,hitTime=0,lastManual=-10,hp=400,settings={damage:60,hp:400,regen:4.5,speed:4,range:3};
    const hemi=new T.HemisphereLight(0xe1edff,0x566447,1.7);scene.add(hemi);
    const sun=new T.DirectionalLight(0xfff1d8,2.2);sun.position.set(-16,32,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-33,right:33,top:33,bottom:-33,near:1,far:95});sun.shadow.bias=-.0007;sun.shadow.normalBias=.03;scene.add(sun);
    const mats={};function mat(c){return mats[c]||(mats[c]=new T.MeshStandardMaterial({color:c,roughness:1,flatShading:true}));}
    function mesh(geo,c,x=0,y=0,z=0,parent=scene){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
    function box(w,h,d,c,x,y,z,p){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p);}
    function cone(r,h,c,x,y,z,p,n=5){return mesh(new T.ConeGeometry(r,h,n),c,x,y,z,p);}
    function ball(r,c,x,y,z,p,detail=0){return mesh(new T.IcosahedronGeometry(r,detail),c,x,y,z,p);}
    let seed=29871;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
    box(100,1,120,'#45663d',0,-.7,-15);const ground=box(85,.18,100,'#3d8136',0,-.11,-8);
    const surface=document.createElement('canvas');surface.width=surface.height=256;const paint=surface.getContext('2d');paint.fillStyle='#33773d';paint.fillRect(0,0,256,256);for(let i=0;i<350;i++){paint.globalAlpha=.008+rand()*.012;paint.fillStyle=i%2?'#397d40':'#2e6d36';paint.beginPath();paint.ellipse(rand()*256,rand()*256,2+rand()*9,2+rand()*7,rand()*6.28,0,Math.PI*2);paint.fill();}paint.globalAlpha=1;const groundTexture=new T.CanvasTexture(surface);groundTexture.colorSpace=T.SRGBColorSpace;groundTexture.wrapS=groundTexture.wrapT=T.RepeatWrapping;groundTexture.repeat.set(9,10);ground.material=new T.MeshStandardMaterial({map:groundTexture,roughness:1});
    const snowEdge=x=>-10.5+Math.sin(x*.19)*1.3+Math.sin(x*.43)*.4;
    const environment=WorldEnvironment.create(scene,(x,z)=>z<snowEdge(x)?.59:.05);
    const snowShape=new T.Shape();snowShape.moveTo(-43,58);snowShape.lineTo(43,58);for(let x=43;x>=-43;x-=1)snowShape.lineTo(x,-snowEdge(x));snowShape.closePath();const snowGeo=new T.ShapeGeometry(snowShape);snowGeo.rotateX(-Math.PI/2);const snowTop=mesh(snowGeo,'#a6d0ed',0,.57,0);snowTop.castShadow=false;
    for(let x=-43;x<43;x+=1.8){const z=snowEdge(x),rock=mesh(new T.DodecahedronGeometry(1.2,0),'#7697b1',x,.02,z+.18);rock.scale.set(1,.48,.65);const cap=mesh(new T.CircleGeometry(1.16,7),'#c4dff1',x,.575,z-.18);cap.rotation.x=-Math.PI/2;cap.rotation.z=x;cap.castShadow=false;}
    // Dense staggered cobbles follow the lane instead of scattered angular rocks.
    box(85,.08,3.4,'#736d49',0,.01,11.2);
    const cobbles=new T.InstancedMesh(new T.CylinderGeometry(.48,.5,.12,7),new T.MeshStandardMaterial({color:'#ffffff',roughness:1,flatShading:true}),530);cobbles.receiveShadow=true;scene.add(cobbles);const stoneDummy=new T.Object3D();let stoneIndex=0;
    for(let row=0;row<5;row++)for(let col=0;col<106;col++){stoneDummy.position.set(-42+col*.8+(row%2)*.4,.09,9.9+row*.64);stoneDummy.rotation.set(0,rand()*.5,0);stoneDummy.scale.set(.88+rand()*.12,1,.75+rand()*.14);stoneDummy.updateMatrix();cobbles.setMatrixAt(stoneIndex,stoneDummy.matrix);cobbles.setColorAt(stoneIndex++,new T.Color(['#96805b','#a48b63','#8d7a53','#aa916a'][Math.floor(rand()*4)]));}
    // Grass tufts are instanced; the dense ground cover is important to the reference.
    const grassGeo=new T.BufferGeometry();grassGeo.setAttribute('position',new T.Float32BufferAttribute([-.15,0,0,.02,.55,0,.08,0,.04,-.02,0,-.1,-.25,.35,-.08,.06,0,.12,.02,0,-.07,.3,.42,.09,.13,0,.1],3));grassGeo.computeVertexNormals();
    const grass=new T.InstancedMesh(grassGeo,new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide}),2100);grass.castShadow=false;grass.receiveShadow=true;scene.add(grass);const dummy=new T.Object3D();
    for(let i=0;i<2100;i++){const x=rand()*82-41,z=rand()*63-10.5;dummy.position.set(x,.02,z);dummy.rotation.set(0,rand()*6.28,0);dummy.scale.setScalar(Math.abs(z-11.2)<1.8?.03:.6+rand()*.6);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);grass.setColorAt(i,new T.Color(['#73a839','#609d31','#4e902e','#80ae3a'][i%4]));}
    const star=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.025:.12;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?star.lineTo(x,y):star.moveTo(x,y);}star.closePath();const starGeo=new T.ShapeGeometry(star);starGeo.rotateX(-Math.PI/2);const flowers=new T.InstancedMesh(starGeo,new T.MeshBasicMaterial({color:'#f4e8ad',side:T.DoubleSide}),110);scene.add(flowers);
    for(let i=0;i<110;i++){const x=rand()*65-32.5,z=rand()*68-24;dummy.position.set(x,z<-11?.57:.04,z);dummy.rotation.set(0,rand()*6.28,0);dummy.scale.setScalar(.7+rand()*.6);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);flowers.setColorAt(i,new T.Color(z<-11?'#f6fcff':['#f6e291','#f6d9ed','#e0ead4'][i%3]));}
    function tree(x,z,scale=1,snow=false){return environment.add(snow?'snowpine':Math.sin(x+z)>0?'pine':'oak',x,z,scale);}
    const trees=[[-3,-11.5],[0,-12.2],[5,-14],[-9,2],[-12,4],[-11,0],[-15,-2],[8,-5],[10,-4],[12,-6],[-7,-10],[-12,-12],[-10,-14],[-15,-17],[10,-23],[12,-25],[16,-22],[17,3],[19,1],[-16,16],[-19,18],[15,17],[18,16],[-6,20],[8,22]];
    trees.forEach(([x,z],i)=>tree(x,z,.65+(i%4)*.18,z<-11));
    for(let i=0;i<32;i++){const x=rand()*76-38,z=rand()*88-48;if(Math.abs(x)<19&&z>-26&&z<24)continue;tree(x,z,.7+rand()*.6,z<-11);}
    function rock(x,z,scale=1){return environment.add(z<-11?'snowrock':'mossrock',x,z,scale);}
    for(const [x,z,scale]of [[-11,-6,2],[10,-9,1.8],[-18,4,1.5],[16,4,1.2],[-9,-23,2.1],[13,-26,1.7],[-7,17,1.8],[12,20,1.6]])rock(x,z,scale);
    environment.add('cottage',-12,-18,1);environment.add('cottage',14,18,1.05);
    environment.add('stall',5,7,1.15);environment.add('barrel',2,8,1);environment.add('barrel',8,7,1);
    for(const x of [-2,-.1,1.8])environment.add('crates',x,8.4,.85);
    environment.add('fence',-2,9.4,1.6);environment.add('wagon',-13,-6,1.05);
    environment.add('crystals',-14,-22,1.4);environment.add('crystals',-11,-24,1);
    environment.add('portal',14,-18,1.2);environment.add('chest',9,6,.9);
    environment.add('totem',-8,-15,.9);environment.add('stump',-10,6,.85);
    const campData=[{x:-5,z:1,name:'Slime meadow',kind:0},{x:6,z:0,name:'Goblin grove',kind:1},{x:-8,z:-18,name:'Frost hollow',kind:2},{x:14,z:-15,name:'Boss dungeon',kind:3}];
    const camps=campData.map((c,i)=>{const ring=mesh(new T.TorusGeometry(1.4,.14,6,32),'#6dff9c',c.x,.3,c.z);ring.rotation.x=-Math.PI/2;const outer=mesh(new T.RingGeometry(1.65,1.78,32),'#d0ffba',c.x,.23,c.z);outer.rotation.x=-Math.PI/2;outer.castShadow=false;ring.visible=false;outer.visible=false;return {...c,ring,index:i};});
    const heroModel=HeroModels.champion(),hero=heroModel.root,body=heroModel.body;scene.add(hero);hero.position.set(0,.05,3);let facing=Math.PI;
    function weapons(ids){heroModel.setWeapons(ids);invalidate();}
    const enemies=[],effects=[],floats=[],loot=[];const hitMaterial=new T.MeshStandardMaterial({color:'#ffffff',roughness:1,flatShading:true});
    function spawn(camp,boss=false){const a=rand()*Math.PI*2,r=boss?0:2+rand()*2.3;const model=HeroModels.creature(camp.kind,boss),g=model.root,torso=model.torso;g.position.set(camp.x+Math.cos(a)*r,.05,camp.z+Math.sin(a)*r);scene.add(g);const max=boss?2400:180+camp.kind*140;const e={g,model,torso,original:torso.material,hp:max,max,camp,boss,phase:rand()*6.28,flash:0,alive:true,respawn:0,dying:0};enemies.push(e);return e;}
    camps.forEach((c,i)=>{for(let j=0;j<(i===3?1:5);j++)spawn(c,i===3);});
    const tmpV=new T.Vector3();function project(x,y,z){tmpV.set(x,y,z).project(camera);return {x:(tmpV.x*.5+.5)*canvas.clientWidth,y:(-tmpV.y*.5+.5)*canvas.clientHeight,visible:tmpV.z<1&&Math.abs(tmpV.x)<1.1&&Math.abs(tmpV.y)<1.1};}
    function pop(text,x,y,z,color='#fff9b0'){floats.push({text,x,y,z,color,life:1.3,max:1.3});}
    function particles(x,z,color,n=8){for(let i=0;i<n;i++){const m=ball(.09+rand()*.08,color,x,.7,z);m.castShadow=false;effects.push({m,vx:(rand()-.5)*4,vy:2+rand()*3,vz:(rand()-.5)*4,life:.6});}}
    function collect(e){const gold=cb.kill(e.boss,e.camp.kind);pop('+'+gold+' \u25c6',e.g.position.x,2.2,e.g.position.z,'#ffe46b');particles(e.g.position.x,e.g.position.z,e.boss?'#ffdb55':'#c3ff54',12);for(let j=0;j<3;j++){const m=mesh(new T.OctahedronGeometry(.16),'#ffc944',e.g.position.x+(rand()-.5),.4,e.g.position.z+(rand()-.5));loot.push({m,life:1.5});}e.alive=false;e.dying=.3;e.respawn=e.boss?35:9;}
    let target=null,keys={},joy={x:0,y:0},manualTarget=null,now=0;
    function setKeys(e,down){if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys[k]=down;e.preventDefault();}}
    window.addEventListener('keydown',e=>setKeys(e,true));window.addEventListener('keyup',e=>setKeys(e,false));window.addEventListener('blur',()=>{keys={};joy={x:0,y:0};});
    const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0),intersection=new T.Vector3();
    canvas.addEventListener('pointerdown',e=>{if(paused)return;const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);if(ray.ray.intersectPlane(plane,intersection)){manualTarget={x:T.MathUtils.clamp(intersection.x,-20.5,20.5),z:T.MathUtils.clamp(intersection.z,-27,21)};lastManual=time;}});
    function resize(){invalidate();const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
    function tick(dt){time+=dt;const pos=hero.position;
      target=enemies.filter(e=>e.alive).sort((a,b)=>a.g.position.distanceToSquared(pos)-b.g.position.distanceToSquared(pos))[0];
      let sx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,sy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joy.y;
      let dx=sx,dz=sy;
      if(Math.abs(dx)+Math.abs(dz)>.05){manualTarget=null;lastManual=time;}else if(manualTarget){dx=manualTarget.x-pos.x;dz=manualTarget.z-pos.z;if(Math.hypot(dx,dz)<.3)manualTarget=null;}
      else if(auto&&target&&time-lastManual>2.5&&target.g.position.distanceTo(pos)>settings.range*.8){dx=target.g.position.x-pos.x;dz=target.g.position.z-pos.z;}
      const moving=Math.hypot(dx,dz)>.1;if(moving){const len=Math.hypot(dx,dz);pos.x+=dx/len*settings.speed*dt;pos.z+=dz/len*settings.speed*dt;facing=Math.atan2(dx,dz);pos.x=T.MathUtils.clamp(pos.x,-20.5,20.5);pos.z=T.MathUtils.clamp(pos.z,-27,21);}
      pos.y=pos.z<snowEdge(pos.x)?.59:.05;
      heroModel.update(time,dt,moving,facing,!!target&&target.g.position.distanceTo(pos)<settings.range);
      attackTime-=dt;hitTime-=dt;
      if(target&&attackTime<=0&&target.g.position.distanceTo(pos)<settings.range){attackTime=.55;heroModel.strike();const dmg=Math.round(settings.damage*.55*(Math.random()<.12?2:1));const victims=enemies.filter(e=>e.alive&&e.g.position.distanceTo(pos)<settings.range);victims.forEach(e=>{e.hp-=dmg;e.flash=.12;e.torso.material=hitMaterial;pop(''+dmg,e.g.position.x,1.8,e.g.position.z,dmg>settings.damage?'#ffdf49':'#fff');particles(e.g.position.x,e.g.position.z,'#f1f4cc',3);if(e.hp<=0)collect(e);});cb.hit?.();
        const arc=mesh(new T.TorusGeometry(1.8,.07,3,16,Math.PI*1.4),'#fff3ab',pos.x,1,pos.z);arc.rotation.x=Math.PI/2;effects.push({m:arc,vx:0,vy:0,vz:0,life:.15});}
      enemies.forEach(e=>{
        if(!e.alive){e.respawn-=dt;if(e.dying>0){e.dying=Math.max(0,e.dying-dt);e.model.update(time+e.phase,dt,false,0,0,e.dying);if(e.dying<=0)e.g.visible=false;}if(e.respawn<=0){e.hp=e.max;e.alive=true;e.g.visible=true;e.g.scale.setScalar(1);e.g.position.set(e.camp.x+(rand()-.5)*5,.05,e.camp.z+(rand()-.5)*5);}return;}
        e.flash-=dt;if(e.flash<=0)e.torso.material=e.original;const dist=e.g.position.distanceTo(pos),movingEnemy=dist<8&&dist>1.9;e.g.position.y=e.g.position.z<snowEdge(e.g.position.x)?.59:.05;const angle=Math.atan2(pos.x-e.g.position.x,pos.z-e.g.position.z);
        if(movingEnemy){const speed=e.boss?1.3:1.15;e.g.position.x+=(pos.x-e.g.position.x)/dist*speed*dt;e.g.position.z+=(pos.z-e.g.position.z)/dist*speed*dt;}
        e.model.update(time+e.phase,dt,movingEnemy,angle,e.flash,0,dist<2.5);
        if(dist<2.2&&hitTime<=0){hp-=e.boss?55:9+e.camp.kind*4;hitTime=.8;pop('-'+(e.boss?55:9+e.camp.kind*4),pos.x,4,pos.z,'#ff8d8d');particles(pos.x,pos.z,'#ff8579',4);}
      });
      hp=Math.min(settings.hp,hp+settings.regen*dt);if(hp<=0){pos.set(0,.25,3);hp=settings.hp;cb.revive();}
      effects.forEach(e=>{e.life-=dt;e.m.position.x+=e.vx*dt;e.m.position.y+=e.vy*dt;e.m.position.z+=e.vz*dt;e.vy-=8*dt;e.m.scale.multiplyScalar(.97);});for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0){scene.remove(effects[i].m);effects[i].m.geometry.dispose();effects.splice(i,1);}
      loot.forEach(l=>{l.life-=dt;l.m.rotation.y+=dt*4;l.m.position.lerp(pos,.025);l.m.position.y=.5+Math.sin(l.life*4)*.25;});for(let i=loot.length-1;i>=0;i--)if(loot[i].life<=0){scene.remove(loot[i].m);loot[i].m.geometry.dispose();loot.splice(i,1);}
      floats.forEach(f=>{f.life-=dt;f.y+=dt*.9;});for(let i=floats.length-1;i>=0;i--)if(floats[i].life<=0)floats.splice(i,1);
      camps.forEach(c=>c.ring.rotation.z=time*.2);environment.update(time,dt,hero.position);sun.position.x=pos.x-16;sun.position.z=pos.z+15;sun.target.position.copy(pos);sun.target.updateMatrixWorld();
    }
    let last=performance.now(),hudClock=0;function frame(stamp){requestAnimationFrame(frame);const dt=Math.min(.05,(stamp-last)/1000);last=stamp;if(!paused)tick(dt);const pos=hero.position;if(paused&&renderOnce){pos.y=pos.z<snowEdge(pos.x)?.59:.05;heroModel.update(time,0,false,facing,false);environment.update(time,0,pos);focus.copy(pos);}focus.lerp(new T.Vector3(pos.x,0,pos.z),1-Math.exp(-dt*7));const aspect=canvas.clientWidth/canvas.clientHeight,halfHeight=(aspect<.8?13.1:12.5)*zoom;camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();camera.position.set(focus.x,32,focus.z+22);camera.lookAt(focus.x,0,focus.z-1.5);if(!paused||renderOnce){renderer.render(scene,camera);renderOnce=false;}hudClock+=dt;if((hudClock>.065&&!paused)||hudOnce){hudClock=0;hudOnce=false;cb.frame({hp,maxHp:settings.hp,position:{x:pos.x,z:pos.z},hero:project(pos.x,5.2,pos.z),floats:floats.map(f=>({...f,...project(f.x,f.y,f.z)})),enemies:enemies.filter(e=>e.alive&&e.hp<e.max).map(e=>({...project(e.g.position.x,e.boss?3:2.6,e.g.position.z),ratio:e.hp/e.max})),camps:camps.map(c=>({...project(c.x,2,c.z),name:c.name,index:c.index,alive:enemies.filter(e=>e.camp===c&&e.alive).length,respawn:Math.max(0,...enemies.filter(e=>e.camp===c&&!e.alive).map(e=>e.respawn))}))});}}
    requestAnimationFrame(frame);
    return {setStats(s){const old=settings.hp;settings=s;hp=Math.min(s.hp,hp+(s.hp-old));invalidate();},setWeapons:weapons,setAuto(v){auto=v;},pause(v){if(paused!==v)invalidate();paused=v;keys={};joy={x:0,y:0};},joystick(x,y){joy={x,y};},position(p){hero.position.set(p.x,.25,p.z);focus.copy(hero.position);invalidate();},zone(i){const points=[[0,4],[-3,-19],[12,-14]];hero.position.set(points[i][0],.25,points[i][1]);manualTarget=null;lastManual=time;invalidate();},zoom(){zoom=zoom===1?.78:zoom===.78?1.25:1;invalidate();},heal(){hp=settings.hp;invalidate();},getPosition(){return {x:hero.position.x,z:hero.position.z};},getColliders(){return environment.getColliders();}};
  };
})();
