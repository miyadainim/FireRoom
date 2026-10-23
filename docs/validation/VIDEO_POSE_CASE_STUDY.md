# Video and pose case study — October 17, 2026

The user supplied two videos, a calibration timing manifest, the latest assessment `(3)`, and an older assessment `(1)`. Original files were left unchanged. Video decoding and review happened locally; no footage was uploaded.

## What is visible

The short video shows a clear outward-and-return action:

| Video time | Visible observation |
|---|---|
| 3.6 s | Both hands near the face |
| 3.9–4.4 s | The arm on the right side of the image moves outward |
| 4.6–5.0 s | That arm retracts |
| About 5.2 s | Both hands are near the face again |

The opposite hand remains near the face in the reviewed frames. These observations support visible movement and return. They do not establish precise elbow straightness, depth, force or overall technique quality. Anatomical hand identification also depends on whether the renamed video preserves the original unmirrored orientation.

![Reviewed practice frames](video-review-20261017/practice-three-frames.jpg)

The longer video shows guard at about 10–12.5 seconds, one arm held outward around 26–28.5 seconds, and the opposite arm held outward around 34–36.5 seconds with a torso turn. In the last hold, the camera-directed fist/forearm partly obscures the elbow. The bright background reduces visible contrast around parts of the upper arm; whether this caused model errors is not established.

## Which files match

The calibration manifest's run ID and camera configuration match assessment `(3)`. All 147 exported calibration rows match manifest sequence IDs and producer timestamps. Approximate mapped windows are:

- Guard: **9.610–12.599 s**.
- Lead reach: **25.708–28.606 s**.
- Rear reach: **33.735–36.672 s**.

The long video is 36.91 seconds and its visible poses correspond closely to these windows. Another extended hold is visible around 18–20 seconds; rejected calibration samples are not exported, so its rejection reason cannot be established from this export.

The latest practice frames occur after the calibration manifest ends. The short video appears to be the practice clip, but its exact association and synchronization remain **NOT VERIFIED** without the timing manifest for run `44d6cb19-7d7d-4da4-98ff-63feab9d5d3c`. The older assessment `(1)` has a different camera configuration and must not be combined with this session.

Both supplied MP4s decode as H.264 at 480×640. The calibration manifest describes the original WebM/VP8 recording. Transcoding is plausible, but cannot be used to prove video identity or unchanged timing.

## Why the app rejected the latest attempt

Assessment `(3)` reproduces exactly:

| Stored measurement | Value |
|---|---:|
| Tracked attempt frames | 39/39 |
| Estimated guard reach | 0.323003 m |
| Robust estimated peak | 0.329070 m |
| Estimated increase | **0.006067 m / 0.61 cm** |
| Required movement-support increase | More than 5 cm |
| Return near guard observed | Yes |

The shared radial-distance gate fails, so completion is false and all three criteria remain UNASSESSABLE. Both arms also lack optional bent-reference comparisons, so calibrated reach grading is unavailable independently of that gate.

The video establishes visible movement; the rejection reflects the current estimated geometry and verification rule. It does not establish that no punch was thrown or that the user's form was incorrect. Guard/recovery feedback remains coupled to reach-based movement confirmation, which is an implementation limitation.

## Verification and next work

Independent review: [VIDEO_ALIGNMENT_REVIEW.md](VIDEO_ALIGNMENT_REVIEW.md). Two new actual-export tests reproduce the assessment and verify calibration/practice timing separation. Full regression: **240/240 tests PASS across 27 files**. No production rules or thresholds were changed for this analysis.

The manifest has an approximately 98 ms startup timing-origin discontinuity. Later calibration windows remain usable as approximate offsets; exact synchronization is not claimed.

The next engineering focus is to separate observable guard/return evidence from uncertain radial reach and validate extension-phase measurements against labeled video. Do not lower the threshold simply to accept this recording. The missing practice manifest is needed for precise peak-frame comparison. General technique accuracy, recognition targets, exact practice synchronization, and Fire TV operation remain **NOT VERIFIED**.
