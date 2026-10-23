import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {evaluatePrescribedAttempt} from '../src/vision/prescribed';
const load=(n:number)=>JSON.parse(readFileSync(`fireroom_trials/fireroom-prescribed-attempt (${n}).json`,'utf8'));
describe('Coach settled guard after body repositioning',()=>{
 it('keeps the completed cross in attempt19 without a false extra jab',()=>{const d=load(19),before=JSON.stringify(d),r=evaluatePrescribedAttempt(d.frames,d.config);expect(r.punches.map(p=>p.cycle.type)).toEqual(['cross']);expect(r.movementSequenceMatched).toBe(true);expect(r.recoveryStatus).toBe('confirmed');expect(JSON.stringify(d)).toBe(before);});
 // Archived exports3/11 contain older schema judgments; current jab/combo acceptance
 // is independently asserted in prescribed-recovery-message and prescribed-observation tests.

 it('keeps jump diagnostics without discarding visible guard samples',()=>{const d=load(19),r=evaluatePrescribedAttempt(d.frames,d.config);const guard=r.punches.find(p=>p.cycle.type==='cross')!.oppositeGuard;expect(guard.evidence.samples.some(s=>s.landmarkWarning)).toBe(true);expect(guard.evidence.samples.filter(s=>s.landmarkWarning).every(s=>s.status!=='unknown'&&guard.timestampsMs.includes(s.timestampMs))).toBe(true);});
 it.each([9,13])('does not turn incomplete recovery into success in attempt%s',n=>{const d=load(n),r=evaluatePrescribedAttempt(d.frames,d.config);expect(r.recoveryStatus).not.toBe('confirmed');});
});
