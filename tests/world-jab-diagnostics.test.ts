import {describe,it,expect} from 'vitest';
import {PunchRecognizer} from '../src/vision/recognizer';
import type {Hand,PoseFrame,Stance} from '../src/shared/contracts';

// Image observations never change; only the independent world array moves.
function pose(sequence:number,extended?:Hand,low=false,stance:Stance='orthodox'):PoseFrame {
 const landmarks=Array.from({length:33},()=>({x:.5,y:.3,z:0,visibility:1}));
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){
  landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:-.02,visibility:1};
 }
 const worldLandmarks=structuredClone(landmarks);
 if(extended){const [e,w,x]=extended==='left'?[13,15,.35]:[14,16,.65];
  worldLandmarks[e]={x,y:low?.65:.43,z:-.3,visibility:1};
  worldLandmarks[w]={x,y:low?.85:.41,z:-.6,visibility:1};
 }
 return {schemaVersion:1,sessionId:'world-independent',sequence,timestampMs:sequence*100,stance,mirrored:false,tracking:'tracked',landmarks,worldLandmarks};
}
function held(r:PunchRecognizer,start:number,hand?:Hand,low=false,stance:Stance='orthodox'){
 return Array.from({length:3},(_,i)=>r.update(pose(start+i,hand,low,stance))).flat();
}
describe('world punch geometry and truthful extension diagnostics',()=>{
 it.each(['orthodox','southpaw'] as Stance[])('uses moving world coordinates throughout %s cycle despite static image',stance=>{
  for(const hand of ['left','right'] as Hand[]){
   const world=new PunchRecognizer('world-3d'),image=new PunchRecognizer('image-3d');
   const frames=Array.from({length:9},(_,i)=>pose(i,i>=3&&i<6?hand:undefined,false,stance));
   const events=frames.flatMap(f=>world.update(f));
   expect(events).toHaveLength(1);expect(events[0].hand).toBe(hand);
   expect(events[0].type).toBe(hand===(stance==='orthodox'?'left':'right')?'jab':'cross');
   expect(frames.flatMap(f=>image.update(f))).toEqual([]);
  }
 });
 it('reports height as the failed predicate for a straight low world arm',()=>{
  const r=new PunchRecognizer('world-3d');held(r,0);expect(held(r,3,'left',true)).toEqual([]);
  const arm=r.diagnostics().arms!.left;
  expect(arm.extension).toBeGreaterThan(.92);expect(arm.travel).toBeGreaterThan(.45);
  expect(arm.extensionChecks).toEqual({armed:true,notGuard:true,height:false,extension:true,travel:true});
  expect(arm.reason).toMatch(/height|below|shoulder/i);
 });
 it('does not claim extension passed when world arm stays bent in guard',()=>{
  const r=new PunchRecognizer('world-3d');held(r,0);
  const arm=r.diagnostics().arms!.left;
  expect(arm.extension).toBeLessThan(.92);expect(arm.extensionChecks.extension).toBe(false);
  expect(arm.extensionChecks.notGuard).toBe(false);expect(arm.extensionChecks.travel).toBe(false);
 });
});
