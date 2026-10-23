import './coach-screen.css';
/** Reparents existing UI nodes. Lesson, pairing and evaluation handlers retain ownership. */
export function mountCoachScreen(root:HTMLElement){
 const main=root.querySelector('main')!,guide=root.querySelector<HTMLElement>('#guidePanel')!,dialogue=root.querySelector<HTMLElement>('.atlas-dialogue')!;
 main.classList.add('coach-game');
 const hud=document.createElement('nav');hud.className='coach-hud';hud.setAttribute('aria-label','Training menu');
 hud.innerHTML='<span class="coach-wordmark">FireRoom <small>COACH MODE</small></span><button id="coachSetup" aria-controls="coachDrawer" aria-expanded="false">Connect & menu</button>';
 const drawer=document.createElement('aside');drawer.id='coachDrawer';drawer.hidden=true;drawer.setAttribute('aria-label','Setup and tools');drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');
 drawer.innerHTML='<div class="drawer-heading"><h2>Training setup</h2><button id="coachClose">Back to training</button></div><p>Pair your phone here. Use Left/Right to move, Up/Down to change options, and Select to confirm.</p>';
 const actions=document.createElement('div');actions.className='dialogue-actions';
 const beginner=root.querySelector<HTMLElement>('#beginnerCoach')!,prescribed=root.querySelector<HTMLElement>('#prescribedCoach')!;
 // Keep every control inside its original controller root, including detailed evidence.
 const options=document.createElement('details');options.className='lesson-options';options.innerHTML='<summary>Lesson options</summary>';
 for(const node of Array.from(prescribed.children)){
  if((node.matches('label')&&node.querySelector('[data-prescribed="voice"]'))||node.matches('[data-prescribed="export"],[data-prescribed="feedback"],details'))options.append(node);
 }
 prescribed.append(options);actions.append(beginner,prescribed);dialogue.append(actions);
 // All remaining prototype panels are available in the hidden setup drawer.
 for(const node of Array.from(main.children))if(node!==guide)drawer.append(node);
 main.append(hud,drawer);guide.setAttribute('open','');
 const open=root.querySelector<HTMLButtonElement>('#coachSetup')!,close=root.querySelector<HTMLButtonElement>('#coachClose')!;
 let previous:HTMLElement|null=null;
 const setOpen=(value:boolean)=>{
  if(value)previous=document.activeElement as HTMLElement;
  drawer.hidden=!value;open.setAttribute('aria-expanded',String(value));guide.toggleAttribute('inert',value);hud.toggleAttribute('inert',value);
  if(value)close.focus();else (previous?.isConnected?previous:open).focus();
 };
 open.onclick=()=>setOpen(drawer.hidden);close.onclick=()=>setOpen(false);
 const escape=(event:KeyboardEvent)=>{if((event.key==='Escape'||event.key==='BrowserBack')&&!drawer.hidden){event.preventDefault();setOpen(false);}};
 document.addEventListener('keydown',escape);
 return {dispose(){document.removeEventListener('keydown',escape);}};
}
