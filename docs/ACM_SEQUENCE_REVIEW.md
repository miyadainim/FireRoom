# ACM Boxing sequence-classification review

Reviewed 2026-10-15 from public `main` source. No upstream program or checkpoint was executed, downloaded, trained, or integrated. Commit SHA could not be resolved through the available public browser responses; URLs below are mutable references.

## Actual implementation

[Shadow analyzer](https://github.com/ACM40960/Boxing/blob/main/app/scripts/shadow_boxing_analyzer.py): YOLO pose supplies eight joints (both shoulders, elbows, wrists, hips), flattened to 16 coordinates. Coordinates are centered at the shoulder midpoint and divided by shoulder separation. Shoulders below confidence 0.5 reject the frame; other uncertain joints become zeros. A deque retains 25 accepted frames. A two-layer, hidden-size-128 PyTorch LSTM with dropout 0.5 feeds its final timestep to a linear classifier. Inference accepts softmax above 0.7 plus a wrist-motion threshold of 2.0. Motion uses pixel displacement, not elapsed time. A detection starts a 60-frame recovery cooldown. Stored timestamps do not resample the window; missing frames need not represent continuous time. At 30 accepted frames/second, filling the window takes roughly 0.83 seconds, and cooldown roughly two seconds. Shadow mode loads the block network but does not invoke it in its action method. Its combo counter groups detections by time, rather than validating a jab-cross order.

[Two-player analyzer](https://github.com/ACM40960/Boxing/blob/main/app/scripts/two_player_analyzer.py) tries the block classifier only when punch confidence fails. Its classes include forearm block, high guard, parry, and negative. The punch head has no idle/negative class, making rejection and motion gating essential. Automatic stance estimation compares shoulder-to-hip distances; FireRoom should retain explicit stance configuration. Do not transfer its pixel-space hit tests to physical-impact claims.

## Training and compatibility risks

[Training notebook](https://github.com/ACM40960/Boxing/blob/main/main/script.ipynb) prepares 25-frame arrays by truncating or zero-padding, uses augmentation/mirroring, and trains with cross entropy and Adam (learning rate 0.001, weight decay 0.0001), batch 32, 50 epochs, and an 80/20 stratified sample split. The split does not explicitly group participants, source recordings, or augmented siblings; leakage is a risk, not a proven finding. Crucially, training lists **cross, jab, hook, uppercut**, while deployed inference lists **jab, cross, hook, uppercut**. Checkpoint label order must be established before use. Artifact provenance tying the weights to that notebook execution is NOT VERIFIED.

[Punch checkpoint](https://github.com/ACM40960/Boxing/blob/main/app/punch_classifier.pth) and [block checkpoint](https://github.com/ACM40960/Boxing/blob/main/app/block_classifier.pth) are present (GitHub displays approximately 813 KB each). Presence does not establish accuracy, safe loading, or compatibility with MediaPipe coordinates. No browser/mobile export or Fire TV benchmark was verified. The [README](https://github.com/ACM40960/Boxing) describes a Python/Flask, YOLO/PyTorch pipeline and recommends CUDA; its reported accuracy is not FireRoom validation.

The [repository license](https://github.com/ACM40960/Boxing/blob/main/LICENSE) is MIT. Preserve its notice for copied code. Dependency and model licenses need separate review before redistribution; this review does not establish rights for external datasets or bundled third-party weights.

## FireRoom escalation gate (proposed)

First keep explainable temporal rules and capture consented landmark-only trials with known labels. Escalate if a fixed rule version fails the existing 18/20 jab, 18/20 cross, maximum 1/20 non-punch false positive, order-discrimination, or tracking-recovery gates on held-out real trials after diagnostics rule out transport/visibility failures. Report tracking rejection separately from classification error.

Then compare a small temporal classifier against the same held-out trials using participant/session-grouped splits, timestamp-resampled windows, explicit missing-data masks, explicit no-punch/rejection handling, and verified label metadata. Require better missed-punch performance without worsening false positives or recovery; benchmark latency on the actual phone. Retain deterministic measurement-based coaching independently of classifier confidence. ACM supplies a useful sequence architecture reference, not a ready replacement. Physical accuracy and phone/TV performance remain **NOT VERIFIED**.
