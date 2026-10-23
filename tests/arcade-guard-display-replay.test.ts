import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {ArcadeInput} from '../src/game/arcade-input';
import type {PoseFrame} from '../src/shared/contracts';
it('does not depict visible raised hands as dropped while blocking guard is unconfirmed in saved live data',()=>{
 const capture=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-arcade-live-validation.json',import.meta.url),'utf8'));
 const input=new ArcadeInput();let raisedWhileUnconfirmed=0,lost=0;
 for(const sample of capture.samples as {frame:PoseFrame;arrivalMs:number}[]){
  const state=input.receive(sample.frame,sample.arrivalMs);
  if(state.guard==='open'&&state.handGuard?.left==='raised'&&state.handGuard.right==='raised')raisedWhileUnconfirmed++;
  if(sample.frame.tracking==='lost'){lost++;expect(state.handGuard).toEqual({left:'unknown',right:'unknown'});}
 }
 expect(raisedWhileUnconfirmed).toBeGreaterThan(0);expect(lost).toBe(142);
});
