# Milestone D — independent beginner onboarding review

Review date: 2026-10-21 (Asia/Singapore).

## Evidence and scope

Independent V&V added `tests/milestone-d.test.ts`; production implementation lives in `src/game/beginner.ts` and existing graphics/Coach Mode integration. Tests use synthetic landmark fixtures and minimal DOM controls. They verify program behavior, not physical boxing accuracy or a real phone/TV session.

The tutorial reuses `observeGuardHeight` and `assessBoundaryGuard` without changing their thresholds. Required visible observations are both same-side eyes, wrists and shoulders. Elbow visibility and the older nose/elbow/depth `GuardEstimator` are intentionally not additional guard requirements. The tutorial uses a 600 ms continuous source-timestamp hold, resetting on missing observations, reversed timestamps/sequences, changed camera/session/image context or gaps over 350 ms. Before the task completes, arrival freshness and connection reset incomplete holds. Once a 600 ms hold is observed, that historical task success is latched until Retry/restart so the user can lower a hand to operate Continue. Stance teaching is explicitly self-confirmed; foot placement, balance, facial protection, force and injury risk are not measured.

## Feature verdicts

| Feature | Verdict | Evidence / limits |
|---|---|---|
| Orthodox/southpaw selection and lead/rear teaching | PASS (automated) | Independent tests select southpaw, verify right side lead and preserved selection during returning-user skip. |
| Stance setup confirmation | PASS (automated) | Guard completion cannot precede stance confirmation. Setup is self-confirmed, never inferred from feet. |
| Guard Watch and replay actions | PASS (automated) | Confirm and Watch call existing guard demonstration with chosen stance. Browser guard screenshot independently inspected; symmetric outline guard and existing scene preserved. |
| Stable guard recognition | PASS (automated only) | Both stances require 600 ms source-time hold; one hand alone, high or low wrists, duplicate time cannot pass. Physical accuracy NOT VERIFIED. |
| Unreliable tracking and recovery | PASS (automated) | Missing required points, lost tracking, out-of-order frames, changed context and gaps revoke hold; new continuous hold recovers. Occluded elbows alone do not cause a technique failure. |
| Retry, incomplete stale reset and completed-hold latch | PASS (automated and live smoke) | Retry clears completion. Pending holds reset on stale tracking. After a completed hold, lower/lost/stale observations preserve the enabled Continue and instruction to lower hands. |
| Persistence and returning-user skip | PASS (automated) | Valid completed tutorial enables Skip; invalid saved stance does not. Unobserved continuation is stored as `guard: skipped`. |
| No permanent camera gate | PASS (automated) | Explicit Continue without camera confirmation completes onboarding with `skipped`, allowing punch lessons. |
| Existing jab/cross/jab–cross progression and mismatch gates | PASS (regression); live walkthrough FAIL | Existing prescribed progression tests pass, but user reports Jab did not advance. Native trace never left initial waiting status, so no attempt start is evidenced; do not mislabel this as a CV rejection. Root correcting lesson action visibility/entry, actual retest pending. |
| Actual phone tracking on Vega | PASS (narrow live smoke) | User-authorized live phone frames reached Vega. Aggregate gateway metadata records tracked 33 image / 33 world landmarks. Native live event log records guard Continue becoming enabled; user confirmed the enabled control. This is a single-session integration smoke, not accuracy validation. |
| Live lost-tracking revocation and reacquisition | PASS (observed smoke); controlled trial NOT VERIFIED | Native trace records lost/adjust-camera with Continue disabled, then visible-hold and enabled Continue. Deliberate camera-cover/uncover + Retry + Continue-to-Jab trial awaits user confirmation. |
| Physical stance and guard accuracy | NOT VERIFIED | No physical trials performed. Foot placement and balance are intentionally unmeasured. |
| Vega guard scene rendering | PASS | Independently inspected `milestone-d/simulator.png`; actual packaged WebView events confirm WebGL 2.0, document ready, scene canvas, open guide and dialogue. Guard UI and symmetric white ghost hands render. |
| Native Fire TV remote navigation | FAIL (live user report); correction pending | User reports arrows/Select failed. Input handling correction and actual retest required; browser keys or scripted controls cannot override the live finding. |
| Sustained Vega / hardware frame rate | NOT VERIFIED | No measured frame-rate trace or physical TV test. |

## Automated results

- Independent D suite: 26/26 tests PASS after lesson entry and remote corrections.
- Final stable-source full regression: 57/57 files, 538/538 tests PASS.
- Production `npm run build`: PASS (TypeScript + Vite, 111 modules). Existing bundle-size warning remains; it is not a measured performance failure.
- Initial sandbox test run could not bind loopback for the gateway test (`EPERM`); approved loopback-capable rerun passed. No threshold or test behavior was changed to mask this environmental restriction.

