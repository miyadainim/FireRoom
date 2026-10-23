import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {FormCalibrationSession,PromptedFormAttempt,type SessionCalibration} from '../src/vision/form';
import type {PoseFrame} from '../src/shared/contracts';

// Recorded model output is regression evidence, not independently labeled physical truth.
const recording=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-form-assessment.json',import.meta.url),'utf8')) as {
 calibration:SessionCalibration;
 calibrationFrames:Record<string,PoseFrame[]>;
 attemptFrames:PoseFrame[];
};
function replay(calibration=structuredClone(recording.calibration)){
 const frames=structuredClone(recording.attemptFrames);
 const attempt=new PromptedFormAttempt(calibration,'jab',frames[0].timestampMs);
 for(const frame of frames)attempt.receive(frame);
 return attempt.finish(frames[frames.length-1].timestampMs);
}
describe('independent recorded form export regression',()=>{
 it('preserves reversed calibration as unavailable rather than swapping labels or relaxing thresholds',()=>{
  const cal=new FormCalibrationSession(structuredClone(recording.calibration.config));
  for(const stage of ['setup','guard','lead-reach','rear-reach','lead-bent','rear-bent'] as const){
   cal.begin(stage);for(const frame of recording.calibrationFrames[stage])cal.receive(frame);
   expect(cal.finishStage().accepted).toBe(true);
  }
  for(const arm of [cal.calibration.leadArm,cal.calibration.rearArm]){
   expect(arm.bentReference!.median).toBeGreaterThan(arm.reachReference!.median);
   expect(arm.reliability).not.toBe('separable');expect(arm.threshold).toBeNull();
  }
  expect(cal.calibration.diagnostics.join(' ')).toMatch(/reversed|bent.{0,60}(?:greater|exceed|longer).{0,30}full/i);
 });
 it('explains contradictory reach estimates without misreporting an observed return as tracking loss',()=>{
  const before=JSON.stringify(recording),result=replay();
  expect(result.completed).toBe(false);
  expect(result.timestamps.startedMs).not.toBeNull();
  expect(result.timestamps.recoveredMs).not.toBeNull();
  for(const criterion of Object.values(result.criteria))expect(criterion.status).toBe('UNASSESSABLE');
  expect(result.primaryFeedback).not.toMatch(/No complete prompted movement|lost track/i);
  expect(result.criteria.recovery.feedback).toMatch(/return near guard/i);
  expect(result.criteria.recovery.evidence.recoveryObserved).toBe(true);
  expect(result.criteria.reach.evidence.baselineReach).toBeTypeOf('number');
  expect(result.criteria.reach.evidence.peakReach).toBeTypeOf('number');
  expect(result.criteria.reach.evidence.reachIncrease).toBeLessThan(.05);
  expect(JSON.stringify(recording)).toBe(before);
 });
 it('does not manufacture reach confidence by replacing unavailable reference status',()=>{
  const cal=structuredClone(recording.calibration);
  // Even a mislabeled externally supplied calibration cannot override contradictory motion.
  cal.leadArm.reliability='separable';cal.leadArm.threshold=.8;
  const result=replay(cal);
  expect(result.completed).toBe(false);expect(result.criteria.reach.status).toBe('UNASSESSABLE');
 });
});
