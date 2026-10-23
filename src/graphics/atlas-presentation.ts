import type {CoachVisualState} from './atlas';

/** Read-only presentation adapter. Existing UI controls/results remain the source of truth. */
export function attachAtlasPresentation(root:HTMLElement, setState:(state:CoachVisualState)=>void) {
 const dialogue=root.querySelector('#atlas');
 const next=root.querySelector<HTMLButtonElement>('[data-prescribed="next"]');
 const dialogueObserver=new MutationObserver(()=>{if(dialogue?.textContent?.trim())setState('speaking');});
 if(dialogue)dialogueObserver.observe(dialogue,{childList:true,characterData:true,subtree:true});
 // This control is enabled by the existing lesson only after observed movement/recovery.
 // Reading it adds no evaluation or independent success judgment.
 const resultObserver=new MutationObserver(()=>{if(next&&!next.disabled&&!next.hidden)setState('encouraging');});
 if(next)resultObserver.observe(next,{attributes:true,attributeFilter:['disabled','hidden']});
 return ()=>{dialogueObserver.disconnect();resultObserver.disconnect();};
}
