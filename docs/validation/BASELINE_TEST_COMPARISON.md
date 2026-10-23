# Trimmed baseline (8) versus earlier test (4)

October19,2026. Current analyzeTrackingRun pairs matchingFull/Heavy, distinctclip, samecondition/delegate metadata; externalbaselineaccepted. Baseline12Hzheldposes and test8Hzdynamicattempts, twoexamples/intendedclass. Test4is fireroom_18_0ct_video recording, also replayedat12Hzinexport5. Uses currentdiagnostic-only2Dsegmentpolicy. No originalsourcechanged. Export5 lacks camera metadata/labels; primary directbaselinepairing uses4, notsilentlyrewritten5.

Full2Dpx referenceextended/short:left75.50/67.34,right107.20/82.75. Testsupportedpeaks:
- leftfull161.00,84.86;short70.30,67.12.
- rightfull103.24,101.32;short66.78,82.39.

Numericalrangesnonoverlapbut firstleftpeak is contaminated: independentchecktopvaluesat5.0/5.5/5.625s havewristbelowshoulder (e.g.y.633vs.387); likelyhands-downpreparation, notpunchpeak. Excludefirstleftwindowfromformconclusionuntilrelabel. Shoulder-wristdistancealoneisnotpunchdirection. Overallshoulderspanmedianbaseline96.69pxtest92.90px doesnotproveper-framecompatibility. No directpixelthresholdgeneralization.

Fullworldestimatedcm referencesextended/short:left43.69/33.01,right35.27/26.10. Testfullleft43.06,40.07;short39.93,35.97. Leftnearestclassendpointgap.14estimatedcm (nearoverlap). Rightfull36.36,36.46;short33.27,33.98: intendedordercorrectbutshortvaluesmuchclosertoextendedreference thanheldshortreference. Notinjury/force/formclaims. Shortworldbelowguardbaselineref isnotnecessarilyinvalid: elboworientationcanchangegeometry.

Fulltest2Dquality432/448perarm, all25samplesin8promptedpunchwindowsaccepted. Worldleft432/448,right415/448 with17bone-lengthrejects; rightpunchwindowsallaccepted. HeavyXYfullleft166.66/86.47 vs short74.60/70.18,right105.43/104.19vs63.95/78.21 confirmsdescriptiveordering;worldabsolutevaluesdisagreewithFull.

Baselineusesmedianheldreach; testusesmedian3largestacceptedreachvalues/attempt. Differentstatistics, per-clipnormalization/viewpointnotvalidated, sameconditionlabelnotphysicalproof. Missinglabels/incorrectboundariesandworldfiltereffectsremainpotentialconfounds. This isheldoutcomparisonbutnotaccuracyrate orvalidatedthresholdfit.

Conclusion: usefulcandidatepersonalreferences anddescriptive2Dseparation, insufficientabsoluteextensiongrading. RetainFull, do notsetpassfailfrom75.5/107.2px orassignallflickertomodel. Next implementation usesbody-normalizedview-compatiblefeaturesandexplicituncertainty; independentfurtherrecordingsneededforgeneralization. No newproductionchanges orphysicaltestPASSclaim.

Independent V&V confirmedstatistics and flaggedfirstleftwindowpreparationcontamination. DescriptiveanalysisPASS; punch-specificgradeNOTVERIFIED.
