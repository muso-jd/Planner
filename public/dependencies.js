import {esc,safeColor} from './core.js';
export const workItem=r=>!!r&&!r.deleted&&['task','goal','project'].includes(r.type);
export function children(records,r){return Object.values(records).filter(x=>workItem(x)&&(r.type==='task'?x.type==='task'&&x.parent===r.id:x.project===r.id));}
export function requirements(records,r){return [...new Set([...(r.deps||[]),...children(records,r).map(x=>x.id)])];}
// Build once per record revision, keeping large imported Health histories out of graph scans.
export function createWorkModel(records){
 const items=Object.values(records).filter(workItem),childMap=new Map(items.map(r=>[r.id,[]])),cache=new Map();
 for(const r of items){if(r.type==='task'&&records[r.parent]?.type==='task')childMap.get(r.parent)?.push(r);if(['goal','project'].includes(records[r.project]?.type))childMap.get(r.project)?.push(r);}
 function state(id,path=new Set()){
  const r=records[id];if(!workItem(r))return {done:false,blocked:true,progress:0,status:'Missing'};
  if(path.has(id))return {done:false,blocked:true,progress:0,status:'Cycle'};
  if(cache.has(id))return cache.get(id);
  const next=new Set([...path,id]),kids=childMap.get(id)||[],ids=[...new Set([...(r.deps||[]),...kids.map(k=>k.id)])],states=ids.map(n=>state(n,next));
  const blocked=states.some(s=>!s.done)||(r.type==='task'&&(Number(r.availableBudget||0)<Number(r.cost||0)||(r.availableMinutes!==undefined&&r.availableMinutes!==''&&Number(r.availableMinutes)<Number(r.minutes||0))));
  const done=!blocked&&(r.type==='task'?!!r.done:kids.length>0);
  const progress=kids.length?kids.reduce((n,k)=>n+state(k.id,next).progress,0)/kids.length:(done?100:0);
  const result={done,blocked,progress,status:done?'Complete':blocked?'Blocked':r.type!=='task'&&!kids.length?'Empty':'Ready'};cache.set(id,result);return result;
 }return {state};
}
export function workState(records,id){return createWorkModel(records).state(id);}
export function dependencyCycle(records,candidate){
 const next={...records,[candidate.id]:candidate},visiting=new Set(),visited=new Set();
 function visit(id){if(visiting.has(id))return true;if(visited.has(id)||!workItem(next[id]))return false;visiting.add(id);if(requirements(next,next[id]).some(visit))return true;visiting.delete(id);visited.add(id);return false;}
 return visit(candidate.id);
}
export function createDependencies(api){
 let layout='graph',type='all',status='all',project='',query='',focus='',direction='both';
 const opts=(items,value)=>items.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('');
 function view(){
 const records=api.records(),all=Object.values(records).filter(workItem),model=createWorkModel(records),states=Object.fromEntries(all.map(r=>[r.id,model.state(r.id)]));
 const edges=all.flatMap(r=>requirements(records,r).map(id=>({from:id,to:r.id,contained:children(records,r).some(c=>c.id===id)})));
 const lit=new Set();function trace(id,reverse){if(lit.has((reverse?'u:':'d:')+id))return;lit.add((reverse?'u:':'d:')+id);lit.add(id);for(const e of edges)if((reverse?e.to:e.from)===id)trace(reverse?e.from:e.to,reverse)}
 if(focus){if(direction!=='downstream')trace(focus,true);if(direction!=='upstream')trace(focus,false);lit.add(focus)}
 const belongs=(r,id,seen=new Set())=>{if(!r||seen.has(r.id))return false;if(r.id===id)return true;seen.add(r.id);return belongs(records[r.project],id,seen)||belongs(records[r.parent],id,seen)};
 const visible=all.filter(r=>(type==='all'||r.type===type)&&(status==='all'||states[r.id].status.toLowerCase()===status)&&(!project||belongs(r,project))&&(r.title||'').toLowerCase().includes(query.toLowerCase()));
 const cls=r=>focus?(lit.has(r.id)?'dep-highlight':'dep-muted'):'';
 const label=r=>`<button class="link-button" data-edit="${esc(r.id)}">${api.entryTitle(r)}</button>`;
 const summary=r=>`${r.type} · ${states[r.id].status} · ${Math.round(states[r.id].progress)}%`;
 const row=r=>`<article class="dep-row ${cls(r)}" style="--dep-accent:${api.entryColor(r)}">${label(r)}<small>${summary(r)}</small><button data-dep-focus="${esc(r.id)}" aria-label="Highlight ${esc(r.title)}">Highlight chain</button><p class="subtle">Requires: ${requirements(records,r).map(id=>esc(records[id]?.title||'Missing prerequisite')).join(', ')||'None'}</p></article>`;
 let body='';
 if(layout==='graph'){
 const positions={},levels={};const depth=(id,seen=new Set())=>seen.has(id)?0:Math.min(12,Math.max(0,...requirements(records,records[id]).filter(n=>workItem(records[n])).map(n=>1+depth(n,new Set([...seen,id])))));
 for(const r of visible){const d=depth(r.id),i=levels[d]||0;levels[d]=i+1;positions[r.id]={x:d*260+12,y:i*98+12};}
 const w=Math.max(280,...Object.values(positions).map(p=>p.x+250)),h=Math.max(110,...Object.values(positions).map(p=>p.y+90));
 body=`<div class="dependency-scroll"><svg class="dependency-map" width="${w}" height="${h}" role="group" aria-label="Dependency graph"><defs><marker id="dep-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor"/></marker></defs>${edges.filter(e=>positions[e.from]&&positions[e.to]).map(e=>{const a=positions[e.from],b=positions[e.to];return `<path class="dep-edge ${focus&&(!lit.has(e.from)||!lit.has(e.to))?'dep-muted':''}" d="M${a.x+230},${a.y+34} C${a.x+255},${a.y+34} ${b.x-25},${b.y+34} ${b.x},${b.y+34}" stroke="${safeColor(api.entryColor(records[e.to]))||'#b8a0ff'}" stroke-dasharray="${e.contained?'5 4':'none'}" marker-end="url(#dep-arrow)"/>`}).join('')}${visible.map(r=>{const p=positions[r.id];return `<g class="dep-node ${cls(r)}" role="button" tabindex="0" aria-label="Highlight ${esc(r.title)}" data-dep-focus="${esc(r.id)}" transform="translate(${p.x},${p.y})"><rect width="230" height="72" rx="12" style="stroke:${api.entryColor(r)}"/><text x="12" y="26">${esc(r.title.slice(0,27))}</text><text x="12" y="51" class="dep-detail">${summary(r)}</text><title>${esc(r.title)} · ${summary(r)}</title></g>`}).join('')}</svg></div><p class="subtle">Arrows point from prerequisite to dependent. Dashed links are contained work. Select a node to highlight its chain; use Open highlighted item to edit.</p>`;
 }else if(layout==='board')body=`<div class="dependency-board">${['Ready','Blocked','Complete','Empty'].map(s=>`<section><h3>${s}</h3>${visible.filter(r=>states[r.id].status===s).map(row).join('')||'<p class="subtle">No items</p>'}</section>`).join('')}</div>`;
 else if(layout==='table')body=`<div class="dependency-scroll"><table><thead><tr><th>Item</th><th>Type</th><th>Status</th><th>Progress</th><th>Required work</th><th>Highlight</th></tr></thead><tbody>${visible.map(r=>`<tr class="${cls(r)}"><td>${label(r)}</td><td>${r.type}</td><td>${states[r.id].status}</td><td>${Math.round(states[r.id].progress)}%</td><td>${requirements(records,r).map(id=>esc(records[id]?.title||'Missing prerequisite')).join(', ')||'None'}</td><td><button data-dep-focus="${esc(r.id)}">Highlight</button></td></tr>`).join('')}</tbody></table></div>`;
 else {const ids=new Set(visible.map(r=>r.id)),seen=new Set();const branch=(r,path=new Set())=>{if(path.has(r.id))return '';seen.add(r.id);const kids=children(records,r).filter(x=>ids.has(x.id));return `<div class="dep-branch">${row(r)}${kids.map(k=>branch(k,new Set([...path,r.id]))).join('')}</div>`};body=visible.filter(r=>!visible.some(p=>children(records,p).some(k=>k.id===r.id))).map(r=>branch(r)).join('');body+=visible.filter(r=>!seen.has(r.id)).map(r=>branch(r)).join('');}
 return `<section class="card span12 dependency-explorer"><h2>See what unlocks what.</h2><div class="toolbar" role="group" aria-label="Dependency views">${['graph','outline','board','table'].map(l=>`<button data-dep-layout="${l}" aria-pressed="${layout===l}">${l[0].toUpperCase()+l.slice(1)}</button>`).join('')}</div><div class="dependency-filters"><label>Search dependencies<input id="depSearch" value="${esc(query)}" placeholder="Search titles"></label><label>Item type<select id="depType">${opts(['all','task','goal','project'].map(x=>[x,x]),type)}</select></label><label>Status<select id="depStatus">${opts(['all','ready','blocked','complete','empty'].map(x=>[x,x]),status)}</select></label><label>Project / goal<select id="depProject">${opts([['','All projects / goals'],...all.filter(r=>r.type!=='task').map(r=>[r.id,r.title])],project)}</select></label><label>Highlight direction<select id="depDirection">${opts([['both','Full chain'],['upstream','Prerequisites'],['downstream','Dependents']],direction)}</select></label></div><p class="subtle">${visible.length} of ${all.length} items · ${focus?esc(records[focus]?.title||'Missing item'):'Select Highlight chain to trace related work.'}</p>${focus?`<div class="toolbar"><button data-edit="${esc(focus)}">Open highlighted item</button><button data-dep-clear>Clear highlight</button></div>`:''}${visible.length?body:api.empty('No items match these filters.')}</section>`;
 }
 document.addEventListener('click',e=>{const el=e.target.closest('[data-dep-layout],[data-dep-focus],[data-dep-clear]');if(!el)return;if(el.dataset.depLayout)layout=el.dataset.depLayout;if(el.dataset.depFocus)focus=el.dataset.depFocus;if(el.hasAttribute('data-dep-clear'))focus='';api.render()});
 document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('.dep-node')){e.preventDefault();focus=e.target.dataset.depFocus;api.render()}});
 document.addEventListener('change',e=>{switch(e.target.id){case 'depSearch':query=e.target.value;break;case 'depType':type=e.target.value;break;case 'depStatus':status=e.target.value;break;case 'depProject':project=e.target.value;break;case 'depDirection':direction=e.target.value;break;default:return}api.render()});
 return {view};
}
