import type {ForwardDepthMode} from './forward-depth';
import {assessGuardBoundaries,type GuardBoundaries} from './guard-boundaries';
import {isPoseFrame,type PoseFrame,type Hand,type Stance} from '../shared/contracts';
import {GuardEstimator} from './guard';
import {assessPreMovementGuard,type InitialReadiness} from './pre-movement-guard';
import {assessGuardHeight,type GuardHeightAssessment} from './guard-height';
import {MovementCycleRecognizer,assessMovementExtension,type MovementCycleOutcome,type ValidatedExtensionReference} from './movement-cycle';
import {selectedGeometry} from './geometry';
export interface PrescribedAttemptConfig {
 forwardMode?:ForwardDepthMode;expected:'jab'|'cross'|'jab-cross';stance:Stance;startMs:number;endMs:number;
 /** Producer/video milliseconds, never wall-clock time. Bounded to 0–500 ms. */
 reactionToleranceMs?:number;recoveryToleranceMs?:number;
 extensionReferences?:Partial<Record<Hand,ValidatedExtensionReference>>;
}
export interface PrescribedFeatureCheck {status:'supported'|'deviation'|'cannot-assess';reason:string;observedSamples:number;totalSamples:number;timestampsMs:number[];observedDurationMs?:number}
export interface PrescribedPunchAssessment {
 cycle:MovementCycleOutcome;movementObserved:boolean;recoveryConfirmed:boolean;initialGuard:PrescribedFeatureCheck;oppositeGuard:GuardHeightAssessment;recovery:PrescribedFeatureCheck;returnToOrigin:PrescribedFeatureCheck;recoveryDurationMs:number|null;
 extension:ReturnType<typeof assessMovementExtension>;
}
export interface PrescribedAttemptReport {
 schemaVersion:1;assessmentVersion:'prescribed-observation-v8';expected:PrescribedAttemptConfig['expected'];status:'completed'|'rejected'|'uncertain';
 /** Completed requires matched outward phases plus timestamp-supported wrist returns; never verified boxing form. */
 /** Outward movement hand/order/count, independent of confirmed recovery. */
 movementSequenceMatched:boolean;recoveryStatus:'confirmed'|'cannot-assess'|'not-applicable';initialReadiness?:InitialReadiness;guardBoundaries?:GuardBoundaries;formStatus:'NOT VERIFIED';reasons:string[];punches:PrescribedPunchAssessment[];outcomes:MovementCycleOutcome[];
 window:{startMs:number;endMs:number;reactionToleranceMs:number;recoveryToleranceMs:number};limitations:string[];
}
const feature=(status:PrescribedFeatureCheck['status'],reason:string,totalSamples:number,timestampsMs:number[]):PrescribedFeatureCheck=>({status,reason,totalSamples,observedSamples:timestampsMs.length,timestampsMs});
/** Offline bounded, prescribed-sequence evaluator. Raw frames are never changed and no calibration is required. */
export function evaluatePrescribedAttempt(frames:readonly PoseFrame[],config:PrescribedAttemptConfig):PrescribedAttemptReport {
 const reaction=config.reactionToleranceMs??250,recovery=config.recoveryToleranceMs??250;
 const report:PrescribedAttemptReport={schemaVersion:1,assessmentVersion:'prescribed-observation-v8',expected:config.expected,status:'uncertain',movementSequenceMatched:false,recoveryStatus:'not-applicable',formStatus:'NOT VERIFIED',reasons:[],punches:[],outcomes:[],window:{startMs:config.startMs,endMs:config.endMs,reactionToleranceMs:reaction,recoveryToleranceMs:recovery},limitations:['Prescribed movement compatibility is not unrestricted punch classification or proof of correct form.','A deliberate reach-and-return or feint may be indistinguishable from a punch using wrist motion alone.','Image-plane geometry cannot establish physical extension, force or depth accuracy.','Physical coaching accuracy NOT VERIFIED.']};
 const uncertain=(reason:string)=>{report.reasons.push(reason);return report;};
 if(!['jab','cross','jab-cross'].includes(config.expected)||!['orthodox','southpaw'].includes(config.stance)||![config.startMs,config.endMs,reaction,recovery].every(Number.isFinite)||config.startMs<0||config.endMs<=config.startMs||config.endMs-config.startMs>30000||reaction<0||reaction>500||recovery<0||recovery>500)return uncertain('Invalid bounded attempt configuration');
 if(frames.some(f=>!isPoseFrame(f)))return uncertain('Invalid pose observation');
 const selected=frames.filter(f=>f.timestampMs>=Math.max(0,config.startMs-500)&&f.timestampMs<=config.endMs+recovery);
 if(selected.length<3)return uncertain('Insufficient observations in bounded attempt');
 const context=selected[0];
 if(selected.some((f,i)=>f.sessionId!==context.sessionId||f.stance!==config.stance||f.cameraConfigurationId!==context.cameraConfigurationId||(i>0&&(f.timestampMs<=selected[i-1].timestampMs||f.sequence<=selected[i-1].sequence))))return uncertain('Context, stance or timestamp ordering changed within attempt');
 const detector=new MovementCycleRecognizer({settledFaceGuard:true,forwardMode:config.forwardMode,attemptDeadlineMs:config.endMs+recovery}),guards=new GuardEstimator('image-2d');
 const guardTrace=selected.map(frame=>{report.outcomes.push(...detector.update(frame));return {frame,guard:guards.update(frame)};});
 report.outcomes.push(...detector.flush(selected[selected.length-1].timestampMs));
 const eligible=report.outcomes.filter(o=>o.timestamps.departureMs>=config.startMs-reaction&&o.timestamps.departureMs<=config.endMs&&o.timestamps.endMs<=config.endMs+recovery).sort((a,b)=>a.timestamps.departureMs-b.timestamps.departureMs);
 const observed=eligible.filter(o=>o.evidence.movementObservation?.status==='supported');
 const expected=config.expected==='jab-cross'?['jab','cross']:[config.expected];
 const matching=observed.length===expected.length&&observed.every((o,i)=>o.type===expected[i]);
 const recoveriesConfirmed=matching&&observed.every(o=>o.classification==='completed'&&o.timestamps.recoveryMs!==null&&o.evidence.returnedToGuard);
 const firstExpectedHand:Hand=config.expected==='cross'?(config.stance==='orthodox'?'right':'left'):(config.stance==='orthodox'?'left':'right');
 if(!matching)report.initialReadiness=assessPreMovementGuard(selected,{hand:firstExpectedHand,startMs:config.startMs,endMs:config.endMs});
 const onset=matching?observed[0].evidence.movementObservation!.departureMs!:eligible[0]?.timestamps.departureMs??report.initialReadiness?.onsetMs??null;
 const lastCycle=matching?observed[observed.length-1]:eligible.reduce<MovementCycleOutcome|undefined>((last,o)=>!last||o.timestamps.endMs>last.timestamps.endMs?o:last,undefined);
 const finishSearch=lastCycle?(lastCycle.timestamps.recoveryMs??lastCycle.timestamps.endMs):report.initialReadiness?.lateGuardMs??null;
 report.guardBoundaries=assessGuardBoundaries(selected,onset,finishSearch,config.endMs+recovery);
 if(!recoveriesConfirmed){report.guardBoundaries.finishing.reason+=' This is a later guard observation only; movement/sequence completion remains unconfirmed.';}
 for(const cycle of observed){
  const initial=guardTrace.filter(t=>t.frame.timestampMs>=cycle.timestamps.guardMs-150&&t.frame.timestampMs<=cycle.timestamps.departureMs);
  const guardTimes=initial.filter(t=>t.guard[cycle.hand].status==='guard').map(t=>t.frame.timestampMs);
  const opposite:Hand=cycle.hand==='left'?'right':'left';
  const movement=cycle.evidence.movementObservation!;
  const phaseStart=movement.departureMs??cycle.timestamps.departureMs,phasePeak=movement.peakMs??cycle.timestamps.peakMs;
  const postDropEnd=movement.outwardEndMs??cycle.evidence.postDropTrajectory?.outwardEndMs;
  const outwardEnd=postDropEnd!==undefined&&postDropEnd!==null&&postDropEnd>=phasePeak&&postDropEnd<=(cycle.timestamps.recoveryMs??cycle.timestamps.endMs)?postDropEnd:phasePeak;
  const outward=guardTrace.filter(t=>t.frame.timestampMs>=phaseStart&&t.frame.timestampMs<=outwardEnd);
  const oppositeCheck=assessGuardHeight(outward.map(t=>t.frame),opposite,initial.map(t=>t.frame),selected.filter(f=>f.timestampMs<=phaseStart));
  const recovered=guardTrace.filter(t=>cycle.timestamps.recoveryMs!==null&&t.frame.timestampMs>=cycle.timestamps.recoveryMs&&t.frame.timestampMs<=cycle.timestamps.endMs+250);
  const recoveredGuard=recovered.filter(t=>t.guard[cycle.hand].status==='guard').map(t=>t.frame.timestampMs);

  const p=selected.reduce((best,f)=>Math.abs(f.timestampMs-phasePeak)<Math.abs(best.timestampMs-phasePeak)?f:best,selected[0]);
  const geometry=selectedGeometry(p,'image-2d'),si=cycle.hand==='left'?11:12,wi=cycle.hand==='left'?15:16;
  const width=geometry?.length===33?Math.hypot(geometry[11].x-geometry[12].x,geometry[11].y-geometry[12].y):0;
  const reliable=!!geometry&&width>=.06&&[11,12,wi].every(i=>geometry[i].visibility>=.65)&&!cycle.evidence.viewpointUncertain;
  const reach=reliable?Math.hypot(geometry![wi].x-geometry![si].x,geometry![wi].y-geometry![si].y)/width:undefined;
  report.punches.push({cycle,movementObserved:true,recoveryConfirmed:cycle.classification==='completed'&&cycle.timestamps.recoveryMs!==null&&cycle.evidence.returnedToGuard,initialGuard:cycle.evidence.startedFromLoweredPosition?feature('deviation','Movement started from a lowered hand; fresh starting guard was not observed before departure',initial.length,[]):feature(guardTimes.length?'supported':'cannot-assess',guardTimes.length?'Initial stable guard observed':'Initial guard unavailable for independent assessment',initial.length,guardTimes),oppositeGuard:oppositeCheck,recovery:feature(recoveredGuard.length?'supported':'cannot-assess',recoveredGuard.length?'Stable guard independently observed after wrist return':'Wrist return alone does not establish recovered guard; reliable held guard unavailable',recovered.length,recoveredGuard),recoveryDurationMs:cycle.timestamps.recoveryMs===null?null:cycle.timestamps.recoveryMs-phasePeak,returnToOrigin:feature(cycle.timestamps.recoveryMs!==null&&cycle.evidence.returnedToGuard?'supported':'cannot-assess',cycle.evidence.startedFromLoweredPosition?'Wrist reached the observed guard region after a low-start movement; this does not establish recovery form':'Wrist returned to original guard region; this does not establish recovery form',1,cycle.timestamps.recoveryMs===null?[]:[cycle.timestamps.recoveryMs]),extension:assessMovementExtension({hand:cycle.hand,cameraConfigurationId:p.cameraConfigurationId,reach,reliable},config.extensionReferences?.[cycle.hand])});
 }
 if(!matching){
  const definiteMismatch=observed.length>expected.length||observed.some((o,i)=>o.type!==expected[i]);
  if(definiteMismatch){report.status='rejected';report.reasons.push('Observed movement count, anatomical hand or sequence order does not match prescription');return report;}
  const movementUnknown=eligible.some(o=>o.classification==='uncertain'||((o.classification==='completed'||o.classification==='partial')&&o.evidence.movementObservation?.status!=='supported'));
  const requiredVisibility=selected.filter(f=>f.timestampMs>=config.startMs&&f.timestampMs<=config.endMs);
  if(requiredVisibility.length<3)return uncertain('Insufficient observations inside prescribed window');
  const good=requiredVisibility.filter(f=>f.tracking!=='lost'&&[0,11,12,15,16].every(i=>f.landmarks[i]?.visibility>=.65));
  const expectedHands:Hand[]=expected.map(type=>type==='jab'?(config.stance==='orthodox'?'left':'right'):(config.stance==='orthodox'?'right':'left'));
  const guardUnavailable=expectedHands.some(hand=>guardTrace.filter(t=>t.frame.timestampMs>=config.startMs&&t.frame.timestampMs<=config.endMs&&t.guard[hand].status!=='unknown').length<requiredVisibility.length*.7);
  const loweringReasons=new Set(['Sustained downward hand movement; punch intent uncertain, fresh guard required','Wrist remained below supported punch region; hand lowering is not a verified punch attempt']);
  const unknownMovements=eligible.filter(o=>o.classification==='uncertain');
  const observedLoweringWithoutReturn=unknownMovements.length>0&&unknownMovements.every(o=>loweringReasons.has(o.evidence.reason))&&unknownMovements.some(o=>expectedHands.includes(o.hand)&&o.timestamps.recoveryMs===null&&o.evidence.outwardSamples>=2&&o.evidence.peakDepartureShoulderSpans>=.35);
  if(!guardUnavailable&&good.length>=requiredVisibility.length*.7&&observedLoweringWithoutReturn)return uncertain('Outward movement observed, but return to guard was not confirmed. Bring your punching hand back to guard after the movement.');
  if(!guardUnavailable&&good.length>=requiredVisibility.length*.7&&unknownMovements.some(o=>o.evidence.postDropTrajectory))return uncertain('Motion after lowering could not be distinguished reliably between guard restoration and an outward attempt. Individual supported movement and guard findings are shown separately.');
  if(movementUnknown||guardUnavailable||good.length<requiredVisibility.length*.7)return uncertain('Tracking or viewpoint uncertainty prevents a completion decision');
  if(eligible.length===0&&!guardTrace.some(t=>t.frame.timestampMs<=config.endMs&&t.guard[expectedHands[0]].status==='guard')){report.status='rejected';report.reasons.push('Starting guard not observed. Bring your hands into guard and hold briefly before punching.');return report;}
  if(eligible.length===0&&report.initialReadiness?.status==='deviation'){report.status='rejected';report.reasons.push(report.initialReadiness.reason);return report;}
  report.status='rejected';report.reasons.push(observed.length?'Observed movement count, anatomical hand or sequence order does not match prescription':eligible.some(o=>o.classification==='partial')?'Movement did not recover within the bounded attempt':'No supported guard-departure-recovery sequence observed');return report;
 }
 report.movementSequenceMatched=true;report.recoveryStatus=recoveriesConfirmed?'confirmed':'cannot-assess';report.status=recoveriesConfirmed?'completed':'uncertain';report.reasons.push('Observed outward-movement sequence matches the prescription; recovery and form are assessed separately');
 if(!recoveriesConfirmed){
  const interrupted=observed.some(o=>o.classification!=='completed'&&/unavailable|changed|gap|jump|discontinuous|low-confidence/i.test(o.evidence.reason));
  report.reasons.push(interrupted?'Tracking or viewpoint uncertainty prevents recovery confirmation; the supported outward movement remains observed.':'Outward movement observed, but return to guard was not confirmed. Bring your punching hand back to guard after the movement.');
 }

 return report;
}
