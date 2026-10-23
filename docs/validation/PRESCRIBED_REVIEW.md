# Independent prescribed-coaching review

Date: 2026-10-19. Independent V&V; implementation owned by other agents.

## Gate

Automated component gate: **PASS** at reviewed snapshot. Physical coaching validity, recognition generalization, real-phone usability, and Fire TV execution: **NOT VERIFIED**. This milestone adds an optional bounded prescribed evaluator; it does not establish overall correct form or replace the existing Coach/Arcade routes.

Evidence: `tests/prescribed-independent.test.ts` **16/16 PASS**. Full regression **376/376 PASS**, 39 files. Production build **PASS**, 94 modules. Main bundle 545.84 kB, retaining the existing size advisory. Lead should rerun appropriate checks after further integration edits.

## Acceptance checks

- Synthetic correct wrist-motion attempts match the configured hand/sequence; idle, wrong anatomical hand, wrong jab-cross order, and attempts outside the bounded window do not match.
- Explicit finite reaction/recovery tolerances bound the eligible attempt. No convenient unrestricted subsequence search substitutes for the prescribed window.
- Initial guard, opposite-hand guard, return to the origin region, independently observed recovered guard, and optional extension evidence remain separate. Matched movement never upgrades `formStatus` from `NOT VERIFIED`.
- Opposite-arm occlusion yields `cannot-assess`; movement loss yields uncertainty. A missing initial elbow cannot be graded as a technique rejection because it prevents initial guard observation.
- Sustained observed opposite-hand guard deviation can be reported separately from successful movement recognition; brief guard-history warmup/adjustment does not establish a sustained guard drop.
- Source pose observations remain unchanged.
- DTW is disabled by default. Reviewed metadata alone is insufficient: independent review confirmation and current viewpoint compatibility are required. Cross is not silently substituted with a jab reference. Malformed reference camera metadata cannot crash the check.
- Optional DTW cannot override rule recognition or generate an overall technique grade. Existing DTW amplitude rejection can disagree with recognized shorter motion; the report explicitly preserves that distinction.

## Defects raised during independent review

1. Missing elbow observations initially caused a no-match technique rejection despite unavailable initial-guard evidence. The engineer added expected-hand guard-observability handling; independent regression now passes.
2. DTW accessed reference camera-placement `.trim()` before validating imported metadata. The evaluator now validates before use; malformed-metadata regression passes.
3. Recovery initially reused movement-region return as its sole support. It now exposes `returnToOrigin` separately and requires independently observed guard for recovered-guard support.

## Limits

Visibility is a model estimate, not position accuracy. An occluded but confidently misplaced wrist can still produce a false cycle. Reaches/feints may resemble punches. Per-feature observability and abstention improve the honesty of feedback but do not solve landmark errors or intent recognition.

The 180 ms sustained guard-deviation duration, 70% coverage rules, wrist-region thresholds and window tolerances are engineering thresholds, not boxing-coach-validated limits. Guard checks cover the measured outward interval up to the detector's robust peak; they do not certify all subsequent frames or the full boxing technique. Optional extension requires compatible reviewed references and reliable observed features; it cannot certify a hidden elbow. DTW similarity is not biomechanics or overall technique quality.

Required next evidence: held-out synchronized phone video/pose attempts with reviewed hand, sequence and temporal boundaries; correct and short punches; wrong order; guard drops; idle/reach/feints; elbow/wrist occlusion; tracking loss and viewpoint changes. Review criterion-level errors independently before enabling stronger coaching claims. No new physical accuracy targets are claimed from synthetic fixtures.

## Integrated live/lab review

Final integrated snapshot: independent suite **20/20 PASS**, total **380/380 PASS** across 39 files; production build **PASS**, 95 modules. Main bundle 549.72 kB retains the size advisory.

