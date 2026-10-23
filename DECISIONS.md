# Decisions

Lead-approved 2026-10-15.

1. **Coach Mode is the critical path.** Defer Arcade, defense, adaptation, ArUco, hooks, unrestricted physics, multiplayer, and other sports until the real Coach Mode gate passes.
2. **Fire OS WebView target.** Official Amazon hackathon announcement permits Fire OS or Vega and web technology. Build a landscape Leanback Android display shell, keeping camera inference on phone. Do not infer Vega support or actual Fire TV performance from desktop rendering or an APK build.
3. **Contract v1 frozen for specialist integration.** `src/shared/contracts.ts` owns PoseFrame, PunchEvent, TechniqueReport, LessonState, GameAction, ConnectionState. Lead approved adding mandatory schemaVersion:1 to GameAction during Phase0 review before external consumers existed. Future breaking changes require lead approval.
4. **Coordinates and clock.** Unmirrored normalized MediaPipe image coordinates; anatomical side labels; explicit orthodox/southpaw stance; mirrored phone preview only. Persist producer logical milliseconds/sequence across restarts, never subtract device clocks. Receiver freshness is local arrival time, relay latest-frame expiry 750ms. No synchronized end-to-end latency claim.
5. **Deterministic vision.** Require observable guard→extension→recovery and confidence-aware reset; no trained classifier. Synthetic fixtures verify logic, not physical accuracy. Normalized extension and technique score never represent punch force or injury risk.
6. **RallyRoom reuse is selective.** Reuse installed compatible libraries and camera lifecycle/diagnostic design lessons. Paddle quaternion calibration and fist-grip rules do not transfer to body-pose boxing. Its pending physical evidence is not a FireRoom validation result.
7. **Pose-only transport.** Trusted-network development relay, cryptographically random session capability links, strict runtime PoseFrame validation, latest-frame storage, duplicate rejection and one-hour idle expiry. No raw camera video upload. QR and production hosting/auth/rate limits remain follow-up work.
8. **Reference animation.** Preauthored translucent arms are teaching guides, explicitly orthodox; no player-calibrated overlay or independently validated anatomical accuracy claim.
9. **Atlas honesty.** Offline deterministic evidence-based feedback and bounded actions work now. Provider boundary and timeout fallback exist, but no live LLM connection or credentials are configured. Provider text is suppressed in favor of trusted report observations pending a grounded provider schema. Prefer Bedrock when supplied; do not fabricate live LLM completion.
10. **Evidence controls gates.** Independent V&V owns tests/validation docs; lead integrates and reports. Software subgates may PASS while full phases remain NOT VERIFIED. Hardware, actual camera footage, deployment, human reference review and physical accuracy need direct evidence.
11. **Reproducible local tooling.** package-lock captures dependency resolution; local node_modules copied from adjacent prototype, no sibling writes. Native Vite config loading avoids config temp-file issues. Clean npm ci remains to be tested independently. Android offline build uses existing SDK35/Java22; artifacts stay outside dist so Vite builds do not erase APK/debug key.

12. **Reference-driven detection update (2026-10-15).** Inspected pinned FormAI (GPL-3.0), AI Boxing Trainer (MIT), and ACM Boxing (MIT). No upstream source or checkpoint copied/executed. Independently implement torso-relative geometry, guard height, timing diagnostics, hysteresis/cooldown, and observed extension-order buffering. Same-frame ambiguous onsets are rejected rather than assigned arbitrary order. PunchEvent timestamp continues to mean emission time, so buffered events can share a timestamp; sequence defines event order. Strongly typed shared contract remains v1, unchanged. Add opt-in local labeled pose trials and deterministic evaluation. ACM deployment is conditional on held-out classification evidence; training/inference label mismatch and preprocessing differences preclude blind checkpoint reuse. See docs/DETECTION_REFERENCE_REVIEW.md and docs/ACM_SEQUENCE_REVIEW.md.

13. **Guard evidence upgrade (2026-10-15).** Replace shoulder-only guard proximity with a conjunction of visible nose-relative proximity, bent elbow, approximate camera-depth consistency and elapsed-time stable motion history. Use explicit guard/not-guard/unknown evidence; unknown face observations never fall back to shoulder proximity or produce technique-failure claims. GuardEstimator has independent per-hand history; PunchRecognizer conservatively invalidates unresolved events when required observations are unavailable. Shared version1 contracts unchanged, internal diagnostics extended. Near/in-front is an estimated camera-facing relation, not calibrated biomechanical fact. See docs/GUARD_ESTIMATION.md. Synthetic fixtures now include an actual face anchor and guard dwell; real camera validation remains pending.

14. **Image/world comparison (2026-10-15).** Lead approves additive optional v1 PoseFrame.worldLandmarks and imageSize with runtime validation, preserving old recordings and image preview semantics. Capture both from the same model result/timestamp; do not fabricate world data. Add explicitly selected image-2d,image-3d legacy,world-3d geometry modes and independent parallel histories. World estimates remain inferred, not physical measurement. Selected-mode scoring resets on mode switch. Export replay compares all3 on identical data; missing world trials are unavailable and excluded from valid missed-event denominators. Preserve oldimageXYZ baseline; label no-depth imageXY limitations. See docs/GEOMETRY_COMPARISON.md.

15. **Prescribed-sequence DTW path (2026-10-15).** Implement bounded attempts against separately reviewed jab/jab-cross references; keep the rule recognizer as a comparison baseline. Internal DTW contracts live in src/vision/dtw/types.ts without breaking shared v1 wire contracts. Alignment uses quality masks, normalized temporal band, run constraints and global endpoints. Completion additionally checks anatomical order, outward trajectory and recovery; form findings remain separate. Guard deviation does not erase otherwise completed movement. Elbow assessment abstains without observability evidence. Timing is reported outside the warping score. Pending candidates, prior user attempts and synthetic tests never become automatic ideal references. Human reviewed MediaPipe references and held-out real evaluation remain required. BoxingVI is supplementary only; rights and compatibility unresolved, no dataset import. See docs/DTW_COACH_MODE.md.

