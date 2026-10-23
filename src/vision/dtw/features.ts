import {isPoseFrame,type PoseFrame} from '../../shared/contracts';
import {selectedGeometry} from '../geometry';
import type {DtwMode,DtwSample} from './types';
const REQUIRED=[0,11,12,13,14,15,16];
/** Wrist and face offsets in shoulder-width units. Anatomical order is never mirrored.
 * Coordinates remain estimates; these features do not establish elbow observability. */
export function poseSample(frame:PoseFrame,mode:DtwMode):DtwSample {
 const bad={timeMs:frame?.timestampMs??0,values:Array(9).fill(0),valid:Array(9).fill(false)};
 if(!isPoseFrame(frame)||frame.tracking!=='tracked'||(mode==='image-2d'&&!frame.imageSize))return bad;
 const points=selectedGeometry(frame,mode);
 if(!points||!REQUIRED.every(i=>frame.landmarks[i].visibility>=.65&&points[i].visibility>=.65))return bad;
 const a=points[11],b=points[12];const width=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
 if(width<1e-5)return bad;
 const values:number[]=[];
 for(const [index,root] of [[15,a],[16,b],[0,{x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2}]] as const){
 const p=points[index];values.push((p.x-root.x)/width,(p.y-root.y)/width,(p.z-root.z)/width);
 }
 return {timeMs:frame.timestampMs,values,valid:values.map(Number.isFinite)};
}
export function resample(frames:PoseFrame[],mode:DtwMode):DtwSample[]{
 if(frames.length<2)return frames.map(f=>poseSample(f,mode));
 const raw=frames.map(f=>poseSample(f,mode)),start=raw[0].timeMs,end=raw[raw.length-1].timeMs;
 const count=Math.min(120,Math.max(2,Math.ceil((end-start)/50)+1));let cursor=0;
 return Array.from({length:count},(_,i)=>{
 const timeMs=start+(end-start)*i/(count-1);
 while(cursor<raw.length-2&&raw[cursor+1].timeMs<timeMs)cursor++;
 const a=raw[cursor],b=raw[cursor+1],fraction=(timeMs-a.timeMs)/(b.timeMs-a.timeMs);
 const valid=a.valid.map((v,j)=>v&&b.valid[j]&&b.timeMs-a.timeMs<=250);
 return {timeMs,values:a.values.map((v,j)=>v+(b.values[j]-v)*fraction),valid};
 });
}