Source reviewed: `game/prescribed-coach.ts`, `coach/prescribed-feedback.ts`, `lab/prescribed-panel.ts`, and `main.ts` hooks. Live attempts use the existing pose receiver and practice recording-control callback. The opt-in panel starts a three-second countdown, captures a bounded five/eight-second attempt plus recovery allowance, exports raw poses and criterion reports, and keeps the legacy workflow available. Lab export recalculates the selected bounded attempt; optional DTW remains separately gated.

A lifecycle defect was raised: camera restart/context changes with a lower producer timestamp could previously be silently dropped from captured frames, allowing an old-context assessment. The live controller now binds session/stance/camera context at start, cancels on context/order changes during countdown or capture, clears history, stops the matching recording, and removes its pagehide listener on disposal. Two independent fake-timer/controller tests verify countdown and capture cancellation issue the stop callback for the same recording ID. These are lifecycle tests, not proof that actual phone MediaRecorder received the command.

Additional tests distinguish returning to the wrist-origin region from independently observed guard when elbow recovery evidence is missing, and verify evaluator abstention on session/camera/stance changes. Feedback remains per criterion, uses attempt-relative timing, and does not issue an overall form PASS. Root browser mount/control checks are reported separately; this review did not exercise real camera/video synchronization, cloud coaching, physical usability or Fire TV.

Integrated automated gate: **PASS**. Real-phone complete walkthrough and independent physical coaching validation remain **NOT VERIFIED**. Eight window matches and an idle rejection from a previously reviewed recording are development evidence, not new generalization or criterion-accuracy ground truth.

## Guided speech review

Independent speech/controller suite covers countdown 3/2/1; orthodox and southpaw jab-cross hand instructions; toggle-off silencing without stopping recording; Stop removing delayed Go cues; absent SpeechSynthesis visual fallback; matching recording stop followed by completion speech; and cancellation exceptions not blocking cleanup. A defect was found: `speechSynthesis.cancel()` could throw before Stop cleanup. Root wrapped cancellation in try/catch/finally; the independent regression now passes.

Current independent prescribed suite **27/27 PASS**, full suite **387/387 PASS** (39 files), production build **PASS** (95 modules). Main bundle 550.82 kB retains the existing advisory. Voice changes do not alter detection thresholds or assessment logic. These are fake-timer/API lifecycle tests; audible speech availability, volume, browser audio policies, real utterance timing and actual phone recording remain **NOT VERIFIED** pending a physical walkthrough. Automated voice gate: **PASS**.

## Prescribed deadline correction

Version `assessmentVersion: prescribed-window-v2`. The explicit prescribed window and recovery allowance now supply an absolute producer-clock deadline to the movement detector. The unrestricted detector's default 1.8-second cycle timeout remains unchanged. Configurations longer than 30 seconds or nonfinite deadlines are refused.

Independent tests verify a supported slow cross taking over 1.8 seconds can complete inside its bounded attempt while the same stream still times out in unrestricted recognition; no recovery beyond the prescribed deadline is borrowed; missing observations cannot be bridged; wrong-hand rejection remains; excessive windows and invalid deadlines abstain/reject configuration. Earlier sequence-order, tracking, lifecycle and feature-separation tests remain passing.

Source replay of the user's two saved live exports now matches both movements. Jab retains observed initial/opposite/recovered guard and region return, with optional extension unassessable. Cross returns to its origin at 77126.6 ms after departure at 75259.8 ms (1866.8 ms), confirms held recovery by 77278.5 ms, and likewise reports guard/recovery support separately from unassessable extension. These landmark-supported observations do not establish physical correctness without matching video.

Independent suite **30/30 PASS**; full regression **393/393 PASS** across 40 files; build **PASS**, 95 modules. Main bundle remains 550.82 kB with the size advisory. Automated corrective gate: **PASS**. Physical coaching accuracy and new real-phone walkthrough: **NOT VERIFIED**.

## Same-side eye-height criterion v3

