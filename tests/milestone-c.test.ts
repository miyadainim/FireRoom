import {describe,it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {createGhostArm,sampleGhostOpacity} from '../src/graphics/ghost-arms';
import {samplePromptReference} from '../src/graphics/scene';

describe('Milestone C independent ghost demonstration acceptance',()=>{
 it('fades only the guard bookends and never persists outside a demonstration',()=>{
  for(const duration of [1000,2000]){
   for(const invalid of [-100,0,duration,duration+1,NaN,Infinity])expect(sampleGhostOpacity(invalid,duration)).toBe(0);
   expect(sampleGhostOpacity(80,duration)).toBeCloseTo(.5);
   expect(sampleGhostOpacity(160,duration)).toBe(1);
   expect(sampleGhostOpacity(duration-200,duration)).toBe(1);
   expect(sampleGhostOpacity(duration-100,duration)).toBeCloseTo(.5);
   for(let t=200;t<=duration-200;t+=10)expect(sampleGhostOpacity(t,duration)).toBe(1);
  }
  for(const duration of [0,-1,NaN,Infinity])expect(sampleGhostOpacity(100,duration)).toBe(0);
 });
 it('preserves anatomical jab/cross order, guard and recovery at every playback speed',()=>{
  for(const stance of ['orthodox','southpaw'] as const)for(const exercise of ['jab','cross','jab-cross'] as const)for(const speed of [.25,.5,1]){
   const lead=stance==='orthodox'?'left':'right',rear=lead==='left'?'right':'left';
   const duration=exercise==='jab-cross'?2000:1000;
   expect(samplePromptReference(0,exercise,stance).phase).toBe('guard');
   for(const [wallTime,hand] of [[499/speed,exercise==='cross'?rear:lead],...(exercise==='jab-cross'?[[1499/speed,rear] as const]:[])] as const){
    const sample=samplePromptReference(wallTime*speed,exercise,stance);
    expect(sample.hand).toBe(hand);expect(sample[hand==='left'?'leftExtension':'rightExtension']).toBeGreaterThan(.99);
    expect(sample[hand==='left'?'rightExtension':'leftExtension']).toBe(0);
    expect(sampleGhostOpacity(wallTime*speed,duration)).toBe(1);
   }
   for(let t=0;t<=duration;t+=5){const s=samplePromptReference(t,exercise,stance);expect(s.leftExtension*s.rightExtension).toBe(0);expect(s.leftExtension).toBeGreaterThanOrEqual(0);expect(s.rightExtension).toBeLessThanOrEqual(1);}
   expect(samplePromptReference(850,exercise,stance).leftExtension+samplePromptReference(850,exercise,stance).rightExtension).toBe(0);
   expect(samplePromptReference(duration/speed*speed,exercise,stance).phase).toBe('complete');
  }
 });
 it('uses sparse warm-white contour lines and almost transparent bodies with bounded fade',()=>{
  for(const side of [-1,1] as const){
   const arm=createGhostArm(side);expect(arm.group.visible).toBe(false);let lines=0,vertices=0;
   arm.setOpacity(1);
   arm.group.traverse(object=>{
    if(object instanceof THREE.Line){lines++;vertices+=object.geometry.attributes.position.count;const m=object.material as THREE.LineBasicMaterial;expect(m).toBeInstanceOf(THREE.LineBasicMaterial);expect(m.color.r).toBe(1);expect(m.color.g).toBeGreaterThan(.9);expect(m.color.b).toBeGreaterThan(.75);expect(m.depthWrite).toBe(false);expect(m.opacity).toBeGreaterThan(0);}
    if(object instanceof THREE.Mesh){const m=object.material as THREE.MeshBasicMaterial;expect(m).toBeInstanceOf(THREE.MeshBasicMaterial);expect(m.transparent).toBe(true);expect(m.opacity).toBeLessThan(.02);expect(m.depthWrite).toBe(false);}
   });
   expect(lines).toBeGreaterThanOrEqual(8);expect(vertices).toBeLessThan(500);
   for(const opacity of [-1,NaN,Infinity]){arm.setOpacity(opacity);expect(arm.group.visible).toBe(false);}
   arm.setOpacity(99);expect(arm.group.visible).toBe(true);
  }
 });
});

describe('Milestone C independent grounded dialogue acceptance',()=>{
 it('keeps validated feedback prose while leaving verbose measurement details in their original view',async()=>{
  const {dialogueFeedbackText}=await import('../src/coach/dialogue-presentation');
  const children=[{tagName:'H3',textContent:'Observed recovery'},{tagName:'P',textContent:'  Return to guard was observed. '},{tagName:'SMALL',textContent:'Physical accuracy not verified.'},{tagName:'DETAILS',textContent:'Debug joint measurements 0.123'},{tagName:'DIV',textContent:'Other interface controls'}];
  expect(dialogueFeedbackText({children} as unknown as HTMLElement)).toBe('Observed recovery\nReturn to guard was observed.\nPhysical accuracy not verified.');
  expect(children[1].textContent).toBe('  Return to guard was observed. ');
 });
 it('labels all dialogue states while preserving source text and prioritizing missing evidence',async()=>{
  const {presentCoachDialogue:p}=await import('../src/coach/dialogue-presentation');
  for(const [source,text,state,nextEnabled] of [
   ['introduction','Welcome to training.','introduction',false],
   ['guide','Southpaw cross.','instruction',false],
   ['status','Hold guard. 3…','practice',false],
   ['status','Perform jab now, then return to guard.','practice',false],
   ['feedback','Movement and recovery observed. Review your feedback.','encouragement',true],
   ['atlas','Keep your movements controlled.','feedback',false],
   ['status','Camera became stale during countdown. Reconnect and try again.','uncertainty',true],
   ['status','Camera, stance or timestamp context changed. Attempt cancelled; establish guard and start again.','uncertainty',true],
   ['feedback','Recovery not observed.','uncertainty',true],
   ['status','Connection lost; check relay and network.','uncertainty',true],
   ['status','Camera capture failed.','uncertainty',true],
   ['feedback','Cannot assess with missing evidence.','uncertainty',true],
  ] as const){const input={source,text,nextEnabled};expect(p(input)).toEqual({state,text});expect(input).toEqual({source,text,nextEnabled});}
  const unsafe='<img src=x onerror=alert(1)>';expect(p({source:'atlas',text:unsafe}).text).toBe(unsafe);
 });
 it('mirrors dynamic text as textContent, leaves sources untouched, and disconnects every observer',async()=>{
  const {mountCoachDialogue}=await import('../src/coach/dialogue-presentation');
  const nodes=new Map<string,any>();
  for(const selector of ['#atlas','[data-prescribed="status"]','[data-prescribed="feedback"]','#ghostLabel','#feedback'])nodes.set(selector,{textContent:selector==='[data-prescribed="status"]'?'Connect your phone camera, then watch the demonstration.':'',innerText:''});
  const next={disabled:true,hidden:true};nodes.set('[data-prescribed="next"]',next);
  const body={textContent:''},label={textContent:''},portrait={style:{}},panel:any={className:'',dataset:{},classList:{remove:vi.fn(),add:vi.fn()},setAttribute:vi.fn(),offsetWidth:1,remove:vi.fn(),querySelector:(s:string)=>s==='.atlas-dialogue-portrait'?portrait:s==='.atlas-dialogue-text'?body:label};
  const observers:{callback:()=>void;disconnect:ReturnType<typeof vi.fn>;observe:ReturnType<typeof vi.fn>}[]=[];
  vi.stubGlobal('document',{createElement:()=>panel});
  vi.stubGlobal('MutationObserver',class{disconnect=vi.fn();observe=vi.fn();constructor(callback:()=>void){observers.push({callback,disconnect:this.disconnect,observe:this.observe});}});
  try{
   const guide={append:vi.fn()};const mounted=mountCoachDialogue({querySelector:(s:string)=>nodes.get(s)} as unknown as HTMLElement,guide as unknown as HTMLElement);
   expect(guide.append).toHaveBeenCalledWith(panel);expect(panel.dataset.state).toBe('introduction');
   const unsafe='<svg onload=alert(1)>uncertain</svg>';nodes.get('#atlas').textContent=unsafe;observers[0].callback();expect(body.textContent).toBe(unsafe);expect(panel.dataset.state).toBe('uncertainty');expect((body as any).innerHTML).toBeUndefined();
   next.disabled=false;next.hidden=false;observers[4].callback();expect(panel.dataset.state).toBe('uncertainty');
   nodes.get('[data-prescribed="status"]').textContent='Hold guard. 3…';observers[1].callback();expect(panel.dataset.state).toBe('practice');
   const before=body.textContent;nodes.get('#feedback').textContent='Ready.';observers[5].callback();expect(body.textContent).toBe(before);
   nodes.get('#feedback').textContent='Connection lost; check relay and network.';observers[5].callback();expect(body.textContent).toBe(nodes.get('#feedback').textContent);expect(panel.dataset.state).toBe('uncertainty');
   expect(next).toEqual({disabled:false,hidden:false});expect(nodes.get('#atlas').textContent).toBe(unsafe);
   mounted.dispose();for(const observer of observers)expect(observer.disconnect).toHaveBeenCalledTimes(1);expect(panel.remove).toHaveBeenCalledTimes(1);
  }finally{vi.unstubAllGlobals();}
 });
});
