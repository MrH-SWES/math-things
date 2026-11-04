// Dependency-free browser regression tests for Build-A-Sentence word packs and tile controls.
// Node 22+ and an installed Chromium required (CHROMIUM=/path to override).
// Offline: external fonts are stripped. Input is real CDP mouse/keyboard/touch events; imports go
// through the real file chooser. Downloads, confirm() and speech are captured in the page.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root=new URL('../',import.meta.url);
const KEY='mathThings.sentences.wordPacks.v1',SOURCE_KEY='mathThings.sentences.wordSource.v1';
const init=`window.__spoken=[];window.__downloads=[];window.__confirms=[];window.__confirmAnswer=true;
window.confirm=m=>{__confirms.push(m);return __confirmAnswer};
if(window.speechSynthesis)speechSynthesis.speak=u=>__spoken.push(u.text);
const nativeClick=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){if(!this.download)return nativeClick.call(this);const name=this.download;
 __downloads.push(fetch(this.href).then(r=>r.blob()).then(async b=>({name,type:b.type,text:await b.text()})))};`;
let extra='';
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/apps/sentences/'){
   const html=(await readFile(new URL('apps/sentences/index.html',root),'utf8')).replace(/<link[^>]+href="https:[^>]+>/g,'');
   res.setHeader('Content-Type','text/html');res.end(html.replace('<head>','<head><script>'+init+extra+'</script>'));
  }else if(path==='/two-tabs.html'){
   res.setHeader('Content-Type','text/html');
   res.end('<!DOCTYPE html><iframe id="a" src="/apps/sentences/" style="width:900px;height:700px"></iframe><iframe id="b" src="/apps/sentences/" style="width:900px;height:700px"></iframe>');
  }else{if(path.endsWith('.js'))res.setHeader('Content-Type','text/javascript');res.end(await readFile(new URL('.'+path,root)))}
 }catch{res.statusCode=404;res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const profile=await mkdtemp(join(tmpdir(),'sentences-test-'));
const files=await mkdtemp(join(tmpdir(),'sentences-files-'));
const browser=spawn(process.env.CHROMIUM||'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let browserErrors='';browser.stderr.on('data',chunk=>{browserErrors=(browserErrors+chunk).slice(-8000)});
let debugPort;
for(let i=0;i<100;i++){
 try{debugPort=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{await new Promise(r=>setTimeout(r,100))}
}
if(!debugPort){browser.kill();server.close();throw Error('Chromium failed to start: '+browserErrors)}
const tabs=await (await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map(),waiters=new Map(),pageErrors=[],dialogs=[];
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);
 if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(d.error.message)):p.resolve(d.result);return}
 if(d.method==='Runtime.exceptionThrown')pageErrors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);
 // confirm() is stubbed in the page, so only the unsaved-changes (beforeunload) prompt lands here: record it and leave.
 if(d.method==='Page.javascriptDialogOpening'){dialogs.push(d.params.type);cdp('Page.handleJavaScriptDialog',{accept:true})}
 const w=waiters.get(d.method);if(w&&w.length)w.shift()(d.params)});
const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
const once=(method,ms=5000)=>Promise.race([new Promise(r=>{if(!waiters.has(method))waiters.set(method,[]);waiters.get(method).push(r)}),
 new Promise((_,reject)=>setTimeout(()=>reject(Error('No '+method)),ms))]);
const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
const wait=async expr=>{for(let i=0;i<100;i++){if(await evaluate(expr))return;await new Promise(r=>setTimeout(r,40))}throw Error('Timed out: '+expr)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
after(async()=>{ws.close();browser.kill();server.close();await new Promise(r=>browser.once('exit',r));
 await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100});await rm(files,{recursive:true,force:true})});
const desktop=async()=>{
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
};
before(async()=>{
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('DOM.enable');
 // No pop-in animation, so element boxes are final as soon as they render.
 await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await desktop();
});

// ---- page + data helpers ----
let pageNumber=0;
// Opens the app. Storage is cleared unless keep; script runs before the app (e.g. to seed or break storage).
async function open({keep=false,script=''}={}){
 const n=++pageNumber;
 extra='window.__testPage='+n+';'+(keep?'':'try{localStorage.clear()}catch(e){}')+script;
 await cdp('Page.navigate',{url:base+'/apps/sentences/'});
 await wait('window.__testPage==='+n+"&&document.readyState==='complete'&&!!document.getElementById('sourceSelect').options.length");
}
const pack=(id,name,lists,labels={})=>({id,name,lesson:'',readingLevel:'',skill:'',nouns:[],verbs:[],helpers:[],...labels,...lists});
const SHORT=pack('pShort','Short a',{nouns:['cat','hat','map','owl','Sam’s','iPad','apple'],verbs:['sat','ran',"can't",'runs','is'],
 helpers:['the','a','an','I','<b>on</b>','&amp;','<img src=x onerror="window.__xss=1">']},{lesson:'Lesson 12',readingLevel:'Grade 1',skill:'short a'});
const ONLY=pack('pOnly','Only helpers',{helpers:['the','and']});
const seed=(packs,source)=>`localStorage.setItem(${JSON.stringify(KEY)},${JSON.stringify(JSON.stringify({format:'build-a-sentence-word-packs',version:1,packs}))});`
 +(source?`localStorage.setItem(${JSON.stringify(SOURCE_KEY)},${JSON.stringify(source)});`:'');
