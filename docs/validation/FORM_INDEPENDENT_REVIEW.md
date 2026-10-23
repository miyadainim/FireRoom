# Independent V&V: calibrated prompted form assessment

Date: 2026-10-17. Scope: session calibration, prompted jab/cross lifecycle, independent opposite-hand guard/relative reach/recovery outcomes, integration safety and regression. Reviewer operated independently of source implementer; changed only tests/form-independent.test.ts and FORM_* validation documents.

## Actual automated evidence

Final independent run at 17:07:29 local:

- `npm test`: PASS, 187/187 tests across 19 files.
- `npm test -- tests/form-independent.test.ts`: PASS, 38/38 independent tests (17:07:26).
- `npm run build`: PASS, TypeScript check and Vite production build, 77 modules; main JS 550.70 kB. Existing >500 kB advisory remains; Fire TV performance is NOT VERIFIED.

The independent tests exercise robust median statistics; anatomical orthodox/southpaw mapping; separate arm reach references; minimum duration/sample count; unstable, sparse and moving setup rejection; history gaps; session/stance/resolution/capture-token invalidation; raw-pose preservation; shoulder-wrist reach without a visible elbow; per-arm missing wrist isolation; full/bent overlap unavailable; prompted jab/cross completion; independent guard-drop, underreach and recovery outcomes; calibrated overreach drift; idle timeout; continuously observed absent recovery; southpaw lead arm; guard-hand tracking loss; recovery tracking loss; cached result/no repeat assessment; one isolated reach spike; image-only movement with unsupported reach; optional camera token validation; and deterministic Atlas grounding.

Four real supplied recording files (world-coordinate, v2, v3, v4; eight trials total) were replayed without inventing session calibration. Every trial appropriately remained incomplete with all three criteria UNASSESSABLE. This verifies safe missing-calibration behavior, not physical form accuracy.

## Defects found and resolved during independent review

1. Camera capture-token changes initially failed to invalidate calibration. Added matching and regression.
2. Shoulder-wrist reach initially depended unnecessarily on elbow visibility. Measurement now depends on shoulder/wrist; guard geometry still requires its relevant elbow.
3. Visible but materially moving setup and sparse reach glimpses initially could calibrate. Added setup motion/stability and valid-coverage checks.
4. Image-only hand departure could appear completed despite unsupported world reach movement. Added supported reach-excursion check; remains a provisional segmentation heuristic.
5. New jump filtering exposed a missing-evidence interaction with sustained directly observed guard drop. Confirmed observed drop duration can support the correction without manufacturing a failure from unknown samples.
6. Robust peak/plateau updates and bounded-timeout handling exposed transient reach/recovery regressions. Regression suite passes after fixes.

No test expectation was weakened to declare physical success. All fixtures are synthetic unless explicitly described as supplied pose-only replay.

## UI controller integration and source review

`src/game/form-coach.ts` was inspected for explicit setup/stance/guard/lead/rear/bent capture steps; stale-frame rejection before capture/countdown; configuration change invalidation; cancellation on prompt/stance/placement changes; independently displayed criterion statuses; reliable-only relative-reach percentage; retry; explicit diagnostic export; session-ID sanitization; and responsive timeout handling. Source behavior is consistent with the intended workflow. Five tests in tests/form-ui.test.ts use a small synthetic DOM adapter with the actual mountFormCoach controller and real calibration/assessment engine: connected-camera guard; complete six-stage calibration through prompted result/retry; prompt-change cancellation; same-resolution camera restart; and lost recovery frames without dimensions. These tests pass. They are controller integration tests, not a real browser or physical camera walkthrough. Actual phone capture and Fire TV operation remain NOT VERIFIED.

`askFormAtlas` consumes deterministic criterion feedback and limitations, with a bounded replay action and no provider-generated diagnosis. Tests confirm user requests cannot inject force or elbow-straightness claims.

Additional final adversarial tests pass: sustained framing drift invalidates between stages; duplicate packets do not count as independent framing evidence; missing dimensions during lost tracking remain neutral; and a late first observation cannot resurrect a scored attempt.

## Gate decisions

| Milestone | Software gate | Evidence / remaining physical gate |
|---|---|---|
| 1: audit + calibration | PASS | Independent robust/stability/configuration tests; actual user stable hold and camera suitability NOT VERIFIED |
| 2: prompted lifecycle | PASS | Completed, idle, unsupported movement, absent return, missing recovery and one-result regressions; physical segmentation NOT VERIFIED |
| 3: three criteria | PASS | Independent outcomes, missing evidence, overlapping distributions, drift and spike tests; real criterion accuracy NOT VERIFIED |
| 4: Coach Mode integration | PASS for source/build integration | Actual controller + real engine verified through synthetic DOM adapter; phone/TV interaction NOT VERIFIED |
| 5: verification/validation | Automated PASS; physical NOT VERIFIED | 187 automated tests and production build pass; practical matrix requires human recordings/labels |
| 6: stretch features | DEFERRED | MVP physical gate has not passed |

Overall implementation gate: PASS for automated software behavior. Overall physical coaching MVP definition of done: NOT VERIFIED. Do not claim calibrated relative reach establishes elbow straightness or that visibility means anatomical correctness.

## Open limitations and required next validation

- Calibration full/bent separation and all tolerances are provisional engineering heuristics, not scientifically validated thresholds. Held-pose calibration does not establish performance on dynamic punches.
- Pose logs cannot prove actual elbow/wrist occlusion or anatomical form. Need independent video labels and the 12-scenario matrix in FORM_PRACTICAL_MATRIX.md.
- The existing guard estimator is reused; its fixed candidate criteria may reject some otherwise acceptable personalized guards. Real-user checks are required before changing established logic.
- Camera movement detection can catch material framing changes, but no one-camera pose check guarantees every camera/viewpoint/target change is detected. Explicit recalibration remains required after moving the phone.
- No actual Fire TV hardware/simulator validation or frame-rate profiling was performed. Desktop build is not Fire TV proof.
- No external credentials are required for deterministic MVP/offline Atlas; provider-backed LLM functionality remains separately unverified.
