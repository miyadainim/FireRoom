import type { Hand } from '../shared/contracts';

/** Ground truth is deliberately separate from prompted LabIntervals. Milliseconds on the video clock. */
export interface ReviewedMovementLabel {
 id:string; startMs:number; endMs:number; kind:'jab'|'cross'|'negative'; hand?:Hand;
 category:'correct-punch'|'short-punch'|'feint'|'guard-adjustment'|'elbow-occlusion'|'camera-change'|'idle';
 reviewer:string; reviewed:boolean; split:'evaluation'|'calibration';
 onsetMs?:number; peakMs?:number; recoveryMs?:number;
}
export interface EvaluationPunch {
 id:string;type:'jab'|'cross';hand:Hand;onsetMs?:number;peakMs?:number;recoveryMs:number;
}
export interface EvaluationOptions { recoveryToleranceMs?:number }
const requiredCategories:ReviewedMovementLabel['category'][]=['correct-punch','short-punch','feint','guard-adjustment','elbow-occlusion','camera-change'];
const validTime=(x:number)=>Number.isFinite(x)&&x>=0;
function validLabel(l:ReviewedMovementLabel){
 return l.reviewed&&l.reviewer.trim().length>0&&l.split==='evaluation'&&validTime(l.startMs)&&validTime(l.endMs)&&l.endMs>l.startMs&&
 [l.onsetMs,l.peakMs,l.recoveryMs].every(t=>t===undefined||validTime(t)&&t>=l.startMs&&t<=l.endMs)&&
 (l.kind==='negative'||l.hand!==undefined)&&
 !(l.onsetMs!==undefined&&l.peakMs!==undefined&&l.onsetMs>l.peakMs)&&
 !(l.peakMs!==undefined&&l.recoveryMs!==undefined&&l.peakMs>l.recoveryMs);
}
/** Maximum-cardinality, deterministic, one-to-one matching. No event can satisfy two punches.
 * Only independently reviewed evaluation windows are scored. Outside-window events remain unscored.
 * Boundary errors require explicit reviewer-marked boundary timestamps, never prompt edges. */
