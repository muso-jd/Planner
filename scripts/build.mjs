import fs from 'node:fs';
const assets={};for(const [file,type] of [['index.html','text/html; charset=utf-8'],['app.js','text/javascript; charset=utf-8'],['core.js','text/javascript; charset=utf-8'],['style.css','text/css; charset=utf-8']])assets['/'+file]=[type,fs.readFileSync('public/'+file,'utf8')];
assets['/fonts/noto-sans-mono.woff']=['font/woff',fs.readFileSync('public/fonts/noto-sans-mono.woff.base64','utf8').trim(),'base64'];
fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/worker.mjs',fs.readFileSync('src/worker.mjs','utf8').replace('__ASSETS__',()=>JSON.stringify(assets)));
