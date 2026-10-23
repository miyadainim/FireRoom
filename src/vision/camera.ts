import {poseModelAsset,type PoseModelVariant} from './model-config';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { PoseFrame, Stance } from '../shared/contracts';
/** Phone-only inference: raw video stays in the camera element, never sent over transport.
 * CDN model/WASM downloads require internet on first start. */
export async function startCamera(video:HTMLVideoElement,stance:Stance,sessionId:string,onFrame:(frame:PoseFrame)=>void,modelVariant:PoseModelVariant='lite',onModelReady?:()=>void,onInferenceTiming?:(durationMs:number)=>void):Promise<()=>void>{
 const cameraConfigurationId=crypto.randomUUID();
 let stage:'camera'|'model'='camera';
 let stream:MediaStream|undefined, model:PoseLandmarker|undefined,raf=0,stopped=false,sequence=0,lastVideoTime=-1;
 const stop=()=>{if(stopped)return;stopped=true;cancelAnimationFrame(raf);stream?.getTracks().forEach(track=>track.stop());model?.close();video.pause();video.srcObject=null;};
 try{
  if(!window.isSecureContext)throw new Error(`CAMERA_DENIED: Chrome does not consider ${location.origin} a secure camera origin. Open the trusted HTTPS pairing link; HTTP on a LAN IP cannot access the camera.`);
  if(!navigator.mediaDevices?.getUserMedia)throw new Error(`CAMERA_DENIED: Camera API is unavailable at ${location.origin}, despite secureContext=true. Check browser camera support and site policy.`);
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480}}});
  video.muted=true;video.playsInline=true;video.srcObject=stream;await video.play();
  stage='model';
  const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm');
  model=await PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:poseModelAsset(modelVariant),delegate:'CPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:0.65,minPosePresenceConfidence:0.65,minTrackingConfidence:0.65});
  onModelReady?.();
  const tick=()=>{
   if(stopped)return;
   try{
    if(video.readyState>=2&&video.currentTime!==lastVideoTime){
     lastVideoTime=video.currentTime;const now=performance.now();const result=model!.detectForVideo(video,now);onInferenceTiming?.(performance.now()-now);
     const landmarks=(result.landmarks[0]??[]).map(l=>({x:l.x,y:l.y,z:l.z,visibility:l.visibility??0}));
     const worldLandmarks=(result.worldLandmarks[0]??[]).map(l=>({x:l.x,y:l.y,z:l.z,visibility:l.visibility??0}));
     const tracking=landmarks.length===0?'lost':[11,12,13,14,15,16].every(i=>landmarks[i].visibility>=0.65)?'tracked':'low-confidence';
     onFrame({schemaVersion:1,cameraConfigurationId,sessionId,sequence:sequence++,timestampMs:now,stance,mirrored:false,tracking,landmarks,...(worldLandmarks.length===33?{worldLandmarks}:{}),imageSize:{width:video.videoWidth,height:video.videoHeight}});
    }
    raf=requestAnimationFrame(tick);
   }catch(error){onFrame({schemaVersion:1,cameraConfigurationId,sessionId,sequence:sequence++,timestampMs:performance.now(),stance,mirrored:false,tracking:'lost',landmarks:[]});stop();console.error('MODEL_FAILED: camera tracking stopped',error);}
  };
  raf=requestAnimationFrame(tick);return stop;
 }catch(error){stop();const message=error instanceof Error?error.message:String(error);if(message.startsWith('CAMERA_DENIED:'))throw error;throw new Error(`${stage==='camera'?'CAMERA_DENIED':'MODEL_FAILED'}: ${message}`);}
}
