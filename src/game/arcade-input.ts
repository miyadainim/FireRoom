import type {ForwardDepthMode} from '../vision/forward-depth';
import {isPoseFrame,type PoseFrame,type Hand} from '../shared/contracts';
import {ArcadeTechniqueEvidence,arcadePunchId} from './arcade-technique';
import type {ArcadeTechnique} from './arcade-combat-contracts';
import {MovementCycleRecognizer} from '../vision/movement-cycle';
import {assessBoundaryGuard} from '../vision/guard-boundaries';
import {assessGuardHeight,observeGuardHeight} from '../vision/guard-height';
export interface ArcadePunch {forwardDepth?:import('../vision/movement-cycle').LiveOutwardMovement['forwardDepth'];id:string;type:'jab'|'cross';hand:Hand;confidence:number;timestampMs:number}
export interface ArcadeInputState {techniques?:ArcadeTechnique[];handGuard?:Record<Hand,'raised'|'lowered'|'unknown'>;punches:ArcadePunch[];guard:'guard'|'open'|'unknown';tracking:'ready'|'unavailable';reason:string}
const unavailable=(reason:string):ArcadeInputState=>({handGuard:{left:'unknown',right:'unknown'},punches:[],guard:'unknown',tracking:'unavailable',reason});
/** Continuous gameplay observations, not recovered PunchEvents or technique verdicts.
 * Producer timestamps order motion; receiver arrival timestamps alone measure freshness.
 */
export class ArcadeInput {
 private technique=new ArcadeTechniqueEvidence();
 private detector:MovementCycleRecognizer;
 constructor(options:{forwardMode?:ForwardDepthMode}={}){this.detector=new MovementCycleRecognizer({rearmSettledGuard:true,forwardMode:options.forwardMode});}private frames:PoseFrame[]=[];private emitted=new Set<string>();
 private previous:PoseFrame|undefined;private arrival:number|undefined;private state:ArcadeInputState=unavailable('Waiting for phone tracking');
 private interrupt(reason:string){this.detector.reset();this.technique.interrupt();this.frames=[];this.state=unavailable(reason);return this.state;}
 reset(){this.technique.reset();this.previous=undefined;this.arrival=undefined;this.emitted.clear();this.interrupt('Waiting for fresh guard and phone tracking');this.technique.reset();}
 status(nowMs:number):ArcadeInputState {
  if(!Number.isFinite(nowMs)||this.arrival===undefined||nowMs<this.arrival||nowMs-this.arrival>350)return this.interrupt('Phone tracking stale; waiting for fresh observations');
  return {...this.state,punches:[]};
 }
 receive(frame:PoseFrame,arrivalMs:number):ArcadeInputState {
  const state=this.receiveFrame(frame,arrivalMs);return {...state,techniques:this.technique.drain()};
 }
 private receiveFrame(frame:PoseFrame,arrivalMs:number):ArcadeInputState {
  if(!isPoseFrame(frame)||!Number.isFinite(arrivalMs))return this.interrupt('Invalid tracking observation');
  const old=this.previous,changed=old&&(old.sessionId!==frame.sessionId||old.cameraConfigurationId!==frame.cameraConfigurationId||old.stance!==frame.stance);
  if(!changed&&old&&(frame.sequence<=old.sequence||frame.timestampMs<=old.timestampMs))return this.interrupt('Out-of-order tracking; fresh guard required');
  if(this.arrival!==undefined&&arrivalMs<this.arrival)return this.interrupt('Receiver clock moved backwards; fresh tracking required');
  if(changed||old&&frame.timestampMs-old.timestampMs>350||this.arrival!==undefined&&arrivalMs-this.arrival>350)this.interrupt('Tracking continuity changed; fresh guard required');
  this.previous=frame;this.arrival=arrivalMs;
  if(frame.tracking==='lost')return this.interrupt('Body not visible; step into the phone camera view');
  // The shared recognizer already invalidates each obscured wrist independently.
  // Feed it real observations before checking two-hand defense: an obscured rear
  // wrist must not erase supported lead-arm history (or vice versa).
  this.technique.observe(frame);
  this.technique.outcomes(this.detector.update(frame),frame.stance);
  this.technique.advance(frame.timestampMs);
  const required=[[0,'face'],[2,'left eye'],[5,'right eye'],[11,'left shoulder'],[12,'right shoulder'],[15,'left wrist'],[16,'right wrist']] as const;
  const unclear=required.filter(([i])=>frame.landmarks[i].visibility<.65).map(([,name])=>name);
  if(unclear.length){this.frames=[];this.state=unavailable(`${unclear.join(', ')} unclear; keep these in view`);return this.state;}
  this.frames.push(frame);this.frames=this.frames.filter(f=>f.timestampMs>=frame.timestampMs-500);
  const observations=[observeGuardHeight(frame,'left'),observeGuardHeight(frame,'right')];
  if(observations.some(o=>o.status==='unknown'))return this.interrupt('Guard geometry unavailable; adjust the camera');
  const boundary=assessBoundaryGuard(this.frames,Math.max(0,frame.timestampMs-500),frame.timestampMs,'start');
  const within=observations.every(o=>o.status==='within-region'&&o.eyeOffsetShoulderWidths!>=-.5);
  const guard:ArcadeInputState['guard']=within&&boundary.status==='supported'?'guard':'open';
  const punches=this.detector.supportedOutwardMovements().flatMap(cue=>{
   const id=arcadePunchId(cue.sessionId,cue.cameraConfigurationId,frame.stance,cue.hand,cue.departureMs);
   if(this.emitted.has(id))return [];this.emitted.add(id);this.technique.begin(id,cue);
   if(this.emitted.size>512)this.emitted.delete(this.emitted.values().next().value!);
   return [{...(cue.forwardDepth?{forwardDepth:cue.forwardDepth}:{}),id,type:cue.type,hand:cue.hand,confidence:cue.confidence,timestampMs:cue.observedAtMs}];
  });
  // Glove presentation is independent of blocking eligibility. A brief failure
  // to establish a two-hand hold must not depict both hands as physically down.
  const handGuard=Object.fromEntries((['left','right'] as const).map((hand,i)=>[hand,
   observations[i].status==='within-region'?'raised':assessGuardHeight(this.frames,hand).status==='deviation'?'lowered':'unknown'
  ])) as Record<Hand,'raised'|'lowered'|'unknown'>;
  this.state={handGuard,punches:[],guard,tracking:'ready',reason:guard==='guard'?'Recent two-hand guard observed':'Guard not established; hold both hands briefly to block'};
  return {...this.state,punches};
 }
}
