import {encrypt,decrypt,uid,unb64} from './core.js';

// Files share the existing authenticated encrypted-blob store. No plaintext is
// put into the vault or Cache Storage; each bounded chunk stays below API limits.
const CHUNK=384*1024,MAX_FILE=20*1024*1024;
const encode=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s)};
export function createAttachmentStore(credentials){
 async function request(id,options={}){if(!/^[a-f0-9-]{36}$/i.test(id))throw Error('Invalid file reference');const {auth}=credentials();const r=await fetch('/api/images/'+id,{...options,headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'}});if(!r.ok)throw Error('File storage unavailable. Reconnect and retry.');return r}
 async function write(id,payload){const {key}=credentials();await request(id,{method:'PUT',body:JSON.stringify(await encrypt(payload,key))})}
 async function read(id){const {key}=credentials();const part=await decrypt(await(await request(id)).json(),key);if(part.kind!=='attachment-chunk'||typeof part.data!=='string'||!/^[A-Za-z0-9+/=]*$/.test(part.data))throw Error('Invalid file data');return part}
 return {
  async upload(file,progress=()=>{}){
   if(file.size>MAX_FILE)throw Error('Files can be up to 20 MB each.');
   const parts=[];for(let offset=0;offset<Math.max(1,file.size);offset+=CHUNK){const id=uid(),data=encode(new Uint8Array(await file.slice(offset,offset+CHUNK).arrayBuffer()));await write(id,{kind:'attachment-chunk',data});parts.push(id);progress(Math.min(file.size,offset+CHUNK),file.size)}
   return {id:uid(),name:file.name,type:file.type||'application/octet-stream',size:file.size,parts,created:new Date().toISOString()};
  },
  async download(ref){const parts=[];for(const id of ref.parts||[])parts.push(unb64((await read(id)).data));const url=URL.createObjectURL(new Blob(parts,{type:'application/octet-stream'})),a=document.createElement('a');a.href=url;a.download=ref.name||'attachment';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)},
  async exportParts(records){const files={};for(const id of new Set(Object.values(records).flatMap(r=>(r.attachments||[]).flatMap(f=>f.parts||[]))))files[id]=await read(id);return files},
  async importParts(files){for(const [id,payload]of Object.entries(files||{})){if(payload?.kind!=='attachment-chunk'||typeof payload.data!=='string'||payload.data.length>CHUNK*1.34||!/^[A-Za-z0-9+/=]*$/.test(payload.data))throw Error('Invalid file chunk in backup');await write(id,payload)}}
 };
}
