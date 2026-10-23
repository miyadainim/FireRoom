import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {FormCalibrationSession,PromptedFormAttempt,FORM_THRESHOLDS,shoulderWristDistance,type SessionCalibration,type FormAssessment} from '../src/vision/form';
import type {PoseFrame} from '../src/shared/contracts';

// Raw model output provides deterministic replay, not physical technique ground truth.
const recording=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-form-assessment (1).json',import.meta.url),'utf8')) as {
 calibration:SessionCalibration;calibrationFrames:Record<string,PoseFrame[]>;attemptFrames:PoseFrame[];assessment:FormAssessment;
};
describe('independent second recorded form export',()=>{
 it('distinguishes insufficient separation margin from actual distribution overlap',()=>{
  const before=JSON.stringify(recording),cal=new FormCalibrationSession(structuredClone(recording.calibration.config));
  for(const stage of ['setup','guard','lead-reach','rear-reach','lead-bent','rear-bent'] as const){
   cal.begin(stage);for(const frame of recording.calibrationFrames[stage])cal.receive(frame);
   expect(cal.finishStage().accepted).toBe(true);
  }
  const lead=cal.calibration.leadArm,rear=cal.calibration.rearArm;
  const gap=lead.reachReference!.low-lead.bentReference!.high;
  expect(gap).toBeCloseTo(.01999412252335553,10);
  expect(gap).toBeGreaterThan(0);
  expect(gap).toBeLessThan(FORM_THRESHOLDS.minSeparationRatio*lead.reachReference!.median);
  expect(lead.reliability).toBe('calibration-only');expect(lead.threshold).toBeNull();
  expect(cal.calibration.diagnostics.join(' ')).toMatch(/separation.{0,80}small|margin/i);
  expect(cal.calibration.diagnostics.join(' ')).not.toMatch(/distributions overlap/i);
  expect(rear.reliability).toBe('separable');expect(rear.threshold).toBeCloseTo(.8778926596281698,10);
  expect(JSON.stringify(recording)).toBe(before);
 });
 it('replays the saved jab conservatively without converting recovery into a verified punch',()=>{
  const before=JSON.stringify(recording),frames=structuredClone(recording.attemptFrames);
  expect(frames).toHaveLength(37);expect(frames.every(f=>f.tracking==='tracked')).toBe(true);
  const attempt=new PromptedFormAttempt(structuredClone(recording.calibration),'jab',frames[0].timestampMs);
  for(const frame of frames)attempt.receive(frame);
  const result=attempt.finish(recording.assessment.timestamps.finishedMs);
  // Feedback copy no longer tells the player to repeat accepted setup; measured evidence stays identical.
  const {primaryFeedback:oldFeedback,...savedEvidence}=recording.assessment;
  const {primaryFeedback:newFeedback,...replayedEvidence}=result;
  expect(replayedEvidence).toEqual(savedEvidence);
  expect(oldFeedback).toContain('repeat setup');
  expect(newFeedback).toBe('Your hand moved and returned near guard, but the estimated arm reach was inconsistent. I could not measure outward reach reliably from this view. Your saved setup is kept; this is not a judgment of your punch form.');
  expect(result.completed).toBe(false);expect(result.timestamps.recoveredMs).not.toBeNull();
  for(const criterion of Object.values(result.criteria))expect(criterion.status).toBe('UNASSESSABLE');
  expect(result.criteria.reach.evidence.reachIncrease).toBeCloseTo(.01637033701442353,10);
  const reaches=frames.map(f=>shoulderWristDistance(f,'left')!);
  expect(Math.min(...reaches)).toBeCloseTo(.1251145214359147,10);
  expect(Math.max(...reaches)).toBeCloseTo(.4296147946064852,10);
  // An isolated maximum differs from the stable temporal peak; do not grade from the raw maximum.
  expect(Math.max(...reaches)).toBeGreaterThan(Number(result.criteria.reach.evidence.peakReach)+.07);
  expect(JSON.stringify(recording)).toBe(before);
 });
});
