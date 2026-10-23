import {describe,it,expect} from 'vitest';
import {ArcadeRound} from '../src/game/arcade';
import {ARCADE_BALANCE as B,type ArcadeTechnique,type Criterion} from '../src/game/arcade-combat-contracts';
class Harness {
 round=new ArcadeRound();now=0;
 constructor(){this.round.setTracking({reliable:true,guard:'raised'},0);this.round.start(0);this.advance(3000);}
 advance(ms:number){const end=this.now+ms;while(this.now<end){this.now=Math.min(end,this.now+50);this.round.setTracking({reliable:true,guard:'raised'},this.now);this.round.tick(this.now);}return this.round.snapshot();}
 hit(id:string,type:'jab'|'cross'='jab'){return this.round.punch({id,type,confidence:1},this.now);}
 assess(id:string,type:'jab'|'cross'='jab',criteria:Partial<ArcadeTechnique>={}){return this.round.finalizeTechnique({schemaVersion:1,punchId:id,type,startingGuard:'PASS',oppositeGuard:'PASS',recovery:'PASS',completedAtMs:this.now,reason:'Independent evidence fixture',...criteria},this.now);}
 lethal(){let i=0;while(this.round.snapshot().phase==='FIGHTING'&&i<12){this.hit(`lethal-${i++}`,'cross');if(this.round.snapshot().phase==='FIGHTING')this.advance(300);}expect(this.round.snapshot().phase).toBe('FINISHER_INTRO');}
}
describe('Milestone B independent combat acceptance',()=>{
 it.each(['jab','cross'] as const)('applies immediate %s base, then earned evidence-only bonus exactly once',type=>{
  const h=new Harness();const base=B[type];expect(h.hit('p',type)).toMatchObject({accepted:true,damage:base});
  expect(h.round.snapshot()).toMatchObject({combo:1,stats:{punches:1,hits:1},opponentHealth:100-base});
  expect(h.assess('p',type).additionalDamage).toBeCloseTo(base*.5);
  expect(h.round.snapshot()).toMatchObject({stats:{hits:1,punches:1},combo:1,opponentHealth:100-base*1.5});
  expect(h.assess('p',type).accepted).toBe(false);
  expect(h.round.snapshot()[type==='jab'?'cleanJabs':'cleanCrosses']).toBe(1);
 });
 it.each(['startingGuard','oppositeGuard','recovery'] as const)('withholds only the unverified %s bonus without labeling UNKNOWN as failure',criterion=>{
  const h=new Harness();h.hit('p');const result=h.assess('p','jab',{[criterion]:'UNKNOWN'});
  const withheld=criterion==='startingGuard'?.1:.2;
  expect(result.additionalDamage).toBeCloseTo(10*(.5-withheld));
  expect(h.round.snapshot().cleanJabs).toBe(0);expect(result.reason).not.toContain('DROPPED');
 });
 it('keeps all UNKNOWN at neutral base and confirmed guard failure below a clean punch',()=>{
  const h=new Harness();h.hit('p');expect(h.assess('p','jab',{startingGuard:'UNKNOWN',oppositeGuard:'UNKNOWN',recovery:'UNKNOWN'}).additionalDamage).toBe(0);
  expect(h.round.snapshot().opponentHealth).toBe(90);expect(h.round.snapshot().techniqueFeedback).toBe('Technique evidence incomplete');
  const bad=new Harness();bad.hit('p');const failed=bad.assess('p','jab',{oppositeGuard:'FAIL'});expect(failed.additionalDamage).toBeCloseTo(3);expect(failed.reason).toBe('GUARD DROPPED');
 });
 it('awards a clean jab-cross sequence once without a guard reset or extra hit count',()=>{
  const h=new Harness();h.hit('j');h.assess('j');h.advance(240);h.hit('c','cross');
  expect(h.assess('c','cross').additionalDamage).toBeCloseTo(14*.8);
  expect(h.round.snapshot()).toMatchObject({combo:2,highestCombo:2,cleanCombinations:1,cleanJabs:1,cleanCrosses:1,stats:{hits:2},techniqueFeedback:'CLEAN COMBINATION'});
  expect(h.assess('c','cross').accepted).toBe(false);expect(h.round.snapshot().cleanCombinations).toBe(1);
 });
 it.each(['UNKNOWN','FAIL'] as Criterion[])('does not award a clean sequence with %s evidence',criterion=>{
  const h=new Harness();h.hit('j');h.assess('j','jab',{recovery:criterion});h.advance(240);h.hit('c','cross');
  expect(h.assess('c','cross').additionalDamage).toBeCloseTo(7);expect(h.round.snapshot().cleanCombinations).toBe(0);
 });
 it('rejects backwards order, duplicate IDs, expired or mismatched assessments without damage',()=>{
  const h=new Harness();h.hit('j');h.advance(300);h.hit('c','cross');h.assess('c','cross');const hp=h.round.snapshot().opponentHealth;
  expect(h.assess('j','jab',{completedAtMs:3000}).accepted).toBe(false);
  expect(h.assess('j','cross').accepted).toBe(false);expect(h.round.snapshot().opponentHealth).toBe(hp);
  h.advance(B.techniqueTimeoutMs+1);expect(h.assess('j').accepted).toBe(false);
  const r=h.round;expect(r.punch({id:'c',type:'cross',confidence:1},h.now).accepted).toBe(false);
 });
 it('does not award technique to blocked or out-of-range attacks',()=>{
  const r=new ArcadeRound();r.setTracking({reliable:true,guard:'raised'},0);r.start(0);
  expect(r.punch({id:'far',type:'jab',confidence:1},0).outcome).toBe('miss');
  expect(r.finalizeTechnique({schemaVersion:1,punchId:'far',type:'jab',startingGuard:'PASS',oppositeGuard:'PASS',recovery:'PASS',completedAtMs:0,reason:'fixture'},0).accepted).toBe(false);
  const blocked=new ArcadeRound();blocked.setTracking({reliable:true,guard:'raised'},0);blocked.start(0);for(let now=100;now<=1800;now+=100){blocked.setTracking({reliable:true,guard:'raised'},now);blocked.tick(now);}
  expect(blocked.punch({id:'block',type:'jab',confidence:1},1800).outcome).toBe('blocked');
  expect(blocked.finalizeTechnique({schemaVersion:1,punchId:'block',type:'jab',startingGuard:'PASS',oppositeGuard:'PASS',recovery:'PASS',completedAtMs:1800,reason:'fixture'},1800).accepted).toBe(false);
  expect(blocked.snapshot()).toMatchObject({combo:0,opponentHealth:100,stats:{hits:0}});
 });
 it('increments only landed hits, expires active streak and preserves highest combo',()=>{
  const h=new Harness();h.hit('j');h.advance(240);h.hit('c','cross');
  expect(h.hit('c','cross').accepted).toBe(false);expect(h.round.snapshot().combo).toBe(2);
  h.advance(B.comboWindowMs+1);expect(h.round.snapshot()).toMatchObject({combo:0,highestCombo:2});
 });
 it('freezes combo and technique deadlines during menu pause and tracking hold',()=>{
  const h=new Harness();h.hit('j');h.advance(500);const elapsed=h.round.snapshot().elapsedMs;h.round.pause(h.now);
  h.now+=10000;h.round.setTracking({reliable:true,guard:'raised'},h.now);expect(h.round.resume(h.now)).toBe(true);
  expect(h.round.snapshot()).toMatchObject({elapsedMs:elapsed,combo:1});expect(h.assess('j').accepted).toBe(true);
  h.round.setTracking({reliable:false,guard:'unknown'},h.now);h.now+=500;h.round.tick(h.now);
  expect(h.round.snapshot().elapsedMs).toBe(elapsed);expect(h.hit('held').accepted).toBe(false);
 });
 it('enters finisher on base-lethal damage, cancels attacks and discards pending technique',()=>{
  const h=new Harness();h.lethal();const s=h.round.snapshot();expect(s).toMatchObject({opponentHealth:0,opponentState:'STUNNED',status:'running',result:null});
  expect(h.assess('lethal-0','cross').accepted).toBe(false);h.advance(B.finisherIntroMs);
  expect(h.round.snapshot()).toMatchObject({phase:'FINISHER_READY',playerHealth:s.playerHealth,stats:{opponentHits:s.stats.opponentHits}});
  expect(h.hit('final','jab')).toMatchObject({accepted:true,damage:0,reason:'Finishing punch.'});
  expect(h.hit('final','jab').accepted).toBe(false);h.advance(B.finisherImpactMs+B.knockoutMs);
  expect(h.round.snapshot()).toMatchObject({phase:'RESULTS',status:'complete',result:'win',opponentState:'KNOCKOUT'});
  expect(h.round.snapshot().stats.punches).toBe(s.stats.punches);
 });
 it('allows delayed bonus to be lethal without negative HP or another hit',()=>{
  // Separate bonus-lethal setup: six crosses leave16, jab leaves6; a clean cross bonus from last cross can finish.
  const b=new Harness();for(let i=0;i<6;i++){b.hit(`c${i}`,'cross');b.advance(300);}b.hit('j');
  expect(b.assess('c5','cross').additionalDamage).toBe(6);expect(b.round.snapshot()).toMatchObject({opponentHealth:0,phase:'FINISHER_INTRO',stats:{hits:7}});
 });
 it('supports explicit fallback and timeout, and freezes finisher readiness on tracking loss',()=>{
  const h=new Harness();h.lethal();h.advance(B.finisherIntroMs);h.round.setTracking({reliable:false,guard:'unknown'},h.now);h.now+=800;h.round.tick(h.now);
  expect(h.round.snapshot()).toMatchObject({status:'paused',phase:'FINISHER_READY',phaseProgress:0});
  h.round.setTracking({reliable:true,guard:'raised'},h.now);expect(h.round.resume(h.now)).toBe(true);
  expect(h.round.finishWithoutPunch(h.now)).toBe(true);expect(h.round.finishWithoutPunch(h.now)).toBe(false);h.advance(B.knockoutMs);expect(h.round.snapshot().result).toBe('win');
  const timed=new Harness();timed.lethal();timed.advance(B.finisherIntroMs+B.finisherReadyMs+B.knockoutMs);expect(timed.round.snapshot().phase).toBe('RESULTS');
 });
 it('defers bonuses without consuming them during pause and lets remote fallback escape lost finisher tracking',()=>{
  const h=new Harness();h.hit('j');h.round.pause(h.now);const hp=h.round.snapshot().opponentHealth;
  expect(h.assess('j').accepted).toBe(false);expect(h.round.snapshot().opponentHealth).toBe(hp);
  h.round.setTracking({reliable:true,guard:'raised'},h.now);h.round.resume(h.now);expect(h.assess('j').accepted).toBe(true);
  const f=new Harness();f.lethal();f.advance(B.finisherIntroMs);f.round.setTracking({reliable:false,guard:'unknown'},f.now);f.now+=800;f.round.tick(f.now);
  expect(f.round.snapshot().status).toBe('paused');expect(f.round.finishWithoutPunch(f.now)).toBe(true);f.now+=B.knockoutMs;f.round.tick(f.now);expect(f.round.snapshot().result).toBe('win');
 });
 it('a fresh match cannot receive the previous match pending assessment or combo',()=>{
  const h=new Harness();h.hit('old');const replacement=new ArcadeRound(h.now);replacement.setTracking({reliable:true,guard:'raised'},h.now);replacement.start(h.now);
  expect(replacement.finalizeTechnique({schemaVersion:1,punchId:'old',type:'jab',startingGuard:'PASS',oppositeGuard:'PASS',recovery:'PASS',completedAtMs:h.now,reason:'old callback'},h.now).accepted).toBe(false);
  expect(replacement.snapshot()).toMatchObject({phase:'FIGHTING',combo:0,highestCombo:0,cleanJabs:0,cleanCrosses:0,cleanCombinations:0,opponentHealth:100});
 });
});
