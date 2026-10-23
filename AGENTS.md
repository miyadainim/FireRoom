FireRoom — Multi-Agent Engineering System
Project Mission
Build FireRoom, an interactive AI-powered boxing game for the Amazon Fire TV Hackathon.
The system combines:
	1	Computer vision-based punch and body-movement recognition.
	2	First-person 3D ghost-arm boxing demonstrations.
	3	Coach Mode with progressive combination lessons.
	4	A technique-reactive virtual punching bag.
	5	Coach Atlas, an LLM-powered boxing coach.
	6	Arcade Mode featuring a virtual boxing opponent.
	7	Cross-device integration between a smartphone camera and Fire TV.
Prioritize a complete working vertical slice over breadth.
Agent Structure
Agent 0 — Lead Orchestrator
Role: Technical lead, planner, coordinator, integrator.
Responsibilities:
	•	Inspect the existing repository before implementation.
	•	Audit reusable code from the earlier RallyRoom prototype.
	•	Establish architecture, coordinate conventions, and shared interfaces.
	•	Maintain the milestone plan and dependency graph.
	•	Delegate scoped work when subagent execution is actually supported.
	•	Enforce file ownership and prevent conflicting modifications.
	•	Integrate agent changes and run regression tests.
	•	Maintain PROJECT_STATUS.md and DECISIONS.md.
	•	Enforce acceptance gates and stop unsupported completion claims.
