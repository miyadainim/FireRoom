# Independent pose-trial case study — 2026-10-15

Evidence: `fireroom-pose-trials.json`, raw 33-landmark frames and bundled replay result. User identifies trials 1 and 2 as left-hand straight punches and trial 3 as a right-hand straight punch. All exported labels are `jab` and all stances are `orthodox`; under FireRoom's stance convention the right hand is a cross. Labels must be corrected in an analysis copy rather than silently treating these as three identical jab trials.

This is a three-recording diagnostic case study, not a physical acceptance gate or a technique assessment. No video, camera calibration, handedness/mirroring verification, or independent punch timing annotation accompanies the data.

## Independent raw measurements

Computed with Python standard-library Euclidean distance and law of cosines, matching the baseline guard formulas. Face distance is wrist-to-nose image-plane distance divided by image-plane shoulder span. Depth offset is wrist z minus nose z divided by that same span. Elbow angle is based on x/y/z. Statistics below cover all recorded frames; counts marked visible additionally require nose, both shoulders and relevant arm visibility >= 0.65. These are observations, not proposed thresholds.

| Trial | Frames | Duration | Tracked / low confidence | Largest frame gap |
|---|---:|---:|---:|---:|
| 1 | 88 | 7.271 s | 83 / 5 | 194.7 ms |
| 2 | 69 | 5.507 s | 69 / 0 | 121.9 ms |
| 3 | 95 | 7.972 s | 84 / 11 | 501.3 ms |

| Trial / arm | Median face distance | Median depth offset | Median 3D elbow angle | Max extension ratio | Visible near-face frames | Visible near-face AND 3D-bent frames |
|---|---:|---:|---:|---:|---:|---:|
| 1 left | 0.874 | -1.909 | 145.3° | 0.992 | 43 | 0 |
| 1 right | 0.841 | -1.972 | 146.1° | 0.981 | 44 | 0 |
| 2 left | 0.242 | -3.572 | 153.0° | 0.986 | 43 | 0 |
| 2 right | 0.372 | -3.059 | 151.3° | 0.981 | 43 | 0 |
| 3 left | 0.234 | -3.561 | 155.6° | 0.988 | 65 | 0 |
| 3 right | 0.324 | -3.280 | 154.6° | 0.997 | 65 | 0 |

Near-face means <=0.75 spans, bent means <=110°, extension is shoulder-to-wrist / (upper-arm + forearm). The maxima include frames outside full tracked state and are not proof of a valid punch cycle.

A revealing independent check replaces 3D elbow geometry with image-plane geometry ONLY for comparison. Every visible near-face frame above then has elbow angle <=110°. Median image-plane elbow angles on those frames are left/right 43.7°/4.3° (trial 1), 45.7°/5.4° (trial 2), 46.7°/7.5° (trial 3). Thus the recorded projection looks folded while inferred z makes the 3D arm look straight. Neither projection nor monocular z establishes actual anatomical elbow angle.

Median 3D/image-plane shoulder-span ratios are only 1.035, 1.056, and 1.046. Changing normalization width alone cannot explain or resolve offsets of three or four shoulder spans.

## Baseline failure chain

1. `src/vision/guard.ts` requires image proximity, bounded inferred depth, bent 3D elbow, and stable movement history simultaneously.
2. Raw data has ZERO frames satisfying proximity plus bent 3D elbow for either hand in any trial; therefore no stable guard is possible even without the depth condition.
3. The observed negative depth offsets also exceed the baseline ahead-of-face bound (-1 span) frequently. The message “wrist estimated too far ahead of face” is a model/rule incompatibility signal here, not evidence that the person is holding their hand incorrectly.
4. `src/vision/recognizer.ts` only considers extension after a guard state is established. Large extension ratios consequently do not mean an event should be emitted. Guard is the first blocker; straightness is not generally absent.
5. Both-arm confidence resets and the 350 ms gap rule add interruptions, especially trial 3. Trial 2 has no such gaps or low-confidence frames, yet still fails, isolating guard geometry as a sufficient blocker.
6. Exported baseline replay reports zero detections, three missed labels. With only positive trials this cannot establish false-positive behavior.

The two arms exhibit large coordinate changes and high inferred straightness throughout all three recordings. Raw extrema alone cannot reliably assign each transient to the user's intended hand or establish punch onset; the user's hand annotations remain the ground truth for this case study. A right-hand event under orthodox settings should be evaluated as `cross` while preserving the user's wording in the original recording.

## Evaluation recommendations

- Treat monocular face-depth disagreement as uncertainty, rather than authoritative corrective coaching.
- Evaluate image-plane bent-arm evidence and temporal outward/return motion as a fallback, while recognizing that head-on punches can have small image-plane motion.
- Avoid accepting a high absolute extension ratio as a punch: compare change from a reliable resting/guard baseline, direction, recovery, and timing.
- Preserve raw recordings and report original versus candidate replay outcomes separately. Do not tune constants solely until these three pass.
- Require holdout left/right trials, held guard, lowered arms, head touches, waving, camera occlusion, and drop/reconnect actions before claiming improvement. Record hand and stance independently to avoid label ambiguity.

Gate: baseline replay for these supplied positives FAIL (0/3 exported); generalized recognition improvement and physical milestone acceptance NOT VERIFIED. This case study supplies evidence to investigate an estimator failure, not permission to relax all confidence/ordering rules.