## 16 — Calibrated prompted form assessment (2026-10-17)

Implement the user's requested calibration → prompted jab/cross → separate guard/reach/recovery feedback path as an additive Coach Mode module. The existing recognizer and DTW path remain available as comparisons. Reuse GuardEstimator unchanged, augment it with robust personalized face-relative guard regions, and adapt global low-confidence frames only when each relevant arm's observations independently qualify. Do not invent a classifier.

World shoulder-to-wrist reach uses separate session-scoped arm medians. Reach judgment requires separable deliberately shortened/extended calibration distributions; otherwise UNASSESSABLE. Mid-distribution thresholds, stability, temporal coverage, speed and framing limits are configurable provisional engineering parameters, not scientifically validated technique thresholds. Held-pose separation must be validated on dynamic held-out punches. High visibility never establishes accurate depth, elbow straightness or observed anatomy. No optional trajectory/torso feature is enabled before physical MVP validation.

Lead approves the additive optional v1 PoseFrame.cameraConfigurationId: a bounded nonempty capture-run token generated on camera start, preserved in transmitted/recorded raw observations, and used to revoke calibration on restarts. Existing frames remain valid without it, with restart-detection limitation documented. No existing required field changes. Matching session, stance, dimensions and sustained scale diagnostics also gate calibration; manual placement/target changes require restart. Pose-only storage/export remains explicit; no raw video collection introduced.

Atlas's form path consumes structured assessment only and emits deterministic criterion-grounded offline wording. Prompt replay uses the selected stance and exercise rather than the legacy combination guide. External LLM credentials are not needed for this milestone. Physical accuracy and Fire TV execution remain NOT VERIFIED until direct evidence exists.

## 17 — Guided practice as the default interface (2026-10-17)

User found the prototype confusing. Make connect → setup → practice the primary flow. Show one held-pose instruction and active capture action at a time; allow three seconds to get into position before measurement. Hide practice until setup finishes, use explicit anatomical hand wording and plain result labels, and put legacy/experimental tools behind collapsed details. Keep assessment math, wire contracts and guard estimator unchanged. Optional reach comparisons can still be skipped explicitly, preserving UNASSESSABLE rather than forcing judgment. Ghost demonstrations open on demand. Independent workflow regression tests verify this presentation/state behavior; human usability remains unverified.

## 18 — Preserve completed setup checks during repositioning (2026-10-17)

User explicitly requests that pose changes between checks do not reset setup. Remove inferred shoulder-span camera invalidation from calibration observation. Setup is a sequence of independent saved captures: three seconds preparation, three seconds sampling, commit only the accepted current check. Failed or interrupted captures retry that check while preserving earlier references. UI lists actual saved references; skipped comparisons are not listed as saved. Existing sampling/stability/coverage rules remain unchanged.

This supersedes decisions16–17 and earlier reports where projected shoulder-span changes were treated as configuration changes. Projected span changes can reflect the user's torso rotation. Practice still abstains on uncertain perspective, but it must not mutate or clear saved session calibration. Explicit session/capture-run/stance/resolution changes and manual restart still invalidate incompatible references. Saved checks are session-local; this does not introduce reload persistence or cross-camera reuse.

## 19 — Three default same-position captures (2026-10-17)

Combine camera setup and guard observations into one capture, preserving accepted framing on guard failure. Front/rear reach complete the default three captures. Bent references are opt-in under advanced options; no reach grade is fabricated when omitted. Use a pose-only live/frozen preview to expose what was captured without transmitting/storing raw video or asserting correct form. Keep feet/phone/target consistent and allow ordinary torso rotation. This supersedes the earlier six-default-capture UI; engine reliability thresholds and physical-validation requirements remain unchanged.

## 20 — Hands-free pose checks (2026-10-17)

Per-check buttons forced the user to leave the calibrated position. One initial Start launches10second walk-back and automatic5second preparation/3second captures between checks. Presence loss while walking is distinct from camera-stream staleness; require pose only for capture. Bound same-check retries and make Stop cancel all future transitions. Optional spoken cues supplement visual countdowns without new dependencies. Keep physical accuracy gates and unavailable outcomes unchanged.

## 21 — User-authorized local diagnostic video (2026-10-17)

User explicitly requests automatic video during calibration and practice. Reuse the phone's existing camera stream with video-only MediaRecorder. Keep footage phone-local until explicit download/share; relay only versioned recording commands and existing pose messages. Publish ordered start/stop plus bounded heartbeats, correlate runIDs in pose exports and perclip timing manifests, and describe synchronization as approximate. Retention is in-memory and bounded; no silent claim of saved footage when recording fails or is unsupported. Phone indicator is authoritative; viewer has no recording ACK. This extends the prior pose-only design within the user's newly authorized scope and does not alter technique thresholds or physical validation gates.

## 22 — Dedicated tracking experiment lab (2026-10-18)

Keep tracking optimization outside Coach Mode. Process identical local video timestamps sequentially through Lite/Full/Heavy, retain raw image/world landmarks and device/delegate metadata, and report inference separately from model loading, warmup and decoding. Use distinct calibration and evaluation clips with independent anatomical lead/rear references. Compare aspect-correct 2D and inferred world reach independently; never substitute coordinate systems or equate smoothness/confidence with accuracy. Expose filtering distortion and quality rejection, support visible-joint manual review, and abstain from declaring a winner without physical evidence. Video remains local and downloaded explicitly. Existing public Coach contracts and thresholds remain unchanged.

