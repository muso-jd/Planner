import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {testServer} from './server.mjs';
import {keys,encrypt,decrypt,day} from '../public/core.js';
import {navigate} from './navigation.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLANNER_PLAYWRIGHT_MODULE||'playwright');
const {server,url,db}=await testServer();
const browser=await chromium.launch({executablePath:process.env.PLANNER_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];let checks=0;
const blackThemes=['glass-carbon','glass-black-ice','glass-amethyst'];
const themes=['glass-pearl','glass-dusk','glass-obsidian',...blackThemes];
const shots='.private/qa36';fs.mkdirSync(shots,{recursive:true});
try{
 const key='glasstest'.repeat(4)+'1234567',k=await keys(key),date=day();
 const records={
  settings:{id:'settings',type:'settings',accent:'#b8a0ff'},
  project:{id:'project',type:'project',title:'Studio refresh',color:'#719fe5'},
  goal:{id:'goal',type:'goal',title:'Build the next chapter',project:'project'},
  task:{id:'task',type:'task',title:'Prepare the lighting plan',project:'goal',cost:180,due:date,category:'Business',priority:2},
  routine:{id:'routine',type:'routine',title:'A moment to reset',time:'09:00',frequency:'daily'},
  block:{id:'block',type:'block',title:'Creative focus',due:date,time:'10:00',minutes:90,category:'Business'},
  note:{id:'note',type:'note',title:'A small idea for tomorrow',content:'Make space for the next good idea.',date},
  income:{id:'income',type:'transaction',title:'Studio commission',kind:'income',amount:1200,date,scope:'Business'},
  expense:{id:'expense',type:'transaction',title:'Fresh groceries',kind:'expense',amount:28.5,date,scope:'Personal',budgetAllocation:'food'},
  food:{id:'food',type:'spendingBudget',title:'Food',amount:310,period:'month',startDate:date.slice(0,8)+'01',scope:'Personal',color:'#81bc9d'}
 };
 const encrypted=await encrypt(records,k.key),id=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(k.auth))).toString('hex');
 db.prepare('INSERT INTO vaults VALUES(?,1,?,?,?)').run(id,encrypted.data,encrypted.iv,new Date().toISOString());
 const context=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Europe/Vienna'}),page=await context.newPage();
 page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(key=>localStorage.setItem('life-workspace-key',key),key);
 await page.goto(url);await page.waitForFunction(()=>!document.querySelector('#unlock').open);
 await navigate(page,'settings');assert.equal(await page.locator('.theme-choice').count(),6);checks++;
 // Each material applies in place; keyboard focus and the custom accent survive rendering.
 for(const theme of themes){
  await page.locator(`button[data-theme=${theme}]`).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  assert.equal(await page.locator('html').getAttribute('data-material'),'glass');
  assert.equal(await page.locator(`button[data-theme=${theme}]`).getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.theme),theme);
  if(blackThemes.includes(theme)){assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(0, 0, 0)');assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundImage),'none');assert.equal(await page.locator('meta[name=theme-color]').getAttribute('content'),'#000000');}
  await page.locator('#themeAccent').fill('#89b7ce');await page.locator('#themeAccent').dispatchEvent('change');
  assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--accent')),'#89b7ce');
  checks++;
 }
 // Persist through encrypted sync, a fresh device and a cached offline reopen.
 await page.evaluate(()=>dispatchEvent(new Event('online')));
 await page.waitForFunction(()=>document.querySelector('#syncStatus').dataset.state==='synced');
 let saved=await decrypt(db.prepare('SELECT data,iv FROM vaults WHERE id=?').get(id),k.key);
 assert.equal(saved.settings.theme,'glass-amethyst');assert.equal(saved.settings.accent,'#89b7ce');
 const other=await browser.newPage();await other.goto(url+'/#vault='+key);await other.waitForFunction(()=>document.documentElement.dataset.theme==='glass-amethyst');await other.close();checks++;
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const shell=await page.evaluate(async()=>{const cache=await caches.open('life-planner-shell-3.6.0');return !!await cache.match('/themes.css')});assert(shell);
 await context.setOffline(true);await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.theme==='glass-amethyst');assert.equal(await page.locator('html').getAttribute('data-material'),'glass');await context.setOffline(false);checks++;
 // New themes are optional, and changing back restores the original type and solid shell.
 await navigate(page,'settings');for(const theme of ['light','black','dark']){await page.locator(`button[data-theme=${theme}]`).click();assert.equal(await page.locator('html').getAttribute('data-material'),'solid');assert.equal(await page.locator('html').getAttribute('data-theme'),theme);checks++;}
 // Screenshots and horizontal overflow checks cover the affected layouts, including the editor.
 for(const [device,width,height] of [['desktop',1512,982],['ipad-portrait',1024,1366],['ipad-landscape',1366,1024],['phone',390,844]]){
  await page.setViewportSize({width,height});
  for(const theme of blackThemes){
   await navigate(page,'settings');await page.locator(`button[data-theme=${theme}]`).click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`${shots}/${device}-${theme}-settings.png`,fullPage:true});
   await navigate(page,'today');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`${shots}/${device}-${theme}-today.png`,fullPage:true});
   await navigate(page,'money');await page.locator('[data-section=budget][data-tab=allocations]').click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`${shots}/${device}-${theme}-budget.png`,fullPage:true});
   await navigate(page,'tasks');await page.locator('[data-edit=task]').first().click();
   assert(await page.locator('#editor').isVisible());assert(await page.evaluate(()=>document.querySelector('#editor').getBoundingClientRect().right<=innerWidth));
   await page.screenshot({path:`${shots}/${device}-${theme}-editor.png`});await page.locator('[data-close]').click();
   await navigate(page,'plan');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`${shots}/${device}-${theme}-calendar.png`,fullPage:true});
   await navigate(page,'projects');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`${shots}/${device}-${theme}-projects.png`,fullPage:true});checks++;
  }
 }
 // Browser media emulation checks the reduced-transparency and high-contrast paths.
 const cdp=await context.newCDPSession(page);
 await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'}]});
 assert(await page.evaluate(()=>matchMedia('(prefers-reduced-transparency: reduce)').matches));
 assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backdropFilter),'none');
 await page.screenshot({path:`${shots}/phone-reduced-transparency.png`,fullPage:true});checks++;
 await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-contrast',value:'more'}]});
 assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backdropFilter),'none');checks++;
 await cdp.send('Emulation.setEmulatedMedia',{features:[]});
 await page.setViewportSize({width:1512,height:982});await navigate(page,'settings');
 await page.locator('[data-theme=glass-pearl]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('html').getAttribute('data-theme'),'glass-pearl');checks++;
 assert.deepEqual(errors,[]);console.log(`PASS ${checks} theme, accent, encrypted sync, offline, keyboard, media and responsive checks; zero page errors.`);
}finally{await browser.close();server.close()}
