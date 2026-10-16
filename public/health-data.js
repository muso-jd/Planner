import {day} from './core.js';
export const HEALTH_SCOPES=['activity_and_fitness','sleep','health_metrics_and_measurements'].map(s=>'https://www.googleapis.com/auth/googlehealth.'+s+'.readonly');
export const HEALTH_TYPES=['sleep','exercise','weight','daily-heart-rate-variability','daily-resting-heart-rate'];
const number=v=>v!==undefined&&v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const dateObject=d=>typeof d==='string'?d.slice(0,10):d?.year?`${d.year}-${String(d.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`:'';
const civil=c=>typeof c==='string'?c:dateObject(c?.date)+(c?.time?'T'+[c.time.hours||0,c.time.minutes||0,c.time.seconds||0].map(n=>String(n).padStart(2,'0')).join(':'):'');
export const seconds=d=>typeof d==='string'&&/^\d+(\.\d+)?s$/.test(d)?parseFloat(d):null;
export function healthFilter(type,from,to){const key=type.replaceAll('-','_'),field=type==='sleep'?'interval.civil_end_time':type==='exercise'?'interval.civil_start_time':type==='weight'?'sample_time.civil_time':'date';return `${key}.${field} >= "${from}" AND ${key}.${field} < "${to}"`}
export async function normalizeHealth(point,type){
 const key=type.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v=point[key];if(!v)return null;
 const start=v.interval?.startTime,end=v.interval?.endTime,at=v.sampleTime?.physicalTime||end||start;
 const date=dateObject(v.date)||civil(v.sampleTime?.civilTime||(type==='exercise'?v.interval?.civilStartTime:v.interval?.civilEndTime)||v.interval?.civilStartTime).slice(0,10)||(at&&Number.isFinite(Date.parse(at))?day(new Date(at)):'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
 const identity=point.name||point.dataPointName||JSON.stringify([type,start,end,at,date]);
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(identity))),n=>n.toString(16).padStart(2,'0')).join('');
 const r={id:'health-'+digest.slice(0,40),type:'health',source:'google-health',sourceName:point.name||point.dataPointName||'',date,at:at||'',category:'Health'};
 if(type==='weight'){r.metric='weight';r.value=number(v.weightGrams);if(r.value===null||r.value<=0)return null;r.value/=1000;r.title='Weight';r.unit='kg'}
 if(type==='sleep'){r.metric='sleep';r.title='Sleep';r.start=start;r.end=end;r.value=number(v.summary?.minutesAsleep);r.unit='minutes';r.inBedMinutes=number(v.summary?.minutesInSleepPeriod);r.stages=(v.summary?.stagesSummary||[]).map(s=>({stage:s.type,totalMinutes:number(s.minutes)}));if(r.value===null){const stages=v.stages||[];const sleeping=stages.filter(s=>['LIGHT','DEEP','REM','ASLEEP'].includes(s.type));r.value=sleeping.length?sleeping.reduce((n,s)=>n+Math.max(0,(Date.parse(s.endTime)-Date.parse(s.startTime))/60000||0),0):null;}if(r.value===null||r.value<0)return null;}
 if(type==='exercise'){const m=v.metricsSummary||{};r.metric='workout';r.title=v.displayName||String(v.exerciseType||'Workout').replaceAll('_',' ').toLowerCase();r.start=start;r.end=end;r.value=seconds(v.activeDuration)!==null?seconds(v.activeDuration)/60:(Date.parse(end)-Date.parse(start))/60000;r.unit='minutes';r.exerciseType=v.exerciseType;r.averageHeartRate=number(m.averageHeartRateBeatsPerMinute);r.calories=number(m.caloriesKcal);r.distanceKm=number(m.distanceMillimeters)!==null?Number(m.distanceMillimeters)/1e6:null;r.zoneMinutes=Object.fromEntries(Object.entries(m.heartRateZoneDurations||{}).map(([k,d])=>[k,(seconds(d)||0)/60]));if(!Number.isFinite(r.value)||r.value<=0)return null;}
 if(type==='daily-heart-rate-variability'){r.metric='hrv';r.title='Heart rate variability';r.value=number(v.averageHeartRateVariabilityMilliseconds);r.unit='ms';if(r.value===null)return null;}
 if(type==='daily-resting-heart-rate'){r.metric='restingHeartRate';r.title='Resting heart rate';r.value=number(v.beatsPerMinute);r.unit='bpm';if(r.value===null||r.value<=0)return null;}
 return r;
}
export function recoveryPlan(workout,now=Date.now()){
 const hours=number(workout.recoveryHours),end=Date.parse(workout.end||workout.at);
 if(hours===null||hours<=0||!Number.isFinite(end)||end>now)return null;
 const until=end+hours*3600000;return {until:new Date(until).toISOString(),remainingHours:Math.max(0,(until-now)/3600000),hours};
}
export function validateHealth(r){
 if(!['weight','sleep','workout','stress'].includes(r.metric))throw Error('Choose a supported health entry.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date))throw Error('Choose an entry date.');
 r.value=Number(r.value);const limits={weight:[.1,1000],sleep:[0,1440],workout:[1,1440],stress:[1,5]},[min,max]=limits[r.metric];
 if(!Number.isFinite(r.value)||r.value<min||r.value>max)throw Error(`Enter a value from ${min} to ${max}.`);
 if(r.metric==='workout'){if(!Number.isFinite(Date.parse(r.end)))throw Error('Choose the workout end time.');if(r.intensity!==''&&(!Number.isFinite(Number(r.intensity))||Number(r.intensity)<1||Number(r.intensity)>10))throw Error('Intensity must be 1–10, or blank.');if(r.recoveryHours!==''&&(!Number.isFinite(Number(r.recoveryHours))||Number(r.recoveryHours)<0||Number(r.recoveryHours)>168))throw Error('Planned rest must be 0–168 hours, or blank.');}
 return r;
}
