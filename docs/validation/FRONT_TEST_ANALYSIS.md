# Front, knee-height, tilted-up test — 2026-10-18

Inputs: user-supplied tracking-lab (2).json (two runs, one 56s evaluation clip), tracking-lab (1).json (matching front baselines), fireroom_test_punch_front.mp4. User supplied camera height/tilt clarification; exported notes remain blank. MP4 duration 55.98s, decoded480x640. No manual joint annotations. Export validates through validateLabReport. Both model analyses accept the distinct matching baseline. Derived metrics use current analyzeTrackingRun with EMA80ms; no code/threshold changes. Files under front-test-20261018 retain derived metrics and sampled image evidence. Video may be transcoded: exact clip hash/temporal synchronization with original pose source not independently established.

| Model | Median inference ms | p95 ms | World usable left/right | Image2D usable left/right |
|---|---:|---:|---|---|
| Full |54.4|59.7|93.1% /88.6%|69.9% /84.6%|
| Heavy |206.7|211.6|86.8% /88.4%|80.4% /80.6%|

Usable means provisional algorithm quality filters pass; it does not prove joint accuracy. Processing timings come from phone-recorded CPU run metadata; offline sample schedule is8Hz, not60Hz inference despite camera request60fps. Heavy median is3.8x Full.

Median of two supported attempt peaks per intended class:
- Full world left full41.4cm versus short45.4cm (inverted); right40.6cm versus39.3cm (weak separation).
- Heavy world left29.9cm versus34.0cm (inverted); right36.4cm versus35.6cm (weak separation).
- Full image2D right full129.3px versus short84.2px; Heavy130.3px versus82.7px. Right attempts have clear descriptive separation in this projection.
- Full image2D left full74.1px versus short60.3px, but individual full peaks42.9/105.3 overlap short46.1/74.4; Heavy full59.3px versus short62.2px. Left discrimination is not established. Units are projected pixels or inferred meters; not physical reach ground truth.

Sampled decoded frames show the low viewpoint keeping both arms in frame, and later full/short cross samples showing visibly different arm configuration. This is qualitative evidence, not framewise landmark accuracy or elbow-angle ground truth. Early samples show hands down at5/6s, guard7s, outward left movement7.5s, extended left8s and guard8.5s. First full-jab prompt interval is5–8s; extension/recovery reaches/breaches that boundary. Algorithm firstjab lacks return in both world runs; this is not proof the user failed to return. Timing offset to pose source remains approximate. Subsequent sequences broadly fit prompts. Fullworld segmentation marks firstjab incomplete/unobserved, next3jab and3cross movement cycles; firstcross unassessable; cycles are not verified punches or form.

Conclusion: retain front-low view and Full as practical candidates, but no final winning angle or validated3D extension scoring. This single clip contains only2 full+2 short attempts per hand. Need review/relabel actual boundaries before using firstjab for accuracy. More independent attempts and visible-joint annotations are required. No actual force, injury-risk, or precise metric reach claim.
