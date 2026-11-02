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
  const api={turnTowards,swingTarget,chainPoint,gait};if(typeof module!=='undefined')module.exports=api;else root.HeroMotion=api;
})(typeof window!=='undefined'?window:globalThis);
