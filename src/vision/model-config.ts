/** Model selection only; recognition/evaluation thresholds are unchanged. */
export type PoseModelVariant='lite'|'full';
export function poseModelVariant(value:string|null):PoseModelVariant{return value==='full'?'full':'lite';}
export function poseModelAsset(model:PoseModelVariant):string{return `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_${model}/float16/1/pose_landmarker_${model}.task`;}
