import type {Hand,PoseFrame,Stance} from '../../shared/contracts';
export type DtwMode='image-2d'|'world-3d';
export type PrescribedDrill='jab'|'jab-cross';
export interface ReferencePhase {punch:'jab'|'cross';hand:Hand;guardStartMs:number;extensionMs:number;recoveryMs:number}
export interface DtwReference {schemaVersion:1;kind:'fireroom-dtw-reference';id:string;drill:PrescribedDrill;stance:Stance;geometryMode:DtwMode;cameraPlacement:string;review:{status:'pending'|'reviewed';reviewer:string;reviewedAt:string};frames:PoseFrame[];phases:ReferencePhase[]}
export interface DtwSample {timeMs:number;values:number[];valid:boolean[]}
export interface AlignmentOptions {bandRatio:number;maxRun:number;minSharedFeatures:number}
export interface AlignmentResult {status:'aligned'|'no-path'|'invalid';distance:number|null;path:[number,number][];reason:string}
export interface DtwFinding {criterion:'guard'|'trajectory'|'recovery'|'elbow'|'timing';phase:string;status:'similar'|'deviation'|'not-assessable';message:string;measurement:number|null;unit:string}
export interface DtwEvaluation {schemaVersion:1;kind:'fireroom-dtw-evaluation';status:'reference-required'|'rejected'|'aligned';reasons:string[];alignment:AlignmentResult|null;coverage:number;phaseCoverage:{punch:'jab'|'cross';covered:boolean;reason:string}[];findings:DtwFinding[];timing:{attemptDurationMs:number;referenceDurationMs:number;durationRatio:number|null;maxGapMs:number};limitations:string[]}
