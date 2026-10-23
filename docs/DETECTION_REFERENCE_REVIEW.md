# Detection reference review

Audited 2026-10-15. Source inspection only: no upstream Python, pretrained model, or training notebook executed. Upstream descriptions/accuracy claims are not FireRoom validation evidence.

## FormAI

Revision `8df5a2e764aefdb199c8d72fdbdcfa5b250e5a52`.

Source: [boxing_detection_improved.py](https://github.com/ahmaddrashid0/form-ai/blob/8df5a2e764aefdb199c8d72fdbdcfa5b250e5a52/boxing_detection_improved.py).

Actual implementation: per-arm detector accepts externally computed elbow angle and angular speed, smooths angle with an eight-sample mean, and tests absolute consecutive smoothed-angle change against 20 degrees alongside speed bounds of 110–350. It counts at the initial punch transition, applies a 0.4-second cooldown plus a six-frame gap, and moves through guard/punch/recover. Its guard test is angle >140; the angle convention must be verified before borrowing thresholds. Combo counting uses a 1.2-second inter-event interval, not semantic jab-cross ordering. `guard_hold_required` is configured but unused; model_stats is stored but unused. Despite the header's claims, update() has no wrist-direction or torso evidence. An absolute delta does not distinguish extension from retraction, and per-frame thresholds depend on frame rate.

Useful principles: separate arm lifecycle, temporal debounce, explicit diagnostics. FireRoom retains conservative recovery-confirmed events and does not adopt the speed bounds or angle convention.

License inspected: [GPL-3.0](https://github.com/ahmaddrashid0/form-ai/blob/8df5a2e764aefdb199c8d72fdbdcfa5b250e5a52/LICENSE). No source copied or translated; independently implemented general geometry/state-machine concepts.

## AI Boxing Trainer

Revision `39483221bd054afcfc357655470295a4ba269bf4`. Repository contains multiple competing implementations; these are separate code paths, not a single validated detector.

[main.py](https://github.com/jplanetx/AI-Boxing-Trainer/blob/39483221bd054afcfc357655470295a4ba269bf4/main.py): 2D elbow/shoulder angles. Guard needs elbow <60° and shoulder <45°, punch triggers elbow >160°, return below60° updates inverse-duration score. It processes mirrored images and broadly swallows exceptions. This differs from FireRoom's anatomical-label convention and is not proof of accuracy.

[ai_trainer/punch_classifier.py](https://github.com/jplanetx/AI-Boxing-Trainer/blob/39483221bd054afcfc357655470295a4ba269bf4/ai_trainer/punch_classifier.py): short wrist buffers, adaptive displacement threshold, torso-related direction checks, optional pose-tracker 3D trajectory input. Without the optional tracker, type classification returns UNKNOWN. The basic speed calculation is displacement between samples without elapsed time; a torso-axis calculation is horizontal across hips/shoulders rather than a verified forward direction. Some thresholds mix named metric distances with pixels; these are unsuitable for FireRoom's normalized coordinates without calibration.

[balanced_punch_detector.py](https://github.com/jplanetx/AI-Boxing-Trainer/blob/39483221bd054afcfc357655470295a4ba269bf4/balanced_punch_detector.py): angle/confidence rules and persistent label display. Its 130°/0.4 constants differ from the main entry point, illustrating why numerical thresholds cannot be adopted as universal boxing rules.

Useful principles: elbow-angle evidence, short temporal wrist history, normalized movement, readable intermediate measurements. FireRoom implements independent shoulder-relative motion and elapsed-time speed diagnostics; these are normalized pose units, not calibrated physical velocity. Stance remains explicit.

License inspected: [MIT](https://github.com/jplanetx/AI-Boxing-Trainer/blob/39483221bd054afcfc357655470295a4ba269bf4/LICENSE). No source copied or translated in this change.

## ACM temporal classifier

See [detailed ACM review](ACM_SEQUENCE_REVIEW.md). Tree revision independently retrieved through GitHub API: `c9d94ffa0ae24b8065c6c40f5f9f8dc453619676`.

ACM is a temporal pose classifier, not a drop-in MediaPipe model. Important integration risks include a train/inference jab-cross class-order mismatch and differing keypoint conventions. Do not load the public checkpoint into gameplay without resolving preprocessing, labels, negative cases, temporal segmentation, provenance and licensing.

## FireRoom implementation decision

First improve rules: body-relative displacement, guard height evidence, stable per-arm lifecycle, normalized elapsed-time motion diagnostics, and extension-order handling when recoveries overlap. Preserve anatomical stance mapping, confidence rejection and recovery confirmation. No physical thresholds were fitted to user data because no recorded trial exists.

Add opt-in labeled pose-only trial recording/export and deterministic replay. Capture idle/non-punch actions, each hand, both stances, jab-cross/cross-jab, tracking loss, distances and lighting. Export contains estimated body landmarks (no video or live session token); the user chooses whether to share it. Real labels remain user assertions until reviewed.

Escalation gate: if recorded held-out real trials miss ≥18/20 correct jabs, ≥18/20 crosses, ≤1 false punch per20 non-punch actions, correct order, or recovery, first identify whether the cause is pose visibility/network loss or classification. A temporal model cannot repair missing observation. For classification failures, compare a small windowed classifier on exactly the same held-out trials with explicit negative/unknown outputs, consistent anatomical labels, confidence rejection, and timestamp-based segmentation. Split by participant/session before augmentation and report per-class confusion, false triggers, latency and recovery. No model is trained/activated in this change; no pretrained checkpoint has been executed. Physical improvement and Fire TV latency remain NOT VERIFIED.
