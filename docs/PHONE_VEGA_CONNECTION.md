# Phone camera → Vega Coach Mode

Status: hosted app + real QR session PASS. Real-phone camera, Full inference, Vega pose receipt, guided attempt and reconnect await live evidence. No synthetic frames used in this integration run.

## Connection architecture

Phone browser and Vega WebView → trusted HTTPS Cloudflare quick-tunnel origin → outbound encrypted tunnel → gateway127.0.0.1:8790 → existing relay127.0.0.1:8787.

Gateway serves only production dist files and allowlisted /api endpoints. Session creation and recordingPOST require private controller authorization; frame/recordingGET require a gateway-created128-bit session capability. No permissive CORS. Limits:20KB frame body,2KB recording body; frame fields allowlisted. Production relay is never directly tunneled. Raw camera video remains phone-local; numeric pose/control metadata traverses Cloudflare and the Mac. Temporary origin is public; pairing URL is a capability and should be shared only with the test participant.

Vega obtains the temporary controller token at runtime through VDA reverse to host loopback9137. It is not embedded in the native app or static website. The user approved its HTTPS transit through Cloudflare. Stopping gateway revokes its sessions; restart creates a fresh token. Navigation is restricted to exact hosted origin. TLS validation stays enabled. Preserved packaged fallback: artifacts/vega-preserved/fireroom-packaged-aarch64.vpkg.

## Run from repository root

Requires existing Node24, cloudflared, VegaSDK0.24.12112. No reinstall needed.

Terminal1:
```sh
npm run build
node scripts/relay.mjs
```
Terminal2:
```sh
node scripts/dev-gateway.ts
```
Terminal3:
```sh
cloudflared tunnel --url http://127.0.0.1:8790 --no-autoupdate
```
Copy the new HTTPS origin printed by cloudflared. Quick-tunnel hostname changes each restart.

Terminal4:
```sh
node scripts/phone-vega-diagnostics.mjs
```
Terminal5 (replace HOSTNAME with current trusted origin):
```sh
node platform/vega/probe/configure-hosted.mjs https://HOSTNAME.trycloudflare.com
vega virtual-device start --timeout 45
vega exec vda reverse tcp:9137 tcp:9137
cd platform/vega
./node_modules/.bin/tsc --noEmit
vega exec npm run build:debug
cd ../..
vega run-app platform/vega/build/aarch64-debug/fireroomvegaprobe_aarch64.vpkg com.fireroom.vegaprobe.main -d VirtualDevice
```

Keep the launch terminal open if the simulator closes when its parent exits. Hosted wrapper opens existing guide and clicks Show phone QR automatically. It runs no synthetic punches or guided attempts. Explicit ?poseModel=full passes into QR; ordinary app default stays Lite. Phone displays model-ready only after successful Full initialization. CPU backend and recognition/evaluation thresholds are unchanged.

## Actual-phone procedure

1. Scan QR from Vega. Open in normal phone Safari/Chrome, tap Start camera, allow camera. Check Full ready/CPU and visible skeleton. Model/WASM downloads need Internet.
2. Confirm Vega Connected and increasing real landmark sequence metadata in docs/validation/phone-vega/vega-events.jsonl. Gateway metadata log is docs/validation/phone-vega/gateway-events.log. Neither log stores landmark coordinates/video.
3. In Vega choose Jab→cross, Watch demonstration, then Start guided attempt. Hold guard, perform controlled jab–cross on countdown, return to guard. Read actual feedback; download attempt JSON if desired. This is physical user participation, not automation.
4. Tap Stop camera on phone: Vega must become stale/paused after750ms. Restart camera: same session should reconnect with increasing sequence and fresh configuration. For network loss, turn phone Wi-Fi off briefly (and cellular off if checking complete loss), then restore and retry. Do not infer a successful reconnect without Vega evidence.

Known production remote-focus trap can block remote-only access to lesson controls; use simulator pointer for this camera integration test and report that limitation. No CV/gameplay changes should be made merely to force an assessment PASS. General physical accuracy is not established by one attempt.

## Diagnostics / cleanup

Actual simulator screenshots:
```sh
sh platform/vega/probe/start-appium.sh
# another terminal:
vega exec vda shell touch /tmp/automation-toolkit.enable
node scripts/capture-phone-vega.mjs
```
Outputs in docs/validation/phone-vega. Appium binds loopback4723. WebView9229 debugger was unavailable in prior gate; local native bridge and Appium provide evidence instead.

Stop cloudflared, gateway, relay, diagnostics and Appium using Ctrl-C in their terminals. Run `vega virtual-device stop`, remove VDA reverse9137, and delete artifacts/phone-vega/controller-token.txt to revoke temporary provisioning. Do not publish that file or private hosted configuration.

## Current evidence

- Prior automated gate:501/501tests53files; root build and Vega wrapper build/typecheck PASS.
- Current HTTPS static request200; public session creation403.
- Hosted Vega onLoad and gateway session-created event around October21 12:41 Singapore time.
- Actual screenshot: docs/validation/phone-vega/hosted-vega.png.
- Real-phone/Full/pose/attempt/reconnect: NOT VERIFIED until live test completes.

