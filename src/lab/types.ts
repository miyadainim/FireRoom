import type {Hand,PoseFrame,Stance} from '../shared/contracts';
export type LabModel='lite'|'full'|'heavy';
export type LabPhase='guard'|'lead-reach'|'rear-reach'|'lead-short'|'rear-short'|'jab'|'cross'|'idle'|'occluded';
export interface LabCondition {id:string;angle:string;lighting:string;framing:'full-body'|'upper-body';notes:string;stance:Stance;camera?:{width:number;height:number;facingMode?:string;frameRate?:number}}
export interface LabInterval {phase:LabPhase;startMs:number;endMs:number;label?:'full'|'short'|'negative';split?:'calibration'|'evaluation'}
export interface LabAnnotation {timestampMs:number;hand:Hand;joint:'wrist'|'elbow';status:'visible'|'occluded'|'uncertain';x?:number;y?:number;/** Coordinates normalized to decoded image dimensions. */reviewer:string}
export interface LabSample {frame:PoseFrame;videoTimeMs:number;inferenceMs:number;decodeMs?:number}
export interface LabRun {schemaVersion:1;id:string;clipId:string;model:LabModel;delegate:'CPU'|'GPU';condition:LabCondition;source:'live'|'video';samples:LabSample[];intervals:LabInterval[];annotations:LabAnnotation[];loadMs:number;warmupMs:number;totalMs:number;device?:LabDevice}
export interface LabFilterOptions {tauMs?:number;visibility?:number;maxGapMs?:number}
export interface LabDevice {userAgent:string;hardwareConcurrency:number;recordedOnThisDevice:boolean}
