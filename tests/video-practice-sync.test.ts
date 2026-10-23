import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import type {PoseFrame} from '../src/shared/contracts';
import {shoulderWristDistance} from '../src/vision/form';

const load=(name:string)=>JSON.parse(readFileSync(new URL(`../fireroom_trials/${name}`,import.meta.url),'utf8'));
const recording=load('fireroom-form-assessment (3).json') as {attemptFrames:PoseFrame[];video:{practiceRunId:string}};
const manifest=load('fireroom-practice-44d6cb19-7d7d-4da4-98ff-63feab9d5d3c.json') as {
 runId:string;kind:string;status:string;durationMs:number;poseFrames:{sequence:number;timestampMs:number;offsetMs:number;cameraConfigurationId:string}[];
};

describe('independent practice recording association and observed model geometry',()=>{
 it('associates all exported attempt observations by sequence, producer time and camera configuration',()=>{
  expect(manifest.runId).toBe(recording.video.practiceRunId);
  expect(manifest.kind).toBe('practice');expect(manifest.status).toBe('complete');
  expect(manifest.poseFrames).toHaveLength(153);expect(recording.attemptFrames).toHaveLength(39);
  const index=new Map(manifest.poseFrames.map(f=>[f.sequence,f]));
  expect(index.size).toBe(manifest.poseFrames.length);
  const offsets=recording.attemptFrames.map(frame=>{
   const row=index.get(frame.sequence)!;expect(row).toBeDefined();
   expect(row.timestampMs).toBe(frame.timestampMs);expect(row.cameraConfigurationId).toBe(frame.cameraConfigurationId);
   expect(row.offsetMs).toBeGreaterThanOrEqual(0);expect(row.offsetMs).toBeLessThan(manifest.durationMs);return row.offsetMs;
  });
  expect(Math.min(...offsets)).toBeCloseTo(2599.1,5);expect(Math.max(...offsets)).toBeCloseTo(5694.7,5);
  expect(manifest.durationMs).toBeCloseTo(5927.3,5);
 });
 it('preserves a startup clock-origin discontinuity rather than claiming exact frame synchronization',()=>{
  const rows=manifest.poseFrames;
  expect(rows[3].timestampMs).toBeGreaterThan(rows[2].timestampMs);
  expect(rows[3].offsetMs).toBeLessThan(rows[2].offsetMs);
  const origins=rows.map(f=>f.timestampMs-f.offsetMs);
  expect(origins[3]-origins[2]).toBeCloseTo(129.7,4);
  // Later attempt rows share one stable approximate callback origin.
  const attemptOrigins=rows.filter(f=>f.sequence>=1380).map(f=>f.timestampMs-f.offsetMs);
  expect(Math.max(...attemptOrigins)-Math.min(...attemptOrigins)).toBeLessThan(.3);
 });
 it('retains high visibility despite the implausibly folded image/world arm at the reviewed video moment',()=>{
  const frame=recording.attemptFrames.find(f=>f.sequence===1419)!;
  expect(manifest.poseFrames.find(f=>f.sequence===1419)!.offsetMs).toBeCloseTo(4130.4,5);
  expect(frame.tracking).toBe('tracked');
  expect(frame.landmarks[15].visibility).toBeCloseTo(.9620256423950195,12);
  expect(frame.landmarks[13].visibility).toBeCloseTo(.9985866546630859,12);
  expect(frame.landmarks[15].x).toBeLessThan(frame.landmarks[13].x);
  expect(shoulderWristDistance(frame,'left')).toBeCloseTo(.08665780349911688,12);
  expect(frame.worldLandmarks![15].visibility).toBe(frame.landmarks[15].visibility);
  // Model-output regression only: these checks do not prove physical joint position or precise video alignment.
 });
});
