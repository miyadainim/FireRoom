# Bounded prescribed-sequence Coach Mode

Implemented October 15, 2026. This is an experimental comparison path alongside the original rule recognizer. There is no bundled reviewed physical reference. DTW performance, coaching accuracy, and Fire TV execution remain NOT VERIFIED.

## Flow

1. Check pose quality and matching camera placement, stance, and coordinate representation.
2. Capture a bounded attempt after a three-second countdown.
3. Normalize and time-resample observable features.
4. Compute globally constrained DTW alignment against a reviewed prescribed reference.
5. Independently require ordered outward movements and recoveries for every prescribed punch.
6. Report phase-specific positional findings, uncertainty, and separate timing observations.
7. Let offline Atlas explain only those findings. A sequence match is not a good-form grade.

The legacy detector continues as a separate live baseline. DTW does not update its points or lesson repetition counts. The ghost-arm demonstration is a visual guide, not the numeric pose reference. No new punch classes, trained model, second camera, or Arcade feature was added.

## Capture and reference workflow

In the viewer, select Jab or Jab-cross in the existing Drill selector. Find **Prescribed-sequence comparison · experimental**. Select World XYZ or Image XY, describe the actual camera placement, and choose a capture duration. Both phone and viewer must already be paired.

**Capture reference candidate** runs countdown → GO → capture. Perform one controlled prescribed sequence, with visible guard before and after. Stop early if needed. Export the last capture. A candidate has `review.status: pending` and no phase annotations; it cannot be used for coaching.

A suitable independent reviewer must inspect the movement and observation quality, using clear visual reference evidence where necessary. Review is a real human task, not something software can establish by checking a JSON field. Do not promote the user's earlier failed trials, synthetic fixtures, or an upstream punch label automatically into ideal-form ground truth.

For an accepted reference, annotate times in milliseconds relative to the first exported frame:

```json
{
  "phases": [
    {"punch":"jab", "hand":"left", "guardStartMs":500, "extensionMs":1500, "recoveryMs":2300},
    {"punch":"cross", "hand":"right", "guardStartMs":2300, "extensionMs":3200, "recoveryMs":4200}
  ]
}
```

These example times are illustrative; use actual observed phase boundaries, not these values. A jab reference has one phase. Hand mapping reverses for southpaw. This initial version requires each next extension after the preceding recovery. Keep metadata for drill, stance, geometryMode, cameraPlacement, reviewer, and actual ISO reviewedAt timestamp. Preserve original frames and declare `review.status: reviewed` only after review. Reviewed metadata is an attestation, not independent proof of correctness.

Load the completed reference with **Load reviewed reference JSON**. The importer checks envelope, phase order, anatomical hand, review metadata, finite and ordered frame data, duration, quality, meaningful outward movement, and recovery. It rejects malformed or pending references. The current attempt must match drill, representation, stance, and described placement. The UI can enforce an exact placement label but cannot prove the phone actually stayed there.

**Start bounded attempt** runs countdown → capture → evaluation. Return to guard before the capture ends. Stop capture cancels a countdown or ends the attempt. Pairing or drill changes cancel capture. Export contains pose frames, reference ID and evaluation; video is never recorded or uploaded. Atlas's previous bounded evidence is cleared when a new capture/reference begins to avoid stale feedback.

## Features and observation quality

`features.ts` uses nine signed features: each wrist relative to its anatomical shoulder and nose relative to shoulder midpoint, divided by shoulder separation. Image XY uses decoded aspect ratio and no depth; World XYZ uses estimated world coordinates exclusively. There is no mirroring or image-to-world fallback. This removes global translation/scale while preserving side, direction and camera-relative trajectory differences; it does not reconstruct the player's body.

Nose, shoulders, elbows and wrists must have visibility at least 0.65 in image and selected geometry. Image mode requires image dimensions. Raw frames must be strictly ordered in time and sequence within one session/stance. Attempts and references are bounded to 600 raw frames and 30 seconds. Resampling produces at most 120 points and never bridges an interval over 250 ms or missing observations. Coverage must be at least 80%, and a gap over 350 ms rejects the attempt. Missing samples can still prevent a finite alignment even above that coverage floor; no invalid row is treated as a free match.

The capture UI separately rejects late initial observations, stale final observations, or less than 80% local capture-window coverage. This prevents a silent network stall from looking like a short, complete attempt.

## Alignment and completion

`align.ts` implements exact dynamic programming with global endpoints, monotonic steps, a normalized diagonal band of 0.2, maximum consecutive horizontal/vertical runs of two, and masked RMS distances requiring shared observations. Run-state history is retained in the DP, rather than greedily selecting an invalid path. Custom run limits are capped at eight for memory bounds. Invalid input or no path produces null distance, not Infinity or zero-cost missing evidence.

The evaluator maps reviewed phases through the path and checks distinct observable guard, outward peak and recovery positions for each hand. Motion must exceed the provisional 75% reference-excursion minimum and absolute 0.25-shoulder-width floor, have the proper anatomical order, similar outward direction, and a completed return. Idle, missing punches, reversed order, missing recovery and clearly different lateral reaching are exercised in synthetic rejection tests. Global distance alone never establishes completion. Thresholds are provisional and require held-out calibration; semantically different actions with identical observed trajectories cannot be distinguished reliably by DTW.

## Form and timing findings

Movement completion and form are separate. An opposite-hand guard drop can be a positional deviation while the prescribed movement is still aligned. Guard findings use maximum observed displacement rather than an average that hides brief drops. Trajectory and recovery findings retain their own measurements. Insufficient phase evidence produces not-assessable.

Elbow form always abstains in this version: no independent elbow-observability annotation exists yet. A model-estimated angle alone cannot establish that a hidden elbow actually extended. Guard comparisons describe wrist position relative to the reviewed reference, not fist closure, injury risk, force or a calibrated body overlay.

Timing includes raw duration, reference duration, their ratio, maximum frame gap, and longest low-motion interval. The low-motion measure includes endpoint guard holds and has no validated pause target. It is descriptive; DTW can hide pauses and speed differences. No one DTW distance is converted into an overall technique score.

## Evaluation gate

Use separate reviewed references and held-out real attempts from the same supported placement. Include correct jab and jab-cross, cross-jab, partial excursions, incomplete recovery, idle, reaching, guard drops, occlusion and tracking loss. Report completion confusion, rejection reasons, phase coverage, per-criterion agreement with human reference, timing and runtime. Do not adjust thresholds on held-out data solely to force passes.

Software tests use explicitly synthetic fixtures; none is a reviewed physical reference. Human review, real-camera attempts and target execution are the remaining gates. See docs/validation/DTW_INDEPENDENT_REVIEW.md.

## BoxingVI

BoxingVI may support supplementary action evaluation after terms and schema verification. It is not an ideal-form reference, does not provide MediaPipe world landmarks, and may not include guard-to-recovery context. No data was downloaded or integrated. See docs/validation/BOXINGVI_REVIEW.md for terms, mapping, viewpoint and split limitations.