2026-10-20. Assessment version `prescribed-guard-height-v3`. Only prescribed opposite-hand assessment changes: same-side anatomical eye 2/5 and wrist 15/16; signed image-down distance normalized by aspect-correct shoulder width; at most 0.30 below-eye offset; broad lateral compatibility; sustained 180 ms violation and sufficient observed coverage. Elbow angle/visibility are excluded from this feature. Legacy initial guard, recovery and movement recognition remain unchanged. The threshold is user-requested engineering policy, not physically or coach validated.

Independent source review found two issues and the engineer corrected them: global `low-confidence` must not veto a locally observable eye/wrist feature merely because an elbow is hidden; and an incompatible far-lateral hand must abstain rather than automatically become a height-drop warning. Eight new independent tests cover anatomical eyes, mirrored image reflection, signed offsets, decoded aspect, inclusive 0.30 boundary, missing-eye/gap continuity, coverage, lateral abstention, elbow independence and baseline/source preservation. Existing tests changed only where the feature contract changed: opposite-occlusion fixtures now hide a wrist rather than an intentionally unused elbow, version literals now identify v3, and the earlier recorded jab retains movement/recovery while its new height check abstains instead of retaining obsolete legacy guard support.

Automated gate **PASS**: 401/401 tests, 41 files; production build **PASS**, 96 modules. Main bundle 551.08 kB retains the size advisory. No implementation files were edited by V&V.

Independent development replays retain completed movement for all six saved live attempts. Opposite-height outcomes: original jab cannot assess; cross (1) cannot assess; cross (2) deviation for 660.7 ms; normal jab (3) deviation for 621.1 ms; deliberate large drop (4) deviation for 455.8 ms; subtle drop (5) deviation for 460.7 ms. The normal (3) estimated offsets span 0.206–0.336 shoulder widths; sustained late samples slightly exceed 0.30. Its previously reviewed video showed the opposite hand remaining near the face. This is an apparent over-sensitive warning on the normal case and an open coaching regression, not evidence to silently tune the requested threshold. A wrist-height rule does not by itself certify an incorrect guard. Cross (2)'s new warning also lacks video confirmation in this review.

Full measurement samples and limits: `docs/validation/prescribed/eye-height-v3-replays.json`. Reliable physical coaching gate remains **NOT VERIFIED**, with the normal-case warning explicitly unresolved. Next step is independent wrist/eye labeling and coached guard-height acceptance criteria across separate held-out attempts; do not claim the new rule is generally more accurate merely because it flags the intended drop examples.

## User-requested 0.50 eye-height limit, v4

Assessment version `prescribed-guard-height-v4` changes the requested vertical allowance from 0.30 to 0.50 shoulder widths. Independent test edits are limited to threshold-specific offsets and version contracts: inclusive boundary now tests exactly 0.50, violation/gap fixtures use 0.60, signed/body-coordinate geometry remains unchanged, and guard-deviation fixtures are deliberately beyond the new limit. The recorded earlier jab's new expected support follows actual v4 evidence; movement, recovery, default timeout and context protections remain tested.

Independent development replays: original jab and cross (1)/(2) plus normal jab (3) all report opposite-hand support. Large drop (4) remains deviation for 227.5 ms; subtle drop (5) remains deviation for approximately 306.3 ms. All six movements remain completed, extension cannot assess. Thus the known normal-case warning is removed on this development example while both reviewed drop examples still flag. This user-directed threshold adjustment is not a held-out accuracy improvement; a wider region could miss smaller drops elsewhere.

Full evidence: `docs/validation/prescribed/eye-height-v4-replays.json`. Automated corrective gate **PASS**, 401/401 tests across 41 files; production build **PASS**, 96 modules, unchanged 551.08 kB main-bundle advisory. Physical coaching accuracy, sensitivity/specificity and new phone validation remain **NOT VERIFIED**.

## Armed-hand restoration correction

Detector version `guard-restoration-v4` invalidates an armed hand's old guard reference after the existing below-supported-shoulder-region condition persists for 150 ms. A restored hand requires fresh observed guard before a subsequent outward cycle. The exact prescribed completed-count matcher remains unchanged; a real additional opposite-arm cycle still rejects a one-jab prescription.

