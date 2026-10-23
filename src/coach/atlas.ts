import {isGameAction,type GameAction,type TechniqueReport} from '../shared/contracts';
export interface CoachProvider {answer(question:string,report:TechniqueReport|null):Promise<{text:string;action?:unknown}>}
export async function askAtlas(question:string,report:TechniqueReport|null,provider?:CoachProvider):Promise<{text:string;action?:GameAction;source:'offline'|'provider'}>{
 if(provider){let timer:ReturnType<typeof setTimeout>|undefined;try{const result=await Promise.race([provider.answer(question,report),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),5000);})]);return {text:report?`Coach Atlas evidence: ${report.observations.join(' ')} Virtual score: ${report.score}.`:'Coach Atlas: No observed punch evidence yet.',action:isGameAction(result.action)?result.action:undefined,source:'provider'};}catch{}finally{clearTimeout(timer);}}
 const q=question.toLowerCase();const action:GameAction|undefined=q.includes('replay')?{schemaVersion:1,type:'replay_combo'}:q.includes('slow')?{schemaVersion:1,type:'set_playback_speed',speed:0.5}:q.includes('jab only')?{schemaVersion:1,type:'load_drill',drill:'jab'}:q.includes('summary')?{schemaVersion:1,type:'get_performance_summary'}:undefined;
 return {text:report?`Offline Coach Atlas: ${report.observations.join(' ')} Virtual score: ${report.score}. Keep movements controlled; return to guard.`:'Offline Coach Atlas: No observed punch evidence yet. Watch the guide, then try a controlled jab and return to guard. Stop if uncomfortable.',action,source:'offline'};
}

/** Bounded sequence evidence has no numeric technique grade. No provider is configured here. */
export async function askSequenceAtlas(question:string,evidence:import('../vision/dtw/types').DtwEvaluation):Promise<{text:string;action?:GameAction;source:'offline'}>{
 const action=question.toLowerCase().includes('replay')?{schemaVersion:1 as const,type:'replay_combo' as const}:undefined;
 const findings=evidence.findings.map(f=>`${f.phase} ${f.criterion}: ${f.status}. ${f.message}`);
 return {source:'offline',action,text:`Offline Coach Atlas · prescribed sequence ${evidence.status}. ${evidence.reasons.join(' ')} ${findings.join(' ')} ${evidence.limitations.join(' ')}`};
}

/** Deterministic calibrated-form evidence only; no provider or invented diagnoses. */
export async function askFormAtlas(question:string,evidence:import('../vision/form').FormAssessment):Promise<{text:string;action?:GameAction;source:'offline'}>{
 const action=question.toLowerCase().includes('replay')?{schemaVersion:1 as const,type:'replay_combo' as const}:undefined;
 return {source:'offline',action,text:`Offline Coach Atlas · prompted ${evidence.exercise}. ${Object.entries(evidence.criteria).map(([name,c])=>`${name}: ${c.status}. ${c.feedback}`).join(' ')} ${evidence.primaryFeedback} ${evidence.limitations.join(' ')}`};
}
