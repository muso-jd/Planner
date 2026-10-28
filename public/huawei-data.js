import {day} from './core.js';
export const HUAWEI_METRICS={huaweiSleepStage:'Sleep stages',heartRate:'Heart rate',restingHeartRate:'Resting heart rate',huaweiStress:'Huawei stress · 1–99',oxygenSaturation:'SpO₂',weight:'Weight'};
const types={huaweiSleepStage:{name:'com.huawei.continuous.sleep.fragment',field:'sleep_state',min:1,max:5},heartRate:{name:'com.huawei.instantaneous.heart_rate',field:'bpm',min:1,max:254.999},weight:{name:'com.huawei.instantaneous.body_weight',field:'body_weight',min:.1,max:1000},restingHeartRate:{name:'com.huawei.instantaneous.resting_heart_rate',field:'bpm',min:1,max:254.999},huaweiStress:{name:'com.huawei.instantaneous.stress',field:'score',min:1,max:99},oxygenSaturation:{name:'com.huawei.instantaneous.spo2',field:'saturation',min:.001,max:100}};
const physical=value=>{const n=Number(value);if(!Number.isFinite(n))return null;const ms=n>1e17?n/1e6:n>1e14?n/1000:n;return Number.isFinite(ms)&&ms>=Date.UTC(2000,0,1)&&ms<Date.UTC(2100,0,1)?new Date(ms):null};
async function identity(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return 'huawei-'+Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('').slice(0,40)}
// Summarize returned heart-rate samples, never infer resting HR. Keep each weight measurement.
export async function normalizeHuawei(data,metric,from,to){
 const type=Object.hasOwn(types,metric)?types[metric]:null;if(!type||!Array.isArray(data.group))throw Error('Unsupported Huawei response.');
 const unique=new Map();let returned=0,rejected=0;
 for(const group of data.group){if(!Array.isArray(group.sampleSet))throw Error('Unsupported Huawei sample-set response.');for(const set of group.sampleSet){if(!Array.isArray(set.samplePoints))throw Error('Unsupported Huawei sample-point response.');for(const p of set.samplePoints){returned++;const at=physical(p.startTime),valueField=p.value?.find(v=>v.fieldName===type.field),raw=valueField?.floatValue??valueField?.integerValue,value=typeof raw==='number'&&Number.isFinite(raw)?raw:null;
 if(p.dataTypeName!==type.name||!at||(metric!=='huaweiSleepStage'&&(at.getTime()<from||at.getTime()>=to))||value===null||value<type.min||value>type.max){rejected++;continue}
 const end=physical(p.endTime);if(metric==='huaweiSleepStage'){if(!end||end<=at||at.getTime()>=to||end.getTime()<=from){rejected++;continue}const startMs=Math.max(at.getTime(),from),endMs=Math.min(end.getTime(),to),stage={1:'LIGHT',2:'REM',3:'DEEP',4:'AWAKE',5:'NAP'}[value];if(!stage){rejected++;continue}unique.set(startMs+'|'+endMs+'|'+stage,{at:new Date(startMs).toISOString(),start:new Date(startMs).toISOString(),end:new Date(endMs).toISOString(),date:day(new Date(startMs)),value:(endMs-startMs)/60000,stage});continue}
 const date=day(at),key=at.toISOString()+'|'+String(p.endTime||p.startTime)+'|'+value;
 unique.set(key,{at:at.toISOString(),date,value,sourceName:String(p.originalDataCollectorId||set.dataCollectorId||'').slice(0,1000)});
 }}}
 const records=[];
 if(metric==='huaweiSleepStage'){const intervals=[...unique.values()].sort((a,b)=>a.start.localeCompare(b.start)),merged=[];for(const r of intervals){const previous=merged.at(-1);if(previous&&r.start<previous.end){if(previous.stage!==r.stage)throw Error('Conflicting overlapping Huawei sleep stages; no sleep import was prepared.');previous.end=previous.end>r.end?previous.end:r.end;previous.value=(Date.parse(previous.end)-Date.parse(previous.start))/60000}else merged.push({...r})}for(const r of merged)records.push({...r,id:await identity(metric+'|'+r.start+'|'+r.end+'|'+r.stage),type:'health',source:'huawei-health',metric,title:'Sleep · '+r.stage.toLowerCase(),unit:'minutes',category:'Health'});}
 else if(metric!=='weight'){
 const dates=new Map();for(const p of unique.values()){const a=dates.get(p.date)||[];a.push(p);dates.set(p.date,a)}
 for(const [date,rows]of dates){records.push({id:await identity(metric+'|'+date),type:'health',source:'huawei-health',metric,title:HUAWEI_METRICS[metric]+' · sample average',date,at:rows.map(r=>r.at).sort().at(-1),value:rows.reduce((n,r)=>n+r.value,0)/rows.length,min:rows.reduce((n,r)=>Math.min(n,r.value),Infinity),max:rows.reduce((n,r)=>Math.max(n,r.value),-Infinity),sampleCount:rows.length,unit:metric==='huaweiStress'?'score / 99':metric==='oxygenSaturation'?'%':'bpm',aggregation:'sample-mean',category:'Health'})}
 }else{
 const byTime=new Map();for(const r of unique.values())byTime.set(r.at,r);
 for(const r of byTime.values())records.push({...r,id:await identity('weight|'+r.at),type:'health',source:'huawei-health',metric:'weight',title:'Weight',unit:'kg',category:'Health'});
 }
 return {records,returned,valid:unique.size,rejected,duplicates:returned-rejected-unique.size};
}
