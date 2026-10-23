# World-coordinate jab recording analysis — 2026-10-15

Input: fireroom_trials/fireroom-pose-trials (world coor).json. Two trials, labels jab, active scoring modeworld-3d;75+82 frames, world arrays present in all157 frames. Original data/labels unchanged; no source video is present to verify actual punch form or timing.

## Wiring verified

`new PunchRecognizer('world-3d')` uses selectedGeometry(worldLandmarks) for shoulder/elbow/wrist positions, segment lengths, elbow angle, shoulder-relative trajectory, elapsed-time speed, extension ratio, height eligibility and recovery. GuardEstimator separately uses world bend/depth/history plus shared image-plane face proximity. Thus world coordinates already drive jab detection. No image→world conversion or fallback occurs, and the exported mode confirms this route was active. Anatomical stance mapping remains orthodox:left→jab/right→cross.

## Baseline replay

| Trial | World left established guard frames | World right established guard frames | Max tracked left extension | Max tracked right extension | Events |
|---|---:|---:|---:|---:|---:|
|1|57|50|0.876|0.995|0|
|2|58|39|0.817|1.000|0|

These guard counts come from independent GuardEstimator replay; recognizer arming/history resets can differ around invalid observations. World geometry permits guard where earlier imageXYZ recordings failed; this does not establish general guard accuracy.

The extension test requires a previously armed guard, departure from guard, normalized wrist height≤0.25, extension>0.92, and shoulder-relative travel>0.45, followed by return to stable guard. All thresholds unchanged in this analysis.

- Tracked left-arm samples never reach0.92. Trial1 does contain an earlier raw left extension0.962, but that observation is low-confidence and recognition is reset; no trustworthy guard cycle can be completed from it.
- Right-arm samples do reach straightness and travel limits, but their height fails. For tracked trial1 frames62–74 (5.09–6.10s), extension ranges approximately0.948–0.995, travel1.04–1.60, while wrist y relative to shoulder is+1.28 to+1.68 shoulder spans. The limit is+0.25. These are estimated downwards positions, not high forward extensions under the current rules.
- Trial2 shows right-arm straightness at the start before arming, and near the end with height still failing. Ending in a lowered straight-arm pose without returning to stable guard cannot complete a valid recovered punch.
- Trial1 has6 low-confidence frames. Trial2 has2 low-confidence frames and4 face-anchor-unreliable observations. Those discard unresolved cycles and must not be silently ignored.

We cannot determine from pose data alone whether a real punch was missed because of model estimation, framing, sampling, or an actually partial/lowered movement. The labels describe intent; do not use these statistics to judge the user's technique.

## Change made

No thresholds were relaxed and no recorded event was forced to count. Added per-arm `extensionChecks` diagnostics exposing the exact existing predicates: armed, notGuard, height, extension, travel. Guards are pre-update gate snapshots; the displayed arm phase may already reflect the resulting transition. Generic guard-phase reason now reports straightness, travel, and wrist-height failures. World/image comparison rows also expose height/travel pass-fail. This makes the first failing stage testable in a new trial.

Gate: current recognizer **FAILS supplied labeled jab cases (0/2)**. Software-mode wiring is verified; physical jab accuracy and any recognition fix are **NOT VERIFIED**. Next observation should confirm which anatomical arm is being used, world guard is established first, and how height/straightness/travel change through one deliberate punch and full recovery. Do not relax the height gate merely to count arms lowered at the end of a session; include non-punch negatives before selecting new thresholds or calibration.

## User clarification

User subsequently confirmed trial1 used the left hand and trial2 used the right hand. Preserve original exported labels; interpret intended hands as left/right respectively. With recorded orthodox stance the application maps trial1 to jab and trial2 to cross. For trial1, valid tracked left-arm extension peaks at0.876, below0.92. For trial2, right-arm straightened samples reach approximately1.000 but fail the current wrist-height gate; early samples precede arming and late samples do not provide a complete accepted guard→extension→recovery cycle. These observations do not establish actual technique or that the model accurately reconstructed the attempted punches. Case-study remains0/2 recognized.