## 23 — Guided Tracking Lab workflow (2026-10-18)

Show four task-oriented panels rather than six technical criteria at once. Keep capture/video review together, technical controls in optional disclosures and status global. Explicitly distinguish baseline poses from a separate test recording and tell users what to do after each result. Use anatomical stance-aware hand names in prompts. Preserve evidence, defaults, engine checks and ability to revisit steps; disable navigation during work through the existing busy lock.

## 24 — Projected 2D segment length is diagnostic only (2026-10-19)

User authorizes removing fixed arm-segment rejection from Tracking Lab image-2d analysis. Foreshortening means guard projected lengths are not invariant. Preserve per-frame projected-segment-length-change diagnosticFlags without excluding the observation for that reason. Keep missing/visibility and implausible-jump rejection, raw preservation, and provisional world/imageXYZ checks unchanged. Expose segmentLengthPolicy in derived evidence. This additive diagnostic change does not alter shared gameplay contracts or Coach Mode thresholds. Baseline automatic compatibility remains a separate unresolved issue.

## 25 — Separate movement-cycle recognition from extension assessment (2026-10-19)

Add opt-in timestamp-based MovementCycleRecognizer; preserve legacy PunchRecognizer, GuardEstimator, calibration and live Coach/Arcade routing for regression/comparison. Recognition uses initial per-hand guard, torso-normalized temporal wrist departure, supported outward peak and stable return. No straight-elbow or calibrated reach score gate. Missing wrist, gaps, camera/body geometry changes and ordering errors invalidate or qualify cycles; elbow loss after guard does not alone discard wrist evidence. Hand+stance maps to a candidate jab/cross role, not unrestricted intent classification. Feints may be observationally indistinguishable; never label motion completion as verified punch form.

Extension remains a separate optional assessment that abstains without reviewed compatible references and reliable reach. Tracking Lab compares both detectors on identical frames and exports candidates/evidence. Independently reviewed labels and boundaries, not protocol prompts, govern precision/recall/FP/timing metrics. No physical milestone pass without real-camera validation including negatives, occlusion and camera movement.

## 26 — Guard drift and unsupported lowering corrections (2026-10-19)

After user confirmed eight cycles and two non-punch partials, permit guard-origin refresh only on a compact sustained fresh guard, freeze on candidate motion, and require consecutive direction-compatible departures. Treat sustained hand-lowering as uncertain/nonverified-punch evidence rather than failed recovery. Do not infer occlusion from high visibility. Preserve original motion/extension separation and retain short-punch regressions. Development-clip fixes require held-out validation before generalized claims.

## 27 — Separate shoulder articulation from whole-image geometry evidence (2026-10-19)

Store setupgeometryafterinitialguard. Shoulder-onlyscale/rollwarnings disableviewpoint-dependentextensioneligibility butno longerdiscardwristcycles. Retainmaterialwhole-imagegeometryinterruptionwhenvisiblehead/shoulder/hippairrelationshipscoherentlysupportsimilaritytransform, andretainexplicitcameraID/gap/visibilityresets. Singleposecannotidentifycameramotionunambiguously; reportcamera/bodyuncertainty. Versionviewpoint-evidence-v3. No increasetooriginal25%/.3limitssolelytofitrecordings. Targetswithknownmissesbecomedevelopmentregressions;newheldoutvalidationneeded.

## 28 — Prescribed sequence observations before unrestricted recognition perfection (2026-10-19)

User confirms Coach specifies expected movement. Build additive boundedjab/cross/jab-cross evaluator and guidedpreview. Reusev3aslocationaid, ignoreoff-windowevents, independentlyrejectwronghand/order/idle andabstainundertrackinguncertainty. Coaching priorities researchedfromEnglandBoxing/IBAofficialmanuals; numericalvisibility/coverage/timing/guardthresholdsengineeringprovisional,notcoach-certified. Assessinitialguard,oppositeguardduringoutward,wristreturnandindependentlyobservedrecoveredguard. Nooverallcorrect-formscore; optionalextensionabstainswithoutreviewedcompatibleevidence.

Existing constrainedDTW supplementaryonly, disableduntilreviewedreference/currentplacementconfirmed, neverdistance=techniquequality. Existingrefschemahasnostandalonecross;abstainratherthanfliphandorbreakcontract. Preservelegacyformworkflow, trackinglab andArcade; newliveprescribedpanelandlabreplayopt-in. Realcamera/featurejudgmentvalidationstillrequired.

## 29 — Prescribed window controls recovery deadline (2026-10-19)

The livecross returnedinside5sresponsewindow but hitunrestricted1.8scycledeadline beforethefirstreturnobservationwasprocessed. Addoptionalabsoluteproducer-clockattemptDeadlineMs toMovementCycleRecognizer, finite/nonnegativevalidated; defaultunrestrictedbehaviorunchanged. Boundedprescribedevaluator passesendMs+recoverytolerance andcapsattemptduration30s. Recognitionmaywaitforobservedrecoverywithindrilldeadline; timingremainsdescriptive, nooverallformpass. Versionprescribed-window-v2 distinguishesnewassessmentexports. Preserveguard/visibility/gap/wronghand/orderandoptionalextensiongates.

## 30 — Provisional same-side-eye guard height (2026-10-20)

User requested opposite-hand wrist height no more than 0.3 shoulder widths below the anatomical same-side eye, without an elbow-bend requirement. Apply to prescribed opposite-hand feedback, independent of the preserved movement detector and legacy starting/recovery guard estimator. Image coordinates are aspect-corrected; this is a signed vertical offset, not radial wrist-to-eye distance or a metric length. Require reliable eye/wrist/shoulder observations, sufficient coverage and sustained evidence; missing data abstains. Initial guard-relative displacement is descriptive evidence, not an automatic learned ideal guard. The threshold is provisional: normal recording (3) also crosses it, so successful software implementation does not imply validated boxing discrimination. No global recognition threshold relaxation or legacy calibration changes.

