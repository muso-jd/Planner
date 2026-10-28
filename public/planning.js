import {day,occursOn,taskOrder,viennaInstant,isUrgent} from './core.js';
import {children} from './dependencies.js';

export const routineFrequency=r=>['daily','weekly','monthly'].includes(r.frequency)?r.frequency:'daily';
export function calendarDays(from,to){return Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000)}
export function routineOccursOn(r,date,records){
 if(r.deleted||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const block=records?.[r.blockId];if(block?.type==='block'&&!block.deleted)return occursOn(block,date);
 const d=new Date(date+'T12:00:00Z'),frequency=routineFrequency(r);
 if(frequency==='monthly'){const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();return d.getUTCDate()===Math.max(1,last-Math.max(0,Math.min(30,Number(r.monthEndOffset)||0)))}
 const days=Array.isArray(r.weekdays)?r.weekdays:frequency==='weekly'?[1]:[1,2,3,4,5,6,0];
 return days.includes(d.getUTCDay());
}
export function monthDates(month){
 if(!/^\d{4}-\d{2}$/.test(month))return [];
 const [y,m]=month.split('-').map(Number),last=new Date(Date.UTC(y,m,0)).getUTCDate();
 return Array.from({length:last},(_,i)=>month+'-'+String(i+1).padStart(2,'0'));
}
export const ledgerScope=r=>r.scope==='Business'?'Business':'Personal';
export function ledgerOccurrences(records,month,scope='total'){
 const dates=monthDates(month),out=[];
 for(const r of Object.values(records)){
  if(r.deleted||r.type!=='transaction'||scope!=='total'&&ledgerScope(r)!==scope)continue;
  const anchor=r.transferDate||r.date;
  if(!r.repeat||r.repeat==='none'){if(anchor?.startsWith(month))out.push({...r,recordDate:r.date,date:anchor,sourceId:r.id,occurrenceDate:anchor});continue}
  for(const date of dates)if(occursOn({due:anchor,repeat:r.repeat,interval:r.interval||1},date))out.push({...r,recordDate:r.date,sourceId:r.id,date,occurrenceDate:date,projected:date!==anchor});
 }
 return out.sort((a,b)=>a.date.localeCompare(b.date)||String(a.title||'').localeCompare(String(b.title||'')));
}
export function monthlyLedger(records,month,scope='total',today=day()){
 const entries=ledgerOccurrences(records,month,scope),cents=n=>Math.round((Number(n)||0)*100);
 let income=0,expense=0,postedIncome=0,postedExpense=0;
 for(const r of entries){const amount=cents(r.amount);if(r.kind==='income'){income+=amount;if(r.date<=today)postedIncome+=amount}else{expense+=amount;if(r.date<=today)postedExpense+=amount}}
 return {entries,income:income/100,expense:expense/100,balance:(income-expense)/100,postedBalance:(postedIncome-postedExpense)/100,plannedBalance:(income-postedIncome-expense+postedExpense)/100};
}
export function taskFunding(records,scope='total'){
 const tasks=Object.values(records).filter(r=>r.type==='task'&&!r.deleted&&!r.done&&(scope==='total'||ledgerScope({...r,scope:r.scope||(/business|admin|commerce/i.test(r.category||'')?'Business':'Personal')})===scope));
 const sum=k=>tasks.reduce((n,r)=>n+Math.round((Number(r[k])||0)*100),0)/100;
 const projects=Object.values(records).filter(r=>!r.deleted&&['project','goal'].includes(r.type)).map(r=>({...r,funding:fundingRollup(records,r.id,{openOnly:true,scope})}));
 return {tasks,projects,cost:sum('cost'),income:sum('expectedIncome'),balance:sum('expectedIncome')-sum('cost')};
}
export function paymentTiming(date,today=day()){
 const days=calendarDays(today,date);
 if(!Number.isFinite(days))return {days:null,label:'Unscheduled',category:'Unscheduled',tone:'muted'};
 if(days<0)return {days,label:Math.abs(days)+' days ago',category:'Recorded',tone:'muted'};
 if(days===0)return {days,label:'Today',category:'Due today',tone:'urgent'};
 return {days,label:'In '+days+' '+(days===1?'day':'days'),category:days<=7?'Due soon':'Planned',tone:days<=7?'soon':'planned'};
}
export function trackerProgress(since,now=Date.now()){
 const at=Date.parse(since),elapsed=Number.isFinite(at)?Math.max(0,Math.floor((now-at)/86400000)):0,page=Math.floor(Math.max(0,elapsed-1)/28);
 return {elapsed,start:page*28+1,end:page*28+28,filled:Math.min(28,elapsed-page*28),known:Number.isFinite(at)};
}
export function sortTasks(tasks,sort='priority'){
 return [...tasks].sort((a,b)=>sort==='title'?String(a.title).localeCompare(String(b.title)):sort==='cost'?Number(b.cost||0)-Number(a.cost||0):sort==='duration'?Number(a.minutes||0)-Number(b.minutes||0):sort==='newest'?String(b.created||b.updated||'').localeCompare(String(a.created||a.updated||'')):sort==='due'?String(a.due||'9999').localeCompare(String(b.due||'9999'))||taskOrder(a,b):taskOrder(a,b));
}

export const cents=value=>Math.round((Number(value)||0)*100);
export function fundingRollup(records,id,{openOnly=false,scope='total'}={}){
 const seen=new Set(),tasks=[];
 function visit(id){const r=records[id];if(!r||r.deleted||seen.has(id))return;seen.add(id);
  if(r.type==='task'&&(!openOnly||!r.done)&&(scope==='total'||ledgerScope({...r,scope:r.scope||(/business|admin|commerce/i.test(r.category||'')?'Business':'Personal')})===scope))tasks.push(r);
  for(const child of children(records,r))visit(child.id);
 }visit(id);const sum=key=>tasks.reduce((n,r)=>n+cents(r[key]),0)/100;
 return {tasks,cost:sum('cost'),income:sum('expectedIncome'),balance:sum('expectedIncome')-sum('cost')};
}
export function periodDates(date,mode='month'){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Choose a reporting date.');
 if(mode==='day')return [date];if(mode==='month')return monthDates(date.slice(0,7));
 const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
 return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setUTCDate(x.getUTCDate()+i);return x.toISOString().slice(0,10)});
}
// Prorate in integer cents by cumulative date position: partitions sum exactly to the native allowance.
export function allocationSummary(records,budget,date,mode=budget.period||'month'){
 const dates=periodDates(date,mode),active=dates.filter(d=>!budget.startDate||d>=budget.startDate),amount=cents(budget.amount),period=budget.period==='week'?'week':'month';
 const allowance=active.reduce((total,d)=>{const native=periodDates(d,period),index=native.indexOf(d),n=native.length;return total+Math.round(amount*(index+1)/n)-Math.round(amount*index/n)},0);
 const rows=[...new Set(dates.map(d=>d.slice(0,7)))].flatMap(m=>ledgerOccurrences(records,m)).filter(r=>r.kind!=='income'&&r.budgetAllocation===budget.id&&active.includes(r.date));
 const dated=rows.filter(r=>r.date<=date),spent=dated.reduce((n,r)=>n+cents(r.amount),0),planned=rows.filter(r=>r.date>date).reduce((n,r)=>n+cents(r.amount),0);
 return {from:dates[0],to:dates.at(-1),allowance:allowance/100,spent:spent/100,planned:planned/100,remaining:(allowance-spent)/100,projectedRemaining:(allowance-spent-planned)/100,entries:rows};
}
export function paymentReminders(records,now=new Date()){
 const today=day(now),months=new Set([today.slice(0,7)]);for(const n of [1,2,3,7]){const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);months.add(d.toISOString().slice(0,7));}
 return [...months].flatMap(month=>ledgerOccurrences(records,month)).filter(r=>Number.isFinite(Date.parse(r.date+'T12:00:00Z'))&&r.paymentReminderDays!==''&&r.paymentReminderDays!==undefined&&[0,1,2,3,7].includes(Number(r.paymentReminderDays))).map(r=>{const reminderDate=new Date(r.date+'T12:00:00Z');reminderDate.setUTCDate(reminderDate.getUTCDate()-Number(r.paymentReminderDays));return {...r,reminderAt:viennaInstant(reminderDate.toISOString().slice(0,10),r.paymentReminderTime||'09:00')};}).filter(r=>now.getTime()>=r.reminderAt&&now.getTime()-r.reminderAt<90000);
}
export function routineBlock(records,r){const b=records[r.blockId];return b?.type==='block'&&!b.deleted?b:null;}
export function routineTime(records,r){const b=routineBlock(records,r);if(!b||!b.time)return r.time||'';const [h,m]=b.time.split(':').map(Number),minutes=h*60+m+Math.max(0,Number(r.blockOffset)||0);return String(Math.floor(minutes/60)%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');}


// Use the canonical block's recurrence for grouped views, retaining each routine's own schedule.
export function groupedRoutines(records,frequency='all'){
 const active=Object.values(records).filter(r=>!r.deleted),blocks=active.filter(r=>r.type==='block');
 const sort=(a,b)=>String(routineTime(records,a)||'').localeCompare(String(routineTime(records,b)||''))||String(a.title||'').localeCompare(String(b.title||''));
 return {blocks:blocks.filter(b=>frequency==='all'||b.repeat===frequency).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||''))).map(block=>({block,routines:active.filter(r=>r.type==='routine'&&routineBlock(records,r)?.id===block.id).sort(sort)})),unassigned:active.filter(r=>r.type==='routine'&&!routineBlock(records,r)&&(frequency==='all'||routineFrequency(r)===frequency)).sort(sort)};
}

// Use the selected Vienna calendar date; weeks run Monday through Sunday.
export function todayAgenda(records,date,now=new Date()){
 const dates=periodDates(date,'week'),open=Object.values(records).filter(r=>r.type==='task'&&!r.deleted&&!r.done);
 const urgent=sortTasks(open.filter(r=>isUrgent(r,now)));
 const urgentIds=new Set(urgent.map(r=>r.id));
 const tasks=sortTasks(open.filter(r=>dates.includes(r.due)&&!urgentIds.has(r.id)),'due');
 const payments=[...new Set(dates.map(d=>d.slice(0,7)))].flatMap(month=>ledgerOccurrences(records,month)).filter(r=>r.kind!=='income'&&dates.includes(r.date));
 return {from:dates[0],to:dates.at(-1),urgent,tasks,payments};
}
