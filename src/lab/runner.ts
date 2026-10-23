import {FilesetResolver, PoseLandmarker} from '@mediapipe/tasks-vision';
import type {Landmark} from '../shared/contracts';

export type LabModel = 'lite'|'full'|'heavy';
export interface RunnerOptions {sampleHz?:number;maxSeconds?:number;delegate?:'CPU'|'GPU';confidence?:number;/** Actual measured capture duration, only for recordings with missing container metadata. */ durationSeconds?:number}
export interface RunnerSample {timestampMs:number;inferenceMs:number;decodeMs:number;landmarks:Landmark[];worldLandmarks:Landmark[]}
export interface RunnerResult {samples:RunnerSample[];warmupMs:number;loadMs:number;totalMs:number;model:LabModel;delegate:'CPU'|'GPU';width:number;height:number}
export const modelUrl=(model:LabModel)=>`https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_${model}/float16/1/pose_landmarker_${model}.task`;
const checkAbort=(signal?:AbortSignal)=>{if(signal?.aborted)throw new DOMException('Experiment cancelled','AbortError');};

/** Shared schedule ensures each model sees the same video positions, including missing-pose frames. */
export function sampleVideoTimes(duration:number,hz=8,maxSeconds=60):number[]{
 if(!Number.isFinite(duration)||duration<=0)throw new Error('Video must have a finite, positive duration.');
 if(!Number.isFinite(hz)||hz<1||hz>30||!Number.isFinite(maxSeconds)||maxSeconds<=0||maxSeconds>60)throw new Error('Use 1–30 samples/second and at most 60 seconds.');
 const end=Math.min(duration,maxSeconds);return Array.from({length:Math.ceil(end*hz)},(_,i)=>i/hz).filter(t=>t<end);
}

export async function createLabCamera(video:HTMLVideoElement,options:{facingMode?:'user'|'environment';width?:number;height?:number}={}){
 if(!globalThis.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('Camera requires trusted HTTPS and browser camera permission.');
 const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:options.facingMode??'user'},width:{ideal:options.width??1280},height:{ideal:options.height??720}}});
 const stop=()=>{stream.getTracks().forEach(t=>t.stop());video.pause();video.srcObject=null;};
 try{video.srcObject=stream;video.muted=true;video.playsInline=true;await video.play();return {stream,settings:stream.getVideoTracks()[0].getSettings(),stop};}catch(error){stop();throw error;}
}

/** Records locally, video only. Caller owns download/object URL lifecycle. */
export function recordClip(stream:MediaStream,durationMs:number,onProgress?:(elapsedMs:number)=>void,signal?:AbortSignal):Promise<Blob>{
 checkAbort(signal);
 if(!Number.isFinite(durationMs)||durationMs<1||durationMs>60000)return Promise.reject(new Error('Recording duration must be 1–60000 ms.'));
 if(typeof MediaRecorder==='undefined')return Promise.reject(new Error('Video recording is unavailable in this browser. Import an existing video instead.'));
 const videoOnly=new MediaStream(stream.getVideoTracks());
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/mp4','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
 return new Promise((resolve,reject)=>{
  const recorder=new MediaRecorder(videoOnly,mime?{mimeType:mime}:undefined),chunks:BlobPart[]=[];let timer:ReturnType<typeof setTimeout>,tick:ReturnType<typeof setInterval>;
  const clean=()=>{clearTimeout(timer);clearInterval(tick);signal?.removeEventListener('abort',abort);};
  const abort=()=>{clean();if(recorder.state!=='inactive')recorder.stop();reject(new DOMException('Experiment cancelled','AbortError'));};
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onerror=()=>{clean();reject(new Error('Browser could not record video.'));};
  recorder.onstop=()=>{clean();if(signal?.aborted)return;const blob=new Blob(chunks,{type:recorder.mimeType});if(!blob.size)reject(new Error('Recording was empty.'));else resolve(blob);};
  signal?.addEventListener('abort',abort,{once:true});
  try{recorder.start();const start=performance.now();tick=setInterval(()=>onProgress?.(performance.now()-start),100);timer=setTimeout(()=>recorder.stop(),durationMs);}catch(error){clean();reject(error);}
 });
}

async function seek(video:HTMLVideoElement,time:number,signal?:AbortSignal){
 checkAbort(signal);
 if(Math.abs(video.currentTime-time)<.00001&&video.readyState>=2)return;
 await new Promise<void>((resolve,reject)=>{
  const clean=()=>{clearTimeout(timeout);video.removeEventListener('seeked',done);video.removeEventListener('error',fail);signal?.removeEventListener('abort',abort);};
  const done=()=>{clean();resolve();},fail=()=>{clean();reject(new Error('Could not decode video frame.'));},abort=()=>{clean();reject(new DOMException('Experiment cancelled','AbortError'));};
  const timeout=setTimeout(fail,15000);video.addEventListener('seeked',done,{once:true});video.addEventListener('error',fail,{once:true});signal?.addEventListener('abort',abort,{once:true});video.currentTime=time;
 });
}

/** Sequential replay; GPU and CPU are explicit and no silent fallback contaminates comparisons. */
export async function runVideoModel(video:HTMLVideoElement,model:LabModel,options:RunnerOptions={},onProgress?:(done:number,total:number)=>void,signal?:AbortSignal):Promise<RunnerResult>{
 checkAbort(signal);video.pause();
 const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:options.durationSeconds??video.duration;
 const times=sampleVideoTimes(duration,options.sampleHz??8,options.maxSeconds??60),delegate=options.delegate??'CPU',confidence=options.confidence??.65;
 if(!['lite','full','heavy'].includes(model)||!Number.isFinite(confidence)||confidence<0||confidence>1)throw new Error('Invalid model or confidence setting.');
 const start=performance.now();let task:PoseLandmarker|undefined;
 try{
  const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm');checkAbort(signal);
  task=await PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:modelUrl(model),delegate},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:confidence,minPosePresenceConfidence:confidence,minTrackingConfidence:confidence});checkAbort(signal);
  const loadMs=performance.now()-start;await seek(video,0,signal);
  const warmStart=performance.now();task.detectForVideo(video,0);const warmupMs=performance.now()-warmStart,samples:RunnerSample[]=[];
  for(const time of times){
   checkAbort(signal);const decodeStart=performance.now();await seek(video,time,signal);const decodeMs=performance.now()-decodeStart,inferStart=performance.now();
   const result=task.detectForVideo(video,time*1000+1),inferenceMs=performance.now()-inferStart;
   const copy=(points:typeof result.landmarks[number]|undefined)=> (points??[]).map(p=>({x:p.x,y:p.y,z:p.z,visibility:p.visibility??0}));
   samples.push({timestampMs:time*1000,inferenceMs,decodeMs,landmarks:copy(result.landmarks[0]),worldLandmarks:copy(result.worldLandmarks[0])});onProgress?.(samples.length,times.length);
   await new Promise<void>(resolve=>setTimeout(resolve,0));
  }
  return {samples,warmupMs,loadMs,totalMs:performance.now()-start,model,delegate,width:video.videoWidth,height:video.videoHeight};
 }finally{task?.close();}
}
