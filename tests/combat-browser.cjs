const {chromium}=require('@playwright/test');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  const source=fs.readFileSync(require('node:path').join(__dirname,'../world.js'),'utf8');
  await page.route('**/world.js',route=>route.fulfill({contentType:'text/javascript',body:source+`
   const qaFxCreate=CombatFX.create;CombatFX.create=function(scene,height){window.qaScene=scene;return window.qaFx=qaFxCreate(scene,height);};
   const qaCreateWorld=window.createWorld;window.qaEvents=[];
   window.createWorld=function(canvas,cb){const original=cb.combat;cb.combat=event=>{qaEvents.push(event);original?.(event);};return window.qaWorld=qaCreateWorld(canvas,cb);};
  `}));
  await page.goto('http://localhost:4177/');await page.waitForFunction(()=>document.getElementById('loading').hidden);
  await page.waitForFunction(()=>new Set(qaEvents.filter(e=>e.type==='weapon').map(e=>e.weapon)).size===6,{},{timeout:20000});
  await page.waitForFunction(()=>qaEvents.some(e=>e.type==='death'),{},{timeout:20000});
  const kinds=await page.evaluate(()=>new Set(qaEvents.filter(e=>e.type==='status').map(e=>e.status)).size);assert.ok(kinds>=3,'live status effects apply');
  await page.locator('#pause').click();const paused=await page.evaluate(()=>qaEvents.length);await page.waitForTimeout(450);assert.equal(await page.evaluate(()=>qaEvents.length),paused,'pause freezes combat');await page.locator('#resume').click();
  await page.evaluate(()=>{qaEvents.length=0;qaWorld.setAuto(false);qaWorld.setStats({damage:0,hp:100000,regen:0,speed:4,range:4.1,arsenal:[]});qaWorld.position({x:14,z:-13});});
  await page.waitForFunction(()=>qaEvents.some(e=>e.type==='telegraph'&&e.boss),{},{timeout:12000});
  await page.screenshot({path:'qa/combat-boss-telegraph.png'});
  const bossId=await page.evaluate(()=>qaEvents.find(e=>e.type==='telegraph'&&e.boss).id);
  await page.keyboard.down('s');await page.waitForFunction(()=>qaWorld.getPosition().z>-11.4,{},{timeout:12000});await page.keyboard.up('s');
  await page.waitForFunction(id=>qaEvents.some(e=>e.type==='strike'&&e.id===id),bossId,{timeout:12000});
  assert.equal(await page.evaluate(id=>qaEvents.find(e=>e.type==='strike'&&e.id===id).hit,bossId),false,'moving out of boss telegraph dodges actual strike');
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'qa/combat-desktop.png'});
  assert.ok(await page.evaluate(()=>{const count=qaScene.children.length;for(let i=0;i<2000;i++){qaFx.burst(0,0,'#ffcc44',12);qaFx.impact(0,0,'#fff',2);}return qaFx.capacity===144&&qaScene.children.length===count;}),'repeated impacts reuse the bounded particle/ring pool');
  assert.deepEqual(errors,[]);console.log('Combat browser QA: six live weapon effects, status application, pause, mobile boss telegraph/dodge and desktop rendering passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
