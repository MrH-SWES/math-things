// Dependency-free browser regression tests for Sentence Builder (apps/sentence-builder/).
// Node 22+ and an installed Chromium required (CHROMIUM=/path to override).
// Offline: external fonts are stripped. Input is real CDP mouse/keyboard/touch events.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root=new URL('../',import.meta.url);
const STORE_KEY='mathThings.sentenceBuilder.lesson';
let extra='',dropData=false;
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/apps/sentence-builder/'){
   const html=(await readFile(new URL('apps/sentence-builder/index.html',root),'utf8')).replace(/<link[^>]+href="https:[^>]+>/g,'');
   res.setHeader('Content-Type','text/html');res.end(html.replace('<head>','<head><script>'+extra+'</script>'));
  }else if(dropData&&path==='/apps/sentence-builder/packs.js'){res.statusCode=404;res.end()}
  else{if(path.endsWith('.js'))res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('.'+path,root)))}
 }catch{res.statusCode=404;res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const profile=await mkdtemp(join(tmpdir(),'sentence-builder-test-'));
const browser=spawn(process.env.CHROMIUM||'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let browserErrors='';browser.stderr.on('data',chunk=>{browserErrors=(browserErrors+chunk).slice(-8000)});
let debugPort;
for(let i=0;i<100;i++){
 try{debugPort=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{await new Promise(r=>setTimeout(r,100))}
}
if(!debugPort){browser.kill();server.close();throw Error('Chromium failed to start: '+browserErrors)}
const tabs=await (await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map(),pageErrors=[];
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);
 if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(d.error.message)):p.resolve(d.result);return}
 if(d.method==='Runtime.exceptionThrown')pageErrors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);
 if(d.method==='Page.javascriptDialogOpening')cdp('Page.handleJavaScriptDialog',{accept:true});
});
const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
const wait=async expr=>{for(let i=0;i<100;i++){if(await evaluate(expr))return;await new Promise(r=>setTimeout(r,40))}throw Error('Timed out: '+expr)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const desktop=async()=>{
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false});
};
after(async()=>{ws.close();browser.kill();server.close();await new Promise(r=>browser.once('exit',r));await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100})});
before(async()=>{
 await cdp('Page.enable');await cdp('Runtime.enable');
 await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await desktop();
});

