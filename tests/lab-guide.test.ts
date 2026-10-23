import {describe,it,expect} from 'vitest';
import {movementCue} from '../src/lab/guide';
describe('plain language recording cues',()=>{
 it('uses anatomical lead/rear hand for either stance',()=>{
  expect(movementCue('jab','full','orthodox')).toContain('left-hand jab');
  expect(movementCue('cross','short','orthodox')).toContain('short right-hand cross');
  expect(movementCue('jab','full','southpaw')).toContain('right-hand jab');
  expect(movementCue('rear-reach',undefined,'southpaw')).toContain('left arm');
 });
 it('distinguishes held calibration from a punch and recovery',()=>{
  expect(movementCue('lead-short',undefined,'orthodox')).toBe('Hold your left arm partly extended');
  expect(movementCue('cross','full','orthodox')).toContain('return to guard');
  expect(movementCue('idle','negative','orthodox')).toContain('do not punch');
 });
});
