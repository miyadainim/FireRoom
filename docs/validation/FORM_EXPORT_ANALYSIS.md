# Saved form-assessment case study — 2026-10-17

Source: fireroom_trials/fireroom-form-assessment.json, unchanged. Orthodox, prompted jab; 480×640 phone capture. This file stores pose estimates, not video or independent form ground truth.

## Observations

All six calibration captures were saved (37 setup,35guard,37lead reach,36rear reach,38lead bent,36rear bent frames). Calibration valid means required setup references exist; it does not mean reach judgment is available.

| Arm | Held extended median (estimated m) | Held bent median (estimated m) | Consequence |
|---|---:|---:|---|
| Lead / left | 0.2791 | 0.3421 | Reversed ordering; no reach threshold |
| Rear / right | 0.2699 | 0.3431 | Reversed ordering; no reach threshold |

Both arms are calibration-only, thresholds null. These distributions are not simply overlapping: their ordering is reversed relative to the instructed holds. The file cannot distinguish pose-estimation error, ambiguous viewpoint, or a misunderstood pose. Do not swap the references automatically or force a threshold.

The attempt contains44/44 tracked frames over3385ms; maximum gap85ms. Minimum image visibility: left shoulder.998/elbow.921/wrist.871; right shoulder.999/elbow.955/wrist.929. High visibility establishes model availability, not accurate geometry. No tracking-loss event explains the result.

The left world shoulder-to-wrist distance is approximately0.31–0.35m in initial guard, falls to0.155m during the movement, and rises again toward0.30m during return. The engine's radial peak timestamp is therefore near recovery, rather than a trustworthy extension peak. Guard departure is recorded at120001ms; estimated radial peak120778ms; return near guard121404.7ms. The radial extension-support predicate requires peak above guard baseline plus0.05m and fails here. Image/world positions changed, but reliable outward reach is not established.

## Software defects and correction

Original export labels all three criteria UNASSESSABLE and completed false, but says no movement observed and hand lost during recovery. Those explanations conflict with its own departure/return timestamps. It also describes reversed calibration distributions as overlapping.

Corrected wording distinguishes reversed held measurements, exposes unavailable reach in practice UI, and reports that the hand moved/returned near guard while estimated reach was inconsistent. Diagnostic evidence now includes baselineReach, peakReach, reachIncrease and recoveryObserved. Conservative completion and criterion outcomes remain unchanged. This is an explanation/diagnostic fix, not proof of improved punch recognition or physical form assessment.

## Next physical check

Repeat the same extended and bent holds from a clearer oblique view with the same target direction; inspect whether the extended median is reliably larger than the bent median for each arm. Verify pose instructions were followed. Do not interpret impossible ordering as poor boxing form. Capture a new calibration and attempt export. If the feature remains reversed, keep reach disabled and evaluate another observable feature using labeled video/reference evidence; do not silently relax the threshold.

Software regressions and independent gate results are in FORM_EXPORT_REVIEW.md. Actual technique, cause of depth error, and physical accuracy remain NOT VERIFIED.
