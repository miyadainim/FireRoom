# FireRoom Tracking Lab

Open `/tracking-lab.html` from the FireRoom header. For phone measurements, open the lab directly in Chrome on the phone using the computer's trusted HTTPS LAN address, for example `https://192.168.1.28:5175/tracking-lab.html`. Both devices must reach the same computer. The page offers discovered phone links when available. `localhost` on a phone means the phone itself.

This is a separate experiment workspace. It does not change Coach Mode thresholds or select a winning configuration automatically. Videos and measurements remain in browser memory until you download them. Model/WASM assets require network access on first load. Download both clip and measurements before closing or reloading.

## First experiment

1. Give the condition a unique ID. Select angle, lighting, framing, stance, requested resolution and camera. Keep your feet, phone and punching direction fixed. Record the actual placement in notes. For imports, enter these settings before choosing the clip.
2. Open the camera and choose **Calibration**. Start once, move into position during preparation, and follow spoken/on-screen prompts. The 40-second capture collects guard, lead/rear extended holds and deliberately shortened holds independently. Do not forcefully lock the elbows.
3. Run **Full + Heavy** on the calibration clip. Download the clip. Results remain in the evidence library.
4. Choose **Evaluation**, reopen the camera if needed, and record the separate 56-second protocol in the same position. It asks for two full and two shortened attempts for each hand, then idle and brief deliberate occlusion. Return to guard after each attempt. Instructions label intended movements, not verified good form.
5. Run Full + Heavy on this second clip using the same delegate and sample rate. Matching earlier calibration is selected by model, delegate and condition. Check the external calibration notice. Never use the evaluation clip to calibrate itself.
6. Inspect coverage/rejection reasons, reach separation, guard jitter, peak attenuation/lag and inference latency. Repeat in reverse model order to expose loading/thermal/order effects. Download measurements and the evaluation clip.
7. Pause representative frames and mark visible wrists/elbows without the skeleton overlay. Enter a reviewer name. Mark hidden joints as occluded or uncertain rather than guessing. Compare normalized 2D landmark error as well as stability.

Importing an older local video is supported. Imported clips have no automatic action labels: add intervals for steady calibration holds or held-out attempts, excluding transitions. Video duration is limited to 60 seconds and 150 MB. Imported measurement JSON is validated and bounded; duplicate run IDs are rejected. It does not include the video, which must be retained separately.

## Controlled comparisons

Change one factor at a time, then repeat the promising combinations. Use at least three independent calibration/evaluation pairs per condition before drawing a preliminary conclusion. Start with front, right 30°, left 30° and optionally 45°; compare diffuse front lighting against your usual room; compare full-body against larger upper-body framing while keeping all required joints in view. Record actual camera resolution and shoulder image size. Do not silently pool left/right or stance changes.

| Question | Evidence to inspect | Caution |
| --- | --- | --- |
| Camera placement | Visible-joint annotation error, accepted coverage, shoulder pixels, per-hand results | Visibility scores and smoothness alone do not establish correct joint placement. |
| Calibration | Separate lead/rear guard, full and short references; distinct evaluation clip | Weak reference separation means reach cannot be assessed reliably. |
| Quality gating | Missing/low-confidence observations, implausible segment lengths and jumps, accepted/rejected counts | Provisional plausibility thresholds can reject genuine motion; inspect rejected frames. |
| Filtering/segmentation | Raw vs filtered peak, attenuation and lag; contiguous departure/return | A detected movement segment is not proof of a correct punch. Filtering cannot repair wrong landmarks. |
| Full vs Heavy | Same clip hash/timestamps/condition/delegate/device; inference p95 plus load, warmup and decode times | Sample rate is the offline sampling schedule, not live inference throughput. Desktop timings do not describe the phone. |
| 2D vs inferred 3D | Aspect-correct image reach versus world reach, separate calibration and discrimination per mode | Units differ. World meters are inferred, not measured physical reach. No 3D ground truth is supplied. |

The legacy mixed image-XYZ mode is exposed for diagnosis and labeled accordingly; do not interpret it as calibrated metric distance. Anatomical left/right is preserved regardless of display mirroring. Missing world landmarks never fall back silently to 2D.

## Interpretation and next gate

Held-out separation is descriptive only and needs at least two full and two short windows per hand. Dynamic windows use a supported reach peak so return-to-guard frames do not dominate their statistic. Intended labels need video review. Manual labels also have uncertainty, and the supplied annotation tool measures 2D error only.

Choose a candidate using a combination of lower reviewed error, acceptable observation coverage, reliable full/short separation, low filter distortion and acceptable latency. Confirm it on fresh recordings; retain failures and negative actions. The existing punch recognition targets remain 18/20 controlled jabs, 18/20 controlled crosses, at most one false punch over 20 non-punch actions, correct sequence order and tracking-loss recovery.

Software tests are not physical validation. Full/Heavy accuracy, actual OnePlus latency, optimal placement, camera permissions/recording on the phone and Fire TV execution remain **NOT VERIFIED** until directly tested. No credentials are required for this local lab. Human camera testing and Fire TV device/simulator access are required for those gates.

## Guided interface

The page now has four steps: **Set up**, **Record**, **Compare**, **Save**. You can revisit any step without clearing results. Opening the camera advances to Record; finishing a capture advances to Compare. Use **Open / reopen camera** in Record for the next clip. Download the current video before recording another. Advanced controls, imported-clip labeling, detailed metrics and manual joint review are optional expandable sections. Navigation is locked while recording or processing; Stop / cancel remains available in Record. Measurement behavior and validation requirements are unchanged.

## Send calculated evidence

In Compare, choose the desired result, expand Full metric evidence and press Download full metric evidence JSON. Repeat for Full/Heavy if needed. This exports the selected analysis with rejection summaries and current settings; raw experiment results remain a separate download in Save. Derived evidence files are for inspection/sharing, not for the raw-report import control. To analyze an earlier export, first import its experiment measurements through Save. No new recording is required.

## 2D segment-length policy update — October 19

Image-2D no longer rejects observations because shoulder–elbow or elbow–wrist projected lengths differ from guard. The exported series retains `diagnosticFlags: ["projected-segment-length-change"]` for inspection. This flag does not exclude a measurement; missing/low visibility or implausible jumps still can. `quality.segmentLengthPolicy` records the policy. World and legacy imageXYZ keep their provisional guard-length rule. Previous downloaded metric files are historical snapshots: import the original raw experiment and recalculate to get updated evidence. This does not establish physical tracking accuracy.

## Compare movement-cycle recognition

In **Compare**, choose a pose result and expand **Compare old and new movement-cycle detectors**. Press **Compare detectors on selected result**; this replays saved pose frames and does not rerun MediaPipe. Download detector comparison JSON for events, candidate outcomes and supporting evidence. The old detector remains available and Coach/Arcade behavior is unchanged.

Movement-cycle completion means supported wrist departure and return after guard. It does not establish intent, full extension or correct form; a feint can resemble a short punch. Noncompleted outcomes distinguish partial cycles, small guard adjustments and uncertain observations. Automatic prompt intervals are not scored as ground truth. Optional reviewed-label JSON must match the clip ID; its format and real-camera test protocol are documented in docs/validation/MOVEMENT_CYCLE_VALIDATION.md. Without independently reviewed labels, precision/recall and timing remain NOT VERIFIED, even when event counts are shown.
