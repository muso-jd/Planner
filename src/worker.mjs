// Client assets are embedded at build time; personal data is never bundled.
const ASSETS = __ASSETS__;
const secureHeaders = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer', 'X-Frame-Options':'DENY', 'Permissions-Policy':'camera=(), microphone=(), geolocation=()' };
const json=(data,status=200)=>Response.json(data,{status,headers:secureHeaders});
async function hash(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('')}
export default {async fetch(request,env){
 try {
 const url=new URL(request.url);
 if(url.pathname==='/api/health')return json({ok:true,version:'2.1.0',storage:!!env.DB});
 if(url.pathname.startsWith('/api/')){
  if(!env.DB)return json({error:'Cloud storage is unavailable'},503);
  if(request.headers.get('Origin') && request.headers.get('Origin')!==url.origin)return json({error:'Origin rejected'},403);
  const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
  if(!/^[A-Za-z0-9_-]{43}$/.test(token))return json({error:'Workspace key required'},401);
  const id=await hash(token);
  if(url.pathname==='/api/vault' && request.method==='GET'){
   const row=await env.DB.prepare('SELECT rev,data,iv,updated FROM vaults WHERE id=?').bind(id).first();return row?json(row):json({error:'Workspace not found'},404);
  }
  if(url.pathname==='/api/history' && request.method==='GET'){
   const rows=await env.DB.prepare('SELECT rev,updated FROM history WHERE id=? ORDER BY rev DESC LIMIT 30').bind(id).all();return json(rows.results);
  }
  if(url.pathname==='/api/vault' && request.method==='PUT'){
   const raw=await request.text();if(raw.length>5000000)return json({error:'Workspace exceeds 5 MB; export and archive older records'},413);
   let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
   if(!Number.isSafeInteger(b.rev)||b.rev<0||typeof b.data!=='string'||!/^[A-Za-z0-9+/=]+$/.test(b.data)||b.data.length<20||typeof b.iv!=='string'||!/^[A-Za-z0-9+/]{16}$/.test(b.iv))return json({error:'Invalid encrypted envelope'},400);
   const now=new Date().toISOString();
   const results=await env.DB.batch([
    env.DB.prepare('UPDATE vaults SET rev=rev+1,data=?,iv=?,updated=? WHERE id=? AND rev=? RETURNING rev').bind(b.data,b.iv,now,id,b.rev),
    env.DB.prepare('INSERT OR IGNORE INTO history SELECT id,rev,data,iv,updated FROM vaults WHERE id=? AND changes()=1').bind(id)
   ]);
   if(!results[0].results.length)return json({error:'Revision changed; merge before retrying'},409);
   return json({rev:results[0].results[0].rev,updated:now});
  }
  return json({error:'Not found'},404);
 }
 const path=url.pathname==='/'?'/index.html':url.pathname;
 if(!ASSETS[path])return new Response('Not found',{status:404,headers:secureHeaders});
 const [type,body]=ASSETS[path];return new Response(body,{headers:{...secureHeaders,'Content-Type':type,'Content-Security-Policy':"default-src 'self'; script-src 'self' https://accounts.google.com; connect-src 'self' https://www.googleapis.com https://tasks.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'self'",'Cross-Origin-Opener-Policy':'same-origin-allow-popups'}});
 } catch(e){return json({error:'Request failed; local changes remain on this device'},500)}
}};
