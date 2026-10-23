# Independent JSON/video alignment review

Date: 2026-10-17. Scope: supplied JSON manifests and pose exports only. This review does not establish physical form, actual occlusion, or the identity of the two Telegram MP4 files.

## Inputs and identity

- `fireroom_trials/fireroom-calibration-88e5c971-9a86-44d7-a2e4-13ac0b68c436.json`: completed calibration timing manifest, duration 36,959.2 ms, 955 unique pose sequence entries (231–1185). Declared original MIME type `video/webm;codecs=vp8`.
- `fireroom_trials/fireroom-form-assessment (3).json`: camera configuration `ea1f0dfb-fa52-4336-a7c9-98aa555d7643`; explicitly references calibration run `88e5c971-9a86-44d7-a2e4-13ac0b68c436` and separate practice run `44d6cb19-7d7d-4da4-98ff-63feab9d5d3c`.
- `fireroom_trials/fireroom-form-assessment (1).json`: camera configuration `2b028fc3-8d0c-480f-bdce-757c0ff1e50a`; belongs to a different camera session. Its calibration/attempt must not be substituted for the latest export or aligned using this manifest.

## Calibration windows

Every saved calibration frame matched a manifest entry exactly by sequence, phone-local pose timestamp, and camera configuration ID. Boundaries below are **approximate recorder-local video offsets**, not verified encoded video presentation timestamps.

| Saved stage | Frames | Pose sequence | Approximate video interval |
|---|---:|---|---|
| Setup | 37 | 483–560 | 9.610–12.599 s |
| Guard | 37 | 483–560 | 9.610–12.599 s |
| Lead reach | 36 | 897–971 | 25.708–28.606 s |
| Rear reach | 37 | 1103–1179 | 33.735–36.672 s |

Setup and guard are identical frame arrays, not two independent observations. Gaps between saved windows do not prove that an extra stage or failed retry occurred; discarded windows and transitions are not labeled by this manifest.

The manifest has one startup discontinuity: offsets for sequences 231–233 are 31.7, 65.0, and 96.7 ms, then sequence 234 drops to 30.8 ms. The code resets its timing origin in `MediaRecorder.onstart`, while frames may already be observed after recorder state becomes `recording`. This is consistent with the approximately 97.6 ms shift. The later calibration windows use the post-start origin; this defect still prevents treating every manifest offset as a single perfectly monotonic media timeline.

## Practice is a separate recording

The latest attempt contains 39/39 `tracked` frames, sequences 1380–1459, phone-local timestamps 59,632.8–62,728.4 ms. The calibration manifest ends at sequence 1185 / 51,878.7 ms. There are **zero overlapping practice sequences**. Do not extrapolate practice timestamps onto calibration video or claim an exact match with either unnamed MP4.

The separate practice manifest (run `44d6cb19-7d7d-4da4-98ff-63feab9d5d3c`) or original run-named video is needed for supported practice synchronization. A plausible clip duration or visual resemblance alone is insufficient identity evidence. Telegram MP4 names differ from the manifest's original WebM format/name; whether files were converted, trimmed, or relabeled is unknown.

## Stored assessment evidence

The latest exported assessment is `exercise: jab`, `completed: false`, lifecycle `EVALUATED`:

- Guard, reach, and recovery: **UNASSESSABLE**.
- Estimated baseline shoulder-to-wrist reach: 0.323003 m.
- Estimated stable peak reach: 0.329070 m.
- Estimated increase: 0.006067 m (approximately 0.61 cm).
- `recoveryObserved: true`.
- No bent-arm reference for either arm; both arm calibrations are `calibration-only`, with no reach threshold.
- Saved extended medians: lead 0.406704 m, rear 0.232767 m. These are model estimates, not measured anatomical lengths or physical form ground truth.

This export supports the software's inability to establish reliable outward reach. It does not establish that the user did not punch or had incorrect form. `tracked` status and green/high-visibility joints do not independently verify anatomical accuracy.

## Checks and gate

Read-only Python JSON parsing and exact sequence/timestamp/camera joins: **PASS** (all 147 saved stage rows matched; setup/guard duplicates included). Camera-session mismatch exclusion: **PASS**. Practice-to-calibration timeline alignment: **NOT VERIFIED / unsupported**, with no overlapping frames and no practice timing manifest supplied. Physical punch form, elbow visibility, and media identity: **NOT VERIFIED** by this JSON-only review. No source or thresholds changed; no build/test-suite claim is made here.

## Independent visual inspection of decoded clips

Reviewed the root agent's locally decoded `video-review-20261017/practice-detail.jpg` and `calibration-detail.jpg` contact sheets. These show sampled visible images, not a calibrated 3D reconstruction. The root reports long MP4 duration 36.91 s and short duration 5.94 s; the long clip's content and duration are consistent with calibration, but original run identity and unchanged timing are not cryptographically established.

- Long clip around 10.0, 11.5, 12.5 s: both hands held near the face; consistent with the manifest's guard window.
- Long clip around 26.0, 27.5, 28.5 s: the arm on the image's right is held outward, with the other hand near the face; consistent with the lead-reach window.
- Long clip around 34.0, 35.5, 36.5 s: the opposite arm is held toward the camera with visibly changed torso orientation. Fist/forearm overlap obscures direct inspection of elbow geometry. This is a viewpoint/observability limitation; it is not evidence of incorrect form.
- Short clip: hands near the face at 3.6 s; image-right arm moves outward at approximately 3.9–4.4 s, retracts around 4.6–5.0 s, and is back near the face by 5.2 s. The opposite hand remains near the face in the sampled images. This supports a visible outward-and-return action, rather than absence of movement. It does not independently establish complete elbow extension, correct 3D trajectory, or named anatomical hand because camera mirroring has not been verified for the MP4.

The short clip provides qualitative evidence of movement. It must not be assigned to an exact practice JSON frame or peak without the matching practice manifest. Physical form accuracy and exact synchronization remain **NOT VERIFIED**. No joints were annotated as measured occlusion ground truth.
