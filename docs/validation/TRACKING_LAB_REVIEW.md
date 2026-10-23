# Independent tracking optimization lab review

Review scope: standalone local tracking experiment page, metrics, report import, and prerecorded-video runner. Independent V&V owns `tests/lab-independent.test.ts`; runner/metrics author tests provide additional coverage. This review does not certify physical coaching accuracy.

## Acceptance coverage

| Requested capability | Evidence boundary |
|---|---|
| Camera optimization | Condition labels (angle, lighting, framing) are self-reported. Actual decoded resolution, shoulder-span pixels, and camera track settings are measurable. A label is not proof of a physical condition. |
| Session calibration | Lead/rear guard, extended, and short distributions remain separate. Evaluation intervals do not become calibration samples. External reference clips must match configuration and be independent of evaluation footage. |
| Tracking quality | Missing/low-visibility observations, implausible jumps, and bone-length changes are rejected by provisional rules. Raw pose data remains available; no claim of detecting every misplaced landmark. |
| Filtering and segmentation | Time-based EMA resets across gaps. Raw-only is exact passthrough. Peak attenuation and peak-time differences expose filter costs. Segmentation observes a prompted movement cycle, not punch identity or verified form. |
| Full/Heavy comparison | Same local video, condition, delegate and timestamp schedule, sequential model lifetime, measured inference/decode/load/warmup timing. Model downloads need internet. Desktop timings do not establish phone or Fire TV performance. |
| 2D/3D reach | Aspect-correct 2D uses pixels; world reach uses estimated meters; normalized wrist/jitter uses shoulder spans. Values are not subtracted across incompatible units. Legacy image XYZ is explicitly mixed-axis and is not physical 3D. |

Manual visible-joint annotations provide 2D reference error only; occluded/uncertain points are excluded from location-error calculations. High visibility is not an accuracy label. Without matched manual reference annotations and held-out labels, accuracy/discrimination remain NOT VERIFIED. Even manually annotated 2D points do not establish true 3D elbow form.

## Independent defects raised

1. Opposite-hand evaluation labels were initially included in both arms' distributions. Corrected to phase/hand-specific attribution; independent regression added.
2. Segmentation initially accepted a departure/return across long missing spans and reported the wrong return timestamp. Corrected to require contiguous coverage and identify the actual return point; independent gap regression added.
3. Sampled video frequency was initially named effective FPS. Renamed sampled Hz; actual inference timing remains separately reported.
4. Raw-only filtering initially applied a tiny EMA instead of exact passthrough. External calibration initially accepted the same clip under a different run ID. Corrected; independent regressions pass.
5. Model pairing now checks delegate and reported device metadata as well as exact clip/condition/timestamps. Equal metadata cannot prove identical physical hardware.
6. Dynamic attempt distributions initially used whole-window medians, hiding brief extensions behind guard samples. Dynamic jab/cross windows now use the median of the three largest accepted reaches; held-pose windows retain medians. This is provisional descriptive evidence, not validated form discrimination.

## Actual verification

**2026-10-18 final rerun after metadata-timeout/import-state fixes:** `npm test`: **280/280 PASS**, 32 files. Independent `tests/lab-independent.test.ts`: **26/26 PASS**. `npm run build`: **PASS**, 86 modules, both main and tracking-lab entry points emitted. Tracking-lab JS 34.99 kB; main JS 566.88 kB retains the >500 kB advisory.

Independent tests cover aspect-ratio-correct XY, world-coordinate absence, per-arm low-confidence abstention, nonfinite high-visibility landmarks, raw-data preservation, gap/duplicate-time filtering behavior, bounded schedules, separate hand references, calibration/evaluation isolation, manual-reference eligibility, exact source pairing, missing-data segmentation, opposite-hand label exclusion, exact raw mode, independent-clip calibration, empty analysis, strict report bounds/chronology/clock/timing/annotations, delegate/device mismatch, and guard-dominated dynamic windows.