// ---- data: packs.js + the reviewed word list ----
const loadData=async()=>{const s=await readFile(new URL('apps/sentence-builder/packs.js',root),'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''))};
const DATA=await loadData();
const lessonIndex=id=>DATA.lessons.findIndex(L=>L.id===id);
function pack(id){
 const i=lessonIndex(id),tricky=new Set();
 for(let k=0;k<=i;k++)DATA.lessons[k].tricky.forEach(w=>tricky.add(w));
 const words=new Set([...DATA.lessons[i].words,...tricky]);
 return {words:[...words].map(w=>DATA.words[w][0]).sort(),tricky:[...tricky].map(w=>DATA.words[w][0]).sort()};
}

// ---- page helpers ----
let pageNumber=0;
async function open({keep=false,script='',lesson}={}){
 const n=++pageNumber;
 extra='window.__testPage='+n+';'+(keep?'':'try{localStorage.clear()}catch(e){}')+(lesson?`try{localStorage.setItem(${JSON.stringify(STORE_KEY)},${JSON.stringify(lesson)})}catch(e){}`:'')+script;
 await cdp('Page.navigate',{url:base+'/apps/sentence-builder/'});
 await wait('window.__testPage==='+n+"&&document.readyState==='complete'&&!!document.querySelector('#banks .bank, #banks .banks-empty')");
}
const rail=r=>evaluate(`[...document.querySelectorAll('.rail')[${r}].querySelectorAll('.tile')].map(t=>t.querySelector('.w').textContent)`);
const railWords=r=>evaluate(`[...document.querySelectorAll('.rail')[${r}].querySelectorAll('.tile')].map(t=>t.dataset.word)`);
const all=async()=>[await rail(0),await rail(1),await rail(2)];
const bankWords=pos=>evaluate(`[...document.querySelectorAll('#banks .bank[data-pos="${pos}"] .tile')].map(t=>t.dataset.word)`);
const bankTile=(pos,w)=>`[...document.querySelectorAll('#banks .bank[data-pos="${pos}"] .tile')].find(t=>t.dataset.word===${JSON.stringify(w)})`;
const placed=(r,i)=>`document.querySelectorAll('.rail')[${r}].querySelectorAll('.tile')[${i}]`;
const focused=()=>evaluate("document.activeElement.getAttribute('aria-label')");
const point=async(expr,{scroll=true}={})=>{const p=await evaluate(`(()=>{const el=${expr};if(!el)return null;${scroll?"el.scrollIntoView({block:'center',inline:'center'});":''}
 const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,l:r.left,r:r.right,t:r.top,b:r.bottom,w:r.width,h:r.height}})()`);if(!p)throw Error('No element: '+expr);return p};
const railEnd=async r=>{const b=await point(`document.querySelectorAll('.rail')[${r}]`,{scroll:false});return {x:b.r-12,y:b.t+20}};
const mouse=(type,x,y,buttons=0)=>cdp('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'&&!buttons?'none':'left',buttons,clickCount:1});
async function drag(fromExpr,to,{steps=12}={}){
 const a=await point(fromExpr);
 await mouse('mouseMoved',a.x,a.y);await mouse('mousePressed',a.x,a.y,1);
 for(let k=1;k<=steps;k++)await mouse('mouseMoved',a.x+(to.x-a.x)*k/steps,a.y+(to.y-a.y)*k/steps,1);
 await mouse('mouseReleased',to.x,to.y);
}
const click=async expr=>{const {x,y}=await point(expr);await mouse('mouseMoved',x,y);await mouse('mousePressed',x,y,1);await mouse('mouseReleased',x,y)};
const touch=(type,pts)=>cdp('Input.dispatchTouchEvent',{type,touchPoints:pts.map(([x,y],id)=>({x,y,id}))});
// A finger path through the given points. With hold, the finger stays down until the word
// shows it has been picked up (as a person would wait), then moves.
async function touchPath(points,{hold=false,steps=10}={}){
 await touch('touchStart',[[points[0].x,points[0].y]]);
 if(hold){await wait("!!document.querySelector('#banks .tile.held')");await sleep(40)}
 for(let p=1;p<points.length;p++){const a=points[p-1],b=points[p];
  for(let k=1;k<=steps;k++)await touch('touchMove',[[a.x+(b.x-a.x)*k/steps,a.y+(b.y-a.y)*k/steps]])}
 await touch('touchEnd',[]);await sleep(60);
}
const touchDrag=(from,to,opts)=>touchPath([from,to],opts);
const KEYS={Enter:[13,'\r'],ArrowLeft:[37],ArrowRight:[39],ArrowUp:[38],ArrowDown:[40],Delete:[46],Tab:[9]};
const press=async key=>{const [code,txt]=KEYS[key];const k={key,code:key,windowsVirtualKeyCode:code};
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',...k,...(txt?{text:txt}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',...k})};

