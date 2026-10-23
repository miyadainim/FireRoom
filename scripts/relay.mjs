import {createServer} from 'node:http';
import {isPoseFrame} from '../src/shared/contracts.ts';
import {isTransportTimings} from '../src/shared/transport-diagnostics.ts';
import {isRecordingCommand,isFreshRecordingCommand,RECORDING_COMMAND_TTL_MS} from '../src/shared/recording.ts';
import {randomBytes} from 'node:crypto';
const sessions=new Map();
export async function handleRequest(req,res){
 const workStarted=performance.now();
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 const url=new URL(req.url,'http://localhost');const key=url.searchParams.get('session');
 if(req.method==='POST'&&url.pathname==='/api/session'){if(sessions.size>=100){res.writeHead(503);res.end('{}');return;}const id=randomBytes(16).toString('hex');sessions.set(id,{frame:null,frames:[],timings:[],updated:Date.now(),recording:null,recordingUpdated:0});res.end(JSON.stringify({sessionId:id}));return;}
 const session=sessions.get(key);if(!session){res.writeHead(404);res.end('{}');return;}
 if(req.method==='GET'&&url.pathname==='/api/recording'){res.end(JSON.stringify(Date.now()-session.recordingUpdated<=RECORDING_COMMAND_TTL_MS?session.recording:null));return;}
 if(req.method==='POST'&&url.pathname==='/api/recording'){let body='';try{for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>2048)throw Error('too large');}const command=JSON.parse(body);const now=Date.now();if(!isRecordingCommand(command)||!isFreshRecordingCommand(command,now))throw Error('invalid');if(session.recording&&command.sequence<=session.recording.sequence){res.writeHead(409);res.end('{}');return;}session.recording=command;session.recordingUpdated=now;session.updated=now;res.end('{}');}catch{res.writeHead(400);res.end('{}');}return;}
 if(req.method==='GET'&&url.pathname==='/api/frame'){res.end(JSON.stringify(Date.now()-session.updated<750?session.frame:null));return;}
 if(req.method==='GET'&&url.pathname==='/api/frames'){
  const raw=url.searchParams.get('after'),after=raw===null?-1:Number(raw);
  if(!Number.isSafeInteger(after)||after< -1){res.writeHead(400);res.end('{}');return;}
  const now=Date.now(),frames=session.frames.filter(item=>item.frame.sequence>after&&now>=item.arrivalMs&&now-item.arrivalMs<=350).map(item=>item.frame);
  res.end(JSON.stringify({schemaVersion:1,frames,diagnostics:{phoneTimings:session.timings,latestFrameAgeMs:session.frame===null?null:Math.max(0,now-session.updated),relayWorkMs:Math.max(0,performance.now()-workStarted)}}));return;
 }
 if(req.method==='POST'&&url.pathname==='/api/frames'){
  let body='';try{
   for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>160000)throw Error('too large');}
   const batch=JSON.parse(body);
   if(!batch||batch.schemaVersion!==1||(batch.timings!==undefined&&!isTransportTimings(batch.timings))||!Array.isArray(batch.frames)||batch.frames.length===0||batch.frames.length>8||batch.frames.some(frame=>!isPoseFrame(frame)||frame.sessionId!==key))throw Error('invalid');
   // Validate the complete transaction before publishing any frame.
   let sequence=session.frame?.sequence??-1;
   for(const frame of batch.frames){if(frame.sequence<=sequence){res.writeHead(409);res.end('{}');return;}sequence=frame.sequence;}
   const now=Date.now();
   for(const frame of batch.frames)session.frames.push({frame,arrivalMs:now});
   if(batch.timings!==undefined)session.timings=batch.timings;
   session.frames=session.frames.slice(-32);session.frame=batch.frames[batch.frames.length-1];session.updated=now;res.end('{}');
  }catch{res.writeHead(400);res.end('{}');}return;
 }
 if(req.method==='POST'&&url.pathname==='/api/frame'){let body='';try{for await(const chunk of req){body+=chunk;if(body.length>20000)throw Error('too large');}const frame=JSON.parse(body);if(!isPoseFrame(frame)||frame.sessionId!==key)throw Error('invalid');if(session.frame&&frame.sequence<=session.frame.sequence){res.writeHead(409);res.end('{}');return;}session.frame=frame;session.updated=Date.now();session.frames.push({frame,arrivalMs:session.updated});session.frames=session.frames.slice(-32);res.end('{}');}catch{res.writeHead(400);res.end('{}');}return;}
 res.writeHead(404);res.end('{}');
}
export const server=createServer(handleRequest);
setInterval(()=>{for(const [id,s] of sessions)if(Date.now()-s.updated>3600000)sessions.delete(id);},60000).unref();
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1])server.listen(8787,'127.0.0.1',()=>console.log('FireRoom pose-only relay: http://127.0.0.1:8787'));