## Visual/device evidence

Independently inspected `milestone-d/browser-stance.jpg` and `milestone-d/browser-stance-diagram.jpg`: approved gym/Atlas retained, cream/navy dialogue readable, stance diagram anatomically consistent and clearly labeled as a self-check. Initial stance screenshot showed a stale orthodox ghost-guide label beside a southpaw instruction; root synchronized the caption to the selected stance in `src/main.ts` before the final regression run. Browser screenshots establish rendering only, not live phone tracking or physical accuracy. Also inspected `milestone-d/browser-guard-demonstration.jpg`: symmetric restrained white ghost-arm guard, centered unobscured heavy bag, Atlas instruction pose and readable existing dialogue. Screenshot does not establish animation smoothness or frame rate. Independently inspected `milestone-d/simulator.png`: actual Vega scene retains the approved gym/Atlas; symmetric ghost gloves leave the central bag readable; dialogue and guard actions render without overlap. The disabled observed-guard button is correctly distinct from explicit unverified continuation. `milestone-d/vega-events.jsonl` records local packaged page load, WebGL 2.0, document readiness, canvas/dialogue presence and 180 rendered frames. It explicitly labels simulator self-confirmation as a UI test, not physical validation. Watch guard was exercised. These events establish rendering, not sustained frame rate or native D-pad navigation. Root browser CUA also observed camera-unavailable uncertainty and explicit bypass revealing Lesson 3.

## Live usability defect and correction

**FAIL found during the physical smoke:** the original implementation revoked Continue when the player lowered a hand to select it. Although tracking revocation itself worked, it made successful onboarding difficult to finish. This is a real usability defect, not a recognition-threshold failure.

Correction: latch a completed 600 ms task as historical evidence; show “Guard hold observed. You can lower your hands and continue.” Subsequent lowering, lost tracking or stale arrivals do not erase that completed task. Retry/restart explicitly clear the latch, and unreliable tracking before completion still resets the pending hold. No CV thresholds were changed. Independent D tests now cover the completed-hold latch after lower/lost/stale observations, usable instruction, Continue persistence, Retry clearing and stale incomplete-hold reset. Focused suite: 23/23 PASS after correction. **Live usability fix retest: PASS (single-session smoke)**. User confirmed lowering hands kept Continue enabled and selecting Continue advanced to Jab. Native post-fix trace independently shows the new latch instruction with enabled Continue at 2026-10-21 19:03:27.677 Asia/Singapore, followed by the completed onboarding instruction “Next: jab, cross, then jab–cross” at 19:03:31.694. This distinct state transition establishes explicit onboarding completion rather than merely reading a preexisting hidden punch-progress label. Original defect is resolved in the tested interaction.

## Further live walkthrough failures (unresolved)

After successful stance/guard onboarding, the user reported that Jab did not advance and native arrows/Select failed. Preserve both as live FAIL findings. Native prescribed status remained at its initial waiting text; no attempt-start trace was observed. This points to a lesson entry/action visibility problem that requires a fix and retest, not evidence to retune recognition. Root moved the punch lesson before pairing cards and made Practise/countdown entry explicit; platform input normalization now handles native-probed ArrowRight/39 and Enter/13 and explicit Select. Independent tests verify no automatic fabricated attempt, focus skips hidden/disabled controls, summary activation occurs once, repeat activation is suppressed, native select editing is preserved, and cleanup removes the listener. Focused suite: 26/26 PASS. Source corrections and automated tests do not by themselves resolve these physical UI findings. In particular, remote traversal into and out of native selects still requires actual Vega confirmation.

## Live phone/Vega smoke evidence

Temporary HTTPS tunnel was explicitly authorized by the user after the initial review rejection. Raw video remains on the phone. Independently inspected `milestone-d/live-vega-events.jsonl` and aggregate `milestone-d/gateway.log` metadata; no raw landmark coordinates were copied into this report. The hosted page uses `poseModel=full`. Live phone frames reached the native Vega WebView, with tracked frame metadata showing 33 image landmarks and 33 world landmarks.

Native events show `guardContinueEnabled: true` at 2026-10-21 18:56:38.744, 18:56:49.696 and 18:57:19.742 Asia/Singapore, among subsequent holds. The user confirmed seeing the enabled control. The native trace also records camera-unavailable/adjust-camera with disabled Continue, then `Guard positions visible. Hold briefly.` and re-enabled Continue at 18:57:19.742. This supports a narrow live transport/guard/reacquisition smoke PASS for the initial implementation; the completed-hold latch fix subsequently passed live retest. It does not establish a controlled camera-cover trial, source-pose accuracy, 18-of-20 recognition targets or a full live lesson walkthrough. The `punchProgress` DOM field reads Lesson 3 before completing onboarding because the hidden punch panel already exists; that field alone is not proof that the user advanced to Jab.

