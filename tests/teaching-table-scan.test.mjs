// Dependency-free browser regression tests. Node 22+ and an installed Chromium required.
// All relay requests are mocked; images/PDFs are synthetic. No camera permissions.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root=new URL('../',import.meta.url);
const original=process.env.SCAN_TEST_BASELINE==='1';
const source=original?execFileSync('git',['show','HEAD:apps/teaching-table/v3/index.html'],{cwd:root,encoding:'utf8'}):await readFile(new URL('apps/teaching-table/v3/index.html',root),'utf8');
const init=`
localStorage.clear();
window.__calls=[];window.__responses=[];
window.QRCode={toCanvas:async()=>{}};
customElements.define('math-field',class extends HTMLElement{});
const realFetch=window.fetch;
window.fetch=async(url,options)=>{
 if(String(url).includes('teaching-table-relay.')){
  __calls.push({url:String(url),cache:options?.cache});
  return __responses.length?await __responses.shift()(url,options):new Response(null,{status:204});
 }
 return realFetch(url,options);
};
window.synthetic=()=>{const c=document.createElement('canvas');c.width=80;c.height=100;
const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,80,100);x.fillStyle='black';x.fillText('2 + 3 =',5,30);return c.toDataURL('image/png')};
`;
let extra='';
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/apps/teaching-table/v3/'){
   // Keep tests offline; external libraries are mocked where relevant.
   const html=source.replace(/<script[^>]+src="https:[^"]+"[^>]*><\/script>/g,'').replace(/<link[^>]+href="https:[^>]+>/g,'');
   res.setHeader('Content-Type','text/html');res.end(html.replace('<head>','<head><script>'+init+extra+'</script>'));
  }else{res.end(await readFile(new URL('.'+path,root)));}
 }catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const profile=await mkdtemp(join(tmpdir(),'teaching-scan-test-'));
const browser=spawn(process.env.CHROMIUM||'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let debugPort;
for(let i=0;i<100;i++){
 try{debugPort=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{await new Promise(r=>setTimeout(r,100))}
}
assert.ok(debugPort,'Chromium started');
const tabs=await (await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map();
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(d.error.message)):p.resolve(d.result)}});
const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
const wait=async expr=>{for(let i=0;i<100;i++){if(await evaluate(expr))return;await new Promise(r=>setTimeout(r,40))}throw Error('Timed out: '+expr)};
let pageNumber=0;
async function page(script=''){
 const number=++pageNumber;extra='window.__testPage='+number+';'+script;
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/apps/teaching-table/v3/'});
 await wait('window.__testPage==='+number+'&&typeof window.__table!=="undefined"');
}
const clickScan=()=>evaluate("document.getElementById('openPhone').click()");
after(async()=>{ws.close();browser.kill();server.close();await new Promise(r=>browser.once('exit',r));await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100})});

