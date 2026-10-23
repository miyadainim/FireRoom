# Independent movement-cycle verification

Date: 2026-10-19. Reviewer: independent V&V agent; no implementation ownership.

## Scope and decision

Automated component gate: PASS on the reviewed implementation and synthetic fixtures. Physical punch recognition, form assessment, actual phone throughput, and Fire TV execution: **NOT VERIFIED**. This is wrist-motion cycle recognition, with anatomical arm mapped to jab/cross using configured stance. Completion does not establish punch intent, full elbow extension, depth accuracy, or correct form. A feint or reach may share the same wrist trajectory.

The existing PunchRecognizer remains the comparison baseline. Movement acceptance no longer depends on its straight-elbow criterion or calibrated 5 cm world-reach increment. Optional extension assessment is separate and abstains without reviewed compatible references.

## Independent checks

`tests/movement-independent.test.ts` checks supported departure/return, initial stable guard, whole-body translation, lost observations, long gaps, duplicate timestamps, no repeated events during a held extension, raw input preservation, absent-reference extension abstention, unreviewed/calibration label exclusion, one-to-one event matching, wrong-arm false positives, missed positives, outside-window exposure, and tolerance-window false-positive accounting.

Final reviewed snapshot: independent suite 21/21 PASS. Full regression suite: 333/333 PASS across 36 files; production build PASS (90 modules). Main bundle 557.46 kB; existing size advisory remains. Later integration changes require appropriate regression checks.

## Defects raised and addressed

- Elbow-only low confidence originally interrupted wrist cycles because the global frame status depended on elbow confidence. Engine changed to reject lost observations globally while retaining wrist/shoulder requirements; initial guard still requires visible arm geometry.
- Recovery tolerance originally allowed a prior positive label to consume an event from the next reviewed negative window. Matching now respects the distinct reviewed window.
- Unmatched duplicate events inside positive-window recovery tolerance originally escaped false-positive accounting. They now count within that evaluation exposure.
- Replay adapter clock alignment was flagged: reviewed labels use video time, while PoseFrame timestamps may be producer time. Replay now uses video timestamps on cloned frames. An independent offset-clock fixture passes and verifies source preservation.

## Remaining limitations and required evidence

- Detector thresholds remain provisional. Synthetic successes do not establish the 18/20 jab or cross target or the non-punch false-positive target.
- Camera/body scale and torso-angle changes conservatively reset tracking, potentially rejecting legitimate torso rotation. This needs held-out real recordings.
- Sparse sampling can omit short peaks or the recovery hold. Timestamp-based holds prevent frame-count claims but cannot recover missed image evidence.
- High MediaPipe visibility can accompany an incorrect joint location. No test here certifies landmark placement or occlusion accuracy.
- Evaluation requires independently reviewed held-out labels, including short punches, feints, guard adjustments, occlusion, camera changes, idle, and both anatomical arms. Prompt intervals are not ground truth.
- The main JavaScript bundle remains over the 500 kB advisory threshold. Build success is not device performance evidence.

Next gate: review video boundaries and labels, run both detectors on identical recorded samples, inspect false positives/misses, and report per-category results with sample counts and uncertainty. Keep physical metrics **NOT VERIFIED** until that work is complete.


## Corrective gate: stale guard and unsupported lowering

2026-10-19: independent V&V reviewed the correction without editing implementation. The engine refreshes a guard anchor only from a compact sustained observed guard, requires consecutive departure observations, and reports sustained hand lowering as uncertain instead of a failed/partial punch. Reanchoring is not a general smoothing filter and remains provisional.

Independent tests added: gradual stable-guard repositioning without a phantom completed/partial punch; coherent shorter slow movement at 80, 120 and 160 ms cadence; and hand lowering without a partial-punch failure. Existing loss, camera changes, visibility, ordering, source preservation and evaluator tests still pass.

Source replay of `fireroom-tracking-lab (5).json`, Full model, 672 samples: eight previously observed completed wrist cycles retained (four left, four right); stale left false-start outcome at 43–45 s removed; right lowering at 51.333–51.833 s now uncertain with an explicit hand-lowering reason. Raw input JSON remained unchanged. Some onset/recovery estimates shift one sample (approximately 83 ms) with the refreshed reference. No reviewed timing ground truth establishes whether that improves timing accuracy. This is regression evidence on the development case, not held-out physical validation.

