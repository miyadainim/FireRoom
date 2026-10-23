export { PunchRecognizer } from './recognizer';
export { startCamera } from './camera';
// Candidate cycle recognizer is opt-in; legacy Coach/Arcade routing is unchanged.
export {MovementCycleRecognizer,assessMovementExtension,MOVEMENT_THRESHOLDS} from './movement-cycle';
export type {MovementCycleOutcome,ValidatedExtensionReference} from './movement-cycle';
export {evaluatePrescribedAttempt} from './prescribed';
export type {PrescribedAttemptConfig,PrescribedAttemptReport,PrescribedPunchAssessment} from './prescribed';
