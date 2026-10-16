import test from 'node:test';
import assert from 'node:assert/strict';
import {workState,dependencyCycle,requirements,createWorkModel} from '../public/dependencies.js';
import {healthWindows,healthFilter,normalizeHealth} from '../public/health-data.js';
const item=(id,type='task',extra={})=>({id,type,title:id,...extra});
test('parent tasks require subtasks; goals/projects derive completion; reopening propagates without writes',()=>{
 const r={p:item('p','project',{progress:100}),g:item('g','goal',{project:'p',progress:100}),a:item('a','task',{project:'g',done:true}),b:item('b','task',{parent:'a'}),wait:item('wait','task',{deps:['p']})};
 assert.equal(workState(r,'p').done,false);assert.equal(workState(r,'a').blocked,true);assert.equal(workState(r,'wait').blocked,true);assert.equal(workState(r,'g').progress,0);
 r.b.done=true;assert.equal(workState(r,'a').done,true);assert.equal(workState(r,'g').done,true);assert.equal(workState(r,'p').done,true);assert.equal(workState(r,'wait').blocked,false);
 r.b.done=false;assert.equal(workState(r,'p').done,false);assert.equal(workState(r,'wait').blocked,true);assert.equal(r.a.done,true);
 assert.equal(workState({e:item('e','goal',{progress:100,done:true})},'e').done,false);
});
test('containment, cross-type and mixed prerequisite cycles are rejected',()=>{
 const r={p:item('p','project'),g:item('g','goal',{project:'p'}),a:item('a','task',{project:'g'}),b:item('b')};
 assert.equal(dependencyCycle(r,{...r.a,deps:['p']}),true);
 assert.equal(dependencyCycle(r,{...r.p,deps:['a']}),false); // parent already requires a through g
 assert.equal(dependencyCycle(r,{...r.p,project:'g'}),true);
 assert.equal(dependencyCycle(r,{...r.g,deps:['g']}),true);
 assert.equal(dependencyCycle(r,{...r.b,deps:['g']}),false);
 const tasks={a:item('a'),b:item('b','task',{parent:'a'})};assert.equal(dependencyCycle(tasks,{...tasks.b,deps:['a']}),true);
});
test('deleted and missing prerequisites block; deleted contained work does not count; resources remain enforced',()=>{
 const r={p:item('p','goal'),a:item('a','task',{project:'p',done:true}),b:item('b','task',{project:'p',deleted:true}),c:item('c','task',{deps:['b']}),d:item('d','task',{cost:10,availableBudget:0,done:true})};
 assert.equal(workState(r,'p').done,true);assert.equal(workState(r,'c').blocked,true);assert.equal(workState(r,'d').done,false);assert.deepEqual(requirements(r,r.p),['a']);
});
test('memoized model excludes unrelated health history and handles an imported cycle safely',()=>{
 const r={a:item('a','task',{deps:['b']}),b:item('b','task',{deps:['a']})};for(let i=0;i<3000;i++)r['health'+i]={id:'health'+i,type:'health'};
 const model=createWorkModel(r);assert.equal(model.state('a').done,false);assert.equal(model.state('b').blocked,true);
});
test('365-day import windows are adjacent, inclusive of selected date, and leap-year safe',()=>{
 for(const end of ['2026-10-16','2024-03-01','2025-01-01']){const w=healthWindows(end,365);assert.equal(w.length,14);assert.equal((Date.parse(w.at(-1).to)-Date.parse(w[0].from))/86400000,365);assert.equal((Date.parse(w.at(-1).to)-Date.parse(end))/86400000,1);for(let i=1;i<w.length;i++)assert.equal(w[i-1].to,w[i].from);}
 assert.throws(()=>healthWindows('2026-10-16',366));assert.match(healthFilter('body-fat','2026-01-01','2026-02-01'),/body_fat.sample_time.civil_time/);
});
test('additional Google Health types normalize documented units, preserve zeros and reject unsupported points',async()=>{
 const date={year:2026,month:10,day:16};
 const oxygen=await normalizeHealth({dailyOxygenSaturation:{date,averagePercentage:98}},'daily-oxygen-saturation');assert.equal(oxygen.value,98);assert.equal(oxygen.unit,'%');
 const rate=await normalizeHealth({dailyRespiratoryRate:{date,breathsPerMinute:14}},'daily-respiratory-rate');assert.equal(rate.metric,'respiratoryRate');assert.equal(rate.value,14);
 const fat=await normalizeHealth({bodyFat:{sampleTime:{civilTime:{date}},percentage:0}},'body-fat');assert.equal(fat.value,0);assert.equal(fat.metric,'bodyFat');
 assert.equal(await normalizeHealth({bodyFat:{sampleTime:{civilTime:{date}},percentage:101}},'body-fat'),null);
 assert.equal(await normalizeHealth({unsupported:{date}},'unsupported'),null);
});
