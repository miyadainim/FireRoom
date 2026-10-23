export const POST_DROP_THRESHOLDS={visibility:.65,lowEyeOffset:.5,baselineStableMs:100,baselineSpread:.04,departure:.35,minDepartureMs:75,outsideFaceRadius:.75,outsideFaceVertical:.5,minExcursionMs:180,recoveryStableMs:100,recoverySpread:.22,maxGapMs:350,maxHistoryMs:8000,maxSamples:300} as const;
type Point={x:number;y:number};
export interface PostDropSample {timestampMs:number;shoulderRelative:Point;eyeRelative?:Point;noseRelative?:Point;confidence:number}
export interface PostDropTrajectoryAssessment {
 status:'observing'|'restoration'|'outward-recovery'|'ambiguous';reason:string;
 baseline:{timestampMs:number;position:Point;basis:'stable-low-hold'|'supported-low-turn'}|null;departureMs:number|null;peakMs:number|null;outwardEndMs:number|null;recoveryMs:number|null;
 hypotheses:{restoration:{supported:boolean;settledDurationMs:number;reason:string};outwardRecovery:{supported:boolean;outwardSamples:number;excursionDurationMs:number;weakOutwardSamples?:number;weakExcursionDurationMs?:number;reason:string}};
 limitations:string[];
}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const nearFace=(s:PostDropSample)=>!!s.eyeRelative&&!!s.noseRelative&&Math.abs(s.eyeRelative.y)<=POST_DROP_THRESHOLDS.lowEyeOffset&&Math.hypot(s.eyeRelative.x,s.eyeRelative.y)<=POST_DROP_THRESHOLDS.outsideFaceRadius&&Math.hypot(s.noseRelative.x,s.noseRelative.y)<=POST_DROP_THRESHOLDS.outsideFaceRadius;
const outsideFace=(s:PostDropSample)=>!!s.eyeRelative&&!!s.noseRelative&&((s.eyeRelative.y< -POST_DROP_THRESHOLDS.outsideFaceVertical&&s.noseRelative.y< -POST_DROP_THRESHOLDS.outsideFaceVertical)||(Math.hypot(s.eyeRelative.x,s.eyeRelative.y)>POST_DROP_THRESHOLDS.outsideFaceRadius&&Math.hypot(s.noseRelative.x,s.noseRelative.y)>POST_DROP_THRESHOLDS.outsideFaceRadius&&s.eyeRelative.y<=POST_DROP_THRESHOLDS.lowEyeOffset));
/** Competing projected-trajectory interpretations, not proof of forward motion or punch intent. */
export function evaluatePostDropTrajectory(samples:readonly PostDropSample[]):PostDropTrajectoryAssessment {
 const result:PostDropTrajectoryAssessment={status:'observing',reason:'Continuing to observe restoration and outward-recovery interpretations',baseline:null,departureMs:null,peakMs:null,outwardEndMs:null,recoveryMs:null,hypotheses:{restoration:{supported:false,settledDurationMs:0,reason:'No sustained near-face settlement yet'},outwardRecovery:{supported:false,outwardSamples:0,excursionDurationMs:0,reason:'A low start alone is not evidence of outward movement'}},limitations:['Only projected 2D trajectory is observed; forward depth, punch intent and correct form are NOT VERIFIED.','An overhead or lateral reach can resemble a punch; prescription and independent form assessment remain necessary.']};
 if(samples.length>POST_DROP_THRESHOLDS.maxSamples||(samples.length>1&&samples[samples.length-1].timestampMs-samples[0].timestampMs>POST_DROP_THRESHOLDS.maxHistoryMs)){result.status='ambiguous';result.reason='Post-drop observation window exceeded bounded history limits';return result;}
 if(samples.some((s,i)=>!Number.isFinite(s.timestampMs)||!Number.isFinite(s.confidence)||s.confidence<POST_DROP_THRESHOLDS.visibility||!s.eyeRelative||!s.noseRelative||![s.shoulderRelative.x,s.shoulderRelative.y,s.eyeRelative.x,s.eyeRelative.y,s.noseRelative.x,s.noseRelative.y].every(Number.isFinite)||(i>0&&(s.timestampMs<=samples[i-1].timestampMs||s.timestampMs-samples[i-1].timestampMs>POST_DROP_THRESHOLDS.maxGapMs)))){result.status='ambiguous';result.reason='Missing, low-confidence or discontinuous observations prevent a post-drop trajectory decision';return result;}
 let lowRun:PostDropSample[]=[],lowHistory:PostDropSample[]=[],baseline:PostDropSample|undefined,departureCandidate:PostDropSample|undefined,departure:number|undefined;
 let excursionStart:number|undefined,excursion:PostDropSample[]=[],supportedExcursion:PostDropSample[]=[],settle:PostDropSample[]=[],weakExcursion=false,weakSamples:PostDropSample[]=[];
 for(const s of samples){
  if(!baseline&&s.eyeRelative!.y>POST_DROP_THRESHOLDS.lowEyeOffset){
   lowRun=[...lowRun,s].filter(v=>s.timestampMs-v.timestampMs<=400);
   lowHistory=[...lowHistory,s].filter(v=>s.timestampMs-v.timestampMs<=400);
   while(lowHistory.length>1&&!lowHistory.every(v=>lowHistory.every(w=>distance(v.shoulderRelative,w.shoulderRelative)<=POST_DROP_THRESHOLDS.baselineSpread)))lowHistory.shift();
   if(lowHistory.length>=2&&s.timestampMs-lowHistory[0].timestampMs>=POST_DROP_THRESHOLDS.baselineStableMs){baseline=s;result.baseline={timestampMs:s.timestampMs,position:{...s.shoulderRelative},basis:'stable-low-hold'};}
  }
  if(!baseline&&lowRun.length>=4){
   const extremum=lowRun.reduce((a,b)=>b.shoulderRelative.y>a.shoulderRelative.y?b:a),index=lowRun.indexOf(extremum);
   const before=lowRun.slice(0,index),upward=lowRun.slice(index+1).filter(v=>extremum.shoulderRelative.y-v.shoulderRelative.y>=.22);
   if(before.length&&extremum.shoulderRelative.y-before[0].shoulderRelative.y>=.1&&upward.length>=2&&upward[upward.length-1].timestampMs-upward[0].timestampMs>=POST_DROP_THRESHOLDS.minDepartureMs){baseline=extremum;result.baseline={timestampMs:extremum.timestampMs,position:{...extremum.shoulderRelative},basis:'supported-low-turn'};}
  }
  if(!baseline&&s.eyeRelative!.y<=POST_DROP_THRESHOLDS.lowEyeOffset){lowHistory=[];lowRun=[];}

  if(baseline&&departure===undefined&&distance(s.shoulderRelative,baseline.shoulderRelative)>=POST_DROP_THRESHOLDS.departure){
   if(departureCandidate&&s.timestampMs-departureCandidate.timestampMs>=POST_DROP_THRESHOLDS.minDepartureMs&&((departureCandidate.shoulderRelative.x-baseline.shoulderRelative.x)*(s.shoulderRelative.x-baseline.shoulderRelative.x)+(departureCandidate.shoulderRelative.y-baseline.shoulderRelative.y)*(s.shoulderRelative.y-baseline.shoulderRelative.y))>0){departure=departureCandidate.timestampMs;result.departureMs=departure;if(outsideFace(departureCandidate)){excursionStart=departure;excursion=[departureCandidate];}}
   else departureCandidate??=s;
  }else if(departure===undefined)departureCandidate=undefined;
  if(outsideFace(s)){
   excursionStart??=s.timestampMs;excursion.push(s);
   if(excursion.length>=2&&s.timestampMs-excursionStart>=POST_DROP_THRESHOLDS.minDepartureMs){weakExcursion=true;if(!weakSamples.length||s.timestampMs-excursionStart>=weakSamples[weakSamples.length-1].timestampMs-weakSamples[0].timestampMs)weakSamples=[...excursion];}
   if(departure!==undefined&&excursion.length>=2&&s.timestampMs-excursionStart>=POST_DROP_THRESHOLDS.minExcursionMs)supportedExcursion=[...excursion];
  }else {excursionStart=undefined;excursion=[];}
  if(nearFace(s)){
   settle.push(s);
   while(settle.length>1&&!settle.every(v=>settle.every(w=>distance(v.eyeRelative!,w.eyeRelative!)<=POST_DROP_THRESHOLDS.recoverySpread)))settle.shift();
  }else settle=[];
  const duration=settle.length?s.timestampMs-settle[0].timestampMs:0;
  if(settle.length>=2&&duration>=POST_DROP_THRESHOLDS.recoveryStableMs){
   result.recoveryMs=settle[0].timestampMs;
   result.hypotheses.restoration={supported:supportedExcursion.length===0&&!weakExcursion,settledDurationMs:duration,reason:supportedExcursion.length?'Settlement followed a sustained excursion outside the face region':weakExcursion?'Near-face settlement observed, but a brief outward interpretation remains unresolved':'Wrist returned into the face region and settled without a supported outward excursion'};
   if(supportedExcursion.length&&baseline){
    const ranked=supportedExcursion.map(v=>({sample:v,travel:distance(v.shoulderRelative,baseline!.shoulderRelative)})).sort((a,b)=>b.travel-a.travel);
    result.peakMs=ranked[Math.floor(Math.min(3,ranked.length)/2)].sample.timestampMs;result.outwardEndMs=supportedExcursion[supportedExcursion.length-1].timestampMs;
    result.status='outward-recovery';result.reason='Supported projected excursion from a lowered position, followed by return and stable near-face recovery';
    result.hypotheses.outwardRecovery={supported:true,outwardSamples:supportedExcursion.length,excursionDurationMs:supportedExcursion[supportedExcursion.length-1].timestampMs-supportedExcursion[0].timestampMs,reason:'Multiple observations support departure, sustained movement beyond the face region, a robust peak and subsequent recovery'};
   }else if(weakExcursion){result.status='ambiguous';result.reason='A brief or insufficiently anchored outside-face excursion competes with restoration';result.hypotheses.restoration.supported=false;}else {result.status='restoration';result.reason='Near-face restoration is supported; no completed outward-recovery excursion observed';}
  }
 }
 if(!result.hypotheses.outwardRecovery.supported&&supportedExcursion.length){result.status='ambiguous';result.reason='An outward excursion was observed, but reliable settled recovery is not established';result.hypotheses.outwardRecovery.outwardSamples=supportedExcursion.length;result.hypotheses.outwardRecovery.excursionDurationMs=supportedExcursion[supportedExcursion.length-1].timestampMs-supportedExcursion[0].timestampMs;}
 if(weakSamples.length){
  result.hypotheses.outwardRecovery.weakOutwardSamples=weakSamples.length;
  result.hypotheses.outwardRecovery.weakExcursionDurationMs=weakSamples[weakSamples.length-1].timestampMs-weakSamples[0].timestampMs;
  if(!supportedExcursion.length){
   result.status='ambiguous';result.hypotheses.outwardRecovery.supported=false;
   result.hypotheses.outwardRecovery.outwardSamples=weakSamples.length;
   result.hypotheses.outwardRecovery.excursionDurationMs=result.hypotheses.outwardRecovery.weakExcursionDurationMs;
   result.hypotheses.outwardRecovery.reason='Brief outside-face observations are recorded, but do not establish a sustained outward-recovery sequence';
   result.reason='A brief outside-face excursion remains ambiguous; restoration alone is not established';
  }
 }
 return result;
}
