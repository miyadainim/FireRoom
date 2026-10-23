# Milestone C independent V&V review

Date: October 21, 2026 (Asia/Singapore). Scope: ghost-arm presentation and read-only Coach Atlas visual novel dialogue.

## Acceptance basis

Preserve the approved gym, Atlas artwork, existing reference movement and lesson/evaluator contracts. Demonstrate anatomical jab, cross and jab–cross for both stances at all three existing playback speeds. Use restrained white contours with transparent bodies and beginning/end fades. Mirror existing grounded dialogue and uncertainty without adding technique judgments. Rendering and Vega evidence require actual captures; CPU fixtures cannot establish camera accuracy, physical deployment, legibility at TV distance, or sustained frame rate.

## Independent automated checks

`tests/milestone-c.test.ts` currently passes six independent tests. Fade sampling checks invalid input, both reference durations, smooth midpoint values, full visibility through extension/recovery, and zero visibility before/after playback. Sampling checks cover jab/cross/combination, orthodox/southpaw, and 0.25×/0.5×/1×, including anatomical hand identity, opposite hand in guard, extension maxima and recovery. Geometry checks require sparse warm-white THREE line materials, fewer than 500 contour vertices per arm, no depth writes, and body opacity below 0.02. These checks inspect presentation semantics rather than asserting a particular screenshot.

Dialogue checks cover all six display states, exact preservation of grounded message text, uncertainty priority over encouragement, source immutability, exclusion of expandable debug measurements, dynamic text assigned using textContent, ignored idle global feedback, existing control state unchanged, observer disconnection and panel removal. A discovered connection-loss classification gap was corrected before final verification: actual global connection-loss/failed messages now display uncertainty rather than generic coach notes.

## Integration and rendered evidence

Final integrated `npm test`: PASS, 56 files / 515 tests, 1.75 seconds, with local loopback permitted. The initial sandbox invocation passed 514 tests but the gateway test could not listen on 127.0.0.1 (EPERM); permitted rerun passed without weakening its test. Final production build: PASS, TypeScript and Vite; main bundle 3,085.94 kB / 2,043.83 kB gzip with the existing large-chunk warning. Logs: `milestone-c/independent-regression.log` and `milestone-c/independent-build.log`. Earlier environment material typing and completed-time literal inference build failures were corrected and the final build rerun successfully.

Independently opened `browser-introduction.jpg` and `browser-jab.jpg`. The actual application scene retains the warm gym, central heavy bag and nearby original Atlas. Idle introduction correctly has no ghost arms. The full cream/navy/red dialogue panel and original Atlas portrait sit below the scene and do not obscure the bag or foreground movement corridor. Jab capture shows warm-white contour arms, almost transparent bodies and Atlas's instruction pose matching the panel portrait. No neon fill or opaque mannequin is visible. Intersecting glove contour loops have a construction-line appearance; whether they read clearly enough as boxing gloves remains a user aesthetic review point.

Source review confirms line geometry is included in parent scene disposal. Animation frame motion still consumes the original reference samples; fades use demonstration time, so slow playback scales them along with the movement. Remote navigation now includes visible native summaries and skips controls with no visible rect or a hidden ancestor, while native inputs/selects retain their arrow behavior. Actual remote simulator operation still requires evidence.

Animation recording and Vega evidence were subsequently reviewed below.

## Gate decision

PASS for scoped automated contracts/regression/build and browser/Vega simulator rendering, subject to user visual approval. Native D-pad and performance limits are explicitly recorded below; full physical interaction/performance acceptance is NOT VERIFIED. No physical camera validation, real Fire TV hardware deployment or frame-rate claim is made.

## Final contour refinement

The lead removed the two intersecting full xz/yz glove contour loops after independent visual review flagged a construction-sphere appearance. The remaining authored silhouette, thumb, cuff, sleeve and highlight contours preserve the instructional transparent style. Focused regression after this change: PASS, 4 files / 18 tests (`milestone-c/independent-final-focused.log`), covering milestone C, existing graphics and prior A/B presentation acceptance. The jab screenshot was freshly replaced and independently reopened after refinement: fewer intersecting contours, clean transparent foreground lines, and unchanged clear panel/bag separation. This is a static visual check; movement timing still requires recording evidence.

Protected source hash audit checked 35 baseline files: 34 unchanged; the only difference is the type-only material annotation in `src/graphics/environment.ts` to resolve TypeScript's possibly-undefined clone input. Evaluator, vision, phone/relay, gameplay and coach evidence sources remain unchanged among the protected set.

Vega package build log (`milestone-c/vega-build.log`) records `vega vtbuild exited with code 0` and `build-vega completed`. Package compilation is PASS; it does not establish simulator rendering by itself.


## Final Vega and recording evidence

Independently opened fresh Vega `vega-gym.png`, `jab-early.png`, `cross-late.png`, `jab-cross-early.png` and complete native-screen `simulator.png`. The full simulator screenshot visibly shows the actual existing gym, original Atlas instruction pose, transparent white contour arms, central red bag and complete cream visual novel panel beneath the stage. It establishes that the panel renders on Vega without obscuring movement or truncating dialogue. Separate jab/cross captures show correct left-jab/right-cross assignment. Early/late filenames do not establish exact phase timing, since capture callbacks and action timestamps are not identical clocks.

`vega-events.jsonl` records packaged file load, WebGL 2.0, document ready, existing demo clicks/change actions, 180 scene frame callbacks and dialogue existence. This establishes live simulator rendering; frame callbacks do not constitute a sustained FPS measurement.

`demonstrations.webm` is accompanied by browser-decoded `recording-metadata.json`: 1830×561, 11.441777 seconds, readyState 4, decoder error null. The local capture harness records the actual canvas and triggers existing jab → cross → jab–cross lesson controls at 0.5×, with idle gaps. This is canvas animation evidence, excludes dialogue, and captures no player camera or scoring. This reviewer inspected the metadata, capture harness and actual simulator phase stills; continuous video playback was not independently watched because this agent's browser surface was unavailable. Root verified decoding. Fade timing is independently established by CPU sampling tests, rather than inferred from static captures.

Lead reports actual browser keyboard checks: guide summary → ArrowDown focuses pairStart, ArrowUp returns to summary, Enter collapses guide. Native Vega D-pad behavior remains NOT VERIFIED. Physical TV readability, full-round physical/camera validation, live phone synchronization, real Fire TV hardware deployment and measured performance remain NOT VERIFIED.

## Known presentation limitation

Dialogue uses a persistent panel with a 0.24-second text entrance animation and reduced-motion support. The final refinement adds a distinct 0.12-second outgoing-text fade/3px departure while updating the current grounded message synchronously. Independent source inspection confirms the departing copy is aria-hidden, has no live region, ignores pointer events and is removed on animation end, next update or disposal. Reduced motion skips cloning. The copy container is positioned relatively to contain the absolute outgoing text. Root final focused tests pass 10 checks after this refinement; the original Node DOM mock intentionally bypasses clone animation and therefore does not visually validate the transient crossfade. Final static simulator evidence preceded this transition-only refinement; root rebuilds the final Vega package. Glove contour recognizability remains a user visual-review decision. No further milestone is authorized before user visual approval.

Lead final integration evidence: final text crossfade exercised by the actual browser Ask control; the original no-observed-evidence response appeared in the VN uncertainty panel, no console warnings/errors returned. Final Vega package was rebuilt and full simulator screenshot recaptured after this change. Original wrapper source/hosted configuration restored byte-for-byte. Browser recording is canvas-only (no dialogue), decoded metadata verified; no physical/camera trial claimed.
