import type {PoseFrame} from '../shared/contracts';
import {isRecordingCommand,RECORDING_COMMAND_TTL_MS,type RecordingCommand} from '../shared/recording';

export interface VideoClip {runId:string;kind:string;blob:Blob;manifest:Record<string,unknown>}
interface Active {command:RecordingCommand;recorder:MediaRecorder;chunks:Blob[];bytes:number;started:number;unix:number;reason:string;frames:{sequence:number;timestampMs:number;offsetMs:number;cameraConfigurationId?:string}[];timer:ReturnType<typeof setTimeout>;stream:MediaStream}
/** Phone-local video only. Raw observations remain untouched; synchronization is approximate. */
export class PhoneVideoCapture {
 clips:VideoClip[]=[];private active?:Active;private lastSequence=-1;private runs=new Set<string>();private disposed=false;private lastHeartbeat=0;
 constructor(private video:HTMLVideoElement,private changed:(status:string)=>void){}
 command(command:RecordingCommand){
  if(this.disposed||!isRecordingCommand(command)||command.sequence<=this.lastSequence)return;
  if(command.action==='start'&&(Date.now()-command.issuedAtUnixMs>RECORDING_COMMAND_TTL_MS||command.issuedAtUnixMs>Date.now()+5000))return;
  this.lastSequence=command.sequence;
  if(command.action==='stop'){if(this.active?.command.runId===command.runId)this.stop('completed');return;}
  if(this.active?.command.runId===command.runId){this.lastHeartbeat=Date.now();return;}
  if(this.runs.has(command.runId))return;
  this.runs.add(command.runId);
  if(this.active){this.changed('Previous video is still finishing; this capture has no video.');return;}
  const source=this.video.srcObject as MediaStream|null;
  if(typeof MediaRecorder==='undefined'||!source?.getVideoTracks().some(t=>t.readyState==='live')){this.changed('Video recording unavailable; pose checks can continue.');return;}
  // A separate stream excludes microphone tracks without stopping the camera when recording ends.
  const stream=new MediaStream(source.getVideoTracks());let recorder:MediaRecorder|undefined;
  for(const mimeType of ['video/webm;codecs=vp8','video/webm','video/mp4','']){
   try{if(mimeType&&!MediaRecorder.isTypeSupported(mimeType))continue;recorder=new MediaRecorder(stream,mimeType?{mimeType,videoBitsPerSecond:1_000_000}:{videoBitsPerSecond:1_000_000});break;}catch{/* Try the browser default. */}
  }
  if(!recorder){this.changed('This browser cannot record video; pose checks can continue.');return;}
  const a:Active={command,recorder,chunks:[],bytes:0,started:performance.now(),unix:Date.now(),reason:'completed',frames:[],stream,timer:setTimeout(()=>this.stop('120-second safety limit'),120000)};
  this.active=a;this.lastHeartbeat=Date.now();
  recorder.onstart=()=>{if(this.active!==a||recorder!.state!=='recording')return;a.started=performance.now();a.unix=Date.now();this.changed('Recording video on this phone — no audio.');};
  recorder.ondataavailable=e=>{if(!e.data.size)return;a.bytes+=e.data.size;if(a.bytes>30*1024*1024){a.reason='Video exceeded 30 MB limit';this.stop(a.reason);return;}a.chunks.push(e.data);};
  recorder.onerror=()=>{a.reason='Recording error';this.stop(a.reason);this.changed('Video recording failed; pose checks can continue.');};
  recorder.onstop=()=>{
   clearTimeout(a.timer);if(this.active===a)this.active=undefined;
   if(this.disposed)return;
   const blob=new Blob(a.chunks,{type:recorder!.mimeType||a.chunks[0]?.type||'video/webm'});
   if(!blob.size||a.reason==='Recording error'||a.bytes>30*1024*1024){this.changed('No usable video saved; pose measurements are separate.');return;}
   const endedAtUnixMs=Date.now(),durationMs=Math.max(0,performance.now()-a.started);
   this.clips.push({runId:command.runId,kind:command.kind,blob,manifest:{schemaVersion:1,runId:command.runId,kind:command.kind,mimeType:blob.type,startedAtUnixMs:a.unix,endedAtUnixMs,durationMs,status:a.reason==='completed'?'complete':'interrupted',reason:a.reason,synchronization:'Approximate phone-local pose callback offsets from recorder start; no cross-device clock subtraction.',poseFrames:a.frames}});
   while(this.clips.length>5||this.clips.reduce((n,c)=>n+c.blob.size,0)>80*1024*1024)this.clips.shift();
   this.changed(`Video saved on this phone (${a.reason}). Download it below.`);
  };
  try{recorder.start(500);}catch{clearTimeout(a.timer);this.active=undefined;this.changed('Video recording failed to start; pose checks can continue.');}
 }
 observeFrame(frame:PoseFrame){const a=this.active;if(!a||a.recorder.state!=='recording'||a.frames.length>=20000)return;a.frames.push({sequence:frame.sequence,timestampMs:frame.timestampMs,offsetMs:Math.max(0,performance.now()-a.started),...(frame.cameraConfigurationId?{cameraConfigurationId:frame.cameraConfigurationId}:{})});}
 checkHeartbeat(){if(this.active&&Date.now()-this.lastHeartbeat>RECORDING_COMMAND_TTL_MS)this.stop('viewer disconnected');}
 stop(reason='camera stopped'){const a=this.active;if(!a||a.recorder.state==='inactive')return;a.reason=reason;clearTimeout(a.timer);try{a.recorder.stop();}catch{this.active=undefined;this.changed('Video could not finish.');}}
 dispose(){this.stop('page closed');this.disposed=true;this.clips=[];}
}