## Live phone evidence — October21 12:43 Singapore

User reports Full ready/CPU and visible skeleton after scanning the actual Vega QR and granting camera access. Gateway receives real phone POSTs; Vega bridge independently reports33image+33worldlandmarks at480×640, sequence0→403, and UI Connected✓. Phone QR pairing, camera permission (user report), Full initialization (user report + configuration) and pose receipt in Vega PASS for this live run. No synthetic pose frames used.

Initial287phonePOST summary:279low-confidence,8lost,0tracked. Connection success is not adequate pose quality. User asked to position phone with head/shoulders/elbows/wrists visible before guided Jab→cross. Guided feedback and disconnect/reconnect remain NOT VERIFIED pending user participation. Connection screenshot phone-vega/phone-connected.png; aggregate metadata gateway-events.log/vega-events.jsonl. No raw landmark coordinates/video saved by these diagnostics.

Live guided flow update12:44Singapore: Vega showed Holdguard3→2 countdown; later observed lost/low-confidence frames and then Updatespaused / Attemptcancelled at04:44:24UTC. No assessment rendered. Cause (userstop/pagebackground/network/runtime) not established; user clarification requested. This is NOT a technique failure. Reconnect and completed feedback remain NOT VERIFIED.

## Final live integration gate — October21 12:49 Singapore

**PASS for the observed real-phone → HTTPS → Vega Coach Mode walkthrough, with reliability defects open.** The initial status sections above are historical; this section records completed live evidence.

| Integration step | Status | Evidence and limits |
|---|---|---|
| Restricted shared HTTPS origin and routing | PASS | hosted app loads in Vega; actual QR session created; public create403/static200 |
| Actual phone QR pairing | PASS | user scanned QR; corresponding real phone traffic and Vega Connected |
| Camera permission / Full model | PASS, human-confirmed | user reports Full ready and visible skeleton; explicit Full configuration/ready callback. Vega does not independently measure model variant |
| Real landmarks delivered inside Vega | PASS |33image+33worldlandmarks, changing sequence and Connected status; no synthetic poses |
| Guided real jab-cross / feedback | PASS functional walkthrough | real countdown→attempt→feedback, actual screenshot; completed movement/recovery outcomes at04:46:45,04:47:08,04:47:23UTC |
| Camera Stop/Start reconnect, same QR | PASS | user performed Stop,wait5seconds,Start; actual stale→Connected and new configuration/increasing sequences; no new session |
| Unexpected stop/cancellation diagnosis | NOT VERIFIED; open issue | user says stopped by itself; initial cancellation first sampled04:44:08UTC while connection sampledConnected; cause not established |
| Forced network-interface outage recovery | NOT VERIFIED | camera Stop/Start tested, not controlled Wi-Fi/cellular outage |
| TV remote-only navigation | FAIL, existing defect | focus trap from earlier platform gate; mouse controls used for walkthrough |
| General physical coaching accuracy / Fire TV hardware | NOT VERIFIED | no held-out18of20trial study or physical FireTVdevice test |

Controlled reconnect evidence: last frames before pause around04:48:36UTC, Vega Updatespaused04:48:37.542, gateway POSTgap6.354seconds ending04:48:42.639 with newcameraConfiguration and sequence5890, Vega Connected04:48:43.538 with subsequent sequences5897/5971. Same pairing retained. The camera configuration changed, so an active attempt must be restarted rather than stitching contexts.

Earlier outcomes also included sequence-not-confirmed and insufficient-evidence feedback. Three completed outcomes are not a3/3recognition-accuracy claim. Initial lowconfidence/lost tracking improved to tracked during successful attempts. No CV threshold, scoring rule or boxing-evaluation algorithm was changed to obtain these results. Extension remained cannot-assess where references were unavailable.

Correcting the interim interpretation: the initial cancellation was NOT proven caused by stale transport; cancellation was sampled earlier than the later Updatespaused event. The user reports it happened automatically. Transient HTTP/frame gaps and occasionally a350msstart-readiness rejection while the750msconnection label still saysConnected remain known reliability/UX limits. No HTTP/model error telemetry from the phone was captured at that moment, so root cause is unknown.

Evidence: phone-vega/real-attempt-feedback.png,vega-events.jsonl,gateway-events.log,live-results-summary.json. The Vega monitor's count is the number of non-null HTTP frame responses sampled, possibly including repeated sequences; it is not accepted-frame count,FPS or recognition count. Logs retain aggregate metadata/feedback, not raw camera video or landmark coordinates. Successful recording/download of phone-local video was not verified.

Latest software evidence:501/501tests53files, productionbuildPASS; resumed Vega wrapper typecheck/DebugbuildPASS. Independent V&V reviewed actual feedback screenshot and live telemetry, confirms functional walkthrough and preserves accuracy/reliability limits. Packaged fallback remains available. Test services remain running for this session; use cleanup instructions above when finished.
