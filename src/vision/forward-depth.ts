import {isPoseFrame,type PoseFrame,type Hand} from '../shared/contracts';

/** Explicitly experimental. Off retains the original image-plane detector. */
export type ForwardDepthMode='off'|'shadow'|'assist';
export const FORWARD_DEPTH_THRESHOLDS={visibility:.65,minShoulderSpanMeters:.06,minForwardShoulderWidths:.35,minExtensionRatio:.75,minExtensionGain:.10,minSamples:2,minSustainedMs:75,maxGapMs:350,minCoverage:.7} as const;
export interface ForwardDepthObservation {
 available:boolean;timestampMs:number;relativeZShoulderWidths:number|null;extensionRatio:number|null;confidence:number;reason:string;
}
export interface ForwardDepthSample extends ForwardDepthObservation {
 forwardDeltaShoulderWidths:number|null;extensionGain:number|null;qualifies:boolean;
}
export interface ForwardDepthAssessment {
 status:'supported'|'not-supported'|'unavailable';reason:string;baselineRelativeZ:number|null;baselineExtensionRatio:number|null;
 peakForwardShoulderWidths:number|null;peakTimestampMs:number|null;observedSamples:number;totalSamples:number;sustainedDurationMs:number;
 samples:ForwardDepthSample[];thresholds:typeof FORWARD_DEPTH_THRESHOLDS;
}
/** MediaPipe estimated world z points away from the camera. This is camera-forward,
 * not body-forward or measured contact/force. Never falls back to image z. */
export function observeForwardDepth(frame:PoseFrame,hand:Hand):ForwardDepthObservation {
 const timestampMs=Number.isFinite(frame?.timestampMs)?frame.timestampMs:0;
 const unknown=(reason:string):ForwardDepthObservation=>({available:false,timestampMs,relativeZShoulderWidths:null,extensionRatio:null,confidence:0,reason});
 if(!isPoseFrame(frame)||frame.tracking==='lost')return unknown('Pose tracking unavailable');
 const world=frame.worldLandmarks;
 if(!world||world.length!==33)return unknown('Estimated world landmarks unavailable; image depth is not substituted');
 const shoulder=hand==='left'?11:12,elbow=hand==='left'?13:14,wrist=hand==='left'?15:16;
 const ids=[11,12,elbow,wrist];
 const confidence=Math.min(...ids.flatMap(i=>[world[i].visibility,frame.landmarks[i].visibility]));
 if(confidence<FORWARD_DEPTH_THRESHOLDS.visibility)return unknown('World and image shoulders, elbow and wrist require visibility ≥0.65');
 const distance=(a:number,b:number)=>Math.hypot(world[a].x-world[b].x,world[a].y-world[b].y,world[a].z-world[b].z);
 const span=distance(11,12),arm=distance(shoulder,elbow)+distance(elbow,wrist);
 if(span<FORWARD_DEPTH_THRESHOLDS.minShoulderSpanMeters||arm<.05)return unknown('Estimated world shoulder span or arm geometry too small');
 const relativeZ=(world[wrist].z-world[shoulder].z)/span,extension=distance(shoulder,wrist)/arm;
 if(!Number.isFinite(relativeZ)||!Number.isFinite(extension))return unknown('Non-finite estimated world geometry');
 return {available:true,timestampMs,relativeZShoulderWidths:relativeZ,extensionRatio:extension,confidence,reason:'Estimated world wrist depth relative to own shoulder'};
}
const median=(values:number[])=>{const sorted=values.slice().sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;};
/** Baseline is supplied from the existing guarded reference, never selected from
 * the outward movement itself. Unknown samples break sustained evidence. */
export function assessForwardDepth(baselineFrames:readonly PoseFrame[],movementFrames:readonly PoseFrame[],hand:Hand):ForwardDepthAssessment {
 const t=FORWARD_DEPTH_THRESHOLDS,base=baselineFrames.map(f=>observeForwardDepth(f,hand)),knownBase=base.filter(o=>o.available);
 const ordered=(values:readonly ForwardDepthObservation[])=>values.every((o,i)=>!i||o.timestampMs>values[i-1].timestampMs);
 const usableBase=knownBase.length>=t.minSamples&&knownBase.length>=base.length*t.minCoverage&&ordered(base);
 const baselineRelativeZ=usableBase?median(knownBase.map(o=>o.relativeZShoulderWidths!)):null;
 const baselineExtensionRatio=usableBase?median(knownBase.map(o=>o.extensionRatio!)):null;
 const samples=movementFrames.map(f=>{
  const o=observeForwardDepth(f,hand),delta=o.available&&baselineRelativeZ!==null?baselineRelativeZ-o.relativeZShoulderWidths!:null;
  const gain=o.available&&baselineExtensionRatio!==null?o.extensionRatio!-baselineExtensionRatio:null;
  return {...o,forwardDeltaShoulderWidths:delta,extensionGain:gain,qualifies:delta!==null&&gain!==null&&delta>=t.minForwardShoulderWidths&&o.extensionRatio!>=t.minExtensionRatio&&gain>=t.minExtensionGain};
 });
 const known=samples.filter(o=>o.available);let run:ForwardDepthSample[]=[],sustainedDurationMs=0;
 const supportedSamples=new Set<ForwardDepthSample>();
 for(const sample of samples){
  if(!sample.qualifies){run=[];continue;}
  const previous=run[run.length-1];
  if(previous&&(sample.timestampMs<=previous.timestampMs||sample.timestampMs-previous.timestampMs>t.maxGapMs))run=[];
  run.push(sample);
  if(run.length>=t.minSamples){
   const duration=sample.timestampMs-run[0].timestampMs;
   sustainedDurationMs=Math.max(sustainedDurationMs,duration);
   if(duration>=t.minSustainedMs)for(const member of run)supportedSamples.add(member);
  }
 }
 const sufficient=usableBase&&known.length>=t.minSamples&&known.length>=samples.length*t.minCoverage&&ordered(samples);
 // Peak belongs to a sustained supported run; isolated depth estimates must not
 // move the outward-phase boundary used for later guard assessment.
 const peak=[...supportedSamples].reduce<ForwardDepthSample|null>((best,o)=>!best||o.forwardDeltaShoulderWidths!>best.forwardDeltaShoulderWidths!?o:best,null);
 const status=!sufficient?'unavailable':sustainedDurationMs>=t.minSustainedMs?'supported':'not-supported';
 return {status,reason:status==='unavailable'?'Insufficient reliable, ordered estimated world baseline/movement observations':status==='supported'?'Sustained camera-forward displacement with increased arm extension':'No sustained camera-forward displacement with sufficient arm extension',baselineRelativeZ,baselineExtensionRatio,peakForwardShoulderWidths:peak?.forwardDeltaShoulderWidths??null,peakTimestampMs:peak?.timestampMs??null,observedSamples:known.length,totalSamples:samples.length,sustainedDurationMs,samples,thresholds:t};
}
