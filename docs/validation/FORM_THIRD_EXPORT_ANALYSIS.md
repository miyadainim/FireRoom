# Third form export analysis — 2026-10-17

Input: fireroom_trials/fireroom-form-assessment (2).json, unchanged. Orthodox jab,480×640, session-local export. No raw video or independent physical labels.

## Stored calibration

Setup35frames, guard35frames, leadreach38frames,rearreach38frames. All required references exist and calibration.valid=true. Setup and guard are different sample windows despite equal counts. This could be an earlier UI or a guard retry after accepted framing; the file has no app-build identifier and does not independently prove the hands-free flow used.

| Arm | Guard median estimated reach | Held extended reference | Bent reference | Grading |
|---|---:|---:|---|---|
| Lead/left |0.3258m|0.393344m|Not recorded|Unavailable|
| Rear/right |0.2895m|0.277748m|Not recorded|Unavailable|

Left held reach is more distinguishable from guard than in the previous export (previous0.3333guard versus0.3351extended). This is a feature observation, not verified form improvement. Right held extended distance is slightly smaller than its guard distance; this weakens confidence in radial discrimination for that arm. Both calibration-only flags and null thresholds are expected without optional shortened-reach comparisons.

## Attempt

31/31frames tracked across2470.8ms; maximum adjacent gap156.8ms. No tracking-loss reset explains rejection. Saved evidence: baselineReach0.324351m,robustpeak0.346772m,reachIncrease0.022421m,recoveryObserved=true. Current movement-support gate requires >0.05m increase; fails. This is separate from unavailable calibrated-reach grading.

Raw left reach ranges0.220379–0.373451m. A sample near1082ms reaches0.373m, then drops to0.220m in the next recorded frame. The robust peak is therefore lower than the raw maximum. Even raw maximum minus baseline is only0.04910m, below the fixed0.05m requirement. No threshold is adjusted to force acceptance. World-distance direction/instability and the common movement-support predicate still limit dynamic assessment.

The engine observes guard departure and return, but conservatively withholds completion and all three criteria when radial movement support is insufficient. Thus guard/recovery remain coupled to reach-based movement evidence. These outputs do not establish poor guard, short physical punch or failed physical recovery. This coupling is an implementation limitation requiring independent validation before any alternative acceptance rule.

## Result

Expected replay: completedfalse, guard/reach/recoveryUNASSESSABLE, recoveryObservedtrue, saved references unchanged. No source or thresholds changed for this recording. Independent test/build evidence: FORM_THIRD_EXPORT_REVIEW.md. Physical pose correctness, depth accuracy, camera-angle suitability and Fire TV execution remain NOT VERIFIED.
