/* Deterministic fixed-step combat. Rendering and rewards consume emitted events. */
(function(root){
 'use strict';
 const DT=1/60;
 const PROFILES={
  axe:{cooldown:.72,effect:'cleave',color:'#fff0b5',direct:1},
  blade:{cooldown:.9,effect:'poison',color:'#c575ff',direct:.7},
  bow:{cooldown:.62,effect:'fracture',color:'#a6f45c',direct:1},
  hammer:{cooldown:1.15,effect:'stun',color:'#d7e8ec',direct:1},
  staff:{cooldown:1.3,effect:'burn',color:'#ff9b39',direct:.75},
  crossbow:{cooldown:.95,effect:'slow',color:'#69d9ff',direct:1}
 };
 function create(seed=173){return {seed:seed>>>0,time:0,remainder:0,cooldowns:{},down:false};}
 function random(sim){sim.seed=(Math.imul(sim.seed,1664525)+1013904223)>>>0;return sim.seed/4294967296;}
 function state(e){return e.combat||(e.combat={state:'approach',timer:0,windup:0,radius:1.2,targetX:e.x,targetZ:e.z,attacks:0,enraged:false,statuses:{}});}
 function resetEnemy(e,x=e.x,z=e.z){e.x=x;e.z=z;e.hp=e.max;e.alive=true;e.captured=false;e.captureScale=1;delete e.combat;state(e);}
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function step(sim,elapsed,hero,enemies,weapons){
  const events=[];
  if(!(elapsed>0)||sim.down)return events;
  sim.remainder+=Math.min(elapsed,.25);
  function damage(e,value,weapon,critical=false,dot=false){
   if(!e.alive||e.captured||!(value>0))return;
   const vulnerability=state(e).statuses.fracture?.remaining>0?1.15:1;
   const amount=Math.max(1,Math.round(value*vulnerability));e.hp=Math.max(0,e.hp-amount);
   events.push({type:'damage',id:e.id,weapon,amount,critical,dot,x:e.x,z:e.z});
   if(e.hp<=0){e.alive=false;events.push({type:'death',id:e.id,x:e.x,z:e.z});}
  }
  function status(e,name,duration,dps=0){
   const s=state(e);
   if(dps>0){
    const layers=s.statuses[name]?.layers||[];
    layers.push({remaining:duration,dps,clock:0});
    s.statuses[name]={remaining:duration,layers};
   }else s.statuses[name]={remaining:duration};
   if(name==='stun'&&s.state==='windup'){s.state='recovery';s.timer=.6;}
   events.push({type:'status',id:e.id,status:name,x:e.x,z:e.z});
  }
  while(sim.remainder+1e-9>=DT&&!sim.down){
   sim.remainder=Math.max(0,sim.remainder-DT);sim.time+=DT;
   for(const e of enemies){
    if(!e.alive||e.captured)continue;
    const s=state(e);
    for(const [name,v] of Object.entries(s.statuses)){
     if(v.layers){
      for(const layer of v.layers){
       layer.remaining-=DT;layer.clock+=DT;
       if(layer.clock+1e-9>=.5){layer.clock-=.5;damage(e,layer.dps*.5,name==='poison'?'blade':'staff',false,true);}
      }
      v.layers=v.layers.filter(layer=>layer.remaining>1e-9);
      v.remaining=Math.max(0,...v.layers.map(layer=>layer.remaining));
     }else v.remaining-=DT;
     if(v.remaining<=1e-9)delete s.statuses[name];
    }
   }
   const equipped=new Set(weapons.map(w=>w.id));
   for(const id of Object.keys(sim.cooldowns))if(!equipped.has(id))delete sim.cooldowns[id];
   for(const weapon of weapons){
    const p=PROFILES[weapon.id];if(!p||!(weapon.dps>0))continue;
    sim.cooldowns[weapon.id]=Math.max(0,(sim.cooldowns[weapon.id]||0)-DT);
    if(sim.cooldowns[weapon.id]>1e-9)continue;
    const targets=enemies.filter(e=>e.alive&&!e.captured&&distance(hero,e)<=hero.range).sort((a,b)=>distance(hero,a)-distance(hero,b)||a.id-b.id);
    if(!targets.length)continue;
    sim.cooldowns[weapon.id]=p.cooldown;
    events.push({type:'weapon',weapon:weapon.id,effect:p.effect,x:targets[0].x,z:targets[0].z});
    const critical=random(sim)<.12,budget=weapon.dps*p.cooldown;
    const selected=weapon.id==='axe'||weapon.id==='staff'?targets.filter(e=>distance(e,targets[0])<2.8):weapon.id==='bow'?targets.slice(0,2):targets.slice(0,1);
    selected.forEach((e,i)=>{
     damage(e,budget*p.direct*(critical?1.75:1)*(i&&weapon.id==='bow'?.55:1),weapon.id,critical);
     if(!e.alive)return;
     if(weapon.id==='blade')status(e,'poison',3,budget*.3/3);
     if(weapon.id==='staff')status(e,'burn',2.5,budget*.25/2.5);
     if(weapon.id==='bow')status(e,'fracture',2);
     if(weapon.id==='crossbow')status(e,'frost',2);
     if(weapon.id==='hammer'&&!e.boss)status(e,'stun',.45);
    });
   }
   for(const e of enemies){
    if(!e.alive||e.captured)continue;
    const s=state(e),d=distance(hero,e);s.enraged=!!e.boss&&e.hp<=e.max*.4;
    if(s.statuses.stun)continue;
    if(s.state==='approach'){
     if(s.timer>0){s.timer-=DT;continue;}
     if(d>2.15&&d<9){const speed=(e.boss?1.3:1.15)*(s.enraged?1.35:1)*(s.statuses.frost?.6:1);e.x+=(hero.x-e.x)/d*speed*DT;e.z+=(hero.z-e.z)/d*speed*DT;}
     if(d<=2.3){s.state='windup';s.windup=(e.boss?1.05:e.kind===2?.8:.55)*(s.enraged?.75:1);s.timer=s.windup;s.radius=e.boss?(s.attacks%3===2?4:3.2):1.2;s.targetX=e.boss?e.x:hero.x;s.targetZ=e.boss?e.z:hero.z;events.push({type:'telegraph',id:e.id,x:s.targetX,z:s.targetZ,radius:s.radius,duration:s.windup,boss:!!e.boss});}
    }else if(s.state==='windup'){
     s.timer-=DT;
     if(s.timer<=1e-9){
      const amount=(e.boss?55:9+(e.kind||0)*4)*(s.enraged?1.35:1);
      const hit=Math.hypot(hero.x-s.targetX,hero.z-s.targetZ)<=s.radius;
      events.push({type:'strike',id:e.id,x:s.targetX,z:s.targetZ,radius:s.radius,hit,boss:!!e.boss});
      if(hit){hero.hp=Math.max(0,hero.hp-Math.round(amount));events.push({type:'heroHit',id:e.id,amount:Math.round(amount),x:hero.x,z:hero.z});}
      s.state='recovery';s.timer=e.boss?1.45:.85;s.attacks++;
     }
    }else if(s.state==='recovery'){s.timer-=DT;if(s.timer<=1e-9)s.state='approach';}
   }
   if(hero.hp<=0){hero.hp=0;sim.down=true;events.push({type:'defeat'});}
   else hero.hp=Math.min(hero.maxHp,hero.hp+(hero.regen||0)*DT);
  }
  return events;
 }
 const api={PROFILES,create,step,resetEnemy};if(typeof module!=='undefined')module.exports=api;else root.HeroCombat=api;
})(typeof window!=='undefined'?window:globalThis);
