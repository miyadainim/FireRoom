import {isPoseFrame,type PoseFrame,type Hand} from '../shared/contracts';
import {GuardEstimator,GUARD_THRESHOLDS} from './guard';
import {selectedGeometry} from './geometry';
// Readiness/low-start interpretation retains its prior threshold; guard grading is independently configurable.
const READINESS_HEIGHT=.5;
export interface InitialReadiness {
 status:'supported'|'deviation'|'cannot-assess';reason:string;hand:Hand;onsetMs:number|null;guardBeforeOnsetMs:number|null;lateGuardMs:number|null;
 evidence:{baselineMs:number|null;baselineEyeOffset:number|null;excursionStartMs:number|null;excursionDurationMs:number;samples:{timestampMs:number;reliable:boolean;eyeOffsetShoulderWidths:number|null;guard:'guard'|'not-guard'|'unknown'}[]};limitations:string[];
}
type Observation={time:number;x:number;y:number;eyeOffset:number};
const distance=(a:Observation,b:Observation)=>Math.hypot(a.x-b.x,a.y-b.y);
/** Conservative failed-attempt diagnostic, not punch classification. A lift merely into guard is not a deviation. */
export function assessPreMovementGuard(frames:readonly PoseFrame[],config:{hand:Hand;startMs:number;endMs:number}):InitialReadiness {
 const result:InitialReadiness={status:'cannot-assess',reason:'No clear pre-guard excursion established; lifting the hands into guard alone is not a punch attempt',hand:config.hand,onsetMs:null,guardBeforeOnsetMs:null,lateGuardMs:null,evidence:{baselineMs:null,baselineEyeOffset:null,excursionStartMs:null,excursionDurationMs:0,samples:[]},limitations:['This diagnostic observes image-plane movement, not punch identity or physical intent.','Perspective and camera movement can change projected hand height; physical form accuracy NOT VERIFIED.']};
 if(!Number.isFinite(config.startMs)||!Number.isFinite(config.endMs)||config.endMs<=config.startMs||frames.some(f=>!isPoseFrame(f)))return result;
 const selected=frames.filter(f=>f.timestampMs>=Math.max(0,config.startMs-500)&&f.timestampMs<=config.endMs);
 if(selected.length<3)return result;
 const guard=new GuardEstimator('image-2d'),context=selected[0],wi=config.hand==='left'?15:16,si=config.hand==='left'?11:12,eye=config.hand==='left'?2:5;
 let history:Observation[]=[],baseline:Observation|undefined,candidate:Observation|undefined,onset:number|undefined,lastGuard:number|undefined,excursionStart:number|undefined;
 let previous:PoseFrame|undefined,previousGeometry:{width:number;angle:number}|undefined,invalidContext=false,sceneJump=false;
 const resetObservation=()=>{history=[];baseline=undefined;candidate=undefined;onset=undefined;lastGuard=undefined;excursionStart=undefined;if(result.status!=='deviation'){result.status='cannot-assess';result.onsetMs=null;result.guardBeforeOnsetMs=null;result.lateGuardMs=null;result.evidence.baselineMs=null;result.evidence.baselineEyeOffset=null;}};
 for(const frame of selected){
  if(frame.sessionId!==context.sessionId||frame.stance!==context.stance||frame.cameraConfigurationId!==context.cameraConfigurationId||(previous&&(frame.timestampMs<=previous.timestampMs||frame.sequence<=previous.sequence))){invalidContext=true;break;}
  const gap=previous?frame.timestampMs-previous.timestampMs:0;previous=frame;
  const g=guard.update(frame)[config.hand];
  const points=selectedGeometry(frame,'image-2d');
  const reliable=gap<=350&&frame.tracking!=='lost'&&!!points&&[0,eye,wi,11,12].every(i=>points[i]?.visibility>=.65);
  const width=reliable?Math.hypot(points![11].x-points![12].x,points![11].y-points![12].y):0;
  if(!reliable||width<.06){result.evidence.samples.push({timestampMs:frame.timestampMs,reliable:false,eyeOffsetShoulderWidths:null,guard:'unknown'});resetObservation();previousGeometry=undefined;continue;}
  const angle=Math.atan2(points![12].y-points![11].y,points![12].x-points![11].x);
  if(previousGeometry&&(Math.abs(width/previousGeometry.width-1)>.25||Math.abs(Math.atan2(Math.sin(angle-previousGeometry.angle),Math.cos(angle-previousGeometry.angle)))>.3)){sceneJump=true;resetObservation();}
  previousGeometry={width,angle};
  const o:Observation={time:frame.timestampMs,x:(points![wi].x-points![si].x)/width,y:(points![wi].y-points![si].y)/width,eyeOffset:(points![wi].y-points![eye].y)/width};
  result.evidence.samples.push({timestampMs:o.time,reliable:true,eyeOffsetShoulderWidths:o.eyeOffset,guard:g.status});
  const ready=g.status==='guard'&&o.eyeOffset<=READINESS_HEIGHT;
  if(ready){
   if(result.onsetMs!==null&&o.time>result.onsetMs)result.lateGuardMs??=o.time;
   lastGuard=o.time;
   // Acquisition that reaches guard before any established excursion is not evidence
   // against readiness. Subsequent movement needs its own stable guard reference.
   if(result.status!=='deviation'&&onset!==undefined){history=[];baseline=undefined;candidate=undefined;onset=undefined;excursionStart=undefined;}
  }else if(o.eyeOffset>READINESS_HEIGHT)lastGuard=undefined;
  if(result.status==='deviation')continue;
  if(!baseline){
   history=[...history,o].filter(v=>o.time-v.time<=400);
   while(history.length>1&&!history.every(v=>history.every(w=>distance(v,w)<=.04)))history.shift();
   if(history.length>=2&&o.time-history[0].time>=GUARD_THRESHOLDS.minStableMs&&history.every(v=>history.every(w=>distance(v,w)<=.04))){baseline={...o,x:history.reduce((sum,v)=>sum+v.x,0)/history.length,y:history.reduce((sum,v)=>sum+v.y,0)/history.length,eyeOffset:history.reduce((sum,v)=>sum+v.eyeOffset,0)/history.length};}
   continue;
  }
  const displacement=distance(o,baseline);
  if(onset===undefined){
   if(displacement>=.22){
    if(candidate&&o.time-candidate.time>=75&&(candidate.x-baseline.x)*(o.x-baseline.x)+(candidate.y-baseline.y)*(o.y-baseline.y)>0){
     onset=candidate.time;result.onsetMs=onset;result.evidence.baselineMs=baseline.time;result.evidence.baselineEyeOffset=baseline.eyeOffset;
     if(lastGuard!==undefined&&lastGuard<=onset&&onset-lastGuard<=350){result.status='supported';result.reason='Stable guard observed before this movement onset';result.guardBeforeOnsetMs=lastGuard;}
    }else candidate??=o;
   }else candidate=undefined;
  }
  if(onset!==undefined&&baseline.eyeOffset>READINESS_HEIGHT&&o.eyeOffset< -READINESS_HEIGHT&&result.guardBeforeOnsetMs===null){
   excursionStart??=o.time;
   if(o.time-excursionStart>=180){result.status='deviation';result.reason='Starting guard not observed before the movement. Bring your hands into guard and hold briefly before punching.';result.evidence.excursionStartMs=excursionStart;result.evidence.excursionDurationMs=o.time-excursionStart;}
  }else excursionStart=undefined;
 }
 if(invalidContext||sceneJump){result.status='cannot-assess';result.reason='Context or material frame geometry changed; pre-movement readiness cannot be established';result.guardBeforeOnsetMs=null;}
 return result;
}
