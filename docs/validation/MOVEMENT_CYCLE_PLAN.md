# Guard → outward movement → recovery milestone

Scope: new additive CV recognizer and offline Tracking Lab comparison. Preserve existing MediaPipe Full pipeline, GuardEstimator, calibration, diagnostic exports and old recognizer. No Coach Mode/Arcade behavior changes until separate integration gate.

Dependencies: audit existing gates → timestamped cycle API → engine fixtures and reviewed-label evaluator in parallel → Tracking Lab replay integration → independent regression/adversarial review → real-camera acceptance.

Gate A: audit/source contracts. Existing PunchRecognizer requires all six arm joints visible in both geometries, global guard availability, straightness >.92, wrist shoulder-relative y≤.25 and travel>.45; recovery needs guard and straightness<.88; gaps>350ms or unresolved1.8s discard. Thus elbow occlusion, opposite-arm uncertainty, view-dependent short extension and estimated depth can prevent valid cycles. PromptedFormAttempt separately requires calibration, reliable world reach, >.05m increase, bounded start timing, contiguous peak observations and guard recovery. These gates conflate movement completion with extension evidence. Lab segmentation requires supplied intervals and is not an unrestricted detector.

Gate B: preserve v1 shared contracts. New detector has additive module-specific evidence/outcome types. No fabricated physical force or full-extension score. Anatomical hand+stance determines prescribed straight-punch role, not unrestricted punch classification. Temporal observations in body-normalized image2D; guard source preserved. Unobservable depth/outward semantics remain uncertain.

Gate C: deterministic fixtures: variable sampling, timestamp gaps/out-of-order, missing elbow, missing wrist, independent hands, duplicates, stance/camera changes, partial/adjustment/ambiguous actions, uncertain extension. Independent V&V must review.

Gate D: offline identical-frame old/new replay with one-to-one matching. Precision/recall/false positives/timing errors require independently reviewed punch labels and boundaries. Prompt schedules are not reviewed ground truth. Existing recordings lack complete independently reviewed feint/adjustment/occlusion/camera-shift labels; report NOT VERIFIED for absent scenarios. No selecting/relabeling solely to make scores pass.

Gate E: human camera protocol required: known Full setup, controlled20jabs20crosses20nonpunch actions, short punches, feints, guard adjustments, elbow/wrist occlusion, pose/position changes, sequences. Review exact movement boundaries independently; report each scenario. Physical success cannot be inferred from software fixtures or prompted labels. Fire TV remains outside this CV change and NOT VERIFIED.
