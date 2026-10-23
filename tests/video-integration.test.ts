import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {mountFormCoach} from '../src/game/form-coach';
import type {PoseFrame,Hand} from '../src/shared/contracts';

/** Small native-DOM adapter; checks actual controller + real engine, no browser/camera claim. */
class Element {
 value='';textContent='';innerHTML='';disabled=false;hidden=false;open=false;attributes:Record<string,string>={};
 setAttribute(name:string,value:string){this.attributes[name]=value;} getAttribute(name:string){return this.attributes[name]??null;}onclick:(()=>void)|null=null;children:Element[]=[];listeners:Record<string,(()=>void)[]>={};
 addEventListener(name:string,fn:()=>void){(this.listeners[name]??=[]).push(fn);}
 replaceChildren(){this.children=[];this.textContent='';} append(el:Element){this.children.push(el);}click(){if(!this.disabled)this.onclick?.();}
 change(value:string){this.value=value;this.listeners.change?.forEach(fn=>fn());}
}
function fixture(n:number,hand?:Hand,d?:number):PoseFrame {
 const landmarks=Array.from({length:33},()=>({x:.5,y:.2,z:-.05,visibility:1}));
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.25,z:-.08,visibility:1};}
 const worldLandmarks=structuredClone(landmarks);
 if(hand&&d!==undefined){const [s,e,w]=hand==='left'?[11,13,15]:[12,14,16],p=worldLandmarks[s];worldLandmarks[w]={...p,z:p.z-d};worldLandmarks[e]={...p,y:p.y+.12,z:p.z-d/2};landmarks[w].y=.45;landmarks[w].z=-.5;}
 return {schemaVersion:1,sessionId:'ui-fixture',cameraConfigurationId:'ui-camera',sequence:n,timestampMs:n*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks,worldLandmarks,imageSize:{width:1000,height:1000}};
}
let now=0;
beforeEach(()=>{now=0;vi.useFakeTimers({toFake:['setTimeout','clearTimeout']});vi.stubGlobal('performance',{now:()=>now});vi.stubGlobal('document',{createElement:()=>new Element()});});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
function workflow(){const elements=new Map<string,Element>(),get=(key:string)=>{if(!elements.has(key))elements.set(key,new Element());return elements.get(key)!;};get('stance').value='orthodox';get('exercise').value='jab';let connected=true,n=0,markup='';const demo=vi.fn(),assessment=vi.fn(),onRecording=vi.fn();const root={set innerHTML(v:string){markup=v;},querySelector:(s:string)=>get(s.match(/data-form="([^"]+)/)![1])};const ui=mountFormCoach(root as unknown as HTMLElement,{connected:()=>connected,demonstrate:demo,onAssessment:assessment,onRecording});
 const tick=(hand?:Hand,d?:number,change?:(f:PoseFrame)=>void)=>{now+=100;const f=fixture(n++,hand,d);change?.(f);ui.receive(f);vi.advanceTimersByTime(100);};
 const stage=(hand?:Hand,d?:number,ticks=80,change?:(f:PoseFrame)=>void)=>{for(let i=0;i<ticks;i++)tick(hand,d,change);};
 const start=()=>{tick();get('placement').value='slightly left, chest height';get('calibrate').click();};
 const calibrate=(optional=true)=>{start();stage(undefined,undefined,130);stage('left',.65);stage('right',.75);if(optional){get('improve').click();stage('left',.3,130);stage('right',.3);}};
 return {ui,get,tick,stage,start,calibrate,demo,assessment,onRecording,markup:()=>markup,setConnected:(v:boolean)=>{connected=v;}};
}

describe('automatic phone video run integration',()=>{
 it('records one whole setup including preparation and stops after the final required capture',()=>{const w=workflow();w.start();expect(w.onRecording.mock.calls.map(c=>c[0])).toMatchObject([{action:'start',kind:'calibration'}]);w.stage(undefined,undefined,130);w.stage('left',.65);w.stage('right',.75);const events=w.onRecording.mock.calls.map(c=>c[0]);expect(events.map(e=>e.action)).toEqual(['start','stop']);expect(events[1].runId).toBe(events[0].runId);});
 it('stops a preparation recording on user cancellation, and creates a new run on resume',()=>{const w=workflow();w.start();w.get('stop').click();let events=w.onRecording.mock.calls.map(c=>c[0]);expect(events.map(e=>e.action)).toEqual(['start','stop']);w.get('capture').click();events=w.onRecording.mock.calls.map(c=>c[0]);expect(events.map(e=>e.action)).toEqual(['start','stop','start']);expect(events[2].runId).not.toBe(events[0].runId);});
 it('ends setup video when fresh camera observations stop arriving',()=>{const w=workflow();w.start();now+=1000;vi.advanceTimersByTime(1000);expect(w.onRecording.mock.calls.map(c=>c[0].action)).toEqual(['start','stop']);});
 it('keeps automatic failed-check retries in one recording then stops when retries exhaust',()=>{const w=workflow();w.start();w.stage(undefined,undefined,130);const unstable=(f:PoseFrame)=>{f.worldLandmarks![15].z=-(f.sequence%2?.3:.9);};w.stage('left',.65,240,unstable);expect(w.onRecording.mock.calls.map(c=>c[0].action)).toEqual(['start','stop']);expect(w.get('capture').hidden).toBe(false);});
 it('starts practice video before countdown and stops it when feedback is available',()=>{const w=workflow();w.calibrate();w.onRecording.mockClear();w.get('attempt').click();expect(w.onRecording.mock.calls.map(c=>c[0])).toMatchObject([{action:'start',kind:'practice'}]);w.stage(undefined,undefined,35);w.stage('left',.65,5);w.stage(undefined,undefined,9);expect(w.ui.getAssessment()).not.toBeNull();const events=w.onRecording.mock.calls.map(c=>c[0]);expect(events.map(e=>e.action)).toEqual(['start','stop']);expect(events[1].runId).toBe(events[0].runId);});
 it.each(['exercise','stance','placement'])('stops active practice on %s changes',role=>{const w=workflow();w.calibrate(false);w.onRecording.mockClear();w.get('attempt').click();w.get(role).change(role==='exercise'?'cross':role==='stance'?'southpaw':'new camera target');expect(w.onRecording.mock.calls.map(c=>c[0].action)).toEqual(['start','stop']);});
 it('stops recording after same-resolution phone camera restart',()=>{const w=workflow();w.start();w.tick(undefined,undefined,f=>{f.cameraConfigurationId='new-camera';});expect(w.onRecording.mock.calls.map(c=>c[0].action)).toEqual(['start','stop']);});
 it('stops recording on new pairing and rejects duplicate stop callbacks',()=>{const w=workflow();w.start();w.ui.reset();w.ui.reset();expect(w.onRecording.mock.calls.map(c=>c[0].action)).toEqual(['start','stop']);});
});
