import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {evaluatePrescribedAttempt} from '../src/vision/prescribed';
import {GUARD_HEIGHT_THRESHOLDS} from '../src/vision/guard-height';
it('flags the deliberately lowered wrist in recorded attempt23 at restored0.50',()=>{
 const d=JSON.parse(readFileSync('fireroom_trials/fireroom-prescribed-attempt (23).json','utf8'));const r=evaluatePrescribedAttempt(d.frames,d.config);const jab=r.punches.find(p=>p.cycle.type==='jab')!;
 expect(GUARD_HEIGHT_THRESHOLDS.maxBelowEye).toBe(.5);expect(GUARD_HEIGHT_THRESHOLDS.minViolationMs).toBe(180);
 expect(r.movementSequenceMatched).toBe(true);expect(r.recoveryStatus).toBe('confirmed');expect(jab.oppositeGuard.status).toBe('deviation');expect(jab.oppositeGuard.observedDurationMs).toBeCloseTo(459.4,1);
 expect(jab.oppositeGuard.evidence.samples.every(s=>s.heightScale?.source==='stable-guard')).toBe(true);
});
