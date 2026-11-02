(function(root){
 'use strict';
 const COOLDOWN=8,RANGE=7,durations={outbound:.22,reel:.55,consume:.2};
 function create(){return {phase:'idle',age:0,cooldown:0,target:null,fromX:0,fromZ:0,tip:{x:0,z:0}};}
 function eligible(hero,e){return e.alive&&!e.captured&&e.hp>0&&(!e.boss||e.hp<=e.max*.2)&&Math.hypot(e.x-hero.x,e.z-hero.z)<=RANGE;}
 function start(s,hero,enemies){
  if(s.phase!=='idle'||s.cooldown>1e-9)return false;
  const target=enemies.filter(e=>eligible(hero,e)).sort((a,b)=>Math.hypot(a.x-hero.x,a.z-hero.z)-Math.hypot(b.x-hero.x,b.z-hero.z)||a.id-b.id)[0];
  if(!target)return false;
  target.captured=true;target.captureScale=1;s.target=target.id;s.phase='outbound';s.age=0;s.cooldown=COOLDOWN;s.fromX=target.x;s.fromZ=target.z;s.tip={x:hero.x,z:hero.z};return true;
 }
 function cancel(s,enemies){const e=enemies.find(e=>e.id===s.target);if(e){e.captured=false;e.captureScale=1;e.captureLift=0;}s.phase='idle';s.age=0;s.target=null;}
 function step(s,elapsed,hero,enemies){
  const events=[];if(!(elapsed>0))return events;
  let left=Math.min(elapsed,.25);s.cooldown=Math.max(0,s.cooldown-left);
  if(s.phase==='idle')return events;
  const e=enemies.find(e=>e.id===s.target);
  if(!e?.alive){cancel(s,enemies);return events;}
  while(left>1e-9&&s.phase!=='idle'){
   const duration=durations[s.phase],advance=Math.min(left,duration-s.age);s.age+=advance;left-=advance;
   const t=Math.min(1,s.age/duration),ease=t*t*(3-2*t);
   if(s.phase==='outbound')s.tip={x:hero.x+(e.x-hero.x)*t,z:hero.z+(e.z-hero.z)*t};
   else if(s.phase==='reel'){
    e.x=s.fromX+(hero.x-s.fromX)*ease;e.z=s.fromZ+(hero.z-s.fromZ)*ease;e.captureScale=1-t*.4;e.captureLift=Math.sin(t*Math.PI)*.5;s.tip={x:e.x,z:e.z};
   }else{e.x=hero.x;e.z=hero.z;e.captureScale=.6*(1-t);e.captureLift=.3;s.tip={x:hero.x,z:hero.z};}
   if(s.age+1e-9>=duration){
    if(s.phase==='outbound'){s.phase='reel';s.age=0;}
    else if(s.phase==='reel'){s.phase='consume';s.age=0;}
    else{e.hp=0;e.alive=false;e.captured=false;e.captureScale=0;events.push({type:'consume',id:e.id,boss:!!e.boss,kind:e.kind||0});s.phase='idle';s.target=null;s.age=0;}
   }
  }
  return events;
 }
 const api={COOLDOWN,RANGE,create,start,step,cancel,eligible};if(typeof module!=='undefined')module.exports=api;else root.HeroHook=api;
})(typeof window!=='undefined'?window:globalThis);
