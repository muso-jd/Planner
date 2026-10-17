import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {testServer} from './server.mjs';
import {keys,encrypt,decrypt,day} from '../public/core.js';
import {navigate} from './navigation.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLANNER_PLAYWRIGHT_MODULE||'playwright');
const {server,url,db}=await testServer(),browser=await chromium.launch({executablePath:process.env.PLANNER_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];let checks=0;
try{
 const key='fundingvisible'.repeat(3)+'x',k=await keys(key),date=day(),records={
  p:{id:'p',type:'project',title:'Studio'},g:{id:'g',type:'goal',project:'p',title:'Lighting'},
  parent:{id:'parent',type:'task',title:'Free planning step',project:'g',cost:0,scope:'Business'},
  child:{id:'child',type:'task',title:'Buy light',parent:'parent',project:'g',cost:25,scope:'Business'},
  freeChild:{id:'freeChild',type:'task',title:'Free setup',parent:'child',cost:0,scope:'Business'},
  done:{id:'done',type:'task',title:'Completed purchase',project:'g',cost:10,done:true,scope:'Business'},
  personal:{id:'personal',type:'task',title:'Personal purchase',project:'p',cost:15,scope:'Personal'},
  zero:{id:'zero',type:'task',title:'Zero standalone',cost:0},
  missing:{id:'missing',type:'task',title:'Unset estimate'},
  empty:{id:'empty',type:'project',title:'Free project'},
  free:{id:'free',type:'task',project:'empty',title:'No funding needed',cost:'0'},
  income:{id:'income',type:'task',title:'Income only task',cost:0,expectedIncome:120,scope:'Business'},
  ledger:{id:'ledger',type:'transaction',title:'Recorded expense',kind:'expense',amount:5,date,scope:'Business'}
 };
 const encrypted=await encrypt(records,k.key),id=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(k.auth))).toString('hex');db.prepare('INSERT INTO vaults VALUES(?,1,?,?,?)').run(id,encrypted.data,encrypted.iv,new Date().toISOString());
 const page=await browser.newPage({viewport:{width:1512,height:982},timezoneId:'Europe/Vienna'});page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'/#vault='+key);await page.waitForFunction(()=>!document.querySelector('#unlock').open);
 await navigate(page,'money');
 const row=id=>page.locator(`[data-funding-item=${id}]`),metrics=page.locator('.funding-panel .metric');
 for(const hidden of ['parent','freeChild','zero','missing','empty','free','income'])assert.equal(await row(hidden).count(),0,hidden);checks++;
 for(const visible of ['p','g','child','done','personal'])assert.equal(await row(visible).count(),1,visible);checks++;
 assert((await row('p').textContent()).includes('50,00'));assert((await row('g').textContent()).includes('35,00'));assert((await metrics.nth(1).textContent()).includes('40,00'));assert((await metrics.nth(2).textContent()).includes('120,00'));assert((await metrics.nth(0).textContent()).includes('80,00'));assert((await page.locator('.funding-panel .stat').nth(1).textContent()).includes('2 unconfirmed funded tasks'));checks++;
 assert.equal(await row('child').evaluate(el=>el.style.getPropertyValue('--funding-depth')),'2');assert.equal(await page.locator('.ledger-row').count(),1);checks++;
 await page.locator('[data-section=budget][data-tab=Business]').click();assert.equal(await row('personal').count(),0);assert.equal(await row('child').count(),1);assert((await metrics.nth(1).textContent()).includes('25,00'));checks++;
 await page.locator('[data-section=budget][data-tab=Personal]').click();assert.equal(await row('g').count(),0);assert.equal(await row('child').count(),0);assert.equal(await row('personal').count(),1);assert.equal(await row('p').count(),1);checks++;
 await page.locator('[data-section=budget][data-tab=analytics]').click();assert.equal(await row('parent').count(),0);assert.equal(await row('child').count(),1);checks++;
 // The display filter leaves zero-cost tasks available in Tasks and permits a new estimate.
 await navigate(page,'tasks');assert.equal(await page.locator('[data-edit=parent]').count(),1);assert.equal(await page.locator('[data-edit=zero]').count(),1);checks++;
 await page.locator('[data-edit=zero]').click();await page.locator('.editor-advanced summary').click();await page.locator('[name=cost]').fill('20');await page.locator('#editForm [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#editor').open);
 await navigate(page,'money');await page.locator('[data-section=budget][data-tab=total]').click();assert.equal(await row('zero').count(),1);assert((await metrics.nth(1).textContent()).includes('60,00'));checks++;
 await row('zero').locator('[data-edit=zero]').click();await page.locator('.editor-advanced summary').click();await page.locator('[name=cost]').fill('0');await page.locator('#editForm [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#editor').open);assert.equal(await row('zero').count(),0);checks++;
 await page.evaluate(()=>dispatchEvent(new Event('online')));await page.waitForFunction(()=>document.querySelector('#syncStatus').dataset.state==='synced');const saved=await decrypt(db.prepare('SELECT data,iv FROM vaults WHERE id=?').get(id),k.key);assert(!saved.parent.deleted);assert.equal(Number(saved.zero.cost),0);assert.equal(saved.income.expectedIncome,120);checks++;
 assert.deepEqual(errors,[]);console.log(`PASS ${checks} funding visibility, scope, descendant, total, edit and persistence checks; zero page errors.`);
}finally{await browser.close();server.close()}