export function evaluatePunchEvents(events:EvaluationPunch[],labels:ReviewedMovementLabel[],options:EvaluationOptions={}){
 const tolerance=options.recoveryToleranceMs??250;
 if(!Number.isFinite(tolerance)||tolerance<0)throw new Error('Recovery tolerance must be finite and nonnegative');
 if(new Set(labels.map(l=>l.id)).size!==labels.length||new Set(events.map(e=>e.id)).size!==events.length)throw new Error('Duplicate evaluation identifiers');
 if(events.some(e=>!validTime(e.recoveryMs)||[e.onsetMs,e.peakMs].some(t=>t!==undefined&&(!validTime(t)||t>e.recoveryMs))))throw new Error('Invalid event timing');
 const reviewed=labels.filter(validLabel),positive=reviewed.filter(l=>l.kind!=='negative');
 if(reviewed.some((l,i)=>reviewed.slice(i+1).some(r=>Math.max(l.startMs,r.startMs)<Math.min(l.endMs,r.endMs))))throw new Error('Reviewed evaluation windows must not overlap');
 const candidates=positive.map(l=>events.map((e,i)=>({e,i})).filter(({e})=>e.type===l.kind&&e.hand===l.hand&&e.recoveryMs>=l.startMs&&e.recoveryMs<=l.endMs+tolerance&&!reviewed.some(other=>other!==l&&e.recoveryMs>=other.startMs&&e.recoveryMs<other.endMs)&&(e.onsetMs===undefined||e.onsetMs<=l.endMs)).sort((a,b)=>Math.abs(a.e.recoveryMs-(l.recoveryMs??l.endMs))-Math.abs(b.e.recoveryMs-(l.recoveryMs??l.endMs))).map(x=>x.i));
 const owners=new Map<number,number>();
 function assign(labelIndex:number,seen:Set<number>):boolean {for(const eventIndex of candidates[labelIndex]){if(seen.has(eventIndex))continue;seen.add(eventIndex);const previous=owners.get(eventIndex);if(previous===undefined||assign(previous,seen)){owners.set(eventIndex,labelIndex);return true;}}return false;}
 positive.forEach((_,i)=>assign(i,new Set()));
 const matches=[...owners].map(([ei,li])=>{
 const e=events[ei],l=positive[li];return {eventId:e.id,labelId:l.id,onsetErrorMs:e.onsetMs!==undefined&&l.onsetMs!==undefined?e.onsetMs-l.onsetMs:null,peakErrorMs:e.peakMs!==undefined&&l.peakMs!==undefined?e.peakMs-l.peakMs:null,recoveryErrorMs:l.recoveryMs!==undefined?e.recoveryMs-l.recoveryMs:null};});
 const unmatched=events.filter((_,i)=>!owners.has(i));
 const falsePositives=unmatched.filter(e=>reviewed.some(l=>e.recoveryMs>=l.startMs&&e.recoveryMs<=l.endMs+(l.kind==='negative'?0:tolerance)));
 const unscored=unmatched.filter(e=>!falsePositives.includes(e));
 const tp=matches.length,fp=falsePositives.length,fn=positive.length-tp;
 const timing=(key:'onsetErrorMs'|'peakErrorMs'|'recoveryErrorMs')=>{const xs=matches.map(m=>m[key]).filter((v):v is number=>v!==null);return {count:xs.length,meanSignedMs:xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null,meanAbsoluteMs:xs.length?xs.reduce((a,b)=>a+Math.abs(b),0)/xs.length:null};};
 const categoryCoverage=Object.fromEntries(requiredCategories.map(c=>[c,reviewed.filter(l=>l.category===c).length]));
 return {status:positive.length?'DESCRIPTIVE REVIEWED CLIP ONLY':'NOT VERIFIED',truePositives:tp,falsePositives:fp,falseNegatives:fn,precision:tp+fp?tp/(tp+fp):null,recall:positive.length?tp/positive.length:null,matches,falsePositiveIds:falsePositives.map(e=>e.id),missedLabelIds:positive.filter(l=>!matches.some(m=>m.labelId===l.id)).map(l=>l.id),unscoredEventIds:unscored.map(e=>e.id),excludedLabelIds:labels.filter(l=>!reviewed.includes(l)).map(l=>l.id),categoryCoverage,requiredCoverageComplete:requiredCategories.every(c=>categoryCoverage[c]>0),timing:{onset:timing('onsetErrorMs'),peak:timing('peakErrorMs'),recovery:timing('recoveryErrorMs')},physicalValidation:'NOT VERIFIED',limitations:['Prompted labels and calibration windows are not ground truth.','Events outside reviewed windows are unscored; false positives over the full recording are not established.','Small reviewed samples do not establish general precision or recall.','A feint and a short punch can have similar wrist motion; intended action needs independent review.']};
}

