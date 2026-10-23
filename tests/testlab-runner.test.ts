import {afterEach,describe,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({resolve:vi.fn(),create:vi.fn()}));
vi.mock('@mediapipe/tasks-vision',()=>({FilesetResolver:{forVisionTasks:mocks.resolve},PoseLandmarker:{createFromOptions:mocks.create}}));
import {modelUrl,runVideoModel,sampleVideoTimes} from '../src/lab/runner';
afterEach(()=>vi.clearAllMocks());
describe('local tracking lab replay',()=>{
 it('bounds chronological timestamps identically for every model',()=>{
  expect(sampleVideoTimes(.4,8)).toEqual([0,.125,.25,.375]);
  expect(sampleVideoTimes(120,8)).toHaveLength(480);
  expect(()=>sampleVideoTimes(Infinity)).toThrow();expect(()=>sampleVideoTimes(5,100)).toThrow();expect(()=>sampleVideoTimes(5,8,61)).toThrow();
  expect(modelUrl('full')).toContain('pose_landmarker_full/float16/1/pose_landmarker_full.task');
 });
 it('copies raw observations, measures timings and closes each model',async()=>{
  const raw={x:.2,y:.3,z:.4,visibility:.9},detect=vi.fn(()=>({landmarks:[[raw]],worldLandmarks:[[raw]]})),close=vi.fn();
  mocks.resolve.mockResolvedValue({});mocks.create.mockResolvedValue({detectForVideo:detect,close});
  const video={pause:vi.fn(),duration:.01,currentTime:0,readyState:2,videoWidth:640,videoHeight:480} as unknown as HTMLVideoElement;
  const result=await runVideoModel(video,'heavy');
  expect(detect.mock.calls.map(call=>(call as unknown[])[1])).toEqual([0,1]);
  expect(result.samples[0].landmarks[0]).toEqual(raw);expect(result.samples[0].landmarks[0]).not.toBe(raw);
  expect(result.samples[0].worldLandmarks[0]).not.toBe(raw);expect(result.samples[0].inferenceMs).toBeGreaterThanOrEqual(0);
  expect(result.warmupMs).toBeGreaterThanOrEqual(0);expect(close).toHaveBeenCalledOnce();
 });
 it('closes models when inference throws and rejects pre-aborted runs',async()=>{
  const close=vi.fn();mocks.resolve.mockResolvedValue({});mocks.create.mockResolvedValue({detectForVideo:()=>{throw new Error('inference failed');},close});
  const video={pause:vi.fn(),duration:.01,currentTime:0,readyState:2} as unknown as HTMLVideoElement;
  await expect(runVideoModel(video,'full')).rejects.toThrow('inference failed');expect(close).toHaveBeenCalledOnce();
  const controller=new AbortController();controller.abort();await expect(runVideoModel(video,'full',{},undefined,controller.signal)).rejects.toHaveProperty('name','AbortError');expect(mocks.create).toHaveBeenCalledOnce();
 });
});
