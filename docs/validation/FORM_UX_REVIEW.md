# Independent review: guided form practice UX

Date: 2026-10-17
Reviewer: independent V&V agent (`friendly_vv`)

## Scope and gate

Software workflow gate: **PASS**. The controller guides connection, six setup checks, and practice in sequence. Practice controls remain hidden until setup checks finish or the optional comparisons are explicitly skipped. Technical measurements and export sit within a closed native details element. No pose thresholds or shared contracts changed in this UX work.

Physical coaching accuracy, real phone walkthrough, human usability, and Fire TV device/simulator execution: **NOT VERIFIED**. Automated DOM adapter tests do not execute layout, camera capture, or the browser accessibility tree. Lead browser inspection is separate evidence.

## Actual evidence

- `npm test -- tests/form-ui.test.ts`: **11/11 PASS**.
- `npm test`: **193/193 PASS**, 19 test files.
- `npm run build`: **PASS**, TypeScript check and Vite production build, 77 modules.
- Build advisory remains: main bundle 553.95 kB exceeds the 500 kB warning threshold. This is not Fire TV performance validation.

Tests use the actual form controller and assessment engine, with synthetic pose frames, fake timers, and a minimal DOM adapter. Added tests cover three-second preparation before three-second hold capture, cancel preserving the pending stage, disabled skip during a comparison countdown, camera interruption and retry, visible task progression, practice gating, collapsed technical options markup, and southpaw instructions naming the right front hand. Existing end-to-end controller tests cover calibration, demonstration, prompted punch, three criteria, retry, prompt-change cancellation, camera-restart invalidation, and missing tracking during recovery.

## Review findings

- One prominent setup/practice task is visible at each stage. Cancel remains available during preparation/capture.
- Lead/rear instructions name the actual anatomical hand according to stance.
- Comparing bent/extended samples remains explicit; skipping comparisons does not fabricate reach feedback.
- Result wording distinguishes “Good”, “Try this”, and “Couldn’t assess”; model limitations remain disclosed.
- The controller rejects stale observations at capture/attempt start, and camera configuration changes invalidate calibration.
- Initial independent feedback requested busy guards on attempt and skip and practice gating through all setup stages; implementation now includes these protections.

## Required human checks

Use the paired phone to follow setup without explanation from a developer. Confirm countdown and hold timing are understandable at normal viewing distance, labels remain readable on the TV, camera interruption is recoverable, and feedback matches observed behavior. Mark these checks **NOT VERIFIED** until recorded. Real recognition and form targets remain in the existing physical validation protocol.
