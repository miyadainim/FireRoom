# Independent Fire TV graphics compatibility gate review

Date: 2026-10-21. Scope: read-only source/tool/artifact audit; no installation, runtime launch, redesign or source change.

## Decision

**Deployment/rendering/performance gate: NOT VERIFIED.** Local browser tests and an APK do not establish the selected Fire TV device's WebView, GPU, remote or networking compatibility. **Remote disclosure navigation has an identified source-level gap** that should be resolved or demonstrated accessible before claiming the complete TV workflow passes.

## Source-backed findings

- `platform/android/AndroidManifest.xml` declares landscape Leanback, Internet, no touchscreen requirement, minimum Android API25/target35. This is an Android WebView wrapper, not evidence of compatibility with every Fire TV operating system/device.
- `MainActivity.java` loads a configured HTTPS URL, enables JavaScript/DOM storage and restricts navigation to its HTTPS host/port. No TLS bypass, camera permission or native JavaScript bridge exists. Phone capture remains separate. Trusting a development certificate on a laptop does not establish trust on TV or phone.
- The wrapper does not bundle `dist` or the relay. Existing artifact configuration is `https://fireroom.invalid/?display=tv`, an intentionally unusable placeholder. A reachable trusted application origin and same-origin relay are deployment prerequisites. Vite's development proxy and pairing-address middleware are not automatically production hosting.
- `src/graphics/scene.ts` uses installed Three r180. Local `WebGLRenderer.js` explicitly requests `webgl2` and rejects WebGL1. There is no alternative graphics backend. The main page catches constructor failure and reports rendering unavailable, but that is degraded operation, not a passing ghost-arm demonstration.
- The scene uses simple meshes, standard materials, two lights, no shadow/postprocessing pipeline, antialias off, low-power preference and pixel ratio capped at1.5. These are reasonable cost limits, not measured Fire TV performance. Animation sampling tests verify hand/timing math, not rendered frames or frame rate. A continuously scheduled animation loop exists; suspend/resume, context loss and memory behavior require target observation.
- The web build targets ES2020 and runtime also uses APIs such as `structuredClone`, fetch, modern DOM and optional Web Speech. Build transpilation does not polyfill every runtime API. Missing speech has visual fallback; actual TV speech availability remains unknown.
- Native D-pad routing considers visible buttons, links, input/select/textarea/tabindex; it omits `summary`. Therefore default disclosure controls for measurements, advanced tools/settings and the guide have no explicit candidate. Demonstration opens the guide programmatically, but does not solve every collapsed disclosure. Native routing intercepts D-pad arrows even inside select/input, while desktop JS preserves those controls' native arrow behavior: selection/editing is a target test requirement.
- Browser fallback D-pad routing omits summaries/links and does not filter hidden/disclosed descendants. Desktop mouse operation is not remote-accessibility evidence.
- Pose transport rejects stale/reordered session events and performs local arrival-based connection checks. Phone camera work is offloaded, but TV still performs pose assessment plus rendering; no target CPU/GPU/network latency measurements exist. Pairing, reconnect and recording controls need real paired-device checks.

## Actual evidence obtained

- Installed SDK paths exist for adb, emulator and build-tools35. `emulator -list-avds` returned `VECTR_API_35`. The orchestrator confirmed this is a generic Android AVD; no compatible Fire TV simulator was found. It is not Fire TV execution evidence.
- `adb devices -l` could not start its local daemon: listener operation not permitted in this execution sandbox. This initial sandbox failure alone did not establish device availability. Independent audit did not escalate or install. The orchestrator subsequently obtained approval for read-only adb discovery: the daemon started and `adb devices -l` returned an empty device list. Thus no connected target was available at that later check. No application installation occurred.
- `apksigner verify artifacts/android/fireroom-debug.apk` exited0. Signature validity is not installation or graphics evidence. The orchestrator subsequently rebuilt the APK successfully with the existing placeholder `display=tv` origin; source8/deprecated-API warnings remained.
- Focused current graphics tests: **12/12 PASS**,2files (`form-graphics.test.ts`, `graphics.test.ts`). Includes anatomical orthodox/southpaw jab/cross/combo sampling. The orchestrator reran the current full suite: **498/498 tests PASS across51files**, production build **PASS**. This review does not reclassify those as hardware tests.

## Required target acceptance checks

1. Identify exact Fire TV model, OS/build, WebView provider/version and a verified supported runtime. Install/launch an APK configured to the trusted reachable application URL; retain actual commands/logs.
2. Confirm WebGL2 context and actual ghost-arm/bag render, anatomical hand/order and all playback speeds. Capture frame-time/FPS and resource behavior during a full coach session rather than extrapolating from desktop.
3. Traverse the whole workflow with D-pad only: pair, select all lessons/stance where applicable, open/close disclosures, demonstrate, attempt, stop, retry, next, finish, recovery feedback and Back. Verify focus remains visible and no hidden controls intercept navigation.
4. Pair the real phone over trusted HTTPS, verify timestamped poses, recording controls, stale stream handling and reconnect during an attempt. Run suspend/resume and network-loss checks; report unsupported capabilities plainly.
5. Keep physical punch/form accuracy validation separate from this graphics/deployment gate. No physical accuracy or general Fire TV compatibility claim follows from these automated results.

Final gate after refreshed orchestrator evidence: **NOT VERIFIED**. Successful APK rebuild and empty adb target inventory do not establish Fire TV deployment, graphics performance or remote usability. A supported target/hardware or compatible simulator remains required.
