import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {evaluatePrescribedAttempt,type PrescribedAttemptConfig} from '../src/vision/prescribed';
import {MovementCycleRecognizer} from '../src/vision/movement-cycle';
import type {PoseFrame} from '../src/shared/contracts';
function saved(name:string){return JSON.parse(readFileSync(new URL(`../fireroom_trials/${name}`,import.meta.url),'utf8')) as {frames:PoseFrame[];config:PrescribedAttemptConfig};}
describe('recorded prescribed deadline regression, not physical validation',()=>{
 it('recognizes later observed cross recovery inside the prescribed window',()=>{const d=saved('fireroom-prescribed-attempt (1).json'),before=JSON.stringify(d);const result=evaluatePrescribedAttempt(d.frames,d.config);expect(result.status).toBe('completed');expect(result.assessmentVersion).toBe('prescribed-observation-v8');expect(result.punches).toHaveLength(1);expect(result.punches[0].cycle.type).toBe('cross');expect(result.punches[0].cycle.timestamps.endMs).toBeLessThanOrEqual(d.config.endMs+250);expect(result.punches[0].extension.status).toBe('cannot-assess');expect(result.formStatus).toBe('NOT VERIFIED');expect(JSON.stringify(d)).toBe(before);});
 it('retains legacy unrestricted timeout and does not silently relax it',()=>{const d=saved('fireroom-prescribed-attempt (1).json'),detector=new MovementCycleRecognizer();const results=d.frames.flatMap(f=>detector.update(f));expect(results.some(r=>r.hand==='right'&&r.classification==='partial')).toBe(true);expect(results.some(r=>r.hand==='right'&&r.classification==='completed')).toBe(false);});
 it('preserves the already recognized recorded jab and its separate evidence',()=>{const d=saved('fireroom-prescribed-attempt.json'),r=evaluatePrescribedAttempt(d.frames,d.config);expect(r.status).toBe('completed');expect(r.punches[0].cycle.hand).toBe('left');expect(r.punches[0].recoveryDurationMs).toBe(666);expect(r.punches[0].oppositeGuard.status).toBe('supported');expect(r.punches[0].oppositeGuard.evidence?.method).toBe('same-side-eye-height');});
});
