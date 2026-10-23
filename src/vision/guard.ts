import { selectedGeometry } from './geometry';
import { isPoseFrame, type GeometryMode, type Hand, type PoseFrame, type Landmark } from '../shared/contracts';

export interface GuardEvidence {
 status:'guard'|'not-guard'|'unknown';reason:string;geometryMode:GeometryMode;
 faceDistance:number|null;depthOffset:number|null;elbowAngle:number|null;
 stableMs:number;confidence:number;
}
/** Provisional camera-facing thresholds, in shoulder spans except angle/time.
 * MediaPipe z is an estimate: this checks camera-relative depth, not proof that a
 * fist is anatomically in front of the face. Requires real-camera validation. */
export const GUARD_THRESHOLDS = {
 visibility:0.65, minShoulderWidth:0.06, maxFaceDistance:0.75,
 maxBehindFace:0.15, maxAheadFace:1, maxElbowAngle:110, minStableMs:100,
 maxSpeed:3, maxFrameGapMs:350,
} as const;
const hands:Hand[]=['left','right'];
const ids={left:[11,13,15],right:[12,14,16]} as const;
type Position={x:number;y:number;z:number};
type History={position:Position;timestampMs:number;candidateSince:number|null;samples:number};
const length=(a:Position,b:Position)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const unknown=(reason:string,geometryMode:GeometryMode):GuardEvidence=>({status:'unknown',reason,geometryMode,faceDistance:null,depthOffset:null,elbowAngle:null,stableMs:0,confidence:0});

/** Pure observation/history estimator; missing observations immediately revoke guard. */
export class GuardEstimator {
 constructor(readonly geometryMode:GeometryMode='image-3d'){}
 private previous?:PoseFrame;
 private history:Partial<Record<Hand,History>>={};
 reset(){this.previous=undefined;this.history={};}
 resetHand(hand:Hand){delete this.history[hand];}
 update(frame:PoseFrame):Record<Hand,GuardEvidence>{
  const unavailable=(reason:string)=>({left:unknown(reason,this.geometryMode),right:unknown(reason,this.geometryMode)});
  if(!isPoseFrame(frame)){this.reset();return unavailable('Invalid pose frame');}
  const old=this.previous;
  if(old&&old.sessionId===frame.sessionId&&(frame.sequence<=old.sequence||frame.timestampMs<=old.timestampMs)){
   this.history={};return unavailable('Out-of-order observation; history reset');
  }
  if(old&&(old.sessionId!==frame.sessionId||old.stance!==frame.stance||frame.timestampMs-old.timestampMs>GUARD_THRESHOLDS.maxFrameGapMs))this.history={};
  this.previous=frame;
  if(frame.tracking!=='tracked'){this.history={};return unavailable('Tracking unavailable; guard unknown');}
  const visible=(p:Landmark|undefined):p is Landmark=>!!p&&p.visibility>=GUARD_THRESHOLDS.visibility;
  const [left,right,nose]=[frame.landmarks[11],frame.landmarks[12],frame.landmarks[0]];
  if(!visible(left)||!visible(right)||!visible(nose)){
   this.history={};return unavailable('Visible nose and both shoulders required');
  }
  // Image-plane span keeps x/y proximity normalization consistent; no metric interpretation.
  const width=Math.hypot(left.x-right.x,left.y-right.y);
  if(width<GUARD_THRESHOLDS.minShoulderWidth||nose.y>=(left.y+right.y)/2){
   this.history={};return unavailable('Face anchor or shoulder span unreliable');
  }
  const geometry=selectedGeometry(frame,this.geometryMode);
  if(!geometry){this.history={};return unavailable('World landmarks unavailable; no image fallback');}
  const geometryWidth=this.geometryMode==='image-3d'?width:length(geometry[11],geometry[12]);
  if(geometryWidth<(this.geometryMode==='world-3d'?1e-4:GUARD_THRESHOLDS.minShoulderWidth)){this.history={};return unavailable('Selected shoulder span unreliable');}
  if(this.geometryMode==='world-3d'&&[0,11,12].some(i=>!visible(geometry[i]))){this.history={};return unavailable('World face/shoulder landmarks obscured');}
  return Object.fromEntries(hands.map(hand=>{
   const [s,e,w]=ids[hand].map(i=>geometry[i]);
   if(!visible(s)||!visible(e)||!visible(w)||ids[hand].some(i=>!visible(frame.landmarks[i]))){delete this.history[hand];return [hand,unknown('Arm landmarks obscured',this.geometryMode)];}
   const upper=length(s,e),lower=length(e,w);
   if(upper/geometryWidth<0.05||lower/geometryWidth<0.05){delete this.history[hand];return [hand,unknown('Arm segments degenerate',this.geometryMode)];}
   const reach=length(s,w);
   const elbowAngle=Math.acos(Math.max(-1,Math.min(1,(upper*upper+lower*lower-reach*reach)/(2*upper*lower))))*180/Math.PI;
   const imageWrist=frame.landmarks[ids[hand][2]];
   const faceDistance=Math.hypot(imageWrist.x-nose.x,imageWrist.y-nose.y)/width;
   const geometryNose=geometry[0];
   const depthOffset=this.geometryMode==='image-2d'?null:(w.z-geometryNose.z)/geometryWidth;
   const position={x:(w.x-geometryNose.x)/geometryWidth,y:(w.y-geometryNose.y)/geometryWidth,z:depthOffset??0};
   const prior=this.history[hand];
   const speed=prior?length(position,prior.position)*1000/(frame.timestampMs-prior.timestampMs):0;
   let reason=faceDistance>GUARD_THRESHOLDS.maxFaceDistance?'Wrist outside face region':depthOffset!==null&&depthOffset>GUARD_THRESHOLDS.maxBehindFace?'Wrist estimated behind face':depthOffset!==null&&depthOffset < -GUARD_THRESHOLDS.maxAheadFace?'Wrist estimated too far ahead of face':elbowAngle>GUARD_THRESHOLDS.maxElbowAngle?'Elbow insufficiently bent':speed>GUARD_THRESHOLDS.maxSpeed?'Hand moving too quickly to establish guard':'';
   const candidate=!reason;
   const candidateSince=candidate?(prior?.candidateSince??frame.timestampMs):null;
   const samples=candidate?(prior?.candidateSince!=null?prior.samples+1:1):0;
   const stableMs=candidateSince===null?0:frame.timestampMs-candidateSince;
   const established=candidate&&samples>=2&&stableMs>=GUARD_THRESHOLDS.minStableMs;
   this.history[hand]={position,timestampMs:frame.timestampMs,candidateSince,samples};
   if(candidate)reason=(established?'Face-relative bent-arm guard held':'Hold bent hand near face to establish guard')+(this.geometryMode==='image-2d'?'; depth unavailable in image-2d':'');
   return [hand,{status:established?'guard':'not-guard',reason,geometryMode:this.geometryMode,faceDistance,depthOffset,elbowAngle,stableMs,confidence:Math.min(nose.visibility,left.visibility,right.visibility,s.visibility,e.visibility,w.visibility,geometryNose.visibility,geometry[11].visibility,geometry[12].visibility,...ids[hand].map(i=>frame.landmarks[i].visibility))} satisfies GuardEvidence];
  })) as Record<Hand,GuardEvidence>;
 }
}
