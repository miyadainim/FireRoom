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
 const onDemonstration=vi.fn(),onResult=vi.fn(),controls:any[]=[];const coach=mountPrescribedCoach(root,{connected:()=>true,onResult,onRecording:e=>{controls.push(e);if(recordingFails)throw Error('Video unavailable');},demonstrate:onDemonstration} as Parameters<typeof mountPrescribedCoach>[1]);
 const seed=saved(3).frames[0] as PoseFrame;let sequence=0;const receive=(timestampMs:number)=>coach.receive({...seed,sequence:sequence++,timestampMs});
 function finish(){receive(0);element('start').onclick();vi.advanceTimersByTime(2900);receive(2900);vi.advanceTimersByTime(100);vi.advanceTimersByTime(5250);}
 return {coach,element,onDemonstration,onResult,controls,finish,receive,cleanup(){coach.dispose();vi.useRealTimers();vi.unstubAllGlobals();}};
}
describe('hands-free prescribed adapter integration',()=>{
 it('starts capture without a button or three-second countdown and completes promptly on observed return',()=>{const h=setup(saved(3).rules);try{
  h.receive(1000);expect(h.coach.startAutomatic('jab')).toBe(true);expect(h.controls.map(c=>c.action)).toEqual(['start']);
  vi.advanceTimersByTime(0);expect(h.element('status').textContent).toContain('Perform jab');
  vi.advanceTimersByTime(300);h.receive(1300);
  expect(h.onResult).toHaveBeenCalledTimes(1);expect(h.coach.isActive()).toBe(false);
  expect(h.onResult.mock.calls[0][0].config).toMatchObject({expected:'jab',startMs:1000,endMs:1300});
  expect(h.controls.map(c=>c.action)).toEqual(['start','stop']);
  vi.advanceTimersByTime(6000);expect(h.onResult).toHaveBeenCalledTimes(1);
 }finally{h.cleanup();}});
 it('cancel clears the automatic deadline and a new lesson gets a fresh attempt',()=>{const h=setup(saved(3).rules);try{
  h.receive(1000);h.coach.startAutomatic('jab');vi.advanceTimersByTime(0);h.coach.cancel();
  vi.advanceTimersByTime(6000);expect(h.onResult).not.toHaveBeenCalled();expect(h.coach.isActive()).toBe(false);
  h.receive(7000);expect(h.coach.startAutomatic('cross')).toBe(true);vi.advanceTimersByTime(0);
  vi.advanceTimersByTime(300);h.receive(7300);expect(h.onResult).toHaveBeenCalledTimes(1);
  expect(h.onResult.mock.calls[0][0].config.expected).toBe('cross');expect(h.controls[2].runId).not.toBe(h.controls[0].runId);
 }finally{h.cleanup();}});
 it('does not accept duplicate automatic starts or start without a current stream',()=>{const h=setup(saved(3).rules);try{
  expect(h.coach.startAutomatic('jab')).toBe(false);expect(h.controls).toHaveLength(0);
  h.receive(1000);h.coach.startAutomatic('jab');h.coach.startAutomatic('cross');expect(h.controls).toHaveLength(1);expect(h.element('drill').value).toBe('jab');
 }finally{h.cleanup();}});
 it('keeps legacy manual retry on its explicit three-second countdown',()=>{const h=setup(saved(3).rules);try{
  h.receive(1000);h.coach.startAutomatic('jab');vi.advanceTimersByTime(0);h.element('stop').onclick();
  h.element('retry').onclick();vi.advanceTimersByTime(2000);expect(h.element('status').textContent).toContain('1');expect(evaluator).not.toHaveBeenCalled();
  h.receive(3000);vi.advanceTimersByTime(1000);expect(h.element('status').textContent).toContain('stale');
  expect(h.element('retry').hidden).toBe(false);
 }finally{h.cleanup();}});
 it('manual retry still completes after fresh countdown and full capture',()=>{const h=setup(saved(3).rules);try{
  h.receive(0);h.coach.startAutomatic('jab');vi.advanceTimersByTime(0);h.element('stop').onclick();h.element('retry').onclick();
  vi.advanceTimersByTime(2900);h.receive(2900);vi.advanceTimersByTime(100);expect(h.onResult).not.toHaveBeenCalled();
  vi.advanceTimersByTime(5250);expect(h.onResult).toHaveBeenCalledTimes(1);expect(h.element('next').disabled).toBe(false);
 }finally{h.cleanup();}});

});
