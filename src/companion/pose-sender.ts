import type {PoseFrame} from '../shared/contracts';
/** Small pose-only batches preserve intervening observations without an unbounded
 * queue. In-flight packets are never retried; old movements must not replay. */
export function createPoseSender(send:(frames:PoseFrame[])=>Promise<void>,onError:(error:unknown)=>void){
 let pending:PoseFrame[]=[],busy=false,disposed=false;
 async function pump(){if(busy||disposed||!pending.length)return;busy=true;const batch=pending;pending=[];
  try{await send(batch);}catch(error){pending=[];onError(error);}finally{busy=false;if(!disposed)void pump();}
 }
 return {push(frame:PoseFrame){if(disposed)return;pending.push(frame);pending=pending.filter(f=>f.cameraConfigurationId===frame.cameraConfigurationId&&frame.timestampMs-f.timestampMs<=350).slice(-8);void pump();},dispose(){disposed=true;pending=[];}};
}
