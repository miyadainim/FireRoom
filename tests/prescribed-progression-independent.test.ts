import {readFileSync} from 'node:fs';
import {describe,it,expect,vi} from 'vitest';
import type {PoseFrame} from '../src/shared/contracts';
import type {PrescribedAttemptReport} from '../src/vision/prescribed';
const evaluator=vi.hoisted(()=>vi.fn());
vi.mock('../src/vision/prescribed',()=>({evaluatePrescribedAttempt:evaluator}));
import {mountPrescribedCoach} from '../src/game/prescribed-coach';
const actual=await vi.importActual<typeof import('../src/vision/prescribed')>('../src/vision/prescribed');
const saved=(n:number)=>{const d=JSON.parse(readFileSync(new URL(`../fireroom_trials/fireroom-prescribed-attempt (${n}).json`,import.meta.url),'utf8'));return {...d,rules:actual.evaluatePrescribedAttempt(d.frames,d.config)};};
function setup(report:PrescribedAttemptReport,recordingFails=false){
 evaluator.mockClear();vi.useFakeTimers({toFake:['setTimeout','clearTimeout','performance']});evaluator.mockReturnValue(report);
 const elements=new Map<string,any>();const element=(key:string)=>{if(!elements.has(key))elements.set(key,{value:key==='drill'?'jab':'',checked:false,disabled:false,textContent:'',replaceChildren(){},append(){},click(){if(!this.disabled)this.onclick?.();}});return elements.get(key);};
 const root={innerHTML:'',querySelector:(selector:string)=>element(selector.match(/"([^"]+)"/)![1])} as unknown as HTMLElement;
 vi.stubGlobal('window',{addEventListener:vi.fn(),removeEventListener:vi.fn()});vi.stubGlobal('document',{createElement:()=>({textContent:'',append(){},replaceChildren(){}})});vi.stubGlobal('speechSynthesis',undefined);vi.stubGlobal('SpeechSynthesisUtterance',undefined);
 const onDemonstration=vi.fn(),controls:any[]=[];const coach=mountPrescribedCoach(root,{connected:()=>true,onRecording:e=>{controls.push(e);if(recordingFails)throw Error('Video unavailable');},demonstrate:onDemonstration} as Parameters<typeof mountPrescribedCoach>[1]);
 const seed=saved(3).frames[0] as PoseFrame;let sequence=0;const receive=(timestampMs:number)=>coach.receive({...seed,sequence:sequence++,timestampMs});
 function finish(){receive(0);element('start').onclick();vi.advanceTimersByTime(2900);receive(2900);vi.advanceTimersByTime(100);vi.advanceTimersByTime(5250);}
 return {coach,element,onDemonstration,controls,finish,receive,cleanup(){coach.dispose();vi.useRealTimers();vi.unstubAllGlobals();}};
}
describe('independent prescribed lesson progression',()=>{
 it('requires an explicit next action after observed movement and return; optional form findings do not block',()=>{const report=saved(4).rules as PrescribedAttemptReport;expect(report.punches[0].oppositeGuard.status).toBe('deviation');expect(report.punches[0].extension.status).toBe('cannot-assess');const h=setup(report);try{h.finish();expect(h.element('drill').value).toBe('jab');expect(h.element('next').disabled).toBe(false);h.element('next').onclick();expect(h.element('drill').value).toBe('cross');}finally{h.cleanup();}});
 it.each([9,13])('does not unlock next with observed phase but missing return (%s)',n=>{const h=setup(saved(n).rules);try{h.finish();expect(h.element('next').disabled).toBe(true);expect(h.element('drill').value).toBe('jab');}finally{h.cleanup();}});
 it('does not unlock next for a sequence mismatch even if individual returns are confirmed',()=>{const report=structuredClone(saved(3).rules) as PrescribedAttemptReport;report.movementSequenceMatched=false;report.status='rejected';report.recoveryStatus='not-applicable';const h=setup(report);try{h.finish();expect(h.element('next').disabled).toBe(true);}finally{h.cleanup();}});
 it('demonstrates selected movement in phone stance and blocks replay during active capture',()=>{const h=setup(saved(3).rules);try{h.receive(0);h.element('drill').value='cross';h.element('demo').onclick();expect(h.onDemonstration).toHaveBeenLastCalledWith('cross','orthodox');h.element('start').onclick();expect(h.element('demo').disabled).toBe(true);h.element('demo').onclick();expect(h.onDemonstration).toHaveBeenCalledTimes(1);h.element('stop').onclick();expect(h.controls.map(c=>c.action)).toEqual(['start','stop']);vi.advanceTimersByTime(10000);expect(evaluator).not.toHaveBeenCalled();}finally{h.cleanup();}});
 it('retry starts a fresh recording and clears previous progression permission',()=>{const h=setup(saved(3).rules);try{h.finish();expect(h.element('next').disabled).toBe(false);h.receive(8400);h.element('retry').onclick();expect(h.controls.map(c=>c.action)).toEqual(['start','stop','start']);expect(h.controls[2].runId).not.toBe(h.controls[0].runId);expect(h.element('next').disabled).toBe(true);expect(h.element('retry').hidden).toBe(true);expect(h.element('export').disabled).toBe(true);}finally{h.cleanup();}});
 it('changing lesson clears progression and does not start recording',()=>{const h=setup(saved(3).rules);try{h.finish();h.element('drill').value='jab-cross';h.element('drill').onchange();expect(h.element('next').disabled).toBe(true);expect(h.element('progress').textContent).toContain('3 of 3');expect(h.onDemonstration).toHaveBeenLastCalledWith('jab-cross','orthodox');expect(h.controls).toHaveLength(2);}finally{h.cleanup();}});
 it('finishes the final session without auto-starting another attempt',()=>{const h=setup(saved(11).rules);try{h.element('drill').value='jab-cross';h.finish();vi.advanceTimersByTime(3000);expect(h.element('next').textContent).toBe('Finish session');h.element('next').onclick();expect(h.element('status').textContent).toContain('Session complete');expect(h.element('next').hidden).toBe(true);expect(h.controls.map(c=>c.action)).toEqual(['start','stop']);}finally{h.cleanup();}});

 it.each([1000,3500])('cancel at %sms restores retry and permits a new attempt',cancelAt=>{const h=setup(saved(3).rules);try{
  h.receive(0);h.element('start').onclick();
  if(cancelAt===1000){vi.advanceTimersByTime(1000);h.element('stop').onclick();}else{vi.advanceTimersByTime(2900);h.receive(2900);vi.advanceTimersByTime(600);h.element('stop').onclick();}
  expect(h.element('retry').hidden).toBe(false);expect(h.element('start').disabled).toBe(false);expect(h.element('stop').disabled).toBe(true);
  h.receive(performance.now());h.element('retry').onclick();expect(h.element('start').disabled).toBe(true);expect(h.controls.map(c=>c.action)).toEqual(['start','stop','start']);
  vi.advanceTimersByTime(2900);h.receive(performance.now());vi.advanceTimersByTime(100);vi.advanceTimersByTime(5250);
  expect(h.element('next').disabled).toBe(false);expect(h.controls.map(c=>c.action)).toEqual(['start','stop','start','stop']);
 }finally{h.cleanup();}});
 it('stale countdown reveals retry and fresh frames allow it to finish',()=>{const h=setup(saved(3).rules);try{
  h.receive(0);h.element('start').onclick();vi.advanceTimersByTime(3000);
  expect(h.element('status').textContent).toContain('stale');expect(h.element('retry').hidden).toBe(false);
  h.receive(3000);h.element('retry').onclick();vi.advanceTimersByTime(2900);h.receive(5900);vi.advanceTimersByTime(100);vi.advanceTimersByTime(5250);
  expect(h.element('next').disabled).toBe(false);
 }finally{h.cleanup();}});
 it('context cancellation restores retry and clears old timers',()=>{const h=setup(saved(3).rules);try{
  h.receive(0);h.element('start').onclick();vi.advanceTimersByTime(1000);h.receive(0);
  expect(h.element('status').textContent).toContain('context changed');expect(h.element('retry').hidden).toBe(false);
  vi.advanceTimersByTime(9000);expect(evaluator).not.toHaveBeenCalled();expect(h.element('start').disabled).toBe(false);
 }finally{h.cleanup();}});
 it('works without secure-context randomUUID on the TV viewer',()=>{const h=setup(saved(3).rules);try{
  vi.stubGlobal('crypto',{getRandomValues:(bytes:Uint8Array)=>{for(let i=0;i<bytes.length;i++)bytes[i]=i;return bytes;}});
  h.finish();expect(h.controls[0].runId).toMatch(/^[0-9a-f-]{36}$/);expect(h.element('next').disabled).toBe(false);
 }finally{h.cleanup();}});
 it('beginLesson removes stale feedback and export permission after replay',()=>{const h=setup(saved(3).rules);try{
  h.finish();expect(h.element('export').disabled).toBe(false);h.coach.beginLesson();
  expect(h.element('export').disabled).toBe(true);expect(h.element('retry').hidden).toBe(true);expect(h.element('next').disabled).toBe(true);
 }finally{h.cleanup();}});

 it('optional video failures do not block countdown, completion or cancellation',()=>{const h=setup(saved(3).rules,true);try{
  h.finish();expect(h.element('next').disabled).toBe(false);expect(h.element('start').disabled).toBe(false);
  h.receive(8400);h.element('retry').onclick();h.element('stop').onclick();expect(h.element('retry').hidden).toBe(false);
 }finally{h.cleanup();}});
 it('failed evidence can be retried and does not unlock next prematurely',()=>{const h=setup(saved(9).rules);try{
  h.finish();expect(h.element('next').disabled).toBe(true);expect(h.element('retry').hidden).toBe(false);
  evaluator.mockReturnValue(saved(3).rules);h.receive(8400);h.element('retry').onclick();
  vi.advanceTimersByTime(2900);h.receive(11300);vi.advanceTimersByTime(100);vi.advanceTimersByTime(5250);expect(h.element('next').disabled).toBe(false);
 }finally{h.cleanup();}});
});
