# Prompted form MVP: practical validation matrix

Independent V&V protocol. Physical results below are NOT VERIFIED: no synchronized video, reviewed session calibration, or independently labeled criterion outcomes were supplied. Synthetic test success cannot fill this table's observed column.

Use the same selected stance, framing, resolution, camera and target direction throughout calibration and attempts. Record the calibration's camera/configuration ID, per-arm guard references, stable reach samples and explicitly labeled full/underreach samples. Capture consented video locally only if needed for manual annotation; exported landmarks alone cannot establish whether an elbow was truly occluded or anatomically straight.

For each scenario perform at least 5 repetitions for both orthodox and southpaw. Repeat a smaller set at frontal and slight oblique placements; recalibrate after each placement change. A boxing-competent human should label opposite-hand guard, controlled standard reach and return independently before seeing application results. Count unavailable evidence separately from correct/incorrect judgments.

| # | Prompt and controlled scenario | Expected guard | Expected relative reach | Expected recovery | Observed physical result |
|---|---|---|---|---|---|
| 1 | Jab, controlled correct attempt | PASS | PASS if calibrated feature separates classes | PASS | NOT VERIFIED |
| 2 | Jab, rear hand deliberately lowered | NEEDS_IMPROVEMENT after temporal tolerance | Independent of guard outcome | Independent of guard outcome | NOT VERIFIED |
| 3 | Jab, deliberately reduced reach | Independent of reach outcome | NEEDS_IMPROVEMENT only with reliable separation | Independent of reach outcome | NOT VERIFIED |
| 4 | Jab, extend then remain away from guard | Independent of recovery outcome | Independent of recovery outcome | NEEDS_IMPROVEMENT if continuously observed; otherwise UNASSESSABLE | NOT VERIFIED |
| 5 | Cross, controlled correct attempt | PASS | PASS if calibrated feature separates classes | PASS | NOT VERIFIED |
| 6 | Cross, lead hand deliberately lowered | NEEDS_IMPROVEMENT after temporal tolerance | Independent of guard outcome | Independent of guard outcome | NOT VERIFIED |
| 7 | Cross, deliberately reduced reach | Independent of reach outcome | NEEDS_IMPROVEMENT only with reliable separation | Independent of reach outcome | NOT VERIFIED |
| 8 | Cross, extend then remain away from guard | Independent of recovery outcome | Independent of recovery outcome | NEEDS_IMPROVEMENT if continuously observed; otherwise UNASSESSABLE | NOT VERIFIED |
| 9 | Shift left/right with otherwise unchanged punch | Preserve assessment for body-relative translation within frame | Preserve unless configuration/framing changes materially | Preserve unless tracking unreliable | NOT VERIFIED |
| 10 | Temporary elbow occlusion | UNASSESSABLE for guard if required guarding elbow is unavailable | Shoulder-wrist reach may remain assessable only if reliable; no elbow-straightness claim | UNASSESSABLE if returned guard cannot be established | NOT VERIFIED |
| 11 | Temporary wrist occlusion | UNASSESSABLE for affected guarding hand | UNASSESSABLE if peak coverage lost | UNASSESSABLE if recovery coverage lost | NOT VERIFIED |
| 12 | Tracking lost during retraction/recovery | Preserve pre-loss evidence only where sufficient | Preserve sufficiently observed peak independently | UNASSESSABLE; no missing-evidence failure | NOT VERIFIED |

Also record idle timeout, partial movement, held extension, repeated recovery frames, abrupt jumps, reconnect, stance/configuration change, and overlapping calibration distributions.

## Metrics

Report per criterion: human positive/negative/unlabelable counts; PASS true/false positives and true/false negatives relative to the criterion's human label; precision TP/(TP+FP), recall TP/(TP+FN), false-positive rate FP/(FP+TN), and UNASSESSABLE/all attempts. Do not silently discard unassessable attempts: report their count and rate alongside assessed-only confusion matrices. Report 0-denominator metrics as unavailable. Distinguish reliable measurement of relative reach from a judgment of anatomical elbow extension.

## Existing trial feasibility

The supplied world-coordinate, v2, v3 and v4 JSON files contain landmark sequences, not source images. Their punch intentions were described conversationally, including incorrect original `jab` labels for some intended crosses. None contains the new session calibration, reviewed held-pose full/underreach samples, or independent guard/recovery/occlusion labels. They can test input safety and honest UNASSESSABLE behavior; they cannot verify the 12 physical scenarios or derive a trustworthy per-person reach threshold.
