# Face-relative guard estimation

Implemented 2026-10-15 in src/vision/guard.ts and integrated into the punch lifecycle. This replaces shoulder proximity as the guard classifier. It estimates an observable pose configuration, not confirmed boxing form or hand protection.

## Evidence conjunction

All four gates must hold, with visible landmarks and usable geometry:

1. **Near the face:** use visible nose landmark0 above shoulder midpoint as a face anchor. Image-plane wrist–nose distance / image-plane shoulder width ≤0.75. No shoulder fallback if the nose is unavailable. Eyes/ears are drawn for visual diagnostics but are not required by this version.
2. **Plausible estimated depth:** normalized `(wrist.z − nose.z) / shoulderWidth` between −1.0 and +0.15. Negative means camera-closer. This excludes a wrist clearly estimated behind the face or far ahead despite overlapping the face in the image. +0.15 is tolerance for noisy estimates; it is not proof the hand is strictly anatomically in front.
3. **Elbow bent:** shoulder–elbow–wrist angle ≤110°. Degenerate segments yield unknown instead of an angle-based success.
4. **Movement history:** candidates must persist over ≥100ms and ≥2 samples, with face-relative wrist speed ≤3 shoulder spans/second. A high-speed return invalidates that sample, so typical recovery needs a return sample, a settled sample, and a further hold sample. Timestamp units are milliseconds; history uses actual elapsed time, not frame count alone.

Visibility threshold0.65 applies to nose, both shoulders, and the observed arm. Shoulder width must be≥0.06 normalized image units. Constants are explicit and provisional; no user-specific calibration or physical accuracy validation has occurred.

## Three observable outcomes

- `guard`: all geometry, confidence and history gates pass.
- `not-guard`: current reliable observations fail geometry/motion/dwell. Diagnostic reason identifies the failing gate; a candidate still accumulating history is not established guard.
- `unknown`: required pose/face/arm landmarks or geometry are unreliable. This is an observation limitation, not evidence of poor technique.

Per-hand histories clear immediately on missing evidence. Timestamp gaps>350ms, unordered input, session or stance changes revoke history. There is no sticky guard from stale frames. PunchRecognizer conservatively clears both pending punch cycles when required guard evidence is unknown. It arms only from established guard and completes a recovery only after guard is re-established. Opposite-hand guard maintenance uses this same evidence; no measurement is inferred from a missing face.

## Scope and limitations

The face anchor is the nose, not a full FaceLandmarker. Wrist is a hand-position proxy; knuckles/fist closure are not observed by this rule. A bent hand beside the face may be something other than boxing guard. Camera-facing placement is assumed; profile stance, head motion, occlusion, perspective and depth noise need direct evaluation. x/y are image-normalized and z is estimated, not a metric reconstruction. Google documents [pose landmark coordinates and depth](https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/pose.md?plain=1); smaller z means closer to camera. These semantics support a coarse camera-depth check, not calibrated anatomical front/back validation.

History and geometry are complementary: elbow bend rejects an extended arm overlapping the face, proximity rejects a bent lowered arm, and dwell rejects a moving hand passing through the region. Whether this improves precision/recall on the user's phone is NOT VERIFIED.

## Verification and next physical test

16 estimator tests and5 independent integration cases cover stable guard, proximity/angle/depth negatives, unknown face/arm, pass-by, translation/scale invariance, timestamp/history resets, stable recovery, and opposite-hand maintenance. Existing synthetic motion fixtures were amended to contain a plausible face anchor and repeated settled samples rather than one-frame guard/recovery. No thresholds were weakened to make old fixtures pass.

Human test: camera facing player with face and arms visible; hold both hands bent near the face for0.3–0.5 seconds and inspect per-arm guard status/stableMs. Lower hands near shoulders, extend a hand over the face in the image, briefly sweep through the region, obscure the face, then recover. Record positive and negative labeled trials with the existing local pose recorder. Compare exact event results and false positives with recorded earlier trials if available. The physical guard test and reported combination-count defect remain NOT VERIFIED.
