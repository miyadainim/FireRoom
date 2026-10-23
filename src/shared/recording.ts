/** Metadata-only control; camera video remains on the phone. Sequence is scoped to a paired session.
 * Unix time is for bounded command freshness only, never pose/video alignment across device clocks.
 * Consumers deduplicate by sequence and must stop recording on their own bounded timeout. */
export const RECORDING_COMMAND_TTL_MS=15_000;
export interface RecordingCommand {
 schemaVersion:1;id:string;runId:string;sequence:number;
 action:'start'|'stop';kind:'calibration'|'practice';issuedAtUnixMs:number;
}
const keys=['schemaVersion','id','runId','sequence','action','kind','issuedAtUnixMs'];
export function isRecordingCommand(value:unknown):value is RecordingCommand {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const c=value as RecordingCommand;
 return Object.keys(c).length===keys.length&&Object.keys(c).every(k=>keys.includes(k))&&
 c.schemaVersion===1&&[c.id,c.runId].every(v=>typeof v==='string'&&v.length>0&&v.length<=128)&&
 Number.isSafeInteger(c.sequence)&&c.sequence>=0&&['start','stop'].includes(c.action)&&
 ['calibration','practice'].includes(c.kind)&&Number.isFinite(c.issuedAtUnixMs)&&c.issuedAtUnixMs>=0;
}
export function isFreshRecordingCommand(command:RecordingCommand,nowUnixMs:number):boolean {
 return command.issuedAtUnixMs<=nowUnixMs+5_000&&nowUnixMs-command.issuedAtUnixMs<=RECORDING_COMMAND_TTL_MS;
}