Independent tests cover lowering/restoration without a false completed cycle, fresh stable guard followed by a real recognized punch, a brief low observation not accumulating a sustained hold, missing wrist evidence and large timestamp gaps clearing continuity, genuine jab-cross order, and strict rejection of an actual additional cycle. Re-arming requires fresh stable guard; one newly returned frame is deliberately insufficient.

Independent prescribed replays 0–6 all remain completed. In attempt (6), the false extra right restoration cycle is removed; the left jab is retained and opposite guard deviation is now available (772 ms), instead of all feedback being suppressed. Earlier normal/drop outcomes remain: normal (3) supported; drop (4) 227.5 ms; subtle drop (5) 306.3 ms. Full-model lab recordings 5, 9, 10 and 11 all retain eight completed cycles, four per hand; lab11's ninth return-from-behind-body completed candidate is removed. Remaining non-completed partial/adjustment candidates in lab9/lab11 are explicitly unresolved. All replay source data remained unchanged.

Evidence: `docs/validation/prescribed/guard-restoration-v4-replays.json`. Automated corrective gate **PASS**, 405/405 tests across 41 files; production build **PASS**, 96 modules, unchanged 551.08 kB main-bundle advisory. Physical validity, general false-positive rates, and new real-phone walkthrough remain **NOT VERIFIED**; these are development-case regressions, not held-out generalization proof.

## Downward low-eye movement and restoration lock, v5

Detector `guard-lowering-v5` adds conservative abstention when displacement from the original guard is predominantly downward (at least the existing 0.22 shoulder-span departure and at least its horizontal displacement), with a visible same-side eye and wrist more than the requested 0.50 shoulder widths below it for 180 ms. The earlier shoulder-level lowering rule remains. Active motion becomes **uncertain**, not a confirmed non-punch; armed lowering invalidates old guard evidence. After either invalidation, fresh visible eye-height-compatible guard is required for at least two observations over 100 ms and existing GuardEstimator confirmation. Missing eye evidence resets that restoration hold but preserves the lock.

Independent tests cover sustained low-eye downward motion above the old shoulder cutoff; missing-eye continuity; brief excursions; horizontal and upward punch preservation; no restoration partial while the hand stays low; fresh guard then a genuine punch; and missing eye resetting, rather than clearing, the restoration lock. Existing missing/gap, strict count, wrong-hand and combo-order tests remain passing. A new test exposed no source issue after the final lock change; an earlier synthetic rearm fixture was reviewed for its actual stable-guard interval, rather than relaxing the guard requirement.

Final source replay 0–7 retains all prescribed main movements as completed. Attempt (7) now contains one completed left jab plus an **uncertain** right downward movement; the false completed cross and the intermediate later partial are absent. Opposite guard deviation is 198.3 ms. Attempt (6) retains one completed jab with 772 ms guard deviation. Earlier normal (3) remains supported; drops (4)/(5) remain deviations. Full-model lab recordings 5, 9, 10 and 11 still each contain eight completed cycles, four per hand. Source inputs remain unchanged; remaining unrelated partial/adjustment candidates in older lab recordings are not claimed solved.

The final post-lock artifact `docs/validation/prescribed/guard-lowering-v5-replays.json` replaces the preliminary pre-lock replay and no longer lists a user7 later partial. Automated corrective gate **PASS**, 412/412 tests across 41 files; production build **PASS**, 96 modules, unchanged 551.08 kB main-bundle advisory. Physical intent classification, general accuracy and coaching validity remain **NOT VERIFIED**. These recordings have informed implementation and therefore are development regressions, not held-out validation.

## Starting-guard explanation

