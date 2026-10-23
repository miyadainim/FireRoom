import {isPoseFrame,type PoseFrame,type GeometryMode} from '../shared/contracts';
import {PunchRecognizer} from './recognizer';
export type TrialLabel='jab'|'cross'|'jab-cross'|'cross-jab'|'none';
export interface PoseTrial {label:TrialLabel;frames:PoseFrame[];geometryMode?:GeometryMode}
export interface PoseRecording {schemaVersion:1;kind:'fireroom-labeled-poses';trials:PoseTrial[]}
/** Opt-in, bounded browser memory only. No raw video, model training, or automatic upload. */
export class PoseRecorder {
 private trials:PoseTrial[]=[];private active:PoseTrial|null=null;
 start(label:TrialLabel,geometryMode:GeometryMode='image-3d'){if(this.active)throw Error('Stop the current trial first');if(this.trials.length>=100)throw Error('Export and clear the 100 trials first');this.active={label,frames:[],geometryMode};}
 append(frame:PoseFrame){if(!this.active||!isPoseFrame(frame))return;if(this.active.frames.length>=600){this.stop();return;}const copy=structuredClone(frame);copy.sessionId=`trial-${this.trials.length+1}`;this.active.frames.push(copy);}
 stop(){if(this.active){if(this.active.frames.length)this.trials.push(this.active);this.active=null;}}
 clear(){this.active=null;this.trials=[];}
 status(){return {recording:!!this.active,frames:this.active?.frames.length??0,trials:this.trials.length};}
 snapshot():PoseRecording {return {schemaVersion:1,kind:'fireroom-labeled-poses',trials:structuredClone(this.trials)};}
}
export function evaluateRecording(recording:PoseRecording,mode:GeometryMode='image-3d'){
 let expectedPunches=0,detectedPunches=0,matchedPunches=0,exactTrials=0,evaluatedTrials=0,unavailableTrials=0;const results=recording.trials.map(trial=>{
  const expected=trial.label==='none'?[]:trial.label.split('-') as ('jab'|'cross')[];
  const available=mode!=='world-3d'||(trial.frames.some(f=>f.worldLandmarks?.length===33)&&trial.frames.every(f=>f.tracking==='lost'||f.worldLandmarks?.length===33));
  if(!available){unavailableTrials++;return {label:trial.label,expected,detected:[] as string[],exact:false,available:false,reason:'World landmarks absent in one or more frames; record a new trial'};}
  evaluatedTrials++;
  const recognizer=new PunchRecognizer(mode);const detected=trial.frames.flatMap(f=>recognizer.update(f)).map(e=>e.type);
  expectedPunches+=expected.length;detectedPunches+=detected.length;
  for(const type of ['jab','cross'])matchedPunches+=Math.min(expected.filter(e=>e===type).length,detected.filter(e=>e===type).length);
  const exact=expected.join(',')===detected.join(',');if(exact)exactTrials++;
  return {label:trial.label,expected,detected,exact,available:true,reason:undefined};
 });
 return {mode,trials:results,exactTrials,evaluatedTrials,unavailableTrials,totalTrials:results.length,expectedPunches,detectedPunches,matchedPunches,falsePunches:detectedPunches-matchedPunches,missedPunches:expectedPunches-matchedPunches};
}

export const GEOMETRY_MODES:GeometryMode[]=['image-2d','image-3d','world-3d'];
export function compareRecording(recording:PoseRecording){return GEOMETRY_MODES.map(mode=>evaluateRecording(recording,mode));}
