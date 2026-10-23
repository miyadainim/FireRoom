# Milestone B independent V&V review

Date: October 21, 2026 (Asia/Singapore). Scope: Coach Atlas presentation only.

## Review basis

The supplied Milestone B brief requires an original illustrated older boxing mentor in the existing gym, deterministic idle/speaking/instruction/encouragement states, unobstructed bag/ghost arms, actual application rendering, and regression/build evidence. Physical Fire TV performance cannot be inferred from desktop rendering. Milestone A's prior independent review records simulator rendering; the user's subsequent Milestone B request authorizes this work, while aesthetic approval remains the user's decision.

Existing Coach Atlas dialogue is evidence-grounded and restrained: it asks for controlled movements and a return to guard, and acknowledges missing observations. An older calm, slightly stern trainer is consistent with this existing persona. This review does not authorize changing coaching prompts or judgments.

## Automated and rendering evidence

Pending implementation and fresh captures. Gate: NOT VERIFIED until final evidence is reviewed.

## Independent checks performed

- Focused `tests/milestone-b.test.ts`: PASS, four tests. Every presentation state has deterministic finite sampling, restrained breathing/gesture bounds and correct cell selection. Runtime state validation rejects unknown values. The illustrated character uses one two-triangle plane, floor-anchored geometry, sRGB texture sampling with UV thirds, and alpha-tested depth rendering. Disposal is idempotent for the texture; a late asset load after disposal is disposed without revealing the character. Geometry and materials remain the parent scene's disposal responsibility.
- CPU projection checks: the updated x=2.15, z=-0.3 placement clears the central bag and remains inside the camera at 16:9 and panoramic 4.2:1 aspects across sampled states. Ghost world geometry clears the coach plane. These tests cannot prove visible-alpha screen clearance: an initial conservative whole-plane/foreground-ghost projection envelope overlapped, and actual rendering must resolve that criterion.
- Baseline integrated build after adding Atlas: PASS (`milestone-b/independent-build.log`), TypeScript and Vite production build. Main bundle 3,077.67 kB / 2,040.85 kB gzip including inline artwork; the chunk warning remains. This is not startup or performance measurement.
- Baseline integrated regression: PASS, 55 files / 508 tests, 1.77 seconds (`milestone-b/independent-regression.log`). First sandbox run passed 507 tests with the existing gateway loopback test failing EPERM; rerunning with authorized local loopback access passed without a source change.
- Initial actual browser `browser-idle.jpg` review identified a small coach behind/overlapping the right ghost glove. Lead changed placement to x=2.15, z=-0.3. Initial image is rejected as final visual evidence; fresh capture pending.

Independent rendered presentation review: `preview-instructing.jpg`, `preview-speaking.jpg` and `preview-encouraging.jpg` were opened and visually inspected. They show the actual Three.js scene through the explicitly labeled presentation-only harness. The original grey-haired older trainer has a lined face, strong brows, navy/red training jacket, towel, neutral trousers and trainers. Clean cel-shaded outlines and warm colors fit the simple gym. The presenting arm faces toward the bag; encouragement uses a restrained raised-hand gesture; speaking retains the relaxed pose. The full body is grounded and visible right of the ghost arms, with the bag unobstructed. Static screenshots establish states and composition, while CPU tests establish bounded time-dependent motion; these images alone do not establish animation timing or frame rate.

The x=3 placement failed an additional 16:9 whole-plane viewport test by NDC 0.005 at the far-right edge. Lead notified to reduce x slightly. This does not invalidate the wider actual-harness composition, but final placement needs the regression rerun.

## Final automated acceptance

Final x=2.9, z=-0.3 placement resolves the 16:9 plane-edge failure. Focused suite PASS: five independent tests, including the read-only lesson adapter. Adapter testing stubs browser observers and verifies empty dialogue causes no speaking, hidden/disabled next causes no encouragement, existing enabled visible next triggers encouragement, and cleanup disconnects both observers. It does not add a technique judgment or write to lesson controls.

Final integrated `npm test`: PASS, 55 files / 509 tests in 2.33 seconds, authorized loopback access. Final `npm run build`: PASS, TypeScript and Vite build in 2.50 seconds, existing chunk-size warning. Evidence: `milestone-b/independent-tests.log`, `independent-regression.log`, `independent-build.log`.

Human requirements remain unchanged: physical camera classification accuracy, live paired phone synchronization, real Fire TV hardware, measured frame rate, TV viewing-distance legibility and aesthetic approval are NOT VERIFIED by this CPU/browser review.

## Final rendering and scope review

Fresh Vega Virtual Device/WebView `milestone-b/jab-cross-late.png` was independently opened. It visibly renders the final illustrated trainer beside the central bag, grounded on the floor, fully clear of the foreground ghost arms with clean transparent edges. The existing gym composition is preserved. `vega-events.jsonl` records the packaged load, existing guide controls and 180 frame callbacks. This establishes simulator rendering, not measured 30 FPS or real Fire TV hardware performance. The capture is a WebView scene image rather than a complete native screen. Early/late capture filenames are not precise animation-phase evidence because capture frame callbacks and action wall clocks differ.

`ASSET_NOTES.md` documents built-in image generation, the original three-cell 1536×1024 RGBA asset, inline bundling, ~6 MiB base texture cost, and animation limitations. No downloaded character or reference anime was used. Speaking has no lip sync; blinking is absent; encouragement is a restrained raised fist/tilt rather than an independent skeletal head nod. Discrete pose transitions and a small towel-side inconsistency remain aesthetic limitations for approval. The illustrated asset is finished art, not primitive placeholder geometry.

`protected-source-verification.json` records 36 protected source files unchanged. The presentation adapter observes existing UI state; inspection finds no new scoring, CV, networking or AI judgments. Regression evidence covers existing behavior, while live human/device tests remain outside this milestone.

## Gate decision

PASS for Milestone B's scoped automated contracts/regression/build, original illustrated character, deterministic lightweight presentation, rendered composition and Vega simulator rendering. The initial small overlapping placement was corrected; the final x=2.9 placement passes tests and rendered review. User visual approval is required before Milestone C. Real-device Fire TV performance, sustained FPS, fresh paired-phone testing and TV-distance legibility remain NOT VERIFIED; no physical validation is claimed.