## 31 — Requested eye-height limit 0.50 (2026-10-20)

User raised the provisional opposite-hand eye-height limit from0.30 to0.50 shoulder widths after normal-jab false-warning review. Assessment version prescribed-guard-height-v4 distinguishes reports. Sustained180ms, coverage, required eye/wrist/shoulder visibility, aspect correction, elbow independence and movement detection remain unchanged. Historical0.30 results are retained as evidence; new exports use0.50. This is development-case threshold selection, requiring fresh validation before accuracy claims.

## 32 — Invalidate stale punch readiness after hand lowering (2026-10-20)

A sustained observed hand position below the supported punch region must invalidate an armed hand's old guard origin, not only interrupt an already active cycle. A subsequent return establishes fresh guard before a new departure can count. Reuse existing shoulder-relative lower-region boundary and150ms duration; do not raise punch thresholds, change0.50 eye-height feedback or bypass prescribed count/order rejection. Missing wrist observations and timestamp/context resets cannot establish continuous lowering. This addresses guard restoration being counted as a cross; general feint/intent ambiguity remains.

## 33 — Conservative uncertainty for sustained downward guard departure (2026-10-20)

Fresh attempt7 used guard-restoration-v4 yet reproduced a false cross: opposite wrist never crossed the existing0.35 shoulder-relative lowering boundary (maximum0.337). Do not tighten that boundary to fit one recording. Instead, combine sustained wrist-below-eye evidence (existing0.50 limit) with predominantly downward displacement from the saved guard. Treat this as uncertain movement requiring fresh guard, not proof of punch intent or an unconditional claim the motion cannot be a punch. Preserve prescribed count/order and do not discard genuinely completed extra punches. Required visible eye/wrist/shoulders and temporal continuity bound the inference; missing eye evidence cannot accumulate duration.

## 34 — Explicit missing starting-guard feedback (2026-10-20)

After tracking-quality uncertainty checks, a failed prescribed attempt with no eligible movement candidates and no established guard for its first required hand now explains: “Starting guard not observed. Bring your hands into guard and hold briefly before punching.” Recorded warmup guard is considered. Existing observed-guard idle, partial recovery, wrong-hand/order/count and tracking uncertainty messages remain distinct. This is explanatory feedback only; recognition thresholds and completion rules are unchanged.

## 35 — Separate observed lowering without recovery from tracking uncertainty (2026-10-20)

When a failed prescribed attempt has adequate tracking/guard observation coverage, all uncertain candidates are explicitly lowering-related, and the expected hand has supported outward displacement without confirmed recovery, explain: “Outward movement observed, but return to guard was not confirmed. Bring your punching hand back to guard after the movement.” Status remains uncertain and no completed punch/form claim is introduced. Mixed tracking/context failures retain the tracking-uncertainty message. Movement thresholds, count/order checks and missing-starting-guard feedback remain unchanged.

## 36 — Pre-movement guard evidence cannot be supplied retroactively (2026-10-20)

Failed-attempt diagnostics should compare guard timestamps with a reliably observed unarmed movement onset, rather than asking whether guard appeared anywhere. Use a stable visible baseline and sustained displacement; ordinary slow hand-raising into guard must not be labelled a punch. Conservative above-eye excursion can support a missing-pre-movement-guard observation, with movement intent/form still unverified. Late guard is descriptive evidence only. Apply diagnostics to failed matches; delayed legitimate guard acquisition followed by an accepted punch remains valid. Missing data/view changes abstain. No fixed “first second” deadline or new unrestricted punch classification.

## 37 — Separate two-hand guard boundaries from movement matching (2026-10-20)

User requested guard detection at both start and end. Add explicit guardBoundaries findings instead of conflating located motion with a fully correct attempt. Use aspect-correct image-plane same-side eye/wrist geometry, both hands simultaneously held100ms/two observations,0.50 vertical and0.75 lateral shoulder-width limits, no elbow requirement. Bound starting evidence to the500ms immediately before located/onset timing; later guard cannot qualify. Search finishing guard after the final located movement's return or candidate peak. Missing observations/timing abstain. Existing movement count/order and completion contracts remain unchanged; UI states movement location and guard findings separately. Assessment version prescribed-boundary-guard-v6 distinguishes this change. Independent final gate remains PENDING after V&V agent usage exhaustion; do not represent root testing as independent approval.

## 38 — Face-relative corroboration for shoulder-relative movement (2026-10-20)

User requested wrist-to-eye/nose evidence to distinguish guarding-hand shifts from punches. Movement version face-supported-v6 corroborates completed candidates using aspect-correct same-side-eye and nose relative trajectories. Proximity alone never vetoes a punch: both anchors must show low excursion, sustained visibility/coverage, observed cycle boundaries and peak, and substantially less range than shoulder-relative departure. Strong dual-anchor evidence yields guard-adjustment; a single available stable anchor can yield uncertainty only without contradictory visible evidence from the other. Missing anchors do not invent adjustment evidence. Provisional limits/measurements are exported. Physical punch intent, depth and general discrimination remain unverified.

Also correct boundary timing for rejected combinations: prefer actual earliest eligible movement onset over unrelated readiness onset; consider all hands when selecting the latest cycle; never use a peak as a confirmed end. For unconfirmed sequences, a later guard observation is explicitly distinguished from confirmed recovery.

## 39 — Competing post-drop trajectory interpretations (2026-10-21)

