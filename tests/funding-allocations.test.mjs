import test from 'node:test';
import assert from 'node:assert/strict';
import {fundingRollup,taskFunding,allocationSummary,periodDates,ledgerOccurrences,paymentReminders,routineOccursOn,routineTime} from '../public/planning.js';
import {calendarEntries} from '../public/calendar.js';
import {iconPaths,navIcons} from '../public/solid-icons.js';
test('funding sums nested task own costs once and ignores manual container totals',()=>{
 const r={p:{id:'p',type:'project',budget:9999},g:{id:'g',type:'goal',project:'p',budget:8888},t:{id:'t',type:'task',project:'g',cost:100,expectedIncome:250},s:{id:'s',type:'task',parent:'t',project:'g',cost:25},d:{id:'d',type:'task',project:'g',cost:7,done:true},x:{id:'x',type:'task',project:'g',cost:999,deleted:true}};
 assert.equal(fundingRollup(r,'p').cost,132);assert.equal(fundingRollup(r,'g').cost,132);assert.equal(fundingRollup(r,'p',{openOnly:true}).cost,125);assert.equal(taskFunding(r).cost,125);assert.equal(fundingRollup(r,'t').cost,125);assert.equal(taskFunding(r).projects.length,2);
 r.p.project='g';assert.equal(fundingRollup(r,'p').cost,132);
});
test('monthly allowance partitions exactly in cents including leap years; explicit expenses are deducted',()=>{
 const b={id:'food',type:'spendingBudget',amount:100,period:'month'},r={food:b,e:{id:'e',type:'transaction',kind:'expense',date:'2028-02-01',amount:10,budgetAllocation:'food'},income:{id:'income',type:'transaction',kind:'income',date:'2028-02-01',amount:50,budgetAllocation:'food'},future:{id:'future',type:'transaction',kind:'expense',date:'2028-02-20',amount:5,budgetAllocation:'food'},other:{id:'other',type:'transaction',kind:'expense',date:'2028-02-01',amount:7}};
 const m=allocationSummary(r,b,'2028-02-01','month');assert.equal(m.allowance,100);assert.equal(m.spent,10);assert.equal(m.remaining,90);assert.equal(m.planned,5);assert.equal(m.projectedRemaining,85);
 assert.equal(periodDates('2028-02-01','month').reduce((n,date)=>n+Math.round(allocationSummary({},b,date,'day').allowance*100),0),10000);
 assert.equal(allocationSummary({},b,'2028-02-01','week').from,'2028-01-31');
 assert(allocationSummary(r,b,'2028-02-01','day').remaining<0);
});
test('weekly budgets prorate month boundaries and start dates without rollover or duplication',()=>{
 const b={id:'travel',amount:70,period:'week',startDate:'2026-10-17'};
 assert.equal(allocationSummary({},b,'2026-10-17','day').allowance,10);
 assert.equal(allocationSummary({},b,'2026-10-17','week').allowance,20);
 assert.equal(allocationSummary({},b,'2026-10-17','month').allowance,150);
});
test('transfer date drives recurring ledger, clamped dates and interval without changing record date',()=>{
 const r={pay:{id:'pay',type:'transaction',date:'2026-01-02',transferDate:'2026-01-31',repeat:'monthly',amount:10,kind:'income'}};
 assert.equal(ledgerOccurrences(r,'2028-02')[0].date,'2028-02-29');assert.equal(ledgerOccurrences(r,'2028-02')[0].recordDate,'2026-01-02');assert.equal(r.pay.date,'2026-01-02');r.pay.interval=2;assert.equal(ledgerOccurrences(r,'2026-02').length,0);
});
test('T-1 payment reminders cross month/year boundaries in Vienna and respect off',()=>{
 const r={p:{id:'p',type:'transaction',date:'2026-01-01',transferDate:'2026-01-01',repeat:'yearly',kind:'expense',amount:10,paymentReminderDays:'1',paymentReminderTime:'09:00'}};
 assert.equal(paymentReminders(r,new Date('2026-12-31T08:00:20Z')).length,1);assert.equal(paymentReminders(r,new Date('2026-12-31T09:00:00Z')).length,0);r.p.paymentReminderDays='';assert.equal(paymentReminders(r,new Date('2026-12-31T08:00:20Z')).length,0);
});
test('linked routines follow the canonical block recurrence and time; deleted blocks restore own schedule',()=>{
 const b={id:'b',type:'block',due:'2026-10-19',repeat:'weekly',time:'09:00',minutes:60},r={id:'r',type:'routine',blockId:'b',blockOffset:15,frequency:'daily',weekdays:[0,1,2,3,4,5,6],time:'07:00'},records={b,r};
 assert.equal(routineTime(records,r),'09:15');assert(routineOccursOn(r,'2026-10-19',records));assert(!routineOccursOn(r,'2026-10-20',records));b.time='10:00';assert.equal(routineTime(records,r),'10:15');assert.deepEqual(calendarEntries(records,'2026-10-19',{weekly:true,monthly:true}).map(x=>x.id),['b']);b.deleted=true;assert.equal(routineTime(records,r),'07:00');assert(routineOccursOn(r,'2026-10-20',records));
});
test('navigation has distinct icons and new task/budget category symbols are available',()=>{
 assert.equal(new Set(Object.values(navIcons)).size,Object.values(navIcons).length);for(const icon of ['food','travel','shopping','wallet','repeat','timeblock','education','stopwatch','bell'])assert(iconPaths[icon]);
});
