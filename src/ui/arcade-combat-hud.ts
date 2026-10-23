import type {ArcadeSnapshot} from '../game/arcade';
import {ARCADE_BALANCE} from '../game/arcade-combat-contracts';
export function mountArcadeCombatHud(root:HTMLElement,actions:{fallback:()=>void;rematch:()=>void;menu:()=>void}){
 const combo=document.createElement('aside');combo.className='hit-combo';combo.setAttribute('aria-label','Hit combo');combo.hidden=true;
 combo.innerHTML='<strong></strong><span>HIT COMBO!</span><small></small><i><b></b></i>';
 const technique=document.createElement('div');technique.className='technique-callout';technique.setAttribute('role','status');technique.hidden=true;
 const finish=document.createElement('section');finish.className='finisher-callout';finish.hidden=true;
 finish.innerHTML='<strong>FINISH HIM!</strong><p>One final jab or cross. Stay in place.</p><button id="finisherFallback">Skip finisher</button>';
 const results=document.createElement('section');results.className='combat-results';results.hidden=true;results.setAttribute('aria-label','Round results');
 results.innerHTML='<small>FIRE ROOM / FIRST RIVAL</small><h1></h1><p data-result-subtitle></p><dl></dl><nav><button id="combat-rematch">Rematch</button><button id="combat-menu">Arcade menu</button><a href="/">Coach Mode</a></nav>';
 root.append(combo,technique,finish,results);
 const fallback=finish.querySelector<HTMLButtonElement>('button')!;fallback.onclick=actions.fallback;
 results.querySelector<HTMLButtonElement>('#combat-rematch')!.onclick=actions.rematch;results.querySelector<HTMLButtonElement>('#combat-menu')!.onclick=actions.menu;
 let previousCombo=0,feedback='',feedbackAt=-Infinity,lastPhase='',feedbackRevision=-1;
 return {render(s:ArcadeSnapshot,now:number,held:boolean){
  const active=s.status==='running'&&s.phase==='FIGHTING';combo.hidden=!active||s.combo<1;
  if(s.combo!==previousCombo){combo.classList.remove('combo-pop');void combo.offsetWidth;combo.classList.add('combo-pop');previousCombo=s.combo;}
  combo.querySelector('strong')!.textContent=String(s.combo);combo.querySelector('small')!.textContent=s.combo>=5?'ON FIRE!':s.combo>=3?'NICE!':'';
  (combo.querySelector('b') as HTMLElement).style.transform='scaleX('+Math.max(0,Math.min(1,s.comboRemainingMs/ARCADE_BALANCE.comboWindowMs))+')';
  combo.dataset.level=s.combo>=5?'high':'normal';
  if(s.techniqueFeedback!==feedback||s.techniqueRevision!==feedbackRevision){feedbackRevision=s.techniqueRevision;feedback=s.techniqueFeedback;feedbackAt=now;}
  technique.textContent=feedback;technique.hidden=!active||!feedback||now-feedbackAt>1800;
  const finishing=s.phase==='FINISHER_INTRO'||s.phase==='FINISHER_READY';finish.hidden=!finishing||(s.status!=='running'&&s.status!=='paused');
  finish.querySelector('p')!.textContent=s.phase==='FINISHER_READY'?'One final jab or cross. Stay in place.':'Ren Mori is stunned. Get ready…';fallback.hidden=false;
  results.hidden=s.status!=='complete';
  if(!results.hidden){results.querySelector('h1')!.textContent=s.result==='win'?'VICTORY!':s.result==='loss'?'ROUND LOST':'DRAW';results.querySelector('[data-result-subtitle]')!.textContent=s.result==='win'?(s.opponentHealth===0?'Ren Mori defeated':'Round won on remaining health'):'Ren Mori · First sparring round';
   results.querySelector('dl')!.innerHTML=[['Successful hits',s.stats.hits],['Highest hit combo',s.highestCombo],['Clean jabs',s.cleanJabs],['Clean crosses',s.cleanCrosses],['Clean jab–crosses',s.cleanCombinations],['Successful blocks',s.stats.playerBlocks]].map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>').join('');
  }
  if(s.phase!==lastPhase){lastPhase=s.phase;if(s.phase==='FINISHER_READY'&&!held&&s.status==='running')fallback.focus();if(s.phase==='RESULTS'&&s.status==='complete')results.querySelector<HTMLButtonElement>('button')!.focus();}
 },dispose(){combo.remove();technique.remove();finish.remove();results.remove();}};
}
