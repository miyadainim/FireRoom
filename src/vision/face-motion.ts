export const FACE_MOTION_THRESHOLDS={maxRange:.22,maxProximity:.75,maxRangeToShoulderPeak:.6,minCoverage:.7,minSamples:3,minDurationMs:180,maxGapMs:350} as const;
type Point={x:number;y:number};
export interface FaceMotionSample {timestampMs:number;eyeRelative?:Point;noseRelative?:Point}
export interface FaceAnchorSummary {coverage:number;rangeShoulderWidths:number|null;maxProximityShoulderWidths:number|null;observedSamples:number;durationMs:number;coversBoundaries:boolean;coversPeak:boolean;maximumGapMs:number|null}
export interface FaceMotionAssessment {
 status:'stable-near-face'|'uncertain'|'movement-observed'|'insufficient';reason:string;anchorSupport:'eye-and-nose'|'eye-only'|'nose-only'|'none';
 thresholds:typeof FACE_MOTION_THRESHOLDS;anchors:{eye:FaceAnchorSummary;nose:FaceAnchorSummary};
}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
/** Corroboration only: proximity alone never disproves a punch. All distances are image shoulder-width units. */
export function assessFaceMotion(samples:readonly FaceMotionSample[],shoulderPeak:number,peakTimestampMs?:number):FaceMotionAssessment {
 const summarize=(key:'eyeRelative'|'noseRelative'):FaceAnchorSummary=>{
  const known=samples.filter(s=>s[key]&&Number.isFinite(s[key]!.x)&&Number.isFinite(s[key]!.y));
  let range=0;for(const a of known)for(const b of known)range=Math.max(range,distance(a[key]!,b[key]!));
  return {coverage:samples.length?known.length/samples.length:0,rangeShoulderWidths:known.length?range:null,maxProximityShoulderWidths:known.length?Math.max(...known.map(s=>Math.hypot(s[key]!.x,s[key]!.y))):null,observedSamples:known.length,durationMs:known.length?known[known.length-1].timestampMs-known[0].timestampMs:0,coversBoundaries:known.length>0&&known[0]===samples[0]&&known[known.length-1]===samples[samples.length-1],coversPeak:peakTimestampMs===undefined||known.some(s=>s.timestampMs===peakTimestampMs),maximumGapMs:known.length>=2?Math.max(...known.slice(1).map((s,i)=>s.timestampMs-known[i].timestampMs)):null};
 };
 const eye=summarize('eyeRelative'),nose=summarize('noseRelative');
 const adequate=(a:FaceAnchorSummary)=>a.coverage>=FACE_MOTION_THRESHOLDS.minCoverage&&a.observedSamples>=FACE_MOTION_THRESHOLDS.minSamples&&a.durationMs>=FACE_MOTION_THRESHOLDS.minDurationMs&&a.coversBoundaries&&a.coversPeak&&(a.maximumGapMs??Infinity)<=FACE_MOTION_THRESHOLDS.maxGapMs;
 const stable=(a:FaceAnchorSummary)=>adequate(a)&&a.rangeShoulderWidths!==null&&a.maxProximityShoulderWidths!==null&&a.rangeShoulderWidths<=FACE_MOTION_THRESHOLDS.maxRange&&a.maxProximityShoulderWidths<=FACE_MOTION_THRESHOLDS.maxProximity&&a.rangeShoulderWidths<=shoulderPeak*FACE_MOTION_THRESHOLDS.maxRangeToShoulderPeak;
 const contradicts=(a:FaceAnchorSummary)=>a.observedSamples>=2&&a.rangeShoulderWidths!==null&&a.maxProximityShoulderWidths!==null&&(a.rangeShoulderWidths>FACE_MOTION_THRESHOLDS.maxRange||a.maxProximityShoulderWidths>FACE_MOTION_THRESHOLDS.maxProximity||a.rangeShoulderWidths>shoulderPeak*FACE_MOTION_THRESHOLDS.maxRangeToShoulderPeak);
 const ordered=samples.every((s,i)=>Number.isFinite(s.timestampMs)&&(!i||s.timestampMs>samples[i-1].timestampMs&&s.timestampMs-samples[i-1].timestampMs<=FACE_MOTION_THRESHOLDS.maxGapMs));
 const result:FaceMotionAssessment={status:'insufficient',reason:'Insufficient reliable face-relative observations; no adjustment inference',anchorSupport:'none',thresholds:FACE_MOTION_THRESHOLDS,anchors:{eye,nose}};
 if(!ordered||!Number.isFinite(shoulderPeak)||shoulderPeak<=0)return result;
 if(stable(eye)&&stable(nose)){result.status='stable-near-face';result.anchorSupport='eye-and-nose';result.reason='Wrist stayed near both face anchors with substantially less excursion than its shoulder-relative cycle; consistent with a guard adjustment';}
 else if(stable(eye)&&!adequate(nose)&&!contradicts(nose)||stable(nose)&&!adequate(eye)&&!contradicts(eye)){result.status='uncertain';result.anchorSupport=stable(eye)?'eye-only':'nose-only';result.reason='Single face-anchor fallback suggests limited relative motion; punch intent cannot be established';}
 else if(adequate(eye)||adequate(nose)){result.status='movement-observed';result.anchorSupport=adequate(eye)&&adequate(nose)?'eye-and-nose':adequate(eye)?'eye-only':'nose-only';result.reason='Face-relative stability is not corroborated; proximity alone does not reject movement';}
 return result;
}