Replace categorical restoration locking with continued timestamped trajectory evidence after observed lowering. Compare restoration toward a bounded face guard and settling, supported outward excursion followed by guard recovery, and ambiguous/insufficient motion. A low-start candidate must not fabricate initial guard; use explicit startedFromLoweredPosition/actualStartingGuardObserved evidence. Anatomical hand+stance determines jab/cross role, not apparent screen direction. One camera cannot establish actual forward depth or intent; reachable/feint ambiguities remain uncertain. Preserve ordinary recognizer, face-relative guard-adjustment corroboration, count/order and quality safeguards. Independently assess the opposite hand during a located outward phase.

Prescribed reports now retain supported findings for individually completed movement candidates even if the entire prescription fails. Rendering labels these as individual findings, never confirmation of the whole sequence. Starting/finishing guard statements explicitly refer to endpoint holds, not guard maintenance during all movements. New prescribed assessment version prescribed-competing-v7. No Nova/API execution is part of this deterministic trajectory change.

## 40 — Outward observation and recovery are independent (2026-10-21)

A reliably observed outward phase can support a prescribed jab/cross movement finding even when subsequent recovery is partial or uncertain. Add bounded timestamped movementObservation evidence; never promote every interrupted cycle to a punch. Require corroborated temporal wrist departure relative to original shoulder/eye/nose references, sustained observations and robust peak; preserve adjustment/lowering/quality abstentions. Strict observed hand/order/count matching remains. Missing recovery leaves overall status uncertain while movementSequenceMatched may be true. recoveryConfirmed denotes timestamp-supported wrist return, not independently verified guard form. Opposite-hand guard is assessed during the located outward phase; optional extension remains separate and may abstain. Assessment versions distinguish the semantic change; no global shared-contract break.

## 41 — Progressive disclosure for coach feedback (2026-10-21)

Keep movement/recovery/guard results and concise corrections visible; move existing detailed evidence into a closed native details disclosure. Preserve exact reports/exports and detector behavior. Concision must retain uncertainty and must not turn a camera observation into overall correct-form approval.

## 42 — Main Coach progression follows observed movement completion (2026-10-21)

Reuse prescribed v8 as the main lesson controller rather than routing the new flow through legacy full-extension scoring. User explicitly chooses retry or next after feedback. Unlock progression when prescribed outward sequence and wrist returns are confirmed; neither optional extension nor provisional guard findings imply mastery or block progression. Keep guard corrections visible. Reuse existing local phone recording and exports. Demonstrations use phone stance, with a labelled orthodox default before camera arrives; guide animations remain teaching references. Preserve older tools under advanced controls. No new punch thresholds, AI provider, score contract or FireTV verification claims.

## 43 — Hold aesthetic implementation until target graphics gate (2026-10-21)

Audit preserves production source. Retain FireOS WebView as lowest-change candidate deployment path, conditional on exact deviceWebGL2 andappAPIchecks. Do not inferFireTVsupport from desktopbuild, APKsignature, genericAndroidAVD orVegaChromiumdescription. VegaWebView iscandidatealternative requiringnativepackaging andownruntimeverification. Use lightweightstaticgym/celmaterials/2Dcoachportraitasproposedinitialvisualbudget onlyaftertargettest. Currentgate NOT VERIFIED; targetaccess/HTTPSoriginandremotevalidationneeded. Detailsdocs/FIRE_TV_GRAPHICS_COMPATIBILITY.md.

## 2026-10-21 — Isolated Vega compatibility wrapper

Use installed SDK0.24.12112 vegaWebview template in platform/vega, separate from Android. Load example.com HTTPS and inject a locally bundled existing Three r180 diagnostic after onLoad through the supported WebViewMethods method. Keep TLS validation/mixed-content protection and loopback debugger. Do not promote FireRoom scene/phone gate until actual minimal WebGL2 rendering plus remote evidence exists. Disable Watchman only in this wrapper after observed watch-project stall. Runtime evidence currently NOT VERIFIED; no production workaround or redesign.

## 2026-10-21 — Vega evidence and packaged display adaptation

After user enabled Documents, verify Watchman fsevents and restore default Metro. User approved local Appium2.2.2/driver3.30.0 installation plus supported Node22, and chose packaged production scene instead of hosted URL. Use selfcontained esbuild packaging of unchanged source because ordinary Vite file subresources ERR_FAILED. Use supported Appium screenshots and test-only native loopback telemetry. Rendering PASS does not override confirmed production Dpad FAIL; leave source unchanged and record focused follow-up. Root Vitest scope tests/**/*.test.ts prevents SDK Jest collision without dropping existing web tests. No phone/API or hardware claim.

## 2026-10-21 — Real-phone hosted Vega validation

Use an approved Cloudflare quicktunnel to a restricted loopback gateway; preserve packaged rendering artifact. Native controller authorization provisioned at runtime via local VDA reverse, never embedded in app/publicJS. User explicitly approved temporary controller transit through Cloudflare. Public provisioning blocked; paired-session API routes/body/field limits enforced. Configure Full explicitly in pairing URL while retaining Lite default and all evaluation thresholds. Functional walkthrough confirmed by real user and Vega telemetry/screenshots; keep cancellation/reliability defects separate from technique outcomes and general accuracy. No synthetic poses used.

## 2026-10-21 — Milestone A: anime gym visual boundary

Keep Three.js r180/WebGL2 and the existing first-person camera, animation sampling, ghost-arm material, swing/scoring interfaces and all CV/game/transport/coaching code. New `src/graphics/environment.ts` builds a DOM-free static hierarchy: warm shell and wood/mats, off-axis boxing ring, storage/bench/equipment, original instanced lettering, ceiling fixtures and a central leather bag group. Opaque Toon materials and Basic fluorescent/window panels need no external textures, postprocessing or shadow maps. Lettering is instanced to reduce draw calls. Preserve the existing panoramic demonstration canvas and all dialogue styling.

