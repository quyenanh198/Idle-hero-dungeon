/* Pre-rendered character art with live 3D chains, shadows and combat motion. */
(function(){
  'use strict';
  const T=THREE,S=SpriteMotion,shared={};
  function texture(name){if(shared[name])return shared[name];const spec=HeroArt[name],map=new T.Texture();map.colorSpace=T.SRGBColorSpace;map.magFilter=T.LinearFilter;map.minFilter=T.LinearFilter;map.generateMipmaps=false;const image=new Image();map.image=image;image.onload=()=>{map.needsUpdate=true;map.userData.ready=true;};image.src=spec.data;shared[name]=map;return map;}
  function atlas(name,column,row){const spec=HeroArt[name],map=texture(name).clone();map.image=texture(name).image;const rect=S.uv(column,row,spec.columns,spec.rows);map.repeat.set(rect.w,rect.h);map.offset.set(rect.x,rect.y);map.colorSpace=T.SRGBColorSpace;map.minFilter=map.magFilter=T.LinearFilter;map.generateMipmaps=false;map.needsUpdate=true;return map;}
  function softShadow(parent,width,depth,opacity=.3){
    if(!shared.shadow){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d'),g=c.createRadialGradient(32,32,4,32,32,31);g.addColorStop(0,'rgba(10,21,23,.75)');g.addColorStop(.5,'rgba(10,21,23,.4)');g.addColorStop(1,'rgba(10,21,23,0)');c.fillStyle=g;c.fillRect(0,0,64,64);shared.shadow=new T.CanvasTexture(canvas);}
    const m=new T.Mesh(new T.PlaneGeometry(width,depth),new T.MeshBasicMaterial({map:shared.shadow,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.x=-Math.PI/2;m.position.y=.025;parent.add(m);return m;
  }
  window.HeroSprites={
    ready(){return Promise.all(['champion','championAttack','weapons','enemies','environment'].map(name=>{const map=texture(name);return map.image.decode().then(()=>{map.needsUpdate=true;map.userData.ready=true;});}));},
    prop(kind,parent,scale=1){
      const spec=WorldEnvironment.CATALOG[kind],art=HeroArt.environment,frame=art.frames[kind];
      const map=texture('environment').clone(),rect=WorldEnvironment.frameUv(kind,art);
      map.repeat.set(rect.w,rect.h);map.offset.set(rect.x,rect.y);map.minFilter=map.magFilter=T.LinearFilter;map.generateMipmaps=false;map.needsUpdate=true;
      const material=new T.SpriteMaterial({map,transparent:true,alphaTest:.09,depthWrite:true,depthTest:true,toneMapped:false});
      const sprite=new T.Sprite(material),height=spec.height*scale,width=height*frame.w/frame.h;
      sprite.name='rendered-prop-'+kind;sprite.center.set(frame.pivot[0],frame.pivot[1]);sprite.position.y=.035;sprite.scale.set(width,height,1);parent.add(sprite);
      const shadow=softShadow(parent,spec.shadow[0]*scale,spec.shadow[1]*scale,.42);shadow.position.x=.12*scale;shadow.position.z=.07*scale;
      let ready=false,opacity=1;
      function update(time,dt,targetOpacity=1){
        if(!ready&&texture('environment').userData.ready){ready=true;map.needsUpdate=true;}sprite.visible=shadow.visible=ready;
        const pose=WorldEnvironment.motion(kind,time,parent.position.x+parent.position.z*.7);
        material.rotation=pose.rotation;sprite.scale.set(width*pose.scale,height*pose.scale,1);material.color.setScalar(pose.glow);
        opacity+=(targetOpacity-opacity)*(1-Math.exp(-dt*6));material.opacity=opacity;material.depthWrite=opacity>.95;
      }
      function dispose(){parent.remove(sprite,shadow);map.dispose();material.dispose();shadow.geometry.dispose();shadow.material.dispose();}
      return {sprite,shadow,update,dispose};
    },
    champion(parent){
      const map=atlas('champion',0,0),attackMap=atlas('championAttack',0,0),mat=new T.SpriteMaterial({map,transparent:true,alphaTest:.06,depthWrite:true,depthTest:true,toneMapped:false});const sprite=new T.Sprite(mat);sprite.name='painted-champion';sprite.renderOrder=3;sprite.center.set(.5,0);sprite.position.y=.08;const spec=HeroArt.champion,aspect=(spec.width/spec.columns)/(spec.height/spec.rows);sprite.scale.set(5.1*aspect,5.1,1);parent.add(sprite);const shadow=softShadow(parent,3.65,2.55,.68);let column=-1,row=-1,lastFrame=-1;
      function update(time,moving,facing,combat,kick=0,pose={lean:0,compression:0,lift:0},attackAge=1){
        const ready=texture('champion').userData.ready;if(ready&&lastFrame<0){map.needsUpdate=true;lastFrame=0;}sprite.visible=!!ready;shadow.visible=!!ready;
        const attackRow=S.attackRow(attackAge),attacking=attackRow>=0&&texture('championAttack').userData.ready;const activeMap=attacking?attackMap:map;const source=attacking?HeroArt.championAttack:spec;const nextColumn=S.direction8(facing),nextRow=attacking?attackRow:S.walkRow(time,moving);const frame=source.frames[nextRow*8+nextColumn],pixelScale=5.1/(source.height/4);if(mat.map!==activeMap){mat.map=activeMap;mat.needsUpdate=true;activeMap.needsUpdate=true;column=row=-1;}if(nextColumn!==column||nextRow!==row){column=nextColumn;row=nextRow;const rect=S.frameUv(frame,source.width,source.height);activeMap.repeat.set(rect.w,rect.h);activeMap.offset.set(rect.x,rect.y);}
        const bob=moving?Math.abs(Math.sin(time*10.5))*.035:Math.sin(time*2.7)*.025;sprite.position.y=.08+bob+pose.lift;sprite.material.rotation=(moving?Math.sin(time*10.5)*.012:Math.sin(time*1.9)*.006)+pose.lean;sprite.material.color.setScalar(1+kick*.12);sprite.scale.set(frame.w*pixelScale*(1+pose.compression*.5),frame.h*pixelScale*(1-pose.compression),1);shadow.scale.set(1-bob*.7,1-bob*.7,1);
        return !!ready;
      }
      return {sprite,shadow,update};
    },
    weapon(id,parent,shadowParent){
      const index={axe:0,blade:1,bow:2,hammer:3,staff:4,crossbow:5}[id];const map=atlas('weapons',index%3,Math.floor(index/3));const mat=new T.SpriteMaterial({map,transparent:true,alphaTest:.07,depthWrite:true,depthTest:true,toneMapped:false});const sprite=new T.Sprite(mat);sprite.center.set(...HeroArt.weapons.anchors[index]);sprite.scale.set(2.55,2.55,1);sprite.name='painted-weapon-'+id;parent.add(sprite);let ready=false;
      const anchor=HeroArt.weapons.anchors[index],geometry=new T.PlaneGeometry(2.55,2.55);geometry.translate((.5-anchor[0])*2.55,(.5-anchor[1])*2.55,0);const shadow=new T.Mesh(geometry,new T.MeshBasicMaterial({map,color:'#182b26',transparent:true,opacity:.2,alphaTest:.04,depthWrite:false}));shadowParent.add(shadow);
      return {sprite,update(phase,time,rotation){if(!ready&&texture('weapons').userData.ready){ready=true;map.needsUpdate=true;}sprite.visible=shadow.visible=ready;mat.rotation=rotation===undefined?-phase+.35:rotation;shadow.position.set(parent.position.x+parent.position.y*.22,.035,parent.position.z-parent.position.y*.2);shadow.rotation.set(-Math.PI/2,0,mat.rotation);return ready;},dispose(){shadowParent.remove(shadow);geometry.dispose();shadow.material.dispose();map.dispose();mat.dispose();}};
    },
    creature(parent,kind,boss){
      const species=boss?2:kind===2?1:0,map=atlas('enemies',0,species),mat=new T.SpriteMaterial({map,transparent:true,alphaTest:.09,depthWrite:true,toneMapped:false}),sprite=new T.Sprite(mat);sprite.name='painted-enemy-'+species;sprite.center.set(.5,.07);const size=boss?3.7:kind===2?2.6:2.1;sprite.scale.set(size,size,1);sprite.position.y=.06;parent.add(sprite);const shadow=softShadow(parent,boss?3.6:1.45,boss?2.3:1.1,boss?.55:.4);let ready=false;
      function update(time,moving,facing,hurt,dying,attacking=false,statuses={}){if(!ready&&texture('enemies').userData.ready){ready=true;map.needsUpdate=true;}sprite.visible=shadow.visible=ready;const winding=attacking==='windup',col=winding?3:moving?[1,0,2,0][Math.floor(time*7)%4]:0;const rect=S.uv(col,species,4,3);const left=Math.sin(facing)<0;map.repeat.set(left?rect.w:-rect.w,rect.h);map.offset.set(left?rect.x:rect.x+rect.w,rect.y);sprite.position.y=.06+(moving?Math.abs(Math.sin(time*11))*.025:Math.sin(time*2.3)*.012);sprite.position.x=hurt>0?Math.sin(hurt*45)*.07:0;mat.rotation=hurt>0?Math.sin(hurt*45)*.08:winding?Math.sin(facing)*-.08:0;mat.color.setRGB(1+Math.max(0,hurt)*4,1+Math.max(0,hurt)*4,1+Math.max(0,hurt)*4);if(hurt<=0){if(statuses.frost)mat.color.set('#a9dbff');else if(statuses.burn)mat.color.set('#ffc38c');else if(statuses.poison)mat.color.set('#d8a4ff');}return ready;}
      return {sprite,update};
    }
  };
})();