const stored=()=>evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})||'null')`);
const tiles=()=>evaluate("[...document.querySelectorAll('#sentenceCards .card .card-word')].map(e=>e.textContent)");
const preview=()=>evaluate("document.getElementById('sentencePreview').textContent.replace(/\\s+/g,' ').trim()");
const text=css=>evaluate(`document.querySelector(${JSON.stringify(css)}).textContent`);
const chips=list=>evaluate(`[...document.querySelectorAll('#pfChips-${list} li span')].map(e=>e.textContent)`);
const options=id=>evaluate(`[...document.getElementById('${id}').options].map(o=>o.textContent)`);
const selected=id=>evaluate(`document.getElementById('${id}').selectedOptions[0].textContent`);
const focused=()=>evaluate("document.activeElement.getAttribute('aria-label')||document.activeElement.id");
const $=(css,i=0)=>`document.querySelectorAll(${JSON.stringify(css)})[${i}]`;
const word=w=>`[...document.querySelectorAll('#wordGrid button.card')].find(b=>b.querySelector('.card-word').textContent===${JSON.stringify(w)})`;

// ---- real input ----
const point=async expr=>{const p=await evaluate(`(()=>{const el=${expr};if(!el)return null;el.scrollIntoView({block:'center',inline:'center'});
 const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);if(!p)throw Error('No element: '+expr);return p};
const mouse=(type,x,y,buttons=0)=>cdp('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'&&!buttons?'none':'left',buttons,clickCount:1});
const click=async expr=>{const {x,y}=await point(expr);await mouse('mouseMoved',x,y);await mouse('mousePressed',x,y,1);await mouse('mouseReleased',x,y)};
const touch=(type,points)=>cdp('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y],id)=>({x,y,id}))});
const tap=async expr=>{const {x,y}=await point(expr);await touch('touchStart',[[x,y]]);await touch('touchEnd',[]);await sleep(60)};
const KEYS={Enter:[13,'\r'],' ':[32,' '],ArrowLeft:[37],ArrowRight:[39],Delete:[46],Backspace:[8],Escape:[27],Tab:[9]};
const press=async key=>{const [code,txt]=KEYS[key];const k={key,code:key===' '?'Space':key,windowsVirtualKeyCode:code};
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',...k,...(txt?{text:txt}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',...k})};
const focus=expr=>evaluate(`(${expr}).focus()`);
// Like typing a whole value: replaces the field's text and fires input.
const fill=(expr,value)=>evaluate(`(()=>{const el=${expr};el.focus();el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}))})()`);
const choose=(id,value)=>evaluate(`(()=>{const s=document.getElementById('${id}');s.value=${JSON.stringify(value)};s.dispatchEvent(new Event('change',{bubbles:true}))})()`);
const chooseByName=(id,name)=>evaluate(`(()=>{const s=document.getElementById('${id}');s.value=[...s.options].find(o=>o.textContent===${JSON.stringify(name)}).value;s.dispatchEvent(new Event('change',{bubbles:true}))})()`);
const openPanel=async()=>{await click($('#teacherBtn'));await wait("document.getElementById('packPanel').open")};
const addWords=async(list,value)=>{await fill($('#pfAdd-'+list),value);await click($('#pfAddBtn-'+list))};
const downloads=async()=>{const list=await evaluate('Promise.all(__downloads)');await evaluate('__downloads=[]');return list.map(d=>({...d,json:JSON.parse(d.text)}))};
// Picks a real file through the Import button's file chooser and returns the preview text.
let fileNumber=0;
async function importFile(name,content){
 const path=join(files,(++fileNumber)+'-'+name);await writeFile(path,content);
 await evaluate("document.getElementById('importPreview').hidden=true");
 await cdp('Page.setInterceptFileChooserDialog',{enabled:true});
 const opened=once('Page.fileChooserOpened');
 await click($('#importBtn'));
 await cdp('DOM.setFileInputFiles',{files:[path],backendNodeId:(await opened).backendNodeId});
 await wait("!document.getElementById('importPreview').hidden");
 return text('#importPreview');
}

