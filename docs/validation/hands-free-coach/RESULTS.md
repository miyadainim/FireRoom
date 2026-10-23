# Hands-free Coach milestone — 2026-10-23

Current main-journey gate: **PASS — user-confirmed live phone/Vega training through Enter Arcade.** See the final acceptance section; earlier pending statuses below are historical.

## Implementation

The default Coach scene now has one lesson coordinator (`HandsFreeCoach`) and a scene/UI adapter. Existing prescribed evaluator, phone pairing/relay, MediaPipe model, stance mapping, bag impacts and Arcade combat remain in use. Legacy manual beginner/prescribed controllers are moved into an explicit manual diagnostic mode in the drawer; only that mode receives manual guard samples. The prior autonomous introduction is not mounted concurrently.

State path: welcome → connected phone → stance selection/self-confirmation → timed stance shots → guard demonstration → automatic observation → feedback → jab → cross → jab–cross → Arcade invitation. Demonstration/observation/result callbacks carry an epoch. Camera/session/source-order changes invalidate attempts. Source timestamps and a phase-boundary watermark prevent pre-demonstration buffered poses from counting toward the hold.

Guard uses the existing visible wrist/eye region, including the existing upper limit. Continuous hold is now 3000ms in this new flow, measured in source time. There is **no uncertain-frame grace**: an unknown sample pauses/reset holds, known guard breaks reset progress, >350ms arrival/source gaps reset/interruption. This does not measure chin, elbow tuck, foot placement or full guard form. No CV recognition/height thresholds were changed.

Punch practice invokes the existing bounded prescribed controller automatically without the manual countdown. Every250ms of source observations, it may finish early when the existing evaluator confirms sequence and recovery. Otherwise existing5s/8s windows apply. Empty windows continue observation; inactivity history is retained by the coordinator. Supported sustained opposite-hand deviations request retry; uncertain guard evidence is not converted to a fault or perfect-form claim. Three unsuccessful attempts pause with an explanation. Existing attempt15 recovery-reference defect remains unresolved.

Inactivity reminders: after15s then30s of no observable progress, replay demonstration; following45s interval pauses. Known guard is activity for guard practice, not for punch practice. Observable wrist displacement is a guidance-only activity hint, not a punch judgment. Unreliable tracking gets camera guidance. Reading intervals freeze during tracking loss and explicit pause; partial practice restarts safely. Hidden-page events pause. All active work is cancelled on page exit.

No automatic Arcade match launch. Explicit Enter Arcade Mode link uses same-origin/same-tab session handoff and retains the actual phone stance. Existing Arcade readiness/safety checks are unchanged. Practise Again restarts lessons; Return to Main Menu returns to the welcome/setup surface (there is no new separate game lobby).

## Journey after implementation

| Surface | What player sees | Expected action / input | Transition | Possible confusion / recovery |
|---|---|---|---|---|
| Welcome | Gym, Atlas, concise welcome, Connect phone camera | One viewer activation | Opens existing setup drawer and requests QR | Failed QR retains pairing controls/error; services/HTTPS trust still necessary |
| Phone setup | QR and same-Wi-Fi, framing/light/permission guidance | Phone scans, starts camera, permission as needed; viewer Back to training | Fresh phone stream reveals stance setup | Keep camera page open; reconnect via menu |
| Stance self-check | Stance selector and concise posture cue | Select if needed; confirm own setup | Timed full/leg/guard shots | Phone and chosen stance must match; feet are not measured |
| Guard watch | Atlas hand framing then foreground ghost raise | Watch; no mandatory input | Demo deadline | Pause/replay/skip in secondary menu |
| Guard try | “Now you try”, small0.0–3.0s hold indicator | Hold observable guard; no button | 3 continuous source seconds | Break resets; uncertain tracking pauses; fresh reliable frames resume |
| Guard feedback | Grounded encouragement | Read; no button | 6.5s reading interval then jab demo | Tracking/pause freezes reading time |
| Jab / cross / combination | WATCH then YOUR TURN, one coaching message | Copy and return; no button | Existing evaluated movement+recovery, feedback, next demo | Wrong/incomplete/imperfect attempt gets retry guidance; tracking is separate; bounded reminders/retries |
| Training complete | Ren Mori invitation | One explicit Enter Arcade / Practise Again / Return to Main Menu | Selected action | No match starts without confirmation; Arcade controls its safe start |

