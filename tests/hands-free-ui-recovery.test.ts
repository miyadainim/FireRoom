import {afterEach,describe,expect,it,vi} from 'vitest';
import type {PoseFrame} from '../src/shared/contracts';
vi.mock('../src/vision/guard-height',()=>({observeGuardHeight:()=>({status:'below-region',eyeOffsetShoulderWidths:1})}));
import {mountHandsFreeTraining} from '../src/ui/hands-free-training';

/** Deliberately small DOM boundary: production handler selection and async drawer observer
 * are exercised; rendering/layout and physical recognition are not simulated. */
class Element {
 hidden=false; value='orthodox'; textContent=''; innerHTML=''; className=''; onclick:(()=>void)|null=null; onchange:(()=>void)|null=null;
 children:Element[]=[]; nodes=new Map<string,Element>();
 querySelector<T>(selector:string):T {if(!this.nodes.has(selector))this.nodes.set(selector,new Element());return this.nodes.get(selector) as T;}
 append(...nodes:Element[]){this.children.push(...nodes);} prepend(...nodes:Element[]){this.children.unshift(...nodes);}
 setAttribute(){} remove(){} click(){this.onclick?.();}
}
function setup(){
 vi.useFakeTimers({toFake:['setInterval','clearInterval','performance']});
 const root=new Element(),drawer=root.querySelector<Element>('#coachDrawer');drawer.hidden=true;
 let observer=()=>{};const mutations:(()=>void)[]=[];
 vi.stubGlobal('MutationObserver',class{constructor(callback:()=>void){observer=callback;}observe(){}disconnect(){}});
 vi.stubGlobal('document',{hidden:false,createElement:()=>new Element(),addEventListener:vi.fn(),removeEventListener:vi.fn()});
 vi.stubGlobal('localStorage',{getItem:()=>null,setItem:vi.fn()});
 root.querySelector<Element>('#coachClose').onclick=()=>{drawer.hidden=true;mutations.push(observer);};
 root.querySelector<Element>('#coachSetup').onclick=()=>{drawer.hidden=false;mutations.push(observer);};
 const shot=vi.fn(),demonstrate=vi.fn(),startAttempt=vi.fn(()=>true),cancelAttempt=vi.fn();
 const ui=mountHandsFreeTraining(root as unknown as HTMLElement,{connected:()=>true,stance:()=> 'orthodox',setStance:vi.fn(),present:vi.fn(),shot,demonstrate,cancelDemo:vi.fn(),startAttempt,cancelAttempt});
 const host=root.querySelector<Element>('.dialogue-actions').children[0],controls=drawer.children[0];
 const action=(name:string)=>{(host.nodes.get(`[data-training="${name}"]`)??controls.querySelector<Element>(`[data-training="${name}"]`)).click();while(mutations.length)mutations.shift()!();};
 let sequence=0;
 const frame=()=>ui.receive({schemaVersion:1,sessionId:'ui-test',cameraConfigurationId:'camera',sequence:sequence++,timestampMs:performance.now()+1000,stance:'orthodox',imageSize:{width:640,height:480},tracking:'tracked',landmarks:[]} as unknown as PoseFrame);
 const advance=(duration:number)=>{for(let elapsed=0;elapsed<duration;elapsed+=100){frame();vi.advanceTimersByTime(Math.min(100,duration-elapsed));}};
 const open=()=>{drawer.hidden=false;observer();};
 return {ui,shot,demonstrate,startAttempt,action,advance,open,host,drawer};
}
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
describe('hands-free adapter pause recovery',()=>{
 it('Pause → Skip closes the drawer and runs the guard demonstration to observation',()=>{const h=setup();try{
  h.action('begin');h.open();h.action('pause');h.action('skip');expect(h.drawer.hidden).toBe(true);
  h.advance(8000);expect(h.ui.snapshot()).toMatchObject({lesson:'guard',phase:'OBSERVING',paused:false});
 }finally{h.ui.dispose();}});
 it.each(['restart','exit'])('Pause → %s → Begin advances past the introduction',command=>{const h=setup();try{
  h.action('begin');h.open();h.action('pause');h.action(command);
  if(!h.drawer.hidden){h.drawer.hidden=true;}
  h.action('begin');h.advance(4600);expect(h.shot).toHaveBeenLastCalledWith('legs');
  h.advance(13000);expect(h.ui.snapshot()).toMatchObject({lesson:'guard',phase:'DEMONSTRATING',paused:false});
 }finally{h.ui.dispose();}});
 it('leaving manual mode restarts introduction timing and later accepts guided practice',()=>{const h=setup();try{
  h.action('begin');h.ui.setManual(true);expect(h.ui.manualActive()).toBe(true);h.advance(6000);
  h.ui.setManual(false);expect(h.ui.manualActive()).toBe(false);h.advance(4600);expect(h.shot).toHaveBeenLastCalledWith('legs');
  h.advance(21000);expect(h.ui.snapshot().phase).toBe('OBSERVING');
 }finally{h.ui.dispose();}});
 it('asynchronous drawer close does not pause or replace a newly started jab lesson',()=>{const h=setup();try{
  h.action('begin');h.action('skip');h.advance(8000);expect(h.ui.snapshot().lesson).toBe('guard');
  h.open();h.action('skip');expect(h.ui.snapshot()).toMatchObject({lesson:'jab',phase:'DEMONSTRATING',paused:false});
  const epoch=h.ui.snapshot().epoch;h.advance(4400);expect(h.ui.snapshot()).toMatchObject({lesson:'jab',phase:'OBSERVING',paused:false});
  expect(h.ui.snapshot().epoch).toBe(epoch+1);expect(h.startAttempt).toHaveBeenCalledWith('jab');
 }finally{h.ui.dispose();}});
});