Vega verification uses the established standalone display-package test path. Temporary wrapper diagnostic-port and hosted-target changes were restored byte-for-byte after building; relay/hosting architecture remains unchanged. This packaged display test does not prove phone pairing, production remote navigation or live camera behavior. Frame-count capture labels can overlap lesson transitions and are not animation phase timestamps. No 30 FPS claim is made.

## 2026-10-21 — Coach Atlas illustrated presentation boundary

Use original built-in image_gen art, not primitive character meshes or unlicensed downloads. Preserve original transparent 1536×1024 PNG in the workspace; encode it in a generated TypeScript data URI for the existing standalone Vega packager. One fixed-yaw two-triangle plane uses authored cel color with alpha-tested transparency, bounded breathing/gesture updates and explicit texture disposal. Pose sampler is deterministic and testable without WebGL. No head tracking, skeleton, cloth, lip sync or new runtime dependency.

Root alone edits main.ts presentation hookup; graphics specialist owns atlas.ts/scene.ts; independent V&V owns B tests/report. Observer reads existing UI output, never modifies lesson logic or grades movements. Instruction is a presentation consequence of replay, encouragement requires existing enabled/visible progression state. Hash-verified protected source remains unchanged. Explicitly accept current inline PNG loading/bundle cost for compatibility and document it; no unmeasured FPS claim. B request authorizes proceeding after A review; stop again for visual approval before C.

### Coach clarity refinement

Prefer more actual display pixels and direct linear sprite sampling over synthetic sharpening or regenerating art. Disable Atlas mipmaps to avoid mip-level blending and reduce texture memory. Enlarge demonstration panel within existing UI; retain camera and character geometry/placement. User clarity request authorizes this panel-size adjustment. Fresh browser proof captured; Vega follow-up remains NOT VERIFIED.

### Composition emphasis pass

Use a modest camera dolly and narrower FOV, not a gym rebuild. Retain the first-person guide's camera-relative origin by shifting its world Z equally with the camera; its animation samples and scoring remain unchanged. Move Atlas inward beside the bag. Desaturate secondary scenery toward warm neutral and apply existing Three.js distance fog; no depth-of-field or fullscreen blur cost. Lower screen remains uncluttered by new UI. Browser framing verified; target hardware performance not measured.

## 2026-10-21 — Milestone C presentation-only integration

Keep original reference animation samplers and stance/speed/event interfaces. Use authored sparse lines rather than triangulated wireframe, white/ivory line materials and transparent body alpha. Fade uses demonstration milliseconds, so speed scaling naturally affects fades; complete hides geometry. Scene cleanup now disposes line geometries/materials too.

VN panel sits in document flow below canvas rather than obscuring the training target. Read-only observers mirror existing text and enabled progression, never infer grades. Summary feedback excludes details diagnostics. Outgoing text clone is aria-hidden and short-lived; new evidence updates synchronously; reduced-motion skips crossfade. Persistent panel avoids hiding error feedback. Existing commands are reused unchanged.

Remote focus restricts choices to rendered controls and includes summary elements. Actual Vega screenshot verified rendering; browser keyboard evidence does not establish native TV D-pad. No new graphics/runtime dependency, image asset or backend change. environment.ts annotation only fixes Material narrowing; no gym redesign.

## 2026-10-21 — Milestone D beginner stance/guard boundary

Add a small onboarding controller ahead of the existing prescribed punch lessons. Stance selection is explicit and self-confirmed, supported by a first-person foot diagram; no automatic feet, knees, balance or chin accuracy claim. Reuse existing same-side-eye `observeGuardHeight` and `assessBoundaryGuard` unchanged. A600ms continuous tutorial task hold wraps their existing100ms detector criterion; this is onboarding duration, not retuned vision thresholds. Per-point confidence permits missing elbows while requiring eyes/wrists/shoulders; lost tracking, stale arrival, stream/order/context changes revoke permission.

Preserve prescribed jab/cross/combo evaluation and sequence logic. Add selected-stance access and mismatch checks; never relabel phone frames. Tutorial restart cancels an active prescribed attempt. Explicit bypass records guard skipped, distinct from observed; optional local completion storage enables returning-user Skip. Demonstration reuses sketch gloves, stable camera, Atlas and VN UI. Guard animations raise both hands without generating punch events.

For live validation user approved a temporary Cloudflare HTTPS tunnel carrying pose/session messages; raw camera video remains on phone. First tunnel attempt was rejected by automatic review pending specific approval; it was not bypassed. Existing protected gateway/relay/runtime controller provisioning reused after approval. Keep aggregate metadata evidence separate from synthetic tests and self-confirmed stance.

### Completed guard is task evidence, not an ongoing input chord

Live user testing showed that requiring hands in guard while clicking Continue makes progression physically awkward. Latch completed600ms observation until Retry/restart; permit lowering hands. Continue records prior supported hold, not current posture. Keep stale/lost-data handling strict before completion. Update tests to reflect this task boundary rather than weakening detector thresholds.

### Explicit practice entry and TV focus behavior

Surface timed punch practice immediately after onboarding. Do not auto-score passive movements or reinterpret a waiting lesson as an evaluator rejection. Keep explicit countdown and existing evaluation windows.

Use normalized remote events with one prevented-default explicit activation. Checkbox arrows navigate rather than trapping focus. Select Up/Down edits options; Left/Right navigates out. Restore focus when stance selection re-renders. Fall back to current lesson/tutorial action when a prior DOM control has disappeared. Test both native and browser paths; unit success alone does not establish Vega key delivery.

2026-10-22: Remote select options are changed explicitly with standard change events because TV WebView native popup behavior is unreliable. Select confirms and advances focus; vertical arrows escape single-line text without affecting cursor editing. Do not infer native PASS from DOM-only browser tests.

