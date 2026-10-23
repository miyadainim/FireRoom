# Live Arcade recognition validation — in progress

2026-10-22. Fresh browser Arcade pairing prepared; existing HTTPS LAN phone companion and Full model used. No recorded/synthetic source selected. Initial human camera/start confirmation pending.

Plan: five-jab pilot first, compare confirmed actual throws with recognized source events separately from engine hit/block/miss outcomes. Then controlled jab and cross batches (target20each),20non-punch actions,guard defense and tracking loss/recovery. Do not infer recognition accuracy from health/damage. Conditions, stance and actual throw counts must be human-confirmed. No PASS claimed before observations.

Observability-only change: console logs include every recognized cue (including ignored combat results), local arrival time, and round event/pause reason. Animations still trigger only accepted cues. No evaluator threshold, damage, cooldown or network architecture changes. Raw camera video remains on the phone.

Current status: NOT VERIFIED; awaiting user camera readiness and live actions.


Pilot ran with actual Full-model phone frames, orthodox. Recognition cues and combat outcomes saved in pilot-events.json and pilot-summary.json. Round automatically paused on a >350ms tracking-arrival gap; user can relax. Detected jab and cross cues must be reconciled with actual human actions before precision/recall or PASS claims. Human counts and visual responsiveness question pending.


2026-10-22 Live combo defect confirmed and corrected: user reported jab→cross only animated jab and some punches had no reaction. Saved real-phone events show two supported cross cues arriving240.3/241.1ms after jabs were rejected by global280ms cooldown. Combat now applies280ms independently to jab/cross (fixed lead/rear mapping within stance); stable identity dedupe, same-hand rate limit, confidence, range/block and paused-round exclusions remain. Player gloves now use independent per-hand playback so cross start does not cancel jab recovery. No CV threshold changes. Independent recorded-event replay executes both formerly suppressed crosses, and saved real combo11 executes both types.601/601 tests(67files) and production build PASS; independent playback tests cover both stances' hand ordering. Pilot physical counts were not counted by user; do not claim false-positive rate or recognition recall. Fresh corrected live retest remains NOT VERIFIED. Opt-in ?validate=1 keeps bounded local poses/events for this retest without raw video or network upload. Fresh QR prepared; next human task exactly3jab-cross pairs thenholdguard.