test('every lesson has a pack: its printed words plus all tricky words so far, each in a bank',async()=>{
 assert.equal(DATA.lessons.length,133);
 assert.deepEqual(DATA.lessons.map(L=>L.id),Array.from({length:133},(_,i)=>'L'+String(i+1).padStart(3,'0')));
 assert.equal(new Set(DATA.lessons.map(L=>L.stage)).size,15,'15 stages');
 assert.deepEqual(pack('L001').words,['a','am','at','I','mat','sam','sat','tam'].map(w=>({sam:'Sam',tam:'Tam'})[w]||w).sort());
 const l3=pack('L003');
 assert.deepEqual(l3.tricky,['a','and','I','the','to'].sort(),'tricky words from lessons 1-3');
 for(const spoken of ['cup','fun','fox','cop','pig','big','dog','fit','if'])
  assert.ok(!l3.words.includes(spoken),spoken+' is only spoken in Lesson 3, never printed');
 const late=pack('L133');
 assert.ok(late.tricky.length>=90&&late.words.length>late.tricky.length,'late packs carry the whole tricky list');
 // packs.js agrees with the reviewed word list
 const tsv=(await readFile(new URL('apps/sentence-builder/tools/parts-of-speech.tsv',root),'utf8')).split('\n').filter(l=>l&&!l.startsWith('#')).slice(1).map(l=>l.split('\t'));
 const lex=new Map(tsv.map(([w,b])=>[w,b]));
 assert.equal(DATA.words.length,lex.size,'every listed word is printed somewhere');
 for(const [w,parts] of DATA.words){
  assert.ok(parts.length>0,w+' has a bank');
  assert.equal(parts.map(p=>DATA.banks[p]).join(','),lex.get(w),w+' banks match the word list');
 }
 const banksOf=w=>DATA.words.find(x=>x[0]===w)[1].map(p=>DATA.banks[p]);
 assert.deepEqual(banksOf('fan'),['noun','verb'],'two-job word in both banks');
 assert.deepEqual(banksOf('the'),['article']);assert.deepEqual(banksOf('I'),['pronoun']);
 assert.ok(!banksOf('cat').includes('verb'),'rare uses left out');
});

test('the lesson picker lists all 133 lessons by stage and remembers the choice',async()=>{
 await open();
 assert.equal(await evaluate("document.querySelectorAll('#lessonSelect option').length"),133);
 assert.equal(await evaluate("document.querySelectorAll('#lessonSelect optgroup').length"),15);
 assert.equal(await evaluate("document.getElementById('lessonSelect').selectedOptions[0].textContent"),'Lesson 1 · m, s, t, and short a');
 assert.deepEqual((await evaluate("[...document.querySelectorAll('#banks .tile')].map(t=>t.dataset.word)")).filter(w=>!'.?!,'.includes(w)).sort(),pack('L001').words);
 await evaluate("(s=>{s.value='2';s.dispatchEvent(new Event('change'))})(document.getElementById('lessonSelect'))");
 await open({keep:true});
 assert.equal(await evaluate("document.getElementById('lessonSelect').selectedOptions[0].textContent"),'Lesson 3 · c and f','remembered after refresh');
 assert.deepEqual(await evaluate("[...document.querySelectorAll('#banks .bank')].map(b=>b.dataset.pos)"),['noun','verb','adjective','article','conjunction','pronoun','preposition','punct'],'only banks that have words, punctuation last');
 assert.deepEqual(await bankWords('punct'),['.','?','!',',']);
});

test('heart words show a heart; two-job words get a tile in each bank, each in its own faint color',async()=>{
 await open({lesson:'L003'});
 assert.equal(await evaluate(bankTile('article','the')+".querySelector('.heart')?.textContent"),'♥');
 assert.equal(await evaluate(bankTile('conjunction','and')+".dataset.heart"),'1');
 assert.equal(await evaluate(bankTile('noun','cat')+".querySelector('.heart')"),null);
 assert.ok((await bankWords('noun')).includes('fan')&&(await bankWords('verb')).includes('fan'));
 const bg=await evaluate(`[${bankTile('noun','fan')},${bankTile('verb','fan')},${bankTile('article','the')}].map(t=>getComputedStyle(t).backgroundColor)`);
 assert.equal(new Set(bg).size,3,'different bank colors');
 assert.equal(await evaluate("getComputedStyle(document.body).backgroundColor"),'rgb(251, 247, 236)','creamy off-white canvas');
 assert.equal(await evaluate("getComputedStyle(document.getElementById('canvas')).backgroundColor"),'rgba(0, 0, 0, 0)','nothing covers it');
});

