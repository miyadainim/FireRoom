# Independent V&V test matrix

Run: 2026-10-15 (Singapore). Independent reviewer owns contract/integration suites and validation reports; specialist vision/graphics suites reviewed and executed together. Synthetic fixtures establish software behavior only.

| Area / gate | Evidence | Result |
|---|---|---|
| Build and TypeScript | `npm run build`: TypeScript clean; Vite production build, 15 modules | PASS |
| Contract validation | 5 tests: malformed/versioned envelopes, visibility, anatomical/mirrored semantics, loss frame, allowed actions | PASS |
| Vision deterministic unit behavior | 9 synthetic cases: orthodox/southpaw mapping, recovery requirement, tracking loss, low confidence, gaps, reorder, guard observation, stationary inputs | PASS (synthetic only) |
| Graphics sampling | 4 cases: jab/cross timing, jab-only, opposite guard, bounded/decaying bag motion | PASS (mathematical samples only) |
| Transport and lesson integration | 14 cases: session/invalid/order/stale rejection, recovery freshness, order-sensitive completion, jab drill, offline coach and action filtering | PASS |
| Complete suite | `npm test`: 4 files / 32 tests passed | PASS |
| Phase 0 software architecture subgate | Versioned shared contracts, runtime pose/action validation, build and synthetic integration tests | PASS |
| Phase 0 full architecture gate | Shared contracts and build exist. Official announcement allows Fire OS/Vega and web technology; actual target runtime integration requires verification | NOT VERIFIED |
| Phase 1 full foundations gate | Independent synthetic component tests pass; Fire TV rendering and phone camera have no direct execution evidence | NOT VERIFIED |
| Phase 2 full Coach Mode gate | Synthetic event-to-lesson pipeline passes. Live camera → phone transport → TV lesson/bag walkthrough not executed | NOT VERIFIED |
| Phase 3 full Coach Atlas gate | Deterministic offline fallback and action whitelist tested. No provider configured or live grounded LLM test | NOT VERIFIED |
| Physical recognition target | 18/20 jab, 18/20 cross, ≤1/20 non-punch false event, reversed sequence, loss/recovery | NOT VERIFIED |
| Fire TV install/render/input/performance | No Fire TV hardware or simulator evidence supplied | NOT VERIFIED |
| Phone capture, permissions, MediaPipe asset downloads | No real phone test supplied | NOT VERIFIED |
| Producer restart/reload sequencing | Four regression tests cover persisted envelopes across reload, same-clock samples, session isolation and surfaced write failure; receiver accepts continuing envelopes | PASS (synthetic storage) |
| Live camera restart/reload | Corrected producer clock is integrated in phone callback; actual browser/camera reconnect not exercised | NOT VERIFIED |
| Hackathon architecture eligibility | Official Amazon announcement explicitly allows Fire OS or Vega with web technology | PASS (documented architecture eligibility) |

Latest lead build split: main 489.87 kB, lazy camera 126.98 kB; no >500 kB warning. Target-device rendering/performance must be measured. No hardware pass inferred from desktop build.

See [physical procedure](PHYSICAL_PROTOCOL.md) and [known issues](KNOWN_ISSUES.md). Milestone gates remain NOT VERIFIED until their complete acceptance requirements have evidence; local software test PASS is not a hardware gate PASS.

