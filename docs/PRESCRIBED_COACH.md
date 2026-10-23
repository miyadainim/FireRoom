# Prescribed Coach preview

## Live use

Open FireRoom, connect the phone using its usual QR pairing, and start the camera. In **Prescribed Coach · rule-based preview**, choose jab, cross or jab→cross. Hold guard, press Start guided attempt, wait through3seconds, then perform the request and recover within5seconds (8seconds forcombination). Phone stance controls anatomical front/rear roles. No reach calibration is needed for this preview. Do not run the legacy calibration/practice workflow simultaneously.

Read each observation separately: starting guard, opposite hand during outward phase, wrist return and recovered guard. Observed is not an overall technique pass. Recovery time is measured descriptively without a universal fast/slow grade. Cannot assess means insufficient feature evidence, not necessarily incorrect form. Export **Download attempt + feedback JSON**; phone-local automatic video uses existing recording controls and needs separate phone download. No video is uploaded by this panel. Live phone workflow and physical feedback accuracy require human validation.

## Existing recordings

In Tracking Lab, import experiment measurements, select Full, then find **Prescribed drill feedback · preview** in Compare. Select expected movement and video-clock start/end containing that attempt plus ready/recovery time. Press Locate attempt and explain observations, inspect evidence and download prescribed feedback JSON. Do not label every extra off-window movement as another repetition. Wrong hand/order and idle should not satisfy the request; ambiguous feint/reach trajectories remain a limitation.

Example for recording11: firstjab6–9.5s, second10.5–14s; shortjabs16–19.5and20.5–24; crosses25.5–29,30.5–34,35.5–39,40.5–44. These are analysis windows, not independently annotated exact onset boundaries. Replaymatchedall8intendedwindows and rejected45–48idle, withruleguardobservationssupported andextensioncannot-assess. This does not validate coaching judgments without reviewed positive/deviation/obscured examples.

## Optional DTW

Leave disabled initially. Later import a genuinely reviewed dynamic jab/jab-cross reference, enter the actual matching camera-placement description and explicitly confirm independent review. Existing reference validation checks chronology, coverage and annotated phases. Comparison reports similarity/rejection separately and cannot override rule completion or certify form. A short punch may fail existing amplitude heuristics despite valid movement. Standalonecross currentlyabstains. Do not use a static guard/reach baseline as a dynamic technique demonstration. ExistingDTWreferencecontract remains unchanged.

Research and feature limits: COACH_RULE_RESEARCH.md. Validation: docs/validation/PRESCRIBED_REVIEW.md and PRESCRIBED_DTW_ROLE.md. Next human tests need normalguard versus sustainedopposite-handdeparture, visible recovery versus obscured wrist, wronghand/order/idle and reasonable reaction-speed variation. Report each feature separately; don'tclaimphysicalforce/impact/injuryrisk.

## Spoken cues

Speak guided instructions is enabled by default when browser speech synthesis is available. Start announces3/2/1, the stance-aware requested hand/sequence and return to guard; finish/stop/context errors also announce. Audio comes from the browser running the Coach panel, normally the computer, not automatically the paired camera phone. Toggle off to silence pending speech. Stop, page close and disposal cancel pending cues; unsupported browsers retain visual cues. Spoken timing depends on the browser/OS voice; actual audibility requires device validation. No microphone or speech-recognition permission is used.

## Prescribed recovery deadline update

Assessment `prescribed-window-v2` waits through the explicit response window plus its bounded recovery tolerance instead of applying the unrestricted detector's1.8-second cycle timeout. Defaultlivewindowsremain5seconds forsinglepunches and8forjab-cross; maximumacceptedanalysiswindow30seconds. The unrestrictedcomparison recognizer retainsits originaldeadline. Slowobservablecompletiondoesnotautomaticallymeanincorrecttechnique; recoverytimingisreportedseparately. Historicaldownloadsretainolderassessmentresults.

## Experimental eye-height check

