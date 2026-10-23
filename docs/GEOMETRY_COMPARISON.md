# Image and world geometry comparison

Implemented 2026-10-15. Both representations come from one PoseLandmarker.detectForVideo result and one timestamp; the model runs once per processed camera frame. Three deterministic recognizers run independently on the viewer. No additional model or raw-video transport is introduced.

## Modes

| Mode | Geometry | Depth check | Purpose |
|---|---|---|---|
| Image XY (`image-2d`) | Image x and aspect-corrected y; z discarded | Unavailable, explicitly skipped | Isolate projected arm geometry from inferred depth |
| Image XYZ (`image-3d`) | Historical normalized image x,y,z calculation | Historical depth rule | Preserve the previous detector baseline |
| World XYZ (`world-3d`) | MediaPipe worldLandmarks x,y,z | Relative world wrist/nose depth | Evaluate consistent estimated3D coordinate units |

Google documents [normalized and world outputs](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js): image x/y are normalized by image width/height, image z uses roughly the x scale, and world x/y/z are estimated meter coordinates with hip-midpoint origin. The world output is still inferred from the same monocular model; it is not measured depth or verified biomechanics.

Image XY y is multiplied by decoded image height/width so its axes share image-width units. Old recordings lacking imageSize use uncorrected XY as an explicitly unknown-aspect legacy comparison. Image XYZ deliberately preserves previous behavior for baseline reproduction, including its original mixed-normalization limitations. It should not be interpreted as equally calibrated physical geometry.

All modes retain anatomical indices, explicit stance, confidence gates, history, event ordering and stale-reset rules. Face-region proximity remains an image-plane check in all modes. Elbow bend, extension, shoulder-relative travel, speed and history positions consistently use the selected representation. Relative distances remain shoulder-normalized; thresholds are provisional. Image XY has no evidence of depth and cannot verify a fist is in front of the face. Mode comparisons therefore compare complete rule configurations, not only isolated coordinate accuracy.

## Shared contract and transport

Lead approved backward-compatible additive v1 fields:

- `PoseFrame.worldLandmarks?: Landmark[]`: optional33 estimated world landmarks with visibility. If present, validated for cardinality, finite coordinates and confidence. Empty array permitted only for explicit tracking loss.
- `PoseFrame.imageSize?: {width:number;height:number}`: decoded image pixel dimensions, positive safe integers.

Image `landmarks` remains required for preview and visibility. A missing world array is never synthesized from image coordinates. World-mode diagnostics return unavailable and reset pending cycles if world evidence is absent. World visibility gates are checked alongside image visibility. Both arrays/dimensions survive receiver validation, local recording and JSON export. Current relay20KB packet cap accommodates representative dual-array frames; performance and real network bandwidth still need measurement. The relay was restarted to load the new validator, invalidating earlier session links.

## Using the comparison

1. Refresh the phone page to load the new camera adapter and refresh the viewer; generate a new QR pairing. Use the HTTPS server on port5175.
2. Start camera. Phone status must say `world landmarks: available`; the viewer must say `World data: present` and show decoded image size.
3. Under Live recognition, all3 mode rows show per-arm elbow angle, guard status, extension and cumulative detections since last reset. Scoring geometry selects which detector updates the lesson. Switching it stops an active trial and restarts lesson and all histories/counters to prevent mixing results.
4. Record each intended movement once using Start/Stop trial. Both arrays are captured regardless of selected scoring mode.
5. Export poses+results. JSON includes original trial frames, per-trial active-mode annotation, selected-mode result and `comparisons` for all3 detectors replaying identical frames from fresh histories per trial.
6. Compare exact sequences, missed/extra punches, guard observations and visibility. Include held guard, dropped hands, face pass-by, non-punch movement, each hand, reversed combinations and tracking-loss cases. Separate camera placements with different exports. Keep participant/session-separated held-out trials before claiming a winner.

World-mode replay skips a trial if any non-lost frame lacks world landmarks or no world observations exist. Skipped trials increment unavailableTrials and do not enter expected/missed counts. They are not valid zero-event misses or successes. Old supplied recording contains no world data and cannot be reconstructed retrospectively without source video.

## Actual evidence

Independent V&V:99/99 tests pass, production build passes with507KB main-chunk advisory. Tests verify optional old-frame compatibility, invalid world rejection, no fallback, independent histories and visibility, consistent geometry, recorder cloning, replay availability and synthetic world-motion detection distinct from static image geometry. Lead browser verified scoring mode selection and lesson reset; screenshot docs/validation/geometry-comparison-ui.png. This is software/UI evidence, not real camera validation.

Replayed the user's earlier252-frame file without altering labels: Image XY0/3, historical Image XYZ0/3; World XYZ unavailable3/3. Image XY alone does not fix the complete recorded case. Image dimensions were not saved in the old data. The third trial is still labeled orthodox/jab even though the user describes a right-hand action; labels need correction in new trials rather than silently changing the old file. Result file: docs/validation/LEGACY_GEOMETRY_COMPARISON.json.

No new paired real-phone world capture, physical accuracy improvement, optimal camera angle, latency, or Fire TV behavior has been verified. Camera certificate trust is a user/device setup step; browser automation encountered the development certificate warning and did not bypass it. UI verification used the separate local HTTP preview; phone validation must use trusted HTTPS.
