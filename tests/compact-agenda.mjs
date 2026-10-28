import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {testServer} from './server.mjs';
import {keys,encrypt} from '../public/core.js';
import {navigate} from './navigation.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const {server,url,db}=await testServer(),browser=await chromium.launch({executablePath:process.env.PLANNER_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],headless:true});
try{
 const records={};
 for(let p=0;p<=10;p++)records['t'+p]={id:'t'+p,type:'task',title:p===0?'Organize and cull photography files':'Task priority '+p,priority:p,due:'2026-10-30',category:'Photography & Content',minutes:30};
 for(const [i,title]of ['Morning Supplements','Shower','Make the Bed','Tea','Training (Run / Yoga / Ride)','Medication'].entries())records['r'+i]={id:'r'+i,type:'routine',title,time:'06:00',category:'Health',frequency:'daily'};
 records.settings={id:'settings',type:'settings',theme:'glass-carbon'};
 const key='compact'.repeat(6)+'x',k=await keys(key),envelope=await encrypt(records,k.key),id=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(k.auth))).toString('hex');
 db.prepare('INSERT INTO vaults VALUES(?,0,?,?,?)').run(id,envelope.data,envelope.iv,new Date().toISOString());
 const page=await browser.newPage({viewport:{width:1830,height:1370},timezoneId:'Europe/Vienna'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'/#vault='+key);await page.waitForFunction(()=>!document.querySelector('#unlock').open);await navigate(page,'today');
 assert.equal(await page.locator('.task-row [data-duplicate],.row [data-action=googleTask],.row .duplicate-record').count(),0);
 assert.equal(await page.locator('.task-row .urgent-badge').first().textContent(),'P0');
 const dims=await page.locator('.task-row').first().evaluate(r=>{let check=r.querySelector('.check').getBoundingClientRect(),clock=r.querySelector('[data-action=start]').getBoundingClientRect(),badge=r.querySelector('.urgent-badge').getBoundingClientRect();return [check.width,check.height,clock.width,clock.height,badge.width,badge.height]});assert.deepEqual(dims,[40,40,40,40,40,40]);
 fs.mkdirSync('.private/qa',{recursive:true});
 for(const [name,width,height]of [['desktop',1830,1370],['ipad-landscape',1366,1024],['ipad-portrait',1024,1366],['phone',390,844]]){
  await page.setViewportSize({width,height});await navigate(page,'today');await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' page overflow');
  const layout=await page.evaluate(()=>{const a=document.querySelector('.today-agenda>.focus-card').getBoundingClientRect(),r=document.querySelector('.today-rhythm').getBoundingClientRect();return {aw:a.width,rw:r.width,top:a.top===r.top}});
  if(width>1150){assert(layout.top,name+' columns');assert(Math.abs((layout.aw+18)/layout.rw-2)<0.25,name+' one-third rhythm')}else assert(!layout.top,name+' stacked columns');
  for(const row of await page.locator('.today-routine').all()){
   assert.equal(await row.locator('.routine-meta,.tag,.duplicate-record').count(),0);
   const l=await row.evaluate(r=>{const title=r.querySelector('.row-body'),time=r.querySelector('time');return {nowrap:getComputedStyle(r.querySelector('.entry-title')).whiteSpace,aligned:Math.abs(time.getBoundingClientRect().right-r.getBoundingClientRect().right),height:r.getBoundingClientRect().height}});
   assert.equal(l.nowrap,'nowrap');assert(l.aligned<1);assert(l.height<=65);
  }
  await page.screenshot({path:'.private/qa/compact-'+name+'.png',fullPage:true});
 }
 await page.setViewportSize({width:1366,height:1024});await navigate(page,'tasks');
 const labels=await page.locator('.task-row-actions .urgent-badge,.task-row-actions .priority-badge').allTextContents();assert.deepEqual(labels,Array.from({length:11},(_,i)=>'P'+i));
 await page.getByRole('button',{name:'Task priority 1',exact:true}).click();assert.match(await page.locator('select[name=priority]').locator('option:checked').textContent(),/Most important/);await page.locator('[data-close]').click();
 await navigate(page,'today');await page.getByRole('button',{name:'Log Shower',exact:true}).click();assert(await page.getByRole('button',{name:'Log Shower',exact:true}).getAttribute('aria-pressed')==='true');
 await page.getByRole('button',{name:'Track Organize and cull photography files',exact:true}).click();assert(await page.locator('#timerDock').isVisible());
 assert.deepEqual(errors,[]);console.log('Compact agenda: controls, sizes, ordering, editor, routine completion, timer and 4 responsive layouts passed.');
}finally{await browser.close();server.close()}
