(function(root){
  'use strict';
  const CATALOG={
    pine:{height:4,shadow:[2.6,1.8],radius:.45,foliage:true},
    oak:{height:3.6,shadow:[2.8,1.9],radius:.6,foliage:true},
    snowpine:{height:4.1,shadow:[2.6,1.8],radius:.45,foliage:true},
    cottage:{height:4,shadow:[3.7,2.6],radius:1.5},
    mossrock:{height:1.7,shadow:[2.4,1.6],radius:.9},
    snowrock:{height:1.8,shadow:[2.4,1.6],radius:.9},
    barrel:{height:1.35,shadow:[1.05,.75],radius:.45},
    crates:{height:1.8,shadow:[1.45,1.1],radius:.7},
    stall:{height:3.7,shadow:[3.6,2.5],radius:1.5},
    wagon:{height:3.1,shadow:[3.5,2.1],radius:1.4},
    portal:{height:4.7,shadow:[4.2,2.8],radius:1.6,glowing:true},
    crystals:{height:2.3,shadow:[1.9,1.3],radius:.65,glowing:true},
    chest:{height:1.6,shadow:[1.6,1],radius:.55},
    totem:{height:2.1,shadow:[1.3,.9],radius:.5,glowing:true},
    stump:{height:.85,shadow:[1.3,.9],radius:.35},
    fence:{height:1.6,shadow:[2.5,.8],radius:1.25}
  };
  function frameUv(name,art){
    const frame=art.frames[name];
    if(!CATALOG[name]||!frame)throw new Error('Unknown prop: '+name);
    return {x:(frame.x+.5)/art.width,y:1-(frame.y+frame.h-.5)/art.height,
      w:(frame.w-1)/art.width,h:(frame.h-1)/art.height};
  }
  function motion(name,time,seed=0){
    const spec=CATALOG[name];
    return {rotation:spec.foliage?Math.sin(time*.9+seed)*.012:0,
      scale:spec.glowing?1+Math.sin(time*1.7+seed)*.009:1,
      glow:spec.glowing?1+Math.sin(time*2.1+seed)*.055:1};
  }
  function opacityFor(prop,hero){
    if(!hero||!CATALOG[prop.kind].foliage)return 1;
    const dz=prop.z-hero.z;
    return dz>0&&dz<5*prop.scale&&Math.abs(prop.x-hero.x)<1.35*prop.scale?.42:1;
  }
  function create(scene,heightAt){
    const objects=[];
    function add(kind,x,z,scale=1){
      const spec=CATALOG[kind];if(!spec)throw new Error('Unknown prop: '+kind);
      const anchor=new THREE.Group();anchor.position.set(x,heightAt(x,z),z);anchor.name='environment-'+kind;
      scene.add(anchor);
      const art=HeroSprites.prop(kind,anchor,scale);
      const prop={id:kind+'-'+objects.length,kind,x,z,scale,root:anchor,art,radius:spec.radius*scale};
      objects.push(prop);return prop;
    }
    function update(time,dt,hero){for(const prop of objects)prop.art.update(time,dt,opacityFor(prop,hero));}
    return {add,update,objects,getColliders:()=>objects.map(p=>({id:p.id,x:p.x,z:p.z,radius:p.radius,kind:p.kind}))};
  }
  const api={CATALOG,frameUv,motion,opacityFor,create};
  if(typeof module!=='undefined')module.exports=api;else root.WorldEnvironment=api;
})(typeof window!=='undefined'?window:globalThis);
