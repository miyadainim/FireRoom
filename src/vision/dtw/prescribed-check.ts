import type {PoseFrame} from '../../shared/contracts';
import {evaluateAttempt,validateReference} from './evaluate';
import type {DtwEvaluation,DtwReference} from './types';

export interface PrescribedDtwInput {
 enabled?:boolean;
 expected:'jab'|'cross'|'jab-cross';
 frames:PoseFrame[];
 reference?:DtwReference|null;
 /** Explicit current setup description, not automatically copied from the reference. */
 cameraPlacement?:string;
 /** Caller confirms independent review; a downloaded review.status alone is insufficient. */
 referenceReviewConfirmed?:boolean;
}
export interface PrescribedDtwCheck {
 status:'disabled'|'reference-required'|'not-assessable'|'aligned'|'rejected';
 expected:PrescribedDtwInput['expected'];
 referenceId:string|null;
 reasons:string[];
 evaluation:DtwEvaluation|null;
 role:'optional-sequence-comparison';
 techniqueGrade:'cannot-assess';
 overridesRuleRecognition:false;
 physicalValidation:'NOT VERIFIED';
 limitations:string[];
}
/** Supplemental sequence evidence only. This never replaces bounded motion recognition,
 * and a reference mismatch never turns a completed short punch into a non-punch. */
export function checkPrescribedAttemptDtw(input:PrescribedDtwInput):PrescribedDtwCheck {
 const result:PrescribedDtwCheck={status:'disabled',expected:input.expected,referenceId:null,reasons:[],evaluation:null,role:'optional-sequence-comparison',techniqueGrade:'cannot-assess',overridesRuleRecognition:false,physicalValidation:'NOT VERIFIED',limitations:[
  'DTW distance is sequence similarity, not an overall technique grade.',
  'Existing DTW requires both arms and elbows to be observed; it can abstain even when wrist-motion rules recognize a punch.',
  'Existing amplitude and direction rejection thresholds are provisional; short punches may fail reference matching while remaining recognized punches.',
  'Camera placement confirmation is a caller assertion, not automatic verification of identical viewpoint.',
  'DTW can hide speed differences and pauses; timing findings remain descriptive.',
  'Feints and unrelated reaches can resemble punch trajectories; alignment does not prove intent or correct form.'
 ]};
 if(!input.enabled){result.reasons=['Optional DTW comparison is disabled; rule-based recognition remains available'];return result;}
 if(input.expected==='cross'){result.status='not-assessable';result.reasons=['Standalone cross is unsupported by the existing reviewed-reference schema; no hand swapping or jab-reference substitution'];return result;}
 const reference=input.reference;
 if(!reference||reference.review?.status!=='reviewed'){result.status='reference-required';result.reasons=['Provide a separately reviewed reference recording for this prescribed sequence'];return result;}
 const validation=validateReference(reference);
 if(!validation.valid){result.status='not-assessable';result.reasons=validation.errors;return result;}
 result.referenceId=reference.id;
 if(!input.referenceReviewConfirmed){result.status='reference-required';result.reasons=['Independently confirm the reference review; review metadata alone does not establish review'];return result;}
 if(reference.drill!==input.expected){result.status='not-assessable';result.reasons=['Reference drill does not match the prescribed attempt'];return result;}
 if(typeof input.cameraPlacement!=='string'||!input.cameraPlacement.trim()||input.cameraPlacement.trim()!==reference.cameraPlacement.trim()){result.status='not-assessable';result.reasons=['Current camera placement must explicitly match the reviewed reference'];return result;}
 // The existing evaluator independently checks stance, ordering, coverage, gaps,
 // prescribed phase completion and recovery after temporal alignment.
 const evaluation=evaluateAttempt(input.frames,reference);
 result.evaluation=evaluation;result.status=evaluation.status;result.reasons=[...evaluation.reasons];
 return result;
}
