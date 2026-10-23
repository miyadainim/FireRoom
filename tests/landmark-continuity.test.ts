import {describe,it,expect} from 'vitest';
import type {PoseFrame} from '../src/shared/contracts';
import {assessLandmarkContinuity} from '../src/vision/landmark-continuity';
function pose(t=0):PoseFrame {const landmarks=Array.from({length:33},()=>({x:.5,y:.3,z:0,visibility:1}));landmarks[11].x=.3;landmarks[12].x=.7;return {schemaVersion:1,sessionId:'test',sequence:t,timestampMs:t,landmarks,tracking:'tracked',stance:'orthodox',mirrored:false};}
describe('conservative landmark continuity',()=>{
 it('rejects a unilateral wrist spike without changing raw frames',()=>{const a=pose(),b=pose(20);b.landmarks[15].y+=.3;const before=JSON.stringify(b),r=assessLandmarkContinuity(a,b);expect(r.left.unreliable).toBe(true);expect(r.right.unreliable).toBe(false);expect(JSON.stringify(b)).toBe(before);});
 it('preserves fast plausible movement and small high-rate jitter',()=>{const a=pose(),b=pose(20);b.landmarks[15].y+=.1;expect(assessLandmarkContinuity(a,b).left.unreliable).toBe(false);b.timestampMs=1;expect(assessLandmarkContinuity(a,b).left.unreliable).toBe(false);});
 it('requires speed as well as displacement',()=>{const a=pose(),b=pose(100);b.landmarks[15].y+=.3;expect(assessLandmarkContinuity(a,b).left.unreliable).toBe(false);});
 it('ignores coherent body translation',()=>{const a=pose(),b=pose(20);b.landmarks.forEach(p=>{p.x+=.3;p.y+=.3;});expect(assessLandmarkContinuity(a,b).left.unreliable).toBe(false);});
 it('checks eye relative to nose and nose independently',()=>{const a=pose(),b=pose(20);b.landmarks[2].y+=.3;expect(assessLandmarkContinuity(a,b).left.jumps[0].landmark).toBe('eye');expect(assessLandmarkContinuity(a,b).right.unreliable).toBe(false);b.landmarks[0].y+=.3;expect(assessLandmarkContinuity(a,b).right.jumps.some(j=>j.landmark==='nose')).toBe(true);});
 it('does not reject coherent head movement below the broad speed limit',()=>{const a=pose(),b=pose(100);for(const i of [0,2,5])b.landmarks[i].y+=.3;expect(assessLandmarkContinuity(a,b).left.unreliable).toBe(false);});
 it('uses aspect-correct displacement',()=>{const a=pose(),b=pose(20);a.imageSize=b.imageSize={width:200,height:100};b.landmarks[15].y+=.3;expect(assessLandmarkContinuity(a,b).left.unreliable).toBe(false);});
 it('abstains on missing, stale, reordered and changed capture context',()=>{const a=pose();expect(assessLandmarkContinuity(undefined,pose(20)).comparable).toBe(false);for(const b of [pose(0),pose(351),{...pose(20),cameraConfigurationId:'new'}])expect(assessLandmarkContinuity(a,b).comparable).toBe(false);const b=pose(20);b.landmarks[11].visibility=.2;expect(assessLandmarkContinuity(a,b).comparable).toBe(false);});
});
