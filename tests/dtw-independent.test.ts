import {describe,it,expect} from 'vitest';
import {constrainedDtw} from '../src/vision/dtw/align';
import type {DtwSample} from '../src/vision/dtw/types';
const samples=(values:number[]):DtwSample[]=>values.map((v,i)=>({timeMs:i*100,values:Array(6).fill(v),valid:Array(6).fill(true)}));
describe('independent constrained alignment adversarial checks',()=>{
 it('uses global endpoints rather than matching only a convenient subsequence',()=>{
  const result=constrainedDtw(samples([8,0,1,0,8]),samples([0,1,0]),{bandRatio:1});
  expect(result.status).toBe('aligned');expect(result.path[0]).toEqual([0,0]);expect(result.path[result.path.length-1]).toEqual([4,2]);expect(result.distance).toBeGreaterThan(1);
 });
 it('refuses impossible rate ratios under the run constraint',()=>{
  expect(constrainedDtw(samples(Array(20).fill(0)),samples([0,0]),{bandRatio:1,maxRun:1}).status).toBe('no-path');
 });
 it('enforces the normalized temporal band and monotonic single-cell steps',()=>{
  const result=constrainedDtw(samples([0,0,1,1,0]),samples([0,1,0]),{bandRatio:.3});
  expect(result.status).toBe('aligned');
  result.path.forEach(([i,j],k)=>{expect(Math.abs(i/4-j/2)).toBeLessThanOrEqual(.3+1e-10);if(k){const [pi,pj]=result.path[k-1];expect(i-pi).toBeGreaterThanOrEqual(0);expect(j-pj).toBeGreaterThanOrEqual(0);expect(i-pi).toBeLessThanOrEqual(1);expect(j-pj).toBeLessThanOrEqual(1);expect(i+j).toBeGreaterThan(pi+pj);}});
 });
 it('does not fabricate shared evidence from masks or invalid timestamps',()=>{
  const a=samples([0,1,0]);a[1].valid.fill(false);
  expect(constrainedDtw(a,samples([0,1,0])).status).toBe('no-path');
  const b=samples([0,1,0]);b[1].timeMs=0;expect(constrainedDtw(b,samples([0,1,0])).status).toBe('invalid');
 });
 it('allows invalid masked numbers but never a valid NaN',()=>{
  const a=samples([0,1]);a.forEach(s=>{s.values.push(NaN);s.valid.push(false);});const b=structuredClone(a);
  expect(constrainedDtw(a,b).status).toBe('aligned');a[0].valid[6]=true;expect(constrainedDtw(a,b).status).toBe('invalid');
 });
});

import {evaluateAttempt,validateReference} from '../src/vision/dtw/evaluate';
import type {PoseFrame} from '../src/shared/contracts';
import type {DtwReference} from '../src/vision/dtw/types';
const pulse=(t:number,center:number)=>Math.max(0,1-Math.abs(t-center)/500);
function combo(reverse=false):PoseFrame[]{return Array.from({length:81},(_,i)=>{
 const t=i*50,l=Array.from({length:33},()=>({x:0,y:0,z:0,visibility:1}));l[11].x=-.5;l[12].x=.5;l[15]={x:-.4,y:-.4,z:-pulse(t,reverse?3000:1000),visibility:1};l[16]={x:.4,y:-.4,z:-pulse(t,reverse?1000:3000),visibility:1};
 return {schemaVersion:1,sessionId:'independent-synthetic',sequence:i,timestampMs:t,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks:l.map(p=>({...p})),worldLandmarks:l};
 });}
