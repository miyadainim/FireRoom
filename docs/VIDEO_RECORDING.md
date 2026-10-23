# Automatic phone video recording

Requested by the user for calibration/practice debugging. Video capture supplements pose measurements and does not change technique rules.

## Use

1. Refresh the viewer **and phone camera page**, then pair again after the relay update. Start the phone camera and leave its page open.
2. Press **Start hands-free setup** on the viewer. The phone receives a start request and records the walk-back/countdown, checks and automatic retries as one clip. Completion or Stop ends the clip. Paused setup stops it; resuming creates a new clip while preserving accepted pose references.
3. Press **Start my punch** for a separate practice clip, including the countdown. Stable recovery, timeout, cancellation or a configuration change ends the run.
4. On the **phone**, check its recording indicator. After recording ends, use **Download video** and **Download timing manifest**. Video format depends on browser support, usually WebM or MP4. Audio is excluded.
5. On the **viewer**, use **Download poses + assessment**. Its `video.calibrationRunIds` and `video.practiceRunId` match the IDs in the phone filenames and manifests. The viewer export retains only the latest practice pose attempt; video clips are separate.
6. Share the matching video, timing manifest and pose JSON explicitly if you want synchronized visual debugging.

## Storage and privacy

Raw video stays in the phone page's memory. The relay carries recording-control metadata and pose frames, not camera footage. There is no automatic upload, permanent save, microphone recording or server video archive. Download clips before refreshing/closing the phone page. At most five clips/80MB total are retained; oldest clips may be evicted. Individual clips stop at120seconds or30MB. Errors/unsupported recording do not block pose coaching; verify the indicator on the phone rather than assuming a video exists.

The user's recording request authorizes this feature. Existing camera permission is reused through the current video stream. Recordings show an explicit on-phone indicator and local download controls.

## Timing and interruptions

Each clip has a run ID plus a timing manifest containing pose producer timestamps/sequence IDs and phone-local offsets from recorder start. This alignment is **approximate**: inference callbacks, browser recording start events, buffering, command polling and encoding have latency. Do not subtract viewer and phone monotonic clocks or claim frame-exact synchronization.

Commands are versioned, ordered per pairing, strictly validated and freshness-limited. The viewer sends a start heartbeat every5seconds; disappeared heartbeats stop capture after approximately15seconds. Stop/camera restart ends capture; a late command cannot restart a completed run. Actual camera/codec/download behavior requires phone testing. The viewer requests video but has no phone recording acknowledgement, so phone status is authoritative.

## Verification

See docs/validation/VIDEO_RECORDING_REVIEW.md. Mock-recorder tests validate lifecycle/retention/control behavior; real camera recording, exact alignment and physical Fire TV-to-phone operation are NOT VERIFIED. Live local relay checks used synthetic metadata only and did not access a camera.
