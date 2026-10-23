import { selectedGeometry } from './geometry';
import {GuardEstimator,type GuardEvidence} from './guard';
import { isPoseFrame, type GeometryMode, type Hand, type PoseFrame, type PunchEvent } from '../shared/contracts';
const hands:Hand[]=['left','right'];
const ids={left:[11,13,15],right:[12,14,16]} as const;
type Point={x:number;y:number;z:number};
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const relative=(w:Point,s:Point,width:number):Point=>({x:(w.x-s.x)/width,y:(w.y-s.y)/width,z:(w.z-s.z)/width});
export interface ExtensionChecks {armed:boolean;notGuard:boolean;height:boolean;extension:boolean;travel:boolean}
export interface ArmDiagnostic {extensionChecks:ExtensionChecks;phase:string;extension:number;travel:number;guard:boolean;confidence:number;elbowAngle:number;speed:number;reason:string;guardStatus:GuardEvidence['status'];faceDistance:number|null;depthOffset:number|null;stableMs:number}
interface ArmState {phase:'idle'|'guard'|'extended'|'recovered';started:number;peak:number;confidence:number;guardMaintained:boolean;origin?:Point;cooldownUntil:number}
const fresh=():ArmState=>({phase:'idle',started:0,peak:0,confidence:1,guardMaintained:true,cooldownUntil:0});
interface Pending {hand:Hand;event?:Omit<PunchEvent,'sequence'|'timestampMs'>}
/** Original deterministic rules. Geometry/speed are pose-estimate diagnostics, not physical units.
 * Order follows observed extension onset; recovery can arrive in either order. */