Prescribed opposite-hand feedback now uses the anatomical same-side eye (left eye landmark 2, right eye 5). The signed downward wrist offset is divided by the image-plane distance between the shoulders, with image aspect correction. A wrist more than **0.5 shoulder widths below that eye** for at least 180 ms triggers the low-height observation. This is not wrist-to-eye radial distance, shoulder-to-elbow length, or centimetres. Elbow angle and visibility are not required by this feature; eye/wrist/shoulder confidence is required. A broad lateral envelope prevents an arbitrarily sideways hand from being called supported. Missing observations and brief excursions return cannot assess rather than proving a drop.

The report includes per-sample offsets, confidence and descriptive change from eligible initial samples. The UI shows the maximum offset and sustained duration. Baseline differences are not an additional technique threshold. Initial guard acquisition, punch segmentation and recovered-guard checks retain their previous rules, including their elbow requirements; only the opposite-hand height feature changed.

**0.5 is provisional.** This replaces the earlier 0.3 limit, which warned on the reviewed normal jab (3). The website therefore reports a low wrist relative to the configured limit, not proof that the chin was unprotected. Use new videos and coach-reviewed target positions to validate this threshold before treating it as correct-form scoring. Old downloaded reports are historical and are not recalculated automatically.

## Guard restoration handling

Movement detector `guard-restoration-v4` invalidates a hand's old punch-ready origin after150ms of sustained observed lowering below the existing supported punch region. Returning that hand to a newly observed guard re-arms it; the return itself is not a punch. The prescribed matcher still enforces movement count, anatomical hand and order. This change does not alter the0.50 eye-height feedback threshold or remove all possible reach/feint ambiguity. Newly exported cycle evidence includes the movement-detector version. Fresh real-camera validation is still required.

### Above-shoulder guard lowering

`guard-lowering-v5` additionally uses sustained predominantly downward wrist displacement from the saved guard, corroborated by the wrist staying below the0.50 same-side-eye limit. This catches lowering that never crosses the shoulder-relative region boundary. The candidate is uncertain, not a verified punch or proof of intent. After lowering, a restoration lock requires new visible eye-height-compatible guard for at least100ms/two observations before rearming; missing required observations interrupt that hold. The0.50 feedback criterion,180ms lowering evidence, prescribed hand/order/count checks and legacy recognizer remain in place. These rules still cannot distinguish every downward punch, feint or projected motion.

If reliable observations show no established starting guard and no eligible movement candidate, feedback says: **Starting guard not observed. Bring your hands into guard and hold briefly before punching.** Missing tracking instead retains an uncertainty explanation. A valid held guard without a punch does not trigger the missing-starting-guard explanation.

If supported outward movement is followed by observed lowering without confirmed recovery, feedback can say: **Outward movement observed, but return to guard was not confirmed. Bring your punching hand back to guard after the movement.** This is still an uncertain attempt, not proof of a correctly executed punch. Tracking/context failures retain separate uncertainty feedback.

## Explicit starting and finishing two-hand guard

Assessment `prescribed-boundary-guard-v6` exports `guardBoundaries` and displays two separate checks for every timed attempt. Starting guard is assessed in the500ms before the observed movement onset; finishing guard is sought after the final located movement's return (or after its selected peak when return is missing). A guard appearing later cannot qualify as a starting guard. Both hands must simultaneously occupy the eye-relative face region for at least100ms/two observations. The vertical region spans0.5 shoulder widths above/below each anatomical same-side eye and the existing lateral bound is0.75. Elbow angle/visibility is not required by these new two-hand checks. Existing legacy movement guard acquisition remains unchanged.

`movementSequenceMatched` still describes movement location. `guardBoundaries.status` independently records whether both starting and finishing guards were supported, a boundary was not confirmed despite usable observations, or evidence was insufficient. A located punch does not mean both guard checks passed. Missing motion timing or unreliable eye/wrist/shoulder data yields cannot assess. A finishing guard means a post-movement hold was observed, not that the player held it until the recording ended. Numerical limits are provisional; facial coverage, physical technique and general accuracy remain NOT VERIFIED.