2026-10-22 Coach presentation: reparent actual controls within original lesson roots instead of proxy buttons or new state. Hide prototype panels in a focus-isolated setup drawer. Render existing grounded messages in bottom VN overlay. Preserve phone-specific layout and all evaluator/network handlers.

2026-10-22 Atlas beginner intro: use two pre-authored transparent illustrated poses and simple camera interpolation, preserving existing lesson reducer/evaluator. Authored teaching dialogue temporarily owns VN display; final player action releases it back to existing stance self-check and guard practice. Guard sampling pauses while teaching; no cinematic event counts as observed technique.

2026-10-22: Guard demonstration uses upright gloves throughout the rise and holds the final pose for3seconds before the existing fade; punch poses and guard detector unchanged.


2026-10-22 Bag feedback: emit once on supported outward movement, independently of final recovery/technique scoring. Shoulder foreshortening alone limits extension assessment and must not veto otherwise supported 2D movement. Require existing movement evidence, both face anchors and confidence; keep coherent-camera-motion resets. Dedupe attempt/session/camera/hand/departure identity and suppress legacy guided recovery visuals. Reaction amplitude is authored gameplay feedback, never measured force. First physical test failed to fire; corrected live retest remains pending.


2026-10-22 Arcade assessment: use supported outward movement as a separate early gameplay input, not a falsely recovered PunchEvent or a technically-perfect-form requirement. Preserve existing Coach thresholds and prescribed deadlines. Source recording reuse must deduplicate clip IDs across sampling/model runs; saved-input replay does not verify actual Arcade resolution, live latency or Vega. See arcade-input/REVIEW.md.


2026-10-22 Arcade A: separate Vite entry preserves Coach UI/state/evaluator. Early supported movement is an internal Arcade input, not a recovered PunchEvent. Recognition emits identity once; combat decides authored range,block,damage and cooldown. Reliably visible unheld/moving guard is open, whereas unavailable geometry is unknown and pauses without damage. Arrival clock measures freshness, producer clock orders motion. Resume after interrupted attack re-telegraphs. Optional local recorded-input review is persistently labeled. Standalone Vega build validates rendering/remote only; hosted phone round remains unverified.


2026-10-22 Arcade rival art: choose connected articulated procedural anatomy because no reusable rigged asset exists locally; preserve combat state ownership and source recognition. Shape/animate real3D limbs, render authored event-driven player fists, and keep guard face opening readable. Use warm matte toon materials, static texture wear and layered grounding shadows; no postprocessing or dynamic shadows. HUD overlays are conditional, menu isolates remote focus, local countdown gates engine start and cancels safely. Final art acceptance is human review, not inferred from unit tests. See arcade-rival/REVIEW.md.


2026-10-22 Live Arcade combination fix: cooldown is per punch type/stance-mapped hand, not global, because recognized opposite-hand events at~240ms were incorrectly suppressed. Preserve280ms same-hand limit, event identity dedupe and all evidence gates. Player-hand playback channels are independent to retain recovery overlap. Physical acceptance still requires new live retest; saved logs prove suppressed events, not accurate intent or missing-event causes.

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

### Confirmed jab trial and final-cross stale-candidate fix — 2026-10-22
User confirms alljabs recognized in file4. These captures contain accumulated multiple rounds, so latest rounds isolated: file4 tenacceptedjabs(9hit1block);file5 latest5jab1cross beforefix. Finaljab356022.2ms followed by visible right-hand excursion with wristconfidence~.995–.998. All155activeframes beforelaterloss tracked; no delivery interruption explains omission. Replay shows earlier unsupported right-hand candidate persists despite stable guard, and1.8sdeadline fires356203.9 duringlaterexcursion.
Added Arcade-only optional rearmSettledGuard (defaultfalse) to shared recognizer; ArcadeInput opts in. Retire only unsupported outward/recovering candidates after300ms independently observed guard and compact both-face-anchor motion under existing thresholds. Guard-settling history starts aftercandidate initiation. Emits guard-adjustment, not a punch; supported movement never retired bythisrule. Coach/default behavior unchanged. Detector versionv9 identifies implementation update.
Final replay retains firsttrialexactly10jab, secondtrial5jab+2cross, finalcross356324.4once. Added realcapturetests and heldoutwardnoduplicate regression; existingnonpunch tests pass.633/633testsPASS,75files; buildPASS; independent review no blocking defect. Live improvement/physical accuracy NOT VERIFIED pending nextcountedcombo test. Files src/vision/movement-cycle.ts,src/game/arcade-input.ts,tests/arcade-settled-guard.test.ts,tests/arcade-input.test.ts,tests/movement-independent.test.ts. Evidence docs/validation/arcade-live/combo-live-4-5-summary.json,settled-guard-regression.log,settled-guard-build.log. No threshold value retuning. Temporary audit harness removed.

### Arcade B combat evidence and cinematic boundaries — 2026-10-22
Base damage applies immediately at accepted recognized contact; technique evidence only adds validated bonuses later. UNKNOWN never fabricates failure or removes base damage. Combo uses active gameplay time; producer timestamps establish evidence ordering only. Finisher requires a fresh recognized punch, with explicit skip/timeout avoiding a fabricated physical strike. Browser authored review is labeled synthetic; native live gate stays NOT VERIFIED after simulator process exit.

### Mode switch camera continuity — 2026-10-22
Reuse the same relay pairing across viewer navigation using tab-scoped sessionStorage. Persist the consumed sequence to reject old packets after destination recognition resets; do not persist detector/round state or claim connected until fresh data arrives. Explicit re-pairing remains available. Scope is same viewer origin/tab; phone keeps its companion capture running.

### Coach practice recovery boundaries — 2026-10-22
Recording IDs are correlation metadata, not authentication; use HTTP-compatible ID creation and isolate optional video hooks from lesson lifecycle. Keep disabled controls and explicit attempt status visible. Cancel/stale/context interruption restores a new Retry, never an assessed pass. Buffer existing relay frames to retain movement evidence without retuning evaluator. Next remains gated on observed movement and recovery; manual lesson selection stays explicit.

