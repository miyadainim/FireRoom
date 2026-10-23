export type RemoteKey='up'|'down'|'left'|'right'|'activate';
/** Vega probe emits standard DOM Arrow keys/37–40 and Enter/13. Android aliases
 * are fallback-only, for wrappers that forward their native D-pad key codes. */
export function normalizeRemoteKey(event:{key?:string;code?:string;keyCode?:number;which?:number}):RemoteKey|null {
 const names:Record<string,RemoteKey>={ArrowUp:'up',Up:'up',ArrowDown:'down',Down:'down',ArrowLeft:'left',Left:'left',ArrowRight:'right',Right:'right',Enter:'activate',NumpadEnter:'activate',Select:'activate',Accept:'activate',DPAD_CENTER:'activate'};
 if(event.key&&names[event.key])return names[event.key];
 if(event.code&&names[event.code])return names[event.code];
 // Never reinterpret an identified keyboard key (e.g. Pause keyCode 19).
 if(event.key&&event.key!=='Unidentified')return null;
 const codes:Record<number,RemoteKey>={13:'activate',37:'left',38:'up',39:'right',40:'down',19:'up',20:'down',21:'left',22:'right',23:'activate'};
 return codes[event.keyCode||event.which||0]??null;
}

export interface RemoteNavigationDiagnostic {key:RemoteKey;action:'focus'|'activate'|'native'|'change';target:string|null}
export function attachRemoteNavigation(root:Document|HTMLElement=document,onDiagnostic?:(event:RemoteNavigationDiagnostic)=>void):()=>void {
 const doc=root.nodeType===9?root as Document:root.ownerDocument!;
 const visible=(control:HTMLElement)=>{
  if(control.matches(':disabled,[disabled],[aria-disabled="true"],[tabindex="-1"]')||control.closest('[hidden],[inert]')||!control.getClientRects().length)return false;
  const style=doc.defaultView?.getComputedStyle(control);
  if(style?.visibility==='hidden'||style?.display==='none')return false;
  // Closed details can leave descendant rectangles in some TV WebViews.
  for(let parent=control.parentElement;parent;parent=parent.parentElement){
   if(parent.tagName==='DETAILS'&&!parent.hasAttribute('open')){
    const summary=Array.from(parent.children).find(child=>child.tagName==='SUMMARY');
    if(!summary?.contains(control))return false;
   }
  }
  return true;
 };
 const controls=()=>Array.from(root.querySelectorAll<HTMLElement>('button,select,input:not([type="hidden"]),textarea,summary,a[href],[tabindex]')).filter(visible);
 const preferred=(items:HTMLElement[])=>items.find(control=>control.matches('[data-prescribed="start"],[data-beginner="practise"],[data-beginner="stance"]'))??items.find(control=>control.matches('#guidePanel > summary'))??items[0];
 const focus=(control:HTMLElement)=>{control.focus({preventScroll:true});control.scrollIntoView({block:'nearest',inline:'nearest'});};
 const ensureFocus=()=>{const items=controls();if(!items.includes(doc.activeElement as HTMLElement)&&items[0])focus(items.find(control=>control.matches('#guidePanel > summary'))??items[0]);};
 const listener=(raw:Event)=>{
  const event=raw as KeyboardEvent,key=normalizeRemoteKey(event);if(!key||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
  const target=doc.activeElement as HTMLElement|null;
  const editable=target?.matches('textarea,[contenteditable="true"],input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"])');
  const select=target?.matches('select');
  // Single-line text retains cursor/typing keys, but vertical arrows escape it.
  // Multiline editors retain arrows so existing question editing still works.
  if(editable&&((key!=='up'&&key!=='down')||target?.matches('textarea,[contenteditable="true"]'))){onDiagnostic?.({key,action:'native',target:target?.id||null});return;}
  // TV WebViews do not consistently open native select popups. Apply the same
  // option change explicitly, including the normal change event used by lessons.
  if(select&&(key==='up'||key==='down')){
   event.preventDefault();const field=target as HTMLSelectElement;
   const options=Array.from(field.options),delta=key==='down'?1:-1;
   let index=field.selectedIndex+delta;
   while(index>=0&&index<options.length&&(options[index].disabled||(options[index].parentElement?.tagName==='OPTGROUP'&&(options[index].parentElement as HTMLOptGroupElement).disabled)))index+=delta;
   if(index>=0&&index<options.length){field.selectedIndex=index;field.dispatchEvent(new (doc.defaultView?.Event??Event)('change',{bubbles:true}));}
   onDiagnostic?.({key,action:'change',target:target?.id||null});return;
  }
  const items=controls();if(!items.length)return;
  if(key==='activate'){
   if(select){event.preventDefault();if(!event.repeat){const index=items.indexOf(target!);focus(items[(index+1)%items.length]);}return;}
   const control=target&&items.includes(target)?target:preferred(items);
   // Cancel browser default activation before our single explicit click.
   event.preventDefault();if(event.repeat)return;
   focus(control);control.click();onDiagnostic?.({key,action:'activate',target:control.id||null});
  }else{
   event.preventDefault();const index=items.indexOf(target as HTMLElement),delta=key==='right'||key==='down'?1:-1;
   const next=index<0?preferred(items):items[(index+delta+items.length)%items.length];
   focus(next);onDiagnostic?.({key,action:'focus',target:next.id||null});
  }
 };
 root.addEventListener('keydown',listener);
 ensureFocus();
 return ()=>root.removeEventListener('keydown',listener);
}
