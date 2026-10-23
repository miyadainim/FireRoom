import {HandsFreeCoach,type HandsFreeEvent,type HandsFreeLesson} from '../game/hands-free-coach';
import type {PoseFrame,Stance} from '../shared/contracts';
import type {PrescribedAttemptExport} from '../game/prescribed-coach';
import {coachAttemptMessage} from '../coach/prescribed-feedback';
import {observeGuardHeight} from '../vision/guard-height';
import type {DialogueEvidence} from '../coach/dialogue-presentation';
import type {AtlasTutorialShot} from '../game/atlas-tutorial';

/** Sole owner of default lesson progression. Legacy manual controls remain in the drawer. */
export function mountHandsFreeTraining(root:HTMLElement,options:{
 connected:()=>boolean; stance:()=>Stance; setStance:(stance:Stance)=>void;
 present:(evidence:DialogueEvidence)=>void; demonstrate:(lesson:HandsFreeLesson,stance:Stance)=>void;
 shot:(shot:AtlasTutorialShot)=>void; cancelDemo:()=>void;
 startAttempt:(lesson:'jab'|'cross'|'jab-cross')=>boolean|undefined; cancelAttempt:()=>void;
}){
 const drawer=root.querySelector<HTMLElement>('#coachDrawer')!;
 const host=document.createElement('section');host.className='hands-free-training';host.setAttribute('aria-label','Guided training');
 host.innerHTML='<p class="training-phase" role="status"></p><div class="training-progress" hidden><label for="guardHold">GUARD HOLD <span></span></label><progress id="guardHold" max="3000" value="0"></progress></div><div class="training-setup"><label>Your stance <select aria-label="Training stance"><option value="orthodox">Orthodox · left side leads</option><option value="southpaw">Southpaw · right side leads</option></select></label><button data-training="begin">My stance is ready · Begin lesson</button></div><button data-training="connect">Connect phone camera</button><div class="training-invitation" hidden><a class="primary" href="/arcade.html">Enter Arcade Mode</a><button data-training="again">Practise Again</button><button data-training="menu">Return to Main Menu</button></div><button data-training="resume" hidden>Resume training</button>';
 root.querySelector('.dialogue-actions')!.append(host);
 const controls=document.createElement('details');controls.innerHTML='<summary>Training options · pause, replay & skip</summary><button data-training="pause">Pause training</button><button data-training="replay">Replay demonstration</button><button data-training="skip">Skip this lesson</button><button data-training="restart">Restart beginner training</button><button data-training="exit">Exit training</button><p>Skipping is available when tracking cannot confirm a movement. It does not record a passed lesson. Stance is a self-check; foot placement is not measured.</p>';
 drawer.prepend(controls);
 const el=<T extends HTMLElement>(selector:string)=>host.querySelector<T>(selector)!;
 const phase=el('.training-phase'),setup=el('.training-setup'),invitation=el('.training-invitation'),progress=el('.training-progress');
 const stance=el<HTMLSelectElement>('select');stance.value=options.stance();
 let manual=false,ready=false,started=false,disposed=false,manualPause=false,attemptEpoch=-1,lastFrame:PoseFrame|undefined,lastArrival=0,context='',demoDeadline=Infinity,introIndex=-1,introDeadline=Infinity,lastMessage='',lastAttempting=false,guardGhostShown=false;
 const completed=new Set<string>();
 const now=()=>performance.now();
 const message=(text:string,source:DialogueEvidence['source']='status')=>{if(text!==lastMessage){lastMessage=text;options.present({source,text});}};
 const closeMenu=()=>{if(!drawer.hidden)root.querySelector<HTMLButtonElement>('#coachClose')!.click();};
 const contextOf=(f:PoseFrame)=>JSON.stringify([f.sessionId,f.cameraConfigurationId,f.stance,f.imageSize]);
 const lead=()=>stance.value==='southpaw'?'right':'left';
 const intro=[{shot:'full',duration:4500,text:()=> 'The first step to boxing is knowing how to stand. Look closely...'},
 {shot:'legs',duration:7000,text:()=>`Your ${lead()} foot leads; the other stays behind. Stagger your feet comfortably, relax your knees and stay balanced. Check your own setup; the camera does not measure your feet.`},
 {shot:'guard',duration:5500,text:()=> 'Raise your hands near your cheeks, keep your elbows comfortably tucked, and your chin slightly down.'}] as const;
 function showIntro(){const step=intro[introIndex];options.shot(step.shot);phase.textContent='STANCE · WATCH ATLAS';message(step.text(),'guide');introDeadline=now()+step.duration;}
 function cancel(){options.cancelAttempt();options.cancelDemo();demoDeadline=Infinity;}
 function event(event:HandsFreeEvent){
  const s=event.snapshot;
  if(event.type==='cancel'){cancel();return;}
  if(event.type==='demo'){
   guardGhostShown=false;
   options.shot(s.lesson==='guard'?'guard':null);options.demonstrate(s.lesson,stance.value as Stance);
   // Guard framing explains posture first, then foreground gloves demonstrate the raise.
   demoDeadline=now()+(s.lesson==='guard'?7500:s.lesson==='jab-cross'?5000:4200);
   message(s.lesson==='guard'?"Now let's learn how to protect ourselves. Raise your hands near your cheeks, keep your elbows comfortably tucked, and your chin slightly down.":s.lesson==='jab'?`Watch the jab: your ${lead()} hand moves out, then comes back to guard.`:s.lesson==='cross'?`Watch the cross: your ${lead()==='left'?'right':'left'} hand moves out, then comes back to guard.`:'Watch: guard, jab, cross, and back to guard.','guide');
  }
  if(event.type==='observe'){
   options.shot(null);attemptEpoch=s.epoch;
   message(s.lesson==='guard'?'Now you try! Raise your guard and hold it for three seconds.':s.lesson==='jab-cross'?'Now put them together. Jab, cross, and back to guard!':`Now you try! ${s.lesson==='jab'?'Jab':'Cross'}, then return to guard.`);
   if(s.lesson!=='guard'&&!options.startAttempt(s.lesson))queueMicrotask(()=>{if(flow.snapshot.epoch===s.epoch)flow.trackingLost(now());});
  }
  if(event.type==='lesson-completed'){completed.add(s.lesson);try{localStorage.setItem('fireroom.handsfree.completed.v1',JSON.stringify([...completed]));}catch{/* Optional progress storage. */}}
  if(event.type==='change'){
   phase.textContent=`${s.lesson.toUpperCase().replace('-','–')} · ${s.phase==='DEMONSTRATING'?'WATCH':s.phase==='OBSERVING'?'YOUR TURN':s.phase==='FEEDBACK'?'NICELY DONE':s.phase==='TRACKING_PAUSED'?'PAUSED':s.phase.replace(/_/g,' ')}`;
   progress.hidden=!(s.lesson==='guard'&&s.phase==='OBSERVING');el<HTMLProgressElement>('progress').value=s.guardHeldMs;el('.training-progress span').textContent=`${(s.guardHeldMs/1000).toFixed(1)} / 3.0 seconds`;
   el('[data-training="resume"]').hidden=!s.paused;
   if(['FEEDBACK','RETRY_GUIDANCE','TRACKING_PAUSED','COMPLETED'].includes(s.phase))message(s.message);
  }
  if(event.type==='invitation'){invitation.hidden=false;phase.textContent='TRAINING COMPLETE · MEET REN MORI';message("Well done! You've learned your stance, your guard, and your first combinations. But training is only the beginning. Meet Ren Mori in Arcade Mode. Think you're ready? Step into the ring and put those new moves to the test!");}
 }
 const flow=new HandsFreeCoach({onEvent:event,externalEvaluation:true,readingMs:6500,retryReadingMs:6500});
 function clearUserPause(){manualPause=false;el('[data-training="resume"]').hidden=true;}
 function welcome(){clearUserPause();manual=false;root.querySelector('#manualCoachBody')?.setAttribute('inert','');cancel();flow.exit(now());started=false;ready=false;introIndex=-1;introDeadline=Infinity;invitation.hidden=true;setup.hidden=true;progress.hidden=true;options.shot(null);phase.textContent='WELCOME TO FIREROOM';message('Welcome! I’m Coach Atlas. Connect your phone camera and I’ll guide you through stance, guard and your first punches. Clear your space and shadowbox gently.');}
 function begin(){if(!options.connected()){message('Connect your phone camera first. Keep its camera page open.');return;}clearUserPause();ready=true;started=true;setup.hidden=true;el('[data-training="connect"]').hidden=true;completed.add('stance');options.setStance(stance.value as Stance);introIndex=0;showIntro();}
 el('[data-training="begin"]').onclick=begin;
 stance.onchange=()=>options.setStance(stance.value as Stance);
 el('[data-training="connect"]').onclick=()=>{root.querySelector<HTMLButtonElement>('#coachSetup')!.click();if(!lastFrame)root.querySelector<HTMLButtonElement>('#pairStart')?.click();};
 controls.querySelector<HTMLButtonElement>('[data-training="pause"]')!.onclick=()=>{manualPause=true;introDeadline=Infinity;options.shot(null);flow.pause(now());el('[data-training="resume"]').hidden=false;message('Training paused. Resume when you are ready.');};
 el('[data-training="resume"]').onclick=()=>{manualPause=false;el('[data-training="resume"]').hidden=true;closeMenu();if(introIndex>=0)showIntro();else flow.resume(now());};
 controls.querySelector<HTMLButtonElement>('[data-training="replay"]')!.onclick=()=>{clearUserPause();closeMenu();if(introIndex>=0)showIntro();else if(started){if(flow.snapshot.paused)flow.resume(now());else flow.replay(now());}};
 controls.querySelector<HTMLButtonElement>('[data-training="skip"]')!.onclick=()=>{clearUserPause();closeMenu();if(introIndex>=0){introIndex=-1;introDeadline=Infinity;options.shot(null);flow.start(now());}else if(started){if(flow.snapshot.paused)flow.resume(now());flow.skip(now());}};
 const restart=()=>{closeMenu();welcome();};
 controls.querySelector<HTMLButtonElement>('[data-training="restart"]')!.onclick=restart;controls.querySelector<HTMLButtonElement>('[data-training="exit"]')!.onclick=()=>{welcome();};
 el('[data-training="again"]').onclick=()=>{clearUserPause();invitation.hidden=true;flow.start(now());};el('[data-training="menu"]').onclick=()=>{welcome();root.querySelector<HTMLButtonElement>('#coachSetup')!.click();};
 try{const saved=JSON.parse(localStorage.getItem('fireroom.handsfree.completed.v1')??'[]');if(Array.isArray(saved))for(const l of saved)if(['stance','guard','jab','cross','jab-cross'].includes(l))completed.add(l);}catch{/* Optional. */}
 if(completed.has('guard')){const skip=document.createElement('button');skip.textContent='Skip previously completed stance & guard';setup.append(skip);skip.onclick=()=>{if(!options.connected())return;clearUserPause();ready=true;started=true;setup.hidden=true;options.setStance(stance.value as Stance);flow.start(now(),'jab');};}
 const observer=new MutationObserver(()=>{if(!started)return;if(!drawer.hidden){introDeadline=Infinity;options.shot(null);flow.pause(now());}else if(!manualPause){if(introIndex>=0)showIntro();else flow.resume(now());}});observer.observe(drawer,{attributes:true,attributeFilter:['hidden']});
 const visibility=()=>{if(document.hidden&&started){manualPause=true;introDeadline=Infinity;options.shot(null);flow.pause(now());}};document.addEventListener('visibilitychange',visibility);
 const timer=setInterval(()=>{
  if(disposed||manual)return;const time=now();
  if(!started){const connected=options.connected();setup.hidden=!connected;el('[data-training="connect"]').hidden=connected;if(connected){phase.textContent='STANCE SETUP · SELF CHECK';message('Choose your lead side. Stagger your feet, soften your knees and tuck your chin. Confirm when your setup feels ready. The camera does not measure foot placement.');}return;}
  if(!drawer.hidden||manualPause)return;
  if(introIndex>=0){if(!options.connected()){introDeadline=Infinity;message('Camera updates paused. Keep the phone camera open and check your connection.');return;}if(introDeadline===Infinity){showIntro();return;}if(time>=introDeadline){introIndex++;if(introIndex<intro.length)showIntro();else{introIndex=-1;options.shot(null);flow.start(time);}}return;}
  const s=flow.snapshot;
  if(lastArrival&&time-lastArrival>350&&!['COMPLETED','INTRO','TRACKING_PAUSED'].includes(s.phase)){flow.trackingLost(time);return;}
  if(s.phase==='DEMONSTRATING'&&time>=demoDeadline){options.cancelDemo();options.shot(null);flow.demonstrationFinished(time,s.epoch);}
  else if(s.phase==='DEMONSTRATING'&&s.lesson==='guard'&&demoDeadline-time<3500&&!guardGhostShown){guardGhostShown=true;options.shot(null);options.demonstrate('guard',stance.value as Stance);}
  flow.tick(time);
 },100);
 welcome();
 return {result(attempt:PrescribedAttemptExport){
  if(!started||flow.snapshot.paused||flow.snapshot.lesson!==attempt.config.expected||flow.snapshot.epoch!==attemptEpoch)return;
  const r=attempt.rules;const epoch=attemptEpoch;
  queueMicrotask(()=>{if(disposed||flow.snapshot.epoch!==epoch)return;
   const insufficient=r.punches.some(p=>p.oppositeGuard.reason.includes('Insufficient reliable'))||attempt.frames.some(f=>f.tracking==='lost');
   const noMovement=!r.outcomes.some(o=>o.classification!=='guard-adjustment');
   if(insufficient){flow.result({now:now(),epoch,outcome:'uncertain',message:'I couldn’t reliably check your posture. Check your camera position.'});return;}
   if(noMovement&&flow.snapshot.phase==='OBSERVING'){options.startAttempt(attempt.config.expected);return;}
   const success=r.movementSequenceMatched&&r.recoveryStatus==='confirmed';
   const imperfect=r.punches.some(p=>p.oppositeGuard.status==='deviation');
   flow.result({now:now(),epoch,outcome:success?(imperfect?'imperfect':'success'):r.status==='rejected'?'wrong':'incomplete',message:coachAttemptMessage(r)+(imperfect?' Let’s try once more.':'')});
  });
 },receive(frame:PoseFrame){
  if(manual)return;const time=now(),nextContext=contextOf(frame),previous=lastFrame;
  if(previous&&(context!==nextContext||frame.sequence<=previous.sequence||frame.timestampMs<=previous.timestampMs)){cancel();flow.resetContext(time);}
  context=nextContext;lastFrame=frame;lastArrival=time;if(!previous&&!ready){stance.value=frame.stance;options.setStance(frame.stance);}
  if(!started||introIndex>=0||frame.stance!==stance.value){flow.pose({now:time,sequence:frame.sequence,sourceMs:frame.timestampMs,guard:'unknown'});if(started&&frame.stance!==stance.value){message(`Set your phone stance to ${stance.value} to match this lesson.`);}return;}
  const hands=[observeGuardHeight(frame,'left'),observeGuardHeight(frame,'right')];
  const guard=frame.tracking==='lost'||hands.some(h=>h.status==='unknown')?'unknown':hands.every(h=>h.status==='within-region'&&h.eyeOffsetShoulderWidths!>=-.5);
  // Activity is observable displacement, never a technique judgment.
  lastAttempting=!!previous&&[15,16].some(i=>frame.landmarks[i]&&previous.landmarks[i]&&Math.hypot(frame.landmarks[i].x-previous.landmarks[i].x,frame.landmarks[i].y-previous.landmarks[i].y)>.015);
  flow.pose({now:time,sequence:frame.sequence,sourceMs:frame.timestampMs,guard,attempting:lastAttempting});
 },manualActive:()=>manual,setManual(value:boolean){manual=value;manualPause=value;cancel();introDeadline=Infinity;if(value){flow.pause(now());el('[data-training="resume"]').hidden=true;message('Manual practice is active. Use the training menu controls, then return to guided training.');}else if(started){if(introIndex>=0)showIntro();else flow.resume(now());}else welcome();},dispose(){disposed=true;clearInterval(timer);observer.disconnect();document.removeEventListener('visibilitychange',visibility);flow.exit(now());host.remove();controls.remove();},snapshot:()=>flow.snapshot};
}
