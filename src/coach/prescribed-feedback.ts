import type {PrescribedAttemptReport} from '../vision/prescribed';
function otherHandMessage(guard:PrescribedAttemptReport['punches'][number]['oppositeGuard']):string {
 if(guard.status==='supported')return 'Your other hand stayed in the checked guard region.';
 if(guard.status==='deviation')return 'Try keeping your other hand higher during the punch.';
 const samples=guard.evidence?.samples??[];
 if(samples.length&&samples.every(s=>s.status==='within-region'||s.status==='below-eye-limit')&&samples.some(s=>s.status==='below-eye-limit')&&guard.observedDurationMs<180)return 'Your guard stayed generally steady, with a brief dip.';
 if(/Brief height excursion|lateral displacement/i.test(guard.reason))return 'Your other hand briefly moved outside the checked region. That is not enough to confirm a guard drop.';
 return 'I couldn’t reliably check your other hand.';
}
/** Encouragement is tied to observed criteria, never an overall form grade. */
export function coachAttemptMessage(report:PrescribedAttemptReport):string {
 const name=report.expected==='jab-cross'?'jab–cross':report.expected;
 if(!report.movementSequenceMatched){
  const reason=report.reasons.join(' ');
  if(/Starting guard not observed|guard before movement/i.test(reason))return 'Let’s set up first. Hold both hands near your face, then try the punch again.';
  if(/count, anatomical hand or sequence order/.test(reason))return 'Let’s try that again. The movements I picked up did not match the requested hands or order. Watch the guide, then have another go.';
  return 'I couldn’t get a clear read of that attempt. Check that your face and both hands are visible, then try again.';
 }
 const praise=report.recoveryStatus==='confirmed'?`Good job! I picked up your ${name} and you brought your punching hand back.`:`Nice effort! I picked up your ${name}, but couldn’t confirm every return to guard.`;
 if(report.punches.some(p=>p.oppositeGuard.status==='deviation'))return praise+' However, try keeping your other hand higher during the punch.';
 if(report.punches.some(p=>p.initialGuard.status==='deviation'))return praise+' Before the next punch, take a moment to set your guard.';
 if(report.punches.some(p=>p.oppositeGuard.status==='cannot-assess'))return praise+' '+otherHandMessage(report.punches.find(p=>p.oppositeGuard.status==='cannot-assess')!.oppositeGuard);
 if(report.punches.some(p=>p.recovery.status!=='supported'))return praise+' I still need a clearer view of your settled guard after the punch. Pause briefly with both hands near your face.';
 return praise+' Well done—your other-hand guard and settled guard after the punch were visible. Keep that control on the next attempt!';
}
export function renderPrescribedFeedback(root:HTMLElement,report:PrescribedAttemptReport){
 root.replaceChildren();
 const line=(tag:string,text:string,parent:HTMLElement=root)=>{const element=document.createElement(tag);element.textContent=text;parent.append(element);return element;};
 line('h3',report.movementSequenceMatched?'Nice work!':'Let’s try again');
 line('p',coachAttemptMessage(report));
 for(const punch of report.punches){
  const name=punch.cycle.type==='jab'?'Jab':'Cross';
  const guard=otherHandMessage(punch.oppositeGuard);
  line('h4',`${name} · ${punch.cycle.hand} hand`);
  line('p',`${punch.recoveryConfirmed?'You brought your punching hand back.':'I couldn’t confirm your punching hand’s return.'} ${guard}`);
  if(punch.recovery.status!=='supported')line('p','I couldn’t confirm a settled guard immediately afterward. Returning the hand and holding guard are separate checks.');
 }
 if(report.guardBoundaries){
  const start=report.guardBoundaries.starting.status==='supported',finish=report.guardBoundaries.finishing.status==='supported';
  line('p',start&&finish?'You showed both hands in guard before and after the sequence.':start?'Your starting guard was visible. I couldn’t confirm the final two-hand guard hold.':finish?'Your finishing guard was visible. I couldn’t confirm the starting two-hand guard hold.':'I couldn’t clearly confirm the two-hand guard holds before and after the sequence.');
 }
 if(report.guardBoundaries?.finishing.status==='supported'&&report.punches.some(p=>p.recovery.status!=='supported'))line('p','I saw your guard later, but that doesn’t tell me whether it was in place immediately after each punch.');
 line('small','These are camera observations, not a complete form grade.');
 const details=document.createElement('details');line('summary','Measurements and details',details);const content=document.createElement('div');renderDetailedFeedback(content,report);details.append(content);root.append(details);
}
function renderDetailedFeedback(root:HTMLElement,report:PrescribedAttemptReport){
 root.replaceChildren();const title=document.createElement('h3');title.textContent=report.movementSequenceMatched?'Requested movements located':report.status==='rejected'?'Requested sequence not confirmed':'Not enough reliable evidence';root.append(title);
 if(report.movementSequenceMatched){const recovery=document.createElement('p');recovery.textContent=report.recoveryStatus==='confirmed'?'Movement sequence observed. Wrist-return recovery confirmed for each movement; guard quality is assessed separately.':'Movement sequence observed. Recovery was not confirmed for every movement; see each movement below.';root.append(recovery);}
 const why=document.createElement('p');why.textContent=report.reasons.join(' ');root.append(why);
 for(const adjustment of report.outcomes.filter(o=>o.classification==='guard-adjustment'&&o.evidence.faceMotion?.status==='stable-near-face')){const note=document.createElement('p');note.textContent=`${adjustment.hand==='left'?'Left':'Right'}-hand motion was consistent with a guard adjustment: it stayed near the eye and nose with little face-relative movement. It was not counted as an additional punch. This does not establish physical intent.`;root.append(note);}
 if(report.guardBoundaries){const heading=document.createElement('h4');heading.textContent='Guard before and after movement';root.append(heading);for(const [label,check] of [['Starting guard · both hands',report.guardBoundaries.starting],['Finishing guard · both hands',report.guardBoundaries.finishing]] as const){const line=document.createElement('p');line.textContent=`${label}: ${check.status==='supported'?'Observed':check.status==='deviation'?'Not confirmed':'Cannot assess'} — ${check.reason}`;root.append(line);}const summary=document.createElement('p');summary.textContent=report.guardBoundaries.status==='supported'?'Starting and finishing guard holds were observed. This does not mean guard was maintained during the movements; see the separate opposite-hand findings.':'A located movement does not mean both guard checks passed. Review the separate starting and finishing observations.';root.append(summary);}
 if(report.punches.length&&!report.movementSequenceMatched){const note=document.createElement('p');note.textContent='Individual located-movement findings are shown below. They do not confirm the full requested sequence.';root.append(note);}
 for(const punch of report.punches){const h=document.createElement('h4');h.textContent=`${punch.cycle.type} · ${punch.cycle.hand} hand`;root.append(h);const observation=document.createElement('p');observation.textContent=`Outward movement: observed. Wrist-return recovery: ${punch.recoveryConfirmed?'confirmed':'not confirmed'}.`;root.append(observation);for(const [label,check] of [['Starting guard',punch.initialGuard],['Other hand during outward phase',punch.oppositeGuard],['Guard observation after return (immediate settled guard)',punch.recovery]] as const){const p=document.createElement('p');p.textContent=`${label}: ${check.status==='supported'?'Observed':check.status==='deviation'?'Check this':'Cannot assess'} — ${check.reason}`;root.append(p);}const guardEvidence=punch.oppositeGuard.evidence;if(guardEvidence){const offsets=guardEvidence.samples.flatMap(s=>s.eyeOffsetShoulderWidths===null?[]:[s.eyeOffsetShoulderWidths]);const measurement=document.createElement('p');measurement.textContent=`Experimental other-hand height: ${offsets.length?Math.max(...offsets).toFixed(2):'unavailable'} shoulder widths below same-side eye at maximum; limit ${guardEvidence.maxBelowEye.toFixed(2)}. Sustained low interval: ${Math.round(punch.oppositeGuard.observedDurationMs??0)} ms. Elbow bend is not required for this height check. ${guardEvidence.samples.some(s=>s.heightScale?.source==='stable-guard')?'Height uses a frozen pre-punch guard width; lateral position still uses the current shoulder width.':'No stable pre-punch width was available; height uses the current shoulder width.'}`;root.append(measurement);}const time=document.createElement('p');const t=punch.cycle.timestamps;const phasePeak=punch.cycle.evidence.movementObservation?.peakMs??t.peakMs;time.textContent=`Observed peak at ${((phasePeak-report.window.startMs)/1000).toFixed(2)} s into the attempt window; recovery ${t.recoveryMs===null?'unavailable':Math.round(t.recoveryMs-phasePeak)+' ms after the observed peak'}. This is timing evidence, not a fast/slow grade.`;root.append(time);if(punch.cycle.evidence.forwardDepth){const depth=punch.cycle.evidence.forwardDepth;const note=document.createElement('p');note.textContent=`Experimental 3D (${depth.mode}): ${depth.status}. ${depth.reason}. Peak camera-forward travel: ${depth.peakForwardShoulderWidths?.toFixed(2)??'unavailable'} shoulder widths; sustained ${Math.round(depth.sustainedDurationMs)} ms. Estimated world coordinates, not contact or force.`;root.append(note);}const extension=document.createElement('p');extension.textContent=`Optional extension: ${punch.extension.status} — ${punch.extension.reason}`;root.append(extension);}
 const limits=document.createElement('p');limits.textContent='These are camera-supported observations, not an overall correct-technique score. Physical coaching accuracy NOT VERIFIED.';root.append(limits);
}

/** Explain separate observations without converting uncertain evidence into a technique fault. */
export function guardObservationSummary(punch:PrescribedAttemptReport['punches'][number]):string {
 const parts:string[]=[];
 parts.push(punch.recoveryConfirmed?'Recovery confirmed means the wrist returned; it does not by itself confirm a held guard.':'Wrist-return recovery was not confirmed.');
 parts.push(punch.recovery.status==='supported'?'Immediate settled guard after return: observed.':`Immediate settled guard after return: cannot confirm. ${punch.recovery.reason}`);
 if(punch.oppositeGuard.status==='cannot-assess'){
  parts.push(/Brief height excursion|lateral displacement/i.test(punch.oppositeGuard.reason)
   ?'Other-hand guard is inconclusive: a brief height excursion or sideways movement did not establish a sustained guard drop.'
   :`Other-hand guard is inconclusive: ${punch.oppositeGuard.reason}.`);
 }
 return parts.join(' ');
}
