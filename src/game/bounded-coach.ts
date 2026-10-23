import type {GeometryMode,PoseFrame} from '../shared/contracts';
import type {DtwEvaluation,DtwReference,DtwMode,PrescribedDrill} from '../vision/dtw/types';
import {evaluateAttempt,validateReference} from '../vision/dtw/evaluate';
export function mountBoundedCoach(root:HTMLElement,options:{connected:()=>boolean;drill:()=>PrescribedDrill;onEvaluation:(evaluation:DtwEvaluation)=>void;onReset?:()=>void}){
 root.innerHTML=`<h2>Prescribed-sequence comparison · experimental</h2><p>Countdown → perform the selected drill once → return to guard → feedback. Requires a separately reviewed MediaPipe reference from a matching camera placement. DTW alignment is not a technique score.</p><label>Comparison geometry <select data-role="mode"><option value="world-3d">World XYZ</option><option value="image-2d">Image XY (no depth)</option></select></label><label>Capture seconds <select data-role="duration"><option>6</option><option>4</option><option>8</option><option>10</option></select></label><label>Camera placement <input data-role="placement" placeholder="e.g. phone left-oblique, upper-chest height"></label><p data-role="reference">No reviewed reference loaded. Candidate captures cannot provide coaching.</p><label>Load reviewed reference JSON <input data-role="import" type="file" accept="application/json,.json"></label><button data-role="candidate">Capture reference candidate</button><button data-role="start">Start bounded attempt</button><button data-role="stop">Stop capture</button><button data-role="export">Export last capture + evaluation</button><p data-role="status" role="status">Ready. Live rule detector remains a separate baseline.</p><pre data-role="result"></pre>`;
 const element=<T extends HTMLElement>(role:string)=>root.querySelector<T>(`[data-role="${role}"]`)!;
 const status=(text:string)=>{element('status').textContent=text;};
 let reference:DtwReference|null=null,frames:PoseFrame[]=[],capture:'candidate'|'attempt'|null=null,counting=false,timer:ReturnType<typeof setInterval>|undefined,lastArrival=0,goTime=0,firstArrival=0,lastExport:unknown=null;
 let mode:DtwMode='world-3d',placement='',drill:PrescribedDrill='jab',firstSession='';
 const stopTimer=()=>{if(timer)clearInterval(timer);timer=undefined;};
 const show=(evaluation:DtwEvaluation)=>{element('result').textContent=JSON.stringify(evaluation,null,2);options.onEvaluation(evaluation);};
 const reject=(reason:string):DtwEvaluation=>({schemaVersion:1,kind:'fireroom-dtw-evaluation',status:'rejected',reasons:[reason],alignment:null,coverage:0,phaseCoverage:[],findings:[],timing:{attemptDurationMs:0,referenceDurationMs:0,durationRatio:null,maxGapMs:0},limitations:['No technique assessment was made.']});
 const finish=()=>{
  stopTimer();if(counting){counting=false;capture=null;status('Countdown cancelled.');return;}if(!capture){status('No active capture.');return;}
  const kind=capture;capture=null;
  if(!frames.length){status('No phone frames were captured. Check pairing and camera.');return;}
  if(kind==='candidate'){
   const candidate:DtwReference={schemaVersion:1,kind:'fireroom-dtw-reference',id:`candidate-${Date.now()}`,drill,stance:frames[0].stance,geometryMode:mode,cameraPlacement:placement,review:{status:'pending',reviewer:'',reviewedAt:''},frames,phases:[]};
   lastExport=candidate;status(`Captured ${frames.length} candidate frames. Export for review and phase annotation. This is NOT a reviewed reference.`);element('result').textContent='Reference review and phase annotations required. See docs/DTW_COACH_MODE.md.';
  }else{
   const evaluation=performance.now()-lastArrival>350?reject('Capture ended with stale phone observations; attempt rejected.'):firstArrival-goTime>350||lastArrival-firstArrival<(performance.now()-goTime)*.8?reject('Insufficient capture-window observation coverage; attempt rejected.'):evaluateAttempt(frames,reference);
   lastExport={schemaVersion:1,kind:'fireroom-bounded-attempt',drill,geometryMode:mode,cameraPlacement:placement,referenceId:reference?.id??null,frames,evaluation};show(evaluation);status(`Attempt ${evaluation.status}. ${evaluation.reasons.join(' ')}`);
  }
 };
 const begin=(kind:'candidate'|'attempt')=>{
  if(capture||counting){status('Stop the current capture first.');return;}if(!options.connected()){status('Connect the phone camera first.');return;}
  mode=element<HTMLSelectElement>('mode').value as DtwMode;placement=element<HTMLInputElement>('placement').value.trim();drill=options.drill();
  if(!placement){status('Describe the current camera placement before recording.');return;}
  if(kind==='attempt'){
   if(!reference){show(evaluateAttempt([],null));status('Load a reviewed reference first. Capture a candidate if you need one.');return;}
   if(reference.geometryMode!==mode||reference.drill!==drill||reference.cameraPlacement.trim()!==placement){status('Drill, geometry and camera placement must match the reviewed reference exactly.');return;}
  }
  options.onReset?.();frames=[];lastExport=null;firstSession='';capture=kind;counting=true;let remaining=3;status(`Starting in ${remaining}… hold guard.`);element('result').textContent='';
  timer=setInterval(()=>{remaining--;if(remaining>0){status(`Starting in ${remaining}… hold guard.`);return;}stopTimer();counting=false;if(!options.connected()){capture=null;status('Phone disconnected during countdown.');return;}
   const duration=Number(element<HTMLSelectElement>('duration').value);let elapsed=0;lastArrival=0;firstArrival=0;goTime=performance.now();status(`GO: perform ${drill} once, then hold guard (${duration}s).`);
   timer=setInterval(()=>{elapsed++;if(elapsed>=duration){finish();return;}status(`Recording ${kind}: ${elapsed}/${duration}s · ${frames.length} frames. Return to guard before the end.`);},1000);
  },1000);
 };
 element('candidate').onclick=()=>begin('candidate');element('start').onclick=()=>begin('attempt');element('stop').onclick=finish;
 element<HTMLInputElement>('import').onchange=async()=>{if(capture||counting){status('Stop capture before replacing a reference.');return;}const input=element<HTMLInputElement>('import'),file=input.files?.[0];if(!file)return;
  try{if(file.size>12*1024*1024)throw Error('Reference file exceeds 12 MB');const candidate:unknown=JSON.parse(await file.text());const validation=validateReference(candidate);if(!validation.valid)throw Error(validation.errors.join('; '));reference=candidate as DtwReference;options.onReset?.();element('reference').textContent=`Reviewed reference: ${reference.id} · ${reference.drill} · ${reference.stance} · ${reference.geometryMode} · reviewer ${reference.review.reviewer}. Review metadata is an attestation, not independently verified accuracy.`;element<HTMLSelectElement>('mode').value=reference.geometryMode;element<HTMLInputElement>('placement').value=reference.cameraPlacement;status('Reference loaded. Select its matching drill before starting.');}
  catch(error){reference=null;options.onReset?.();element('reference').textContent='No valid reviewed reference loaded.';status(`Reference rejected: ${error instanceof Error?error.message:String(error)}`);}finally{input.value='';}
 };
 element('export').onclick=()=>{if(capture||counting){status('Stop capture before exporting.');return;}if(!lastExport){status('Capture a candidate or attempt first.');return;}const url=URL.createObjectURL(new Blob([JSON.stringify(lastExport,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='fireroom-bounded-capture.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const cancel=()=>{stopTimer();capture=null;counting=false;options.onReset?.();};window.addEventListener('pagehide',cancel);
 return {receive(frame:PoseFrame){if(!capture||counting)return;if(firstSession&&frame.sessionId!==firstSession){cancel();status('Pairing changed; capture cancelled.');return;}if(!firstSession)firstSession=frame.sessionId;if(frames.length>=600){finish();return;}const copy=structuredClone(frame);copy.sessionId='bounded-capture';frames.push(copy);lastArrival=performance.now();if(!firstArrival)firstArrival=lastArrival;},cancel};
}
