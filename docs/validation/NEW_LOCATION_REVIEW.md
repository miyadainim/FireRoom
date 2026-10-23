# Independent review: new-location form export

Input: `fireroom_trials/fireroom-form-assessment (4).json`. User reports a new location with good lighting and the fist away from the light. No matching video or timing manifest was supplied for this attempt.

## Deterministic findings

- Calibration is valid. Both arms have extended reference captures, but neither has an optional bent-arm comparison. Both thresholds are null and reliability is `calibration-only`.
- All 32 attempt frames are marked tracked by the model.
- The saved assessment is completed, with guard PASS and recovery PASS. Recovery time is 774.6 ms from the software-selected peak.
- Reach alone is UNASSESSABLE because its grading comparison has not been recorded. This assessment does **not** demonstrate that tracking failed to estimate reach.
- Independent replay confirms a 0.305159 m internal guard baseline, 0.367941 m stable temporal peak, and 0.062781 m increase. The existing 0.05 m movement-support rule passes. No recognition or calibration thresholds were changed.
- The left held extended reference is 0.289781 m, below the separately measured approximately 0.337 m guard median; those estimates do not establish physical extension quality.
- Raw estimated shoulder-to-wrist distance still falls to 0.164394 m around 1.142 s after the first captured frame and later rises to a raw maximum of 0.372642 m. The selected movement starts around 1.864 s and its selected peak is around 1.944 s. These are model-derived positions and software-selected phases, not verified physical phases. No video is available to determine whether this minimum is anatomically correct or whether the selected event corresponds to the intended punch.

## Feedback defect and fix

The old wording, “I couldn't measure your reach reliably on that punch,” incorrectly suggested an observation failure in this particular case. It combined missing optional comparison data with other reach limitations.

The corrected reach evidence identifies `availability: not-calibrated`, with reason “Optional bent-arm comparison not recorded.” Feedback explains that reach grading is not enabled. When guard and recovery both pass, primary feedback reports those positive findings and explains that reach grading remains off. Completed state, numerical evidence, timestamps, and assessment statuses remain unchanged.

## Verification gate

Independent regression: `tests/form-fifth-export.test.ts` replays the real export without modifying it, preserves numerical/status evidence, checks all 32 tracked frames and missing comparisons, and verifies specific availability feedback.

- Automated suite: **PASS**, 244/244 tests across 29 files.
- Production build: **PASS** after replacing an existing ES2020-incompatible `Array.at` call in `tests/video-fourth-export.test.ts:37` with indexed access. Vite built 80 modules; main bundle 569.08 kB. The >500 kB advisory remains.
- Physical correctness and true elbow/wrist accuracy: **NOT VERIFIED**.
- Lighting causality: **NOT VERIFIED**. Location and lighting both changed; this is not a controlled lighting-only comparison.
- Fire TV deployment: **NOT VERIFIED**.

This is a software replay and feedback-specificity gate, not approval of physical coaching accuracy. Obtain the matching new video and timing manifest before comparing true movement with the landmark timeline.
