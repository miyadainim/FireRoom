import {assessForwardDepth,type ForwardDepthMode,type ForwardDepthAssessment} from './forward-depth';
import {assessLandmarkContinuity} from './landmark-continuity';
import {isPoseFrame,type PoseFrame,type Hand,type GeometryMode} from '../shared/contracts';
import {GuardEstimator,GUARD_THRESHOLDS} from './guard';
import {selectedGeometry} from './geometry';
import {evaluatePostDropTrajectory,type PostDropTrajectoryAssessment,type PostDropSample,POST_DROP_THRESHOLDS} from './post-drop-trajectory';
import {GUARD_HEIGHT_THRESHOLDS} from './guard-height';
import {FACE_MOTION_THRESHOLDS,assessFaceMotion,type FaceMotionAssessment} from './face-motion';
export const MOVEMENT_DETECTOR_VERSION='movement-observation-v11' as const;
type Point={x:number;y:number;visibility?:number};
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const hands:Hand[]=['left','right'];
export const MOVEMENT_THRESHOLDS={visibility:.65,faceHeight:.5,departure:.22,meaningfulPeak:.35,recoveryRadius:.20,minOutwardMs:75,recoveryHoldMs:80,maxCycleMs:1800,maxGapMs:350,guardReanchorWindowMs:400,guardReanchorStableMs:300,guardReanchorSpread:.04,loweredHoldMs:150,viewScaleTolerance:.15,viewAngleTolerance:.1} as const;
export interface MovementObservation {status:'supported'|'cannot-assess';departureMs:number|null;peakMs:number|null;outwardEndMs:number|null;reason:string;samples:number}
export interface LiveOutwardMovement {forwardDepth?:(Omit<ForwardDepthAssessment,'samples'>&{mode:ForwardDepthMode});sessionId:string;cameraConfigurationId?:string;hand:Hand;type:'jab'|'cross';departureMs:number;peakMs:number;observedAtMs:number;confidence:number}
export interface MovementCycleOutcome {
 schemaVersion:1;sessionId:string;sequence:number;hand:Hand;type:'jab'|'cross';classification:'completed'|'partial'|'guard-adjustment'|'uncertain';
 timestamps:{guardMs:number;departureMs:number;peakMs:number;recoveryMs:number|null;endMs:number};
 trackingQuality:{minimumConfidence:number;acceptedSamples:number;elbowObservedSamples:number};
 evidence:{landmarkWarnings?:{timestampMs:number;reasons:string[]}[];forwardDepth?:(ForwardDepthAssessment&{mode:ForwardDepthMode});movementObservation?:MovementObservation;startedFromLoweredPosition?:boolean;actualStartingGuardObserved?:boolean;postDropTrajectory?:PostDropTrajectoryAssessment;faceMotion?:FaceMotionAssessment;detectorVersion?:typeof MOVEMENT_DETECTOR_VERSION;peakDepartureShoulderSpans:number;outwardSamples:number;returnedToGuard:boolean;reason:string;cameraConfigurationId?:string;viewpointUncertain:boolean;/** Necessary viewpoint prerequisite only; validated references and reliable reach are still required. */extensionAssessmentEligible:boolean;limitations:string[]};
}
interface Observation {frame?:PoseFrame;time:number;position:Point;confidence:number;elbowVisible:boolean;eyeRelative?:{x:number;y:number};noseRelative?:{x:number;y:number}}
interface Arm {landmarkWarnings?:{timestampMs:number;reasons:string[]}[];depthBaseline?:PoseFrame[];phase:'idle'|'armed'|'outward'|'recovering';origin?:Point;originEyeRelative?:Point;originNoseRelative?:Point;guardMs:number;departureMs:number;observations:Observation[];returnSince?:number;last?:Observation;supports:number;guardHistory:Observation[];candidate?:Observation[];loweredSince?:number;downwardSince?:number;restorationLock?:boolean;restorationSince?:number;restorationSamples?:number;postDropSamples?:PostDropSample[];postDropTrajectory?:PostDropTrajectoryAssessment;startedFromLoweredPosition?:boolean}
const fresh=():Arm=>({phase:'idle',guardMs:0,departureMs:0,observations:[],supports:0,guardHistory:[]});
const restoring=(seed:readonly Observation[]=[]):Arm=>{
 const latest=seed.length?seed[seed.length-1].time:0;
 const recent=seed.filter((o,i)=>latest-o.time<=400&&(!i||o.time>seed[i-1].time));
 return {...fresh(),restorationLock:true,observations:[...recent],postDropSamples:recent.map(o=>({timestampMs:o.time,shoulderRelative:{x:o.position.x,y:o.position.y},eyeRelative:o.eyeRelative,noseRelative:o.noseRelative,confidence:o.confidence}))};
};
/** Provisional wrist-motion cycle detector. Completion is movement evidence, not proof of punch form or intent. */
export class MovementCycleRecognizer {
 private depthGuards:Record<Hand,PoseFrame[]>={left:[],right:[]};private guards:GuardEstimator;private arms:Record<Hand,Arm>={left:fresh(),right:fresh()};private previous?:PoseFrame;private sequence=0;
 private status='Waiting for stable guard';private camera?:{width:number;angle:number;anchors:Point[]};private viewpointUncertain=false;
 constructor(readonly options:{guardGeometry?:GeometryMode;/** Arcade-only: retire unsupported excursions after an independently settled guard. */rearmSettledGuard?:boolean;/** Coach: retire face-local repositioning after a fresh settled guard, never a distinct excursion. */settledFaceGuard?:boolean;forwardMode?:ForwardDepthMode;/** Optional absolute producer-clock deadline for a prescribed attempt. Default retains unrestricted 1.8s cycles. */attemptDeadlineMs?:number}={}){if(options.attemptDeadlineMs!==undefined&&(!Number.isFinite(options.attemptDeadlineMs)||options.attemptDeadlineMs<0))throw new Error('Attempt deadline must be a finite nonnegative producer timestamp');this.guards=new GuardEstimator(options.guardGeometry??'image-2d');}
 reset(){this.depthGuards={left:[],right:[]};this.guards.reset();this.arms={left:fresh(),right:fresh()};this.previous=undefined;this.camera=undefined;this.viewpointUncertain=false;this.status='Waiting for stable guard';}
 flush(endTimestampMs:number):MovementCycleOutcome[]{if(!this.previous||!Number.isFinite(endTimestampMs)||endTimestampMs<this.previous.timestampMs)return [];const frame={...this.previous,timestampMs:endTimestampMs};const outcomes:MovementCycleOutcome[]=[];for(const hand of hands){if(this.arms[hand].phase==='outward'||this.arms[hand].phase==='recovering')outcomes.push(this.finish(hand,frame,'partial','Recording ended before supported recovery'));else if(this.arms[hand].restorationLock&&this.arms[hand].postDropTrajectory?.hypotheses.outwardRecovery.outwardSamples&&this.preparePostDrop(hand))outcomes.push(this.finish(hand,frame,'uncertain','Post-drop outward excursion lacked reliable settled recovery before recording ended'));}return outcomes;}
 diagnostics(){return {reason:this.status,viewpointUncertain:this.viewpointUncertain,arms:Object.fromEntries(hands.map(h=>[h,{phase:this.arms[h].phase,observedSamples:this.arms[h].observations.length,restorationLocked:false,postDropTracking:!!this.arms[h].restorationLock,postDropInterpretation:this.arms[h].postDropTrajectory?.status,restorationObservedSamples:this.arms[h].restorationSamples??0,postDropTrajectory:this.arms[h].postDropTrajectory}]))};}
 /** Read-only presentation evidence. Does not finalize a cycle, rearm it, or alter scoring.
  * Later tracking/recovery can still fail. This is not proof of physical punch intent. */
 supportedOutwardMovements():LiveOutwardMovement[]{
  const frame=this.previous;if(!frame)return [];
  // Shoulder foreshortening limits extension estimates, not supported 2D movement.
  // Coherent camera/body transforms already interrupt and reset the cycle in update().
  return hands.flatMap(hand=>{
   const a=this.arms[hand];if(a.phase!=='outward'||!a.origin||a.restorationLock||a.startedFromLoweredPosition||a.observations.length<3)return [];
   const peak=a.observations.reduce((best,o)=>distance(o.position,a.origin!)>distance(best.position,a.origin!)?o:best);
   const face=assessFaceMotion(a.observations.map(o=>({timestampMs:o.time,eyeRelative:o.eyeRelative,noseRelative:o.noseRelative})),distance(peak.position,a.origin),peak.time);
   if((face.status!=='movement-observed'||face.anchorSupport!=='eye-and-nose')&&!this.depthSupports(a))return [];
   const observation=this.observeMovement(a,'partial',face),confidence=Math.min(...a.observations.map(o=>o.confidence));
   if(observation.status!=='supported'||observation.peakMs===null||confidence<MOVEMENT_THRESHOLDS.visibility)return [];
   const depth=this.forwardEvidence(a);const summary=depth?(({samples,...rest})=>rest)(depth):undefined;
   return [{...(summary?{forwardDepth:{...summary,mode:this.options.forwardMode!}}:{}),sessionId:frame.sessionId,cameraConfigurationId:frame.cameraConfigurationId,hand,type:hand===(frame.stance==='orthodox'?'left':'right')?'jab' as const:'cross' as const,departureMs:a.departureMs,peakMs:observation.peakMs,observedAtMs:frame.timestampMs,confidence}];
  });
 }
 private preparePostDrop(hand:Hand):boolean {
  const a=this.arms[hand],assessment=a.postDropTrajectory;
  if(!assessment?.baseline||assessment.departureMs===null)return false;
  a.origin={...assessment.baseline.position};const reference=a.observations.find(o=>o.time===assessment.baseline!.timestampMs);a.originEyeRelative=reference?.eyeRelative;a.originNoseRelative=reference?.noseRelative;a.guardMs=assessment.baseline.timestampMs;a.departureMs=assessment.departureMs;a.returnSince=assessment.recoveryMs??undefined;a.supports=assessment.hypotheses.outwardRecovery.outwardSamples;a.startedFromLoweredPosition=true;return true;
 }
 private forwardEvidence(a:Arm):ForwardDepthAssessment|undefined {return this.options.forwardMode&&this.options.forwardMode!=='off'?assessForwardDepth(a.depthBaseline??[],a.observations.filter(o=>o.time>=a.departureMs).flatMap(o=>o.frame?[o.frame]:[]),this.arms.left===a?'left':'right'):undefined;}
 private depthSupports(a:Arm){return this.options.forwardMode==='assist'&&this.forwardEvidence(a)?.status==='supported';}
 private observeMovement(a:Arm,classification:MovementCycleOutcome['classification'],faceMotion:FaceMotionAssessment,allowDepth=true):MovementObservation {
  const unavailable=(reason:string):MovementObservation=>({status:'cannot-assess',departureMs:null,peakMs:null,outwardEndMs:null,reason,samples:0});
  if(allowDepth&&this.depthSupports(a)&&classification!=='guard-adjustment'&&faceMotion.status!=='stable-near-face'&&!a.startedFromLoweredPosition){const depth=this.forwardEvidence(a)!;return {status:'supported',departureMs:a.departureMs,peakMs:depth.peakTimestampMs,outwardEndMs:depth.samples.filter(s=>s.qualifies).slice(-1)[0]?.timestampMs??depth.peakTimestampMs,reason:'Experimental world-3D forward travel corroborated an existing 2D movement candidate; not proof of contact or form',samples:depth.observedSamples};}
  if(classification==='guard-adjustment'||faceMotion.status==='stable-near-face')return unavailable('Guard adjustment does not establish an outward movement phase');
  if(!a.origin||!a.originEyeRelative||!a.originNoseRelative)return unavailable('Reliable original eye and nose references are unavailable');
  if(a.startedFromLoweredPosition&&(!a.postDropTrajectory||a.postDropTrajectory.hypotheses.outwardRecovery.excursionDurationMs<POST_DROP_THRESHOLDS.minExcursionMs))return unavailable('Restoration or a brief post-drop excursion does not establish outward movement');
  let run:Observation[]=[],best:Observation[]=[];
  for(const o of a.observations){
   const dx=o.position.x-a.origin.x,dy=o.position.y-a.origin.y;
   const dominantLowering=dy>=MOVEMENT_THRESHOLDS.departure&&dy>=Math.abs(dx);
   const away=!!o.eyeRelative&&!!o.noseRelative&&distance(o.eyeRelative,a.originEyeRelative)>=MOVEMENT_THRESHOLDS.departure&&distance(o.noseRelative,a.originNoseRelative)>=MOVEMENT_THRESHOLDS.departure;
   const outsidePostDrop=!a.startedFromLoweredPosition||!!o.eyeRelative&&!!o.noseRelative&&((o.eyeRelative.y< -MOVEMENT_THRESHOLDS.faceHeight&&o.noseRelative.y< -MOVEMENT_THRESHOLDS.faceHeight)||(Math.hypot(o.eyeRelative.x,o.eyeRelative.y)>.75&&Math.hypot(o.noseRelative.x,o.noseRelative.y)>.75));
   const eligible=o.time>=a.departureMs&&o.confidence>=MOVEMENT_THRESHOLDS.visibility&&distance(o.position,a.origin)>=MOVEMENT_THRESHOLDS.meaningfulPeak&&away&&!dominantLowering&&o.eyeRelative!.y<=MOVEMENT_THRESHOLDS.faceHeight&&outsidePostDrop;
   if(!eligible){run=[];continue;}
   if(run.length&&o.time-run[run.length-1].time>MOVEMENT_THRESHOLDS.maxGapMs)run=[];
   run.push(o);
   if(run.length>=2&&o.time-run[0].time>=MOVEMENT_THRESHOLDS.minOutwardMs&&(best.length===0||run.length>best.length))best=[...run];
  }
  if(best.length<2)return unavailable('No sustained, face-corroborated outward phase; lowering alone is insufficient');
  const ranked=best.map(o=>({o,d:distance(o.position,a.origin!)})).sort((a,b)=>b.d-a.d),peak=ranked[Math.floor(Math.min(3,ranked.length)/2)];
  const nearPeak=best.filter(o=>distance(o.position,a.origin!)>=peak.d-MOVEMENT_THRESHOLDS.departure);
  return {status:'supported',departureMs:a.departureMs,peakMs:peak.o.time,outwardEndMs:nearPeak[nearPeak.length-1].time,reason:'Sustained projected outward movement is corroborated by wrist departure from both face anchors; recovery is assessed separately',samples:best.length};
 }
 private finish(hand:Hand,frame:PoseFrame,classification:MovementCycleOutcome['classification'],reason:string):MovementCycleOutcome{
  const a=this.arms[hand];if(a.candidate){a.observations=a.candidate;a.departureMs=a.candidate[0].time;}const ranked=a.observations.filter(o=>o.position.y<=.35&&(!a.startedFromLoweredPosition||o.time>=a.departureMs)).map(o=>({o,d:distance(o.position,a.origin!)})).sort((x,y)=>y.d-x.d);
  // Median of the largest three avoids treating a single noisy position as a trustworthy peak.
  const peak=ranked[Math.floor(Math.min(3,ranked.length)/2)]??{d:0,o:{time:a.departureMs}};
  const faceMotion=assessFaceMotion(a.observations.map(o=>({timestampMs:o.time,eyeRelative:o.eyeRelative,noseRelative:o.noseRelative})),peak.d,peak.o.time);
  if(classification==='completed'&&faceMotion.status==='stable-near-face'){classification='guard-adjustment';reason=faceMotion.reason;}else if(classification==='completed'&&!this.depthSupports(a)&&faceMotion.status==='uncertain'){classification='uncertain';reason=faceMotion.reason;}
  const result:MovementCycleOutcome={schemaVersion:1,sessionId:frame.sessionId,sequence:this.sequence++,hand,type:hand===(frame.stance==='orthodox'?'left':'right')?'jab':'cross',classification,
   timestamps:{guardMs:a.guardMs,departureMs:a.departureMs,peakMs:peak.o.time,recoveryMs:classification==='completed'||classification==='guard-adjustment'?a.returnSince??frame.timestampMs:null,endMs:frame.timestampMs},
   trackingQuality:{minimumConfidence:Math.min(1,...a.observations.map(o=>o.confidence)),acceptedSamples:a.observations.length,elbowObservedSamples:a.observations.filter(o=>o.elbowVisible).length},
   evidence:{...(a.landmarkWarnings?.length?{landmarkWarnings:a.landmarkWarnings}:{}),...(this.forwardEvidence(a)?{forwardDepth:{...this.forwardEvidence(a)!,mode:this.options.forwardMode!}}:{}),movementObservation:this.observeMovement(a,classification,faceMotion),startedFromLoweredPosition:a.startedFromLoweredPosition??false,actualStartingGuardObserved:!a.startedFromLoweredPosition,postDropTrajectory:a.postDropTrajectory,faceMotion,detectorVersion:MOVEMENT_DETECTOR_VERSION,peakDepartureShoulderSpans:peak.d,outwardSamples:a.supports,returnedToGuard:a.returnSince!==undefined,reason,cameraConfigurationId:frame.cameraConfigurationId,viewpointUncertain:this.viewpointUncertain,extensionAssessmentEligible:!this.viewpointUncertain,limitations:['Image-plane wrist motion cannot establish depth, full extension, punch intent, or distinguish all feints.','Physical recognition accuracy NOT VERIFIED.','Recovery is delayed by an 80 ms hold; sampling cadence adds further latency.','Shoulder-only changes flag viewpoint uncertainty; coherent whole-body image transformations interrupt conservatively. Camera motion cannot be distinguished perfectly from body motion.']}};
  this.arms[hand]=fresh();return result;
 }
 update(frame:PoseFrame):MovementCycleOutcome[]{
  const results:MovementCycleOutcome[]=[];
  const interrupt=(reason:string)=>{for(const h of hands){if(this.arms[h].phase==='outward'||this.arms[h].phase==='recovering'||this.arms[h].candidate)results.push(this.finish(h,frame,'uncertain',reason));else if(this.arms[h].restorationLock&&this.arms[h].postDropTrajectory?.hypotheses.outwardRecovery.outwardSamples&&this.preparePostDrop(h))results.push(this.finish(h,frame,'uncertain',reason));}this.reset();this.status=reason;};
  if(!isPoseFrame(frame)){this.reset();return [];}
  const old=this.previous;
  if(old&&(frame.sessionId!==old.sessionId||frame.stance!==old.stance||frame.cameraConfigurationId!==old.cameraConfigurationId||frame.timestampMs<=old.timestampMs||frame.sequence<=old.sequence||frame.timestampMs-old.timestampMs>MOVEMENT_THRESHOLDS.maxGapMs))interrupt('Session, stance, camera, ordering or timestamp gap changed; fresh guard required');
  this.previous=frame;
  if(frame.tracking==='lost'||[11,12].some(i=>frame.landmarks[i].visibility<MOVEMENT_THRESHOLDS.visibility)){interrupt('Shoulder tracking unavailable');return results;}
  const points=selectedGeometry(frame,'image-2d')!,width=distance(points[11],points[12]),angle=Math.atan2(points[12].y-points[11].y,points[12].x-points[11].x);
  if(width<.06){interrupt('Shoulder span too small');return results;}
  const wrap=(v:number)=>Math.atan2(Math.sin(v),Math.cos(v));
  const anchors=[0,11,12,23,24].map(i=>points[i]);
  if(this.camera){
   const scale=width/this.camera.width,rotation=wrap(angle-this.camera.angle);
   const material=Math.abs(scale-1)>.25||Math.abs(rotation)>.3;
   this.viewpointUncertain ||= material;
   if(material){
    // Shoulder foreshortening alone is not a camera transform. Require corroboration
    // from visible head/hip geometry rather than changing thresholds to fit punches.
    const transforms:{scale:number;rotation:number}[]=[];
    for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++){
     const a=this.camera.anchors[i],b=this.camera.anchors[j],c=anchors[i],d=anchors[j];
     const length=distance(a,b);
     if(length>.02&&(a.visibility??0)>=MOVEMENT_THRESHOLDS.visibility&&(b.visibility??0)>=MOVEMENT_THRESHOLDS.visibility&&[0,11,12,23,24].filter((_,k)=>k===i||k===j).every(id=>points[id].visibility>=MOVEMENT_THRESHOLDS.visibility))transforms.push({scale:distance(c,d)/length,rotation:wrap(Math.atan2(d.y-c.y,d.x-c.x)-Math.atan2(b.y-a.y,b.x-a.x))});
    }
    const coherent=transforms.length>=6&&transforms.every(t=>Math.abs(t.scale/scale-1)<=MOVEMENT_THRESHOLDS.viewScaleTolerance&&Math.abs(wrap(t.rotation-rotation))<=MOVEMENT_THRESHOLDS.viewAngleTolerance);
    if(coherent){interrupt('Coherent material image geometry change; camera or body movement uncertain, fresh guard required');this.previous=frame;}
   }
  }
  const continuity=assessLandmarkContinuity(old,frame);
  const guard=this.guards.update(frame);
  for(const hand of hands)this.depthGuards[hand]=guard[hand].status==='guard'?[...this.depthGuards[hand],frame].filter(f=>f.timestampMs>=frame.timestampMs-600).slice(-120):[];
  // Establish setup geometry only after the existing detector observes guard.
  if(!this.camera&&hands.some(hand=>guard[hand].status==='guard'))this.camera={width,angle,anchors:anchors.map(p=>({x:p.x,y:p.y,visibility:p.visibility}))};
  for(const hand of hands){
   const a=this.arms[hand],si=hand==='left'?11:12,wi=hand==='left'?15:16,ei=hand==='left'?13:14;
   if(points[wi].visibility<MOVEMENT_THRESHOLDS.visibility){if(a.restorationLock&&a.postDropTrajectory?.hypotheses.outwardRecovery.outwardSamples&&this.preparePostDrop(hand)){results.push(this.finish(hand,frame,'uncertain','Wrist unavailable during post-drop excursion'));this.arms[hand]=restoring();continue;}if(a.phase==='outward'||a.phase==='recovering'||a.candidate)results.push(this.finish(hand,frame,'uncertain','Wrist unavailable during movement'));else this.arms[hand]={...fresh(),restorationLock:a.restorationLock};continue;}
   const o:Observation={frame,time:frame.timestampMs,position:{x:(points[wi].x-points[si].x)/width,y:(points[wi].y-points[si].y)/width},confidence:Math.min(points[wi].visibility,points[si].visibility,points[11].visibility,points[12].visibility),elbowVisible:points[ei].visibility>=MOVEMENT_THRESHOLDS.visibility};
   const faceRelative=(index:number)=>points[index].visibility>=MOVEMENT_THRESHOLDS.visibility?{x:(points[wi].x-points[index].x)/width,y:(points[wi].y-points[index].y)/width}:undefined;
   o.eyeRelative=faceRelative(hand==='left'?2:5);o.noseRelative=faceRelative(0);
   // Diagnostic only: a fast sample must not discard a punch or reset its guard reference.
   if(continuity[hand].unreliable)a.landmarkWarnings=[...(a.landmarkWarnings??[]),{timestampMs:o.time,reasons:continuity[hand].reasons}].slice(-32);
   if(a.phase==='idle'){
    if(a.restorationLock){
     // Continue observing after a drop: restoration and outward-recovery compete.
     // A low starting hand is evidence about readiness, not an exclusion rule.
     if(!o.eyeRelative||!o.noseRelative){
      if(a.postDropTrajectory?.hypotheses.outwardRecovery.outwardSamples&&this.preparePostDrop(hand))results.push(this.finish(hand,frame,'uncertain','Face observations unavailable during post-drop excursion'));
      this.arms[hand]=restoring();continue;
     }
     const sample:PostDropSample={timestampMs:o.time,shoulderRelative:{x:o.position.x,y:o.position.y},eyeRelative:o.eyeRelative,noseRelative:o.noseRelative,confidence:o.confidence};
     a.postDropSamples=[...(a.postDropSamples??[]),sample];a.observations.push(o);a.last=o;
     if(a.postDropSamples.length>POST_DROP_THRESHOLDS.maxSamples||o.time-a.postDropSamples[0].timestampMs>POST_DROP_THRESHOLDS.maxHistoryMs){
      if(a.postDropTrajectory?.hypotheses.outwardRecovery.outwardSamples&&this.preparePostDrop(hand))results.push(this.finish(hand,frame,'uncertain','Post-drop trajectory exceeded the bounded observation history'));
      this.arms[hand]=restoring();continue;
     }
     a.postDropTrajectory=evaluatePostDropTrajectory(a.postDropSamples);
     const postDropExpired=this.options.attemptDeadlineMs!==undefined?o.time>this.options.attemptDeadlineMs:a.postDropTrajectory.departureMs!==null&&o.time-a.postDropTrajectory.departureMs>MOVEMENT_THRESHOLDS.maxCycleMs;
     if(postDropExpired&&a.postDropTrajectory.hypotheses.outwardRecovery.outwardSamples>0&&this.preparePostDrop(hand)){results.push(this.finish(hand,frame,'uncertain','Post-drop trajectory exceeded its recovery deadline'));this.arms[hand]=restoring();continue;}
     if(a.postDropTrajectory.status==='outward-recovery'&&a.postDropTrajectory.baseline&&a.postDropTrajectory.departureMs!==null&&a.postDropTrajectory.recoveryMs!==null){
      if(postDropExpired||!this.preparePostDrop(hand))continue;
      results.push(this.finish(hand,frame,'completed',a.postDropTrajectory.reason));continue;
     }
     if(a.postDropTrajectory.status==='ambiguous'&&a.postDropTrajectory.recoveryMs!==null&&this.preparePostDrop(hand)){
      results.push(this.finish(hand,frame,'uncertain','Brief post-drop excursion remains ambiguous after return to the face region'));continue;
     }
     if(a.postDropTrajectory.hypotheses.outwardRecovery.outwardSamples>0)continue;
     const eye=points[hand==='left'?2:5];
     // Count the estimator's explicit candidate warmup locally, but arm only once
     // both its stable-guard requirement and this post-lowering hold are satisfied.
     const observedGuard=(guard[hand].status==='guard'||guard[hand].reason.startsWith('Hold bent hand near face to establish guard'))&&o.position.y<=.35&&eye.visibility>=GUARD_HEIGHT_THRESHOLDS.visibility&&(points[wi].y-eye.y)/width<=MOVEMENT_THRESHOLDS.faceHeight;
     if(!observedGuard){a.restorationSince=undefined;a.restorationSamples=0;continue;}
     a.restorationSince??=o.time;a.restorationSamples=(a.restorationSamples??0)+1;
     if(a.restorationSamples<2||o.time-a.restorationSince<GUARD_THRESHOLDS.minStableMs||guard[hand].status!=='guard')continue;
     a.restorationLock=false;a.observations=[];a.postDropSamples=undefined;a.postDropTrajectory=undefined;
    }
    if(guard[hand].status==='guard'&&o.position.y<=.35){a.phase='armed';a.origin=o.position;a.originEyeRelative=o.eyeRelative;a.originNoseRelative=o.noseRelative;a.guardMs=o.time;a.last=o;a.guardHistory=[o];a.depthBaseline=[...this.depthGuards[hand]];}continue;
   }
   const departure=distance(o.position,a.origin!);
   // A lowered guard may still be above shoulder level. Corroborate its direction
   // from the original guard and a visible same-side eye, without using the elbow.
   const eye=points[hand==='left'?2:5];
   const deltaX=o.position.x-a.origin!.x,deltaY=o.position.y-a.origin!.y;
   const downward=eye.visibility>=GUARD_HEIGHT_THRESHOLDS.visibility&&deltaY>=MOVEMENT_THRESHOLDS.departure&&deltaY>=Math.abs(deltaX)&&(points[wi].y-eye.y)/width>MOVEMENT_THRESHOLDS.faceHeight;
   if(downward){
    a.downwardSince??=o.time;
    if(o.time-a.downwardSince>=GUARD_HEIGHT_THRESHOLDS.minViolationMs){
     if(a.phase==='outward'||a.phase==='recovering'){a.observations.push(o);a.last=o;results.push(this.finish(hand,frame,'uncertain','Sustained downward hand movement; punch intent uncertain, fresh guard required'));this.arms[hand]=restoring(a.observations);}
     else this.arms[hand]=restoring(a.observations.length?a.observations:[...(a.last?[a.last]:[]),o]);
     continue;
    }
   }else a.downwardSince=undefined;
   if(a.phase==='armed'){
    if(guard[hand].status==='guard'&&!a.candidate&&departure<MOVEMENT_THRESHOLDS.departure)a.depthBaseline=[...this.depthGuards[hand]];
    // An old guard reference cannot remain armed while a hand is visibly lowered.
    // Returning a lowered hand to guard is restoration, not outward punch evidence.
    if(o.position.y>.35){a.loweredSince??=o.time;if(o.time-a.loweredSince>=MOVEMENT_THRESHOLDS.loweredHoldMs){this.arms[hand]=restoring(a.observations.length?a.observations:[...(a.last?[a.last]:[]),o]);continue;}}else a.loweredSince=undefined;
    // A new anchor requires a compact, sustained observed guard, never an EMA that follows a punch.
    a.guardHistory=guard[hand].status==='guard'?[...a.guardHistory,o].filter(v=>o.time-v.time<=MOVEMENT_THRESHOLDS.guardReanchorWindowMs):[];
    const stable=a.guardHistory.length>=3&&o.time-a.guardHistory[0].time>=MOVEMENT_THRESHOLDS.guardReanchorStableMs&&a.guardHistory.every(v=>a.guardHistory.every(w=>distance(v.position,w.position)<=MOVEMENT_THRESHOLDS.guardReanchorSpread));
    if(stable&&!a.candidate){a.origin={x:a.guardHistory.reduce((sum,v)=>sum+v.position.x,0)/a.guardHistory.length,y:a.guardHistory.reduce((sum,v)=>sum+v.position.y,0)/a.guardHistory.length};a.originEyeRelative=o.eyeRelative;a.originNoseRelative=o.noseRelative;a.guardMs=o.time;a.last=o;a.depthBaseline=[...this.depthGuards[hand]];continue;}
    if(departure>=MOVEMENT_THRESHOLDS.departure&&o.position.y<=.35){
     if(a.candidate&&((a.candidate[a.candidate.length-1].position.x-a.origin!.x)*(o.position.x-a.origin!.x)+(a.candidate[a.candidate.length-1].position.y-a.origin!.y)*(o.position.y-a.origin!.y))>0){a.phase='outward';if(this.options.rearmSettledGuard||this.options.settledFaceGuard)a.guardHistory=[];a.departureMs=a.candidate[0].time;a.observations=[...a.candidate,o];a.supports=2;a.candidate=undefined;}
     else {a.candidate=a.last?[a.last,o]:[o];a.supports=1;}
    }else {a.candidate=undefined;a.supports=0;}
    a.last=o;continue;
   }
   if(this.options.rearmSettledGuard||this.options.settledFaceGuard){
    // A small unsupported excursion can move the old shoulder anchor enough to
    // prevent recovery. Do not let it swallow the next punch after a fresh guard.
    a.guardHistory=guard[hand].status==='guard'&&o.position.y<=.35&&(!this.options.settledFaceGuard||!!o.eyeRelative&&!!o.noseRelative&&o.eyeRelative.y<=MOVEMENT_THRESHOLDS.faceHeight&&Math.hypot(o.eyeRelative.x,o.eyeRelative.y)<=GUARD_THRESHOLDS.maxFaceDistance&&Math.hypot(o.noseRelative.x,o.noseRelative.y)<=GUARD_THRESHOLDS.maxFaceDistance)?[...a.guardHistory,o].filter(v=>o.time-v.time<=MOVEMENT_THRESHOLDS.guardReanchorWindowMs):[];
    const settled=a.guardHistory.length>=3&&o.time-a.guardHistory[0].time>=MOVEMENT_THRESHOLDS.guardReanchorStableMs&&a.guardHistory.every(v=>a.guardHistory.every(w=>v.eyeRelative&&w.eyeRelative&&v.noseRelative&&w.noseRelative&&distance(v.eyeRelative,w.eyeRelative)<=FACE_MOTION_THRESHOLDS.maxRange&&distance(v.noseRelative,w.noseRelative)<=FACE_MOTION_THRESHOLDS.maxRange));
    if(settled){
     const peak=a.observations.reduce((best,v)=>distance(v.position,a.origin!)>distance(best.position,a.origin!)?v:best,a.observations[0]);
     const face=assessFaceMotion(a.observations.map(v=>({timestampMs:v.time,eyeRelative:v.eyeRelative,noseRelative:v.noseRelative})),distance(peak.position,a.origin!),peak.time);
     const distinctExcursion=a.observations.some(v=>v.eyeRelative&&v.noseRelative&&Math.hypot(v.eyeRelative.x,v.eyeRelative.y)>GUARD_THRESHOLDS.maxFaceDistance&&Math.hypot(v.noseRelative.x,v.noseRelative.y)>GUARD_THRESHOLDS.maxFaceDistance);
     const repositioned=[face.anchors.eye,face.anchors.nose].every(anchor=>anchor.coverage>=FACE_MOTION_THRESHOLDS.minCoverage&&anchor.observedSamples>=3&&anchor.coversBoundaries&&anchor.coversPeak&&anchor.rangeShoulderWidths!==null&&anchor.rangeShoulderWidths<=distance(peak.position,a.origin!)*FACE_MOTION_THRESHOLDS.maxRangeToShoulderPeak);
     if(this.observeMovement(a,'partial',face,false).status!=='supported'||this.options.settledFaceGuard&&!distinctExcursion&&repositioned){
      results.push(this.finish(hand,frame,'guard-adjustment','Unsupported excursion settled into independently observed guard; fresh movement may begin'));
      this.arms[hand]={...fresh(),phase:'armed',origin:o.position,originEyeRelative:o.eyeRelative,originNoseRelative:o.noseRelative,guardMs:o.time,last:o,guardHistory:[o],depthBaseline:[...this.depthGuards[hand]]};continue;
     }
    }
   }
   a.observations.push(o);a.last=o;
   if(departure>=MOVEMENT_THRESHOLDS.departure&&o.position.y<=.35)a.supports++;
   if(o.position.y>.35){a.loweredSince??=o.time;if(o.time-a.loweredSince>=MOVEMENT_THRESHOLDS.loweredHoldMs){results.push(this.finish(hand,frame,'uncertain','Wrist remained below supported punch region; hand lowering is not a verified punch attempt'));this.arms[hand]=restoring(a.observations.length?a.observations:[...(a.last?[a.last]:[]),o]);continue;}}else a.loweredSince=undefined;
   if(this.options.attemptDeadlineMs!==undefined?o.time>this.options.attemptDeadlineMs:o.time-a.departureMs>MOVEMENT_THRESHOLDS.maxCycleMs){results.push(this.finish(hand,frame,'partial','Movement did not recover within bounded attempt'));continue;}
   if(departure<=MOVEMENT_THRESHOLDS.recoveryRadius){a.returnSince??=o.time;a.phase='recovering';if(o.time-a.returnSince>=MOVEMENT_THRESHOLDS.recoveryHoldMs){const supported=a.observations.filter(v=>v.position.y<=.35&&distance(v.position,a.origin!)>=MOVEMENT_THRESHOLDS.meaningfulPeak);const meaningful=supported.length>=2&&supported[supported.length-1].time-supported[0].time>=MOVEMENT_THRESHOLDS.minOutwardMs;results.push(this.finish(hand,frame,meaningful||this.depthSupports(a)?'completed':'guard-adjustment',meaningful?'Supported wrist departure and return to original guard':this.depthSupports(a)?'Experimental world-3D forward excursion and 2D return observed':'Small or unsupported movement returned to guard'));}}
   else {a.returnSince=undefined;a.phase='outward';}
  }
  this.status=results.length?results.map(r=>`${r.hand}: ${r.classification}`).join('; '):'Observing guard → wrist departure → return';return results;
 }
}
export interface ValidatedExtensionReference {validated:boolean;cameraConfigurationId:string;hand:Hand;extended:number;short:number;units:'shoulder-spans';}
/** Optional and deliberately independent of movement recognition. References require reviewed compatibility. */
export function assessMovementExtension(input:{hand:Hand;cameraConfigurationId?:string;reach?:number;reliable:boolean},reference?:ValidatedExtensionReference):{status:'cannot-assess'|'closer-to-extended'|'closer-to-short';reason:string}{
 if(!reference?.validated||!input.reliable||!input.cameraConfigurationId||input.cameraConfigurationId!==reference.cameraConfigurationId||reference.hand!==input.hand||!Number.isFinite(input.reach)||![reference.extended,reference.short].every(Number.isFinite)||reference.extended-reference.short<.15)return {status:'cannot-assess',reason:'Reliable reach and reviewed, compatible, separated references required'};
 return {status:Math.abs(input.reach!-reference.extended)<Math.abs(input.reach!-reference.short)?'closer-to-extended':'closer-to-short',reason:'Descriptive reference proximity; not proof of correct boxing form'};
}
