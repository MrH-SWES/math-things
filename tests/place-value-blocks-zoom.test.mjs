// Dependency-free browser regression tests for Place Value Blocks mat zoom, embedded in an iframe
// the way Teaching Table V3 opens it. Node 22+ and an installed Chromium required (CHROMIUM=/path to override).
// Offline: external fonts are stripped; all input is synthetic CDP mouse/touch/keyboard events.
import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root=new URL('../',import.meta.url);
// The frame sits away from the top-left corner so frame and page coordinates differ.
const FX=100,FY=80,FW=900,FH=640;
const host=`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#ddd"><iframe id="app" src="/apps/place-value-blocks/" title="Place Value Blocks"
style="position:absolute;left:${FX}px;top:${FY}px;width:${FW}px;height:${FH}px;border:0"></iframe></body></html>`;
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/host.html'){res.setHeader('Content-Type','text/html');res.end(host);return}
  let body=await readFile(new URL('.'+(path.endsWith('/')?path+'index.html':path),root));
  if(path.endsWith('/')){res.setHeader('Content-Type','text/html');body=String(body).replace(/<link[^>]+href="https:[^>]+>/g,'')}
  else if(path.endsWith('.js'))res.setHeader('Content-Type','text/javascript');
  res.end(body);
 }catch{res.statusCode=404;res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const profile=await mkdtemp(join(tmpdir(),'pvb-zoom-test-'));
const browser=spawn(process.env.CHROMIUM||'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let browserErrors='';browser.stderr.on('data',chunk=>{browserErrors=(browserErrors+chunk).slice(-8000)});
let debugPort;
for(let i=0;i<100;i++){
 try{debugPort=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{await new Promise(r=>setTimeout(r,100))}
}
if(!debugPort){browser.kill();server.close();throw Error('Chromium failed to start: '+browserErrors)}
const tabs=await (await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map();
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(d.error.message)):p.resolve(d.result)}});
const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
// Evaluate inside the embedded app (same origin), with w = its window and d = its document.
const app=expr=>evaluate(`(()=>{const w=document.getElementById('app').contentWindow,d=w.document;return (${expr})})()`);
const wait=async expr=>{for(let i=0;i<100;i++){if(await app(expr))return;await new Promise(r=>setTimeout(r,40))}throw Error('Timed out: '+expr)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
after(async()=>{ws.close();browser.kill();server.close();await new Promise(r=>browser.once('exit',r));await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100})});

const view=async()=>{const [x,y,s]=(await app("d.getElementById('layer').getAttribute('transform')")).match(/-?[\d.]+/g).map(Number);return {x,y,s}};
const trainCount=()=>app("d.querySelectorAll('#layer .train, #carry .train').length");
// a train's on-screen box, in page coordinates
const box=async(n=0)=>{const r=await app(`(()=>{const r=d.querySelectorAll('#layer .train, #carry .train')[${n}].getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}})()`);
 return {l:r.l+FX,t:r.t+FY,r:r.r+FX,b:r.b+FY,cx:(r.l+r.r)/2+FX,cy:(r.t+r.b)/2+FY}};
const rect=async sel=>{const r=await app(`(()=>{const r=d.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {l:r.left,t:r.top,w:r.width,h:r.height}})()`);
 return {...r,cx:r.l+r.w/2+FX,cy:r.t+r.h/2+FY}};
