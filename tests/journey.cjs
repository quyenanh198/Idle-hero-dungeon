/* Release journey: a fresh save, actual controls, real boss fight and defeat. */
const {chromium}=require('@playwright/test');const fs=require('node:fs');const C=require('../core.js');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:'qa/recording',size:{width:390,height:844}}});
 try{
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
  const source=fs.readFileSync(require('node:path').join(__dirname,'../world.js'),'utf8');
  await page.route('**/world.js',route=>route.fulfill({contentType:'text/javascript',body:source+`
   const qaCreate=createWorld;window.qaBossKills=0;window.qaConsumes=0;window.qaCampRewards=0;window.qaRevives=0;window.qaLastFrame=null;
   window.createWorld=function(canvas,cb){const kill=cb.kill,consume=cb.consume,camp=cb.camp,revive=cb.revive,frame=cb.frame;
    cb.kill=(boss,tier)=>{if(boss)qaBossKills++;return kill(boss,tier);};cb.consume=boss=>{qaConsumes++;consume(boss);};cb.camp=id=>{const reward=camp(id);if(reward)qaCampRewards++;return reward;};cb.revive=()=>{qaRevives++;revive();};cb.frame=f=>{qaLastFrame=f;frame(f);};return window.qaWorld=qaCreate(canvas,cb);};
  `}));
  await page.goto('http://localhost:4177/');await page.waitForFunction(()=>document.getElementById('loading').hidden);
  await page.waitForFunction(()=>qaConsumes>0&&qaCampRewards>0,{},{timeout:90000});console.log('PASS fresh auto battle consumes enemies and completes a camp');
  await page.locator('.world-right [data-action=inventory]').click();await page.locator('.gold-button[data-upgrade=axe]').click();await page.locator('#modal-close').click();
  await page.locator('.world-right [data-action=skills]').click();await page.locator('[data-skill=strength]').click();await page.locator('[data-unlock-skill=strength]').click();await page.locator('#modal-close').click();
  await page.locator('.reference-profile [data-action=map]').click();await page.locator('[data-travel="1"]').click();await page.waitForFunction(()=>document.getElementById('zone-name').textContent==='Frost Hollow');
  await page.locator('.reference-profile [data-action=map]').click();await page.locator('[data-travel="2"]').click();
  await page.waitForFunction(()=>qaBossKills>0,{},{timeout:120000});await page.screenshot({path:'qa/journey-boss-victory.png'});console.log('PASS upgrades, skill, frost travel and actual boss victory');
  await page.locator('.top-actions [data-action=settings]').click();await page.locator('#manual-save').click();
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('idle-hero-dungeon-v1')));assert.ok(saved.bosses>=1&&saved.consumed>=1&&saved.claimedCamps.length>=1);assert.equal(saved.weapons.axe,2);assert.ok(saved.skills.includes('strength'));const permanent=saved.essence.power;
  await page.reload();await page.waitForFunction(()=>document.getElementById('loading').hidden);
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('idle-hero-dungeon-v1')));assert.ok(saved.essence.power>=permanent&&saved.bosses>=1);console.log('PASS earned progression survives reload');
  // A fresh encounter after reload, with a deliberately weak one-weapon loadout.
  await page.locator('.world-right [data-action=inventory]').click();for(const weapon of C.WEAPONS.filter(w=>w.id!=='blade')){const button=page.locator('[data-equip='+weapon.id+']');if(await button.textContent()==='UNEQUIP')await button.click();}await page.locator('#modal-close').click();
  await page.locator('.reference-profile [data-action=map]').click();await page.locator('[data-travel="2"]').click();
  await page.waitForFunction(()=>qaRevives>0,{},{timeout:180000});await page.waitForFunction(()=>qaLastFrame?.position.z>0&&Math.abs(qaLastFrame.position.x)<2,{},{timeout:12000});
  await page.screenshot({path:'qa/journey-revive.png'});assert.deepEqual(errors,[]);console.log('PASS genuine defeat revives in the meadow; zero page errors');
  const video=page.video();await context.close();await video.saveAs('qa/journey.webm');console.log('Fresh-save release journey passed; actual gameplay recording saved.');
 }finally{await context.close().catch(()=>{});await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
