import {isPoseFrame} from '../shared/contracts';
import type {LabRun} from './types';
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const str=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<=2000;
/** Strict bounded import validation. Imported labels remain unverified user data. */
export function validateLabReport(value:unknown):LabRun[]{
 if(!value||typeof value!=='object')throw Error('Invalid lab report');const p=value as {schemaVersion?:unknown;kind?:unknown;runs?:unknown};
 if(p.schemaVersion!==1||p.kind!=='fireroom-tracking-lab'||!Array.isArray(p.runs)||p.runs.length>12)throw Error('Invalid report version or run count');
 const ids=new Set<string>();
 for(const r of p.runs){
  if(!r||r.schemaVersion!==1||!str(r.id)||ids.has(r.id)||!str(r.clipId)||!['lite','full','heavy'].includes(r.model)||!['CPU','GPU'].includes(r.delegate)||!['live','video'].includes(r.source)||!r.condition||!str(r.condition.id)||!str(r.condition.angle)||!str(r.condition.lighting)||!['full-body','upper-body'].includes(r.condition.framing)||typeof r.condition.notes!=='string'||r.condition.notes.length>4000||!['orthodox','southpaw'].includes(r.condition.stance)||![r.loadMs,r.warmupMs,r.totalMs].every(finite)||!Array.isArray(r.samples)||!r.samples.length||r.samples.length>800||!Array.isArray(r.intervals)||r.intervals.length>100||!Array.isArray(r.annotations)||r.annotations.length>500)throw Error('Invalid run');
  if(r.device&&(!str(r.device.userAgent)||!finite(r.device.hardwareConcurrency)||typeof r.device.recordedOnThisDevice!=='boolean'))throw Error('Invalid device metadata');
  ids.add(r.id);let previous=-1;
  for(const s of r.samples){if(!s||!isPoseFrame(s.frame)||!finite(s.videoTimeMs)||s.videoTimeMs>60000||s.videoTimeMs<=previous||s.frame.timestampMs!==s.videoTimeMs||!finite(s.inferenceMs)||s.decodeMs!==undefined&&!finite(s.decodeMs))throw Error('Invalid sample');previous=s.videoTimeMs;}
  for(const i of r.intervals)if(!i||!['guard','lead-reach','rear-reach','lead-short','rear-short','jab','cross','idle','occluded'].includes(i.phase)||!['calibration','evaluation'].includes(i.split)||i.label!==undefined&&!['full','short','negative'].includes(i.label)||!finite(i.startMs)||!finite(i.endMs)||i.endMs<=i.startMs||i.endMs>60000)throw Error('Invalid interval');
  const sorted=[...r.intervals].sort((a,b)=>a.startMs-b.startMs);if(sorted.some((i,k)=>k>0&&i.startMs<sorted[k-1].endMs))throw Error('Overlapping intervals');
  for(const a of r.annotations)if(!a||!finite(a.timestampMs)||a.timestampMs>60000||!['left','right'].includes(a.hand)||!['wrist','elbow'].includes(a.joint)||!['visible','occluded','uncertain'].includes(a.status)||!str(a.reviewer)||a.status==='visible'&&(!finite(a.x)||!finite(a.y)||a.x>1||a.y>1))throw Error('Invalid annotation');
 }
 return structuredClone(p.runs) as LabRun[];
}
