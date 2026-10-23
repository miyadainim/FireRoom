# User pose-trial analysis — 2026-10-15

Input: fireroom-pose-trials.json,252 frames, SHA256 recorded in POSE_TRIAL_ANALYSIS.json. Original file unchanged. User describes trials1 and2 as left jabs and trial3 as right-hand jab. All exported trial labels are `jab` with stance `orthodox`; this is a label/configuration mismatch for the third intended movement under the current lead-hand/rear-hand mapping. It is not evidence that the user performed incorrect technique.

## Actual current-code replay

Bundled scripts/analyze-poses.ts with local esbuild and replayed all saved frames through unchanged PunchRecognizer and independent GuardEstimator. No camera video or upstream model executed. Export's0/3 result is reproduced:0 events,0 established guard frames for either arm in every trial. All236 usable tracked frames keep both arms idle.16 other frames are low-confidence (5 trial1,0 trial2,11 trial3).

| Trial | Intended hand | Frames | Tracked | Duration | Maximum observed extension ratio, intended arm | Depth-warning frames, intended arm |
|---|---|---:|---:|---:|---:|---:|
| 1 | Left |88|83|7.27s|0.992|43|
| 2 | Left |69|69|5.51s|0.986|43|
| 3 | Right |95|84|7.97s|0.995|64|

Those extension ratios exceed the detector's0.92 extension threshold. They do not count as punch events because guard never arms a cycle. Diagnostic travel stays0 because no guard origin is saved; that does not mean the user did not move.

## Why guard never establishes

Guard requires visible face/arms, image-plane near-face distance≤0.75 shoulder spans, estimated depth between−1 and+0.15 spans, 3D elbow bend≤110°, and stable history. Rejection reasons are checked in order: face distance, depth, elbow, motion. Thus the screen can show only a depth warning while also failing the elbow requirement.

Intended left arms in trials1/2 produce43 near-face tracked frames each. Every one fails both the hard forward-depth limit and the3D elbow-angle limit. In trial3 the intended right arm has65 raw near-face observations (64 tracked); one tracked near-face observation passes the depth range but still fails the elbow bend rule. No frame in any trial meets near-face and3D bend simultaneously, even if the depth cutoff were disabled. Loosening maxAheadFace alone is therefore insufficient.

| Near-face intended arm | Median image-plane elbow angle | Median3D elbow angle |
|---|---:|---:|
| Trial1 left |43.7°|154.4°|
| Trial2 left |45.7°|156.0°|
| Trial3 right |7.5°|154.9°|

The two representations disagree sharply: the projected image geometry is folded while the estimated z coordinates make the arm look nearly straight. Neither projection nor inferred depth independently establishes actual anatomical angle, but this demonstrates why the current fixed3D-bend rule fails on this recording. Depth offsets commonly reach−2 to−4 shoulder spans while hands overlap the face in the image. The hard−1-span rejection is a provisional assumption contradicted by these observed estimates; it cannot justify telling the user the physical hand is too far forward.

Changing the normalization from image-plane to3D shoulder width is not an adequate fix: median width ratios differ only about3–6%, whereas depth offsets differ by multiples of the existing cutoff.

## Additional observation limits

Trial3 has a501ms interval between received frames, exceeding the350ms reset limit, plus11 low-confidence frames. This could erase a punch cycle even after guard is repaired. Trial2 has no low-confidence frames and still detects nothing, showing that tracking loss is not the sole cause. Viewer sampling and already-missing frames cannot be recovered from this export.

Many opening/closing frames place the right wrist outside the normalized image bounds. Better framing may reduce observations lost at the edge; no exact phone placement or camera view is recorded, so optimal positioning cannot be inferred. No video is included; the number and precise timing of actual punches and whether every trial contains exactly one intended action cannot be independently verified.

## Recommended change and evaluation gate

Do not just lower extension thresholds or increase allowable forward depth until the file passes. Separate visible posture evidence from uncertain depth:

1. Use face-relative image geometry and elbow-bend evidence with explicit viewpoint/occlusion checks; retain short stable history.
2. Treat uncertain estimated z as supporting evidence/warning, not an uncalibrated absolute veto. Preserve an unknown result when visibility is inadequate. Do not replace all3D features blindly: pure2D geometry also fails for motion directly toward the camera.
3. Evaluate changes against these as development cases plus newly collected held-out guard/non-guard and punch/non-punch trials; report false positives, missed punches, per-hand results and sequence order. A change passing these3 development trials is not physical validation.
4. Correct label/configuration on future trials: `orthodox` currently maps left→jab/right→cross. Use hand-specific intent labels or correct stance when testing a right lead jab; do not relabel original data silently.

Gate: **current detector FAILS this supplied case study (0/3 reported intended actions recognized)**. Broader physical guard/punch accuracy remains **NOT VERIFIED**. No production recognition thresholds were changed during this analysis.

Reproduction:

```sh
node --input-type=module -e "import {build} from 'esbuild'; await build({entryPoints:['scripts/analyze-poses.ts'],bundle:true,platform:'node',format:'esm',outfile:'/tmp/fireroom-analyze.mjs'});"
node /tmp/fireroom-analyze.mjs fireroom-pose-trials.json /tmp/fireroom-pose-analysis.json
```
