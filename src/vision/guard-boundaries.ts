import type {PoseFrame} from '../shared/contracts';
import {observeGuardHeight} from './guard-height';
export interface BoundaryGuardCheck {
 status:'supported'|'deviation'|'cannot-assess';reason:string;windowStartMs:number|null;windowEndMs:number|null;
 observedSamples:number;totalSamples:number;heldFromMs:number|null;heldUntilMs:number|null;
}
/** Image-plane two-hand guard check, independent of elbow geometry and punch completion. */
export function assessBoundaryGuard(frames:readonly PoseFrame[],startMs:number|null,endMs:number|null,phase:'start'|'end'):BoundaryGuardCheck {
 const result:BoundaryGuardCheck={status:'cannot-assess',reason:phase==='start'?'Movement onset unavailable; starting guard cannot be timed reliably':'Movement timing unavailable; finishing guard cannot be assessed',windowStartMs:startMs,windowEndMs:endMs,observedSamples:0,totalSamples:0,heldFromMs:null,heldUntilMs:null};
 if(startMs===null||endMs===null||endMs<startMs)return result;
 const selected=frames.filter(f=>f.timestampMs>=startMs&&f.timestampMs<=endMs);result.totalSamples=selected.length;
 let since:number|undefined,last:number|undefined,count=0,heldStart:number|null=null,heldEnd:number|null=null;
 for(const f of selected){
  const observations=[observeGuardHeight(f,'left'),observeGuardHeight(f,'right')];
  const known=observations.every(o=>o.status!=='unknown');if(known)result.observedSamples++;
  // Both wrists must occupy a bounded face region simultaneously, not merely be high.
  const within=known&&observations.every(o=>o.status==='within-region'&&o.eyeOffsetShoulderWidths!>=-.5);
  if(within){if(last===undefined||f.timestampMs-last>350||f.timestampMs<=last){since=f.timestampMs;count=0;}count++;last=f.timestampMs;
   if(count>=2&&f.timestampMs-since!>=100){heldStart=since!;heldEnd=f.timestampMs;}
  }else {since=undefined;last=undefined;count=0;}
 }
 if(phase==='start'&&heldEnd!==null&&endMs-heldEnd>350){result.reason='Guard was seen earlier, but observations immediately before movement are insufficient';return result;}
 if(heldStart!==null){result.status='supported';result.reason=phase==='start'?'Both hands held in observed guard before movement':'Both hands held in observed guard after movement';result.heldFromMs=heldStart;result.heldUntilMs=heldEnd;}
 else if(selected.length>=3&&result.observedSamples>=selected.length*.7){result.status='deviation';result.reason=phase==='start'?'Starting two-hand guard not confirmed before movement. Bring both hands into guard and hold briefly before punching.':'Finishing two-hand guard not confirmed. Bring both hands back to guard and hold briefly after the movement.';}
 else result.reason=phase==='start'?'Insufficient reliable observations to check both hands before movement':'Insufficient reliable observations to check both hands after movement';
 return result;
}
export interface GuardBoundaries {status:'supported'|'deviation'|'cannot-assess';starting:BoundaryGuardCheck;finishing:BoundaryGuardCheck;limitations:string[]}
export function assessGuardBoundaries(frames:readonly PoseFrame[],onsetMs:number|null,finishSearchMs:number|null,endMs:number):GuardBoundaries {
 const starting=assessBoundaryGuard(frames,onsetMs===null?null:Math.max(0,onsetMs-500),onsetMs,'start');
 const finishing=assessBoundaryGuard(frames,finishSearchMs,endMs,'end');
 return {status:starting.status==='supported'&&finishing.status==='supported'?'supported':starting.status==='deviation'||finishing.status==='deviation'?'deviation':'cannot-assess',starting,finishing,limitations:['Guard observations are image-plane wrist/eye positions, not proof of facial coverage or correct boxing form.','Both wrists must be no more than 0.5 shoulder widths below or 0.5 above their same-side eyes and within the existing broad lateral region, simultaneously for 100 ms. No elbow-angle requirement.','A finishing guard means an observed post-movement hold, not that guard was maintained until the recording ended. Physical accuracy NOT VERIFIED.']};
}