test('a teacher creates, edits, duplicates, loads and deletes packs; names stay unique',async()=>{
 await open();
 assert.deepEqual(await options('sourceSelect'),['Original word bank']);
 await openPanel();
 assert.ok(await evaluate("document.getElementById('packPanel').matches(':modal')"),'panel is a modal dialog');
 assert.match(await text('.pp-note'),/do not sync/);
 assert.equal(await evaluate("document.getElementById('storageWarn').hidden"),true);
 assert.equal(await selected('editPackSelect'),'New pack (not saved yet)');
 await click($('#packSaveBtn'));
 assert.match(await text('#packStatus'),/name/);assert.equal(await stored(),null,'nothing saved without a name');
 await fill($('#pfName'),'x');
 assert.equal(await text('#packStatus'),'Unsaved changes.','typing replaces the error');

 await fill($('#pfName'),'  Short   a  ');await fill($('#pfLesson'),'Lesson 12');await fill($('#pfLevel'),'Grade 1');await fill($('#pfSkill'),'short a');
 await addWords('nouns','cat, hat\nmap\n\n   van  , cat,owl,Sam’s,iPad');
 assert.deepEqual(await chips('nouns'),['cat','hat','map','van','owl','Sam’s','iPad'],'commas and line breaks split; repeats skipped');
 assert.match(await text('#pfMsg-nouns'),/Already in the list: cat/);
 await addWords('verbs',"sat\nran\ncan't\nruns\nis");
 await addWords('helpers','the, a, an, I, <b>on</b>, &amp;, <img src=x onerror="window.__xss=1">');
 assert.ok((await chips('helpers')).includes('<b>on</b>'));
 assert.equal(await evaluate("document.querySelectorAll('#packPanel b:not(.pp-note b), #packPanel img').length"),0,'HTML stays text');
 await addWords('helpers','x'.repeat(41)+', ok');
 assert.ok((await chips('helpers')).includes('ok'));
 assert.equal(await evaluate("document.getElementById('pfAdd-helpers').value"),'x'.repeat(41),'rejected word is left in the box');
 assert.match(await text('#pfMsg-helpers'),/longer than 40/);
 await fill($('#pfAdd-helpers'),'');
 await click($('#packSaveBtn'));
 let s=await stored();
 assert.equal(await text('#packStatus'),'Saved.');
 assert.equal(s.packs.length,1);
 assert.deepEqual([s.packs[0].name,s.packs[0].lesson,s.packs[0].readingLevel,s.packs[0].skill],['Short a','Lesson 12','Grade 1','short a']);
 assert.deepEqual(s.packs[0].verbs,['sat','ran',"can't",'runs','is']);
 assert.ok(s.packs[0].helpers.includes('<img src=x onerror="window.__xss=1">')&&s.packs[0].helpers.includes('&amp;'));

 await click(`[...document.querySelectorAll('#pfChips-nouns li')].find(li=>li.firstChild.textContent==='van').querySelector('button')`);
 assert.ok(!(await chips('nouns')).includes('van'));
 assert.equal(await focused(),'Remove owl from Nouns','focus moves to the next ✕');
 await fill($('#pfLesson'),'Lesson 12b');await click($('#packRevertBtn'));
 assert.ok((await chips('nouns')).includes('van'),'Undo changes restores the saved words');
 assert.equal(await evaluate("document.getElementById('pfLesson').value"),'Lesson 12');
 await click(`[...document.querySelectorAll('#pfChips-nouns li')].find(li=>li.firstChild.textContent==='van').querySelector('button')`);
 await fill($('#pfAdd-nouns'),'apple');
 await click($('#packSaveBtn'));
 s=await stored();
 assert.ok(!s.packs[0].nouns.includes('van')&&s.packs[0].nouns.includes('apple'),'typed-but-not-added words are saved too');

 await click($('#packDupBtn'));
 s=await stored();
 assert.equal(s.packs[1].name,'Short a copy');assert.deepEqual(s.packs[1].nouns,s.packs[0].nouns);
 assert.equal(await selected('editPackSelect'),'Short a copy');
 await fill($('#pfName'),'SHORT A');await click($('#packSaveBtn'));
 assert.match(await text('#packStatus'),/already named “Short a”/);
 assert.equal((await stored()).packs[1].name,'Short a copy','duplicate name refused, nothing overwritten');
 await fill($('#pfName'),'Short a – day 2');await click($('#packSaveBtn'));
 assert.deepEqual((await stored()).packs.map(p=>p.name),['Short a','Short a – day 2']);

 await click($('#packNewBtn'));await fill($('#pfName'),'Only helpers');await addWords('helpers','the, and');await click($('#packSaveBtn'));
 await click($('#packNewBtn'));await fill($('#pfName'),'Empty pack');await click($('#packSaveBtn'));
 assert.match(await text('#packStatus'),/no words yet/);
 s=await stored();assert.equal(s.packs.length,4,'empty lists and empty packs save');

 await fill($('#pfLesson'),'unsaved edit');
 await evaluate('__confirmAnswer=false');await choose('editPackSelect',s.packs[0].id);
 assert.equal(await evaluate("document.getElementById('pfLesson').value"),'unsaved edit','declining the prompt keeps the edit');
 assert.equal(await selected('editPackSelect'),'Empty pack');
 await evaluate('__confirmAnswer=true');await choose('editPackSelect',s.packs[0].id);
 assert.equal(await evaluate("document.getElementById('pfName').value"),'Short a');
 assert.ok((await chips('verbs')).includes("can't"));

 await choose('editPackSelect',s.packs[3].id);
 await evaluate('__confirmAnswer=false');await click($('#packDeleteBtn'));
 assert.equal((await stored()).packs.length,4,'cancelled delete keeps the pack');
 await evaluate('__confirmAnswer=true');await click($('#packDeleteBtn'));
 assert.equal((await stored()).packs.length,3);
 assert.deepEqual(await options('sourceSelect'),['Original word bank','Only helpers','Short a','Short a – day 2'],'alphabetical, deleted pack gone');
 assert.ok(!(await options('editPackSelect')).includes('Empty pack'));
 await press('Escape');
 assert.equal(await evaluate("document.getElementById('packPanel').open"),false,'Escape closes the panel');
});

