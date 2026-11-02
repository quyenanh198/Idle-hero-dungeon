/* Optional browser QA: npm install --save-dev @playwright/test, then npm run test:browser. */
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../core.js');
const base='http://localhost:4177';
(async()=>{
 const browser=await chromium.launch({headless:true});let checks=0;
 const check=(value,message)=>{assert.ok(value,message);checks++;console.log('PASS',message);};
 const errors=[];const remote=[];const out=path.resolve(__dirname,'../qa');fs.mkdirSync(out,{recursive:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))remote.push(r.url());});
 await page.goto(base);await page.waitForFunction(()=>document.getElementById('loading').hidden);await page.waitForTimeout(1300);
 check(await page.locator('#world').evaluate(e=>e.clientWidth>=1400),'desktop uses full-screen reference canvas');
 await page.screenshot({path:path.join(out,'desktop.png')});
 await page.waitForFunction(()=>Number(document.getElementById('stat-kills').textContent)>0,{},{timeout:20000});check(Number(await page.locator('#stat-kills').textContent())>0,'automatic battle actually defeats monsters');
 if(await page.locator('#auto').getAttribute('aria-pressed')==='true')await page.locator('#auto').click();await page.locator('#world').click({position:{x:550,y:480}});await page.keyboard.down('d');await page.waitForTimeout(600);await page.keyboard.up('d');
 await page.locator('.top-actions [data-action="settings"]').click();await page.locator('#manual-save').click();
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('idle-hero-dungeon-v1')));check(first.position.x!==0||first.position.z!==3,'movement changes hero position');
 await page.locator('#modal-close').click();
 await page.locator('#pause').click();check(await page.locator('#pause-screen').isVisible(),'pause overlay visible');await page.locator('#resume').click();check(!await page.locator('#pause-screen').isVisible(),'resume works');
 // Seed a disposable context to exercise transactions without grinding.
 const seeded=C.createState();seeded.gold=3000;seeded.souls=200;seeded.kills=20;seeded.gems=100;seeded.auto=false;
 await page.addInitScript(s=>{if(!sessionStorage.getItem('qa-seeded')){localStorage.setItem('idle-hero-dungeon-v1',JSON.stringify(s));sessionStorage.setItem('qa-seeded','1');}},seeded);await page.reload();await page.waitForFunction(()=>document.getElementById('loading').hidden);
 await page.locator('.world-left [data-action=quests]').click();await page.locator('#modal-claim').click();await page.locator('#modal-close').click();check((await page.locator('#gems').textContent())==='115','bounty gives gems');
 await page.locator('.world-right [data-action="inventory"]').click();await page.locator('#modal [data-upgrade="axe"]').click();check((await page.locator('.inventory-item').first().textContent()).includes('LEVEL 2'),'weapon upgrade raises level');
 await page.locator('#modal [data-upgrade="bow"]').click();check((await page.locator('.inventory-item').nth(2).textContent()).includes('EQUIPPED'),'unlocked weapon equips into available slot');
 await page.locator('#modal-close').click();await page.locator('.world-right [data-action="skills"]').click();await page.locator('[data-skill="strength"]').click();await page.locator('[data-unlock-skill="strength"]').click();check(await page.locator('[data-skill="strength"]').evaluate(e=>e.classList.contains('unlocked')),'skill unlock persists');
 await page.locator('[data-skill="fury"]').click();check(await page.locator('[data-unlock-skill="fury"]').isEnabled(),'child skill unlocks after parent');
 await page.screenshot({path:path.join(out,'skills.png')});
 await page.keyboard.press('Escape');check(!await page.locator('#modal-backdrop').isVisible(),'Escape closes modal');
 await page.locator('.world-right [data-action="shop"]').click();await page.locator('#open-chest').click();check(await page.locator('.chest-result').isVisible(),'chest reveals weapon');await page.locator('#modal-close').click();
 await page.locator('.reference-profile [data-action="map"]').click();await page.locator('[data-travel="1"]').click();check((await page.locator('#zone-name').textContent())==='Frost Hollow','travel updates location');
 await page.locator('.top-actions [data-action="settings"]').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const dl=await download;await dl.saveAs(path.join(out,'test-save.json'));check(fs.existsSync(path.join(out,'test-save.json')),'save export downloads');
 await page.locator('#import-file').setInputFiles(path.join(out,'test-save.json'));await page.locator('#modal-backdrop').waitFor({state:'hidden'});check(!await page.locator('#modal-backdrop').isVisible(),'valid import restores and closes');
 await page.locator('.top-actions [data-action="settings"]').click();const beforeBadImport=await page.locator('#gold').textContent();const invalid=C.createState();invalid.gold=-1;await page.locator('#import-file').setInputFiles({name:'invalid-save.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});await page.waitForFunction(()=>document.getElementById('toast').textContent.includes('Invalid save'));check((await page.locator('#toast').textContent()).includes('Invalid save'),'invalid import is rejected');check((await page.locator('#gold').textContent())===beforeBadImport,'invalid import preserves existing progress');await page.locator('#modal-close').click();
 await page.reload();await page.waitForFunction(()=>document.getElementById('loading').hidden);check((await page.locator('#zone-name').textContent())==='Frost Hollow','save survives reload');
 for(const size of [{width:390,height:844},{width:360,height:740},{width:768,height:1024},{width:844,height:390}]){
   await page.setViewportSize(size);await page.waitForTimeout(150);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow '+size.width);check(await page.locator('#pause').isVisible(),'pause accessible '+size.width);
   if(size.width<=700){check(await page.locator('#joystick').isVisible(),'touch joystick available');await page.locator('#pause').click();check(await page.locator('#pause-screen').isVisible(),'mobile pause');await page.locator('#resume').click();}
   if(size.width===390){await page.screenshot({path:path.join(out,'mobile.png')});await page.locator('.world-right [data-action="inventory"]').click();check(await page.locator('#modal').isVisible(),'mobile inventory visible');await page.screenshot({path:path.join(out,'mobile-inventory.png')});await page.locator('#modal-close').click();const r=await page.locator('#joystick').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width*.85,r.y+r.height/2);await page.waitForTimeout(400);await page.mouse.up();check(await page.locator('#joystick-stick').evaluate(e=>e.style.transform===''),'joystick releases correctly');}
 }
 check(errors.length===0,'no browser errors: '+errors.join('; '));check(remote.length===0,'no external runtime requests');
 // File launch is an advertised entry point, so validate it too.
 const direct=await browser.newPage();direct.on('pageerror',e=>errors.push(e.message));await direct.goto('file:///'+path.resolve(__dirname,'../index.html').replaceAll('\\','/'));await direct.waitForFunction(()=>document.getElementById('loading').hidden);check(await direct.locator('#world').isVisible(),'direct index.html launch works');check(errors.length===0,'direct launch has no errors');
 await browser.close();console.log(`Browser QA: ${checks} checks passed; desktop/mobile screenshots in qa/; zero page errors or remote requests.`);
})().catch(e=>{console.error(e);process.exit(1);});
