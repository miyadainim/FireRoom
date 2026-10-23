import type {DialogueEvidence} from '../coach/dialogue-presentation';
export type AtlasTutorialShot='full'|'legs'|'guard'|'approval'|null;
export const ATLAS_TUTORIAL_STEPS=[
 {shot:'full',label:'FIRST LESSON · WATCH ATLAS',text:'The first step to boxing is knowing how to stand. Look closely...',duration:6500},
 {shot:'legs',label:'STANCE · LEAD & REAR FOOT',text:'My left foot leads; my right foot stays behind. Keep your feet comfortably apart and staggered, with soft knees and a balanced posture. This is a teaching view, not a camera measurement.',duration:11000},
 {shot:'guard',label:'GUARD · HANDS, ELBOWS & CHIN',text:'Bring both hands near your face. Keep your elbows close to your ribs, relax your shoulders and tuck your chin slightly.',duration:8500},
 {shot:'full',label:'PUT IT TOGETHER',text:'Feet staggered. Knees relaxed. Hands up. Keep the position comfortable and balanced.',duration:6000},
 {shot:'approval',label:'READY TO PRACTISE',text:'That is our starting position. Take your time and keep your movements controlled.',duration:4500},
 {shot:'approval',label:'YOUR TURN',text:'Now you try!',duration:0},
] as const;
/** Presentation-only intro. Player stance confirmation and guard evidence stay in mountBeginner. */
export function mountAtlasTutorial(root:HTMLElement,options:{shot:(shot:AtlasTutorialShot)=>void;present:(evidence:DialogueEvidence)=>void;release:()=>void;onStart?:()=>void}){
 const guide=root.querySelector<HTMLElement>('#guidePanel')!,beginner=root.querySelector<HTMLElement>('#beginnerCoach')!,prescribed=root.querySelector<HTMLElement>('#prescribedCoach')!;
 const actions=document.createElement('div');actions.className='atlas-tutorial-actions';
 actions.innerHTML='<button data-tutorial="back">Previous</button><button class="primary" data-tutorial="next">Continue</button><button data-tutorial="pause">Pause tutorial</button><button data-tutorial="skip">Skip introduction</button>';
 root.querySelector('.dialogue-actions')!.append(actions);
 const caption=document.createElement('div');caption.className='atlas-focus-caption';caption.setAttribute('role','status');guide.append(caption);
 const replay=document.createElement('button');replay.textContent='Replay Atlas introduction';root.querySelector('#coachDrawer')!.append(replay);
 let index=0,timer:ReturnType<typeof setTimeout>|undefined,active=false,paused=false;
 const button=(name:string)=>actions.querySelector<HTMLButtonElement>(`[data-tutorial="${name}"]`)!;
 const show=()=>{
  clearTimeout(timer);const step=ATLAS_TUTORIAL_STEPS[index];
  options.shot(step.shot);options.present({source:index===0?'introduction':'guide',text:step.text});
  caption.textContent=`${index+1} / ${ATLAS_TUTORIAL_STEPS.length} · ${step.label}`;caption.dataset.shot=step.shot;
  button('back').hidden=index===0;button('next').textContent=index===ATLAS_TUTORIAL_STEPS.length-1?'Practise stance & guard':'Continue';
  button('pause').hidden=!step.duration;button('pause').textContent=paused?'Play tutorial':'Pause tutorial';
  if(step.duration&&!paused)timer=setTimeout(()=>{index++;show();},step.duration);
 };
 const finish=()=>{
  clearTimeout(timer);active=false;actions.hidden=true;caption.hidden=true;beginner.hidden=false;
  options.shot(null);options.release();
  // Resume the existing lesson at its current state; never mark technique observed.
  const status=beginner.querySelector<HTMLElement>('[data-beginner="status"]');
  if(status){status.textContent=beginner.querySelector('[data-beginner="stance"]')?'Now you try! Choose your stance, then confirm your own foot placement and posture.':status.textContent;}
  prescribed.hidden=!!beginner.querySelector('[data-beginner="stance"],[data-beginner="practise"]');
  (beginner.querySelector('select,button') as HTMLElement|null)?.focus();
 };
 const start=()=>{
  const close=root.querySelector<HTMLButtonElement>('#coachClose');if(root.querySelector<HTMLElement>('#coachDrawer')?.hidden===false)close?.click();
  options.onStart?.();active=true;paused=false;index=0;beginner.hidden=true;prescribed.hidden=true;actions.hidden=false;caption.hidden=false;show();button('next').focus();
 };
 button('next').onclick=()=>{if(index===ATLAS_TUTORIAL_STEPS.length-1)finish();else{index++;show();}};
 button('pause').onclick=()=>{paused=!paused;show();};
 button('back').onclick=()=>{index=Math.max(0,index-1);show();};button('skip').onclick=finish;replay.onclick=start;
 // Pause reading time while setup is open; resume the current shot on return.
 const drawer=root.querySelector('#coachDrawer');const observer=new MutationObserver(()=>{if(!active)return;if((drawer as HTMLElement).hidden)show();else clearTimeout(timer);});
 if(drawer)observer.observe(drawer,{attributes:true,attributeFilter:['hidden']});
 start();
 return {dispose(){clearTimeout(timer);observer.disconnect();actions.remove();caption.remove();replay.remove();options.shot(null);options.release();}};
}