test('a pack replaces the word bank; its words keep their exact spelling everywhere',async()=>{
 await open({script:seed([SHORT,ONLY],'pShort')});
 const count=SHORT.nouns.length+SHORT.verbs.length+SHORT.helpers.length;
 assert.equal(await evaluate("document.querySelectorAll('#wordGrid button.card').length"),count,'only the pack\'s words');
 assert.equal(await evaluate(word('dog')+'||'+word('girl')+'||null'),null,'no original-bank words mixed in');
 assert.ok(await evaluate("document.getElementById('catTabs').hidden&&document.getElementById('stepsBar').hidden&&getComputedStyle(document.getElementById('tenseBar')).display==='none'"));
 assert.deepEqual(await evaluate("[...document.querySelectorAll('.pack-group-label')].map(e=>e.textContent)"),['Nouns','Verbs','Helpers']);
 assert.equal(await selected('sourceSelect'),'Short a');
 assert.equal(await text('#packMeta'),'LessonLesson 12Reading levelGrade 1Skillshort a');

 const exact=['a','owl','an','cat','runs','I','is','iPad',"can't",'Sam’s','<b>on</b>','&amp;'];
 for(const w of exact)await click(word(w));
 assert.deepEqual(await tiles(),exact,'no a/an fix, no agreement, no re-capitalizing');
 const sentence="A owl an cat runs I is iPad can't Sam’s <b>on</b> &amp;.";
 assert.equal(await preview(),sentence);
 await click($('.btn-read'));
 assert.deepEqual(await evaluate('__spoken'),[sentence],'read aloud uses the same exact words');
 await click(word('<img src=x onerror="window.__xss=1">'));await sleep(100);
 assert.equal(await evaluate("document.querySelectorAll('#sentenceCards b,#sentencePreview b,#sentenceCards img,#wordGrid img,#wordGrid b').length"),0,'HTML stays text');
 assert.equal(await evaluate('window.__xss'),undefined);

 await click($('.btn-clear'));
 assert.deepEqual(await tiles(),[]);assert.equal(await preview(),'');
 for(const w of ['iPad','cat','cat','cat'])await click(word(w));
 assert.equal(await preview(),'iPad cat cat cat.','repeats allowed; mixed-case first word kept');
 await click($('.stype-btn[data-type="question"]'));assert.equal(await preview(),'iPad cat cat cat?');
 await click($('.stype-btn[data-type="statement"]'));

 await click($('.btn-clear'));
 for(const w of ['the','cat','sat','a','map'])await click(word(w));
 await click($('#autoLabelBtn'));
 assert.match(await preview(),/Subject.*Predicate/);
 assert.deepEqual(await evaluate("[...document.querySelectorAll('#sentencePreview .pw')].map(e=>e.textContent)"),['The','cat','sat','a','map']);
 assert.deepEqual(await evaluate("[...document.querySelectorAll('#sentencePreview .pw-do')].map(e=>e.textContent)"),['map'],'helper "a" is not labeled an object');
 await click($('#autoLabelBtn'));

 await click($('.btn-clear'));
 await fill($('#customWordInput'),'a');await choose('customWordCat','helper');await press('Enter');
 await click(word('owl'));
 await fill($('#customWordInput'),'  Zed  ');await choose('customWordCat','noun');await click($('#customWordAdd'));
 assert.deepEqual(await tiles(),['a','owl','Zed'],'typed words in a pack are exact too');
 assert.equal(await evaluate("[...document.querySelectorAll('#sentenceCards .card')].map(c=>c.dataset.cat).join()"),'helper,noun,noun');

 await chooseByName('sourceSelect','Only helpers');
 assert.deepEqual(await tiles(),['a','owl','Zed'],'switching packs keeps the sentence');
 assert.deepEqual(await evaluate("[...document.querySelectorAll('#wordGrid .card-word')].map(e=>e.textContent)"),['the','and']);
 assert.equal(await evaluate("document.getElementById('packMeta').children.length"),0);
 await click(word('and'));
 assert.deepEqual(await tiles(),['a','owl','Zed','and'],'the kept sentence is real, not just still on screen');
 await chooseByName('sourceSelect','Original word bank');
 assert.equal(await evaluate("document.querySelectorAll('#catTabs .cat-tab').length"),9);
 assert.equal(await evaluate("document.getElementById('stepsBar').hidden"),false);
 await click($('.stype-btn[data-type="statement"]'));  // redraws the board
 assert.deepEqual(await tiles(),['a','owl','Zed','and'],'switching to the bank keeps the sentence');
 assert.equal(await preview(),'A owl Zed and.','pack words stay exact in bank mode');
});

test('packs and the selected pack survive a refresh',async()=>{
 await open({script:seed([SHORT,ONLY])});
 await chooseByName('sourceSelect','Short a');
 await open({keep:true});
 assert.deepEqual(await options('sourceSelect'),['Original word bank','Only helpers','Short a']);
 assert.equal(await selected('sourceSelect'),'Short a');
 assert.ok(await evaluate(word('owl')+'!==undefined'));
 await openPanel();
 assert.equal(await evaluate("document.getElementById('pfName').value"),'Short a','panel opens on the active pack');
 assert.deepEqual(await chips('verbs'),SHORT.verbs);
});

test('export, re-import on a clean device, and re-import on the same device without overwriting',async()=>{
 await open({script:seed([SHORT,ONLY,pack('pDay2','Short a – day 2',{nouns:['cat']})],'pShort')});
 await openPanel();
 await click($('#exportAllBtn'));
 const [all]=await downloads();
 assert.match(all.name,/^word-packs-\d{4}-\d{2}-\d{2}\.json$/);
 assert.equal(all.type,'application/json');
 assert.equal(all.json.format,'build-a-sentence-word-packs');assert.equal(all.json.version,1);assert.equal(all.json.packs.length,3);
 assert.ok(all.json.packs.every(p=>!('id' in p)),'no internal ids');
 const short=all.json.packs.find(p=>p.name==='Short a');
 assert.deepEqual([short.nouns,short.verbs,short.helpers],[SHORT.nouns,SHORT.verbs,SHORT.helpers],'exact words exported');
 await click($('#exportOneBtn'));
 const [one]=await downloads();
 assert.equal(one.name,'word-pack-short-a.json');assert.deepEqual(one.json.packs.map(p=>p.name),['Short a']);

 await open();await openPanel();
 assert.match(await importFile(all.name,all.text),/Ready to import 3 packs/);
 assert.equal(await stored(),null,'preview changes nothing');
 await click($('#importPreview .pp-primary'));
 const strip=list=>list.map(({name,lesson,readingLevel,skill,nouns,verbs,helpers})=>({name,lesson,readingLevel,skill,nouns,verbs,helpers})).sort((a,b)=>a.name.localeCompare(b.name));
 assert.deepEqual(strip((await stored()).packs),strip(all.json.packs),'identical on the other device');
 await open({keep:true});
 assert.equal((await options('sourceSelect')).length,4,'imported packs survive refresh');

 await openPanel();
 const before=(await stored()).packs;
 assert.match(await importFile(all.name,all.text),/already used, so it will be added as “Short a \(2\)”/);
 await click($('#importPreview .pp-primary'));
 const now=(await stored()).packs;
 assert.deepEqual(now.slice(0,3),before,'existing packs untouched');
 assert.deepEqual(now.slice(3).map(p=>p.name).sort(),['Only helpers (2)','Short a (2)','Short a – day 2 (2)']);
 await importFile(one.name,one.text);
 await click('[...document.querySelectorAll("#importPreview button")].find(b=>b.textContent==="Cancel")');
 assert.equal((await stored()).packs.length,6);assert.match(await text('#ioStatus'),/cancelled/);
});

