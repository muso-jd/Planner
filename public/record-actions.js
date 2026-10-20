// A duplicate starts as a new unsaved record, without completion or integration identity.
export function duplicateDraft(record){
 if(!record||record.deleted||!['task','routine'].includes(record.type))throw Error('Only active tasks and routines can be duplicated.');
 const copy=structuredClone(record);
 for(const key of Object.keys(copy))if(/^google/i.test(key)||['id','updated','created','createdAt','completed','completionNotes','completionLog','repeatParent','deleted','done','archived'].includes(key))delete copy[key];
 copy.title=String(record.title||'Untitled').slice(0,243)+' · Copy';
 if(record.type==='task')copy.done=false;
 return copy;
}