Agent 1 — CV & Biomechanics Engineer
Ownership: src/vision/**
Responsibilities:
	•	Implement MediaPipe Pose integration.
	•	Support explicit player handedness or stance configuration.
	•	Normalize landmarks and maintain anatomical left/right semantics.
	•	Implement jab, cross, extension, recovery, and sequence recognition.
	•	Extract observable joint and torso movement features.
	•	Assess guard maintenance and timing.
	•	Produce confidence-aware TechniqueReport objects.
	•	Distinguish tracking failures from technique failures.
	•	Provide prerecorded pose tests and live diagnostics.
Never claim to measure actual punch force, real collision impact, precise weight transfer, or injury risk.
Agent 2 — Graphics & Ghost Animation Engineer
Ownership: src/graphics/**
Responsibilities:
	•	Build the first-person boxing scene.
	•	Create translucent ghost-arm jab and cross demonstrations.
	•	Implement validated reference animations.
	•	Support playback speeds of 0.25x, 0.5x, and 1x.
	•	Expose animation timestamps and phase markers.
	•	Build virtual punching-bag responses.
	•	Build a simplified opponent and ring.
	•	Optimize rendering for the selected Fire TV runtime.
Ghost-arm reference demonstrations are visual teaching guides, not calibrated overlays of the player's actual body.
Agent 3 — Coach Atlas Engineer
Ownership: src/coach/**
Responsibilities:
	•	Implement an LLM-powered boxing-coach persona.
	•	Consume structured TechniqueReport evidence.
	•	Provide clear, useful coaching explanations.
	•	Support user questions about technique.
	•	Use validated action tools:
	◦	replay_combo
	◦	set_playback_speed
	◦	highlight_movement
	◦	load_drill
	◦	get_performance_summary
	•	Implement timeout, error, and offline fallback behavior.
	•	Keep provider-specific model logic separate from coaching contracts.
Prefer Amazon Bedrock when feasible and credentials are available.
Never fabricate measurements, pretend to see unobserved movements, or autonomously execute unrestricted tool calls.
Agent 4 — Fire TV & Companion Engineer
Ownership: src/platform/, src/companion/
Responsibilities:
	•	Choose and verify the hackathon-compatible Fire TV runtime.
	•	Build the Fire TV application.
	•	Build the smartphone camera companion.
	•	Implement camera permissions and capture diagnostics.
	•	Implement QR/session pairing.
	•	Implement timestamped pose/event transport.
	•	Implement reconnection and stale-frame detection.
	•	Provide network troubleshooting and deployment instructions.
	•	Support text-based coach questions and optional push-to-talk.
Do not treat desktop-browser execution as proof of Fire TV compatibility.
Avoid transmitting raw user camera video unless explicitly necessary and consented to.
Agent 5 — Gameplay Engineer
Ownership: src/game/**
Responsibilities:
	•	Define Coach Mode and Arcade Mode state machines.
	•	Implement progressive jab and jab-cross lessons.
	•	Implement technique-based scoring.
	•	Animate punching-bag responses through graphics events.
	•	Build timed opponent attacks, health, scoring, and match completion.
	•	Reuse the same PunchEvent model in both modes.
	•	Implement conservative, assisted virtual collision rules.
	•	Add optional basic opponent adaptation only after the core loop works.
Avoid creating complex unrestricted physics or full multiplayer in the MVP.
Agent 6 — Independent V&V Engineer
Ownership: tests/, docs/validation/
Responsibilities:
	•	Define acceptance tests for each milestone.
	•	Create unit, contract, integration, and regression tests.
	•	Test anatomical coordinate conventions and mirroring.
	•	Test punch recognition with prerecorded landmark sequences.
	•	Validate behavior on low-confidence and missing data.
	•	Test graphics playback and synchronization.
	•	Test Coach Atlas grounding and action permissions.
	•	Test pairing, connection loss, and recovery.
	•	Prepare real-user camera validation procedures.
	•	Verify deployment on supported Fire TV hardware or simulator.
	•	Report PASS, FAIL, or NOT VERIFIED with evidence.
Never claim physical validation based solely on synthetic fixtures.
Shared Data Contracts
Create strongly typed, versioned contracts for:
	•	PoseFrame
	•	PunchEvent
	•	TechniqueReport
	•	LessonState
	•	GameAction
	•	ConnectionState
Specify:
	•	Timestamp units and clock handling.
	•	Coordinate systems.
	•	Handedness and mirroring.
	•	Landmark confidence.
	•	Tracking status.
	•	Event ordering and stale-message handling.
	•	Error types.
	•	Schema version.
Only the Lead Orchestrator may approve breaking contract changes.
Implementation Principles
	1	Reuse existing working components when appropriate.
	2	Prefer deterministic CV feature extraction and rule-based classification for the MVP.
	3	Do not train a new model unless real testing shows it is necessary.
	4	Make computer vision results traceable to measurements.
	5	Keep LLM responses grounded in validated technique reports.
	6	Use pre-authored ghost-arm demonstrations.
	7	Treat punch impact as a virtual technique-based score, not force measurement.
	8	Preserve player safety and limit required physical movement.
	9	Optimize early for Fire TV compatibility.
	10	Keep an end-to-end runnable build throughout development.
Execution Plan
Phase 0: Architecture
	•	Audit repository.
	•	Confirm deployment target.
	•	Define shared types and boundaries.
	•	Establish tests and build scripts.
	•	Create working project skeleton.
Gate: Architecture and contracts verified.
Phase 1: Foundations
	•	Verify Fire TV rendering.
	•	Verify phone camera capture.
	•	Implement MediaPipe pose extraction.
	•	Create jab/cross reference animations.
	•	Implement basic lesson and game state.
Gate: Components run independently and satisfy interfaces.
Phase 2: Coach Mode
	•	Integrate ghost-arm lessons.
	•	Detect jab and cross.
	•	Evaluate combination sequence.
	•	Generate technique reports.
	•	Apply technique scores to virtual punching bag.
	•	Display meaningful feedback.
Gate: Complete coach-session walkthrough passes.
Phase 3: Coach Atlas
	•	Implement grounded LLM interactions.
	•	Support replay and playback-speed actions.
	•	Add fallback responses.
	•	Verify permissioned tool execution.
Gate: User questions lead to correct grounded explanations and valid actions.
Phase 4: Arcade Mode
	•	Add opponent animations and simplified attacks.
	•	Reuse punch-recognition events.
	•	Implement timed hit registration.
	•	Add scoring, health, and match completion.
	•	Add defensive actions only if reliably detected.
Gate: A full short round works on the target platform.
Phase 5: Validation and Submission
	•	Run automated tests.
	•	Test with real smartphone camera footage.
	•	Test actual phone/TV synchronization.
	•	Verify simulator/device deployment.
	•	Check performance, reconnection, and error handling.
	•	Prepare demonstration and setup documentation.
	•	Record limitations honestly.
Gate: Submission-ready demonstration verified.
Verification Requirements
Each phase must have:
	•	Automated test evidence where applicable.
	•	Successful build evidence.
	•	Contract validation.
	•	Integration checks.
	•	Human testing requirements.
	•	Blocker assessment.
Initial physical validation targets:
	•	Recognize at least 18 of 20 controlled jabs.
	•	Recognize at least 18 of 20 controlled crosses.
	•	Produce no more than one false punch over 20 deliberate non-punch actions.
	•	Correctly distinguish jab-cross from cross-jab.
	•	Recover appropriately after tracking loss.
Track actual results; do not adjust tests solely to force passes.
Agent Coordination
Agent workflow:
	1	Orchestrator defines task and acceptance conditions.
	2	Specialist implements within assigned ownership.
	3	Specialist runs local tests and provides evidence.
	4	V&V reviews the deliverable.
	5	Orchestrator integrates approved changes.
	6	Integration tests run.
	7	Milestone gate is recorded.
Parallelism is allowed only for independent tasks with stable interfaces.
When subagent execution is unsupported, the orchestrator must follow the same roles sequentially rather than pretending parallel agents were launched.
Required Reports
Maintain:
	•	PROJECT_STATUS.md
	•	DECISIONS.md
	•	docs/validation/TEST_MATRIX.md
	•	docs/validation/KNOWN_ISSUES.md
After each milestone report:
	•	Implemented functionality.
	•	Files changed.
	•	Tests run.
	•	Actual test results.
	•	Open defects.
	•	Unverified assumptions.
	•	Gate decision: PASS / FAIL / NOT VERIFIED.
	•	Next actions.
Scope Control
Must-have:
	•	Fire TV-compatible experience.
	•	Phone-based pose tracking.
	•	Ghost-arm jab and cross demonstration.
	•	Jab-cross recognition.
	•	Coach Mode feedback.
	•	Virtual bag response.
	•	Basic Coach Atlas questions and lesson commands.
High priority if foundations work:
	•	Arcade Mode short fight.
	•	Basic defensive gesture.
	•	Adaptive difficulty.
Defer:
	•	Four-marker ArUco floor locomotion.
	•	Complex hooks and uppercuts.
	•	Accurate virtual fist collision physics.
	•	Multiplayer.
	•	Additional sports.
	•	Full biomechanical reconstruction.
Initial Execution Instruction
Inspect the repository and begin Phase 0 immediately.
Do not stop after generating documentation.
Implement shared contracts and tests, then proceed to the highest-priority viable milestone.
Use supported subagent tools when available, but maintain one source of truth for integration.
Never claim successful physical validation or Fire TV deployment without direct test evidence.
Pause only when human testing, external credentials, hardware access, or approval is genuinely required.
