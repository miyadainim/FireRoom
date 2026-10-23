# Practice video/landmark comparison — October 17, 2026

The supplied practice manifest matches run `44d6cb19-7d7d-4da4-98ff-63feab9d5d3c` in assessment `(3)`. All 39 attempt frames match by sequence, producer timestamp and camera configuration. Their manifest offsets span approximately **2.599–5.695 seconds**, consistent with the short 5.94-second MP4's visible action. The renamed/transcoded video has no embedded run ID, so association is supported by timing/content rather than a cryptographic identity check.

## Main finding: image landmarks also fail

Around **4.130 seconds** (sequence 1419), the visible moving fist is outward, but the image landmark for its wrist is near the upper arm/shoulder. The estimated elbow is near the outward fist. This is stronger evidence than the previous depth-only hypothesis: the projected wrist location itself is wrong in the approximate matched view. It is not established that the wrist locks onto the guarding hand; that hand's landmark is separate.

![Video and image-landmark comparison](video-review-20261017/aligned-peak-comparison.jpg)

| Measurement | Value |
|---|---:|
| Shoulder image position | (247.65, 260.59) px |
| Estimated wrist image position | (243.54, 237.22) px |
| Estimated elbow image position | (305.74, 220.98) px |
| Wrist model visibility | **0.962** |
| Elbow model visibility | **0.9986** |
| Estimated world shoulder-to-wrist distance | **0.0867 m** |

These are model outputs, not manually measured physical positions. The high visibility would keep both joints green despite the observed mislocalization. Shoulder-to-wrist reach shrinks from about 0.32 m in guard to 0.087 m during outward movement. The engine then places its stable radial maximum around the return, explaining the small 0.61 cm net increase and rejection.

The same visual comparison at about 3.171 and 4.599 seconds is saved in `video-review-20261017/aligned-overlay.jpg`. Qualitative inspection supports failure during the outward phase followed by improved wrist positioning during retraction. Precise elbow extension, force and overall form quality remain unverified.

## Timing limits

The manifest contains 153 pose callback mappings. At startup the recorded offset origin changes by about **129.7 ms**, caused by resetting the recorder origin in `onstart` after earlier callbacks were already logged. Later attempt mappings have a consistent producer-to-offset relationship, but encoding, event and transcoding latency still prevent frame-exact alignment. The outward hold persists across adjacent reviewed frames, supporting the qualitative mislocalization finding without claiming a calibrated pixel-error measurement.

## Implications

Do not lower the 5 cm gate or use the raw maximum to force acceptance. Poor wrist localization undermines image/world reach and can manufacture a bent-arm skeleton. Visibility alone is insufficient to detect it. Next validation should compare tracking outputs on these same frames and add consistency/uncertainty checks before grading extension. Observable guarding-hand position and return should be handled separately from unreliable reach evidence. Correct the recording origin bookkeeping before claiming tighter synchronization.

No production code or thresholds were changed in this analysis. Independent review: [PRACTICE_SYNC_REVIEW.md](PRACTICE_SYNC_REVIEW.md). Three new association/recorded-evidence regressions pass; full suite **243/243 PASS across 28 files**. Software replay/association gates pass. General tracking accuracy, form accuracy, exact synchronization and Fire TV deployment remain **NOT VERIFIED**.
