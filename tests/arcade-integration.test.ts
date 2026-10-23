import {readFileSync,existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {describe,it,expect} from 'vitest';
import {ArcadeInput} from '../src/game/arcade-input';
import {ArcadeRound} from '../src/game/arcade';
import type {PoseFrame} from '../src/shared/contracts';
function replay(frames:PoseFrame[]){
 const input=new ArcadeInput(),round=new ArcadeRound(0);const cues:ReturnType<ArcadeInput['receive']>['punches']=[];const accepted=[];let resumes=0,pauses=0,lastPause=0;
 for(const frame of frames){const now=frame.timestampMs;const state=input.receive(frame,now);
  round.setTracking({reliable:state.tracking==='ready',guard:state.guard==='guard'?'raised':state.guard==='open'?'lowered':'unknown'},now);
  const snapshot=round.snapshot();if(snapshot.lastEvent?.type==='pause'&&snapshot.lastEvent.id!==lastPause){pauses++;lastPause=snapshot.lastEvent.id;}
  if(snapshot.status==='ready'&&state.tracking==='ready')round.start(now);
  // Explicit simulated user Resume after recovery. Production never auto-resumes.
  if(round.snapshot().status==='paused'&&state.tracking==='ready'){if(round.resume(now))resumes++;}
  for(const cue of state.punches){cues.push(cue);const result=round.punch(cue,now);if(result.accepted)accepted.push({type:cue.type,outcome:result.outcome});}
  round.tick(now);
 }
 return {cues,accepted,resumes,pauses,snapshot:round.snapshot()};
}
describe('actual recorded inputs through Arcade adapter and combat resolver',()=>{
 it('executes the previous real guided jab without pausing on reliable departure',()=>{
  const data=JSON.parse(readFileSync(new URL('../docs/validation/bag-impact/live-jab-attempt.json',import.meta.url),'utf8'));
  const result=replay(data.frames);expect(result.cues).toHaveLength(1);expect(result.accepted).toHaveLength(1);expect(result.accepted[0].type).toBe('jab');expect(result.pauses).toBe(0);
 });
 for(const number of [2,4,11]){
  const candidates=(process.env.FIREROOM_TRACKING_FIXTURE_DIR?[process.env.FIREROOM_TRACKING_FIXTURE_DIR]:[`${homedir()}/Downloads/Telegram Desktop`,`${homedir()}/Downloads`]).map(dir=>`${dir}/fireroom-tracking-lab (${number}).json`);
  const path=candidates.find(p=>existsSync(p))??candidates[0];
  it.skipIf(!existsSync(path))(`routes saved Full lab (${number}) through the real resolver with explicit recovery resumes`,()=>{
   const data=JSON.parse(readFileSync(path,'utf8')),run=data.runs.find((r:{model:string})=>r.model==='full');
   const result=replay(run.samples.map((s:{frame:PoseFrame;videoTimeMs:number})=>({...s.frame,timestampMs:s.videoTimeMs})));
   console.info(`Recorded Full lab (${number}): ${JSON.stringify({cues:result.cues.map(p=>p.type),accepted:result.accepted,pauses:result.pauses,explicitResumes:result.resumes,stats:result.snapshot.stats})}`);
   expect(result.cues.filter(p=>p.type==='jab')).toHaveLength(4);expect(result.cues.filter(p=>p.type==='cross')).toHaveLength(4);
   if(number===11)expect(result.cues.filter(p=>(p.timestampMs>=13000&&p.timestampMs<=14000)||(p.timestampMs>=51000&&p.timestampMs<=54000))).toHaveLength(0);
   expect(result.accepted).toHaveLength(result.cues.length);expect(result.snapshot.stats.punches).toBe(result.accepted.length);
   expect(result.accepted.some(p=>p.type==='jab')).toBe(true);expect(result.accepted.some(p=>p.type==='cross')).toBe(true);
  });
 }
});
