import {isPoseFrame,type PoseFrame,type Hand} from '../shared/contracts';
import {selectedGeometry} from './geometry';

/** Conservative discontinuity screen, not a physical maximum speed or punch classifier.
 * Speed matches the movement-cycle's existing 15 shoulder-spans/s safeguard. Both
 * speed AND a half-span displacement are required so small high-rate jitter survives.
 */
export const LANDMARK_CONTINUITY_THRESHOLDS={visibility:.65,minShoulderWidth:.06,maxGapMs:350,minDisplacement:.5,maxSpeed:15} as const;
export interface LandmarkJump {landmark:'wrist'|'eye'|'nose';displacementShoulderWidths:number;speedShoulderWidthsPerSecond:number}
export interface HandContinuity {unreliable:boolean;reasons:string[];jumps:LandmarkJump[]}
export interface LandmarkContinuity {comparable:boolean;reason:string;left:HandContinuity;right:HandContinuity}
/** Stateless pairwise check; neither frame is changed. An uncomparable pair does
 * not establish continuity or a jump. Wrists/nose use shoulder-midpoint-relative
 * displacement; eyes use nose-relative displacement to tolerate coherent head
 * translation. Both frames use the PREVIOUS aspect-correct shoulder span as scale.
 * A nose jump makes both eye-based guard observations unreliable.
 */
export function assessLandmarkContinuity(previous:PoseFrame|undefined,current:PoseFrame):LandmarkContinuity {
 const fresh=():HandContinuity=>({unreliable:false,reasons:[],jumps:[]});
 const result:LandmarkContinuity={comparable:false,reason:'Comparable consecutive frames required',left:fresh(),right:fresh()};
 if(!previous||!isPoseFrame(previous)||!isPoseFrame(current)||previous.tracking==='lost'||current.tracking==='lost')return result;
 const dt=current.timestampMs-previous.timestampMs;
 if(dt<=0||dt>LANDMARK_CONTINUITY_THRESHOLDS.maxGapMs||current.sequence<=previous.sequence||current.sessionId!==previous.sessionId||current.stance!==previous.stance||current.cameraConfigurationId!==previous.cameraConfigurationId||current.imageSize?.width!==previous.imageSize?.width||current.imageSize?.height!==previous.imageSize?.height)return result;
 const a=selectedGeometry(previous,'image-2d')!,b=selectedGeometry(current,'image-2d')!;
 if([11,12].some(i=>Math.min(a[i].visibility,b[i].visibility)<LANDMARK_CONTINUITY_THRESHOLDS.visibility))return result;
 const span=Math.hypot(a[11].x-a[12].x,a[11].y-a[12].y);
 if(span<LANDMARK_CONTINUITY_THRESHOLDS.minShoulderWidth)return result;
 result.comparable=true;result.reason='Ordered frames share capture context';
 const center=(p:typeof a)=>({x:(p[11].x+p[12].x)/2,y:(p[11].y+p[12].y)/2});
 const ca=center(a),cb=center(b);
 const jump=(index:number,landmark:LandmarkJump['landmark'],relativeToNose=false):LandmarkJump|null=>{
  if([index,...relativeToNose?[0]:[]].some(i=>Math.min(a[i].visibility,b[i].visibility)<LANDMARK_CONTINUITY_THRESHOLDS.visibility))return null;
  const ra=relativeToNose?a[0]:ca,rb=relativeToNose?b[0]:cb;
  const displacement=Math.hypot((b[index].x-rb.x)-(a[index].x-ra.x),(b[index].y-rb.y)-(a[index].y-ra.y))/span;
  const speed=displacement*1000/dt;
  return displacement>=LANDMARK_CONTINUITY_THRESHOLDS.minDisplacement&&speed>LANDMARK_CONTINUITY_THRESHOLDS.maxSpeed?{landmark,displacementShoulderWidths:displacement,speedShoulderWidthsPerSecond:speed}:null;
 };
 const nose=jump(0,'nose');
 for(const hand of ['left','right'] as Hand[]){
  const h=result[hand];h.jumps=[jump(hand==='left'?15:16,'wrist'),jump(hand==='left'?2:5,'eye',true),nose].filter((v):v is LandmarkJump=>v!==null);
  h.unreliable=h.jumps.length>0;h.reasons=h.jumps.map(j=>`Implausible ${j.landmark} discontinuity: ${j.displacementShoulderWidths.toFixed(2)} shoulder widths at ${j.speedShoulderWidthsPerSecond.toFixed(1)} widths/s`);
 }
 return result;
}
