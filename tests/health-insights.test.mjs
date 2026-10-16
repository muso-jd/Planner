import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarDates} from '../public/calendar.js';
import {healthFilter,normalizeHealth,recoveryPlan,validateHealth,HEALTH_SCOPES} from '../public/health-data.js';
import {dailySeries,average,lineChart} from '../public/insights.js';
import {googlePayload} from '../public/google-export.js';

test('calendar remains a Monday-first seven-column grid across month and year boundaries',()=>{
 const dates=calendarDates('2027-01-15');assert.equal(dates.length,42);assert.equal(dates[0],'2026-12-28');assert.equal(dates.at(-1),'2027-02-07');assert.equal(calendarDates('2026-10-18','week')[0],'2026-10-12');
});
test('Google Health filters use supported civil and daily fields and read-only scopes',()=>{
 assert.match(healthFilter('sleep','2026-10-01','2026-10-17'),/^sleep.interval.civil_end_time >=/);assert.match(healthFilter('weight','a','b'),/^weight.sample_time.civil_time/);assert.match(healthFilter('daily-heart-rate-variability','a','b'),/^daily_heart_rate_variability.date/);assert(HEALTH_SCOPES.every(s=>s.endsWith('.readonly')));
});
test('Google Health normalizes documented units, identities and civil dates',async()=>{
 const p={name:'users/synthetic/dataTypes/weight/dataPoints/1',weight:{sampleTime:{physicalTime:'2026-10-15T22:15:00Z',civilTime:{date:{year:2026,month:10,day:16},time:{hours:0,minutes:15}}},weightGrams:88500}},r=await normalizeHealth(p,'weight');assert.equal(r.value,88.5);assert.equal(r.date,'2026-10-16');assert.equal((await normalizeHealth({...p,weight:{...p.weight,weightGrams:89000}},'weight')).id,r.id);assert(!('stress' in r));
 const w=await normalizeHealth({name:'fixture-workout',exercise:{displayName:'Cycling',interval:{startTime:'2026-10-16T08:00:00Z',endTime:'2026-10-16T09:00:00Z'},activeDuration:'3000s',metricsSummary:{distanceMillimeters:20000000,heartRateZoneDurations:{vigorousTime:'600s'}}}},'exercise');assert.equal(w.value,50);assert.equal(w.distanceKm,20);assert.equal(w.zoneMinutes.vigorousTime,10);assert.equal(w.intensity,undefined);assert.equal(w.recoveryHours,undefined);
});
test('sleep uses asleep summary or actual sleeping-stage intervals, never substitutes time in bed',async()=>{
 const interval={startTime:'2026-10-15T21:00:00Z',endTime:'2026-10-16T05:00:00Z'};
 const a=await normalizeHealth({dataPointName:'s1',sleep:{interval,summary:{minutesAsleep:'420',minutesInSleepPeriod:'480',stagesSummary:[{type:'DEEP',minutes:'90'}]}}},'sleep');assert.equal(a.value,420);assert.equal(a.stages[0].totalMinutes,90);
 const b=await normalizeHealth({dataPointName:'s2',sleep:{interval,stages:[{type:'LIGHT',startTime:'2026-10-15T21:00:00Z',endTime:'2026-10-15T23:00:00Z'},{type:'AWAKE',startTime:'2026-10-15T23:00:00Z',endTime:'2026-10-16T00:00:00Z'}]}},'sleep');assert.equal(b.value,120);
 assert.equal(await normalizeHealth({sleep:{interval,summary:{minutesInSleepPeriod:'480'}}},'sleep'),null);
});
test('recovery is only a user-configured rest countdown, with no fabricated recovery metric',()=>{
 const now=Date.parse('2026-10-16T12:00:00Z'),w={end:'2026-10-16T10:00:00Z'};assert.equal(recoveryPlan(w,now),null);assert.equal(recoveryPlan({...w,recoveryHours:24},now).remainingHours,22);assert.equal(recoveryPlan({...w,recoveryHours:1},now).remainingHours,0);assert.equal(recoveryPlan({...w,end:'2026-10-17T10:00:00Z',recoveryHours:24},now),null);
 assert.throws(()=>validateHealth({metric:'weight',date:'2026-10-16',value:-1}));assert.throws(()=>validateHealth({metric:'workout',date:'2026-10-16',value:30,end:w.end,intensity:11}));
});
test('daily analytics distinguish missing wellbeing measurements from recorded zeros and activity counts',()=>{
 const data=dailySeries({s:{id:'s',type:'health',metric:'stress',date:'2026-10-16',value:3},m:{id:'m',type:'mood',date:'2026-10-16',value:0},d:{id:'d',type:'task',done:true,completed:'2026-10-16T11:00:00Z'}},['2026-10-15','2026-10-16']);assert.equal(data[0].sleep,null);assert.equal(data[0].stress,null);assert.equal(data[0].completed,0);assert.equal(data[1].stress,3);assert.equal(data[1].mood,null);assert.equal(data[1].completed,1);assert.equal(average([null,undefined,'',0,2]),1);
 assert(!lineChart('Missing',data,[{key:'sleep',label:'Sleep',color:'#fff'}]).includes('circle'));assert(!lineChart('Mixed',data,[{key:'stress',label:'Stress',color:'#fff'}]).includes('NaN'));
});
test('individual Google exports support undated tasks, valid reminders, Vienna times and all-day dates',()=>{
 assert.equal(googlePayload({title:'Undated',done:false},'tasks').due,null);assert.throws(()=>googlePayload({title:'Undated'},'calendar'));
 const timed=googlePayload({title:'Timed',due:'2026-10-16',time:'09:00',minutes:30,reminder:'60'},'calendar');assert.equal(timed.start.dateTime,'2026-10-16T07:00:00.000Z');assert.equal(timed.reminders.overrides[0].minutes,60);
 const allDay=googlePayload({title:'All day',due:'2026-12-31',repeat:'monthly',interval:1,reminder:'none'},'calendar');assert.equal(allDay.end.date,'2027-01-01');assert.equal(allDay.reminders.useDefault,true);assert.deepEqual(allDay.recurrence,['RRULE:FREQ=MONTHLY;INTERVAL=1']);
});
