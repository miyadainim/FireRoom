import {describe,it,expect} from 'vitest';
import {ArcadeRound} from '../src/game/arcade';
import {ArcadeCountdown} from '../src/game/arcade-countdown';
const good={reliable:true,guard:'raised' as const},bad={reliable:false,guard:'unknown' as const};
function setup(){const r=new ArcadeRound();r.setTracking(good,0);r.start(0);return r;}
function advance(r:ArcadeRound,to:number){for(let t=100;t<=to;t+=100){r.setTracking(good,t);r.tick(t);}}
describe('Arcade tracking continuity (synthetic timing, not physical validation)',()=>{
 it('freezes combat immediately and rejects cues until tracking recovers',()=>{
  const r=setup();advance(r,3000);const before=r.snapshot();r.setTracking(bad,3010);
  expect(r.trackingHeld()).toBe(true);r.tick(3400);
  expect(r.snapshot()).toMatchObject({elapsedMs:before.elapsedMs,stateProgress:before.stateProgress,playerHealth:100,opponentHealth:100,stats:before.stats});
  expect(r.punch({id:'uncertain',type:'jab',confidence:1},3410).accepted).toBe(false);
  r.setTracking(good,3450);expect(r.trackingHeld()).toBe(false);expect(r.snapshot().status).toBe('running');
  expect(r.tick(3450).elapsedMs).toBe(3000);expect(r.tick(3550).elapsedMs).toBe(3100);
  expect(r.snapshot().opponentState).toBe('GUARD');
 });
 it.each([749,750])('enforces the exact recovery boundary at %dms without waiting for a tick',gap=>{
  const r=setup();r.setTracking(bad,10);r.setTracking(good,10+gap);
  expect(r.snapshot().status).toBe(gap<750?'running':'paused');expect(r.snapshot().elapsedMs).toBe(0);
  if(gap===750){r.tick(800);expect(r.snapshot().status).toBe('paused');expect(r.resume(800)).toBe(true);}
 });
 it('sustained uncertainty freezes the remaining round and requires explicit Resume',()=>{
  const r=setup();advance(r,4200);r.setTracking(bad,4210);r.tick(4960);
  expect(r.snapshot()).toMatchObject({status:'paused',elapsedMs:4200,playerHealth:100});
  r.setTracking(good,5000);expect(r.snapshot().status).toBe('paused');r.resume(5000);
  expect(r.snapshot().opponentState).toBe('GUARD');expect(r.tick(5100).elapsedMs).toBe(4300);
 });
 it('restarts the telegraph after a brief gap during actual contact',()=>{
  const r=setup();advance(r,4200);r.setTracking(bad,4210);r.tick(4400);r.setTracking(good,4500);
  expect(r.snapshot()).toMatchObject({status:'running',opponentState:'GUARD',stateProgress:0,elapsedMs:4200,playerHealth:100});
  expect(r.tick(4600).playerHealth).toBe(100);expect(r.snapshot().stats.playerBlocks).toBe(0);
 });
 it('treats unknown guard as uncertainty even with reliable pose tracking',()=>{
  const r=setup();r.setTracking({reliable:true,guard:'unknown'},10);expect(r.trackingHeld()).toBe(true);
  expect(r.punch({id:'unknown',type:'cross',confidence:1},100).accepted).toBe(false);
  expect(r.tick(760)).toMatchObject({status:'paused',elapsedMs:0,playerHealth:100,opponentHealth:100});
 });
 it('allows separate short gaps without extending a continuous loss indefinitely',()=>{
  const r=setup();r.setTracking(bad,10);r.tick(200);r.setTracking(good,300);r.tick(400);
  r.setTracking(bad,410);r.setTracking(good,700);expect(r.tick(800)).toMatchObject({status:'running',elapsedMs:200});
 });
 it('keeps manual pauses latched even when tracking returns',()=>{
  const r=setup();r.setTracking(bad,10);r.pause(20);r.setTracking(good,30);
  expect(r.snapshot().status).toBe('paused');expect(r.resume(30)).toBe(true);
 });
 it('freezes countdown through a brief gap and requires three active seconds',()=>{
  const c=new ArcadeCountdown();c.start(0);for(let t=100;t<=2000;t+=100)expect(c.tick(t,true)).toBe(false);
  c.tick(2100,false);c.tick(2400,false);expect(c.tick(2500,true)).toBe(false);
  for(let t=2600;t<3500;t+=100)expect(c.tick(t,true)).toBe(false);
  expect(c.tick(3500,true)).toBe(true);expect(c.active()).toBe(false);
 });
 it('cancels countdown on sustained loss, hidden-display delay or explicit cancellation',()=>{
  for(const mode of ['loss','display','manual']){const c=new ArcadeCountdown();c.start(0);
   if(mode==='loss'){c.tick(100,false);c.tick(850,true);}else if(mode==='display')c.tick(1100,true);else c.cancel();
   expect(c.active(),mode).toBe(false);expect(c.tick(3000,true)).toBe(false);
  }
 });
});

it('requires three continuous seconds for hands-free guard entry',()=>{
 const c=new ArcadeCountdown(true);c.start(0);c.tick(1000,true);c.tick(2000,true);
 expect(c.tick(2100,false)).toBe(false);expect(c.active()).toBe(false);
 c.start(2200);for(let t=2300;t<5200;t+=100)expect(c.tick(t,true)).toBe(false);
 expect(c.tick(5200,true)).toBe(true);
});
