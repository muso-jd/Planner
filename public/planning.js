import {day,occursOn,taskOrder} from './core.js';

export const routineFrequency=r=>['daily','weekly','monthly'].includes(r.frequency)?r.frequency:'daily';
export function calendarDays(from,to){return Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000)}
export function routineOccursOn(r,date){
 if(r.deleted||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
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
  if(!r.repeat||r.repeat==='none'){if(r.date?.startsWith(month))out.push({...r,sourceId:r.id,occurrenceDate:r.date});continue}
  for(const date of dates)if(occursOn({due:r.date,repeat:r.repeat,interval:r.interval||1},date))out.push({...r,sourceId:r.id,date,occurrenceDate:date,projected:date!==r.date});
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
 return {tasks,cost:sum('cost'),income:sum('expectedIncome'),balance:sum('expectedIncome')-sum('cost')};
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