test('drag a word onto a rail: it snaps to the nearest rail, lands at the marker, and the bank keeps its copy',async()=>{
 await open({lesson:'L003'});
 await drag(bankTile('noun','cat'),await railEnd(1));
 assert.deepEqual(await all(),[[],['Cat'],[]],'first word shows a capital');
 assert.ok((await bankWords('noun')).includes('cat'),'bank still has cat');
 await drag(bankTile('verb','sat'),await railEnd(1));
 assert.deepEqual(await rail(1),['Cat','sat']);
 const first=await point(placed(1,0),{scroll:false});
 await drag(bankTile('article','the'),{x:first.l+4,y:first.y});
 assert.deepEqual(await rail(1),['The','cat','sat'],'inserted before the tile under the marker; capital moves with the first word');
 // a drop in the empty space between rails snaps to the nearest rail
 const r0=await point("document.querySelectorAll('.rail')[0]",{scroll:false});
 await drag(bankTile('noun','Pam'),{x:r0.l+40,y:r0.b+8});
 assert.deepEqual(await rail(0),['Pam']);
 // a bank word dropped outside the canvas places nothing
 const banks=await point("document.getElementById('banks')",{scroll:false});
 await drag(bankTile('noun','map'),{x:banks.l+30,y:banks.t+30});
 assert.deepEqual(await all(),[['Pam'],['The','cat','sat'],[]]);
 assert.equal(await evaluate("document.querySelectorAll('.ghost').length"),0,'no stray drag ghost');
});

test('tiles rearrange within and between rails, punctuation follows the first word rule, and dragging off removes',async()=>{
 await open({lesson:'L003'});
 for(const [pos,w] of [['article','the'],['noun','cat'],['verb','sat'],['punct','.']])await drag(bankTile(pos,w),await railEnd(0));
 assert.deepEqual(await rail(0),['The','cat','sat','.']);
 const t0=await point(placed(0,0),{scroll:false});
 await drag(placed(0,1),{x:t0.l+3,y:t0.y});
 assert.deepEqual(await rail(0),['Cat','the','sat','.'],'any first word is capitalized');
 assert.deepEqual(await railWords(0),['cat','the','sat','.'],'the word itself is unchanged');
 await drag(placed(0,0),await railEnd(2));
 assert.deepEqual(await all(),[['The','sat','.'],[],['Cat']],'moved to another rail');
 const p=await point(placed(0,0),{scroll:false});
 await drag(placed(0,2),{x:p.l+3,y:p.y});
 assert.deepEqual(await rail(0),['.','The','sat'],'punctuation first: the first word still gets the capital');
 const banks=await point("document.getElementById('banks')",{scroll:false});
 await drag(placed(0,0),{x:banks.x,y:banks.y});
 assert.deepEqual(await rail(0),['The','sat'],'dragged off the canvas: removed');
 await drag(bankTile('noun','Sam'),await railEnd(1));await drag(bankTile('pronoun','I'),await railEnd(1));
 assert.deepEqual(await rail(1),['Sam','I'],'names and I keep their capitals');
});

