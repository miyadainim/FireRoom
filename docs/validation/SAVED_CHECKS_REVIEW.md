# Independent review: saved setup checks

Date: 2026-10-17
Reviewer: Independent V&V agent, separate from source implementation.

## Gate decision

**PASS for automated software behavior.** Real smartphone usability and Fire TV execution: **NOT VERIFIED**.

## Reviewed behavior

A check has a three-second preparation countdown followed by three seconds of held-pose capture. Accepted setup, guard, and per-arm reference measurements remain in the session while the player moves between checks. A failed check retries its own stage and keeps earlier accepted references. Shoulder-span variation alone no longer invalidates the calibration session. Suspected perspective changes during practice abstain from assessing that attempt while keeping the saved calibration available.

Explicit camera restart tokens, session changes, stance changes and changed image dimensions still invalidate calibration. A manually moved phone cannot reliably be identified from shoulder width alone; the user must restart setup after intentionally moving the camera or changing the target. Saved measurements are session memory, not persistent across reloads.

## Independent evidence

Updated the previous shoulder-span invalidation test to assert preservation of all saved calibration values after sustained span changes. Added regressions for:

- Completed setup and guard surviving idle arm repositioning, torso-span changes during preparation and reach capture; the new reach is saved independently.
- An unstable reach capture retaining setup and guard, then accepting a successful retry without redoing those stages.
- Practice perspective uncertainty producing UNASSESSABLE results without mutating calibration or hiding practice.
- Saved-check labels listing accepted references only, without claiming skipped bent-arm comparisons were captured.

Existing explicit camera-restart, stance, session and resolution invalidation tests remain passing. Countdown timing, stopped-camera cancellation, cancellation/retry, low-confidence recovery, calibration data quality and report grounding regressions remain in the suite.

Commands run against integrated source:

- `npm test`: **198/198 tests PASS**, 19 files.
- `npm run build`: **PASS**, TypeScript check and Vite production build, 77 modules.
- Bundle advisory remains: main bundle 554.25 kB minified (146.88 kB gzip).

These use synthetic prerecorded poses and a native-DOM adapter. No physical camera correctness, real phone walkthrough, browser interaction screenshot, or Fire TV device/simulator execution is claimed by this review.
