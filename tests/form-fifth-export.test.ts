import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PromptedFormAttempt,shoulderWristDistance,type SessionCalibration,type FormAssessment} from '../src/vision/form';
import type {PoseFrame} from '../src/shared/contracts';

// This model-output replay cannot establish anatomical accuracy or lighting causality.
const recording=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-form-assessment (4).json',import.meta.url),'utf8')) as {
 calibration:SessionCalibration;attemptFrames:PoseFrame[];assessment:FormAssessment;
};
describe('independent new-location recorded form export',()=>{
 it('keeps completed guard/recovery evidence and explains the absent optional reach comparison',()=>{
  const before=JSON.stringify(recording),frames=structuredClone(recording.attemptFrames);
  expect(frames).toHaveLength(32);expect(frames.every(f=>f.tracking==='tracked')).toBe(true);
  expect(recording.calibration.valid).toBe(true);
  for(const arm of [recording.calibration.leadArm,recording.calibration.rearArm]){
   expect(arm.bentReference).toBeNull();expect(arm.threshold).toBeNull();expect(arm.reliability).toBe('calibration-only');
  }
  const attempt=new PromptedFormAttempt(structuredClone(recording.calibration),'jab',frames[0].timestampMs);
  for(const frame of frames)attempt.receive(frame);
  const result=attempt.finish(recording.assessment.timestamps.finishedMs);
  const measured=(r:FormAssessment)=>({...r,primaryFeedback:undefined,criteria:Object.fromEntries(Object.entries(r.criteria).map(([key,value])=>[key,{...value,feedback:undefined}]))});
  const savedMeasured=measured(recording.assessment),currentMeasured=measured(result);
  // Availability diagnostics are now specific; criterion statuses and numeric measurements are unchanged.
  delete (savedMeasured.criteria.reach as {evidence?:unknown}).evidence;delete (currentMeasured.criteria.reach as {evidence?:unknown}).evidence;
  expect(currentMeasured).toEqual(savedMeasured);
  expect(result.completed).toBe(true);
  expect(result.criteria.guard.status).toBe('PASS');expect(result.criteria.recovery.status).toBe('PASS');
  expect(result.criteria.recovery.evidence.recoveryMs).toBeCloseTo(774.6,5);
  expect(result.criteria.reach.status).toBe('UNASSESSABLE');
  expect(result.criteria.reach.evidence).toEqual({reason:'Optional bent-arm comparison not recorded.',availability:'not-calibrated'});
  expect(result.criteria.reach.feedback).toMatch(/optional/i);
  expect(result.criteria.reach.feedback).toMatch(/not recorded|not captured|not completed|not been recorded/i);
  expect(result.primaryFeedback).toMatch(/guard/i);expect(result.primaryFeedback).toMatch(/recover|return/i);
  expect(result.primaryFeedback).toMatch(/optional|comparison|not graded|unavailable/i);
  // Inspect private numerical state only for independent audit; it is not form ground truth.
  const state=attempt as unknown as {baselineReach:number;peakReach:number};
  expect(state.baselineReach).toBeCloseTo(.3051594342446055,12);
  expect(state.peakReach).toBeCloseTo(.36794063010452144,12);
  expect(Math.min(...frames.map(f=>shoulderWristDistance(f,'left')!))).toBeCloseTo(.1643935304470775,12);
  expect(state.peakReach-state.baselineReach).toBeGreaterThan(.05);
  expect(JSON.stringify(recording)).toBe(before);
 });
});
