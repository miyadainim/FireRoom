/** Progressive disclosure only: measurement and recording behavior stays in main.ts. */
export function installLabGuide(root:HTMLElement){
 const sections=Array.from(root.querySelectorAll<HTMLElement>('main > section'));
 const [setup,capture,labels,results,review,library]=sections;
 const heading=(node:HTMLElement,text:string)=>{node.querySelector('h2')!.textContent=text;};
 heading(setup,'1. Set up your phone');heading(capture,'2. Record your movement');heading(results,'3. Compare the trackers');heading(library,'4. Save your experiment');
 root.querySelector('h1')!.textContent='Make your tracking more reliable';
 root.querySelector('h1 + p')!.textContent='Try one camera setup, record two short clips, then compare how well the trackers see you. Start with the defaults — you can explore the technical settings later.';
 const nav=root.querySelector('nav')!;nav.replaceChildren();nav.setAttribute('aria-label','Experiment steps');
 const steps=[setup,capture,results,library];
 const names=['Set up','Record','Compare','Save'];
 const notice=document.createElement('aside');notice.className='guide-note';notice.innerHTML='<strong>Your first experiment</strong><p>Record a 40-second baseline first. Compare both trackers, then record a separate 56-second test without moving the phone or changing where you stand. Compare that clip too.</p><p><b>Lead</b> means your front hand; <b>rear</b> means your back hand. A short reach means deliberately stopping before full extension.</p>';
 capture.querySelector('h2')!.after(notice);
 const fold=(host:HTMLElement,title:string,nodes:Element[])=>{const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent=title;details.append(summary,...nodes);host.append(details);return details;};
 const labelFor=(id:string)=>root.querySelector(`#${id}`)!.closest('label')!;
 fold(setup,'Optional: resolution and experiment notes',[labelFor('resolution'),labelFor('notes')]);
 fold(capture,'Already have a video? Import it here',[labelFor('videoImport')]);
 fold(capture,'Optional: label an imported clip',[labels]);
 fold(results,'Advanced comparison settings',[labelFor('hz'),labelFor('delegate'),labelFor('tau'),root.querySelector('#reverse')!,root.querySelector('#lite')!]);
 fold(capture,'Optional: check exactly where a joint was placed',[review]);
 fold(library,'Import measurements from a previous experiment',[labelFor('reportImport')]);
 const evidence=results.querySelector('#comparison')!;const evidenceHeading=evidence.previousElementSibling!;
 fold(results,'Technical model comparison',[evidenceHeading,evidence]);
 const explanations=document.createElement('div');explanations.className='guide-note';explanations.innerHTML='<strong>What should I look for?</strong><p><b>Joint placement:</b> does the skeleton follow your real elbow and wrist? <b>Usable frames:</b> how much of the clip passed the tracking checks? <b>Response time:</b> lower milliseconds means faster processing.</p><p>Smoother does not always mean more accurate. Return to Record to inspect the video and skeleton for your selected result. Neither model is a winner until you check it against the video. A dash means the measurement is not available.</p>';
 results.querySelector('h2')!.after(explanations);
 const state=root.querySelector('#status')!;nav.after(state);state.setAttribute('aria-live','polite');
 let active=0;
 const buttons=steps.map((_,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`${i+1} ${names[i]}`;b.onclick=()=>show(i);nav.append(b);return b;});
 function show(index:number){active=index;steps.forEach((section,i)=>section.hidden=i!==index);buttons.forEach((button,i)=>{button.setAttribute('aria-current',i===index?'step':'false');});}
 steps.forEach((section,i)=>{const footer=document.createElement('div');footer.className='step-actions';if(i>0){const back=document.createElement('button');back.textContent='← Back';back.onclick=()=>show(i-1);footer.append(back);}if(i<3){const next=document.createElement('button');next.textContent=`Next: ${names[i+1]} →`;next.onclick=()=>show(i+1);footer.append(next);}section.append(footer);});
 const reopen=document.createElement('button');reopen.id='reopenCamera';reopen.textContent='Open / reopen camera';reopen.onclick=()=>{(root.querySelector('#camera') as HTMLButtonElement).click();};root.querySelector('#record')!.before(reopen);
 const texts:Record<string,string>={conditionId:'Name this setup',angle:'Where is your phone?',lighting:'Where is the light?',framing:'What fits in the picture?',stance:'Which hand is in front?',facing:'Phone camera',protocol:'What are you recording?'};
 for(const [id,text] of Object.entries(texts)){const label=labelFor(id);if(label.firstChild?.nodeType===Node.TEXT_NODE)label.firstChild.textContent=`${text} `;}
 root.querySelector('#record')!.textContent='Start guided recording';root.querySelector('#compare')!.textContent='Compare Full and Heavy';
 root.querySelector('#export')!.textContent='Download experiment results';
 root.querySelector('#protocol option[value="calibration"]')!.textContent='First: baseline poses · 40 seconds';
 root.querySelector('#protocol option[value="evaluation"]')!.textContent='Then: test punches · 56 seconds';
 root.querySelector('#cue')!.textContent='Open your camera in step 1. Choose baseline poses, then start. You have 5 seconds to get into position.';
 root.querySelector('#progress')!.textContent='Record a clip first, then press Compare Full and Heavy. Keep this page open while both trackers process it.';
 const saving=document.createElement('p');saving.textContent='Download results here AND download the video in Record before you close this page. To try another angle, save first, then return to step 1 and give the new setup a different name.';library.querySelector('h2')!.after(saving);
 show(0);return {show,get active(){return active;}};
}
export function movementCue(phase:string,label:string|undefined,stance:string){const lead=stance==='southpaw'?'right':'left',rear=lead==='left'?'right':'left';const cues:Record<string,string>={guard:'Hold both hands in guard','lead-reach':`Hold your ${lead} arm extended`,'rear-reach':`Hold your ${rear} arm extended`,'lead-short':`Hold your ${lead} arm partly extended`,'rear-short':`Hold your ${rear} arm partly extended`,jab:`Throw one ${label==='short'?'short ':''}${lead}-hand jab, then return to guard`,cross:`Throw one ${label==='short'?'short ':''}${rear}-hand cross, then return to guard`,idle:'Stand still — do not punch',occluded:'Briefly hide one wrist behind your body, then return to guard'};return cues[phase]??phase;}
