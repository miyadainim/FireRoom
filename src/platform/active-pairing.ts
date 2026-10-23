/** Same-tab viewer handoff only. Phone capture stays on its existing companion page. */
export interface ActivePairing {sessionId:string;phoneOrigin:string;lastSequence:number}
const key='fireroom.active-pairing.v1';
export function readActivePairing(storage:Pick<Storage,'getItem'>):ActivePairing|null {
 try{const value=JSON.parse(storage.getItem(key)??'null');return value&&typeof value.sessionId==='string'&&value.sessionId.length>0&&typeof value.phoneOrigin==='string'&&Number.isInteger(value.lastSequence)&&value.lastSequence>=-1?value:null;}catch{return null;}
}
export function saveActivePairing(storage:Pick<Storage,'setItem'>,value:ActivePairing):void {
 try{storage.setItem(key,JSON.stringify(value));}catch{/* Storage restrictions must not stop live tracking. */}
}
