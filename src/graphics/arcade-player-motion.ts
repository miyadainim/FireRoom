import type {Hand} from '../shared/contracts';
/** Independent authored glove playback; starting the other hand must not cancel recovery. */
export class ArcadePlayerMotion {
 private punches:Partial<Record<Hand,{type:'jab'|'cross';at:number}>>={};
 start(hand:Hand,type:'jab'|'cross',nowMs:number){if(Number.isFinite(nowMs))this.punches[hand]={type,at:nowMs};}
 extension(hand:Hand,nowMs:number){const p=this.punches[hand];if(!p||!Number.isFinite(nowMs))return 0;const age=nowMs-p.at,duration=p.type==='cross'?360:300;return age>=0&&age<duration?Math.sin(Math.PI*age/duration):0;}
}
