import {readFileSync,readdirSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {evaluatePrescribedAttempt} from '../src/vision/prescribed';
import {MovementCycleRecognizer} from '../src/vision/movement-cycle';
import type {PoseFrame} from '../src/shared/contracts';
const clean=(r:ReturnType<typeof evaluatePrescribedAttempt>)=>{const copy=structuredClone(r);for(const o of copy.outcomes)delete o.evidence.forwardDepth;for(const p of copy.punches)delete p.cycle.evidence.forwardDepth;return copy;};
describe('reversible 3D evidence integration',()=>{
 it('off is the default and shadow does not change any saved Coach verdict or movement',()=>{
  for(const n of readdirSync('fireroom_trials').filter(n=>/^fireroom-prescribed-attempt.*\.json$/.test(n))){const d=JSON.parse(readFileSync(`fireroom_trials/${n}`,'utf8'));const original=evaluatePrescribedAttempt(d.frames,{...d.config,forwardMode:'off'});expect(evaluatePrescribedAttempt(d.frames,{...d.config,forwardMode:undefined})).toEqual(original);expect(clean(evaluatePrescribedAttempt(d.frames,{...d.config,forwardMode:'shadow'}))).toEqual(original);}
 });
 it('missing world geometry leaves assist identical to 2D apart from diagnostics',()=>{const d=JSON.parse(readFileSync('fireroom_trials/fireroom-prescribed-attempt (19).json','utf8'));const frames=d.frames.map((f:PoseFrame)=>{const copy={...f};delete copy.worldLandmarks;return copy;});expect(clean(evaluatePrescribedAttempt(frames,{...d.config,forwardMode:'assist'}))).toEqual(evaluatePrescribedAttempt(frames,{...d.config,forwardMode:'off'}));});
 it('adds no punch for whole-body forward translation with an unchanged image guard',()=>{
  const d=JSON.parse(readFileSync('fireroom_trials/fireroom-prescribed-attempt (18).json','utf8'));const seed=d.frames[0] as PoseFrame;const detector=new MovementCycleRecognizer({forwardMode:'assist'});const cues=[];
  for(let i=0;i<20;i++){const f=structuredClone(seed);f.sequence=i;f.timestampMs=i*100;if(f.worldLandmarks)f.worldLandmarks.forEach(p=>p.z-=i*.1);detector.update(f);cues.push(...detector.supportedOutwardMovements());}expect(cues).toHaveLength(0);
 });
 it('assist can corroborate a small 2D candidate with sustained world forward extension, and off reverts it',()=>{
  const run=(forwardMode:'off'|'shadow'|'assist')=>{const detector=new MovementCycleRecognizer({forwardMode});const cues=[],outcomes=[];
   for(let i=0;i<9;i++){const moving=i>=3&&i<=5;const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));landmarks[0].y=.3;
    for(const [s,e,w,eye,x] of [[11,13,15,2,.35],[12,14,16,5,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[eye]={x,y:.3,z:0,visibility:1};landmarks[w]={x:x+(w===15&&moving?.09:0),y:.35,z:0,visibility:1};}
    const world=Array.from({length:33},()=>({x:0,y:0,z:0,visibility:1}));world[11]={x:-.2,y:0,z:0,visibility:1};world[12]={x:.2,y:0,z:0,visibility:1};world[13]={x:-.2,y:moving?.05:.25,z:moving?-.25:0,visibility:1};world[15]={x:-.2,y:0,z:moving?-.5:-.1,visibility:1};
    const f:PoseFrame={schemaVersion:1,sessionId:'experiment',timestampMs:i*100,sequence:i,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks,worldLandmarks:world,imageSize:{width:1000,height:1000}};outcomes.push(...detector.update(f));cues.push(...detector.supportedOutwardMovements());
   }return {cues,outcomes};};
  expect(run('off').cues).toHaveLength(0);expect(run('shadow').cues).toHaveLength(0);const assist=run('assist');expect(assist.cues.length).toBeGreaterThan(0);expect(assist.outcomes.some(o=>o.classification==='completed'&&o.evidence.forwardDepth?.status==='supported')).toBe(true);
 });
 it.each(['fireroom-prescribed-attempt.json','fireroom-prescribed-attempt (1).json','fireroom-prescribed-attempt (19).json'])('does not invent opposite-hand punches in %s',name=>{const d=JSON.parse(readFileSync(`fireroom_trials/${name}`,'utf8'));const a=evaluatePrescribedAttempt(d.frames,{...d.config,forwardMode:'off'}),b=evaluatePrescribedAttempt(d.frames,{...d.config,forwardMode:'assist'});expect(b.punches.map(p=>p.cycle.type)).toEqual(a.punches.map(p=>p.cycle.type));expect(b.status).toBe(a.status);});
});
