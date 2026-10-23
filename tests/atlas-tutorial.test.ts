import {afterEach,describe,it,expect,vi} from 'vitest';
import {mountAtlasTutorial,ATLAS_TUTORIAL_STEPS} from '../src/game/atlas-tutorial';
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
function setup(){
 vi.useFakeTimers();const buttons=Object.fromEntries(['back','next','pause','skip'].map(k=>[k,{hidden:false,onclick:undefined as unknown,textContent:'',focus:vi.fn()}]));
 const elements:any[]=[];vi.stubGlobal('document',{createElement:()=>{const e={hidden:false,className:'',textContent:'',dataset:{},setAttribute:vi.fn(),append:vi.fn(),remove:vi.fn(),querySelector:(s:string)=>buttons[s.match(/"(.*?)"/)![1]],focus:vi.fn(),onclick:undefined};elements.push(e);return e;}});
 let drawerCallback=()=>{};vi.stubGlobal('MutationObserver',class{constructor(cb:()=>void){drawerCallback=cb;}observe=vi.fn();disconnect=vi.fn();});
 const status={textContent:'Choose stance'},stance={focus:vi.fn()},beginner={hidden:false,querySelector:(s:string)=>s==='[data-beginner="status"]'?status:s==='[data-beginner="stance"]'||s==='[data-beginner="stance"],[data-beginner="practise"]'||s==='select,button'?stance:null},prescribed={hidden:true};
 const drawer={hidden:true,append:vi.fn()},guide={append:vi.fn()},actions={append:vi.fn()};
 const root={querySelector:(s:string)=>({'#guidePanel':guide,'#beginnerCoach':beginner,'#prescribedCoach':prescribed,'.dialogue-actions':actions,'#coachDrawer':drawer,'#coachClose':{click:vi.fn()}}[s])} as unknown as HTMLElement;
 const options={shot:vi.fn(),present:vi.fn(),release:vi.fn(),onStart:vi.fn()};const mounted=mountAtlasTutorial(root,options);
 const click=(key:string)=>(buttons[key].onclick as ()=>void)();return {buttons,options,mounted,click,beginner,prescribed,stance,status,drawer,drawerCallback,elements};
}
describe('Atlas cinematic tutorial',()=>{
 it('holds the current shot while paused and resumes automatic progression',()=>{const h=setup();h.click('pause');vi.advanceTimersByTime(30000);expect(h.options.shot).toHaveBeenLastCalledWith('full');h.click('pause');vi.advanceTimersByTime(6500);expect(h.options.shot).toHaveBeenLastCalledWith('legs');h.mounted.dispose();});
 it('teaches full stance, legs, guard, full stance, approval, then hands off without claiming observed guard',()=>{
  const h=setup();expect(h.beginner.hidden).toBe(true);expect(h.options.present).toHaveBeenLastCalledWith({source:'introduction',text:'The first step to boxing is knowing how to stand. Look closely...'});
  for(let i=1;i<ATLAS_TUTORIAL_STEPS.length;i++){vi.advanceTimersByTime(ATLAS_TUTORIAL_STEPS[i-1].duration);expect(h.options.shot).toHaveBeenLastCalledWith(ATLAS_TUTORIAL_STEPS[i].shot);}
  expect(h.options.present).toHaveBeenLastCalledWith({source:'guide',text:'Now you try!'});vi.advanceTimersByTime(60000);expect(h.beginner.hidden).toBe(true);
  h.click('next');expect(h.beginner.hidden).toBe(false);expect(h.prescribed.hidden).toBe(true);expect(h.status.textContent).toContain('confirm your own foot placement');expect(h.stance.focus).toHaveBeenCalledOnce();expect(h.options.shot).toHaveBeenLastCalledWith(null);expect(h.options.release).toHaveBeenCalledOnce();h.mounted.dispose();
 });
 it('supports manual previous, skip, replay and paused reading while setup is open',()=>{
  const h=setup();h.click('next');expect(h.options.shot).toHaveBeenLastCalledWith('legs');h.click('back');expect(h.options.shot).toHaveBeenLastCalledWith('full');
  h.drawer.hidden=false;h.drawerCallback();vi.advanceTimersByTime(30000);expect(h.options.shot).toHaveBeenLastCalledWith('full');h.drawer.hidden=true;h.drawerCallback();vi.advanceTimersByTime(6500);expect(h.options.shot).toHaveBeenLastCalledWith('legs');
  h.click('skip');expect(h.beginner.hidden).toBe(false);const before=h.options.shot.mock.calls.length;vi.advanceTimersByTime(60000);expect(h.options.shot).toHaveBeenCalledTimes(before);
  (h.elements[2].onclick as ()=>void)();expect(h.beginner.hidden).toBe(true);expect(h.options.onStart).toHaveBeenCalledTimes(2);h.mounted.dispose();const count=h.options.shot.mock.calls.length;vi.advanceTimersByTime(60000);expect(h.options.shot).toHaveBeenCalledTimes(count);
 });
});
