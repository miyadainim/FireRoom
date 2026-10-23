import {isPoseFrame,type PoseFrame,type ConnectionState} from '../shared/contracts';
export class PoseReceiver {
 private lastSequence=-1;private arrival:number|null=null;
 constructor(private sessionId:string,lastSequence=-1){this.lastSequence=lastSequence;}
 accept(value:unknown,arrivalMs:number):PoseFrame|null {
  if(!Number.isFinite(arrivalMs)||!isPoseFrame(value)||value.sessionId!==this.sessionId||value.sequence<=this.lastSequence)return null;
  this.lastSequence=value.sequence;this.arrival=arrivalMs;return value;
 }
 status(nowMs:number):ConnectionState {const status=this.arrival===null?'disconnected':nowMs-this.arrival>750?'stale':'connected';return {schemaVersion:1,status,sessionId:this.sessionId,lastSequence:this.lastSequence,lastArrivalMs:this.arrival,error:status==='stale'?'STALE_MESSAGE':null};}
}