Read-only source review and six independent tests verify the more specific missing-starting-guard message for saved attempt (8). The condition applies only after tracking/guard observability checks, when there are no eligible outcomes and no observed starting-hand guard through the attempt. Missing elbow/wrist evidence remains uncertainty; idle with a valid guard retains generic no-sequence feedback; wrong-hand and incomplete-recovery cases retain their own explanations. The saved export is unchanged, and no recognition thresholds or form claims change.

Automated messaging gate **PASS**, 418/418 tests across 42 files; production build **PASS**, 96 modules, unchanged 551.08 kB main-bundle advisory. Actual physical starting posture and user comprehension remain **NOT VERIFIED** by these automated tests. “Not observed” describes available camera evidence rather than a claim that the user did not physically hold guard.

## Recovery uncertainty explanation

Five independent tests verify the wording-only change for saved attempt (9): supported outward observations followed exclusively by lowering-related uncertainty on the expected hand now explain that return to guard was not confirmed. The status remains **uncertain**, movement remains unconfirmed, and no physical failed-recovery claim is introduced. Actual tracking loss or timestamp gaps retain the general tracking/viewpoint uncertainty explanation. An opposite-hand-only lowering cannot trigger the instruction for the prescribed hand. A matching completed jab retains its criterion reports.

Source data remain unchanged. Automated messaging gate **PASS**, 423/423 tests across 43 files; production build **PASS**, 96 modules, unchanged main-bundle advisory. Physical cause of the unconfirmed return and user comprehension remain **NOT VERIFIED**; the message reports an observation limit rather than proving the hand failed to return.

## Temporal pre-movement readiness diagnostic

Assessment `prescribed-readiness-v5` adds optional readiness evidence only after a failed prescribed match. It uses a compact stable low-hand baseline and a supported excursion beyond the eye region before guard, rather than a fixed early-time cutoff. A later observed guard does not retroactively establish starting guard before that excursion. It remains an image-movement diagnostic, not proof that a punch was thrown or intended.

Independent review found the first helper used an overly long noncompact history instead of its valid compact stable suffix; the engineer corrected baseline selection without loosening thresholds. The failed-attempt report initially attached evidence without selecting its specific explanation; the integration now uses deviation wording only when no eligible cycle exists, after uncertainty checks. Wrong-hand/count/partial precedence remains unchanged.

Ten independent readiness tests cover later guard, gradual acquisition without a punch, jitter, missing-eye interruption, lost/ordering/camera uncertainty, material geometry jumps, delayed legitimate guard followed by a completed punch, and saved attempt (10) source preservation. Only necessary assessment-version literals were updated in existing tests. Full suite **433/433 PASS**, 44 files; build **PASS**, 97 modules; unchanged main-bundle size advisory.

Readiness replay 0–10 (`docs/validation/prescribed/readiness-v5-replays.json`) preserves completed status for 0–7, rejection for 8, uncertainty/recovery explanation for 9, and rejection for 10. Attempt (10) now explains starting guard was not observed before the excursion: onset 325.4 ms after window start, stable guard only 2447.7 ms after start. Raw data remain unchanged. This is a temporal distinction, not evidence that all arms-down movement is a punch; simply raising hands into guard is explicitly not classified as a readiness deviation.

Automated diagnostic gate **PASS**. Physical intent, timing ground truth, general readiness accuracy and new phone walkthrough remain **NOT VERIFIED**. Only deviation evidence is used to select the new failure explanation; descriptive helper onset/guard fields do not override successful movement results.

## Face-motion corroboration and boundary timing correction

Detector `face-supported-v6` corroborates shoulder-relative cycles using independently observed same-side-eye-relative and nose-relative trajectories. Proximity alone cannot disqualify movement. A stable-near-face adjustment inference requires both anchors with sufficient coverage, duration, observed cycle boundaries and selected peak, no long anchor-observation gap, low whole-cycle excursion, broad guard proximity, and excursion substantially smaller than the shoulder-relative peak. A single stable anchor yields uncertainty, not a confirmed adjustment; absent corroboration does not fabricate face evidence. These are engineering heuristics; low 2D motion cannot rule out true depth-directed punches.

