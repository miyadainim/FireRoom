import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {ArcadeInput} from '../src/game/arcade-input';
import type {PoseFrame,Stance} from '../src/shared/contracts';
function pose(t:number,d=0,stance:Stance='orthodox'):PoseFrame {
 const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:0,visibility:1};}
 landmarks[stance==='orthodox'?15:16].x+=(stance==='orthodox'?-1:1)*d*.3;
 return {schemaVersion:1,sessionId:'arcade-fixture',cameraConfigurationId:'a',sequence:t+1,timestampMs:t,stance,tracking:'tracked',mirrored:false,landmarks};
}
function seed(input:ArcadeInput,stance:Stance='orthodox'){for(const t of [0,100,200])input.receive(pose(t,0,stance),t+10000);}
describe('continuous Arcade input (synthetic motion, not physical validation)',()=>{
 it.each(['orthodox','southpaw'] as const)('emits one early lead punch in %s without changing recovered contracts',stance=>{
  const input=new ArcadeInput();seed(input,stance);const punches=[.4,.6,.5,.6,.5,0,0,0].flatMap((d,i)=>input.receive(pose(300+i*100,d,stance),10300+i*100).punches);
  expect(punches).toHaveLength(1);expect(punches[0]).toMatchObject({type:'jab',hand:stance==='orthodox'?'left':'right'});expect(punches[0].timestampMs).toBeLessThan(800);
  expect(input.status(11000).punches).toEqual([]);
 });
 it.each(['orthodox','southpaw'] as const)('maps the rear hand to cross in %s',stance=>{
  const input=new ArcadeInput();seed(input,stance);const punches=[.4,.6,.5,0,0,0].flatMap((d,i)=>{const f=pose(300+i*100,0,stance);f.landmarks[stance==='orthodox'?16:15].x+=(stance==='orthodox'?1:-1)*d*.3;return input.receive(f,10300+i*100).punches;});
  expect(punches).toHaveLength(1);expect(punches[0]).toMatchObject({type:'cross',hand:stance==='orthodox'?'right':'left'});
 });
 it('replays the saved real jab without producing a guard-adjustment attack',()=>{
  const attempt=JSON.parse(readFileSync(new URL('../docs/validation/bag-impact/live-jab-attempt.json',import.meta.url),'utf8'));const input=new ArcadeInput();
  const cues=attempt.frames.flatMap((f:PoseFrame)=>input.receive(f,f.timestampMs+10000).punches);expect(cues).toHaveLength(1);expect(cues[0].type).toBe('jab');
 });
 it('uses receiver freshness and revokes held guard and motion continuity on loss',()=>{
  const input=new ArcadeInput();seed(input);expect(input.status(10200).guard).toBe('guard');expect(input.status(10551)).toMatchObject({guard:'unknown',tracking:'unavailable'});
  expect(input.receive(pose(300,.4),10600).guard).toBe('open');
  const lost=pose(400);lost.tracking='lost';lost.landmarks=[];expect(input.receive(lost,10700)).toMatchObject({guard:'unknown',tracking:'unavailable',punches:[]});
 });
 it('requires new guard after source, stance, camera or ordering changes',()=>{
  for(const change of ['session','camera','stance','ordering'] as const){const input=new ArcadeInput();seed(input);const f=pose(300,.5);
   if(change==='session')f.sessionId='new';if(change==='camera')f.cameraConfigurationId='new';if(change==='stance')f.stance='southpaw';if(change==='ordering')f.sequence=1;
   expect(input.receive(f,10300).punches).toEqual([]);expect(input.status(10300).guard).not.toBe('guard');
  }
 });
 it('never turns missing or low-confidence tracking into open defense or punches',()=>{
  for(const change of ['low-confidence','wrist','eye'] as const){const input=new ArcadeInput();seed(input);const f=pose(300,.6);
   if(change==='low-confidence'){f.tracking='low-confidence';f.landmarks[15].visibility=.2;}else f.landmarks[change==='eye'?2:15].visibility=.2;
   expect(input.receive(f,10300)).toMatchObject({guard:'unknown',tracking:'unavailable',punches:[]});
  }
 });
 it('does not revoke observable two-hand guard for elbow-only uncertainty',()=>{
  const input=new ArcadeInput();seed(input);const f=pose(300);f.tracking='low-confidence';f.landmarks[13].visibility=.2;
  expect(input.receive(f,10300)).toMatchObject({tracking:'ready',guard:'guard',punches:[]});
 });
 it('keeps lead movement continuity through rear-wrist occlusion but never emits during uncertainty',()=>{
  const input=new ArcadeInput();seed(input);
  const f=pose(300,.4);f.tracking='low-confidence';f.landmarks[16].visibility=.2;
  expect(input.receive(f,10300)).toMatchObject({tracking:'unavailable',guard:'unknown',punches:[]});
  const cues=[.6,.5,.6].flatMap((d,i)=>input.receive(pose(400+i*100,d),10400+i*100).punches);
  expect(cues).toHaveLength(1);expect(cues[0].type).toBe('jab');
 });
 it('shows raised hands immediately while waiting for blocking guard confirmation',()=>{
  const input=new ArcadeInput();expect(input.receive(pose(0),10000)).toMatchObject({guard:'open',handGuard:{left:'raised',right:'raised'}});
 });
 it('lowers only the visibly dropped glove after sustained height evidence',()=>{
  const input=new ArcadeInput();seed(input);
  const dropped=(t:number)=>{const f=pose(t);f.landmarks[15].y=.8;return f;};
  expect(input.receive(dropped(300),10300).handGuard).toEqual({left:'unknown',right:'raised'});
  input.receive(dropped(400),10400);
  expect(input.receive(dropped(500),10500).handGuard).toEqual({left:'lowered',right:'raised'});
  const lost=pose(600);lost.tracking='lost';lost.landmarks=[];
  expect(input.receive(lost,10600).handGuard).toEqual({left:'unknown',right:'unknown'});
  expect(input.receive(pose(700),10700).handGuard).toEqual({left:'raised',right:'raised'});
 });
 it('does not hit for stationary guard, lowering, jitter or an isolated displaced frame',()=>{
  for(const mode of ['guard','lower','jitter'] as const){const input=new ArcadeInput();seed(input);const hits=[];for(let i=0;i<8;i++){const f=pose(300+i*100,mode==='jitter'&&i===0?.6:0);if(mode==='lower')f.landmarks[15].y=.8;hits.push(...input.receive(f,10300+i*100).punches);}expect(hits,mode).toEqual([]);}
 });
 it('does not rearm or duplicate a supported outward hold while retiring settled adjustments',()=>{
  const input=new ArcadeInput();seed(input);const cues=[];
  for(const [t,d] of [[300,.4],[400,.6],[500,.6],[600,.6],[700,.6],[800,.6],[900,.6],[1000,.6],[1100,.6],[1200,0],[1300,0],[1400,0]])cues.push(...input.receive(pose(t,d),10000+t).punches);
  expect(cues).toHaveLength(1);expect(cues[0].type).toBe('jab');
 });
 it('labels reliably held lowered hands open and resets explicitly',()=>{
  const input=new ArcadeInput();for(let t=0;t<=400;t+=100){const f=pose(t);f.landmarks[15].y=.8;f.landmarks[16].y=.8;input.receive(f,t);}
  expect(input.status(400).guard).toBe('open');input.reset();expect(input.status(400)).toMatchObject({guard:'unknown',tracking:'unavailable'});
 });
});
