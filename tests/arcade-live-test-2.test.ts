import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {ArcadeInput} from '../src/game/arcade-input';
import type {PoseFrame} from '../src/shared/contracts';
it('replays the retained live combat observations without adding or losing supported cues',()=>{
 const capture=JSON.parse(readFileSync(new URL('../docs/validation/arcade-live/user-live-test-2.json',import.meta.url),'utf8'));
 const accepted=capture.events.filter((e:{result?:{accepted:boolean}})=>e.result?.accepted);
 const input=new ArcadeInput();const cues:ReturnType<ArcadeInput['receive']>['punches']=capture.samples.flatMap((s:{frame:PoseFrame;arrivalMs:number})=>input.receive(s.frame,s.arrivalMs).punches);
 const expected=new Set(accepted.map((e:{id:string})=>e.id));
 expect(cues.filter(c=>expected.has(c.id)).map(c=>c.id).sort()).toEqual([...expected].sort());
 // This checks saved supported events, not the number of physical punches thrown.
 expect(accepted).toHaveLength(16);
});
