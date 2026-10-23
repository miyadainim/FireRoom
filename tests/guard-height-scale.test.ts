import {describe,it,expect} from 'vitest';
import {GuardHeightScale,guardHeightReference} from '../src/vision/guard-height-scale';
import {observeGuardHeight,assessGuardHeight} from '../src/vision/guard-height';
import type {PoseFrame} from '../src/shared/contracts';
function pose(t:number,width=.3,leftY=.35):PoseFrame {const p=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));p[0]={...p[0],y:.2};p[11]={...p[11],x:.5-width/2,y:.45};p[12]={...p[12],x:.5+width/2,y:.45};for(const [eye,w,side] of [[2,15,-1],[5,16,1]]){p[eye]={...p[eye],x:.5+side*.1,y:.25};p[w]={...p[w],x:.5+side*.1,y:w===15?leftY:.35};}return {schemaVersion:1,sessionId:'scale',sequence:t,timestampMs:t,stance:'orthodox',mirrored:false,tracking:'tracked',imageSize:{width:1000,height:1000},landmarks:p};}
const baseline=[0,100,200,300].map(t=>pose(t));
describe('stable guard height scale',()=>{
 it('requires a300ms two-hand stable hold and uses its median',()=>{expect(guardHeightReference(baseline.slice(0,3))).toBeUndefined();expect(guardHeightReference(baseline)).toBeCloseTo(.3);});
 it('freezes pre-punch width without changing lateral or movement geometry',()=>{const f=pose(400,.2);expect(observeGuardHeight(f,'left').eyeOffsetShoulderWidths).toBeCloseTo(.5);expect(observeGuardHeight(f,'left',undefined,.3).eyeOffsetShoulderWidths).toBeCloseTo(1/3);expect(observeGuardHeight(f,'left',undefined,.3).lateralOffsetShoulderWidths).toBe(observeGuardHeight(f,'left').lateralOffsetShoulderWidths);});
 it('does not hide sustained low wrists',()=>{const frames=[400,500,600,700].map(t=>pose(t,.2,.5));expect(assessGuardHeight(frames,'left',baseline).status).toBe('deviation');});
 it('does not learn from hands outside the face-height band and resets on tracking loss',()=>{const s=new GuardHeightScale();baseline.forEach(f=>s.update(f));for(const t of [400,500,600,700])expect(s.update(pose(t,.2,0))).toBeCloseTo(.3);expect(s.update({...pose(800),tracking:'lost',landmarks:[]})).toBeUndefined();});
 it('resets after capture/stance/gap changes instead of carrying an old scale',()=>{for(const change of [{cameraConfigurationId:'new'},{stance:'southpaw' as const},{timestampMs:1000,sequence:1000}]){const s=new GuardHeightScale();baseline.forEach(f=>s.update(f));expect(s.update({...pose(400),...change})).toBeUndefined();}});
 it('falls back to instantaneous scale when no stable pre-punch guard exists',()=>{const r=assessGuardHeight([pose(400),pose(500)],'left');expect(r.evidence.samples[0].heightScale?.source).toBe('instantaneous');});
 it('reacquires after corroborated distance change rather than using the old allowance',()=>{
  const s=new GuardHeightScale();baseline.forEach(f=>s.update(f));
  const closer=(t:number)=>{const f=pose(t,.6,.3);for(const [i,x,y] of [[0,.5,0],[2,.3,.1],[5,.7,.1],[11,.2,.5],[12,.8,.5],[13,.2,.7],[14,.8,.7],[15,.3,.3],[16,.7,.3]])f.landmarks[i]={x,y,z:0,visibility:1};return f;};
  expect(s.update(closer(400))).toBeUndefined();for(const t of [500,600])expect(s.update(closer(t))).toBeUndefined();expect(s.update(closer(700))).toBeCloseTo(.6);
 });
 it('expires a reference during prolonged missing eye visibility',()=>{const s=new GuardHeightScale();baseline.forEach(f=>s.update(f));for(const t of [400,500,600,700]){const f=pose(t);f.landmarks[2].visibility=.1;s.update(f);}const f=pose(710);f.landmarks[2].visibility=.1;expect(s.update(f)).toBeUndefined();});
});
