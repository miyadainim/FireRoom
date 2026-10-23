import {describe,it,expect} from 'vitest';
import {selectedGeometry} from '../src/vision/geometry';
import {GuardEstimator} from '../src/vision/guard';
import {PunchRecognizer} from '../src/vision/recognizer';
import type {PoseFrame} from '../src/shared/contracts';
function frame(sequence=0):PoseFrame{
 const landmarks=Array.from({length:33},()=>({x:.5,y:.2,z:-.05,visibility:1}));
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.25,z:-.08,visibility:1};}
 return {schemaVersion:1,sessionId:'geometry',sequence,timestampMs:sequence*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks};
}
describe('explicit geometry selection',()=>{
 it('corrects image aspect and removes depth without mutating input',()=>{const f=frame();f.imageSize={width:640,height:480};const selected=selectedGeometry(f,'image-2d')!;expect(selected[11].y).toBeCloseTo(.45*.75);expect(selected[0].z).toBe(0);expect(f.landmarks[0].z).toBe(-.05);});
 it('keeps legacy raw coordinates and does not fabricate world coordinates',()=>{const f=frame();expect(selectedGeometry(f,'image-3d')).toBe(f.landmarks);expect(selectedGeometry(f,'world-3d')).toBeNull();expect(selectedGeometry(f,'image-2d')![11].y).toBe(.45);});
 it('reports unknown and no punch for absent world observations',()=>{const f=frame();expect(new GuardEstimator('world-3d').update(f).left.status).toBe('unknown');const r=new PunchRecognizer('world-3d');expect(r.update(f)).toEqual([]);expect(r.diagnostics().reason).toContain('World landmarks unavailable');expect(r.diagnostics().geometryMode).toBe('world-3d');});
 it('exposes different elbow evidence from the same frame',()=>{const f=frame();f.landmarks[13].z=-.5;f.landmarks[15].z=-1;f.worldLandmarks=frame().landmarks;const image2d=new GuardEstimator('image-2d').update(f).left;const image3d=new GuardEstimator('image-3d').update(f).left;const world=new GuardEstimator('world-3d').update(f).left;expect(image2d.elbowAngle!).toBeLessThan(20);expect(image3d.elbowAngle!).toBeGreaterThan(100);expect(world.elbowAngle!).toBeLessThan(30);expect(image2d.depthOffset).toBeNull();});
 it('uses metric world geometry independently of image geometry and world translation/scale',()=>{const a=frame(),b=frame();a.worldLandmarks=frame().landmarks;b.worldLandmarks=a.worldLandmarks.map(p=>({...p,x:p.x*.01+3,y:p.y*.01-2,z:p.z*.01+1}));const first=new GuardEstimator('world-3d').update(a).left;const second=new GuardEstimator('world-3d').update(b).left;expect(second.status).toBe(first.status);expect(second.elbowAngle).toBeCloseTo(first.elbowAngle!);expect(second.depthOffset).toBeCloseTo(first.depthOffset!);expect(second.faceDistance).toBe(first.faceDistance);});
 it('does not trust world visibility over obscured image observations',()=>{const f=frame();f.worldLandmarks=frame().landmarks;f.landmarks[15].visibility=.1;expect(new GuardEstimator('world-3d').update(f).left.status).toBe('unknown');});
 it('requires guard history and states that 2d depth is unavailable',()=>{const r=new GuardEstimator('image-2d');r.update(frame());const e=r.update(frame(1)).left;expect(e.status).toBe('guard');expect(e.depthOffset).toBeNull();expect(e.reason).toContain('depth unavailable');});
 it('defaults both constructors to the historical baseline',()=>{expect(new GuardEstimator().geometryMode).toBe('image-3d');expect(new PunchRecognizer().geometryMode).toBe('image-3d');});
});