**Software numerical/import/regression gate: PASS. Browser rendering gate: PASS (root-agent evidence):** page renders the controls without console errors. Automated file selection returned with an empty file list and no video source, so this is not evidence of a decoding failure. **Actual local-video/model inference walkthrough: NOT VERIFIED.** This independent reviewer did not operate the browser or download/run actual Full/Heavy model assets. A 15-second metadata timeout now clears its handlers on success, error, or timeout; source inspection confirms that cleanup. Import clears the previous clip metadata before changing video source and blocks competing imports/inference during metadata loading, preventing a failed new import from being paired with old clip metadata. **Physical measurement/accuracy gate: NOT VERIFIED.**

Physical camera trials, actual Full/Heavy model performance on the user's OnePlus, physical reach accuracy, lighting/angle causality, and Fire TV execution: **NOT VERIFIED**. No credentials or new backend footage transfer are required for this local experiment pipeline.

## Guided UX follow-up — 2026-10-18

Independent source review confirms four panels (Set up → Record → Compare → Save), direct navigation and next/back controls, collapsed advanced/manual tools, plain-language anatomical hand cues, and preserved measurement runner/metrics behavior. Recording and inference disable navigation with other controls while leaving cancellation available. An Open / reopen camera control is available inside Record, avoiding a hidden prerequisite after a captured clip stops the camera. Post-capture instructions explicitly require downloading video before the next recording.

Actual final follow-up verification: **282/282 tests PASS**, 33 files, including two stance-aware movement-cue tests; independent numerical/import tests remain 26 PASS. **Production build PASS**, 87 modules; tracking-lab JS 41.13 kB, main JS 566.88 kB with the existing >500 kB advisory.

Root-agent browser evidence confirms Set up and Record panels render and navigation works. This independent review attempted browser access, but CUA reported no available browser; independent browser interaction and the real-phone walkthrough remain **NOT VERIFIED**. The follow-up passes source/regression/build review; its user usability and real inference session still require direct testing. No new physical-accuracy claims are made.

## Metric-evidence download — 2026-10-19

Independent source review: the download action guards empty result selection, refreshes the analysis, and exports the exact displayed evidence with schema/kind, export time, EMA setting, and selected run provenance/intervals. It introduces no footage upload or network request and leaves the raw measurement export separate. Regression verification: **282/282 tests PASS**, 33 files; **build PASS**, 87 modules. Tracking-lab JS 42.33 kB; existing main bundle advisory remains. Actual browser download delivery was not independently exercised and remains **NOT VERIFIED**; source/build/regression gate **PASS**.

## Projection-aware segment policy — 2026-10-19

User-authorized change independently reviewed: image-2D segment-length changes are now diagnostic flags, not rejection reasons. Visibility/missing-data and implausible-jump gates remain active. Legacy image XYZ and world XYZ retain their existing bone-length rejection. Independent adversarial tests confirm elbow-only projected changes remain accepted and flagged in XY, are rejected in XYZ, and do not mutate raw frames; low visibility and large wrist jumps still reject XY.

Recorded export `(4)` sensitivity replay: with the old external baseline, every XY accepted-reach sample exactly matches the no-external-baseline analysis. Full accepts 432/448 frames per hand; Heavy accepts 426/448 left and 368/448 right. No XY bone-length rejections remain. Diagnostic flags count 54/72 Full and 50/59 Heavy. Full intended full/short medians are 122.928/68.712 px left and 102.278/74.581 px right; Heavy 126.567/72.391 and 104.811/71.078 px. This corrects a filter confound, not the underlying model positions or physical form accuracy.

Heavy export `(5)` without external baseline has 23 left and 105 right missing/low-visibility observations. Only legacy image XYZ has jump rejections (4 left, 6 right); XY and world have none. These counts are hand/geometry-specific and do not identify which individual joint was wrong.

Final verification: **284/284 tests PASS**, 33 files; **28/28 independent lab tests PASS**. **Build PASS**, 87 modules, tracking-lab JS 42.67 kB. Existing main bundle advisory remains. Software/regression gate **PASS**; physical accuracy **NOT VERIFIED**.
