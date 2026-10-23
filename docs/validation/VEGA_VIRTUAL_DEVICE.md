# Current gate after Watchman access — October 21, 2026

**Rendering: PASS on this Vega Virtual Device. Overall milestone: FAIL due production remote focus.** Phone/API/physical Fire TV/performance: NOT VERIFIED. Earlier attempt notes below are historical and superseded by these results.

| Requirement | Actual result | Evidence |
|---|---|---|
| Watchman Documents access | PASS, v2026.10.19.00 / fsevents | successful watch-project; watchman-build.log |
| Mac / SDK / runtime | arm64 macOS15.5 (24F74), CLI1.4.5, SDK0.24.12112, simulated OS1.2 TV Ship/102282480 | device-info.json |
| SDK wrapper | RN0.83.0, WebView4.0.2, ReactNativeKepler4.0.1+rn0.83.0; types + Debug build PASS | display-types.log, animation-wrapper-build.log |
| Root tests / production build | PASS,498/498 in51files; production build PASS with existing chunk advisory | resume-tests.log, resume-build.log |
| SDK wrapper Jest | PASS,1/1 template smoke test | wrapper-jest.log; not runtime evidence |
| HTTPS + JavaScript | PASS on https://example.com, native onLoad and bridge payload | probe-events.jsonl |
| Minimal WebGL2 | PASS; WebGL2.0 (OpenGL ES3.0 Chromium),60renderedframes,2drawcalls, sampled GLerror0 | probe-canvas.png, probe-final.png, probe-events.jsonl |
| Minimal probe remote | PASS with explicit probe-only handler:4arrows change focus, Select invokes A/B, Back delivered and retained | final telemetry20:42:19–24UTC; probe-final.png |
| Default spatial navigation | FAIL in original probe:Right arrived but focus remained A | prior telemetry20:39:58–20:40:03UTC |
| Full FireRoom scene | PASS: first-person bag,ring,translucent arms visibly render | fireroom-display.png,fireroom-canvas.png |
| Existing ghost animations | PASS visual execution:jab,cross,jab-cross invoked through existing lesson handlers, early/late captures differ | jab-early/late.png,cross-early/late.png,jab-cross-early/late.png; telemetry labels |
| Dialogue | PASS display + offline handler reply, no observed-punch evidence invented | fireroom-dialogue.png; immediate telemetry precedes async reply, screenshot shows resolved reply |
| Production remote | FAIL:Down focuses pairStart, next Down attempts hidden phoneOrigin, focus stays pairStart; summary controls omitted | telemetry20:45:13–17UTC; unchanged src/main.ts handler |
| Production Select/Back | Back key27 delivered; complete exit/history behavior and remote-only reachability of lesson/dialogue NOT VERIFIED | sceneKey payload; full remote UX gate remains FAIL |
| Console/shader diagnostics | System console inspection works via SDK live log stream; scene console.error interception active; no shader failure reported in captured scene run | live-stream.log,scene-monitor.js,probe-events.jsonl |
| Chrome DevTools | NOT VERIFIED/unavailable:9229 forwarding succeeds, no listener in device netstat, empty HTTP reply | netstat.log; debug builds used |
| Optional phone/API | NOT VERIFIED, not exercised against packaged file origin | no trusted hosted origin provided; user chose packaged build |

60frames does not establish60FPS or sustained performance. glError0 is one sample. Logs include simulator texture-validation, shader-cache permission, native data-root and frame-latency messages; no assertion that the entire system is error-free. Current scene captures verify this build on this VVD only. No physical calibration, camera accuracy, or hardware compatibility claim.

## Packaging and test boundaries

User approved Appium installation and selected a packaged production build. Installed locally under artifacts/vega-test-tools: supported Node22 runtime, Appium2.2.2, official Amazon kepler driver3.30.0. No global uninstall, SDK reinstall or TLS bypass. Appium bound127.0.0.1:4723. Successful full screenshots use supported Appium capture; earlier gwsi-tool-screenshooter failure is not evidence that the VVD cannot capture screenshots (Amazon documents that utility for physical devices).

Watchman verified after user granted Documents access; restored default Metro config. Root Vitest originally picked up SDK Jest App.spec.tsx and failed parsing RN syntax; vitest.config.ts now scopes it to existing tests/**/*.test.ts (all51files/498tests retained). SDK Jest runs separately.

Normal relative Vite output loaded HTML but returned ERR_FAILED for file JS/CSS subresources. Generated self-contained standalone.html from unchanged src/main.ts/imported CSS using esbuild, loaded file:///pkg/assets/fireroom/standalone.html with SDK allowFileAccess. This packaging-only alternative is user-approved. It is not evidence that the hosted deployment path or default Vite file package works. Generated display content is excluded from version control; package-display.mjs reproduces it.

