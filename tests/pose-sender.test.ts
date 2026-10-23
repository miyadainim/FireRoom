import {it,expect} from 'vitest';
import {createPoseSender} from '../src/companion/pose-sender';
import type {PoseFrame} from '../src/shared/contracts';
const frame=(t:number)=>({timestampMs:t,sequence:t,cameraConfigurationId:'a'} as PoseFrame);
const turn=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
it('preserves intervening pose observations in ordered bounded batches',async()=>{
 const batches:PoseFrame[][]=[];let done!:()=>void;
 const sender=createPoseSender(async fs=>{batches.push(fs);if(batches.length===1)await new Promise<void>(r=>done=r);},()=>{});
 sender.push(frame(0));for(let t=30;t<=150;t+=30)sender.push(frame(t));expect(batches).toHaveLength(1);
 done();await turn();expect(batches[1].map(f=>f.sequence)).toEqual([30,60,90,120,150]);sender.dispose();
});
it('bounds pending samples and discards observations older than350ms',async()=>{
 const batches:PoseFrame[][]=[];let done!:()=>void;
 const sender=createPoseSender(async fs=>{batches.push(fs);if(batches.length===1)await new Promise<void>(r=>done=r);},()=>{});
 sender.push(frame(0));for(let t=10;t<=500;t+=10)sender.push(frame(t));done();await turn();
 expect(batches[1]).toHaveLength(8);expect(batches[1][0].timestampMs).toBe(430);sender.dispose();
});
it('does not replay queued old punches after send failure or disposal',async()=>{
 let reject!:(e:Error)=>void;let calls=0,errors=0;
 const sender=createPoseSender(async()=>{calls++;await new Promise<void>((_,r)=>reject=r);},()=>errors++);
 sender.push(frame(0));sender.push(frame(10));reject(Error('offline'));await turn();expect(errors).toBe(1);expect(calls).toBe(1);
 sender.dispose();sender.push(frame(20));await turn();expect(calls).toBe(1);
});
