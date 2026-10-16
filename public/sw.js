// Cache only this public app shell. API responses and external services bypass it.
const CACHE='life-planner-shell-2.3.1';
const SHELL=['/','/index.html','/style.css','/app.js','/core.js','/pwa.js','/manifest.webmanifest','/fonts/noto-sans-mono.woff','/icons/life-192.png','/icons/life-512.png','/icons/life-maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(path=>new Request(path,{cache:'reload'}))))));
// A new shell activates after all old app windows close; never force a reload during editing.
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('life-planner-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!SHELL.includes(url.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(url.pathname)||fetch(event.request)})());
});
