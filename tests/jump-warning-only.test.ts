import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {evaluatePrescribedAttempt} from '../src/vision/prescribed';
it('recognises recorded fast jab25 while retaining non-rejecting jump diagnostics',()=>{
 const d=JSON.parse(readFileSync('fireroom_trials/fireroom-prescribed-attempt (25).json','utf8'));const r=evaluatePrescribedAttempt(d.frames,d.config);
 expect(r.status).toBe('completed');expect(r.movementSequenceMatched).toBe(true);expect(r.recoveryStatus).toBe('confirmed');expect(r.punches.map(p=>p.cycle.type)).toEqual(['jab']);expect(r.punches[0].cycle.evidence.landmarkWarnings?.length).toBeGreaterThan(0);expect(r.outcomes.some(o=>/Implausible.*jump/.test(o.evidence.reason))).toBe(false);
});
