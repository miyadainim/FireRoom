import { describe, expect, it } from 'vitest';
import { PunchRecognizer } from '../src/vision/recognizer';
import type { Hand, PoseFrame } from '../src/shared/contracts';

// Adversarial synthetic geometry: verifies software invariants, never camera accuracy.
function pose(sequence:number, extended:Hand[]=[]):PoseFrame {
 const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));
 landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){
  landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:-.02,visibility:1};
 }
 for(const hand of extended){const [e,w,x]=hand==='left'?[13,15,.35]:[14,16,.65];landmarks[e]={x,y:.43,z:-.3,visibility:1};landmarks[w]={x,y:.41,z:-.6,visibility:1};}
 return {schemaVersion:1,sessionId:'independent-vv',sequence,timestampMs:sequence*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks};
}

describe('independent reference-driven detector regressions',()=>{
 it('does not label hands below shoulders as guard merely because they are close',()=>{
  const r=new PunchRecognizer(),f=pose(0);f.landmarks[15].y=.65;f.landmarks[16].y=.65;observe(r,f);
  expect(r.diagnostics().arms?.left.guard).toBe(false);expect(r.diagnostics().arms?.right.guard).toBe(false);
 });
 it('does not interpret coherent body translation as wrist travel',()=>{
  const r=new PunchRecognizer();const events=[];
  for(let i=0;i<12;i++){const f=pose(i);for(const l of f.landmarks){l.x+=i*.025;l.z-=i*.025;}events.push(...observe(r,f));}
  expect(events).toEqual([]);expect(r.diagnostics().arms?.left.travel).toBeLessThan(.001);
 });
 it('preserves extension order when the cross recovers before the jab',()=>{
  const r=new PunchRecognizer();const events=[pose(0),pose(1,['left']),pose(2,['left','right']),pose(3,['left']),pose(4),pose(5)].flatMap(f=>observe(r,f));
  expect(events.map(e=>e.type)).toEqual(['jab','cross']);
  expect(events[1].timestampMs).toBeGreaterThanOrEqual(events[0].timestampMs);
  expect(events[1].sequence).toBeGreaterThan(events[0].sequence);
 });
 it('flushes recovered-but-buffered events on confidence loss',()=>{
  const r=new PunchRecognizer();[pose(0),pose(1,['left']),pose(2,['left','right']),pose(3,['left'])].forEach(f=>observe(r,f));
  const lost=pose(4);lost.landmarks[13].visibility=.64;
  expect(observe(r,lost)).toEqual([]);expect(observe(r,pose(5))).toEqual([]);
 });
 it('never releases an incomplete earlier arm as a recovered punch after timeout',()=>{
  const r=new PunchRecognizer();const events=[pose(0),pose(1,['left']),pose(2,['left','right']),pose(3,['left'])].flatMap(f=>observe(r,f));
  for(let i=4;i<25;i++)events.push(...observe(r,pose(i,['left'])));
  expect(events.some(e=>e.type==='jab')).toBe(false);
 });
});

import { PoseRecorder, evaluateRecording } from '../src/vision/recording';
describe('independent labeled pose recording evaluation',()=>{
 it('requires explicit start, clones landmarks, removes pairing token and omits active trials',()=>{
  const recorder=new PoseRecorder(),f=pose(0);recorder.append(f);expect(recorder.status().frames).toBe(0);
  recorder.start('none');recorder.append(f);f.landmarks[15].x=99;
  expect(recorder.snapshot().trials).toEqual([]);recorder.stop();
  const saved=recorder.snapshot();expect(saved.trials[0].frames[0].landmarks[15].x).not.toBe(99);expect(saved.trials[0].frames[0].sessionId).toBe('trial-1');
  saved.trials[0].frames[0].landmarks[15].x=99;expect(recorder.snapshot().trials[0].frames[0].landmarks[15].x).not.toBe(99);
 });
 it('bounds each trial and discards malformed input',()=>{
  const recorder=new PoseRecorder();recorder.start('none');recorder.append({...pose(0),schemaVersion:2} as unknown as PoseFrame);
  expect(recorder.status().frames).toBe(0);for(let i=0;i<601;i++)recorder.append(pose(i));
  expect(recorder.status().recording).toBe(false);expect(recorder.snapshot().trials[0].frames).toHaveLength(600);recorder.clear();expect(recorder.snapshot().trials).toEqual([]);
 });
 it('separates exact sequence correctness from per-class matches and resets across trials',()=>{
  const frames=heldFrames([pose(0),pose(1,['left']),pose(2),pose(3),pose(4,['right']),pose(5)]);
  const result=evaluateRecording({schemaVersion:1,kind:'fireroom-labeled-poses',trials:[{label:'cross-jab',frames},{label:'none',frames:[pose(0),pose(1)]}]});
  expect(result.trials[0].detected).toEqual(['jab','cross']);expect(result.trials[0].exact).toBe(false);expect(result.matchedPunches).toBe(2);expect(result.exactTrials).toBe(1);expect(result.totalTrials).toBe(2);
 });
 it('reports extra detections and missing events without claiming physical accuracy',()=>{
  const frames=heldFrames([pose(0),pose(1,['left']),pose(2)]);
  const result=evaluateRecording({schemaVersion:1,kind:'fireroom-labeled-poses',trials:[{label:'none',frames},{label:'cross',frames:[pose(0)]}]});
  expect(result.falsePunches).toBe(1);expect(result.missedPunches).toBe(1);expect(result.exactTrials).toBe(0);
 });
});

// Each legacy fixture observation is held for 200ms at 100ms intervals.
// This preserves its geometric intent while supplying the newly required guard history.
function observe(r:PunchRecognizer, f:PoseFrame){
 const events=[];
 for(let i=0;i<3;i++)events.push(...r.update({...f,sequence:f.sequence*3+i,timestampMs:f.timestampMs*3+i*100}));
 return events;
}

function heldFrames(frames:PoseFrame[]){return frames.flatMap(f=>Array.from({length:3},(_,i)=>({...f,sequence:f.sequence*3+i,timestampMs:f.timestampMs*3+i*100})));}