Completed-hold latch and explicit Continue-to-Jab are now user-confirmed and native-trace corroborated. Controlled camera cover/uncover, Retry and native input method remain pending user confirmation. Live southpaw, returning-user skip and actual jab/cross classification remain NOT VERIFIED unless separately recorded. End-to-end progression and native arrows/Select currently FAIL by user report, pending corrections and retest.

## Gate

Software acceptance: PASS for tested onboarding behavior. Post-latch full regression: 538/538 PASS across 57 files; production TypeScript/Vite build PASS (111 modules). Live phone-to-Vega stance/guard onboarding through explicit Continue-to-Jab: PASS (single-session smoke). Full controlled physical walkthrough: FAIL by live user report (lesson entry/progression and arrows/Select), pending corrections and retest. Retain that limitation until a human completes controlled loss/recovery, Retry, replay/skip and punch progression using the paired phone on Vega.

## Resumed integration audit

Live user reported no Jab advancement and failed native directional/Select navigation. Native lesson trace remained at the initial waiting instruction with no countdown/attempt-start transition; this establishes missing attempt entry, not an evaluator rejection. Lead moved the existing punch section ahead of connection cards, added explicit Practise/countdown labels and beginLesson guidance, and scrolled to the lesson after tutorial completion. No CV thresholds changed.

Lead integrated the independently authored remote handler, then addressed checkbox focus trapping and select escape (Left/Right navigates; Up/Down edits select options). Select/Enter explicit activation prevents duplicate default clicks; hidden/disabled/collapsed controls are excluded. Browser ArrowDown reached stance, Enter on Skip completed tutorials opened Jab with explicit Practise instructions and no console errors. Final checkbox/select edge tests were extended by lead. Native Vega verification of these resumed changes remains pending; do not relabel the original failed test as PASS.

### Milestone D remote follow-up — 2026-10-22 (Singapore)

User reported that Practise Jab produced countdown and feedback in an earlier test; later fresh retest deferred. This is a user-reported live smoke PASS for attempt entry/feedback, not proof of accepted technique, accuracy targets, or cross/combo progression. User still reports native remote navigation FAIL.

Native diagnostic trace confirms standard Arrow keys reach the WebView and focus moves; it also shows question-input and native-select key handling. Fixed single-line text-field focus trapping (Up/Down exits, Left/Right keeps cursor editing), explicit Up/Down select changes with bubbling change events, Enter/Select confirms selector and moves onward, and visible focus outlines on links/disclosures. No CV or evaluation threshold changes. Browser observed stance changes and restoration, Enter moved to Continue, and Down moved question to Ask.

Evidence: remote-followup-focused.log 27 tests PASS; remote-followup-regression.log 542/542 tests across 57 files PASS; remote-followup-build.log production build PASS (existing chunk warning). Full suite initially blocked by sandbox localhost listen; rerun with local-server permission passed. remote-followup-browser.png captures browser result. Native reload emitted load events at 16:27:12 UTC, but full-display capture showed launcher, so it does not verify updated native navigation. Native remote fix retest, accepted Jab-to-Cross progression, cross/combo physical tests remain NOT VERIFIED. Overall milestone gate remains open.

### Native navigation verification — 2026-10-22 Singapore

Ran the actual hosted FireRoom app in Vega Virtual Device through Amazon's installed Appium driver. Native Linux arrow events (103/108/105/106) and Enter (28), 80ms holds, not synthetic DOM key events. Initial driver press-key endpoint holds for1000ms and caused auto-repeat; switched to supported JSON-RPC injectInputKeyEvent via nested Appium args for brief presses. No production code changed in this verification.

PASS: Right focuses stance; Down switches orthodox to southpaw and updates grounded text; Enter confirms selector and moves to Continue; Enter opens Guard; Right/Left reach Practise/Watch, Enter invokes Watch (guide label/dialogue updated). Up/Down move between Practise and Retry; disabled Guard observed button skipped; Enter on explicit bypass opens Jab; focus fallback reaches Practise jab with visible orange outline. Traversal reaches question field; Down exits to Ask. Evidence native-navigation-verified-events.jsonl (16:37:01–16:37:49 UTC), native-nav-jab.png, native-nav-text-escape.png.

Scope: simulator arrows + Enter activation PASS. Physical Fire TV remote remains NOT VERIFIED. Additional raw Linux KEY_OK352 produced no logged DOM activation; this is not proof of a physical remote mapping. Native graphics in this fresh headless run reported WebGL context creation failure and blank canvas; the navigation PASS does not validate rendering or Watch animation playback. Existing graphics evidence remains historical. Full milestone remains open for physical cross/combo progression and graphics recovery in current simulator configuration.
