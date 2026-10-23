# FireRoom Vega compatibility probe

Separate SDK-generated `vegaWebview` application; does not alter Android or FireRoom production source.

Generated with SDK 0.24.12112 / CLI 1.4.5, RN 0.83, WebView 4.0. OS manifest targets Vega 1.2. Uses SDK template dependency versions and records resolution in package-lock.json.

From repository root:

```sh
node platform/vega/probe/build.mjs
cd platform/vega
vega exec npm ci
./node_modules/.bin/tsc --noEmit
vega exec npm run build:debug
cd ../..
vega virtual-device start --timeout 45
vega run-app platform/vega/build/aarch64-debug/fireroomvegaprobe_aarch64.vpkg com.fireroom.vegaprobe.main
vega exec vda forward tcp:9229 tcp:9229
```

Use Chrome `chrome://inspect/#devices` (localhost:9229) for console/shader inspection. Debugger is loopback only. Do not use `vda -a`, expose the relay, or bypass TLS errors.

The wrapper first loads trusted HTTPS `https://example.com`. After load, it injects the locally bundled Three.js r180 test into that page using the SDK's supported ref method. This tests remote HTTPS plus JS/WebGL2 without publishing FireRoom or fetching a third-party Three.js build. It intentionally replaces the example document with a diagnostic page. `probe/main.js` is the readable source; `src/probe.ts` is generated. No page-load or rendering success should be inferred from package build success.

Expected evidence: JS/HTTPS flags, WebGL2 version/vendor, visible red cylindrical bag and floor, 60-frame report with two draw calls and GL error 0. Console prefix: FIREROOM_PROBE / FIREROOM_WEB. Renderer shader diagnostics are enabled. A frame count alone is not visual proof.

Remote procedure: test all four arrows, observe focus outline between the two buttons, Select each button and observe its label, then Back. The probe deliberately catches Back (keyCode 27), so expected behavior is a visible event while staying on the probe. Logs alone do not establish focus behavior. Prefer simulator remote or physical remote; inputd-cli is available on the virtual OS but was not exercised.

Only after this passes, remove probe injection and set the wrapper URI to the real trusted HTTPS FireRoom origin. Rebuild and verify first-person camera, ring/bag, ghost arms, dialogue and remote behavior. Expand “Boxing demonstration” (initially collapsed); existing page remote selectors omit summary disclosures. Do not patch gameplay/CV to pass. Never label placeholder fireroom.invalid as a working origin.

Phone integration follows rendering: trusted HTTPS origin with `/api/*` reverse-proxied to loopback relay `127.0.0.1:8787`, then pair phone and verify guided attempt, feedback/replay. Vite's proxy applies only to development. No relay publication or phone test performed here.

See ../../docs/validation/VEGA_VIRTUAL_DEVICE.md for actual results and blockers.

## Verified continuation (October 21)

Watchman access is now verified (`watcher: fsevents`); Metro is restored to default watching.
Root Vitest is scoped to tests/**/*.test.ts so it does not ingest this SDK wrapper's Jest tests. Run wrapper tests with `cd platform/vega && vega exec npm test -- --runInBand`.

The test wrapper posts diagnostics to host loopback only:

```sh
node platform/vega/probe/receiver.mjs
# In another terminal:
vega exec vda reverse tcp:9137 tcp:9137
```

This is a native-wrapper test channel, separate from the HTTPS WebView page and the production relay. No pose/video/user messages are transported; the scripted dialogue question is synthetic test text. Receiver saves events and canvas captures under docs/validation/vega-gate.

Select test target before building:

```sh
node platform/vega/probe/select-target.mjs probe
# Or, for packaged unchanged-source display testing:
node platform/vega/probe/package-display.mjs
node platform/vega/probe/select-target.mjs display
cd platform/vega
vega exec npm run build:debug
cd ../..
vega run-app platform/vega/build/aarch64-debug/fireroomvegaprobe_aarch64.vpkg com.fireroom.vegaprobe.main -d VirtualDevice
```

Display mode uses a self-contained file:///pkg/assets/fireroom/standalone.html generated with esbuild from unchanged src/main.ts and imported CSS. The normal relative Vite build failed file-subresource loading on this VVD; standalone packaging avoids those requests. This verifies rendering, not hosted /api routes or phone pairing. Display-mode test actions automatically open the guide, invoke existing jab/cross/combo controls, then submit a synthetic offline technique question. This is a test app, not a production deployment package.

Approved Appium installation is isolated under artifacts/vega-test-tools: Node22, Appium2.2.2, Amazon driver3.30.0. APPIUM_HOME points at artifacts/vega-test-tools/appium-home. Start the Appium executable with Node22, --address 127.0.0.1 --port 4723, and Vega's `vda` directory on PATH. Enable `vega exec vda shell touch /tmp/automation-toolkit.enable`; then run `node platform/vega/probe/appium-capture.mjs`. No global uninstall or SDK reinstall was needed.

Actual default probe D-pad focus failed; explicit probe-only Arrow handling passed all directions and both Select buttons. Production FireRoom D-pad remains defective (hidden input/disclosure focus). Do not infer a production remote PASS from the isolated probe's handler.

Use `sh platform/vega/probe/start-appium.sh` from repository root to start the isolated Appium server reproducibly.

## Streamlined simulator activation (current)

The configured Arcade wrapper uses the verified simulator host gateway `http://10.0.2.2:5173/arcade.html`. It does **not** need `vda reverse` after simulator restart.

With the FireRoom services running on the computer, the daily flow is:

```sh
vega virtual-device start --gui
```

Open the FireRoom app tile. It loads the current app, opens Menu, obtains the computer LAN phone origin from `/__fireroom/pairing`, and requests a QR automatically. Scan on the phone, tap Start camera, choose Back to ring, then hold guard for3seconds. The phone link uses trusted HTTPS5175; simulator HTTP is only the development viewer connection.

Required computer services remain Vite HTTP5173, phone HTTPS5175 and relay8787. Starting the generic Vega emulator does not start project-specific services. If the web server is unavailable, the native app shows a waiting screen and retries every3seconds, with a Retry now control and a15second loading timeout. Hosted HTTPS targets keep controller authorization unchanged.

One-time setup after changing/rebuilding the native wrapper:

```sh
node platform/vega/probe/configure-local-arcade.mjs https://COMPUTER_LAN_IP:5175
cd platform/vega
vega exec npm run build:debug
cd ../..
vega run-app platform/vega/build/aarch64-debug/fireroomvegaprobe_aarch64.vpkg com.fireroom.vegaprobe.main -d VirtualDevice
```

The supplied HTTPS address is a fallback; normal local startup discovers the current address. This is a simulator development setup, not a production deployment or physical Fire TV validation. The earlier loopback/reverse workflow is superseded for this target.

The simulator development manifest explicitly allows HTTP only to10.0.2.2 using network-traffic-policy.cleartext. This is required by WebView4.0.2+; a successful device curl alone does not prove WebView access. Preserve HTTPS for the phone and do not replace the allowlist with a wildcard.
