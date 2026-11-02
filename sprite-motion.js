(function(root){
  'use strict';
  // Atlas columns: down, down-left, left, up-left, up, up-right, right, down-right.
  function direction8(yaw){return ((Math.round(-yaw/(Math.PI/4))%8)+8)%8;}
  function walkRow(time,moving){return moving?[1,2,3,2][Math.floor(Math.max(0,time)*7)%4]:0;}
  function attackRow(age){return age>=0&&age<.52?Math.min(3,Math.floor(age/.13)):-1;}
  function frameUv(frame,width,height){return {x:(frame.x+.5)/width,y:1-(frame.y+frame.h-.5)/height,w:(frame.w-1)/width,h:(frame.h-1)/height};}
  function uv(column,row,columns,rows){return {x:column/columns,y:1-(row+1)/rows,w:1/columns,h:1/rows};}
  const api={direction8,walkRow,attackRow,frameUv,uv};if(typeof module!=='undefined')module.exports=api;else root.SpriteMotion=api;
})(typeof window!=='undefined'?window:globalThis);
