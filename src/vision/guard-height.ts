import {guardHeightReference} from './guard-height-scale';
import {assessLandmarkContinuity} from './landmark-continuity';
import {isPoseFrame,type PoseFrame,type Hand} from '../shared/contracts';
import {selectedGeometry} from './geometry';
export const GUARD_HEIGHT_THRESHOLDS={visibility:.65,maxBelowEye:.5,maxLateralEye:.75,minViolationMs:180,maxGapMs:350,minCoverage:.7,minSamples:2,minShoulderWidth:.06} as const;
export interface GuardHeightObservation {
 timestampMs:number;hand:Hand;status:'within-region'|'below-eye-limit'|'outside-lateral-region'|'unknown';reason:string;
 /** Signed image-down vertical difference divided by aspect-correct shoulder width. */
 eyeOffsetShoulderWidths:number|null;lateralOffsetShoulderWidths:number|null;
 /** Descriptive change only; never a second rejection threshold. */
 baselineDeltaShoulderWidths:number|null;confidence:number;
 landmarkWarning?:string;
 heightScale?:{source:'stable-guard'|'instantaneous';width:number};
}
export interface GuardHeightAssessment {
 status:'supported'|'deviation'|'cannot-assess';reason:string;observedSamples:number;totalSamples:number;timestampsMs:number[];observedDurationMs:number;
 evidence:{method:'same-side-eye-height';eyeLandmark:2|5;units:'shoulder-widths';maxBelowEye:.5;maxLateralEye:.75;baselineEyeOffset:number|null;samples:GuardHeightObservation[]};
}
/** Independent image-plane hand-height observation. Elbow visibility and angle are intentionally unused. */
export function observeGuardHeight(frame:PoseFrame,hand:Hand,baselineEyeOffset?:number,referenceWidth?:number):GuardHeightObservation {
 const eye=hand==='left'?2:5,wi=hand==='left'?15:16;
 const unknown=(reason:string):GuardHeightObservation=>({timestampMs:Number.isFinite(frame?.timestampMs)?frame.timestampMs:0,hand,status:'unknown',reason,eyeOffsetShoulderWidths:null,lateralOffsetShoulderWidths:null,baselineDeltaShoulderWidths:null,confidence:0});
 if(!isPoseFrame(frame)||frame.tracking==='lost')return unknown('Pose tracking unavailable for eye-height assessment');
 const points=selectedGeometry(frame,'image-2d')!;
 if([eye,wi,11,12].some(i=>points[i].visibility<GUARD_HEIGHT_THRESHOLDS.visibility))return unknown('Same-side eye, wrist and both shoulders require visibility ≥0.65');
 const width=Math.hypot(points[11].x-points[12].x,points[11].y-points[12].y);
 if(width<GUARD_HEIGHT_THRESHOLDS.minShoulderWidth)return unknown('Shoulder width too small for reliable normalization');
 const heightWidth=referenceWidth!==undefined&&Number.isFinite(referenceWidth)&&referenceWidth>=GUARD_HEIGHT_THRESHOLDS.minShoulderWidth?referenceWidth:width;
 const offset=(points[wi].y-points[eye].y)/heightWidth,lateral=Math.abs(points[wi].x-points[eye].x)/width;
 const below=offset>GUARD_HEIGHT_THRESHOLDS.maxBelowEye+1e-10;
 const outside=lateral>GUARD_HEIGHT_THRESHOLDS.maxLateralEye+1e-10;
 return {heightScale:{source:heightWidth===referenceWidth?'stable-guard':'instantaneous',width:heightWidth},timestampMs:frame.timestampMs,hand,status:outside?'outside-lateral-region':below?'below-eye-limit':'within-region',reason:outside?'Wrist outside broad same-side eye lateral region':below?'Wrist more than 0.5 shoulder widths below same-side eye':'Wrist within same-side eye height and broad lateral region',eyeOffsetShoulderWidths:offset,lateralOffsetShoulderWidths:lateral,baselineDeltaShoulderWidths:baselineEyeOffset!==undefined&&Number.isFinite(baselineEyeOffset)?offset-baselineEyeOffset:null,confidence:Math.min(...[eye,wi,11,12].map(i=>points[i].visibility))};
}
/** Sustained height criterion; missing observations revoke continuity rather than extending a drop. */
export function assessGuardHeight(frames:readonly PoseFrame[],hand:Hand,baselineFrames:readonly PoseFrame[]=[],scaleFrames:readonly PoseFrame[]=baselineFrames):GuardHeightAssessment {
 const reference=guardHeightReference(scaleFrames);
 const offsets=baselineFrames.map(f=>observeGuardHeight(f,hand,undefined,reference)).filter(o=>o.status==='within-region').map(o=>o.eyeOffsetShoulderWidths!).sort((a,b)=>a-b);
 const baseline=offsets.length>=2?(offsets[Math.floor((offsets.length-1)/2)]+offsets[Math.floor(offsets.length/2)])/2:null;
 const samples=frames.map((f,i)=>{const observation=observeGuardHeight(f,hand,baseline??undefined,reference);const continuity=assessLandmarkContinuity(frames[i-1],f)[hand];return continuity.unreliable?{...observation,landmarkWarning:continuity.reasons.join('; ')}:observation;}),known=samples.filter(o=>o.status!=='unknown');
 let start:number|undefined,last:number|undefined,maxDuration=0,ordered=true;
 for(let i=0;i<samples.length;i++){
  const o=samples[i];if(i&&o.timestampMs<=samples[i-1].timestampMs)ordered=false;
  if(o.status==='below-eye-limit'){
   if(last===undefined||o.timestampMs-last>GUARD_HEIGHT_THRESHOLDS.maxGapMs||o.timestampMs<=last)start=o.timestampMs;
   last=o.timestampMs;maxDuration=Math.max(maxDuration,o.timestampMs-(start??o.timestampMs));
  }else {start=undefined;last=undefined;}
 }
 const sufficient=ordered&&known.length>=GUARD_HEIGHT_THRESHOLDS.minSamples&&known.length>=samples.length*GUARD_HEIGHT_THRESHOLDS.minCoverage;
 const violation=sufficient&&maxDuration>=GUARD_HEIGHT_THRESHOLDS.minViolationMs;
 const allWithin=known.every(o=>o.status==='within-region');
 return {status:!sufficient?'cannot-assess':violation?'deviation':allWithin?'supported':'cannot-assess',reason:!sufficient?'Insufficient reliable, ordered eye/wrist observations':violation?'Wrist stayed more than 0.5 shoulder widths below same-side eye for at least 180 ms':allWithin?'Observed wrist stayed within the same-side eye height and broad lateral region':'Brief height excursion or lateral displacement does not establish a sustained guard drop',observedSamples:known.length,totalSamples:samples.length,timestampsMs:known.map(o=>o.timestampMs),observedDurationMs:maxDuration,evidence:{method:'same-side-eye-height',eyeLandmark:hand==='left'?2:5,units:'shoulder-widths',maxBelowEye:.5,maxLateralEye:.75,baselineEyeOffset:baseline,samples}};
}
