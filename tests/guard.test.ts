import { describe,it,expect } from 'vitest';
import { GuardEstimator } from '../src/vision/guard';
import type { PoseFrame } from '../src/shared/contracts';
function frame(sequence:number):PoseFrame{
 const landmarks=Array.from({length:33},()=>({x:0.5,y:0.2,z:-0.05,visibility:1}));
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){
  landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.25,z:-.08,visibility:1};
 }
 return {schemaVersion:1,sessionId:'guard',sequence,timestampMs:sequence*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks};
}
function pair(change?:(f:PoseFrame)=>void){const r=new GuardEstimator();const a=frame(0),b=frame(1);change?.(a);change?.(b);r.update(a);return r.update(b);}
describe('face-relative guard observation and history',()=>{
 it('requires a sustained bent hand near face',()=>{const r=new GuardEstimator();expect(r.update(frame(0)).left.status).toBe('not-guard');const e=r.update(frame(1)).left;expect(e.status).toBe('guard');expect(e.stableMs).toBe(100);expect(e.elbowAngle).toBeLessThan(110);});
 it('rejects shoulder-close lowered hands',()=>{expect(pair(f=>{f.landmarks[15].y=.55;}).left.status).toBe('not-guard');});
 it('rejects a straight arm even with wrist near the face',()=>{expect(pair(f=>{f.landmarks[13]={x:.35,y:.35,z:-.04,visibility:1};}).left.reason).toContain('Elbow');});
 it('rejects estimated depth behind face',()=>{expect(pair(f=>{f.landmarks[15].z=.1;}).left.reason).toContain('behind');});
 it('rejects a wrist far ahead despite image-plane overlap and a bent elbow',()=>{expect(pair(f=>{f.landmarks[15].z=-.8;f.landmarks[13].z=-.9;}).left.reason).toContain('too far ahead');});
 it('returns unknown immediately when face is unavailable, with no shoulder fallback',()=>{const r=new GuardEstimator();r.update(frame(0));expect(r.update(frame(1)).left.status).toBe('guard');const f=frame(2);f.landmarks[0].visibility=.2;expect(r.update(f).left.status).toBe('unknown');expect(r.update(frame(3)).left.status).toBe('not-guard');});
 it('requires the nose above shoulder midpoint',()=>{expect(pair(f=>{f.landmarks[0].y=.6;}).left.status).toBe('unknown');});
 it('rejects a rapid pass-by, then establishes a stationary recovery',()=>{const r=new GuardEstimator(),a=frame(0);a.landmarks[15].x=.05;r.update(a);const b=frame(1);expect(r.update(b).left.reason).toContain('quickly');expect(r.update(frame(2)).left.status).toBe('not-guard');expect(r.update(frame(3)).left.status).toBe('guard');});
 it('does not preserve guard through arm occlusion and treats hands independently',()=>{const r=new GuardEstimator();r.update(frame(0));r.update(frame(1));const f=frame(2);f.landmarks[15].visibility=.2;const e=r.update(f);expect(e.left.status).toBe('unknown');expect(e.right.status).toBe('guard');expect(r.update(frame(3)).left.status).toBe('not-guard');});
 it.each(['gap','session','stance','lost','order'])('resets history after %s',change=>{const r=new GuardEstimator();r.update(frame(0));r.update(frame(1));const f=frame(2);if(change==='gap')f.timestampMs=1000;if(change==='session')f.sessionId='other';if(change==='stance')f.stance='southpaw';if(change==='lost'){f.tracking='lost';f.landmarks=[];}if(change==='order'){f.sequence=0;f.timestampMs=0;}expect(r.update(f).left.status).not.toBe('guard');});
 it('is invariant to image translation and uniform coordinate scale',()=>{const base=pair().left;const scaled=pair(f=>{for(const p of f.landmarks){p.x=p.x*.8+.1;p.y=p.y*.8+.03;p.z=p.z*.8+.2;}}).left;expect(scaled.status).toBe('guard');expect(scaled.faceDistance).toBeCloseTo(base.faceDistance!);expect(scaled.depthOffset).toBeCloseTo(base.depthOffset!);expect(scaled.elbowAngle).toBeCloseTo(base.elbowAngle!);});
 it('returns finite or null diagnostics for degenerate geometry',()=>{const e=pair(f=>{f.landmarks[13]={...f.landmarks[11]};}).left;expect(e.status).toBe('unknown');for(const v of [e.faceDistance,e.depthOffset,e.elbowAngle,e.stableMs,e.confidence])expect(v===null||Number.isFinite(v)).toBe(true);});
});
