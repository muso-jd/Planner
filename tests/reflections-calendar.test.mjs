import test from 'node:test';
import assert from 'node:assert/strict';
import {reflectionStamp} from '../public/core.js';
import {calendarEntries} from '../public/calendar.js';
test('reflection timestamps use Vienna time and preserve original save versus legacy edit provenance',()=>{
 const at='2026-10-16T23:15:00Z';
 assert.match(reflectionStamp({at,updated:'2026-10-17T10:00:00Z'}),/^Saved 17 Oct 2026, 01:15/);
 assert.match(reflectionStamp({updated:at}),/^Last edited 17 Oct 2026, 01:15/);
 assert.match(reflectionStamp({createdAt:at}),/^Saved /);
 assert.equal(reflectionStamp({}),'Time not recorded');
 assert.equal(reflectionStamp({at:'invalid'}),'Time not recorded');
});
test('weekly/monthly Calendar layers are independent and daily routines never appear',()=>{
 const date='2026-10-17',r={daily:{id:'daily',type:'routine',frequency:'daily'},weekly:{id:'weekly',type:'routine',frequency:'weekly',weekdays:[6]},monthly:{id:'monthly',type:'routine',frequency:'monthly',monthEndOffset:14},task:{id:'task',type:'task',due:date},block:{id:'block',type:'block',due:date},deleted:{id:'deleted',type:'routine',frequency:'weekly',weekdays:[6],deleted:true}};
 const ids=options=>calendarEntries(r,date,options).map(r=>r.id).sort();
 assert.deepEqual(ids({}),['block','task']);
 assert.deepEqual(ids({weekly:true}),['block','task','weekly']);
 assert.deepEqual(ids({monthly:true}),['block','monthly','task']);
 assert.deepEqual(ids({weekly:true,monthly:true}),['block','monthly','task','weekly']);
 assert.equal(calendarEntries(r,'2026-10-18',{weekly:true,monthly:true}).length,0);
});
