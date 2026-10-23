import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {ArcadeInput} from '../src/game/arcade-input';
import type {PoseFrame} from '../src/shared/contracts';
interface Capture {samples:{frame:PoseFrame;arrivalMs:number}[];transport:{kind:string;atMs?:number;lastReceivedSequence?:number;tracking?:string}[]}
it('reproduces the captured RAF timestamp race and keeps the fresh frame valid with current receiver time',()=>{
 const capture=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-arcade-live-validation (2).json',import.meta.url),'utf8')) as Capture;
 const race=capture.transport.find(e=>e.kind==='tracking-transition'&&e.tracking==='unavailable'&&capture.samples.some(s=>s.frame.sequence===e.lastReceivedSequence&&s.arrivalMs>e.atMs!&&s.arrivalMs-e.atMs!<1));
 expect(race).toBeDefined();
 const sample=capture.samples.find(s=>s.frame.sequence===race!.lastReceivedSequence)!;
 const oldClock=new ArcadeInput(),currentClock=new ArcadeInput();
 for(const s of capture.samples){oldClock.receive(s.frame,s.arrivalMs);currentClock.receive(s.frame,s.arrivalMs);if(s===sample)break;}
 // A RAF timestamp denotes frame start; HTTP completion may already have run.
 expect(oldClock.status(race!.atMs!).tracking).toBe('unavailable');
 expect(currentClock.status(sample.arrivalMs+.1).tracking).toBe('ready');
 // Actual lost updates still become stale at the unchanged 350ms boundary.
 expect(currentClock.status(sample.arrivalMs+351).tracking).toBe('unavailable');
});
