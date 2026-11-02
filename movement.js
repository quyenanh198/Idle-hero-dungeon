(function(root){
 'use strict';
 function move(position,dx,dz,colliders,radius=.6){
  const p={x:position.x,z:position.z},steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.2));
  for(let n=0;n<steps;n++){
   p.x+=dx/steps;p.z+=dz/steps;
   for(let pass=0;pass<3;pass++)for(const c of colliders){
    let x=p.x-c.x,z=p.z-c.z,d=Math.hypot(x,z);const min=radius+c.radius;
    if(d>=min)continue;if(d<1e-8){x=1;z=0;d=1;}
    p.x=c.x+x/d*(min+.0001);p.z=c.z+z/d*(min+.0001);
   }
   p.x=Math.max(-20.5,Math.min(20.5,p.x));p.z=Math.max(-27,Math.min(21,p.z));
  }
  return p;
 }
 function steer(position,target,colliders,radius=.6){
  const dx=target.x-position.x,dz=target.z-position.z,length=Math.hypot(dx,dz);
  if(length<1e-8)return {x:0,z:0};
  const unit={x:dx/length,z:dz/length};let nearest=null,near=Infinity;
  for(const c of colliders){
   const x=c.x-position.x,z=c.z-position.z,along=x*unit.x+z*unit.z,across=Math.abs(x*unit.z-z*unit.x),clearance=c.radius+radius+.15;
   if(along>0&&along<Math.min(length,3)+clearance&&across<clearance&&along<near){near=along;nearest=c;}
  }
  if(!nearest)return unit;
  const x=nearest.x-position.x,z=nearest.z-position.z,d=Math.hypot(x,z),side=dx*z-dz*x>1e-6?-1:1;
  const angle=Math.atan2(z,x)+side*(Math.asin(Math.min(.99,(nearest.radius+radius+.25)/Math.max(.001,d)))+.12);
  return {x:Math.cos(angle),z:Math.sin(angle)};
 }
 const api={move,steer};if(typeof module!=='undefined')module.exports=api;else root.HeroMovement=api;
})(typeof window!=='undefined'?window:globalThis);
