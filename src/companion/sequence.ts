/** Preserve a producer's monotonic logical millisecond clock and sequence across reloads.
 * Local performance.now drives elapsed time; persisted offset bridges a new document clock.
 * Storage failure is surfaced rather than silently reusing an earlier sequence.
 */
export function producerClock(sessionId:string,storage:Pick<Storage,'getItem'|'setItem'>,now:()=>number=()=>performance.now()){
 const key=`fireroom-clock-${sessionId}`;let saved:{sequence:number;timestampMs:number}|undefined;
 try{const value=JSON.parse(storage.getItem(key)??'null');if(value&&Number.isSafeInteger(value.sequence)&&value.sequence>=0&&Number.isFinite(value.timestampMs))saved=value;}catch{}
 let sequence=saved?.sequence??-1;let timestampMs=saved?.timestampMs??0;const origin=now(),offset=timestampMs+1;
 return ()=>{sequence++;timestampMs=Math.max(offset+now()-origin,timestampMs+0.001);storage.setItem(key,JSON.stringify({sequence,timestampMs}));return {sequence,timestampMs};};
}
