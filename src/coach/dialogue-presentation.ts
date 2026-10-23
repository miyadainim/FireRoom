import atlasImage from '../graphics/assets/atlas-image';
import './dialogue-presentation.css';

export type DialogueState='introduction'|'instruction'|'practice'|'feedback'|'encouragement'|'uncertainty';
export interface DialogueEvidence {text:string;source:'atlas'|'status'|'feedback'|'guide'|'introduction';nextEnabled?:boolean}
/** Labels describe existing UI messages; they never assess the player's technique. */
export function presentCoachDialogue(evidence:DialogueEvidence):{state:DialogueState;text:string} {
 const text=evidence.text.trim();
 if(evidence.source==='introduction')return {state:'introduction',text};
 if(/stale|cancelled|uncertain|unavailable|not observed|no observed punch evidence|not assess|cannot assess|not enough evidence|could not confirm|could not verify|connection lost|missing|reconnect|connect a current|context changed|tracking lost|failed|error/i.test(text))return {state:'uncertainty',text};
 if(/^Now you try!|^Now put them together\.|^Raise your guard/i.test(text))return {state:'practice',text};
 if(evidence.source==='guide'||/watch the guide|your (left|right) side leads|watch (?:the )?guard|copy the guard/i.test(text))return {state:'instruction',text};
 if(/hold guard|perform .+now|countdown/i.test(text))return {state:'practice',text};
 if(evidence.nextEnabled)return {state:'encouragement',text};
 return {state:'feedback',text};
}
const labels:Record<DialogueState,string>={introduction:'WELCOME TO TRAINING',instruction:'WATCH THE DEMONSTRATION',practice:'YOUR TURN',feedback:'COACH NOTES',encouragement:'LESSON PROGRESS',uncertainty:'CAMERA & TRACKING'};

/** Select only the human-facing summary, never the expandable measurement dump. */
export function dialogueFeedbackText(element:HTMLElement):string {
 return Array.from(element.children).filter(child=>/^(H[1-6]|P|SMALL)$/.test(child.tagName)).map(child=>child.textContent?.trim()||'').filter(Boolean).join('\n');
}

/** Mirrors grounded coaching messages without changing lesson handlers or evaluation. */
export function mountCoachDialogue(root:HTMLElement,guide:HTMLElement) {
 const panel=document.createElement('section');panel.className='atlas-dialogue';panel.setAttribute('aria-label','Coach Atlas dialogue');
 panel.innerHTML='<div class="atlas-dialogue-portrait" aria-hidden="true"></div><div class="atlas-dialogue-copy"><div class="atlas-dialogue-heading"><strong>Coach Atlas</strong><span class="atlas-dialogue-state"></span></div><p class="atlas-dialogue-text" aria-live="polite" aria-atomic="true"></p><small>Instructional guide · controlled movement · return to guard</small></div>';
 const portrait=panel.querySelector<HTMLElement>('.atlas-dialogue-portrait')!;portrait.style.backgroundImage=`url("${atlasImage}")`;
 const body=panel.querySelector<HTMLElement>('.atlas-dialogue-text')!;const label=panel.querySelector<HTMLElement>('.atlas-dialogue-state')!;
 guide.append(panel);
 let last='';let locked=false;
 let departing:HTMLElement|null=null;
 const releaseDeparting=()=>{departing?.remove();departing=null;};
 const show=(evidence:DialogueEvidence)=>{if(locked)return;const view=presentCoachDialogue(evidence);const key=view.state+'\n'+view.text;if(!view.text||key===last)return;last=key;
  releaseDeparting();
  // Crossfade only the outgoing copy; evidence updates synchronously and remains accessible.
  if(typeof HTMLElement!=='undefined' && body instanceof HTMLElement && body.textContent && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   departing=body.cloneNode(true) as HTMLElement;departing.removeAttribute('aria-live');departing.setAttribute('aria-hidden','true');departing.classList.add('atlas-dialogue-departing');departing.style.top=body.offsetTop+'px';departing.style.width=body.offsetWidth+'px';body.parentElement?.append(departing);departing.addEventListener('animationend',releaseDeparting,{once:true});
  }
  panel.dataset.state=view.state;body.textContent=view.text;label.textContent=labels[view.state];portrait.style.backgroundPositionX=view.state==='encouragement'?'100%':view.state==='instruction'?'50%':'0%';panel.classList.remove('atlas-dialogue-enter');void panel.offsetWidth;panel.classList.add('atlas-dialogue-enter');};
 const next=root.querySelector<HTMLButtonElement>('[data-prescribed="next"]');
 const nextEnabled=()=>!!next&&!next.hidden&&!next.disabled;
 const sources=[['atlas','#atlas'],['status','[data-prescribed="status"]'],['feedback','[data-prescribed="feedback"]'],['guide','#ghostLabel']] as const;
 const observers:MutationObserver[]=[];
 for(const [source,selector] of sources){const element=root.querySelector<HTMLElement>(selector);if(!element)continue;const observer=new MutationObserver(()=>{let text=source==='feedback'?dialogueFeedbackText(element):element.innerText||element.textContent||'';if(source==='status'&&/review your feedback/i.test(text)){const feedback=root.querySelector<HTMLElement>('[data-prescribed="feedback"]');const evidence=feedback?dialogueFeedbackText(feedback):'';if(evidence.trim())text+='\n'+evidence.trim();}show({source,text,nextEnabled:nextEnabled()});});observer.observe(element,{subtree:true,characterData:true,childList:true});observers.push(observer);}
 if(next){const observer=new MutationObserver(()=>{if(nextEnabled())show({source:'feedback',text:body.textContent||'',nextEnabled:true});});observer.observe(next,{attributes:true,attributeFilter:['disabled','hidden']});observers.push(observer);}
 // Global messages are mirrored only when they carry a real error, never the idle "Ready." text.
 const globalFeedback=root.querySelector('#feedback');if(globalFeedback){const observer=new MutationObserver(()=>{const text=globalFeedback.textContent||'';if(/error|failed|unavailable|lost|stale/i.test(text))show({source:'status',text});});observer.observe(globalFeedback,{childList:true,characterData:true,subtree:true});observers.push(observer);}
 const beginner=root.querySelector('#beginnerCoach');
 if(beginner){const observer=new MutationObserver(()=>{const text=beginner.querySelector('[data-beginner="status"]')?.textContent||'';if(text)show({source:'status',text});});observer.observe(beginner,{subtree:true,characterData:true,childList:true});observers.push(observer);}
 const intro=root.querySelector('[data-beginner="status"]')?.textContent||root.querySelector('[data-prescribed="status"]')?.textContent||'Watch the guide, then hold both hands in guard. After the countdown, punch and return to guard.';
 show({source:'introduction',text:intro});
 return {present(evidence:DialogueEvidence){locked=false;show(evidence);locked=true;},release(){locked=false;},dispose(){releaseDeparting();observers.forEach(observer=>observer.disconnect());panel.remove();}};
}
