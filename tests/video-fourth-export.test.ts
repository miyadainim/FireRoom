import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PromptedFormAttempt,type SessionCalibration,type FormAssessment} from '../src/vision/form';
import type {PoseFrame} from '../src/shared/contracts';

// Recorded model-output replay is software evidence, not video/form ground truth.
const recording=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-form-assessment (3).json',import.meta.url),'utf8')) as {
 calibration:SessionCalibration;calibrationFrames:Record<string,PoseFrame[]>;attemptFrames:PoseFrame[];assessment:FormAssessment;
 video:{calibrationRunIds:string[];practiceRunId:string};
};
const manifest=JSON.parse(readFileSync(new URL('../fireroom_trials/fireroom-calibration-88e5c971-9a86-44d7-a2e4-13ac0b68c436.json',import.meta.url),'utf8')) as {
 runId:string;poseFrames:{sequence:number;timestampMs:number;cameraConfigurationId:string;offsetMs:number}[];
};
describe('independent fourth form export and video association',()=>{
 it('exactly replays stored uncertainty despite all frames reporting tracked',()=>{
  const before=JSON.stringify(recording),frames=structuredClone(recording.attemptFrames);
  expect(frames).toHaveLength(39);expect(frames.every(f=>f.tracking==='tracked')).toBe(true);
  const attempt=new PromptedFormAttempt(structuredClone(recording.calibration),'jab',frames[0].timestampMs);
  for(const frame of frames)attempt.receive(frame);
  const result=attempt.finish(recording.assessment.timestamps.finishedMs);
  expect(result).toEqual(recording.assessment);expect(result.completed).toBe(false);
  for(const criterion of Object.values(result.criteria))expect(criterion.status).toBe('UNASSESSABLE');
  expect(result.criteria.reach.evidence.reachIncrease).toBeCloseTo(.006067285822300983,12);
  expect(result.criteria.recovery.evidence.recoveryObserved).toBe(true);
  expect(JSON.stringify(recording)).toBe(before);
 });
 it('matches calibration sequences but cannot associate practice with calibration video',()=>{
  expect(recording.video.calibrationRunIds).toContain(manifest.runId);
  expect(recording.video.practiceRunId).not.toBe(manifest.runId);
  const bySequence=new Map(manifest.poseFrames.map(f=>[f.sequence,f]));
  for(const frames of Object.values(recording.calibrationFrames))for(const frame of frames){
   const match=bySequence.get(frame.sequence);
   expect(match?.timestampMs).toBe(frame.timestampMs);
   expect(match?.cameraConfigurationId).toBe(frame.cameraConfigurationId);
  }
  expect(recording.attemptFrames.every(f=>!bySequence.has(f.sequence))).toBe(true);
  expect(recording.attemptFrames[0].timestampMs).toBeGreaterThan(manifest.poseFrames[manifest.poseFrames.length-1].timestampMs);
 });
});