export class PunchRecognizer {
 private arms={left:fresh(),right:fresh()};
 private pending:Pending[]=[];
 private guardEstimator:GuardEstimator;
 constructor(readonly geometryMode:GeometryMode='image-3d'){this.guardEstimator=new GuardEstimator(geometryMode);}
 private get minSpan(){return this.geometryMode==='world-3d'?1e-4:0.06;}
 private previous?:PoseFrame;
 private sequence=0;
 private diagnostic:{geometryMode?:GeometryMode;reason:string;arms:Record<Hand,ArmDiagnostic>|null}={reason:'Waiting for pose',arms:null};
 diagnostics(){return structuredClone({...this.diagnostic,geometryMode:this.geometryMode});}
 private clearCycles(){this.guardEstimator.reset();this.arms={left:fresh(),right:fresh()};this.pending=[];}
 reset(){this.clearCycles();this.previous=undefined;this.sequence=0;this.diagnostic={reason:'Waiting for pose',arms:null};}
 update(frame:PoseFrame):PunchEvent[]{
  if(!isPoseFrame(frame)){this.reset();this.diagnostic.reason='Invalid pose frame';return [];}
  const old=this.previous;let resetReason='';
  if(old&&old.sessionId===frame.sessionId&&(frame.sequence<=old.sequence||frame.timestampMs<=old.timestampMs)){this.clearCycles();this.diagnostic={reason:'Out-of-order frame; recognition reset',arms:null};return [];}
  if(old&&(old.sessionId!==frame.sessionId||old.stance!==frame.stance||frame.timestampMs-old.timestampMs>350)){resetReason=old.sessionId!==frame.sessionId?'Session changed':old.stance!==frame.stance?'Stance changed':'Frame gap >350ms';this.clearCycles();}
  this.previous=frame;
  if(frame.tracking!=='tracked'||[11,12,13,14,15,16].some(i=>!frame.landmarks[i]||frame.landmarks[i].visibility<0.65)){
   this.clearCycles();this.diagnostic={reason:`Tracking ${frame.tracking}: both shoulders, elbows and wrists need visibility ≥0.65`,arms:null};return [];
  }
  const geometry=selectedGeometry(frame,this.geometryMode);
  if(!geometry){this.clearCycles();this.diagnostic={reason:'World landmarks unavailable; no image fallback',arms:null};return [];}
  if([11,12,13,14,15,16].some(i=>geometry[i].visibility<0.65)){this.clearCycles();this.diagnostic={reason:'Selected geometry landmarks obscured',arms:null};return [];}
  const width=distance(geometry[11],geometry[12]);
  if(width<this.minSpan){this.clearCycles();this.diagnostic={reason:'Shoulder span too small or obscured',arms:null};return [];}
  const guardEvidence=this.guardEstimator.update(frame);
  if(hands.some(h=>guardEvidence[h].status==='unknown')){const reason=hands.map(h=>`${h}: ${guardEvidence[h].reason}`).join('; ');this.clearCycles();this.diagnostic={reason:`Guard observation unavailable: ${reason}`,arms:null};return [];}
  const measures=Object.fromEntries(hands.map(hand=>{
   const [s,e,w]=ids[hand].map(i=>geometry[i]);const upper=distance(s,e),lower=distance(e,w),reach=distance(s,w),length=upper+lower;
   const position=relative(w,s,width);
   const cosine=upper*lower>0?(upper*upper+lower*lower-reach*reach)/(2*upper*lower):1;
   let speed=0;
   const previousGeometry=old?selectedGeometry(old,this.geometryMode):null;
   if(!resetReason&&old&&old.tracking==='tracked'&&previousGeometry&&previousGeometry.length>16){const [si,,wi]=ids[hand],oldWidth=distance(previousGeometry[11],previousGeometry[12]);if(oldWidth>=this.minSpan)speed=distance(position,relative(previousGeometry[wi],previousGeometry[si],oldWidth))*1000/(frame.timestampMs-old.timestampMs);}
   return [hand,{position,extension:length>0?reach/length:0,guard:guardEvidence[hand].status==='guard',confidence:Math.min(s.visibility,e.visibility,w.visibility,guardEvidence[hand].confidence),elbowAngle:Math.acos(Math.max(-1,Math.min(1,cosine)))*180/Math.PI,speed}];
  })) as Record<Hand,{position:Point;extension:number;guard:boolean;confidence:number;elbowAngle:number;speed:number}>;
  // Losing an earlier onset invalidates the whole unresolved sequence, including buffered recoveries.
  if(hands.some(h=>this.arms[h].phase==='extended'&&frame.timestampMs-this.arms[h].started>1800)){
   this.clearCycles();for(const hand of hands)measures[hand].guard=false;resetReason='Extension timed out; unresolved sequence discarded';
  }
  // Expose the same predicates used by detection; never silently weaken a gate for a recording.
  const extensionChecks=Object.fromEntries(hands.map(hand=>{const a=this.arms[hand],m=measures[hand];return [hand,{armed:a.phase==='guard',notGuard:!m.guard,height:m.position.y<=0.25,extension:m.extension>0.92,travel:!!a.origin&&distance(m.position,a.origin)>0.45}];})) as Record<Hand,ExtensionChecks>;
  const extending=hands.filter(h=>Object.values(extensionChecks[h]).every(Boolean));
  const ambiguous=extending.length===2;
  if(ambiguous){this.clearCycles();resetReason='Ambiguous simultaneous extension; return both hands to guard';}
  for(const hand of hands){
   const m=measures[hand],other=measures[hand==='left'?'right':'left'];const a=this.arms[hand];
   if(ambiguous)continue;
   if(a.phase==='idle'){if(m.guard&&frame.timestampMs>=a.cooldownUntil){a.phase='guard';a.started=frame.timestampMs;a.origin={...m.position};}continue;}
   a.confidence=Math.min(a.confidence,m.confidence);a.guardMaintained&&=other.guard;
   if(a.phase==='guard'){
    if(extending.includes(hand)){a.phase='extended';a.started=frame.timestampMs;a.peak=m.extension;this.pending.push({hand});}
    else if(m.guard){a.origin={...m.position};a.started=frame.timestampMs;}
    else if(frame.timestampMs-a.started>1800)this.arms[hand]=fresh();
   }else if(a.phase==='extended'){
    a.peak=Math.max(a.peak,m.extension);
    // Extension/recovery hysteresis prevents jitter near the straight-arm boundary.
    if(m.guard&&m.extension<0.88&&frame.timestampMs-a.started>=60){
     const pending=this.pending.find(p=>p.hand===hand);
     if(pending)pending.event={schemaVersion:1,sessionId:frame.sessionId,type:hand===(frame.stance==='orthodox'?'left':'right')?'jab':'cross',hand,confidence:a.confidence,extension:a.peak,guardMaintained:a.guardMaintained,phase:'recovered'};
     a.phase='recovered';
    }
   }
  }
  const events:PunchEvent[]=[];
  while(this.pending[0]?.event){const p=this.pending.shift()!;events.push({...p.event!,sequence:this.sequence++,timestampMs:frame.timestampMs});this.arms[p.hand]={...fresh(),cooldownUntil:frame.timestampMs+80};}
  this.diagnostic={reason:resetReason?`${resetReason}; recognition reset`:events.length?events.map(e=>`${e.hand} ${e.type} recovered`).join(', '):this.pending.some(p=>p.event)?'Recovery buffered; waiting for earlier punch recovery':'Waiting for guard → extension → recovery',arms:Object.fromEntries(hands.map(hand=>{const m=measures[hand],a=this.arms[hand];return [hand,{extensionChecks:extensionChecks[hand],phase:a.phase,extension:m.extension,travel:a.origin?distance(m.position,a.origin):0,guard:m.guard,confidence:m.confidence,elbowAngle:m.elbowAngle,speed:m.speed,guardStatus:guardEvidence[hand].status,faceDistance:guardEvidence[hand].faceDistance,depthOffset:guardEvidence[hand].depthOffset,stableMs:guardEvidence[hand].stableMs,reason:a.phase==='recovered'?'Waiting for earlier onset':!m.guard&&a.phase==='idle'?guardEvidence[hand].reason:a.phase==='guard'?`Extension checks: ${extensionChecks[hand].notGuard?'outside guard':'still guard'}; ${extensionChecks[hand].height?'height passes':'wrist below allowed shoulder height'}; ${extensionChecks[hand].extension?'straightness passes':`straightness ${m.extension.toFixed(3)} ≤0.92`}; ${extensionChecks[hand].travel?'travel passes':`travel ${(a.origin?distance(m.position,a.origin):0).toFixed(3)} ≤0.45`}`:a.phase==='extended'?`Return near face with bent elbow and a stable hold: ${guardEvidence[hand].reason}`:'Fresh guard required'}];})) as Record<Hand,ArmDiagnostic>};
  return events;
 }
}
