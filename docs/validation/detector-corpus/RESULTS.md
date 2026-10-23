# v10 recorded-corpus audit — 2026-10-22

Replayed 14,758 retained pose samples:21 prescribed attempts,6 Arcade captures,20 unique Tracking Lab runs across8 video clips. No new MediaPipe inference was run on raw video; saved poses were replayed. Full and Heavy runs on the same clip are correlated and do not represent20 independent participants/clips.

Comparison control is a temporary reconstructed v9 behavior snapshot: disabled new settledFaceGuard option, restored prior jump branch and prior guard-height sample observation, retained existing Arcade rearmSettledGuard behavior. Archived exported judgments were not used as the comparison because they span older evaluator versions. See replay-audit.test.ts for methodology; its temporary baseline import path must be prepared before rerun. Production source was not changed by this audit.

| Area | Result |
|---|---|
| Prescribed attempts |19/21 unchanged in status,sequence-match,recovery. Cross19 rejected→completed (false extra jab removed). Attempt15 completed→uncertain: recovery regression. |
| Tracking Lab |20/20 identical event lists v9→v10;119 events total. Full labelled windows32/32 expected punch type,0/8 negative windows with events. Heavy same32/32 and0/8. These labels are exported test annotations, not independently recounted physical truth; some windows repeat the same video at different sampling rates. |
| Arcade |6/6 same raw outward-cue count (65 total);5/6 identical events/timing. Capture2 has a jab candidate shifted by1503.1ms and a completed outcome where old control lacked one; no matched video/human count establishes which interpretation is correct. This is recognizer replay, not full game hit/round replay. |

## Open defect: attempt15
Both versions locate jab then cross. New settled-face logic retires an earlier right-hand candidate as guard-adjustment at75338.5ms, establishes that current position as reference, then opens another right-hand candidate at75414.8ms. The later candidate fails to close at the restored guard, leaving recovery unconfirmed. There are no new continuity-helper jump flags in this capture, so jump screening is not responsible. The associated Telegram clip video_2026-10-21_02-57-37.mp4 visually shows one jab,one cross,then both hands back at the face. Video association uses matching practice manifest9c228501… plus approximate filename/duration; video contains no embedded recording ID. See contact sheet. This is a lesson-blocking replay regression and requires a separate recovery-reference fix; do not claim general v10 acceptance from the prior688 passing tests.

## Other unresolved evidence
Attempt20 remains rejected cross→jab rather than requested jab→cross; no matching video/manifest located, so physical correctness NOT VERIFIED. Several older rejected/uncertain attempts remain unchanged. Cross19 opposite-hand guard warning remains deviation after spike removal, so fixing the extra-jab error does not validate the wrist-height proxy. Guard correctness is not established by unchanged punch counts.

## Gate
Recorded corpus regression gate: FAIL due to attempt15. Replaying labelled clips: PASS against supplied labels for the reported windows. Live phone/Vega and overall physical accuracy: NOT VERIFIED. No threshold/model changes made during this audit.
