/** UI-independent orchestration. All times are monotonic viewer milliseconds.
 * now is arrival time; sourceMs is the source clock timestamp; sequence is the transport watermark.
 * Adapter must validate source context and freshness before forwarding; sourceMs defaults to now for local fixtures.
 * No uncertain guard grace: an unknown sample resets the continuous hold.
 */
export type HandsFreeLesson = 'guard' | 'jab' | 'cross' | 'jab-cross';
export type HandsFreePhase = 'INTRO' | 'DEMONSTRATING' | 'PRACTICE_READY' | 'OBSERVING' | 'EVALUATING' | 'FEEDBACK' | 'RETRY_GUIDANCE' | 'COMPLETED' | 'TRACKING_PAUSED';
export interface HandsFreeSnapshot {
  phase: HandsFreePhase; lesson: HandsFreeLesson; epoch: number; guardHeldMs: number;
  reminderCount: number; message: string; paused: boolean; exited: boolean;
}
export interface HandsFreeEvent {
  type: 'change' | 'demo' | 'observe' | 'evaluate' | 'cancel' | 'lesson-completed' | 'invitation';
  snapshot: HandsFreeSnapshot;
}
export interface HandsFreePose { now: number; sequence: number; sourceMs?: number; guard: boolean | 'unknown'; attempting?: boolean }
export interface HandsFreeResult { now: number; epoch: number; outcome: 'success' | 'imperfect' | 'wrong' | 'incomplete' | 'uncertain'; message: string }
export interface HandsFreeOptions {
  onEvent?: (event: HandsFreeEvent) => void; guardHoldMs?: number; maxPoseGapMs?: number;
  readingMs?: number; retryReadingMs?: number; inactivityMs?: number; observationMs?: number; externalEvaluation?: boolean;
}
const lessons: HandsFreeLesson[] = ['guard', 'jab', 'cross', 'jab-cross'];
export class HandsFreeCoach {
  private value: HandsFreeSnapshot = { phase: 'INTRO', lesson: 'guard', epoch: 0, guardHeldMs: 0, reminderCount: 0, message: '', paused: false, exited: false };
  private lastNow = -Infinity;
  private lastSequence = -1;
  private phaseSince = 0;
  private lastPoseAt: number | undefined;
  private sourceWatermark = -Infinity;
  private sourceArrival = 0;
  private boundarySource = -Infinity;
  private lastGuardSource: number | undefined;
  private holdSince: number | undefined;
  private lastActivity = 0;
  private deadline = Infinity;
  private trackingRecovery = false;
  private failedAttempts = 0;
  private lastReliableAt: number | undefined;
  private suspended: {phase: HandsFreePhase; message: string; remaining: number} | undefined;
  constructor(private readonly options: HandsFreeOptions = {}) {}
  get snapshot(): HandsFreeSnapshot { return { ...this.value }; }
  private accept(now: number): boolean {
    if (!Number.isFinite(now) || now < this.lastNow) return false;
    this.lastNow = now; return true;
  }
  private emit(type: HandsFreeEvent['type']): void { this.options.onEvent?.({ type, snapshot: this.snapshot }); }
  private phase(phase: HandsFreePhase, now: number, message: string): void {
    this.value.phase = phase; this.value.message = message; this.phaseSince = now;
    this.emit('change');
  }
  private invalidate(): void {
    this.value.epoch++; this.value.guardHeldMs = 0; this.holdSince = undefined;
    this.lastPoseAt = undefined; this.lastGuardSource = undefined; this.deadline = Infinity; this.emit('cancel');
  }
  start(now: number, lesson: HandsFreeLesson = 'guard'): void {
    if (!this.accept(now)) return;
    this.value.exited = false; this.value.paused = false; this.value.lesson = lesson;
    this.suspended = undefined; this.lastReliableAt = undefined; this.failedAttempts = 0; this.value.reminderCount = 0; this.demonstrate(now);
  }
  private demonstrate(now: number): void {
    this.invalidate(); this.phase('DEMONSTRATING', now, 'Watch Coach Atlas.'); this.emit('demo');
  }
  demonstrationFinished(now: number, epoch: number): void {
    if (!this.accept(now) || epoch !== this.value.epoch || this.value.phase !== 'DEMONSTRATING' || this.value.paused || this.value.exited) return;
    this.phase('PRACTICE_READY', now, this.value.lesson === 'guard' ? 'Now you try! Raise your guard and hold it for three seconds.' : 'Now you try!');
    this.observe(now);
  }
  private observe(now: number): void {
    this.boundarySource = Number.isFinite(this.sourceWatermark) ? this.sourceWatermark + Math.max(0, now - this.sourceArrival) : -Infinity;
    this.invalidate(); this.lastActivity = now;
    this.phase('OBSERVING', now, this.value.lesson === 'guard' ? 'Raise your guard and hold it for three seconds.' : 'Try the movement, then return to guard.');
    this.deadline = this.value.lesson === 'guard' || this.options.externalEvaluation ? Infinity : now + (this.options.observationMs ?? (this.value.lesson === 'jab-cross' ? 8000 : 5000));
    this.emit('observe');
  }
  pose(input: HandsFreePose): void {
    if (!Number.isFinite(input.sequence) || input.sequence <= this.lastSequence || !this.accept(input.now)) return;
    this.lastSequence = input.sequence;
    const source = input.sourceMs ?? input.now;
    if (!Number.isFinite(source) || source <= this.sourceWatermark) {
      if (this.value.phase === 'OBSERVING') { this.holdSince = undefined; this.lastGuardSource = undefined; this.value.guardHeldMs = 0; }
      return;
    }
    this.sourceWatermark = source; this.sourceArrival = input.now;
    if (this.value.exited || this.value.paused) return;
    if (input.guard === 'unknown') { this.trackingLost(input.now); return; }
    this.lastReliableAt = input.now;
    if (this.value.phase === 'TRACKING_PAUSED') {
      if (this.trackingRecovery) {
        this.trackingRecovery = false;
        const suspended = this.suspended; this.suspended = undefined;
        if (suspended?.phase === 'FEEDBACK' || suspended?.phase === 'RETRY_GUIDANCE') {
          this.phase(suspended.phase, input.now, suspended.message);
          this.deadline = input.now + suspended.remaining;
        } else if (suspended?.phase === 'DEMONSTRATING') this.demonstrate(input.now);
        else this.observe(input.now);
      }
      return; // first recovered sample is a boundary, never hold evidence
    }
    if (this.value.phase !== 'OBSERVING' || input.now <= this.phaseSince || source <= this.boundarySource) return;
    const gap = this.lastPoseAt === undefined ? 0 : input.now - this.lastPoseAt;
    this.lastPoseAt = input.now;
    if (input.attempting || (this.value.lesson === 'guard' && input.guard)) this.lastActivity = input.now;
    if (this.value.lesson !== 'guard') return;
    const sourceGap = this.lastGuardSource === undefined ? 0 : source - this.lastGuardSource;
    this.lastGuardSource = source;
    if (!input.guard || sourceGap > (this.options.maxPoseGapMs ?? 350) || gap > (this.options.maxPoseGapMs ?? 350)) { this.holdSince = undefined; this.value.guardHeldMs = 0; }
    if (input.guard) {
      this.holdSince ??= source;
      this.value.guardHeldMs = source - this.holdSince;
      if (this.value.guardHeldMs >= (this.options.guardHoldMs ?? 3000)) {
        this.value.guardHeldMs = this.options.guardHoldMs ?? 3000;
        this.succeed(input.now, "Good! That's your guard. Remember this position — you'll return to it after every punch.");
      } else this.emit('change');
    }
  }
  tick(now: number): void {
    if (!this.accept(now) || this.value.paused || this.value.exited) return;
    if (['FEEDBACK', 'RETRY_GUIDANCE'].includes(this.value.phase) && this.lastReliableAt !== undefined && now - this.lastReliableAt > (this.options.maxPoseGapMs ?? 350)) { this.trackingLost(now); return; }
    if (this.value.phase === 'FEEDBACK' && now >= this.deadline) { this.next(now); return; }
    if (this.value.phase === 'RETRY_GUIDANCE' && now >= this.deadline) { this.observe(now); return; }
    if (this.value.phase !== 'OBSERVING') return;
    if (now - (this.lastPoseAt ?? this.phaseSince) > (this.options.maxPoseGapMs ?? 350)) { this.trackingPause(now); return; }
    if (now >= this.deadline) { this.phase('EVALUATING', now, 'Let me check that attempt.'); this.emit('evaluate'); return; }
    const wait = (this.options.inactivityMs ?? 15000) * (this.value.reminderCount + 1);
    if (now - this.lastActivity >= wait) {
      if (this.value.reminderCount >= 2) { this.pause(now); return; }
      this.value.reminderCount++; this.demonstrate(now);
      this.value.message = 'Take your time. Watch me once more.'; this.emit('change');
    }
  }
  result(input: HandsFreeResult): void {
    if (!this.accept(input.now) || input.epoch !== this.value.epoch || this.value.paused || this.value.exited || !['OBSERVING', 'EVALUATING'].includes(this.value.phase)) return;
    if (input.outcome === 'success') this.succeed(input.now, input.message);
    else if (input.outcome === 'uncertain') this.trackingPause(input.now);
    else {
      this.failedAttempts++;
      if (this.failedAttempts >= 3) {
        this.pause(input.now);
        this.value.message = 'Let’s take a break. Resume to watch the movement again, or use the menu to skip this lesson.';
        this.emit('change'); return;
      }
      this.invalidate(); this.phase('RETRY_GUIDANCE', input.now, input.message);
      this.deadline = input.now + (this.options.retryReadingMs ?? 3500);
    }
  }
  private succeed(now: number, message: string): void {
    this.phase('FEEDBACK', now, message); this.deadline = now + (this.options.readingMs ?? 4500); this.emit('lesson-completed');
  }
  private next(now: number): void {
    const index = lessons.indexOf(this.value.lesson);
    if (index === lessons.length - 1) {
      this.invalidate(); this.phase('COMPLETED', now, "Well done! You've learned your stance, your guard, and your first combinations. Meet Ren Mori in Arcade Mode when you're ready."); this.emit('invitation');
    } else { this.failedAttempts = 0; this.value.lesson = lessons[index + 1]!; this.value.reminderCount = 0; this.demonstrate(now); }
  }
  private trackingPause(now: number): void { this.trackingLost(now); }
  /** Explicit transport loss; reading intervals resume with their remaining time.
   * A completed movement is never evaluated twice merely because tracking dropped.
   */
  trackingLost(now: number): void {
    if (!this.accept(now) || this.value.exited || this.value.paused || ['INTRO', 'COMPLETED', 'TRACKING_PAUSED'].includes(this.value.phase)) return;
    this.suspended = {phase: this.value.phase, message: this.value.message, remaining: Math.max(0, this.deadline - now)};
    this.invalidate(); this.trackingRecovery = true;
    this.phase('TRACKING_PAUSED', now, "I can't see your posture clearly. Check your camera position.");
  }
  pause(now: number): void {
    if (!this.accept(now) || this.value.exited || this.value.paused || this.value.phase === 'COMPLETED') return;
    this.suspended = ['FEEDBACK', 'RETRY_GUIDANCE'].includes(this.value.phase)
      ? {phase: this.value.phase, message: this.value.message, remaining: Math.max(0, this.deadline - now)}
      : undefined;
    this.invalidate(); this.value.paused = true; this.trackingRecovery = false;
    this.phase('TRACKING_PAUSED', now, 'Training paused. Resume when you are ready.');
  }
  resume(now: number): void {
    if (!this.accept(now) || this.value.exited || !this.value.paused) return;
    this.failedAttempts = 0; this.value.paused = false;
    const suspended = this.suspended; this.suspended = undefined;
    this.lastReliableAt = undefined;
    if (suspended) {
      this.phase(suspended.phase, now, suspended.message);
      this.deadline = now + suspended.remaining;
    } else this.demonstrate(now);
  }
  replay(now: number): void {
    if (!this.accept(now) || this.value.exited || this.value.paused || this.value.phase === 'COMPLETED') return;
    this.demonstrate(now);
  }
  skip(now: number): void {
    if (!this.accept(now) || this.value.exited || this.value.paused || this.value.phase === 'COMPLETED') return;
    this.next(now);
  }
  /** Call when session, camera, stance or source-clock identity changes.
   * Invalidates all old callbacks and transport watermarks; active lessons replay.
   * Explicitly paused, exited, intro and completed states remain dormant.
   */
  resetContext(now: number): void {
    if (!this.accept(now)) return;
    this.lastSequence = -1; this.sourceWatermark = -Infinity;
    this.sourceArrival = now; this.boundarySource = -Infinity;
    this.trackingRecovery = false; this.suspended = undefined; this.lastReliableAt = undefined;
    if (this.value.paused || this.value.exited || ['INTRO', 'COMPLETED'].includes(this.value.phase)) {
      this.invalidate(); this.emit('change'); return;
    }
    this.demonstrate(now);
  }
  exit(now: number): void {
    if (!this.accept(now)) return;
    this.invalidate(); this.value.exited = true; this.value.paused = false; this.phase('INTRO', now, '');
  }
}
