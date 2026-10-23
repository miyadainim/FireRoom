import {describe,it,expect} from 'vitest';
import {guardObservationSummary} from '../src/coach/prescribed-feedback';
import type {PrescribedPunchAssessment} from '../src/vision/prescribed';
function punch(overrides:Partial<PrescribedPunchAssessment>={}):PrescribedPunchAssessment {
 return {recoveryConfirmed:true,recovery:{status:'cannot-assess',reason:'Wrist return alone does not establish recovered guard; reliable held guard unavailable'},oppositeGuard:{status:'cannot-assess',reason:'Brief height excursion or lateral displacement does not establish a sustained guard drop'},...overrides} as PrescribedPunchAssessment;
}
describe('guard feedback distinguishes independent evidence',()=>{
 it('explains wrist return separately from the immediate held guard',()=>{
  const text=guardObservationSummary(punch());
  expect(text).toContain('wrist returned');
  expect(text).toContain('does not by itself confirm a held guard');
  expect(text).toContain('Immediate settled guard after return: cannot confirm');
  expect(text).toContain('reliable held guard unavailable');
 });
 it('does not label a brief excursion as a sustained guard drop',()=>{
  const text=guardObservationSummary(punch());
  expect(text).toContain('Other-hand guard is inconclusive');
  expect(text).toContain('did not establish a sustained guard drop');
  expect(text).not.toContain('guard dropped');
 });
 it('surfaces tracking limitations rather than prescribing a technique correction',()=>{
  const text=guardObservationSummary(punch({recoveryConfirmed:false,oppositeGuard:{status:'cannot-assess',reason:'Insufficient reliable, ordered eye/wrist observations'} as PrescribedPunchAssessment['oppositeGuard']}));
  expect(text).toContain('Wrist-return recovery was not confirmed');
  expect(text).toContain('Insufficient reliable, ordered eye/wrist observations');
  expect(text).not.toContain('Keep your');
 });
});