test('invalid files are rejected whole and change nothing',async()=>{
 await open({script:seed([SHORT])});await openPanel();
 const good={name:'Good',nouns:['dog']};
 const cases=[
  ['not JSON','this is { not json',/not valid JSON/],
  ['unrelated JSON',JSON.stringify({name:'my-app',version:'1.0.0',dependencies:{}}),/doesn't contain word packs/],
  ['wrong format',JSON.stringify({format:'something-else',packs:[good]}),/not a Build-A-Sentence/],
  ['newer version',JSON.stringify({format:'build-a-sentence-word-packs',version:2,packs:[good]}),/newer version/],
  ['no packs',JSON.stringify({packs:[]}),/no packs/],
  ['packs not a list',JSON.stringify({packs:'nope'}),/should be a list/],
  ['one good, one bad',JSON.stringify({packs:[good,{name:'Bad',nouns:['ok','two, words']}]}),/comma or line break/],
  ['missing name',JSON.stringify({packs:[{nouns:['a']}]}),/needs a "name"/],
  ['list not a list',JSON.stringify({packs:[{name:'X',verbs:'run, jump'}]}),/must be a list of words/],
  ['non-text word',JSON.stringify({packs:[{name:'X',nouns:[42]}]}),/is not text/],
  ['blank word',JSON.stringify({packs:[{name:'X',nouns:['  ']}]}),/is blank/],
  ['long word',JSON.stringify({packs:[{name:'X',nouns:['y'.repeat(41)]}]}),/longer than 40/],
  ['control character',JSON.stringify({packs:[{name:'X',nouns:['a\u0007b']}]}),/control character/],
  ['label not text',JSON.stringify({packs:[{name:'X',lesson:5,nouns:[]}]}),/"lesson" must be text/],
  ['long name',JSON.stringify({packs:[{name:'n'.repeat(61),nouns:[]}]}),/longer than 60/],
  ['over 1 MB',' '.repeat(1000001),/larger than 1 MB/],
 ];
 for(const [label,content,message] of cases){
  const before=JSON.stringify(await stored());
  const shown=await importFile('bad.json',content);
  assert.match(shown,/Nothing was imported/,label);assert.match(shown,message,label);
  assert.equal(JSON.stringify(await stored()),before,label+': storage unchanged');
 }
});

test('imported HTML stays text; BOM, single-pack and bare-list files import; the example file round-trips',async()=>{
 await open();await openPanel();
 await importFile('html.json',JSON.stringify({packs:[{name:'<img src=x onerror="window.__xss2=1">',skill:'<b>bold</b>',nouns:['<i>i</i>']}]}));
 assert.equal(await evaluate("document.querySelectorAll('#importPreview img,#importPreview b,#importPreview i').length"),0);
 await click($('#importPreview .pp-primary'));await click($('#packPanelClose'));
 await chooseByName('sourceSelect','<img src=x onerror="window.__xss2=1">');await sleep(100);
 assert.equal(await evaluate('window.__xss2'),undefined);
 assert.equal(await evaluate("document.querySelectorAll('img,#packMeta b,#wordGrid i').length"),0);
 assert.match(await text('#packMeta'),/<b>bold<\/b>/);

 await openPanel();
 assert.match(await importFile('bom.json','﻿'+JSON.stringify({name:'BOM pack',helpers:['the']})),/Ready to import 1 pack /);
 await click($('#importPreview .pp-primary'));
 assert.match(await importFile('list.json',JSON.stringify([{name:'Array pack',verbs:['go','go','go']}])),/2 repeated words inside a list will be kept once/);
 await click($('#importPreview .pp-primary'));
 assert.deepEqual((await stored()).packs.find(p=>p.name==='Array pack').verbs,['go']);

 await click($('#exampleBtn'));
 const [example]=await downloads();
 assert.equal(example.name,'word-packs-example.json');assert.equal(example.json.packs.length,2);
 assert.ok(example.json.packs.every(p=>/Example/.test(p.name)&&!/align|standard|curriculum/i.test(JSON.stringify(p))),'no alignment claims');
 const readme=await readFile(new URL('apps/sentences/README.md',root),'utf8');
 const documented=JSON.parse(readme.split('```json')[1].split('```')[0]).packs[0],first=example.json.packs[0];
 assert.deepEqual([documented.name,documented.nouns,documented.verbs,documented.helpers],[first.name,first.nouns,first.verbs,first.helpers],'README example matches the app');
 await open();await openPanel();
 await importFile(example.name,example.text);await click($('#importPreview .pp-primary'));
 assert.equal((await stored()).packs.length,2);assert.match(await text('#ioStatus'),/Imported 2 packs/);
});

test('tiles move and are removed by click, with no drag or hover needed',async()=>{
 await open();
 await click($('.cat-tab[data-cat="article"]'));await click(word('the'));
 await click($('.cat-tab[data-cat="noun"]'));await click($('[data-ntype="animal"]'));await click(word('dog'));
 await click($('.cat-tab[data-cat="verb"]'));await click(word('runs'));
 assert.deepEqual(await tiles(),['the','dog','runs']);
 assert.equal(await evaluate("[...document.querySelectorAll('#sentenceCards .card')].map(c=>c.classList.contains('just-added')).join()"),'false,false,true','only the new tile animates');
 assert.equal(await evaluate("document.querySelectorAll('.tile-tools').length"),0);
 await click($('#sentenceCards .tile-pick'));
 assert.equal(await evaluate("document.querySelectorAll('#sentenceCards .card.selected .tile-tool').length"),3);
 assert.equal(await evaluate("document.querySelector('#sentenceCards .card.selected .tile-pick').getAttribute('aria-pressed')"),'true');
 assert.equal(await evaluate("document.querySelectorAll('#sentenceCards .card.just-added').length"),0,'selecting does not replay animations');
 assert.equal(await evaluate("document.querySelector('.tile-tools [data-act=left]').disabled"),true);
 await click($('.tile-tools [data-act="right"]'));assert.deepEqual(await tiles(),['dog','the','runs']);
 await click($('.tile-tools [data-act="right"]'));assert.deepEqual(await tiles(),['dog','runs','the']);
 assert.equal(await evaluate("document.querySelector('.tile-tools [data-act=right]').disabled"),true);
 await click($('.tile-tools [data-act="left"]'));assert.deepEqual(await tiles(),['dog','the','runs']);
 await click($('.tile-tools [data-act="remove"]'));assert.deepEqual(await tiles(),['dog','runs']);
 const corner=await point($('#sentenceCards .card'));await mouse('mouseMoved',corner.x,corner.y);await sleep(300);
 assert.equal(await evaluate("getComputedStyle(document.querySelector('#sentenceCards .remove-btn')).opacity"),'1','corner ✕ on mouse hover, as before');
 await click($('#sentenceCards .remove-btn'));assert.deepEqual(await tiles(),['runs']);
});

test('keyboard: add from the bank, pick up, move and remove tiles, and reach the tools',async()=>{
 await open();
 await click($('.cat-tab[data-cat="article"]'));
 await focus($('#wordGrid button.card'));await press('Enter');await press(' ');
 assert.deepEqual(await tiles(),['the','the'],'Enter and Space add');
 assert.equal(await evaluate('document.activeElement.dataset.key'),'article_0','focus stays on the word');
 await press('Tab');await press('Enter');
 assert.deepEqual(await tiles(),['the','the','a']);
 await focus($('#sentenceCards .tile-pick',2));
 await press('ArrowLeft');assert.equal(await focused(),'the, Article, word 2 of 3','arrows move focus when nothing is picked up');
 await press('ArrowRight');await press('Enter');
 assert.equal(await text('#sentenceCards .card.selected .card-word'),'a');
 await press('ArrowLeft');await press('ArrowLeft');
 assert.deepEqual(await tiles(),['a','the','the']);assert.equal(await focused(),'a, Article, word 1 of 3','focus follows the tile');
 await press('Escape');assert.equal(await evaluate("document.querySelectorAll('#sentenceCards .card.selected').length"),0);
 await press('Delete');
 assert.deepEqual(await tiles(),['the','the']);assert.equal(await focused(),'the, Article, word 1 of 2');
 await press('Backspace');await press('Backspace');
 assert.deepEqual(await tiles(),[]);assert.equal(await focused(),'Your sentence','focus stays in the sentence area');

 await click(word('the'));await click(word('a'));
 await focus($('#sentenceCards .tile-pick'));await press('Enter');
 await press('Tab');assert.equal(await focused(),'Remove the','disabled ← and corner ✕ are skipped');
 await press('Tab');assert.equal(await focused(),'Move the right');
 await press('Enter');
 assert.deepEqual(await tiles(),['a','the']);assert.equal(await focused(),'the, Article, word 2 of 2','→ disabled at the end, so focus returns to the tile');
 await click(word('an'));
 await focus($('#sentenceCards .tile-pick',2));await press('Enter');
 await focus($('.tile-tools [data-act="left"]'));await press('Enter');
 assert.equal(await focused(),'Move '+(await tiles())[1]+' left','focus stays on ← so it can be pressed again');

 await click($('#teacherBtn'));await press('Escape');
 const unnamed=await evaluate(`[...document.querySelectorAll('button,select,input:not([type=file]),textarea,[role=button]')].filter(el=>
  !(el.getAttribute('aria-label')||(el.labels&&el.labels.length&&el.labels[0].textContent.trim())||el.textContent.trim())).map(el=>el.outerHTML.slice(0,80))`);
 assert.deepEqual(unnamed,[],'every control has a name');
});

test('touch: tap to add, tap a tile for ← ✕ →, touch-drag, and finger-sized targets',async()=>{
 await cdp('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:2,mobile:true});
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 try{
  await open();
  assert.ok(await evaluate("matchMedia('(hover: none)').matches&&matchMedia('(pointer: coarse)').matches"));
  await tap($('#teacherBtn'));await wait("document.getElementById('packPanel').open");
  await fill($('#pfName'),'Touch pack');
  await fill($('#pfAdd-nouns'),'cat\nmat\nbat');await tap($('#pfAddBtn-nouns'));
  await fill($('#pfAdd-verbs'),'sat');await tap($('#pfAddBtn-verbs'));
  await tap($('#pfChips-nouns li button',1));
  assert.deepEqual(await chips('nouns'),['cat','bat']);
  await tap($('#packUseBtn'));
  assert.equal(await selected('sourceSelect'),'Touch pack');assert.equal((await stored()).packs.length,1);
  for(const w of ['cat','sat','bat'])await tap(word(w));
  assert.deepEqual(await tiles(),['cat','sat','bat']);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#sentenceCards .remove-btn')).display"),'none','no hover-only ✕ on touch');
  await tap($('#sentenceCards .tile-pick',2));
  assert.equal(await evaluate("document.querySelectorAll('.tile-tools .tile-tool').length"),3);
  await tap($('.tile-tools [data-act="left"]'));await tap($('.tile-tools [data-act="left"]'));
  assert.deepEqual(await tiles(),['bat','cat','sat']);
  await tap($('.tile-tools [data-act="remove"]'));
  assert.deepEqual(await tiles(),['cat','sat']);
  await tap($('#sentenceCards .tile-pick'));await tap($('#sentenceCards .tile-pick'));
  assert.equal(await evaluate("document.querySelectorAll('.tile-tools').length"),0,'a second tap lets go');

  await tap(word('bat'));
  const from=await point($('#sentenceCards .card')),to=await point($('#sentenceCards .card',2));
  await touch('touchStart',[[from.x,from.y]]);
  for(let k=1;k<=8;k++)await touch('touchMove',[[from.x+(to.x-from.x)*k/8,from.y+(to.y-from.y)*k/8]]);
  await touch('touchEnd',[]);
  assert.deepEqual(await tiles(),['sat','bat','cat'],'touch-drag reorder still works');

  const small=await evaluate(`['#wordGrid button.card','#sentenceCards .card','#teacherBtn','#sourceSelect','.btn','.stype-btn','.label-auto','#customWordInput','#customWordAdd','#customWordCat']
   .flatMap(s=>[...document.querySelectorAll(s)].map(el=>[s,el.getBoundingClientRect()])).filter(([,r])=>r.width<40||r.height<40).map(([s,r])=>s+' '+Math.round(r.width)+'x'+Math.round(r.height))`);
  assert.deepEqual(small,[],'controls are at least 40×40');
  assert.ok(await evaluate("Math.min(...[...document.querySelectorAll('#wordGrid button.card')].map(b=>b.getBoundingClientRect().height))>=44"),'word tiles ≥44px');
  await tap($('#sentenceCards .tile-pick',1));
  assert.ok(await evaluate("[...document.querySelectorAll('.tile-tool')].every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44})"),'← ✕ → ≥44×44');

  await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:2,mobile:true});
  await open({keep:true});await tap($('#teacherBtn'));
  assert.ok(await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),'no sideways scroll at phone width');
  assert.ok(await evaluate("document.getElementById('packPanel').getBoundingClientRect().width<=innerWidth"));
 }finally{await desktop()}
});

