# Independent form export review

Recording: `fireroom_trials/fireroom-form-assessment.json`.

This review replays saved MediaPipe estimates. It does not establish actual punch correctness, elbow geometry, camera accuracy, or physical ground truth.

## Observed defects and limits

- Full-reach calibration medians were 0.2791 m lead and 0.2699 m rear; corresponding bent-arm medians were 0.3421 m and 0.3431 m. Both distributions have the reverse of the expected ordering. This may indicate capture pose mismatch or model depth error; pose-only data cannot establish the cause.
- The engine correctly withheld a calibrated reach threshold (`calibration-only`, null thresholds), but described reversed distributions merely as overlap. Setup validity means saved references exist, not that reach can be scored.
- Attempt has 44 frames, 118019.5–121404.7 ms. The exported lifecycle reports movement start at 120001 ms, radial peak at 120778 ms, and recovery at 121404.7 ms, yet generic feedback claims no complete movement and lost recovery tracking.
- World shoulder–wrist distance falls during the main departure (approximately 0.314 m at 119922 ms to 0.155 m at 120234 ms), before rising to 0.305 m at 120778 ms. A radial maximum is therefore not reliable proof of this attempt's extension phase. No arbitrary threshold reduction, inferred elbow straightness, or completion PASS is justified.
- Guard/recovery statuses were gated on a minimum 0.05 m outward radial increase. Given contradictory motion evidence, abstention remains conservative, but its explanation must distinguish unconfirmed outward reach from missing observations.

## Regression scope

`tests/form-export.test.ts` replays raw saved calibration stages and attempt frames. It requires explicit reversed calibration diagnostics, preserves unavailable reach and incomplete assessment, records numerical motion evidence, acknowledges observed return without claiming a validated punch, and checks that a falsely separable reference cannot force a pass. Existing independent negative controls cover idle, image-only movement with unchanged world reach, isolated spikes, missing observations, and camera/configuration changes.

Before fix: targeted regression **1 PASS / 2 FAIL**. Failures reproduce missing reversed-distribution diagnostics and misleading generic motion feedback.

Physical form assessment, actual joint occlusion, reviewed camera pose correctness, and Fire TV deployment: **NOT VERIFIED**.

## Fix verification and gate

After lead-orchestrator changes: `npx vitest run --configLoader native tests/form-export.test.ts tests/form-independent.test.ts` — **42/42 PASS**, 2 files.

Reviewed production change adds specific reversed-calibration diagnostics and exposes baseline/peak/delta evidence for unconfirmed outward reach. It acknowledges observed return while preserving all three UNASSESSABLE criteria and incomplete classification for this recording. Existing fixed completion and coverage thresholds are unchanged. Idle, unchanged-world-reach image motion, isolated spikes, guard drops, drift, missing tracking, handedness, and configuration negative controls still pass.

**Gate: PASS for diagnostic fidelity and conservative replay regression.** This gate does not approve physical punch/form accuracy. The radial-peak lifecycle can still select a point near recovery when estimated depth contracts during intended extension; current changes explain and abstain rather than solve that geometry limit. This export contains only one final attempt; it is not a population-level accuracy test. Human testing with reviewed camera recordings remains required.

Final independent verification: `npm test` **201/201 PASS**, 20 files. `npm run build` **PASS**, including TypeScript. Main bundle 555.78 kB; existing >500 kB advisory remains. Regression test uses ES2020-compatible indexing. No physical camera test or Fire TV execution performed.