const mouse=(type,x,y,extra={})=>cdp('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:1,...extra});
const click=async(x,y)=>{await mouse('mousePressed',x,y);await mouse('mouseReleased',x,y)};
const wheel=(x,y,deltaY,modifiers=0)=>cdp('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:0,deltaY,modifiers});
const touch=(type,points)=>cdp('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y],id)=>({x,y,id}))});
const hostScale=()=>evaluate('[visualViewport.scale,devicePixelRatio,innerWidth]');
// The page-level mat point currently drawn under page point (px, py), in mat pixels.
const matAt=async(px,py)=>{const v=await view();return {x:(px-FX-v.x)/v.s,y:(py-FY-v.y)/v.s}};
const spawnUnit=async()=>{const n=await trainCount();
 await app(`d.querySelector('.bin[data-kind="0"]').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
 await wait(`d.querySelectorAll('#layer .train').length>${n}`);await sleep(50)};

async function fresh(){
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/host.html'});
 await sleep(100);
 await wait("d.readyState==='complete'&&!!d.getElementById('layer')?.getAttribute('transform')");
 // later than the app's own wheel listener, so it sees whether the app claimed the event
 await app("(w.addEventListener('wheel',e=>{w.__wheelPrevented=e.defaultPrevented}),true)");
}
before(async()=>{
 await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1200,height:800,deviceScaleFactor:1,mobile:false});
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
});

test('Ctrl+wheel over the embedded mat zooms only the mat, anchored under the cursor',async()=>{
 await fresh();
 const page0=await hostScale(),inner0=await app('w.innerWidth');
 const px=FX+420,py=FY+230,before=await matAt(px,py);
 await wheel(px,py,-100,2);await sleep(50);
 const v=await view();
 assert.ok(v.s>1.2&&v.s<=3,'mat zoomed in: '+v.s);
 const afterPt=await matAt(px,py);
 assert.ok(Math.abs(afterPt.x-before.x)<0.6&&Math.abs(afterPt.y-before.y)<0.6,'focal point stays under the cursor');
 assert.equal(await app('w.__wheelPrevented'),true,'browser zoom was prevented');
 assert.deepEqual(await hostScale(),page0,'host page did not scale');
 assert.equal(await app('w.innerWidth'),inner0,'frame was not browser-zoomed');
 assert.equal(await app("d.getElementById('zoomReset').textContent"),Math.round(v.s*100)+'%');
 // ⌘ works the same as Ctrl
 await wheel(px,py,100,4);await sleep(50);
 assert.ok((await view()).s<v.s);
});

test('plain wheel and Ctrl+wheel over the cabinet are left to the browser',async()=>{
 await fresh();
 await wheel(FX+400,FY+200,-100,0);await sleep(50);
 assert.equal((await view()).s,1);assert.equal(await app('w.__wheelPrevented'),false);
 const bin=await rect('.bin[data-kind="1"]');
 await wheel(bin.cx,bin.cy,-100,2);await sleep(50);
 assert.equal((await view()).s,1);assert.equal(await app('w.__wheelPrevented'),false);
});

test('zoom buttons and keys step within limits; reset returns to 100%',async()=>{
 await fresh();
 const inBtn=await rect('#zoomIn');
 const fixed=await rect('#zoom');
 for(let i=0;i<10;i++)await click(inBtn.cx,inBtn.cy);
 assert.equal((await view()).s,3);
 assert.equal(await app("d.getElementById('zoomIn').disabled"),true);
 assert.equal(await app("d.getElementById('zoomReset').getAttribute('aria-label')"),'Zoom 300%. Reset zoom');
 assert.deepEqual(await rect('#zoom'),fixed,'controls stay put while the mat zooms');
 const reset=await rect('#zoomReset');await click(reset.cx,reset.cy);
 assert.deepEqual(await view(),{x:0,y:0,s:1});
 const out=await rect('#zoomOut');for(let i=0;i<10;i++)await click(out.cx,out.cy);
 assert.equal((await view()).s,.5);assert.equal(await app("d.getElementById('zoomOut').disabled"),true);
 // zoomed out, the whole mat stays inside the view
 const v=await view(),w=await app('w.innerWidth');
 assert.ok(v.x>=0&&v.x+w*v.s<=w+0.5);
 await app("d.getElementById('zoomReset').focus()");
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'0',text:'0'});
 assert.equal((await view()).s,1);
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'+',text:'+'});
 assert.equal((await view()).s,1.25);
 assert.match(await app("d.getElementById('live').textContent"),/125%/);
});

test('mouse drag of a block while zoomed follows the pointer exactly',async()=>{
 await fresh();await spawnUnit();
 const b0=await box();
 await wheel(b0.cx,b0.cy,-100,2);await wheel(b0.cx,b0.cy,-100,2);await sleep(50);
 const s=(await view()).s;assert.ok(s>1.5);
 const b1=await box();
 await mouse('mousePressed',b1.cx,b1.cy);
 for(let i=1;i<=6;i++)await mouse('mouseMoved',b1.cx-10*i,b1.cy-8*i);
 const mid=await box();
 assert.ok(Math.abs(mid.l-(b1.l-60))<1.5&&Math.abs(mid.t-(b1.t-48))<1.5,'block stays under the pointer mid-drag');
 assert.equal(await app("d.querySelectorAll('#carry .train').length"),1,'held block rides above the mat');
 await mouse('mouseReleased',b1.cx-60,b1.cy-48);await sleep(80);
 const end=await box();
 assert.ok(Math.abs(end.l-(b1.l-60))<1.5&&Math.abs(end.t-(b1.t-48))<1.5,'block lands where it was dropped');
 assert.equal((await view()).s,s,'dragging a block does not zoom or pan');
});

test('zoomed-in blocks never cover the bins; a bin tap still makes a block',async()=>{
 await fresh();await spawnUnit();
 const b=await box();
 for(let i=0;i<6;i++)await wheel(b.l+1,b.t+1,-100,2);
 await sleep(50);
 const dockTop=(await rect('#dock')).t+FY,piece=await box();
 assert.ok(piece.b>dockTop+6,'a zoomed block reaches past the top of the cabinet');
 const probeX=Math.min(Math.max(piece.cx,(await rect('#cabinet')).l+FX+4),piece.r-2);
 const hit=await app(`d.elementFromPoint(${probeX-FX},${dockTop+4-FY})?.closest('.train')?'train':'mat'`);
 assert.equal(hit,'mat','clipped block does not take hits over the cabinet');
 const n=await trainCount(),bin=await rect('.bin[data-kind="2"]');
 assert.equal(await app(`d.elementFromPoint(${bin.cx-FX},${bin.cy-FY}).closest('.bin')?.dataset.kind`),'2');
 await click(bin.cx,bin.cy);await sleep(300);
 assert.equal(await trainCount(),n+1);
});

test('two-finger pinch on the mat zooms around the fingers; host page stays still',async()=>{
 await fresh();
 const page0=await hostScale();
 const a=[FX+350,FY+250],c=[FX+450,FY+250],mid=[FX+400,FY+250],before=await matAt(...mid);
 await touch('touchStart',[a,c]);
 for(let i=1;i<=5;i++)await touch('touchMove',[[a[0]-10*i,a[1]],[c[0]+10*i,c[1]]]);
 await touch('touchEnd',[]);await sleep(50);
 const v=await view();
 assert.ok(Math.abs(v.s-2)<0.05,'scale follows finger spread: '+v.s);
 const afterPt=await matAt(...mid);
 assert.ok(Math.abs(afterPt.x-before.x)<0.6&&Math.abs(afterPt.y-before.y)<0.6,'pinch midpoint stays anchored');
 assert.deepEqual(await hostScale(),page0);
 // one finger on the open mat now pans the zoomed view
 await touch('touchStart',[[FX+400,FY+300]]);
 await touch('touchMove',[[FX+430,FY+320]]);
 await touch('touchEnd',[]);
 const p=await view();
 assert.ok(Math.abs(p.x-v.x-30)<0.5&&Math.abs(p.y-v.y-20)<0.5&&p.s===v.s);
});

test('single-finger block drag still works, and a pinch that starts on a block zooms instead',async()=>{
 await fresh();await spawnUnit();
 const b=await box();
 await touch('touchStart',[[b.cx,b.cy]]);
 for(let i=1;i<=5;i++)await touch('touchMove',[[b.cx-8*i,b.cy-6*i]]);
 await touch('touchEnd',[]);await sleep(80);
 const moved=await box();
 assert.ok(Math.abs(moved.l-(b.l-40))<1.5&&Math.abs(moved.t-(b.t-30))<1.5,'finger drag moves the block');
 assert.equal((await view()).s,1);
 // first finger lands on the block, second on the open mat, then they spread
 const f1=[moved.cx,moved.cy],f2=[moved.cx+120,moved.cy];
 await touch('touchStart',[f1]);await touch('touchStart',[f1,f2]);
 for(let i=1;i<=4;i++)await touch('touchMove',[[f1[0]-10*i,f1[1]],[f2[0]+10*i,f2[1]]]);
 await touch('touchEnd',[]);await sleep(80);
 const v=await view();
 assert.ok(Math.abs(v.s-200/120)<0.05,'pinch zoomed: '+v.s);
 // the block did not travel with the finger: it only scaled about the pinch midpoint
 const mx=(f1[0]+f2[0])/2,expected=mx+(moved.l-mx)*v.s;
 assert.ok(Math.abs((await box()).l-expected)<2,'block was not dragged by the pinch');
 assert.equal(await trainCount(),1);
});

test('keyboard nudges still move a focused block by mat units while zoomed',async()=>{
 await fresh();await spawnUnit();
 const zin=await rect('#zoomIn');await click(zin.cx,zin.cy);await click(zin.cx,zin.cy);
 const U=await app("+d.querySelector('#p0 > rect[rx]').getAttribute('width')");
 const tx=()=>app("+d.querySelector('#layer .train').style.transform.match(/translate\\(([-\\d.]+)px/)[1]");
 await app("d.querySelector('#layer .train').focus()");
 const x0=await tx();
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});
 assert.ok(Math.abs(await tx()-(x0-0.5*U))<0.02);
 assert.equal((await view()).s,1.5625,'arrow keys do not change the zoom');
});


const spawnKind=async kind=>{await app(`d.querySelector('.bin[data-kind="${kind}"]').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);await sleep(100)};
const dragTo=async(b,x,y)=>{await mouse('mousePressed',b.cx,b.cy);for(let i=1;i<=6;i++)await mouse('mouseMoved',b.cx+(x-b.cx)*i/6,b.cy+(y-b.cy)*i/6);await mouse('mouseReleased',x,y);await sleep(100)};
const labels=()=>app("[...d.querySelectorAll('#layer .train, #carry .train')].map(t=>t.getAttribute('aria-label')).sort()");

test('two fingers starting on the same block pinch without trading or moving it',async()=>{
 await fresh();await spawnKind(2);await dragTo(await box(),FX+430,FY+250);
 const b=await box(),a=[b.cx-45,b.cy],c=[b.cx+45,b.cy],original=await labels();
 await touch('touchStart',[a]);await touch('touchStart',[a,c]);
 for(let i=1;i<=4;i++)await touch('touchMove',[[a[0]-8*i,a[1]],[c[0]+8*i,c[1]]]);
 await touch('touchEnd',[]);await sleep(80);
 assert.ok((await view()).s>1.5,'same-block pinch changes camera scale');
 assert.deepEqual(await labels(),original,'pinch does not trade or duplicate');
 assert.equal(await app("d.querySelectorAll('#carry .train').length"),0);
});

test('two fingers starting on separate blocks pinch without dragging either',async()=>{
 await fresh();await spawnKind(2);await dragTo(await box(),FX+150,FY+140);
 await spawnKind(2);await dragTo(await box(1),FX+620,FY+250);
 const a=await box(0),b=await box(1),before=await labels();
 await touch('touchStart',[[a.cx,a.cy]]);await touch('touchStart',[[a.cx,a.cy],[b.cx,b.cy]]);
 for(let i=1;i<=4;i++)await touch('touchMove',[[a.cx-i*20,a.cy],[b.cx+i*20,b.cy]]);
 await touch('touchEnd',[]);await sleep(80);
 assert.ok((await view()).s>1.2,'separate-block pinch changes camera scale');
 assert.deepEqual(await labels(),before);
 assert.equal(await app("d.querySelectorAll('#carry .train').length"),0);
});

test('pointer cancellation cannot spawn, trade, delete, or leave a held block',async()=>{
 await fresh();const bin=await rect('.bin[data-kind="1"]');
 await touch('touchStart',[[bin.cx,bin.cy]]);await touch('touchCancel',[]);await sleep(100);
 assert.equal(await trainCount(),0,'cancelled bin gesture discards provisional block');
 await spawnKind(1);const b=await box(),before=await labels();
 await click(b.cx,b.cy);await touch('touchStart',[[b.cx,b.cy]]);await touch('touchCancel',[]);await sleep(80);
 assert.deepEqual(await labels(),before,'cancelled second tap cannot trade');
 const c=await box();await touch('touchStart',[[c.cx,c.cy]]);
 await touch('touchMove',[[bin.cx,bin.cy]]);await touch('touchCancel',[]);await sleep(80);
 assert.deepEqual(await labels(),before,'cancel over bin cannot delete an existing block');
 assert.equal(await app("d.querySelectorAll('.train.dragging').length"),0,'no stale held block');
});

test('zoomed block can be returned to its bin by dragging',async()=>{
 await fresh();await spawnUnit();const b=await box();await wheel(b.cx,b.cy,-100,2);await sleep(50);
 const bin=await rect('.bin[data-kind="0"]');await dragTo(await box(),bin.cx,bin.cy);
 assert.equal(await trainCount(),0,'dropping into cabinet deletes block');
});

test('zoomed keyboard trade preserves value and units still snap into a run',async()=>{
 await fresh();await spawnKind(1);await app("d.getElementById('zoomIn').click()");
 await app("d.querySelector('#layer .train').focus()");
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await sleep(150);
 assert.equal(await trainCount(),10,'rod trades into ten units');
 assert.ok((await labels()).every(x=>x==='one unit'));
 // Fresh unit bin taps land against the existing unit, which snaps into a run.
 await fresh();await app("d.getElementById('zoomIn').click()");await spawnKind(0);await spawnKind(0);await sleep(200);
 assert.deepEqual(await labels(),['2 units joined'],'unit snapping remains in world coordinates');
});

test('standalone app wheel, pinch and accessible controls zoom without scaling browser',async()=>{
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/apps/place-value-blocks/'});await sleep(300);
 const read=()=>evaluate("document.getElementById('layer').getAttribute('transform')");
 const original=await hostScale();await wheel(500,250,-100,2);await sleep(60);
 assert.match(await read(),/scale\(1\.28/);assert.deepEqual(await hostScale(),original);
 await evaluate("document.getElementById('zoomReset').click()");
 await touch('touchStart',[[400,250],[500,250]]);await touch('touchMove',[[350,250],[550,250]]);await touch('touchEnd',[]);
 assert.match(await read(),/scale\(2\)/);assert.deepEqual(await hostScale(),original);
 await evaluate("document.getElementById('zoomReset').focus()");await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'0',text:'0'});
 assert.match(await read(),/scale\(1\)/);
});
