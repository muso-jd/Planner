const params=new URLSearchParams(location.search),message={type:'planner-huawei-auth',code:params.get('code')||'',state:params.get('state')||'',error:params.has('error')?'Huawei authorization was declined.':''};
history.replaceState(null,'',location.pathname);
const result=document.querySelector('#result');
if(message.state&&typeof BroadcastChannel==='function'){
 const channel=new BroadcastChannel('planner-huawei-'+message.state);
 channel.onmessage=event=>{if(event.data?.type==='planner-huawei-complete'&&event.data.state===message.state){result.textContent='Connected. You can close this window.';channel.close();window.close()}};
 channel.postMessage(message);result.textContent='Return to Planner to finish connecting. If the sign-in expired, close this window and connect again.';
}else result.textContent='Return to the Planner window that started this connection. If it is unavailable, close this window and connect again.';
if(window.opener)window.opener.postMessage(message,location.origin);
