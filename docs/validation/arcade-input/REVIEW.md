# Previous-recording assessment for Arcade input

2026-10-22. Scope: assess previous user videos and their existing saved MediaPipe landmark streams for continuous jab/cross gameplay. This is an Arcade Milestone A prerequisite, not a claim that the full playable Arcade milestone has been implemented.

## Findings

The current Full model saved streams can supply stable early jab/cross movement cues suitable for routing to player attack animations and combat resolution. No evaluator thresholds or Coach source were changed. The replay uses the current production MovementCycleRecognizer and supportedOutwardMovements(), processing each frame in original order without knowing the requested punch.

| Recording | Saved sampling | Early jab cues | Early cross cues | Completed cycles |
|---|---:|---:|---:|---:|
| Front test, lab (2) | 8 Hz | 4 | 4 | 8 |
| Repeat front test, lab (4) | 8 Hz | 4 | 4 | 8 |
| Same repeat video, lab (5) | 12 Hz | 4 | 4 | 8 |
| October 19 later test, lab (11) | 12 Hz | 4 | 4 | 8 |

Lab (4)/(5) share clip ID and represent the same physical recording. Across three distinct clips there are 24 deduplicated early events, 12 jab and 12 cross. These counts are not an independently annotated 24/24 recognition accuracy result. Prompted intervals alone are not ground truth. Heavy outputs are retained separately in replay-results.json but never substituted for the production Full model.

Videos: fireroom_test_punch_front.mp4, fireroom_18_0ct_video.mp4, video_2026-10-19_16-57-52.mp4. Associations follow prior FRONT_TEST_ANALYSIS, FRONT_REPEAT_ANALYSIS, MOVEMENT_PARTIAL_INSPECTION and FRESH_ELEVEN_EVALUATION reviews. Sparse contact sheets were regenerated locally for this assessment. Prior dense review of the later clip supports eight actual punch-like cycles and identifies negative windows. Transcoding means exact source-hash and frame synchronization are not established. Video hashes are recorded separately in video-provenance.json.

In the later clip, the 13–14s guard-only segment emits no early cue (a partial candidate remains cannot-assess). The 51–54s hand return from behind the body emits no cue or completed cycle. These are useful negative examples, not exhaustive false-positive validation. Other feints may remain indistinguishable from short punches.

Early cues in the four Full runs arrive 250–500ms after the detector's departure timestamp, excluding network, inference and display delay. Relative to eventual mathematical peaks they range about917ms before to125ms after; peak can drift during a held-out movement. Do not label this exact contact or guarantee immediate response to fast sparring punches. Existing clips are controlled demonstrations at8–12Hz, not a rapid continuous sparring evaluation.

## Newer guided exports

All18 saved prescribed-attempt exports were also replayed without prescribed deadlines:15 exports produce at least one early cue,18 cues total (some combination exports produce two). Three produce no cue: (8), (10), (16). These files contain experiments/guard conditions and are not18 confirmed positive trials, so15/18 is not a recognition success rate. No fresh matching-video judgment was made for every export. The export named (1) produces a cross cue but no unrestricted completed cycle: its longer recovery works under the prescribed deadline, while the continuous detector retains a1.8s timeout. Many held/slow demonstrations have the same distinction. Do not wait for the coaching completion verdict to animate Arcade attacks.

## Integration decision

Use an additive Arcade movement-input event from supported outward evidence, preserving the recovered-only PunchEvent contract and Coach evaluation. The event needs anatomical hand, stance mapping, source timestamp, confidence and stable identity (session, camera configuration, hand, departure timestamp). Deduplicate this identity across repeated snapshots and later recovered outcomes. Route one recognized gesture to one attack animation; then resolve range, block state, cooldown and authored damage independently. A recognized punch need not result in opponent damage.

Defense must use recent reliable evidence at the incoming attack window, never onboarding's latched guard success. Reuse existing guard-height/boundary checks with freshness and continuity. The script's bent-arm two-hand guard frame counts only show evidence availability; they do not validate block accuracy or a deployed defense policy. Local transport freshness must be checked independently of producer timestamps. Unknown/lost tracking pauses combat and must not cause automatic damage.

## Verification

- PASS: production Full recorded-data replay emits jab and cross cues; stable identity deduplication; reviewed negative windows produce no early cue.
- PASS: independent specialist replay agrees on all four Full run counts, duplicate source clip and timing caveats.
- PASS: production build; existing regression results in build.log and tests.log.
- NOT VERIFIED: actual Arcade animation/combat execution. No Arcade scene or combat resolver exists in this assessed source tree, and none was fabricated in the assessment script.
- NOT VERIFIED: fast consecutive punches, sustained continuous play, in-game guard defense, live relay/display latency, live Vega controls/rendering,18/20 target accuracy and broad false-positive limits.

Gate: input feasibility supported; first-playable Arcade milestone NOT VERIFIED. Next work is wire these evidence events into the milestone's game-defined combat resolver and animations, then replay these same streams through it and perform a real-phone/Vega round.

## Reproduction and changes

Added scripts/assess-arcade-recordings.ts and this evidence directory; maintained project status, decisions, matrix and known issues. No runtime Coach, CV, relay or graphics source modifications. Raw inputs stay unchanged. Bundled script reads only local files; no raw-video upload or model download.

    node_modules/.bin/esbuild scripts/assess-arcade-recordings.ts --bundle --platform=node --format=esm --outfile=/tmp/fireroom-arcade-assess.mjs
    node /tmp/fireroom-arcade-assess.mjs '<lab2.json>' '<lab4.json>' '<lab5.json>' '<lab11.json>' fireroom_trials/fireroom-prescribed-attempt*.json

Detailed source hashes, model identities, cue timestamps, confidence, cycle outcomes and frame-level guard counts are in replay-results.json. Summary in replay-summary.jsonl. Inputs outside the repository are previous local Downloads files; their absence on another machine is not a software regression.
