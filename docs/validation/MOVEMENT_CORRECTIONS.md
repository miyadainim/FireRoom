# Stable guard and hand-lowering corrections — October 19

Implemented only src/vision/movement-cycle.ts and focused tests; independent V&V adds separate regressions. Legacy recognizer, guard estimator, MediaPipe/Full, calibration, extension assessment and gameplay routing unchanged.

- Before candidate departure, refresh origin only after a guard-confirmed compact history: up to400ms, at least300ms and3samples, all-pairs spread≤.04shoulderspans. Use mean held position; no continuously following EMA. Freeze on candidate evidence. This addresses staleguard without intentionally following departinghands.
- Departure needs consecutive eligible observations on same half-plane relativeorigin (positivevector dotproduct), ratherthansinglethresholdcrossing. Original.22departure/.35meaningfulpeakhysteresis retained; noelbowstraightness/fullreachgate.
- Sustained wristbelowownshoulder-supportedregion(y>.35spans)≥150ms interrupts candidate asuncertain, with explicit hand-lowering/notverifiedpunchreason. DoesnotclaimMediaPipeobservedocclusion. Missingwrist/gaps/camerachangesretainuncertainhandling.

Finalsource333/333testsPASS36files, productionbuildPASS90modules; independent21checksPASS. Tests include sustainedguarddrift, isolateddeparture, lowerhand, slowshortmovements80/120/125/160mscadences, existingocclusion/gaps/stance andevaluation. Existingmainbundleadvisoryremains.

Raw5Full12Hzuser-confirmedclip:8completed(4left4right)retained. Previousfalseleftpartial43.08–44.92disappears. Rightloweringcandidate51.333–51.833nowuncertain ratherthanpartialtimeout53.167. Rawunchanged. Correctedreplays.jsonl coversotherexistingexports fortransparency; thoseunreviewedcountsnotphysicalrecall/precision. Someoutcomesdifferwithoriginrefreshandwindow/geometryabstention; do notclaimallcasesimprove. Detectiontimestampscanchangeoneormoresamples; boundaryaccuracyNV.

Gate automatedcorrectionPASS; developmentclipregressionPASS. HeldoutphysicalgeneralizationNOTVERIFIED. Needfreshnegative/slowshort/feint/occlusion/camerachangeclipsbeforeclaimingprecision,recall orzeroFP. Veryslowmotioncanremainindistinguishablefromguarddrift; positivevectoralignmentnotintentclassifier. Actualelbow/wristlandmarkaccuracycannotbeinferredfromvisibility.

Use TrackingLabImportpreviousrawJSON→Compareold/newdetectors again; noMediaPipererun/newrecordingneededtoreviewcorrectedexistingclip. Exportcomparisoncontainsupdatedoutcomes; previouslydownloadedJSONhistorical.