Independent review raised per-anchor gap coverage: sample-count coverage alone could conceal an unobserved excursion. The engineer tightened corroboration to require known-anchor gaps at most 350 ms, observed boundaries/peak, and agreement without a visible contradictory anchor. Seven independent helper tests cover proximity versus excursion, a shorter near-face outward/return trajectory, missing/single anchors, 70%-coverage long gaps, peak/boundary loss, invalid time/support, source preservation and descriptive—not scored—output. Existing short/slow horizontal/upward cycle and context tests remain passing.

Independent boundary regressions cover recorded combo timing, rejected three-cycle wrong-order combinations with actual earliest/latest candidates across both hands, and partial peaks not being treated as confirmed ends. Failed-match readiness onset no longer overrides an earlier eligible cycle; the final candidate is selected across all hands, with no peak-as-end fallback. When sequence completion fails, a later two-hand guard observation remains a separately timed observation rather than proof the prescribed sequence completed.

Source replay of prescribed 0–10 preserves their previous statuses. Attempt (11) now matches two completed cycles, left jab then right cross; its extra left face-stable candidate becomes a descriptive guard adjustment. Original raw input is unchanged. Full-model lab recordings 5, 9, 10 and 11 retain eight completed cycles, four per hand; previous rejected/uncertain readiness and lowering cases are not upgraded by the new criterion. Evidence: `docs/validation/prescribed/face-supported-v6-replays.json`.

Automated corrective gate **PASS**, 454/454 tests across 47 files; production build **PASS**, 99 modules. Main bundle 551.13 kB retains the advisory. Physical intent classification, true short/depth-directed punch sensitivity, quantitative timing accuracy, overall form and Fire TV remain **NOT VERIFIED**. These clips informed development; future accuracy claims require separate held-out recordings and reviewed boundaries. A face-relative “guard adjustment” result means compatible projected evidence, not proof no punch was intended or performed.

## Competing post-drop trajectories, v7

Detector `competing-trajectories-v7` and assessment `prescribed-competing-v7` continuously compare restoration, projected outward excursion with recovery, and ambiguous evidence after an observed drop. Low starting height is no longer a hard exclusion after that drop. Outward recognition requires a supported low baseline/turn, multiple coherent departure observations, sustained excursion beyond both face anchors, a robust peak and subsequent settled near-face recovery. No elbow-straightness, physical full-reach, or form-pass requirement is introduced. An overhead/lateral reach can still resemble a punch; forward depth and intent remain unverified.

Independent review found and verified fixes for nonfinite confidence acceptance, a low baseline incorrectly bridging an intervening raised hand, and a departure candidate retained across a return to baseline. Tests also cover restoration alone, ambiguous brief excursions, eye/nose loss, gaps/order, no completion without recovery, fresh guard followed by a new genuine cycle after an ambiguous segment, bounded history, and weak unrecovered excursions exported as uncertainty on flush. Source now caps post-drop histories (8 seconds/300 samples), respects deadlines and interrupts, preserves uncertainty for weak evidence, and excludes pre-departure seed observations from post-drop peak ranking. These safeguards were rerun after the final source change.

Completed-candidate feature reports are preserved even when the prescribed sequence fails count/order/hand checks; overall completion remains rejected/uncertain and `formStatus` remains `NOT VERIFIED`. A low-start completed candidate carries `startedFromLoweredPosition` and `actualStartingGuardObserved: false`; historical guard cannot be reused to claim initial guard for that new departure. Strict count/order tests remain intact.

The first replay located recording (12)'s cross but its opposite-hand assessment abstained because a robust peak occurred early in a held outward plateau. A separately evidenced post-drop `outwardEndMs` now covers the last supported outside-face sample before recovery, without extending the feature window into recovery. Independent tests require peak ≤ outward end < recovered guard and confirm that an opposite-hand drop confined to recovery does not become an outward-phase failure. Ordinary peak-based windows are unchanged.