Test wrapper injects diagnostics before display load, opens the existing guide and dispatches existing jab/cross/combo lesson UI handlers, then submits synthetic text to the existing Ask handler. This is scripted integration evidence, not a remote-only walkthrough. Scene-monitor does not replace gameplay/CV/graphics code. Native wrapper diagnostic receiver binds127.0.0.1:9137 with VDA reverse; it accepts only test events/canvas screenshots and synthetic test text. Production relay remains loopback and was not exposed. No raw camera data used.

## Files changed / next actions

Added separate platform/vega SDK template, package lock, diagnostic/probe/build/capture scripts and generated probe/target modules; added root vitest.config.ts solely to separate test runners. Updated required reports and captured artifacts under docs/validation/vega-gate. No production src/** or Android project edits, no anime redesign, no contract changes.

1. Fix production visibility/disclosure focus in a scoped follow-up, then rerun D-pad/Select/Back end-to-end. Current milestone FAIL accurately preserves this defect.
2. Provide trusted HTTPS FireRoom origin with explicit /api reverse proxy to loopback relay; validate phone pairing, transport, guided attempt, feedback/replay. Packaged scene cannot establish that gate.
3. Run physical Fire TV compatibility and performance checks separately.

Reproduction commands: platform/vega/README.md. Appium startup: sh platform/vega/probe/start-appium.sh. Screenshots: probe-final.png and fireroom-display.png. Evidence times in JSONL use UTC; local test date is October21 Asia/Singapore.

Official references: [WebView guide](https://www.developer.amazon.com/docs/vega/0.24/develop-your-app-with-webview), [Appium installation](https://developer.amazon.com/docs/vega/0.24/appium-install), [Appium setup](https://developer.amazon.com/docs/vega/0.24/appium-setup), [VDA reference](https://developer.amazon.com/docs/vega/0.24/vda-tools).

---

# Historical first-attempt notes

# Vega Virtual Device gate — October 21, 2026

**Overall: NOT VERIFIED.** Environment discovery, official template generation, wrapper type checking and package build PASS. Actual HTTPS page loading, JavaScript execution, WebGL2, visible meshes, scene and remote input are NOT VERIFIED. No performance or physical Fire TV compatibility claim.

## Environment

- Mac: arm64, macOS 15.5 (24F74).
- Already-installed CLI 1.4.5, active SDK 0.24.12112 at ~/vega/sdk/vega-sdk/main/0.24.12112. No SDK reinstall or external install script run.
- SDK virtual TV image: simulated aarch64, vvrp-tv-arm64, Vega OS 1.2 (TV Ship/102282480). Direct inventory: vega-gate/device-info.json. SDK virtual-device status reported running; VDA enumerated emulator-5554.
- Existing Android Studio and ~/Library/Android/sdk are installed. ADB 1.0.41 (37.0.1-15733141); only Android AVD VECTR_API_35. Android APK project untouched.
- SDK-generated separate platform/vega wrapper uses RN 0.83 and @amazon-devices/webview 4.x; exact installed versions: vega-gate/dependencies.txt.
- FireRoom installed Three.js r180 requires WebGL2. Standard mesh materials, transparent ghost arms, perspective camera; no custom shaders/postprocessing. Source audit only, not Vega compatibility proof.

## Work and actual evidence

| Check | Result | Evidence |
|---|---|---|
| Existing automated suite | PASS | 498 tests / 51 files, vega-gate/tests.log |
| Existing production build | PASS | vega-gate/build.log; existing 552.71 kB chunk advisory |
| Official WebView template | PASS | vega-gate/template.log; platform/vega manifest targets OS 1.2 |
| Wrapper static types | PASS | vega-gate/wrapper-types.log (exit 0), independent reviewer also reran |
| Vega Debug package | PASS | vega-gate/wrapper-build.log; aarch64, armv7, x86_64 vpkg outputs |
| Virtual OS boot/discovery | PASS | boot.log says ready; device-info.json and VDA enumeration |
| App install | PASS by SDK report | launch.log reports installed; initial launch eventually reports successful |
| Observable app launch | NOT VERIFIED | subsequent launch waits at “Sending: pkg://…”; no app UI evidence |
| HTTPS page / JS | NOT VERIFIED | no onLoad/probe payload received |
| WebGL2 and Three meshes | NOT VERIFIED | no context result or image; build is insufficient |
| Console/shader inspection | NOT VERIFIED | loopback 9229 forwarding succeeds, HTTP /json/list returns empty reply |
| Remote D-pad / Select / Back | NOT VERIFIED | no live input test; probe implements telemetry and Back capture |
| Full FireRoom / phone | NOT VERIFIED | blocked by minimal-probe gate; not attempted |

## Runtime blockers and limitations

First startup reported ready, then inventory temporarily showed stopped/no devices. A retry provided runtime inventory. Later device discovery was intermittent while raw VDA enumerated the emulator. One clean SDK stop/start was attempted; virtual OS booted again but lifecycle calls remained unobservable/hung. Do not infer a proven emulator crash from a transient inventory result.

`screenshooter` failed with buffer-file Permission denied / invalid argument. Alternate `gwsi-tool-screenshooter` hung and produced zero-byte files. No valid screenshot exists; zero-byte probe.png is a failed capture artifact, not rendering evidence. Virtual GPU stderr contains repeated `sPrepareTexImage2D ... failed validation` and `GLSL feature level 130`; attribution to app rendering is unproven.

Initial `log` command was unavailable; virtual developer shell directs use of `loggingctl`. An initial since-time argument was split by the CLI and rejected; corrected attempts and lifecycle status are preserved. No shader success/failure conclusion is supported by these logs.

First wrapper revision incorrectly used unsupported injectedJavaScript prop; V&V caught TS2322 despite Babel/package build success. Corrected wrapper uses typed WebViewMethods ref.injectJavaScript in onLoad. Independent type check PASS. Metro's Watchman watch-project stalled; wrapper-only resolver.useWatchman=false allowed build. No production change.

SDK template npm install reports 78 audit findings (15 moderate, 63 high). No automatic dependency upgrades applied; dependency remediation is outside this compatibility gate. Debug wrapper is for local testing.

Existing FireRoom remote selector omits summary disclosures; scene starts inside collapsed “Boxing demonstration.” Need actual remote test before claiming the guide is reachable. Existing Android HTTPS placeholder is not a deployed FireRoom origin.

## Next actions / human check

1. Confirm that the Vega virtual-device GUI is visible and responsive on this desktop, including its home screen/remote. Current native UI inventory did not expose a selectable simulator app; CLI capture failed.
2. Recover lifecycle/compositor/debugger availability using installed SDK tooling; preserve logs before any reset/reinstall. Do not reinstall SDK merely because rendering is unverified.
3. Follow platform/vega/README.md to run corrected aarch64 debug package and inspect localhost:9229. Capture actual probe image and JSON context result, then test all remote directions/Select/Back.
4. Only after probe PASS, use a reachable trusted HTTPS FireRoom origin and validate unchanged scene. Phone integration requires trusted HTTPS plus correct /api reverse proxying; relay remains loopback and was not exposed.
5. Test on physical Fire TV hardware independently; virtual-device results cannot establish device performance or physical compatibility.

Official reference: https://www.developer.amazon.com/docs/vega/0.24/develop-your-app-with-webview (preferred focus, system Back events, SDK injection bridge and Debug/9229 workflow). Package/launch instructions: platform/vega/README.md.

No CV, gameplay, Android, scene design, shared contract or production source changes. Gate remains NOT VERIFIED pending runtime evidence.

### Final diagnostic update

Corrected probe package install/launch command also eventually reported “Successfully launched the app” (launch-corrected.log), but this still supplied no observable WebView evidence. Final lifecycle-status.log reports **BOOTING**, with `System has not been booted with systemd as init system` / `Failed to connect to bus: Host is down`. Therefore CLI-ready plus shell/discovery are PASS only for VM start/connectivity; **complete runtime readiness is NOT VERIFIED**. This may reflect developer-shell restrictions as well as runtime state; root cause is not established. Corrected loggingctl captured runtime-final.log with system service privilege errors; these are not app shader results. Final localhost debugger request still returned empty reply. Exact dependencies: WebView4.0.2, ReactNativeKepler4.0.1+rn0.83.0, ReactNative0.83.0. Final rebuilt package present at platform/vega/build/aarch64-debug/fireroomvegaprobe_aarch64.vpkg.

Independent final V&V reviewed the composed probe/full-scene/dialogue images, paired jab/cross captures and focus telemetry/source. Agrees rendering PASS, explicit probe navigation PASS with Back delivery only, production remote FAIL, phone NOT VERIFIED. No performance/physical hardware conclusion. Reviewer made no edits. Final wrapper Jest rerun:1/1 PASS (wrapper-jest-final.log).
