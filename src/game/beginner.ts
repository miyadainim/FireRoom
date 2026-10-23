import type {PoseFrame,Stance} from '../shared/contracts';
import {isPoseFrame} from '../shared/contracts';
import {assessBoundaryGuard} from '../vision/guard-boundaries';
import {observeGuardHeight} from '../vision/guard-height';
import './beginner.css';
import {stanceIllustration} from '../graphics/tutorial';
export type BeginnerStage='stance'|'guard'|'complete';
export interface BeginnerState {stage:BeginnerStage;stance:Stance;stanceConfirmed:boolean;guard:'pending'|'observed'|'skipped'}
export type BeginnerAction={type:'stance';stance:Stance}|{type:'confirm-stance'}|{type:'guard';observed:boolean}|{type:'restart'};
export const initialBeginnerState=():BeginnerState=>({stage:'stance',stance:'orthodox',stanceConfirmed:false,guard:'pending'});
export function reduceBeginner(state:BeginnerState,action:BeginnerAction):BeginnerState {
 if(action.type==='restart')return {...initialBeginnerState(),stance:state.stance};
 if(action.type==='stance')return state.stage==='stance'?{...state,stance:action.stance}:state;
 if(action.type==='confirm-stance')return state.stage==='stance'?{...state,stanceConfirmed:true,stage:'guard'}:state;
 if(action.type==='guard')return state.stage==='guard'&&state.stanceConfirmed?{...state,stage:'complete',guard:action.observed?'observed':'skipped'}:state;
 return state;
}
export const BEGINNER_GUARD_HOLD_MS=600;
const frameContext=(f:PoseFrame)=>JSON.stringify([f.sessionId,f.cameraConfigurationId,f.stance,f.imageSize?.width,f.imageSize?.height]);
/** Existing two-hand detector; source timestamps measure holds, local arrivals measure freshness. */
export class BeginnerGuardTracker {
 private frames:PoseFrame[]=[];private last:PoseFrame|undefined;
 reset(){this.frames=[];this.last=undefined;}
 receive(frame:PoseFrame,stance:Stance):'observed'|'holding'|'adjust-camera'|'adjust-hands'|'stance-mismatch' {
  if(!isPoseFrame(frame)){this.reset();return 'adjust-camera';}
  if(frame.stance!==stance){this.reset();return 'stance-mismatch';}
  const previous=this.last;this.last=frame;
  if(previous&&(frameContext(previous)!==frameContext(frame)||frame.sequence<=previous.sequence||frame.timestampMs<=previous.timestampMs||frame.timestampMs-previous.timestampMs>350)){this.frames=[];return 'adjust-camera';}
  if(frame.tracking==='lost'){this.frames=[];return 'adjust-camera';}
  const hands=[observeGuardHeight(frame,'left'),observeGuardHeight(frame,'right')];
  if(hands.some(h=>h.status==='unknown')){this.frames=[];return 'adjust-camera';}
  if(hands.some(h=>h.status!=='within-region'||h.eyeOffsetShoulderWidths!<-.5)){this.frames=[];return 'adjust-hands';}
  this.frames=[...this.frames,frame].filter(f=>f.timestampMs>=frame.timestampMs-1000).slice(-120);
  const boundary=assessBoundaryGuard(this.frames,this.frames[0].timestampMs,frame.timestampMs,'end');
  return boundary.status==='supported'&&boundary.heldFromMs!==null&&boundary.heldUntilMs!==null&&boundary.heldUntilMs-boundary.heldFromMs>=BEGINNER_GUARD_HOLD_MS?'observed':'holding';
 }
}
const storageKey='fireroom-beginner-v1';
export function mountBeginner(root:HTMLElement,options:{connected:()=>boolean;demonstrateGuard:(stance:Stance)=>void;onStanceChange?:(stance:Stance)=>void;onComplete?:()=>void;onStageChange?:(stage:'stance'|'guard'|'punches')=>void}) {
 let state=initialBeginnerState(),saved:BeginnerState|undefined,practising=false,observed=false,lastArrival=0;
 try{const value=JSON.parse(localStorage.getItem(storageKey)??'null');if(value?.stage==='complete'&&value.stanceConfirmed===true&&['orthodox','southpaw'].includes(value.stance)&&['observed','skipped'].includes(value.guard)){saved=value;state={...state,stance:value.stance};}}catch{/* Storage is optional. */}
 const tracker=new BeginnerGuardTracker();
 const el=<T extends HTMLElement>(key:string)=>root.querySelector<T>(`[data-beginner="${key}"]`)!;
 function status(text:string){const target=el('status');if(target)target.textContent=text;}
 function render(){
 options.onStageChange?.(state.stage==='complete'?'punches':state.stage);
 const lead=state.stance==='orthodox'?'left':'right',rear=lead==='left'?'right':'left';
 root.innerHTML=`<section class="beginner-tutorial"><h2>Beginner training</h2><p class="helper">Remote: Left/Right moves between controls; Up/Down changes a selected option; Select confirms it. Use Up/Down to leave a text field.</p><p class="beginner-progress">${state.stage==='stance'?'Lesson 1 of 5 · Stance':state.stage==='guard'?'Lesson 2 of 5 · Guard':'Ready for Lesson 3 · Jab'}</p>${state.stage==='stance'?`<label>Your stance <select data-beginner="stance"><option value="orthodox">Orthodox · left side leads</option><option value="southpaw">Southpaw · right side leads</option></select></label><div data-beginner="illustration" class="beginner-illustration">${stanceIllustration(state.stance)}</div><p>Atlas · Your ${lead} side leads; your ${rear} side stays behind. Stagger your feet comfortably, soften your knees, stay balanced and gently tuck your chin.</p><p class="helper">Check your own setup. The camera does not measure foot placement or balance.</p><button data-beginner="confirm" class="primary">Continue · My stance is ready</button>${saved?'<button data-beginner="skip">Skip completed tutorials</button>':''}`:state.stage==='guard'?`<p>Atlas · Bring both gloves near your face. Relax your shoulders and look ahead. Watch, then copy the guard and hold briefly.</p><button data-beginner="watch">Watch guard</button><button data-beginner="practise" class="primary">Practise guard</button><button data-beginner="retry">Retry</button><button data-beginner="continue" disabled>Continue · Guard observed</button><button data-beginner="bypass">Continue without camera confirmation</button><p class="helper">This checks visible wrist positions near the eyes, not complete boxing form.</p>`:`<p>Atlas · Next, learn your ${lead}-hand jab, ${rear}-hand cross, then jab–cross. Watch each guide and return both hands to guard.</p><button data-beginner="restart">Replay stance and guard tutorial</button>`}<p data-beginner="status" role="status" aria-live="polite">${state.stage==='stance'?`Your ${lead} side leads. Stagger your feet, soften your knees, stay balanced and tuck your chin. Confirm your own setup.`:state.stage==='guard'?'Watch the guard, then practise. Keep both hands near your face and hold briefly.':'Next: jab, cross, then jab–cross. Watch each guide and return to guard.'}</p></section>`;
 if(state.stage==='stance'){
 el<HTMLSelectElement>('stance').value=state.stance;
 el<HTMLSelectElement>('stance').onchange=()=>{state=reduceBeginner(state,{type:'stance',stance:el<HTMLSelectElement>('stance').value as Stance});options.onStanceChange?.(state.stance);render();el<HTMLSelectElement>('stance').focus?.();};
 el('confirm').onclick=()=>{state=reduceBeginner(state,{type:'confirm-stance'});render();options.demonstrateGuard(state.stance);};
 if(saved)el('skip').onclick=()=>{state={...saved!,stance:state.stance,guard:state.stance===saved!.stance?saved!.guard:'skipped'};options.onStanceChange?.(state.stance);render();options.onComplete?.();};
 }else if(state.stage==='guard'){
 el('watch').onclick=()=>options.demonstrateGuard(state.stance);
 const practise=()=>{practising=true;observed=false;tracker.reset();lastArrival=0;el<HTMLButtonElement>('continue').disabled=true;status('Hold both hands near your face. Keep eyes, shoulders and wrists visible.');};
 el('practise').onclick=practise;el('retry').onclick=practise;
 el('continue').onclick=()=>{if(observed)complete(true);};el('bypass').onclick=()=>complete(false);
 }else el('restart').onclick=()=>{state=reduceBeginner(state,{type:'restart'});practising=false;observed=false;tracker.reset();render();};
 }
 function complete(wasObserved:boolean){state=reduceBeginner(state,{type:'guard',observed:wasObserved});saved={...state};practising=false;try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{/* Proceed without persistence. */}render();options.onComplete?.();}
 render();options.onStanceChange?.(state.stance);
 const timer=setInterval(()=>{if(state.stage==='guard'&&practising&&(!options.connected()||!lastArrival||performance.now()-lastArrival>350)){tracker.reset();observed=false;el<HTMLButtonElement>('continue').disabled=true;status('Camera tracking is unavailable. Reconnect or adjust the camera so eyes, shoulders and wrists are visible.');}},200);
 return {selectedStance:()=>state.stance,pausePractice(){practising=false;tracker.reset();},receive(frame:PoseFrame){if(state.stage!=='guard'||!practising)return;lastArrival=performance.now();if(!options.connected()){tracker.reset();return;}const result=tracker.receive(frame,state.stance);observed=result==='observed';if(observed)practising=false;el<HTMLButtonElement>('continue').disabled=!observed;status(result==='observed'?'Guard hold observed. You can lower your hands and continue.':result==='holding'?'Guard positions visible. Hold briefly.':result==='stance-mismatch'?`Set the phone stance to ${state.stance} to match this lesson.`:result==='adjust-hands'?'Bring both hands near your eyes, then hold briefly.':'Adjust the camera so eyes, shoulders and wrists are clearly visible.');},dispose(){clearInterval(timer);tracker.reset();}};
}
