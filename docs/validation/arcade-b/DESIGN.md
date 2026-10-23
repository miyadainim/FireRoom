# Arcade Milestone B — combat rules

Recognition, technique and virtual contact remain separate. Existing supported outward cues immediately animate the correct player glove; the deterministic engine resolves range/blocking and applies base damage on a landed hit. Technique assessment cannot delay that reaction.

## Damage

All values are authored game balance, not force or experimentally calibrated biomechanics. Configuration: src/game/arcade-combat-contracts.ts.

- Jab base10; cross base14.
- A PASS starting guard adds10% of that hit's base.
- A PASS opposite-hand guard adds20%.
- A PASS recovery adds20%.
- FAIL and UNKNOWN add no bonus; neither subtracts base damage. UNKNOWN is never labeled a guard failure.
- A clean jab–cross adds30% of cross base(4.2), once, when both distinct landed attacks occur in order within1500 active milliseconds and all six criteria PASS. A blocked/missed intervening attack cancels the pending sequence. No full guard reset is required between attacks by the sequence tracker.
- Each hit ledger is keyed by the exact existing recognition ID. Assessments settle once; bonus damage cannot animate another strike or increment hit/combo counts. HP is clamped at0.

## Evidence

Existing image-plane wrist/eye boundary guard and opposite-hand height assessments are reused. Orth/southpaw mapping follows the anatomical hand from the recognizer. Recovery requires an actual observed two-hand guard hold after return; wrist return alone is insufficient. Missing geometry/tracking is UNKNOWN. Evidence has a2500ms producer-clock bounded window. The engine independently expires eligible ledgers after2500 active gameplay milliseconds. These are separate clocks and are never subtracted across devices.

Cues remain the existing confidence-gated outward events. No new hip rotation, punch speed, force or exact extension requirements were introduced. An imperfect recognized punch still receives normal base gameplay feedback.

## Pause, loss and pending assessments

Gameplay, streak windows and engine assessment deadlines freeze during manual pause and tracking uncertainty. Controller queues final assessments while frozen; application waits until reliable running combat. Rematch/exit clears that queue and input evidence. Permanent tracking loss yields UNKNOWN remaining evidence; no invented failure. All unresolved bonuses are discarded on finisher entry or terminal round end. An assessment for an unknown, expired, duplicate, mismatched or stale event cannot mutate a later hit or new round.

## Hit streak

Only landed hits increment the streak. Each landed hit refreshes a2000ms active-time window. Blocked/missed/duplicate/weak events and delayed bonuses do not increment or refresh it. Highest streak and total hits are independent. No streak damage multiplier.

## Finisher

FIGHTING → FINISHER_INTRO(900ms) → FINISHER_READY(up to10 active seconds) → FINISHER_IMPACT(140ms) → KNOCKOUT_ANIMATION(1800ms) → RESULTS.

Zero opponent HP from base or delayed bonus enters once, cancels attacks and discards pending bonuses. READY requires a new distinct supported jab/cross, not a replay of the lethal attack. That gesture animates once and does not count another regular hit/damage. Opponent attacks cannot run in finisher phases.

Skip finisher is remote-accessible during intro/ready, including a tracking-induced pause. It skips the strike/impact and starts the authored knockout without pretending a punch was recognized. The10-second READY timeout uses the same no-strike path. Interactive finisher tracking loss freezes/pauses safely; the already-confirmed impact/knockout can finish without camera evidence. Manual menu/visibility pause still freezes the cinematic.

The fixed-camera animation is virtual: short impact accents, backward travel inside the ring and a controlled fall; no ragdoll, force estimate, locomotion request, broad screen flash or camera shake. Time-expired wins on remaining HP show a normal result rather than inventing a knockout.

## Telemetry

validate=1 exports source pose timestamp, recognition timestamp, local hit arrival/result, first render-submission timestamp, final assessment/additional damage, combat phase transitions and prior transport diagnostics. Render submission is not measured GPU presentation latency. Synthetic review frames are explicitly labeled and are not physical validation.
