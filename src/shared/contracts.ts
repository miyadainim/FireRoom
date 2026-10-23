/** v1: timestamps are producer monotonic milliseconds; never subtract clocks across devices.
 * Receiver uses local arrival time for freshness. Sequence strictly increases per session.
 * Pose coordinates: unmirrored MediaPipe normalized image x right/y down/z toward camera negative.
 * Anatomical left/right NEVER changes for a mirrored preview. z is not metric distance.
 */
export const SCHEMA_VERSION = 1 as const;
export type GeometryMode = 'image-2d'|'image-3d'|'world-3d';
export type Hand = 'left'|'right';
export type Stance = 'orthodox'|'southpaw';
export type TrackingStatus = 'tracked'|'low-confidence'|'lost';
export interface Landmark {x:number;y:number;z:number;visibility:number}
export interface Envelope {schemaVersion:1;sessionId:string;sequence:number;timestampMs:number}
export interface PoseFrame extends Envelope {landmarks:Landmark[];
 /** Optional v1 additive fields. Image dimensions are decoded video pixels.
  * worldLandmarks are MediaPipe-estimated meters, hip-midpoint origin; not measured motion capture.
  * Both arrays use identical anatomical indices and capture timestamp; never mix their axes. */
 /** Capture-run identifier changes on camera restart; optional for older senders. */
 cameraConfigurationId?:string;worldLandmarks?:Landmark[];imageSize?:{width:number;height:number};tracking:TrackingStatus;stance:Stance;mirrored:false}
export interface PunchEvent extends Envelope {type:'jab'|'cross';hand:Hand;confidence:number;extension:number;guardMaintained:boolean;phase:'recovered'}
export interface TechniqueReport extends Envelope {tracking:TrackingStatus;punches:PunchEvent[];sequenceCorrect:boolean;score:number;observations:string[];limitations:string[]}
export interface LessonState {schemaVersion:1;drill:'jab'|'jab-cross';phase:'demo'|'practice'|'complete';expectedIndex:number;repetitions:number;targetRepetitions:number;score:number}
export type GameAction = {schemaVersion:1} & ({type:'replay_combo'}|{type:'set_playback_speed';speed:0.25|0.5|1}|{type:'highlight_movement';movement:'guard'|'extension'|'recovery'}|{type:'load_drill';drill:'jab'|'jab-cross'}|{type:'get_performance_summary'});
export interface ConnectionState {schemaVersion:1;status:'disconnected'|'connecting'|'connected'|'stale';sessionId:string;lastSequence:number;lastArrivalMs:number|null;error:ErrorCode|null}
export type ErrorCode = 'CAMERA_DENIED'|'MODEL_FAILED'|'INVALID_MESSAGE'|'STALE_MESSAGE'|'NETWORK_LOST';
export function isPoseFrame(v:unknown):v is PoseFrame {
 if(!v||typeof v!=='object')return false;const p=v as PoseFrame;
 return (p.cameraConfigurationId===undefined||(typeof p.cameraConfigurationId==='string'&&p.cameraConfigurationId.length>0&&p.cameraConfigurationId.length<=128))&&p.schemaVersion===1&&typeof p.sessionId==='string'&&p.sessionId.length>0&&Number.isSafeInteger(p.sequence)&&p.sequence>=0&&Number.isFinite(p.timestampMs)&&p.timestampMs>=0&&p.mirrored===false&&['orthodox','southpaw'].includes(p.stance)&&['tracked','low-confidence','lost'].includes(p.tracking)&&Array.isArray(p.landmarks)&&(p.landmarks.length===33||p.landmarks.length===0&&p.tracking==='lost')&&(p.worldLandmarks===undefined||(Array.isArray(p.worldLandmarks)&&(p.worldLandmarks.length===33||p.worldLandmarks.length===0&&p.tracking==='lost')&&p.worldLandmarks.every(l=>l&&[l.x,l.y,l.z,l.visibility].every(Number.isFinite)&&l.visibility>=0&&l.visibility<=1)))&&(p.imageSize===undefined||(p.imageSize!==null&&Number.isSafeInteger(p.imageSize.width)&&p.imageSize.width>0&&Number.isSafeInteger(p.imageSize.height)&&p.imageSize.height>0))&&p.landmarks.every(l=>l&&[l.x,l.y,l.z,l.visibility].every(Number.isFinite)&&l.visibility>=0&&l.visibility<=1);
}
export function isGameAction(v:unknown):v is GameAction {if(!v||typeof v!=='object')return false;const a=v as GameAction;if(a.schemaVersion!==1)return false;switch(a.type){case 'replay_combo':case 'get_performance_summary':return true;case 'set_playback_speed':return [0.25,0.5,1].includes(a.speed);case 'highlight_movement':return ['guard','extension','recovery'].includes(a.movement);case 'load_drill':return ['jab','jab-cross'].includes(a.drill);default:return false;}}
