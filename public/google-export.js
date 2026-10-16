import {viennaInstant} from './core.js';
export function googlePayload(r,target){
 if(target==='tasks')return {title:r.title,notes:r.notes||'',status:r.done?'completed':'needsAction',due:r.due?r.due+'T00:00:00.000Z':null};
 if(!r.due)throw Error('Add a date to send this task to Google Calendar, or choose Google Tasks.');
 const minutes=Number(r.reminder),body={summary:r.title,description:r.notes||'',reminders:[30,60,1440].includes(minutes)?{useDefault:false,overrides:[{method:'popup',minutes}]}:{useDefault:true}};
 if(r.time){const start=new Date(viennaInstant(r.due,r.time)).toISOString();body.start={dateTime:start,timeZone:'Europe/Vienna'};body.end={dateTime:new Date(Date.parse(start)+Math.max(1,Number(r.minutes)||30)*60000).toISOString(),timeZone:'Europe/Vienna'};}else{const end=new Date(r.due+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+1);body.start={date:r.due};body.end={date:end.toISOString().slice(0,10)}}
 if(r.repeat&&r.repeat!=='none')body.recurrence=[`RRULE:FREQ=${r.repeat.toUpperCase()};INTERVAL=${Math.max(1,Number(r.interval)||1)}`];
 return body;
}
