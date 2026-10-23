# Independent review: second form-assessment export

Date: 2026-10-17. Source: `fireroom_trials/fireroom-form-assessment (1).json`.

## Findings

- All 37 attempt frames report `tracked`. This is model confidence, not independently measured joint-position accuracy.
- Lead full-reach median: 0.335106 m; bent median: 0.282791 m. Their central distributions do **not** overlap: full lower bound 0.313533 m minus bent upper bound 0.293539 m = 0.019994 m. However, the required margin is 0.0268085 m (8% of full median). Lead reach remains unavailable. The previous diagnostic incorrectly described this as overlap; the source fix distinguishes insufficient margin from overlap and reversed measurements without changing thresholds.
- Rear full-reach median: 0.339708 m; bent median: 0.259448 m. The margin passes and normalized threshold is 0.877893. This validates calibration separability for these observations, not rear-punch performance: the exported attempt is a jab.
- The jab leaves and returns near guard. Estimated baseline reach is 0.340483 m, stable temporal peak is 0.356854 m: increase 0.016370 m, below the existing 0.05 m movement requirement. The current result remains incomplete with all criteria UNASSESSABLE.
- Raw lead reach spans 0.125115–0.429615 m. Using its isolated maximum would inflate reach relative to the temporal peak; the implementation conservatively preserves its temporal criterion.
- Baseline estimated reach already exceeds the calibrated full-reach median. This is a measurement-consistency warning, not evidence that the player started with a straight arm. No original video is present to determine the physical cause.

## Verification

Independent tests: `tests/form-second-export.test.ts` adds real-export calibration replay, diagnostic correctness, margin calculations, rear threshold, exact attempt assessment replay, raw-range comparison and input nonmutation.

- Targeted regression: **2/2 PASS**.
- Complete suite: **203/203 PASS**, 21 test files.
- TypeScript and production build: **PASS**; 77 modules; main bundle 555.90 kB. Existing >500 kB bundle advisory remains.
- No contract or acceptance-threshold changes.

Gate: **PASS** for diagnostic correction and conservative replay. Physical punch-form accuracy, the cause of model instability, stationary-pose ground truth, real phone walkthrough, and Fire TV deployment: **NOT VERIFIED**. An independently reviewed video or additional physical reference is required to distinguish occlusion, movement, placement and model error.
