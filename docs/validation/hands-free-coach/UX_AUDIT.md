# First-time Coach UX audit

Date: 2026-10-23. Evidence: source inspection of the pre-change `src/main.ts`, `src/game/beginner.ts`, `src/game/atlas-tutorial.ts`, `src/game/prescribed-coach.ts`, `src/ui/coach-screen.ts`, companion markup and dialogue presentation. This is a source audit, not novice usability testing or proof of remote/device execution. Actual browser walkthrough evidence is recorded separately by the integrator.

## Before journey

| Screen or lesson | What appears / player action | Required input and next trigger | Confusion and recovery |
|---|---|---|---|
| Launch | Gym, Atlas introduction, bottom dialogue; Connect & menu | Introduction automatically advances five timed shots over 36.5 seconds, then waits | Camera setup is not the initial primary action; an unpaired player can finish watching without connecting |
| Camera setup drawer | Phone QR button, connection options, numerous advanced tools | Open drawer; Show QR; scan on phone; Start camera; grant permission if needed; return to training | Useful pairing instructions exist, but camera status and failure details are inside the drawer. HTTPS trust/network setup can still require external steps |
| Introduction end | “Now you try!” plus Practise stance & guard | Press final tutorial action (or skip introduction) | The invitation sounds actionable but still needs remote navigation |
| Stance | Selector, foot illustration, self-check | Default orthodox needs no selection input; confirm stance | Correctly avoids automatic foot accuracy claims. Cinematic lead-foot line is fixed to left despite saved southpaw |
| Guard | Watch, Practise, Retry, Continue, bypass | Stance confirmation plays guard animation; Practise must be pressed separately; 600 ms detected hold enables Continue | Does not visibly count three seconds; watching does not activate observation; player can wait indefinitely. Bypass prevents tracking from permanently blocking lessons |
| Jab | Drill selector, Watch, Practise, Cancel, lesson options | Practise starts 3-second countdown, then fixed 5-second capture; success enables Next | `beginLesson()` does not play guide. A successful movement does not advance without a press |
| Cross | Same controls; Next from jab plays demonstration | Practise starts countdown/capture; Next requires sequence and recovery | Requires input after copying coach; technical uncertainty and movement failure must remain distinct |
| Jab–cross | Same controls, 8-second capture | Practise, then Finish session after success | Final action only displays session complete, with no rival introduction or contextual invitation |
| Arcade | Persistent Sparring link in HUD | One link activation navigates | Phone session reuse exists, but link is unrelated to graduation. Fight safety checks must remain owned by Arcade |

## Issues and safe changes

| ID | Current behavior and why it matters | Severity | Safe proposed change |
|---|---|---|---|
| UX1 | Intro runs before phone readiness; first action does not clearly establish camera connection | High | Gate automatic training on connection and fresh frames; keep welcome/connection guidance in dialogue and expose QR prominently |
| UX2 | Guard demonstration and practice have separate controls | High | One lesson controller moves from demo completion to observation automatically; optional replay/pause remains accessible |
| UX3 | Guard uses a 600 ms hold and no elapsed progress | High | Dedicated timestamp-based 3-second requirement with explicit quality/grace policy. Do not retune detector geometry |
| UX4 | Every punch requires Practise, then Next despite success | High | Auto-create scoped attempts after demo; use unchanged evaluator success criteria; brief readable feedback then next lesson |
| UX5 | No automatic inactivity guidance | Medium | Bounded reminders replay relevant guide; progress suppresses inactivity; tracking failures use camera guidance instead |
| UX6 | Introduction has its own timer while practice has countdown/capture timers and status observers | High | Single authoritative guided flow; generation-scoped callbacks and cancellation on pause/context/exit; presentation follows active state |
| UX7 | Large collection of buttons occupies dialogue; detailed status repeats coach message | Medium | Primary area: WATCH/TRY state, one dialogue, small progress. Relocate manual controls, exports, drill selection and experiments to secondary menu |
| UX8 | Current guard/stance bypass and completed tutorial skip are useful recovery controls | High if removed | Preserve deliberate bypass/replay/skip in menu; completion must distinguish observed from skipped |
| UX9 | Final lesson lacks graduation invitation | Medium | Congratulation, Ren Mori introduction, explicit Enter Arcade / Practise Again / Return to Menu; never auto-launch fight |
| UX10 | Fixed left-lead cinematic conflicts with southpaw | Medium | Derive spoken/displayed lead/rear words from selected stance; do not mirror anatomical contracts |
| UX11 | Tutorial pause restarts current shot duration when resumed; opening drawer clears/restarts shot timer | Medium | Preserve remaining reading time and freeze attempt deadlines during explicit pause; reconnect starts safe fresh observation |
| UX12 | Main feedback may be replaced by multiple mutation-observed sources | Medium | Guided controller owns dialogue while active; release ownership explicitly for manual tools and errors |
| UX13 | Failed/stale countdown requires explicit retry, although player may have resumed tracking | Medium | Tracking-paused state gives explanation and safely restarts readiness after current evidence; no stale buffered completion |
| UX14 | Existing remote focus code is attached, but dynamic replacement/hidden controls may change focus | High validation gap | Keep stable accessible menu actions; test D-pad/Select after each transition, focus invitation deliberately |

