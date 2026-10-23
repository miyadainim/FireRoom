import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {FormCalibrationSession,PromptedFormAttempt,shoulderWristDistance,robustSummary,type SessionCalibration,type FormAssessment} from '../src/vision/form';
import type {PoseFrame} from '../src/shared/contracts';

// Model-output replay verifies software evidence, not actual punch form or occlusion.
const recording=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-form-assessment (2).json',import.meta.url),'utf8')) as {
 calibration:SessionCalibration;calibrationFrames:Record<string,PoseFrame[]>;attemptFrames:PoseFrame[];assessment:FormAssessment;
};
describe('independent third recorded form export',()=>{
 it('replays accepted setup and preserves missing optional comparison uncertainty',()=>{
  const before=JSON.stringify(recording),cal=new FormCalibrationSession(structuredClone(recording.calibration.config));
  for(const stage of ['setup','guard','lead-reach','rear-reach'] as const){
   const frames=recording.calibrationFrames[stage];
   expect(frames).toHaveLength(stage==='setup'||stage==='guard'?35:38);
   cal.begin(stage);for(const frame of frames)cal.receive(frame);
   expect(cal.finishStage()).toEqual({accepted:true,reasons:[]});
  }
  expect(cal.calibration).toEqual(recording.calibration);
  expect(cal.calibration.valid).toBe(true);
  expect(cal.calibration.leadArm.reachReference!.median).toBeCloseTo(.39334372952201613,12);
  expect(cal.calibration.rearArm.reachReference!.median).toBeCloseTo(.2777481940028166,12);
  for(const arm of [cal.calibration.leadArm,cal.calibration.rearArm]){
   expect(arm.bentReference).toBeNull();expect(arm.threshold).toBeNull();expect(arm.reliability).toBe('calibration-only');
  }
  const guard=robustSummary(recording.calibrationFrames.guard.map(f=>shoulderWristDistance(f,'left')!));
  expect(guard.median).toBeCloseTo(.32577092652784445,12);
  expect(cal.calibration.leadArm.reachReference!.median-guard.median).toBeCloseTo(.06757280299417168,12);
  expect(JSON.stringify(recording)).toBe(before);
 });
 it('exactly replays the jab and does not substitute a raw maximum for the supported temporal peak',()=>{
  const before=JSON.stringify(recording),frames=structuredClone(recording.attemptFrames);
  expect(frames).toHaveLength(31);expect(frames.every(f=>f.tracking==='tracked')).toBe(true);
  const attempt=new PromptedFormAttempt(structuredClone(recording.calibration),'jab',frames[0].timestampMs);
  for(const frame of frames)attempt.receive(frame);
  const result=attempt.finish(recording.assessment.timestamps.finishedMs);
  expect(result).toEqual(recording.assessment);
  expect(result.completed).toBe(false);expect(result.timestamps.recoveredMs).not.toBeNull();
  for(const criterion of Object.values(result.criteria))expect(criterion.status).toBe('UNASSESSABLE');
  const evidence=result.criteria.reach.evidence;
  expect(evidence.baselineReach).toBeCloseTo(.32435122812155254,12);
  expect(evidence.peakReach).toBeCloseTo(.3467721439185405,12);
  expect(evidence.reachIncrease).toBeCloseTo(.02242091579698796,12);
  expect(Number(evidence.reachIncrease)).toBeLessThan(.05);
  expect(evidence.recoveryObserved).toBe(true);
  const raw=frames.map(f=>shoulderWristDistance(f,'left')!);
  expect(Math.max(...raw)).toBeCloseTo(.3734511008655984,12);
  expect(Math.max(...raw)).toBeGreaterThan(Number(evidence.peakReach));
  expect(Math.max(...raw)-Number(evidence.baselineReach)).toBeCloseTo(.04909987274404587,12);
  expect(JSON.stringify(recording)).toBe(before);
 });
});