Final independent replay: prescribed 0–7 remain completed, 8 rejected with missing-start explanation, 9 uncertain with unconfirmed-return explanation, 10 rejected with temporal-readiness explanation, 11 completed jab-cross. Recording (12) now completes jab-cross while reporting jab opposite-guard deviation 696.3 ms, cross initial-guard deviation, and cross opposite-guard deviation 1200.7 ms. Restoration cases 6/7 do not regain false completed punches. Full lab recordings 5, 9, 10 and 11 retain eight completed cycles, four per hand. No raw file contents change; input hashes and full reports are recorded in `docs/validation/prescribed/competing-trajectories-v7-replays.json`, regenerated after the final weak-excursion and peak-chronology changes.

Automated corrective gate **PASS**, 475/475 tests across 49 files; production build **PASS**, 100 modules. Main bundle 551.13 kB retains the size advisory. Independent V&V edited tests and derived review/evidence only. Physical punch intent, true depth-directed/short-punch sensitivity, general false-positive rates, overall form, real-phone walkthrough and Fire TV execution remain **NOT VERIFIED**. Initial arms-down recordings 8/10 still do not become unrestricted recognized punches; this is a bounded post-drop trajectory extension with development-case regression evidence, not a general semantic classifier. No Nova invocation or upload occurred.

## Independent V&V — outward observation and recovery separation (v8)

Detector `movement-observation-v8` adds confidence-aware outward-phase evidence without changing legacy cycle classifications. Assessment `prescribed-observation-v8` matches supported outward phases by anatomical hand, count and order, and reports wrist-return confirmation separately. A matched sequence with unconfirmed return remains `uncertain`; it is never a completed session or a full-form pass. Clear movement evidence before tracking loss remains observed, while cause-aware wording attributes missing recovery to tracking/viewpoint uncertainty where appropriate.

Independent tests cover held outward movement, loss after a supported phase, missing face evidence, strict extra/wrong-hand/reversed sequence rejection, recovery outside the allowed window, restoration regressions, and rendered feedback. V&V found that a supported wrong-hand phase followed by tracking loss initially escaped rejection through the uncertainty branch. The orchestrator corrected mismatch precedence; both unrecovered partial and tracking-interrupted wrong-hand cases now reject while retaining individual movement evidence. Matching an observed cross against the first prescribed jab remains a conservative order rejection even when an earlier phase may have been missed; this does not prove the physical order under missing observations.

The renderer test for recording (13) verifies the actual user-visible “Requested movements located” headline, jab wrist-return unconfirmed, and cross wrist-return confirmed. Guard-after-return assessment remains separate. A brief guard-drop fixture was corrected to represent 100 ms rather than the 200 ms exposed by the newly expanded outward phase; sustained-drop coverage is retained. Version literals and assertions that previously conflated movement with recovery were updated explicitly, without weakening count/order checks.

Final source replay, input hashes and immutability results are in `docs/validation/prescribed/movement-observation-v8-replays.json`. Prescribed 0–7, 11 and 12 remain completed; 8 and 10 remain starting-guard rejections. Recording (9) now has a supported jab phase with unconfirmed recovery, rather than no movement match. Recording (13) has supported jab and cross phases with both opposite-guard deviations visible: jab return unconfirmed, cross return confirmed, overall status uncertain. Full lab recordings 5, 9, 10 and 11 retain eight completed cycles and exactly eight supported outward phases each. Restoration cases 6/7 do not gain extra outward phases.

Final independent execution: **486/486 tests PASS across 50 files**, production build **PASS** (100 modules). Main bundle remains 551.13 kB with the existing size advisory. Logs: `/tmp/vv-observation-final-tests.log` and `/tmp/vv-observation-final-build.log`. Automated corrective gate **PASS**. These recordings are development regressions, not an independent accuracy study. Physical punch intent, true depth/full reach, general sensitivity/false-positive rate, live phone walkthrough and Fire TV runtime remain **NOT VERIFIED**. No Nova calls/uploads occurred. V&V edited tests and derived evidence/review only.