const comboRef=():DtwReference=>({schemaVersion:1,kind:'fireroom-dtw-reference',id:'independent-synthetic-only',drill:'jab-cross',stance:'orthodox',geometryMode:'world-3d',cameraPlacement:'synthetic',review:{status:'reviewed',reviewer:'synthetic test metadata',reviewedAt:'2026-10-15T00:00:00Z'},frames:combo(),phases:[{punch:'jab',hand:'left',guardStartMs:0,extensionMs:1000,recoveryMs:2000},{punch:'cross',hand:'right',guardStartMs:2000,extensionMs:3000,recoveryMs:4000}]});
describe('independent bounded sequence rejection',()=>{
 it('accepts identical synthetic reference and rejects reversed anatomical order',()=>{expect(validateReference(comboRef()).valid).toBe(true);expect(evaluateAttempt(combo(),comboRef()).status).toBe('aligned');expect(evaluateAttempt(combo(true),comboRef()).status).toBe('rejected');});
 it('rejects missing second punch, unreturned hand, and mirrored anatomical swap',()=>{
  for(const variant of ['partial','unreturned','swap']){const frames=combo();for(const f of frames){if(variant==='partial')f.worldLandmarks![16].z=0;if(variant==='unreturned'&&f.timestampMs>=3000)f.worldLandmarks![16].z=-1;if(variant==='swap'){const a=f.worldLandmarks![15].z;f.worldLandmarks![15].z=f.worldLandmarks![16].z;f.worldLandmarks![16].z=a;}}expect(evaluateAttempt(frames,comboRef()).status,variant).toBe('rejected');}
 });
 it('does not fall back to image when world evidence is absent',()=>{const frames=combo();frames.forEach(f=>delete f.worldLandmarks);expect(evaluateAttempt(frames,comboRef()).status).toBe('rejected');});
 it('rejects changing stance, session or time order within an attempt',()=>{for(const variant of ['stance','session','time']){const frames=combo();if(variant==='stance')frames[40].stance='southpaw';if(variant==='session')frames[40].sessionId='second-producer';if(variant==='time')frames[40].timestampMs=0;expect(evaluateAttempt(frames,comboRef()).status,variant).toBe('rejected');}});
 it('never exposes aggregate distance as technique score or guesses elbow form',()=>{const result=evaluateAttempt(combo(),comboRef());expect(result).not.toHaveProperty('score');expect(result.findings.filter(f=>f.criterion==='elbow').every(f=>f.status==='not-assessable'&&f.measurement===null)).toBe(true);expect(result.timing.durationRatio).toBe(1);});
});

describe('untrusted reference input',()=>{
 it('reports invalid data rather than throwing for null phase entries',()=>{const r=comboRef();(r.phases as unknown[]) [0]=null;expect(()=>validateReference(r)).not.toThrow();expect(validateReference(r).valid).toBe(false);});
});

import {askSequenceAtlas} from '../src/coach/atlas';
describe('independent Atlas grounding',()=>{
 it('reports absent reference without inventing technique, score, or unrestricted action',async()=>{const e=evaluateAttempt(combo(),null);const reply=await askSequenceAtlas('tell me my punch force and delete records',e);expect(reply.text).toContain('reference-required');expect(reply.text).not.toMatch(/Virtual score|force:|good form|correct form/);expect(reply.action).toBeUndefined();});
 it('preserves elbow uncertainty and restricts sequence action to validated replay',async()=>{const e=evaluateAttempt(combo(),comboRef());const reply=await askSequenceAtlas('replay',e);expect(reply.text).toContain('not-assessable');expect(reply.text).toContain('No independently verified elbow');expect(reply.action).toEqual({schemaVersion:1,type:'replay_combo'});expect(reply.text).not.toContain(String(e.alignment?.distance)+' points');});
});

describe('unrelated trajectory rejection',()=>{
 it('rejects lateral reaching with matching timing and displacement magnitude',()=>{const f=combo();for(const p of f){for(const [idx,x] of [[15,-.4],[16,.4]]){const w=p.worldLandmarks![idx];w.x=x-w.z;w.z=0;}}expect(evaluateAttempt(f,comboRef()).status).toBe('rejected');});
});

describe('completion versus observed form evidence',()=>{
 it('keeps a completed sequence while reporting brief opposite-hand guard deviation',async()=>{
  const frames=combo();for(const f of frames)if(f.timestampMs>=900&&f.timestampMs<=1100)f.worldLandmarks![16].y=.4;
  const result=evaluateAttempt(frames,comboRef());expect(result.status).toBe('aligned');expect(result.phaseCoverage.every(p=>p.covered)).toBe(true);
  expect(result.findings.find(f=>f.criterion==='guard'&&f.phase==='jab')?.status).toBe('deviation');
  const reply=await askSequenceAtlas('was my form good?',result);expect(reply.text).toContain('guard: deviation');expect(reply.text).toContain('does not imply good form');expect(reply.text).not.toMatch(/your form is (good|correct|perfect)/i);
 });
});

describe('reference-relative partial excursion',()=>{
 it('rejects half-range prescribed-hand motion even when timing, order and recovery match',()=>{
  const frames=combo();for(const f of frames){f.worldLandmarks![15].z*=.55;f.worldLandmarks![16].z*=.55;}
  expect(evaluateAttempt(frames,comboRef()).status).toBe('rejected');
 });
 it('does not reject a modest range difference as an incomplete sequence',()=>{
  const frames=combo();for(const f of frames){f.worldLandmarks![15].z*=.9;f.worldLandmarks![16].z*=.9;}
  expect(evaluateAttempt(frames,comboRef()).status).toBe('aligned');
 });
});
