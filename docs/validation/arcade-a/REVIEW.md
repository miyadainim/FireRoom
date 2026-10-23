# Arcade Mode Milestone A — first playable software slice

2026-10-22. Implemented one stationary-player, 60-second virtual sparring round. Stop here before advanced movement/adaptive AI.

## Implementation

- Independent `/arcade.html` entry, reachable from Coach HUD via Arcade · Sparring. Coach logic, phone camera companion, Full pose model, evaluator thresholds and relay implementation unchanged.
- Fixed first-person ring, warm lightweight cel-style procedural opponent, player gloves, impact accents, readable health bars/timer and minimal instructions. No postprocessing or camera shake. The opponent is deliberately simple and can receive later art refinement.
- Deterministic APPROACH → GUARD → ATTACK_WINDUP → ATTACK → RECOVERY loop, bounded range, hit reactions and periodic retreat. Alternates jab/cross telegraphs. Windup1100ms, attack240ms, recovery1350ms. Glove holds extension through impact boundary and recovers over250ms. Damage is authored virtual gameplay: jab7/cross11, opponent8. No force or exact collision claims.
- Early continuous `supportedOutwardMovements()` inputs reuse production recognition. Identity includes source session/camera, stance, anatomical hand and departure timestamp. Duplicate snapshots/recovery cannot score twice;280ms combat cooldown is separate from recognition. Opponent range/blocking independently determine damage; accepted attacks animate even when blocked/missed.
- Current guard uses existing bounded wrist/eye observations and100ms stable hold. Reliably visible movement is open/not-yet-blocking, not missing tracking; this was fixed during integration to avoid pausing every punch. Missing/unclear geometry remains unknown and pauses without defensive damage. No guard threshold retuning.
- Arrival freshness350ms, continuity resets, explicit Resume after loss. Hidden page or a render-clock gap over1s pauses without catch-up attacks. Resuming interrupted opponent attacks returns to guard and gives a full new telegraph.
- Existing phone QR/session/backend routes reused. Full-model phone URL generated with existing pairing helper. Setup dialog is focus-isolated; remote helper reused. Optional round bell follows browser audio policy.
- Review-only `?review=1` enables local saved pose JSON playback through actual input + engine + scene. Persistent RECORDED REVIEW label distinguishes it from live tracking. No uploads, raw-video transport or automatic real-user completion claims. Review playback advances in real time even while combat is paused; it is a diagnostic tool, not synchronized video editing.

## Evidence and gate

| Feature | Result | Evidence / limit |
|---|---|---|
| Jab/cross adapter → actual combat resolver | PASS recorded-data integration | Lab2,4,11 Full each accepted4jab+4cross; no duplicate clip counted; tests/arcade-integration.test.ts |
| Recorded combat outcomes | PASS | Lab2 and4:5hits3blocks each; lab11:3hits4blocks1miss, one explicit simulated Resume |
| Reviewed negative windows | PASS scoped replay | Lab11 guard-only13–14s and behind-body51–54s yield no attack |
| Guard blocks / unknown pause / timer / health / dedupe / cooldown / deterministic AI | PASS automated | Engine and adapter tests; synthetic scenarios are not physical validation |
| Actual browser scene and recorded source | PASS | browser-recorded-events.json:8accepted attacks,5hits3blocks; browser-recorded-finish.png shows92player/53opponent,5guards; pause on recording end at8s remaining |
| Full60s round completion | PASS automated; NOT VERIFIED live | Source-time engine test only; the56s physical recording is shorter than60active seconds |
| Production build | PASS | build.log; existing chunk-size warning remains |
| Full regression suite | PASS | 588/588 tests,64files in tests.log; local replay inputs present so no relevant skips |
| Vega wrapper build/install/launch | PASS | vega-build.log, vega-launch.log |
| Actual native ring/HUD rendering | PASS | simulator.png captured1920×1080 from actual VVD |
| Native directional focus / Select setup | PASS scoped | native-left-focus.png, native-setup-open.png; native automation key events + visible focused menu, not physical remote hardware test |
| Live phone-controlled Arcade round on Vega | NOT VERIFIED | Requires hosted HTTPS setup + actual user test; no current physical test claimed |
| Sustained Vega performance / broad punch accuracy | NOT VERIFIED | No measured FPS/latency or18of20 physical accuracy claim |

Initial automation RPC parameter mismatch returned INVALID_PARAMS; corrected to driver-required nested arguments. Subsequent native screenshots confirm focus and Select activation; successful RPC alone was not treated as visual proof. Native menu captures precede final minor attack-timing/hidden-image polish; the final package was rebuilt, installed and relaunched, and simulator.png was recaptured from that finished build.

## Native verification boundary

Native screenshots use self-contained `file:///pkg/assets/fireroom/standalone.html`, generated with `node platform/vega/probe/package-display.mjs arcade`. This verifies actual native WebGL UI and remote controls, not hosted phone networking. Relative `/api` and Coach navigation are unavailable in this standalone verification target. Live Vega play must use the existing trusted HTTPS hosted wrapper target pointed at `/arcade.html`; phone pairing remains `/` on that host. No public tunnel or new data exposure was created for this milestone. Original hosted-target configuration is retained after the temporary standalone test build.

## Files and reproduction

New: arcade.html, src/arcade.ts, src/arcade.css, src/game/arcade.ts, src/game/arcade-input.ts, src/graphics/arcade-scene.ts, tests/arcade.test.ts, tests/arcade-input.test.ts, tests/arcade-integration.test.ts.
Modified: src/main.ts (Arcade launch link only), vite.config.ts (Arcade build entry), platform/vega/probe/package-display.mjs (optional arcade entry), required status/decision/validation reports. Generated static/native packages are local artifacts.

Browser: run existing relay and Vite servers, open `/arcade.html`. On HTTPS LAN URL, open Connect & menu, Show phone QR code, scan/tap Start camera, show both hands, Start round. On HTTP desktop URL, enter the HTTPS LAN address in setup first. Stance is selected on phone; changing it resets input continuity. Use Left/Right and Select, or mouse/keyboard. Tracking loss requires explicit Resume after camera recovery. Review: `/arcade.html?review=1`, menu → load previous Full-model pose export → Play recorded inputs.

Gate: software/playable recorded-data slice PASS. Overall physical end-to-end milestone gate NOT VERIFIED until one real-phone/Vega60s round validates attack responsiveness, guard defense, loss/recovery and controls. No advanced AI/locomotion work added.