## Fresh attempt14 review — October21

Independent replay matches saved prescribed-observation-v8 report exactly;106/106 assessment frames match recording001ad28d manifest. Jab outward observed clip2.916s/peak3.267s, unconfirmed return before lowering5.118s. Cross outward4.647s/peak5.984s, wrist return6.385s/confirmed6.465s. MovementSequenceMatched true, overall uncertain/recoverycannotassess. Jab initial/oppositeguard supported; cross initialguard supported, oppositeguard deviation1259ms. Both endpointguards supported; extensioncannotassess forboth. Video contact review2.5–7.2s shows firstarmheldout thenloweringduringoppositearmextension, followedbybothhandsraisedtoguard. This is consistentwithphase/recoveryseparation; notoverallvalidatedform. Manifest syncapproximate, oneearlyoffsetbackstep outsideeventregion. Derivedevidence docs/validation/prescribed/attempt14-independent-replay.json. No sourcechanges/newtestexecution; latest486test/build softwaregate retained. Physicalgeneralaccuracy/FireTV NOT VERIFIED.

## Independent V&V — concise prescribed feedback

The default result now shows a short movement headline, per-hand movement/recovery/opposite-guard findings, corrections and brief endpoint-guard observations. The prior detailed renderer remains inside a closed `details` element labelled “Measurements and details.” Independent nested-DOM tests verify recording (13)'s separate missing jab return and confirmed cross return, both guard drops, retained measurement details, and no measurement units in the default summary. Wrong sequences and insufficient evidence remain explicit. Review caught a blanket return-to-guard instruction after tracking-caused recovery uncertainty; the orchestrator corrected it to “The camera could not verify recovery,” with an independent regression test.

Only renderer behavior and fake-DOM support changed in this milestone; detection contracts/thresholds remain unchanged. Final independent suite **488/488 PASS across 50 files**, production build **PASS**, 100 modules; existing 551.13 kB bundle advisory remains. Logs `/tmp/vv-concise-final-tests.log` and `/tmp/vv-concise-final-build.log`. Automated presentation gate **PASS**. Real phone usability and physical coaching accuracy remain **NOT VERIFIED**.

## Independent V&V — main Coach lesson loop

Main Coach now exposes demonstration, guided capture, concise review, retry and explicit jab → cross → jab-cross progression. The progression contract intentionally requires observed movement sequence plus confirmed wrist-return recovery, not a guard/form grade. Independent controller tests use current evaluator-produced reports (with evaluation mocked only at the controller boundary) to verify that a guard deviation and unavailable extension do not trap users, unknown recovery or mismatched sequence cannot unlock Next, and advancing is manual. Tests also verify selected-exercise/stance demonstration, suppression of replay during recording, retry's new recording ID and reset permissions/export, manual lesson change, and final-session completion without another capture. Existing stop, stale countdown, speech and context-change regressions remain active. Two animation tests check anatomical lead/rear combo order in orthodox and southpaw stances; rendered physical animation correctness is not established by sampling tests.

Source review confirms the main page routes demonstration to the stance-aware prompt, reveals the guide, preserves timestamped recording callbacks, and keeps legacy calibration/scoring separate. Manual lesson changes and Next clear old export data. Guide playback does not trigger recording. No detection thresholds or physical form acceptance claims were added.

Final independent suite **498/498 PASS across 51 files**, production build **PASS**, 100 modules. Main bundle 552.71 kB retains the size advisory. Logs `/tmp/vv-progression-final-tests.log` and `/tmp/vv-progression-final-build.log`. Automated lesson-loop gate **PASS**. Complete live phone/TV walkthrough, remote focus interaction, Fire TV rendering/performance, physical recognition and coaching accuracy remain **NOT VERIFIED**. Browser source integration and synthetic controller/animation tests do not replace those checks.
