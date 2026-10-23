# Independent review: shorter, fixed-position Coach setup

Reviewed 2026-10-17. Scope: guided calibration controller and real form engine via automated DOM adapter. This is not browser, camera, or Fire TV physical validation.

## Changes verified

- Default path requires three captures: guard plus camera framing from the same observations, lead reach, rear reach.
- Each capture retains the existing 3-second preparation and 3-second observation window.
- Guard failure after accepted camera framing retries guard only and preserves accepted framing.
- Accepted checks survive repositioning and unstable later checks; camera restart still invalidates appropriately.
- Instructions name anatomical hands for orthodox and southpaw, keep feet and phone fixed, and direct both reaches toward the same boxing target.
- Practice is available after the three captures. Without optional bent comparisons, reach remains UNASSESSABLE; reliable synthetic guard and recovery can still pass.
- Optional comparisons enable reach assessment only when the real engine finds separable measurements. Equal extended/bent estimates do not become passes.
- Saved-check labels include only accepted measurements. The saved pose estimate caption explicitly disclaims proof of correct form.
- Existing stopped-camera, tracking-loss, cancellation, and changed-prompt checks remain covered.

## Evidence and gate

`npx vitest run tests/form-ui.test.ts`: **19/19 PASS**.

Initial full suite: **206/207 PASS**; one historical-export comparison failed solely because primary feedback copy changed, while structured results remained unchanged. The test now compares every structured result unchanged, explicitly checks the revised advice, and verifies that the historical input recording was not modified. Final `npm test`: **207/207 PASS**, 21 test files.

`npm run build`: **PASS**. Main bundle 558.78 kB; existing >500 kB advisory remains.

Physical setup usability, visibility of saved skeleton on actual screens, anatomical correctness of measurements, real phone camera walkthrough, and Fire TV execution: **NOT VERIFIED**. A saved skeleton is a model estimate, not independent evidence that a user held the intended pose.

Software gate: **PASS** for the tested controller and engine behavior. Physical gate: **NOT VERIFIED**. No new wire contracts or measurement thresholds were introduced.
