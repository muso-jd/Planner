import test from 'node:test';import assert from 'node:assert/strict';
import {FONT_TIERS,fontSizes,applyTypography} from '../public/typography.js';
import {duplicateDraft} from '../public/record-actions.js';
import {groupedRoutines,routineOccursOn} from '../public/planning.js';
test('adaptive type has five sizes, scales display linearly and gives compact text more relative growth',()=>{
 assert.equal(FONT_TIERS.length,5);assert.deepEqual(fontSizes().map(t=>t.value),[12,14,16,22,34]);
 const enlarged=fontSizes({uiFontScale:125});assert.equal(enlarged[0].value,18);assert.equal(enlarged[4].value,42.5);
 assert(enlarged[0].value/12>enlarged[1].value/14);assert(enlarged[1].value/14>enlarged[4].value/34);
 const custom=fontSizes({fontXS:15,uiFontScale:125});assert(custom[0].value>15*1.25);assert.equal(custom[4].value,42.5);
 const writes={};applyTypography({fontMD:18},{setProperty:(k,v)=>writes[k]=v});assert.equal(Object.keys(writes).length,5);assert.equal(writes['--font-md'],'18px');
 assert.deepEqual(fontSizes({fontXS:'oops',fontMD:999,uiFontScale:Infinity}).map(t=>t.value),[12,14,16,22,34]);
});
test('time-block groups use canonical recurrence, contain each routine once and retain orphaned routines',()=>{
 const records={b:{id:'b',type:'block',title:'Weekly block',repeat:'weekly',due:'2026-10-20',time:'08:00',minutes:60},empty:{id:'empty',type:'block',title:'Empty block',repeat:'daily',due:'2026-10-20'},gone:{id:'gone',type:'block',deleted:true},a:{id:'a',type:'routine',title:'A',frequency:'daily',blockId:'b',blockOffset:10},z:{id:'z',type:'routine',title:'Z',frequency:'monthly',blockId:'b',blockOffset:0},orphan:{id:'orphan',type:'routine',blockId:'gone',frequency:'daily'},free:{id:'free',type:'routine',frequency:'daily'},deleted:{id:'deleted',type:'routine',blockId:'b',deleted:true}};
 const before=JSON.stringify(records),all=groupedRoutines(records);assert.equal(all.blocks.length,2);assert.deepEqual(all.blocks.find(g=>g.block.id==='b').routines.map(r=>r.id),['z','a']);assert.equal(all.unassigned.length,2);
 const weekly=groupedRoutines(records,'weekly');assert.equal(weekly.blocks.length,1);assert.equal(weekly.blocks[0].routines.length,2);assert.equal(weekly.unassigned.length,0);assert.equal(groupedRoutines(records,'daily').blocks[0].routines.length,0);
 assert(routineOccursOn(records.a,'2026-10-20',records));assert.equal(JSON.stringify(records),before);
});
test('task copy retains planning fields but starts incomplete without remote or completion identity',()=>{
 const task={id:'source',type:'task',title:'Prepare shoot',done:true,completed:'yesterday',completionLog:[{notes:'old'}],completionNotes:'old',updated:'yesterday',createdAt:'old',googleId:'remote',googleSource:'calendar',googleTaskExportId:'remote2',repeatParent:'source-parent',project:'p',parent:'parent',due:'2026-10-21',deps:['d'],attachments:[{id:'file'}]};
 const before=JSON.stringify(task),copy=duplicateDraft(task);assert.equal(copy.done,false);assert.equal(copy.title,'Prepare shoot · Copy');assert.equal(copy.project,'p');assert.equal(copy.parent,'parent');assert.equal(copy.due,'2026-10-21');assert.deepEqual(copy.deps,['d']);assert.equal(copy.id,undefined);assert.equal(copy.completionLog,undefined);assert(!Object.keys(copy).some(k=>k.startsWith('google')));copy.deps.push('new');assert.equal(JSON.stringify(task),before);
});
test('routine copy retains block placement and independent schedule without copying daily checks',()=>{
 const copy=duplicateDraft({id:'r',type:'routine',title:'Routine',blockId:'b',blockOffset:15,frequency:'weekly',weekdays:[2],time:'09:00'});assert.equal(copy.id,undefined);assert.equal(copy.blockId,'b');assert.equal(copy.blockOffset,15);assert.deepEqual(copy.weekdays,[2]);assert.equal(copy.time,'09:00');assert.throws(()=>duplicateDraft({type:'block'}));assert.throws(()=>duplicateDraft({type:'routine',deleted:true}));
});
