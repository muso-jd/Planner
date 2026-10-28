import test from 'node:test';import assert from 'node:assert/strict';
import {handleHuawei} from '../src/huawei.mjs';import {normalizeHuawei} from '../public/huawei-data.js';import {dailySeries} from '../public/insights.js';import {testServer} from './server.mjs';import {keys} from '../public/core.js';
const env={HUAWEI_CLIENT_ID:'synthetic-client',HUAWEI_CLIENT_SECRET:'synthetic-secret-for-local-tests',HUAWEI_HISTORY_SCOPE:'year'};
const req=(route,body,headers={})=>new Request('https://planner.test/api/huawei/'+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
async function start(){const r=await handleHuawei(req('start',{}),env,'workspace-a');return {data:await r.json(),cookie:r.headers.get('Set-Cookie').split(';')[0]}}
test('Huawei setup is explicit, authenticated and exposes no secret',async()=>{
 const r=await handleHuawei(req('status'),{},'a'),data=await r.json();assert.equal(data.configured,false);assert.deepEqual(data.missing,['HUAWEI_CLIENT_ID','HUAWEI_CLIENT_SECRET']);assert.equal(data.tokens,'browser-session-only');assert.equal((await handleHuawei(req('start',{}),{},'a')).status,503);
 const configured=await(await handleHuawei(req('status'),env,'a')).json();assert(configured.scopes.every(s=>s.endsWith('.read')||s.endsWith('.year')));assert(!JSON.stringify(configured).includes(env.HUAWEI_CLIENT_SECRET));
 const {server,url,db}=await testServer();try{assert.equal((await fetch(url+'/api/huawei/status')).status,401);const k=await keys('test'.repeat(10)+'abc'),headers={Authorization:'Bearer '+k.auth};assert.equal((await fetch(url+'/api/huawei/status',{headers})).status,404);const id=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(k.auth))).toString('hex');db.prepare("INSERT INTO vaults VALUES(?,0,'','','')").run(id);assert.equal((await fetch(url+'/api/huawei/status',{headers:{...headers,Origin:'https://evil.test'}})).status,403);assert.equal((await(await fetch(url+'/api/huawei/status',{headers})).json()).configured,false)}finally{server.close()}
});
test('Huawei OAuth binds signed state to workspace, cookie, origin and expiry; secrets are server-only',async()=>{
 const {data,cookie}=await start(),url=new URL(data.url);assert.equal(url.origin,'https://oauth-login.cloud.huawei.com');assert.equal(url.searchParams.get('redirect_uri'),'https://planner.test/integrations/huawei/callback');assert.equal(url.searchParams.get('access_type'),'offline');assert(!data.url.includes(env.HUAWEI_CLIENT_SECRET));let calls=0;
 const send=async(url,options)=>{calls++;assert.equal(url,'https://oauth-login.cloud.huawei.com/oauth2/v3/token');assert.equal(options.redirect,'manual');assert.equal(options.body.get('client_secret'),env.HUAWEI_CLIENT_SECRET);return Response.json({access_token:'synthetic-access',refresh_token:'synthetic-refresh',expires_in:3600,scope:'synthetic-scope',id_token:'unneeded-id-token'})};
 for(const [state,headers,workspace]of [[data.state,{},'workspace-a'],[data.state,{Cookie:cookie},'workspace-b'],[data.state.slice(0,-3)+'zzz',{Cookie:cookie},'workspace-a']])assert.equal((await handleHuawei(req('exchange',{code:'code',state},headers),env,workspace,send)).status,403);
 const old=Date.now;Date.now=()=>old()+700000;try{assert.equal((await handleHuawei(req('exchange',{code:'code',state:data.state},{Cookie:cookie}),env,'workspace-a',send)).status,403)}finally{Date.now=old}
 assert.equal(calls,0);const r=await handleHuawei(req('exchange',{code:'code',state:data.state},{Cookie:cookie}),env,'workspace-a',send);assert.equal(r.status,200);assert.match(r.headers.get('Set-Cookie'),/Max-Age=0/);const t=await r.json();assert.equal(t.accessToken,'synthetic-access');assert.equal(t.id_token,undefined);assert.equal(calls,1);
});
test('Huawei gateway has a fixed read-only endpoint and safe regional routing',async()=>{
 const now=Date.now(),payload={metric:'restingHeartRate',startTime:now-3600000,endTime:now},headers={'X-Huawei-Access-Token':'synthetic-access'};let calls=[];
 const send=async(url,options)=>{calls.push(url);assert.equal(options.headers.Authorization,'Bearer synthetic-access');assert.equal(options.method,'POST');assert.equal(options.redirect,'manual');assert.equal(JSON.parse(options.body).polymerizeWith[0].dataTypeName,'com.huawei.instantaneous.resting_heart_rate');return calls.length===1?new Response('{}',{status:403,headers:{Location:'https://health-api.cloud.huawei.eu/healthkit/v2/sampleSet:polymerize'}}):Response.json({group:[]})};
 const r=await handleHuawei(req('read',payload,headers),env,'a',send);assert.equal(r.status,200);assert.deepEqual(calls,['https://health-api.cloud.huawei.com/healthkit/v2/sampleSet:polymerize','https://health-api.cloud.huawei.eu/healthkit/v2/sampleSet:polymerize']);
 let count=0;const hostile=async()=>{count++;return new Response('{}',{status:403,headers:{Location:'https://evil.test/healthkit/v2/sampleSet:polymerize'}})};assert.equal((await handleHuawei(req('read',payload,headers),env,'a',hostile)).status,403);assert.equal(count,1);
 for(const bad of [{...payload,metric:'constructor'},{...payload,metric:'__proto__'},{...payload,metric:'https://evil.test'},{...payload,endTime:now+86400000},{...payload,startTime:'2026-10-01'}])assert.equal((await handleHuawei(req('read',bad,headers),env,'a',()=>{throw Error('should not call')})).status,400);
 assert.equal((await handleHuawei(req('read',payload),env,'a')).status,401);assert.equal((await handleHuawei(req('read',payload,headers),env,'a',async()=>Response.json({group:[],nextPageToken:'not-handled'}))).status,502);
});
test('Huawei refresh errors and provider payloads never expose secrets in errors',async()=>{
 const r=await handleHuawei(req('refresh',{refreshToken:'synthetic-refresh'}),env,'a',async()=>Response.json({error:'upstream-secret:'+env.HUAWEI_CLIENT_SECRET},{status:400}));assert.equal(r.status,502);assert(!JSON.stringify(await r.json()).includes(env.HUAWEI_CLIENT_SECRET));
});
const from=Date.parse('2026-10-28T00:00:00Z'),to=from+86400000;
const point=(type,field,value,at=from+3600000)=>({dataTypeName:type,startTime:String(BigInt(at)*1000000n),endTime:String(BigInt(at)*1000000n),value:[{fieldName:field,floatValue:value}]});
const wrap=points=>({group:[{sampleSet:[{dataCollectorId:'synthetic-collector',samplePoints:points}]}]});
test('Huawei normalization separates scales, rejects invalid data, deduplicates and retains stable identities',async()=>{
 const p=point('com.huawei.instantaneous.heart_rate','bpm',60),q=point('com.huawei.instantaneous.heart_rate','bpm',100,from+7200000),bad=point('com.huawei.instantaneous.heart_rate','bpm',0);
 const r=await normalizeHuawei(wrap([p,p,q,bad]),'heartRate',from,to);assert.equal(r.records.length,1);assert.equal(r.duplicates,1);assert.equal(r.rejected,1);assert.equal(r.records[0].value,80);assert.equal(r.records[0].sampleCount,2);assert.equal(r.records[0].metric,'heartRate');assert.equal(r.records[0].min,60);assert.equal(r.records[0].max,100);
 const cases=[['restingHeartRate','com.huawei.instantaneous.resting_heart_rate','bpm',55],['huaweiStress','com.huawei.instantaneous.stress','score',70],['oxygenSaturation','com.huawei.instantaneous.spo2','saturation',98],['weight','com.huawei.instantaneous.body_weight','body_weight',88]];
 for(const [metric,type,field,value]of cases){const a=await normalizeHuawei(wrap([point(type,field,value)]),metric,from,to);assert.equal(a.records[0].value,value);assert.equal(a.records[0].source,'huawei-health');assert.equal(a.records[0].metric,metric);const b=await normalizeHuawei(wrap([point(type,field,value+1)]),metric,from,to);assert.equal(a.records[0].id,b.records[0].id)}
 const stress=(await normalizeHuawei(wrap([point('com.huawei.instantaneous.stress','score',70)]),'huaweiStress',from,to)).records[0];const series=dailySeries({a:stress,b:{type:'health',metric:'stress',value:3,date:stress.date}},[stress.date]);assert.equal(series[0].stress,3);assert.equal(series[0].huaweiStress,70);
 assert.deepEqual((await normalizeHuawei(wrap([]),'weight',from,to)).records,[]);
});
test('Huawei sleep stages preserve durations, clip calendar boundaries and exclude awake from sleep totals',async()=>{
 const stage=(s,start,end)=>({...point('com.huawei.continuous.sleep.fragment','sleep_state',s,start),endTime:String(BigInt(end)*1000000n)});
 const r=await normalizeHuawei(wrap([stage(1,from-3600000,from+3600000),stage(1,from,from+3600000),stage(3,from+3600000,from+7200000),stage(4,from+7200000,from+9000000)]),'huaweiSleepStage',from,to);
 assert.equal(r.records.length,3);assert.equal(r.records[0].value,60);assert.equal(r.records[0].stage,'LIGHT');assert.equal(r.records[2].stage,'AWAKE');
 const records=Object.fromEntries(r.records.map(r=>[r.id,r])),rows=dailySeries(records,[r.records[0].date]);assert.equal(rows[0].huaweiSleep,2);assert.equal(rows[0].sleep,null);
 await assert.rejects(()=>normalizeHuawei(wrap([stage(1,from,from+7200000),stage(3,from+3600000,from+7200000)]),'huaweiSleepStage',from,to),/Conflicting/);
});

test('Huawei authorization requests only selected data scopes',async()=>{const r=await handleHuawei(req('start',{metrics:['weight']}),{...env,HUAWEI_HISTORY_SCOPE:''},'workspace-a');const data=await r.json();assert.equal(new URL(data.url).searchParams.get('scope'),'https://www.huawei.com/healthkit/heightweight.read');assert.equal((await handleHuawei(req('start',{metrics:['constructor']}),env,'workspace-a')).status,400);assert.equal((await handleHuawei(req('start',{metrics:[]}),env,'workspace-a')).status,400)});
