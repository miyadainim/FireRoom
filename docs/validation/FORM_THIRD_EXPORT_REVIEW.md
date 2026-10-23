# Independent review: third form export

Reviewed `fireroom_trials/fireroom-form-assessment (2).json` on 2026-10-17. Input is pose-only estimated landmark data; no physical ground truth or video is available. No production code, thresholds, or original recording were modified.

## Evidence

Independent tests replay each saved calibration stage through the current engine and reproduce the complete exported calibration exactly. Setup and guard each contain 35 frames, but are separate recordings, at different timestamps. Lead and rear reach each contain 38 frames. All four stages are accepted; calibration is valid for practice. This does not certify that the user performed the instructed poses correctly.

Lead full-reach median is 0.3933437295 estimated metres; rear is 0.2777481940. Both bent references and grading thresholds are null, so both arms have `calibration-only` reliability. Valid setup and usable reach grading are intentionally distinct: no personalized short/full reach classification is available without separable comparison references.

The left-hand guard capture has median shoulder–wrist distance 0.3257709265, 0.0675728030 below the lead reach reference. This indicates separation in these two held estimates, not verified elbow extension or reliable dynamic depth. The schema does not identify the application build or prove which hands-free workflow produced these captures.

The jab attempt has 31 frames, all marked `tracked`. Feeding them into the current engine reproduces the saved assessment exactly:

| Measurement | Value |
|---|---:|
| Guard-derived attempt baseline | 0.3243512281 m |
| Supported temporal peak | 0.3467721439 m |
| Increase | 0.0224209158 m |
| Movement-support requirement | greater than 0.0500000000 m |
| Raw largest frame reach | 0.3734511009 m |
| Raw maximum minus baseline | 0.0490998727 m |
| Return near guard observed | true |

The supported peak uses a median across three recent observations; it is not the isolated raw maximum. Even substituting the raw maximum would leave the increase below the current fixed movement-support requirement. Changing the requirement solely to pass this recording would not establish accuracy. `completed=false` and all criteria `UNASSESSABLE` are reproduced. Recovery observation is retained as evidence but not presented as verified punch recovery.

## Actual checks

- `npm test -- tests/form-third-export.test.ts`: **PASS**, 2/2 tests.
- `npm test`: **PASS**, 211/211 tests across 22 files.
- `npm run build`: **PASS**, TypeScript and Vite production build; main chunk 560.14 kB, existing >500 kB advisory remains.
- Tests also confirm the source recording is unchanged after replay.

## Gate

**PASS** for reproducibility and conservative software interpretation of this export. No new physical milestone is certified. Actual punch execution, joint-position accuracy, occlusion handling, suitability of the fixed 5 cm requirement, calibration usability, real phone/TV synchronization, and Fire TV deployment remain **NOT VERIFIED**. Human-labeled video/reference observations and target-device testing are required before claiming coaching accuracy. No credentials or approval were required for this local analysis.
