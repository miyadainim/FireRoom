# Independent V&V: image and world geometry comparison

Date: 2026-10-15. Scope: software implementation and repeatable comparison; no new physical camera capture.

## Evidence and gate

- Automated gate: PASS. Full suite: 99 tests across 12 files passed (`npm test`).
- Build: PASS (`npm run build`, TypeScript and Vite). Existing bundle-size advisory remains.
- Real-camera benefit, camera-dependent world depth quality, and relative detection accuracy: NOT VERIFIED.
- Phone delivery of new optional fields and actual Fire TV execution: NOT VERIFIED by these tests.

`tests/geometry-integration.test.ts` independently checks legacy recordings, malformed optional data, conflicting image/world geometry, independent world visibility, missing-world behavior, independent history, cloning of exported data, relay-size budget, replay isolation, and unavailable metrics. Existing regression tests remain green.

## Meaningful checks

A controlled synthetic sample has folded image-plane arms but corrupt image z. Image 2D and independently supplied world geometry establish guard; image 3D rejects it. This establishes that the modes actually use different coordinate sources. It does not establish which mode reconstructs a real elbow correctly.

Changing only world coordinates through a synthetic guard-extension-recovery cycle yields one world-mode jab and zero image-mode punches. Replaying the same recording across modes does not mutate its observations.

A legacy recording without world coordinates yields unavailable world trials, zero evaluated world trials, and zero missed world punches. It cannot inflate empty-trial successes or imply a world failure on observations that were never captured.

The representative payload has two 33-landmark arrays with full-precision decimal values and remains under the relay's 20,000-byte limit. This is a budget check, not a network-throughput test.

## Required next evidence

Refresh both phone and viewer so new frames include world landmarks and image dimensions. Record labeled repetitions of left/right punches and deliberate non-punches with stance and camera placement held constant. Compare exact sequences, misses, extras, guard acquisition, tracking interruptions, and unavailable trials for the same captured frames. An older recording cannot supply historical world landmarks. Preserve unsuccessful trials. Accuracy gates from the physical protocol still apply; synthetic success does not satisfy them.
