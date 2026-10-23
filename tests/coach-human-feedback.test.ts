import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {coachAttemptMessage} from '../src/coach/prescribed-feedback';
import {evaluatePrescribedAttempt} from '../src/vision/prescribed';
const load=(n:number)=>{const d=JSON.parse(readFileSync(`fireroom_trials/fireroom-prescribed-attempt (${n}).json`,'utf8'));return evaluatePrescribedAttempt(d.frames,d.config);};
describe('human coaching grounded in evidence',()=>{
 it('encourages attempt18 without calling a brief excursion a guard failure',()=>{
  const r=load(18),before=JSON.stringify(r),message=coachAttemptMessage(r);
  expect(message).toContain('Good job!');expect(message).toContain('Your guard stayed generally steady, with a brief dip.');
  expect(message).not.toMatch(/perfect|guard dropped/i);expect(JSON.stringify(r)).toBe(before);
 });
 it('uses the brief-dip wording for attempt26',()=>{expect(coachAttemptMessage(load(26))).toContain('Your guard stayed generally steady, with a brief dip.');});
 it('keeps missing tracking separate from a brief dip',()=>{const r=load(26);r.punches[0].oppositeGuard={...r.punches[0].oppositeGuard,status:'cannot-assess',reason:'Insufficient reliable observations',evidence:{...r.punches[0].oppositeGuard.evidence,samples:[]}};expect(coachAttemptMessage(r)).toContain('I couldn’t reliably check your other hand.');});
 it('gives an actionable correction only for an observed sustained low hand',()=>{
  const r=load(13);expect(r.punches.some(p=>p.oppositeGuard.status==='deviation')).toBe(true);
  expect(coachAttemptMessage(r)).toContain('try keeping your other hand higher during the punch');
 });
 it('does not claim confirmed recovery or perfect form with uncertain evidence',()=>{
  const message=coachAttemptMessage(load(9));expect(message).toContain('couldn’t confirm every return');expect(message).not.toMatch(/perfect|brought your punching hand back/i);
 });
});
