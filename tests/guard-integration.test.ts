import {describe,it,expect} from 'vitest';
import {PunchRecognizer} from '../src/vision/recognizer';
import type {PoseFrame} from '../src/shared/contracts';
function pose(n:number,extended=false):PoseFrame{
 const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));
 landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:-.02,visibility:1};}
 if(extended){landmarks[13]={x:.35,y:.43,z:-.3,visibility:1};landmarks[15]={x:.35,y:.41,z:-.6,visibility:1};}
 return {schemaVersion:1,sessionId:'guard-vv',sequence:n,timestampMs:n*100,stance:'orthodox',mirrored:false,tracking:'tracked',landmarks};
}
describe('independent guard-to-punch acceptance',()=>{
 it('single-frame pass near face never arms a punch',()=>{const r=new PunchRecognizer();r.update(pose(0));expect(r.diagnostics().arms?.left.phase).toBe('idle');r.update(pose(1,true));expect([pose(2),pose(3),pose(4)].flatMap(f=>r.update(f))).toEqual([]);});
 it('requires controlled stable recovery and retains extension until then',()=>{const r=new PunchRecognizer();r.update(pose(0));r.update(pose(1));r.update(pose(2,true));expect(r.diagnostics().arms?.left.phase).toBe('extended');expect(r.update(pose(3))).toEqual([]);expect(r.diagnostics().arms?.left.phase).toBe('extended');expect(r.update(pose(4))).toEqual([]);const events=r.update(pose(5));expect(events).toHaveLength(1);expect(events[0].type).toBe('jab');expect(events[0].guardMaintained).toBe(true);});
 it('missing face cannot fall back to shoulder-only guard',()=>{const r=new PunchRecognizer();r.update(pose(0));r.update(pose(1));r.update(pose(2,true));const missing=pose(3);missing.landmarks[0].visibility=.1;expect(r.update(missing)).toEqual([]);expect(r.diagnostics().reason).toMatch(/unavailable|nose/i);expect([pose(4),pose(5),pose(6)].flatMap(f=>r.update(f))).toEqual([]);});
 it('tracking loss discards both history and an extended punch',()=>{const r=new PunchRecognizer();r.update(pose(0));r.update(pose(1));r.update(pose(2,true));r.update({...pose(3),tracking:'lost',landmarks:[]});r.update(pose(4));expect(r.diagnostics().arms?.left.phase).toBe('idle');expect(r.update(pose(5,true))).toEqual([]);expect([pose(6),pose(7),pose(8)].flatMap(f=>r.update(f))).toEqual([]);});
 it('observed lowered opposite hand honestly fails guard maintenance',()=>{const r=new PunchRecognizer();r.update(pose(0));r.update(pose(1));const f=pose(2,true);f.landmarks[16].y=.9;r.update(f);expect([pose(3),pose(4),pose(5)].flatMap(p=>r.update(p))[0]?.guardMaintained).toBe(false);});
});
