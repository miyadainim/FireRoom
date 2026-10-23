import {describe,it,expect} from 'vitest';
import {MovementCycleRecognizer,assessMovementExtension} from '../src/vision/movement-cycle';
import type {PoseFrame,Stance} from '../src/shared/contracts';
function pose(t:number,departure=0,stance:Stance='orthodox'):PoseFrame{
 const landmarks=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}));
 landmarks[0]={x:.5,y:.3,z:0,visibility:1};
 for(const [s,e,w,x] of [[11,13,15,.35],[12,14,16,.65]]){landmarks[s]={x,y:.45,z:0,visibility:1};landmarks[e]={x,y:.65,z:0,visibility:1};landmarks[w]={x,y:.35,z:0,visibility:1};}
 landmarks[15].x-=departure*.3;
 return {schemaVersion:1,sessionId:'synthetic',sequence:t,timestampMs:t,stance,tracking:'tracked',mirrored:false,landmarks};
}
function cycle(r:MovementCycleRecognizer,step=100,mutate?:(p:PoseFrame)=>void){return [0,0,0,.4,.6,.5,0,0,0].flatMap((d,i)=>{const p=pose(i*step,d);mutate?.(p);return r.update(p);});}
describe('timestamp wrist movement cycles (synthetic, not physical validation)',()=>{
 it.each([80,100,150])('recognizes bent elbow movement with %dms cadence',step=>{const results=cycle(new MovementCycleRecognizer(),step);expect(results).toHaveLength(1);expect(results[0].classification).toBe('completed');expect(results[0].type).toBe('jab');expect(results[0].timestamps.recoveryMs).toBeGreaterThan(results[0].timestamps.departureMs);});
 it('keeps elbow-only occlusion after guard separate from wrist evidence',()=>{const results=cycle(new MovementCycleRecognizer(),100,p=>{if(p.timestampMs>=300&&p.timestampMs<=500){p.landmarks[13].visibility=.1;p.tracking='low-confidence';}});expect(results[0].classification).toBe('completed');expect(results[0].trackingQuality.elbowObservedSamples).toBeLessThan(results[0].trackingQuality.acceptedSamples);});
 it('does not require opposite elbow confidence',()=>{const results=cycle(new MovementCycleRecognizer(),100,p=>{if(p.timestampMs>=300)p.landmarks[14].visibility=.1;});expect(results[0].classification).toBe('completed');});
 it('maps anatomical left to cross in southpaw',()=>{const results=cycle(new MovementCycleRecognizer(),100,p=>{p.stance='southpaw';});expect(results[0].type).toBe('cross');});
 it('labels small returned movement as adjustment',()=>{const r=new MovementCycleRecognizer();const outcomes=[0,0,0,.25,.26,0,0,0].flatMap((d,i)=>r.update(pose(i*100,d)));expect(outcomes[0].classification).toBe('guard-adjustment');});
 it('abstains after wrist loss and does not bridge it',()=>{const results=cycle(new MovementCycleRecognizer(),100,p=>{if(p.timestampMs===400)p.landmarks[15].visibility=.1;});expect(results.some(v=>v.classification==='uncertain')).toBe(true);expect(results.some(v=>v.classification==='completed')).toBe(false);});
 it('flushes incomplete movements',()=>{const r=new MovementCycleRecognizer();[0,0,0,.4,.6].forEach((d,i)=>r.update(pose(i*100,d)));expect(r.flush(500)[0].classification).toBe('partial');expect(r.flush(600)).toEqual([]);});
 it('does not count translation of the whole body as departure',()=>{const results=cycle(new MovementCycleRecognizer(),100,p=>{p.landmarks[15].x=.35;for(const l of p.landmarks)l.x+=p.timestampMs*.0001;});expect(results).toEqual([]);});
 it('reports interrupted cycle on camera metadata change',()=>{const r=new MovementCycleRecognizer();[0,0,0,.4].forEach((d,i)=>r.update(pose(i*100,d)));const p=pose(400,.5);p.cameraConfigurationId='new';expect(r.update(p)[0].classification).toBe('uncertain');});
 it('never declares physical form or feint intent from motion',()=>{expect(cycle(new MovementCycleRecognizer())[0].evidence.limitations.join()).toContain('feints');});
 it('separate extension assessment abstains without validated compatible reference',()=>{expect(assessMovementExtension({hand:'left',reliable:true,reach:1}).status).toBe('cannot-assess');expect(assessMovementExtension({hand:'left',reliable:true,reach:1,cameraConfigurationId:'a'},{hand:'left',cameraConfigurationId:'b',validated:true,extended:1,short:.5,units:'shoulder-spans'}).status).toBe('cannot-assess');});
 it('refreshes sustained compact guard instead of accumulating stale-origin drift',()=>{const r=new MovementCycleRecognizer();const outcomes=[];for(let i=0;i<200;i++)outcomes.push(...r.update(pose(i*100,Math.min(.25,i*.002))));outcomes.push(...r.flush(20000));expect(outcomes).toEqual([]);});
 it.each([80,125])('does not chase a coherent slow short punch at %d ms cadence',step=>{const r=new MovementCycleRecognizer();const out=[];for(let i=0;i<6;i++)out.push(...r.update(pose(i*step)));let t=6*step;for(const d of [.04,.08,.12,.16,.20,.24,.28,.32,.36,.4,.4,.32,.24,.16,.08,0,0,0]){out.push(...r.update(pose(t,d)));t+=step;}expect(out.filter(v=>v.classification==='completed')).toHaveLength(1);});
 it('reports sustained hand lowering as uncertain rather than a failed partial punch',()=>{const r=new MovementCycleRecognizer();const out=[];for(const [i,d] of [0,0,0,.4,.5].entries())out.push(...r.update(pose(i*100,d)));for(let t=500;t<=900;t+=100){const p=pose(t,.4);p.landmarks[15].y=.65;out.push(...r.update(p));}out.push(...r.flush(1000));expect(out.some(v=>v.classification==='partial')).toBe(false);expect(out.find(v=>v.classification==='uncertain')?.evidence.reason).toContain('lowering');});
 it('does not start an outward phase from one unsupported departure sample',()=>{const r=new MovementCycleRecognizer();const out=[0,0,0,.3,0,0,0].flatMap((d,i)=>r.update(pose(i*100,d)));expect(out).toEqual([]);expect(r.flush(800)).toEqual([]);});

 it('does not anchor camera geometry while the player is still setting up before guard',()=>{const r=new MovementCycleRecognizer();const initial=pose(0);initial.landmarks=initial.landmarks.map(l=>({...l,x:.5+(l.x-.5)*1.8,y:.45+(l.y-.45)*1.8}));initial.landmarks[15].y=.9;initial.landmarks[16].y=.9;r.update(initial);const results=[0,0,0,.4,.6,.5,0,0,0].flatMap((d,i)=>r.update(pose((i+1)*100,d)));expect(results.filter(v=>v.classification==='completed')).toHaveLength(1);expect(results[0].evidence.viewpointUncertain).toBe(false);});

});