export function mountPhoneVideo(root:HTMLElement,video:HTMLVideoElement,sessionId:string){
 root.innerHTML='<p>Video records automatically during setup and practice. No audio; video stays on this phone. Download clips here before leaving. Up to five clips are kept in this page; older clips may be removed to stay within memory limits.</p><p data-video-status role="status">Waiting for a calibration or practice capture.</p><div data-video-clips></div>';
 const status=root.querySelector<HTMLElement>('[data-video-status]')!,list=root.querySelector<HTMLElement>('[data-video-clips]')!;
 let urls:string[]=[],disposed=false,polling=false;
 const capture=new PhoneVideoCapture(video,message=>{status.textContent=message;render();});
 function render(){urls.forEach(URL.revokeObjectURL);urls=[];list.replaceChildren();for(const clip of capture.clips){const row=document.createElement('p');for(const [label,blob,ext] of [['Download video',clip.blob,clip.blob.type.includes('mp4')?'mp4':'webm'],['Download timing manifest',new Blob([JSON.stringify(clip.manifest,null,2)],{type:'application/json'}),'json']] as const){const link=document.createElement('a'),url=URL.createObjectURL(blob);urls.push(url);link.href=url;link.download=`fireroom-${clip.kind}-${clip.runId.replace(/[^a-zA-Z0-9_-]/g,'_')}.${ext}`;link.textContent=`${label} (${clip.kind}) `;row.append(link);}list.append(row);}}
 async function poll(){if(disposed||polling)return;capture.checkHeartbeat();polling=true;try{const response=await fetch(`/api/recording?session=${encodeURIComponent(sessionId)}`,{cache:'no-store'});if(response.ok){const command:unknown=await response.json();if(!disposed&&isRecordingCommand(command))capture.command(command);}}catch{/* Relay interruptions must not interrupt camera or pose assessment. */}finally{polling=false;}}
 const timer=setInterval(()=>void poll(),250);void poll();
 const pagehide=()=>capture.stop('page hidden');window.addEventListener('pagehide',pagehide);
 return {observeFrame:(frame:PoseFrame)=>capture.observeFrame(frame),stop:(reason?:string)=>capture.stop(reason),dispose(){disposed=true;clearInterval(timer);window.removeEventListener('pagehide',pagehide);capture.dispose();urls.forEach(URL.revokeObjectURL);urls=[];}};
}
