// Read-only Huawei gateway. Credentials never enter the public asset bundle.
const hHeaders={'Cache-Control':'no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const hJson=(data,status=200,extra={})=>Response.json(data,{status,headers:{...hHeaders,...extra}});
const hTypes={heartRate:'com.huawei.instantaneous.heart_rate',huaweiSleepStage:'com.huawei.continuous.sleep.fragment',weight:'com.huawei.instantaneous.body_weight',restingHeartRate:'com.huawei.instantaneous.resting_heart_rate',huaweiStress:'com.huawei.instantaneous.stress',oxygenSaturation:'com.huawei.instantaneous.spo2'};
const hMetricScopes={huaweiSleepStage:'sleep.read',heartRate:'heartrate.read',restingHeartRate:'heartrate.read',huaweiStress:'stress.read',oxygenSaturation:'oxygensaturation.read',weight:'heightweight.read'};
const hBaseScopes=['heartrate.read','heightweight.read','stress.read','oxygensaturation.read','sleep.read'];
const hCallback='/integrations/huawei/callback';
const hCookie='__Host-planner-huawei';
const hEncode=s=>btoa(s).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const hDecode=s=>atob(s.replaceAll('-','+').replaceAll('_','/'));
async function hKey(secret){return crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function hState(secret,payload){const data=hEncode(JSON.stringify(payload)),sig=new Uint8Array(await crypto.subtle.sign('HMAC',await hKey(secret),new TextEncoder().encode(data)));return data+'.'+hEncode(String.fromCharCode(...sig))}
async function hVerify(secret,state){try{const [data,sig,...extra]=state.split('.');if(extra.length||!data||!sig)return null;const valid=await crypto.subtle.verify('HMAC',await hKey(secret),Uint8Array.from(hDecode(sig),c=>c.charCodeAt(0)),new TextEncoder().encode(data));return valid?JSON.parse(hDecode(data)):null}catch{return null}}
async function hBody(request,max=20000){const text=await hText(request,max);return JSON.parse(text)}
async function hText(message,max){const reader=message.body?.getReader();if(!reader)return '';const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Error('Response too large; choose a shorter period.')}chunks.push(value)}}finally{reader.releaseLock()}const bytes=new Uint8Array(size);let i=0;for(const c of chunks){bytes.set(c,i);i+=c.length}return new TextDecoder().decode(bytes)}
function hConfig(env){const missing=['HUAWEI_CLIENT_ID','HUAWEI_CLIENT_SECRET'].filter(k=>!env[k]);const history=['week','month','year'].includes(env.HUAWEI_HISTORY_SCOPE)?env.HUAWEI_HISTORY_SCOPE:'';return {configured:!missing.length,missing,history,scopes:[...hBaseScopes.map(s=>'https://www.huawei.com/healthkit/'+s),...(history?['https://www.huawei.com/healthkit/historydata.open.'+history]:[])]}}
function hCleanToken(data){if(typeof data.access_token!=='string'||!data.access_token||data.access_token.length>16000||!Number.isFinite(Number(data.expires_in))||Number(data.expires_in)<=0)throw Error('Huawei returned an invalid token response.');return {accessToken:data.access_token,refreshToken:typeof data.refresh_token==='string'?data.refresh_token:'',expiresIn:Number(data.expires_in),scope:typeof data.scope==='string'?data.scope:''}}
async function hToken(env,fields,send){const response=await send('https://oauth-login.cloud.huawei.com/oauth2/v3/token',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.HUAWEI_CLIENT_ID,client_secret:env.HUAWEI_CLIENT_SECRET,...fields})});const data=JSON.parse(await hText(response,64000));if(!response.ok||data.error)throw Error('Huawei authorization failed. Check app permissions and reconnect.');return hCleanToken(data)}
export async function handleHuawei(request,env,workspace,send=fetch){
 const url=new URL(request.url),route=url.pathname.slice('/api/huawei/'.length),config=hConfig(env);
 if(route==='status'&&request.method==='GET')return hJson({...config,callbackUrl:url.origin+hCallback,mode:'read-only',tokens:'browser-session-only'});
 if(!config.configured)return hJson({error:'Huawei connection needs server setup.',missing:config.missing},503);
 if(request.method!=='POST')return hJson({error:'Method not allowed'},405,{'Allow':'POST'});
 const cookieValue=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(hCookie+'='))?.slice(hCookie.length+1)||'';
 const clearCookie=`${hCookie}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
 try{
  if(route==='start'){
   const body=await hBody(request);const metrics=body.metrics??Object.keys(hTypes);if(!Array.isArray(metrics)||!metrics.length||metrics.length>6||metrics.some(m=>!Object.hasOwn(hTypes,m)))return hJson({error:'Choose supported Huawei metrics.'},400);const scopes=[...new Set(metrics.map(m=>'https://www.huawei.com/healthkit/'+hMetricScopes[m])),...(config.history?['https://www.huawei.com/healthkit/historydata.open.'+config.history]:[])];
   const state=await hState(env.HUAWEI_CLIENT_SECRET,{workspace,origin:url.origin,nonce:crypto.randomUUID(),expires:Date.now()+600000});
   const auth=new URL('https://oauth-login.cloud.huawei.com/oauth2/v3/authorize');auth.search=new URLSearchParams({response_type:'code',client_id:env.HUAWEI_CLIENT_ID,redirect_uri:url.origin+hCallback,scope:scopes.join(' '),access_type:'offline',state}).toString();
   return hJson({url:auth.href,state},200,{'Set-Cookie':`${hCookie}=${state}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`});
  }
  const body=await hBody(request);
  if(route==='exchange'){
   if(typeof body.state!=='string'||body.state!==cookieValue||body.state.length>2000)return hJson({error:'Huawei sign-in state is invalid. Start again.'},403,{'Set-Cookie':clearCookie});
   const state=await hVerify(env.HUAWEI_CLIENT_SECRET,body.state);
   if(!state||state.workspace!==workspace||state.origin!==url.origin||state.expires<Date.now()||state.expires>Date.now()+600000)return hJson({error:'Huawei sign-in state expired or belongs to another workspace.'},403,{'Set-Cookie':clearCookie});
   if(typeof body.code!=='string'||!body.code||body.code.length>10000)return hJson({error:'Huawei authorization code is missing.'},400,{'Set-Cookie':clearCookie});
   const token=await hToken(env,{grant_type:'authorization_code',code:body.code,redirect_uri:url.origin+hCallback},send);return hJson(token,200,{'Set-Cookie':clearCookie});
  }
  if(route==='refresh'){
   if(typeof body.refreshToken!=='string'||!body.refreshToken||body.refreshToken.length>16000)return hJson({error:'Reconnect Huawei Health.'},400);
   return hJson(await hToken(env,{grant_type:'refresh_token',refresh_token:body.refreshToken},send));
  }
  if(route==='read'){
   const type=Object.hasOwn(hTypes,body.metric)?hTypes[body.metric]:null,start=body.startTime,end=body.endTime;
   if(!type||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<Date.UTC(2000,0,1)||end<=start||end-start>86400000||end>Date.now()+86400000)return hJson({error:'Choose a supported Huawei metric and a time window of at most one day.'},400);
   const access=request.headers.get('X-Huawei-Access-Token');if(!access||access.length>16000||/[\r\n]/.test(access))return hJson({error:'Connect Huawei Health first.'},401);
   const endpoint='/healthkit/v2/sampleSet:polymerize';const payload=JSON.stringify({polymerizeWith:[{dataTypeName:type}],startTime:start,endTime:end});
   const options={method:'POST',redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json','Authorization':'Bearer '+access,'x-client-id':env.HUAWEI_CLIENT_ID,'x-version':'6.26.6.200','x-caller-trace-id':crypto.randomUUID()},body:payload};
   let response=await send('https://health-api.cloud.huawei.com'+endpoint,options);
   // Huawei documents a regional 403 Location. Only the same endpoint on its EU host is allowed.
   if(response.status===403&&response.headers.get('Location')){const location=new URL(response.headers.get('Location'));if(location.origin==='https://health-api.cloud.huawei.eu'&&location.pathname===endpoint&&!location.search&&!location.hash&&!location.username&&!location.password){await response.body?.cancel();response=await send(location.href,{...options,signal:AbortSignal.timeout(20000)})}}
   if(!response.ok){await response.body?.cancel();return hJson({error:response.status===401?'Huawei session expired. Reconnect.':response.status===403?'Huawei denied access. Check approved scopes, history permission and Huawei Health data-sharing authorization.':'Huawei data request failed. Try again later.',upstreamStatus:response.status},response.status===401?401:response.status===403?403:502)}
   const data=JSON.parse(await hText(response,2000000));if(!Array.isArray(data.group)||data.nextPageToken||data.pageToken)return hJson({error:'Huawei returned an unsupported response; no import was applied.'},502);
   return hJson(data);
  }
  return hJson({error:'Not found'},404);
 }catch{return hJson({error:'Huawei request failed. Check configuration or reconnect; no data was imported.'},502,route==='exchange'?{'Set-Cookie':clearCookie}:{});}
}
