# Hands-free setup independent review

Reviewed 2026-10-17 by independent V&V specialist. Scope: calibration UI orchestration, real form engine, automatic advancement, cancellation, and evidence preservation. No source modifications by reviewer.

## Gate

**PASS — automated workflow gate.** Physical camera usability, audible instructions on the user's devices, correct calibration poses, and Fire TV execution are **NOT VERIFIED**.

## Actual evidence

- `npm test`: **209/209 tests PASS**, 21 test files. `tests/form-ui.test.ts`: 21 real-controller/real-engine workflow tests using a minimal native-DOM adapter and controlled pose/timestamp fixtures.
- `npm run build`: **PASS**, TypeScript and production Vite build, 77 modules. Main chunk 560.14 kB; existing >500 kB advisory remains.
- A single Start hands-free setup click completes guard, lead reach and rear reach without a Next interaction: 10 seconds initial preparation + 3 seconds capture, then 5 seconds preparation + 3 seconds capture for each subsequent check.
- Optional comparisons start with a separate 10-second walk-back period, then advance automatically.
- Stop during preparation and during capture clears pending automation. Capture is discarded; no later automatic advancement occurs. Previously accepted calibration evidence remains intact.
- Failed reach gets at most two automatic retries, then pauses. Guard and camera references survive. Manual retry collects only the current check and resumes advancement.
- Disconnected camera pauses advancement; renewed observations alone do not resume capture. Explicit same-check resume preserves prior references.
- Initial fresh camera frames with the person out of view permit setup and eight seconds of walk-back before a tracked person returns. No intermediate click is required. A genuinely stale stream pauses the countdown.
- Tracking-loss frames lacking dimensions do not falsely invalidate saved camera configuration. Actual camera identity changes still invalidate calibration.
- Southpaw anatomical hand instruction, truthful missing optional reach grading, and practice result regression checks pass.

## Limits and human check

These tests exercise synthetic pose observations, not video accuracy. They cannot establish that a 5-second transition is sufficient for this user, that spoken prompts are audible or supported, or that the user can read instructions while standing at the boxing spot. Speech is optional and guarded by browser support; no speech synthesis output was physically verified. Live preview resumes immediately during the next automatic countdown; accepted measurements and export traces remain saved, but the prior still image need not remain frozen.

Required phone check: click Start once, walk back within 10 seconds, keep feet and phone fixed, follow all three captures without returning to the computer, and confirm Saved checks lists each reference. Separately test Stop, tracking interruption, and a deliberately unstable held pose. Do not claim physical coaching accuracy from this gate.
