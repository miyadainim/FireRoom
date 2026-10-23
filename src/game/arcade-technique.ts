import type {PoseFrame,Hand} from '../shared/contracts';
import type {LiveOutwardMovement,MovementCycleOutcome} from '../vision/movement-cycle';
import {assessBoundaryGuard} from '../vision/guard-boundaries';
import {assessGuardHeight} from '../vision/guard-height';
import {ARCADE_BALANCE,type ArcadeTechnique,type Criterion} from './arcade-combat-contracts';
const verdict=(status:'supported'|'deviation'|'cannot-assess'):Criterion=>status==='supported'?'PASS':status==='deviation'?'FAIL':'UNKNOWN';
export const arcadePunchId=(session:string,camera:string|undefined,stance:PoseFrame['stance'],hand:Hand,departure:number)=>JSON.stringify([session,camera,stance,hand,departure]);
interface Pending {id:string;cue:LiveOutwardMovement;startingGuard:Criterion;outcome?:MovementCycleOutcome}
/** Producer-clock, bounded evidence bridge. This does not classify or emit punches. */
export class ArcadeTechniqueEvidence {
 private frames:PoseFrame[]=[];private pending=new Map<string,Pending>();private ready:ArcadeTechnique[]=[];
 observe(frame:PoseFrame){this.frames.push(frame);this.frames=this.frames.filter(f=>f.timestampMs>=frame.timestampMs-3500).slice(-512);}
 begin(id:string,cue:LiveOutwardMovement){if(this.pending.has(id))return;this.pending.set(id,{id,cue,startingGuard:verdict(assessBoundaryGuard(this.frames,Math.max(0,cue.departureMs-500),cue.departureMs,'start').status)});}
 outcomes(outcomes:MovementCycleOutcome[],stance:PoseFrame['stance']){for(const outcome of outcomes){const id=arcadePunchId(outcome.sessionId,outcome.evidence.cameraConfigurationId,stance,outcome.hand,outcome.timestamps.departureMs);const p=this.pending.get(id);if(p)p.outcome=outcome;}}
 advance(now:number){for(const p of this.pending.values()){
  const out=p.outcome,finish=out?(out.timestamps.recoveryMs??out.evidence.movementObservation?.outwardEndMs??out.timestamps.peakMs):undefined;
  const recovery=finish!=null?verdict(assessBoundaryGuard(this.frames,finish,now,'end').status):'UNKNOWN';
  const expired=now-p.cue.departureMs>=ARCADE_BALANCE.techniqueTimeoutMs;
  // Wrist return is not sufficient: wait for an explicit observed two-hand hold.
  if(recovery!=='PASS'&&!expired)continue;
  const end=out?.evidence.movementObservation?.outwardEndMs??out?.timestamps.peakMs??p.cue.peakMs;
  const opposite=verdict(assessGuardHeight(this.frames.filter(f=>f.timestampMs>=p.cue.departureMs&&f.timestampMs<=end),p.cue.hand==='left'?'right':'left',this.frames.filter(f=>f.timestampMs<=p.cue.departureMs)).status);
  this.ready.push({schemaVersion:1,punchId:p.id,type:p.cue.type,startingGuard:p.startingGuard,oppositeGuard:opposite,recovery,completedAtMs:now,reason:recovery==='PASS'?'Observed two-hand guard return; image-plane guard evidence only':'Bounded assessment window ended; unsupported criteria remain unknown'});this.pending.delete(p.id);
 }}
 interrupt(){for(const p of this.pending.values())this.ready.push({schemaVersion:1,punchId:p.id,type:p.cue.type,startingGuard:p.startingGuard,oppositeGuard:'UNKNOWN',recovery:'UNKNOWN',completedAtMs:this.frames[this.frames.length-1]?.timestampMs??p.cue.observedAtMs,reason:'Tracking continuity interrupted; remaining criteria cannot be assessed'});this.pending.clear();this.frames=[];}
 drain(){const result=this.ready;this.ready=[];return result;}
 reset(){this.pending.clear();this.frames=[];this.ready=[];}
}
