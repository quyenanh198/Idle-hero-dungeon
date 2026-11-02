const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://localhost:4177/qa/environment-review.html');
  await page.waitForFunction(()=>environment.objects.every(prop=>prop.art.sprite.visible));
  for(const name of ['pine','snowpine','cottage','portal','crystals','chest']){
    await page.locator('#select').selectOption(name);
    await page.waitForFunction(name=>environment.objects.filter(p=>p.root.visible).every(p=>p.kind===name),name);
  }
  const count=await page.evaluate(()=>environment.objects.length);assert.equal(count,16);
  await page.screenshot({path:path.resolve(__dirname,'../qa/environment-gallery.png')});
  await page.goto('file:///'+path.resolve(__dirname,'../dist/index.html').replaceAll('\\','/'));
  await page.waitForFunction(()=>document.getElementById('loading').hidden);
  const loaded=await page.evaluate(async()=>{const element=document.querySelector('.event-button .painted-ui');const css=getComputedStyle(element).backgroundImage,url=css.slice(5,-2);const image=new Image();return new Promise(resolve=>{image.onload=()=>resolve(image.naturalWidth>1000);image.onerror=()=>resolve(false);image.src=url;});});
  assert.ok(loaded,'rendered HUD atlas loads in the built direct-file app');
  assert.deepEqual(errors,[]);await browser.close();console.log('Environment QA: 16 props, live selection, direct-file HUD and zero browser errors verified.');
})().catch(error=>{console.error(error);process.exit(1);});
