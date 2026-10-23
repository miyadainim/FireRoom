# Milestone A independent V&V review

Date: October 21, 2026 (Asia/Singapore). Scope: environmental graphics only.

## Baseline evidence

- `npm run build`: PASS. TypeScript and Vite production build completed; existing >500 kB bundle warning remains.
- `npm test` with local loopback permission: PASS, 53 files / 501 tests, 2.00 seconds. The first sandboxed run passed 500 tests but failed the gateway integration test because binding 127.0.0.1 was denied (EPERM); the authorized rerun passed without a source change.
- `vega exec vda devices` with local device permission: emulator-5554 is connected. The sandboxed adapter daemon startup was denied its loopback listener; that is not simulator unavailability.
- There is no `.git` repository in this checkout. Scope review therefore relies on the assigned file boundaries and source inspection, rather than a Git diff.

## Safe Vega verification procedure

Reuse the existing standalone display harness: run `node platform/vega/probe/package-display.mjs`, select the existing display target, build the existing wrapper, and run its aarch64 package on VirtualDevice. Standalone packaging adapts file URL resource restrictions without replacing application source. It does not verify hosted relay routes or phone pairing.

Use the existing isolated Appium installation through `sh platform/vega/probe/start-appium.sh`; enable the local automation toolkit on the emulator and capture a fresh screenshot into a milestone-specific evidence directory. Old screenshots are historical evidence only. Preserve the deployed HTTPS origin, package scripts, WebView shell, relay and session behavior. Do not read or copy credential values.

## Final review

- Integrated automated regression: PASS, `npm test`, 54 files / 504 tests, 2.12 seconds after the final refinement (authorized local loopback run). Evidence: `milestone-a/tests.log`.
- Focused graphics regression: PASS, 3 files / 15 tests, covering the independent environment checks and existing guide tests.
- Integrated production build: PASS. Evidence: `milestone-a/build.log`. Main bundle 562.89 kB / 149.11 kB gzip; the existing chunk-size warning persists.
- Static geometry inspection: 126 mesh objects, 238 rendered instances including instanced sign pixels, 3,736 triangles. These are CPU geometry counts, not observed draw calls or FPS.
- Source inspection preserves the first-person camera parameters, renderer setup, ghost-arm material/geometry, playback handlers and bag-displacement calculation. Environment construction is isolated in `src/graphics/environment.ts`; no new rendering dependency is used.
- After the final rear-light/window refinement, the independent 3-test environment suite passed again.
- Independent tests assert the bag remains centered at world (0, 1.6, -0.3), is 1.7 units tall, and the background ring stays outside the central training corridor. Opaque Toon/Basic environment materials use no texture maps or mesh shadow flags.

Independent browser visual review: PASS against the environmental composition criteria, based on fresh actual-application `milestone-a/browser-gym.jpg`. The image shows an unobstructed central red leather-style bag and suspension, warm yellow walls with blue trim, background ring at left, lockers/bench at rear, original sign and fluorescent fixtures. Ghost arms remain visible with a clear training corridor. The style is deliberately simple low-poly cel shading; the unchanged panoramic demonstration panel limits scene height. Visual taste remains subject to the user's Milestone A approval.

Independent Vega rendering review: PASS for the existing Virtual Device/WebView display path. Fresh `milestone-a/vega-gym.png` visibly renders the same centered bag, ghost arms, red/blue ring, yellow gym, windows, fluorescent fixtures and storage. `milestone-a/vega-events.jsonl` records the packaged standalone load, Chromium WebGL 2.0, document ready, existing jab/cross/jab-cross controls invoked, a canvas with 180 frame callbacks, and an offline coach response. This is simulator rendering evidence, not physical Fire TV deployment or hosted phone/relay verification.

Animation timing limitation: the harness captures by frame count while commands transition by wall clock. For example, the `jab-late` capture already labels the guide as cross. Therefore early/late filenames do not independently prove precise animation phases. Anatomical jab/cross/combo phase behavior passes the automated sampling regressions; control invocation is observed in the simulator logs. No 30 FPS claim is made: there is no controlled measured FPS sample, and capture work may affect rendering.

## Gate decision

PASS for the scoped environmental milestone's automated build, regression, composition and Vega simulator-rendering gates. User visual approval is still required before Milestone B. Physical camera accuracy, live phone synchronization, actual Fire TV hardware and 30 FPS performance remain NOT VERIFIED by this milestone. Synthetic geometry tests cannot establish real-camera accuracy, physical technique quality or actual-device Fire TV performance.

Lead capture note: Appium `milestone-a/simulator.png` shows the launcher and does not prove app rendering. Fresh native WebView `milestone-a/vega-gym.png` and associated diagnostics establish the scene render. Full-display app screenshot remains NOT VERIFIED. Temporary wrapper source/config changes were checked with `cmp` and restored byte-for-byte after packaging. The test display package is not a replacement for the preserved hosted deployment configuration.
