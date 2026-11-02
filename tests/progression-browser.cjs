const {chromium}=require('@playwright/test');const fs=require('node:fs');const assert=require('node:assert/strict');const C=require('../core.js');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  const state=C.createState();state.auto=false;state.equipped=['axe'];
  await page.addInitScript(s=>{if(!sessionStorage.getItem('progression-seeded')){localStorage.setItem('idle-hero-dungeon-v1',JSON.stringify(s));sessionStorage.setItem('progression-seeded','yes');}},state);
  const source=fs.readFileSync(require('node:path').join(__dirname,'../world.js'),'utf8');
  await page.route('**/world.js',route=>route.fulfill({contentType:'text/javascript',body:source+`
    const qaCreate=createWorld;window.qaConsumed=0;window.qaFrames=[];
    window.createWorld=function(canvas,cb){const consume=cb.consume,frame=cb.frame;cb.consume=boss=>{qaConsumed++;consume?.(boss);};cb.frame=f=>{qaFrames.push(f);if(qaFrames.length>300)qaFrames.shift();frame(f);};return window.qaWorld=qaCreate(canvas,cb);};
  `}));
  await page.goto('http://localhost:4177/');await page.waitForFunction(()=>document.getElementById('loading').hidden);
  await page.keyboard.press('q');await page.waitForFunction(()=>qaFrames.at(-1)?.hook.phase!=='idle');
  await page.screenshot({path:'qa/hook-outbound-mobile.png'});
  await page.locator('#pause').click();const phase=await page.evaluate(()=>JSON.stringify(qaFrames.at(-1).hook));await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>JSON.stringify(qaFrames.at(-1).hook)),phase,'pause freezes active hook');await page.locator('#resume').click();
  await page.waitForFunction(()=>qaConsumed===1,{},{timeout:15000});
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('idle-hero-dungeon-v1')));assert.equal(saved.consumed,1);assert.equal(saved.essence.power,1);assert.equal(saved.essence.vigor,2);
  await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>qaConsumed),1,'consume rewards once');
  await page.evaluate(()=>qaWorld.position({x:-10,z:4.3}));await page.waitForFunction(()=>!document.getElementById('interact-action').hidden);
  await page.locator('#interact-action').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('idle-hero-dungeon-v1')).claimedNodes.includes('wood'));
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('idle-hero-dungeon-v1')));const gold=saved.gold;
  assert.equal(await page.evaluate(()=>qaWorld.interact()),false,'depleted node cannot reward twice');
  await page.reload();await page.waitForFunction(()=>document.getElementById('loading').hidden);saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('idle-hero-dungeon-v1')));assert.equal(saved.consumed,1);assert.equal(saved.gold,gold);assert.ok(saved.claimedNodes.includes('wood'));
  await page.evaluate(()=>qaWorld.position({x:5,z:4}));await page.keyboard.down('s');await page.waitForTimeout(650);await page.keyboard.up('s');
  assert.ok(await page.evaluate(()=>{const p=qaWorld.getPosition();return qaWorld.getColliders().every(c=>Math.hypot(p.x-c.x,p.z-c.z)>=c.radius+.6-.02);}), 'keyboard movement respects prop colliders');
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'qa/progression-desktop.png'});assert.deepEqual(errors,[]);
  console.log('Progression browser QA: manual Q hook, pause/reel/consume once, permanent stats, touch gathering, duplicate rejection, reload persistence, prop collision and responsive rendering passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
