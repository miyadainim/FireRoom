# Nova movement interpretation — proposed plan, 2026-10-20

Status: PLANNING ONLY. No model invocation, cloud upload, credential inspection, deployment or implementation. Independent V&V reviewed this experiment design, not Nova accuracy. All Nova/physical/Fire TV performance NOT VERIFIED.

## Objective and separation

Interpret each hand's trajectory over the whole bounded attempt, then apply deterministic measurements to the relevant observed intervals. A punch-like movement starting from a low hand must remain locatable; a guard restoration must not automatically become a punch. Guard quality must not be a prerequisite for finding a movement that could demonstrate poor guard. Preserve existing rule detector, Tracking Lab, MediaPipe Full, exports, references and all regressions as the comparison baseline.

Start with post-attempt analysis of jab, cross and jab-cross. No continuous cloud inference, Arcade changes, model training, full biomechanics or autonomous LLM tool execution. Model outputs describe visible evidence; they do not establish physical intent, exact extension, force or overall correct form.

## Critical feasibility constraint

AWS's Nova 2 Lite documentation specifies one frame/second for video up to16min and square672x672 preprocessing. This can miss subsecond movements. A high-FPS source does not ensure the model receives those frames. The AWS sample workshop mentions a different model identifier; do not assume its model, region, availability or processing applies to the chosen account. Pin and verify the exact model/inference profile/API/region and preprocessing before integration.

Compare identical clips in three representations:

1. Native clip as a baseline.
2. An8x-slowed presentation retaining original frames: nominal1FPS would represent8FPS of source time. This is an unverified workaround; it changes apparent speed. Map presentation times back as sourceTime = trimStart + presentationTime/8. Evaluate actual temporal grounding rather than assuming exact sampled frames.
3. Ordered, explicitly timestamped image frames within verified request limits. Nova 2 Lite's current documentation lists5 directly embedded images and larger S3-backed image collections; do not assume arbitrary inline frame counts or exceed actual Bedrock API constraints. Multiple batches can lose context. Establish a supported request strategy before selecting this path. Source-time-labelled contact sheets are another experiment, not guaranteed equivalent to native video.

Preprocess with aspect-preserving padding if needed to reduce portrait-to-square geometry distortion. Retain the original clip, transformation metadata and source frame IDs. No timing or form judgments based on slowed playback or rescaled model coordinates. Consider only coarse phase intervals until boundary accuracy is demonstrated.

Gate: if Nova cannot distinguish the key movements with sufficient temporal evidence, STOP this integration route and record failure; do not compensate with invented timing or prompts that force the expected answer.

## Inputs and outputs

Existing inputs already provide recordingId, original phone-local video, timing manifest, PoseFrame sequence/timestamps, anatomical stance/mirroring, confidence and camera configuration. The video currently stays on the phone; use a user-selected saved clip for the offline prototype first, then an explicit opt-in phone analysis action for live integration.

Build one canonical original-video timeline using the recording manifest. Reject mismatched recording IDs and inconsistent timestamp/sequence mappings; approximate callback offsets are not exact camera-frame ground truth. Tag transformed samples with original frame IDs/time. Model sees the selected source-derived representation plus compact upper-body trajectories/quality summaries, not the current detector's conclusions or the expected drill in its first pass. Compare video-only and video-plus-pose to test whether pose errors bias interpretation.

Proposed versioned interpretation contract, separate from validated PunchEvent/TechniqueReport:

- recordingId, schemaVersion, model/profile/region, prompt version, input hash and representation/version.
- Per-hand temporal states: guard_hold, lowering, raising_to_guard, outward_strike_like, retracting, unknown.
- Events: anatomical hand, state/action, original-video time interval with uncertainty bounds, optional peak/return intervals, visible evidence frame IDs, brief observable evidence, missing/ambiguous observations.
- Distinguish absent evidence from observed absence. Unknown is an allowed result. Both hands may have different simultaneous states.
- No uncalibrated probability treated as accuracy. No requested drill inferred from filenames or current detector labels.

An outward-strike-like state is not proof of a boxing punch. Backend maps hand to jab/cross role using explicit stance, compares the observed sequence with the prescription and retains unknown/unmatched events. It must not silently select only events that satisfy the lesson.

Validate schema, enums, time bounds, ordering, known frame IDs and recording identity before any downstream use. JSON conformance is not semantic accuracy. Nova does not run arbitrary application tools. Repeated invalid output or unavailable model yields explicit analysis unavailable, preserving baseline observations separately.

## Measurement routing and presentation

Backend owns an allowlisted deterministic router:

- guard_hold/lowering/raising_to_guard: eye/nose relative hand height, low-hand duration, return/hold, observation coverage.
- outward_strike_like/retracting: trajectory, opposite-hand guard during outward movement, recovery and compatible optional extension references.
- unknown/unreliable feature: cannot assess; do not fabricate or repair depth.

Keep sequence interpretation, starting guard, guard maintenance during each movement, finishing guard and feature uncertainty separate. Existing0.50 shoulder-width guard criterion stays provisional; model interpretation does not validate that threshold. Reliable individual findings must remain visible even if the full combination is uncertain. For case12, the intended outcome to test is a located left outward movement, right lowering, a later right outward movement from low position, and independently measured opposite-hand height—not an automatic completed/correct-form judgment.

UI proposal: Finish attempt -> optional Analyze movement with Nova -> analysis pending -> source-labelled interpretation plus measured feedback. Baseline and Nova remain identifiable; no unexplained merged score. Ask only for a short movement interpretation and evidence, not hidden chain-of-thought. Model self-reported confidence is descriptive until calibrated.

## Backend and transport

