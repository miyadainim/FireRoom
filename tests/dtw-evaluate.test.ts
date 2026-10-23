/** SYNTHETIC fixtures exercise software gates only, never physical validation. */
import {describe,it,expect} from 'vitest';
import {evaluateAttempt,validateReference} from '../src/vision/dtw/evaluate';
import type {PoseFrame} from '../src/shared/contracts';
import type {DtwReference} from '../src/vision/dtw/types';
function frames(duration=2000,idle=false):PoseFrame[]{return Array.from({length:41},(_,i)=>{
 const landmarks=Array.from({length:33},()=>({x:0,y:0,z:0,visibility:1}));landmarks[11].x=-.5;landmarks[12].x=.5;landmarks[15]={x:-.4,y:-.4,z:idle?0:-Math.sin(Math.PI*i/40),visibility:1};landmarks[16]={x:.4,y:-.4,z:0,visibility:1};
 return {schemaVersion:1,sessionId:'synthetic',sequence:i,timestampMs:i*duration/40,landmarks,worldLandmarks:landmarks.map(p=>({...p})),tracking:'tracked',stance:'orthodox',mirrored:false};
 });}
function reference():DtwReference{return {schemaVersion:1,kind:'fireroom-dtw-reference',id:'SYNTHETIC-NOT-PHYSICALLY-REVIEWED',drill:'jab',stance:'orthodox',geometryMode:'world-3d',cameraPlacement:'synthetic frontal',review:{status:'reviewed',reviewer:'synthetic test metadata only',reviewedAt:'2026-10-15T00:00:00Z'},frames:frames(),phases:[{punch:'jab',hand:'left',guardStartMs:0,extensionMs:1000,recoveryMs:2000}]};}
describe('bounded DTW evaluation, synthetic only',()=>{
 it('requires reviewed reference',()=>{expect(evaluateAttempt(frames(),null).status).toBe('reference-required');const r=reference();r.review.status='pending';expect(evaluateAttempt(frames(),r).status).toBe('reference-required');});
 it('validates reference and rejects idle reference',()=>{expect(validateReference(reference()).valid).toBe(true);const r=reference();r.frames=frames(2000,true);expect(validateReference(r).valid).toBe(false);});
 it('accepts observable synthetic movement at varied speed, abstains on elbow form',()=>{for(const duration of [1600,2000,2600]){const result=evaluateAttempt(frames(duration),reference());expect(result.status,JSON.stringify(result)).toBe('aligned');expect(result.findings.find(f=>f.criterion==='elbow')?.status).toBe('not-assessable');}});
 it('rejects idle and incomplete recovery',()=>{expect(evaluateAttempt(frames(2000,true),reference()).status).toBe('rejected');const f=frames();for(let i=21;i<f.length;i++)f[i].worldLandmarks![15].z=-1;expect(evaluateAttempt(f,reference()).status).toBe('rejected');});
 it('rejects wrong hand and dropped opposite guard',()=>{const f=frames();for(const p of f){p.worldLandmarks![16].z=p.worldLandmarks![15].z;p.worldLandmarks![15].z=0;}expect(evaluateAttempt(f,reference()).status).toBe('rejected');const drop=frames();for(const p of drop)p.worldLandmarks![16].y=1;const result=evaluateAttempt(drop,reference());expect(result.status).toBe('aligned');expect(result.findings.some(f=>f.criterion==='guard'&&f.status==='deviation')).toBe(true);});
 it('rejects tracking loss, gaps and missing world coordinates without fallback',()=>{const f=frames();f.splice(10,12);expect(evaluateAttempt(f,reference()).status).toBe('rejected');const missing=frames();for(const p of missing)delete p.worldLandmarks;expect(evaluateAttempt(missing,reference()).status).toBe('rejected');});
 it('requires both prescribed punches in correct anatomical order',()=>{
 const first=frames(),second=frames();
 for(const f of second){f.sequence+=41;f.timestampMs+=2050;f.worldLandmarks![16].z=f.worldLandmarks![15].z;f.worldLandmarks![15].z=0;}
 const combo=[...first,...second],r=reference();r.drill='jab-cross';r.frames=combo;r.phases.push({punch:'cross',hand:'right',guardStartMs:2050,extensionMs:3050,recoveryMs:4050});
 expect(validateReference(r).valid).toBe(true);expect(evaluateAttempt(combo,r).status).toBe('aligned');
 const reversed=combo.map(f=>({...f,worldLandmarks:f.worldLandmarks!.map(p=>({...p}))}));
 for(const f of reversed){const old=f.worldLandmarks![15].z;f.worldLandmarks![15].z=f.worldLandmarks![16].z;f.worldLandmarks![16].z=old;}
 expect(evaluateAttempt(reversed,r).status).toBe('rejected');
 expect(evaluateAttempt(first,r).status).toBe('rejected');
 });
 it('preserves camera-relative direction while allowing body translation and scale',()=>{
 const r=reference();for(const f of r.frames){const z=f.worldLandmarks![15].z;f.worldLandmarks![15].x-=z;f.worldLandmarks![15].z=0;}
 const attempt=r.frames.map(f=>({...f,worldLandmarks:f.worldLandmarks!.map(p=>({...p,x:p.x*2+4,y:p.y*2-3,z:p.z*2+1}))}));
 expect(evaluateAttempt(attempt,r).status).toBe('aligned');
 });
 it('rejects half excursion while allowing moderate amplitude variation',()=>{
 for(const ratio of [.5,.55,.9]){const attempt=frames();for(const f of attempt)f.worldLandmarks![15].z*=ratio;
 expect(evaluateAttempt(attempt,reference()).status).toBe(ratio<.75?'rejected':'aligned');}
 });
 it('does not throw on malformed reference phases',()=>{const r=reference();r.drill='jab-cross';r.phases=[null as never,{punch:'cross',hand:'right',guardStartMs:0,extensionMs:1,recoveryMs:2}];expect(validateReference(r).valid).toBe(false);expect(()=>evaluateAttempt(frames(),r)).not.toThrow();});
 it('rejects malformed order, hand, size and review',()=>{const r=reference();r.phases[0].hand='right';expect(validateReference(r).valid).toBe(false);r.phases[0].hand='left';r.review.reviewedAt='bad';expect(validateReference(r).valid).toBe(false);});
});
