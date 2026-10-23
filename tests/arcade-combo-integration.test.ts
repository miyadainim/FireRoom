import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {ArcadeRound} from '../src/game/arcade';
import {ArcadeInput} from '../src/game/arcade-input';
import type {PoseFrame} from '../src/shared/contracts';

const read=(path:string)=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
interface Cue {arrivalMs:number;id:string;type:'jab'|'cross';confidence:number;result:{accepted:boolean;reason:string}}
const pilot:Cue[]=read('../docs/validation/arcade-live/pilot-events.json')
 .filter((event:{message:string})=>event.message.startsWith('FIREROOM_ARCADE_PUNCH '))
 .map((event:{message:string})=>JSON.parse(event.message.slice('FIREROOM_ARCADE_PUNCH '.length)));
function running(){const round=new ArcadeRound();round.setTracking({reliable:true,guard:'raised'},0);round.start(0);return round;}
function advance(round:ArcadeRound,from:number,to:number){for(let at=from;at<to;){at=Math.min(to,at+100);round.setTracking({reliable:true,guard:'raised'},at);round.tick(at);}}

describe('saved Arcade jab-cross integration (replay evidence, not recognition accuracy)',()=>{
 it('executes the two real cross cues formerly rejected by the global cooldown at their recorded receiver intervals',()=>{
  const dropped=pilot.filter(cue=>cue.type==='cross'&&cue.result.reason==='Punch cooldown.');
  expect(dropped).toHaveLength(2);
  for(const cross of dropped){
   const jab=pilot[pilot.indexOf(cross)-1];expect(jab.type).toBe('jab');
   const interval=cross.arrivalMs-jab.arrivalMs;expect(interval).toBeGreaterThan(240);expect(interval).toBeLessThan(242);
   const round=running();advance(round,0,3000);
   expect(round.punch(jab,3000)).toMatchObject({accepted:true,outcome:'hit',damage:10});
   advance(round,3000,3000+interval);
   expect(round.punch(cross,3000+interval)).toMatchObject({accepted:true,outcome:'hit',damage:14});
   expect(round.snapshot().stats).toMatchObject({punches:2,hits:2});
   expect(round.snapshot().opponentHealth).toBe(76);
  }
 });
 it('retains duplicate, same-type cooldown, weak-evidence and paused-round exclusions',()=>{
  const round=running();advance(round,0,3000);const jab={id:'jab-a',type:'jab' as const,confidence:1};
  expect(round.punch(jab,3000).accepted).toBe(true);
  expect(round.punch(jab,3001)).toMatchObject({accepted:false,reason:'Duplicate movement.'});
  expect(round.punch({...jab,id:'jab-b'},3100).accepted).toBe(false);
  expect(round.punch({id:'cross-low',type:'cross',confidence:.64},3101).accepted).toBe(false);
  round.pause(3102);expect(round.punch({id:'cross-paused',type:'cross',confidence:1},3103).accepted).toBe(false);
  expect(round.snapshot().stats.punches).toBe(1);
 });
 it('replays a saved real prescribed jab-cross through continuous input and executes both types',()=>{
  const recording=read('../fireroom_trials/fireroom-prescribed-attempt (11).json');
  expect(recording.config.expected).toBe('jab-cross');
  const input=new ArcadeInput(),round=running();let now=0;const accepted:string[]=[];
  const first=recording.frames[0].timestampMs;
  for(const frame of recording.frames as PoseFrame[]){
   const arrival=frame.timestampMs-first;advance(round,now,arrival);now=arrival;
   const state=input.receive(frame,arrival);
   for(const cue of state.punches)if(round.punch(cue,arrival).accepted)accepted.push(cue.type);
  }
  expect(accepted).toContain('jab');expect(accepted).toContain('cross');
 });
});
