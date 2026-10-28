import test from 'node:test';
import assert from 'node:assert/strict';
import {todayAgenda} from '../public/planning.js';
test('Today includes every urgent task, blocked weekly tasks and recurring payments across months without duplicates',()=>{
 const records={};
 for(let i=0;i<8;i++)records['u'+i]={id:'u'+i,type:'task',priority:0,due:'2030-01-01',deps:['missing']};
 Object.assign(records,{late:{id:'late',type:'task',due:'2026-09-01',priority:5},weekly:{id:'weekly',type:'task',due:'2026-11-01',deps:['missing']},monday:{id:'monday',type:'task',due:'2026-10-26'},next:{id:'next',type:'task',due:'2026-11-02'},done:{id:'done',type:'task',priority:0,done:true},deleted:{id:'deleted',type:'task',priority:0,deleted:true},rent:{id:'rent',type:'transaction',kind:'expense',date:'2026-01-01',repeat:'monthly',amount:900},transfer:{id:'transfer',type:'transaction',kind:'expense',date:'2026-10-01',transferDate:'2026-10-30'},income:{id:'income',type:'transaction',kind:'income',date:'2026-10-30'}});
 const result=todayAgenda(records,'2026-10-28',new Date('2026-10-28T12:00:00Z'));
 assert.equal(result.from,'2026-10-26');assert.equal(result.to,'2026-11-01');
 assert.equal(result.urgent.length,10);assert.deepEqual(result.tasks.map(r=>r.id),['weekly']);
 assert.deepEqual(result.payments.map(r=>r.id),['transfer','rent']);
 assert.equal(result.payments[1].date,'2026-11-01');assert.equal(records.rent.date,'2026-01-01');
});
test('Monday and Sunday use the same week; completed/deleted tasks stay excluded',()=>{
 for(const date of ['2026-12-28','2027-01-03']){
  const r=todayAgenda({},date);assert.equal(r.from,'2026-12-28');assert.equal(r.to,'2027-01-03');assert.deepEqual(r.payments,[]);
 }
});

 test('Every task rating renders; urgent red keeps automatic overdue semantics',async()=>{
 const {priorityBadge}=await import('../public/core.js');const now=new Date('2026-10-28T12:00:00Z');
 for(let priority=1;priority<=10;priority++)assert.match(priorityBadge({type:'task',priority},now),new RegExp('>P'+priority+'<'));
 assert.match(priorityBadge({type:'task'},now),/>P5</);
 assert.match(priorityBadge({type:'task',priority:3,due:'2026-10-27'},now),/Urgent · Priority 0 · Overdue/);
 assert.match(priorityBadge({type:'task',priority:0,done:true},now),/>P0</);
 assert.equal(priorityBadge({type:'routine'},now),'');
 });

 test('Site-wide priority is ascending after urgency; explicit due sort still respects deadlines without mutating ratings',async()=>{
 const {taskOrder}=await import('../public/core.js');const {sortTasks}=await import('../public/planning.js');
 const tasks=[{id:'low',type:'task',priority:10,due:'2099-01-01'},{id:'high',type:'task',priority:1,due:'2099-12-01'},{id:'mid',type:'task',priority:5},{id:'urgent',type:'task',priority:0},{id:'overdue',type:'task',priority:9,due:'2020-01-01'}];
 const before=structuredClone(tasks),now=new Date('2026-10-28T12:00:00Z');
 assert.deepEqual([...tasks].sort((a,b)=>taskOrder(a,b,now)).map(r=>r.id),['overdue','urgent','high','mid','low']);
 assert.deepEqual(sortTasks(tasks).map(r=>r.id),['overdue','urgent','high','mid','low']);
 assert.deepEqual(sortTasks(tasks,'due').map(r=>r.id),['overdue','low','high','urgent','mid']);
 assert.deepEqual(tasks,before);
 });
