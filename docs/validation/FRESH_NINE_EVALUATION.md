# Fresh held-out video (9), fixed v2 — October 19

Inputs userraw9Full/Heavy, Fullcomparison193f5bf5, videoFireroom_test_2026-10-19_16-08-23.mp4 (55.99s480x640decoded). Versionguard-refresh-lowering-v2, Full448samples125ms=8Hz, notrequested12Hz. ExactnewclipIDdifferentdevelopmentclip. validateLabReport passes, independentsource replay reproduces savedevents/outcomesexactly. No settings/thresholdchangesduringevaluation. Rawunchanged. Reviewusesframecontactsheet, notmanuallypreciseGT; suppliedcomparisonlabels[].

Oldstrictdetector0events; v2Full6completed3left3right. Video samples showfirstleftattempt6.25s, second11.75,leftshort17.75/22.125,rightfull26.75/32.125,rightshort37/41.875. Completedcyclesmatchlatter3leftandlatter3rightprovisionally. 6/8 apparentattempts isdescriptiveclipcount, notvalidatedgeneralrecall; nofullreviewednegativeexposureforprecision/FP. Falsepositive/timingmetricsremainnullinexport. No completedcycles after42.875s; additionalpartial/guardadjustment/uncertainoutcomesarenotcompletedpunches.

Fulloutcome totals6completed,2partial,3guard-adjustment,3uncertain. Geometryinterrupt6.25s: shoulderwidthratio.7377536 (26.22%drop)>25%limit;angle2.16degnotcause. Cameraanchorisfromearlierobservation, notnecessarilyfreshguard. Firstjabinterrupted, thenleft/rightpartialcandidates7–9.625s. Firstcrossinterrupt27.0s:shoulderanglechange20.44deg>.3rad17.19limit, widthonly2.17%;leftcandidateinterrupt28.375angle17.55deg. Images do notestablishphysicalcameramovement; ordinarytorso/posture orlandmarkestimationchanges cantripgate. Do notblameuserform or8Hzwithoutisolatingcause.

Heavyreplayalso6completed withmorepartialcandidates; notcureforgeometrygate. Sparsevideo51.5sdoesnotproveextentocclusion; noreviewednegativecasecategorypassclaimed.

Gate: softwareexport/replayconsistencyPASS; intendedphysicalreliabilitygateNOTVERIFIED/targetnotmetbyprovisionalcount. Newfootageexposesgeneralizationissuepreviouslydocumented conservativegeometrygate. Nextaudit shoulderseparationsource/timing anddistinguishcamera/bodychanges with independentfeatures insteadofsimplyraisinglimits. Preservemissing/gapchecks, frozenv2results anddevelopment8cycles. No implementationchangesinthisturn. More recordingnotrequiredtoinvestigatethesetworesets; matched12Hzreplayoptionalcontrolbutnotestablishedsolution.

## Same-video 12 Hz control, export (10)

User supplied raw(10) and Fullcomparison903b0e30. Bothmodel672samples83.333ms, exactsameclipId as(9); fixedguard-refresh-lowering-v2. Rootreplayreproduces allsavedoutcomesexactly. Fullstill6completed3left3right; firstjabreset6.5s andfirstcrossreset26.917s camera/bodygeometry. Additionaloutcomes3partial2guard-adjustment4uncertain. 12Hzdidnotrecoverthesecompletedcycles. This narrowsdiagnosisawayfromsamplingschedulealone; doesnotproveall8Hzlimitationsabsent. Samephysicalattempts, notrepeatedphysicaltrial. No reviewedGTlabels=>precision/recall/FP/timingNV. No code/thresholdchanges.