### Encouragement without unsupported form grades — 2026-10-22
Human coaching copy can praise detected movement, wrist return and specific supported guard checks. It must not claim perfect overall form; brief low-hand observations remain distinct from sustained drops and tracking gaps. Thresholds remain half a shoulder width below the same-side eye, broad lateral0.75, sustained low180ms.

### Conservative landmark continuity and guard reacquisition — 2026-10-22
Keep raw poses, evaluator sequence criteria and physical limitations intact. Treat temporal discontinuities as unknown and reset affected-hand references. Enable supported-candidate settled-face reanchoring for prescribed Coach only, requiring both face anchors, observed guard300ms and movement/body corroboration; proximity alone cannot discard a real incomplete punch. Retain existing Arcade path and shared wrist-speed guard. Preserve known sustained low-hand test rather than forcing cross-baseline screening.

### Broader replay supersedes narrow v10 acceptance — 2026-10-22
Do not infer general detector acceptance from688 passing tests. Cross15 recovery regression surfaced in broader recorded corpus; record FAIL and preserve evidence. Audit reuses saved landmarks (no fresh model inference) and distinguishes exported labels from physically verified counts. Retain current code pending a scoped, regression-tested reference-recovery repair rather than silently ignoring incomplete movements.

### Stabilise vertical guard scale without changing punch geometry — 2026-10-23
Use a pre-punch median width from independently qualified two-hand guard, freeze through outward assessment, and expose fallback/reference metadata. Relearn only at stableguard; reset on corroborated distance change and capture/tracking discontinuity. Keep lateral/liveblocking/trajectory normalization unchanged to isolate effect. Corpus shows no verdict gain; do not claim smoothing resolved21or15.

### Reversible world3D corroboration experiment — 2026-10-23
DefaultOff;Shadowrecordsbutdoesnotalterrecognition;Assistmaycorroborateexisting2Dcandidates. Retain original guard-adjustment/retirement and recoverygates; never count camera-depth alone. Use guardedworldbaselines and sustainedforward+reachgain, noimageZfallback. Mode captured inexports;UIrollbackrestorescurrentpre-experiment2Dwithoutcodeedits. No claimed realaccuracygainbeforelivevalidation.

### Guardheight allowance0.55 by explicit userrequest — 2026-10-23
Change gradingthresholdonly, retain180ms and lateral0.75. Preserve previousmovement/readiness0.50references withseparateconstants toavoid accidentalrecognitionretuning.23recordedattempts show4borderlineotherguardverdictimprovements,noprimarycompletionchanges. This is requested tolerance,not a validated boxingstandard.

### Supersede0.55 with0.50 — 2026-10-23
User explicitly prefers catching low wrists over reducing borderlinewarnings. Restore0.50guardheight,retain180ms andfrozenreference. Attempt23 flags459.4ms sustainedlowwrists;thisdoesnotclaimoverallformfailure.

### Jump speed becomes warning-only — 2026-10-23
User explicitly requested removal afterfastjab25crossed15.8spans/s. Remove speed-based hardreset and speed-onlyguarduncertainty; retainmetadata forlateraudit. Qualityvisibility/gap/context safeguardsstay. This prioritisesnotdiscardingfastmovement,but7additionalArcadecandidatesareunverifiedandmustbephysicallycountedbeforeclaimingaccuracygain. v11identifieschangedbehavior.


### Guard wording refinement — 2026-10-23
Use encouraging brief-dip wording only for reliably observed short height excursions; do not call lateral displacement or missing landmarks a brief dip. Keep 0.50 height and 180ms detector criteria unchanged.


### Hands-free lesson ownership — 2026-10-23
Use one epoch-scoped coordinator for default lessons; preserve existing evaluator and bounded recording controller as subordinate attempt service. Guard hold is3s source-time with no uncertainty grace; unknown tracking pauses without counting loss time. Keep explicit stance confirmation and Arcade entry. Preserve manual controls in secondary explicit mode. User paused live validation; no physical/Vega acceptance claim.

## Public release packaging — 2026-10-23

Publish source, lockfiles and markdown documentation while excluding participant camera/body data, runtime authorization, local targets and generated binaries. Public tests run without private fixtures; the30mixed/private-fixture files remain unchanged in intent and opt into the original full local suite through test:private. This is a coverage distinction, not a physical-validation claim or relaxed detector threshold. Generated Vega imports are bootstrapped by vega:prepare, then configured for the user's current hosted or LAN origin. No project license or artwork redistribution permission is invented; provenance/owner decisions are explicitly pending. Cloudflare remains a development tunnel to the local restricted gateway, not a deployed cloud compute backend.


## Live walkthrough evidence attribution — 23 October 2026
Record full guard/jab/cross/jab–cross/Enter Arcade journey as PASS based on explicit participant confirmation. Distinguish this functional result from independent recorded review, generalized physical accuracy, Cloudflare-specific execution, untested branches and hardware claims. Earlier pending reports remain historical rather than being silently rewritten.


### MIT license — 23 October 2026
User selected MIT. Added LICENSE for original FireRoom code/documentation, copyright2026FireRoom contributors; updated package metadata and current release guides. Third-party licenses preserved, Atlas artwork excluded pending provenance/redistribution confirmation. Documentation/metadata-only change; no gameplay changes, no remote push.

### Artwork publication and hosted recovery — 23 October 2026
Owner explicitly confirmed project-generated artwork may be published; keep it outside code MIT terms and record provenance. Hosted retry reacquires controller authorization instead of retaining failed/stale startup credentials; diagnostics absence is recoverable503. No CV or gameplay scoring changes.
