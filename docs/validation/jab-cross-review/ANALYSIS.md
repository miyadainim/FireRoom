# Jab–cross guard review

This is a native feedback-log extract, not the requested original frame-by-frame attempt export. Original result seen at 2026-10-22 01:55:41 Singapore (2026-10-21 17:55:41UTC). Native screenshot current-vega.png confirms completed jab+cross and focused export button. Export was activated once, but no retrievable native file was found. The app was not reloaded or relaunched. A later attempt replaced the result while inspection was active; subsequent-feedback.json preserves that separate snapshot.

## What the requested result says

- Jab and cross sequence observed; wrist-return recovery confirmed for both.
- Both-hand guard before and after sequence observed.
- During jab: opposite right wrist briefly reached0.56 shoulder widths below its eye (limit0.50). Longest low interval113ms, below180ms needed to classify a sustained deviation. Code returns cannot-assess for a brief out-of-region excursion rather than calling it a guard drop or a pass.
- During cross: opposite left-hand guard supported (max below-eye0.43).
- After cross: movement wrist return confirmed, but separate strict held-guard estimator did not yield guard in its short post-return window. Later sequence-finishing guard uses a different wrist/eye-only check and a wider window; therefore finishing guard observed can coexist with cannot-assess immediately after cross.

Source: src/vision/guard-height.ts observeGuardHeight/assessGuardHeight:0.50 vertical limit,180ms violation duration; src/vision/prescribed.ts recoveredGuard uses GuardEstimator(image-2d) after recovery through cycle end+250ms; src/vision/guard.ts strict estimator also requires tracked status, visible elbow/nose/shoulders/wrist, bend/proximity/stability; src/vision/guard-boundaries.ts uses wrist/eye regions and100ms held duration without elbow requirement.

We cannot identify which exact post-cross sample, landmark or criterion prevented strict held guard without raw frames. Do not diagnose actual technique from these logs. No thresholds or evaluator code changed. Full JSON retrieval remains incomplete; the saved artifact is explicitly labelled feedback-only.
