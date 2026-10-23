# Guard → departure → recovery comparison

## Scope and current gate

The new recognizer is an opt-in Tracking Lab experiment. Existing PunchRecognizer and Coach Mode behavior are preserved. Completed means a supported wrist-motion cycle returned toward its original guard, not validated boxing technique or intent. No full-extension threshold or straight-elbow gate is required.

**Physical validation: NOT VERIFIED.** The available recordings have intended/prompted or user-trimmed intervals, not independently reviewed event-level ground truth. Therefore punch precision, recall, false positives and segmentation timing error are **NOT VERIFIED** on these recordings. Counts below are descriptive detector outputs, not accuracy rates. Do not infer 8/8 success from eight emitted events and eight prompts: wrong-hand or negative-window events and duplicate events require one-to-one reviewed matching.

## Existing detector audit

`src/vision/recognizer.ts` currently requires both elbows, wrists and shoulders at visibility ≥0.65; an obscured non-punching elbow resets both hands. Guard observation must be known on both arms. Extension requires all of these simultaneously: armed guard, not guard, wrist at shoulder-relative height ≤0.25, shoulder–wrist / combined arm length >0.92, and departure >0.45 shoulder spans. Recovery additionally requires guard, extension <0.88, and at least60ms. Unresolved sequences time out1800ms; frame gaps >350ms reset. Straightness and shared elbow visibility are particularly restrictive for short punches and foreshortened or occluded arms. Their actual contribution to a miss must be checked against diagnostics rather than assumed from event counts.

## Identical-frame replay

Input files: user exports(3), (4), (5). Full and Heavy processed separately. Exports(4) and(5) share clipId and are the same video sampled at8Hz and12Hz, **not independent trials**. Both algorithms receive exactly the same PoseFrame observations for each run. Frame timestamps are mapped onto saved videoTimeMs in cloned frame objects; original samples are unchanged. Old guard geometry remains legacy image-3d; new uses its fixed image-2d guard default. Thus this compares the complete pipelines, not state-machine changes in isolation. No per-clip configuration tuning.

| Export | Model | Samples | Old recovered events | New completed cycles |
|---|---|---:|---:|---:|
| (3), earlier video | Full |448|0|4|
| (3), earlier video | Heavy |448|0|6|
| (4), repeat video | Full |448|0|8|
| (4), repeat video | Heavy |448|0|8|
| (5), same repeat video | Full |672|0|8|
| (5), same repeat video | Heavy |672|0|7|

Provisional snapshot; [replay evidence](movement-cycle/replay-results.jsonl) includes boundaries and partial/uncertain/adjustment outcomes. Export(3) has repeated camera/body-geometry resets, which could be conservative abstentions or false rejections; camera motion cannot be distinguished reliably from torso motion using these landmarks alone. Report no improvement percentage. Fewer emitted events may be misses or correct abstentions; additional events may be correct short punches or false positives.

## Reviewed evaluation format and matching

Import a separate JSON, never silently promote prompt labels:

```json
{
 "schemaVersion":1,
 "kind":"fireroom-reviewed-movements",
 "clipId":"COPY EXACT CLIP HASH FROM EXPERIMENT",
 "labels":[
  {"id":"left-1","startMs":6000,"endMs":9000,
   "kind":"jab","hand":"left","category":"correct-punch",
   "reviewer":"reviewer name","reviewed":true,"split":"evaluation",
   "onsetMs":6500,"peakMs":7500,"recoveryMs":8500},
  {"id":"adjustment-1","startMs":10000,"endMs":12000,
   "kind":"negative","category":"guard-adjustment",
   "reviewer":"reviewer name","reviewed":true,"split":"evaluation"}
 ]
}
```

Example timestamps are illustrative, **not annotations of the supplied videos**. Review the actual clip independently. Positive categories: correct-punch or short-punch; negative categories should cover feint, guard-adjustment, elbow-occlusion, camera-change and idle. An occluded real punch can be a positive with elbow-occlusion category; do not label every occluded interval negative. Record intent only from known protocol plus video review, and mark ambiguous attempts unreviewed. Use anatomical hand, not mirrored screen side.

Evaluation matches events to reviewed positives one-to-one by type, hand and recovery within the reviewed window with default250ms end tolerance. A positive may not consume an event inside a different reviewed window. Unmatched detections inside reviewed exposure (including positive tolerance) are false positives. Outside events are explicitly unscored. Matches are maximum-cardinality and deterministic, not minimum-total-timing-error matching. Optional onset/peak/recovery boundary errors use explicitly annotated timestamps only; prompt edges never substitute for ground truth. Old recognizer lacks onset/peak boundaries, so those errors remain unavailable.

Review complete contiguous exposure when claiming clip-level FP counts. Review all expected positives when claiming clip-level recall. Precision=TP/(TP+FP), recall=TP/(TP+FN); zero denominators yield null. Missing negative categories and tiny sample sizes remain explicit limitations even with descriptive numbers.

## Human-camera validation required

Use a fixed phone setup, Full, and fresh trials held out from threshold development. Independently annotate at least20 jabs,20 crosses,20 deliberate non-punch actions; include short punches, feints, guard adjustments, elbow occlusion and camera/body-position changes. State whether a deliberately short punch counts as recognition-positive irrespective of form. Preserve raw video and poses. Measure onset/peak/recovery boundaries on video and compare errors at sampled-frame resolution; do not imply sub-frame accuracy. Test jab-cross versus cross-jab and tracking-loss recovery separately. Recognition targets:18/20 per punch and at most1/20 false positives; extension grading has a separate gate. Real phone, synchronization and Fire TV remain NOT VERIFIED.