/** Import only this explicit review format; never silently upgrade prompted intervals. */
export function validateMovementLabels(value:unknown,clipId:string):ReviewedMovementLabel[]{
 if(!value||typeof value!=='object')throw new Error('Expected reviewed movement-label JSON');
 const report=value as Record<string,unknown>;
 if(report.schemaVersion!==1||report.kind!=='fireroom-reviewed-movements'||report.clipId!==clipId||!Array.isArray(report.labels)||report.labels.length>500)throw new Error('Reviewed labels must match this clipId and schema');
 const categories=[...requiredCategories,'idle'];
 const labels=report.labels.map(raw=>{
  if(!raw||typeof raw!=='object')throw new Error('Invalid movement label');
  const l=raw as ReviewedMovementLabel;
  if(typeof l.id!=='string'||!l.id||typeof l.reviewer!=='string'||typeof l.reviewed!=='boolean'||!['evaluation','calibration'].includes(l.split)||!['jab','cross','negative'].includes(l.kind)||!categories.includes(l.category)||l.hand!==undefined&&!['left','right'].includes(l.hand)||!validTime(l.startMs)||!validTime(l.endMs)||l.endMs<=l.startMs||l.endMs>60000||[l.onsetMs,l.peakMs,l.recoveryMs].some(t=>t!==undefined&&(!validTime(t)||t<l.startMs||t>l.endMs))||l.kind!=='negative'&&!l.hand)throw new Error('Invalid movement label fields');
  if(l.onsetMs!==undefined&&l.peakMs!==undefined&&l.onsetMs>l.peakMs||l.peakMs!==undefined&&l.recoveryMs!==undefined&&l.peakMs>l.recoveryMs||l.onsetMs!==undefined&&l.recoveryMs!==undefined&&l.onsetMs>l.recoveryMs)throw new Error('Movement boundaries must be ordered');
  return structuredClone(l);
 });
 if(new Set(labels.map(l=>l.id)).size!==labels.length)throw new Error('Duplicate movement label identifiers');
 const reviewed=labels.filter(validLabel);
 if(reviewed.some((l,i)=>reviewed.slice(i+1).some(r=>Math.max(l.startMs,r.startMs)<Math.min(l.endMs,r.endMs))))throw new Error('Reviewed evaluation windows must not overlap');
 return labels;
}

import type {LabRun} from './types';
import {PunchRecognizer} from '../vision/recognizer';
import {MovementCycleRecognizer,assessMovementExtension,MOVEMENT_DETECTOR_VERSION} from '../vision/movement-cycle';
/** Both detectors receive the identical immutable frame stream; old baseline is unmodified. */
export function compareLabDetectors(run:LabRun,labels:ReviewedMovementLabel[]=[]){
 const oldDetector=new PunchRecognizer('image-3d');
 const newDetector=new MovementCycleRecognizer();
 const oldEvents:EvaluationPunch[]=[],newEvents:EvaluationPunch[]=[];
 const outcomes:ReturnType<MovementCycleRecognizer['update']>=[];
 for(const sample of run.samples){
  const frame={...sample.frame,timestampMs:sample.videoTimeMs};
  for(const e of oldDetector.update(frame))oldEvents.push({id:`old-${e.sequence}`,type:e.type,hand:e.hand,recoveryMs:e.timestampMs});
  outcomes.push(...newDetector.update(frame));
 }
 const end=run.samples[run.samples.length-1]?.videoTimeMs;
 if(end!==undefined)outcomes.push(...newDetector.flush(end));
 outcomes.forEach((e,i)=>{if(e.classification==='completed'&&e.timestamps.recoveryMs!==null)newEvents.push({id:`new-${i}`,type:e.type,hand:e.hand,onsetMs:e.timestamps.departureMs,peakMs:e.timestamps.peakMs,recoveryMs:e.timestamps.recoveryMs});});
 return {schemaVersion:1,kind:'fireroom-movement-comparison',detectorVersion:MOVEMENT_DETECTOR_VERSION,generatedAt:new Date().toISOString(),clipId:run.clipId,runId:run.id,model:run.model,sampleCount:run.samples.length,geometry:{oldGuard:'image-3d',newGuard:'image-2d'},baseline:'Unmodified PunchRecognizer; onset and peak timestamps unavailable',old:{events:oldEvents,evaluation:evaluatePunchEvents(oldEvents,labels)},new:{events:newEvents,outcomes,extensionAssessments:outcomes.map(outcome=>({sequence:outcome.sequence,hand:outcome.hand,assessment:assessMovementExtension({hand:outcome.hand,cameraConfigurationId:outcome.evidence.cameraConfigurationId,reliable:false})})),evaluation:evaluatePunchEvents(newEvents,labels)},labels,physicalValidation:'NOT VERIFIED',warning:'Completed wrist-motion cycles are not validated punch intent or form. Feints may overlap genuine short-punch motion.'};
}