test('blocked storage: packs work for the session, with a clear warning',async()=>{
 await open({script:"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}});"});
 assert.ok(await evaluate("document.querySelectorAll('#wordGrid button.card').length>0"));
 await openPanel();
 assert.match(await evaluate("document.getElementById('storageWarn').hidden?'':document.getElementById('storageWarn').textContent"),/lost when this page is refreshed/);
 await fill($('#pfName'),'Memory only');await addWords('nouns','cat');await click($('#packSaveBtn'));
 assert.match(await text('#packStatus'),/Saved for now only/);
 assert.ok((await options('sourceSelect')).includes('Memory only'));
 await click($('#exportAllBtn'));
 assert.equal((await downloads())[0].json.packs[0].name,'Memory only','export still works');
});

test('full storage: save and import fail clearly and change nothing',async()=>{
 await open({script:`const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(KEY)})throw new DOMException('full','QuotaExceededError');return set.call(this,k,v)};`});
 await openPanel();
 await fill($('#pfName'),'Wont fit');await click($('#packSaveBtn'));
 assert.match(await text('#packStatus'),/Could not save/);
 assert.ok(!(await options('sourceSelect')).includes('Wont fit'));
 await importFile('one.json',JSON.stringify({packs:[{name:'Imp',nouns:['a']}]}));
 await click($('#importPreview .pp-primary'));
 assert.match(await text('#ioStatus'),/Import failed/);
 assert.ok(!(await options('sourceSelect')).includes('Imp'));
 const prompts=dialogs.length;
 await open();
 assert.deepEqual(dialogs.slice(prompts),['beforeunload'],'leaving with an unsaved pack asks first');
});