All proposed presentation/controller changes are in scope. None requires changing CV recognition/guard thresholds, transport contracts, raw-video transmission or Arcade combat logic. Existing attempt-15 recovery-reference defect remains a separate detector limitation; automatic UX must not fabricate success to bypass it.

## Proposed after journey (target, not observed execution)

| Phase | Player sees / does | Required input | Transition and recovery |
|---|---|---|---|
| Welcome / connection | Atlas welcomes; clear scan-phone instruction | Pair/start camera and permissions; reconnect remains available | Current reliable stream enables setup; otherwise actionable camera guidance |
| Stance setup | Choose orthodox/southpaw; self-check feet and posture | Explicit stance confirmation remains appropriate | Stance is instructional, never claimed measured |
| Guard demonstration | WATCH; coach pose and ghost raising hands | None | Cancellable demonstration ends, then “Now you try” |
| Guard practice | TRY; 0.0–3.0-second hold | Physical guard only | Reliable continuous hold completes; loss does not count; bounded replay on inactivity |
| Guard feedback | Encouragement | None | Reading interval then jab demonstration |
| Jab / cross / combination | WATCH then TRY; grounded feedback | Physical movement only | Existing sequence + recovery criteria determine success; uncertainty pauses, incomplete/wrong attempts receive specific bounded guidance |
| Graduation | Atlas congratulates, introduces Ren Mori | None until invitation | Show three explicit destination choices |
| Arcade invitation | Enter Arcade / Practise Again / Return to Menu | One confirmation to enter Arcade | Reuse valid stance/session; retain Arcade readiness/safety flow |
| Secondary menu, any lesson | Pause, replay, skip where allowed, reconnect, stance, diagnostics | Optional | Cancel/suspend active work safely; no simultaneous demonstrations |

## Interaction counts and evidence limits

These are **source-derived lower bounds**, not observed click/key counts. D-pad navigation, phone scanner opening, permission dialogs, certificate trust, network correction and optional demonstration replays vary and are not included.

* Before first guard exercise: **6 viewer activations** on a fresh, unpaired happy path: open drawer, Show QR, close drawer, finish/skip introduction, confirm stance, Practise guard. Plus phone Start camera and any permission prompt. A restored pairing removes setup actions; changed stance adds selector input.
* During guard/punch lessons: **8 mandatory control activations** including starting guard practice: Practise guard + Continue, then Practise + Next/Finish for each of three punches. If counting only after first exercise starts, **7** remain. Watch buttons are optional and excluded, even though first jab does not automatically demonstrate.
* Source minimum visible interaction regions encountered: **4** (main cinematic, setup drawer, stance controls, guard/punch controls); these are regions of one page, not four navigation screens. Phone companion is a separate surface.
* Arcade entry after training: **1** HUD-link activation, but no guided completion invitation currently exists.
* Target after connection/stance setup: **0 mandatory control activations between demonstrations and successful practice**; **1** explicit Arcade entry confirmation. The baseline has eight exercise/progression activations to remove from the normal path. This count remains projected until actual integrated walkthrough.
* No claim is made about actual beginners’ comprehension, physical accuracy, real-phone timings or Vega remote success from this audit. Actual novice assessment and live device validation remain necessary.

## Integration recommendations

Keep `mountPrescribedCoach` as the authoritative evaluator/export/impact adapter; expose start/result controls rather than duplicate movement classification. The automatic flow should own lesson ID, attempt ID, local arrival freshness, source-time baseline, demonstration phase and pending timeout generation. Feed accepted receiver frames once. On context change, pause or invalidate attempt data and require fresh evidence. Do not infer camera readiness from a restored session alone.

Make tutorial framing presentation-only and cancellable, with stance-aware dialogue. Avoid two concurrent owners updating Atlas dialogue. Preserve existing visible safety text in an appropriate welcome/menu location rather than deleting it. Keep manual tools available without allowing them to run concurrently with automatic practice.

The integrator must reconcile this projected after journey against final implementation and actual browser walkthrough, and record PASS / FAIL / NOT VERIFIED independently for simulator, phone and human usability claims.
