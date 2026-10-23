import {describe,it,expect} from 'vitest';
import {ArcadeRound} from '../src/game/arcade';
function setup(guard:'raised'|'lowered'='raised'){const r=new ArcadeRound();r.setTracking({reliable:true,guard},0);r.start(0);return r;}
function advance(r:ArcadeRound,end:number,guard:'raised'|'lowered'='raised'){let now=r.snapshot().elapsedMs;while(now<end){now=Math.min(end,now+100);r.setTracking({reliable:true,guard},now);r.tick(now);}return r.snapshot();}
describe('Arcade deterministic round',()=>{
 it('requires observable tracking and explicit resume',()=>{const r=new ArcadeRound();expect(r.start(0).status).toBe('paused');r.setTracking({reliable:true,guard:'raised'},500);expect(r.snapshot().status).toBe('paused');expect(r.resume(500)).toBe(true);});
 it('approaches, guards, and telegraphs for 1100ms before attack',()=>{const r=setup();expect(advance(r,1800).opponentState).toBe('GUARD');expect(advance(r,3000).opponentState).toBe('ATTACK_WINDUP');expect(advance(r,4099).opponentState).toBe('ATTACK_WINDUP');expect(advance(r,4100).opponentState).toBe('ATTACK');expect(advance(r,4340).stats.playerBlocks).toBe(1);});
 it('keeps the telegraphed punch stable through contact and alternates jab to cross',()=>{const r=setup();expect(advance(r,3000)).toMatchObject({opponentState:'ATTACK_WINDUP',opponentPunch:'jab'});expect(advance(r,4100)).toMatchObject({opponentState:'ATTACK',opponentPunch:'jab'});expect(advance(r,6890)).toMatchObject({opponentState:'ATTACK_WINDUP',opponentPunch:'cross'});expect(advance(r,7989)).toMatchObject({opponentState:'ATTACK_WINDUP',opponentPunch:'cross'});expect(advance(r,7990)).toMatchObject({opponentState:'ATTACK',opponentPunch:'cross'});expect(r.snapshot().stats.playerBlocks).toBe(1);});
 it('authored player damage only with recent reliable lowered guard',()=>{const r=setup('lowered');const s=advance(r,4340,'lowered');expect(s.playerHealth).toBe(92);expect(s.opponentState).toBe('RECOVERY');});
 it('unknown/stale tracking pauses timer and never penalizes',()=>{const r=setup();advance(r,4000);r.setTracking({reliable:true,guard:'unknown'},4050);expect(r.tick(15000).playerHealth).toBe(100);expect(r.snapshot().elapsedMs).toBe(4000);r.setTracking({reliable:true,guard:'raised'},15000);expect(r.resume(15000)).toBe(true);expect(r.tick(17000).status).toBe('paused');expect(r.snapshot().elapsedMs).toBe(4000);});
 it('resolves range, blocks and supported hits independently from technique',()=>{const r=setup();expect(r.punch({id:'far',type:'jab',confidence:.99},0).outcome).toBe('miss');advance(r,1800);expect(r.punch({id:'guard',type:'cross',confidence:.99},1800).outcome).toBe('blocked');advance(r,3000);expect(r.punch({id:'hit',type:'jab',confidence:.99},3000)).toMatchObject({outcome:'hit',damage:10});expect(r.snapshot().opponentState).toBe('HIT_REACTION');expect(r.snapshot().opponentHealth).toBe(90);});
 it('rejects uncertain cues and duplicate ids, and bounds rate',()=>{const r=setup();advance(r,3000);expect(r.punch({id:'weak',type:'jab',confidence:.64},3000).accepted).toBe(false);expect(r.punch({id:'a',type:'cross',confidence:1},3000).damage).toBe(14);expect(r.punch({id:'a',type:'cross',confidence:1},3001).accepted).toBe(false);expect(r.punch({id:'b',type:'cross',confidence:1},3002).accepted).toBe(false);advance(r,3300);expect(r.punch({id:'b',type:'cross',confidence:1},3300).accepted).toBe(false);expect(r.snapshot().stats.hits).toBe(1);});
 it('executes a supported jab–cross inside 280ms while keeping same-hand cooldown and id dedupe',()=>{
  const r=setup();advance(r,3000);
  expect(r.punch({id:'lead',type:'jab',confidence:.99},3000).accepted).toBe(true);
  expect(r.punch({id:'rear',type:'cross',confidence:.99},3240)).toMatchObject({accepted:true,outcome:'hit',damage:14});
  expect(r.snapshot().stats.punches).toBe(2);expect(r.snapshot().opponentHealth).toBe(76);
  expect(r.punch({id:'rear-repeat',type:'cross',confidence:.99},3250)).toMatchObject({accepted:false,reason:'Same-hand punch cooldown.'});
  expect(r.punch({id:'rear',type:'cross',confidence:.99},3300).accepted).toBe(false);
 });
 it('also permits rear-to-lead combinations without allowing same-type bursts',()=>{
  const r=setup();advance(r,3000);expect(r.punch({id:'rear',type:'cross',confidence:1},3000).accepted).toBe(true);
  expect(r.punch({id:'lead',type:'jab',confidence:1},3150).accepted).toBe(true);
  expect(r.punch({id:'lead2',type:'jab',confidence:1},3200).accepted).toBe(false);
 });
 it('completes at exactly sixty active seconds and stays terminal',()=>{const r=setup();const s=advance(r,60000);expect(s.status).toBe('complete');expect(s.remainingMs).toBe(0);expect(s.result).toBe('draw');expect(r.punch({id:'late',type:'jab',confidence:1},60000).accepted).toBe(false);});
 it('pauses on a suspended display even if a fresh sample just arrived',()=>{const r=setup();r.setTracking({reliable:true,guard:'lowered'},10000);expect(r.tick(10000).status).toBe('paused');expect(r.snapshot().elapsedMs).toBe(0);expect(r.snapshot().playerHealth).toBe(100);});
 it('restarts the fair telegraph after resuming a paused attack',()=>{const r=setup();advance(r,4200);r.pause(4200);r.setTracking({reliable:true,guard:'raised'},4300);expect(r.resume(4300)).toBe(true);expect(r.snapshot().opponentState).toBe('GUARD');expect(r.snapshot().stateProgress).toBe(0);});
 it('does not expose mutable snapshot state or run backwards',()=>{const r=setup();advance(r,500);const s=r.snapshot();s.stats.hits=99;r.tick(100);expect(r.snapshot().stats.hits).toBe(0);expect(r.snapshot().elapsedMs).toBe(500);});
});