Prototype locally with existing selected files and a minimal Bedrock Converse adapter. Reuse AWS sample request/prompt patterns, not the whole workshop/platform. Keep provider logic separate from the measurement router and coaching renderer. Runtime code/API fields must be verified for the selected model before implementation.

Live integration later: phone sends the selected recording and manifest to an authenticated backend, server binds the run to the paired session and validates size/type/duration, prepares representation, invokes Bedrock, validates the response, joins pose measurements and returns a versioned result. Keep AWS credentials server-side. No secrets in phone/TV JavaScript. Avoid streaming raw video to the TV. TV displays pending/feedback; actual Fire TV compatibility remains a separate physical gate.

Use short-lived temporary processing storage, explicit retention/deletion policy, bounded upload/request limits, timeout/retry budgets and stale-result rejection. Record ID+analysis version prevent an old result from replacing a newer attempt. Stop/cancel/disconnect must not create an unwanted new upload. Cloud analysis is opt-in because raw recordings currently remain on the phone. Start with direct bounded requests when supported; introduce S3 only if the verified representation or deployment requires it.

## Dependency-aware milestones

| Gate | Deliverable | Dependencies and acceptance |
|---|---|---|
| N0: Model/input feasibility | Pin model/API/region, sampling/format support, representation experiment | AWS access and explicitly authorized bounded cloud test. Native/slowed/frames comparison. Fail if movement information is insufficient. |
| N1: Offline interpreter | Versioned contract, adapter, schema validation and replay CLI | N0. Existing cases normal3, drops4–7, no-start8/10, no-return9, normalcombo11, droppedguardcombo12 used as DEVELOPMENT only. No live behavior changes. |
| N2: Measurement integration | Guard/punch interval router and source-labelled reports | N1. Partial findings survive uncertain combinations; no guard prerequisite to locate low-hand outward attempts; no model-generated metric arithmetic. |
| N3: Held-out evaluation | Frozen prompts/settings, reviewed new clips and comparative results | N2. Separate sessions/conditions; no frames from same clip in both development and evaluation. Independent video labels created before viewing model output. |
| N4: Optional phone/TV flow | Opt-in upload, progress/result/error UX and target test | N3 passes accuracy/latency/cost budgets. Actual phone/TV/network validation, with V&V signoff. |

Keep each gate independent: automated software PASS does not establish model accuracy or physical coaching. Do not proceed automatically after a failed feasibility/evaluation gate.

## Evaluation and failure tests

Human-review event labels, temporal intervals and observable guard findings. Ambiguous labels stay unresolved/uncertain. Include punches from held and lowered guard, pure guard restoration, both normal and dropped-guard combinations, cross-jab, extra punches, idle/fidget/raising into guard, short punches, no recovery, occlusion and viewpoint changes. Test anatomical hands/stance/mirroring. Existing clips are development regressions, not held-out accuracy evidence.

Measure one-to-one event precision/recall, wrong hand/order, extra false punches during restoration, recall for punches from lowered hands, guard-feedback false positives/misses, phase boundary error, abstention/coverage, repeatability, schema/evidence failures, p50/p95 end-to-end latency and actual invocation cost/upload size. Show results by case type; abstaining on everything is not success. Self-reported confidence is not a measured success rate.

Predeclare comparison thresholds and demo budgets before calls. Preserve project physical targets for formal validation: at least18/20 controlled jabs and18/20 crosses, at most1 false punch in20 deliberate non-punch actions, correct sequence-order distinction and tracking-loss recovery. These targets are NOT VERIFIED. Add specific reviewed guard-quality acceptance criteria before claiming reliable form evaluation. Proposed initial post-attempt latency budget: p95<=10s, subject to measured feasibility and user agreement; not a promised service time. Agree an invocation spending cap before cloud experiments.

Run baseline and Nova on identical inputs. Test blind interpretation versus supplied/mismatched expected drills, missing frames and shuffled chronology, ensuring it does not simply repeat the prescription. Repeat requests on a small fixed subset to quantify nondeterminism. Evaluate reasoning off/low/medium only if supported by the chosen model, measure quality/latency/cost and freeze the selected configuration. Input video/pose disagreements must yield conservative evidence-aware findings.

Automated tests cover schema/time/source mapping, recording identity, malformed output, unsupported action, hallucinated frame ID, timeout/auth/quota errors, stale replies, upload limits, missing frames, deterministic feature routing, grounded coaching and existing regressions. Independent V&V reviews gate results, not just prompt design.

## Human/external requirements and current state

Before cloud execution: AWS account/profile or role, verified Bedrock model access/region/quotas, explicit permission to upload selected clips, agreed retention and spending cap. Do not request or expose plaintext credentials in reports. No access is assumed. Fresh camera clips and independent human review required at N3; phone/Fire TV hardware or simulator access required at N4. No deployment approval is implied by planning.

Current gate: PLAN REVIEWED, N0 NOT VERIFIED. No Nova accuracy, latency, cost, physical coaching or Fire TV inference/deployment claim.

## Primary references checked 2026-10-20

- https://docs.aws.amazon.com/nova/latest/nova2-userguide/using-multimodal-models.html
- https://docs.aws.amazon.com/nova/latest/nova2-userguide/core-inference.html
- https://docs.aws.amazon.com/nova/latest/nova2-userguide/request-response-schema.html
- https://docs.aws.amazon.com/nova/latest/nova2-userguide/prompting-multimodal.html
- https://github.com/aws-samples/sample-building-intelligent-multimodal-applications-with-Nova

Documentation/sample differences are a reason to pin and smoke-test actual capabilities, not assume a sample's model is available.

Independent final plan review: PASS. This approves the experiment design only; N0 remains NOT VERIFIED. No API calls, tests, uploads or credential checks were performed.