test('pending upload is fetched without cache; receipt waits for a visible worksheet',async()=>{
 await page();await evaluate('__responses.push(()=>new Response(null,{status:204}),()=>new Response(synthetic()))');await clickScan();
 await wait("!!document.querySelector('img.page-img')");
 assert.equal(await evaluate("document.querySelector('img.page-img').naturalWidth"),80);
 assert.equal(await evaluate("document.getElementById('scan').classList.contains('open')"),false);
 assert.ok(await evaluate('__calls.every(c=>c.cache==="no-store")'));
});
test('unavailable IndexedDB still displays received worksheet and warns about persistence',async()=>{
 await page("Object.defineProperty(window,'indexedDB',{value:{open(){throw Error('Synthetic storage unavailable')}}});");
 await evaluate('__responses.push(()=>new Response(synthetic()))');await clickScan();
 await wait("!!document.querySelector('img.page-img')");
 assert.match(await evaluate("document.getElementById('announce').textContent"),/session.*storage/i);
});
test('failed storage write still displays received worksheet',async()=>{
 await page("const openDB=indexedDB.open.bind(indexedDB);indexedDB.open=(...a)=>{const r=openDB(...a);r.addEventListener('success',()=>{r.result.transaction=()=>{throw Error('Synthetic quota failure')}});return r};");
 await evaluate('__responses.push(()=>new Response(synthetic()))');await clickScan();
 await wait("!!document.querySelector('img.page-img')");
 assert.match(await evaluate("document.getElementById('announce').textContent"),/session/);
});
test('corrupt received image keeps dialog open with an actionable failure',async()=>{
 await page();await evaluate("__responses.push(()=>new Response('data:image/png;base64,YmFk'))");await clickScan();
 await wait("document.getElementById('scanStatus').textContent.includes('JPEG')");
 assert.equal(await evaluate("document.getElementById('scan').classList.contains('open')"),true);
});
test('HTTP, network/CORS and unexpected payload failures remain visible',async()=>{
 for(const response of ["new Response(null,{status:403})","Promise.reject(new TypeError('Synthetic CORS failure'))","new Response('{\"ok\":true}')"]){
  await page();await evaluate('__responses.push(()=>'+response+')');await clickScan();
  await wait("/unavailable|Cannot reach|did not contain/.test(document.getElementById('scanStatus').textContent)");
  assert.equal(await evaluate("document.getElementById('scan').classList.contains('open')"),true);
 }
});
test('slow polls never overlap and closing cancels the request',async()=>{
 await page();await evaluate("__responses.push((url,o)=>new Promise(resolve=>{window.finishPoll=resolve;window.pollSignal=o?.signal}))");await clickScan();
 await new Promise(r=>setTimeout(r,1750));
 assert.equal(await evaluate('__calls.length'),1);
 await evaluate("document.getElementById('scanClose').click()");assert.equal(await evaluate('pollSignal.aborted'),true);
 await evaluate("finishPoll(new Response(synthetic()))");await new Promise(r=>setTimeout(r,100));
 assert.equal(await evaluate("!!document.querySelector('img.page-img')"),false);
});
test('late response from replaced session cannot import into new session',async()=>{
 await page();await evaluate("__responses.push(()=>({ok:true,status:200,text:()=>new Promise(r=>window.finishText=r)}))");await clickScan();await wait('typeof finishText==="function"');
 await clickScan();await evaluate('finishText(synthetic())');await new Promise(r=>setTimeout(r,150));
 assert.equal(await evaluate("!!document.querySelector('img.page-img')"),false);
 assert.notEqual(await evaluate('__calls[0].url'),await evaluate('__calls[1].url'));
});
test('browser image fallback and large photo resizing work without ImageBitmap',async()=>{
 await page('window.createImageBitmap=undefined;');await evaluate("__responses.push(()=>{const c=document.createElement('canvas');c.width=3000;c.height=4000;return new Response(c.toDataURL('image/png'))})");await clickScan();
 await wait("!!document.querySelector('img.page-img')");
 assert.equal(await evaluate("document.querySelector('img.page-img').naturalHeight"),2400);
});
test('missing QR library provides upload link and keeps polling',async()=>{
 await page('window.QRCode=undefined;');await clickScan();
 await wait("document.getElementById('qr').textContent.includes('unavailable')");
 assert.match(await evaluate("document.getElementById('scanLink').href"),/\/u\/[A-Z0-9]+$/);
 assert.equal(await evaluate('__calls.length'),1);
});
test('local synthetic PNG and mocked two-page PDF use existing file selection',async()=>{
 await page();await evaluate(`(async()=>{const b=await (await fetch(synthetic())).blob();const dt=new DataTransfer();dt.items.add(new File([b],'sample.png',{type:'image/png'}));const input=document.getElementById('fileInput');input.files=dt.files;input.dispatchEvent(new Event('change'));})()`);
 await wait("!!document.querySelector('img.page-img')");
 await evaluate(`window.pdfjsLib={GlobalWorkerOptions:{},getDocument:()=>({promise:Promise.resolve({numPages:2,getPage:async()=>({getViewport:({scale})=>({width:80*scale,height:100*scale}),render:()=>({promise:Promise.resolve()})})})})};const dt=new DataTransfer();dt.items.add(new File(['%PDF-synthetic'],'sample.pdf',{type:'application/pdf'}));const input=document.getElementById('fileInput');input.files=dt.files;input.dispatchEvent(new Event('change'));`);
 await wait('__table.doc().pages.length===2');await wait("document.querySelector('img.page-img')?.naturalWidth===240");
});

