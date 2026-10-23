import {createRunId} from './run-id';
import type {RecordingCommand} from '../shared/recording';
export type VideoRunEvent={action:'start'|'stop';runId:string;kind:'calibration'|'practice'};
/** Sends metadata only. Serial publishing prevents a delayed start from overwriting stop. */
export function createVideoControl(session:()=>string,status:(message:string)=>void){
 let sequence=0,active:({session:string}&VideoRunEvent)|null=null,queue=Promise.resolve(),disposed=false;
 const send=(event:VideoRunEvent,target:string)=>{if(!target)return;const command:RecordingCommand={schemaVersion:1,id:createRunId(),runId:event.runId,sequence:sequence++,action:event.action,kind:event.kind,issuedAtUnixMs:Date.now()};queue=queue.then(async()=>{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),2000);try{const response=await fetch(`/api/recording?session=${encodeURIComponent(target)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command),signal:controller.signal,keepalive:true});if(!response.ok)throw Error('Recording control unavailable');}catch{status('Phone video could not be requested. Check the recording indicator on your phone; pose practice can continue.');}finally{clearTimeout(timeout);}});};
 const timer=setInterval(()=>{if(active)send(active,active.session);},5000);
 return {publish(event:VideoRunEvent){if(disposed)return;const target=event.action==='stop'&&active?.runId===event.runId?active.session:session();if(event.action==='start'){if(active&&active.runId!==event.runId)send({...active,action:'stop'},active.session);active={...event,session:target};status('Automatic video is handled on your phone. Check its recording indicator and download available clips there after the run.');}else if(active?.runId===event.runId)active=null;send(event,target);},dispose(){if(disposed)return;disposed=true;clearInterval(timer);if(active)send({...active,action:'stop'},active.session);active=null;}};
}
