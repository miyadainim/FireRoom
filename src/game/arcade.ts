import {ARCADE_BALANCE as B,type ArcadeTechnique,type CombatPhase} from './arcade-combat-contracts';
/** Deterministic, local-clock virtual sparring. Damage is authored gameplay, never punch force. */
export type ArcadeOpponentState='APPROACH'|'GUARD'|'ATTACK_WINDUP'|'ATTACK'|'RECOVERY'|'HIT_REACTION'|'RETREAT'|'STUNNED'|'KNOCKOUT';
export type ArcadeGuard='raised'|'lowered'|'unknown';
export interface ArcadeTracking {reliable:boolean;guard:ArcadeGuard}
export interface ArcadeEvent {id:number;type:'hit'|'blocked'|'miss'|'opponent-hit'|'player-block'|'pause'|'resume'|'finish';message:string}
export interface ArcadeStats {punches:number;hits:number;blocked:number;misses:number;playerBlocks:number;opponentHits:number}
export interface ArcadeSnapshot {status:'ready'|'running'|'paused'|'complete';pauseReason:string|null;elapsedMs:number;remainingMs:number;opponentState:ArcadeOpponentState;opponentPunch:'jab'|'cross';stateProgress:number;distance:number;playerHealth:number;opponentHealth:number;stats:ArcadeStats;lastEvent:ArcadeEvent|null;result:'win'|'loss'|'draw'|null;phase:CombatPhase;phaseProgress:number;combo:number;highestCombo:number;comboRemainingMs:number;cleanJabs:number;cleanCrosses:number;cleanCombinations:number;techniqueFeedback:string;techniqueRevision:number}
export interface ArcadePunch {id:string;type:'jab'|'cross';confidence:number}
export interface ArcadePunchResult {accepted:boolean;outcome:'hit'|'blocked'|'miss'|'ignored';damage:number;reason:string}
const ROUND_MS=60_000,FRESH_MS=1000,IN_RANGE=.42;
const DURATION:Record<ArcadeOpponentState,number>={APPROACH:1800,GUARD:1200,ATTACK_WINDUP:1100,ATTACK:240,RECOVERY:1350,HIT_REACTION:450,RETREAT:1100,STUNNED:1,KNOCKOUT:1};
export class ArcadeRound {
 private phase:CombatPhase='FIGHTING';private phaseElapsed=0;private combo=0;private highestCombo=0;private lastHitAt=-Infinity;private cleanJabs=0;private cleanCrosses=0;private cleanCombinations=0;private techniqueFeedback='';private techniqueRevision=0;
 private ledger=new Map<string,{type:'jab'|'cross';at:number;assessment?:ArcadeTechnique;sequence?:string;sequenceSettled?:boolean}>();private lastJab:string|null=null;private latestAssessment=-Infinity;
 private trackingLostAt:number|null=null;
 private state:ArcadeOpponentState='APPROACH';private status:ArcadeSnapshot['status']='ready';private elapsed=0;private stateElapsed=0;private distance=.85;private playerHealth=100;private opponentHealth=100;private lastNow:number;private tracking:ArcadeTracking={reliable:false,guard:'unknown'};private trackingAt=-Infinity;private pauseReason:string|null=null;private seen=new Set<string>();private lastPunchAt:Record<'jab'|'cross',number>={jab:-Infinity,cross:-Infinity};private serial=0;private cycle=0;private lastEvent:ArcadeEvent|null=null;private result:ArcadeSnapshot['result']=null;private stats:ArcadeStats={punches:0,hits:0,blocked:0,misses:0,playerBlocks:0,opponentHits:0};
 constructor(nowMs=0){this.lastNow=nowMs;}
 start(nowMs:number){if(this.status!=='ready')return this.snapshot();this.lastNow=nowMs;this.status='running';if(!this.readyTracking(nowMs))this.suspend('Waiting for reliable tracking and a visible guard.');return this.snapshot();}
 setTracking(tracking:ArcadeTracking,nowMs:number){
  if(!Number.isFinite(nowMs)||nowMs<this.lastNow)return;
  this.tracking={...tracking};this.trackingAt=nowMs;
  if(this.status!=='running'||this.phase==='FINISHER_IMPACT'||this.phase==='KNOCKOUT_ANIMATION')return;
  if(!tracking.reliable||tracking.guard==='unknown'){
   this.trackingLostAt??=nowMs;
   // Freeze immediately; the grace interval never reuses stale guard or advances combat.
   this.lastNow=nowMs;
   if(nowMs-this.trackingLostAt>=750)this.suspend('Tracking interrupted. Adjust the camera, then Resume.');
  }else if(this.trackingLostAt!==null){
   const duration=nowMs-this.trackingLostAt;this.trackingLostAt=null;this.lastNow=nowMs;
   if(duration>=750)this.suspend('Tracking interrupted. Adjust the camera, then Resume.');
   else if(this.state==='ATTACK'||this.state==='ATTACK_WINDUP')this.enter('GUARD');
  }
 }
 trackingHeld(){return this.status==='running'&&this.trackingLostAt!==null;}
 pause(nowMs:number){this.tick(nowMs);if(this.status==='running')this.suspend('Round paused.');return this.snapshot();}
 resume(nowMs:number){if(this.status!=='paused'||!Number.isFinite(nowMs)||nowMs<this.lastNow||!this.readyTracking(nowMs))return false;this.status='running';this.pauseReason=null;this.trackingLostAt=null;this.lastNow=nowMs;if(this.state==='ATTACK'||this.state==='ATTACK_WINDUP')this.enter('GUARD');this.emit('resume','Round resumed.');return true;}
 tick(nowMs:number):ArcadeSnapshot {
  if(!Number.isFinite(nowMs)||nowMs<this.lastNow)return this.snapshot();const delta=nowMs-this.lastNow;this.lastNow=nowMs;
  if(this.status!=='running')return this.snapshot();if(this.phase==='FINISHER_IMPACT'||this.phase==='KNOCKOUT_ANIMATION'){this.advancePhase(delta);return this.snapshot();}if(this.trackingLostAt!==null){if(nowMs-this.trackingLostAt>=750)this.suspend('Tracking interrupted. Adjust the camera, then Resume.');return this.snapshot();}if(delta>FRESH_MS){this.suspend('Display interrupted. Check tracking, then Resume.');return this.snapshot();}if(!this.readyTracking(nowMs)){this.suspend('Tracking lost or stale. Reconnect, then Resume.');return this.snapshot();}
  if(this.phase!=='FIGHTING'){this.advancePhase(delta);return this.snapshot();}
  let remaining=Math.min(delta,ROUND_MS-this.elapsed);
  while(remaining>0&&this.status==='running'){
   const step=Math.min(remaining,DURATION[this.state]-this.stateElapsed);this.elapsed+=step;this.stateElapsed+=step;remaining-=step;this.updateDistance();
   if(this.elapsed>=ROUND_MS){this.finish();break;}
   if(this.stateElapsed>=DURATION[this.state])this.transition();
  }
  if(this.elapsed-this.lastHitAt>B.comboWindowMs)this.combo=0;
  for(const [id,row]of this.ledger)if(this.elapsed-row.at>B.techniqueTimeoutMs)this.ledger.delete(id);
  return this.snapshot();
 }
 punch(punch:ArcadePunch,nowMs:number):ArcadePunchResult {
  if(!Number.isFinite(nowMs)||nowMs<this.lastNow)return {accepted:false,outcome:'ignored',damage:0,reason:'Stale game timestamp.'};
  this.tick(nowMs);const ignored=(reason:string):ArcadePunchResult=>({accepted:false,outcome:'ignored',damage:0,reason});
  if(this.status!=='running')return ignored('Round is not running.');if(this.trackingHeld())return ignored('Tracking is reacquiring; combat is frozen.');if(!punch.id||!['jab','cross'].includes(punch.type)||!Number.isFinite(punch.confidence)||punch.confidence<.65)return ignored('Unsupported punch evidence.');
  if(this.seen.has(punch.id))return ignored('Duplicate movement.');this.seen.add(punch.id);
  if(this.phase==='FINISHER_READY'){this.phase='FINISHER_IMPACT';this.phaseElapsed=0;return {accepted:true,outcome:'hit',damage:0,reason:'Finishing punch.'};}
  if(this.phase!=='FIGHTING')return ignored('Finisher cinematic is running.');
  // Lead and rear punches have independent cooldowns so a supported jab–cross can execute.
  if(this.elapsed-this.lastPunchAt[punch.type]<280)return ignored('Same-hand punch cooldown.');this.lastPunchAt[punch.type]=this.elapsed;this.stats.punches++;
  if(this.distance>IN_RANGE){this.lastJab=null;this.stats.misses++;this.emit('miss','Out of virtual range.');return {accepted:true,outcome:'miss',damage:0,reason:'Out of range.'};}
  if(this.state==='GUARD'){this.lastJab=null;this.stats.blocked++;this.emit('blocked','Opponent blocked.');return {accepted:true,outcome:'blocked',damage:0,reason:'Opponent guard.'};}
  const damage=B[punch.type];this.opponentHealth=Math.max(0,this.opponentHealth-damage);this.stats.hits++;this.emit('hit',`${punch.type==='jab'?'Jab':'Cross'} landed.`);
  this.combo=this.elapsed-this.lastHitAt<=B.comboWindowMs?this.combo+1:1;this.lastHitAt=this.elapsed;this.highestCombo=Math.max(this.highestCombo,this.combo);
  const row:{type:'jab'|'cross';at:number;sequence?:string}={type:punch.type,at:this.elapsed};
  if(punch.type==='cross'&&this.lastJab){const jab=this.ledger.get(this.lastJab);if(jab&&this.elapsed-jab.at<=B.sequenceWindowMs)row.sequence=this.lastJab;this.lastJab=null;}
  this.ledger.set(punch.id,row);if(punch.type==='jab')this.lastJab=punch.id;
  if(this.opponentHealth===0)this.beginFinisher();else this.enter('HIT_REACTION');return {accepted:true,outcome:'hit',damage,reason:'Virtual hit.'};
 }
 snapshot():ArcadeSnapshot{return {status:this.status,pauseReason:this.pauseReason,elapsedMs:this.elapsed,remainingMs:Math.max(0,ROUND_MS-this.elapsed),opponentState:this.state,opponentPunch:this.cycle%2===0?'jab':'cross',stateProgress:this.stateElapsed/DURATION[this.state],distance:this.distance,playerHealth:this.playerHealth,opponentHealth:this.opponentHealth,stats:{...this.stats},lastEvent:this.lastEvent?{...this.lastEvent}:null,result:this.result,phase:this.phase,phaseProgress:this.phaseElapsed/this.phaseDuration(),combo:this.combo,highestCombo:this.highestCombo,comboRemainingMs:this.combo?Math.max(0,B.comboWindowMs-(this.elapsed-this.lastHitAt)):0,cleanJabs:this.cleanJabs,cleanCrosses:this.cleanCrosses,cleanCombinations:this.cleanCombinations,techniqueFeedback:this.techniqueFeedback,techniqueRevision:this.techniqueRevision};}
 finalizeTechnique(assessment:ArcadeTechnique,nowMs:number):{accepted:boolean;additionalDamage:number;reason:string}{
  const reject=(reason:string)=>({accepted:false,additionalDamage:0,reason});if(!Number.isFinite(nowMs)||nowMs<this.lastNow)return reject('Stale game timestamp.');this.tick(nowMs);
  if(this.phase!=='FIGHTING'||this.status==='complete')return reject('Combat has ended; pending bonuses discarded.');if(this.status!=='running'||this.trackingHeld())return reject('Combat frozen; defer assessment.');
  const row=this.ledger.get(assessment.punchId);if(!row)return reject('Unknown or expired punch.');
  if(row.assessment)return reject('Assessment already settled.');
  if(assessment.schemaVersion!==1||assessment.type!==row.type||!Number.isFinite(assessment.completedAtMs)||assessment.completedAtMs<this.latestAssessment||![assessment.startingGuard,assessment.oppositeGuard,assessment.recovery].every(v=>['PASS','FAIL','UNKNOWN'].includes(v)))return reject('Invalid or out-of-order assessment.');
  if(this.elapsed-row.at>B.techniqueTimeoutMs)return reject('Technique assessment expired.');
  row.assessment={...assessment};this.techniqueRevision++;this.latestAssessment=assessment.completedAtMs;
  const clean=(a:ArcadeTechnique)=>a.startingGuard==='PASS'&&a.oppositeGuard==='PASS'&&a.recovery==='PASS';
  let bonus=B[row.type]*((assessment.startingGuard==='PASS'?B.startingGuard:0)+(assessment.oppositeGuard==='PASS'?B.oppositeGuard:0)+(assessment.recovery==='PASS'?B.recovery:0));
  if(clean(assessment)){if(row.type==='jab')this.cleanJabs++;else this.cleanCrosses++;this.techniqueFeedback=row.type==='jab'?'CLEAN JAB':'CLEAN CROSS';}
  else if(assessment.oppositeGuard==='FAIL')this.techniqueFeedback='GUARD DROPPED';else if(assessment.startingGuard==='FAIL')this.techniqueFeedback='SET YOUR GUARD';
  else if(assessment.recovery==='PASS')this.techniqueFeedback='NICE RECOVERY';
  else if(assessment.oppositeGuard==='PASS')this.techniqueFeedback='GOOD GUARD';
  else this.techniqueFeedback='Technique evidence incomplete';
  for(const cross of this.ledger.values())if(cross.sequence&&!cross.sequenceSettled&&cross.assessment){const jab=this.ledger.get(cross.sequence);if(jab?.assessment){cross.sequenceSettled=true;if(clean(jab.assessment)&&clean(cross.assessment)){bonus+=B.cross*B.sequence;this.cleanCombinations++;this.techniqueFeedback='CLEAN COMBINATION';}}}
  const actual=Math.min(this.opponentHealth,bonus);this.opponentHealth=Math.max(0,this.opponentHealth-bonus);
  if(this.opponentHealth===0)this.beginFinisher();return {accepted:true,additionalDamage:actual,reason:this.techniqueFeedback};
 }
 finishWithoutPunch(nowMs:number){if(!Number.isFinite(nowMs)||nowMs<this.lastNow)return false;this.tick(nowMs);if(!['FINISHER_INTRO','FINISHER_READY'].includes(this.phase)||this.status==='complete')return false;this.status='running';this.pauseReason=null;this.trackingLostAt=null;this.lastNow=nowMs;this.phase='KNOCKOUT_ANIMATION';this.phaseElapsed=0;this.enter('KNOCKOUT');return true;}
 private phaseDuration(){return this.phase==='FINISHER_INTRO'?B.finisherIntroMs:this.phase==='FINISHER_READY'?B.finisherReadyMs:this.phase==='FINISHER_IMPACT'?B.finisherImpactMs:this.phase==='KNOCKOUT_ANIMATION'?B.knockoutMs:1;}
 private beginFinisher(){if(this.phase!=='FIGHTING')return;this.phase='FINISHER_INTRO';this.phaseElapsed=0;this.enter('STUNNED');this.distance=.3;this.ledger.clear();this.lastJab=null;}
 private advancePhase(delta:number){let remaining=delta;while(remaining>0&&this.status==='running'){const step=Math.min(remaining,this.phaseDuration()-this.phaseElapsed);this.phaseElapsed+=step;remaining-=step;if(this.phaseElapsed>=this.phaseDuration()){this.phaseElapsed=0;if(this.phase==='FINISHER_INTRO')this.phase='FINISHER_READY';else if(this.phase==='FINISHER_READY'||this.phase==='FINISHER_IMPACT'){this.phase='KNOCKOUT_ANIMATION';this.enter('KNOCKOUT');}else if(this.phase==='KNOCKOUT_ANIMATION'){this.phase='RESULTS';this.finish();break;}else break;}}}
 private readyTracking(now:number){return this.tracking.reliable&&this.tracking.guard!=='unknown'&&now>=this.trackingAt&&now-this.trackingAt<=FRESH_MS;}
 private suspend(reason:string){this.status='paused';this.pauseReason=reason;this.emit('pause',reason);}
 private emit(type:ArcadeEvent['type'],message:string){this.lastEvent={id:++this.serial,type,message};}
 private enter(state:ArcadeOpponentState){this.state=state;this.stateElapsed=0;}
 private updateDistance(){if(this.state==='APPROACH')this.distance=.85-.55*this.stateElapsed/DURATION.APPROACH;else if(this.state==='RETREAT')this.distance=.3+.55*this.stateElapsed/DURATION.RETREAT;else this.distance=.3;}
 private transition(){switch(this.state){case 'APPROACH':this.enter('GUARD');break;case 'GUARD':this.enter('ATTACK_WINDUP');break;case 'ATTACK_WINDUP':this.enter('ATTACK');break;case 'ATTACK':if(this.tracking.guard==='raised'){this.stats.playerBlocks++;this.emit('player-block','Guard blocked the attack.');}else{this.playerHealth=Math.max(0,this.playerHealth-8);this.stats.opponentHits++;this.emit('opponent-hit','Opponent landed a virtual hit.');}if(this.playerHealth===0)this.finish();else this.enter('RECOVERY');break;case 'RECOVERY':this.enter(++this.cycle%2===0?'RETREAT':'GUARD');break;case 'HIT_REACTION':this.enter('RECOVERY');break;case 'RETREAT':this.enter('APPROACH');break;}}
 private finish(){this.phase='RESULTS';this.ledger.clear();this.status='complete';this.pauseReason=null;this.result=this.opponentHealth===this.playerHealth?'draw':this.opponentHealth<this.playerHealth?'win':'loss';this.emit('finish',`Round complete: ${this.result}.`);}
}
