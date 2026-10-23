# Fire TV graphics compatibility audit

Audit date: 2026-10-21. **Deployment gate: NOT VERIFIED.** No aesthetic redesign, runtime refactor, detector or gameplay change was made. Only audit documentation and existing build outputs were generated.

## Current rendering architecture

- Browser TypeScript application, Vite 7.1, ES2020 output; Three.js installed r180 (`three` ^0.180.0), no React rendering layer. `src/graphics/scene.ts` owns the scene; `src/main.ts` mounts it and calls `update` from requestAnimationFrame.
- Three WebGLRenderer **requires WebGL 2**, with no WebGL 1 fallback. This is explicit in installed renderer source and [Three documentation](https://threejs.org/docs/pages/WebGLRenderer.html). WebGPU is not used.
- Perspective camera, hemisphere plus directional light, fog, opaque floor/ring/bag primitive meshes using MeshStandardMaterial. Approximately 17 mesh objects by source count, not a measured draw-call benchmark. Bag is a cylinder/stripe group pivoting at its suspension origin; there is no chain or simulated cloth/physics.
- Two translucent procedural forearms/gloves (`opacity .5`, `depthWrite false`) render in first person. CPU-authored extension/recovery curves support jab/cross/combo and anatomical stance, at .25/.5/1 playback. These are visual guides, not calibrated player overlays.
- Antialiasing off, low-power preference, device-pixel ratio capped at 1.5. This is not an absolute render-resolution cap; a large TV surface may still create excessive pixels. No postprocessing, shadows, imported gym/character assets, toon shader, skeletal character animation or lip synchronization exists yet.
- Scene lives in a disclosure panel. Rendering continues through the main update loop; no explicit hidden-panel/background GPU pause or WebGL context-loss recovery is implemented. Renderer construction errors are caught and shown, but rendering is then unavailable.
- Coach dialogue/results are HTML/CSS, not 3D text. Guided attempts and concise feedback work separately from the older lesson reducer. Existing bag `hit` calls come from the older recognition/scoring path; prescribed v8 findings are not yet a dedicated bag-response event path.
- MediaPipe Tasks Vision 0.10.32 runs camera inference on the phone. The TV receives pose data and runs deterministic assessment; it does not need TV camera inference. QRCode 1.5.4 handles pairing. Production camera code is a separate lazy-loaded chunk.

## Deployment recommendation

**First choice for the existing code: select a specific Fire OS device and use the existing Android WebView shell.** `platform/android` already provides an HTTPS-hosted display APK, Leanback launcher, Internet permission, minimum API25/target35, local DOM storage and native D-pad dispatch. It has no TV camera/microphone permission, no insecure certificate bypass and no raw-video upload. This minimizes architecture changes, provided that exact device's WebView can create a working WebGL2 context and run the application APIs.

This is a recommendation, not a compatibility certification. [Amazon's hybrid-app documentation](https://developer.amazon.com/docs/fire-tv/build-and-test-your-hybrid-app.html) documents the WebView route. Its older [web-app platform page](https://developer.amazon.com/docs/fire-tv/getting-started-with-web-apps.html) explicitly warns about Stick WebGL support; it does not establish WebGL2 support for our exact WebView/model. Do not infer compatibility from Android API level, advertised OpenGL ES support, Silk, or a desktop browser alone. Select the model and probe the actual runtime.

The APK loads a hosted URL; it does not bundle `dist` or the Node relay. Current audit APK uses intentionally invalid `https://fireroom.invalid/?display=tv`. Before installation, configure a real device-trusted HTTPS URL serving both built assets and `/api` routes. Vite's proxy and LAN-address discovery middleware are development-only. Production hosting must route the relay and provide a reachable pairing origin. The relay binds loopback and must remain behind the host/reverse proxy. Phone and TV cannot use the computer's `localhost` interchangeably.

**If the actual target runs Vega OS:** retain the web application, but create a separate React Native for Vega WebView shell and `.vpkg`; the Android APK is not the Vega deployment artifact. Amazon provides a [WebView template and Chromium-based component](https://developer.amazon.com/docs/vega/0.24/overview-of-webview). This repo has no Vega shell, manifest, package or located Vega CLI/virtual device. Reviewed documentation does not establish our WebGL2 context or shader compatibility. Amazon lists WebGPU and file upload/download limitations. Keep video/export diagnostics on the phone/computer; do not depend on TV downloads. Vega packaging and runtime checks are additional work, not an accomplished port.

Amazon documents a [Vega Virtual Device](https://developer.amazon.com/docs/vega/0.24/run-apps); it is distinct from a generic Android AVD. Its [web-app guide](https://developer.amazon.com/docs/vega/0.22/develop-your-app-with-webview) specifies M-series virtual-device support for Web Apps. This computer is arm64, but that fact does not provide an installed simulator or prove GPU compatibility. Hardware testing remains necessary after virtual-device checks.

## Planned aesthetics: conditional feasibility

These are engineering recommendations conditional on passing the target gate, not measured compatibility results.

| Feature | Practical implementation | Risk / simplification |
|---|---|---|
| Anime gym | Low-poly static environment, shared materials, modest texture atlases, baked shading | Avoid dense decorative meshes, many unique materials, large transparent layers and unbounded 4K textures |
| Cel shading | MeshToonMaterial or simple banded lighting, initially one directional light | Test actual shaders; avoid full-screen edge detection, multiple outline/postprocess passes and dynamic shadow stacks initially |
| Ghost arms | Retain current low-poly animation, restrained transparency or an opaque stylized alternative | Alpha overdraw/sorting can be expensive or visually wrong; validate occlusion against bag |
| Coach character | Start with a 2D portrait/expression sheet in DOM, then profile a small animated 3D model if needed | No need for expensive hair transparency, cloth simulation, dense skinning or real-time lip sync for the gate |
| Dialogue | DOM panel with readable TV text, brief lines, focusable explicit actions | D-pad, Select, Back and scrolling need target validation; speech synthesis availability/voices are not established |
| Bag feedback | Existing simple pivot/easing, later driven by prescribed evidence | It is virtual feedback, never force; do not connect it to an overall form claim |

Avoid assuming WebGPU, compute shaders, desktop-only extensions, high-dynamic-range render-target support, real-time reflections, SSAO/bloom/depth-of-field, complex physics or many skinned characters. Add effects one at a time after profiling. Proposed initial performance target: at least 30 FPS at a fixed 720p internal resolution, then evaluate 1080p; this is **not measured performance** and is not currently enforced by code.

## Actual evidence

| Check | Result | Evidence / limit |
|---|---|---|
| Existing automated suite | PASS | 498/498, 51 files; `docs/validation/fire-tv-graphics-gate/tests.log` |
| Web production build | PASS | TypeScript + Vite, 100 modules; existing main bundle >500kB advisory; `build.log` |
| Fire OS APK build/signature | PASS | Existing script rebuilt configured-placeholder APK; javac source/target8 and deprecated-API warnings; `apk-build.log` |
| ADB target discovery | No target connected | Initial sandbox service-start denial; permitted retry started ADB and returned an empty device list. No LAN scanning or guessed device connection attempted |
| Installed emulator | Not a Fire TV target | `emulator -list-avds`: VECTR_API_35. Configuration identifies pixel_7 and android-35/google_apis/arm64-v8a |
| Vega tools/target | Not located | No `vega` on PATH, no discovered installation in inspected local locations; no Vega project in repo |
| Actual Fire TV install/render | NOT VERIFIED | No compatible connected target available |
| FPS/frame-time, memory, thermals | NOT VERIFIED | No target measurements; build size and animation tests are not GPU benchmarks |
| Remote navigation | Source gap identified; runtime NOT VERIFIED | Native focus selector omits `summary`; web selector also omits disclosures/links and does not filter hidden controls. Native arrow interception on selects/inputs needs testing |
| Phone-to-TV HTTPS/pairing/record controls | NOT VERIFIED | Existing phone/desktop user walkthrough does not establish Fire TV TLS, networking or timing |

No isolated bag scene was added or run because the user's conditional compatible-target requirement was not met. The current scene already supplies a camera, simple bag and lighting; extracting a target probe is deferred rather than changing production graphics during an audit.

## Required before aesthetic implementation

1. Supply the exact Fire TV model/OS and either an authorized reachable Fire OS device or an installed compatible Vega Virtual Device/device. No provider credentials are needed for basic local graphics; simulator setup may require developer tooling access.
2. Serve the production app and relay at a trusted reachable HTTPS origin; configure a test package with that origin. Preserve TLS validation.
3. On that target, run an isolated camera + hanging cylinder bag + basic light probe without modifying the Coach scene. Record model/OS/WebView, WebGL2 context, shader compile errors, renderer dimensions and screenshot/logs. If WebGL2 fails, decide a runtime/renderer fallback before commissioning 3D assets.
4. Measure frame times for a 60-second bag idle/reaction run and a longer combined phone-pose session; record average and percentile frame times, dropped/long frames and context loss. Escalate the chosen render resolution only after baseline is stable.
5. Correct focus coverage for disclosures, selects, scrolling, activation and Back; verify every primary Coach action by remote. This is a source defect identified by audit, not fixed here.
6. Run phone pairing, pose delivery, guided attempt, feedback, retry/next, disconnect/reconnect and recording control on TV. Verify speech fallback, sleep/resume, HTTPS trust and diagnostic export location separately.
7. Independent V&V reviews target evidence before declaring deployment PASS. Only then freeze a visual budget and begin the gym/character redesign.

Independent audit: `docs/validation/FIRE_TV_GRAPHICS_GATE_REVIEW.md`. **Current gate remains NOT VERIFIED; aesthetic development should wait on target/runtime and remote validation.**
