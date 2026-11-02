(function(root){
  'use strict';
  const WEAPONS=[
    {id:'axe',name:'Iron Cleaver',icon:'axe',color:'#ffb631',base:36,cost:60,desc:'Wide cleaves hit clustered enemies.'},
    {id:'blade',name:'Venom Reaver',icon:'blade',color:'#b46aff',base:24,cost:90,desc:'Poisons enemies for 3 seconds.'},
    {id:'bow',name:'Emerald Star',icon:'bow',color:'#9bea59',base:28,cost:120,desc:'Strikes two foes and fractures armor.'},
    {id:'hammer',name:'Stone Hatchet',icon:'hammer',color:'#b6d3e0',base:45,cost:180,desc:'Stuns and interrupts ordinary enemies.'},
    {id:'staff',name:'Flame Axe',icon:'staff',color:'#ff7653',base:38,cost:240,desc:'Splash damage leaves enemies burning.'},
    {id:'crossbow',name:'Frost Reaper',icon:'crossbow',color:'#55dfff',base:52,cost:320,desc:'Chills enemies, slowing their approach.'}
  ];
  const SKILLS=[
    {id:'strength',name:'Strong arm',icon:'axe',cost:15,parent:null,desc:'+20% damage',x:50,y:88},
    {id:'vitality',name:'Vitality',icon:'heart',cost:20,parent:'strength',desc:'+30% max health',x:26,y:70},
    {id:'fury',name:'Battle fury',icon:'flame',cost:25,parent:'strength',desc:'+25% damage',x:74,y:70},
    {id:'greed',name:'Treasure hunter',icon:'coin',cost:35,parent:'vitality',desc:'+40% gold per kill',x:13,y:50},
    {id:'regen',name:'Second wind',icon:'heart',cost:40,parent:'vitality',desc:'Double health regeneration',x:39,y:50},
    {id:'reach',name:'Long reach',icon:'bow',cost:45,parent:'fury',desc:'+35% attack range',x:63,y:50},
    {id:'haste',name:'Fleet foot',icon:'boot',cost:45,parent:'fury',desc:'+30% movement speed',x:88,y:50},
    {id:'fortune',name:'Lucky star',icon:'star',cost:70,parent:'greed',desc:'+75% gold per kill',x:21,y:29},
    {id:'iron',name:'Iron heart',icon:'shield',cost:75,parent:'regen',desc:'+50% max health',x:50,y:29},
    {id:'inferno',name:'Inferno',icon:'flame',cost:90,parent:'reach',desc:'+60% damage',x:79,y:29},
    {id:'hero',name:'Dungeon legend',icon:'crown',cost:150,parent:'iron',desc:'+100% damage',x:50,y:9}
  ];
  function createState(){return {version:1,progressionVersion:1,consumed:0,essence:{power:0,vigor:0},claimedNodes:[],claimedCamps:[],gold:480,gems:35,souls:18,kills:0,bosses:0,level:1,xp:0,chests:0,questClaim:0,zone:0,visualVersion:2,weapons:{axe:1,blade:1,bow:1,hammer:1,staff:1,crossbow:1},equipped:['axe','blade','bow','hammer','staff','crossbow'],skills:[],position:{x:0,z:3},auto:true,sound:false,savedAt:Date.now()};}
  function stats(s){let damage=WEAPONS.reduce((a,w)=>a+(s.equipped.includes(w.id)?w.base*(s.weapons[w.id]||0):0),0);const has=id=>s.skills.includes(id);damage*=1+(has('strength')?.2:0)+(has('fury')?.25:0)+(has('inferno')?.6:0)+(has('hero')?1:0);const totalDamage=Math.round(damage*(1+(s.level-1)*.08))+(s.essence?.power||0);const weight=WEAPONS.reduce((n,w)=>n+(s.equipped.includes(w.id)?w.base*(s.weapons[w.id]||0):0),0);return {arsenal:WEAPONS.filter(w=>s.equipped.includes(w.id)).map(w=>({id:w.id,dps:weight?totalDamage*w.base*(s.weapons[w.id]||0)/weight:0})),damage:totalDamage,hp:Math.round((360+s.level*40)*(1+(has('vitality')?.3:0)+(has('iron')?.5:0)))+(s.essence?.vigor||0),regen:has('regen')?9:4.5,speed:has('haste')?5.2:4,range:has('reach')?5.2:4.1,goldBonus:1+(has('greed')?.4:0)+(has('fortune')?.75:0)};}
  function weaponCost(s,id){const w=WEAPONS.find(w=>w.id===id);return w?Math.round(w.cost*Math.pow(1.48,s.weapons[id]||0)):Infinity;}
  function upgradeWeapon(s,id){const w=WEAPONS.find(w=>w.id===id);if(!w)return false;const cost=weaponCost(s,id);if(s.gold<cost||s.weapons[id]>=100)return false;s.gold-=cost;s.weapons[id]++;if(!s.equipped.includes(id)&&s.equipped.length<6)s.equipped.push(id);return true;}
  function unlockSkill(s,id){const skill=SKILLS.find(k=>k.id===id);if(!skill||s.skills.includes(id)||s.souls<skill.cost||(skill.parent&&!s.skills.includes(skill.parent)))return false;s.souls-=skill.cost;s.skills.push(id);return true;}
  function awardKill(s,boss,tier=s.zone){s.kills++;if(boss){s.bosses++;s.gems+=8;}const gold=Math.round((boss?180:14+Math.floor(tier*7))*stats(s).goldBonus);s.gold+=gold;s.souls+=boss?12:1;s.xp+=boss?80:12;while(s.xp>=s.level*90){s.xp-=s.level*90;s.level++;s.gems+=3;}return gold;}
  const NODE_REWARDS={wood:{gold:90,souls:3,gems:0},crystals:{gold:0,souls:8,gems:5},treasure:{gold:180,souls:0,gems:4}};
  function awardConsume(s,boss=false){const old={...s.essence};s.consumed=Math.min(1000000,s.consumed+1);s.essence.power=Math.min(500,s.essence.power+(boss?5:1));s.essence.vigor=Math.min(1000,s.essence.vigor+(boss?10:2));return {damage:s.essence.power-old.power,hp:s.essence.vigor-old.vigor};}
  function claimNode(s,id){const reward=Object.hasOwn(NODE_REWARDS,id)?NODE_REWARDS[id]:null;if(!reward||s.claimedNodes.includes(id))return false;s.claimedNodes.push(id);for(const key of ['gold','gems','souls'])s[key]+=reward[key];return {...reward};}
  function claimCamp(s,index){if(!Number.isInteger(index)||index<0||index>3||s.claimedCamps.includes(index))return false;const reward={gold:[50,90,140,350][index],gems:[1,2,3,5][index]};s.claimedCamps.push(index);s.gold+=reward.gold;s.gems+=reward.gems;return reward;}
  function openChest(s){const eligible=WEAPONS.filter(w=>s.weapons[w.id]<100);if(s.gems<15||!eligible.length)return null;s.gems-=15;s.chests++;const w=eligible[Math.floor(Math.random()*eligible.length)];s.weapons[w.id]+=1;if(!s.equipped.includes(w.id)&&s.equipped.length<6)s.equipped.push(w.id);s.gold+=75;return w;}
  function restoreState(raw,now=Date.now(),strict=false){
    const fresh=createState();const invalid=()=>{if(strict)throw new Error("Invalid save");return fresh;};try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s||s.version!==1)return invalid();
      for(const key of ['gold','gems','souls','kills','bosses','level','xp','chests','questClaim','zone','savedAt'])if(!Number.isSafeInteger(s[key])||s[key]<0||s[key]>(key==='savedAt'?1e15:1e12))return invalid();
      if(s.level<1||s.level>10000||s.zone>2||!s.weapons||!Array.isArray(s.equipped)||s.equipped.length>6||!Array.isArray(s.skills))return invalid();
      for(const w of WEAPONS)if(!Number.isInteger(s.weapons[w.id])||s.weapons[w.id]<0||s.weapons[w.id]>100)return invalid();
      if(!s.equipped.length||s.equipped.some(id=>!WEAPONS.some(w=>w.id===id)||!s.weapons[id])||new Set(s.equipped).size!==s.equipped.length||new Set(s.skills).size!==s.skills.length||s.skills.some(id=>!SKILLS.some(k=>k.id===id)))return invalid();
      for(const k of SKILLS)if(s.skills.includes(k.id)&&k.parent&&!s.skills.includes(k.parent))return invalid();
      if(!s.position||!Number.isFinite(s.position.x)||!Number.isFinite(s.position.z))s.position=fresh.position;
      s.position={x:Math.max(-19,Math.min(19,s.position.x)),z:Math.max(-24,Math.min(19,s.position.z))};
      s.auto=typeof s.auto==='boolean'?s.auto:true;s.sound=typeof s.sound==='boolean'?s.sound:false;
      if(!s.visualVersion){for(const w of WEAPONS)s.weapons[w.id]=Math.max(1,s.weapons[w.id]);s.equipped=WEAPONS.map(w=>w.id);s.visualVersion=2;}
      if(s.progressionVersion===undefined){s.progressionVersion=1;s.consumed=0;s.essence={power:0,vigor:0};s.claimedNodes=[];s.claimedCamps=[];}
      if(s.progressionVersion!==1||!Number.isSafeInteger(s.consumed)||s.consumed<0||s.consumed>1000000||!s.essence)return invalid();
      for(const [key,cap] of [['power',500],['vigor',1000]])if(!Number.isSafeInteger(s.essence[key])||s.essence[key]<0||s.essence[key]>cap)return invalid();
      if(!Array.isArray(s.claimedNodes)||s.claimedNodes.length>3||new Set(s.claimedNodes).size!==s.claimedNodes.length||s.claimedNodes.some(id=>!Object.hasOwn(NODE_REWARDS,id)))return invalid();
      if(!Array.isArray(s.claimedCamps)||s.claimedCamps.length>4||new Set(s.claimedCamps).size!==s.claimedCamps.length||s.claimedCamps.some(i=>!Number.isInteger(i)||i<0||i>3))return invalid();
      const seconds=Math.max(0,Math.min(28800,(now-s.savedAt)/1000));s.offlineGold=seconds>60?Math.floor(seconds*.7*stats(s).goldBonus):0;s.gold+=s.offlineGold;s.savedAt=now;return s;
    }catch{return invalid();}
  }
  const api={WEAPONS,SKILLS,NODE_REWARDS,awardConsume,claimNode,claimCamp,createState,stats,weaponCost,upgradeWeapon,unlockSkill,awardKill,openChest,restoreState};
  if(typeof module!=='undefined')module.exports=api;else root.HeroCore=api;
})(typeof window!=='undefined'?window:globalThis);