Corrective automated gate: **PASS**, 333/333 tests and production build PASS. Physical recognition/form/occlusion accuracy and Fire TV execution: **NOT VERIFIED**. High visibility alone does not establish that a wrist hidden behind the body is correctly placed. The clip still lacks reviewed labels, so it cannot establish zero false positives, precision, or recall. A held-out recording containing genuine slow/short punches, guard repositioning, lowering, feints and occlusion remains required.

## Export provenance correction

The subsequent comparison `(1)` reproduces the previous export's old partial outcomes; this establishes that the artifact does not reflect the corrected replay, but does not establish browser caching as the cause. Source review confirms the download handler now always invokes replay rather than reusing a report solely because its run ID matches. Each comparison carries `detectorVersion: guard-refresh-lowering-v2` and an ISO `generatedAt`; the UI also displays the detector version.

Independent test verifies version and generation timestamp, replaying changed sample data under the same run ID produces fresh results, and earlier results/source input remain unchanged. Source handler inspected; browser download interaction itself is NOT VERIFIED in this review. Rebuilt-source replay of Full/672 samples still yields eight completed cycles, no stale left partial, and one right lowering uncertainty. Full regression 333/333 PASS; build PASS. Physical and held-out accuracy remain NOT VERIFIED.

## Geometry-gate correction review: acceptance rationale before test revision

The prior independent synthetic test required every 50% shoulder-centred scale change or 0.5-radian rigid rotation to interrupt a cycle. That expectation conflated camera movement with body/viewpoint changes: a single pose stream cannot identify that cause from shoulder geometry alone. Fresh recordings 9/10 reproduce missed visible movements when the initial shoulder reference differs from later pose geometry. Changing a test is justified by this source-backed observability limit, not by a target detection count.

For the next geometry correction, independent checks will preserve explicit camera-configuration changes as interrupts; require uncertainty/reset for an abrupt coherent scale-plus-whole-body translation; and avoid treating pure shoulder roll/scale as proof of physical camera movement. Extension/form assessment must retain view-change uncertainty. Stable initial guard should establish the working reference after setup/walk-back. Replays of recordings 5, 9 and 10 will be reported as development-case regressions; recordings 9/10 have no reviewed punch-boundary labels, so improvement in counts alone will not establish physical precision or recall.

## Geometry correction v3: independent gate

Version `viewpoint-evidence-v3`. Independent suite **26/26 PASS**; full regression **339/339 PASS** across 36 files; production build **PASS**, 90 modules. Existing 557.46 kB main-bundle advisory remains. No implementation files were edited by independent V&V.

The original global rigid-scale/rotation fixtures remain as conservative coherent-image-change abstention tests. Added tests verify shoulder-only foreshortening and roll retain completed wrist-cycle evidence while setting viewpoint uncertainty and withholding extension eligibility; explicit camera configuration changes still interrupt; geometry reference starts at observed guard rather than the initial setup frame; missing head/hip visibility cannot establish corroborated global transformation. Six pairwise relationships among five anchors are correlated geometry checks, not six independent sensors or proof of camera motion. Hard-reset wording correctly preserves ambiguity between camera and body movement.

Independent source replay, preserving raw JSON, yields eight Full-model completed cycles (four anatomical left, four right) on each of recordings 5, 9 and 10. Full completed onsets lie only in the eight apparent attempt windows around 6, 11, 17, 21, 26, 31, 36 and 41 seconds; no additional Full completed events occur outside those windows. Recording 5's stale left partial remains removed and right lowering remains uncertain. Recording 9 still has an extra right partial at 7.75–9.625 seconds and several guard-adjustment outcomes. Recording 10 has adjustment outcomes and lowering uncertainty. Those extra candidates remain an open segmentation limitation, even though they do not count as completed punches.

Heavy is not automatically better: replay of recording 10 produces seven completed candidates, including an anatomical **left** candidate at 26.833–27.833 seconds during the apparent **right**-hand movement. Therefore “seven correct Heavy punches” is unsupported. Recording 9 Heavy retains six completed candidates. These are descriptive development-case replays with no imported reviewed labels, not validated precision/recall or full form assessment. Video review and numerical joint annotations are still needed to attribute Heavy's wrong-hand candidate to landmark placement, baseline error, or opposite-hand movement.

Automated corrective gate: **PASS**. Held-out physical accuracy, extension correctness, robust non-punch rejection, camera-motion attribution, device performance and Fire TV execution remain **NOT VERIFIED**. These clips have now informed development, so future generalization claims require new held-out recordings and independently reviewed boundaries/hand labels.
