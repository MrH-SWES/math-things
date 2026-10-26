// Executes the production VIEW + POINTER sections in a minimal DOM/event fixture.
// This is deterministic logic coverage, NOT browser, rendering, or native input validation.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../apps/place-value-blocks-v2/index.html',import.meta.url),'utf8');
const actual=html.slice(html.indexOf('  // ═══════ VIEW ═══════'),html.indexOf('  // ═══════ KEYBOARD ═══════'));
assert.ok(actual.includes('function cancelDrag')&&actual.includes('function zoomAt'),'production sections found');
function fixture(){
 const listeners=new Map(), effects={drops:0,trades:0,changed:0};
 const el=id=>({id,listeners:new Map(),attrs:{},textContent:'',disabled:false,style:{},classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},setPointerCapture(){},remove(){this.removed=true},appendChild(t){t.parent=this},addEventListener(type,fn){this.listeners.set(type,fn)},getBoundingClientRect(){return {left:0,right:900,top:500,bottom:600}}});
 const nodes=Object.fromEntries(['surface','layer','carry','mat','dock','zoom','zoomIn','zoomOut','zoomReset','live','matClipRect'].map(k=>[k,el(k)]));
 let next=0;const trains=new Map();
 const addTrain=(kind,count,x,y)=>{const t={id:++next,kind,count,x,y,busy:false,held:false,el:el('train'),fx:el('fx')};t.el.dataset={id:String(t.id)};trains.set(t.id,t);return t};
 const context={Map,Math,performance:{now:()=>100},setTimeout:fn=>{fn();return 1},clearTimeout(){},innerWidth:900,innerHeight:640,U:20,KINDS:[{w:1,h:1,depth:1},{w:1,h:10,depth:1}],DS:.354,r2:v=>Math.round(v*100)/100,$:id=>nodes[id],layer:nodes.layer,carry:nodes.carry,mat:nodes.mat,dock:nodes.dock,zoomBox:nodes.zoom,zoomIn:nodes.zoomIn,zoomOut:nodes.zoomOut,zoomReset:nodes.zoomReset,matClipRect:nodes.matClipRect,live:nodes.live,trains,
 addEventListener(type,fn,opts){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push({fn,capture:opts===true})},
 addTrain,lift(t,on){t.held=on;(on?nodes.carry:nodes.layer).appendChild(t.el)},clampXY:(t,x,y)=>({x,y}),place(){},pop(){},ms:v=>0,stagePos:()=>({x:10,y:10}),drop(){effects.drops++},trade(){effects.trades++},changed(){effects.changed++},slot:()=>({x:0,y:0}),buildTrain(){}};
 vm.createContext(context);vm.runInContext(actual+'\nglobalThis.api={view,fingers,drags,zoomAt,resetView,cancelDrag};',context);
 function target(kind,t){return {closest(selector){if(selector==='#surface, #board')return ['surface','train'].includes(kind)?this:null;if(selector==='a, button')return ['bin','zoom'].includes(kind)?this:null;if(selector==='.train')return kind==='train'?t.el:null;if(selector==='use')return null;if(selector==='.bin')return kind==='bin'?{dataset:{kind:'0'}}:null;if(selector==='#dock, #zoom, #footer')return ['bin','zoom'].includes(kind)?this:null;if(selector==='.train, a, button')return kind==='train'?t.el:null;return null}}}
 function fire(type,{kind='surface',t=null,...props}={}){let stopped=false;const e={pointerId:1,pointerType:'touch',clientX:200,clientY:200,button:0,ctrlKey:false,metaKey:false,deltaY:0,deltaMode:0,target:target(kind,t),preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){stopped=true},...props};
 for(const l of listeners.get(type)||[])if(l.capture){l.fn(e);if(stopped)return e}
 const node=kind==='train'?nodes.layer:kind==='bin'?nodes.dock:null;if(node?.listeners.has(type))node.listeners.get(type)(e);
 for(const l of listeners.get(type)||[])if(!l.capture){l.fn(e);if(stopped)break}return e;
 }
 return {api:context.api,fire,addTrain,effects,trains,nodes};
}
test('production Ctrl-wheel keeps focal point fixed and clamps scale; cabinet/native wheel untouched',()=>{
 const f=fixture(),v=f.api.view;const e=f.fire('wheel',{ctrlKey:true,deltaY:-100,clientX:400,clientY:200});assert.equal(e.defaultPrevented,true);assert.ok(v.s>1.28);assert.ok(Math.abs((400-v.x)/v.s-400)<.001);assert.ok(Math.abs((200-v.y)/v.s-200)<.001);
 assert.equal(f.fire('wheel',{kind:'bin',ctrlKey:true,deltaY:-100}).defaultPrevented,undefined);assert.equal(f.fire('wheel',{deltaY:-100}).defaultPrevented,undefined);
 for(let i=0;i<30;i++)f.fire('wheel',{ctrlKey:true,deltaY:-100});assert.equal(v.s,3);assert.equal(f.nodes.zoomIn.disabled,true);f.api.resetView();assert.equal(v.s,1);
});
test('production pinch converts two touches starting on one block into camera gesture',()=>{
 const f=fixture(),t=f.addTrain(1,1,10,10);f.fire('pointerdown',{kind:'train',t,pointerId:1,clientX:200});f.fire('pointerdown',{kind:'train',t,pointerId:2,clientX:300});assert.equal(f.api.drags.size,0);assert.equal(f.api.fingers.size,2);
 f.fire('pointermove',{pointerId:1,clientX:150});f.fire('pointermove',{pointerId:2,clientX:350});assert.equal(f.api.view.s,2);assert.equal(t.x,10);assert.equal(f.effects.trades,0);assert.equal(f.effects.drops,0);
 f.fire('pointerup',{pointerId:1});f.fire('pointerup',{pointerId:2});assert.equal(f.api.fingers.size,0);
});
test('production pinch converts touches on separate blocks without moving either',()=>{
 const f=fixture(),a=f.addTrain(1,1,10,10),b=f.addTrain(1,1,20,10);f.fire('pointerdown',{kind:'train',t:a,pointerId:1,clientX:200});f.fire('pointerdown',{kind:'train',t:b,pointerId:2,clientX:400});f.fire('pointermove',{pointerId:2,clientX:500});assert.equal(f.api.view.s,1.5);assert.equal(f.api.drags.size,0);assert.equal(a.x,10);assert.equal(b.x,20);assert.equal(f.trains.size,2);
});
test('production cancellation discards provisional bin train, but never drops/trades/deletes existing train',()=>{
 const f=fixture();f.fire('pointerdown',{kind:'bin'});assert.equal(f.trains.size,1);f.fire('pointercancel');assert.equal(f.trains.size,0);
 const t=f.addTrain(1,1,10,10);f.fire('pointerdown',{kind:'train',t});f.fire('pointermove',{clientX:240});assert.equal(t.held,true);f.fire('pointercancel');assert.equal(f.trains.size,1);assert.equal(t.held,false);assert.equal(f.api.drags.size,0);assert.equal(f.effects.drops,0);assert.equal(f.effects.trades,0);
});
test('production drag converts screen deltas by camera scale and release invokes one drop',()=>{
 const f=fixture();f.api.zoomAt(2,400,200);const t=f.addTrain(1,1,20,10);f.fire('pointerdown',{kind:'train',t,clientX:400,clientY:200,pointerType:'mouse'});f.fire('pointermove',{clientX:460,clientY:240,pointerType:'mouse'});assert.equal(t.x,21.5);assert.equal(t.y,11);f.fire('pointerup',{clientX:460,clientY:240,pointerType:'mouse'});assert.equal(f.effects.drops,1);assert.equal(t.held,false);
});
test('production zoom buttons and non-modifier keyboard controls update accessible percentage',()=>{
 const f=fixture();f.nodes.zoomIn.listeners.get('click')();assert.equal(f.api.view.s,1.25);assert.equal(f.nodes.zoomReset.attrs['aria-label'],'Zoom 125%. Reset zoom');f.fire('keydown',{key:'-',altKey:false});assert.equal(f.api.view.s,1);f.fire('keydown',{key:'+',ctrlKey:true});assert.equal(f.api.view.s,1);f.nodes.zoomOut.listeners.get('click')();assert.equal(f.api.view.s,.8);f.nodes.zoomReset.listeners.get('click')();assert.equal(f.api.view.s,1);
});
test('production active drag ignores competing zoom buttons and wheel without losing anchor',()=>{
 const f=fixture(),t=f.addTrain(1,1,10,10);f.fire('pointerdown',{kind:'train',t});f.fire('wheel',{ctrlKey:true,deltaY:-100});f.nodes.zoomIn.listeners.get('click')();assert.equal(f.api.view.s,1);f.fire('pointermove',{clientX:240,clientY:220});assert.equal(t.x,12);assert.equal(t.y,11);f.fire('pointercancel');f.nodes.zoomIn.listeners.get('click')();assert.equal(f.api.view.s,1.25);
});

