(function(root){
  'use strict';
  function turnTowards(current,target,dt){return current+Math.atan2(Math.sin(target-current),Math.cos(target-current))*(1-Math.exp(-12*dt));}
  function swingTarget(time,index,count,combat=false){
    const phase=time*1.7+index*Math.PI*2/count;
    const radius=3.25+Math.sin(time*1.8+index*1.7)*.45+(combat?.5:0);
    return {x:Math.cos(phase)*radius,y:1.7+Math.sin(phase*1.1+index)*.8,z:Math.sin(phase)*radius*.86,phase};
  }
  function chainPoint(start,end,t,slack=.4){return {x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t-Math.sin(Math.PI*t)*slack,z:start.z+(end.z-start.z)*t};}
  function gait(time,moving){const phase=time*10.5;return {step:moving?Math.sin(phase):0,bob:moving?Math.abs(Math.sin(phase))*.08:Math.sin(time*2.5)*.025,sway:moving?Math.sin(phase)*.035:Math.sin(time*1.7)*.012};}
  const arsenal={axe:[3.5,.12,.95],blade:[3.9,.27,1.08],bow:[4.15,.48,1.22],hammer:[3.25,.61,.82],staff:[3.72,.83,1.02],crossbow:[4.02,1.09,.91]};
  function weaponPose(time,index,count,combat,id){
    const [reach,offset,speed]=arsenal[id]||arsenal.axe;
    const phase=time*1.7+index*Math.PI*2/count+offset*.22+Math.sin(time*speed+offset)*.09;
    const radius=reach+Math.sin(time*2.1*speed+offset)*.15+(combat?.35:0);
    return {x:Math.cos(phase)*radius,y:1.9+Math.sin(phase*2+offset)*.38,z:Math.sin(phase)*radius*.8,phase,radius,rotation:Math.atan2(-Math.cos(phase),Math.sin(phase))};
  }
  function attackPose(age){
    if(age<=0||age>=.52)return {lean:0,compression:0,lift:0};
    const anticipation=Math.sin(Math.PI*Math.min(age/.14,1));
    const impact=age<.14?0:Math.sin(Math.PI*Math.min((age-.14)/.38,1));
    return {lean:-anticipation*.09+impact*.075,compression:anticipation*.035+impact*.065,lift:anticipation*.07};
  }
  const api={turnTowards,swingTarget,weaponPose,attackPose,chainPoint,gait};if(typeof module!=='undefined')module.exports=api;else root.HeroMotion=api;
})(typeof window!=='undefined'?window:globalThis);