test('unreadable saved data is kept and backed up, never erased',async()=>{
 await open({script:`localStorage.setItem(${JSON.stringify(KEY)},'{not valid json');`});
 await openPanel();
 assert.match(await text('#storageWarn'),/could not be read/);
 assert.equal(await evaluate(`localStorage.getItem(${JSON.stringify(KEY)})`),'{not valid json','opening does not erase it');
 await fill($('#pfName'),'Fresh');await click($('#packSaveBtn'));
 assert.equal(await evaluate(`localStorage.getItem(${JSON.stringify(KEY+'.unreadable-backup')})`),'{not valid json');
 assert.equal((await stored()).packs[0].name,'Fresh');
});

test('a save in another tab is picked up, not overwritten',async()=>{
 extra='try{localStorage.clear()}catch(e){}';
 await cdp('Page.navigate',{url:base+'/two-tabs.html'});
 const frame=(id,expr)=>evaluate(`(()=>{const w=document.getElementById('${id}').contentWindow,d=w.document;return (${expr})})()`);
 await wait("[...document.querySelectorAll('iframe')].every(f=>f.contentDocument?.getElementById('sourceSelect')?.options.length)");
 await frame('a',"(d.getElementById('teacherBtn').click(),d.getElementById('pfName').value='From tab 1',d.getElementById('packSaveBtn').click())");
 await sleep(300);
 assert.ok(await frame('b',"[...d.getElementById('sourceSelect').options].some(o=>o.textContent==='From tab 1')"));
 await frame('b',"(d.getElementById('teacherBtn').click(),d.getElementById('packNewBtn').click(),d.getElementById('pfName').value='From tab 2',d.getElementById('packSaveBtn').click())");
 assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})).packs.map(p=>p.name)`),['From tab 1','From tab 2']);
});

test('original word bank: agreement, tenses, a/an, steps, diagram and read aloud are unchanged',async()=>{
 await open();
 assert.equal(await evaluate("document.querySelectorAll('#catTabs .cat-tab').length"),9);
 assert.equal(await evaluate("document.querySelector('.cat-tab.active').dataset.cat"),'noun');
 assert.equal(await evaluate("document.querySelector('.step-pill.active').dataset.step"),'noun');
 await click(word('girl'));await click($('.cat-tab[data-cat="verb"]'));
 assert.equal(await evaluate("getComputedStyle(document.getElementById('tenseBar')).display"),'flex');
 await click(word('runs'));assert.deepEqual(await tiles(),['girl','runs']);
 await click(`[...document.querySelectorAll('#sentenceCards .card')[0].querySelectorAll('.noun-plural-toggle button')].find(b=>b.textContent==='Plur')`);
 assert.deepEqual(await tiles(),['girls','run'],'plural subject re-agrees the verb');
 await click(`[...document.querySelectorAll('#sentenceCards .card')[1].querySelectorAll('.verb-tense-toggle button')].find(b=>b.textContent==='Past')`);
 assert.deepEqual(await tiles(),['girls','ran']);
 await click($('#advancedTenseBtn'));
 assert.equal(await evaluate("getComputedStyle(document.getElementById('advancedTenseBar')).display"),'flex');
 await click($('#advancedTenseBtn'));
 await click($('.btn-clear'));
 await click($('.cat-tab[data-cat="pronoun"]'));await click(word('I'));
 await click($('.cat-tab[data-cat="verb"]'));await click(word('is'));
 assert.deepEqual(await tiles(),['I','am']);
 await click($('.btn-clear'));
 await click($('.cat-tab[data-cat="article"]'));await click(word('a'));
 await click($('.cat-tab[data-cat="noun"]'));await click($('[data-ntype="thing"]'));await click(word('apple'));
 // As before this change: the preview fixes a/an at once; the tile catches up on the next render.
 assert.equal(await preview(),'An apple.');assert.deepEqual(await tiles(),['a','apple']);
 await click($('.stype-btn[data-type="statement"]'));assert.deepEqual(await tiles(),['an','apple']);
 await click($('.btn-clear'));
 await click($('[data-ntype="person"]'));await click(word('teacher'));
 await click($('.cat-tab[data-cat="verb"]'));await click(word('gives'));
 await click($('.cat-tab[data-cat="article"]'));await click(word('the'));
 await click($('.cat-tab[data-cat="noun"]'));await click(word('student'));
 await click($('.cat-tab[data-cat="article"]'));await click(word('a'));
 await click($('.cat-tab[data-cat="noun"]'));await click($('[data-ntype="thing"]'));await click(word('book'));
 assert.equal(await evaluate("[...document.querySelectorAll('.step-pill.done')].map(p=>p.dataset.step).join()"),'noun,article');
 await click($('#autoLabelBtn'));
 assert.deepEqual(await evaluate("[...document.querySelectorAll('#sentencePreview .sub-label')].map(e=>e.textContent)"),['Verb','Ind. Object','Direct Object']);
 assert.equal(await text('#sentencePreview .pw-subject'),'Teacher');
 await click($('#autoLabelBtn'));
 await click($('.stype-btn[data-type="exclamation"]'));
 assert.equal(await preview(),'Teacher gives the student a book!');
 await click($('.btn-read'));assert.deepEqual(await evaluate('__spoken'),['Teacher gives the student a book!']);
 await click($('.btn-undo'));assert.equal((await tiles()).length,5);
 await click($('.cat-tab[data-cat="adjective"]'));
 assert.equal(await evaluate("document.getElementById('customWordInput').placeholder"),'Custom adjective…');
 assert.equal(await evaluate("document.getElementById('customWordCat').hidden"),true);
 await fill($('#customWordInput'),'sparkly');await press('Enter');
 assert.equal(await evaluate("(c=>c.dataset.cat+':'+c.querySelector('.card-word').textContent)(document.querySelector('#sentenceCards .card:last-child'))"),'adjective:sparkly');
});

test('mouse drag-and-drop still reorders tiles',async()=>{
 await open();
 await click($('.cat-tab[data-cat="determiner"]'));
 for(const w of ['this','that','these'])await click(word(w));
 const a=await point($('#sentenceCards .card')),b=await point($('#sentenceCards .card',2));
 await cdp('Input.setInterceptDrags',{enabled:true});
 try{
  const dragged=once('Input.dragIntercepted');
  await mouse('mouseMoved',a.x,a.y);await mouse('mousePressed',a.x,a.y,1);
  await mouse('mouseMoved',a.x+15,a.y,1);await mouse('mouseMoved',b.x,b.y,1);
  const {data}=await dragged;
  for(const type of ['dragEnter','dragOver','drop'])await cdp('Input.dispatchDragEvent',{type,x:b.x,y:b.y,data});
  await mouse('mouseReleased',b.x,b.y);
 }finally{await cdp('Input.setInterceptDrags',{enabled:false})}
 assert.deepEqual(await tiles(),['that','these','this']);
});

test('no uncaught page errors during the run',()=>{
 assert.deepEqual(pageErrors,[]);
});
