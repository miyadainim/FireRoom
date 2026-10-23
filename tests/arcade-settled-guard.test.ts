import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {ArcadeInput} from '../src/game/arcade-input';
import {MovementCycleRecognizer} from '../src/vision/movement-cycle';
import type {PoseFrame} from '../src/shared/contracts';
function samples(n:number):{frame:PoseFrame;arrivalMs:number}[]{return JSON.parse(readFileSync(new URL(`../fireroom_trials/fireroom-arcade-live-validation (${n}).json`,import.meta.url),'utf8')).samples;}
it('preserves all ten confirmed jabs without adding cross events in the first new live trial',()=>{
 const input=new ArcadeInput();const cues=samples(4).flatMap(s=>input.receive(s.frame,s.arrivalMs).punches.map(c=>({...c,arrivalMs:s.arrivalMs}))).filter(c=>c.arrivalMs>=273000&&c.arrivalMs<284000);
 expect(cues.map(c=>c.type)).toEqual(Array(10).fill('jab'));expect(new Set(cues.map(c=>c.id)).size).toBe(10);
});
it('retires a settled unsupported candidate before the final saved jab-cross without inventing an event for the guard hold',()=>{
 const input=new ArcadeInput(),baseline=new MovementCycleRecognizer();const cues:{type:string;at:number}[]=[],old:{type:string;at:number}[]=[];
 for(const s of samples(5)){
  baseline.update(s.frame);if(s.arrivalMs>=350000)for(const c of baseline.supportedOutwardMovements())if(!old.some(v=>v.type===c.type&&v.at===c.departureMs))old.push({type:c.type,at:c.departureMs});
  const result=input.receive(s.frame,s.arrivalMs);if(s.arrivalMs>=350000)cues.push(...result.punches.map(c=>({type:c.type,at:s.arrivalMs})));
 }
 expect(old.filter(c=>c.type==='cross')).toHaveLength(1);
 expect(cues.map(c=>c.type)).toEqual(['jab','jab','cross','jab','jab','jab','cross']);
 expect(cues[cues.length-1]).toMatchObject({type:'cross'});expect(cues[cues.length-1]!.at).toBeCloseTo(356324.4,1);
 expect(cues.filter(c=>c.at>356800&&c.at<358000)).toHaveLength(0);
});
