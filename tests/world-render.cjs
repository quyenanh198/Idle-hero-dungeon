const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1000,height:760}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/world-render-harness',route=>route.fulfill({contentType:'text/html',body:
      '<!doctype html><meta charset="utf-8">'+['vendor/three.min.js','motion.js','art-assets.js','sprite-motion.js','environment.js','art-renderer.js','characters.js','world.js'].map(file=>`<script src="/${file}"></script>`).join('')}));
    await page.goto('http://localhost:4177/world-render-harness');
    await page.evaluate(async()=>{
      await HeroSprites.ready();
      document.body.innerHTML='<canvas id="test-world" style="position:fixed;inset:0;width:100vw;height:100vh"></canvas>';
      window.qaFrames=[];
      window.qaWorld=createWorld(document.getElementById('test-world'),{kill:()=>0,revive(){},frame:data=>qaFrames.push(data)});
      qaWorld.pause(true);
    });
    await page.waitForFunction(()=>qaFrames.length>0,{},{timeout:12000});
    const initial=await page.screenshot();
    await page.evaluate(()=>qaWorld.zone(1));
    await page.waitForFunction(()=>qaFrames.at(-1).position.z<-10,{},{timeout:12000});
    const travelled=await page.screenshot();assert.ok(!initial.equals(travelled),'paused travel redraws the new region');
    const count=await page.evaluate(()=>qaFrames.length);await page.evaluate(()=>qaWorld.zoom());
    await page.waitForFunction(count=>qaFrames.length>count,count,{timeout:12000});
    const zoomed=await page.screenshot();assert.ok(!travelled.equals(zoomed),'paused zoom redraws');
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(()=>qaFrames.at(-1).hero.x<390,{},{timeout:12000});
    assert.ok(await page.evaluate(()=>Math.abs(qaFrames.at(-1).hero.x-195)<2),'paused resize reprojects HUD coordinates');
    const beforeEquip=await page.screenshot();await page.evaluate(()=>qaWorld.setWeapons(['axe']));
    await page.waitForTimeout(150);const afterEquip=await page.screenshot();assert.ok(!beforeEquip.equals(afterEquip),'paused equipment changes redraw');
    const frozenCount=await page.evaluate(()=>qaFrames.length);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>qaFrames.length),frozenCount,'stable paused world does not repeatedly rebuild HUD');
    await page.evaluate(()=>qaWorld.pause(false));await page.waitForFunction(count=>qaFrames.length>count+1,frozenCount,{timeout:12000});
    assert.deepEqual(errors,[]);console.log('Paused-world QA: travel, zoom, resize, equipment, idle cache and resume verified.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
