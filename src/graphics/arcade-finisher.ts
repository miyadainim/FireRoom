import type {CombatPhase} from '../game/arcade-combat-contracts';
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
/** Authored ring-space motion, not force simulation. Progress comes from the paused game clock. */
export function finisherPose(phase:CombatPhase|undefined,progress=0,result?:string|null){
 const knockout=phase==='KNOCKOUT_ANIMATION'||(phase==='RESULTS'&&result==='win');
 const p=phase==='RESULTS'?1:Math.max(0,Math.min(1,progress));
 const flight=knockout?smooth(p/.70):0,fall=knockout?smooth((p-.25)/.70):0;
 return {active:!!phase&&phase!=='FIGHTING'&&(phase!=='RESULTS'||result==='win'),knockout,
  backward:flight*1.35,height:knockout?.30+Math.sin(Math.PI*p)*.37:.0,
  tilt:fall?fall*-Math.PI/2:0,fall,stun:phase==='FINISHER_INTRO'||phase==='FINISHER_READY'||phase==='FINISHER_IMPACT',
  burst:phase==='FINISHER_IMPACT'?Math.sin(Math.PI*Math.max(.05,p)):0};
}