Architecture source: [Amazon Developer hackathon announcement](https://community.amazondeveloper.com/t/build-ship-shape-amazon-developer-hackathon/29097), independently read 2026-10-15. This supports choosing web technology; it does not prove this build runs on a Fire TV. Local dependencies are now a real directory and package-lock.json records resolved versions; clean-room installation has not been tested.

## Final integration evidence

- Independent reviewer ran `node scripts/verify-relay.mjs` against the live loopback relay with approved loopback access: **PASS, 8 HTTP assertions** covering session creation, empty frame, publish/read, duplicate, malformed JSON, wrong session and 750 ms expiry. Synthetic pose input only. Initial sandbox network EPERM was resolved by approved execution; no relay defect inferred from sandbox denial.
- Independent reviewer reran `npm test`: **32/32 PASS** across four files after shared relay-validator integration.
- Lead reports browser smoke PASS for simulated three jab-cross combinations (600 points), pairing-link creation and grounded offline Atlas summary. Independent reviewer inspected [browser screenshot](browser-coach.png): rendered bag and translucent arms, orthodox label, pairing link, and completed 3/3 lesson with score 600 are visible. This is desktop simulation evidence, not phone camera or TV evidence.
- Lead's latest web build PASS uses split loading: main 489.87 kB and lazy camera chunk 126.98 kB, with no >500 kB bundle warning. Target hardware performance remains NOT VERIFIED.
- Independent reviewer inspected native manifest/activity/build script and ran `bash scripts/build-android.sh 'https://fireroom.invalid/?display=tv'`: **PASS**, Java compilation, dex conversion, resource packaging, APK alignment, signing and signature verification completed. Only Java 8 obsolescence/deprecated-API warnings. Wrapper has no camera/microphone permission or native JavaScript bridge, requires HTTPS, and restricts top-level navigation to configured origin.
- Independent reviewer reran the updated script successfully with output `artifacts/android/fireroom-debug.apk`, separated so Vite cleaning `dist/` does not erase it. The tested URL `https://fireroom.invalid/?display=tv` is intentionally unusable. APK packaging PASS does not establish deployment: a reachable trusted HTTPS application plus relay URL and an authorized Fire TV/Fire OS target are required.
- Lead reports `adb devices` returned no attached devices. Actual installation, WebView/WebGL rendering, remote focus/select interactions, TLS trust and complete phone/TV session are **NOT VERIFIED**.

Final full milestone gate decisions remain: Phase 0 NOT VERIFIED (actual target integration), Phase 1 NOT VERIFIED (phone capture and TV rendering), Phase 2 NOT VERIFIED (live walkthrough), Phase 3 NOT VERIFIED (provider-backed coaching). Software architecture, deterministic components, desktop simulated lesson, live synthetic HTTP relay and native APK packaging each have PASS evidence at their stated scope.

## Live user report and diagnostic scope (2026-10-15)

User reports camera access now works in OnePlus 15 Chrome over HTTPS. User also reports repeated jab-cross actions fail to move 2/3 completion, including the suggested separated recovery attempt. This is direct evidence of an unresolved end-to-end problem; it does not identify the failing recognition stage. Previously reported absence of any camera evidence should now be read with this limited manual evidence. Recognition accuracy targets and target TV behavior remain NOT VERIFIED. Diagnostic unit tests use synthetic geometry only.

Independent V&V diagnostics run: `npm test` PASS **36/36 tests across five files**, including four new diagnostic tests covering guard/extension measurements and loss/low-confidence/visibility clearing. `npm run build` PASS, 17 modules; main 493.19 kB and camera 127.30 kB. Diagnostic API is read-only cloned state and exposes anatomical left/right phase, extension, travel, guard and confidence. These tests establish internal consistency only; no live OnePlus tracking trial or actual sequence-completion repair was verified. Gate: diagnostic software subgate PASS; real-camera recognition and complete Coach Mode gates NOT VERIFIED.

## QR pairing independent V&V (2026-10-15)

Inspected `src/platform/pairing.ts`, viewer pairing flow in `src/main.ts`, and Vite LAN-address discovery. The pairing URL requires HTTPS, rejects loopback and credentials, replaces viewer path/query/hash, and preserves the session token through URL encoding. The viewer generates a PNG locally with `qrcode`; no external QR-generation service receives the token. LAN discovery is development-server functionality; production hosting needs an accessible HTTPS origin or manual address entry.

- `tests/pairing.test.ts`: **5/5 PASS**, covering exact token round-trip with special characters, viewer-state removal, HTTP rejection, IPv4/IPv6/hostname loopback rejection, credential rejection and local PNG generation.
- `npm test`: **41/41 PASS across six files**.
- `npm run build`: **PASS**, TypeScript clean; 68 modules; lazy QR chunk 25.84 kB, camera 127.30 kB, main 494.82 kB.
- Actual QR scanning on OnePlus Chrome, phone certificate trust, automatically selected LAN-interface reachability and new session connection: **NOT VERIFIED**. User must scan the displayed code and start the camera to establish this evidence.

Gate: QR URL construction/encoding software subgate **PASS**. Physical QR scan and end-to-end Coach Mode remain **NOT VERIFIED**; this change does not resolve the reported jab-cross recognition failure.

## Reference-driven recognition revision — independent V&V (2026-10-15)

Independent reviewer inspected the revised recognizer, local pose recorder/evaluator, and UI wiring. This revision retains extension >0.92, relative wrist travel >0.45, and visibility ≥0.65. Guard now includes wrist height; recovery adds extension <0.88 hysteresis. Travel is relative to the corresponding shoulder and normalized by shoulder span. Pending recovered punches follow observed extension onset order; same-frame ambiguous extensions and tracking/gap/timeout resets discard unresolved sequences. These are provisional original rules, not validated biomechanical measurements.

- `npm test`: **PASS, 59/59 tests across eight files**, including nine independent regressions and nine specialist temporal cases.
- Independent adversarial cases: lowered near-shoulder hands do not arm; rigid whole-body translation does not create travel/punch; cross recovery before jab recovery preserves jab-cross order; low visibility flushes buffered events; timeout never fabricates earlier recovery.
- Recording cases: explicit opt-in, immutable landmark snapshots, pairing token replaced with local trial ID, active-trial exclusion, malformed-frame rejection, 600-frame cap, clear, order-sensitive exact match, extra/missed event accounting and independent trial reset all **PASS (synthetic only)**.
- `npm run build`: **PASS**, TypeScript clean; 69 modules; main 499.54 kB, camera 127.30 kB, QR chunk 25.84 kB. This is compilation evidence, not target-device performance.
- UI inspection confirms export reports exact-trial count first; per-class matched count does not imply correct ordering. Trial labels are human assertions and are not independently verified. Export contains pose landmarks and results, no video; it is downloaded locally and not automatically uploaded.

Gate: revised deterministic software and recording subgates **PASS** at synthetic-test scope. Real OnePlus recognition accuracy, the reported stuck 2/3 sequence failure, complete camera-to-lesson walkthrough, and Fire TV operation remain **NOT VERIFIED**. No physical pose recording was available for replay, no physical threshold tuning was performed, and no sequence model was trained or claimed operational. User must capture labeled trials using the revised build before the failure can be diagnosed or accuracy targets assessed.

### Face-relative temporal guard — independent V&V (2026-10-15)

- **PASS (software):** `npm test -- --run`: 80 tests across 10 files passed; `npm run build`: TypeScript and Vite succeeded. Vite retains a >500 kB chunk warning.
- `tests/guard-integration.test.ts` independently checks that a single frame near the face cannot arm recognition; recovery requires controlled, stable guard; an extended arm remains active during return; missing face observation never falls back to shoulder proximity; tracking loss erases guard history and pending punches; and an observed opposite-hand drop marks guard maintenance false.
- Existing geometric fixtures now specify a nose above the shoulders and hold each legacy observation at 100 ms intervals. Prior fixtures omitted a meaningful face and provided one-frame guard/recovery. New raw-frame integration checks preserve adversarial coverage of the newly required dwell. The elapsed-time speed check remains raw and asserts nonzero speed.
- **NOT VERIFIED (physical):** face-region thresholds, elbow threshold, camera depth tolerance, false guards during face touching, stance/yaw variation, occlusion, and latency on OnePlus Chrome / Fire TV. Passing synthetic fixtures establishes software behavior, not boxing validity.
- Gate: **PASS for deterministic software regression; NOT VERIFIED for physical guard accuracy and deployed Fire TV operation.**

## Calibrated form MVP — 2026-10-17 final independent run

| Area | Actual evidence | Decision |
|---|---|---|
| Complete regression | `npm test`: **187/187 PASS**, 19 files | PASS |
| Independent form engine / contracts / supplied recordings | 38 tests; includes 8 legacy trials without invented calibration | PASS (software, legacy outputs UNASSESSABLE) |
| Controller + real engine workflow | 5 tests with synthetic native-DOM adapter; calibration, criterion results, retry, cancellation, restart, tracking loss | PASS (software) |
| Prompted single-punch graphics | 6 new pure-sampling tests; jab/cross, both stances, bounded timestamps | PASS (software) |
| TypeScript and production | `npm run build`: PASS, 77 modules, main550.70kB | PASS; size advisory remains |
| Viewer browser smoke | Loopback HTTP panel renders, disconnected calibration refused, Cross selection shows orthodox cross guide label; form-coach-ui.png | PASS (viewer controls only) |
| Physical form scenarios | 12 scenarios specified in FORM_PRACTICAL_MATRIX.md; no calibrated video-grounded examples executed | NOT VERIFIED |
| HTTPS browser / phone session | HTTPS/relay running; IAB rejects untrusted development certificate; no bypass | NOT VERIFIED |
| Fire TV runtime and synchronization | No target execution evidence this milestone | NOT VERIFIED |

See FORM_INDEPENDENT_REVIEW.md for the independent gate evaluation. Missing measurements do not become technique failures; high visibility is not positional accuracy. No physical performance percentages are claimed.

## Guided usability update — October 17

Full regression193/193PASS across19files; buildPASS77modules/main554.10kB advisory.11controller tests now cover timed preparation before held calibration, cancellation/retry, camera loss during countdown, optional-skip gating, hidden practice, single active capture action, stance-specific instructions and the prior assessment flow. Independent gate: FORM_UX_REVIEW.md. Viewer browser verifies collapsed advanced panels and hidden practice; form-friendly-ui.png. No physical or human usability accuracy inferred.

## Saved-check retention correction — October17

Independent fullsuite **198/198 PASS** across19files; productionbuildPASS/main554.25kB advisory. Calibrationposechange resets removed; savedreferences retained through idle/countdown/capture and failedcurrentstepretry. Practiceperspectiveabstention no longer mutates sessioncalibration. Explicitconfigurationinvalidation retained. Evidence and gate: SAVED_CHECKS_REVIEW.md. Realphoneusability/physicalform/FireTV NOTVERIFIED.

## Actual form export diagnostic correction — October17

201/201 testsPASS20files; productionbuildPASSmain555.78kB advisory.3actualexport regressions reproduce unavailable reversed calibration, verify truthful observed-return/unsupportedreach evidence, and ensure forged separable calibration does not force acceptance. Existing negative controls remainPASS. Export completion remainsfalse and criteriaUNASSESSABLE. Diagnostic-fidelitygatePASS; physicalformaccuracy/pose-errorcause/FireTVNOTVERIFIED. See FORM_EXPORT_REVIEW.md and FORM_EXPORT_ANALYSIS.md.

Secondformexport:203/203testsPASS21files; buildPASSmain555.90kB.2newactualrecordingregressions replay6stages+attempt, verify insufficientpositivecalibrationgap (not overlap), rearthreshold and preservedUNASSESSABLEoutcomes. See FORM_SECOND_EXPORT_REVIEW.md. Physical cause/form/FireTV NOTVERIFIED.

Three-capture setup update: independent207/207testsPASS21files; buildPASS/main558.78kB advisory.19controllerchecks includecombinedsetupguard, guard-only retrypreservingframing, threecapturepracticeentry, optionalbendseparation, savedreferences and neutralmissingdata. EASY_SETUP_REVIEW.md records softwarePASS; phone/humanusability/physicalaccuracy/FireTVNOTVERIFIED.

Hands-freeupdate: independent209/209testsPASS21files; buildPASSmain560.14kB advisory.21controllerchecks includeone-clickthreecapturecompletion, outside-frame8secondwalkback, stalestreampause, boundedretryandcancellation. See HANDSFREE_SETUP_REVIEW.md. Physicalusability/audio/accuracy/FireTVNOTVERIFIED.

Thirdformexport: independent211/211testsPASS22files; buildPASSmain560.14kB advisory.2newactualrecordingchecks reproducecompletecalibrationandassessmentunchanged; unavailableoptionalreach and .022421m supportdelta yield UNASSESSABLE withobservedreturnretained. No sourcethresholdchanges. FORM_THIRD_EXPORT_REVIEW.md. PhysicalvalidationNOTVERIFIED.

Automaticvideo: independent238/238testsPASS26files; buildPASSmain568.45kB advisory.10controllerhookintegration,9mockphonecapture,3orderedpublisher,5metadatarelaytests;8leadactualHTTPassertionsPASSsyntheticmetadataonly. No camera/video accessedbyHTTPtest. VIDEO_RECORDING_REVIEW.md recordsautomatedPASS andrealphone/camera/codec/download/sync/FireTVNOTVERIFIED. Refreshbothclientsandre-pairafterrelayrestart.

Suppliedvideo+posecase:240/240testsPASS27files;2newactualexporttests reproduceassessment(3) andverifycalibrationmanifestassociation/practiceexclusion. Independentvisualreviewconfirmsoutward-and-returnactioninshortclip; fullformaccuracy/exactpracticealignmentNOTVERIFIED. No productionorbuildchanges. SeeVIDEO_POSE_CASE_STUDY.md and VIDEO_ALIGNMENT_REVIEW.md.

Practice timing/visual audit:243/243testsPASS28files;3newrecordedassociation/evidenceregressions.39/39practiceframesmatchmanifest. Qualitativeimagewristmislocalizationseenmatchedoutwardphase. PRACTICE_SYNC_REVIEW.md. Exactvideosync/precisephysicalform/generalaccuracy/FireTVNOTVERIFIED. No productionsourceornewbuildchanges.

New-locationexport: independent244/244testsPASS29files; buildPASSmain569.08kB advisory. Recordedcompletion/guard/recoveryPASSretained; missingoptionalreachcomparisonnowlabelledNotenabledratherthangenericmeasurementfailure. No numericthresholdchange. NEW_LOCATION_REVIEW.md. PhysicalaccuracyandlightingcausalityNOTVERIFIED.

## Tracking Lab — 2026-10-18

- Automated: 280/280 tests PASS, 32 files, including runner scheduling, metrics, 26 independent/adversarial lab cases and existing regressions. Production TypeScript/Vite build PASS, both entries emitted.
- Checked: separate calibration/evaluation source, anatomical hand attribution, no world fallback, aspect correction, raw passthrough, missing/gap resets, no gap-spanning segments, robust dynamic peaks, pairing delegate/device/condition/timestamps, bounded report import and no physical-accuracy claim.
- Browser: page/controls render, no captured console errors. Filechooser selected no file during automation; full video import/model/capture walkthrough NOT VERIFIED.
- Physical: phone permissions/capture, spoken cue usability, actual Full/Heavy accuracy/latency, manual annotation agreement and camera condition comparison NOT VERIFIED. Use docs/TRACKING_LAB.md procedure; do not select winner from smoothness alone.
- Fire TV hardware/simulator gate NOT VERIFIED. Independent review: TRACKING_LAB_REVIEW.md.

### Guided lab UX follow-up

282/282 tests PASS across 33 files, production build PASS (independent V&V). Stance-aware cue tests cover orthodox/southpaw, held poses, shortened punches and recovery language. Root browser walkthrough: all four panels, collapsed advanced controls and visible missing-clip guidance PASS. Physical capture/model execution and phone usability NOT VERIFIED. Screenshot: tracking-lab-guided.png.

### Metric evidence export — October 19

Independent source review PASS; existing282/282testsPASS and buildPASS. Empty selection guarded; handler recalculates before exporting displayed evidence and provenance/options. Root browser verified button location. Populated browser download and OnePlus download flow NOT VERIFIED. No camera/physical validation implied.

### 2D projected segment policy — October 19

Independent V&V284/284testsPASS33files; buildPASS. Two targeted regressions verify segment changes diagnostic-only in image2D, raw preservation, missing/visibility/jump rejection retained and world/imageXYZ bone gates unchanged. Recorded export(4) replay: accepted 2D series exactly equal with/without oldreference, no bone-length rejection; Full432/448 eachhand,Heavy426left/368right. Fullpeaks122.928/68.712 and102.278/74.581px full/short. PhysicalaccuracyNOTVERIFIED. Review: TRACKING_LAB_REVIEW.md.

## Movement-cycle milestone — October19

323/323testsPASS36files; productionbuildPASS. Newtestscovertimestampcadence, elbow-onlyocclusion, visibilityloss/gaps, ordering, partial/adjustment outcomes, stance, bodytranslation, materialcamera-bodychanges, sourceimmutability, optionalextensionabstention, labelvalidation, uniqueeventmatching, falsepositiveexposure andvideo-clockconversion. Existingregressionspreserved. IndependentreviewMOVEMENT_CYCLE_REVIEW.md.

Realheldoutreplaysold/newcountsrecordedinMOVEMENT_CYCLE_EVALUATION.md; noindependentlyreviewedGT=>precision/recall/FP/timingNOTVERIFIED. Feints/guardadjustments/occlusion/cameramovementhaveautomatedcasesbutnoestablishedphysicalcategorypass. HumanprotocolMOVEMENT_CYCLE_VALIDATION.md requiredbeforeclaiming18/20targets. BrowserpanelcontrolsPASS; actualnewpanelpopulateddownloadNV. NoFireTVvalidationimplied.

### Corrected guard origin and lowering — October19

333/333testsPASS36files; buildPASS. Independent21checks covercompactguarddrift, slowshortmovements andlowering. SameFull12Hzrecordingretains8confirmedcycles, removesstationaryfalsepartial, labelsrightloweringuncertain. Rawdataunchanged. Newheldoutphysicalprecision/recall/FP/timingNOTVERIFIED. SeeMOVEMENT_CORRECTIONS.md andupdatedindependentreview.

### Viewpoint-evidence-v3 — October19

Independent339/339testsPASS36files/buildPASS,26independentchecks. Preservedrigidtransformabstention,cameraIDresets,missinganchorwarnings; addedshoulder-onlymotioncontinuity andstartupreferencecases. Full5/9/10replay8eachwithexpectedhand/timewindows;9extrapartialandHeavy10wronghandcandidateopen. NoGTphysicalprecision/recall/FP/timingclaim. GEOMETRY_CORRECTION_RESULTS.md andindependentreviewrecorddetails.

## Prescribed-rule milestone — October19

Independentintegrated380/380testsPASS39files/buildPASS95modules. Newcoverageboundedhand/order/windows,reaction/recoverytolerance,idle/heldreachrejection, missinginitialelbowuncertainty, rawimmutability, sustainedvsbriefguarddrop, independentrecoveredguard, session/stance/cameracontextcancelincludingcountdown andmatchingrecordingstop, optionalDTWdisabled/missingref/drill/viewpoint/review/malformedfields/unsupportedcross. Browserlivepreview/labcontrolsPASS; no physicalcamerapermissionused. Replay11 eightwindowsequencesmatchedandoneidlerejected; notcoachjudgmentaccuracy. Actualguardfeedback,phonevideoexecution/sync,DTWusefulness/FireTVNOTVERIFIED.

### Guided speech — October19

386/386testsPASS39files;productionbuildPASS. Independentvoicecontrollercasescoverorthodox/southpawhandcues,3/2/1,toggleoffwithoutstoppingcapture,Stopcancelingfuturegocues,unsupportedAPIfallback,and speech/cancelerrorsnotblockingrecordingcleanup. Actualspeakeroutput/audibilityNOTVERIFIED. No microphone or providercredentials required.

### Prescribed cross deadline correction — October 19

393/393 tests PASS, 40 files; production build PASS, 95 modules. Independent prescribed suite 30/30 PASS. Coverage includes slow recovery inside the prescribed deadline, unchanged unrestricted timeout, recovery outside deadline rejected, tracking gaps, wrong hand, invalid deadline configuration, raw replay immutability and both user live exports. Cross now completed; jab preserved. Extension cannot assess. Independent software gate PASS; new physical-phone walkthrough and physical form accuracy NOT VERIFIED.

### Same-side-eye guard height — October20

401/401 tests PASS41files; build PASS. Eight new independent cases cover anatomical eyes, mirrored metadata, aspect correction, inclusive0.30 boundary, straight/missing elbow, eye-confidence abstention, coverage,180ms continuity,350ms gaps, lateral abstention and descriptive baseline. Existing movement/calibration/legacy regressions pass. Intentional report-version/feature expectation changes recorded by independent V&V. Replays3/4/5 all recognize movement and report low-height deviation; normal3 is apparent false warning (max0.336, sustained621.1ms). Threshold discrimination/physical correctness NOT VERIFIED; no general precision/recall claim.

### Eye-height v4,0.50 limit — October20

401/401testsPASS41files/buildPASS96modules; independent reviewPASS. Threshold-specific fixtures now test inclusive0.50 boundary and sustained0.60 violations; underlying shoulder geometry unchanged. Saved normal3 supported, guarddrops4/5 deviations227.5/306.3ms. All six movement completions preserved. Derived eye-height-v4-replays.json records evidence. Prior0.30 normal warning resolved on this development sample; general physical discrimination NOT VERIFIED.

### Guard restoration v4 — October20

Independent405/405testsPASS41files;buildPASS96modules. Added armedloweringdisarm/restorationwithoutpunch, freshguardthenrealcycle, missingwristcontinuity, brief100mslowering, largegapreset, genuineextracrossstillreject tests. Existing truecombo/order/camera/calibration/legacy tests pass. User6falsecrossremoved, jab and772msoppositeguarddeviation available; prescribed0–6completion retained; FullLab5/9/10/11eightcompletionsretained. This is software regression/development replay evidence, not held-out physical precision/recall. Fresh phone validation and FireTV NOT VERIFIED.

### Guard-lowering-v5 and restoration lock — October20

Root411/411testsPASS41files/buildPASS. Coverageadds180msdownward+eyeheightuncertainty, absenteyecontinuity, upward/horizontalmotionpreservation, postloweringfresh100msguard, missingeye/wristlockholdreset, no prematurepartial, genuineadditionalcrossstrictcountrejection. Prescribed0–7movementcompletionretained,7falsecross/laterpartialremoved; FullLab5/9/10/11eightcompletedretained. Independentfinalreviewrequired. Developmentreplaysnotheldoutphysicalrates; physicalvalidation NOT VERIFIED.

V5 final independent count:412/412PASS41files/buildPASS96modules; postlock artifact and review approved. Physical gate remains NOT VERIFIED pending fresh camera validation.

### Starting guard feedback — October20

418/418testsPASS42files/buildPASS96modules, independentreviewPASS. Six newcases: recorded8specificinstruction/rawimmutability, missingelbow andmissingwrist retainuncertainty, observedguardidle retainsgenericcyclemessage, wronghand retainsmismatch, partialmovement retainsrecoverymessage. No thresholdchanges. Actualusercomprehension/physicalvalidation NOT VERIFIED.

### Non-recovery message — October20

423/423testsPASS43files/buildPASS96modules; independentreviewPASS. Five newcases: raw9specificreason/uncertainstatus/rawimmutability, genuine lost andgap retaintrackingmessage, opposite-only uncertain movement doesnotaccuseexpectedhand, matchednormaljab feedbackunchanged. No detectionthreshold changes; physicalvalidation remains NOT VERIFIED.

### Temporal readiness and two-hand boundary checks — October20

Root444/444testsPASS45files; buildPASS96modules. Addedreadiness coverage for raw10laterratherthanstartingguard, slowraisingintoguard, delayedvalidguard/punch, jitter, missing/gaps/context; newtwo-hand boundary cases for simultaneoushands, noelbow, late-onlyguard, excessivehighwrist, missingeyes/wrists, briefholds/gaps/staleguard, unavailabletiming and recordings3/9/10. All movementregressionsretained. Replays0–10 export boundary-guard-v6 evidence. Independent final gate PENDING due agentusagelimit; rootchecks are not independent approval. BrowserlocalHTTPSinspectionblocked; actualUIwalkthrough andphysicalaccuracy NOT VERIFIED.

### Face-supported-v6 — October20

Root453/453testsPASS47files/buildPASS. Focusedcases coverstabledualfaceanchors, nearnessalonewithgenuineexcursion, singlemissinganchoruncertainty, contradictoryvisibleanchor, bothmissing, boundaries/peak/coverage/gaps, anatomical/aspecthandling and realshortmotionretention. Raw11nowmatches2puncheswithguard-adjustment;0–10statuses andFullLab5/9/10/11eightcompletionspreserved. Boundaryregressionscheckearliestjab/latestcross andnopeak-as-end. Independentfinalgatepending; physical/generalaccuracy NOT VERIFIED.

Finalindependentface/boundarygatePASS:454/454tests47files,99-modulebuildPASS. Rejectedthreecyclewrongordercase independently exercises earliest/latestcandidate boundary selection. Physical intent and true depth-directed short-punch sensitivity remain NOT VERIFIED.

### Competing post-drop trajectories — October21

Root475/475testsPASS49files/buildPASS. Testscoverrestoration vsoutward+recovery, continuouslowturn(nohold), briefambiguous/unrecoveredflush, missingeye/nose/wrist/confidenceNaN/gaps/context, staleonset/peakchronology, boundedhistory/deadlines, freshguardafterresolvedambiguity, truehand/order/count, individuallyretainedfindings andlow-startguardflag. Case12bothoppositeguarddeviationssupported; crossstartguardexplicitlynotobserved. Replays0–11retained, fourFullLabrecordingseach8cycles. Independentfinalreviewpending; physicalaccuracy NOT VERIFIED.

Finalindependentcompeting-v7gatePASS:475/475tests49files,100-modulebuildPASS. Includesrecovery-onlyguarddropnotmislabelledoutwardguardfailure, weakexcursionflushuncertainty andboundedhistory. Physicalintent/forwarddepth/generalcoaching NOT VERIFIED.

### Outward observation / recovery separation — October21

Root486/486tests across50files PASS, productionbuild PASS (existing bundle advisory). Coverage includes unrecovered outward phase, completed return, face-stable adjustment, missing face observations, tracking interruption, wrong hand/order/count despite later recovery loss, renderer wording, case13 and earlier development regressions. Independent final review pending. Fresh physical precision/recall/timing and FireTV gate NOT VERIFIED.

Independent v8 corrective gate PASS: V&V independently reran486/486tests50files and productionbuild100modules. Renderer13 behavior PASS; immutable source replays confirm9/13 matched outward phases with uncertain recovery; four Full lab regressions retain8completed and8supported phases each. Review: docs/validation/PRESCRIBED_REVIEW.md; evidence: docs/validation/prescribed/movement-observation-v8-replays.json. Physical/livephone/FireTV remain NOT VERIFIED. Prefix-order matching is conservative when an earlier movement might be unobserved.

Concise-feedback final independent gate PASS:488/488tests50files and productionbuild100modules PASS; existing bundle advisory. Covers closed details, retained measurements, movement/recovery separation, sequence mismatch, insufficient evidence and camera-specific recovery uncertainty. No detector changes. Live UI/phone usability and physical coaching remain NOT VERIFIED.

## User negative cross validation16 — October21

User labels attempt16 as no cross performed despite prescribed cross. Savedv8 report rejected, movementSequenceMatchedfalse, punches/outcomesempty across70frames. No false cross credited: matches userlabel for this single negativecase. No video supplied; physicalmotion independentverification NOT VERIFIED. Source unchanged; no new automatedtestsrun.

## Frame-exit negative17 — October21

Userlabels movingoutofframe. Savedv8 correctlykeeps overallstatusuncertain/recoverycannotassess butincorrectlymovementSequenceMatchedtrue withcrossoutwardphase. Rightdeparture+0.032s,peak+0.368s,7supportedsamples; candidateinterrupted+0.707s byImplausiblewristjump. ThenleftuncertainShoulderspantoosmall. Tracking51tracked/7lowconfidence/7lost. No completedpunch/recoverycredited; outwardlocalizationnegativeFAILagainstuserlabel. Potentialframeexit/relativegeometryartifactbeforetrackingloss, notprovenphysicalcross. No matchingvideosupplied. Need frame-exit/wholebodymotion evidence review before correction; do notdiscardallrealpunchesfollowedbyloss. Rawunchanged/no sourcechanges.

## Correction after matched video17 review — October21

Manifest2a0cfdd3 matchesattempt17 recordingID and65/65frames. Video contactreview2–5.75s showsrightarmoutwardextensionat~2.5–2.9swhileuserside-stepsoutofview, thenreturnsintoframeinguard. Detectorrightdeparture2.508/peak2.844s precedes interruption3.183s. EarlierlabelnegativeFAIL/falsemovementisRETRACTED: video supportsoutwardcross-likearmmovement; recoveryoccurredpartlyoutofviewandcannotbeconfirmed. Correctinterpretation supportedoutwardmovementplusuncertainrecovery, notestablishedfalsepositive. Thisclipisnotpureframeexitnegative; freshno-punchframeexitneededtovalidatethatcase. Approximatecallbacksync andphysicalformlimitsapply. No sourcechanges.

Main Coach lesson-loop final software gate PASS: root and independent V&V498/498tests51files; productionbuild100modules PASS, existing main552.71kB advisory. New8controller tests and2stancecombo animation checks cover retry/newrecording, manualnext, matched+return gating, guard/extensionnongating, demo captureisolation, selection/exportreset and sessionfinish. Existing stop/context/speech regressions pass. Review docs/validation/PRESCRIBED_REVIEW.md. Human validation REQUIRED: phone paired -> watch each stance guide -> attempt -> review -> retry/next -> download clip+manifest+attemptJSON. Live phone integration, TV remote focus/performance, FireTV execution and physical accuracy NOT VERIFIED. No credentials or approval required for local implementation; hardware/simulator access required for target deployment gate.

## User-confirmed full Coach flow — October21

User reports testing the full integrated flow successfully: demonstration -> guided attempt -> concise feedback -> retry/next. Human end-to-end walkthrough PASS by user report in the current phone/browser/camera setup; no additional telemetry or independently reviewed recording supplied for this walkthrough. Latest automated software gate remains498/498tests plus successful productionbuild and independent V&V. FireTV hardware/simulator execution, remote focus/performance and general physical coaching accuracy remain NOT VERIFIED. Next viable milestone: verify the existing target runtime/deployment path and perform phone-to-FireTV end-to-end walkthrough; hardware/simulator access required for target claims.

## Fire TV graphics compatibility audit — October21

Userrequestedno-redesignauditcompleted. CurrentThree.jsr180WebGL2renderer,primitivebag/ring/ghostarms,DOMcoach,phoneMediaPipe andhostedFireOSWebViewshellreviewed. Root498/498tests51files/webbuildPASS; existingAPKrebuilt/signatureverifiedPASS withplaceholderHTTPSorigin andcompatibilitywarnings. ADBpermitteddiscoveryreturnedempty; onlyAVDVECTR_API_35isPixel7/googleAPIAndroid35,notFireTV. NoVegaCLI/targetlocated. Thusconditionalminimalbag-sceneontargetnotexecuted. No production source/refactor/CV/gameplaychanges.

Deployment/rendering/FPS/remote/phone-to-TVgate NOT VERIFIED. IndependentV&Vauditagrees. Sourcegap:remote selectorsomitsummarydisclosures;nativearrowhandlingofselectsneedsverification. ThreeWebGL2andexactWebView/OSarehardtargetchecks; existingAPKplaceholdercannotloadrealapp. PreferexistingFireOSWebViewshellforaspecifiedcompatibleFireOSmodel; VegarequiresseparatenativeWebViewshell/vpkgandverification. Fullreportdocs/FIRE_TV_GRAPHICS_COMPATIBILITY.md; preservedlogsdocs/validation/fire-tv-graphics-gate/; independentreviewdocs/validation/FIRE_TV_GRAPHICS_GATE_REVIEW.md.

Human/hardwareblocker: exactFireTVmodel/OS plusauthorizeddeviceorcompatibleVegasimulatorandtrustedapphostingrequired. NoAIcredentialsneeded. Beforeanimeaestheticdevelopment:WebGL2bagprobe,performancebaseline,focusfix+remotecheckandphone-to-TVwalkthrough. No new simulator installations or runtime changes performed.

## Vega Virtual Device — 2026-10-21

Existing suite498/498 and productionbuild PASS; Vega wrapper types/Debug package PASS; simulated OS1.2 aarch64 boot/discovery PASS. HTTPS load/JS/WebGL2/meshes/remote/full scene/phone NOT VERIFIED due lifecycle/debugger/compositor blockers. Independent static review PASS after supported injection-method correction. Actual screenshot unavailable. See VEGA_VIRTUAL_DEVICE.md and vega-gate logs. Physical FireTV/performance NOT VERIFIED.

## Vega continuation — October21 final

PASS: Watchmanfsevents,498/498webtests51files,productionbuild,wrappertypes/Debugbuild,Jest1/1; trustedHTTPS/JS/WebGL2,actual minimal+fullscene screenshots,existing jab/cross/combo visual execution,offline dialogue. Probe explicit4directionfocus/SelectA+B/Back PASS; default probe nav FAIL. Production Dpad FAIL: hiddeninput/disclosurefocus trap. Production remote-only lesson/dialogue/Backhistory NOT VERIFIED. Phone/API/physicalFireTV/performance NOT VERIFIED. See VEGA_VIRTUAL_DEVICE.md current gate and vega-gate/probe-events.jsonl. Overall milestone FAIL due remotefocus; renderer PASS on VVD only.

Phone-to-Vega live October21: sharedHTTPS/static+protectedQRsessionPASS; actualphonecamera/FullreadyPASSbyuserreport; real33image+33worldlandmarksreceivedinVega andConnectedPASSbybridge. InitialtrackingqualityFAILforusableattempt(279lowconfidence/8lost/0tracked of287posts); repositionrequested. Guidedjabcrossfeedback/reconnect NOT VERIFIED. No syntheticposes used.

## Real-phone Vega final live check — October21

PASS: HTTPSapp/restrictedQRcreation,realphonepairing,cameraconsent+Fullready(userreport),33/33landmarksinsideVega,guidedjab-crossfeedback(actualscreenshot),sameQRcameraStop/Startreconnect(stale→Connected,newconfiguration,continuedsequence). Software501/501tests53files+productionbuildPASS;wrappertypes/DebugbuildPASS. OpenautomaticcancellationcauseNOTVERIFIED;forcednetworkoutage,physicalFireTV,physicalrecognitionaccuracyNOTVERIFIED. ProductionremoteFAILretained. Earliermismatch/insufficientevidenceoutcomesnotexcluded. See docs/PHONE_VEGA_CONNECTION.md finalgate.

## Milestone A — 2026-10-21

| Check | Result | Evidence |
|---|---|---|
| Full regression | PASS | milestone-a/tests.log: 504 tests / 54 files |
| Production compile/build | PASS | milestone-a/build.log; existing chunk-size warning |
| Static gym contract and budget | PASS | tests/milestone-a.test.ts; target corridor, bag/ring geometry, finite opaque static mesh budget |
| Independent desktop visual review | PASS | milestone-a/browser-gym.jpg; MILESTONE_A_REVIEW.md |
| Vega build/install/launch and WebGL2 render | PASS | milestone-a/vega-build.log, vega-events.jsonl, vega-gym.png |
| Jab/cross/combo regression | PASS (synthetic + scripted controls) | Existing graphics tests and fresh Vega control messages; frame capture labels are not phase timestamps |
| 30 FPS, fresh physical phone pairing, Fire TV hardware | NOT VERIFIED | No measurement/physical trial in this milestone |
| User aesthetic approval | PENDING | Required before Milestone B |

## Milestone B — 2026-10-21

| Check | Result | Evidence |
|---|---|---|
| Regression | PASS | milestone-b/independent-regression.log, 55 files / 509 tests |
| TypeScript / production build | PASS | milestone-b/independent-build.log; bundle warning documented |
| Four-state deterministic sampling, UV, disposal and placement | PASS | tests/milestone-b.test.ts |
| Read-only presentation observer conditions/cleanup | PASS | tests/milestone-b.test.ts |
| Actual browser + four-state scene preview | PASS independent review | browser-tv-idle.jpg and preview-*.jpg |
| Vega build and actual native WebView scene | PASS | vega-build.log, vega-events.jsonl, vega-gym.png |
| Protected gym/CV/game/coach/platform/companion/contracts/CSS | PASS | 36 unchanged SHA-256 hashes |
| Measured 30 FPS, physical TV, fresh live phone integration | NOT VERIFIED | Outside direct evidence captured here |
| User visual approval | PENDING | Required before C |

Milestone B clarity follow-up: production build PASS, focused graphics + A/B scene suites 12/12 PASS, fresh browser render PASS (`milestone-b/browser-clarity.jpg`). Vega follow-up NOT VERIFIED after canvas height/filtering change.

Composition refinement: production build PASS; 12 focused tests PASS with revised camera in projection bounds; actual browser visual PASS (`milestone-b/browser-composition.jpg`). Fresh Vega run NOT VERIFIED. Gameplay/CV/transport source untouched.

## Milestone C — 2026-10-21

| Check | Result | Evidence |
|---|---|---|
| Regression | PASS | milestone-c/independent-regression.log:515 tests/56 files |
| Final production build | PASS | milestone-c/build.log; existing bundle-size warning |
| Fade/white materials/stance/speeds/VN grounding/cleanup | PASS | tests/milestone-c.test.ts; final-focused.log; independent-final-focused.log |
| Actual animation recording | PASS decoder/metadata | demonstrations.webm, recording-metadata.json:11.44s,1830×561,error null |
| Browser composition + readable VN | PASS | browser-introduction.jpg, browser-jab.jpg |
| Vega package/render | PASS | vega-build.log, simulator.png, native canvas frames/events |
| Browser arrow/Select focus | PASS scoped | summary Down→pairStart; Up→summary; Enter collapsed guide |
| Native Vega remote/sustained30FPS/physical camera | NOT VERIFIED | No direct new evidence |
| User visual review | PENDING | Stop before D |

D resumed build:541/541 tests (57files) PASS,26 focused D tests PASS, production and hosted Vega package build PASS. Browser ArrowDown reached stance and Enter on Skip completed tutorials opened explicit Practise/countdown instructions. Native updated key behavior and actual timed punch attempt remain NOT VERIFIED pending live retest. See resume-regression.log/resume-build.log and resume-pairing-ready.png.

### Milestone D remote follow-up — 2026-10-22 (Singapore)

User reported that Practise Jab produced countdown and feedback in an earlier test; later fresh retest deferred. This is a user-reported live smoke PASS for attempt entry/feedback, not proof of accepted technique, accuracy targets, or cross/combo progression. User still reports native remote navigation FAIL.

Native diagnostic trace confirms standard Arrow keys reach the WebView and focus moves; it also shows question-input and native-select key handling. Fixed single-line text-field focus trapping (Up/Down exits, Left/Right keeps cursor editing), explicit Up/Down select changes with bubbling change events, Enter/Select confirms selector and moves onward, and visible focus outlines on links/disclosures. No CV or evaluation threshold changes. Browser observed stance changes and restoration, Enter moved to Continue, and Down moved question to Ask.

Evidence: remote-followup-focused.log 27 tests PASS; remote-followup-regression.log 542/542 tests across 57 files PASS; remote-followup-build.log production build PASS (existing chunk warning). Full suite initially blocked by sandbox localhost listen; rerun with local-server permission passed. remote-followup-browser.png captures browser result. Native reload emitted load events at 16:27:12 UTC, but full-display capture showed launcher, so it does not verify updated native navigation. Native remote fix retest, accepted Jab-to-Cross progression, cross/combo physical tests remain NOT VERIFIED. Overall milestone gate remains open.

### Native navigation verification — 2026-10-22 Singapore

Ran the actual hosted FireRoom app in Vega Virtual Device through Amazon's installed Appium driver. Native Linux arrow events (103/108/105/106) and Enter (28), 80ms holds, not synthetic DOM key events. Initial driver press-key endpoint holds for1000ms and caused auto-repeat; switched to supported JSON-RPC injectInputKeyEvent via nested Appium args for brief presses. No production code changed in this verification.

PASS: Right focuses stance; Down switches orthodox to southpaw and updates grounded text; Enter confirms selector and moves to Continue; Enter opens Guard; Right/Left reach Practise/Watch, Enter invokes Watch (guide label/dialogue updated). Up/Down move between Practise and Retry; disabled Guard observed button skipped; Enter on explicit bypass opens Jab; focus fallback reaches Practise jab with visible orange outline. Traversal reaches question field; Down exits to Ask. Evidence native-navigation-verified-events.jsonl (16:37:01–16:37:49 UTC), native-nav-jab.png, native-nav-text-escape.png.

Scope: simulator arrows + Enter activation PASS. Physical Fire TV remote remains NOT VERIFIED. Additional raw Linux KEY_OK352 produced no logged DOM activation; this is not proof of a physical remote mapping. Native graphics in this fresh headless run reported WebGL context creation failure and blank canvas; the navigation PASS does not validate rendering or Watch animation playback. Existing graphics evidence remains historical. Full milestone remains open for physical cross/combo progression and graphics recovery in current simulator configuration.

## Immersive Coach screen — 2026-10-22

Implemented a viewport-height Coach-only game shell in src/ui/coach-screen.ts/.css with one main.ts presentation hookup. Scene occupies84% of viewport height behind bottom-positioned cream Atlas dialogue; compact top wordmark and Connect & menu button. Original gym, camera transforms and character artwork unchanged. Existing controls are reparented, retaining controller roots, selectors and listeners. Stance teaching diagram remains a small left-side inset; main grounded coaching text and active lesson controls are presented in the VN overlay. Detailed feedback, voice toggle and attempt export remain under Lesson options.

Large header, lab link, prototype badge, caution copy, pairing/connection cards, video status, older lessons, calibration, diagnostics and Ask Atlas moved to hidden setup drawer (header title/badge hidden there). Drawer isolates focus with inert, restores focus on close and supports Escape; close button is native-remote accessible. Phone companion markup, backend, relay, CV, evaluators and Arcade were not changed by this presentation pass.

PASS:542 automated tests/57files (regression.log); production build (build.log; existing chunk warning). Browser stance→guard→Jab, camera-required feedback, drawer open/close/isolation and arrow activation checked with no browser error logs. Fresh actual Vega app loaded and rendered gym/Atlas/VN (immersive-vega.png; captured at initial79% scene height, final CSS84% screenshot coach-mode.png). Prior headless WebGL error absent in this GUI run. Native ArrowRight/Enter opened drawer, arrows reached drawer link and close, Enter returned focus to coachSetup (native-events.jsonl17:09:23–26UTC). Initial automation screenshot/socket failure resolved by re-enabling toolkit after GUI restart. Actual physical remote Select and a new live-phone punch/relay walkthrough after this layout remain NOT VERIFIED; source handlers unchanged, not a claim of fresh physical validation.

Deliverables: coach-mode.png final browser screenshot, setup-drawer.png drawer screenshot, immersive-vega.png actual native render, native-drawer-results.json and native-events.jsonl. Gate: layout/rendering and tested native arrows/Enter PASS; full Milestone D physical cross/combo gate still open.

## Atlas guided stance and guard introduction — 2026-10-22

Implemented a six-beat presentation-only sequence: Atlas full-body in orthodox stance/raised guard → exact requested opening line → leg-placement shot → raised-hand guard shot → full-body recap → thumbs-up approval → exact Now you try! prompt. The final prompt waits for Practise stance & guard; this reveals existing stance choice/self-confirmation, then existing guard practice. No guard success or foot accuracy is granted by the cinematic. On replay, existing prescribed attempts are cancelled and active beginner guard sampling is paused; previous lesson progression is retained.

New src/game/atlas-tutorial.ts owns short readable timers (6.5/11/8.5/6/4.5seconds), Continue/Previous, Pause/Play, Skip and drawer replay. Opening setup pauses reading time. src/graphics/atlas-tutorial.ts loads an additional transparent two-cell guard/thumbs-up sheet, preserving original Atlas for normal play. Scene camera position/look-target/FOV smoothly approach full/legs/guard presets with a240ms exponential transition, returning to the approved bag composition on practice. Reduced-motion setting applies shots immediately. Ghost arms are hidden while Atlas teaches; existing guides resume for practice. No postprocessing, rigging or foot recognition. Bottom VN remains the sole main dialogue, locking to authored teaching text until handoff. Upper-left shot captions label each instructional focus.

Files: src/game/atlas-tutorial.ts; src/graphics/atlas-tutorial.ts; new assets/atlas-tutorial.png + assets.d.ts; scene/main/dialogue presentation integrations; beginner.ts adds pausePractice only; coach-screen.css shot caption/actions; Vega standalone packager adds PNG data-URL loader to preserve local file packaging. tests/atlas-tutorial.test.ts validates timed sequence, final wait/handoff without automatic technique credit, pause/resume, manual previous, skip/replay and disposal. Built-in imagegen reference/provenance recorded in asset-provenance.json. Original character/gym artwork untouched.

PASS:545/545 automated tests,58files (regression.log); three focused tutorial tests (focused.log); TypeScript/production build (build.log; existing chunk warning); standalone Vega HTML packaging (standalone-package.log). Browser actual six-step screenshots01–06, final practice screenshot07, Enter handoff, stance confirm and Practise guard all observed, existing camera-unavailable behavior retained. New PNG visibly renders transparently and camera framing shows feet/guard above dialogue. Native hosted app loaded17:33:15UTC and page source identifies FireRoom, but fresh native full screenshot timed out. Do not claim fresh native cinematic visual PASS or physical phone/remote accuracy from browser screenshots. Earlier native navigation/layout results remain historical.

Gate: software and browser tutorial-flow PASS; fresh native cinematic visuals and live phone guard handoff after this extension NOT VERIFIED. Full D cross/combo physical progression remains open. Screenshots are sufficient requested visual deliverables; no recording claimed.

2026-10-22 Vega tutorial display follow-up: recovered native Creating surfaces lifecycle ANR by restarting VVD in GUI mode; no app/CV changes. Current native app stayed visible and fresh full-display capture atlas-tutorial/vega-tutorial-ready.png shows actual new guard artwork, focus shot, dialogue and controls. Native Enter events received17:43:07–08UTC. This supersedes prior native cinematic screenshot NOT VERIFIED for this captured guard shot only; full native six-step/physical-phone handoff not claimed.

2026-10-22 Guard ghost follow-up: rotated only guard-arm groups +90degrees about X, mapping glove forward(-Z) to up(+Y), with extra guard-only XZ contour for readable upright silhouette. Jab/cross reset rotation to zero. Rise remains200ms ready+650ms upward movement; final hold is now3000ms, followed by existing200ms fade (4050ms total at1x). Focused C/D33 tests and production build PASS. Browser screenshot capture did not expose the transient gloves reliably, so no visual PASS from upright-guard.png; native timing visual retest remains unverified. No tracking/evaluator changes.


2026-10-22 — Live guided bag impact follow-up (visual review pending)
Implemented early supported-outward snapshots from the existing MovementCycleRecognizer, scoped to guided attempts, with both face anchors, existing confidence/evidence gates and cycle identity deduplication. Prescribed Coach emits the visual event before final feedback; legacy recovery visuals are suppressed during guided lessons. Authored jab sway/settle, slightly stronger cross, and brief cream line accents use no force estimate. Added optional game-canvas recording tool. Session observed-punch statistics and clearer immediate-versus-finishing guard copy are integrated; canceled Vega JSON transport was removed.
First physical jab review FAIL: user reported insufficient reaction, and captured scene markers contained no impact. Replaying the saved real attempt isolated an overly broad shoulder-viewpoint gate; this flag limits extension geometry but the existing classifier supported outward movement. Removed that extra visual-only rejection without retuning evaluator thresholds. Saved replay now emits one jab cue at +389.7ms, about69ms before its retrospectively estimated peak. This is replay evidence, not a successful new live visual test.
Validation:563/563 automated tests (61files), including8impact tests and real-attempt regression; production build PASS with existing bundle-size warning; Vega standalone packaging PASS. Files: src/vision/movement-cycle.ts, src/game/bag-impact.ts, src/game/prescribed-coach.ts, src/graphics/bag-impact.ts, src/graphics/scene.ts, src/main.ts, src/ui/scene-capture.ts, session-stats and prescribed-feedback modules, related tests. Evidence: docs/validation/bag-impact/.
Gate: automated/software PASS; corrected physical impact visibility and native Vega impact NOT VERIFIED. Fresh browser pairing prepared for user retest. No exact contact, force, latency or sustained-FPS measurement claimed.


2026-10-22 Arcade previous-video feasibility assessment: current Full early outward evidence emits4jab+4cross cues on each of four lab runs, with (4)/(5) sharing one clip. Three distinct clips yield24 cues total; this is not24/24 accuracy. Reviewed guard-only and behind-body-return windows in lab11 emit no cue.18guided exports replayed,15contain cues; they are not18ground-truth positive trials. Recovered-only timeout can miss held/slow demonstrations, so Arcade should use additive early movement input with dedup and separate combat resolution. No runtime source changed. Reproducible assessment script, video provenance, contact sheets and detailed limitations: docs/validation/arcade-input/REVIEW.md. Gate: recorded-input feasibility supported; actual Arcade combat/live Vega NOT VERIFIED.


2026-10-22 Arcade Milestone A implementation: independent /arcade.html now has fixed first-person ring/opponent,60s deterministic combat FSM, early jab/cross input, guard defense, health/timer/results, hit/block animations, bell, phone pairing and remote menu. Coach source only gains Arcade link; CV/relay unchanged.588/588 tests(64files), production build and native wrapper build PASS. Real recorded Full lab2/4/11 each execute4jabs4crosses through actual resolver; browser screenshot/log verifies8attacks5hits3blocks and safe pause on source end. Native VVD1920x1080 ring/HUD screenshot PASS and directional focus/Select opens menu PASS. Native standalone test is not hosted phone networking. Live physical phone-on-Vega60s round, timing/performance and broad recognition accuracy NOT VERIFIED. Independent input/resolver/controller V&V found and fixed transient visible guard movement causing unnecessary pause; no threshold retuning. Files/evidence/limitations/next test: docs/validation/arcade-a/REVIEW.md. Software gate PASS; physical milestone gate NOT VERIFIED. Stop before advanced Arcade features.


2026-10-22 Arcade “The First Rival” art pass: Ren Mori now uses smooth articulated procedural anatomy, visible anime face/guard, red shaped gloves, navy two-leg shorts and high-tops. Added classic boxing gym, closer48° eye-height framing, connected player gloves/forearms and compact game HUD. Persistent active instruction card removed; conditional corner-ready/countdown/pause/lost/results overlays and isolated menu preserved. Final continuation corrected limb taper toward wrists/elbows/knees.593/593 tests(65files), final5art checks and production/native builds PASS. Actual final1920x1080 VVD render and native directional/Select menu PASS; screenshots and bounds/evidence in docs/validation/arcade-rival/REVIEW.md. No engine/damage/CV/relay/Coach source changes. Original hosted test configuration restored. Procedural artistic quality awaits user approval; fresh live phone/Vega round and sustainedFPS NOT VERIFIED. Gate: software and scoped native art/menu PASS; stop for visual review.


2026-10-22 Live Arcade pilot: user confirmed camera running; actual Full-model phone frames reached browser Arcade, orthodox. Saved pilot has8jab/3cross predicted cues with11uniqueIDs;7accepted combat actions (1hit,4blocks,2range misses),2cooldown suppressions and2paused-round suppressions. Source arrival gap caused automatic pause; latest UI recovered tracking but requires explicit Resume. Physical throw counts and perceived glove responsiveness await human confirmation, so recognition accuracy/false-positive gate NOT VERIFIED. No broad physical PASS claimed. Observability-only console logging now includes ignored cues and pause reasons; production build PASS. Evidence: docs/validation/arcade-live/.


2026-10-22 Live combo defect confirmed and corrected: user reported jab→cross only animated jab and some punches had no reaction. Saved real-phone events show two supported cross cues arriving240.3/241.1ms after jabs were rejected by global280ms cooldown. Combat now applies280ms independently to jab/cross (fixed lead/rear mapping within stance); stable identity dedupe, same-hand rate limit, confidence, range/block and paused-round exclusions remain. Player gloves now use independent per-hand playback so cross start does not cancel jab recovery. No CV threshold changes. Independent recorded-event replay executes both formerly suppressed crosses, and saved real combo11 executes both types.601/601 tests(67files) and production build PASS; independent playback tests cover both stances' hand ordering. Pilot physical counts were not counted by user; do not claim false-positive rate or recognition recall. Fresh corrected live retest remains NOT VERIFIED. Opt-in ?validate=1 keeps bounded local poses/events for this retest without raw video or network upload. Fresh QR prepared; next human task exactly3jab-cross pairs thenholdguard.

### Arcade combo live retest — 2026-10-22
NOT VERIFIED: countdown canceled before an active round. Retrieved 600 local pose observations: 320 tracked, 218 low-confidence, 62 lost; two arrival gaps exceeded 350 ms. No round events were recorded in this capture. Evidence: `docs/validation/arcade-live/combo-retest-summary.json`. Preserve evidence gates; repeat counted three-pair test with stable camera visibility. Software combo regression remains 601 tests PASS; physical combo acceptance remains unverified.

### Arcade live retest — active round, 2026-10-22
Partial observed result: round ran 5.03 seconds, one jab accepted as virtual hit, one guard block. Auto-paused with receiver freshness reason. Subsequent jab and two cross cues were recognized but ignored because the round was paused. Physical action count awaits user confirmation; combo execution gate NOT VERIFIED. Event evidence: `docs/validation/arcade-live/second-attempt-events.json`.

### Arcade tracking interruption refinement — 2026-10-22
Implemented a 750 ms reacquisition interval. Unavailable/unknown observations immediately freeze opponent phase, timer and damage and reject punches; recovery before 750 ms resumes without charging frozen time. Sustained loss remains an explicit Resume pause. Interrupted windup/contact restarts from guard for a fresh telegraph. Countdown freezes through short interruptions, cancels on sustained loss/hidden display. Receiver freshness (350 ms), CV thresholds, model and relay remain unchanged. Paused rounds preserve their remaining active time (the live pilot paused at 55 seconds; it did not finish).
Files: src/game/arcade.ts, src/game/arcade-countdown.ts, src/arcade.ts, tests/arcade-tracking-continuity.test.ts.
Verification: 611/611 tests across 68 files PASS; production build PASS (existing chunk-size advisory). Initial sandbox suite could not bind local gateway; rerun with listener access passed. Independent read-only review found no blocking defect. Live interruption stability and counted combo recognition: NOT VERIFIED, awaiting fresh phone test. Evidence: docs/validation/arcade-live/tracking-continuity-regression.log and tracking-continuity-build.log.

### Completed live Arcade round and guard readability — 2026-10-22
Retrieved completed-round-evidence.json (555 pose samples, 38 events). Live round won with player92/opponent0 at 24.209 active seconds: 18 accepted recognized cues (13 jab, 5 cross),12 landed,4 blocked,2 misses,1 defensive block,1 opponent hit. Final jab-cross executed239ms apart. User reports completed round; exact physical punch count unknown, so recognition accuracy targets remain NOT VERIFIED. End-to-end live short-round completion PASS for this browser session; no new Vega claim.
Fixed player rendering that forced high gloves for every running round. Raised/open guard now moves gloves smoothly between high/inward and low/wider positions; unknown holds prior visual pose. Punch animation remains independent. Opponent blocking gloves close at cheeks; recovery/retreat/hit poses expose a lower/wider guard. No CV/evaluator or combat-rule changes.
Visual pose review screenshots guard-raised.png and guard-lowered.png PASS; these are authored visual review frames, not live phone captures. Full regression611/611 PASS and build PASS. Final live guard visual response and new Vega presentation NOT VERIFIED. Local review harness: docs/validation/arcade-live/guard-visual-review.html.

### Upright player guard — 2026-10-22
Moved raised-guard elbows directly below glove cuffs with nearly matching depth, giving vertical first-person forearms instead of forward-reaching arms. Existing punch envelope still unfolds toward the original extension endpoint; lowered guard and tracking rules preserved. Browser visual review PASS (docs/validation/arcade-live/guard-upright.png); production build PASS. Geometry-only edit: no new automated tests; prior611-test suite is unchanged. Live phone/Vega visual confirmation NOT VERIFIED.

### Live test2 audit and buffered pose transport — 2026-10-22
Evidence: docs/validation/arcade-live/user-live-test-2.json and user-live-test-2-summary.json. Retained600 samples (185 earlier dropped),471 tracked/71 low-confidence/58 lost. Median arrival120.2ms, max239.9ms; no >350ms gaps. All combat lies in399 consecutive tracked frames (~50.7s); low-confidence/lost data is pre/post combat. No evidence of combat connection loss in retained capture.16 accepted recognized cues (12jab/4cross),12hit3blocked1miss, no ignored cues, won at43.766 active seconds. Physical missed-punch count/accuracy unknown.
Found phone skip-while-uploading plus latest-only relay polling discards temporal samples. Added bounded pose batches (8 pending frames,350ms age window), no retries of failed packets; additive /api/frames validates ordered atomic batches and retains32 frames, fresh350ms cursor reads. Arcade consumes ordered unseen frames. Existing /api/frame works unchanged and clients fall back on404/405 for legacy/gateway deployment. No raw video sent; CV thresholds/Full model unchanged. Direct LAN relay restarted on8787. Gateway and old native package continue legacy transport pending separate deployment validation.
Also preserve recognizer's per-hand continuity through opposite-wrist uncertainty and diagnose specific unclear landmarks; defense remains unknown and gameplay frozen on missing required evidence. Elbow-only uncertainty no longer overrides independently visible guard-height evidence; no guard thresholds changed.
Files: src/companion/pose-sender.ts, src/main.ts, src/arcade.ts, src/game/arcade-input.ts, scripts/relay.mjs; tests/pose-sender.test.ts, tests/relay-frames.test.ts, tests/arcade-input.test.ts, tests/arcade-live-test-2.test.ts.
Verification:623/623 tests PASS,71 files; production build PASS (existing chunk advisory). Saved event replay reproduces all16 previously recognized cues. Gate: software PASS; increased live delivery cadence/recognition accuracy and Vega buffered transport NOT VERIFIED. Next: reconnect fresh QR, confirm buffered observations on phone, perform counted jab/cross trials before claiming improvement.

### Automatic three-second guard entry — 2026-10-22
Removed Start round button/lock. Ready screen says GET IN POSITION; with menu closed, game visible and reliable two-hand guard, a three-second countdown starts automatically. Any observed guard drop, uncertainty, menu opening or hidden display resets entry; no banked guard time. Starts with BOX after continuous observed guard. Existing sustained-loss/manual Resume behavior remains explicit. Files: src/arcade.ts, src/game/arcade-countdown.ts, tests/arcade-tracking-continuity.test.ts. Fixed missing type annotation in saved-capture replay test discovered by production typecheck. Verification:624 automated tests PASS; production build PASS; browser idle-entry UI screenshot PASS (auto-guard-entry.png). Live guard-triggered start and Vega deployment NOT VERIFIED.

### Guard display false-drop correction — 2026-10-22
Audited fireroom_trials/fireroom-arcade-live-validation.json.600 retained samples,570 earlier dropped;457 tracked/142 lost/1 low-confidence. All420 retained samples before finish are tracked, no pause events. Loss occurs after finish in this retained window, not evidence of combat disconnect. Result16 punches12landed1blocked3misses; win. Exact physical guard accuracy remains unverified.
Root presentation defect: blocking state open (including not-yet-confirmed hold and lateral excursions) forced both rendered gloves down. Added independent per-hand presentation evidence: within existing eye-height region raises the corresponding glove, existing sustained height deviation (180ms) lowers it; transient/unknown observations hold prior pose. Physical guard hold not confirmed no longer means visually lowered hands. Gameplay blocking/evaluator/thresholds remain unchanged.
Files: src/game/arcade-input.ts,src/arcade.ts,src/graphics/arcade-scene.ts,tests/arcade-input.test.ts,tests/arcade-guard-display-replay.test.ts. Verification627/627 tests PASS,72 files; build PASS. Replay reproduces raised-but-unconfirmed situations and verifies loss emits unknown pose. Gate software PASS; corrected live appearance and native Vega deployment NOT VERIFIED. Evidence guard-drop-capture-summary.json,guard-display-regression.log,guard-display-build.log under docs/validation/arcade-live.

### Reacquisition evidence audit — 2026-10-22
Audited fireroom_trials/fireroom-arcade-live-validation (1).json. Entire combat retained:353 tracked frames, no required visibility failures; one1082.3ms arrival gap at14.448s. Delayed seq574 has only57ms producer advancement from573, followed by593 with1103.2ms source gap: evidence points to delivery/backlog disruption, not model losing body during combat.162 lost frames start2.157s after win. Round wall21.650s vs active20.616s (~1.033s frozen). No hard pause event; grace recovery worked. Exact Wi-Fi vs browser/request scheduling NOT VERIFIED. Preserve freshness/evidence gates; next instrument upload/poll request durations, and label delayed updates distinctly from pose loss. No code/threshold changes in this audit; tests not rerun. Evidence docs/validation/arcade-live/reacquisition-audit.json.

### Transport stall timing instrumentation — 2026-10-22
Added bounded optional phone timing metadata on batch uploads (relative upload durations/status/batch sequence; sampled inference durations; camera callback gaps), validated separately from PoseFrame. Relay attaches latest phone timing records, frame age in its own clock, and request work duration. Controller captures request/header/decode/consume durations, pending polls, poll scheduler gaps, display-frame gaps, visibility changes and tracking transitions; export has transport ring4000 and overflow count, independent of600 poses/200 gameplay events. Phone/receiver clocks must never be subtracted; correlate sequence and relative durations. Failed upload timings status0 include timeout/network/scheduling possibilities; not proof of Wi-Fi failure. Labels distinguish UPDATES DELAYED vs POSE UNCERTAIN. No freshness, recognition or combat threshold change. No video capture/transmission added.
Files: src/shared/transport-diagnostics.ts,src/main.ts,src/vision/camera.ts,src/arcade.ts,src/ui/arcade-validation.ts,scripts/relay.mjs,tests/transport-diagnostics.test.ts,tests/relay-frames.test.ts. 629/629 tests PASS,73 files; production build PASS. Direct-LAN relay restarted; fresh QR prepared. Browser confirms export description includes timing. Actual live stall attribution NOT VERIFIED pending timing-enabled human test. Legacy gateway/native paths retain existing fallback and do not provide phone timing metadata without separate update. Evidence transport-timing-build.log,transport-timing-regression.log under docs/validation/arcade-live.

### Timing capture: RAF/receiver clock race — 2026-10-22
Audited fireroom_trials/fireroom-arcade-live-validation (2).json. Five combat stale transitions follow successful fresh frame polls (seq575,587,665,817,908). Combat uploads median57.6ms/max65.3ms; poll headers median5.1ms/max18.8ms; relay processing median~.05ms. No combat poll scheduler gaps. Example908 arrival175195.2ms but stalecheck175195.1ms: RAF frame-start timestamp is older than an already processed HTTP callback. ArcadeInput correctly rejects backwards time, but controller supplied mismatched timestamp semantics, spuriously resetting motion continuity.
Changed only animation callback to sample current performance.now once per update, matching receiver arrival clock. Preserved350ms freshness/backwardsclock checks. Added replay regression reproducing race and verifying genuine351ms expiration. Independent read-only audit concurs. Files src/arcade.ts,tests/arcade-receiver-clock.test.ts.630/630 tests PASS,74 files; production build PASS. Live smoothness/recognition improvement NOT VERIFIED. Other setup/hidden-page delays remain separate; no blanket network-stability claim. Evidence receiver-clock-audit.json,receiver-clock-regression.log,receiver-clock-build.log in docs/validation/arcade-live.

### Vega QR failed-fetch fix — 2026-10-22
User screenshot shows pairing activation reached failed fetch. Packaged file display does not have an HTTP API origin. Added simulator-local live Arcade target with VDA reverse5173; native wrapper permits this exact loopback development path without external hosted-controller provisioning, keeping hosted HTTPS behavior unchanged. Generated setup supplies phone LAN HTTPS origin and automatically opens Menu/creates QR. No certificate bypass, CORS relaxation, public hosting or CV changes. Files platform/vega/src/App.tsx,platform/vega/src/hosted-target.ts,platform/vega/probe/configure-local-arcade.mjs,platform/vega/README.md.
Verification: wrapper TypeScript PASS; native debug package build PASS; installed/launched on emulator-5554 PASS; device-side GETarcade HTTP200 and POSTapi/session returned valid session PASS. Native screenshot service failed fetching screen, so actual QR visibility and phone scan NOT VERIFIED; ask user to confirm. Simulator-local port reversal must be reapplied after device restart. These are development settings, not a production hosting claim.

### Streamlined Vega activation — 2026-10-22
Audited desired generic Vega GUI-start→app-tile workflow. Removed dependency on restart-volatile VDA reverse by using verified simulator host gateway10.0.2.2:5173. Device HTTP200 verified with no5173 reverse listener. Vite pairing metadata now offers current LAN HTTPS5175 phone origins; local wrapper setup discovers it, opens Menu and creates QR, with build-time origin fallback. Native initial loading,15s timeout, explicit Retry now and3s automatic recovery replace blank error startup; native splash dismissed to expose status. Hosted HTTPS provisioning/certificate restrictions preserved. No CV/gameplay changes.
Files: platform/vega/src/App.tsx,platform/vega/probe/configure-local-arcade.mjs,platform/vega/src/hosted-target.ts,platform/vega/test/App.spec.tsx,vite.config.ts,src/arcade.ts,platform/vega/README.md.
Verification:630 root tests PASS;2 wrapper tests PASS including error→automatic retry→load; native TypeScript PASS; native debug build PASS; web build PASS; latest package installed/launched on VirtualDevice. Device gateway connectivity and dynamic LAN metadata verified. Full cold GUI-restart→tile→visible QR remains NOT VERIFIED by direct visual evidence because simulator screenshot service previously failed; human confirmation requested. Computer services still required: HTTP5173/HTTPS5175/relay8787. Generic Vega CLI cannot boot project-specific host services; offline native app now waits/retries. Evidence activation-*.log in docs/validation/vega-qr. Current README supersedes prior reverse instructions.

### Vega cleartext policy correction — 2026-10-22
User observed ERR_CLEARTEXT_NOT_PERMITTED. Previous device curl200 was insufficient to verify WebView policy. Amazon WebView4.0.2+ docs require explicit manifest network-traffic-policy.cleartext allowlist. Added only10.0.2.2 to simulator manifest; phone remainsHTTPS and no wildcardHTTP/TLS bypass. Native build PASS; packaged aarch64 manifest verified; installed/launched PASS. Actual native runtime now reports loadStart+load for http://10.0.2.2:5173/arcade.html and successful subsequent api/frame(s) polling (count1/30/60), demonstrating WebView startup and initialized pairing path. Visual QR scan/phone session remains NOT VERIFIED. Evidence docs/validation/vega-qr/cleartext-build.log and cleartext-runtime.json. Official source https://www.developer.amazon.com/docs/vega/0.24/develop-your-app-with-webview . Earlier activation gate remains qualified: SDK CLI connectivity did not establish WebView rendering.

### Latest live jab evidence audit — 2026-10-22
Capture fireroom_trials/fireroom-arcade-live-validation (3).json:327 retained combat frames, all tracked; no combat tracking transitions.9jab/4cross recognized, all accepted;12hits/1opponent block/0miss/0ignored. Max combat arrival gap135.4ms; poll22.3ms; upload129.8ms. No captured combat stale race or interruption. Physical counts/missed indices unknown; recognition accuracy NOT VERIFIED. No threshold/code changes justified. Next counted10single-jab trial without crosses; exact missing indices unnecessary if total known. Evidence docs/validation/arcade-live/live-test-3-summary.json. Tests not rerun for read-only audit.

### Confirmed jab trial and final-cross stale-candidate fix — 2026-10-22
User confirms alljabs recognized in file4. These captures contain accumulated multiple rounds, so latest rounds isolated: file4 tenacceptedjabs(9hit1block);file5 latest5jab1cross beforefix. Finaljab356022.2ms followed by visible right-hand excursion with wristconfidence~.995–.998. All155activeframes beforelaterloss tracked; no delivery interruption explains omission. Replay shows earlier unsupported right-hand candidate persists despite stable guard, and1.8sdeadline fires356203.9 duringlaterexcursion.
Added Arcade-only optional rearmSettledGuard (defaultfalse) to shared recognizer; ArcadeInput opts in. Retire only unsupported outward/recovering candidates after300ms independently observed guard and compact both-face-anchor motion under existing thresholds. Guard-settling history starts aftercandidate initiation. Emits guard-adjustment, not a punch; supported movement never retired bythisrule. Coach/default behavior unchanged. Detector versionv9 identifies implementation update.
Final replay retains firsttrialexactly10jab, secondtrial5jab+2cross, finalcross356324.4once. Added realcapturetests and heldoutwardnoduplicate regression; existingnonpunch tests pass.633/633testsPASS,75files; buildPASS; independent review no blocking defect. Live improvement/physical accuracy NOT VERIFIED pending nextcountedcombo test. Files src/vision/movement-cycle.ts,src/game/arcade-input.ts,tests/arcade-settled-guard.test.ts,tests/arcade-input.test.ts,tests/movement-independent.test.ts. Evidence docs/validation/arcade-live/combo-live-4-5-summary.json,settled-guard-regression.log,settled-guard-build.log. No threshold value retuning. Temporary audit harness removed.

### Arcade Milestone B — implementation and interrupted live verification — 2026-10-22
Implemented immediate base damage (jab10/cross14), evidence-only deferred guard/recovery bonuses, clean jab-cross bonus, timed combo HUD, finisher intro/ready/fresh-punch/impact/KO/results flow, remote skip fallback and results statistics. Existing PunchEvent recognition reused; no CV threshold retuning or Coach pipeline changes. Pending evidence cannot mutate paused/tracking-held combat; duplicate IDs/assessments cannot award twice. Graphics use authored restrained cinematic motion.
Verification: final web build PASS (existing chunk-size warning); 659/659 tests PASS,78files with loopback permission. An earlier sandbox run failed gateway listen EPERM, not a product assertion; rerun passed. Browser synthetic presentation screenshots/GIF are under docs/validation/arcade-b and are not physical validation. Vega package installed/launched successfully after boot developer-shell readiness. User confirmed QR pairing and phone camera running. During round the whole simulator exited: SDK status running:false,qemu:-1; no device remained. Cause not established; no native crash evidence attributing this to FireRoom. Live combo/finisher, native performance and remote fallback remain NOT VERIFIED. Gate: NOT VERIFIED pending uninterrupted phone-on-Vega round. No raw camera video transmitted.

### Continuous phone pairing across Coach/Arcade — 2026-10-22
Viewer modes now retain their session ID, phone HTTPS origin and last consumed pose sequence in same-tab sessionStorage. New page attaches to the existing relay session without restarting the phone camera. Recognition/lesson/round state initializes normally; consumed frames are rejected by the restored receiver watermark. Fresh arrival is required before connected status. Explicit Show QR still creates a replacement session. Vega generated automatic startup skips pairing creation when an active pairing has been restored. No raw video, backend changes or CV threshold changes.
Files: src/platform/active-pairing.ts,src/platform/transport.ts,src/main.ts,src/arcade.ts,platform/vega/src/hosted-target.ts,platform/vega/probe/configure-local-arcade.mjs,tests/active-pairing.test.ts.
Verification:662/662 tests PASS (79 files); web typecheck/build PASS (existing bundle-size warning); Vega debug package build PASS (updated package not yet installed/live-tested). Tests cover handoff persistence, malformed/unavailable storage, consumed-frame rejection and fresh-frame recovery. Actual uninterrupted phone-on-Vega mode switch NOT VERIFIED. Pairing retention is same-origin/same-tab, not cross-browser or expired-session recovery. Evidence docs/validation/mode-pairing/.

### Coach practice start/cancel/retry recovery — 2026-10-22
Fixed insecure HTTP viewer correlation-ID creation (randomUUID unavailable), including practice and optional video metadata. Optional video hook failures cannot interrupt attempt start/stop. Disabled controls remain visible; attempt status is visible in the dialogue actions. Cancel, countdown staleness and context cancellation expose Retry. Replayed lesson clears old feedback/result/export permissions. Start ignores duplicate activation while running. Countdown freshness now matches receiver750ms (transport only, no CV thresholds changed). Coach consumes existing buffered /api/frames with latest-frame fallback instead of discarding intermediate poses; pairing metadata prefers phoneHTTPS origin.
Verification:673/673 tests PASS,80files; TypeScript/web build PASS (existing chunk warning). Independent read-only audit confirmed CSS disappearance, missing cancellation Retry, stale review and latest-only pose consumption. Added regressions for cancellation during countdown and recording, stale camera recovery, changed context timer cleanup, insecure-context UUID fallback, failed evidence retry, optional video failures and review reset. Existing jab/cross/combo progression tests pass. Browser inspected tutorial skip→jab controls and disconnected Practise feedback: controls remain available. Actual live phone/Vega practice after fix remains NOT VERIFIED. Evidence docs/validation/coach-practice-recovery.
Proceed paths: Watch→Practise→3s countdown→5s single/8s combo window→feedback→Next only with matched movement+confirmed recovery; otherwise Retry. Cancel/context/stale interruption→fresh tracking→Retry. Lesson selector manually changes lesson without claiming a passed attempt. Beginner guard retains explicit bypass; no fabricated punch pass added.
Gate: automated/UI checks PASS; physical recognition and remote hardware acceptance NOT VERIFIED.

### Human coaching feedback — 2026-10-22
Replaced primary prescribed-practice feedback with encouraging evidence-grounded Coach Atlas language. Praise describes detected movement and wrist return, not perfect form. Sustained opposite-hand deviation gets an actionable cue; brief excursion remains inconclusive and missing evidence is not a technique failure. Main dialogue uses the same summary. Detailed measurements remain expandable; evaluator and thresholds unchanged. Added real-attempt18/13/9 wording regressions and updated intentional UI copy assertions. Physical technique accuracy remains NOT VERIFIED.

### Landmark continuity and settled Coach guard — 2026-10-22
Implemented v10 movement evidence. New temporal continuity screen compares aspect-correct image observations in previous shoulder-span units: wrist/nose motion relative to shoulder midpoint; eyes relative to nose; displacement>=0.5 AND speed>15 spans/s. Missing/context/order/gap cases abstain. Flagged movement candidates and per-hand guard history reset; affected opposite-guard observations become UNKNOWN, never a confirmed drop. Raw input stays unchanged. Existing stricter movement-cycle >15 normalized wrist-speed safeguard remains in place.
Coach prescribed evaluator opts into settledFaceGuard; Arcade behavior retains existing opt-in unsupported-excursion rearm. Require existing bent-arm guard, visible eye+nose, wrist within0.75span of both face anchors and within eye-height limit, >=3 samples spanning300ms within400ms window, both face-relative pairwise spreads<=0.22span. Only retire a supported-looking candidate when no distinct excursion outside BOTH face regions occurred and both face ranges<=0.6 shoulder-relative peak with reliable boundary coverage. This prevents a resting-position shift from swallowing the next punch while preserving held/incomplete outward movements. No automatic successful recovery is awarded by reanchoring.
Replay attempt19 now contains completed cross only and matched sequence/recovery; implausible wrist samples no longer count as reliable guard evidence. This does not guarantee that all later guard-height warnings disappear; a wrist-height proxy can still disagree with fist coverage. Existing genuine jabs/combos, missing recovery, held outward, wrong-hand and wrong-order regressions retained. No raw video transmission.
Independent review prompted per-hand guard-history reset. Cross-baseline phase-start quality screening was tried but rejected after sustained guard-drop regression; only consecutive within-phase samples are quality-screened in guard-height. First sample without a preceding phase observation cannot prove temporal continuity; stable wrong landmarks also remain undetectable by a jump check. Provisional screen is not a validated human speed limit. Live phone/Vega physical accuracy remains NOT VERIFIED.

### Broader v10 video/pose corpus audit — 2026-10-22
Replayed14758 saved samples:21prescribed,6Arcade,20TrackingLab runs/8clips.19prescribed primary results unchanged;19improves;15REGRESSES completed→recovery uncertain. Video association review shows both hands returning after jab+cross; settled reanchor closes early right-hand candidate then opens new candidate from shifted reference and misses its recovery. No new jump-quality flags there. This is lesson-blocking; general v10 regression gate FAIL despite prior688 unit/fixture passes. No production code changed during audit.
TrackingLab20eventlists unchanged;32/32 annotated punch windows and0/8 negative windows eachFull/Heavy (sameclipcorrelated,notnewphysicalaccuracy). Arcade6samecuecounts,onecapturejabtimingshift1503ms notphysicallyverified. Attempt20remainsorderrejection,nopairedvideo. Guardwarningsnotvalidatedbyeventcount. Evidence docs/validation/detector-corpus/RESULTS.md,replay.json,attempt15-video-frames.png. Next:repair settled-guard recovery reference with attempt15 heldout regression while retaining19fix, genuine/incompletepunches and Arcade acceptance. LiveVega NOT VERIFIED.

### Frozen pre-punch guard-height scaling — 2026-10-23
Implemented GuardHeightScale for other-hand guard-height feedback in Coach prescribed attempts and delayed Arcade technique evidence. Only vertical wrist-eye normalization changes. Lateral thresholds, guard boundaries, live glove rendering/block checks, movement trajectory, punch classification and recovery remain unchanged.
Learn from both-hand stable face-local bent-arm guard: existing GuardEstimator qualification, >=3samples/300ms, per-sample shoulder width within10%median, face-relative spread<=.22. Median reference, later qualified holds blend80%previous/20%new. Freeze reference at outward onset using pre-phasehistory only (no future recovery frames). Fallback to instantaneous height scale if no qualified reference; sample metadata heightScale exposes source/width. Reset on capture/stance/session/image size/order/gap>350ms/losttracking, prolonged required-landmark uncertainty>350ms, span<.06. Corroborated distance change requires width AND nose-to-shouldermidpoint length change>25% in same direction, then reacquire. Shoulder foreshortening alone does not reset. Remaining uncertainty: this geometry heuristic is provisional, not calibrated distance measurement, and phase-start/landmark errors can remain.
Validation:696/696 tests PASS,84files; web buildPASS (existing bundle-size warning). Synthetictests cover frozen scaling,lateralunchanged,sustainedlowwrists,fallback,contextloss,closerdistancereacquisition,confidenceexpiry. Independentreview led to existingguard qualification anddistance protections.
Corpuscompare againstpre-scalev10:22prescribedattempts,6Arcadecaptures,20TrackingLabruns/8clips. Zero primary lesson/movement/recovery or guard-verdict changes across22; all6Arcadeand20video-run punch outputs identical. Sustainedguarddrop verdicts retained. Lowinterval durations changed on someattempts.21 remainscannot-assess:maximumheightoffset .516→.540; briefbelowinterval56.5→about57ms. Thus stabilizes denominator but no observed verdict improvement onthiscorpus.19 remainscompletedcrosswithguarddeviation;15recoveryregression persists (unrelatedmovementreferencebug). Savedlandmarkreplay,notfreshMediaPipeinferenceornewphysicalaccuracyclaim.
Evidence docs/validation/guard-scale/replay.json,replay.log,tests.log,build.log,RESULTS.md. FeaturegatePASS automated/regression; overallv10gate remainsFAILdue15;livephone/VegaNOTVERIFIED.

### Opt-in forward3D evidence — 2026-10-23
Implemented defaultoff/shadow/assist controls inCoachdrawer/Arcademenu, persistentperorigin,reloadapply,same-tabpairingretained. Estimatedworld-only ownshoulder-relativecamera-forwarddelta>=.35shoulderwidths plus3Dextensionratio>=.75/gain>=.10,2samples75ms,visibility.65,coverage70%,gap350ms. Guarded-onlybaseline,positiveexperimentrequiresoriginal2Donset,normal2Dcannotbevetoedbydepth. Stableface/settledguardretirementpreserved. Exportsmode+depthdetail; bagobserverreceivesmode. No rawvideotransmission, calibratedforce/contactclaims orguardthresholdchanges.
Verification716/716testsPASS(86files),webbuildPASS; browserselectedshadow→reloadverified→revertedoff.22Coachand6Arcadereplays unchangedfinalprimary/cuestreamresults acrossmodes. Synthetic assistpositivePASS,shadow/offinvariancePASS,missingworldfallbackPASS. No observed realrecognitiongain established;livephone/VegaNOTVERIFIED. Existing15recoverydefect remains. Evidence docs/validation/forward-3d/RESULTS.md,replay.json,tests.log,build.log,settings.png. Optional experimentgatePASS automated;physicalacceptanceNOTVERIFIED;overallv10gatecontinuesqualifiedFAILfor15.

### User-requested guard allowance0.55 — 2026-10-23
Changed same-side wrist-below-eye guard-height allowance0.50→0.55 shoulderwidths. Retained180ms sustainedviolation,0.75lateral,visibility.65,stableheightreference and3Dexperimentsetting. Updated boundary explanations. Decoupled movement/lowering and pre-movement readiness from gradingconstant so their previous0.50interpretation remains; post-drop and scaleacquisition limits unchanged. Intentional boundary test now tests exactly0.55inclusive andepsilonbeyond; feedback test18 nowexpects supportedguard underrequestedallowance.
Replayed23savedprescribedattempts againstpre-editcontrol: zero primary status/sequence/recoverychanges. Otherguardverdictchanges on18,20,21,22 cannot-assess→supported; allprevioussustaineddeviationsremainflagged (durationsmaychange).22 jab/recoveryremaincompleted;rightguardobserved. Existing15recoverydefectunaffected. Savedposesonly,nophysicalaccuracyclaim. Evidence docs/validation/guard055/replay.json,replay.log; finaltests/buildrecordedalongside.

### Restore guard-height0.50 by user preference — 2026-10-23
Restored maxBelowEye0.55→0.50 with180msduration unchanged. Frozen stable-guard shoulderwidth remains active; 3Dmode/movement/readiness/lateral rules unchanged. Restored precise-boundary/feedback expectations to0.50 behavior. Added explicit recordedattempt23 regression:jabandrecoveryremainobserved,oppositehanddeviation459.4ms with stable-guard scale. This is intentional stricterproxybehavior,not validatedphysicalguardcoverage. Earlier0.55decision superseded. Existing15recoverydefect remains.

### Remove speed-based landmark rejection by user request — 2026-10-23
Movementdetectorv11 no longer discards/resetspunches for either newcontinuityjump (.5span+15spans/s) orlegacy wristspeed>15. Jumphelper remains diagnostic only: outcome.evidence.landmarkWarnings and guard-height sample.landmarkWarning. Guard-height samples no longer becomeunknownsolelyforjump. Trackinglost/visibility/invalidframe/session/camera/stance/order/gap/geometry continuity checks remain; guardestimator stillrequires stablehandbeforearming.0.50height/180ms/frozenscale/3Dmodeunchanged. Original2D UI refers to current no3D detector,not restorationofjumprejection.
Validation718/718testsPASS,88files;buildPASS(existingchunkwarning). Addedrecorded25regression:completedjab,confirmedrecovery,warningexportretained,nojumpinterruption.26prescribedreplays:only25primaryresultimproves uncertain→completed;other25primaryresultunchanged.20savedvideotrackingrunsoutputsunchanged.6Arcadereplays:2unchanged(confirmed10jabfile4andsavedcombofile5);filesbase/1/2/3gain1/3/2/1outwardcandidates respectively,65→72total. These7additionalcandidates lackmatchedphysicalcounts/video and mayberecoveredpunchesorfalsepositives;NOTVERIFIED. No claim removal improvesgeneralaccuracy. Current15recoverybugstillopen. Evidence docs/validation/jump-rejection-removed/.


### Guard wording refinement — 2026-10-23
Guard wording: PASS — 8 focused tests across coach-human-feedback and guard-feedback-copy; includes saved attempt26 and missing-evidence separation. Production build PASS. Live UI NOT VERIFIED.


### Hands-free Coach UX milestone — paused by user, 2026-10-23
Implemented automatic lesson coordinator and immersive default UI: welcome/pairing, stance self-confirmation and timed shots, 3s guard hold, automatic jab/cross/combo practice, grounded feedback, bounded retries/reminders, pause/replay/skip and explicit Arcade invitation. Manual diagnostics retained under explicit secondary mode. No CV thresholds or Arcade combat changes. Final tests744/744 (90files) PASS with2workers; TypeScript/Vite build PASS, existing chunk warning. Actual browser synthetic-relay full journey and Arcade session handoff PASS. Fresh actual phone connected and user confirmed skeleton; guard/punch completion live results NOT VERIFIED because user requested pause before reporting. Vega boot attempted but remainedoffline/unresponsive; new-flow native verification NOT VERIFIED. Existing attempt15 detector recovery bug remains. Audit, screenshots, logs and results in docs/validation/hands-free-coach/. Temporary synthetic stream and passive capture stopped; normal app services left running. Resume from live guard hold then punch progression; do not repeat implementation or claim physical acceptance.

### Public release packaging — 2026-10-23
Public565tests/61filesPASS; clean staged export without personal fixtures or generated runtime settings npmci/test/buildPASS; target/default generatorsPASS. Historical full suite and public scope are distinct. Private data intentionally absent; physical/device accuracy and artwork rights unverified. See docs/PUBLIC_RELEASE.md for full evidence and limitations.
Clean exported native wrapper: dependency installPASS (27advisories remain), TypeScriptPASS, Jest2/2PASS, Debug package buildPASS for3architectures. Full original local suite749/749PASS after portable optional fixture lookup. Latest public release index check352files/8.43MiBPASS bounded signature/path scan, not security certification. No newly built public-tree package was installed or physically validated.


## Live walkthrough accepted — 23 October 2026

**PASS — user-confirmed complete live-phone/Vega walkthrough:** guard → jab → cross → jab–cross → Enter Arcade. The user explicitly confirmed this complete sequence after reporting the camera running with a visible skeleton. This supersedes the earlier pending live-graduation status in this report. Native rendering, QR and stance setup were separately captured by the agent; completion of the later lessons and Arcade entry is participant-reported, not an independently reviewed recording of every step.

This acceptance covers the main functional training-to-Arcade journey. It does not establish a measured recognition rate, Cloudflare-specific execution of this latest flow, full fight completion, physical TV remote compatibility, actual Fire TV hardware deployment or novice usability. Practise Again/Return to Main Menu and other unexercised branches retain their prior status. Known detector and dependency limitations remain documented; no thresholds or tests were changed for this acceptance.
