import {describe,it,expect} from 'vitest';
import {PoseReceiver} from '../src/platform/transport';
import {initialLesson,applyPunch} from '../src/game/coach';
import {askAtlas} from '../src/coach/atlas';
import type {PoseFrame,PunchEvent} from '../src/shared/contracts';
const pose=(sequence=0):PoseFrame=>({schemaVersion:1,sessionId:'test',sequence,timestampMs:42,mirrored:false,stance:'orthodox',tracking:'lost',landmarks:[]});
const punch=(type:'jab'|'cross',sequence=0):PunchEvent=>({schemaVersion:1,sessionId:'test',sequence,timestampMs:sequence*500,type,hand:type==='jab'?'left':'right',confidence:1,extension:1,guardMaintained:true,phase:'recovered'});
describe('pose transport',()=>{
 it('rejects invalid, wrong-session, duplicate and reordered packets',()=>{const r=new PoseReceiver('test');expect(r.accept({},0)).toBeNull();expect(r.accept({...pose(),sessionId:'other'},0)).toBeNull();expect(r.accept(pose(2),10)).not.toBeNull();expect(r.accept(pose(2),20)).toBeNull();expect(r.accept(pose(1),20)).toBeNull();expect(r.status(20).lastSequence).toBe(2)});
 it('uses receiver arrival clock for staleness and recovers on a new frame',()=>{const r=new PoseReceiver('test');expect(r.status(0).status).toBe('disconnected');r.accept(pose(),1000);expect(r.status(1750).status).toBe('connected');expect(r.status(1751).status).toBe('stale');expect(r.status(1751).error).toBe('STALE_MESSAGE');r.accept(pose(1),2000);expect(r.status(2001).status).toBe('connected')});
 it('does not advance freshness on rejected frames',()=>{const r=new PoseReceiver('test');r.accept(pose(),0);r.accept(pose(),700);expect(r.status(751).status).toBe('stale')});
});
describe('Coach Mode ordered lesson',()=>{
 it('rejects cross-jab as a completed jab-cross, and completes three correct repetitions',()=>{let state=initialLesson();state=applyPunch(state,punch('cross')).state;expect(state.repetitions).toBe(0);state=applyPunch(state,punch('jab',1)).state;expect(state.repetitions).toBe(0);state=applyPunch(state,punch('cross',2)).state;expect(state.repetitions).toBe(1);for(let i=0;i<2;i++){state=applyPunch(state,punch('jab',3+i*2)).state;state=applyPunch(state,punch('cross',4+i*2)).state;}expect(state.phase).toBe('complete');expect(state.score).toBe(600);expect(applyPunch(state,punch('jab',7)).state).toEqual(state)});
 it('supports progressive jab-only lessons and labels virtual score limitations',()=>{const result=applyPunch(initialLesson('jab'),punch('jab'));expect(result.state.repetitions).toBe(1);expect(result.report.limitations.join(' ')).toMatch(/not punch force/);expect(result.report.observations).toContain('Expected punch recovered.')});
});
describe('Atlas fallback and action permissions',()=>{
 it('reports absence of evidence and bounded replay action offline',async()=>{const r=await askAtlas('replay',null);expect(r.source).toBe('offline');expect(r.text).toMatch(/No observed punch evidence/);expect(r.action).toEqual({schemaVersion:1,type:'replay_combo'})});
 it('uses report evidence in offline response and falls back after provider failure',async()=>{const report=applyPunch(initialLesson(),punch('jab')).report;const r=await askAtlas('summary',report,{answer:async()=>{throw new Error('offline')}});expect(r.source).toBe('offline');expect(r.text).toContain(report.observations[0]);expect(r.action).toEqual({schemaVersion:1,type:'get_performance_summary'})});
 it('ignores ungrounded provider claims and renders report observations',async()=>{const report=applyPunch(initialLesson(),punch('jab')).report;const r=await askAtlas('how hard?',report,{answer:async()=>({text:'Measured force is 9000 newtons and injury risk is low.'})});expect(r.text).toContain(report.observations[0]);expect(r.text).not.toMatch(/9000|injury/)});
 it('filters arbitrary provider actions',async()=>{const r=await askAtlas('anything',null,{answer:async()=>({text:'test',action:{type:'execute',command:'unsafe'}})});expect(r.source).toBe('provider');expect(r.action).toBeUndefined()});
});

import {PunchRecognizer} from '../src/vision/recognizer';
describe('synthetic pose-to-Coach Mode vertical pipeline',()=>{
 it('recognizes recovered anatomical jab-cross cycles into a completed lesson',()=>{
  const recognizer=new PunchRecognizer();let state=initialLesson();let sequence=0;let count=0;
  const send=(extended?:'left'|'right')=>{
   const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));
   landmarks[0]={x:.5,y:.3,z:0,visibility:1};
   for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:-.02,visibility:1};}
   if(extended){const [e,w,x]=extended==='left'?[13,15,.35]:[14,16,.65];landmarks[e]={x,y:.43,z:-.3,visibility:1};landmarks[w]={x,y:.41,z:-.6,visibility:1};}
   for(const event of recognizer.update({...pose(sequence),timestampMs:sequence*100,tracking:'tracked',landmarks})){state=applyPunch(state,event).state;count++;}sequence++;
  };
  for(let i=0;i<3;i++)for(const hand of ['left','right'] as const){send();send();send(hand);send();send();send();}
  expect(count).toBe(6);expect(state.repetitions).toBe(3);expect(state.phase).toBe('complete');expect(state.score).toBeGreaterThan(500);
 });
});

import {producerClock} from '../src/companion/sequence';
describe('persisted companion producer clock',()=>{
 const storage=()=>{const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value)}}};
 it('keeps sequence and timestamps increasing across camera restarts and document reloads',()=>{
  const saved=storage();let now=500;const clock=producerClock('test',saved,()=>now);const receiver=new PoseReceiver('test');
  const first=clock();expect(receiver.accept({...pose(),...first},1000)).not.toBeNull();now=600;
  const restarted=clock();expect(restarted.sequence).toBe(first.sequence+1);expect(receiver.accept({...pose(),...restarted},1100)).not.toBeNull();
  now=0;const reloaded=producerClock('test',saved,()=>now);const next=reloaded();expect(next.sequence).toBe(restarted.sequence+1);expect(next.timestampMs).toBeGreaterThan(restarted.timestampMs);expect(receiver.accept({...pose(),...next},1200)).not.toBeNull();
 });
 it('preserves strict producer time ordering even when sampled at the same local time',()=>{const clock=producerClock('test',storage(),()=>0);const first=clock(),second=clock();expect(second.sequence).toBe(first.sequence+1);expect(second.timestampMs).toBeGreaterThan(first.timestampMs)});
 it('isolates independent sessions',()=>{const saved=storage(),a=producerClock('a',saved,()=>0),b=producerClock('b',saved,()=>0);a();a();expect(b().sequence).toBe(0);expect(producerClock('a',saved,()=>0)().sequence).toBe(2)});
 it('surfaces storage writes that fail rather than returning a reusable envelope',()=>{const clock=producerClock('test',{getItem:()=>null,setItem:()=>{throw new Error('storage denied')}},()=>0);expect(()=>clock()).toThrow('storage denied')});
});
