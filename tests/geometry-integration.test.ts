import {describe,it,expect} from 'vitest';
import {isPoseFrame,type PoseFrame} from '../src/shared/contracts';
import {GuardEstimator} from '../src/vision/guard';
import {PunchRecognizer} from '../src/vision/recognizer';
import {PoseRecorder,compareRecording,evaluateRecording} from '../src/vision/recording';

// Independent synthetic observations test geometry choices, not real-camera accuracy.
function frame(n:number):PoseFrame {
 const landmarks=Array.from({length:33},()=>({x:.5,y:.2,z:-.05,visibility:1}));
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]) {
  landmarks[s]={x,y:.45,z:0,visibility:1};
  landmarks[e]={x,y:.65,z:0,visibility:1};
  landmarks[w]={x,y:.25,z:-.08,visibility:1};
 }
 return {schemaVersion:1,sessionId:'geometry-vv',sequence:n,timestampMs:n*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks,worldLandmarks:structuredClone(landmarks),imageSize:{width:640,height:480}};
}
function badImageDepth(f:PoseFrame){for(const i of [13,14])f.landmarks[i].z=-.6;for(const i of [15,16])f.landmarks[i].z=-1.2;return f;}
describe('independent image/world comparison acceptance',()=>{
 it('preserves optional-field compatibility for legacy recordings',()=>{const f=frame(0);delete f.worldLandmarks;delete f.imageSize;expect(isPoseFrame(f)).toBe(true);});
 it('rejects malformed world geometry and image dimensions',()=>{for(const mutate of [(f:PoseFrame)=>f.worldLandmarks!.pop(),(f:PoseFrame)=>f.worldLandmarks![15].z=NaN,(f:PoseFrame)=>f.worldLandmarks![15].visibility=2,(f:PoseFrame)=>f.imageSize!.width=0]){const f=frame(0);mutate(f);expect(isPoseFrame(f)).toBe(false);}});
 it('keeps independent world geometry while image depth can give a conflicting elbow estimate',()=>{
  const modes=['image-2d','image-3d','world-3d'] as const;
  const results=modes.map(mode=>{const r=new GuardEstimator(mode);r.update(badImageDepth(frame(0)));return r.update(badImageDepth(frame(1))).left;});
  expect(results[0].status).toBe('guard');expect(results[1].status).toBe('not-guard');expect(results[2].status).toBe('guard');
  expect(results[0].elbowAngle!).toBeLessThan(110);expect(results[1].elbowAngle!).toBeGreaterThan(110);expect(results[2].elbowAngle!).toBeLessThan(110);
 });
 it('does not invent world geometry for old recordings',()=>{const f=frame(0);delete f.worldLandmarks;const g=new GuardEstimator('world-3d');expect(g.update(f).left.status).toBe('unknown');const r=new PunchRecognizer('world-3d');expect(r.update(f)).toEqual([]);expect(r.diagnostics().reason).toMatch(/world|unavailable/i);expect(r.diagnostics().arms).toBeNull();});
 it('checks world visibility independently of visible image joints',()=>{const f=frame(0);f.worldLandmarks![15].visibility=.2;expect(new GuardEstimator('world-3d').update(f).left.status).toBe('unknown');});
 it('maintains separate histories for each geometry mode using the same frames',()=>{const a=new GuardEstimator('image-2d'),b=new GuardEstimator('world-3d');const f=frame(0);a.update(f);expect(b.update(frame(1)).left.status).toBe('not-guard');expect(a.update(frame(1)).left.status).toBe('guard');});
 it('exports a cloned same-frame world array and dimensions',()=>{const recorder=new PoseRecorder(),f=frame(0);recorder.start('jab');recorder.append(f);recorder.stop();f.worldLandmarks![15].z=999;f.imageSize!.width=1;const saved=recorder.snapshot().trials[0].frames[0];expect(saved.worldLandmarks![15].z).toBe(-.08);expect(saved.imageSize!.width).toBe(640);expect(saved.landmarks).toHaveLength(33);expect(saved.worldLandmarks).toHaveLength(33);});
 it('keeps a representative full precision double-array payload below the relay limit',()=>{const f=frame(0);for(const a of [f.landmarks,f.worldLandmarks!])for(const [i,p] of a.entries()){p.x=Math.sin(i);p.y=Math.cos(i);p.z=Math.tan(i);p.visibility=.9876543210123456;}expect(Buffer.byteLength(JSON.stringify(f))).toBeLessThan(20000);});
 it('does not score absent world trials as misses or valid empty successes',()=>{const f=frame(0);delete f.worldLandmarks;const comparison=compareRecording({schemaVersion:1,kind:'fireroom-labeled-poses',trials:[{label:'jab',frames:[f]},{label:'none',frames:[f]}]});const world=comparison.find(r=>r.mode==='world-3d')!;expect(world.unavailableTrials).toBe(2);expect(world.evaluatedTrials).toBe(0);expect(world.missedPunches).toBe(0);expect(world.exactTrials).toBe(0);expect(world.trials.every(t=>!t.available)).toBe(true);expect(comparison[0].evaluatedTrials).toBe(2);});
 it('replays world changes independently from stationary image coordinates',()=>{
  const frames=Array.from({length:9},(_,i)=>frame(i));
  for(const i of [3,4,5]){frames[i].worldLandmarks![13]={x:.35,y:.43,z:-.3,visibility:1};frames[i].worldLandmarks![15]={x:.35,y:.41,z:-.6,visibility:1};}
  const recording={schemaVersion:1 as const,kind:'fireroom-labeled-poses' as const,trials:[{label:'jab' as const,frames}]};
  expect(evaluateRecording(recording,'world-3d').trials[0].detected).toEqual(['jab']);
  expect(evaluateRecording(recording,'image-3d').trials[0].detected).toEqual([]);
  const before=JSON.stringify(recording);compareRecording(recording);expect(JSON.stringify(recording)).toBe(before);
 });

 it('marks an all-lost trial unavailable without fabricated world success',()=>{const f=frame(0);f.tracking='lost';f.landmarks=[];delete f.worldLandmarks;const r=evaluateRecording({schemaVersion:1,kind:'fireroom-labeled-poses',trials:[{label:'none',frames:[f]}]},'world-3d');expect(r.unavailableTrials).toBe(1);expect(r.exactTrials).toBe(0);});

});
