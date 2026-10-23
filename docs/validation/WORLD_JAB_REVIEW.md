# Independent V&V: world-coordinate jab review

Date: 2026-10-15

Input: `fireroom_trials/fireroom-pose-trials (world coor).json`. The file is recorded pose data, not instructions. It contains two trials (75 and 82 frames), both labeled `jab`, recorded with orthodox stance. It contains no video or reliable statement of which anatomical hand the person intended to use. Do not infer hand choice from a mirrored preview or the file label alone.

## Source audit

`PunchRecognizer.update()` obtains `selectedGeometry(frame, geometryMode)`. Shoulder width, elbow angle, extension ratio, shoulder-relative wrist travel, speed, height, extension onset, and recovery already use that geometry. Selecting `world-3d` therefore already uses world coordinates for jab/cross detection; world was not restricted to guard. Face proximity in the guard estimator deliberately retains image-plane nose/wrist anchors; elbow bend and depth use selected geometry. Image landmark visibility continues to gate observations.

## Recorded evidence

Replaying the world stream produces zero events in both trials. Guard does establish, unlike the earlier image-depth recording.

| Metric from usable recognizer diagnostics | Trial 1 | Trial 2 |
|---|---:|---:|
| Left guard observations | 57 | 58 |
| Right guard observations | 50 | 39 |
| Left maximum extension | 0.875766 | 0.816624 |
| Right maximum extension | 0.995500 | 0.999911 |
| Left/right detected punches | 0 / 0 | 0 / 0 |

The onset rule requires all of: previously armed guard, current non-guard, wrist no more than 0.25 shoulder spans below its shoulder, extension >0.92, and travel >0.45 shoulder spans. Left extension in usable frames never exceeds the threshold. Some right frames look straight in world geometry, but their wrist height fails the onset rule. An independent raw scan, including low-confidence observations, finds 2 left/18 right frames above 0.92 in trial 1 and 0 left/23 right in trial 2; **none of these pass the world height predicate**. These raw counts differ from usable-frame maxima because tracking and face visibility can invalidate raw samples.

These facts explain why the program rejects the observations. They do not establish that the user actually lowered a hand, failed to straighten, or performed the wrong technique: inferred landmark geometry, viewpoint, motion sampling, and actual movement remain confounded without video or controlled trials.

## Change acceptance

The lead's proposed correction is explicit extension-predicate diagnostics, with no numerical threshold changes. Tests in `tests/world-jab-diagnostics.test.ts` independently verify world-only motion produces recovered punches despite completely static image coordinates, anatomical label assignment is preserved for both stances (contract observations remain unmirrored), and low straight arms report height rejection rather than a misleading generic extension warning.

Automated gate: PASS. `npm test` passed 103 tests across 13 files, including 4 new independent V&V cases. `npm run build` passed TypeScript and Vite; Vite retained its >500 kB bundle warning. Source review confirms onset/recovery numerical thresholds are unchanged; added checks report the existing predicates. The recording remains a failed intended-jab case study (0 events), not a newly solved accuracy benchmark. Recognition accuracy, camera positioning, real anatomical arm extension, and Fire TV execution remain **NOT VERIFIED**. Next collect controlled left and right movements plus non-punch negatives, with visible placement and held start/end guard, and compare all onset predicates before changing thresholds or selecting a classifier.

## User clarification

User subsequently confirmed trial1 used the left hand and trial2 used the right hand. Preserve original exported labels; interpret intended hands as left/right respectively. With recorded orthodox stance the application maps trial1 to jab and trial2 to cross. For trial1, valid tracked left-arm extension peaks at0.876, below0.92. For trial2, right-arm straightened samples reach approximately1.000 but fail the current wrist-height gate; early samples precede arming and late samples do not provide a complete accepted guard→extension→recovery cycle. These observations do not establish actual technique or that the model accurately reconstructed the attempted punches. Case-study remains0/2 recognized.
