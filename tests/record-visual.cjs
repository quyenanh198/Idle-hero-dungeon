// Optional local visual capture. No production debugging globals are needed.
const {chromium}=require('@playwright/test');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(root,'qa'),tag=process.env.QA_TAG||'v3';
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:path.join(out,'recording'),size:{width:390,height:844}}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.join(root,'dist/index.html').replaceAll('\\','/'));
 await page.waitForFunction(()=>document.getElementById('loading').hidden);await page.waitForTimeout(3200);
 await page.screenshot({path:path.join(out,tag+'-mobile.png')});
 for(const key of ['d','w','a','s']){await page.keyboard.down(key);await page.waitForTimeout(750);await page.keyboard.up(key);}
 await page.waitForTimeout(1400);await page.locator('.reference-profile [data-action=map]').click();await page.locator('[data-travel="1"]').click();await page.waitForTimeout(2300);
 await page.screenshot({path:path.join(out,tag+'-frost.png')});await page.locator('.reference-profile [data-action=map]').click();await page.locator('[data-travel="2"]').click();await page.waitForTimeout(1800);await page.screenshot({path:path.join(out,tag+'-boss.png')});
 await page.locator('.world-right [data-action=inventory]').click();await page.screenshot({path:path.join(out,tag+'-inventory.png')});await page.locator('#modal-close').click();await page.waitForTimeout(900);
 const video=page.video();await context.close();await video.saveAs(path.join(out,tag+'-gameplay.webm'));
 const desktop=await browser.newPage({viewport:{width:1440,height:1000}});desktop.on('pageerror',e=>errors.push(e.message));await desktop.goto('file:///'+path.join(root,'dist/index.html').replaceAll('\\','/'));await desktop.waitForFunction(()=>document.getElementById('loading').hidden);await desktop.waitForTimeout(1200);await desktop.screenshot({path:path.join(out,tag+'-desktop.png')});
 await browser.close();if(errors.length)throw Error(errors.join('; '));console.log(tag+' capture complete. Zero page errors.');
})().catch(e=>{console.error(e);process.exit(1);});
