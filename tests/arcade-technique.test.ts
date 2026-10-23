import {describe,it,expect} from 'vitest';
import {ArcadeTechniqueEvidence} from '../src/game/arcade-technique';
import type {MovementCycleOutcome} from '../src/vision/movement-cycle';
import type {PoseFrame} from '../src/shared/contracts';
const frame=(t:number,drop=false):PoseFrame=>{const landmarks=Array.from({length:33},()=>({x:.5,y:.3,z:0,visibility:1}));landmarks[11]={x:.35,y:.45,z:0,visibility:1};landmarks[12]={x:.65,y:.45,z:0,visibility:1};landmarks[2].x=.45;landmarks[5].x=.55;landmarks[15]={x:.4,y:drop?.7:.3,z:0,visibility:1};landmarks[16]={x:.6,y:.3,z:0,visibility:1};return {schemaVersion:1,sessionId:'test',sequence:t+1,timestampMs:t,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks};};
const cue={sessionId:'test',hand:'left' as const,type:'jab' as const,departureMs:200,peakMs:400,observedAtMs:400,confidence:1};
describe('Arcade evidence bridge (synthetic, not physical validation)',()=>{
 it('holds recovery unknown on interruption and emits once',()=>{const e=new ArcadeTechniqueEvidence();[0,100,200].forEach(t=>e.observe(frame(t)));e.begin('id',cue);e.interrupt();expect(e.drain()).toEqual([expect.objectContaining({punchId:'id',startingGuard:'PASS',oppositeGuard:'UNKNOWN',recovery:'UNKNOWN'})]);e.interrupt();expect(e.drain()).toEqual([]);});
 it('bounds unresolved evidence without fabricating recovery',()=>{const e=new ArcadeTechniqueEvidence();[0,100,200,300,400].forEach(t=>e.observe(frame(t)));e.begin('id',cue);e.advance(2699);expect(e.drain()).toEqual([]);e.advance(2700);expect(e.drain()[0]).toMatchObject({startingGuard:'PASS',oppositeGuard:'PASS',recovery:'UNKNOWN'});e.advance(3000);expect(e.drain()).toEqual([]);});

 it('requires a real two-hand hold beyond wrist recovery before granting PASS',()=>{
  const e=new ArcadeTechniqueEvidence();[0,100,200,300,400].forEach(t=>e.observe(frame(t)));e.begin('["test",null,"orthodox","left",200]',cue);
  const outcome={sessionId:'test',hand:'left',timestamps:{departureMs:200,peakMs:400,recoveryMs:500,endMs:580},evidence:{movementObservation:{outwardEndMs:400}}} as MovementCycleOutcome;
  e.outcomes([outcome],'orthodox');e.observe(frame(500));e.observe(frame(580));e.advance(580);expect(e.drain()).toEqual([]);
  e.observe(frame(620));e.advance(620);expect(e.drain()[0]).toMatchObject({startingGuard:'PASS',oppositeGuard:'PASS',recovery:'PASS'});
 });
 it('reliable sustained missing return guard can FAIL after bounded recovery search',()=>{
  const e=new ArcadeTechniqueEvidence();[0,100,200,300,400].forEach(t=>e.observe(frame(t)));e.begin('["test",null,"orthodox","left",200]',cue);
  e.outcomes([{sessionId:'test',hand:'left',timestamps:{departureMs:200,peakMs:400,recoveryMs:500},evidence:{movementObservation:{outwardEndMs:400}}} as MovementCycleOutcome],'orthodox');
  for(let t=500;t<=2700;t+=100)e.observe(frame(t,true));e.advance(2700);expect(e.drain()[0].recovery).toBe('FAIL');
 });
 it('reset discards pending and completed evidence',()=>{const e=new ArcadeTechniqueEvidence();e.observe(frame(0));e.begin('id',cue);e.interrupt();e.reset();e.advance(3000);expect(e.drain()).toEqual([]);});
 it('does not treat a lone guard sample as a measured starting failure',()=>{const e=new ArcadeTechniqueEvidence();e.observe(frame(200));e.begin('id',cue);e.advance(2700);expect(e.drain()[0].startingGuard).toBe('UNKNOWN');});
});
