import { describe,it,expect } from 'vitest';
import { PunchRecognizer } from '../src/vision/recognizer';
import type { PoseFrame, Hand, Stance } from '../src/shared/contracts';
function frame(sequence:number,extended?:Hand,stance:Stance='orthodox'):PoseFrame{
 const landmarks=Array.from({length:33},()=>({x:0.5,y:0.5,z:0,visibility:1}));
 landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x] of [[11,13,15,0.35],[12,14,16,0.65]]){landmarks[s]={x,y:0.45,z:0,visibility:1};landmarks[e]={x,y:0.65,z:0,visibility:1};landmarks[w]={x,y:0.35,z:-0.02,visibility:1};}
 if(extended){const [e,w,x]=extended==='left'?[13,15,0.35]:[14,16,0.65];landmarks[e]={x,y:0.43,z:-0.3,visibility:1};landmarks[w]={x,y:0.41,z:-0.6,visibility:1};}
 return {schemaVersion:1,sessionId:'fixture',sequence,timestampMs:sequence*100,stance,mirrored:false,tracking:'tracked',landmarks};
}
describe('synthetic anatomical punch cycles',()=>{
 it.each(['orthodox','southpaw'] as Stance[])('maps both anatomical hands in %s',stance=>{const r=new PunchRecognizer();observe(r,frame(0,undefined,stance));observe(r,frame(1,'left',stance));expect(observe(r,frame(2,undefined,stance))[0]?.type).toBe(stance==='orthodox'?'jab':'cross');observe(r,frame(3,undefined,stance));observe(r,frame(4,'right',stance));expect(observe(r,frame(5,undefined,stance))[0]?.type).toBe(stance==='orthodox'?'cross':'jab');});
 it('does not emit a held extension or unarmed motion',()=>{const r=new PunchRecognizer();expect(observe(r,frame(0,'left'))).toEqual([]);expect(observe(r,frame(1,'left'))).toEqual([]);expect(observe(r,frame(2))).toEqual([]);});
 it.each(['lost','low-confidence'] as const)('resets at %s tracking',tracking=>{const r=new PunchRecognizer();observe(r,frame(0));observe(r,frame(1,'left'));observe(r,{...frame(2),tracking,landmarks:tracking==='lost'?[]:frame(2).landmarks});expect(observe(r,frame(3))).toEqual([]);});
 it('resets low landmark visibility, timestamp gaps, stance and sessions',()=>{for(const change of ['visibility','gap','stance','session']){const r=new PunchRecognizer();observe(r,frame(0));observe(r,frame(1,'left'));const f=frame(2);if(change==='visibility')f.landmarks[15].visibility=0.1;if(change==='gap')f.timestampMs=1000;if(change==='stance')f.stance='southpaw';if(change==='session')f.sessionId='other';expect(observe(r,f)).toEqual([]);}});
 it('ignores duplicates and out of order frames',()=>{const r=new PunchRecognizer();observe(r,frame(0));observe(r,frame(1,'left'));expect(observe(r,frame(0))).toEqual([]);expect(observe(r,frame(2))).toHaveLength(0);expect(observe(r,frame(2))).toEqual([]);});
 it('reports observed opposite guard drop',()=>{const r=new PunchRecognizer();observe(r,frame(0));const f=frame(1,'left');f.landmarks[16].y=0.95;observe(r,f);expect(observe(r,frame(2))[0]?.guardMaintained).toBe(false);});
 it('does not count 20 stationary non-punch samples',()=>{const r=new PunchRecognizer();expect(Array.from({length:20},(_,i)=>observe(r,frame(i))).flat()).toEqual([]);});
});

// Each legacy fixture observation is held for 200ms at 100ms intervals.
// This preserves its geometric intent while supplying the newly required guard history.
function observe(r:PunchRecognizer, f:PoseFrame){
 const events=[];
 for(let i=0;i<3;i++)events.push(...r.update({...f,sequence:f.sequence*3+i,timestampMs:f.timestampMs*3+i*100}));
 return events;
}
