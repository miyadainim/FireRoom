# Independent DTW verification

Date: 2026-10-15. Scope: bounded prescribed-sequence experimental implementation. This is software verification; synthetic skeletons are not physical evidence.

## Acceptance evidence

Independent adversarial tests reside in `tests/dtw-independent.test.ts` and exercise:

- Global start/end alignment, normalized temporal band, monotonic steps and maximum repeated steps.
- Missing feature evidence, non-finite numbers and non-increasing timestamps.
- Anatomical jab-cross order, absent second punch, incomplete recovery, swapped hands.
- Missing world coordinates without image fallback; changed stance/session/time order.
- Untrusted malformed reference phase entries return validation errors.
- Atlas preserves missing-reference and elbow uncertainty; does not invent measurements or a technique score; only replay is actioned in this adapter.
- Successful sequence completion remains aligned despite a brief opposite-hand guard deviation; the maximum guard displacement is reported and Atlas explicitly avoids treating a match as proof of good form.
- Unrelated lateral reaching with the same timing and amplitude is rejected rather than accepted as the prescribed forward sequence.

The independent review found three defects: null phase followed by a valid phase caused a reference-validation exception; unrelated same-amplitude lateral motion was accepted; half-range excursions with otherwise matching order and recovery were accepted. Regression tests were supplied to the implementing agent. Final results below must be recorded after fixes and full integration.

## Physical gate

NOT VERIFIED. No independently reviewed FireRoom jab/jab-cross reference is supplied. Metadata saying reviewed is an attestation, not proof of actual review. No DTW physical accuracy, optimal threshold, form validity, reference suitability, latency on Fire TV, or target-device deployment is established by these tests.

Required human evidence: review captured reference and annotate each guard/extension/recovery phase; keep separate positive and negative evaluation recordings; observe actual joint visibility in consented synchronized video. Include idle, reaching, wrong order, partial sequence, guard drop, tracking loss, and speed/pause variants. Report accepted sequence accuracy and false acceptance alongside phase observation coverage. Never infer hidden elbow correctness from alignment.

## UI review limits

Source review confirms pending candidate export, reviewed-file validation, matching declared drill/geometry/placement, countdown cancellation, stale-final-observation rejection, and pairing-change cancellation. These are not browser or physical interaction test results. Exact placement text matching cannot verify actual camera position. Candidate export is intentionally not a reviewed reference.

## Final integrated results

`npm test`: **138/138 passed**, 16 test files. Independent suite: **17/17 passed**. `npm run build`: TypeScript and production build **PASS**. Build reports an advisory main chunk >500 kB; runtime performance on Fire TV remains NOT VERIFIED.

All three reported defects were fixed and regression tests now pass. The unrelated-motion fix compares phase displacement direction against the reviewed reference, with a provisional direction threshold. Completion additionally requires at least 0.75 of reference-relative wrist excursion, a provisional screening criterion: the 0.55 partial-excursion negative rejects and a 0.9 excursion positive remains aligned. These are software rejection checks, not validated biomechanical correctness or physically calibrated thresholds.

Gate: **conditional PASS for experimental software integration**; **NOT VERIFIED for physical DTW coaching, reviewed-reference validity, camera placement effectiveness and Fire TV runtime performance**. No approved reference is bundled, so actual coaching requires human reference review and physical validation before efficacy claims.
