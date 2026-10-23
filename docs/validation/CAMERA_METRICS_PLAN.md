# Camera tracking and technique validation

Prepared October 15, 2026. Measure data availability, recognition, and technique validity separately. A tracked landmark is not necessarily accurate.

## Current evidence

| Recording | Received frames | Tracked | Low confidence | Lost | Received rate | Gaps over 350 ms |
|---|---:|---:|---:|---:|---:|---:|
| v2 | 184 | 147 (79.9%) | 12 | 25 | 11.5 Hz | 1 |
| v3 | 145 | 137 (94.5%) | 8 | 0 | 12.0 Hz | 0 |
| v4, left offset | 99 | 99 (100%) | 0 | 0 | 11.8 Hz | 0 |

These percentages describe model visibility flags on viewer-received frames. They do not establish correct joint positions, face visibility, or correct form. Received rate is the sum of within-trial frame intervals divided by their duration; it is not phone inference FPS. Camera and model counters would be needed to measure all captured or inferred frames.

In v4, Image XY recognized one of two user-described actions; World XYZ and historical Image XYZ recognized zero. The intended actions are left jab and right cross, despite both original labels saying jab. Preserve the originals and attach that clarification. Two attempts cannot establish a general accuracy rate.

## Procedure

Freeze the app version and thresholds. Record phone/browser, decoded image dimensions, stance, lighting, distance, camera height, and offset relative to the player. Keep these consistent when comparing placements.

Use five jabs, five crosses, and five non-punch actions per placement for exploratory setup selection. Then collect a separate held-out test at the selected placement. If rules are tuned using the final test, collect a new held-out set before reporting success.

### 1. Tracking continuity

Record 30 seconds holding guard, 30 seconds moving, and five tracking-loss/recovery attempts. Report tracked/low/lost frame counts, longest gap, gaps over 350 ms, received frame rate, and time until usable tracking returns. Report stationary landmark/angle jitter separately from accuracy.

Proposed initial target: at least 95% of received frames tracked and no gaps over 350 ms during an unoccluded test. Occlusion should produce unknown rather than invented technique evidence. This target is not a currently verified capability.

### 2. Guard classification

Collect 20 visible guard holds, 20 visible non-guard holds, and 10 deliberately unobservable cases. Label each hand independently using a visual reference. Evaluate separate trials after the startup dwell, rather than treating correlated frames as independent tests.

Report guard precision, recall, false-guard rate, unknown rate, and assessment coverage. Unknown on a visible reference is lost coverage; unknown on an occluded reference can be correct abstention. Do not silently exclude unknown cases. Proposed starting target: 90% precision and recall on visible held-out cases, with coverage reported separately.

### 3. Punch recognition

Collect 20 jabs, 20 crosses, 20 non-punch actions, 10 jab-cross sequences, and 10 reversed sequences. Use correct stance and action labels. Hold guard, perform the intended action once, recover, then stop recording.

Match one correct hand/type event to each isolated trial. Count extra events as duplicates or false positives, missing events as misses, and wrong types in a confusion matrix. Report each hand separately, along with tracking failures and unknown observations.

Existing project gates:

- At least 18 of 20 jabs correctly recognized.
- At least 18 of 20 crosses correctly recognized.
- No more than one false punch across 20 non-punch actions.
- Correct sequence ordering and clean tracking-loss recovery.

These are initial screening gates, not proof of 90% population accuracy. Repeat across sessions and participants before generalizing.

### 4. Technique validity

Use independent visual reference labels for each criterion: opposite hand near face, return to guard, and observable elbow opening. Labels should distinguish criterion met, criterion not met, and unassessable. A suitably qualified reviewer should assess boxing form.

Report agreement, precision of corrective feedback, and assessment coverage. Confident correction of an unobserved elbow is a failure; abstaining can be correct. Model-estimated world landmarks cannot serve as their own ground truth. Manual image angles validate projected angles only; actual 3D angle error requires an independent 3D reference.

Reference video is optional and requires participant consent. It is a validation artifact, not an automatic upload or a change to the pose-only app transport. Use a trial marker to align it with exported poses.

## Using the current app

Record and export one session per placement. All three geometry modes replay the same frames. Do not use simulation controls. Guard holds can use the existing non-punch label plus a separate trial-index reference specifying guard, non-guard, or occluded; the generic label alone is insufficient for guard accuracy.

For every trial, retain: ID, placement, intended hand/action, reference form labels, reference visibility, detected type/count, tracking failures, and whether feedback was correct. Human reference labels and controlled trials remain required before claiming technique accuracy.
