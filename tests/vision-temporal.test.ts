import {describe,it,expect} from 'vitest';
import {PunchRecognizer} from '../src/vision/recognizer';
import type {PoseFrame,Hand} from '../src/shared/contracts';
function pose(n:number,extended:Hand[]=[]):PoseFrame{
 const landmarks=Array.from({length:33},()=>({x:0.5,y:0.5,z:0,visibility:1}));
 landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x,h] of [[11,13,15,0.35,'left'],[12,14,16,0.65,'right']] as const){
  landmarks[s]={x,y:0.45,z:0,visibility:1};landmarks[e]={x,y:0.65,z:0,visibility:1};landmarks[w]={x,y:0.35,z:-0.02,visibility:1};
  if(extended.includes(h)){landmarks[e]={x,y:0.43,z:-0.3,visibility:1};landmarks[w]={x,y:0.41,z:-0.6,visibility:1};}
 }
 return {schemaVersion:1,sessionId:'temporal',sequence:n,timestampMs:n*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks};
}
describe('original temporal recognition rules',()=>{
 it('retains onset order when cross recovers first',()=>{const r=new PunchRecognizer();observe(r,pose(0));observe(r,pose(1,['left']));observe(r,pose(2,['left','right']));expect(observe(r,pose(3,['left']))).toEqual([]);const events=observe(r,pose(4));expect(events.map(e=>e.type)).toEqual(['jab','cross']);expect(events.map(e=>e.sequence)).toEqual([0,1]);expect(events.every(e=>e.timestampMs===1400)).toBe(true);});
 it('rejects ambiguous same-frame extension and rearms only from guard',()=>{const r=new PunchRecognizer();observe(r,pose(0));r.update({...pose(1,['left','right']),sequence:3,timestampMs:300});expect(r.diagnostics().reason).toContain('Ambiguous');expect(observe(r,pose(2))).toEqual([]);observe(r,pose(3,['left']));expect(observe(r,pose(4)).map(e=>e.type)).toEqual(['jab']);});
 it('never arms lowered hands',()=>{const r=new PunchRecognizer();const p=pose(0);p.landmarks[15].y=0.6;p.landmarks[16].y=0.6;observe(r,p);expect(r.diagnostics().arms?.left.guard).toBe(false);observe(r,pose(1,['left']));expect(observe(r,pose(2))).toEqual([]);});
 it('removes rigid whole-body translation from travel and speed',()=>{const r=new PunchRecognizer();observe(r,pose(0));const p=pose(1);p.landmarks=p.landmarks.map(l=>({...l,x:l.x+0.2,z:l.z-0.3}));observe(r,p);expect(r.diagnostics().arms?.left.travel).toBeCloseTo(0);expect(r.diagnostics().arms?.left.speed).toBeCloseTo(0);expect(observe(r,pose(2))).toEqual([]);});
 it('keeps a long held guard ready without timing out',()=>{const r=new PunchRecognizer();for(let i=0;i<30;i++)observe(r,pose(i));observe(r,pose(30,['left']));expect(observe(r,pose(31))).toHaveLength(1);});
 it('does not repeat a held extension or count extension without fresh guard',()=>{const r=new PunchRecognizer();observe(r,pose(0));for(let i=1;i<5;i++)expect(observe(r,pose(i,['left']))).toEqual([]);expect(observe(r,pose(5))).toHaveLength(1);expect(observe(r,pose(6,['left']))).toEqual([]);expect(observe(r,pose(7))).toEqual([]);});
 it.each(['lost','timeout'] as const)('discards buffered recoveries after %s',kind=>{const r=new PunchRecognizer();observe(r,pose(0));observe(r,pose(1,['left']));observe(r,pose(2,['left','right']));observe(r,pose(3,['left']));if(kind==='lost')observe(r,{...pose(4),tracking:'lost',landmarks:[]});else for(let i=4;i<21;i++)observe(r,pose(i,['left']));expect(observe(r,pose(21))).toEqual([]);});
 it('normalizes diagnostic speed by elapsed frame time',()=>{const run=(ms:number)=>{const r=new PunchRecognizer();r.update(pose(0));r.update(pose(1));const p=pose(2,['left']);p.timestampMs=100+ms;r.update(p);return r.diagnostics().arms!.left.speed;};expect(run(100)).toBeGreaterThan(0);expect(run(100)).toBeCloseTo(run(200)*2);});
});

// Each legacy fixture observation is held for 200ms at 100ms intervals.
// This preserves its geometric intent while supplying the newly required guard history.
function observe(r:PunchRecognizer, f:PoseFrame){
 const events=[];
 for(let i=0;i<3;i++)events.push(...r.update({...f,sequence:f.sequence*3+i,timestampMs:f.timestampMs*3+i*100}));
 return events;
}
