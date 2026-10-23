import type { GeometryMode, Landmark, PoseFrame } from '../shared/contracts';
/** Explicit coordinate selection. Never substitute image estimates for missing world data. */
export function selectedGeometry(frame:PoseFrame,mode:GeometryMode):Landmark[]|null {
 if(mode==='world-3d')return frame.worldLandmarks?.length===33?frame.worldLandmarks:null;
 if(mode==='image-3d')return frame.landmarks;
 const aspect=frame.imageSize?frame.imageSize.height/frame.imageSize.width:1;
 return frame.landmarks.map(p=>({...p,y:p.y*aspect,z:0}));
}