Counts: normal viewer path uses **3 activations before the first exercise** (Connect phone camera, Back to training, stance confirmation), excluding optional stance changes, remote focus movements, phone scan/camera permission actions and platform certificate provisioning. **Zero mandatory viewer activations between demonstrations and successful practice/lesson progression. One activation to enter Arcade after training.** Before counts are source-derived in UX_AUDIT.md. Normal presentation has one scene/dialogue surface and a secondary setup drawer, not stacked exercise cards. Tests/rehearsal do not establish novice usability.

## Verification

| Check | Result | Evidence / scope |
|---|---|---|
| Automatic practice, guard3s/source timestamps, known break, unknown loss, stale buffered frames | PASS | Core automated tests |
| Inactivity replay/cooldown, bounded retries | PASS | Core tests; no novice behavior claim |
| Pause/resume, feedback freeze, context reset, duplicate completion, exit cancellation | PASS | Core tests |
| Automatic capture/early return result, cancel/retry/manual compatibility | PASS | Five independent adapter integration checks plus prior prescribed tests |
| Jab/cross/sequence/stance regression coverage | PASS | Existing full suite, no detector changes |
| TypeScript + production build | PASS | build.log; existing bundle-size warning persists |
| Full automated suite | PASS | 744 tests /90 files with2workers; tests.log |
| Initial parallel suite | FAIL (timing) | One pre-existing corpus replay exceeded5s during concurrent Vega boot; rerun2workers passed. Initial sandbox-only gateway EPERM was also retried with loopback permission |
| Real browser welcome/pairing/stance/pause; automatic guard/jab/cross | PASS (synthetic poses) | Actual application browser walkthrough/screenshots; no real-phone accuracy claim |
| Real phone end-to-end | NOT VERIFIED yet | User available; fresh QR prepared separately from synthetic session |
| Vega rendering/remote on new flow | NOT VERIFIED | Existing simulator launch attempted; device stayed offline and CLI reported60s boot deadline/unresponsive. Browser is not evidence of Vega success |
| Physical TV remote / actual novice study | NOT VERIFIED | Requires hardware/people |

Current software gate PASS for tested paths; full physical/platform milestone gate remains NOT VERIFIED. Known detector15 regression is not repaired by UI changes.

## Final handoff
Browser synthetic fulljourney completed through jab–cross and final invitation; explicit Enter Arcade reused session and reached TRACKING READY /3-second guard countdown (arcade-handoff.png). Actualphone paired, skeleton confirmed byuser; live exercise results NOT VERIFIED. User requested pause for credit usage. Background rehearsal/capture stopped, regular app services retained. Native boot stalled; no fresh Vega acceptance. Practise Again/Return to Menu handlers were source reviewed; their final branch walkthrough remains NOT VERIFIED.

## Vega walkthrough resumed — 2026-10-23

Fresh native debug build installed/launched on Vega Virtual Device. Initial two CLI launches exited after launch terminal completed; retaining launch terminal keeps qemu/device connected (cause not proven). Actual Appium full-display captures now verify Coach welcome, gym, Atlas, dialogue, focused Connect control and setup drawer. KEY_ENTER opens pairing; KEY_OK did not activate in this trial, so remote key mapping remains qualified, not a full remote PASS.

Found and fixed Coach phone-origin discovery: simulator gateway10.0.2.2 was incorrectly used as phone HTTP origin. Added it to local viewer hosts that discover LAN HTTPS via existing pairing metadata; HTTPS validation preserved. Fresh native screenshot verifies QR generation with LAN HTTPS5175. Native wrapper walkthrough target changed from /arcade.html to / for Coach; original generated config backed up at /tmp/fireroom-vega-arcade-target.ts. Build PASS (existing bundle warning). Screenshots in vega-walkthrough/. Awaiting actual phone connection and physical guard/punch walkthrough; no synthetic stream running. Full milestone remains NOT VERIFIED.


## Live walkthrough accepted — 23 October 2026

**PASS — user-confirmed complete live-phone/Vega walkthrough:** guard → jab → cross → jab–cross → Enter Arcade. The user explicitly confirmed this complete sequence after reporting the camera running with a visible skeleton. This supersedes the earlier pending live-graduation status in this report. Native rendering, QR and stance setup were separately captured by the agent; completion of the later lessons and Arcade entry is participant-reported, not an independently reviewed recording of every step.

This acceptance covers the main functional training-to-Arcade journey. It does not establish a measured recognition rate, Cloudflare-specific execution of this latest flow, full fight completion, physical TV remote compatibility, actual Fire TV hardware deployment or novice usability. Practise Again/Return to Main Menu and other unexercised branches retain their prior status. Known detector and dependency limitations remain documented; no thresholds or tests were changed for this acceptance.
