# Same-clip 8 vs 12 Hz analysis — October 19, 2026

Inputs: raw tracking-lab(5).json and heavy metric evidence run d948f334. Schema validation passes. Exact same clipId as export(4), 672 samples/model at83.333ms rather than448at125ms. New export intervals are empty; for descriptive comparison only, copied prior same-clip/model export(4) intervals into analysis copies. Original files unchanged. These are default protocol boundaries, not independently frame-reviewed exact boundaries. Both rates recomputed without external calibration, tau80ms, maintaining missing/visibility and implausible-jump checks. Camera metadata absent on imported12Hz run, so timing is replay-device timing and not proof of changed recording resolution. No video reupload required for label transfer.

| Full measurement | 8 Hz full/short |12 Hz full/short|
|---|---|---|
|Left image reach|122.9/68.7px|123.8/68.9px|
|Right image reach|102.3/74.6px|106.8/77.1px|
|Left inferred world reach|41.6/38.0cm|42.4/37.0cm|
|Right inferred world reach|36.4/33.6cm|36.4/33.3cm|

Both hands preserve intended full>short ordering at bothrates in this recording. Fullleftworld nearestendpoint gap improves from0.14estimatedcm to3.60estimatedcm (full41.71–43.02 vs short35.88–38.11). This is descriptive, twoexamples/class, not independentlymeasuredphysicalaccuracy. 2D changes modestly;12Hz does not fundamentallyreverse the no-old-reference conclusion. It does not test whether oldbone-length rejection iscorrect; earlierconfound stillopen.

Full usable observations without oldreference:96.4%→96.6%bothhands. Heavy: left95.1→96.6%;right82.1→84.4%. Heavymetricexport reports missing/lowvisibility23left/105right samples; no bone-length rejection because no accepted baseline. LegacyimageXYZ also shows4left/6right jump rejections; image2D/world do not. No manually annotated accuracy groundtruth.

Medianinference8→12Hz: Full54.25→69.25ms, Heavy205.70→221.45ms. Differentreplayload/thermal/cache/deviceconditions notcontrolled, so do notattribute per-frame latencychange solely tosample setting. 12Hz is offline sample schedule, not proven live inferenceFPS.

Export feature: suppliedmetricfile has correctkind/schema,runIDmatchesHeavyrawexport, tau80ms and calculatedevidence. Userdeliverydemonstrates JSONdownload/sharing inthissession. This file isHeavy, notFull. Rawexport permits computingFull evidence independently.

Gate: descriptiveanalysisPASS; realcamera12Hzcapture/liveperformance, physicalformaccuracy andgeneralizedthresholds NOTVERIFIED. Next softwaremilestone remains projectedbonefilter/baselineaudit, using existingrecordings ratherthanrequestingfurtherrepetition.

Independent V&V confirms Heavy evidence exactly equals recomputation with saved settings. Sampling changes both temporal inference history and the top-three accepted-value peak statistic, so increased separation is not independent accuracy evidence.