test('touch: a flick scrolls the banks, a sideways pull or a short hold drags, touch-drag rearranges',async()=>{
 await cdp('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:2,mobile:true});
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 try{
  await open({lesson:'L042'});
  assert.ok(await evaluate("matchMedia('(pointer: coarse)').matches"));
  const before=await evaluate("document.getElementById('banks').scrollTop");
  const t=await point(bankTile('noun','cake'));
  await touchDrag({x:t.x,y:t.y},{x:t.x,y:t.y-220});
  assert.deepEqual(await all(),[[],[],[]],'a quick up/down flick places nothing');
  assert.ok(await evaluate("document.getElementById('banks').scrollTop")!==before,'the banks scrolled');
  // let the flick's glide finish before touching a word, as a person would
  for(let last=-1,i=0;i<50;i++){const now=await evaluate("document.getElementById('banks').scrollTop");if(now===last)break;last=now;await sleep(80)}
  // a sideways pull drags straight away
  const a1=await point(bankTile('article','the')),end=await railEnd(0);
  await touchPath([{x:a1.x,y:a1.y},{x:a1.x-60,y:a1.y},end]);
  assert.deepEqual(await rail(0),['The'],'sideways pull');
  // after a short hold, a word can be dragged straight up (the way that would otherwise scroll)
  const a2=await point(bankTile('noun','cake'));
  await touchPath([{x:a2.x,y:a2.y},{x:a2.x,y:a2.y-150},await railEnd(0)],{hold:true});
  assert.deepEqual(await rail(0),['The','cake'],'hold, then drag in any direction');
  const a3=await point(bankTile('verb','came'));
  await touchPath([{x:a3.x,y:a3.y},{x:a3.x-30,y:a3.y-10},await railEnd(0)]);
  assert.deepEqual(await rail(0),['The','cake','came']);
  assert.equal(await evaluate("document.querySelectorAll('.tile.held').length"),0,'no word left looking picked up');
  const first=await point(placed(0,0),{scroll:false}),last=await point(placed(0,2),{scroll:false});
  await touchDrag({x:last.x,y:last.y},{x:first.l+3,y:first.y});
  assert.deepEqual(await rail(0),['Came','the','cake'],'touch-drag rearranges');
  const small=await evaluate(`[...document.querySelectorAll('#banks .tile,.rail .tile,#lessonSelect,#clearBtn,.bank-toggle')].map(el=>el.getBoundingClientRect()).filter(r=>r.width<44||r.height<44).length`);
  assert.equal(small,0,'every tile and control is at least 44×44');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'no sideways page scroll');
  await cdp('Emulation.setDeviceMetricsOverride',{width:768,height:1024,deviceScaleFactor:2,mobile:true});
  await sleep(100);
  assert.equal(await evaluate("new Set([...document.querySelectorAll('.rail')[0].querySelectorAll('.tile')].map(t=>Math.round(t.getBoundingClientRect().top))).size"),1,'portrait: the sentence still fits on one line');
 }finally{await desktop()}
});

test('without dragging: tap adds to the current rail; keyboard adds, moves and removes',async()=>{
 await open({lesson:'L003'});
 await click(bankTile('noun','Pam'));await click(bankTile('verb','can'));
 assert.deepEqual(await rail(0),['Pam','can'],'tap adds to the end of the top rail');
 await drag(bankTile('noun','Sam'),await railEnd(2));
 await click(bankTile('verb','nap'));
 assert.deepEqual(await rail(2),['Sam','nap'],'tap follows the rail used last');
 await evaluate(bankTile('article','the')+'.focus()');await press('Enter');
 assert.deepEqual(await rail(2),['Sam','nap','the'],'Enter on a bank word adds it');
 await evaluate(placed(2,2)+'.focus()');
 await press('ArrowLeft');await press('ArrowLeft');
 assert.deepEqual(await rail(2),['The','Sam','nap']);assert.match(await focused(),/^The, article, heart word, word 1 of 3 in sentence 3$/);
 await press('ArrowUp');
 assert.deepEqual(await all(),[['Pam','can'],['The'],['Sam','nap']],'↑ moves it to the sentence above');
 await press('Delete');
 assert.deepEqual(await rail(1),[]);
 assert.equal(await evaluate('document.activeElement.id'),'canvas','focus stays on the canvas');
 const unnamed=await evaluate("[...document.querySelectorAll('button,select,.tile.placed')].filter(el=>!(el.getAttribute('aria-label')||el.textContent.trim())).length");
 assert.equal(unnamed,0);
});

test('Clear needs a second tap within 3 seconds; changing lessons keeps the sentences',async()=>{
 await open({lesson:'L003'});
 await click(bankTile('noun','Pam'));await click(bankTile('verb','sat'));
 await evaluate("(s=>{s.value=String(41);s.dispatchEvent(new Event('change'))})(document.getElementById('lessonSelect'))");
 assert.deepEqual(await rail(0),['Pam','sat'],'new lesson, same sentence');
 assert.ok((await bankWords('noun')).includes('cake'),'banks show the new lesson');
 await click("document.getElementById('clearBtn')");
 assert.equal(await evaluate("document.getElementById('clearBtn').textContent"),'Clear all?');
 assert.deepEqual(await rail(0),['Pam','sat'],'one tap clears nothing');
 await sleep(3200);
 assert.equal(await evaluate("document.getElementById('clearBtn').textContent"),'Clear','it lets go after 3 seconds');
 await click("document.getElementById('clearBtn')");await click("document.getElementById('clearBtn')");
 assert.deepEqual(await all(),[[],[],[]]);
});

