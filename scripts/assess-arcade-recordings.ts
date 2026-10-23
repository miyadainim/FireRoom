/** Offline feasibility assessment only. No Coach changes, raw-video upload, or Arcade completion claim.
 * Run: node_modules/.bin/esbuild scripts/assess-arcade-recordings.ts --bundle --platform=node --format=esm --outfile=/tmp/fireroom-arcade-assess.mjs
 *      node /tmp/fireroom-arcade-assess.mjs <tracking-lab-or-prescribed.json> ...
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {basename} from 'node:path';
import {createHash} from 'node:crypto';
import {MovementCycleRecognizer} from '../src/vision/movement-cycle';
import {GuardEstimator} from '../src/vision/guard';
import {isPoseFrame,type PoseFrame} from '../src/shared/contracts';

const reports=[];
for(const path of process.argv.slice(2)){
 const raw=readFileSync(path,'utf8'),data=JSON.parse(raw);
 const runs=data.kind==='fireroom-tracking-lab'?data.runs:[{id:data.recordingId,model:'live-export',samples:(data.frames??[]).map((frame:PoseFrame)=>({frame,videoTimeMs:frame.timestampMs}))}];
 if(!Array.isArray(runs))throw Error(`No supported saved pose data: ${path}`);
 for(const run of runs){
  // Production uses Full. Heavy is reported separately for comparison, never substituted for Full.
  const detector=new MovementCycleRecognizer(),guard=new GuardEstimator('image-2d'),seen=new Set<string>(),events:any[]=[],outcomes:any[]=[],guardCounts={both:0,notGuard:0,unknown:0};
  let previous:PoseFrame|undefined,valid=0,rejected=0,gaps=0;
  for(const sample of run.samples){
   const frame={...sample.frame,timestampMs:sample.videoTimeMs} as PoseFrame;
   if(!isPoseFrame(frame)){rejected++;detector.reset();guard.reset();continue;}
   if(previous&&(frame.sessionId!==previous.sessionId||frame.cameraConfigurationId!==previous.cameraConfigurationId||frame.stance!==previous.stance||frame.timestampMs-previous.timestampMs>350)){gaps++;guard.reset();}
   previous=frame;valid++;outcomes.push(...detector.update(frame));
   for(const cue of detector.supportedOutwardMovements()){
    const id=JSON.stringify([cue.sessionId,cue.cameraConfigurationId,cue.hand,cue.departureMs]);
    if(seen.has(id))continue;seen.add(id);events.push({...cue,id});
   }
   const g=guard.update(frame);if(g.left.status==='unknown'||g.right.status==='unknown')guardCounts.unknown++;
   else if(g.left.status==='guard'&&g.right.status==='guard')guardCounts.both++;else guardCounts.notGuard++;
  }
  if(previous)outcomes.push(...detector.flush(previous.timestampMs));
  reports.push({file:basename(path),sha256:createHash('sha256').update(raw).digest('hex'),runId:run.id,clipId:run.clipId,model:run.model,samples:run.samples.length,valid,rejected,gaps,guardFrameObservations:guardCounts,
   events,completedCycles:outcomes.filter(o=>o.classification==='completed').map(o=>({hand:o.hand,type:o.type,departureMs:o.timestamps.departureMs,peakMs:o.timestamps.peakMs,recoveryMs:o.timestamps.recoveryMs,lowStart:o.evidence.startedFromLoweredPosition})),otherOutcomes:outcomes.filter(o=>o.classification!=='completed').map(o=>({hand:o.hand,type:o.type,status:o.classification,departureMs:o.timestamps.departureMs,endMs:o.timestamps.endMs,reason:o.evidence.reason}))});
 }
}
mkdirSync('docs/validation/arcade-input',{recursive:true});
writeFileSync('docs/validation/arcade-input/replay-results.json',JSON.stringify({kind:'offline-arcade-feasibility',reports,limitations:['Existing saved MediaPipe landmarks replayed; no fresh inference or end-to-end live latency measurement.','Early cues are movement evidence, not recovered PunchEvents or proof of intent.','No Arcade scene, combat resolver, live relay latency or Vega execution was exercised.','Guard counts are frame observations, not independent successes, defense accuracy, or elapsed durations.','Reviewed video synchronization may be approximate after transcoding. No general accuracy estimate.']},null,2));
for(const r of reports)console.log(JSON.stringify({file:r.file,model:r.model,events:r.events.length,jabs:r.events.filter(e=>e.type==='jab').length,crosses:r.events.filter(e=>e.type==='cross').length,completed:r.completedCycles.length,guard:r.guardFrameObservations,eventTimes:r.events.map(e=>[e.type,Math.round(e.observedAtMs),Math.round(e.departureMs)]),other:r.otherOutcomes},null,0));
