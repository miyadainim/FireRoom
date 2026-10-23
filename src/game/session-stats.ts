import type {PrescribedAttemptReport} from '../vision/prescribed';
import './session-stats.css';

export interface SessionStats {attempts:number;observedPunches:number;jabs:number;crosses:number;confirmedRecoveries:number;matchedSequences:number}
export interface StatsAttempt {recordingId:string;rules:PrescribedAttemptReport;kind?:string;synthetic?:boolean}
const empty=():SessionStats=>({attempts:0,observedPunches:0,jabs:0,crosses:0,confirmedRecoveries:0,matchedSequences:0});
/** Current-page live attempt totals. Movement observations are not physical punch or form validation. */
export class SessionStatsAccumulator {
 private totals=empty();
 private recordings=new Set<string>();
 snapshot():SessionStats{return {...this.totals};}
 record(attempt:StatsAttempt):boolean {
  if(!attempt.recordingId.trim()||attempt.synthetic||attempt.kind&&attempt.kind!=='fireroom-prescribed-live-attempt'||this.recordings.has(attempt.recordingId))return false;
  this.recordings.add(attempt.recordingId);
  this.totals.attempts++;
  if(attempt.rules.movementSequenceMatched)this.totals.matchedSequences++;
  for(const punch of attempt.rules.punches){
   if(!punch.movementObserved)continue;
   if(punch.cycle.type!=='jab'&&punch.cycle.type!=='cross')continue;
   this.totals.observedPunches++;
   if(punch.cycle.type==='jab')this.totals.jabs++;else this.totals.crosses++;
   if(punch.recoveryConfirmed)this.totals.confirmedRecoveries++;
  }
  return true;
 }
 /** Keep dedupe history: resetting totals must not recount an old export/result. */
 reset():void{this.totals=empty();}
}

/** Mount in the compact HUD or setup drawer; no timers, storage, or pose data retained. */
export function mountSessionStats(root:HTMLElement){
 const stats=new SessionStatsAccumulator();
 root.classList.add('session-stats');
 root.innerHTML=`<details><summary>Session · <span data-stats="observedPunches">0</span> observed punches</summary><div class="session-stats-detail"><p>Current page session · guided attempts only</p><dl><dt>Jabs observed</dt><dd data-stats="jabs">0</dd><dt>Crosses observed</dt><dd data-stats="crosses">0</dd><dt>Wrist recoveries confirmed</dt><dd data-stats="confirmedRecoveries">0</dd><dt>Attempts reviewed</dt><dd data-stats="attempts">0</dd><dt>Movement sequences matched</dt><dd data-stats="matchedSequences">0</dd></dl><p>Counts camera-observed punch movements in completed attempt recordings, including movements with uncertain recovery. Missed tracking and punches outside attempts are not counted. These are not totals of all physical punches or a form score.</p><button type="button" data-stats-reset>Reset session totals</button><p data-stats-status role="status"></p></div></details>`;
 const render=()=>{const snapshot=stats.snapshot();for(const [key,value]of Object.entries(snapshot)){root.querySelectorAll<HTMLElement>(`[data-stats="${key}"]`).forEach(node=>{node.textContent=String(value);});}};
 const button=root.querySelector<HTMLButtonElement>('[data-stats-reset]')!;
 button.onclick=()=>{stats.reset();render();root.querySelector<HTMLElement>('[data-stats-status]')!.textContent='Session totals reset. New attempts will count from zero.';};
 let disposed=false;
 return {record:(attempt:StatsAttempt)=>{if(!disposed&&stats.record(attempt)){render();root.querySelector<HTMLElement>('[data-stats-status]')!.textContent='Latest attempt added to session totals.';}},dispose:()=>{disposed=true;button.onclick=null;}};
}