Pre-movement readiness diagnostics can identify a clear excursion from a stable hands-down baseline beyond the guard region before any guard. They do not classify that excursion as a physically verified punch. Ordinary hand-raising into guard and delayed valid preparation are preserved. New evidence is timestamped; raw recordings are not changed.

## Face-supported guard adjustments

Movement version `face-supported-v6` compares wrist-to-shoulder departure with wrist motion relative to the same-side eye and nose. It only infers an image-plane guard adjustment when **both** face-relative trajectories remain near the face and sufficiently stable throughout the cycle. The provisional limits are0.22 shoulder widths of face-relative range,0.75 maximum proximity, and face-relative range no more than60% of shoulder-relative peak. Each anchor requires70% coverage, at least3 samples spanning180ms, visible first/last samples and selected peak, with no known-anchor gap over350ms. These are engineering criteria, not validated boxing standards.

Single-anchor fallback is uncertain; contradictory visible movement from the other anchor prevents that inference. Insufficient face evidence cannot support a guard-adjustment claim. A genuine punch can remain close to the face in projection, especially toward the camera; proximity alone never rejects it, and this method cannot establish physical intent. The attempt JSON exports face-motion evidence and the website explains face-supported adjustments that were not counted as additional punches.

## Competing trajectories after an observed guard drop

Movement `competing-trajectories-v7` continues observing after lowering instead of excluding all later punches until a held guard. It compares restoration into the face region and settling, a supported excursion beyond that region followed by recovery, and ambiguous movement. Evidence uses timestamped shoulder/eye/nose-relative trajectories, a stable low reference or supported low turn (no mandatory stationary pause), multiple departure/excursion observations, a robust peak and recovery hold. It is not a single height trigger or proof of forward depth. A short/ambiguous excursion stays uncertain; ordinary restoration is not an additional punch.

A located low-start movement exports `startedFromLoweredPosition: true` and `actualStartingGuardObserved: false`, with competing-hypothesis evidence. The report flags its starting guard separately and measures the opposite hand over its observed outward/held-outward phase, not only the selected peak. Recovery is measured to an observed face guard region, not back to the lowered origin. Initial arms-down attempts without a preceding observed guard/drop remain governed by the existing readiness diagnostic; this is not unrestricted low-start action recognition.

Individual completed-candidate guard findings remain visible even if the entire sequence fails count/hand/order checks. Endpoint guard holds do not mean guard was maintained between them. No Nova service is invoked by this local trajectory change. Projected reaches/feints can still resemble punches; physical accuracy and new-view generalization remain NOT VERIFIED.

## Outward movement and recovery results

Version prescribed-observation-v8 shows **Requested movements located** when supported outward phases match the prescribed anatomical hands and order. Each movement separately shows **Outward movement: observed** and **Wrist-return recovery: confirmed / not confirmed**. A missing return does not erase supported outward evidence; overall status remains uncertain until all required returns are confirmed. Guard quality and extension remain independent findings, and a confirmed wrist return does not establish correct guard form. Extra or wrong-order supported movements still reject the prescription. Tracking interruptions explain uncertainty without guessing technique. Reload the website and make a new attempt to receive this report; historical downloaded JSON is unchanged.

## Main Coach lesson flow

Connect the phone camera, choose a lesson and press Watch demonstration. The guide follows the latest phone stance. Start guided attempt runs the existing countdown, bounded capture and automatic phone recording. Review the concise movement/recovery/guard results, then choose Try again. Next lesson unlocks when the requested movement and recovery are observed; it does not certify correct form. The lesson path is jab, cross, then jab-cross; Finish session ends the final review. Lesson selection also allows direct practice. Download the current attempt JSON before changing lessons; download video and timing manifest on the phone. Older calibration and experiments remain available in advanced tools.
