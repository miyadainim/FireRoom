# V4 left-offset trial comparison — 2026-10-15

User reports camera slightly to the left, trial1leftjab, trial2rightcross. Original JSON unchanged; both exported labels arejab/orthodox, so evaluate trial2 against user-confirmedcross intent rather than silently editing the source. Both recorded scoring modesworld-3d.49+50frames; durations3.93/4.26sec. All99frames tracked with world arrays present; no confidence/gap/face resets during replay.

Unchanged production replay: imageXY detects1leftjab in trial1 (extension onset1.58sec; recovery emission1.83sec), no eventtrial2. HistoricalimageXYZ andworldXYZ both0/2. These are cases, not estimated population accuracy or a form-quality grade.

Central attempted-movement evidence (roughly1.4–2.7sec; startup/ending lowered poses excluded):

| Intended action | V3 head-on maxworldextension | V4leftoffset peakworldextension | V4worldelbow | Gate failuresatpeak |
|---|---:|---:|---:|---|
|trial1leftjab|0.839|0.912 at1.58sec|130.7deg|extension only (must>0.92)|
|trial2rightcross|0.846|0.871 at1.91sec|121.1deg|extension and travel (0.39 vs>0.45)|

At trial1peak, arming/departure/height/travel pass; worldtravel0.50shoulderspans and wristheight−0.24 passes. ImageXY sees extension0.9366 and later a recovery-confirmed leftjab. This demonstrates a stronger projected detection signal in this case, not that actual elbowform was correct. Different projected segment lengths mean extensionratio is not a fixed equivalent elbowangle acrossrepresentations.

Trial2right imageXY remains strongly foreshortened through attemptedmovement: atworldpeak121.1deg, imageXY elbow61.7deg andextension0.605. Depth-inferredworldgeometry sees more opening thanprojection but stillbelowfixedrequirements. This is consistentwith a view favoringonearm overtheother, not proof of occlusion without video. Repeatedguard-originrefresh may absorb early outwardtravel; peakworldtravel duringcentralwindow reachesabout0.39forright, butnoallgatespass.

Whole-trial maxima0.989left/0.991right are misleading for attemptedpunch analysis because straightened startup/finishing poses failheight or occur beforearming. Trial1late samplesleft3.49–3.93sec failheight+extension; trial2right3.88–4.26sec passesstraightness butfailsheight. Do not countendinghandlowering as intendedpunch.

Interpretation: leftoffset improves trackingcontinuity in these two cases (all99tracked vs8lowconfidence inv3) andleftprojectedpunchrecognition; doesnotestablishcorrectformorareliablebothhandsetup. Worldextensionmovesclosertothresholdbutremainsbelow; imageXYsuccessdoesnotvalidate3Delbowangle or calibrated extension. Realformaccuracy and generalplacementrecommendation remainNOT VERIFIED.

Next useful placement comparison: similar offsettotheright with both elbows visibly exposed, same lighting/stance/framing, andonecontrolledjab/cross/nonpunch pertrial. To judgeactualform ratherthanmodelagreement, retain independent visual confirmation or consented synchronizedvideo showing elbow during intendedextension. Never relaxthresholds solelytomake these positivecases pass. No productioncode/threshold changes duringthisanalysis.

Reproduction uses scripts/analyze-poses.ts with mode world-3d and image-2d. Original exported three-way results agree with replay. Detailed analysis timelines were generated in /tmp/fireroom-v4-world.json and /tmp/fireroom-v4-xy.json.
