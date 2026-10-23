# Independent verification: automatic phone-local video recording

Scope: user-requested recording when guided calibration or practice starts. Source audit and automated tests do not establish camera, codec, download, or Fire TV operation on real devices.

## Automated controller integration

`tests/video-integration.test.ts` mounts the actual guided form controller with a minimal DOM adapter and the real calibration/attempt engines. It verifies:

- One recording spans the complete basic setup, including preparation and transitions.
- Stop ends preparation; explicit resume has a different run ID.
- Lost camera updates stop the setup recording.
- Automatic retries remain in one recording and exhausted retries stop it.
- Practice starts recording before its countdown and stops when feedback becomes available.
- Exercise, stance, placement, camera restart, and pairing changes stop an active recording.
- Repeated invalidation does not send duplicate stops.

Initial independent run: **10/10 PASS**. The adapter uses synthetic poses; no physical tracking claim follows.

## Design and evidence limits

Video is recorded from the existing phone camera stream using video tracks only. Blobs are retained in phone memory and downloaded through local object URLs. Relay traffic carries commands and existing pose data; no video upload is added. Clips are capped by duration, per-clip size, retained count, and aggregate size. Unsupported recording must leave pose assessment available.

A timing manifest records phone-local pose callback offsets from recorder start, frame sequence, and original pose timestamps. This is approximate association, not frame-perfect synchronization or evidence that every pose corresponds to a known encoded video frame. Calibration and practice run IDs also appear in measurement exports to associate the files.

Independent audit identified a command freshness ordering defect: same-run heartbeat handling initially preceded timestamp validation. This was fixed and a regression test rejects stale active heartbeats. Asynchronous recorder-stop coverage verifies that a new run is rejected while the prior recorder is finishing, rather than overlapping recordings. A second asynchronous-stop race was fixed and regression-tested: a later completion command cannot overwrite an earlier camera-interruption reason before finalization.

## Physical acceptance checks — NOT VERIFIED

1. OnePlus Chrome: start camera, start setup from computer, confirm phone recording indicator without an extra recording button.
2. Finish setup; download a playable video and timing manifest on the phone; export measurements from the computer and compare run IDs.
3. Practice one jab and one cross; verify countdown and full movement are included and clips end automatically.
4. Verify Stop, camera restart, camera track loss, disconnect, viewer close, and returning after backgrounding. Confirm status explains interruptions and retained clips remain downloadable while the phone page stays open.
5. Confirm no microphone permission/audio track; inspect network traffic to confirm raw video is not uploaded.
6. Test storage limits and unsupported codec/recorder fallbacks on actual browser hardware.

Real MediaRecorder behavior, browser download usability, timing alignment accuracy, long-run memory behavior, and Fire TV-to-phone operation: **NOT VERIFIED**.

## Source integration audit

The main application mounts recording on the phone, observes pose frames after assigning the phone producer sequence/clock, stops on camera restart/stop, and disposes on page exit. The viewer publishes metadata through a serialized queue with request timeouts and fresh five-second heartbeats. Stop commands retain the original paired session target. Expired/disappeared viewer heartbeats trigger a bounded local stop; a 120-second safety limit remains independently active.

Independent full-suite run after publisher and asynchronous interruption regressions: **238/238 tests PASS across 26 files**. Final production build evidence is recorded below; the existing >500 kB advisory remains.

Gate: automated implementation **PASS within tested scope**; end-to-end physical recording **NOT VERIFIED** pending the checklist above. Local in-memory clips are lost when the phone page is reloaded or closed, and retention caps evict the oldest clips. Failed/unsupported capture leaves pose checks available and must be diagnosed using the phone indicator.

Final independent production build: **PASS**, 80 modules, 568.45 kB main bundle (151.66 kB gzip), with the existing >500 kB advisory. The transient TypeScript narrowing error introduced during the interruption fix was corrected before this successful build.
