import {isPoseFrame,type PoseFrame} from '../../shared/contracts';
import {constrainedDtw} from './align';
import {poseSample,resample} from './features';
import type {DtwEvaluation,DtwReference,DtwSample,ReferencePhase} from './types';
const good=(s:DtwSample)=>s.valid.every(Boolean);
const distance=(a:number[],b:number[],offset=0)=>Math.hypot(...a.slice(offset,offset+3).map((v,i)=>v-b[offset+i]));
const near=(samples:DtwSample[],time:number)=>samples.reduce((a,b)=>Math.abs(a.timeMs-time)<Math.abs(b.timeMs-time)?a:b);
const offset=(phase:ReferencePhase)=>phase.hand==='left'?0:3;
function ordered(frames:PoseFrame[]):boolean{return frames.every((f,i)=>isPoseFrame(f)&&(!i||(f.timestampMs>frames[i-1].timestampMs&&f.sequence>frames[i-1].sequence&&f.sessionId===frames[0].sessionId)));}
export function validateReference(value:unknown):{valid:boolean;errors:string[]}{
 const errors:string[]=[];const r=value as DtwReference;
 if(!r||typeof r!=='object')return {valid:false,errors:['Reference must be an object']};
 if(r.schemaVersion!==1||r.kind!=='fireroom-dtw-reference'||typeof r.id!=='string'||!r.id.trim())errors.push('Invalid reference envelope');
 if(!['jab','jab-cross'].includes(r.drill)||!['orthodox','southpaw'].includes(r.stance)||!['world-3d','image-2d'].includes(r.geometryMode)||typeof r.cameraPlacement!=='string'||!r.cameraPlacement.trim())errors.push('Explicit drill, stance, geometry and placement required');
 if(!r.review||r.review.status!=='reviewed'||typeof r.review.reviewer!=='string'||!r.review.reviewer.trim()||typeof r.review.reviewedAt!=='string'||!/^\d{4}-\d\d-\d\dT/.test(r.review.reviewedAt)||!Number.isFinite(Date.parse(r.review.reviewedAt)))errors.push('Reviewed reference metadata required; metadata alone does not verify actual review');
 if(!Array.isArray(r.frames)||r.frames.length<5||r.frames.length>600||!ordered(r.frames))errors.push('Reference requires 5–600 ordered valid frames');
 if(errors.length)return {valid:false,errors};
 const duration=r.frames[r.frames.length-1].timestampMs-r.frames[0].timestampMs;
 if(duration<200||duration>30000||r.frames.some(f=>f.stance!==r.stance))errors.push('Invalid reference duration or stance');
 const samples=r.frames.map(f=>poseSample(f,r.geometryMode));
 if(samples.filter(good).length/samples.length<.8||r.frames.some((f,i)=>i>0&&f.timestampMs-r.frames[i-1].timestampMs>350))errors.push('Insufficient reference observation coverage');
 if(!Array.isArray(r.phases)||r.phases.length!==(r.drill==='jab'?1:2)||r.phases.some(p=>!p||typeof p!=='object'))errors.push('One phase per prescribed punch required');
 else r.phases.forEach((p,i)=>{
 const hand=(i===0)===(r.stance==='orthodox')?'left':'right';
 if(!p||p.punch!==(i===0?'jab':'cross')||p.hand!==hand||![p.guardStartMs,p.extensionMs,p.recoveryMs].every(Number.isFinite)||!(0<=p.guardStartMs&&p.guardStartMs<p.extensionMs&&p.extensionMs<p.recoveryMs&&p.recoveryMs<=duration)||(i>0&&p.extensionMs<=r.phases[i-1].recoveryMs)){errors.push('Invalid anatomical order or phase boundaries');return;}
 const start=r.frames[0].timestampMs;const a=near(samples,start+p.guardStartMs),b=near(samples,start+p.extensionMs),c=near(samples,start+p.recoveryMs);
 const segment=samples.filter(s=>s.timeMs>=start+p.guardStartMs&&s.timeMs<=start+p.recoveryMs);
 const amplitude=distance(a.values,b.values,offset(p));
 if(!good(a)||!good(b)||!good(c)||segment.length<3||segment.filter(good).length/segment.length<.8||amplitude<.25||distance(a.values,c.values,offset(p))>amplitude*.5)errors.push('Reference phase lacks observable outward motion and recovery');
 });
 return {valid:errors.length===0,errors};
}
export function evaluateAttempt(frames:PoseFrame[],reference:DtwReference|null):DtwEvaluation {
 const result:DtwEvaluation={schemaVersion:1,kind:'fireroom-dtw-evaluation',status:'rejected',reasons:[],alignment:null,coverage:0,phaseCoverage:[],findings:[],timing:{attemptDurationMs:0,referenceDurationMs:0,durationRatio:null,maxGapMs:0},limitations:['Provisional sequence comparison, not an overall technique score.','Review metadata cannot establish that a human actually reviewed a reference.','Estimated coordinates cannot establish hidden elbow form; camera placement must match the reviewed reference.','Synthetic tests do not validate physical coaching accuracy.']};
 if(!reference||reference.review?.status==='pending'){result.status='reference-required';result.reasons.push('Capture and independently review a reference first');return result;}
 const validation=validateReference(reference);if(!validation.valid){result.reasons=validation.errors;return result;}
 if(!Array.isArray(frames)||frames.length<5||frames.length>600||!ordered(frames)||frames.some(f=>f.stance!==reference.stance)){result.reasons.push('Attempt requires 5–600 ordered frames with reference stance');return result;}
 const start=frames[0].timestampMs,duration=frames[frames.length-1].timestampMs-start,refStart=reference.frames[0].timestampMs,refDuration=reference.frames[reference.frames.length-1].timestampMs-refStart;
 result.timing={attemptDurationMs:duration,referenceDurationMs:refDuration,durationRatio:duration/refDuration,maxGapMs:Math.max(...frames.slice(1).map((f,i)=>f.timestampMs-frames[i].timestampMs))};
 if(duration<200||duration>30000){result.reasons.push('Attempt duration outside bounded 0.2–30 seconds');return result;}
 const samples=resample(frames,reference.geometryMode),refs=resample(reference.frames,reference.geometryMode);
 result.coverage=samples.filter(good).length/samples.length;
 if(result.coverage<.8||result.timing.maxGapMs>350){result.reasons.push('Insufficient observation coverage or tracking gap above 350 ms');return result;}
 const alignment=constrainedDtw(samples,refs);result.alignment=alignment;
 if(alignment.status!=='aligned'){result.reasons.push(alignment.reason);return result;}
 // Map annotated phases through alignment, then independently require real per-hand motion,
 // ordered peaks, recovery and endpoint posture. Distance alone never accepts an attempt.
 let previousPeak=-1;
 for(const phase of reference.phases){
 const o=offset(phase);const refA=near(refs,refStart+phase.guardStartMs),refB=near(refs,refStart+phase.extensionMs),refC=near(refs,refStart+phase.recoveryMs);
 const map=(time:number)=>{const index=refs.indexOf(near(refs,time));const matches=alignment.path.filter(([,j])=>j===index).map(([i])=>i);return matches.length?Math.round(matches.reduce((a,b)=>a+b,0)/matches.length):-1;};
 const a=map(refA.timeMs),b=map(refB.timeMs),c=map(refC.timeMs);
 let reason='';let peak=-1;
 if(a<0||b<=a||c<=b)reason='Missing distinct guard, extension and recovery observations';
 else {
 const window=samples.slice(a,c+1),valid=window.filter(good),origin=samples[a],end=samples[c];
 const referenceAmplitude=distance(refA.values,refB.values,o);
 const distances=window.map(s=>good(s)?distance(origin.values,s.values,o):-1);
 const amplitude=Math.max(...distances);peak=a+distances.indexOf(amplitude);
 const observedVector=samples[peak].values.slice(o,o+3).map((v,i)=>v-origin.values[o+i]);
 const referenceVector=refB.values.slice(o,o+3).map((v,i)=>v-refA.values[o+i]);
 const directionalSimilarity=observedVector.reduce((sum,v,i)=>sum+v*referenceVector[i],0)/Math.max(1e-9,amplitude*referenceAmplitude);
 const relativeVectorError=Math.hypot(...observedVector.map((v,i)=>v/Math.max(1e-9,amplitude)-referenceVector[i]/referenceAmplitude));
 if(valid.length/window.length<.8||!good(origin)||!good(end))reason='Phase observation coverage below 80%';
 else if(amplitude<Math.max(.25,referenceAmplitude*.75))reason='Insufficient outward movement: idle, partial or unrelated motion';
 else if(directionalSimilarity<.7)reason='Outward trajectory direction differs from reviewed reference';
 else if(peak<=a||peak>=c||peak<=previousPeak)reason='Punch peaks do not follow prescribed order';
 else if(distance(origin.values,end.values,o)>Math.max(.2,referenceAmplitude*.45))reason='Required recovery not completed';
 else if(distance(origin.values,refA.values,o)>.6||distance(end.values,refC.values,o)>.6)reason='Guard or recovery position differs from reference';
 // Opposite hand must remain near the reference guard, not simply default to guard.
 const other=o===0?3:0;
 const guardError=valid.length?Math.max(...valid.map(s=>distance(s.values,refA.values,other))):0;
 const phaseObservable=valid.length/window.length>=.8&&good(origin)&&good(end);
 result.findings.push({criterion:'guard',phase:phase.punch,status:!phaseObservable?'not-assessable':guardError>.6?'deviation':'similar',measurement:phaseObservable?guardError:null,unit:'shoulder widths',message:'Maximum observed opposite-hand displacement from reviewed guard; position evidence only. A sequence match does not imply good form'});
 result.findings.push({criterion:'trajectory',phase:phase.punch,status:!phaseObservable?'not-assessable':directionalSimilarity<.7?'deviation':'similar',measurement:phaseObservable?relativeVectorError:null,unit:'normalized vector difference',message:'Outward direction compared in the supported camera coordinate system; provisional cosine threshold 0.7, not anatomical technique ground truth'});
 result.findings.push({criterion:'trajectory',phase:phase.punch,status:!phaseObservable?'not-assessable':reason?'deviation':'similar',measurement:phaseObservable?amplitude/referenceAmplitude:null,unit:'reference amplitude ratio',message:'Observed outward displacement relative to reviewed movement; not proof of anatomical extension'});
 result.findings.push({criterion:'recovery',phase:phase.punch,status:!phaseObservable?'not-assessable':distance(origin.values,end.values,o)>.45*referenceAmplitude?'deviation':'similar',measurement:phaseObservable?distance(origin.values,end.values,o):null,unit:'shoulder widths',message:'Observed wrist return distance'});
 }
 previousPeak=peak;result.phaseCoverage.push({punch:phase.punch,covered:!reason,reason:reason||'Ordered outward movement and recovery observed'});
 if(reason)result.reasons.push(`${phase.punch}: ${reason}`);
 result.findings.push({criterion:'elbow',phase:phase.punch,status:'not-assessable',measurement:null,unit:'',message:'No independently verified elbow observability annotation; inferred geometry is insufficient for a form judgment'});
 }
 let longestStationaryMs=0,stationaryMs=0;
 for(let i=1;i<samples.length;i++){const a=samples[i-1],b=samples[i];const dt=b.timeMs-a.timeMs;const speed=Math.max(distance(a.values,b.values,0),distance(a.values,b.values,3))/Math.max(.001,dt/1000);if(good(a)&&good(b)&&speed<.1){stationaryMs+=dt;longestStationaryMs=Math.max(longestStationaryMs,stationaryMs);}else stationaryMs=0;}
 result.findings.push({criterion:'timing',phase:'attempt',status:'not-assessable',measurement:longestStationaryMs,unit:'ms',message:'Longest observed low-motion interval (<0.1 shoulder widths/s), including endpoint guard holds. Descriptive only; no validated pause target.'});
 result.findings.push({criterion:'timing',phase:'attempt',status:'not-assessable',measurement:duration/refDuration,unit:'duration ratio',message:'Timing reported separately; DTW can hide pauses and speed differences. No validated timing target.'});
 if(!result.reasons.length&&alignment.distance!==null&&alignment.distance>.6)result.reasons.push('Aligned positional difference exceeds provisional rejection bound');
 if(!result.reasons.length){result.status='aligned';result.reasons.push('Provisional prescribed sequence match; physical coaching accuracy NOT VERIFIED');}
 return result;
}
