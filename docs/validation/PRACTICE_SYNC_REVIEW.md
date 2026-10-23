# Independent practice synchronization review

Reviewed the newly supplied practice timing manifest against assessment `(3)` and the locally extracted short-video frames. No production changes or threshold adjustments were made. Source recordings remain unchanged.

## Association and timing

**PASS:** Manifest run ID `44d6cb19-7d7d-4da4-98ff-63feab9d5d3c` matches the assessment practice run ID. All **39/39** exported attempt frames match one of the manifest's **153** rows by sequence number, producer timestamp and camera configuration ID. Attempt offsets span **2.5991–5.6947 seconds**, inside the **5.9273-second** recording window. The supplied short MP4's reported duration, approximately 5.94 seconds, is compatible with this association; matching duration does not independently prove transcoded video identity or unchanged timing.

**NOT VERIFIED:** Exact video-frame alignment. At startup, sequence 1315 has a later producer timestamp but a lower callback offset than sequence 1314. The inferred time origin changes by approximately **129.7 ms**, consistent with resetting recorder origin on its asynchronous start event after observations have begun. Later attempt observations have a stable inferred origin within 0.3 ms, but callback offsets are still approximate and do not establish sensor exposure times or video presentation timestamps. The original WebM was renamed/transcoded to an MP4; unchanged frame timing and orientation cannot be proved from the manifest.

## Reviewed model failure

At sequence **1419**, approximate video offset **4.1304 seconds**:

- Left image wrist 15: normalized `(0.50737, 0.37066)`, about `(243.5, 237.2)` pixels in the 480×640 source.
- Left image elbow 13: `(0.63696, 0.34528)`, about `(305.7, 221.0)` pixels.
- Left shoulder 11: about `(247.6, 260.6)` pixels.
- Right wrist 16: about `(169.2, 271.6)` pixels, distinct from the left wrist estimate.
- Estimated left shoulder-to-wrist world distance: **0.08666 m**.
- Reported left-wrist visibility: **0.9620**; elbow visibility: **0.9986**. Tracking status is `tracked`.

Independent visual inspection of [aligned-overlay.jpg](video-review-20261017/aligned-overlay.jpg) shows visible outward arm movement while the cyan wrist estimate sits much closer to the moving shoulder than the apparent distal hand. The elbow estimate lies farther outward, yielding an apparently folded-back arm. The return frame also visually corresponds to return movement. This supports image-plane landmark mislocalization as a contributor, rather than attributing the failure solely to world-depth error.

Do not claim that the wrist locked onto the guarding hand: the orange guarding wrist and cyan moving-wrist estimates remain distinct. Do not assert precise physical wrist error, elbow extension, anatomical identity from transcoded orientation alone, or calibrated 3D truth from these frames. Approximate alignment and partly obscured geometry remain limitations.

## Gate and next action

**PASS:** Recording-to-pose association and deterministic diagnostic replay. **NOT VERIFIED:** Exact sensor/video synchronization, precise physical elbow geometry, generalized punch recognition or form accuracy, and Fire TV deployment.

The recording strengthens evidence that high visibility and `tracked` do not guarantee geometrically correct landmarks. Preserve raw points and evidence, expose uncertainty, and validate alternative completion signals and independently reportable guard/return evidence against more labeled positive and negative clips. Do not simply lower the reach threshold to make this case pass.

Verification: `npm test -- tests/video-practice-sync.test.ts` — **3/3 tests PASS**, one file. Full regression/build evidence is maintained by the lead integrator. Tests validate saved model outputs and associations, not physical correctness.
