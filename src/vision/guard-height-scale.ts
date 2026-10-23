import {GuardEstimator} from './guard';
import {isPoseFrame,type PoseFrame} from '../shared/contracts';
import {selectedGeometry} from './geometry';
/** Guard-height normalisation only; never used by punch trajectory or lateral checks. */
export const GUARD_SCALE_THRESHOLDS={visibility:.65,minWidth:.06,holdMs:300,maxGapMs:350,maxWidthSpread:.10,maxFaceSpread:.22,blend:.2} as const;
type Sample={time:number;width:number;face:{x:number;y:number}[]};
const median=(v:number[])=>{const a=[...v].sort((a,b)=>a-b);return (a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2;};
export class GuardHeightScale {
 private guard=new GuardEstimator('image-2d');private referenceFaceSpan:number|undefined;private reliableAt:number|undefined;
 private previous?:PoseFrame;private hold:Sample[]=[];private reference:number|undefined;
 reset(){this.previous=undefined;this.hold=[];this.reference=undefined;this.referenceFaceSpan=undefined;this.reliableAt=undefined;this.guard.reset();}
 update(frame:PoseFrame):number|undefined {
  const old=this.previous;
  if(!isPoseFrame(frame)){this.reset();return undefined;}
  if(old&&(frame.sessionId!==old.sessionId||frame.cameraConfigurationId!==old.cameraConfigurationId||frame.stance!==old.stance||frame.imageSize?.width!==old.imageSize?.width||frame.imageSize?.height!==old.imageSize?.height||frame.sequence<=old.sequence||frame.timestampMs<=old.timestampMs||frame.timestampMs-old.timestampMs>GUARD_SCALE_THRESHOLDS.maxGapMs))this.reset();
  this.previous=frame;
  if(frame.tracking==='lost'){this.reset();return undefined;}
  const p=selectedGeometry(frame,'image-2d')!;
  if([0,2,5,11,12,15,16].some(i=>p[i].visibility<.65)){this.hold=[];if(this.reliableAt!==undefined&&frame.timestampMs-this.reliableAt>350)this.reset();return this.reference;}
  const width=Math.hypot(p[11].x-p[12].x,p[11].y-p[12].y);
  if(width<.06){this.reset();return undefined;}
  this.reliableAt=frame.timestampMs;
  const faceSpan=Math.hypot(p[0].x-(p[11].x+p[12].x)/2,p[0].y-(p[11].y+p[12].y)/2);
  if(this.reference!==undefined&&this.referenceFaceSpan!==undefined){const a=width/this.reference,b=faceSpan/this.referenceFaceSpan;if(Math.abs(a-1)>.25&&Math.abs(b-1)>.25&&(a-1)*(b-1)>0){this.reference=undefined;this.referenceFaceSpan=undefined;this.hold=[];this.guard.reset();}}
  const guard=this.guard.update(frame);
  const potential=(['left','right'] as const).every(hand=>guard[hand].status==='guard'||guard[hand].reason.startsWith('Hold bent hand near face to establish guard'));
  if(!potential){this.hold=[];return this.reference;}
  const scale=this.reference??width;
  const face=[[15,2],[16,5]].map(([w,e])=>({x:(p[w].x-p[e].x)/width,y:(p[w].y-p[e].y)/scale}));
  // Learn only from stable face-local bent-arm holds. Callers supply pre-punch history and freeze the returned reference during the outward phase.
  if(face.some(v=>Math.abs(v.y)>.5||Math.abs(v.x)>.75)){this.hold=[];return this.reference;}
  const sample={time:frame.timestampMs,width,face};this.hold.push(sample);
  while(this.hold.length>1&&(!this.hold.every(s=>Math.abs(s.width/median(this.hold.map(v=>v.width))-1)<=.10)||!this.hold.every(a=>this.hold.every(b=>a.face.every((v,i)=>Math.hypot(v.x-b.face[i].x,v.y-b.face[i].y)<=.22)))))this.hold.shift();
  if(this.hold.length>=3&&frame.timestampMs-this.hold[0].time>=300&&guard.left.status==='guard'&&guard.right.status==='guard'){const measured=median(this.hold.map(s=>s.width));this.reference=this.reference===undefined?measured:this.reference*.8+measured*.2;this.referenceFaceSpan=faceSpan;this.hold=[];}
  return this.reference;
 }
}
/** Freeze the last reliable guard reference before an outward phase. */
export function guardHeightReference(frames:readonly PoseFrame[]):number|undefined {const scale=new GuardHeightScale();let width:number|undefined;for(const frame of frames)width=scale.update(frame);return width;}
