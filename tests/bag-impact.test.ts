import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GuidedBagImpacts} from '../src/game/bag-impact';
import {MovementCycleRecognizer} from '../src/vision/movement-cycle';
import {sampleVirtualBagReaction} from '../src/graphics/bag-impact';
import type {PoseFrame,Stance} from '../src/shared/contracts';
function pose(t:number,departure=0,stance:Stance='orthodox'):PoseFrame{
 const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:0,visibility:1};}
 landmarks[stance==='orthodox'?15:16].x+=(stance==='orthodox'?-1:1)*departure*.3;
 return {schemaVersion:1,sessionId:'fixture-bag',cameraConfigurationId:'camera-a',sequence:t+1,timestampMs:t,stance,tracking:'tracked',mirrored:false,landmarks};
}
const config=(stance:Stance='orthodox')=>({expected:'jab' as const,stance,startMs:300,endMs:5000});
function setup(stance:Stance='orthodox'){const bag=new GuidedBagImpacts();bag.start('attempt-a',config(stance),[pose(0,0,stance),pose(100,0,stance),pose(200,0,stance)]);return bag;}
describe('live supported outward virtual impacts (synthetic evidence only)',()=>{
 it.each(['orthodox','southpaw'] as const)('fires once before recovery, at first supported outward phase in %s',stance=>{
  const bag=setup(stance),cues=[];for(const [i,d] of [.4,.6,.5,.6,.5,0,0,0].entries())cues.push(...bag.receive(pose(300+i*100,d,stance)));
  expect(cues).toHaveLength(1);expect(cues[0]).toMatchObject({type:'jab',hand:stance==='orthodox'?'left':'right',kind:'virtual-outward-feedback'});expect(cues[0].observedAtMs).toBeLessThan(800);
 });
 it('does not emit during countdown, after stop, or after the attempt window',()=>{
  const bag=setup();expect(bag.receive(pose(250,.7))).toEqual([]);bag.stop();expect(bag.receive(pose(400,.8))).toEqual([]);
  bag.start('new',{...config(),endMs:350},[pose(0),pose(100),pose(200)]);expect(bag.receive(pose(400,.8))).toEqual([]);
 });
 it('does not react to guard positions, one-frame jitter, lowering or missing face anchors',()=>{
  for(const mode of ['guard','jitter','lowering','missing-eye','lost'] as const){const bag=setup(),hits=[];for(let i=0;i<10;i++){
   const f=pose(300+i*100,mode==='guard'?0:mode==='jitter'?(i===0?.6:0):Math.min(.6,(i+1)*.2));
   if(mode==='lowering')f.landmarks[15].y=.8;
   if(mode==='missing-eye')f.landmarks[2].visibility=0;
   if(mode==='lost'){f.tracking='lost';f.landmarks=[];}
   hits.push(...bag.receive(f));
  }expect(hits,mode).toEqual([]);}
 });
 it('starts fresh on retry, admits distinct cycles, and resets interrupted tracking',()=>{
  const bag=setup();const first=[.4,.6,.5,0,0,0].flatMap((d,i)=>bag.receive(pose(300+i*100,d)));expect(first).toHaveLength(1);
  const second=[0,0,.4,.6,.5,0,0,0].flatMap((d,i)=>bag.receive(pose(900+i*100,d)));expect(second).toHaveLength(1);expect(first[0].id).not.toBe(second[0].id);
  bag.start('retry',config(),[pose(0),pose(100),pose(200)]);expect([.4,.6,.5].flatMap((d,i)=>bag.receive(pose(300+i*100,d)))).toHaveLength(1);
 });
 it('replays the real supported jab with shoulder foreshortening and excludes its guard adjustment',()=>{
  const attempt=JSON.parse(readFileSync(new URL('../docs/validation/bag-impact/live-jab-attempt.json',import.meta.url),'utf8'));
  const bag=new GuidedBagImpacts();bag.start(attempt.recordingId,attempt.config,attempt.frames.filter((f:PoseFrame)=>f.timestampMs<attempt.config.startMs));
  const cues=attempt.frames.flatMap((f:PoseFrame)=>bag.receive(f));expect(cues).toHaveLength(1);expect(cues[0].type).toBe('jab');
  const jab=attempt.rules.punches[0];expect(jab.cycle.evidence.viewpointUncertain).toBe(true);expect(cues[0].observedAtMs).toBeLessThan(jab.cycle.timestamps.recoveryMs);
 });
 it('read-only live snapshots cannot change the completed assessment outcome',()=>{
  const a=new MovementCycleRecognizer(),b=new MovementCycleRecognizer(),ao=[],bo=[];
  for(const [i,d] of [0,0,0,.4,.6,.5,0,0,0].entries()){const f=pose(i*100,d);ao.push(...a.update(f));const snapshot=a.supportedOutwardMovements();expect(a.supportedOutwardMovements()).toEqual(snapshot);bo.push(...b.update(f));}
  expect(ao).toEqual(bo);expect(ao[0].classification).toBe('completed');
 });
 it('uses small authored backward/sway motion and settles exactly to rest',()=>{
  expect(sampleVirtualBagReaction(0,'jab')).toEqual({rotationX:0,backwardOffset:-0});
  expect(sampleVirtualBagReaction(100,'jab').backwardOffset).toBeLessThan(0);
  expect(sampleVirtualBagReaction(100,'cross').rotationX).toBeGreaterThan(sampleVirtualBagReaction(100,'jab').rotationX);
  for(let t=0;t<2600;t+=10){const s=sampleVirtualBagReaction(t,'cross');expect(Math.abs(s.rotationX)).toBeLessThan(.12);expect(Math.abs(s.backwardOffset)).toBeLessThan(.057);}
  expect(sampleVirtualBagReaction(2600,'jab')).toEqual({rotationX:0,backwardOffset:0});
 });
});