test('slow image decoding keeps the scan open until the worksheet is rendered',async()=>{
 await page('const bitmap=createImageBitmap;window.createImageBitmap=(...a)=>new Promise(r=>window.finishDecode=()=>bitmap(...a).then(r));');
 await evaluate('__responses.push(()=>new Response(synthetic()))');await clickScan();await wait('typeof finishDecode==="function"');
 assert.equal(await evaluate("document.getElementById('scan').classList.contains('open')"),true);
 assert.match(await evaluate("document.getElementById('scanStatus').textContent"),/Opening/);
 await evaluate('window.createImageBitmap=bitmap;finishDecode()');await wait("!!document.querySelector('img.page-img')");
 assert.equal(await evaluate("document.getElementById('scan').classList.contains('open')"),false);
});
test('mobile dialog fits and keyboard close returns focus to the scan control',async()=>{
 await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:667,deviceScaleFactor:1,mobile:true});
 await page();await clickScan();
 assert.ok(await evaluate("document.querySelector('#scan .card').getBoundingClientRect().width<=innerWidth"));
 assert.equal(await evaluate('document.activeElement.id'),'scanClose');
 await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");
 assert.equal(await evaluate("document.getElementById('scan').classList.contains('open')"),false);
 assert.equal(await evaluate('document.activeElement.id'),'openPhone');
 await cdp('Emulation.clearDeviceMetricsOverride');
});

test('localStorage document-pointer failure reports session-only receipt',async()=>{
 await page("Storage.prototype.setItem=function(){throw new DOMException('Synthetic quota failure','QuotaExceededError')};");
 await evaluate('__responses.push(()=>new Response(synthetic()))');await clickScan();
 await wait("!!document.querySelector('img.page-img')");
 assert.match(await evaluate("document.getElementById('announce').textContent"),/session.*storage/i);
});
const pauseFinalImage=`const NativeImage=Image;let pauseImage=true;window.Image=function(){const img=new NativeImage();
 const onload=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'onload');
 Object.defineProperty(img,'onload',{set(callback){onload.set.call(img,function(event){
  if(pauseImage){pauseImage=false;window.finishFinalImage=()=>callback.call(img,event)}else callback.call(img,event);
 })}});return img};`;
test('closing during final image load leaves the previous document and does not announce receipt',async()=>{
 await page(pauseFinalImage);await evaluate('window.previousDoc=__table.doc();__responses.push(()=>new Response(synthetic()))');await clickScan();
 await wait('typeof finishFinalImage==="function"');await evaluate("document.getElementById('scanClose').click();finishFinalImage()");
 await new Promise(r=>setTimeout(r,100));
 assert.equal(await evaluate('__table.doc()===previousDoc'),true);
 assert.equal(await evaluate("!!document.querySelector('img.page-img')"),false);
 assert.doesNotMatch(await evaluate("document.getElementById('announce').textContent"),/Worksheet open/);
});
test('replacing document during final image load cannot append or announce stale receipt',async()=>{
 await page(pauseFinalImage);await evaluate('__responses.push(()=>new Response(synthetic()))');await clickScan();
 await wait('typeof finishFinalImage==="function"');
 await evaluate(`(async()=>{document.getElementById('scanClose').click();const c=document.createElement('canvas');c.width=123;c.height=100;
 const blob=await new Promise(r=>c.toBlob(r));await __table.openImages([blob]);window.newerDoc=__table.doc();document.getElementById('announce').textContent='Newer document marker';finishFinalImage()})()`);
 await new Promise(r=>setTimeout(r,100));
 assert.equal(await evaluate('__table.doc()===newerDoc'),true);
 assert.equal(await evaluate("document.querySelector('img.page-img').naturalWidth"),123);
 assert.equal(await evaluate("document.getElementById('announce').textContent"),'Newer document marker');
});
