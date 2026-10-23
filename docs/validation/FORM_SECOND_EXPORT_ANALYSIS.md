# Second form export case study — 2026-10-17

Input: fireroom_trials/fireroom-form-assessment (1).json, unchanged. Orthodox, prompted jab,480×640. Pose-only recording; no video/independent form or stationary labels.

| Arm | Guard hold median world reach | Extended hold median | Bent hold median | Reach calibration |
|---|---:|---:|---:|---|
| Lead/left |0.3333m|0.3351m|0.2828m|Insufficient separation margin|
| Rear/right |0.3234m|0.3397m|0.2594m|Separable, threshold0.87789|

Unlike the prior export, both held extended medians exceed bent medians. Left full10th-percentile0.313533 minus bent90th-percentile0.293539=0.019994m; required engineering margin0.08×fullmedian=0.026808m. These central ranges do **not** overlap; their gap is insufficient for the configured margin. Corrected code now distinguishes this from actual overlap. No threshold relaxed. The margin is provisional, not a validated boxing cutoff.

The second left extended-hold range0.3065–0.3917m is wider than its bent hold0.2692–0.2961m. Extended reference is also almost identical to observed guard reach. This limits radial shoulder-to-wrist discrimination of the forward movement even when the held bent/extended comparison partly improves. Right calibration separation alone does not demonstrate successful cross assessment.

Attempt37/37tracked,2896.7ms,maxgap120ms. Saved evidence: baselineReach0.340483m,robustpeak0.356854m,increase0.016370m. The movement-support gate requires an increase over0.05m, so completion remains false and all criteria UNASSESSABLE. A return near guard is observed. The reach-calibration separation gate and attempt movement-support gate are distinct; changing only the left calibration margin would not solve this attempt.

## Image-plane variation

Measurements below use saved image coordinates multiplied by decoded width/height; frame-to-frame displacement is not actual physical movement or positional error.

| Capture | Left-wrist median adjacent displacement | Maximum | Minimum model visibility |
|---|---:|---:|---:|
| Guard |0.29px|1.68px|0.997|
| Lead extended hold |5.47px|17.46px|0.986|
| Lead bent hold |1.06px|3.99px|0.971|
| Rear bent hold |1.67px|69.39px|0.987|

The guard interval is comparatively stable; larger variation occurs during forward extension and one non-active left-hand jump during rear-bent capture. Without synchronized video, physical movement cannot be separated from pose jitter. High visibility accompanies the large displacement and therefore cannot independently certify accurate tracking.

## Decision

Keep conservative unavailable outcomes. Updated only the inaccurate overlap explanation; preserved raw data, thresholds and recognition behavior. Next physical experiment should explicitly compare guard and forward extension from a clearer oblique viewpoint, label held intervals and inspect both image/world features. If guard/full reach remains indistinguishable, keep this radial feature disabled and assess alternatives against ground truth rather than continue to tune this recording to pass. Physical form, tracking error and coaching validity remain NOT VERIFIED.

Independent replay tests/build evidence: FORM_SECOND_EXPORT_REVIEW.md.
