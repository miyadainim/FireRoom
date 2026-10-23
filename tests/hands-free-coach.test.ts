import { describe, expect, it } from 'vitest';
import { HandsFreeCoach, type HandsFreeEvent } from '../src/game/hands-free-coach';
function setup(lesson: 'guard'|'jab'|'cross'|'jab-cross' = 'guard') {
  const events: HandsFreeEvent[] = [];
  const coach = new HandsFreeCoach({onEvent: e => events.push(e)});
  coach.start(0,lesson); coach.demonstrationFinished(1000,coach.snapshot.epoch);
  return {coach,events};
}
function feed(coach: HandsFreeCoach, from:number, to:number, sequence=1, guard:boolean|'unknown'=true) {
  for(let now=from;now<=to;now+=100) coach.pose({now,sequence:sequence++,guard});
  return sequence;
}
describe('hands-free lesson orchestration',()=>{
  it('automatically observes after demo, requires three seconds, then advances once',()=>{
    const {coach,events}=setup();
    feed(coach,1100,4000); expect(coach.snapshot.phase).toBe('OBSERVING');
    coach.pose({now:4100,sequence:31,guard:true}); expect(coach.snapshot.phase).toBe('FEEDBACK');
    feed(coach,4200,8600,32); coach.tick(8600); expect(coach.snapshot.lesson).toBe('jab'); expect(coach.snapshot.phase).toBe('DEMONSTRATING');
    coach.tick(8601); expect(events.filter(e=>e.type==='lesson-completed')).toHaveLength(1);
  });
  it('counts source time rather than buffered arrival span and rejects predemo frames',()=>{
    const coach=new HandsFreeCoach(); coach.start(0);
    coach.pose({now:100,sourceMs:10000,sequence:1,guard:true});
    coach.demonstrationFinished(1000,coach.snapshot.epoch);
    coach.pose({now:1100,sourceMs:10500,sequence:2,guard:true});
    expect(coach.snapshot.guardHeldMs).toBe(0);
    coach.pose({now:1200,sourceMs:11100,sequence:3,guard:true});
    coach.pose({now:1500,sourceMs:11200,sequence:4,guard:true});
    expect(coach.snapshot.guardHeldMs).toBe(100);
    coach.pose({now:1600,sourceMs:11200,sequence:5,guard:true});
    expect(coach.snapshot.guardHeldMs).toBe(0);
  });
  it('static guard does not count as punch activity',()=>{
    const events:HandsFreeEvent[]=[];
    const coach=new HandsFreeCoach({externalEvaluation:true,onEvent:e=>events.push(e)});
    coach.start(0,'jab'); coach.demonstrationFinished(1000,coach.snapshot.epoch);
    for(let now=1100,seq=1;now<=16000;now+=100,seq++) {
      coach.pose({now,sequence:seq,guard:true}); coach.tick(now);
    }
    expect(coach.snapshot.phase).toBe('DEMONSTRATING');
    expect(events.filter(e=>e.type==='demo')).toHaveLength(2);
  });
  it('tracking loss freezes success reading without duplicate completion',()=>{
    const {coach,events}=setup('cross');
    coach.result({now:1100,epoch:coach.snapshot.epoch,outcome:'success',message:'Nice cross!'});
    coach.trackingLost(2100); coach.tick(20000);
    expect(coach.snapshot.phase).toBe('TRACKING_PAUSED'); expect(coach.snapshot.lesson).toBe('cross');
    coach.pose({now:20001,sequence:1,guard:true});
    expect(coach.snapshot.phase).toBe('FEEDBACK');
    feed(coach,20100,23500,2); coach.tick(23500);
    expect(coach.snapshot.lesson).toBe('cross');
    coach.pose({now:23501,sequence:37,guard:true}); coach.tick(23501);
    expect(coach.snapshot.lesson).toBe('jab-cross');
    expect(events.filter(e=>e.type==='lesson-completed')).toHaveLength(1);
  });
  it('manual pause freezes successful feedback without repeating completion',()=>{
    const {coach,events}=setup('cross');
    coach.result({now:1100,epoch:coach.snapshot.epoch,outcome:'success',message:'Nice cross!'});
    coach.pause(2100); coach.tick(20000); coach.resume(20001);
    expect(coach.snapshot.phase).toBe('FEEDBACK'); coach.tick(23500); expect(coach.snapshot.lesson).toBe('cross');
    coach.tick(23501); expect(coach.snapshot.lesson).toBe('jab-cross');
    expect(events.filter(e=>e.type==='lesson-completed')).toHaveLength(1);
  });
  it('manual pause freezes retry guidance and completed invitation remains visible',()=>{
    const {coach}=setup('jab');
    coach.result({now:1100,epoch:coach.snapshot.epoch,outcome:'wrong',message:'Use your lead hand.'});
    coach.pause(2100); coach.resume(20000); coach.tick(22499);
    expect(coach.snapshot.phase).toBe('RETRY_GUIDANCE'); coach.tick(22500); expect(coach.snapshot.phase).toBe('OBSERVING');
    const final=setup('jab-cross').coach;
    final.result({now:1100,epoch:final.snapshot.epoch,outcome:'success',message:'Nice!'}); final.tick(5600);
    final.pause(5700); expect(final.snapshot.phase).toBe('COMPLETED'); expect(final.snapshot.paused).toBe(false);
  });
  it('unknown frames freeze retry guidance until recovery',()=>{
    const {coach}=setup('jab');
    coach.result({now:1100,epoch:coach.snapshot.epoch,outcome:'imperfect',message:'Return to guard.'});
    coach.pose({now:1200,sequence:1,guard:'unknown'});
    coach.tick(10000); expect(coach.snapshot.phase).toBe('TRACKING_PAUSED');
    coach.pose({now:10001,sequence:2,guard:true}); expect(coach.snapshot.phase).toBe('RETRY_GUIDANCE');
    feed(coach,10100,13300,3); coach.tick(13300); expect(coach.snapshot.phase).toBe('RETRY_GUIDANCE');
    coach.pose({now:13401,sequence:36,guard:true}); coach.tick(13401); expect(coach.snapshot.phase).toBe('OBSERVING');
  });
  it('tracking loss interrupts demo and restarts it after recovery',()=>{
    const coach=new HandsFreeCoach(); coach.start(0); const epoch=coach.snapshot.epoch;
    coach.trackingLost(100); coach.demonstrationFinished(200,epoch);
    coach.pose({now:300,sequence:1,guard:true});
    expect(coach.snapshot.phase).toBe('DEMONSTRATING'); expect(coach.snapshot.epoch).toBeGreaterThan(epoch);
  });
  it('genuine break resets the hold',()=>{
    const {coach}=setup(); let seq=feed(coach,1100,3000);
    coach.pose({now:3100,sequence:seq++,guard:false}); expect(coach.snapshot.guardHeldMs).toBe(0);
    feed(coach,3200,6000,seq); expect(coach.snapshot.phase).toBe('OBSERVING');
  });
  it('unknown tracking resets, pauses, and recovered sample never contributes hold',()=>{
    const {coach}=setup(); let seq=feed(coach,1100,3000);
    coach.pose({now:3100,sequence:seq++,guard:'unknown'}); expect(coach.snapshot.phase).toBe('TRACKING_PAUSED');
    coach.tick(10000); coach.pose({now:10001,sequence:seq++,guard:true});
    expect(coach.snapshot.phase).toBe('OBSERVING'); expect(coach.snapshot.guardHeldMs).toBe(0);
    feed(coach,10100,13000,seq); expect(coach.snapshot.phase).toBe('OBSERVING');
  });
  it('tick cannot count a missing stream as held guard',()=>{
    const {coach}=setup(); coach.pose({now:1100,sequence:1,guard:true}); coach.tick(5000);
    expect(coach.snapshot.phase).toBe('TRACKING_PAUSED'); expect(coach.snapshot.guardHeldMs).toBe(0);
  });
  it('rejects old timestamp, duplicate sequence and stale result epochs',()=>{
    const {coach}=setup('jab'); const epoch=coach.snapshot.epoch;
    coach.pose({now:1100,sequence:10,guard:true}); coach.replay(1200);
    coach.result({now:1300,epoch,outcome:'success',message:'Old'});
    coach.demonstrationFinished(1400,coach.snapshot.epoch);
    coach.pose({now:1300,sequence:11,guard:true}); coach.pose({now:1500,sequence:10,guard:true});
    expect(coach.snapshot.phase).toBe('OBSERVING'); expect(coach.snapshot.guardHeldMs).toBe(0);
  });
  it('pausing invalidates callbacks; resume replays; exit cancels',()=>{
    const {coach}=setup('cross'); const old=coach.snapshot.epoch; coach.pause(1100);
    coach.result({now:20000,epoch:old,outcome:'success',message:'no'}); expect(coach.snapshot.paused).toBe(true);
    coach.resume(20001); expect(coach.snapshot.phase).toBe('DEMONSTRATING');
    const demo=coach.snapshot.epoch; coach.exit(20002); coach.demonstrationFinished(21000,demo);
    expect(coach.snapshot.exited).toBe(true); expect(coach.snapshot.phase).toBe('INTRO');
  });
  it('imperfect and wrong attempts retry automatically without passing',()=>{
    const {coach}=setup('jab'); coach.result({now:1100,epoch:coach.snapshot.epoch,outcome:'wrong',message:'Try your lead hand.'});
    expect(coach.snapshot.phase).toBe('RETRY_GUIDANCE'); coach.tick(4600);
    expect(coach.snapshot.phase).toBe('OBSERVING'); expect(coach.snapshot.lesson).toBe('jab');
  });
  it('resets transport context and accepts lower sequences without skipping the lesson',()=>{
    const {coach}=setup('cross'); coach.pose({now:1100,sourceMs:90000,sequence:100,guard:true});
    const epoch=coach.snapshot.epoch; coach.resetContext(1200);
    expect(coach.snapshot.lesson).toBe('cross'); expect(coach.snapshot.phase).toBe('DEMONSTRATING');
    coach.demonstrationFinished(1300,coach.snapshot.epoch);
    coach.pose({now:1400,sourceMs:100,sequence:1,guard:true});
    coach.result({now:1500,epoch,outcome:'success',message:'stale'});
    expect(coach.snapshot.phase).toBe('OBSERVING');
    coach.tick(1600); expect(coach.snapshot.phase).toBe('OBSERVING');
    coach.pause(1700); coach.resetContext(1800); expect(coach.snapshot.paused).toBe(true);
    coach.exit(1900); coach.resetContext(2000); expect(coach.snapshot.exited).toBe(true);
  });
  it('bounds failed retries and requires an explicit resume',()=>{
    const {coach}=setup('jab'); let now=1100;
    for(let n=0;n<3;n++) {
      coach.result({now,epoch:coach.snapshot.epoch,outcome:'incomplete',message:'Try returning to guard.'});
      now+=3500; coach.tick(now); now++;
    }
    expect(coach.snapshot.paused).toBe(true); expect(coach.snapshot.message).toContain('take a break');
    coach.resume(now); expect(coach.snapshot.phase).toBe('DEMONSTRATING');
  });
  it('cannot complete a lesson twice or replay/skip the final invitation',()=>{
    const {coach,events}=setup('jab-cross'); const epoch=coach.snapshot.epoch;
    coach.result({now:1100,epoch,outcome:'success',message:'Nice!'});
    coach.result({now:1101,epoch,outcome:'success',message:'Again'});
    expect(events.filter(e=>e.type==='lesson-completed')).toHaveLength(1);
    coach.tick(5600); const completedEpoch=coach.snapshot.epoch;
    coach.replay(5700); coach.skip(5800); coach.resetContext(5900);
    expect(coach.snapshot.phase).toBe('COMPLETED'); expect(coach.snapshot.epoch).toBeGreaterThan(completedEpoch);
    expect(events.filter(e=>e.type==='invitation')).toHaveLength(1);
  });
  it('final success presents invitation without launching arcade',()=>{
    const {coach,events}=setup('jab-cross'); coach.result({now:1100,epoch:coach.snapshot.epoch,outcome:'success',message:'Nice!'});
    coach.tick(5600); expect(coach.snapshot.phase).toBe('COMPLETED'); expect(events.filter(e=>e.type==='invitation')).toHaveLength(1);
  });
  it('bounded reminders require real known tracking, then explicitly pause',()=>{
    const {coach,events}=setup(); let seq=1; let now=1100;
    for(let reminder=0;reminder<3;reminder++) {
      const until=now+15000*(reminder+1);
      for(;now<=until;now+=100) {coach.pose({now,sequence:seq++,guard:false}); coach.tick(now); if(coach.snapshot.phase!=='OBSERVING') break;}
      if(reminder<2) {expect(coach.snapshot.phase).toBe('DEMONSTRATING'); now+=100;coach.demonstrationFinished(now,coach.snapshot.epoch);now+=100;}
    }
    expect(coach.snapshot.paused).toBe(true); expect(coach.snapshot.reminderCount).toBe(2);
    expect(events.filter(e=>e.type==='demo')).toHaveLength(3);
  });
});
