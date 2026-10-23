# Physical and platform validation protocol

All outcomes below are NOT VERIFIED until an operator records direct evidence. Synthetic landmarks do not count as physical validation.

## Camera recognition

Record device/browser, lighting, distance, stance, model version, build commit, and whether preview is mirrored. Keep anatomical hand labels unchanged when mirroring preview. Obtain consent before recording any video; pose-only logs are sufficient for scoring.

1. Confirm camera permission grant and denial both show useful diagnostics. Confirm inference starts and stops with camera controls.
2. Perform 20 isolated controlled lead-hand jabs and 20 rear-hand crosses, returning to guard after each. Record expected and detected event type, hand, confidence, timestamp, duplicates and misses. Each type requires at least 18/20 correct recognitions.
3. Perform 20 deliberate non-punch actions (guard adjustment, head movement, reaching, stepping). Require no more than one false punch.
4. Perform jab-cross and cross-jab sequences in both orthodox and southpaw stance. Verify only the requested order progresses the lesson. Repeat with mirrored preview.
5. Cover the camera, leave frame and return. Require tracking-loss feedback without technique penalty or phantom punch, then clean recognition after recovery.
6. Complete a Coach Mode lesson using live phone input and verify ghost demonstration, sequence feedback, score and virtual bag response. Scores represent virtual technique evidence, never physical force.

## Phone / TV integration

Use a phone and Fire TV device or supported simulator on the same reachable network. Record model/OS/runtime and build identifiers. Confirm HTTPS camera access (trust local certificate where needed), session pairing, and pose-only network payloads. Test incorrect session, reload, Wi-Fi interruption and reconnection. Verify old queued frames do not trigger punches. Measure observable latency and stale-state transition using local arrival clocks rather than subtracting device clocks.

## Fire TV deployment

Install the produced application using the documented target runtime and SDK. Record installation, startup, render, remote navigation, ghost animation at 0.25x/0.5x/1x, session entry and a complete phone-driven lesson. Capture performance evidence and device logs. A desktop browser build does not satisfy this gate. Verify hackathon eligibility separately against official event rules.

## Coach Atlas

Provider-backed behavior requires configured credentials and a live successful request. Check normal question, timeout, unavailable provider and invalid action output. Confirm answers cite only supplied report observations and never claim force, injury assessment or unseen body motion. Explicitly distinguish deterministic offline responses from LLM output.

### Face-relative guard trial

With the camera at approximately face height, record stable guard, lowered hands, straight arms near the face, hands beside/behind the head, face touching, and rapid wrist pass-throughs. Repeat orthodox and southpaw, with mild body rotation and one obscured hand or face. Compare the displayed guard evidence against manual labels; record unknown separately from observed non-guard. Check that guard establishes after a short controlled hold and that a jab recovers once rather than repeatedly. Depth is a camera-estimated cue and cannot establish anatomical front/behind correctness. Actual classification rates and end-to-end delay remain NOT VERIFIED until these trials are run.
