import {describe,it,expect} from 'vitest';
import {assessForwardDepth,observeForwardDepth} from '../src/vision/forward-depth';
import type {PoseFrame} from '../src/shared/contracts';
function frame(time:number,forward=false):PoseFrame {
 const points=Array.from({length:33},()=>({x:0,y:0,z:0,visibility:1}));
 points[11]={x:-.2,y:0,z:0,visibility:1};points[12]={x:.2,y:0,z:0,visibility:1};
 points[13]=forward?{x:-.2,y:.05,z:-.25,visibility:1}:{x:-.2,y:.25,z:0,visibility:1};
 points[15]=forward?{x:-.2,y:0,z:-.5,visibility:1}:{x:-.2,y:0,z:-.1,visibility:1};
 return {schemaVersion:1,sessionId:'depth',sequence:time,timestampMs:time,tracking:'tracked',stance:'orthodox',mirrored:false,landmarks:points.map(p=>({...p})),worldLandmarks:points};
}
const baseline=()=>[frame(0),frame(100)];
describe('experimental world forward evidence',()=>{
 it('supports sustained camera-forward movement and extension',()=>{const a=assessForwardDepth(baseline(),[frame(150,true),frame(250,true)],'left');expect(a.status).toBe('supported');expect(a.peakForwardShoulderWidths).toBeCloseTo(1);expect(a.sustainedDurationMs).toBe(100);});
 it('uses anatomical right-arm landmarks independently',()=>{const swap=(f:PoseFrame)=>{for(const points of [f.landmarks,f.worldLandmarks!]){points[14]={...points[13],x:.2};points[16]={...points[15],x:.2};}return f;};expect(assessForwardDepth(baseline().map(swap),[frame(150,true),frame(250,true)].map(swap),'right').status).toBe('supported');});
 it('keeps supported peak inside a sustained qualifying run, excluding nonqualifying spikes',()=>{const spike=frame(350,true);spike.worldLandmarks![15].z=-1;spike.worldLandmarks![13]={x:-.2,y:1,z:0,visibility:1};const a=assessForwardDepth(baseline(),[frame(150,true),frame(250,true),spike],'left');expect(a.status).toBe('supported');expect(a.peakTimestampMs).toBe(150);expect(a.peakForwardShoulderWidths).toBeCloseTo(1);expect(a.samples[2].qualifies).toBe(false);});
 it('excludes a larger isolated qualifying point outside the sustained run',()=>{const spike=frame(450,true);spike.worldLandmarks![15].z=-1;spike.worldLandmarks![13]={x:-.2,y:.05,z:-.5,visibility:1};const a=assessForwardDepth(baseline(),[frame(150,true),frame(250,true),frame(350),spike],'left');expect(a.status).toBe('supported');expect(a.samples[3].qualifies).toBe(true);expect(a.peakTimestampMs).toBe(150);expect(a.peakForwardShoulderWidths).toBeCloseTo(1);});
 it('does not count backward movement',()=>{const frames=[frame(150,true),frame(250,true)];frames.forEach(f=>f.worldLandmarks![15].z=.5);expect(assessForwardDepth(baseline(),frames,'left').status).toBe('not-supported');});
 it('is invariant to whole-body translation',()=>{const frames=[frame(150),frame(250)];frames.forEach(f=>f.worldLandmarks!.forEach(p=>{p.x+=2;p.y-=3;p.z-=1;}));expect(assessForwardDepth(baseline(),frames,'left').status).toBe('not-supported');});
 it('never substitutes image z when world is missing',()=>{const f=frame(150,true);delete f.worldLandmarks;expect(observeForwardDepth(f,'left').available).toBe(false);expect(assessForwardDepth(baseline(),[f,frame(250,true)],'left').status).toBe('unavailable');});
 it('requires image and world visibility',()=>{for(const geometry of ['landmarks','worldLandmarks'] as const){const f=frame(150,true);f[geometry]![13].visibility=.64;expect(observeForwardDepth(f,'left').available).toBe(false);}});
 it('rejects a brief excursion',()=>expect(assessForwardDepth(baseline(),[frame(150,true),frame(200,true)],'left').status).toBe('not-supported'));
 it('rejects an isolated spike',()=>expect(assessForwardDepth(baseline(),[frame(150),frame(250,true),frame(350)],'left').status).toBe('not-supported'));
 it('requires 70 percent coverage and missing samples break continuity',()=>{const frames=[frame(150,true),frame(250,true),frame(350,true)];frames[1].worldLandmarks![15].visibility=.1;expect(assessForwardDepth(baseline(),frames,'left').status).toBe('unavailable');});
 it('rejects stale gaps, repeated timestamps and weak baselines',()=>{expect(assessForwardDepth(baseline(),[frame(150,true),frame(600,true)],'left').status).toBe('not-supported');expect(assessForwardDepth(baseline(),[frame(150,true),frame(150,true)],'left').status).toBe('unavailable');expect(assessForwardDepth([frame(0)],[frame(150,true),frame(250,true)],'left').status).toBe('unavailable');});
 it('rejects non-finite input and tiny shoulder geometry',()=>{const f=frame(150,true);f.worldLandmarks![15].z=NaN;expect(observeForwardDepth(f,'left').available).toBe(false);const tiny=frame(150,true);tiny.worldLandmarks![12].x=-.19;expect(observeForwardDepth(tiny,'left').available).toBe(false);});
});
