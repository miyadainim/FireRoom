# Repeated front-view test — October 18, 2026

## Inputs and method

User export `fireroom-tracking-lab (4).json` validates: Full and Heavy on the same new clip, 448 samples/model at 125 ms intervals (8 Hz). All default evaluation labels remain, two intended full and two short attempts/hand. Video `fireroom_18_0ct_video.mp4` sampled for qualitative review. Export lacks a new calibration. Condition metadata matches the earlier front baseline, but physical equivalence is not established; video background/framing differs. Camera height and tilt are not measured in this file.

Primary analysis uses current analyzeTrackingRun with tau80ms and **no external baseline**, retaining visibility/missing-data and implausible-jump checks. This avoids applying prior guard-derived bone-length checks to the new recording. Sensitivity analysis applies the earlier front baseline from export(1). Derived JSONs and sampled contact sheet are in `front-repeat-20261018/`. No production changes or threshold changes.

## Primary results: supported peak reach

Median of two intended attempts per class; image reach is in pixels, world reach is inferred centimeters, not physical ground truth.

| Model / hand | 2D full / short | World full / short |
|---|---|---|
| Full left |122.9 /68.7 px|41.6 /38.0 cm|
| Full right |102.3 /74.6 px|36.4 /33.6 cm|
| Heavy left |126.6 /72.4 px|37.7 /26.0 cm|
| Heavy right |104.8 /71.1 px|34.2 /29.2 cm|

All four 2D intended full/short range pairs do not overlap in these two examples/class. Full left world ranges40.07–43.06cm versus35.97–39.93cm only barely separate (0.14cm between nearest endpoints); do not call this a robust margin. No accuracy rate or generalized threshold established. Human intended labels remain provisional; sparse video review cannot establish every movement's true form or exact framewise synchronization.

Full median inference54.25ms, p9560.7ms; Heavy205.7ms, p95210.9ms. Full remains faster, approximately3.79x median. No-reference visibility-available Full samples432/448 per hand; not confirmation of physical accuracy. Sampling remained8Hz, not previously suggested12Hz.

## Calibration/filter sensitivity

With old baseline, Full left 2D supported full peak falls122.9→47.3px and right102.3→53.9px while short medians remain68.7/74.6px, reversing intended ordering. Heavy exhibits the same direction problem. Baseline-derived bone-length rejection changes which observations contribute to peaks. This demonstrates a software measurement confound: the inversion cannot be attributed solely to MediaPipe localization or 2D geometry. Actual projection changes and potentially mismatched calibration are plausible causes; no frame-annotated ground truth proves every rejected point correct. Full world medians remain unchanged in this sensitivity comparison; Heavy left world changes.

## Gate

Descriptive analysis PASS, independently recomputed. Legacy projected bone-length rejection plus automatic baseline reuse is **not validated for extension grading** and must be audited before integration. The recording provides promising within-clip evidence; it does not establish a winning angle or general recognition/form accuracy. Exact synchronization, manual joint accuracy, physical metric reach, and Fire TV execution remain NOT VERIFIED.

Next implementation milestone: expose rejected observations/reasons, avoid treating projected arm lengths as invariant, and require explicit baseline compatibility. Reanalyze earlier and fresh recordings with independent V&V before adopting thresholds. No additional recording is necessary just to diagnose this filter effect.
