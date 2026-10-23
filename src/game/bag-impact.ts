import {MovementCycleRecognizer,type LiveOutwardMovement} from '../vision/movement-cycle';
import type {PrescribedAttemptConfig} from '../vision/prescribed';
import type {PoseFrame} from '../shared/contracts';
export interface VirtualBagImpact extends LiveOutwardMovement {id:string;attemptId:string;kind:'virtual-outward-feedback'}
/** One visual hit per supported cycle, exclusively inside a guided attempt's producer window. */
export class GuidedBagImpacts {
 private detector=new MovementCycleRecognizer();private active:{id:string;config:PrescribedAttemptConfig}|undefined;private emitted=new Set<string>();
 start(id:string,config:PrescribedAttemptConfig,history:readonly PoseFrame[]){
  this.stop();this.active={id,config};this.detector=new MovementCycleRecognizer({forwardMode:config.forwardMode,attemptDeadlineMs:config.endMs+250});
  // Reuse the actual pre-attempt guard history, without emitting any countdown hits.
  for(const frame of history.filter(f=>f.timestampMs<config.startMs))this.detector.update(frame);
 }
 receive(frame:PoseFrame):VirtualBagImpact[]{
  const active=this.active;if(!active||frame.timestampMs<active.config.startMs||frame.timestampMs>active.config.endMs)return [];
  this.detector.update(frame);
  return this.detector.supportedOutwardMovements().flatMap(cue=>{
   if(cue.departureMs<Math.max(0,active.config.startMs-(active.config.reactionToleranceMs??250))||frame.stance!==active.config.stance)return [];
   // Any supported jab/cross in the window may react; prescribed order is still evaluated separately.
   const id=JSON.stringify([active.id,cue.sessionId,cue.cameraConfigurationId,cue.hand,cue.departureMs]);
   if(this.emitted.has(id))return [];this.emitted.add(id);return [{...cue,id,attemptId:active.id,kind:'virtual-outward-feedback' as const}];
  });
 }
 stop(){this.active=undefined;this.emitted.clear();this.detector.reset();}
}
