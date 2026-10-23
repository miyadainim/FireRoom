import {describe,it,expect} from 'vitest';
import {sampleReference,bagDisplacement,REFERENCE_DURATION_MS} from '../src/graphics/scene';
describe('preauthored ghost animation',()=>{
 it('extends the lead arm, recovers, then extends the rear arm',()=>{
  expect(sampleReference(0,'jab-cross').phase).toBe('guard');
  expect(sampleReference(499,'jab-cross').leftExtension).toBeGreaterThan(.99);
  expect(sampleReference(850,'jab-cross').leftExtension).toBe(0);
  expect(sampleReference(1499,'jab-cross').rightExtension).toBeGreaterThan(.99);
  expect(sampleReference(2000,'jab-cross').phase).toBe('complete');
 });
 it('does not play a cross in the jab drill and clamps negative time',()=>{
  expect(sampleReference(REFERENCE_DURATION_MS.jab,'jab').phase).toBe('complete');
  expect(sampleReference(-100,'jab').timestampMs).toBe(0);
 });
 it('keeps the opposite hand in guard throughout each demonstration',()=>{
  for(let t=0;t<2000;t+=5){const s=sampleReference(t,'jab-cross');expect(s.leftExtension*s.rightExtension).toBe(0);expect(s.leftExtension).toBeGreaterThanOrEqual(0);expect(s.rightExtension).toBeLessThanOrEqual(1);}
 });
 it('bounds virtual bag response and lets it settle',()=>{
  expect(bagDisplacement(100,1000)).toBe(bagDisplacement(100,100));
  expect(bagDisplacement(100,-20)).toBe(0);
  expect(Math.abs(bagDisplacement(10000,100))).toBeLessThan(.00001);
  expect(bagDisplacement(20,Number.NaN)).toBe(0);
 });
});
