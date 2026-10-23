import {describe,it,expect} from 'vitest';
import {PunchRecognizer} from '../src/vision/recognizer';
import type {PoseFrame} from '../src/shared/contracts';
// Synthetic geometry tests diagnostic truthfulness, not real camera recognition accuracy.
function sample(sequence:number,extended=false):PoseFrame {
 const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));
 landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){
  landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:-.02,visibility:1};
 }
 if(extended){landmarks[13]={x:.35,y:.43,z:-.3,visibility:1};landmarks[15]={x:.35,y:.41,z:-.6,visibility:1};}
 return {schemaVersion:1,sessionId:'diagnostic-fixture',sequence,timestampMs:sequence*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks};
}
describe('recognizer diagnostic evidence',()=>{
 it('reports measured guard and extended phases without emitting before recovery',()=>{
  const r=new PunchRecognizer();observe(r,sample(0));
  expect(r.diagnostics().arms?.left.phase).toBe('guard');expect(r.diagnostics().arms?.left.guard).toBe(true);
  expect(observe(r,sample(1,true))).toEqual([]);
  const arm=r.diagnostics().arms?.left;
  expect(arm?.phase).toBe('extended');expect(arm?.extension).toBeGreaterThan(.92);expect(arm?.travel).toBeGreaterThan(.45);expect(arm?.confidence).toBe(1);
  expect(observe(r,sample(2))).toHaveLength(1);
 });
 it.each(['lost','low-confidence'] as const)('clears visible diagnostic measurements and pending punch on %s',tracking=>{
  const r=new PunchRecognizer();observe(r,sample(0));observe(r,sample(1,true));
  const next=sample(2);next.tracking=tracking;if(tracking==='lost')next.landmarks=[];
  expect(observe(r,next)).toEqual([]);expect(r.diagnostics().arms).toBeNull();expect(r.diagnostics().reason).toBeTruthy();
  expect(observe(r,sample(3))).toEqual([]);expect(r.diagnostics().arms?.left.phase).toBe('guard');
 });
 it('does not expose stale measurements after low landmark visibility',()=>{
  const r=new PunchRecognizer();observe(r,sample(0));const f=sample(1,true);f.landmarks[15].visibility=.1;
  expect(observe(r,f)).toEqual([]);expect(r.diagnostics().arms).toBeNull();expect(observe(r,sample(2))).toEqual([]);
 });
});

// Each legacy fixture observation is held for 200ms at 100ms intervals.
// This preserves its geometric intent while supplying the newly required guard history.
function observe(r:PunchRecognizer, f:PoseFrame){
 const events=[];
 for(let i=0;i<3;i++)events.push(...r.update({...f,sequence:f.sequence*3+i,timestampMs:f.timestampMs*3+i*100}));
 return events;
}
