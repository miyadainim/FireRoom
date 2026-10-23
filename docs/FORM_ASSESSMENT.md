# Calibrated prompted form practice

Current recommended camera placement: secure the phone **directly in front of you** at about **knee height**, with the camera **tilted upward**. Adjust distance and tilt to keep the face, shoulders, elbows and both hands visible during guard and punches. If you change an already calibrated camera position, restart setup/calibration. This is setup guidance, not a newly measured accuracy result.


## Repository audit and implementation plan

The repository uses Vite, TypeScript and Three.js without a frontend framework. Phone-only MediaPipe Pose Landmarker 0.10.32 VIDEO inference emits unmodified normalized image landmarks and optional same-frame world landmarks, estimated meters about the hip midpoint. Each joint has a model visibility value. Producer timestamps are monotonic milliseconds; receipt freshness uses a separate local clock. Anatomical indices remain unchanged by mirrored preview. Explicit orthodox maps left to lead; southpaw maps right to lead.

Reuse: src/vision/camera.ts capture; src/vision/guard.ts GuardEstimator; shared v1 PoseFrame validation; pose-only relay; src/graphics/scene.ts ghost arms; existing native DOM controls, pairing and diagnostics. Existing src/vision/recognizer.ts and src/game/coach.ts implement a recognized-punch guard→extension→recovery baseline with lesson scores; existing bounded-coach/DTW is experimental and requires a reviewed reference. Neither is silently replaced.

Dependency order: (1) independent session calibration contracts/statistics → (2) prompted arm lifecycle → (3) three evidence-based criteria → (4) native DOM workflow/stance-aware guide/structured offline Atlas → (5) independent tests and human validation. Engine ownership src/vision/form/**; lead owns UI/integration/contracts/docs; graphics specialist owns additive prompt sampling; V&V owns independent tests and gate report.

## Use

1. Open the HTTPS viewer and pair your phone. Choose the same stance on both clients and keep the phone camera running. You may be outside its view while pressing Start hands-free setup.
2. Press **Start hands-free setup once**. You have10seconds to walk back to your boxing spot and hold guard. Camera framing and guard are saved from the same3-second capture.
3. The next check starts automatically:5seconds to extend the named front arm toward your target, then3seconds capture. Keep the other hand near your face.
4. The back-arm check follows automatically with5seconds preparation and3seconds capture. Keep your feet/phone/target fixed; return to normal guard between poses. A normal small torso turn is permitted. No Next button or computer trip is needed.
5. Optional spoken instructions use browser speech synthesis when available. Visual prompts/countdowns work without audio. Leaving the camera view during preparation is allowed; capture requires a current visible pose. Stopped/stale camera updates pause setup and preserve completed checks.
6. Unclear held samples retry only the current check, with up to2automatic retries. After that, the flow pauses rather than making up a reference. **Stop** cancels the countdown/capture and automatic progression, preserving prior saved checks. Manual retry resumes from that check. There is no silent restart after an interrupted camera.
7. Choose jab/cross to practice. Basic references do **not** enable reach grading. Optional **Improve reach feedback** runs the two shortened-arm comparisons hands-free; grading requires reliable separation. A live skeleton preview shows estimated positions, not proof of correct form. Explicit export includes saved calibration frames and the latest attempt.

## Measurement and limits

Guard calibration samples the unchanged world-geometry GuardEstimator and learns individual face-relative image-plane wrist regions. Assessment checks both the learned region and existing guard observation over time, with temporal tolerance. This adds personalization without replacing the working detector.

Reach is Euclidean world shoulder-to-wrist distance, with separate robust median and variability for each arm. It is **not elbow extension percentage**. The threshold is derived from the individual's separated extended and bent distributions; separation and reliability tolerances are configurable provisional engineering parameters, not validated boxing cutoffs. Held samples do not establish discrimination for dynamic punches; held-out physical trials remain necessary. Above-reference drift abstains rather than rewarding extra reach.

Recovery requires observable stable return to the personalized guard. Criticism of absent recovery requires sufficient observed evidence and timeout; tracking loss produces UNASSESSABLE. Missing elbow observations can leave shoulder-to-wrist reach usable, while elbow-dependent guard evidence abstains. No elbow-straightness diagnosis, force estimate, trajectory assessment, torso-rotation assessment, learned classifier, or raw video storage is introduced.

New optional v1 cameraConfigurationId changes on each capture restart. Session, stance, dimensions and capture configuration changes require recalibration. Moving between held checks does not clear saved references. Shoulder-width changes alone do not establish that the camera moved; an uncertain practice viewpoint affects only that attempt. Undetectable physical camera movement remains possible; restart calibration whenever you move the phone or target. Older senders omit the identifier and cannot reliably expose same-resolution capture restarts.

All model positions and visibility are estimates. High visibility does not prove an unobscured or anatomically accurate joint. Temporal extrapolation is not used as evidence.

## Verification

Run `npm test` and `npm run build`. See docs/validation/FORM_INDEPENDENT_REVIEW.md and FORM_PRACTICAL_MATRIX.md for executed software evidence and outstanding physical checks. The original pose-trial files lack session calibration, deliberate-short-reach distributions, synchronized video and criterion ground truth; they cannot establish this pipeline's form accuracy.

Local HTTPS development: `npm run relay` and `npm run dev:https -- --port 5175`. Phone uses the LAN HTTPS pairing URL and must trust the development certificate. A loopback-only HTTP preview can verify viewer controls but does not validate phone capture or Fire TV execution. No external model credentials are needed for deterministic form assessment or offline Atlas.

Viewer smoke evidence (desktop controls only; no physical camera):

![Calibrated form panel and prompted cross guide](validation/form-coach-ui.png)