const drawer=pos=>`document.querySelector('#banks .bank[data-pos="${pos}"]')`;
const drawerState=pos=>evaluate(`(b=>({closed:b.classList.contains('collapsed'),expanded:b.querySelector('.bank-toggle').getAttribute('aria-expanded'),
 tilesHidden:b.querySelector('.bank-tiles').hidden,visibleTiles:[...b.querySelectorAll('.tile')].filter(t=>t.getBoundingClientRect().height>0).length,
 countShown:getComputedStyle(b.querySelector('.bank-count')).display!=='none',count:b.querySelector('.bank-count').textContent}))(${drawer(pos)})`);

test('bank drawers fold shut and open, and stay that way across lessons and refreshes',async()=>{
 await open({lesson:'L003'});
 let noun=await drawerState('noun');
 assert.deepEqual([noun.closed,noun.expanded,noun.tilesHidden],[false,'true',false],'drawers start open');
 assert.equal(noun.countShown,false,'no count while open');
 await click(drawer('noun')+".querySelector('.bank-toggle')");
 noun=await drawerState('noun');
 assert.deepEqual([noun.closed,noun.expanded,noun.tilesHidden,noun.visibleTiles],[true,'false',true,0],'tap the name to close the drawer');
 assert.deepEqual([noun.countShown,noun.count],[true,String((await bankWords('noun')).length)],'a closed drawer shows how many words are inside');
 assert.equal((await drawerState('verb')).closed,false,'other drawers stay open');
 assert.deepEqual(await all(),[[],[],[]],'tapping a drawer adds no word');
 const box=await point(drawer('noun')+".querySelector('.bank-toggle')");
 assert.ok(box.h>=44,'the drawer name is a 44px target');
 // keyboard
 await evaluate(drawer('verb')+".querySelector('.bank-toggle').focus()");await press('Enter');
 assert.equal((await drawerState('verb')).closed,true,'Enter closes a drawer');
 // kept when the lesson changes and after a refresh
 await evaluate("(s=>{s.value='41';s.dispatchEvent(new Event('change'))})(document.getElementById('lessonSelect'))");
 assert.equal((await drawerState('noun')).closed,true);assert.equal((await drawerState('verb')).closed,true);
 assert.equal((await drawerState('adjective')).closed,false);
 await open({keep:true});
 assert.equal((await drawerState('noun')).closed,true,'still closed after a refresh');
 // a closed drawer still accepts a tile dragged off the board
 await click(drawer('article')+".querySelector('.tile')");
 assert.equal((await all())[0].length,1);
 const shut=await point(drawer('noun'));
 await drag(placed(0,0),{x:shut.x,y:shut.y});
 assert.deepEqual(await all(),[[],[],[]]);
 await click(drawer('noun')+".querySelector('.bank-toggle')");
 const reopened=await drawerState('noun');
 assert.deepEqual([reopened.closed,reopened.expanded,reopened.visibleTiles>0],[false,'true',true],'tap again to open');
});

test('blocked browser storage and a missing word list are handled',async()=>{
 await open({script:"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}});"});
 await evaluate("(s=>{s.value='5';s.dispatchEvent(new Event('change'))})(document.getElementById('lessonSelect'))");
 assert.ok((await bankWords('noun')).length>0,'works without storage');
 await click(drawer('noun')+".querySelector('.bank-toggle')");
 assert.equal((await drawerState('noun')).closed,true,'drawers still fold without storage');
 dropData=true;
 try{
  await open();
  assert.equal(await evaluate("document.querySelector('#banks .banks-empty').textContent"),'The word lists did not load.');
  assert.equal(await evaluate("document.getElementById('lessonSelect').disabled"),true);
 }finally{dropData=false}
});

test('no uncaught page errors during the run',()=>{
 assert.deepEqual(pageErrors,[]);
});
