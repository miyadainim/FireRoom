# BoxingVI supplementary evaluation review

Reviewed 2026-10-15 from the upstream [repository README](https://github.com/Bikudebug/BoxingVI) and file listing. No dataset media was downloaded, upstream code executed, or dataset integrated.

## Evidence and suitability

The README describes 6,915 temporally segmented punch clips from 20 YouTube videos, 18 athletes, and six punch classes (jab, cross, lead/rear hooks and uppercuts). It specifies AlphaPose 2D COCO keypoints, temporal `(start_frame, end_frame, punch_class)` annotations, video-dimension normalization, and padding to 25 frames at 30 fps. It lists subject-grouped train/validation partitions. These claims describe the upstream benchmark, not independently verified dataset contents.

Punch class and temporal boundaries could support supplementary action/segmentation evaluation. They do not establish correct technique, full guard-to-recovery coverage, camera-placement compatibility, non-punch rejection, or elbow observability. A jab label is not reviewed ideal-form ground truth. Padded samples must not be interpreted as genuine stationary observations or valid coverage.

## Rights gate

The reviewed root file listing contains Figure and README.md; no LICENSE file or explicit dataset-use grant was visible. The README links external dataset storage and asks for citation, but citation instructions are not a substitute for permission. Dataset-use and redistribution terms, underlying video rights, and any consent/privacy requirements remain NOT VERIFIED. Do not download or redistribute the dataset as part of FireRoom without resolving applicable terms.

## Proposed adapter, not implemented

Verify the actual skeleton schema before assuming standard COCO-17 order. If confirmed, common anatomical indices map as follows:

| Joint | COCO-17 | MediaPipe |
|---|---:|---:|
| Nose | 0 | 0 |
| Left shoulder / elbow / wrist | 5 / 7 / 9 | 11 / 13 / 15 |
| Right shoulder / elbow / wrist | 6 / 8 / 10 | 12 / 14 / 16 |
| Left / right hip | 11 / 12 | 23 / 24 |

COCO offers no equivalent MediaPipe world-coordinate evidence. Never fabricate world z values, map left/right by screen side, infer visibility from absent confidence fields, or present 2D adapted samples as world-mode evaluation. Convert pixels using original image dimensions/aspect ratio, preserve timestamps and missing-point masks, and then normalize body position and scale consistently with FireRoom. Establish the viewpoint and mirror convention using inspected examples. Keep source-video/athlete groups separate before any windowing to avoid leakage.

Gate: supplementary dataset integration NOT VERIFIED. Main DTW acceptance must use reviewed FireRoom MediaPipe references and separate positive/negative physical recordings at the supported placement.