test('production bin drag and mat gestures cannot concurrently change the camera',()=>{
 const f=fixture();f.api.zoomAt(2,400,200);const before={...f.api.view};
 f.fire('pointerdown',{kind:'bin',pointerId:1});
 f.fire('pointerdown',{pointerId:2,clientX:300});
 f.fire('pointermove',{pointerId:2,clientX:350});
 f.fire('pointerdown',{pointerId:3,clientX:450});
 f.fire('pointermove',{pointerId:3,clientX:500});
 assert.deepEqual({...f.api.view},before);assert.equal(f.api.fingers.size,0);
 assert.equal(f.api.drags.size,1);f.fire('pointercancel',{pointerId:1});
 f.fire('pointerdown',{pointerId:4,clientX:300});assert.equal(f.api.fingers.size,1);
 f.fire('pointerdown',{kind:'bin',pointerId:5});assert.equal(f.api.drags.size,0);
 assert.equal(f.trains.size,0,'no provisional piece spawned during camera gesture');
 f.fire('pointercancel',{pointerId:4});
});

test('zoom controls retain high-contrast text without faded default opacity',()=>{
 const zoom=html.match(/#zoom \{([\s\S]*?)\n    \}/)[1];
 const buttons=html.match(/#zoom button \{([\s\S]*?)\n    \}/)[1];
 assert.match(zoom,/opacity: 1;/);assert.match(buttons,/color: var\(--text-main\)/);
 assert.match(html,/#zoom button:focus-visible \{ border-color: #007AFF; \}/);
});
